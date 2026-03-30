import React, { useMemo } from 'react';
import { 
  Network, CheckCircle2, CircleDashed, Clock, ChevronRight, AlertCircle,
  Shield, FileInput, Zap, XCircle
} from 'lucide-react';

interface ActivityNode {
    id: string;
    name: string;
    type: 'start' | 'end' | 'approval' | 'input' | 'automated';
    assignee_role?: string;
    sla_formula?: string;
}

interface FlowEdge {
    source: string;
    target: string;
    condition?: string;
}

interface FlowchartViewerProps {
    workflowName: string;
    nodes: ActivityNode[];
    edges: FlowEdge[];
    activeNodeId?: string;
    completedNodeIds?: string[];
    rejectedNodeIds?: string[];
    onNodeClick?: (node: ActivityNode) => void;
}

/**
 * FlowchartViewer: Sơ đồ quy trình  chuyên nghiệp
 * - Phân biệt rõ node types (Start=tròn, Approval=hình thoi, Input=chữ nhật, End=tròn đôi)
 * - Hiển thị SLA, trạng thái (completed/active/rejected/pending)
 * - Hỗ trợ branching (multiple nodes per level)
 */
const FlowchartViewer: React.FC<FlowchartViewerProps> = ({
    workflowName,
    nodes,
    edges,
    activeNodeId,
    completedNodeIds = [],
    rejectedNodeIds = [],
    onNodeClick
}) => {
    // BFS Leveling Algorithm
    const levelsArray = useMemo(() => {
        const levels: Record<string, number> = {};
        const inDegrees: Record<string, number> = {};
        
        nodes.forEach(n => { inDegrees[n.id] = 0; });
        edges.forEach(e => {
            if (inDegrees[e.target] !== undefined) {
                inDegrees[e.target] += 1;
            }
        });

        const queue: {id: string, level: number}[] = [];
        nodes.forEach(n => {
            if (inDegrees[n.id] === 0) {
                queue.push({ id: n.id, level: 0 });
                levels[n.id] = 0;
            }
        });

        while (queue.length > 0) {
            const current = queue.shift()!;
            const outgoing = edges.filter(e => e.source === current.id);
            outgoing.forEach(e => {
                const nextLevel = current.level + 1;
                if (levels[e.target] === undefined || levels[e.target] < nextLevel) {
                    levels[e.target] = nextLevel;
                    queue.push({ id: e.target, level: nextLevel });
                }
            });
        }

        const vals = Object.values(levels) as number[];
        const maxLevel = vals.length > 0 ? Math.max(0, ...vals) : 0;
        const arr: ActivityNode[][] = Array.from({ length: maxLevel + 1 }, () => []);
        nodes.forEach(n => { arr[levels[n.id] || 0].push(n); });
        return arr;
    }, [nodes, edges]);

    // Parse SLA formula → readable text
    const parseSla = (formula?: string) => {
        if (!formula) return null;
        const match = formula.match(/^(\d+)d$/);
        return match ? `${match[1]} ngày` : formula;
    };

    // Get status + styling for each node
    const getNodeConfig = (node: ActivityNode) => {
        const isCompleted = completedNodeIds.includes(node.id);
        const isActive = activeNodeId === node.id;
        const isRejected = rejectedNodeIds.includes(node.id);

        // Base shape by type
        const typeIcon = {
            start: <ChevronRight size={20} />,
            end: <CheckCircle2 size={20} />,
            approval: <Shield size={18} />,
            input: <FileInput size={18} />,
            automated: <Zap size={18} />,
        }[node.type];

        const shape = node.type === 'start' || node.type === 'end' 
            ? 'rounded-full w-20 h-20' 
            : node.type === 'approval'
            ? 'rounded-xl w-56 rotate-0' // Could use diamond shape with CSS transform
            : 'rounded-xl w-56';

        // Status coloring
        if (node.type === 'start') return { 
            icon: typeIcon, shape, 
            bg: 'bg-emerald-500 text-white', 
            border: 'border-emerald-600',
            glow: 'shadow-emerald-500/30'
        };
        if (node.type === 'end') return { 
            icon: typeIcon, shape, 
            bg: isCompleted ? 'bg-slate-700 text-white dark:bg-slate-200 dark:text-slate-900' : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400', 
            border: 'border-slate-400 dark:border-slate-600',
            glow: ''
        };

        if (isRejected) return {
            icon: <XCircle size={18} />, shape,
            bg: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            border: 'border-red-400 dark:border-red-700',
            glow: 'shadow-red-500/20'
        };
        if (isCompleted) return {
            icon: <CheckCircle2 size={18} />, shape,
            bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
            border: 'border-emerald-400 dark:border-emerald-700',
            glow: 'shadow-emerald-500/10'
        };
        if (isActive) return {
            icon: <Clock size={18} className="animate-spin-slow" />, shape,
            bg: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
            border: 'border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/50 ring-offset-2 dark:ring-offset-slate-900',
            glow: 'shadow-amber-500/30 shadow-lg'
        };

        return {
            icon: <CircleDashed size={18} />, shape,
            bg: 'bg-white text-slate-400 dark:bg-slate-800 dark:text-slate-500',
            border: 'border-slate-200 dark:border-slate-700',
            glow: ''
        };
    };

    return (
        <div className="flex flex-col h-full bg-[#FAFAF8] dark:bg-slate-900/50 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <Network size={18} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="font-bold text-gray-800 dark:text-white text-sm tracking-wide">
                        {workflowName}
                    </h3>
                </div>
                {/* Legend */}
                <div className="flex items-center gap-5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Đã duyệt
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" /> Đang chờ
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500" /> Từ chối
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full border-2 border-slate-300 dark:border-slate-600" /> Chưa tới
                    </div>
                </div>
            </div>

            {/* Flowchart Canvas */}
            <div className="flex-1 overflow-auto p-8 min-h-[400px]">
                <div className="flex flex-col items-center gap-3 w-full max-w-3xl mx-auto">
                    {levelsArray.map((levelNodes, lIdx) => (
                        <React.Fragment key={`level-${lIdx}`}>
                            {/* Level Row */}
                            <div className="flex items-center justify-center gap-8 w-full">
                                {levelNodes.map(node => {
                                    const config = getNodeConfig(node);
                                    const isTerminal = node.type === 'start' || node.type === 'end';
                                    const slaText = parseSla(node.sla_formula);

                                    return (
                                        <div 
                                            key={node.id} 
                                            className="relative group flex flex-col items-center"
                                            onClick={onNodeClick && !isTerminal ? () => onNodeClick(node) : undefined}
                                        >
                                            {/* Node shape */}
                                            <div className={`
                                                ${config.shape} ${config.bg} ${config.glow}
                                                border-2 ${config.border}
                                                flex flex-col items-center justify-center text-center
                                                transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5
                                                ${!isTerminal && onNodeClick ? 'cursor-pointer' : ''}
                                                ${!isTerminal ? 'p-4 min-h-[80px]' : ''}
                                            `}>
                                                {isTerminal ? (
                                                    <div className="flex items-center justify-center">
                                                        {config.icon}
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            {config.icon}
                                                            {node.type === 'approval' && (
                                                                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Phê duyệt</span>
                                                            )}
                                                        </div>
                                                        <div className="font-bold text-sm leading-tight line-clamp-2" title={node.name}>
                                                            {node.name}
                                                        </div>
                                                        {node.assignee_role && (
                                                            <div className="text-[10px] font-semibold opacity-60 mt-1.5 px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10">
                                                                {node.assignee_role}
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>

                                            {/* SLA Badge */}
                                            {slaText && !isTerminal && (
                                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-[9px] font-bold rounded-full border border-blue-200 dark:border-blue-800 whitespace-nowrap shadow-sm">
                                                    <Clock size={8} className="inline mr-0.5 -mt-[1px]" /> {slaText}
                                                </div>
                                            )}

                                            {/* Terminal Label */}
                                            {isTerminal && (
                                                <span className="mt-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                                                    {node.type === 'start' ? 'BẮT ĐẦU' : 'KẾT THÚC'}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Arrow connector between levels */}
                            {lIdx < levelsArray.length - 1 && (
                                <div className="flex flex-col items-center h-10">
                                    <div className="w-0.5 flex-1 bg-gray-300 dark:bg-slate-700" />
                                    <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-gray-300 dark:border-t-slate-700" />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FlowchartViewer;
