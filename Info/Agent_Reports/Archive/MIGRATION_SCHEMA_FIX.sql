-- =====================================================
-- MIGRATION: Fix Database Schema Compatibility
-- =====================================================
-- Project: BHM v.2 - Business HACCP Manager
-- Purpose: Align database schema with TypeScript types
-- Date: 2025-01-05
-- WARNING: This migration makes structural changes to tables
-- BACKUP your database before running!
-- =====================================================

BEGIN;

-- =====================================================
-- 1. CREATE products TABLE (currently empty)
-- =====================================================
-- CRITICAL: Required for product expiry tracking in calendar

DROP TABLE IF EXISTS public.products CASCADE;

CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL,
  name character varying NOT NULL,
  category_id uuid,
  department_id uuid,
  conservation_point_id uuid,

  -- Identification
  barcode character varying,
  sku character varying,
  supplier_name character varying,

  -- Dates & Quantities
  purchase_date timestamp with time zone,
  expiry_date timestamp with time zone,
  quantity numeric,
  unit character varying,

  -- Safety & Compliance
  allergens text[] DEFAULT '{}',
  label_photo_url character varying,
  notes text,
  status character varying NOT NULL DEFAULT 'active',
  compliance_status character varying,

  -- Metadata
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),

  -- Constraints
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_company_id_fkey FOREIGN KEY (company_id)
    REFERENCES public.companies(id) ON DELETE CASCADE,
  CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id)
    REFERENCES public.product_categories(id) ON DELETE SET NULL,
  CONSTRAINT products_department_id_fkey FOREIGN KEY (department_id)
    REFERENCES public.departments(id) ON DELETE SET NULL,
  CONSTRAINT products_conservation_point_id_fkey FOREIGN KEY (conservation_point_id)
    REFERENCES public.conservation_points(id) ON DELETE SET NULL,
  CONSTRAINT products_status_check CHECK (status IN ('active', 'expired', 'consumed', 'waste')),
  CONSTRAINT products_compliance_status_check CHECK (compliance_status IN ('compliant', 'warning', 'non_compliant'))
);

-- Indexes for performance
CREATE INDEX idx_products_company_id ON public.products(company_id);
CREATE INDEX idx_products_expiry_date ON public.products(expiry_date) WHERE status = 'active';
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_category_id ON public.products(category_id);

-- =====================================================
-- 2. FIX staff TABLE - Add missing columns
-- =====================================================
-- CRITICAL: haccp_certification required for HACCP expiry tracking

ALTER TABLE public.staff
  ADD COLUMN IF NOT EXISTS phone character varying,
  ADD COLUMN IF NOT EXISTS hire_date date,
  ADD COLUMN IF NOT EXISTS status character varying DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS haccp_certification jsonb,
  ADD COLUMN IF NOT EXISTS department_assignments uuid[];

-- Add constraint for status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'staff_status_check'
  ) THEN
    ALTER TABLE public.staff
      ADD CONSTRAINT staff_status_check CHECK (status IN ('active', 'inactive', 'suspended'));
  END IF;
END $$;

-- Index for HACCP certification queries
CREATE INDEX IF NOT EXISTS idx_staff_haccp_certification
  ON public.staff(company_id) WHERE haccp_certification IS NOT NULL;

-- =====================================================
-- 3. FIX conservation_points TABLE
-- =====================================================

ALTER TABLE public.conservation_points
  ADD COLUMN IF NOT EXISTS product_categories text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_blast_chiller boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS status character varying DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS maintenance_due timestamp with time zone;

-- Add constraint for status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'conservation_points_status_check'
  ) THEN
    ALTER TABLE public.conservation_points
      ADD CONSTRAINT conservation_points_status_check CHECK (status IN ('normal', 'warning', 'critical'));
  END IF;
END $$;

-- Index for maintenance due queries
CREATE INDEX IF NOT EXISTS idx_conservation_points_maintenance_due
  ON public.conservation_points(maintenance_due) WHERE maintenance_due IS NOT NULL;

-- =====================================================
-- 4. FIX maintenance_tasks TABLE
-- =====================================================
-- CRITICAL: Rename 'kind' to 'type' and restructure assignment

-- Step 4.1: Create backup table
DROP TABLE IF EXISTS maintenance_tasks_backup;
CREATE TABLE maintenance_tasks_backup AS
SELECT * FROM public.maintenance_tasks;

-- Step 4.2: Check if 'kind' column exists, then rename to 'type'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'maintenance_tasks' AND column_name = 'kind'
  ) THEN
    ALTER TABLE public.maintenance_tasks RENAME COLUMN kind TO type;
  END IF;
END $$;

-- Step 4.3: Add new columns for structured assignment
ALTER TABLE public.maintenance_tasks
  ADD COLUMN IF NOT EXISTS assigned_to_staff_id uuid,
  ADD COLUMN IF NOT EXISTS assigned_to_role character varying,
  ADD COLUMN IF NOT EXISTS assigned_to_category character varying,
  ADD COLUMN IF NOT EXISTS title character varying,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS priority character varying DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS status character varying DEFAULT 'scheduled',
  ADD COLUMN IF NOT EXISTS next_due timestamp with time zone,
  ADD COLUMN IF NOT EXISTS estimated_duration integer DEFAULT 60,
  ADD COLUMN IF NOT EXISTS instructions text[];

-- Step 4.4: Add foreign key constraint for staff assignment
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'maintenance_tasks_staff_fkey'
  ) THEN
    ALTER TABLE public.maintenance_tasks
      ADD CONSTRAINT maintenance_tasks_staff_fkey
      FOREIGN KEY (assigned_to_staff_id) REFERENCES public.staff(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Step 4.5: Migrate existing data (if assigned_to is a valid UUID)
UPDATE public.maintenance_tasks
SET assigned_to_staff_id = CAST(assigned_to AS uuid)
WHERE assigned_to IS NOT NULL
  AND assigned_to ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Step 4.6: Add constraints
DO $$
BEGIN
  -- Check assignment constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'maintenance_tasks_assignment_check'
  ) THEN
    ALTER TABLE public.maintenance_tasks
      ADD CONSTRAINT maintenance_tasks_assignment_check
      CHECK (
        (assigned_to_staff_id IS NOT NULL) OR
        (assigned_to_role IS NOT NULL) OR
        (assigned_to_category IS NOT NULL)
      );
  END IF;

  -- Priority constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'maintenance_tasks_priority_check'
  ) THEN
    ALTER TABLE public.maintenance_tasks
      ADD CONSTRAINT maintenance_tasks_priority_check
      CHECK (priority IN ('low', 'medium', 'high', 'critical'));
  END IF;

  -- Status constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'maintenance_tasks_status_check'
  ) THEN
    ALTER TABLE public.maintenance_tasks
      ADD CONSTRAINT maintenance_tasks_status_check
      CHECK (status IN ('scheduled', 'in_progress', 'completed', 'overdue', 'skipped'));
  END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_next_due
  ON public.maintenance_tasks(next_due);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_status
  ON public.maintenance_tasks(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_company_id
  ON public.maintenance_tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_assigned_staff
  ON public.maintenance_tasks(assigned_to_staff_id) WHERE assigned_to_staff_id IS NOT NULL;

-- =====================================================
-- 5. FIX tasks TABLE
-- =====================================================

ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS department_id uuid,
  ADD COLUMN IF NOT EXISTS conservation_point_id uuid,
  ADD COLUMN IF NOT EXISTS priority character varying DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS estimated_duration integer DEFAULT 60,
  ADD COLUMN IF NOT EXISTS checklist text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS required_tools text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS haccp_category character varying,
  ADD COLUMN IF NOT EXISTS documentation_url character varying,
  ADD COLUMN IF NOT EXISTS validation_notes text,
  ADD COLUMN IF NOT EXISTS next_due timestamp with time zone,
  ADD COLUMN IF NOT EXISTS status character varying DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS assigned_to_staff_id uuid,
  ADD COLUMN IF NOT EXISTS assigned_to_role character varying,
  ADD COLUMN IF NOT EXISTS assigned_to_category character varying;

-- Add foreign key constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tasks_department_fkey'
  ) THEN
    ALTER TABLE public.tasks
      ADD CONSTRAINT tasks_department_fkey
      FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tasks_conservation_point_fkey'
  ) THEN
    ALTER TABLE public.tasks
      ADD CONSTRAINT tasks_conservation_point_fkey
      FOREIGN KEY (conservation_point_id) REFERENCES public.conservation_points(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tasks_staff_fkey'
  ) THEN
    ALTER TABLE public.tasks
      ADD CONSTRAINT tasks_staff_fkey
      FOREIGN KEY (assigned_to_staff_id) REFERENCES public.staff(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add check constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tasks_priority_check'
  ) THEN
    ALTER TABLE public.tasks
      ADD CONSTRAINT tasks_priority_check
      CHECK (priority IN ('low', 'medium', 'high', 'critical'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tasks_assignment_check'
  ) THEN
    ALTER TABLE public.tasks
      ADD CONSTRAINT tasks_assignment_check
      CHECK (
        (assigned_to_staff_id IS NOT NULL) OR
        (assigned_to_role IS NOT NULL) OR
        (assigned_to_category IS NOT NULL)
      );
  END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_next_due ON public.tasks(next_due);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_company_id ON public.tasks(company_id);

-- =====================================================
-- 6. TRIGGERS for automatic updated_at
-- =====================================================

-- Create trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist to avoid duplicates
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
DROP TRIGGER IF EXISTS update_maintenance_tasks_updated_at ON public.maintenance_tasks;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
DROP TRIGGER IF EXISTS update_staff_updated_at ON public.staff;
DROP TRIGGER IF EXISTS update_conservation_points_updated_at ON public.conservation_points;

-- Create triggers
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_tasks_updated_at
  BEFORE UPDATE ON public.maintenance_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at
  BEFORE UPDATE ON public.staff
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conservation_points_updated_at
  BEFORE UPDATE ON public.conservation_points
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. COMMENTS for documentation
-- =====================================================

COMMENT ON TABLE public.products IS 'Product inventory with expiry tracking for calendar deadlines';
COMMENT ON COLUMN public.staff.haccp_certification IS 'JSONB: {level, expiry_date, issuing_authority, certificate_number}';
COMMENT ON COLUMN public.maintenance_tasks.assigned_to_staff_id IS 'FK to staff.id - specific person assigned';
COMMENT ON COLUMN public.maintenance_tasks.assigned_to_role IS 'Role-based assignment (admin, responsabile, dipendente, collaboratore)';
COMMENT ON COLUMN public.maintenance_tasks.assigned_to_category IS 'Category-based assignment (Cuochi, Camerieri, etc.)';
COMMENT ON TABLE public.maintenance_tasks_backup IS 'Backup of maintenance_tasks before migration - safe to drop after verification';

-- =====================================================
-- COMMIT TRANSACTION
-- =====================================================

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES (Run these separately to verify)
-- =====================================================

-- Verify products table structure
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'products' ORDER BY ordinal_position;

-- Verify staff has haccp_certification
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'staff' AND column_name = 'haccp_certification';

-- Verify maintenance_tasks has 'type' column (not 'kind')
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'maintenance_tasks' AND column_name IN ('type', 'kind');

-- Check backup table exists
-- SELECT COUNT(*) as backup_count FROM maintenance_tasks_backup;

-- =====================================================
-- END OF MIGRATION
-- =====================================================
