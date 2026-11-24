const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const clean = line.replace('\r', '').trim();
  if (clean && !clean.startsWith('#') && clean.includes('=')) {
    const idx = clean.indexOf('=');
    env[clean.slice(0, idx).trim()] = clean.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
  }
});

const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function testStats() {
  console.log('Testing query with is_deleted column:');
  const query1 = await client.from('registrations').select('status, amount, is_deleted');
  console.log('Result 1 (with is_deleted):', { count: query1.data?.length, error: query1.error?.message });

  console.log('Testing query with standard schema columns:');
  const query2 = await client.from('registrations').select('id, tracking_id, status, amount, category, receipt_url');
  console.log('Result 2 (clean standard query):', { count: query2.data?.length, error: query2.error?.message });
}

testStats();
