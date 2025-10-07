-- ============================================================================
-- Row-Level Security (RLS) Policies for HACCP Business Manager
-- ============================================================================
--
-- Questo file contiene tutte le policy RLS per garantire che:
-- 1. Gli utenti possano accedere solo ai dati della loro azienda
-- 2. Le operazioni siano autorizzate in base al ruolo utente
-- 3. La sicurezza dei dati sia garantita a livello di database
--
-- IMPORTANTE: Eseguire questo file su Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- Helper Function: Get User's Company ID
-- ============================================================================

CREATE OR REPLACE FUNCTION auth.user_company_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT company_id
  FROM user_profiles
  WHERE clerk_user_id = auth.jwt() ->> 'sub'
  LIMIT 1;
$$;

-- ============================================================================
-- Helper Function: Get User's Role
-- ============================================================================

CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS varchar
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role
  FROM user_profiles
  WHERE clerk_user_id = auth.jwt() ->> 'sub'
  LIMIT 1;
$$;

-- ============================================================================
-- Helper Function: Check if user is Admin or Responsabile
-- ============================================================================

CREATE OR REPLACE FUNCTION auth.is_admin_or_manager()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role IN ('admin', 'responsabile')
  FROM user_profiles
  WHERE clerk_user_id = auth.jwt() ->> 'sub'
  LIMIT 1;
$$;

-- ============================================================================
-- 1. COMPANIES - Solo lettura per utenti autenticati
-- ============================================================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- DROP existing policies if any
DROP POLICY IF EXISTS "Users can view their company" ON companies;
DROP POLICY IF EXISTS "Admins can update their company" ON companies;

-- SELECT: utenti possono vedere solo la loro azienda
CREATE POLICY "Users can view their company"
ON companies FOR SELECT
USING (id = auth.user_company_id());

-- UPDATE: solo admin possono aggiornare i dati aziendali
CREATE POLICY "Admins can update their company"
ON companies FOR UPDATE
USING (
  id = auth.user_company_id()
  AND auth.user_role() = 'admin'
);

-- ============================================================================
-- 2. USER_PROFILES - Accesso controllato
-- ============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view profiles from their company" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON user_profiles;

-- SELECT: utenti vedono profili della loro azienda
CREATE POLICY "Users can view profiles from their company"
ON user_profiles FOR SELECT
USING (company_id = auth.user_company_id());

-- UPDATE: utenti possono aggiornare solo il proprio profilo
CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (clerk_user_id = auth.jwt() ->> 'sub');

-- INSERT: il sistema può creare nuovi profili (per onboarding)
CREATE POLICY "System can insert profiles"
ON user_profiles FOR INSERT
WITH CHECK (true);

-- ============================================================================
-- 3. DEPARTMENTS - Accesso basato su company
-- ============================================================================

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view departments from their company" ON departments;
DROP POLICY IF EXISTS "Managers can insert departments" ON departments;
DROP POLICY IF EXISTS "Managers can update departments" ON departments;
DROP POLICY IF EXISTS "Admins can delete departments" ON departments;

CREATE POLICY "Users can view departments from their company"
ON departments FOR SELECT
USING (company_id = auth.user_company_id());

CREATE POLICY "Managers can insert departments"
ON departments FOR INSERT
WITH CHECK (
  company_id = auth.user_company_id()
  AND auth.is_admin_or_manager()
);

CREATE POLICY "Managers can update departments"
ON departments FOR UPDATE
USING (
  company_id = auth.user_company_id()
  AND auth.is_admin_or_manager()
);

CREATE POLICY "Admins can delete departments"
ON departments FOR DELETE
USING (
  company_id = auth.user_company_id()
  AND auth.user_role() = 'admin'
);

-- ============================================================================
-- 4. STAFF - Gestione personale
-- ============================================================================

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view staff from their company" ON staff;
DROP POLICY IF EXISTS "Managers can insert staff" ON staff;
DROP POLICY IF EXISTS "Managers can update staff" ON staff;
DROP POLICY IF EXISTS "Admins can delete staff" ON staff;

CREATE POLICY "Users can view staff from their company"
ON staff FOR SELECT
USING (company_id = auth.user_company_id());

CREATE POLICY "Managers can insert staff"
ON staff FOR INSERT
WITH CHECK (
  company_id = auth.user_company_id()
  AND auth.is_admin_or_manager()
);

CREATE POLICY "Managers can update staff"
ON staff FOR UPDATE
USING (
  company_id = auth.user_company_id()
  AND auth.is_admin_or_manager()
);

CREATE POLICY "Admins can delete staff"
ON staff FOR DELETE
USING (
  company_id = auth.user_company_id()
  AND auth.user_role() = 'admin'
);

-- ============================================================================
-- 5. CONSERVATION_POINTS - Punti di conservazione
-- ============================================================================

ALTER TABLE conservation_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view conservation_points from their company" ON conservation_points;
DROP POLICY IF EXISTS "Managers can insert conservation_points" ON conservation_points;
DROP POLICY IF EXISTS "Managers can update conservation_points" ON conservation_points;
DROP POLICY IF EXISTS "Admins can delete conservation_points" ON conservation_points;

CREATE POLICY "Users can view conservation_points from their company"
ON conservation_points FOR SELECT
USING (company_id = auth.user_company_id());

CREATE POLICY "Managers can insert conservation_points"
ON conservation_points FOR INSERT
WITH CHECK (
  company_id = auth.user_company_id()
  AND auth.is_admin_or_manager()
);

CREATE POLICY "Managers can update conservation_points"
ON conservation_points FOR UPDATE
USING (
  company_id = auth.user_company_id()
  AND auth.is_admin_or_manager()
);

CREATE POLICY "Admins can delete conservation_points"
ON conservation_points FOR DELETE
USING (
  company_id = auth.user_company_id()
  AND auth.user_role() = 'admin'
);

-- ============================================================================
-- 6. MAINTENANCE_TASKS - Task di manutenzione
-- ============================================================================

ALTER TABLE maintenance_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view maintenance_tasks from their company" ON maintenance_tasks;
DROP POLICY IF EXISTS "Users can insert maintenance_tasks" ON maintenance_tasks;
DROP POLICY IF EXISTS "Users can update maintenance_tasks" ON maintenance_tasks;
DROP POLICY IF EXISTS "Managers can delete maintenance_tasks" ON maintenance_tasks;

CREATE POLICY "Users can view maintenance_tasks from their company"
ON maintenance_tasks FOR SELECT
USING (company_id = auth.user_company_id());

-- INSERT: tutti gli utenti autenticati possono creare task per la loro azienda
CREATE POLICY "Users can insert maintenance_tasks"
ON maintenance_tasks FOR INSERT
WITH CHECK (company_id = auth.user_company_id());

-- UPDATE: tutti possono aggiornare (per completare task assegnati)
CREATE POLICY "Users can update maintenance_tasks"
ON maintenance_tasks FOR UPDATE
USING (company_id = auth.user_company_id());

-- DELETE: solo manager e admin
CREATE POLICY "Managers can delete maintenance_tasks"
ON maintenance_tasks FOR DELETE
USING (
  company_id = auth.user_company_id()
  AND auth.is_admin_or_manager()
);

-- ============================================================================
-- 7. TASKS - Task generici
-- ============================================================================

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view tasks from their company" ON tasks;
DROP POLICY IF EXISTS "Users can insert tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update tasks" ON tasks;
DROP POLICY IF EXISTS "Managers can delete tasks" ON tasks;

CREATE POLICY "Users can view tasks from their company"
ON tasks FOR SELECT
USING (company_id = auth.user_company_id());

CREATE POLICY "Users can insert tasks"
ON tasks FOR INSERT
WITH CHECK (company_id = auth.user_company_id());

CREATE POLICY "Users can update tasks"
ON tasks FOR UPDATE
USING (company_id = auth.user_company_id());

CREATE POLICY "Managers can delete tasks"
ON tasks FOR DELETE
USING (
  company_id = auth.user_company_id()
  AND auth.is_admin_or_manager()
);

-- ============================================================================
-- 8. PRODUCT_CATEGORIES - Categorie prodotti
-- ============================================================================

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view product_categories from their company" ON product_categories;
DROP POLICY IF EXISTS "Users can insert product_categories" ON product_categories;
DROP POLICY IF EXISTS "Users can update product_categories" ON product_categories;
DROP POLICY IF EXISTS "Managers can delete product_categories" ON product_categories;

CREATE POLICY "Users can view product_categories from their company"
ON product_categories FOR SELECT
USING (company_id = auth.user_company_id());

CREATE POLICY "Users can insert product_categories"
ON product_categories FOR INSERT
WITH CHECK (company_id = auth.user_company_id());

CREATE POLICY "Users can update product_categories"
ON product_categories FOR UPDATE
USING (company_id = auth.user_company_id());

CREATE POLICY "Managers can delete product_categories"
ON product_categories FOR DELETE
USING (
  company_id = auth.user_company_id()
  AND auth.is_admin_or_manager()
);

-- ============================================================================
-- 9. PRODUCTS - Prodotti inventario
-- ============================================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view products from their company" ON products;
DROP POLICY IF EXISTS "Users can insert products" ON products;
DROP POLICY IF EXISTS "Users can update products" ON products;
DROP POLICY IF EXISTS "Users can delete products" ON products;

CREATE POLICY "Users can view products from their company"
ON products FOR SELECT
USING (company_id = auth.user_company_id());

CREATE POLICY "Users can insert products"
ON products FOR INSERT
WITH CHECK (company_id = auth.user_company_id());

CREATE POLICY "Users can update products"
ON products FOR UPDATE
USING (company_id = auth.user_company_id());

CREATE POLICY "Users can delete products"
ON products FOR DELETE
USING (company_id = auth.user_company_id());

-- ============================================================================
-- 10. TEMPERATURE_READINGS - Letture temperatura
-- ============================================================================

ALTER TABLE temperature_readings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view temperature_readings from their company" ON temperature_readings;
DROP POLICY IF EXISTS "Users can insert temperature_readings" ON temperature_readings;
DROP POLICY IF EXISTS "Managers can update temperature_readings" ON temperature_readings;
DROP POLICY IF EXISTS "Admins can delete temperature_readings" ON temperature_readings;

CREATE POLICY "Users can view temperature_readings from their company"
ON temperature_readings FOR SELECT
USING (company_id = auth.user_company_id());

CREATE POLICY "Users can insert temperature_readings"
ON temperature_readings FOR INSERT
WITH CHECK (company_id = auth.user_company_id());

CREATE POLICY "Managers can update temperature_readings"
ON temperature_readings FOR UPDATE
USING (
  company_id = auth.user_company_id()
  AND auth.is_admin_or_manager()
);

CREATE POLICY "Admins can delete temperature_readings"
ON temperature_readings FOR DELETE
USING (
  company_id = auth.user_company_id()
  AND auth.user_role() = 'admin'
);

-- ============================================================================
-- 11. SHOPPING_LISTS - Liste della spesa
-- ============================================================================

ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view shopping_lists from their company" ON shopping_lists;
DROP POLICY IF EXISTS "Users can insert shopping_lists" ON shopping_lists;
DROP POLICY IF EXISTS "Users can update shopping_lists" ON shopping_lists;
DROP POLICY IF EXISTS "Users can delete shopping_lists" ON shopping_lists;

CREATE POLICY "Users can view shopping_lists from their company"
ON shopping_lists FOR SELECT
USING (company_id = auth.user_company_id());

CREATE POLICY "Users can insert shopping_lists"
ON shopping_lists FOR INSERT
WITH CHECK (company_id = auth.user_company_id());

CREATE POLICY "Users can update shopping_lists"
ON shopping_lists FOR UPDATE
USING (company_id = auth.user_company_id());

CREATE POLICY "Users can delete shopping_lists"
ON shopping_lists FOR DELETE
USING (company_id = auth.user_company_id());

-- ============================================================================
-- 12. SHOPPING_LIST_ITEMS - Elementi liste spesa
-- ============================================================================

ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view shopping_list_items from their company" ON shopping_list_items;
DROP POLICY IF EXISTS "Users can insert shopping_list_items" ON shopping_list_items;
DROP POLICY IF EXISTS "Users can update shopping_list_items" ON shopping_list_items;
DROP POLICY IF EXISTS "Users can delete shopping_list_items" ON shopping_list_items;

CREATE POLICY "Users can view shopping_list_items from their company"
ON shopping_list_items FOR SELECT
USING (
  shopping_list_id IN (
    SELECT id FROM shopping_lists WHERE company_id = auth.user_company_id()
  )
);

CREATE POLICY "Users can insert shopping_list_items"
ON shopping_list_items FOR INSERT
WITH CHECK (
  shopping_list_id IN (
    SELECT id FROM shopping_lists WHERE company_id = auth.user_company_id()
  )
);

CREATE POLICY "Users can update shopping_list_items"
ON shopping_list_items FOR UPDATE
USING (
  shopping_list_id IN (
    SELECT id FROM shopping_lists WHERE company_id = auth.user_company_id()
  )
);

CREATE POLICY "Users can delete shopping_list_items"
ON shopping_list_items FOR DELETE
USING (
  shopping_list_id IN (
    SELECT id FROM shopping_lists WHERE company_id = auth.user_company_id()
  )
);

-- ============================================================================
-- 13. EVENTS - Eventi calendario
-- ============================================================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view events from their company" ON events;
DROP POLICY IF EXISTS "Users can insert events" ON events;
DROP POLICY IF EXISTS "Users can update events" ON events;
DROP POLICY IF EXISTS "Users can delete events" ON events;

CREATE POLICY "Users can view events from their company"
ON events FOR SELECT
USING (company_id = auth.user_company_id());

CREATE POLICY "Users can insert events"
ON events FOR INSERT
WITH CHECK (company_id = auth.user_company_id());

CREATE POLICY "Users can update events"
ON events FOR UPDATE
USING (company_id = auth.user_company_id());

CREATE POLICY "Users can delete events"
ON events FOR DELETE
USING (company_id = auth.user_company_id());

-- ============================================================================
-- 14. NOTES - Note aziendali
-- ============================================================================

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view notes from their company" ON notes;
DROP POLICY IF EXISTS "Users can insert notes" ON notes;
DROP POLICY IF EXISTS "Users can update notes" ON notes;
DROP POLICY IF EXISTS "Users can delete notes" ON notes;

CREATE POLICY "Users can view notes from their company"
ON notes FOR SELECT
USING (company_id = auth.user_company_id());

CREATE POLICY "Users can insert notes"
ON notes FOR INSERT
WITH CHECK (company_id = auth.user_company_id());

CREATE POLICY "Users can update notes"
ON notes FOR UPDATE
USING (company_id = auth.user_company_id());

CREATE POLICY "Users can delete notes"
ON notes FOR DELETE
USING (company_id = auth.user_company_id());

-- ============================================================================
-- 15. NON_CONFORMITIES - Non conformità
-- ============================================================================

ALTER TABLE non_conformities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view non_conformities from their company" ON non_conformities;
DROP POLICY IF EXISTS "Managers can insert non_conformities" ON non_conformities;
DROP POLICY IF EXISTS "Managers can update non_conformities" ON non_conformities;
DROP POLICY IF EXISTS "Admins can delete non_conformities" ON non_conformities;

CREATE POLICY "Users can view non_conformities from their company"
ON non_conformities FOR SELECT
USING (company_id = auth.user_company_id());

CREATE POLICY "Managers can insert non_conformities"
ON non_conformities FOR INSERT
WITH CHECK (
  company_id = auth.user_company_id()
  AND auth.is_admin_or_manager()
);

CREATE POLICY "Managers can update non_conformities"
ON non_conformities FOR UPDATE
USING (
  company_id = auth.user_company_id()
  AND auth.is_admin_or_manager()
);

CREATE POLICY "Admins can delete non_conformities"
ON non_conformities FOR DELETE
USING (
  company_id = auth.user_company_id()
  AND auth.user_role() = 'admin'
);

-- ============================================================================
-- Verifica Policies Create
-- ============================================================================

-- Query per verificare tutte le policy create
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  CASE
    WHEN cmd = 'SELECT' THEN 'Read'
    WHEN cmd = 'INSERT' THEN 'Create'
    WHEN cmd = 'UPDATE' THEN 'Update'
    WHEN cmd = 'DELETE' THEN 'Delete'
    ELSE 'All'
  END as operation
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- ============================================================================
-- FINE SCRIPT RLS POLICIES
-- ============================================================================
