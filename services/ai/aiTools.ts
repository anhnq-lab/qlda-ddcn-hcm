// AI Tools — OpenAI-compatible function declarations for DeepSeek

// ── OpenAI tool format ───────────────────────────────────────────
interface OAITool {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: {
            type: 'object';
            properties: Record<string, { type: string; description?: string }>;
            required?: string[];
        };
    };
}

/**
 * Tool definitions in OpenAI format for DeepSeek function calling
 */
export const AI_TOOLS_OAI: OAITool[] = [
    {
        type: 'function',
        function: {
            name: 'get_all_projects',
            description: 'Lấy danh sách tất cả dự án đầu tư công. Dùng khi user hỏi về danh sách dự án, tổng số dự án, dự án theo trạng thái.',
            parameters: {
                type: 'object',
                properties: {
                    status: { type: 'string', description: 'Lọc theo trạng thái: 1=Chuẩn bị, 2=Thực hiện, 3=Hoàn thành' },
                    search: { type: 'string', description: 'Từ khóa tìm kiếm tên dự án' },
                },
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_project_by_id',
            description: 'Lấy thông tin chi tiết một dự án theo ProjectID. Dùng khi user hỏi chi tiết về một dự án cụ thể.',
            parameters: {
                type: 'object',
                properties: {
                    projectId: { type: 'string', description: 'Mã dự án (ProjectID)' },
                },
                required: ['projectId'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_project_statistics',
            description: 'Lấy thống kê tổng hợp về dự án: tổng số, phân bổ theo trạng thái, tổng vốn đầu tư. Dùng khi user hỏi tổng quan, thống kê.',
            parameters: { type: 'object', properties: {} },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_all_contracts',
            description: 'Lấy danh sách tất cả hợp đồng. Dùng khi user hỏi về hợp đồng, tổng giá trị HĐ, HĐ theo trạng thái.',
            parameters: {
                type: 'object',
                properties: {
                    status: { type: 'string', description: 'Lọc theo trạng thái: 1=Đang thực hiện, 2=Tạm dừng, 3=Đã thanh lý' },
                },
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_all_payments',
            description: 'Lấy danh sách thanh toán. Dùng khi user hỏi về tiến độ thanh toán, số tiền đã giải ngân.',
            parameters: {
                type: 'object',
                properties: {
                    contractId: { type: 'string', description: 'Lọc theo mã hợp đồng' },
                },
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_dashboard_metrics',
            description: 'Lấy chỉ số tổng hợp dashboard: tổng vốn đầu tư, tổng giải ngân, tỷ lệ giải ngân. Dùng khi user hỏi tổng quan tình hình.',
            parameters: { type: 'object', properties: {} },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_capital_info',
            description: 'Lấy thông tin vốn và giải ngân của một dự án. Dùng khi user hỏi về vốn, giải ngân của dự án cụ thể.',
            parameters: {
                type: 'object',
                properties: {
                    projectId: { type: 'string', description: 'Mã dự án' },
                },
                required: ['projectId'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_dashboard_risks',
            description: 'Lấy danh sách cảnh báo rủi ro hiện tại. Dùng khi user hỏi về rủi ro, cảnh báo, vấn đề cần xử lý.',
            parameters: { type: 'object', properties: {} },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_upcoming_deadlines',
            description: 'Lấy danh sách công việc sắp đến hạn trong N ngày tới. Dùng khi user hỏi về deadline, việc cần làm.',
            parameters: {
                type: 'object',
                properties: {
                    days: { type: 'number', description: 'Số ngày tới cần kiểm tra (mặc định 30)' },
                },
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_project_tasks',
            description: 'Lấy danh sách công việc của một dự án: tiêu đề, trạng thái, tiến độ, deadline. Dùng khi user hỏi kế hoạch, tiến độ công việc của dự án.',
            parameters: {
                type: 'object',
                properties: {
                    projectId: { type: 'string', description: 'Mã dự án (ProjectID)' },
                },
                required: ['projectId'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_contract_expiry',
            description: 'Lấy danh sách hợp đồng sắp hết hạn trong N ngày tới. Dùng khi user hỏi về HĐ sắp hết hạn, cần gia hạn.',
            parameters: {
                type: 'object',
                properties: {
                    days: { type: 'number', description: 'Số ngày tới cần kiểm tra (mặc định 60)' },
                },
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_bidding_packages',
            description: 'Lấy danh sách gói thầu của một dự án hoặc tất cả gói thầu. Dùng khi user hỏi về đấu thầu, gói thầu, KHLCNT.',
            parameters: {
                type: 'object',
                properties: {
                    projectId: { type: 'string', description: 'Mã dự án (để trống = lấy tất cả)' },
                },
            },
        },
    },
];

// Legacy export for any code still referencing AI_TOOLS
export const AI_TOOLS = AI_TOOLS_OAI;

/**
 * Quick suggestion buttons cho chatbot UI
 */
export const QUICK_SUGGESTIONS = [
    { label: '📊 Tổng quan', prompt: 'Cho tôi tổng quan tình hình dự án và giải ngân hiện tại' },
    { label: '⚠️ Rủi ro', prompt: 'Có cảnh báo rủi ro nào cần xử lý không?' },
    { label: '💰 Giải ngân', prompt: 'Tiến độ giải ngân hiện tại như thế nào so với kế hoạch năm?' },
    { label: '📅 Deadline', prompt: 'Những công việc nào sắp đến hạn trong 30 ngày tới?' },
    { label: '📝 HĐ hết hạn', prompt: 'Hợp đồng nào sắp hết hạn trong 60 ngày tới?' },
    { label: '🏗️ Dự án lớn', prompt: 'Liệt kê 5 dự án có tổng mức đầu tư lớn nhất' },
];
