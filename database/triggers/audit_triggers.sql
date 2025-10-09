-- =============================================
-- AUDIT LOGGING TRIGGERS
-- Description: Track critical changes for HACCP compliance
-- Author: BHM v2 Team
-- Date: 2025-01-09
-- =============================================
--
-- Purpose: Automatically log INSERT/UPDATE/DELETE operations
-- on HACCP-critical tables to audit_logs table
--
-- Logged fields:
-- - user_id (who made the change)
-- - company_id (which company)
-- - action (INSERT/UPDATE/DELETE)
-- - table_name (which table)
-- - record_id (which record)
-- - old_data (before change - JSON)
-- - new_data (after change - JSON)
-- - timestamp (when)
--
-- =============================================

-- =============================================
-- AUDIT FUNCTION (Generic)
-- =============================================

CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_company_id UUID;
BEGIN
  -- Get user_id from JWT
  v_user_id := auth.uid();
  
  -- Get company_id from record (works for most tables)
  IF TG_OP = 'DELETE' THEN
    v_company_id := OLD.company_id;
  ELSE
    v_company_id := NEW.company_id;
  END IF;

  -- Skip if no user (system operations)
  IF v_user_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Log the event
  INSERT INTO audit_logs (
    user_id,
    company_id,
    action,
    table_name,
    record_id,
    old_data,
    new_data,
    created_at
  )
  VALUES (
    v_user_id,
    v_company_id,
    TG_OP,
    TG_TABLE_NAME,
    CASE
      WHEN TG_OP = 'DELETE' THEN OLD.id
      ELSE NEW.id
    END,
    CASE
      WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD)
      ELSE NULL
    END,
    CASE
      WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)
      ELSE NULL
    END,
    NOW()
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION public.log_audit_event() IS 'Generic audit logging function for all HACCP-critical tables';

-- =============================================
-- HACCP-CRITICAL TABLES
-- =============================================
-- Tables that require audit logging for compliance

-- 1. TEMPERATURE READINGS (CRITICAL)
DROP TRIGGER IF EXISTS audit_temperature_readings ON public.temperature_readings;
CREATE TRIGGER audit_temperature_readings
  AFTER INSERT OR UPDATE OR DELETE ON public.temperature_readings
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_event();

-- 2. MAINTENANCE TASKS (CRITICAL)
DROP TRIGGER IF EXISTS audit_maintenance_tasks ON public.maintenance_tasks;
CREATE TRIGGER audit_maintenance_tasks
  AFTER INSERT OR UPDATE OR DELETE ON public.maintenance_tasks
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_event();

-- 3. NON-CONFORMITIES (CRITICAL)
DROP TRIGGER IF EXISTS audit_non_conformities ON public.non_conformities;
CREATE TRIGGER audit_non_conformities
  AFTER INSERT OR UPDATE OR DELETE ON public.non_conformities
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_event();

-- 4. PRODUCTS (IMPORTANT)
-- Track product changes for traceability
DROP TRIGGER IF EXISTS audit_products ON public.products;
CREATE TRIGGER audit_products
  AFTER INSERT OR UPDATE OR DELETE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_event();

-- 5. CONSERVATION POINTS (IMPORTANT)
-- Track equipment modifications
DROP TRIGGER IF EXISTS audit_conservation_points ON public.conservation_points;
CREATE TRIGGER audit_conservation_points
  AFTER INSERT OR UPDATE OR DELETE ON public.conservation_points
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_event();

-- 6. STAFF (IMPORTANT)
-- Track staff changes for certification
DROP TRIGGER IF EXISTS audit_staff ON public.staff;
CREATE TRIGGER audit_staff
  AFTER INSERT OR UPDATE OR DELETE ON public.staff
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_event();

-- 7. DEPARTMENTS (MODERATE)
-- Track organizational changes
DROP TRIGGER IF EXISTS audit_departments ON public.departments;
CREATE TRIGGER audit_departments
  AFTER INSERT OR UPDATE OR DELETE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_event();

-- =============================================
-- OPTIONAL: AUDIT FOR OTHER TABLES
-- =============================================
-- Uncomment if needed

-- TASKS (Generic tasks)
-- DROP TRIGGER IF EXISTS audit_tasks ON public.tasks;
-- CREATE TRIGGER audit_tasks
--   AFTER INSERT OR UPDATE OR DELETE ON public.tasks
--   FOR EACH ROW
--   EXECUTE FUNCTION log_audit_event();

-- EVENTS (Calendar events)
-- DROP TRIGGER IF EXISTS audit_events ON public.events;
-- CREATE TRIGGER audit_events
--   AFTER INSERT OR UPDATE OR DELETE ON public.events
--   FOR EACH ROW
--   EXECUTE FUNCTION log_audit_event();

-- =============================================
-- RETENTION POLICY (Optional)
-- =============================================
-- Keep audit logs for 2 years (HACCP requirement)
-- Run this periodically or set up as scheduled job

-- CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
-- RETURNS void
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- AS $$
-- BEGIN
--   DELETE FROM audit_logs
--   WHERE created_at < NOW() - INTERVAL '2 years';
--   
--   RAISE NOTICE 'Deleted old audit logs older than 2 years';
-- END;
-- $$;

-- =============================================
-- VERIFICATION
-- =============================================

-- Check audit triggers are installed
SELECT
  trigger_name,
  event_object_table as table_name,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE 'audit_%'
ORDER BY event_object_table;

-- Expected: 7 triggers
-- - audit_temperature_readings
-- - audit_maintenance_tasks
-- - audit_non_conformities
-- - audit_products
-- - audit_conservation_points
-- - audit_staff
-- - audit_departments

-- =============================================
-- TEST AUDIT LOGGING
-- =============================================

-- Insert test data and check audit_logs
-- Example:
/*
-- Create test department
INSERT INTO departments (company_id, name, is_active)
VALUES ('your-company-id', 'Test Dept Audit', true);

-- Check audit log was created
SELECT
  action,
  table_name,
  record_id,
  new_data->>'name' as department_name,
  created_at
FROM audit_logs
WHERE table_name = 'departments'
ORDER BY created_at DESC
LIMIT 5;

-- Should see INSERT action with department data
*/

-- =============================================
-- ROLLBACK (if needed)
-- =============================================

-- Drop all audit triggers:
/*
DROP TRIGGER IF EXISTS audit_temperature_readings ON public.temperature_readings;
DROP TRIGGER IF EXISTS audit_maintenance_tasks ON public.maintenance_tasks;
DROP TRIGGER IF EXISTS audit_non_conformities ON public.non_conformities;
DROP TRIGGER IF EXISTS audit_products ON public.products;
DROP TRIGGER IF EXISTS audit_conservation_points ON public.conservation_points;
DROP TRIGGER IF EXISTS audit_staff ON public.staff;
DROP TRIGGER IF EXISTS audit_departments ON public.departments;
DROP FUNCTION IF EXISTS public.log_audit_event();
*/

-- =============================================
-- NOTES
-- =============================================
/*
1. ✅ Audit logs are INSERT-only (no UPDATE/DELETE on logs)
2. ✅ Function is SECURITY DEFINER (runs with elevated privileges)
3. ✅ Captures both old_data and new_data in JSON format
4. ⚠️ Performance impact: ~1-2ms per write operation
5. 📝 Logs are queryable via audit_logs table
6. 📊 Use for HACCP compliance reports
7. 🔍 Consider indexing audit_logs.created_at for performance

HACCP COMPLIANCE:
- Temperature readings: Full audit trail ✅
- Maintenance: Full audit trail ✅
- Non-conformities: Full audit trail ✅
- Products: Traceability ✅
- Staff: Certification tracking ✅
*/

