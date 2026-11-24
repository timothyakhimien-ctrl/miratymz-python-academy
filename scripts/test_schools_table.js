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

async function check() {
  const { data, error } = await client.from('schools').select('*').limit(1);
  console.log('schools table in Supabase:', { count: data?.length, error: error?.message });
}
check();
