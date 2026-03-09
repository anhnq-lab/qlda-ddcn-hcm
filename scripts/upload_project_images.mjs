import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabase = createClient(
    'https://gyuxymbmbfvvygvcyyrd.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5dXh5bWJtYmZ2dnlndmN5eXJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMzQ3NDcsImV4cCI6MjA4ODYxMDc0N30.EGxnvkq5RooWMi1J9xmHhosTChIoPv-3uhU0p6YYYcQ'
);

const ARTIFACTS_DIR = 'C:/Users/Personal/.gemini/antigravity/brain/a7ce75f9-9e3d-4e3c-8967-b164ffe1afc0';

const projectImages = [
    { projectId: 'DA-SVD-THONG-NHAT', file: 'stadium_thong_nhat_1773037708716.png', name: 'SVD Thống Nhất' },
    { projectId: 'DA-DONG-Y-DONG-DUOC', file: 'dong_y_dong_duoc_1773037723112.png', name: 'Đông Y Đông Dược' },
    { projectId: 'DA-BV-DK-HOC-MON', file: 'bv_da_khoa_hoc_mon_1773037741619.png', name: 'BV ĐK Hóc Môn' },
    { projectId: 'DA-BV-NHI-DONG-2', file: 'bv_nhi_dong_2_1773037768680.png', name: 'BV Nhi đồng 2' },
    { projectId: 'DA-BV-PHCN-A2', file: 'bv_phuc_hoi_chuc_nang_1773037783890.png', name: 'BV PHCN A2' },
    { projectId: 'DA-NGAN-HANG-MAU', file: 'ngan_hang_mau_1773037799511.png', name: 'Ngân hàng Máu' },
    { projectId: 'DA-BV-NTP-KHU-C', file: 'bv_nguyen_tri_phuong_1773037818465.png', name: 'BV NTP Khu C' },
];

for (const item of projectImages) {
    const filePath = `${ARTIFACTS_DIR}/${item.file}`;
    const fileBuffer = readFileSync(filePath);
    const storagePath = `covers/${item.projectId}.png`;

    console.log(`Uploading ${item.name}...`);

    const { data, error } = await supabase.storage
        .from('project-images')
        .upload(storagePath, fileBuffer, {
            contentType: 'image/png',
            upsert: true,
        });

    if (error) {
        console.error(`  ❌ Upload failed: ${error.message}`);
        continue;
    }

    const { data: urlData } = supabase.storage
        .from('project-images')
        .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;
    console.log(`  ✅ Uploaded → ${publicUrl}`);

    const { error: dbError } = await supabase
        .from('projects')
        .update({ image_url: publicUrl })
        .eq('project_id', item.projectId);

    if (dbError) {
        console.error(`  ❌ DB update failed: ${dbError.message}`);
    } else {
        console.log(`  ✅ DB updated for ${item.projectId}`);
    }
}

console.log('\n🎉 Done!');
