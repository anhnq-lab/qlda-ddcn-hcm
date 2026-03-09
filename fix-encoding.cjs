const fs = require('fs');
const files = [
    'd:/QuocAnh/2026/01.Project/qlda-ddcn-hcm/features/projects/components/tabs/ProjectPackagesTab.tsx',
    'd:/QuocAnh/2026/01.Project/qlda-ddcn-hcm/features/projects/components/BiddingPackageModal.tsx',
    'd:/QuocAnh/2026/01.Project/qlda-ddcn-hcm/features/projects/components/BiddingImportModal.tsx',
];

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');
    // Check if it looks double encoded
    if (content.includes('TÃ') || content.includes('gÃ³i') || content.includes('tháº§u')) {
        console.log(`Fixing double encoding for ${file}`);
        // We read the malformed UTF-8 as Latin-1 bytes, which recovers the original UTF-8 bytes
        const buffer = Buffer.from(content, 'latin1');
        fs.writeFileSync(file, buffer);
    } else {
        console.log(`No double encoding found in ${file}`);
    }
}
