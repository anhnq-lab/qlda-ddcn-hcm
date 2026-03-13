// generate-presentation.cjs — Bài thuyết trình phần mềm QLDA ĐTXD DDCN
// Cập nhật: 12/03/2026 — Luật XD 135/2025, NQ 57, CDE, Roadmap 1 quý
const pptxgen = require('pptxgenjs');
const path = require('path');

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';
pres.author = 'CIC Technology and Consultancy JSC';
pres.title = 'Giới thiệu Phần mềm QLDA ĐTXD DDCN — TP. Hồ Chí Minh';

// ── Color Palette — Midnight Gold ──
const C = {
  bg: '1A1A2E',       // Deep midnight
  bg2: '16213E',      // Slide variant
  bg3: '0F3460',      // Accent bg
  gold: 'D4A017',     // Primary gold
  goldLight: 'F0D68A',// Light gold
  goldDark: 'B8860B', // Dark gold
  white: 'FFFFFF',
  light: 'E8E8E8',
  muted: '8899AA',
  accent: '3B82F6',   // Blue accent
  green: '10B981',
  orange: 'F97316',
  red: 'EF4444',
  card: '1E2A4A',     // Card background
  cardBorder: '2A3A5E',
};

// ── Helpers ──
function addTitle(slide, text, opts = {}) {
  slide.addText(text, {
    x: opts.x || 0.6, y: opts.y || 0.3, w: opts.w || 8.8, h: 0.6,
    fontSize: opts.size || 28, fontFace: 'Arial', bold: true,
    color: opts.color || C.gold, align: 'left',
  });
}

function addSubtitle(slide, text, opts = {}) {
  slide.addText(text, {
    x: opts.x || 0.6, y: opts.y || 0.85, w: opts.w || 8.8, h: 0.4,
    fontSize: 14, fontFace: 'Arial', color: C.muted, align: 'left',
  });
}

function addDivider(slide, y) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: y || 1.25, w: 1.5, h: 0.04,
    fill: { color: C.gold },
  });
}

function addCard(slide, x, y, w, h, opts = {}) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: 0.12,
    fill: { color: opts.fill || C.card },
    line: { color: opts.border || C.cardBorder, width: 1 },
    shadow: { type: 'outer', color: '000000', blur: 8, offset: 2, angle: 135, opacity: 0.2 },
  });
}

function addIconCircle(slide, x, y, color, label) {
  slide.addShape(pres.shapes.OVAL, {
    x, y, w: 0.45, h: 0.45,
    fill: { color },
  });
  if (label) {
    slide.addText(label, {
      x, y, w: 0.45, h: 0.45,
      fontSize: 14, fontFace: 'Arial', bold: true, color: C.white,
      align: 'center', valign: 'middle',
    });
  }
}

// ══════════════════════════════════════════
// SLIDE 1: COVER
// ══════════════════════════════════════════
let s = pres.addSlide();
s.background = { color: C.bg };
s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.gold } });
s.addText('HỆ THỐNG QUẢN LÝ DỰ ÁN\nĐẦU TƯ XÂY DỰNG', {
  x: 0.6, y: 1.2, w: 8.8, h: 1.6,
  fontSize: 36, fontFace: 'Arial', bold: true, color: C.white,
  align: 'left', lineSpacingMultiple: 1.2,
});
s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 2.9, w: 2.0, h: 0.05, fill: { color: C.gold } });
s.addText('Ban QLDA ĐTXD các công trình Dân dụng và Công nghiệp\nUBND Thành phố Hồ Chí Minh', {
  x: 0.6, y: 3.1, w: 8.8, h: 0.8,
  fontSize: 16, fontFace: 'Arial', color: C.goldLight, lineSpacingMultiple: 1.3,
});
s.addText([
  { text: 'Phiên bản 1.0  •  12/03/2026', options: { fontSize: 12, color: C.muted } },
  { text: '  •  CIC Technology and Consultancy JSC', options: { fontSize: 12, color: C.muted } },
], { x: 0.6, y: 4.6, w: 8.8, h: 0.4, fontFace: 'Arial' });
s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.gold } });
s.addNotes('Kính thưa quý Ban lãnh đạo, các đồng chí.\nHôm nay, thay mặt đơn vị phát triển CIC — Công ty Cổ phần Công nghệ và Tư vấn CIC, tôi xin trân trọng giới thiệu Hệ thống Quản lý Dự án Đầu tư Xây dựng — giải pháp số hóa toàn diện được thiết kế riêng cho Ban Quản lý dự án Đầu tư xây dựng các công trình Dân dụng và Công nghiệp trực thuộc UBND Thành phố Hồ Chí Minh.\nXin phép được trình bày nội dung chi tiết để quý Ban xem xét.');

// ══════════════════════════════════════════
// SLIDE 2: MỤC LỤC
// ══════════════════════════════════════════
s = pres.addSlide();
s.background = { color: C.bg2 };
addTitle(s, 'NỘI DUNG THUYẾT TRÌNH');
addDivider(s);
const tocItems = [
  { num: '01', title: 'Bối cảnh & Mục tiêu', color: C.gold },
  { num: '02', title: 'Tổng quan Hệ thống', color: C.accent },
  { num: '03', title: 'Các Module Chức năng', color: C.green },
  { num: '04', title: 'Công nghệ & Kiến trúc', color: C.orange },
  { num: '05', title: 'Bảo mật & Phân quyền', color: C.gold },
  { num: '06', title: 'Lợi ích & Giá trị', color: C.accent },
  { num: '07', title: 'Lộ trình Triển khai', color: C.green },
];
tocItems.forEach((item, i) => {
  const y = 1.5 + i * 0.58;
  addCard(s, 0.6, y, 8.8, 0.48);
  addIconCircle(s, 0.8, y + 0.02, item.color, item.num);
  s.addText(item.title, {
    x: 1.5, y: y, w: 7.0, h: 0.48,
    fontSize: 15, fontFace: 'Arial', bold: true, color: C.white,
    valign: 'middle',
  });
});
s.addNotes('Bài thuyết trình được cấu trúc thành 7 phần chính. Trước tiên, tôi sẽ trình bày bối cảnh và căn cứ pháp lý — vì sao tại thời điểm này chúng ta cần triển khai hệ thống quản lý dự án số hóa. Tiếp theo là tổng quan hệ thống, chi tiết 13 module chức năng, nền tảng công nghệ, cơ chế bảo mật, và cuối cùng là lợi ích cùng lộ trình triển khai cụ thể.');

// ══════════════════════════════════════════
// SLIDE 3: CÁCH MẠNG CÔNG NGHIỆP 4.0
// ══════════════════════════════════════════
s = pres.addSlide();
s.background = { color: C.bg };
addTitle(s, 'CUỘC CÁCH MẠNG CÔNG NGHIỆP & CHUYỂN ĐỔI SỐ');
addSubtitle(s, 'Dữ liệu — tài sản cốt lõi trong kỷ nguyên 4.0');
addDivider(s);

// CMCN Timeline cards
const cmcn = [
  { ver: '1.0', era: 'Cuối TK 18', trait: 'Cơ giới hóa', meaning: 'Máy hơi nước thay sức lao động thủ công', color: C.muted },
  { ver: '2.0', era: 'Cuối TK 19', trait: 'Sản xuất hàng loạt', meaning: 'Điện khí hóa, công nghiệp hiện đại', color: C.muted },
  { ver: '3.0', era: 'Giữa TK 20', trait: 'Tự động hóa', meaning: 'Máy tính, Internet, kết nối toàn cầu', color: C.accent },
  { ver: '4.0', era: 'Hiện tại', trait: 'Số hóa toàn diện', meaning: 'AI, IoT, BIM — dữ liệu là tài sản', color: C.gold },
];

// Timeline bar
s.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 1.85, w: 8.4, h: 0.04, fill: { color: C.gold } });

cmcn.forEach((c, i) => {
  const x = 0.4 + i * 2.35;
  // Circle on timeline
  s.addShape(pres.shapes.OVAL, { x: x + 0.85, y: 1.7, w: 0.3, h: 0.3, fill: { color: c.color } });
  // Card below
  addCard(s, x, 2.2, 2.15, 1.8);
  s.addText(c.ver, {
    x: x, y: 2.3, w: 2.15, h: 0.35,
    fontSize: 18, fontFace: 'Arial', bold: true, color: c.color, align: 'center',
  });
  s.addText(c.era, {
    x: x, y: 2.6, w: 2.15, h: 0.2,
    fontSize: 9, fontFace: 'Arial', color: C.muted, align: 'center',
  });
  s.addText(c.trait, {
    x: x, y: 2.85, w: 2.15, h: 0.3,
    fontSize: 11, fontFace: 'Arial', bold: true, color: C.white, align: 'center',
  });
  s.addShape(pres.shapes.RECTANGLE, { x: x + 0.6, y: 3.2, w: 0.95, h: 0.02, fill: { color: c.color } });
  s.addText(c.meaning, {
    x: x + 0.1, y: 3.3, w: 1.95, h: 0.6,
    fontSize: 9, fontFace: 'Arial', color: C.muted, align: 'center', valign: 'top', lineSpacingMultiple: 1.3,
  });
});

// Bottom insight
addCard(s, 0.4, 4.3, 9.2, 0.8);
s.addText([
  { text: '💡  ', options: { fontSize: 16 } },
  { text: 'Tổ chức nào làm chủ dữ liệu sớm — tổ chức đó sẽ quản lý hiệu quả hơn, minh bạch hơn và tiết kiệm nguồn lực hơn.', options: { fontSize: 13, color: C.goldLight, italic: true } },
], { x: 0.7, y: 4.35, w: 8.7, h: 0.7, fontFace: 'Arial', valign: 'middle' });
s.addNotes('Kính thưa quý Ban, trước khi đi vào chi tiết phần mềm, xin phép trình bày bối cảnh chung.\nNhìn lại lịch sử phát triển, nhân loại đã trải qua 4 cuộc cách mạng công nghiệp. Cuộc Cách mạng 1.0 thay thế sức lao động thủ công bằng máy móc. Cách mạng 2.0 đưa sản xuất lên quy mô hàng loạt nhờ điện khí hóa. Cách mạng 3.0 mang đến tự động hóa qua máy tính và Internet.\nHiện nay chúng ta đang ở giữa Cách mạng Công nghiệp lần thứ 4, nơi dữ liệu trở thành tài sản cốt lõi. Đối với ngành xây dựng và quản lý dự án đầu tư công, tổ chức nào làm chủ được dữ liệu sớm sẽ quản lý hiệu quả hơn, minh bạch hơn và tiết kiệm nguồn lực hơn.');

// ══════════════════════════════════════════
// SLIDE 4: CĂN CỨ PHÁP LÝ
// ══════════════════════════════════════════
s = pres.addSlide();
s.background = { color: C.bg2 };
addTitle(s, 'CĂN CỨ PHÁP LÝ');
addSubtitle(s, 'Khung pháp lý cho quản lý dự án đầu tư xây dựng và chuyển đổi số');
addDivider(s);

// Left column — QLDA
addCard(s, 0.4, 1.5, 4.4, 3.6);
s.addText('📜  VỀ QUẢN LÝ DỰ ÁN ĐTXD', {
  x: 0.6, y: 1.6, w: 4.0, h: 0.4,
  fontSize: 13, fontFace: 'Arial', bold: true, color: C.gold,
});
s.addText([
  { text: 'Luật Đầu tư công 58/2024/QH15', options: { bullet: true, breakLine: true, fontSize: 11, color: C.light, bold: true, paraSpaceAfter: 3 } },
  { text: 'Quản lý, sử dụng vốn đầu tư công', options: { breakLine: true, fontSize: 10, color: C.muted, paraSpaceAfter: 6 } },
  { text: 'Luật Xây dựng 135/2025/QH15', options: { bullet: true, breakLine: true, fontSize: 11, color: C.light, bold: true, paraSpaceAfter: 3 } },
  { text: 'QLDA ĐTXD, chuyển đổi số và BIM', options: { breakLine: true, fontSize: 10, color: C.muted, paraSpaceAfter: 6 } },
  { text: 'Luật Đấu thầu 22/2023/QH15', options: { bullet: true, breakLine: true, fontSize: 11, color: C.light, bold: true, paraSpaceAfter: 3 } },
  { text: 'Lựa chọn nhà thầu, nhà đầu tư', options: { breakLine: true, fontSize: 10, color: C.muted, paraSpaceAfter: 6 } },
  { text: 'NĐ 175/2024 • NĐ 214/2025', options: { bullet: true, breakLine: true, fontSize: 11, color: C.light, bold: true, paraSpaceAfter: 3 } },
  { text: 'Hướng dẫn thi hành Luật XD, Luật Đấu thầu', options: { breakLine: true, fontSize: 10, color: C.muted } },
], { x: 0.6, y: 2.1, w: 4.0, h: 2.8, fontFace: 'Arial', valign: 'top' });

// Right column — CĐS
addCard(s, 5.2, 1.5, 4.4, 3.6);
s.addText('💻  VỀ CHUYỂN ĐỔI SỐ & CSDL', {
  x: 5.4, y: 1.6, w: 4.0, h: 0.4,
  fontSize: 13, fontFace: 'Arial', bold: true, color: C.accent,
});
s.addText([
  { text: 'Luật GDĐT 20/2023/QH15', options: { bullet: true, breakLine: true, fontSize: 11, color: C.light, bold: true, paraSpaceAfter: 3 } },
  { text: 'Công nhận giá trị pháp lý dữ liệu điện tử', options: { breakLine: true, fontSize: 10, color: C.muted, paraSpaceAfter: 6 } },
  { text: 'NĐ 111/2024/NĐ-CP', options: { bullet: true, breakLine: true, fontSize: 11, color: C.light, bold: true, paraSpaceAfter: 3 } },
  { text: 'CSDL quốc gia về hoạt động xây dựng', options: { breakLine: true, fontSize: 10, color: C.muted, paraSpaceAfter: 6 } },
  { text: 'Nghị quyết 57-NQ/TW (22/12/2024)', options: { bullet: true, breakLine: true, fontSize: 11, color: C.light, bold: true, paraSpaceAfter: 3 } },
  { text: 'Đột phá KHCN, đổi mới sáng tạo & CĐS quốc gia', options: { breakLine: true, fontSize: 10, color: C.muted, paraSpaceAfter: 6 } },
  { text: 'TT 24/2025/TT-BXD', options: { bullet: true, breakLine: true, fontSize: 11, color: C.light, bold: true, paraSpaceAfter: 3 } },
  { text: 'HD khoản 4 Điều 8 NĐ 111: CSDL quốc gia XD', options: { breakLine: true, fontSize: 10, color: C.muted, paraSpaceAfter: 6 } },
  { text: 'QĐ 749 • QĐ 2289 • NQ 52', options: { bullet: true, breakLine: true, fontSize: 11, color: C.light, bold: true, paraSpaceAfter: 3 } },
  { text: 'CĐS quốc gia, chiến lược CMCN 4.0', options: { breakLine: true, fontSize: 10, color: C.muted } },
], { x: 5.4, y: 2.1, w: 4.0, h: 2.8, fontFace: 'Arial', valign: 'top' });
s.addNotes('Trong bối cảnh Cách mạng 4.0, Đảng và Nhà nước đã ban hành hàng loạt chính sách, pháp luật tạo nền tảng pháp lý cho chuyển đổi số.\nVề quản lý dự án: Luật Đầu tư công 58/2024 thay thế Luật 39; Luật Xây dựng 135/2025 lần đầu quy định về chuyển đổi số và BIM; Luật Đấu thầu 22/2023 cùng các nghị định hướng dẫn.\nVề chuyển đổi số: đặc biệt quan trọng là Nghị định 111/2024 về CSDL quốc gia xây dựng, Thông tư 24/2025 hướng dẫn chi tiết khoản 4 Điều 8 NĐ 111 về thông tin trong hệ thống CSDL quốc gia, và Nghị quyết 57 của Bộ Chính trị về đột phá chuyển đổi số quốc gia.');

// ══════════════════════════════════════════
// SLIDE 5: THÁCH THỨC & GIẢI PHÁP
// ══════════════════════════════════════════
s = pres.addSlide();
s.background = { color: C.bg };
addTitle(s, 'THÁCH THỨC & GIẢI PHÁP');
addSubtitle(s, '5 vấn đề cốt lõi và 5 trụ cột giải pháp');
addDivider(s);

// Left — Thách thức
addCard(s, 0.4, 1.5, 4.4, 3.6);
s.addText('⚠  THÁCH THỨC HIỆN TẠI', {
  x: 0.6, y: 1.6, w: 4.0, h: 0.4,
  fontSize: 14, fontFace: 'Arial', bold: true, color: C.orange,
});
s.addText([
  { text: 'Quản lý phân tán', options: { bullet: true, breakLine: true, fontSize: 12, color: C.light, paraSpaceAfter: 4 } },
  { text: 'Excel, email, giấy tờ', options: { breakLine: true, fontSize: 10, color: C.muted, paraSpaceAfter: 7 } },
  { text: 'Thiếu minh bạch tiến độ', options: { bullet: true, breakLine: true, fontSize: 12, color: C.light, paraSpaceAfter: 4 } },
  { text: 'không theo dõi được realtime', options: { breakLine: true, fontSize: 10, color: C.muted, paraSpaceAfter: 7 } },
  { text: 'Báo cáo thủ công', options: { bullet: true, breakLine: true, fontSize: 12, color: C.light, paraSpaceAfter: 4 } },
  { text: 'tốn thời gian, dễ sai sót', options: { breakLine: true, fontSize: 10, color: C.muted, paraSpaceAfter: 7 } },
  { text: 'Rủi ro pháp lý', options: { bullet: true, breakLine: true, fontSize: 12, color: C.light, paraSpaceAfter: 4 } },
  { text: 'Luật ĐTC 2024, Luật XD 135/2025, Luật ĐT 2023', options: { breakLine: true, fontSize: 10, color: C.muted, paraSpaceAfter: 7 } },
  { text: 'Chưa đáp ứng CĐS', options: { bullet: true, breakLine: true, fontSize: 12, color: C.light, paraSpaceAfter: 4 } },
  { text: 'chưa kết nối CSDL QG, chưa BIM/AI/CDE', options: { breakLine: true, fontSize: 10, color: C.muted } },
], { x: 0.6, y: 2.05, w: 4.0, h: 2.9, fontFace: 'Arial', valign: 'top' });

// Right — Giải pháp
addCard(s, 5.2, 1.5, 4.4, 3.6);
s.addText('✓  GIẢI PHÁP', {
  x: 5.4, y: 1.6, w: 4.0, h: 0.4,
  fontSize: 14, fontFace: 'Arial', bold: true, color: C.green,
});
s.addText([
  { text: 'Nền tảng tập trung', options: { bullet: true, breakLine: true, fontSize: 12, color: C.light, paraSpaceAfter: 4 } },
  { text: 'tất cả dữ liệu trên một hệ thống', options: { breakLine: true, fontSize: 10, color: C.muted, paraSpaceAfter: 7 } },
  { text: 'Dashboard thời gian thực', options: { bullet: true, breakLine: true, fontSize: 12, color: C.light, paraSpaceAfter: 4 } },
  { text: 'KPI, biểu đồ, bản đồ cập nhật tức thì', options: { breakLine: true, fontSize: 10, color: C.muted, paraSpaceAfter: 7 } },
  { text: 'Tự động hóa báo cáo', options: { bullet: true, breakLine: true, fontSize: 12, color: C.light, paraSpaceAfter: 4 } },
  { text: 'biểu mẫu theo TT24/2025, Luật ĐTC', options: { breakLine: true, fontSize: 10, color: C.muted, paraSpaceAfter: 7 } },
  { text: 'Tuân thủ pháp luật', options: { bullet: true, breakLine: true, fontSize: 12, color: C.light, paraSpaceAfter: 4 } },
  { text: 'checklist tích hợp, cảnh báo tự động', options: { breakLine: true, fontSize: 10, color: C.muted, paraSpaceAfter: 7 } },
  { text: 'Sẵn sàng cho 4.0', options: { bullet: true, breakLine: true, fontSize: 12, color: C.light, paraSpaceAfter: 4 } },
  { text: 'BIM, AI, CDE, CSDL quốc gia (NĐ 111)', options: { breakLine: true, fontSize: 10, color: C.muted } },
], { x: 5.4, y: 2.05, w: 4.0, h: 2.9, fontFace: 'Arial', valign: 'top' });
s.addNotes('Pháp luật đã có, định hướng đã rõ ràng. Vậy thực trạng quản lý dự án hiện nay đang gặp những thách thức gì?\nXin thẳng thắn nhìn nhận 5 vấn đề cốt lõi: Thứ nhất, dữ liệu quản lý phân tán trên Excel, email, giấy tờ. Thứ hai, lãnh đạo thiếu công cụ theo dõi tiến độ theo thời gian thực. Thứ ba, việc tổng hợp báo cáo thủ công tốn thời gian và dễ sai sót. Thứ tư, nhiều văn bản pháp luật mới ban hành, khó đảm bảo tuân thủ đầy đủ. Thứ năm, chưa đáp ứng yêu cầu chuyển đổi số — chưa kết nối CSDL quốc gia, chưa ứng dụng BIM, AI, chưa có Môi trường dữ liệu chung CDE theo ISO 19650.\nĐứng trước các thách thức đó, hệ thống QLDA ĐTXD được xây dựng với 5 trụ cột giải pháp toàn diện như quý Ban thấy bên phải.');

// ══════════════════════════════════════════
// SLIDE 6: TỔNG QUAN HỆ THỐNG — KPI Cards
// ══════════════════════════════════════════
s = pres.addSlide();
s.background = { color: C.bg2 };
addTitle(s, 'TỔNG QUAN HỆ THỐNG');
addSubtitle(s, 'Nền tảng web hiện đại — truy cập mọi lúc, không cần cài đặt');
addDivider(s);

const kpis = [
  { label: 'Module\nchức năng', value: '13+', color: C.gold },
  { label: 'Ban QLDA\ntrực thuộc', value: '5', color: C.accent },
  { label: 'BIM 3D\nViewer', value: 'IFC', color: C.green },
  { label: 'AI\ntích hợp', value: 'Gemini', color: C.orange },
  { label: 'Bảo mật\nRBAC', value: 'RLS', color: C.gold },
];
kpis.forEach((kpi, i) => {
  const x = 0.4 + i * 1.92;
  addCard(s, x, 1.5, 1.72, 1.6);
  s.addText(kpi.value, {
    x, y: 1.6, w: 1.72, h: 0.7,
    fontSize: 28, fontFace: 'Arial', bold: true, color: kpi.color, align: 'center', valign: 'middle',
  });
  s.addText(kpi.label, {
    x, y: 2.3, w: 1.72, h: 0.65,
    fontSize: 10, fontFace: 'Arial', color: C.muted, align: 'center', valign: 'top', lineSpacingMultiple: 1.2,
  });
});

// Feature highlights
const features = [
  { icon: '📊', text: 'Dashboard realtime với 5 KPI chính, biểu đồ giải ngân, bản đồ dự án' },
  { icon: '🏗️', text: 'Quản lý toàn bộ vòng đời dự án: Chuẩn bị → Thực hiện → Kết thúc XD' },
  { icon: '🤖', text: 'AI tóm tắt tình hình, phát hiện bất thường, chấm điểm nhà thầu tự động' },
  { icon: '🏢', text: 'BIM 3D Viewer — xem mô hình công trình trong trình duyệt, không cần phần mềm' },
  { icon: '📋', text: 'CDE — Môi trường dữ liệu chung theo ISO 19650, workflow duyệt tài liệu' },
];
features.forEach((f, i) => {
  const y = 3.35 + i * 0.44;
  s.addText(`${f.icon}  ${f.text}`, {
    x: 0.6, y, w: 8.8, h: 0.4,
    fontSize: 11.5, fontFace: 'Arial', color: C.light, valign: 'middle',
  });
});
s.addNotes('Xin trình bày tổng quan về hệ thống. Đây là nền tảng web, cán bộ chỉ cần mở trình duyệt là sử dụng được, không cần cài đặt phần mềm.\nHệ thống gồm hơn 13 module chức năng, phục vụ toàn bộ 5 Ban QLDA trực thuộc. Tích hợp BIM 3D Viewer để xem mô hình công trình dạng IFC trực tiếp trên trình duyệt. AI Gemini hỗ trợ tóm tắt tình hình và phát hiện bất thường. Bảo mật theo cơ chế RBAC kết hợp Row Level Security, đảm bảo mỗi người chỉ truy cập được dữ liệu thuộc phạm vi quản lý của mình.');

// ══════════════════════════════════════════
// SLIDE 7: CÁC MODULE — Grid Layout (1/2)
// ══════════════════════════════════════════
s = pres.addSlide();
s.background = { color: C.bg };
addTitle(s, 'CÁC MODULE CHỨC NĂNG (1/2)');
addSubtitle(s, '13 module phục vụ toàn bộ quy trình quản lý dự án đầu tư xây dựng');
addDivider(s);

const mods1 = [
  { icon: '📊', name: 'Tổng quan', desc: 'Dashboard KPI, biểu đồ giải ngân, bản đồ vị trí, cảnh báo rủi ro, AI Summary', color: C.gold },
  { icon: '🏢', name: 'Dự án đầu tư', desc: '8 tab: Thông tin, Vốn, Tuân thủ PL, Tài liệu, BIM, Vận hành, Gói thầu, Kế hoạch', color: C.accent },
  { icon: '🏗️', name: 'BIM 3D Viewer', desc: 'Render IFC, ViewCube, Walkthrough, Section, Measurement, Facility Mgmt', color: C.green },
  { icon: '📁', name: 'CDE', desc: 'ISO 19650, WIP/SHARED/PUBLISHED, Workflow duyệt, Transmittal, Permission', color: C.orange },
  { icon: '📝', name: 'Hợp đồng', desc: 'Quản lý vòng đời HĐ, phụ lục, liên kết thanh toán, trạng thái', color: C.gold },
  { icon: '💰', name: 'Thanh toán', desc: 'Tạm ứng, khối lượng, quyết toán — theo dõi trạng thái chuyển khoản', color: C.accent },
];
mods1.forEach((m, i) => {
  const col = i % 3;
  const row = Math.floor(i / 3);
  const x = 0.4 + col * 3.1;
  const y = 1.5 + row * 1.9;
  addCard(s, x, y, 2.9, 1.7);
  s.addText(m.icon, { x: x + 0.1, y: y + 0.1, w: 0.5, h: 0.4, fontSize: 20 });
  s.addText(m.name, {
    x: x + 0.55, y: y + 0.1, w: 2.2, h: 0.35,
    fontSize: 13, fontFace: 'Arial', bold: true, color: m.color, valign: 'middle',
  });
  s.addText(m.desc, {
    x: x + 0.15, y: y + 0.55, w: 2.6, h: 1.0,
    fontSize: 10, fontFace: 'Arial', color: C.muted, valign: 'top', lineSpacingMultiple: 1.3,
  });
});
s.addNotes('Xin phép trình bày chi tiết các module chức năng — phần này là nội dung trọng tâm của bài thuyết trình.\nNhóm đầu tiên gồm 6 module: Dashboard tổng quan với KPI thời gian thực và AI tóm tắt; Module Quản lý Dự án với 8 tab chi tiết theo Luật ĐTC; BIM 3D Viewer xem mô hình IFC trực tiếp; CDE — Môi trường dữ liệu chung theo chuẩn ISO 19650 với workflow duyệt tài liệu; Quản lý Hợp đồng theo dõi toàn bộ vòng đời; và Quản lý Thanh toán giải ngân.');

// ══════════════════════════════════════════
// SLIDE 8: CÁC MODULE — Grid Layout (2/2)
// ══════════════════════════════════════════
s = pres.addSlide();
s.background = { color: C.bg2 };
addTitle(s, 'CÁC MODULE CHỨC NĂNG (2/2)');
addDivider(s);

const mods2 = [
  { icon: '✅', name: 'Công việc', desc: 'Kanban Board, 17+ Template quy trình, subtask, phụ thuộc, lọc đa tiêu chí', color: C.green },
  { icon: '👥', name: 'Nhân sự', desc: 'Quản lý cán bộ Ban QLDA (Ban 1–5), hồ sơ, chức vụ, sơ đồ tổ chức', color: C.orange },
  { icon: '🏭', name: 'Nhà thầu', desc: 'Hồ sơ năng lực, AI Scoring, đánh giá hiệu suất, danh sách HĐ', color: C.gold },
  { icon: '📂', name: 'Hồ sơ tài liệu', desc: 'Upload/download, phân loại theo giai đoạn, preview trực tiếp', color: C.accent },
  { icon: '⚖️', name: 'Văn bản pháp luật', desc: 'Tra cứu Luật ĐTC, Luật XD 135, NĐ, TT — liên kết trực tiếp dự án', color: C.green },
  { icon: '📈', name: 'Báo cáo & Quản trị', desc: 'Xuất Excel/PDF, RBAC, Audit Log, Impersonation, Dark/Light mode', color: C.orange },
];
mods2.forEach((m, i) => {
  const col = i % 3;
  const row = Math.floor(i / 3);
  const x = 0.4 + col * 3.1;
  const y = 1.4 + row * 1.9;
  addCard(s, x, y, 2.9, 1.7);
  s.addText(m.icon, { x: x + 0.1, y: y + 0.1, w: 0.5, h: 0.4, fontSize: 20 });
  s.addText(m.name, {
    x: x + 0.55, y: y + 0.1, w: 2.2, h: 0.35,
    fontSize: 13, fontFace: 'Arial', bold: true, color: m.color, valign: 'middle',
  });
  s.addText(m.desc, {
    x: x + 0.15, y: y + 0.55, w: 2.6, h: 1.0,
    fontSize: 10, fontFace: 'Arial', color: C.muted, valign: 'top', lineSpacingMultiple: 1.3,
  });
});
s.addNotes('Tiếp theo là 6 module còn lại: Quản lý Công việc theo phương pháp Kanban với 17 mẫu quy trình ĐTXD; Quản lý Nhân sự cán bộ 5 Ban QLDA; Quản lý Nhà thầu tích hợp AI chấm điểm tự động; Hồ sơ Tài liệu dự án; Tra cứu Văn bản pháp luật liên kết trực tiếp vào dự án; và Báo cáo kết hợp Quản trị hệ thống với audit log đầy đủ.');

// ══════════════════════════════════════════
// SLIDE 9: BIM 3D VIEWER — Highlight
// ══════════════════════════════════════════
s = pres.addSlide();
s.background = { color: C.bg };
addTitle(s, 'ĐIỂM NỔI BẬT: BIM 3D VIEWER');
addSubtitle(s, 'Xem mô hình BIM trực tiếp trong trình duyệt — không cần cài phần mềm');
addDivider(s);

const bimFeatures = [
  { title: 'Upload & Render IFC', desc: 'Tải lên file IFC, tự động render 3D', color: C.gold },
  { title: 'ViewCube & Walkthrough', desc: 'Điều hướng trực quan, chế độ đi bộ', color: C.accent },
  { title: 'Model Tree', desc: 'Cây phân cấp cấu kiện, bật/tắt nhóm', color: C.green },
  { title: 'Properties Panel', desc: 'Xem thuộc tính chi tiết cấu kiện', color: C.orange },
  { title: 'Section Plane', desc: 'Cắt mặt cắt ngang/dọc mô hình', color: C.gold },
  { title: 'Measurement Tools', desc: 'Đo khoảng cách, diện tích, góc', color: C.accent },
  { title: 'Facility Management', desc: 'Quản lý tài sản theo vị trí BIM', color: C.green },
  { title: 'Keyboard Shortcuts', desc: 'Phím tắt tối ưu hiệu suất', color: C.orange },
];
bimFeatures.forEach((f, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const x = 0.4 + col * 4.7;
  const y = 1.5 + row * 0.95;
  addCard(s, x, y, 4.5, 0.8);
  s.addShape(pres.shapes.OVAL, {
    x: x + 0.15, y: y + 0.2, w: 0.35, h: 0.35,
    fill: { color: f.color },
  });
  s.addText(f.title, {
    x: x + 0.6, y: y + 0.05, w: 3.7, h: 0.35,
    fontSize: 12, fontFace: 'Arial', bold: true, color: C.white, valign: 'middle',
  });
  s.addText(f.desc, {
    x: x + 0.6, y: y + 0.4, w: 3.7, h: 0.3,
    fontSize: 10, fontFace: 'Arial', color: C.muted, valign: 'top',
  });
});
s.addNotes('Đây là một trong những tính năng đột phá của hệ thống. Lần đầu tiên, cán bộ Ban QLDA có thể xem trực tiếp mô hình 3D công trình ngay trên trình duyệt web, không cần cài bất kỳ phần mềm chuyên dụng nào.\nHệ thống hỗ trợ upload file IFC, tự động render 3D với các công cụ: ViewCube điều hướng, chế độ Walkthrough đi bộ trong mô hình, cây Model Tree phân cấp theo tầng, bảng thuộc tính Properties kỹ thuật, Section Plane cắt mặt cắt, công cụ đo lường, và quản lý tài sản Facility Management theo vị trí trong mô hình BIM.');

// ══════════════════════════════════════════
// SLIDE 10: CÔNG NGHỆ & KIẾN TRÚC
// ══════════════════════════════════════════
s = pres.addSlide();
s.background = { color: C.bg2 };
addTitle(s, 'CÔNG NGHỆ & KIẾN TRÚC');
addSubtitle(s, 'Nền tảng web hiện đại — Không cần cài đặt, truy cập mọi lúc mọi nơi');
addDivider(s);

const layers = [
  { label: 'FRONTEND', tech: 'React 18 + TypeScript + Vite', desc: 'SPA, Code-splitting, Lazy loading', color: C.accent, y: 1.5 },
  { label: 'UI / UX', tech: 'TailwindCSS + Recharts + Leaflet', desc: 'Responsive, Dark/Light mode, Charts, Maps', color: C.gold, y: 2.5 },
  { label: 'BACKEND', tech: 'Supabase (PostgreSQL + Auth)', desc: 'RESTful API, Realtime, Storage, RLS', color: C.green, y: 3.5 },
  { label: 'AI / BIM', tech: 'Gemini API + Three.js + IFC.js', desc: 'AI Summary, Risk Detection, 3D BIM Viewer', color: C.orange, y: 4.5 },
];
layers.forEach(l => {
  addCard(s, 0.4, l.y, 9.2, 0.85);
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.4, y: l.y, w: 0.08, h: 0.85, fill: { color: l.color },
  });
  s.addText(l.label, {
    x: 0.7, y: l.y, w: 1.6, h: 0.85,
    fontSize: 11, fontFace: 'Arial', bold: true, color: l.color, valign: 'middle',
  });
  s.addText(l.tech, {
    x: 2.4, y: l.y + 0.05, w: 4.5, h: 0.4,
    fontSize: 14, fontFace: 'Arial', bold: true, color: C.white, valign: 'middle',
  });
  s.addText(l.desc, {
    x: 2.4, y: l.y + 0.45, w: 4.5, h: 0.3,
    fontSize: 10, fontFace: 'Arial', color: C.muted, valign: 'top',
  });
});
s.addNotes('Quý Ban có thể quan tâm: hệ thống được xây dựng trên nền tảng công nghệ nào?\nKiến trúc gồm 4 tầng: Frontend sử dụng React 18 với TypeScript, đảm bảo hiệu suất và bảo trì dài hạn. Giao diện UI/UX responsive, hỗ trợ Dark/Light mode, biểu đồ Recharts và bản đồ Leaflet. Backend dựa trên Supabase — nền tảng PostgreSQL với xác thực, lưu trữ file và cơ chế bảo mật Row Level Security. Tầng AI và BIM tích hợp Gemini API cho phân tích thông minh, Three.js và IFC.js cho mô hình 3D.\nĐặc biệt, hệ thống là Single Page Application — tải một lần, điều hướng tức thì, dữ liệu cập nhật realtime.');

// ══════════════════════════════════════════
// SLIDE 11: BẢO MẬT & PHÂN QUYỀN
// ══════════════════════════════════════════
s = pres.addSlide();
s.background = { color: C.bg };
addTitle(s, 'BẢO MẬT & PHÂN QUYỀN');
addSubtitle(s, '6 lớp bảo mật — chỉ người có quyền mới truy cập được dữ liệu tương ứng');
addDivider(s);

const secItems = [
  { icon: '🔐', title: 'Authentication', desc: 'Đăng nhập email/password qua Supabase Auth, phiên đăng nhập an toàn', color: C.gold },
  { icon: '🛡️', title: 'RBAC', desc: 'Phân quyền theo Vai trò × Tài nguyên × Hành động (xem/sửa/xóa/duyệt)', color: C.accent },
  { icon: '🔒', title: 'Row Level Security', desc: 'PostgreSQL RLS — mỗi truy vấn tự động lọc theo quyền người dùng', color: C.green },
  { icon: '📝', title: 'Audit Trail', desc: 'Ghi nhận mọi thao tác: ai làm gì, lúc nào — không thể chối bỏ', color: C.orange },
  { icon: '🌐', title: 'HTTPS/TLS', desc: 'Toàn bộ kết nối được mã hóa, chứng chỉ SSL tự động', color: C.gold },
  { icon: '👤', title: 'Impersonation', desc: 'Admin xem hệ thống dưới góc nhìn người dùng khác để hỗ trợ', color: C.accent },
];
secItems.forEach((item, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const x = 0.4 + col * 4.7;
  const y = 1.5 + row * 1.2;
  addCard(s, x, y, 4.5, 1.05);
  s.addText(item.icon, { x: x + 0.1, y: y + 0.1, w: 0.5, h: 0.4, fontSize: 18 });
  s.addText(item.title, {
    x: x + 0.6, y: y + 0.05, w: 3.7, h: 0.35,
    fontSize: 13, fontFace: 'Arial', bold: true, color: item.color, valign: 'middle',
  });
  s.addText(item.desc, {
    x: x + 0.6, y: y + 0.42, w: 3.7, h: 0.5,
    fontSize: 10, fontFace: 'Arial', color: C.muted, valign: 'top', lineSpacingMultiple: 1.2,
  });
});
s.addNotes('Với dữ liệu dự án đầu tư công, bảo mật là yếu tố hết sức quan trọng. Hệ thống được thiết kế với 6 lớp bảo mật.\nThứ nhất, xác thực người dùng qua Supabase Auth với phiên đăng nhập an toàn. Thứ hai, phân quyền RBAC theo ma trận Vai trò × Tài nguyên × Hành động. Thứ ba, Row Level Security ở tầng cơ sở dữ liệu — mỗi truy vấn tự động lọc theo quyền người dùng. Thứ tư, Audit Trail ghi nhận toàn bộ thao tác — ai làm gì, lúc nào. Thứ năm, toàn bộ kết nối HTTPS được mã hóa. Thứ sáu, chức năng Impersonation cho phép quản trị viên hỗ trợ người dùng bằng cách xem hệ thống dưới góc nhìn của họ.');

// ══════════════════════════════════════════
// SLIDE 12: LỢI ÍCH & GIÁ TRỊ
// ══════════════════════════════════════════
s = pres.addSlide();
s.background = { color: C.bg2 };
addTitle(s, 'LỢI ÍCH & GIÁ TRỊ');
addSubtitle(s, 'Giá trị mang lại cho Ban QLDA ĐTXD DDCN');
addDivider(s);

const benefits = [
  { stat: '80%', label: 'Giảm thời gian\nlập báo cáo', desc: 'Tự động hóa biểu mẫu TT24, Luật ĐTC', color: C.gold },
  { stat: '100%', label: 'Minh bạch\ntiến độ', desc: 'Realtime dashboard, bản đồ, cảnh báo', color: C.green },
  { stat: '5×', label: 'Tốc độ\ntra cứu', desc: 'Tập trung dữ liệu, tìm kiếm thông minh', color: C.accent },
  { stat: '0', label: 'Cài đặt\nphần mềm', desc: 'Web-based, truy cập mọi thiết bị', color: C.orange },
];
benefits.forEach((b, i) => {
  const x = 0.3 + i * 2.4;
  addCard(s, x, 1.5, 2.2, 2.8);
  s.addText(b.stat, {
    x, y: 1.7, w: 2.2, h: 0.7,
    fontSize: 36, fontFace: 'Arial', bold: true, color: b.color, align: 'center', valign: 'middle',
  });
  s.addText(b.label, {
    x, y: 2.45, w: 2.2, h: 0.6,
    fontSize: 12, fontFace: 'Arial', bold: true, color: C.white, align: 'center', valign: 'middle', lineSpacingMultiple: 1.2,
  });
  s.addShape(pres.shapes.RECTANGLE, { x: x + 0.6, y: 3.1, w: 1.0, h: 0.03, fill: { color: b.color } });
  s.addText(b.desc, {
    x: x + 0.1, y: 3.2, w: 2.0, h: 0.8,
    fontSize: 10, fontFace: 'Arial', color: C.muted, align: 'center', valign: 'top', lineSpacingMultiple: 1.3,
  });
});

// Bottom row
const addBenefits = [
  '✓  Tuân thủ pháp luật: checklist TT24/2025, Luật ĐTC 58/2024, Luật XD 135/2025',
  '✓  BIM tích hợp: xem mô hình 3D trực tiếp, không cần phần mềm chuyên dụng',
  '✓  AI thông minh: tóm tắt tự động, phát hiện bất thường, tối ưu nguồn lực',
  '✓  CDE theo ISO 19650: môi trường dữ liệu chung, workflow duyệt tài liệu chuyên nghiệp',
];
addBenefits.forEach((b, i) => {
  s.addText(b, {
    x: 0.6, y: 4.45 + i * 0.3, w: 8.8, h: 0.28,
    fontSize: 10.5, fontFace: 'Arial', color: C.light,
  });
});
s.addNotes('Kính thưa quý Ban, khi triển khai hệ thống này, Ban QLDA sẽ đạt được những kết quả cụ thể sau: Giảm 80 phần trăm thời gian lập báo cáo nhờ tự động hóa biểu mẫu. Đạt 100 phần trăm minh bạch tiến độ với dashboard thời gian thực. Tốc độ tra cứu tăng gấp 5 lần nhờ tập trung dữ liệu. Và không cần cài đặt phần mềm — truy cập qua trình duyệt trên mọi thiết bị.\nNgoài ra, hệ thống còn mang lại giá trị về tuân thủ pháp luật, tích hợp BIM 3D, AI thông minh, và CDE theo chuẩn quốc tế ISO 19650.');

// ══════════════════════════════════════════
// SLIDE 13: LỘ TRÌNH TRIỂN KHAI — 1 QUÝ
// ══════════════════════════════════════════
s = pres.addSlide();
s.background = { color: C.bg };
addTitle(s, 'LỘ TRÌNH TRIỂN KHAI — Q2/2026');
addSubtitle(s, 'Gói gọn trong 1 quý (12 tuần) — 4 giai đoạn liên tiếp');
addDivider(s);

const phases = [
  { phase: 'Tuần 1–2', title: 'Thiết lập &\nNhập dữ liệu', items: 'Hạ tầng, RBAC,\nnhập dữ liệu hiện có,\nDashboard & Quản trị', color: C.gold },
  { phase: 'Tuần 3–6', title: 'Module\nnghiệp vụ', items: 'Dự án (8 tab), HĐ,\nThanh toán, Kanban,\nCDE, BIM, VB pháp luật', color: C.accent },
  { phase: 'Tuần 7–10', title: 'Nâng cao &\nTích hợp', items: 'AI Analytics, Báo cáo\nTT24, CSDL Quốc gia\n(NĐ 111), Responsive', color: C.green },
  { phase: 'Tuần 11–12', title: 'Đào tạo &\nGo-live', items: 'Đào tạo 5 Ban QLDA,\nchạy song song,\nnghiệm thu & vận hành', color: C.orange },
];

// Timeline line
s.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 2.1, w: 8.4, h: 0.04, fill: { color: C.gold } });

phases.forEach((p, i) => {
  const x = 0.3 + i * 2.4;
  // Circle on timeline
  s.addShape(pres.shapes.OVAL, { x: x + 0.87, y: 1.92, w: 0.3, h: 0.3, fill: { color: p.color } });
  s.addText((i + 1).toString(), { x: x + 0.87, y: 1.92, w: 0.3, h: 0.3, fontSize: 11, fontFace: 'Arial', bold: true, color: C.white, align: 'center', valign: 'middle' });

  addCard(s, x, 2.5, 2.2, 2.9);
  s.addText(p.phase, {
    x, y: 2.6, w: 2.2, h: 0.3,
    fontSize: 10, fontFace: 'Arial', bold: true, color: p.color, align: 'center',
  });
  s.addShape(pres.shapes.RECTANGLE, { x: x + 0.6, y: 2.95, w: 1.0, h: 0.02, fill: { color: p.color } });
  s.addText(p.title, {
    x, y: 3.0, w: 2.2, h: 0.5,
    fontSize: 12, fontFace: 'Arial', bold: true, color: C.white, align: 'center', valign: 'middle', lineSpacingMultiple: 1.2,
  });
  s.addText(p.items, {
    x: x + 0.1, y: 3.6, w: 2.0, h: 1.5,
    fontSize: 9.5, fontFace: 'Arial', color: C.muted, align: 'center', valign: 'top', lineSpacingMultiple: 1.4,
  });
});
s.addNotes('Về lộ trình triển khai, toàn bộ việc triển khai được gói gọn trong 1 quý — Quý 2 năm 2026, tương đương 12 tuần làm việc.\nTuần 1 đến 2: thiết lập hạ tầng, cấu hình phân quyền và nhập dữ liệu hiện có vào hệ thống. Tuần 3 đến 6: triển khai toàn bộ module nghiệp vụ bao gồm quản lý dự án, hợp đồng, thanh toán, CDE, BIM. Tuần 7 đến 10: tích hợp AI Analytics, báo cáo theo mẫu, kết nối CSDL quốc gia theo Nghị định 111. Tuần 11 đến 12: đào tạo người dùng toàn bộ 5 Ban QLDA, chạy song song để kiểm tra, nghiệm thu và chính thức đưa vào vận hành.');

// ══════════════════════════════════════════
// SLIDE 14: KẾT LUẬN & CẢM ƠN
// ══════════════════════════════════════════
s = pres.addSlide();
s.background = { color: C.bg2 };
s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.gold } });

s.addText('CẢM ƠN QUÝ BAN\nĐÃ LẮNG NGHE', {
  x: 0.6, y: 1.0, w: 8.8, h: 1.4,
  fontSize: 36, fontFace: 'Arial', bold: true, color: C.white,
  align: 'center', lineSpacingMultiple: 1.3,
});
s.addShape(pres.shapes.RECTANGLE, { x: 4.0, y: 2.5, w: 2.0, h: 0.05, fill: { color: C.gold } });

s.addText('Hệ thống QLDA ĐTXD — Giải pháp số hóa toàn diện\ncho quản lý dự án đầu tư xây dựng', {
  x: 1.0, y: 2.8, w: 8.0, h: 0.8,
  fontSize: 14, fontFace: 'Arial', color: C.goldLight, align: 'center', lineSpacingMultiple: 1.4,
});

addCard(s, 2.5, 3.8, 5.0, 1.2);
s.addText([
  { text: 'CIC Technology and Consultancy JSC\n', options: { fontSize: 14, bold: true, color: C.gold, breakLine: true } },
  { text: 'Website: www.cic.com.vn  •  Email: anhnq@cic.com.vn\n', options: { fontSize: 11, color: C.muted, breakLine: true } },
  { text: 'TP. Hồ Chí Minh, Việt Nam', options: { fontSize: 11, color: C.muted } },
], { x: 2.7, y: 3.9, w: 4.6, h: 1.0, fontFace: 'Arial', align: 'center', valign: 'middle', lineSpacingMultiple: 1.3 });

s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.gold } });
s.addNotes('Kính thưa quý Ban, trên đây là toàn bộ nội dung giới thiệu về Hệ thống Quản lý Dự án Đầu tư Xây dựng.\nChúng tôi tin tưởng rằng đây là giải pháp phù hợp để Ban QLDA ĐTXD các công trình Dân dụng và Công nghiệp từng bước thực hiện chuyển đổi số, nâng cao hiệu lực hiệu quả quản lý nhà nước trong lĩnh vực đầu tư xây dựng, đáp ứng yêu cầu ngày càng cao của pháp luật và thực tiễn công tác.\nXin trân trọng cảm ơn quý Ban đã lắng nghe. Kính mời quý Ban cho ý kiến chỉ đạo.');

// ══════════════════════════════════════════
// GENERATE
// ══════════════════════════════════════════
const outputPath = path.join(__dirname, '..', 'ThuyetTrinh_PhanMem_QLDA_DTXD.pptx');
pres.writeFile({ fileName: outputPath }).then(() => {
  const stats = require('fs').statSync(outputPath);
  console.log(`✅ Presentation generated: ${outputPath}`);
  console.log(`   File size: ${(stats.size / 1024).toFixed(1)} KB`);
  console.log(`   Slides: 14`);
}).catch(err => console.error('Error:', err));
