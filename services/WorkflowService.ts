// WorkflowService - Quản lý Quy trình thực hiện dự án
import { supabase } from '../lib/supabase';

// ============================================================
// TYPES
// ============================================================
export interface WorkflowTemplate {
  id: string;
  code: string;
  name: string;
  phase: 'preparation' | 'execution' | 'completion';
  phase_order: number;
  description: string | null;
  applicable_groups: string[];
  is_active: boolean;
  sort_order: number;
  total_steps?: number;
  step_codes?: string[];
  updated_at?: string;
  created_at?: string;
}

export interface SubTask {
  id: number;
  title: string;
  description?: string;
  actor?: string;
  legal_basis?: string;
  duration_days?: number | null;
  output?: string;
}

export interface WorkflowStepTemplate {
  id: string;
  workflow_id: string;
  step_number: number;
  step_code: string;
  name: string;
  description: string | null;
  actor_role: string | null;
  actor_label: string | null;
  sla_days_qn: number | null;
  sla_days_a: number | null;
  sla_days_b: number | null;
  sla_days_c: number | null;
  output_description: string | null;
  output_template_codes: string[] | null;
  legal_basis: string | null;
  task_title_template: string | null;
  task_priority: 'urgent' | 'high' | 'medium' | 'low';
  is_bidding_trigger: boolean;
  is_branch_step: boolean;
  applicable_groups: string[];
  sort_order: number;
  sub_tasks: SubTask[];
  notes: string | null;
  updated_at?: string;
}

export interface ProjectWorkflow {
  id: string;
  project_id: string;
  template_id: string;
  project_group: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  started_by: string | null;
  started_at: string;
  completed_at: string | null;
  notes: string | null;
  total_steps: number;
  completed_steps: number;
  generated_task_ids: string[];
  // Joined
  template?: WorkflowTemplate;
}

export interface ProjectWorkflowStep {
  id: string;
  workflow_id: string;
  step_template_id: string;
  project_id: string;
  step_number: number;
  step_code: string;
  status: 'pending' | 'in_progress' | 'needs_revision' | 'pending_approval' | 'approved' | 'rejected' | 'skipped';
  planned_start_date: string | null;
  planned_end_date: string | null;
  actual_start_date: string | null;
  actual_end_date: string | null;
  sla_days: number | null;
  assigned_to: string | null;
  completed_by: string | null;
  completed_at: string | null;
  rejection_reason: string | null;
  revision_notes: string | null;
  task_id: string | null;
  task_id_text: string | null;
  notes: string | null;
  attachments: any[];
  decision_number: string | null;
  decision_date: string | null;
  decision_authority: string | null;
  // Joined from template
  step_template?: WorkflowStepTemplate;
}

export interface SLAWarning {
  step_id: string;
  workflow_id: string;
  project_id: string;
  project_name: string;
  workflow_name: string;
  step_name: string;
  step_code: string;
  status: string;
  planned_end_date: string;
  sla_days: number;
  days_overdue: number;
  sla_status: 'overdue' | 'warning' | 'ok';
}

export interface ActivateWorkflowParams {
  project_id: string;
  template_code: string;
  project_group: string;
  started_by?: string;
  start_date?: string;
}

export interface ActivateWorkflowResult {
  success: boolean;
  workflow_id?: string;
  project_id?: string;
  template_code?: string;
  project_group?: string;
  tasks_created?: number;
  task_ids?: string[];
  error?: string;
}

// ============================================================
// PHASE LABELS
// ============================================================
export const PHASE_LABELS: Record<string, string> = {
  preparation: 'Giai đoạn 1: Chuẩn bị dự án',
  execution: 'Giai đoạn 2: Thực hiện dự án',
  completion: 'Giai đoạn 3: Kết thúc dự án',
};

export const PHASE_COLORS: Record<string, string> = {
  preparation: '#3b82f6',
  execution: '#f59e0b',
  completion: '#10b981',
};

export const STEP_STATUS_LABELS: Record<string, string> = {
  pending: 'Chưa bắt đầu',
  in_progress: 'Đang thực hiện',
  needs_revision: 'Cần hoàn thiện',
  pending_approval: 'Chờ phê duyệt',
  approved: 'Đã hoàn thành',
  rejected: 'Bị từ chối',
  skipped: 'Bỏ qua',
};

export const STEP_STATUS_COLORS: Record<string, string> = {
  pending: '#6b7280',
  in_progress: '#3b82f6',
  needs_revision: '#f59e0b',
  pending_approval: '#8b5cf6',
  approved: '#10b981',
  rejected: '#ef4444',
  skipped: '#d1d5db',
};

export const PROJECT_GROUP_LABELS: Record<string, string> = {
  QN: 'Dự án QN (Quốc gia)',
  A: 'Nhóm A',
  B: 'Nhóm B',
  C: 'Nhóm C',
};

export const PHASE_ORDER_LABELS = ['preparation', 'execution', 'completion'] as const;

// ============================================================
// SERVICE
// ============================================================
export const WorkflowService = {
  // ─── READ: TEMPLATES ───────────────────────────────────────

  /** Lấy tất cả template đang active (dùng cho project activation) */
  getAllTemplates: async (): Promise<WorkflowTemplate[]> => {
    const { data, error } = await supabase
      .from('workflow_templates')
      .select('*')
      .eq('is_active', true)
      .order('phase')
      .order('phase_order');

    if (error) throw new Error(`Failed to fetch workflow templates: ${error.message}`);
    return data || [];
  },

  /** Lấy TẤT CẢ template (kể cả inactive) — dùng cho Master Admin */
  getAllTemplatesForAdmin: async (): Promise<WorkflowTemplate[]> => {
    const { data, error } = await supabase
      .from('workflow_templates')
      .select('*')
      .order('phase')
      .order('phase_order')
      .order('sort_order');

    if (error) throw new Error(`Failed to fetch all templates: ${error.message}`);
    return data || [];
  },

  getTemplateWithSteps: async (templateId: string): Promise<{
    template: WorkflowTemplate;
    steps: WorkflowStepTemplate[];
  } | null> => {
    const { data: template, error: tErr } = await supabase
      .from('workflow_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (tErr || !template) return null;

    const { data: steps, error: sErr } = await supabase
      .from('workflow_step_templates')
      .select('*')
      .eq('workflow_id', template.id)
      .order('step_number');

    if (sErr) throw new Error(`Failed to fetch steps: ${sErr.message}`);

    return { template, steps: steps || [] };
  },

  getTemplateByCode: async (templateCode: string): Promise<{
    template: WorkflowTemplate;
    steps: WorkflowStepTemplate[];
  } | null> => {
    const { data: template, error: tErr } = await supabase
      .from('workflow_templates')
      .select('*')
      .eq('code', templateCode)
      .single();

    if (tErr || !template) return null;

    const { data: steps, error: sErr } = await supabase
      .from('workflow_step_templates')
      .select('*')
      .eq('workflow_id', template.id)
      .order('step_number');

    if (sErr) throw new Error(`Failed to fetch steps: ${sErr.message}`);
    return { template, steps: steps || [] };
  },

  // ─── WRITE: TEMPLATE CRUD ──────────────────────────────────

  /** Cập nhật thông tin quy trình mẫu */
  updateTemplate: async (
    id: string,
    data: Partial<Pick<WorkflowTemplate, 'name' | 'description' | 'phase' | 'phase_order' | 'applicable_groups' | 'is_active' | 'sort_order'>>
  ): Promise<WorkflowTemplate> => {
    const { data: updated, error } = await supabase
      .from('workflow_templates')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update template: ${error.message}`);
    return updated;
  },

  /** Tạo quy trình mẫu mới */
  createTemplate: async (
    data: Omit<WorkflowTemplate, 'id' | 'updated_at' | 'created_at' | 'total_steps' | 'step_codes'>
  ): Promise<WorkflowTemplate> => {
    const { data: created, error } = await supabase
      .from('workflow_templates')
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(`Failed to create template: ${error.message}`);
    return created;
  },

  // ─── WRITE: STEP CRUD ──────────────────────────────────────

  /** Cập nhật bước quy trình */
  updateStep: async (
    id: string,
    data: Partial<Omit<WorkflowStepTemplate, 'id' | 'workflow_id' | 'updated_at'>>
  ): Promise<WorkflowStepTemplate> => {
    const { data: updated, error } = await supabase
      .from('workflow_step_templates')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update step: ${error.message}`);
    return updated;
  },

  /** Thêm bước mới vào quy trình */
  createStep: async (
    workflowId: string,
    data: Partial<Omit<WorkflowStepTemplate, 'id' | 'workflow_id' | 'updated_at'>>
  ): Promise<WorkflowStepTemplate> => {
    // Get max step_number for this workflow
    const { data: existing } = await supabase
      .from('workflow_step_templates')
      .select('step_number')
      .eq('workflow_id', workflowId)
      .order('step_number', { ascending: false })
      .limit(1);

    const maxStep = existing?.[0]?.step_number || 0;

    const { data: created, error } = await supabase
      .from('workflow_step_templates')
      .insert({
        workflow_id: workflowId,
        step_number: maxStep + 1,
        step_code: data.step_code || `STEP-${maxStep + 1}`,
        name: data.name || 'Bước mới',
        description: data.description || null,
        actor_role: data.actor_role || null,
        actor_label: data.actor_label || null,
        sla_days_qn: data.sla_days_qn || null,
        sla_days_a: data.sla_days_a || null,
        sla_days_b: data.sla_days_b || null,
        sla_days_c: data.sla_days_c || null,
        output_description: data.output_description || null,
        legal_basis: data.legal_basis || null,
        task_title_template: data.task_title_template || null,
        task_priority: data.task_priority || 'medium',
        is_bidding_trigger: data.is_bidding_trigger || false,
        is_branch_step: data.is_branch_step || false,
        applicable_groups: data.applicable_groups || ['QN', 'A', 'B', 'C'],
        sort_order: maxStep + 1,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create step: ${error.message}`);
    return created;
  },

  /** Xóa bước */
  deleteStep: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('workflow_step_templates')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete step: ${error.message}`);
  },

  /** Sắp xếp lại thứ tự các bước — nhận mảng [{id, step_number}] */
  reorderSteps: async (updates: { id: string; step_number: number; sort_order: number }[]): Promise<void> => {
    // Use Promise.all for batch update
    await Promise.all(
      updates.map(({ id, step_number, sort_order }) =>
        supabase
          .from('workflow_step_templates')
          .update({ step_number, sort_order, updated_at: new Date().toISOString() })
          .eq('id', id)
      )
    );
  },

  // ─── READ: PROJECT WORKFLOWS ───────────────────────────────

  getProjectWorkflows: async (projectId: string): Promise<ProjectWorkflow[]> => {
    const { data, error } = await supabase
      .from('project_workflows')
      .select(`
        *,
        template:workflow_templates(*)
      `)
      .eq('project_id', projectId)
      .order('created_at');

    if (error) throw new Error(`Failed to fetch project workflows: ${error.message}`);
    return (data || []) as ProjectWorkflow[];
  },

  getWorkflowSteps: async (workflowId: string): Promise<ProjectWorkflowStep[]> => {
    const { data, error } = await supabase
      .from('project_workflow_steps')
      .select(`
        *,
        step_template:workflow_step_templates(*)
      `)
      .eq('workflow_id', workflowId)
      .order('step_number');

    if (error) throw new Error(`Failed to fetch workflow steps: ${error.message}`);
    return (data || []) as ProjectWorkflowStep[];
  },

  // ─── RPC: ACTIVATE ─────────────────────────────────────────

  activateWorkflow: async (params: ActivateWorkflowParams): Promise<ActivateWorkflowResult> => {
    const { data, error } = await (supabase.rpc as any)('activate_project_workflow', {
      p_project_id: params.project_id,
      p_template_code: params.template_code,
      p_project_group: params.project_group,
      p_started_by: params.started_by || null,
      p_start_date: params.start_date || new Date().toISOString().split('T')[0],
    });

    if (error) throw new Error(`Failed to activate workflow: ${error.message}`);
    return data as ActivateWorkflowResult;
  },

  // ─── RPC: COMPLETE STEP ────────────────────────────────────

  completeStep: async (params: {
    step_id: string;
    new_status: string;
    completed_by?: string;
    notes?: string;
    decision_number?: string;
    decision_date?: string;
    decision_authority?: string;
  }): Promise<{ success: boolean; workflow_id?: string }> => {
    const { data, error } = await (supabase.rpc as any)('complete_workflow_step', {
      p_step_id: params.step_id,
      p_new_status: params.new_status,
      p_completed_by: params.completed_by || null,
      p_notes: params.notes || null,
      p_decision_number: params.decision_number || null,
      p_decision_date: params.decision_date || null,
      p_decision_authority: params.decision_authority || null,
    });

    if (error) throw new Error(`Failed to complete step: ${error.message}`);
    return data;
  },

  // ─── UPDATE PROJECT STEP (direct) ─────────────────────────

  updateProjectStep: async (
    stepId: string,
    data: Partial<Pick<ProjectWorkflowStep,
      'status' | 'notes' | 'assigned_to' | 'planned_start_date' |
      'planned_end_date' | 'actual_start_date' | 'actual_end_date' |
      'decision_number' | 'decision_date' | 'decision_authority' | 'rejection_reason'
    >>
  ): Promise<boolean> => {
    const { error } = await supabase
      .from('project_workflow_steps')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', stepId);

    if (error) throw new Error(`Failed to update step: ${error.message}`);
    return true;
  },

  updateStepStatus: async (stepId: string, status: string, notes?: string): Promise<boolean> => {
    const { error } = await supabase
      .from('project_workflow_steps')
      .update({ status, notes, updated_at: new Date().toISOString() })
      .eq('id', stepId);

    if (error) throw new Error(`Failed to update step status: ${error.message}`);
    return true;
  },

  // ─── SLA WARNINGS ──────────────────────────────────────────

  getSLAWarnings: async (projectId?: string): Promise<SLAWarning[]> => {
    let query = supabase
      .from('v_workflow_sla_warnings')
      .select('*');

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query.order('days_overdue', { ascending: false });
    if (error) throw new Error(`Failed to fetch SLA warnings: ${error.message}`);
    return (data || []) as SLAWarning[];
  },

  // ─── HELPERS ───────────────────────────────────────────────

  getSLAForGroup: (step: WorkflowStepTemplate, group: string): number | null => {
    switch (group) {
      case 'QN': return step.sla_days_qn;
      case 'A':  return step.sla_days_a;
      case 'B':  return step.sla_days_b;
      case 'C':  return step.sla_days_c;
      default:   return null;
    }
  },

  getProjectWorkflowOverview: async (projectId: string): Promise<any> => {
    const { data, error } = await (supabase.rpc as any)('get_project_workflow_overview', {
      p_project_id: projectId,
    });

    if (error) throw new Error(`Failed to get overview: ${error.message}`);
    return data;
  },
};
