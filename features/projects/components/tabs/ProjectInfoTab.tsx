import React, { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Project, ProjectStage, Employee, BiddingPackage, Contractor } from '@/types';
import {
    Landmark, FileBarChart, FileCheck, RefreshCw, Pencil,
    Clock, CheckCircle2, AlertCircle, ExternalLink, ChevronDown, ChevronUp,
    Hash, Building2, MapPin, Briefcase, Wallet, Calendar as CalendarIcon, Copy, Check
} from 'lucide-react';
import { SyncResult } from '@/services/NationalGatewayService';
import { LifecycleStepper, StageHistoryEntry } from '../LifecycleStepper';
import { DualProgressCard } from '../DualProgressCard';
import { ProjectTeamSection } from '../ProjectTeamSection';
import { ContractorsListSection } from '../ContractorsListSection';
import { ContractorDetailPanel } from '../ContractorDetailPanel';
import { RiskIndicators } from '../RiskIndicators';
import { BudgetVarianceCard } from '../BudgetVarianceCard';
import { KeyDatesWidget, KeyDate } from '../KeyDatesWidget';
import { QuickActionsPanel } from '../QuickActionsPanel';
import { LegalReferenceLink } from '../../../../components/common/LegalReferenceLink';
import { useSlidePanel } from '@/context/SlidePanelContext';

interface ProjectInfoTabProps {
    project: Project & {
        Stage?: ProjectStage;
        PhysicalProgress?: number;
        FinancialProgress?: number;
        RequiresBIM?: boolean;
        BIMStatus?: string;
        StageHistory?: StageHistoryEntry[];
        PlannedDisbursement?: number;
        ContractEndDate?: string;
    };
    projectMembers: Employee[];
    projectPackages: BiddingPackage[];
    isSyncing: boolean;
    syncResult: SyncResult | null;
    isGeneratingReport: boolean;
    onGenerateReport: (type: 'Monitoring' | 'Settlement') => void;
    onViewMember?: (employeeId: string) => void;
    onViewPackage?: (packageId: string) => void;
    onStageChange?: (newStage: ProjectStage, entry: StageHistoryEntry) => void;
    onHistoryUpdate?: (history: StageHistoryEntry[]) => void;
    onSync?: () => void;
    canEditLifecycle?: boolean;
    onEditProject?: () => void;
}

export const ProjectInfoTab: React.FC<ProjectInfoTabProps> = ({
    project,
    projectMembers,
    projectPackages,
    isSyncing,
    syncResult,
    isGeneratingReport,
    onGenerateReport,
    onViewMember,
    onViewPackage,
    onStageChange,
    onHistoryUpdate,
    onSync,
    canEditLifecycle = true,
    onEditProject
}) => {
    const [showSyncDetails, setShowSyncDetails] = useState(false);
    const { openPanel } = useSlidePanel();

    // Fetch real contractors from contracts + contractors tables
    const { data: projectContractors = [] } = useQuery<Contractor[]>({
        queryKey: ['project-contractors', project.ProjectID],
        queryFn: async () => {
            const { data: contractRows } = await supabase
                .from('contracts')
                .select('contractor_id')
                .eq('project_id', project.ProjectID)
                .not('contractor_id', 'is', null);
            if (!contractRows || contractRows.length === 0) return [];

            const uniqueIds = [...new Set(contractRows.map((r: any) => r.contractor_id))];
            const { data: contractors } = await supabase
                .from('contractors')
                .select('*')
                .in('contractor_id', uniqueIds);
            if (!contractors) return [];

            return contractors.map((c: any) => ({
                ContractorID: c.contractor_id,
                FullName: c.full_name || '',
                TaxCode: c.tax_code || '',
                Address: c.address || '',
                Representative: c.representative || '',
                ContactInfo: c.contact_info || '',
                IsForeign: c.is_foreign || false,
                CapCertCode: c.cap_cert_code || '',
                OpLicenseNo: c.op_license_no || '',
                EstablishedYear: c.established_year,
            }));
        },
        enabled: !!project.ProjectID,
    });

    // Handler: open contractor detail slide panel
    const handleViewContractor = useCallback((contractorId: string) => {
        const contractor = projectContractors.find(c => c.ContractorID === contractorId);
        openPanel({
            title: contractor?.FullName || 'Chi tiết nhà thầu',
            icon: <Building2 size={14} />,
            url: `/contractors/${contractorId}`,
            component: (
                <ContractorDetailPanel
                    contractorId={contractorId}
                    projectId={project.ProjectID}
                />
            ),
        });
    }, [openPanel, projectContractors, project.ProjectID]);

    // Calculate disbursed amount from financial progress
    const disbursedAmount = (project.FinancialProgress ?? 0) * project.TotalInvestment / 100;
    const disbursedPercent = project.TotalInvestment > 0
        ? (disbursedAmount / project.TotalInvestment) * 100
        : 0;

    // Determine sync status
    const isSynced = project.SyncStatus?.IsSynced || syncResult?.success;
    const nationalCode = syncResult?.nationalCode || project.SyncStatus?.NationalProjectCode;
    const lastSyncTime = project.SyncStatus?.LastSyncTime;

    // ═══ FETCH KEY DATES FROM MULTIPLE SOURCES ═══
    const { data: keyDates = [] } = useQuery<KeyDate[]>({
        queryKey: ['project-key-dates-v2', project.ProjectID],
        queryFn: async () => {
            const now = new Date();
            const nowISO = now.toISOString();
            const results: KeyDate[] = [];

            // ── Source 1: Tasks (overdue + upcoming with priority) ──
            // Overdue tasks (no date limit — show ALL overdue)
            const { data: overdueTasks } = await supabase
                .from('tasks')
                .select('task_id, title, due_date, status, priority')
                .eq('project_id', project.ProjectID)
                .not('status', 'in', '("Done")')
                .lt('due_date', nowISO)
                .order('due_date', { ascending: true })
                .limit(5);

            for (const t of overdueTasks || []) {
                const dueDate = new Date(t.due_date);
                const daysOverdue = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                results.push({
                    id: t.task_id,
                    title: t.title,
                    date: t.due_date?.split('T')[0] || '',
                    type: t.priority?.toLowerCase() === 'critical' ? 'milestone' : t.priority?.toLowerCase() === 'high' ? 'milestone' : 'deadline',
                    status: 'overdue',
                    description: `Quá hạn ${daysOverdue} ngày`,
                });
            }

            // Upcoming tasks — high/critical priority: up to 6 months, others: up to 90 days
            const in6Months = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();
            const { data: upcomingTasks } = await supabase
                .from('tasks')
                .select('task_id, title, due_date, status, priority')
                .eq('project_id', project.ProjectID)
                .not('status', 'in', '("Done")')
                .gte('due_date', nowISO)
                .lte('due_date', in6Months)
                .order('due_date', { ascending: true })
                .limit(10);

            for (const t of upcomingTasks || []) {
                const dueDate = new Date(t.due_date);
                const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                const isHighPriority = ['high', 'critical'].includes(t.priority?.toLowerCase() || '');

                // For non-high priority, only show if within 90 days
                if (!isHighPriority && daysUntil > 90) continue;

                let status: KeyDate['status'] = 'upcoming';
                if (daysUntil <= 7) status = 'due-soon';

                results.push({
                    id: t.task_id,
                    title: t.title,
                    date: t.due_date?.split('T')[0] || '',
                    type: isHighPriority ? 'milestone' : 'deadline',
                    status,
                    description: daysUntil === 0 ? 'Hôm nay'
                        : daysUntil === 1 ? 'Ngày mai'
                        : `Còn ${daysUntil} ngày`,
                });
            }

            // ── Source 2: Contract end dates (active contracts) ──
            const { data: activeContracts } = await supabase
                .from('contracts')
                .select('contract_id, contract_name, end_date, status')
                .eq('project_id', project.ProjectID)
                .eq('status', 1)  // Đang thực hiện
                .not('end_date', 'is', null)
                .order('end_date', { ascending: true });

            for (const ct of activeContracts || []) {
                const endDate = new Date(ct.end_date);
                const daysUntil = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                let status: KeyDate['status'] = 'upcoming';
                if (daysUntil < 0) status = 'overdue';
                else if (daysUntil <= 30) status = 'due-soon';

                results.push({
                    id: `ct-${ct.contract_id}`,
                    title: `Kết thúc: ${ct.contract_name}`,
                    date: ct.end_date?.split('T')[0] || '',
                    type: 'milestone',
                    status,
                    description: daysUntil < 0
                        ? `Quá hạn hợp đồng ${Math.abs(daysUntil)} ngày`
                        : daysUntil === 0 ? 'Hết hạn hôm nay'
                        : `Còn ${daysUntil} ngày`,
                });
            }

            // ── Source 3: Pending payments (NOT already paid) ──
            const { data: pendingPayments } = await supabase
                .from('payments')
                .select('payment_id, description, request_date, status, amount, type, paid_date')
                .eq('project_id', project.ProjectID)
                .in('status', ['pending', 'submitted', 'approved', 'draft'])
                .order('request_date', { ascending: true })
                .limit(5);

            for (const pm of pendingPayments || []) {
                // Skip payments that already have a paid_date (they're done)
                if (pm.paid_date && pm.paid_date !== '') continue;

                const reqDate = new Date(pm.request_date || now);
                const daysAgo = Math.ceil((now.getTime() - reqDate.getTime()) / (1000 * 60 * 60 * 24));

                // For draft payments, only show if within 60 days
                if (pm.status === 'draft' && daysAgo < -60) continue;

                results.push({
                    id: `pm-${pm.payment_id}`,
                    title: pm.description || `Thanh toán ${pm.type || ''}`,
                    date: pm.request_date?.split('T')[0] || '',
                    type: 'report',
                    status: daysAgo > 14 ? 'overdue' : daysAgo > 7 ? 'due-soon' : 'upcoming',
                    description: pm.status === 'pending' ? 'Chờ duyệt'
                        : pm.status === 'approved' ? 'Đã duyệt — chờ chi'
                        : pm.status === 'draft' ? 'Đang soạn'
                        : 'Đã nộp',
                });
            }

            // Sort: overdue first, then by date ascending
            results.sort((a, b) => {
                const statusOrder: Record<string, number> = { overdue: 0, 'due-soon': 1, upcoming: 2, completed: 3 };
                const sa = statusOrder[a.status] ?? 2;
                const sb = statusOrder[b.status] ?? 2;
                if (sa !== sb) return sa - sb;
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            });

            return results;
        },
        enabled: !!project.ProjectID,
    });

    // Fetch real disbursement data for BudgetVarianceCard
    const { data: disbursementData } = useQuery({
        queryKey: ['project-disbursement-overview', project.ProjectID],
        queryFn: async () => {
            const now = new Date();
            const thisMonth = now.getMonth() + 1;
            const thisYear = now.getFullYear();
            const lastMonth = thisMonth === 1 ? 12 : thisMonth - 1;
            const lastMonthYear = thisMonth === 1 ? thisYear - 1 : thisYear;

            // Planned disbursement from capital_plans
            const { data: planData } = await supabase
                .from('capital_plans')
                .select('planned_amount')
                .eq('project_id', project.ProjectID)
                .eq('year', thisYear);
            const planned = planData?.reduce((s: number, r: any) => s + (r.planned_amount || 0), 0) || 0;

            // Previous month disbursement
            const { data: prevData } = await (supabase
                .from('disbursements')
                .select('amount')
                .eq('project_id', project.ProjectID) as any)
                .eq('month', lastMonth)
                .eq('year', lastMonthYear);
            const prevMonth = (prevData as any[])?.reduce((s: number, r: any) => s + (r.amount || 0), 0) || 0;

            return { planned, prevMonth };
        },
        enabled: !!project.ProjectID,
    });

    return (
        <div className="animate-in slide-in-from-bottom-2 duration-500 space-y-5 py-4">

            {/* ═══ LIFECYCLE STEPPER ═══ */}
            <LifecycleStepper
                currentStage={project.Stage || ProjectStage.Preparation}
                stageHistory={project.StageHistory || []}
                editable={canEditLifecycle}
                onStageChange={onStageChange}
                onHistoryUpdate={onHistoryUpdate}
            />

            {/* ═══ RISK INDICATORS ═══ */}
            <RiskIndicators
                physicalProgress={project.PhysicalProgress ?? 0}
                financialProgress={project.FinancialProgress ?? 0}
                disbursedPercent={disbursedPercent}
                contractEndDate={project.ContractEndDate}
                missingDocs={[]}
            />

            {/* ═══ BUDGET ANALYSIS — Full Width (replaces old KeyMetricsHeader + BudgetVarianceCard duplicate) ═══ */}
            <BudgetVarianceCard
                totalInvestment={project.TotalInvestment}
                disbursedAmount={disbursedAmount}
                plannedDisbursement={project.PlannedDisbursement || disbursementData?.planned || 0}
                previousMonthDisbursed={disbursementData?.prevMonth || 0}
            />

            {/* ═══ MAIN CONTENT GRID ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* ── LEFT COLUMN (2/3) ── */}
                <div className="lg:col-span-2 space-y-5">

                    {/* General Info — Upgraded with icons */}
                    <div className="section-card">
                        <div className="section-card-header">
                            <span>Thông tin chung</span>
                            <button
                                onClick={onEditProject}
                                className="flex items-center gap-1 text-[10px] text-blue-600 hover:underline font-bold"
                            >
                                <Pencil className="w-3 h-3" />
                                Chỉnh sửa
                            </button>
                        </div>
                        <div className="p-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                                <EnhancedInfoItem icon={Hash} label="Số dự án" value={project.ProjectNumber || project.ProjectID} copyable />
                                <EnhancedInfoItem icon={Briefcase} label="Nhóm dự án" value={`Nhóm ${project.GroupCode}`} highlight />
                                <EnhancedInfoItem icon={Building2} label="Chủ đầu tư" value={project.InvestorName} />
                                <EnhancedInfoItem icon={MapPin} label="Địa điểm" value={project.LocationCode} />
                                <EnhancedInfoItem icon={Clock} label="Thời gian thực hiện" value={project.Duration || '5 Năm'} />
                                <EnhancedInfoItem icon={Briefcase} label="Hình thức quản lý" value={project.ManagementForm || 'Chủ đầu tư trực tiếp quản lý'} />
                                <EnhancedInfoItem icon={Wallet} label="Nguồn vốn" value={project.CapitalSource || 'Ngân sách tỉnh'} />
                            </div>
                        </div>
                    </div>

                    {/* National Gateway — Compact inline */}
                    <NationalGatewayCompact
                        isSynced={!!isSynced}
                        isSyncing={isSyncing}
                        nationalCode={nationalCode}
                        lastSyncTime={lastSyncTime}
                        showSyncDetails={showSyncDetails}
                        onToggleSyncDetails={() => setShowSyncDetails(!showSyncDetails)}
                        onGenerateReport={onGenerateReport}
                        isGeneratingReport={isGeneratingReport}
                    />

                    {/* Project Team */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden p-5">
                        <ProjectTeamSection
                            members={projectMembers}
                            onViewMember={onViewMember}
                        />
                    </div>
                </div>

                {/* ── RIGHT COLUMN (1/3) ── */}
                <div className="space-y-5">
                    {/* Progress */}
                    <DualProgressCard
                        physicalProgress={project.PhysicalProgress ?? 0}
                        financialProgress={project.FinancialProgress ?? 0}
                    />

                    {/* Key Dates */}
                    <KeyDatesWidget
                        dates={keyDates}
                        maxItems={4}
                        onViewAll={() => console.log('View all dates')}
                    />

                    {/* Quick Actions — compact */}
                    <QuickActionsPanel
                        onGenerateMonthlyReport={() => onGenerateReport('Monitoring')}
                        onSendReminder={() => console.log('Send reminder')}
                        onExportExcel={() => console.log('Export Excel')}
                        onScheduleMeeting={() => console.log('Schedule meeting')}
                        onSync={onSync}
                        isSyncing={isSyncing}
                    />

                    {/* Contractors */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden p-5">
                        <ContractorsListSection
                            contractors={projectContractors}
                            packages={projectPackages}
                            onViewContractor={handleViewContractor}
                            onViewPackage={onViewPackage}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Enhanced InfoItem with icon, hover, and optional copy ───

const EnhancedInfoItem: React.FC<{
    icon: React.ElementType;
    label: string;
    value: string;
    highlight?: boolean;
    copyable?: boolean;
}> = ({ icon: Icon, label, value, highlight, copyable }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(value).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    }, [value]);

    return (
        <div className="group flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-slate-700/50 last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0 group-hover:bg-amber-50 dark:group-hover:bg-amber-900/20 transition-colors">
                <Icon className="w-4 h-4 text-gray-400 dark:text-slate-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
                <span className="text-[11px] text-gray-400 dark:text-slate-500 uppercase tracking-wide font-medium">{label}</span>
                <p className={`text-sm mt-0.5 truncate ${highlight ? 'text-amber-700 dark:text-amber-400 font-bold' : 'text-gray-800 dark:text-slate-200 font-medium'}`}>
                    {value || '—'}
                </p>
            </div>
            {copyable && value && (
                <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-slate-600 transition-all"
                    title="Sao chép"
                >
                    {copied
                        ? <Check className="w-3.5 h-3.5 text-emerald-500" />
                        : <Copy className="w-3.5 h-3.5 text-gray-400" />
                    }
                </button>
            )}
        </div>
    );
};

// ─── National Gateway Compact ───

interface NationalGatewayCompactProps {
    isSynced: boolean;
    isSyncing: boolean;
    nationalCode?: string;
    lastSyncTime?: string;
    showSyncDetails: boolean;
    onToggleSyncDetails: () => void;
    onGenerateReport: (type: 'Monitoring' | 'Settlement') => void;
    isGeneratingReport: boolean;
}

const NationalGatewayCompact: React.FC<NationalGatewayCompactProps> = ({
    isSynced, isSyncing, nationalCode, lastSyncTime,
    showSyncDetails, onToggleSyncDetails, onGenerateReport, isGeneratingReport
}) => (
    <div className={`rounded-xl border overflow-hidden transition-all ${isSynced
        ? 'bg-emerald-50/60 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
        : 'bg-amber-50/60 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
    }`}>
        <div className="px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-sm ${isSynced
                    ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
                    : 'bg-gradient-to-br from-amber-400 to-orange-500'
                }`}>
                    {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> :
                        isSynced ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <Landmark className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
                        <span className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide">Cổng CSDLQG</span>
                        {isSynced && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded-full">
                                <CheckCircle2 className="w-3 h-3" /> Đã đồng bộ
                            </span>
                        )}
                        {!isSynced && !isSyncing && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold rounded-full">
                                <AlertCircle className="w-3 h-3" /> Chưa đồng bộ
                            </span>
                        )}
                        {nationalCode && (
                            <span className="text-xs font-mono font-bold text-gray-600 dark:text-slate-300">{nationalCode}</span>
                        )}
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">
                        <LegalReferenceLink text="NĐ 111/2024 • TT 24/2024" />
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onGenerateReport('Monitoring')}
                    disabled={isGeneratingReport}
                    className="px-2.5 py-1.5 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-[11px] font-bold rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                    <FileBarChart className="w-3 h-3" /> BC Giám sát
                </button>
                <button
                    onClick={() => onGenerateReport('Settlement')}
                    disabled={isGeneratingReport}
                    className="px-2.5 py-1.5 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-[11px] font-bold rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                    <FileCheck className="w-3 h-3" /> BC Quyết toán
                </button>
                <button onClick={onToggleSyncDetails} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 rounded-lg hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors">
                    {showSyncDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
            </div>
        </div>
        {showSyncDetails && (
            <div className="px-4 py-3 bg-white/50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                        <span className="text-gray-500 dark:text-slate-400">Lần đồng bộ cuối</span>
                        <p className="font-bold text-gray-800 dark:text-slate-200 mt-0.5">
                            {lastSyncTime ? new Date(lastSyncTime).toLocaleString('vi-VN') : 'Chưa có'}
                        </p>
                    </div>
                    <div>
                        <span className="text-gray-500 dark:text-slate-400">Schema</span>
                        <p className="font-bold text-gray-800 dark:text-slate-200 mt-0.5 font-mono">v2024.1</p>
                    </div>
                    <div>
                        <span className="text-gray-500 dark:text-slate-400">API</span>
                        <p className="font-bold text-gray-800 dark:text-slate-200 mt-0.5">Production</p>
                    </div>
                    <div>
                        <span className="text-gray-500 dark:text-slate-400">Kết nối</span>
                        <p className="font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Online
                        </p>
                    </div>
                </div>
                <a href="https://csdlqg.mpi.gov.vn" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline mt-2">
                    <ExternalLink className="w-3 h-3" /> Truy cập Cổng CSDLQG
                </a>
            </div>
        )}
    </div>
);

export default ProjectInfoTab;
