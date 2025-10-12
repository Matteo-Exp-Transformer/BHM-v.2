-- Script per rimuovere TUTTI i task di test dopo aver verificato la funzionalità
-- ⚠️ ATTENZIONE: Questo script eliminerà TUTTI i task che iniziano con "🧪 TEST:"

-- ========================================
-- OPZIONE 1: Preview - Vedi quali task verranno eliminati
-- ========================================
-- Esegui prima questa query per vedere cosa verrà eliminato:

SELECT 
  id,
  name,
  description,
  created_at,
  priority,
  status
FROM public.tasks
WHERE name LIKE '🧪 TEST:%'
ORDER BY created_at;

-- ========================================
-- OPZIONE 2: Elimina TUTTI i task di test
-- ========================================
-- Decommenta e esegui questa query per eliminare definitivamente:

/*
DELETE FROM public.tasks 
WHERE name LIKE '🧪 TEST:%';
*/

-- ========================================
-- OPZIONE 3: Elimina solo task di test specifici per data
-- ========================================

-- Elimina SOLO task oltre 1 settimana (1 e 3 Ottobre):
/*
DELETE FROM public.tasks 
WHERE name LIKE '🧪 TEST:%OLTRE SETTIMANA%';
*/

-- Elimina SOLO task in ritardo (5, 7, 9, 11 Ottobre):
/*
DELETE FROM public.tasks 
WHERE name LIKE '🧪 TEST:%IN RITARDO%';
*/

-- Elimina SOLO task di oggi e futuri (12 e 15 Ottobre):
/*
DELETE FROM public.tasks 
WHERE name LIKE '🧪 TEST:%ATTIVO%';
*/

-- ========================================
-- OPZIONE 4: Elimina task di test per priorità
-- ========================================

-- Elimina SOLO task di test con priorità CRITICAL:
/*
DELETE FROM public.tasks 
WHERE name LIKE '🧪 TEST:%' 
  AND priority = 'critical';
*/

-- ========================================
-- VERIFICA FINALE
-- ========================================
-- Dopo aver eliminato, verifica che non ci siano più task di test:

/*
SELECT COUNT(*) as remaining_test_tasks
FROM public.tasks
WHERE name LIKE '🧪 TEST:%';
-- Dovrebbe restituire: 0
*/

-- ========================================
-- RIEPILOGO COMANDI RAPIDI
-- ========================================

-- 1. PREVIEW (SEMPRE ESEGUI PRIMA): 
--    SELECT * FROM public.tasks WHERE name LIKE '🧪 TEST:%';

-- 2. ELIMINA TUTTO: 
--    DELETE FROM public.tasks WHERE name LIKE '🧪 TEST:%';

-- 3. VERIFICA: 
--    SELECT COUNT(*) FROM public.tasks WHERE name LIKE '🧪 TEST:%';

