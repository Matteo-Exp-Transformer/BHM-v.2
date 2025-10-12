-- ========================================
-- 🚨 RESET COMPLETO DATABASE - ATTENZIONE!
-- ========================================
-- SCOPO: Pulisce TUTTO per testare il flusso da zero
--
-- ⚠️⚠️⚠️ OPERAZIONE IRREVERSIBILE ⚠️⚠️⚠️
-- Elimina:
-- - TUTTE le companies
-- - TUTTI gli utenti (auth.users)
-- - TUTTI i token di invito
-- - TUTTI i dati operativi (staff, departments, products, etc.)
--
-- USA SOLO PER TESTING/SVILUPPO!
-- NON ESEGUIRE MAI IN PRODUZIONE!
--
-- ========================================

-- STEP 1: BACKUP PRIMA DI TUTTO!
-- Vai su Supabase Dashboard → Database → Backups
-- Crea un backup manuale PRIMA di eseguire questo script!

-- ========================================
-- STEP 2: PREVIEW - VEDI COSA VERRÀ ELIMINATO
-- ========================================

-- 2.1 Conta utenti
SELECT COUNT(*) as total_users, 'auth.users' as table_name FROM auth.users
UNION ALL
SELECT COUNT(*), 'companies' FROM public.companies
UNION ALL
SELECT COUNT(*), 'company_members' FROM public.company_members
UNION ALL
SELECT COUNT(*), 'invite_tokens' FROM public.invite_tokens
UNION ALL
SELECT COUNT(*), 'staff' FROM public.staff
UNION ALL
SELECT COUNT(*), 'departments' FROM public.departments
UNION ALL
SELECT COUNT(*), 'products' FROM public.products
UNION ALL
SELECT COUNT(*), 'tasks' FROM public.tasks
UNION ALL
SELECT COUNT(*), 'user_sessions' FROM public.user_sessions
UNION ALL
SELECT COUNT(*), 'audit_logs' FROM public.audit_logs;

-- ========================================
-- STEP 3: ESECUZIONE RESET + GENERA TOKEN INIZIALE
-- ========================================

DO $$ 
DECLARE
  v_users_deleted INTEGER := 0;
  v_companies_deleted INTEGER := 0;
  v_tokens_deleted INTEGER := 0;
  v_initial_token UUID := gen_random_uuid();
  v_invite_link TEXT;
BEGIN
  RAISE NOTICE '🧹 Inizio pulizia database...';
  RAISE NOTICE '';
  
  -- 1. Disabilita trigger temporaneamente
  SET session_replication_role = replica;
  
  -- 2. Pulisci tabelle operativi (CASCADE eliminerà relazioni)
  RAISE NOTICE '📦 Pulizia dati operativi...';
  
  DELETE FROM public.audit_logs;
  DELETE FROM public.user_activity_logs;
  DELETE FROM public.task_completions;
  DELETE FROM public.temperature_readings;
  DELETE FROM public.shopping_list_items;
  DELETE FROM public.shopping_lists;
  DELETE FROM public.maintenance_tasks;
  DELETE FROM public.tasks;
  DELETE FROM public.products;
  DELETE FROM public.product_categories;
  DELETE FROM public.conservation_points;
  DELETE FROM public.staff;
  DELETE FROM public.departments;
  DELETE FROM public.events;
  DELETE FROM public.notes;
  DELETE FROM public.non_conformities;
  DELETE FROM public.company_calendar_settings;
  
  RAISE NOTICE '✅ Dati operativi puliti';
  
  -- 3. Pulisci sessioni e profili
  DELETE FROM public.user_sessions;
  DELETE FROM public.user_profiles;
  
  RAISE NOTICE '✅ Sessioni e profili puliti';
  
  -- 4. Pulisci company_members
  DELETE FROM public.company_members;
  
  RAISE NOTICE '✅ Company members puliti';
  
  -- 5. Pulisci invite_tokens
  DELETE FROM public.invite_tokens;
  GET DIAGNOSTICS v_tokens_deleted = ROW_COUNT;
  
  RAISE NOTICE '✅ % token di invito eliminati', v_tokens_deleted;
  
  -- 6. Pulisci companies
  DELETE FROM public.companies;
  GET DIAGNOSTICS v_companies_deleted = ROW_COUNT;
  
  RAISE NOTICE '✅ % companies eliminate', v_companies_deleted;
  
  -- 7. IMPORTANTE: NON eliminare auth.users direttamente!
  -- Causa corruzione dello schema auth
  -- INVECE: Elimina manualmente dal Dashboard
  
  RAISE NOTICE '';
  RAISE NOTICE '⚠️⚠️⚠️ IMPORTANTE ⚠️⚠️⚠️';
  RAISE NOTICE 'Per eliminare gli utenti:';
  RAISE NOTICE '1. Vai su Supabase Dashboard';
  RAISE NOTICE '2. Authentication → Users';
  RAISE NOTICE '3. Elimina ogni utente manualmente (... → Delete)';
  RAISE NOTICE '';
  RAISE NOTICE 'NON usare DELETE FROM auth.users (causa corruzione!)';
  RAISE NOTICE '';
  
  -- 8. Riabilita trigger
  SET session_replication_role = DEFAULT;
  
  RAISE NOTICE '';
  RAISE NOTICE '🎉 DATABASE RESET COMPLETATO!';
  RAISE NOTICE '📊 Riepilogo:';
  RAISE NOTICE '  - Companies: % eliminate', v_companies_deleted;
  RAISE NOTICE '  - Invite tokens: % eliminati', v_tokens_deleted;
  RAISE NOTICE '  - Users: % eliminati', v_users_deleted;
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🎟️ GENERAZIONE TOKEN INIZIALE PER PAOLO';
  RAISE NOTICE '========================================';
  
  -- 9. Genera token invito iniziale per Paolo (primo admin)
  INSERT INTO public.invite_tokens (
    token,
    email,
    company_id,
    role,
    staff_id,
    invited_by,
    expires_at,
    created_at
  ) VALUES (
    v_initial_token::text,
    'matteo.cavallaro.work@gmail.com',  -- Email Paolo
    NULL,  -- NULL = primo admin, creerà azienda
    'admin',
    NULL,
    NULL,  -- System invite
    NOW() + INTERVAL '30 days',
    NOW()
  );
  
  -- Genera link
  v_invite_link := 'http://localhost:5173/accept-invite?token=' || v_initial_token::text;
  
  RAISE NOTICE '';
  RAISE NOTICE '👤 PRIMO ADMIN: Paolo Dettori';
  RAISE NOTICE '📧 Email: matteo.cavallaro.work@gmail.com';
  RAISE NOTICE '👑 Ruolo: admin';
  RAISE NOTICE '📅 Scade il: %', (NOW() + INTERVAL '30 days')::date;
  RAISE NOTICE '';
  RAISE NOTICE '🔗 LINK INVITO (copia questo):';
  RAISE NOTICE '%', v_invite_link;
  RAISE NOTICE '';
  RAISE NOTICE '⚠️ Sostituisci localhost:5173 con il tuo dominio se necessario!';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '📋 PROSSIMI PASSI:';
  RAISE NOTICE '========================================';
  RAISE NOTICE '1. Copia il link sopra';
  RAISE NOTICE '2. Aprilo nel browser';
  RAISE NOTICE '3. Paolo crea account con password';
  RAISE NOTICE '4. Paolo completa onboarding con "Precompila"';
  RAISE NOTICE '5. Sistema genererà inviti per Matteo ed Elena';
  RAISE NOTICE '6. Recupera i link con la query in Step 5';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Database pronto per il test completo!';
  RAISE NOTICE '';
END $$;

-- ========================================
-- STEP 4: VERIFICA POST-RESET
-- ========================================

-- 4.1 Conta record rimanenti (tutti dovrebbero essere 0, tranne invite_tokens = 1)
SELECT COUNT(*) as remaining_count, 'auth.users' as table_name FROM auth.users
UNION ALL
SELECT COUNT(*), 'companies' FROM public.companies
UNION ALL
SELECT COUNT(*), 'company_members' FROM public.company_members
UNION ALL
SELECT COUNT(*), 'invite_tokens' FROM public.invite_tokens  -- Deve essere 1 (token Paolo)
UNION ALL
SELECT COUNT(*), 'staff' FROM public.staff
UNION ALL
SELECT COUNT(*), 'departments' FROM public.departments;

-- 4.2 Vedi il token generato per Paolo
SELECT 
  token,
  email,
  role,
  company_id,
  expires_at::date as scade_il,
  CONCAT('http://localhost:5173/accept-invite?token=', token) as invite_link
FROM public.invite_tokens
ORDER BY created_at DESC
LIMIT 1;

-- ========================================
-- STEP 5: RECUPERA LINK INVITI (dopo onboarding Paolo)
-- ========================================

-- ESEGUI QUESTA QUERY DOPO CHE PAOLO HA COMPLETATO L'ONBOARDING
-- Per ottenere i link inviti generati automaticamente per Matteo ed Elena

SELECT 
  email,
  role,
  CONCAT('http://localhost:5173/accept-invite?token=', token) as invite_link,
  expires_at::date as scade_il,
  created_at::timestamp as generato_il,
  CASE 
    WHEN used_at IS NOT NULL THEN '✅ Usato'
    WHEN expires_at < NOW() THEN '❌ Scaduto'
    ELSE '⏳ Pending'
  END as status
FROM public.invite_tokens
WHERE company_id IS NOT NULL  -- Solo inviti per company esistente (escludi token iniziale Paolo)
ORDER BY created_at DESC;

-- Output atteso:
-- matti169cava@libero.it | responsabile | http://localhost:5173/accept-invite?token=xxx | ... | ⏳ Pending
-- 0cavuz0@gmail.com | dipendente | http://localhost:5173/accept-invite?token=yyy | ... | ⏳ Pending

-- ========================================
-- STEP 6: VERIFICA FINALE (dopo tutti gli inviti accettati)
-- ========================================

-- Esegui DOPO che Matteo ed Elena hanno accettato gli inviti

-- 6.1 Vedi tutti gli utenti registrati
SELECT 
  u.id as user_id,
  u.email,
  u.created_at::date as registrato_il,
  cm.role,
  s.name as staff_name,
  c.name as company_name,
  CASE 
    WHEN cm.is_active THEN '✅ Attivo'
    ELSE '❌ Inattivo'
  END as stato
FROM auth.users u
LEFT JOIN public.company_members cm ON cm.user_id = u.id
LEFT JOIN public.companies c ON c.id = cm.company_id
LEFT JOIN public.staff s ON s.id = cm.staff_id
ORDER BY cm.role DESC, u.email;

-- Output atteso:
-- matteo.cavallaro.work@gmail.com | admin | Paolo Dettori | Al Ritrovo SRL | ✅
-- matti169cava@libero.it | responsabile | Matteo Cavallaro | Al Ritrovo SRL | ✅
-- 0cavuz0@gmail.com | dipendente | Elena Compagna | Al Ritrovo SRL | ✅

-- 6.2 Verifica company creata
SELECT 
  id,
  name,
  email,
  staff_count,
  created_at::date as creata_il,
  (SELECT COUNT(*) FROM public.departments WHERE company_id = id) as num_reparti,
  (SELECT COUNT(*) FROM public.staff WHERE company_id = id) as num_staff,
  (SELECT COUNT(*) FROM public.company_members WHERE company_id = id) as num_utenti_registrati
FROM public.companies;

-- Output atteso:
-- Al Ritrovo SRL | ... | 8 reparti | 5 staff | 3 utenti registrati

-- 6.3 Verifica inviti (tutti dovrebbero essere usati)
SELECT 
  email,
  role,
  used_at::timestamp as usato_il,
  CASE 
    WHEN used_at IS NOT NULL THEN '✅ Usato'
    ELSE '❌ Non usato'
  END as status
FROM public.invite_tokens
ORDER BY created_at ASC;

-- Output atteso:
-- matteo.cavallaro.work@gmail.com | admin | 2025-10-12 ... | ✅ Usato (Paolo)
-- matti169cava@libero.it | responsabile | 2025-10-12 ... | ✅ Usato (Matteo)
-- 0cavuz0@gmail.com | dipendente | 2025-10-12 ... | ✅ Usato (Elena)

-- ========================================
-- TROUBLESHOOTING
-- ========================================

-- Se auth.users non si elimina
-- Vai manualmente su: Supabase Dashboard → Authentication → Users
-- Elimina ogni utente cliccando sui tre puntini → Delete

-- Se mancano inviti per Matteo/Elena
-- Generali manualmente (vedi Step 5 in FLUSSO_TEST_COMPLETO.md)

-- Se company_id è NULL in user_sessions
UPDATE public.user_sessions
SET active_company_id = (SELECT id FROM public.companies LIMIT 1)
WHERE active_company_id IS NULL;

-- ========================================
-- GUIDA COMPLETA POST-RESET
-- ========================================
/*

📋 WORKFLOW COMPLETO DOPO IL RESET:

FASE 1: RESET DATABASE
-----------------------
✅ Esegui questo script completo
✅ Verifica che tutti i count siano 0
✅ Copia il link invito per Paolo

FASE 2: PAOLO CREA AZIENDA (Primo Admin)
-----------------------------------------
1. Paolo apre il link invito
2. Crea account (email: matteo.cavallaro.work@gmail.com)
3. Viene reindirizzato all'onboarding
4. Clicca "Precompila" → Carica tutti i dati preimpostati
5. Completa tutti gli step dell'onboarding
6. Nel processo, vengono creati:
   - Company "Al Ritrovo SRL"
   - 8 Reparti
   - 5 Staff members (Matteo, Fabrizio, Paolo, Eddy, Elena)
   - Punti di conservazione
   - Task generici
   - Prodotti di esempio

FASE 3: INVITI AUTOMATICI
--------------------------
Durante l'onboarding, il sistema genera automaticamente inviti per:
- ✉️ Matteo Cavallaro (matti169cava@libero.it) → Responsabile
- ✉️ Elena Compagna (0cavuz0@gmail.com) → Dipendente

⚠️ NOTA: Le email potrebbero NON essere inviate automaticamente
(dipende dalla configurazione SMTP di Supabase)

FASE 4: RECUPERA LINK INVITI
-----------------------------
*/

-- Query per ottenere i link inviti generati:
-- (esegui DOPO che Paolo ha completato l'onboarding)
/*
SELECT 
  email,
  role,
  CONCAT('http://localhost:5173/accept-invite?token=', token) as invite_link,
  expires_at,
  CASE 
    WHEN used_at IS NOT NULL THEN '✅ Usato'
    WHEN expires_at < NOW() THEN '❌ Scaduto'
    ELSE '⏳ Pending'
  END as status
FROM public.invite_tokens
WHERE company_id IS NOT NULL  -- Escludi il token iniziale di Paolo
ORDER BY created_at DESC;
*/

/*
FASE 5: MATTEO ED ELENA ACCETTANO INVITI
-----------------------------------------
1. Matteo apre il suo link invito
   - Crea account (matti169cava@libero.it)
   - Viene automaticamente associato come Responsabile
   - Accede alla dashboard di "Al Ritrovo SRL"

2. Elena apre il suo link invito
   - Crea account (0cavuz0@gmail.com)
   - Viene automaticamente associata come Dipendente
   - Accede alla dashboard di "Al Ritrovo SRL"

FASE 6: VERIFICA FINALE
------------------------
*/

-- Verifica che tutto sia configurato correttamente:
/*
-- 1. Conta utenti
SELECT COUNT(*) as total_users FROM auth.users;
-- Deve essere: 3 (Paolo, Matteo, Elena)

-- 2. Conta companies
SELECT COUNT(*) as total_companies FROM public.companies;
-- Deve essere: 1 (Al Ritrovo SRL)

-- 3. Vedi tutti i membri
SELECT 
  u.email,
  cm.role,
  s.name as staff_name,
  c.name as company_name
FROM public.company_members cm
JOIN auth.users u ON u.id = cm.user_id
JOIN public.companies c ON c.id = cm.company_id
LEFT JOIN public.staff s ON s.id = cm.staff_id
ORDER BY cm.role DESC, u.email;

-- Deve mostrare:
-- - matteo.cavallaro.work@gmail.com | admin | Paolo Dettori | Al Ritrovo SRL
-- - matti169cava@libero.it | responsabile | Matteo Cavallaro | Al Ritrovo SRL
-- - 0cavuz0@gmail.com | dipendente | Elena Compagna | Al Ritrovo SRL
*/

-- ========================================
-- 🎯 CHECKLIST FINALE
-- ========================================
/*

✅ Database pulito (tutti i count = 0)
✅ Token iniziale per Paolo generato
✅ Paolo crea account e completa onboarding
✅ Company "Al Ritrovo SRL" creata
✅ 5 staff members inseriti
✅ Inviti per Matteo ed Elena generati
✅ Matteo accetta invito e accede
✅ Elena accetta invito e accede
✅ Tutti e 3 gli utenti vedono la stessa azienda
✅ Dev Company impostata per testing (devCompanyHelper)

*/

