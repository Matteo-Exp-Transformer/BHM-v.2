-- ========================================
-- 🔍 RECUPERA I TUOI IDS
-- ========================================
-- Sostituisci la tua email per ottenere tutti i tuoi ID

-- SOSTITUISCI QUI LA TUA EMAIL
DO $$
DECLARE
  v_email TEXT := 'matteo.cavallaro.work@gmail.com'; -- <-- Cambia questa
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '📧 Cerco IDs per: %', v_email;
  RAISE NOTICE '========================================';
END $$;

SELECT 
  u.id as user_id,
  u.email,
  cm.company_id,
  c.name as company_name,
  cm.staff_id,
  s.name as staff_name,
  cm.role,
  CASE WHEN cm.is_active THEN '✅ Attivo' ELSE '❌ Inattivo' END as stato
FROM auth.users u
LEFT JOIN public.company_members cm ON cm.user_id = u.id
LEFT JOIN public.companies c ON c.id = cm.company_id
LEFT JOIN public.staff s ON s.id = cm.staff_id
WHERE u.email = 'matteo.cavallaro.work@gmail.com'; -- <-- Cambia questa

-- QUERY ALTERNATIVA: Mostra TUTTI gli utenti con i loro ID
-- SELECT 
--   u.id as user_id,
--   u.email,
--   cm.company_id,
--   c.name as company_name,
--   cm.staff_id,
--   s.name as staff_name,
--   cm.role
-- FROM auth.users u
-- LEFT JOIN public.company_members cm ON cm.user_id = u.id
-- LEFT JOIN public.companies c ON c.id = cm.company_id
-- LEFT JOIN public.staff s ON s.id = cm.staff_id
-- ORDER BY u.email;

