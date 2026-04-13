const fs = require('fs');
const pdf = require('pdf-parse');
let dataBuffer = fs.readFileSync('D:/QuocAnh/2026/01.Project/qlda-ddcn-hcm/resources/Quy che Ban/30-3-2026 Quy định che đô lam viêc của Ban DDCN.pdf');

pdf(dataBuffer).then(function(data) {
    fs.writeFileSync('D:/QuocAnh/2026/01.Project/qlda-ddcn-hcm/resources/Quy che Ban/quyche_extracted.md', data.text);
    console.log('Done extracting PDF');
    process.exit(0);
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
