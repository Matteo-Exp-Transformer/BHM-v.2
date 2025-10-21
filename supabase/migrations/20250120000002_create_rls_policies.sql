-- Migration: Create RLS Policies for Auth Hardening
-- Description: Row Level Security policies for multi-tenant auth system
-- Date: 2025-01-20
-- Author: Agente 2 (Systems/API/DB)

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_buckets ENABLE ROW LEVEL SECURITY;

-- =============================================
-- HELPER FUNCTIONS FOR RLS
-- =============================================

-- Function to get current user ID from JWT or session
CREATE OR REPLACE FUNCTION auth.current_user_id()
RETURNS UUID AS $$
BEGIN
    -- Try to get from JWT claim first
    IF current_setting('request.jwt.claims', true)::jsonb->>'sub' IS NOT NULL THEN
        RETURN (current_setting('request.jwt.claims', true)::jsonb->>'sub')::UUID;
    END IF;
    
    -- Try to get from custom claim
    IF current_setting('request.jwt.claims', true)::jsonb->>'user_id' IS NOT NULL THEN
        RETURN (current_setting('request.jwt.claims', true)::jsonb->>'user_id')::UUID;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current tenant ID from JWT or session
CREATE OR REPLACE FUNCTION auth.current_tenant_id()
RETURNS UUID AS $$
BEGIN
    -- Try to get from JWT claim
    IF current_setting('request.jwt.claims', true)::jsonb->>'tenant_id' IS NOT NULL THEN
        RETURN (current_setting('request.jwt.claims', true)::jsonb->>'tenant_id')::UUID;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user has specific role
CREATE OR REPLACE FUNCTION auth.user_has_role(role_name TEXT, tenant_id UUID DEFAULT NULL)
RETURNS BOOLEANthrop AS $$
DECLARE
    current_user_uuid UUID;
    target_tenant_id UUID;
BEGIN
    current_user_uuid := auth.current_user_id();
    target_tenant_id := COALESCE(tenant_id, auth.current_tenant_id());
    
    IF current_user_uuid IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN user_has_role_in_tenant(current_user_uuid, role_name, target_tenant_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is admin of tenant
CREATE OR REPLACE FUNCTION auth.is_tenant_admin(tenant_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN auth.user_has_role('admin', tenant_id) OR auth.user_has_role('owner', tenant_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access tenant
CREATE OR REPLACE FUNCTION auth.can_access_tenant(tenant_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_uuid UUID;
BEGIN
    current_user_uuid := auth.current_user_id();
    
    IF current_user_uuid IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if user has any role in this tenant
    RETURN EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = current_user_uuid
        AND ur.tenant_id = tenant_id
        AND ur.is_active = TRUE
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- TENANTS POLICIES
-- =============================================

-- Users can only see tenants they belong to
CREATE POLICY "Users can view their own tenants" ON tenants
    FOR SELECT USING (
        auth.can_access_tenant(id)
    );

-- Only admins can update tenant settings
CREATE POLICY "Admins can update tenant settings" ON tenants
    FOR UPDATE USING (
        auth.is_tenant_admin(id)
    );

-- Only system admins can create new tenants
CREATE POLICY "System admins can create tenants" ON tenants
    FOR INSERT WITH CHECK (
        auth.user_has_role('owner', NULL) -- Global owner role
    );

-- Only system admins can delete tenants
CREATE POLICY "System admins can delete tenants" ON tenants
    FOR DELETE USING (
        auth.user_has_role('owner', NULL) -- Global owner role
    );

-- =============================================
-- ROLES POLICIES
-- =============================================

-- Everyone can view roles (for UI purposes)
CREATE POLICY "Everyone can view roles" ON roles
    FOR SELECT USING (TRUE);

-- Only system admins can modify roles
CREATE POLICY "System admins can manage roles" ON roles
    FOR ALL USING (
        auth.user_has_role('owner', NULL) -- Global owner role
    );

-- =============================================
-- USERS POLICIES
-- =============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (
        id = auth.current_user_id()
    );

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (
        id = auth.current_user_id()
    );

-- Tenant admins can view users in their tenant
CREATE POLICY "Tenant admins can view tenant users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = users.id
            AND ur.tenant_id IN (
                SELECT tenant_id FROM user_roles
                WHERE user_id = auth.current_user_id()
                AND auth.is_tenant_admin(tenant_id)
                AND is_active = TRUE
            )
        )
    );

-- Only system admins can create users directly
CREATE POLICY "System admins can create users" ON users
    FOR INSERT WITH CHECK (
        auth.user_has_role('owner', NULL) -- Global owner role
    );

-- System admins and tenant admins can update user status
CREATE POLICY "Admins can update user status" ON users
    FOR UPDATE USING (
        auth.user_has_role('owner', NULL) OR -- Global owner
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = users.id
            AND ur.tenant_id IN (
                SELECT tenant_id FROM user_roles
                WHERE user_id = auth.current_user_id()
                AND auth.is_tenant_admin(tenant_id)
                AND is_active = TRUE
            )
        )
    );

-- =============================================
-- USER_ROLES POLICIES
-- =============================================

-- Users can view their own roles
CREATE POLICY "Users can view own roles" ON user_roles
    FOR SELECT USING (
        user_id = auth.current_user_id()
    );

-- Tenant admins can view roles in their tenant
CREATE POLICY "Tenant admins can view tenant roles" ON user_roles
    FOR SELECT USING (
        auth.can_access_tenant(tenant_id) AND
        auth.is_tenant_admin(tenant_id)
    );

-- Tenant admins can assign roles in their tenant
CREATE POLICY "Tenant admins can assign roles" ON user_roles
    FOR INSERT WITH CHECK (
        auth.is_tenant_admin(tenant_id)
    );

-- Tenant admins can update roles in their tenant
CREATE POLICY "Tenant admins can update tenant roles" ON user_roles
    FOR UPDATE USING (
        auth.is_tenant_admin(tenant_id)
    );

-- Tenant admins can revoke roles in their tenant
CREATE POLICY "Tenant admins can revoke roles" ON user_roles
    FOR DELETE USING (
        auth.is_tenant_admin(tenant_id)
    );

-- =============================================
-- INVITES POLICIES
-- =============================================

-- Tenant admins can view invites for their tenant
CREATE POLICY "Tenant admins can view tenant invites" ON invites
    FOR SELECT USING (
        auth.is_tenant_admin(tenant_id)
    );

-- Tenant admins can create invites for their tenant
CREATE POLICY "Tenant admins can create invites" ON invites
    FOR INSERT WITH CHECK (
        auth.is_tenant_admin(tenant_id)
    );

-- Tenant admins can update invites for their tenant
CREATE POLICY "Tenant admins can update tenant invites" ON invites
    FOR UPDATE USING (
        auth.is_tenant_admin(tenant_id)
    );

-- Tenant admins can revoke invites for their tenant
CREATE POLICY "Tenant admins can revoke tenant invites" ON invites
    FOR DELETE USING (
        auth.is_tenant_admin(tenant_id)
    );

-- Anonymous users can accept invites with valid token
CREATE POLICY "Anonymous can accept valid invites" ON invites
    FOR UPDATE USING (
        status = 'pending' AND
        expires_at > NOW() AND
        attempts < max_attempts
    ) WITH CHECK (
        status = 'accepted' AND
        accepted_at IS NOT NULL
    );

-- =============================================
-- AUDIT_LOG POLICIES
-- =============================================

-- Only security admins can view audit logs
CREATE POLICY "Security admins can view audit logs" ON audit_log
    FOR SELECT USING (
        auth.user_has_role('owner', NULL) OR -- Global owner
        auth.user_has_role('admin', tenant_id) -- Tenant admin
    );

-- System can write audit logs (service role)
CREATE POLICY "System can write audit logs" ON audit_log
    FOR INSERT WITH CHECK (
        current_setting('role') = 'service_role' OR
        current_setting('role') = 'authenticator'
    );

-- =============================================
-- SESSIONS POLICIES
-- =============================================

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions" ON sessions
    FOR SELECT USING (
        user_id = auth.current_user_id()
    );

-- Users can update their own sessions (last_activity)
CREATE POLICY "Users can update own sessions" ON sessions
    FOR UPDATE USING (
        user_id = auth.current_user_id()
    );

-- System can manage sessions (service role)
CREATE POLICY "System can manage sessions" ON sessions
    FOR ALL USING (
        current_setting('role') = 'service_role' OR
        current_setting('role') = 'authenticator'
    );

-- =============================================
-- RATE_LIMIT_BUCKETS POLICIES
-- =============================================

-- System can manage rate limit buckets (service role only)
CREATE POLICY "System can manage rate limits" ON rate_limit_buckets
    FOR ALL USING (
        current_setting('role') = 'service_role' OR
        current_setting('role') = 'authenticator'
    );

-- =============================================
-- ADDITIONAL SECURITY MEASURES
-- =============================================

-- Create a view for user profile with tenant info (read-only)
CREATE VIEW user_profile AS
SELECT 
    u.id,
    u.email,
    u.email_verified,
    u.created_at,
    u.last_login_at,
    u.status,
    u.profile,
    u.mfa_enabled,
    -- User roles in current tenant
    COALESCE(
        json_agg(
            json_build_object(
                'role_name', r.name,
                'permissions', r.permissions,
                'tenant_id', ur.tenant_id,
                'tenant_name', t.name,
                'assigned_at', ur.assigned_at,
                'expires_at', ur.expires_at
            )
        ) FILTER (WHERE r.name IS NOT NULL),
        '[]'::json
    ) as roles
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.is_active = TRUE
LEFT JOIN roles r ON ur.role_id = r.id
LEFT JOIN tenants t ON ur.tenant_id = t.id
WHERE u.id = auth.current_user_id()
GROUP BY u.id, u.email, u.email_verified, u.created_at, u.last_login_at, u.status, u.profile, u.mfa_enabled;

-- Enable RLS on the view
ALTER VIEW user_profile SET (security_invoker = true);

-- Grant permissions on the view
GRANT SELECT ON user_profile TO authenticated;

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================
COMMENT ON POLICY "Users can view their own tenants" ON tenants IS 'Users can only see tenants they belong to';
COMMENT ON POLICY "Admins can update tenant settings" ON tenants IS 'Only tenant admins can modify tenant settings';
COMMENT ON POLICY "System admins can create tenants" ON tenants IS 'Only global owners can create new tenants';
COMMENT ON POLICY "System admins can delete tenants" ON tenants IS 'Only global owners can delete tenants';

COMMENT ON POLICY "Everyone can view roles" ON roles IS 'Roles are visible to all users for UI purposes';
COMMENT ON POLICY "System admins can manage roles" ON roles IS 'Only global owners can modify role definitions';

COMMENT ON POLICY "Users can view own profile" ON users IS 'Users can see their own profile information';
COMMENT ON POLICY "Users can update own profile" ON users IS 'Users can update their own profile (limited fields)';
COMMENT ON POLICY "Tenant admins can view tenant users" ON users IS 'Tenant admins can see users in their tenant';
COMMENT ON POLICY "System admins can create users" ON users IS 'Only system can create users directly';
COMMENT ON POLICY "Admins can update user status" ON users IS 'Admins can update user status and security fields';

COMMENT ON POLICY "Users can view own roles" ON user_roles IS 'Users can see their own role assignments';
COMMENT ON POLICY "Tenant admins can view tenant roles" ON user_roles IS 'Tenant admins can see role assignments in their tenant';
COMMENT ON POLICY "Tenant admins can assign roles" ON user_roles IS 'Tenant admins can assign roles to users in their tenant';
COMMENT ON POLICY "Tenant admins can update tenant roles" ON user_roles IS 'Tenant admins can modify role assignments in their tenant';
COMMENT ON POLICY "Tenant admins can revoke roles" ON user_roles IS 'Tenant admins can revoke role assignments in their tenant';

COMMENT ON POLICY "Tenant admins can view tenant invites" ON invites IS 'Tenant admins can see invites for their tenant';
COMMENT ON POLICY "Tenant admins can create invites" ON invites IS 'Tenant admins can create invites for their tenant';
COMMENT ON POLICY "Tenant admins can update tenant invites" ON invites IS 'Tenant admins can modify invites for their tenant';
COMMENT ON POLICY "Tenant admins can revoke tenant invites" ON invites IS 'Tenant admins can revoke invites for their tenant';
COMMENT ON POLICY "Anonymous can accept valid invites" ON invites IS 'Anonymous users can accept valid invites with token';

COMMENT ON POLICY "Security admins can view audit logs" ON audit_log IS 'Only security admins can view audit logs';
COMMENT ON POLICY "System can write audit logs" ON audit_log IS 'System can write audit logs for security tracking';

COMMENT ON POLICY "Users can view own sessions" ON sessions IS 'Users can see their own active sessions';
COMMENT ON POLICY "Users can update own sessions" ON sessions IS 'Users can update their own session activity';
COMMENT ON POLICY "System can manage sessions" ON sessions IS 'System can manage all sessions for security';

COMMENT ON POLICY "System can manage rate limits" ON rate_limit_buckets IS 'Only system can manage rate limiting data';
