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

async function testRpc() {
  const rpcs = ['exec_sql', 'execute_sql', 'sql', 'run_sql'];
  for (const r of rpcs) {
    const { data, error } = await client.rpc(r, { query: 'SELECT 1;', sql: 'SELECT 1;' });
    console.log(`RPC ${r}:`, error ? error.message : data);
  }
}

testRpc();
