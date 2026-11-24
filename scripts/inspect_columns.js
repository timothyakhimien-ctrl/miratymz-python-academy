const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const clean = line.replace('\r', '').trim();
  if (clean && !clean.startsWith('#') && clean.includes('=')) {
    const idx = clean.indexOf('=');
    const key = clean.slice(0, idx).trim();
    const val = clean.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    env[key] = val;
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL || 'https://snzrlptwqswaviweehbh.supabase.co';
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.error('No service key found in env!');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function inspectTable() {
  console.log('Querying registrations table...');
  const { data, error } = await supabase.from('registrations').select('*').limit(1);
  if (error) {
    console.error('Error selecting registrations:', error);
  } else {
    console.log('Columns on registrations:', Object.keys(data[0] || {}));
    console.log('Sample record:', data[0]);
  }
}

inspectTable();
