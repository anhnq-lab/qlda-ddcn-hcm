export type IsoWorkflowCategory = 'project' | 'document' | 'finance' | 'hr' | 'asset' | 'other';
export type IsoWorkflowNodeType = 'start' | 'end' | 'approval' | 'input' | 'automated';
export type IsoWorkflowInstanceStatus = 'draft' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';
export type IsoWorkflowTaskStatus = 'pending' | 'in_progress' | 'completed' | 'rejected' | 'skipped' | 'transferred';

export interface IsoWorkflow {
    id: string;
    code: string;
    name: string;
    description: string | null;
    category: IsoWorkflowCategory;
    version: number;
    is_active: boolean;
    metadata: Record<string, any>;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface IsoWorkflowNode {
    id: string;
    workflow_id: string;
    name: string;
    type: IsoWorkflowNodeType;
    assignee_role: string | null;
    sla_formula: string | null;
    form_config: Record<string, any>;
    metadata: Record<string, any>;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
}

export interface IsoWorkflowEdge {
    id: string;
    workflow_id: string;
    source_node: string;
    target_node: string;
    condition_expr: string | null;
    created_at: string;
}

export interface IsoWorkflowInstance {
    id: string;
    workflow_id: string;
    workflow?: any; // joined data
    reference_id: string | null;
    reference_type: string | null;
    status: IsoWorkflowInstanceStatus;
    current_node_id: string | null;
    context_data: Record<string, any>;
    created_by: string;
    started_at: string;
    completed_at: string | null;
    updated_at: string;
}

export interface IsoWorkflowTask {
    id: string;
    instance_id: string;
    node_id: string;
    assignee_id: string | null;
    status: IsoWorkflowTaskStatus;
    action_taken: string | null;
    comments: string | null;
    digital_signature: Record<string, any> | null;
    due_date: string | null;
    started_at: string | null;
    completed_at: string | null;
    cde_folder_id: string | null;
    created_at: string;
}
