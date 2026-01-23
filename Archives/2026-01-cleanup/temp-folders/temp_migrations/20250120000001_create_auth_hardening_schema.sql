-- Migration: Create Auth Hardening Schema
-- Description: Initial schema for multi-tenant auth system with RLS policies
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
    'role_revoked'
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
    created_by UUID REFERENCES users(id),
    settings JSONB DEFAULT '{}'::jsonb,
    status user_status DEFAULT 'active'
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
    is_system BOOLEAN DEFAULT FALSE
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
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    recovery_tokens JSONB DEFAULT '[]'::jsonb,
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT password_hash_not_empty CHECK (LENGTH(password_hash) > 0)
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
    UNIQUE(user_id, role_id, tenant_id)
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
    CONSTRAINT expires_future CHECK (expires_at > created_at)
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
    session_id VARCHAR(255)
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
    metadata JSONB DEFAULT '{}'::jsonb
);

-- =============================================
-- RATE_LIMIT_BUCKETS TABLE
-- =============================================
CREATE TABLE rate_limit_buckets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bucket_key VARCHAR(255) NOT NULL, -- IP, user_id, or fingerprint
    bucket_type VARCHAR(50) NOT NULL, -- 'ip', 'user', 'fingerprint'
    request_count INTEGER DEFAULT 0,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    window_duration INTERVAL DEFAULT '1 minute',
    blocked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(bucket_key, bucket_type, window_start)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_last_login ON users(last_login_at);
CREATE INDEX idx_users_locked_until ON users(locked_until);

-- User roles indexes
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_tenant_id ON user_roles(tenant_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_user_roles_active ON user_roles(is_active) WHERE is_active = TRUE;

-- Invites indexes
CREATE INDEX idx_invites_email ON invites(email);
CREATE INDEX idx_invites_token_hash ON invites(token_hash);
CREATE INDEX idx_invites_expires_at ON invites(expires_at);
CREATE INDEX idx_invites_status ON invites(status);
CREATE INDEX idx_invites_tenant_id ON invites(tenant_id);

-- Audit log indexes
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_tenant_id ON audit_log(tenant_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_correlation_id ON audit_log(correlation_id);

-- Sabin sessions indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(session_token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_sessions_active ON sessions(is_active) WHERE is_active = TRUE;

-- Rate limit indexes
CREATE INDEX idx_rate_limit_buckets_key_type ON rate_limit_buckets(bucket_key, bucket_type);
CREATE INDEX idx_rate_limit_buckets_window_start ON rate_limit_buckets(window_start);
CREATE INDEX idx_rate_limit_buckets_blocked_until ON rate_limit_buckets(blocked_until);

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
    deleted_count INTEGER;
BEGIN
    UPDATE invites 
    SET status = 'expired'
    WHERE expires_at < NOW() AND status = 'pending';
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================
COMMENT ON TABLE tenants IS 'Multi-tenant organizations/companies';
COMMENT ON TABLE roles IS 'System and custom roles with permissions';
COMMENT ON TABLE users IS 'User accounts with security fields';
COMMENT ON TABLE user_roles IS 'Many-to-many relationship between users, roles, and tenants';
COMMENT ON TABLE invites IS 'User invitation system with token-based security';
COMMENT ON TABLE audit_log IS 'Security audit trail for all authentication events';
COMMENT ON TABLE sessions IS 'Active user sessions with CSRF protection';
COMMENT ON TABLE rate_limit_buckets IS 'Rate limiting buckets for different entity types';

COMMENT ON COLUMN users.password_hash IS 'bcrypt hash of user password';
COMMENT ON COLUMN users.failed_login_attempts IS 'Counter for failed login attempts';
COMMENT ON COLUMN users.locked_until IS 'Timestamp when account lock expires';
COMMENT ON COLUMN users.recovery_tokens IS 'JSON array of active recovery tokens';
COMMENT ON COLUMN invites.token_hash IS 'Hashed invitation token for security';
COMMENT ON COLUMN sessions.csrf_token IS 'CSRF protection token for this session';
