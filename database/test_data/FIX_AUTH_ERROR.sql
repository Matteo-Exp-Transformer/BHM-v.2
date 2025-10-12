-- ========================================
-- FIX AUTH ERROR: Database error finding user
-- ========================================
-- Errore: "Database error finding user" durante signup
-- Causa: Probabilmente mancano policies RLS o trigger su auth schema

-- ========================================
-- DIAGNOSI: Verifica Stato Database
-- ========================================

-- 1. Verifica schema auth esiste
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name = 'auth';

-- 2. Verifica tabella auth.users esiste
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'auth' 
  AND table_name = 'users';

-- 3. Verifica RLS su tabelle public
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('companies', 'company_members', 'user_sessions', 'user_profiles', 'invite_tokens')
ORDER BY tablename;

-- 4. Verifica policies esistenti
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('company_members', 'user_sessions', 'user_profiles')
ORDER BY tablename, policyname;

-- ========================================
-- FIX 1: Disabilita RLS Temporaneamente
-- ========================================
-- Per permettere la creazione del primo utente

-- Disabilita RLS su tabelle critiche durante signup
ALTER TABLE public.company_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- ⚠️ NOTA: Questo è temporaneo per debug!
-- Dopo che il primo utente è creato, riabilita RLS

-- ========================================
-- FIX 2: Aggiungi Policy per Signup
-- ========================================
-- Permetti INSERT durante signup (senza user_id ancora)

-- Policy per company_members: Permetti INSERT anche senza auth
DROP POLICY IF EXISTS "Enable insert for signup" ON public.company_members;
CREATE POLICY "Enable insert for signup"
ON public.company_members
FOR INSERT
WITH CHECK (true);  -- Temporaneo: permetti tutto

-- Policy per user_sessions: Permetti INSERT
DROP POLICY IF EXISTS "Enable insert for signup" ON public.user_sessions;
CREATE POLICY "Enable insert for signup"
ON public.user_sessions
FOR INSERT
WITH CHECK (true);

-- Policy per user_profiles: Permetti INSERT
DROP POLICY IF EXISTS "Enable insert for signup" ON public.user_profiles;
CREATE POLICY "Enable insert for signup"
ON public.user_profiles
FOR INSERT
WITH CHECK (true);

-- ========================================
-- FIX 3: Verifica Trigger
-- ========================================

-- Vedi tutti i trigger sulle tabelle
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table IN ('company_members', 'user_sessions', 'user_profiles')
ORDER BY event_object_table, trigger_name;

-- ========================================
-- FIX 4: Crea user_profiles se manca
-- ========================================

-- Verifica se esiste
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'user_profiles';

-- Se non esiste (count = 0), creala:
/*
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR NOT NULL,
  first_name VARCHAR,
  last_name VARCHAR,
  staff_id UUID REFERENCES public.staff(id),
  role VARCHAR DEFAULT 'guest',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_user_id 
ON public.user_profiles(auth_user_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email 
ON public.user_profiles(email);
*/

-- ========================================
-- TEST SIGNUP
-- ========================================
-- Dopo aver applicato i fix, testa signup via SQL:

-- NON ESEGUIRE - Solo per reference
/*
-- Questo simula il signup (ma va fatto dall'app)
SELECT auth.signup(
  email := 'test@example.com',
  password := 'TestPass123!'
);
*/

-- ========================================
-- SOLUZIONE RAPIDA: Bypass RLS
-- ========================================

-- Se tutto il resto fallisce, disabilita RLS su TUTTE le tabelle
-- ⚠️ USA SOLO PER TESTING LOCALE! MAI IN PRODUZIONE!

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', r.tablename);
    RAISE NOTICE 'Disabled RLS on: %', r.tablename;
  END LOOP;
END $$;

-- Dopo che hai creato il primo utente, riabilita:
/*
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
    RAISE NOTICE 'Enabled RLS on: %', r.tablename;
  END LOOP;
END $$;
*/

