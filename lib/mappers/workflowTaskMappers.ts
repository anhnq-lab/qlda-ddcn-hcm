import { Task, TaskStatus, TaskPriority } from '../../types/task.types';
import { WorkflowTask } from '../../types/workflow.types';

/**
 * Maps a WorkflowTask from the database to the UI Task model.
 */
export const workflowTaskToTask = (wt: WorkflowTask, projectId?: string): Task => {
    const metadata = wt.metadata || {};
    
    // Map status
    let status: TaskStatus = TaskStatus.Todo;
    switch (wt.status) {
        case 'in_progress':
            status = TaskStatus.InProgress;
            break;
        case 'completed':
        case 'skipped':
            status = TaskStatus.Done;
            break;
        case 'rejected':
            status = TaskStatus.Review;
            break;
        case 'pending':
        default:
            status = TaskStatus.Todo;
            break;
    }

    return {
        TaskID: wt.id,
        Title: wt.name || 'Không có tiêu đề',
        Description: wt.comments || '',
        ProjectID: projectId || (wt as any).instance?.reference_id || '',
        AssigneeID: wt.assignee_id || '',
        DueDate: wt.due_date || '',
        StartDate: wt.started_at || '',
        Status: status,
        Priority: metadata.priority || TaskPriority.Medium,
        ProgressPercent: wt.progress || 0,
        
        // Fields from metadata
        DurationDays: metadata.estimatedDays || 10,
        SubTasks: metadata.sub_tasks || [],
        Attachments: metadata.attachments || [],
        Dependencies: metadata.dependencies || [],
        EstimatedCost: Number(metadata.estimated_cost) || 0,
        ActualCost: Number(metadata.actual_cost) || 0,
        
        // Actual dates logic (prioritize metadata overrides)
        ActualStartDate: metadata.actualStartDate || wt.started_at || '',
        ActualEndDate: metadata.actualEndDate || wt.completed_at || '',
        
        // Workflow specific
        StepCode: wt.node_id || '',
        Phase: (wt as any).workflow_nodes?.metadata?.phase || '',
        LegalBasis: (wt as any).workflow_nodes?.metadata?.legalBasis || '',
        IsCritical: metadata.isCritical || false,
    };
};
