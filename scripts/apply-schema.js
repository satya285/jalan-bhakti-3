import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_REF = 'oawedqkowdqomywvtahw';
const sqlFilePath = path.join(__dirname, '..', 'supabase', 'schema.sql');

async function main() {
  const password = process.env.DB_PASSWORD || process.argv[2];
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN || process.argv[3];
  const customDbUrl = process.env.DATABASE_URL;

  const sql = fs.readFileSync(sqlFilePath, 'utf8');

  // Method 1: Using Supabase Management API if access token provided
  if (accessToken && accessToken.startsWith('sbp_')) {
    console.log(`Mengirimkan schema.sql melalui Supabase Management API untuk project: ${PROJECT_REF}...`);
    try {
      const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: sql })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }

      console.log('✅ BERHASIL: Seluruh tabel, view, trigger, dan seed data berhasil dibuat di Supabase!');
      return;
    } catch (err) {
      console.error('❌ Gagal via Management API:', err.message);
    }
  }

  // Method 2: Direct PostgreSQL connection
  if (password || customDbUrl) {
    const connectionString = customDbUrl || `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(password)}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require`;
    
    console.log(`Menghubungkan ke PostgreSQL Supabase (${PROJECT_REF})...`);
    const client = new pg.Client({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });

    try {
      await client.connect();
      console.log('Terkoneksi ke database PostgreSQL!');
      console.log('Menjalankan schema.sql...');
      await client.query(sql);
      console.log('✅ BERHASIL: Seluruh tabel, view, trigger, dan seed data berhasil dibuat di Supabase!');
    } catch (err) {
      console.error('❌ Gagal mengeksekusi SQL:', err.message);
    } finally {
      await client.end();
    }
    return;
  }

  console.log(`
================================================================================
CARA EKSEKUSI SCHEMA.SQL KE SUPABASE (Project: ${PROJECT_REF})
================================================================================
Anda dapat mengeksekusi schema.sql dengan salah satu dari 2 cara termudah berikut:

CARA 1 (Paling Cepat via Web Dashboard Supabase):
1. Buka link SQL Editor project Anda:
   👉 https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new
2. Buka file: jalan-bhakti-3/supabase/schema.sql
3. Salin (Copy) semua isi file tersebut dan Paste di SQL Editor.
4. Klik tombol "RUN" (hijau).

CARA 2 (Otomatis via Terminal):
Jalankan perintah ini dengan Password Database Supabase Anda:
   node scripts/apply-schema.js "PASSWORD_DATABASE_ANDA"
================================================================================
  `);
}

main();
