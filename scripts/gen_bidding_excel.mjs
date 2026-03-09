import ExcelJS from 'exceljs';

const workbook = new ExcelJS.Workbook();
const ws = workbook.addWorksheet('Gói thầu');

// ============================================================
// HEADER ROW
// ============================================================
const headers = [
    'STT',
    'Tên chủ đầu tư',
    'Tên gói thầu',
    'Tóm tắt công việc chính',
    'Lĩnh vực',
    'Giá gói thầu (VND)',
    'Chi tiết nguồn vốn',
    'Hình thức LCNT',
    'Phương thức LCNT',
    'Thời gian tổ chức LCNT',
    'Thời gian bắt đầu tổ chức LCNT',
    'Loại hợp đồng',
    'Thời gian thực hiện gói thầu',
    'Tùy chọn mua thêm',
    'Tình trạng TBMT',
];

const headerRow = ws.addRow(headers);
headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };
headerRow.alignment = { vertical: 'middle', wrapText: true };
headerRow.height = 40;

// ============================================================
// DATA
// ============================================================
const CDT = 'Ban Quản lý dự án đầu tư xây dựng các công trình dân dụng và công nghiệp Thành phố Hồ Chí Minh';

const packages = [
    {
        stt: 1,
        name: 'Tư vấn lập HSMT, đánh giá HSDT gói thầu số 2',
        summary: 'Lập HSMT, đánh giá HSDT gói thầu Thiết kế bản vẽ thi công và dự toán; Lập mô hình thông tin công trình (BIM); Lập cấu hình tính năng kỹ thuật và dự toán thiết bị y tế',
        field: 'Tư vấn',
        price: 34653095,
        source: 'Ngân sách Thành phố',
        selectionForm: 'Chỉ định thầu rút gọn',
        selectionMethod: 'Không có phương thức LCNT',
        selectionDuration: '15 ngày',
        selectionStart: 'Tháng 9, 2025',
        contractType: 'Trọn gói',
        executionDuration: '60 ngày',
        option: 'Không áp dụng',
        tbmt: '',
    },
    {
        stt: 2,
        name: 'Tư vấn thiết kế bản vẽ thi công và dự toán; Lập mô hình thông tin công trình (BIM); Lập cấu hình tính năng kỹ thuật và dự toán thiết bị y tế',
        summary: 'Thiết kế bản vẽ thi công và dự toán; Lập mô hình thông tin công trình (BIM); Lập cấu hình tính năng kỹ thuật và dự toán thiết bị y tế',
        field: 'Tư vấn',
        price: 7552984943,
        source: 'Ngân sách Thành phố',
        selectionForm: 'Đấu thầu rộng rãi',
        selectionMethod: 'Một giai đoạn hai túi hồ sơ',
        selectionDuration: '60 ngày',
        selectionStart: 'Tháng 9, 2025',
        contractType: 'Trọn gói',
        executionDuration: '45 ngày',
        option: 'Không áp dụng',
        tbmt: 'Đã có TBMT',
    },
    {
        stt: 3,
        name: 'Tư vấn thẩm tra thiết kế bản vẽ thi công và dự toán, cấu hình tính năng kỹ thuật và dự toán thiết bị y tế',
        summary: 'Thẩm tra thiết kế bản vẽ thi công và dự toán, cấu hình tính năng kỹ thuật và dự toán thiết bị y tế',
        field: 'Tư vấn',
        price: 794655999,
        source: 'Ngân sách Thành phố',
        selectionForm: 'Chỉ định thầu rút gọn',
        selectionMethod: 'Không có phương thức LCNT',
        selectionDuration: '15 ngày',
        selectionStart: 'Tháng 9, 2025',
        contractType: 'Trọn gói',
        executionDuration: '45 ngày',
        option: 'Không áp dụng',
        tbmt: '',
    },
    {
        stt: 4,
        name: 'Tư vấn thẩm định giá thiết bị y tế',
        summary: 'Thẩm định giá thiết bị y tế',
        field: 'Tư vấn',
        price: 170500000,
        source: 'Ngân sách Thành phố',
        selectionForm: 'Chỉ định thầu rút gọn',
        selectionMethod: 'Không có phương thức LCNT',
        selectionDuration: '15 ngày',
        selectionStart: 'Tháng 9, 2025',
        contractType: 'Trọn gói',
        executionDuration: '45 ngày',
        option: 'Không áp dụng',
        tbmt: '',
    },
    {
        stt: 5,
        name: 'Tư vấn lập HSMT, đánh giá HSDT các gói thầu số 7, số 8',
        summary: 'Lập và trình duyệt HSMT, tiêu chuẩn đánh giá HSDT; Đánh giá và trình phê duyệt kết quả đánh giá HSDT, kết quả lựa chọn nhà thầu các gói thầu',
        field: 'Tư vấn',
        price: 433759795,
        source: 'Ngân sách Thành phố',
        selectionForm: 'Chỉ định thầu rút gọn',
        selectionMethod: 'Không có phương thức LCNT',
        selectionDuration: '15 ngày',
        selectionStart: 'Quý IV, 2025',
        contractType: 'Trọn gói',
        executionDuration: '120 ngày',
        option: 'Không áp dụng',
        tbmt: '',
    },
    {
        stt: 6,
        name: 'Thí nghiệm nén tĩnh cọc',
        summary: 'Thí nghiệm nén tĩnh cọc hiện trường và nhằm xác định hình dạng hình học hố khoan, kiểm tra độ nghiêng và sạt lở của hố khoan',
        field: 'Tư vấn',
        price: 776600042,
        source: 'Ngân sách Thành phố',
        selectionForm: 'Chỉ định thầu rút gọn',
        selectionMethod: 'Không có phương thức LCNT',
        selectionDuration: '15 ngày',
        selectionStart: 'Quý IV, 2025',
        contractType: 'Trọn gói',
        executionDuration: '30 ngày',
        option: 'Không áp dụng',
        tbmt: '',
    },
    {
        stt: 7,
        name: 'Thi công xây dựng và cung cấp, lắp đặt thiết bị; Phá dỡ công trình hiện hữu',
        summary: 'Thi công xây dựng và cung cấp, lắp đặt thiết bị theo đúng hồ sơ thiết kế được phê duyệt, đảm bảo tiến độ, giá thành, an toàn lao động và các yêu cầu khác theo quy định; Phá dỡ công trình hiện hữu',
        field: 'Xây lắp',
        price: 552788267000,
        source: 'Ngân sách Thành phố',
        selectionForm: 'Đấu thầu rộng rãi',
        selectionMethod: 'Một giai đoạn một túi hồ sơ',
        selectionDuration: '60 ngày',
        selectionStart: 'Quý IV, 2025',
        contractType: 'Đơn giá cố định',
        executionDuration: '360 ngày',
        option: 'Không áp dụng',
        tbmt: 'Đã có TBMT',
    },
    {
        stt: 8,
        name: 'Tư vấn giám sát thi công xây dựng và cung cấp, lắp đặt thiết bị; Giám sát phá dỡ công trình',
        summary: 'Giám sát công tác thi công xây dựng và lắp đặt thiết bị về chất lượng, khối lượng, tiến độ, an toàn theo các quy định trong hợp đồng, và các quy định pháp luật hiện hành có liên quan; Giám sát phá dỡ công trình',
        field: 'Tư vấn',
        price: 5253027616,
        source: 'Ngân sách Thành phố',
        selectionForm: 'Đấu thầu rộng rãi',
        selectionMethod: 'Một giai đoạn hai túi hồ sơ',
        selectionDuration: '60 ngày',
        selectionStart: 'Quý IV, 2025',
        contractType: 'Trọn gói',
        executionDuration: '360 ngày',
        option: 'Không áp dụng',
        tbmt: 'Đã có TBMT',
    },
    {
        stt: 9,
        name: 'Bảo hiểm công trình',
        summary: 'Bảo hiểm vật chất trực tiếp, không lường trước trong quá trình thi công; Bảo hiểm của người được bảo hiểm đối với tính mạng, thương tật hoặc tài sản của bên thứ 3 trong quá trình thi công',
        field: 'Phi tư vấn',
        price: 845887001,
        source: 'Ngân sách Thành phố',
        selectionForm: 'Chỉ định thầu rút gọn',
        selectionMethod: 'Không có phương thức LCNT',
        selectionDuration: '15 ngày',
        selectionStart: 'Quý IV, 2025',
        contractType: 'Trọn gói',
        executionDuration: '360 ngày',
        option: 'Không áp dụng',
        tbmt: '',
    },
    {
        stt: 10,
        name: 'Tư vấn tổ chức đấu giá vật tư thu hồi',
        summary: 'Tổ chức đấu giá tài sản thu hồi sau khi phá dỡ các công trình hiện hữu theo quy định',
        field: 'Tư vấn',
        price: 1000000,
        source: 'Ngân sách Thành phố',
        selectionForm: 'Chỉ định thầu rút gọn',
        selectionMethod: 'Không có phương thức LCNT',
        selectionDuration: '15 ngày',
        selectionStart: 'Quý IV, 2025',
        contractType: 'Trọn gói',
        executionDuration: '60 ngày',
        option: 'Không áp dụng',
        tbmt: '',
    },
    {
        stt: 11,
        name: 'Quan trắc công trình',
        summary: 'Tổ chức quan trắc công trình',
        field: 'Tư vấn',
        price: 124927560,
        source: 'Ngân sách Thành phố',
        selectionForm: 'Chỉ định thầu rút gọn',
        selectionMethod: 'Không có phương thức LCNT',
        selectionDuration: '15 ngày',
        selectionStart: 'Quý I, 2026',
        contractType: 'Trọn gói',
        executionDuration: '300 ngày',
        option: 'Không áp dụng',
        tbmt: '',
    },
];

// ============================================================
// ADD DATA ROWS
// ============================================================
packages.forEach((pkg) => {
    const row = ws.addRow([
        pkg.stt,
        CDT,
        pkg.name,
        pkg.summary,
        pkg.field,
        pkg.price,
        pkg.source,
        pkg.selectionForm,
        pkg.selectionMethod,
        pkg.selectionDuration,
        pkg.selectionStart,
        pkg.contractType,
        pkg.executionDuration,
        pkg.option,
        pkg.tbmt,
    ]);
    row.alignment = { vertical: 'middle', wrapText: true };
});

// ============================================================
// COLUMN WIDTHS
// ============================================================
ws.columns = [
    { width: 5 },   // STT
    { width: 30 },  // Tên chủ đầu tư
    { width: 45 },  // Tên gói thầu
    { width: 50 },  // Tóm tắt
    { width: 12 },  // Lĩnh vực
    { width: 22 },  // Giá gói thầu
    { width: 20 },  // Nguồn vốn
    { width: 22 },  // Hình thức LCNT
    { width: 28 },  // Phương thức LCNT
    { width: 16 },  // TG tổ chức LCNT
    { width: 18 },  // TG bắt đầu
    { width: 16 },  // Loại HĐ
    { width: 18 },  // TG thực hiện
    { width: 16 },  // Tùy chọn
    { width: 16 },  // TBMT
];

// Format price column as number with comma separator
ws.getColumn(6).numFmt = '#,##0';

// Borders
ws.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };
    });
});

// Highlight the main construction package (row 8 = header + 7)
const mainRow = ws.getRow(8); // Row for package #7
mainRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } };
mainRow.font = { bold: true };

// TBMT status styling
packages.forEach((pkg, i) => {
    if (pkg.tbmt === 'Đã có TBMT') {
        const cell = ws.getCell(i + 2, 15);
        cell.font = { color: { argb: 'FF198754' }, bold: true };
    }
});

// ============================================================
// SAVE
// ============================================================
const outputPath = 'D:/QuocAnh/2026/01.Project/qlda-ddcn-hcm/resources/GoiThau_BV_NguyenTriPhuong_KhuC.xlsx';
await workbook.xlsx.writeFile(outputPath);
console.log(`✅ Excel saved to: ${outputPath}`);
