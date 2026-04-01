import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Clock, Zap, CheckCircle2 } from 'lucide-react';

import { supabase } from '@/lib/supabase';

export type DateRangeMode = 'range' | 'duration';

export interface PlanDateRange {
    startDate: string; // ISO date string "YYYY-MM-DD"
    endDate: string;   // ISO date string "YYYY-MM-DD"
    totalDays: number;
}

interface PlanDateRangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (range: PlanDateRange, workflowId?: string) => void;
    title: string;
    description?: string;
    defaultStartDate?: string;
    isLoading?: boolean;
    showWorkflowOption?: boolean;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** ISO "YYYY-MM-DD" → display "DD/MM/YYYY" */
const isoToDisplay = (iso: string): string => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    if (!y || !m || !d) return iso;
    return `${d}/${m}/${y}`;
};

/** Display "DD/MM/YYYY" → ISO "YYYY-MM-DD" (returns '' if invalid) */
const displayToIso = (val: string): string => {
    const cleaned = val.replace(/[^\d/]/g, '').trim();
    // Accept dd/mm/yyyy or dd-mm-yyyy
    const parts = cleaned.split(/[\/\-]/);
    if (parts.length === 3) {
        const [d, m, y] = parts;
        if (d.length <= 2 && m.length <= 2 && y.length === 4) {
            const dd = d.padStart(2, '0');
            const mm = m.padStart(2, '0');
            const iso = `${y}-${mm}-${dd}`;
            // Validate date
            const date = new Date(iso);
            if (!isNaN(date.getTime()) && date.toISOString().startsWith(iso)) {
                return iso;
            }
        }
    }
    return '';
};

/** Auto-insert slashes as user types: "27" → "27/", "2703" → "27/03/" */
const autoFormatInput = (raw: string, prev: string): string => {
    // Only forward-format (not when deleting)
    if (raw.length < prev.length) return raw;
    const digits = raw.replace(/\D/g, '');
    let out = '';
    if (digits.length >= 1) out = digits.slice(0, 2);
    if (digits.length >= 3) out += '/' + digits.slice(2, 4);
    if (digits.length >= 5) out += '/' + digits.slice(4, 8);
    return out;
};

// ── DateInput Component ───────────────────────────────────────────────────────

interface DateInputProps {
    label: string;
    required?: boolean;
    isoValue: string;
    onChange: (iso: string) => void;
    minIso?: string;
    colorClass?: string; // ring color class e.g. "focus:ring-emerald-300"
}

const DateInput: React.FC<DateInputProps> = ({
    label, required, isoValue, onChange, minIso, colorClass = 'focus:ring-emerald-300 dark:focus:ring-emerald-700',
}) => {
    const [text, setText] = useState(isoToDisplay(isoValue));
    const [isValid, setIsValid] = useState(true);
    const pickerRef = useRef<HTMLInputElement>(null);

    // Sync display text when ISO value changes externally
    useEffect(() => {
        const display = isoToDisplay(isoValue);
        // Only update if not currently focused to avoid cursor jump
        if (document.activeElement !== pickerRef.current) {
            setText(display);
        }
        setIsValid(true);
    }, [isoValue]);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = autoFormatInput(e.target.value, text);
        setText(formatted);
        const iso = displayToIso(formatted);
        if (iso) {
            setIsValid(true);
            onChange(iso);
        } else {
            setIsValid(formatted.length === 0 || formatted.length < 10);
        }
    };

    const handleTextBlur = () => {
        const iso = displayToIso(text);
        if (iso) {
            setText(isoToDisplay(iso));
            setIsValid(true);
            onChange(iso);
        } else if (text.length > 0) {
            setIsValid(false);
        }
    };

    const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const iso = e.target.value; // Already "YYYY-MM-DD"
        if (iso) {
            setText(isoToDisplay(iso));
            setIsValid(true);
            onChange(iso);
        }
    };

    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative flex items-center">
                <input
                    type="text"
                    value={text}
                    onChange={handleTextChange}
                    onBlur={handleTextBlur}
                    placeholder="DD/MM/YYYY"
                    maxLength={10}
                    className={`w-full pl-3 pr-10 py-2.5 text-sm border rounded-xl bg-[#FCF9F2] dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 transition-shadow ${
                        !isValid
                            ? 'border-red-400 focus:ring-red-300 dark:focus:ring-red-700'
                            : `border-gray-300 dark:border-slate-600 ${colorClass}`
                    }`}
                />
                {/* Calendar icon triggers the hidden native date picker */}
                <button
                    type="button"
                    onClick={() => pickerRef.current?.showPicker?.()}
                    className="absolute right-2.5 p-0.5 text-gray-400 hover:text-emerald-500 transition-colors"
                    title="Mở lịch chọn ngày"
                >
                    <Calendar className="w-4 h-4" />
                </button>
                {/* Hidden native date picker — only for calendar UI, actual value shown in text */}
                <input
                    ref={pickerRef}
                    type="date"
                    value={isoValue}
                    min={minIso}
                    onChange={handlePickerChange}
                    className="sr-only"
                    tabIndex={-1}
                    aria-hidden="true"
                />
            </div>
            {!isValid && (
                <p className="text-[10px] text-red-500">Định dạng: DD/MM/YYYY (ví dụ: 01/08/2025)</p>
            )}
        </div>
    );
};

// ── Main Modal ────────────────────────────────────────────────────────────────

export const PlanDateRangeModal: React.FC<PlanDateRangeModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    defaultStartDate,
    isLoading = false,
    showWorkflowOption = false,
}) => {
    const [mode, setMode] = useState<DateRangeMode>('range');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [durationDays, setDurationDays] = useState<number>(365);
    const [error, setError] = useState('');
    const [workflows, setWorkflows] = useState<any[]>([]);
    const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('');

    // Fetch workflows when modal opens
    useEffect(() => {
        if (!isOpen || !showWorkflowOption) return;
        const fetchWorkflows = async () => {
            const { data, error } = await supabase
                .from('workflows')
                .select('id, name')
                .eq('is_active', true)
                .eq('category', 'project')
                .order('created_at', { ascending: false });
            
            if (data && !error) {
                setWorkflows(data);
                if (data.length > 0) setSelectedWorkflowId(data[0].id);
            }
        };
        fetchWorkflows();
    }, [isOpen, showWorkflowOption]);

    // Initialize default dates when modal opens
    useEffect(() => {
        if (!isOpen) return;
        const today = defaultStartDate || new Date().toISOString().split('T')[0];
        setStartDate(today);
        const defaultEnd = new Date(today);
        defaultEnd.setMonth(defaultEnd.getMonth() + 12);
        setEndDate(defaultEnd.toISOString().split('T')[0]);
        setDurationDays(365);
        setError('');
    }, [isOpen, defaultStartDate]);

    // Auto-recalculate end date from duration
    useEffect(() => {
        if (mode === 'duration' && startDate && durationDays > 0) {
            const end = new Date(startDate);
            end.setDate(end.getDate() + durationDays);
            setEndDate(end.toISOString().split('T')[0]);
        }
    }, [mode, startDate, durationDays]);

    // Auto-recalculate duration from end date
    useEffect(() => {
        if (mode === 'range' && startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diff = Math.round((end.getTime() - start.getTime()) / 86400000);
            if (diff > 0) setDurationDays(diff);
        }
    }, [mode, startDate, endDate]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        setError('');
        if (!startDate) { setError('Vui lòng nhập ngày bắt đầu'); return; }
        if (!endDate) { setError('Vui lòng nhập ngày kết thúc'); return; }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const totalDays = Math.round((end.getTime() - start.getTime()) / 86400000);

        if (totalDays <= 0) {
            setError('Ngày kết thúc phải sau ngày bắt đầu');
            return;
        }

        if (showWorkflowOption && !selectedWorkflowId) {
            setError('Vui lòng chọn quy trình dự án');
            return;
        }

        onConfirm({ startDate, endDate, totalDays }, showWorkflowOption ? selectedWorkflowId : undefined);
    };

    const presets = [
        { label: '6 tháng', days: 180 },
        { label: '1 năm', days: 365 },
        { label: '2 năm', days: 730 },
        { label: '3 năm', days: 1095 },
        { label: '5 năm', days: 1825 },
    ];

    const applyPreset = (days: number) => {
        setDurationDays(days);
        if (startDate) {
            const end = new Date(startDate);
            end.setDate(end.getDate() + days);
            setEndDate(end.toISOString().split('T')[0]);
        }
    };

    const fmt = (iso: string) => {
        if (!iso) return '';
        return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-[#FCF9F2] dark:bg-slate-800 rounded-2xl shadow-sm w-full max-w-md border border-gray-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-200 dark:border-emerald-700 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-slate-100 text-sm leading-tight">{title}</h3>
                            {description && (
                                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{description}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-5">
                    {/* Mode Toggle */}
                    <div className="flex rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden bg-gray-50 dark:bg-slate-900 p-1 gap-1">
                        <button
                            onClick={() => setMode('range')}
                            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${mode === 'range'
                                ? 'bg-[#FCF9F2] dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm border border-emerald-200 dark:border-emerald-700'
                                : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                            }`}
                        >
                            <Calendar className="w-3.5 h-3.5" />
                            Ngày bắt đầu &amp; kết thúc
                        </button>
                        <button
                            onClick={() => setMode('duration')}
                            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${mode === 'duration'
                                ? 'bg-[#FCF9F2] dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-sm border border-blue-200 dark:border-blue-700'
                                : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                            }`}
                        >
                            <Clock className="w-3.5 h-3.5" />
                            Ngày bắt đầu &amp; thời gian
                        </button>
                    </div>

                    {/* Start Date — always shown */}
                    <DateInput
                        label="Ngày bắt đầu"
                        required
                        isoValue={startDate}
                        onChange={setStartDate}
                        colorClass="focus:ring-emerald-300 dark:focus:ring-emerald-700"
                    />

                    {/* Workflow Template Selection */}
                    {showWorkflowOption && (
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                                Quy trình dự án <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedWorkflowId}
                                onChange={(e) => setSelectedWorkflowId(e.target.value)}
                                className="w-full pl-3 pr-10 py-2.5 text-sm border border-gray-300 dark:border-slate-600 rounded-xl bg-[#FCF9F2] dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:focus:ring-emerald-700 transition-shadow appearance-none cursor-pointer"
                            >
                                <option value="" disabled>-- Chọn quy trình --</option>
                                {workflows.map(wf => (
                                    <option key={wf.id} value={wf.id}>{wf.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Conditional: End Date or Duration */}
                    {mode === 'range' ? (
                        <DateInput
                            label="Ngày kết thúc"
                            required
                            isoValue={endDate}
                            onChange={setEndDate}
                            minIso={startDate}
                            colorClass="focus:ring-emerald-300 dark:focus:ring-emerald-700"
                        />
                    ) : (
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                                Thời gian thực hiện (ngày) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={durationDays}
                                min={1}
                                max={3650}
                                onChange={e => setDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-slate-600 rounded-xl bg-[#FCF9F2] dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700 transition-shadow"
                            />
                            {/* Preset buttons */}
                            <div className="flex gap-1.5 flex-wrap">
                                {presets.map(p => (
                                    <button
                                        key={p.days}
                                        onClick={() => applyPreset(p.days)}
                                        className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg border transition-all ${durationDays === p.days
                                            ? 'bg-blue-500 text-white border-blue-500'
                                            : 'bg-[#FCF9F2] dark:bg-slate-700 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-600 hover:border-blue-300 hover:text-blue-600'
                                        }`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Summary Preview */}
                    {startDate && endDate && new Date(endDate) > new Date(startDate) && (
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3">
                            <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                <div>
                                    <span className="font-semibold">Hệ thống sẽ phân bổ công việc từ </span>
                                    <span className="font-bold">{fmt(startDate)}</span>
                                    <span className="font-semibold"> đến </span>
                                    <span className="font-bold">{fmt(endDate)}</span>
                                    <span className="font-semibold"> (~{durationDays} ngày)</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                            ⚠️ {error}
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-all shadow-sm disabled:opacity-60 disabled:cursor-wait"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                Đang tạo...
                            </>
                        ) : (
                            <>
                                <Zap className="w-4 h-4" />
                                Tạo kế hoạch tự động
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
