import crypto from 'crypto';
import { getServiceSupabase } from './supabase';

export interface School {
  id: string;
  name: string;
  address: string;
  area: string;
  accessCode: string; // Plaintext or master code kept on server only
  accessCodeHash: string; // SHA-256 hash for secure server comparison
  paymentMethod: 'bank_transfer' | 'school_office' | 'pending';
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  paymentInstructions?: string;
  isEnabled: boolean;
  hasPaymentConfigured: boolean;
  createdAt: string;
  updatedAt: string;
}

// Public view of school (SAFE TO SEND TO FRONTEND - NEVER CONTAINS ACCESS CODES)
export interface PublicSchool {
  id: string;
  name: string;
  address: string;
  area: string;
  isEnabled: boolean;
  hasPaymentConfigured: boolean;
}

function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code.trim().toUpperCase()).digest('hex');
}

// 15 Real Schools in and around Isheri Pipeline / Isheri Olofin / Alimosho, Lagos
// GO-TEGS International School is specifically featured with configured payment support.
export const INITIAL_SCHOOLS: School[] = [
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

/**
 * Loads all schools from Supabase Storage (receipts/schools_config.json) with cache-busting,
 * or falls back to INITIAL_SCHOOLS.
 */
export async function getAllSchools(): Promise<School[]> {
  try {
    const supabase = getServiceSupabase();

    // Bypass Supabase Storage CDN cache by fetching signed/public URL with a unique cache-buster
    const { data: signedData } = await supabase.storage
      .from('receipts')
      .createSignedUrl('schools_config.json', 60);

    const urlToFetch = signedData?.signedUrl
      ? `${signedData.signedUrl}&_cb=${Date.now()}`
      : `${supabase.storage.from('receipts').getPublicUrl('schools_config.json').data.publicUrl}?_cb=${Date.now()}`;

    const res = await fetch(urlToFetch, { cache: 'no-store' });
    if (res.ok) {
      const parsed: School[] = await res.json();
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // Fallback to SDK download if fetch failed
    const { data: file, error } = await supabase.storage.from('receipts').download('schools_config.json');
    if (!error && file) {
      const text = await file.text();
      const parsed: School[] = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read schools_config.json from storage, using embedded directory:', err);
  }
  return INITIAL_SCHOOLS;
}

/**
 * Saves all schools to Supabase Storage (receipts/schools_config.json) with cacheControl: '0'.
 */
export async function saveAllSchools(schools: School[]): Promise<boolean> {
  try {
    const supabase = getServiceSupabase();
    const buffer = Buffer.from(JSON.stringify(schools, null, 2), 'utf-8');
    const { error } = await supabase.storage.from('receipts').upload('schools_config.json', buffer, {
      contentType: 'application/json',
      cacheControl: '0',
      upsert: true,
    });
    if (error) {
      console.error('Failed to save schools_config.json:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error saving schools to storage:', err);
    return false;
  }
}

/**
 * Returns public directory of schools. Access codes are strictly stripped out.
 */
export async function getPublicSchoolDirectory(): Promise<PublicSchool[]> {
  const all = await getAllSchools();
  return all
    .filter((s) => s.isEnabled)
    .map((s) => ({
      id: s.id,
      name: s.name,
      address: s.address,
      area: s.area,
      isEnabled: s.isEnabled,
      hasPaymentConfigured: Boolean(s.hasPaymentConfigured),
    }));
}

/**
 * Verifies a school code on the server.
 * NEVER returns the code or hashes. Only returns success status, the verified ₦5,000 fee, and payment details.
 */
export async function verifySchoolCode(schoolId: string, providedCode: string): Promise<{
  valid: boolean;
  message?: string;
  school?: {
    id: string;
    name: string;
    fee: number;
    hasPaymentConfigured: boolean;
    paymentMethod: string;
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    paymentInstructions?: string;
  };
}> {
  if (!schoolId || !providedCode) {
    return { valid: false, message: 'Please select a school and enter its access code.' };
  }

  const all = await getAllSchools();
  const school = all.find((s) => s.id === schoolId && s.isEnabled);

  if (!school) {
    return { valid: false, message: 'Selected school was not found or registration is currently disabled.' };
  }

  const cleanProvided = providedCode.trim().toUpperCase();
  const providedHash = hashCode(cleanProvided);

  const isMatch =
    providedHash === school.accessCodeHash ||
    cleanProvided === (school.accessCode || '').trim().toUpperCase();

  if (!isMatch) {
    return {
      valid: false,
      message: 'Invalid access code for this school. Please check the code given by your school coordinator or teacher.',
    };
  }

  // Code is verified!
  return {
    valid: true,
    school: {
      id: school.id,
      name: school.name,
      fee: 5000, // ₦5,000 discounted school fee revealed only upon verification
      hasPaymentConfigured: Boolean(school.hasPaymentConfigured),
      paymentMethod: school.paymentMethod,
      bankName: school.bankName,
      accountName: school.accountName,
      accountNumber: school.accountNumber,
      paymentInstructions: school.paymentInstructions,
    },
  };
}
