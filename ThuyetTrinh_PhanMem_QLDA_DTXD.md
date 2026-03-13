# HỆ THỐNG QUẢN LÝ DỰ ÁN ĐẦU TƯ XÂY DỰNG

**Ban QLDA ĐTXD các công trình Dân dụng và Công nghiệp — UBND TP. Hồ Chí Minh**

Phiên bản 1.0 • 12/03/2026 • CIC Technology and Consultancy JSC

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

*Kính thưa quý Ban lãnh đạo, trước khi đi vào chi tiết phần mềm, cho phép tôi trình bày bối cảnh vì sao chúng ta cần một hệ thống quản lý dự án số hóa tại thời điểm này.*

### Cuộc Cách mạng Công nghiệp và xu thế Chuyển đổi số

*Nhìn lại lịch sử, nhân loại đã trải qua 4 cuộc cách mạng công nghiệp lớn. Mỗi cuộc cách mạng thay đổi hoàn toàn cách chúng ta làm việc — và cuộc cách mạng lần thứ 4 đang diễn ra ngay lúc này:*

Lịch sử phát triển loài người đã trải qua **4 cuộc cách mạng công nghiệp**, mỗi cuộc cách mạng đánh dấu bước ngoặt trong cách con người sản xuất, quản lý và vận hành:

| Giai đoạn | Thời kỳ | Đặc trưng | Động lực chính | Ý nghĩa |
|-----------|---------|-----------|----------------|----------|
| **Cách mạng 1.0** | Cuối thế kỷ 18 | Cơ giới hóa | Máy hơi nước, dệt cơ khí | Thay thế sức lao động thủ công bằng máy móc, năng suất tăng gấp nhiều lần |
| **Cách mạng 2.0** | Cuối thế kỷ 19 | Sản xuất hàng loạt | Điện khí hóa, dây chuyền lắp ráp | Sản xuất quy mô lớn, hạ giá thành, hình thành nền công nghiệp hiện đại |
| **Cách mạng 3.0** | Giữa thế kỷ 20 | Tự động hóa | Máy tính, điện tử, Internet | Tự động hóa sản xuất, kết nối toàn cầu, nền kinh tế tri thức |
| **Cách mạng 4.0** | Hiện tại | Số hóa toàn diện | AI, IoT, Big Data, Cloud, BIM | Dữ liệu trở thành tài sản, ra quyết định bằng AI, quản lý thông minh |

*Vậy Cách mạng 4.0 có ý nghĩa gì đối với ngành xây dựng? Câu trả lời nằm ở một từ: **dữ liệu**. Tổ chức nào làm chủ dữ liệu sớm — tổ chức đó sẽ quản lý hiệu quả hơn, minh bạch hơn và tiết kiệm nguồn lực hơn.*

Hiện nay, chúng ta đang ở giữa **Cuộc Cách mạng Công nghiệp lần thứ 4 (Industry 4.0)** — nơi **dữ liệu trở thành tài sản cốt lõi**. Trong lĩnh vực xây dựng và quản lý dự án đầu tư công, điều này có nghĩa:

- **Dữ liệu là trung tâm** — Ai nắm dữ liệu chính xác, kịp thời sẽ ra quyết định đúng đắn
- **Số hóa quy trình** — Chuyển từ quản lý giấy tờ, Excel sang nền tảng số tập trung
- **Kết nối thông minh** — Các hệ thống được liên kết: BIM, AI, IoT, CSDL quốc gia
- **Ra quyết định dựa trên dữ liệu** — Thay vì cảm tính, lãnh đạo có dashboard realtime với KPI chính xác

*Trong bối cảnh đó, Đảng và Nhà nước đã ban hành hàng loạt chính sách, pháp luật quan trọng — tạo nền tảng pháp lý vững chắc cho việc chuyển đổi số trong lĩnh vực xây dựng.*

### Căn cứ Pháp lý

#### Về quản lý dự án đầu tư xây dựng

*Trước hết, về khung pháp lý quản lý dự án — trong vòng 2 năm qua, hàng loạt luật và nghị định quan trọng đã được ban hành hoặc sửa đổi:*

- **Luật Đầu tư công số 58/2024/QH15** — Quy định quản lý, sử dụng vốn đầu tư công (thay thế Luật 39/2019)
- **Luật Xây dựng số 135/2025/QH15** — Quy định về hoạt động xây dựng, quản lý dự án ĐTXD, chuyển đổi số và BIM
- **Luật Đấu thầu số 22/2023/QH15** — Quy định về lựa chọn nhà thầu, nhà đầu tư
- **Nghị định 175/2024/NĐ-CP** — Hướng dẫn thi hành Luật Xây dựng
- **Nghị định 214/2025/NĐ-CP** — Hướng dẫn thi hành Luật Đấu thầu

#### Về chuyển đổi số và cơ sở dữ liệu

*Bên cạnh đó, về mặt chuyển đổi số, Chính phủ cũng đã có hành lang pháp lý rõ ràng — đặc biệt là Nghị định 111 về CSDL quốc gia xây dựng và Nghị quyết 57 của Bộ Chính trị:*

- **Luật Giao dịch điện tử số 20/2023/QH15** — Công nhận giá trị pháp lý của dữ liệu điện tử
- **Nghị định 111/2024/NĐ-CP** — Cơ sở dữ liệu quốc gia về hoạt động xây dựng
- **Quyết định 749/QĐ-TTg** — Chương trình Chuyển đổi số quốc gia đến năm 2025, định hướng đến 2030
- **Quyết định 2289/QĐ-TTg** — Chiến lược quốc gia về Cách mạng công nghiệp lần thứ 4
- **Nghị quyết 52-NQ/TW** — Chủ trương, chính sách chủ động tham gia Cách mạng công nghiệp 4.0
- **Nghị quyết 57-NQ/TW** (ngày 22/12/2024) — Đột phá phát triển khoa học, công nghệ, đổi mới sáng tạo và chuyển đổi số quốc gia
- **Thông tư 24/2025/TT-BXD** — Hướng dẫn khoản 4 Điều 8 NĐ 111/2024: thông tin chi tiết trong hệ thống CSDL quốc gia về hoạt động xây dựng (quy hoạch, dự án ĐTXD, mã số thông tin, biểu mẫu dữ liệu mở)

*Pháp luật đã có, định hướng đã rõ ràng. Vậy thực trạng quản lý dự án hiện nay của chúng ta đang gặp những thách thức gì? Xin thẳng thắn nhìn nhận 5 vấn đề cốt lõi:*

### Thách thức hiện tại

- **Quản lý phân tán** — dữ liệu nằm rải rác trên Excel, email, giấy tờ, khó tổng hợp
- **Thiếu minh bạch tiến độ** — lãnh đạo không theo dõi được realtime, phải chờ báo cáo định kỳ
- **Báo cáo thủ công** — tốn thời gian tổng hợp, dễ sai sót, không đồng bộ giữa các Ban
- **Rủi ro pháp lý** — nhiều luật mới ban hành (Luật ĐTC 2024, Luật XD 2020, Luật Đấu thầu 2023), khó theo dõi tuân thủ
- **Chưa đáp ứng yêu cầu CĐS** — chưa kết nối CSDL quốc gia (NĐ 111/2024), chưa ứng dụng BIM, AI, chưa có Môi trường dữ liệu chung (CDE) theo ISO 19650

*Đứng trước những thách thức đó, hệ thống QLDA ĐTXD được xây dựng như một giải pháp toàn diện, giải quyết triệt để từng vấn đề. Xin trình bày 5 trụ cột chính của giải pháp:*

### Giải pháp

- **Nền tảng tập trung** — tất cả dữ liệu dự án, hợp đồng, thanh toán, tài liệu trên một hệ thống duy nhất
- **Dashboard thời gian thực** — KPI, biểu đồ, bản đồ cập nhật tức thì, lãnh đạo nắm bắt mọi lúc
- **Tự động hóa báo cáo** — xuất biểu mẫu theo TT24/2025/TT-BXD, Luật ĐTC bằng 1 click
- **Tuân thủ pháp luật** — checklist tích hợp sẵn, cảnh báo tự động khi thiếu hồ sơ pháp lý
- **Sẵn sàng cho 4.0** — tích hợp BIM, AI, kết nối CSDL quốc gia theo NĐ 111/2024

*Với 5 trụ cột đó, chúng ta hãy cùng xem hệ thống được thiết kế cụ thể như thế nào. Xin mời quý Ban xem phần Tổng quan Hệ thống.*

---

## 2. TỔNG QUAN HỆ THỐNG

*Sau khi hiểu rõ bối cảnh và mục tiêu, bây giờ cho phép tôi giới thiệu tổng quan về hệ thống. Đây là một nền tảng web hiện đại, không cần cài đặt — chỉ cần mở trình duyệt là có thể sử dụng ngay. Trước hết, xin tóm tắt hệ thống qua một số chỉ số quan trọng:*

### Các chỉ số chính

| Chỉ số | Giá trị | Ghi chú |
|--------|---------|---------|
| Module chức năng | **13+** | Phủ toàn bộ quy trình QLDA |
| Ban QLDA trực thuộc | **5** | Ban 1 → Ban 5 |
| BIM 3D Viewer | **IFC** | Xem mô hình 3D trong trình duyệt |
| AI tích hợp | **Gemini** | Tóm tắt, phát hiện bất thường |
| Bảo mật | **RBAC + RLS** | Phân quyền chi tiết theo vai trò |

### Điểm nổi bật

- 📊 Dashboard realtime với 5 KPI chính, biểu đồ giải ngân theo tháng, bản đồ vị trí dự án
- 🏗️ Quản lý toàn bộ vòng đời dự án: **Chuẩn bị → Thực hiện → Kết thúc xây dựng**
- 🤖 AI tóm tắt tình hình dự án, phát hiện bất thường, chấm điểm nhà thầu tự động
- 🏢 BIM 3D Viewer — xem mô hình công trình trực tiếp trong trình duyệt, không cần cài phần mềm chuyên dụng
- 📋 CDE — Môi trường dữ liệu chung theo ISO 19650, workflow duyệt tài liệu chuyên nghiệp

---

## 3. CÁC MODULE CHỨC NĂNG

*Bây giờ, xin phép đi vào phần quan trọng nhất — chi tiết từng module chức năng. Hệ thống gồm 13 module, bao phủ toàn bộ quy trình quản lý dự án đầu tư xây dựng từ khâu lập kế hoạch đến kết thúc nghiệm thu.*

### 3.1. Tổng quan (Dashboard)

> Trung tâm điều hành tổng thể với KPI theo thời gian thực

**Mục tiêu:** Cung cấp cho lãnh đạo Ban QLDA cái nhìn toàn cảnh về tình hình thực hiện dự án, tài chính, tiến độ và rủi ro — thay thế hoàn toàn phương thức báo cáo định kỳ bằng giấy. Mỗi chỉ số, biểu đồ đều phản ánh dữ liệu thực tế theo thời gian thực, giúp ra quyết định nhanh chóng và chính xác. AI Summary tự động phân tích dữ liệu, phát hiện bất thường mà con người có thể bỏ sót.

| Tính năng | Mô tả | Ý nghĩa |
|-----------|-------|---------|
| Thẻ KPI thống kê | 5 chỉ số chính: Số dự án, Tổng vốn đầu tư, Giải ngân, Hợp đồng, Cảnh báo rủi ro | Lãnh đạo nắm bắt ngay sức khỏe danh mục dự án mà không cần chờ báo cáo |
| Biểu đồ phân bổ | Biểu đồ cột dự án theo Ban QLDA × giai đoạn; Donut cơ cấu vốn | So sánh quy mô, phân bổ nguồn lực giữa các Ban, phát hiện mất cân đối |
| Biểu đồ giải ngân | So sánh kế hoạch vốn và thực hiện giải ngân 12 tháng | Phát hiện sớm tình trạng chậm giải ngân, chủ động điều chỉnh kế hoạch |
| Bản đồ vị trí | Bản đồ tương tác hiển thị vị trí tất cả dự án, phân biệt giai đoạn bằng màu | Trực quan hóa phân bố dự án trên địa bàn, hỗ trợ quy hoạch và giám sát |
| Cảnh báo rủi ro | Công việc quá hạn, vấn đề pháp lý, GPMB — phân loại mức độ nghiêm trọng | Cảnh báo sớm để xử lý kịp thời, tránh vi phạm pháp luật và chậm tiến độ |
| Bộ lọc thông minh | Lọc theo dự án, năm, Ban QLDA — tự động cập nhật tất cả biểu đồ | Mỗi Ban QLDA chỉ thấy dữ liệu thuộc phạm vi quản lý, đảm bảo phân quyền |
| AI Summary | Tóm tắt tình hình bằng AI, phát hiện bất thường, đánh giá rủi ro tự động | Giảm tải phân tích cho cán bộ, phát hiện vấn đề mà người khó nhận ra |
| Dashboard cá nhân | Trang tổng quan riêng cho từng người dùng với công việc được giao | Mỗi cán bộ chủ động nắm bắt công việc của mình, tăng trách nhiệm cá nhân |

*Từ Dashboard tổng quan, khi cần đi sâu vào từng dự án cụ thể, chúng ta chuyển sang module tiếp theo:*

### 3.2. Quản lý Dự án Đầu tư

> Quản lý toàn diện thông tin dự án theo Luật ĐTC 58/2024/QH15 — 8 tab chi tiết

**Mục tiêu:** Tập trung toàn bộ thông tin dự án đầu tư xây dựng vào một nơi duy nhất — từ quyết định phê duyệt, kế hoạch vốn, tuân thủ pháp lý, đến gói thầu và nghiệm thu. Mỗi tab được thiết kế theo đúng quy trình nghiệp vụ và căn cứ pháp luật hiện hành, giúp cán bộ thao tác đúng quy chuẩn ngay từ đầu.

| Tính năng | Mô tả | Ý nghĩa |
|-----------|-------|---------|
| Danh sách dự án | Hiển thị dạng thẻ (Card) với tiến độ, giai đoạn, Ban QLDA; tìm kiếm và lọc đa tiêu chí | Nhanh chóng tìm đúng dự án cần xem, nắm bắt tình trạng ngay tại trang danh sách |
| Tab Thông tin | Thông tin chung, chủ đầu tư, quyết định phê duyệt, phân loại nhóm (QN/A/B/C) | Lưu trữ đầy đủ hồ sơ pháp lý dự án, tra cứu nhanh khi cần |
| Tab Vốn & Giải ngân | Kế hoạch vốn theo Luật ĐTC 2024, theo dõi giải ngân, quyết toán | Quản lý chặt chẽ nguồn vốn, đối chiếu kế hoạch–thực hiện theo quy định |
| Tab Tuân thủ pháp lý | Checklist TT24/2025/TT-BXD, hồ sơ PCCC, môi trường, giấy phép XD | Đảm bảo không bỏ sót thủ tục pháp lý bắt buộc, giảm rủi ro vi phạm |
| Tab Tài liệu | Quản lý hồ sơ theo giai đoạn, upload/download, preview trực tiếp | Tập trung tài liệu dự án, tránh thất lạc, truy xuất nhanh khi thanh kiểm tra |
| Tab Gói thầu | Kế hoạch LCNT, đấu thầu, chỉ định thầu, tự thực hiện, đánh giá HSDT | Theo dõi toàn bộ hoạt động đấu thầu, đảm bảo tuân thủ Luật Đấu thầu |
| Tab Kế hoạch | Gantt chart, milestone, tiến độ, phân bổ nguồn lực | Kiểm soát tiến độ trực quan, phát hiện sớm công việc trễ hạn |
| Tab Vận hành | Nghiệm thu công trình, bàn giao, quyết toán, bảo hành | Quản lý giai đoạn kết thúc dự án theo đúng trình tự pháp lý |
| Vòng đời | Timeline 3 giai đoạn: Chuẩn bị → Thực hiện → Kết thúc (theo NĐ 175/2024) | Theo dõi trực quan dự án đang ở giai đoạn nào, dễ dàng báo cáo |

*Đây là một trong những tính năng đột phá nhất của hệ thống — lần đầu tiên, Ban QLDA có thể xem trực tiếp mô hình 3D của công trình mà không cần cài bất kỳ phần mềm nào:*

### 3.3. BIM 3D Viewer

> Xem mô hình BIM trực tiếp trong trình duyệt — không cần cài phần mềm

| Tính năng | Mô tả |
|-----------|-------|
| Upload & Render IFC | Tải lên file IFC, tự động render mô hình 3D |
| ViewCube & Walkthrough | Điều hướng trực quan, chế độ đi bộ trong mô hình |
| Model Tree | Cây phân cấp cấu kiện theo tầng/loại, bật/tắt hiển thị nhóm |
| Properties Panel | Xem thuộc tính chi tiết cấu kiện: vật liệu, kích thước, tham số kỹ thuật |
| Section Plane | Cắt mặt cắt ngang/dọc qua mô hình để xem bên trong |
| Measurement Tools | Đo khoảng cách, diện tích, góc trực tiếp trên mô hình 3D |
| Facility Management | Quản lý tài sản, thiết bị theo vị trí trong mô hình BIM |
| Keyboard Shortcuts | Phím tắt cho các thao tác thường dùng, tối ưu hiệu suất |

*Song song với BIM, hệ thống còn cung cấp một Môi trường dữ liệu chung — nơi tất cả các bên liên quan cùng chia sẻ và quản lý tài liệu theo chuẩn quốc tế:*

### 3.4. Môi trường Dữ liệu Chung (CDE)

> Common Data Environment theo tiêu chuẩn ISO 19650

**Mục tiêu:** Tạo một môi trường chia sẻ tài liệu chung giữa Ban QLDA, chủ đầu tư, nhà thầu và tư vấn — đảm bảo mọi bên đều làm việc trên phiên bản tài liệu mới nhất, có quy trình duyệt rõ ràng, truy xuất nguồn gốc được mọi thao tác. Đây là yêu cầu bắt buộc khi triển khai BIM theo chuẩn quốc tế.

| Tính năng | Mô tả |
|-----------|-------|
| Folder Tree | Cấu trúc thư mục phân cấp: WIP → SHARED → PUBLISHED → ARCHIVED |
| Upload & Drag-drop | Kéo thả file, hỗ trợ đa định dạng (PDF, DWG, IFC, DOC, XLS...) |
| Workflow duyệt | Submit → Review → Approve theo trạng thái tài liệu |
| Revision History | Lịch sử phiên bản đầy đủ, so sánh giữa các phiên bản |
| Transmittal | Tạo phiếu gửi tài liệu chính thức giữa các bên |
| Permission Manager | Phân quyền truy cập theo tổ chức, vai trò — nhóm Ban, nhà thầu |
| Audit Log | Ghi lại mọi thao tác: ai tải, ai sửa, ai duyệt |
| Comment Thread | Bình luận trực tiếp trên tài liệu, trao đổi giữa các bên |
| Contractor Dashboard | Trang tổng quan riêng cho nhà thầu, chỉ thấy tài liệu được phân quyền |

*Tiếp theo là các module quản lý tài chính — hợp đồng và thanh toán, hai phần không thể thiếu trong bất kỳ dự án đầu tư xây dựng nào:*

### 3.5. Quản lý Hợp đồng

> Quản lý toàn bộ vòng đời hợp đồng xây dựng

**Mục tiêu:** Kiểm soát chặt chẽ toàn bộ vòng đời hợp đồng từ ký kết đến thanh lý — liên kết trực tiếp với dự án và nhà thầu tương ứng, đảm bảo không bỏ sót phụ lục, gia hạn hay điều kiện thanh toán.

| Tính năng | Mô tả |
|-----------|-------|
| Danh sách HĐ | Tìm kiếm, lọc theo trạng thái (Đang thực hiện / Tạm dừng / Đã thanh lý) |
| Chi tiết HĐ | Số HĐ, giá trị, thời hạn, bên A/B, điều kiện thanh toán |
| Phụ lục HĐ | Quản lý phụ lục, điều chỉnh giá trị, gia hạn thời gian |
| Liên kết thanh toán | Theo dõi các đợt thanh toán liên quan, tỷ lệ giải ngân |

### 3.6. Quản lý Thanh toán

> Theo dõi thanh toán, giải ngân cho các dự án và hợp đồng

**Mục tiêu:** Minh bạch hóa toàn bộ quy trình thanh toán — từ đề nghị tạm ứng, thanh toán khối lượng đến quyết toán. So sánh kế hoạch và thực hiện giải ngân, phục vụ công tác báo cáo UBND và kiểm toán.

| Tính năng | Mô tả |
|-----------|-------|
| Danh sách thanh toán | Tất cả khoản thanh toán, lọc theo trạng thái, loại, dự án |
| Form thanh toán | Tạo đề nghị: tạm ứng, thanh toán khối lượng, quyết toán |
| Trạng thái | Chờ duyệt → Đã duyệt → Đã chuyển khoản |
| Báo cáo giải ngân | Tổng hợp theo tháng/quý/năm; so sánh kế hoạch vs thực hiện |

*Ngoài quản lý tài chính, hệ thống còn hỗ trợ điều phối công việc hàng ngày cho toàn bộ đội ngũ:*

### 3.7. Quản lý Công việc

> Quản lý và phân công công việc, theo dõi tiến độ

**Mục tiêu:** Số hóa quy trình phân công và theo dõi công việc hàng ngày theo phương pháp Kanban — thay thế việc giao việc qua lời nói, email rời rạc. Mỗi công việc có người chịu trách nhiệm, thời hạn rõ ràng và trạng thái cập nhật liên tục.

| Tính năng | Mô tả |
|-----------|-------|
| Kanban Board | Kéo thả: Todo → In Progress → Review → Done |
| Danh sách công việc | Xem dạng bảng với bộ lọc đa tiêu chí, tìm kiếm nhanh |
| Chi tiết công việc | Mô tả, ưu tiên, người giao/nhận, deadline, subtask, attachment |
| Template | 17+ mẫu công việc theo quy trình ĐTXD (Lập BCNCKT, Đấu thầu...) |
| Phụ thuộc | Thiết lập quan hệ phụ thuộc giữa các công việc |

*Để phân công công việc hiệu quả, cần nắm rõ nguồn lực con người. Hệ thống cung cấp module quản lý nhân sự và nhà thầu:*

### 3.8. Quản lý Nhân sự

> Quản lý thông tin nhân viên Ban QLDA

**Mục tiêu:** Nắm rõ nguồn nhân lực của toàn bộ 5 Ban QLDA — ai đang phụ trách dự án nào, năng lực chuyên môn ra sao, hỗ trợ phân công công việc hợp lý và lập kế hoạch đào tạo.

| Tính năng | Mô tả |
|-----------|-------|
| Danh sách nhân viên | Thông tin cá nhân, chức vụ, phòng ban, Ban QLDA |
| Chi tiết nhân viên | Hồ sơ đầy đủ, lịch sử công tác, dự án tham gia |
| Sơ đồ tổ chức | Mô hình tổ chức phân cấp theo Ban QLDA (Ban 1–5) |

### 3.9. Quản lý Nhà thầu

> Quản lý thông tin các nhà thầu, đơn vị tư vấn

**Mục tiêu:** Xây dựng cơ sở dữ liệu nhà thầu tập trung — đánh giá năng lực, theo dõi lịch sử thực hiện hợp đồng, sử dụng AI chấm điểm tự động để hỗ trợ lựa chọn nhà thầu cho các dự án tiếp theo.

| Tính năng | Mô tả |
|-----------|-------|
| Danh sách nhà thầu | Tên, mã số thuế, lĩnh vực, năng lực, hạng |
| Chi tiết nhà thầu | Hồ sơ năng lực, HĐ đã/đang thực hiện, đánh giá |
| AI Contractor Scoring | Chấm điểm nhà thầu tự động: hiệu suất, chất lượng, tuân thủ |

*Cuối cùng trong nhóm module chức năng là các công cụ hỗ trợ nghiệp vụ — hồ sơ tài liệu, văn bản pháp luật, báo cáo và quản trị hệ thống:*

### 3.10. Hồ sơ Tài liệu

> Quản lý hồ sơ, tài liệu dự án tập trung

**Mục tiêu:** Tập trung toàn bộ hồ sơ, văn bản dự án vào một kho lưu trữ số — phân loại theo dự án, giai đoạn, loại tài liệu. Thay thế việc lưu trữ trên máy cá nhân, USB, giúp truy xuất nhanh khi thanh tra, kiểm toán.

| Tính năng | Mô tả |
|-----------|-------|
| Upload & Download | Tải lên/tải xuống, hỗ trợ đa định dạng |
| Phân loại | Theo dự án, giai đoạn, loại hồ sơ |
| Preview | Xem trước PDF, hình ảnh, các định dạng phổ biến |

### 3.11. Văn bản Pháp luật

> Tra cứu văn bản quy phạm pháp luật liên quan đến ĐTXD

| Tính năng | Mô tả |
|-----------|-------|
| Tìm kiếm | Theo số hiệu, tên, cơ quan ban hành, lĩnh vực |
| Cơ sở dữ liệu | Luật ĐTC 58/2024, Luật XD, NĐ 175/2024, NĐ 214/2025, TT24/2025... |
| Liên kết dự án | Gắn văn bản áp dụng trực tiếp vào từng dự án |

### 3.12. Báo cáo

> Trung tâm báo cáo tổng hợp

| Tính năng | Mô tả |
|-----------|-------|
| Báo cáo tổng hợp | Tổng hợp tiến độ, tài chính, nhân sự toàn bộ danh mục |
| Xuất báo cáo | Excel, PDF theo mẫu Bộ XD, UBND TP.HCM |
| Biểu mẫu KHLCNT | Xuất kế hoạch lựa chọn nhà thầu theo mẫu quy định |

### 3.13. Quản trị Hệ thống

> Quản lý tài khoản, phân quyền, audit log

| Tính năng | Mô tả |
|-----------|-------|
| Quản lý tài khoản | Tạo, sửa, vô hiệu hóa tài khoản; gán vai trò |
| Phân quyền RBAC | Phân quyền theo tài nguyên × hành động (xem/sửa/xóa/duyệt) |
| Audit Log | Ghi nhận mọi thao tác: đăng nhập, sửa dữ liệu, duyệt tài liệu |
| Impersonation | Admin xem hệ thống dưới góc nhìn người dùng khác |
| Cài đặt | Dark/Light mode, ngôn ngữ, thông báo, tùy chỉnh giao diện |

---

## 4. CÔNG NGHỆ & KIẾN TRÚC

*Quý Ban có thể thắc mắc: với nhiều tính năng như vậy, hệ thống được xây dựng trên nền tảng công nghệ nào? Xin trình bày kiến trúc kỹ thuật — đây là phần đảm bảo hệ thống hoạt động ổn định, nhanh và an toàn:*

### Kiến trúc hệ thống — giải thích đơn giản

Hệ thống được xây dựng theo kiến trúc 4 tầng, mỗi tầng đảm nhận một vai trò riêng:

| Tầng | Vai trò | Giải thích dễ hiểu | Ưu điểm so với cách làm truyền thống |
|------|---------|---------------------|---------------------------------------|
| **Giao diện người dùng** | Phần mà cán bộ nhìn thấy và thao tác trên trình duyệt | Giống như mở một trang web — gõ địa chỉ, đăng nhập và sử dụng ngay. Trang chỉ cần tải một lần, sau đó chuyển đổi giữa các module rất nhanh, không cần chờ tải lại | Nhanh gấp 3–5 lần so với phần mềm web thế hệ cũ (kiểu trang phải tải lại mỗi lần nhấn) |
| **Giao diện & Biểu đồ** | Bao gồm biểu đồ, bản đồ, bảng biểu, chế độ sáng/tối | Tất cả biểu đồ giải ngân, bản đồ dự án, bảng số liệu đều hiển thị đẹp và tự co giãn theo kích thước màn hình (máy tính, máy tính bảng, điện thoại) | Giao diện linh hoạt, thiết kế riêng cho QLDA — không bị gò bó như phần mềm quản lý nước ngoài |
| **Máy chủ & Cơ sở dữ liệu** | Nơi lưu trữ toàn bộ dữ liệu dự án, tài khoản, hồ sơ | Sử dụng hệ quản trị CSDL PostgreSQL — hệ thống mã nguồn mở hàng đầu thế giới, ổn định và miễn phí bản quyền. Tự động bảo mật dữ liệu: mỗi người chỉ truy cập được phần dữ liệu thuộc phạm vi quản lý | Chi phí thấp hơn 70–80% so với mua bản quyền Oracle hoặc SQL Server; không cần đội ngũ lập trình viên riêng cho phần máy chủ |
| **Trí tuệ nhân tạo & Mô hình 3D** | AI phân tích dữ liệu, BIM hiển thị mô hình công trình | AI (Gemini của Google) tự động tóm tắt tình hình dự án, phát hiện bất thường. Mô hình 3D công trình (BIM) xem trực tiếp trên trình duyệt, không cần cài phần mềm chuyên dụng | Thay thế phần mềm BIM desktop đắt tiền (Navisworks, Autodesk BIM 360 — mỗi người dùng khoảng 12 triệu đồng/năm); AI tích hợp sẵn, không mất thêm chi phí |

### Tại sao chọn nền tảng này?

**So sánh với các giải pháp phổ biến trên thị trường:**

| Tiêu chí | Hệ thống QLDA ĐTXD | Giải pháp truyền thống (SAP, Oracle, SharePoint...) |
|----------|---------------------|------------------------------------------------------|
| **Chi phí** | **Thấp** — dùng nền tảng mã nguồn mở, không tốn phí bản quyền hàng năm | **Cao** — phí bản quyền SAP từ 2,5 tỷ đồng/năm; Oracle từ 1,2 tỷ đồng/năm |
| **Phù hợp nghiệp vụ** | Thiết kế riêng cho quản lý dự án ĐTXD theo pháp luật Việt Nam | Phần mềm quốc tế, phải tùy chỉnh rất nhiều mới phù hợp quy trình VN |
| **Xem mô hình 3D (BIM)** | Có sẵn — xem ngay trên trình duyệt | Phải mua thêm phần mềm BIM riêng (khoảng 12 triệu/người/năm) |
| **Trí tuệ nhân tạo (AI)** | Tích hợp sẵn — tóm tắt, phát hiện bất thường tự động | Chưa có hoặc phải mua thêm module |
| **Thời gian triển khai** | **12 tuần** (1 quý) | 6–18 tháng |
| **Cài đặt** | Không cần cài đặt — mở trình duyệt là dùng | Phải cài phần mềm trên từng máy, đào tạo phức tạp |
| **Tuân thủ pháp luật VN** | Đã tích hợp sẵn: Luật ĐTC, Luật XD 135, TT24, NĐ 111 | Phải thuê đơn vị tùy chỉnh thêm |

### Các đặc điểm kỹ thuật nổi bật

- **Mở là dùng ngay** — chỉ cần trình duyệt web (Chrome, Edge...), không cần cài đặt phần mềm
- **Tốc độ nhanh** — hệ thống chỉ tải phần đang dùng, giảm 60% thời gian chờ so với phần mềm thông thường
- **Dữ liệu cập nhật tức thì** — khi có người nhập liệu, tất cả các màn hình liên quan tự động cập nhật, không cần nhấn "Làm mới"
- **Hiển thị tốt trên mọi thiết bị** — máy tính bàn, laptop, máy tính bảng, điện thoại
- **Bảo mật từ gốc** — quyền truy cập được kiểm soát ngay tại tầng cơ sở dữ liệu, không thể vượt qua dù bằng cách nào

---

## 5. BẢO MẬT & PHÂN QUYỀN

*Với dữ liệu dự án đầu tư công, bảo mật là yếu tố sống còn. Hệ thống được thiết kế với 6 lớp bảo mật, đảm bảo chỉ người có quyền mới truy cập được dữ liệu tương ứng:*

| Lớp bảo mật | Mô tả |
|-------------|-------|
| 🔐 **Authentication** | Đăng nhập email/password qua Supabase Auth, phiên đăng nhập an toàn |
| 🛡️ **RBAC** | Phân quyền theo Vai trò × Tài nguyên × Hành động (xem/sửa/xóa/duyệt) |
| 🔒 **Row Level Security** | PostgreSQL RLS — mỗi truy vấn tự động lọc theo quyền người dùng |
| 📝 **Audit Trail** | Ghi nhận mọi thao tác: ai làm gì, lúc nào — không thể chối bỏ |
| 🌐 **HTTPS/TLS** | Toàn bộ kết nối được mã hóa, chứng chỉ SSL tự động |
| 👤 **Impersonation** | Admin xem hệ thống dưới góc nhìn người dùng khác để hỗ trợ |

### Bảng phân quyền Module

| STT | Module | Đường dẫn | Quyền truy cập |
|-----|--------|-----------|----------------|
| 1 | Tổng quan | `/` | dashboard |
| 2 | Dashboard cá nhân | `/my-dashboard` | Tất cả |
| 3 | Dự án đầu tư | `/projects` | projects |
| 4 | Công việc | `/tasks` | tasks |
| 5 | Nhân sự | `/employees` | employees |
| 6 | Nhà thầu | `/contractors` | contractors |
| 7 | Hợp đồng | `/contracts` | contracts |
| 8 | Thanh toán | `/payments` | payments |
| 9 | Hồ sơ tài liệu | `/documents` | documents |
| 10 | CDE | `/cde` | cde |
| 11 | Văn bản pháp luật | `/legal-documents` | legal_docs |
| 12 | Báo cáo | `/reports` | reports |
| 13 | Quy chế làm việc | `/regulations` | regulations |
| 14 | Quản lý tài khoản | `/user-accounts` | admin_accounts |
| 15 | Phân quyền | `/permissions` | admin_roles |

---

## 6. LỢI ÍCH & GIÁ TRỊ

*Vậy khi triển khai hệ thống này, Ban QLDA sẽ nhận được những lợi ích cụ thể nào? Xin trình bày các con số ước tính:*

### Các chỉ số cải thiện

| Chỉ số | Giá trị | Chi tiết |
|--------|---------|----------|
| ⏱️ Giảm thời gian lập báo cáo | **80%** | Tự động hóa biểu mẫu TT24, Luật ĐTC |
| 📊 Minh bạch tiến độ | **100%** | Realtime dashboard, bản đồ, cảnh báo |
| 🔍 Tốc độ tra cứu | **5×** | Tập trung dữ liệu, tìm kiếm thông minh |
| 💻 Cài đặt phần mềm | **0** | Web-based, truy cập mọi thiết bị |

### Giá trị bổ sung

- ✅ **Tuân thủ pháp luật** — checklist tích hợp TT24/2025, Luật ĐTC 58/2024, NĐ 175/2024
- ✅ **BIM tích hợp** — xem mô hình 3D trực tiếp trong trình duyệt, không cần phần mềm chuyên dụng
- ✅ **AI thông minh** — tóm tắt tự động, phát hiện bất thường, tối ưu nguồn lực
- ✅ **Phạm vi dự án** — lọc dữ liệu theo Ban QLDA, đảm bảo mỗi Ban chỉ thấy dự án mình quản lý

---

## 7. LỘ TRÌNH TRIỂN KHAI

*Toàn bộ việc triển khai được gói gọn trong **1 quý (Q2/2026)** — 12 tuần chia thành 4 giai đoạn liên tiếp, đảm bảo nhanh chóng đưa hệ thống vào vận hành:*

### Tuần 1–2: Thiết lập nền tảng & Nhập dữ liệu

- Cài đặt hạ tầng, cấu hình hệ thống, phân quyền RBAC
- Nhập dữ liệu dự án, nhân sự, nhà thầu, hợp đồng hiện có
- Dashboard tổng quan & Quản trị hệ thống

### Tuần 3–6: Triển khai toàn bộ Module nghiệp vụ

- Quản lý Dự án đầu tư (8 tab chi tiết)
- Hợp đồng, Thanh toán, Công việc (Kanban)
- CDE — Môi trường dữ liệu chung
- BIM 3D Viewer, Hồ sơ tài liệu, Văn bản pháp luật

### Tuần 7–10: Tính năng nâng cao & Tích hợp

- AI Analytics (Gemini API) — tóm tắt, phát hiện bất thường
- Báo cáo & Biểu mẫu theo TT24/2025
- Kết nối CSDL Quốc gia (NĐ 111/2024)
- Tối ưu responsive cho tablet, mobile

### Tuần 11–12: Đào tạo & Go-live

- Đào tạo người dùng toàn bộ 5 Ban QLDA
- Chạy song song (hệ thống cũ + mới), kiểm tra dữ liệu
- Nghiệm thu & chính thức đưa vào vận hành

---

*Kính thưa quý Ban, trên đây là toàn bộ nội dung giới thiệu về Hệ thống Quản lý Dự án Đầu tư Xây dựng. Chúng tôi tin rằng đây là giải pháp phù hợp để Ban QLDA ĐTXD DDCN bước vào kỷ nguyên số, nâng cao hiệu quả quản lý và đáp ứng yêu cầu ngày càng cao của pháp luật cũng như thực tiễn. Xin trân trọng cảm ơn quý Ban đã lắng nghe.*

## THÔNG TIN LIÊN HỆ

| | |
|---|---|
| **Đơn vị phát triển** | CIC Technology and Consultancy JSC |
| **Website** | https://www.cic.com.vn |
| **Email hỗ trợ** | anhnq@cic.com.vn |
| **Phiên bản** | 1.0 |
| **Ngày phát hành** | 12/03/2026 |

---

*© 2026 Ban QLDA ĐTXD DDCN — UBND TP. Hồ Chí Minh. Bản quyền thuộc về CIC Technology and Consultancy JSC.*
