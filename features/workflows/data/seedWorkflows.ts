// Seed Data: 3 Quy trình DAXD theo Sổ tay ĐTCHD 2025
// Extracted from WorkflowManagerPage.tsx for maintainability

export interface WorkflowTemplate {
    name: string;
    code: string;
    category: string;
    description: string;
    steps: Array<{
        id?: string;
        name: string;
        type: string;
        role: string;
        sla: string;
        metadata?: any;
    }>;
    edges?: Array<{
        source: string;
        target: string;
        label?: string;
        condition?: string;
    }>;
}

export function getStandardWorkflowTemplates(): WorkflowTemplate[] {
            const COMMON_PREP_STEPS = [
                {
                    name: '1. Lập BCNCTKT/ Báo cáo đề xuất CTrĐT',
                    type: 'start', role: 'Chủ tịch UBND / Đơn vị được giao lập', sla: '30d',
                    metadata: {
                        phase: 'preparation',
                        sub_process: 'I.1. Quyết định chủ trương đầu tư',
                        sub_tasks: [
                            {
                                id: crypto.randomUUID(),
                                name: 'Giao đơn vị trực thuộc (bao gồm cả đơn vị sự nghiệp công lập trực thuộc hoặc UBND cấp dưới trực tiếp) lập BCNCTKT/ Báo cáo đề xuất CTrĐT',
                                assignee_role: 'Chủ tịch UBND các cấp',
                                output: '',
                                template_forms: '',
                                legal_basis: 'Điểm a khoản 1 các điều 25, 27, 28 Luật ĐTC số 58'
                            },
                            {
                                id: crypto.randomUUID(),
                                name: 'Lập BCNCTKT/Báo cáo đề xuất CTrĐT, thành phần hồ sơ như sau:\n- Tờ trình đề nghị cấp có thẩm quyền quyết định CTrĐT;\n- Nội dung BCNCTKT/Báo cáo đề xuất CTrĐT: Theo quy định tại Điều 33, Điều 34, Điều 35 Luật ĐTC số 58 (Lưu ý về Phân tích, đánh giá sơ bộ tác động về môi trường, xã hội);\n- Các tài liệu khác (nếu có).\n- Thời gian thực hiện tối thiểu:\n+ Lập báo cáo đề xuất chủ trương đầu tư: 20 ngày\n+ Lập báo cáo nghiên cứu tiền khả thi: 30 ngày',
                                assignee_role: 'Đơn vị được giao lập BCNCTKT/ Báo cáo đề xuất CTrĐT',
                                output: 'Thành phần hồ sơ (Tờ trình, Báo cáo...)',
                                template_forms: 'Các mẫu số 1,2,3',
                                legal_basis: 'Các điều 33, 34, 35 Luật ĐTC số 58',
                                sla: '30d'
                            }
                        ]
                    }
                },
                {
                    name: '2. Thẩm định BCNCTKT/ Báo cáo đề xuất CTrĐT, nguồn vốn và khả năng cân đối vốn',
                    type: 'input', role: 'Hội đồng thẩm định / Sở TC', sla: '45d',
                    metadata: {
                        phase: 'preparation',
                        sub_process: 'I.1. Quyết định chủ trương đầu tư',
                        sub_tasks: [
                            {
                                id: crypto.randomUUID(),
                                name: 'Thành lập Hội đồng thẩm định hoặc giao đơn vị có chức năng thẩm định nguồn vốn và khả năng cân đối vốn',
                                assignee_role: 'Chủ tịch UBND các cấp',
                                output: '',
                                template_forms: '',
                                legal_basis: 'Điểm b khoản 1 các đ 25, 27, 28, 30, 31 Luật ĐTC số 58'
                            },
                            {
                                id: crypto.randomUUID(),
                                name: 'Hồ sơ trình thẩm định BCNCTKT/Báo cáo đề xuất CTrĐT',
                                assignee_role: 'Đơn vị được giao lập',
                                output: 'Hồ sơ trình thẩm định',
                                template_forms: 'Tờ trình theo mẫu',
                                legal_basis: ''
                            },
                            {
                                id: crypto.randomUUID(),
                                name: 'Tiếp nhận và tổ chức thẩm định (đối với dự án nhóm A, chương trình đầu tư công, và dự án nhóm B, C thuộc thẩm quyền của UBND các cấp)',
                                assignee_role: 'Hội đồng thẩm định / Đơn vị có chức năng',
                                output: '',
                                template_forms: 'Mẫu số 4',
                                legal_basis: 'Điểm b khoản 1 Điều 25, 27, 28 Luật ĐTC số 58'
                            },
                            {
                                id: crypto.randomUUID(),
                                name: 'Thẩm định đồng thời nội dung đánh giá sơ bộ ĐTM; Tuân thủ thời gian thẩm định quy định',
                                assignee_role: 'Cơ quan thẩm định',
                                output: 'Báo cáo thẩm định',
                                template_forms: '',
                                legal_basis: 'Khoản 4, 6 Điều 9 và Điều 12 Nghị định số 40'
                            }
                        ]
                    }
                },
                {
                    name: '3. Hoàn thiện BCNCTKT (NCTKT)/ Báo cáo đề xuất CTrĐT',
                    type: 'input', role: 'Đơn vị được giao lập', sla: '10d',
                    metadata: {
                        phase: 'preparation',
                        sub_process: 'I.1. Quyết định chủ trương đầu tư',
                        sub_tasks: [
                            {
                                id: crypto.randomUUID(),
                                name: 'Hoàn thiện BCNCTKT/Báo cáo đề xuất CTrĐT theo ý kiến của Hội đồng thẩm định hoặc đơn vị có chức năng',
                                assignee_role: 'Đơn vị được giao lập',
                                output: 'Báo cáo đã hoàn thiện',
                                template_forms: '',
                                legal_basis: 'Điểm c khoản 1 các điều 25, 27, 28 Luật ĐTC số 58'
                            }
                        ]
                    }
                },
                {
                    name: '4. Quyết định CTrĐT',
                    type: 'approval', role: 'HĐND / UBND các cấp', sla: '10d',
                    metadata: {
                        phase: 'preparation',
                        sub_process: 'I.1. Quyết định chủ trương đầu tư',
                        sub_tasks: [
                            {
                                id: crypto.randomUUID(),
                                name: 'Trình duyệt quyết định CTrĐT. Hồ sơ gồm: Tờ trình, Báo cáo thẩm định, Báo cáo ĐX/BCNCTKT, các tài liệu liên quan',
                                assignee_role: 'Đơn vị được giao lập',
                                output: 'Hồ sơ trình duyệt',
                                template_forms: 'Mẫu số 5',
                                legal_basis: 'Khoản 2 điều 25, 27, 28 Luật ĐTC số 58'
                            },
                            {
                                id: crypto.randomUUID(),
                                name: 'Tổng hợp báo cáo UBND các cấp xem xét quyết định chủ trương đầu tư hoặc trình HĐND cùng cấp quyết định',
                                assignee_role: 'Hội đồng thẩm định / Đơn vị có chức năng',
                                output: 'Nghị quyết / Quyết định CTrĐT',
                                template_forms: '',
                                legal_basis: ''
                            }
                        ]
                    }
                },
                {
                    name: '5. Giao CĐT dự án',
                    type: 'input', role: 'Người quyết định đầu tư', sla: '5d',
                    metadata: {
                        phase: 'preparation',
                        sub_process: 'I.1. Quyết định chủ trương đầu tư',
                        sub_tasks: [
                            {
                                id: crypto.randomUUID(),
                                name: 'Thực hiện giao Chủ đầu tư (CĐT) dự án',
                                assignee_role: 'Người quyết định đầu tư',
                                output: 'Quyết định giao CĐT',
                                template_forms: '',
                                legal_basis: 'Điều 7 Luật Xây dựng năm 2014 (đã được sửa đổi, bổ sung tại Luật số 62)'
                            }
                        ]
                    }
                },
                {
                    name: '6. Lập, thẩm định, phê duyệt nhiệm vụ, dự toán chi phí CBĐT, CBDA',
                    type: 'input', role: 'CĐT / CQ chuyên môn', sla: '10d',
                    metadata: {
                        phase: 'preparation',
                        sub_process: 'I.2. Chuẩn bị đầu tư, chuẩn bị dự án',
                        sub_tasks: [
                            {
                                id: crypto.randomUUID(),
                                name: 'Đối với dự án ĐTC không có cấu phần xây dựng: Lập hồ sơ trình, bao gồm các chi phí lập, thẩm định BCNCKT, BCKT-KT và các công việc cần thiết khác',
                                assignee_role: 'CQ, tổ chức được giao NV CBDA hoặc CĐT',
                                output: 'Hồ sơ trình',
                                template_forms: '',
                                legal_basis: 'Khoản 2 Điều 44 Luật ĐTC số 58'
                            },
                            {
                                id: crypto.randomUUID(),
                                name: 'Thẩm định nhiệm vụ, dự toán chi phí CBĐT, CBDA (Tờ trình, hồ sơ dự toán, tài liệu khác)',
                                assignee_role: 'HĐTĐ / CQ chuyên môn quản lý ĐTC / đơn vị trực thuộc...',
                                output: 'Báo cáo thẩm định nhiệm vụ',
                                template_forms: '',
                                legal_basis: 'Khoản 2 Điều 44 Luật ĐTC số 58'
                            },
                            {
                                id: crypto.randomUUID(),
                                name: 'Phê duyệt nhiệm vụ, dự toán chi phí CBĐT, CBDA (Tờ trình, Hồ sơ, BCTĐ, Tài liệu khác)',
                                assignee_role: 'Chủ tịch UBND các cấp / người đứng đầu cơ quan...',
                                output: 'Quyết định phê duyệt',
                                template_forms: '',
                                legal_basis: 'Khoản 2 Điều 44 Luật ĐTC số 58'
                            },
                            {
                                id: crypto.randomUUID(),
                                name: 'Đối với dự án ĐTC có cấu phần xây dựng: Lập hồ sơ trình, KSXD; lập, thẩm định BCNCTKT, BCĐX CTrĐT, thẩm định BCNCKT, BCKT-KT',
                                assignee_role: 'CQ, tổ chức được giao NV CBDA hoặc CĐT',
                                output: 'Hồ sơ trình',
                                template_forms: '',
                                legal_basis: 'K1, 2 Điều 10 NĐ 10'
                            },
                            {
                                id: crypto.randomUUID(),
                                name: 'Thẩm định chi phí CBDA (Tờ trình, Hồ sơ DTCP, CBĐT, CBDA, Tài liệu khác)',
                                assignee_role: 'Cơ quan thẩm định',
                                output: 'Báo cáo thẩm định chi phí',
                                template_forms: '',
                                legal_basis: ''
                            },
                            {
                                id: crypto.randomUUID(),
                                name: 'Phê duyệt nhiệm vụ, dự toán chi phí CBĐT, CBDA',
                                assignee_role: 'Người có thẩm quyền',
                                output: 'Quyết định phê duyệt',
                                template_forms: '',
                                legal_basis: ''
                            },
                            {
                                id: crypto.randomUUID(),
                                name: 'Đối với dự toán thuê tư vấn nước ngoài: Lập hồ sơ BCNCTKT (quy định tại điểm a khoản 1, Đ20 Luật ĐTC 58)',
                                assignee_role: 'CQ, ĐV được giao NV CBDA hoặc CĐT',
                                output: 'Hồ sơ trình',
                                template_forms: '',
                                legal_basis: 'K3, 4 Điều 10; K4 Điều 32 NĐ số 10'
                            },
                            {
                                id: crypto.randomUUID(),
                                name: 'Thẩm định, phê duyệt',
                                assignee_role: 'Cơ quan chuyên môn / Người quyết định đầu tư',
                                output: 'Quyết định phê duyệt',
                                template_forms: '',
                                legal_basis: 'K1, 2 Điều 44 Luật ĐTC 58'
                            }
                        ]
                    }
                },
                {
                    name: '7. Lập, thẩm định, phê duyệt KHLCNT bước CBĐT, CBDA',
                    type: 'input', role: 'CĐT / Sở Tài chính', sla: '30d',
                    metadata: {
                        phase: 'preparation',
                        sub_process: 'I.2. Chuẩn bị đầu tư, chuẩn bị dự án',
                        sub_tasks: [
                            {
                                id: crypto.randomUUID(),
                                name: 'Lập Tờ trình phê duyệt KH LCNT (Căn cứ lập, Nội dung, Tài liệu kèm theo)',
                                assignee_role: 'Đơn vị thuộc CĐT (hoặc đơn vị được giao NV)',
                                output: 'Tờ trình phê duyệt KH LCNT',
                                template_forms: 'Mẫu số 7',
                                legal_basis: 'Điều 37; K1 Điều 38; Điều 39 Luật ĐT năm 2023'
                            },
                            {
                                id: crypto.randomUUID(),
                                name: 'Thẩm định KH LCNT (tối đa 20 ngày)',
                                assignee_role: 'Tổ chức được giao thẩm định thuộc CĐT',
                                output: 'Báo cáo thẩm định KH LCNT',
                                template_forms: 'Mẫu số 8',
                                legal_basis: 'K3 Điều 40 Luật ĐT năm 2023'
                            },
                            {
                                id: crypto.randomUUID(),
                                name: 'Phê duyệt KH LCNT (tối đa 10 ngày)',
                                assignee_role: 'CĐT (hoặc người đứng đầu đơn vị được giao NV)',
                                output: 'Quyết định phê duyệt KH LCNT',
                                template_forms: 'Mẫu số 9',
                                legal_basis: 'Điều 39; K2 Điều 40 Luật ĐT năm 2023'
                            },
                            {
                                id: crypto.randomUUID(),
                                name: 'Đăng tải quyết định phê duyệt KH LCNT (không muộn hơn 05 ngày làm việc)',
                                assignee_role: 'Người được giao thực hiện công trình (CĐT)',
                                output: 'Thông tin đăng tải hợp lệ',
                                template_forms: '',
                                legal_basis: 'Điểm a, K1; K4 Điều 8 Luật ĐT năm 2023'
                            }
                        ]
                    }
                },
                {
                    name: '8. LCNT khảo sát, tư vấn lập QH, thiết kế XD, tư vấn thẩm tra... bước CBĐT, CBDA',
                    type: 'input', role: 'CĐT / Đơn vị TVKS', sla: '47d',
                    metadata: {
                        phase: 'preparation',
                        sub_process: 'I.2. Chuẩn bị đầu tư, chuẩn bị dự án',
                        sub_tasks: [
                            {
                                id: crypto.randomUUID(),
                                name: 'LCNT tư vấn theo KHLCNT được phê duyệt và Quy trình các bước thực hiện theo hướng dẫn tại Phụ lục số 1',
                                assignee_role: 'CĐT',
                                output: 'Hợp đồng tư vấn',
                                template_forms: '',
                                legal_basis: ''
                            },
                            {
                                id: crypto.randomUUID(),
                                name: 'Tổ chức KSĐĐ',
                                assignee_role: 'CĐT, Đơn vị TVKS',
                                output: 'Báo cáo KSĐĐ',
                                template_forms: '',
                                legal_basis: ''
                            },
                            {
                                id: crypto.randomUUID(),
                                name: 'Cung cấp thông tin, chỉ giới đường đỏ, cung cấp số liệu HTKT (Khu vực chưa có QHCT tỷ lệ 1/500)',
                                assignee_role: 'CĐT, SXD, UBND cấp huyện',
                                output: 'Tài liệu thông tin',
                                template_forms: '',
                                legal_basis: ''
                            }
                        ]
                    }
                },
                {
                    name: '9. Thi tuyển PA kiến trúc; Lập, thẩm định, phê duyệt QH chi tiết (nếu có)',
                    type: 'input', role: 'CĐT / UBND', sla: '82d',
                    metadata: {
                        phase: 'preparation',
                        sub_process: 'I.2. Chuẩn bị đầu tư, chuẩn bị dự án',
                        sub_tasks: [
                            {
                                id: crypto.randomUUID(),
                                name: 'Thi tuyển phương án kiến trúc (nếu có): Tổng thời gian thực hiện 82 ngày (Lập, nhất trí, phê duyệt, mời, thành lập... cho đến công bố)',
                                assignee_role: 'Chủ tịch UBND / CĐT / Hội đồng',
                                output: 'Kết quả thi tuyển PA kiến trúc',
                                template_forms: '',
                                legal_basis: 'Khoản 2, 3, 4 Điều 17 Luật số 40; Điều 16, 18, 19, 20 NĐ 85'
                            },
                            {
                                id: crypto.randomUUID(),
                                name: 'Lập, thẩm định QH chi tiết, QH chi tiết rút gọn (QH tổng mặt bằng)',
                                assignee_role: 'CĐT, SXD, Phòng Kinh tế Hạ tầng',
                                output: 'Hồ sơ trình QH',
                                template_forms: '',
                                legal_basis: 'Đ16 Luật QHĐT&NT số 47; NĐ 35/2023/NĐ-CP'
                            },
                            {
                                id: crypto.randomUUID(),
                                name: 'Phê duyệt QH chi tiết, QH chi tiết rút gọn',
                                assignee_role: 'UBND tỉnh, UBND cấp huyện',
                                output: 'QĐ phê duyệt QH chi tiết',
                                template_forms: '',
                                legal_basis: ''
                            }
                        ]
                    }
                },
                {
                    name: '10. Lập, thẩm định, phê duyệt BCNCKT và BCKT-KT ĐTXD',
                    type: 'input', role: 'CĐT / CQ thẩm định', sla: '60d',
                    metadata: {
                        phase: 'preparation',
                        sub_process: 'I.2. Chuẩn bị đầu tư, chuẩn bị dự án',
                        sub_tasks: [
                            {
                                id: crypto.randomUUID(),
                                name: 'Lập BCNCKT và BCKT-KT ĐTXD (Tối thiểu: Dự án A 80 ngày; B, C 60 ngày)',
                                assignee_role: 'CĐT, ĐVTV',
                                output: 'Hồ sơ BCNCKT / BCKT-KT',
                                template_forms: '',
                                legal_basis: ''
                            },
                            {
                                id: crypto.randomUUID(),
                                name: 'Thỏa thuận cấp điện, cấp nước, thoát nước; đấu nối giao thông... (20 ngày)',
                                assignee_role: 'Các DN quản lý hệ thống HTKT; cơ quan có thẩm quyền',
                                output: 'Văn bản thỏa thuận',
                                template_forms: '',
                                legal_basis: ''
                            },
                            {
                                id: crypto.randomUUID(),
                                name: 'Lập trình thẩm định, phê duyệt ĐTM/ Kế hoạch BVMT (60 ngày)',
                                assignee_role: 'CĐT, ĐVTV / HĐTĐ Bộ TNMT, Bộ QP...',
                                output: 'Quyết định phê duyệt KQTĐ ĐTM',
                                template_forms: '',
                                legal_basis: 'Điều 116 Luật XD; Điều 32, 34, 35, 36 Luật BVMT số 72'
                            },
                            {
                                id: crypto.randomUUID(),
                                name: 'Hoàn thiện BCNCKT/BCKT-KT ĐTXD',
                                assignee_role: 'CĐT, ĐVTV lập BCNCKT',
                                output: 'Hồ sơ hoàn thiện',
                                template_forms: '',
                                legal_basis: 'Điều 14 NĐ số 175.'
                            },
                            {
                                id: crypto.randomUUID(),
                                name: 'Thẩm định BCNCKT/BCKT-KT ĐTXD (Tiếp nhận hồ sơ, lấy ý kiến, tổng hợp)',
                                assignee_role: 'CQ chủ trì thẩm định',
                                output: 'Báo cáo kết quả thẩm định',
                                template_forms: 'Mẫu số 10, 11 a,b,c',
                                legal_basis: 'Điều 59 Luật XD 2014; K13-16 Điều 1 Luật 62; Khoản 1 Điều 22 NĐ 175'
                            }
                        ]
                    }
                },
                {
                    name: '11. Điều chỉnh CTrĐT dự án (nếu có)',
                    type: 'input', role: 'Đầu mối', sla: '10d',
                    metadata: {
                        phase: 'preparation',
                        sub_process: 'I.2. Chuẩn bị đầu tư, chuẩn bị dự án',
                        sub_tasks: [
                            {
                                id: crypto.randomUUID(),
                                name: 'Quy trình, thủ tục quyết định điều chỉnh CTrĐT',
                                assignee_role: 'Cơ quan có thẩm quyền',
                                output: '',
                                template_forms: '',
                                legal_basis: 'Điều 37 Luật ĐTC số 58'
                            },
                            {
                                id: crypto.randomUUID(),
                                name: 'Hồ sơ trình cấp có thẩm quyền quyết định điều chỉnh CTrĐT dự án',
                                assignee_role: 'Đơn vị lập hồ sơ',
                                output: 'Hồ sơ trình điều chỉnh CTrĐT',
                                template_forms: '',
                                legal_basis: 'K3, K4 Điều 11 NĐ số 40'
                            }
                        ]
                    }
                },
                {
                    name: '12. Phê duyệt dự án',
                    type: 'approval', role: 'Chủ tịch UBND các cấp', sla: '7d',
                    metadata: {
                        phase: 'preparation',
                        sub_process: 'I.2. Chuẩn bị đầu tư, chuẩn bị dự án',
                        sub_tasks: [
                            {
                                id: crypto.randomUUID(),
                                name: 'Trình duyệt quyết định đầu tư DA',
                                assignee_role: 'CQ chủ trì thẩm định',
                                output: 'Hồ sơ trình phê duyệt',
                                template_forms: '',
                                legal_basis: ''
                            },
                            {
                                id: crypto.randomUUID(),
                                name: 'Phê duyệt DA (DA nhóm A: không quá 7 ngày; DA nhóm B, C: không quá 5 ngày)',
                                assignee_role: 'Chủ tịch UBND các cấp',
                                output: 'Quyết định phê duyệt DA',
                                template_forms: 'Mẫu số 12 a,b',
                                legal_basis: 'K1 Điều 60 Luật XD 2014; K17 Điều 1 Luật số 62'
                            }
                        ]
                    }
                },
                {
                    name: '13. Thẩm định, phê duyệt điều chỉnh BCNCKT, BCKT-KT ĐTXD (nếu có)',
                    type: 'input', role: 'Cơ quan chủ trì thẩm định', sla: '30d',
                    metadata: {
                        phase: 'preparation',
                        sub_process: 'I.2. Chuẩn bị đầu tư, chuẩn bị dự án',
                        sub_tasks: [
                            {
                                id: crypto.randomUUID(),
                                name: 'Thẩm định BCNCKT ĐTXD điều chỉnh của cơ quan chuyên môn về XD',
                                assignee_role: 'Sở quản lý CTXDCN / Phòng Kinh tế...',
                                output: 'Báo cáo thẩm định điều chỉnh',
                                template_forms: '',
                                legal_basis: 'Khoản 2, 3, 4 Điều 23 NĐ số 175'
                            },
                            {
                                id: crypto.randomUUID(),
                                name: 'Tổng hợp trình phê duyệt BCNCKT ĐTXD điều chỉnh',
                                assignee_role: 'Cơ quan chủ trì thẩm định',
                                output: 'Tờ trình phê duyệt điều chỉnh',
                                template_forms: '',
                                legal_basis: 'Khoản 1 Điều 22 NĐ số 175'
                            },
                            {
                                id: crypto.randomUUID(),
                                name: 'Phê duyệt BCNCKT ĐTXD điều chỉnh',
                                assignee_role: 'Chủ tịch UBND các cấp',
                                output: 'Quyết định phê duyệt điều chỉnh',
                                template_forms: '',
                                legal_basis: 'K1 Điều 60 Luật XD 2014; K17 Điều 1 Luật 62'
                            },
                            {
                                id: crypto.randomUUID(),
                                name: 'Điều chỉnh BCKTKT ĐTXD',
                                assignee_role: 'Cơ quan chủ trì / Chủ tịch UBND',
                                output: 'Quyết định phê duyệt điều chỉnh BCKT-KT',
                                template_forms: '',
                                legal_basis: 'Điều 61 Luật XD 2014; Khoản 5 Điều 23 NĐ 175'
                            }
                        ]
                    }
                }
            ];

            // CÁC BƯỚC CHUẨN BỊ ĐẦU TƯ (GIAI ĐOẠN SAU) - Dùng chung
            const COMMON_PREP_LATE: any[] = [
                { type: 'input', role: 'nha_thau_tu_van', sla: '30d' },
                { type: 'approval', role: 'cq_chuyen_mon', sla: '15d' },
                { type: 'approval', role: 'nguoi_quyet_dinh_dt', sla: '20d' }
            ];

            // Implementation phase common steps
            const IMPL_KHLCNT = {
                name: 'Lập, thẩm định, phê duyệt KHLCNT dự án',
                type: 'input', role: 'CĐT / Sở Tài chính', sla: '30d',
                metadata: {
                    phase: 'execution',
                    sub_process: 'II.1. Lựa chọn nhà thầu',
                    description: 'CĐT lập Tờ trình KHLCNT (Mẫu 7). Sở TC/Phòng TC-KH thẩm định ≤20 ngày (phấn đấu 7 ngày). NTQ phê duyệt ≤10 ngày (phấn đấu 3 ngày). Đăng tải lên mạng ĐTQG trong 5 ngày.',
                    legal_basis: 'Điều 36, 37, 38, 39, 40 Luật Đấu thầu 2023; Khoản 3 Điều 45 Luật ĐT 2023',
                    output: 'Tờ trình (Mẫu 7), BC thẩm định (Mẫu 8), QĐ phê duyệt KHLCNT (Mẫu 9)',
                }
            };

            const IMPL_GPMB = {
                name: 'Bồi thường, hỗ trợ, tái định cư (GPMB)',
                type: 'input', role: 'UBND cấp huyện / CĐT / Tổ GPMB', sla: '90d',
                metadata: {
                    phase: 'execution',
                    sub_process: 'II.2. Giải phóng mặt bằng',
                    description: 'Song song với thiết kế. Tổ chức cắm mốc, lập bản đồ thu hồi đất, kiểm đếm, lên phương án bồi thường trình UBND phê duyệt. Thực hiện chi trả bồi thường và bàn giao mặt bằng.',
                    legal_basis: 'Luật Đất đai 2024; NĐ 88/2024/NĐ-CP về bồi thường, hỗ trợ, TĐC',
                    output: 'QĐ thu hồi đất, Phương án bồi thường đã duyệt, Biên bản bàn giao mặt bằng',
                }
            };

            const IMPL_LCNT_TC = {
                name: 'Lựa chọn nhà thầu Giám sát & Thi công',
                type: 'input', role: 'CĐT / BMT / Tổ chuyên gia', sla: '47d',
                metadata: {
                    phase: 'execution',
                    sub_process: 'II.1. Lựa chọn nhà thầu',
                    description: 'Đấu thầu rộng rãi (≈47 ngày: phát hành HSMT → mở thầu → đánh giá KT, TC → thương thảo → ký HĐ) hoặc Chỉ định thầu (≤45 ngày thông thường, ≤90 ngày gói thầu lớn phức tạp).',
                    legal_basis: 'Luật Đấu thầu 2023; NĐ 24/2024/NĐ-CP; Phụ lục 1 Sổ tay ĐTCHD 2025',
                    output: 'QĐ phê duyệt KQLCNT, Hợp đồng thi công, HĐ tư vấn giám sát',
                }
            };

            const IMPL_THICONG = {
                name: 'Khởi công, Thi công & Quản lý chất lượng',
                type: 'input', role: 'Nhà thầu TC / TV Giám sát / CĐT', sla: '1095d',
                metadata: {
                    phase: 'execution',
                    sub_process: 'II.3. Thi công xây dựng',
                    description: 'Thông báo khởi công cho cơ quan QLNN. Nhà thầu thi công theo TKBVTC đã duyệt. TV giám sát và CĐT quản lý chất lượng liên tục. Thanh toán khối lượng hoàn thành định kỳ (Mẫu 25, 28, 30). SLA thực hiện: Nhóm A ≤6 năm; Nhóm B ≤4 năm; Nhóm C ≤3 năm.',
                    legal_basis: 'NĐ 06/2021/NĐ-CP; NĐ 99/2021/NĐ-CP về thanh toán vốn ĐTC; Điều 125 Luật XD',
                    output: 'Nhật ký thi công, Biên bản nghiệm thu từng phần, Giấy đề nghị thanh toán (Mẫu 25)',
                }
            };

            const IMPL_NGHIEMTHU = {
                name: 'Nghiệm thu hoàn thành CT đưa vào sử dụng',
                type: 'input', role: 'CĐT / TV GS / NT Thi công / CQ KT nhà nước', sla: '30d',
                metadata: {
                    phase: 'execution',
                    sub_process: 'II.3. Thi công xây dựng',
                    description: 'CĐT tổ chức nghiệm thu hoàn thành. Cơ quan chuyên môn về XD kiểm tra: Cấp I/đặc biệt ≤30 ngày (phấn đấu 25 ngày); Còn lại ≤20 ngày (phấn đấu 15 ngày). Bàn giao hồ sơ hoàn thành.',
                    legal_basis: 'Phụ lục VI, VII NĐ 06/2021/NĐ-CP; Điều 123, 124 Luật XD 2014',
                    output: 'BC hoàn thành thi công XD (Mẫu 19A), Danh mục hồ sơ CT (Mẫu 19B), Thông báo KT nghiệm thu (Mẫu 20), Bản vẽ hoàn công',
                }
            };

            // Closing phase
            const CLOSING_STEPS = [
                {
                    name: 'Bàn giao công trình đưa vào sử dụng',
                    type: 'input', role: 'CĐT / Nhà thầu TC / Đơn vị tiếp nhận', sla: '15d',
                    metadata: {
                        phase: 'completion',
                        sub_process: 'III.1. Bàn giao công trình',
                        description: 'CĐT và nhà thầu bàn giao tài liệu: bản vẽ hoàn công, quy trình vận hành, bảo trì, danh mục vật tư thiết bị dự trữ thay thế. Đơn vị tiếp nhận kiểm tra và ký biên bản bàn giao.',
                        legal_basis: 'Điều 124 Luật XD 2014; NĐ 06/2021/NĐ-CP',
                        output: 'Biên bản bàn giao công trình, Hồ sơ hoàn công, Quy trình vận hành bảo trì',
                    }
                },
                {
                    name: 'Lập hồ sơ quyết toán dự án hoàn thành',
                    type: 'input', role: 'CĐT / Các nhà thầu', sla: '120d',
                    metadata: {
                        phase: 'completion',
                        sub_process: 'III.2. Quyết toán dự án hoàn thành',
                        description: 'CĐT và các nhà thầu lập bộ hồ sơ tổng hợp quyết toán. QT chi phí GPMB nếu có. SLA: Nhóm A ≤9 tháng; Nhóm B ≤6 tháng; Nhóm C ≤4 tháng.',
                        legal_basis: 'Điều 34, 47 NĐ 99/2021/NĐ-CP; Điểm b Khoản 3 Điều 32 NĐ 99',
                        output: 'Hồ sơ quyết toán dự án hoàn thành',
                    }
                },
                {
                    name: 'Kiểm toán độc lập (nếu có)',
                    type: 'input', role: 'Nhà thầu Kiểm toán độc lập', sla: '60d',
                    metadata: {
                        phase: 'completion',
                        sub_process: 'III.2. Quyết toán dự án hoàn thành',
                        description: 'Bắt buộc với dự án nhóm A. Nhóm B, C do NQĐ ĐT xem xét quyết định. CĐT tổ chức lựa chọn nhà thầu kiểm toán, ký hợp đồng kiểm toán.',
                        legal_basis: 'Khoản 3 Điều 35 NĐ 99/2021/NĐ-CP; Luật Đấu thầu 2023; NĐ 24/2024/NĐ-CP',
                        output: 'Báo cáo kiểm toán quyết toán dự án hoàn thành',
                    }
                },
                {
                    name: 'Thẩm tra quyết toán dự án hoàn thành',
                    type: 'input', role: 'Sở Tài chính / Phòng TC-KH', sla: '90d',
                    metadata: {
                        phase: 'completion',
                        sub_process: 'III.2. Quyết toán dự án hoàn thành',
                        description: 'Sở TC (dự án tỉnh) hoặc Phòng TC-KH cấp huyện thẩm tra hồ sơ quyết toán. SLA: Nhóm A ≤8 tháng; Nhóm B ≤4 tháng; Nhóm C ≤3 tháng.',
                        legal_basis: 'Điều 34 đến 44 NĐ 99/2021/NĐ-CP',
                        output: 'Báo cáo thẩm tra quyết toán',
                    }
                },
                {
                    name: 'Phê duyệt quyết toán dự án hoàn thành',
                    type: 'approval', role: 'Chủ tịch UBND các cấp', sla: '30d',
                    metadata: {
                        phase: 'completion',
                        sub_process: 'III.2. Quyết toán dự án hoàn thành',
                        description: 'NQĐ ĐT phê duyệt quyết toán dựa trên báo cáo thẩm tra. SLA: Nhóm A ≤1 tháng; Nhóm B ≤20 ngày; Nhóm C ≤15 ngày.',
                        legal_basis: 'Điều 35, 45, 47 NĐ 99/2021/NĐ-CP',
                        output: 'QĐ phê duyệt quyết toán dự án hoàn thành',
                    }
                },
                {
                    name: 'Tất toán tài khoản & đóng mã dự án',
                    type: 'end', role: 'CĐT / Kho bạc Nhà nước', sla: '15d',
                    metadata: {
                        phase: 'completion',
                        sub_process: 'III.3. Tất toán, đóng dự án',
                        description: 'CĐT thanh toán hết công nợ, thu hồi số dư tạm ứng. Kho bạc Nhà nước xác nhận tài khoản có số dư bằng 0. Đóng mã dự án trên hệ thống.',
                        legal_basis: 'NĐ 99/2021/NĐ-CP; Thông tư hướng dẫn của Bộ Tài chính',
                        output: 'Xác nhận tất toán KBNN, Thông báo đóng mã dự án',
                    }
                },
            ];

            // ═══════════════════════════════════════════════════════════════
            // QUY TRÌNH I.1: Quyết định chủ trương ĐT
            // ═══════════════════════════════════════════════════════════════
            const WF_I_1 = {
                name: 'Trình tự, thủ tục quyết định chủ trương đầu tư dự án nhóm A, B, C sử dụng vốn ĐTC do địa phương quản lý',
                code: 'I.1',
                category: 'project' as const,
                description: 'Quy trình thực hiện giai đoạn chuẩn bị dự án - Quyết định chủ trương đầu tư.',
                steps: COMMON_PREP_STEPS
            };
            
            // ═══════════════════════════════════════════════════════════════
            // QUY TRÌNH I.2: Trình tự, thủ tục chuẩn bị đầu tư, chuẩn bị dự án
            // ═══════════════════════════════════════════════════════════════
            const WF_I_2 = {
                name: 'Trình tự, thủ tục chuẩn bị đầu tư, chuẩn bị dự án',
                code: 'I.2',
                category: 'project' as const,
                description: 'Quy trình I.2: Chuẩn bị đầu tư, chuẩn bị dự án bao gồm 8 bước theo Sổ tay Quản lý DAĐTC Hải Dương 2025.',
                steps: [
                    {
                        name: '1. Lập, thẩm định, phê duyệt nhiệm vụ, dự toán chi phí CBĐT, CBDA',
                        type: 'input', role: 'CĐT / CQ chuyên môn', sla: '30d',
                        metadata: {
                            phase: 'preparation',
                            sub_tasks: [
                                { id: crypto.randomUUID(), name: '1. Đối với dự án ĐTC không có cấu phần xây dựng (Lập hồ sơ, Thẩm định, Phê duyệt)', assignee_role: 'CĐT / HĐTĐ', legal_basis: 'Khoản 2 Điều 44 Luật ĐTC số 58', output: 'Quyết định phê duyệt NV, DT', template_forms: '' },
                                { id: crypto.randomUUID(), name: '2. Đối với dự án ĐTC có cấu phần xây dựng (Lập hồ sơ KSXD, BCNCKT, BCKT-KT; Thẩm định chi phí; Phê duyệt)', assignee_role: 'CĐT', legal_basis: 'K1, 2 Điều 10 NĐ số 10', output: 'Quyết định phê duyệt NV, DT', template_forms: '' },
                                { id: crypto.randomUUID(), name: '3. Đối với Dự toán thuê tư vấn nước ngoài thực hiện công việc CBDA', assignee_role: 'CĐT / NQĐ ĐT', legal_basis: 'K3, 4 Điều 10; K4 Điều 32 NĐ số 10', output: 'Phê duyệt dự toán', template_forms: '' }
                            ]
                        }
                    },
                    {
                        name: '2. Lập, thẩm định, phê duyệt KHLCNT bước CBĐT, CBDA',
                        type: 'input', role: 'CĐT / NQĐ ĐT', sla: '15d',
                        metadata: {
                            phase: 'preparation',
                            sub_tasks: [
                                { id: crypto.randomUUID(), name: '1. Lập Tờ trình phê duyệt KH LCNT', assignee_role: 'CĐT', legal_basis: 'Điều 37; K1 Điều 38; Điều 39 Luật ĐT 2023', output: 'Tờ trình', template_forms: 'Mẫu số 7' },
                                { id: crypto.randomUUID(), name: '2. Thẩm định KH LCNT (tối đa 20 ngày)', assignee_role: 'Tổ chức thẩm định', legal_basis: 'K3 Điều 40 Luật ĐT 2023', output: 'Báo cáo thẩm định', template_forms: 'Mẫu số 8' },
                                { id: crypto.randomUUID(), name: '3. Phê duyệt KH LCNT (tối đa 10 ngày)', assignee_role: 'CĐT', legal_basis: 'Điều 39; K2 Điều 40 Luật ĐT 2023', output: 'Quyết định phê duyệt', template_forms: 'Mẫu số 9' },
                                { id: crypto.randomUUID(), name: '4. Đăng tải quyết định phê duyệt KH LCNT', assignee_role: 'CĐT', legal_basis: 'Điểm a, K1; K4 Điều 8 Luật ĐT 2023', output: 'Thông báo trên mạng ĐTQG', template_forms: '' }
                            ]
                        }
                    },
                    {
                        name: '3. LCNT khảo sát, tư vấn lập QH, thiết kế XD; tư vấn thẩm tra... bước CBĐT, CBDA',
                        type: 'input', role: 'CĐT', sla: '30d',
                        metadata: {
                            phase: 'preparation',
                            sub_tasks: [
                                { id: crypto.randomUUID(), name: '1. LCNT tư vấn theo KHLCNT được phê duyệt', assignee_role: 'CĐT', legal_basis: 'Phụ lục số 1', output: 'QĐ phê duyệt KQLCNT', template_forms: '' },
                                { id: crypto.randomUUID(), name: '2. Tổ chức KSĐĐ', assignee_role: 'CĐT, ĐVTV', legal_basis: '', output: 'Hồ sơ khảo sát', template_forms: '' },
                                { id: crypto.randomUUID(), name: '3. Cung cấp thông tin, chỉ giới đường đỏ, cung cấp số liệu HTKT', assignee_role: 'CĐT, SXD, UBND cấp huyện', legal_basis: '', output: 'Thông tin quy hoạch', template_forms: '' }
                            ]
                        }
                    },
                    {
                        name: '4. Thi tuyển PA kiến trúc; Lập, thẩm định, phê duyệt QH chi tiết (nếu có)',
                        type: 'input', role: 'CĐT / Hội đồng / UBND', sla: '82d',
                        metadata: {
                            phase: 'preparation',
                            sub_tasks: [
                                { id: crypto.randomUUID(), name: '1. Thi tuyển PA kiến trúc (Tổng thời gian 82 ngày)', assignee_role: 'CĐT / Hội đồng thi tuyển', legal_basis: 'Điều 17 Luật số 40', output: 'QĐ phê duyệt KQ thi tuyển', template_forms: '' },
                                { id: crypto.randomUUID(), name: '2. Lập, thẩm định QH chi tiết, QH chi tiết rút gọn', assignee_role: 'CĐT, SXD, Phòng KT, UBND', legal_basis: 'Điều 16 Luật QHĐT&NT số 47, NĐ 35/2023', output: 'Đồ án QHCT được quyệt', template_forms: '' }
                            ]
                        }
                    },
                    {
                        name: '5. Lập, thẩm định, phê duyệt BCNCKT và BCKT-KT ĐTXD',
                        type: 'input', role: 'CĐT / CQ chủ trì thẩm định', sla: '80d',
                        metadata: {
                            phase: 'preparation',
                            sub_tasks: [
                                { id: crypto.randomUUID(), name: '1. Lập BCNCKT và BCKT-KT ĐTXD (Nhóm A: ≤80 ngày; Nhóm B,C: ≤60 ngày)', assignee_role: 'CĐT, ĐVTV', legal_basis: '', output: 'Hồ sơ dự án', template_forms: '' },
                                { id: crypto.randomUUID(), name: '2. Thỏa thuận cấp điện, nước, PCCC, giao thông, tĩnh không', assignee_role: 'CĐT / Các đơn vị QL HTKT', legal_basis: '', output: 'Các văn bản thỏa thuận', template_forms: '' },
                                { id: crypto.randomUUID(), name: '3. Lập, trình thẩm định, phê duyệt ĐTM/ Kế hoạch BVMT (≤60 ngày)', assignee_role: 'CĐT, ĐVTV / HĐTĐ / UBND', legal_basis: 'Luật BVMT số 72', output: 'QĐ phê duyệt ĐTM', template_forms: '' },
                                { id: crypto.randomUUID(), name: '4. Hoàn thiện BCNCKT/BCKT-KT ĐTXD', assignee_role: 'CĐT, ĐVTV', legal_basis: 'Điều 14 NĐ số 175', output: 'Hồ sơ DA hoàn thiện', template_forms: '' },
                                { id: crypto.randomUUID(), name: '5. Thẩm định BCNCKT/ BCKT-KT (Lấy ý kiến, Tổng hợp trình)', assignee_role: 'CQ chủ trì thẩm định', legal_basis: 'Điều 56-59 Luật XD 2014; NĐ 175', output: 'Báo cáo thẩm định', template_forms: 'Mẫu 10, 11 a,b,c' }
                            ]
                        }
                    },
                    {
                        name: '6. Điều chỉnh CTrĐT dự án (nếu có)',
                        type: 'input', role: 'CĐT / NQĐ ĐT', sla: '20d',
                        metadata: {
                            phase: 'preparation',
                            sub_tasks: [
                                { id: crypto.randomUUID(), name: '1. Quy trình, thủ tục quyết định điều chỉnh CTrĐT', assignee_role: 'CĐT', legal_basis: 'Điều 37 Luật ĐTC số 58', output: 'Nghị quyết điều chỉnh', template_forms: '' },
                                { id: crypto.randomUUID(), name: '2. Hồ sơ trình cấp có thẩm quyền quyết định điều chỉnh CTrĐT dự án', assignee_role: 'CĐT', legal_basis: 'K3, 4 Điều 11 NĐ số 40', output: 'Tờ trình điều chỉnh', template_forms: '' }
                            ]
                        }
                    },
                    {
                        name: '7. Phê duyệt dự án',
                        type: 'approval', role: 'CQ thẩm định / Chủ tịch UBND', sla: '7d',
                        metadata: {
                            phase: 'preparation',
                            sub_tasks: [
                                { id: crypto.randomUUID(), name: '1. Trình duyệt quyết định đầu tư DA', assignee_role: 'CQ chủ trì thẩm định', legal_basis: '', output: 'Tờ trình phê duyệt', template_forms: '' },
                                { id: crypto.randomUUID(), name: '2. Phê duyệt DA (Nhóm A: ≤7 ngày; Nhóm B,C: ≤5 ngày)', assignee_role: 'Chủ tịch UBND các cấp', legal_basis: 'K1 Điều 60 Luật XD 2014; K17 Điều 1 Luật 62', output: 'Quyết định phê duyệt dự án', template_forms: 'Mẫu số 12 a,b' }
                            ]
                        }
                    },
                    {
                        name: '8. Thẩm định, phê duyệt điều chỉnh BCNCKT, BCKT-KT, ĐC thiết kế XD sau TKCS (nếu có)',
                        type: 'approval', role: 'Sở chuyên ngành / UBND / CĐT', sla: '30d',
                        metadata: {
                            phase: 'preparation',
                            sub_tasks: [
                                { id: crypto.randomUUID(), name: '1. Điều chỉnh BCNCKT ĐTXD (Thẩm định, Tổng hợp, Phê duyệt)', assignee_role: 'Sở QL / CQ thẩm định / Chủ tịch UBND', legal_basis: 'Điều 61 Luật XD 2014; Khoản 1 Điều 22 NĐ 175', output: 'QĐ phê duyệt BCNCKT điều chỉnh', template_forms: '' },
                                { id: crypto.randomUUID(), name: '2. Điều chỉnh BCKTKT ĐTXD', assignee_role: 'Sở QL / CQ thẩm định / Chủ tịch UBND', legal_basis: 'Điều 61 Luật XD 2014; Khoản 5 Điều 23 NĐ 175', output: 'QĐ phê duyệt BCKTKT điều chỉnh', template_forms: '' }
                            ]
                        }
                    }
                ]
            };
            
            // ═══════════════════════════════════════════════════════════════
            // WORKFLOW 1: THIẾT KẾ 3 BƯỚC (DA quy mô lớn, phức tạp)
            // TKCS → TKKT → TKBVTC
            // ═══════════════════════════════════════════════════════════════
            const WF_3STEP = {
                name: 'Quy trình DAXD - Thiết kế 3 bước',
                code: 'QT-TK3B',
                category: 'project' as const,
                description: 'Quy trình thực hiện dự án đầu tư xây dựng áp dụng thiết kế 3 bước (TKCS → TKKT → TKBVTC) dành cho dự án quy mô lớn, phức tạp (Nhóm A). Theo Sổ tay Quản lý DAĐTC Hải Dương 2025, Luật Đầu tư công 2024 và Luật Xây dựng 2014 sửa đổi.',
                steps: [
                    ...COMMON_PREP_STEPS,
                    // 9. Lập dự án (BCNCKT + TKCS)
                    { ...COMMON_PREP_LATE[0], name: '9. Lập dự án (BCNCKT + Thiết kế cơ sở)' },
                    { ...COMMON_PREP_LATE[1], name: '10. Thẩm định dự án đầu tư (BCNCKT)' },
                    { ...COMMON_PREP_LATE[2], name: '11. Phê duyệt dự án đầu tư' },
                    // IMPLEMENTATION
                    { ...IMPL_KHLCNT, name: '12. Lập, thẩm định, phê duyệt KHLCNT dự án' },
                    {
                        name: '13. Nhiệm vụ khảo sát & lựa chọn NT tư vấn TK',
                        type: 'input', role: 'CĐT / Đơn vị tư vấn', sla: '47d',
                        metadata: {
                            phase: 'execution',
                            sub_process: 'II.0. Thiết kế triển khai sau TKCS',
                            description: 'Lập nhiệm vụ KSTK triển khai sau TKCS (bao gồm đo đạc, cắm mốc GPMB). Tổ chức đấu thầu chọn nhà thầu khảo sát, tư vấn thiết kế kỹ thuật, tư vấn thẩm tra.',
                            legal_basis: 'Điều 76 Luật XD 2014 (sửa đổi Luật 62); Điều 14 NĐ 10/2021/NĐ-CP',
                            output: 'QĐ phê duyệt nhiệm vụ KSTK, HĐ tư vấn thiết kế',
                        }
                    },
                    {
                        name: '14. Lập Thiết kế kỹ thuật (TKKT)',
                        type: 'input', role: 'Nhà thầu tư vấn TK', sla: '80d',
                        metadata: {
                            phase: 'execution',
                            sub_process: 'II.0. Thiết kế triển khai sau TKCS',
                            description: 'Bước TK thứ 2/3. Nhà thầu TK lập hồ sơ TKKT chi tiết kết cấu, vật liệu, hệ thống kỹ thuật. SLA: Nhóm A ≥80 ngày. Đồng thời thỏa thuận PCCC, quy hoạch (30 ngày).',
                            legal_basis: 'Điều 79, 80 Luật XD 2014; NĐ 175/2024/NĐ-CP',
                            output: 'Hồ sơ TKKT (thuyết minh, bản vẽ, chỉ dẫn kỹ thuật)',
                        }
                    },
                    {
                        name: '15. Thẩm định TKKT',
                        type: 'input', role: 'Sở XD / CQ chuyên môn về XD', sla: '40d',
                        metadata: {
                            phase: 'execution',
                            sub_process: 'II.0. Thiết kế triển khai sau TKCS',
                            description: 'CQ chuyên môn về XD thẩm định TKKT. SLA: Cấp I/đặc biệt ≤40 ngày; Cấp II,III ≤30 ngày; Còn lại ≤20 ngày.',
                            legal_basis: 'Điều 82, 83a Luật XD 2014; NĐ 175/2024/NĐ-CP',
                            output: 'Báo cáo thẩm định TKKT (Mẫu 14)',
                        }
                    },
                    {
                        name: '16. Phê duyệt TKKT',
                        type: 'approval', role: 'Chủ đầu tư', sla: '7d',
                        metadata: {
                            phase: 'execution',
                            sub_process: 'II.0. Thiết kế triển khai sau TKCS',
                            description: 'CĐT phê duyệt TKKT trong 7 ngày kể từ ngày nhận báo cáo thẩm định.',
                            legal_basis: 'Khoản 8 Điều 82 Luật XD 2014',
                            output: 'QĐ phê duyệt TKKT (Mẫu 15)',
                        }
                    },
                    {
                        name: '17. Lập Thiết kế bản vẽ thi công (TKBVTC) & Dự toán',
                        type: 'input', role: 'Nhà thầu tư vấn TK', sla: '60d',
                        metadata: {
                            phase: 'execution',
                            sub_process: 'II.0. Thiết kế triển khai sau TKCS',
                            description: 'Bước TK thứ 3/3. Lập TKBVTC chi tiết và dự toán xây dựng dựa trên TKKT đã duyệt. Đây là bản vẽ thi công cuối cùng để nhà thầu thi công thực hiện.',
                            legal_basis: 'Điều 80 Luật XD 2014; NĐ 10/2021/NĐ-CP',
                            output: 'Hồ sơ TKBVTC + Dự toán XD (Tờ trình thẩm định Mẫu 13)',
                        }
                    },
                    {
                        name: '18. Thẩm định & Phê duyệt TKBVTC - Dự toán',
                        type: 'approval', role: 'CĐT / CQ chuyên môn XD', sla: '30d',
                        metadata: {
                            phase: 'execution',
                            sub_process: 'II.0. Thiết kế triển khai sau TKCS',
                            description: 'Thẩm định TKBVTC-DT: Cấp II,III ≤30 ngày; Còn lại ≤20 ngày. CĐT phê duyệt trong 7 ngày.',
                            legal_basis: 'Điều 82, 83a Luật XD 2014; NĐ 175/2024/NĐ-CP',
                            output: 'BC thẩm định (Mẫu 14), QĐ phê duyệt TKBVTC-DT (Mẫu 15)',
                        }
                    },
                    { ...IMPL_GPMB, name: '19. Bồi thường, GPMB (song song từ bước 13)' },
                    { ...IMPL_LCNT_TC, name: '20. Lựa chọn nhà thầu Giám sát & Thi công' },
                    { ...IMPL_THICONG, name: '21. Khởi công, Thi công & QLCL' },
                    { ...IMPL_NGHIEMTHU, name: '22. Nghiệm thu hoàn thành CT' },
                    // CLOSING
                    ...CLOSING_STEPS.map((s, i) => ({ ...s, name: `${23 + i}. ${s.name.replace(/^\d+\.\s*/, '')}` })),
                ]
            };

            // ═══════════════════════════════════════════════════════════════
            // WORKFLOW 2: THIẾT KẾ 2 BƯỚC (DA lập BCNCKT thông thường)
            // TKCS → TKBVTC
            // ═══════════════════════════════════════════════════════════════
            const WF_2STEP = {
                name: 'Quy trình DAXD - Thiết kế 2 bước',
                code: 'QT-TK2B',
                category: 'project' as const,
                description: 'Quy trình thực hiện dự án đầu tư xây dựng áp dụng thiết kế 2 bước (TKCS → TKBVTC) dành cho dự án Nhóm B và Nhóm C lập Báo cáo Nghiên cứu khả thi. Theo Sổ tay ĐTCHD 2025.',
                steps: [
                    ...COMMON_PREP_STEPS,
                    { ...COMMON_PREP_LATE[0], name: '9. Lập dự án (BCNCKT + Thiết kế cơ sở)' },
                    { ...COMMON_PREP_LATE[1], name: '10. Thẩm định dự án đầu tư (BCNCKT)' },
                    { ...COMMON_PREP_LATE[2], name: '11. Phê duyệt dự án đầu tư' },
                    // IMPLEMENTATION
                    { ...IMPL_KHLCNT, name: '12. Lập, thẩm định, phê duyệt KHLCNT dự án' },
                    {
                        name: '13. Nhiệm vụ KSTK & lựa chọn NT tư vấn TK',
                        type: 'input', role: 'CĐT / Đơn vị tư vấn', sla: '47d',
                        metadata: {
                            phase: 'execution',
                            sub_process: 'II.0. Thiết kế triển khai sau TKCS',
                            description: 'Lập nhiệm vụ KSTK triển khai sau TKCS. Tổ chức đấu thầu chọn nhà thầu khảo sát, tư vấn lập TKBVTC, tư vấn thẩm tra.',
                            legal_basis: 'Điều 76 Luật XD 2014 (sửa đổi Luật 62); Điều 14 NĐ 10/2021/NĐ-CP',
                            output: 'QĐ phê duyệt nhiệm vụ KSTK, HĐ tư vấn',
                        }
                    },
                    {
                        name: '14. Lập Thiết kế BVTC & Dự toán XD',
                        type: 'input', role: 'Nhà thầu tư vấn TK', sla: '60d',
                        metadata: {
                            phase: 'execution',
                            sub_process: 'II.0. Thiết kế triển khai sau TKCS',
                            description: 'Bước TK thứ 2/2. Lập TKBVTC và dự toán XD triển khai trực tiếp từ TKCS đã duyệt (không qua TKKT). SLA: Nhóm B,C ≥60 ngày. Thỏa thuận PCCC, quy hoạch (30 ngày).',
                            legal_basis: 'Điều 79, 80 Luật XD 2014; NĐ 175/2024/NĐ-CP',
                            output: 'Hồ sơ TKBVTC + Dự toán XD (Tờ trình Mẫu 13)',
                        }
                    },
                    {
                        name: '15. Thẩm định & Phê duyệt TK-DT',
                        type: 'approval', role: 'CĐT / CQ chuyên môn XD', sla: '30d',
                        metadata: {
                            phase: 'execution',
                            sub_process: 'II.0. Thiết kế triển khai sau TKCS',
                            description: 'Thẩm định TKBVTC-DT: Cấp II,III ≤30 ngày; Còn lại ≤20 ngày. CĐT phê duyệt trong 7 ngày.',
                            legal_basis: 'Điều 82, 83a Luật XD 2014; NĐ 175/2024/NĐ-CP',
                            output: 'BC thẩm định (Mẫu 14), QĐ phê duyệt TK-DT (Mẫu 15)',
                        }
                    },
                    { ...IMPL_GPMB, name: '16. Bồi thường, GPMB (song song từ bước 13)' },
                    { ...IMPL_LCNT_TC, name: '17. Lựa chọn nhà thầu Giám sát & Thi công' },
                    { ...IMPL_THICONG, name: '18. Khởi công, Thi công & QLCL' },
                    { ...IMPL_NGHIEMTHU, name: '19. Nghiệm thu hoàn thành CT' },
                    // CLOSING
                    ...CLOSING_STEPS.map((s, i) => ({ ...s, name: `${20 + i}. ${s.name.replace(/^\d+\.\s*/, '')}` })),
                ]
            };

            // ═══════════════════════════════════════════════════════════════
            // WORKFLOW 3: THIẾT KẾ 1 BƯỚC (DA lập BCKT-KT, quy mô nhỏ)
            // TKBVTC tích hợp trong BCKT-KT
            // ═══════════════════════════════════════════════════════════════
            const WF_1STEP = {
                name: 'Quy trình DAXD - Thiết kế 1 bước',
                code: 'QT-TK1B',
                category: 'project' as const,
                description: 'Quy trình thực hiện dự án đầu tư xây dựng áp dụng thiết kế 1 bước (TKBVTC tích hợp trong BCKT-KT) dành cho dự án Nhóm C quy mô nhỏ, đơn giản. KHÔNG cần lập thiết kế triển khai sau. Theo Sổ tay ĐTCHD 2025.',
                steps: [
                    COMMON_PREP_STEPS[0], // 1. Lập BCNCTKT/ Báo cáo đề xuất CTrĐT
                    COMMON_PREP_STEPS[1], // 2. Thẩm định Báo cáo đề xuất
                    COMMON_PREP_STEPS[2], // 3. Hoàn thiện Báo cáo
                    COMMON_PREP_STEPS[3], // 4. Quyết định CTrĐT
                    COMMON_PREP_STEPS[4], // 5. Giao CĐT
                    COMMON_PREP_STEPS[5], // 6. Lập, thẩm định NV dự toán CBĐT
                    COMMON_PREP_STEPS[6], // 7. KHLCNT bước CBĐT
                    { ...COMMON_PREP_STEPS[7], name: '8. LCNT khảo sát, lập BCKT-KT' },
                    {
                        name: '9. Lập Báo cáo KT-KT (tích hợp TKBVTC + Dự toán)',
                        type: 'input', role: 'CĐT / Đơn vị tư vấn', sla: '60d',
                        metadata: {
                            phase: 'execution',
                            sub_process: 'II.0. Lập hồ sơ BCKT-KT',
                            description: 'Đặc thù TK 1 bước: TKBVTC và Dự toán được lập tích hợp trong BCKT-KT. Không cần TKCS riêng. Tư vấn khảo sát và lập hồ sơ BCKT-KT đồng thời. SLA: ≥60 ngày.',
                            legal_basis: 'Khoản 3 Điều 52 Luật XD 2014; NĐ 175/2024/NĐ-CP',
                            output: 'Hồ sơ BCKT-KT (có TKBVTC + Dự toán tích hợp)',
                        }
                    },
                    {
                        name: '10. Thẩm định BCKT-KT',
                        type: 'input', role: 'Phòng KT-HT / Sở chuyên ngành', sla: '20d',
                        metadata: {
                            phase: 'execution',
                            sub_process: 'II.0. Lập hồ sơ BCKT-KT',
                            description: 'CQ chuyên môn XD thẩm định BCKT-KT (bao gồm cả TKBVTC tích hợp). SLA: Nhóm C ≤20 ngày (phấn đấu 15 ngày). Lấy ý kiến sở ngành ≤5 ngày.',
                            legal_basis: 'Điều 59 Luật XD 2014; NĐ 175/2024/NĐ-CP',
                            output: 'Báo cáo thẩm định BCKT-KT (Mẫu 11c)',
                        }
                    },
                    {
                        name: '11. Phê duyệt BCKT-KT (= phê duyệt dự án)',
                        type: 'approval', role: 'Chủ tịch UBND / CĐT', sla: '5d',
                        metadata: {
                            phase: 'execution',
                            sub_process: 'II.0. Lập hồ sơ BCKT-KT',
                            description: 'Phê duyệt BCKT-KT đồng nghĩa phê duyệt luôn dự án, TKBVTC + Dự toán (TK 1 bước). Nhóm C: ≤5 ngày. Dự án chuyển thẳng sang đấu thầu thi công, KHÔNG cần lập TK triển khai thêm.',
                            legal_basis: 'Khoản 1 Điều 60 Luật XD 2014',
                            output: 'QĐ phê duyệt BCKT-KT (Mẫu 12b) — bao gồm phê duyệt TKBVTC',
                        }
                    },
                    // IMPLEMENTATION — skip TK triển khai, go straight to LCNT
                    { ...IMPL_KHLCNT, name: '12. Lập, thẩm định, phê duyệt KHLCNT dự án' },
                    { ...IMPL_GPMB, name: '13. Bồi thường, GPMB (nếu có)' },
                    { ...IMPL_LCNT_TC, name: '14. Lựa chọn nhà thầu Giám sát & Thi công' },
                    { ...IMPL_THICONG, name: '15. Khởi công, Thi công & QLCL' },
                    { ...IMPL_NGHIEMTHU, name: '16. Nghiệm thu hoàn thành CT' },
                    // CLOSING
                    ...CLOSING_STEPS.map((s, i) => ({ ...s, name: `${17 + i}. ${s.name.replace(/^\d+\.\s*/, '')}` })),
                ]
            };
    return [WF_I_1, WF_I_2, WF_3STEP, WF_2STEP, WF_1STEP];
}