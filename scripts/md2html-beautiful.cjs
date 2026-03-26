const fs = require('fs');
const { marked } = require('marked');

const sourcePath = 'C:\\Users\\Personal\\.gemini\\antigravity\\brain\\8ab10bcd-9129-49f7-a890-b5393d50c880\\bao_gia_qlda_2026.md';
const outputPath = 'd:\\QuocAnh\\2026\\01.Project\\qlda-ddcn-hcm\\Bao_Gia_CIC_QLDA_2026_Pro.html';

const md = fs.readFileSync(sourcePath, 'utf8');

// Parse exactly the 12 modules into a structured object
// Assuming modules start with "#### Module" and are separated by "\n---\n"
let modules = [];
let otherContentBefore = [];
let otherContentAfter = [];
let captureMode = 'before'; // before, modules, after

const sections = md.split(/\n---\n/);

sections.forEach(sec => {
    if (sec.includes('#### Module')) {
        captureMode = 'modules';
        
        // Find module title
        const match = sec.match(/#### (Module[\s\S]*?)\n/);
        let title = match ? match[1].trim() : 'Module';
        
        let html = marked.parse(sec.replace(/#### Module.*/, ''));
        // style the table with PRO UI UX
        html = html.replace(/<table>/g, '<div class="overflow-x-auto rounded-xl border border-slate-200 shadow-sm"><table class="w-full text-left border-collapse bg-white">');
        html = html.replace(/<\/table>/g, '</table></div>');
        html = html.replace(/<thead>/g, '<thead class="bg-slate-50 text-slate-700 border-b border-slate-200">');
        html = html.replace(/<tr>/g, '<tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">');
        html = html.replace(/<th>/g, '<th class="py-3 px-4 font-semibold text-sm whitespace-nowrap">');
        html = html.replace(/<td>/g, '<td class="py-4 px-4 text-slate-600 text-sm align-top leading-relaxed">');

        modules.push({ title, html });
    } else {
        let html = marked.parse(sec);
         // style headings
        html = html.replace(/<h1>/g, '<h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 mb-8 text-center leading-tight tracking-tight">');
        html = html.replace(/<h2>/g, '<h2 class="text-2xl font-bold text-slate-800 mt-12 mb-6 pb-3 border-b border-slate-200 flex items-center gap-3"><span class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm">✦</span>');
        html = html.replace(/<h3>/g, '<h3 class="text-lg font-bold text-slate-900 mt-8 mb-4">');
        
        // style tables
        html = html.replace(/<table>/g, '<div class="overflow-x-auto rounded-xl border border-slate-200 shadow-sm my-8"><table class="w-full text-left border-collapse bg-white">');
        html = html.replace(/<\/table>/g, '</table></div>');
        html = html.replace(/<thead>/g, '<thead class="bg-slate-800 text-white border-b border-slate-800">');
        html = html.replace(/<tr(.*?)>/g, '<tr class="border-b border-slate-100 hover:bg-blue-50/50 transition-colors"$1>');
        html = html.replace(/<th>/g, '<th class="py-4 px-5 font-medium text-sm whitespace-nowrap tracking-wide">');
        html = html.replace(/<td>/g, '<td class="py-4 px-5 text-slate-700 text-sm align-middle">');

        // Blockquotes
        html = html.replace(/<blockquote>/g, '<div class="bg-blue-50/50 border-l-4 border-blue-500 p-5 rounded-r-xl my-6 text-slate-700 flex gap-4 items-start"><svg class="w-6 h-6 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><div class="text-sm leading-relaxed">');
        html = html.replace(/<\/blockquote>/g, '</div></div>');

        html = html.replace(/<p>/g, '<p class="text-slate-600 mb-4 leading-relaxed text-[15px]">');
        html = html.replace(/<ul>/g, '<ul class="list-none pl-1 mb-4 text-slate-600 space-y-3 text-[15px]">');
        html = html.replace(/<li>/g, '<li class="relative pl-6 before:content-[\'\'] before:absolute before:left-2 before:top-2.5 before:w-1.5 before:h-1.5 before:bg-blue-500 before:rounded-full">');
        html = html.replace(/<a>/g, '<a class="text-blue-600 hover:text-blue-700 font-medium underline decoration-blue-200 underline-offset-4 transition-all">');

        if (captureMode === 'before') {
            otherContentBefore.push(html);
        } else {
            otherContentAfter.push(html);
        }
    }
});


const fullHtml = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Báo Giá CIC-QLDA 2026</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Alpine.js for Interactivity -->
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        h1, h2, h3, h4, h5 { font-family: 'Outfit', sans-serif; }
        .glass-panel {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        /* Custom Scrollbar for Tabs */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        tr:hover td { background-color: #f8fafc; }
        thead tr:hover td, thead tr:hover th { background-color: transparent; }
    </style>
</head>
<body class="bg-slate-50 text-slate-800 antialiased selection:bg-blue-200 overflow-x-hidden">

    <!-- Hero Header -->
    <div class="relative bg-slate-900 text-white overflow-hidden">
        <!-- Abstract shapes -->
        <div class="absolute inset-0 opacity-20">
            <svg class="absolute left-0 top-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polygon fill="currentColor" points="0,0 100,0 100,100" class="text-slate-800"></polygon>
            </svg>
            <div class="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-500 blur-3xl opacity-30 mix-blend-multiply"></div>
            <div class="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-teal-500 blur-3xl opacity-30 mix-blend-multiply"></div>
        </div>
        
        <div class="relative max-w-6xl mx-auto px-6 py-24 text-center">
            <span class="inline-block py-1 px-3 rounded-full bg-blue-500/20 text-blue-300 text-sm font-semibold tracking-wider mb-6 border border-blue-500/30">HỒ SƠ ĐỀ XUẤT THƯƠNG MẠI</span>
            <h1 class="text-5xl md:text-6xl font-bold mb-6 tracking-tight text-white drop-shadow-lg">Phần mềm <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">CIC-QLDA</span></h1>
            <p class="text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">Giải pháp Quản lý Dự án Đầu tư Xây dựng toàn diện, tích hợp BIM & AI, đáp ứng 100% nghiệp vụ Ban QLDA chuyên nghiệp.</p>
        </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-16 relative z-10">
        
        <div class="glass-panel rounded-2xl shadow-xl p-8 md:p-12 mb-12">
            ${otherContentBefore.join('')}
        </div>

        <!-- Interactive Modules Section -->
        <div x-data="{ activeTab: 0 }" class="mb-16">
            <div class="text-center mb-10">
                <h2 class="text-3xl font-bold text-slate-900 mb-4">Chi tiết 12 Phân hệ Quản trị (Modules)</h2>
                <p class="text-slate-500 max-w-2xl mx-auto">Vui lòng chọn hệ thống phân hệ bên dưới để xem diễn giải tính năng chi tiết.</p>
            </div>

            <div class="flex flex-col lg:flex-row gap-8">
                <!-- Tabs Sidebar -->
                <div class="lg:w-1/3 shrink-0">
                    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-6">
                        <div class="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 flex items-center justify-between">
                            Danh sách Module
                            <span class="bg-blue-100 text-blue-700 py-0.5 px-2.5 rounded-full text-xs">12</span>
                        </div>
                        <div class="max-h-[600px] overflow-y-auto no-scrollbar p-2 space-y-1">
                            ${modules.map((m, idx) => `
                                <button 
                                    @click="activeTab = ${idx}" 
                                    :class="activeTab === ${idx} ? 'bg-blue-50 text-blue-700 border-blue-500' : 'text-slate-600 hover:bg-slate-50 border-transparent hover:text-slate-900'"
                                    class="w-full text-left px-4 py-3 rounded-lg border-l-4 text-sm font-medium transition-all duration-200 flex items-center justify-between group"
                                >
                                    <span class="truncate pr-2">${m.title}</span>
                                    <svg :class="activeTab === ${idx} ? 'opacity-100 text-blue-500' : 'opacity-0 group-hover:opacity-100 text-slate-400'" class="w-4 h-4 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Tab Content -->
                <div class="lg:w-2/3">
                    ${modules.map((m, idx) => `
                        <div 
                            x-show="activeTab === ${idx}" 
                            x-transition:enter="transition ease-out duration-300"
                            x-transition:enter-start="opacity-0 translate-y-4"
                            x-transition:enter-end="opacity-100 translate-y-0"
                            class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8"
                            style="display: none;"
                        >
                            <div class="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                                <div class="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">
                                    ${idx + 1}
                                </div>
                                <h3 class="text-xl font-bold text-slate-800">${m.title}</h3>
                            </div>
                            
                            <div class="overflow-x-auto rounded-lg border border-slate-200">
                                ${m.html}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <div class="glass-panel rounded-2xl shadow-xl p-8 md:p-12">
            ${otherContentAfter.join('')}
        </div>

    </main>

    <footer class="bg-slate-900 text-slate-400 py-12 text-center border-t border-slate-800">
        <p class="mb-2">Tài liệu Đề xuất Triển khai Hệ thống Tương tác</p>
        <p>&copy; 2026 Bản quyền thuộc về CIC.</p>
    </footer>

</body>
</html>
`;

fs.writeFileSync(outputPath, fullHtml);
console.log("Interactive Proposal created at: " + outputPath);
