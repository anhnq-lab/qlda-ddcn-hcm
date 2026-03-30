import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useToast } from '../../../components/ui/Toast';
import { Save, AlertCircle, FileText, Tag, Hash, ToggleLeft } from 'lucide-react';
import type { IsoWorkflow, IsoWorkflowCategory } from '../../../types/iso_workflow.types';

interface IsoWorkflowSlidePanelProps {
    workflowId: string;
    onClose: () => void;
    onUpdate?: () => void;
}

const IsoWorkflowSlidePanel: React.FC<IsoWorkflowSlidePanelProps> = ({ workflowId, onClose, onUpdate }) => {
    const [workflow, setWorkflow] = useState<IsoWorkflow | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { addToast } = useToast();

    // Form inputs
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<IsoWorkflowCategory>('project');
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        const fetchWorkflow = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('iso_workflows')
                    .select('*')
                    .eq('id', workflowId)
                    .single();

                if (error) throw error;

                setWorkflow(data);
                setName(data.name || '');
                setCode(data.code || '');
                setDescription(data.description || '');
                setCategory(data.category || 'project');
                setIsActive(data.is_active ?? true);
            } catch (err: any) {
                console.error('Error fetching workflow:', err);
                addToast({ title: 'Lỗi tải dữ liệu', message: err.message, type: 'error' });
            } finally {
                setIsLoading(false);
            }
        };

        if (workflowId) fetchWorkflow();
    }, [workflowId, addToast]);

    const handleSave = async () => {
        if (!workflow) return;
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('iso_workflows')
                .update({
                    name,
                    code,
                    description: description || null,
                    category,
                    is_active: isActive,
                    updated_at: new Date().toISOString()
                })
                .eq('id', workflowId);

            if (error) throw error;
            
            addToast({ title: 'Cập nhật thành công', message: 'Đã lưu cấu hình chung của Quy trình.', type: 'success' });
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
            <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-8 pt-20 shadow-[-10px_0_30px_rgba(0,0,0,0.05)] w-[550px]">
                 <div className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-6 py-1">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                        <div className="space-y-3">
                            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded"></div>
                            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
                            <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!workflow) return null;

    return (
        <div className="flex flex-col h-full bg-[#FAFAF8] dark:bg-slate-900 relative">
            <div className="p-8 pb-32 space-y-8 flex-1 overflow-auto custom-scrollbar">
                
                {/* Header info */}
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2 font-display">Cài đặt ISO Chung</h2>
                    <p className="text-sm font-medium text-slate-500">
                        Cấu hình meta-data, phiên bản và trạng thái của chuẩn quy trình.
                    </p>
                </div>

                {/* Form fields */}
                <div className="space-y-6 bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
                    <div className="space-y-4">
                        
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                                <FileText size={14} className="text-primary-500" /> Tên quy trình
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full h-11 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 text-sm font-semibold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                                placeholder="VD: Quy trình dự án Nhóm C"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                                    <Hash size={14} className="text-emerald-500" /> Mã quy trình (Code)
                                </label>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="w-full h-11 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 text-sm font-semibold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors font-mono uppercase"
                                    placeholder="ISO-XXX-1234"
                                />
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                                    <Tag size={14} className="text-blue-500" /> Phân loại (Category)
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as IsoWorkflowCategory)}
                                    className="w-full h-11 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 text-sm font-semibold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                                >
                                    <option value="project">Dự án Đầu tư (Project)</option>
                                    <option value="document">Văn bản (Document)</option>
                                    <option value="finance">Tài chính (Finance)</option>
                                    <option value="hr">Nhân sự (HR)</option>
                                    <option value="asset">Tài sản (Asset)</option>
                                    <option value="other">Khác (Other)</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                                <FileText size={14} className="text-slate-500" /> Mô tả chi tiết
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors custom-scrollbar"
                                placeholder="Nhập mô tả mục đích và bối cảnh áp dụng quy trình này..."
                            />
                        </div>

                        {/* Status Toggle */}
                        <div className="flex items-center justify-between mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <ToggleLeft size={16} className={isActive ? "text-emerald-500" : "text-slate-400"} />
                                    Trạng thái hoạt động
                                </h4>
                                <p className="text-[11px] text-slate-500 mt-1 font-medium">Bật để cho phép hệ thống tạo Hồ sơ dựa trên chuẩn này.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                            </label>
                        </div>
                        
                        <div className="mt-4 flex items-center gap-3">
                            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                <Hash size={16} className="text-slate-500" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase">Phiên bản hiện tại</p>
                                <p className="text-sm font-medium text-slate-800 dark:text-white">v{workflow.version}.0</p>
                            </div>
                        </div>
                    </div>
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
                    Lưu cài đặt
                </button>
            </div>
        </div>
    );
};

export default IsoWorkflowSlidePanel;
