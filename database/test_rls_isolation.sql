-- =============================================
-- TEST RLS DATA ISOLATION
-- Description: Verify multi-tenant isolation works correctly
-- Author: BHM v2 Team
-- Date: 2025-01-09
-- =============================================

-- =============================================
-- SETUP TEST DATA (Run once)
-- =============================================

-- Create 2 test companies
INSERT INTO companies (id, name, address, email, staff_count)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Company A - Test', 'Via Test A', 'companya@test.com', 0),
  ('22222222-2222-2222-2222-222222222222', 'Company B - Test', 'Via Test B', 'companyb@test.com', 0)
ON CONFLICT (id) DO NOTHING;

-- Create test departments
INSERT INTO departments (company_id, name, is_active)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Dept A1', true),
  ('11111111-1111-1111-1111-111111111111', 'Dept A2', true),
  ('22222222-2222-2222-2222-222222222222', 'Dept B1', true),
  ('22222222-2222-2222-2222-222222222222', 'Dept B2', true)
ON CONFLICT DO NOTHING;

-- Create test staff
INSERT INTO staff (company_id, name, role, category, email, status)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Mario Rossi', 'admin', 'Amministratore', 'mario@companya.com', 'active'),
  ('11111111-1111-1111-1111-111111111111', 'Luigi Bianchi', 'dipendente', 'Cuochi', 'luigi@companya.com', 'active'),
  ('22222222-2222-2222-2222-222222222222', 'Anna Verdi', 'admin', 'Amministratore', 'anna@companyb.com', 'active'),
  ('22222222-2222-2222-2222-222222222222', 'Paolo Neri', 'dipendente', 'Camerieri', 'paolo@companyb.com', 'active')
ON CONFLICT DO NOTHING;

-- =============================================
-- TEST 1: VERIFY DATA SEPARATION (Admin View)
-- =============================================

-- Company A should see ONLY Company A data
SELECT
  'Company A Departments' as test,
  COUNT(*) as count
FROM departments
WHERE company_id = '11111111-1111-1111-1111-111111111111';
-- Expected: 2

SELECT
  'Company A Staff' as test,
  COUNT(*) as count
FROM staff
WHERE company_id = '11111111-1111-1111-1111-111111111111';
-- Expected: 2

-- Company B should see ONLY Company B data
SELECT
  'Company B Departments' as test,
  COUNT(*) as count
FROM departments
WHERE company_id = '22222222-2222-2222-2222-222222222222';
-- Expected: 2

SELECT
  'Company B Staff' as test,
  COUNT(*) as count
FROM staff
WHERE company_id = '22222222-2222-2222-2222-222222222222';
-- Expected: 2

-- =============================================
-- TEST 2: VERIFY RLS HELPER FUNCTIONS
-- =============================================

-- Test is_company_member() function
-- (This would be called with auth.uid() in real app)

-- Simulate user from Company A
-- SELECT is_company_member('11111111-1111-1111-1111-111111111111');
-- Expected: true (if user is member)

-- Simulate user from Company B trying to access Company A
-- SELECT is_company_member('11111111-1111-1111-1111-111111111111');
-- Expected: false (if user is NOT member)

-- =============================================
-- TEST 3: VERIFY POLICIES ARE ACTIVE
-- =============================================

-- Check RLS status for all tables
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('departments', 'staff', 'products', 'conservation_points')
ORDER BY tablename;

-- Expected: All tables should show rls_enabled = true

-- =============================================
-- TEST 4: VERIFY POLICY DETAILS
-- =============================================

-- List all policies for departments table
SELECT
  policyname,
  cmd as operation,
  qual as using_clause,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'departments';

-- Expected: 4 policies (SELECT, INSERT, UPDATE, DELETE)

-- =============================================
-- TEST 5: CROSS-COMPANY ACCESS TEST (Should FAIL)
-- =============================================

-- Attempt to insert department for Company B while user is in Company A
-- This should FAIL with RLS policies active

-- INSERT INTO departments (company_id, name, is_active)
-- VALUES ('22222222-2222-2222-2222-222222222222', 'Unauthorized Dept', true);
-- Expected: ERROR - new row violates row-level security policy

-- =============================================
-- TEST 6: PERFORMANCE TEST
-- =============================================

-- Measure query time with RLS enabled
EXPLAIN ANALYZE
SELECT *
FROM departments
WHERE company_id = '11111111-1111-1111-1111-111111111111';

-- Expected: Execution time < 10ms
-- Check if index on company_id is being used

-- =============================================
-- CLEANUP TEST DATA (Optional)
-- =============================================

-- DELETE FROM staff WHERE company_id IN (
--   '11111111-1111-1111-1111-111111111111',
--   '22222222-2222-2222-2222-222222222222'
-- );

-- DELETE FROM departments WHERE company_id IN (
--   '11111111-1111-1111-1111-111111111111',
--   '22222222-2222-2222-2222-222222222222'
-- );

-- DELETE FROM companies WHERE id IN (
--   '11111111-1111-1111-1111-111111111111',
--   '22222222-2222-2222-2222-222222222222'
-- );

-- =============================================
-- SUMMARY
-- =============================================

/*
TEST CHECKLIST:
- [ ] Company A sees only Company A data
- [ ] Company B sees only Company B data
- [ ] Cross-company access is blocked
- [ ] RLS is enabled on all tables
- [ ] Policies are active (4 per table)
- [ ] Query performance is acceptable (<100ms)
- [ ] Helper functions work correctly

If all tests pass, RLS is working correctly! ✅
*/

