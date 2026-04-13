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

// 1. Remove dark: classes without messing up layout
regContent = regContent.replace(/\bdark:[a-zA-Z0-9\-\/\[\]#]+\b/g, '');

// 2. Fix hardcoded dark colors
regContent = regContent.replace(/bg-gray-800 text-white/g, 'bg-blue-50 text-blue-700 border border-blue-200');

// 3. Insert the new chapters right before the end of the array
// We find "];\n\nconst Regulations: React.FC = () => {"
const endOfArrayMatch = regContent.indexOf("];\n\nconst Regulations: React.FC = () => {");
if (endOfArrayMatch !== -1) {
    regContent = regContent.substring(0, endOfArrayMatch) + appendTsx + "];\n\nconst Regulations: React.FC = () => {" + regContent.substring(endOfArrayMatch + 41);
    console.log("Successfully appended new chapters!");
} else {
    // try different spacing
    const match = regContent.match(/\];\n+(const Regulations|export default)/);
    if (match) {
        regContent = regContent.substring(0, match.index) + appendTsx + regContent.substring(match.index);
        console.log("Successfully appended new chapters (fallback regex)!");
    } else {
        console.log("Could not find the end of regulationsData array.");
    }
}

fs.writeFileSync(regPath, regContent);
console.log("Done fixing Regulations.tsx");
