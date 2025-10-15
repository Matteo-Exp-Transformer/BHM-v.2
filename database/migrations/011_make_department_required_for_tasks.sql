-- Migration: 011_make_department_required_for_tasks
-- Descrizione: Rende obbligatorio il campo department_id per le attività generiche (tasks)
-- Data: 2025-01-14
-- Motivo: Il reparto deve essere sempre specificato per le nuove attività/mansioni generiche

-- ============================================================================
-- VERIFICA: Controlla che tutti i tasks esistenti abbiano un department_id
-- ============================================================================

-- Questa migrazione fallirà se ci sono tasks senza department_id
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM tasks WHERE department_id IS NULL) THEN
        RAISE EXCEPTION 'Cannot make department_id required: there are % tasks without department_id. Please assign departments to all existing tasks first.', 
            (SELECT COUNT(*) FROM tasks WHERE department_id IS NULL);
    END IF;
END $$;

-- ============================================================================
-- MODIFICA: Rende obbligatorio il campo department_id
-- ============================================================================

-- Rimuove il vincolo NOT NULL temporaneamente per poterlo ricreare
ALTER TABLE tasks ALTER COLUMN department_id DROP NOT NULL;

-- Ricrea il vincolo NOT NULL
ALTER TABLE tasks ALTER COLUMN department_id SET NOT NULL;

-- ============================================================================
-- COMMENTI: Aggiorna la documentazione
-- ============================================================================

COMMENT ON COLUMN tasks.department_id IS 'Reparto obbligatorio per l''attività generica. Riferimento alla tabella departments.';

-- ============================================================================
-- VERIFICA FINALE: Conferma che la modifica sia stata applicata
-- ============================================================================

-- Verifica che il campo sia effettivamente NOT NULL
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'tasks' 
        AND column_name = 'department_id' 
        AND is_nullable = 'YES'
    ) THEN
        RAISE EXCEPTION 'Migration failed: department_id is still nullable';
    END IF;
    
    RAISE NOTICE 'Migration completed successfully: department_id is now required for tasks';
END $$;
