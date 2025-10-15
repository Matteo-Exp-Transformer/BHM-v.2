-- =============================================
-- VERIFICA INVITI DOPO ONBOARDING
-- =============================================
-- Query per verificare se i token di invito sono stati
-- generati correttamente dopo il completamento dell'onboarding
--
-- Uso: Esegui su Supabase SQL Editor per verificare
--      che gli inviti siano stati creati per lo staff
-- =============================================

-- 1️⃣ VERIFICA COMPANY PIÙ RECENTE
SELECT
  id,
  name,
  email,
  created_at,
  updated_at
FROM companies
ORDER BY created_at DESC
LIMIT 1;

-- 2️⃣ STAFF MEMBRI DELLA COMPANY PIÙ RECENTE
WITH last_company AS (
  SELECT id FROM companies ORDER BY created_at DESC LIMIT 1
)
SELECT
  s.id,
  s.name,
  s.email,
  s.role,
  s.category,
  s.created_at,
  -- Verifica se ha user_id (già registrato)
  CASE
    WHEN cm.user_id IS NOT NULL THEN '✅ Registrato'
    ELSE '⏳ Da invitare'
  END as stato_registrazione,
  cm.user_id
FROM staff s
LEFT JOIN company_members cm ON s.id = cm.staff_id
WHERE s.company_id = (SELECT id FROM last_company)
ORDER BY s.created_at ASC;

-- 3️⃣ INVITI GENERATI PER LA COMPANY PIÙ RECENTE
WITH last_company AS (
  SELECT id FROM companies ORDER BY created_at DESC LIMIT 1
)
SELECT
  it.id,
  it.email,
  it.role,
  it.token,
  -- ✅ LOCALHOST LINK
  'http://localhost:3000/accept-invite?token=' || it.token as localhost_link,
  -- 🌐 VERCEL LINK (aggiorna con il tuo dominio)
  'https://bhm-v2-d8zo47pco-matteos-projects-9122caa7.vercel.app/accept-invite?token=' || it.token as vercel_link,
  it.expires_at,
  CASE
    WHEN it.expires_at > NOW() THEN '✅ Valido'
    ELSE '❌ Scaduto'
  END as stato_validita,
  CASE
    WHEN it.used_at IS NOT NULL THEN '✅ Usato il ' || it.used_at::TEXT
    ELSE '⏳ Non ancora usato'
  END as stato_uso,
  it.created_at
FROM invite_tokens it
WHERE it.company_id = (SELECT id FROM last_company)
ORDER BY it.created_at DESC;

-- 4️⃣ CONTEGGIO INVITI PER STATUS
WITH last_company AS (
  SELECT id FROM companies ORDER BY created_at DESC LIMIT 1
)
SELECT
  COUNT(*) as totale_inviti,
  COUNT(CASE WHEN used_at IS NOT NULL THEN 1 END) as inviti_usati,
  COUNT(CASE WHEN used_at IS NULL AND expires_at > NOW() THEN 1 END) as inviti_validi_non_usati,
  COUNT(CASE WHEN used_at IS NULL AND expires_at <= NOW() THEN 1 END) as inviti_scaduti
FROM invite_tokens
WHERE company_id = (SELECT id FROM last_company);

-- 5️⃣ STAFF SENZA INVITO (POTREBBERO MANCARE)
WITH last_company AS (
  SELECT id FROM companies ORDER BY created_at DESC LIMIT 1
)
SELECT
  s.id,
  s.name,
  s.email,
  s.role,
  s.category,
  '⚠️ MANCA INVITO' as problema
FROM staff s
LEFT JOIN invite_tokens it ON s.email = it.email AND s.company_id = it.company_id
WHERE s.company_id = (SELECT id FROM last_company)
  AND s.email IS NOT NULL -- Solo staff con email
  AND it.id IS NULL -- Nessun invito trovato
ORDER BY s.created_at ASC;

-- 6️⃣ COMPANY_MEMBERS PER LA COMPANY PIÙ RECENTE
WITH last_company AS (
  SELECT id FROM companies ORDER BY created_at DESC LIMIT 1
)
SELECT
  cm.user_id,
  cm.company_id,
  cm.role,
  cm.staff_id,
  cm.is_active,
  s.email as staff_email,
  s.name as staff_name,
  CASE
    WHEN cm.user_id IS NOT NULL THEN '✅ User collegato'
    ELSE '⏳ In attesa registrazione'
  END as stato_user
FROM company_members cm
LEFT JOIN staff s ON cm.staff_id = s.id
WHERE cm.company_id = (SELECT id FROM last_company)
ORDER BY cm.created_at ASC;

-- =============================================
-- DIAGNOSTICA RAPIDA
-- =============================================
-- Query riassuntiva per vedere tutto in un colpo d'occhio

WITH last_company AS (
  SELECT id, name FROM companies ORDER BY created_at DESC LIMIT 1
),
stats AS (
  SELECT
    (SELECT COUNT(*) FROM staff WHERE company_id = (SELECT id FROM last_company)) as totale_staff,
    (SELECT COUNT(*) FROM staff WHERE company_id = (SELECT id FROM last_company) AND email IS NOT NULL) as staff_con_email,
    (SELECT COUNT(*) FROM invite_tokens WHERE company_id = (SELECT id FROM last_company)) as totale_inviti,
    (SELECT COUNT(*) FROM invite_tokens WHERE company_id = (SELECT id FROM last_company) AND used_at IS NULL AND expires_at > NOW()) as inviti_attivi,
    (SELECT COUNT(*) FROM company_members WHERE company_id = (SELECT id FROM last_company) AND user_id IS NOT NULL) as utenti_registrati
)
SELECT
  '🏢 Company: ' || lc.name as company_info,
  '👥 Staff totale: ' || s.totale_staff as staff_info,
  '📧 Staff con email: ' || s.staff_con_email as email_info,
  '📨 Inviti generati: ' || s.totale_inviti as inviti_generati,
  '✅ Inviti attivi: ' || s.inviti_attivi as inviti_attivi,
  '👤 Utenti già registrati: ' || s.utenti_registrati as registrati_info,
  CASE
    WHEN s.staff_con_email = s.totale_inviti THEN '✅ TUTTI GLI INVITI GENERATI'
    WHEN s.totale_inviti = 0 THEN '❌ NESSUN INVITO GENERATO'
    ELSE '⚠️ MANCANO ' || (s.staff_con_email - s.totale_inviti) || ' INVITI'
  END as stato_inviti
FROM stats s, last_company lc;
