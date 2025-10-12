-- ========================================
-- RIPARA SCHEMA AUTH CORROTTO
-- ========================================
-- Errore: "Database error finding user"
-- Causa: auth.users eliminato con DELETE invece che via API
-- Soluzione: Pulisci tabelle auth correlate

-- ⚠️ ESEGUI QUESTO SOLO SE HAI FATTO RESET CON DELETE FROM auth.users

-- ========================================
-- STEP 1: PULISCI TABELLE AUTH CORRELATE
-- ========================================

DO $$
BEGIN
  -- Disabilita trigger
  SET session_replication_role = replica;
  
  -- Pulisci tutte le tabelle auth in ordine corretto
  DELETE FROM auth.refresh_tokens;
  RAISE NOTICE '✅ refresh_tokens pulito';
  
  DELETE FROM auth.sessions;
  RAISE NOTICE '✅ sessions pulito';
  
  DELETE FROM auth.mfa_factors;
  RAISE NOTICE '✅ mfa_factors pulito';
  
  DELETE FROM auth.mfa_challenges;
  RAISE NOTICE '✅ mfa_challenges pulito';
  
  DELETE FROM auth.mfa_amr_claims;
  RAISE NOTICE '✅ mfa_amr_claims pulito';
  
  DELETE FROM auth.sso_providers;
  RAISE NOTICE '✅ sso_providers pulito';
  
  DELETE FROM auth.sso_domains;
  RAISE NOTICE '✅ sso_domains pulito';
  
  DELETE FROM auth.saml_providers;
  RAISE NOTICE '✅ saml_providers pulito';
  
  DELETE FROM auth.saml_relay_states;
  RAISE NOTICE '✅ saml_relay_states pulito';
  
  DELETE FROM auth.identities;
  RAISE NOTICE '✅ identities pulito';
  
  DELETE FROM auth.users;
  RAISE NOTICE '✅ users pulito';
  
  DELETE FROM auth.audit_log_entries;
  RAISE NOTICE '✅ audit_log_entries pulito';
  
  -- Riabilita trigger
  SET session_replication_role = DEFAULT;
  
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Schema auth riparato!';
  RAISE NOTICE 'Ora puoi riprovare il signup.';
END $$;

-- ========================================
-- STEP 2: VERIFICA PULIZIA
-- ========================================

SELECT 
  'auth.users' as tabella, COUNT(*) as records FROM auth.users
UNION ALL
SELECT 'auth.identities', COUNT(*) FROM auth.identities
UNION ALL
SELECT 'auth.sessions', COUNT(*) FROM auth.sessions
UNION ALL
SELECT 'auth.refresh_tokens', COUNT(*) FROM auth.refresh_tokens;

-- Tutti dovrebbero essere 0

-- ========================================
-- STEP 3: VERIFICA POLICIES
-- ========================================

SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('company_members', 'user_sessions', 'invite_tokens')
ORDER BY tablename;

-- Tutte dovrebbero avere rls_enabled = true

-- ========================================
-- STEP 4: RIPROVA SIGNUP
-- ========================================

-- Ora l'app dovrebbe funzionare!
-- Apri il link invito e riprova a creare account

-- ========================================
-- ALTERNATIVA: Reset via Dashboard (PIÙ SICURO)
-- ========================================

/*
Se lo script sopra non funziona:

1. Vai su Supabase Dashboard
2. Authentication → Users
3. Se ci sono utenti, elimina UNO PER UNO cliccando:
   - Tre puntini (...) → Delete user
   
Questo usa l'API admin corretta e non corrompe lo schema.

4. Poi riprova signup

*/

