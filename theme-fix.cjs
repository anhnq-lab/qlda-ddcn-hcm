const fs = require('fs');

const filesToFix = [
    'features/projects/components/tabs/ProjectComplianceTab.tsx',
    'features/projects/components/tabs/ProjectCapitalTab.tsx',
    'features/projects/components/tabs/ProjectBimTab.tsx',
    'features/projects/components/CreateProjectModal.tsx',
    'features/dashboard/PersonalDashboard.tsx',
    'features/contracts/ContractDetail.tsx',
    'features/legal-documents/components/LegalDetail.tsx',
    'features/legal-documents/components/LegalHeader.tsx',
    'features/legal-documents/components/LegalSidebar.tsx',
    'features/legal-documents/components/LegalUI.tsx',
    'features/workflows/WorkflowManagerPage.tsx',
    'features/cde/components/CDEContractorDashboard.tsx'
];

filesToFix.forEach(filePath => {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Dual explicit ones
    content = content.replace(/bg-white\s+dark:bg-slate-800/g, 'bg-[#FCF9F2] dark:bg-slate-800');
    content = content.replace(/bg-white\s+dark:bg-gray-800/g, 'bg-[#FCF9F2] dark:bg-slate-800');
    content = content.replace(/bg-white\s+dark:bg-slate-900/g, 'bg-[#FCF9F2] dark:bg-slate-900');
    content = content.replace(/bg-white\s+dark:bg-gray-900/g, 'bg-[#FCF9F2] dark:bg-slate-900');

    // Standalone bg-white (but not if followed by / like bg-white/50)
    // We only replace exact whole word `bg-white` inside strings
    content = content.replace(/(?!<[a-z0-9])\bbg-white(?!\/|-)/g, 'bg-[#FCF9F2] dark:bg-slate-800');

    // Replace typical muted backgrounds
    content = content.replace(/\bbg-gray-50\b(?!\/|-)/g, 'bg-[#F0ECE1] dark:bg-slate-900');
    content = content.replace(/\bhover:bg-gray-50\b(?!\/|-)/g, 'hover:bg-[#F0ECE1] dark:hover:bg-slate-700');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed:', filePath);
    }
});

console.log('THEME SANDPAPER COMPLETE');
