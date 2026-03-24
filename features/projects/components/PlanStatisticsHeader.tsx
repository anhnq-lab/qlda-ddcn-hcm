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

    const CARD_STYLES: Record<number, string> = {
        0: 'stat-card-blue',
        1: 'stat-card-amber',
        2: 'stat-card-emerald',
        3: 'stat-card-rose',
        4: 'stat-card-violet',
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map((stat, index) => {
                const s = CARD_STYLES[index] || CARD_STYLES[0];
                return (
                    <div
                        key={index}
                        onClick={() => stat.filter && onFilterChange?.(stat.filter)}
                        className={`stat-card ${s} ${onFilterChange && stat.filter ? 'cursor-pointer hover:shadow-md' : ''}`}
                    >
                        <div className="flex items-center justify-between w-full relative z-10">
                            <div>
                                <p className="stat-card-label">
                                    {stat.label}
                                </p>
                                <div className="mt-1 flex items-baseline gap-2">
                                    <span className="stat-card-value tabular-nums">
                                        {stat.value}
                                    </span>
                                    {stat.subtitle && (
                                        <span className="text-sm font-semibold text-slate-500">
                                            {stat.subtitle}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="stat-card-icon">
                                <stat.icon className={`w-5 h-5 ${stat.alert ? 'animate-pulse' : ''}`} />
                            </div>
                        </div>

                        {/* Progress bar for completion card */}
                        {stat.label === 'Hoàn thành' && (
                            <div className="w-full mt-2">
                                <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                                        style={{ width: `${completionRate}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Click hint */}
                        {onFilterChange && stat.filter && (
                            <div className="absolute bottom-1 right-2 text-[9px] text-slate-400 font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
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
