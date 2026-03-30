# 📊 Kịch bản Thuyết trình Phần mềm CIC-QLDA 2026
**Khách hàng:** Ban QLDA ĐĐCN TP.HCM  
**Thời lượng dự kiến:** 15 - 20 phút

---

## Slide 1: Tiêu đề & Giới thiệu
* **Tiêu đề Slide:** Đề xuất Giải pháp Chuyển đổi số Toàn diện Quản lý Dự án Đầu tư Xây dựng (CIC-QLDA)
* **Kính gửi:** Ban Giám đốc Ban QLDA ĐĐCN TP.HCM
* **Đơn vị tư vấn:** Công ty Cổ phần Tin học và Kiểm định Xây dựng (CIC)
* **Thông điệp cốt lõi:** Nâng tầm quản trị dự án, tối ưu giải ngân nguồn vốn và tự động hóa quy trình với lõi công nghệ Trí tuệ nhân tạo (AI) & BIM.

---

## Slide 2: Vấn đề & Tầm nhìn chuyển đổi số
* **Thách thức hiện tại:**
  - Khối lượng dự án dàn trải, ngân sách lớn nhưng việc theo dõi giải ngân đôi khi còn độ trễ.
  - Quy trình quản lý hồ sơ, thủ tục pháp lý qua nhiều phòng ban còn thực hiện thủ công, rủi ro sai sót theo Nghị định & Thông tư.
  - Khó khăn trong việc kiểm soát tiến độ tổng thể và cảnh báo sớm các rủi ro dự án.
* **Tầm nhìn CIC-QLDA:** Xây dựng một "Trung tâm điều hành số" duy nhất. Giúp Ban Giám đốc nắm bắt số liệu realtime (thực tế), và giúp chuyên viên giảm tới 50% thời gian làm báo cáo, thủ tục thông qua trợ lý AI.

---

## Slide 3: Kiến trúc Giải pháp CIC-QLDA (12 Phân hệ cốt lõi)
*(Trình bày sơ đồ hệ thống với 12 khối)*
* **Nhóm Điều hành & Quản lý:** 
  1. Dashboard chỉ huy (Cảnh báo rủi ro & KPI tự động)
  2. Quản lý Dự án (Theo dõi WBS chuẩn Nghị định 175)
* **Nhóm Tài chính & Đấu thầu:** 
  3. Quản lý Đấu thầu & Hợp đồng
  4. Theo dõi Kế hoạch Vốn & Giải ngân theo tháng
* **Nhóm Kỹ thuật & Môi trường dữ liệu chung:**
  5. Môi trường dữ liệu chung CDE (Chuẩn ISO 19650)
  6. BIM Viewer (Tích hợp mô hình 3D trực tiếp trên web)
* **Nhóm Nghiệp vụ bổ trợ:** Từ Quản lý Nhân sự, Nhà thầu, Giao việc, Báo cáo linh hoạt, Tra cứu Pháp luật đến Quản trị hệ thống (Phân quyền RBAC bảo mật cao).

---

## Slide 4: Điểm nhấn công nghệ #1 - Trí tuệ Nhân tạo (AI) trong QLDA
*Thay vì tự xây dựng AI tốn kém, chúng tôi tích hợp giải pháp FPT AI MaaS mang lại những tính năng đột phá:*
* **Trợ lý AI phân tích hồ sơ:** Phát hiện sai sót trong hồ sơ dự án, HSDT dựa trên AI ưu việt cho tiếng Việt.
* **Số hóa tài liệu (OCR):** Bóc tách dữ liệu từ bản vẽ, văn bản scan một cách chính xác với công nghệ DeepSeek-OCR.
* **Tìm kiếm & Tóm tắt:** Tìm kiếm ngữ nghĩa trong kho tài liệu khổng lồ của Ban, tự động tóm tắt báo cáo/hợp đồng chỉ trong vài giây.

---

## Slide 5: Điểm nhấn công nghệ #2 - Quản lý Kế hoạch & Môi trường CDE chuẩn Quốc tế
* **Quản lý theo chuẩn Nhà nước:** 
  - Tích hợp chuẩn tiến độ WBS theo Nghị định 175/NĐ-CP (3 giai đoạn, 12+ bước pháp lý).
  - Quản lý vốn bám sát Luật ĐTC 58/2024/QH15 & NĐ 99.
* **BIM & ISO 19650 (CDE):**
  - Quản lý luồng phê duyệt tài liệu nghiêm ngặt qua 5 bước (S0 → S1 → S2 → S3 → A1).
  - Trình chiếu, thao tác mô hình BIM 3D trực tiếp trên trình duyệt mà chuyên viên không cần tải, cài đặt phần mềm nặng.
  - Có cổng Portal riêng (Contractor Portal) giao tiếp minh bạch với Nhà thầu.

---

## Slide 6: Phương án Hạ tầng Cloud & Bảo mật dữ liệu
* **Phương án linh hoạt, dữ liệu lưu trữ 100% tại Việt Nam (Tier III Data Center).**
* **Khuyến nghị Lựa chọn:**
  - **FPT Cloud (~53.4 triệu VNĐ/năm):** Phù hợp nhất nếu Ban muốn tận dụng hệ sinh thái FPT AI tích hợp sẵn, độ tin cậy cực cao (SLA 99.99%).
  - **VNG Cloud (~41.5 triệu VNĐ/năm):** Phương án tối ưu nhất về chi phí với phần cứng mạnh mẽ.
* **Bảo mật tuyệt đối:** Backup dữ liệu tự động hàng ngày, SSL/TLS, tường lửa chống DDoS và lưu lại toàn bộ lịch sử (Audit Log) theo tiêu chuẩn nhà nước.

---

## Slide 7: Tổng mức đầu tư & Hiệu quả kinh tế
* **Chi phí Phát triển Phần mềm (Một lần):** `2.000.000.000 VNĐ`
  *Bao gồm: Phân tích nghiệp vụ, Phát triển (12 modules), Kiểm thử QA/QC, Đào tạo chuyển giao trực tiếp cho ~200 cán bộ.*
* **Chi phí Vận hành Khai thác (Hạ tầng + AI) Năm đầu:** `~60.000.000 VNĐ`
* **➔ TỔNG ĐẦU TƯ BAN ĐẦU:** `2.060.000.000 VNĐ`
* **Chi phí duy trì từ Năm 2 trở đi:** `~300 Triệu VNĐ / Năm` *(Chỉ bằng chi phí thuê 1-2 chuyên viên dự án nhưng giải quyết được khối lượng công việc khổng lồ, hỗ trợ 200 account).*

---

## Slide 8: Lộ trình Triển khai & Thanh toán
* **Thời gian triển khai:** Tiến độ dự kiến từ **6 đến 8 tháng**.
* **Lộ trình chia thành 4 mốc thanh toán:**
  - **Đợt 1 (Ký hợp đồng) - 30% tương đương 600.000.000 VNĐ:**
    *Nội dung thực hiện:* Khởi động dự án, phân tích nghiệp vụ, thiết kế hệ thống và thiết lập hạ tầng Cloud.
  - **Đợt 2 (Nghiệm thu GĐ1 - sau 3 tháng) - 30% tương đương 600.000.000 VNĐ:** 
    *Nội dung thực hiện:* Xây dựng và bàn giao nhóm Phân hệ cốt lõi (Dashboard điều hành, Quản lý dự án tổng thể, Quản lý nhân sự, Công việc).
  - **Đợt 3 (Nghiệm thu GĐ2 - sau 6 tháng) - 30% tương đương 600.000.000 VNĐ:**
    *Nội dung thực hiện:* Hoàn thiện và bàn giao nhóm Phân hệ chuyên sâu (Quản lý Đấu thầu & Hợp đồng, Kế hoạch vốn giải ngân, CDE ISO 19650, BIM Viewer và trợ lý AI Hub).
  - **Đợt 4 (Nghiệm thu cuối & Bàn giao - sau 8 tháng) - 10% tương đương 200.000.000 VNĐ:**
    *Nội dung thực hiện:* Kiểm thử QA/QC toàn trình, đào tạo chuyển giao cho ~200 người dùng, bàn giao tài liệu và đưa hệ thống vào khai thác (Go-live) chính thức.

---

## Slide 9: Cam kết từ CIC & Lời kết
* **Cam kết đồng hành:** Bảo hành 12 tháng kể từ ngày ký biên bản nghiệm thu; Sẵn sàng hỗ trợ kỹ thuật và xử lý sự cố trong thời gian vượt trội.
* **Quyết tâm triển khai:** Với nguồn lực công nghệ dồi dào, CIC cam kết đưa hệ thống vào vận hành đúng chất lượng và lộ trình cam kết.
* **Phù hợp khung pháp lý:** Hệ thống luôn được CIC cập nhật đồng hành cùng Chính phủ với những điều luật nâng cấp mới nhất.
* **Call to Action:** Kính mong Ban Giám đốc Ban QLDA ĐĐCN TP.HCM xem xét, góp ý để CIC có cơ hội đồng hành trong công cuộc Chuyển đổi số khâu Quản lý Dự án của đơn vị.
