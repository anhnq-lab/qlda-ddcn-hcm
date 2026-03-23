import React, { useState, useEffect } from 'react';
import { X, CalendarRange, Save } from 'lucide-react';
import { DisbursementPlanItem } from '../../../services/CapitalService';
import { formatCurrency } from '../../../utils/format';

interface MonthEntry {
    id?: string;
    month: number;
    plannedAmount: string; // Keep as string, we will store raw digits here
    actualAmount: string;   // Keep as string
    notes: string;
}

interface DisbursementPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (year: number, plans: { id?: string, month: number, plannedAmount: number, actualAmount: number, notes: string }[]) => void;
    projectID: string;
    defaultYear: number;
    allPlans: DisbursementPlanItem[];
    annualLimit: number;
    isSaving?: boolean;
}

export const DisbursementPlanModal: React.FC<DisbursementPlanModalProps> = ({
    isOpen, onClose, onSave, projectID, defaultYear, allPlans, annualLimit, isSaving
}) => {
    const [year, setYear] = useState(defaultYear);
    const [entries, setEntries] = useState<MonthEntry[]>([]);

    const loadPlansForYear = (y: number) => {
        const initial: MonthEntry[] = [];
        for (let m = 1; m <= 12; m++) {
            const existing = allPlans.find(p => p.Year === y && p.Month === m);
            initial.push({
                id: existing?.Id,
                month: m,
                plannedAmount: existing?.PlannedAmount ? String(existing.PlannedAmount) : '',
                actualAmount: existing?.ActualAmount ? String(existing.ActualAmount) : '',
                notes: existing?.Notes || ''
            });
        }
        setEntries(initial);
    };

    useEffect(() => {
        if (isOpen) {
            setYear(defaultYear);
            loadPlansForYear(defaultYear);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const handleYearChange = (newYear: number) => {
        setYear(newYear);
        loadPlansForYear(newYear);
    };

    const handleChange = (month: number, field: keyof MonthEntry, value: string) => {
        if (field === 'plannedAmount') {
            // Remove non-digit characters for raw storage
            const rawValue = value.replace(/\D/g, '');
            setEntries(prev => prev.map(e => e.month === month ? { ...e, [field]: rawValue } : e));
        } else {
            setEntries(prev => prev.map(e => e.month === month ? { ...e, [field]: value } : e));
        }
    };

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const plansToSave = entries.map(e => ({
            id: e.id,
            month: e.month,
            plannedAmount: Number(e.plannedAmount) || 0,
            actualAmount: Number(e.actualAmount) || 0,
            notes: e.notes || ''
        }));

        onSave(year, plansToSave);
    };

    const totalPlanned = entries.reduce((acc, curr) => acc + (Number(curr.plannedAmount) || 0), 0);
    const totalActual = entries.reduce((acc, curr) => acc + (Number(curr.actualAmount) || 0), 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl mx-4 border border-gray-200 dark:border-slate-700 animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                            <CalendarRange className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100 flex items-center gap-3">
                                Lập kế hoạch 12 tháng
                                {annualLimit > 0 && (
                                    <span className="text-xs font-medium px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-800">
                                        Vốn giao năm: {formatCurrency(annualLimit)}
                                    </span>
                                )}
                            </h2>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-6 shrink-0 border-b border-gray-100 dark:border-slate-700/50">
                        <div className="w-48">
                            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">
                                Kế hoạch Năm <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={year}
                                onChange={e => handleYearChange(Number(e.target.value))}
                                min={2020} max={2035}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 text-gray-800 dark:text-slate-100 text-sm font-bold focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 dark:text-slate-400 rounded-lg border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="py-3 px-4 rounded-tl-lg rounded-bl-lg w-24">Tháng</th>
                                    <th className="py-3 px-4 w-1/4">Kế hoạch (VNĐ)</th>
                                    <th className="py-3 px-4 w-1/4">Thực tế (VNĐ)</th>
                                    <th className="py-3 px-4 rounded-tr-lg rounded-br-lg">Ghi chú</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map(e => (
                                    <tr key={e.month} className="border-b border-gray-100 dark:border-slate-700/50 last:border-0 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="py-2.5 px-4 font-medium text-gray-700 dark:text-slate-300">
                                            Tháng {e.month}
                                        </td>
                                        <td className="py-2.5 px-4">
                                            <input
                                                type="text"
                                                value={e.plannedAmount ? Number(e.plannedAmount).toLocaleString('vi-VN') : ''}
                                                onChange={ev => handleChange(e.month, 'plannedAmount', ev.target.value)}
                                                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 text-sm font-mono focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
                                                placeholder="0"
                                            />
                                        </td>
                                        <td className="py-2.5 px-4">
                                            <span className="text-emerald-700 dark:text-emerald-400 font-mono font-medium block w-full px-3 py-1.5 bg-gray-50/50 dark:bg-slate-700/30 rounded-lg border border-transparent">
                                                {formatCurrency(Number(e.actualAmount) || 0)}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-4">
                                            <input
                                                type="text"
                                                value={e.notes}
                                                onChange={ev => handleChange(e.month, 'notes', ev.target.value)}
                                                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
                                                placeholder="Ghi chú..."
                                            />
                                        </td>
                                    </tr>
                                ))}
                                {/* Tổng cộng footer */}
                                <tr className="bg-gray-50 dark:bg-slate-700/30 font-bold border-t border-gray-200 dark:border-slate-600">
                                    <td className="py-3 px-4 text-gray-800 dark:text-slate-200">Tổng cộng</td>
                                    <td className="py-3 px-4 text-violet-700 dark:text-violet-400 font-mono">
                                        {formatCurrency(totalPlanned)}
                                    </td>
                                    <td className="py-3 px-4 text-emerald-700 dark:text-emerald-400 font-mono">
                                        {formatCurrency(totalActual)}
                                    </td>
                                    <td className="py-3 px-4"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 dark:border-slate-700 shrink-0 bg-gray-50 dark:bg-slate-800/80 rounded-b-2xl">
                        <div>
                            {totalPlanned > annualLimit && (
                                <p className="text-red-500 font-medium tracking-tight text-sm bg-red-50 dark:bg-red-900/20 px-3 py-1.5 border border-red-200 dark:border-red-800/50 rounded-lg shadow-sm">
                                    ⚠️ Tổng kế hoạch ({formatCurrency(totalPlanned)}) đang vượt quá Vốn giao ({formatCurrency(annualLimit)})!
                                </p>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-slate-400 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving || totalPlanned > annualLimit}
                                className="px-5 py-2 text-sm font-bold text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm"
                            >
                                <Save className="w-4 h-4" />
                                {isSaving ? 'Đang lưu...' : 'Lưu kế hoạch'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
