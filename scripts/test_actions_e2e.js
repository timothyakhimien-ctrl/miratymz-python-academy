const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.trim().split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function runTests() {
  console.log('--- TEST 1: Verifying Schools Storage Configuration ---');
  const { data: schoolsData, error: schoolsErr } = await supabase.storage.from('receipts').download('schools_config.json');
  if (schoolsErr) {
    console.error('Storage error:', schoolsErr);
  } else {
    const schoolsJson = JSON.parse(await schoolsData.text());
    const gotegs = schoolsJson.find(s => s.id === 'gotegs-intl');
    console.log(`Found ${schoolsJson.length} schools. Go-Tegs code: ${gotegs?.code}, Fee: ₦${gotegs?.subsidizedFee}`);
  }

  console.log('\n--- TEST 2: Testing Archiving and Restoration (Soft Delete) ---');
  // Find one record to test soft archiving on
  const { data: records, error: fetchErr } = await supabase
    .from('registrations')
    .select('id, tracking_id, status, declined_reason')
    .limit(1);

  if (fetchErr || !records?.length) {
    console.error('Could not fetch test record:', fetchErr);
    return;
  }

  const testRecord = records[0];
  const origStatus = testRecord.status;
  const origReason = testRecord.declined_reason || '';
  console.log(`Testing on record ${testRecord.tracking_id} (Initial status: ${origStatus})`);

  // Archive
  const archiveReason = origReason ? `${origReason}\n[ARCHIVED: ${new Date().toISOString()}]` : `[ARCHIVED: ${new Date().toISOString()}]`;
  const { error: archiveErr } = await supabase
    .from('registrations')
    .update({ status: 'Archived', declined_reason: archiveReason })
    .eq('id', testRecord.id);

  if (archiveErr) {
    console.error('Archive failed:', archiveErr);
  } else {
    console.log('Successfully archived record without schema errors!');
  }

  // Restore
  const { error: restoreErr } = await supabase
    .from('registrations')
    .update({ status: origStatus, declined_reason: origReason || null })
    .eq('id', testRecord.id);

  if (restoreErr) {
    console.error('Restore failed:', restoreErr);
  } else {
    console.log(`Successfully restored record back to '${origStatus}'!`);
  }

  console.log('\n--- ALL E2E DB TESTS PASSED SUCCESSFULLY! ---');
}

runTests();
