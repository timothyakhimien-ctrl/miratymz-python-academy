import { createClient } from '@supabase/supabase-js';

// Base configuration – fallback URL is kept for local dev convenience
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://snzrlptwqswaviweehbh.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// ---------- Helper to safely create a Supabase client ----------
function safeCreateClient(key: string) {
  if (!key) {
    console.warn('Supabase key is missing – client creation skipped.');
    // Return a dummy object that satisfies the minimal API used in the code.
    // Each method simply throws so that runtime failures are explicit.
    const dummy = new Proxy({} as any, {
      get(_, prop) {
        return () => {
          throw new Error(`Supabase client method '${String(prop)}' called without a valid key.`);
        };
      },
    });
    return dummy;
  }
  return createClient(supabaseUrl, key);
}

// Public (anonymous) client – used by front‑end pages. May be undefined in production if the env var is not set.
export const supabase = safeCreateClient(supabaseAnonKey);

// Server‑side privileged client – used by admin API routes.
export function getServiceSupabase() {
  // Prefer the service role key; fall back to the anon key if necessary.
  if (supabaseServiceKey) {
    return safeCreateClient(supabaseServiceKey);
  }
  console.warn('SUPABASE_SERVICE_ROLE_KEY is not defined – falling back to anonymous client.');
  return supabase;
}

