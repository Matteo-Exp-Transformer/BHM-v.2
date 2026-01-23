-- Migration: Add time_management column to tasks table
-- Description: Aggiunge la colonna JSONB time_management per gestire orari di completamento attività
-- Date: 2026-01-07

-- Aggiungi colonna time_management alla tabella tasks
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS time_management JSONB DEFAULT NULL;

-- Commento sulla colonna per documentazione
COMMENT ON COLUMN public.tasks.time_management IS 
  'Gestione orario attività: {
    time_range: { start_time, end_time, is_overnight } (opzionale, per visibilità evento),
    completion_type: "none" | "timeRange" | "startTime" | "endTime",
    completion_start_time: "HH:MM" (opzionale, se completion_type = "startTime"),
    completion_end_time: "HH:MM" (opzionale, se completion_type = "endTime")
  }';

-- Verifica che la colonna sia stata creata correttamente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'tasks' 
      AND column_name = 'time_management'
  ) THEN
    RAISE EXCEPTION 'Colonna time_management non creata correttamente';
  END IF;
END $$;

