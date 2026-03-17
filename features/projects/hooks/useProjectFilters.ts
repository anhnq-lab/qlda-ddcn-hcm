/**
 * useProjectFilters — Custom hook managing filter state + URL sync + debounce search
 * Extracted from ProjectList to separate concerns and improve maintainability.
 */
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Project, ProjectStatus, ProjectGroup } from '../../../types';

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

export const STATUS_OPTIONS = [
    { val: 'all', label: 'Tất cả', hex: '#9CA3AF' },
    { val: ProjectStatus.Preparation.toString(), label: 'Chuẩn bị dự án', hex: '#3B82F6' },
    { val: ProjectStatus.Execution.toString(), label: 'Thực hiện dự án', hex: '#F97316' },
    { val: ProjectStatus.Completion.toString(), label: 'Kết thúc xây dựng', hex: '#10B981' },
] as const;

export const GROUP_OPTIONS = ['all', ProjectGroup.A, ProjectGroup.B, ProjectGroup.C] as const;

export type SortOption = 'name' | 'budget' | 'progress' | 'created';

// ═══════════════════════════════════════════════════════════════
// DEBOUNCE HOOK
// ═══════════════════════════════════════════════════════════════

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debouncedValue;
}

// ═══════════════════════════════════════════════════════════════
// MAIN HOOK
// ═══════════════════════════════════════════════════════════════

export interface ProjectFiltersResult {
    // Raw input
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    // Filter state
    selectedStatus: string;
    setSelectedStatus: (s: string) => void;
    selectedGroup: string;
    setSelectedGroup: (g: string) => void;
    selectedBoard: string;
    setSelectedBoard: (b: string) => void;
    sortBy: SortOption;
    setSortBy: (s: SortOption) => void;
    // View mode
    viewMode: 'grid' | 'list';
    setViewMode: (m: 'grid' | 'list') => void;
    // Computed
    filteredProjects: Project[];
    sortedProjects: Project[];
    /** Count per status filter option */
    statusCounts: Record<string, number>;
    /** Count per group filter option */
    groupCounts: Record<string, number>;
    /** Count per board filter option */
    boardCounts: Record<string, number>;
    // Actions
    clearFilters: () => void;
    hasActiveFilters: boolean;
}

export function useProjectFilters(projects: Project[]): ProjectFiltersResult {
    const [searchParams, setSearchParams] = useSearchParams();
    const isInitRef = useRef(false);

    // ── State from URL or defaults ──
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'all');
    const [selectedGroup, setSelectedGroup] = useState(searchParams.get('group') || 'all');
    const [selectedBoard, setSelectedBoard] = useState(searchParams.get('board') || 'all');
    const [sortBy, setSortBy] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'name');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>((searchParams.get('view') as 'grid' | 'list') || 'grid');

    // Debounced search for filtering
    const debouncedSearch = useDebounce(searchQuery, 300);

    // ── Sync state → URL (skip on first render) ──
    useEffect(() => {
        if (!isInitRef.current) {
            isInitRef.current = true;
            return;
        }
        const params = new URLSearchParams();
        if (debouncedSearch) params.set('q', debouncedSearch);
        if (selectedStatus !== 'all') params.set('status', selectedStatus);
        if (selectedGroup !== 'all') params.set('group', selectedGroup);
        if (selectedBoard !== 'all') params.set('board', selectedBoard);
        if (sortBy !== 'name') params.set('sort', sortBy);
        if (viewMode !== 'grid') params.set('view', viewMode);
        setSearchParams(params, { replace: true });
    }, [debouncedSearch, selectedStatus, selectedGroup, selectedBoard, sortBy, viewMode, setSearchParams]);

    // ── Counts (always computed from ALL projects, not filtered) ──
    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = { all: projects.length };
        projects.forEach(p => {
            const key = p.Status.toString();
            counts[key] = (counts[key] || 0) + 1;
        });
        return counts;
    }, [projects]);

    const groupCounts = useMemo(() => {
        const counts: Record<string, number> = { all: projects.length };
        projects.forEach(p => {
            counts[p.GroupCode] = (counts[p.GroupCode] || 0) + 1;
        });
        return counts;
    }, [projects]);

    const boardCounts = useMemo(() => {
        const counts: Record<string, number> = { all: projects.length };
        projects.forEach(p => {
            if (p.ManagementBoard) {
                const key = p.ManagementBoard.toString();
                counts[key] = (counts[key] || 0) + 1;
            }
        });
        return counts;
    }, [projects]);

    // ── Filter Logic ──
    const filteredProjects = useMemo(() => {
        return projects.filter(p => {
            const matchesSearch = !debouncedSearch ||
                p.ProjectName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                p.ProjectID.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                (p.InvestorName && p.InvestorName.toLowerCase().includes(debouncedSearch.toLowerCase()));
            const matchesStatus = selectedStatus === 'all' || p.Status.toString() === selectedStatus;
            const matchesGroup = selectedGroup === 'all' || p.GroupCode === selectedGroup;
            const matchesBoard = selectedBoard === 'all' || (p.ManagementBoard && p.ManagementBoard.toString() === selectedBoard);
            return matchesSearch && matchesStatus && matchesGroup && matchesBoard;
        });
    }, [projects, debouncedSearch, selectedStatus, selectedGroup, selectedBoard]);

    // ── Sort Logic ──
    const sortedProjects = useMemo(() => {
        return [...filteredProjects].sort((a, b) => {
            switch (sortBy) {
                case 'budget': return (b.TotalInvestment || 0) - (a.TotalInvestment || 0);
                case 'progress': return (b.Progress || 0) - (a.Progress || 0);
                case 'created': return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
                case 'name': default: return a.ProjectName.localeCompare(b.ProjectName, 'vi');
            }
        });
    }, [filteredProjects, sortBy]);

    // ── Actions ──
    const hasActiveFilters = debouncedSearch !== '' || selectedStatus !== 'all' || selectedGroup !== 'all' || selectedBoard !== 'all';

    const clearFilters = useCallback(() => {
        setSearchQuery('');
        setSelectedStatus('all');
        setSelectedGroup('all');
        setSelectedBoard('all');
    }, []);

    return {
        searchQuery, setSearchQuery,
        selectedStatus, setSelectedStatus,
        selectedGroup, setSelectedGroup,
        selectedBoard, setSelectedBoard,
        sortBy, setSortBy,
        viewMode, setViewMode,
        filteredProjects, sortedProjects,
        statusCounts, groupCounts, boardCounts,
        clearFilters, hasActiveFilters,
    };
}
