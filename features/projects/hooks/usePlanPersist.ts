import { useState, useEffect } from 'react';
import { TaskFilter } from '../components/TaskFilterBar';
import { TaskViewMode } from '../components/TaskFilterBar';

const STORAGE_KEY = 'qlda-plan-preferences';

interface PlanPreferences {
    view: TaskViewMode;
    filter: TaskFilter;
}

/**
 * Hook persist view mode và filter sang localStorage.
 * User không cần chọn lại mỗi lần vào tab.
 */
export function usePlanPersist(projectID?: string) {
    const key = `${STORAGE_KEY}-${projectID || 'default'}`;

    const [preferences, setPreferences] = useState<PlanPreferences>(() => {
        try {
            const saved = localStorage.getItem(key);
            if (saved) return JSON.parse(saved);
        } catch {}
        return { view: 'wbs', filter: 'all' };
    });

    // Persist on change
    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(preferences));
        } catch {}
    }, [preferences, key]);

    const setView = (view: TaskViewMode) => setPreferences(p => ({ ...p, view }));
    const setFilter = (filter: TaskFilter) => setPreferences(p => ({ ...p, filter }));

    return {
        currentView: preferences.view,
        currentFilter: preferences.filter,
        setView,
        setFilter,
    };
}
