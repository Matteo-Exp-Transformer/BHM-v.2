-- ============================================================================
-- SIMPLIFIED RLS Policies for Clerk + Supabase Integration
-- ============================================================================
--
-- This approach disables RLS during onboarding and uses application-level
-- security with company_id filtering in queries instead of database-level RLS.
--
-- IMPORTANT: Apply this script to DISABLE RLS on all tables
-- ============================================================================

-- Disable RLS on all tables to allow onboarding to work
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE conservation_points DISABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE temperature_readings DISABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists DISABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE non_conformities DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.schemaname || '.' || r.tablename;
    END LOOP;
END$$;

-- Drop helper functions
DROP FUNCTION IF EXISTS public.get_user_company_id();
DROP FUNCTION IF EXISTS public.get_user_role();
DROP FUNCTION IF EXISTS public.is_admin_or_manager();

-- Verify all RLS is disabled
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'companies', 'user_profiles', 'departments', 'staff',
    'conservation_points', 'maintenance_tasks', 'tasks',
    'product_categories', 'products', 'temperature_readings',
    'shopping_lists', 'shopping_list_items', 'events',
    'notes', 'non_conformities'
  )
ORDER BY tablename;
