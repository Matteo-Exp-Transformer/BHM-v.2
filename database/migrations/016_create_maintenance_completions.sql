-- Migration: 016_create_maintenance_completions
-- Descrizione: Aggiorna tabella maintenance_completions per aggiungere colonna next_due (alias di next_due_date)
-- Data: 2025-01-16
-- Worker: 3
-- Nota: La tabella esiste già con struttura leggermente diversa. Aggiungiamo colonna next_due per compatibilità.

-- ============================================================================
-- TABELLA: maintenance_completions
-- Traccia i completamenti delle manutenzioni (maintenance_tasks)
-- La tabella esiste già, aggiungiamo solo la colonna next_due se non esiste
-- ============================================================================

-- Aggiungi colonna next_due se non esiste (la tabella ha già next_due_date)
-- Usiamo next_due come alias per compatibilità con il codice TypeScript
DO $$
BEGIN
  -- Verifica se la colonna next_due esiste già
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'maintenance_completions' 
    AND column_name = 'next_due'
  ) THEN
    -- Aggiungi colonna next_due (opzionale, può essere NULL)
    ALTER TABLE public.maintenance_completions
    ADD COLUMN next_due TIMESTAMPTZ;
    
    -- Se next_due_date esiste, copia i valori
    IF EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'maintenance_completions' 
      AND column_name = 'next_due_date'
    ) THEN
      UPDATE public.maintenance_completions
      SET next_due = next_due_date
      WHERE next_due_date IS NOT NULL;
    END IF;
  END IF;
END $$;

-- ============================================================================
-- INDICI (solo quelli che non esistono già)
-- ============================================================================

-- Verifica e crea indici solo se non esistono già
CREATE INDEX IF NOT EXISTS idx_maintenance_completions_company_id 
  ON public.maintenance_completions(company_id);

CREATE INDEX IF NOT EXISTS idx_maintenance_completions_task_id 
  ON public.maintenance_completions(maintenance_task_id);

CREATE INDEX IF NOT EXISTS idx_maintenance_completions_completed_by 
  ON public.maintenance_completions(completed_by);

CREATE INDEX IF NOT EXISTS idx_maintenance_completions_completed_at 
  ON public.maintenance_completions(completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_maintenance_completions_lookup 
  ON public.maintenance_completions(company_id, maintenance_task_id, completed_at DESC);

-- Aggiungi indice per next_due se la colonna esiste
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'maintenance_completions' 
    AND column_name = 'next_due'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_maintenance_completions_next_due 
      ON public.maintenance_completions(next_due);
  END IF;
END $$;

-- ============================================================================
-- TRIGGER: updated_at (solo se non esiste già)
-- ============================================================================

DROP TRIGGER IF EXISTS update_maintenance_completions_updated_at ON public.maintenance_completions;
CREATE TRIGGER update_maintenance_completions_updated_at
  BEFORE UPDATE ON public.maintenance_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTI (aggiorna solo se la colonna esiste)
-- ============================================================================

COMMENT ON TABLE public.maintenance_completions IS 'Storico completamenti task di manutenzione';

DO $$
BEGIN
  -- Commento per next_due solo se la colonna esiste
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'maintenance_completions' 
    AND column_name = 'next_due'
  ) THEN
    COMMENT ON COLUMN public.maintenance_completions.next_due IS 'Prossima scadenza calcolata al momento del completamento (compatibilità con codice TypeScript)';
  END IF;
END $$;
