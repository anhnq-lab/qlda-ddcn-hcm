import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gyuxymbmbfvvygvcyyrd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5dXh5bWJtYmZ2dnlndmN5eXJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMzQ3NDcsImV4cCI6MjA4ODYxMDc0N30.EGxnvkq5RooWMi1J9xmHhosTChIoPv-3uhU0p6YYYcQ'
);

const WF_IDS = [
  'b6f46631-31c8-4d31-a1cb-357a52febbbd', // QT-TK1B
  'c2e0ef04-0cd7-446b-9cc9-7c01bd44c162', // QT-TK2B
  '6c4ed1db-aa53-4e1b-b7b7-152f5db1ed76', // QT-TK3B
];

async function main() {
  // Step 1: Fetch all nodes for the 3 workflows (no ordering by non-existent column)
  const { data: allNodes, error: fetchErr } = await supabase
    .from('workflow_nodes')
    .select('id, name, workflow_id, metadata')
    .in('workflow_id', WF_IDS);

  if (fetchErr) {
    console.error('Fetch error:', fetchErr);
    return;
  }

  console.log(`Total nodes in 3 workflows: ${allNodes.length}`);

  // Step 2: Show all unique sub_process values first
  const subProcesses = [...new Set(allNodes.map(n => n.metadata?.sub_process).filter(Boolean))];
  console.log('\nAll sub_process values:');
  subProcesses.forEach(sp => console.log(`  - "${sp}"`));

  // Step 3: Filter nodes whose sub_process matches "Quyết định chủ trương đầu tư"
  const targetNodes = allNodes.filter(n => {
    const sp = (n.metadata?.sub_process || '').toLowerCase();
    return sp.includes('quyết định chủ trương') || sp.includes('chủ trương đầu tư');
  });

  console.log(`\nNodes matching "Quyết định chủ trương đầu tư": ${targetNodes.length}`);
  targetNodes.forEach(n => {
    console.log(`  [${n.workflow_id.substring(0,8)}] ${(n.name || '').substring(0, 70)} | sub_process=${n.metadata?.sub_process}`);
  });

  if (targetNodes.length === 0) {
    console.log('\nNo matching nodes found!');
    return;
  }

  const idsToDelete = targetNodes.map(n => n.id);
  console.log(`\nIDs to delete: ${idsToDelete.length}`);
  idsToDelete.forEach(id => console.log(`  ${id}`));

  // Step 4: Delete edges referencing these nodes
  console.log('\n--- Deleting edges ---');
  for (const nodeId of idsToDelete) {
    const { error: e1 } = await supabase.from('workflow_edges').delete().eq('source_node_id', nodeId);
    const { error: e2 } = await supabase.from('workflow_edges').delete().eq('target_node_id', nodeId);
    if (e1) console.error(`  Edge source err ${nodeId}:`, e1.message);
    if (e2) console.error(`  Edge target err ${nodeId}:`, e2.message);
  }
  console.log('Edges cleaned.');

  // Step 5: Hard delete nodes
  console.log('\n--- Hard-deleting nodes ---');
  const { data: deleted, error: delErr } = await supabase
    .from('workflow_nodes')
    .delete()
    .in('id', idsToDelete)
    .select('id');

  if (delErr) {
    console.error('Hard delete error:', delErr);
    console.log('\nFalling back to soft delete...');
    const { data: softDel, error: softErr } = await supabase
      .from('workflow_nodes')
      .update({ is_deleted: true })
      .in('id', idsToDelete)
      .select('id');
    if (softErr) {
      console.error('Soft delete ALSO failed:', softErr);
    } else {
      console.log(`Soft-deleted ${softDel?.length || 0} nodes.`);
    }
  } else {
    console.log(`Hard-deleted ${deleted?.length || 0} nodes!`);
    if ((deleted?.length || 0) === 0) {
      console.log('WARNING: 0 rows deleted. RLS is still blocking. Trying soft delete...');
      const { data: softDel, error: softErr } = await supabase
        .from('workflow_nodes')
        .update({ is_deleted: true })
        .in('id', idsToDelete)
        .select('id');
      if (softErr || !softDel || softDel.length === 0) {
        console.error('Soft delete ALSO returned 0 rows. RLS blocks everything for anon key.');
        console.log('\n*** NEED SERVICE ROLE KEY to bypass RLS ***');
      } else {
        console.log(`Soft-deleted ${softDel.length} nodes via fallback.`);
      }
    }
  }

  // Step 6: Verify
  const { data: remaining } = await supabase
    .from('workflow_nodes')
    .select('id')
    .in('workflow_id', WF_IDS)
    .eq('is_deleted', false);
  console.log(`\nRemaining active nodes in 3 workflows: ${remaining?.length || 0}`);
}

main().catch(console.error);
