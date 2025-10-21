-- Migration: Login Hardening Schema v2
-- Description: Updated schema with all security requirements from PRD
-- Date: 2025-01-20
-- Author: Agente 2 (Systems/API/DB)

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'locked', 'pending');
CREATE TYPE invite_status AS ENUM ('pending', 'accepted', 'expired', 'revoked');
CREATE TYPE audit_action AS ENUM (
    'login_success', 
    'login_failure', 
    'logout', 
    'lockout', 
    'invite_created', 
    'invite_accepted', 
    'password_reset_request', 
    'password_reset_confirm',
    'password_changed',
    'role_assigned',
    'role_revoked',
    'session_created',
    'session_rotated',
    'session_expired'
);

-- =============================================
-- TENANTS TABLE
-- =============================================
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    settings JSONB DEFAULT '{}'::jsonb,
    status user_status DEFAULT 'active',
    CONSTRAINT tenant_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT tenant_slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

-- =============================================
-- ROLES TABLE
-- =============================================
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_system BOOLEAN DEFAULT FALSE,
    CONSTRAINT role_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    last_login_ip INET,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    status user_status DEFAULT 'pending',
    profile JSONB DEFAULT '{}'::jsonb,
    recovery_tokens JSONB DEFAULT '[]'::jsonb,
    password_changed_at TIMESTAMPTZ DEFAULT NOW(),
    must_change_password BOOLEAN DEFAULT FALSE,
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT password_hash_not_empty CHECK (LENGTH(password_hash) > 0),
    CONSTRAINT failed_attempts_non_negative CHECK (failed_login_attempts >= 0)
);

-- =============================================
-- USER_ROLES TABLE (Many-to-Many)
-- =============================================
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, role_id, tenant_id),
    CONSTRAINT expires_future CHECK (expires_at IS NULL OR expires_at > assigned_at)
);

-- =============================================
-- INVITES TABLE
-- =============================================
CREATE TABLE invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    role_id UUID NOT NULL REFERENCES roles(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    token_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    accepted_by UUID REFERENCES users(id),
    status invite_status DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    metadata JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT expires_future CHECK (expires_at > created_at),
    CONSTRAINT attempts_non_negative CHECK (attempts >= 0),
    CONSTRAINT max_attempts_positive CHECK (max_attempts > 0)
);

-- =============================================
-- AUDIT_LOG TABLE
-- =============================================
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES users(id),
    tenant_id UUID REFERENCES tenants(id),
    ip INET,
    user_agent TEXT,
    action audit_action NOT NULL,
    outcome VARCHAR(50) NOT NULL, -- 'success', 'failure', 'blocked'
    reason TEXT,
    correlation_id UUID,
    rate_limit_state JSONB,
    metadata JSONB DEFAULT '{}'::jsonb,
    request_id VARCHAR(255),
    session_id VARCHAR(255),
    CONSTRAINT outcome_valid CHECK (outcome IN ('success', 'failure', 'blocked'))
);

-- =============================================
-- SESSIONS TABLE (for session management)
-- =============================================
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    csrf_token VARCHAR(255) NOT NULL,
    ip INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb,
    rotated_from UUID REFERENCES sessions(id),
    CONSTRAINT expires_future CHECK (expires_at > created_at)
);

-- =============================================
-- RATE_LIMIT_BUCKETS TABLE
-- =============================================
CREATE TABLE rate_limit_buckets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bucket_key VARCHAR(255) NOT NULL, -- IP, user_id, or fingerprint
    bucket_type VARCHAR(50) NOT NULL, -- 'ip', 'user', 'fingerprint'
    endpoint VARCHAR(100), -- Optional endpoint-specific bucket
    request_count INTEGER DEFAULT 0,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    window_duration INTERVAL DEFAULT '5 minutes',
    blocked_until TIMESTAMPTZ,
    lockout_level VARCHAR(20) DEFAULT 'warning', -- 'warning', 'temporary', 'extended', 'permanent'
    violation_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(bucket_key, bucket_type, endpoint, window_start),
    CONSTRAINT bucket_type_valid CHECK (bucket_type IN ('ip', 'user', 'fingerprint')),
    CONSTRAINT request_count_non_negative CHECK (request_count >= 0),
    CONSTRAINT violation_count_non_negative CHECK (violation_count >= 0)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_last_login ON users(last_login_at);
CREATE INDEX idx_users_locked_until ON users(locked_until);
CREATE INDEX idx_users_email_lower ON users(LOWER(email));

-- User roles indexes
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_tenant_id ON user_roles(tenant_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_user_roles_active ON user_roles(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_user_roles_user_tenant ON user_roles(user_id, tenant_id);

-- Invites indexes
CREATE INDEX idx_invites_email ON invites(email);
CREATE INDEX idx_invites_token_hash ON invites(token_hash);
CREATE INDEX idx_invites_expires_at ON invites(expires_at);
CREATE INDEX idx_invites_status ON invites(status);
CREATE INDEX idx_invites_tenant_id ON invites(tenant_id);
CREATE INDEX idx_invites_status_expires ON invites(status, expires_at) WHERE status = 'pending';

-- Audit log indexes
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_tenant_id ON audit_log(tenant_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_correlation_id ON audit_log(correlation_id);
CREATE INDEX idx_audit_log_tenant_timestamp ON audit_log(tenant_id, timestamp);

-- Sessions indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(session_token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_sessions_active ON sessions(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_sessions_user_expires ON sessions(user_id, expires_at);

-- Rate limit indexes
CREATE INDEX idx_rate_limit_buckets_key_type ON rate_limit_buckets(bucket_key, bucket_type);
CREATE INDEX idx_rate_limit_buckets_window_start ON rate_limit_buckets(window_start);
CREATE INDEX idx_rate_limit_buckets_blocked_until ON rate_limit_buckets(blocked_until);
CREATE INDEX idx_rate_limit_buckets_cleanup ON rate_limit_buckets(created_at) WHERE blocked_until IS NULL;

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rate_limit_buckets_updated_at BEFORE UPDATE ON rate_limit_buckets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNCTIONS FOR SECURITY
-- =============================================

-- Function to check if user has role in tenant
CREATE OR REPLACE FUNCTION user_has_role_in_tenant(
    p_user_id UUID,
    p_role_name VARCHAR(100),
    p_tenant_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = p_user_id
        AND r.name = p_role_name
        AND ur.tenant_id = p_tenant_id
        AND ur.is_active = TRUE
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's roles in tenant
CREATE OR REPLACE FUNCTION get_user_roles_in_tenant(
    p_user_id UUID,
    p_tenant_id UUID
) RETURNS TABLE(role_name VARCHAR(100), permissions JSONB) AS $$
BEGIN
    RETURN QUERY
    SELECT r.name, r.permissions
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = p_user_id
    AND ur.tenant_id = p_tenant_id
    AND ur.is_active = TRUE
    AND (ur.expires_at IS NULL OR ur.expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean expired sessions
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM sessions WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean expired invites
CREATE OR REPLACE FUNCTION clean_expired_invites()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE invites 
    SET status = 'expired'
    WHERE expires_at < NOW() AND status = 'pending';
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean expired rate limit buckets
CREATE OR REPLACE FUNCTION clean_expired_rate_buckets()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM rate_limit_buckets 
    WHERE window_start + window_duration < NOW() 
    AND blocked_until IS NULL;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_bucket_key VARCHAR(255),
    p_bucket_type VARCHAR(50),
    p_endpoint VARCHAR(100),
    p_limit INTEGER,
    p_window_minutes INTEGER
) RETURNS TABLE(
    allowed BOOLEAN,
    remaining INTEGER,
    reset_time TIMESTAMPTZ,
    blocked_until TIMESTAMPTZ
) AS $$
DECLARE
    current_window TIMESTAMPTZ;
    bucket_record rate_limit_buckets%ROWTYPE;
BEGIN
    -- Calculate current window
    current_window := date_trunc('minute', NOW()) - 
                     (EXTRACT(minute FROM NOW())::INTEGER % p_window_minutes) * INTERVAL '1 minute';
    
    -- Get or create bucket
    SELECT * INTO bucket_record
    FROM rate_limit_buckets
    WHERE bucket_key = p_bucket_key
    AND bucket_type = p_bucket_type
    AND endpoint = COALESCE(p_endpoint, '')
    AND window_start = current_window;
    
    -- If bucket doesn't exist, create it
    IF NOT FOUND THEN
        INSERT INTO rate_limit_buckets (bucket_key, bucket_type, endpoint, window_start, window_duration)
        VALUES (p_bucket_key, p_bucket_type, COALESCE(p_endpoint, ''), current_window, p_window_minutes * INTERVAL '1 minute');
        
        -- Get the new bucket
        SELECT * INTO bucket_record
        FROM rate_limit_buckets
        WHERE bucket_key = p_bucket_key
        AND bucket_type = p_bucket_type
        AND endpoint = COALESCE(p_endpoint, '')
        AND window_start = current_window;
    END IF;
    
    -- Check if blocked
    IF bucket_record.blocked_until IS NOT NULL AND bucket_record.blocked_until > NOW() THEN
        RETURN QUERY SELECT FALSE, 0, current_window + bucket_record.window_duration, bucket_record.blocked_until;
        RETURN;
    END IF;
    
    -- Check limit
    IF bucket_record.request_count >= p_limit THEN
        -- Apply lockout
        UPDATE rate_limit_buckets
        SET blocked_until = NOW() + INTERVAL '10 minutes',
            violation_count = violation_count + 1
        WHERE id = bucket_record.id;
        
        RETURN QUERY SELECT FALSE, 0, current_window + bucket_record.window_duration, NOW() + INTERVAL '10 minutes';
        RETURN;
    END IF;
    
    -- Increment counter
    UPDATE rate_limit_buckets
    SET request_count = request_count + 1
    WHERE id = bucket_record.id;
    
    RETURN QUERY SELECT TRUE, p_limit - bucket_record.request_count - 1, current_window + bucket_record.window_duration, NULL::TIMESTAMPTZ;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================
COMMENT ON TABLE tenants IS 'Multi-tenant organizations/companies';
COMMENT ON TABLE roles IS 'System and custom roles with permissions';
COMMENT ON TABLE users IS 'User accounts with security fields and password policy enforcement';
COMMENT ON TABLE user_roles IS 'Many-to-many relationship between users, roles, and tenants';
COMMENT ON TABLE invites IS 'User invitation system with token-based security and attempt tracking';
COMMENT ON TABLE audit_log IS 'Security audit trail for all authentication and authorization events';
COMMENT ON TABLE sessions IS 'Active user sessions with CSRF protection and rotation tracking';
COMMENT ON TABLE rate_limit_buckets IS 'Rate limiting buckets for different entity types with lockout levels';

COMMENT ON COLUMN users.password_hash IS 'bcrypt hash of user password (letters only, min 12 chars)';
COMMENT ON COLUMN users.failed_login_attempts IS 'Counter for failed login attempts (resets on success)';
COMMENT ON COLUMN users.locked_until IS 'Timestamp when account lock expires';
COMMENT ON COLUMN users.recovery_tokens IS 'JSON array of active recovery tokens with expiration';
COMMENT ON COLUMN users.must_change_password IS 'Flag to force password change on next login';
COMMENT ON COLUMN invites.token_hash IS 'Hashed invitation token for security';
COMMENT ON COLUMN invites.attempts IS 'Number of attempts to use this invite token';
COMMENT ON COLUMN sessions.csrf_token IS 'CSRF protection token for this session';
COMMENT ON COLUMN sessions.rotated_from IS 'Reference to previous session if this was rotated';
COMMENT ON COLUMN rate_limit_buckets.bucket_key IS 'Identifier for the rate limit bucket (IP, user_id, or fingerprint)';
COMMENT ON COLUMN rate_limit_buckets.lockout_level IS 'Current lockout level: warning, temporary, extended, permanent';
