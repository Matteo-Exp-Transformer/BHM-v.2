-- Migration: Add recurrence_config column to maintenance_tasks table
-- Description: Aggiunge la colonna JSONB recurrence_config per persistere i dati di ricorrenza configurati durante l'onboarding
-- Date: 2026-01-22
-- Related to: Fix calcolo next_due dopo completamento manutenzione

-- Aggiungi colonna recurrence_config alla tabella maintenance_tasks
ALTER TABLE public.maintenance_tasks
  ADD COLUMN IF NOT EXISTS recurrence_config JSONB DEFAULT NULL;

-- Commento sulla colonna per documentazione
COMMENT ON COLUMN public.maintenance_tasks.recurrence_config IS
  'Configurazione ricorrenza manutenzione: {
    weekdays: ["lunedi", "martedi", ...],  -- Giorni settimana per daily/weekly
    day_of_month: 15,                       -- Giorno del mese (1-31) per monthly
    day_of_year: "2026-03-15"              -- Data specifica per annually (sbrinamento)
  }
  - weekdays: array di giorni della settimana (lunedi, martedi, mercoledi, giovedi, venerdi, sabato, domenica)
  - day_of_month: giorno del mese (1-31) per frequenza monthly
  - day_of_year: data ISO per frequenza annually';

-- Crea un indice GIN per query JSONB efficienti
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_recurrence_config
  ON public.maintenance_tasks USING gin(recurrence_config);

-- Verifica che la colonna sia stata creata correttamente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'maintenance_tasks'
      AND column_name = 'recurrence_config'
  ) THEN
    RAISE EXCEPTION 'Colonna recurrence_config non creata correttamente';
  END IF;

  RAISE NOTICE 'Migration 019: recurrence_config aggiunto con successo a maintenance_tasks table';
END $$;
