ALTER TABLE product_categories
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS temperature_requirements JSONB,
  ADD COLUMN IF NOT EXISTS default_expiry_days INTEGER CHECK (default_expiry_days > 0),
  ADD COLUMN IF NOT EXISTS allergen_info TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_product_categories_storage_type 
ON product_categories ((temperature_requirements->>'storage_type'));

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

DO $$
BEGIN
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

