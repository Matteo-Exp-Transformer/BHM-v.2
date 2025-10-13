-- Migration: Estensione tabella product_categories per supporto HACCP completo
-- Versione: 010
-- Data: 13 Ottobre 2025
-- Descrizione: Aggiunge campi per temperature, scadenze e allergeni alle categorie prodotti

-- ============================================================================
-- 1. AGGIUNGI NUOVI CAMPI A product_categories
-- ============================================================================

ALTER TABLE product_categories
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS temperature_requirements JSONB,
  ADD COLUMN IF NOT EXISTS default_expiry_days INTEGER CHECK (default_expiry_days > 0),
  ADD COLUMN IF NOT EXISTS allergen_info TEXT[] DEFAULT '{}';

-- ============================================================================
-- 2. AGGIUNGI COMMENTI PER DOCUMENTAZIONE
-- ============================================================================

COMMENT ON COLUMN product_categories.description IS 'Descrizione della categoria';
COMMENT ON COLUMN product_categories.temperature_requirements IS 'Requisiti temperatura: {min_temp, max_temp, storage_type}';
COMMENT ON COLUMN product_categories.default_expiry_days IS 'Giorni scadenza predefiniti dopo acquisto';
COMMENT ON COLUMN product_categories.allergen_info IS 'Array allergeni comuni in questa categoria';

-- ============================================================================
-- 3. CREA INDICE PER STORAGE_TYPE (query frequenti)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_product_categories_storage_type 
ON product_categories ((temperature_requirements->>'storage_type'));

-- ============================================================================
-- 4. VALIDAZIONE JSONB temperature_requirements
-- ============================================================================

-- Aggiungi constraint per validare struttura JSONB
ALTER TABLE product_categories
  ADD CONSTRAINT valid_temperature_requirements 
  CHECK (
    temperature_requirements IS NULL OR (
      temperature_requirements ? 'min_temp' AND
      temperature_requirements ? 'max_temp' AND
      temperature_requirements ? 'storage_type' AND
      (temperature_requirements->>'storage_type') IN ('ambient', 'fridge', 'freezer', 'blast')
    )
  );

-- ============================================================================
-- 5. ESEMPI DI DATI (opzionale - commentato)
-- ============================================================================

/*
-- Esempio: Categoria Latticini
UPDATE product_categories 
SET 
  description = 'Prodotti lattiero-caseari freschi',
  temperature_requirements = '{"min_temp": 0, "max_temp": 8, "storage_type": "fridge"}'::jsonb,
  default_expiry_days = 7,
  allergen_info = ARRAY['latte']
WHERE name ILIKE '%latt%';

-- Esempio: Categoria Carne
UPDATE product_categories 
SET 
  description = 'Carni fresche e lavorate',
  temperature_requirements = '{"min_temp": -2, "max_temp": 4, "storage_type": "fridge"}'::jsonb,
  default_expiry_days = 3,
  allergen_info = ARRAY[]::TEXT[]
WHERE name ILIKE '%carne%';

-- Esempio: Categoria Surgelati
UPDATE product_categories 
SET 
  description = 'Prodotti surgelati',
  temperature_requirements = '{"min_temp": -25, "max_temp": -15, "storage_type": "freezer"}'::jsonb,
  default_expiry_days = 180,
  allergen_info = ARRAY[]::TEXT[]
WHERE name ILIKE '%surgel%';
*/

-- ============================================================================
-- 6. VERIFICA MIGRAZIONE
-- ============================================================================

DO $$
BEGIN
  -- Verifica che i campi siano stati aggiunti
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'product_categories' 
    AND column_name = 'description'
  ) THEN
    RAISE EXCEPTION 'Migration failed: column description not added';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'product_categories' 
    AND column_name = 'temperature_requirements'
  ) THEN
    RAISE EXCEPTION 'Migration failed: column temperature_requirements not added';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'product_categories' 
    AND column_name = 'default_expiry_days'
  ) THEN
    RAISE EXCEPTION 'Migration failed: column default_expiry_days not added';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'product_categories' 
    AND column_name = 'allergen_info'
  ) THEN
    RAISE EXCEPTION 'Migration failed: column allergen_info not added';
  END IF;
  
  RAISE NOTICE '✅ Migration 010 completed successfully';
  RAISE NOTICE 'Added fields: description, temperature_requirements, default_expiry_days, allergen_info';
END $$;

