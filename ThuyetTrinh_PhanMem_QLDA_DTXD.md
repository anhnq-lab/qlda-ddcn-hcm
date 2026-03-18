# HỆ THỐNG QUẢN LÝ DỰ ÁN ĐẦU TƯ XÂY DỰNG

**Ban QLDA ĐTXD các công trình Dân dụng và Công nghiệp — UBND TP. Hồ Chí Minh**

Phiên bản 3.0 • 17/03/2026 • CIC Technology and Consultancy JSC

---

## MỤC LỤC

1. Bối cảnh & Mục tiêu
2. Tổng quan Hệ thống
3. Các Module Chức năng
4. Công nghệ & Kiến trúc
5. Bảo mật & Phân quyền
6. Lợi ích & Giá trị
7. Lộ trình Triển khai

---

## 1. BỐI CẢNH & MỤC TIÊU

*Kính thưa quý Ban lãnh đạo, trước khi đi vào chi tiết phần mềm, cho phép em trình bày bối cảnh vì sao chúng ta cần một hệ thống quản lý dự án số hóa tại thời điểm này.*

### Cuộc Cách mạng Công nghiệp và xu thế Chuyển đổi số

*Nhìn lại lịch sử, thế giới đã trải qua 4 cuộc cách mạng công nghiệp lớn. Mỗi cuộc cách mạng đánh dấu bước ngoặt trong cách con người sản xuất, quản lý và vận hành:*

| Giai đoạn | Tên gọi | Đặc điểm chính |
|-----------|---------|---------------|
| **CMCN 1** (1784) | Cơ khí hóa | Máy hơi nước, cơ giới hóa sản xuất |
| **CMCN 2** (1870) | Điện khí hóa | Dây chuyền sản xuất, năng lượng điện |
| **CMCN 3** (1969) | Tự động hóa | Máy tính, Internet, tự động hóa |
| **CMCN 4** (hiện tại) | Số hóa & AI | Trí tuệ nhân tạo, Big Data, IoT, Digital Twin |

*Nhìn lại, với 3 cuộc cách mạng công nghiệp trước, đất nước ta đã không có đủ công cụ và tư liệu sản xuất để bắt kịp thế giới. Nhưng với Cách mạng 4.0 — nơi "vũ khí" chính là dữ liệu, trí tuệ nhân tạo và nền tảng số — chúng ta hoàn toàn có đủ điều kiện, đủ nguồn lực con người và hạ tầng công nghệ để thực hiện. Đây là cơ hội lịch sử để Việt Nam đi cùng, thậm chí đi trước trong cuộc đua chuyển đổi số. Và trong lĩnh vực xây dựng, tổ chức nào làm chủ dữ liệu sớm — tổ chức đó sẽ quản lý hiệu quả hơn, minh bạch hơn và tiết kiệm nguồn lực hơn.*

### Nền tảng Pháp lý — Xu hướng đã rõ ràng

*Để hiện thực hóa cơ hội ngàn năm có một từ Cách mạng 4.0, ngành xây dựng Việt Nam đã và đang hành động quyết liệt. Đảng và Nhà nước ta đã đi trước một bước khi sớm ban hành hàng loạt văn bản pháp lý chặt chẽ, tạo hành lang vững chắc bảo vệ và thúc đẩy công cuộc số hóa này. Việc chuyển đổi số, áp dụng BIM và quản lý dữ liệu từ nay đã chính thức được luật hóa — đây không còn là sự lựa chọn công nghệ, mà là yêu cầu bắt buộc đối với tất cả chúng ta. Dưới đây là các văn bản quan trọng nhất tạo nền tảng cho hệ thống phần mềm:*

| Năm | Văn bản | Nội dung chính | Ý nghĩa |
|-----|---------|---------------|----------|
| **2019** | **NQ 52-NQ/TW** (Bộ Chính trị, 27/9/2019) | Chủ trương tham gia CMCN 4.0, chuyển đổi số quốc gia | Định hướng chiến lược CĐS từ cấp cao nhất |
| **2020** | **QĐ 749/QĐ-TTg** (3/6/2020) | Chương trình CĐS quốc gia đến 2025, tầm nhìn 2030 | Mục tiêu cụ thể: AI, Big Data, BIM vào quản lý nhà nước |
| **2023** | **QĐ 258/QĐ-TTg** (17/3/2023) | Lộ trình áp dụng BIM trong hoạt động xây dựng | Bắt buộc BIM cho dự án nhóm B trở lên |
| **2023** | **Luật Đấu thầu 22/2023/QH15** | Quy định lựa chọn nhà thầu, nhà đầu tư | Đấu thầu điện tử, minh bạch hóa quy trình |
| **2024** | **NĐ 111/2024/NĐ-CP** (6/9/2024) | Hệ thống thông tin, CSDL quốc gia về hoạt động XD | **Bước ngoặt**: CSDL quốc gia XD — bắt buộc kết nối |
| **2024** | **Luật ĐTC 58/2024/QH15** (29/11/2024) | Quản lý nhà nước về đầu tư công | Phân cấp, phân quyền, đẩy nhanh giải ngân |
| **2024** | **NQ 57-NQ/TW** (Bộ Chính trị, 22/12/2024) | Đột phá KH-CN, đổi mới sáng tạo và CĐS quốc gia | **Tầm cao mới**: Digital Twin đô thị, bản sao số |
| **2024** | **NĐ 175/2024/NĐ-CP** (30/12/2024) | Hướng dẫn Luật XD, quy định BIM bắt buộc | **Luật hóa BIM**: Áp dụng BIM cho dự án nhóm B trở lên |
| **2025** | **NĐ 214/2025/NĐ-CP** (4/8/2025) | Hướng dẫn Luật Đấu thầu về lựa chọn nhà thầu | Chuẩn hóa quy trình đấu thầu điện tử |
| **2025** | **TT 24/2025/TT-BXD** (29/8/2025) | Hướng dẫn thông tin trong CSDL quốc gia về XD | Chuẩn hóa dữ liệu dự án, mã số định danh |

### Thực trạng — 5 Thách thức cốt lõi

*Xu hướng đã rõ ràng. Vậy thực trạng quản lý dự án hiện nay của chúng ta đang gặp những thách thức gì? Xin thẳng thắn nhìn nhận 5 vấn đề cốt lõi:*

| # | Thách thức | Mô tả | Hệ quả |
|---|-----------|-------|--------|
| 1 | **Dữ liệu phân tán** | Thông tin nằm rải rác qua email, giấy tờ, USB, máy cá nhân | Khó tổng hợp, dễ thất lạc, mất thời gian tìm kiếm |
| 2 | **Thiếu minh bạch tiến độ** | Lãnh đạo không theo dõi được realtime | Phải chờ báo cáo định kỳ bằng giấy, thông tin chậm |
| 3 | **Quản lý tài chính thủ công** | Theo dõi giải ngân, hợp đồng bằng Excel riêng lẻ | Khó đối soát, dễ sai sót, chậm phát hiện bất thường |
| 4 | **Thiếu cảnh báo sớm** | Không có hệ thống tự động phát hiện rủi ro | Vi phạm pháp luật, chậm tiến độ, vượt dự toán |
| 5 | **Khó tuân thủ pháp lý** | Nhiều văn bản, quy định thay đổi liên tục | Bỏ sót thủ tục, hồ sơ không đầy đủ khi thanh tra |

### Mục tiêu — Giải pháp tổng thể

*Nhận diện được 5 thách thức đó, chúng tôi đã xây dựng một hệ thống phần mềm nhằm giải quyết triệt để từng vấn đề. Xin trình bày 5 trụ cột chính của giải pháp:*

| Trụ cột | Mục tiêu | Giải quyết thách thức |
|---------|----------|----------------------|
| **Tập trung hóa dữ liệu** | Một nền tảng duy nhất cho toàn bộ dữ liệu dự án | Thách thức #1 |
| **Minh bạch & Realtime** | Dashboard KPI, theo dõi tiến độ theo thời gian thực | Thách thức #2 |
| **AI hỗ trợ quyết định** | 9 module AI phân tích, dự báo, phát hiện bất thường | Thách thức #3, #4 |
| **Tuân thủ pháp lý** | Tích hợp văn bản pháp luật, kiểm tra tự động | Thách thức #5 |
| **BIM & CDE** | Mô hình 3D, Môi trường dữ liệu chung theo ISO 19650 | Nâng tầm quản lý |

---

## 2. TỔNG QUAN HỆ THỐNG

*Với 5 trụ cột vừa trình bày, giờ đây cho phép em giới thiệu tổng quan hệ thống mà chúng tôi đã xây dựng �## 3. CÁC MODULE CHỨC NĂNG

*Hệ thống bao gồm 18 module chức năng, bao phủ toàn bộ quy trình quản lý dự án đầu tư xây dựng — từ tổng quan điều hành, lập kế hoạch vốn, quản lý gói thầu theo Luật Đấu thầu 2023, đến tuân thủ pháp lý, BIM 3D và trí tuệ nhân tạo. Mỗi module đều được phát triển sát nghiệp vụ thực tế của Ban QLDA. Em xin lần lượt trình bày chi tiết:*

---

### 3.1. Dashboard Tổng quan — Trung tâm Điều hành

*Đây là trang đầu tiên khi Lãnh đạo đăng nhập — nơi nắm bắt toàn bộ tình hình danh mục dự án chỉ trong 30 giây, với dữ liệu realtime và AI phân tích tự động:*

| Tính năng | Mô tả chi tiết | Ý nghĩa |
|-----------|----------------|---------|
| **4 KPI Cards** | Dự án đang quản lý (phân theo 3 giai đoạn), Tổng vốn đầu tư, Kế hoạch vốn năm, Giải ngân năm (% đạt kế hoạch) — click vào card chuyển thẳng đến module tương ứng | Nắm bắt tổng quan ngay lập tức, tương tác trực tiếp |
| **Bộ lọc thông minh** | Lọc theo Năm (2020-2027) và theo Ban QLDA (Ban 1-5) — toàn bộ dashboard cập nhật theo bộ lọc | So sánh hiệu quả giữa các năm, các Ban |
| **Bảng tổng hợp dự án** | Tên dự án, Ban QLDA, giai đoạn (badge màu), thanh tiến độ, vốn đầu tư, % giải ngân — click vào dự án để xem chi tiết | Rà soát nhanh toàn bộ danh mục |
| **Biểu đồ Kế hoạch vs Giải ngân** | Biểu đồ cột so sánh vốn kế hoạch và thực giải ngân theo từng Ban, tỷ lệ % — tooltip chi tiết | Phát hiện sớm Ban nào chậm giải ngân |
| **Hub AI (5 widget)** | AI Summary (tóm tắt tổng thể), AI Risk Dashboard, AI Anomaly Detector, AI Contractor Scoring, AI Resource Optimizer — tất cả hiển thị trên 1 trang | Trợ lý AI phân tích toàn diện |
| **Bản đồ Leaflet** | Bản đồ tương tác hiển thị vị trí dự án trên địa bàn TP.HCM, phân loại giai đoạn bằng màu marker, chú thích trực quan | Trực quan hóa phân bố dự án |
| **Panel cảnh báo** | Danh sách cảnh báo quan trọng: chậm tiến độ, vượt dự toán, thiếu hồ sơ — phân loại mức độ nghiêm trọng bằng màu | Phát hiện sớm rủi ro, xử lý kịp thời |

---

### 3.2. Dashboard Cá nhân — Góc làm việc riêng

*Mỗi cán bộ khi đăng nhập sẽ có một trang Dashboard cá nhân, hiển thị chỉ những dự án và công việc mình phụ trách — thay thế việc hỏi đồng nghiệp "hôm nay tôi cần làm gì":*

| Tính năng | Mô tả chi tiết |
|-----------|----------------|
| **Welcome Header** | Xin chào + Họ tên, Chức vụ, Phòng Ban — hiển thị ngày hôm nay |
| **4 KPI cá nhân** | Dự án phụ trách, Công việc đang làm, Chờ xử lý, Quá hạn — click vào chuyển sang module tương ứng |
| **Dự án của tôi** | Danh sách dự án được phân công, thanh tiến độ, giai đoạn, tổng vốn — lọc tự động theo EmployeeID |
| **Deadline sắp tới** | 5 công việc sắp hết hạn trong 7 ngày, hiển thị "Hôm nay", "Ngày mai", "3 ngày" — badge theo mức ưu tiên |
| **Công việc đang thực hiện** | Danh sách task đang InProgress, badge mức ưu tiên (Urgent/High/Medium/Low) |
| **Tài liệu gần đây** | 5 tài liệu mới nhất của dự án mình phụ trách, trạng thái duyệt ISO, phiên bản — truy vấn realtime từ Supabase |
| **Hợp đồng liên quan** | Hợp đồng thuộc các dự án mình phụ trách, giá trị, tên dự án |
| **Tổng mức đầu tư phụ trách** | Tổng vốn + tỷ lệ hoàn thành công việc cá nhân |

---

### 3.3. Quản lý Dự án — Trang danh sách

*Từ Dashboard tổng quan, khi muốn xem chi tiết, người dùng chuyển sang trang Danh sách Dự án:*

| Tính năng | Mô tả | Ý nghĩa |
|-----------|-------|---------|
| Danh sách dự án | Hiển thị tên, trạng thái, giai đoạn, Ban quản lý, tổng vốn, tiến độ | Nắm bắt tình trạng ngay tại trang danh sách |
| Tìm kiếm và lọc | Lọc theo trạng thái, giai đoạn, nhóm dự án (A/B/C), Ban QLDA | Tìm nhanh trong hàng trăm dự án |
| Phân loại giai đoạn | 3 giai đoạn: Chuẩn bị ĐA, Thực hiện ĐA, Kết thúc XD (theo Điều 4 NĐ 175/2024) | Theo dõi trực quan dự án đang ở giai đoạn nào |
| Phân quyền theo Ban | Mỗi Ban QLDA chỉ thấy dữ liệu thuộc phạm vi quản lý (RLS tự động) | Bảo mật dữ liệu giữa các Ban |

---

### 3.4. Chi tiết Dự án — 8 Tab nghiệp vụ chuyên sâu

*Khi bấm vào một dự án cụ thể, hệ thống hiển thị giao diện chi tiết với 8 tab chuyên biệt — mỗi tab là một hệ thống con hoàn chỉnh:*

#### Tab 1: Thông tin chung
- Tổng quan dự án: chủ đầu tư, Ban QL, địa chỉ, tỉnh/thành, nhóm dự án, tổng vốn, ngày phê duyệt
- **AI Summary** tự động phân tích tình hình dự án, phát hiện vấn đề
- Chỉnh sửa inline, lưu realtime

#### Tab 2: Kế hoạch thực hiện (Module lớn nhất hệ thống)

*Đây là tab nghiệp vụ quan trọng nhất — quản lý toàn bộ kế hoạch thực hiện dự án theo đúng trình tự NĐ 175/2024:*

| Tính năng | Mô tả chi tiết |
|-----------|----------------|
| **WBS theo NĐ 175/2024** | Cấu trúc phân cấp 3 giai đoạn → các bước thực hiện → công việc con — tự động phát sinh theo nhóm dự án (A/B/C/QG) và có/không ODA |
| **4 chế độ xem** | WBS (cấu trúc phân cấp), Gantt Chart (biểu đồ thời gian), Kanban (bảng trạng thái), Resource (phân bổ nhân sự) |
| **Auto-generate kế hoạch** | Nút "Tạo KH tổng thể" — tự động tạo toàn bộ công việc từ quy trình pháp lý (sub-task registry), tính ngày bắt đầu/kết thúc dựa trên ngày khởi công |
| **Tạo KH theo giai đoạn** | Tạo kế hoạch riêng cho từng giai đoạn (Chuẩn bị/Thực hiện/Kết thúc) |
| **Smart auto-expand** | Tự động mở rộng giai đoạn đang hoạt động/quá hạn, thu gọn giai đoạn đã hoàn thành 100% |
| **Quick status toggle** | Click icon trạng thái để chuyển nhanh: Todo → InProgress → Review → Done, tự động cập nhật % tiến độ |
| **Auto-fill ngày thực tế** | Khi bắt đầu làm → tự ghi ngày bắt đầu thực tế; hoàn thành → ghi ngày kết thúc thực tế |
| **Auto-propagate** | Khi hoàn thành công việc → tự động gán ngày bắt đầu cho công việc kế tiếp (predecessor chain) |
| **Đính kèm hồ sơ** | Upload file đính kèm cho từng công việc, tự động liên kết với bảng documents, cross-reference TT24/2025 |
| **Milestone Timeline** | Dòng thời gian các mốc quan trọng: phê duyệt chủ trương, phê duyệt dự án, khởi công, nghiệm thu, bàn giao |
| **Statistics Header** | Thanh thống kê tổng quan: tổng task, hoàn thành, đang làm, quá hạn — click vào card để lọc |
| **Tham chiếu pháp lý** | Mỗi bước hiển thị căn cứ pháp lý (NĐ 175, Luật XD, Luật ĐTC), click để xem toàn văn |
| **Optimistic UI + Toast** | Cập nhật giao diện ngay lập tức, toast thông báo thành công/thất bại |

#### Tab 3: Vốn & Giải ngân
- Cơ cấu nguồn vốn (ngân sách TW, địa phương, ODA, vay), kế hoạch giải ngân theo quý/năm
- **AI Forecast** dự báo xu hướng giải ngân 3 tháng tới
- Biểu đồ so sánh kế hoạch vs thực tế

#### Tab 4: Gói thầu — Quản lý đấu thầu toàn diện

*Module đấu thầu tuân thủ Luật Đấu thầu 22/2023/QH15 và NĐ 214/2025:*

| Tính năng | Mô tả chi tiết |
|-----------|----------------|
| **Quản lý KHLCNT** | Tạo, sửa, xóa Kế hoạch lựa chọn nhà thầu — hỗ trợ cả hệ thống EGP mới và hệ thống cũ |
| **Import từ Excel** | Nhập danh sách gói thầu từ file Excel/CSV, tự động mapping cột |
| **Bảng gói thầu** | 16 cột theo biểu mẫu Bộ KH&ĐT: tên gói, giá trị, nguồn vốn, hình thức LCNT, phương thức, thời gian, loại HĐ |
| **6 trạng thái** | Trong kế hoạch → Đã đăng tải → Đang mời thầu → Đang xét thầu → Đã có kết quả → Hủy thầu |
| **Drag & Drop** | Kéo thả gói thầu để sắp xếp thứ tự, tự động lưu sort_order |
| **MSC Compliance** | Kiểm tra tự động nghĩa vụ đăng tải trên **muasamcong.mpi.gov.vn** — cảnh báo gói thầu cần đăng tải |
| **Xuất VB KHLCNT** | Xuất văn bản Quyết định phê duyệt KHLCNT theo đúng mẫu quy định |
| **Export Excel** | Xuất toàn bộ danh sách gói thầu ra Excel |
| **Chi tiết 4 tab** | KHLCNT, Lựa chọn nhà thầu, Hợp đồng, Thanh quyết toán — quản lý toàn bộ vòng đời gói thầu |

#### Tab 5: Tuân thủ Pháp lý
- Checklist thủ tục pháp lý bắt buộc theo từng giai đoạn
- **AI Compliance Checker** tự động kiểm tra và cảnh báo thiếu hồ sơ
- Liên kết trực tiếp đến điều khoản trong văn bản pháp luật

#### Tab 6: Hồ sơ & Pháp lý
- Upload/download hồ sơ đa định dạng, preview trực tiếp, phân loại theo TT 24/2025
- **AI Document Drafter** — soạn văn bản pháp lý tự động: công văn, quyết định, biên bản

#### Tab 7: Vận hành
- Nghiệm thu, bàn giao, quyết toán, bảo hành công trình — quản lý giai đoạn kết thúc xây dựng

#### Tab 8: BIM (trong dự án)
- Xem nhanh mô hình BIM gắn với dự án, liên kết sang module BIM Viewer chi tiết

---

### 3.5. BIM 3D Viewer — Module riêng

*Module BIM cho phép xem trực tiếp mô hình 3D ngay trên trình duyệt — không cần cài đặt phần mềm:*

| Tính năng | Mô tả |
|-----------|-------|
| Upload & Render IFC | Tải lên file IFC, tự động render mô hình 3D bằng engine IFC.js + web-ifc |
| Model Tree | Cây phân cấp cấu kiện theo tầng/loại, bật/tắt hiển thị nhóm, tìm kiếm |
| Properties Panel | Thuộc tính chi tiết cấu kiện: vật liệu, kích thước, tham số kỹ thuật (30+ trường) |
| Section Plane | Cắt mặt cắt ngang/dọc qua mô hình để xem bên trong, điều chỉnh realtime |
| Spatial Tree | Phân cấp không gian: Site → Building → Storey → Element |
| Camera Presets | Chế độ xem: phối cảnh, orthographic, mặt trước/sau/trái/phải |
| **Cache thông minh** | File IFC được cache trên trình duyệt — chuyển qua lại giữa các mô hình không cần tải lại |
| **Visibility pattern** | Giữ BIM viewer mounted khi chuyển tab — không cần reload mô hình |

*Tuân thủ tiêu chuẩn IFC — chuẩn mở toàn cầu cho trao đổi dữ liệu BIM.*

---

### 3.6. CDE — Môi trường Dữ liệu Chung (ISO 19650)

| Tính năng | Mô tả |
|-----------|-------|
| Folder Tree | Cấu trúc thư mục 4 vùng: **WIP** (đang làm), **SHARED** (chia sẻ), **PUBLISHED** (ban hành), **ARCHIVED** (lưu trữ) |
| Upload & Drag-drop | Kéo thả file, hỗ trợ đa định dạng (PDF, DWG, IFC, DOC, XLS, JPG...) |
| Workflow duyệt | Submit → Review → Approve — theo đúng quy trình ISO 19650 |
| Revision History | Lịch sử phiên bản đầy đủ, so sánh giữa các phiên bản |
| Transmittal | Tạo phiếu gửi tài liệu chính thức giữa các bên liên quan |
| Permission Manager | Phân quyền truy cập theo tổ chức, vai trò — nhóm Ban, nhà thầu, tư vấn |
| Audit Log | Ghi lại mọi thao tác: ai tải, ai sửa, ai duyệt, timestamp chính xác |
| Comment Thread | Bình luận trực tiếp trên tài liệu, trao đổi giữa các bên |
| Contractor Dashboard | Trang tổng quan riêng cho nhà thầu, chỉ thấy tài liệu được phân quyền |
| **Thống kê CDE** | Dashboard thống kê: số tài liệu theo vùng, theo trạng thái, hoạt động gần đây |

---

### 3.7. Quản lý Hợp đồng

**Mục tiêu:** Kiểm soát toàn bộ vòng đời hợp đồng từ ký kết đến thanh lý — liên kết trực tiếp với dự án, gói thầu và nhà thầu.

| Tính năng | Mô tả |
|-----------|-------|
| Danh sách hợp đồng | Tổng quan: số HĐ, nhà thầu, giá trị, trạng thái, tiến độ thanh toán |
| Chi tiết hợp đồng | Loại HĐ (trọn gói/đơn giá cố định/đơn giá điều chỉnh/hỗn hợp), ngày ký, thời hạn, giá trị |
| Phụ lục hợp đồng | Quản lý phụ lục, gia hạn, điều chỉnh giá trị |
| Liên kết dự án & gói thầu | Tự động liên kết với dự án gốc, gói thầu tương ứng |
| Theo dõi thanh toán | Tiến độ thanh toán theo đợt, so sánh với giá trị hợp đồng |

### 3.8. Quản lý Thanh toán

| Tính năng | Mô tả |
|-----------|-------|
| Danh sách thanh toán | Tổng hợp theo hợp đồng, đợt thanh toán, số tiền, trạng thái |
| Tạo đợt thanh toán | Ghi nhận: số tiền, ngày thanh toán, hồ sơ đính kèm |
| Tiến độ thanh toán | Phần trăm đã thanh toán so với tổng giá trị hợp đồng |
| **Deep-link** | Click vào thanh toán → chuyển thẳng đến chi tiết gói thầu tab "Thanh quyết toán" |

---

### 3.9. Kế hoạch Vốn & Giải ngân KBNN

*Module riêng quản lý kế hoạch vốn hàng năm và giải ngân qua Kho bạc Nhà nước — module nghiệp vụ đặc thù cho quản lý đầu tư công:*

| Tính năng | Mô tả |
|-----------|-------|
| **Kế hoạch vốn** | Quản lý vốn trung hạn và hàng năm: năm, quyết định số, vốn giao, đã giải ngân, tỷ lệ %, nguồn vốn |
| **Lịch sử giải ngân KBNN** | Ghi nhận từng giao dịch: mã giao dịch, ngày, nội dung, biểu mẫu (03a/03b), giá trị, trạng thái |
| **3 KPI cards** | Kế hoạch vốn (tổng vốn được giao), Đã giải ngân (progress bar %), Cảnh báo rủi ro |
| **Xuất mẫu 03a** | Xuất biểu mẫu đề nghị thanh toán vốn theo mẫu KBNN |

---

### 3.10. Quản lý Công việc (Task Management)

| Tính năng | Mô tả |
|-----------|-------|
| Kanban Board | Bảng công việc trực quan: Chờ xử lý, Đang làm, Đang kiểm tra, Hoàn thành |
| Giao việc | Phân công cho cá nhân cụ thể, đặt deadline, mức ưu tiên (Urgent/High/Medium/Low) |
| Theo dõi tiến độ | Trạng thái cập nhật liên tục, thanh % tiến độ, thông báo khi quá hạn |
| Liên kết dự án | Mỗi task gắn với dự án cụ thể, filter theo dự án |

---

### 3.11. Quản lý Nhà thầu

| Tính năng | Mô tả |
|-----------|-------|
| Danh sách nhà thầu | Thông tin: tên, loại hình (tư vấn TK/giám sát/thẩm tra/thi công), năng lực, lịch sử |
| Hồ sơ năng lực | Kinh nghiệm, dự án đã thực hiện, đánh giá chất lượng |
| **AI Chấm điểm** | AI tự động chấm điểm năng lực dựa trên lịch sử, đánh giá, tuân thủ, chất lượng |
| **Tài khoản nhà thầu** | Admin tạo tài khoản đăng nhập riêng cho nhà thầu — nhà thầu chỉ thấy dự án được phân quyền |

### 3.12. Quản lý Nhân sự & Tổ chức

| Tính năng | Mô tả |
|-----------|-------|
| Danh sách cán bộ | Họ tên, chức vụ, Ban, email, số điện thoại, avatar |
| Phân công dự án | Cán bộ đang phụ trách dự án nào, năng lực chuyên môn |
| **Sơ đồ tổ chức** | Module OrgChart trực quan — mô hình phân cấp theo Ban QLDA (Ban 1-5) |

---

### 3.13. Hồ sơ & Tài liệu

| Tính năng | Mô tả |
|-----------|-------|
| Upload & Download | Tải lên/tải xuống, hỗ trợ đa định dạng, lưu trữ trên Supabase Storage (S3) |
| Phân loại | Theo dự án, giai đoạn, loại hồ sơ, cross-reference TT 24/2025/TT-BXD |
| Preview | Xem trước PDF, hình ảnh trực tiếp trong trình duyệt |
| **AI Soạn văn bản** | AI soạn văn bản pháp lý tự động: công văn, quyết định, biên bản — từ dữ liệu dự án |

### 3.14. Văn bản Pháp luật — Kho Luật Toàn văn

*Module tích hợp cơ sở dữ liệu pháp luật xây dựng với hơn 2MB dữ liệu toàn văn:*

| Tính năng | Mô tả |
|-----------|-------|
| **Tìm kiếm toàn văn** | Theo số hiệu, tên, cơ quan ban hành, lĩnh vực — tìm kiếm trong toàn bộ nội dung |
| **CSDL toàn văn** | Luật XD 62/2020, Luật ĐTC 58/2024, NĐ 175/2024, NĐ 111/2024, NĐ 214/2025, TT 24/2025 — nội dung đầy đủ điều khoản |
| **Xem toàn văn** | Đọc trực tiếp nội dung văn bản trong ứng dụng (Legal Article Panel) — không cần mở trang ngoài |
| **Legal Reference Link** | Click vào tên văn bản/điều khoản trong bất kỳ module nào → mở panel xem toàn văn |

---

### 3.15. Trung tâm Báo cáo & Đồng bộ CSDL Quốc gia

| Tính năng | Mô tả |
|-----------|-------|
| **Đồng bộ CSDL Quốc gia** | Tự động đồng bộ dữ liệu dự án, gói thầu về CSDL Quốc gia qua API theo NĐ 111/2024/NĐ-CP — hiển thị trạng thái kết nối, lần đồng bộ cuối |
| **BC Giám sát Đầu tư** | Báo cáo tình hình thực hiện theo biểu mẫu Bộ KH&ĐT (BC-01) — xuất CSV, định kỳ Tháng/Quý |
| **BC Giải ngân** | So sánh vốn giải ngân thực tế vs kế hoạch — dữ liệu realtime |
| **BC Xử lý vướng mắc** | Tổng hợp vấn đề khó khăn, vướng mắc cần tháo gỡ |
| **AI Report** | AI soạn báo cáo giám sát hàng tháng tự động, xuất file DOCX chuyên nghiệp |

---

### 3.16. Quản trị Hệ thống

| Tính năng | Mô tả |
|-----------|-------|
| **Quản lý tài khoản** | Tạo, sửa, vô hiệu hóa tài khoản cán bộ; gán vai trò |
| **Quản lý TK nhà thầu** | Tạo tài khoản riêng cho nhà thầu (tư vấn TK, giám sát, thẩm tra, thi công) — gán dự án được truy cập |
| **Phân quyền RBAC** | Phân quyền theo Vai trò × Tài nguyên × Hành động — giao diện Permission Manager trực quan |
| **Audit Log** | Ghi nhận mọi thao tác: đăng nhập, sửa dữ liệu, duyệt tài liệu — lọc theo người dùng, thời gian |
| **Impersonation** | Admin xem hệ thống dưới góc nhìn người dùng khác — phục vụ hỗ trợ và kiểm tra phân quyền |
| **Cài đặt** | Dark/Light mode, tùy chỉnh giao diện, thông tin cá nhân |

---

### 3.17. Module AI — Trí tuệ Nhân tạo (9 Module)

*Và đây là module em muốn nhấn mạnh đặc biệt — 9 module AI được tích hợp xuyên suốt hệ thống, sử dụng mô hình Gemini của Google. AI không phải là một trang riêng biệt, mà được nhúng vào từng nghiệp vụ, hỗ trợ cán bộ ngay tại nơi làm việc:*

| # | Module AI | Vị trí tích hợp | Chức năng | Ví dụ ứng dụng |
|---|----------|-----------------|----------|----------------|
| 1 | **AI Summary** | Dashboard + Tab Thông tin | Tóm tắt tình hình dự án/danh mục tự động | "Dự án X chậm 15% so với kế hoạch, cần bổ sung 2 hồ sơ" |
| 2 | **AI Forecast** | Tab Vốn & Giải ngân | Dự báo xu hướng giải ngân, tiến độ | Biểu đồ dự báo 3 tháng tới, cảnh báo vượt dự toán |
| 3 | **AI Anomaly Detector** | Dashboard | Phát hiện bất thường trong dữ liệu | Phát hiện giải ngân đột biến, tiến độ bất thường |
| 4 | **AI Compliance Checker** | Tab Tuân thủ | Kiểm tra tuân thủ pháp lý tự động | Cảnh báo thiếu hồ sơ bắt buộc theo NĐ 175/2024 |
| 5 | **AI Document Drafter** | Tab Hồ sơ | Soạn văn bản pháp lý tự động | Soạn công văn, quyết định, biên bản từ dữ liệu dự án |
| 6 | **AI Contractor Scoring** | Dashboard + Nhà thầu | Chấm điểm năng lực nhà thầu | Đánh giá dựa trên lịch sử, năng lực, chất lượng, tuân thủ |
| 7 | **AI Risk Analyzer** | Dashboard | Đánh giá rủi ro dự án | Phân tích đa chiều: tiến độ, tài chính, pháp lý, kỹ thuật |
| 8 | **AI Resource Optimizer** | Dashboard | Tối ưu phân bổ nguồn lực | Gợi ý phân công cán bộ, điều phối giữa các Ban |
| 9 | **AI Smart Approval** | Workflow duyệt | Hỗ trợ phê duyệt thông minh | Phân tích hồ sơ, đề xuất phê duyệt/từ chối kèm lý do |


## 4. CÔNG NGHỆ & KIẾN TRÚC

*Quý Ban có thể thắc mắc: với nhiều tính năng như vậy, hệ thống được xây dựng trên nền tảng công nghệ nào? Xin trình bày kiến trúc kỹ thuật — đây là phần đảm bảo hệ thống hoạt động ổn định, bảo mật và có thể mở rộng trong tương lai:*

### Kiến trúc tổng thể

```
NGUOI DUNG (Trinh duyet Web — PC, Tablet, Mobile)
        |
        | HTTPS (TLS 1.3)
        v
FRONTEND (React + TypeScript)
  - Dashboard Realtime
  - Du an 15 modules
  - BIM 3D Viewer
  - CDE ISO 19650
        |
        | REST API + Realtime WebSocket
        v
BACKEND (Supabase Platform)
  - PostgreSQL Database
  - Auth (Supabase)
  - Storage (S3)
  - Edge Functions
        |
        v
TICH HOP BEN NGOAI
  - Google Gemini AI
  - IFC.js (BIM)
  - DOCX Generator
```

### Technology Stack

| Tầng | Công nghệ | Vai trò | Giải thích |
|------|-----------|---------|------------|
| Frontend | **React 18 + TypeScript** | Giao diện người dùng | Framework phổ biến nhất thế giới, do Meta phát triển |
| Styling | **Vanilla CSS + Responsive** | Giao diện tương thích mọi thiết bị | Hiển thị tốt trên PC, tablet, điện thoại |
| State | **React Query + Context** | Quản lý dữ liệu | Đồng bộ dữ liệu realtime, cache thông minh |
| Backend | **Supabase (PostgreSQL)** | CSDL + API | Nền tảng mã nguồn mở, chi phí thấp, bảo mật cao |
| Auth | **Supabase Auth** | Xác thực người dùng | Đăng nhập an toàn, kiểm tra mật khẩu bị lộ |
| Storage | **Supabase Storage (S3)** | Lưu trữ file | Dung lượng lớn, tốc độ cao, mã hóa |
| AI | **Google Gemini** | Trí tuệ nhân tạo | 9 module AI: tóm tắt, dự báo, phát hiện bất thường |
| BIM | **IFC.js + web-ifc** | Mô hình 3D | Render mô hình IFC trên trình duyệt |
| Hosting | **Vercel / Cloudflare** | Triển khai | CDN toàn cầu, tốc độ truy cập nhanh |
| Monitoring | **Error Monitoring** | Theo dõi lỗi | Web Vitals (LCP, FID, CLS), cảnh báo tức thì |

---

## 5. BẢO MẬT & PHÂN QUYỀN

*Bảo mật là yếu tố sống còn khi hệ thống chứa dữ liệu nhạy cảm của hàng trăm dự án đầu tư công. Xin trình bày 6 lớp bảo mật đã được triển khai:*

### 6 Lớp Bảo mật

| Lớp | Cơ chế | Mô tả |
|-----|--------|-------|
| 1 | **Authentication** | Đăng nhập email/password qua Supabase Auth, kiểm tra mật khẩu bị lộ |
| 2 | **RBAC** | Phân quyền theo Vai trò x Tài nguyên x Hành động (xem/sửa/xóa/duyệt) |
| 3 | **RLS (Row Level Security)** | Bảo mật cấp dòng dữ liệu — mỗi truy vấn tự động lọc theo quyền, 148 chính sách |
| 4 | **Audit Trail** | Ghi lại mọi thao tác: ai làm gì, lúc nào — không thể chối bỏ |
| 5 | **HTTPS + Security Headers** | Kết nối mã hóa, HSTS preload, X-Frame-Options DENY |
| 6 | **CSP + Headers** | X-Content-Type-Options, Referrer-Policy, Permissions-Policy — chống XSS, clickjacking |

### Phân quyền chi tiết

| Vai trò | Quyền hạn |
|---------|----------|
| **Lãnh đạo Ban** | Xem tất cả, duyệt, phê duyệt cao cấp |
| **Trưởng phòng** | Quản lý dự án thuộc phòng, duyệt hồ sơ |
| **Cán bộ dự án** | Cập nhật dữ liệu dự án được phân công |
| **Kỹ thuật viên** | Upload/quản lý hồ sơ kỹ thuật, BIM |
| **Nhà thầu** | Chỉ xem tài liệu được phân quyền qua CDE |
| **Admin** | Quản trị hệ thống, phân quyền, audit log |

### Bảng phân quyền Module

| STT | Module | Đường dẫn | Quyền truy cập |
|-----|--------|----------|----------------|
| 1 | Dashboard | / | Tất cả vai trò |
| 2 | Dự án | /projects | Tất cả vai trò (lọc theo Ban) |
| 3 | Hợp đồng | /contracts | Trưởng phòng trở lên |
| 4 | Thanh toán | /payments | Trưởng phòng trở lên |
| 5 | Gói thầu | /packages | Cán bộ dự án trở lên |
| 6 | Nhà thầu | /contractors | Cán bộ dự án trở lên |
| 7 | Nhân sự | /employees | Trưởng phòng trở lên |
| 8 | CDE | /cde | Tất cả vai trò (phân quyền theo folder) |
| 9 | BIM | /bim | Kỹ thuật viên trở lên |
| 10 | Văn bản PL | /regulations | Tất cả vai trò |
| 11 | Báo cáo | /reports | Trưởng phòng trở lên |
| 12 | Quản trị | /admin | Admin |

---

## 6. LỢI ÍCH & GIÁ TRỊ

*Với tất cả những gì đã trình bày, xin tóm tắt lợi ích cốt lõi mà hệ thống mang lại cho Ban QLDA:*

### So sánh Trước và Sau

| Tiêu chí | Trước (thủ công) | Sau (hệ thống) |
|----------|---------------------|-------------------|
| **Dữ liệu** | Phân tán: email, Excel, USB | Tập trung: 1 nền tảng duy nhất |
| **Tiến độ** | Báo cáo định kỳ bằng giấy, chậm | Dashboard realtime, KPI tự động |
| **Tài chính** | Excel riêng lẻ, khó đối soát | Liên kết HĐ-Thanh toán-Giải ngân tự động |
| **Rủi ro** | Phát hiện muộn, sau sự cố | AI cảnh báo sớm, phòng ngừa chủ động |
| **Pháp lý** | Kiểm tra thủ công, dễ bỏ sót | AI Compliance tự động, luôn sẵn sàng |
| **Tài liệu** | Lưu trữ cá nhân, khó tìm | CDE ISO 19650, truy xuất tức thì |

### So sánh với giải pháp khác

| Tiêu chí | Phần mềm nước ngoài (SAP, Oracle, BIM 360) | CIC — Giải pháp của chúng tôi |
|----------|-----------------------------------------------|--------------------------------|
| **Chi phí** | Cao — phí bản quyền SAP từ 2,5 tỷ/năm; Oracle từ 1,2 tỷ/năm | Thấp hơn nhiều lần — không phí bản quyền hàng năm |
| **Tùy chỉnh** | Phải tùy chỉnh nhiều mới phù hợp quy trình VN | Thiết kế riêng cho quy trình QLDA ĐTXD Việt Nam |
| **BIM Viewer** | BIM 360 — khoảng 12 triệu/người/năm | Tích hợp sẵn, không mất thêm phí |
| **Pháp lý VN** | Không hỗ trợ NĐ 175/2024, Luật XD VN | Tích hợp đầy đủ: NĐ 175, Luật ĐTC, Luật XD, NĐ 214 |
| **AI** | Hạn chế hoặc phải mua thêm module | 9 module AI tích hợp sẵn (Google Gemini) |
| **Ngôn ngữ** | Tiếng Anh, phải dịch | Tiếng Việt 100%, phù hợp người dùng VN |
| **Triển khai** | 6-18 tháng | **12 tuần** (1 quý) |
| **Sử dụng** | Phải cài phần mềm, đào tạo phức tạp | Web-based — mở trình duyệt là dùng |

### Trí tuệ nhân tạo & Mô hình 3D — Giá trị khác biệt

| Tính năng | Giá trị | Mô tả |
|-----------|---------|-------|
| **Trí tuệ nhân tạo** | AI phân tích dữ liệu tự động | AI (Gemini) tự động tóm tắt, phát hiện bất thường, dự báo xu hướng — thay thế hàng giờ phân tích thủ công |
| **Mô hình 3D (BIM)** | BIM hiển thị mô hình công trình | Xem 3D ngay trên trình duyệt — lãnh đạo có thể giám sát trực quan mọi lúc |

---

## 7. LỘ TRÌNH TRIỂN KHAI

*Cuối cùng, xin trình bày lộ trình triển khai hệ thống. Chúng tôi đề xuất triển khai theo 3 giai đoạn để đảm bảo ổn định và giảm thiểu rủi ro:*

### Giai đoạn triển khai

| Giai đoạn | Thời gian | Nội dung | Kết quả mong đợi |
|-----------|-----------|----------|-------------------|
| **GĐ 1: Pilot** | Tuần 1-4 | Triển khai Dashboard, Quản lý Dự án, Hợp đồng, Thanh toán cho 1 Ban thí điểm | Xác nhận phần mềm phù hợp nghiệp vụ |
| **GĐ 2: Mở rộng** | Tuần 5-8 | Mở cho 5 Ban, kích hoạt BIM, CDE, AI modules, đào tạo người dùng | Toàn bộ Ban QLDA sử dụng hệ thống |
| **GĐ 3: Tối ưu** | Tuần 9-12 | Thu thập feedback, tối ưu AI, bổ sung báo cáo, kết nối CSDL quốc gia | Hệ thống ổn định, sẵn sàng vận hành lâu dài |

### Hỗ trợ sau triển khai

| Hạng mục | Cam kết |
|----------|---------|
| Đào tạo | Đào tạo trực tiếp cho từng nhóm vai trò, tài liệu hướng dẫn |
| Hỗ trợ kỹ thuật | Hotline + email hỗ trợ trong giờ hành chính |
| Bảo trì | Cập nhật phần mềm, sửa lỗi, nâng cấp tính năng |
| Backup | Sao lưu dữ liệu tự động hàng ngày |
| Mở rộng | Sẵn sàng tích hợp thêm module theo yêu cầu |

---

## KẾT LUẬN

*Tóm lại, hệ thống Quản lý Dự án Đầu tư Xây dựng mà chúng tôi trình bày hôm nay là một giải pháp toàn diện, được thiết kế riêng cho Ban QLDA ĐTXD các công trình Dân dụng và Công nghiệp. Với 15 module chức năng, 9 module AI, BIM 3D Viewer và CDE theo chuẩn ISO 19650 — hệ thống sẵn sàng đưa Ban QLDA bước vào kỷ nguyên số, nâng cao hiệu quả quản lý và đáp ứng yêu cầu ngày càng cao của pháp luật cũng như thực tiễn.*

*Xin trân trọng cảm ơn quý Ban đã lắng nghe.*

---

## THÔNG TIN LIÊN HỆ

| | |
|---|---|
| **Đơn vị phát triển** | CIC Technology and Consultancy JSC |
| **Website** | https://www.cic.com.vn |
| **Email hỗ trợ** | anhnq@cic.com.vn |
| **Phiên bản** | 3.0 |
| **Ngày cập nhật** | 17/03/2026 |

---

*Ban QLDA ĐTXD DDCN — UBND TP. Ho Chi Minh. Ban quyen thuoc ve CIC Technology and Consultancy JSC.*
