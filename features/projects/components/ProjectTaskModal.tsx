import React, { useState, useEffect, useRef } from 'react';
import {
    X, Calendar, User, AlignLeft, CheckSquare, Clock, Flag, Link2, BarChart3,
    Plus, Trash2, CheckCircle2, Scale, Paperclip, Upload, Download, FileText,
    AlertTriangle, ChevronDown, ChevronUp, ExternalLink, Layers, Zap, FileSpreadsheet, File
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority, TaskDependency, TaskAttachment } from '@/types';
import { useEmployees } from '@/hooks/useEmployees';
import { ProgressSlider } from './ProgressSlider';
import { TaskDependencyManager } from './TaskDependencyManager';
import { getTimelineStepLabel, getPhaseColor } from '@/utils/timelineStepUtils';
import { getTaskTemplates, getFileTypeColor, TaskTemplate } from '@/utils/taskTemplates';
import { getTemplateConfig } from '@/utils/templateRegistry';
import { TemplateExportModal } from './TemplateExportModal';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useUpdateTask } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';

// ── Date helpers ──
const todayISO = () => new Date().toISOString();
const toYMD = (iso?: string | null): string => {
    if (!iso) return '';
    try { const d = new Date(iso); return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0]; }
    catch { return ''; }
};
const toDMY = (iso?: string | null): string => {
    if (!iso) return '';
    try {
        const d = new Date(iso);
        if (isNaN(d.getTime())) return '';
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        return `${dd}/${mm}/${d.getFullYear()}`;
    } catch { return ''; }
};

// ── DateInputVN ──
const DateInputVN: React.FC<{
    value?: string | null;
    onChange: (iso: string) => void;
    borderClass?: string;
}> = ({ value, onChange, borderClass = 'border-gray-300' }) => {
    const ref = React.useRef<HTMLInputElement>(null);
    return (
        <div
            className={`relative flex items-center w-full rounded-lg border bg-white dark:bg-slate-900 cursor-pointer ${borderClass}`}
            onClick={() => ref.current?.showPicker?.()}
        >
            <Calendar className="w-4 h-4 text-gray-400 dark:text-slate-500 ml-3 shrink-0 pointer-events-none" />
            <span className={`flex-1 pl-2 py-2.5 text-sm select-none ${value ? 'text-gray-800 dark:text-slate-100' : 'text-gray-400 dark:text-slate-500'}`}>
                {value ? toDMY(value) : 'dd/mm/yyyy'}
            </span>
            <input
                ref={ref}
                type="date"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                value={toYMD(value)}
                onChange={e => onChange(e.target.value ? new Date(e.target.value).toISOString() : '')}
            />
        </div>
    );
};

// ── Status/Priority helpers ──
const getStatusConfig = (s?: TaskStatus) => {
    switch (s) {
        case TaskStatus.Done: return { label: 'Hoàn thành', bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50 dark:bg-emerald-900/30', ring: 'ring-emerald-500/20' };
        case TaskStatus.InProgress: return { label: 'Đang thực hiện', bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-50 dark:bg-blue-900/30', ring: 'ring-blue-500/20' };
        case TaskStatus.Review: return { label: 'Chờ duyệt', bg: 'bg-violet-500', text: 'text-violet-600', light: 'bg-violet-50 dark:bg-violet-900/30', ring: 'ring-violet-500/20' };
        default: return { label: 'Cần làm', bg: 'bg-slate-300', text: 'text-slate-500', light: 'bg-slate-50 dark:bg-slate-700', ring: 'ring-slate-300/20' };
    }
};

const getPriorityConfig = (p?: TaskPriority) => {
    switch (p) {
        case TaskPriority.Urgent: return { label: 'Khẩn cấp', color: 'text-red-600 bg-red-50 ring-1 ring-red-500/20' };
        case TaskPriority.High: return { label: 'Cao', color: 'text-orange-600 bg-orange-50 ring-1 ring-orange-500/20' };
        case TaskPriority.Medium: return { label: 'Trung bình', color: 'text-sky-600 bg-sky-50 ring-1 ring-sky-500/20' };
        case TaskPriority.Low: return { label: 'Thấp', color: 'text-slate-500 bg-slate-50 ring-1 ring-slate-300/20' };
        default: return { label: 'N/A', color: 'text-slate-400 bg-slate-50' };
    }
};

interface ProjectTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (task: Partial<Task>) => void;
    initialData?: Partial<Task>;
    stepName?: string;
    stepCode?: string;
    allTasks?: Task[];
}

export const ProjectTaskModal: React.FC<ProjectTaskModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    stepName,
    stepCode,
    allTasks = []
}) => {
    const navigate = useNavigate();
    const { data: employees = [] } = useEmployees();
    const { projects = [] } = useProjects();
    const updateTaskMutation = useUpdateTask();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<Partial<Task>>({
        Title: '', Description: '', Status: TaskStatus.Todo, Priority: TaskPriority.Medium,
        StartDate: '', DueDate: '', AssigneeID: '', ProgressPercent: 0, Dependencies: [],
        ...initialData
    });
    const [activeSection, setActiveSection] = useState<string>('basic');
    const [isSubTaskModalOpen, setIsSubTaskModalOpen] = useState(false);
    const [editingSubTask, setEditingSubTask] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [activeExportTemplate, setActiveExportTemplate] = useState<TaskTemplate | null>(null);
    const [projectMemberIds, setProjectMemberIds] = useState<string[]>([]);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Load project members to filter employee dropdown
    useEffect(() => {
        const projectId = initialData?.ProjectID;
        if (!projectId || !isOpen) { setProjectMemberIds([]); return; }
        (async () => {
            try {
                const { data, error } = await supabase
                    .from('project_members')
                    .select('employee_id')
                    .eq('project_id', projectId);
                if (!error && data) {
                    setProjectMemberIds(data.map((r: any) => r.employee_id));
                }
            } catch { /* ignore */ }
        })();
    }, [initialData?.ProjectID, isOpen]);

    // Filter: only project members (fallback to all if no members configured)
    const availableEmployees = projectMemberIds.length > 0
        ? employees.filter(e => projectMemberIds.includes(e.EmployeeID))
        : employees;

    const isEditMode = !!initialData?.TaskID;
    const project = projects.find(p => p.ProjectID === formData.ProjectID);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                Title: '', Description: '', Status: TaskStatus.Todo, Priority: TaskPriority.Medium,
                StartDate: '', DueDate: '', AssigneeID: '', ProgressPercent: 0, Dependencies: [],
                ...initialData
            });
            setActiveSection('basic');
            setIsSubTaskModalOpen(false);
            setEditingSubTask(null);
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ ...formData, TimelineStep: stepCode || formData.TimelineStep });
        if (isEditMode) {
            // Stay open in edit mode, show save feedback
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
        } else {
            onClose(); // Close only when creating new task
        }
    };

    const handleDependencyUpdate = (dependencies: TaskDependency[]) => {
        setFormData({ ...formData, Dependencies: dependencies });
    };

    const statusCfg = getStatusConfig(formData.Status as TaskStatus);
    const priorityCfg = getPriorityConfig(formData.Priority as TaskPriority);
    const progress = formData.ProgressPercent || (formData.Status === TaskStatus.Done ? 100 : 0);
    const isOverdue = formData.Status !== TaskStatus.Done && formData.DueDate && new Date(formData.DueDate) < new Date();
    const stepLabel = getTimelineStepLabel(formData.TimelineStep);
    const phaseColor = getPhaseColor(formData.TimelineStep);
    const templates = isEditMode ? getTaskTemplates(formData.TimelineStep, formData.Title) : [];
    const assignee = employees.find(e => e.EmployeeID === formData.AssigneeID);

    // ── File upload ──
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0 || !formData.TaskID) return;
        setIsUploading(true);
        try {
            const newAttachments: TaskAttachment[] = [...(formData.Attachments || [])];
            for (const file of Array.from(files) as File[]) {
                const ext = file.name.split('.').pop();
                const path = `${formData.ProjectID}/tasks/${formData.TaskID}/${Date.now()}.${ext}`;
                const { error: uploadError } = await supabase.storage.from('task-attachments').upload(path, file);
                if (uploadError) throw uploadError;
                const { data: urlData } = supabase.storage.from('task-attachments').getPublicUrl(path);
                newAttachments.push({
                    id: `ATT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                    name: file.name, url: urlData.publicUrl,
                    size: file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(0)} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                    uploadDate: new Date().toLocaleDateString('vi-VN'), type: 'uploaded',
                });
            }
            const updatedData = { ...formData, Attachments: newAttachments };
            setFormData(updatedData);
            if (isEditMode) updateTaskMutation.mutate(updatedData as Task);
        } catch (err) { console.error('Upload failed:', err); }
        finally { setIsUploading(false); e.target.value = ''; }
    };

    const handleRemoveAttachment = (id: string) => {
        if (!confirm('Xóa tài liệu này?')) return;
        const updated = (formData.Attachments || []).filter(a => a.id !== id);
        const updatedData = { ...formData, Attachments: updated };
        setFormData(updatedData);
        if (isEditMode) updateTaskMutation.mutate(updatedData as Task);
    };

    // ── Subtask save ──
    const handleSubTaskSave = (title: string, assigneeId: string, dueDate: string) => {
        let subs = [...(formData.SubTasks || [])];
        if (editingSubTask) {
            subs = subs.map(s => s.SubTaskID === editingSubTask.SubTaskID ? { ...s, Title: title, AssigneeID: assigneeId, DueDate: dueDate } : s);
        } else {
            subs.push({ SubTaskID: `SUB-${Date.now()}`, Title: title, AssigneeID: assigneeId, DueDate: dueDate, Status: 'Todo' as const });
        }
        const updatedData = { ...formData, SubTasks: subs };
        setFormData(updatedData);
        if (isEditMode) updateTaskMutation.mutate(updatedData as Task);
        setIsSubTaskModalOpen(false);
        setEditingSubTask(null);
    };

    const toggleSubTaskDone = (idx: number) => {
        const subs = [...(formData.SubTasks || [])];
        subs[idx].Status = subs[idx].Status === 'Done' ? 'Todo' : 'Done';
        const updatedData = { ...formData, SubTasks: subs };
        setFormData(updatedData);
        if (isEditMode) updateTaskMutation.mutate(updatedData as Task);
    };

    const deleteSubTask = (idx: number) => {
        if (!confirm('Xóa công việc con này?')) return;
        const subs = (formData.SubTasks || []).filter((_, i) => i !== idx);
        const updatedData = { ...formData, SubTasks: subs };
        setFormData(updatedData);
        if (isEditMode) updateTaskMutation.mutate(updatedData as Task);
    };

    const sections = [
        { id: 'basic', label: 'Thông tin cơ bản', icon: <CheckSquare className="w-4 h-4" /> },
        { id: 'schedule', label: 'Lịch & Tiến độ', icon: <Calendar className="w-4 h-4" /> },
        ...(isEditMode ? [
            { id: 'subtasks', label: `Công việc con (${(formData.SubTasks || []).length})`, icon: <Layers className="w-4 h-4" /> },
            { id: 'documents', label: `Tài liệu (${(formData.Attachments || []).length + templates.length})`, icon: <Paperclip className="w-4 h-4" /> },
        ] : []),
        { id: 'advanced', label: 'Nâng cao', icon: <Flag className="w-4 h-4" /> },
    ];

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-50 bg-black/20 animate-in fade-in duration-200" onClick={onClose} />

            {/* Slide Panel */}
            <div className="fixed inset-y-0 right-0 z-50 w-full max-w-4xl flex flex-col bg-white dark:bg-slate-900 shadow-2xl border-l border-gray-200 dark:border-slate-700 animate-in slide-in-from-right duration-300">

                {/* ══════════ HEADER ══════════ */}
                <div className="shrink-0 border-b border-gray-200 dark:border-slate-700">
                    {/* Status accent bar */}
                    <div className={`h-1 ${statusCfg.bg}`} />

                    <div className="px-6 py-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${statusCfg.light} ${statusCfg.text} ring-1 ${statusCfg.ring}`}>
                                        {statusCfg.label}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${priorityCfg.color}`}>
                                        {priorityCfg.label}
                                    </span>
                                    {formData.IsCritical && (
                                        <span className="text-[10px] font-black text-red-600 bg-red-50 ring-1 ring-red-200 px-2 py-1 rounded-md flex items-center gap-1">
                                            <Zap className="w-3 h-3" /> ĐƯỜNG GĂNG
                                        </span>
                                    )}
                                    {isOverdue && (
                                        <span className="text-[10px] font-bold text-red-600 bg-red-50 ring-1 ring-red-200 px-2 py-1 rounded-md animate-pulse flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" /> QUÁ HẠN
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-lg font-black text-gray-800 dark:text-slate-100 truncate">
                                    {isEditMode ? (formData.Title || 'Công việc') : 'Thêm công việc mới'}
                                </h2>
                                {stepName && (
                                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5 flex items-center gap-1">
                                        <Layers className="w-3 h-3" /> {stepName}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                {/* ── Workflow Action Buttons ── */}
                                {isEditMode && (() => {
                                    const status = formData.Status as TaskStatus;
                                    const prog = formData.ProgressPercent || 0;
                                    const buttons: React.ReactNode[] = [];

                                    // Back button (revert to previous state)
                                    if (status === TaskStatus.InProgress) {
                                        buttons.push(
                                            <button key="back" type="button" onClick={() => {
                                                const updates: Partial<Task> = { ...formData, Status: TaskStatus.Todo, ProgressPercent: 0, ActualStartDate: '', ActualEndDate: '' };
                                                setFormData(updates);
                                                onSubmit({ ...updates, TimelineStep: stepCode || updates.TimelineStep });
                                            }} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 rounded-lg transition-all">
                                                ← Chưa bắt đầu
                                            </button>
                                        );
                                    }
                                    if (status === TaskStatus.Review) {
                                        buttons.push(
                                            <button key="back" type="button" onClick={() => {
                                                const updates: Partial<Task> = { ...formData, Status: TaskStatus.InProgress, ProgressPercent: 90, ActualEndDate: '' };
                                                setFormData(updates);
                                                onSubmit({ ...updates, TimelineStep: stepCode || updates.TimelineStep });
                                            }} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 rounded-lg transition-all">
                                                ← Trả lại
                                            </button>
                                        );
                                    }

                                    // Forward buttons based on workflow
                                    if (status === TaskStatus.Todo) {
                                        // Todo → InProgress
                                        buttons.push(
                                            <button key="start" type="button" onClick={() => {
                                                const updates: Partial<Task> = { ...formData, Status: TaskStatus.InProgress, ProgressPercent: 25, ActualStartDate: todayISO() };
                                                setFormData(updates);
                                                onSubmit({ ...updates, TimelineStep: stepCode || updates.TimelineStep });
                                            }} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 rounded-lg shadow-sm shadow-blue-500/25 transition-all active:scale-[0.97]">
                                                Bắt đầu thực hiện →
                                            </button>
                                        );
                                    } else if (status === TaskStatus.InProgress && prog >= 100) {
                                        // InProgress + 100% → Review (report completion)
                                        buttons.push(
                                            <button key="report" type="button" onClick={() => {
                                                const updates: Partial<Task> = { ...formData, Status: TaskStatus.Review, ProgressPercent: 100 };
                                                setFormData(updates);
                                                onSubmit({ ...updates, TimelineStep: stepCode || updates.TimelineStep });
                                            }} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-violet-500 hover:bg-violet-600 rounded-lg shadow-sm shadow-violet-500/25 transition-all active:scale-[0.97] animate-pulse">
                                                📋 Báo cáo hoàn thành →
                                            </button>
                                        );
                                    } else if (status === TaskStatus.Review) {
                                        // Review → Done (approver confirms)
                                        buttons.push(
                                            <button key="approve" type="button" onClick={() => {
                                                const updates: Partial<Task> = { ...formData, Status: TaskStatus.Done, ProgressPercent: 100, ActualEndDate: todayISO() };
                                                if (!formData.ActualStartDate) updates.ActualStartDate = todayISO();
                                                setFormData(updates);
                                                onSubmit({ ...updates, TimelineStep: stepCode || updates.TimelineStep });
                                            }} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg shadow-sm shadow-emerald-500/25 transition-all active:scale-[0.97]">
                                                ✅ Duyệt hoàn thành
                                            </button>
                                        );
                                    }
                                    // Done → show text only
                                    if (status === TaskStatus.Done) {
                                        buttons.push(
                                            <span key="done" className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg ring-1 ring-emerald-200 dark:ring-emerald-700">
                                                ✅ Đã hoàn thành
                                            </span>
                                        );
                                    }

                                    return buttons;
                                })()}

                                {isEditMode && (
                                    <button type="button"
                                        onClick={() => { onClose(); navigate(`/tasks/${formData.TaskID}`); }}
                                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl text-blue-500 transition-colors"
                                        title="Mở trang chi tiết"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </button>
                                )}
                                <button type="button"
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Progress bar */}
                        {isEditMode && (
                            <div className="mt-3">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tiến độ</span>
                                    <span className={`text-xs font-black ${progress >= 100 ? 'text-emerald-600' : progress >= 50 ? 'text-blue-600' : 'text-gray-500'}`}>{progress}%</span>
                                </div>
                                <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${progress >= 100 ? 'bg-emerald-500' : progress >= 50 ? 'bg-blue-500' : 'bg-amber-400'}`}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Section tabs */}
                    <div className="flex overflow-x-auto px-4 gap-1 pb-0">
                        {sections.map(s => (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => setActiveSection(s.id)}
                                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${activeSection === s.id
                                    ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                                    : 'text-gray-500 dark:text-slate-400 border-transparent hover:text-gray-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                {s.icon} {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ══════════ SCROLLABLE BODY ══════════ */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-5">

                        {/* ── BASIC ── */}
                        {activeSection === 'basic' && (
                            <>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-2">
                                        <CheckSquare className="w-4 h-4 text-gray-400" /> Tên công việc <span className="text-red-500">*</span>
                                    </label>
                                    <input type="text" required
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        placeholder="VD: Lập tờ trình thẩm định..."
                                        value={formData.Title}
                                        onChange={e => setFormData({ ...formData, Title: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-2">
                                        <AlignLeft className="w-4 h-4 text-gray-400" /> Diễn giải chi tiết
                                    </label>
                                    <textarea
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                                        placeholder="Nhập ghi chú, yêu cầu kỹ thuật..."
                                        value={formData.Description}
                                        onChange={e => setFormData({ ...formData, Description: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-400" /> Người thực hiện
                                        </label>
                                        <select
                                            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-50 text-sm"
                                            value={formData.AssigneeID || ''}
                                            onChange={e => setFormData({ ...formData, AssigneeID: e.target.value })}
                                        >
                                            <option value="">-- Chọn --</option>
                                            {availableEmployees.map(emp => (
                                                <option key={emp.EmployeeID} value={emp.EmployeeID}>{emp.FullName}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Trạng thái</label>
                                        <select
                                            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-50 text-sm"
                                            value={formData.Status}
                                            onChange={e => {
                                                const newStatus = e.target.value as TaskStatus;
                                                let newProgress = formData.ProgressPercent || 0;
                                                if (newStatus === TaskStatus.Done) newProgress = 100;
                                                else if (newStatus === TaskStatus.Todo) newProgress = 0;
                                                else if (newStatus === TaskStatus.InProgress && newProgress === 0) newProgress = 25;
                                                else if (newStatus === TaskStatus.Review && newProgress < 100) newProgress = 100;
                                                const updates: Partial<Task> = { ...formData, Status: newStatus, ProgressPercent: newProgress };
                                                if (newStatus === TaskStatus.InProgress && !formData.ActualStartDate) updates.ActualStartDate = todayISO();
                                                if (newStatus === TaskStatus.Done) {
                                                    if (!formData.ActualStartDate) updates.ActualStartDate = todayISO();
                                                    if (!formData.ActualEndDate) updates.ActualEndDate = todayISO();
                                                }
                                                if (newStatus === TaskStatus.Todo) { updates.ActualStartDate = ''; updates.ActualEndDate = ''; }
                                                setFormData(updates);
                                            }}
                                        >
                                            <option value={TaskStatus.Todo}>Chưa bắt đầu</option>
                                            <option value={TaskStatus.InProgress}>Đang thực hiện</option>
                                            <option value={TaskStatus.Review}>Đang kiểm tra</option>
                                            <option value={TaskStatus.Done}>Hoàn thành</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-2">
                                            <Flag className="w-4 h-4 text-gray-400" /> Ưu tiên
                                        </label>
                                        <select
                                            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-50 text-sm"
                                            value={formData.Priority}
                                            onChange={e => setFormData({ ...formData, Priority: e.target.value as TaskPriority })}
                                        >
                                            <option value="Low">Thấp</option>
                                            <option value="Medium">Trung bình</option>
                                            <option value="High">Cao</option>
                                            <option value="Urgent">Khẩn cấp</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ── SCHEDULE ── */}
                        {activeSection === 'schedule' && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-gray-400" /> Ngày bắt đầu
                                        </label>
                                        <DateInputVN value={formData.StartDate} onChange={v => setFormData({ ...formData, StartDate: v })} borderClass="border-gray-300 dark:border-slate-600 focus-within:ring-2 focus-within:ring-blue-500" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-gray-400" /> Hạn hoàn thành
                                        </label>
                                        <DateInputVN value={formData.DueDate} onChange={v => setFormData({ ...formData, DueDate: v })} borderClass="border-gray-300 dark:border-slate-600 focus-within:ring-2 focus-within:ring-blue-500" />
                                    </div>
                                </div>

                                {/* Actual dates */}
                                <div className={`grid grid-cols-2 gap-4 p-3 rounded-lg border ${(formData.ActualStartDate || formData.ActualEndDate) ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700' : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700'}`}>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-emerald-500" /> Bắt đầu thực tế
                                            {formData.ActualStartDate && <span className="text-[9px] bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-300 px-1.5 py-0.5 rounded-full font-bold">Tự động</span>}
                                        </label>
                                        <DateInputVN value={formData.ActualStartDate} onChange={v => setFormData({ ...formData, ActualStartDate: v })} borderClass="border-emerald-300 dark:border-emerald-700" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                                            <CheckSquare className="w-4 h-4 text-emerald-500" /> Hoàn thành thực tế
                                            {formData.ActualEndDate && <span className="text-[9px] bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-300 px-1.5 py-0.5 rounded-full font-bold">Tự động</span>}
                                        </label>
                                        <DateInputVN value={formData.ActualEndDate} onChange={v => setFormData({ ...formData, ActualEndDate: v })} borderClass="border-emerald-300 dark:border-emerald-700" />
                                    </div>
                                </div>

                                {/* Progress slider */}
                                <ProgressSlider
                                    value={formData.ProgressPercent || 0}
                                    onChange={(value) => {
                                        let newStatus = formData.Status;
                                        // Keep InProgress at 100% — user must click "Báo cáo hoàn thành" to move to Review
                                        if (value >= 1) newStatus = TaskStatus.InProgress;
                                        else newStatus = TaskStatus.Todo;
                                        // Don't change status if already Review or Done
                                        if (formData.Status === TaskStatus.Review || formData.Status === TaskStatus.Done) newStatus = formData.Status;
                                        const updates: Partial<Task> = { ...formData, ProgressPercent: value, Status: newStatus };
                                        if (value > 0 && !formData.ActualStartDate) updates.ActualStartDate = todayISO();
                                        if (value === 0) { updates.ActualStartDate = ''; updates.ActualEndDate = ''; }
                                        setFormData(updates);
                                    }}
                                />
                            </>
                        )}

                        {/* ── SUBTASKS ── */}
                        {activeSection === 'subtasks' && isEditMode && (
                            <>
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest">Công việc con</h3>
                                    <button type="button" onClick={() => { setIsSubTaskModalOpen(true); setEditingSubTask(null); }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors">
                                        <Plus className="w-3.5 h-3.5" /> Thêm
                                    </button>
                                </div>

                                {/* Parent deadline banner */}
                                {formData.DueDate && (
                                    <div className={`flex items-center gap-3 p-3 rounded-xl border text-sm ${new Date(formData.DueDate) < new Date() ? 'bg-red-50 dark:bg-red-900/20 border-red-200' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200'}`}>
                                        <Calendar className={`w-4 h-4 ${new Date(formData.DueDate) < new Date() ? 'text-red-500' : 'text-amber-500'}`} />
                                        <span className="text-xs text-gray-500">Hạn công việc cha:</span>
                                        <span className={`text-xs font-bold ${new Date(formData.DueDate) < new Date() ? 'text-red-600' : 'text-amber-700'}`}>
                                            {new Date(formData.DueDate).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
                                        </span>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    {(formData.SubTasks || []).length === 0 && (
                                        <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl">
                                            <Layers className="w-8 h-8 text-gray-200 dark:text-slate-600 mx-auto mb-2" />
                                            <p className="text-xs text-gray-400 italic">Chưa có công việc con</p>
                                        </div>
                                    )}
                                    {(formData.SubTasks || []).map((sub, idx) => (
                                        <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl group/sub border border-transparent hover:border-gray-200 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-700/50 transition-all">
                                            <div
                                                onClick={() => toggleSubTaskDone(idx)}
                                                className={`mt-0.5 w-5 h-5 rounded-lg border-2 cursor-pointer flex items-center justify-center transition-all ${sub.Status === 'Done' ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' : 'border-gray-300 bg-white hover:border-blue-400'}`}
                                            >
                                                {sub.Status === 'Done' && <CheckCircle2 className="w-3 h-3" />}
                                            </div>
                                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => { setEditingSubTask(sub); setIsSubTaskModalOpen(true); }}>
                                                <p className={`text-xs font-semibold ${sub.Status === 'Done' ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-slate-300'}`}>{sub.Title}</p>
                                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                    <span className="text-[10px] text-gray-400 bg-white dark:bg-slate-700 px-2 py-0.5 rounded-md ring-1 ring-gray-100 dark:ring-slate-600 flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        {sub.AssigneeID ? employees.find(e => e.EmployeeID === sub.AssigneeID)?.FullName : 'Chưa gán'}
                                                    </span>
                                                    {sub.DueDate && (
                                                        <span className="text-[10px] text-gray-400 bg-white dark:bg-slate-700 px-2 py-0.5 rounded-md ring-1 ring-gray-100 dark:ring-slate-600 flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" /> {sub.DueDate}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => deleteSubTask(idx)}
                                                className="opacity-0 group-hover/sub:opacity-100 transition-opacity text-gray-300 hover:text-red-500 p-1 rounded-lg hover:bg-red-50">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* ── DOCUMENTS ── */}
                        {activeSection === 'documents' && isEditMode && (
                            <>
                                {/* Template documents */}
                                {templates.length > 0 && (
                                    <div>
                                        <p className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                            <Scale className="w-3 h-3" /> Tài liệu mẫu theo quy định
                                        </p>
                                        <div className="space-y-1.5">
                                            {templates.map((tpl, idx) => {
                                                const ftc = getFileTypeColor(tpl.fileType);
                                                const FileIcon = tpl.fileType === 'xlsx' ? FileSpreadsheet : tpl.fileType === 'pdf' ? File : FileText;
                                                return (
                                                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl ring-1 ring-gray-100 dark:ring-slate-700 hover:ring-violet-200 transition-all">
                                                        <div className={`p-2 rounded-xl ${ftc.bg}`}>
                                                            <FileIcon className={`w-4 h-4 ${ftc.text}`} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-semibold text-gray-700 dark:text-slate-200 flex items-center gap-2">
                                                                {tpl.name}
                                                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${ftc.bg} ${ftc.text}`}>{tpl.fileType}</span>
                                                            </p>
                                                            <p className="text-[10px] text-gray-400 mt-0.5 truncate">{tpl.description}</p>
                                                        </div>
                                                        {tpl.templatePath && getTemplateConfig(tpl.templatePath) && (
                                                            <button type="button" onClick={() => setActiveExportTemplate(tpl)}
                                                                className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold shadow-sm hover:shadow-md transition-all active:scale-95">
                                                                <Download className="w-3 h-3" /> Xuất DOCX
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Uploaded */}
                                {(formData.Attachments || []).length > 0 && (
                                    <div>
                                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                            <Upload className="w-3 h-3" /> Tài liệu đã tải lên
                                        </p>
                                        <div className="space-y-1.5">
                                            {(formData.Attachments || []).map(att => (
                                                <div key={att.id} className="flex items-center gap-3 p-3 bg-emerald-50/40 dark:bg-emerald-900/10 rounded-xl ring-1 ring-emerald-100 dark:ring-emerald-900/30 group/att">
                                                    <div className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm ring-1 ring-emerald-100 shrink-0">
                                                        <FileText className="w-4 h-4 text-emerald-500" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-gray-700 dark:text-slate-200 hover:text-blue-600 truncate block">{att.name}</a>
                                                        <p className="text-[10px] text-gray-400">{att.size} • {att.uploadDate}</p>
                                                    </div>
                                                    <button type="button" onClick={() => handleRemoveAttachment(att.id)}
                                                        className="opacity-0 group-hover/att:opacity-100 p-1.5 hover:bg-red-50 rounded-lg text-gray-300 hover:text-red-500 transition-all">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Upload button */}
                                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileUpload} accept=".pdf,.docx,.doc,.xlsx,.xls,.png,.jpg,.jpeg,.zip,.rar" />
                                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading}
                                    className="w-full text-center py-3.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors flex items-center justify-center gap-2 border-2 border-dashed border-blue-200 hover:border-blue-300 disabled:opacity-50">
                                    {isUploading ? (<><div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> Đang tải...</>) : (<><Upload className="w-4 h-4" /> Thêm tài liệu</>)}
                                </button>
                            </>
                        )}

                        {/* ── ADVANCED ── */}
                        {activeSection === 'advanced' && (
                            <>
                                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                                    <TaskDependencyManager task={formData as Task} allTasks={allTasks} onUpdate={handleDependencyUpdate} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Căn cứ pháp lý</label>
                                        <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: Điều 24 Luật ĐTC" value={formData.LegalBasis || ''} onChange={e => setFormData({ ...formData, LegalBasis: e.target.value })} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Sản phẩm đầu ra</label>
                                        <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: Quyết định phê duyệt" value={formData.OutputDocument || ''} onChange={e => setFormData({ ...formData, OutputDocument: e.target.value })} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Thời gian (ngày)</label>
                                        <input type="number" min="1" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="15" value={formData.DurationDays || ''} onChange={e => setFormData({ ...formData, DurationDays: parseInt(e.target.value) || undefined })} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Chi phí dự kiến (VNĐ)</label>
                                        <input type="number" min="0" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="50,000,000" value={formData.EstimatedCost || ''} onChange={e => setFormData({ ...formData, EstimatedCost: parseInt(e.target.value) || undefined })} />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Người phê duyệt</label>
                                    <select className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-50" value={formData.ApproverID || ''} onChange={e => setFormData({ ...formData, ApproverID: e.target.value })}>
                                        <option value="">-- Chọn --</option>
                                        {availableEmployees.filter(emp => emp.Position?.includes('Trưởng') || emp.Position?.includes('Giám đốc')).map(emp => (
                                            <option key={emp.EmployeeID} value={emp.EmployeeID}>{emp.FullName} - {emp.Position}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                                    <input type="checkbox" id="isCritical" className="w-4 h-4 text-purple-600 border-purple-300 rounded focus:ring-purple-500" checked={formData.IsCritical || false} onChange={e => setFormData({ ...formData, IsCritical: e.target.checked })} />
                                    <label htmlFor="isCritical" className="text-sm font-medium text-purple-700 dark:text-purple-300">Critical Path (ảnh hưởng tiến độ dự án)</label>
                                </div>
                            </>
                        )}
                    </div>

                    {/* ══════════ FOOTER ══════════ */}
                    <div className="sticky bottom-0 px-6 py-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
                        {saveSuccess && (
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in duration-200">
                                ✅ Đã lưu thành công
                            </span>
                        )}
                        {!saveSuccess && <div />}
                        <div className="flex gap-3">
                            <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-600 dark:text-slate-300 font-medium hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                {isEditMode ? 'Đóng' : 'Hủy bỏ'}
                            </button>
                            <button type="submit" className={`px-6 py-2.5 font-bold rounded-lg shadow-lg transition-all active:scale-[0.98] ${saveSuccess ? 'bg-emerald-500 text-white shadow-emerald-500/25' : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-500/25 hover:from-blue-600 hover:to-blue-700'}`}>
                                {isEditMode ? (saveSuccess ? '✅ Đã lưu' : 'Lưu thay đổi') : 'Tạo công việc'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* ══════════ SUBTASK INLINE MODAL ══════════ */}
            {isSubTaskModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden ring-1 ring-black/5">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-base font-bold text-gray-800 dark:text-slate-200">{editingSubTask ? 'Sửa công việc con' : 'Thêm công việc con'}</h3>
                            <button type="button" onClick={() => { setIsSubTaskModalOpen(false); setEditingSubTask(null); }} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl text-gray-400">✕</button>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const fd = new FormData(e.currentTarget);
                            handleSubTaskSave(fd.get('title') as string, fd.get('assignee') as string, fd.get('dueDate') as string);
                        }} className="p-6 space-y-4">
                            {formData.DueDate && (
                                <div className={`flex items-center gap-3 p-3 rounded-xl border ${new Date(formData.DueDate) < new Date() ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                                    <AlertTriangle className={`w-4 h-4 ${new Date(formData.DueDate) < new Date() ? 'text-red-500' : 'text-amber-500'}`} />
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold uppercase text-gray-500">Hạn công việc cha</p>
                                        <p className={`text-sm font-black ${new Date(formData.DueDate) < new Date() ? 'text-red-600' : 'text-amber-700'}`}>
                                            {new Date(formData.DueDate).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Nội dung</label>
                                <input defaultValue={editingSubTask?.Title || ''} name="title" required className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="Nhập tên công việc..." />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Người thực hiện</label>
                                <select defaultValue={editingSubTask?.AssigneeID || ''} name="assignee" className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                                    <option value="">-- Chọn --</option>
                                    {availableEmployees.filter(e => e.Status === 1 || e.Status === 'active' as any).map(e => (
                                        <option key={e.EmployeeID} value={e.EmployeeID}>{e.FullName} - {e.Department}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Hạn hoàn thành</label>
                                <input defaultValue={editingSubTask?.DueDate || ''} type="date" name="dueDate" max={formData.DueDate ? toYMD(formData.DueDate) : undefined} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                            </div>
                            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                                <button type="button" onClick={() => { setIsSubTaskModalOpen(false); setEditingSubTask(null); }} className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl">Hủy</button>
                                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg active:scale-[0.98]">
                                    {editingSubTask ? 'Lưu' : 'Thêm mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Template Export Modal */}
            {activeExportTemplate?.templatePath && (
                <TemplateExportModal
                    isOpen={!!activeExportTemplate}
                    onClose={() => setActiveExportTemplate(null)}
                    templatePath={activeExportTemplate.templatePath}
                    templateLabel={activeExportTemplate.name}
                    project={project || null}
                    stepTitle={formData.TimelineStep ? getTimelineStepLabel(formData.TimelineStep) : undefined}
                    stepCode={formData.TimelineStep}
                />
            )}
        </>
    );
};
