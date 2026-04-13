const fs = require('fs'); 
const content = fs.readFileSync('features/regulations/regulationsData.tsx', 'utf8'); 
const titles = content.match(/title: "(.*?)"/g);
if (titles) {
    const chapters = titles.filter(s => s.includes('Chương') || s.includes('PHỤ LỤC'));
    console.log("Found chapters:", chapters);
} else {
    console.log("No titles matched.");
}
