/**
 * Contract Mappers — snake_case (DB) ↔ PascalCase (Frontend)
 */
import type { Contract, ContractStatus } from '../../types';

export const dbToContract = (row: any): Contract => ({
    ContractID: row.contract_id,
    PackageID: row.package_id || '',
    ContractorID: row.contractor_id || '',
    ProjectID: row.project_id || '',
    ContractName: row.contract_name || '',
    ContractType: row.contract_type || '',
    SignDate: row.sign_date || '',
    Value: Number(row.value) || 0,
    AdvanceRate: Number(row.advance_rate) || 0,
    Warranty: row.warranty || 12,
    Status: row.status as ContractStatus,
    HasVAT: row.has_vat ?? true,
    Scope: row.scope || '',
    DurationMonths: row.duration_months || 0,
    StartDate: row.start_date || '',
    EndDate: row.end_date || '',
    PaymentTerms: row.payment_terms || '',
});

export const contractToDb = (c: Partial<Contract>) => ({
    ...(c.ContractID !== undefined && { contract_id: c.ContractID }),
    ...(c.PackageID !== undefined && { package_id: c.PackageID }),
    ...(c.ContractorID !== undefined && { contractor_id: c.ContractorID }),
    ...(c.ProjectID !== undefined && { project_id: c.ProjectID }),
    ...(c.ContractName !== undefined && { contract_name: c.ContractName }),
    ...(c.ContractType !== undefined && { contract_type: c.ContractType }),
    ...(c.SignDate !== undefined && { sign_date: c.SignDate }),
    ...(c.Value !== undefined && { value: c.Value }),
    ...(c.AdvanceRate !== undefined && { advance_rate: c.AdvanceRate }),
    ...(c.Warranty !== undefined && { warranty: c.Warranty }),
    ...(c.Status !== undefined && { status: c.Status }),
    ...(c.HasVAT !== undefined && { has_vat: c.HasVAT }),
    ...(c.Scope !== undefined && { scope: c.Scope }),
    ...(c.DurationMonths !== undefined && { duration_months: c.DurationMonths }),
    ...(c.StartDate !== undefined && { start_date: c.StartDate }),
    ...(c.EndDate !== undefined && { end_date: c.EndDate }),
    ...(c.PaymentTerms !== undefined && { payment_terms: c.PaymentTerms }),
});
