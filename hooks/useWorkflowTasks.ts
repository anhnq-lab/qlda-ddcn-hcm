import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WorkflowService } from '../services/WorkflowService';
import { WorkflowTask } from '../types/workflow.types';

// Keys
export const workflowTaskKeys = {
    all: ['workflow_tasks'] as const,
    lists: () => [...workflowTaskKeys.all, 'list'] as const,
    list: (projectId?: string) => [...workflowTaskKeys.lists(), { projectId }] as const,
    details: () => [...workflowTaskKeys.all, 'detail'] as const,
    detail: (id: string) => [...workflowTaskKeys.details(), id] as const,
};

// Hook để lấy toàn bộ workflow tasks cho một project
export const useProjectWorkflowTasks = (projectId?: string) => {
    return useQuery({
        queryKey: workflowTaskKeys.list(projectId),
        queryFn: async () => {
            if (!projectId) return [];
            return WorkflowService.getProjectWorkflowTasks(projectId);
        },
        enabled: !!projectId,
    });
};

// Hook để lấy toàn bộ workflow tasks cho tất cả projects (cho TaskList)
export const useAllWorkflowTasks = () => {
    return useQuery({
        queryKey: workflowTaskKeys.lists(),
        queryFn: async () => {
            // Chúng ta có thể thêm method getAllWorkflowTasks vào WorkflowService
            // Tạm thời dùng filter rỗng hoặc gọi qua rpc nếu cần
            // Nhưng TaskService.getAllTasks() cũ đang làm gì?
            // Ở đây ta giả định WorkflowService có thể trả về tất cả.
            return WorkflowService.getProjectWorkflowTasks(''); // Truyền rỗng để lấy tất cả nếu service support
        },
    });
};

export const useUpdateWorkflowTask = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (task: any) => WorkflowService.saveWorkflowTask(task),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: workflowTaskKeys.all });
        },
    });
};

export const useDeleteWorkflowTask = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => WorkflowService.deleteWorkflowTask(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: workflowTaskKeys.all });
        },
    });
};

