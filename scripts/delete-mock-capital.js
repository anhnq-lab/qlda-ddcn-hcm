import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('Fetching projects...');
    const { data: projects } = await supabase.from('projects').select('project_id').like('project_id', '%BV-NTP%');
    console.log('Projects:', projects);

    console.log('Fetching all mid term plans...');
    const { data: plans } = await supabase.from('capital_plans').select('project_id, plan_id, amount, period_start').eq('plan_type', 'mid_term');
    console.log('All mid term plans:', plans);
}
run();
