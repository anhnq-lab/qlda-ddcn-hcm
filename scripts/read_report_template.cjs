const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, '..', 'resources', 'Báo cáo hoạt động đấu thầu');
const files = fs.readdirSync(dir);
const xlsxFile = files.find(f => f.endsWith('.xlsx') && !f.startsWith('~$'));

const wb = XLSX.readFile(path.join(dir, xlsxFile));
let output = '';
output += `File: ${xlsxFile}\n`;
output += `Sheet names: ${JSON.stringify(wb.SheetNames)}\n\n`;

wb.SheetNames.forEach(name => {
  const ws = wb.Sheets[name];
  output += `========== Sheet: "${name}" ==========\n`;
  output += `Range: ${ws['!ref']}\n`;
  
  if (ws['!merges']) {
    output += `Merged cells: ${ws['!merges'].length}\n`;
  }

  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false });
  output += `Total rows: ${data.length}\n\n`;
  
  for (let i = 0; i < Math.min(data.length, 40); i++) {
    const row = data[i];
    const lastIdx = row.reduce((last, cell, idx) => cell !== '' ? idx : last, -1);
    if (lastIdx >= 0) {
      const trimmed = row.slice(0, lastIdx + 1).map(c => String(c).replace(/\r?\n/g, ' '));
      output += `R${i}: ${JSON.stringify(trimmed)}\n`;
    }
  }
  output += '\n';
});

fs.writeFileSync(path.resolve(__dirname, 'excel_output.txt'), output, 'utf8');
console.log('Done! Output saved to scripts/excel_output.txt');
