-- =====================================================
-- Migration 007: Shopping Lists Verification & Updates
-- Description: Verify and update shopping_lists tables
-- Created: 2025-01-10
-- Author: Claude Code
-- =====================================================

-- =====================================================
-- VERIFY: shopping_lists table exists
-- =====================================================

-- Check if table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'shopping_lists') THEN

        CREATE TABLE public.shopping_lists (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
            name VARCHAR NOT NULL,
            description TEXT,
            created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
            is_template BOOLEAN NOT NULL DEFAULT false,
            is_completed BOOLEAN NOT NULL DEFAULT false,
            completed_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        -- Create indexes
        CREATE INDEX idx_shopping_lists_company_id ON public.shopping_lists(company_id);
        CREATE INDEX idx_shopping_lists_created_by ON public.shopping_lists(created_by);
        CREATE INDEX idx_shopping_lists_is_template ON public.shopping_lists(is_template);

        RAISE NOTICE 'Created shopping_lists table';
    ELSE
        RAISE NOTICE 'shopping_lists table already exists';
    END IF;
END $$;

-- =====================================================
-- ADD MISSING COLUMNS (if needed)
-- =====================================================

-- Add status column for more granular tracking
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'shopping_lists'
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.shopping_lists
        ADD COLUMN status VARCHAR(20) DEFAULT 'draft' CHECK (
            status IN ('draft', 'sent', 'completed', 'cancelled')
        );

        -- Migrate existing data
        UPDATE public.shopping_lists
        SET status = CASE
            WHEN is_completed = true THEN 'completed'
            ELSE 'draft'
        END;

        RAISE NOTICE 'Added status column to shopping_lists';
    END IF;
END $$;

-- Add notes column (in addition to description)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'shopping_lists'
        AND column_name = 'notes'
    ) THEN
        ALTER TABLE public.shopping_lists
        ADD COLUMN notes TEXT;

        RAISE NOTICE 'Added notes column to shopping_lists';
    END IF;
END $$;

-- =====================================================
-- VERIFY: shopping_list_items table exists
-- =====================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'shopping_list_items') THEN

        CREATE TABLE public.shopping_list_items (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            shopping_list_id UUID NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
            product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
            product_name VARCHAR NOT NULL,
            category_name VARCHAR NOT NULL,
            quantity NUMERIC NOT NULL DEFAULT 1 CHECK (quantity > 0),
            unit VARCHAR,
            notes TEXT,
            is_completed BOOLEAN NOT NULL DEFAULT false,
            added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            completed_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        -- Create indexes
        CREATE INDEX idx_shopping_list_items_list_id ON public.shopping_list_items(shopping_list_id);
        CREATE INDEX idx_shopping_list_items_product_id ON public.shopping_list_items(product_id);

        RAISE NOTICE 'Created shopping_list_items table';
    ELSE
        RAISE NOTICE 'shopping_list_items table already exists';
    END IF;
END $$;

-- =====================================================
-- ADD MISSING COLUMNS to shopping_list_items
-- =====================================================

-- Add is_checked as alias/migration from is_completed
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'shopping_list_items'
        AND column_name = 'is_checked'
    ) THEN
        ALTER TABLE public.shopping_list_items
        ADD COLUMN is_checked BOOLEAN NOT NULL DEFAULT false;

        -- Sync with is_completed
        UPDATE public.shopping_list_items
        SET is_checked = is_completed;

        RAISE NOTICE 'Added is_checked column to shopping_list_items';
    END IF;
END $$;

-- Add checked_at timestamp
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'shopping_list_items'
        AND column_name = 'checked_at'
    ) THEN
        ALTER TABLE public.shopping_list_items
        ADD COLUMN checked_at TIMESTAMPTZ;

        -- Migrate from completed_at
        UPDATE public.shopping_list_items
        SET checked_at = completed_at
        WHERE completed_at IS NOT NULL;

        RAISE NOTICE 'Added checked_at column to shopping_list_items';
    END IF;
END $$;

-- =====================================================
-- CREATE TRIGGER: Auto-update updated_at
-- =====================================================

-- Shopping Lists
DROP TRIGGER IF EXISTS update_shopping_lists_updated_at ON public.shopping_lists;

CREATE OR REPLACE FUNCTION update_shopping_lists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();

    -- Auto-set completed_at when marked as completed
    IF NEW.is_completed = true AND OLD.is_completed = false THEN
        NEW.completed_at = now();
    END IF;

    -- Auto-update status when is_completed changes
    IF NEW.is_completed = true AND NEW.status = 'draft' THEN
        NEW.status = 'completed';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shopping_lists_updated_at
    BEFORE UPDATE ON public.shopping_lists
    FOR EACH ROW
    EXECUTE FUNCTION update_shopping_lists_updated_at();

-- Shopping List Items
DROP TRIGGER IF EXISTS update_shopping_list_items_updated_at ON public.shopping_list_items;

CREATE OR REPLACE FUNCTION update_shopping_list_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();

    -- Sync is_checked with is_completed
    IF NEW.is_checked != OLD.is_checked THEN
        NEW.is_completed = NEW.is_checked;
    END IF;

    -- Auto-set checked_at when checked
    IF NEW.is_checked = true AND OLD.is_checked = false THEN
        NEW.checked_at = now();
        NEW.completed_at = now();
    END IF;

    -- Clear checked_at when unchecked
    IF NEW.is_checked = false AND OLD.is_checked = true THEN
        NEW.checked_at = NULL;
        NEW.completed_at = NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shopping_list_items_updated_at
    BEFORE UPDATE ON public.shopping_list_items
    FOR EACH ROW
    EXECUTE FUNCTION update_shopping_list_items_updated_at();

-- =====================================================
-- CREATE HELPER FUNCTIONS
-- =====================================================

-- Function: Get shopping list with items
CREATE OR REPLACE FUNCTION get_shopping_list_with_items(
    p_list_id UUID
)
RETURNS TABLE (
    list_id UUID,
    list_name VARCHAR,
    list_description TEXT,
    list_status VARCHAR,
    list_created_at TIMESTAMPTZ,
    total_items BIGINT,
    checked_items BIGINT,
    completion_percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sl.id AS list_id,
        sl.name AS list_name,
        sl.description AS list_description,
        sl.status AS list_status,
        sl.created_at AS list_created_at,
        COUNT(sli.id) AS total_items,
        COUNT(sli.id) FILTER (WHERE sli.is_checked = true) AS checked_items,
        CASE
            WHEN COUNT(sli.id) = 0 THEN 0
            ELSE ROUND((COUNT(sli.id) FILTER (WHERE sli.is_checked = true)::NUMERIC / COUNT(sli.id)::NUMERIC) * 100, 2)
        END AS completion_percentage
    FROM public.shopping_lists sl
    LEFT JOIN public.shopping_list_items sli ON sl.id = sli.shopping_list_id
    WHERE sl.id = p_list_id
    GROUP BY sl.id, sl.name, sl.description, sl.status, sl.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Complete shopping list
CREATE OR REPLACE FUNCTION complete_shopping_list(
    p_list_id UUID
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.shopping_lists
    SET
        is_completed = true,
        status = 'completed',
        completed_at = now(),
        updated_at = now()
    WHERE id = p_list_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE public.shopping_lists IS 'Shopping lists for product procurement';
COMMENT ON TABLE public.shopping_list_items IS 'Individual items in shopping lists';

COMMENT ON COLUMN public.shopping_lists.status IS 'List status: draft, sent, completed, cancelled';
COMMENT ON COLUMN public.shopping_list_items.is_checked IS 'Whether item has been purchased/checked off';
COMMENT ON COLUMN public.shopping_list_items.checked_at IS 'When the item was checked off';

COMMENT ON FUNCTION get_shopping_list_with_items(UUID) IS 'Get shopping list with item counts and completion percentage';
COMMENT ON FUNCTION complete_shopping_list(UUID) IS 'Mark a shopping list as completed';

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shopping_lists TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shopping_list_items TO authenticated;

GRANT EXECUTE ON FUNCTION get_shopping_list_with_items(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_shopping_list(UUID) TO authenticated;

-- =====================================================
-- VERIFICATION COMPLETE
-- =====================================================
RAISE NOTICE 'Shopping lists tables verified and updated successfully';
