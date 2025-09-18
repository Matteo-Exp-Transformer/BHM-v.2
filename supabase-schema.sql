-- Business HACCP Manager - Database Schema v1
-- This file contains the DDL for creating all required tables and RLS policies

-- Enable Row Level Security extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE conservation_point_type AS ENUM ('ambient', 'fridge', 'freezer', 'blast');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE maintenance_task_kind AS ENUM ('temperature', 'sanitization', 'defrosting');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE assignment_type AS ENUM ('user', 'role', 'category');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE severity_level AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE status_type AS ENUM ('open', 'in_progress', 'resolved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Drop tables if they exist (for development)
DROP TABLE IF EXISTS temperature_readings CASCADE;
DROP TABLE IF EXISTS non_conformities CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS product_categories CASCADE;
DROP TABLE IF EXISTS maintenance_tasks CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS conservation_points CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- Create companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    staff_count INTEGER NOT NULL CHECK (staff_count > 0),
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table (links Clerk users to companies)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create departments table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create staff table
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conservation_points table
CREATE TABLE conservation_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    setpoint_temp DECIMAL(5,2) NOT NULL,
    type conservation_point_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create maintenance_tasks table
CREATE TABLE maintenance_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    conservation_point_id UUID NOT NULL REFERENCES conservation_points(id) ON DELETE CASCADE,
    kind maintenance_task_kind NOT NULL,
    frequency VARCHAR(255) NOT NULL,
    assigned_to VARCHAR(255) NOT NULL,
    assignment_type assignment_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table (generic tasks not tied to conservation points)
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    frequency VARCHAR(255) NOT NULL,
    assigned_to VARCHAR(255) NOT NULL,
    assignment_type assignment_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_categories table (placeholder for future use)
CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table (placeholder for calendar functionality)
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notes table (placeholder)
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create temperature_readings table (placeholder)
CREATE TABLE temperature_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    conservation_point_id UUID NOT NULL REFERENCES conservation_points(id) ON DELETE CASCADE,
    temperature DECIMAL(5,2) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create non_conformities table (placeholder)
CREATE TABLE non_conformities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity severity_level NOT NULL,
    status status_type DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_user_profiles_clerk_user_id ON user_profiles(clerk_user_id);
CREATE INDEX idx_user_profiles_company_id ON user_profiles(company_id);
CREATE INDEX idx_departments_company_id ON departments(company_id);
CREATE INDEX idx_staff_company_id ON staff(company_id);
CREATE INDEX idx_conservation_points_company_id ON conservation_points(company_id);
CREATE INDEX idx_conservation_points_department_id ON conservation_points(department_id);
CREATE INDEX idx_maintenance_tasks_company_id ON maintenance_tasks(company_id);
CREATE INDEX idx_maintenance_tasks_conservation_point_id ON maintenance_tasks(conservation_point_id);
CREATE INDEX idx_tasks_company_id ON tasks(company_id);
CREATE INDEX idx_product_categories_company_id ON product_categories(company_id);
CREATE INDEX idx_events_company_id ON events(company_id);
CREATE INDEX idx_notes_company_id ON notes(company_id);
CREATE INDEX idx_temperature_readings_company_id ON temperature_readings(company_id);
CREATE INDEX idx_temperature_readings_conservation_point_id ON temperature_readings(conservation_point_id);
CREATE INDEX idx_non_conformities_company_id ON non_conformities(company_id);

-- Enable Row Level Security on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE conservation_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE temperature_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE non_conformities ENABLE ROW LEVEL SECURITY;

-- Function to get user's company_id from JWT
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT company_id 
    FROM user_profiles 
    WHERE clerk_user_id = auth.jwt() ->> 'sub';
$$;

-- Create RLS policies

-- Companies table - users can only see their own company
CREATE POLICY "Users can view their own company" ON companies
    FOR SELECT USING (id = get_user_company_id());

CREATE POLICY "Users can update their own company" ON companies
    FOR UPDATE USING (id = get_user_company_id());

-- User profiles - users can see and update their own profile
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (clerk_user_id = auth.jwt() ->> 'sub');

-- All other tables - company-based access control
CREATE POLICY "Company members can view departments" ON departments
    FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Company members can manage departments" ON departments
    FOR ALL USING (company_id = get_user_company_id());

CREATE POLICY "Company members can view staff" ON staff
    FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Company members can manage staff" ON staff
    FOR ALL USING (company_id = get_user_company_id());

CREATE POLICY "Company members can view conservation points" ON conservation_points
    FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Company members can manage conservation points" ON conservation_points
    FOR ALL USING (company_id = get_user_company_id());

CREATE POLICY "Company members can view maintenance tasks" ON maintenance_tasks
    FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Company members can manage maintenance tasks" ON maintenance_tasks
    FOR ALL USING (company_id = get_user_company_id());

CREATE POLICY "Company members can view tasks" ON tasks
    FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Company members can manage tasks" ON tasks
    FOR ALL USING (company_id = get_user_company_id());

CREATE POLICY "Company members can view product categories" ON product_categories
    FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Company members can manage product categories" ON product_categories
    FOR ALL USING (company_id = get_user_company_id());

CREATE POLICY "Company members can view events" ON events
    FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Company members can manage events" ON events
    FOR ALL USING (company_id = get_user_company_id());

CREATE POLICY "Company members can view notes" ON notes
    FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Company members can manage notes" ON notes
    FOR ALL USING (company_id = get_user_company_id());

CREATE POLICY "Company members can view temperature readings" ON temperature_readings
    FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Company members can manage temperature readings" ON temperature_readings
    FOR ALL USING (company_id = get_user_company_id());

CREATE POLICY "Company members can view non conformities" ON non_conformities
    FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Company members can manage non conformities" ON non_conformities
    FOR ALL USING (company_id = get_user_company_id());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conservation_points_updated_at BEFORE UPDATE ON conservation_points FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_tasks_updated_at BEFORE UPDATE ON maintenance_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON product_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_non_conformities_updated_at BEFORE UPDATE ON non_conformities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions (adjust according to your Supabase setup)
-- These will be configured in Supabase dashboard or through your specific auth setup

COMMENT ON TABLE companies IS 'Business companies using the HACCP system';
COMMENT ON TABLE user_profiles IS 'User profiles linked to Clerk authentication';
COMMENT ON TABLE departments IS 'Company departments/areas';
COMMENT ON TABLE staff IS 'Company staff members';
COMMENT ON TABLE conservation_points IS 'Temperature-controlled storage points';
COMMENT ON TABLE maintenance_tasks IS 'Scheduled maintenance tasks for conservation points';
COMMENT ON TABLE tasks IS 'General company tasks not tied to specific conservation points';
COMMENT ON TABLE product_categories IS 'Product categorization for tracking (placeholder)';
COMMENT ON TABLE events IS 'Calendar events (placeholder for future calendar functionality)';
COMMENT ON TABLE notes IS 'General notes and documentation (placeholder)';
COMMENT ON TABLE temperature_readings IS 'Temperature monitoring data (placeholder)';
COMMENT ON TABLE non_conformities IS 'HACCP non-conformity tracking (placeholder)';

-- Sample data for testing (optional - remove in production)
/*
INSERT INTO companies (name, address, staff_count, email) VALUES 
('Test Restaurant', 'Via Roma 1, Milano', 5, 'test@restaurant.it');

INSERT INTO user_profiles (clerk_user_id, company_id, email, first_name, last_name) VALUES 
('test_clerk_id', (SELECT id FROM companies WHERE name = 'Test Restaurant'), 'test@restaurant.it', 'Mario', 'Rossi');
*/

