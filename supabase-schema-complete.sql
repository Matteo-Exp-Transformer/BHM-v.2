-- =============================================
-- HACCP Business Manager - Complete Database Schema
-- Execute these SQL statements in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Step 1: Create Core Tables
-- =============================================

-- Companies table (multi-tenant support)
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  staff_count INTEGER DEFAULT 0,
  email VARCHAR(255),
  phone VARCHAR(50),
  vat_number VARCHAR(50),
  business_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User profiles table (Clerk integration)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  full_name VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'guest',
  staff_id UUID,
  last_sign_in_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Staff table
CREATE TABLE IF NOT EXISTS staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'dipendente',
  category VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  hire_date DATE,
  status VARCHAR(20) DEFAULT 'active',
  notes TEXT,
  haccp_certification JSONB,
  department_assignments TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT staff_role_check CHECK (role IN ('admin', 'responsabile', 'dipendente', 'collaboratore')),
  CONSTRAINT staff_status_check CHECK (status IN ('active', 'inactive', 'suspended'))
);

-- Add foreign key constraint for staff_id in user_profiles after staff table is created
ALTER TABLE user_profiles
ADD CONSTRAINT fk_user_profiles_staff
FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL;

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(company_id, name)
);

-- Conservation points table
CREATE TABLE IF NOT EXISTS conservation_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  setpoint_temp DECIMAL(5,2),
  temp_min DECIMAL(5,2),
  temp_max DECIMAL(5,2),
  point_type VARCHAR(50) NOT NULL,
  is_blast_chiller BOOLEAN DEFAULT false,
  product_categories TEXT[],
  status VARCHAR(20) DEFAULT 'normal',
  last_maintenance DATE,
  next_maintenance DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT conservation_point_type_check CHECK (point_type IN ('ambient', 'fridge', 'freezer', 'blast')),
  CONSTRAINT conservation_status_check CHECK (status IN ('normal', 'warning', 'critical'))
);

-- Tasks table (for maintenance and general tasks)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  task_type VARCHAR(50) NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'pending',
  assigned_to UUID[] DEFAULT '{}',
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  conservation_point_id UUID REFERENCES conservation_points(id) ON DELETE SET NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  estimated_duration INTEGER, -- in minutes
  recurring BOOLEAN DEFAULT false,
  recurrence_pattern JSONB,
  checklist TEXT[],
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT task_type_check CHECK (task_type IN ('maintenance', 'general_task', 'temperature_reading', 'custom')),
  CONSTRAINT task_priority_check CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  CONSTRAINT task_status_check CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'overdue'))
);

-- Task completions table
CREATE TABLE IF NOT EXISTS task_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  completed_by UUID REFERENCES user_profiles(id),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completion_notes TEXT,
  completion_data JSONB DEFAULT '{}',
  completion_photos TEXT[],
  quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Product categories table
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  temperature_requirements JSONB,
  default_expiry_days INTEGER,
  allergen_info TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(company_id, name)
);

-- Products table
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

-- Temperature readings table
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

-- Non-conformities table
CREATE TABLE IF NOT EXISTS non_conformities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL,
  category VARCHAR(100),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  conservation_point_id UUID REFERENCES conservation_points(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  temperature_reading_id UUID REFERENCES temperature_readings(id) ON DELETE SET NULL,
  detected_by UUID REFERENCES user_profiles(id),
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status VARCHAR(20) DEFAULT 'open',
  corrective_actions TEXT[],
  root_cause_analysis TEXT,
  resolution_notes TEXT,
  resolved_by UUID REFERENCES user_profiles(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT nc_severity_check CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  CONSTRAINT nc_status_check CHECK (status IN ('open', 'investigating', 'resolved', 'closed'))
);

-- Notes/Communication table
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title VARCHAR(255),
  content TEXT NOT NULL,
  note_type VARCHAR(50) DEFAULT 'general',
  priority VARCHAR(20) DEFAULT 'medium',
  related_entity_type VARCHAR(50),
  related_entity_id UUID,
  is_read BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  created_by UUID REFERENCES user_profiles(id),
  assigned_to UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT note_type_check CHECK (note_type IN ('general', 'task', 'maintenance', 'temperature', 'product', 'alert')),
  CONSTRAINT note_priority_check CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
);

-- Events table (for calendar integration)
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  all_day BOOLEAN DEFAULT false,
  event_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'medium',
  assigned_to UUID[],
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  conservation_point_id UUID REFERENCES conservation_points(id) ON DELETE SET NULL,
  recurring BOOLEAN DEFAULT false,
  recurrence_pattern JSONB,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT event_type_check CHECK (event_type IN ('maintenance', 'general_task', 'temperature_reading', 'custom')),
  CONSTRAINT event_status_check CHECK (status IN ('pending', 'completed', 'overdue', 'cancelled')),
  CONSTRAINT event_priority_check CHECK (priority IN ('low', 'medium', 'high', 'critical'))
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- Step 2: Create Indexes for Performance
-- =============================================

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_clerk_user_id ON user_profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_company_id ON user_profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_staff_id ON user_profiles(staff_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Staff indexes
CREATE INDEX IF NOT EXISTS idx_staff_company_id ON staff(company_id);
CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email);
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role);
CREATE INDEX IF NOT EXISTS idx_staff_status ON staff(status);

-- Departments indexes
CREATE INDEX IF NOT EXISTS idx_departments_company_id ON departments(company_id);
CREATE INDEX IF NOT EXISTS idx_departments_active ON departments(is_active);

-- Conservation points indexes
CREATE INDEX IF NOT EXISTS idx_conservation_points_company_id ON conservation_points(company_id);
CREATE INDEX IF NOT EXISTS idx_conservation_points_department_id ON conservation_points(department_id);
CREATE INDEX IF NOT EXISTS idx_conservation_points_type ON conservation_points(point_type);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_company_id ON tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_department_id ON tasks(department_id);
CREATE INDEX IF NOT EXISTS idx_tasks_conservation_point_id ON tasks(conservation_point_id);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_company_id ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_expiry_date ON products(expiry_date);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- Temperature readings indexes
CREATE INDEX IF NOT EXISTS idx_temp_readings_company_id ON temperature_readings(company_id);
CREATE INDEX IF NOT EXISTS idx_temp_readings_conservation_point_id ON temperature_readings(conservation_point_id);
CREATE INDEX IF NOT EXISTS idx_temp_readings_recorded_at ON temperature_readings(recorded_at);

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_company_id ON events(company_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- =============================================
-- Step 3: Enable Row Level Security (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conservation_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE temperature_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE non_conformities ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Step 4: Create RLS Policies
-- =============================================

-- Helper function to get user's company_id
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM user_profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'
$$ LANGUAGE SQL SECURITY DEFINER;

-- Companies policies
CREATE POLICY "Users can view their company" ON companies FOR SELECT
  USING (id = get_user_company_id());

CREATE POLICY "Users can update their company" ON companies FOR UPDATE
  USING (id = get_user_company_id());

-- User profiles policies
CREATE POLICY "Users can view company user profiles" ON user_profiles FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT
  USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE
  USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "System can insert user profiles" ON user_profiles FOR INSERT
  WITH CHECK (true);

-- Staff policies
CREATE POLICY "Users can view company staff" ON staff FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Admin can manage staff" ON staff FOR ALL
  USING (
    company_id = get_user_company_id() AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
      AND role IN ('admin', 'responsabile')
    )
  );

-- Departments policies
CREATE POLICY "Users can view company departments" ON departments FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Admin can manage departments" ON departments FOR ALL
  USING (
    company_id = get_user_company_id() AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
      AND role IN ('admin', 'responsabile')
    )
  );

-- Conservation points policies
CREATE POLICY "Users can view company conservation points" ON conservation_points FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Admin can manage conservation points" ON conservation_points FOR ALL
  USING (
    company_id = get_user_company_id() AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
      AND role IN ('admin', 'responsabile')
    )
  );

-- Tasks policies
CREATE POLICY "Users can view company tasks" ON tasks FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Admin can manage tasks" ON tasks FOR ALL
  USING (
    company_id = get_user_company_id() AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
      AND role IN ('admin', 'responsabile')
    )
  );

-- Task completions policies
CREATE POLICY "Users can view company task completions" ON task_completions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_completions.task_id
      AND tasks.company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can complete assigned tasks" ON task_completions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_completions.task_id
      AND tasks.company_id = get_user_company_id()
    )
  );

-- Products policies
CREATE POLICY "Users can view company products" ON products FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can manage company products" ON products FOR ALL
  USING (company_id = get_user_company_id());

-- Temperature readings policies
CREATE POLICY "Users can view company temperature readings" ON temperature_readings FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can record temperatures" ON temperature_readings FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

-- Events policies
CREATE POLICY "Users can view company events" ON events FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Admin can manage events" ON events FOR ALL
  USING (
    company_id = get_user_company_id() AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
      AND role IN ('admin', 'responsabile')
    )
  );

-- Apply similar policies to other tables...
-- (Additional policies can be added as needed)

-- =============================================
-- Step 5: Insert Test Data
-- =============================================

-- Insert test company
INSERT INTO companies (id, name, address, staff_count, email) VALUES
('123e4567-e89b-12d3-a456-426614174000', 'Al Ritrovo SRL', 'Via centotrecento 1/1b Bologna 40128', 5, '000@gmail.com')
ON CONFLICT (id) DO NOTHING;

-- Insert test staff
INSERT INTO staff (id, company_id, name, role, category, email) VALUES
('223e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174000', 'Admin User', 'admin', 'Amministratore', '0cavuz0@gmail.com'),
('323e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174000', 'Matteo Cavallaro', 'responsabile', 'Banconisti', 'matteo.cavallaro@example.com'),
('423e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174000', 'Fabrizio Dettori', 'responsabile', 'Amministratore', 'fabrizio.dettori@example.com'),
('523e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174000', 'Paolo Dettori', 'admin', 'Cuochi', 'paolo.dettori@example.com'),
('623e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174000', 'Eddy TheQueen', 'dipendente', 'Banconisti', 'eddy.thequeen@example.com')
ON CONFLICT (id) DO NOTHING;

-- Insert test departments
INSERT INTO departments (id, company_id, name, description) VALUES
('d1e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174000', 'Cucina', 'Area preparazione e cottura cibi'),
('d2e4567-e89b-12d3-a456-426614174002', '123e4567-e89b-12d3-a456-426614174000', 'Bancone', 'Area servizio al banco'),
('d3e4567-e89b-12d3-a456-426614174003', '123e4567-e89b-12d3-a456-426614174000', 'Sala', 'Area servizio ai tavoli'),
('d4e4567-e89b-12d3-a456-426614174004', '123e4567-e89b-12d3-a456-426614174000', 'Magazzino', 'Area stoccaggio prodotti')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- Completion Message
-- =============================================

SELECT 'Database schema setup completed successfully!' as status;