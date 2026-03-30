import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { Network, Plus, Clock } from 'lucide-react';
import ISOFlowchartViewer from '../../workflows/components/ISOFlowchartViewer';
import type { IsoWorkflow, IsoWorkflowInstance, IsoWorkflowNode, IsoWorkflowEdge, IsoWorkflowTask } from '../../../types/iso_workflow.types';
import { useToast } from '../../../components/ui/Toast';
import { useAuth } from '../../../context/AuthContext';
import { useSlidePanel } from '@/context/SlidePanelContext';
import { IsoWorkflowService } from '@/services/IsoWorkflowService';
import { ISOWorkflowStepDetailPanel } from '../../workflows/components/ISOWorkflowStepDetailPanel';

interface Props {
  projectId: string;
  projectGroup?: string;
  projectName?: string;
}

// Internal types matching ISOFlowchartViewer interface
interface FlowNode {
  id: string;
  name: string;
  type: 'start' | 'end' | 'approval' | 'input' | 'automated';
  assignee_role?: string;
  sla_formula?: string;
}

interface FlowEdge {
  source: string;
  target: string;
  condition?: string;
}

const ProjectWorkflowTab: React.FC<Props> = ({
  projectId,
  projectGroup = 'C',
  projectName = '',
}) => {
  const [loading, setLoading] = useState(true);
  const [wfInstance, setWfInstance] = useState<IsoWorkflowInstance | null>(null);
  const [template, setTemplate] = useState<IsoWorkflow | null>(null);
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<FlowEdge[]>([]);
  const [completedNodeIds, setCompletedNodeIds] = useState<string[]>([]);
  const [activeNodeId, setActiveNodeId] = useState<string | undefined>();
  const [rejectedNodeIds, setRejectedNodeIds] = useState<string[]>([]);
  const { addToast } = useToast();
  const { user } = useAuth();
  const { openPanel } = useSlidePanel();

  const loadWorkflow = useCallback(async () => {
    setLoading(true);
    try {
      if (!projectId) return;

      // 1. Lấy Instance của Project
      const instances = await IsoWorkflowService.getInstancesByProject(projectId);
      
      if (instances && instances.length > 0) {
        const instanceData = instances[0];
        setWfInstance(instanceData);
        
        // 2. Lấy chi tiết Instance
        const { instance, nodes: dbNodes, edges: dbEdges, tasks } = await IsoWorkflowService.getInstanceDetails(instanceData.id);
        
        if (instance.workflow) setTemplate(instance.workflow);
        
        if (dbNodes && dbEdges) {
          mapToFlowchart(dbNodes, dbEdges, tasks || [], instance.current_node_id);
        }
      } else {
        // 3. Tìm template phù hợp
        const { data: matchingTmpl } = await supabase
          .from('iso_workflows')
          .select('*')
          .eq('category', 'project')
          .like('code', `ISO-${projectGroup}-%`)
          .maybeSingle();

        if (matchingTmpl) {
          setTemplate(matchingTmpl);
          const { data: dbNodes } = await supabase.from('iso_workflow_nodes').select('*').eq('workflow_id', matchingTmpl.id).eq('is_deleted', false).order('created_at');
          const { data: dbEdges } = await supabase.from('iso_workflow_edges').select('*').eq('workflow_id', matchingTmpl.id);
          if (dbNodes && dbEdges) {
            mapToFlowchart(dbNodes as any, dbEdges, [], null);
          }
        }
      }
    } catch (e: any) {
      console.error(e);
      addToast({ title: 'Lỗi', message: e.message || 'Không tải được quy trình', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [projectId, projectGroup]);

  useEffect(() => {
    loadWorkflow();
  }, [loadWorkflow]);

  const mapToFlowchart = (
    dbNodes: IsoWorkflowNode[], 
    dbEdges: IsoWorkflowEdge[], 
    tasks: IsoWorkflowTask[],
    currentNodeId: string | null
  ) => {
    const fnodes: FlowNode[] = dbNodes.map(n => ({
      id: n.id,
      name: n.name,
      type: n.type,
      assignee_role: n.assignee_role || undefined,
      sla_formula: n.sla_formula || undefined,
    }));

    const fedges: FlowEdge[] = dbEdges.map(e => ({
      source: e.source_node,
      target: e.target_node,
    }));

    // Compute status sets from tasks
    const completed: string[] = [];
    const rejected: string[] = [];
    let active: string | undefined;

    tasks.forEach(task => {
      if (task.status === 'completed') completed.push(task.node_id);
      if (task.status === 'rejected') rejected.push(task.node_id);
      if (task.status === 'in_progress' || task.status === 'pending') {
        active = task.node_id;
      }
    });

    // Fallback active to instance current_node_id
    if (!active && currentNodeId) active = currentNodeId;

    setNodes(fnodes);
    setEdges(fedges);
    setCompletedNodeIds(completed);
    setActiveNodeId(active);
    setRejectedNodeIds(rejected);
  };

  const handleStartWorkflow = async () => {
    if (!template || !projectId) return;
    try {
      setLoading(true);
      await IsoWorkflowService.createInstance(projectId, template.id, user?.id || 'system');
      addToast({ title: 'Thành công', message: 'Luồng quy trình ISO đã được khởi tạo cho dự án.', type: 'success' });
      await loadWorkflow();
    } catch (e: any) {
      addToast({ title: 'Lỗi', message: e.message, type: 'error' });
      setLoading(false);
    }
  };

  const handleNodeClick = (node: FlowNode) => {
    if (node.type === 'start' || node.type === 'end') return;

    openPanel({
      title: `${node.name}`,
      component: (
        <ISOWorkflowStepDetailPanel 
          nodeId={node.id} 
          instanceId={wfInstance?.id} 
          projectId={projectId} 
          staticNode={node}
        />
      ),
    });
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#FAFAF8] dark:bg-slate-900 rounded-2xl min-h-[400px]">
         <div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-primary-500 rounded-full" />
      </div>
    );
  }

  if (!wfInstance && !template) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800">
        <Network size={32} className="text-gray-300 dark:text-slate-600 mb-4" />
        <h3 className="text-lg font-bold text-gray-800 dark:text-slate-200">Không tìm thấy quy trình {projectGroup}</h3>
        <p className="text-sm text-gray-500 max-w-md text-center mt-2">Dự án này thuộc nhóm {projectGroup} nhưng chưa có cấu hình quy trình ISO nào phù hợp trong hệ thống.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#FAFAF8] dark:bg-slate-900/50 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
      <div className="flex-none p-4 md:p-6 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <Network size={20} className="text-primary-600 dark:text-primary-400" />
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">{template?.name}</h2>
           </div>
           <p className="text-sm text-gray-500 font-medium">Tiêu chuẩn ISO 9001:2015 — Tự động định tuyến phê duyệt</p>
        </div>
        
        {!wfInstance && template && (
          <button 
             onClick={handleStartWorkflow}
             className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary-600/20 transition-all hover:-translate-y-0.5">
             <Plus size={18} /> Khởi động Quy trình
          </button>
        )}
        
        {wfInstance && (
           <div className="flex items-center gap-4 text-sm font-bold">
               <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                 wfInstance.status === 'completed' 
                   ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                   : 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
               }`}>
                   <Clock size={16} />
                   {wfInstance.status === 'completed' ? 'Hoàn thành' : 'Đang thực hiện'}
               </span>
           </div>
        )}
      </div>
      
      <div className="flex-1 w-full min-h-[500px] overflow-hidden">
         {nodes.length > 0 ? (
            <ISOFlowchartViewer 
              workflowName={template?.name || 'Quy trình'}
              nodes={nodes} 
              edges={edges} 
              activeNodeId={activeNodeId}
              completedNodeIds={completedNodeIds}
              rejectedNodeIds={rejectedNodeIds}
              onNodeClick={handleNodeClick}
            />
         ) : (
            <div className="flex items-center justify-center p-12 text-gray-400">Không có cấu trúc node nào.</div>
         )}
      </div>
    </div>
  );
};

export default ProjectWorkflowTab;
