-- =============================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- Description: Complete RLS setup for multi-tenant isolation
-- Author: Claude AI Assistant
-- Date: 2025-01-09
-- =============================================

-- ⚠️ IMPORTANT: This script PREPARES policies but does NOT enable RLS yet
-- RLS will be enabled in FASE 7 after frontend is ready
--
-- Policy Pattern for all tables:
-- 1. SELECT: Any company member can view company data
-- 2. INSERT: Only admin/responsabile can create
-- 3. UPDATE: Only admin/responsabile can modify
-- 4. DELETE: Only admin/responsabile can delete
--
-- Special cases:
-- - notes: Anyone can create, only admin can update/delete
-- - audit_logs: Insert only (no update/delete)
-- - company_members: Special rules for self-management

-- =============================================
-- TABLE 1: companies
-- =============================================

-- Enable RLS (commented out for now)
-- ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their companies" ON public.companies;
CREATE POLICY "Users can view their companies"
  ON public.companies FOR SELECT
  USING (
    id IN (
      SELECT company_id
      FROM company_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

DROP POLICY IF EXISTS "Admins can update company info" ON public.companies;
CREATE POLICY "Admins can update company info"
  ON public.companies FOR UPDATE
  USING (is_admin(id))
  WITH CHECK (is_admin(id));

-- No INSERT/DELETE on companies (handled by onboarding flow)

-- =============================================
-- TABLE 2: departments
-- =============================================

-- ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view departments" ON public.departments;
CREATE POLICY "Members can view departments"
  ON public.departments FOR SELECT
  USING (is_company_member(company_id));

DROP POLICY IF EXISTS "Managers can create departments" ON public.departments;
CREATE POLICY "Managers can create departments"
  ON public.departments FOR INSERT
  WITH CHECK (has_management_role(company_id));

DROP POLICY IF EXISTS "Managers can update departments" ON public.departments;
CREATE POLICY "Managers can update departments"
  ON public.departments FOR UPDATE
  USING (has_management_role(company_id))
  WITH CHECK (has_management_role(company_id));

DROP POLICY IF EXISTS "Managers can delete departments" ON public.departments;
CREATE POLICY "Managers can delete departments"
  ON public.departments FOR DELETE
  USING (has_management_role(company_id));

-- =============================================
-- TABLE 3: staff
-- =============================================

-- ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view staff" ON public.staff;
CREATE POLICY "Members can view staff"
  ON public.staff FOR SELECT
  USING (is_company_member(company_id));

DROP POLICY IF EXISTS "Managers can create staff" ON public.staff;
CREATE POLICY "Managers can create staff"
  ON public.staff FOR INSERT
  WITH CHECK (has_management_role(company_id));

DROP POLICY IF EXISTS "Managers can update staff" ON public.staff;
CREATE POLICY "Managers can update staff"
  ON public.staff FOR UPDATE
  USING (has_management_role(company_id))
  WITH CHECK (has_management_role(company_id));

DROP POLICY IF EXISTS "Managers can delete staff" ON public.staff;
CREATE POLICY "Managers can delete staff"
  ON public.staff FOR DELETE
  USING (has_management_role(company_id));

-- =============================================
-- TABLE 4: products
-- =============================================

-- ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view products" ON public.products;
CREATE POLICY "Members can view products"
  ON public.products FOR SELECT
  USING (is_company_member(company_id));

DROP POLICY IF EXISTS "Managers can create products" ON public.products;
CREATE POLICY "Managers can create products"
  ON public.products FOR INSERT
  WITH CHECK (has_management_role(company_id));

DROP POLICY IF EXISTS "Managers can update products" ON public.products;
CREATE POLICY "Managers can update products"
  ON public.products FOR UPDATE
  USING (has_management_role(company_id))
  WITH CHECK (has_management_role(company_id));

DROP POLICY IF EXISTS "Managers can delete products" ON public.products;
CREATE POLICY "Managers can delete products"
  ON public.products FOR DELETE
  USING (has_management_role(company_id));

-- =============================================
-- TABLE 5: product_categories
-- =============================================

-- ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view categories" ON public.product_categories;
CREATE POLICY "Members can view categories"
  ON public.product_categories FOR SELECT
  USING (is_company_member(company_id));

DROP POLICY IF EXISTS "Managers can create categories" ON public.product_categories;
CREATE POLICY "Managers can create categories"
  ON public.product_categories FOR INSERT
  WITH CHECK (has_management_role(company_id));

DROP POLICY IF EXISTS "Managers can update categories" ON public.product_categories;
CREATE POLICY "Managers can update categories"
  ON public.product_categories FOR UPDATE
  USING (has_management_role(company_id))
  WITH CHECK (has_management_role(company_id));

DROP POLICY IF EXISTS "Managers can delete categories" ON public.product_categories;
CREATE POLICY "Managers can delete categories"
  ON public.product_categories FOR DELETE
  USING (has_management_role(company_id));

-- =============================================
-- TABLE 6: conservation_points
-- =============================================

-- ALTER TABLE public.conservation_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view conservation points" ON public.conservation_points;
CREATE POLICY "Members can view conservation points"
  ON public.conservation_points FOR SELECT
  USING (is_company_member(company_id));

DROP POLICY IF EXISTS "Managers can create conservation points" ON public.conservation_points;
CREATE POLICY "Managers can create conservation points"
  ON public.conservation_points FOR INSERT
  WITH CHECK (has_management_role(company_id));

DROP POLICY IF EXISTS "Managers can update conservation points" ON public.conservation_points;
CREATE POLICY "Managers can update conservation points"
  ON public.conservation_points FOR UPDATE
  USING (has_management_role(company_id))
  WITH CHECK (has_management_role(company_id));

DROP POLICY IF EXISTS "Managers can delete conservation points" ON public.conservation_points;
CREATE POLICY "Managers can delete conservation points"
  ON public.conservation_points FOR DELETE
  USING (has_management_role(company_id));

-- =============================================
-- TABLE 7: temperature_readings
-- =============================================

-- ALTER TABLE public.temperature_readings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view temperature readings" ON public.temperature_readings;
CREATE POLICY "Members can view temperature readings"
  ON public.temperature_readings FOR SELECT
  USING (is_company_member(company_id));

DROP POLICY IF EXISTS "Members can create temperature readings" ON public.temperature_readings;
CREATE POLICY "Members can create temperature readings"
  ON public.temperature_readings FOR INSERT
  WITH CHECK (is_company_member(company_id));

DROP POLICY IF EXISTS "Managers can update temperature readings" ON public.temperature_readings;
CREATE POLICY "Managers can update temperature readings"
  ON public.temperature_readings FOR UPDATE
  USING (has_management_role(company_id))
  WITH CHECK (has_management_role(company_id));

DROP POLICY IF EXISTS "Managers can delete temperature readings" ON public.temperature_readings;
CREATE POLICY "Managers can delete temperature readings"
  ON public.temperature_readings FOR DELETE
  USING (has_management_role(company_id));

-- =============================================
-- TABLE 8: maintenance_tasks
-- =============================================

-- ALTER TABLE public.maintenance_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view maintenance tasks" ON public.maintenance_tasks;
CREATE POLICY "Members can view maintenance tasks"
  ON public.maintenance_tasks FOR SELECT
  USING (is_company_member(company_id));

DROP POLICY IF EXISTS "Managers can create maintenance tasks" ON public.maintenance_tasks;
CREATE POLICY "Managers can create maintenance tasks"
  ON public.maintenance_tasks FOR INSERT
  WITH CHECK (has_management_role(company_id));

DROP POLICY IF EXISTS "Managers can update maintenance tasks" ON public.maintenance_tasks;
CREATE POLICY "Managers can update maintenance tasks"
  ON public.maintenance_tasks FOR UPDATE
  USING (has_management_role(company_id))
  WITH CHECK (has_management_role(company_id));

DROP POLICY IF EXISTS "Managers can delete maintenance tasks" ON public.maintenance_tasks;
CREATE POLICY "Managers can delete maintenance tasks"
  ON public.maintenance_tasks FOR DELETE
  USING (has_management_role(company_id));

-- =============================================
-- TABLE 9: tasks
-- =============================================

-- ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view tasks" ON public.tasks;
CREATE POLICY "Members can view tasks"
  ON public.tasks FOR SELECT
  USING (is_company_member(company_id));

DROP POLICY IF EXISTS "Managers can create tasks" ON public.tasks;
CREATE POLICY "Managers can create tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (has_management_role(company_id));

DROP POLICY IF EXISTS "Managers can update tasks" ON public.tasks;
CREATE POLICY "Managers can update tasks"
  ON public.tasks FOR UPDATE
  USING (has_management_role(company_id))
  WITH CHECK (has_management_role(company_id));

DROP POLICY IF EXISTS "Managers can delete tasks" ON public.tasks;
CREATE POLICY "Managers can delete tasks"
  ON public.tasks FOR DELETE
  USING (has_management_role(company_id));

-- =============================================
-- TABLE 10: events
-- =============================================

-- ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view events" ON public.events;
CREATE POLICY "Members can view events"
  ON public.events FOR SELECT
  USING (is_company_member(company_id));

DROP POLICY IF EXISTS "Managers can create events" ON public.events;
CREATE POLICY "Managers can create events"
  ON public.events FOR INSERT
  WITH CHECK (has_management_role(company_id));

DROP POLICY IF EXISTS "Managers can update events" ON public.events;
CREATE POLICY "Managers can update events"
  ON public.events FOR UPDATE
  USING (has_management_role(company_id))
  WITH CHECK (has_management_role(company_id));

DROP POLICY IF EXISTS "Managers can delete events" ON public.events;
CREATE POLICY "Managers can delete events"
  ON public.events FOR DELETE
  USING (has_management_role(company_id));

-- =============================================
-- TABLE 11: notes (SPECIAL: Everyone can create)
-- =============================================

-- ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view notes" ON public.notes;
CREATE POLICY "Members can view notes"
  ON public.notes FOR SELECT
  USING (is_company_member(company_id));

DROP POLICY IF EXISTS "Members can create notes" ON public.notes;
CREATE POLICY "Members can create notes"
  ON public.notes FOR INSERT
  WITH CHECK (is_company_member(company_id));

DROP POLICY IF EXISTS "Managers can update notes" ON public.notes;
CREATE POLICY "Managers can update notes"
  ON public.notes FOR UPDATE
  USING (has_management_role(company_id))
  WITH CHECK (has_management_role(company_id));

DROP POLICY IF EXISTS "Managers can delete notes" ON public.notes;
CREATE POLICY "Managers can delete notes"
  ON public.notes FOR DELETE
  USING (has_management_role(company_id));

-- =============================================
-- TABLE 12: non_conformities
-- =============================================

-- ALTER TABLE public.non_conformities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view non-conformities" ON public.non_conformities;
CREATE POLICY "Members can view non-conformities"
  ON public.non_conformities FOR SELECT
  USING (is_company_member(company_id));

DROP POLICY IF EXISTS "Members can create non-conformities" ON public.non_conformities;
CREATE POLICY "Members can create non-conformities"
  ON public.non_conformities FOR INSERT
  WITH CHECK (is_company_member(company_id));

DROP POLICY IF EXISTS "Managers can update non-conformities" ON public.non_conformities;
CREATE POLICY "Managers can update non-conformities"
  ON public.non_conformities FOR UPDATE
  USING (has_management_role(company_id))
  WITH CHECK (has_management_role(company_id));

DROP POLICY IF EXISTS "Managers can delete non-conformities" ON public.non_conformities;
CREATE POLICY "Managers can delete non-conformities"
  ON public.non_conformities FOR DELETE
  USING (has_management_role(company_id));

-- =============================================
-- TABLE 13: shopping_lists
-- =============================================

-- ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view shopping lists" ON public.shopping_lists;
CREATE POLICY "Members can view shopping lists"
  ON public.shopping_lists FOR SELECT
  USING (is_company_member(company_id));

DROP POLICY IF EXISTS "Members can create shopping lists" ON public.shopping_lists;
CREATE POLICY "Members can create shopping lists"
  ON public.shopping_lists FOR INSERT
  WITH CHECK (is_company_member(company_id));

DROP POLICY IF EXISTS "Members can update shopping lists" ON public.shopping_lists;
CREATE POLICY "Members can update shopping lists"
  ON public.shopping_lists FOR UPDATE
  USING (is_company_member(company_id))
  WITH CHECK (is_company_member(company_id));

DROP POLICY IF EXISTS "Members can delete shopping lists" ON public.shopping_lists;
CREATE POLICY "Members can delete shopping lists"
  ON public.shopping_lists FOR DELETE
  USING (is_company_member(company_id));

-- =============================================
-- TABLE 14: shopping_list_items (Inherits company_id from shopping_list)
-- =============================================

-- ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view shopping list items" ON public.shopping_list_items;
CREATE POLICY "Members can view shopping list items"
  ON public.shopping_list_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shopping_lists sl
      WHERE sl.id = shopping_list_id
        AND is_company_member(sl.company_id)
    )
  );

DROP POLICY IF EXISTS "Members can create shopping list items" ON public.shopping_list_items;
CREATE POLICY "Members can create shopping list items"
  ON public.shopping_list_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shopping_lists sl
      WHERE sl.id = shopping_list_id
        AND is_company_member(sl.company_id)
    )
  );

DROP POLICY IF EXISTS "Members can update shopping list items" ON public.shopping_list_items;
CREATE POLICY "Members can update shopping list items"
  ON public.shopping_list_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM shopping_lists sl
      WHERE sl.id = shopping_list_id
        AND is_company_member(sl.company_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shopping_lists sl
      WHERE sl.id = shopping_list_id
        AND is_company_member(sl.company_id)
    )
  );

DROP POLICY IF EXISTS "Members can delete shopping list items" ON public.shopping_list_items;
CREATE POLICY "Members can delete shopping list items"
  ON public.shopping_list_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM shopping_lists sl
      WHERE sl.id = shopping_list_id
        AND is_company_member(sl.company_id)
    )
  );

-- =============================================
-- TABLE 15: company_members (SPECIAL: Self + Admin management)
-- =============================================

-- ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their memberships" ON public.company_members;
CREATE POLICY "Users can view their memberships"
  ON public.company_members FOR SELECT
  USING (
    user_id = auth.uid() OR -- Can see own memberships
    is_admin(company_id)    -- Admins can see all company members
  );

DROP POLICY IF EXISTS "Admins can create memberships" ON public.company_members;
CREATE POLICY "Admins can create memberships"
  ON public.company_members FOR INSERT
  WITH CHECK (is_admin(company_id));

DROP POLICY IF EXISTS "Admins can update memberships" ON public.company_members;
CREATE POLICY "Admins can update memberships"
  ON public.company_members FOR UPDATE
  USING (is_admin(company_id))
  WITH CHECK (is_admin(company_id));

DROP POLICY IF EXISTS "Admins can delete memberships" ON public.company_members;
CREATE POLICY "Admins can delete memberships"
  ON public.company_members FOR DELETE
  USING (is_admin(company_id));

-- =============================================
-- TABLE 16: user_sessions (SPECIAL: Self-management only)
-- =============================================

-- ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own session" ON public.user_sessions;
CREATE POLICY "Users can view own session"
  ON public.user_sessions FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own session" ON public.user_sessions;
CREATE POLICY "Users can update own session"
  ON public.user_sessions FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Auto-create session on first login (via trigger or function call)

-- =============================================
-- TABLE 17: invite_tokens (SPECIAL: Admins + self for acceptance)
-- =============================================

-- ALTER TABLE public.invite_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view company invites" ON public.invite_tokens;
CREATE POLICY "Admins can view company invites"
  ON public.invite_tokens FOR SELECT
  USING (is_admin(company_id));

DROP POLICY IF EXISTS "Anyone can view own invite" ON public.invite_tokens;
CREATE POLICY "Anyone can view own invite"
  ON public.invite_tokens FOR SELECT
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can create invites" ON public.invite_tokens;
CREATE POLICY "Admins can create invites"
  ON public.invite_tokens FOR INSERT
  WITH CHECK (is_admin(company_id));

DROP POLICY IF EXISTS "System can update used invites" ON public.invite_tokens;
CREATE POLICY "System can update used invites"
  ON public.invite_tokens FOR UPDATE
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  WITH CHECK (used_at IS NOT NULL); -- Can only mark as used

DROP POLICY IF EXISTS "Admins can delete invites" ON public.invite_tokens;
CREATE POLICY "Admins can delete invites"
  ON public.invite_tokens FOR DELETE
  USING (is_admin(company_id));

-- =============================================
-- TABLE 18: audit_logs (SPECIAL: Insert-only, view for admins)
-- =============================================

-- ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (is_admin(company_id));

DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (is_company_member(company_id));

-- No UPDATE/DELETE on audit_logs (immutable)

-- =============================================
-- TABLE 19: user_profiles (DEPRECATED - In migrazione)
-- =============================================
-- ⚠️ NOTA: Questa tabella è in fase di deprecazione
-- Sarà sostituita completamente da company_members + auth.users
-- Per ora manteniamo policies per retrocompatibilità

-- ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (
    auth_user_id = auth.uid() OR -- Nuovo: via Supabase Auth
    clerk_user_id = (auth.jwt() ->> 'sub') -- Vecchio: via Clerk (temporaneo)
  );

DROP POLICY IF EXISTS "Admins can view company profiles" ON public.user_profiles;
CREATE POLICY "Admins can view company profiles"
  ON public.user_profiles FOR SELECT
  USING (
    company_id IS NOT NULL AND is_admin(company_id)
  );

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (
    auth_user_id = auth.uid() OR
    clerk_user_id = (auth.jwt() ->> 'sub')
  )
  WITH CHECK (
    auth_user_id = auth.uid() OR
    clerk_user_id = (auth.jwt() ->> 'sub')
  );

-- No INSERT/DELETE (handled by auth signup flow)

-- =============================================
-- ENABLE ALL RLS (Commented out - enable in FASE 7)
-- =============================================

/*
-- ⚠️ IMPORTANTE: Decommenta questo blocco SOLO in FASE 7
-- Dopo aver completato l'implementazione frontend con Supabase Auth

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conservation_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temperature_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.non_conformities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
*/

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

/*
-- List all policies
SELECT
  schemaname,
  tablename,
  policyname,
  CASE cmd
    WHEN 'SELECT' THEN '👁️  Read'
    WHEN 'INSERT' THEN '➕ Create'
    WHEN 'UPDATE' THEN '✏️  Update'
    WHEN 'DELETE' THEN '🗑️  Delete'
  END as operation,
  CASE
    WHEN roles = '{public}' THEN '🌍 Public'
    ELSE '🔒 Restricted'
  END as visibility
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- Check which tables have RLS enabled
SELECT
  tablename,
  CASE
    WHEN rowsecurity THEN '✅ ENABLED'
    ELSE '❌ DISABLED'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
ORDER BY tablename;
*/

SELECT 'RLS Policies created successfully! (not enabled yet)' as status;
