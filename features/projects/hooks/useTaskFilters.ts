import { useMemo } from 'react';
import { Task, TaskStatus } from '@/types';
import { TaskFilter } from '../components/TaskFilterBar';

export interface TaskCounts {
    all: number;
    myTasks: number;
    overdue: number;
    thisWeek: number;
    critical: number;
    inProgress: number;
    completed: number;
}

/**
 * Hook tách logic filter/search tasks từ ProjectPlanTab.
 * Giảm file size chính ~80 dòng.
 */
export function useTaskFilters(
    tasks: Task[],
    currentFilter: TaskFilter,
    searchQuery: string,
    currentUserId?: string
) {
    const filteredTasks = useMemo(() => {
        let filtered = [...tasks];

        // Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(t =>
                t.Title.toLowerCase().includes(q) ||
                t.Description?.toLowerCase().includes(q)
            );
        }

        // Filter
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);

        switch (currentFilter) {
            case 'my-tasks':
                filtered = filtered.filter(t =>
                    t.AssigneeID === currentUserId ||
                    t.Assignees?.some(a => a.EmployeeID === currentUserId)
                );
                break;
            case 'overdue':
                filtered = filtered.filter(t => {
                    if (t.Status === TaskStatus.Done || !t.DueDate) return false;
                    return new Date(t.DueDate) < today;
                });
                break;
            case 'this-week':
                filtered = filtered.filter(t => {
                    if (!t.DueDate) return false;
                    const d = new Date(t.DueDate);
                    return d >= today && d <= weekEnd;
                });
                break;
            case 'critical':
                filtered = filtered.filter(t => t.IsCritical);
                break;
            case 'in-progress':
                filtered = filtered.filter(t =>
                    t.Status === TaskStatus.InProgress || t.Status === TaskStatus.Review
                );
                break;
            case 'completed':
                filtered = filtered.filter(t => t.Status === TaskStatus.Done);
                break;
        }

        return filtered;
    }, [tasks, currentFilter, searchQuery, currentUserId]);

    const taskCounts = useMemo<TaskCounts>(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);

        return {
            all: tasks.length,
            myTasks: tasks.filter(t =>
                t.AssigneeID === currentUserId ||
                t.Assignees?.some(a => a.EmployeeID === currentUserId)
            ).length,
            overdue: tasks.filter(t => {
                if (t.Status === TaskStatus.Done || !t.DueDate) return false;
                return new Date(t.DueDate) < today;
            }).length,
            thisWeek: tasks.filter(t => {
                if (!t.DueDate) return false;
                const d = new Date(t.DueDate);
                return d >= today && d <= weekEnd;
            }).length,
            critical: tasks.filter(t => t.IsCritical).length,
            inProgress: tasks.filter(t =>
                t.Status === TaskStatus.InProgress || t.Status === TaskStatus.Review
            ).length,
            completed: tasks.filter(t => t.Status === TaskStatus.Done).length
        };
    }, [tasks, currentUserId]);

    return { filteredTasks, taskCounts };
}
