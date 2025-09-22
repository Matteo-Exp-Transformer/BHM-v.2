-- =====================================================
-- DATABASE BASE MINIMA - Fase 2
-- Crea solo le tabelle shopping_lists SENZA RLS per testare
-- =====================================================

-- Pulizia preliminare (rimuovi tabelle se esistono per test pulito)
DROP TABLE IF EXISTS shopping_list_items CASCADE;
DROP TABLE IF EXISTS shopping_lists CASCADE;

-- Crea tabella shopping_lists (versione minima)
CREATE TABLE shopping_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID,
  is_template BOOLEAN DEFAULT FALSE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crea tabella shopping_list_items (versione minima)
CREATE TABLE shopping_list_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shopping_list_id UUID NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  product_id UUID,
  product_name VARCHAR(255) NOT NULL,
  category_name VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,3) NOT NULL DEFAULT 1,
  unit VARCHAR(50),
  notes TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- NESSUNA RLS per ora - accesso completo per testare
-- Grants massimi per authenticated
GRANT ALL PRIVILEGES ON shopping_lists TO authenticated;
GRANT ALL PRIVILEGES ON shopping_list_items TO authenticated;

-- Grants anche per anon per test (temporaneo)
GRANT ALL PRIVILEGES ON shopping_lists TO anon;
GRANT ALL PRIVILEGES ON shopping_list_items TO anon;

-- Grants su sequenze se necessario
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Indici di base per performance
CREATE INDEX idx_shopping_lists_company_id ON shopping_lists(company_id);
CREATE INDEX idx_shopping_lists_created_at ON shopping_lists(created_at);
CREATE INDEX idx_shopping_list_items_shopping_list_id ON shopping_list_items(shopping_list_id);

-- Inserisci dati di test per verificare funzionamento
INSERT INTO shopping_lists (
  company_id,
  name,
  description,
  created_by,
  is_template,
  is_completed
) VALUES
-- Lista normale di test
('c47b8b25-7257-4db3-a94c-d1693ff53cc5', 'Lista Test Spesa', 'Lista di test per verificare API', '550e8400-e29b-41d4-a716-446655440000', false, false),
-- Template di test
('c47b8b25-7257-4db3-a94c-d1693ff53cc5', 'Template Prodotti Base', 'Template di test', '550e8400-e29b-41d4-a716-446655440000', true, false);

-- Inserisci item di test
INSERT INTO shopping_list_items (
  shopping_list_id,
  product_name,
  category_name,
  quantity,
  unit,
  notes,
  is_completed
)
SELECT
  sl.id,
  'Latte Fresco',
  'Latticini',
  2,
  'litri',
  'Prodotto di test',
  false
FROM shopping_lists sl
WHERE sl.name = 'Lista Test Spesa';

INSERT INTO shopping_list_items (
  shopping_list_id,
  product_name,
  category_name,
  quantity,
  unit,
  notes,
  is_completed
)
SELECT
  sl.id,
  'Pane Integrale',
  'Panetteria',
  1,
  'pz',
  'Template item',
  false
FROM shopping_lists sl
WHERE sl.name = 'Template Prodotti Base';

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';

-- Verifica immediata che tutto funzioni
SELECT
  'VERIFICA INSERIMENTO' as test,
  COUNT(*) as shopping_lists_count
FROM shopping_lists;

SELECT
  'VERIFICA ITEMS' as test,
  COUNT(*) as items_count
FROM shopping_list_items;

-- Test query che usa l'app React
SELECT
  'TEST QUERY APP' as test,
  sl.*,
  COUNT(sli.id) as item_count
FROM shopping_lists sl
LEFT JOIN shopping_list_items sli ON sl.id = sli.shopping_list_id
WHERE sl.company_id = 'c47b8b25-7257-4db3-a94c-d1693ff53cc5'
GROUP BY sl.id, sl.company_id, sl.name, sl.description, sl.created_by, sl.is_template, sl.is_completed, sl.completed_at, sl.created_at, sl.updated_at
ORDER BY sl.created_at DESC;

-- Messaggio finale
DO $$
BEGIN
    RAISE NOTICE '========================';
    RAISE NOTICE '✅ TABELLE BASE CREATE SENZA RLS';
    RAISE NOTICE '📋 Tabelle: shopping_lists, shopping_list_items';
    RAISE NOTICE '🔓 Accesso completo per test';
    RAISE NOTICE '📊 Dati di test inseriti';
    RAISE NOTICE '🔄 Schema cache refreshato';
    RAISE NOTICE '';
    RAISE NOTICE 'ORA TESTA: http://localhost:3002';
    RAISE NOTICE 'Le API REST dovrebbero funzionare senza 404';
    RAISE NOTICE '========================';
END $$;