import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export type StatCardColor = 'blue' | 'emerald' | 'amber' | 'rose' | 'violet';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color?: StatCardColor;
    /** e.g. "+12%" or "2 đang chạy" */
    sublabel?: string;
    trend?: 'up' | 'down';
    className?: string;
    onClick?: () => void;
}

const STYLE_MAP: Record<StatCardColor, { bg: string; border: string }> = {
    blue: { bg: 'linear-gradient(135deg, #404040 0%, #333333 100%)', border: '#8A8A8A' },    // Charcoal
    emerald: { bg: 'linear-gradient(135deg, #4A4535 0%, #3D3A2D 100%)', border: '#A89050' },    // Warm charcoal
    amber: { bg: 'linear-gradient(135deg, #5A4F35 0%, #4A4230 100%)', border: '#C4A035' },    // Gold-brown
    rose: { bg: 'linear-gradient(135deg, #6B5A30 0%, #5A4A25 100%)', border: '#D4A017' },    // Rich gold
    violet: { bg: 'linear-gradient(135deg, #504838 0%, #433D2E 100%)', border: '#B09040' },    // Muted gold
};

/**
 * Reusable Stat Card — charcoal-gold design (Ban DDCN theme).
 */
export const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    icon,
    color = 'blue',
    sublabel,
    trend,
    className = '',
    onClick,
}) => {
    const style = STYLE_MAP[color] || STYLE_MAP.blue;

    return (
        <div
            className={`relative overflow-hidden rounded-2xl text-white p-5 shadow-xl transition-transform hover:scale-[1.02] hover:shadow-2xl duration-300 flex items-center gap-4 ${onClick ? 'cursor-pointer' : ''} ${className}`}
            style={{
                background: style.bg,
                borderTop: `3px solid ${style.border}`,
                boxShadow: '0 4px 14px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
        >
            {/* Icon */}
            <div className="p-3 rounded-xl bg-white/20 shadow-sm shrink-0">
                {icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-extrabold text-white/90 uppercase tracking-[0.15em]">{label}</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-black text-white drop-shadow-sm">{value}</span>
                    {sublabel && (
                        <span className="text-[10px] text-white/70 truncate font-medium">
                            {sublabel}
                        </span>
                    )}
                </div>
            </div>

            {/* Trend indicator */}
            {trend && (
                <div className={`p-1.5 rounded-lg bg-white/20 shrink-0`}>
                    {trend === 'up'
                        ? <TrendingUp className="w-4 h-4 text-white" />
                        : <TrendingDown className="w-4 h-4 text-white" />
                    }
                </div>
            )}
        </div>
    );
};
