-- =============================================
-- CONSERVATION SYSTEM SCHEMA
-- Add these tables to your Supabase database
-- =============================================

-- 1. Conservation Points Table
CREATE TABLE IF NOT EXISTS conservation_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  setpoint_temp DECIMAL(4,1) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('ambient', 'fridge', 'freezer', 'blast')),
  product_categories TEXT[], -- Array of product categories
  is_blast_chiller BOOLEAN DEFAULT false,
  maintenance_due TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Temperature Readings Table
CREATE TABLE IF NOT EXISTS temperature_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  conservation_point_id UUID NOT NULL REFERENCES conservation_points(id) ON DELETE CASCADE,
  temperature DECIMAL(4,1) NOT NULL,
  target_temperature DECIMAL(4,1) NOT NULL,
  tolerance_range_min DECIMAL(4,1),
  tolerance_range_max DECIMAL(4,1),
  status VARCHAR(20) NOT NULL CHECK (status IN ('compliant', 'warning', 'critical')),
  recorded_by UUID NOT NULL REFERENCES staff(id),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  method VARCHAR(30) DEFAULT 'manual' CHECK (method IN ('manual', 'digital_thermometer', 'automatic_sensor')),
  notes TEXT,
  photo_evidence TEXT, -- URL to photo in Supabase Storage
  validation_status VARCHAR(20) DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validated', 'flagged'))
);

-- 3. Maintenance Tasks Table
CREATE TABLE IF NOT EXISTS maintenance_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  conservation_point_id UUID NOT NULL REFERENCES conservation_points(id) ON DELETE CASCADE,
  kind VARCHAR(20) NOT NULL CHECK (kind IN ('temperature', 'sanitization', 'defrosting')),
  frequency VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'custom'
  assigned_to UUID REFERENCES staff(id),
  assignment_type VARCHAR(20) DEFAULT 'user' CHECK (assignment_type IN ('user', 'role', 'category')),
  next_due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  estimated_duration INTEGER DEFAULT 30, -- minutes
  checklist TEXT[], -- Array of checklist items
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Maintenance Completions Table
CREATE TABLE IF NOT EXISTS maintenance_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  maintenance_task_id UUID NOT NULL REFERENCES maintenance_tasks(id) ON DELETE CASCADE,
  completed_by UUID NOT NULL REFERENCES staff(id),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'partial', 'skipped')),
  notes TEXT,
  temperature_value DECIMAL(4,1), -- If it's a temperature maintenance
  checklist_completed TEXT[], -- Array of completed checklist items
  photo_evidence TEXT[] -- Array of photo URLs
);

-- Enable RLS on all tables
ALTER TABLE conservation_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE temperature_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Conservation Points
DROP POLICY IF EXISTS "Users can view company conservation points" ON conservation_points;
CREATE POLICY "Users can view company conservation points" ON conservation_points FOR SELECT
  USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Admin can manage conservation points" ON conservation_points;
CREATE POLICY "Admin can manage conservation points" ON conservation_points FOR ALL
  USING (
    company_id = get_user_company_id() AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
      AND role IN ('admin', 'responsabile')
    )
  );

-- RLS Policies for Temperature Readings
DROP POLICY IF EXISTS "Users can view company temperature readings" ON temperature_readings;
CREATE POLICY "Users can view company temperature readings" ON temperature_readings FOR SELECT
  USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Users can create temperature readings" ON temperature_readings;
CREATE POLICY "Users can create temperature readings" ON temperature_readings FOR INSERT
  WITH CHECK (
    company_id = get_user_company_id() AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
      AND role IN ('admin', 'responsabile', 'dipendente', 'collaboratore')
    )
  );

DROP POLICY IF EXISTS "Admin can manage temperature readings" ON temperature_readings;
CREATE POLICY "Admin can manage temperature readings" ON temperature_readings FOR ALL
  USING (
    company_id = get_user_company_id() AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
      AND role IN ('admin', 'responsabile')
    )
  );

-- RLS Policies for Maintenance Tasks
DROP POLICY IF EXISTS "Users can view company maintenance tasks" ON maintenance_tasks;
CREATE POLICY "Users can view company maintenance tasks" ON maintenance_tasks FOR SELECT
  USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Admin can manage maintenance tasks" ON maintenance_tasks;
CREATE POLICY "Admin can manage maintenance tasks" ON maintenance_tasks FOR ALL
  USING (
    company_id = get_user_company_id() AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
      AND role IN ('admin', 'responsabile')
    )
  );

-- RLS Policies for Maintenance Completions
DROP POLICY IF EXISTS "Users can view company maintenance completions" ON maintenance_completions;
CREATE POLICY "Users can view company maintenance completions" ON maintenance_completions FOR SELECT
  USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Users can create maintenance completions" ON maintenance_completions;
CREATE POLICY "Users can create maintenance completions" ON maintenance_completions FOR INSERT
  WITH CHECK (
    company_id = get_user_company_id() AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
      AND role IN ('admin', 'responsabile', 'dipendente', 'collaboratore')
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conservation_points_company_id ON conservation_points(company_id);
CREATE INDEX IF NOT EXISTS idx_conservation_points_department_id ON conservation_points(department_id);
CREATE INDEX IF NOT EXISTS idx_conservation_points_type ON conservation_points(type);

CREATE INDEX IF NOT EXISTS idx_temperature_readings_company_id ON temperature_readings(company_id);
CREATE INDEX IF NOT EXISTS idx_temperature_readings_conservation_point_id ON temperature_readings(conservation_point_id);
CREATE INDEX IF NOT EXISTS idx_temperature_readings_recorded_at ON temperature_readings(recorded_at);
CREATE INDEX IF NOT EXISTS idx_temperature_readings_status ON temperature_readings(status);

CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_company_id ON maintenance_tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_conservation_point_id ON maintenance_tasks(conservation_point_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_next_due_date ON maintenance_tasks(next_due_date);

CREATE INDEX IF NOT EXISTS idx_maintenance_completions_company_id ON maintenance_completions(company_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_completions_task_id ON maintenance_completions(maintenance_task_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_completions_completed_at ON maintenance_completions(completed_at);

-- Insert some sample conservation points for testing
INSERT INTO conservation_points (company_id, department_id, name, setpoint_temp, type, is_blast_chiller, product_categories) VALUES
((SELECT id FROM companies LIMIT 1),
 (SELECT id FROM departments WHERE name = 'Cucina' LIMIT 1),
 'Frigorifero Cucina 1', 4.0, 'fridge', false,
 ARRAY['Carni fresche', 'Latticini', 'Verdure fresche']),
((SELECT id FROM companies LIMIT 1),
 (SELECT id FROM departments WHERE name = 'Cucina' LIMIT 1),
 'Freezer Principale', -18.0, 'freezer', false,
 ARRAY['Carni trasformate', 'Surgelati', 'Gelati']),
((SELECT id FROM companies LIMIT 1),
 (SELECT id FROM departments WHERE name = 'Bancone' LIMIT 1),
 'Vetrina Refrigerata', 6.0, 'fridge', false,
 ARRAY['Prodotti da forno', 'Bevande']),
((SELECT id FROM companies LIMIT 1),
 (SELECT id FROM departments WHERE name = 'Cucina' LIMIT 1),
 'Abbattitore Rapido', -35.0, 'blast', true,
 ARRAY['Preparazioni cotte', 'Carni fresche'])
ON CONFLICT DO NOTHING;

SELECT 'Conservation system schema created successfully!' as status;