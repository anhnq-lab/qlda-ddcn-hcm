const fs = require('fs');
const content = fs.readFileSync('resources/Quy che Ban/QuyCheLamViec_ChinhThuc.md', 'utf-8');
const lines = content.split('\n');
const chapters = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].toLowerCase().includes('chương')) {
    console.log(`Line ${i + 1}: ${lines[i].trim()}`);
  }
}
