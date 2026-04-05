const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
if (!process.env.VITE_SUPABASE_URL) require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    console.log("Fetching workflows...");
    const { data: workflows, error: selErr } = await supabase.from('workflows').select('id, code, category');
    if (selErr) {
        console.error("Select error:", selErr);
        process.exit(1);
    }
    
    console.log('Total workflows:', workflows?.length);
    
    // According to the image, the user sees old workflows under "Nghiệp vụ", "Nhân sự", "Tài chính", which translate to 'other', 'hr', 'finance'.
    // Their codes in the picture are: QT-06 (thiết bị y tế), QT-01/LCNT (lựa chọn nhà thầu), QC-LV, QT-02, QT-03, QT-TUTT
    const internalCats = ['finance', 'hr', 'document', 'asset', 'other', 'implementation'];
    const validCodes = ['QT-TK1B', 'QT-TK2B', 'QT-TK3B', 'QT-TLDA', 'QT-GPMB', 'QT-01/TĐTK']; // Standard + new internal
    
    const toDelete = workflows?.filter(w => !validCodes.includes(w.code)) || [];
    
    console.log('To delete:', toDelete.map(w => w.code));
    
    for (const w of toDelete) {
        console.log('Deleting', w.code, '...');
        await supabase.from('workflow_edges').delete().eq('workflow_id', w.id);
        await supabase.from('workflow_nodes').delete().eq('workflow_id', w.id);
        const { error: delErr } = await supabase.from('workflows').delete().eq('id', w.id);
        if (delErr) {
             console.error('Delete error for', w.code, ':', delErr);
        } else {
             console.log('Deleted successfully', w.code);
        }
    }
    console.log('Done');
    process.exit(0);
}
run().catch(err => {
    console.error(err);
    process.exit(1);
});
