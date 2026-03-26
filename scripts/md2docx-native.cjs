const fs = require('fs');
const { marked } = require('marked');
const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
    PageOrientation, LevelFormat, ExternalHyperlink
} = require('docx');

const sourcePath = 'C:\\Users\\Personal\\.gemini\\antigravity\\brain\\8ab10bcd-9129-49f7-a890-b5393d50c880\\bao_gia_qlda_2026.md';
const outputPath = 'd:\\QuocAnh\\2026\\01.Project\\qlda-ddcn-hcm\\Bao_Gia_CIC_QLDA_2026_Official_v3.docx';

const md = fs.readFileSync(sourcePath, 'utf8');
const tokens = marked.lexer(md);

// --- DESIGN TOKENS ---
const FONTS = { body: "Times New Roman", heading: "Times New Roman" };
const COLORS = {
    primaryDark: "1A2332",
    secondaryAccent: "2D8B8B",
    textMain: "1F2937",
    muted: "475569",
    tableBorder: "CBD5E1",
    zebra: "F4F8FA"
};
const SIZES = {
    body: 28, // 14pt
    h1: 36,   // 18pt
    h2: 32,   // 16pt
    h3: 28,   // 14pt
    h4: 26    // 13pt
};

// --- HELPER: Parse Text tokens into TextRuns ---
function parseInline(tokens, overrides = {}) {
    if (!tokens) return [];
    let runs = [];
    
    // Merge base styles with any generic overrides
    const baseStyle = { font: FONTS.body, size: SIZES.body, color: COLORS.textMain, ...overrides };

    tokens.forEach(t => {
        if (t.type === 'text' || t.type === 'escape') {
            runs.push(new TextRun({ ...baseStyle, text: t.text }));
        } else if (t.type === 'strong') {
            t.tokens.forEach(sub => {
                if(sub.type === 'text') {
                    runs.push(new TextRun({ ...baseStyle, text: sub.text, bold: true }));
                } else {
                    runs.push(new TextRun({ ...baseStyle, text: sub.raw || sub.text, bold: true }));
                }
            });
        } else if (t.type === 'em') {
            t.tokens.forEach(sub => {
                runs.push(new TextRun({ ...baseStyle, text: sub.text || sub.raw, italics: true, color: COLORS.muted }));
            });
        } else if (t.type === 'link') {
            runs.push(new ExternalHyperlink({
                children: [new TextRun({ ...baseStyle, text: t.text, style: "Hyperlink" })],
                link: t.href
            }));
        } else if (t.type === 'codespan') {
            runs.push(new TextRun({ text: t.text, font: "Consolas", size: 20, color: COLORS.secondaryAccent, shading: { type: ShadingType.CLEAR, fill: "F1F5F9" } }));
        } else if (t.type === 'br') {
            runs.push(new TextRun({ text: "", break: 1 }));
        } else {
            // fallback
            runs.push(new TextRun({ ...baseStyle, text: t.raw }));
        }
    });
    return runs;
}

function processTokens(tokens) {
    let children = [];
    let listCounter = 0;

    for (let t of tokens) {
        if (t.type === 'heading') {
            let hLevel = HeadingLevel.HEADING_1;
            let color = COLORS.primaryDark;
            let size = SIZES.h1;
            let alignment = AlignmentType.LEFT;
            
            if (t.depth === 1) { hLevel = HeadingLevel.HEADING_1; alignment = AlignmentType.CENTER; }
            if (t.depth === 2) { hLevel = HeadingLevel.HEADING_2; color = COLORS.secondaryAccent; size = SIZES.h2; }
            if (t.depth === 3) { hLevel = HeadingLevel.HEADING_3; size = SIZES.h3; }
            if (t.depth === 4) { hLevel = HeadingLevel.HEADING_4; size = SIZES.h4; color = COLORS.muted; }

            children.push(new Paragraph({
                heading: hLevel,
                alignment: alignment,
                spacing: { before: 240, after: 120 },
                children: [
                    new TextRun({
                        text: t.text,
                        font: FONTS.heading,
                        bold: true,
                        color: color,
                        size: size
                    })
                ]
            }));
        } 
        else if (t.type === 'paragraph') {
            let runs = parseInline(t.tokens);
            children.push(new Paragraph({
                children: runs,
                spacing: { after: 120, line: 360 }, // 1.5 line spacing
                alignment: AlignmentType.BOTH
            }));
        }
        else if (t.type === 'list') {
            t.items.forEach((item, index) => {
                let runs = parseInline(item.tokens[0].type === 'text' ? item.tokens[0].tokens : item.tokens);
                children.push(new Paragraph({
                    children: runs,
                    numbering: {
                        reference: t.ordered ? "numbers" : "bullets",
                        level: 0
                    },
                    spacing: { after: 60, line: 360 } // 1.5 line spacing
                }));
            });
        }
        else if (t.type === 'table') {
            const borders = {
                top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.tableBorder },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.tableBorder },
                left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.tableBorder },
                right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.tableBorder },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: COLORS.tableBorder },
                insideVertical: { style: BorderStyle.SINGLE, size: 1, color: COLORS.tableBorder }
            };

            const headerCells = t.header.map(h => {
                return new TableCell({
                    shading: { fill: COLORS.primaryDark, type: ShadingType.CLEAR },
                    margins: { top: 80, bottom: 80, left: 120, right: 120 },
                    children: [new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: parseInline(h.tokens, { color: "FFFFFF", bold: true })
                    })]
                });
            });

            const rows = [new TableRow({ children: headerCells, tableHeader: true })];

            t.rows.forEach((row, rIdx) => {
                const isZebra = rIdx % 2 !== 0; // 0 is first data row -> white, 1 is second data row -> zebra
                const rowCells = row.map((cell, cIdx) => {
                    return new TableCell({
                        shading: { fill: isZebra ? COLORS.zebra : "FFFFFF", type: ShadingType.CLEAR },
                        margins: { top: 80, bottom: 80, left: 120, right: 120 },
                        children: [new Paragraph({
                            alignment: t.align[cIdx] === 'center' ? AlignmentType.CENTER : (t.align[cIdx] === 'right' ? AlignmentType.RIGHT : AlignmentType.LEFT),
                            children: parseInline(cell.tokens)
                        })]
                    });
                });
                rows.push(new TableRow({ children: rowCells }));
            });

            // Handle width spreading based on column count (9360 DXA is content width)
            const numCols = t.header.length;
            const colWidths = Array(numCols).fill(Math.floor(9360 / numCols));
            // Adjust specifically if first col is STT
            if (t.header[0].text.includes('STT')) {
                colWidths[0] = 600;
                const rem = 9360 - 600;
                for(let i=1; i<numCols; i++) colWidths[i] = Math.floor(rem / (numCols-1));
            }

            children.push(new Table({
                width: { size: 9360, type: WidthType.DXA },
                columnWidths: colWidths,
                borders: borders,
                rows: rows
            }));
            children.push(new Paragraph({ text: "", spacing: { after: 240 } })); // Spacer
        }
        else if (t.type === 'blockquote') {
             children.push(new Paragraph({
                children: parseInline(t.tokens[0]?.tokens || []),
                shading: { fill: "F8FAFC", type: ShadingType.CLEAR },
                borders: { left: { style: BorderStyle.THICK, size: 24, color: COLORS.secondaryAccent, space: 10 } },
                spacing: { before: 120, after: 120 },
                indent: { left: 360 }
            }));
        }
        else if (t.type === 'hr') {
            // Handled mostly by space, ignore or just add space
        }
    }
    return children;
}

const docChildren = processTokens(tokens);

const doc = new Document({
    creator: "CIC AI",
    title: "BÁO GIÁ DỰ ÁN CIC-QLDA",
    styles: {
        paragraphStyles: [
            { id: "Normal", name: "Normal", run: { font: FONTS.body, size: SIZES.body, color: COLORS.textMain } },
            { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true },
            { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true },
            { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true }
        ]
    },
    numbering: {
        config: [
            { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
            { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }
        ]
    },
    sections: [{
        properties: {
            page: {
                size: { width: 12240, height: 15840 }, // US Letter
                margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 }
            }
        },
        children: docChildren
    }]
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync(outputPath, buffer);
    console.log("Successfully created DOCX native at:", outputPath);
}).catch(e => console.error(e));
