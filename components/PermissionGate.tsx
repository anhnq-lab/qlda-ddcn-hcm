/**
 * PermissionGate — QLDA ĐDCN TP.HCM
 *
 * Conditionally renders children based on permission.
 * If user lacks permission, renders nothing (or fallback).
 *
 * Usage:
 *   <PermissionGate resource="contracts" action="create">
 *     <button>Tạo hợp đồng mới</button>
 *   </PermissionGate>
 */
import React from 'react';
import { usePermissionCheck } from '../hooks/usePermissionCheck';
import type { PermissionAction, PermissionResource } from '../types/permission.types';

interface PermissionGateProps {
    children: React.ReactNode;
    resource: PermissionResource;
    action?: PermissionAction;
    fallback?: React.ReactNode;
    /** If true, require ANY of the actions (OR logic) */
    anyAction?: PermissionAction[];
}

const PermissionGate: React.FC<PermissionGateProps> = ({
    children,
    resource,
    action = 'view' as PermissionAction,
    fallback = null,
    anyAction,
}) => {
    const { can } = usePermissionCheck();

    // OR logic: if anyAction is provided, check if user has any of them
    if (anyAction && anyAction.length > 0) {
        const hasAny = anyAction.some((a: PermissionAction) => can(resource, a));
        return hasAny ? <>{children}</> : <>{fallback}</>;
    }

    // Single action check
    if (!can(resource, action)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};

export default PermissionGate;
