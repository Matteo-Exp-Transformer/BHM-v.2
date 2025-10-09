-- =============================================
-- MIGRATION 001: Supabase Auth Setup
-- Description: Create new tables for multi-company auth
-- Author: Claude AI Assistant
-- Date: 2025-01-09
-- =============================================

-- IMPORTANT: Execute this in Supabase SQL Editor
-- This script creates new tables WITHOUT touching existing ones
-- RLS is prepared but NOT activated yet

-- =============================================
-- STEP 1: Create company_members (Junction Table)
-- =============================================

CREATE TABLE IF NOT EXISTS public.company_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  role varchar NOT NULL CHECK (role IN ('admin', 'responsabile', 'dipendente', 'collaboratore')),
  staff_id uuid REFERENCES public.staff(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true NOT NULL,
  joined_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,

  -- Un utente può avere UN SOLO ruolo per azienda
  UNIQUE(user_id, company_id)
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_company_members_user_id
  ON public.company_members(user_id);

CREATE INDEX IF NOT EXISTS idx_company_members_company_id
  ON public.company_members(company_id);

CREATE INDEX IF NOT EXISTS idx_company_members_active
  ON public.company_members(is_active)
  WHERE is_active = true;

-- Indice composito per lookup ottimizzato
CREATE INDEX IF NOT EXISTS idx_company_members_lookup
  ON public.company_members(user_id, company_id, is_active);

COMMENT ON TABLE public.company_members IS 'Junction table for N:N relationship between users and companies. Manages roles and active memberships.';

-- =============================================
-- STEP 2: Create user_sessions (Active Company Tracking)
-- =============================================

CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  active_company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  last_activity timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,

  -- Un utente ha UNA SOLA sessione attiva
  UNIQUE(user_id)
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id
  ON public.user_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_user_sessions_company_id
  ON public.user_sessions(active_company_id);

-- Indice composito per query frequenti
CREATE INDEX IF NOT EXISTS idx_user_sessions_active
  ON public.user_sessions(user_id, active_company_id);

COMMENT ON TABLE public.user_sessions IS 'Tracks active company selection for each user. Updated on company switch.';

-- =============================================
-- STEP 3: Create invite_tokens (Email Invites)
-- =============================================

CREATE TABLE IF NOT EXISTS public.invite_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token varchar UNIQUE NOT NULL,
  email varchar NOT NULL,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  role varchar NOT NULL CHECK (role IN ('admin', 'responsabile', 'dipendente', 'collaboratore')),
  staff_id uuid REFERENCES public.staff(id) ON DELETE SET NULL,
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,

  -- Validazione: token scaduto o usato
  CHECK (used_at IS NULL OR used_at <= now()),
  CHECK (expires_at > created_at)
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_invite_tokens_token
  ON public.invite_tokens(token);

CREATE INDEX IF NOT EXISTS idx_invite_tokens_email
  ON public.invite_tokens(email);

CREATE INDEX IF NOT EXISTS idx_invite_tokens_company
  ON public.invite_tokens(company_id);

-- Indice per cleanup token scaduti
CREATE INDEX IF NOT EXISTS idx_invite_tokens_expired
  ON public.invite_tokens(expires_at)
  WHERE used_at IS NULL;

COMMENT ON TABLE public.invite_tokens IS 'Email invite tokens for staff onboarding. Tokens expire after 7 days.';

-- =============================================
-- STEP 4: Create audit_logs (HACCP Compliance)
-- =============================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  table_name varchar NOT NULL,
  record_id uuid NOT NULL,
  action varchar NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'COMPLETE', 'APPROVE', 'REJECT')),
  old_data jsonb,
  new_data jsonb,
  user_role varchar,
  user_email varchar,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Indici per query audit (partitioned by company and time)
CREATE INDEX IF NOT EXISTS idx_audit_logs_company_id
  ON public.audit_logs(company_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id
  ON public.audit_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name
  ON public.audit_logs(table_name, record_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
  ON public.audit_logs(created_at DESC);

-- Indice per ricerche HACCP compliance
CREATE INDEX IF NOT EXISTS idx_audit_logs_haccp
  ON public.audit_logs(company_id, table_name, action, created_at DESC);

COMMENT ON TABLE public.audit_logs IS 'Complete audit trail for HACCP compliance. Records all data modifications.';

-- =============================================
-- STEP 5: Update user_profiles (Migration Path)
-- =============================================

-- Add auth_user_id column (will replace clerk_user_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'auth_user_id'
  ) THEN
    ALTER TABLE public.user_profiles
    ADD COLUMN auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

    COMMENT ON COLUMN public.user_profiles.auth_user_id IS 'Supabase auth.users.id (replaces clerk_user_id)';
  END IF;
END $$;

-- Add index on auth_user_id
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_user_id
  ON public.user_profiles(auth_user_id);

-- Note: clerk_user_id will be removed in a later migration after data migration

-- =============================================
-- STEP 6: Add Updated_at Triggers
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to new tables
DROP TRIGGER IF EXISTS update_company_members_updated_at ON public.company_members;
CREATE TRIGGER update_company_members_updated_at
  BEFORE UPDATE ON public.company_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_sessions_updated_at ON public.user_sessions;
CREATE TRIGGER update_user_sessions_updated_at
  BEFORE UPDATE ON public.user_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- STEP 7: Verification Queries
-- =============================================

-- Run these to verify tables were created:
/*
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('company_members', 'user_sessions', 'invite_tokens', 'audit_logs')
ORDER BY table_name, ordinal_position;

SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('company_members', 'user_sessions', 'invite_tokens', 'audit_logs')
ORDER BY tablename, indexname;
*/

-- =============================================
-- MIGRATION COMPLETE
-- =============================================

-- Next steps:
-- 1. Run database/functions/rls_helpers.sql
-- 2. Run database/policies/rls_policies.sql (preparation only)
-- 3. Implement frontend auth
-- 4. Enable RLS (in Phase 7)

SELECT 'Migration 001 completed successfully!' as status;
