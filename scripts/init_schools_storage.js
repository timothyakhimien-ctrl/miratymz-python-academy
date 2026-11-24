const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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

function hashCode(code) {
  return crypto.createHash('sha256').update(code.trim().toUpperCase()).digest('hex');
}

const INITIAL_SCHOOLS = [
  {
    id: 'gotegs-intl',
    name: 'Go-Tegs International School',
    address: '15, Ayesanmi Street, GloryLand Estate, Pipeline Bus Stop',
    area: 'Isheri Pipeline, Lagos',
    accessCode: 'GOTEGS-2026',
    accessCodeHash: hashCode('GOTEGS-2026'),
    paymentMethod: 'bank_transfer',
    bankName: 'OPay / PalmPay',
    accountName: 'Go-Tegs Int. School (Python Cohort)',
    accountNumber: '8168575186',
    paymentInstructions: 'Transfer the ₦5,000 discounted student tuition. Use student full name and tracking reference as transfer narration.',
    isEnabled: true,
    hasPaymentConfigured: true,
    createdAt: '2026-11-24T18:00:00.000Z',
    updatedAt: '2026-11-24T18:00:00.000Z',
  },
  {
    id: 'phidel-college',
    name: 'Phidel College',
    address: '12/13, Phidel College Street, Old Garage Bus Stop',
    area: 'Isheri Olofin, Lagos',
    accessCode: 'PHIDEL-2026',
    accessCodeHash: hashCode('PHIDEL-2026'),
    paymentMethod: 'pending',
    paymentInstructions: 'Payment arrangements for this school are currently being finalized with the school administration. Please contact your school coordinator.',
    isEnabled: true,
    hasPaymentConfigured: false,
    createdAt: '2026-11-24T18:00:00.000Z',
    updatedAt: '2026-11-24T18:00:00.000Z',
  },
  {
    id: 'isheri-comm-primary',
    name: 'Community Primary School, Isheri-Olofin',
    address: 'Pipeline Road, Isheri-Olofin',
    area: 'Isheri Pipeline, Lagos',
    accessCode: 'CPS-ISHERI-2026',
    accessCodeHash: hashCode('CPS-ISHERI-2026'),
    paymentMethod: 'pending',
    paymentInstructions: 'Payment instructions will be shared via your school ICT coordinator.',
    isEnabled: true,
    hasPaymentConfigured: false,
    createdAt: '2026-11-24T18:00:00.000Z',
    updatedAt: '2026-11-24T18:00:00.000Z',
  },
  {
    id: 'isheri-comm-grammar',
    name: 'Isheri-Olofin Community Grammar School',
    address: 'Community Road, Isheri Olofin',
    area: 'Isheri Olofin, Lagos',
    accessCode: 'ICGS-2026',
    accessCodeHash: hashCode('ICGS-2026'),
    paymentMethod: 'pending',
    paymentInstructions: 'School registration arrangements pending.',
    isEnabled: true,
    hasPaymentConfigured: false,
    createdAt: '2026-11-24T18:00:00.000Z',
    updatedAt: '2026-11-24T18:00:00.000Z',
  },
  {
    id: 'wellspring-montessori',
    name: 'Wellspring Shalom Montessori School',
    address: 'Pipeline Road, Alimosho',
    area: 'Isheri Pipeline, Lagos',
    accessCode: 'WELLSPRING-2026',
    accessCodeHash: hashCode('WELLSPRING-2026'),
    paymentMethod: 'pending',
    paymentInstructions: 'Payment arrangements currently being finalized.',
    isEnabled: true,
    hasPaymentConfigured: false,
    createdAt: '2026-11-24T18:00:00.000Z',
    updatedAt: '2026-11-24T18:00:00.000Z',
  },
  {
    id: 'kings-intl-college',
    name: 'Kings International College',
    address: 'Isheri Olofin / Idimu Road',
    area: 'Isheri Olofin, Lagos',
    accessCode: 'KINGS-2026',
    accessCodeHash: hashCode('KINGS-2026'),
    paymentMethod: 'pending',
    paymentInstructions: 'Payment instructions pending administrative sign-off.',
    isEnabled: true,
    hasPaymentConfigured: false,
    createdAt: '2026-11-24T18:00:00.000Z',
    updatedAt: '2026-11-24T18:00:00.000Z',
  },
  {
    id: 'pavic-intl',
    name: 'Pavic International Secondary School',
    address: 'Off Pipeline Road, Isheri Olofin',
    area: 'Isheri Pipeline, Lagos',
    accessCode: 'PAVIC-2026',
    accessCodeHash: hashCode('PAVIC-2026'),
    paymentMethod: 'pending',
    paymentInstructions: 'Payment instructions pending.',
    isEnabled: true,
    hasPaymentConfigured: false,
    createdAt: '2026-11-24T18:00:00.000Z',
    updatedAt: '2026-11-24T18:00:00.000Z',
  },
  {
    id: 'gospel-college',
    name: 'Gospel College',
    address: 'Old Garage / Pipeline axis, Isheri Olofin',
    area: 'Isheri Olofin, Lagos',
    accessCode: 'GOSPEL-2026',
    accessCodeHash: hashCode('GOSPEL-2026'),
    paymentMethod: 'pending',
    paymentInstructions: 'Payment arrangements pending.',
    isEnabled: true,
    hasPaymentConfigured: false,
    createdAt: '2026-11-24T18:00:00.000Z',
    updatedAt: '2026-11-24T18:00:00.000Z',
  },
  {
    id: 'du-standard',
    name: 'Du Standard Educational Institution',
    address: 'Pipeline Bus Stop Area, Isheri Olofin',
    area: 'Isheri Pipeline, Lagos',
    accessCode: 'DUSTANDARD-2026',
    accessCodeHash: hashCode('DUSTANDARD-2026'),
    paymentMethod: 'pending',
    paymentInstructions: 'Payment arrangements pending.',
    isEnabled: true,
    hasPaymentConfigured: false,
    createdAt: '2026-11-24T18:00:00.000Z',
    updatedAt: '2026-11-24T18:00:00.000Z',
  },
  {
    id: 'do-estdot',
    name: 'Do Estdot International School',
    address: 'Isheri-Olofin Extension, Alimosho',
    area: 'Isheri Olofin, Lagos',
    accessCode: 'ESTDOT-2026',
    accessCodeHash: hashCode('ESTDOT-2026'),
    paymentMethod: 'pending',
    paymentInstructions: 'Payment arrangements pending.',
    isEnabled: true,
    hasPaymentConfigured: false,
    createdAt: '2026-11-24T18:00:00.000Z',
    updatedAt: '2026-11-24T18:00:00.000Z',
  },
  {
    id: 'st-michaels-model',
    name: "St. Michael's Model College",
    address: 'Pipeline Road, Isheri Olofin',
    area: 'Isheri Pipeline, Lagos',
    accessCode: 'STMICHAELS-2026',
    accessCodeHash: hashCode('STMICHAELS-2026'),
    paymentMethod: 'pending',
    paymentInstructions: 'Payment instructions pending.',
    isEnabled: true,
    hasPaymentConfigured: false,
    createdAt: '2026-11-24T18:00:00.000Z',
    updatedAt: '2026-11-24T18:00:00.000Z',
  },
  {
    id: 'solid-rock-intl',
    name: 'Solid Rock International School',
    address: 'Pipeline Bus Stop corridor, Isheri Olofin',
    area: 'Isheri Pipeline, Lagos',
    accessCode: 'SOLIDROCK-2026',
    accessCodeHash: hashCode('SOLIDROCK-2026'),
    paymentMethod: 'pending',
    paymentInstructions: 'Payment arrangements pending.',
    isEnabled: true,
    hasPaymentConfigured: false,
    createdAt: '2026-11-24T18:00:00.000Z',
    updatedAt: '2026-11-24T18:00:00.000Z',
  },
  {
    id: 'great-grace-heritage',
    name: 'Great Grace Heritage School',
    address: 'GloryLand / Pipeline Area, Isheri Olofin',
    area: 'Isheri Pipeline, Lagos',
    accessCode: 'GREATGRACE-2026',
    accessCodeHash: hashCode('GREATGRACE-2026'),
    paymentMethod: 'pending',
    paymentInstructions: 'Payment arrangements pending.',
    isEnabled: true,
    hasPaymentConfigured: false,
    createdAt: '2026-11-24T18:00:00.000Z',
    updatedAt: '2026-11-24T18:00:00.000Z',
  },
];

async function initSchools() {
  const buf = Buffer.from(JSON.stringify(INITIAL_SCHOOLS, null, 2), 'utf-8');
  const { data, error } = await client.storage.from('receipts').upload('schools_config.json', buf, {
    contentType: 'application/json',
    upsert: true,
  });
  if (error) {
    console.error('Failed to upload schools_config.json:', error);
  } else {
    console.log('Successfully uploaded schools_config.json:', data);
  }
}

initSchools();
