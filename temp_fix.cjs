const fs = require('fs');
let c = fs.readFileSync('resources/Quy che Ban/quyche_extracted.md', 'utf8');

const fixes = [
  ['Điều  6. Trách  nhiệm  và  quyền  hạn giải  quyết  công  việc của  các Phó', 'Giám đốc'],
  ['Điều 7. Trách nhiệm và quyền hạn giải quyết công việc của các Trưởng', 'phòng, ban thuộc Ban Dân dụng và Công nghiệp'],
  ['Điều  8.  Trách  nhiệm  và  quyền  hạn giải  quyết  công  việc của  các Phó', 'Trưởng phòng, ban thuộc Ban Dân dụng và Công nghiệp'],
  ['Điều 9. Trách nhiệm và quy ền hạn giải quyết công việc của Kế toán', 'trưởng'],
  ['Điều 10. Trách nhiệm và quyền hạn giải quyết công việc của Giám đốc', 'quản lý dự án.'],
  ['Điều 11. Trách nhiệm và quyền hạn giải quyết công việc của viên chức', 'và người lao động'],
  ['Điều 12. Mối quan hệ với Hội đồng nhân dân Thành phố, Ủy ban nhân', 'dân Thành phố.'],
  ['Điều 18. Mối quan hệ giữa Phó Trưởng phòng, ban với viên chức, người', 'lao động'],
  ['Điều 21. Theo dõi và đánh giá kết quả thực hiện chương trình, kế hoạch', 'công tác'],
  ['Điều 36. Chế độ bảo mật, in sao, lưu trữ công văn tài liệu và sử dụng', 'con dấu']
];

for (const [l1, l2] of fixes) {
    const esc1 = l1.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const esc2 = l2.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // allow any amount of spaces and a newline between them
    const regex = new RegExp(esc1 + '\\s*\\r?\\n\\s*' + esc2, 'g');
    c = c.replace(regex, l1 + ' ' + l2);
}

fs.writeFileSync('resources/Quy che Ban/quyche_extracted.md', c);
console.log('Done fixing extracted file!');
