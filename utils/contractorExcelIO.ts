/**
 * Contractor Excel Export Utility
 * Export: Contractor[] → .xlsx file
 */
import * as XLSX from 'xlsx';
import { Contractor, CONTRACTOR_TYPE_LABELS, ContractorType } from '../types';

interface ColumnDef {
    header: string;
    key: string;
    width: number;
}

const COLUMNS: ColumnDef[] = [
    { header: 'STT', key: 'stt', width: 6 },
    { header: 'Mã số thuế', key: 'TaxCode', width: 16 },
    { header: 'Tên nhà thầu', key: 'FullName', width: 40 },
    { header: 'Loại hình', key: 'ContractorType', width: 14 },
    { header: 'Người đại diện', key: 'Representative', width: 20 },
    { header: 'Địa chỉ', key: 'Address', width: 40 },
    { header: 'Điện thoại', key: 'ContactInfo', width: 16 },
    { header: 'Email', key: 'Email', width: 24 },
    { header: 'Website', key: 'Website', width: 24 },
    { header: 'Mã chứng chỉ năng lực', key: 'CapCertCode', width: 20 },
    { header: 'Năm thành lập', key: 'EstablishedYear', width: 14 },
];

export function exportContractorsToExcel(contractors: Contractor[]): void {
    const rows = contractors.map((c, idx) => ({
        'STT': idx + 1,
        'Mã số thuế': c.TaxCode || '',
        'Tên nhà thầu': c.FullName || '',
        'Loại hình': CONTRACTOR_TYPE_LABELS[c.ContractorType as ContractorType] || c.ContractorType || '',
        'Người đại diện': c.Representative || '',
        'Địa chỉ': c.Address || '',
        'Điện thoại': c.ContactInfo || '',
        'Email': c.Email || '',
        'Website': c.Website || '',
        'Mã chứng chỉ năng lực': c.CapCertCode || '',
        'Năm thành lập': c.EstablishedYear || '',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = COLUMNS.map(c => ({ wch: c.width }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Nhà thầu');

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    XLSX.writeFile(wb, `DanhSachNhaThau_${dateStr}.xlsx`);
}
