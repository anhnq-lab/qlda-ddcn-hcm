/**
 * Schemas — Barrel Export
 * 
 * Centralized Zod validation schemas for all ERP entities.
 * Import from 'schemas' to validate form inputs before Supabase.
 * 
 * Usage:
 * ```ts
 * import { ProjectCreateSchema } from '../schemas';
 * const result = ProjectCreateSchema.safeParse(formData);
 * ```
 */
export {
    ProjectCreateSchema,
    ProjectUpdateSchema,
    ProjectGroupSchema,
    type ProjectCreateInput,
    type ProjectUpdateInput,
} from './project.schema';

export {
    ContractCreateSchema,
    ContractUpdateSchema,
    PaymentCreateSchema,
    PaymentUpdateSchema,
    PaymentTypeSchema,
    PaymentStatusSchema,
    type ContractCreateInput,
    type ContractUpdateInput,
    type PaymentCreateInput,
    type PaymentUpdateInput,
} from './contract.schema';

export {
    EmployeeCreateSchema,
    EmployeeUpdateSchema,
    GenderSchema,
    RoleSchema,
    type EmployeeCreateInput,
    type EmployeeUpdateInput,
} from './employee.schema';
