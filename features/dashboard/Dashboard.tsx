import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { Wallet, Activity, AlertCircle, CheckCircle2, Clock, AlertTriangle, Building2, Map as MapIcon, Filter, ChevronDown, FileBox, TrendingUp, ArrowRight, Brain, X } from 'lucide-react';
import { formatShortCurrency } from '../../utils/format';
import InteractiveMap from '../../components/common/InteractiveMap';
import { DashboardService } from '../../services/DashboardService';
import { ProjectService } from '../../services/ProjectService';
import { useTheme } from '../../context/ThemeContext';
import { ProjectStatus, MANAGEMENT_BOARDS, PROJECT_PHASE_COLORS } from '../../types';
import { AISummaryWidget } from '../../components/ai/AISummaryWidget';
import { AIRiskDashboard } from '../../components/ai/AIRiskDashboard';
import { AIAnomalyDetector } from '../../components/ai/AIAnomalyDetector';
import { AIContractorScoring } from '../../components/ai/AIContractorScoring';
import { AIResourceOptimizer } from '../../components/ai/AIResourceOptimizer';
import { StatCard } from '../../components/ui';


// ── Phase Badge ──────────────────────────────────────────
const PhaseBadge: React.FC<{ status: number }> = ({ status }) => {
    const phase = PROJECT_PHASE_COLORS[status as ProjectStatus];
    if (!phase) return <span className="text-[10px] text-gray-400">—</span>;
    return (
        <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
            style={{ background: `${phase.hex}18`, color: phase.hex, border: `1px solid ${phase.hex}40` }}
        >
            {phase.label}
        </span>
    );
};

// ── Progress Bar Inline ──────────────────────────────────
const ProgressBar: React.FC<{ value: number; color?: string }> = ({ value, color = '#f97316' }) => (
    <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color, minWidth: value > 0 ? '4px' : '0' }}
            />
        </div>
        <span className="text-[10px] font-bold text-gray-600 dark:text-slate-300 w-8 text-right">{value}%</span>
    </div>
);

// ── Empty State ──────────────────────────────────────────
const EmptyState: React.FC<{ icon: React.ElementType; message: string }> = ({ icon: Icon, message }) => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-full mb-3">
            <Icon className="w-6 h-6 text-gray-300 dark:text-slate-500" />
        </div>
        <p className="text-xs font-medium text-gray-400 dark:text-slate-500">{message}</p>
    </div>
);

// ═══════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════
const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();

    // ── Filter State ──
    const [selectedYear, setSelectedYear] = useState<number | null>(new Date().getFullYear());
    const [selectedBoard, setSelectedBoard] = useState<string>('all');

    const STALE_5M = 5 * 60 * 1000;

    // ── Data Fetching ──
    const { data: metrics, isLoading: loadingMetrics } = useQuery({
        queryKey: ['dashboard', 'overview', selectedYear],
        queryFn: () => DashboardService.getOverviewMetrics(selectedYear || new Date().getFullYear()),
        staleTime: STALE_5M,
    });

    const { data: projectRows, isLoading: loadingProjects } = useQuery({
        queryKey: ['dashboard', 'projectSummary'],
        queryFn: DashboardService.getProjectSummary,
        staleTime: STALE_5M,
    });

    const { data: projects } = useQuery({
        queryKey: ['projects', 'all'],
        queryFn: () => ProjectService.getAll(),
        staleTime: STALE_5M,
    });

    const { data: capitalVsDisbursement } = useQuery({
        queryKey: ['dashboard', 'capitalVsDisbursement', selectedYear],
        queryFn: () => DashboardService.getCapitalVsDisbursement(selectedYear || undefined),
        staleTime: STALE_5M,
    });


    const { data: risks, isLoading: loadingRisks } = useQuery({
        queryKey: ['dashboard', 'risks'],
        queryFn: DashboardService.getRisks,
        staleTime: STALE_5M,
    });

    // ── Derived ──
    const availableYears = useMemo(() => {
        const current = new Date().getFullYear();
        const years: number[] = [];
        for (let y = current + 1; y >= 2020; y--) years.push(y);
        return years;
    }, []);

    const filteredRows = useMemo(() => {
        if (!projectRows) return [];
        let list = [...projectRows];
        // Filter by year — project active during selected year
        if (selectedYear) {
            const yearStart = `${selectedYear}-01-01`;
            const yearEnd = `${selectedYear}-12-31`;
            list = list.filter(p => {
                const started = !p.startDate || p.startDate <= yearEnd;
                const notEnded = !p.expectedEndDate || p.expectedEndDate >= yearStart;
                return started && notEnded;
            });
        }
        // Filter by board
        if (selectedBoard !== 'all') {
            list = list.filter(p => p.managementBoard.toString() === selectedBoard);
        }
        return list;
    }, [projectRows, selectedBoard, selectedYear]);

    const filteredProjects = useMemo(() => {
        if (!projects) return [];
        let list = [...projects];
        if (selectedBoard !== 'all') {
            list = list.filter(p => p.ManagementBoard?.toString() === selectedBoard);
        }
        return list;
    }, [projects, selectedBoard]);

    const statusSummary = useMemo(() => {
        const prep = filteredRows.filter(r => r.status === ProjectStatus.Preparation).length;
        const exec = filteredRows.filter(r => r.status === ProjectStatus.Execution).length;
        const comp = filteredRows.filter(r => r.status === ProjectStatus.Completion).length;
        return { prep, exec, comp };
    }, [filteredRows]);

    return (
        <div className="space-y-6 pb-20 font-sans">
            {/* ═══════════════════════════════════════════════════
                HEADER + FILTERS
            ═══════════════════════════════════════════════════ */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-800 dark:text-slate-100 tracking-tight uppercase">
                        Trung tâm điều hành — Ban QLDA ĐTXD CN
                    </h2>
                    <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Cập nhật dữ liệu: {new Date().toLocaleDateString('vi-VN')}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    {/* Year filter */}
                    <div className="relative">
                        <select
                            value={selectedYear ?? 'all'}
                            onChange={e => setSelectedYear(e.target.value === 'all' ? null : parseInt(e.target.value))}
                            className="pl-3 pr-8 py-2 filter-primary min-w-[120px]"
                        >
                            <option value="all">Tất cả năm</option>
                            {availableYears.map(y => (
                                <option key={y} value={y}>Năm {y}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500 pointer-events-none" />
                    </div>

                    {/* Board filter */}
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

                    {/* Export */}
                    <button
                        onClick={() => navigate('/reports')}
                        className="btn btn-primary"
                    >
                        <FileBox className="w-4 h-4" /> Xuất báo cáo
                    </button>
                </div>
            </div>

            {/* Active filter */}
            {(selectedYear !== new Date().getFullYear() || selectedBoard !== 'all') && selectedYear !== null && (
                <div className="flex items-center gap-2 -mt-2">
                    <span className="text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-full border border-primary-200 dark:border-primary-800 flex items-center gap-1.5">
                        <Filter className="w-3 h-3" />
                        {selectedYear && selectedYear !== new Date().getFullYear() && `Năm ${selectedYear}`}
                        {selectedBoard !== 'all' && ` • Ban QLDA ${selectedBoard}`}
                    </span>
                    <button
                        onClick={() => { setSelectedYear(new Date().getFullYear()); setSelectedBoard('all'); }}
                        className="flex items-center gap-1 text-xs font-bold text-gray-500 dark:text-slate-400 hover:text-red-500 transition-colors"
                    >
                        <X className="w-3 h-3" /> Xóa bộ lọc
                    </button>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════
                1. STAT CARDS — 4 cards
            ═══════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                    label="Dự án đang quản lý"
                    value={filteredRows.length.toString()}
                    icon={<Building2 className="w-5 h-5 flex-shrink-0" />}
                    color="slate"
                    loading={loadingProjects}
                    onClick={() => navigate('/projects')}
                    footer={
                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                                style={{ background: '#F59E0B18', color: '#B45309', border: '1px solid #F59E0B40' }}>
                                <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                                Chuẩn bị: {statusSummary.prep}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                                style={{ background: '#10B98118', color: '#047857', border: '1px solid #10B98140' }}>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Thực hiện: {statusSummary.exec}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                                style={{ background: '#6366F118', color: '#4338CA', border: '1px solid #6366F140' }}>
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                Kết thúc: {statusSummary.comp}
                            </span>
                        </div>
                    }
                />
                <StatCard
                    label="Tổng vốn đầu tư"
                    value={metrics ? formatShortCurrency(metrics.totalInvestment) : '—'}
                    icon={<Wallet className="w-5 h-5 flex-shrink-0" />}
                    color="amber"
                    progressLabel="Tỷ trọng vốn năm nay"
                    progressPercentage={metrics && metrics.totalInvestment > 0 ? Math.round((metrics.yearlyPlanned / metrics.totalInvestment) * 100) : 0}
                    loading={loadingMetrics}
                />
                <StatCard
                    label={selectedYear ? `Kế hoạch vốn ${selectedYear}` : 'Tổng kế hoạch vốn'}
                    value={metrics ? formatShortCurrency(metrics.yearlyPlanned) : '—'}
                    targetValue={metrics && metrics.totalInvestment ? formatShortCurrency(metrics.totalInvestment) : undefined}
                    icon={<TrendingUp className="w-5 h-5 flex-shrink-0" />}
                    color="slate"
                    progressLabel="Giải ngân trên KH"
                    progressPercentage={metrics ? metrics.yearlyDisbursementRate : 0}
                    loading={loadingMetrics}
                />
                <StatCard
                    label={selectedYear ? `Lũy kế giải ngân ${selectedYear}` : 'Lũy kế giải ngân'}
                    value={metrics ? formatShortCurrency(metrics.yearlyDisbursed) : '—'}
                    targetValue={metrics ? formatShortCurrency(metrics.yearlyPlanned) : undefined}
                    icon={<Activity className="w-5 h-5 flex-shrink-0" />}
                    color="emerald"
                    progressLabel="Hoàn thành kế hoạch"
                    progressPercentage={metrics ? metrics.yearlyDisbursementRate : 0}
                    trendLabel="Tiến độ"
                    trendPercentage={metrics ? metrics.yearlyDisbursementRate : 0}
                    loading={loadingMetrics}
                />
            </div>

            {/* ═══════════════════════════════════════════════════
                2. BẢNG TỔNG HỢP DỰ ÁN
            ═══════════════════════════════════════════════════ */}
            <div className="bg-[#FCF9F2] dark:bg-slate-800 rounded-2xl shadow-sm border border-[#ece7de] dark:border-slate-700 overflow-hidden">
                <div className="flex justify-between items-center px-5 py-3 border-b border-[#ece7de]/60 dark:border-slate-700">
                    <h3 className="section-header text-sm">
                        <div className="section-icon"><Building2 className="w-5 h-5" /></div>
                        Tổng hợp dự án
                    </h3>
                    <button
                        onClick={() => navigate('/projects')}
                        className="flex items-center gap-1 text-[11px] font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors"
                    >
                        Xem chi tiết <ArrowRight className="w-3 h-3" />
                    </button>
                </div>

                {loadingProjects ? (
                    <div className="p-6 space-y-3">
                        {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-50 dark:bg-slate-700 rounded-lg animate-pulse" />)}
                    </div>
                ) : filteredRows.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700 bg-[#F5EFE6] dark:bg-slate-800">
                                    <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest">Tên dự án</th>
                                    <th className="px-4 py-3.5 text-[10px] font-black uppercase tracking-widest">Ban QLDA</th>
                                    <th className="px-4 py-3.5 text-[10px] font-black uppercase tracking-widest">Giai đoạn</th>
                                    <th className="px-4 py-3.5 text-[10px] font-black uppercase tracking-widest w-36">Tiến độ</th>
                                    <th className="px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-right">Vốn ĐT</th>
                                    <th className="px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-right">Giải ngân</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                {filteredRows.map((row) => {
                                    const boardDef = MANAGEMENT_BOARDS.find(b => b.value === row.managementBoard);
                                    return (
                                        <tr
                                            key={row.projectId}
                                            className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group"
                                            onClick={() => navigate(`/projects/${row.projectId}`)}
                                        >
                                            <td className="px-5 py-3.5">
                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1 mb-0.5">
                                                    {row.projectName}
                                                </p>
                                                {row.startDate && row.expectedEndDate && (
                                                    <p className="text-xs text-slate-400 dark:text-slate-500">
                                                        {new Date(row.startDate).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })} → {new Date(row.expectedEndDate).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span
                                                    className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                                                    style={{
                                                        background: `${boardDef?.hex || '#888'}15`,
                                                        color: boardDef?.hex || '#888',
                                                    }}
                                                >
                                                    {row.boardLabel}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5"><PhaseBadge status={row.status} /></td>
                                            <td className="px-4 py-3.5">
                                                <ProgressBar value={row.progress} color={boardDef?.hex} />
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <span className="text-[13px] font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                                                    {formatShortCurrency(row.totalInvestment)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <span className={`text-[13px] font-semibold tabular-nums ${row.paymentProgress >= 50 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>
                                                    {row.paymentProgress}%
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <EmptyState icon={Building2} message="Không có dự án nào" />
                )}
            </div>

            {/* ═══════════════════════════════════════════════════
                3. GIẢI NGÂN THEO BAN (full width)
            ═══════════════════════════════════════════════════ */}
            {capitalVsDisbursement && (
                <div className="bg-[#FCF9F2] dark:bg-slate-800 p-5 rounded-2xl shadow-lg border border-[#ece7de] dark:border-slate-700">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="section-header text-sm">
                            <div className="section-icon"><Wallet className="w-5 h-5" /></div>
                            Kế hoạch vốn và Thực giải ngân
                        </h3>
                        <div className="flex gap-3">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 dark:text-slate-400">
                                <div className="w-2.5 h-2.5 rounded" style={{ background: theme === 'dark' ? '#475569' : '#E5E7EB' }} /> Kế hoạch
                            </span>
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 dark:text-slate-400">
                                <div className="w-2.5 h-2.5 rounded" style={{ background: '#f97316' }} /> Thực giải ngân
                            </span>
                        </div>
                    </div>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={capitalVsDisbursement} margin={{ top: 5, right: 10, left: -10, bottom: 0 }} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#E5E7EB'} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} dy={6} tick={(props: any) => {
                                    const { x, y, payload } = props;
                                    const item = capitalVsDisbursement?.find((d: any) => d.name === payload.value);
                                    return (
                                        <text x={x} y={y} textAnchor="middle" fontSize={11} fontWeight={700} fill={item?.color || (theme === 'dark' ? '#94A3B8' : '#6B7280')} dy={6}>
                                            {payload.value}
                                        </text>
                                    );
                                }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#94A3B8' : '#6B7280', fontSize: 10, fontWeight: 600 }} unit=" Tỷ" />
                                <RechartsTooltip
                                    content={({ active, payload, label }: any) => {
                                        if (!active || !payload?.[0]) return null;
                                        const d = payload[0].payload;
                                        return (
                                            <div className="bg-[#FCF9F2] dark:bg-slate-800 px-3 py-2 rounded-xl shadow-xl border border-gray-200 dark:border-slate-600">
                                                <p className="text-[10px] font-black text-gray-700 dark:text-slate-200 mb-0.5">{label}</p>
                                                <p className="text-[9px] text-gray-600 dark:text-slate-300">Kế hoạch: <strong>{d.planned} Tỷ</strong></p>
                                                <p className="text-[9px] text-gray-600 dark:text-slate-300">Thực giải ngân: <strong>{d.actual} Tỷ</strong></p>
                                                <p className="text-[9px] text-gray-600 dark:text-slate-300">Tỷ lệ: <strong>{d.rate}%</strong></p>
                                            </div>
                                        );
                                    }}
                                    cursor={{ fill: theme === 'dark' ? '#1E293B' : '#F3F4F6' }}
                                />
                                <Bar dataKey="planned" fill={theme === 'dark' ? '#475569' : '#E5E7EB'} radius={[4, 4, 0, 0]} maxBarSize={40} />
                                <Bar dataKey="actual" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════
                AI HUB — 4 tính năng AI + Tóm tắt
            ═══════════════════════════════════════════════════ */}
            <div className="space-y-4">
                <h3 className="section-header text-sm">
                    <div className="section-icon"><Brain className="w-5 h-5" /></div>
                    Trợ lý AI
                </h3>
                <AISummaryWidget />
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <AIRiskDashboard />
                    <AIAnomalyDetector />
                    <AIContractorScoring />
                    <AIResourceOptimizer />
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════
                4. MAP + ALERTS
            ═══════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 min-h-[300px] xl:h-[500px]">
                {/* Map (2/3) */}
                <div className="xl:col-span-2 bg-[#FCF9F2] dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-[#ece7de] dark:border-slate-700 relative overflow-hidden h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4 shrink-0">
                        <h3 className="section-header">
                            <div className="section-icon"><MapIcon className="w-5 h-5" /></div>
                            Bản đồ vị trí dự án
                        </h3>
                    </div>
                    <div className="flex-1 w-full bg-gray-100 dark:bg-slate-700 rounded-2xl relative border border-gray-200 dark:border-slate-600 overflow-hidden z-0">
                        {loadingProjects ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                            </div>
                        ) : (
                            <InteractiveMap projects={filteredProjects} />
                        )}
                        {/* Legend */}
                        <div className="absolute top-4 right-4 bg-[#FCF9F2]/90 dark:bg-slate-800 backdrop-blur-sm p-3 rounded-xl border border-[#ece7de] dark:border-slate-600 shadow-xl z-[1000]">
                            <h4 className="text-[10px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Chú thích</h4>
                            <div className="space-y-2">
                                {Object.entries(PROJECT_PHASE_COLORS).map(([key, phase]) => (
                                    <div key={key} className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-700 shadow-lg" style={{ backgroundColor: phase.hex }} />
                                        <span className="text-[10px] font-bold text-gray-600 dark:text-slate-300">{phase.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alerts (1/3) */}
                <div className="bg-[#FCF9F2] dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-red-100 dark:border-red-900/50 relative overflow-hidden h-full flex flex-col">
                    <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none"><AlertTriangle className="w-32 h-32 text-red-500" /></div>
                    <h3 className="text-sm font-black text-red-600 dark:text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10 shrink-0" style={{ paddingLeft: '0.75rem', borderLeft: '3px solid #EF4444' }}>
                        <AlertTriangle className="w-4 h-4" /> Cảnh báo quan trọng
                    </h3>
                    <div className="space-y-3 relative z-10 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {loadingRisks ? (
                            <div className="space-y-2">
                                <div className="h-16 bg-red-50/50 dark:bg-red-900/10 rounded-xl animate-pulse" />
                                <div className="h-16 bg-red-50/50 dark:bg-red-900/10 rounded-xl animate-pulse" />
                            </div>
                        ) : risks && risks.length > 0 ? (
                            risks.map(r => (
                                <div key={r.id} className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-xl flex items-start gap-3 transition-transform hover:scale-[1.02]">
                                    <div className="p-1.5 bg-[#FCF9F2] dark:bg-slate-700 rounded-lg text-red-500 shadow-lg shrink-0">
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
                    <button
                        onClick={() => navigate('/reports')}
                        className="w-full mt-4 py-2 bg-[#FCF9F2] dark:bg-slate-700 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0 shadow-lg hover:shadow"
                    >
                        Xem chi tiết báo cáo rủi ro
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
