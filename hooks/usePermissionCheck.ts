/**
 * usePermissionCheck — QLDA ĐDCN TP.HCM
 *
 * IMPERSONATION-AWARE: When impersonating, uses impersonated user's
 * permissions/role instead of the real user.
 *
 * Pattern follows cic-erp-contract/hooks/usePermissions.ts
 * Deny-by-default permission checking hook.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useImpersonation } from '../context/ImpersonationContext';
import { supabase } from '../lib/supabase';
import {
    PermissionAction,
    PermissionResource,
    SystemRole,
    GLOBAL_VIEW_DEPARTMENTS,
    PROJECT_SCOPED_DEPARTMENTS,
    DEFAULT_ROLE_PERMISSIONS,
    resolveSystemRole,
} from '../types/permission.types';

interface PermissionState {
    permissions: Map<string, PermissionAction[]>;
    loading: boolean;
    loaded: boolean;
    systemRole: SystemRole;
}

export interface PermissionCheckResult {
    /** Check if user can perform action on resource */
    can: (resource: PermissionResource, action: PermissionAction) => boolean;
    /** Check if user can perform action on a specific project */
    canOnProject: (action: PermissionAction, projectManagementUnit?: string) => boolean;
    /** Check if user has global view (sees all projects) */
    isGlobalScope: boolean;
    /** Get the user's system role */
    systemRole: SystemRole;
    /** Whether permissions have been loaded */
    loading: boolean;
    /** All resource permissions (for admin UI) */
    permissionMap: Map<string, PermissionAction[]>;
    /** Refresh permissions from DB */
    refresh: () => Promise<void>;
    /** Whether we are in impersonation mode */
    isImpersonating: boolean;
}

export function usePermissionCheck(): PermissionCheckResult {
    const { currentUser, userType } = useAuth();
    const { impersonatedUser, isImpersonating } = useImpersonation();

    // Effective user: impersonated or real
    const effectiveUser = isImpersonating && impersonatedUser ? impersonatedUser : currentUser;
    const effectiveUserType = isImpersonating
        ? (impersonatedUser?.Role === 'contractor' ? 'contractor' : 'employee')
        : userType;

    const [state, setState] = useState<PermissionState>({
        permissions: new Map(),
        loading: true,
        loaded: false,
        systemRole: 'staff',
    });

    // Determine system role from effective employee data
    const systemRole = useMemo((): SystemRole => {
        if (!effectiveUser) return 'staff';
        if (effectiveUserType === 'contractor') return 'contractor';
        return resolveSystemRole(effectiveUser.Role, effectiveUser.Position);
    }, [effectiveUser, effectiveUserType]);

    // Check if effective user has global scope (sees all projects)
    const isGlobalScope = useMemo(() => {
        if (!effectiveUser) return false;
        if (['super_admin', 'director', 'deputy_director', 'chief_accountant'].includes(systemRole)) {
            return true;
        }
        return GLOBAL_VIEW_DEPARTMENTS.some(dept =>
            effectiveUser.Department?.includes(dept) || dept.includes(effectiveUser.Department || '')
        );
    }, [effectiveUser, systemRole]);

    // Fetch permissions from DB for the effective user
    const fetchPermissions = useCallback(async () => {
        const userId = effectiveUser?.EmployeeID;
        if (!userId) {
            setState(prev => ({ ...prev, loading: false, loaded: true }));
            return;
        }

        try {
            const { data, error } = await (supabase as any)
                .from('user_permissions')
                .select('resource, actions')
                .eq('user_id', userId);

            if (error) throw error;

            const map = new Map<string, PermissionAction[]>();
            (data || []).forEach((row: any) => {
                map.set(row.resource, row.actions || []);
            });

            setState({
                permissions: map,
                loading: false,
                loaded: true,
                systemRole,
            });
        } catch (err) {
            console.error('[Permissions] Failed to load:', err);
            setState(prev => ({
                ...prev,
                loading: false,
                loaded: true,
            }));
        }
    }, [effectiveUser?.EmployeeID, systemRole]);

    // Re-fetch when effective user changes (e.g. impersonation start/stop)
    useEffect(() => {
        setState(prev => ({ ...prev, loading: true, loaded: false }));
        fetchPermissions();
    }, [fetchPermissions]);

    // ─── Core permission check ───────────────────────
    const can = useCallback(
        (resource: PermissionResource, action: PermissionAction): boolean => {
            // Super admin bypasses all checks
            if (systemRole === 'super_admin') return true;

            // Not loaded yet → deny
            if (!state.loaded) return false;

            // 1) If user has DB-level overrides, use those
            if (state.permissions.size > 0) {
                const actions = state.permissions.get(resource);
                return actions ? actions.includes(action) : false;
            }

            // 2) Fallback: DEFAULT_ROLE_PERMISSIONS based on systemRole
            const defaults = DEFAULT_ROLE_PERMISSIONS[systemRole];
            if (!defaults) return false;
            const defaultActions = defaults[resource];
            return defaultActions ? defaultActions.includes(action) : false;
        },
        [state.permissions, state.loaded, systemRole]
    );

    // ─── Project-scoped check ────────────────────────
    const canOnProject = useCallback(
        (action: PermissionAction, projectManagementUnit?: string): boolean => {
            // Must have base project permission
            if (!can('projects', action)) return false;

            // Global scope → always allowed
            if (isGlobalScope) return true;

            // Ban ĐHDA → only if project belongs to their Ban
            if (effectiveUser?.Department && projectManagementUnit) {
                const isSameBan = PROJECT_SCOPED_DEPARTMENTS.some(dept =>
                    effectiveUser.Department?.includes(dept) && projectManagementUnit.includes(dept)
                );
                if (isSameBan) return true;

                const isInAnyBan = PROJECT_SCOPED_DEPARTMENTS.some(dept =>
                    effectiveUser.Department?.includes(dept) || dept.includes(effectiveUser.Department || '')
                );
                if (isInAnyBan) return false;
            }

            // Contractor → checked elsewhere via allowed_project_ids
            if (systemRole === 'contractor') return false;

            return true;
        },
        [can, isGlobalScope, effectiveUser, systemRole]
    );

    return {
        can,
        canOnProject,
        isGlobalScope,
        systemRole,
        loading: state.loading,
        permissionMap: state.permissions,
        refresh: fetchPermissions,
        isImpersonating,
    };
}
