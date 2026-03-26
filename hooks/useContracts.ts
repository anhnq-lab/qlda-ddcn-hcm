
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ContractService } from '../services/ContractService';
import { Contract } from '../types';

export const contractKeys = {
    all: ['contracts'] as const,
    byPackage: (packageId: string) => ['contracts', 'package', packageId] as const,
};

export const useContracts = () => {
    const queryClient = useQueryClient();

    const { data: contracts = [], isLoading, error } = useQuery({
        queryKey: contractKeys.all,
        queryFn: () => ContractService.getAll()
    });

    const createMutation = useMutation({
        mutationFn: (contract: Partial<Contract>) => ContractService.create(contract),
        onSuccess: (_result, variables) => {
            queryClient.invalidateQueries({ queryKey: contractKeys.all });
            // Cross-invalidate packages when contract is created (updates ContractID on package)
            if (variables.ProjectID) {
                queryClient.invalidateQueries({ queryKey: ['project-packages', variables.ProjectID] });
            }
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Contract> }) => ContractService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: contractKeys.all });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => ContractService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: contractKeys.all });
            // Packages may reference this contract — invalidate all
            queryClient.invalidateQueries({ queryKey: ['project-packages'] });
        }
    });

    return {
        contracts,
        isLoading,
        error: error ? (error as Error).message : null,
        createContract: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        updateContract: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        deleteContract: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
    };
};
