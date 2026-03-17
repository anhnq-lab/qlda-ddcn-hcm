const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedContractors() {
  console.log('Seeding contractors...');
  
  // 1. Get existing projects to assign to contractors
  const { data: projects, error: pErr } = await supabase.from('projects').select('project_id, project_name');
  if (pErr) throw pErr;
  
  if (!projects || projects.length === 0) {
    console.log('No projects found to assign.');
    return;
  }
  
  console.log(`Found ${projects.length} projects.`);

  // 2. Fetch or create some contractors
  const sampleContractors = [
    {
      contractor_id: 'C_VIN',
      full_name: 'Tập đoàn Vingroup - Công ty CP',
      address: 'Hà Nội',
      tax_code: '0101245486',
      representative: 'Phạm Nhật Vượng',
      is_foreign: false
    },
    {
      contractor_id: 'C_COTE',
      full_name: 'Công ty Cổ phần Xây dựng Coteccons',
      address: 'TP.HCM',
      tax_code: '0303443233',
      representative: 'Bolat Duisenov',
      is_foreign: false
    },
    {
      contractor_id: 'C_HOAB',
      full_name: 'Công ty Cổ phần Tập đoàn Xây dựng Hòa Bình',
      address: 'TP.HCM',
      tax_code: '0301471646',
      representative: 'Lê Viết Hải',
      is_foreign: false
    }
  ];

  for (const c of sampleContractors) {
    const { error: err } = await supabase.from('contractors').upsert(c);
    if (err) console.error('Error upserting contractor', c.contractor_id, err);
  }
  console.log('Upserted sample contractors.');

  // 3. Create contractor accounts
  const accounts = [
    {
      contractor_id: 'C_VIN',
      username: 'nhathau_vin',
      display_name: 'Đại diện Vingroup',
      email: 'contact@vingroup.net',
      phone: '0901234567',
      is_active: true,
      current_password: 'Password123!',
      allowed_project_ids: projects.slice(0, Math.min(2, projects.length)).map(p => p.project_id)
    },
    {
      contractor_id: 'C_COTE',
      username: 'nhathau_coteccons',
      display_name: 'Đại diện Coteccons',
      email: 'contact@coteccons.vn',
      phone: '0902345678',
      is_active: true,
      current_password: 'Password123!',
      allowed_project_ids: projects.slice(Math.min(1, projects.length - 1), Math.min(3, projects.length)).map(p => p.project_id)
    },
    {
      contractor_id: 'C_HOAB',
      username: 'nhathau_hoabinh',
      display_name: 'Đại diện Hòa Bình',
      email: 'contact@hbcg.vn',
      phone: '0903456789',
      is_active: true,
      current_password: 'Password123!',
      allowed_project_ids: [projects[projects.length - 1].project_id]
    }
  ];

  for (const acc of accounts) {
    let authUserId = null;
    
    // Attempt admin create user
    const { data: newAuthData, error: authErr } = await supabase.auth.admin.createUser({
        email: acc.email,
        password: acc.current_password,
        email_confirm: true,
        user_metadata: { full_name: acc.display_name, contractor_id: acc.contractor_id }
    });
    
    if (authErr && !authErr.message.includes('already exists')) {
        console.error(`Error creating auth user for ${acc.email}:`, authErr.message);
    } else if (newAuthData?.user) {
        authUserId = newAuthData.user.id;
    } else if (authErr && authErr.message.includes('already exists')) {
        // Need to find existing auth user ID
        const { data: listData } = await supabase.auth.admin.listUsers();
        const existing = listData?.users?.find(u => u.email === acc.email);
        if (existing) {
            authUserId = existing.id;
            
            // Also assign allowed_project_ids if existing
        }
    }
    
    // Insert contractor_accounts
    const { error: accErr } = await supabase.from('contractor_accounts').upsert({
      contractor_id: acc.contractor_id,
      username: acc.username,
      display_name: acc.display_name,
      email: acc.email,
      phone: acc.phone,
      is_active: acc.is_active,
      current_password: acc.current_password,
      allowed_project_ids: acc.allowed_project_ids,
      ...(authUserId ? { auth_user_id: authUserId } : {})
    }, { onConflict: 'username' });

    if (accErr) {
      console.error(`Error inserting account ${acc.username}:`, accErr.message);
    } else {
      console.log(`Upserted account: ${acc.username} with projects:`, acc.allowed_project_ids);
    }
  }
  
  console.log('Seeding finished!');
}

seedContractors().catch(console.error);
