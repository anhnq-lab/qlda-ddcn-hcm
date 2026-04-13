const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const docxPath = path.join(__dirname, 'resources/Phap luat/ND254.docx');

try {
    const zip = new AdmZip(docxPath);
    const contentXml = zip.readAsText('word/document.xml');
    
    // strip out all xml tags to get pure text
    let plainText = contentXml.replace(/<[^>]+>/g, '');
    
    // print out first 2000 characters
    console.log(plainText.substring(0, 2000));
    
    // find all occurrences of "M" and print context
    let index = 0;
    while((index = plainText.indexOf('M', index + 1)) !== -1) {
        if (plainText.substring(index, index + 3) === 'Mẫu' || plainText.substring(index, index + 3) === 'Mau') {
             console.log("MATCH:", plainText.substring(index - 10, index + 30));
        }
    }
    
    console.log("-------------------");
    // Find numbers 2 to 9
    for (let i = 2; i <= 9; i++) {
        let idx = plainText.indexOf('số ' + i);
        if (idx !== -1) {
             console.log(`Found 'số ${i}':`, plainText.substring(idx - 20, idx + 20));
        }
        let doubleZero = 'số 0' + i;
        idx = plainText.indexOf(doubleZero);
        if (idx !== -1) {
             console.log(`Found '${doubleZero}':`, plainText.substring(idx - 20, idx + 20));
        }
    }

} catch (e) {
    console.error("Error reading docx:", e);
}
