import { useQuery } from '@tanstack/react-query';
import { VariationOrderService } from '../services/VariationOrderService';

export function useVariationOrders(contractId: string) {
    const { data: variationOrders = [], isLoading, error } = useQuery({
        queryKey: ['variationOrders', contractId],
        queryFn: () => VariationOrderService.getByContractId(contractId),
        enabled: !!contractId,
    });

    return { variationOrders, isLoading, error };
}
