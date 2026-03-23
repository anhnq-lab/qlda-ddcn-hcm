import type { VariationOrder } from '../../types';

export const dbToVariationOrder = (row: any): VariationOrder => ({
    VOID: row.vo_id,
    ContractID: row.contract_id || '',
    Number: row.number || '',
    SignDate: row.sign_date || '',
    Content: row.content || '',
    AdjustedAmount: Number(row.adjusted_amount) || 0,
    AdjustedDuration: Number(row.adjusted_duration) || 0,
    ApprovalFile: row.approval_file || '',
});

export const variationOrderToDb = (v: Partial<VariationOrder>) => ({
    ...(v.VOID !== undefined && { vo_id: v.VOID }),
    ...(v.ContractID !== undefined && { contract_id: v.ContractID }),
    ...(v.Number !== undefined && { number: v.Number }),
    ...(v.SignDate !== undefined && { sign_date: v.SignDate }),
    ...(v.Content !== undefined && { content: v.Content }),
    ...(v.AdjustedAmount !== undefined && { adjusted_amount: v.AdjustedAmount }),
    ...(v.AdjustedDuration !== undefined && { adjusted_duration: v.AdjustedDuration }),
    ...(v.ApprovalFile !== undefined && { approval_file: v.ApprovalFile }),
});
