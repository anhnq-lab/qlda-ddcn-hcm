import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: 'd:/01_Projects/qlda-ddcn-hcm/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials in .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    try {
        const projectId = 'DA-BV-NTP-KHU-C';
        console.log(`Cleaning up mock mid-term plans for ${projectId}...`);

        // Get mid-term plans for project
        const { data: plans, error: fetchErr } = await supabase
            .from('capital_plans')
            .select('*')
            .eq('project_id', projectId)
            .eq('plan_type', 'mid_term')
            .eq('period_start', 2021);

        if (fetchErr) {
            console.error('Fetch Error:', fetchErr);
            return;
        }

        if (plans.length === 0) {
            console.log('No mock plans found for 2021-2025.');
            return;
        }

        console.log(`Found ${plans.length} extra plans. Deleting...`);

        for (const p of plans) {
            const { error: delErr } = await supabase
                .from('capital_plans')
                .delete()
                .eq('plan_id', p.plan_id);
            
            if (delErr) {
                console.error(`Error deleting plan ${p.plan_id}:`, delErr);
            } else {
                console.log(`Deleted plan: ${p.plan_id}`);
            }
        }
    } catch (err) {
        console.error('Fatal:', err);
    }
}

run();
