import { supabase } from '../lib/supabase';
import { 
  IsoWorkflow, 
  IsoWorkflowNode, 
  IsoWorkflowEdge, 
  IsoWorkflowInstance, 
  IsoWorkflowTask 
} from '../types/iso_workflow.types';

// ============================================================
// ISO WORKFLOW SERVICE — Engine điều phối quy trình ISO 9001
// ============================================================

export const IsoWorkflowService = {
  // ─── READ ────────────────────────────────────────────────

  /** Lấy danh sách Instance của một Project */
  getInstancesByProject: async (projectId: string): Promise<IsoWorkflowInstance[]> => {
    const { data, error } = await supabase
      .from('iso_workflow_instances')
      .select(`
        *,
        workflow:iso_workflows(*)
      `)
      .eq('reference_id', projectId)
      .eq('reference_type', 'project')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as any;
  },

  /** Lấy chi tiết Instance bao gồm Nodes, Edges và Tasks */
  getInstanceDetails: async (instanceId: string) => {
    // 1. Lấy Instance
    const { data: instance, error: instErr } = await supabase
      .from('iso_workflow_instances')
      .select(`
        *,
        workflow:iso_workflows(*)
      `)
      .eq('id', instanceId)
      .single();

    if (instErr) throw instErr;

    // 2. Lấy Nodes & Edges từ Workflow Template
    const { data: nodes, error: nodeErr } = await supabase
      .from('iso_workflow_nodes')
      .select('*')
      .eq('workflow_id', instance.workflow_id)
      .eq('is_deleted', false);

    if (nodeErr) throw nodeErr;

    const { data: edges, error: edgeErr } = await supabase
      .from('iso_workflow_edges')
      .select('*')
      .eq('workflow_id', instance.workflow_id);

    if (edgeErr) throw edgeErr;

    // 3. Lấy các Tasks đã tạo cho Instance này
    const { data: tasks, error: taskErr } = await supabase
      .from('iso_workflow_tasks')
      .select('*')
      .eq('instance_id', instanceId)
      .order('created_at', { ascending: true });

    if (taskErr) throw taskErr;

    return {
      instance: instance as IsoWorkflowInstance,
      nodes: nodes as IsoWorkflowNode[],
      edges: edges as IsoWorkflowEdge[],
      tasks: tasks as IsoWorkflowTask[]
    };
  },

  /** Lấy Task hiện tại (mới nhất) của một Node trong Instance */
  getTaskByNode: async (instanceId: string, nodeId: string): Promise<IsoWorkflowTask | null> => {
    const { data, error } = await supabase
      .from('iso_workflow_tasks')
      .select('*')
      .eq('instance_id', instanceId)
      .eq('node_id', nodeId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data as any;
  },

  /** Lấy danh sách Task đang chờ xử lý của một User (cho Dashboard) */
  getMyPendingTasks: async (userId: string): Promise<(IsoWorkflowTask & { node?: IsoWorkflowNode; instance?: IsoWorkflowInstance })[]> => {
    const { data, error } = await supabase
      .from('iso_workflow_tasks')
      .select(`
        *,
        node:iso_workflow_nodes(id, name, type, assignee_role, sla_formula),
        instance:iso_workflow_instances(
          id, reference_id, reference_type, status, started_at,
          workflow:iso_workflows(id, name, code, category)
        )
      `)
      .eq('assignee_id', userId)
      .in('status', ['pending', 'in_progress'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as any;
  },

  /** Lấy lịch sử xử lý của một Instance (Audit Trail) */
  getInstanceTimeline: async (instanceId: string): Promise<IsoWorkflowTask[]> => {
    const { data, error } = await supabase
      .from('iso_workflow_tasks')
      .select(`
        *,
        node:iso_workflow_nodes(id, name, type),
        assignee:employees!iso_workflow_tasks_assignee_id_fkey(id, full_name, email, avatar_url)
      `)
      .eq('instance_id', instanceId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []) as any;
  },

  // ─── WRITE ───────────────────────────────────────────────

  /** Khởi tạo một Instance mới từ Template */
  createInstance: async (projectId: string, workflowId: string, createdBy: string): Promise<IsoWorkflowInstance> => {
    // 1. Tìm start node của workflow
    const { data: startNode, error: nodeErr } = await supabase
      .from('iso_workflow_nodes')
      .select('id')
      .eq('workflow_id', workflowId)
      .eq('type', 'start')
      .limit(1)
      .single();

    if (nodeErr) throw new Error('Không tìm thấy điểm bắt đầu của quy trình');

    // 2. Tạo Instance với status đúng enum
    const { data: instance, error: instErr } = await supabase
      .from('iso_workflow_instances')
      .insert({
        reference_id: projectId,
        reference_type: 'project',
        workflow_id: workflowId,
        status: 'in_progress',
        current_node_id: startNode.id,
        created_by: createdBy
      })
      .select()
      .single();

    if (instErr) throw instErr;

    // 3. Tự động chuyển từ Start Node sang Node kế tiếp
    await IsoWorkflowService.transitionToNextNodes(instance.id, startNode.id, createdBy);

    return instance as any;
  },

  /** Chuyển trạng thái quy trình sang các node tiếp theo */
  transitionToNextNodes: async (instanceId: string, currentNodeId: string, performedBy: string) => {
    // 1. Tìm các cạnh đi ra từ current node (dùng đúng tên cột DB: source_node)
    const { data: outEdges, error: edgeErr } = await supabase
      .from('iso_workflow_edges')
      .select('*')
      .eq('source_node', currentNodeId);

    if (edgeErr) throw edgeErr;
    if (!outEdges || outEdges.length === 0) {
      // Không có cạnh đi ra → kiểm tra nếu đây là end node thì đánh dấu instance hoàn thành
      const { data: currentNode } = await supabase
        .from('iso_workflow_nodes')
        .select('type')
        .eq('id', currentNodeId)
        .single();

      if (currentNode?.type === 'end') {
        await supabase
          .from('iso_workflow_instances')
          .update({ status: 'completed', completed_at: new Date().toISOString() })
          .eq('id', instanceId);
      }
      return;
    }

    for (const edge of outEdges) {
      // 2. Lấy thông tin target node (dùng đúng tên cột DB: target_node)
      const { data: targetNode, error: nodeErr } = await supabase
        .from('iso_workflow_nodes')
        .select('*')
        .eq('id', edge.target_node)
        .single();

      if (nodeErr) continue;

      // 3. Nếu là End Node → hoàn thành instance
      if (targetNode.type === 'end') {
        await supabase
          .from('iso_workflow_instances')
          .update({ 
            current_node_id: targetNode.id,
            status: 'completed', 
            completed_at: new Date().toISOString() 
          })
          .eq('id', instanceId);
        continue;
      }

      // 4. Nếu là Task Node (approval/input), tạo Task mới
      if (targetNode.type === 'approval' || targetNode.type === 'input') {
        // Tính due_date dựa trên SLA formula
        let dueDate: string | null = null;
        if (targetNode.sla_formula) {
          const match = targetNode.sla_formula.match(/^(\d+)d$/);
          if (match) {
            const days = parseInt(match[1]);
            const due = new Date();
            due.setDate(due.getDate() + days);
            dueDate = due.toISOString();
          }
        }

        await supabase.from('iso_workflow_tasks').insert({
          instance_id: instanceId,
          node_id: targetNode.id,
          status: 'pending',
          due_date: dueDate
        });
      }

      // 5. Nếu là Automated Node → tự động hoàn thành và chuyển tiếp
      if (targetNode.type === 'automated') {
        // Tạo task đã complete ngay lập tức
        await supabase.from('iso_workflow_tasks').insert({
          instance_id: instanceId,
          node_id: targetNode.id,
          status: 'completed',
          action_taken: 'AUTO_COMPLETED',
          completed_at: new Date().toISOString()
        });
        // Tiếp tục chuyển sang node kế tiếp
        await IsoWorkflowService.transitionToNextNodes(instanceId, targetNode.id, performedBy);
      }

      // 6. Cập nhật current_node_id (nếu chỉ có 1 đường đi)
      if (outEdges.length === 1) {
        await supabase
          .from('iso_workflow_instances')
          .update({ current_node_id: targetNode.id })
          .eq('id', instanceId);
      }
    }
  },

  /** Bắt đầu thực hiện một Task */
  startTask: async (taskId: string, performerId: string, cdeFolderId?: string) => {
    const updateData: any = {
      status: 'in_progress',
      assignee_id: performerId,
      started_at: new Date().toISOString()
    };
    if (cdeFolderId) updateData.cde_folder_id = cdeFolderId;

    const { error } = await supabase
      .from('iso_workflow_tasks')
      .update(updateData)
      .eq('id', taskId);

    if (error) throw error;
  },

  /** Gửi hồ sơ task (Submit) — hoàn thành bước input */
  submitTask: async (taskId: string, notes?: string) => {
    const { error } = await supabase
      .from('iso_workflow_tasks')
      .update({
        status: 'completed',
        action_taken: 'SUBMITTED',
        completed_at: new Date().toISOString(),
        comments: notes
      })
      .eq('id', taskId);

    if (error) throw error;

    // Sau khi submit, chuyển sang node kế tiếp
    const { data: task } = await supabase
      .from('iso_workflow_tasks')
      .select('instance_id, node_id')
      .eq('id', taskId)
      .single();

    if (task) {
      await IsoWorkflowService.transitionToNextNodes(task.instance_id, task.node_id, 'system');
    }
  },

  /** Phê duyệt/Từ chối Task (Dành cho các node approval) */
  processApproval: async (taskId: string, action: 'approve' | 'reject', comment?: string, performerId?: string) => {
    const status = action === 'approve' ? 'completed' : 'rejected';
    const actionTaken = action === 'approve' ? 'APPROVED' : 'REJECTED';
    
    const { error } = await supabase
      .from('iso_workflow_tasks')
      .update({
        status,
        action_taken: actionTaken,
        completed_at: new Date().toISOString(),
        comments: comment,
        assignee_id: performerId
      })
      .eq('id', taskId);

    if (error) throw error;

    // Lấy thông tin task để xử lý routing
    const { data: task } = await supabase
      .from('iso_workflow_tasks')
      .select('instance_id, node_id')
      .eq('id', taskId)
      .single();

    if (!task) return;

    if (action === 'approve') {
      // Approve → chuyển sang node kế tiếp
      await IsoWorkflowService.transitionToNextNodes(task.instance_id, task.node_id, performerId || 'system');
    } else {
      // Reject → tìm node trước đó và tạo lại task (yêu cầu chỉnh sửa)
      await IsoWorkflowService._handleRejection(task.instance_id, task.node_id);
    }
  },

  /** Chuyển giao nhiệm vụ cho người khác */
  reassignTask: async (taskId: string, newAssigneeId: string, comment?: string) => {
    const { error } = await supabase
      .from('iso_workflow_tasks')
      .update({
        assignee_id: newAssigneeId,
        comments: comment ? `[Chuyển giao] ${comment}` : null
      })
      .eq('id', taskId);

    if (error) throw error;
  },

  // ─── CDE INTEGRATION ────────────────────────────────────

  /** Xử lý tạo/lấy thư mục CDE cho Task */
  getOrCreateTaskFolder: async (instanceId: string, nodeId: string, taskTitle: string, performedBy: string): Promise<string> => {
    // 1. Lấy Instance để biết project_id và tên quy trình
    const { data: instance } = await supabase
      .from('iso_workflow_instances')
      .select('reference_id, workflow:iso_workflows(name)')
      .eq('id', instanceId)
      .single();

    if (!instance) throw new Error('Không tìm thấy quy trình');

    const projectId = instance.reference_id;
    const workflowName = (instance.workflow as any)?.name || 'Quy trình';

    // 2. Tìm hoặc tạo thư mục gốc "Quản lý Quy trình ISO" trong Project
    let { data: rootFolder } = await supabase
      .from('cde_folders')
      .select('id')
      .eq('project_id', projectId)
      .eq('name', 'Quản lý Quy trình ISO')
      .is('parent_id', null)
      .maybeSingle();

    if (!rootFolder) {
      const { data: newRoot } = await supabase
        .from('cde_folders')
        .insert({
          project_id: projectId,
          name: 'Quản lý Quy trình ISO',
          container_type: 'folder'
        })
        .select()
        .single();
      rootFolder = newRoot;
    }

    // 3. Tìm hoặc tạo thư mục cho Workflow cụ thể
    let { data: wfFolder } = await supabase
      .from('cde_folders')
      .select('id')
      .eq('parent_id', rootFolder?.id)
      .eq('name', workflowName)
      .maybeSingle();

    if (!wfFolder) {
      const { data: newWfFolder } = await supabase
        .from('cde_folders')
        .insert({
          project_id: projectId,
          parent_id: rootFolder?.id,
          name: workflowName,
          container_type: 'folder'
        })
        .select()
        .single();
      wfFolder = newWfFolder;
    }

    // 4. Tạo thư mục cho Task (Step) hiện tại
    let { data: taskFolder } = await supabase
      .from('cde_folders')
      .select('id')
      .eq('parent_id', wfFolder?.id)
      .eq('name', taskTitle)
      .maybeSingle();

    if (!taskFolder) {
      const { data: newTaskFolder } = await supabase
        .from('cde_folders')
        .insert({
          project_id: projectId,
          parent_id: wfFolder?.id,
          name: taskTitle,
          container_type: 'folder'
        })
        .select()
        .single();
      taskFolder = newTaskFolder;
    }

    return taskFolder?.id || '';
  },

  // ─── INTERNAL HELPERS ───────────────────────────────────

  /** Xử lý khi task bị từ chối — quay lại bước trước */
  _handleRejection: async (instanceId: string, rejectedNodeId: string) => {
    // Tìm node trước đó (node có edge target_node = rejectedNodeId)
    const { data: inEdges } = await supabase
      .from('iso_workflow_edges')
      .select('source_node')
      .eq('target_node', rejectedNodeId);

    if (!inEdges || inEdges.length === 0) return;

    // Lấy node nguồn đầu tiên
    const previousNodeId = inEdges[0].source_node;

    const { data: prevNode } = await supabase
      .from('iso_workflow_nodes')
      .select('type')
      .eq('id', previousNodeId)
      .single();

    if (!prevNode) return;

    // Nếu node trước là approval/input → tạo task mới cho họ sửa lại
    if (prevNode.type === 'approval' || prevNode.type === 'input') {
      await supabase.from('iso_workflow_tasks').insert({
        instance_id: instanceId,
        node_id: previousNodeId,
        status: 'pending',
        comments: '[Yêu cầu chỉnh sửa do bị từ chối ở bước tiếp theo]'
      });
    }

    // Cập nhật current_node_id quay lại bước trước
    await supabase
      .from('iso_workflow_instances')
      .update({ current_node_id: previousNodeId })
      .eq('id', instanceId);
  }
};
