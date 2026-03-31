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

/* TODO: Implement update and delete mutations for workflow tasks later if needed. 
   Right now, tasks progress is updated through WorkflowService.transitionToNextNodes
   and UI standard update processes. 
*/
