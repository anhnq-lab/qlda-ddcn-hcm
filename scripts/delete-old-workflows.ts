import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data: workflows } = await supabase.from('workflows').select('id, code, category');
    console.log('Total workflows:', workflows?.length);
    
    // According to the seeded internal workflows, there is only 'QT-01/TĐTK'.
    // Delete ones that are internal but NOT the new one.
    const internalCats = ['finance', 'hr', 'document', 'asset', 'other'];
    const toDelete = workflows?.filter((w: any) => internalCats.includes(w.category) && w.code !== 'QT-01/TĐTK') || [];
    
    console.log('To delete:', toDelete.map((w: any) => w.code));
    
    for (const w of toDelete) {
        await supabase.from('workflow_edges').delete().eq('workflow_id', w.id);
        await supabase.from('workflow_nodes').delete().eq('workflow_id', w.id);
        await supabase.from('workflows').delete().eq('id', w.id);
        console.log('Deleted', w.code);
    }
    console.log('Done');
}
run();
