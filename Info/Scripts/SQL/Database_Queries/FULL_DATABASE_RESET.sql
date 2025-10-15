-- ========================================
-- 🚨 RESET COMPLETO DATABASE
-- ========================================
-- ⚠️ OPERAZIONE IRREVERSIBILE!
-- Elimina TUTTE le companies, staff, departments, prodotti, task, etc.
-- Genera automaticamente un nuovo token invito per il primo admin
-- 
-- USA SOLO PER TESTING/SVILUPPO!
-- NON ESEGUIRE MAI IN PRODUZIONE!
-- ========================================

-- ========================================
-- STEP 1: PREVIEW - Conta record prima del reset
-- ========================================

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
-- STEP 2: ESEGUI RESET + GENERA TOKEN
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
  
  SET session_replication_role = replica;
  
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
  
  DELETE FROM public.user_sessions;
  DELETE FROM public.user_profiles;
  
  RAISE NOTICE '✅ Sessioni e profili puliti';
  
  DELETE FROM public.company_members;
  
  RAISE NOTICE '✅ Company members puliti';
  
  DELETE FROM public.invite_tokens;
  GET DIAGNOSTICS v_tokens_deleted = ROW_COUNT;
  
  RAISE NOTICE '✅ % token di invito eliminati', v_tokens_deleted;
  
  DELETE FROM public.companies;
  GET DIAGNOSTICS v_companies_deleted = ROW_COUNT;
  
  RAISE NOTICE '✅ % companies eliminate', v_companies_deleted;
  
  RAISE NOTICE '';
  RAISE NOTICE '⚠️⚠️⚠️ IMPORTANTE ⚠️⚠️⚠️';
  RAISE NOTICE 'Per eliminare gli utenti:';
  RAISE NOTICE '1. Vai su Supabase Dashboard';
  RAISE NOTICE '2. Authentication → Users';
  RAISE NOTICE '3. Elimina ogni utente manualmente (... → Delete)';
  RAISE NOTICE '';
  RAISE NOTICE 'NON usare DELETE FROM auth.users (causa corruzione!)';
  RAISE NOTICE '';
  
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
    'matteo.cavallaro.work@gmail.com',
    NULL,
    'admin',
    NULL,
    NULL,
    NOW() + INTERVAL '30 days',
    NOW()
  );
  
  v_invite_link := 'http://localhost:3000/accept-invite?token=' || v_initial_token::text;
  
  RAISE NOTICE '';
  RAISE NOTICE '👤 PRIMO ADMIN: Paolo Dettori';
  RAISE NOTICE '📧 Email: matteo.cavallaro.work@gmail.com';
  RAISE NOTICE '👑 Ruolo: admin';
  RAISE NOTICE '📅 Scade il: %', (NOW() + INTERVAL '30 days')::date;
  RAISE NOTICE '';
  RAISE NOTICE '🔗 LINK INVITO (copia questo):';
  RAISE NOTICE '%', v_invite_link;
  RAISE NOTICE '';
  RAISE NOTICE '⚠️ Sostituisci localhost:3000 con il tuo dominio se necessario!';
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
-- STEP 3: VERIFICA POST-RESET
-- ========================================

SELECT COUNT(*) as remaining_count, 'auth.users' as table_name FROM auth.users
UNION ALL
SELECT COUNT(*), 'companies' FROM public.companies
UNION ALL
SELECT COUNT(*), 'company_members' FROM public.company_members
UNION ALL
SELECT COUNT(*), 'invite_tokens' FROM public.invite_tokens
UNION ALL
SELECT COUNT(*), 'staff' FROM public.staff
UNION ALL
SELECT COUNT(*), 'departments' FROM public.departments;

-- ========================================
-- STEP 4: RECUPERA LINK TOKEN
-- ========================================

SELECT 
  token,
  email,
  role,
  company_id,
  expires_at::date as scade_il,
  CONCAT('http://localhost:3000/accept-invite?token=', token) as invite_link
FROM public.invite_tokens
ORDER BY created_at DESC
LIMIT 1;

-- ========================================
-- STEP 5: QUERY AGGIUNTIVE (POST-ONBOARDING)
-- ========================================

-- 5.1 Inviti generati automaticamente per Matteo ed Elena
SELECT 
  email,
  role,
  CONCAT('http://localhost:3000/accept-invite?token=', token) as invite_link,
  expires_at::date as scade_il,
  created_at::timestamp as generato_il,
  CASE 
    WHEN used_at IS NOT NULL THEN '✅ Usato'
    WHEN expires_at < NOW() THEN '❌ Scaduto'
    ELSE '⏳ Pending'
  END as status
FROM public.invite_tokens
WHERE company_id IS NOT NULL
ORDER BY created_at DESC;

-- 5.2 Utenti registrati
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

-- 5.3 Company creata
SELECT 
  id,
  name,
  email,
  staff_count,
  created_at::date as creata_il,
  (SELECT COUNT(*) FROM public.departments WHERE company_id = id) as num_reparti,
  (SELECT COUNT(*) FROM public.staff WHERE company_id = id) as num_staff,
  (SELECT COUNT(*) FROM public.company_members WHERE company_id = id) as num_membri
FROM public.companies;

-- 5.4 Stato inviti
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

-- 5.5 Fix user_sessions (se necessario)
UPDATE public.user_sessions
SET active_company_id = (SELECT id FROM public.companies LIMIT 1)
WHERE active_company_id IS NULL;

