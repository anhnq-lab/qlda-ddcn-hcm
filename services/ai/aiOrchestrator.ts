// AI Orchestrator — DeepSeek function calling loop (OpenAI-compatible)
// Flow: User → Edge Function (gemini-proxy) → DeepSeek → Tool calls → Execute → Loop → Response

import { sendChatMessage, generateContent, AIMessage, OAIToolCall } from './geminiProxy';
import { AI_TOOLS_OAI } from './aiTools';
import { buildSystemPrompt } from './prompts';
import { ProjectService } from '../ProjectService';
import { ContractService } from '../ContractService';
import { PaymentService } from '../PaymentService';
import { DashboardService } from '../DashboardService';
import { supabase } from '../../lib/supabase';
import type { ChatMessage } from '../aiService';

const MODEL = 'deepseek-chat';

// Từ khóa gợi ý câu hỏi cần dữ liệu thực
const DATA_KEYWORDS = [
    'dự án', 'hợp đồng', 'thanh toán', 'giải ngân', 'tiến độ', 'vốn',
    'rủi ro', 'deadline', 'hết hạn', 'gói thầu', 'nhà thầu', 'kế hoạch',
    'số liệu', 'thống kê', 'tổng quan', 'bao nhiêu', 'danh sách', 'liệt kê',
    'project', 'contract', 'payment', 'risk', 'budget', 'tổng mức',
];

function needsDataQuery(message: string): boolean {
    const lower = message.toLowerCase();
    return DATA_KEYWORDS.some(kw => lower.includes(kw));
}

// ── Function executor ─────────────────────────────────────────────

async function executeFunctionCall(
    name: string,
    args: Record<string, unknown>
): Promise<unknown> {
    try {
        switch (name) {
            case 'get_all_projects': {
                const params: { search?: string; filters?: Record<string, unknown> } = {};
                if (args.search) params.search = args.search as string;
                if (args.status) params.filters = { status: Number(args.status) };
                const projects = await ProjectService.getAll(params);
                return projects.map(p => ({
                    ProjectID: p.ProjectID,
                    ProjectName: p.ProjectName,
                    GroupCode: p.GroupCode,
                    Status: p.Status,
                    TotalInvestment: p.TotalInvestment,
                    Progress: p.Progress,
                    PaymentProgress: p.PaymentProgress,
                    InvestorName: p.InvestorName,
                }));
            }

            case 'get_project_by_id': {
                const project = await ProjectService.getById(args.projectId as string);
                return project || { error: 'Không tìm thấy dự án' };
            }

            case 'get_project_statistics': {
                return await ProjectService.getStatistics();
            }

            case 'get_all_contracts': {
                const params: { filters?: Record<string, unknown> } = {};
                if (args.status) params.filters = { status: Number(args.status) };
                const contracts = await ContractService.getAll(params);
                return contracts.map(c => ({
                    ContractID: c.ContractID,
                    ContractName: c.ContractName,
                    Value: c.Value,
                    Status: c.Status,
                    SignDate: c.SignDate,
                    EndDate: c.EndDate,
                    AdvanceRate: c.AdvanceRate,
                }));
            }

            case 'get_all_payments': {
                const params: { filters?: Record<string, unknown> } = {};
                if (args.contractId) params.filters = { contractId: args.contractId as string };
                const payments = await PaymentService.getAll(params);
                return payments.map(p => ({
                    PaymentID: p.PaymentID,
                    ContractID: p.ContractID,
                    BatchNo: p.BatchNo,
                    Type: p.Type,
                    Amount: p.Amount,
                    Status: p.Status,
                }));
            }

            case 'get_dashboard_metrics': {
                const year = (args.year as number) || new Date().getFullYear();
                return await DashboardService.getOverviewMetrics(year);
            }

            case 'get_capital_info': {
                return await ProjectService.getCapitalInfo(args.projectId as string);
            }

            case 'get_dashboard_risks': {
                return await DashboardService.getRisks();
            }

            case 'get_upcoming_deadlines': {
                const days = (args.days as number) || 30;
                const today = new Date().toISOString().split('T')[0];
                const futureDate = new Date();
                futureDate.setDate(futureDate.getDate() + days);
                const futureDateStr = futureDate.toISOString().split('T')[0];

                const { data: tasks } = await supabase
                    .from('tasks')
                    .select('id, title, project_id, due_date, status, priority')
                    .not('due_date', 'is', null)
                    .not('status', 'in', '("done","completed")')
                    .lte('due_date', futureDateStr)
                    .gte('due_date', today)
                    .order('due_date', { ascending: true })
                    .limit(20);

                const projects = await ProjectService.getAll();
                const projectNameMap: Record<string, string> = {};
                projects.forEach(p => { projectNameMap[p.ProjectID] = p.ProjectName; });

                return (tasks || []).map((t: any) => ({
                    id: t.id,
                    title: t.title,
                    projectName: projectNameMap[t.project_id] || t.project_id,
                    dueDate: t.due_date,
                    daysLeft: Math.ceil((new Date(t.due_date).getTime() - Date.now()) / 86400000),
                    status: t.status,
                    priority: t.priority,
                }));
            }

            case 'get_project_tasks': {
                const projectId = args.projectId as string;
                if (!projectId) return { error: 'projectId là bắt buộc' };

                const { data: tasks } = await supabase
                    .from('tasks')
                    .select('id, title, status, priority, progress, due_date, phase, step_code')
                    .eq('project_id', projectId)
                    .is('parent_id', null)
                    .order('sort_order', { ascending: true })
                    .limit(50);

                const statusMap: Record<string, string> = {
                    todo: 'Chưa làm', in_progress: 'Đang làm',
                    review: 'Đang duyệt', done: 'Hoàn thành', completed: 'Hoàn thành',
                };
                return (tasks || []).map((t: any) => ({
                    ...t,
                    statusLabel: statusMap[t.status] || t.status,
                }));
            }

            case 'get_contract_expiry': {
                const withinDays = (args.days as number) || 60;
                const today = new Date().toISOString().split('T')[0];
                const futureDate = new Date();
                futureDate.setDate(futureDate.getDate() + withinDays);
                const futureDateStr = futureDate.toISOString().split('T')[0];

                const contracts = await ContractService.getAll();
                const expiring = contracts.filter(c => {
                    if (!c.EndDate || c.Status === 3) return false;
                    const end = c.EndDate.split('T')[0];
                    return end >= today && end <= futureDateStr;
                });

                return expiring.map(c => ({
                    ContractID: c.ContractID,
                    ContractName: c.ContractName,
                    Value: c.Value,
                    EndDate: c.EndDate,
                    daysLeft: Math.ceil((new Date(c.EndDate).getTime() - Date.now()) / 86400000),
                }));
            }

            case 'get_bidding_packages': {
                if (args.projectId) {
                    return await ProjectService.getPackagesByProject(args.projectId as string);
                }
                return await ProjectService.getAllBiddingPackages();
            }

            default:
                return { error: `Unknown function: ${name}` };
        }
    } catch (error) {
        console.error(`Error executing function ${name}:`, error);
        return { error: `Lỗi truy vấn dữ liệu: ${error instanceof Error ? error.message : 'Unknown'}` };
    }
}

// ── Main chat handler with function calling loop ──────────────────

export async function sendContextAwareMessage(
    history: ChatMessage[],
    newMessage: string
): Promise<string> {
    // Build messages array in OpenAI format
    const messages: AIMessage[] = [
        { role: 'system', content: buildSystemPrompt() },
    ];

    // Add relevant history (skip errors, start from first user message)
    const validHistory = history.filter(msg => !msg.isError);
    const firstUserIdx = validHistory.findIndex(m => m.sender === 'user');
    if (firstUserIdx !== -1) {
        validHistory.slice(firstUserIdx).forEach(msg => {
            messages.push({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text,
            });
        });
    }

    // Add current user message
    messages.push({ role: 'user', content: newMessage });

    // Only enable tool calling for messages that actually need data
    const useTools = needsDataQuery(newMessage);

    // Initial request
    let response = await sendChatMessage(messages, {
        model: MODEL,
        tools: useTools ? AI_TOOLS_OAI : undefined,
        tool_choice: useTools ? 'auto' : undefined,
        max_tokens: 2048,
        temperature: 0.3,
    });

    if (!useTools) {
        return response.choices?.[0]?.message?.content || '';
    }

    // Function calling loop — max 2 iterations to keep response fast
    let iterations = 0;
    while (iterations < 2) {
        const choice = response.choices?.[0];
        if (!choice) break;

        const { message, finish_reason } = choice;

        // No more tool calls → done
        if (finish_reason === 'stop' || !message.tool_calls?.length) break;

        // Append assistant message with tool_calls
        messages.push({
            role: 'assistant',
            content: message.content,
            tool_calls: message.tool_calls,
        });

        // Execute each tool call in parallel
        const toolResults = await Promise.all(
            message.tool_calls.map(async (toolCall: OAIToolCall) => {
                const fnName = toolCall.function.name;
                let fnArgs: Record<string, unknown> = {};
                try {
                    fnArgs = JSON.parse(toolCall.function.arguments || '{}');
                } catch { /* keep empty args */ }

                console.log(`[AI] Calling: ${fnName}`, fnArgs);
                const result = await executeFunctionCall(fnName, fnArgs);
                return { toolCall, result };
            })
        );

        // Append tool results as tool messages
        for (const { toolCall, result } of toolResults) {
            messages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: JSON.stringify(result),
            });
        }

        // Continue with tool results — allow more tools only on first iteration
        response = await sendChatMessage(messages, {
            model: MODEL,
            tools: iterations === 0 ? AI_TOOLS_OAI : undefined,
            tool_choice: iterations === 0 ? 'auto' : undefined,
            max_tokens: 2048,
            temperature: 0.3,
        });

        iterations++;
    }

    return response.choices?.[0]?.message?.content || '';
}

// ── Simple analysis (no function calling) ────────────────────────

export async function generateAIAnalysis(
    prompt: string,
    data: unknown
): Promise<string> {
    const fullPrompt = `${prompt}\n\nDữ liệu:\n${JSON.stringify(data, null, 2)}`;
    return generateContent(fullPrompt, {
        model: MODEL,
        max_tokens: 4096,
        temperature: 0.2,
    });
}
