-- =====================================================
-- RLS Policies: shopping_lists & shopping_list_items
-- Description: Row-Level Security for shopping lists
-- Created: 2025-01-10
-- Author: Claude Code
-- =====================================================

-- =====================================================
-- ENABLE RLS
-- =====================================================
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- DROP EXISTING POLICIES (if any)
-- =====================================================

-- Shopping Lists
DROP POLICY IF EXISTS "Users can view company shopping lists" ON public.shopping_lists;
DROP POLICY IF EXISTS "Users can insert shopping lists" ON public.shopping_lists;
DROP POLICY IF EXISTS "Users can update own shopping lists" ON public.shopping_lists;
DROP POLICY IF EXISTS "Admins can update all company shopping lists" ON public.shopping_lists;
DROP POLICY IF EXISTS "Users can delete own shopping lists" ON public.shopping_lists;
DROP POLICY IF EXISTS "Admins can delete all company shopping lists" ON public.shopping_lists;

-- Shopping List Items
DROP POLICY IF EXISTS "Users can view shopping list items" ON public.shopping_list_items;
DROP POLICY IF EXISTS "Users can insert shopping list items" ON public.shopping_list_items;
DROP POLICY IF EXISTS "Users can update shopping list items" ON public.shopping_list_items;
DROP POLICY IF EXISTS "Users can delete shopping list items" ON public.shopping_list_items;

-- =====================================================
-- SHOPPING_LISTS POLICIES
-- =====================================================

-- SELECT: Users can view all shopping lists in their company
CREATE POLICY "Users can view company shopping lists"
ON public.shopping_lists
FOR SELECT
TO authenticated
USING (
    company_id IN (
        SELECT cm.company_id
        FROM public.company_members cm
        WHERE cm.user_id = auth.uid()
    )
);

-- INSERT: Users can create shopping lists in their company
CREATE POLICY "Users can insert shopping lists"
ON public.shopping_lists
FOR INSERT
TO authenticated
WITH CHECK (
    company_id IN (
        SELECT cm.company_id
        FROM public.company_members cm
        WHERE cm.user_id = auth.uid()
    )
    AND created_by = auth.uid()
);

-- UPDATE: Users can update their own shopping lists
CREATE POLICY "Users can update own shopping lists"
ON public.shopping_lists
FOR UPDATE
TO authenticated
USING (
    created_by = auth.uid()
    AND company_id IN (
        SELECT cm.company_id
        FROM public.company_members cm
        WHERE cm.user_id = auth.uid()
    )
)
WITH CHECK (
    created_by = auth.uid()
    AND company_id IN (
        SELECT cm.company_id
        FROM public.company_members cm
        WHERE cm.user_id = auth.uid()
    )
);

-- UPDATE: Admins can update all company shopping lists
CREATE POLICY "Admins can update all company shopping lists"
ON public.shopping_lists
FOR UPDATE
TO authenticated
USING (
    company_id IN (
        SELECT cm.company_id
        FROM public.company_members cm
        WHERE cm.user_id = auth.uid()
        AND cm.role = 'admin'
    )
)
WITH CHECK (
    company_id IN (
        SELECT cm.company_id
        FROM public.company_members cm
        WHERE cm.user_id = auth.uid()
        AND cm.role = 'admin'
    )
);

-- DELETE: Users can delete their own shopping lists
CREATE POLICY "Users can delete own shopping lists"
ON public.shopping_lists
FOR DELETE
TO authenticated
USING (
    created_by = auth.uid()
    AND company_id IN (
        SELECT cm.company_id
        FROM public.company_members cm
        WHERE cm.user_id = auth.uid()
    )
);

-- DELETE: Admins can delete all company shopping lists
CREATE POLICY "Admins can delete all company shopping lists"
ON public.shopping_lists
FOR DELETE
TO authenticated
USING (
    company_id IN (
        SELECT cm.company_id
        FROM public.company_members cm
        WHERE cm.user_id = auth.uid()
        AND cm.role = 'admin'
    )
);

-- =====================================================
-- SHOPPING_LIST_ITEMS POLICIES
-- =====================================================

-- SELECT: Users can view items from company shopping lists
CREATE POLICY "Users can view shopping list items"
ON public.shopping_list_items
FOR SELECT
TO authenticated
USING (
    shopping_list_id IN (
        SELECT sl.id
        FROM public.shopping_lists sl
        INNER JOIN public.company_members cm ON sl.company_id = cm.company_id
        WHERE cm.user_id = auth.uid()
    )
);

-- INSERT: Users can add items to shopping lists they can access
CREATE POLICY "Users can insert shopping list items"
ON public.shopping_list_items
FOR INSERT
TO authenticated
WITH CHECK (
    shopping_list_id IN (
        SELECT sl.id
        FROM public.shopping_lists sl
        INNER JOIN public.company_members cm ON sl.company_id = cm.company_id
        WHERE cm.user_id = auth.uid()
    )
);

-- UPDATE: Users can update items in shopping lists they can access
CREATE POLICY "Users can update shopping list items"
ON public.shopping_list_items
FOR UPDATE
TO authenticated
USING (
    shopping_list_id IN (
        SELECT sl.id
        FROM public.shopping_lists sl
        INNER JOIN public.company_members cm ON sl.company_id = cm.company_id
        WHERE cm.user_id = auth.uid()
    )
)
WITH CHECK (
    shopping_list_id IN (
        SELECT sl.id
        FROM public.shopping_lists sl
        INNER JOIN public.company_members cm ON sl.company_id = cm.company_id
        WHERE cm.user_id = auth.uid()
    )
);

-- DELETE: Users can delete items from shopping lists they can access
CREATE POLICY "Users can delete shopping list items"
ON public.shopping_list_items
FOR DELETE
TO authenticated
USING (
    shopping_list_id IN (
        SELECT sl.id
        FROM public.shopping_lists sl
        INNER JOIN public.company_members cm ON sl.company_id = cm.company_id
        WHERE cm.user_id = auth.uid()
    )
);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function: Create shopping list with items (atomic)
CREATE OR REPLACE FUNCTION create_shopping_list_with_items(
    p_company_id UUID,
    p_list_name VARCHAR,
    p_description TEXT,
    p_notes TEXT,
    p_items JSONB
)
RETURNS UUID AS $$
DECLARE
    new_list_id UUID;
    item JSONB;
BEGIN
    -- Verify user is member of company
    IF NOT EXISTS (
        SELECT 1 FROM public.company_members cm
        WHERE cm.user_id = auth.uid()
        AND cm.company_id = p_company_id
    ) THEN
        RAISE EXCEPTION 'Unauthorized: User is not a member of this company';
    END IF;

    -- Create shopping list
    INSERT INTO public.shopping_lists (
        company_id,
        name,
        description,
        notes,
        created_by,
        status
    )
    VALUES (
        p_company_id,
        p_list_name,
        p_description,
        p_notes,
        auth.uid(),
        'draft'
    )
    RETURNING id INTO new_list_id;

    -- Insert items
    FOR item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        INSERT INTO public.shopping_list_items (
            shopping_list_id,
            product_id,
            product_name,
            category_name,
            quantity,
            unit,
            notes
        )
        VALUES (
            new_list_id,
            (item->>'product_id')::UUID,
            item->>'product_name',
            item->>'category_name',
            (item->>'quantity')::NUMERIC,
            item->>'unit',
            item->>'notes'
        );
    END LOOP;

    -- Log activity
    PERFORM log_user_activity(
        auth.uid(),
        p_company_id,
        NULL,
        'shopping_list_created',
        jsonb_build_object(
            'list_name', p_list_name,
            'items_count', jsonb_array_length(p_items)
        ),
        'shopping_list',
        new_list_id
    );

    RETURN new_list_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check/Uncheck shopping list item
CREATE OR REPLACE FUNCTION toggle_shopping_list_item(
    p_item_id UUID,
    p_checked BOOLEAN
)
RETURNS VOID AS $$
DECLARE
    v_shopping_list_id UUID;
    v_company_id UUID;
BEGIN
    -- Get shopping list and company
    SELECT sli.shopping_list_id, sl.company_id
    INTO v_shopping_list_id, v_company_id
    FROM public.shopping_list_items sli
    INNER JOIN public.shopping_lists sl ON sli.shopping_list_id = sl.id
    WHERE sli.id = p_item_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Shopping list item not found';
    END IF;

    -- Verify user access
    IF NOT EXISTS (
        SELECT 1 FROM public.company_members cm
        WHERE cm.user_id = auth.uid()
        AND cm.company_id = v_company_id
    ) THEN
        RAISE EXCEPTION 'Unauthorized: User cannot access this shopping list';
    END IF;

    -- Update item
    UPDATE public.shopping_list_items
    SET
        is_checked = p_checked,
        is_completed = p_checked,
        checked_at = CASE WHEN p_checked THEN now() ELSE NULL END,
        completed_at = CASE WHEN p_checked THEN now() ELSE NULL END,
        updated_at = now()
    WHERE id = p_item_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get shopping lists with stats
CREATE OR REPLACE FUNCTION get_shopping_lists_with_stats(
    p_company_id UUID,
    p_status VARCHAR DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    list_id UUID,
    list_name VARCHAR,
    list_description TEXT,
    list_status VARCHAR,
    created_by UUID,
    creator_email TEXT,
    created_at TIMESTAMPTZ,
    total_items BIGINT,
    checked_items BIGINT,
    completion_percentage NUMERIC
) AS $$
BEGIN
    -- Verify user is member of company
    IF NOT EXISTS (
        SELECT 1 FROM public.company_members cm
        WHERE cm.user_id = auth.uid()
        AND cm.company_id = p_company_id
    ) THEN
        RAISE EXCEPTION 'Unauthorized: User is not a member of this company';
    END IF;

    RETURN QUERY
    SELECT
        sl.id AS list_id,
        sl.name AS list_name,
        sl.description AS list_description,
        sl.status AS list_status,
        sl.created_by,
        u.email AS creator_email,
        sl.created_at,
        COUNT(sli.id) AS total_items,
        COUNT(sli.id) FILTER (WHERE sli.is_checked = true) AS checked_items,
        CASE
            WHEN COUNT(sli.id) = 0 THEN 0
            ELSE ROUND((COUNT(sli.id) FILTER (WHERE sli.is_checked = true)::NUMERIC / COUNT(sli.id)::NUMERIC) * 100, 2)
        END AS completion_percentage
    FROM public.shopping_lists sl
    LEFT JOIN auth.users u ON sl.created_by = u.id
    LEFT JOIN public.shopping_list_items sli ON sl.id = sli.shopping_list_id
    WHERE sl.company_id = p_company_id
    AND (p_status IS NULL OR sl.status = p_status)
    GROUP BY sl.id, sl.name, sl.description, sl.status, sl.created_by, u.email, sl.created_at
    ORDER BY sl.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON FUNCTION create_shopping_list_with_items IS 'Create a shopping list with items atomically';
COMMENT ON FUNCTION toggle_shopping_list_item IS 'Check or uncheck a shopping list item';
COMMENT ON FUNCTION get_shopping_lists_with_stats IS 'Get shopping lists with completion statistics';

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT EXECUTE ON FUNCTION create_shopping_list_with_items TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_shopping_list_item TO authenticated;
GRANT EXECUTE ON FUNCTION get_shopping_lists_with_stats TO authenticated;

-- =====================================================
-- VERIFICATION
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE 'RLS policies for shopping_lists created successfully';
    RAISE NOTICE '- Users can view/create/update/delete shopping lists in their company';
    RAISE NOTICE '- Admins have full access to all company shopping lists';
    RAISE NOTICE '- Items inherit permissions from parent shopping list';
END $$;
