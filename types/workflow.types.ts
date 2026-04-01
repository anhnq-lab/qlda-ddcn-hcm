export type WorkflowCategory = 'project' | 'implementation' | 'investment' | 'procurement' | 'document' | 'finance' | 'hr' | 'asset' | 'other';
export type WorkflowNodeType = 'start' | 'end' | 'approval' | 'input' | 'automated';
export type WorkflowInstanceStatus = 'draft' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';
export type WorkflowTaskStatus = 'pending' | 'in_progress' | 'completed' | 'rejected' | 'skipped' | 'transferred';

export interface Workflow {
    id: string;
    code: string;
    name: string;
    description: string | null;
    category: WorkflowCategory;
    version: number;
    is_active: boolean;
    metadata: Record<string, any>;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface WorkflowNode {
    id: string;
    workflow_id: string;
    name: string;
    type: WorkflowNodeType;
    assignee_role: string | null;
    sla_formula: string | null;
    form_config: Record<string, any>;
    metadata: Record<string, any>;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
}

export interface WorkflowEdge {
    id: string;
    workflow_id: string;
    source_node: string;
    target_node: string;
    condition_expr: string | null;
    created_at: string;
}

export interface WorkflowInstance {
    id: string;
    workflow_id: string;
    workflow?: any; // joined data
    reference_id: string | null;
    reference_type: string | null;
    status: WorkflowInstanceStatus;
    current_node_id: string | null;
    context_data: Record<string, any>;
    created_by: string;
    started_at: string;
    completed_at: string | null;
    updated_at: string;
}

export interface WorkflowTask {
    id: string;
    instance_id: string;
    node_id: string | null;
    workflow_nodes?: any; // joined data from Supabase
    instance?: any; // joined data from Supabase
    name: string | null;
    task_type: string;
    start_date: string | null;
    progress: number;
    metadata: Record<string, any>;
    assignee_id: string | null;
    status: WorkflowTaskStatus;
    action_taken: string | null;
    comments: string | null;
    digital_signature: Record<string, any> | null;
    due_date: string | null;
    started_at: string | null;
    completed_at: string | null;
    cde_folder_id: string | null;
    created_at: string;
}
