import React from 'react';
import { FolderTree, Building2, Upload, Loader2, FileText, Clock, Share2, CheckCircle2 } from 'lucide-react';
import type { CDEStats } from '../types';

interface CDEHeaderProps {
    projects: Array<{ ProjectID: string; ProjectName: string }>;
    selectedProjectId: string;
    onProjectChange: (id: string) => void;
    stats: CDEStats | undefined;
    onUpload: () => void;
    isUploading: boolean;
    canUpload: boolean;
    userRole?: string;
    hideStats?: boolean;
}

const CDEHeader: React.FC<CDEHeaderProps> = ({
    projects, selectedProjectId, onProjectChange, stats, onUpload, isUploading, canUpload, userRole, hideStats,
}) => {
    const statCards = [
        { label: 'Tổng hồ sơ', value: stats?.total || 0, icon: FileText, className: 'stat-card-slate' },
        { label: 'Đang xử lý', value: stats?.wip || 0, icon: Clock, className: 'stat-card-amber' },
        { label: 'Đang xét duyệt', value: stats?.shared || 0, icon: Share2, className: 'stat-card-blue' },
        { label: 'Đã phê duyệt', value: stats?.published || 0, icon: CheckCircle2, className: 'stat-card-emerald' },
    ];

    return (
        <div className="flex-none mb-6">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" >
                            <FolderTree className="w-5 h-5 text-white" />
                        </div>
                        Môi trường dữ liệu chung
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 ml-[52px]">
                        CDE — Common Data Environment (ISO 19650)
                        {userRole && <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded-full uppercase">{userRole}</span>}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 flex items-center gap-3 min-w-[320px]">
                        <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        <select
                            value={selectedProjectId}
                            onChange={(e) => onProjectChange(e.target.value)}
                            className="flex-1 text-sm font-semibold text-gray-800 dark:text-slate-200 outline-none bg-transparent cursor-pointer truncate"
                        >
                            {projects.map(p => (
                                <option key={p.ProjectID} value={p.ProjectID}>{p.ProjectName}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={onUpload}
                        disabled={!canUpload || isUploading}
                        className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        
                    >
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        Nộp hồ sơ
                    </button>
                </div>
            </div>

            {!hideStats && (
                <div className="grid grid-cols-4 gap-4">
                    {statCards.map((stat, idx) => (
                        <div key={idx} className={`relative overflow-hidden rounded-2xl p-5 shadow-xl text-white hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 stat-card ${stat.className}`}>
                            <stat.icon className="absolute -right-3 -top-3 w-20 h-20 text-white opacity-[0.12]" />
                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-white/90 mb-1">{stat.label}</p>
                                    <p className="text-3xl font-black tracking-tight text-white drop-shadow-sm">{stat.value}</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                    <stat.icon className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CDEHeader;
