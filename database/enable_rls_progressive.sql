-- =============================================
-- ENABLE ROW-LEVEL SECURITY (RLS) - PROGRESSIVE
-- Description: Enable RLS progressively on all tables
-- Author: BHM v2 Team
-- Date: 2025-01-09
-- =============================================
--
-- ⚠️ IMPORTANT: Execute this in PHASES
-- Test each phase before proceeding to the next
--
-- FASE 7.1: Core Auth Tables (SAFE - already have policies)
-- FASE 7.2: Management Tables (departments, staff)
-- FASE 7.3: Feature Tables (products, conservation, tasks)
-- FASE 7.4: Supporting Tables (notes, events, shopping lists)
--
-- =============================================

-- =============================================
-- FASE 7.1: CORE AUTH TABLES (Execute First)
-- =============================================
-- These are critical for auth but low-traffic
-- Safe to enable first

-- 1. company_members (CRITICAL)
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.company_members IS 'RLS ENABLED: Members can view/manage own memberships';

-- 2. user_sessions (CRITICAL)
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.user_sessions IS 'RLS ENABLED: Users can only access own sessions';

-- 3. invite_tokens (LOW TRAFFIC)
ALTER TABLE public.invite_tokens ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.invite_tokens IS 'RLS ENABLED: Only admins can manage invites';

-- 4. companies (SAFE)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.companies IS 'RLS ENABLED: Members can view their companies';

-- ✅ FASE 7.1 COMPLETE
-- Test: Login, switch company, verify data isolation
-- If OK, proceed to FASE 7.2

-- =============================================
-- FASE 7.2: MANAGEMENT TABLES (Execute Second)
-- =============================================
-- High-traffic but well-tested policies

-- 5. departments
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.departments IS 'RLS ENABLED: Company members can view, managers can edit';

-- 6. staff
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.staff IS 'RLS ENABLED: Company members can view, managers can edit';

-- ✅ FASE 7.2 COMPLETE
-- Test: Management page, CRUD operations on departments/staff
-- If OK, proceed to FASE 7.3

-- =============================================
-- FASE 7.3: FEATURE TABLES (Execute Third)
-- =============================================
-- Main application tables

-- 7. product_categories
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.product_categories IS 'RLS ENABLED: Company members can view, managers can edit';

-- 8. products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.products IS 'RLS ENABLED: Company members can view/create, managers can delete';

-- 9. conservation_points
ALTER TABLE public.conservation_points ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.conservation_points IS 'RLS ENABLED: Company members can view, managers can edit';

-- 10. temperature_readings
ALTER TABLE public.temperature_readings ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.temperature_readings IS 'RLS ENABLED: Company members can view/create';

-- 11. maintenance_tasks
ALTER TABLE public.maintenance_tasks ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.maintenance_tasks IS 'RLS ENABLED: Company members can view/create, managers can edit';

-- 12. tasks (generic)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.tasks IS 'RLS ENABLED: Company members can view/create, managers can edit';

-- 13. events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.events IS 'RLS ENABLED: Company members can view/create, managers can edit';

-- ✅ FASE 7.3 COMPLETE
-- Test: Dashboard, Conservation, Calendar pages
-- If OK, proceed to FASE 7.4

-- =============================================
-- FASE 7.4: SUPPORTING TABLES (Execute Fourth)
-- =============================================
-- Low-traffic supporting features

-- 14. notes
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.notes IS 'RLS ENABLED: Anyone can create, only creator/admin can edit';

-- 15. non_conformities
ALTER TABLE public.non_conformities ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.non_conformities IS 'RLS ENABLED: Company members can view/create, managers can edit';

-- 16. shopping_lists
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.shopping_lists IS 'RLS ENABLED: Company members can view/create, creators can edit';

-- 17. shopping_list_items
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.shopping_list_items IS 'RLS ENABLED: Linked to shopping_lists RLS';

-- 18. audit_logs (READ-ONLY for most users)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.audit_logs IS 'RLS ENABLED: Company members can view, system can insert only';

-- 19. user_profiles (DEPRECATED - but keep RLS)
-- This table is deprecated in favor of company_members
-- Keep RLS enabled for backward compatibility
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.user_profiles IS 'RLS ENABLED: DEPRECATED - use company_members instead';

-- ✅ FASE 7.4 COMPLETE
-- Test: Shopping lists, notes, audit logs
-- If OK, RLS is fully enabled!

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Check which tables have RLS enabled
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'companies', 'company_members', 'user_sessions', 'invite_tokens',
    'departments', 'staff', 'product_categories', 'products',
    'conservation_points', 'temperature_readings', 'maintenance_tasks',
    'tasks', 'events', 'notes', 'non_conformities',
    'shopping_lists', 'shopping_list_items', 'audit_logs', 'user_profiles'
  )
ORDER BY tablename;

-- Count policies per table
SELECT
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;

-- =============================================
-- ROLLBACK (if needed)
-- =============================================
-- If something goes wrong, disable RLS with:
-- ALTER TABLE public.<table_name> DISABLE ROW LEVEL SECURITY;

-- =============================================
-- NOTES
-- =============================================
-- 1. ✅ All policies are already created (from rls_policies.sql)
-- 2. ✅ Helper functions are deployed (from rls_helpers.sql)
-- 3. ⚠️ Test each phase before proceeding
-- 4. ⚠️ Monitor query performance (expect <100ms overhead)
-- 5. 📝 Document any issues in MIGRATION_TASKS.md

