import { useQuery } from '@tanstack/react-query';
import ProjectService from '@/services/ProjectService';
import { BiddingPackage } from '@/types';

/**
 * Hook to fetch bidding packages for a project
 */
export const useBiddingPackages = (projectId: string) => {
    return useQuery<BiddingPackage[]>({
        queryKey: ['project-packages', projectId],
        queryFn: () => ProjectService.getPackagesByProject(projectId),
        enabled: !!projectId,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });
};

export default useBiddingPackages;
