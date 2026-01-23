-- Migration: Add recurrence_config column to tasks table
-- Description: Aggiunge la colonna JSONB recurrence_config per gestire configurazione ricorrenza attività
-- Date: 2026-01-08
-- Related to: GenericTaskForm fix - selezione giorni per settimanale/giornaliera e giorno mese per mensile

-- Aggiungi colonna recurrence_config alla tabella tasks
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS recurrence_config JSONB DEFAULT NULL;

-- Commento sulla colonna per documentazione
COMMENT ON COLUMN public.tasks.recurrence_config IS
  'Configurazione ricorrenza: {
    custom_days: ["lunedi", "martedi", "mercoledi", "giovedi", "venerdi", "sabato", "domenica"],
    day_of_month: 15 (1-31)
  }
  - custom_days: array di giorni della settimana per frequenze weekly/daily/custom
  - day_of_month: giorno del mese (1-31) per frequenza monthly';

-- Crea un indice GIN per query JSONB efficienti (opzionale ma consigliato)
CREATE INDEX IF NOT EXISTS idx_tasks_recurrence_config
  ON public.tasks USING gin(recurrence_config);

-- Verifica che la colonna sia stata creata correttamente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'tasks'
      AND column_name = 'recurrence_config'
  ) THEN
    RAISE EXCEPTION 'Colonna recurrence_config non creata correttamente';
  END IF;

  RAISE NOTICE 'Migration 014: recurrence_config aggiunto con successo a tasks table';
END $$;
