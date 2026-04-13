/**
 * Project Zod Schemas — Validation cho entity Dự Án
 * 
 * Dùng để validate form input trước khi gửi Supabase.
 * Tập trung error messages Tiếng Việt.
 * Compatible with Zod v4+
 */
import { z } from 'zod';

// ─── Enums ────────────────────────────────────────────────
export const ProjectGroupSchema = z.enum(['QN', 'A', 'B', 'C'], {
    error: 'Vui lòng chọn nhóm dự án',
});

export const InvestmentTypeSchema = z.coerce.number().int().min(1).max(4);

export const ProjectStatusSchema = z.coerce.number().int().min(1).max(3);

// ─── Create Project Input ─────────────────────────────────
export const ProjectCreateSchema = z.object({
    ProjectName: z.string()
        .min(3, 'Tên dự án phải có ít nhất 3 ký tự')
        .max(500, 'Tên dự án không được quá 500 ký tự'),

    GroupCode: ProjectGroupSchema,

    InvestmentType: InvestmentTypeSchema,

    TotalInvestment: z.coerce.number()
        .min(0, 'Tổng mức đầu tư phải ≥ 0'),

    CapitalSource: z.string()
        .min(1, 'Vui lòng nhập nguồn vốn'),

    LocationCode: z.string()
        .min(1, 'Vui lòng nhập địa điểm dự án'),

    Status: ProjectStatusSchema.default(1),

    IsEmergency: z.boolean().default(false),
    IsODA: z.boolean().default(false),

    // Optional fields
    DecisionMakerID: z.coerce.number().int().optional(),
    ProjectNumber: z.string().optional(),
    Objective: z.string().max(2000, 'Mục tiêu đầu tư không quá 2000 ký tự').optional(),
    CompetentAuthority: z.string().optional(),
    Duration: z.string().optional(),
    ManagementForm: z.string().optional(),
    DecisionNumber: z.string().optional(),
    DecisionDate: z.string().optional(),
    DecisionAuthority: z.string().optional(),
    ApprovalDate: z.string().optional(),
    InvestorName: z.string().optional(),
    InvestmentScale: z.string().optional(),
    ConstructionType: z.string().optional(),
    ConstructionGrade: z.string().optional(),
    ManagementBoard: z.coerce.number().int().min(1).max(7).optional(),
    ProvinceCode: z.string().optional(),

    // Quy mô công trình
    SiteArea: z.coerce.number().min(0).optional(),
    ConstructionArea: z.coerce.number().min(0).optional(),
    FloorArea: z.coerce.number().min(0).optional(),
    BuildingHeight: z.coerce.number().min(0).optional(),
    AboveGroundFloors: z.coerce.number().int().min(0).optional(),
    BasementFloors: z.coerce.number().int().min(0).optional(),

    Coordinates: z.object({
        lat: z.number(),
        lng: z.number(),
    }).optional(),
});

// ─── Update Project Input ─────────────────────────────────
export const ProjectUpdateSchema = ProjectCreateSchema.partial().extend({
    ProjectID: z.string().uuid('ID dự án không hợp lệ'),
});

// ─── Types inferred from schemas ──────────────────────────
export type ProjectCreateInput = z.infer<typeof ProjectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof ProjectUpdateSchema>;
