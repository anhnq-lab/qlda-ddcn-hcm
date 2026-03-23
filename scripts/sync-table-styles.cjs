const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

function syncStyles(filePath) {
    if (!filePath.endsWith('.tsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace <thead className="...">
    content = content.replace(/<thead([^>]*)className="([^"]+)"/g, (match, p1, classes) => {
        let newClasses = classes
            .replace(/\bbg-gray-50\b/g, 'bg-slate-50')
            .replace(/\bbg-gray-100\b/g, 'bg-slate-100')
            .replace(/\bdark:bg-slate-700\/50\b/g, 'dark:bg-slate-800')
            .replace(/\bdark:bg-slate-700\b/g, 'dark:bg-slate-800')
            .replace(/\btext-gray-500\b/g, 'text-slate-500')
            .replace(/\bdark:border-slate-600\b/g, 'dark:border-slate-700')
            .replace(/\bborder-gray-200\b/g, 'border-slate-200');
            
        // ensure uppercase text-xs font-bold or whatever is preserved, but we can also inject border-b if missing
        // Wait, if border-b is not there, we just add it to make it look like cic-erp-contract
        if (!newClasses.includes('border-b')) {
            newClasses += ' border-b border-slate-200 dark:border-slate-700';
        }

        return `<thead${p1}className="${newClasses}"`;
    });

    // Replace <th className="...">
    content = content.replace(/<th([^>]*)className="([^"]+)"/g, (match, p1, classes) => {
        let newClasses = classes
            .replace(/\btext-gray-500\b/g, 'text-slate-500')
            .replace(/\btext-gray-600\b/g, 'text-slate-600')
            .replace(/\bbg-gray-50\b/g, 'bg-slate-50')
            .replace(/\bdark:bg-slate-700\/50\b/g, 'dark:bg-slate-800');
            
        return `<th${p1}className="${newClasses}"`;
    });
    
    // Replace sidebar styles in ProjectList and ContractList if they contain bg-white dark:bg-slate-800
    if (filePath.includes('ProjectList.tsx') || filePath.includes('ContractList.tsx')) {
        content = content.replace(/text-gray-400 dark:text-slate-500/g, 'text-slate-500 dark:text-slate-400')
                         .replace(/border-gray-200/g, 'border-slate-200')
                         .replace(/border-gray-50/g, 'border-slate-100')
                         .replace(/bg-gray-50/g, 'bg-slate-50')
                         .replace(/text-gray-800/g, 'text-slate-800')
                         .replace(/text-gray-600/g, 'text-slate-600')
                         .replace(/hover:bg-gray-50/g, 'hover:bg-slate-50')
                         .replace(/bg-gray-100/g, 'bg-slate-100')
                         .replace(/text-gray-500/g, 'text-slate-500');
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated tables in: ${filePath}`);
    }
}

walk('d:/01_Projects/qlda-ddcn-hcm/features', syncStyles);
console.log('Table styles sync completed.');
