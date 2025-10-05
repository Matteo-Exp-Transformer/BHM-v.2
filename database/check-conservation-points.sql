-- Query per verificare la struttura della tabella conservation_points esistente
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'conservation_points'
  AND table_schema = 'public'
ORDER BY ordinal_position;