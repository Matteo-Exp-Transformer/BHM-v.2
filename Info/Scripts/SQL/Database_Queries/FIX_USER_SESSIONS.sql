-- ========================================
-- 🔧 FIX USER SESSIONS
-- ========================================
-- Corregge user_sessions con company_id NULL

-- 1. VERIFICA PROBLEMA
SELECT 
  COUNT(*) as sessioni_senza_company,
  (SELECT COUNT(*) FROM public.user_sessions) as totale_sessioni
FROM public.user_sessions
WHERE active_company_id IS NULL;

-- 2. ESEGUI IL FIX (solo se ci sono sessioni senza company_id)
UPDATE public.user_sessions
SET active_company_id = (SELECT id FROM public.companies LIMIT 1)
WHERE active_company_id IS NULL;

-- 3. VERIFICA POST-FIX
SELECT 
  us.id,
  us.user_id,
  us.active_company_id,
  c.name as company_name,
  us.last_active_at
FROM public.user_sessions us
LEFT JOIN public.companies c ON c.id = us.active_company_id
ORDER BY us.last_active_at DESC;

