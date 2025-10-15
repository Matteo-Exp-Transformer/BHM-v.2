-- =============================================
-- ULTIMI INVITI GENERATI CON LINK E UTENTI
-- =============================================
-- Query per vedere gli ultimi token di invito generati
-- con link completi (localhost e vercel) e info utente/staff
-- =============================================

-- 🎯 QUERY PRINCIPALE: ULTIMI 20 INVITI GENERATI
SELECT
  it.id as invite_id,
  it.email,
  it.role,
  it.token,

  -- ✅ LINK PRONTI ALL'USO
  'http://localhost:3000/accept-invite?token=' || it.token as 🏠_localhost_link,
  'https://bhm-v2-d8zo47pco-matteos-projects-9122caa7.vercel.app/accept-invite?token=' || it.token as 🌐_vercel_link,

  -- 📊 INFO COMPANY
  c.name as company_name,
  c.email as company_email,

  -- 👤 INFO STAFF (se collegato)
  s.id as staff_id,
  s.name as staff_name,
  s.category as staff_category,
  s.phone as staff_phone,

  -- 🔐 INFO USER (se già registrato)
  cm.user_id as user_id_registrato,
  CASE
    WHEN cm.user_id IS NOT NULL THEN '✅ Già registrato'
    WHEN it.used_at IS NOT NULL THEN '✅ Invito usato il ' || it.used_at::DATE::TEXT
    WHEN it.expires_at < NOW() THEN '❌ Scaduto il ' || it.expires_at::DATE::TEXT
    ELSE '⏳ In attesa (valido fino al ' || it.expires_at::DATE::TEXT || ')'
  END as stato,

  -- ⏰ TIMESTAMP
  it.created_at as invito_creato_il,
  it.expires_at as scade_il,
  it.used_at as usato_il,

  -- 📅 GIORNI RIMASTI
  CASE
    WHEN it.expires_at > NOW() THEN EXTRACT(DAY FROM (it.expires_at - NOW()))::INTEGER || ' giorni'
    ELSE 'SCADUTO'
  END as giorni_rimasti

FROM invite_tokens it
LEFT JOIN companies c ON it.company_id = c.id
LEFT JOIN staff s ON it.email = s.email AND it.company_id = s.company_id
LEFT JOIN company_members cm ON s.id = cm.staff_id AND it.company_id = cm.company_id

ORDER BY it.created_at DESC
LIMIT 20;

-- =============================================
-- 🔥 INVITI ATTIVI E PRONTI ALL'USO
-- =============================================
-- Solo inviti validi, non scaduti e non ancora usati

SELECT
  it.email,
  it.role,
  '🏠 http://localhost:3000/accept-invite?token=' || it.token as link_localhost,
  '🌐 https://bhm-v2-d8zo47pco-matteos-projects-9122caa7.vercel.app/accept-invite?token=' || it.token as link_vercel,
  c.name as per_azienda,
  s.name as nome_staff,
  EXTRACT(DAY FROM (it.expires_at - NOW()))::INTEGER || ' giorni rimasti' as validita,
  it.created_at::DATE as creato_il

FROM invite_tokens it
LEFT JOIN companies c ON it.company_id = c.id
LEFT JOIN staff s ON it.email = s.email AND it.company_id = s.company_id

WHERE it.used_at IS NULL
  AND it.expires_at > NOW()

ORDER BY it.created_at DESC;

-- =============================================
-- 📧 RAGGRUPPAMENTO PER EMAIL
-- =============================================
-- Vede quanti inviti ha ricevuto ogni email

SELECT
  it.email,
  COUNT(*) as totale_inviti,
  COUNT(CASE WHEN it.used_at IS NOT NULL THEN 1 END) as inviti_usati,
  COUNT(CASE WHEN it.used_at IS NULL AND it.expires_at > NOW() THEN 1 END) as inviti_attivi,
  MAX(it.created_at) as ultimo_invito,
  MAX(it.used_at) as ultimo_uso,
  STRING_AGG(DISTINCT c.name, ', ') as aziende

FROM invite_tokens it
LEFT JOIN companies c ON it.company_id = c.id

GROUP BY it.email
ORDER BY MAX(it.created_at) DESC;

-- =============================================
-- 🏢 RAGGRUPPAMENTO PER COMPANY
-- =============================================
-- Vede quanti inviti ha generato ogni azienda

SELECT
  c.name as azienda,
  COUNT(*) as totale_inviti,
  COUNT(CASE WHEN it.used_at IS NOT NULL THEN 1 END) as inviti_usati,
  COUNT(CASE WHEN it.used_at IS NULL AND it.expires_at > NOW() THEN 1 END) as inviti_attivi,
  COUNT(CASE WHEN it.used_at IS NULL AND it.expires_at <= NOW() THEN 1 END) as inviti_scaduti,
  MAX(it.created_at) as ultimo_invito_creato,

  -- 📊 Percentuale utilizzo
  ROUND(
    COUNT(CASE WHEN it.used_at IS NOT NULL THEN 1 END)::NUMERIC /
    NULLIF(COUNT(*), 0) * 100,
    1
  ) || '%' as tasso_utilizzo

FROM companies c
LEFT JOIN invite_tokens it ON c.id = it.company_id

GROUP BY c.id, c.name
HAVING COUNT(*) > 0
ORDER BY MAX(it.created_at) DESC;

-- =============================================
-- 🚨 INVITI PROBLEMATICI
-- =============================================
-- Inviti scaduti o con problemi

SELECT
  it.email,
  it.role,
  c.name as azienda,
  s.name as staff_name,
  CASE
    WHEN it.expires_at < NOW() THEN '❌ SCADUTO il ' || it.expires_at::DATE::TEXT
    WHEN s.id IS NULL THEN '⚠️ STAFF NON TROVATO'
    WHEN cm.user_id IS NOT NULL THEN '✅ GIÀ REGISTRATO'
    ELSE '⏳ OK'
  END as problema,
  it.created_at::DATE as creato_il,
  it.expires_at::DATE as scaduto_il

FROM invite_tokens it
LEFT JOIN companies c ON it.company_id = c.id
LEFT JOIN staff s ON it.email = s.email AND it.company_id = s.company_id
LEFT JOIN company_members cm ON s.id = cm.staff_id

WHERE it.used_at IS NULL
  AND (
    it.expires_at < NOW() -- Scaduto
    OR s.id IS NULL -- Staff non trovato
  )

ORDER BY it.created_at DESC
LIMIT 20;
