import React from 'react';
import { CheckSquare, XSquare, FolderInput, Trash2, X } from 'lucide-react';
import type { CDEDocument } from '../types';

interface CDEBatchActionsProps {
    selectedIds: number[];
    docs: CDEDocument[];
    onApprove: (ids: number[]) => void;
    onReject: (ids: number[]) => void;
    onMove: (ids: number[], folderId: string) => void;
    onClearSelection: () => void;
}

const CDEBatchActions: React.FC<CDEBatchActionsProps> = ({
    selectedIds, docs, onApprove, onReject, onMove, onClearSelection,
}) => {
    if (selectedIds.length === 0) return null;

    return (
        <div className="sticky top-0 z-20 animate-in slide-in-from-top-2 duration-300">
            <div className="bg-primary-600 text-white rounded-xl shadow-xl shadow-primary-200 dark:shadow-primary-900/30 px-4 py-2.5 flex items-center gap-3">
                {/* Count */}
                <div className="flex items-center gap-2 pr-3 border-r border-white/20">
                    <span className="bg-white/20 text-white text-xs font-black w-7 h-7 rounded-lg flex items-center justify-center">
                        {selectedIds.length}
                    </span>
                    <span className="text-xs font-bold text-white/90">đã chọn</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => onApprove(selectedIds)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-xs font-bold transition-all shadow-lg"
                    >
                        <CheckSquare className="w-3.5 h-3.5" /> Duyệt
                    </button>
                    <button
                        onClick={() => onReject(selectedIds)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-xs font-bold transition-all shadow-lg"
                    >
                        <XSquare className="w-3.5 h-3.5" /> Từ chối
                    </button>
                    <button
                        onClick={() => {
                            const targetFolder = prompt('Nhập ID thư mục đích:');
                            if (targetFolder) onMove(selectedIds, targetFolder);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-lg text-xs font-bold transition-all"
                    >
                        <FolderInput className="w-3.5 h-3.5" /> Di chuyển
                    </button>
                </div>

                {/* Clear */}
                <button
                    onClick={onClearSelection}
                    className="ml-auto flex items-center gap-1 text-white/70 hover:text-white text-xs font-bold transition-colors"
                >
                    <X className="w-3.5 h-3.5" /> Bỏ chọn
                </button>
            </div>
        </div>
    );
};

export default CDEBatchActions;
