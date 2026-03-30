import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Network, Plus, Settings, AlertCircle, FileText, DownloadCloud, ArrowLeft } from 'lucide-react';
import type { IsoWorkflow, IsoWorkflowNode, IsoWorkflowEdge, IsoWorkflowNodeType } from '../../types/iso_workflow.types';
import { useToast } from '../../components/ui/Toast';
import { useSlidePanel } from '../../context/SlidePanelContext';
import ISOFlowchartViewer from './components/ISOFlowchartViewer';
import IsoWorkflowSlidePanel from './components/IsoWorkflowSlidePanel';
import IsoNodeSlidePanel from './components/IsoNodeSlidePanel';

const ISOManagerPage: React.FC = () => {
    const [workflows, setWorkflows] = useState<IsoWorkflow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSeeding, setIsSeeding] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedWorkflow, setSelectedWorkflow] = useState<IsoWorkflow | null>(null);
    const [workflowNodes, setWorkflowNodes] = useState<IsoWorkflowNode[]>([]);
    const [workflowEdges, setWorkflowEdges] = useState<IsoWorkflowEdge[]>([]);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const { addToast } = useToast();
    const { openPanel, closePanel } = useSlidePanel();

    useEffect(() => {
        fetchWorkflows();
    }, []);

    const fetchWorkflows = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase
                .from('iso_workflows')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) {
                // Ignore error if table doesn't exist yet (migration not run)
                if (fetchError.code === '42P01') {
                    setError('Bảng iso_workflows chưa được tạo. Vui lòng chạy Migration Database.');
                } else {
                    throw fetchError;
                }
            } else {
                setWorkflows(data || []);
            }
        } catch (err: any) {
            console.error('Error fetching ISO workflows:', err);
            setError(err.message || 'Không thể tải danh sách quy trình ISO.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewDetails = async (wf: IsoWorkflow) => {
        setSelectedWorkflow(wf);
        setIsLoadingDetails(true);
        try {
            const [nodesRes, edgesRes] = await Promise.all([
                supabase.from('iso_workflow_nodes').select('*').eq('workflow_id', wf.id).order('created_at', { ascending: true }),
                supabase.from('iso_workflow_edges').select('*').eq('workflow_id', wf.id)
            ]);

            if (nodesRes.error) throw nodesRes.error;
            if (edgesRes.error) throw edgesRes.error;

            setWorkflowNodes(nodesRes.data || []);
            setWorkflowEdges(edgesRes.data || []);
        } catch (err: any) {
            console.error('Error fetching details:', err);
            addToast({ title: 'Lỗi tải chi tiết', message: err.message, type: 'error' });
            setSelectedWorkflow(null);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const openWorkflowSettings = (wf: IsoWorkflow) => {
        openPanel({
            id: `iso-wf-settings-${wf.id}`,
            title: "Cài đặt Quy trình",
            icon: <Settings size={16} className="text-primary-500" />,
            component: <IsoWorkflowSlidePanel 
                           workflowId={wf.id} 
                           onClose={() => closePanel(`iso-wf-settings-${wf.id}`)} 
                           onUpdate={() => {
                               fetchWorkflows();
                               if (selectedWorkflow && selectedWorkflow.id === wf.id) {
                                   handleViewDetails(wf);
                               }
                           }} 
                       />
        });
    };

    const openNodeSettings = (nodeId: string) => {
        openPanel({
            id: `iso-node-settings-${nodeId}`,
            title: `Cấu hình Bước (Node)`,
            icon: <Network size={16} className="text-emerald-500" />,
            component: <IsoNodeSlidePanel 
                           nodeId={nodeId} 
                           onClose={() => closePanel(`iso-node-settings-${nodeId}`)} 
                           onUpdate={() => {
                               if (selectedWorkflow) handleViewDetails(selectedWorkflow);
                           }} 
                       />
        });
    };

    const handleSeedISOWorkflows = async () => {
        if(!window.confirm('Xác nhận NẠP MỚI 17 BƯỚC CHUẨN ISO SỔ TAY HẢI DƯƠNG 2025? (Sẽ xoá toàn bộ cấu hình cũ)')) return;
        setIsSeeding(true);
        try {
            // 1. Lấy danh sách cũ xoá sạch (tự động cascade các node/edge/instances)
            const { data: oldWfs } = await supabase.from('iso_workflows').select('id');
            if (oldWfs && oldWfs.length > 0) {
                const ids = oldWfs.map(w => w.id);
                await supabase.from('iso_workflows').delete().in('id', ids);
            }

            // 2. Định nghĩa 17 bước
            const MASTER_STEPS = [
                { code: 'CBTD-01', name: 'Lập hồ sơ CTĐT', type: 'start', sla: { QN: 45, A: 45, B: 30, C: 30, 'C_KTKT': 30 } },
                { code: 'CBTD-02', name: 'Thẩm định hồ sơ CTĐT', type: 'approval', sla: { QN: 45, A: 45, B: 30, C: 30, 'C_KTKT': 30 } },
                { code: 'CBTD-03', name: 'Phê duyệt CTĐT', type: 'approval', sla: { QN: 15, A: 15, B: 10, C: 10, 'C_KTKT': 10 } },
                { code: 'CBTD-04', name: 'Lập Dự án đầu tư / Báo cáo KT-KT', type: 'input', sla: { QN: 60, A: 45, B: 30, C: 20, 'C_KTKT': 20 } },
                { code: 'CBTD-05', name: 'Thỏa thuận chuyên ngành', type: 'approval', sla: { QN: 20, A: 20, B: 15, C: 15, 'C_KTKT': 15 } },
                { code: 'CBTD-06', name: 'Thẩm định Dự án', type: 'approval', sla: { QN: 40, A: 40, B: 30, C: 20, 'C_KTKT': 20 } },
                { code: 'CBTD-07', name: 'Phê duyệt Dự án đầu tư', type: 'approval', sla: { QN: 15, A: 15, B: 10, C: 10, 'C_KTKT': 10 } },
                
                { code: 'THDA-08', name: 'Lập, duyệt Kế hoạch LCNT', type: 'approval', sla: { QN: 10, A: 10, B: 7, C: 7, 'C_KTKT': 7 } },
                { code: 'THDA-09', name: 'Thiết kế bản vẽ thi công', type: 'input', sla: { QN: 45, A: 30, B: 20, C: 15, 'C_KTKT': 0 }, skipFor: ['C_KTKT'] },
                { code: 'THDA-10', name: 'Giải phóng mặt bằng', type: 'approval', sla: { QN: 180, A: 120, B: 90, C: 60, 'C_KTKT': 60 } },
                { code: 'THDA-11', name: 'Lựa chọn nhà thầu', type: 'approval', sla: { QN: 45, A: 45, B: 30, C: 30, 'C_KTKT': 30 } },
                { code: 'THDA-12', name: 'Thi công & Giám sát', type: 'input', sla: { QN: 720, A: 360, B: 240, C: 180, 'C_KTKT': 180 } },
                { code: 'THDA-13', name: 'Nghiệm thu hoàn thành', type: 'approval', sla: { QN: 30, A: 30, B: 20, C: 15, 'C_KTKT': 15 } },
                
                { code: 'KTDA-14', name: 'Lập hồ sơ Quyết toán (QTDA)', type: 'input', sla: { QN: 270, A: 270, B: 180, C: 120, 'C_KTKT': 120 } },
                { code: 'KTDA-15', name: 'Kiểm toán báo cáo Quyết toán', type: 'approval', sla: { QN: 45, A: 45, B: 30, C: 30, 'C_KTKT': 30 } },
                { code: 'KTDA-16', name: 'Thẩm tra Quyết toán dự án', type: 'approval', sla: { QN: 60, A: 60, B: 45, C: 30, 'C_KTKT': 30 } },
                { code: 'KTDA-17', name: 'Phê duyệt QT, Tất toán', type: 'end', sla: { QN: 15, A: 15, B: 10, C: 10, 'C_KTKT': 10 } },
            ];

            const GROUPS = ['QN', 'A', 'B', 'C', 'C_KTKT'];
            const GROUP_NAMES: any = { QN: 'Quan trọng Quốc gia', A: 'Nhóm dự án A', B: 'Nhóm dự án B', C: 'Nhóm C (Báo cáo NCKT)', C_KTKT: 'Nhóm C (Báo cáo KT-KT)' };

            for(const group of GROUPS) {
                const shortId = Math.random().toString(36).substring(2, 6).toUpperCase();
                
                // insert Luồng Chính
                const { data: wf, error: wfErr } = await supabase.from('iso_workflows').insert({
                    name: `Quy trình ISO ${GROUP_NAMES[group]}`,
                    code: `ISO-${group}-${shortId}`,
                    description: `17 bước vòng đời dự án đầu tư công chuẩn ISO 9001 (Sổ tay Hành chính 2025).`,
                    category: 'project'
                }).select().single();

                if (wfErr) throw wfErr;

                // insert 17 nodes
                let previousNodeId = null;
                for (const step of MASTER_STEPS) {
                    if (step.skipFor && step.skipFor.includes(group)) continue;
                    
                    const durationStr = (step.sla as any)[group] > 0 ? `${(step.sla as any)[group]}d` : null;

                    const { data: node, error: nodeErr } = await supabase.from('iso_workflow_nodes').insert({
                        workflow_id: wf.id,
                        name: `[${step.code}] ${step.name}`,
                        type: step.type as IsoWorkflowNodeType,
                        sla_formula: durationStr,
                        assignee_role: 'manager' // Default assign logic
                    }).select().single();

                    if(nodeErr) throw nodeErr;

                    // Nếu có previousNode, tạo cạnh edge nối vào
                    if (previousNodeId) {
                        await supabase.from('iso_workflow_edges').insert({
                            workflow_id: wf.id,
                            source_node: previousNodeId,
                            target_node: node.id
                        });
                    }
                    previousNodeId = node.id;
                }
            }

            addToast({ title: 'Khởi tạo ISO thành công', message: 'Đã nạp 5 chuẩn quy trình dự án.', type: 'success' });
            fetchWorkflows();

        } catch (error: any) {
            console.error(error);
            addToast({ title: 'Lỗi khởi tạo', message: error.message, type: 'error' });
        } finally {
            setIsSeeding(false);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6 animate-fade-in relative z-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100 dark:bg-primary-900/20 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
                <div className="relative z-10 space-y-1">
                    <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
                        <Network size={24} className="animate-pulse" />
                        <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white uppercase font-display">
                            Hệ Thống Quy Trình ISO 9001
                        </h1>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Trung tâm điều phối & Quản trị luồng công việc tự động toàn Ban.</p>
                </div>
                
                <div className="relative z-10 flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition duration-200 shadow-sm">
                        <Settings size={18} />
                        Cài đặt chung
                    </button>
                    <button className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary-700 hover:shadow-lg hover:-translate-y-0.5 transition duration-200 shadow-md">
                        <Plus size={18} />
                        Tạo quy trình mới
                    </button>
                </div>
            </div>

            {selectedWorkflow ? (
                <div className="animate-fade-in space-y-4">
                    <div className="flex items-center justify-between">
                        <button 
                            onClick={() => setSelectedWorkflow(null)}
                            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-bold transition duration-200"
                        >
                            <ArrowLeft size={18} />
                            Quay lại danh sách
                        </button>
                        
                        <button 
                            onClick={() => openWorkflowSettings(selectedWorkflow)}
                            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition duration-200 shadow-sm border border-slate-200 dark:border-slate-700 text-sm"
                        >
                            <Settings size={16} />
                            Chi tiết & Cài đặt
                        </button>
                    </div>
                    
                    {isLoadingDetails ? (
                        <div className="flex justify-center items-center h-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="h-8 w-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="block h-[700px]">
                            <ISOFlowchartViewer
                                workflowName={selectedWorkflow.name}
                                nodes={workflowNodes.map(n => ({
                                    id: n.id,
                                    name: n.name,
                                    type: n.type,
                                    assignee_role: n.assignee_role || undefined,
                                    sla_formula: n.sla_formula || undefined,
                                }))}
                                edges={workflowEdges.map(e => ({
                                    source: e.source_node,
                                    target: e.target_node,
                                    condition: e.condition_expr || undefined,
                                }))}
                                onNodeClick={(node) => openNodeSettings(node.id)}
                            />
                        </div>
                    )}
                </div>
            ) : (
                <div className="animate-fade-in space-y-6">
                    {/* Error Message if migration hasn't run */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3 shadow-sm">
                            <AlertCircle size={40} className="text-red-500" />
                            <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Chưa tìm thấy cơ sở dữ liệu ISO Workflow</h3>
                            <p className="text-red-600 dark:text-red-300 max-w-lg text-sm">
                                {error}
                                <br/><br/>
                                Anh cần copy nội dung file SQL migration mà AI vừa cung cấp và chạy trong giao diện SQL Editor của Supabase để khởi tạo cấu trúc dữ liệu.
                            </p>
                        </div>
                    )}

                    {!error && !isLoading && workflows.length === 0 && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <FileText size={24} className="text-slate-400" />
                            </div>
                            <p className="text-lg font-bold text-slate-700 dark:text-slate-300">Chưa có quy trình ISO nào</p>
                            <p className="text-sm mt-1 mb-6 text-center max-w-md">Bắt đầu quá trình chuyển đổi số bằng cách tải 17 bước từ Sổ tay Hải Dương 2025.</p>
                            <button 
                                onClick={handleSeedISOWorkflows}
                                disabled={isSeeding}
                                className="flex items-center justify-center w-[300px] h-12 gap-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition duration-200 disabled:opacity-50">
                                {isSeeding ? (
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <DownloadCloud size={18} />
                                        Khởi tạo Dữ liệu Chuẩn
                                    </>
                                )}
                            </button>
                            <div className="mt-8 flex items-center gap-4">
                                 <div className="h-px w-12 bg-slate-200 dark:bg-slate-700"></div>
                                 <p className="text-xs uppercase tracking-wider font-bold text-slate-400 inline-block px-2">Hoặc thiết kế thủ công</p>
                                 <div className="h-px w-12 bg-slate-200 dark:bg-slate-700"></div>
                            </div>
                            <button className="flex items-center mt-6 gap-2 bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-400 px-5 py-2.5 rounded-xl font-bold hover:bg-primary-100 dark:hover:bg-primary-900/60 transition duration-200">
                                <Plus size={18} />
                                Tạo quy trình trắng mới
                            </button>
                        </div>
                    )}
                    
                    {!error && workflows.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                             {workflows.map(wf => (
                                 <div 
                                     key={wf.id} 
                                     onClick={() => handleViewDetails(wf)} 
                                     className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-transparent dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-primary-500/10 hover:border-primary-500 dark:hover:border-primary-500 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                                 >
                                     <div className="flex justify-between items-start mb-4">
                                         <div className="p-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg">
                                             <Network size={20} />
                                         </div>
                                         <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md">
                                             {wf.version}.0
                                         </span>
                                     </div>
                                     <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1 line-clamp-1">{wf.name}</h3>
                                     <p className="text-xs font-mono text-slate-400 mb-4">{wf.code}</p>
                                     <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{wf.description}</p>
                                     <div className="border-t border-slate-100 dark:border-slate-800 mt-5 pt-4 flex items-center justify-between text-xs font-bold">
                                         <span className="text-primary-600 dark:text-primary-400 uppercase tracking-widest">{wf.category}</span>
                                         <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Hoạt động</span>
                                     </div>
                                 </div>
                             ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ISOManagerPage;
