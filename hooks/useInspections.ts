import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Inspection } from '@/types/inspection.types';

// Cast supabase to `any` for the `inspections` table since it was just created
// and the generated Supabase types (database.ts) haven't been regenerated yet.
// This is a standard pattern used across the project for new tables.
const db = supabase as any;

// ── DB ↔ App Mappers ──
function dbToInspection(row: any): Inspection {
    return {
        InspectionID: row.inspection_id,
        ProjectID: row.project_id,
        InspectionType: row.inspection_type,
        InspectionName: row.inspection_name,
        InspectionAgency: row.inspection_agency,
        InspectorName: row.inspector_name,
        DecisionNumber: row.decision_number,
        DecisionDate: row.decision_date,
        StartDate: row.start_date,
        EndDate: row.end_date,
        Conclusion: row.conclusion,
        Recommendations: row.recommendations,
        Penalties: Number(row.penalties) || 0,
        FollowUpStatus: row.follow_up_status || 'pending',
        FollowUpDeadline: row.follow_up_deadline,
        FollowUpNotes: row.follow_up_notes,
        Attachments: row.attachments || [],
        Status: row.status || 'active',
        CreatedBy: row.created_by,
        CreatedAt: row.created_at,
        UpdatedAt: row.updated_at,
    };
}

function inspectionToDb(data: Partial<Inspection>): Record<string, any> {
    const result: Record<string, any> = {};
    if (data.ProjectID !== undefined) result.project_id = data.ProjectID;
    if (data.InspectionType !== undefined) result.inspection_type = data.InspectionType;
    if (data.InspectionName !== undefined) result.inspection_name = data.InspectionName;
    if (data.InspectionAgency !== undefined) result.inspection_agency = data.InspectionAgency;
    if (data.InspectorName !== undefined) result.inspector_name = data.InspectorName;
    if (data.DecisionNumber !== undefined) result.decision_number = data.DecisionNumber;
    if (data.DecisionDate !== undefined) result.decision_date = data.DecisionDate;
    if (data.StartDate !== undefined) result.start_date = data.StartDate;
    if (data.EndDate !== undefined) result.end_date = data.EndDate;
    if (data.Conclusion !== undefined) result.conclusion = data.Conclusion;
    if (data.Recommendations !== undefined) result.recommendations = data.Recommendations;
    if (data.Penalties !== undefined) result.penalties = data.Penalties;
    if (data.FollowUpStatus !== undefined) result.follow_up_status = data.FollowUpStatus;
    if (data.FollowUpDeadline !== undefined) result.follow_up_deadline = data.FollowUpDeadline;
    if (data.FollowUpNotes !== undefined) result.follow_up_notes = data.FollowUpNotes;
    if (data.Attachments !== undefined) result.attachments = data.Attachments;
    if (data.Status !== undefined) result.status = data.Status;
    if (data.CreatedBy !== undefined) result.created_by = data.CreatedBy;
    return result;
}

// ── Hooks ──
export function useInspections(projectId: string) {
    return useQuery({
        queryKey: ['inspections', projectId],
        queryFn: async () => {
            const { data, error } = await db
                .from('inspections')
                .select('*')
                .eq('project_id', projectId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return (data || []).map(dbToInspection);
        },
        enabled: !!projectId,
    });
}

export function useCreateInspection() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (data: Partial<Inspection>) => {
            const dbData = inspectionToDb(data);
            const { data: row, error } = await db
                .from('inspections')
                .insert(dbData)
                .select()
                .single();
            if (error) throw error;
            return dbToInspection(row);
        },
        onSuccess: (_: any, variables: Partial<Inspection>) => {
            qc.invalidateQueries({ queryKey: ['inspections', variables.ProjectID] });
        },
    });
}

export function useUpdateInspection() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Inspection> }) => {
            const dbData = inspectionToDb(data);
            const { error } = await db
                .from('inspections')
                .update(dbData)
                .eq('inspection_id', id);
            if (error) throw error;
        },
        onSuccess: (_: any, variables: { id: string; data: Partial<Inspection> }) => {
            qc.invalidateQueries({ queryKey: ['inspections', variables.data.ProjectID] });
        },
    });
}

export function useDeleteInspection() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
            const { error } = await db
                .from('inspections')
                .delete()
                .eq('inspection_id', id);
            if (error) throw error;
            return projectId;
        },
        onSuccess: (projectId: string) => {
            qc.invalidateQueries({ queryKey: ['inspections', projectId] });
        },
    });
}
