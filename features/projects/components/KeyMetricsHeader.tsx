import React from 'react';
import { TrendingUp, Wallet, Package } from 'lucide-react';
import { formatShortCurrency } from '@/utils/format';

interface KeyMetricsHeaderProps {
    totalInvestment: number;
    disbursedAmount: number;
    physicalProgress: number;
}

export const KeyMetricsHeader: React.FC<KeyMetricsHeaderProps> = ({
    totalInvestment,
    disbursedAmount,
    physicalProgress
}) => {
    const formatCurrency = formatShortCurrency;

    const disbursementPercent = totalInvestment > 0
        ? ((disbursedAmount / totalInvestment) * 100).toFixed(1)
        : '0';

    const CARD_STYLES: Record<number, { bg: string; border: string }> = {
        0: { bg: 'linear-gradient(135deg, #404040 0%, #333333 100%)', border: '#8A8A8A' },
        1: { bg: 'linear-gradient(135deg, #4A4535 0%, #3D3A2D 100%)', border: '#A89050' },
        2: { bg: 'linear-gradient(135deg, #5A4F35 0%, #4A4230 100%)', border: '#C4A035' },
    };

    const metrics = [
        {
            label: 'Tổng mức đầu tư',
            value: formatCurrency(totalInvestment),
            icon: TrendingUp,
        },
        {
            label: 'Đã giải ngân',
            value: formatCurrency(disbursedAmount),
            subValue: `${disbursementPercent}%`,
            icon: Wallet,
        },
        {
            label: 'Tiến độ khối lượng',
            value: `${physicalProgress}%`,
            icon: Package,
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metrics.map((metric, idx) => {
                const s = CARD_STYLES[idx] || CARD_STYLES[0];
                return (
                    <div
                        key={idx}
                        className="relative overflow-hidden rounded-2xl p-5 shadow-xl text-white hover:scale-[1.02] hover:shadow-2xl transition-all duration-200 cursor-default"
                        style={{ background: s.bg, borderTop: `3px solid ${s.border}`, boxShadow: '0 4px 14px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)' }}
                    >
                        {/* Icon watermark */}
                        <metric.icon className="absolute -right-3 -top-3 w-20 h-20 text-white opacity-[0.12]" />
                        <div className="relative z-10 flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-white/90 mb-1">
                                    {metric.label}
                                </p>
                                <p className="text-2xl font-black tracking-tight text-white drop-shadow-sm tabular-nums">
                                    {metric.value}
                                </p>
                                {metric.subValue && (
                                    <p className="text-sm text-white/80 mt-1">
                                        {metric.subValue} tổng mức
                                    </p>
                                )}
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <metric.icon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
