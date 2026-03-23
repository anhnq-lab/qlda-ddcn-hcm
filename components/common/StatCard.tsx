import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export type StatCardColor = 'blue' | 'emerald' | 'amber' | 'rose' | 'violet' | 'cyan' | 'indigo' | 'orange' | 'purple';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color?: StatCardColor;
    /** e.g. "2 đang chạy" */
    sublabel?: string;
    trend?: 'up' | 'down';
    trendLabel?: string;
    className?: string;
    onClick?: () => void;
}

const COLOR_MAP: Record<StatCardColor, string> = {
    blue:    'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',
    emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400',
    amber:   'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400',
    rose:    'text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400',
    violet:  'text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400',
    cyan:    'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400',
    indigo:  'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400',
    orange:  'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400',
    purple:  'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400',
};

/**
 * Reusable Stat Card — compact layout matching Dashboard StatCard
 * Row 1: Label + trend indicator (top)
 * Row 2: Value (large) + Icon (small, right)
 * Row 3: Sublabel (optional)
 */
export const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    icon,
    color = 'blue',
    sublabel,
    trend,
    trendLabel,
    className = '',
    onClick,
}) => {
    const iconCls = COLOR_MAP[color] || COLOR_MAP.blue;

    return (
        <div
            className={`
                flex flex-col gap-2 p-4 rounded-2xl
                bg-white dark:bg-[#1a202c]
                border border-slate-200 dark:border-slate-800/80
                shadow-sm transition-all duration-200
                ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700' : ''}
                ${className}
            `}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
        >
            {/* Row 1: Label + Trend */}
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-none">
                    {label}
                </p>
                {trend && (
                    <div className={`flex items-center gap-0.5 text-[10px] font-bold ${trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {trend === 'up'
                            ? <TrendingUp className="w-3 h-3" />
                            : <TrendingDown className="w-3 h-3" />}
                        {trendLabel && (
                            <span className="text-slate-400 dark:text-slate-500 font-medium ml-0.5">{trendLabel}</span>
                        )}
                    </div>
                )}
            </div>

            {/* Row 2: Value + Icon */}
            <div className="flex items-center justify-between gap-2">
                <h4 className="text-xl lg:text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-none">
                    {value}
                </h4>
                <div className={`shrink-0 p-2 rounded-xl ${iconCls}`}>
                    {icon}
                </div>
            </div>

            {/* Row 3: Sublabel */}
            {sublabel && (
                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 leading-none">
                    {sublabel}
                </p>
            )}
        </div>
    );
};
