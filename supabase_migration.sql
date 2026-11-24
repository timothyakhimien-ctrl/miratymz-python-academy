-- =====================================================================
-- MIRA TYMZ PROGRAMMING ACADEMY — SAFE PRODUCTION SCHEMA MIGRATION
-- Non-destructive: Does NOT drop or truncate any existing tables or rows.
-- Adds security, new columns, school directory, and RLS lockdown.
-- =====================================================================

-- 1. ENRICH REGISTRATIONS TABLE (Non-destructive additions)
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS admission_letter_url TEXT,
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_reference TEXT,
  ADD COLUMN IF NOT EXISTS payment_notes TEXT,
  ADD COLUMN IF NOT EXISTS school_id TEXT,
  ADD COLUMN IF NOT EXISTS school_name TEXT;

-- Fast index performance
CREATE INDEX IF NOT EXISTS idx_registrations_is_deleted ON public.registrations(is_deleted);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_tracking_id ON public.registrations(tracking_id);
CREATE INDEX IF NOT EXISTS idx_registrations_school_id ON public.registrations(school_id);
CREATE INDEX IF NOT EXISTS idx_registrations_category ON public.registrations(category);

-- 2. CREATE SCHOOLS TABLE FOR SCHOOL STUDENT DIRECTORY & PAYMENT CONFIG
CREATE TABLE IF NOT EXISTS public.schools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  area TEXT DEFAULT 'Isheri Pipeline, Lagos',
  access_code_hash TEXT NOT NULL,
  payment_method TEXT DEFAULT 'bank_transfer',
  bank_name TEXT,
  account_name TEXT,
  account_number TEXT,
  payment_instructions TEXT,
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. LOCK DOWN ROW LEVEL SECURITY (RLS)
-- Enables strict protection so client-side anonymous scraping is blocked
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- Drop any legacy permissive policies on registrations that allowed public anon select
DO $$
BEGIN
  BEGIN
    DROP POLICY IF EXISTS "Allow anon read registrations" ON public.registrations;
    DROP POLICY IF EXISTS "Public can view registrations" ON public.registrations;
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.registrations;
    DROP POLICY IF EXISTS "Public read access" ON public.registrations;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;

-- Service Role (Server API routes) maintains complete access
DROP POLICY IF EXISTS "Service role full access on registrations" ON public.registrations;
CREATE POLICY "Service role full access on registrations"
  ON public.registrations FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on admin_settings" ON public.admin_settings;
CREATE POLICY "Service role full access on admin_settings"
  ON public.admin_settings FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on admin_users" ON public.admin_users;
CREATE POLICY "Service role full access on admin_users"
  ON public.admin_users FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on schools" ON public.schools;
CREATE POLICY "Service role full access on schools"
  ON public.schools FOR ALL TO service_role USING (true) WITH CHECK (true);
