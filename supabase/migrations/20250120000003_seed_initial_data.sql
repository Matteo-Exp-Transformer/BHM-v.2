-- Migration: Seed Initial Data for Auth Hardening
-- Description: Initial data setup for roles, permissions, and default tenant
-- Date: 2025-01-20
-- Author: Agente 2 (Systems/API/DB)

-- =============================================
-- SEED ROLES
-- =============================================

INSERT INTO roles (id, name, description, permissions, is_system) VALUES 
  (
    'role-owner',
    'owner',
    'System owner with full access to all tenants and system settings',
    '["*"]'::json [],
    true
  ),
  (
    'role-admin',
    'admin',
    'Tenant administrator with full access to tenant resources',
    '["read", "write", "admin", "invite_users", "manage_roles", "view_audit_logs"]'::json [],
    true
  ),
  (
    'role-manager',
    'manager',
    'Manager with access to most tenant resources except user management',
    '["read", "write", "view_reports", "manage_inventory", "manage_calendar"]'::json [],
    true
  ),
  (
    'role-operator',
    'operator',
    'Standard operator with basic read/write access',
    '["read", "write", "create_records", "update_records"]'::json [],
    true
  ),
  (
    'role-viewer',
    'viewer',
    'Read-only access to tenant resources',
    '["read", "view_reports"]'::json [],
    true
  );

-- =============================================
-- SEED DEFAULT TENANT
-- =============================================

INSERT INTO tenants (id, name, slug, created_at, updated_at, status) VALUES 
  (
    'tenant-default',
    'Default Organization',
    'default-org',
    NOW(),
    NOW(),
    'active'
  );

-- =============================================
-- SEED DEFAULT ADMIN USER
-- =============================================

-- Note: This will be replaced by the bootstrap script
-- Password: 'AdminPassword123!' (must be changed on first login)
INSERT INTO users (id, email, password_hash, email_verified, created_at, updated_at, status) VALUES 
  (
    'user-bootstrap-admin',
    'admin@bhm.local',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4jKJ8Y5QxO', -- AdminPassword123!
    false, -- Must verify email and change password
    NOW(),
    NOW(),
    'pending'
  );

-- =============================================
-- ASSIGN OWNER ROLE TO BOOTSTRAP ADMIN
-- =============================================

INSERT INTO user_roles (user_id, role_id, tenant_id, assigned_by, assigned_at, is_active) VALUES 
  (
    'user-bootstrap-admin',
    'role-owner',
    'tenant-default',
    'user-bootstrap-admin', -- Self-assigned for bootstrap
    NOW(),
    true
  );

-- =============================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================

-- Additional indexes for common queries
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_invites_status_expires ON invites(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_action_outcome ON audit_log(action, outcome);
CREATE INDEX IF NOT EXISTS idx_sessions_user_expires ON sessions(user_id, expires_at);

-- =============================================
-- CREATE USEFUL VIEWS
-- =============================================

-- View for user profile with roles
CREATE OR REPLACE VIEW user_profile_view AS
SELECT 
    u.id,
    u.email,
    u.email_verified,
    u.created_at,
    u.last_login_at,
    u.status,
    u.profile,
    u.mfa_enabled,
    COALESCE(
        json_agg(
            json_build_object(
                'role_id', r.id,
                'role_name', r.name,
                'role_description', r.description,
                'tenant_id', ur.tenant_id,
                'tenant_name', t.name,
                'permissions', r.permissions,
                'assigned_at', ur.assigned_at,
                'expires_at', ur.expires_at,
                'is_active', ur.is_active
            )
        ) FILTER (WHERE r.name IS NOT NULL),
        '[]'::json
    ) as roles,
    COALESCE(
        json_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL),
        '[]'::json
    ) as tenants
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.is_active = TRUE
LEFT JOIN roles r ON ur.role_id = r.id
LEFT JOIN tenants t ON ur.tenant_id = t.id
GROUP BY u.id, u.email, u.email_verified, u.created_at, u.last_login_at, u.status, u.profile, u.mfa_enabled;

-- View for active sessions
CREATE OR REPLACE VIEW active_sessions_view AS
SELECT 
    s.id,
    s.user_id,
    u.email,
    s.ip,
    s.user_agent,
    s.created_at,
    s.expires_at,
    s.last_activity,
    EXTRACT(EPOCH FROM (s.expires_at - NOW())) as seconds_until_expiry
FROM sessions s
JOIN users u ON s.user_id = u.id
WHERE s.is_active = TRUE 
AND s.expires_at > NOW();

-- View for pending invites
CREATE OR REPLACE VIEW pending_invites_view AS
SELECT 
    i.id,
    i.email,
    i.status,
    i.expires_at,
    i.attempts,
    i.max_attempts,
    r.name as role_name,
    t.name as tenant_name,
    u.email as created_by_email,
    i.created_at,
    EXTRACT(EPOCH FROM (i.expires_at - NOW())) as seconds_until_expiry
FROM invites i
JOIN roles r ON i.role_id = r.id
JOIN tenants t ON i.tenant_id = t.id
JOIN users u ON i.created_by = u.id
WHERE i.status = 'pending'
AND i.expires_at > NOW();

-- =============================================
-- CREATE HELPER FUNCTIONS
-- =============================================

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION user_has_permission(
    p_user_id UUID,
    p_permission TEXT,
    p_tenant_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    -- Global owner always has permission
    IF EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = p_user_id
        AND r.name = 'owner'
        AND ur.is_active = TRUE
    ) THEN
        RETURN TRUE;
    END IF;
    
    -- Check specific permission in tenant
    RETURN EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = p_user_id
        AND (p_tenant_id IS NULL OR ur.tenant_id = p_tenant_id)
        AND ur.is_active = TRUE
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
        AND (
            r.permissions @> '["*"]'::jsonb OR
            r.permissions @> ('["' || p_permission || '"]')::jsonb
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user permissions in tenant
CREATE OR REPLACE FUNCTION get_user_permissions(
    p_user_id UUID,
    p_tenant_id UUID
) RETURNS TEXT[] AS $$
DECLARE
    permissions TEXT[] := '{}';
    role_permissions JSONB;
BEGIN
    -- Get all permissions from user roles
    FOR role_permissions IN
        SELECT r.permissions
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = p_user_id
        AND ur.tenant_id = p_tenant_id
        AND ur.is_active = TRUE
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    LOOP
        -- If role has wildcard permission, return all
        IF role_permissions @> '["*"]'::jsonb THEN
            RETURN ARRAY['*'];
        END IF;
        
        -- Merge permissions
        permissions := permissions || (
            SELECT ARRAY(
                SELECT jsonb_array_elements_text(role_permissions)
            )
        );
    END LOOP;
    
    RETURN permissions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired data
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS TABLE(
    expired_sessions INTEGER,
    expired_invites INTEGER,
    expired_recovery_tokens INTEGER
) AS $$
DECLARE
    sessions_count INTEGER;
    invites_count INTEGER;
    tokens_count INTEGER;
BEGIN
    -- Clean expired sessions
    DELETE FROM sessions WHERE expires_at < NOW();
    GET DIAGNOSTICS sessions_count = ROW_COUNT;
    
    -- Mark expired invites
    UPDATE invites 
    SET status = 'expired'
    WHERE status = 'pending' AND expires_at < NOW();
    GET DIAGNOSTICS invites_count = ROW_COUNT;
    
    -- Clean expired recovery tokens
    UPDATE users 
    SET recovery_tokens = '[]'::jsonb
    WHERE recovery_tokens != '[]'::jsonb
    AND NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements(recovery_tokens) AS token
        WHERE (token->>'expires_at')::timestamptz > NOW()
    );
    GET DIAGNOSTICS tokens_count = ROW_COUNT;
    
    RETURN QUERY SELECT sessions_count, invites_count, tokens_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- CREATE SCHEDULED TASKS (if supported)
-- =============================================

-- Note: This would typically be handled by a cron job or scheduled task
-- For now, we'll create a function that can be called manually or by external scheduler

CREATE OR REPLACE FUNCTION schedule_cleanup()
RETURNS VOID AS $$
BEGIN
    -- Run cleanup every hour
    PERFORM cleanup_expired_data();
    
    -- Log cleanup activity
    INSERT INTO audit_log (
        action,
        outcome,
        reason,
        metadata
    ) VALUES (
        'cleanup_expired_data',
        'success',
        'Scheduled cleanup completed',
        json_build_object(
            'timestamp', NOW(),
            'type', 'scheduled'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON VIEW user_profile_view IS 'Complete user profile with roles and permissions';
COMMENT ON VIEW active_sessions_view IS 'Currently active user sessions';
COMMENT ON VIEW pending_invites_view IS 'Pending user invitations';

COMMENT ON FUNCTION user_has_permission IS 'Check if user has specific permission in tenant';
COMMENT ON FUNCTION get_user_permissions IS 'Get all permissions for user in tenant';
COMMENT ON FUNCTION cleanup_expired_data IS 'Clean up expired sessions, invites, and tokens';
COMMENT ON FUNCTION schedule_cleanup IS 'Scheduled cleanup function for maintenance';

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

-- Grant permissions on views
GRANT SELECT ON user_profile_view TO authenticated;
GRANT SELECT ON active_sessions_view TO authenticated;
GRANT SELECT ON pending_invites_view TO authenticated;

-- Grant permissions on functions
GRANT EXECUTE ON FUNCTION user_has_permission TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_permissions TO authenticated;
