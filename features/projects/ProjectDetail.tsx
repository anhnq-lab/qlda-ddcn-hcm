import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ProjectService } from '@/services/ProjectService';
import { NationalGatewayService, SyncResult } from '@/services/NationalGatewayService';
import { Project, Employee, ProjectStage } from '@/types';
import { useTasks, useUpdateTask } from '@/hooks/useTasks';
import { useBiddingPackages } from '@/hooks/useBiddingPackages';

/** Props when rendering inside a SlidePanel */
export interface ProjectDetailProps {
    /** If provided, overrides useParams().id — used when rendering in a panel */
    projectId?: string;
    /** Called to close this panel */
    onClose?: () => void;
    /** Render in panel mode (no breadcrumb nav, adjusted height) */
    inPanel?: boolean;
}
import { supabase } from '@/lib/supabase';
import { ProjectHeader } from './components/ProjectHeader';
import { ProjectInfoTab } from './components/tabs/ProjectInfoTab';
import { ProjectPlanTab } from './components/tabs/ProjectPlanTab';

import { ProjectPackagesTab } from './components/tabs/ProjectPackagesTab';
import { ProjectCapitalTab } from './components/tabs/ProjectCapitalTab';
import { ProjectDocumentsTab } from './components/tabs/ProjectDocumentsTab';
import { ProjectComplianceTab } from './components/tabs/ProjectComplianceTab';
import { ProjectOperationsTab } from './components/tabs/ProjectOperationsTab';
import { CreateProjectModal } from './components/CreateProjectModal';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { Info, CalendarCheck, Briefcase, FolderOpen, Landmark, Database, Settings2, Sparkles } from 'lucide-react';
import { AISummaryWidget } from '@/components/ai/AISummaryWidget';
import { AICompliancePanel } from '@/components/ai/AICompliancePanel';
import { AIForecastChart } from '@/components/ai/AIForecastChart';
import { AIDocumentDrafter } from '@/components/ai/AIDocumentDrafter';
import { AIReportModal } from './components/AIReportModal';
import { generateMonthlyReport } from '@/services/aiService';

// Tab definitions — extracted for reuse
const TAB_DEFINITIONS = [
    { id: 'info', label: 'TỔNG QUAN', shortLabel: 'T.QUAN', icon: Info },
    { id: 'plan', label: 'KẾ HOẠCH/TIẾN ĐỘ', shortLabel: 'K.HOẠCH', icon: CalendarCheck },
    { id: 'packages', label: 'GÓI THẦU', shortLabel: 'GÓI THẦU', icon: Briefcase },
    { id: 'capital', label: 'VỐN & GIẢI NGÂN', shortLabel: 'VỐN', icon: Landmark },
    { id: 'tt24', label: 'DỮ LIỆU TT24', shortLabel: 'TT24', icon: Database },
    { id: 'documents', label: 'HỒ SƠ & PHÁP LÝ', shortLabel: 'HỒ SƠ', icon: FolderOpen },
    { id: 'operations', label: 'VẬN HÀNH', shortLabel: 'V.HÀNH', icon: Settings2 },
] as const;

type TabId = typeof TAB_DEFINITIONS[number]['id'];

// ─────── Skeleton Loading ───────
const ProjectDetailSkeleton: React.FC = () => (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-[#F8FAFC] dark:bg-slate-900 animate-pulse">
        <div className="shrink-0 px-4 pt-4 space-y-4">
            {/* Header skeleton */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-slate-700 rounded-xl" />
                    <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="h-7 bg-gray-200 dark:bg-slate-700 rounded-lg w-2/3" />
                            <div className="h-6 bg-amber-100 dark:bg-amber-900/20 rounded-md w-28" />
                        </div>
                        <div className="flex gap-4">
                            <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-24" />
                            <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-32" />
                            <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-20" />
                            <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-16" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="h-9 w-24 bg-blue-100 dark:bg-blue-900/20 rounded-xl" />
                        <div className="h-9 w-9 bg-gray-100 dark:bg-slate-700 rounded-xl" />
                    </div>
                </div>
            </div>
            {/* Tab skeleton */}
            <div className="flex gap-8 border-b border-gray-200 dark:border-slate-700 pb-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i} className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-20" />
                ))}
            </div>
        </div>
        {/* Content skeleton */}
        <div className="flex-1 px-4 py-6 space-y-4">
            <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6 h-28 border border-gray-200 dark:border-slate-700" />
                ))}
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 bg-white dark:bg-slate-800 rounded-xl p-6 h-64 border border-gray-200 dark:border-slate-700" />
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 h-64 border border-gray-200 dark:border-slate-700" />
            </div>
        </div>
    </div>
);



// ─────── Main Component ───────
const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectId: propProjectId, onClose, inPanel = false }) => {
    const { id: paramId } = useParams<{ id: string }>();
    const id = propProjectId || paramId;
    const location = useLocation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // State
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    // Read initial tab from navigation state (e.g. from TaskDetail breadcrumb)
    const initialTab = (location.state as any)?.activeTab || 'info';
    const [activeTab, setActiveTab] = useState<TabId>(initialTab);

    // Sync activeTab when navigating from another page (e.g., PaymentList → Gói thầu tab)
    const openPackageId = (location.state as any)?.openPackageId || null;
    const initialDetailTab = (location.state as any)?.initialDetailTab || undefined;
    useEffect(() => {
        const stateTab = (location.state as any)?.activeTab;
        if (stateTab && stateTab !== activeTab) {
            setActiveTab(stateTab);
        }
    }, [location.state]);

    // Module 1: National Gateway State
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

    // AI Report Modal state
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [reportContent, setReportContent] = useState('');
    const [reportLoading, setReportLoading] = useState(false);
    const [reportError, setReportError] = useState<string | undefined>();

    // Delete confirmation modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Edit modal
    const [showEditModal, setShowEditModal] = useState(false);

    // AI Document Drafter modal
    const [showDrafter, setShowDrafter] = useState(false);

    // Lazy-mount flags: once mounted, stay mounted to preserve state
    const [opsMounted, setOpsMounted] = useState(initialTab === 'operations');

    // Mount Operations on first visit
    useEffect(() => {
        if (activeTab === 'operations' && !opsMounted) setOpsMounted(true);
    }, [activeTab, opsMounted]);

    // Keyboard: Arrow Left/Right to switch tabs when in panel
    useEffect(() => {
        if (!inPanel) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                setActiveTab(prev => {
                    const currentIdx = TAB_DEFINITIONS.findIndex(t => t.id === prev);
                    if (currentIdx === -1) return prev;
                    const nextIdx = e.key === 'ArrowRight'
                        ? Math.min(currentIdx + 1, TAB_DEFINITIONS.length - 1)
                        : Math.max(currentIdx - 1, 0);
                    return TAB_DEFINITIONS[nextIdx].id;
                });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [inPanel]);

    // Refetch project when switching to info tab (picks up DB-trigger stage/progress changes)
    useEffect(() => {
        if (activeTab === 'info' && id && !loading) {
            ProjectService.getById(id).then(data => {
                if (data) setProject(data);
            }).catch(() => { });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, id]);

    // Initial Data Fetch
    useEffect(() => {
        const fetchProject = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await ProjectService.getById(id);
                setProject(data || null);
            } catch (error) {
                console.error("Failed to fetch project", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [id]);

    // Derived Data
    const { data: tasks = [] } = useTasks({ projectId: project?.ProjectID });
    const { mutate: saveTask } = useUpdateTask();

    // Get bidding packages for this project
    const { data: packages = [] } = useBiddingPackages(project?.ProjectID || '');

    // Get project members from project_members table
    const [projectMembers, setProjectMembers] = useState<Employee[]>([]);
    useEffect(() => {
        if (!project?.ProjectID) return;
        const loadMembers = async () => {
            try {
                const { data: memberRows, error } = await supabase
                    .from('project_members')
                    .select('employee_id, role')
                    .eq('project_id', project.ProjectID);
                if (error || !memberRows || memberRows.length === 0) {
                    setProjectMembers([]);
                    return;
                }
                const empIds = memberRows.map((m: any) => m.employee_id);
                const { data: empData } = await supabase
                    .from('employees')
                    .select('*')
                    .in('employee_id', empIds);
                if (empData && empData.length > 0) {
                    const members: Employee[] = empData.map((e: any) => ({
                        EmployeeID: e.employee_id,
                        FullName: e.full_name || '',
                        Department: e.department || '',
                        Position: e.position || '',
                        Role: (memberRows.find((m: any) => m.employee_id === e.employee_id)?.role || 'Thành viên') as any,
                        Email: e.email || '',
                        Phone: e.phone || '',
                        JoinDate: e.join_date || '',
                        Status: e.status || 'active',
                        AvatarUrl: e.avatar_url || '',
                        Username: e.username || e.full_name || '',
                    }));
                    setProjectMembers(members);
                } else {
                    setProjectMembers([]);
                }
            } catch (err) {
                console.error('Failed to load project members:', err);
                setProjectMembers([]);
            }
        };
        loadMembers();
    }, [project?.ProjectID]);

    // ─── Handlers ───
    const handleSync = useCallback(async () => {
        if (!project) return;
        setIsSyncing(true);
        try {
            const result = await NationalGatewayService.syncProject(project);
            setSyncResult(result);
            if (result.success) alert(result.message);
            else alert(`Lỗi: ${result.message}`);
        } catch (error) {
            console.error(error);
            alert('Có lỗi xảy ra khi đồng bộ.');
        } finally {
            setIsSyncing(false);
        }
    }, [project]);

    const handleGenerateReport = useCallback(async (type: 'Monitoring' | 'Settlement') => {
        if (!project) return;

        if (type === 'Monitoring') {
            // AI-powered monthly report
            setReportModalOpen(true);
            setReportLoading(true);
            setReportContent('');
            setReportError(undefined);
            setIsGeneratingReport(true);
            try {
                const projectData = {
                    ProjectID: project.ProjectID,
                    ProjectName: project.ProjectName,
                    ProjectNumber: project.ProjectNumber,
                    GroupCode: project.GroupCode,
                    Stage: project.Stage,
                    InvestorName: project.InvestorName,
                    LocationCode: project.LocationCode,
                    TotalInvestment: project.TotalInvestment,
                    PhysicalProgress: project.PhysicalProgress,
                    FinancialProgress: project.FinancialProgress,
                    DisbursedAmount: project.DisbursedAmount,
                    PlannedDisbursement: project.PlannedDisbursement,
                    ContractEndDate: project.ContractEndDate,
                    Duration: project.Duration,
                    CapitalSource: project.CapitalSource,
                    ManagementForm: project.ManagementForm,
                };
                const content = await generateMonthlyReport(projectData);
                setReportContent(content);
            } catch (error) {
                console.error('Error generating AI report:', error);
                setReportError(error instanceof Error ? error.message : 'Lỗi không xác định khi tạo báo cáo AI');
            } finally {
                setReportLoading(false);
                setIsGeneratingReport(false);
            }
        } else {
            // Settlement report — keep legacy mock for now
            setIsGeneratingReport(true);
            try {
                const report = await NationalGatewayService.generateSettlementReport(project.ProjectID);
                alert(`Đã trích xuất báo cáo quyết toán: ${report.id} thành công!`);
            } catch (error) {
                console.error(error);
            } finally {
                setIsGeneratingReport(false);
            }
        }
    }, [project]);

    const handleDeleteProject = useCallback(async () => {
        if (!project) return;
        setIsDeleting(true);
        try {
            await ProjectService.delete(project.ProjectID);
            await queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.removeQueries({ queryKey: ['project-capital', project.ProjectID] });
            queryClient.removeQueries({ queryKey: ['capital-plans', project.ProjectID] });
            queryClient.removeQueries({ queryKey: ['disbursements', project.ProjectID] });
            navigate('/projects');
        } catch (err) {
            console.error('Delete project failed:', err);
            alert('Xoá dự án thất bại. Vui lòng thử lại.');
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    }, [project, queryClient, navigate]);

    const handleEditSave = useCallback(async (data: Partial<Project>) => {
        if (!project) return;
        try {
            await ProjectService.update(project.ProjectID, data);
            // Refresh project data
            const updated = await ProjectService.getById(project.ProjectID);
            if (updated) setProject(updated);
            // Invalidate caches
            await queryClient.invalidateQueries({ queryKey: ['projects'] });
        } catch (err) {
            console.error('Update project failed:', err);
            throw err;
        }
    }, [project, queryClient]);

    // ─── Render ───
    if (loading) return <ProjectDetailSkeleton />;
    if (!project) return <div className="flex h-screen items-center justify-center font-bold text-gray-500 dark:text-slate-400">Dự án không tồn tại.</div>;

    return (
        <div className={`flex flex-col relative ${inPanel ? 'h-screen' : 'h-[calc(100vh-120px)]'} bg-[#F8FAFC] dark:bg-slate-900`}>
            {/* Fixed Header + Tabs — does NOT scroll */}
            <div className={`shrink-0 px-4 ${activeTab === 'operations' ? 'pt-2' : inPanel ? 'pt-2' : 'pt-4'}`}>
                {/* 1. Header — compact when in panel mode */}
                <ProjectHeader
                    project={project}
                    onSync={handleSync}
                    isSyncing={isSyncing}
                    syncResult={syncResult}
                    onDelete={() => setShowDeleteModal(true)}
                    onEdit={() => setShowEditModal(true)}
                    compact={activeTab === 'operations' || inPanel}
                    hideBackButton={inPanel}
                />

                {/* 2. Tab Navigation */}
                <div className={`border-b border-gray-200 dark:border-slate-700 flex gap-1 ${activeTab === 'operations' ? 'mt-2' : inPanel ? 'mt-1' : 'mt-4'} overflow-x-auto scrollbar-hide`}>
                    {TAB_DEFINITIONS.map(t => (
                        <button
                            key={t.id} onClick={() => setActiveTab(t.id)}
                            className={`${activeTab === 'operations' || inPanel ? 'py-2' : 'py-3'} px-2 text-xs font-black border-b-2 transition-all flex items-center gap-1.5 tracking-wider whitespace-nowrap ${activeTab === t.id ? 'border-amber-600 text-amber-700 dark:border-amber-400 dark:text-amber-400' : 'border-transparent text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'}`}
                            title={t.label}
                        >
                            <t.icon className="w-3.5 h-3.5" />
                            <span className={inPanel ? '' : ''}>{inPanel ? t.shortLabel : t.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. Tab Content — Operations stays mounted to avoid re-init */}
            {activeTab !== 'operations' && (
                <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6">
                    {activeTab === 'info' && (
                        <div className="space-y-4">
                            <AISummaryWidget projectId={project.ProjectID} />
                            <ProjectInfoTab
                                project={project}
                                projectMembers={projectMembers}
                                projectPackages={packages}
                                isSyncing={isSyncing}
                                syncResult={syncResult}
                                isGeneratingReport={isGeneratingReport}
                                onGenerateReport={handleGenerateReport}
                                onViewMember={(employeeId) => {
                                    console.log('View member:', employeeId);
                                }}
                                onViewPackage={(packageId) => {
                                    setActiveTab('packages');
                                }}
                                onStageChange={async (newStage, entry) => {
                                    const stageToStatus: Record<string, number> = {
                                        'Preparation': 1,
                                        'Execution': 2,
                                        'Completion': 3,
                                    };
                                    const newStatus = stageToStatus[newStage] || 1;
                                    setProject(prev => prev ? {
                                        ...prev,
                                        Stage: newStage,
                                        Status: newStatus as any,
                                        StageHistory: [...(prev.StageHistory || []), entry]
                                    } : null);
                                    try {
                                        await ProjectService.update(project.ProjectID, {
                                            Stage: newStage,
                                            Status: newStatus as any,
                                        } as any);
                                    } catch (err) {
                                        console.error('Failed to persist stage change:', err);
                                    }
                                }}
                                onHistoryUpdate={(history) => {
                                    setProject(prev => prev ? { ...prev, StageHistory: history } : null);
                                }}
                                canEditLifecycle={true}
                                onEditProject={() => setShowEditModal(true)}
                            />
                        </div>
                    )}
                    {activeTab === 'plan' && (
                        <ProjectPlanTab
                            tasks={tasks}
                            projectID={project.ProjectID}
                            onSaveTask={(t) => saveTask(t)}
                            groupCode={project.GroupCode}
                            isODA={project.IsODA}
                            project={project}
                        />
                    )}
                    {activeTab === 'packages' && (
                        <ProjectPackagesTab
                            projectID={project.ProjectID}
                            project={project}
                            openPackageId={openPackageId}
                            initialDetailTab={initialDetailTab}
                        />
                    )}
                    {activeTab === 'capital' && (
                        <div className="space-y-4">
                            <AIForecastChart
                                projectId={project.ProjectID}
                                currentDisbursementRate={project.PaymentProgress || project.FinancialProgress || 0}
                            />
                            <ProjectCapitalTab projectID={project.ProjectID} />
                        </div>
                    )}
                    {activeTab === 'documents' && (
                        <div className="space-y-4">
                            <AICompliancePanel projectId={project.ProjectID} />
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setShowDrafter(true)}
                                    className="flex items-center gap-2 px-4 py-2 text-white text-sm font-bold rounded-xl shadow-lg transition-all"
                                    style={{ background: 'linear-gradient(135deg, #5A4A25 0%, #D4A017 100%)' }}
                                >
                                    <Sparkles className="w-4 h-4" /> Soạn văn bản AI
                                </button>
                            </div>
                            <ProjectDocumentsTab
                                projectID={project.ProjectID}
                                projectStage={project.Stage || ProjectStage.Execution}
                                investmentPolicy={(project as any).InvestmentPolicy}
                                feasibilityStudy={(project as any).FeasibilityStudy}
                            />
                        </div>
                    )}
                    {activeTab === 'tt24' && (
                        <div className="space-y-4">
                            <ProjectComplianceTab
                                project={project}
                                onUpdate={(updated) => {
                                    setProject(prev => prev ? { ...prev, ...updated } : null);
                                }}
                            />
                        </div>
                    )}
                </div>
            )}


            {/* Operations tab: always mounted after first visit, hidden via visibility */}
            {opsMounted && (
                <div
                    className={`flex-1 min-h-0 ${activeTab === 'operations' ? '' : 'absolute inset-0 pointer-events-none'}`}
                    style={activeTab === 'operations' ? undefined : { visibility: 'hidden', zIndex: -1 }}
                >
                    <ProjectOperationsTab projectID={project.ProjectID} />
                </div>
            )}

            {/* ─── Delete Confirmation Modal ─── */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteProject}
                title="Xoá dự án"
                message={`Bạn có chắc muốn xoá dự án "${project.ProjectName}"?\n\nHành động này không thể hoàn tác. Tất cả dữ liệu liên quan (công việc, tài liệu, gói thầu, hợp đồng, vốn, giải ngân...) sẽ bị xoá.`}
                confirmText="Xoá dự án"
                cancelText="Hủy"
                variant="danger"
                isLoading={isDeleting}
            />

            {/* ─── Edit Project Modal (reuse CreateProjectModal in edit mode) ─── */}
            <CreateProjectModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSave={async (data, members) => {
                    await handleEditSave(data as Partial<Project>);
                    setShowEditModal(false);
                }}
                editProject={project}
            />

            {/* ─── AI Document Drafter Modal ─── */}
            <AIDocumentDrafter
                projectId={project.ProjectID}
                projectName={project.ProjectName}
                isOpen={showDrafter}
                onClose={() => setShowDrafter(false)}
            />

            {/* ─── AI Monthly Report Modal ─── */}
            <AIReportModal
                isOpen={reportModalOpen}
                onClose={() => setReportModalOpen(false)}
                reportContent={reportContent}
                isLoading={reportLoading}
                error={reportError}
                projectName={project.ProjectName}
                onRegenerate={() => handleGenerateReport('Monitoring')}
            />
        </div>
    );
};

export default ProjectDetail;
