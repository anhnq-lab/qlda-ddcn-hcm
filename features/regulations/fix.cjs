const fs = require('fs');
let content = fs.readFileSync('features/regulations/Regulations.tsx', 'utf8');

// Fix Chapters IDs
content = content.replace(/id: \"CH1\",\s*code: \"Chương II\",/g, 'id: \"CH2\",\n        code: \"Chương II\",');
content = content.replace(/id: \"CH2\",\s*code: \"Chương III\",/g, 'id: \"CH3\",\n        code: \"Chương III\",');
content = content.replace(/id: \"CH3\",\s*code: \"Chương IV\",/g, 'id: \"CH4\",\n        code: \"Chương IV\",');
content = content.replace(/id: \"CH4\",\s*code: \"Chương V\",/g, 'id: \"CH5\",\n        code: \"Chương V\",');
content = content.replace(/id: \"CH5\",\s*code: \"Chương VI\",/g, 'id: \"CH6\",\n        code: \"Chương VI\",');
content = content.replace(/id: \"CH6\",\s*code: \"Chương VII\",/g, 'id: \"CH7\",\n        code: \"Chương VII\",');
content = content.replace(/id: \"CH7\",\s*code: \"Chương VIII\",/g, 'id: \"CH8\",\n        code: \"Chương VIII\",');
content = content.replace(/id: \"CH8\",\s*code: \"Chương IX\",/g, 'id: \"CH9\",\n        code: \"Chương IX\",');

// Fix default state
content = content.replace(/useState<string>\(\"CH2\"\)/g, 'useState<string>(\"CH1\")');

// Fix components dark modes
content = content.replace(/bg-white border border-gray-200 px-6 py-2 rounded-lg shadow-sm text-center/g, 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-6 py-2 rounded-lg shadow-sm text-center');
content = content.replace(/bg-blue-50 border border-blue-200/g, 'bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800/50');
content = content.replace(/bg-emerald-50 border border-emerald-200/g, 'bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800/50');
content = content.replace(/bg-purple-50 border border-purple-200/g, 'bg-purple-50 dark:bg-purple-900/40 border border-purple-200 dark:border-purple-800/50');

content = content.replace(/className=\"rounded-lg px-4 py-2 text-center border\" style={{ background: '#FEFCE8', borderColor: '#F0D68A' }}/g, 'className=\"rounded-lg px-4 py-2 text-center border bg-yellow-50 dark:bg-amber-900/30 border-yellow-200 dark:border-amber-800/50\"');
content = content.replace(/style={{ color: '#B8860B' }}/g, 'className=\"text-yellow-700 dark:text-amber-500\"');
content = content.replace(/style={{ color: '#D4A017' }}/g, 'className=\"text-yellow-600 dark:text-amber-600\"');

content = content.replace(/bg-gray-100 text-gray-600 border-gray-200/g, 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700');
content = content.replace(/bg-orange-50 text-orange-600 border-orange-200/g, 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800/50');

content = content.replace(/bg-white p-4 rounded-xl border border-gray-200/g, 'bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700');
content = content.replace(/bg-white border-l border-b border-gray-200/g, 'bg-white dark:bg-slate-800 border-l border-b border-gray-200 dark:border-slate-700');

content = content.replace(/bg-gray-300 -translate-x-1\/2/g, 'bg-gray-300 dark:bg-slate-700 -translate-x-1/2');
content = content.replace(/h-px bg-gray-300/g, 'h-px bg-gray-300 dark:bg-slate-700');
content = content.replace(/bg-gray-200 border-l border-dashed border-gray-300/g, 'bg-gray-200 dark:bg-slate-800 border-l border-dashed border-gray-300 dark:border-slate-700');

content = content.replace(/<div className=\"w-2 h-2 bg-white rounded-full absolute -bottom-1 left-1\/2 -translate-x-1\/2\"><\/div>/g, '<div className=\"w-2 h-2 bg-white dark:bg-slate-800 rounded-full absolute -bottom-1 left-1/2 -translate-x-1/2\"></div>');

fs.writeFileSync('features/regulations/Regulations.tsx', content);
console.log('Replacements completed.');
