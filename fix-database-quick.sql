-- =============================================
-- Quick Fix for Database Issues
-- Execute this first to resolve immediate errors
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create companies table first (required by all other tables)
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  staff_count INTEGER DEFAULT 0,
  email VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'guest',
  staff_id UUID, -- Will be linked after staff table is created
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Create staff table
CREATE TABLE IF NOT EXISTS staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'dipendente',
  category VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Create departments table
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

-- 5. Add foreign key constraint for staff_id in user_profiles
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

-- 6. Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- 7. Create basic RLS policies
-- Helper function to get user's company_id
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM user_profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'
$$ LANGUAGE SQL SECURITY DEFINER;

-- User profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT
  USING (clerk_user_id = auth.jwt() ->> 'sub');

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE
  USING (clerk_user_id = auth.jwt() ->> 'sub');

DROP POLICY IF EXISTS "System can insert user profiles" ON user_profiles;
CREATE POLICY "System can insert user profiles" ON user_profiles FOR INSERT
  WITH CHECK (true);

-- Staff policies
DROP POLICY IF EXISTS "Users can view company staff" ON staff;
CREATE POLICY "Users can view company staff" ON staff FOR SELECT
  USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Admin can manage staff" ON staff;
CREATE POLICY "Admin can manage staff" ON staff FOR ALL
  USING (
    company_id = get_user_company_id() AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
      AND role IN ('admin', 'responsabile')
    )
  );

-- Departments policies
DROP POLICY IF EXISTS "Users can view company departments" ON departments;
CREATE POLICY "Users can view company departments" ON departments FOR SELECT
  USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Admin can manage departments" ON departments;
CREATE POLICY "Admin can manage departments" ON departments FOR ALL
  USING (
    company_id = get_user_company_id() AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
      AND role IN ('admin', 'responsabile')
    )
  );

-- 8. Insert test data
INSERT INTO companies (id, name, address, staff_count, email) VALUES
('123e4567-e89b-12d3-a456-426614174000', 'Al Ritrovo SRL', 'Via centotrecento 1/1b Bologna 40128', 5, '000@gmail.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO staff (id, company_id, name, role, category, email) VALUES
('223e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174000', 'Admin User', 'admin', 'Amministratore', '0cavuz0@gmail.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO departments (id, company_id, name, description) VALUES
('d1e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174000', 'Cucina', 'Area preparazione e cottura cibi'),
('d2e4567-e89b-12d3-a456-426614174002', '123e4567-e89b-12d3-a456-426614174000', 'Bancone', 'Area servizio al banco'),
('d3e4567-e89b-12d3-a456-426614174003', '123e4567-e89b-12d3-a456-426614174000', 'Sala', 'Area servizio ai tavoli'),
('d4e4567-e89b-12d3-a456-426614174004', '123e4567-e89b-12d3-a456-426614174000', 'Magazzino', 'Area stoccaggio prodotti')
ON CONFLICT (id) DO NOTHING;

-- 9. Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_clerk_user_id ON user_profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_company_id ON user_profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email);
CREATE INDEX IF NOT EXISTS idx_staff_company_id ON staff(company_id);
CREATE INDEX IF NOT EXISTS idx_departments_company_id ON departments(company_id);

SELECT 'Quick database fix completed! Please execute the full schema script next.' as status;