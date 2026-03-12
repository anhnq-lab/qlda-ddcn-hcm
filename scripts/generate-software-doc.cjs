// generate-software-doc.cjs — Tạo tài liệu giới thiệu phần mềm QLDA ĐTXD DDCN
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, TableOfContents, LevelFormat,
} = require('docx');
const fs = require('fs');
const path = require('path');

// ── Color palette ──
const C = {
  gold: 'D4A017', goldDark: 'B8860B', charcoal: '2D2D2D', dark: '1F1F1F',
  white: 'FFFFFF', gray: '666666', lightGray: 'F5F4F1', blue: '3B82F6',
  green: '10B981', orange: 'F97316', red: 'EF4444', headerBg: '2D2D2D',
  tableBorder: 'CCCCCC', tableHeader: 'D4A017', tableHeaderText: 'FFFFFF',
  tableAlt: 'FBF7ED',
};

const border = { style: BorderStyle.SINGLE, size: 1, color: C.tableBorder };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

// ── Helpers ──
function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 200 },
    children: [new TextRun({ text, bold: true, font: 'Arial', size: 32, color: C.charcoal })] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 160 },
    children: [new TextRun({ text, bold: true, font: 'Arial', size: 26, color: C.goldDark })] });
}
function h3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 120 },
    children: [new TextRun({ text, bold: true, font: 'Arial', size: 22, color: C.charcoal })] });
}
function para(text, opts = {}) {
  return new Paragraph({ spacing: { after: 120 }, alignment: opts.center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
    children: [new TextRun({ text, font: 'Arial', size: 22, color: opts.color || C.dark, bold: opts.bold, italics: opts.italic })] });
}
function bullet(text, bold = '') {
  const children = [];
  if (bold) { children.push(new TextRun({ text: bold, font: 'Arial', size: 22, bold: true })); }
  children.push(new TextRun({ text, font: 'Arial', size: 22 }));
  return new Paragraph({ spacing: { after: 60 },
    numbering: { reference: 'bullets', level: 0 }, children });
}
function headerCell(text, width) {
  return new TableCell({ borders, width: { size: width, type: WidthType.DXA },
    shading: { fill: C.tableHeader, type: ShadingType.CLEAR }, margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text, font: 'Arial', size: 20, bold: true, color: C.tableHeaderText })] })] });
}
function cell(text, width, opts = {}) {
  return new TableCell({ borders, width: { size: width, type: WidthType.DXA },
    shading: opts.alt ? { fill: C.tableAlt, type: ShadingType.CLEAR } : undefined, margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text, font: 'Arial', size: 20, color: C.dark, bold: opts.bold })] })] });
}
function makeTable(headers, rows, colWidths) {
  const totalW = colWidths.reduce((a, b) => a + b, 0);
  return new Table({ width: { size: totalW, type: WidthType.DXA }, columnWidths: colWidths,
    rows: [
      new TableRow({ children: headers.map((h, i) => headerCell(h, colWidths[i])) }),
      ...rows.map((row, ri) => new TableRow({
        children: row.map((c, ci) => cell(c, colWidths[ci], { alt: ri % 2 === 1 }))
      }))
    ] });
}

// ── MODULES DATA ──
const modules = [
  { name: '1. Tổng quan (Dashboard)', desc: 'Trung tâm điều hành tổng thể với các chỉ số KPI theo thời gian thực', features: [
    ['Thẻ KPI thống kê', 'Hiển thị 5 chỉ số chính: Số dự án, Tổng vốn đầu tư, Giải ngân, Hợp đồng, Cảnh báo rủi ro'],
    ['Biểu đồ phân bổ', 'Biểu đồ cột xếp chồng dự án theo Ban QLDA và giai đoạn; Biểu đồ donut cơ cấu vốn đầu tư'],
    ['Biểu đồ giải ngân', 'So sánh kế hoạch vốn và thực hiện giải ngân theo tháng (12 tháng)'],
    ['Bản đồ vị trí dự án', 'Bản đồ tương tác hiển thị vị trí tất cả dự án, phân biệt giai đoạn bằng màu sắc'],
    ['Cảnh báo rủi ro', 'Danh sách công việc quá hạn, vấn đề pháp lý, GPMB — phân loại theo mức độ nghiêm trọng'],
    ['Bộ lọc thông minh', 'Lọc theo dự án, năm, Ban QLDA — tự động cập nhật tất cả biểu đồ'],
    ['AI Summary', 'Tóm tắt tình hình dự án bằng AI, phát hiện bất thường, đánh giá rủi ro tự động'],
    ['Dashboard cá nhân', 'Trang tổng quan riêng cho từng người dùng với công việc được giao'],
  ]},
  { name: '2. Quản lý Dự án Đầu tư', desc: 'Quản lý toàn diện thông tin dự án đầu tư công theo Luật ĐTC 58/2024/QH15', features: [
    ['Danh sách dự án', 'Hiển thị dạng thẻ (Card) với tiến độ, giai đoạn, Ban QLDA; Tìm kiếm và lọc đa tiêu chí'],
    ['Thông tin dự án', 'Thông tin chung, chủ đầu tư, quyết định phê duyệt, phân loại nhóm (QN/A/B/C)'],
    ['Vòng đời dự án', 'Timeline 3 giai đoạn: Chuẩn bị → Thực hiện → Kết thúc xây dựng (theo NĐ 175/2024)'],
    ['Gói thầu', 'Quản lý kế hoạch lựa chọn nhà thầu, đấu thầu, chỉ định thầu, tự thực hiện'],
    ['Vốn & Giải ngân', 'Kế hoạch vốn theo Luật ĐTC 2024, theo dõi giải ngân, quyết toán'],
    ['Tuân thủ pháp lý', 'Checklist tuân thủ TT24/2025/TT-BXD, hồ sơ PCCC, môi trường, giấy phép xây dựng'],
    ['Tài liệu dự án', 'Quản lý hồ sơ theo giai đoạn, upload/download, preview trực tiếp'],
    ['Kế hoạch thực hiện', 'Gantt chart, milestone, tiến độ, phân bổ nguồn lực'],
    ['Vận hành & Nghiệm thu', 'Nghiệm thu công trình, bàn giao, quyết toán, bảo hành'],
  ]},
  { name: '3. BIM 3D Viewer', desc: 'Trình xem mô hình BIM 3D tích hợp trực tiếp trong hệ thống', features: [
    ['Upload & Render IFC', 'Upload file IFC, tự động render mô hình 3D trong trình duyệt'],
    ['Navigation 3D', 'Xoay, zoom, pan; ViewCube điều hướng; Walkthrough mode đi bộ trong mô hình'],
    ['Model Tree', 'Cây phân cấp cấu kiện theo tầng/loại, bật/tắt hiển thị từng nhóm'],
    ['Properties Panel', 'Xem thuộc tính chi tiết cấu kiện: vật liệu, kích thước, tham số kỹ thuật'],
    ['Section Plane', 'Cắt mặt cắt ngang/dọc qua mô hình để xem bên trong'],
    ['Measurement Tools', 'Đo khoảng cách, diện tích, góc trực tiếp trên mô hình 3D'],
    ['Facility Management', 'Quản lý tài sản, thiết bị theo vị trí trong mô hình BIM'],
    ['Keyboard Shortcuts', 'Phím tắt cho các thao tác thường dùng, tối ưu hiệu suất'],
  ]},
  { name: '4. Môi trường Dữ liệu Chung (CDE)', desc: 'Common Data Environment theo tiêu chuẩn ISO 19650 cho quản lý tài liệu BIM', features: [
    ['Folder Tree', 'Cấu trúc thư mục phân cấp theo dự án, giai đoạn, loại hồ sơ (WIP/SHARED/PUBLISHED/ARCHIVED)'],
    ['Upload & Drag-drop', 'Kéo thả file vào CDE, hỗ trợ đa định dạng (PDF, DWG, IFC, DOC, XLS...)'],
    ['Workflow duyệt tài liệu', 'Quy trình Submit → Review → Approve theo trạng thái tài liệu'],
    ['Revision History', 'Lịch sử phiên bản đầy đủ, so sánh giữa các phiên bản'],
    ['Transmittal', 'Tạo phiếu gửi tài liệu chính thức giữa các bên'],
    ['Permission Manager', 'Phân quyền truy cập theo tổ chức, vai trò — nhóm Ban QLDA, nhà thầu'],
    ['Audit Log', 'Ghi lại mọi thao tác: ai tải, ai sửa, ai duyệt — theo dõi trách nhiệm'],
    ['Comment Thread', 'Bình luận trực tiếp trên tài liệu, trao đổi giữa các bên'],
    ['Contractor Dashboard', 'Trang tổng quan riêng cho nhà thầu, chỉ thấy tài liệu được phân quyền'],
  ]},
  { name: '5. Quản lý Hợp đồng', desc: 'Quản lý toàn bộ vòng đời hợp đồng xây dựng', features: [
    ['Danh sách hợp đồng', 'Tìm kiếm, lọc theo trạng thái (Đang thực hiện/Tạm dừng/Đã thanh lý), dự án, nhà thầu'],
    ['Chi tiết hợp đồng', 'Thông tin đầy đủ: số HĐ, giá trị, thời hạn, bên A/B, điều kiện thanh toán'],
    ['Phụ lục hợp đồng', 'Quản lý các phụ lục, điều chỉnh giá trị, gia hạn thời gian'],
    ['Liên kết thanh toán', 'Theo dõi các đợt thanh toán liên quan, tỷ lệ giải ngân'],
  ]},
  { name: '6. Quản lý Thanh toán', desc: 'Theo dõi thanh toán, giải ngân cho các dự án và hợp đồng', features: [
    ['Danh sách thanh toán', 'Hiển thị tất cả các khoản thanh toán, lọc theo trạng thái, loại, dự án'],
    ['Form thanh toán', 'Tạo đề nghị thanh toán: tạm ứng, thanh toán khối lượng, quyết toán'],
    ['Trạng thái thanh toán', 'Theo dõi: Chờ duyệt → Đã duyệt → Đã chuyển khoản'],
    ['Báo cáo giải ngân', 'Tổng hợp theo tháng, quý, năm; so sánh kế hoạch vs thực hiện'],
  ]},
  { name: '7. Quản lý Công việc', desc: 'Quản lý và phân công công việc, theo dõi tiến độ', features: [
    ['Kanban Board', 'Bảng Kanban kéo thả: Todo → In Progress → Review → Done'],
    ['Danh sách công việc', 'Xem dạng bảng với bộ lọc đa tiêu chí, tìm kiếm nhanh'],
    ['Chi tiết công việc', 'Mô tả, ưu tiên, người giao/nhận, deadline, subtask, attachment'],
    ['Template công việc', '17+ mẫu công việc theo quy trình đầu tư xây dựng (Lập BCNCKT, Đấu thầu...)'],
    ['Phụ thuộc công việc', 'Thiết lập quan hệ phụ thuộc giữa các công việc'],
    ['Lọc & Tìm kiếm', 'Lọc theo dự án, trạng thái, ưu tiên, người thực hiện, hạn hoàn thành'],
  ]},
  { name: '8. Quản lý Nhân sự', desc: 'Quản lý thông tin nhân viên Ban QLDA', features: [
    ['Danh sách nhân viên', 'Thông tin cá nhân, chức vụ, phòng ban, Ban QLDA, ảnh đại diện'],
    ['Chi tiết nhân viên', 'Hồ sơ đầy đủ, lịch sử công tác, dự án tham gia'],
    ['Sơ đồ tổ chức', 'Mô hình tổ chức phân cấp theo Ban QLDA (Ban 1–5)'],
  ]},
  { name: '9. Quản lý Nhà thầu', desc: 'Quản lý thông tin các nhà thầu, đơn vị tư vấn', features: [
    ['Danh sách nhà thầu', 'Tên, mã số thuế, lĩnh vực, năng lực, hạng — tìm kiếm nhanh'],
    ['Chi tiết nhà thầu', 'Hồ sơ năng lực, danh sách hợp đồng đã/đang thực hiện, đánh giá'],
    ['AI Contractor Scoring', 'Chấm điểm nhà thầu tự động dựa trên hiệu suất, chất lượng, tuân thủ'],
  ]},
  { name: '10. Hồ sơ Tài liệu', desc: 'Quản lý hồ sơ, tài liệu dự án tập trung', features: [
    ['Upload & Download', 'Tải lên/tải xuống tài liệu, hỗ trợ đa định dạng'],
    ['Phân loại tài liệu', 'Phân loại theo dự án, giai đoạn, loại hồ sơ'],
    ['Preview trực tiếp', 'Xem trước PDF, hình ảnh, và các định dạng phổ biến'],
  ]},
  { name: '11. Văn bản Pháp luật', desc: 'Tra cứu văn bản quy phạm pháp luật liên quan đến đầu tư xây dựng', features: [
    ['Tìm kiếm văn bản', 'Tìm kiếm theo số hiệu, tên, cơ quan ban hành, lĩnh vực'],
    ['Cơ sở dữ liệu pháp luật', 'Lưu trữ: Luật ĐTC 58/2024, Luật XD 62/2020, NĐ 175/2024, NĐ 214/2025, TT24/2025...'],
    ['Liên kết dự án', 'Gắn văn bản áp dụng trực tiếp vào từng dự án'],
  ]},
  { name: '12. Báo cáo', desc: 'Trung tâm báo cáo tổng hợp', features: [
    ['Báo cáo tổng hợp', 'Tổng hợp tiến độ, tài chính, nhân sự toàn bộ danh mục dự án'],
    ['Xuất báo cáo', 'Xuất Excel, PDF theo mẫu Bộ Xây dựng, UBND TP.HCM'],
    ['Biểu mẫu KHLCNT', 'Xuất kế hoạch lựa chọn nhà thầu theo mẫu quy định'],
  ]},
  { name: '13. Quản trị Hệ thống', desc: 'Quản lý tài khoản, phân quyền, audit log', features: [
    ['Quản lý tài khoản', 'Tạo, sửa, vô hiệu hóa tài khoản người dùng; gán vai trò'],
    ['Phân quyền chi tiết', 'RBAC: phân quyền theo tài nguyên (dự án, hợp đồng, CDE...) × hành động (xem, sửa, xóa)'],
    ['Audit Log', 'Ghi nhận mọi thao tác quan trọng: đăng nhập, sửa dữ liệu, duyệt tài liệu'],
    ['Impersonation', 'Admin có thể xem hệ thống dưới góc nhìn của người dùng khác để hỗ trợ'],
    ['Cài đặt hệ thống', 'Dark/Light mode, ngôn ngữ, thông báo, tùy chỉnh giao diện'],
  ]},
];

// ── BUILD DOCUMENT ──
async function main() {
  const doc = new Document({
    styles: {
      default: { document: { run: { font: 'Arial', size: 22 } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 32, bold: true, font: 'Arial', color: C.charcoal },
          paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 26, bold: true, font: 'Arial', color: C.goldDark },
          paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
        { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 22, bold: true, font: 'Arial', color: C.charcoal },
          paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
      ]
    },
    numbering: {
      config: [{
        reference: 'bullets', levels: [{
          level: 0, format: LevelFormat.BULLET, text: '\u2022', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      }]
    },
    sections: [
      // ══════ COVER PAGE ══════
      {
        properties: {
          page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
        },
        children: [
          new Paragraph({ spacing: { before: 2400 } }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
            children: [new TextRun({ text: 'BAN QUẢN LÝ DỰ ÁN ĐẦU TƯ XÂY DỰNG', font: 'Arial', size: 24, bold: true, color: C.gold })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
            children: [new TextRun({ text: 'CÁC CÔNG TRÌNH DÂN DỤNG VÀ CÔNG NGHIỆP', font: 'Arial', size: 24, bold: true, color: C.gold })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 },
            children: [new TextRun({ text: 'UBND THÀNH PHỐ HỒ CHÍ MINH', font: 'Arial', size: 20, color: C.gray })] }),
          new Paragraph({ spacing: { before: 400, after: 400 }, alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: '━━━━━━━━━━━━━━━━━━━━━━━━━━', color: C.gold, size: 28 })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 },
            children: [new TextRun({ text: 'TÀI LIỆU GIỚI THIỆU PHẦN MỀM', font: 'Arial', size: 44, bold: true, color: C.charcoal })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
            children: [new TextRun({ text: 'HỆ THỐNG QUẢN LÝ DỰ ÁN', font: 'Arial', size: 36, bold: true, color: C.goldDark })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
            children: [new TextRun({ text: 'ĐẦU TƯ XÂY DỰNG', font: 'Arial', size: 36, bold: true, color: C.goldDark })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 800 },
            children: [new TextRun({ text: '(QLDA ĐTXD DDCN — TP. HỒ CHÍ MINH)', font: 'Arial', size: 22, italics: true, color: C.gray })] }),
          new Paragraph({ spacing: { before: 800 }, alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'Phiên bản: 1.0', font: 'Arial', size: 22, color: C.gray })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 },
            children: [new TextRun({ text: `Ngày phát hành: ${new Date().toLocaleDateString('vi-VN')}`, font: 'Arial', size: 22, color: C.gray })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 },
            children: [new TextRun({ text: 'Đơn vị phát triển: CIC — Construction Information Center', font: 'Arial', size: 22, color: C.gray })] }),
        ]
      },
      // ══════ TOC ══════
      {
        properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
        headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Tài liệu giới thiệu phần mềm QLDA ĐTXD DDCN', font: 'Arial', size: 18, color: C.gray, italics: true })] })] }) },
        footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Trang ', font: 'Arial', size: 18, color: C.gray }), new TextRun({ children: [PageNumber.CURRENT], font: 'Arial', size: 18, color: C.gray })] })] }) },
        children: [
          h1('MỤC LỤC'),
          new TableOfContents('Mục lục', { hyperlink: true, headingStyleRange: '1-3' }),
          new Paragraph({ children: [new PageBreak()] }),

          // ══════ CHAPTER 1: GIỚI THIỆU TỔNG QUAN ══════
          h1('CHƯƠNG 1: GIỚI THIỆU TỔNG QUAN'),
          h2('1.1. Bối cảnh và Mục tiêu'),
          para('Hệ thống Quản lý Dự án Đầu tư Xây dựng (QLDA ĐTXD) được phát triển nhằm số hóa toàn bộ quy trình quản lý dự án đầu tư xây dựng công trình dân dụng và công nghiệp thuộc phạm vi quản lý của Ban Quản lý Dự án Đầu tư Xây dựng các công trình Dân dụng và Công nghiệp — UBND Thành phố Hồ Chí Minh.'),
          para('Phần mềm giúp các Ban QLDA (Ban 1 đến Ban 5) theo dõi, quản lý và báo cáo tiến độ, tài chính, hợp đồng, hồ sơ pháp lý của tất cả các dự án đầu tư công một cách minh bạch, chính xác và hiệu quả.'),

          h2('1.2. Phạm vi Áp dụng'),
          bullet('Ban Quản lý Dự án ĐTXD các công trình Dân dụng và Công nghiệp — UBND TP.HCM'),
          bullet('5 Ban QLDA trực thuộc (Ban 1 → Ban 5)'),
          bullet('Các nhà thầu, đơn vị tư vấn, giám sát tham gia dự án'),
          bullet('Lãnh đạo, cán bộ quản lý các cấp'),

          h2('1.3. Căn cứ Pháp lý'),
          bullet('Luật Đầu tư công số 58/2024/QH15 (thay thế Luật 39/2019)'),
          bullet('Luật Xây dựng số 62/2020/QH14 (sửa đổi, bổ sung)'),
          bullet('Luật Đấu thầu số 22/2023/QH15'),
          bullet('Nghị định 175/2024/NĐ-CP — Hướng dẫn Luật Xây dựng'),
          bullet('Nghị định 214/2025/NĐ-CP — Hướng dẫn Luật Đấu thầu'),
          bullet('Nghị định 111/2024/NĐ-CP — CSDL Quốc gia về Xây dựng'),
          bullet('Thông tư 24/2025/TT-BXD — Biểu mẫu quản lý dự án đầu tư xây dựng'),

          h2('1.4. Công nghệ Nền tảng'),
          makeTable(
            ['Thành phần', 'Công nghệ', 'Ghi chú'],
            [
              ['Frontend', 'React 18 + TypeScript + Vite', 'SPA hiện đại, code-splitting, lazy loading'],
              ['UI Framework', 'TailwindCSS + Lucide Icons', 'Responsive, Dark/Light mode'],
              ['Backend & Database', 'Supabase (PostgreSQL)', 'Row Level Security, Realtime subscriptions'],
              ['Authentication', 'Supabase Auth', 'Email/password, phân quyền RBAC'],
              ['BIM Viewer', 'Three.js + IFC.js', 'Render mô hình IFC 3D trong trình duyệt'],
              ['Biểu đồ', 'Recharts', 'Biểu đồ tương tác: Bar, Pie, Line'],
              ['Bản đồ', 'Leaflet / OpenStreetMap', 'Hiển thị vị trí dự án trên bản đồ'],
              ['AI/ML', 'Gemini API + LangChain', 'Tóm tắt AI, phát hiện bất thường, chấm điểm nhà thầu'],
              ['Hosting', 'Vercel', 'CI/CD tự động, HTTPS, CDN toàn cầu'],
            ],
            [2800, 3200, 3000]
          ),
          new Paragraph({ children: [new PageBreak()] }),

          // ══════ CHAPTER 2: MÔ TẢ CHI TIẾT TÍNH NĂNG ══════
          h1('CHƯƠNG 2: MÔ TẢ CHI TIẾT TÍNH NĂNG'),
          para('Hệ thống bao gồm 13 module chức năng chính, được tổ chức theo thanh điều hướng bên trái. Mỗi module phục vụ một nhóm nghiệp vụ cụ thể trong quy trình quản lý dự án đầu tư xây dựng.'),

          // Generate all module sections
          ...modules.flatMap(mod => [
            h2(mod.name),
            para(mod.desc, { italic: true }),
            makeTable(
              ['Tính năng', 'Mô tả chi tiết'],
              mod.features.map(f => [f[0], f[1]]),
              [2800, 6200]
            ),
            new Paragraph({ spacing: { after: 200 } }),
          ]),

          new Paragraph({ children: [new PageBreak()] }),

          // ══════ CHAPTER 3: KIẾN TRÚC HỆ THỐNG ══════
          h1('CHƯƠNG 3: KIẾN TRÚC HỆ THỐNG'),
          h2('3.1. Kiến trúc Tổng thể'),
          para('Hệ thống được xây dựng theo kiến trúc Single Page Application (SPA) hiện đại, gồm 3 tầng chính:'),
          bullet('Tầng giao diện (Frontend): ', 'Presentation Layer — '),
          para('React 18 với TypeScript, sử dụng React Router v6 cho điều hướng, TanStack Query cho quản lý state server-side, lazy loading cho tối ưu hiệu năng.'),
          bullet('Tầng dịch vụ (Backend-as-a-Service): ', 'Service Layer — '),
          para('Supabase cung cấp API RESTful tự động, authentication, realtime subscriptions, và storage.'),
          bullet('Tầng dữ liệu (Database): ', 'Data Layer — '),
          para('PostgreSQL với Row Level Security (RLS) bảo mật cấp dòng dữ liệu, triggers, và functions.'),

          h2('3.2. Bảo mật'),
          bullet('Authentication: Đăng nhập bằng email/password qua Supabase Auth'),
          bullet('Authorization: RBAC (Role-Based Access Control) — phân quyền theo vai trò × tài nguyên × hành động'),
          bullet('Row Level Security: Mỗi truy vấn DB tự động lọc theo quyền người dùng'),
          bullet('HTTPS: Toàn bộ kết nối được mã hóa TLS/SSL'),
          bullet('Audit Trail: Ghi nhận mọi thao tác quan trọng vào nhật ký hệ thống'),

          h2('3.3. Tổ chức Module'),
          makeTable(
            ['STT', 'Module', 'Đường dẫn', 'Quyền truy cập'],
            [
              ['1', 'Tổng quan', '/', 'dashboard'],
              ['2', 'Dashboard cá nhân', '/my-dashboard', 'Tất cả'],
              ['3', 'Dự án đầu tư', '/projects', 'projects'],
              ['4', 'Công việc', '/tasks', 'tasks'],
              ['5', 'Nhân sự', '/employees', 'employees'],
              ['6', 'Nhà thầu', '/contractors', 'contractors'],
              ['7', 'Hợp đồng', '/contracts', 'contracts'],
              ['8', 'Thanh toán', '/payments', 'payments'],
              ['9', 'Hồ sơ tài liệu', '/documents', 'documents'],
              ['10', 'CDE', '/cde', 'cde'],
              ['11', 'Văn bản pháp luật', '/legal-documents', 'legal_docs'],
              ['12', 'Báo cáo', '/reports', 'reports'],
              ['13', 'Quy chế làm việc', '/regulations', 'regulations'],
              ['14', 'Quản lý tài khoản', '/user-accounts', 'admin_accounts'],
              ['15', 'Phân quyền', '/permissions', 'admin_roles'],
            ],
            [600, 2600, 2800, 3000]
          ),

          new Paragraph({ children: [new PageBreak()] }),

          // ══════ CHAPTER 4: YÊU CẦU HỆ THỐNG ══════
          h1('CHƯƠNG 4: YÊU CẦU HỆ THỐNG'),
          h2('4.1. Yêu cầu Phía Client'),
          bullet('Trình duyệt: Google Chrome 90+, Microsoft Edge 90+, Firefox 88+, Safari 14+'),
          bullet('Màn hình: Tối thiểu 1366×768, khuyến nghị 1920×1080 trở lên'),
          bullet('Kết nối: Internet tốc độ tối thiểu 10 Mbps'),
          bullet('Hệ điều hành: Windows 10+, macOS 11+, Linux (Ubuntu 20+)'),

          h2('4.2. Yêu cầu Đặc biệt cho BIM'),
          bullet('GPU: Card đồ họa rời hoặc Intel UHD 620 trở lên'),
          bullet('RAM: Tối thiểu 8GB (khuyến nghị 16GB cho mô hình lớn)'),
          bullet('WebGL 2.0: Trình duyệt phải hỗ trợ WebGL 2.0'),

          new Paragraph({ children: [new PageBreak()] }),

          // ══════ CHAPTER 5: LIÊN HỆ ══════
          h1('CHƯƠNG 5: THÔNG TIN LIÊN HỆ'),
          para('Mọi thắc mắc về phần mềm, vui lòng liên hệ:'),
          new Paragraph({ spacing: { after: 200 } }),
          makeTable(
            ['Thông tin', 'Chi tiết'],
            [
              ['Đơn vị phát triển', 'CIC — Construction Information Center'],
              ['Địa chỉ', 'TP. Hồ Chí Minh, Việt Nam'],
              ['Website', 'https://www.cic.com.vn'],
              ['Email hỗ trợ', 'support@cic.com.vn'],
              ['Phiên bản phần mềm', '1.0'],
              ['Ngày phát hành', new Date().toLocaleDateString('vi-VN')],
            ],
            [3000, 6000]
          ),
          new Paragraph({ spacing: { before: 400 } }),
          para('━━━━━━━━━━━━━━━━━━━━━━━━━━', { center: true, color: C.gold }),
          para('© 2026 Ban QLDA ĐTXD DDCN — UBND TP. Hồ Chí Minh. Bản quyền thuộc về CIC.', { center: true, color: C.gray, italic: true }),
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.join(__dirname, '..', 'TaiLieu_GioiThieu_PhanMem_QLDA_DTXD.docx');
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Document generated: ${outputPath}`);
  console.log(`   File size: ${(buffer.length / 1024).toFixed(1)} KB`);
}

main().catch(console.error);
