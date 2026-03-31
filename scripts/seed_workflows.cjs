/**
 * Seed 3 Quy trình ĐTC Hải Dương 2025
 * Chạy: node scripts/seed_workflows.js
 */
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gyuxymbmbfvvygvcyyrd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5dXh5bWJtYmZ2dnlndmN5eXJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMzQ3NDcsImV4cCI6MjA4ODYxMDc0N30.EGxnvkq5RooWMi1J9xmHhosTChIoPv-3uhU0p6YYYcQ'
);

// Helper: insert node and chain edge
async function insertNode(workflowId, prevNodeId, node) {
  const { data, error } = await supabase.from('workflow_nodes').insert({
    workflow_id: workflowId,
    name: node.name,
    type: node.type,
    assignee_role: node.role,
    sla_formula: node.sla,
    metadata: node.metadata || {}
  }).select('id').single();
  
  if (error) { console.error('Node error:', node.name, error.message); return null; }
  
  if (prevNodeId) {
    const { error: edgeErr } = await supabase.from('workflow_edges').insert({
      workflow_id: workflowId,
      source_node: prevNodeId,
      target_node: data.id
    });
    if (edgeErr) console.error('Edge error:', edgeErr.message);
  }
  
  return data.id;
}

async function seedWorkflow(wfData, nodes) {
  // Delete existing workflow with same code
  await supabase.from('workflows').delete().eq('code', wfData.code);
  
  const { data: wf, error } = await supabase.from('workflows').insert(wfData).select('id').single();
  if (error) { console.error('WF error:', error.message); return; }
  
  let prevId = null;
  for (const node of nodes) {
    prevId = await insertNode(wf.id, prevId, node);
  }
  
  console.log(`✅ ${wfData.name}: ${nodes.length} nodes seeded`);
  return wf.id;
}

// ====== DEFINE NODES ======

const COMMON_PHASE1_START = [
  { name: 'Bắt đầu quy trình', type: 'start', role: 'system', sla: null, metadata: { phase: 'I', phase_name: 'Chuẩn bị dự án' } },
];

const PHASE1_CTDT = (sla_td) => [
  { name: 'Lập Báo cáo đề xuất chủ trương đầu tư', type: 'input', role: 'don_vi_de_xuat', sla: '20d', metadata: { phase: 'I', step: 'I.1.1' } },
  { name: 'Thẩm định chủ trương đầu tư', type: 'approval', role: 'hoi_dong_tham_dinh', sla: sla_td, metadata: { phase: 'I', step: 'I.1.2' } },
  { name: 'Phê duyệt chủ trương đầu tư', type: 'approval', role: 'nguoi_quyet_dinh_dt', sla: '10d', metadata: { phase: 'I', step: 'I.1.4' } },
  { name: 'Giao Chủ đầu tư dự án', type: 'approval', role: 'nguoi_quyet_dinh_dt', sla: '5d', metadata: { phase: 'I', step: 'I.1.5' } },
];

const PHASE3_END = (slaQT, slaTT, slaPD) => [
  { name: 'Bàn giao công trình đưa vào sử dụng', type: 'input', role: 'chu_dau_tu', sla: '15d', metadata: { phase: 'III', phase_name: 'Kết thúc dự án', step: 'III.2' } },
  { name: 'Lập hồ sơ Quyết toán dự án', type: 'input', role: 'chu_dau_tu', sla: slaQT, metadata: { phase: 'III', step: 'III.3.3' } },
  { name: 'Thẩm tra Quyết toán dự án', type: 'approval', role: 'so_tai_chinh', sla: slaTT, metadata: { phase: 'III', step: 'III.3.4' } },
  { name: 'Phê duyệt QT, Tất toán & Đóng mã DA', type: 'end', role: 'nguoi_quyet_dinh_dt', sla: slaPD, metadata: { phase: 'III', step: 'III.3.5+6' } },
];

// ====== 1 BƯỚC THIẾT KẾ ======
const nodes1Step = [
  ...COMMON_PHASE1_START,
  ...PHASE1_CTDT('30d'),
  // Chuẩn bị DA - BCKT-KT gộp TKBVTC
  { name: 'Lập Báo cáo Kinh tế - Kỹ thuật (BCKT-KT)', type: 'input', role: 'tu_van_thiet_ke', sla: '60d', metadata: { phase: 'I', step: 'I.2.5', description: 'Gộp TKBVTC. DA 1 bước thiết kế.' } },
  { name: 'Thẩm định BCKT-KT', type: 'approval', role: 'co_quan_chuyen_mon', sla: '20d', metadata: { phase: 'I', step: 'I.2.5b' } },
  { name: 'Phê duyệt dự án (BCKT-KT)', type: 'approval', role: 'nguoi_quyet_dinh_dt', sla: '5d', metadata: { phase: 'I', step: 'I.2.7' } },
  // Thực hiện
  { name: 'Lập, phê duyệt KH LCNT', type: 'approval', role: 'chu_dau_tu', sla: '30d', metadata: { phase: 'II', phase_name: 'Thực hiện dự án', step: 'II.1.2' } },
  { name: 'Giải phóng mặt bằng (GPMB)', type: 'approval', role: 'hoi_dong_bt_ht_tdc', sla: '90d', metadata: { phase: 'II', step: 'II.1.1b', description: '12 bước con' } },
  { name: 'Lựa chọn nhà thầu thi công', type: 'approval', role: 'chu_dau_tu', sla: '30d', metadata: { phase: 'II', step: 'II.2.2' } },
  { name: 'Thông báo khởi công', type: 'input', role: 'chu_dau_tu', sla: '3d', metadata: { phase: 'II', step: 'II.2.3.1' } },
  { name: 'Thi công xây dựng & Giám sát', type: 'input', role: 'nha_thau_thi_cong', sla: '180d', metadata: { phase: 'II', step: 'II.2.3.2', description: '11 trình tự quản lý thi công' } },
  { name: 'Nghiệm thu hoàn thành công trình', type: 'approval', role: 'co_quan_qlnn_xd', sla: '15d', metadata: { phase: 'II', step: 'II.2.4.2' } },
  // Kết thúc
  ...PHASE3_END('120d', '90d', '15d'),
];

// ====== 2 BƯỚC THIẾT KẾ ======
const nodes2Step = [
  ...COMMON_PHASE1_START,
  ...PHASE1_CTDT('30d'),
  // Chuẩn bị DA
  { name: 'Lập dự toán chi phí chuẩn bị đầu tư', type: 'input', role: 'chu_dau_tu', sla: '10d', metadata: { phase: 'I', step: 'I.2.1' } },
  { name: 'Lập, phê duyệt KHLCNT bước chuẩn bị', type: 'approval', role: 'chu_dau_tu', sla: '30d', metadata: { phase: 'I', step: 'I.2.2' } },
  { name: 'LCNT khảo sát, tư vấn lập TKCS', type: 'approval', role: 'chu_dau_tu', sla: '30d', metadata: { phase: 'I', step: 'I.2.3' } },
  { name: 'Lập Báo cáo NCKT (có TKCS)', type: 'input', role: 'tu_van_thiet_ke', sla: '60d', metadata: { phase: 'I', step: 'I.2.5', description: 'Thiết kế bước 1: TKCS' } },
  { name: 'Thẩm định BCNCKT & TKCS', type: 'approval', role: 'co_quan_chuyen_mon', sla: '30d', metadata: { phase: 'I', step: 'I.2.5b' } },
  { name: 'Phê duyệt dự án', type: 'approval', role: 'nguoi_quyet_dinh_dt', sla: '7d', metadata: { phase: 'I', step: 'I.2.7' } },
  // Thực hiện
  { name: 'Lập, phê duyệt NV KSTK sau TKCS', type: 'input', role: 'chu_dau_tu', sla: '15d', metadata: { phase: 'II', phase_name: 'Thực hiện dự án', step: 'II.1.1a' } },
  { name: 'Giải phóng mặt bằng (GPMB)', type: 'approval', role: 'hoi_dong_bt_ht_tdc', sla: '120d', metadata: { phase: 'II', step: 'II.1.1b', description: '12 bước con GPMB' } },
  { name: 'Lập TKBVTC (thiết kế bước 2)', type: 'input', role: 'tu_van_thiet_ke', sla: '30d', metadata: { phase: 'II', step: 'II.1.4a' } },
  { name: 'Thẩm định TKBVTC', type: 'approval', role: 'co_quan_chuyen_mon', sla: '30d', metadata: { phase: 'II', step: 'II.1.4a-TD' } },
  { name: 'Phê duyệt TKBVTC', type: 'approval', role: 'chu_dau_tu', sla: '7d', metadata: { phase: 'II', step: 'II.1.4a-PD' } },
  { name: 'Lập, phê duyệt KH LCNT giai đoạn THDA', type: 'approval', role: 'chu_dau_tu', sla: '30d', metadata: { phase: 'II', step: 'II.2.1' } },
  { name: 'Lựa chọn nhà thầu thi công, giám sát', type: 'approval', role: 'chu_dau_tu', sla: '30d', metadata: { phase: 'II', step: 'II.2.2' } },
  { name: 'Thông báo khởi công', type: 'input', role: 'chu_dau_tu', sla: '3d', metadata: { phase: 'II', step: 'II.2.3.1' } },
  { name: 'Thi công xây dựng & Giám sát', type: 'input', role: 'nha_thau_thi_cong', sla: '240d', metadata: { phase: 'II', step: 'II.2.3.2', description: '11 trình tự quản lý thi công' } },
  { name: 'Nghiệm thu hoàn thành công trình', type: 'approval', role: 'co_quan_qlnn_xd', sla: '20d', metadata: { phase: 'II', step: 'II.2.4.2' } },
  // Kết thúc
  ...PHASE3_END('180d', '120d', '20d'),
];

// ====== 3 BƯỚC THIẾT KẾ ======
const nodes3Step = [
  ...COMMON_PHASE1_START,
  ...PHASE1_CTDT('45d'),
  // Chuẩn bị DA
  { name: 'Lập dự toán chi phí chuẩn bị đầu tư', type: 'input', role: 'chu_dau_tu', sla: '10d', metadata: { phase: 'I', step: 'I.2.1' } },
  { name: 'Lập, phê duyệt KHLCNT bước chuẩn bị', type: 'approval', role: 'chu_dau_tu', sla: '30d', metadata: { phase: 'I', step: 'I.2.2' } },
  { name: 'LCNT khảo sát, tư vấn lập TKCS', type: 'approval', role: 'chu_dau_tu', sla: '30d', metadata: { phase: 'I', step: 'I.2.3' } },
  { name: 'Lập Báo cáo NCKT (có TKCS)', type: 'input', role: 'tu_van_thiet_ke', sla: '80d', metadata: { phase: 'I', step: 'I.2.5', description: 'Nhóm A: 80 ngày, TK bước 1: TKCS' } },
  { name: 'Thẩm định BCNCKT & TKCS', type: 'approval', role: 'co_quan_chuyen_mon', sla: '40d', metadata: { phase: 'I', step: 'I.2.5b', description: 'Nhóm A: 40 ngày' } },
  { name: 'Phê duyệt dự án', type: 'approval', role: 'nguoi_quyet_dinh_dt', sla: '7d', metadata: { phase: 'I', step: 'I.2.7' } },
  // Thực hiện
  { name: 'Lập, phê duyệt NV KSTK sau TKCS', type: 'input', role: 'chu_dau_tu', sla: '15d', metadata: { phase: 'II', phase_name: 'Thực hiện dự án', step: 'II.1.1a' } },
  { name: 'Giải phóng mặt bằng (GPMB)', type: 'approval', role: 'hoi_dong_bt_ht_tdc', sla: '180d', metadata: { phase: 'II', step: 'II.1.1b', description: '12 bước con, DA nhóm A: 180 ngày' } },
  // TKKT - bước thiết kế 2 (chỉ có ở 3 bước)
  { name: 'Lập Thiết kế Kỹ thuật (TKKT)', type: 'input', role: 'tu_van_thiet_ke', sla: '45d', metadata: { phase: 'II', step: 'II.1.4a-TKKT', description: 'Bước TK 2 - chỉ có ở QT 3 bước' } },
  { name: 'Thẩm định TKKT', type: 'approval', role: 'co_quan_chuyen_mon', sla: '40d', metadata: { phase: 'II', step: 'II.1.4a-TKKT-TD' } },
  { name: 'Phê duyệt TKKT', type: 'approval', role: 'chu_dau_tu', sla: '7d', metadata: { phase: 'II', step: 'II.1.4a-TKKT-PD' } },
  // TKBVTC - bước thiết kế 3
  { name: 'Lập TKBVTC (thiết kế bước 3)', type: 'input', role: 'tu_van_thiet_ke', sla: '30d', metadata: { phase: 'II', step: 'II.1.4a-TKBVTC' } },
  { name: 'Lập, phê duyệt KH LCNT giai đoạn THDA', type: 'approval', role: 'chu_dau_tu', sla: '30d', metadata: { phase: 'II', step: 'II.2.1' } },
  { name: 'Lựa chọn nhà thầu thi công, giám sát', type: 'approval', role: 'chu_dau_tu', sla: '45d', metadata: { phase: 'II', step: 'II.2.2' } },
  { name: 'Thông báo khởi công', type: 'input', role: 'chu_dau_tu', sla: '3d', metadata: { phase: 'II', step: 'II.2.3.1' } },
  { name: 'Thi công xây dựng & Giám sát', type: 'input', role: 'nha_thau_thi_cong', sla: '720d', metadata: { phase: 'II', step: 'II.2.3.2', description: 'DA nhóm A: lên đến 720 ngày' } },
  { name: 'Nghiệm thu hoàn thành công trình', type: 'approval', role: 'co_quan_qlnn_xd', sla: '30d', metadata: { phase: 'II', step: 'II.2.4.2' } },
  // Kết thúc
  { name: 'Bàn giao công trình đưa vào sử dụng', type: 'input', role: 'chu_dau_tu', sla: '30d', metadata: { phase: 'III', phase_name: 'Kết thúc dự án', step: 'III.2' } },
  { name: 'Lập hồ sơ Quyết toán dự án', type: 'input', role: 'chu_dau_tu', sla: '270d', metadata: { phase: 'III', step: 'III.3.3', description: 'Nhóm A: 9 tháng' } },
  { name: 'Thẩm tra Quyết toán dự án', type: 'approval', role: 'so_tai_chinh', sla: '240d', metadata: { phase: 'III', step: 'III.3.4', description: 'Nhóm A: 8 tháng' } },
  { name: 'Phê duyệt QT dự án hoàn thành', type: 'approval', role: 'nguoi_quyet_dinh_dt', sla: '30d', metadata: { phase: 'III', step: 'III.3.5' } },
  { name: 'Tất toán tài khoản & Đóng mã DA', type: 'end', role: 'chu_dau_tu', sla: '15d', metadata: { phase: 'III', step: 'III.3.6' } },
];

// ====== MAIN ======
async function main() {
  console.log('🗑️  Xóa quy trình cũ...');
  
  // Delete old workflows (cascade deletes nodes & edges)
  const { data: oldWfs } = await supabase.from('workflows').select('id').eq('category', 'project');
  for (const wf of (oldWfs || [])) {
    await supabase.from('workflow_edges').delete().eq('workflow_id', wf.id);
    await supabase.from('workflow_nodes').delete().eq('workflow_id', wf.id);
    await supabase.from('workflows').delete().eq('id', wf.id);
  }
  
  console.log('📝 Seeding 3 quy trình Sổ tay ĐTC Hải Dương 2025...\n');
  
  await seedWorkflow({
    code: 'DTC-1STEP', name: 'Quy trình dự án 1 bước thiết kế',
    description: 'Dự án chỉ lập BCKT-KT, TKBVTC gộp chung. Áp dụng công trình quy mô nhỏ. Sổ tay ĐTC Hải Dương 2025.',
    category: 'project', version: 1, is_active: true,
    metadata: { design_steps: 1, source: 'So tay DTC Hai Duong 2025' }
  }, nodes1Step);
  
  await seedWorkflow({
    code: 'DTC-2STEP', name: 'Quy trình dự án 2 bước thiết kế',
    description: 'TKCS → TKBVTC. Áp dụng dự án nhóm B, C thông thường. Sổ tay ĐTC Hải Dương 2025.',
    category: 'project', version: 1, is_active: true,
    metadata: { design_steps: 2, source: 'So tay DTC Hai Duong 2025' }
  }, nodes2Step);
  
  await seedWorkflow({
    code: 'DTC-3STEP', name: 'Quy trình dự án 3 bước thiết kế',
    description: 'TKCS → TKKT → TKBVTC. DA nhóm A, công trình cấp đặc biệt, cấp I. Sổ tay ĐTC Hải Dương 2025.',
    category: 'project', version: 1, is_active: true,
    metadata: { design_steps: 3, source: 'So tay DTC Hai Duong 2025' }
  }, nodes3Step);
  
  // Verify
  const { data: wfs } = await supabase.from('workflows').select('id, code, name').eq('category', 'project');
  console.log('\n📊 Kết quả:');
  for (const wf of wfs) {
    const { count: nodeCount } = await supabase.from('workflow_nodes').select('*', { count: 'exact', head: true }).eq('workflow_id', wf.id);
    const { count: edgeCount } = await supabase.from('workflow_edges').select('*', { count: 'exact', head: true }).eq('workflow_id', wf.id);
    console.log(`  ${wf.code}: ${wf.name} → ${nodeCount} nodes, ${edgeCount} edges`);
  }
  
  console.log('\n✅ Hoàn thành!');
}

main().catch(console.error);
