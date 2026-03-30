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
import { StatCard } from '../../../components/ui';
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

    const CARD_COLORS: Record<number, "blue" | "amber" | "emerald" | "rose" | "violet" | "slate"> = {
        0: 'slate',    // Tổng số - neutral
        1: 'amber',    // Đang chạy - Orange theme
        2: 'emerald',  // Hoàn thành - xanh lá
        3: 'rose',     // Trễ - Đỏ báo động
        4: 'slate',
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
                const color = CARD_COLORS[index] || "blue";
                return (
                    <div 
                        key={index} 
                        onClick={() => stat.filter && onFilterChange?.(stat.filter)}
                        className={onFilterChange && stat.filter ? 'cursor-pointer group relative' : ''}
                    >
                        <StatCard
                            label={stat.label}
                            value={stat.value}
                            icon={<stat.icon className={`w-5 h-5 ${stat.alert ? 'animate-pulse text-rose-500' : ''}`} />}
                            color={color}
                            progressPercentage={stat.label === 'Hoàn thành' ? completionRate : undefined}
                            footer={
                                stat.subtitle ? (
                                    <div className="text-sm font-semibold text-slate-500 mt-1">
                                        {stat.subtitle}
                                    </div>
                                ) : undefined
                            }
                        />
                        {/* Click hint */}
                        {onFilterChange && stat.filter && (
                            <div className="absolute top-2 right-2 text-[9px] text-slate-400 font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                                Lọc
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default PlanStatisticsHeader;
