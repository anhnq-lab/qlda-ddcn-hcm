import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { getInternalWorkflowTemplates } from '../features/workflows/data/seedInternalWorkflows';
import { getStandardWorkflowTemplates } from '../features/workflows/data/seedWorkflows';

console.log('Loading environment variables...');
try {
  const envPath = fs.existsSync(path.resolve(process.cwd(), '.env.local')) 
      ? path.resolve(process.cwd(), '.env.local')
      : path.resolve(process.cwd(), '.env');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      let key = match[1].trim();
      let val = match[2].trim().replace(/^['"]|['"]$/g, '');
      process.env[key] = val;
    }
  });
} catch (e) {
  console.log('No .env found or error reading it', e);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Starting seed process...');
  const allTemplates = [...getStandardWorkflowTemplates(), ...getInternalWorkflowTemplates()];
  
  for (const wfInput of allTemplates) {
    console.log(`Processing workflow: ${wfInput.code} - ${wfInput.name}`);
    const { data: wf, error: wfErr } = await supabase.from('workflows').upsert({
        name: wfInput.name,
        code: wfInput.code,
        description: wfInput.description,
        category: wfInput.category as any,
        version: 1,
        is_active: true
    }, { onConflict: 'code' }).select().single();
    
    if (wfErr) { 
        console.error(`Workflow Upsert Error for ${wfInput.code}:`, wfErr); 
        continue; 
    }
    
    console.log(`Upserted workflow id: ${wf.id}`);

    await supabase.from('workflow_edges').delete().eq('workflow_id', wf.id);
    await supabase.from('workflow_nodes').delete().eq('workflow_id', wf.id);

    let prevId: string | null = null;

    for (const stepInput of wfInput.steps) {
        const s = stepInput as any;
        const { data: node, error: nErr } = await supabase.from('workflow_nodes').insert({
            workflow_id: wf.id,
            name: s.name,
            step_order: s.step_order || 1,
            type: s.type,
            assignee_role: s.assignee_role || s.role,
            sla_formula: s.sla_formula || s.sla,
            metadata: {
                description: s.description,
                output: s.output,
                legal_basis: s.legal_basis,
                guidelines: s.guidelines,
                sub_tasks: s.sub_tasks,
                coordinating_role: s.coordinating_role,
                phase: s.phase,
                is_parallel: s.is_parallel
            }
        }).select().single();

        if (nErr) { 
            console.error(`Node Insert Error for step ${s.name}:`, nErr); 
            continue; 
        }
        
        if (prevId) {
            await supabase.from('workflow_edges').insert({
                workflow_id: wf.id,
                source_node_id: prevId,
                target_node_id: node.id
            });
        }
        prevId = node.id;
    }
    console.log(`=> Seeded nodes for ${wf.code}`);
  }
  console.log("=== SEED COMPLETE ===");
}

seed().catch(err => {
    console.error("Fatal error:", err);
});
