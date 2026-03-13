// Fix tables that failed with PGRST102 (all keys must match)
const https = require('https');
const BASE = 'gyuxymbmbfvvygvcyyrd.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5dXh5bWJtYmZ2dnlndmN5eXJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMzQ3NDcsImV4cCI6MjA4ODYxMDc0N30.EGxnvkq5RooWMi1J9xmHhosTChIoPv-3uhU0p6YYYcQ';

function post(table, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const req = https.request({
      hostname: BASE, path: `/rest/v1/${table}`,
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'apikey':KEY, 'Authorization':`Bearer ${KEY}`, 'Prefer':'resolution=ignore-duplicates,return=minimal' }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { if (res.statusCode >= 400) reject(`${table}: ${res.statusCode} ${d}`); else resolve(`${table}: ${res.statusCode} OK`); });
    });
    req.on('error', reject); req.write(body); req.end();
  });
}

const PROJECTS = ['DA-BV-DK-HOC-MON','DA-BV-NHI-DONG-2','DA-BV-NTP-KHU-C','DA-BV-PHCN-A2','DA-DONG-Y-DONG-DUOC','DA-NGAN-HANG-MAU','DA-SVD-THONG-NHAT'];

async function main() {
  // 1. DISBURSEMENTS - ensure all objects have same keys
  console.log('1. Disbursements...');
  const disb = [];
  PROJECTS.forEach((pid, pi) => {
    const cpId25 = `CP-${pid}-2025`, cpId26 = `CP-${pid}-2026`;
    const base = (pi+1) * 100e9;
    const amt25 = Math.round(base * 0.15), amt26 = Math.round(base * 0.25);
    disb.push(
      { disbursement_id:`D-${pid}-TU1`, project_id:pid, capital_plan_id:cpId25, amount:Math.round(amt25*0.15), date:'2025-03-15', status:'approved', form_type:'TamUng', treasury_code:`KB-${pi+1}-Q1-2025` },
      { disbursement_id:`D-${pid}-KL1`, project_id:pid, capital_plan_id:cpId25, amount:Math.round(amt25*0.25), date:'2025-06-20', status:'approved', form_type:'ThanhToanKLHT', treasury_code:`KB-${pi+1}-Q2-2025` },
      { disbursement_id:`D-${pid}-TU2`, project_id:pid, capital_plan_id:cpId26, amount:Math.round(amt26*0.20), date:'2026-02-10', status:'approved', form_type:'TamUng', treasury_code:`KB-${pi+1}-Q1-2026` },
      { disbursement_id:`D-${pid}-PD1`, project_id:pid, capital_plan_id:cpId26, amount:Math.round(amt26*0.10), date:'2026-03-10', status:'pending', form_type:'ThanhToanKLHT', treasury_code:'' }
    );
    if (pi < 4) disb.push({ disbursement_id:`D-${pid}-KL2`, project_id:pid, capital_plan_id:cpId25, amount:Math.round(amt25*0.30), date:'2025-09-10', status:'approved', form_type:'ThanhToanKLHT', treasury_code:`KB-${pi+1}-Q3-2025` });
    if (pi < 3) disb.push({ disbursement_id:`D-${pid}-KL3`, project_id:pid, capital_plan_id:cpId26, amount:Math.round(amt26*0.12), date:'2026-03-01', status:'approved', form_type:'ThanhToanKLHT', treasury_code:`KB-${pi+1}-M3-2026` });
  });
  try { console.log(await post('disbursements', disb)); } catch(e) { console.error(e); }

  // 2. TASKS - ensure all have same keys
  console.log('\n2. Tasks...');
  const tasks = [];
  const assignees = ['NV026','NV029','NV032','NV035','NV038','NV026','NV029'];
  PROJECTS.forEach((pid, pi) => {
    const pfx = `T-${pid}`;
    tasks.push(
      { task_id:`${pfx}-01`, project_id:pid, title:'Lập báo cáo đề xuất chủ trương đầu tư', status:'Done', priority:'high', assignee_id:'NV011', due_date:'2025-06-30', phase:'Preparation', progress:100, duration_days:30, actual_start_date:'2025-05-15', actual_end_date:'2025-06-28' },
      { task_id:`${pfx}-02`, project_id:pid, title:'Thẩm định BCNCKT', status:pi<3?'Done':'InProgress', priority:'high', assignee_id:'NV022', due_date:pi<3?'2025-08-31':'2026-04-15', phase:'Preparation', progress:pi<3?100:65, duration_days:45, actual_start_date:'2025-07-01', actual_end_date:pi<3?'2025-08-28':'' },
      { task_id:`${pfx}-03`, project_id:pid, title:'Phê duyệt dự án đầu tư', status:pi<2?'Done':pi<5?'InProgress':'Todo', priority:'critical', assignee_id:'NV002', due_date:pi<2?'2025-09-30':'2026-05-30', phase:'Preparation', progress:pi<2?100:pi<5?40:0, duration_days:30, actual_start_date:'', actual_end_date:'' },
      { task_id:`${pfx}-04`, project_id:pid, title:'Lập KHLCNT', status:pi<3?'Done':pi<5?'InProgress':'Todo', priority:'high', assignee_id:assignees[pi], due_date:pi<3?'2025-10-31':'2026-06-30', phase:'Execution', progress:pi<3?100:pi<5?55:0, duration_days:45, actual_start_date:'', actual_end_date:'' },
      { task_id:`${pfx}-05`, project_id:pid, title:'Tổ chức đấu thầu gói XL chính', status:pi<2?'Done':pi<4?'InProgress':'Todo', priority:'high', assignee_id:'NV012', due_date:pi<2?'2025-12-31':'2026-08-31', phase:'Execution', progress:pi<2?100:pi<4?70:0, duration_days:60, actual_start_date:'', actual_end_date:'' },
      { task_id:`${pfx}-06`, project_id:pid, title:'Ký kết hợp đồng xây dựng', status:pi<1?'Done':pi<3?'InProgress':'Todo', priority:'medium', assignee_id:'NV015', due_date:pi<1?'2026-01-31':'2026-09-30', phase:'Execution', progress:pi<1?100:pi<3?45:0, duration_days:15, actual_start_date:'', actual_end_date:'' },
      { task_id:`${pfx}-07`, project_id:pid, title:'Giám sát thi công xây dựng', status:pi===0?'Done':pi<3?'InProgress':'Todo', priority:'high', assignee_id:pi%2===0?'NV042':'NV043', due_date:'2027-06-30', phase:'Execution', progress:pi===0?100:pi<3?30:0, duration_days:365, actual_start_date:'', actual_end_date:'' },
      { task_id:`${pfx}-08`, project_id:pid, title:`Nghiệm thu KLHT đợt ${(pi%3)+1}`, status:'InProgress', priority:'high', assignee_id:'NV024', due_date:'2026-02-28', phase:'Execution', progress:60, duration_days:10, actual_start_date:'2026-02-01', actual_end_date:'' },
      { task_id:`${pfx}-09`, project_id:pid, title:`Thanh toán tạm ứng đợt ${(pi%4)+1}`, status:pi%2===0?'Todo':'InProgress', priority:'medium', assignee_id:'NV017', due_date:'2026-03-05', phase:'Execution', progress:pi%2===0?0:25, duration_days:7, actual_start_date:'', actual_end_date:'' },
      { task_id:`${pfx}-10`, project_id:pid, title:'Nghiệm thu hoàn thành đưa vào sử dụng', status:'Todo', priority:'medium', assignee_id:'NV022', due_date:'2027-12-31', phase:'Completion', progress:0, duration_days:30, actual_start_date:'', actual_end_date:'' }
    );
  });
  try { console.log(await post('tasks', tasks)); } catch(e) { console.error(e); }

  // 3. STAGE TRANSITIONS - all have same keys
  console.log('\n3. Stage Transitions...');
  const stages = [];
  PROJECTS.forEach((pid, pi) => {
    stages.push({ id:`ST-${pid}-01`, project_id:pid, stage:'Preparation', start_date:'2024-06-01', end_date:pi<3?'2025-06-30':'', decision_number:`QD-CTDT-${pi+1}/2024`, decision_date:'2024-06-01', notes:'Phê duyệt chủ trương đầu tư' });
    if (pi < 3) stages.push({ id:`ST-${pid}-02`, project_id:pid, stage:'Execution', start_date:'2025-07-01', end_date:pi===0?'2026-12-31':'', decision_number:`QD-PDDA-${pi+1}/2025`, decision_date:'2025-06-30', notes:'Chuyển sang giai đoạn thực hiện' });
    if (pi === 0) stages.push({ id:`ST-${pid}-03`, project_id:pid, stage:'Completion', start_date:'2027-01-01', end_date:'', decision_number:'QD-NTHT-1/2027', decision_date:'2026-12-31', notes:'Nghiệm thu hoàn thành' });
  });
  try { console.log(await post('stage_transitions', stages)); } catch(e) { console.error(e); }

  // 4. VARIATION ORDERS - all same keys
  console.log('\n4. Variation Orders...');
  const vos = [
    { vo_id:'VO-001', contract_id:`HD-${PROJECTS[0]}-XL01`, number:'PL01', content:'Điều chỉnh đơn giá vật liệu thép, xi măng theo chỉ số giá Q3/2025', adjusted_amount:5000000000, adjusted_duration:0, sign_date:'2025-10-15', approval_file:'' },
    { vo_id:'VO-002', contract_id:`HD-${PROJECTS[0]}-XL01`, number:'PL02', content:'Bổ sung hạng mục gia cố nền móng theo yêu cầu thực tế', adjusted_amount:12000000000, adjusted_duration:30, sign_date:'2026-01-20', approval_file:'' },
    { vo_id:'VO-003', contract_id:`HD-${PROJECTS[1]}-XL01`, number:'PL01', content:'Gia hạn thời gian do ảnh hưởng mùa mưa', adjusted_amount:0, adjusted_duration:60, sign_date:'2026-02-28', approval_file:'' },
    { vo_id:'VO-004', contract_id:`HD-${PROJECTS[2]}-XL01`, number:'PL01', content:'Điều chỉnh thiết kế hệ thống M&E theo tiêu chuẩn mới', adjusted_amount:8000000000, adjusted_duration:0, sign_date:'2026-01-10', approval_file:'' },
    { vo_id:'VO-005', contract_id:`HD-${PROJECTS[3]}-XL01`, number:'PL01', content:'Bổ sung hạng mục chống thấm tầng hầm', adjusted_amount:3000000000, adjusted_duration:15, sign_date:'2026-02-15', approval_file:'' },
  ];
  try { console.log(await post('variation_orders', vos)); } catch(e) { console.error(e); }

  // 5. PAYMENTS - all same keys
  console.log('\n5. Payments...');
  const payments = [];
  PROJECTS.slice(0,4).forEach((pid, pi) => {
    const val = Math.round((pi+1)*100e9*0.58);
    payments.push(
      { contract_id:`HD-${pid}-XL01`, project_id:pid, batch_no:1, type:'advance', amount:Math.round(val*0.15), status:'approved', description:'Tạm ứng 15% giá trị HĐ', request_date:'2025-04-10', approved_date:'2025-04-20', paid_date:'2025-04-25', approved_by:'NV002', treasury_ref:`KB-${pi+1}/TU/2025` },
      { contract_id:`HD-${pid}-XL01`, project_id:pid, batch_no:2, type:'interim', amount:Math.round(val*0.20), status:'approved', description:'Thanh toán KLHT đợt 1', request_date:'2025-07-15', approved_date:'2025-07-25', paid_date:'2025-08-01', approved_by:'NV002', treasury_ref:`KB-${pi+1}/KL1/2025` },
      { contract_id:`HD-${pid}-XL01`, project_id:pid, batch_no:3, type:'interim', amount:Math.round(val*0.15), status:pi<2?'approved':'draft', description:'Thanh toán KLHT đợt 2', request_date:'2025-11-10', approved_date:pi<2?'2025-11-20':'', paid_date:pi<2?'2025-11-28':'', approved_by:pi<2?'NV002':'', treasury_ref:pi<2?`KB-${pi+1}/KL2/2025`:'' },
      { contract_id:`HD-${pid}-XL01`, project_id:pid, batch_no:4, type:'interim', amount:Math.round(val*0.10), status:'draft', description:'Thanh toán KLHT đợt 3', request_date:'2026-03-01', approved_date:'', paid_date:'', approved_by:'', treasury_ref:'' }
    );
  });
  try { console.log(await post('payments', payments)); } catch(e) { console.error(e); }

  console.log('\n=== ✅ FIX COMPLETE ===');
}
main().catch(console.error);
