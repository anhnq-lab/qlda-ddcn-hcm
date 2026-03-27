const fs = require('fs');
const file = 'd:/QuocAnh/2026/01.Project/qlda-ddcn-hcm/features/projects/components/CreateProjectModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove members tab
content = content.replace(
    "    { id: 'members', label: 'Thành viên dự án', icon: Users },\r\n",
    ""
);

// 2. Filter employees
const filteredBlockOld = `    const filteredEmployees = employees.filter(e =>\r\n        e.FullName.toLowerCase().includes(memberSearch.toLowerCase()) ||\r\n        e.Department.toLowerCase().includes(memberSearch.toLowerCase())\r\n    );\r\n\r\n    const groupedEmployees = filteredEmployees.reduce((acc, emp) => {\r\n        const dept = emp.Department || 'Khác';`;
const filteredBlockNew = `    const filteredEmployees = employees.filter(e => {\r\n        const dept = e.Department || 'Khác';\r\n        const isSearchMatch = e.FullName.toLowerCase().includes(memberSearch.toLowerCase()) ||\r\n                              dept.toLowerCase().includes(memberSearch.toLowerCase());\r\n        const matchOtherBan = dept.match(/Ban.*([1-5])/i);\r\n        const currentBan = String(formData.ManagementBoard);\r\n        const isOtherBan = matchOtherBan && currentBan !== '0' && matchOtherBan[1] !== currentBan;\r\n        return isSearchMatch && !isOtherBan;\r\n    });\r\n\r\n    const groupedEmployees = filteredEmployees.reduce((acc, emp) => {\r\n        const dept = emp.Department || 'Khác';`;
content = content.replace(filteredBlockOld, filteredBlockNew);

// 3. Extract the members UI block
const membersStartStr = "                    {/* ═══ SECTION 4: Thành viên dự án ═══ */}\r\n                    {activeTab === 'members' && (\r\n                    <div className=\"space-y-6 animate-in fade-in duration-300\">\r\n                        <SectionHeader icon={Users} title=\"Thành viên dự án\" subtitle=\"Chọn nhân sự tham gia quản lý dự án\" />";
const membersEndStr = "                        )}\r\n                    </div>\r\n                    )}";

const startIdx = content.indexOf(membersStartStr);
const endIdx = content.indexOf(membersEndStr, startIdx) + membersEndStr.length;

if (startIdx === -1 || endIdx === -1) {
    console.error('Members block not found');
    process.exit(1);
}

const membersBlock = content.substring(startIdx, endIdx);

// Modify membersblock to remove the conditional and change section header
let editedMembersBlock = membersBlock.replace(
    "                    {/* ═══ SECTION 4: Thành viên dự án ═══ */}\r\n                    {activeTab === 'members' && (\r\n                    <div className=\"space-y-6 animate-in fade-in duration-300\">\r\n                        <SectionHeader icon={Users} title=\"Thành viên dự án\" subtitle=\"Chọn nhân sự tham gia quản lý dự án\" />",
    "                        {/* Thành viên dự án */}\r\n                        <div className=\"mt-8 pt-6 border-t border-gray-100 dark:border-slate-700/50\">\r\n                            <div className=\"flex items-center gap-2 mb-4\">\r\n                                <Users className=\"w-5 h-5 text-blue-500\" />\r\n                                <div>\r\n                                    <h4 className=\"text-sm font-semibold text-gray-800 dark:text-slate-100\">Thành viên dự án</h4>\r\n                                    <p className=\"text-xs text-gray-500 dark:text-slate-400\">Chọn nhân sự tham gia quản lý dự án</p>\r\n                                </div>\r\n                            </div>"
);
editedMembersBlock = editedMembersBlock.replace(
    "                    </div>\r\n                    )}",
    "                    </div>"
);

// Remove from old location
content = content.substring(0, startIdx) + content.substring(endIdx);

// Insert into general tab
const generalEndStr = "                            Nhóm dự án tự động áp dụng thời gian chuẩn theo Luật ĐTC\r\n                        </p>\r\n                    </div>\r\n                    )}";
content = content.replace(generalEndStr, generalEndStr.replace("                    </div>\r\n                    )}", editedMembersBlock + "\r\n                    </div>\r\n                    )}"));


fs.writeFileSync(file, content);
console.log('Success!');
