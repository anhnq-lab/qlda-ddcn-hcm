// TaskService — Unified CRUD operations for tasks (project + internal)
// Bảng `tasks` mới: UUID PK, unified schema
import { supabase } from '../lib/supabase';
import { WorkflowTemplateService } from './WorkflowTemplateService';

// ── Types matching the new DB schema ─────────────────────────
export type TaskType = 'project' | 'internal';
export type DbTaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type DbTaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface DbTask {
  id: string;
  task_type: TaskType;
  project_id: string | null;
  workflow_id: string | null;
  workflow_node_id: string | null;
  title: string;
  description: string | null;
  status: DbTaskStatus;
  priority: DbTaskPriority;
  progress: number;
  assignee_id: string | null;
  approver_id: string | null;
  start_date: string | null;
  due_date: string | null;
  duration_days: number | null;
  actual_start_date: string | null;
  actual_end_date: string | null;
  phase: string | null;
  step_code: string | null;
  sort_order: number;
  estimated_cost: number | null;
  actual_cost: number | null;
  legal_basis: string | null;
  output_document: string | null;
  predecessor_task_id: string | null;
  metadata: Record<string, any>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbSubTask {
  id: string;
  task_id: string;
  title: string;
  status: string;
  assignee_id: string | null;
  due_date: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ── Service ──────────────────────────────────────────────────

export const TaskService = {
  // ─── READ ────────────────────────────────────────────────

  /** Lấy tất cả tasks (scoped theo project IDs nếu có) */
  getAllTasks: async (projectIds?: string[]): Promise<DbTask[]> => {
    let query = supabase
      .from('tasks')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (projectIds && projectIds.length > 0) {
      // Lấy cả tasks thuộc projects + internal tasks
      query = query.or(`project_id.in.(${projectIds.join(',')}),task_type.eq.internal`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as unknown as DbTask[];
  },

  /** Lấy tasks theo dự án */
  getProjectTasks: async (projectId: string): Promise<DbTask[]> => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []) as unknown as DbTask[];
  },

  /** Lấy tasks nội bộ (không thuộc dự án nào) */
  getInternalTasks: async (): Promise<DbTask[]> => {
    const { data, error } = await (supabase as any)
      .from('tasks')
      .select('*')
      .eq('task_type', 'internal')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as unknown as DbTask[];
  },

  /** Lấy 1 task theo ID */
  getTaskById: async (taskId: string): Promise<DbTask | null> => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .maybeSingle();

    if (error) throw error;
    return data as unknown as DbTask | null;
  },

  /** Lấy sub-tasks của 1 task */
  getSubTasks: async (taskId: string): Promise<DbSubTask[]> => {
    const { data, error } = await supabase
      .from('sub_tasks')
      .select('*')
      .eq('task_id', taskId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return (data || []) as unknown as DbSubTask[];
  },

  /** Đếm tasks theo project (cho Dashboard) */
  countByProject: async (projectId: string) => {
    const { count: total } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId);

    const { count: done } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .eq('status', 'done');

    return { total: total || 0, done: done || 0 };
  },

  // ─── WRITE ───────────────────────────────────────────────

  /** Tạo task mới */
  createTask: async (task: Partial<DbTask>): Promise<DbTask> => {
    const now = new Date().toISOString();
    const payload = {
      ...task,
      created_at: now,
      updated_at: now,
    };

    // Sanitize: empty strings → null for date fields
    const dateFields = ['start_date', 'due_date', 'actual_start_date', 'actual_end_date'];
    for (const f of dateFields) {
      if ((payload as any)[f] === '') (payload as any)[f] = null;
    }

    // Sanitize assignee_id
    if (payload.assignee_id) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(payload.assignee_id)) {
        // Store non-UUID assignee in metadata as role name
        payload.metadata = { ...payload.metadata, assignee_role: payload.assignee_id };
        payload.assignee_id = null;
      }
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert(payload as any)
      .select()
      .single();

    if (error) throw error;
    return data as unknown as DbTask;
  },

  /** Cập nhật task */
  updateTask: async (taskId: string, updates: Partial<DbTask>): Promise<DbTask> => {
    const payload = { ...updates, updated_at: new Date().toISOString() };
    delete (payload as any).id; // Don't send id in payload

    // Sanitize dates
    const dateFields = ['start_date', 'due_date', 'actual_start_date', 'actual_end_date'];
    for (const f of dateFields) {
      if ((payload as any)[f] === '') (payload as any)[f] = null;
    }

    // Sanitize assignee_id
    if (payload.assignee_id !== undefined) {
      if (payload.assignee_id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.assignee_id)) {
        payload.metadata = { ...(payload.metadata || {}), assignee_role: payload.assignee_id };
        payload.assignee_id = null;
      }
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(payload as any)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data as unknown as DbTask;
  },

  /** Upsert task (tạo hoặc cập nhật) */
  saveTask: async (task: Partial<DbTask> & { id?: string }): Promise<DbTask> => {
    if (task.id) {
      return TaskService.updateTask(task.id, task);
    } else {
      return TaskService.createTask(task);
    }
  },

  /** Xóa task */
  deleteTask: async (taskId: string): Promise<void> => {
    // sub_tasks cascade delete automatically
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
  },

  /** Xóa tất cả tasks của dự án */
  deleteProjectTasks: async (projectId: string): Promise<number> => {
    const { data, error } = await supabase
      .from('tasks')
      .delete()
      .eq('project_id', projectId)
      .select('id');

    if (error) throw error;
    return data?.length || 0;
  },

  // ─── SUB-TASKS ───────────────────────────────────────────

  /** Upsert sub-task */
  saveSubTask: async (subTask: Partial<DbSubTask> & { task_id: string }): Promise<DbSubTask> => {
    if (subTask.id) {
      const { data, error } = await (supabase as any)
        .from('sub_tasks')
        .update({ ...subTask, updated_at: new Date().toISOString() } as any)
        .eq('id', subTask.id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as DbSubTask;
    } else {
      const { data, error } = await (supabase as any)
        .from('sub_tasks')
        .insert(subTask as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as DbSubTask;
    }
  },

  /** Xóa sub-task */
  deleteSubTask: async (subTaskId: string): Promise<void> => {
    const { error } = await (supabase as any).from('sub_tasks').delete().eq('id', subTaskId);
    if (error) throw error;
  },

  // ─── WORKFLOW INTEGRATION ────────────────────────────────

  /**
   * Tạo tasks tự động từ quy trình mẫu
   * Lấy nodes từ workflow template, sinh ra tasks tương ứng trong bảng `tasks`
   */
  createTasksFromWorkflow: async (
    projectId: string,
    workflowId: string,
    startDate: string,
    endDate: string,
  ): Promise<DbTask[]> => {
    // 1. Lấy nodes của workflow template
    const nodes = await WorkflowTemplateService.getTemplateNodes(workflowId);
    const workNodes = nodes.filter(n => ['approval', 'input', 'automated', 'start'].includes(n.type));

    if (workNodes.length === 0) return [];

    // 2. Tính phân bổ thời gian
    let totalSla = 0;
    workNodes.forEach(n => {
      if (n.sla_formula) {
        const match = n.sla_formula.match(/^(\d+)d$/);
        if (match) totalSla += parseInt(match[1]);
      } else {
        totalSla += 1;
      }
    });
    if (totalSla === 0) totalSla = 1;

    const startMs = new Date(startDate).getTime();
    const endMs = new Date(endDate).getTime();
    const totalMs = endMs - startMs;
    let currentMs = startMs;

    // 3. Build task rows
    const tasksToInsert: Partial<DbTask>[] = [];

    for (const node of workNodes) {
      let nodeSla = 1;
      if (node.sla_formula) {
        const match = node.sla_formula.match(/^(\d+)d$/);
        if (match) nodeSla = parseInt(match[1]);
      }

      const proportion = nodeSla / totalSla;
      const allocatedMs = totalMs * proportion;
      const nodeEndMs = currentMs + allocatedMs;

      const nodeMetadata = (node.metadata || {}) as any;
      const subTasks = nodeMetadata.sub_tasks || [];

      if (subTasks.length > 0) {
        // Có sub-tasks → sinh task cho từng sub-task
        const subDuration = allocatedMs / subTasks.length;
        let subCurrentMs = currentMs;

        subTasks.forEach((st: any, idx: number) => {
          const subEndMs = subCurrentMs + subDuration;
          const stepMatch = node.name.match(/^(\d+)\./);
          const stepNum = stepMatch ? stepMatch[1] : '?';
          const subTaskName = st.name || st.title || `Công việc ${idx + 1}`;

          tasksToInsert.push({
            project_id: projectId,
            workflow_id: workflowId,
            workflow_node_id: node.id,
            task_type: 'project',
            title: subTaskName.length > 450 ? subTaskName.substring(0, 447) + '...' : subTaskName,
            status: 'todo',
            priority: 'medium',
            progress: 0,
            start_date: new Date(subCurrentMs).toISOString().split('T')[0],
            due_date: new Date(subEndMs).toISOString().split('T')[0],
            duration_days: Math.ceil(subDuration / (1000 * 60 * 60 * 24)),
            phase: nodeMetadata.phase || 'preparation',
            step_code: `${stepNum}.${idx + 1}`,
            sort_order: tasksToInsert.length,
            legal_basis: st.legal_basis || '',
            metadata: {
              sub_process: nodeMetadata.sub_process || '',
              parent_step: node.name,
              parent_node_id: node.id,
              assignee_role: st.assignee_role || '',
              output: st.output || '',
              template_forms: st.template_forms || '',
              sla_formula: node.sla_formula,
            },
          });

          subCurrentMs = subEndMs;
        });
      } else {
        // Không có sub-tasks → sinh 1 task cho node
        tasksToInsert.push({
          project_id: projectId,
          workflow_id: workflowId,
          workflow_node_id: node.id,
          task_type: 'project',
          title: node.name.length > 450 ? node.name.substring(0, 447) + '...' : node.name,
          status: 'todo',
          priority: 'medium',
          progress: 0,
          start_date: new Date(currentMs).toISOString().split('T')[0],
          due_date: new Date(nodeEndMs).toISOString().split('T')[0],
          duration_days: Math.ceil(allocatedMs / (1000 * 60 * 60 * 24)),
          phase: nodeMetadata.phase || 'preparation',
          step_code: node.name.match(/^(\d+)\./) ? node.name.match(/^(\d+)\./)![1] : '',
          sort_order: tasksToInsert.length,
          legal_basis: nodeMetadata.legalBasis || '',
          metadata: {
            sub_process: nodeMetadata.sub_process || '',
            sla_formula: node.sla_formula,
          },
        });
      }

      currentMs = nodeEndMs;
    }

    // 4. Batch insert
    if (tasksToInsert.length > 0) {
      const { data, error } = await supabase
        .from('tasks')
        .insert(tasksToInsert as any)
        .select();

      if (error) throw new Error(`Tạo công việc thất bại: ${error.message}`);
      return (data || []) as unknown as DbTask[];
    }

    return [];
  },
};
