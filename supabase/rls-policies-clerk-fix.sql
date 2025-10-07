-- ============================================================================
-- RLS Policies Fix for Clerk Integration
-- ============================================================================
--
-- This script fixes the bootstrap problem where users can't create profiles
-- because RLS blocks them from reading user_profiles needed for authentication.
--
-- Apply this AFTER rls-policies-fixed.sql
-- ============================================================================

-- ============================================================================
-- Fix USER_PROFILES policies to allow bootstrap
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view profiles from their company" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON user_profiles;

-- SELECT: Allow users to view their own profile OR profiles from their company
CREATE POLICY "Users can view profiles"
ON user_profiles FOR SELECT
USING (
  -- Allow viewing own profile by clerk_user_id (no company_id needed)
  clerk_user_id = (current_setting('request.jwt.claims', true)::json->>'sub')
  OR
  -- Allow viewing profiles from same company
  (company_id IS NOT NULL AND company_id = public.get_user_company_id())
  OR
  -- Allow unauthenticated reads for initial profile lookup (bootstrap)
  (current_setting('request.jwt.claims', true) IS NULL)
);

-- UPDATE: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (clerk_user_id = (current_setting('request.jwt.claims', true)::json->>'sub'));

-- INSERT: Allow all profile creation (for onboarding)
CREATE POLICY "System can insert profiles"
ON user_profiles FOR INSERT
WITH CHECK (true);

-- ============================================================================
-- Fix STAFF policies to allow unauthenticated reads for onboarding
-- ============================================================================

DROP POLICY IF EXISTS "Users can view staff from their company" ON staff;

CREATE POLICY "Users can view staff from their company"
ON staff FOR SELECT
USING (
  -- Allow viewing staff from same company
  company_id = public.get_user_company_id()
  OR
  -- Allow unauthenticated reads for email lookup during profile creation
  (current_setting('request.jwt.claims', true) IS NULL)
);

-- ============================================================================
-- Verification Query
-- ============================================================================

SELECT
  tablename,
  policyname,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'staff')
ORDER BY tablename, cmd;
