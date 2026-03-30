/**
 * useWorkflowPhases — DB-driven phases/steps/sub-tasks cho Tab Kế hoạch
 * Thay thế hoàn toàn utils/projectPhases.ts + utils/stepSubtasksRegistry.ts
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
// ── Mock old Workflow Service Types ──
export interface SubTask { id: string; title: string; description?: string; actor?: string; legal_basis?: string; duration_days?: number; }
export interface WorkflowStepTemplate { id: string; name: string; step_code: string; workflow_id: string; sub_tasks?: SubTask[]; applicable_groups?: string[] }
export interface WorkflowTemplate { id: string; name: string; phase: string; phase_order: number; applicable_groups?: string[] }

const WorkflowService = {
    getAllTemplates: async (): Promise<WorkflowTemplate[]> => [],
    getStepsByTemplateIds: async (ids: string[]): Promise<WorkflowStepTemplate[]> => [],
    getSLAForGroup: (step: any, group: string) => 0
};

// ── Re-export compatible interfaces ──
export interface PhaseItem {
    id: string;
    title: string;
    code: string;
}

export interface ProjectPhase {
    id: string;
    title: string;
    description: string;
    items: PhaseItem[];
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
    preparation: 'I. GIAI ĐOẠN CHUẨN BỊ DỰ ÁN',
    execution: 'II. GIAI ĐOẠN THỰC HIỆN DỰ ÁN',
    completion: 'III. GIAI ĐOẠN KẾT THÚC XÂY DỰNG',
};

const PHASE_IDS: Record<string, string> = {
    preparation: 'PHASE_1',
    execution: 'PHASE_2',
    completion: 'PHASE_3',
};

const PHASE_ORDER = ['preparation', 'execution', 'completion'];

/**
 * Transform DB SubTask → SubTaskDef (backward-compatible format)
 */
function mapSubTask(st: SubTask, stepCode: string): SubTaskDef {
    return {
        code: `${stepCode}_${st.id}`,
        title: st.title,
        description: st.description,
        responsible: st.actor || '',
        legalBasis: st.legal_basis,
        estimatedDays: st.duration_days ?? undefined,
    };
}

/**
 * Transform DB WorkflowTemplate + Steps → ProjectPhase[]
 */
function buildPhases(
    templates: WorkflowTemplate[],
    stepsMap: Map<string, WorkflowStepTemplate[]>,
    originalGroupCode: string,
    project?: any
): ProjectPhase[] {
    const phases: ProjectPhase[] = [];
    
    // Determine the actual group code for workflow template fetching
    // If it's Group C but <= 20B VND -> use C_KTKT
    const isLowBudget = project && project.TotalInvestment && project.TotalInvestment <= 20_000_000_000;
    const trueGroupCode = (originalGroupCode === 'C' && isLowBudget) ? 'C_KTKT' : originalGroupCode;

    for (const phase of PHASE_ORDER) {
        const phaseTmpls = templates
            .filter(t => t.phase === phase && (t.applicable_groups || []).includes(trueGroupCode))
            .sort((a, b) => a.phase_order - b.phase_order);

        if (phaseTmpls.length === 0) continue;

        let stepNum = 1;
        const phaseIndex = PHASE_ORDER.indexOf(phase) + 1;
        const items: PhaseItem[] = [];

        for (const tmpl of phaseTmpls) {
            const steps = stepsMap.get(tmpl.id) || [];
            
            const applicableSteps = steps.filter(s => {
                // Group validation: Step must apply to trueGroupCode
                return !s.applicable_groups || s.applicable_groups.length === 0 || s.applicable_groups.includes(trueGroupCode);
            });

            for (const step of applicableSteps) {
                items.push({
                    id: `${phaseIndex}.${stepNum}`,
                    title: step.name,
                    code: step.step_code,
                });
                stepNum++;
            }
        }

        phases.push({
            id: PHASE_IDS[phase],
            title: PHASE_TITLES[phase],
            description: phaseTmpls.map(t => t.name).join(', '),
            items,
        });
    }

    return phases;
}

/**
 * Hook chính: fetch templates + steps từ DB, trả về phases & sub-tasks
 */
export function useWorkflowPhases(groupCode: string = 'C', project?: any) {
    // Fetch ALL templates (active only)
    const { data: templates = [], isLoading: loadingTemplates } = useQuery({
        queryKey: ['workflow-templates'],
        queryFn: () => WorkflowService.getAllTemplates(),
        staleTime: 5 * 60 * 1000, // 5 minutes cache
    });

    // Fetch steps for ALL active templates in ONE single query (Fix N+1)
    const { data: stepsMap = new Map<string, WorkflowStepTemplate[]>(), isLoading: loadingSteps } = useQuery({
        queryKey: ['workflow-all-steps', templates.map(t => t.id).join(',')],
        queryFn: async () => {
            const map = new Map<string, WorkflowStepTemplate[]>();
            const templateIds = templates.map(t => t.id);
            if (templateIds.length === 0) return map;
            
            // Single API call
            const allSteps = await WorkflowService.getStepsByTemplateIds(templateIds);
            
            // Group steps by workflow_id
            allSteps.forEach(step => {
                const wid = step.workflow_id;
                if (!map.has(wid)) map.set(wid, []);
                map.get(wid)!.push(step);
            });
            
            return map;
        },
        enabled: templates.length > 0,
        staleTime: 5 * 60 * 1000,
    });

    // Build phases from DB data
    const phases = useMemo(
        () => buildPhases(templates, stepsMap, groupCode, project),
        [templates, stepsMap, groupCode, project]
    );

    // Build step→subtasks lookup from DB
    const allSteps = useMemo(() => {
        const map = new Map<string, WorkflowStepTemplate>();
        stepsMap.forEach((steps) => {
            steps.forEach(s => map.set(s.step_code, s));
        });
        return map;
    }, [stepsMap]);

    /**
     * Get sub-tasks for a step code — replacement for getSubTasksForStep()
     */
    const getStepSubTasks = (stepCode: string): SubTaskDef[] => {
        const step = allSteps.get(stepCode);
        if (!step || !step.sub_tasks || step.sub_tasks.length === 0) return [];
        return step.sub_tasks.map(st => mapSubTask(st, stepCode));
    };

    /**
     * Check if a step code has sub-tasks — replacement for hasSubTasks()
     */
    const hasStepSubTasks = (stepCode: string): boolean => {
        const step = allSteps.get(stepCode);
        return !!step?.sub_tasks && step.sub_tasks.length > 0;
    };

    /**
     * Get the DB step template object (for SLA, actor, legal_basis etc.)
     */
    const getStepTemplate = (stepCode: string): WorkflowStepTemplate | undefined => {
        return allSteps.get(stepCode);
    };

    /**
     * Get SLA days for the current group
     */
    const getStepSLA = (stepCode: string): number | null => {
        const step = allSteps.get(stepCode);
        if (!step) return null;
        return WorkflowService.getSLAForGroup(step, groupCode);
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
        templates,
        isLoading: loadingTemplates || loadingSteps,
        getStepSubTasks,
        hasStepSubTasks,
        getStepTemplate,
        getStepSLA,
        getGroupLabel,
    };
}
