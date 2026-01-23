-- Migration: 012_allow_null_department_for_all_tasks
-- Descrizione: Permette NULL per department_id quando l'attività è assegnata a "Tutti" i reparti
-- Data: 2025-01-27
-- Motivo: Permettere attività visibili a tutti i reparti quando si seleziona "Tutti"
-- 
-- NOTA: Questa migrazione è compatibile con la 011 (make_department_required_for_tasks)
-- Se la 011 è già stata eseguita, questa migrazione la "sovrascrive" permettendo NULL di nuovo
-- Se la 011 non è stata eseguita, questa migrazione è idempotente (non fa nulla se già nullable)

-- ============================================================================
-- VERIFICA: Controlla lo stato attuale del campo
-- ============================================================================

DO $$
DECLARE
    is_nullable BOOLEAN;
BEGIN
    SELECT is_nullable = 'YES' INTO is_nullable
    FROM information_schema.columns 
    WHERE table_schema = 'public'
      AND table_name = 'tasks' 
      AND column_name = 'department_id';
    
    IF is_nullable THEN
        RAISE NOTICE 'department_id is already nullable, skipping migration';
        RETURN;
    END IF;
END $$;

-- ============================================================================
-- MODIFICA: Permette NULL per department_id
-- ============================================================================

-- Rimuove il vincolo NOT NULL per permettere NULL quando è "Tutti"
-- Questa operazione è sicura anche se il vincolo non esiste (idempotente)
ALTER TABLE tasks ALTER COLUMN department_id DROP NOT NULL;

-- ============================================================================
-- COMMENTI: Aggiorna la documentazione
-- ============================================================================

COMMENT ON COLUMN tasks.department_id IS 'Reparto assegnato. NULL = visibile a tutti i reparti, altrimenti reparto specifico.';

-- ============================================================================
-- VERIFICA FINALE: Conferma che la modifica sia stata applicata
-- ============================================================================

-- Verifica che il campo sia effettivamente nullable
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'tasks' 
        AND column_name = 'department_id' 
        AND is_nullable = 'NO'
    ) THEN
        RAISE EXCEPTION 'Migration failed: department_id is still NOT NULL';
    END IF;
    
    RAISE NOTICE 'Migration completed successfully: department_id can now be NULL for "all departments" tasks';
END $$;

