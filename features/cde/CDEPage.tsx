// ═══════════════════════════════════════════════════════════════
// CDE Page — Orchestrator Component (Phase 3)
// Common Data Environment (ISO 19650 + VN Construction QLDA)
// ═══════════════════════════════════════════════════════════════

import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../hooks';
import { useCDEFolders, useCDEDocuments, useCDEStats, useCDEWorkflowHistory, useUploadCDE, useProcessWorkflowStep } from '../../hooks/useCDE';
import { CDE_WORKFLOW_STEPS, CDE_PROJECT_PHASES } from './constants';
import type { CDEDocument } from './types';
import { CDEService } from '../../services/CDEService';

import CDEHeader from './components/CDEHeader';
import CDEFolderTree from './components/CDEFolderTree';
import CDEDocumentTable from './components/CDEDocumentTable';
import CDEWorkflowPanel from './components/CDEWorkflowPanel';
import CDESubmitModal from './components/CDESubmitModal';
import CDEContractorDashboard from './components/CDEContractorDashboard';
import CDEFilterBar, { type CDEFilters } from './components/CDEFilterBar';
import CDEBatchActions from './components/CDEBatchActions';
import CDEDashboard from './components/CDEDashboard';
import CDEPermissionManager from './components/CDEPermissionManager';
import CDETransmittalForm from './components/CDETransmittalForm';
import CDEAuditLog from './components/CDEAuditLog';
import { supabase } from '../../lib/supabase';
import { FolderOpen, BarChart3, Shield, ClipboardList, ScrollText } from 'lucide-react';

const EMPTY_FILTERS: CDEFilters = { status: [], discipline: [], docType: [], dateFrom: '', dateTo: '' };

const CDEPage: React.FC = () => {
    const { currentUser, userType, contractorId } = useAuth();
    const { projects } = useProjects();

    // State
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
    const [selectedDoc, setSelectedDoc] = useState<CDEDocument | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showTransmittal, setShowTransmittal] = useState(false);
    const [filters, setFilters] = useState<CDEFilters>(EMPTY_FILTERS);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [viewMode, setViewMode] = useState<'explorer' | 'dashboard'>('explorer');
    const [activeTab, setActiveTab] = useState<'explorer' | 'analytics' | 'permissions' | 'transmittals' | 'audit'>('explorer');
    const [activePhase, setActivePhase] = useState('implementation');
    // Set default project
    React.useEffect(() => {
        if (projects.length > 0 && !selectedProjectId) {
            setSelectedProjectId(projects[0].ProjectID);
        }
    }, [projects, selectedProjectId]);

    // Auto-show contractor dashboard
    React.useEffect(() => {
        if (userType === 'contractor') setViewMode('dashboard');
    }, [userType]);

    // Queries
    const { data: folders = [], isLoading: foldersLoading } = useCDEFolders(selectedProjectId);
    const { data: docs = [], isLoading: docsLoading } = useCDEDocuments(activeFolderId);
    const { data: stats } = useCDEStats(selectedProjectId);
    const { data: workflowHistory = [] } = useCDEWorkflowHistory(selectedDoc?.doc_id || null);

    // Mutations
    const uploadMutation = useUploadCDE();
    const workflowMutation = useProcessWorkflowStep();

    // Auto-select first root folder
    React.useEffect(() => {
        if (folders.length > 0 && !activeFolderId) {
            const firstRoot = folders.find(f => !f.parent_id);
            if (firstRoot) setActiveFolderId(firstRoot.id);
        }
    }, [folders, activeFolderId]);

    const handleProjectChange = useCallback((id: string) => {
        setSelectedProjectId(id);
        setActiveFolderId(null);
        setSelectedDoc(null);
        setSelectedIds([]);
    }, []);

    const activeFolder = useMemo(() => folders.find(f => f.id === activeFolderId), [folders, activeFolderId]);

    const projectOptions = useMemo(() =>
        projects.map(p => ({ ProjectID: p.ProjectID, ProjectName: p.ProjectName })),
        [projects]
    );

    // Filtered documents
    const filteredDocs = useMemo(() => {
        let result = docs;
        if (filters.status.length > 0) result = result.filter(d => filters.status.includes(d.cde_status || 'S0'));
        if (filters.discipline.length > 0) result = result.filter(d => filters.discipline.includes(d.discipline || ''));
        if (filters.docType.length > 0) result = result.filter(d => filters.docType.includes(d.doc_type || ''));
        if (filters.dateFrom) result = result.filter(d => d.upload_date && d.upload_date >= filters.dateFrom);
        if (filters.dateTo) result = result.filter(d => d.upload_date && d.upload_date <= filters.dateTo);
        return result;
    }, [docs, filters]);

    const hasActiveFilters = filters.status.length > 0 || filters.discipline.length > 0 || filters.docType.length > 0 || !!filters.dateFrom || !!filters.dateTo;

    // File preview
    const handlePreview = useCallback(async (doc: CDEDocument) => {
        if (!doc.storage_path) return;
        const { data } = supabase.storage.from('documents').getPublicUrl(doc.storage_path);
        if (data?.publicUrl) window.open(data.publicUrl, '_blank');
    }, []);

    // Upload handler
    const handleSubmit = useCallback((data: { file: File; folderId: string; discipline: string; docType: string; notes: string }) => {
        uploadMutation.mutate({
            file: data.file,
            projectId: selectedProjectId,
            folderId: data.folderId,
            discipline: data.discipline,
            docType: data.docType,
            notes: data.notes,
            userId: currentUser?.EmployeeID || '',
            userName: currentUser?.FullName || '',
            userOrg: currentUser?.Department || 'Ban QLDA',
            contractorId: contractorId || undefined,
        }, {
            onSuccess: () => {
                setShowSubmitModal(false);
                alert('✅ Nộp hồ sơ thành công!');
            },
            onError: (err: Error) => {
                console.error('Upload error:', err);
                alert(`❌ Nộp hồ sơ thất bại: ${err.message}`);
            },
        });
    }, [uploadMutation, selectedProjectId, currentUser, contractorId]);

    // Workflow handlers
    const getNextStep = useCallback(() => {
        const STATUS_ORDER = ['S0', 'S1', 'S2', 'S3', 'A1'];
        const currentStatusIdx = STATUS_ORDER.indexOf(selectedDoc?.cde_status || 'S0');

        if (workflowHistory.length === 0 && currentStatusIdx <= 0) return CDE_WORKFLOW_STEPS[0];
        const last = workflowHistory.length > 0 ? workflowHistory[workflowHistory.length - 1] : null;
        if (last?.status === 'Rejected' || last?.status === 'Returned') return CDE_WORKFLOW_STEPS[0];
        if (last?.status === 'Pending') return CDE_WORKFLOW_STEPS.find(s => s.code === last.step_code || s.name === last.step_name);
        // Find first non-completed step based on cde_status
        const nextUncompleted = CDE_WORKFLOW_STEPS.find(s => {
            const stepTargetIdx = STATUS_ORDER.indexOf(s.nextStatus);
            return stepTargetIdx > currentStatusIdx;
        });
        return nextUncompleted || null;
    }, [workflowHistory, selectedDoc]);

    const handleWorkflow = useCallback((status: 'Approved' | 'Rejected' | 'Returned') => {
        if (!selectedDoc) return;
        const step = getNextStep();
        if (!step) return;
        workflowMutation.mutate({
            docId: selectedDoc.doc_id,
            stepName: step.name,
            stepCode: step.code,
            actorId: currentUser?.EmployeeID || '',
            actorName: currentUser?.FullName || '',
            actorRole: step.roleLabel,
            status,
            comment: status === 'Approved' ? 'Đã duyệt' : status === 'Returned' ? 'Yêu cầu bổ sung' : 'Từ chối',
        });
    }, [selectedDoc, getNextStep, workflowMutation, currentUser]);

    // Batch handlers
    const handleBatchApprove = useCallback((ids: number[]) => {
        ids.forEach(docId => {
            const step = CDE_WORKFLOW_STEPS[0]; // simplified
            workflowMutation.mutate({
                docId, stepName: step.name, stepCode: step.code,
                actorId: currentUser?.EmployeeID || '', actorName: currentUser?.FullName || '',
                actorRole: step.roleLabel, status: 'Approved', comment: 'Duyệt hàng loạt',
            });
        });
        setSelectedIds([]);
    }, [workflowMutation, currentUser]);

    const handleBatchReject = useCallback((ids: number[]) => {
        ids.forEach(docId => {
            const step = CDE_WORKFLOW_STEPS[0];
            workflowMutation.mutate({
                docId, stepName: step.name, stepCode: step.code,
                actorId: currentUser?.EmployeeID || '', actorName: currentUser?.FullName || '',
                actorRole: step.roleLabel, status: 'Rejected', comment: 'Từ chối hàng loạt',
            });
        });
        setSelectedIds([]);
    }, [workflowMutation, currentUser]);

    // Toggle doc selection
    const toggleDocSelect = useCallback((docId: number) => {
        setSelectedIds(prev => prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]);
    }, []);

    const TABS = [
        { key: 'explorer' as const, label: 'Quản lý', icon: FolderOpen },
        { key: 'analytics' as const, label: 'Thống kê', icon: BarChart3 },
        { key: 'permissions' as const, label: 'Phân quyền', icon: Shield },
        { key: 'audit' as const, label: 'Nhật ký', icon: ScrollText },
    ];

    const selectedProject = projects.find(p => p.ProjectID === selectedProjectId);

    return (
        <div className="h-full flex flex-col p-6 gap-4 overflow-hidden">
            <CDEHeader
                projects={projectOptions}
                selectedProjectId={selectedProjectId}
                onProjectChange={handleProjectChange}
                stats={stats}
                onUpload={() => setShowSubmitModal(true)}
                isUploading={uploadMutation.isPending}
                canUpload={!!activeFolderId}
                userRole={currentUser?.Role}
            />

            {/* Tab Navigation */}
            {userType !== 'contractor' && (
                <div className="flex items-center gap-1 bg-gray-100/80 dark:bg-slate-800/80 p-1 rounded-xl w-fit">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab.key
                                ? 'bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 shadow-sm'
                                : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                                }`}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    ))}
                    <button
                        onClick={() => setShowTransmittal(true)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all ml-1"
                    >
                        <ClipboardList className="w-3.5 h-3.5" />
                        Chuyển giao
                    </button>
                </div>
            )}

            {/* Contractor Dashboard */}
            {userType === 'contractor' && viewMode === 'dashboard' && (
                <CDEContractorDashboard
                    docs={docs}
                    contractorName={currentUser?.FullName || 'Nhà thầu'}
                    onViewDoc={(doc) => { setSelectedDoc(doc); setViewMode('explorer'); }}
                    onSubmitNew={() => setShowSubmitModal(true)}
                />
            )}

            {/* Tab: Explorer */}
            {activeTab === 'explorer' && (userType !== 'contractor' || viewMode === 'explorer') && (
                <>
                    <CDEBatchActions
                        selectedIds={selectedIds}
                        docs={filteredDocs}
                        onApprove={handleBatchApprove}
                        onReject={handleBatchReject}
                        onMove={() => { }}
                        onClearSelection={() => setSelectedIds([])}
                    />

                    {!selectedDoc && (
                        <CDEFilterBar
                            filters={filters}
                            onChange={setFilters}
                            onClear={() => setFilters(EMPTY_FILTERS)}
                            resultCount={filteredDocs.length}
                        />
                    )}

                    <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
                        <CDEFolderTree
                            folders={folders}
                            activeFolderId={activeFolderId}
                            isLoading={foldersLoading}
                            onSelectFolder={(id) => { setActiveFolderId(id); setSelectedDoc(null); setSelectedIds([]); }}
                            activePhase={activePhase}
                            onChangePhase={async (phase) => {
                                setActivePhase(phase);
                                // Auto-seed folders for the phase if none exist
                                const phaseConfig = CDE_PROJECT_PHASES.find(p => p.id === phase);
                                const hasPhase = folders.some(f => (f as any).phase === phase && f.parent_id !== null);
                                if (phaseConfig && !hasPhase && selectedProjectId) {
                                    await CDEService.seedPhaseFolders(selectedProjectId, phase, phaseConfig.folders);
                                }
                            }}
                        />

                        <CDEDocumentTable
                            folders={folders}
                            activeFolder={activeFolder}
                            activeFolderId={activeFolderId}
                            docs={hasActiveFilters ? filteredDocs : docs}
                            isLoading={docsLoading}
                            searchQuery={searchQuery}
                            selectedDocId={selectedDoc?.doc_id || null}
                            onSearchChange={setSearchQuery}
                            onSelectDoc={setSelectedDoc}
                            onPreview={handlePreview}
                            onUpload={() => setShowSubmitModal(true)}
                            onFolderClick={setActiveFolderId}
                            selectedIds={selectedIds}
                            onToggleSelect={toggleDocSelect}
                        />

                        {selectedDoc && (
                            <CDEWorkflowPanel
                                doc={selectedDoc}
                                workflowHistory={workflowHistory}
                                isPending={workflowMutation.isPending}
                                onApprove={() => handleWorkflow('Approved')}
                                onReject={() => handleWorkflow('Rejected')}
                                onReturn={() => handleWorkflow('Returned')}
                                onClose={() => setSelectedDoc(null)}
                            />
                        )}
                    </div>
                </>
            )}

            {/* Tab: Analytics */}
            {activeTab === 'analytics' && (
                <div className="flex-1 overflow-y-auto">
                    <CDEDashboard
                        stats={stats}
                        docs={docs}
                        projectName={selectedProject?.ProjectName || ''}
                    />
                </div>
            )}

            {/* Tab: Permissions */}
            {activeTab === 'permissions' && (
                <div className="flex-1 overflow-y-auto">
                    <CDEPermissionManager projectId={selectedProjectId} />
                </div>
            )}

            {/* Tab: Audit */}
            {activeTab === 'audit' && (
                <div className="flex-1 overflow-y-auto">
                    <CDEAuditLog projectId={selectedProjectId} />
                </div>
            )}

            {/* Modals */}
            <CDESubmitModal
                isOpen={showSubmitModal}
                folder={activeFolder}
                folders={folders}
                onClose={() => setShowSubmitModal(false)}
                onSubmit={handleSubmit}
                isPending={uploadMutation.isPending}
            />

            <CDETransmittalForm
                isOpen={showTransmittal}
                projectId={selectedProjectId}
                docs={docs}
                preSelectedDocIds={selectedIds}
                onClose={() => setShowTransmittal(false)}
                onSent={() => { setSelectedIds([]); }}
            />
        </div>
    );
};

export default CDEPage;

