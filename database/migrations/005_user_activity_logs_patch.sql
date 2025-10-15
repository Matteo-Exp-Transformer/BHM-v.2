-- =====================================================
-- Migration 005 PATCH: Add product_transferred to activity_type
-- Description: Adds missing 'product_transferred' activity type
-- Created: 2025-01-14
-- Author: Agent 1 (Backend Specialist)
-- =====================================================

-- Drop existing constraint
ALTER TABLE public.user_activity_logs
DROP CONSTRAINT IF EXISTS user_activity_logs_activity_type_check;

-- Re-create constraint with product_transferred included
ALTER TABLE public.user_activity_logs
ADD CONSTRAINT user_activity_logs_activity_type_check
CHECK (
    activity_type IN (
        'session_start',
        'session_end',
        'task_completed',
        'product_added',
        'product_updated',
        'product_deleted',
        'product_transferred',  -- ✅ ADDED
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
);

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON CONSTRAINT user_activity_logs_activity_type_check ON public.user_activity_logs 
IS 'Allowed activity types including product_transferred for tracking product movements';

-- =====================================================
-- EXAMPLE activity_data for product_transferred
-- =====================================================

-- product_transferred:
-- {
--   "product_id": "uuid",
--   "product_name": "Parmigiano Reggiano",
--   "from_conservation_point_id": "uuid-frigo1",
--   "from_conservation_point_name": "Frigo 1 - Magazzino",
--   "to_conservation_point_id": "uuid-frigo2",
--   "to_conservation_point_name": "Frigo 2 - Cucina",
--   "from_department_id": "uuid-magazzino",
--   "from_department_name": "Magazzino",
--   "to_department_id": "uuid-cucina",
--   "to_department_name": "Cucina",
--   "quantity_transferred": 5,
--   "unit": "kg",
--   "transfer_reason": "Richiesta chef per servizio cena",
--   "transfer_notes": "Urgente per menu degustazione",
--   "authorized_by_id": "uuid-responsabile",
--   "authorized_by_name": "Mario Rossi"
-- }

