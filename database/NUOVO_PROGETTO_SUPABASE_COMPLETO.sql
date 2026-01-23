-- =============================================
-- SCHEMA COMPLETO BHM v.2 - NUOVO PROGETTO SUPABASE
-- Description: Schema completo con tutte le 22 tabelle dell'applicazione
-- Author: Agente 2 - Database Recovery
-- Date: 2025-01-27
-- Version: 1.7.0 (basato su SCHEMA_ATTUALE.md)
-- =============================================

-- IMPORTANTE: Esegui questo script nel SQL Editor di Supabase
-- Questo script crea TUTTE le tabelle necessarie per l'applicazione BHM v.2

-- =============================================
-- STEP 1: CORE TABLES - Gestione Aziende
-- =============================================

-- Companies (tabella principale multi-tenant)
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  address TEXT NOT NULL,
  staff_count INTEGER NOT NULL CHECK (staff_count >= 0),
  email VARCHAR NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Departments (reparti/aree operative)
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Staff (dipendenti e collaboratori)
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  role VARCHAR NOT NULL CHECK (role IN ('admin', 'responsabile', 'dipendente', 'collaboratore')),
  category VARCHAR NOT NULL,
  email VARCHAR,
  phone VARCHAR,
  hire_date DATE,
  status VARCHAR NOT NULL CHECK (status IN ('active', 'inactive', 'suspended')) DEFAULT 'active',
  notes TEXT,
  haccp_certification JSONB,
  department_assignments UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- STEP 2: AUTH TABLES - Autenticazione Supabase
-- =============================================

-- Company Members (associazione utenti ↔ aziende)
CREATE TABLE IF NOT EXISTS public.company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  role VARCHAR NOT NULL CHECK (role IN ('admin', 'responsabile', 'dipendente', 'collaboratore')),
  staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, company_id)
);

-- User Sessions (sessioni utente con azienda attiva)
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  active_company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  last_activity TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_end TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Invite Tokens (token per invitare nuovi membri)
CREATE TABLE IF NOT EXISTS public.invite_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR UNIQUE NOT NULL,
  email VARCHAR NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  role VARCHAR NOT NULL CHECK (role IN ('admin', 'responsabile', 'dipendente', 'collaboratore')),
  staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ CHECK (used_at IS NULL OR used_at <= now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (expires_at > created_at)
);

-- Audit Logs (log di audit per compliance HACCP)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  table_name VARCHAR NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'COMPLETE', 'APPROVE', 'REJECT')),
  old_data JSONB,
  new_data JSONB,
  user_role VARCHAR,
  user_email VARCHAR,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User Activity Logs (log attività utenti per analytics)
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.user_sessions(id) ON DELETE SET NULL,
  activity_type VARCHAR NOT NULL CHECK (activity_type IN (
    'session_start', 'session_end', 'task_completed', 'product_added', 'product_updated', 
    'product_deleted', 'shopping_list_created', 'shopping_list_updated', 'shopping_list_completed',
    'department_created', 'staff_added', 'conservation_point_created', 'maintenance_task_created',
    'temperature_reading_added', 'note_created', 'non_conformity_reported', 'page_view', 'export_data'
  )),
  activity_data JSONB DEFAULT '{}',
  entity_type VARCHAR CHECK (entity_type IN (
    'maintenance_task', 'generic_task', 'product', 'shopping_list', 'department', 'staff',
    'conservation_point', 'temperature_reading', 'note', 'non_conformity'
  )),
  entity_id UUID,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User Profiles (DEPRECATO - mantenuto per compatibilità)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR UNIQUE,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  email VARCHAR NOT NULL,
  first_name VARCHAR,
  last_name VARCHAR,
  staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  role VARCHAR NOT NULL CHECK (role IN ('admin', 'responsabile', 'dipendente', 'collaboratore', 'guest')) DEFAULT 'guest',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- STEP 3: INVENTORY TABLES - Gestione Prodotti
-- =============================================

-- Product Categories (categorie prodotti alimentari)
CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Products (prodotti in inventario)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  conservation_point_id UUID REFERENCES public.conservation_points(id) ON DELETE SET NULL,
  barcode VARCHAR,
  sku VARCHAR,
  supplier_name VARCHAR,
  purchase_date DATE,
  expiry_date DATE,
  quantity NUMERIC,
  unit VARCHAR,
  allergens TEXT[] DEFAULT '{}',
  label_photo_url TEXT,
  notes TEXT,
  status VARCHAR NOT NULL CHECK (status IN ('active', 'expired', 'consumed', 'waste')) DEFAULT 'active',
  compliance_status VARCHAR CHECK (compliance_status IN ('compliant', 'warning', 'non_compliant')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- STEP 4: CONSERVATION TABLES - Gestione Conservazione
-- =============================================

-- Conservation Points (punti di conservazione)
CREATE TABLE IF NOT EXISTS public.conservation_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  name VARCHAR NOT NULL,
  setpoint_temp NUMERIC NOT NULL,
  type VARCHAR NOT NULL CHECK (type IN ('ambient', 'fridge', 'freezer', 'blast')),
  product_categories TEXT[] DEFAULT '{}',
  is_blast_chiller BOOLEAN NOT NULL DEFAULT false,
  status VARCHAR NOT NULL CHECK (status IN ('normal', 'warning', 'critical')) DEFAULT 'normal',
  maintenance_due TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, name)
);

-- Temperature Readings (rilevazioni temperatura)
CREATE TABLE IF NOT EXISTS public.temperature_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  conservation_point_id UUID NOT NULL REFERENCES public.conservation_points(id) ON DELETE CASCADE,
  temperature NUMERIC NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- STEP 5: TASKS TABLES - Gestione Attività
-- =============================================

-- Tasks (attività generiche ricorrenti)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  description TEXT,
  frequency VARCHAR NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'biannually', 'annually', 'annual', 'as_needed', 'custom')),
  assigned_to VARCHAR NOT NULL,
  assignment_type VARCHAR NOT NULL CHECK (assignment_type IN ('role', 'staff', 'category')),
  assigned_to_staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  assigned_to_role VARCHAR,
  assigned_to_category VARCHAR,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  conservation_point_id UUID REFERENCES public.conservation_points(id) ON DELETE SET NULL,
  priority VARCHAR NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  estimated_duration INTEGER DEFAULT 60,
  checklist TEXT[] DEFAULT '{}',
  required_tools TEXT[] DEFAULT '{}',
  haccp_category VARCHAR,
  documentation_url TEXT,
  validation_notes TEXT,
  next_due TIMESTAMPTZ,
  status VARCHAR NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Task Completions (storico completamenti task)
CREATE TABLE IF NOT EXISTS public.task_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  completed_by_name TEXT,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Maintenance Tasks (task di manutenzione)
CREATE TABLE IF NOT EXISTS public.maintenance_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  conservation_point_id UUID NOT NULL REFERENCES public.conservation_points(id) ON DELETE CASCADE,
  title VARCHAR,
  description TEXT,
  type VARCHAR NOT NULL CHECK (type IN ('temperature', 'sanitization', 'defrosting')),
  frequency VARCHAR NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'biannually', 'annually', 'as_needed', 'custom')),
  assigned_to VARCHAR NOT NULL,
  assignment_type VARCHAR NOT NULL CHECK (assignment_type IN ('role', 'staff', 'category')),
  assigned_to_staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  assigned_to_role VARCHAR,
  assigned_to_category VARCHAR,
  priority VARCHAR NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  status VARCHAR NOT NULL CHECK (status IN ('scheduled', 'in_progress', 'completed', 'overdue', 'skipped')) DEFAULT 'scheduled',
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- STEP 6: HACCP TABLES - Compliance
-- =============================================

-- Events (eventi e scadenze)
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notes (note e annotazioni)
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Non Conformities (non conformità riscontrate)
CREATE TABLE IF NOT EXISTS public.non_conformities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- STEP 7: SHOPPING TABLES - Liste Spesa
-- =============================================

-- Shopping Lists (liste della spesa)
CREATE TABLE IF NOT EXISTS public.shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_template BOOLEAN NOT NULL DEFAULT false,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  status VARCHAR CHECK (status IN ('draft', 'sent', 'completed', 'cancelled')) DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shopping List Items (elementi nelle liste spesa)
CREATE TABLE IF NOT EXISTS public.shopping_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopping_list_id UUID NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name VARCHAR NOT NULL,
  category_name VARCHAR NOT NULL,
  quantity NUMERIC NOT NULL CHECK (quantity > 0) DEFAULT 1,
  unit VARCHAR,
  notes TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  is_checked BOOLEAN NOT NULL DEFAULT false,
  checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- STEP 8: INDICES - Indici per Performance
-- =============================================

-- Companies indices
CREATE INDEX IF NOT EXISTS idx_companies_name ON public.companies(name);

-- Departments indices
CREATE INDEX IF NOT EXISTS idx_departments_company_id ON public.departments(company_id);
CREATE INDEX IF NOT EXISTS idx_departments_active ON public.departments(company_id, is_active);

-- Staff indices
CREATE INDEX IF NOT EXISTS idx_staff_company_id ON public.staff(company_id);
CREATE INDEX IF NOT EXISTS idx_staff_email ON public.staff(email);
CREATE INDEX IF NOT EXISTS idx_staff_role ON public.staff(company_id, role);
CREATE INDEX IF NOT EXISTS idx_staff_status ON public.staff(company_id, status);

-- Company Members indices
CREATE INDEX IF NOT EXISTS idx_company_members_user_id ON public.company_members(user_id);
CREATE INDEX IF NOT EXISTS idx_company_members_company_id ON public.company_members(company_id);
CREATE INDEX IF NOT EXISTS idx_company_members_active ON public.company_members(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_company_members_lookup ON public.company_members(user_id, company_id, is_active);

-- User Sessions indices
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_company_id ON public.user_sessions(active_company_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions(user_id, active_company_id);

-- Invite Tokens indices
CREATE INDEX IF NOT EXISTS idx_invite_tokens_token ON public.invite_tokens(token);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_email ON public.invite_tokens(email);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_company ON public.invite_tokens(company_id);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_expired ON public.invite_tokens(expires_at) WHERE used_at IS NULL;

-- Audit Logs indices
CREATE INDEX IF NOT EXISTS idx_audit_logs_company_id ON public.audit_logs(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_haccp ON public.audit_logs(company_id, table_name, action, created_at DESC);

-- User Activity Logs indices
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON public.user_activity_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_company_id ON public.user_activity_logs(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_session_id ON public.user_activity_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_activity_type ON public.user_activity_logs(company_id, activity_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_entity ON public.user_activity_logs(entity_type, entity_id);

-- Product Categories indices
CREATE INDEX IF NOT EXISTS idx_product_categories_company_id ON public.product_categories(company_id);

-- Products indices
CREATE INDEX IF NOT EXISTS idx_products_company_id ON public.products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_department_id ON public.products(department_id);
CREATE INDEX IF NOT EXISTS idx_products_conservation_point_id ON public.products(conservation_point_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(company_id, status);
CREATE INDEX IF NOT EXISTS idx_products_expiry_date ON public.products(expiry_date);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(barcode);

-- Conservation Points indices
CREATE INDEX IF NOT EXISTS idx_conservation_points_company_id ON public.conservation_points(company_id);
CREATE INDEX IF NOT EXISTS idx_conservation_points_department_id ON public.conservation_points(department_id);
CREATE INDEX IF NOT EXISTS idx_conservation_points_status ON public.conservation_points(company_id, status);

-- Temperature Readings indices
CREATE INDEX IF NOT EXISTS idx_temperature_readings_company_id ON public.temperature_readings(company_id);
CREATE INDEX IF NOT EXISTS idx_temperature_readings_point_id ON public.temperature_readings(conservation_point_id);
CREATE INDEX IF NOT EXISTS idx_temperature_readings_recorded_at ON public.temperature_readings(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_temperature_readings_lookup ON public.temperature_readings(conservation_point_id, recorded_at DESC);

-- Tasks indices
CREATE INDEX IF NOT EXISTS idx_tasks_company_id ON public.tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_tasks_department_id ON public.tasks(department_id);
CREATE INDEX IF NOT EXISTS idx_tasks_conservation_point_id ON public.tasks(conservation_point_id);
CREATE INDEX IF NOT EXISTS idx_tasks_staff_id ON public.tasks(assigned_to_staff_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(company_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_next_due ON public.tasks(next_due);

-- Task Completions indices
CREATE INDEX IF NOT EXISTS idx_task_completions_company_id ON public.task_completions(company_id);
CREATE INDEX IF NOT EXISTS idx_task_completions_task_id ON public.task_completions(task_id);
CREATE INDEX IF NOT EXISTS idx_task_completions_completed_by ON public.task_completions(completed_by);
CREATE INDEX IF NOT EXISTS idx_task_completions_completed_at ON public.task_completions(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_completions_period ON public.task_completions(task_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_task_completions_lookup ON public.task_completions(company_id, task_id, completed_at DESC);

-- Maintenance Tasks indices
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_company_id ON public.maintenance_tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_point_id ON public.maintenance_tasks(conservation_point_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_staff_id ON public.maintenance_tasks(assigned_to_staff_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_status ON public.maintenance_tasks(company_id, status);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_next_due ON public.maintenance_tasks(next_due);

-- Events indices
CREATE INDEX IF NOT EXISTS idx_events_company_id ON public.events(company_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date DESC);

-- Notes indices
CREATE INDEX IF NOT EXISTS idx_notes_company_id ON public.notes(company_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.notes(created_at DESC);

-- Non Conformities indices
CREATE INDEX IF NOT EXISTS idx_non_conformities_company_id ON public.non_conformities(company_id);
CREATE INDEX IF NOT EXISTS idx_non_conformities_severity ON public.non_conformities(company_id, severity);
CREATE INDEX IF NOT EXISTS idx_non_conformities_status ON public.non_conformities(company_id, status);

-- Shopping Lists indices
CREATE INDEX IF NOT EXISTS idx_shopping_lists_company_id ON public.shopping_lists(company_id);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_created_by ON public.shopping_lists(created_by);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_is_template ON public.shopping_lists(is_template);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_status ON public.shopping_lists(company_id, status);

-- Shopping List Items indices
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_list_id ON public.shopping_list_items(shopping_list_id);
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_product_id ON public.shopping_list_items(product_id);
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_checked ON public.shopping_list_items(shopping_list_id, is_checked);

-- =============================================
-- STEP 9: TRIGGERS - Auto-update timestamps
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at
DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_departments_updated_at ON public.departments;
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_staff_updated_at ON public.staff;
CREATE TRIGGER update_staff_updated_at
  BEFORE UPDATE ON public.staff
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_company_members_updated_at ON public.company_members;
CREATE TRIGGER update_company_members_updated_at
  BEFORE UPDATE ON public.company_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_sessions_updated_at ON public.user_sessions;
CREATE TRIGGER update_user_sessions_updated_at
  BEFORE UPDATE ON public.user_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_categories_updated_at ON public.product_categories;
CREATE TRIGGER update_product_categories_updated_at
  BEFORE UPDATE ON public.product_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_conservation_points_updated_at ON public.conservation_points;
CREATE TRIGGER update_conservation_points_updated_at
  BEFORE UPDATE ON public.conservation_points
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_task_completions_updated_at ON public.task_completions;
CREATE TRIGGER update_task_completions_updated_at
  BEFORE UPDATE ON public.task_completions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_maintenance_tasks_updated_at ON public.maintenance_tasks;
CREATE TRIGGER update_maintenance_tasks_updated_at
  BEFORE UPDATE ON public.maintenance_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notes_updated_at ON public.notes;
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_non_conformities_updated_at ON public.non_conformities;
CREATE TRIGGER update_non_conformities_updated_at
  BEFORE UPDATE ON public.non_conformities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shopping_lists_updated_at ON public.shopping_lists;
CREATE TRIGGER update_shopping_lists_updated_at
  BEFORE UPDATE ON public.shopping_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shopping_list_items_updated_at ON public.shopping_list_items;
CREATE TRIGGER update_shopping_list_items_updated_at
  BEFORE UPDATE ON public.shopping_list_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- STEP 10: VERIFICATION QUERIES
-- =============================================

-- Count total tables created
SELECT 
  COUNT(*) as total_tables,
  'Schema base creato con successo!' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'companies', 'departments', 'staff', 'company_members', 'user_sessions',
    'invite_tokens', 'audit_logs', 'user_activity_logs', 'user_profiles',
    'product_categories', 'products', 'conservation_points', 'temperature_readings',
    'tasks', 'task_completions', 'maintenance_tasks', 'events', 'notes',
    'non_conformities', 'shopping_lists', 'shopping_list_items'
  );

-- List all created tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- =============================================
-- SCHEMA COMPLETO CREATO!
-- =============================================

-- Prossimi step:
-- 1. Applicare migration CSRF: supabase/migrations/20250127000001_csrf_tokens.sql
-- 2. Creare primo utente admin e azienda di test
-- 3. Testare query originali dell'applicazione
-- 4. Verificare funzionamento completo

SELECT 'Schema completo BHM v.2 creato con successo! 22 tabelle + indici + trigger.' as final_status;




