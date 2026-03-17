import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DISCIPLINES = [
    'architecture', 'structure', 'mep', 'infrastructure', 
    'fire_safety', 'landscape', 'interior', 'survey', 
    'environmental', 'geotechnical', 'cost_estimation', 'project_management'
];

const DOC_TYPES = [
    'design_basic', 'design_detail', 'design_construction', 'drawing',
    'spec', 'acceptance', 'site_record', 'material_cert', 'test_report',
    'method_statement', 'progress_report', 'payment_request', 'as_built'
];

// Helper to get random item
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper to get random date within last N months
const getRandomDate = (monthsBack) => {
    const d = new Date();
    d.setMonth(d.getMonth() - Math.floor(Math.random() * monthsBack));
    d.setDate(Math.floor(Math.random() * 28) + 1);
    return d.toISOString();
};

async function main() {
    console.log('Fetching existing documents...');
    const { data: docs, error } = await supabase.from('cde_documents').select('doc_id, doc_name, cde_status, upload_date, discipline, doc_type');
    
    if (error) {
        console.error('Error fetching docs:', error);
        return;
    }
    
    if (!docs || docs.length === 0) {
        console.log('No documents found to update.');
        return;
    }
    
    console.log(`Found ${docs.length} documents. Updating metadata...`);
    
    let updatedCount = 0;
    for (const doc of docs) {
        const updates = {
            discipline: getRandomItem(DISCIPLINES),
            doc_type: getRandomItem(DOC_TYPES),
            upload_date: getRandomDate(6),
        };
        
        // Randomly set some realistic statuses if they are all S0
        if (Math.random() > 0.5) {
            const statuses = ['S0', 'S1', 'S2', 'S3', 'A1', 'A1', 'A2', 'B1'];
            updates.cde_status = getRandomItem(statuses);
        }

        const { error: updateError } = await supabase
            .from('cde_documents')
            .update(updates)
            .eq('doc_id', doc.doc_id);
            
        if (updateError) {
            console.error(`Error updating doc ${doc.doc_id}:`, updateError);
        } else {
            updatedCount++;
        }
    }
    
    console.log(`Successfully updated ${updatedCount} documents with realistic demo data.`);
}

main().catch(console.error);
