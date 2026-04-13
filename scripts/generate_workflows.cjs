const fs = require('fs');

const workflows = [
  {
    id: '11111111-1111-4111-a111-111111111111',
    name: 'Quy trình DAXD - Thiết kế 1 bước',
    category: 'project',
    description: 'Dự án quy mô nhỏ (<15 tỷ), công trình bảo trì, sửa chữa, định mức đơn giản, chỉ yêu cầu lập BCKT-KT.',
    nodes: [
      {
        id: '11111111-1111-4111-a111-000000000001',
        name: 'Bước 1.1: Lập, phê duyệt Nhiệm vụ và Dự toán chi phí chuẩn bị đầu tư (CBĐT)',
        assignee_role: 'Ban QLDA',
        sla_formula: '7d',
        sort_order: 1,
        metadata: {
          phase: 'preparation',
          sub_process: 'Bước 1.1',
          legal_basis: 'Khoản 1 Điều 10 NĐ 10/2021/NĐ-CP',
          template_forms: ['TTr_PheDuyetNhiemVu_CBĐT.docx', 'QD_PheDuyetNhiemVu_CBĐT.docx'],
          sub_tasks: [
            { name: 'Xác định sơ bộ ranh giới, phạm vi. Lập nhiệm vụ khảo sát, lập báo cáo.', assignee_role: 'Ban QLDA' },
            { name: 'Lập bảng tính dự toán chi phí CBĐT', assignee_role: 'Ban QLDA' },
            { name: 'Trình phê duyệt Nhiệm vụ, dự toán CBĐT', assignee_role: 'Ban QLDA' }
          ]
        }
      },
      {
        id: '11111111-1111-4111-a111-000000000002',
        name: 'Bước 1.2: Lập, thẩm định và phê duyệt KH LCNT bước CBĐT',
        assignee_role: 'Phòng TCKH / Sở KHĐT',
        sla_formula: '30d',
        sort_order: 2,
        metadata: {
          phase: 'preparation',
          sub_process: 'Bước 1.2',
          legal_basis: 'Điều 37 Luật Đấu thầu 22/2023/QH15; NĐ 24/2024/NĐ-CP',
          template_forms: ['TTr_XinPheDuyet_KHLCNT_CBDT.docx', 'BC_ThamDinh_KHLCNT.docx', 'QD_PheDuyet_KHLCNT_CBDT.pdf'],
          sub_tasks: [
            { name: 'Lập Tờ trình Kế hoạch lựa chọn nhà thầu (KHLCNT) các gói thầu phục vụ CBĐT', assignee_role: 'Ban QLDA' },
            { name: 'Cơ quan chức năng thẩm định', assignee_role: 'Phòng TCKH' },
            { name: 'Cấp thẩm quyền (Người quyết định đầu tư) phê duyệt KHLCNT', assignee_role: 'UBND' }
          ]
        }
      },
      {
        id: '11111111-1111-4111-a111-000000000003',
        name: 'Bước 1.3: Lựa chọn nhà thầu tư vấn CBĐT',
        assignee_role: 'Tổ chuyên gia',
        sla_formula: '30d',
        sort_order: 3,
        metadata: {
          phase: 'preparation',
          sub_process: 'Bước 1.3',
          legal_basis: 'Luật Đấu thầu 22/2023/QH15; NĐ 24/2024/NĐ-CP.',
          template_forms: ['QD_PheDuyet_HSYC_HSMT.docx', 'BaoCao_DanhGia_HSDT.docx', 'QD_PheDuyet_KQLCNT_TuVan.docx'],
          sub_tasks: [
            { name: 'Phê duyệt E-HSMT / HSYC', assignee_role: 'Ban QLDA' },
            { name: 'Đăng tải thông báo mời thầu trên Hệ thống mạng đấu thầu Quốc gia', assignee_role: 'Tổ chuyên gia' },
            { name: 'Đánh giá hồ sơ dự thầu / Đề xuất', assignee_role: 'Tổ chuyên gia' },
            { name: 'Phê duyệt kết quả LCNT và ký kết hợp đồng Tư vấn (Khảo sát, lập BCKT-KT)', assignee_role: 'Ban QLDA' }
          ]
        }
      },
      {
        id: '11111111-1111-4111-a111-000000000004',
        name: 'Bước 1.4: Lập Báo cáo Kinh tế - Kỹ thuật (bao gồm TKBVTC)',
        assignee_role: 'Nhà thầu Tư vấn',
        sla_formula: '60d',
        sort_order: 4,
        metadata: {
          phase: 'preparation',
          sub_process: 'Bước 1.4',
          legal_basis: 'NĐ 15/2021/NĐ-CP',
          template_forms: ['HoSo_BanVe_TKBVTC.pdf', 'ThuyetMinh_BCKTKT.docx', 'Bang_TinhToan_DuToan.xlsx'],
          sub_tasks: [
            { name: 'Thực hiện khảo sát địa hình, địa chất', assignee_role: 'Nhà thầu Tư vấn' },
            { name: 'Lập Thiết kế bản vẽ thi công (TKBVTC) để trực tiếp thi công', assignee_role: 'Nhà thầu Tư vấn' },
            { name: 'Tính toán lập Dự toán chi tiết', assignee_role: 'Nhà thầu Tư vấn' },
            { name: 'Lập Thuyết minh Báo cáo KT-KT', assignee_role: 'Nhà thầu Tư vấn' }
          ]
        }
      },
      {
        id: '11111111-1111-4111-a111-000000000005',
        name: 'Bước 1.5: Thẩm định và Phê duyệt BCKT-KT (Quyết định đầu tư)',
        assignee_role: 'Sở/Phòng chức năng',
        sla_formula: '25d',
        sort_order: 5,
        metadata: {
          phase: 'preparation',
          sub_process: 'Bước 1.5',
          legal_basis: 'Điều 56, 57 Luật Xây dựng sửa đổi 2020; Điều 13 NĐ 15/2021/NĐ-CP.',
          template_forms: ['ThongBao_KQ_ThamDinh_BCKTKT.pdf', 'QD_PheDuyet_BCKTKT_DuAn.pdf'],
          sub_tasks: [
            { name: 'Thuê Tư vấn thẩm tra thiết kế, dự toán (độc lập)', assignee_role: 'Ban QLDA' },
            { name: 'Xin ý kiến thỏa thuận chuyên ngành: Điện, cấp thoát nước, PCCC, Môi trường', assignee_role: 'Ban QLDA' },
            { name: 'Trình Cơ quan chuyên môn về XD quản lý theo tuyến/địa bàn thẩm định', assignee_role: 'Ban QLDA' },
            { name: 'Chủ đầu tư nộp tờ trình lên Người quyết định đầu tư ban hành Quyết định phê duyệt BCKT-KT', assignee_role: 'CĐT' }
          ]
        }
      },
      {
        id: '11111111-1111-4111-a111-000000000006',
        name: 'Bước 2.1: Tổ chức Bồi thường, Hỗ trợ và Tái định cư (GPMB)',
        assignee_role: 'Hội đồng GPMB',
        sla_formula: '75d',
        sort_order: 6,
        metadata: {
          phase: 'execution',
          sub_process: 'Bước 2.1',
          legal_basis: 'Luật Đất đai 18/2024/QH15; NĐ 88/2024/NĐ-CP.',
          template_forms: ['ThongBao_ThuHoiDat.pdf', 'QuyetDinh_BTHoTro_TDC.pdf', 'BienBan_BanGiao_MatBang.docx'],
          sub_tasks: [
            { name: 'Bàn giao mốc giới giải tỏa trên thực địa', assignee_role: 'Ban QLDA' },
            { name: 'Thông báo thu hồi đất, kiểm đếm hiện trạng', assignee_role: 'Hội đồng GPMB' },
            { name: 'Lập, niêm yết và phê duyệt phương án đền bù', assignee_role: 'Hội đồng GPMB' },
            { name: 'Thanh toán chi trả tiền bồi thường và nhận bàn giao mặt bằng thi công', assignee_role: 'Hội đồng GPMB' }
          ]
        }
      },
      {
        id: '11111111-1111-4111-a111-000000000007',
        name: 'Bước 2.2: Lập, Thẩm định, Phê duyệt KHLCNT Tổng thể',
        assignee_role: 'Phòng Kế hoạch-Đấu thầu',
        sla_formula: '30d',
        sort_order: 7,
        metadata: {
          phase: 'execution',
          sub_process: 'Bước 2.2',
          legal_basis: 'khoản 2 Điều 37 Luật Đấu thầu 22/2023/QH15.',
          template_forms: ['TTr_ThamDinh_KHLCNT_TongThe.docx', 'QD_PheDuyet_KHLCNT_TongThe.pdf'],
          sub_tasks: [
            { name: 'Hình thành danh mục các gói thầu', assignee_role: 'Phòng Đấu thầu' },
            { name: 'Cấp thẩm quyền thẩm định và phê duyệt KHLCNT', assignee_role: 'UBND' }
          ]
        }
      },
      {
        id: '11111111-1111-4111-a111-000000000008',
        name: 'Bước 2.3: Lựa chọn nhà thầu Thi công, Tư vấn Giám sát (TVGS)',
        assignee_role: 'Tổ chuyên gia',
        sla_formula: '40d',
        sort_order: 8,
        metadata: {
          phase: 'execution',
          sub_process: 'Bước 2.3',
          legal_basis: 'NĐ 24/2024/NĐ-CP.',
          template_forms: ['QD_PheDuyet_KQLCNT_XayLap.pdf', 'HopDong_XayLap.docx', 'HopDong_TVGS.docx'],
          sub_tasks: [
            { name: 'Đăng tải E-TBMT, đánh giá thầu, thương thảo và phê duyệt KQLCNT', assignee_role: 'Tổ chuyên gia' }
          ]
        }
      },
      {
        id: '11111111-1111-4111-a111-000000000009',
        name: 'Bước 2.4: Khởi công và Thi công xây dựng công trình',
        assignee_role: 'Nhà thầu thi công',
        sla_formula: '180d',
        sort_order: 9,
        metadata: {
          phase: 'execution',
          sub_process: 'Bước 2.4',
          legal_basis: 'Điều 107 Luật Xây dựng sửa đổi 2020; NĐ 06/2021/NĐ-CP.',
          template_forms: ['ThongBao_KhoiCong.docx', 'NhatKy_CongTrinh.docx', 'NghiemThu_VatLieu.pdf'],
          sub_tasks: [
            { name: 'Thông báo khởi công gửi Sở/Phòng chức năng', assignee_role: 'CĐT' },
            { name: 'Bàn giao mặt bằng thi công thực địa cho nhà thầu', assignee_role: 'CĐT' },
            { name: 'Phê duyệt Biện pháp tổ chức thi công, Tiến độ thi công', assignee_role: 'TVGS' },
            { name: 'Thực hiện thi công xây lắp theo bản thiết kế BCKT-KT', assignee_role: 'Nhà thầu thi công' }
          ]
        }
      },
      {
        id: '11111111-1111-4111-a111-000000000010',
        name: 'Bước 2.5: Giám sát thi công và Thanh toán Vốn (Giải ngân)',
        assignee_role: 'TVGS',
        sla_formula: '7d',
        sort_order: 10,
        metadata: {
          phase: 'execution',
          sub_process: 'Bước 2.5',
          legal_basis: 'NĐ 99/2021/NĐ-CP; Thông tư 96/2021/TT-BTC.',
          template_forms: ['BienBan_NghiemThu_CongViec.docx', 'Bang_XacNhan_KhoiLuong_ThanhToan_03a.xlsx'],
          sub_tasks: [
            { name: 'Tổ chức nghiệm thu giai đoạn/công việc xây dựng', assignee_role: 'TVGS' },
            { name: 'Lập hồ sơ thanh toán khối lượng hoàn thành định kỳ', assignee_role: 'Nhà thầu' },
            { name: 'Chủ đầu tư chứng nhận, gửi ra Kho bạc Nhà nước để thanh toán vốn', assignee_role: 'CĐT' }
          ]
        }
      },
      {
        id: '11111111-1111-4111-a111-000000000011',
        name: 'Bước 3.1: Kiểm tra công tác nghiệm thu của Nhà nước',
        assignee_role: 'Cơ quan QLNN chuyên ngành',
        sla_formula: '20d',
        sort_order: 11,
        metadata: {
          phase: 'completion',
          sub_process: 'Bước 3.1',
          legal_basis: 'Điều 24 NĐ 06/2021/NĐ-CP.',
          template_forms: ['BaoCao_HoanThanh_CongTrinh.docx', 'ThongBao_KQKiemTra_HoanThanh.pdf'],
          sub_tasks: [
            { name: 'Báo cáo hoàn thành thi công toàn bộ công trình, mời Cơ quan QLNN chuyên ngành xuống hiện trường', assignee_role: 'Ban QLDA' },
            { name: 'Ra Thông báo kết quả kiểm tra', assignee_role: 'CQNN' }
          ]
        }
      },
      {
        id: '11111111-1111-4111-a111-000000000012',
        name: 'Bước 3.2: Bàn giao đưa vào sử dụng',
        assignee_role: 'Ban QLDA',
        sla_formula: '30d',
        sort_order: 12,
        metadata: {
          phase: 'completion',
          sub_process: 'Bước 3.2',
          legal_basis: 'Điều 27 NĐ 06/2021/NĐ-CP.',
          template_forms: ['BienBan_NghiemThu_BanGiao_CT.docx', 'BanVe_HoanCong.pdf'],
          sub_tasks: [
            { name: 'Họp Hội đồng nghiệm thu cấp cơ sở', assignee_role: 'CĐT' },
            { name: 'Lập Bản vẽ hoàn công cuối cùng', assignee_role: 'Nhà thầu' },
            { name: 'Lập biên bản Bàn giao công trình và tài liệu bảo trì', assignee_role: 'Ban QLDA' }
          ]
        }
      },
      {
        id: '11111111-1111-4111-a111-000000000013',
        name: 'Bước 3.3: Lập, Thẩm định và Phê duyệt Quyết toán vốn ĐTC (Đóng mã dự án)',
        assignee_role: 'Sở Tài chính',
        sla_formula: '150d',
        sort_order: 13,
        metadata: {
          phase: 'completion',
          sub_process: 'Bước 3.3',
          legal_basis: 'NĐ 99/2021/NĐ-CP.',
          template_forms: ['HoSo_QuyetToan_DAHT.xlsx', 'QD_PheDuyet_QuyetToan_DuAn.pdf'],
          sub_tasks: [
            { name: 'Lập Hồ sơ Quyết toán dự án hoàn thành', assignee_role: 'Kế toán CĐT' },
            { name: 'Báo cáo, đối chiếu số dư thanh toán tại Kho bạc', assignee_role: 'Kế toán CĐT' },
            { name: 'Trình Cấp tài chính thẩm tra và trình UBND duyệt', assignee_role: 'KBNN' },
            { name: 'Đóng mã tài khoản, mã dự án', assignee_role: 'UBND' }
          ]
        }
      }
    ]
  },
  {
    id: '22222222-2222-4222-a222-222222222222',
    name: 'Quy trình DAXD - Thiết kế 2 bước',
    category: 'project',
    description: 'Dự án phổ thông trung bình trở lên. Bước đầu lập Thiết kế cơ sở (BCNCKT). Bước hai lập Thiết kế bản vẽ thi công.',
    nodes: [
      {
        id: '22222222-2222-4222-a222-000000000001',
        name: 'Bước 1.1: Lập, phê duyệt Nhiệm vụ và Dự toán chi phí chuẩn bị đầu tư (CBĐT)',
        assignee_role: 'Ban QLDA',
        sla_formula: '7d',
        sort_order: 1,
        metadata: {
          phase: 'preparation',
          sub_process: 'Bước 1.1',
          legal_basis: 'Khoản 1 Điều 10 NĐ 10/2021/NĐ-CP.',
          template_forms: ['TTr_PheDuyetNhiemVu_CBĐT.docx', 'QD_PheDuyetNhiemVu_CBĐT.pdf'],
          sub_tasks: [
            { name: 'Xác định sơ bộ ranh giới, phạm vi dự án', assignee_role: 'Ban QLDA' },
            { name: 'Lập dự toán chi phí các công tác CBĐT', assignee_role: 'Ban QLDA' },
            { name: 'Trình phê duyệt Nhiệm vụ và Dự toán CBĐT', assignee_role: 'Ban QLDA' }
          ]
        }
      },
      {
        id: '22222222-2222-4222-a222-000000000002',
        name: 'Bước 1.2: Lập, thẩm định và phê duyệt KH LCNT bước CBĐT',
        assignee_role: 'Ban QLDA',
        sla_formula: '30d',
        sort_order: 2,
        metadata: {
          phase: 'preparation',
          sub_process: 'Bước 1.2',
          legal_basis: 'Điều 37 Luật Đấu thầu 22/2023/QH15; NĐ 24/2024/NĐ-CP.',
          template_forms: ['TTr_XinPheDuyet_KHLCNT_CBDT.docx', 'BC_ThamDinh_KHLCNT.docx', 'QD_PheDuyet_KHLCNT.pdf'],
          sub_tasks: [
            { name: 'Cơ cấu gói thầu tư vấn thành Tờ trình', assignee_role: 'Phòng Đấu thầu' },
            { name: 'Gửi hồ sơ thẩm định', assignee_role: 'Phòng KHTC' },
            { name: 'Trình UBND phê duyệt', assignee_role: 'UBND' }
          ]
        }
      },
      {
        id: '22222222-2222-4222-a222-000000000003',
        name: 'Bước 1.3: Lựa chọn nhà thầu tư vấn khảo sát, lập BCNCKT',
        assignee_role: 'Tổ chuyên gia',
        sla_formula: '45d',
        sort_order: 3,
        metadata: {
          phase: 'preparation',
          sub_process: 'Bước 1.3',
          legal_basis: 'Luật Đấu thầu 22/2023/QH15.',
          template_forms: ['BaoCao_DanhGia_TV_BCNCKT.pdf', 'QD_PheDuyet_KQLCNT_TV.pdf', 'HopDong_TuVan_BCNCKT.docx'],
          sub_tasks: [
            { name: 'Đăng tải thông báo, đánh giá HSDT', assignee_role: 'Tổ chuyên gia' },
            { name: 'Phê duyệt nhà thầu Tư vấn khảo sát và lập BCNCKT', assignee_role: 'Ban QLDA' },
            { name: 'Thương thảo, ký kết HĐ', assignee_role: 'Ban QLDA' }
          ]
        }
      },
      {
        id: '22222222-2222-4222-a222-000000000004',
        name: 'Bước 1.4: Công tác Thỏa thuận chuyên ngành và Lập ĐTM',
        assignee_role: 'Sở TNMT',
        sla_formula: '60d',
        sort_order: 4,
        metadata: {
          phase: 'preparation',
          sub_process: 'Bước 1.4',
          legal_basis: 'Luật Bảo vệ Môi trường 2020.',
          template_forms: ['BaoCao_DTM.pdf', 'QuyetDinh_PheDuyet_DTM.pdf', 'VanBan_ThoaThuan_PCCC.pdf'],
          sub_tasks: [
            { name: 'Trình nộp hồ sơ xin thỏa thuận chuyên ngành', assignee_role: 'Tư vấn pháp lý' },
            { name: 'Lập Báo cáo ĐTM', assignee_role: 'Tư vấn MT' },
            { name: 'Trình Sở TNMT phê duyệt ĐTM', assignee_role: 'Sở TNMT' }
          ]
        }
      },
      {
        id: '22222222-2222-4222-a222-000000000005',
        name: 'Bước 1.5: Lập, Thẩm định BCNCKT và Phê duyệt Dự án',
        assignee_role: 'Sở chuyên ngành',
        sla_formula: '40d',
        sort_order: 5,
        metadata: {
          phase: 'preparation',
          sub_process: 'Bước 1.5',
          legal_basis: 'Luật XD 50/2014 & Luật sửa đổi 62/2020.',
          template_forms: ['ThuyetMinh_BCNCKT.docx', 'HoSo_ThietKeCoSo.pdf', 'ThongBao_ThamDinh_TKCS.pdf', 'QD_PheDuyet_DuAnDauTu.pdf'],
          sub_tasks: [
            { name: 'Nộp Báo cáo nghiên cứu khả thi, Thiết kế Cơ sở', assignee_role: 'Nhà thầu Tư vấn' },
            { name: 'Tổ chức thẩm tra, thẩm định chuyên môn về XD', assignee_role: 'Sở chuyên ngành' },
            { name: 'Phê duyệt Dự án', assignee_role: 'Cấp Quyết định đầu tư' }
          ]
        }
      },
      {
        id: '22222222-2222-4222-a222-000000000006',
        name: 'Bước 2.1: Ban hành Nhiệm vụ khảo sát thiết kế triển khai sau TKCS',
        assignee_role: 'Ban QLDA',
        sla_formula: '10d',
        sort_order: 6,
        metadata: {
          phase: 'execution',
          sub_process: 'Bước 2.1',
          legal_basis: 'Khoản 1 Điều 72 Luật Xây dựng.',
          template_forms: ['TTr_PheDuyet_NV_KSTK_TKBVTC.docx', 'QD_PheDuyet_NV_KSTK_TKBVTC.pdf'],
          sub_tasks: [
            { name: 'CĐT lập và phê duyệt Đề cương / Nhiệm vụ yêu cầu lập TKBVTC', assignee_role: 'Ban QLDA' }
          ]
        }
      },
      {
        id: '22222222-2222-4222-a222-000000000007',
        name: 'Bước 2.2: Công tác Bồi thường, Hỗ trợ và Tái định cư (GPMB)',
        assignee_role: 'Hội đồng GPMB',
        sla_formula: '180d',
        sort_order: 7,
        metadata: {
          phase: 'execution',
          sub_process: 'Bước 2.2',
          legal_basis: 'Luật Đất đai 2024; NĐ 88/2024/NĐ-CP.',
          template_forms: ['ThongBao_ThuHoiDat.pdf', 'QD_PhaDuyet_PA_BTHoTro_TDC.pdf', 'BienBan_NhanMatBang.docx'],
          sub_tasks: [
            { name: 'Lập và phê duyệt phương án đền bù', assignee_role: 'Hội đồng GPMB' },
            { name: 'Chi trả tiền và cưỡng chế', assignee_role: 'Chính quyền' },
            { name: 'Bàn giao mặt bằng thi công trực tiếp', assignee_role: 'TT PT quỹ đất' }
          ]
        }
      },
      {
        id: '22222222-2222-4222-a222-000000000008',
        name: 'Bước 2.3: Lập, phê duyệt KHLCNT tổng thể và Đấu thầu TKBVTC',
        assignee_role: 'Ban QLDA',
        sla_formula: '50d',
        sort_order: 8,
        metadata: {
          phase: 'execution',
          sub_process: 'Bước 2.3',
          legal_basis: 'NĐ 24/2024/NĐ-CP.',
          template_forms: [],
          sub_tasks: [
            { name: 'Phê duyệt KHLCNT dự án tổng thể', assignee_role: 'Ban QLDA' },
            { name: 'Mời thầu Tư vấn Lập Thiết kế bản vẽ thi công', assignee_role: 'Đơn vị tư vấn' }
          ]
        }
      },
      {
        id: '22222222-2222-4222-a222-000000000009',
        name: 'Bước 2.4: Lập, Thẩm định, Phê duyệt TKBVTC và Dự toán',
        assignee_role: 'Ban QLDA',
        sla_formula: '90d',
        sort_order: 9,
        metadata: {
          phase: 'execution',
          sub_process: 'Bước 2.4',
          legal_basis: 'Điều 82, 83 Luật Xây dựng sửa đổi 2020.',
          template_forms: ['HoSo_ThietKe_BanVeThiCong.pdf', 'HoSo_Dutoan_GoiThau.xls', 'QD_PheDuyet_TKBVTC_Dutoan.pdf'],
          sub_tasks: [
            { name: 'Lập Thiết kế bản vẽ thi công và Dự toán', assignee_role: 'Tư vấn Thiết kế' },
            { name: 'Thuê thẩm tra và thẩm định nội bộ', assignee_role: 'Ban QLDA' },
            { name: 'Cấp quyết định phê duyệt TKBVTC và Dự toán', assignee_role: 'Lãnh đạo Ban' }
          ]
        }
      },
      {
        id: '22222222-2222-4222-a222-000000000010',
        name: 'Bước 3.1: Đấu thầu Nhà thầu Xây lắp và Tư vấn giám sát (TVGS)',
        assignee_role: 'Ban QLDA',
        sla_formula: '45d',
        sort_order: 10,
        metadata: {
          phase: 'execution',
          sub_process: 'Bước 3.1',
          legal_basis: 'Luật Đấu thầu 22/2023.',
          template_forms: ['QD_KQLCNT_XayLap.pdf', 'HopDong_XayLap.docx'],
          sub_tasks: [
            { name: 'Đăng tải E-HSMT mời nhà thầu Thi công, TVGS', assignee_role: 'Tổ chuyên gia đấu thầu' },
            { name: 'Đánh giá, phê duyệt KQLCNT', assignee_role: 'Ban QLDA' },
            { name: 'Ký hợp đồng kinh tế', assignee_role: 'Ban QLDA' }
          ]
        }
      },
      {
        id: '22222222-2222-4222-a222-000000000011',
        name: 'Bước 3.2: Thi công và Giám sát thi công',
        assignee_role: 'Nhà thầu',
        sla_formula: '200d',
        sort_order: 11,
        metadata: {
          phase: 'execution',
          sub_process: 'Bước 3.2',
          legal_basis: 'NĐ 06/2021/NĐ-CP, NĐ 99/2021/NĐ-CP.',
          template_forms: ['NhatKy_ThiCong.docx', 'BienBan_NghiemThu_GD.pdf', 'Bang_KL_ThanhToan_03a.xlsx'],
          sub_tasks: [
            { name: 'Phát lệnh Khởi công công trình', assignee_role: 'CĐT' },
            { name: 'Tư vấn triển khai nghiệm thu vật liệu, ATLĐ', assignee_role: 'TVGS' },
            { name: 'Nhà thầu thi công theo bản vẽ', assignee_role: 'Nhà thầu' },
            { name: 'Thanh toán giải ngân đợt', assignee_role: 'KBNN' }
          ]
        }
      },
      {
        id: '22222222-2222-4222-a222-000000000012',
        name: 'Bước 4.1: Kiểm tra & Nghiệm thu hoàn thành',
        assignee_role: 'Sở/Ngành quản lý',
        sla_formula: '30d',
        sort_order: 12,
        metadata: {
          phase: 'completion',
          sub_process: 'Bước 4.1',
          legal_basis: 'Điều 23, 24 NĐ 06/2021/NĐ-CP.',
          template_forms: ['VanBan_ChapThuan_NT_CuaCQNN.pdf', 'BienBan_NghiemThu_HoanThanh.docx'],
          sub_tasks: [
            { name: 'CQNN tổ chức kiểm tra và ra văn bản chấp thuận', assignee_role: 'CQNN' },
            { name: 'Họp hội đồng nghiệm thu cấp cơ sở', assignee_role: 'CĐT' }
          ]
        }
      },
      {
        id: '22222222-2222-4222-a222-000000000013',
        name: 'Bước 4.2: Bàn giao đưa vào sử dụng và Bảo hành',
        assignee_role: 'Đơn vị thụ hưởng',
        sla_formula: '20d',
        sort_order: 13,
        metadata: {
          phase: 'completion',
          sub_process: 'Bước 4.2',
          legal_basis: '',
          template_forms: ['BienBan_BanGiao_NhaThau_CDT_DVS.docx', 'HoSo_HoanCong.pdf'],
          sub_tasks: [
            { name: 'Vạch sơ đồ và thực địa bàn giao', assignee_role: 'Ban QLDA' },
            { name: 'Lập và nộp hồ sơ hoàn công', assignee_role: 'Nhà thầu' }
          ]
        }
      },
      {
        id: '22222222-2222-4222-a222-000000000014',
        name: 'Bước 4.3: Quyết toán vốn đầu tư hoàn thành và Đóng quỹ',
        assignee_role: 'Sở Tài chính',
        sla_formula: '150d',
        sort_order: 14,
        metadata: {
          phase: 'completion',
          sub_process: 'Bước 4.3',
          legal_basis: 'NĐ 99/2021/NĐ-CP.',
          template_forms: ['ToTrinh_QuyetToan.docx', 'QD_QuyetToan_DuAn_HoanThanh.pdf'],
          sub_tasks: [
            { name: 'Tập hợp hồ sơ, BCTC', assignee_role: 'Kế toán CĐT' },
            { name: 'Nộp lên Cơ quan thẩm tra (Sở/Phòng TC)', assignee_role: 'Sở TC' },
            { name: 'Hoàn chi, tất toán mã Hạch Toán tại Kho bạc', assignee_role: 'KBNN' }
          ]
        }
      }
    ]
  },
  {
    id: '33333333-3333-4333-a333-333333333333',
    name: 'Quy trình DAXD - Thiết kế 3 bước',
    category: 'project',
    description: 'Dự án Nhóm A hoặc công trình chuyên ngành cấp I, Đặc biệt có tính phức tạp kỹ thuật rất cao.',
    nodes: [
      {
        id: '33333333-3333-4333-a333-000000000001',
        name: 'Bước 1.1: Trình duyệt bộ Nhiệm vụ và Các thoả thuận chuyên ngành',
        assignee_role: 'Ban QLDA',
        sla_formula: '120d',
        sort_order: 1,
        metadata: {
          phase: 'preparation',
          sub_process: 'Bước 1.1',
          legal_basis: 'Luật ĐTC 2019, NĐ 10/2021/NĐ-CP.',
          template_forms: [],
          sub_tasks: [
            { name: 'Phê duyệt NV KSTK, Dự toán phí', assignee_role: 'Ban QLDA' },
            { name: 'Phê duyệt KHLCNT tư vấn', assignee_role: 'Bộ/Cấp tỉnh' },
            { name: 'Lập và nộp ĐTM', assignee_role: 'Ban QLDA' }
          ]
        }
      },
      {
        id: '33333333-3333-4333-a333-000000000002',
        name: 'Bước 1.2: Lập, Thẩm định và Phê duyệt Dự án Đầu tư (Kèm TKCS)',
        assignee_role: 'Hội đồng Thẩm định',
        sla_formula: '60d',
        sort_order: 2,
        metadata: {
          phase: 'preparation',
          sub_process: 'Bước 1.2',
          legal_basis: 'Luật Đầu tư công 39/2019/QH14.',
          template_forms: ['HoSo_BCNCKT_NhomA.pdf', 'BaoCao_ThamDinh_CapNhaNuoc.pdf', 'QD_PheDuyet_NhomA.pdf'],
          sub_tasks: [
            { name: 'Tư vấn lập BCNCKT', assignee_role: 'Tư vấn' },
            { name: 'Thẩm định cấp Nhà nước', assignee_role: 'Hội đồng' },
            { name: 'Thủ tướng / Bộ KH quyết định phê duyệt', assignee_role: 'TTCP' }
          ]
        }
      },
      {
        id: '33333333-3333-4333-a333-000000000003',
        name: 'Bước 2.1: Ban hành Nhiệm vụ và Đấu thầu tư vấn lập TKKT',
        assignee_role: 'Ban QLDA',
        sla_formula: '70d',
        sort_order: 3,
        metadata: {
          phase: 'execution',
          sub_process: 'Bước 2.1',
          legal_basis: 'Luật Đấu thầu 22/2023.',
          template_forms: ['QD_PheDuyet_HSMT_TKKT.docx'],
          sub_tasks: [
            { name: 'Phê duyệt KHLCNT tổng thể', assignee_role: 'Ban QLDA' },
            { name: 'Mời thầu rộng rãi tư vấn lập TKKT', assignee_role: 'Ban QLDA' }
          ]
        }
      },
      {
        id: '33333333-3333-4333-a333-000000000004',
        name: 'Bước 2.2: Lập, Thẩm tra và Thẩm định Thiết kế Kỹ thuật (TKKT)',
        assignee_role: 'CQKS Nhà nước',
        sla_formula: '180d',
        sort_order: 4,
        metadata: {
          phase: 'execution',
          sub_process: 'Bước 2.2',
          legal_basis: 'Điều 82, 83 Luật Xây dựng sửa đổi 2020.',
          template_forms: ['HoSo_ThietKeKyThuat_DA.pdf', 'BaoCao_ThamDinh_SCD.pdf'],
          sub_tasks: [
            { name: 'Nhà thầu thiết kế các bản vẽ cấu kiện', assignee_role: 'Tư vấn' },
            { name: 'Thẩm tra độc lập', assignee_role: 'Thẩm tra viên' },
            { name: 'Bộ / Ngành chủ quản thẩm định TKKT', assignee_role: 'BXD' }
          ]
        }
      },
      {
        id: '33333333-3333-4333-a333-000000000005',
        name: 'Bước 2.3: Phê duyệt Thiết kế Kỹ thuật & Bồi thường (GPMB)',
        assignee_role: 'UBND',
        sla_formula: '180d',
        sort_order: 5,
        metadata: {
          phase: 'execution',
          sub_process: 'Bước 2.3',
          legal_basis: 'Luật Đất đai 18/2024.',
          template_forms: [],
          sub_tasks: [
            { name: 'Hội đồng GPMB rà soát, thu hồi', assignee_role: 'HĐ GPMB' },
            { name: 'Phê duyệt kết quả TKKT', assignee_role: 'UBND' }
          ]
        }
      },
      {
        id: '33333333-3333-4333-a333-000000000006',
        name: 'Bước 3.1: Chuyển giao và Lập Thiết kế bản vẽ thi công trên nền TKKT',
        assignee_role: 'Nhà thầu thi công',
        sla_formula: '60d',
        sort_order: 6,
        metadata: {
          phase: 'execution',
          sub_process: 'Bước 3.1',
          legal_basis: 'Thông tư hướng dẫn NĐ 15/2021.',
          template_forms: ['HoSo_TKBVTC_Shopdrawing.pdf'],
          sub_tasks: [
            { name: 'Nhà thầu lập Thiết kế bản vẽ thi công Shop-drawing', assignee_role: 'Tổng thầu' }
          ]
        }
      },
      {
        id: '33333333-3333-4333-a333-000000000007',
        name: 'Bước 3.2: Thẩm định và Phê duyệt Thiết kế Bản vẽ thi công',
        assignee_role: 'Ban QLDA',
        sla_formula: '10d',
        sort_order: 7,
        metadata: {
          phase: 'execution',
          sub_process: 'Bước 3.2',
          legal_basis: 'Khoản 1 Điều 82 Luật Xây dựng sửa đổi 2020.',
          template_forms: ['ToTrinh_TKBVTC_ThiCong.docx', 'QD_KiemDuyet_TKBVTC_Cua_CDT.pdf'],
          sub_tasks: [
            { name: 'Tổ kỹ thuật thẩm tra và đóng dấu', assignee_role: 'Ban QLDA' },
            { name: 'Lãnh đạo Ban phê duyệt', assignee_role: 'Lãnh đạo Ban' }
          ]
        }
      },
      {
        id: '33333333-3333-4333-a333-000000000008',
        name: 'Bước 3.3: Lựa chọn nhà thầu, Thi công và Giám sát thi công khối lượng lớn',
        assignee_role: 'Nhà thầu',
        sla_formula: '360d',
        sort_order: 8,
        metadata: {
          phase: 'execution',
          sub_process: 'Bước 3.3',
          legal_basis: 'NĐ 06/2021/NĐ-CP',
          template_forms: ['BienBan_GiamSat_TacGia.pdf', 'CongNhan_ThamTra_KiemDinh_DoDocLap.pdf'],
          sub_tasks: [
            { name: 'Tổ chức giám sát 3 lớp', assignee_role: 'TVGS' },
            { name: 'Thi công và thanh toán theo mốc Hợp đồng', assignee_role: 'Nhà thầu' },
            { name: 'Kiểm định LAB độc lập', assignee_role: 'Đơn vị LAB' }
          ]
        }
      },
      {
        id: '33333333-3333-4333-a333-000000000009',
        name: 'Bước 4.1: Hội đồng Nghiệm thu Cấp cơ sở & Cấp Nhà Nước',
        assignee_role: 'Hội đồng Nhà Nước',
        sla_formula: '40d',
        sort_order: 9,
        metadata: {
          phase: 'completion',
          sub_process: 'Bước 4.1',
          legal_basis: 'Điều 24 NĐ 06/2021/NĐ-CP.',
          template_forms: ['VanBan_ChapThuan_NT_CuaHD_QuocGia.pdf'],
          sub_tasks: [
            { name: 'Hội đồng kiểm tra tổng thể an toàn', assignee_role: 'HĐ NN' }
          ]
        }
      },
      {
        id: '33333333-3333-4333-a333-000000000010',
        name: 'Bước 4.2: Quyết toán Dự án Hoàn thành & Kho bạc (Kiểm toán Bắt buộc)',
        assignee_role: 'Kiểm toán độc lập',
        sla_formula: '300d',
        sort_order: 10,
        metadata: {
          phase: 'completion',
          sub_process: 'Bước 4.2',
          legal_basis: 'NĐ 99/2021/NĐ-CP.',
          template_forms: ['BaoCao_KiemToan_DocLap.pdf', 'QD_PheDuyet_QuyetToan_DuAnHT_NhomA.pdf'],
          sub_tasks: [
            { name: 'Kiểm toán tài chính độc lập', assignee_role: 'Kiểm toán' },
            { name: 'Lập Báo cáo Quyết toán hoàn thành DA Nhóm A', assignee_role: 'Kế toán CĐT' },
            { name: 'Thẩm tra & Phê duyệt sổ đỏ đóng quyết toán', assignee_role: 'Cấp Bộ/Tỉnh' }
          ]
        }
      }
    ]
  }
];

let sqlArray = [];

for (const wf of workflows) {
  sqlArray.push(`INSERT INTO public.workflows (id, name, category, description, version, is_active, created_at, updated_at) VALUES ('${wf.id}', '${wf.name}', '${wf.category}', '${wf.description}', 'v1.0', true, now(), now());`);
  
  for (const node of wf.nodes) {
    const metaStr = JSON.stringify(node.metadata).replace(/'/g, "''");
    sqlArray.push(`INSERT INTO public.workflow_nodes (id, workflow_id, type, name, assignee_role, sla_formula, sort_order, metadata, created_at, updated_at) VALUES ('${node.id}', '${wf.id}', 'approval', '${node.name}', '${node.assignee_role}', '${node.sla_formula}', ${node.sort_order}, '${metaStr}'::jsonb, now(), now());`);
  }
}

fs.writeFileSync('insert_workflows.sql', sqlArray.join('\n'));
console.log('Generated insert_workflows.sql');
