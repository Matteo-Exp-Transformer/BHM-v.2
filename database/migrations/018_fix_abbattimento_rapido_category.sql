-- Migration 018: Fix "Abbattimento Rapido" category temperature requirements
-- This category should only be compatible with "blast" type points, not "fridge"

UPDATE product_categories
SET temperature_requirements = jsonb_build_object(
  'min_temp', -40,
  'max_temp', -15,
  'storage_type', 'blast'
)
WHERE (LOWER(name) LIKE '%abbattimento%' OR LOWER(name) LIKE '%rapido%')
  AND (temperature_requirements IS NULL OR (temperature_requirements->>'storage_type') != 'blast');

-- Verifica
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count
  FROM product_categories
  WHERE (LOWER(name) LIKE '%abbattimento%' OR LOWER(name) LIKE '%rapido%')
    AND (temperature_requirements->>'storage_type') = 'blast';

  IF updated_count = 0 THEN
    RAISE WARNING 'No "Abbattimento Rapido" category found or already updated';
  ELSE
    RAISE NOTICE '✅ Migration 018 completed successfully';
    RAISE NOTICE 'Updated "Abbattimento Rapido" category: storage_type = blast, range = -40°C to -15°C';
  END IF;
END $$;
