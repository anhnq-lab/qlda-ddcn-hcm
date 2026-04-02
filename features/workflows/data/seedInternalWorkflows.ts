// Seed Data: 9 Quy trình Nội bộ Ban DDCN TP.HCM
// Extracted from NotebookLM research - Quy chế & Quy trình nội bộ Ban DDCN

import type { WorkflowTemplate } from './seedWorkflows';

export function getInternalWorkflowTemplates(): WorkflowTemplate[] {

    // ═══════════════════════════════════════════════════════════════
    // 1. QT Báo cáo Giám sát, Đánh giá Đầu tư (QĐ 108/QĐ-DDCN)
    // ═══════════════════════════════════════════════════════════════
    const QT_GSDG: WorkflowTemplate = {
        name: 'QT Báo cáo Giám sát, Đánh giá tổng thể đầu tư (Mẫu 01)',
        code: 'QT-GSĐG',
        category: 'document',
        description: 'Quy trình báo cáo giám sát, đánh giá tổng thể đầu tư hàng năm, được chuẩn hóa theo Mẫu số 01 của quy chế Ban DDCN.',
        steps: [
            {
                id: 'd1',
                name: 'Thực hiện Báo cáo giám sát, đánh giá tổng thể',
                type: 'start', 
                role: 'Ban ĐHDA', 
                sla: 'Trước ngày 30 tháng 01 hàng năm',
                metadata: {
                    coordinating_role: '',
                    sla_regulated: 'Trước ngày 10 tháng 2 hàng năm (theo Điều 69 Mẫu 01)',
                    notes: ''
                }
            },
            {
                id: 'd2',
                name: 'Kiểm tra nội dung Báo cáo',
                type: 'input', 
                role: 'Phòng KHĐT', 
                sla: '05 ngày (3 ngày TCKT, 2 ngày KTCL)',
                metadata: {
                    coordinating_role: 'Phòng TCKT, Phòng KTCL',
                    sla_regulated: '',
                    notes: ''
                }
            },
            {
                id: 'd3',
                name: 'Phê duyệt Báo cáo',
                type: 'approval', 
                role: 'Ban GĐ', 
                sla: '01 ngày',
                metadata: {
                    coordinating_role: '',
                    sla_regulated: '',
                    notes: ''
                }
            },
            {
                id: 'd4',
                name: 'Phát hành Văn bản',
                type: 'automated', 
                role: 'Văn phòng', 
                sla: '01 ngày sau phê duyệt',
                metadata: {
                    coordinating_role: '',
                    sla_regulated: '',
                    notes: 'Nơi nhận: UBND.TP, Sở KHĐT, Sở XD'
                }
            },
            {
                id: 'd5',
                name: 'Cập nhật hệ thống',
                type: 'end', 
                role: 'Phòng KHĐT', 
                sla: '01 ngày kể từ ngày phát hành',
                metadata: {
                    coordinating_role: '',
                    sla_regulated: '',
                    notes: ''
                }
            }
        ],
        edges: [
            { source: 'd1', target: 'd2' },
            { source: 'd2', target: 'd1', label: 'Nội dung chưa hoàn thiện', condition: 'REJECT' },
            { source: 'd2', target: 'd3' },
            { source: 'd3', target: 'd2', label: 'Ban GĐ yêu cầu chỉnh sửa', condition: 'REJECT' },
            { source: 'd3', target: 'd4' },
            { source: 'd4', target: 'd5' }
        ]
    };

    // ═══════════════════════════════════════════════════════════════
    // 2. QT Xử lý Phát sinh (QĐ 180/QĐ-DDCN, Mã hiệu QT-04)
    // ═══════════════════════════════════════════════════════════════
    const QT_04: WorkflowTemplate = {
        name: 'QT Xử lý Phát sinh',
        code: 'QT-04',
        category: 'other',
        description: 'Đảm bảo triển khai quản lý công tác phát sinh, điều chỉnh thiết kế - dự toán trong thi công có hệ thống, tuân thủ Luật XD. Ban hành theo QĐ 180/QĐ-DDCN.',
        steps: [
            {
                name: '1. Điều chỉnh chủ trương (nếu vượt TMĐT)',
                type: 'start', role: 'Ban ĐHDA / P.KHĐT / P.KTCL', sla: '30d',
                metadata: {
                    phase: 'preparation',
                    sub_tasks: [
                        { id: crypto.randomUUID(), name: 'Lập, thẩm định, phê duyệt điều chỉnh BCNCTKT hoặc xin chủ trương ĐT', assignee_role: 'Ban ĐHDA/TTDVTV tổ chức; P.KHĐT, P.KTCL thẩm định nội bộ', output: 'QĐ phê duyệt điều chỉnh chủ trương', template_forms: '', legal_basis: '', sla: '' },
                        { id: crypto.randomUUID(), name: 'Lập BCNCKT/BCKTKT điều chỉnh → Sở chuyên ngành thẩm định → NQĐ ĐT phê duyệt', assignee_role: 'CĐT / Sở chuyên ngành / NQĐ ĐT', output: 'QĐ phê duyệt dự án điều chỉnh', template_forms: '', legal_basis: '', sla: '' },
                    ]
                }
            },
            {
                name: '2. Xin chủ trương phát sinh',
                type: 'input', role: 'Ban ĐHDA / TVGS / Nhà thầu', sla: '10d',
                metadata: {
                    phase: 'initiation',
                    sub_tasks: [
                        { id: crypto.randomUUID(), name: 'Lập Biên bản hiện trường (Mẫu 01)', assignee_role: 'Nhà thầu / TVGS / Ban ĐHDA', output: 'Biên bản hiện trường', template_forms: 'Phụ lục 02 - Mẫu 01', legal_basis: '', sla: '' },
                        { id: crypto.randomUUID(), name: 'Lập Biên bản làm việc chấp thuận điều chỉnh (Mẫu 02)', assignee_role: 'Ban ĐHDA / TTDVTV', output: 'Biên bản chấp thuận', template_forms: 'Phụ lục 02 - Mẫu 02', legal_basis: '', sla: '' },
                        { id: crypto.randomUUID(), name: 'P.KTCL thẩm định nội bộ, trình Ban GĐ chấp thuận chủ trương', assignee_role: 'P.KTCL / Ban Giám đốc', output: 'Văn bản chấp thuận chủ trương phát sinh', template_forms: 'Mẫu 03 (Kiến nghị CĐT), Mẫu 04 (Chấp thuận), Mẫu 05 (Gửi Sở XD)', legal_basis: '', sla: '' },
                    ]
                }
            },
            {
                name: '3. Kiểm tra, so sánh dự toán',
                type: 'input', role: 'Ban ĐHDA / P.KHĐT / P.KTCL', sla: '5d',
                metadata: {
                    phase: 'analysis',
                    sub_tasks: [
                        { id: crypto.randomUUID(), name: 'Rà soát chi phí, phương án thiết kế, đối chiếu với TMĐT', assignee_role: 'Ban ĐHDA/TTDVTV; P.KHĐT, P.KTCL phối hợp', output: 'Phân loại: không điều chỉnh DA hoặc phải điều chỉnh DA', template_forms: '', legal_basis: '', sla: '' },
                        { id: crypto.randomUUID(), name: 'Kiểm tra phát sinh có thay đổi so với BVTK phê duyệt không', assignee_role: 'P.KTCL / TVGS / TVTK', output: 'Xác định: Lập TK điều chỉnh + DT phát sinh HOẶC chỉ DT phát sinh', template_forms: '', legal_basis: '', sla: '' },
                    ]
                }
            },
            {
                name: '4. Lập TK/DT phát sinh & Thẩm tra',
                type: 'input', role: 'Ban ĐHDA / TV Thẩm tra / TV Thẩm định giá', sla: '15d',
                metadata: {
                    phase: 'preparation',
                    sub_tasks: [
                        { id: crypto.randomUUID(), name: 'Tổ chức lập thiết kế điều chỉnh và/hoặc dự toán phát sinh', assignee_role: 'Ban ĐHDA/TTDVTV; TVTK, Nhà thầu', output: 'Hồ sơ TK/DT phát sinh', template_forms: '', legal_basis: '', sla: '' },
                        { id: crypto.randomUUID(), name: 'Thẩm tra thiết kế, thẩm định giá', assignee_role: 'TV Thẩm tra / TV Thẩm định giá', output: 'Báo cáo thẩm tra, Chứng thư thẩm định giá', template_forms: '', legal_basis: '', sla: '' },
                    ]
                }
            },
            {
                name: '5. Thẩm định & Phê duyệt TK/DT phát sinh',
                type: 'approval', role: 'P.KTCL / Ban Giám đốc', sla: '10d',
                metadata: {
                    phase: 'approval',
                    sub_tasks: [
                        { id: crypto.randomUUID(), name: 'P.KTCL thẩm định nội bộ', assignee_role: 'P.KTCL', output: 'Báo cáo thẩm định nội bộ', template_forms: '', legal_basis: '', sla: '' },
                        { id: crypto.randomUUID(), name: 'Giám đốc/PGĐ Ban DDCN hoặc NQĐ ĐT phê duyệt', assignee_role: 'Ban Giám đốc / NQĐ ĐT', output: 'QĐ phê duyệt TK/DT phát sinh', template_forms: '', legal_basis: '', sla: '' },
                    ]
                }
            },
            {
                name: '6. Thương thảo & Ký phụ lục HĐ → Thực hiện',
                type: 'end', role: 'P.KHĐT / Ban GĐ / Nhà thầu', sla: '10d',
                metadata: {
                    phase: 'execution',
                    sub_tasks: [
                        { id: crypto.randomUUID(), name: 'Thương thảo, ký Phụ lục hợp đồng', assignee_role: 'Ban GĐ chỉ đạo; P.KHĐT, P.KTCL, VP, Ban ĐHDA, NT, TVGS tham gia', output: 'Phụ lục hợp đồng', template_forms: '', legal_basis: '', sla: '' },
                        { id: crypto.randomUUID(), name: 'Triển khai thi công phần phát sinh', assignee_role: 'P.KHĐT, Ban ĐHDA, NT, VP, P.TCKT, Ban GĐ', output: 'Hoàn thành thi công phát sinh', template_forms: '', legal_basis: '', sla: '' },
                    ]
                }
            },
        ]
    };

    // ═══════════════════════════════════════════════════════════════
    // 3. QT Thẩm định TK-DT sau TKCS (QĐ 210/QĐ-DDCN, QT-01/TĐTK)
    // ═══════════════════════════════════════════════════════════════
    const QT_TDTK: WorkflowTemplate = {
        name: 'QT Thẩm định Thiết kế - Dự toán XD',
        code: 'QT-01/TĐTK',
        category: 'other',
        description: 'Quy định trình tự thẩm định thiết kế XD triển khai sau TKCS thuộc thẩm quyền Ban DDCN. Ban hành theo QĐ 210/QĐ-DDCN.',
        steps: [
            {
                name: '1. Tiếp nhận hồ sơ TK-DT',
                type: 'start', role: 'Ban ĐHDA → P.KTCL', sla: '1d',
                metadata: {
                    phase: 'reception',
                    sub_tasks: [
                        { id: crypto.randomUUID(), name: 'Ban ĐHDA chuyển hồ sơ TK, DT đến Bộ phận tiếp nhận P.KTCL', assignee_role: 'Ban ĐHDA', output: 'Hồ sơ TK-DT được chuyển', template_forms: '', legal_basis: '', sla: '' },
                        { id: crypto.randomUUID(), name: 'P.KTCL kiểm tra thành phần hồ sơ, cấp Giấy tiếp nhận', assignee_role: 'P.KTCL', output: 'Giấy tiếp nhận hồ sơ và hẹn trả kết quả', template_forms: 'BM 01', legal_basis: '', sla: '1 ngày' },
                    ]
                }
            },
            {
                name: '2. Thẩm định nội bộ',
                type: 'input', role: 'P.KTCL (chủ trì)', sla: '40d',
                metadata: {
                    phase: 'review',
                    sub_tasks: [
                        { id: crypto.randomUUID(), name: 'Xem xét năng lực tổ chức/cá nhân, sự phù hợp TK, DT, quy chuẩn, an toàn, môi trường, PCCC', assignee_role: 'P.KTCL (phối hợp HĐ kỹ thuật Ban nếu CT cấp I/phức tạp)', output: 'Báo cáo thẩm định nội bộ', template_forms: 'BM 03 (BC nội nghiệp)', legal_basis: '', sla: 'CT cấp I: ≤40 ngày; CT cấp II,III: ≤15 ngày; Còn lại: ≤10 ngày' },
                    ]
                }
            },
            {
                name: '3. Trình CQ chuyên môn XD thẩm định (nếu thuộc đối tượng)',
                type: 'input', role: 'Ban ĐHDA / Ban GĐ', sla: '30d',
                metadata: {
                    phase: 'external_review',
                    sub_tasks: [
                        { id: crypto.randomUUID(), name: 'Ban ĐHDA lập hồ sơ, Ban GĐ ký Tờ trình gửi Sở XD/Bộ XD', assignee_role: 'Ban ĐHDA / Ban GĐ', output: 'Tờ trình gửi CQ chuyên môn', template_forms: 'BM 02 (Tờ trình BĐH→BGĐ), BM 04 (Tờ trình Ban DDCN→CQ XD)', legal_basis: '', sla: '' },
                        { id: crypto.randomUUID(), name: 'CQ chuyên môn XD xem xét, thẩm định', assignee_role: 'Sở XD / Bộ XD', output: 'Thông báo kết quả thẩm định', template_forms: '', legal_basis: '', sla: '' },
                    ]
                }
            },
            {
                name: '4. Tổng hợp báo cáo, trình phê duyệt',
                type: 'input', role: 'P.KTCL / Ban ĐHDA', sla: '5d',
                metadata: {
                    phase: 'consolidation',
                    sub_tasks: [
                        { id: crypto.randomUUID(), name: 'Tổng hợp kết quả thẩm định nội bộ + ý kiến CQ chuyên môn', assignee_role: 'P.KTCL phối hợp Ban ĐHDA', output: 'Báo cáo kết quả thẩm định + Thông báo kết quả', template_forms: 'BM 05 (BC kết quả TĐ), BM 06 (Thông báo kết quả TĐ)', legal_basis: '', sla: '' },
                    ]
                }
            },
            {
                name: '5. Phê duyệt TK-DT',
                type: 'approval', role: 'Ban Giám đốc', sla: '3d',
                metadata: {
                    phase: 'approval',
                    sub_tasks: [
                        { id: crypto.randomUUID(), name: 'Ban GĐ ký duyệt QĐ phê duyệt TK XD triển khai sau TKCS', assignee_role: 'Ban Giám đốc', output: 'Quyết định phê duyệt TK-DT', template_forms: 'BM 07 (QĐ phê duyệt TK)', legal_basis: '', sla: '3 ngày' },
                    ]
                }
            },
        ]
    };

    // ═══════════════════════════════════════════════════════════════
    // 4. QT Tạm ứng, Thanh toán & Quyết toán (QĐ 231/QĐ-DDCN)
    // ═══════════════════════════════════════════════════════════════
    const QT_TUTT: WorkflowTemplate = {
        name: 'QT Tạm ứng, Thanh toán & Quyết toán vốn ĐT',
        code: 'QT-TUTT',
        category: 'finance',
        description: 'Quản lý quy trình, thời gian thực hiện hồ sơ cam kết chi, tạm ứng, hoàn tạm ứng, thanh toán và quyết toán vốn ĐT dự án hoàn thành. Ban hành theo QĐ 231/QĐ-DDCN.',
        steps: [
            {
                name: '1. Ban ĐHDA tiếp nhận & kiểm tra hồ sơ',
                type: 'start', role: 'Ban ĐHDA', sla: '3d',
                metadata: {
                    phase: 'reception',
                    sub_tasks: [
                        { id: crypto.randomUUID(), name: 'Nhận hồ sơ tạm ứng/nghiệm thu/thanh toán từ Nhà thầu', assignee_role: 'Ban ĐHDA', output: 'Hồ sơ đề nghị tạm ứng/thanh toán', template_forms: 'Bảng phân bổ cam kết chi, Giấy đề nghị cam kết chi NSNN', legal_basis: '', sla: '' },
                        { id: crypto.randomUUID(), name: 'Kiểm tra toàn bộ hồ sơ, lập tờ trình chuyển các phòng chuyên môn', assignee_role: 'Ban ĐHDA', output: 'Tờ trình chuyển phòng chuyên môn', template_forms: 'CV đề nghị tạm ứng/thanh toán, BB nghiệm thu KL', legal_basis: '', sla: '' },
                    ]
                }
            },
            {
                name: '2. Phòng chuyên môn xử lý hồ sơ',
                type: 'input', role: 'P.KHĐT → P.KTCL → P.TCKT', sla: '6d',
                metadata: {
                    phase: 'processing',
                    sub_tasks: [
                        { id: crypto.randomUUID(), name: 'P.KHĐT kiểm tra hồ sơ pháp lý DA, gói thầu, kế hoạch vốn', assignee_role: 'P.KHĐT', output: 'Hồ sơ pháp lý đã xác nhận', template_forms: '', legal_basis: '', sla: 'Tối đa 2 ngày làm việc' },
                        { id: crypto.randomUUID(), name: 'P.KTCL kiểm tra hồ sơ QLCL, báo cáo TVGS', assignee_role: 'P.KTCL', output: 'Hồ sơ chất lượng đã xác nhận', template_forms: '', legal_basis: '', sla: 'Tối đa 2 ngày làm việc' },
                        { id: crypto.randomUUID(), name: 'P.TCKT kiểm tra công văn, hóa đơn, chứng từ', assignee_role: 'P.TCKT', output: 'Hồ sơ hoàn chỉnh trình Ban GĐ', template_forms: 'Bảng xác định giá trị KL hoàn thành', legal_basis: '', sla: 'Tối đa 2 ngày làm việc' },
                    ]
                }
            },
            {
                name: '3. Trình duyệt & Gửi Kho bạc',
                type: 'end', role: 'P.TCKT / Ban GĐ / VP', sla: '2d',
                metadata: {
                    phase: 'disbursement',
                    sub_tasks: [
                        { id: crypto.randomUUID(), name: 'Trình Ban GĐ duyệt ký', assignee_role: 'P.TCKT / Ban GĐ', output: 'Hồ sơ đã ký duyệt', template_forms: 'Tờ trình đề nghị phê duyệt QT', legal_basis: '', sla: '' },
                        { id: crypto.randomUUID(), name: 'VP đóng dấu, scan hồ sơ gửi KBNN qua DVC trực tuyến', assignee_role: 'Văn phòng / P.TCKT', output: 'Hồ sơ gửi KBNN để giải ngân', template_forms: 'Báo cáo quyết toán DA hoàn thành', legal_basis: '', sla: 'Tối đa 2 ngày làm việc' },
                    ]
                }
            },
        ]
    };

    // ═══════════════════════════════════════════════════════════════
    // 5. QT Quản lý CL Thi công XD (QĐ 232/QĐ-DDCN, QT-03)
    // ═══════════════════════════════════════════════════════════════
    const QT_03: WorkflowTemplate = {
        name: 'QT Quản lý Chất lượng Thi công XD',
        code: 'QT-03',
        category: 'other',
        description: 'Đảm bảo triển khai quản lý thi công tại các dự án có hệ thống, hiệu quả, tuân theo Luật XD; tăng cường chủ động và quy định rõ trách nhiệm. Ban hành theo QĐ 232/QĐ-DDCN.',
        steps: [
            {
                name: '1. Ký kết hợp đồng TC, GS',
                type: 'start', role: 'Ban ĐHDA / P.KHĐT / Ban GĐ', sla: '15d',
                metadata: { phase: 'preparation', sub_tasks: [
                    { id: crypto.randomUUID(), name: 'Hoàn chỉnh thủ tục thương thảo và ký HĐ thi công, giám sát', assignee_role: 'Ban ĐHDA (GĐ/PGĐ), P.TCKT, P.KHĐT, Ban GĐ', output: 'Hợp đồng được ký kết', template_forms: '', legal_basis: '', sla: '' },
                ] }
            },
            {
                name: '2. Chuẩn bị quản lý hợp đồng',
                type: 'input', role: 'Ban ĐHDA / P.KTCL', sla: '5d',
                metadata: { phase: 'preparation', sub_tasks: [
                    { id: crypto.randomUUID(), name: 'Phân công cán bộ quản lý (chỉ đạo tuyến), tập hợp hồ sơ, BV, dự toán', assignee_role: 'Ban ĐHDA (GĐ/PGĐ, CV); P.KTCL (TP/PP, CV)', output: 'Kế hoạch quản lý, phân công nhiệm vụ', template_forms: 'BM 01.01 (Bìa thuyết minh), BM 01.02 (Bìa danh mục BV), BM 01.03 (Bảng tiến độ chi tiết)', legal_basis: '', sla: '' },
                ] }
            },
            {
                name: '3. Quản lý thi công XD',
                type: 'input', role: 'TVGS / TVTK / Ban ĐHDA / P.KTCL', sla: '1095d',
                metadata: { phase: 'execution', sub_tasks: [
                    { id: crypto.randomUUID(), name: 'Giám sát, QLCL, tiến độ, khối lượng, ATLĐ-VSMT-PCCC và chi phí', assignee_role: 'TVGS, TVTK, Ban ĐHDA, P.KTCL', output: 'BB nghiệm thu vật liệu, công việc; nhật ký thi công', template_forms: 'BM 02.01-02.18 (BB bàn giao MB, phiếu NC thu, BB lấy mẫu, BB NT công việc...)', legal_basis: '', sla: '' },
                ] }
            },
            {
                name: '4. Tổng hợp số liệu & Báo cáo',
                type: 'input', role: 'TVGS / NT / Ban ĐHDA', sla: '7d',
                metadata: { phase: 'reporting', sub_tasks: [
                    { id: crypto.randomUUID(), name: 'Báo cáo định kỳ (tuần, tháng) hoặc đột xuất cho Lãnh đạo Ban', assignee_role: 'TVGS, Nhà thầu, Ban ĐHDA', output: 'Báo cáo tiến độ, chất lượng', template_forms: '', legal_basis: '', sla: '' },
                ] }
            },
            {
                name: '5. Nghiệm thu bộ phận, hạng mục',
                type: 'input', role: 'TVGS / NT / Ban ĐHDA', sla: '5d',
                metadata: { phase: 'acceptance', sub_tasks: [
                    { id: crypto.randomUUID(), name: 'Nghiệm thu công việc, bộ phận CT bị che khuất, giai đoạn TC', assignee_role: 'TVGS, Nhà thầu, Ban ĐHDA', output: 'Phiếu yêu cầu NT, Biên bản NT công việc/bộ phận', template_forms: 'BM 02.03 (Phiếu yêu cầu NT), BM 02.06 (BB NT công việc)', legal_basis: '', sla: '' },
                ] }
            },
            {
                name: '6. Nghiệm thu hoàn thành CT',
                type: 'input', role: 'Ban ĐHDA / P.KTCL / TVGS / NT', sla: '15d',
                metadata: { phase: 'completion', sub_tasks: [
                    { id: crypto.randomUUID(), name: 'Kiểm tra tổng thể, đánh giá hiện trường, hồ sơ CL', assignee_role: 'Ban ĐHDA, P.KTCL, TVGS, Nhà thầu', output: 'Biên bản NT hoàn thành hạng mục/CT', template_forms: 'BM 02.14-02.18 (BB NT thiết bị, bàn giao CT...)', legal_basis: '', sla: '' },
                ] }
            },
            {
                name: '7. Bàn giao CT đưa vào sử dụng',
                type: 'end', role: 'Ban GĐ / Ban ĐHDA / P.KTCL', sla: '10d',
                metadata: { phase: 'handover', sub_tasks: [
                    { id: crypto.randomUUID(), name: 'Tổ chức bàn giao CT cho đơn vị QL vận hành, lưu trữ hồ sơ hoàn công', assignee_role: 'Ban GĐ, Ban ĐHDA, P.KTCL', output: 'BB bàn giao, Hồ sơ hoàn công', template_forms: 'BM 03.01 (Nội dung HS hoàn công), BM 03.02 (Bìa danh mục BV HC), BM 04.01 (Quy cách nhật ký TC)', legal_basis: '', sla: '' },
                ] }
            },
        ]
    };

    // ═══════════════════════════════════════════════════════════════
    // 6. QT Quản lý CL Khảo sát - Thiết kế (QĐ 232/QĐ-DDCN, QT-02)
    // ═══════════════════════════════════════════════════════════════
    const QT_02: WorkflowTemplate = {
        name: 'QT Quản lý Chất lượng Khảo sát - Thiết kế',
        code: 'QT-02',
        category: 'other',
        description: 'Đảm bảo triển khai quản lý công tác khảo sát, thiết kế tại các công trình có hệ thống, hiệu quả, tuân thủ pháp luật. Ban hành theo QĐ 232/QĐ-DDCN.',
        steps: [
            {
                name: '1. Lập nhiệm vụ KS / TK',
                type: 'start', role: 'Ban ĐHDA / CĐT', sla: '10d',
                metadata: { phase: 'initiation', sub_tasks: [
                    { id: crypto.randomUUID(), name: 'Lập nhiệm vụ khảo sát / thiết kế XD', assignee_role: 'Ban ĐHDA / CĐT', output: 'Nhiệm vụ KS/TK', template_forms: '', legal_basis: '', sla: '' },
                ] }
            },
            {
                name: '2. Thẩm định & Phê duyệt nhiệm vụ KS/TK',
                type: 'approval', role: 'P.KTCL / Ban GĐ', sla: '10d',
                metadata: { phase: 'approval', sub_tasks: [
                    { id: crypto.randomUUID(), name: 'Kiểm tra, thẩm định nội bộ nhiệm vụ KS/TK', assignee_role: 'P.KTCL', output: 'Báo cáo thẩm định nhiệm vụ', template_forms: '', legal_basis: '', sla: '' },
                    { id: crypto.randomUUID(), name: 'Phê duyệt nhiệm vụ KS/TK', assignee_role: 'Ban Giám đốc', output: 'QĐ phê duyệt nhiệm vụ', template_forms: '', legal_basis: '', sla: '' },
                ] }
            },
            {
                name: '3. Lập phương án KS / Thực hiện TK',
                type: 'input', role: 'Đơn vị TV KS/TK', sla: '60d',
                metadata: { phase: 'execution', sub_tasks: [
                    { id: crypto.randomUUID(), name: 'Lập phương án KS hoặc thực hiện công tác TK XD', assignee_role: 'Đơn vị TV Khảo sát / Thiết kế', output: 'Phương án KS / Hồ sơ TK', template_forms: '', legal_basis: '', sla: '' },
                ] }
            },
            {
                name: '4. Thẩm định nội bộ PA KS / TK',
                type: 'input', role: 'P.KTCL', sla: '15d',
                metadata: { phase: 'review', sub_tasks: [
                    { id: crypto.randomUUID(), name: 'Kiểm tra, thẩm định nội bộ phương án KS / TK', assignee_role: 'P.KTCL', output: 'Báo cáo thẩm định PA KS/TK', template_forms: '', legal_basis: '', sla: '' },
                    { id: crypto.randomUUID(), name: 'Phê duyệt phương án KS / TK', assignee_role: 'Ban Giám đốc', output: 'QĐ phê duyệt PA', template_forms: '', legal_basis: '', sla: '' },
                ] }
            },
            {
                name: '5. Thực hiện công tác KS / TK XD',
                type: 'input', role: 'Đơn vị TVKS/TK / Ban ĐHDA', sla: '90d',
                metadata: { phase: 'execution', sub_tasks: [
                    { id: crypto.randomUUID(), name: 'Triển khai KS hiện trường hoặc lập hồ sơ TK chi tiết', assignee_role: 'Đơn vị TVKS/TK; Ban ĐHDA giám sát', output: 'Báo cáo kết quả KS / Hồ sơ TK hoàn chỉnh', template_forms: '', legal_basis: '', sla: '' },
                ] }
            },
            {
                name: '6. Tổng hợp, nghiệm thu & Lưu trữ',
                type: 'end', role: 'Ban ĐHDA / P.KTCL', sla: '10d',
                metadata: { phase: 'completion', sub_tasks: [
                    { id: crypto.randomUUID(), name: 'Tổng hợp số liệu, kiểm tra báo cáo, tổ chức nghiệm thu và lưu trữ hồ sơ', assignee_role: 'Ban ĐHDA, P.KTCL', output: 'Hồ sơ KS/TK đã nghiệm thu, lưu trữ', template_forms: 'BC kết quả KS, BC TK, Hồ sơ thẩm định', legal_basis: '', sla: '' },
                ] }
            },
        ]
    };

    // ═══════════════════════════════════════════════════════════════
    // 7. Quy chế Làm việc Ban DDCN
    // ═══════════════════════════════════════════════════════════════
    const QC_LV: WorkflowTemplate = {
        name: 'Quy chế Làm việc Ban DDCN',
        code: 'QC-LV',
        category: 'hr',
        description: 'Quy định nguyên tắc làm việc, chế độ trách nhiệm, quan hệ công tác, trình tự giải quyết công việc (quản lý văn bản, hội họp, lịch công tác, nghỉ phép) của toàn bộ VC, NLĐ thuộc Ban.',
        steps: [
            {
                name: '1. Tiếp nhận & Đăng ký văn bản',
                type: 'start', role: 'Văn phòng / Văn thư', sla: '1d',
                metadata: { phase: 'reception', sub_tasks: [
                    { id: crypto.randomUUID(), name: 'Tiếp nhận, đăng ký văn bản vào Hệ thống quản lý VB', assignee_role: 'Văn thư', output: 'Văn bản đã đăng ký', template_forms: '', legal_basis: 'NĐ 30/2020/NĐ-CP', sla: '1 ngày' },
                ] }
            },
            {
                name: '2. Phân công xử lý',
                type: 'input', role: 'Lãnh đạo Ban / Trưởng phòng', sla: '1d',
                metadata: { phase: 'assignment', sub_tasks: [
                    { id: crypto.randomUUID(), name: 'Phân công chuyên viên xử lý theo lĩnh vực', assignee_role: 'Lãnh đạo Ban / Trưởng phòng', output: 'Phân công cụ thể', template_forms: '', legal_basis: '', sla: '' },
                ] }
            },
            {
                name: '3. Chuyên viên giải quyết & Lập hồ sơ',
                type: 'input', role: 'Chuyên viên', sla: '5d',
                metadata: { phase: 'processing', sub_tasks: [
                    { id: crypto.randomUUID(), name: 'Nghiên cứu, soạn thảo văn bản trả lời/xử lý', assignee_role: 'Chuyên viên được phân công', output: 'Dự thảo văn bản', template_forms: '', legal_basis: '', sla: '' },
                ] }
            },
            {
                name: '4. Lãnh đạo kiểm tra, ký duyệt điện tử',
                type: 'approval', role: 'Trưởng phòng / Ban GĐ', sla: '2d',
                metadata: { phase: 'approval', sub_tasks: [
                    { id: crypto.randomUUID(), name: 'Kiểm tra nội dung và ký duyệt điện tử', assignee_role: 'Trưởng phòng kiểm tra → Ban GĐ ký', output: 'Văn bản đã ký duyệt', template_forms: '', legal_basis: '', sla: '' },
                ] }
            },
            {
                name: '5. Phát hành & Lưu trữ',
                type: 'end', role: 'Văn thư', sla: '1d',
                metadata: { phase: 'distribution', sub_tasks: [
                    { id: crypto.randomUUID(), name: 'Văn thư phát hành và lưu trữ hồ sơ', assignee_role: 'Văn thư', output: 'Văn bản được phát hành, lưu trữ', template_forms: 'Mẫu 01-05 (Đơn xin nghỉ phép, nghỉ không lương, ra nước ngoài, thai sản, ốm)', legal_basis: '', sla: '' },
                ] }
            },
        ]
    };

    // ═══════════════════════════════════════════════════════════════
    // 8. QT Phối hợp Lựa chọn Nhà thầu (QĐ 450/QĐ-DDCN, QT-01)
    // ═══════════════════════════════════════════════════════════════
    const QT_01_LCNT: WorkflowTemplate = {
        name: 'QT Phối hợp Nội bộ - Lựa chọn Nhà thầu',
        code: 'QT-01/LCNT',
        category: 'other',
        description: 'Xác định rõ các bước và trách nhiệm phối hợp nội bộ giữa các Phòng, Ban và Đơn vị trực thuộc trong công tác đấu thầu, lựa chọn nhà thầu. Ban hành theo QĐ 450/QĐ-DDCN.',
        steps: [
            {
                name: '1. Đăng tải thông tin dự án',
                type: 'start', role: 'P.KHĐT / Ban ĐHDA', sla: '5d',
                metadata: { phase: 'publication', sub_tasks: [
                    { id: crypto.randomUUID(), name: 'Đăng tải thông tin DA và KHLCNT lên Hệ thống mạng ĐTQG', assignee_role: 'P.KHĐT / Ban ĐHDA', output: 'Thông tin đăng tải hợp lệ', template_forms: '', legal_basis: 'Luật Đấu thầu 2023', sla: '' },
                ] }
            },
            {
                name: '2. Lập, thẩm định DT gói thầu',
                type: 'input', role: 'Ban ĐHDA / P.KTCL / P.KHĐT', sla: '15d',
                metadata: { phase: 'estimation', sub_tasks: [
                    { id: crypto.randomUUID(), name: 'Lập dự toán gói thầu', assignee_role: 'Ban ĐHDA', output: 'Dự toán gói thầu', template_forms: '', legal_basis: '', sla: '' },
                    { id: crypto.randomUUID(), name: 'Thẩm định dự toán gói thầu', assignee_role: 'P.KTCL / P.KHĐT', output: 'Báo cáo thẩm định DT gói thầu', template_forms: '', legal_basis: '', sla: '' },
                    { id: crypto.randomUUID(), name: 'Phê duyệt dự toán gói thầu', assignee_role: 'Ban Giám đốc', output: 'QĐ phê duyệt DT gói thầu', template_forms: '', legal_basis: '', sla: '' },
                ] }
            },
            {
                name: '3. Lập, thẩm định HSMT/HSYC',
                type: 'input', role: 'Ban ĐHDA / Tổ chuyên gia / P.KHĐT', sla: '20d',
                metadata: { phase: 'preparation', sub_tasks: [
                    { id: crypto.randomUUID(), name: 'Lập HSMT / HSYC theo mẫu quy định', assignee_role: 'Ban ĐHDA / Tổ chuyên gia', output: 'HSMT / HSYC', template_forms: '', legal_basis: '', sla: '' },
                    { id: crypto.randomUUID(), name: 'Thẩm định HSMT/HSYC', assignee_role: 'P.KHĐT / Tổ thẩm định', output: 'Báo cáo thẩm định HSMT', template_forms: '', legal_basis: '', sla: '' },
                    { id: crypto.randomUUID(), name: 'Phê duyệt HSMT/HSYC', assignee_role: 'Ban Giám đốc', output: 'QĐ phê duyệt HSMT', template_forms: '', legal_basis: '', sla: '' },
                ] }
            },
            {
                name: '4. Phát hành HSMT, Đóng thầu, Mở thầu',
                type: 'input', role: 'BMT / P.KHĐT', sla: '20d',
                metadata: { phase: 'bidding', sub_tasks: [
                    { id: crypto.randomUUID(), name: 'Phát hành HSMT trên mạng ĐTQG', assignee_role: 'BMT / P.KHĐT', output: 'HSMT được phát hành', template_forms: '', legal_basis: '', sla: '' },
                    { id: crypto.randomUUID(), name: 'Đóng thầu và mở thầu', assignee_role: 'BMT', output: 'Biên bản mở thầu', template_forms: '', legal_basis: '', sla: '' },
                ] }
            },
            {
                name: '5. Đánh giá HSDT/HSĐX',
                type: 'input', role: 'Tổ chuyên gia / BMT', sla: '30d',
                metadata: { phase: 'evaluation', sub_tasks: [
                    { id: crypto.randomUUID(), name: 'Đánh giá hồ sơ dự thầu/đề xuất về KT và TC', assignee_role: 'Tổ chuyên gia', output: 'Báo cáo đánh giá HSDT', template_forms: '', legal_basis: '', sla: '' },
                    { id: crypto.randomUUID(), name: 'Làm rõ hồ sơ (nếu có)', assignee_role: 'Tổ chuyên gia / Nhà thầu', output: 'Văn bản làm rõ', template_forms: '', legal_basis: '', sla: '' },
                ] }
            },
            {
                name: '6. Thẩm định & Phê duyệt KQLCNT',
                type: 'approval', role: 'P.KHĐT / Ban GĐ', sla: '10d',
                metadata: { phase: 'approval', sub_tasks: [
                    { id: crypto.randomUUID(), name: 'Thẩm định kết quả LCNT', assignee_role: 'P.KHĐT', output: 'Báo cáo thẩm định KQLCNT', template_forms: '', legal_basis: '', sla: '' },
                    { id: crypto.randomUUID(), name: 'Phê duyệt & ra QĐ phê duyệt KQLCNT', assignee_role: 'Ban Giám đốc', output: 'Quyết định phê duyệt KQLCNT', template_forms: '', legal_basis: '', sla: '' },
                ] }
            },
            {
                name: '7. Hoàn thiện, ký kết HĐ & Bàn giao',
                type: 'end', role: 'P.KHĐT / Ban GĐ / Nhà thầu', sla: '15d',
                metadata: { phase: 'contracting', sub_tasks: [
                    { id: crypto.randomUUID(), name: 'Hoàn thiện và ký kết hợp đồng', assignee_role: 'P.KHĐT, Ban GĐ, Nhà thầu trúng thầu', output: 'Hợp đồng đã ký', template_forms: '', legal_basis: '', sla: '' },
                    { id: crypto.randomUUID(), name: 'Bàn giao gói thầu cho đơn vị thực hiện', assignee_role: 'P.KHĐT / Ban ĐHDA', output: 'Biên bản bàn giao gói thầu', template_forms: '', legal_basis: '', sla: '' },
                ] }
            },
        ]
    };

    // ═══════════════════════════════════════════════════════════════
    // 9. QT Rà soát Thiết bị Y tế (QĐ 460/QĐ-DDCN, QT-06)
    // ═══════════════════════════════════════════════════════════════
    const QT_06: WorkflowTemplate = {
        name: 'QT Rà soát, Thẩm định Thiết bị Y tế',
        code: 'QT-06',
        category: 'other',
        description: 'Rà soát, thẩm định cấu hình tính năng kỹ thuật và dự toán thiết bị y tế đảm bảo tính hệ thống, minh bạch, hiệu quả. Ban hành theo QĐ 460/QĐ-DDCN.',
        steps: [
            {
                name: '1. Tổng hợp hồ sơ, trình thẩm định',
                type: 'start', role: 'Ban ĐHDA / TTDVTV', sla: '5d',
                metadata: { phase: 'submission', sub_tasks: [
                    { id: crypto.randomUUID(), name: 'Tổng hợp hồ sơ cấu hình, dự toán TBYT', assignee_role: 'Ban ĐHDA / TTDVTV', output: 'Hồ sơ trình thẩm định TBYT', template_forms: 'BC đề xuất chủ trương, Chứng thư TĐ giá, BCNCKT, Cấu hình TNKT chi tiết', legal_basis: '', sla: '' },
                ] }
            },
            {
                name: '2. Tiếp nhận & Phân công thẩm định',
                type: 'input', role: 'P.KTCL', sla: '3d',
                metadata: { phase: 'assignment', sub_tasks: [
                    { id: crypto.randomUUID(), name: 'CV tổng hợp P.KTCL tiếp nhận, kiểm tra thành phần HS', assignee_role: 'CV tổng hợp P.KTCL', output: 'Hồ sơ đã kiểm tra đầy đủ', template_forms: '', legal_basis: '', sla: '' },
                    { id: crypto.randomUUID(), name: 'Lãnh đạo P.KTCL phân công Tổ công tác / CV thụ lý', assignee_role: 'Lãnh đạo P.KTCL', output: 'Phân công thẩm định', template_forms: '', legal_basis: '', sla: '' },
                ] }
            },
            {
                name: '3. Rà soát, thẩm định & Lập báo cáo',
                type: 'input', role: 'Tổ công tác / CV P.KTCL', sla: '20d',
                metadata: { phase: 'review', sub_tasks: [
                    { id: crypto.randomUUID(), name: 'Rà soát cấu hình TNKT, đối chiếu dự toán, lập BC thẩm định', assignee_role: 'Tổ công tác / CV thụ lý P.KTCL', output: 'Báo cáo thẩm định cấu hình & dự toán TBYT', template_forms: '', legal_basis: '', sla: '' },
                ] }
            },
            {
                name: '4. Phê duyệt & Ra quyết định',
                type: 'approval', role: 'Ban Giám đốc', sla: '5d',
                metadata: { phase: 'approval', sub_tasks: [
                    { id: crypto.randomUUID(), name: 'Ban GĐ xem xét BC thẩm định, phê duyệt và ra quyết định', assignee_role: 'Ban Giám đốc', output: 'Quyết định phê duyệt cấu hình & dự toán TBYT', template_forms: '', legal_basis: '', sla: '' },
                ] }
            },
        ]
    };

    return [QT_GSDG, QT_04, QT_TDTK, QT_TUTT, QT_03, QT_02, QC_LV, QT_01_LCNT, QT_06];
}
