-- =============================================
-- FIX DATABASE ERROR - Execute this to resolve the staff_id constraint issue
-- =============================================

-- First, let's check if the staff_id column exists and add it if missing
DO $$
BEGIN
  -- Add staff_id column to user_profiles if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'staff_id'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN staff_id UUID;
  END IF;
END $$;

-- Now add the foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_user_profiles_staff'
  ) THEN
    ALTER TABLE user_profiles
    ADD CONSTRAINT fk_user_profiles_staff
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Also add role column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN role VARCHAR(50) DEFAULT 'guest';
  END IF;
END $$;

-- Add email column to staff if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff' AND column_name = 'email'
  ) THEN
    ALTER TABLE staff ADD COLUMN email VARCHAR(255);
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_user_profiles_staff_id ON user_profiles(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email);

SELECT 'Database error fixed successfully!' as status;