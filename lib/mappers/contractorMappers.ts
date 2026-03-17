/**
 * Contractor Mappers — snake_case (DB) ↔ PascalCase (Frontend)
 */
import type { Contractor } from '../../types';

export const dbToContractor = (row: any): Contractor => ({
    ContractorID: row.contractor_id,
    CapCertCode: row.cap_cert_code || '',
    FullName: row.full_name,
    IsForeign: row.is_foreign,
    OpLicenseNo: row.op_license_no || '',
    Address: row.address || '',
    ContactInfo: row.contact_info || '',
    TaxCode: row.tax_code || '',
    Representative: row.representative || '',
    EstablishedYear: row.established_year || 0,
});

export const contractorToDb = (c: Partial<Contractor>) => ({
    ...(c.ContractorID !== undefined && { contractor_id: c.ContractorID }),
    ...(c.CapCertCode !== undefined && { cap_cert_code: c.CapCertCode }),
    ...(c.FullName !== undefined && { full_name: c.FullName }),
    ...(c.IsForeign !== undefined && { is_foreign: c.IsForeign }),
    ...(c.OpLicenseNo !== undefined && { op_license_no: c.OpLicenseNo }),
    ...(c.Address !== undefined && { address: c.Address }),
    ...(c.ContactInfo !== undefined && { contact_info: c.ContactInfo }),
    ...(c.TaxCode !== undefined && { tax_code: c.TaxCode }),
    ...(c.Representative !== undefined && { representative: c.Representative }),
    ...(c.EstablishedYear !== undefined && { established_year: c.EstablishedYear }),
});
