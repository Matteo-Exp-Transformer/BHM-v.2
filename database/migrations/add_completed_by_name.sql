-- Migration: Add completed_by_name column to task_completions table
-- Date: 2025-01-12
-- Description: Adds a column to store the name of the user who completed a task for easier display

-- Add the column
ALTER TABLE IF EXISTS public.task_completions
ADD COLUMN IF NOT EXISTS completed_by_name TEXT;

-- Add a comment explaining the column
COMMENT ON COLUMN public.task_completions.completed_by_name IS 'Name of the user who completed the task (cached from auth.users metadata)';

