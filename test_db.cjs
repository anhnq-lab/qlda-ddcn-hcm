const { createClient } = require('@supabase/supabase-js');
const url = 'https://gyuxymbmbfvvygvcyyrd.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5dXh5bWJtYmZ2dnlndmN5eXJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMzQ3NDcsImV4cCI6MjA4ODYxMDc0N30.EGxnvkq5RooWMi1J9xmHhosTChIoPv-3uhU0p6YYYcQ';
const supabase = createClient(url, key);

(async () => {
    try {
        console.log('--- GET INSTANCES ---');
        const { data: insts, error: e1 } = await supabase.from('workflow_instances').select('*').limit(1);
        if (e1) console.error('E1:', e1);
        else console.log("Columns:", Object.keys(insts[0] || {}));

    } catch(e) {
        console.error('Catch:', e);
    }
})();
