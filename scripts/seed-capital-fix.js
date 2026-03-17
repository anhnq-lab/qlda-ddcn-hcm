const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function seed() {
    try {
        console.log('Seeding capital data...');
        // 1. Get projects
        const { data: projects, error: pError } = await supabase.from('projects').select('project_id').limit(10);
        if (pError || !projects?.length) return console.error('No projects found', pError);
        
        const projectId = projects[0].project_id; // Chọn 1 DA để test
        console.log(`Targeting project: ${projectId}`);
        
        // 2. Clear old disbursements
        await supabase.from('disbursements').delete().eq('project_id', projectId);
        
        // 3. Get first capital plan
        const { data: plans } = await supabase.from('capital_plans').select('*').eq('project_id', projectId).limit(1);
        const planId = plans?.[0]?.plan_id || null;
        
        // 4. Create nice mock disbursements
        const docs = [
            {
                disbursement_id: `GN-${Date.now()}-1`,
                project_id: projectId,
                capital_plan_id: planId,
                amount: 300000000, // 300tr tam ung
                date: '2025-01-15',
                type: 'TamUng',
                form_type: 'Mẫu 25',
                treasury_code: 'KBNN-001',
                description: 'Tạm ứng hợp đồng thi công số 12/HĐ-XD',
                contract_number: '12/HĐ-XD',
                status: 'Approved',
                cumulative_before: 0,
                advance_balance: 300000000
            },
            {
                disbursement_id: `GN-${Date.now()}-2`,
                project_id: projectId,
                capital_plan_id: planId,
                amount: 500000000, // 500tr TTKLHT
                date: '2025-03-10',
                type: 'ThanhToanKLHT',
                form_type: 'Mẫu 26',
                treasury_code: 'KBNN-001',
                description: 'Thanh toán đợt 1 khối lượng xây lắp',
                contract_number: '12/HĐ-XD',
                status: 'Approved',
                cumulative_before: 300000000,
                advance_balance: 300000000
            },
            {
                disbursement_id: `GN-${Date.now()}-3`,
                project_id: projectId,
                capital_plan_id: planId,
                amount: 100000000, // Thu hoi 100tr
                date: '2025-03-11',
                type: 'ThuHoiTamUng',
                form_type: 'Mẫu 27',
                treasury_code: 'KBNN-001',
                description: 'Thu hồi tạm ứng đợt 1 (30%)',
                contract_number: '12/HĐ-XD',
                status: 'Approved',
                cumulative_before: 800000000,
                advance_balance: 200000000
            }
        ];
        
        const { error: insertError } = await supabase.from('disbursements').insert(docs);
        if (insertError) {
            console.error('Lỗi khi chèn dữ liệu:', insertError);
        } else {
            console.log('Seed completed successfully!');
        }
        
    } catch (err) {
        console.error(err);
    }
}

seed();
