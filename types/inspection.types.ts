// Inspection / Audit types — Quản lý thanh tra, kiểm toán dự án

export type InspectionType = 'thanh_tra' | 'kiem_toan';
export type FollowUpStatus = 'pending' | 'in_progress' | 'completed';

export interface Inspection {
    InspectionID: string;
    ProjectID: string;
    InspectionType: InspectionType;
    InspectionName: string;
    InspectionAgency?: string;
    InspectorName?: string;
    DecisionNumber?: string;
    DecisionDate?: string;
    StartDate?: string;
    EndDate?: string;
    Conclusion?: string;
    Recommendations?: string;
    Penalties: number;
    FollowUpStatus: FollowUpStatus;
    FollowUpDeadline?: string;
    FollowUpNotes?: string;
    Attachments: Array<{ name: string; url: string; size?: string }>;
    Status: 'active' | 'archived';
    CreatedBy?: string;
    CreatedAt?: string;
    UpdatedAt?: string;
}

// Labels for display
export const INSPECTION_TYPE_LABELS: Record<InspectionType, string> = {
    thanh_tra: 'Thanh tra',
    kiem_toan: 'Kiểm toán',
};

export const FOLLOW_UP_STATUS_LABELS: Record<FollowUpStatus, string> = {
    pending: 'Chờ xử lý',
    in_progress: 'Đang xử lý',
    completed: 'Đã hoàn thành',
};
