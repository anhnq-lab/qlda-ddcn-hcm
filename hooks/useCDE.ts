// ═══════════════════════════════════════════════════════════════
// CDE React Query Hooks
// ═══════════════════════════════════════════════════════════════

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CDEService } from '../services/CDEService';

export const useCDEFolders = (projectId: string) =>
    useQuery({
        queryKey: ['cde-folders', projectId],
        queryFn: () => CDEService.getFolders(projectId),
        enabled: !!projectId,
    });

export const useCDEDocuments = (folderId: string | null) =>
    useQuery({
        queryKey: ['cde-documents', folderId],
        queryFn: () => CDEService.getDocuments(folderId!),
        enabled: !!folderId,
    });

export const useCDEStats = (projectId: string) =>
    useQuery({
        queryKey: ['cde-stats', projectId],
        queryFn: () => CDEService.getStats(projectId),
        enabled: !!projectId,
    });

export const useCDEWorkflowHistory = (docId: number | null) =>
    useQuery({
        queryKey: ['cde-workflow', docId],
        queryFn: () => CDEService.getWorkflowHistory(docId!),
        enabled: !!docId,
    });

export const useUploadCDE = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: CDEService.uploadDocument,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cde-documents'] });
            queryClient.invalidateQueries({ queryKey: ['cde-folders'] });
            queryClient.invalidateQueries({ queryKey: ['cde-stats'] });
        },
    });
};

export const useProcessWorkflowStep = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: CDEService.processWorkflowStep,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cde-workflow'] });
            queryClient.invalidateQueries({ queryKey: ['cde-documents'] });
            queryClient.invalidateQueries({ queryKey: ['cde-folders'] });
            queryClient.invalidateQueries({ queryKey: ['cde-stats'] });
        },
    });
};

export const useMoveDocument = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ docId, folderId }: { docId: number; folderId: string }) =>
            CDEService.moveDocument(docId, folderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cde-documents'] });
            queryClient.invalidateQueries({ queryKey: ['cde-folders'] });
        },
    });
};
