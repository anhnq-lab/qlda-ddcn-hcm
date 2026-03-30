import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useToast } from '../../../components/ui/Toast';
import { Save, AlertCircle, Clock, User, Type, Link as LinkIcon, Edit3 } from 'lucide-react';
import type { IsoWorkflowNode } from '../../../types/iso_workflow.types';

interface IsoNodeSlidePanelProps {
    nodeId: string;
    onClose: () => void;
    onUpdate?: () => void;
}

const IsoNodeSlidePanel: React.FC<IsoNodeSlidePanelProps> = ({ nodeId, onClose, onUpdate }) => {
    const [node, setNode] = useState<IsoWorkflowNode | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { addToast } = useToast();

    // Form inputs
    const [name, setName] = useState('');
    const [type, setType] = useState<IsoWorkflowNode['type']>('input');
    const [assigneeRole, setAssigneeRole] = useState('');
    const [slaFormula, setSlaFormula] = useState('');

    useEffect(() => {
        const fetchNode = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('iso_workflow_nodes')
                    .select('*')
                    .eq('id', nodeId)
                    .single();

                if (error) throw error;

                setNode(data);
                setName(data.name || '');
                setType(data.type || 'input');
                setAssigneeRole(data.assignee_role || '');
                setSlaFormula(data.sla_formula || '');
            } catch (err: any) {
                console.error('Error fetching node:', err);
                addToast({ title: 'Lỗi tải dữ liệu', message: err.message, type: 'error' });
            } finally {
                setIsLoading(false);
            }
        };

        if (nodeId) fetchNode();
    }, [nodeId, addToast]);

    const handleSave = async () => {
        if (!node) return;
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('iso_workflow_nodes')
                .update({
                    name,
                    type,
                    assignee_role: assigneeRole || null,
                    sla_formula: slaFormula || null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', nodeId);

            if (error) throw error;
            
            addToast({ title: 'Cập nhật thành công', message: 'Đã lưu cấu hình bước.', type: 'success' });
            if (onUpdate) onUpdate();
        } catch (err: any) {
            console.error('Save error:', err);
            addToast({ title: 'Lỗi khi lưu', message: err.message, type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-8 pt-20 shadow-[-10px_0_30px_rgba(0,0,0,0.05)] w-[500px]">
                 <div className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-6 py-1">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                        <div className="space-y-3">
                            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded"></div>
                            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!node) return null;

    return (
        <div className="flex flex-col h-full bg-[#FAFAF8] dark:bg-slate-900 relative">
            <div className="p-8 pb-32 space-y-8 flex-1 overflow-auto custom-scrollbar">
                
                {/* Header info */}
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2 font-display">{name}</h2>
                    <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                        <span className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                            ID: {nodeId.split('-')[0]}
                        </span>
                        Bạn đang cấu hình chi tiết cho bước quy trình này.
                    </p>
                </div>

                {/* Form fields */}
                <div className="space-y-6 bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                                <Edit3 size={14} className="text-primary-500" /> Tên bước (Tác vụ)
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full h-11 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 text-sm font-semibold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                                placeholder="VD: Lập báo cáo KT-KT"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                                <Type size={14} className="text-emerald-500" /> Loại bước
                            </label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as IsoWorkflowNode['type'])}
                                className="w-full h-11 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 text-sm font-semibold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                            >
                                <option value="start">Bắt đầu (Start)</option>
                                <option value="input">Tham số đầu vào / Tạo hồ sơ (Input)</option>
                                <option value="approval">Phê duyệt (Approval)</option>
                                <option value="automated">Task tự động (Automated)</option>
                                <option value="end">Kết thúc (End)</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                                <User size={14} className="text-blue-500" /> Vai trò xử lý (Assignee Role)
                            </label>
                            <input
                                type="text"
                                value={assigneeRole}
                                onChange={(e) => setAssigneeRole(e.target.value)}
                                className="w-full h-11 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 text-sm font-semibold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                                placeholder="VD: ptd_ttht, manager, director..."
                            />
                            <p className="text-[11px] text-slate-400 font-medium ml-1">Nhập mã vai trò hoặc chức danh yêu cầu xử lý bước này.</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                                <Clock size={14} className="text-amber-500" /> Công thức SLA (Thời gian xử lý)
                            </label>
                            <input
                                type="text"
                                value={slaFormula}
                                onChange={(e) => setSlaFormula(e.target.value)}
                                className="w-full h-11 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 text-sm font-semibold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                                placeholder="VD: 5d (5 ngày) hoặc mã công thức phức tạp"
                            />
                            <p className="text-[11px] text-slate-400 font-medium ml-1">Định nghĩa thời hạn kỳ vọng (SLA) để tính quá hạn.</p>
                        </div>
                    </div>
                </div>

                {/* Additional Settings Hint */}
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 rounded-xl p-5 shadow-sm text-sm space-y-2">
                    <div className="flex items-center gap-2 font-bold text-blue-800 dark:text-blue-400">
                        <LinkIcon size={16} />
                        Cấu hình nâng cao (Sắp ra mắt)
                    </div>
                    <p className="text-blue-600 dark:text-blue-500 font-medium leading-relaxed">
                        Chức năng thiết lập Form Fields động (Dynamic JSON Forms) và Checklist công việc cho từng bước sẽ sớm được tích hợp trong phiên bản sắp tới để thay thế giao diện Modal cũ.
                    </p>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 z-10">
                <button 
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                    Hủy bỏ
                </button>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
                >
                    {isSaving ? (
                         <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                         <Save size={16} />
                    )}
                    Lưu cấu hình
                </button>
            </div>
        </div>
    );
};

export default IsoNodeSlidePanel;
