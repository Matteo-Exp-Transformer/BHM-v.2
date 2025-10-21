-- =============================================
-- TROVA LA COMPANY CORRETTA
-- =============================================
-- Identifica quale delle 10 companies è quella dell'utente loggato
-- =============================================

-- 1️⃣ UTENTE LOGGATO
SELECT
  id as user_id,
  email,
  created_at,
  last_sign_in_at,
  email_confirmed_at
FROM auth.users
ORDER BY created_at DESC;

-- 2️⃣ TUTTE LE COMPANIES (10)
SELECT
  c.id as company_id,
  c.name,
  c.email,
  c.created_at,
  -- Conteggi per ogni company
  (SELECT COUNT(*) FROM staff WHERE company_id = c.id) as staff_count,
  (SELECT COUNT(*) FROM departments WHERE company_id = c.id) as departments_count,
  (SELECT COUNT(*) FROM products WHERE company_id = c.id) as products_count,
  (SELECT COUNT(*) FROM invite_tokens WHERE company_id = c.id) as invites_count,
  (SELECT COUNT(*) FROM company_members WHERE company_id = c.id) as members_count,
  -- Verifica se questa company ha il tuo user_id
  CASE
    WHEN EXISTS (
      SELECT 1 FROM company_members cm
      WHERE cm.company_id = c.id
        AND cm.user_id = (SELECT id FROM auth.users LIMIT 1)
    ) THEN '✅ TUA COMPANY'
    ELSE '❌ Company vuota/vecchia'
  END as stato
FROM companies c
ORDER BY c.created_at DESC;

-- 3️⃣ COMPANY_MEMBERS - CHI È COLLEGATO A QUALE COMPANY
SELECT
  cm.id,
  cm.user_id,
  cm.company_id,
  cm.role,
  cm.staff_id,
  c.name as company_name,
  s.name as staff_name,
  s.email as staff_email,
  u.email as user_email,
  cm.created_at
FROM company_members cm
LEFT JOIN companies c ON cm.company_id = c.id
LEFT JOIN staff s ON cm.staff_id = s.id
LEFT JOIN auth.users u ON cm.user_id = u.id
ORDER BY cm.created_at DESC;

-- 4️⃣ USER_SESSIONS - QUALE COMPANY È ATTIVA?
SELECT
  us.user_id,
  us.active_company_id,
  c.name as active_company_name,
  us.last_activity,
  us.created_at,
  CASE
    WHEN us.active_company_id IS NULL THEN '❌ NESSUNA COMPANY ATTIVA'
    ELSE '✅ Company selezionata'
  END as stato
FROM user_sessions us
LEFT JOIN companies c ON us.active_company_id = c.id;

-- 5️⃣ INVITI - A QUALE COMPANY APPARTENGONO?
SELECT
  it.id,
  it.email,
  it.company_id,
  c.name as company_name,
  it.created_at,
  CASE
    WHEN it.company_id IS NULL THEN '❌ COMPANY NULL - PROBLEMA!'
    WHEN c.id IS NULL THEN '❌ COMPANY NON ESISTE'
    ELSE '✅ OK'
  END as stato_company
FROM invite_tokens it
LEFT JOIN companies c ON it.company_id = c.id
ORDER BY it.created_at DESC;

-- =============================================
-- 🎯 RIEPILOGO: LA TUA COMPANY CORRETTA
-- =============================================

WITH user_company AS (
  SELECT DISTINCT cm.company_id
  FROM company_members cm
  WHERE cm.user_id = (SELECT id FROM auth.users LIMIT 1)
  LIMIT 1
)
SELECT
  '🏢 La tua company' as info,
  c.id as company_id,
  c.name as company_name,
  c.email as company_email
FROM companies c
WHERE c.id = (SELECT company_id FROM user_company)

UNION ALL

SELECT
  '👥 Staff nella tua company',
  NULL,
  COUNT(*)::TEXT,
  NULL
FROM staff
WHERE company_id = (SELECT company_id FROM user_company)

UNION ALL

SELECT
  '📨 Inviti nella tua company',
  NULL,
  COUNT(*)::TEXT,
  NULL
FROM invite_tokens
WHERE company_id = (SELECT company_id FROM user_company)

UNION ALL

SELECT
  '🏢 Totale companies nel DB',
  NULL,
  COUNT(*)::TEXT,
  NULL
FROM companies

UNION ALL

SELECT
  '🗑️ Companies da eliminare',
  NULL,
  (COUNT(*) - 1)::TEXT,
  '(tutte tranne la tua)'
FROM companies;

-- =============================================
-- 🚨 PROBLEMA: INVITI CON COMPANY_ID SBAGLIATO
-- =============================================

WITH user_company AS (
  SELECT cm.company_id
  FROM company_members cm
  WHERE cm.user_id = (SELECT id FROM auth.users LIMIT 1)
  LIMIT 1
)
SELECT
  it.id,
  it.email,
  it.company_id as invito_company_id,
  (SELECT company_id FROM user_company) as tua_company_id,
  c.name as invito_company_name,
  CASE
    WHEN it.company_id = (SELECT company_id FROM user_company) THEN '✅ OK'
    WHEN it.company_id IS NULL THEN '❌ COMPANY NULL'
    ELSE '❌ COMPANY SBAGLIATA'
  END as problema
FROM invite_tokens it
LEFT JOIN companies c ON it.company_id = c.id
WHERE it.company_id != (SELECT company_id FROM user_company)
   OR it.company_id IS NULL
ORDER BY it.created_at DESC;
