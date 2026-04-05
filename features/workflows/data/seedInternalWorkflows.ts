import type { WorkflowTemplate } from './seedWorkflows';

export function getInternalWorkflowTemplates(): WorkflowTemplate[] {
    const QT_TDTK: WorkflowTemplate = {
        name: 'Thẩm định, phê duyệt thiết kế - dự toán xây dựng triển khai sau thiết kế cơ sở',
        code: 'QT-01/TĐTK',
        category: 'other',
        description: 'Quy trình thẩm định, phê duyệt thiết kế - dự toán xây dựng triển khai sau thiết kế cơ sở được chia thành 5 bước cụ thể theo Quy định.',
        steps: [
            {
                name: '1. Khởi tạo và trình hồ sơ',
                type: 'start', 
                role: 'Ban điều hành dự án (BĐH)', 
                sla: '1d',
                metadata: {
                    phase: 'reception',
                    guidelines: `- **Chủ thể phụ trách**: Ban điều hành dự án (BĐH)\n- **Hành động 1.1 (Nhánh Nội bộ)**: BĐH kiểm tra hồ sơ và chuyển toàn bộ hồ sơ thiết kế đến Phòng Kỹ thuật - Chất lượng (P.KTCL) để bắt đầu thẩm định nội bộ.\n- **Hành động 1.2 (Nhánh Nhà nước)**: Đồng thời, BĐH lập Tờ trình (theo biểu mẫu BM04) trình Ban Giám đốc (BGĐ) ký gửi Cơ quan chuyên môn (CQCM) về xây dựng để thẩm định.\n- **Yêu cầu kết quả**: Hồ sơ được chuyển thành công đến P.KTCL và Tờ trình gửi CQCM được BGĐ ký duyệt.\n- **Thời gian**: Thực hiện ngay khi bắt đầu.`,
                    sub_tasks: [
                        { id: crypto.randomUUID(), name: 'BĐH kiểm tra điều kiện năng lực, sự đáp ứng yêu cầu thiết kế và khối lượng, chủng loại.', assignee_role: 'BĐH' },
                        { id: crypto.randomUUID(), name: 'BĐH chuyển hồ sơ đến P.KTCL để thẩm định song song cùng CQCM.', assignee_role: 'BĐH' },
                        { id: crypto.randomUUID(), name: 'BĐH lập tờ trình trình Ban Giám đốc (BGĐ) ký gửi CQCM để thẩm định.', assignee_role: 'BĐH' },
                    ]
                }
            },
            {
                name: '2. Tiến hành thẩm định và Phân luồng',
                type: 'input', 
                role: 'Phòng KTCL & CQCM', 
                sla: '40d',
                metadata: {
                    phase: 'review',
                    guidelines: `- **Luồng 2A: Thẩm định Nội bộ (Tại P.KTCL)**\n  - **Hành động**: P.KTCL tiếp nhận hồ sơ từ BĐH và lập báo cáo thẩm định nội nghiệp.\n  - **Quyết định**: Nhận định kết quả lập báo cáo. Nếu "Không đạt", trả lại hồ sơ cho BĐH. Nếu "Đạt", P.KTCL ký Báo cáo thẩm định trình BGĐ.\n  - **Thời gian**: Không quá 40 ngày (Công trình cấp I), 15 ngày (Cấp II, III), 10 ngày (Công trình còn lại).\n- **Luồng 2B: Thẩm định Nhà nước (Tại CQCM)**\n  - **Hành động**: CQCM tiếp nhận tờ trình từ BGĐ và thẩm định.\n  - **Quyết định**: Nếu "Đạt", CQCM phát hành "Thông báo Kết quả thẩm định".`,
                    sub_tasks: [
                        { id: crypto.randomUUID(), name: 'Luồng 2A: P.KTCL thực hiện thẩm định theo quy định. Sau đó lập báo cáo kết quả trình lên BGĐ.', assignee_role: 'P.KTCL' },
                        { id: crypto.randomUUID(), name: 'Luồng 2B: CQCM nhận hồ sơ, tiến hành thẩm định và gửi thông báo kết quả thẩm định cho BĐH.', assignee_role: 'CQCM' },
                    ]
                }
            },
            {
                name: '3. Hội tụ, tổng hợp và thông báo của CĐT',
                type: 'input', 
                role: 'Ban Giám đốc (BGĐ)', 
                sla: '5d',
                metadata: {
                    phase: 'consolidation',
                    guidelines: `*(Chỉ kích hoạt khi Nhánh 2A và 2B đều ĐẠT)*\n- **Chủ thể phụ trách**: Ban Giám đốc (BGĐ) và P.KTCL\n- **Hành động 3.1 & 3.2**: Căn cứ thông báo của CQCM, xem xét các ý kiến. P.KTCL lập Báo cáo tổng hợp kết quả thẩm định trình Ban Giám đốc (Đối với công trình cấp I do Hội đồng Kỹ thuật quyết định).\n- **Hành động 3.3**: Ban Giám đốc ký ban hành "Thông báo thẩm định của Chủ đầu tư".\n- **Yêu cầu kết quả**: Thông báo kết quả thẩm định được ban hành.`,
                    sub_tasks: [
                        { id: crypto.randomUUID(), name: 'P.KTCL căn cứ thông báo của CQCM, xem xét và lập báo cáo tổng hợp để BGĐ ban hành thông báo.', assignee_role: 'P.KTCL' },
                        { id: crypto.randomUUID(), name: 'BGĐ ban hành thông báo tiếp thu, giải trình ý kiến của CQCM (nếu có yêu cầu chỉnh sửa).', assignee_role: 'BGĐ' },
                    ]
                }
            },
            {
                name: '4. Phê duyệt thiết kế - dự toán',
                type: 'approval', 
                role: 'Ban Giám đốc (BGĐ)', 
                sla: '5d',
                metadata: {
                    phase: 'approval',
                    guidelines: `- **Chủ thể phụ trách**: P.KTCL phối hợp BĐH trình Ban Giám đốc.\n- **Hành động**: Ban Giám đốc (Ban DDCN) chính thức ký Quyết định Phê duyệt Thiết kế - Dự toán. Chủ đầu tư sau đó gửi hồ sơ đóng dấu thẩm định đến Sở Xây dựng lưu trữ.\n- **Yêu cầu kết quả**: Quyết định phê duyệt được ban hành (BM 07).`,
                    sub_tasks: [
                        { id: crypto.randomUUID(), name: 'BGĐ phê duyệt thiết kế - dự toán.', assignee_role: 'BGĐ' },
                        { id: crypto.randomUUID(), name: 'Phòng ban liên quan đóng dấu thẩm định, phê duyệt và lưu trữ hồ sơ theo quy định.', assignee_role: 'Phòng ban liên quan' },
                    ]
                }
            },
            {
                name: '5. Nghiệm thu',
                type: 'end', 
                role: 'Hội đồng Kỹ thuật / BĐH', 
                sla: '10d',
                metadata: {
                    phase: 'completion',
                    guidelines: `- **Hành động**: Thực hiện việc nghiệm thu hồ sơ thiết kế theo kế hoạch. BĐH chủ trì cùng với các thành phần liên quan.`,
                    sub_tasks: [
                        { id: crypto.randomUUID(), name: 'Thực hiện việc nghiệm thu hồ sơ thiết kế theo kế hoạch.', assignee_role: 'Hội đồng Kỹ thuật / BĐH' },
                    ]
                }
            },
        ]
    };

    return [QT_TDTK];
}
