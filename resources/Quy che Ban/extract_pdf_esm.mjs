import fs from 'fs';
import PDFParser from 'pdf2json';

const pdfParser = new PDFParser(this, 1);

pdfParser.on("pdfParser_dataError", errData => {
    console.error(errData.parserError);
    process.exit(1);
});

pdfParser.on("pdfParser_dataReady", pdfData => {
    fs.writeFileSync('D:/QuocAnh/2026/01.Project/qlda-ddcn-hcm/resources/Quy che Ban/quyche_extracted.md', pdfParser.getRawTextContent());
    console.log("PDF extraction successful!");
    process.exit(0);
});

pdfParser.loadPDF('D:/QuocAnh/2026/01.Project/qlda-ddcn-hcm/resources/Quy che Ban/30-3-2026 Quy định che đô lam viêc của Ban DDCN.pdf');
