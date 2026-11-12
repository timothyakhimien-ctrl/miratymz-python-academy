import { createClient } from '@supabase/supabase-js';

// Base configuration with reliable fallbacks so operations succeed even if dashboard env vars are pending
const DEFAULT_SUPABASE_URL = 'https://snzrlptwqswaviweehbh.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuenJscHR3cXN3YXZpd2VlaGJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQzNTI4NDksImV4cCI6MjEwOTkyODg0OX0.VGmKNXV1AlwCErntM4maI3K23dIU2f2dqN6NWWBJ2yA';
const DEFAULT_SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuenJscHR3cXN3YXZpd2VlaGJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NDM1Mjg0OSwiZXhwIjoyMTA5OTI4ODQ5fQ.yPi2_2lq25BoXIGcs_muL-FyaCYkZ1D8Ng6VXWr4TtU';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SUPABASE_SERVICE_ROLE_KEY;

// Safe client creator
function safeCreateClient(key: string) {
  const effectiveKey = key || DEFAULT_SUPABASE_ANON_KEY;
  return createClient(supabaseUrl, effectiveKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Public client
export const supabase = safeCreateClient(supabaseAnonKey);

// Privileged server client (always uses service role key)
export function getServiceSupabase() {
  const effectiveKey = supabaseServiceKey || DEFAULT_SUPABASE_SERVICE_ROLE_KEY;
  return safeCreateClient(effectiveKey);
}
