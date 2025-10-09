-- =============================================
-- 🚀 SCHEMA COMPLETO PER NUOVO PROGETTO SUPABASE
-- Business HACCP Manager v2
-- Data: 2025-01-09
-- =============================================
-- 
-- IMPORTANTE: Esegui questo script in UN SOLO BLOCCO nel SQL Editor di Supabase
-- 
-- Questo script crea:
-- 1. Extension UUID
-- 2. Tabelle base (companies, departments, staff, ecc.)
-- 3. Tabelle per prodotti e inventario
-- 4. Tabelle per conservazione e temperature
-- 5. Tabelle per task e manutenzioni
-- 6. Tabelle per note, eventi, non conformità
-- 7. Shopping lists
-- 8. User profiles (temporanei con Clerk, poi migrati a Supabase Auth)
-- 
-- =============================================

-- =============================================
-- STEP 1: Enable Extensions
-- =============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- STEP 2: Create ENUM Types (Alternative: use VARCHAR with CHECK)
-- =============================================
-- Commenta questa sezione se preferisci usare VARCHAR + CHECK constraints

-- CREATE TYPE conservation_point_type AS ENUM ('ambient', 'fridge', 'freezer', 'blast');
-- CREATE TYPE conservation_status AS ENUM ('normal', 'warning', 'critical');
-- CREATE TYPE maintenance_type AS ENUM ('temperature', 'sanitization', 'defrosting');
-- CREATE TYPE maintenance_frequency AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'biannually', 'annually', 'as_needed', 'custom');
-- CREATE TYPE severity_type AS ENUM ('low', 'medium', 'high', 'critical');
-- CREATE TYPE nc_status_type AS ENUM ('open', 'in_progress', 'resolved', 'closed');
-- CREATE TYPE assignment_type AS ENUM ('role', 'staff', 'category');

-- =============================================
-- STEP 3: Create Base Tables (Companies, Departments, Staff)
-- =============================================

-- Companies table
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  staff_count INTEGER NOT NULL CHECK (staff_count > 0),
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Departments table
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Staff table
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'responsabile', 'dipendente', 'collaboratore')),
  category VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  hire_date DATE,
  status VARCHAR(20) DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'inactive', 'suspended')),
  notes TEXT,
  haccp_certification JSONB,
  department_assignments UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =============================================
-- STEP 4: Conservation & Temperature Tables
-- =============================================

-- Conservation points table
CREATE TABLE IF NOT EXISTS public.conservation_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  setpoint_temp DECIMAL(5,2) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('ambient', 'fridge', 'freezer', 'blast')),
  product_categories TEXT[] DEFAULT '{}',
  is_blast_chiller BOOLEAN DEFAULT false NOT NULL,
  status VARCHAR(20) DEFAULT 'normal' NOT NULL CHECK (status IN ('normal', 'warning', 'critical')),
  maintenance_due TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(company_id, name)
);

-- Temperature readings table
CREATE TABLE IF NOT EXISTS public.temperature_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  conservation_point_id UUID NOT NULL REFERENCES public.conservation_points(id) ON DELETE CASCADE,
  temperature DECIMAL(5,2) NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =============================================
-- STEP 5: Products & Inventory Tables
-- =============================================

-- Product categories table
CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(company_id, name)
);

-- Products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  conservation_point_id UUID REFERENCES public.conservation_points(id) ON DELETE SET NULL,
  barcode VARCHAR(255),
  sku VARCHAR(255),
  supplier_name VARCHAR(255),
  purchase_date DATE,
  expiry_date DATE,
  quantity DECIMAL(10,3),
  unit VARCHAR(50),
  allergens TEXT[] DEFAULT '{}',
  label_photo_url TEXT,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'expired', 'consumed', 'waste')),
  compliance_status VARCHAR(20) CHECK (compliance_status IN ('compliant', 'warning', 'non_compliant')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =============================================
-- STEP 6: Tasks & Maintenance Tables
-- =============================================

-- Generic tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  frequency VARCHAR(50) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'biannually', 'annually', 'annual', 'as_needed', 'custom')),
  assigned_to VARCHAR(255) NOT NULL,
  assignment_type VARCHAR(20) NOT NULL CHECK (assignment_type IN ('role', 'staff', 'category')),
  assigned_to_staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  assigned_to_role VARCHAR(50),
  assigned_to_category VARCHAR(100),
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  conservation_point_id UUID REFERENCES public.conservation_points(id) ON DELETE SET NULL,
  priority VARCHAR(20) DEFAULT 'medium' NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  estimated_duration INTEGER DEFAULT 60,
  checklist TEXT[] DEFAULT '{}',
  required_tools TEXT[] DEFAULT '{}',
  haccp_category VARCHAR(100),
  documentation_url TEXT,
  validation_notes TEXT,
  next_due TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Maintenance tasks table
CREATE TABLE IF NOT EXISTS public.maintenance_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  conservation_point_id UUID NOT NULL REFERENCES public.conservation_points(id) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  type VARCHAR(50) NOT NULL CHECK (type IN ('temperature', 'sanitization', 'defrosting')),
  frequency VARCHAR(50) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'biannually', 'annually', 'as_needed', 'custom')),
  assigned_to VARCHAR(255) NOT NULL,
  assignment_type VARCHAR(20) NOT NULL CHECK (assignment_type IN ('role', 'staff', 'category')),
  assigned_to_staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  assigned_to_role VARCHAR(50),
  assigned_to_category VARCHAR(100),
  priority VARCHAR(20) DEFAULT 'medium' NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(20) DEFAULT 'scheduled' NOT NULL CHECK (status IN ('scheduled', 'in_progress', 'completed', 'overdue', 'skipped')),
  next_due TIMESTAMPTZ,
  estimated_duration INTEGER DEFAULT 60,
  instructions TEXT[] DEFAULT '{}',
  checklist TEXT[] DEFAULT '{}',
  required_tools TEXT[] DEFAULT '{}',
  safety_notes TEXT[] DEFAULT '{}',
  completion_notes TEXT,
  completed_by UUID,
  completed_at TIMESTAMPTZ,
  last_completed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =============================================
-- STEP 7: Events, Notes, Non-Conformities
-- =============================================

-- Events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Notes table
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Non-conformities table
CREATE TABLE IF NOT EXISTS public.non_conformities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(20) DEFAULT 'open' NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =============================================
-- STEP 8: Shopping Lists
-- =============================================

-- Shopping lists table
CREATE TABLE IF NOT EXISTS public.shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID, -- Verrà linkato a user_profiles o auth.users dopo
  is_template BOOLEAN DEFAULT false NOT NULL,
  is_completed BOOLEAN DEFAULT false NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CHECK (
    (is_completed = true AND completed_at IS NOT NULL) OR
    (is_completed = false AND completed_at IS NULL)
  )
);

-- Shopping list items table
CREATE TABLE IF NOT EXISTS public.shopping_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopping_list_id UUID NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  category_name VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,3) NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit VARCHAR(50),
  notes TEXT,
  is_completed BOOLEAN DEFAULT false NOT NULL,
  added_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CHECK (
    (is_completed = true AND completed_at IS NOT NULL) OR
    (is_completed = false AND completed_at IS NULL)
  )
);

-- =============================================
-- STEP 9: User Profiles (Temporaneo con Clerk)
-- =============================================
-- NOTA: Questa tabella sarà migrata a Supabase Auth nelle fasi successive
-- Per ora mantiene clerk_user_id per compatibilità

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR(255) UNIQUE, -- Temporaneo, diventerà auth_user_id
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  role VARCHAR(50) DEFAULT 'guest' NOT NULL CHECK (role IN ('admin', 'responsabile', 'dipendente', 'collaboratore', 'guest')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =============================================
-- STEP 10: Create Indexes for Performance
-- =============================================

-- Companies indexes
CREATE INDEX IF NOT EXISTS idx_companies_email ON public.companies(email);

-- Departments indexes
CREATE INDEX IF NOT EXISTS idx_departments_company_id ON public.departments(company_id);
CREATE INDEX IF NOT EXISTS idx_departments_active ON public.departments(company_id, is_active);

-- Staff indexes
CREATE INDEX IF NOT EXISTS idx_staff_company_id ON public.staff(company_id);
CREATE INDEX IF NOT EXISTS idx_staff_email ON public.staff(email);
CREATE INDEX IF NOT EXISTS idx_staff_role ON public.staff(company_id, role);
CREATE INDEX IF NOT EXISTS idx_staff_status ON public.staff(company_id, status);

-- Conservation points indexes
CREATE INDEX IF NOT EXISTS idx_conservation_points_company_id ON public.conservation_points(company_id);
CREATE INDEX IF NOT EXISTS idx_conservation_points_department_id ON public.conservation_points(department_id);
CREATE INDEX IF NOT EXISTS idx_conservation_points_status ON public.conservation_points(company_id, status);

-- Temperature readings indexes
CREATE INDEX IF NOT EXISTS idx_temperature_readings_company_id ON public.temperature_readings(company_id);
CREATE INDEX IF NOT EXISTS idx_temperature_readings_point_id ON public.temperature_readings(conservation_point_id);
CREATE INDEX IF NOT EXISTS idx_temperature_readings_recorded_at ON public.temperature_readings(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_temperature_readings_lookup ON public.temperature_readings(conservation_point_id, recorded_at DESC);

-- Product categories indexes
CREATE INDEX IF NOT EXISTS idx_product_categories_company_id ON public.product_categories(company_id);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_company_id ON public.products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_department_id ON public.products(department_id);
CREATE INDEX IF NOT EXISTS idx_products_conservation_point_id ON public.products(conservation_point_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(company_id, status);
CREATE INDEX IF NOT EXISTS idx_products_expiry_date ON public.products(expiry_date);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(barcode);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_company_id ON public.tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_tasks_department_id ON public.tasks(department_id);
CREATE INDEX IF NOT EXISTS idx_tasks_conservation_point_id ON public.tasks(conservation_point_id);
CREATE INDEX IF NOT EXISTS idx_tasks_staff_id ON public.tasks(assigned_to_staff_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(company_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_next_due ON public.tasks(next_due);

-- Maintenance tasks indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_company_id ON public.maintenance_tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_point_id ON public.maintenance_tasks(conservation_point_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_staff_id ON public.maintenance_tasks(assigned_to_staff_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_status ON public.maintenance_tasks(company_id, status);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_next_due ON public.maintenance_tasks(next_due);

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_company_id ON public.events(company_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date DESC);

-- Notes indexes
CREATE INDEX IF NOT EXISTS idx_notes_company_id ON public.notes(company_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.notes(created_at DESC);

-- Non-conformities indexes
CREATE INDEX IF NOT EXISTS idx_non_conformities_company_id ON public.non_conformities(company_id);
CREATE INDEX IF NOT EXISTS idx_non_conformities_severity ON public.non_conformities(company_id, severity);
CREATE INDEX IF NOT EXISTS idx_non_conformities_status ON public.non_conformities(company_id, status);

-- Shopping lists indexes
CREATE INDEX IF NOT EXISTS idx_shopping_lists_company_id ON public.shopping_lists(company_id);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_created_by ON public.shopping_lists(created_by);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_is_template ON public.shopping_lists(is_template);

-- Shopping list items indexes
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_list_id ON public.shopping_list_items(shopping_list_id);
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_product_id ON public.shopping_list_items(product_id);

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_clerk_user_id ON public.user_profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_company_id ON public.user_profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_staff_id ON public.user_profiles(staff_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

-- =============================================
-- STEP 11: Create updated_at Trigger Function
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conservation_points_updated_at BEFORE UPDATE ON public.conservation_points FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON public.product_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_tasks_updated_at BEFORE UPDATE ON public.maintenance_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_non_conformities_updated_at BEFORE UPDATE ON public.non_conformities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shopping_lists_updated_at BEFORE UPDATE ON public.shopping_lists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shopping_list_items_updated_at BEFORE UPDATE ON public.shopping_list_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- STEP 12: Verification Query
-- =============================================

SELECT 
  'Schema base creato con successo!' as status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as total_tables,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public') as total_columns;

-- Lista tutte le tabelle create
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- =============================================
-- FINE SCHEMA BASE
-- =============================================
-- 
-- ✅ PROSSIMI PASSI:
-- 1. Esegui questo script nel SQL Editor di Supabase
-- 2. Verifica che tutte le tabelle siano state create
-- 3. Procedi con lo script di Claude per creare le tabelle AUTH
-- 
-- =============================================

