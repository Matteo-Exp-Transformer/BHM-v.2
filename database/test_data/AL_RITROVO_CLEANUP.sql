-- ========================================
-- CLEANUP PERSONALIZZATO - Al Ritrovo SRL
-- ========================================
-- Questo script contiene i TUOI ID specifici già inseriti
-- Pronto da eseguire!

-- ========================================
-- STEP 1: VEDI LE TUE COMPANY
-- ========================================

SELECT 
  c.id as company_id,
  c.name as company_name,
  c.created_at,
  -- Count statistiche
  (SELECT COUNT(*) FROM public.departments WHERE company_id = c.id) as num_departments,
  (SELECT COUNT(*) FROM public.staff WHERE company_id = c.id) as num_staff,
  (SELECT COUNT(*) FROM public.products WHERE company_id = c.id) as num_products,
  (SELECT COUNT(*) FROM public.conservation_points WHERE company_id = c.id) as num_conservation_points,
  (SELECT COUNT(*) FROM public.tasks WHERE company_id = c.id) as num_tasks,
  (SELECT COUNT(*) FROM public.company_members WHERE company_id = c.id) as num_members,
  -- Score completezza
  (
    (SELECT COUNT(*) FROM public.departments WHERE company_id = c.id) +
    (SELECT COUNT(*) FROM public.staff WHERE company_id = c.id) +
    (SELECT COUNT(*) FROM public.products WHERE company_id = c.id) +
    (SELECT COUNT(*) FROM public.conservation_points WHERE company_id = c.id) +
    (SELECT COUNT(*) FROM public.tasks WHERE company_id = c.id) +
    (SELECT COUNT(*) FROM public.company_members WHERE company_id = c.id)
  ) as completeness_score
FROM public.companies c
WHERE c.id IN (
  '205c56c7-30b5-4526-b064-bf998c562df3',
  '90dedb9d-b5f4-454d-a8d3-b3144303ee12',
  'ffc07962-1885-4230-868f-9604388762b3',
  '17f279c1-5dbc-4fab-a1ae-efbeeb488166',
  '0e9a3717-0108-4f30-99e1-13256a7b97a8',
  '64c1b930-b04f-4cf4-a804-8c35449dec0a',
  '5499dcca-bfbe-480d-b8b3-1c286e601457',
  '2f59960d-5b98-4995-9409-ccd533e199f7',
  '536006a3-d297-4f3c-b816-e46514433903',
  'cec24c2f-11e1-450b-9404-8b9c5da33eb5',
  'd3f58e11-ef9b-48cf-8e5e-f875394505ba',
  '1f248199-1f52-4d2b-8b54-a2218b0e0254',
  '3d8b7e24-2864-46c5-bf14-53730cdc6f94',
  '4f73c446-6f3a-4dd6-b54e-65a8f2a6d2bc'
)
ORDER BY completeness_score DESC, c.created_at DESC;

-- ========================================
-- STEP 2: IDENTIFICA LA MIGLIORE
-- ========================================

-- La query sopra mostra tutte le tue company ordinate per "completezza"
-- La PRIMA in lista è quella da MANTENERE
-- Copia il suo ID e usalo sotto nel STEP 3

-- 📋 INCOLLA QUI L'ID DELLA COMPANY DA MANTENERE:
-- 
-- COMPANY_TO_KEEP_ID: _____________________________________
--

-- ========================================
-- STEP 3: PREVIEW ELIMINAZIONE
-- ========================================

-- ⚠️ IMPORTANTE: Sostituisci '[COMPANY_TO_KEEP_ID]' con l'ID che hai copiato sopra!

SELECT 
  id,
  name,
  created_at,
  '❌ VERRÀ ELIMINATA' as status
FROM public.companies
WHERE id IN (
  '205c56c7-30b5-4526-b064-bf998c562df3',
  '90dedb9d-b5f4-454d-a8d3-b3144303ee12',
  'ffc07962-1885-4230-868f-9604388762b3',
  '17f279c1-5dbc-4fab-a1ae-efbeeb488166',
  '0e9a3717-0108-4f30-99e1-13256a7b97a8',
  '64c1b930-b04f-4cf4-a804-8c35449dec0a',
  '5499dcca-bfbe-480d-b8b3-1c286e601457',
  '2f59960d-5b98-4995-9409-ccd533e199f7',
  '536006a3-d297-4f3c-b816-e46514433903',
  'cec24c2f-11e1-450b-9404-8b9c5da33eb5',
  'd3f58e11-ef9b-48cf-8e5e-f875394505ba',
  '1f248199-1f52-4d2b-8b54-a2218b0e0254',
  '3d8b7e24-2864-46c5-bf14-53730cdc6f94',
  '4f73c446-6f3a-4dd6-b54e-65a8f2a6d2bc'
)
  AND id != '[COMPANY_TO_KEEP_ID]'  -- ⚠️ SOSTITUISCI QUI!
ORDER BY created_at ASC;

-- ========================================
-- STEP 4: ESECUZIONE ELIMINAZIONE
-- ========================================

-- ⚠️⚠️⚠️ ATTENZIONE: OPERAZIONE IRREVERSIBILE! ⚠️⚠️⚠️
-- 
-- 1. Hai eseguito STEP 1 e copiato l'ID della company migliore?
-- 2. Hai eseguito STEP 3 e verificato cosa verrà eliminato?
-- 3. Sei SICURO di voler procedere?
--
-- Se sì, sostituisci [COMPANY_TO_KEEP_ID] con l'ID reale e decomment:

/*
DO $$ 
DECLARE
  company_to_keep UUID := '[COMPANY_TO_KEEP_ID]';  -- ⚠️ SOSTITUISCI CON L'ID REALE!
  companies_deleted INTEGER;
BEGIN
  -- Conta quante company verranno eliminate
  SELECT COUNT(*) INTO companies_deleted
  FROM public.companies
  WHERE id IN (
    '205c56c7-30b5-4526-b064-bf998c562df3',
    '90dedb9d-b5f4-454d-a8d3-b3144303ee12',
    'ffc07962-1885-4230-868f-9604388762b3',
    '17f279c1-5dbc-4fab-a1ae-efbeeb488166',
    '0e9a3717-0108-4f30-99e1-13256a7b97a8',
    '64c1b930-b04f-4cf4-a804-8c35449dec0a',
    '5499dcca-bfbe-480d-b8b3-1c286e601457',
    '2f59960d-5b98-4995-9409-ccd533e199f7',
    '536006a3-d297-4f3c-b816-e46514433903',
    'cec24c2f-11e1-450b-9404-8b9c5da33eb5',
    'd3f58e11-ef9b-48cf-8e5e-f875394505ba',
    '1f248199-1f52-4d2b-8b54-a2218b0e0254',
    '3d8b7e24-2864-46c5-bf14-53730cdc6f94',
    '4f73c446-6f3a-4dd6-b54e-65a8f2a6d2bc'
  )
    AND id != company_to_keep;

  -- Elimina le duplicate
  DELETE FROM public.companies
  WHERE id IN (
    '205c56c7-30b5-4526-b064-bf998c562df3',
    '90dedb9d-b5f4-454d-a8d3-b3144303ee12',
    'ffc07962-1885-4230-868f-9604388762b3',
    '17f279c1-5dbc-4fab-a1ae-efbeeb488166',
    '0e9a3717-0108-4f30-99e1-13256a7b97a8',
    '64c1b930-b04f-4cf4-a804-8c35449dec0a',
    '5499dcca-bfbe-480d-b8b3-1c286e601457',
    '2f59960d-5b98-4995-9409-ccd533e199f7',
    '536006a3-d297-4f3c-b816-e46514433903',
    'cec24c2f-11e1-450b-9404-8b9c5da33eb5',
    'd3f58e11-ef9b-48cf-8e5e-f875394505ba',
    '1f248199-1f52-4d2b-8b54-a2218b0e0254',
    '3d8b7e24-2864-46c5-bf14-53730cdc6f94',
    '4f73c446-6f3a-4dd6-b54e-65a8f2a6d2bc'
  )
    AND id != company_to_keep;
  
  RAISE NOTICE '✅ Eliminate % company duplicate', companies_deleted;
  RAISE NOTICE '✅ Mantenuta company: %', company_to_keep;
END $$;
*/

-- ========================================
-- STEP 5: VERIFICA
-- ========================================

-- Dopo l'eliminazione, verifica che sia rimasta SOLO UNA company

SELECT 
  COUNT(*) as remaining_companies,
  CASE 
    WHEN COUNT(*) = 1 THEN '✅ PERFETTO - Solo 1 company rimasta'
    WHEN COUNT(*) > 1 THEN '⚠️ ATTENZIONE - Ancora duplicate presenti'
    ELSE '❌ ERRORE - Nessuna company trovata'
  END as status
FROM public.companies
WHERE id IN (
  '205c56c7-30b5-4526-b064-bf998c562df3',
  '90dedb9d-b5f4-454d-a8d3-b3144303ee12',
  'ffc07962-1885-4230-868f-9604388762b3',
  '17f279c1-5dbc-4fab-a1ae-efbeeb488166',
  '0e9a3717-0108-4f30-99e1-13256a7b97a8',
  '64c1b930-b04f-4cf4-a804-8c35449dec0a',
  '5499dcca-bfbe-480d-b8b3-1c286e601457',
  '2f59960d-5b98-4995-9409-ccd533e199f7',
  '536006a3-d297-4f3c-b816-e46514433903',
  'cec24c2f-11e1-450b-9404-8b9c5da33eb5',
  'd3f58e11-ef9b-48cf-8e5e-f875394505ba',
  '1f248199-1f52-4d2b-8b54-a2218b0e0254',
  '3d8b7e24-2864-46c5-bf14-53730cdc6f94',
  '4f73c446-6f3a-4dd6-b54e-65a8f2a6d2bc'
);

-- Vedi la company rimasta con statistiche
SELECT 
  c.id as company_id,
  c.name as company_name,
  c.created_at,
  c.updated_at,
  c.email,
  (SELECT COUNT(*) FROM public.departments WHERE company_id = c.id) as num_departments,
  (SELECT COUNT(*) FROM public.staff WHERE company_id = c.id) as num_staff,
  (SELECT COUNT(*) FROM public.products WHERE company_id = c.id) as num_products,
  (SELECT COUNT(*) FROM public.conservation_points WHERE company_id = c.id) as num_conservation_points,
  (SELECT COUNT(*) FROM public.tasks WHERE company_id = c.id) as num_tasks
FROM public.companies c
WHERE c.id IN (
  '205c56c7-30b5-4526-b064-bf998c562df3',
  '90dedb9d-b5f4-454d-a8d3-b3144303ee12',
  'ffc07962-1885-4230-868f-9604388762b3',
  '17f279c1-5dbc-4fab-a1ae-efbeeb488166',
  '0e9a3717-0108-4f30-99e1-13256a7b97a8',
  '64c1b930-b04f-4cf4-a804-8c35449dec0a',
  '5499dcca-bfbe-480d-b8b3-1c286e601457',
  '2f59960d-5b98-4995-9409-ccd533e199f7',
  '536006a3-d297-4f3c-b816-e46514433903',
  'cec24c2f-11e1-450b-9404-8b9c5da33eb5',
  'd3f58e11-ef9b-48cf-8e5e-f875394505ba',
  '1f248199-1f52-4d2b-8b54-a2218b0e0254',
  '3d8b7e24-2864-46c5-bf14-53730cdc6f94',
  '4f73c446-6f3a-4dd6-b54e-65a8f2a6d2bc'
);

-- ========================================
-- STEP 6: CLEANUP DEPARTMENT DUPLICATI
-- ========================================

-- Vedi se hai department duplicati (es. 2 "Cucina")
SELECT 
  name,
  COUNT(*) as duplicate_count,
  STRING_AGG(id::TEXT, ', ') as duplicate_ids
FROM public.departments
WHERE company_id = '[COMPANY_TO_KEEP_ID]'  -- ⚠️ SOSTITUISCI!
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Se ci sono duplicati, puoi eliminarli mantenendo il più vecchio:
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
-- INFO VELOCI
-- ========================================

-- I tuoi 3 user ID:
-- - 1c14ed85-b4b2-4c0c-87f5-7a156b73a582 (matti169cava@libero.it)
-- - fe2d6c33-e71a-4be3-8b62-c77ab21824ee (0cavuz0@gmail.com)
-- - 0a82732d-d6ce-4835-a19b-18dd40315016 (matteo.cavallaro.work@gmail.com)

-- Department names che hai:
-- Deoor / Esterno, Magazzino B, Magazzino, Sala B, Cucina, 
-- Plonge / Lavaggio Piatti, Bancone, Sala

-- ========================================
-- PROSSIMI PASSI
-- ========================================
/*

Dopo aver pulito le company duplicate:

1. **Imposta Dev Company nell'app**:
   - Apri la console del browser (F12)
   - Esegui: devCompanyHelper.setDevCompany('[COMPANY_TO_KEEP_ID]')
   - Da ora in poi, SEMPRE quella company verrà usata

2. **Associa il tuo user alla company** (se non già fatto):
   INSERT INTO company_members (user_id, company_id, role, is_active)
   VALUES (
     '0a82732d-d6ce-4835-a19b-18dd40315016',  -- Il tuo user principale
     '[COMPANY_TO_KEEP_ID]',
     'admin',
     true
   )
   ON CONFLICT (user_id, company_id) DO UPDATE 
   SET is_active = true;

3. **Aggiorna user session**:
   INSERT INTO user_sessions (user_id, active_company_id, last_activity)
   VALUES (
     '0a82732d-d6ce-4835-a19b-18dd40315016',
     '[COMPANY_TO_KEEP_ID]',
     NOW()
   )
   ON CONFLICT (user_id) DO UPDATE 
   SET active_company_id = '[COMPANY_TO_keep_ID]',
       last_activity = NOW();

4. **Testa tutto**:
   - Fai login nell'app
   - Verifica che vedi i tuoi dati
   - Fai un onboarding di test
   - Verifica che NON venga creata una nuova company

*/

