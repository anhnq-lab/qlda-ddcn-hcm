import React from 'react';
import { Task, TaskStatus } from '@/types';

interface ProjectSmartAlertsProps {
    tasks: Task[];
}

export const ProjectSmartAlerts: React.FC<ProjectSmartAlertsProps> = ({ tasks }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threeDays = new Date(today);
    threeDays.setDate(threeDays.getDate() + 3);

    const overdue = tasks.filter(t => {
        if (t.Status === TaskStatus.Done) return false;
        if (!t.DueDate) return false;
        const d = new Date(t.DueDate); 
        d.setHours(0, 0, 0, 0);
        return d < today;
    });

    const upcoming = tasks.filter(t => {
        if (t.Status === TaskStatus.Done) return false;
        if (!t.DueDate) return false;
        const d = new Date(t.DueDate); 
        d.setHours(0, 0, 0, 0);
        return d >= today && d <= threeDays;
    });

    const todayDone = tasks.filter(t => {
        if (t.Status !== TaskStatus.Done) return false;
        if (!t.ActualEndDate) return false;
        const d = new Date(t.ActualEndDate); 
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
    });

    const alerts: { icon: string; text: string; type: 'danger' | 'warn' | 'success' }[] = [];
    if (overdue.length > 0) alerts.push({ icon: '🔴', text: `${overdue.length} công việc đã quá hạn — cần xử lý ngay!`, type: 'danger' });
    if (upcoming.length > 0) alerts.push({ icon: '⚠️', text: `${upcoming.length} công việc sẽ đến hạn trong 3 ngày tới`, type: 'warn' });
    if (todayDone.length > 0) alerts.push({ icon: '✅', text: `${todayDone.length} công việc vừa hoàn thành hôm nay`, type: 'success' });

    if (alerts.length === 0) return null;

    const typeStyles = {
        danger: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400',
        warn: 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-400',
        success: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400',
    };

    return (
        <div className="flex flex-wrap gap-2">
            {alerts.map((a, i) => (
                <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${typeStyles[a.type]}`}>
                    <span>{a.icon}</span>
                    <span>{a.text}</span>
                </div>
            ))}
        </div>
    );
};
