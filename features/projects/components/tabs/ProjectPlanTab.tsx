import React, { useState, useMemo, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Task, TaskStatus, TaskPriority, Employee, ProjectGroup, Project } from '@/types';
import {
    Layers, CheckCircle2, Circle, Clock, ChevronDown, ChevronRight,
    FileText, AlertCircle, Plus, Calendar, User, Flag, Zap, Building2, Scale, Info, ExternalLink, ListPlus, Paperclip, Upload, X
} from 'lucide-react';
import { ProjectGanttChart } from '../ProjectGanttChart';
import { ProjectTaskModal } from '../ProjectTaskModal';
import { PlanStatisticsHeader } from '../PlanStatisticsHeader';
import { PhaseProgressCard } from '../PhaseProgressCard';
import { MilestoneTimeline } from '../MilestoneTimeline';
import { TaskFilterBar, TaskFilter, TaskViewMode } from '../TaskFilterBar';
import { KanbanBoardView } from '../KanbanBoardView';
import { ResourceAllocationView } from '../ResourceAllocationView';
import { ProgressBadge } from '../ProgressSlider';
import { getSubTasksForStep, hasSubTasks, SubTaskDef } from '@/utils/stepSubtasksRegistry';
import { SubTaskDetailModal } from '../SubTaskDetailModal';
import { TaskService } from '@/services/TaskService';
import { supabase } from '@/lib/supabase';
import { findByStepCode, buildTT24Key } from '@/utils/docStepMapping';
import { LegalReferenceLink } from '@/components/common/LegalReferenceLink';
import { getProjectPhases, getGroupLabel } from '@/utils/projectPhases';
import { useTaskFilters } from '../../hooks/useTaskFilters';
import { useStepAggregates } from '../../hooks/useStepAggregates';
import { usePlanPersist } from '../../hooks/usePlanPersist';


interface ProjectPlanTabProps {
    tasks: Task[];
    projectID?: string;
    onSaveTask?: (task: Task) => void;
    employees?: Employee[];
    currentUserId?: string;
    groupCode?: ProjectGroup;
    isODA?: boolean;
    project?: Project | null;
}

// getProjectPhases and getGroupLabel imported from @/utils/projectPhases

export const ProjectPlanTab: React.FC<ProjectPlanTabProps> = ({
    tasks: initialTasks,
    projectID,
    onSaveTask,
    employees = [],
    currentUserId,
    groupCode = ProjectGroup.C,
    isODA = false,
    project,
}) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    // Dynamic phases based on project group
    const DECREE_175_PHASES = useMemo(() => getProjectPhases(groupCode, isODA), [groupCode, isODA]);

    // Employee name lookup map
    const employeeNameMap = useMemo(() => {
        const map: Record<string, string> = {};
        employees.forEach(e => { map[e.EmployeeID] = e.FullName; });
        return map;
    }, [employees]);

    // 1. Local Tasks State (Optimistic UI)
    const [tasks, setTasks] = useState<Task[]>(initialTasks);

    // Sync from props
    useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

    // UI State — persisted to localStorage per project
    const { currentView, currentFilter, setView: setCurrentView, setFilter: setCurrentFilter } = usePlanPersist(projectID);
    const [searchQuery, setSearchQuery] = useState('');

    // Smart auto-expand: expand active/overdue phases, collapse 100% done phases
    const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        const phases = getProjectPhases(groupCode, isODA);
        const today = new Date(); today.setHours(0, 0, 0, 0);

        phases.forEach(phase => {
            const phaseTasks = initialTasks.filter(t =>
                phase.items.some(item => item.code === t.TimelineStep)
            );
            if (phaseTasks.length === 0) {
                initial[phase.id] = false; // No tasks → collapse
                return;
            }
            const allDone = phaseTasks.every(t => t.Status === TaskStatus.Done);
            if (allDone) {
                initial[phase.id] = false; // 100% done → auto-collapse
                return;
            }
            const hasActive = phaseTasks.some(t =>
                t.Status === TaskStatus.InProgress || t.Status === TaskStatus.Review
            );
            const hasOverdue = phaseTasks.some(t => {
                if (t.Status === TaskStatus.Done || !t.DueDate) return false;
                const d = new Date(t.DueDate); d.setHours(0, 0, 0, 0);
                return d < today;
            });
            initial[phase.id] = hasActive || hasOverdue;
        });
        // If nothing expanded, show first non-done phase
        if (!Object.values(initial).some(v => v) && phases.length > 0) {
            const first = phases.find(p => {
                const pt = initialTasks.filter(t => p.items.some(i => i.code === t.TimelineStep));
                return pt.length === 0 || !pt.every(t => t.Status === TaskStatus.Done);
            });
            if (first) initial[first.id] = true;
            else initial[phases[0].id] = true;
        }
        return initial;
    });
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [selectedStep, setSelectedStep] = useState<{ name: string; code: string } | null>(null);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    // Sub-task registry state
    const [expandedSubTasks, setExpandedSubTasks] = useState<Record<string, boolean>>({});
    const [selectedSubTask, setSelectedSubTask] = useState<{ def: SubTaskDef; stepTitle: string; stepCode: string } | null>(null);
    const [bulkCreatingStep, setBulkCreatingStep] = useState<string | null>(null);
    const [bulkCreatingAll, setBulkCreatingAll] = useState(false);
    const [attachmentCounts, setAttachmentCounts] = useState<Record<string, number>>({});
    const [uploadingTaskId, setUploadingTaskId] = useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [pendingUploadTaskId, setPendingUploadTaskId] = useState<string | null>(null);

    // Toast notifications
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
    const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Load attachment counts from documents table
    useEffect(() => {
        if (!projectID) return;
        const loadCounts = async () => {
            const taskIds = tasks.map(t => t.TaskID);
            if (taskIds.length === 0) return;
            const { data } = await supabase
                .from('documents')
                .select('task_id')
                .eq('source' as any, 'task')
                .in('task_id' as any, taskIds) as any;
            if (data) {
                const counts: Record<string, number> = {};
                (data as any[]).forEach((row: { task_id: string }) => {
                    counts[row.task_id] = (counts[row.task_id] || 0) + 1;
                });
                setAttachmentCounts(counts);
            }
        };
        loadCounts();
    }, [tasks, projectID]);

    // Handle file upload for task → saves to documents table with cross-reference
    const handleFileUpload = async (taskId: string, file: File) => {
        setUploadingTaskId(taskId);
        try {
            const ext = file.name.split('.').pop();
            const path = `${projectID}/${taskId}/${Date.now()}.${ext}`;
            const { error: uploadError } = await supabase.storage
                .from('task-attachments')
                .upload(path, file);
            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from('task-attachments')
                .getPublicUrl(path);

            // Find the task to get step_code and title for cross-referencing
            const task = tasks.find(t => t.TaskID === taskId);
            const stepCode = (task as any)?.StepCode || (task as any)?.step_code || task?.TimelineStep || '';
            const crossRef = stepCode ? findByStepCode(stepCode) : undefined;

            // Build enriched doc name for keyword matching in Hồ sơ tab
            const docName = task?.Title
                ? `${task.Title} - ${file.name}`
                : file.name;

            // Build tt24_field for TT24 cross-reference
            const tt24Field = crossRef?.tt24Stt
                ? buildTT24Key(crossRef.tt24Stt, crossRef.tt24Label)
                : undefined;

            // Insert into unified documents table with cross-reference fields
            await (supabase.from('documents') as any).insert({
                project_id: projectID,
                task_id: taskId,
                doc_name: docName,
                storage_path: urlData.publicUrl,
                size: `${(file.size / 1024).toFixed(0)} KB`,
                category: 0,
                source: 'task',
                is_digitized: true,
                ...(tt24Field && { tt24_field: tt24Field }),
            });

            setAttachmentCounts(prev => ({ ...prev, [taskId]: (prev[taskId] || 0) + 1 }));
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setUploadingTaskId(null);
        }
    };

    // 2. Filter Tasks + Counts (extracted to hook)
    const { filteredTasks, taskCounts } = useTaskFilters(tasks, currentFilter, searchQuery, currentUserId);

    // 4. Compute Parent Item Status & Dates (extracted to hook)
    const stepAggregates = useStepAggregates(filteredTasks, DECREE_175_PHASES);

    // 5. Prepare Gantt Data (Parents Only)
    const ganttTasks = useMemo(() => {
        const allItems = DECREE_175_PHASES.flatMap(p => p.items);
        return allItems
            .map(item => {
                const agg = stepAggregates.get(item.code);
                if (!agg || !agg.startDate || !agg.dueDate) return null;

                return {
                    TaskID: item.code,
                    Title: `${item.id}. ${item.title}`,
                    StartDate: agg.startDate,
                    DueDate: agg.dueDate,
                    Status: agg.status,
                    Priority: 'Medium',
                    Description: 'Tổng hợp từ các công việc con',
                    AssigneeID: '',
                    TimelineStep: item.code,
                    ProjectID: projectID || 'SYNTHETIC',
                    ProgressPercent: agg.progress
                } as Task;
            })
            .filter((t): t is Task => t !== null);
    }, [stepAggregates, projectID]);

    // 6. Compute Milestone Dates for Timeline
    const milestoneData = useMemo(() => {
        const getCompletionDate = (code: string): string | undefined => {
            const allStepTasks = tasks.filter(t => t.TimelineStep === code || t.StepCode === code);
            if (allStepTasks.length === 0) return undefined;
            // ALL tasks in this step must be Done for the milestone to be considered complete
            const allDone = allStepTasks.every(t => t.Status === TaskStatus.Done);
            if (!allDone) return undefined;
            const dates = allStepTasks.map(t => new Date(t.DueDate).getTime()).filter(d => !isNaN(d));
            if (dates.length === 0) return undefined;
            return new Date(Math.max(...dates)).toISOString().split('T')[0];
        };

        return {
            policyApprovalDate: getCompletionDate('PREP_POLICY'),
            projectApprovalDate: getCompletionDate('PREP_DECISION'),
            groundbreakingDate: getCompletionDate('IMPL_CONSTRUCTION'),
            completionDate: getCompletionDate('IMPL_ACCEPTANCE'),
            handoverDate: getCompletionDate('CLOSE_HANDOVER')
        };
    }, [tasks]);

    // Handlers
    const togglePhase = (id: string) => setExpandedPhases(prev => ({ ...prev, [id]: !prev[id] }));

    const handleAddTask = (stepName?: string, stepCode?: string) => {
        if (stepName && stepCode) {
            setSelectedStep({ name: stepName, code: stepCode });
        } else {
            setSelectedStep(null);
        }
        setEditingTask(null);
        setIsTaskModalOpen(true);
    };

    const handleQuickStatusChange = (e: React.MouseEvent, task: Task) => {
        e.stopPropagation();
        const statusCycle: Record<TaskStatus, TaskStatus> = {
            [TaskStatus.Todo]: TaskStatus.InProgress,
            [TaskStatus.InProgress]: TaskStatus.Review,
            [TaskStatus.Review]: TaskStatus.Done,
            [TaskStatus.Done]: TaskStatus.Todo
        };
        const newStatus = statusCycle[task.Status] || TaskStatus.InProgress;
        // Auto-sync progress with status
        let newProgress = task.ProgressPercent || 0;
        if (newStatus === TaskStatus.Done) newProgress = 100;
        else if (newStatus === TaskStatus.Review && newProgress < 100) newProgress = 100;
        else if (newStatus === TaskStatus.InProgress && newProgress === 0) newProgress = 25;
        else if (newStatus === TaskStatus.Todo) newProgress = 0;

        // ── AUTO-FILL actual dates ──
        const now = new Date().toISOString();
        let actualStart = task.ActualStartDate || '';
        let actualEnd = task.ActualEndDate || '';

        if (newStatus === TaskStatus.InProgress && !actualStart) {
            actualStart = now; // Bắt đầu thực hiện → ghi ngày bắt đầu thực tế
        }
        if (newStatus === TaskStatus.Done) {
            if (!actualStart) actualStart = now;
            if (!actualEnd) actualEnd = now; // Hoàn thành → ghi ngày kết thúc thực tế
        }
        if (newStatus === TaskStatus.Todo) {
            actualStart = ''; // Reset khi quay về chưa bắt đầu
            actualEnd = '';
        }

        handleSaveTask({
            ...task,
            Status: newStatus,
            ProgressPercent: newProgress,
            ActualStartDate: actualStart,
            ActualEndDate: actualEnd,
        } as any);
    };

    const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
        const task = tasks.find(t => t.TaskID === taskId);
        if (task) {
            const now = new Date().toISOString();
            let actualStart = task.ActualStartDate || '';
            let actualEnd = task.ActualEndDate || '';
            let newProgress = task.ProgressPercent || 0;

            if (newStatus === TaskStatus.InProgress && !actualStart) actualStart = now;
            if (newStatus === TaskStatus.InProgress && newProgress === 0) newProgress = 25;
            if (newStatus === TaskStatus.Done) {
                if (!actualStart) actualStart = now;
                if (!actualEnd) actualEnd = now;
                newProgress = 100;
            }
            if (newStatus === TaskStatus.Todo) {
                actualStart = '';
                actualEnd = '';
                newProgress = 0;
            }

            handleSaveTask({
                ...task,
                Status: newStatus,
                ProgressPercent: newProgress,
                ActualStartDate: actualStart,
                ActualEndDate: actualEnd,
            } as any);
        }
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setSelectedStep(null);
        setIsTaskModalOpen(true);
    };

    const handleSaveTask = async (taskData: Partial<Task>) => {
        // ── Auto-derive status from progress ──
        const progress = taskData.ProgressPercent ?? (taskData as any).Progress ?? 0;
        if (taskData.ProgressPercent !== undefined || (taskData as any).Progress !== undefined) {
            // Only auto-derive if status wasn't explicitly changed in this call
            const currentTask = tasks.find(t => t.TaskID === taskData.TaskID);
            const statusExplicitlyChanged = taskData.Status !== undefined && taskData.Status !== currentTask?.Status;
            if (!statusExplicitlyChanged) {
                if (progress === 100) {
                    taskData.Status = TaskStatus.Review; // 100% → Đang kiểm tra (chờ GĐ duyệt)
                } else if (progress >= 1) {
                    taskData.Status = TaskStatus.InProgress; // 1-99% → Đang thực hiện
                } else {
                    taskData.Status = TaskStatus.Todo; // 0% → Chưa bắt đầu
                }
            }
        }
        // ── Auto-sync progress when status is set explicitly ──
        if (taskData.Status === TaskStatus.Done && (progress < 100)) {
            taskData.ProgressPercent = 100;
            (taskData as any).Progress = 100;
        }
        if (taskData.Status === TaskStatus.Todo && progress > 0) {
            taskData.ProgressPercent = 0;
            (taskData as any).Progress = 0;
        }

        let updatedTask: Task;

        if (taskData.TaskID && !taskData.TaskID.startsWith('NEW_')) {
            updatedTask = { ...editingTask, ...taskData } as Task;
            setTasks(prev => prev.map(t => t.TaskID === updatedTask.TaskID ? updatedTask : t));
        } else {
            updatedTask = {
                ...taskData as Task,
                TaskID: taskData.TaskID || `T-${Math.random().toString(36).substring(2, 10)}`,
                ProjectID: projectID || 'PROJ_TEMP',
                CreatedDate: new Date().toISOString()
            } as Task;
            setTasks(prev => [...prev, updatedTask]);
        }

        // Persist to DB
        try {
            const savedTask = await TaskService.saveTask(updatedTask);

            // ── Auto-propagate ActualEndDate → next task's ActualStartDate ──
            if (savedTask.ActualEndDate) {
                const successorTasks: Task[] = [];

                // 1. Find tasks linked by PredecessorTaskID
                const predecessorSuccessors = tasks.filter(t =>
                    t.PredecessorTaskID === savedTask.TaskID && !t.ActualStartDate
                );
                successorTasks.push(...predecessorSuccessors);

                // 2. Find the next task in same TimelineStep (by StartDate order)
                if (savedTask.TimelineStep) {
                    const sameStepTasks = tasks
                        .filter(t => t.TimelineStep === savedTask.TimelineStep && t.TaskID !== savedTask.TaskID)
                        .sort((a, b) => {
                            const dateA = a.StartDate ? new Date(a.StartDate).getTime() : 0;
                            const dateB = b.StartDate ? new Date(b.StartDate).getTime() : 0;
                            return dateA - dateB;
                        });
                    const currentIdx = sameStepTasks.findIndex(t => {
                        const tStart = t.StartDate ? new Date(t.StartDate).getTime() : 0;
                        const savedStart = savedTask.StartDate ? new Date(savedTask.StartDate).getTime() : 0;
                        return tStart > savedStart;
                    });
                    if (currentIdx >= 0 && !sameStepTasks[currentIdx].ActualStartDate) {
                        const nextTask = sameStepTasks[currentIdx];
                        if (!successorTasks.some(t => t.TaskID === nextTask.TaskID)) {
                            successorTasks.push(nextTask);
                        }
                    }
                }

                // Update successor tasks
                for (const successor of successorTasks) {
                    const updated = { ...successor, ActualStartDate: savedTask.ActualEndDate };
                    try {
                        await TaskService.saveTask(updated);
                        setTasks(prev => prev.map(t => t.TaskID === updated.TaskID ? updated : t));
                    } catch (err) {
                        console.error('Failed to propagate ActualStartDate:', err);
                    }
                }
            }

            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            // Toast success
            const isNew = !taskData.TaskID || taskData.TaskID.startsWith('NEW_');
            showToast(isNew ? `✅ Tạo công việc "${updatedTask.Title}" thành công` : `💾 Đã lưu thay đổi"${updatedTask.Title}"`, 'success');
        } catch (err) {
            console.error('Failed to save task:', err);
            showToast('❌ Lưu thất bại, vui lòng thử lại', 'error');
        }

        if (onSaveTask) {
            onSaveTask(updatedTask);
        }
        setIsTaskModalOpen(false);
    };

    // ── Bulk create tasks from workflow sub-steps ──
    const handleBulkCreateFromSubTasks = async (stepCode: string, stepTitle: string) => {
        if (!projectID) return;
        setBulkCreatingStep(stepCode);
        try {
            const subTaskDefs = getSubTasksForStep(stepCode, groupCode);
            if (subTaskDefs.length === 0) return;

            // Calculate base date (same logic as date display)
            const getBaseDate = (): Date => {
                if (project?.StartDate) return new Date(project.StartDate);
                if (project?.ApprovalDate) return new Date(project.ApprovalDate);
                return new Date();
            };

            // Already-linked step codes to avoid duplicates
            const existingTitles = new Set(tasks.filter(t => t.TimelineStep === stepCode).map(t => t.Title));

            // Calculate cumulative days before this step
            const allPhaseItems = DECREE_175_PHASES.flatMap(p => p.items);
            const currentIdx = allPhaseItems.findIndex(i => i.code === stepCode);
            let cumulativeDaysBefore = 0;
            for (let i = 0; i < currentIdx; i++) {
                const prevSubs = getSubTasksForStep(allPhaseItems[i].code, groupCode);
                cumulativeDaysBefore += prevSubs.reduce((sum, s) => sum + (s.estimatedDays || 10), 0);
            }

            const baseDate = getBaseDate();
            let runningDays = cumulativeDaysBefore;
            const newTasks: Task[] = [];

            for (let idx = 0; idx < subTaskDefs.length; idx++) {
                const st = subTaskDefs[idx];
                // Skip if task already exists with same title
                if (existingTitles.has(st.title)) continue;

                const days = st.estimatedDays || 10;
                const startDate = new Date(baseDate);
                startDate.setDate(startDate.getDate() + runningDays);
                const dueDate = new Date(startDate);
                dueDate.setDate(dueDate.getDate() + days);
                runningDays += days;

                const shortId = Math.random().toString(36).substring(2, 10);
                const task: Task = {
                    TaskID: `T-${shortId}${idx}`,
                    // idx added for uniqueness within batch
                    ProjectID: projectID,
                    Title: st.title,
                    Description: st.description || `Bước trong quy trình: ${stepTitle}. Phụ trách: ${st.responsible}.${st.legalBasis ? ` Căn cứ: ${st.legalBasis}` : ''}`,
                    Status: TaskStatus.Todo,
                    Priority: TaskPriority.Medium,
                    StartDate: startDate.toISOString(),
                    DueDate: dueDate.toISOString(),
                    AssigneeID: st.responsible,
                    TimelineStep: stepCode,
                    StepCode: stepCode,
                    LegalBasis: st.legalBasis || '',
                    DurationDays: days,
                    Phase: stepTitle,
                } as Task;
                newTasks.push(task);
            }

            if (newTasks.length === 0) {
                setBulkCreatingStep(null);
                return;
            }

            // Save to DB
            await TaskService.saveTasks(newTasks);

            // Update local state + invalidate react-query cache
            setTasks(prev => [...prev, ...newTasks]);
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        } catch (error) {
            console.error('Failed to bulk create tasks:', error);
        } finally {
            setBulkCreatingStep(null);
        }
    };

    // ── Bulk create ALL tasks across ALL steps ──
    const handleBulkCreateAll = async () => {
        if (!projectID) return;
        setBulkCreatingAll(true);
        try {
            const allPhaseItems = DECREE_175_PHASES.flatMap(p => p.items);
            for (const item of allPhaseItems) {
                const subTasks = getSubTasksForStep(item.code, groupCode);
                if (subTasks.length > 0) {
                    await handleBulkCreateFromSubTasks(item.code, item.title);
                }
            }
        } catch (error) {
            console.error('Failed to bulk create all tasks:', error);
        } finally {
            setBulkCreatingAll(false);
        }
    };

    // ── Delete ALL tasks for current project ──
    const [isDeletingAll, setIsDeletingAll] = useState(false);
    const [deleteConfirmStep, setDeleteConfirmStep] = useState<0 | 1>(0); // 0=idle, 1=confirming

    // Auto-reset confirm step after 3 seconds
    useEffect(() => {
        if (deleteConfirmStep === 1) {
            const timer = setTimeout(() => setDeleteConfirmStep(0), 3000);
            return () => clearTimeout(timer);
        }
    }, [deleteConfirmStep]);

    const handleDeleteAllTasks = async () => {
        if (!projectID) return;

        // Step 1: First click → show confirm state
        if (deleteConfirmStep === 0) {
            setDeleteConfirmStep(1);
            return;
        }

        // Step 2: Second click → actually delete
        setDeleteConfirmStep(0);
        setIsDeletingAll(true);
        try {
            // Gọi RPC function trực tiếp (SECURITY DEFINER, bypass RLS)
            const { data, error } = await (supabase.rpc as any)('delete_project_tasks', {
                p_project_id: projectID,
            });

            if (error) {
                console.error('RPC delete_project_tasks error:', error);
                throw new Error(error.message);
            }

            console.log(`✅ Đã xoá ${data} công việc cho dự án ${projectID}`);
            setTasks([]); // Xóa local state
            queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Cập nhật React Query cache
        } catch (err: any) {
            console.error('Failed to delete all tasks:', err);
            alert(`Lỗi khi xóa: ${err?.message || 'Không xác định'}. Vui lòng thử lại!`);
        } finally {
            setIsDeletingAll(false);
        }
    };

    // ── Bulk create tasks for a specific PHASE ──
    const [bulkCreatingPhase, setBulkCreatingPhase] = useState<string | null>(null);
    const handleBulkCreatePhase = async (phaseId: string) => {
        if (!projectID) return;
        const phase = DECREE_175_PHASES.find(p => p.id === phaseId);
        if (!phase) return;
        setBulkCreatingPhase(phaseId);
        try {
            for (const item of phase.items) {
                const subTasks = getSubTasksForStep(item.code, groupCode);
                if (subTasks.length > 0) {
                    await handleBulkCreateFromSubTasks(item.code, item.title);
                }
            }
        } catch (error) {
            console.error('Failed to bulk create phase tasks:', error);
        } finally {
            setBulkCreatingPhase(null);
        }
    };

    // Priority color helper
    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case 'High': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700';
            case 'Medium': return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700';
            case 'Low': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700';
            default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600';
        }
    };

    // Check if task is overdue
    const isOverdue = (task: Task) => {
        if (task.Status === TaskStatus.Done) return false;
        if (!task.DueDate) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(task.DueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
    };

    // Render WBS View
    const renderWBSView = () => (
        <div className="space-y-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 border border-amber-100 dark:border-amber-800 p-4 rounded-xl flex justify-between items-center">
                <div>
                    <h3 className="text-blue-900 dark:text-blue-200 font-bold flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Kế hoạch thực hiện dự án
                    </h3>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        <LegalReferenceLink text="Căn cứ theo Điều 4, Nghị định 175/NĐ-CP về trình tự đầu tư xây dựng." />
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => queryClient.invalidateQueries({ queryKey: ['tasks'] })}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all shadow-sm text-gray-600 bg-white hover:bg-gray-50 border-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:border-slate-700 dark:hover:bg-slate-700"
                        title="Tải lại dữ liệu từ máy chủ (Xóa Cache)"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Tải lại
                    </button>
                    {/* Tạo tất cả công việc Button */}
                    <button
                        onClick={handleBulkCreateAll}
                        disabled={bulkCreatingAll}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all shadow-sm ${bulkCreatingAll
                            ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700 cursor-wait'
                            : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border-emerald-200 dark:border-emerald-700 hover:shadow'
                            }`}
                    >
                        {bulkCreatingAll ? (
                            <>
                                <div className="w-3 h-3 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
                                Đang tạo...
                            </>
                        ) : (
                            <>
                                <ListPlus className="w-3.5 h-3.5" />
                                Tạo KH tổng thể
                            </>
                        )}
                    </button>
                    {/* Xóa tất cả công việc Button */}
                    {tasks.length > 0 && (
                        <button
                            onClick={handleDeleteAllTasks}
                            disabled={isDeletingAll}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all shadow-sm ${isDeletingAll
                                    ? 'text-gray-400 bg-gray-50 border-gray-200 cursor-wait'
                                    : deleteConfirmStep === 1
                                        ? 'text-white bg-red-600 border-red-700 animate-pulse hover:bg-red-700'
                                        : 'text-red-600 bg-red-50 hover:bg-red-100 border-red-200 hover:border-red-300'
                                }`}
                            title={deleteConfirmStep === 1 ? 'Bấm lần nữa để xác nhận xóa!' : 'Xóa toàn bộ công việc của dự án này'}
                        >
                            {isDeletingAll ? (
                                <>
                                    <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                    Đang xóa...
                                </>
                            ) : deleteConfirmStep === 1 ? (
                                <>
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    Xác nhận xoá?
                                </>
                            ) : (
                                <>
                                    <X className="w-3.5 h-3.5" />
                                    Xóa tất cả việc
                                </>
                            )}
                        </button>
                    )}
                    <button
                        onClick={() => navigate(`/tasks`, { state: { filterProject: projectID } })}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg border border-blue-200 dark:border-blue-700 transition-colors shadow-sm"
                    >
                        <ExternalLink className="w-3 h-3" />
                        Xem tất cả công việc
                    </button>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${groupCode === ProjectGroup.A || groupCode === ProjectGroup.QN
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700'
                        : groupCode === ProjectGroup.B
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700'
                        }`}>
                        {getGroupLabel(groupCode)}
                    </span>
                </div>
            </div>

            {/* Phase Cards with Expandable Items */}
            <div className="space-y-3">
                {DECREE_175_PHASES.map((phase) => (
                    <div key={phase.id}>
                        {/* Phase Header Card */}
                        <PhaseProgressCard
                            phase={phase}
                            tasks={filteredTasks}
                            isExpanded={expandedPhases[phase.id]}
                            onToggle={() => togglePhase(phase.id)}
                            onBulkCreatePhase={() => handleBulkCreatePhase(phase.id)}
                            isBulkCreatingPhase={bulkCreatingPhase === phase.id}
                            phaseTotalSubTasks={phase.items.reduce((sum, item) => sum + getSubTasksForStep(item.code, groupCode).length, 0)}
                        />

                        {/* Expanded Items */}
                        {expandedPhases[phase.id] && (
                            <div className="mt-2 ml-4 border-l-2 border-gray-200 dark:border-slate-700 pl-4 space-y-2">
                                {phase.items.map((item) => {
                                    const linkedTasks = filteredTasks
                                        .filter(t => t.TimelineStep === item.code)
                                        .sort((a, b) => {
                                            const dateA = a.StartDate ? new Date(a.StartDate).getTime() : (a.DueDate ? new Date(a.DueDate).getTime() : 0);
                                            const dateB = b.StartDate ? new Date(b.StartDate).getTime() : (b.DueDate ? new Date(b.DueDate).getTime() : 0);
                                            return dateA - dateB;
                                        });
                                    const agg = stepAggregates.get(item.code);
                                    const parentStatus = agg?.status || TaskStatus.Todo;
                                    const isParentDone = parentStatus === TaskStatus.Done;
                                    const isParentActive = parentStatus === TaskStatus.InProgress || parentStatus === TaskStatus.Review;
                                    const completedCount = linkedTasks.filter(t => t.Status === TaskStatus.Done).length;

                                    const stepBorderColor = isParentDone
                                        ? 'border-l-emerald-500'
                                        : isParentActive
                                            ? 'border-l-blue-500'
                                            : 'border-l-gray-200';

                                    return (
                                        <div key={item.id} className={`bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-3 hover:border-gray-200 dark:hover:border-slate-600 transition-colors group border-l-4 ${stepBorderColor}`}>
                                            {/* Step Header Row */}
                                            <div className="flex items-center gap-3">
                                                {/* Status Icon */}
                                                <div className="shrink-0">
                                                    {isParentDone ? (
                                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                    ) : parentStatus === TaskStatus.Review ? (
                                                        <AlertCircle className="w-5 h-5 text-indigo-500" />
                                                    ) : parentStatus === TaskStatus.InProgress ? (
                                                        <Clock className="w-5 h-5 text-orange-500 animate-pulse" />
                                                    ) : (
                                                        <Circle className="w-5 h-5 text-gray-300" />
                                                    )}
                                                </div>

                                                {/* Title + Meta */}
                                                <div className="flex-1 min-w-0">
                                                    <h5 className={`text-sm font-medium ${isParentDone ? 'text-gray-900 dark:text-slate-100' : 'text-gray-700 dark:text-slate-300'}`}>
                                                        {item.id}. {item.title}
                                                    </h5>
                                                </div>

                                                {/* Progress Badge */}
                                                {agg && agg.progress > 0 && (
                                                    <ProgressBadge value={agg.progress} size="sm" />
                                                )}

                                                {/* Date Range Badge */}
                                                {(agg?.startDate || agg?.dueDate) && (
                                                    <span className="hidden sm:flex items-center gap-1 text-[10px] text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-700 px-2 py-0.5 rounded border border-gray-200 dark:border-slate-600 shrink-0">
                                                        <Calendar className="w-3 h-3" />
                                                        {agg.startDate && new Date(agg.startDate).toLocaleDateString('vi-VN')}
                                                        {agg.startDate && agg.dueDate && ' → '}
                                                        {agg.dueDate && new Date(agg.dueDate).toLocaleDateString('vi-VN')}
                                                    </span>
                                                )}

                                                {/* Task Count Badge */}
                                                <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded font-medium ${linkedTasks.length === 0
                                                    ? 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
                                                    : completedCount === linkedTasks.length
                                                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                                                        : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
                                                    }`}>
                                                    {completedCount}/{linkedTasks.length} việc
                                                </span>

                                                {/* Add Task Button */}
                                                {/* Sub-task expand toggle */}
                                                {hasSubTasks(item.code) && (
                                                    <button
                                                        onClick={() => setExpandedSubTasks(prev => ({ ...prev, [item.code]: !prev[item.code] }))}
                                                        className={`px-2 py-1 text-xs font-medium rounded border flex items-center gap-1 shrink-0 transition-colors ${expandedSubTasks[item.code]
                                                            ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700'
                                                            : 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 border-purple-200 dark:border-purple-700'
                                                            }`}
                                                        title="Xem quy trình chi tiết (NĐ 175, Luật 135, NĐ 140, NĐ 144)"
                                                    >
                                                        <Zap className="w-3 h-3" />
                                                        {expandedSubTasks[item.code] ? 'Ẩn QT' : 'Quy trình'}
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleAddTask(item.title, item.code)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 flex items-center gap-1 shrink-0"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                    Thêm
                                                </button>
                                            </div>

                                            {/* Task Table (Compact) */}
                                            {linkedTasks.length > 0 && (
                                                <div className="mt-3 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                                    <table className="w-full text-xs">
                                                        <thead>
                                                            <tr className="bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-slate-400">
                                                                <th className="px-2 py-1.5 text-left font-medium w-8"></th>
                                                                <th className="px-2 py-1.5 text-left font-medium">Công việc</th>
                                                                <th className="px-2 py-1.5 text-center font-medium w-16">Tiến độ</th>
                                                                <th className="px-2 py-1.5 text-left font-medium w-32 hidden sm:table-cell">Phụ trách</th>
                                                                <th className="px-2 py-1.5 text-left font-medium w-24 hidden sm:table-cell">Hạn</th>
                                                                <th className="px-2 py-1.5 text-center font-medium w-16">Ưu tiên</th>
                                                                <th className="px-2 py-1.5 text-center font-medium w-16">Tài liệu</th>
                                                                <th className="px-2 py-1.5 text-center font-medium w-8"></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                                                            {linkedTasks.map(t => (
                                                                <tr
                                                                    key={t.TaskID}
                                                                    onClick={() => handleEditTask(t)}
                                                                    className={`cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-slate-700 ${isOverdue(t) ? 'bg-red-50/50 dark:bg-red-900/20' : ''}`}
                                                                >
                                                                    {/* Status Dot */}
                                                                    <td className="px-2 py-2">
                                                                        <button
                                                                            onClick={(e) => handleQuickStatusChange(e, t)}
                                                                            className={`w-4 h-4 rounded-full transition-transform hover:scale-125 focus:outline-none ring-2 ring-offset-1 dark:ring-offset-slate-800 ${t.Status === 'Done' ? 'bg-emerald-500 ring-emerald-200 dark:ring-emerald-700' :
                                                                                t.Status === 'Review' ? 'bg-indigo-500 ring-indigo-200 dark:ring-indigo-700' :
                                                                                    t.Status === 'InProgress' ? 'bg-amber-500 ring-amber-200 dark:ring-amber-700' :
                                                                                        'bg-gray-200 dark:bg-slate-600 ring-gray-100 dark:ring-slate-500 hover:bg-gray-300 dark:hover:bg-slate-500'
                                                                                }`}
                                                                            title="Click để chuyển trạng thái"
                                                                        />
                                                                    </td>

                                                                    {/* Title */}
                                                                    <td className={`px-2 py-2 font-medium ${t.Status === 'Done' ? 'text-gray-400 dark:text-slate-500' :
                                                                        isOverdue(t) ? 'text-red-700 dark:text-red-400' :
                                                                            t.Status === 'Review' ? 'text-indigo-700 dark:text-indigo-400' :
                                                                                t.Status === 'InProgress' ? 'text-orange-700 dark:text-orange-400' :
                                                                                    'text-gray-700 dark:text-slate-300'
                                                                        }`}>
                                                                        {t.Title}
                                                                        {t.IsCritical && (
                                                                            <span className="ml-1 px-1 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 text-[8px] rounded font-bold">
                                                                                CP
                                                                            </span>
                                                                        )}
                                                                    </td>

                                                                    {/* Progress */}
                                                                    <td className="px-2 py-2 text-center">
                                                                        <ProgressBadge
                                                                            value={t.ProgressPercent || (t.Status === TaskStatus.Done ? 100 : 0)}
                                                                            size="sm"
                                                                        />
                                                                    </td>

                                                                    {/* Assignee */}
                                                                    <td className="px-2 py-2 text-gray-500 dark:text-slate-400 hidden sm:table-cell">
                                                                        {t.AssigneeID && (
                                                                            <span className="flex items-center gap-1 truncate max-w-[120px]" title={employeeNameMap[t.AssigneeID] || t.AssigneeID}>
                                                                                <User className="w-3 h-3 shrink-0" />
                                                                                {employeeNameMap[t.AssigneeID] || t.AssigneeID}
                                                                            </span>
                                                                        )}
                                                                    </td>

                                                                    {/* Due Date + Smart Relative Time */}
                                                                    <td className={`px-2 py-2 hidden sm:table-cell ${isOverdue(t) ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-400 dark:text-slate-500'}`}>
                                                                        {t.Status === TaskStatus.Done && t.ActualEndDate ? (
                                                                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium" title={`Hoàn thành: ${new Date(t.ActualEndDate).toLocaleDateString('vi-VN')}`}>
                                                                                <CheckCircle2 className="w-3 h-3" />
                                                                                {new Date(t.ActualEndDate).toLocaleDateString('vi-VN')}
                                                                            </span>
                                                                        ) : t.DueDate ? (
                                                                            <span className="flex flex-col" title={new Date(t.DueDate).toLocaleDateString('vi-VN')}>
                                                                                <span>{new Date(t.DueDate).toLocaleDateString('vi-VN')}</span>
                                                                                {(() => {
                                                                                    const now = new Date(); now.setHours(0,0,0,0);
                                                                                    const due = new Date(t.DueDate); due.setHours(0,0,0,0);
                                                                                    const diff = Math.round((due.getTime() - now.getTime()) / 86400000);
                                                                                    if (diff < 0) return <span className="text-[9px] text-red-500 font-bold">Quá hạn {Math.abs(diff)} ngày</span>;
                                                                                    if (diff === 0) return <span className="text-[9px] text-amber-500 font-bold">Hôm nay!</span>;
                                                                                    if (diff <= 3) return <span className="text-[9px] text-amber-500">Còn {diff} ngày</span>;
                                                                                    if (diff <= 7) return <span className="text-[9px] text-blue-400">Còn {diff} ngày</span>;
                                                                                    return null;
                                                                                })()}
                                                                            </span>
                                                                        ) : null}
                                                                    </td>

                                                                    {/* Priority */}
                                                                    <td className="px-2 py-2 text-center">
                                                                        {t.Priority && (
                                                                            <span className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded border ${getPriorityColor(t.Priority)}`}>
                                                                                <Flag className="w-2.5 h-2.5" />
                                                                                {t.Priority}
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    {/* Upload Attachment */}
                                                                    <td className="px-2 py-2 text-center">
                                                                        <div className="flex items-center justify-center gap-1">
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setPendingUploadTaskId(t.TaskID);
                                                                                    fileInputRef.current?.click();
                                                                                }}
                                                                                disabled={uploadingTaskId === t.TaskID}
                                                                                className={`p-1 rounded transition-colors ${uploadingTaskId === t.TaskID
                                                                                    ? 'bg-amber-50 text-amber-500'
                                                                                    : 'hover:bg-blue-50 text-gray-400 hover:text-blue-600'
                                                                                    }`}
                                                                                title="Tải tài liệu hoàn thành"
                                                                            >
                                                                                {uploadingTaskId === t.TaskID
                                                                                    ? <div className="w-3.5 h-3.5 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
                                                                                    : <Upload className="w-3.5 h-3.5" />
                                                                                }
                                                                            </button>
                                                                            {(attachmentCounts[t.TaskID] || 0) > 0 && (
                                                                                <span className="flex items-center gap-0.5 text-[9px] px-1 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-700 font-bold">
                                                                                    <Paperclip className="w-2.5 h-2.5" />
                                                                                    {attachmentCounts[t.TaskID]}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    {/* Navigate to Task Detail */}
                                                                    <td className="px-2 py-2 text-center">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                navigate(`/tasks/${t.TaskID}`);
                                                                            }}
                                                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-blue-50 rounded text-blue-500"
                                                                            title="Xem chi tiết công việc"
                                                                        >
                                                                            <ExternalLink className="w-3 h-3" />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}

                                            {/* Empty state */}
                                            {linkedTasks.length === 0 && !expandedSubTasks[item.code] && (
                                                <p className="text-xs text-gray-400 dark:text-slate-500 mt-2 italic">
                                                    Chưa có công việc nào được tạo. Click "Quy trình" để xem các bước cần thực hiện.
                                                </p>
                                            )}

                                            {/* Sub-tasks from Registry */}
                                            {expandedSubTasks[item.code] && (() => {
                                                const subTasks = getSubTasksForStep(item.code, groupCode);

                                                // ── Auto-fill Start/End dates ──
                                                // Lấy ngày bắt đầu: từ project.StartDate / ApprovalDate hoặc today
                                                const getBaseDate = (): Date => {
                                                    if (project?.StartDate) return new Date(project.StartDate);
                                                    if (project?.ApprovalDate) return new Date(project.ApprovalDate);
                                                    return new Date();
                                                };

                                                // Tính tổng ngày từ các bước TRƯỚC item hiện tại
                                                const allPhaseItems = DECREE_175_PHASES.flatMap(p => p.items);
                                                const currentIdx = allPhaseItems.findIndex(i => i.code === item.code);
                                                let cumulativeDaysBefore = 0;
                                                for (let i = 0; i < currentIdx; i++) {
                                                    const prevSubs = getSubTasksForStep(allPhaseItems[i].code, groupCode);
                                                    cumulativeDaysBefore += prevSubs.reduce((sum, s) => sum + (s.estimatedDays || 10), 0);
                                                }

                                                // Build date ranges cho từng sub-task
                                                const baseDate = getBaseDate();
                                                let runningDays = cumulativeDaysBefore;
                                                const stepDates = subTasks.map(st => {
                                                    const days = st.estimatedDays || 10;
                                                    const start = new Date(baseDate);
                                                    start.setDate(start.getDate() + runningDays);
                                                    const end = new Date(start);
                                                    end.setDate(end.getDate() + days);
                                                    runningDays += days;
                                                    return { start, end, days };
                                                });

                                                // Tổng ngày cho toàn bộ quy trình con này
                                                const totalStepDays = subTasks.reduce((s, st) => s + (st.estimatedDays || 10), 0);

                                                return (
                                                    <div className="mt-3 border border-purple-100 dark:border-purple-800 rounded-lg overflow-hidden bg-purple-50/30 dark:bg-purple-900/10">
                                                        <div className="px-3 py-2 bg-purple-50 dark:bg-purple-900/30 border-b border-purple-100 dark:border-purple-800 flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Scale className="w-3.5 h-3.5 text-purple-500" />
                                                                <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                                                                    <LegalReferenceLink text="Quy trình theo NĐ 175, Luật 135, NĐ 140, NĐ 144" />
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                {/* Bulk Create Tasks Button */}
                                                                {(() => {
                                                                    const existingCount = tasks.filter(t => t.TimelineStep === item.code).length;
                                                                    const subCount = subTasks.length;
                                                                    const allCreated = existingCount >= subCount;
                                                                    return (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleBulkCreateFromSubTasks(item.code, item.title);
                                                                            }}
                                                                            disabled={bulkCreatingStep === item.code || allCreated}
                                                                            className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg flex items-center gap-1 transition-all ${allCreated
                                                                                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700 cursor-default'
                                                                                : bulkCreatingStep === item.code
                                                                                    ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-700 cursor-wait'
                                                                                    : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:shadow-sm'
                                                                                }`}
                                                                            title={allCreated ? 'Đã tạo công việc cho tất cả bước' : 'Tạo công việc tự động cho tất cả bước quy trình'}
                                                                        >
                                                                            {bulkCreatingStep === item.code ? (
                                                                                <>
                                                                                    <div className="w-3 h-3 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
                                                                                    Đang tạo...
                                                                                </>
                                                                            ) : allCreated ? (
                                                                                <>
                                                                                    <CheckCircle2 className="w-3 h-3" />
                                                                                    Đã tạo {existingCount} việc
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <ListPlus className="w-3 h-3" />
                                                                                    Tạo {subCount} công việc
                                                                                </>
                                                                            )}
                                                                        </button>
                                                                    );
                                                                })()}
                                                                <span className="text-[10px] text-purple-500 dark:text-purple-400 flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3" />
                                                                    ~{totalStepDays} ngày
                                                                </span>
                                                                <span className="text-[10px] text-purple-500 dark:text-purple-400">
                                                                    {subTasks.length} bước
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="divide-y divide-purple-100 dark:divide-purple-800/50">
                                                            {subTasks.map((st, idx) => {
                                                                const dates = stepDates[idx];
                                                                const fmtDate = (d: Date) => d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                                                                const fmtShort = (d: Date) => d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

                                                                return (
                                                                    <div
                                                                        key={st.code}
                                                                        onClick={() => setSelectedSubTask({ def: st, stepTitle: item.title, stepCode: item.code })}
                                                                        className="px-3 py-2.5 flex items-center gap-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors cursor-pointer group/st"
                                                                    >
                                                                        <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                                                                            {idx + 1}
                                                                        </span>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-xs font-medium text-gray-700 dark:text-slate-300 truncate">{st.title}</p>
                                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                                <span className="flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400">
                                                                                    <Building2 className="w-2.5 h-2.5" />
                                                                                    {st.responsible}
                                                                                </span>
                                                                                {st.estimatedDays && (
                                                                                    <span className="flex items-center gap-0.5 text-[10px] text-gray-400 dark:text-slate-500">
                                                                                        <Clock className="w-2.5 h-2.5" />
                                                                                        {st.estimatedDays}d
                                                                                    </span>
                                                                                )}
                                                                                {st.templatePath && (
                                                                                    <span className="flex items-center gap-0.5 text-[10px] text-cyan-600 dark:text-cyan-400">
                                                                                        <FileText className="w-2.5 h-2.5" />
                                                                                        Biểu mẫu
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        {/* ── AUTO-FILLED DATE RANGE ── */}
                                                                        <div className="hidden sm:flex flex-col items-end gap-0.5 shrink-0 min-w-[140px]">
                                                                            <div className="flex items-center gap-1.5 text-[10px]">
                                                                                <Calendar className="w-3 h-3 text-indigo-400" />
                                                                                <span className="text-gray-600 dark:text-slate-400 font-medium">
                                                                                    {fmtShort(dates.start)}
                                                                                </span>
                                                                                <span className="text-gray-300 dark:text-slate-600">→</span>
                                                                                <span className="text-gray-700 dark:text-slate-300 font-semibold">
                                                                                    {fmtShort(dates.end)}
                                                                                </span>
                                                                            </div>
                                                                            {/* Mini progress bar */}
                                                                            <div className="w-full h-1 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                                                <div
                                                                                    className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full transition-all"
                                                                                    style={{ width: `${Math.min(100, (dates.days / totalStepDays) * 100)}%` }}
                                                                                />
                                                                            </div>
                                                                        </div>

                                                                        <Info className="w-3.5 h-3.5 text-gray-300 group-hover/st:text-purple-400 transition-colors shrink-0" />
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="animate-in slide-in-from-bottom-2 duration-500 space-y-6 py-4">

            {/* 1. Statistics Header — click card to filter */}
            <PlanStatisticsHeader tasks={tasks} onFilterChange={setCurrentFilter} />

            {/* 1.5 Smart Alerts */}
            {(() => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const threeDays = new Date(today);
                threeDays.setDate(threeDays.getDate() + 3);

                const overdue = tasks.filter(t => {
                    if (t.Status === TaskStatus.Done) return false;
                    if (!t.DueDate) return false;
                    const d = new Date(t.DueDate); d.setHours(0, 0, 0, 0);
                    return d < today;
                });
                const upcoming = tasks.filter(t => {
                    if (t.Status === TaskStatus.Done) return false;
                    if (!t.DueDate) return false;
                    const d = new Date(t.DueDate); d.setHours(0, 0, 0, 0);
                    return d >= today && d <= threeDays;
                });
                const todayDone = tasks.filter(t => {
                    if (t.Status !== TaskStatus.Done) return false;
                    if (!t.ActualEndDate) return false;
                    const d = new Date(t.ActualEndDate); d.setHours(0, 0, 0, 0);
                    return d.getTime() === today.getTime();
                });

                const alerts: { icon: string; text: string; type: 'danger' | 'warn' | 'success' }[] = [];
                if (overdue.length > 0) alerts.push({ icon: '🔴', text: `${overdue.length} công việc đã quá hạn — cần xử lý ngay!`, type: 'danger' });
                if (upcoming.length > 0) alerts.push({ icon: '⚠️', text: `${upcoming.length} công việc sẽ đến hạn trong 3 ngày tới`, type: 'warn' });
                if (todayDone.length > 0) alerts.push({ icon: '✅', text: `${todayDone.length} công việc vừa hoàn thành hôm nay`, type: 'success' });

                if (alerts.length === 0) return null;

                const typeStyles = {
                    danger: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400',
                    warn: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400',
                    success: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400',
                };

                return (
                    <div className="flex flex-wrap gap-2">
                        {alerts.map((a, i) => (
                            <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${typeStyles[a.type]}`}>
                                <span>{a.icon}</span>
                                <span>{a.text}</span>
                            </div>
                        ))}
                    </div>
                );
            })()}

            {/* 2. Filter Bar */}
            <TaskFilterBar
                currentFilter={currentFilter}
                currentView={currentView}
                onFilterChange={setCurrentFilter}
                onViewChange={setCurrentView}
                onAddTask={() => handleAddTask()}
                onSearch={setSearchQuery}
                searchQuery={searchQuery}
                taskCounts={taskCounts}
                currentUserId={currentUserId}
            />

            {/* 2.5 Overall Progress Bar */}
            {(() => {
                const total = tasks.length;
                const done = tasks.filter(t => t.Status === TaskStatus.Done).length;
                const inProgress = tasks.filter(t => t.Status === TaskStatus.InProgress || t.Status === TaskStatus.Review).length;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-600 dark:text-slate-300 uppercase tracking-wide">Tiến độ tổng thể</span>
                            <span className="text-sm font-black text-gray-800 dark:text-white">{pct}%</span>
                        </div>
                        <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-700 ease-out"
                                style={{ background: 'linear-gradient(90deg, #A89050, #C4A035, #D4A017)', width: `${pct}%` }}
                            />
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-[10px] font-medium">
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                Hoàn thành: {done}
                            </span>
                            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                Đang thực hiện: {inProgress}
                            </span>
                            <span className="flex items-center gap-1 text-gray-400 dark:text-slate-500">
                                <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-slate-600" />
                                Chưa bắt đầu: {total - done - inProgress}
                            </span>
                        </div>
                    </div>
                );
            })()}

            {/* 3. Main Layout: Content + Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left: Main Content (3 cols) */}
                <div className="lg:col-span-3 space-y-4">
                    {currentView === 'wbs' && renderWBSView()}

                    {currentView === 'gantt' && (
                        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                            <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700 flex justify-between items-center">
                                <h4 className="font-bold text-gray-700 dark:text-slate-200 text-xs uppercase flex items-center gap-2">
                                    <Layers className="w-4 h-4" /> Tiến độ tổng thể (Gantt)
                                </h4>
                                <span className="text-[10px] text-gray-400 dark:text-slate-500 font-normal normal-case">
                                    * Chỉ hiển thị các hạng mục lớn đã có công việc thành phần
                                </span>
                            </div>
                            <div className="p-4">
                                {ganttTasks.length > 0 ? (
                                    <ProjectGanttChart tasks={ganttTasks} />
                                ) : (
                                    <div className="h-32 flex items-center justify-center text-gray-400 dark:text-slate-500 text-sm italic">
                                        Chưa có công việc nào được cập nhật thời gian. Hãy thêm công việc bên dưới.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {currentView === 'kanban' && (
                        <KanbanBoardView
                            tasks={filteredTasks}
                            onTaskClick={handleEditTask}
                            onStatusChange={handleStatusChange}
                            onAddTask={(status) => {
                                setSelectedStep(null);
                                setEditingTask({ Status: status } as Task);
                                setIsTaskModalOpen(true);
                            }}
                        />
                    )}

                    {currentView === 'resource' && (
                        <ResourceAllocationView
                            tasks={filteredTasks}
                            employees={employees}
                            onTaskClick={handleEditTask}
                        />
                    )}
                </div>

                {/* Right: Sidebar (1 col) */}
                <div className="lg:col-span-1">
                    <div className="sticky top-4 space-y-4">

                        {/* Project Health Score */}
                        {(() => {
                            const total = tasks.length;
                            if (total === 0) return null;

                            const done = tasks.filter(t => t.Status === TaskStatus.Done).length;
                            const today = new Date(); today.setHours(0, 0, 0, 0);
                            const overdue = tasks.filter(t => {
                                if (t.Status === TaskStatus.Done || !t.DueDate) return false;
                                const d = new Date(t.DueDate); d.setHours(0, 0, 0, 0);
                                return d < today;
                            }).length;
                            const assigned = tasks.filter(t => t.AssigneeID || (t.Assignees && t.Assignees.length > 0)).length;

                            // Score calculation (0-100)
                            const completionScore = (done / total) * 30;
                            const onTimeScore = ((total - overdue) / total) * 30;
                            const assignedScore = (assigned / total) * 20;
                            const hasProgress = tasks.filter(t => (t.ProgressPercent || 0) > 0 || t.Status === TaskStatus.Done).length;
                            const progressScore = (hasProgress / total) * 20;
                            const score = Math.round(completionScore + onTimeScore + assignedScore + progressScore);

                            const getScoreInfo = (s: number) => {
                                if (s >= 80) return { emoji: '🟢', label: 'Tốt', color: 'text-emerald-600', bg: 'bg-emerald-500' };
                                if (s >= 60) return { emoji: '🟡', label: 'Trung bình', color: 'text-amber-600', bg: 'bg-amber-500' };
                                if (s >= 40) return { emoji: '🟠', label: 'Cần cải thiện', color: 'text-orange-600', bg: 'bg-orange-500' };
                                return { emoji: '🔴', label: 'Rủi ro cao', color: 'text-red-600', bg: 'bg-red-500' };
                            };
                            const info = getScoreInfo(score);

                            return (
                                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm">
                                    <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                                        Sức khỏe dự án
                                    </h4>
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-3xl">{info.emoji}</span>
                                        <div>
                                            <span className={`text-2xl font-black ${info.color}`}>{score}</span>
                                            <span className="text-sm text-gray-400">/100</span>
                                            <p className={`text-xs font-semibold ${info.color}`}>{info.label}</p>
                                        </div>
                                    </div>
                                    {/* Score bar */}
                                    <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
                                        <div className={`h-full ${info.bg} rounded-full transition-all duration-500`} style={{ width: `${score}%` }} />
                                    </div>
                                    {/* Breakdown */}
                                    <div className="space-y-1.5 text-[10px] text-gray-500">
                                        <div className="flex justify-between"><span>Hoàn thành ({done}/{total})</span><span className="font-bold">{Math.round(completionScore)}/30</span></div>
                                        <div className="flex justify-between"><span>Đúng hạn ({total - overdue}/{total})</span><span className="font-bold">{Math.round(onTimeScore)}/30</span></div>
                                        <div className="flex justify-between"><span>Có tiến độ</span><span className="font-bold">{Math.round(progressScore)}/20</span></div>
                                        <div className="flex justify-between"><span>Đã phân công</span><span className="font-bold">{Math.round(assignedScore)}/20</span></div>
                                    </div>
                                </div>
                            );
                        })()}

                        <MilestoneTimeline milestoneData={milestoneData} />
                    </div>
                </div>
            </div>

            <ProjectTaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                onSubmit={handleSaveTask}
                initialData={editingTask || {}}
                stepName={selectedStep?.name}
                stepCode={selectedStep?.code}
                allTasks={tasks}
            />

            {/* Sub-task Detail Modal */}
            <SubTaskDetailModal
                subTask={selectedSubTask?.def ?? null}
                stepTitle={selectedSubTask?.stepTitle}
                stepCode={selectedSubTask?.stepCode}
                isOpen={!!selectedSubTask}
                onClose={() => setSelectedSubTask(null)}
                onCreateTask={handleSaveTask}
                project={project}
            />

            {/* Hidden file input for attachments */}
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp,.zip"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && pendingUploadTaskId) {
                        handleFileUpload(pendingUploadTaskId, file);
                        setPendingUploadTaskId(null);
                    }
                    e.target.value = '';
                }}
            />

            {/* Toast Notifications */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium animate-in slide-in-from-bottom-4 duration-300 ${
                    toast.type === 'success' ? 'bg-emerald-600 text-white' :
                    toast.type === 'error' ? 'bg-red-600 text-white' :
                    'bg-gray-800 text-white'
                }`}>
                    <span>{toast.msg}</span>
                    <button onClick={() => setToast(null)} className="ml-2 text-white/60 hover:text-white text-lg leading-none">&times;</button>
                </div>
            )}
        </div>
    );
};
