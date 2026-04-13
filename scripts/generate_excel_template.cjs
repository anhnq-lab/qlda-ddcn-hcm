const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

async function generateTemplate() {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'CIC ERP';
    workbook.lastModifiedBy = 'Admin';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Quy_Trinh', {
        views: [{ state: 'frozen', ySplit: 1 }]
    });

    sheet.columns = [
        { header: 'Giai đoạn (Phase)', key: 'phase', width: 20 },
        { header: 'Mã bước', key: 'sub_process', width: 12 },
        { header: 'Tên bước (Node Name)', key: 'name', width: 45 },
        { header: 'Đơn vị thực hiện', key: 'assignee_role', width: 20 },
        { header: 'Thời gian (SLA)', key: 'sla_formula', width: 15 },
        { header: 'Căn cứ pháp lý', key: 'legal_basis', width: 35 },
        { header: 'Hồ sơ biểu mẫu', key: 'template_forms', width: 40 },
        { header: 'Nhiệm vụ chi tiết (JSON)', key: 'sub_tasks', width: 50 },
    ];

    // Style Header
    sheet.getRow(1).eachCell((cell) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1F4E79' } // Dark blue
        };
        cell.font = {
            color: { argb: 'FFFFFFFF' },
            bold: true,
            size: 11,
            name: 'Arial'
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = {
            top: {style:'thin'},
            left: {style:'thin'},
            bottom: {style:'thin'},
            right: {style:'thin'}
        };
    });
    sheet.getRow(1).height = 25;

    // Add sample data
    sheet.addRow({
        phase: 'preparation',
        sub_process: 'Bước 1.1',
        name: 'Lập, phê duyệt Nhiệm vụ và Dự toán chi phí CBĐT',
        assignee_role: 'Ban QLDA',
        sla_formula: '7d',
        legal_basis: 'Khoản 1 Điều 10 NĐ 10/2021/NĐ-CP',
        template_forms: 'TTr_PheDuyetNhiemVu_CBĐT.docx',
        sub_tasks: '[{"name":"Xác định ranh giới","assignee_role":"Ban QLDA"}]'
    });
    
    // Style body cells
    sheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
            row.eachCell((cell) => {
                cell.alignment = { vertical: 'middle', wrapText: true };
                cell.font = { name: 'Arial', size: 10 };
                cell.border = {
                    top: {style:'thin', color: {argb:'FFDDDDDD'}},
                    left: {style:'thin', color: {argb:'FFDDDDDD'}},
                    bottom: {style:'thin', color: {argb:'FFDDDDDD'}},
                    right: {style:'thin', color: {argb:'FFDDDDDD'}}
                };
            });
        }
    });

    // Ensure directory exists
    const publicDir = path.join(__dirname, '..', 'public', 'templates');
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    const exportPath = path.join(publicDir, 'Template_KhaiBao_QuyTrinh.xlsx');
    await workbook.xlsx.writeFile(exportPath);
    console.log(`Excel template generated strongly! Path: ${exportPath}`);
}

generateTemplate().catch(console.error);
