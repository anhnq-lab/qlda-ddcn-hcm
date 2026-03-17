import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScopedProjects } from '../../hooks/useScopedProjects';
import { ProjectGroup, MANAGEMENT_BOARDS } from '../../types';
import { ProjectCard } from './ProjectCard';
import { ProjectStats } from './ProjectStats';
import { Search, Plus, LayoutGrid, List as ListIcon, Filter, Layers, ArrowUpDown, FolderOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '../../components/ui/Skeleton';
import { CreateProjectModal, SelectedMember } from './components/CreateProjectModal';
import ProjectService from '../../services/ProjectService';
import { Project } from '../../types';
import { supabase } from '../../lib/supabase';
import { useSlidePanel } from '../../context/SlidePanelContext';
import ProjectDetail from './ProjectDetail';
import { useProjectFilters, STATUS_OPTIONS, GROUP_OPTIONS, SortOption } from './hooks/useProjectFilters';

const ProjectList: React.FC = () => {
    const navigate = useNavigate();
    const { openPanel, closePanel } = useSlidePanel();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Data Fetching with scope
    const { scopedProjects, isLoading } = useScopedProjects();
    const refetch = () => { /* refetch handled by react-query */ };

    // Filter Hook (debounce, URL sync, counts)
    const {
        searchQuery, setSearchQuery,
        selectedStatus, setSelectedStatus,
        selectedGroup, setSelectedGroup,
        selectedBoard, setSelectedBoard,
        sortBy, setSortBy,
        viewMode, setViewMode,
        sortedProjects,
        statusCounts, groupCounts, boardCounts,
        clearFilters, hasActiveFilters,
    } = useProjectFilters(scopedProjects);

    // Create Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCreateProject = () => {
        setIsModalOpen(true);
    };

    const handleSaveProject = async (data: Partial<Project> & { StartDate: Date }, members: SelectedMember[]) => {
        try {
            // 1. Create Project
            const newProject = await ProjectService.create(data);

            // 2. Save Project Members
            if (members.length > 0) {
                const memberRows = members.map(m => ({
                    project_id: newProject.ProjectID,
                    employee_id: m.employeeId,
                    role: m.role,
                    joined_at: new Date().toISOString(),
                }));
                const { error: memberError } = await supabase
                    .from('project_members')
                    .insert(memberRows);
                if (memberError) console.error('Failed to save members:', memberError.message);
            }

            // 3. Notify and Navigate
            refetch();
            setIsModalOpen(false);
            navigate(`/projects/${newProject.ProjectID}`);
        } catch (error) {
            console.error('Error creating project:', error);
            alert('Có lỗi xảy ra khi tạo dự án. Vui lòng thử lại.');
        }
    };

    // Open project detail in slide panel
    const handleOpenProject = useCallback((project: Project) => {
        openPanel({
            title: project.ProjectName,
            icon: <FolderOpen size={14} />,
            url: `/projects/${project.ProjectID}`,
            component: (
                <ProjectDetail
                    projectId={project.ProjectID}
                    onClose={() => closePanel()}
                    inPanel
                />
            ),
        });
    }, [openPanel, closePanel]);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300 pb-20">
            {/* 1. STATS HEADER */}
            <ProjectStats projects={scopedProjects} />

            <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* 2. SIDEBAR FILTER (Premium Style) */}
                <div className={`shrink-0 transition-all duration-300 ${isSidebarOpen ? 'w-full lg:w-72' : 'w-0 lg:w-10'}`}>
                    <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden sticky top-6 ${!isSidebarOpen ? 'hidden lg:flex lg:items-center lg:justify-center lg:py-4' : ''}`}>
                        {/* Collapsed state */}
                        {!isSidebarOpen && (
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-all"
                                title="Mở bộ lọc"
                            >
                                <ChevronRight className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                            </button>
                        )}

                        {/* Expanded state */}
                        {isSidebarOpen && (
                            <>
                                <div className="p-4 border-b border-gray-50 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/80 flex justify-between items-center">
                                    <h3 className="font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                                        <Filter className="w-4 h-4 text-primary-600 dark:text-primary-400" /> Bộ lọc dự án
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        {hasActiveFilters && (
                                            <button onClick={clearFilters} className="text-xs text-red-500 dark:text-red-400 hover:underline">Xóa lọc</button>
                                        )}
                                        <button
                                            onClick={() => setIsSidebarOpen(false)}
                                            className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded transition-all hidden lg:block"
                                            title="Thu gọn bộ lọc"
                                        >
                                            <ChevronLeft className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-4 space-y-6">
                                    {/* Status Filter */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-2">Giai đoạn</label>
                                        <div className="space-y-1">
                                            {STATUS_OPTIONS.map(opt => (
                                                <label
                                                    key={opt.val}
                                                    className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-200 ${selectedStatus === opt.val
                                                        ? 'bg-primary-50 dark:bg-primary-900/30 ring-1 ring-primary-200 dark:ring-primary-800'
                                                        : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="status"
                                                        checked={selectedStatus === opt.val}
                                                        onChange={() => setSelectedStatus(opt.val)}
                                                        className="sr-only"
                                                    />
                                                    <span className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white dark:ring-slate-800 shadow-sm" style={{ backgroundColor: opt.hex }}></span>
                                                    <span className={`text-sm flex-1 ${selectedStatus === opt.val ? 'font-bold text-gray-800 dark:text-slate-100' : 'text-gray-600 dark:text-slate-300 font-medium'}`}>{opt.label}</span>
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${selectedStatus === opt.val
                                                        ? 'bg-primary-100 dark:bg-primary-800/50 text-primary-700 dark:text-primary-300'
                                                        : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
                                                        }`}>
                                                        {statusCounts[opt.val] || 0}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="w-full h-px bg-gray-100 dark:bg-slate-700"></div>

                                    {/* Group Filter */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-2">Nhóm dự án</label>
                                        <div className="space-y-1">
                                            {GROUP_OPTIONS.map(g => (
                                                <button
                                                    key={g}
                                                    onClick={() => setSelectedGroup(g)}
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex justify-between items-center ${selectedGroup === g ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-bold shadow-sm' : 'text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                                                        }`}
                                                >
                                                    <span>{g === 'all' ? 'Tất cả nhóm' : `Nhóm ${g}`}</span>
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${selectedGroup === g
                                                        ? 'bg-primary-100 dark:bg-primary-800/50 text-primary-700 dark:text-primary-300'
                                                        : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
                                                        }`}>
                                                        {groupCounts[g] || 0}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="w-full h-px bg-gray-100 dark:bg-slate-700"></div>

                                    {/* Management Board Filter */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-2">Ban QLDA</label>
                                        <div className="space-y-1">
                                            <button
                                                onClick={() => setSelectedBoard('all')}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex justify-between items-center ${selectedBoard === 'all' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-bold shadow-sm' : 'text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}
                                            >
                                                <span>Tất cả ban</span>
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${selectedBoard === 'all'
                                                    ? 'bg-primary-100 dark:bg-primary-800/50 text-primary-700 dark:text-primary-300'
                                                    : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
                                                    }`}>
                                                    {boardCounts['all'] || 0}
                                                </span>
                                            </button>
                                            {MANAGEMENT_BOARDS.map(board => (
                                                <button
                                                    key={board.value}
                                                    onClick={() => setSelectedBoard(board.value.toString())}
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${selectedBoard === board.value.toString() ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-bold shadow-sm' : 'text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}
                                                >
                                                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: board.hex }}></span>
                                                    <span className="flex-1">{board.label}</span>
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${selectedBoard === board.value.toString()
                                                        ? 'bg-primary-100 dark:bg-primary-800/50 text-primary-700 dark:text-primary-300'
                                                        : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
                                                        }`}>
                                                        {boardCounts[board.value.toString()] || 0}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* 3. MAIN LIST AREA */}
                <div className="flex-1 w-full space-y-6">
                    {/* Toolbar */}
                    <div className="bg-white dark:bg-slate-800 p-2 pr-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative w-full md:flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm dự án, mã, chủ đầu tư..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-transparent border-none rounded-xl focus:ring-0 text-sm font-medium text-gray-800 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                                aria-label="Tìm kiếm dự án"
                            />
                        </div>

                        <div className="flex items-center gap-3 shrink-0 px-2 pb-2 md:pb-0">
                            {/* Result count */}
                            <span className="text-xs text-gray-400 dark:text-slate-500 font-medium whitespace-nowrap hidden sm:inline">
                                {sortedProjects.length} / {scopedProjects.length} dự án
                            </span>

                            <div className="h-8 w-px bg-gray-100 dark:bg-slate-700 hidden md:block"></div>

                            <div className="flex bg-gray-100 dark:bg-slate-700 p-1 rounded-lg">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}
                                    aria-label="Hiển thị dạng lưới"
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}
                                    aria-label="Hiển thị dạng danh sách"
                                >
                                    <ListIcon className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Sort Dropdown */}
                            <div className="flex items-center gap-1.5">
                                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                                <select
                                    value={sortBy}
                                    onChange={e => setSortBy(e.target.value as SortOption)}
                                    className="text-xs font-semibold bg-transparent border-none outline-none text-gray-600 dark:text-slate-300 cursor-pointer pr-4"
                                    aria-label="Sắp xếp dự án"
                                >
                                    <option value="name">Tên A→Z</option>
                                    <option value="budget">Ngân sách ↓</option>
                                    <option value="progress">Tiến độ ↓</option>
                                    <option value="created">Mới nhất</option>
                                </select>
                            </div>

                            <button
                                onClick={handleCreateProject}
                                className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all hover:-translate-y-0.5"
                                style={{ background: 'linear-gradient(135deg, #D4A017 0%, #B8860B 100%)', boxShadow: '0 4px 14px rgba(184, 134, 11, 0.3)' }}
                            >
                                <Plus className="w-4 h-4" />
                                <span>Thêm mới</span>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="min-h-[400px]">
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="bg-white dark:bg-slate-800 h-72 rounded-2xl p-4 space-y-4 border border-gray-200 dark:border-slate-700">
                                        <Skeleton className="h-40 w-full rounded-xl" />
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                ))}
                            </div>
                        ) : sortedProjects.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 border-dashed">
                                {/* Inline SVG illustration */}
                                <div className="mb-6">
                                    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="60" cy="60" r="56" fill="currentColor" className="text-gray-50 dark:text-slate-700/50" />
                                        <rect x="30" y="35" width="60" height="45" rx="6" stroke="currentColor" strokeWidth="2" className="text-gray-300 dark:text-slate-600" fill="none" />
                                        <path d="M30 47h60" stroke="currentColor" strokeWidth="2" className="text-gray-300 dark:text-slate-600" />
                                        <circle cx="38" cy="41" r="2" fill="currentColor" className="text-gray-300 dark:text-slate-600" />
                                        <circle cx="45" cy="41" r="2" fill="currentColor" className="text-gray-300 dark:text-slate-600" />
                                        <circle cx="52" cy="41" r="2" fill="currentColor" className="text-gray-300 dark:text-slate-600" />
                                        <path d="M50 62l6 6 14-14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 dark:text-slate-600" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100">
                                    {hasActiveFilters ? 'Không tìm thấy dự án phù hợp' : 'Chưa có dự án nào'}
                                </h3>
                                <p className="text-gray-500 dark:text-slate-400 mt-2 max-w-sm text-center text-sm">
                                    {hasActiveFilters
                                        ? 'Không có dự án nào phù hợp với bộ lọc hiện tại. Hãy thử thay đổi từ khóa hoặc bộ lọc.'
                                        : 'Hãy bắt đầu bằng việc tạo dự án đầu tiên.'}
                                </p>
                                {hasActiveFilters ? (
                                    <button
                                        onClick={clearFilters}
                                        className="mt-6 text-primary-600 dark:text-primary-400 font-bold hover:underline text-sm"
                                    >
                                        Xóa tất cả bộ lọc
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleCreateProject}
                                        className="mt-6 flex items-center gap-2 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all hover:-translate-y-0.5"
                                        style={{ background: 'linear-gradient(135deg, #D4A017 0%, #B8860B 100%)' }}
                                    >
                                        <Plus className="w-4 h-4" />
                                        Tạo dự án mới
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'flex flex-col gap-4'}>
                                {sortedProjects.map(project => (
                                    <ProjectCard
                                        key={project.ProjectID}
                                        project={project}
                                        onClick={() => handleOpenProject(project)}
                                        layout={viewMode}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Project Modal */}
            <CreateProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveProject}
            />
        </div>
    );
};

export default ProjectList;