-- ============================================================================
-- FIX SCHEMA ALIGNMENT - Allinea SQL con Documentazione v1.7.0
-- ============================================================================
-- Data: 2025-10-14
-- Versione: 1.7.1
-- Descrizione: Risolve 2 discrepanze trovate tra schema SQL e documentazione
-- ============================================================================

-- ============================================================================
-- FIX 1: Aggiorna Enum products.status
-- ============================================================================
-- PROBLEMA: Lo schema ha ancora 'consumed' ma v1.7.0 lo ha rimosso
-- SOLUZIONE: Rimuovi 'consumed' e mantieni solo 'active', 'expired', 'waste'

-- Step 1: Aggiorna eventuali prodotti con status 'consumed' → 'expired'
UPDATE products
SET status = 'expired'
WHERE status = 'consumed';

-- Step 2: Rimuovi vecchio constraint
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_status_check;

-- Step 3: Aggiungi nuovo constraint senza 'consumed'
ALTER TABLE products ADD CONSTRAINT products_status_check
  CHECK (status::text = ANY (ARRAY[
    'active'::character varying,
    'expired'::character varying,
    'waste'::character varying
  ]::text[]));

-- ============================================================================
-- FIX 2: Aggiungi Indici Mancanti su product_expiry_completions
-- ============================================================================
-- PROBLEMA: Tabella creata ma senza indici performance-critical
-- SOLUZIONE: Aggiungi 4 indici come documentato in SCHEMA_ATTUALE.md v1.7.0

-- Indice 1: company_id (per query filtrate per azienda)
CREATE INDEX IF NOT EXISTS idx_product_expiry_completions_company_id
  ON product_expiry_completions(company_id);

-- Indice 2: product_id (per storico completamenti di un prodotto)
CREATE INDEX IF NOT EXISTS idx_product_expiry_completions_product_id
  ON product_expiry_completions(product_id);

-- Indice 3: completed_by (per query "chi ha completato")
CREATE INDEX IF NOT EXISTS idx_product_expiry_completions_completed_by
  ON product_expiry_completions(completed_by);

-- Indice 4: completed_at DESC (per query cronologiche)
CREATE INDEX IF NOT EXISTS idx_product_expiry_completions_completed_at
  ON product_expiry_completions(completed_at DESC);

-- ============================================================================
-- VERIFICA RISULTATI
-- ============================================================================

-- Test 1: Verifica constraint products.status
SELECT
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'products_status_check';

-- Test 2: Verifica indici product_expiry_completions
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'product_expiry_completions'
ORDER BY indexname;

-- Test 3: Conta prodotti per status (verifica nessun 'consumed')
SELECT status, COUNT(*) as count
FROM products
GROUP BY status
ORDER BY status;

-- ============================================================================
-- ROLLBACK (in caso di problemi)
-- ============================================================================

-- ROLLBACK Fix 1:
-- ALTER TABLE products DROP CONSTRAINT products_status_check;
-- ALTER TABLE products ADD CONSTRAINT products_status_check
--   CHECK (status::text = ANY (ARRAY['active', 'expired', 'consumed', 'waste']));

-- ROLLBACK Fix 2:
-- DROP INDEX IF EXISTS idx_product_expiry_completions_company_id;
-- DROP INDEX IF EXISTS idx_product_expiry_completions_product_id;
-- DROP INDEX IF EXISTS idx_product_expiry_completions_completed_by;
-- DROP INDEX IF EXISTS idx_product_expiry_completions_completed_at;

-- ============================================================================
-- FINE MIGRATION
-- ============================================================================
