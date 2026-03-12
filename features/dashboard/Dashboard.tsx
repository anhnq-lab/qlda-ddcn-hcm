import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Wallet, Activity, TrendingUp, AlertCircle, CheckCircle2, FileBox, Users, HardHat, Clock, ArrowRight, AlertTriangle, Calendar, Building2, Briefcase, Map as MapIcon, Inbox, Filter, ChevronDown } from 'lucide-react';
import { formatShortCurrency as formatCurrency } from '../../utils/format';
import InteractiveMap from '../../components/common/InteractiveMap';
import { DashboardService } from '../../services/DashboardService';
import { ProjectService } from '../../services/ProjectService';
import { useTheme } from '../../context/ThemeContext';
import { ProjectStatus, MANAGEMENT_BOARDS } from '../../types';
import { AISummaryWidget } from '../../components/ai/AISummaryWidget';
import { AIRiskDashboard } from '../../components/ai/AIRiskDashboard';
import { AIContractorScoring } from '../../components/ai/AIContractorScoring';
import { AIResourceOptimizer } from '../../components/ai/AIResourceOptimizer';
import { AIAnomalyDetector } from '../../components/ai/AIAnomalyDetector';

// --- CUSTOM TOOLTIP FOR DARK MODE ---
const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
        <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-xl shadow-xl border border-gray-200 dark:border-slate-600">
            <p className="text-xs font-bold text-gray-500 dark:text-slate-400 mb-1">{label}</p>
            {payload.map((entry: any, idx: number) => (
                <p key={idx} className="text-sm font-bold text-gray-800 dark:text-slate-100">
                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.fill || entry.color }} />
                    {entry.name === 'disbursement' ? 'Thực hiện' : entry.name === 'plan' ? 'Kế hoạch' : entry.name}
                    : {formatCurrency(entry.value * 1_000_000_000)}
                </p>
            ))}
        </div>
    );
};

// --- STAT CARD (Inline - bold gradient matching TaskList/PaymentList design) ---
const StatCard: React.FC<{
    title: string;
    value: string;
    icon: React.ElementType;
    trend?: string;
    trendUp?: boolean;
    bgIcon: string;
    textIcon: string;
    description?: string;
    loading?: boolean;
    onClick?: () => void;
}> = ({ title, value, icon: Icon, trend, trendUp, bgIcon, textIcon, description, loading, onClick }) => {
    // Ban DDCN: Progressive gray→gold stat card styles (inline CSS)
    const cardStyles: Record<string, { bg: string; border: string }> = {
        gold1: { bg: 'linear-gradient(135deg, #404040 0%, #333333 100%)', border: '#8A8A8A' },       // Neutral charcoal
        gold2: { bg: 'linear-gradient(135deg, #4A4535 0%, #3D3A2D 100%)', border: '#A89050' },       // Warm charcoal
        gold3: { bg: 'linear-gradient(135deg, #5A4F35 0%, #4A4230 100%)', border: '#C4A035' },       // Gold-brown
        gold4: { bg: 'linear-gradient(135deg, #504838 0%, #433D2E 100%)', border: '#B09040' },       // Muted gold
        gold5: { bg: 'linear-gradient(135deg, #6B5A30 0%, #5A4A25 100%)', border: '#D4A017' },       // Rich gold
    };
    // Extract card variant from textIcon (e.g., 'text-gold1-600' -> 'gold1')
    const colorMatch = textIcon.match(/text-(\w+)-/);
    const colorName = colorMatch ? colorMatch[1] : 'gold1';
    const style = cardStyles[colorName] || cardStyles.gold1;

    return (
        <div
            className={`relative overflow-hidden rounded-2xl text-white p-3 sm:p-4 shadow-xl transition-transform hover:scale-[1.02] hover:shadow-2xl duration-300 min-h-[5.5rem] h-auto flex flex-col justify-center gap-1.5 ${onClick ? 'cursor-pointer' : ''}`}
            style={{
                background: style.bg,
                borderTop: `3px solid ${style.border}`,
                boxShadow: `0 4px 14px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)`,
            }}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
        >
            {/* Background Icon Watermark */}
            <div className="absolute -right-2 -top-2 opacity-[0.12]">
                <Icon className="w-20 h-20" strokeWidth={1.2} />
            </div>

            <div className="flex justify-between items-start relative z-10">
                <div className="p-2 rounded-xl bg-white/20 shadow-sm">
                    <Icon className="w-4 h-4 text-white" />
                </div>
                {trend && !loading && (
                    <span className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/20 text-white`}>
                        <TrendingUp className={`w-2.5 h-2.5 ${trendUp ? '' : 'rotate-180'}`} /> {trend}
                    </span>
                )}
            </div>
            <div className="relative z-10">
                {loading ? (
                    <div className="h-6 w-20 bg-white/20 rounded animate-pulse my-0.5"></div>
                ) : (
                    <h3 className="text-xl font-black text-white tracking-tight my-0.5 drop-shadow-sm">{value}</h3>
                )}
                <p className="text-[9px] font-extrabold text-white/90 uppercase tracking-[0.15em]">{title}</p>
                {description && <p className="text-[9px] text-white/70 mt-0.5 font-medium leading-tight">{description}</p>}
            </div>
        </div>
    );
};

// --- EMPTY STATE ---
const EmptyState: React.FC<{ icon: React.ElementType; message: string }> = ({ icon: Icon, message }) => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-full mb-3">
            <Icon className="w-6 h-6 text-gray-300 dark:text-slate-500" />
        </div>
        <p className="text-xs font-medium text-gray-400 dark:text-slate-500">{message}</p>
    </div>
);

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();

    // --- FILTER STATE ---
    const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedBoard, setSelectedBoard] = useState<string>('all');

    // --- DATA FETCHING ---
    const { data: metrics, isLoading: loadingMetrics } = useQuery({
        queryKey: ['dashboard', 'metrics'],
        queryFn: DashboardService.getMetrics
    });

    const { data: disbursementData, isLoading: loadingDisbursement } = useQuery({
        queryKey: ['dashboard', 'disbursement'],
        queryFn: DashboardService.getDisbursementChart
    });

    const { data: risks, isLoading: loadingRisks } = useQuery({
        queryKey: ['dashboard', 'risks'],
        queryFn: DashboardService.getRisks
    });

    const { data: projectStatusData, isLoading: loadingStatus } = useQuery({
        queryKey: ['dashboard', 'projectStatus'],
        queryFn: DashboardService.getProjectStatusDistribution
    });

    const { data: groupData, isLoading: loadingGroups } = useQuery({
        queryKey: ['dashboard', 'groups'],
        queryFn: DashboardService.getGroupDistribution
    });

    const { data: deadlines, isLoading: loadingDeadlines } = useQuery({
        queryKey: ['dashboard', 'deadlines'],
        queryFn: DashboardService.getDeadlines
    });

    const { data: gpmbData, isLoading: loadingGPMB } = useQuery({
        queryKey: ['dashboard', 'gpmb'],
        queryFn: DashboardService.getGPMBData
    });

    const { data: contractors, isLoading: loadingContractors } = useQuery({
        queryKey: ['dashboard', 'contractors'],
        queryFn: DashboardService.getTopContractors
    });

    const { data: projects, isLoading: loadingProjects } = useQuery({
        queryKey: ['projects', 'all'],
        queryFn: () => ProjectService.getAll()
    });

    const { data: contractStatus, isLoading: loadingContracts } = useQuery({
        queryKey: ['dashboard', 'contractStatus'],
        queryFn: DashboardService.getContractStatusCounts
    });

    // Unique avatar colors for contractors
    const avatarColors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500'];

    // --- AVAILABLE YEARS (from 2020 to current+1) ---
    const availableYears = useMemo(() => {
        const current = new Date().getFullYear();
        const years: number[] = [];
        for (let y = current + 1; y >= 2020; y--) years.push(y);
        return years;
    }, []);

    // --- FILTERED PROJECTS ---
    const filteredProjects = useMemo(() => {
        if (!projects) return [];
        let filtered = [...projects];

        // Filter by project
        if (selectedProjectId !== 'all') {
            filtered = filtered.filter(p => p.ProjectID === selectedProjectId);
        }

        // Filter by management board
        if (selectedBoard !== 'all') {
            filtered = filtered.filter(p => p.ManagementBoard && p.ManagementBoard.toString() === selectedBoard);
        }

        // Filter by year: include projects active in the selected year
        // Always include Completion projects (already finished, still part of portfolio)
        filtered = filtered.filter(p => {
            if (p.Status === ProjectStatus.Completion) return true;
            const startYear = p.StartDate ? new Date(p.StartDate).getFullYear() : null;
            const endYear = p.ExpectedEndDate ? new Date(p.ExpectedEndDate).getFullYear() : null;
            const approvalYear = p.ApprovalDate ? new Date(p.ApprovalDate).getFullYear() : null;
            // Show if project spans across the selected year
            if (startYear && endYear) return startYear <= selectedYear && endYear >= selectedYear;
            if (startYear) return startYear <= selectedYear;
            if (approvalYear) return approvalYear <= selectedYear;
            return true; // no date info, always show
        });

        return filtered;
    }, [projects, selectedProjectId, selectedYear, selectedBoard]);

    // --- BOARD CHART DATA (all projects, NOT filtered by board) ---
    const boardChartData = useMemo(() => {
        if (!projects) return [];
        // Apply project + year filters but NOT board filter
        let base = [...projects];
        if (selectedProjectId !== 'all') {
            base = base.filter(p => p.ProjectID === selectedProjectId);
        }
        base = base.filter(p => {
            const startYear = p.StartDate ? new Date(p.StartDate).getFullYear() : null;
            const endYear = p.ExpectedEndDate ? new Date(p.ExpectedEndDate).getFullYear() : null;
            const approvalYear = p.ApprovalDate ? new Date(p.ApprovalDate).getFullYear() : null;
            if (startYear && endYear) return startYear <= selectedYear && endYear >= selectedYear;
            if (startYear) return startYear <= selectedYear;
            if (approvalYear) return approvalYear <= selectedYear;
            return true;
        });

        return MANAGEMENT_BOARDS.map(board => {
            const boardProjects = base.filter(p => p.ManagementBoard === board.value);
            return {
                name: `Ban ${board.value}`,
                preparation: boardProjects.filter(p => p.Status === ProjectStatus.Preparation).length,
                execution: boardProjects.filter(p => p.Status === ProjectStatus.Execution).length,
                completion: boardProjects.filter(p => p.Status === ProjectStatus.Completion).length,
                total: boardProjects.length,
                color: board.hex,
            };
        });
    }, [projects, selectedProjectId, selectedYear]);

    // --- BOARD INVESTMENT PIE DATA (for donut chart) ---
    const boardInvestmentData = useMemo(() => {
        if (!projects) return [];
        let base = [...projects];
        if (selectedProjectId !== 'all') {
            base = base.filter(p => p.ProjectID === selectedProjectId);
        }
        base = base.filter(p => {
            const startYear = p.StartDate ? new Date(p.StartDate).getFullYear() : null;
            const endYear = p.ExpectedEndDate ? new Date(p.ExpectedEndDate).getFullYear() : null;
            const approvalYear = p.ApprovalDate ? new Date(p.ApprovalDate).getFullYear() : null;
            if (startYear && endYear) return startYear <= selectedYear && endYear >= selectedYear;
            if (startYear) return startYear <= selectedYear;
            if (approvalYear) return approvalYear <= selectedYear;
            return true;
        });
        return MANAGEMENT_BOARDS.map((board) => {
            const total = base.filter(p => p.ManagementBoard === board.value)
                .reduce((s, p) => s + (p.TotalInvestment || 0), 0);
            return { name: board.label, value: total, color: board.hex };
        }).filter(b => b.value > 0);
    }, [projects, selectedProjectId, selectedYear]);

    // --- BOARD DISBURSEMENT BAR DATA ---
    const boardDisbursementData = useMemo(() => {
        if (!projects) return [];
        let base = [...projects];
        if (selectedProjectId !== 'all') {
            base = base.filter(p => p.ProjectID === selectedProjectId);
        }
        base = base.filter(p => {
            const startYear = p.StartDate ? new Date(p.StartDate).getFullYear() : null;
            const endYear = p.ExpectedEndDate ? new Date(p.ExpectedEndDate).getFullYear() : null;
            const approvalYear = p.ApprovalDate ? new Date(p.ApprovalDate).getFullYear() : null;
            if (startYear && endYear) return startYear <= selectedYear && endYear >= selectedYear;
            if (startYear) return startYear <= selectedYear;
            if (approvalYear) return approvalYear <= selectedYear;
            return true;
        });
        return MANAGEMENT_BOARDS.map((board) => {
            const boardProjects = base.filter(p => p.ManagementBoard === board.value);
            const totalInvest = boardProjects.reduce((s, p) => s + (p.TotalInvestment || 0), 0);
            const totalDisbursed = boardProjects.reduce((s, p) => {
                const rate = (p.PaymentProgress || 0) / 100;
                return s + (p.TotalInvestment || 0) * rate;
            }, 0);
            return {
                name: board.label,
                value: Math.round(totalDisbursed / 1e9 * 10) / 10,
                investment: Math.round(totalInvest / 1e9 * 10) / 10,
                color: board.hex,
            };
        });
    }, [projects, selectedProjectId, selectedYear]);

    // --- FILTERED STATS ---
    const filteredStatusData = useMemo(() => {
        const phaseStats = [
            { name: 'Chuẩn bị dự án', value: 0, color: '#3B82F6' },   // Blue
            { name: 'Thực hiện dự án', value: 0, color: '#F97316' },   // Orange
            { name: 'Kết thúc xây dựng', value: 0, color: '#10B981' }, // Emerald
        ];
        filteredProjects.forEach(p => {
            if (p.Status === ProjectStatus.Preparation) phaseStats[0].value++;
            else if (p.Status === ProjectStatus.Execution) phaseStats[1].value++;
            else if (p.Status === ProjectStatus.Completion) phaseStats[2].value++;
        });
        return phaseStats.filter(s => s.value > 0);
    }, [filteredProjects]);

    const filteredGroupData = useMemo(() => {
        const groupStats: Record<string, { name: string; value: number; color: string }> = {
            'QN': { name: 'Quốc gia', value: 0, color: '#AE1E23' }, // Brand Red
            'A': { name: 'Nhóm A', value: 0, color: '#D4A017' }, // Gold 500
            'B': { name: 'Nhóm B', value: 0, color: '#B8860B' }, // Gold 600
            'C': { name: 'Nhóm C', value: 0, color: '#996515' }, // Gold 700
        };
        filteredProjects.forEach(p => {
            if (groupStats[p.GroupCode]) groupStats[p.GroupCode].value++;
        });
        return Object.values(groupStats).filter(g => g.value > 0);
    }, [filteredProjects]);

    const filteredTotalInvestment = useMemo(() => {
        return filteredProjects.reduce((sum, p) => sum + (p.TotalInvestment || 0), 0);
    }, [filteredProjects]);

    return (
        <div className="space-y-8 pb-20 font-sans">
            {/* HEADER SECTION */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-800 dark:text-slate-100 tracking-tight uppercase">Trung tâm điều hành — Ban QLDA ĐTXD CN</h2>
                    <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Cập nhật dữ liệu: {new Date().toLocaleDateString('vi-VN')}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    {/* FILTER: Project */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500 pointer-events-none" />
                        <select
                            value={selectedProjectId}
                            onChange={e => setSelectedProjectId(e.target.value)}
                            className="pl-9 pr-8 py-2 filter-primary min-w-[180px] max-w-[280px] truncate"
                        >
                            <option value="all">Tất cả dự án</option>
                            {projects?.map(p => (
                                <option key={p.ProjectID} value={p.ProjectID}>
                                    {p.ProjectName}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500 pointer-events-none" />
                    </div>

                    {/* FILTER: Year */}
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500 pointer-events-none" />
                        <select
                            value={selectedYear}
                            onChange={e => setSelectedYear(parseInt(e.target.value))}
                            className="pl-9 pr-8 py-2 filter-primary min-w-[120px]"
                        >
                            {availableYears.map(y => (
                                <option key={y} value={y}>Năm {y}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500 pointer-events-none" />
                    </div>

                    {/* FILTER: Ban QLDA */}
                    <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500 pointer-events-none" />
                        <select
                            value={selectedBoard}
                            onChange={e => setSelectedBoard(e.target.value)}
                            className="pl-9 pr-8 py-2 filter-primary min-w-[140px]"
                        >
                            <option value="all">Tất cả ban</option>
                            {MANAGEMENT_BOARDS.map(b => (
                                <option key={b.value} value={b.value}>{b.label}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500 pointer-events-none" />
                    </div>

                    {/* Export button */}
                    <button onClick={() => navigate('/reports')} className="px-4 py-2 text-white text-sm font-bold rounded-xl shadow-lg transition-all flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #D4A017 0%, #B8860B 100%)', boxShadow: '0 4px 14px rgba(184, 134, 11, 0.3)' }}>
                        <FileBox className="w-4 h-4" /> Xuất báo cáo
                    </button>
                </div>
            </div>

            {/* Active filter indicator */}
            {(selectedProjectId !== 'all' || selectedYear !== new Date().getFullYear() || selectedBoard !== 'all') && (
                <div className="flex items-center gap-2 -mt-4">
                    <span className="text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-full border border-primary-200 dark:border-primary-800 flex items-center gap-1.5">
                        <Filter className="w-3 h-3" />
                        Đang lọc: {filteredProjects.length} dự án
                        {selectedProjectId !== 'all' && ' (1 dự án)'}
                        {selectedYear !== new Date().getFullYear() && ` • Năm ${selectedYear}`}
                        {selectedBoard !== 'all' && ` • Ban QLDA ${selectedBoard}`}
                    </span>
                    <button
                        onClick={() => { setSelectedProjectId('all'); setSelectedYear(new Date().getFullYear()); setSelectedBoard('all'); }}
                        className="text-xs font-bold text-gray-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    >
                        ✕ Xóa bộ lọc
                    </button>
                </div>
            )}

            {/* 1. KEY METRICS ROW — 5 Cards (Thứ tự: DA → Vốn → Giải ngân → HĐ → Rủi ro) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
                <StatCard
                    title="Dự án đang quản lý"
                    value={filteredProjects.length.toString()}
                    icon={Building2}
                    bgIcon="bg-amber-50 dark:bg-amber-900/30"
                    textIcon="text-gold1-600 dark:text-gold1-400"
                    description={filteredStatusData.map(s => `${s.value} ${s.name.toLowerCase()}`).join(' • ')}
                    loading={loadingProjects}
                    onClick={() => navigate('/projects')}
                />
                <StatCard
                    title="Tổng vốn đầu tư"
                    value={formatCurrency(filteredTotalInvestment)}
                    icon={Wallet}
                    bgIcon="bg-amber-50 dark:bg-amber-900/30"
                    textIcon="text-gold2-600 dark:text-gold2-400"
                    description={`${filteredProjects.length} dự án đang quản lý`}
                    loading={loadingMetrics}
                    onClick={() => navigate('/projects')}
                />
                <StatCard
                    title="Giá trị giải ngân"
                    value={metrics ? formatCurrency(metrics.totalDisbursed) : '0'}
                    icon={Activity}
                    trend={metrics ? `Đạt ${metrics.disbursementRate.toFixed(0)}% tổng vốn` : undefined}
                    trendUp={metrics ? metrics.disbursementRate >= 50 : undefined}
                    bgIcon="bg-amber-50 dark:bg-amber-900/30"
                    textIcon="text-gold3-600 dark:text-gold3-400"
                    loading={loadingMetrics}
                />
                <StatCard
                    title="Hợp đồng"
                    value={contractStatus ? contractStatus.total.toString() : '0'}
                    icon={Briefcase}
                    bgIcon="bg-amber-50 dark:bg-amber-900/30"
                    textIcon="text-gold4-600 dark:text-gold4-400"
                    description={contractStatus ? `${contractStatus.executing} đang thực hiện` : ''}
                    loading={loadingContracts}
                    onClick={() => navigate('/contracts')}
                />
                <StatCard
                    title="Cảnh báo rủi ro"
                    value={metrics ? metrics.riskCount.toString() : '0'}
                    icon={AlertCircle}
                    bgIcon="bg-amber-50 dark:bg-amber-900/30"
                    textIcon="text-gold5-600 dark:text-gold5-400"
                    description={metrics && metrics.riskCount > 0 ? 'Cần xử lý ngay' : 'Không có cảnh báo'}
                    trend={metrics && metrics.riskCount > 0 ? `${metrics.riskCount} cảnh báo` : undefined}
                    trendUp={false}
                    loading={loadingMetrics}
                />
            </div>

            {/* AI Summary — standalone, self-hides when API unavailable */}
            <AISummaryWidget />

            {/* 2. BAN QLDA CHARTS + DEADLINES ROW */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
                {/* 3 charts side by side (chiếm 3/4) */}

                {/* CHART 1: Stacked Bar — DA theo Ban × Phase */}
                <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="section-header text-[11px]">
                            <div className="section-icon p-1"><Building2 className="w-3.5 h-3.5" /></div>
                            DA theo Ban
                        </h3>
                        <div className="flex gap-1.5 flex-wrap">
                            <span className="flex items-center gap-0.5 text-[8px] font-bold text-gray-500 dark:text-slate-400"><div className="w-1.5 h-1.5 rounded" style={{ background: '#E4C45A' }}></div>CB</span>
                            <span className="flex items-center gap-0.5 text-[8px] font-bold text-gray-500 dark:text-slate-400"><div className="w-1.5 h-1.5 rounded" style={{ background: '#D4A017' }}></div>TH</span>
                            <span className="flex items-center gap-0.5 text-[8px] font-bold text-gray-500 dark:text-slate-400"><div className="w-1.5 h-1.5 rounded" style={{ background: '#B8860B' }}></div>KT</span>
                        </div>
                    </div>
                    <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={boardChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barGap={0}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#E5E7EB'} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#94A3B8' : '#6B7280', fontSize: 10, fontWeight: 700 }} dy={4} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#94A3B8' : '#6B7280', fontSize: 9, fontWeight: 600 }} allowDecimals={false} />
                                <RechartsTooltip
                                    content={({ active, payload, label }: any) => {
                                        if (!active || !payload) return null;
                                        const total = payload.reduce((s: number, e: any) => s + (e.value || 0), 0);
                                        return (
                                            <div className="bg-white dark:bg-slate-800 px-3 py-2 rounded-xl shadow-xl border border-gray-200 dark:border-slate-600">
                                                <p className="text-[10px] font-black text-gray-700 dark:text-slate-200 mb-0.5">{label} — {total} DA</p>
                                                {payload.map((entry: any, idx: number) => (
                                                    entry.value > 0 && (
                                                        <p key={idx} className="text-[9px] text-gray-600 dark:text-slate-300 flex items-center gap-1">
                                                            <span className="inline-block w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: entry.fill }}></span>
                                                            {entry.name === 'preparation' ? 'Chuẩn bị' : entry.name === 'execution' ? 'Thực hiện' : 'Kết thúc'}: <strong>{entry.value}</strong>
                                                        </p>
                                                    )
                                                ))}
                                            </div>
                                        );
                                    }}
                                    cursor={{ fill: theme === 'dark' ? '#1E293B' : '#F3F4F6' }}
                                />
                                <Bar dataKey="preparation" name="preparation" stackId="phase" fill="#3B82F6" radius={[0, 0, 0, 0]} maxBarSize={28}>
                                    {boardChartData.map((entry, idx) => (
                                        <Cell key={idx} fill={entry.color} fillOpacity={0.45} />
                                    ))}
                                </Bar>
                                <Bar dataKey="execution" name="execution" stackId="phase" fill="#F97316" radius={[0, 0, 0, 0]} maxBarSize={28}>
                                    {boardChartData.map((entry, idx) => (
                                        <Cell key={idx} fill={entry.color} fillOpacity={0.7} />
                                    ))}
                                </Bar>
                                <Bar dataKey="completion" name="completion" stackId="phase" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={28}>
                                    {boardChartData.map((entry, idx) => (
                                        <Cell key={idx} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* CHART 2: Donut Pie — Cơ cấu vốn đầu tư */}
                <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700">
                    <h3 className="section-header text-[11px] mb-1">
                        <div className="section-icon p-1"><Wallet className="w-3.5 h-3.5" /></div>
                        Cơ cấu vốn đầu tư
                    </h3>
                    <div className="h-36 flex items-center">
                        {boardInvestmentData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={boardInvestmentData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={38}
                                        outerRadius={62}
                                        paddingAngle={3}
                                        dataKey="value"
                                        nameKey="name"
                                        stroke="none"
                                    >
                                        {boardInvestmentData.map((entry, idx) => (
                                            <Cell key={idx} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        content={({ active, payload }: any) => {
                                            if (!active || !payload?.[0]) return null;
                                            const d = payload[0];
                                            const totalAll = boardInvestmentData.reduce((s, b) => s + b.value, 0);
                                            const pct = totalAll > 0 ? ((d.value / totalAll) * 100).toFixed(1) : '0';
                                            return (
                                                <div className="bg-white dark:bg-slate-800 px-3 py-2 rounded-xl shadow-xl border border-gray-200 dark:border-slate-600">
                                                    <p className="text-[10px] font-black text-gray-700 dark:text-slate-200">{d.name}</p>
                                                    <p className="text-[10px] text-gray-600 dark:text-slate-300">{formatCurrency(d.value)} ({pct}%)</p>
                                                </div>
                                            );
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full text-center text-xs text-gray-400 dark:text-slate-500">Chưa có dữ liệu</div>
                        )}
                    </div>
                    <div className="flex flex-wrap justify-center gap-x-2 gap-y-0.5">
                        {boardInvestmentData.map((b, idx) => {
                            const totalAll = boardInvestmentData.reduce((s, x) => s + x.value, 0);
                            const pct = totalAll > 0 ? ((b.value / totalAll) * 100).toFixed(0) : '0';
                            return (
                                <span key={idx} className="flex items-center gap-0.5 text-[9px] font-bold text-gray-600 dark:text-slate-400">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }}></div>
                                    Ban {idx + 1} ({pct}%)
                                </span>
                            );
                        })}
                    </div>
                </div>

                {/* CHART 3: Bar — Giải ngân theo Ban */}
                <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700">
                    <h3 className="section-header text-[11px] mb-2">
                        <div className="section-icon p-1"><Activity className="w-3.5 h-3.5" /></div>
                        Giải ngân theo Ban
                    </h3>
                    <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={boardDisbursementData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#E5E7EB'} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#94A3B8' : '#6B7280', fontSize: 10, fontWeight: 700 }} dy={4} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#94A3B8' : '#6B7280', fontSize: 9, fontWeight: 600 }} unit=" Tỷ" />
                                <RechartsTooltip
                                    content={({ active, payload, label }: any) => {
                                        if (!active || !payload?.[0]) return null;
                                        const d = payload[0].payload;
                                        return (
                                            <div className="bg-white dark:bg-slate-800 px-3 py-2 rounded-xl shadow-xl border border-gray-200 dark:border-slate-600">
                                                <p className="text-[10px] font-black text-gray-700 dark:text-slate-200 mb-0.5">{label}</p>
                                                <p className="text-[9px] text-gray-600 dark:text-slate-300">Giải ngân: <strong>{d.value} Tỷ</strong></p>
                                                <p className="text-[9px] text-gray-600 dark:text-slate-300">Tổng vốn: {d.investment} Tỷ</p>
                                                <p className="text-[9px] text-gray-600 dark:text-slate-300">Tỷ lệ: {d.investment > 0 ? ((d.value / d.investment) * 100).toFixed(0) : 0}%</p>
                                            </div>
                                        );
                                    }}
                                    cursor={{ fill: theme === 'dark' ? '#1E293B' : '#F3F4F6' }}
                                />
                                <Bar dataKey="value" fill="#D4A017" radius={[4, 4, 0, 0]} maxBarSize={28}>
                                    {boardDisbursementData.map((b, idx) => (
                                        <Cell key={idx} fill={b.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* UPCOMING DEADLINES */}
                <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col min-h-[10rem]">
                    <div className="flex justify-between items-center mb-3 shrink-0">
                        <h3 className="section-header text-xs">
                            <div className="section-icon p-1.5"><Clock className="w-4 h-4" /></div> Sắp đến hạn
                        </h3>
                        <span className="text-[10px] bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-md font-bold">7 ngày tới</span>
                    </div>
                    <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                        {loadingDeadlines ? (
                            <div className="space-y-2">
                                <div className="h-12 bg-gray-50 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                                <div className="h-12 bg-gray-50 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                            </div>
                        ) : deadlines && deadlines.length > 0 ? (
                            deadlines.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-2.5 pb-2.5 border-b border-gray-50 dark:border-slate-700/50 last:border-0 last:pb-0">
                                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${item.urgent ? 'bg-red-500 animate-pulse' : 'bg-orange-400'}`}></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-bold text-gray-800 dark:text-slate-100 line-clamp-1">{item.title}</p>
                                        <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5 truncate">{item.project}</p>
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border mt-1 inline-block ${item.urgent ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800' : 'bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-600'}`}>
                                            Hạn: {item.due}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <EmptyState icon={Calendar} message="Không có deadline trong 7 ngày tới" />
                        )}
                    </div>
                </div>
            </div>

            {/* 3. MAP & ALERTS ROW */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 min-h-[300px] xl:h-[500px]">
                {/* Map Section (2/3 width) */}
                <div className="xl:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 relative overflow-hidden h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4 shrink-0">
                        <h3 className="section-header">
                            <div className="section-icon"><MapIcon className="w-5 h-5" /></div>
                            Bản đồ vị trí dự án
                        </h3>
                    </div>

                    <div className="flex-1 w-full bg-gray-100 dark:bg-slate-700 rounded-2xl relative border border-gray-200 dark:border-slate-600 overflow-hidden z-0">
                        {loadingProjects ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : (
                            <InteractiveMap projects={filteredProjects} />
                        )}

                        {/* Legend Overlay */}
                        <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-3 rounded-xl border border-gray-200 dark:border-slate-600 shadow-lg z-[1000]">
                            <h4 className="text-[10px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Chú thích</h4>
                            <div className="space-y-2">
                                {filteredStatusData.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-700 shadow-sm" style={{ backgroundColor: item.color }}></span>
                                        <span className="text-[10px] font-bold text-gray-600 dark:text-slate-300">{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ALERTS SECTION */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/50 relative overflow-hidden h-full flex flex-col">
                    <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none"><AlertTriangle className="w-32 h-32 text-red-500" /></div>
                    <h3 className="text-sm font-black text-red-600 dark:text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10 shrink-0" style={{ paddingLeft: '0.75rem', borderLeft: '3px solid #EF4444' }}>
                        <AlertTriangle className="w-4 h-4" /> Cảnh báo quan trọng
                    </h3>
                    <div className="space-y-3 relative z-10 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {loadingRisks ? (
                            <div className="space-y-2">
                                <div className="h-16 bg-red-50/50 dark:bg-red-900/10 rounded-xl animate-pulse"></div>
                                <div className="h-16 bg-red-50/50 dark:bg-red-900/10 rounded-xl animate-pulse"></div>
                                <div className="h-16 bg-red-50/50 dark:bg-red-900/10 rounded-xl animate-pulse"></div>
                            </div>
                        ) : risks && risks.length > 0 ? (
                            risks.map(r => (
                                <div key={r.id} className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-xl flex items-start gap-3 transition-transform hover:scale-[1.02] cursor-pointer">
                                    <div className="p-1.5 bg-white dark:bg-slate-700 rounded-lg text-red-500 shadow-sm shrink-0">
                                        <AlertCircle className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-red-800 dark:text-red-300 leading-snug">{r.msg}</p>
                                        <p className="text-[10px] text-red-500 dark:text-red-400/70 mt-1 font-medium">{r.date}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <EmptyState icon={CheckCircle2} message="Không có cảnh báo nào" />
                        )}
                    </div>
                    <button className="w-full mt-4 py-2 bg-white dark:bg-slate-700 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0">
                        Xem chi tiết báo cáo rủi ro
                    </button>
                </div>
            </div>

            {/* 4. DISBURSEMENT CHART (Full Width) */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="section-header">
                        <div className="section-icon"><TrendingUp className="w-5 h-5" /></div>
                        Biểu đồ giải ngân &amp; Kế hoạch vốn
                    </h3>
                    <div className="flex gap-3">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 dark:text-slate-400"><div className="w-2.5 h-2.5 rounded" style={{ background: '#B8860B' }}></div> Giải ngân</span>
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 dark:text-slate-400"><div className="w-2.5 h-2.5 rounded" style={{ background: '#F0D68A' }}></div> Kế hoạch</span>
                    </div>
                </div>
                <div className="h-80 w-full">
                    {loadingDisbursement ? (
                        <div className="h-full w-full bg-gray-50 dark:bg-slate-700 rounded-xl animate-pulse"></div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={disbursementData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={0}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#E5E7EB'} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#94A3B8' : '#6B7280', fontSize: 11, fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#94A3B8' : '#6B7280', fontSize: 11, fontWeight: 600 }} tickFormatter={(val) => `${val / 1000} Tỷ`} />
                                <RechartsTooltip content={<ChartTooltip />} cursor={{ fill: theme === 'dark' ? '#1E293B' : '#F3F4F6' }} />
                                <Bar dataKey="plan" fill={theme === 'dark' ? '#5C3D0E' : '#F0D68A'} radius={[4, 4, 0, 0]} maxBarSize={40} />
                                <Bar dataKey="disbursement" fill="#B8860B" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* 5. LEGAL & SITE CLEARANCE MONITOR (Full Width) */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-orange-100 dark:border-orange-900/50 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="section-header">
                        <div className="section-icon"><FileBox className="w-5 h-5" /></div>
                        Theo dõi Vướng mắc (GPMB &amp; Pháp lý)
                    </h3>
                    <button className="text-[10px] font-bold text-primary-600 dark:text-primary-400 hover:underline">Chi tiết</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Legal Issues */}
                    <div className="p-4 bg-orange-50/50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-800/30">
                        <h4 className="text-[11px] font-bold text-orange-800 dark:text-orange-300 uppercase mb-3 flex items-center gap-2">
                            <Briefcase className="w-3 h-3" /> Hồ sơ pháp lý
                        </h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-600 dark:text-slate-300 font-medium">Chờ phê duyệt chủ trương</span>
                                <span className="text-xs font-black text-gray-800 dark:text-slate-100 bg-white dark:bg-slate-700 px-2 py-0.5 rounded border border-gray-200 dark:border-slate-600 shadow-sm">
                                    {filteredProjects.filter(p => p.Status === ProjectStatus.Preparation).length} dự án
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-600 dark:text-slate-300 font-medium">Đang điều chỉnh TMĐT</span>
                                <span className="text-xs font-black text-orange-600 dark:text-orange-400 bg-white dark:bg-slate-700 px-2 py-0.5 rounded border border-orange-100 dark:border-orange-800/50 shadow-sm">
                                    {0} dự án
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-slate-600 h-1.5 rounded-full mt-2 overflow-hidden">
                                <div className="bg-orange-400 h-full rounded-full transition-all duration-500" style={{ width: `${filteredProjects.length > 0 ? Math.round((filteredProjects.filter(p => p.Status !== ProjectStatus.Preparation).length / filteredProjects.length) * 100) : 0}%` }}></div>
                            </div>
                            <p className="text-[9px] text-gray-400 dark:text-slate-500 text-right mt-1">
                                {filteredProjects.length > 0 ? Math.round((filteredProjects.filter(p => p.Status !== ProjectStatus.Preparation).length / filteredProjects.length) * 100) : 0}% hồ sơ đã hoàn thành
                            </p>
                        </div>
                    </div>

                    {/* Site Clearance (GPMB) */}
                    <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                        <h4 className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase mb-3 flex items-center gap-2">
                            <MapIcon className="w-3 h-3" /> Giải phóng mặt bằng
                        </h4>
                        {loadingGPMB ? (
                            <div className="h-24 bg-blue-100/50 dark:bg-blue-900/20 rounded-xl animate-pulse"></div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-600 dark:text-slate-300 font-medium">Vướng mắc mặt bằng</span>
                                    <span className="text-xs font-black text-red-600 dark:text-red-400 bg-white dark:bg-slate-700 px-2 py-0.5 rounded border border-red-100 dark:border-red-800/50 shadow-sm animate-pulse">{gpmbData?.bottlenecks || 0} điểm nghẽn</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-600 dark:text-slate-300 font-medium">Đã bàn giao mặt bằng</span>
                                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-700 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-800/50 shadow-sm">{gpmbData?.handedOverPercent || 0}%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-slate-600 h-1.5 rounded-full mt-2 overflow-hidden">
                                    <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${gpmbData?.handedOverPercent || 0}%` }}></div>
                                </div>
                                <p className="text-[9px] text-gray-400 dark:text-slate-500 text-right mt-1">Tăng 5% so với tháng trước</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 6. AI INTELLIGENCE HUB (Grid 2x2) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <AIRiskDashboard />
                <AIAnomalyDetector />
                <AIContractorScoring />
                <AIResourceOptimizer />
            </div>

            {/* 7. ACTIVE CONTRACTORS (Compact Horizontal) */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="section-header">
                        <div className="section-icon"><HardHat className="w-5 h-5" /></div> Nhà thầu chính
                    </h3>
                    <button onClick={() => navigate('/contractors')} className="flex items-center gap-1 text-[11px] font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                        Xem tất cả <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                    {loadingContractors ? (
                        <>
                            <div className="h-16 bg-gray-50 dark:bg-slate-700 rounded-xl animate-pulse"></div>
                            <div className="h-16 bg-gray-50 dark:bg-slate-700 rounded-xl animate-pulse"></div>
                            <div className="h-16 bg-gray-50 dark:bg-slate-700 rounded-xl animate-pulse"></div>
                        </>
                    ) : contractors && contractors.length > 0 ? (
                        contractors.map((c, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-100 dark:border-slate-600 hover:shadow-md transition-shadow">
                                <div className={`w-9 h-9 rounded-full ${avatarColors[idx % avatarColors.length]} text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0`}>
                                    {c.FullName?.charAt(c.FullName.lastIndexOf(' ') + 1) || c.ContractorID.substring(0, 2)}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-[11px] font-bold text-gray-800 dark:text-slate-100 truncate" title={c.FullName}>{c.FullName}</p>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        <span className="text-[9px] text-gray-500 dark:text-slate-400 font-medium">Đang thi công</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full">
                            <EmptyState icon={Users} message="Chưa có nhà thầu nào" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;