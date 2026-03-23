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

    const CARD_STYLES: Record<number, string> = {
        0: 'stat-card-blue',
        1: 'stat-card-amber',
        2: 'stat-card-emerald',
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
                        className={`stat-card ${s} cursor-default`}
                    >
                        <div className="flex items-center justify-between w-full relative z-10">
                            <div className="flex-1">
                                <p className="stat-card-label">
                                    {metric.label}
                                </p>
                                <p className="stat-card-value tabular-nums mt-1">
                                    {metric.value}
                                </p>
                                {metric.subValue && (
                                    <p className="text-xs text-slate-500 mt-1">
                                        {metric.subValue} tổng mức
                                    </p>
                                )}
                            </div>
                            <div className="stat-card-icon">
                                <metric.icon className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
