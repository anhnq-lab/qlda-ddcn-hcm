import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load .env from root
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const GROUPS = ['QN', 'A', 'B', 'C', 'C_KTKT'];
const PHASES = ['preparation', 'execution', 'completion'];

const PHASE_NAMES = {
    preparation: 'Chuẩn bị dự án',
    execution: 'Thực hiện dự án',
    completion: 'Kết thúc xây dựng'
};

const GROUP_NAMES = {
    QN: 'Quan trọng Quốc gia',
    A: 'Nhóm A',
    B: 'Nhóm B',
    C: 'Nhóm C (Báo cáo NCKT)',
    C_KTKT: 'Nhóm C (Báo cáo KT-KT)'
};

async function migrate() {
  console.log('--- STARTING MIGRATION ---');

  // 1. Fetch old templates
  const { data: oldTmpls, error: err1 } = await supabase.from('workflow_templates').select('*');
  if (err1) throw err1;

  console.log(`Found ${oldTmpls.length} existing templates.`);

  // If already migrated (>3 templates), we might not want to re-run blindly, but let's assume we clean up first.
  console.log('Fetching all old steps...');
  const { data: allSteps, error: err2 } = await supabase.from('workflow_step_templates').select('*');
  if (err2) throw err2;
  console.log(`Found ${allSteps.length} existing steps.`);

  console.log('Deleting existing templates to re-seed...');
  const oldIds = oldTmpls.map(t => t.id);
  if (oldIds.length > 0) {
      const { error: delErr } = await supabase.from('workflow_templates').delete().in('id', oldIds);
      if (delErr) throw delErr;
  }

  console.log('Old templates & steps deleted (cascade).');

  // Re-seed
  let newSortOrder = 1;
  for (const group of GROUPS) {
      console.log(`\nProcessing Group: ${group}`);
      
      for (let i = 0; i < PHASES.length; i++) {
          const phase = PHASES[i];
          const phaseName = PHASE_NAMES[phase];
          const groupName = GROUP_NAMES[group];

          // Create new template
          const newTemplate = {
              name: `GĐ ${phaseName} - ${groupName}`,
              code: `${group}-${phase.substring(0, 4).toUpperCase()}`,
              phase: phase,
              phase_order: i + 1,
              applicable_groups: [group],
              is_active: true,
              sort_order: newSortOrder++
          };

          const { data: tmplInserted, error: tErr } = await supabase
              .from('workflow_templates')
              .insert(newTemplate)
              .select('*')
              .single();

          if (tErr) {
              console.error('Error inserting template', newTemplate, tErr);
              continue;
          }

          console.log(` -> Created Template: ${tmplInserted.name} (${tmplInserted.id})`);

          // Find steps from old template of the same phase, which apply to this group
          const matchingOldTmpls = oldTmpls.filter(t => t.phase === phase);
          let stepsToClone = [];
          
          for (const ot of matchingOldTmpls) {
              const otSteps = allSteps.filter(s => s.workflow_id === ot.id);
              for (const step of otSteps) {
                  // If group is C_KTKT, we inherit from C for now, or we can just inherit all C steps and let Admin trim them in UI
                  const oldGroups = step.applicable_groups || [];
                  const appliesToGroup = oldGroups.includes(group) || (group === 'C_KTKT' && oldGroups.includes('C'));
                  
                  if (appliesToGroup) {
                      stepsToClone.push(step);
                  }
              }
          }

          // Sort by original step_number just in case
          stepsToClone.sort((a,b) => a.step_number - b.step_number);

          // Insert steps
          const newStepsData = stepsToClone.map((oldStep, index) => {
              const ns = { ...oldStep };
              delete ns.id; // DB will auto-generate new UUID
              delete ns.created_at;
              delete ns.updated_at;
              ns.workflow_id = tmplInserted.id;
              ns.applicable_groups = [group]; // Localize completely to this group
              ns.step_number = index + 1;
              ns.sort_order = index + 1;
              return ns;
          });

          if (newStepsData.length > 0) {
              const { error: sErr } = await supabase.from('workflow_step_templates').insert(newStepsData);
              if (sErr) {
                  console.error('  --> Error inserting steps', sErr);
              } else {
                  console.log(`  --> Cloned ${newStepsData.length} steps.`);
              }
          } else {
              console.log(`  --> 0 steps applied to this group.`);
          }
      }
  }

  console.log('\n--- MIGRATION COMPLETE ---');
}

migrate().catch(console.error);
