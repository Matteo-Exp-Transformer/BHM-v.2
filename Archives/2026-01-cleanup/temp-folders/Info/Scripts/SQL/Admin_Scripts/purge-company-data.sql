-- ============================================================================
-- Purge Company Data - FK-Safe Deletion Script
-- ============================================================================
--
-- Questo script elimina TUTTI i dati di una company specifica in ordine FK-safe.
-- Rispetta le dipendenze di foreign key per evitare errori.
--
-- ATTENZIONE: Questa operazione è IRREVERSIBILE!
--
-- ============================================================================

-- ============================================================================
-- FUNCTION: purge_company_data
-- ============================================================================
-- Elimina tutti i dati di una company in ordine FK-safe
-- Parametri:
--   p_company_id: UUID della company da eliminare
-- Returns:
--   JSON con statistiche dei record eliminati
-- ============================================================================

CREATE OR REPLACE FUNCTION purge_company_data(p_company_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stats jsonb := '{}'::jsonb;
  v_count integer;
BEGIN
  -- Verifica che company_id sia valido
  IF p_company_id IS NULL THEN
    RAISE EXCEPTION 'company_id cannot be NULL';
  END IF;

  -- Log inizio operazione
  RAISE NOTICE 'Starting purge for company_id: %', p_company_id;

  -- ============================================================================
  -- STEP 1: Elimina tabelle FIGLIE (dipendenze più profonde)
  -- ============================================================================

  -- 1.1 Temperature Readings (dipende da conservation_points)
  DELETE FROM temperature_readings WHERE company_id = p_company_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_stats := v_stats || jsonb_build_object('temperature_readings', v_count);
  RAISE NOTICE 'Deleted % temperature_readings', v_count;

  -- 1.2 Shopping List Items (dipende da shopping_lists)
  DELETE FROM shopping_list_items
  WHERE shopping_list_id IN (
    SELECT id FROM shopping_lists WHERE company_id = p_company_id
  );
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_stats := v_stats || jsonb_build_object('shopping_list_items', v_count);
  RAISE NOTICE 'Deleted % shopping_list_items', v_count;

  -- 1.3 Products (dipende da product_categories, departments, conservation_points)
  DELETE FROM products WHERE company_id = p_company_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_stats := v_stats || jsonb_build_object('products', v_count);
  RAISE NOTICE 'Deleted % products', v_count;

  -- 1.4 Maintenance Tasks (dipende da conservation_points, staff)
  DELETE FROM maintenance_tasks WHERE company_id = p_company_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_stats := v_stats || jsonb_build_object('maintenance_tasks', v_count);
  RAISE NOTICE 'Deleted % maintenance_tasks', v_count;

  -- 1.5 Tasks (dipende da departments, conservation_points, staff)
  DELETE FROM tasks WHERE company_id = p_company_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_stats := v_stats || jsonb_build_object('tasks', v_count);
  RAISE NOTICE 'Deleted % tasks', v_count;

  -- 1.6 Events
  DELETE FROM events WHERE company_id = p_company_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_stats := v_stats || jsonb_build_object('events', v_count);
  RAISE NOTICE 'Deleted % events', v_count;

  -- 1.7 Notes
  DELETE FROM notes WHERE company_id = p_company_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_stats := v_stats || jsonb_build_object('notes', v_count);
  RAISE NOTICE 'Deleted % notes', v_count;

  -- 1.8 Non-Conformities
  DELETE FROM non_conformities WHERE company_id = p_company_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_stats := v_stats || jsonb_build_object('non_conformities', v_count);
  RAISE NOTICE 'Deleted % non_conformities', v_count;

  -- ============================================================================
  -- STEP 2: Elimina tabelle PARENT di secondo livello
  -- ============================================================================

  -- 2.1 Shopping Lists
  DELETE FROM shopping_lists WHERE company_id = p_company_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_stats := v_stats || jsonb_build_object('shopping_lists', v_count);
  RAISE NOTICE 'Deleted % shopping_lists', v_count;

  -- 2.2 Product Categories
  DELETE FROM product_categories WHERE company_id = p_company_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_stats := v_stats || jsonb_build_object('product_categories', v_count);
  RAISE NOTICE 'Deleted % product_categories', v_count;

  -- 2.3 Conservation Points (referenziato da temperature_readings, products, maintenance_tasks, tasks)
  DELETE FROM conservation_points WHERE company_id = p_company_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_stats := v_stats || jsonb_build_object('conservation_points', v_count);
  RAISE NOTICE 'Deleted % conservation_points', v_count;

  -- ============================================================================
  -- STEP 3: Pulisci FK in user_profiles prima di eliminare staff
  -- ============================================================================

  -- 3.1 Azzera staff_id in user_profiles per evitare FK violation
  UPDATE user_profiles
  SET staff_id = NULL
  WHERE company_id = p_company_id AND staff_id IS NOT NULL;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_stats := v_stats || jsonb_build_object('user_profiles_updated', v_count);
  RAISE NOTICE 'Updated % user_profiles (staff_id set to NULL)', v_count;

  -- 3.2 Elimina Staff
  DELETE FROM staff WHERE company_id = p_company_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_stats := v_stats || jsonb_build_object('staff', v_count);
  RAISE NOTICE 'Deleted % staff', v_count;

  -- ============================================================================
  -- STEP 4: Elimina Departments (referenziato da staff, conservation_points, products, tasks)
  -- ============================================================================

  DELETE FROM departments WHERE company_id = p_company_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_stats := v_stats || jsonb_build_object('departments', v_count);
  RAISE NOTICE 'Deleted % departments', v_count;

  -- ============================================================================
  -- STEP 5: (OPZIONALE) Pulisci tabelle di backup/audit
  -- ============================================================================

  -- 5.1 Maintenance Tasks Backup (se esiste)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'maintenance_tasks_backup'
  ) THEN
    EXECUTE format('DELETE FROM maintenance_tasks_backup WHERE company_id = %L', p_company_id);
    GET DIAGNOSTICS v_count = ROW_COUNT;
    v_stats := v_stats || jsonb_build_object('maintenance_tasks_backup', v_count);
    RAISE NOTICE 'Deleted % maintenance_tasks_backup', v_count;
  END IF;

  -- ============================================================================
  -- STEP 6: NON eliminare company e user_profiles
  -- ============================================================================
  -- IMPORTANTE: NON eliminiamo companies né user_profiles
  -- per permettere all'utente di rifare l'onboarding

  -- Log completamento
  RAISE NOTICE 'Purge completed for company_id: %', p_company_id;
  RAISE NOTICE 'Statistics: %', v_stats;

  RETURN v_stats;
END;
$$;

-- ============================================================================
-- COMMENT sulla funzione
-- ============================================================================

COMMENT ON FUNCTION purge_company_data(uuid) IS
'Elimina TUTTI i dati di una company in ordine FK-safe.
NON elimina companies né user_profiles.
Returns: JSON con contatori dei record eliminati per tabella.
ATTENZIONE: Operazione IRREVERSIBILE!';

-- ============================================================================
-- Script di test (COMMENTATO - usare con cautela!)
-- ============================================================================

/*
-- Test della funzione (DECOMMENTARE SOLO SE SEI SICURO!)
SELECT purge_company_data('c47b8b25-7257-4db3-a94c-d1693ff53cc5');

-- Verifica contatori residui
SELECT
  'temperature_readings' as table_name,
  COUNT(*) as count
FROM temperature_readings
WHERE company_id = 'c47b8b25-7257-4db3-a94c-d1693ff53cc5'
UNION ALL
SELECT 'products', COUNT(*) FROM products WHERE company_id = 'c47b8b25-7257-4db3-a94c-d1693ff53cc5'
UNION ALL
SELECT 'maintenance_tasks', COUNT(*) FROM maintenance_tasks WHERE company_id = 'c47b8b25-7257-4db3-a94c-d1693ff53cc5'
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks WHERE company_id = 'c47b8b25-7257-4db3-a94c-d1693ff53cc5'
UNION ALL
SELECT 'conservation_points', COUNT(*) FROM conservation_points WHERE company_id = 'c47b8b25-7257-4db3-a94c-d1693ff53cc5'
UNION ALL
SELECT 'departments', COUNT(*) FROM departments WHERE company_id = 'c47b8b25-7257-4db3-a94c-d1693ff53cc5'
UNION ALL
SELECT 'staff', COUNT(*) FROM staff WHERE company_id = 'c47b8b25-7257-4db3-a94c-d1693ff53cc5'
UNION ALL
SELECT 'product_categories', COUNT(*) FROM product_categories WHERE company_id = 'c47b8b25-7257-4db3-a94c-d1693ff53cc5'
UNION ALL
SELECT 'shopping_lists', COUNT(*) FROM shopping_lists WHERE company_id = 'c47b8b25-7257-4db3-a94c-d1693ff53cc5'
UNION ALL
SELECT 'shopping_list_items', COUNT(*)
FROM shopping_list_items
WHERE shopping_list_id IN (SELECT id FROM shopping_lists WHERE company_id = 'c47b8b25-7257-4db3-a94c-d1693ff53cc5');
*/

-- ============================================================================
-- FINE SCRIPT
-- ============================================================================
