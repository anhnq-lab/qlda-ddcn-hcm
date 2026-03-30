import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Info, FileText, Gavel, CheckSquare, Zap, 
  Users, Clock, Layers, AlertCircle, 
  Play, Send, CheckCircle, XCircle, FolderOpen, Upload, UserPlus,
  ThumbsUp, ThumbsDown, History, File, Trash2, Download
} from 'lucide-react';
import { IsoWorkflowService } from '@/services/IsoWorkflowService';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';

interface ISOWorkflowStepDetailPanelProps {
  nodeId: string;
  instanceId?: string;
  projectId: string;
  staticNode?: any;
}

export const ISOWorkflowStepDetailPanel: React.FC<ISOWorkflowStepDetailPanelProps> = ({
  nodeId,
  instanceId,
  projectId,
  staticNode
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'actions' | 'cde' | 'history'>('overview');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [approvalComment, setApprovalComment] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch Node & Task details (only if instance is initialized)
  const { data: dbDetails, isLoading } = useQuery({
    queryKey: ['iso-task-detail', instanceId, nodeId],
    queryFn: async () => {
      if (!instanceId) return null;
      const { instance, nodes, tasks } = await IsoWorkflowService.getInstanceDetails(instanceId);
      const node = nodes.find(n => n.id === nodeId);
      const task = tasks.find(t => t.node_id === nodeId);
      return { instance, node, task };
    },
    enabled: !!instanceId && !!nodeId
  });

  const details = dbDetails || { node: staticNode, task: undefined, instance: undefined };

  // 2. Fetch Project Members
  const { data: members } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('project_members')
        .select(`
          employee_id,
          employee:employees(id, full_name, email, department)
        `)
        .eq('project_id', projectId);
      if (error) throw error;
      return data || [];
    }
  });

  // 3. Fetch CDE Documents (nếu task đã có folder)
  const { data: cdeDocuments } = useQuery({
    queryKey: ['iso-task-cde', details?.task?.cde_folder_id],
    queryFn: async () => {
      if (!details?.task?.cde_folder_id) return [];
      const { data, error } = await (supabase as any)
        .from('documents')
        .select('*')
        .eq('folder_id', details.task.cde_folder_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!details?.task?.cde_folder_id
  });

  // 4. Fetch Audit Timeline
  const { data: timeline } = useQuery({
    queryKey: ['iso-timeline', instanceId],
    queryFn: () => instanceId ? IsoWorkflowService.getInstanceTimeline(instanceId) : Promise.resolve([]),
    enabled: activeTab === 'history' && !!instanceId
  });

  // ─── Mutations ─────────────────────────────────────────

  const startTaskMutation = useMutation({
    mutationFn: async () => {
      if (!details?.node || !details?.instance) return;
      
      const taskTitle = details.node.name || 'Nhiệm vụ';
      const currentUser = selectedAssignee || user?.id || 'system';

      // 1. Tạo thư mục CDE
      const folderId = await IsoWorkflowService.getOrCreateTaskFolder(
        instanceId, nodeId, taskTitle, currentUser
      );

      // 2. Bắt đầu task + link folder CDE
      if (details?.task?.id) {
        await IsoWorkflowService.startTask(details.task.id, currentUser, folderId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['iso-task-detail'] });
      addToast({ title: 'Thành công', message: 'Đã bắt đầu thực hiện và khởi tạo thư mục CDE', type: 'success' });
    },
    onError: (error: any) => {
      addToast({ title: 'Lỗi', message: error.message, type: 'error' });
    }
  });

  const submitTaskMutation = useMutation({
    mutationFn: async () => {
      if (details?.task?.id) {
        await IsoWorkflowService.submitTask(details.task.id, notes);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['iso-task-detail'] });
      addToast({ title: 'Thành công', message: 'Đã nộp hồ sơ thành công', type: 'success' });
    }
  });

  const approvalMutation = useMutation({
    mutationFn: async (action: 'approve' | 'reject') => {
      if (!details?.task?.id) return;
      await IsoWorkflowService.processApproval(
        details.task.id, action, approvalComment, user?.id
      );
    },
    onSuccess: (_, action) => {
      queryClient.invalidateQueries({ queryKey: ['iso-task-detail'] });
      addToast({ title: 'Thành công', message: action === 'approve' ? 'Đã phê duyệt thành công' : 'Đã từ chối — bước trước sẽ nhận lại hồ sơ', type: 'success' });
    },
    onError: (error: any) => {
      addToast({ title: 'Lỗi', message: error.message, type: 'error' });
    }
  });

  // Upload file lên CDE
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || !details?.task?.cde_folder_id) return;
    setIsUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        const filePath = `cde/${projectId}/${details.task.cde_folder_id}/${Date.now()}_${file.name}`;
        
        const { error: uploadErr } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadErr) throw uploadErr;

        // Tạo record trong documents
        await (supabase as any).from('documents').insert({
          folder_id: details.task.cde_folder_id,
          doc_name: file.name,
          url: filePath,
          size: file.size.toString(),
          uploaded_by: user?.id
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['iso-task-cde'] });
      addToast({ title: 'Thành công', message: `Đã tải lên ${files.length} tài liệu`, type: 'success' });
    } catch (err: any) {
      addToast({ title: 'Lỗi', message: 'Lỗi tải file: ' + err.message, type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  // ─── Render ────────────────────────────────────────────

  if (instanceId && isLoading) return <div className="p-8 animate-pulse">Loading...</div>;
  if (!details?.node) return <div className="p-8">Không tìm thấy thông tin bước</div>;

  const { node, task, instance } = details;
  const isApprovalNode = node.type === 'approval';
  const isInputNode = node.type === 'input';
  const isTaskNode = isApprovalNode || isInputNode;

  return (
    <div className="flex flex-col h-full bg-[#FCF9F2] dark:bg-slate-900">
      {/* HEADER */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
            isApprovalNode 
              ? 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-violet-500/20' 
              : 'bg-gradient-to-br from-primary-500 to-amber-600 shadow-primary-500/20'
          }`}>
            {isApprovalNode ? <ThumbsUp className="w-6 h-6 text-white" /> : <Layers className="w-6 h-6 text-white" />}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">{node.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
                {(instance as any).workflow?.name || 'Quy trình'}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                task?.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                task?.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                task?.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {task?.status === 'completed' ? 'Hoàn thành' :
                 task?.status === 'in_progress' ? 'Đang thực hiện' :
                 task?.status === 'rejected' ? 'Bị từ chối' :
                 task?.status === 'pending' ? 'Chờ xử lý' : 'Chưa bắt đầu'}
              </span>
              {isApprovalNode && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                  Phê duyệt
                </span>
              )}
            </div>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex items-center gap-6 mt-6">
          {[
            { id: 'overview', label: 'Thông tin', icon: Info },
            { id: 'actions', label: isApprovalNode ? 'Phê duyệt' : 'Thực hiện', icon: isApprovalNode ? ThumbsUp : Zap },
            { id: 'cde', label: 'Hồ sơ CDE', icon: FolderOpen },
            { id: 'history', label: 'Lịch sử', icon: History },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 pb-2 border-b-2 transition-all font-bold text-sm ${
                activeTab === t.id 
                  ? 'border-primary-600 text-primary-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* ═══ TAB OVERVIEW ═══ */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Section title="Mô tả công việc" icon={FileText}>
              <p className="text-sm text-gray-700 dark:text-slate-300 whitespace-pre-wrap">
                {(node.metadata as any)?.description || 'Chưa có mô tả chi tiết cho bước này.'}
              </p>
            </Section>

            <div className="grid grid-cols-2 gap-4">
              <Section title="Căn cứ pháp lý" icon={Gavel} color="amber">
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                  {(node.metadata as any)?.legal_basis || 'Theo quy định hiện hành'}
                </p>
              </Section>
              <Section title="SLA (Thời hạn)" icon={Clock} color="blue">
                <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">
                  {node.sla_formula ? `${node.sla_formula.replace('d', '')} ngày làm việc` : 'Chưa cấu hình'}
                </p>
                {task?.due_date && (
                  <p className="text-[10px] text-blue-500 mt-1">
                    Hạn: {new Date(task.due_date).toLocaleDateString('vi-VN')}
                  </p>
                )}
              </Section>
            </div>

            <Section title="Sản phẩm đầu ra" icon={CheckSquare} color="emerald">
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                {(node.metadata as any)?.output || 'Hồ sơ, tờ trình phê duyệt'}
              </p>
            </Section>

            {node.assignee_role && (
              <Section title="Vai trò thực hiện" icon={Users} color="gray">
                <p className="text-xs text-gray-700 dark:text-gray-400 font-medium">
                  {node.assignee_role}
                </p>
              </Section>
            )}
          </div>
        )}

        {/* ═══ TAB ACTIONS ═══ */}
        {activeTab === 'actions' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {!instanceId ? (
              <div className="text-center py-12 px-4 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-slate-700">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play size={24} />
                </div>
                <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-2">Quy trình chưa khởi động</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Hãy nhấn "Khởi động Quy trình" ở ngoài màn hình flowchart để có thể giao việc và xử lý.
                </p>
              </div>
            ) : (
              <>
                {/* STATE: Pending — Giao việc */}
                {(!task || task.status === 'pending') && (
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                      <UserPlus size={16} className="text-primary-500" />
                      Giao việc thực hiện
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Người thực hiện</label>
                    <select 
                      className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                      value={selectedAssignee}
                      onChange={(e) => setSelectedAssignee(e.target.value)}
                    >
                      <option value="">Chọn thành viên...</option>
                      {members?.map((m: any) => (
                        <option key={m.employee_id} value={m.employee_id}>
                          {m.employee?.full_name} ({m.employee?.department})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button 
                    onClick={() => startTaskMutation.mutate()}
                    disabled={startTaskMutation.isPending}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-600/20 disabled:opacity-50"
                  >
                    <Play size={18} />
                    Bắt đầu thực hiện
                  </button>
                </div>
              </div>
            )}

            {/* STATE: In Progress */}
            {task?.status === 'in_progress' && (
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-blue-900 dark:text-blue-100">Đang thực hiện</p>
                      {task.started_at && (
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          Bắt đầu: {new Date(task.started_at).toLocaleString('vi-VN')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Input Node → Nộp báo cáo */}
                {isInputNode && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Ghi chú thực hiện</label>
                      <textarea 
                        rows={4}
                        className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="Nhập ghi chú hoặc báo cáo kết quả..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                    <button 
                      onClick={() => submitTaskMutation.mutate()}
                      disabled={submitTaskMutation.isPending}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                    >
                      <Send size={18} />
                      Nộp báo cáo & Hồ sơ
                    </button>
                  </>
                )}

                {/* Approval Node → Phê duyệt / Từ chối */}
                {isApprovalNode && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Ý kiến phê duyệt</label>
                      <textarea 
                        rows={3}
                        className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="Nhập ý kiến (bắt buộc khi từ chối)..."
                        value={approvalComment}
                        onChange={(e) => setApprovalComment(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => approvalMutation.mutate('reject')}
                        disabled={approvalMutation.isPending || !approvalComment.trim()}
                        className="bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all border border-red-200 dark:border-red-800 disabled:opacity-50"
                      >
                        <ThumbsDown size={18} />
                        Từ chối
                      </button>
                      <button 
                        onClick={() => approvalMutation.mutate('approve')}
                        disabled={approvalMutation.isPending}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                      >
                        <ThumbsUp size={18} />
                        Phê duyệt
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* STATE: Completed */}
            {task?.status === 'completed' && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-6 rounded-2xl flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-800 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 shadow-inner">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                  {task.action_taken === 'APPROVED' ? 'Đã phê duyệt' : 'Đã hoàn thành'}
                </h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1 max-w-xs">
                  {task.completed_at && `Hoàn thành lúc ${new Date(task.completed_at).toLocaleString('vi-VN')}`}
                </p>
                {task.comments && (
                  <div className="mt-4 w-full text-left">
                    <label className="text-[10px] font-bold text-emerald-600 uppercase mb-1 block">Ý kiến:</label>
                    <div className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 italic">
                      "{task.comments}"
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STATE: Rejected */}
            {task?.status === 'rejected' && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-2xl flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
                  <XCircle size={32} />
                </div>
                <h3 className="text-lg font-bold text-red-900 dark:text-red-100">Đã bị từ chối</h3>
                {task.comments && (
                  <div className="mt-4 w-full text-left">
                    <label className="text-[10px] font-bold text-red-600 uppercase mb-1 block">Lý do:</label>
                    <div className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-lg border border-red-100 dark:border-red-800 text-xs text-red-800 dark:text-red-300 italic">
                      "{task.comments}"
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    )}

        {/* ═══ TAB CDE ═══ */}
        {activeTab === 'cde' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {task?.cde_folder_id ? (
              <>
                {/* Upload Area */}
                <div 
                  className="bg-white dark:bg-slate-800 p-6 rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-600 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className={`w-10 h-10 mb-3 ${isUploading ? 'animate-bounce text-primary-500' : 'text-gray-300 dark:text-slate-600'}`} />
                  <h3 className="font-bold text-gray-700 dark:text-slate-200 text-sm">
                    {isUploading ? 'Đang tải lên...' : 'Kéo thả hoặc nhấn để tải tài liệu'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">PDF, DOCX, XLSX, DWG, hình ảnh</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.dwg,.jpg,.jpeg,.png"
                  />
                </div>

                {/* Documents List */}
                {cdeDocuments && cdeDocuments.length > 0 ? (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Tài liệu đã tải ({cdeDocuments.length})
                    </h3>
                    {cdeDocuments.map((doc: any) => (
                      <div key={doc.id} className="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700 hover:shadow-sm transition-shadow">
                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-500">
                          <File size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">{doc.name}</p>
                          <p className="text-[10px] text-gray-400">
                            {(doc.file_size / 1024).toFixed(1)} KB • {new Date(doc.created_at).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                          <Download size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400 dark:text-slate-500 text-sm">
                    Chưa có tài liệu nào được tải lên cho bước này.
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 flex flex-col items-center justify-center text-center">
                <FolderOpen className="w-12 h-12 text-gray-300 dark:text-slate-600 mb-4" />
                <h3 className="font-bold text-gray-700 dark:text-slate-200">Thư mục CDE chưa khởi tạo</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 max-w-[280px]">
                  Nhấn "Bắt đầu thực hiện" ở tab Thực hiện để tự động tạo thư mục CDE cho bước này.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ═══ TAB HISTORY ═══ */}
        {activeTab === 'history' && (
          <div className="space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {timeline && timeline.length > 0 ? (
              <div className="relative pl-6">
                {/* Vertical Line */}
                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-slate-700" />
                
                {timeline.map((item: any, idx: number) => (
                  <div key={item.id} className="relative pb-6 last:pb-0">
                    {/* Dot */}
                    <div className={`absolute -left-6 top-1 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center ${
                      item.status === 'completed' ? 'bg-emerald-100 border-emerald-400 text-emerald-600' :
                      item.status === 'rejected' ? 'bg-red-100 border-red-400 text-red-600' :
                      item.status === 'in_progress' ? 'bg-blue-100 border-blue-400 text-blue-600' :
                      'bg-gray-100 border-gray-300 text-gray-400'
                    }`}>
                      {item.status === 'completed' ? <CheckCircle size={12} /> :
                       item.status === 'rejected' ? <XCircle size={12} /> :
                       <Clock size={12} />}
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-100 dark:border-slate-700">
                      <p className="text-sm font-bold text-gray-800 dark:text-slate-200">
                        {(item.node as any)?.name || 'Bước'}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                        {item.action_taken && (
                          <span className={`px-1.5 py-0.5 rounded font-bold ${
                            item.action_taken === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                            item.action_taken === 'REJECTED' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>{item.action_taken}</span>
                        )}
                        {item.completed_at && <span>{new Date(item.completed_at).toLocaleString('vi-VN')}</span>}
                        {(item.assignee as any)?.full_name && (
                          <span>• {(item.assignee as any).full_name}</span>
                        )}
                      </div>
                      {item.comments && (
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 italic">"{item.comments}"</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 text-sm">
                Chưa có lịch sử xử lý nào.
              </div>
            )}
          </div>
        )}
      </div>

      {/* FOOTER WARNING */}
      {task?.status === 'in_progress' && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border-t border-amber-200 dark:border-amber-800">
           <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1.5 leading-none">
              <AlertCircle size={12} />
              Lưu ý: Hãy đảm bảo đã kiểm tra đầy đủ hồ sơ trước khi nộp hoặc phê duyệt.
           </p>
        </div>
      )}
    </div>
  );
};

// ─── HELPER COMPONENTS ──────────────────────────────────────

const Section: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode; color?: string }> = ({ 
  title, icon: Icon, children, color = 'gray' 
}) => {
  const colorMap: any = {
    gray: 'text-gray-500 bg-gray-100 dark:bg-slate-700 dark:text-slate-400',
    amber: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
    blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
    emerald: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400'
  };
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-lg ${colorMap[color]}`}>
          <Icon size={14} />
        </div>
        <h3 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{title}</h3>
      </div>
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
        {children}
      </div>
    </div>
  );
};

export default ISOWorkflowStepDetailPanel;
