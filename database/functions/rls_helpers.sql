-- =============================================
-- RLS HELPER FUNCTIONS
-- Description: Security functions for Row-Level Security policies
-- Author: Claude AI Assistant
-- Date: 2025-01-09
-- =============================================

-- These functions are called by RLS policies to determine access rights
-- SECURITY DEFINER = runs with creator privileges (bypasses RLS for internal queries)
-- STABLE = can be cached during transaction (performance optimization)

-- =============================================
-- FUNCTION 1: Get Active Company ID
-- =============================================

CREATE OR REPLACE FUNCTION get_active_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT active_company_id
  FROM user_sessions
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

COMMENT ON FUNCTION get_active_company_id() IS
'Returns the currently active company_id for the authenticated user. Used by RLS policies to filter data.';

-- =============================================
-- FUNCTION 2: Get User Role for Company
-- =============================================

CREATE OR REPLACE FUNCTION get_user_role_for_company(p_company_id uuid)
RETURNS varchar
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM company_members
  WHERE user_id = auth.uid()
    AND company_id = p_company_id
    AND is_active = true
  LIMIT 1;
$$;

COMMENT ON FUNCTION get_user_role_for_company(uuid) IS
'Returns user role for specified company. Returns NULL if not a member.';

-- =============================================
-- FUNCTION 3: Check if User is Company Member
-- =============================================

CREATE OR REPLACE FUNCTION is_company_member(p_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1
    FROM company_members
    WHERE user_id = auth.uid()
      AND company_id = p_company_id
      AND is_active = true
  );
$$;

COMMENT ON FUNCTION is_company_member(uuid) IS
'Checks if authenticated user is an active member of the specified company.';

-- =============================================
-- FUNCTION 4: Check if User has Management Role
-- =============================================

CREATE OR REPLACE FUNCTION has_management_role(p_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1
    FROM company_members
    WHERE user_id = auth.uid()
      AND company_id = p_company_id
      AND role IN ('admin', 'responsabile')
      AND is_active = true
  );
$$;

COMMENT ON FUNCTION has_management_role(uuid) IS
'Checks if user has admin or responsabile role for company. Used for write permissions.';

-- =============================================
-- FUNCTION 5: Check if User is Admin
-- =============================================

CREATE OR REPLACE FUNCTION is_admin(p_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1
    FROM company_members
    WHERE user_id = auth.uid()
      AND company_id = p_company_id
      AND role = 'admin'
      AND is_active = true
  );
$$;

COMMENT ON FUNCTION is_admin(uuid) IS
'Checks if user has admin role for company. Used for sensitive operations (export, settings).';

-- =============================================
-- FUNCTION 6: Get User Companies
-- =============================================

CREATE OR REPLACE FUNCTION get_user_companies()
RETURNS TABLE(
  company_id uuid,
  company_name varchar,
  user_role varchar,
  is_active boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    cm.company_id,
    c.name as company_name,
    cm.role as user_role,
    cm.is_active
  FROM company_members cm
  JOIN companies c ON c.id = cm.company_id
  WHERE cm.user_id = auth.uid()
    AND cm.is_active = true
  ORDER BY cm.joined_at ASC;
$$;

COMMENT ON FUNCTION get_user_companies() IS
'Returns all active companies for authenticated user. Used for company switcher UI.';

-- =============================================
-- FUNCTION 7: Auto-create User Session
-- =============================================

CREATE OR REPLACE FUNCTION ensure_user_session()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_company_id uuid;
  v_session_id uuid;
BEGIN
  -- Get authenticated user
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Check if session already exists
  SELECT active_company_id INTO v_company_id
  FROM user_sessions
  WHERE user_id = v_user_id;

  IF FOUND THEN
    -- Update last activity
    UPDATE user_sessions
    SET last_activity = now()
    WHERE user_id = v_user_id;

    RETURN v_company_id;
  END IF;

  -- Get first company of user
  SELECT company_id INTO v_company_id
  FROM company_members
  WHERE user_id = v_user_id
    AND is_active = true
  ORDER BY joined_at ASC
  LIMIT 1;

  -- Create new session
  INSERT INTO user_sessions (user_id, active_company_id)
  VALUES (v_user_id, v_company_id)
  RETURNING id INTO v_session_id;

  RETURN v_company_id;
END;
$$;

COMMENT ON FUNCTION ensure_user_session() IS
'Auto-creates user session on first login. Selects first company as active.';

-- =============================================
-- FUNCTION 8: Switch Active Company
-- =============================================

CREATE OR REPLACE FUNCTION switch_active_company(p_new_company_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_is_member boolean;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify user is member of target company
  SELECT is_company_member(p_new_company_id) INTO v_is_member;

  IF NOT v_is_member THEN
    RAISE EXCEPTION 'Not authorized for company %', p_new_company_id;
  END IF;

  -- Update session
  UPDATE user_sessions
  SET active_company_id = p_new_company_id,
      last_activity = now(),
      updated_at = now()
  WHERE user_id = v_user_id;

  IF NOT FOUND THEN
    -- Create session if doesn't exist
    INSERT INTO user_sessions (user_id, active_company_id)
    VALUES (v_user_id, p_new_company_id);
  END IF;

  RETURN true;
END;
$$;

COMMENT ON FUNCTION switch_active_company(uuid) IS
'Switches active company for user. Validates membership before switching.';

-- =============================================
-- FUNCTION 9: Check Multiple Permissions
-- =============================================

CREATE OR REPLACE FUNCTION has_permission(
  p_company_id uuid,
  p_permission varchar
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role varchar;
BEGIN
  -- Get user role
  SELECT role INTO v_role
  FROM company_members
  WHERE user_id = auth.uid()
    AND company_id = p_company_id
    AND is_active = true;

  IF v_role IS NULL THEN
    RETURN false;
  END IF;

  -- Check permission based on role
  CASE p_permission
    WHEN 'manage_staff' THEN
      RETURN v_role IN ('admin', 'responsabile');
    WHEN 'manage_departments' THEN
      RETURN v_role IN ('admin', 'responsabile');
    WHEN 'view_all_tasks' THEN
      RETURN v_role IN ('admin', 'responsabile');
    WHEN 'manage_conservation' THEN
      RETURN v_role IN ('admin', 'responsabile');
    WHEN 'export_data' THEN
      RETURN v_role = 'admin';
    WHEN 'manage_settings' THEN
      RETURN v_role = 'admin';
    ELSE
      RETURN false;
  END CASE;
END;
$$;

COMMENT ON FUNCTION has_permission(uuid, varchar) IS
'Generic permission checker. Supports: manage_staff, manage_departments, view_all_tasks, manage_conservation, export_data, manage_settings';

-- =============================================
-- TESTING QUERIES (Uncomment to test)
-- =============================================

/*
-- Test 1: Get active company for current user
SELECT get_active_company_id();

-- Test 2: Check if user is member
SELECT is_company_member('YOUR-COMPANY-UUID-HERE');

-- Test 3: Check if user has management role
SELECT has_management_role('YOUR-COMPANY-UUID-HERE');

-- Test 4: Get user companies
SELECT * FROM get_user_companies();

-- Test 5: Check specific permission
SELECT has_permission('YOUR-COMPANY-UUID-HERE', 'export_data');
*/

-- =============================================
-- PERFORMANCE ANALYSIS
-- =============================================

/*
-- Check function execution time
EXPLAIN ANALYZE
SELECT get_active_company_id();

-- Check index usage
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM company_members WHERE user_id = auth.uid();
*/

SELECT 'RLS Helper Functions created successfully!' as status;
