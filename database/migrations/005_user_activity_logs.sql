-- =====================================================
-- Migration 005: User Activity Logs Table
-- Description: Complete user activity tracking system
-- Created: 2025-01-10
-- Author: Claude Code
-- =====================================================

-- Drop table if exists (for clean migration)
DROP TABLE IF EXISTS public.user_activity_logs CASCADE;

-- =====================================================
-- TABLE: user_activity_logs
-- =====================================================
CREATE TABLE public.user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- User & Company
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,

    -- Session Reference
    session_id UUID REFERENCES public.user_sessions(id) ON DELETE SET NULL,

    -- Activity Type
    activity_type VARCHAR(50) NOT NULL CHECK (
        activity_type IN (
            'session_start',
            'session_end',
            'task_completed',
            'product_added',
            'product_updated',
            'product_deleted',
            'shopping_list_created',
            'shopping_list_updated',
            'shopping_list_completed',
            'department_created',
            'staff_added',
            'conservation_point_created',
            'maintenance_task_created',
            'temperature_reading_added',
            'note_created',
            'non_conformity_reported',
            'page_view',
            'export_data'
        )
    ),

    -- Activity Data (flexible JSONB)
    activity_data JSONB DEFAULT '{}'::jsonb,

    -- Entity Reference (optional)
    entity_type VARCHAR(50) CHECK (
        entity_type IS NULL OR entity_type IN (
            'maintenance_task',
            'generic_task',
            'product',
            'shopping_list',
            'department',
            'staff',
            'conservation_point',
            'temperature_reading',
            'note',
            'non_conformity'
        )
    ),
    entity_id UUID,

    -- Metadata
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    ip_address INET,
    user_agent TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- INDEXES for Performance
-- =====================================================

-- User queries: "show my activities"
CREATE INDEX idx_activity_user_id ON public.user_activity_logs(user_id);

-- Company queries: "show all company activities"
CREATE INDEX idx_activity_company_id ON public.user_activity_logs(company_id);

-- Session queries: "activities in this session"
CREATE INDEX idx_activity_session_id ON public.user_activity_logs(session_id);

-- Activity type filtering: "show all task completions"
CREATE INDEX idx_activity_type ON public.user_activity_logs(activity_type);

-- Timeline queries: "activities today" (most common query)
CREATE INDEX idx_activity_timestamp ON public.user_activity_logs(timestamp DESC);

-- Entity tracking: "activities on this product"
CREATE INDEX idx_activity_entity ON public.user_activity_logs(entity_type, entity_id) WHERE entity_type IS NOT NULL;

-- Composite index for filtered queries: "company activities by type"
CREATE INDEX idx_activity_company_type_time ON public.user_activity_logs(company_id, activity_type, timestamp DESC);

-- JSONB index for queries on activity_data
CREATE INDEX idx_activity_data ON public.user_activity_logs USING GIN(activity_data);

-- =====================================================
-- COMMENTS for Documentation
-- =====================================================
COMMENT ON TABLE public.user_activity_logs IS 'Complete audit trail of all user activities in the application';
COMMENT ON COLUMN public.user_activity_logs.activity_type IS 'Type of activity performed (session, task, product, etc.)';
COMMENT ON COLUMN public.user_activity_logs.activity_data IS 'Flexible JSONB field containing activity-specific data';
COMMENT ON COLUMN public.user_activity_logs.entity_type IS 'Type of entity the activity relates to (optional)';
COMMENT ON COLUMN public.user_activity_logs.entity_id IS 'ID of the entity the activity relates to (optional)';
COMMENT ON COLUMN public.user_activity_logs.timestamp IS 'When the activity occurred';
COMMENT ON COLUMN public.user_activity_logs.ip_address IS 'IP address of the user (for security audit)';
COMMENT ON COLUMN public.user_activity_logs.user_agent IS 'Browser/device information';

-- =====================================================
-- EXAMPLE activity_data STRUCTURES
-- =====================================================

-- session_start:
-- {
--   "login_method": "email",
--   "device_type": "desktop"
-- }

-- session_end:
-- {
--   "duration_minutes": 45,
--   "logout_type": "manual"
-- }

-- task_completed (maintenance):
-- {
--   "task_name": "Rilevamento Temperature Frigo 1",
--   "task_type": "temperature",
--   "department_name": "Cucina",
--   "conservation_point_name": "Frigo 1",
--   "completed_value": 4.5,
--   "notes": "Tutto ok"
-- }

-- task_completed (generic):
-- {
--   "task_name": "Formazione Staff",
--   "task_type": "generic",
--   "department_name": "Sala",
--   "notes": "Completata formazione HACCP"
-- }

-- product_added:
-- {
--   "product_name": "Mozzarella Bufala",
--   "category": "Latticini",
--   "department": "Cucina",
--   "conservation_point": "Frigo 1",
--   "quantity": 10,
--   "unit": "kg"
-- }

-- shopping_list_created:
-- {
--   "list_name": "Lista Spesa - 10 Gen 2025",
--   "items_count": 15,
--   "categories": ["Latticini", "Carne", "Verdure"]
-- }

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT SELECT, INSERT ON public.user_activity_logs TO authenticated;
GRANT SELECT ON public.user_activity_logs TO anon;

-- Note: No UPDATE or DELETE permissions (audit trail is immutable)
