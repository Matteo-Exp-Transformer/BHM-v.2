-- Script per verificare se la migration 014 è stata applicata
-- Esegui questo script su Supabase SQL Editor per verificare

-- 1. Verifica esistenza colonna recurrence_config
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'tasks'
  AND column_name = 'recurrence_config';

-- 2. Verifica esistenza indice GIN
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'tasks'
  AND indexname = 'idx_tasks_recurrence_config';

-- 3. Query di test: mostra sample di recurrence_config (se ci sono dati)
SELECT
  id,
  name,
  frequency,
  recurrence_config
FROM public.tasks
WHERE recurrence_config IS NOT NULL
LIMIT 5;

-- 4. Output atteso se migration applicata correttamente:
-- Query 1: Dovrebbe restituire 1 riga con:
--   - table_name: tasks
--   - column_name: recurrence_config
--   - data_type: jsonb
--   - is_nullable: YES
--   - column_default: NULL
--
-- Query 2: Dovrebbe restituire 1 riga con:
--   - indexname: idx_tasks_recurrence_config
--   - indexdef: CREATE INDEX ... USING gin (recurrence_config)
--
-- Query 3: Dipende dai dati - se ci sono task con recurrence_config li mostra

-- ✅ Se le prime 2 query restituiscono risultati: MIGRATION APPLICATA
-- ❌ Se le query restituiscono 0 righe: MIGRATION NON APPLICATA
--    In questo caso, esegui: database/migrations/014_add_recurrence_config_to_tasks.sql
