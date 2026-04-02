// Workflow types — Template only (no runtime instances/tasks)
export type WorkflowCategory = 'project' | 'implementation' | 'investment' | 'procurement' | 'document' | 'finance' | 'hr' | 'asset' | 'other';
export type WorkflowNodeType = 'start' | 'end' | 'approval' | 'input' | 'automated';

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
    sort_order: number;
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
