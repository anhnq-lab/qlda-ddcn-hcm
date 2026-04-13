const fs = require('fs');
const path = require('path');

const regPath = path.join(__dirname, '../features/regulations/Regulations.tsx');
let regContent = fs.readFileSync(regPath, 'utf8');

// The exported regulationsData.tsx is available in features/regulations/regulationsData.tsx
const newDataPath = path.join(__dirname, '../features/regulations/regulationsData.tsx');
let newDataContent = fs.readFileSync(newDataPath, 'utf8');

// Extract the array from newDataContent
// It starts with 'export const regulationsData = [' and ends with '];'
const arrayStart = newDataContent.indexOf('export const regulationsData = [');
const newArray = newDataContent.substring(arrayStart).replace('export const regulationsData = [', 'const regulationsData: Chapter[] = [');

// Now find the original array in Regulations.tsx
// It starts with 'const regulationsData: Chapter[] = [' and ends right before 'const Regulations: React.FC'
const oldArrayStart = regContent.indexOf('const regulationsData: Chapter[] = [');
const oldArrayEndMatch = regContent.match(/\];\s*const Regulations: React\.FC/);

if (oldArrayStart !== -1 && oldArrayEndMatch) {
    const oldArrayEnd = oldArrayEndMatch.index + 2; // right after '];'
    const newRegContent = regContent.substring(0, oldArrayStart) + newArray.trim() + '\n\n' + regContent.substring(oldArrayEndMatch.index + 3).trimStart();
    fs.writeFileSync(regPath, newRegContent);
    console.log("Successfully replaced the entire regulationsData array.");
} else {
    console.log("Could not find the old array boundaries.");
}
