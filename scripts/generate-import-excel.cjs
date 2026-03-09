const XLSX = require('xlsx');

const data = [
    {
        'STT': 1,
        'Tên gói thầu': 'Tư vấn lập HSMT, đánh giá HSDT gói thầu số 2',
        'Tóm tắt công việc chính của gói thầu': 'Lập HSMT, đánh giá HSDT gói thầu Tư vấn thiết kế bản vẽ thi công và dự toán; Lập mô hình thông tin công trình (BIM)',
        'Lĩnh vực': 'Tư vấn',
        'Giá gói thầu (VND)': 34770648,
        'Chi tiết nguồn vốn': 'Ngân sách Thành phố',
        'Hình thức LCNT': 'Chỉ định thầu rút gọn',
        'Phương thức LCNT': 'Không có phương thức LCNT',
        'Thời gian tổ chức LCNT': '15 ngày',
        'Thời gian bắt đầu tổ chức LCNT': 'Quý I, 2026',
        'Loại hợp đồng': 'Trọn gói',
        'Thời gian thực hiện gói thầu': '60 ngày',
        'Tùy chọn mua thêm': 'Không áp dụng',
        'Trạng thái': '',
    },
    {
        'STT': 2,
        'Tên gói thầu': 'Tư vấn thiết kế bản vẽ thi công và dự toán; Lập mô hình thông tin công trình (BIM)',
        'Tóm tắt công việc chính của gói thầu': 'Tư vấn thiết kế lập bản vẽ thi công và tổng dự toán, giám sát tác giả; Tư vấn lập mô hình thông tin công trình (BIM)',
        'Lĩnh vực': 'Tư vấn',
        'Giá gói thầu (VND)': 6435931356,
        'Chi tiết nguồn vốn': 'Ngân sách thành phố',
        'Hình thức LCNT': 'Đấu thầu rộng rãi',
        'Phương thức LCNT': 'Một giai đoạn hai túi hồ sơ',
        'Thời gian tổ chức LCNT': '60 ngày',
        'Thời gian bắt đầu tổ chức LCNT': 'Quý I, 2026',
        'Loại hợp đồng': 'Trọn gói',
        'Thời gian thực hiện gói thầu': '45 ngày',
        'Tùy chọn mua thêm': 'Không áp dụng',
        'Trạng thái': 'Đã có TBMT',
    },
    {
        'STT': 3,
        'Tên gói thầu': 'Tư vấn thẩm tra thiết kế bản vẽ thi công và dự toán',
        'Tóm tắt công việc chính của gói thầu': 'Thẩm tra sự phù hợp của giải pháp thiết kế; sự tuân thủ quy định về quản lý chi phí dự toán công trình.',
        'Lĩnh vực': 'Tư vấn',
        'Giá gói thầu (VND)': 557126000,
        'Chi tiết nguồn vốn': 'Ngân sách thành phố',
        'Hình thức LCNT': 'Chỉ định thầu rút gọn',
        'Phương thức LCNT': 'Không có phương thức LCNT',
        'Thời gian tổ chức LCNT': '15 ngày',
        'Thời gian bắt đầu tổ chức LCNT': 'Quý I, 2026',
        'Loại hợp đồng': 'Trọn gói',
        'Thời gian thực hiện gói thầu': '30 ngày',
        'Tùy chọn mua thêm': 'Không áp dụng',
        'Trạng thái': '',
    },
];

const ws = XLSX.utils.json_to_sheet(data);
ws['!cols'] = [
    { wch: 6 }, { wch: 55 }, { wch: 55 }, { wch: 14 }, { wch: 20 },
    { wch: 25 }, { wch: 25 }, { wch: 30 }, { wch: 20 }, { wch: 25 },
    { wch: 16 }, { wch: 25 }, { wch: 16 }, { wch: 16 },
];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Gói thầu');
XLSX.writeFile(wb, 'GoiThau_Import_3GoiThau_TKBVTC.xlsx');
console.log('✅ File created: GoiThau_Import_3GoiThau_TKBVTC.xlsx');
console.log(`📊 Total: ${data.length} packages`);
console.log(`💰 Total value: ${data.reduce((s, d) => s + d['Giá gói thầu (VND)'], 0).toLocaleString('vi-VN')} VND`);
