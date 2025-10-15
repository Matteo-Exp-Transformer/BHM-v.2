-- =====================================================
-- Migration 008: Add product_transferred Activity Type
-- Description: Extend user_activity_logs CHECK constraint
-- Created: 2025-01-14
-- Author: Agent 1 - Backend Specialist
-- Priority: HIGH (enables Product Transfer tracking)
-- =====================================================

-- Drop existing constraint
ALTER TABLE public.user_activity_logs
DROP CONSTRAINT IF EXISTS user_activity_logs_activity_type_check;

-- Recreate constraint with product_transferred included
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
        'product_transferred',        -- ⭐ NEW: Product transfer between conservation points
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
-- COMMENT for Documentation
-- =====================================================
COMMENT ON CONSTRAINT user_activity_logs_activity_type_check ON public.user_activity_logs IS
'Activity type constraint - Updated to include product_transferred for tracking product movements between conservation points';

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

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this to verify the constraint was updated:
-- 
-- SELECT conname, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conname = 'user_activity_logs_activity_type_check';

-- =====================================================
-- END Migration 008
-- =====================================================

