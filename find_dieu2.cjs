const fs = require('fs');
const lines = fs.readFileSync('resources/Quy che Ban/quyche_extracted.md', 'utf8').split('\n');
lines.forEach((l, i) => { if (l.includes('Điều 2')) console.log(i+1, l.trim()); });
