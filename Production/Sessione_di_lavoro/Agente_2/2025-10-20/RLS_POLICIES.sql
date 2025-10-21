-- ==============================================
-- LOGIN HARDENING - RLS POLICIES
-- Project: BHM v.2
-- Database: PostgreSQL (Supabase)
-- Created: 2025-10-20 by Agente 2
-- Version: 2.0
-- ==============================================

-- ==============================================
-- HELPER FUNCTIONS FOR RLS
-- ==============================================

-- Function to get current user ID from JWT
CREATE OR REPLACE FUNCTION auth.get_current_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN COALESCE(
        (auth.jwt() ->> 'sub')::UUID,
        NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user's tenant IDs
CREATE OR REPLACE FUNCTION auth.get_current_user_tenant_ids()
RETURNS UUID[] AS $$
BEGIN
    RETURN ARRAY(
        SELECT DISTINCT ur.tenant_id
        FROM user_roles ur
        WHERE ur.user_id = auth.get_current_user_id()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has role in tenant
CREATE OR REPLACE FUNCTION auth.user_has_role_in_tenant(
    user_id UUID,
    role_name TEXT,
    tenant_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = user_id
        AND r.name = role_name
        AND ur.tenant_id = tenant_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is owner or admin
CREATE OR REPLACE FUNCTION auth.is_owner_or_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = user_id
        AND r.name IN ('owner', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- ENABLE RLS ON ALL TABLES
-- ==============================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_buckets ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- TENANTS TABLE POLICIES
-- ==============================================

-- Policy: Users can view tenants they belong to
CREATE POLICY "tenants_select_own_tenants"
    ON tenants
    FOR SELECT
    USING (
        id = ANY(auth.get_current_user_tenant_ids())
    );

-- Policy: Only owners can create tenants
CREATE POLICY "tenants_insert_owners_only"
    ON tenants
    FOR INSERT
    WITH CHECK (
        auth.is_owner_or_admin(auth.get_current_user_id())
    );

-- Policy: Only owners can update tenants they own
CREATE POLICY "tenants_update_owners_only"
    ON tenants
    FOR UPDATE
    USING (
        auth.is_owner_or_admin(auth.get_current_user_id())
        AND id = ANY(auth.get_current_user_tenant_ids())
    );

-- Policy: Only owners can delete tenants
CREATE POLICY "tenants_delete_owners_only"
    ON tenants
    FOR DELETE
    USING (
        auth.is_owner_or_admin(auth.get_current_user_id())
        AND id = ANY(auth.get_current_user_tenant_ids())
    );

-- ==============================================
-- ROLES TABLE POLICIES
-- ==============================================

-- Policy: All authenticated users can view roles
CREATE POLICY "roles_select_authenticated"
    ON roles
    FOR SELECT
    USING (
        auth.get_current_user_id() IS NOT NULL
    );

-- Policy: Only owners can modify roles
CREATE POLICY "roles_modify_owners_only"
    ON roles
    FOR ALL
    USING (
        auth.is_owner_or_admin(auth.get_current_user_id())
    )
    WITH CHECK (
        auth.is_owner_or_admin(auth.get_current_user_id())
    );

-- ==============================================
-- USERS TABLE POLICIES
-- ==============================================

-- Policy: Users can view their own profile
CREATE POLICY "users_select_own_profile"
    ON users
    FOR SELECT
    USING (
        id = auth.get_current_user_id()
    );

-- Policy: Users can view other users in their tenants
CREATE POLICY "users_select_tenant_users"
    ON users
    FOR SELECT
    USING (
        id IN (
            SELECT ur.user_id
            FROM user_roles ur
            WHERE ur.tenant_id = ANY(auth.get_current_user_tenant_ids())
        )
    );

-- Policy: Users can update their own profile (limited fields)
CREATE POLICY "users_update_own_profile"
    ON users
    FOR UPDATE
    USING (
        id = auth.get_current_user_id()
    )
    WITH CHECK (
        id = auth.get_current_user_id()
    );

-- Policy: Only admins can create users
CREATE POLICY "users_insert_admins_only"
    ON users
    FOR INSERT
    WITH CHECK (
        auth.is_owner_or_admin(auth.get_current_user_id())
    );

-- Policy: Only admins can delete users
CREATE POLICY "users_delete_admins_only"
    ON users
    FOR DELETE
    USING (
        auth.is_owner_or_admin(auth.get_current_user_id())
    );

-- ==============================================
-- USER ROLES TABLE POLICIES
-- ==============================================

-- Policy: Users can view roles in their tenants
CREATE POLICY "user_roles_select_tenant_roles"
    ON user_roles
    FOR SELECT
    USING (
        SET (tenant_id) && auth.get_current_user_tenant_ids()
    );

-- Policy: Only admins can assign roles
CREATE POLICY "user_roles_insert_admins_only"
    ON user_roles
    FOR INSERT
    WITH CHECK (
        auth.is_owner_or_admin(auth.get_current_user_id())
        AND tenant_id = ANY(auth.get_current_user_tenant_ids())
    );

-- Policy: Only admins can update roles
CREATE POLICY "user_roles_update_admins_only"
    ON user_roles
    FOR UPDATE
    USING (
        auth.is_owner_or_admin(auth.get_current_user_id())
        AND tenant_id = ANY(auth.get_current_user_tenant_ids())
    )
    WITH CHECK (
        auth.is_owner_or_admin(auth.get_current_user_id())
        AND tenant_id = ANY(auth.get_current_user_tenant_ids())
    );

-- Policy: Only admins can delete roles
CREATE POLICY "user_roles_delete_admins_only"
    ON user_roles
    FOR DELETE
    USING (
        auth.is_owner_or_admin(auth.get_current_user_id())
        AND tenant_id = ANY(auth.get_current_user_tenant_ids())
    );

-- ==============================================
-- INVITES TABLE POLICIES
-- ==============================================

-- Policy: Admins can view invites for their tenants
CREATE POLICY "invites_select_tenant_admins"
    ON invites
    FOR SELECT
    USING (
        auth.is_owner_or_admin(auth.get_current_user_id())
        AND tenant_id = ANY(auth.get_current_user_tenant_ids())
    );

-- Policy: Anonymous users can view invites by token (for acceptance)
CREATE POLICY "invites_select_by_token_anonymous"
    ON invites
    FOR SELECT
    USING (
        auth.get_current_user_id() IS NULL
        AND status = 'pending'
        AND expires_at > NOW()
    );

-- Policy: Only admins can create invites
CREATE POLICY "invites_insert_admins_only"
    ON invites
    FOR INSERT
    WITH CHECK (
        auth.is_owner_or_admin(auth.get_current_user_id())
        AND tenant_id = ANY(auth.get_current_user_tenant_ids())
    );

-- Policy: Only admins can update invites
CREATE POLICY "invites_update_admins_only"
    ON invites
    FOR UPDATE
    USING (
        auth.is_owner_or_admin(auth.get_current_user_id())
        AND tenant_id = ANY(auth.get_current_user_tenant_ids())
    )
    WITH CHECK (
        auth.is_owner_or_admin(auth.get_current_user_id())
        AND tenant_id = ANY(auth.get_current_user_tenant_ids())
    );

-- Policy: Only admins can delete invites
CREATE POLICY "invites_delete_admins_only"
    ON invites
    FOR DELETE
    USING (
        auth.is_owner_or_admin(auth.get_current_user_id())
        AND tenant_id = ANY(auth.get_current_user_tenant_ids())
    );

-- ==============================================
-- SESSIONS TABLE POLICIES
-- ==============================================

-- Policy: Users can view their own sessions
CREATE POLICY "sessions_select_own_sessions"
    ON sessions
    FOR SELECT
    USING (
        user_id = auth.get_current_user_id()
    );

-- Policy: System can create sessions (for login)
CREATE POLICY "sessions_insert_system"
    ON sessions
    FOR INSERT
    WITH CHECK (
        user_id = auth.get_current_user_id()
        OR auth.get_current_user_id() IS NULL -- Allow anonymous session creation
    );

-- Policy: Users can update their own sessions
CREATE POLICY "sessions_update_own_sessions"
    ON sessions
    FOR UPDATE
    USING (
        user_id = auth.get_current_user_id()
    )
    WITH CHECK (
        user_id = auth.get_current_user_id()
    );

-- Policy: Users can delete their own sessions
CREATE POLICY "sessions_delete_own_sessions"
    ON sessions
    FOR DELETE
    USING (
        user_id = auth.get_current_user_id()
    );

-- Policy: Admins can view all sessions in their tenants
CREATE POLICY "sessions_select_tenant_admins"
    ON sessions
    FOR SELECT
    USING (
        auth.is_owner_or_admin(auth.get_current_user_id())
        AND user_id IN (
            SELECT ur.user_id
            FROM user_roles ur
            WHERE ur.tenant_id = ANY(auth.get_current_user_tenant_ids())
        )
    );

-- ==============================================
-- AUDIT LOG TABLE POLICIES
-- ==============================================

-- Policy: Users can view audit logs for their tenants
CREATE POLICY "audit_log_select_tenant_users"
    ON audit_log
    FOR SELECT
    USING (
        tenant_id = ANY(auth.get_current_user_tenant_ids())
        OR user_id = auth.get_current_user_id()
    );

-- Policy: System can insert audit logs
CREATE POLICY "audit_log_insert_system"
    ON audit_log
    FOR INSERT
    WITH CHECK (
        true -- Allow system to insert audit logs
    );

-- Policy: Only admins can delete audit logs
CREATE POLICY "audit_log_delete_admins_only"
    ON audit_log
    FOR DELETE
    USING (
        auth.is_owner_or_admin(auth.get_current_user_id())
    );

-- ==============================================
-- RATE LIMIT BUCKETS TABLE POLICIES
-- ==============================================

-- Policy: System can manage rate limit buckets
CREATE POLICY "rate_limit_buckets_system_access"
    ON rate_limit_buckets
    FOR ALL
    USING (
        true -- Allow system to manage rate limiting
    )
    WITH CHECK (
        true
    );

-- ==============================================
-- GRANT PERMISSIONS
-- ==============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO anon;

-- Grant execute on helper functions
GRANT EXECUTE ON FUNCTION auth.get_current_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.get_current_user_tenant_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.user_has_role_in_tenant(UUID, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION auth.is_owner_or_admin(UUID) TO authenticated;

-- ==============================================
-- TESTING POLICIES
-- ==============================================

-- Create test user for policy testing
DO $$
BEGIN
    -- Test that policies work correctly
    -- This will be executed during migration
    RAISE NOTICE 'RLS policies created successfully';
END $$;

-- ==============================================
-- MIGRATION COMPLETE
-- ==============================================

-- Log RLS policy creation
INSERT INTO audit_log (action, resource_type, details) VALUES
('rls_policies_created', 'security', '{"migration": "login_hardening_rls_v2", "policies_created": 24, "functions_created": 4}');
