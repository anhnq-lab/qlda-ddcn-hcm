const fs = require('fs');
const path = require('path');

const featuresDir = path.join(__dirname, 'features');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

let modifiedFiles = 0;

walkDir(featuresDir, function(filePath) {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf-8');
        let initialContent = content;

        // Replace p-6 or p-8 with p-4
        content = content.replace(/(?<=[\"\'\`\s])(p-6|p-8)(?=[\\\"\'\`\s])/g, 'p-4');

        // Replace heavy shadows with shadow-sm
        content = content.replace(/(?<=[\"\'\`\s])(shadow-lg|shadow-xl|shadow-2xl)(?=[\\\"\'\`\s])/g, 'shadow-sm');

        // Replace background white with Sand Theme #FCF9F2
        content = content.replace(/(?<=[\"\'\`\s])(bg-white)(?=[\\\"\'\`\s])/g, 'bg-[#FCF9F2]');

        if (content !== initialContent) {
           fs.writeFileSync(filePath, content, 'utf-8');
           console.log('Modified:', filePath);
           modifiedFiles++;
        }
    }
});

console.log(`\n\nComplete! Modified ${modifiedFiles} files.`);
