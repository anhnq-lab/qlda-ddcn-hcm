import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

(async () => {
    const { data: instances, error: instErr } = await supabase.from('workflow_instances').select('*').order('created_at', { ascending: false }).limit(5);
    if (instErr) { console.error("Inst Err:", instErr); return; }
    console.log('Recent Instances count:', instances?.length);
    
    if (instances && instances.length > 0) {
        console.log("Latest instance project ID:", instances[0].reference_id);
        const { data: tasks, error: tasksErr } = await supabase.from('workflow_tasks').select('id, name, instance_id, project_id').eq('instance_id', instances[0].id).limit(10);
        if (tasksErr) { console.error("Task Err:", tasksErr); return; }
        console.log('Tasks for most recent instance:', tasks);
    }
})();
