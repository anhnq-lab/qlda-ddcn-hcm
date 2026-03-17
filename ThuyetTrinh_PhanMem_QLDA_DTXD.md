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

*Với 5 trụ cột vừa trình bày, giờ đây cho phép em giới thiệu tổng quan hệ thống mà chúng tôi đã xây dựng — một nền tảng sẵn sàng để quý Ban có thể sử dụng ngay. Trước hết, xin tóm tắt qua một số con số quan trọng:*

### Các chỉ số chính

| Chỉ số | Giá trị | Ghi chú |
|--------|---------|---------|
| Module chức năng | **15+** | Phủ toàn bộ quy trình QLDA |
| Quy mô người dùng | **200+** | Sẵn sàng cho 200 người dùng đồng thời |
| Ban QLDA trực thuộc | **5** | Ban 1 đến Ban 5 |
| BIM 3D Viewer | **IFC** | Xem mô hình 3D trong trình duyệt, cache thông minh |
| CDE (ISO 19650) | **4 vùng dữ liệu** | Môi trường dữ liệu chung: WIP, SHARED, PUBLISHED, ARCHIVED |
| AI tích hợp | **9 module AI** | Gemini: tóm tắt, dự báo, phát hiện bất thường, soạn văn bản, chấm điểm nhà thầu |
| Bảo mật | **RBAC + RLS** | 148 chính sách bảo mật, 6 lớp phân quyền |

### Điểm nổi bật

- Dashboard realtime với 5 KPI chính, biểu đồ giải ngân theo tháng, bản đồ vị trí dự án
- Quản lý toàn bộ vòng đời dự án: **Chuẩn bị, Thực hiện, Kết thúc xây dựng**
- **9 module AI**: tóm tắt dự án, dự báo giải ngân, phát hiện bất thường, kiểm tra tuân thủ, soạn văn bản, chấm điểm nhà thầu, đánh giá rủi ro, tối ưu nguồn lực, phê duyệt thông minh
- BIM 3D Viewer — xem mô hình công trình trực tiếp trong trình duyệt, cache thông minh không cần tải lại
- CDE tuân thủ ISO 19650 — workflow duyệt tài liệu chuyên nghiệp
- AI Summary tự động phân tích dữ liệu, phát hiện bất thường mà con người có thể bỏ sót
- Tất cả biểu đồ đều phản ánh dữ liệu thực tế theo thời gian thực
- AI Report — xuất báo cáo giám sát hàng tháng bằng AI, xuất DOCX chuyên nghiệp

---

## 3. CÁC MODULE CHỨC NĂNG

*Hệ thống bao gồm 15 module, bao phủ toàn bộ quy trình quản lý dự án đầu tư xây dựng từ khâu lập kế hoạch vốn, tuân thủ pháp lý, đến gói thầu và nghiệm thu. Mỗi module đều gắn liền với nghiệp vụ thực tế của Ban. Em xin lần lượt trình bày:*

### 3.1. Dashboard — Trung tâm Điều hành

*Đây là trang đầu tiên khi đăng nhập — nơi lãnh đạo có thể nắm bắt toàn bộ tình hình chỉ trong 30 giây:*

| Tính năng | Mô tả | Ý nghĩa |
|-----------|-------|---------|
| KPI Cards | 5 chỉ số chính: Tổng dự án, Đang triển khai, Tổng vốn, Giải ngân, Cảnh báo | Nắm bắt tổng quan ngay lập tức |
| Biểu đồ giải ngân | Theo dõi kế hoạch vs thực tế theo từng tháng | Phát hiện sớm tình trạng chậm giải ngân |
| Bản đồ dự án | Vị trí các dự án trên bản đồ, phân loại giai đoạn bằng màu | Trực quan hóa phân bố dự án trên địa bàn |
| Cảnh báo realtime | Danh sách vấn đề quan trọng, phân loại mức độ nghiêm trọng | Cảnh báo sớm để xử lý kịp thời |
| AI Summary | Tóm tắt tình hình tổng thể bằng AI, đánh giá rủi ro tự động | Giảm tải phân tích cho cán bộ |

### 3.2. Quản lý Dự án — Trang danh sách

*Từ Dashboard tổng quan, khi muốn xem chi tiết, người dùng chuyển sang trang Danh sách Dự án:*

| Tính năng | Mô tả | Ý nghĩa |
|-----------|-------|---------|
| Danh sách dự án | Hiển thị tên, trạng thái, giai đoạn, Ban quản lý, tổng vốn | Nắm bắt tình trạng ngay tại trang danh sách |
| Tìm kiếm và lọc | Lọc theo trạng thái, giai đoạn, loại, Ban quản lý | Tìm nhanh trong hàng trăm dự án |
| Phân loại giai đoạn | 3 giai đoạn: Chuẩn bị, Thực hiện, Kết thúc (theo NĐ 175/2024) | Theo dõi trực quan dự án đang ở giai đoạn nào |
| Phân quyền theo Ban | Mỗi Ban QLDA chỉ thấy dữ liệu thuộc phạm vi quản lý | Đảm bảo phân quyền tự động |

### 3.3. Chi tiết Dự án — 8 Tab nghiệp vụ

*Khi bấm vào một dự án cụ thể, hệ thống hiển thị giao diện chi tiết với 8 tab chuyên biệt — mỗi tab phục vụ một mảng nghiệp vụ riêng (BIM đã được tách thành module riêng):*

| Tab | Chức năng | Ý nghĩa |
|-----|----------|---------|
| Tab Thông tin chung | Tổng quan dự án: chủ đầu tư, Ban QL, địa chỉ, tổng vốn, trạng thái, AI Summary | Cái nhìn tổng thể, AI tự động phân tích |
| Tab Kế hoạch | Quản lý giai đoạn, bước thực hiện, theo dõi tiến độ, Gantt chart | Kiểm soát tiến độ từng bước, cảnh báo chậm trễ |
| Tab Vốn & Giải ngân | Cơ cấu nguồn vốn, kế hoạch giải ngân, AI dự báo xu hướng | Kiểm soát tài chính chặt chẽ |
| Tab Gói thầu | Danh sách gói thầu, hình thức lựa chọn, nhà thầu trúng thầu | Quản lý đấu thầu minh bạch |
| Tab Tuân thủ | Thủ tục pháp lý bắt buộc, AI cảnh báo thiếu hồ sơ | Sẵn sàng khi thanh tra |
| Tab Hồ sơ & Pháp lý | Upload/download hồ sơ, preview, **AI Soạn văn bản** | AI hỗ trợ soạn văn bản pháp lý tự động |
| Tab Vận hành | Nghiệm thu, bàn giao, quyết toán, bảo hành | Quản lý giai đoạn kết thúc dự án |
| Tab Công việc | Quản lý task Kanban, giao việc cho cá nhân | Tăng trách nhiệm cá nhân |

*Bây giờ, em xin đi sâu vào một số module quan trọng. Đầu tiên là BIM 3D Viewer — module riêng cho phép anh chị có thể xem trực tiếp mô hình 3D của công trình mà không cần cài bất kỳ phần mềm nào:*

### 3.4. BIM 3D Viewer

| Tính năng | Mô tả |
|-----------|-------|
| Upload & Render IFC | Tải lên file IFC, tự động render mô hình 3D, **cache thông minh** không cần tải lại |
| Model Tree | Cây phân cấp cấu kiện theo tầng/loại, bật/tắt hiển thị nhóm, tìm kiếm |
| Properties Panel | Thuộc tính chi tiết cấu kiện: vật liệu, kích thước, tham số kỹ thuật (30+ trường) |
| Section Plane | Cắt mặt cắt ngang/dọc qua mô hình để xem bên trong, điều chỉnh realtime |
| Spatial Tree | Phân cấp không gian: Site, Building, Storey, Element |
| Camera Presets | Chế độ xem: phối cảnh, orthographic, mặt trước/sau/trái/phải |
| Cache thông minh | File IFC được cache — chuyển qua lại giữa các mô hình không cần tải lại |

*Với BIM Viewer, Ban QLDA có thể giám sát trực quan mô hình 3D ngay trên máy tính, không phụ thuộc vào phần mềm chuyên dụng đắt tiền. Module này tuân thủ tiêu chuẩn IFC — chuẩn mở toàn cầu cho trao đổi dữ liệu BIM.*

*Song song với BIM, hệ thống còn tích hợp CDE — Môi trường Dữ liệu Chung — nơi quản lý tập trung toàn bộ tài liệu dự án theo chuẩn ISO 19650:*

### 3.5. CDE — Môi trường Dữ liệu Chung (ISO 19650)

| Tính năng | Mô tả |
|-----------|-------|
| Folder Tree | Cấu trúc thư mục phân cấp: WIP, SHARED, PUBLISHED, ARCHIVED |
| Upload & Drag-drop | Kéo thả file, hỗ trợ đa định dạng (PDF, DWG, IFC, DOC, XLS...) |
| Workflow duyệt | Submit, Review, Approve theo trạng thái tài liệu |
| Revision History | Lịch sử phiên bản đầy đủ, so sánh giữa các phiên bản |
| Transmittal | Tạo phiếu gửi tài liệu chính thức giữa các bên |
| Permission Manager | Phân quyền truy cập theo tổ chức, vai trò — nhóm Ban, nhà thầu |
| Audit Log | Ghi lại mọi thao tác: ai tải, ai sửa, ai duyệt |
| Comment Thread | Bình luận trực tiếp trên tài liệu, trao đổi giữa các bên |
| Contractor Dashboard | Trang tổng quan riêng cho nhà thầu, chỉ thấy tài liệu được phân quyền |

*CDE đảm bảo mọi tài liệu đều có quy trình duyệt rõ ràng, truy xuất nguồn gốc được mọi thao tác. Đây là yêu cầu bắt buộc khi triển khai BIM theo chuẩn quốc tế.*

*Tiếp theo là các module quản lý tài chính — hợp đồng và thanh toán, hai phần không thể thiếu trong bất kỳ dự án đầu tư xây dựng nào:*

### 3.6. Quản lý Hợp đồng

**Mục tiêu:** Kiểm soát chặt chẽ toàn bộ vòng đời hợp đồng từ ký kết đến thanh lý — liên kết trực tiếp với dự án và nhà thầu tương ứng.

| Tính năng | Mô tả |
|-----------|-------|
| Danh sách hợp đồng | Tổng quan: số HĐ, nhà thầu, giá trị, trạng thái, tiến độ thanh toán |
| Chi tiết hợp đồng | Thông tin đầy đủ: loại HĐ, ngày ký, thời hạn, giá trị, điều khoản |
| Phụ lục hợp đồng | Quản lý phụ lục, gia hạn, điều chỉnh giá trị |
| Liên kết dự án & gói thầu | Tự động liên kết với dự án gốc, gói thầu tương ứng |
| Theo dõi thanh toán | Tiến độ thanh toán theo đợt, so sánh với giá trị hợp đồng |

### 3.7. Quản lý Thanh toán

| Tính năng | Mô tả |
|-----------|-------|
| Danh sách thanh toán | Tổng hợp theo hợp đồng, đợt thanh toán, số tiền, trạng thái |
| Tạo đợt thanh toán | Ghi nhận: số tiền, ngày thanh toán, hồ sơ đính kèm |
| Tiến độ thanh toán | Phần trăm đã thanh toán so với tổng giá trị hợp đồng |
| Báo cáo tài chính | Tổng hợp theo dự án, theo Ban, theo kỳ |

*Hợp đồng và thanh toán được liên kết chặt chẽ — mỗi đợt thanh toán đều gắn với hợp đồng cụ thể, giúp đối soát chính xác và truy xuất nhanh khi thanh tra, kiểm toán.*

*Bên cạnh quản lý tài chính, hệ thống còn hỗ trợ điều phối công việc hàng ngày cho toàn bộ đội ngũ:*

### 3.8. Quản lý Công việc (Task Management)

| Tính năng | Mô tả |
|-----------|-------|
| Kanban Board | Bảng công việc trực quan: Chờ xử lý, Đang làm, Hoàn thành |
| Giao việc | Phân công cho cá nhân, đặt deadline, mức ưu tiên |
| Theo dõi tiến độ | Trạng thái cập nhật liên tục, thông báo khi quá hạn |
| Liên kết dự án | Mỗi task gắn với dự án cụ thể |
| Thống kê cá nhân | Tổng quan công việc đang xử lý, hoàn thành |

*Quản lý công việc theo Kanban — thay thế việc giao việc qua lời nói, email rời rạc. Mỗi công việc có người chịu trách nhiệm, deadline rõ ràng và trạng thái cập nhật liên tục.*

*Ngoài quản lý dự án và tài chính, một hệ thống QLDA hoàn chỉnh không thể thiếu yếu tố con người. Hệ thống cung cấp module quản lý nhân sự và nhà thầu:*

### 3.9. Quản lý Nhà thầu

*Hệ thống xây dựng cơ sở dữ liệu nhà thầu tập trung — đánh giá năng lực, theo dõi lịch sử, AI chấm điểm tự động:*

| Tính năng | Mô tả |
|-----------|-------|
| Danh sách nhà thầu | Thông tin: tên, loại hình, năng lực, lịch sử hợp đồng |
| Hồ sơ năng lực | Kinh nghiệm, dự án đã thực hiện, đánh giá |
| AI Chấm điểm | Tự động chấm điểm năng lực dựa trên lịch sử, đánh giá |
| Liên kết gói thầu | Theo dõi nhà thầu đang phụ trách dự án nào |

### 3.10. Quản lý Nhân sự & Tổ chức

| Tính năng | Mô tả |
|-----------|-------|
| Danh sách cán bộ | Thông tin: họ tên, chức vụ, Ban, email, số điện thoại |
| Phân công dự án | Cán bộ đang phụ trách dự án nào, năng lực chuyên môn |
| Sơ đồ tổ chức | Mô hình phân cấp theo Ban QLDA (Ban 1-5) |

*Tiếp theo là nhóm module chức năng hỗ trợ nghiệp vụ — hồ sơ tài liệu, văn bản pháp luật, báo cáo và quản trị hệ thống:*

### 3.11. Hồ sơ & Tài liệu

*Khác với CDE dành cho tài liệu BIM/thiết kế, module Hồ sơ & Tài liệu là kho lưu trữ số — phân loại theo dự án, giai đoạn, loại tài liệu:*

| Tính năng | Mô tả |
|-----------|-------|
| Upload & Download | Tải lên/tải xuống, hỗ trợ đa định dạng |
| Phân loại | Theo dự án, giai đoạn, loại hồ sơ |
| Preview | Xem trước PDF, hình ảnh, các định dạng phổ biến |
| AI Soạn văn bản | AI hỗ trợ soạn văn bản pháp lý: công văn, quyết định, báo cáo |

### 3.12. Văn bản Pháp luật

| Tính năng | Mô tả |
|-----------|-------|
| Tìm kiếm | Theo số hiệu, tên, cơ quan ban hành, lĩnh vực |
| Cơ sở dữ liệu | Luật ĐTC 58/2024, Luật XD, NĐ 175/2024, NĐ 214/2025, TT24/2025... |
| Liên kết dự án | Gắn văn bản áp dụng trực tiếp vào từng dự án |

### 3.13. Báo cáo

| Tính năng | Mô tả |
|-----------|-------|
| Báo cáo tổng hợp | Tổng hợp tiến độ, tài chính, nhân sự toàn bộ danh mục |
| Xuất báo cáo | Excel, PDF theo mẫu Bộ XD, UBND TP.HCM |
| Biểu mẫu KHLCNT | Xuất kế hoạch lựa chọn nhà thầu theo mẫu quy định |
| AI Report | Xuất báo cáo giám sát hàng tháng do AI soạn, xuất DOCX chuyên nghiệp |

### 3.14. Quản trị Hệ thống

| Tính năng | Mô tả |
|-----------|-------|
| Quản lý tài khoản | Tạo, sửa, vô hiệu hóa tài khoản; gán vai trò |
| Phân quyền RBAC | Phân quyền theo tài nguyên x hành động (xem/sửa/xóa/duyệt) |
| Audit Log | Ghi nhận mọi thao tác: đăng nhập, sửa dữ liệu, duyệt tài liệu |
| Impersonation | Admin xem hệ thống dưới góc nhìn người dùng khác |
| Cài đặt | Dark/Light mode, ngôn ngữ, thông báo, tùy chỉnh giao diện |

### 3.15. Module AI — Trí tuệ Nhân tạo

*Và đây là module em muốn nhấn mạnh đặc biệt — 9 module AI được tích hợp xuyên suốt hệ thống, sử dụng mô hình Gemini của Google:*

| # | Module AI | Chức năng | Ví dụ ứng dụng |
|---|----------|----------|----------------|
| 1 | **AI Summary** | Tóm tắt tình hình dự án tự động | "Dự án X chậm 15% so với kế hoạch, cần bổ sung 2 hồ sơ" |
| 2 | **AI Forecast** | Dự báo xu hướng giải ngân, tiến độ | Biểu đồ dự báo 3 tháng tới, cảnh báo vượt dự toán |
| 3 | **AI Anomaly Detector** | Phát hiện bất thường trong dữ liệu | Phát hiện giải ngân đột biến, tiến độ bất thường |
| 4 | **AI Compliance Checker** | Kiểm tra tuân thủ pháp lý tự động | Cảnh báo thiếu hồ sơ bắt buộc theo NĐ 175/2024 |
| 5 | **AI Document Drafter** | Soạn văn bản pháp lý tự động | Soạn công văn, quyết định, biên bản từ dữ liệu dự án |
| 6 | **AI Contractor Scoring** | Chấm điểm năng lực nhà thầu | Đánh giá dựa trên lịch sử, năng lực, chất lượng, tuân thủ |
| 7 | **AI Risk Analyzer** | Đánh giá rủi ro dự án | Phân tích đa chiều: tiến độ, tài chính, pháp lý, kỹ thuật |
| 8 | **AI Resource Optimizer** | Tối ưu phân bổ nguồn lực | Gợi ý phân công cán bộ, điều phối giữa các Ban |
| 9 | **AI Smart Approval** | Hỗ trợ phê duyệt thông minh | Phân tích hồ sơ, đề xuất phê duyệt/từ chối kèm lý do |

---

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
