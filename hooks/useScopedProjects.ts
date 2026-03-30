/**
 * useScopedProjects — QLDA ĐDCN TP.HCM
 *
 * Centralized hook for department-scoped project filtering.
 * - Ban ĐHDA 1-7: Only see projects with matching management_board
 * - Global departments (Ban GĐ, Phòng KH-ĐT, etc.): See all projects
 * - Super admin: See all projects
 *
 * Use this hook anywhere you need a filtered project list
 * that respects the current user's (or impersonated user's) department scope.
 */
import { useMemo } from 'react';
import { useProjects } from './useProjects';
import { useAuth } from '../context/AuthContext';
import { useImpersonation } from '../context/ImpersonationContext';
import { usePermissionCheck } from './usePermissionCheck';
import type { Project } from '../types';

/**
 * Extract the Ban number (1-7) from department name.
 * e.g. "Ban Điều hành dự án 1" → 1, "Ban Điều hành dự án 7" → 7
 * Returns null if not a Ban ĐHDA department.
 */
export function extractBanNumber(department: string | undefined): number | null {
    if (!department) return null;
    const match = department.match(/Ban Điều hành dự án\s*(\d+)/i);
    return match ? parseInt(match[1], 10) : null;
}

export interface ScopedProjectsResult {
    /** All projects (unfiltered) */
    allProjects: Project[];
    /** Projects filtered by current user's department scope */
    scopedProjects: Project[];
    /** Project IDs that the current user can see */
    scopedProjectIds: Set<string>;
    /** Whether user has global scope (sees all) */
    isGlobalScope: boolean;
    /** The Ban number of the effective user (null if global) */
    banNumber: number | null;
    /** Loading state */
    isLoading: boolean;
}

export function useScopedProjects(): ScopedProjectsResult {
    const { currentUser } = useAuth();
    const { impersonatedUser, isImpersonating } = useImpersonation();
    const { isGlobalScope, systemRole } = usePermissionCheck();
    const { projects: allProjects = [], isLoading } = useProjects();

    // Effective user for scoping
    const effectiveUser = isImpersonating && impersonatedUser ? impersonatedUser : currentUser;
    const banNumber = extractBanNumber(effectiveUser?.Department);

    // Scoped projects
    const scopedProjects = useMemo(() => {
        if (isGlobalScope || systemRole === 'super_admin') return allProjects;
        
        // Thêm trường hợp cho tài khoản nhà thầu
        if (systemRole === 'contractor') {
            const allowedIds = effectiveUser?.AllowedProjectIDs || [];
            if (allowedIds.length === 0) return [];
            return allProjects.filter(p => allowedIds.includes(p.ProjectID));
        }

        if (banNumber !== null) {
            return allProjects.filter(p => p.ManagementBoard === banNumber);
        }
        return allProjects;
    }, [allProjects, isGlobalScope, systemRole, banNumber, effectiveUser]);

    // Scoped project IDs (for quick lookup in other modules)
    const scopedProjectIds = useMemo(() => {
        return new Set(scopedProjects.map(p => p.ProjectID));
    }, [scopedProjects]);

    return {
        allProjects,
        scopedProjects,
        scopedProjectIds,
        isGlobalScope,
        banNumber,
        isLoading,
    };
}
