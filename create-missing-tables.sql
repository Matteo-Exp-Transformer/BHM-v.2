-- =============================================
-- CREATE MISSING TABLES - HACCP Business Manager
-- Execute this in Supabase SQL Editor to create missing tables
-- =============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create products table (main missing table causing 404 errors)
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  conservation_point_id UUID REFERENCES conservation_points(id) ON DELETE SET NULL,
  barcode VARCHAR(255),
  sku VARCHAR(255),
  supplier_name VARCHAR(255),
  purchase_date DATE,
  expiry_date DATE,
  quantity DECIMAL(10,3),
  unit VARCHAR(50),
  allergens TEXT[] DEFAULT '{}',
  label_photo_url TEXT,
  status VARCHAR(20) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT product_status_check CHECK (status IN ('active', 'expired', 'consumed', 'waste'))
);

-- Create temperature_readings table
CREATE TABLE IF NOT EXISTS temperature_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  conservation_point_id UUID NOT NULL REFERENCES conservation_points(id) ON DELETE CASCADE,
  temperature DECIMAL(5,2) NOT NULL,
  target_temperature DECIMAL(5,2),
  tolerance_range_min DECIMAL(5,2),
  tolerance_range_max DECIMAL(5,2),
  status VARCHAR(20) DEFAULT 'compliant',
  recorded_by UUID REFERENCES user_profiles(id),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  method VARCHAR(50) DEFAULT 'manual',
  notes TEXT,
  photo_evidence TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT temp_status_check CHECK (status IN ('compliant', 'warning', 'critical')),
  CONSTRAINT temp_method_check CHECK (method IN ('manual', 'digital_thermometer', 'automatic_sensor'))
);

-- Create maintenance_tasks table
CREATE TABLE IF NOT EXISTS maintenance_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  conservation_point_id UUID REFERENCES conservation_points(id) ON DELETE CASCADE,
  kind VARCHAR(50) NOT NULL,
  frequency VARCHAR(20) NOT NULL,
  assigned_to UUID REFERENCES staff(id),
  assignment_type VARCHAR(20) DEFAULT 'user',
  next_due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  estimated_duration INTEGER DEFAULT 30,
  checklist TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT task_kind_check CHECK (kind IN ('temperature', 'sanitization', 'defrosting')),
  CONSTRAINT task_frequency_check CHECK (frequency IN ('daily', 'weekly', 'monthly', 'custom')),
  CONSTRAINT task_assignment_check CHECK (assignment_type IN ('user', 'role', 'category'))
);

-- Create maintenance_completions table
CREATE TABLE IF NOT EXISTS maintenance_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  maintenance_task_id UUID NOT NULL REFERENCES maintenance_tasks(id) ON DELETE CASCADE,
  completed_by UUID REFERENCES user_profiles(id),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status VARCHAR(20) DEFAULT 'completed',
  notes TEXT,
  temperature_value DECIMAL(5,2),
  checklist_completed TEXT[] DEFAULT '{}',
  photo_evidence TEXT[],
  next_due_date TIMESTAMP WITH TIME ZONE,
  CONSTRAINT completion_status_check CHECK (status IN ('completed', 'partial', 'skipped'))
);

-- Enable RLS on new tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE temperature_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_completions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for products table
DROP POLICY IF EXISTS "Users can view company products" ON products;
CREATE POLICY "Users can view company products" ON products FOR SELECT
  USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Users can manage company products" ON products;
CREATE POLICY "Users can manage company products" ON products FOR ALL
  USING (company_id = get_user_company_id());

-- Create RLS policies for temperature_readings table
DROP POLICY IF EXISTS "Users can view company temperature readings" ON temperature_readings;
CREATE POLICY "Users can view company temperature readings" ON temperature_readings FOR SELECT
  USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Users can manage company temperature readings" ON temperature_readings;
CREATE POLICY "Users can manage company temperature readings" ON temperature_readings FOR ALL
  USING (company_id = get_user_company_id());

-- Create RLS policies for maintenance_tasks table
DROP POLICY IF EXISTS "Users can view company maintenance tasks" ON maintenance_tasks;
CREATE POLICY "Users can view company maintenance tasks" ON maintenance_tasks FOR SELECT
  USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Users can manage company maintenance tasks" ON maintenance_tasks;
CREATE POLICY "Users can manage company maintenance tasks" ON maintenance_tasks FOR ALL
  USING (company_id = get_user_company_id());

-- Create RLS policies for maintenance_completions table
DROP POLICY IF EXISTS "Users can view company maintenance completions" ON maintenance_completions;
CREATE POLICY "Users can view company maintenance completions" ON maintenance_completions FOR SELECT
  USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Users can manage company maintenance completions" ON maintenance_completions;
CREATE POLICY "Users can manage company maintenance completions" ON maintenance_completions FOR ALL
  USING (company_id = get_user_company_id());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_company_id ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_department_id ON products(department_id);
CREATE INDEX IF NOT EXISTS idx_products_conservation_point_id ON products(conservation_point_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_expiry_date ON products(expiry_date);

CREATE INDEX IF NOT EXISTS idx_temperature_readings_company_id ON temperature_readings(company_id);
CREATE INDEX IF NOT EXISTS idx_temperature_readings_conservation_point_id ON temperature_readings(conservation_point_id);
CREATE INDEX IF NOT EXISTS idx_temperature_readings_recorded_at ON temperature_readings(recorded_at);

CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_company_id ON maintenance_tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_conservation_point_id ON maintenance_tasks(conservation_point_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_next_due_date ON maintenance_tasks(next_due_date);

CREATE INDEX IF NOT EXISTS idx_maintenance_completions_company_id ON maintenance_completions(company_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_completions_task_id ON maintenance_completions(maintenance_task_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_completions_completed_at ON maintenance_completions(completed_at);

-- Insert some test data for products to verify functionality
INSERT INTO products (
  company_id,
  name,
  status,
  quantity,
  unit,
  notes
) VALUES
(
  (SELECT id FROM companies LIMIT 1),
  'Test Product - Lattimissimo',
  'active',
  5.0,
  'litri',
  'Prodotto di test creato automaticamente'
)
ON CONFLICT (id) DO NOTHING;

SELECT 'Missing tables created successfully! Products table and dependencies are now available.' as status;