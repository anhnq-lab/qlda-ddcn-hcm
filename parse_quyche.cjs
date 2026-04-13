const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'resources', 'Quy che Ban', 'quyche_extracted.md');
const outputFileMd = path.join(__dirname, 'resources', 'Quy che Ban', 'QuyCheLamViec_ChinhThuc.md');
const outputFileTsx = path.join(__dirname, 'features', 'regulations', 'regulationsData.tsx');

let content = fs.readFileSync(inputFile, 'utf-8');

// 1. Clean up page breaks and numbers
const lines = content.split('\n');
const cleanedLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].replace(/\r$/, '');
  
  if (line.match(/^-+Page \(\d+\) Break-+$/)) {
    // Skip this line and the next line if it's just a number
    if (i + 1 < lines.length && lines[i+1].trim().match(/^\d+$/)) {
      i++; // skip the page number
      // Often there are empty lines after the page number
      while(i + 1 < lines.length && lines[i+1].trim() === '') {
        i++;
      }
    }
    continue;
  }
  
  cleanedLines.push(line);
}

// Rejoin and fix strange spacing
let cleanedContent = cleanedLines.join('\n');
fs.writeFileSync(outputFileMd, cleanedContent);
console.log("Cleaned MD created at " + outputFileMd);

// Now parse into Chapters and Articles
const chapters = [];
const seenChapterIds = new Set();
let currentChapter = null;
let currentArticle = null;
let isParsingRegulations = false;

const textLines = cleanedContent.split('\n');

for (let i = 0; i < textLines.length; i++) {
  let line = textLines[i];
  let trimmedLine = line.trim();
  
  if (!trimmedLine) continue;
  
  // Chapter match
  const chapterMatch = trimmedLine.match(/^Chương\s+([IVXLCDM]+)$/i);
  const phuLucMatch = trimmedLine.match(/^PHỤ LỤC$/i);
  
  if (chapterMatch || phuLucMatch) {
    let chIdStr = phuLucMatch ? "phuluc" : `chuong-${chapterMatch[1].toLowerCase()}`;
    let chDisplayTitle = phuLucMatch ? "Phụ lục:" : `Chương ${chapterMatch[1]}:`;
    
    if (seenChapterIds.has(chIdStr)) {
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

    seenChapterIds.add(chIdStr);
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
      title: `${chDisplayTitle} ${title}`,
      articles: []
    };
    continue;
  }
  
  if (!isParsingRegulations) continue;

  // Article match
  const articleMatch = trimmedLine.match(/^Điều\s+(\d+)\.(.*)$/);
  const mauMatch = trimmedLine.match(/^Mẫu\s+(\d+)(.*)$/i);
  
  if (articleMatch || mauMatch) {
    if (currentArticle && currentChapter) {
      currentChapter.articles.push(currentArticle);
    }
    
    let aId, aTitle;
    if (mauMatch) {
      aId = `mau-${mauMatch[1]}`;
      aTitle = `Mẫu ${mauMatch[1]}${mauMatch[2]}`;
    } else {
      aId = `dieu-${articleMatch[1]}`;
      aTitle = `Điều ${articleMatch[1]}.${articleMatch[2]}`;
    }
    
    currentArticle = {
      id: aId,
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

// Ensure the UI components are preserved for specific chapters and articles
let tsxContent = `import React from 'react';
import { Book, Users, Shield, Activity, FileText, Clock, CheckCircle, Zap } from 'lucide-react';
import { ResponsibilityList } from './components';

export interface Comment {
  author: string;
  avatar: string;
  text: string;
  time: string;
}

export interface Article {
  id: string;
  title: string;
  content: (string | React.ReactNode)[];
  comments?: Comment[];
}

export interface Chapter {
  id: string;
  title: string;
  icon: any;
  articles: Article[];
}

export const getIconForChapter = (chapterNum: string) => {
  switch(chapterNum) {
    case 'chuong-i': return Book;
    case 'chuong-ii': return Users;
    case 'chuong-iii': return Shield;
    case 'chuong-iv': return Activity;
    case 'chuong-v': return FileText;
    case 'chuong-vi': return Clock;
    case 'chuong-vii': return CheckCircle;
    case 'phuluc': return FileText;
    default: return Book;
  }
};

export const regulationsData = [\n`;

chapters.forEach((chapter, index) => {
  tsxContent += `  {\n`;
  tsxContent += `    id: ${JSON.stringify(chapter.id)},\n`;
  tsxContent += `    title: ${JSON.stringify(chapter.title)},\n`;
  tsxContent += `    icon: getIconForChapter('${chapter.id}'),\n`;
  tsxContent += `    articles: [\n`;
  
  chapter.articles.forEach((article, aIndex) => {
    tsxContent += `      {\n`;
    tsxContent += `        id: ${JSON.stringify(article.id)},\n`;
    tsxContent += `        title: ${JSON.stringify(article.title)},\n`;
    tsxContent += `        content: [\n`;
    
    // Custom injections based on existing UI




    // Output paragraphs
    article.content.forEach((line) => {
      tsxContent += `          ${JSON.stringify(line)},\n`;
    });

    tsxContent += `        ]\n`;
    tsxContent += `      }${aIndex < chapter.articles.length - 1 ? ',' : ''}\n`;
  });
  
  tsxContent += `    ]\n`;
  tsxContent += `  }${index < chapters.length - 1 ? ',' : ''}\n`;
});

tsxContent += `];\n`;

fs.writeFileSync(outputFileTsx, tsxContent);
console.log("TSX data created at " + outputFileTsx + " with " + chapters.length + " chapters.");
