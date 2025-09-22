-- =====================================================
-- SHOPPING LISTS COMPLETE SETUP - Single Query
-- Fixes all issues identified by Supabase agent
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CREATE PRODUCTS TABLE (if missing)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    conservation_point_id UUID,
    barcode VARCHAR(255),
    sku VARCHAR(255),
    supplier_name VARCHAR(255),
    purchase_date TIMESTAMP WITH TIME ZONE,
    expiry_date TIMESTAMP WITH TIME ZONE,
    quantity NUMERIC DEFAULT 1,
    unit VARCHAR(50) DEFAULT 'pz',
    allergens TEXT[] DEFAULT '{}',
    label_photo_url TEXT,
    status VARCHAR(50) DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS for products if table was created
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. CREATE PRODUCT_CATEGORIES TABLE (if missing)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    temperature_requirements JSONB,
    default_expiry_days INTEGER,
    allergen_info TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(company_id, name)
);

-- Enable RLS for product_categories if table was created
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. CREATE SHOPPING LISTS TABLES
-- =====================================================

-- Create shopping_lists table
CREATE TABLE IF NOT EXISTS public.shopping_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE RESTRICT,
    is_template BOOLEAN DEFAULT FALSE,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,

    -- Constraints
    CONSTRAINT shopping_lists_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT shopping_lists_completed_at_check CHECK (
        (is_completed = TRUE AND completed_at IS NOT NULL) OR
        (is_completed = FALSE AND completed_at IS NULL)
    )
);

-- Create shopping_list_items table
CREATE TABLE IF NOT EXISTS public.shopping_list_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shopping_list_id UUID NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    category_name VARCHAR(255) NOT NULL,
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit VARCHAR(50),
    notes TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,

    -- Constraints
    CONSTRAINT shopping_list_items_quantity_positive CHECK (quantity > 0),
    CONSTRAINT shopping_list_items_product_name_not_empty CHECK (LENGTH(TRIM(product_name)) > 0),
    CONSTRAINT shopping_list_items_category_name_not_empty CHECK (LENGTH(TRIM(category_name)) > 0),
    CONSTRAINT shopping_list_items_completed_at_check CHECK (
        (is_completed = TRUE AND completed_at IS NOT NULL) OR
        (is_completed = FALSE AND completed_at IS NULL)
    )
);

-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. CREATE UPDATED_AT TRIGGER FUNCTION (Safe version)
-- =====================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. RLS POLICIES (Corrected as per agent suggestions)
-- =====================================================

-- Shopping Lists Policies
DROP POLICY IF EXISTS "shopping_lists_select_policy" ON public.shopping_lists;
CREATE POLICY "shopping_lists_select_policy" ON public.shopping_lists
    FOR SELECT TO authenticated
    USING (
        company_id IN (
            SELECT company_id FROM public.user_profiles WHERE id = (SELECT auth.uid())
        )
    );

DROP POLICY IF EXISTS "shopping_lists_insert_policy" ON public.shopping_lists;
CREATE POLICY "shopping_lists_insert_policy" ON public.shopping_lists
    FOR INSERT TO authenticated
    WITH CHECK (
        company_id IN (
            SELECT company_id FROM public.user_profiles WHERE id = (SELECT auth.uid())
        )
        AND created_by = (SELECT auth.uid())
    );

DROP POLICY IF EXISTS "shopping_lists_update_policy" ON public.shopping_lists;
CREATE POLICY "shopping_lists_update_policy" ON public.shopping_lists
    FOR UPDATE TO authenticated
    USING (
        company_id IN (
            SELECT company_id FROM public.user_profiles WHERE id = (SELECT auth.uid())
        )
    )
    WITH CHECK (
        company_id IN (
            SELECT company_id FROM public.user_profiles WHERE id = (SELECT auth.uid())
        )
    );

DROP POLICY IF EXISTS "shopping_lists_delete_policy" ON public.shopping_lists;
CREATE POLICY "shopping_lists_delete_policy" ON public.shopping_lists
    FOR DELETE TO authenticated
    USING (
        company_id IN (
            SELECT company_id FROM public.user_profiles WHERE id = (SELECT auth.uid())
        )
    );

-- Shopping List Items Policies
DROP POLICY IF EXISTS "shopping_list_items_select_policy" ON public.shopping_list_items;
CREATE POLICY "shopping_list_items_select_policy" ON public.shopping_list_items
    FOR SELECT TO authenticated
    USING (
        shopping_list_id IN (
            SELECT id FROM public.shopping_lists
            WHERE company_id IN (
                SELECT company_id FROM public.user_profiles WHERE id = (SELECT auth.uid())
            )
        )
    );

DROP POLICY IF EXISTS "shopping_list_items_insert_policy" ON public.shopping_list_items;
CREATE POLICY "shopping_list_items_insert_policy" ON public.shopping_list_items
    FOR INSERT TO authenticated
    WITH CHECK (
        shopping_list_id IN (
            SELECT id FROM public.shopping_lists
            WHERE company_id IN (
                SELECT company_id FROM public.user_profiles WHERE id = (SELECT auth.uid())
            )
        )
    );

DROP POLICY IF EXISTS "shopping_list_items_update_policy" ON public.shopping_list_items;
CREATE POLICY "shopping_list_items_update_policy" ON public.shopping_list_items
    FOR UPDATE TO authenticated
    USING (
        shopping_list_id IN (
            SELECT id FROM public.shopping_lists
            WHERE company_id IN (
                SELECT company_id FROM public.user_profiles WHERE id = (SELECT auth.uid())
            )
        )
    )
    WITH CHECK (
        shopping_list_id IN (
            SELECT id FROM public.shopping_lists
            WHERE company_id IN (
                SELECT company_id FROM public.user_profiles WHERE id = (SELECT auth.uid())
            )
        )
    );

DROP POLICY IF EXISTS "shopping_list_items_delete_policy" ON public.shopping_list_items;
CREATE POLICY "shopping_list_items_delete_policy" ON public.shopping_list_items
    FOR DELETE TO authenticated
    USING (
        shopping_list_id IN (
            SELECT id FROM public.shopping_lists
            WHERE company_id IN (
                SELECT company_id FROM public.user_profiles WHERE id = (SELECT auth.uid())
            )
        )
    );

-- =====================================================
-- 7. BASIC RLS POLICIES FOR PRODUCTS/CATEGORIES (if needed)
-- =====================================================

-- Products policies (basic)
DROP POLICY IF EXISTS "products_select_policy" ON public.products;
CREATE POLICY "products_select_policy" ON public.products
    FOR SELECT TO authenticated
    USING (
        company_id IN (
            SELECT company_id FROM public.user_profiles WHERE id = (SELECT auth.uid())
        )
    );

DROP POLICY IF EXISTS "products_insert_policy" ON public.products;
CREATE POLICY "products_insert_policy" ON public.products
    FOR INSERT TO authenticated
    WITH CHECK (
        company_id IN (
            SELECT company_id FROM public.user_profiles WHERE id = (SELECT auth.uid())
        )
    );

DROP POLICY IF EXISTS "products_update_policy" ON public.products;
CREATE POLICY "products_update_policy" ON public.products
    FOR UPDATE TO authenticated
    USING (
        company_id IN (
            SELECT company_id FROM public.user_profiles WHERE id = (SELECT auth.uid())
        )
    )
    WITH CHECK (
        company_id IN (
            SELECT company_id FROM public.user_profiles WHERE id = (SELECT auth.uid())
        )
    );

DROP POLICY IF EXISTS "products_delete_policy" ON public.products;
CREATE POLICY "products_delete_policy" ON public.products
    FOR DELETE TO authenticated
    USING (
        company_id IN (
            SELECT company_id FROM public.user_profiles WHERE id = (SELECT auth.uid())
        )
    );

-- Product Categories policies (basic)
DROP POLICY IF EXISTS "product_categories_select_policy" ON public.product_categories;
CREATE POLICY "product_categories_select_policy" ON public.product_categories
    FOR SELECT TO authenticated
    USING (
        company_id IN (
            SELECT company_id FROM public.user_profiles WHERE id = (SELECT auth.uid())
        )
    );

DROP POLICY IF EXISTS "product_categories_insert_policy" ON public.product_categories;
CREATE POLICY "product_categories_insert_policy" ON public.product_categories
    FOR INSERT TO authenticated
    WITH CHECK (
        company_id IN (
            SELECT company_id FROM public.user_profiles WHERE id = (SELECT auth.uid())
        )
    );

DROP POLICY IF EXISTS "product_categories_update_policy" ON public.product_categories;
CREATE POLICY "product_categories_update_policy" ON public.product_categories
    FOR UPDATE TO authenticated
    USING (
        company_id IN (
            SELECT company_id FROM public.user_profiles WHERE id = (SELECT auth.uid())
        )
    )
    WITH CHECK (
        company_id IN (
            SELECT company_id FROM public.user_profiles WHERE id = (SELECT auth.uid())
        )
    );

DROP POLICY IF EXISTS "product_categories_delete_policy" ON public.product_categories;
CREATE POLICY "product_categories_delete_policy" ON public.product_categories
    FOR DELETE TO authenticated
    USING (
        company_id IN (
            SELECT company_id FROM public.user_profiles WHERE id = (SELECT auth.uid())
        )
    );

-- =====================================================
-- 8. PERFORMANCE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_shopping_lists_company_id ON public.shopping_lists(company_id);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_created_by ON public.shopping_lists(created_by);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_is_template ON public.shopping_lists(is_template);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_is_completed ON public.shopping_lists(is_completed);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_created_at ON public.shopping_lists(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_shopping_list_items_shopping_list_id ON public.shopping_list_items(shopping_list_id);
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_product_id ON public.shopping_list_items(product_id);
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_is_completed ON public.shopping_list_items(is_completed);
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_added_at ON public.shopping_list_items(added_at DESC);

CREATE INDEX IF NOT EXISTS idx_products_company_id ON public.products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);

CREATE INDEX IF NOT EXISTS idx_product_categories_company_id ON public.product_categories(company_id);

-- =====================================================
-- 9. TRIGGERS FOR UPDATED_AT
-- =====================================================
DROP TRIGGER IF EXISTS set_updated_at_shopping_lists ON public.shopping_lists;
CREATE TRIGGER set_updated_at_shopping_lists
    BEFORE UPDATE ON public.shopping_lists
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_shopping_list_items ON public.shopping_list_items;
CREATE TRIGGER set_updated_at_shopping_list_items
    BEFORE UPDATE ON public.shopping_list_items
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_products ON public.products;
CREATE TRIGGER set_updated_at_products
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_product_categories ON public.product_categories;
CREATE TRIGGER set_updated_at_product_categories
    BEFORE UPDATE ON public.product_categories
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- =====================================================
-- 10. GRANTS TO AUTHENTICATED USERS
-- =====================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shopping_lists TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shopping_list_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_categories TO authenticated;

-- =====================================================
-- 11. SAMPLE DATA (Safe version)
-- =====================================================

-- First, create sample product categories if none exist
INSERT INTO public.product_categories (company_id, name, description, default_expiry_days)
SELECT
    c.id,
    'Prodotti Base',
    'Categoria per prodotti di base',
    30
FROM public.companies c
WHERE NOT EXISTS (SELECT 1 FROM public.product_categories WHERE company_id = c.id)
LIMIT 1
ON CONFLICT (company_id, name) DO NOTHING;

-- Create sample products if none exist
INSERT INTO public.products (company_id, name, category_id, quantity, unit, status)
SELECT
    c.id,
    product_names.name,
    pc.id,
    1,
    'pz',
    'active'
FROM public.companies c
CROSS JOIN public.product_categories pc
CROSS JOIN (
    VALUES
        ('Pane Integrale'),
        ('Latte Fresco'),
        ('Pomodori San Marzano'),
        ('Olio Extravergine')
) AS product_names(name)
WHERE pc.company_id = c.id
  AND NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = c.id)
LIMIT 4
ON CONFLICT DO NOTHING;

-- Create sample shopping list
INSERT INTO public.shopping_lists (company_id, name, description, created_by, is_template, is_completed)
SELECT
    c.id,
    'Lista Spesa Settimanale',
    'Lista della spesa per rifornimento settimanale',
    up.id,
    FALSE,
    FALSE
FROM public.companies c
JOIN public.user_profiles up ON c.id = up.company_id
WHERE NOT EXISTS (SELECT 1 FROM public.shopping_lists WHERE company_id = c.id)
LIMIT 1
ON CONFLICT DO NOTHING;

-- Create sample shopping list template
INSERT INTO public.shopping_lists (company_id, name, description, created_by, is_template, is_completed)
SELECT
    c.id,
    'Template Prodotti Base',
    'Template per prodotti di uso comune',
    up.id,
    TRUE,
    FALSE
FROM public.companies c
JOIN public.user_profiles up ON c.id = up.company_id
WHERE NOT EXISTS (SELECT 1 FROM public.shopping_lists WHERE company_id = c.id AND is_template = TRUE)
LIMIT 1
ON CONFLICT DO NOTHING;

-- Add sample items to shopping lists
INSERT INTO public.shopping_list_items (shopping_list_id, product_id, product_name, category_name, quantity, unit, notes, is_completed)
SELECT
    sl.id,
    p.id,
    p.name,
    pc.name,
    CASE
        WHEN p.name ILIKE '%pane%' THEN 2
        WHEN p.name ILIKE '%latte%' THEN 1
        ELSE 1
    END,
    CASE
        WHEN p.name ILIKE '%pane%' THEN 'pz'
        WHEN p.name ILIKE '%latte%' THEN 'L'
        ELSE 'kg'
    END,
    'Item di esempio',
    FALSE
FROM public.shopping_lists sl
JOIN public.products p ON sl.company_id = p.company_id
JOIN public.product_categories pc ON p.category_id = pc.id
WHERE sl.name = 'Lista Spesa Settimanale'
  AND NOT EXISTS (SELECT 1 FROM public.shopping_list_items WHERE shopping_list_id = sl.id)
LIMIT 3
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Shopping Lists system setup completed successfully!';
    RAISE NOTICE '📋 Tables created: shopping_lists, shopping_list_items';
    RAISE NOTICE '🔒 RLS policies applied with proper auth checks';
    RAISE NOTICE '⚡ Performance indexes created';
    RAISE NOTICE '🔄 Updated_at triggers configured';
    RAISE NOTICE '📊 Sample data inserted for testing';
END $$;