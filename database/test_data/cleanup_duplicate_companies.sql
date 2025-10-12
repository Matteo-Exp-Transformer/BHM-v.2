-- ========================================
-- PULIZIA COMPANY DUPLICATE - Al Ritrovo SRL
-- ========================================
-- SCOPO: Elimina tutte le company duplicate mantenendo SOLO UNA
--
-- ⚠️ IMPORTANTE: Esegui prima il SELECT per vedere cosa verrà eliminato!
--
-- STEP 1: IDENTIFICA LA COMPANY DA MANTENERE
-- ========================================

-- 1.1 Vedi tutte le tue company con statistiche
SELECT 
  c.id as company_id,
  c.name as company_name,
  c.created_at,
  c.updated_at,
  c.staff_count,
  -- Count relazioni
  (SELECT COUNT(*) FROM public.departments WHERE company_id = c.id) as num_departments,
  (SELECT COUNT(*) FROM public.staff WHERE company_id = c.id) as num_staff,
  (SELECT COUNT(*) FROM public.products WHERE company_id = c.id) as num_products,
  (SELECT COUNT(*) FROM public.conservation_points WHERE company_id = c.id) as num_conservation_points,
  (SELECT COUNT(*) FROM public.tasks WHERE company_id = c.id) as num_tasks,
  (SELECT COUNT(*) FROM public.company_members WHERE company_id = c.id) as num_members
FROM public.companies c
WHERE c.name = 'Al Ritrovo SRL'
ORDER BY c.created_at DESC;

-- 1.2 Identifica la company PIÙ COMPLETA (quella con più dati)
-- Questa è quella che VOGLIAMO MANTENERE
SELECT 
  c.id as company_id,
  c.name,
  c.created_at,
  -- Score = numero totale di record associati
  (
    (SELECT COUNT(*) FROM public.departments WHERE company_id = c.id) +
    (SELECT COUNT(*) FROM public.staff WHERE company_id = c.id) +
    (SELECT COUNT(*) FROM public.products WHERE company_id = c.id) +
    (SELECT COUNT(*) FROM public.conservation_points WHERE company_id = c.id) +
    (SELECT COUNT(*) FROM public.tasks WHERE company_id = c.id) +
    (SELECT COUNT(*) FROM public.company_members WHERE company_id = c.id)
  ) as completeness_score
FROM public.companies c
WHERE c.name = 'Al Ritrovo SRL'
ORDER BY completeness_score DESC, c.created_at DESC
LIMIT 1;

-- ========================================
-- STEP 2: SALVA L'ID DELLA COMPANY DA MANTENERE
-- ========================================
-- 📋 INCOLLA QUI L'ID DELLA COMPANY PIÙ COMPLETA:
-- 
-- COMPANY_TO_KEEP_ID: __205c56c7-30b5-4526-b064-bf998c562df3_________________________________
-- 
-- Esempio: 205c56c7-30b5-4526-b064-bf998c562df3
--

-- ========================================
-- STEP 3: PREVIEW - VEDI COSA VERRÀ ELIMINATO
-- ========================================

-- 3.1 Lista di company che verranno eliminate
SELECT 
  id,
  name,
  created_at,
  email,
  '❌ VERRÀ ELIMINATA' as status
FROM public.companies
WHERE name = 'Al Ritrovo SRL'
  AND id != '205c56c7-30b5-4526-b064-bf998c562df3'  -- ⚠️ SOSTITUISCI CON L'ID REALE!
ORDER BY created_at ASC;

-- 3.2 Count totale
SELECT 
  COUNT(*) as companies_to_delete
FROM public.companies
WHERE name = 'Al Ritrovo SRL'
  AND id != '205c56c7-30b5-4526-b064-bf998c562df3';  -- ⚠️ SOSTITUISCI CON L'ID REALE!

-- ========================================
-- STEP 4: ESECUZIONE - ELIMINA DUPLICATE
-- ========================================

-- ⚠️⚠️⚠️ ATTENZIONE: OPERAZIONE IRREVERSIBILE! ⚠️⚠️⚠️
-- 
-- Prima di eseguire:
-- 1. Hai salvato il COMPANY_TO_KEEP_ID?
-- 2. Hai eseguito il PREVIEW (Step 3)?
-- 3. Sei SICURO di voler eliminare 13 company duplicate?
--
-- Se sì, decomm commenta e esegui:


DO $$ 
DECLARE
  company_to_keep UUID := '[COMPANY_TO_KEEP_ID]';  -- ⚠️ SOSTITUISCI CON L'ID REALE!
  companies_deleted INTEGER := 0;
BEGIN
  -- Elimina tutte le company duplicate (CASCADE eliminerà anche tutte le relazioni)
  DELETE FROM public.companies
  WHERE name = 'Al Ritrovo SRL'
    AND id != company_to_keep
  RETURNING * INTO companies_deleted;
  
  RAISE NOTICE '✅ Eliminate % company duplicate', companies_deleted;
  RAISE NOTICE '✅ Mantenuta company: %', company_to_keep;
END $$;
*/

-- ========================================
-- STEP 5: VERIFICA POST-ELIMINAZIONE
-- ========================================

-- 5.1 Verifica che sia rimasta SOLO UNA company
SELECT 
  COUNT(*) as remaining_companies,
  CASE 
    WHEN COUNT(*) = 1 THEN '✅ PERFETTO - Solo 1 company rimasta'
    WHEN COUNT(*) > 1 THEN '⚠️ ATTENZIONE - Ancora duplicate presenti'
    ELSE '❌ ERRORE - Nessuna company trovata'
  END as status
FROM public.companies
WHERE name = 'Al Ritrovo SRL';

-- 5.2 Vedi la company rimasta con statistiche aggiornate
SELECT 
  c.id as company_id,
  c.name as company_name,
  c.created_at,
  c.updated_at,
  c.email,
  -- Count relazioni
  (SELECT COUNT(*) FROM public.departments WHERE company_id = c.id) as num_departments,
  (SELECT COUNT(*) FROM public.staff WHERE company_id = c.id) as num_staff,
  (SELECT COUNT(*) FROM public.products WHERE company_id = c.id) as num_products,
  (SELECT COUNT(*) FROM public.conservation_points WHERE company_id = c.id) as num_conservation_points,
  (SELECT COUNT(*) FROM public.tasks WHERE company_id = c.id) as num_tasks,
  (SELECT COUNT(*) FROM public.company_members WHERE company_id = c.id) as num_members
FROM public.companies c
WHERE c.name = 'Al Ritrovo SRL';

-- ========================================
-- STEP 6: CLEANUP DEPARTMENT DUPLICATI (OPZIONALE)
-- ========================================

-- Se noti che hai anche department duplicati (es. 2 "Cucina"), puoi pulirli:

-- 6.1 Vedi department duplicati
SELECT 
  name,
  COUNT(*) as duplicate_count,
  STRING_AGG(id::TEXT, ', ') as duplicate_ids
FROM public.departments
WHERE company_id = '[COMPANY_TO_KEEP_ID]'  -- ⚠️ SOSTITUISCI!
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- 6.2 Elimina department duplicati (mantiene il più vecchio per nome)
/*
WITH ranked_departments AS (
  SELECT 
    id,
    name,
    company_id,
    ROW_NUMBER() OVER (PARTITION BY company_id, name ORDER BY created_at ASC) as rn
  FROM public.departments
  WHERE company_id = '[COMPANY_TO_KEEP_ID]'  -- ⚠️ SOSTITUISCI!
)
DELETE FROM public.departments
WHERE id IN (
  SELECT id 
  FROM ranked_departments 
  WHERE rn > 1
);
*/

-- ========================================
-- GUIDA COMPLETA DI UTILIZZO
-- ========================================
/*

📋 WORKFLOW CONSIGLIATO:

1. **Backup Prima di Tutto** (da Supabase Dashboard → Database → Backups)

2. **Identifica Company da Mantenere**:
   - Esegui Step 1.2
   - Copia l'ID della company con completeness_score più alto
   - Salva questo ID in un posto sicuro

3. **Preview Eliminazione**:
   - Sostituisci [COMPANY_TO_KEEP_ID] in Step 3 con l'ID reale
   - Esegui le query per vedere cosa verrà eliminato
   - Verifica che il count sia corretto (13 duplicate)

4. **Esegui Eliminazione**:
   - Decomment il blocco DO $$ in Step 4
   - Sostituisci [COMPANY_TO_KEEP_ID] con l'ID reale
   - Esegui il blocco
   - ATTENZIONE: Questa operazione è IRREVERSIBILE!

5. **Verifica Risultato**:
   - Esegui Step 5 per confermare che è rimasta solo 1 company
   - Verifica che le relazioni siano intatte (departments, staff, etc.)

6. **Cleanup Department** (Opzionale):
   - Se hai department duplicati (es. 2 "Cucina")
   - Esegui Step 6 per pulirli

7. **Test Applicazione**:
   - Fai login nell'app
   - Verifica che tutto funzioni correttamente
   - Controlla che non ci siano errori in console

⚠️ NOTE IMPORTANTI:

- **CASCADE DELETE**: Eliminando una company, vengono eliminati anche:
  - Tutti i departments di quella company
  - Tutti gli staff di quella company
  - Tutti i products, tasks, conservation_points, etc.
  - QUESTO È CORRETTO per le company DUPLICATE (vuote o con pochi dati)
  - Per questo manteniamo quella PIÙ COMPLETA

- **Company Members**: Se hai utenti associati a company duplicate, verranno dissociati
  - Dovrai riassociarli manualmente alla company principale
  - Usa il pannello di gestione utenti nell'app

- **User Sessions**: Le sessioni attive potrebbero puntare a company eliminate
  - Gli utenti dovranno fare logout/login
  - Oppure switchare manualmente alla company corretta

*/

