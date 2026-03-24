import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ProjectService from '../../../../services/ProjectService';
import ApiClient from '../../../../services/api';
import { BiddingPackage, ProcurementPlan, PackageStatus, Project } from '../../../../types';
import { formatCurrency, formatDate } from '../../../../utils/format';
import { BiddingPackageModal } from '../BiddingPackageModal';
import { BiddingPackageDetail } from '../BiddingPackageDetail';
import { BiddingImportModal } from '../BiddingImportModal';
import { KHLCNTExportModal } from '../KHLCNTExportModal';
import { getMSCSummary, countPendingRequirements, getMSCPlanLink, getMSCPackageLink } from '../../../../utils/mscCompliance';
import { exportBiddingPackagesToExcel } from '../../../../utils/biddingExcelIO';
import { supabase } from '../../../../lib/supabase';
import { biddingPackageToDb } from '../../../../lib/dbMappers';
import {
    Briefcase, CheckCircle2, FileText, Search, Plus,
    MoreVertical, Eye, Edit, Trash2, ExternalLink,
    Copy, X, AlertTriangle, Loader2, Clock, Circle, Download, Upload,
    GripVertical, ChevronDown, ChevronRight, Globe, Bell, Link2,
    FolderPlus, Settings, Save, Layers, MoreHorizontal
} from 'lucide-react';

// ========================================
// PROJECT PACKAGES TAB - Grouped by KHLCNT + Drag Reorder + MSC Compliance
// ========================================

interface ProjectPackagesTabProps {
    projectID: string;
    project?: Project | null;
    /** Auto-open this package's detail (from PaymentList deep-link) */
    openPackageId?: string | null;
    /** Initial tab for BiddingPackageDetail ('settlement' for payments deep-link) */
    initialDetailTab?: 'khlcnt' | 'selection' | 'contract' | 'settlement';
}

interface PlanGroup {
    key: string;
    name: string;
    decisionNumber?: string;
    decisionDate?: string;
    mscPlanCode?: string;
    packages: BiddingPackage[];
}

export const ProjectPackagesTab: React.FC<ProjectPackagesTabProps> = ({ projectID, project, openPackageId, initialDetailTab }) => {
    const queryClient = useQueryClient();

    const { data: packages, isLoading, error } = useQuery({
        queryKey: ['project-packages', projectID],
        queryFn: () => ProjectService.getPackagesByProject(projectID)
    });

    // Fetch KHLCNT plans
    const { data: plans } = useQuery({
        queryKey: ['project-plans', projectID],
        queryFn: () => ProjectService.getPlansByProject(projectID)
    });

    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const importAfterCreateRef = useRef(false);

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isDeleteAllConfirmOpen, setIsDeleteAllConfirmOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<BiddingPackage | null>(null);

    // Auto-open package detail when deep-linked from PaymentList
    const [autoOpenProcessed, setAutoOpenProcessed] = useState<string | null>(null);
    React.useEffect(() => {
        if (openPackageId && packages && packages.length > 0 && autoOpenProcessed !== openPackageId) {
            // Find the package by ID, or find via contract's PackageID
            const targetPkg = packages.find(p => p.PackageID === openPackageId);
            if (targetPkg) {
                setSelectedPackage(targetPkg);
                setIsDetailModalOpen(true);
                setAutoOpenProcessed(openPackageId);
            }
        }
    }, [openPackageId, packages, autoOpenProcessed]);

    // Dropdown state
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // Checkbox selection for KHLCNT export
    const [selectedPackageIds, setSelectedPackageIds] = useState<Set<string>>(new Set());

    // KHLCNT management states
    const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<ProcurementPlan | null>(null);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [newPlanName, setNewPlanName] = useState('');
    const [newPlanCode, setNewPlanCode] = useState('');
    const [newPlanType, setNewPlanType] = useState<'EGP' | 'Legacy'>('EGP');
    const [newPlanDecision, setNewPlanDecision] = useState('');
    const [newPlanDecisionDate, setNewPlanDecisionDate] = useState('');
    const [newPlanMSC, setNewPlanMSC] = useState('');
    const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
    const [confirmDeletePlan, setConfirmDeletePlan] = useState<{ planId: string; planName: string; packageCount: number } | null>(null);
    const [showMoreActions, setShowMoreActions] = useState(false);
    const moreActionsRef = useRef<HTMLDivElement>(null);
    const [isMscDismissed, setIsMscDismissed] = useState(false);
    const [showColumnPicker, setShowColumnPicker] = useState(false);
    const columnPickerRef = useRef<HTMLDivElement>(null);
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
        description: true,
        price: true,
        fundingSource: true,
        selectionMethod: true,
        selectionProcedure: true,
        selectionDuration: true,
        selectionStartDate: true,
        contractType: true,
        duration: true,
        hasOption: false,
        status: true,
        msc: true,
    });

    const COLUMN_LABELS: Record<string, string> = {
        description: 'Tóm tắt công việc',
        price: 'Giá gói thầu',
        fundingSource: 'Nguồn vốn',
        selectionMethod: 'Hình thức LCNT',
        selectionProcedure: 'Phương thức LCNT',
        selectionDuration: 'TG tổ chức LCNT',
        selectionStartDate: 'TG bắt đầu LCNT',
        contractType: 'Loại hợp đồng',
        duration: 'TG thực hiện',
        hasOption: 'Tùy chọn mua thêm',
        status: 'Trạng thái',
        msc: 'MSC',
    };

    // Close more actions dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (moreActionsRef.current && !moreActionsRef.current.contains(e.target as Node)) {
                setShowMoreActions(false);
            }
        };
        if (showMoreActions) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMoreActions]);

    // Close column picker on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (columnPickerRef.current && !columnPickerRef.current.contains(e.target as Node)) {
                setShowColumnPicker(false);
            }
        };
        if (showColumnPicker) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showColumnPicker]);

    // Accordion state for plan groups
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['__ungrouped__']));

    // Drag state
    const [draggedPkgId, setDraggedPkgId] = useState<string | null>(null);
    const [dragOverPkgId, setDragOverPkgId] = useState<string | null>(null);

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (packageId: string) => ApiClient.delete(`/api/bidding-packages/${packageId}`, () => { }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-packages', projectID] });
            setIsDeleteConfirmOpen(false);
            setSelectedPackage(null);
        },
    });

    // Delete ALL packages mutation
    const deleteAllMutation = useMutation({
        mutationFn: async () => {
            await (supabase.from('bidding_packages') as any)
                .delete()
                .eq('project_id', projectID);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-packages', projectID] });
            setIsDeleteAllConfirmOpen(false);
        },
    });

    // Sort order mutation
    const updateSortMutation = useMutation({
        mutationFn: async (updates: { packageId: string; sortOrder: number }[]) => {
            await Promise.all(updates.map(u =>
                (supabase.from('bidding_packages') as any)
                    .update({ sort_order: u.sortOrder })
                    .eq('package_id', u.packageId)
            ));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-packages', projectID] });
        },
    });

    const getStatusColor = (status: PackageStatus) => {
        switch (status) {
            case PackageStatus.Planning: return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600';
            case PackageStatus.Posted: return 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800';
            case PackageStatus.Bidding: return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800';
            case PackageStatus.Evaluating: return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800';
            case PackageStatus.Awarded: return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800';
            case PackageStatus.Cancelled: return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800';
            default: return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600';
        }
    };

    const getStatusLabel = (status: PackageStatus) => {
        switch (status) {
            case PackageStatus.Planning: return 'Trong kế hoạch';
            case PackageStatus.Posted: return 'Đã đăng tải';
            case PackageStatus.Bidding: return 'Đang mời thầu';
            case PackageStatus.Evaluating: return 'Đang xét thầu';
            case PackageStatus.Awarded: return 'Đã có kết quả';
            case PackageStatus.Cancelled: return 'Hủy thầu';
            default: return status;
        }
    };

    const filteredPackages = packages?.filter(pkg => {
        const matchesStatus = filterStatus === 'all' || pkg.Status === filterStatus;
        const matchesSearch = pkg.PackageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pkg.PackageNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (pkg.NotificationCode?.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesStatus && matchesSearch;
    });

    // Group packages by KHLCNT plan (using real PlanID FK)
    const planGroups = useMemo((): PlanGroup[] => {
        if (!filteredPackages) return [];

        const groups = new Map<string, PlanGroup>();
        const plansMap = new Map((plans || []).map(p => [p.PlanID, p]));

        for (const pkg of filteredPackages) {
            const key = pkg.PlanID || '__ungrouped__';
            if (!groups.has(key)) {
                const plan = pkg.PlanID ? plansMap.get(pkg.PlanID) : undefined;
                groups.set(key, {
                    key,
                    name: plan?.PlanName || (key === '__ungrouped__' ? '' : `KHLCNT: ${key}`),
                    decisionNumber: plan?.DecisionNumber || pkg.PlanDecisionNumber,
                    decisionDate: plan?.DecisionDate || pkg.PlanDecisionDate,
                    mscPlanCode: plan?.MSCPlanCode || pkg.MSCPlanCode || pkg.KHLCNTCode,
                    packages: [],
                });
            }
            groups.get(key)!.packages.push(pkg);
        }

        // Sort: grouped first, ungrouped last
        const sorted = Array.from(groups.values()).sort((a, b) => {
            if (a.key === '__ungrouped__') return 1;
            if (b.key === '__ungrouped__') return -1;
            return (a.decisionDate || '').localeCompare(b.decisionDate || '');
        });

        return sorted;
    }, [filteredPackages, plans]);

    // MSC Summary for alert
    const mscSummary = useMemo(() => {
        if (!packages) return null;
        return getMSCSummary(packages);
    }, [packages]);

    // Auto-expand all groups on load
    useEffect(() => {
        if (planGroups.length > 0) {
            setExpandedGroups(new Set(planGroups.map(g => g.key)));
        }
    }, [planGroups.length]);

    // Handlers
    const handleView = (pkg: BiddingPackage) => {
        setSelectedPackage(pkg);
        setIsDetailModalOpen(true);
        setOpenDropdownId(null);
    };

    const handleEdit = (pkg: BiddingPackage) => {
        setSelectedPackage(pkg);
        setIsEditModalOpen(true);
        setOpenDropdownId(null);
    };

    const handleDelete = (pkg: BiddingPackage) => {
        setSelectedPackage(pkg);
        setIsDeleteConfirmOpen(true);
        setOpenDropdownId(null);
    };

    const handleCopyTBMT = (code: string) => {
        navigator.clipboard.writeText(getMSCPackageLink(code));
        setOpenDropdownId(null);
    };

    const confirmDelete = () => {
        if (selectedPackage) {
            deleteMutation.mutate(selectedPackage.PackageID);
        }
    };

    const toggleGroup = (key: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    // Drag & Drop handlers
    const handleDragStart = (e: React.DragEvent, pkgId: string) => {
        e.dataTransfer.effectAllowed = 'move';
        setDraggedPkgId(pkgId);
    };

    const handleDragOver = (e: React.DragEvent, pkgId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverPkgId(pkgId);
    };

    const handleDragLeave = () => {
        setDragOverPkgId(null);
    };

    const handleDrop = (e: React.DragEvent, targetPkgId: string, groupPackages: BiddingPackage[]) => {
        e.preventDefault();
        if (!draggedPkgId || draggedPkgId === targetPkgId) {
            setDraggedPkgId(null);
            setDragOverPkgId(null);
            return;
        }

        const fromIdx = groupPackages.findIndex(p => p.PackageID === draggedPkgId);
        const toIdx = groupPackages.findIndex(p => p.PackageID === targetPkgId);
        if (fromIdx === -1 || toIdx === -1) return;

        // Reorder
        const reordered = [...groupPackages];
        const [moved] = reordered.splice(fromIdx, 1);
        reordered.splice(toIdx, 0, moved);

        // Update sort orders
        const updates = reordered.map((pkg, idx) => ({
            packageId: pkg.PackageID,
            sortOrder: idx + 1,
        }));

        updateSortMutation.mutate(updates);
        setDraggedPkgId(null);
        setDragOverPkgId(null);
    };

    const handleDragEnd = () => {
        setDraggedPkgId(null);
        setDragOverPkgId(null);
    };

    // KHLCNT Plan mutations
    const createPlanMutation = useMutation({
        mutationFn: async () => {
            return ProjectService.createPlan({
                ProjectID: projectID,
                PlanName: newPlanName,
                PlanCode: newPlanCode || undefined,
                PlanType: newPlanType,
                DecisionNumber: newPlanDecision || undefined,
                DecisionDate: newPlanDecisionDate || undefined,
                MSCPlanCode: newPlanMSC || undefined,
                Status: 'Active',
            });
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['project-plans', projectID] });
            setIsCreatePlanOpen(false);
            setNewPlanName(''); setNewPlanCode(''); setNewPlanDecision('');
            setNewPlanDecisionDate(''); setNewPlanMSC('');

            if (importAfterCreateRef.current && data?.PlanID) {
                setSelectedPlanId(data.PlanID);
                setIsImportModalOpen(true);
            }
            importAfterCreateRef.current = false;
        },
    });

    const deletePlanMutation = useMutation({
        mutationFn: async (planId: string) => {
            console.log('Deleting plan:', planId);
            await ProjectService.deletePlan(planId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-plans', projectID] });
            queryClient.invalidateQueries({ queryKey: ['project-packages', projectID] });
            setDeletingPlanId(null);
        },
        onError: (err: any) => {
            console.error('Delete plan error:', err);
            alert(`Lỗi xóa KHLCNT: ${err.message}`);
            setDeletingPlanId(null);
        },
    });

    const resetPlanForm = () => {
        setNewPlanName(''); setNewPlanCode(''); setNewPlanDecision('');
        setNewPlanDecisionDate(''); setNewPlanMSC(''); setNewPlanType('EGP');
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500 dark:text-slate-400">Đang tải dữ liệu gói thầu...</div>;
    if (error && (!packages || packages.length === 0)) return (
        <div className="space-y-6">
            <div className="p-8 text-center">
                <FileText className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-slate-400 mb-4">Chưa có dữ liệu gói thầu</p>
                <div className="flex justify-center gap-2">
                    <button
                        onClick={() => setIsCreatePlanOpen(true)}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg flex items-center gap-2 hover:bg-primary-700 transition-colors text-sm font-medium shadow-sm"
                    >
                        <FolderPlus className="w-4 h-4" /> Thêm KHLCNT
                    </button>
                </div>
            </div>
            <BiddingPackageModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} projectID={projectID} project={project} />
            <BiddingImportModal isOpen={isImportModalOpen} onClose={() => { setIsImportModalOpen(false); queryClient.invalidateQueries({ queryKey: ['project-packages', projectID] }); }} projectID={projectID} project={project} />
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header / Statistics */}
            <div className="rounded-xl p-3">
                {/* Main Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {/* Total Packages */}
                    <div className="stat-card stat-card-blue cursor-default">
                        <div className="flex items-center justify-between w-full relative z-10 mb-1">
                            <span className="stat-card-label">Tổng số gói thầu</span>
                            <div className="stat-card-icon"><Briefcase className="w-5 h-5" /></div>
                        </div>
                        <h3 className="stat-card-value tabular-nums">{packages?.length || 0}</h3>
                    </div>

                    {/* Total Value */}
                    <div className="stat-card stat-card-amber cursor-default">
                        <div className="flex items-center justify-between w-full relative z-10 mb-2">
                            <span className="stat-card-label">Tổng giá trị (DT)</span>
                            <div className="stat-card-icon"><FileText className="w-5 h-5" /></div>
                        </div>
                        <h3 className="stat-card-value tabular-nums text-2xl truncate">
                            {formatCurrency(packages?.reduce((sum, p) => sum + (p.Price || 0), 0) || 0)}
                        </h3>
                    </div>

                    {/* Awarded Packages */}
                    <div className="stat-card stat-card-emerald cursor-default">
                        <div className="flex items-center justify-between w-full relative z-10 mb-2">
                            <span className="stat-card-label">Đã có kết quả</span>
                            <div className="stat-card-icon"><CheckCircle2 className="w-5 h-5" /></div>
                        </div>
                        <h3 className="stat-card-value tabular-nums">
                            {packages?.filter(p => p.Status === PackageStatus.Awarded).length || 0}
                            <span className="text-sm font-bold text-emerald-600/60 dark:text-emerald-400/60 ml-1">/{packages?.length || 0}</span>
                        </h3>
                    </div>

                    {/* In Progress */}
                    <div className="stat-card stat-card-violet cursor-default">
                        <div className="flex items-center justify-between w-full relative z-10 mb-2">
                            <span className="stat-card-label">Đang thực hiện</span>
                            <div className="stat-card-icon"><Clock className="w-5 h-5" /></div>
                        </div>
                        <h3 className="stat-card-value tabular-nums">
                            {packages?.filter(p => p.Status === PackageStatus.Bidding || p.Status === PackageStatus.Evaluating).length || 0}
                        </h3>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Tiến độ hoàn thành Đấu thầu</span>
                        <span className="text-sm font-bold text-gray-800 dark:text-slate-100 tabular-nums">
                            {(packages?.length ?? 0) > 0
                                ? Math.round((packages!.filter(p => p.Status === PackageStatus.Awarded).length / packages!.length) * 100)
                                : 0}%
                        </span>
                    </div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
                        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(packages?.length ?? 0) > 0 ? (packages!.filter(p => p.Status === PackageStatus.Awarded).length / packages!.length) * 100 : 0}%` }} title="Đã có kết quả" />
                        <div className="h-full bg-amber-500 transition-all" style={{ width: `${(packages?.length ?? 0) > 0 ? (packages!.filter(p => p.Status === PackageStatus.Evaluating).length / packages!.length) * 100 : 0}%` }} title="Đang xét thầu" />
                        <div className="h-full bg-blue-500 transition-all" style={{ width: `${(packages?.length ?? 0) > 0 ? (packages!.filter(p => p.Status === PackageStatus.Bidding).length / packages!.length) * 100 : 0}%` }} title="Đang mời thầu" />
                        <div className="h-full bg-indigo-500 transition-all" style={{ width: `${(packages?.length ?? 0) > 0 ? (packages!.filter(p => p.Status === PackageStatus.Posted).length / packages!.length) * 100 : 0}%` }} title="Đã đăng tải" />
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span><span className="text-gray-600 dark:text-slate-400">Đã có kết quả ({packages?.filter(p => p.Status === PackageStatus.Awarded).length || 0})</span></span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span><span className="text-gray-600 dark:text-slate-400">Đang xét thầu ({packages?.filter(p => p.Status === PackageStatus.Evaluating).length || 0})</span></span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span><span className="text-gray-600 dark:text-slate-400">Đang mời thầu ({packages?.filter(p => p.Status === PackageStatus.Bidding).length || 0})</span></span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span><span className="text-gray-600 dark:text-slate-400">Đã đăng tải ({packages?.filter(p => p.Status === PackageStatus.Posted).length || 0})</span></span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-300"></span><span className="text-gray-600 dark:text-slate-400">Trong kế hoạch ({packages?.filter(p => p.Status === PackageStatus.Planning).length || 0})</span></span>
                    </div>
                </div>
            </div>

            {/* MSC Compliance Alert */}
            {mscSummary && mscSummary.packagesNeedAction > 0 && !isMscDismissed && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-4 relative">
                    <button
                        onClick={() => setIsMscDismissed(true)}
                        className="absolute top-2 right-2 p-1 text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
                        title="Ẩn thông báo"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="flex items-start gap-3 pr-6">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                            <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-amber-800 dark:text-amber-200">
                                Cần đăng tải lên muasamcong.vn
                            </h4>
                            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                <span className="font-bold">{mscSummary.packagesNeedAction}</span> gói thầu có tài liệu cần đăng tải
                                ({mscSummary.totalPending} tài liệu). Theo Luật Đấu thầu 2023, CDT phải đăng tải đúng thời hạn.
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {mscSummary.details.slice(0, 3).map((d, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 rounded text-[10px] font-medium">
                                        <AlertTriangle className="w-3 h-3" />
                                        {d.packageName.length > 30 ? d.packageName.slice(0, 30) + '...' : d.packageName}: {d.items.join(', ')}
                                    </span>
                                ))}
                                {mscSummary.details.length > 3 && (
                                    <span className="text-[10px] text-amber-600 dark:text-amber-400">
                                        +{mscSummary.details.length - 3} gói khác...
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex gap-2">
                    <div className="relative"  ref={columnPickerRef}>
                        <button
                            onClick={() => setShowColumnPicker(!showColumnPicker)}
                            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
                            title="Hiển thị/ẩn cột"
                        >
                            <Settings size={14} />
                            <span className="hidden sm:inline">Cột</span>
                        </button>
                        {showColumnPicker && (
                            <div className="absolute left-0 top-full mt-1 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 z-30 py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                                <div className="px-3 py-1.5 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Hiển thị cột</div>
                                {Object.entries(COLUMN_LABELS).map(([key, label]) => (
                                    <label key={key} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={visibleColumns[key]}
                                            onChange={(e) => setVisibleColumns(prev => ({ ...prev, [key]: e.target.checked }))}
                                            className="w-3.5 h-3.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <span className="text-xs text-gray-700 dark:text-slate-300">{label}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm gói thầu..."
                            className="pl-9 pr-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-64 bg-white dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 dark:text-slate-200"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value={PackageStatus.Planning}>Trong kế hoạch</option>
                        <option value={PackageStatus.Posted}>Đã đăng tải</option>
                        <option value={PackageStatus.Bidding}>Đang mời thầu</option>
                        <option value={PackageStatus.Evaluating}>Đang xét thầu</option>
                        <option value={PackageStatus.Awarded}>Đã có kết quả</option>
                    </select>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsExportModalOpen(true)}
                        disabled={selectedPackageIds.size === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                        <Download size={16} />
                        <span>Xuất VB KHLCNT {selectedPackageIds.size > 0 && `(${selectedPackageIds.size})`}</span>
                    </button>
                    <button
                        onClick={() => packages && packages.length > 0 && exportBiddingPackagesToExcel(packages, project?.ProjectName || 'DuAn')}
                        disabled={!packages || packages.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-emerald-300 dark:border-emerald-600 text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                        <Download size={16} />
                        <span>Export Excel</span>
                    </button>
                    {/* More actions dropdown (contains dangerous actions) */}
                    <div className="relative" ref={moreActionsRef}>
                        <button
                            onClick={() => setShowMoreActions(!showMoreActions)}
                            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-400 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
                        >
                            <MoreHorizontal size={16} />
                        </button>
                        {showMoreActions && (
                            <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 z-30 py-1 animate-in fade-in slide-in-from-top-2 duration-150">
                                <button
                                    onClick={() => { setIsDeleteAllConfirmOpen(true); setShowMoreActions(false); }}
                                    disabled={!packages || packages.length === 0}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Trash2 size={14} />
                                    Xóa tất cả gói thầu
                                </button>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setIsCreatePlanOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium shadow-sm shadow-primary-200"
                    >
                        <FolderPlus size={16} />
                        <span>Thêm KHLCNT</span>
                    </button>
                </div>
            </div>

            {/* KHLCNT Plans - Accordion View */}
            <div className="space-y-3">
                {/* Create Plan Form */}
                {isCreatePlanOpen && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl border-2 border-amber-300 dark:border-amber-700 shadow-lg overflow-hidden">
                        <div className="px-5 py-3 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/40 border-b border-amber-200 dark:border-amber-800">
                            <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                                <FolderPlus size={16} />
                                Tạo KHLCNT mới
                            </h3>
                        </div>
                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <input type="text" placeholder="Tên KHLCNT *" value={newPlanName} onChange={(e) => setNewPlanName(e.target.value)}
                                    className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
                                <input type="text" placeholder="Số hiệu KHLCNT (VD: PL2500231393)" value={newPlanCode} onChange={(e) => setNewPlanCode(e.target.value)}
                                    className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-amber-500" />
                                <select value={newPlanType} onChange={(e) => setNewPlanType(e.target.value as 'EGP' | 'Legacy')}
                                    className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-amber-500">
                                    <option value="EGP">KHLCNT trên hệ thống EGP mới</option>
                                    <option value="Legacy">Hệ thống cũ</option>
                                </select>
                                <input type="text" placeholder="Số QĐ phê duyệt" value={newPlanDecision} onChange={(e) => setNewPlanDecision(e.target.value)}
                                    className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-amber-500" />
                                <input type="date" placeholder="Ngày QĐ" value={newPlanDecisionDate} onChange={(e) => setNewPlanDecisionDate(e.target.value)}
                                    className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-amber-500" />
                                <input type="text" placeholder="Mã trên muasamcong.vn" value={newPlanMSC} onChange={(e) => setNewPlanMSC(e.target.value)}
                                    className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-amber-500" />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button onClick={() => setIsCreatePlanOpen(false)} className="px-4 py-2 text-sm text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">Hủy</button>
                                <button
                                    onClick={() => {
                                        importAfterCreateRef.current = false;
                                        createPlanMutation.mutate();
                                    }}
                                    disabled={!newPlanName.trim() || createPlanMutation.isPending}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white dark:bg-slate-700 border border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-400 rounded-lg disabled:opacity-50 hover:bg-amber-50 dark:hover:bg-slate-600 transition-colors shadow-sm"
                                >
                                    {createPlanMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={14} />}
                                    <span>Lưu & Đóng</span>
                                </button>
                                <button
                                    onClick={() => {
                                        importAfterCreateRef.current = true;
                                        createPlanMutation.mutate();
                                    }}
                                    disabled={!newPlanName.trim() || createPlanMutation.isPending}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium gradient-btn text-white rounded-lg disabled:opacity-50 transition-colors shadow-sm"
                                >
                                    {createPlanMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload size={14} />}
                                    <span>Lưu & Import từ Excel</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Plan Accordion Cards */}
                {plans && plans.length > 0 && plans.map((plan) => {
                    const planPackages = filteredPackages?.filter(p => p.PlanID === plan.PlanID) || [];
                    const planTotal = planPackages.reduce((sum, p) => sum + (p.Price || 0), 0);
                    const isExpanded = expandedGroups.has(plan.PlanID);

                    return (
                        <div key={plan.PlanID} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
                            {/* Plan Header - Click to expand */}
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => toggleGroup(plan.PlanID)}
                                className="w-full flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/40 border-b border-amber-100 dark:border-amber-800 hover:from-amber-100 hover:to-yellow-100 dark:hover:from-amber-950/60 dark:hover:to-yellow-950/60 transition-colors cursor-pointer select-none"
                            >
                                <div className="flex items-center gap-3">
                                    {isExpanded ? (
                                        <ChevronDown className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                    ) : (
                                        <ChevronRight className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                    )}
                                    <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                    <div className="text-left">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-bold text-amber-900 dark:text-amber-200">{plan.PlanName}</span>
                                            {plan.PlanCode && (
                                                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-amber-200/60 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 rounded">{plan.PlanCode}</span>
                                            )}
                                            <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                                                {plan.PlanType === 'EGP' ? 'EGP mới' : 'Hệ thống cũ'}
                                            </span>
                                        </div>
                                        {plan.DecisionNumber && (
                                            <span className="text-xs text-amber-700/80 dark:text-amber-400/80">
                                                QĐ: {plan.DecisionNumber}{plan.DecisionDate && ` (${new Date(plan.DecisionDate).toLocaleDateString('vi-VN')})`}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                                    {plan.MSCPlanCode && (
                                        <a href={getMSCPlanLink(plan.MSCPlanCode)} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 rounded hover:bg-blue-200 transition-colors">
                                            <Globe className="w-3 h-3" />{plan.MSCPlanCode}
                                        </a>
                                    )}
                                    <span className="px-2 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                                        {planPackages.length} gói
                                    </span>
                                    <span className="text-xs font-bold text-amber-800 dark:text-amber-200 tabular-nums">
                                        {formatCurrency(planTotal)}
                                    </span>
                                    <button
                                        onClick={() => {
                                            setConfirmDeletePlan({ planId: plan.PlanID, planName: plan.PlanName, packageCount: planPackages.length });
                                        }}
                                        disabled={deletingPlanId === plan.PlanID}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-50"
                                        title="Xóa KHLCNT"
                                    >
                                        {deletingPlanId === plan.PlanID ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                    </button>
                                </div>
                            </div>

                            {/* Expanded: Per-Plan Toolbar + Package Table */}
                            {isExpanded && (
                                <>
                                    {/* Per-plan action bar */}
                                    <div className="flex items-center justify-between px-5 py-2 bg-gray-50 dark:bg-slate-750 border-b border-gray-200 dark:border-slate-700">
                                        <span className="text-xs text-gray-500 dark:text-slate-400">Gói thầu thuộc kế hoạch này</span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { setSelectedPlanId(plan.PlanID); setIsImportModalOpen(true); }}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-700 border border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-50 dark:hover:bg-slate-600 transition-colors"
                                            >
                                                <Upload size={13} /> Import
                                            </button>
                                            <button
                                                onClick={() => { setSelectedPlanId(plan.PlanID); setIsCreateModalOpen(true); }}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                            >
                                                <Plus size={13} /> Thêm gói thầu
                                            </button>
                                        </div>
                                    </div>

                                    {/* Package Table */}
                                    {planPackages.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-xs border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                                                        <th rowSpan={2} className="border border-slate-200 dark:border-slate-800 px-1 py-3 text-center w-8"></th>
                                                        <th rowSpan={2} className="border border-slate-200 dark:border-slate-800 px-2 py-3 text-center w-10">
                                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                                checked={planPackages.length > 0 && planPackages.every(p => selectedPackageIds.has(p.PackageID))}
                                                                onChange={(e) => {
                                                                    const newSet = new Set(selectedPackageIds);
                                                                    if (e.target.checked) { planPackages.forEach(p => newSet.add(p.PackageID)); }
                                                                    else { planPackages.forEach(p => newSet.delete(p.PackageID)); }
                                                                    setSelectedPackageIds(newSet);
                                                                }} />
                                                        </th>
                                                        <th rowSpan={2} className="border border-slate-200 dark:border-slate-800 px-2 py-3 text-center w-10">TT</th>
                                                        <th colSpan={visibleColumns.description ? 2 : 1} className="border border-slate-200 dark:border-slate-800 px-2 py-3 text-center">Tên gói thầu</th>
                                                        {visibleColumns.price && <th rowSpan={2} className="border border-slate-200 dark:border-slate-800 px-2 py-3 text-center w-[110px]">Giá gói thầu<br />(Đồng)</th>}
                                                        {visibleColumns.fundingSource && <th rowSpan={2} className="border border-slate-200 dark:border-slate-800 px-2 py-3 text-center min-w-[100px]">Nguồn vốn</th>}
                                                        {visibleColumns.selectionMethod && <th rowSpan={2} className="border border-slate-200 dark:border-slate-800 px-2 py-3 text-center">Hình thức<br />lựa chọn<br />nhà thầu</th>}
                                                        {visibleColumns.selectionProcedure && <th rowSpan={2} className="border border-slate-200 dark:border-slate-800 px-2 py-3 text-center">Phương thức<br />lựa chọn<br />nhà thầu</th>}
                                                        {visibleColumns.selectionDuration && <th rowSpan={2} className="border border-slate-200 dark:border-slate-800 px-2 py-3 text-center w-[90px]">Thời gian<br />tổ chức<br />LCNT</th>}
                                                        {visibleColumns.selectionStartDate && <th rowSpan={2} className="border border-slate-200 dark:border-slate-800 px-2 py-3 text-center w-[90px]">Thời gian<br />bắt đầu<br />tổ chức<br />LCNT</th>}
                                                        {visibleColumns.contractType && <th rowSpan={2} className="border border-slate-200 dark:border-slate-800 px-2 py-3 text-center">Loại<br />hợp đồng</th>}
                                                        {visibleColumns.duration && <th rowSpan={2} className="border border-slate-200 dark:border-slate-800 px-2 py-3 text-center w-[90px]">Thời gian<br />thực hiện<br />gói thầu</th>}
                                                        {visibleColumns.hasOption && <th rowSpan={2} className="border border-slate-200 dark:border-slate-800 px-2 py-3 text-center w-[60px]">Tùy chọn<br />mua thêm</th>}
                                                        {visibleColumns.status && <th rowSpan={2} className="border border-slate-200 dark:border-slate-800 px-2 py-3 text-center w-[90px]">Trạng thái</th>}
                                                        {visibleColumns.msc && <th rowSpan={2} className="border border-slate-200 dark:border-slate-800 px-2 py-3 text-center w-[60px]">MSC</th>}
                                                        <th rowSpan={2} className="border border-slate-200 dark:border-slate-800 px-2 py-3 text-center w-10">TT</th>
                                                    </tr>
                                                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                                                        <th className="border border-slate-200 dark:border-slate-800 px-2 py-2 text-center min-w-[120px]">Tên gói thầu</th>
                                                        {visibleColumns.description && <th className="border border-slate-200 dark:border-slate-800 px-2 py-2 text-center min-w-[140px]">Tóm tắt công việc<br />chính của gói thầu</th>}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {planPackages.map((pkg, index) => {
                                                        const pendingMSC = countPendingRequirements(pkg);
                                                        return (
                                                            <tr key={pkg.PackageID}
                                                                className={`hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors cursor-pointer ${draggedPkgId === pkg.PackageID ? 'opacity-40' : ''} ${dragOverPkgId === pkg.PackageID ? 'ring-2 ring-blue-400 ring-inset' : ''}`}
                                                                draggable onDragStart={(e) => handleDragStart(e, pkg.PackageID)} onDragOver={(e) => handleDragOver(e, pkg.PackageID)} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, pkg.PackageID, planPackages)} onDragEnd={handleDragEnd}
                                                                onClick={() => handleView(pkg)}>
                                                                <td className="border border-slate-200 dark:border-slate-700 px-1 py-2 text-center cursor-grab" onClick={(e) => e.stopPropagation()}>
                                                                    <GripVertical className="w-3.5 h-3.5 text-gray-400 mx-auto" />
                                                                </td>
                                                                <td className="border border-slate-200 dark:border-slate-700 px-2 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                                                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                                        checked={selectedPackageIds.has(pkg.PackageID)}
                                                                        onChange={(e) => {
                                                                            const newSet = new Set(selectedPackageIds);
                                                                            e.target.checked ? newSet.add(pkg.PackageID) : newSet.delete(pkg.PackageID);
                                                                            setSelectedPackageIds(newSet);
                                                                        }} />
                                                                </td>
                                                                <td className="border border-slate-200 dark:border-slate-700 px-2 py-3 text-center font-bold text-slate-500 dark:text-slate-400 align-top">{index + 1}</td>
                                                                <td className="border border-slate-200 dark:border-slate-700 px-3 py-3 align-top" title={pkg.PackageName}>
                                                                    <div className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">{pkg.PackageName}</div>
                                                                    {pkg.NotificationCode && <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-mono text-blue-600 dark:text-blue-400"><Bell className="w-2.5 h-2.5" />{pkg.NotificationCode}</span>}
                                                                </td>
                                                                {visibleColumns.description && <td className="border border-slate-200 dark:border-slate-700 px-3 py-3 text-slate-600 dark:text-slate-300 align-top leading-snug">{pkg.Description || '-'}</td>}
                                                                {visibleColumns.price && <td className="border border-slate-200 dark:border-slate-700 px-2 py-3 text-right font-bold tabular-nums text-slate-800 dark:text-slate-200 align-top">{formatCurrency(pkg.Price)}</td>}
                                                                {visibleColumns.fundingSource && <td className="border border-slate-200 dark:border-slate-700 px-2 py-3 text-center text-slate-700 dark:text-slate-300 align-top">{pkg.FundingSource || '-'}</td>}
                                                                {visibleColumns.selectionMethod && <td className="border border-slate-200 dark:border-slate-700 px-2 py-3 text-center text-slate-700 dark:text-slate-300 align-top">{pkg.SelectionMethod || '-'}</td>}
                                                                {visibleColumns.selectionProcedure && <td className="border border-slate-200 dark:border-slate-700 px-2 py-3 text-center text-slate-700 dark:text-slate-300 align-top">{pkg.SelectionProcedure || pkg.BidType || '-'}</td>}
                                                                {visibleColumns.selectionDuration && <td className="border border-slate-200 dark:border-slate-700 px-2 py-3 text-center text-slate-700 dark:text-slate-300 align-top">{pkg.SelectionDuration || '45 ngày'}</td>}
                                                                {visibleColumns.selectionStartDate && <td className="border border-slate-200 dark:border-slate-700 px-2 py-3 text-center text-slate-700 dark:text-slate-300 align-top">{pkg.SelectionStartDate || '-'}</td>}
                                                                {visibleColumns.contractType && <td className="border border-slate-200 dark:border-slate-700 px-2 py-3 text-center text-slate-700 dark:text-slate-300 align-top">{pkg.ContractType === 'LumpSum' ? 'Trọn gói' : pkg.ContractType === 'UnitPrice' ? 'Đơn giá CĐ' : pkg.ContractType === 'AdjustableUnitPrice' ? 'Đơn giá ĐC' : pkg.ContractType === 'Mixed' ? 'Hỗn hợp' : pkg.ContractType || '-'}</td>}
                                                                {visibleColumns.duration && <td className="border border-slate-200 dark:border-slate-700 px-2 py-3 text-center text-slate-700 dark:text-slate-300 align-top font-medium">{pkg.Duration || '-'}</td>}
                                                                {visibleColumns.hasOption && <td className="border border-slate-200 dark:border-slate-700 px-2 py-3 text-center text-slate-700 dark:text-slate-300 align-top">{pkg.HasOption ? 'Có' : 'Không'}</td>}
                                                                {visibleColumns.status && <td className="border border-slate-200 dark:border-slate-700 px-2 py-3 text-center align-top">
                                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold ${getStatusColor(pkg.Status)}`}>
                                                                        {pkg.Status === PackageStatus.Planning && <Circle className="w-2.5 h-2.5" />}
                                                                        {pkg.Status === PackageStatus.Posted && <FileText className="w-2.5 h-2.5" />}
                                                                        {pkg.Status === PackageStatus.Bidding && <Clock className="w-2.5 h-2.5 animate-pulse" />}
                                                                        {pkg.Status === PackageStatus.Evaluating && <AlertTriangle className="w-2.5 h-2.5" />}
                                                                        {pkg.Status === PackageStatus.Awarded && <CheckCircle2 className="w-2.5 h-2.5" />}
                                                                        {getStatusLabel(pkg.Status)}
                                                                    </span>
                                                                </td>}
                                                                {visibleColumns.msc && <td className="border border-slate-200 dark:border-slate-700 px-2 py-3 text-center align-top" onClick={(e) => e.stopPropagation()}>
                                                                    {pendingMSC > 0 ? (
                                                                        <button onClick={() => handleView(pkg)} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-[10px] font-bold hover:bg-red-200 transition-colors" title={`${pendingMSC} tài liệu cần đăng tải`}>
                                                                            <AlertTriangle className="w-3 h-3" />{pendingMSC}
                                                                        </button>
                                                                    ) : (
                                                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-[10px]" title="Đã hoàn thành">
                                                                            <CheckCircle2 className="w-3 h-3" />
                                                                        </span>
                                                                    )}
                                                                </td>}
                                                                <td className="border border-slate-200 dark:border-slate-700 px-2 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                                                    <ActionDropdown pkg={pkg} isOpen={openDropdownId === pkg.PackageID} onToggle={() => setOpenDropdownId(openDropdownId === pkg.PackageID ? null : pkg.PackageID)} onClose={() => setOpenDropdownId(null)} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} onCopyTBMT={handleCopyTBMT} />
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                                {planPackages.length > 0 && (
                                                    <tfoot>
                                                        <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-bold border-t-2 border-slate-200 dark:border-slate-700/50">
                                                            <td colSpan={4 + (visibleColumns.description ? 1 : 0)} className="border border-slate-200 dark:border-slate-800 px-3 py-2 text-right text-xs uppercase tracking-wider">
                                                                Tổng ({planPackages.length} gói):
                                                            </td>
                                                            {visibleColumns.price && <td className="border border-slate-200 dark:border-slate-800 px-2 py-2 text-right text-slate-900 dark:text-slate-100 tabular-nums text-sm">
                                                                {formatCurrency(planTotal)}
                                                            </td>}
                                                            <td colSpan={Object.values(visibleColumns).filter(Boolean).length - (visibleColumns.price ? 1 : 0) - (visibleColumns.description ? 1 : 0) + 1} className="border border-slate-200 dark:border-slate-800"></td>
                                                        </tr>
                                                    </tfoot>
                                                )}
                                            </table>
                                        </div>
                                    ) : (() => {
                                        const allPlanPkgs = packages?.filter(p => p.PlanID === plan.PlanID) || [];
                                        const isFiltered = allPlanPkgs.length > 0 && planPackages.length === 0;
                                        return (
                                            <div className="p-6 text-center">
                                                {isFiltered ? (
                                                    <>
                                                        <Search className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                                                        <p className="text-sm text-gray-400 dark:text-slate-500 mb-1">Không tìm thấy gói thầu phù hợp</p>
                                                        <p className="text-xs text-gray-400 dark:text-slate-500 mb-3">Có {allPlanPkgs.length} gói trong KHLCNT nhưng không khớp bộ lọc</p>
                                                        <button onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}
                                                            className="px-3 py-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors">
                                                            Xóa bộ lọc
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FileText className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                                                        <p className="text-sm text-gray-400 dark:text-slate-500 mb-3">Chưa có gói thầu trong KHLCNT này</p>
                                                        <div className="flex justify-center gap-2">
                                                            <button onClick={() => { setSelectedPlanId(plan.PlanID); setIsImportModalOpen(true); }}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-700 border border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-50 transition-colors">
                                                                <Upload size={13} /> Import Excel
                                                            </button>
                                                            <button onClick={() => { setSelectedPlanId(plan.PlanID); setIsCreateModalOpen(true); }}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                                                                <Plus size={13} /> Thêm gói thầu
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })()}

                                </>
                            )}
                        </div>
                    );
                })}



                {/* No plans & no packages */}
                {(!plans || plans.length === 0) && (!filteredPackages || filteredPackages.length === 0) && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-12 text-center">
                        <FileText className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto" />
                        <p className="text-gray-500 dark:text-slate-400 mt-2">Chưa có KHLCNT và gói thầu nào</p>
                        <p className="text-sm text-gray-400 dark:text-slate-500 mt-1 mb-4">Nhấn "Thêm KHLCNT" để bắt đầu</p>
                        <button
                            onClick={() => setIsCreatePlanOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium shadow-sm"
                        >
                            <FolderPlus size={16} />
                            <span>Thêm KHLCNT</span>
                        </button>
                    </div>
                )}
            </div>


            {/* Detail Modal */}
            <BiddingPackageDetail
                isOpen={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setSelectedPackage(null);
                }}
                package_data={selectedPackage}
                onEdit={(pkg) => {
                    setIsDetailModalOpen(false);
                    handleEdit(pkg);
                }}
                initialTab={initialDetailTab}
            />

            {/* Delete Confirmation */}
            {isDeleteConfirmOpen && selectedPackage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsDeleteConfirmOpen(false)} />
                    <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 animate-scale-in">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">Xác nhận xóa</h3>
                                <p className="text-sm text-gray-500 dark:text-slate-400">Hành động này không thể hoàn tác</p>
                            </div>
                        </div>
                        <p className="text-gray-600 dark:text-slate-300 mb-6">
                            Bạn có chắc chắn muốn xóa gói thầu <strong>{selectedPackage.PackageNumber}</strong>?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsDeleteConfirmOpen(false)} className="px-4 py-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">Hủy</button>
                            <button onClick={confirmDelete} disabled={deleteMutation.isPending} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
                                {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete ALL Confirmation */}
            {isDeleteAllConfirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsDeleteAllConfirmOpen(false)} />
                    <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 animate-scale-in">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">Xóa tất cả gói thầu</h3>
                                <p className="text-sm text-gray-500 dark:text-slate-400">Hành động này không thể hoàn tác</p>
                            </div>
                        </div>
                        <p className="text-gray-600 dark:text-slate-300 mb-6">
                            Bạn có chắc chắn muốn xóa <strong className="text-red-600">{packages?.length || 0} gói thầu</strong> của dự án này?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsDeleteAllConfirmOpen(false)} className="px-4 py-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">Hủy</button>
                            <button onClick={() => deleteAllMutation.mutate()} disabled={deleteAllMutation.isPending} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
                                {deleteAllMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                Xóa tất cả
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Delete KHLCNT Plan */}
            {confirmDeletePlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDeletePlan(null)} />
                    <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 animate-scale-in">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">Xóa KHLCNT</h3>
                                <p className="text-sm text-gray-500 dark:text-slate-400">Hành động này không thể hoàn tác</p>
                            </div>
                        </div>
                        <p className="text-gray-600 dark:text-slate-300 mb-6">
                            Xóa KHLCNT <strong>"{confirmDeletePlan.planName}"</strong> và tất cả <strong className="text-red-600">{confirmDeletePlan.packageCount} gói thầu</strong> thuộc kế hoạch này?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setConfirmDeletePlan(null)} className="px-4 py-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">Hủy</button>
                            <button
                                onClick={() => {
                                    setDeletingPlanId(confirmDeletePlan.planId);
                                    deletePlanMutation.mutate(confirmDeletePlan.planId);
                                    setConfirmDeletePlan(null);
                                }}
                                disabled={deletePlanMutation.isPending}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                                {deletePlanMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                Xóa KHLCNT
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* KHLCNT Export Modal */}
            <KHLCNTExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                packages={(packages || []).filter(p => selectedPackageIds.has(p.PackageID))}
                project={project}
            />

            {/* Import Modal */}
            <BiddingImportModal
                isOpen={isImportModalOpen}
                onClose={() => { setIsImportModalOpen(false); setSelectedPlanId(null); }}
                projectId={projectID}
                planId={selectedPlanId || undefined}
            />

            {/* Package Create/Edit Modal (single instance) */}
            <BiddingPackageModal
                isOpen={isCreateModalOpen || isEditModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setIsEditModalOpen(false);
                    setSelectedPackage(null);
                    setSelectedPlanId(null);
                }}
                projectId={projectID}
                packageToEdit={selectedPackage}
                planId={selectedPlanId || undefined}
            />
        </div>
    );
};

// Action Dropdown Component
interface ActionDropdownProps {
    pkg: BiddingPackage;
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
    onView: (pkg: BiddingPackage) => void;
    onEdit: (pkg: BiddingPackage) => void;
    onDelete: (pkg: BiddingPackage) => void;
    onCopyTBMT: (code: string) => void;
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ pkg, isOpen, onToggle, onClose, onView, onEdit, onDelete, onCopyTBMT }) => {
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={(e) => { e.stopPropagation(); onToggle(); }}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
            >
                <MoreVertical size={14} />
            </button>
            {isOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 z-30 py-1 animate-in fade-in slide-in-from-top-2 duration-150">
                    <button
                        onClick={() => onView(pkg)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                    >
                        <Eye className="w-4 h-4" />
                        Xem chi tiết
                    </button>
                    <button
                        onClick={() => onEdit(pkg)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                    >
                        <Edit className="w-4 h-4" />
                        Chỉnh sửa
                    </button>
                    {pkg.NotificationCode && (
                        <>
                            <hr className="my-1 border-gray-200 dark:border-slate-700" />
                            <a
                                href={getMSCPackageLink(pkg.NotificationCode)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-700"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Xem trên MSC
                            </a>
                            <button
                                onClick={() => onCopyTBMT(pkg.NotificationCode!)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                            >
                                <Copy className="w-4 h-4" />
                                Sao chép link TBMT
                            </button>
                        </>
                    )}
                    <hr className="my-1 border-gray-200 dark:border-slate-700" />
                    <button
                        onClick={() => onDelete(pkg)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        <Trash2 className="w-4 h-4" />
                        Xóa
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProjectPackagesTab;
