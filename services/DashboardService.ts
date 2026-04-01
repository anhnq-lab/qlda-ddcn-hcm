// Dashboard Service - Supabase queries (simplified for leadership focus)
import { supabase } from '../lib/supabase';
import { ProjectStatus, MANAGEMENT_BOARDS } from '../types';

export interface DashboardOverviewMetrics {
    totalProjects: number;
    totalInvestment: number;
    yearlyPlanned: number;
    yearlyDisbursed: number;
    yearlyDisbursementRate: number;
    riskCount: number;
}

export interface DashboardProjectRow {
    projectId: string;
    projectName: string;
    managementBoard: number;
    boardLabel: string;
    status: number;
    statusLabel: string;
    progress: number;
    totalInvestment: number;
    paymentProgress: number;
    startDate: string | null;
    expectedEndDate: string | null;
    locationCode?: string;
}

export const DashboardService = {
    /** Core overview metrics — year-aware */
    getOverviewMetrics: async (year: number): Promise<DashboardOverviewMetrics> => {
        const today = new Date().toISOString();

        const [projectsRes, capitalRes, disbursedRes, overdueTasksRes, issueRes] = await Promise.all([
            supabase.from('projects').select('total_investment'),
            supabase.from('capital_plans').select('amount').eq('year', year),
            supabase.from('disbursements').select('amount, date')
                .gte('date', `${year}-01-01`)
                .lte('date', `${year}-12-31`),
            supabase.from('tasks').select('*', { count: 'exact', head: true })
                .neq('status', 'Done').lt('due_date', today),
            supabase.from('package_issues').select('*', { count: 'exact', head: true })
                .eq('status', 'Open'),
        ]);

        const totalInvestment = (projectsRes.data || []).reduce((acc, p) => acc + Number(p.total_investment), 0);
        const yearlyPlanned = (capitalRes.data || []).reduce((acc, p) => acc + Number(p.amount), 0);
        const yearlyDisbursed = (disbursedRes.data || []).reduce((acc, d) => acc + Number(d.amount), 0);
        const yearlyDisbursementRate = yearlyPlanned > 0
            ? Math.round((yearlyDisbursed / yearlyPlanned) * 1000) / 10
            : 0;
        const riskCount = (overdueTasksRes.count || 0) + (issueRes.count || 0);

        return {
            totalProjects: (projectsRes.data || []).length,
            totalInvestment,
            yearlyPlanned,
            yearlyDisbursed,
            yearlyDisbursementRate,
            riskCount,
        };
    },

    /** Project summary table — all projects with KPIs */
    getProjectSummary: async (): Promise<DashboardProjectRow[]> => {
        const { data: projects } = await supabase
            .from('projects')
            .select('project_id, project_name, management_board, status, progress, total_investment, payment_progress, start_date, expected_end_date, location_code')
            .order('management_board', { ascending: true });

        const statusLabels: Record<number, string> = {
            [ProjectStatus.Preparation]: 'Chuẩn bị ĐT',
            [ProjectStatus.Execution]: 'Thực hiện',
            [ProjectStatus.Completion]: 'Kết thúc XD',
        };

        return (projects || []).map(p => {
            const board = MANAGEMENT_BOARDS.find(b => b.value === p.management_board);
            return {
                projectId: p.project_id,
                projectName: p.project_name,
                managementBoard: p.management_board,
                boardLabel: board?.label || `Ban ${p.management_board}`,
                status: p.status,
                statusLabel: statusLabels[p.status] || 'Không rõ',
                progress: Number(p.progress) || 0,
                totalInvestment: Number(p.total_investment) || 0,
                paymentProgress: Number(p.payment_progress) || 0,
                startDate: p.start_date,
                expectedEndDate: p.expected_end_date,
                locationCode: p.location_code,
            };
        });
    },

    /** Capital vs Disbursement — planned vs actual by board for a given year */
    getCapitalVsDisbursement: async (year?: number): Promise<{
        name: string;
        planned: number;
        actual: number;
        rate: number;
        color: string;
    }[]> => {
        const targetYear = year || new Date().getFullYear();

        const [plansRes, disbursedRes, projectsRes] = await Promise.all([
            supabase.from('capital_plans').select('project_id, amount').eq('year', targetYear),
            supabase.from('disbursements').select('project_id, amount')
                .gte('date', `${targetYear}-01-01`)
                .lte('date', `${targetYear}-12-31`),
            supabase.from('projects').select('project_id, management_board'),
        ]);

        return MANAGEMENT_BOARDS.map(board => {
            const boardProjectIds = (projectsRes.data || [])
                .filter(p => p.management_board === board.value)
                .map(p => p.project_id);

            const planned = (plansRes.data || [])
                .filter(p => boardProjectIds.includes(p.project_id))
                .reduce((s, p) => s + Number(p.amount), 0);

            const actual = (disbursedRes.data || [])
                .filter(d => boardProjectIds.includes(d.project_id))
                .reduce((s, d) => s + Number(d.amount), 0);

            return {
                name: board.label,
                planned: Math.round(planned / 1e9 * 10) / 10,
                actual: Math.round(actual / 1e9 * 10) / 10,
                rate: planned > 0 ? Math.round((actual / planned) * 100) : 0,
                color: board.hex,
            };
        });
    },

    /** Task Completion — count by status for ring chart */
    getTaskCompletion: async (): Promise<{
        done: number;
        inProgress: number;
        todo: number;
        overdue: number;
        total: number;
    }> => {
        const today = new Date().toISOString();
        const { data: tasks } = await supabase
            .from('tasks')
            .select('status, due_date');

        const all = tasks || [];
        const done = all.filter(t => t.status === 'Done').length;
        const overdue = all.filter(t => t.status !== 'Done' && t.due_date && t.due_date < today).length;
        const inProgress = all.filter(t => (t.status === 'InProgress' || t.status === 'Review') && !(t.due_date && t.due_date < today)).length;
        const todo = all.filter(t => t.status === 'Todo' && !(t.due_date && t.due_date < today)).length;

        return { done, inProgress, todo, overdue, total: all.length };
    },

    /** Risks — overdue tasks + open issues */
    getRisks: async () => {
        const risks: { id: string | number; type: string; msg: string; date: string; severity: 'high' | 'medium' | 'low' }[] = [];
        const today = new Date().toISOString();

        const [overdueTasks, issues] = await Promise.all([
            supabase.from('tasks')
                .select('task_id, title, due_date, project_id')
                .neq('status', 'Done').lt('due_date', today)
                .order('due_date', { ascending: true }).limit(5),
            supabase.from('package_issues')
                .select('issue_id, title, reported_date, severity')
                .eq('status', 'Open')
                .order('reported_date', { ascending: false }).limit(5),
        ]);

        (overdueTasks.data || []).forEach(t => {
            const dueDate = new Date(t.due_date);
            const daysOverdue = Math.ceil((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
            risks.push({
                id: t.task_id,
                type: 'overdue',
                msg: `Công việc "${t.title}" quá hạn ${daysOverdue} ngày`,
                date: dueDate.toLocaleDateString('vi-VN'),
                severity: daysOverdue > 14 ? 'high' : daysOverdue > 7 ? 'medium' : 'low',
            });
        });

        (issues.data || []).forEach(issue => {
            risks.push({
                id: issue.issue_id,
                type: 'issue',
                msg: `Vấn đề gói thầu: ${issue.title}`,
                date: new Date(issue.reported_date).toLocaleDateString('vi-VN'),
                severity: issue.severity === 'High' ? 'high' : issue.severity === 'Medium' ? 'medium' : 'low',
            });
        });

        return risks.slice(0, 8);
    },
};
