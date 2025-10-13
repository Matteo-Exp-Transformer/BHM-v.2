-- =============================================
-- DIAGNOSI INVITO SENZA STAFF
-- =============================================
-- Verifica perché un invito non trova lo staff associato
-- =============================================

-- 1️⃣ INVITO SPECIFICO
SELECT
  it.id,
  it.email,
  it.role,
  it.company_id,
  c.name as company_name,
  it.token,
  it.created_at,
  it.expires_at,
  it.used_at
FROM invite_tokens it
LEFT JOIN companies c ON it.company_id = c.id
WHERE it.email = 'matteo.cavallaro.work@gmail.com'
ORDER BY it.created_at DESC
LIMIT 1;

-- 2️⃣ CERCA STAFF CON QUESTA EMAIL
SELECT
  s.id,
  s.company_id,
  s.name,
  s.email,
  s.role,
  s.category,
  s.status,
  c.name as company_name,
  s.created_at
FROM staff s
LEFT JOIN companies c ON s.company_id = c.id
WHERE s.email = 'matteo.cavallaro.work@gmail.com'
  OR s.email LIKE '%matteo%'
ORDER BY s.created_at DESC;

-- 3️⃣ VERIFICA COMPANY_MEMBERS CON QUESTA EMAIL
SELECT
  cm.id,
  cm.user_id,
  cm.company_id,
  cm.role,
  cm.staff_id,
  cm.is_active,
  c.name as company_name,
  s.name as staff_name,
  s.email as staff_email,
  cm.created_at
FROM company_members cm
LEFT JOIN companies c ON cm.company_id = c.id
LEFT JOIN staff s ON cm.staff_id = s.id
WHERE cm.user_id = (
  SELECT auth.uid()
  FROM auth.users
  WHERE email = 'matteo.cavallaro.work@gmail.com'
  LIMIT 1
)
ORDER BY cm.created_at DESC;

-- 4️⃣ VERIFICA USER IN AUTH.USERS
SELECT
  id as user_id,
  email,
  created_at,
  last_sign_in_at,
  email_confirmed_at,
  raw_user_meta_data
FROM auth.users
WHERE email = 'matteo.cavallaro.work@gmail.com';

-- 5️⃣ TUTTI GLI INVITI PER COMPANY NULL
SELECT
  it.id,
  it.email,
  it.role,
  it.company_id,
  it.created_at,
  it.expires_at,
  CASE
    WHEN it.company_id IS NULL THEN '❌ COMPANY NULL - INVITO ORFANO'
    ELSE '✅ Company presente'
  END as problema
FROM invite_tokens it
WHERE it.company_id IS NULL
ORDER BY it.created_at DESC;

-- 6️⃣ CERCA COMPANY CREATA PIÙ DI RECENTE
SELECT
  c.id,
  c.name,
  c.email,
  c.created_at,
  (SELECT COUNT(*) FROM staff WHERE company_id = c.id) as staff_count,
  (SELECT COUNT(*) FROM invite_tokens WHERE company_id = c.id) as invite_count
FROM companies c
ORDER BY c.created_at DESC
LIMIT 5;

-- 7️⃣ VERIFICA SE ESISTE STAFF NELLA COMPANY PIÙ RECENTE
WITH last_company AS (
  SELECT id FROM companies ORDER BY created_at DESC LIMIT 1
)
SELECT
  s.id,
  s.name,
  s.email,
  s.role,
  s.category,
  s.created_at
FROM staff s
WHERE s.company_id = (SELECT id FROM last_company)
ORDER BY s.created_at ASC;

-- =============================================
-- 🎯 DIAGNOSTICA COMPLETA
-- =============================================

WITH last_company AS (
  SELECT id, name FROM companies ORDER BY created_at DESC LIMIT 1
),
invito_problema AS (
  SELECT * FROM invite_tokens
  WHERE email = 'matteo.cavallaro.work@gmail.com'
  ORDER BY created_at DESC
  LIMIT 1
),
user_info AS (
  SELECT id, email FROM auth.users
  WHERE email = 'matteo.cavallaro.work@gmail.com'
)
SELECT
  '🏢 Company più recente' as tipo,
  lc.name as valore,
  lc.id as id
FROM last_company lc
UNION ALL
SELECT
  '📧 Invito company_id',
  COALESCE(ip.company_id::TEXT, 'NULL - PROBLEMA!'),
  ip.id
FROM invito_problema ip
UNION ALL
SELECT
  '👤 User registrato',
  COALESCE(ui.id::TEXT, 'Non trovato'),
  NULL
FROM user_info ui
UNION ALL
SELECT
  '👥 Staff nella company',
  (SELECT COUNT(*)::TEXT FROM staff WHERE company_id = (SELECT id FROM last_company)),
  NULL
FROM last_company
UNION ALL
SELECT
  '📨 Inviti nella company',
  (SELECT COUNT(*)::TEXT FROM invite_tokens WHERE company_id = (SELECT id FROM last_company)),
  NULL
FROM last_company;
