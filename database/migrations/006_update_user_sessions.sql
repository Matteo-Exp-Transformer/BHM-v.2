-- =====================================================
-- Migration 006: Update user_sessions for Activity Tracking
-- Description: Add session tracking fields
-- Created: 2025-01-10
-- Author: Claude Code
-- =====================================================

-- =====================================================
-- ADD NEW COLUMNS to user_sessions
-- =====================================================

-- Session timing
ALTER TABLE public.user_sessions
ADD COLUMN IF NOT EXISTS session_start TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.user_sessions
ADD COLUMN IF NOT EXISTS session_end TIMESTAMPTZ;

ALTER TABLE public.user_sessions
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMPTZ NOT NULL DEFAULT now();

-- Session status
ALTER TABLE public.user_sessions
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Metadata for security audit
ALTER TABLE public.user_sessions
ADD COLUMN IF NOT EXISTS ip_address INET;

ALTER TABLE public.user_sessions
ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- =====================================================
-- UPDATE EXISTING ROWS (backfill)
-- =====================================================

-- Set session_start to created_at for existing sessions
UPDATE public.user_sessions
SET session_start = created_at
WHERE session_start IS NULL OR session_start = created_at;

-- Set last_activity to updated_at for existing sessions
UPDATE public.user_sessions
SET last_activity = updated_at
WHERE last_activity IS NULL OR last_activity = updated_at;

-- Mark old sessions as inactive (older than 30 days)
UPDATE public.user_sessions
SET is_active = false,
    session_end = updated_at
WHERE updated_at < now() - INTERVAL '30 days'
AND is_active = true;

-- =====================================================
-- CREATE TRIGGER: Auto-update last_activity
-- =====================================================

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_session_last_activity ON public.user_sessions;

-- Create or replace trigger function
CREATE OR REPLACE FUNCTION update_session_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_activity = now();
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (only on UPDATE, not INSERT)
CREATE TRIGGER update_session_last_activity
    BEFORE UPDATE ON public.user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_session_last_activity();

-- =====================================================
-- CREATE FUNCTION: End Session
-- =====================================================

CREATE OR REPLACE FUNCTION end_user_session(
    p_session_id UUID,
    p_logout_type VARCHAR DEFAULT 'manual'
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.user_sessions
    SET
        is_active = false,
        session_end = now(),
        updated_at = now()
    WHERE id = p_session_id
    AND is_active = true;

    -- Log the session end activity
    INSERT INTO public.user_activity_logs (
        user_id,
        company_id,
        session_id,
        activity_type,
        activity_data
    )
    SELECT
        user_id,
        active_company_id,
        id,
        'session_end',
        jsonb_build_object(
            'logout_type', p_logout_type,
            'duration_minutes', EXTRACT(EPOCH FROM (now() - session_start)) / 60
        )
    FROM public.user_sessions
    WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CREATE FUNCTION: Get Active Sessions
-- =====================================================

CREATE OR REPLACE FUNCTION get_active_sessions(
    p_company_id UUID
)
RETURNS TABLE (
    session_id UUID,
    user_id UUID,
    user_email TEXT,
    session_start TIMESTAMPTZ,
    last_activity TIMESTAMPTZ,
    duration_minutes NUMERIC,
    ip_address INET,
    user_agent TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id AS session_id,
        s.user_id,
        u.email AS user_email,
        s.session_start,
        s.last_activity,
        EXTRACT(EPOCH FROM (now() - s.session_start)) / 60 AS duration_minutes,
        s.ip_address,
        s.user_agent
    FROM public.user_sessions s
    INNER JOIN auth.users u ON s.user_id = u.id
    WHERE s.active_company_id = p_company_id
    AND s.is_active = true
    ORDER BY s.session_start DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CREATE FUNCTION: Cleanup Inactive Sessions
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_inactive_sessions(
    p_inactivity_minutes INTEGER DEFAULT 30
)
RETURNS INTEGER AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    -- Mark sessions as inactive if no activity for p_inactivity_minutes
    UPDATE public.user_sessions
    SET
        is_active = false,
        session_end = last_activity,
        updated_at = now()
    WHERE is_active = true
    AND last_activity < now() - (p_inactivity_minutes || ' minutes')::INTERVAL;

    GET DIAGNOSTICS affected_rows = ROW_COUNT;

    -- Log cleanup activity
    INSERT INTO public.user_activity_logs (
        user_id,
        company_id,
        session_id,
        activity_type,
        activity_data
    )
    SELECT
        user_id,
        active_company_id,
        id,
        'session_end',
        jsonb_build_object(
            'logout_type', 'timeout',
            'duration_minutes', EXTRACT(EPOCH FROM (session_end - session_start)) / 60
        )
    FROM public.user_sessions
    WHERE is_active = false
    AND session_end >= now() - INTERVAL '1 minute';

    RETURN affected_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CREATE INDEXES
-- =====================================================

-- Active sessions by company
CREATE INDEX IF NOT EXISTS idx_sessions_active
ON public.user_sessions(active_company_id, is_active)
WHERE is_active = true;

-- Session by user
CREATE INDEX IF NOT EXISTS idx_sessions_user_id
ON public.user_sessions(user_id);

-- Last activity for timeout detection
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity
ON public.user_sessions(last_activity DESC)
WHERE is_active = true;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON COLUMN public.user_sessions.session_start IS 'When the user session started (login time)';
COMMENT ON COLUMN public.user_sessions.session_end IS 'When the session ended (logout/timeout) - NULL if active';
COMMENT ON COLUMN public.user_sessions.last_activity IS 'Last recorded user activity timestamp';
COMMENT ON COLUMN public.user_sessions.is_active IS 'Whether the session is currently active';
COMMENT ON COLUMN public.user_sessions.ip_address IS 'IP address from which the session originated';
COMMENT ON COLUMN public.user_sessions.user_agent IS 'Browser/device user agent string';

COMMENT ON FUNCTION end_user_session(UUID, VARCHAR) IS 'Ends a user session and logs the activity';
COMMENT ON FUNCTION get_active_sessions(UUID) IS 'Returns all active sessions for a company';
COMMENT ON FUNCTION cleanup_inactive_sessions(INTEGER) IS 'Marks inactive sessions as ended based on inactivity timeout';

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT EXECUTE ON FUNCTION end_user_session(UUID, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_sessions(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_inactive_sessions(INTEGER) TO authenticated;
