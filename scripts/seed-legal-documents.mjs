#!/usr/bin/env node
/**
 * Seed script: Import legal documents from legalData.ts into Supabase
 * 
 * Usage:
 *   node scripts/seed-legal-documents.mjs
 * 
 * Requirements:
 *   - VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.development
 *   - Run AFTER applying the migration: 20260508_create_legal_documents.sql
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env
const envPath = join(__dirname, '..', '.env.development');
const envContent = readFileSync(envPath, 'utf-8');
const env = Object.fromEntries(
    envContent.split('\n')
        .filter(line => line.includes('=') && !line.startsWith('#'))
        .map(line => { const [k, ...v] = line.split('='); return [k.trim(), v.join('=').trim()]; })
);

const SUPABASE_URL = env['VITE_SUPABASE_URL'];
const SUPABASE_KEY = env['VITE_SUPABASE_ANON_KEY'];

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.development');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ========================================
// Dynamic import of legalData (ESM compatible)
// ========================================
async function loadLegalData() {
    // We read the .ts file and evaluate it manually since we can't directly import TS
    // Instead, use a compiled/converted version — see note below
    const dataPath = join(__dirname, '..', 'features', 'legal-documents', 'legalData.ts');
    const content = readFileSync(dataPath, 'utf-8');
    
    // Extract the legalDocuments array using regex to find the export
    // This is a simple approach — the proper way is to use ts-node or tsx
    console.log('⚠️  Note: For full data seeding, run with tsx:');
    console.log('   npx tsx scripts/seed-legal-documents.mjs');
    console.log('');
    console.log(`📄 File size: ${(content.length / 1024 / 1024).toFixed(2)}MB`);
    
    // Since we're using ESM with tsx, we can import directly
    const module = await import('../features/legal-documents/legalData.ts').catch(() => null);
    if (!module) {
        console.error('❌ Could not import legalData.ts. Run with: npx tsx scripts/seed-legal-documents.mjs');
        process.exit(1);
    }
    return module.legalDocuments;
}

async function seedLegalDocuments() {
    console.log('🌱 Starting legal documents seed...\n');

    let legalDocuments;
    try {
        legalDocuments = await loadLegalData();
    } catch (err) {
        console.error('Failed to load data:', err.message);
        process.exit(1);
    }

    console.log(`📚 Found ${legalDocuments.length} documents to seed\n`);

    let docCount = 0, chapterCount = 0, articleCount = 0;
    const errors = [];

    for (const doc of legalDocuments) {
        // 1. Upsert document
        const { error: docErr } = await supabase.from('legal_documents').upsert({
            id: doc.id,
            code: doc.code,
            title: doc.title,
            short_title: doc.shortTitle ?? null,
            type: doc.type,
            issued_date: doc.issuedDate ?? null,
            effective_date: doc.effectiveDate ?? null,
            issued_by: doc.issuedBy ?? null,
            status: doc.status,
            summary: doc.summary ?? null,
            file_name: doc.fileName ?? null,
            file_path: doc.filePath ?? null,
            file_size: doc.fileSize ?? null,
            tags: doc.tags ?? [],
            related_doc_ids: doc.relatedDocIds ?? [],
        }, { onConflict: 'id' });

        if (docErr) {
            errors.push(`Doc ${doc.id}: ${docErr.message}`);
            continue;
        }
        docCount++;

        // 2. Upsert chapters
        for (let ci = 0; ci < (doc.chapters ?? []).length; ci++) {
            const ch = doc.chapters[ci];
            const { error: chErr } = await supabase.from('legal_chapters').upsert({
                id: ch.id,
                document_id: doc.id,
                code: ch.code,
                title: ch.title,
                sort_order: ci,
            }, { onConflict: 'id' });

            if (chErr) {
                errors.push(`Chapter ${ch.id}: ${chErr.message}`);
                continue;
            }
            chapterCount++;

            // 3. Upsert articles in batches of 20
            const arts = ch.articles ?? [];
            for (let ai = 0; ai < arts.length; ai += 20) {
                const batch = arts.slice(ai, ai + 20).map((art, idx) => ({
                    id: art.id,
                    chapter_id: ch.id,
                    document_id: doc.id,
                    code: art.code,
                    title: art.title,
                    summary: art.summary ?? null,
                    content: art.content ?? null,
                    full_content: art.fullContent ?? null,
                    sort_order: ai + idx,
                }));

                const { error: artErr } = await supabase.from('legal_articles').upsert(batch, { onConflict: 'id' });
                if (artErr) {
                    errors.push(`Articles batch in ${ch.id}: ${artErr.message}`);
                } else {
                    articleCount += batch.length;
                }
            }
        }

        process.stdout.write(`\r✅ Processed ${docCount}/${legalDocuments.length} documents...`);
    }

    console.log('\n\n========== SEED COMPLETE ==========');
    console.log(`📄 Documents: ${docCount}`);
    console.log(`📂 Chapters:  ${chapterCount}`);
    console.log(`📝 Articles:  ${articleCount}`);
    
    if (errors.length > 0) {
        console.log(`\n⚠️  Errors (${errors.length}):`);
        errors.forEach(e => console.log(`   - ${e}`));
    } else {
        console.log('\n✅ No errors!');
    }
    console.log('====================================');
    console.log('\n💡 Next steps:');
    console.log('   1. Verify data in Supabase dashboard');
    console.log('   2. Delete features/legal-documents/legalData.ts');
    console.log('   3. Update LegalDocumentSearch.tsx to use LegalDocumentService');
}

seedLegalDocuments().catch(console.error);
