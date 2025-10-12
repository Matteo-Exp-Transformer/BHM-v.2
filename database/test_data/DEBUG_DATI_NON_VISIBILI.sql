-- ========================================
-- DEBUG: Dati non visibili dopo onboarding
-- ========================================

-- STEP 1: Verifica che i dati siano stati salvati
-- ========================================

-- 1.1 Verifica company creata
SELECT 
  id,
  name,
  email,
  created_at
FROM public.companies
ORDER BY created_at DESC
LIMIT 5;

-- 1.2 Verifica departments
SELECT 
  id,
  name,
  company_id,
  is_active
FROM public.departments
ORDER BY created_at DESC
LIMIT 10;

-- 1.3 Verifica staff
SELECT 
  id,
  name,
  email,
  role,
  company_id
FROM public.staff
ORDER BY created_at DESC
LIMIT 10;

-- 1.4 Verifica user session
SELECT 
  user_id,
  active_company_id,
  last_activity
FROM public.user_sessions
ORDER BY created_at DESC
LIMIT 5;

-- 1.5 Verifica company_members
SELECT 
  user_id,
  company_id,
  role,
  staff_id,
  is_active
FROM public.company_members
ORDER BY created_at DESC
LIMIT 5;

-- ========================================
-- STEP 2: Verifica RLS POLICIES per SELECT
-- ========================================

-- 2.1 Policies su tabelle principali
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as operation,
  SUBSTRING(qual::text, 1, 100) as using_clause,
  SUBSTRING(with_check::text, 1, 100) as with_check_clause
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('companies', 'departments', 'staff', 'products', 'tasks')
  AND cmd = 'SELECT'  -- Solo SELECT policies
ORDER BY tablename, policyname;

-- ========================================
-- STEP 3: Test SELECT come utente corrente
-- ========================================

-- Verifica quale utente sei (esegui dall'app loggato)
SELECT 
  auth.uid() as current_user_id,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as current_email;

-- Verifica active_company_id
SELECT 
  get_active_company_id() as active_company_id;

-- Verifica se sei membro
SELECT 
  is_company_member(get_active_company_id()) as is_member;

-- ========================================
-- FIX RAPIDO: Aggiungi SELECT Policies
-- ========================================

-- Se le query sopra mostrano che i dati esistono ma RLS blocca,
-- aggiungi queste policies:

-- COMPANIES - SELECT
DROP POLICY IF EXISTS "Users can view their companies" ON public.companies;
CREATE POLICY "Users can view their companies"
ON public.companies
FOR SELECT
USING (
  is_company_member(id)  -- Usa helper RLS
);

-- DEPARTMENTS - SELECT
DROP POLICY IF EXISTS "Users can view company departments" ON public.departments;
CREATE POLICY "Users can view company departments"
ON public.departments
FOR SELECT
USING (
  is_company_member(company_id)
);

-- STAFF - SELECT
DROP POLICY IF EXISTS "Users can view company staff" ON public.staff;
CREATE POLICY "Users can view company staff"
ON public.staff
FOR SELECT
USING (
  is_company_member(company_id)
);

-- PRODUCTS - SELECT
DROP POLICY IF EXISTS "Users can view company products" ON public.products;
CREATE POLICY "Users can view company products"
ON public.products
FOR SELECT
USING (
  is_company_member(company_id)
);

-- TASKS - SELECT
DROP POLICY IF EXISTS "Users can view company tasks" ON public.tasks;
CREATE POLICY "Users can view company tasks"
ON public.tasks
FOR SELECT
USING (
  is_company_member(company_id)
);

-- CONSERVATION POINTS - SELECT
DROP POLICY IF EXISTS "Users can view company conservation points" ON public.conservation_points;
CREATE POLICY "Users can view company conservation points"
ON public.conservation_points
FOR SELECT
USING (
  is_company_member(company_id)
);

-- MAINTENANCE TASKS - SELECT
DROP POLICY IF EXISTS "Users can view company maintenance tasks" ON public.maintenance_tasks;
CREATE POLICY "Users can view company maintenance tasks"
ON public.maintenance_tasks
FOR SELECT
USING (
  is_company_member(company_id)
);

-- PRODUCT CATEGORIES - SELECT
DROP POLICY IF EXISTS "Users can view company product categories" ON public.product_categories;
CREATE POLICY "Users can view company product categories"
ON public.product_categories
FOR SELECT
USING (
  is_company_member(company_id)
);

-- ========================================
-- VERIFICA POST-FIX
-- ========================================

-- Dopo aver aggiunto le policies, ricarica app (F5)
-- I dati dovrebbero essere visibili

-- Test veloce (esegui dall'app loggato):
/*
SELECT COUNT(*) FROM companies;
SELECT COUNT(*) FROM departments;
SELECT COUNT(*) FROM staff;
*/

