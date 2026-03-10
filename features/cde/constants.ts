import { Clock, Share2, CheckCircle2, Archive } from 'lucide-react';
import type { CDEContainerType, CDEStatusCode, CDEWorkflowStepDef } from './types';

// ═══════════════════════════════════════════════════════════════
// CDE Constants — ISO 19650 + NĐ 175/2024/NĐ-CP
// ═══════════════════════════════════════════════════════════════

// --- Project Phases per NĐ 175/2024/NĐ-CP Điều 4 ---
// 3 giai đoạn: Chuẩn bị dự án → Thực hiện dự án → Kết thúc xây dựng
export const CDE_PROJECT_PHASES = [
    {
        id: 'preparation',
        label: '01. Chuẩn bị dự án',
        description: 'Lập BC NCKT/NCTKT, khảo sát, thẩm định, phê duyệt dự án',
        folders: [
            'Khảo sát xây dựng',
            'Báo cáo nghiên cứu tiền khả thi',
            'Báo cáo nghiên cứu khả thi',
            'Báo cáo kinh tế - kỹ thuật',
            'Đánh giá tác động môi trường',
            'Quy hoạch xây dựng',
            'Hồ sơ pháp lý dự án',
        ],
    },
    {
        id: 'implementation',
        label: '02. Thực hiện dự án',
        description: 'Thiết kế, dự toán, thi công, giám sát, nghiệm thu, thanh toán',
        folders: [
            // Thiết kế & dự toán
            'Thiết kế cơ sở (TKCS)',
            'Thiết kế kỹ thuật (TKKT)',
            'Thiết kế bản vẽ thi công (TKBVTC)',
            'Thẩm tra thiết kế',
            'Dự toán xây dựng',
            'Khảo sát phục vụ thiết kế',
            // Thi công & giám sát
            'Hồ sơ nghiệm thu',
            'Nhật ký thi công',
            'Biên bản hiện trường',
            'Hồ sơ vật liệu & thí nghiệm',
            'Biện pháp thi công',
            'Đề nghị thanh toán',
            'Hồ sơ an toàn PCCC',
            'Báo cáo giám sát',
        ],
    },
    {
        id: 'completion',
        label: '03. Kết thúc xây dựng',
        description: 'Nghiệm thu hoàn thành, quyết toán, bàn giao, bảo hành',
        folders: [
            'Hồ sơ hoàn công',
            'Bản vẽ hoàn công',
            'Quyết toán hợp đồng',
            'Quyết toán dự án',
            'Biên bản bàn giao',
            'Hồ sơ bảo hành',
            'Hồ sơ quản lý vận hành',
        ],
    },
];

// --- Workflow Steps (VN construction approval flow) ---
export const CDE_WORKFLOW_STEPS: CDEWorkflowStepDef[] = [
    {
        id: 'CONTRACTOR_SUBMIT', code: 'SUBMIT',
        name: 'Nhà thầu trình', role: 'contractor', roleLabel: 'Nhà thầu',
        nextStatus: 'S1', containerFrom: 'WIP', containerTo: 'WIP',
    },
    {
        id: 'CONSULTANT_CHECK', code: 'CHECK',
        name: 'Tư vấn kiểm tra', role: 'consultant', roleLabel: 'Tư vấn giám sát',
        nextStatus: 'S2', containerFrom: 'WIP', containerTo: 'SHARED',
    },
    {
        id: 'STAFF_APPRAISE', code: 'APPRAISE',
        name: 'Chuyên viên thẩm định', role: 'staff', roleLabel: 'Chuyên viên Ban QLDA',
        nextStatus: 'S3', containerFrom: 'SHARED', containerTo: 'SHARED',
    },
    {
        id: 'MANAGER_APPROVE', code: 'APPROVE',
        name: 'Trưởng phòng duyệt', role: 'manager', roleLabel: 'Trưởng phòng',
        nextStatus: 'A1', containerFrom: 'SHARED', containerTo: 'SHARED',
    },
    {
        id: 'DIRECTOR_SIGN', code: 'SIGN',
        name: 'Lãnh đạo ký số', role: 'director', roleLabel: 'Lãnh đạo',
        nextStatus: 'A1', containerFrom: 'SHARED', containerTo: 'PUBLISHED',
    },
];

// --- Container config ---
export const CDE_CONTAINERS: {
    type: CDEContainerType;
    label: string;
    labelShort: string;
    color: string;
    icon: typeof Clock;
}[] = [
        { type: 'WIP', label: 'WIP - Đang xử lý', labelShort: 'WIP', color: '#f59e0b', icon: Clock },
        { type: 'SHARED', label: 'SHARED - Đang xét duyệt', labelShort: 'SHARED', color: '#3b82f6', icon: Share2 },
        { type: 'PUBLISHED', label: 'PUBLISHED - Đã phê duyệt', labelShort: 'PUBLISHED', color: '#10b981', icon: CheckCircle2 },
        { type: 'ARCHIVED', label: 'ARCHIVED - Lưu trữ', labelShort: 'ARCHIVED', color: '#8b5cf6', icon: Archive },
    ];

// --- Container colors ---
export const CONTAINER_COLORS: Record<CDEContainerType, {
    bg: string; text: string; border: string; dot: string;
    lightBg: string; badge: string; gradient: string;
}> = {
    WIP: {
        bg: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-700', dot: 'bg-amber-500',
        lightBg: 'bg-amber-50 dark:bg-amber-900/20',
        badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
        gradient: 'linear-gradient(135deg, #4A4535 0%, #3D3A2D 100%)',
    },
    SHARED: {
        bg: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-700', dot: 'bg-blue-500',
        lightBg: 'bg-blue-50 dark:bg-blue-900/20',
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        gradient: 'linear-gradient(135deg, #2D3A4A 0%, #253545 100%)',
    },
    PUBLISHED: {
        bg: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-700', dot: 'bg-emerald-500',
        lightBg: 'bg-emerald-50 dark:bg-emerald-900/20',
        badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        gradient: 'linear-gradient(135deg, #2D4A35 0%, #254530 100%)',
    },
    ARCHIVED: {
        bg: 'bg-purple-500', text: 'text-purple-700 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-700', dot: 'bg-purple-500',
        lightBg: 'bg-purple-50 dark:bg-purple-900/20',
        badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
        gradient: 'linear-gradient(135deg, #3A2D4A 0%, #352545 100%)',
    },
};

// --- Status config ---
export const CDE_STATUS_CONFIG: Record<CDEStatusCode, {
    label: string; color: string; container: CDEContainerType;
}> = {
    S0: { label: 'WIP - Đang xử lý', color: '#f59e0b', container: 'WIP' },
    S1: { label: 'Tư vấn đang kiểm tra', color: '#3b82f6', container: 'SHARED' },
    S2: { label: 'Đang thẩm định', color: '#6366f1', container: 'SHARED' },
    S3: { label: 'Đang phê duyệt', color: '#8b5cf6', container: 'SHARED' },
    A1: { label: 'Đã ký duyệt', color: '#10b981', container: 'PUBLISHED' },
    A2: { label: 'Đã bàn giao', color: '#059669', container: 'PUBLISHED' },
    A3: { label: 'Quản lý tài sản', color: '#047857', container: 'PUBLISHED' },
    B1: { label: 'Lưu trữ', color: '#8b5cf6', container: 'ARCHIVED' },
};

// --- VN Construction disciplines ---
export const CDE_DISCIPLINES = [
    { value: 'architecture', label: 'Kiến trúc' },
    { value: 'structure', label: 'Kết cấu' },
    { value: 'mep', label: 'Cơ điện (MEP)' },
    { value: 'infrastructure', label: 'Hạ tầng kỹ thuật' },
    { value: 'fire_safety', label: 'PCCC' },
    { value: 'landscape', label: 'Cảnh quan' },
    { value: 'interior', label: 'Nội thất' },
    { value: 'survey', label: 'Khảo sát' },
    { value: 'environmental', label: 'Môi trường' },
    { value: 'geotechnical', label: 'Địa chất công trình' },
    { value: 'cost_estimation', label: 'Dự toán' },
    { value: 'project_management', label: 'Quản lý dự án' },
    { value: 'other', label: 'Khác' },
];

// --- VN Construction document types (NĐ 175/2024 all phases) ---
export const CDE_DOC_TYPES = [
    // Chuẩn bị dự án
    { value: 'prefeasibility', label: 'BC nghiên cứu tiền khả thi', phase: 'preparation' },
    { value: 'feasibility', label: 'BC nghiên cứu khả thi', phase: 'preparation' },
    { value: 'economic_tech', label: 'BC kinh tế - kỹ thuật', phase: 'preparation' },
    { value: 'eia', label: 'Đánh giá tác động môi trường', phase: 'preparation' },
    { value: 'survey_geo', label: 'Khảo sát địa chất', phase: 'preparation' },
    { value: 'survey_topo', label: 'Khảo sát địa hình', phase: 'preparation' },
    { value: 'planning', label: 'Quy hoạch xây dựng', phase: 'preparation' },
    { value: 'legal_doc', label: 'Hồ sơ pháp lý', phase: 'preparation' },
    // Thực hiện dự án — Thiết kế
    { value: 'design_basic', label: 'Thiết kế cơ sở (TKCS)', phase: 'implementation' },
    { value: 'design_detail', label: 'Thiết kế kỹ thuật (TKKT)', phase: 'implementation' },
    { value: 'design_construction', label: 'Thiết kế BVTC', phase: 'implementation' },
    { value: 'design_review', label: 'Báo cáo thẩm tra thiết kế', phase: 'implementation' },
    { value: 'cost_estimate', label: 'Dự toán xây dựng', phase: 'implementation' },
    { value: 'total_investment', label: 'Tổng mức đầu tư', phase: 'implementation' },
    { value: 'design_task', label: 'Nhiệm vụ thiết kế', phase: 'implementation' },
    { value: 'design_survey', label: 'Khảo sát phục vụ thiết kế', phase: 'implementation' },
    // Thực hiện dự án — Thi công & Giám sát
    { value: 'drawing', label: 'Bản vẽ thiết kế', phase: 'implementation' },
    { value: 'spec', label: 'Thuyết minh kỹ thuật', phase: 'implementation' },
    { value: 'acceptance', label: 'Biên bản nghiệm thu', phase: 'implementation' },
    { value: 'site_diary', label: 'Nhật ký thi công', phase: 'implementation' },
    { value: 'site_record', label: 'Biên bản hiện trường', phase: 'implementation' },
    { value: 'material_cert', label: 'Chứng chỉ vật liệu', phase: 'implementation' },
    { value: 'test_report', label: 'Kết quả thí nghiệm', phase: 'implementation' },
    { value: 'method_statement', label: 'Biện pháp thi công', phase: 'implementation' },
    { value: 'progress_report', label: 'Báo cáo tiến độ', phase: 'implementation' },
    { value: 'supervision_report', label: 'Báo cáo giám sát', phase: 'implementation' },
    { value: 'payment_request', label: 'Đề nghị thanh toán', phase: 'implementation' },
    { value: 'volume_confirm', label: 'Xác nhận khối lượng', phase: 'implementation' },
    { value: 'photo', label: 'Hình ảnh hiện trường', phase: 'implementation' },
    { value: 'safety_report', label: 'Báo cáo an toàn lao động', phase: 'implementation' },
    { value: 'fire_cert', label: 'Chứng nhận PCCC', phase: 'implementation' },
    // Kết thúc xây dựng
    { value: 'as_built', label: 'Bản vẽ hoàn công', phase: 'completion' },
    { value: 'settlement', label: 'Quyết toán dự án', phase: 'completion' },
    { value: 'contract_settlement', label: 'Quyết toán hợp đồng', phase: 'completion' },
    { value: 'handover', label: 'Biên bản bàn giao', phase: 'completion' },
    { value: 'warranty', label: 'Hồ sơ bảo hành', phase: 'completion' },
    { value: 'operation_manual', label: 'Hồ sơ quản lý vận hành', phase: 'completion' },
    { value: 'decision', label: 'Quyết định phê duyệt', phase: 'all' },
    { value: 'other', label: 'Khác', phase: 'all' },
];

// --- Helper functions ---
export function getStatusColor(status: string): string {
    return CDE_STATUS_CONFIG[status as CDEStatusCode]?.color || '#9ca3af';
}

export function getStatusLabel(status: string): string {
    return CDE_STATUS_CONFIG[status as CDEStatusCode]?.label || status;
}

export function getContainerFromStatus(status: string): CDEContainerType {
    return CDE_STATUS_CONFIG[status as CDEStatusCode]?.container || 'WIP';
}

export function formatFileSize(bytes: number): string {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${bytes} B`;
}
