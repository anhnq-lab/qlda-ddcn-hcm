const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function processFile(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Fix typical dual background definitions
    content = content.replace(/bg-white\s+dark:bg-slate-800/g, 'bg-[#FCF9F2] dark:bg-slate-800');
    content = content.replace(/bg-white\s+dark:bg-gray-800/g, 'bg-[#FCF9F2] dark:bg-slate-800');
    content = content.replace(/bg-white\s+dark:bg-slate-900/g, 'bg-[#FCF9F2] dark:bg-slate-900');
    content = content.replace(/bg-white\s+dark:bg-gray-900/g, 'bg-[#FCF9F2] dark:bg-slate-900');

    // Fix standalone bg-white, but exclude cases where we deliberately want true white like small badges or print sheets
    // Let's replace standalone bg-white in standard React className strings
    // E.g. className="bg-white p-4"
    const bgWhiteRegex = /(className=|className\s*:\s*)(["'`][^"'`]*?)\bbg-white\b([^"'`]*?["'`])/g;
    
    content = content.replace(bgWhiteRegex, (match, prefix, startString, endString) => {
         // If it already has a dark variant, we might have skipped it if it wasn't exact match
         if (endString.includes('dark:bg-') || startString.includes('dark:bg-')) {
             return prefix + startString.replace(/\bbg-white\b/g, 'bg-[#FCF9F2]') + endString;
         }
         // Otherwise, default inject the standard dark slate 800
         return prefix + startString.replace(/\bbg-white\b/g, 'bg-[#FCF9F2] dark:bg-slate-800') + endString;
    });

    // Also fix standard hover backgrounds hover:bg-white
    content = content.replace(/hover:bg-gray-50/g, 'hover:bg-[#FCF9F2]');
    content = content.replace(/bg-gray-50/g, 'bg-[#F0ECE1]'); // F0ECE1 is our muted sand

    // High Density Spacing fixes for generic cards
    // if it contains `p-6` and `rounded` we convert to `p-4`
    const p6Regex = /(className=|className\s*:\s*)(["'`][^"'`]*?)\bp-6\b([^"'`]*?rounded[^"'`]*?["'`])/g;
    content = content.replace(p6Regex, (match, prefix, startString, endString) => {
        return prefix + startString + 'p-4' + endString;
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed:', filePath);
    }
}

walkDir('./features', processFile);
console.log('THEME UNIFICATION COMPLETE');
