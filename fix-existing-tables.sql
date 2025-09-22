-- =====================================================
-- FIX FOR EXISTING TABLES - Quick Column Addition
-- Use this if tables already exist but missing columns
-- =====================================================

-- Add missing columns to conservation_points
DO $$
BEGIN
  -- Add is_blast_chiller column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conservation_points' AND column_name = 'is_blast_chiller'
  ) THEN
    ALTER TABLE conservation_points ADD COLUMN is_blast_chiller BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added is_blast_chiller column to conservation_points';
  ELSE
    RAISE NOTICE 'Column is_blast_chiller already exists in conservation_points';
  END IF;

  -- Add product_categories column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conservation_points' AND column_name = 'product_categories'
  ) THEN
    ALTER TABLE conservation_points ADD COLUMN product_categories TEXT[] DEFAULT '{}';
    RAISE NOTICE 'Added product_categories column to conservation_points';
  ELSE
    RAISE NOTICE 'Column product_categories already exists in conservation_points';
  END IF;

  -- Add status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conservation_points' AND column_name = 'status'
  ) THEN
    ALTER TABLE conservation_points ADD COLUMN status VARCHAR(20) DEFAULT 'normal';
    RAISE NOTICE 'Added status column to conservation_points';
  ELSE
    RAISE NOTICE 'Column status already exists in conservation_points';
  END IF;

  -- Add maintenance_due column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conservation_points' AND column_name = 'maintenance_due'
  ) THEN
    ALTER TABLE conservation_points ADD COLUMN maintenance_due TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE 'Added maintenance_due column to conservation_points';
  ELSE
    RAISE NOTICE 'Column maintenance_due already exists in conservation_points';
  END IF;
END $$;

-- Create shopping_lists tables if missing
CREATE TABLE IF NOT EXISTS shopping_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT,
  is_template BOOLEAN DEFAULT FALSE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT shopping_lists_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
  CONSTRAINT shopping_lists_completed_at_check CHECK (
    (is_completed = TRUE AND completed_at IS NOT NULL) OR
    (is_completed = FALSE AND completed_at IS NULL)
  )
);

CREATE TABLE IF NOT EXISTS shopping_list_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shopping_list_id UUID NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  category_name VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,3) NOT NULL DEFAULT 1,
  unit VARCHAR(50),
  notes TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT shopping_list_items_quantity_positive CHECK (quantity > 0),
  CONSTRAINT shopping_list_items_product_name_not_empty CHECK (LENGTH(TRIM(product_name)) > 0),
  CONSTRAINT shopping_list_items_category_name_not_empty CHECK (LENGTH(TRIM(category_name)) > 0)
);

-- Enable RLS
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;

-- Create policies for shopping lists
DROP POLICY IF EXISTS "Users can view company shopping lists" ON shopping_lists;
CREATE POLICY "Users can view company shopping lists" ON shopping_lists FOR SELECT
  USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Users can manage company shopping lists" ON shopping_lists;
CREATE POLICY "Users can manage company shopping lists" ON shopping_lists FOR ALL
  USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Users can view company shopping list items" ON shopping_list_items;
CREATE POLICY "Users can view company shopping list items" ON shopping_list_items FOR SELECT
  USING (shopping_list_id IN (
    SELECT id FROM shopping_lists WHERE company_id = get_user_company_id()
  ));

DROP POLICY IF EXISTS "Users can manage company shopping list items" ON shopping_list_items;
CREATE POLICY "Users can manage company shopping list items" ON shopping_list_items FOR ALL
  USING (shopping_list_id IN (
    SELECT id FROM shopping_lists WHERE company_id = get_user_company_id()
  ));

-- Force schema refresh
NOTIFY pgrst, 'reload schema';

-- Completion message
DO $$
BEGIN
    RAISE NOTICE '✅ Tables fixed successfully!';
    RAISE NOTICE '📋 Shopping lists tables created';
    RAISE NOTICE '🔧 Missing columns added to conservation_points';
    RAISE NOTICE '🔒 RLS policies applied';
END $$;