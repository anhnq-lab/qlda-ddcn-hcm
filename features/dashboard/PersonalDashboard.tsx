import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    User, Briefcase, CheckSquare, FileText, AlertTriangle,
    Clock, ArrowRight, Building2, TrendingUp,
    ChevronRight, Target, FileBox
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';
import { useContracts } from '../../hooks/useContracts';
import { formatShortCurrency as formatCurrency } from '../../utils/format';
import { ProjectStatus, TaskStatus, TaskPriority } from '../../types';
import { supabase } from '../../lib/supabase';

const PersonalDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { projects } = useProjects();
    const { data: allTasks } = useTasks();
    const { contracts } = useContracts();
    const tasks = allTasks || [];

    // Get projects where current user is a member
    const myProjects = useMemo(() => {
        if (!currentUser) return [];
        return projects.filter(p =>
            p.Members?.includes(currentUser.EmployeeID)
        );
    }, [currentUser, projects]);

    const myProjectIds = useMemo(() => myProjects.map(p => p.ProjectID), [myProjects]);

    // Get tasks assigned to current user
    const myTasks = useMemo(() => {
        if (!currentUser) return [];
        return tasks.filter(t => t.AssigneeID === currentUser.EmployeeID);
    }, [currentUser, tasks]);

    // Tasks by status
    const taskStats = useMemo(() => {
        const inProgress = myTasks.filter(t => t.Status === TaskStatus.InProgress).length;
        const todo = myTasks.filter(t => t.Status === TaskStatus.Todo).length;
        const done = myTasks.filter(t => t.Status === TaskStatus.Done).length;
        const overdue = myTasks.filter(t => {
            const due = new Date(t.DueDate);
            return t.Status !== TaskStatus.Done && due < new Date();
        }).length;
        return { inProgress, todo, done, overdue, total: myTasks.length };
    }, [myTasks]);

    // Upcoming deadlines (next 7 days) — with project name resolution
    const upcomingDeadlines = useMemo(() => {
        const now = new Date();
        const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        // Build project name lookup map
        const projectNameMap: Record<string, string> = {};
        projects.forEach(p => {
            projectNameMap[p.ProjectID] = p.ProjectName;
        });

        return myTasks
            .filter(t => {
                const due = new Date(t.DueDate);
                return t.Status !== TaskStatus.Done && due >= now && due <= next7Days;
            })
            .sort((a, b) => new Date(a.DueDate).getTime() - new Date(b.DueDate).getTime())
            .slice(0, 5)
            .map(t => ({
                ...t,
                _projectName: projectNameMap[t.ProjectID] || t.ProjectID,
            }));
    }, [myTasks, projects]);

    // Fetch recent documents from Supabase for my projects
    const { data: myDocuments = [] } = useQuery({
        queryKey: ['personal-documents', myProjectIds],
        queryFn: async () => {
            if (myProjectIds.length === 0) return [];
            const { data } = await supabase
                .from('documents')
                .select('doc_id, doc_name, project_id, upload_date, iso_status, version, category')
                .in('project_id', myProjectIds)
                .order('upload_date', { ascending: false })
                .limit(5);
            return data || [];
        },
        enabled: myProjectIds.length > 0,
    });

    // Get contracts for my projects
    const myContracts = useMemo(() => {
        return contracts.filter(c => myProjectIds.includes(c.ProjectID));
    }, [contracts, myProjectIds]);

    // Total investment of my projects
    const totalInvestment = myProjects.reduce((sum, p) => sum + p.TotalInvestment, 0);

    // Priority colors
    const priorityColors: Record<string, string> = {
        [TaskPriority.Urgent]: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800',
        [TaskPriority.High]: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
        [TaskPriority.Medium]: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
        [TaskPriority.Low]: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    };

    const daysUntil = (dateStr: string) => {
        const diff = Math.ceil((new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 0) return 'Hôm nay';
        if (diff === 1) return 'Ngày mai';
        return `${diff} ngày`;
    };

    // Build project name lookup for documents
    const projectNameMap = useMemo(() => {
        const map: Record<string, string> = {};
        projects.forEach(p => { map[p.ProjectID] = p.ProjectName; });
        return map;
    }, [projects]);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Welcome Header */}
            <div className="rounded-2xl p-4 sm:p-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #2D2D2D 0%, #3D3D3D 50%, #4A4A4A 100%)', borderLeft: '4px solid #D4A017' }}>
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute right-20 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2"></div>

                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur">
                            {currentUser?.AvatarUrl ? (
                                <img src={currentUser.AvatarUrl} alt="" className="w-full h-full object-cover rounded-2xl" />
                            ) : (
                                <User className="w-8 h-8 text-white" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Xin chào, {currentUser?.FullName || 'Khách'}!</h1>
                            <p className="text-gray-400 mt-1">{currentUser?.Position} - {currentUser?.Department}</p>
                        </div>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-sm text-gray-400">Hôm nay</p>
                        <p className="text-xl font-bold">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Card 1: Dự án phụ trách — Charcoal */}
                <div
                    className="stat-card-premium cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #404040 0%, #333333 100%)', borderTop: '3px solid #8A8A8A' }}
                    onClick={() => navigate('/projects')}
                >
                    <div className="flex items-center justify-between relative z-10">
                        <div className="p-2.5 rounded-xl bg-white/20 shadow-sm">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-3xl font-black text-white tracking-tight drop-shadow-sm">{myProjects.length}</h3>
                        <p className="text-[10px] font-extrabold text-white/90 uppercase tracking-[0.15em]">Dự án phụ trách</p>
                    </div>
                    <div className="absolute top-0 right-0 p-4 opacity-[0.15] text-white">
                        <Building2 className="w-20 h-20" />
                    </div>
                </div>

                {/* Card 2: Công việc đang làm — Warm Charcoal */}
                <div
                    className="stat-card-premium cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #4A4535 0%, #3D3A2D 100%)', borderTop: '3px solid #A89050' }}
                    onClick={() => navigate('/tasks')}
                >
                    <div className="flex items-center justify-between relative z-10">
                        <div className="p-2.5 rounded-xl bg-white/20 shadow-sm">
                            <Target className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-3xl font-black text-white tracking-tight drop-shadow-sm">{taskStats.inProgress}</h3>
                        <p className="text-[10px] font-extrabold text-white/90 uppercase tracking-[0.15em]">Công việc đang làm</p>
                    </div>
                    <div className="absolute top-0 right-0 p-4 opacity-[0.15] text-white">
                        <Target className="w-20 h-20" />
                    </div>
                </div>

                {/* Card 3: Chờ xử lý — Gold-brown */}
                <div
                    className="stat-card-premium cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #5A4F35 0%, #4A4230 100%)', borderTop: '3px solid #C4A035' }}
                    onClick={() => navigate('/tasks')}
                >
                    <div className="flex items-center justify-between relative z-10">
                        <div className="p-2.5 rounded-xl bg-white/20 shadow-sm">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-3xl font-black text-white tracking-tight drop-shadow-sm">{taskStats.todo}</h3>
                        <p className="text-[10px] font-extrabold text-white/90 uppercase tracking-[0.15em]">Chờ xử lý</p>
                    </div>
                    <div className="absolute top-0 right-0 p-4 opacity-[0.15] text-white">
                        <Clock className="w-20 h-20" />
                    </div>
                </div>

                {/* Card 4: Quá hạn — Rich Gold */}
                <div
                    className="stat-card-premium cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #6B5A30 0%, #5A4A25 100%)', borderTop: '3px solid #D4A017' }}
                    onClick={() => navigate('/tasks')}
                >
                    <div className="flex items-center justify-between relative z-10">
                        <div className="p-2.5 rounded-xl bg-white/20 shadow-sm">
                            <AlertTriangle className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-3xl font-black text-white tracking-tight drop-shadow-sm">{taskStats.overdue}</h3>
                        <p className="text-[10px] font-extrabold text-white/90 uppercase tracking-[0.15em]">Quá hạn</p>
                    </div>
                    <div className="absolute top-0 right-0 p-4 opacity-[0.15] text-white">
                        <AlertTriangle className="w-20 h-20" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {/* My Projects */}
                <div className="xl:col-span-2 section-card">
                    <div className="section-card-header">
                        <div className="flex items-center gap-2">
                            <div className="section-icon"><Briefcase className="w-3.5 h-3.5" /></div>
                            <span>Dự án của tôi</span>
                        </div>
                        <button
                            onClick={() => navigate('/projects')}
                            className="text-xs font-bold text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 flex items-center gap-1"
                        >
                            Xem tất cả <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="divide-y divide-gray-50 dark:divide-slate-700">
                        {myProjects.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 dark:text-slate-500">
                                <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-slate-600" />
                                <p>Bạn chưa được phân công dự án nào</p>
                            </div>
                        ) : (
                            myProjects.slice(0, 4).map(project => (
                                <div
                                    key={project.ProjectID}
                                    onClick={() => navigate(`/projects/${project.ProjectID}`)}
                                    className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors flex items-center gap-4"
                                >
                                    <div className={`w-2 h-12 rounded-full ${project.Status === ProjectStatus.Preparation ? 'bg-slate-500' :
                                        project.Status === ProjectStatus.Execution ? 'bg-amber-500' :
                                            project.Status === ProjectStatus.Completion ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-slate-600'
                                        }`}></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-800 dark:text-slate-100 truncate">{project.ProjectName}</p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-slate-400">
                                            <span>Nhóm {project.GroupCode}</span>
                                            <span>•</span>
                                            <span>{formatCurrency(project.TotalInvestment)}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-20 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-amber-500 rounded-full transition-all"
                                                    style={{ width: `${project.Progress || 0}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-bold text-gray-600 dark:text-slate-300">{project.Progress || 0}%</span>
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${project.Status === ProjectStatus.Preparation ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' :
                                            project.Status === ProjectStatus.Execution ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                project.Status === ProjectStatus.Completion ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400'
                                            }`}>
                                            {project.Status === ProjectStatus.Execution ? 'Thực hiện DA' :
                                                project.Status === ProjectStatus.Completion ? 'Kết thúc XD' : 'Chuẩn bị DA'}
                                        </span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300 dark:text-slate-600" />
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Upcoming Deadlines */}
                <div className="section-card">
                    <div className="section-card-header">
                        <div className="flex items-center gap-2">
                            <div className="section-icon"><Clock className="w-3.5 h-3.5" /></div>
                            <span>Deadline sắp tới</span>
                        </div>
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded">7 ngày</span>
                    </div>

                    <div className="divide-y divide-gray-50 dark:divide-slate-700">
                        {upcomingDeadlines.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 dark:text-slate-500">
                                <CheckSquare className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-slate-600" />
                                <p>Không có deadline trong 7 ngày tới</p>
                            </div>
                        ) : (
                            upcomingDeadlines.map(task => (
                                <div
                                    key={task.TaskID}
                                    onClick={() => navigate(`/tasks/${task.TaskID}`)}
                                    className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-800 dark:text-slate-100 text-sm truncate">{task.Title}</p>
                                            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 truncate">{task._projectName}</p>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded border shrink-0 ${priorityColors[task.Priority]}`}>
                                            {daysUntil(task.DueDate)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* My Tasks */}
                <div className="section-card">
                    <div className="section-card-header">
                        <div className="flex items-center gap-2">
                            <div className="section-icon"><CheckSquare className="w-3.5 h-3.5" /></div>
                            <span>Công việc đang thực hiện</span>
                        </div>
                        <button
                            onClick={() => navigate('/tasks')}
                            className="text-xs font-bold text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 flex items-center gap-1"
                        >
                            Xem tất cả <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="divide-y divide-gray-50 dark:divide-slate-700 max-h-[300px] overflow-y-auto">
                        {myTasks.filter(t => t.Status === TaskStatus.InProgress).slice(0, 5).map(task => (
                            <div
                                key={task.TaskID}
                                onClick={() => navigate(`/tasks/${task.TaskID}`)}
                                className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors flex items-center gap-3"
                            >
                                <div className={`w-2 h-2 rounded-full ${task.Priority === TaskPriority.Urgent ? 'bg-rose-500' :
                                    task.Priority === TaskPriority.High ? 'bg-amber-500' :
                                        task.Priority === TaskPriority.Medium ? 'bg-yellow-500' : 'bg-emerald-500'
                                    }`}></div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-800 dark:text-slate-100 text-sm truncate">{task.Title}</p>
                                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{task.DueDate}</p>
                                </div>
                                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded">
                                    Đang làm
                                </span>
                            </div>
                        ))}

                        {myTasks.filter(t => t.Status === TaskStatus.InProgress).length === 0 && (
                            <div className="p-8 text-center text-gray-400 dark:text-slate-500">
                                <Target className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-slate-600" />
                                <p className="text-sm">Không có công việc đang thực hiện</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* My Documents — Real Data from Supabase */}
                <div className="section-card">
                    <div className="section-card-header">
                        <div className="flex items-center gap-2">
                            <div className="section-icon"><FileText className="w-3.5 h-3.5" /></div>
                            <span>Tài liệu gần đây</span>
                        </div>
                        <button
                            onClick={() => navigate('/documents')}
                            className="text-xs font-bold text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 flex items-center gap-1"
                        >
                            Xem tất cả <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="divide-y divide-gray-50 dark:divide-slate-700 max-h-[300px] overflow-y-auto">
                        {myDocuments.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 dark:text-slate-500">
                                <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-slate-600" />
                                <p className="text-sm">Chưa có tài liệu nào</p>
                            </div>
                        ) : (
                            myDocuments.map((doc: any) => (
                                <div
                                    key={doc.doc_id}
                                    className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors flex items-center gap-3"
                                    onClick={() => navigate('/documents')}
                                >
                                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
                                        <FileBox className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-800 dark:text-slate-100 text-sm truncate">{doc.doc_name}</p>
                                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 truncate">
                                            {projectNameMap[doc.project_id] || doc.project_id}
                                            {doc.version ? ` • v${doc.version}` : ''}
                                        </p>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${doc.iso_status?.startsWith('A')
                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400'
                                        }`}>
                                        {doc.iso_status?.startsWith('A') ? 'Đã duyệt' : doc.iso_status || 'Nháp'}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Contracts Row */}
            {myContracts.length > 0 && (
                <div className="section-card">
                    <div className="section-card-header">
                        <div className="flex items-center gap-2">
                            <div className="section-icon"><FileText className="w-3.5 h-3.5" /></div>
                            <span>Hợp đồng liên quan</span>
                        </div>
                        <button
                            onClick={() => navigate('/contracts')}
                            className="text-xs font-bold text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 flex items-center gap-1"
                        >
                            Xem tất cả <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="divide-y divide-gray-50 dark:divide-slate-700">
                        {myContracts.slice(0, 3).map(contract => (
                            <div
                                key={contract.ContractID}
                                onClick={() => navigate(`/contracts/${contract.ContractID}`)}
                                className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors flex items-center gap-4"
                            >
                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
                                    <Briefcase className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-800 dark:text-slate-100 text-sm truncate">{contract.ContractName}</p>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-slate-400">
                                        <span>{formatCurrency(contract.Value)}</span>
                                        <span>•</span>
                                        <span>{projectNameMap[contract.ProjectID] || contract.ProjectID}</span>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-300 dark:text-slate-600" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Summary Footer */}
            <div className="bg-gradient-to-r from-gray-50 to-white dark:from-slate-800 dark:to-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
                <div className="flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center gap-8">
                        <div>
                            <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">Tổng mức đầu tư phụ trách</p>
                            <p className="text-xl font-black text-gray-900 dark:text-slate-100 mt-1">{formatCurrency(totalInvestment)}</p>
                        </div>
                        <div className="h-10 w-px bg-gray-200 dark:bg-slate-700"></div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">Hoàn thành công việc</p>
                            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                                {taskStats.done}/{taskStats.total} <span className="text-sm font-normal text-gray-400 dark:text-slate-500">({taskStats.total > 0 ? Math.round(taskStats.done / taskStats.total * 100) : 0}%)</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/tasks')}
                        className="px-5 py-2.5 text-white text-sm font-bold rounded-xl transition-colors shadow-lg flex items-center gap-2"
                        style={{ background: 'linear-gradient(135deg, #D4A017 0%, #B8860B 100%)', boxShadow: '0 4px 14px rgba(184, 134, 11, 0.3)' }}
                    >
                        <TrendingUp className="w-4 h-4" />
                        Xem báo cáo chi tiết
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PersonalDashboard;
