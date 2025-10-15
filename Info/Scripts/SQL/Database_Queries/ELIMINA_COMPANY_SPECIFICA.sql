-- ========================================
-- 🗑️ ELIMINA COMPANY SPECIFICA
-- ========================================
-- ATTENZIONE: Operazione irreversibile!

-- 1. LISTA TUTTE LE COMPANIES
SELECT 
  id,
  name,
  email,
  staff_count,
  created_at::date as creata_il,
  (SELECT COUNT(*) FROM public.company_members WHERE company_id = companies.id) as num_membri,
  (SELECT COUNT(*) FROM public.staff WHERE company_id = companies.id) as num_staff,
  (SELECT COUNT(*) FROM public.departments WHERE company_id = companies.id) as num_reparti
FROM public.companies
ORDER BY created_at DESC;

-- 2. ELIMINA UNA COMPANY SPECIFICA (sostituisci l'ID)
-- ATTENZIONE: Questa operazione eliminerà CASCADE:
-- - tutti i membri
-- - tutto lo staff
-- - tutti i reparti
-- - tutti i task
-- - tutti i prodotti
-- - tutti i dati associati

-- DELETE FROM public.companies WHERE id = 'INSERISCI-ID-QUI';

-- 3. VERIFICA ELIMINAZIONE
-- SELECT COUNT(*) as companies_rimaste FROM public.companies;

