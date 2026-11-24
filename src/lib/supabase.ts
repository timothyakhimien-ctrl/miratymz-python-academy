import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://snzrlptwqswaviweehbh.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Safe client creator
function safeCreateClient(key: string) {
  if (!supabaseUrl || !key) {
    throw new Error('Supabase client initialization failed: Missing Supabase URL or Key.');
  }
  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Public client (for safe read operations if permitted by RLS)
export const supabase = supabaseAnonKey
  ? safeCreateClient(supabaseAnonKey)
  : (null as unknown as ReturnType<typeof createClient>);

// Privileged server client (strictly uses server-side SUPABASE_SERVICE_ROLE_KEY)
export function getServiceSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables. ' +
      'Please ensure this secret is configured in Vercel or your server environment.'
    );
  }
  return safeCreateClient(serviceKey);
}
