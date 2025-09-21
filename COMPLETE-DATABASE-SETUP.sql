-- =============================================
-- COMPLETE DATABASE SETUP - HACCP Business Manager
-- ⚠️  IMPORTANTE: Esegui questo script in UN SOLO SNIPPET in Supabase
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- STEP 1: Clean up existing tables (if needed)
-- =============================================
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS temperature_readings CASCADE;
DROP TABLE IF EXISTS maintenance_tasks CASCADE;
DROP TABLE IF EXISTS maintenance_completions CASCADE;

-- =============================================
-- STEP 2: Ensure all prerequisite tables exist
-- =============================================

-- Make sure we have the get_user_company_id function
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM user_profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'
$$ LANGUAGE SQL SECURITY DEFINER;

-- =============================================
-- STEP 3: Create all missing tables in correct order
-- =============================================

-- Conservation points table (if not exists)
CREATE TABLE IF NOT EXISTS conservation_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  setpoint_temp DECIMAL(5,2) NOT NULL,
  type VARCHAR(20) NOT NULL,
  product_categories TEXT[] DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'normal',
  is_blast_chiller BOOLEAN DEFAULT false,
  maintenance_due TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT conservation_type_check CHECK (type IN ('ambient', 'fridge', 'freezer', 'blast')),
  CONSTRAINT conservation_status_check CHECK (status IN ('normal', 'warning', 'critical')),
  UNIQUE(company_id, name)
);

-- Product categories table (ensure it exists)
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  temperature_requirement_min DECIMAL(5,2),
  temperature_requirement_max DECIMAL(5,2),
  allergen_info TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(company_id, name)
);

-- NOW create products table with explicit foreign key names
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  category_id UUID,
  department_id UUID,
  conservation_point_id UUID,
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

  -- Add foreign key constraints with explicit names
  CONSTRAINT fk_products_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_products_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  CONSTRAINT fk_products_conservation_point FOREIGN KEY (conservation_point_id) REFERENCES conservation_points(id) ON DELETE SET NULL,
  CONSTRAINT product_status_check CHECK (status IN ('active', 'expired', 'consumed', 'waste'))
);

-- Temperature readings table
CREATE TABLE temperature_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  conservation_point_id UUID NOT NULL,
  temperature DECIMAL(5,2) NOT NULL,
  target_temperature DECIMAL(5,2),
  tolerance_range_min DECIMAL(5,2),
  tolerance_range_max DECIMAL(5,2),
  status VARCHAR(20) DEFAULT 'compliant',
  recorded_by UUID,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  method VARCHAR(50) DEFAULT 'manual',
  notes TEXT,
  photo_evidence TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Foreign key constraints
  CONSTRAINT fk_temp_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT fk_temp_conservation_point FOREIGN KEY (conservation_point_id) REFERENCES conservation_points(id) ON DELETE CASCADE,
  CONSTRAINT fk_temp_recorded_by FOREIGN KEY (recorded_by) REFERENCES user_profiles(id),
  CONSTRAINT temp_status_check CHECK (status IN ('compliant', 'warning', 'critical')),
  CONSTRAINT temp_method_check CHECK (method IN ('manual', 'digital_thermometer', 'automatic_sensor'))
);

-- Maintenance tasks table
CREATE TABLE maintenance_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  conservation_point_id UUID,
  kind VARCHAR(50) NOT NULL,
  frequency VARCHAR(20) NOT NULL,
  assigned_to UUID,
  assignment_type VARCHAR(20) DEFAULT 'user',
  next_due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  estimated_duration INTEGER DEFAULT 30,
  checklist TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Foreign key constraints
  CONSTRAINT fk_maintenance_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT fk_maintenance_conservation_point FOREIGN KEY (conservation_point_id) REFERENCES conservation_points(id) ON DELETE CASCADE,
  CONSTRAINT fk_maintenance_assigned_to FOREIGN KEY (assigned_to) REFERENCES staff(id),
  CONSTRAINT task_kind_check CHECK (kind IN ('temperature', 'sanitization', 'defrosting')),
  CONSTRAINT task_frequency_check CHECK (frequency IN ('daily', 'weekly', 'monthly', 'custom')),
  CONSTRAINT task_assignment_check CHECK (assignment_type IN ('user', 'role', 'category'))
);

-- Maintenance completions table
CREATE TABLE maintenance_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  maintenance_task_id UUID NOT NULL,
  completed_by UUID,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status VARCHAR(20) DEFAULT 'completed',
  notes TEXT,
  temperature_value DECIMAL(5,2),
  checklist_completed TEXT[] DEFAULT '{}',
  photo_evidence TEXT[],
  next_due_date TIMESTAMP WITH TIME ZONE,

  -- Foreign key constraints
  CONSTRAINT fk_completion_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT fk_completion_task FOREIGN KEY (maintenance_task_id) REFERENCES maintenance_tasks(id) ON DELETE CASCADE,
  CONSTRAINT fk_completion_user FOREIGN KEY (completed_by) REFERENCES user_profiles(id),
  CONSTRAINT completion_status_check CHECK (status IN ('completed', 'partial', 'skipped'))
);

-- =============================================
-- STEP 4: Enable RLS on all new tables
-- =============================================
ALTER TABLE conservation_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE temperature_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_completions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- STEP 5: Create RLS policies
-- =============================================

-- Conservation points policies
DROP POLICY IF EXISTS "Users can view company conservation points" ON conservation_points;
CREATE POLICY "Users can view company conservation points" ON conservation_points FOR SELECT
  USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Users can manage company conservation points" ON conservation_points;
CREATE POLICY "Users can manage company conservation points" ON conservation_points FOR ALL
  USING (company_id = get_user_company_id());

-- Product categories policies
DROP POLICY IF EXISTS "Users can view company product categories" ON product_categories;
CREATE POLICY "Users can view company product categories" ON product_categories FOR SELECT
  USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Users can manage company product categories" ON product_categories;
CREATE POLICY "Users can manage company product categories" ON product_categories FOR ALL
  USING (company_id = get_user_company_id());

-- Products policies
DROP POLICY IF EXISTS "Users can view company products" ON products;
CREATE POLICY "Users can view company products" ON products FOR SELECT
  USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Users can manage company products" ON products;
CREATE POLICY "Users can manage company products" ON products FOR ALL
  USING (company_id = get_user_company_id());

-- Temperature readings policies
DROP POLICY IF EXISTS "Users can view company temperature readings" ON temperature_readings;
CREATE POLICY "Users can view company temperature readings" ON temperature_readings FOR SELECT
  USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Users can manage company temperature readings" ON temperature_readings;
CREATE POLICY "Users can manage company temperature readings" ON temperature_readings FOR ALL
  USING (company_id = get_user_company_id());

-- Maintenance tasks policies
DROP POLICY IF EXISTS "Users can view company maintenance tasks" ON maintenance_tasks;
CREATE POLICY "Users can view company maintenance tasks" ON maintenance_tasks FOR SELECT
  USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Users can manage company maintenance tasks" ON maintenance_tasks;
CREATE POLICY "Users can manage company maintenance tasks" ON maintenance_tasks FOR ALL
  USING (company_id = get_user_company_id());

-- Maintenance completions policies
DROP POLICY IF EXISTS "Users can view company maintenance completions" ON maintenance_completions;
CREATE POLICY "Users can view company maintenance completions" ON maintenance_completions FOR SELECT
  USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Users can manage company maintenance completions" ON maintenance_completions;
CREATE POLICY "Users can manage company maintenance completions" ON maintenance_completions FOR ALL
  USING (company_id = get_user_company_id());

-- =============================================
-- STEP 6: Create performance indexes
-- =============================================

-- Conservation points indexes
CREATE INDEX IF NOT EXISTS idx_conservation_points_company_id ON conservation_points(company_id);
CREATE INDEX IF NOT EXISTS idx_conservation_points_department_id ON conservation_points(department_id);

-- Product categories indexes
CREATE INDEX IF NOT EXISTS idx_product_categories_company_id ON product_categories(company_id);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_company_id ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_department_id ON products(department_id);
CREATE INDEX IF NOT EXISTS idx_products_conservation_point_id ON products(conservation_point_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_expiry_date ON products(expiry_date);

-- Temperature readings indexes
CREATE INDEX IF NOT EXISTS idx_temperature_readings_company_id ON temperature_readings(company_id);
CREATE INDEX IF NOT EXISTS idx_temperature_readings_conservation_point_id ON temperature_readings(conservation_point_id);
CREATE INDEX IF NOT EXISTS idx_temperature_readings_recorded_at ON temperature_readings(recorded_at);

-- Maintenance tasks indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_company_id ON maintenance_tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_conservation_point_id ON maintenance_tasks(conservation_point_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_next_due_date ON maintenance_tasks(next_due_date);

-- Maintenance completions indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_completions_company_id ON maintenance_completions(company_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_completions_task_id ON maintenance_completions(maintenance_task_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_completions_completed_at ON maintenance_completions(completed_at);

-- =============================================
-- STEP 7: Insert test data
-- =============================================

-- Get the test company ID
DO $$
DECLARE
    test_company_id UUID;
    test_department_id UUID;
    test_conservation_point_id UUID;
    test_category_id UUID;
BEGIN
    -- Get the first company
    SELECT id INTO test_company_id FROM companies LIMIT 1;

    IF test_company_id IS NOT NULL THEN
        -- Get a department
        SELECT id INTO test_department_id FROM departments WHERE company_id = test_company_id LIMIT 1;

        -- Insert a conservation point
        INSERT INTO conservation_points (
            company_id, department_id, name, setpoint_temp, type, is_blast_chiller
        ) VALUES (
            test_company_id, test_department_id, 'Frigorifero Principale', 4.0, 'fridge', false
        ) ON CONFLICT (company_id, name) DO NOTHING;

        SELECT id INTO test_conservation_point_id FROM conservation_points
        WHERE company_id = test_company_id AND name = 'Frigorifero Principale' LIMIT 1;

        -- Insert product categories
        INSERT INTO product_categories (
            company_id, name, description, temperature_requirement_min, temperature_requirement_max
        ) VALUES
        (test_company_id, 'Latticini', 'Prodotti caseari e derivati del latte', 0, 4),
        (test_company_id, 'Carne Fresca', 'Carne bovina, suina, pollame', 0, 4),
        (test_company_id, 'Verdure', 'Verdure fresche e ortaggi', 0, 8)
        ON CONFLICT (company_id, name) DO NOTHING;

        SELECT id INTO test_category_id FROM product_categories
        WHERE company_id = test_company_id AND name = 'Latticini' LIMIT 1;

        -- Insert test products
        INSERT INTO products (
            company_id, name, category_id, department_id, conservation_point_id,
            status, quantity, unit, expiry_date, notes
        ) VALUES
        (test_company_id, 'Latte Fresco Intero', test_category_id, test_department_id, test_conservation_point_id,
         'active', 10.0, 'litri', CURRENT_DATE + INTERVAL '7 days', 'Prodotto di test'),
        (test_company_id, 'Parmigiano Reggiano', test_category_id, test_department_id, test_conservation_point_id,
         'active', 2.5, 'kg', CURRENT_DATE + INTERVAL '30 days', 'Formaggio stagionato 24 mesi'),
        (test_company_id, 'Latte Scaduto Test', test_category_id, test_department_id, test_conservation_point_id,
         'expired', 1.0, 'litri', CURRENT_DATE - INTERVAL '2 days', 'Prodotto scaduto per test');
    END IF;
END $$;

-- =============================================
-- STEP 8: Force schema cache refresh
-- =============================================

-- Force Supabase to refresh its schema cache
NOTIFY pgrst, 'reload schema';

-- =============================================
-- STEP 9: Verification query
-- =============================================

-- Test the foreign key relationships
SELECT
    'Database setup completato!' as status,
    COUNT(p.*) as total_products,
    COUNT(pc.*) as total_categories,
    COUNT(cp.*) as total_conservation_points
FROM products p
LEFT JOIN product_categories pc ON p.category_id = pc.id
LEFT JOIN conservation_points cp ON p.conservation_point_id = cp.id;

-- Show the relationships are working
SELECT
    p.name as product_name,
    pc.name as category_name,
    d.name as department_name,
    cp.name as conservation_point_name
FROM products p
LEFT JOIN product_categories pc ON p.category_id = pc.id
LEFT JOIN departments d ON p.department_id = d.id
LEFT JOIN conservation_points cp ON p.conservation_point_id = cp.id
LIMIT 5;