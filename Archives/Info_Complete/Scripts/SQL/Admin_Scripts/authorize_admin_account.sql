-- =====================================================
-- SCRIPT: Autorizzazione Account Admin
-- EMAIL: matteo.cavallaro.work@gmail.com
-- SCOPO: Assicura che l'account sia autorizzato su tutti gli host
-- =====================================================

-- 1. Verifica se l'utente esiste in auth.users
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'matteo.cavallaro.work@gmail.com';

-- 2. Se l'utente non esiste, devi prima registrarti tramite l'app
-- Se l'utente esiste, procedi con i passaggi successivi

-- 3. Verifica se esiste una company
SELECT 
  id,
  name,
  email,
  created_at
FROM companies
ORDER BY created_at DESC
LIMIT 5;

-- 4. Crea una company se non esiste (OPZIONALE - modifica i dati)
-- INSERT INTO companies (name, address, email, staff_count)
-- VALUES ('Mia Azienda', 'Via Example 1', 'matteo.cavallaro.work@gmail.com', 0)
-- RETURNING id, name;

-- 5. Associa l'utente alla company come admin
-- SOSTITUISCI <user_id> con l'ID dell'utente dalla query 1
-- SOSTITUISCI <company_id> con l'ID della company dalla query 3 o 4

-- Prima verifica se l'associazione esiste già
SELECT 
  cm.id,
  cm.user_id,
  cm.company_id,
  cm.role,
  cm.is_active,
  u.email as user_email,
  c.name as company_name
FROM company_members cm
JOIN auth.users u ON cm.user_id = u.id
JOIN companies c ON cm.company_id = c.id
WHERE u.email = 'matteo.cavallaro.work@gmail.com';

-- Se NON esiste, crea l'associazione (SOSTITUISCI I VALORI)
-- INSERT INTO company_members (user_id, company_id, role, is_active)
-- VALUES (
--   '<user_id>',  -- ID utente dalla query 1
--   '<company_id>',  -- ID company dalla query 3 o 4
--   'admin',
--   true
-- )
-- RETURNING *;

-- Se esiste ma non è admin, aggiorna il ruolo
-- UPDATE company_members
-- SET role = 'admin', is_active = true
-- WHERE user_id = '<user_id>'
-- AND company_id = '<company_id>'
-- RETURNING *;

-- 6. Crea/aggiorna la sessione utente
-- SOSTITUISCI <user_id> e <company_id>
-- INSERT INTO user_sessions (user_id, active_company_id, last_activity)
-- VALUES (
--   '<user_id>',
--   '<company_id>',
--   NOW()
-- )
-- ON CONFLICT (user_id) 
-- DO UPDATE SET 
--   active_company_id = EXCLUDED.active_company_id,
--   last_activity = NOW(),
--   updated_at = NOW()
-- RETURNING *;

-- 7. Verifica finale - L'utente dovrebbe essere autorizzato
SELECT 
  u.id as user_id,
  u.email,
  cm.company_id,
  cm.role,
  cm.is_active,
  c.name as company_name,
  us.active_company_id as session_company_id
FROM auth.users u
LEFT JOIN company_members cm ON u.id = cm.user_id
LEFT JOIN companies c ON cm.company_id = c.id
LEFT JOIN user_sessions us ON u.id = us.user_id
WHERE u.email = 'matteo.cavallaro.work@gmail.com';

-- =====================================================
-- ISTRUZIONI:
-- 1. Esegui la query 1 per ottenere l'ID utente
-- 2. Esegui la query 3 per ottenere l'ID company
-- 3. Sostituisci <user_id> e <company_id> nelle query commentate
-- 4. Rimuovi i commenti (--) dalle query necessarie
-- 5. Esegui le query una alla volta
-- 6. Esegui la query 7 per verificare che tutto sia ok
-- =====================================================

