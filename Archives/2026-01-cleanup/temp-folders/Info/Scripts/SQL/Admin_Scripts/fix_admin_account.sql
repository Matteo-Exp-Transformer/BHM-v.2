-- =============================================
-- FIX ADMIN ACCOUNT
-- =============================================
-- 
-- Questo script crea una company di test e associa
-- l'account admin esistente come super admin
--
-- ISTRUZIONI:
-- 1. Sostituisci 'YOUR_USER_ID_HERE' con il tuo user_id
-- 2. Esegui questo script nel SQL Editor di Supabase
-- 3. Verifica che il tuo account possa ora accedere all'app
-- =============================================

-- 1. Crea Company Admin (se non esiste già)
INSERT INTO companies (
  id,
  name,
  address,
  email,
  staff_count,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),  -- Genera nuovo UUID
  'Admin Test Company',
  'Via Test 1, Bologna',
  'admin@test.com',
  1,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING
RETURNING id;

-- 2. Salva l'ID della company creata
-- (Copia l'UUID ritornato dalla query sopra e sostituiscilo qui sotto)

-- 3. Associa il tuo user_id alla company come admin
INSERT INTO company_members (
  user_id,
  company_id,
  role,
  staff_id,
  is_active,
  created_at,
  updated_at
) VALUES (
  'YOUR_USER_ID_HERE',  -- <-- SOSTITUISCI CON IL TUO USER_ID
  (SELECT id FROM companies WHERE name = 'Admin Test Company' LIMIT 1),
  'admin',
  NULL,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (user_id, company_id) DO UPDATE
SET 
  role = 'admin',
  is_active = true,
  updated_at = NOW();

-- 4. Crea user_session per l'admin
INSERT INTO user_sessions (
  user_id,
  active_company_id,
  last_activity,
  created_at,
  updated_at
) VALUES (
  'YOUR_USER_ID_HERE',  -- <-- SOSTITUISCI CON IL TUO USER_ID
  (SELECT id FROM companies WHERE name = 'Admin Test Company' LIMIT 1),
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (user_id) DO UPDATE
SET 
  active_company_id = (SELECT id FROM companies WHERE name = 'Admin Test Company' LIMIT 1),
  last_activity = NOW(),
  updated_at = NOW();

-- 5. Verifica che tutto sia stato creato correttamente
SELECT 
  u.id as user_id,
  u.email,
  cm.role,
  cm.is_active,
  c.name as company_name,
  us.active_company_id
FROM auth.users u
LEFT JOIN company_members cm ON cm.user_id = u.id
LEFT JOIN companies c ON c.id = cm.company_id
LEFT JOIN user_sessions us ON us.user_id = u.id
WHERE u.id = 'YOUR_USER_ID_HERE';  -- <-- SOSTITUISCI CON IL TUO USER_ID

-- ✅ Se vedi il tuo record con role='admin' e company_name='Admin Test Company', sei pronto!

