const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const crypto = require('crypto');

function hashCode(code) {
  return crypto.createHash('sha256').update(code.trim().toUpperCase()).digest('hex');
}

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.trim().split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function testSchoolVerification() {
  const { data: file } = await supabase.storage.from('receipts').download('schools_config.json');
  const schools = JSON.parse(await file.text());
  const gotegs = schools.find(s => s.id === 'gotegs-intl');

  console.log('Testing Go-Tegs validation:');
  const inputCode = 'GOTEGS-2026';
  const hashedInput = hashCode(inputCode);
  const match = hashedInput === gotegs.accessCodeHash || inputCode === gotegs.accessCode;
  console.log('Matched code:', match);
  console.log('School fee revealed:', 5000);
  console.log('Bank name:', gotegs.bankName);
  console.log('Account name:', gotegs.accountName);
  console.log('Account number:', gotegs.accountNumber);
}

testSchoolVerification();
