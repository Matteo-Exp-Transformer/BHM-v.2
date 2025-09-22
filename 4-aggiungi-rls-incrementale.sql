-- =====================================================
-- AGGIUNGI RLS INCREMENTALE - Fase 4
-- USA SOLO DOPO che la base minima funziona senza errori
-- =====================================================

-- IMPORTANTE: Esegui SOLO se i test precedenti danno risultati positivi!

-- Step 1: Crea la funzione per RLS (versione sicura)
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
BEGIN
  -- Restituisce sempre il company_id di test per ora
  -- In produzione, questa funzione leggerà dai user_profiles
  RETURN 'c47b8b25-7257-4db3-a94c-d1693ff53cc5'::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Test della funzione prima di abilitare RLS
SELECT
  'TEST FUNZIONE RLS' as test,
  get_user_company_id() as company_id_result;

-- Step 3: Abilita RLS solo su shopping_lists prima
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;

-- Step 4: Crea policy SELECT per shopping_lists
DROP POLICY IF EXISTS "shopping_lists_select_policy" ON shopping_lists;
CREATE POLICY "shopping_lists_select_policy" ON shopping_lists
  FOR SELECT TO authenticated
  USING (company_id = get_user_company_id());

-- Test intermedio: verifica che SELECT funzioni ancora
SELECT
  'TEST RLS SHOPPING_LISTS' as test,
  COUNT(*) as count_with_rls
FROM shopping_lists;

-- Step 5: Aggiungi altre policy per shopping_lists
DROP POLICY IF EXISTS "shopping_lists_insert_policy" ON shopping_lists;
CREATE POLICY "shopping_lists_insert_policy" ON shopping_lists
  FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id());

DROP POLICY IF EXISTS "shopping_lists_update_policy" ON shopping_lists;
CREATE POLICY "shopping_lists_update_policy" ON shopping_lists
  FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

DROP POLICY IF EXISTS "shopping_lists_delete_policy" ON shopping_lists;
CREATE POLICY "shopping_lists_delete_policy" ON shopping_lists
  FOR DELETE TO authenticated
  USING (company_id = get_user_company_id());

-- Test intermedio: verifica che tutte le operazioni funzionino
SELECT
  'TEST TUTTE LE POLICY LISTS' as test,
  COUNT(*) as count_after_all_policies
FROM shopping_lists;

-- Step 6: Abilita RLS su shopping_list_items
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;

-- Step 7: Crea policy per shopping_list_items (collegate alle lists)
DROP POLICY IF EXISTS "shopping_list_items_select_policy" ON shopping_list_items;
CREATE POLICY "shopping_list_items_select_policy" ON shopping_list_items
  FOR SELECT TO authenticated
  USING (
    shopping_list_id IN (
      SELECT id FROM shopping_lists WHERE company_id = get_user_company_id()
    )
  );

DROP POLICY IF EXISTS "shopping_list_items_insert_policy" ON shopping_list_items;
CREATE POLICY "shopping_list_items_insert_policy" ON shopping_list_items
  FOR INSERT TO authenticated
  WITH CHECK (
    shopping_list_id IN (
      SELECT id FROM shopping_lists WHERE company_id = get_user_company_id()
    )
  );

DROP POLICY IF EXISTS "shopping_list_items_update_policy" ON shopping_list_items;
CREATE POLICY "shopping_list_items_update_policy" ON shopping_list_items
  FOR UPDATE TO authenticated
  USING (
    shopping_list_id IN (
      SELECT id FROM shopping_lists WHERE company_id = get_user_company_id()
    )
  );

DROP POLICY IF EXISTS "shopping_list_items_delete_policy" ON shopping_list_items;
CREATE POLICY "shopping_list_items_delete_policy" ON shopping_list_items
  FOR DELETE TO authenticated
  USING (
    shopping_list_id IN (
      SELECT id FROM shopping_lists WHERE company_id = get_user_company_id()
    )
  );

-- Test finale: verifica che tutto funzioni con RLS completo
SELECT
  'TEST FINALE RLS COMPLETO' as test,
  sl.name,
  COUNT(sli.id) as items_count
FROM shopping_lists sl
LEFT JOIN shopping_list_items sli ON sl.id = sli.shopping_list_id
GROUP BY sl.id, sl.name
ORDER BY sl.name;

-- Rimuovi grants eccessivi ora che RLS è attivo
REVOKE ALL ON shopping_lists FROM anon;
REVOKE ALL ON shopping_list_items FROM anon;

-- Force schema refresh
NOTIFY pgrst, 'reload schema';

-- Messaggio finale
DO $$
BEGIN
    RAISE NOTICE '========================';
    RAISE NOTICE '🔒 RLS ABILITATO INCREMENTALMENTE';
    RAISE NOTICE '';
    RAISE NOTICE 'Step completati:';
    RAISE NOTICE '1. ✅ Funzione get_user_company_id creata';
    RAISE NOTICE '2. ✅ RLS abilitato su shopping_lists';
    RAISE NOTICE '3. ✅ Policy complete per shopping_lists';
    RAISE NOTICE '4. ✅ RLS abilitato su shopping_list_items';
    RAISE NOTICE '5. ✅ Policy complete per shopping_list_items';
    RAISE NOTICE '6. ✅ Grants anon rimossi';
    RAISE NOTICE '';
    RAISE NOTICE 'ORA TESTA DI NUOVO: http://localhost:3002';
    RAISE NOTICE 'Se funziona: RLS OK, se no: usa versione senza RLS';
    RAISE NOTICE '========================';
END $$;