import React, { useState, useEffect, useRef } from 'react';
import { Save, Clock, BookOpen, Shield, Target, FileText, Plus, Trash2, GripVertical, FileSpreadsheet, Upload, Loader2, Link as LinkIcon, X } from 'lucide-react';
import type { WorkflowNode } from '../../../types/workflow.types';
import { useSlidePanel } from '../../../context/SlidePanelContext';
import { useToast } from '../../../components/ui/Toast';
import { supabase } from '../../../lib/supabase';

interface NodeDetailPanelProps {
    node: WorkflowNode;
    onSave: (nodeId: string, data: any) => Promise<void>;
}

interface SubTask {
    id: string;
    name: string;
    assignee_role: string;
    output: string;
    template_forms: string;
    legal_basis: string;
    template_url?: string;
}

const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({ node, onSave }) => {
    const { closePanel } = useSlidePanel();
    const { addToast } = useToast();
    
    // Core fields
    const [name, setName] = useState('');
    const [type, setType] = useState<any>('input');
    const [slaValue, setSlaValue] = useState('');
    const [slaUnit, setSlaUnit] = useState('d');
    
    // Meta fields
    const [phase, setPhase] = useState('preparation');
    const [description, setDescription] = useState('');
    
    // Sub-tasks
    const [subTasks, setSubTasks] = useState<SubTask[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeUploadId, setActiveUploadId] = useState<string | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeUploadId) return;

        setIsUploading(true);
        try {
            const filePath = `templates/${node.id}/${Date.now()}_${file.name}`;
            const { error: uploadErr } = await supabase.storage.from('documents').upload(filePath, file);
            if (uploadErr) throw uploadErr;

            const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(filePath);
            
            setSubTasks(subTasks.map(st => st.id === activeUploadId ? { ...st, template_url: publicUrlData.publicUrl } : st));
            addToast({ title: 'Tải thành công', message: 'Đã đính kèm biểu mẫu.', type: 'success' });
        } catch (err: any) {
            addToast({ title: 'Lỗi tải lên', message: err.message, type: 'error' });
        } finally {
            setIsUploading(false);
            setActiveUploadId(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    useEffect(() => {
        if (node) {
            setName(node.name || '');
            setType(node.type || 'input');
            
            const sf = node.sla_formula || '';
            const valMatch = sf.match(/^(\d+)/);
            const unitMatch = sf.match(/[a-zA-Z]+$/);
            setSlaValue(valMatch ? valMatch[0] : '');
            setSlaUnit(unitMatch ? unitMatch[0] : 'd');
            
            const meta = (node.metadata as any) || {};
            setPhase(meta.phase || 'preparation');
            setDescription(meta.description || '');
            
            // Transform legacy fields to first sub-task if needed, or just load sub_tasks
            const loadedSubTasks: SubTask[] = meta.sub_tasks || [];
            
            // Migration logic: If no sub-tasks exist but legacy data does, create one
            if (loadedSubTasks.length === 0 && (node.assignee_role || meta.output || meta.legal_basis || meta.template_forms)) {
                let tfName = '';
                if (Array.isArray(meta.template_forms)) {
                    tfName = meta.template_forms.join(', ');
                } else if (typeof meta.template_forms === 'string') {
                    tfName = meta.template_forms;
                }
                
                loadedSubTasks.push({
                    id: crypto.randomUUID(),
                    name: meta.description || 'Nhiệm vụ chính',
                    assignee_role: node.assignee_role || '',
                    output: meta.output || '',
                    template_forms: tfName,
                    legal_basis: meta.legal_basis || ''
                });
            }
            
            // Require at least one sub task
            if (loadedSubTasks.length === 0) {
                loadedSubTasks.push({
                    id: crypto.randomUUID(),
                    name: 'Nhiệm vụ mới',
                    assignee_role: '',
                    output: '',
                    template_forms: '',
                    legal_basis: '',
                    template_url: ''
                });
            }
            
            setSubTasks(loadedSubTasks);
        }
    }, [node]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Aggregate legacy fields for backwards compatibility (optional, but good)
            const primarySubTask = subTasks[0] || {};
            
            const updatedData = {
                name,
                type,
                // Assignee role is generally useful at node level as primary owner
                assignee_role: primarySubTask.assignee_role || '',
                sla_formula: slaValue ? `${slaValue}${slaUnit}` : null,
                metadata: {
                    ...(node.metadata as any || {}),
                    description,
                    phase,
                    sub_tasks: subTasks,
                    // Keep legacy structure lightly synced so standard queries don't break
                    legal_basis: primarySubTask.legal_basis || '',
                    output: primarySubTask.output || '',
                    template_forms: primarySubTask.template_forms ? primarySubTask.template_forms.split(',').map(s=>s.trim()) : []
                }
            };
            await onSave(node.id, updatedData);
            closePanel(); // Assuming close active panel works or we can pass id
        } catch (err: any) {
             addToast({ title: 'Lỗi khi lưu', message: err.message, type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const addSubTask = () => {
        setSubTasks([...subTasks, {
            id: crypto.randomUUID(),
            name: '',
            assignee_role: '',
            output: '',
            template_forms: '',
            legal_basis: '',
            template_url: ''
        }]);
    };

    const removeSubTask = (id: string) => {
        if (subTasks.length <= 1) {
            addToast({ title: 'Không thể xóa', message: 'Cần ít nhất 1 công việc con.', type: 'warning' });
            return;
        }
        setSubTasks(subTasks.filter(st => st.id !== id));
    };

    const updateSubTask = (id: string, field: keyof SubTask, value: string) => {
        setSubTasks(subTasks.map(st => st.id === id ? { ...st, [field]: value } : st));
    };

    return (
        <div className="flex flex-col h-full bg-[#FAFAF8] dark:bg-slate-900 relative">
            <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
            <div className="flex-1 overflow-auto p-6 custom-scrollbar pb-28 space-y-6">
                
                {/* 1. Header Info */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1.5 focus-within:text-primary-600 dark:focus-within:text-primary-500 transition-colors col-span-2">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Tên nội dung thực hiện (Bước)</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)}
                                className="w-full h-11 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 text-sm font-semibold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-800 dark:text-white transition-colors" />
                        </div>

                        <div className="space-y-1.5 focus-within:text-primary-600 dark:focus-within:text-primary-500 transition-colors">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                                Giai đoạn dự án
                            </label>
                            <select value={phase} onChange={e => setPhase(e.target.value)}
                                className="w-full h-11 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 text-sm font-semibold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-800 dark:text-white transition-colors cursor-pointer appearance-none">
                                <option value="preparation">I. Giai đoạn Chuẩn bị dự án</option>
                                <option value="execution">II. Giai đoạn Thực hiện dự án</option>
                                <option value="completion">III. Giai đoạn Kết thúc xây dựng</option>
                            </select>
                        </div>
                        
                         <div className="space-y-1.5 focus-within:text-primary-600 dark:focus-within:text-primary-500 transition-colors">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">Phân loại bước</label>
                            <select value={type} onChange={e => setType(e.target.value)}
                                className="w-full h-11 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 text-sm font-semibold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-800 dark:text-white transition-colors cursor-pointer appearance-none">
                                <option value="start">Khởi xướng (Start)</option>
                                <option value="input">Lập hồ sơ / Thực thi (Input)</option>
                                <option value="approval">Phê duyệt (Approval)</option>
                                <option value="automated">Hệ thống xử lý tự động (Auto)</option>
                                <option value="end">Kết thúc (End)</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                            <Clock size={14} className="text-amber-500" /> Tổng thời gian (SLA)
                        </label>
                        <div className="flex bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all w-full max-w-xs">
                            <input type="number" 
                                value={slaValue} 
                                onChange={e => setSlaValue(e.target.value)}
                                placeholder="0"
                                min="0"
                                className="w-16 flex-1 h-11 bg-transparent px-4 text-sm font-bold text-center border-r border-slate-200 dark:border-slate-700 focus:outline-none text-slate-800 dark:text-white" />
                            <select 
                                value={slaUnit} 
                                onChange={e => setSlaUnit(e.target.value)}
                                className="min-w-[100px] h-11 bg-slate-100 dark:bg-slate-800 px-3 text-xs font-semibold focus:outline-none text-slate-700 dark:text-slate-300 border-none cursor-pointer">
                                <option value="d">Ngày lịch</option>
                                <option value="wd">Ngày làm việc</option>
                                <option value="h">Giờ (Hours)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 2. Sub-tasks */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-[13px] font-bold text-slate-800 dark:text-white uppercase tracking-wider">Cấu trúc công việc con</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Phân bổ chi tiết các thành phần trong bước này</p>
                        </div>
                        <button onClick={addSubTask} 
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50 rounded-lg text-xs font-bold transition-colors">
                            <Plus size={14} /> Thêm công việc
                        </button>
                    </div>

                    <div className="space-y-4">
                        {subTasks.map((st, i) => (
                            <div key={st.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden group/st">
                                {/* Header */}
                                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-[10px] font-bold">
                                            {i + 1}
                                        </div>
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Công việc chi tiết</span>
                                    </div>
                                    <button onClick={() => removeSubTask(st.id)} className="text-slate-400 hover:text-rose-500 transition-colors" title="Xóa công việc con này">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                {/* Body */}
                                <div className="p-4 space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Nội dung công việc <span className="text-rose-500">*</span></label>
                                        <textarea value={st.name} onChange={e => updateSubTask(st.id, 'name', e.target.value)}
                                            ref={(el) => {
                                                if (el) {
                                                    el.style.height = 'auto';
                                                    el.style.height = el.scrollHeight + 'px';
                                                }
                                            }}
                                            onInput={(e) => {
                                                const target = e.target as HTMLTextAreaElement;
                                                target.style.height = 'auto';
                                                target.style.height = target.scrollHeight + 'px';
                                            }}
                                            style={{ minHeight: '80px' }}
                                            rows={2}
                                            placeholder="VD: Trình, thẩm định, duyệt nội dung..."
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-[13px] font-medium leading-relaxed focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors resize-none overflow-hidden" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5"><Shield size={12} className="text-blue-500"/> Đơn vị thực hiện</label>
                                            <input type="text" value={st.assignee_role} onChange={e => updateSubTask(st.id, 'assignee_role', e.target.value)}
                                                placeholder="VD: Chủ đầu tư..."
                                                className="w-full h-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 text-xs focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5"><Target size={12} className="text-rose-500"/> Đầu ra quy định</label>
                                            <input type="text" value={st.output} onChange={e => updateSubTask(st.id, 'output', e.target.value)}
                                                placeholder="VD: Tờ trình, Báo cáo..."
                                                className="w-full h-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 text-xs focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5"><FileSpreadsheet size={12} className="text-indigo-500"/> Mẫu số/Ghi chú</label>
                                                <button type="button" 
                                                    onClick={(e) => { 
                                                        e.preventDefault(); 
                                                        e.stopPropagation(); 
                                                        setActiveUploadId(st.id);
                                                        fileInputRef.current?.click();
                                                    }} 
                                                    disabled={isUploading && activeUploadId === st.id}
                                                    className="flex items-center gap-1 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded block transition-colors text-[10px] font-bold disabled:opacity-50"
                                                >
                                                    {isUploading && activeUploadId === st.id ? <Loader2 size={10} className="animate-spin" /> : <Upload size={10} />} Tải file lên
                                                </button>
                                            </div>
                                            <textarea value={st.template_forms} onChange={e => updateSubTask(st.id, 'template_forms', e.target.value)} rows={2}
                                                placeholder="VD: Mẫu 01 (ND-112)"
                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-[12px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors resize-y min-h-[60px]" />
                                            {st.template_url && (
                                                <div className="flex items-center gap-1 mt-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                                                    <LinkIcon size={10} />
                                                    <a href={st.template_url} target="_blank" rel="noreferrer" className="hover:underline truncate" title={st.template_url}>
                                                        Đã đính kèm biểu mẫu
                                                    </a>
                                                    <button type="button" onClick={() => updateSubTask(st.id, 'template_url', '')} className="ml-1 text-slate-400 hover:text-rose-500">
                                                        <X size={10} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5"><BookOpen size={12} className="text-emerald-500"/> Cơ sở pháp lý</label>
                                            <textarea value={st.legal_basis} onChange={e => updateSubTask(st.id, 'legal_basis', e.target.value)} rows={2}
                                                placeholder="VD: Khoản 3, Điều 43..."
                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-[12px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors resize-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

             {/* Footer */}
             <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 z-10">
                <button onClick={() => closePanel()}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-700">
                    Hủy
                </button>
                 <button onClick={handleSave} disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition shadow-md flex items-center gap-2 disabled:opacity-50">
                    {isSaving ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
                    Lưu Thay Đổi
                </button>
            </div>
        </div>
    );
};

export default NodeDetailPanel;
