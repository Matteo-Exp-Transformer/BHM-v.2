-- Migration 009: Add Department to Tasks/Maintenance + Product Expiry Completions
-- Data: 2025-10-13
-- Descrizione: Aggiunge department_id a tasks/maintenance_tasks e crea product_expiry_completions

-- ============================================================================
-- 1. AGGIUNGI DEPARTMENT_ID A TASKS
-- ============================================================================

-- Aggiungi colonna department_id a tasks (opzionale)
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL;

-- Crea indice per performance
CREATE INDEX IF NOT EXISTS idx_tasks_department_id ON tasks(department_id);

COMMENT ON COLUMN tasks.department_id IS 'Reparto assegnato (opzionale) - Usato per filtrare eventi nel calendario';

-- ============================================================================
-- 2. AGGIUNGI DEPARTMENT_ID ESPLICITO A MAINTENANCE_TASKS
-- ============================================================================

-- maintenance_tasks ha già conservation_point_id che collega al reparto
-- Ma aggiungiamo department_id esplicito per filtraggio diretto

ALTER TABLE maintenance_tasks
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL;

-- Crea indice
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_department_id ON maintenance_tasks(department_id);

COMMENT ON COLUMN maintenance_tasks.department_id IS 'Reparto assegnato esplicito (opzionale) - Se NULL, usa department_id da conservation_point';

-- ============================================================================
-- 3. CREA TABELLA PRODUCT_EXPIRY_COMPLETIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS product_expiry_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  action VARCHAR NOT NULL CHECK (action IN ('expired', 'waste')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_product_expiry_completions_company_id 
  ON product_expiry_completions(company_id);

CREATE INDEX IF NOT EXISTS idx_product_expiry_completions_product_id 
  ON product_expiry_completions(product_id);

CREATE INDEX IF NOT EXISTS idx_product_expiry_completions_completed_by 
  ON product_expiry_completions(completed_by);

CREATE INDEX IF NOT EXISTS idx_product_expiry_completions_completed_at 
  ON product_expiry_completions(completed_at DESC);

-- Commenti
COMMENT ON TABLE product_expiry_completions IS 
  'Traccia completamenti scadenze prodotti (consumed/expired o waste)';

COMMENT ON COLUMN product_expiry_completions.action IS 
  'Azione: expired (consumato/cucinato) o waste (smaltito)';

-- ============================================================================
-- 4. RLS POLICIES - PRODUCT_EXPIRY_COMPLETIONS
-- ============================================================================

ALTER TABLE product_expiry_completions ENABLE ROW LEVEL SECURITY;

-- Policy SELECT: membri company possono vedere completamenti
DROP POLICY IF EXISTS "Users can view product expiry completions" ON product_expiry_completions;
CREATE POLICY "Users can view product expiry completions"
ON product_expiry_completions FOR SELECT
USING (is_company_member(company_id));

-- Policy INSERT: membri company possono completare scadenze
DROP POLICY IF EXISTS "Users can complete product expiries" ON product_expiry_completions;
CREATE POLICY "Users can complete product expiries"
ON product_expiry_completions FOR INSERT
WITH CHECK (is_company_member(company_id));

-- Policy DELETE: solo chi ha completato può eliminare (entro 24h)
DROP POLICY IF EXISTS "Users can delete own completions within 24h" ON product_expiry_completions;
CREATE POLICY "Users can delete own completions within 24h"
ON product_expiry_completions FOR DELETE
USING (
  completed_by = auth.uid() 
  AND completed_at > (now() - INTERVAL '24 hours')
);

-- ============================================================================
-- 5. TRIGGER AUTO-UPDATE updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_product_expiry_completions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_product_expiry_completions_updated_at 
  ON product_expiry_completions;

CREATE TRIGGER trigger_update_product_expiry_completions_updated_at
BEFORE UPDATE ON product_expiry_completions
FOR EACH ROW
EXECUTE FUNCTION update_product_expiry_completions_updated_at();

-- ============================================================================
-- 6. FUNCTION: AUTO-EXPIRE PRODUCTS (chiamata da cron o manualmente)
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_expire_products()
RETURNS TABLE(expired_count INTEGER) AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  -- Update products che sono scaduti (expiry_date < oggi) e status ancora 'active'
  UPDATE products
  SET status = 'expired',
      updated_at = now()
  WHERE expiry_date < CURRENT_DATE
    AND status = 'active';
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  expired_count := v_count;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION auto_expire_products() IS 
  'Aggiorna automaticamente status prodotti scaduti da active a expired';

-- ============================================================================
-- 7. VERIFICA MIGRAZIONE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration 009 completata con successo!';
  RAISE NOTICE '   - department_id aggiunto a tasks';
  RAISE NOTICE '   - department_id aggiunto a maintenance_tasks';
  RAISE NOTICE '   - Tabella product_expiry_completions creata';
  RAISE NOTICE '   - RLS policies configurate';
  RAISE NOTICE '   - Trigger auto-update creato';
  RAISE NOTICE '   - Function auto_expire_products() creata';
END $$;

