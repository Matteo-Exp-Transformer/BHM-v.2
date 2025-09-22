-- =====================================================
-- TEST API RESPONSE - Fase 3
-- Verifica che le query dell'app React funzionino
-- =====================================================

-- Test 1: Query principale shopping lists (quella che dava 404)
SELECT
  'TEST 1 - SHOPPING LISTS PRINCIPALE' as test_name,
  sl.*,
  json_agg(
    json_build_object(
      'id', sli.id,
      'is_completed', sli.is_completed
    )
  ) FILTER (WHERE sli.id IS NOT NULL) as shopping_list_items
FROM shopping_lists sl
LEFT JOIN shopping_list_items sli ON sl.id = sli.shopping_list_id
WHERE sl.company_id = 'c47b8b25-7257-4db3-a94c-d1693ff53cc5'
GROUP BY sl.id
ORDER BY sl.created_at DESC;

-- Test 2: Query templates (quella che dava 404)
SELECT
  'TEST 2 - TEMPLATES' as test_name,
  sl.*,
  json_agg(
    json_build_object(
      'id', sli.id,
      'product_name', sli.product_name,
      'category_name', sli.category_name,
      'quantity', sli.quantity,
      'unit', sli.unit,
      'notes', sli.notes,
      'is_completed', sli.is_completed
    )
  ) FILTER (WHERE sli.id IS NOT NULL) as shopping_list_items
FROM shopping_lists sl
LEFT JOIN shopping_list_items sli ON sl.id = sli.shopping_list_id
WHERE sl.company_id = 'c47b8b25-7257-4db3-a94c-d1693ff53cc5'
  AND sl.is_template = true
GROUP BY sl.id
ORDER BY sl.name ASC;

-- Test 3: Query semplice senza JOIN (per isolare il problema)
SELECT
  'TEST 3 - LISTS SEMPLICE' as test_name,
  *
FROM shopping_lists
WHERE company_id = 'c47b8b25-7257-4db3-a94c-d1693ff53cc5';

-- Test 4: Query items semplice
SELECT
  'TEST 4 - ITEMS SEMPLICE' as test_name,
  *
FROM shopping_list_items
WHERE shopping_list_id IN (
  SELECT id FROM shopping_lists WHERE company_id = 'c47b8b25-7257-4db3-a94c-d1693ff53cc5'
);

-- Test 5: Simula esattamente la query dell'app React
-- Query completa con nested SELECT come fa Supabase
WITH shopping_lists_with_items AS (
  SELECT
    sl.*,
    (
      SELECT json_agg(
        json_build_object(
          'id', sli.id,
          'is_completed', sli.is_completed
        )
      )
      FROM shopping_list_items sli
      WHERE sli.shopping_list_id = sl.id
    ) as shopping_list_items
  FROM shopping_lists sl
  WHERE sl.company_id = 'c47b8b25-7257-4db3-a94c-d1693ff53cc5'
)
SELECT
  'TEST 5 - SIMULAZIONE SUPABASE API' as test_name,
  *
FROM shopping_lists_with_items
ORDER BY created_at DESC;

-- Test 6: Verifica permessi effettivi
SELECT
  'TEST 6 - PERMESSI AUTHENTICATED' as test_name,
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_name IN ('shopping_lists', 'shopping_list_items')
  AND grantee = 'authenticated';

-- Test 7: Verifica che non ci sia RLS attivo
SELECT
  'TEST 7 - RLS STATUS' as test_name,
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('shopping_lists', 'shopping_list_items');

-- Test 8: Count totali per debug
SELECT
  'TEST 8 - COUNTS' as test_name,
  (SELECT COUNT(*) FROM shopping_lists) as total_lists,
  (SELECT COUNT(*) FROM shopping_list_items) as total_items,
  (SELECT COUNT(*) FROM shopping_lists WHERE company_id = 'c47b8b25-7257-4db3-a94c-d1693ff53cc5') as company_lists;

-- Messaggio finale
DO $$
BEGIN
    RAISE NOTICE '========================';
    RAISE NOTICE '🧪 TUTTI I TEST API ESEGUITI';
    RAISE NOTICE '';
    RAISE NOTICE 'Controlla i risultati sopra:';
    RAISE NOTICE '- Se vedi dati nei test 1-5: API dovrebbe funzionare';
    RAISE NOTICE '- Se test 6 mostra grants: permessi OK';
    RAISE NOTICE '- Se test 7 mostra rowsecurity=false: RLS disabilitato';
    RAISE NOTICE '- Se test 8 mostra counts > 0: dati presenti';
    RAISE NOTICE '';
    RAISE NOTICE 'Ora testa lapp React su http://localhost:3002';
    RAISE NOTICE '========================';
END $$;