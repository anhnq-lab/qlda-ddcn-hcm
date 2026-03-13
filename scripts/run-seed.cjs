// Run seed SQL files against Supabase using REST API
// Usage: node scripts/run-seed.cjs

const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://gyuxymbmbfvvygvcyyrd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5dXh5bWJtYmZ2dnlndmN5eXJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMzQ3NDcsImV4cCI6MjA4ODYxMDc0N30.EGxnvkq5RooWMi1J9xmHhosTChIoPv-3uhU0p6YYYcQ';

async function runSQL(sql) {
    const url = new URL('/rest/v1/rpc/exec_sql', SUPABASE_URL);
    // Use the pg endpoint directly
    const pgUrl = new URL('/pg', SUPABASE_URL);
    
    return new Promise((resolve, reject) => {
        const postData = sql;
        const options = {
            hostname: 'gyuxymbmbfvvygvcyyrd.supabase.co',
            path: '/rest/v1/rpc/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                console.log('Status:', res.statusCode);
                if (res.statusCode >= 400) {
                    console.error('Error:', data);
                    reject(new Error(data));
                } else {
                    resolve(data);
                }
            });
        });

        req.on('error', reject);
        req.write(JSON.stringify({ query: sql }));
        req.end();
    });
}

// Read seed files in order
const seedDir = path.join(__dirname, '..', 'database', 'seed');
const seedFiles = [
    '015_seed_employees_full.sql',
    '016_seed_project_members_tasks.sql', 
    '017_seed_capital_financial.sql',
];

async function main() {
    for (const file of seedFiles) {
        const filePath = path.join(seedDir, file);
        if (!fs.existsSync(filePath)) {
            console.log(`Skipping ${file} (not found)`);
            continue;
        }
        console.log(`\n📄 Reading ${file}...`);
        const sql = fs.readFileSync(filePath, 'utf-8');
        console.log(`   ${sql.length} bytes`);
        console.log(`   First 100 chars: ${sql.substring(0, 100)}...`);
    }
    
    console.log('\n✅ All seed files ready!');
    console.log('⚠️  Please run them manually in Supabase SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/gyuxymbmbfvvygvcyyrd/sql');
    console.log('\nRun in order:');
    seedFiles.forEach((f, i) => console.log(`   ${i + 1}. ${f}`));
}

main().catch(console.error);
