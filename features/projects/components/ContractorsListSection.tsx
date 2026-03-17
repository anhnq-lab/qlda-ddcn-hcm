import React from 'react';
import { Building2, HardHat, ExternalLink, CircleDollarSign, Package } from 'lucide-react';
import { Contractor, BiddingPackage } from '@/types';
import { formatShortCurrency } from '@/utils/format';

interface ContractorsListSectionProps {
    contractors: Contractor[];
    packages?: BiddingPackage[];
    onViewContractor?: (contractorId: string) => void;
    onViewPackage?: (packageId: string) => void;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    planning: { label: 'Trong kế hoạch', color: 'text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-600' },
    bidding: { label: 'Đang mời thầu', color: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30' },
    posted: { label: 'Đã đăng tải', color: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30' },
    evaluating: { label: 'Đang xét thầu', color: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30' },
    pending: { label: 'Chờ phê duyệt', color: 'text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/30' },
    approved: { label: 'Đã phê duyệt', color: 'text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-900/30' },
    awarded: { label: 'Đã trúng thầu', color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30' },
    completed: { label: 'Đã hoàn thành', color: 'text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/30' },
    cancelled: { label: 'Đã hủy', color: 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30' },
};

export const ContractorsListSection: React.FC<ContractorsListSectionProps> = ({
    contractors,
    packages = [],
    onViewContractor,
    onViewPackage
}) => {

    if (contractors.length === 0 && packages.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                    <HardHat className="w-6 h-6 text-gray-300 dark:text-slate-500" />
                </div>
                <p className="text-sm font-medium text-gray-400 dark:text-slate-500">Chưa có nhà thầu</p>
                <p className="text-[10px] text-gray-300 dark:text-slate-600 mt-0.5">Dữ liệu sẽ cập nhật khi có nhà thầu tham gia</p>
            </div>
        );
    }

    const formatCurrency = formatShortCurrency;

    const getStatusInfo = (status: string) => STATUS_LABELS[status.toLowerCase()] || { label: status, color: 'text-gray-500 bg-gray-100' };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide flex items-center gap-2">
                    <HardHat className="w-4 h-4" />
                    Nhà thầu ({contractors.length > 0 ? contractors.length : packages.length})
                </h3>
            </div>

            {/* Contractors from contracts table */}
            {contractors.length > 0 && (
                <div className="space-y-2">
                    {contractors.map((contractor) => (
                        <div
                            key={contractor.ContractorID}
                            className="flex items-center gap-3 p-3 bg-amber-50/50 dark:bg-amber-900/15 rounded-lg border border-amber-100 dark:border-amber-800/50 hover:bg-amber-100/50 dark:hover:bg-amber-900/25 transition-colors cursor-pointer group"
                            onClick={() => onViewContractor?.(contractor.ContractorID)}
                        >
                            <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                                <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">
                                    {contractor.FullName}
                                </p>
                                {contractor.TaxCode && (
                                    <p className="text-[10px] text-gray-500 dark:text-slate-400 truncate">
                                        MST: {contractor.TaxCode}
                                    </p>
                                )}
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    ))}
                </div>
            )}

            {/* Bidding Packages (shown when no contractors, or as secondary section) */}
            {contractors.length === 0 && packages.length > 0 && (
                <div className="space-y-2">
                    {packages.slice(0, 5).map((pkg) => {
                        const hasWinner = pkg.WinningContractorID || pkg.Status?.toLowerCase() === 'awarded';
                        const statusInfo = getStatusInfo(pkg.Status);

                        return (
                            <div
                                key={pkg.PackageID}
                                className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors cursor-pointer group ${hasWinner
                                    ? 'bg-emerald-50/50 dark:bg-emerald-900/15 border-emerald-100 dark:border-emerald-800/50 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/25'
                                    : 'bg-gray-50 dark:bg-slate-700/30 border-gray-200 dark:border-slate-600/50 hover:bg-gray-100 dark:hover:bg-slate-700/50'
                                    }`}
                                onClick={() => onViewPackage?.(pkg.PackageID)}
                            >
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${hasWinner
                                    ? 'bg-emerald-100 dark:bg-emerald-900/40'
                                    : 'bg-gray-100 dark:bg-slate-600'
                                    }`}>
                                    {hasWinner
                                        ? <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        : <Package className="w-4 h-4 text-gray-400 dark:text-slate-400" />
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-semibold text-gray-800 dark:text-slate-200 truncate leading-tight">
                                        {pkg.WinningContractorID || pkg.PackageName}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${statusInfo.color}`}>
                                            {statusInfo.label}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-600 dark:text-slate-300">
                                        <CircleDollarSign className="w-3 h-3" />
                                        {formatCurrency(pkg.Price)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {packages.length > 5 && (
                        <button className="w-full text-center text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline py-1">
                            Xem tất cả {packages.length} gói thầu →
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
