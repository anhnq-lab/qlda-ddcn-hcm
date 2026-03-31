/**
 * Reset workflows: xóa data cũ để auto-seed chạy lại từ WorkflowManagerPage
 */
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gyuxymbmbfvvygvcyyrd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5dXh5bWJtYmZ2dnlndmN5eXJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMzQ3NDcsImV4cCI6MjA4ODYxMDc0N30.EGxnvkq5RooWMi1J9xmHhosTChIoPv-3uhU0p6YYYcQ'
);

async function main() {
  console.log('🗑️  Xóa toàn bộ workflows hiện có...');
  
  const { data: wfs } = await supabase.from('workflows').select('id, code, name');
  console.log(`   Tìm thấy ${(wfs || []).length} workflows:`);
  for (const wf of (wfs || [])) {
    console.log(`   - ${wf.code}: ${wf.name}`);
    await supabase.from('workflow_edges').delete().eq('workflow_id', wf.id);
    await supabase.from('workflow_nodes').delete().eq('workflow_id', wf.id);
    await supabase.from('workflows').delete().eq('id', wf.id);
  }
  
  console.log('\n✅ Đã xóa hết. Mở lại app (hoặc F5) để auto-seed chạy lại từ WorkflowManagerPage.');
  console.log('   Auto-seed sẽ tạo đầy đủ:');
  console.log('   - I.1: Trình tự QĐ chủ trương ĐT');
  console.log('   - I.2: Trình tự chuẩn bị đầu tư, CBDA');
  console.log('   - QT-TK3B: Quy trình 3 bước TK (28 bước)');
  console.log('   - QT-TK2B: Quy trình 2 bước TK (25 bước)');
  console.log('   - QT-TK1B: Quy trình 1 bước TK (22 bước)');
}

main().catch(console.error);
