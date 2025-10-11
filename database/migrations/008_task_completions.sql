-- Migration: 008_task_completions
-- Descrizione: Aggiunge tabella task_completions per tracciare il completamento delle mansioni
-- Data: 2025-10-11

-- ============================================================================
-- TABELLA: task_completions
-- Traccia i completamenti delle mansioni (tasks)
-- ============================================================================

CREATE TABLE IF NOT EXISTS task_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDICI
-- ============================================================================

CREATE INDEX idx_task_completions_company_id ON task_completions(company_id);
CREATE INDEX idx_task_completions_task_id ON task_completions(task_id);
CREATE INDEX idx_task_completions_completed_by ON task_completions(completed_by);
CREATE INDEX idx_task_completions_period ON task_completions(task_id, period_start, period_end);
CREATE INDEX idx_task_completions_lookup ON task_completions(company_id, task_id, completed_at DESC);

-- ============================================================================
-- TRIGGER: updated_at
-- ============================================================================

CREATE TRIGGER update_task_completions_updated_at
  BEFORE UPDATE ON task_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RLS POLICIES (opzionali, da attivare quando si abilita RLS)
-- ============================================================================

-- NOTA: Le policies RLS sono pronte ma non attive.
-- Per attivarle: ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;

-- Policy: Gli utenti possono vedere i completamenti della propria azienda
-- CREATE POLICY "Users can view task completions of their company"
--   ON task_completions FOR SELECT
--   USING (company_id = get_active_company_id());

-- Policy: Gli utenti possono inserire completamenti per la propria azienda
-- CREATE POLICY "Users can insert task completions for their company"
--   ON task_completions FOR INSERT
--   WITH CHECK (company_id = get_active_company_id());

-- Policy: Gli utenti possono aggiornare completamenti della propria azienda
-- CREATE POLICY "Users can update task completions of their company"
--   ON task_completions FOR UPDATE
--   USING (company_id = get_active_company_id());

-- Policy: Solo admin possono eliminare completamenti
-- CREATE POLICY "Only admins can delete task completions"
--   ON task_completions FOR DELETE
--   USING (company_id = get_active_company_id() AND is_admin(get_active_company_id()));

-- ============================================================================
-- FINE MIGRATION
-- ============================================================================
