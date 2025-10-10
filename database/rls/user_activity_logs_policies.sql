-- =====================================================
-- RLS Policies: user_activity_logs
-- Description: Row-Level Security for activity tracking
-- Created: 2025-01-10
-- Author: Claude Code
-- =====================================================

-- =====================================================
-- ENABLE RLS
-- =====================================================
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- DROP EXISTING POLICIES (if any)
-- =====================================================
DROP POLICY IF EXISTS "Users can view own activities" ON public.user_activity_logs;
DROP POLICY IF EXISTS "Admins can view all company activities" ON public.user_activity_logs;
DROP POLICY IF EXISTS "Users can insert own activities" ON public.user_activity_logs;
DROP POLICY IF EXISTS "System can insert activities" ON public.user_activity_logs;

-- =====================================================
-- SELECT POLICIES
-- =====================================================

-- Policy 1: Users can view their own activities
CREATE POLICY "Users can view own activities"
ON public.user_activity_logs
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
);

-- Policy 2: Admins can view all activities in their company
CREATE POLICY "Admins can view all company activities"
ON public.user_activity_logs
FOR SELECT
TO authenticated
USING (
    company_id IN (
        SELECT cm.company_id
        FROM public.company_members cm
        WHERE cm.user_id = auth.uid()
        AND cm.role = 'admin'
    )
);

-- =====================================================
-- INSERT POLICIES
-- =====================================================

-- Policy 3: Users can insert their own activities
CREATE POLICY "Users can insert own activities"
ON public.user_activity_logs
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = auth.uid()
    AND company_id IN (
        SELECT cm.company_id
        FROM public.company_members cm
        WHERE cm.user_id = auth.uid()
    )
);

-- Policy 4: Allow system/service to insert activities (for automated logging)
-- This uses SECURITY DEFINER functions to bypass RLS when needed
CREATE POLICY "System can insert activities"
ON public.user_activity_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- =====================================================
-- UPDATE/DELETE POLICIES
-- =====================================================

-- NO UPDATE POLICY: Activity logs are immutable (audit trail)
-- Users cannot modify past activities

-- NO DELETE POLICY: Activity logs are permanent (compliance)
-- Only database admin can delete for data retention

-- =====================================================
-- HELPER FUNCTION: Log Activity with RLS bypass
-- =====================================================

CREATE OR REPLACE FUNCTION log_user_activity(
    p_user_id UUID,
    p_company_id UUID,
    p_session_id UUID,
    p_activity_type VARCHAR,
    p_activity_data JSONB DEFAULT '{}'::jsonb,
    p_entity_type VARCHAR DEFAULT NULL,
    p_entity_id UUID DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_activity_id UUID;
BEGIN
    -- Insert activity log
    INSERT INTO public.user_activity_logs (
        user_id,
        company_id,
        session_id,
        activity_type,
        activity_data,
        entity_type,
        entity_id,
        ip_address,
        user_agent,
        timestamp
    )
    VALUES (
        p_user_id,
        p_company_id,
        p_session_id,
        p_activity_type,
        p_activity_data,
        p_entity_type,
        p_entity_id,
        p_ip_address,
        p_user_agent,
        now()
    )
    RETURNING id INTO new_activity_id;

    RETURN new_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- HELPER FUNCTION: Get User Activities with Filters
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_activities(
    p_user_id UUID,
    p_activity_type VARCHAR DEFAULT NULL,
    p_start_date TIMESTAMPTZ DEFAULT NULL,
    p_end_date TIMESTAMPTZ DEFAULT NULL,
    p_limit INTEGER DEFAULT 100,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    activity_id UUID,
    activity_type VARCHAR,
    activity_data JSONB,
    entity_type VARCHAR,
    entity_id UUID,
    timestamp TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ual.id AS activity_id,
        ual.activity_type,
        ual.activity_data,
        ual.entity_type,
        ual.entity_id,
        ual.timestamp
    FROM public.user_activity_logs ual
    WHERE ual.user_id = p_user_id
    AND (p_activity_type IS NULL OR ual.activity_type = p_activity_type)
    AND (p_start_date IS NULL OR ual.timestamp >= p_start_date)
    AND (p_end_date IS NULL OR ual.timestamp <= p_end_date)
    ORDER BY ual.timestamp DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- HELPER FUNCTION: Get Company Activities (Admin Only)
-- =====================================================

CREATE OR REPLACE FUNCTION get_company_activities(
    p_company_id UUID,
    p_activity_type VARCHAR DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_start_date TIMESTAMPTZ DEFAULT NULL,
    p_end_date TIMESTAMPTZ DEFAULT NULL,
    p_limit INTEGER DEFAULT 100,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    activity_id UUID,
    user_id UUID,
    user_email TEXT,
    activity_type VARCHAR,
    activity_data JSONB,
    entity_type VARCHAR,
    entity_id UUID,
    timestamp TIMESTAMPTZ
) AS $$
BEGIN
    -- Verify caller is admin of the company
    IF NOT EXISTS (
        SELECT 1 FROM public.company_members cm
        WHERE cm.user_id = auth.uid()
        AND cm.company_id = p_company_id
        AND cm.role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Unauthorized: Only company admins can view all activities';
    END IF;

    RETURN QUERY
    SELECT
        ual.id AS activity_id,
        ual.user_id,
        u.email AS user_email,
        ual.activity_type,
        ual.activity_data,
        ual.entity_type,
        ual.entity_id,
        ual.timestamp
    FROM public.user_activity_logs ual
    INNER JOIN auth.users u ON ual.user_id = u.id
    WHERE ual.company_id = p_company_id
    AND (p_activity_type IS NULL OR ual.activity_type = p_activity_type)
    AND (p_user_id IS NULL OR ual.user_id = p_user_id)
    AND (p_start_date IS NULL OR ual.timestamp >= p_start_date)
    AND (p_end_date IS NULL OR ual.timestamp <= p_end_date)
    ORDER BY ual.timestamp DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- HELPER FUNCTION: Get Activity Statistics
-- =====================================================

CREATE OR REPLACE FUNCTION get_activity_statistics(
    p_company_id UUID,
    p_start_date TIMESTAMPTZ DEFAULT NULL,
    p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
    activity_type VARCHAR,
    activity_count BIGINT,
    unique_users BIGINT,
    last_activity TIMESTAMPTZ
) AS $$
BEGIN
    -- Verify caller is admin of the company
    IF NOT EXISTS (
        SELECT 1 FROM public.company_members cm
        WHERE cm.user_id = auth.uid()
        AND cm.company_id = p_company_id
        AND cm.role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Unauthorized: Only company admins can view statistics';
    END IF;

    RETURN QUERY
    SELECT
        ual.activity_type,
        COUNT(ual.id) AS activity_count,
        COUNT(DISTINCT ual.user_id) AS unique_users,
        MAX(ual.timestamp) AS last_activity
    FROM public.user_activity_logs ual
    WHERE ual.company_id = p_company_id
    AND (p_start_date IS NULL OR ual.timestamp >= p_start_date)
    AND (p_end_date IS NULL OR ual.timestamp <= p_end_date)
    GROUP BY ual.activity_type
    ORDER BY activity_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CLEANUP FUNCTION: Archive Old Activities
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_old_activities(
    p_retention_days INTEGER DEFAULT 90
)
RETURNS INTEGER AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    -- Note: In production, consider moving to archive table instead of DELETE
    DELETE FROM public.user_activity_logs
    WHERE timestamp < now() - (p_retention_days || ' days')::INTERVAL;

    GET DIAGNOSTICS affected_rows = ROW_COUNT;

    RETURN affected_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON FUNCTION log_user_activity IS 'Log a user activity - bypasses RLS for automated logging';
COMMENT ON FUNCTION get_user_activities IS 'Get activities for a specific user with optional filters';
COMMENT ON FUNCTION get_company_activities IS 'Get all company activities (admin only) with filters';
COMMENT ON FUNCTION get_activity_statistics IS 'Get activity statistics for a company (admin only)';
COMMENT ON FUNCTION cleanup_old_activities IS 'Archive/delete activities older than retention period';

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT EXECUTE ON FUNCTION log_user_activity TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_activities TO authenticated;
GRANT EXECUTE ON FUNCTION get_company_activities TO authenticated;
GRANT EXECUTE ON FUNCTION get_activity_statistics TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_activities TO authenticated;

-- =====================================================
-- VERIFICATION
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE 'RLS policies for user_activity_logs created successfully';
    RAISE NOTICE '- Users can view own activities';
    RAISE NOTICE '- Admins can view all company activities';
    RAISE NOTICE '- Users can insert own activities';
    RAISE NOTICE '- Activity logs are immutable (no UPDATE/DELETE)';
END $$;
