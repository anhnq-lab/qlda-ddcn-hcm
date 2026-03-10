// ═══════════════════════════════════════════════════════════════
// CDE Types — ISO 19650 + VN Construction
// ═══════════════════════════════════════════════════════════════

export type CDEContainerType = 'WIP' | 'SHARED' | 'PUBLISHED' | 'ARCHIVED';
export type CDEStatusCode = 'S0' | 'S1' | 'S2' | 'S3' | 'A1' | 'A2' | 'A3' | 'B1';
export type CDEWorkflowStatus = 'Pending' | 'Approved' | 'Rejected' | 'Returned';
export type CDEUserRole = 'contractor' | 'consultant' | 'staff' | 'manager' | 'director';

export interface CDEFolder {
    id: string;
    project_id: string;
    parent_id: string | null;
    name: string;
    container_type: CDEContainerType;
    path: string;
    sort_order: number;
    icon?: string;
    description?: string;
    created_at: string;
    updated_at: string;
    doc_count?: number;
}

export interface CDEDocument {
    doc_id: number;
    project_id: string;
    doc_name: string;
    storage_path: string;
    size: string;
    version: string;
    cde_folder_id: string | null;
    cde_status: CDEStatusCode;
    iso_status: string;
    revision: string;
    upload_date: string;
    uploaded_by: string;
    submitted_by: string;
    submitted_by_org: string;
    contractor_id: string | null;
    document_number: string;
    discipline: string;
    doc_type: string;
    issue_date: string;
    notes: string;
    source: string;
    deadline: string | null;
    priority: string;
    is_digitized: boolean;
    created_at: string;
}

export interface CDEWorkflowEntry {
    id: string;
    doc_id: number;
    step_name: string;
    step_code: string;
    actor_id: string;
    actor_name: string;
    actor_role: string;
    status: CDEWorkflowStatus;
    comment: string;
    attachments: string[];
    created_at: string;
}

export interface CDEStats {
    total: number;
    wip: number;
    shared: number;
    published: number;
    archived: number;
}

export interface CDEWorkflowStepDef {
    id: string;
    code: string;
    name: string;
    role: CDEUserRole;
    roleLabel: string;
    nextStatus: CDEStatusCode;
    containerFrom: CDEContainerType;
    containerTo: CDEContainerType;
}

// ═══════════════════════════════════════════════════════════════
// Phase 3 — Enterprise Types
// ═══════════════════════════════════════════════════════════════

export type CDEPermRole = 'viewer' | 'contributor' | 'reviewer' | 'approver' | 'admin';

export interface CDEPermission {
    id: string;
    project_id: string;
    user_id: string;
    user_name: string;
    user_role: CDEPermRole;
    container_access: CDEContainerType[];
    can_upload: boolean;
    can_approve: boolean;
    can_delete: boolean;
    can_manage: boolean;
    folder_restrictions: string[];
    granted_by: string;
    created_at: string;
    updated_at: string;
}

export type TransmittalPurpose = 'for_review' | 'for_approval' | 'for_information' | 'for_construction' | 'as_built';
export type TransmittalStatus = 'draft' | 'sent' | 'acknowledged' | 'closed';

export interface CDETransmittal {
    id: string;
    project_id: string;
    transmittal_no: string;
    subject: string;
    from_org: string;
    from_person: string;
    to_org: string;
    to_person: string;
    cc_list: string[];
    doc_ids: number[];
    purpose: TransmittalPurpose;
    notes: string;
    status: TransmittalStatus;
    sent_at: string | null;
    created_by: string;
    created_at: string;
}

export interface CDEAuditEntry {
    id: string;
    project_id: string;
    entity_type: string;
    entity_id: string;
    action: string;
    actor_id: string;
    actor_name: string;
    details: Record<string, any>;
    ip_address: string;
    created_at: string;
}

