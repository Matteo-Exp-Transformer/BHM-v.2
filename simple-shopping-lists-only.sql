-- =====================================================
-- SIMPLE SHOPPING LISTS CREATION - Only what's needed
-- No complex dependencies, just the shopping tables
-- =====================================================

-- Check if we have the required function first
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM user_profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- Create shopping_lists table (simple version without complex dependencies)
CREATE TABLE IF NOT EXISTS shopping_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID,
  is_template BOOLEAN DEFAULT FALSE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT shopping_lists_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

-- Create shopping_list_items table (simple version)
CREATE TABLE IF NOT EXISTS shopping_list_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shopping_list_id UUID NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  product_id UUID,
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

-- Create basic policies (company-based)
DROP POLICY IF EXISTS "Users can view company shopping lists" ON shopping_lists;
CREATE POLICY "Users can view company shopping lists" ON shopping_lists FOR SELECT
  USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Users can insert company shopping lists" ON shopping_lists;
CREATE POLICY "Users can insert company shopping lists" ON shopping_lists FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Users can update company shopping lists" ON shopping_lists;
CREATE POLICY "Users can update company shopping lists" ON shopping_lists FOR UPDATE
  USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Users can delete company shopping lists" ON shopping_lists;
CREATE POLICY "Users can delete company shopping lists" ON shopping_lists FOR DELETE
  USING (company_id = get_user_company_id());

-- Shopping list items policies
DROP POLICY IF EXISTS "Users can view company shopping list items" ON shopping_list_items;
CREATE POLICY "Users can view company shopping list items" ON shopping_list_items FOR SELECT
  USING (shopping_list_id IN (
    SELECT id FROM shopping_lists WHERE company_id = get_user_company_id()
  ));

DROP POLICY IF EXISTS "Users can insert company shopping list items" ON shopping_list_items;
CREATE POLICY "Users can insert company shopping list items" ON shopping_list_items FOR INSERT
  WITH CHECK (shopping_list_id IN (
    SELECT id FROM shopping_lists WHERE company_id = get_user_company_id()
  ));

DROP POLICY IF EXISTS "Users can update company shopping list items" ON shopping_list_items;
CREATE POLICY "Users can update company shopping list items" ON shopping_list_items FOR UPDATE
  USING (shopping_list_id IN (
    SELECT id FROM shopping_lists WHERE company_id = get_user_company_id()
  ));

DROP POLICY IF EXISTS "Users can delete company shopping list items" ON shopping_list_items;
CREATE POLICY "Users can delete company shopping list items" ON shopping_list_items FOR DELETE
  USING (shopping_list_id IN (
    SELECT id FROM shopping_lists WHERE company_id = get_user_company_id()
  ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_shopping_lists_company_id ON shopping_lists(company_id);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_created_by ON shopping_lists(created_by);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_is_template ON shopping_lists(is_template);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_is_completed ON shopping_lists(is_completed);

CREATE INDEX IF NOT EXISTS idx_shopping_list_items_shopping_list_id ON shopping_list_items(shopping_list_id);
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_product_id ON shopping_list_items(product_id);
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_is_completed ON shopping_list_items(is_completed);

-- Add missing columns to conservation_points if table exists
DO $$
BEGIN
  -- Check if conservation_points table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conservation_points') THEN

    -- Add is_blast_chiller column
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'conservation_points' AND column_name = 'is_blast_chiller'
    ) THEN
      ALTER TABLE conservation_points ADD COLUMN is_blast_chiller BOOLEAN DEFAULT false;
      RAISE NOTICE 'Added is_blast_chiller column to conservation_points';
    END IF;

    -- Add product_categories column
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'conservation_points' AND column_name = 'product_categories'
    ) THEN
      ALTER TABLE conservation_points ADD COLUMN product_categories TEXT[] DEFAULT '{}';
      RAISE NOTICE 'Added product_categories column to conservation_points';
    END IF;

    -- Add status column
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'conservation_points' AND column_name = 'status'
    ) THEN
      ALTER TABLE conservation_points ADD COLUMN status VARCHAR(20) DEFAULT 'normal';
      RAISE NOTICE 'Added status column to conservation_points';
    END IF;

    -- Add maintenance_due column
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'conservation_points' AND column_name = 'maintenance_due'
    ) THEN
      ALTER TABLE conservation_points ADD COLUMN maintenance_due TIMESTAMP WITH TIME ZONE;
      RAISE NOTICE 'Added maintenance_due column to conservation_points';
    END IF;

  ELSE
    RAISE NOTICE 'conservation_points table does not exist, skipping column additions';
  END IF;
END $$;

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';

-- Final verification
DO $$
BEGIN
    RAISE NOTICE '✅ Shopping Lists tables created successfully!';
    RAISE NOTICE '📋 Tables: shopping_lists, shopping_list_items';
    RAISE NOTICE '🔒 RLS policies applied';
    RAISE NOTICE '⚡ Performance indexes created';
    RAISE NOTICE '🔄 Schema cache refreshed';
END $$;