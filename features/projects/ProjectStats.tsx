import React from 'react';
import { Project, ProjectStatus } from '../../types';
import { Wallet, TrendingUp, FolderOpen, Activity, ArrowRight } from 'lucide-react';
import { formatShortCurrency as formatCurrency } from '../../utils/format';

interface ProjectStatsProps {
    projects: Project[];
    onFilterPhase?: (phase: ProjectStatus) => void;
}

// Mini phase pill
const PhasePill: React.FC<{
    label: string;
    count: number;
    dot: string;
    bg: string;
    border: string;
    color: string;
    onClick?: () => void;
}> = ({ label, count, dot, bg, border, color, onClick }) => (
    <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
        style={{ background: bg, border: `1px solid ${border}`, color }}
        onClick={onClick}
        title={`${count} dự án ${label}`}
    >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />
        {label}: {count}
    </span>
);

export const ProjectStats: React.FC<ProjectStatsProps> = ({ projects, onFilterPhase }) => {
    const totalProjects = projects.length;

    // Phase breakdown
    const prepProjects = projects.filter(p => Number(p.Status) === ProjectStatus.Preparation);
    const execProjects = projects.filter(p => Number(p.Status) === ProjectStatus.Execution);
    const doneProjects = projects.filter(p => Number(p.Status) === ProjectStatus.Completion);

    // Capital
    const totalCapital = projects.reduce((sum, p) => sum + (p.TotalInvestment || 0), 0);
    const avgCapitalPerProject = totalProjects > 0 ? totalCapital / totalProjects : 0;

    // Disbursement
    const avgDisbursement = totalProjects > 0
        ? projects.reduce((sum, p) => sum + (p.PaymentProgress || 0), 0) / totalProjects
        : 0;
    const aboveAvgProjects = projects.filter(p => (p.PaymentProgress || 0) > avgDisbursement).length;
    const highDisbursementProjects = projects.filter(p => (p.PaymentProgress || 0) >= 50).length;

    // Physical progress (execution only)
    const execWithProgress = execProjects.filter(p => p.PhysicalProgress !== undefined && p.PhysicalProgress !== null);
    const avgPhysical = execWithProgress.length > 0
        ? execWithProgress.reduce((sum, p) => sum + (p.PhysicalProgress || 0), 0) / execWithProgress.length
        : 0;
    const behindSchedule = execProjects.filter(p => (p.PhysicalProgress || 0) < 30).length;

    const disbursementColor = avgDisbursement >= 50 ? '#047857' : avgDisbursement >= 30 ? '#B45309' : '#B91C1C';
    const disbursementBg = avgDisbursement >= 50 ? '#10B98112' : avgDisbursement >= 30 ? '#F59E0B12' : '#EF444412';

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

            {/* Card 1: Tổng dự án + Phase breakdown */}
            <div className="stat-card stat-card-blue cursor-pointer hover:shadow-md"
                onClick={() => onFilterPhase?.(undefined as any)}>
                <div className="flex items-center justify-between">
                    <span className="stat-card-label">Tổng số dự án</span>
                    <div className="stat-card-icon bg-blue-50 dark:bg-blue-500/10">
                        <FolderOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                </div>
                <div className="flex items-end justify-between">
                    <p className="stat-card-value tabular-nums">{totalProjects}</p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mb-0.5">dự án</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-0.5">
                    <PhasePill label="CB" count={prepProjects.length}
                        dot="#3B82F6" bg="#3B82F612" border="#3B82F640" color="#1D4ED8"
                        onClick={() => onFilterPhase?.(ProjectStatus.Preparation)} />
                    <PhasePill label="TH" count={execProjects.length}
                        dot="#F59E0B" bg="#F59E0B12" border="#F59E0B40" color="#B45309"
                        onClick={() => onFilterPhase?.(ProjectStatus.Execution)} />
                    <PhasePill label="KT" count={doneProjects.length}
                        dot="#10B981" bg="#10B98112" border="#10B98140" color="#047857"
                        onClick={() => onFilterPhase?.(ProjectStatus.Completion)} />
                </div>
            </div>

            {/* Card 2: Tổng vốn + vốn trung bình */}
            <div className="stat-card stat-card-emerald cursor-default">
                <div className="flex items-center justify-between">
                    <span className="stat-card-label">Tổng vốn đầu tư</span>
                    <div className="stat-card-icon bg-emerald-50 dark:bg-emerald-500/10">
                        <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                </div>
                <p className="stat-card-value tabular-nums">{formatCurrency(totalCapital)}</p>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                    <ArrowRight className="w-3 h-3" />
                    <span>TB: <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(avgCapitalPerProject)}</strong> / dự án</span>
                </div>
            </div>

            {/* Card 3: Giải ngân TB + context */}
            <div className="stat-card cursor-default" style={{ background: disbursementBg }}>
                <div className="flex items-center justify-between">
                    <span className="stat-card-label">Giải ngân TB</span>
                    <div className="stat-card-icon" style={{ background: disbursementBg }}>
                        <TrendingUp className="w-4 h-4" style={{ color: disbursementColor }} />
                    </div>
                </div>
                <div className="flex items-end gap-2">
                    <p className="stat-card-value tabular-nums" style={{ color: disbursementColor }}>
                        {avgDisbursement.toFixed(1)}%
                    </p>
                    <span className={`text-[10px] font-bold mb-0.5 ${avgDisbursement >= 50 ? 'text-emerald-500' : avgDisbursement >= 30 ? 'text-amber-500' : 'text-red-500'}`}>
                        {avgDisbursement >= 50 ? '▲ Tốt' : avgDisbursement >= 30 ? '◆ Trung bình' : '▼ Thấp'}
                    </span>
                </div>
                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                    <strong className="text-slate-600 dark:text-slate-300">{highDisbursementProjects}</strong> dự án ≥ 50% kế hoạch
                    {aboveAvgProjects > 0 && ` · ${aboveAvgProjects} trên mức TB`}
                </p>
            </div>

            {/* Card 4: Tiến độ thực hiện */}
            <div className="stat-card stat-card-violet cursor-default">
                <div className="flex items-center justify-between">
                    <span className="stat-card-label">Đang thực hiện</span>
                    <div className="stat-card-icon bg-violet-50 dark:bg-violet-500/10">
                        <Activity className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    </div>
                </div>
                <div className="flex items-end gap-2">
                    <p className="stat-card-value tabular-nums">{execProjects.length}</p>
                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mb-0.5">dự án</span>
                </div>
                {execProjects.length > 0 ? (
                    <div className="space-y-1 mt-0.5">
                        <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-400 dark:text-slate-500 font-semibold">Tiến độ vật lý TB</span>
                            <span className="font-black text-violet-600 dark:text-violet-400">{avgPhysical.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-violet-500 rounded-full transition-all duration-700"
                                style={{ width: `${Math.min(100, avgPhysical)}%` }} />
                        </div>
                        {behindSchedule > 0 && (
                            <p className="text-[10px] font-semibold text-rose-500">
                                ⚠ {behindSchedule} dự án tiến độ dưới 30%
                            </p>
                        )}
                    </div>
                ) : (
                    <p className="text-[10px] text-slate-400">Không có dự án đang thi công</p>
                )}
            </div>

        </div>
    );
};
