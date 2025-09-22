-- =====================================================
-- DIAGNOSI COMPLETA DATABASE - Fase 1
-- Verifica stato attuale delle tabelle e permessi
-- =====================================================

-- 1. Verificare se le tabelle shopping_lists esistono
SELECT
    'TABELLE ESISTENTI' as categoria,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('shopping_lists', 'shopping_list_items')
ORDER BY table_name;

-- 2. Verificare struttura delle tabelle se esistono
SELECT
    'STRUTTURA SHOPPING_LISTS' as categoria,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'shopping_lists'
  AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT
    'STRUTTURA SHOPPING_LIST_ITEMS' as categoria,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'shopping_list_items'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificare RLS policies esistenti
SELECT
    'RLS POLICIES' as categoria,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename IN ('shopping_lists', 'shopping_list_items')
ORDER BY tablename, policyname;

-- 4. Verificare grants esistenti
SELECT
    'GRANTS SHOPPING_LISTS' as categoria,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants
WHERE table_name = 'shopping_lists'
  AND table_schema = 'public';

SELECT
    'GRANTS SHOPPING_LIST_ITEMS' as categoria,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants
WHERE table_name = 'shopping_list_items'
  AND table_schema = 'public';

-- 5. Verificare se la funzione get_user_company_id esiste
SELECT
    'FUNZIONE GET_USER_COMPANY_ID' as categoria,
    routine_name,
    routine_type,
    security_type,
    routine_definition
FROM information_schema.routines
WHERE routine_name = 'get_user_company_id'
  AND routine_schema = 'public';

-- 6. Testare la funzione get_user_company_id (se esiste)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.routines
        WHERE routine_name = 'get_user_company_id'
    ) THEN
        -- La funzione esiste, prova a chiamarla
        BEGIN
            RAISE NOTICE 'Funzione get_user_company_id trovata - risultato: %', get_user_company_id();
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Errore nell''esecuzione di get_user_company_id: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'Funzione get_user_company_id NON trovata';
    END IF;
END $$;

-- 7. Verificare tabelle prerequisiti
SELECT
    'TABELLE PREREQUISITI' as categoria,
    table_name,
    'ESISTE' as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('companies', 'user_profiles', 'departments')
ORDER BY table_name;

-- 8. Contare righe nelle tabelle (se esistono)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shopping_lists') THEN
        RAISE NOTICE 'Righe in shopping_lists: %', (SELECT COUNT(*) FROM shopping_lists);
    ELSE
        RAISE NOTICE 'Tabella shopping_lists NON ESISTE';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shopping_list_items') THEN
        RAISE NOTICE 'Righe in shopping_list_items: %', (SELECT COUNT(*) FROM shopping_list_items);
    ELSE
        RAISE NOTICE 'Tabella shopping_list_items NON ESISTE';
    END IF;
END $$;

-- 9. Messaggio finale
DO $$
BEGIN
    RAISE NOTICE '========================';
    RAISE NOTICE 'DIAGNOSI COMPLETATA';
    RAISE NOTICE 'Controlla i risultati sopra per capire lo stato del database';
    RAISE NOTICE '========================';
END $$;