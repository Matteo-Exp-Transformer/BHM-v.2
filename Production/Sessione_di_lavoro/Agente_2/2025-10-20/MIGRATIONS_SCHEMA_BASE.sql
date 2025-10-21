-- ==============================================
-- LOGIN HARDENING - SCHEMA BASE MIGRATIONS
-- Project: BHM v.2
-- Database: PostgreSQL (Supabase)
-- Created: 2025-10-20 by Agente 2
-- Version: 2.0
-- ==============================================

-- ==============================================
-- 1. TENANTS TABLE
-- ==============================================

-- Drop if exists (for clean migration)
DROP TABLE IF EXISTS tenants CASCADE;

-- Create tenants table
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT tenants_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT tenants_slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

-- Indexes for tenants
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_created_at ON tenants(created_at DESC);

-- ==============================================
-- 2. ROLES TABLE
-- ==============================================

-- Drop if exists
DROP TABLE IF EXISTS roles CASCADE;

-- Create roles table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT roles_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
('owner', 'Proprietario azienda - accesso completo', '{"all": true}'),
('admin', 'Amministratore - gestione utenti e configurazioni', '{"users": true, "settings": true, "reports": true}'),
('manager', 'Manager - gestione operativa', '{"operations": true, "reports": true}'),
('operator', 'Operatore - accesso base', '{"operations": true}');

-- ==============================================
-- 3. USERS TABLE
-- ==============================================

-- Drop if exists
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    last_login_at TIMESTAMPTZ,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT users_password_not_empty CHECK (LENGTH(password_hash) > 0),
    CONSTRAINT users_failed_attempts_positive CHECK (failed_login_attempts >= 0)
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_email_verified ON users(email_verified);
CREATE INDEX idx_users_last_login ON users(last_login_at DESC);

-- ==============================================
-- 4. USER ROLES TABLE (Multi-tenant)
-- ==============================================

-- Drop if exists
DROP TABLE IF EXISTS user_roles CASCADE;

-- Create user_roles table
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT user_roles_unique_user_role_tenant UNIQUE(user_id, role_id, tenant_id)
);

-- Indexes for user_roles
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_tenant_id ON user_roles(tenant_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_user_roles_assigned_at ON user_roles(assigned_at DESC);

-- ==============================================
-- 5. INVITES TABLE
-- ==============================================

-- Drop if exists
DROP TABLE IF EXISTS invites CASCADE;

-- Create invites table
CREATE TABLE invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    accepted_at TIMESTAMPTZ,
    accepted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT invites_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT invites_token_not_empty CHECK (LENGTH(token) > 0)
);

-- Indexes for invites
CREATE INDEX idx_invites_email ON invites(email);
CREATE INDEX idx_invites_token ON invites(token);
CREATE INDEX idx_invites_status ON invites(status);
CREATE INDEX idx_invites_expires_at ON invites(expires_at);
CREATE INDEX idx_invites_tenant_id ON invites(tenant_id);

-- ==============================================
-- 6. SESSIONS TABLE
-- ==============================================

-- Drop if exists
DROP TABLE IF EXISTS sessions CASCADE;

-- Create sessions table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    csrf_token VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    expires_at TIMESTAMPTZ NOT NULL,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT sessions_token_not_empty CHECK (LENGTH(token) > 0),
    CONSTRAINT sessions_csrf_token_not_empty CHECK (LENGTH(csrf_token) > 0)
);

-- Indexes for sessions
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_csrf_token ON sessions(csrf_token);
CREATE INDEX idx_sessions_active ON sessions(is_active);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_sessions_last_activity ON sessions(last_activity_at DESC);

-- ==============================================
-- 7. AUDIT LOG TABLE
-- ==============================================

-- Drop if exists
DROP TABLE IF EXISTS audit_log CASCADE;

-- Create audit_log table
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT audit_log_action_not_empty CHECK (LENGTH(TRIM(action)) > 0)
);

-- Indexes for audit_log
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_tenant_id ON audit_log(tenant_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_resource ON audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);

-- ==============================================
-- 8. RATE LIMIT BUCKETS TABLE
-- ==============================================

-- Drop if exists
DROP TABLE IF EXISTS rate_limit_buckets CASCADE;

-- Create rate_limit_buckets table
CREATE TABLE rate_limit_buckets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bucket_key VARCHAR(255) UNIQUE NOT NULL,
    bucket_type VARCHAR(50) NOT NULL CHECK (bucket_type IN ('ip', 'email', 'user_agent', 'global')),
    request_count INTEGER NOT NULL DEFAULT 0,
    window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    window_size INTEGER NOT NULL DEFAULT 300, -- 5 minutes in seconds
    max_requests INTEGER NOT NULL DEFAULT 100,
    is_blocked BOOLEAN NOT NULL DEFAULT false,
    blocked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT rate_limit_bucket_key_not_empty CHECK (LENGTH(bucket_key) > 0),
    CONSTRAINT rate_limit_request_count_positive CHECK (request_count >= 0),
    CONSTRAINT rate_limit_window_size_positive CHECK (window_size > 0),
    CONSTRAINT rate_limit_max_requests_positive CHECK (max_requests > 0)
);

-- Indexes for rate_limit_buckets
CREATE INDEX idx_rate_limit_bucket_key ON rate_limit_buckets(bucket_key);
CREATE INDEX idx_rate_limit_bucket_type ON rate_limit_buckets(bucket_type);
CREATE INDEX idx_rate_limit_window_start ON rate_limit_buckets(window_start);
CREATE INDEX idx_rate_limit_blocked ON rate_limit_buckets(is_blocked, blocked_until);

-- ==============================================
-- TRIGGERS FOR UPDATED_AT
-- ==============================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER tenants_updated_at_trigger
    BEFORE UPDATE ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER users_updated_at_trigger
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER rate_limit_buckets_updated_at_trigger
    BEFORE UPDATE ON rate_limit_buckets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- COMMENTS FOR DOCUMENTATION
-- ==============================================

COMMENT ON TABLE tenants IS 'Organizzazioni multi-tenant del sistema';
COMMENT ON TABLE roles IS 'Ruoli sistema con permissions';
COMMENT ON TABLE users IS 'Utenti con security fields e login tracking';
COMMENT ON TABLE user_roles IS 'Associazione utenti-ruoli-tenant (multi-tenant)';
COMMENT ON TABLE invites IS 'Inviti utente con token sicuri';
COMMENT ON TABLE sessions IS 'Sessioni attive con CSRF token';
COMMENT ON TABLE audit_log IS 'Log sicurezza e telemetria';
COMMENT ON TABLE rate_limit_buckets IS 'Bucket per rate limiting multi-bucket';

-- Column comments
COMMENT ON COLUMN tenants.slug IS 'Slug univoco per URL e identificazione';
COMMENT ON COLUMN users.password_hash IS 'Hash password con bcrypt';
COMMENT ON COLUMN users.failed_login_attempts IS 'Contatore tentativi login falliti';
COMMENT ON COLUMN users.locked_until IS 'Timestamp sblocco account dopo lockout';
COMMENT ON COLUMN invites.token IS 'Token sicuro per accettazione invito';
COMMENT ON COLUMN sessions.csrf_token IS 'Token CSRF per protezione';
COMMENT ON COLUMN audit_log.details IS 'Dettagli aggiuntivi evento in JSON';
COMMENT ON COLUMN rate_limit_buckets.bucket_key IS 'Chiave bucket (IP, email, user_agent, etc.)';

-- ==============================================
-- INITIAL DATA (DEV/TEST ONLY)
-- ==============================================

-- Insert test tenant
INSERT INTO tenants (name, slug) VALUES
('Test Company', 'test-company'),
('Demo Organization', 'demo-org');

-- Insert test users (passwords are 'TestPassword123' hashed with bcrypt)
INSERT INTO users (email, password_hash, first_name, last_name, email_verified) VALUES
('owner@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeGWR5jGZ1CQj1fQ2', 'Test', 'Owner', true),
('admin@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeGWR5jGZ1CQj1fQ2', 'Test', 'Admin', true),
('user@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeGWR5jGZ1CQj1fQ2', 'Test', 'User', true);

-- Assign roles to test users
INSERT INTO user_roles (user_id, role_id, tenant_id) VALUES
((SELECT id FROM users WHERE email = 'owner@test.com'), (SELECT id FROM roles WHERE name = 'owner'), (SELECT id FROM tenants WHERE slug = 'test-company')),
((SELECT id FROM users WHERE email = 'admin@test.com'), (SELECT id FROM roles WHERE name = 'admin'), (SELECT id FROM tenants WHERE slug = 'test-company')),
((SELECT id FROM users WHERE email = 'user@test.com'), (SELECT id FROM roles WHERE name = 'operator'), (SELECT id FROM tenants WHERE slug = 'test-company'));

-- ==============================================
-- MIGRATION COMPLETE
-- ==============================================

-- Log migration completion
INSERT INTO audit_log (action, resource_type, details) VALUES
('migration_completed', 'schema', '{"migration": "login_hardening_schema_v2", "tables_created": 8, "indexes_created": 24}');
