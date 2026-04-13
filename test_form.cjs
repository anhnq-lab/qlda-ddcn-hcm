const fs = require('fs');
const lines = fs.readFileSync('resources/Quy che Ban/quyche_extracted.md', 'utf8').split('\n');
const startIndex = lines.findIndex(l => l.includes('BAN QUẢN LÝ DỰ ÁN ĐẦU TƯ'));
if (startIndex !== -1) {
  console.log(lines.slice(Math.max(0, startIndex - 5), Math.min(lines.length, startIndex + 30)).join('\n'));
} else {
  console.log('Not found BAN QUAN LY DU AN');
  const fallback = lines.findIndex(l => l.includes('Mẫu số'));
  if (fallback !== -1) console.log(lines.slice(Math.max(0, fallback - 5), fallback + 20).join('\n'));
}
