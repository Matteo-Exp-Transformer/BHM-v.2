-- ============================================================
-- MIGRATION 014: Aggiungi recurrence_config a tasks
-- ============================================================
--
-- ISTRUZIONI:
-- 1. Apri: https://supabase.com/dashboard
-- 2. Seleziona progetto: tucqgcfrlzmwyfadiodo
-- 3. Vai in: SQL Editor (menu laterale)
-- 4. Copia e incolla TUTTO il codice sotto
-- 5. Clicca "Run" (o Ctrl+Enter)
-- 6. Verifica output: deve dire "Migration 014: recurrence_config aggiunto con successo"
--
-- ============================================================

-- Aggiungi colonna recurrence_config alla tabella tasks
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS recurrence_config JSONB DEFAULT NULL;

-- Aggiungi commento documentazione
COMMENT ON COLUMN public.tasks.recurrence_config IS
  'Configurazione ricorrenza attività. Formato: {"custom_days": ["lunedi", "mercoledi"], "day_of_month": 15}';

-- Crea indice GIN per query JSONB efficienti
CREATE INDEX IF NOT EXISTS idx_tasks_recurrence_config
  ON public.tasks USING gin(recurrence_config);

-- Verifica che la colonna sia stata creata
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'tasks'
      AND column_name = 'recurrence_config'
  ) THEN
    RAISE EXCEPTION 'ERRORE: Colonna recurrence_config non creata';
  END IF;

  RAISE NOTICE '✅ Migration 014: recurrence_config aggiunto con successo a tasks table';
END $$;

-- Query verifica finale (opzionale)
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'tasks'
  AND column_name = 'recurrence_config';

-- Expected output:
-- column_name       | data_type | is_nullable
-- ------------------|-----------|-------------
-- recurrence_config | jsonb     | YES
