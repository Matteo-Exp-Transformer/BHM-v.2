-- =============================================
-- FIX PRODUCTS TABLE FOREIGN KEY RELATIONSHIPS
-- Execute this in Supabase SQL Editor to fix remaining issues
-- =============================================

-- First, let's check if the products table has the right structure
-- and fix any missing foreign key constraints

-- Drop and recreate the products table with proper foreign keys
DROP TABLE IF EXISTS products CASCADE;

-- Recreate products table with all proper relationships
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  conservation_point_id UUID REFERENCES conservation_points(id) ON DELETE SET NULL,
  barcode VARCHAR(255),
  sku VARCHAR(255),
  supplier_name VARCHAR(255),
  purchase_date DATE,
  expiry_date DATE,
  quantity DECIMAL(10,3),
  unit VARCHAR(50),
  allergens TEXT[] DEFAULT '{}',
  label_photo_url TEXT,
  status VARCHAR(20) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT product_status_check CHECK (status IN ('active', 'expired', 'consumed', 'waste'))
);

-- Enable RLS on products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for products table
DROP POLICY IF EXISTS "Users can view company products" ON products;
CREATE POLICY "Users can view company products" ON products FOR SELECT
  USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Users can manage company products" ON products;
CREATE POLICY "Users can manage company products" ON products FOR ALL
  USING (company_id = get_user_company_id());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_company_id ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_department_id ON products(department_id);
CREATE INDEX IF NOT EXISTS idx_products_conservation_point_id ON products(conservation_point_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_expiry_date ON products(expiry_date);

-- Insert some test data with proper foreign key references
-- First get a company_id and product_category_id that exist
DO $$
DECLARE
    test_company_id UUID;
    test_category_id UUID;
    test_department_id UUID;
BEGIN
    -- Get the first company
    SELECT id INTO test_company_id FROM companies LIMIT 1;

    -- Get or create a test category
    INSERT INTO product_categories (company_id, name, description, temperature_requirement_min, temperature_requirement_max)
    VALUES (test_company_id, 'Latticini', 'Prodotti caseari e derivati del latte', 0, 4)
    ON CONFLICT (company_id, name) DO NOTHING;

    SELECT id INTO test_category_id FROM product_categories
    WHERE company_id = test_company_id AND name = 'Latticini' LIMIT 1;

    -- Get a department
    SELECT id INTO test_department_id FROM departments
    WHERE company_id = test_company_id LIMIT 1;

    -- Insert test products
    IF test_company_id IS NOT NULL AND test_category_id IS NOT NULL THEN
        INSERT INTO products (
            company_id,
            name,
            category_id,
            department_id,
            status,
            quantity,
            unit,
            expiry_date,
            notes
        ) VALUES
        (
            test_company_id,
            'Latte Fresco Intero',
            test_category_id,
            test_department_id,
            'active',
            10.0,
            'litri',
            CURRENT_DATE + INTERVAL '7 days',
            'Prodotto di test creato automaticamente'
        ),
        (
            test_company_id,
            'Parmigiano Reggiano',
            test_category_id,
            test_department_id,
            'active',
            2.5,
            'kg',
            CURRENT_DATE + INTERVAL '30 days',
            'Formaggio stagionato 24 mesi'
        ),
        (
            test_company_id,
            'Latte Scaduto Test',
            test_category_id,
            test_department_id,
            'expired',
            1.0,
            'litri',
            CURRENT_DATE - INTERVAL '2 days',
            'Prodotto scaduto per test'
        )
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

-- Verify the foreign key relationships work
SELECT
    p.id,
    p.name,
    pc.name as category_name,
    d.name as department_name
FROM products p
LEFT JOIN product_categories pc ON p.category_id = pc.id
LEFT JOIN departments d ON p.department_id = d.id
LIMIT 5;

SELECT 'Products table recreated with proper foreign key relationships!' as status;