const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '../resources', 'Quy che Ban', 'QuyCheLamViec_ChinhThuc.md');
const outputFile = path.join(__dirname, '../features/regulations/regulationsData.tsx');

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


let appendTsx = `import React from 'react';\n`;
appendTsx += `import { BookOpen, Scale, FileText, Gavel, CheckCircle2, AlertTriangle, Info, Clock, Users, Shield, FileCheck, RefreshCw } from 'lucide-react';\n`;
appendTsx += `import { SubmissionProcessChart, OrgChart, ResponsibilityList } from './Regulations';\n\n`;

appendTsx += `export const regulationsData = [\n`;

chapters.forEach((ch, idx) => {
    appendTsx += `    {\n`;
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
        
        let hasSpc = false;
        let pIndex = 0;
        art.content.forEach(p => {
            // Check if special component
            pIndex++;
            if (ch.code === "Chương IV" && art.code === "Điều 10" && pIndex === 1) {
                 appendTsx += `                        <p>${p.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>\n`;
                 appendTsx += `                        <div className="my-6 p-6 bg-slate-50 border border-slate-200 rounded-xl">\n`;
                 appendTsx += `                            <h4 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">\n`;
                 appendTsx += `                                <RefreshCw className="w-4 h-4 text-blue-600" />\n`;
                 appendTsx += `                                Sơ đồ Quy trình trình, ký văn bản\n`;
                 appendTsx += `                            </h4>\n`;
                 appendTsx += `                            <SubmissionProcessChart />\n`;
                 appendTsx += `                        </div>\n`;
            } 
            else if (ch.code === "Chương II" && art.code === "Điều 2" && pIndex === 1) {
                 appendTsx += `                        <p>${p.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>\n`;
                 appendTsx += `                        <OrgChart />\n`;
            }
            else {
                 appendTsx += `                        <p>${p.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>\n`;
            }
        });
        appendTsx += `                    </div>\n`;
        appendTsx += `                )\n`;
        appendTsx += `            }${aIdx < ch.articles.length - 1 ? ',' : ''}\n`;
    });
    
    appendTsx += `        ]\n`;
    appendTsx += `    }${idx < chapters.length - 1 ? ',' : ''}\n`;
});

appendTsx += `];\n`;

fs.writeFileSync(outputFile, appendTsx);
console.log("Written to regulationsData.tsx");
