import React, { useState, useMemo } from 'react';
import { BookOpen, Search, ChevronRight, Gavel, CheckCircle2, Share2, MoreHorizontal, MessageSquare, User, Send, Info } from 'lucide-react';
import { regulationsData } from './regulationsData';

const Regulations: React.FC = () => {
    const [selectedChapterId, setSelectedChapterId] = useState<string>("chuong-ii");
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCommentId, setActiveCommentId] = useState<string | null>(null);

    const formatCode = (id: string) => id.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase());

    const selectedChapter = regulationsData.find(c => c.id === selectedChapterId);

    const filteredChapters = useMemo(() => {
        if (!searchQuery) return regulationsData;
        return regulationsData.filter(c =>
            c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.articles.some(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [searchQuery]);

    return (
        <div className="flex h-[calc(100vh-100px)] bg-[#FCF9F2] dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden font-sans">

            {/* LEFT SIDEBAR - NAVIGATION */}
            <div className="w-80 bg-[#F5EFE6] dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col">
                <div className="p-5 border-b border-gray-200 dark:border-slate-700 bg-[#FCF9F2] dark:bg-slate-800">
                    <h2 className="text-lg font-black text-gray-800 dark:text-slate-100 tracking-tight mb-4 flex items-center gap-2">
                        <Gavel className="w-5 h-5 text-blue-600" />
                        Quy chế Nội bộ
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm điều khoản, quy định..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-[#F5EFE6] dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
                    {filteredChapters.map(chapter => (
                        <button
                            key={chapter.id}
                            onClick={() => setSelectedChapterId(chapter.id)}
                            className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 group ${selectedChapterId === chapter.id
                                ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 shadow-sm'
                                : 'hover:bg-gray-100 dark:hover:bg-slate-700 border border-transparent'
                                }`}
                        >
                            <div className={`mt-0.5 p-2 rounded-lg ${selectedChapterId === chapter.id ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-slate-600 text-gray-500 dark:text-slate-400 group-hover:bg-[#FCF9F2] dark:group-hover:bg-[#F5EFE6]0'}`}>
                                {chapter.icon ? <chapter.icon className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${selectedChapterId === chapter.id ? 'text-blue-600' : 'text-gray-400'}`}>
                                    {formatCode(chapter.id)}
                                </p>
                                <p className={`text-sm font-bold truncate ${selectedChapterId === chapter.id ? 'text-gray-900 dark:text-slate-100' : 'text-gray-600 dark:text-slate-400'}`}>
                                    {chapter.title}
                                </p>
                            </div>
                            {selectedChapterId === chapter.id && <ChevronRight className="w-4 h-4 text-blue-600 self-center" />}
                        </button>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-[#F5EFE6] dark:bg-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 text-emerald-700 rounded-full">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-bold text-gray-500 dark:text-slate-500 uppercase">Văn bản hiện hành</p>
                            <p className="text-xs font-bold text-gray-800 dark:text-slate-200">QĐ số 188/QĐ-BQLDA</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT CONTENT - DETAILS */}
            <div className="flex-1 flex flex-col bg-[#FCF9F2] dark:bg-slate-800 overflow-hidden relative">
                {/* Header */}
                <div className="h-16 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-8 bg-[#FCF9F2] dark:bg-slate-800 shrink-0 z-10 sticky top-0">
                    <div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500 mb-1">
                            <span>Hệ thống Quy chế</span>
                            <ChevronRight className="w-3 h-3" />
                            <span className="font-bold text-blue-600 uppercase">{selectedChapter ? formatCode(selectedChapter.id) : ''}</span>
                        </div>
                        <h1 className="text-lg font-black text-gray-900 dark:text-slate-100 uppercase tracking-tight">{selectedChapter?.title}</h1>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-all" title="Chia sẻ"><Share2 className="w-5 h-5" /></button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-all" title="Tùy chọn"><MoreHorizontal className="w-5 h-5" /></button>
                    </div>
                </div>

                {/* Content Scroll Area */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#F5EFE6] dark:bg-slate-900">
                    <div className="max-w-6xl mx-auto space-y-6 pb-20">
                        {selectedChapter?.articles.map((article, idx) => (
                            <div key={idx} id={article.id} className="group relative transition-all duration-500 animate-in slide-in-from-bottom-2">
                                {/* Article Header Badge */}
                                <div className="flex items-center gap-3 mb-3 ml-1">
                                    <span className="bg-gray-800 text-white text-[10px] font-black px-2 py-1 rounded shadow-sm uppercase tracking-widest whitespace-nowrap">
                                        {formatCode(article.id)}
                                    </span>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">{article.title}</h3>
                                </div>

                                {/* Content Card */}
                                <div className="bg-[#FCF9F2] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow relative">


                                    {/* Dynamic Content Rendering */}
                                    <div className="text-[15px] text-slate-800 dark:text-slate-200 leading-[1.8] space-y-4 tracking-[-0.01em]">
                                        {article.content.map((item, i) => (
                                            typeof item === 'string' ? (
                                                <p key={i} className="text-justify font-medium">{item}</p>
                                            ) : (
                                                <div key={i} className="my-8">{item}</div>
                                            )
                                        ))}
                                    </div>


                                </div>
                            </div>
                        ))}

                        {/* Footer Notes */}
                        {selectedChapter?.id === 'chuong-ii' && (
                            <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl text-xs text-yellow-800 flex items-start gap-3">
                                <Info className="w-5 h-5 text-primary-600 shrink-0" />
                                <div>
                                    <p className="font-bold mb-1">Lưu ý về cơ cấu tổ chức:</p>
                                    <p>Sơ đồ trên thể hiện mối quan hệ báo cáo trực tiếp. Các phòng ban có trách nhiệm phối hợp ngang hàng để giải quyết công việc chung của Ban QLDA.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Regulations;
