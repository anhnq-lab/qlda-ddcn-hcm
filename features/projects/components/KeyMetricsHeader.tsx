import React from 'react';
import { TrendingUp, Wallet, Package } from 'lucide-react';
import { formatShortCurrency } from '@/utils/format';
import { StatCard } from '../../../components/ui';

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

    const CARD_COLORS: Record<number, "blue" | "amber" | "emerald" | "slate"> = {
        0: 'slate',
        1: 'amber',
        2: 'emerald',
    };

    const metrics = [
        {
            label: 'Tổng mức đầu tư',
            value: formatCurrency(totalInvestment),
            icon: <TrendingUp className="w-5 h-5" />,
        },
        {
            label: 'Đã giải ngân',
            value: formatCurrency(disbursedAmount),
            subValue: `${disbursementPercent}% tổng mức`,
            icon: <Wallet className="w-5 h-5" />,
        },
        {
            label: 'Tiến độ khối lượng',
            value: `${physicalProgress}%`,
            icon: <Package className="w-5 h-5" />,
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metrics.map((metric, idx) => {
                const color = CARD_COLORS[idx] || "blue";
                return (
                    <StatCard
                        key={idx}
                        label={metric.label}
                        value={metric.value}
                        icon={metric.icon}
                        color={color}
                        footer={
                            metric.subValue ? (
                                <div className="text-xs text-slate-500 font-medium truncate mt-1">
                                    {metric.subValue}
                                </div>
                            ) : undefined
                        }
                    />
                );
            })}
        </div>
    );
};
