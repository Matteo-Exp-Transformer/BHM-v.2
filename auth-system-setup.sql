-- =============================================
-- HACCP Business Manager - Authentication System Setup
-- Execute these SQL statements in Supabase SQL Editor
-- =============================================

-- Step 1: Add new columns to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES staff(id),
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'guest';

-- Step 2: Add email column to staff table (if not exists)
ALTER TABLE staff
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Step 2.1: Add additional staff management columns
ALTER TABLE staff
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS hire_date DATE,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS haccp_certification JSONB,
ADD COLUMN IF NOT EXISTS department_assignments TEXT[];

-- Step 3: Create departments table if not exists
CREATE TABLE IF NOT EXISTS departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(company_id, name)
);

-- Step 4: Create performance indexes
CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_staff_id ON user_profiles(staff_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_departments_company_id ON departments(company_id);
CREATE INDEX IF NOT EXISTS idx_departments_active ON departments(is_active);

-- Step 4: Insert test company data
INSERT INTO companies (id, name, address, staff_count, email)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'Al Ritrovo SRL',
  'Via centotrecento 1/1b Bologna 40128',
  5,
  '000@gmail.com'
) ON CONFLICT (id) DO NOTHING;

-- Step 5: Insert test staff data
INSERT INTO staff (company_id, name, role, category, email) VALUES
(
  '123e4567-e89b-12d3-a456-426614174000',
  'Matteo Cavallaro',
  'admin',
  'Amministratore',
  'matteocavallaro90@gmail.com'  -- REPLACE WITH YOUR ACTUAL EMAIL
),
(
  '123e4567-e89b-12d3-a456-426614174000',
  'Test Responsabile',
  'responsabile',
  'Banconisti',
  'responsabile@test.com'
),
(
  '123e4567-e89b-12d3-a456-426614174000',
  'Test Dipendente',
  'dipendente',
  'Cuochi',
  'dipendente@test.com'
),
(
  '123e4567-e89b-12d3-a456-426614174000',
  'Test Collaboratore',
  'collaboratore',
  'Camerieri',
  'collaboratore@test.com'
)
ON CONFLICT (email) DO NOTHING;

-- Step 6: Create a function to auto-link user profiles with staff
CREATE OR REPLACE FUNCTION link_user_profile_to_staff()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if email exists in staff table
  UPDATE user_profiles
  SET
    staff_id = staff.id,
    role = staff.role,
    company_id = staff.company_id
  FROM staff
  WHERE user_profiles.email = staff.email
    AND user_profiles.id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create trigger to auto-link new user profiles
DROP TRIGGER IF EXISTS trigger_link_user_profile_to_staff ON user_profiles;
CREATE TRIGGER trigger_link_user_profile_to_staff
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION link_user_profile_to_staff();

-- Step 8: Update existing user profiles to link with staff (if any exist)
UPDATE user_profiles
SET
  staff_id = staff.id,
  role = staff.role,
  company_id = staff.company_id
FROM staff
WHERE user_profiles.email = staff.email
  AND user_profiles.staff_id IS NULL;

-- Step 9: Update RLS policies for user_profiles table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Create new policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (clerk_user_id = auth.jwt() ->> 'sub');

-- Step 10: Create RLS policies for staff table
-- Enable RLS on staff table
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Staff can view company staff" ON staff;
DROP POLICY IF EXISTS "Admin can manage staff" ON staff;

-- Create new policies
CREATE POLICY "Staff can view company staff" ON staff
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM user_profiles
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Admin can manage staff" ON staff
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM user_profiles
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
        AND role IN ('admin', 'responsabile')
    )
  );

-- Step 11: Create RLS policies for departments table
-- Enable RLS on departments table
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view company departments" ON departments;
DROP POLICY IF EXISTS "Admin can manage departments" ON departments;

-- Create new policies
CREATE POLICY "Users can view company departments" ON departments
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM user_profiles
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Admin can manage departments" ON departments
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM user_profiles
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
        AND role IN ('admin', 'responsabile')
    )
  );

-- =============================================
-- Verification Queries
-- =============================================

-- Query 1: Check if columns were added correctly
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles'
  AND column_name IN ('staff_id', 'role');

-- Query 2: Check staff table structure
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'staff'
  AND column_name = 'email';

-- Query 3: View test data
SELECT
  id,
  name,
  role,
  category,
  email,
  company_id
FROM staff
WHERE company_id = '123e4567-e89b-12d3-a456-426614174000';

-- Query 4: Check indexes
SELECT
  indexname,
  tablename,
  indexdef
FROM pg_indexes
WHERE tablename IN ('staff', 'user_profiles')
  AND indexname LIKE 'idx_%';

-- =============================================
-- Testing Instructions
-- =============================================

/*
TESTING STEPS:

1. Execute all SQL statements above in Supabase SQL Editor

2. Replace 'matteocavallaro90@gmail.com' with your actual email in staff insert

3. Test the authentication flow:
   a) Sign up/login with an email that exists in staff table
   b) Should get correct role assignment (admin, responsabile, etc.)
   c) Should see appropriate tabs in navigation

   d) Sign up/login with an email NOT in staff table
   e) Should get 'guest' role
   f) Should see "Access Denied" message

4. Verify route protection:
   a) Admin user should access all routes
   b) Responsabile should access /gestione but not /impostazioni
   c) Dipendente/Collaboratore should not access /gestione or /impostazioni
   d) Guest should be denied access to protected routes

5. Check console for any errors and verify auth hook is working

Expected Behavior:
- ✅ User with email in staff → Correct role assignment
- ✅ User with email NOT in staff → Guest role + access denied
- ✅ Route protection working (gestione only admin/responsabile)
- ✅ Performance acceptable (<2s for auth check)
- ✅ UI responsive on mobile
- ✅ No errors in console
*/