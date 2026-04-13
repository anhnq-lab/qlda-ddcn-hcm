const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '../resources', 'Quy che Ban', 'QuyCheLamViec_ChinhThuc.md');
const regPath = path.join(__dirname, '../features/regulations/Regulations.tsx');

let content = fs.readFileSync(inputFile, 'utf-8');

const chapters = [];
const seenChapterIds = new Set();
let currentChapter = null;
let currentArticle = null;
let isParsingRegulations = false;

const textLines = content.split('\n');

for (let i = 0; i < textLines.length; i++) {
  let line = textLines[i];
  let trimmedLine = line.trim();
  if (!trimmedLine) continue;
  
  const chapterMatch = trimmedLine.match(/^Chương\s+([IVXLCDM]+)$/i);
  const phuLucMatch = trimmedLine.match(/^PHỤ LỤC$/i);
  
  if (chapterMatch || phuLucMatch) {
    let chIdStr = phuLucMatch ? "PHỤ LỤC" : `CH${chapters.length + 1}`;
    let chCode = phuLucMatch ? "Phụ lục" : `Chương ${chapterMatch[1]}`;
    
    if (seenChapterIds.has(chCode)) {
      isParsingRegulations = true;
      if (currentArticle && currentChapter) {
        currentChapter.articles.push(currentArticle);
        currentArticle = null;
      }
      let j = i + 1;
      while(j < textLines.length) {
        if (textLines[j].trim() !== '') {
          i = j;
          break;
        }
        j++;
      }
      continue;
    }

    seenChapterIds.add(chCode);
    isParsingRegulations = true;
    
    if (currentArticle && currentChapter) {
       currentChapter.articles.push(currentArticle);
       currentArticle = null;
    }
    if (currentChapter) {
       chapters.push(currentChapter);
    }
    
    let title = "";
    let j = i + 1;
    while(j < textLines.length) {
      if (textLines[j].trim() !== '') {
        title = textLines[j].trim();
        i = j;
        break;
      }
      j++;
    }

    currentChapter = {
      id: chIdStr,
      code: chCode,
      title: title,
      articles: []
    };
    continue;
  }
  
  if (!isParsingRegulations) continue;

  const articleMatch = trimmedLine.match(/^Điều\s+(\d+)\.(.*)$/);
  const mauMatch = trimmedLine.match(/^Mẫu\s+(\d+)(.*)$/i);
  
  if (articleMatch || mauMatch) {
    if (currentArticle && currentChapter) {
      currentChapter.articles.push(currentArticle);
    }
    
    let aId, aCode, aTitle;
    if (mauMatch) {
      aId = `mau-${mauMatch[1]}`;
      aCode = `Mẫu ${mauMatch[1]}`;
      aTitle = mauMatch[2].trim() || `Mẫu ${mauMatch[1]}`;
    } else {
      let dNum = articleMatch[1].padStart(2, '0');
      let chNum = currentChapter.id.replace('CH', '').padStart(2, '0');
      aId = `${chNum}.${dNum}`;
      aCode = `Điều ${articleMatch[1]}`;
      aTitle = articleMatch[2].trim();
    }
    
    currentArticle = {
      id: aId,
      code: aCode,
      title: aTitle,
      content: []
    };
    continue;
  }
  
  if (currentArticle) {
    if (currentArticle.content.length > 0) {
      const isNewBullet = /^(?:[0-9]+\.|[a-zđ]\)|-|\+)/i.test(trimmedLine);
      if (!isNewBullet) {
        currentArticle.content[currentArticle.content.length - 1] += " " + trimmedLine;
      } else {
        currentArticle.content.push(trimmedLine);
      }
    } else {
      currentArticle.content.push(trimmedLine);
    }
  }
}

if (currentArticle && currentChapter) {
  currentChapter.articles.push(currentArticle);
}
if (currentChapter) {
  chapters.push(currentChapter);
}

// Get only CH8, CH9, Phu Luc
const appendedChapters = chapters.slice(7);

let appendTsx = ``;

appendedChapters.forEach((ch, idx) => {
    appendTsx += `    ,\n    {\n`;
    appendTsx += `        id: "${ch.id}",\n`;
    appendTsx += `        code: "${ch.code}",\n`;
    appendTsx += `        title: "${ch.title.replace(/"/g, '\\"')}",\n`;
    appendTsx += `        icon: FileText,\n`;
    appendTsx += `        articles: [\n`;
    
    ch.articles.forEach((art, aIdx) => {
        appendTsx += `            {\n`;
        appendTsx += `                id: "${art.id}",\n`;
        appendTsx += `                code: "${art.code}",\n`;
        appendTsx += `                title: "${art.title.replace(/"/g, '\\"')}",\n`;
        appendTsx += `                content: (\n`;
        appendTsx += `                    <div className="space-y-4 text-sm leading-relaxed text-gray-700">\n`;
        art.content.forEach(p => {
            appendTsx += `                        <p>${p.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>\n`;
        });
        appendTsx += `                    </div>\n`;
        appendTsx += `                )\n`;
        appendTsx += `            }${aIdx < ch.articles.length - 1 ? ',' : ''}\n`;
    });
    
    appendTsx += `        ]\n`;
    appendTsx += `    }\n`;
});

// Now, update Regulations.tsx
let regContent = fs.readFileSync(regPath, 'utf8');

// 1. Remove all dark: classes, fix missing spaces, etc.
regContent = regContent.replace(/\s*dark:[a-zA-Z0-9\-\/\[\]#]+\s*/g, ' ');
regContent = regContent.replace(/\s{2,}/g, ' ');

// 2. Fix hardcoded dark colors
regContent = regContent.replace(/bg-gray-800 text-white/g, 'bg-blue-50 text-blue-700 border border-blue-200');

// 3. Insert the new chapters right before the end of the array
const endOfArrayStr = `                    </div>\n                )\n            }\n        ]\n    }\n];`;
// Find exactly where the array ends.
// In the current Regulations.tsx, the very last article is 07.32 in CH7.
const searchStr = `                title: "Hiệu lực thi hành",\n                content: (\n                    <div className="space-y-4 text-sm leading-relaxed text-gray-700">\n                        <p>1. Giám đốc, các Phó Giám đốc, Trưởng, Phó các phòng làm việc, viên chức, người lao động thuộc Ban QLDA chịu trách nhiệm phổ biến và thi hành quy chế này.</p>\n                        <p>2. Trong quá trình thực hiện nếu có vấn đề chưa phù hợp hoặc phát sinh mới, được phép đề nghị, báo cáo để nghiên cứu sửa đổi, bổ sung cho phù hợp với tình hình thực tế.</p>\n                    </div>\n                )\n            }\n        ]\n    }\n];`;

if (regContent.includes(searchStr)) {
    // We just replace the very last `\n];` with `,` and add the appended chapters and then `];`
    const insertPoint = regContent.indexOf(searchStr) + searchStr.length - 3; // '];'.length = 2 + prepending newline = 3 maybe?
    // Let's just do a string replace:
    regContent = regContent.replace(
        "            }\n        ]\n    }\n];",
        "            }\n        ]\n    }" + appendTsx + "];"
    );
    console.log("Successfully appended new chapters!");
} else {
    // Try regex or fallback
    const match = regContent.match(/\s*\}\s*\]\s*\}\s*\];/);
    if (match) {
        regContent = regContent.slice(0, match.index) + "\n            }\n        ]\n    }" + appendTsx + "];\n";
        console.log("Appended via regex match");
    } else {
        console.log("Could not find the end of regulationsData array.");
    }
}

fs.writeFileSync(regPath, regContent);
console.log("Done fixing Regulations.tsx");
