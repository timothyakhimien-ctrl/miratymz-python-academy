const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
const env = {};
envFile.split('\n').forEach((line) => {
  const idx = line.indexOf('=');
  if (idx > 0) {
    env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function testSchoolPersistence() {
  const { data: signedData } = await supabase.storage
    .from('receipts')
    .createSignedUrl('schools_config.json', 60);

  const res = await fetch(`${signedData.signedUrl}&_cb=${Date.now()}`, { cache: 'no-store' });
  const schools = await res.json();
  console.log('Loaded schools count:', schools.length);

  const gotegs = schools.find((s) => s.id === 'gotegs-intl');
  const origUpdatedAt = gotegs.updatedAt;
  const testStamp = new Date().toISOString();

  // Temporarily update updatedAt, upload with cacheControl: '0', then read back immediately
  gotegs.updatedAt = testStamp;
  const { error: uploadErr } = await supabase.storage
    .from('receipts')
    .upload('schools_config.json', Buffer.from(JSON.stringify(schools, null, 2), 'utf-8'), {
      contentType: 'application/json',
      cacheControl: '0',
      upsert: true,
    });
  if (uploadErr) throw uploadErr;

  const { data: signed2 } = await supabase.storage
    .from('receipts')
    .createSignedUrl('schools_config.json', 60);
  const res2 = await fetch(`${signed2.signedUrl}&_cb=${Date.now()}`, { cache: 'no-store' });
  const schools2 = await res2.json();
  const gotegs2 = schools2.find((s) => s.id === 'gotegs-intl');
  console.log('Immediate read-back matches updatedAt?:', gotegs2.updatedAt === testStamp);

  // Restore original timestamp
  gotegs2.updatedAt = origUpdatedAt;
  await supabase.storage
    .from('receipts')
    .upload('schools_config.json', Buffer.from(JSON.stringify(schools2, null, 2), 'utf-8'), {
      contentType: 'application/json',
      cacheControl: '0',
      upsert: true,
    });
  console.log('Restored original timestamp cleanly.');
}

testSchoolPersistence().catch((e) => {
  console.error(e);
  process.exit(1);
});
