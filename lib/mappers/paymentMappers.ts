/**
 * Payment Mappers — snake_case (DB) ↔ PascalCase (Frontend)
 */
import type { Payment, PaymentStatus, PaymentType } from '../../types';

export const dbToPayment = (row: any): Payment => ({
    PaymentID: row.payment_id,
    ContractID: row.contract_id,
    ProjectID: row.project_id || '',
    BatchNo: row.batch_no || 1,
    Type: row.type as PaymentType,
    Amount: Number(row.amount) || 0,
    TreasuryRef: row.treasury_ref || '',
    Status: row.status as PaymentStatus,
    Description: row.description || '',
    RequestDate: row.request_date || '',
    ApprovedDate: row.approved_date || '',
    PaidDate: row.paid_date || '',
    ApprovedBy: row.approved_by || '',
    RejectedReason: row.rejected_reason || '',
    RejectedBy: row.rejected_by || '',
    RejectedDate: row.rejected_date || '',
});

export const paymentToDb = (p: Partial<Payment>) => ({
    ...(p.ContractID !== undefined && { contract_id: p.ContractID }),
    ...(p.ProjectID !== undefined && { project_id: p.ProjectID }),
    ...(p.BatchNo !== undefined && { batch_no: p.BatchNo }),
    ...(p.Type !== undefined && { type: p.Type }),
    ...(p.Amount !== undefined && { amount: p.Amount }),
    ...(p.TreasuryRef !== undefined && { treasury_ref: p.TreasuryRef }),
    ...(p.Status !== undefined && { status: p.Status }),
    ...(p.Description !== undefined && { description: p.Description }),
    ...(p.RequestDate !== undefined && { request_date: p.RequestDate }),
    ...(p.ApprovedDate !== undefined && { approved_date: p.ApprovedDate }),
    ...(p.PaidDate !== undefined && { paid_date: p.PaidDate }),
    ...(p.ApprovedBy !== undefined && { approved_by: p.ApprovedBy }),
    ...(p.RejectedReason !== undefined && { rejected_reason: p.RejectedReason }),
    ...(p.RejectedBy !== undefined && { rejected_by: p.RejectedBy }),
    ...(p.RejectedDate !== undefined && { rejected_date: p.RejectedDate }),
});
