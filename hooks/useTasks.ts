import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TaskService } from '../services/TaskService';
import { Task, TaskStatus } from '../types';

// Keys
export const taskKeys = {
    all: ['tasks'] as const,
    lists: () => [...taskKeys.all, 'list'] as const,
    list: (projectId?: string) => [...taskKeys.lists(), { projectId }] as const,
    details: () => [...taskKeys.all, 'detail'] as const,
    detail: (id: string) => [...taskKeys.details(), id] as const,
    stats: (projectId?: string) => [...taskKeys.all, 'stats', { projectId }] as const,
};

// Hooks

export const useTasks = (options: { projectId?: string } = {}) => {
    return useQuery({
        queryKey: taskKeys.list(options.projectId),
        queryFn: async () => {
            if (options.projectId) {
                return TaskService.getTasksByProject(options.projectId);
            }
            return TaskService.getAllTasks();
        },
    });
};

export const useTask = (id: string | undefined) => {
    return useQuery({
        queryKey: taskKeys.detail(id || ''),
        queryFn: () => TaskService.getTaskById(id!),
        enabled: !!id,
    });
};

export const useCreateTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (task: Task) => Promise.resolve(TaskService.saveTask(task)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
            queryClient.invalidateQueries({ queryKey: taskKeys.stats() });
        },
    });
};

export const useUpdateTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (task: Task) => Promise.resolve(TaskService.saveTask(task)),
        onMutate: async (updatedTask) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
            // Snapshot previous state for rollback
            const previousLists = queryClient.getQueriesData({ queryKey: taskKeys.lists() });
            // Optimistically update all task lists
            queryClient.setQueriesData<Task[]>({ queryKey: taskKeys.lists() }, (old) =>
                old?.map(t => t.TaskID === updatedTask.TaskID ? { ...t, ...updatedTask } : t)
            );
            return { previousLists };
        },
        onError: (_err, _task, context) => {
            // Rollback on error
            context?.previousLists?.forEach(([key, data]) => {
                queryClient.setQueryData(key, data);
            });
        },
        onSettled: (_data, _err, task) => {
            queryClient.invalidateQueries({ queryKey: taskKeys.detail(task.TaskID) });
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
            queryClient.invalidateQueries({ queryKey: taskKeys.stats() });
        },
    });
};

export const useDeleteTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => Promise.resolve(TaskService.deleteTask(id)),
        onMutate: async (deletedId) => {
            await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
            const previousLists = queryClient.getQueriesData({ queryKey: taskKeys.lists() });
            // Optimistically remove from lists
            queryClient.setQueriesData<Task[]>({ queryKey: taskKeys.lists() }, (old) =>
                old?.filter(t => t.TaskID !== deletedId)
            );
            return { previousLists };
        },
        onError: (_err, _id, context) => {
            context?.previousLists?.forEach(([key, data]) => {
                queryClient.setQueryData(key, data);
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
            queryClient.invalidateQueries({ queryKey: taskKeys.stats() });
        },
    });
};

// Helper for statistics
export const useTaskStatistics = (projectId?: string) => {
    return useQuery({
        queryKey: taskKeys.stats(projectId),
        queryFn: async () => {
            const tasks = await (projectId
                ? TaskService.getTasksByProject(projectId)
                : TaskService.getAllTasks());

            const byStatus = {
                [TaskStatus.Todo]: 0,
                [TaskStatus.InProgress]: 0,
                [TaskStatus.Review]: 0,
                [TaskStatus.Done]: 0,
            };

            let overdue = 0;
            const today = new Date().toISOString().split('T')[0];

            tasks.forEach(t => {
                const status = t.Status as TaskStatus; // Ensure type safety
                if (byStatus[status] !== undefined) {
                    byStatus[status]++;
                }
                if (t.DueDate < today && t.Status !== TaskStatus.Done) {
                    overdue++;
                }
            });

            return {
                total: tasks.length,
                byStatus,
                overdue,
            };
        }
    });
};
