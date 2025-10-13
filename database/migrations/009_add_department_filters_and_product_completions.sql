ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_department_id ON tasks(department_id);

ALTER TABLE maintenance_tasks
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_department_id ON maintenance_tasks(department_id);

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

CREATE INDEX IF NOT EXISTS idx_product_expiry_completions_company_id 
  ON product_expiry_completions(company_id);

CREATE INDEX IF NOT EXISTS idx_product_expiry_completions_product_id 
  ON product_expiry_completions(product_id);

CREATE INDEX IF NOT EXISTS idx_product_expiry_completions_completed_by 
  ON product_expiry_completions(completed_by);

CREATE INDEX IF NOT EXISTS idx_product_expiry_completions_completed_at 
  ON product_expiry_completions(completed_at DESC);

ALTER TABLE product_expiry_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view product expiry completions" ON product_expiry_completions;
CREATE POLICY "Users can view product expiry completions"
ON product_expiry_completions FOR SELECT
USING (is_company_member(company_id));

DROP POLICY IF EXISTS "Users can complete product expiries" ON product_expiry_completions;
CREATE POLICY "Users can complete product expiries"
ON product_expiry_completions FOR INSERT
WITH CHECK (is_company_member(company_id));

DROP POLICY IF EXISTS "Users can delete own completions within 24h" ON product_expiry_completions;
CREATE POLICY "Users can delete own completions within 24h"
ON product_expiry_completions FOR DELETE
USING (
  completed_by = auth.uid() 
  AND completed_at > (now() - INTERVAL '24 hours')
);

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

CREATE OR REPLACE FUNCTION auto_expire_products()
RETURNS TABLE(expired_count INTEGER) AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
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
