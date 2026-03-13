// Seed all missing data via Supabase REST API
const https = require('https');

const BASE = 'gyuxymbmbfvvygvcyyrd.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5dXh5bWJtYmZ2dnlndmN5eXJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMzQ3NDcsImV4cCI6MjA4ODYxMDc0N30.EGxnvkq5RooWMi1J9xmHhosTChIoPv-3uhU0p6YYYcQ';

function post(table, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const req = https.request({
      hostname: BASE, path: `/rest/v1/${table}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': KEY, 'Authorization': `Bearer ${KEY}`,
        'Prefer': 'resolution=ignore-duplicates,return=minimal'
      }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode >= 400) reject(`${table}: ${res.statusCode} ${d}`);
        else resolve(`${table}: ${res.statusCode} OK`);
      });
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

const PROJECTS = [
  'DA-BV-DK-HOC-MON','DA-BV-NHI-DONG-2','DA-BV-NTP-KHU-C',
  'DA-BV-PHCN-A2','DA-DONG-Y-DONG-DUOC','DA-NGAN-HANG-MAU','DA-SVD-THONG-NHAT'
];

async function main() {
  console.log('=== SEEDING ALL DATA ===\n');

  // 1. USER ACCOUNTS
  console.log('1. User Accounts...');
  const accounts = [];
  for (let i = 1; i <= 43; i++) {
    const id = `NV${String(i).padStart(3,'0')}`;
    const uname = `user${String(i).padStart(3,'0')}`;
    accounts.push({ employee_id: id, username: uname, password_hash: '123456', is_active: true });
  }
  // Override specific usernames for leadership
  accounts[0].username = 'Admin';
  accounts[1].username = 'TRUONG.NV';
  accounts[2].username = 'THUY.DM';
  accounts[3].username = 'DUNG.LV';
  try { console.log(await post('user_accounts', accounts)); } catch(e) { console.error(e); }

  // 2. CONTRACTORS
  console.log('\n2. Contractors...');
  const contractors = [
    { contractor_id:'NT001', full_name:'Công ty CP Xây dựng Hòa Bình', tax_code:'0302129537', address:'235 Lý Chính Thắng, Q.3, TP.HCM', representative:'Lê Viết Hải', established_year:1987, is_foreign:false },
    { contractor_id:'NT002', full_name:'Tổng Công ty Xây dựng Số 1 (CC1)', tax_code:'0300385887', address:'111A Pasteur, Q.1, TP.HCM', representative:'Nguyễn Văn Cường', established_year:1979, is_foreign:false },
    { contractor_id:'NT003', full_name:'Công ty CP Đầu tư XD Ricons', tax_code:'0312121905', address:'36-38 Bến Vân Đồn, Q.4, TP.HCM', representative:'Trần Quyết Thắng', established_year:2004, is_foreign:false },
    { contractor_id:'NT004', full_name:'Công ty TNHH Obayashi Việt Nam', tax_code:'0302489632', address:'Lầu 18 Vietcombank Tower, Q.1, TP.HCM', representative:'Takeshi Yamamoto', established_year:1994, is_foreign:true },
    { contractor_id:'NT005', full_name:'Công ty CP Tư vấn XD Tổng hợp NAGECCO', tax_code:'0301446851', address:'82 Nguyễn Du, Q.1, TP.HCM', representative:'Phạm Minh Đức', established_year:1985, is_foreign:false },
    { contractor_id:'NT006', full_name:'Công ty CP Tư vấn Thiết kế VNCC', tax_code:'0100150857', address:'389 Đội Cấn, Hà Nội', representative:'Trần Thanh Bình', established_year:1964, is_foreign:false },
    { contractor_id:'NT007', full_name:'Viện KHCN Xây dựng (IBST)', tax_code:'0101655501', address:'81 Trần Cung, Hà Nội', representative:'Nguyễn Đại Minh', established_year:1963, is_foreign:false },
    { contractor_id:'NT008', full_name:'Công ty CP Giám sát & QLDA Conteccons', tax_code:'0315547890', address:'72 Lê Thánh Tôn, Q.1, TP.HCM', representative:'Võ Thanh Liêm', established_year:2010, is_foreign:false },
  ];
  try { console.log(await post('contractors', contractors)); } catch(e) { console.error(e); }

  // 3. BIDDING PACKAGES
  console.log('\n3. Bidding Packages...');
  const packages = [];
  PROJECTS.forEach((pid, pi) => {
    const base = (pi+1) * 100e9; // base price
    packages.push(
      { package_id:`GT-${pid}-XL01`, project_id:pid, package_number:`XL-01`, package_name:`Xây lắp chính - ${pid.replace('DA-','')}`, price:base*0.6, status: pi<3?'completed':'approved', bid_type:'Xây lắp', selection_method:'Đấu thầu rộng rãi', field:'Xây lắp', capital_source:'NSTP', duration:'18 tháng' },
      { package_id:`GT-${pid}-TV01`, project_id:pid, package_number:`TV-01`, package_name:`Tư vấn thiết kế BVTC`, price:base*0.05, status:'completed', bid_type:'Tư vấn', selection_method:'Chỉ định thầu', field:'Tư vấn', capital_source:'NSTP', duration:'4 tháng' },
      { package_id:`GT-${pid}-TV02`, project_id:pid, package_number:`TV-02`, package_name:`Tư vấn giám sát thi công`, price:base*0.03, status: pi<4?'completed':'approved', bid_type:'Tư vấn', selection_method:'Chỉ định thầu', field:'Tư vấn', capital_source:'NSTP', duration:'24 tháng' },
      { package_id:`GT-${pid}-TB01`, project_id:pid, package_number:`TB-01`, package_name:`Mua sắm thiết bị chuyên dụng`, price:base*0.25, status: pi<2?'completed':'pending', bid_type:'Mua sắm', selection_method:'Đấu thầu rộng rãi', field:'Mua sắm', capital_source:'NSTP', duration:'6 tháng' }
    );
  });
  try { console.log(await post('bidding_packages', packages)); } catch(e) { console.error(e); }

  // 4. CONTRACTS
  console.log('\n4. Contracts...');
  const contracts = [];
  PROJECTS.forEach((pid, pi) => {
    const base = (pi+1) * 100e9;
    contracts.push(
      { contract_id:`HD-${pid}-XL01`, project_id:pid, package_id:`GT-${pid}-XL01`, contractor_id:['NT001','NT002','NT003','NT004','NT001','NT002','NT003'][pi], contract_name:`HĐ Xây lắp chính`, contract_type:'Trọn gói', value:base*0.58, sign_date:'2025-03-15', start_date:'2025-04-01', end_date:'2026-10-01', duration_months:18, status: pi===0?3:pi<3?2:1, scope:'Thi công xây dựng toàn bộ hạng mục chính', advance_rate:15, has_vat:true, warranty:24 },
      { contract_id:`HD-${pid}-TV01`, project_id:pid, package_id:`GT-${pid}-TV01`, contractor_id:['NT005','NT006','NT005','NT006','NT005','NT006','NT007'][pi], contract_name:`HĐ Tư vấn TKBVTC`, contract_type:'Theo tỷ lệ %', value:base*0.048, sign_date:'2024-12-01', start_date:'2024-12-15', end_date:'2025-04-15', duration_months:4, status:3, scope:'Thiết kế bản vẽ thi công', advance_rate:20, has_vat:true, warranty:12 },
      { contract_id:`HD-${pid}-GS01`, project_id:pid, package_id:`GT-${pid}-TV02`, contractor_id:['NT008','NT007','NT008','NT007','NT008','NT007','NT008'][pi], contract_name:`HĐ TVGS thi công XD`, contract_type:'Theo tỷ lệ %', value:base*0.028, sign_date:'2025-03-01', start_date:'2025-04-01', end_date:'2027-04-01', duration_months:24, status: pi<4?2:1, scope:'Giám sát chất lượng, tiến độ, khối lượng', advance_rate:10, has_vat:true, warranty:0 }
    );
  });
  try { console.log(await post('contracts', contracts)); } catch(e) { console.error(e); }

  // 5. PROJECT MEMBERS
  console.log('\n5. Project Members...');
  const members = [];
  PROJECTS.forEach((pid, pi) => {
    // BGD oversight
    members.push({ project_id:pid, employee_id:'NV002', role:'Chỉ đạo chung' });
    members.push({ project_id:pid, employee_id:pi%2===0?'NV003':'NV004', role:'Phó chỉ đạo' });
    members.push({ project_id:pid, employee_id:'NV011', role:'Theo dõi kế hoạch' });
    // Ban DDHDA staff
    const banStaff = [
      ['NV026','NV027','NV028'], ['NV029','NV030','NV031'],
      ['NV032','NV033','NV034'], ['NV035','NV036','NV037'],
      ['NV038','NV039','NV040'], ['NV026','NV030','NV033'],
      ['NV029','NV027','NV036']
    ];
    members.push({ project_id:pid, employee_id:banStaff[pi][0], role:'Trưởng ban điều hành DA' });
    members.push({ project_id:pid, employee_id:banStaff[pi][1], role:'Kỹ sư hiện trường' });
    members.push({ project_id:pid, employee_id:banStaff[pi][2], role:'Chuyên viên hồ sơ' });
    // Finance + QC
    members.push({ project_id:pid, employee_id:'NV015', role:'Kế toán dự án' });
    members.push({ project_id:pid, employee_id:'NV022', role:'Thẩm định kỹ thuật' });
    // TVGS
    members.push({ project_id:pid, employee_id:pi%2===0?'NV042':'NV043', role:'Tư vấn giám sát' });
  });
  try { console.log(await post('project_members', members)); } catch(e) { console.error(e); }

  // 6. CAPITAL PLANS
  console.log('\n6. Capital Plans...');
  const plans = [];
  PROJECTS.forEach((pid, pi) => {
    const base = (pi+1) * 100e9;
    plans.push(
      { plan_id:`CP-${pid}-2025`, project_id:pid, year:2025, amount:Math.round(base*0.15), disbursed_amount:Math.round(base*0.15*(pi<3?0.85:0.4)), source:'Ngân sách TP.HCM', decision_number:`QĐ-${pi+1}/2025/UBND`, date_assigned:'2025-01-15' },
      { plan_id:`CP-${pid}-2026`, project_id:pid, year:2026, amount:Math.round(base*0.25), disbursed_amount:Math.round(base*0.25*(pi===0?0.65:pi<3?0.3:0.08)), source:'Ngân sách TP.HCM', decision_number:`QĐ-${pi+1}/2026/UBND`, date_assigned:'2026-01-20' }
    );
  });
  try { console.log(await post('capital_plans', plans)); } catch(e) { console.error(e); }

  // 7. DISBURSEMENTS
  console.log('\n7. Disbursements...');
  const disb = [];
  PROJECTS.forEach((pid, pi) => {
    const cpId25 = `CP-${pid}-2025`;
    const cpId26 = `CP-${pid}-2026`;
    const base = (pi+1) * 100e9;
    const amt25 = Math.round(base * 0.15);
    // 2025 disbursements
    disb.push({ disbursement_id:`D-${pid}-TU1`, project_id:pid, capital_plan_id:cpId25, amount:Math.round(amt25*0.15), date:'2025-03-15', status:'approved', form_type:'TamUng', treasury_code:`KB-${pi+1}-Q1-2025` });
    disb.push({ disbursement_id:`D-${pid}-KL1`, project_id:pid, capital_plan_id:cpId25, amount:Math.round(amt25*0.25), date:'2025-06-20', status:'approved', form_type:'ThanhToanKLHT', treasury_code:`KB-${pi+1}-Q2-2025` });
    if (pi < 4) {
      disb.push({ disbursement_id:`D-${pid}-KL2`, project_id:pid, capital_plan_id:cpId25, amount:Math.round(amt25*0.30), date:'2025-09-10', status:'approved', form_type:'ThanhToanKLHT', treasury_code:`KB-${pi+1}-Q3-2025` });
    }
    // 2026 disbursements
    const amt26 = Math.round(base * 0.25);
    disb.push({ disbursement_id:`D-${pid}-TU2`, project_id:pid, capital_plan_id:cpId26, amount:Math.round(amt26*0.20), date:'2026-02-10', status:'approved', form_type:'TamUng', treasury_code:`KB-${pi+1}-Q1-2026` });
    if (pi < 3) {
      disb.push({ disbursement_id:`D-${pid}-KL3`, project_id:pid, capital_plan_id:cpId26, amount:Math.round(amt26*0.12), date:'2026-03-01', status:'approved', form_type:'ThanhToanKLHT', treasury_code:`KB-${pi+1}-M3-2026` });
    }
    disb.push({ disbursement_id:`D-${pid}-PD1`, project_id:pid, capital_plan_id:cpId26, amount:Math.round(amt26*0.10), date:'2026-03-10', status:'pending', form_type:'ThanhToanKLHT' });
  });
  try { console.log(await post('disbursements', disb)); } catch(e) { console.error(e); }

  // 8. TASKS (10 per project with various statuses including OVERDUE)
  console.log('\n8. Tasks...');
  const tasks = [];
  PROJECTS.forEach((pid, pi) => {
    const prefix = `T-${pid}`;
    const assignees = ['NV026','NV029','NV032','NV035','NV038','NV026','NV029'];
    tasks.push(
      { task_id:`${prefix}-01`, project_id:pid, title:'Lập báo cáo đề xuất chủ trương đầu tư', status:'Done', priority:'high', assignee_id:'NV011', due_date:'2025-06-30', phase:'Preparation', progress:100, duration_days:30, actual_start_date:'2025-05-15', actual_end_date:'2025-06-28' },
      { task_id:`${prefix}-02`, project_id:pid, title:'Thẩm định BCNCKT', status:pi<3?'Done':'InProgress', priority:'high', assignee_id:'NV022', due_date:pi<3?'2025-08-31':'2026-04-15', phase:'Preparation', progress:pi<3?100:65, duration_days:45 },
      { task_id:`${prefix}-03`, project_id:pid, title:'Phê duyệt dự án đầu tư', status:pi<2?'Done':pi<5?'InProgress':'Todo', priority:'critical', assignee_id:'NV002', due_date:pi<2?'2025-09-30':'2026-05-30', phase:'Preparation', progress:pi<2?100:pi<5?40:0, duration_days:30 },
      { task_id:`${prefix}-04`, project_id:pid, title:'Lập KHLCNT', status:pi<3?'Done':pi<5?'InProgress':'Todo', priority:'high', assignee_id:assignees[pi], due_date:pi<3?'2025-10-31':'2026-06-30', phase:'Execution', progress:pi<3?100:pi<5?55:0, duration_days:45 },
      { task_id:`${prefix}-05`, project_id:pid, title:'Tổ chức đấu thầu gói XL chính', status:pi<2?'Done':pi<4?'InProgress':'Todo', priority:'high', assignee_id:'NV012', due_date:pi<2?'2025-12-31':'2026-08-31', phase:'Execution', progress:pi<2?100:pi<4?70:0, duration_days:60 },
      { task_id:`${prefix}-06`, project_id:pid, title:'Ký kết hợp đồng xây dựng', status:pi<1?'Done':pi<3?'InProgress':'Todo', priority:'medium', assignee_id:'NV015', due_date:pi<1?'2026-01-31':'2026-09-30', phase:'Execution', progress:pi<1?100:pi<3?45:0, duration_days:15 },
      { task_id:`${prefix}-07`, project_id:pid, title:'Giám sát thi công xây dựng', status:pi===0?'Done':pi<3?'InProgress':'Todo', priority:'high', assignee_id:pi%2===0?'NV042':'NV043', due_date:'2027-06-30', phase:'Execution', progress:pi===0?100:pi<3?30:0, duration_days:365 },
      // OVERDUE tasks for AI Risk Detection
      { task_id:`${prefix}-08`, project_id:pid, title:`Nghiệm thu KLHT đợt ${(pi%3)+1}`, status:'InProgress', priority:'high', assignee_id:'NV024', due_date:'2026-02-28', phase:'Execution', progress:60, duration_days:10, actual_start_date:'2026-02-01' },
      { task_id:`${prefix}-09`, project_id:pid, title:`Thanh toán tạm ứng đợt ${(pi%4)+1}`, status:pi%2===0?'Todo':'InProgress', priority:'medium', assignee_id:'NV017', due_date:'2026-03-05', phase:'Execution', progress:pi%2===0?0:25, duration_days:7 },
      { task_id:`${prefix}-10`, project_id:pid, title:'Nghiệm thu hoàn thành đưa vào sử dụng', status:'Todo', priority:'medium', assignee_id:'NV022', due_date:'2027-12-31', phase:'Completion', progress:0, duration_days:30 }
    );
  });
  try { console.log(await post('tasks', tasks)); } catch(e) { console.error(e); }

  // 9. CONSTRUCTION WORKS
  console.log('\n9. Construction Works...');
  const works = [
    { work_id:'CW-01', work_name:'Khối nhà chính 5 tầng', project_id:PROJECTS[0], type:'Nhà dân dụng', grade:2, design_level:2, address:'Hóc Môn' },
    { work_id:'CW-02', work_name:'Khoa Cấp cứu & Khám bệnh', project_id:PROJECTS[0], type:'Nhà dân dụng', grade:2, design_level:2, address:'Hóc Môn' },
    { work_id:'CW-03', work_name:'Hệ thống xử lý nước thải y tế', project_id:PROJECTS[0], type:'Hạ tầng kỹ thuật', grade:3, design_level:3, address:'Hóc Môn' },
    { work_id:'CW-04', work_name:'Khối nghiên cứu nhiệt đới 8 tầng', project_id:PROJECTS[1], type:'Nhà dân dụng', grade:1, design_level:1, address:'Q.1, TP.HCM' },
    { work_id:'CW-05', work_name:'Tầng hầm 2 tầng', project_id:PROJECTS[1], type:'Nhà dân dụng', grade:2, design_level:2, address:'Q.1, TP.HCM' },
    { work_id:'CW-06', work_name:'Khu C - Tòa nhà mới 6 tầng', project_id:PROJECTS[2], type:'Nhà dân dụng', grade:2, design_level:2, address:'Q.5, TP.HCM' },
    { work_id:'CW-07', work_name:'Hệ thống cơ điện M&E', project_id:PROJECTS[2], type:'Hạ tầng kỹ thuật', grade:3, design_level:3, address:'Q.5, TP.HCM' },
    { work_id:'CW-08', work_name:'Khối nhà A2 - 7 tầng', project_id:PROJECTS[3], type:'Nhà dân dụng', grade:2, design_level:2, address:'Q.8, TP.HCM' },
    { work_id:'CW-09', work_name:'Trung tâm nghiên cứu Đông Y', project_id:PROJECTS[4], type:'Nhà dân dụng', grade:2, design_level:2, address:'Q.Phú Nhuận' },
    { work_id:'CW-10', work_name:'Khu chế biến dược liệu', project_id:PROJECTS[4], type:'Công nghiệp', grade:3, design_level:3, address:'Q.Phú Nhuận' },
    { work_id:'CW-11', work_name:'Tòa nhà Ngân hàng Máu 4 tầng', project_id:PROJECTS[5], type:'Nhà dân dụng', grade:2, design_level:2, address:'Q.Bình Thạnh' },
    { work_id:'CW-12', work_name:'Kho lạnh bảo quản máu', project_id:PROJECTS[5], type:'Hạ tầng kỹ thuật', grade:2, design_level:2, address:'Q.Bình Thạnh' },
    { work_id:'CW-13', work_name:'Khán đài chính 25.000 chỗ', project_id:PROJECTS[6], type:'Công trình thể thao', grade:1, design_level:1, address:'Q.3, TP.HCM' },
    { work_id:'CW-14', work_name:'Đường chạy & sân cỏ', project_id:PROJECTS[6], type:'Công trình thể thao', grade:2, design_level:2, address:'Q.3, TP.HCM' },
  ];
  try { console.log(await post('construction_works', works)); } catch(e) { console.error(e); }

  // 10. PACKAGE ISSUES (for AI Risk/Anomaly)
  console.log('\n10. Package Issues...');
  const issues = [
    { issue_id:'PI-001', package_id:`GT-${PROJECTS[0]}-XL01`, title:'Chậm tiến độ 15 ngày', description:'Nhà thầu Hòa Bình chậm tiến độ do thiếu nhân lực.', severity:'High', status:'Open', reporter:'NV026', reported_date:'2026-02-10' },
    { issue_id:'PI-002', package_id:`GT-${PROJECTS[1]}-XL01`, title:'Chất lượng thép không đạt TCVN', description:'Kết quả thí nghiệm thép lot 3 không đạt TCVN 1651.', severity:'High', status:'Open', reporter:'NV022', reported_date:'2026-03-05' },
    { issue_id:'PI-003', package_id:`GT-${PROJECTS[2]}-XL01`, title:'Vi phạm an toàn lao động', description:'Công nhân không đeo dây an toàn khi làm việc trên cao tầng 5.', severity:'High', status:'Open', reporter:'NV042', reported_date:'2026-03-08' },
    { issue_id:'PI-004', package_id:`GT-${PROJECTS[0]}-XL01`, title:'Hồ sơ thanh toán đợt 3 thiếu', description:'Thiếu biên bản nghiệm thu và chứng chỉ xuất xứ vật liệu.', severity:'Medium', status:'Open', reporter:'NV015', reported_date:'2026-02-15' },
    { issue_id:'PI-005', package_id:`GT-${PROJECTS[3]}-XL01`, title:'Chậm tiến độ 25 ngày', description:'Nhà thầu VNCC chậm do thời tiết mùa mưa kéo dài.', severity:'Medium', status:'Open', reporter:'NV035', reported_date:'2026-01-20' },
    { issue_id:'PI-006', package_id:`GT-${PROJECTS[4]}-TB01`, title:'Thiết bị nhập khẩu chậm giao hàng', description:'Container thiết bị bị kẹt tại cảng do thủ tục hải quan.', severity:'Medium', status:'Open', reporter:'NV038', reported_date:'2026-02-28' },
    { issue_id:'PI-007', package_id:`GT-${PROJECTS[1]}-TV02`, title:'TVGS thiếu nhân sự tại hiện trường', description:'Đơn vị TVGS chỉ bố trí 1/3 nhân sự theo hợp đồng.', severity:'Low', status:'Open', reporter:'NV029', reported_date:'2026-03-01' },
    { issue_id:'PI-008', package_id:`GT-${PROJECTS[5]}-XL01`, title:'Sai lệch cao độ móng -0.5m', description:'Phát hiện sai lệch cao độ đáy móng so với thiết kế.', severity:'High', status:'Open', reporter:'NV043', reported_date:'2026-03-10' },
  ];
  try { console.log(await post('package_issues', issues)); } catch(e) { console.error(e); }

  // 11. STAGE TRANSITIONS
  console.log('\n11. Stage Transitions...');
  const stages = [];
  PROJECTS.forEach((pid, pi) => {
    stages.push({ id:`ST-${pid}-01`, project_id:pid, stage:'Preparation', start_date:'2024-06-01', end_date:pi<3?'2025-06-30':null, decision_number:`QĐ-CTDT-${pi+1}/2024`, decision_date:'2024-06-01', notes:'Phê duyệt chủ trương đầu tư' });
    if (pi < 3) stages.push({ id:`ST-${pid}-02`, project_id:pid, stage:'Execution', start_date:'2025-07-01', end_date:pi===0?'2026-12-31':null, decision_number:`QĐ-PDDA-${pi+1}/2025`, decision_date:'2025-06-30', notes:'Chuyển sang giai đoạn thực hiện' });
    if (pi === 0) stages.push({ id:`ST-${pid}-03`, project_id:pid, stage:'Completion', start_date:'2027-01-01', decision_number:`QĐ-NTHT-1/2027`, decision_date:'2026-12-31', notes:'Nghiệm thu hoàn thành' });
  });
  try { console.log(await post('stage_transitions', stages)); } catch(e) { console.error(e); }

  // 12. VARIATION ORDERS
  console.log('\n12. Variation Orders...');
  const vos = [
    { vo_id:'VO-001', contract_id:`HD-${PROJECTS[0]}-XL01`, number:'PL01', content:'Điều chỉnh đơn giá vật liệu thép, xi măng theo chỉ số giá Q3/2025', adjusted_amount:5e9, sign_date:'2025-10-15' },
    { vo_id:'VO-002', contract_id:`HD-${PROJECTS[0]}-XL01`, number:'PL02', content:'Bổ sung hạng mục gia cố nền móng theo yêu cầu thực tế', adjusted_amount:12e9, adjusted_duration:30, sign_date:'2026-01-20' },
    { vo_id:'VO-003', contract_id:`HD-${PROJECTS[1]}-XL01`, number:'PL01', content:'Gia hạn thời gian do ảnh hưởng mùa mưa', adjusted_amount:0, adjusted_duration:60, sign_date:'2026-02-28' },
    { vo_id:'VO-004', contract_id:`HD-${PROJECTS[2]}-XL01`, number:'PL01', content:'Điều chỉnh thiết kế hệ thống M&E theo tiêu chuẩn mới', adjusted_amount:8e9, sign_date:'2026-01-10' },
    { vo_id:'VO-005', contract_id:`HD-${PROJECTS[3]}-XL01`, number:'PL01', content:'Bổ sung hạng mục chống thấm tầng hầm', adjusted_amount:3e9, adjusted_duration:15, sign_date:'2026-02-15' },
  ];
  try { console.log(await post('variation_orders', vos)); } catch(e) { console.error(e); }

  // 13. PAYMENTS
  console.log('\n13. Payments...');
  const payments = [];
  PROJECTS.slice(0,4).forEach((pid, pi) => {
    payments.push(
      { contract_id:`HD-${pid}-XL01`, project_id:pid, batch_no:1, type:'advance', amount:Math.round((pi+1)*100e9*0.58*0.15), status:'approved', description:'Tạm ứng 15% giá trị HĐ', request_date:'2025-04-10', approved_date:'2025-04-20', paid_date:'2025-04-25' },
      { contract_id:`HD-${pid}-XL01`, project_id:pid, batch_no:2, type:'interim', amount:Math.round((pi+1)*100e9*0.58*0.20), status:'approved', description:'Thanh toán KLHT đợt 1', request_date:'2025-07-15', approved_date:'2025-07-25', paid_date:'2025-08-01' },
      { contract_id:`HD-${pid}-XL01`, project_id:pid, batch_no:3, type:'interim', amount:Math.round((pi+1)*100e9*0.58*0.15), status:pi<2?'approved':'draft', description:'Thanh toán KLHT đợt 2', request_date:'2025-11-10', approved_date:pi<2?'2025-11-20':null, paid_date:pi<2?'2025-11-28':null },
      { contract_id:`HD-${pid}-XL01`, project_id:pid, batch_no:4, type:'interim', amount:Math.round((pi+1)*100e9*0.58*0.10), status:'draft', description:'Thanh toán KLHT đợt 3', request_date:'2026-03-01' }
    );
  });
  try { console.log(await post('payments', payments)); } catch(e) { console.error(e); }

  console.log('\n=== ✅ SEED COMPLETE ===');
}

main().catch(console.error);
