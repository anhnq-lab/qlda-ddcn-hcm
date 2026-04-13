const fs = require('fs');
const path = require('path');

const regPath = path.join(__dirname, '../features/regulations/Regulations.tsx');
let content = fs.readFileSync(regPath, 'utf8');

// 1. Remove all dark: classes
content = content.replace(/dark:[^\s"']+/g, '');
// Clean up double spaces left by removal
content = content.replace(/\s{2,}/g, ' ');

// 2. Fix hardcoded dark colors
content = content.replace(/bg-gray-800 text-white/g, 'bg-blue-50 text-blue-700 border border-blue-200');

// 3. Append Chapter 8, 9, and Phu Luc
// First, extract them from regulationsData.tsx (which we generated earlier)
const dataPath = path.join(__dirname, '../features/regulations/regulationsData.tsx');
const dataContent = fs.readFileSync(dataPath, 'utf8');

// Find chuong-viii and beyond
const ch8Match = dataContent.indexOf('id: "chuong-viii"');
if (ch8Match !== -1) {
    // Extract the raw object strings using some careful parsing or regex
    // Since we know the structure, let's just do it manually in JS
    const ch89phulucRaw = dataContent.substring(ch8Match - 15, dataContent.lastIndexOf(']') - 1);
    
    // We need to transform the raw format from regulationsData.tsx to the format in Regulations.tsx
    // regulationsData.tsx format: 
    // { id: "chuong-viii", title: "Chương VIII: QUẢN LÝ VĂN BẢN...", icon: ..., articles: [ { id: "dieu-33", title: "Điều 33...", content: [ "...", "..." ] } ] }
    // Regulations.tsx format:
    // { id: "CH8", code: "Chương VIII", title: "QUẢN LÝ VĂN BẢN...", icon: FileText, articles: [ { id: "08.33", code: "Điều 33", title: "Xử lý văn bản đến", content: <div className="space-y-4 text-sm leading-relaxed text-gray-700"><p>...</p></div> } ] }

    // Let's execute the data file using a hack to extract the actual object
    // Wait, the data file contains JSX and lucide imports. We can't simply require it.
}

console.log("We need to construct it carefully!");
