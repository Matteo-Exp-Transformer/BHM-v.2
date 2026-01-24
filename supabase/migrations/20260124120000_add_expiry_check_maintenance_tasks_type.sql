-- Migration: Add 'expiry_check' to maintenance_tasks.type CHECK constraint
-- Controllo Scadenze was incorrectly stored as 'temperature'; now use 'expiry_check'
-- so it appears correctly in ScheduledMaintenanceCard and is distinguishable from
-- Rilevamento Temperature.

-- Drop existing CHECK (Postgres names it {table}_{column}_check when inline)
ALTER TABLE public.maintenance_tasks
  DROP CONSTRAINT IF EXISTS maintenance_tasks_type_check;

-- Re-add with expiry_check included
ALTER TABLE public.maintenance_tasks
  ADD CONSTRAINT maintenance_tasks_type_check
  CHECK (type IN ('temperature', 'sanitization', 'defrosting', 'expiry_check'));

COMMENT ON CONSTRAINT maintenance_tasks_type_check ON public.maintenance_tasks IS
  'Obbligatorie: temperature, sanitization, defrosting, expiry_check (Controllo Scadenze)';
