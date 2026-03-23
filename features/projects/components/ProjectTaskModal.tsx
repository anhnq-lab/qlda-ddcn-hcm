import React, { useState, useEffect, useCallback } from 'react';
import { X, Calendar, User, AlignLeft, CheckSquare, Clock, Flag, Link2, BarChart3 } from 'lucide-react';
import { Task, TaskStatus, TaskPriority, TaskDependency, Employee } from '@/types';
import { useEmployees } from '@/hooks/useEmployees';
import { ProgressSlider } from './ProgressSlider';
import { TaskDependencyManager } from './TaskDependencyManager';

// ── Date helpers ──
const todayISO = () => new Date().toISOString();
const toYMD = (iso?: string | null): string => {
    if (!iso) return '';
    try { const d = new Date(iso); return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0]; }
    catch { return ''; }
};
const toDMY = (iso?: string | null): string => {
    if (!iso) return '';
    try {
        const d = new Date(iso);
        if (isNaN(d.getTime())) return '';
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        return `${dd}/${mm}/${d.getFullYear()}`;
    } catch { return ''; }
};

// ── DateInputVN: hiển thị dd/mm/yyyy trực tiếp, native calendar popup ──
const DateInputVN: React.FC<{
    value?: string | null;
    onChange: (iso: string) => void;
    borderClass?: string;
}> = ({ value, onChange, borderClass = 'border-gray-300' }) => {
    const ref = React.useRef<HTMLInputElement>(null);
    return (
        <div
            className={`relative flex items-center w-full rounded-lg border bg-white dark:bg-slate-900 cursor-pointer ${borderClass}`}
            onClick={() => ref.current?.showPicker?.()}
        >
            <Calendar className="w-4 h-4 text-gray-400 dark:text-slate-500 ml-3 shrink-0 pointer-events-none" />
            {/* Visible text dd/mm/yyyy */}
            <span className={`flex-1 pl-2 py-2.5 text-sm select-none ${value ? 'text-gray-800 dark:text-slate-100' : 'text-gray-400 dark:text-slate-500'}`}>
                {value ? toDMY(value) : 'dd/mm/yyyy'}
            </span>
            {/* Hidden native date input - still clickable for calendar popup */}
            <input
                ref={ref}
                type="date"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                value={toYMD(value)}
                onChange={e => onChange(e.target.value ? new Date(e.target.value).toISOString() : '')}
            />
        </div>
    );
};

interface ProjectTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (task: Partial<Task>) => void;
    initialData?: Partial<Task>;
    stepName?: string;
    stepCode?: string;
    allTasks?: Task[];
}

export const ProjectTaskModal: React.FC<ProjectTaskModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    stepName,
    stepCode,
    allTasks = []
}) => {
    const { data: employees = [] } = useEmployees();
    const [formData, setFormData] = useState<Partial<Task>>({
        Title: '',
        Description: '',
        Status: TaskStatus.Todo,
        Priority: TaskPriority.Medium,
        StartDate: '',
        DueDate: '',
        AssigneeID: '',
        ProgressPercent: 0,
        Dependencies: [],
        ...initialData
    });

    const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');

    useEffect(() => {
        if (isOpen) {
            setFormData({
                Title: '',
                Description: '',
                Status: TaskStatus.Todo,
                Priority: TaskPriority.Medium,
                StartDate: '',
                DueDate: '',
                AssigneeID: '',
                ProgressPercent: 0,
                Dependencies: [],
                ...initialData
            });
            setActiveTab('basic');
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            TimelineStep: stepCode || formData.TimelineStep
        });
        onClose();
    };

    const handleDependencyUpdate = (dependencies: TaskDependency[]) => {
        setFormData({ ...formData, Dependencies: dependencies });
    };

    const getPriorityColor = (priority: TaskPriority) => {
        switch (priority) {
            case 'High':
            case 'Urgent':
                return 'border-red-500 bg-red-50 dark:bg-red-900/20';
            case 'Medium':
                return 'border-amber-500 bg-amber-50 dark:bg-amber-900/20';
            case 'Low':
                return 'border-green-500 bg-green-50 dark:bg-green-900/20';
            default:
                return 'border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col border border-gray-200 dark:border-slate-700">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800 shrink-0">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-slate-50">
                            {initialData?.TaskID ? 'Cập nhật công việc' : 'Thêm công việc mới'}
                        </h3>
                        {stepName && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5 uppercase tracking-wide">
                                Thuộc bước: {stepName}
                            </p>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full text-gray-500 dark:text-slate-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-slate-700 px-6 shrink-0">
                    <button
                        type="button"
                        onClick={() => setActiveTab('basic')}
                        className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === 'basic'
                            ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                            : 'text-gray-500 dark:text-slate-400 border-transparent hover:text-gray-700 dark:hover:text-slate-300'
                            }`}
                    >
                        Thông tin cơ bản
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('advanced')}
                        className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === 'advanced'
                            ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                            : 'text-gray-500 dark:text-slate-400 border-transparent hover:text-gray-700 dark:hover:text-slate-300'
                            }`}
                    >
                        Nâng cao
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-5">

                        {activeTab === 'basic' && (
                            <>
                                {/* Title */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-2">
                                        <CheckSquare className="w-4 h-4 text-gray-400 dark:text-slate-500" /> Tên công việc <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="VD: Lập tờ trình thẩm định..."
                                        value={formData.Title}
                                        onChange={e => setFormData({ ...formData, Title: e.target.value })}
                                    />
                                </div>

                                {/* Date Range */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-gray-400 dark:text-slate-500" /> Ngày bắt đầu
                                        </label>
                                        <DateInputVN
                                            value={formData.StartDate}
                                            onChange={v => setFormData({ ...formData, StartDate: v })}
                                            borderClass="border-gray-300 dark:border-slate-600 focus-within:ring-2 focus-within:ring-blue-500"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-gray-400 dark:text-slate-500" /> Hạn hoàn thành
                                        </label>
                                        <DateInputVN
                                            value={formData.DueDate}
                                            onChange={v => setFormData({ ...formData, DueDate: v })}
                                            borderClass="border-gray-300 dark:border-slate-600 focus-within:ring-2 focus-within:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Actual Start/End Dates */}
                                <div className={`grid grid-cols-2 gap-4 p-3 rounded-lg border ${(formData.ActualStartDate || formData.ActualEndDate)
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700'
                                    : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700'}`}
                                >
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> Ngày bắt đầu thực tế
                                            {formData.ActualStartDate && (
                                                <span className="text-[9px] bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-300 px-1.5 py-0.5 rounded-full font-bold">Tự động</span>
                                            )}
                                        </label>
                                        <DateInputVN
                                            value={formData.ActualStartDate}
                                            onChange={v => setFormData({ ...formData, ActualStartDate: v })}
                                            borderClass="border-emerald-300 dark:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-500"
                                        />
                                        <p className="text-[10px] text-gray-400 dark:text-slate-500 italic">Tự động điền khi bắt đầu thực hiện</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                                            <CheckSquare className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> Ngày hoàn thành thực tế
                                            {formData.ActualEndDate && (
                                                <span className="text-[9px] bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-300 px-1.5 py-0.5 rounded-full font-bold">Tự động</span>
                                            )}
                                        </label>
                                        <DateInputVN
                                            value={formData.ActualEndDate}
                                            onChange={v => setFormData({ ...formData, ActualEndDate: v })}
                                            borderClass="border-emerald-300 dark:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-500"
                                        />
                                        <p className="text-[10px] text-gray-400 dark:text-slate-500 italic">Tự động điền khi trạng thái = Hoàn thành</p>
                                    </div>
                                </div>

                                {/* Progress */}
                                <div className="space-y-1.5">
                                    <ProgressSlider
                                        value={formData.ProgressPercent || 0}
                                        onChange={(value) => {
                                            // Auto-derive status from progress
                                            let newStatus = formData.Status;
                                            if (value === 100) newStatus = TaskStatus.Review;
                                            else if (value >= 1) newStatus = TaskStatus.InProgress;
                                            else newStatus = TaskStatus.Todo;

                                            // ── AUTO-FILL actual dates ──
                                            const updates: Partial<Task> = {
                                                ...formData,
                                                ProgressPercent: value,
                                                Status: newStatus,
                                            };
                                            // Auto-set ActualStartDate khi lần đầu có progress > 0
                                            if (value > 0 && !formData.ActualStartDate) {
                                                updates.ActualStartDate = todayISO();
                                            }
                                            // Reset ActualStartDate khi về 0%
                                            if (value === 0) {
                                                updates.ActualStartDate = '';
                                                updates.ActualEndDate = '';
                                            }
                                            setFormData(updates);
                                        }}
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-2">
                                        <AlignLeft className="w-4 h-4 text-gray-400 dark:text-slate-500" /> Diễn giải chi tiết
                                    </label>
                                    <textarea
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none"
                                        placeholder="Nhập ghi chú, yêu cầu kỹ thuật..."
                                        value={formData.Description}
                                        onChange={e => setFormData({ ...formData, Description: e.target.value })}
                                    />
                                </div>

                                {/* Assignee, Status, Priority */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-400 dark:text-slate-500" /> Người thực hiện
                                        </label>
                                        <select
                                            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-50 text-sm"
                                            value={formData.AssigneeID || ''}
                                            onChange={e => setFormData({ ...formData, AssigneeID: e.target.value })}
                                        >
                                            <option value="">-- Chọn --</option>
                                            {employees.map(emp => (
                                                <option key={emp.EmployeeID} value={emp.EmployeeID}>
                                                    {emp.FullName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Trạng thái</label>
                                        <select
                                            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-50 text-sm"
                                            value={formData.Status}
                                            onChange={e => {
                                                const newStatus = e.target.value as TaskStatus;
                                                let newProgress = formData.ProgressPercent || 0;
                                                if (newStatus === TaskStatus.Done) newProgress = 100;
                                                else if (newStatus === TaskStatus.Todo) newProgress = 0;
                                                else if (newStatus === TaskStatus.InProgress && newProgress === 0) newProgress = 25;
                                                else if (newStatus === TaskStatus.Review && newProgress < 100) newProgress = 100;

                                                // ── AUTO-FILL actual dates based on status ──
                                                const updates: Partial<Task> = {
                                                    ...formData,
                                                    Status: newStatus,
                                                    ProgressPercent: newProgress,
                                                };
                                                // Bắt đầu thực hiện → auto-set ActualStartDate = hôm nay
                                                if (newStatus === TaskStatus.InProgress && !formData.ActualStartDate) {
                                                    updates.ActualStartDate = todayISO();
                                                }
                                                // Hoàn thành → auto-set ActualEndDate = hôm nay
                                                if (newStatus === TaskStatus.Done) {
                                                    if (!formData.ActualStartDate) updates.ActualStartDate = todayISO();
                                                    if (!formData.ActualEndDate) updates.ActualEndDate = todayISO();
                                                }
                                                // Quay về Chưa bắt đầu → xóa actual dates
                                                if (newStatus === TaskStatus.Todo) {
                                                    updates.ActualStartDate = '';
                                                    updates.ActualEndDate = '';
                                                }
                                                setFormData(updates);
                                            }}
                                        >
                                            <option value={TaskStatus.Todo}>Chưa bắt đầu</option>
                                            <option value={TaskStatus.InProgress}>Đang thực hiện</option>
                                            <option value={TaskStatus.Review}>Đang kiểm tra</option>
                                            <option value={TaskStatus.Done}>Hoàn thành</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-2">
                                            <Flag className="w-4 h-4 text-gray-400 dark:text-slate-500" /> Ưu tiên
                                        </label>
                                        <select
                                            className={`w-full px-3 py-2.5 rounded-lg border-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all ${getPriorityColor(formData.Priority as TaskPriority)}`}
                                            value={formData.Priority}
                                            onChange={e => setFormData({ ...formData, Priority: e.target.value as TaskPriority })}
                                        >
                                            <option value="Low">Thấp</option>
                                            <option value="Medium">Trung bình</option>
                                            <option value="High">Cao</option>
                                            <option value="Urgent">Khẩn cấp</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'advanced' && (
                            <>
                                {/* Dependencies */}
                                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                                    <TaskDependencyManager
                                        task={formData as Task}
                                        allTasks={allTasks}
                                        onUpdate={handleDependencyUpdate}
                                    />
                                </div>

                                {/* Legal Basis & Output */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                                            Căn cứ pháp lý
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="VD: Điều 24 Luật ĐTC"
                                            value={formData.LegalBasis || ''}
                                            onChange={e => setFormData({ ...formData, LegalBasis: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                                            Sản phẩm đầu ra
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="VD: Quyết định phê duyệt"
                                            value={formData.OutputDocument || ''}
                                            onChange={e => setFormData({ ...formData, OutputDocument: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Duration & Cost */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                                            Thời gian thực hiện (ngày)
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="VD: 15"
                                            value={formData.DurationDays || ''}
                                            onChange={e => setFormData({ ...formData, DurationDays: parseInt(e.target.value) || undefined })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                                            Chi phí dự kiến (VNĐ)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="VD: 50,000,000"
                                            value={formData.EstimatedCost || ''}
                                            onChange={e => setFormData({ ...formData, EstimatedCost: parseInt(e.target.value) || undefined })}
                                        />
                                    </div>
                                </div>

                                {/* Approver */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                                        Người phê duyệt
                                    </label>
                                    <select
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-50"
                                        value={formData.ApproverID || ''}
                                        onChange={e => setFormData({ ...formData, ApproverID: e.target.value })}
                                    >
                                        <option value="">-- Chọn người phê duyệt --</option>
                                        {employees.filter(emp => emp.Position?.includes('Trưởng') || emp.Position?.includes('Giám đốc')).map(emp => (
                                            <option key={emp.EmployeeID} value={emp.EmployeeID}>
                                                {emp.FullName} - {emp.Position}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Critical Path Flag */}
                                <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                                    <input
                                        type="checkbox"
                                        id="isCritical"
                                        className="w-4 h-4 text-purple-600 border-purple-300 rounded focus:ring-purple-500"
                                        checked={formData.IsCritical || false}
                                        onChange={e => setFormData({ ...formData, IsCritical: e.target.checked })}
                                    />
                                    <label htmlFor="isCritical" className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                        Đánh dấu là Critical Path (ảnh hưởng trực tiếp đến tiến độ dự án)
                                    </label>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3 bg-gray-50 dark:bg-slate-800 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-gray-600 dark:text-slate-300 font-medium hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md transition-all transform active:scale-95"
                        >
                            {initialData?.TaskID ? 'Lưu thay đổi' : 'Tạo công việc'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
