/**
 * useWorkflowPhases — DB-driven phases/steps cho Tab Kế hoạch
 * 
 * Cấu trúc 4 cấp: Phase → Sub-process → Step (node) → Sub-tasks
 * Lấy trực tiếp từ workflow_nodes trong DB (workflows table, category='project').
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// ── Re-export compatible interfaces ──
export interface PhaseItem {
    id: string;
    title: string;
    code: string; // node_id (uuid)
}

export interface SubProcessGroup {
    id: string;       // e.g., "I.1"
    title: string;    // e.g., "Quyết định chủ trương đầu tư"
    fullTitle: string; // e.g., "I.1. Quyết định chủ trương đầu tư"
    items: PhaseItem[];
}

export interface ProjectPhase {
    id: string;
    title: string;
    description: string;
    items: PhaseItem[];              // Flat list (all steps in this phase)
    subProcesses: SubProcessGroup[]; // Grouped by sub_process
}

// Compatible with old SubTaskDef — used by PlanTab bulk create
export interface SubTaskDef {
    code: string;
    title: string;
    description?: string;
    responsible: string;
    legalBasis?: string;
    estimatedDays?: number;
    templatePath?: string;
    templateLabel?: string;
}

const PHASE_TITLES: Record<string, string> = {
    preparation: 'GIAI ĐOẠN CHUẨN BỊ DỰ ÁN',
    execution: 'GIAI ĐOẠN THỰC HIỆN DỰ ÁN',
    completion: 'GIAI ĐOẠN KẾT THÚC XÂY DỰNG',
};

const PHASE_IDS: Record<string, string> = {
    preparation: 'PHASE_1',
    execution: 'PHASE_2',
    completion: 'PHASE_3',
};

const PHASE_DESCRIPTIONS: Record<string, string> = {
    preparation: 'Chuẩn bị đầu tư, lập dự án, phê duyệt chủ trương',
    execution: 'Thiết kế, đấu thầu, thi công, giám sát',
    completion: 'Nghiệm thu, bàn giao, quyết toán',
};

const PHASE_ORDER = ['preparation', 'execution', 'completion'];

interface WorkflowNodeRow {
    id: string;
    name: string;
    type: string;
    sla_formula: string | null;
    metadata: {
        phase?: string;
        sub_process?: string;
        legalBasis?: string;
        estimatedDays?: number;
        sub_tasks?: Array<{
            id: string;
            name?: string;
            title?: string;
            description?: string;
            actor?: string;
            assignee_role?: string;
            legal_basis?: string;
            output?: string;
            template_forms?: string;
            duration_days?: number;
        }>;
        [key: string]: any;
    } | null;
    created_at: string;
}

/**
 * Select the best workflow template for a project based on group_code
 * Default: "Quy trình DAXD - Thiết kế 1 bước" (QT-TK1B)
 */
function selectWorkflowCode(groupCode: string, project?: any): string {
    const designSteps = project?.DesignSteps || project?.design_steps || 1;
    if (designSteps === 3) return 'QT-TK3B';
    if (designSteps === 2) return 'QT-TK2B';
    return 'QT-TK1B';
}

/**
 * Hook chính: fetch workflow nodes từ DB, trả về phases 4 cấp & sub-tasks
 */
export function useWorkflowPhases(groupCode: string = 'C', project?: any) {
    const workflowCode = selectWorkflowCode(groupCode, project);

    // Fetch workflow + nodes directly from DB
    const { data: nodesData, isLoading } = useQuery({
        queryKey: ['workflow-phases', workflowCode],
        queryFn: async () => {
            // 1. Find the workflow template
            const { data: workflow, error: wfErr } = await supabase
                .from('workflows')
                .select('id, name, code')
                .eq('code', workflowCode)
                .eq('is_active', true)
                .eq('category', 'project')
                .single();

            if (wfErr || !workflow) {
                console.warn(`Workflow template "${workflowCode}" not found, trying fallback...`);
                const { data: fallback } = await supabase
                    .from('workflows')
                    .select('id, name, code')
                    .eq('is_active', true)
                    .eq('category', 'project')
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();
                    
                if (!fallback) return { nodes: [], workflowId: '' };
                
                const { data: nodes } = await supabase
                    .from('workflow_nodes')
                    .select('id, name, type, sla_formula, metadata, created_at')
                    .eq('workflow_id', fallback.id)
                    .eq('is_deleted', false)
                    .order('created_at', { ascending: true });
                    
                return { nodes: (nodes || []) as WorkflowNodeRow[], workflowId: fallback.id };
            }

            // 2. Fetch all nodes for this workflow
            const { data: nodes, error: nodeErr } = await supabase
                .from('workflow_nodes')
                .select('id, name, type, sla_formula, metadata, created_at')
                .eq('workflow_id', workflow.id)
                .eq('is_deleted', false)
                .order('created_at', { ascending: true });

            if (nodeErr) {
                console.error('Failed to load workflow nodes:', nodeErr);
                return { nodes: [], workflowId: workflow.id };
            }

            return { nodes: (nodes || []) as WorkflowNodeRow[], workflowId: workflow.id };
        },
        staleTime: 10 * 60 * 1000,
    });

    const nodes = nodesData?.nodes || [];

    // Build phases from nodes — 4 cấp: Phase → Sub-process → Step → Sub-tasks
    const phases = useMemo<ProjectPhase[]>(() => {
        if (nodes.length === 0) return [];

        // Filter work nodes (include start for "1. Lập BCNCTKT..." which is type=start)
        const workNodes = nodes.filter(n => 
            ['approval', 'input', 'automated', 'start'].includes(n.type)
        );

        // Intermediate structure: phase → sub_process → items
        const phaseMap: Record<string, Record<string, PhaseItem[]>> = {};
        const flatPhaseItems: Record<string, PhaseItem[]> = {};

        workNodes.forEach((node) => {
            const phase = node.metadata?.phase || 'preparation';
            const subProcess = node.metadata?.sub_process || 'Khác';
            
            if (!phaseMap[phase]) phaseMap[phase] = {};
            if (!phaseMap[phase][subProcess]) phaseMap[phase][subProcess] = [];
            if (!flatPhaseItems[phase]) flatPhaseItems[phase] = [];

            // Extract step number from name (e.g., "1. Lập BCNCTKT..." → "1")
            const nameMatch = node.name.match(/^(\d+)\.\s*/);
            const stepNum = nameMatch ? nameMatch[1] : String(flatPhaseItems[phase].length + 1);
            const cleanTitle = nameMatch ? node.name.replace(/^\d+\.\s*/, '') : node.name;

            const item: PhaseItem = {
                id: stepNum,
                title: cleanTitle,
                code: node.id,
            };

            phaseMap[phase][subProcess].push(item);
            flatPhaseItems[phase].push(item);
        });

        // Build ordered phases with sub-processes
        return PHASE_ORDER
            .filter(phase => flatPhaseItems[phase] && flatPhaseItems[phase].length > 0)
            .map((phase, phaseIdx) => {
                // Build sub-process groups preserving insertion order
                const spMap = phaseMap[phase] || {};
                const subProcesses: SubProcessGroup[] = Object.entries(spMap).map(([fullTitle, items]) => {
                    // Parse "I.1. Quyết định chủ trương đầu tư" → id="I.1", title="Quyết định..."
                    const spMatch = fullTitle.match(/^([IVX]+\.\d+)\.\s*(.*)/);
                    const spId = spMatch ? spMatch[1] : `${phaseIdx + 1}.0`;
                    const spTitle = spMatch ? spMatch[2] : fullTitle;

                    return {
                        id: spId,
                        title: spTitle,
                        fullTitle,
                        items,
                    };
                });

                return {
                    id: PHASE_IDS[phase],
                    title: PHASE_TITLES[phase],
                    description: PHASE_DESCRIPTIONS[phase],
                    items: flatPhaseItems[phase],
                    subProcesses,
                };
            });
    }, [nodes]);

    // Build node lookup for sub-tasks
    const nodeMap = useMemo(() => {
        const map = new Map<string, WorkflowNodeRow>();
        nodes.forEach(n => map.set(n.id, n));
        return map;
    }, [nodes]);

    /**
     * Get sub-tasks for a node ID
     */
    const getStepSubTasks = (nodeId: string): SubTaskDef[] => {
        const node = nodeMap.get(nodeId);
        if (!node?.metadata?.sub_tasks || node.metadata.sub_tasks.length === 0) return [];
        return node.metadata.sub_tasks.map(st => ({
            code: `${nodeId}_${st.id}`,
            title: st.name || st.title || '',
            description: st.description,
            responsible: st.assignee_role || st.actor || '',
            legalBasis: st.legal_basis,
            estimatedDays: st.duration_days ?? undefined,
        }));
    };

    /**
     * Check if a node has sub-tasks
     */
    const hasStepSubTasks = (nodeId: string): boolean => {
        const node = nodeMap.get(nodeId);
        return !!node?.metadata?.sub_tasks && node.metadata.sub_tasks.length > 0;
    };

    /** Group label */
    const getGroupLabel = (g?: string) => {
        switch (g) {
            case 'QN': return 'Quan trọng QG';
            case 'A': return 'Nhóm A';
            case 'B': return 'Nhóm B';
            case 'C': return 'Nhóm C';
            default: return 'Nhóm C';
        }
    };

    return {
        phases,
        isLoading,
        getStepSubTasks,
        hasStepSubTasks,
        getGroupLabel,
    };
}
