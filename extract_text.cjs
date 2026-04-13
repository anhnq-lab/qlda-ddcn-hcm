const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const docxPath = path.join(__dirname, 'resources/Phap luat/ND254.docx');

try {
    const zip = new AdmZip(docxPath);
    const contentXml = zip.readAsText('word/document.xml');
    
    // strip out all xml tags to get pure text
    let plainText = contentXml.replace(/<[^>]+>/g, '');
    let shortText = plainText.substring(0, 5000); // 5000 chars are enough for the first few forms
    
    console.log("-------------------");
    // Find "Mẫu"
    let index = 0;
    while((index = plainText.indexOf('M', index + 1)) !== -1) {
        let snippet = plainText.substring(index, index + 3);
        if (snippet === 'Mẫu' || snippet === 'Mau') {
             console.log("MATCH:", plainText.substring(index - 10, index + 30).trim());
        }
    }

} catch (e) {
    console.error("Error reading docx:", e);
}
