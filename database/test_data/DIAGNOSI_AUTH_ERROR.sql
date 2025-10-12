-- ========================================
-- DIAGNOSI COMPLETA: Database error finding user
-- ========================================
-- Errore durante supabase.auth.signUp()
-- Indica problema nello schema auth o trigger

-- ========================================
-- STEP 1: VERIFICA SCHEMA AUTH
-- ========================================

-- 1.1 Verifica tabelle auth esistono
SELECT 
  table_name,
  CASE 
    WHEN table_name IS NOT NULL THEN '✅ Esiste'
    ELSE '❌ Mancante'
  END as stato
FROM information_schema.tables
WHERE table_schema = 'auth'
  AND table_name IN ('users', 'identities', 'sessions', 'refresh_tokens', 'audit_log_entries')
ORDER BY table_name;

-- 1.2 Verifica colonne auth.users
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'auth' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- ========================================
-- STEP 2: VERIFICA TRIGGER SU AUTH.USERS
-- ========================================

-- 2.1 Lista trigger su auth.users
SELECT 
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users'
ORDER BY trigger_name;

-- 2.2 Verifica se ci sono trigger AFTER INSERT
-- Questi potrebbero fallire e bloccare il signup
SELECT 
  tgname as trigger_name,
  tgtype,
  tgenabled,
  pg_get_triggerdef(oid) as definition
FROM pg_trigger
WHERE tgrelid = 'auth.users'::regclass
ORDER BY tgname;

-- ========================================
-- STEP 3: VERIFICA FUNZIONI CHIAMATE DA TRIGGER
-- ========================================

-- 3.1 Trova funzioni trigger sullo schema public
SELECT 
  p.proname as function_name,
  pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname LIKE '%trigger%'
  OR p.proname LIKE '%user%'
  OR p.proname LIKE '%auth%'
ORDER BY p.proname;

-- ========================================
-- STEP 4: VERIFICA POLICIES SU AUTH SCHEMA
-- ========================================

-- Verifica se ci sono policies che bloccano
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual as using_expression,
  with_check
FROM pg_policies
WHERE schemaname = 'auth'
ORDER BY tablename, policyname;

-- ========================================
-- STEP 5: VERIFICA ESTENSIONI
-- ========================================

-- Verifica che estensioni necessarie siano installate
SELECT 
  extname as extension_name,
  extversion as version,
  CASE 
    WHEN extname IS NOT NULL THEN '✅ Installata'
    ELSE '❌ Mancante'
  END as stato
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'pgcrypto', 'pgjwt')
ORDER BY extname;

-- ========================================
-- STEP 6: TEST SIGNUP DIRETTO (Bypass App)
-- ========================================

-- ATTENZIONE: Questa query NON crea davvero un utente
-- È solo per vedere se la funzione auth esiste

SELECT 
  routine_name,
  routine_schema,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'auth'
  AND routine_name LIKE '%sign%'
ORDER BY routine_name;

-- ========================================
-- SOLUZIONE PROBABILE: TRIGGER ROTTO
-- ========================================

-- Il reset potrebbe aver eliminato tabelle che i trigger si aspettano
-- Verifica se esiste la tabella user_profiles (richiesta da alcuni trigger)

SELECT 
  table_name,
  CASE 
    WHEN table_name = 'user_profiles' THEN '✅ Esiste'
    ELSE '❌ Mancante'
  END as stato
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'user_profiles';

-- Se mancante (count = 0), ricreala:
/*
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR NOT NULL,
  first_name VARCHAR,
  last_name VARCHAR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert during signup" ON public.user_profiles 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own profile" ON public.user_profiles
FOR SELECT USING (auth.uid() = auth_user_id);
*/

-- ========================================
-- VERIFICA TRIGGER SPECIFICI
-- ========================================

-- Cerca trigger che potrebbero fallire
SELECT 
  t.tgname as trigger_name,
  c.relname as table_name,
  p.proname as function_name,
  CASE t.tgenabled
    WHEN 'O' THEN '✅ Enabled'
    WHEN 'D' THEN '❌ Disabled'
    ELSE 'Unknown'
  END as status
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE c.relname IN ('users', 'identities')
  OR p.proname LIKE '%user%'
  OR p.proname LIKE '%profile%'
ORDER BY c.relname, t.tgname;

-- ========================================
-- SOLUZIONE DRASTICA: Disabilita Trigger Temporaneamente
-- ========================================

-- Se identifichi un trigger problematico, disabilitalo:
/*
ALTER TABLE auth.users DISABLE TRIGGER [nome_trigger];
*/

-- Dopo signup, riabilitalo:
/*
ALTER TABLE auth.users ENABLE TRIGGER [nome_trigger];
*/

