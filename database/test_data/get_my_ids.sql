-- ========================================
-- QUERY PER RECUPERARE I TUOI ID
-- ========================================
-- Esegui questa query in Supabase SQL Editor e copia i risultati

-- 1. RECUPERA IL TUO COMPANY ID
SELECT 
  id as company_id,
  name as company_name,
  email as company_email
FROM public.companies
ORDER BY created_at DESC
LIMIT 5;

-- 2. RECUPERA IL TUO USER ID (auth)
SELECT 
  id as user_id,
  email as user_email,
  raw_user_meta_data->>'first_name' as first_name,
  raw_user_meta_data->>'last_name' as last_name
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 3. RECUPERA I DEPARTMENT IDS (opzionale)
SELECT 
  d.id as department_id,
  d.name as department_name,
  c.name as company_name
FROM public.departments d
JOIN public.companies c ON d.company_id = c.id
WHERE d.is_active = true
ORDER BY d.created_at DESC
LIMIT 10;

-- ========================================
-- COPIA E INCOLLA I RISULTATI QUI:
-- ========================================
-- 
-- Company ID: _____________________
-- User ID: ________________________
-- Department ID (opzionale): _______
-- 
-- Dopo aver copiato gli ID, forniscimeli e genererò
-- lo script insert_retroactive_tasks.sql già compilato!

