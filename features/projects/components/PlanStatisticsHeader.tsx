import React from 'react';
import { Task, TaskStatus } from '@/types';
import {
    ListTodo,
    PlayCircle,
    CheckCircle2,
    AlertTriangle,
    Clock,
    TrendingUp
} from 'lucide-react';
import { TaskFilter } from './TaskFilterBar';

interface PlanStatisticsHeaderProps {
    tasks: Task[];
    onFilterChange?: (filter: TaskFilter) => void;
}

export const PlanStatisticsHeader: React.FC<PlanStatisticsHeaderProps> = ({ tasks, onFilterChange }) => {
    const totalTasks = tasks.length;
    const inProgressTasks = tasks.filter(t => t.Status === TaskStatus.InProgress).length;
    const reviewTasks = tasks.filter(t => t.Status === TaskStatus.Review).length;
    const doneTasks = tasks.filter(t => t.Status === TaskStatus.Done).length;
    const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Overdue
    const overdueTasks = tasks.filter(t => {
        if (t.Status === TaskStatus.Done) return false;
        if (!t.DueDate) return false;
        const dd = new Date(t.DueDate); dd.setHours(0, 0, 0, 0);
        return dd < today;
    }).length;

    // Upcoming 3 days
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    const upcomingTasks = tasks.filter(t => {
        if (t.Status === TaskStatus.Done) return false;
        if (!t.DueDate) return false;
        const dd = new Date(t.DueDate); dd.setHours(0, 0, 0, 0);
        return dd >= today && dd <= threeDaysLater;
    }).length;

    const CARD_STYLES: Record<number, { bg: string; border: string }> = {
        0: { bg: 'linear-gradient(135deg, #404040 0%, #333333 100%)', border: '#8A8A8A' },
        1: { bg: 'linear-gradient(135deg, #4A4535 0%, #3D3A2D 100%)', border: '#A89050' },
        2: { bg: 'linear-gradient(135deg, #5A4F35 0%, #4A4230 100%)', border: '#C4A035' },
        3: { bg: 'linear-gradient(135deg, #6B5A30 0%, #5A4A25 100%)', border: '#D4A017' },
        4: { bg: 'linear-gradient(135deg, #3A3530 0%, #2D2A22 100%)', border: '#8B7355' },
    };

    type StatItem = {
        label: string;
        value: string | number;
        subtitle?: string;
        icon: any;
        alert?: boolean;
        filter?: TaskFilter;
    };

    const stats: StatItem[] = [
        {
            label: 'Tổng công việc',
            value: totalTasks,
            icon: ListTodo,
            filter: 'all',
        },
        {
            label: 'Đang thực hiện',
            value: inProgressTasks + reviewTasks,
            subtitle: reviewTasks > 0 ? `(${reviewTasks} chờ duyệt)` : undefined,
            icon: PlayCircle,
            filter: 'in-progress',
        },
        {
            label: 'Hoàn thành',
            value: `${doneTasks}/${totalTasks}`,
            subtitle: `${completionRate}%`,
            icon: CheckCircle2,
            filter: 'completed',
        },
        {
            label: overdueTasks > 0 ? 'Quá hạn' : 'Sắp tới (3 ngày)',
            value: overdueTasks > 0 ? overdueTasks : upcomingTasks,
            icon: overdueTasks > 0 ? AlertTriangle : Clock,
            alert: overdueTasks > 0,
            filter: overdueTasks > 0 ? 'overdue' : 'this-week',
            subtitle: overdueTasks > 0 ? 'Cần xử lý ngay!' : upcomingTasks > 0 ? 'Sắp đến hạn' : undefined,
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
                const s = CARD_STYLES[index] || CARD_STYLES[0];
                return (
                    <div
                        key={index}
                        onClick={() => stat.filter && onFilterChange?.(stat.filter)}
                        className={`relative overflow-hidden rounded-2xl text-white p-4 shadow-xl transition-all duration-300 ${onFilterChange && stat.filter
                            ? 'cursor-pointer hover:scale-[1.03] hover:shadow-2xl active:scale-[0.98]'
                            : 'hover:scale-[1.02] hover:shadow-2xl'
                            }`}
                        style={{ background: s.bg, borderTop: `3px solid ${s.border}`, boxShadow: '0 4px 14px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)' }}
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-8 translate-x-8" />

                        <div className="relative flex items-start justify-between">
                            <div>
                                <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-white/90">
                                    {stat.label}
                                </p>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-2xl font-black text-white tabular-nums drop-shadow-sm">
                                        {stat.value}
                                    </span>
                                    {stat.subtitle && (
                                        <span className="text-sm font-semibold text-white/80">
                                            {stat.subtitle}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="p-2 rounded-lg bg-white/20 shadow-sm">
                                <stat.icon className={`w-5 h-5 text-white ${stat.alert ? 'animate-pulse' : ''}`} />
                            </div>
                        </div>

                        {/* Progress bar for completion card */}
                        {stat.label === 'Hoàn thành' && (
                            <div className="mt-3">
                                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-white/80 transition-all duration-500 rounded-full"
                                        style={{ width: `${completionRate}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Click hint */}
                        {onFilterChange && stat.filter && (
                            <div className="absolute bottom-1.5 right-2 text-[8px] text-white/40 font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                                Click để lọc
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default PlanStatisticsHeader;
