const fs = require('fs');
const file = 'D:/QuocAnh/2026/01.Project/qlda-ddcn-hcm/features/regulations/Regulations.tsx';
let data = fs.readFileSync(file, 'utf8');

// 1. Remove duplicate formatCode (which I accidentally added earlier)
data = data.replace(/const formatCode = \(id: string\) => id\.replace\('-', ' '\)\.replace\(\/\\b\\w\/g, c => c\.toUpperCase\(\)\);\r?\n\r?\n    const formatCode = \(id: string\) => id\.replace\('-', ' '\)\.replace\(\/\\b\\w\/g, c => c\.toUpperCase\(\)\);/, 
    "const formatCode = (id: string) => id.replace('-', ' ').replace(/\\b\\w/g, c => c.toUpperCase());");

// 2. chapter.code -> formatCode(chapter.id)
data = data.replace(/\{chapter\.code\}/g, '{formatCode(chapter.id)}');

// 3. selectedChapter?.code -> selectedChapter ? formatCode(selectedChapter.id) : ''
data = data.replace(/\{selectedChapter\?\.code\}/g, "{selectedChapter ? formatCode(selectedChapter.id) : ''}");

// 4. article.code -> formatCode(article.id)
data = data.replace(/\{article\.code\}/g, '{formatCode(article.id)}');

// 5. Replace Action Buttons and Comments Rendering completely
const oldContentRender = `{/* Action Buttons */}
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                        <button
                                            onClick={() => setActiveCommentId(activeCommentId === article.id ? null : article.id)}
                                            className={\`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all text-xs font-bold \${activeCommentId === article.id ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'bg-[#F5EFE6] dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-600'}\`}
                                        >
                                            <MessageSquare className="w-3.5 h-3.5" />
                                            {article.comments?.length || 0} Thảo luận
                                        </button>
                                    </div>

                                    {/* Dynamic Content Rendering */}
                                    <div className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                                        {typeof article.content === 'string' ? (
                                            article.content.split('\\n').map((line, i) => <p key={i} className="mb-2">{line}</p>)
                                        ) : (
                                            article.content
                                        )}
                                    </div>

                                    {/* Comments Section */}
                                    {(activeCommentId === article.id) && (
                                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700 animate-in fade-in">
                                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Thảo luận nội bộ</h4>

                                            <div className="space-y-4 mb-4">
                                                {article.comments?.map(comment => (
                                                    <div key={comment.id} className="flex gap-3 items-start">
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                                                            {comment.user.charAt(0)}
                                                        </div>
                                                        <div className="bg-[#F5EFE6] dark:bg-slate-700 rounded-2xl rounded-tl-none p-3 flex-1">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="text-xs font-bold text-gray-800 dark:text-slate-100">{comment.user}</span>
                                                                <span className="text-[10px] text-gray-400">{comment.date}</span>
                                                            </div>
                                                            <p className="text-xs text-gray-600">{comment.content}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!article.comments || article.comments.length === 0) && (
                                                    <p className="text-xs text-gray-400 italic text-center py-2">Chưa có thảo luận nào.</p>
                                                )}
                                            </div>

                                            {/* Add Comment Input */}
                                            <div className="flex gap-3 items-center mt-4">
                                                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white shrink-0">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 relative">
                                                    <input
                                                        type="text"
                                                        placeholder="Viết ý kiến đóng góp..."
                                                        className="w-full pl-4 pr-10 py-2.5 bg-[#F5EFE6] dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
                                                    />
                                                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                                                        <Send className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}`

const newContentRender = `{/* Action Buttons */}
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                        <button
                                            onClick={() => setActiveCommentId(activeCommentId === article.id ? null : article.id)}
                                            className={\`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all text-xs font-bold \${activeCommentId === article.id ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'bg-[#F5EFE6] dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-600'}\`}
                                        >
                                            <MessageSquare className="w-3.5 h-3.5" />
                                            0 Thảo luận
                                        </button>
                                    </div>

                                    {/* Dynamic Content Rendering */}
                                    <div className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed space-y-3">
                                        {article.content.map((item, i) => (
                                            typeof item === 'string' ? (
                                                <p key={i} className="text-justify">{item}</p>
                                            ) : (
                                                <div key={i} className="my-6">{item}</div>
                                            )
                                        ))}
                                    </div>

                                    {/* Comments Section */}
                                    {(activeCommentId === article.id) && (
                                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700 animate-in fade-in">
                                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Thảo luận nội bộ</h4>

                                            <div className="space-y-4 mb-4">
                                                <p className="text-xs text-gray-400 italic text-center py-2">Chưa có thảo luận nào.</p>
                                            </div>

                                            {/* Add Comment Input */}
                                            <div className="flex gap-3 items-center mt-4">
                                                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white shrink-0">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 relative">
                                                    <input
                                                        type="text"
                                                        placeholder="Viết ý kiến đóng góp..."
                                                        className="w-full pl-4 pr-10 py-2.5 bg-[#F5EFE6] dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
                                                    />
                                                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                                                        <Send className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}`

// Normalize line endings to avoid \r\n vs \n issues
const normalize = (str) => str.replace(/\r\n/g, '\\n');
data = normalize(data).replace(normalize(oldContentRender), newContentRender);

// 6. chapter.type -> selectedChapter?.id === 'chuong-ii'
data = data.replace(/\{selectedChapter\?\.type === 'chart' && \(/, "{selectedChapter?.id === 'chuong-ii' && (");

fs.writeFileSync(file, data);
console.log('Finished patching Regulations.tsx!');
