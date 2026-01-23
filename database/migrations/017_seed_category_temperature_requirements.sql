-- Migration 017: Populate temperature_requirements for common food categories
-- Based on HACCP Italian food safety standards

-- Categorie FRIGORIFERO (1-15°C)
UPDATE product_categories
SET temperature_requirements = jsonb_build_object(
  'min_temp', 1,
  'max_temp', 4,
  'storage_type', 'fridge'
)
WHERE LOWER(name) SIMILAR TO '%(carn[ie]|meat|pollo|chicken|tacchino|turkey|vitello|veal|maiale|pork|manzo|beef)%'
  AND temperature_requirements IS NULL;

UPDATE product_categories
SET temperature_requirements = jsonb_build_object(
  'min_temp', 0,
  'max_temp', 4,
  'storage_type', 'fridge'
)
WHERE LOWER(name) SIMILAR TO '%(pesce|fish|frutti.*mare|seafood|crostace|mollusc|salmon|tonno|tuna|merluzzo|cod)%'
  AND temperature_requirements IS NULL;

UPDATE product_categories
SET temperature_requirements = jsonb_build_object(
  'min_temp', 2,
  'max_temp', 6,
  'storage_type', 'fridge'
)
WHERE LOWER(name) SIMILAR TO '%(latticin|dairy|latte|milk|formaggio|cheese|yogurt|burro|butter|panna|cream)%'
  AND temperature_requirements IS NULL;

UPDATE product_categories
SET temperature_requirements = jsonb_build_object(
  'min_temp', 1,
  'max_temp', 8,
  'storage_type', 'fridge'
)
WHERE LOWER(name) SIMILAR TO '%(uov[ao]|egg|frittata|omelette)%'
  AND temperature_requirements IS NULL;

UPDATE product_categories
SET temperature_requirements = jsonb_build_object(
  'min_temp', 4,
  'max_temp', 10,
  'storage_type', 'fridge'
)
WHERE LOWER(name) SIMILAR TO '%(verdur|vegetabl|insalat|salad|frutta.*fresc|fresh.*fruit)%'
  AND temperature_requirements IS NULL;

UPDATE product_categories
SET temperature_requirements = jsonb_build_object(
  'min_temp', 1,
  'max_temp', 10,
  'storage_type', 'fridge'
)
WHERE LOWER(name) SIMILAR TO '%(salum|charcuterie|prosciutto|ham|salame|salami|mortadella|bresaola)%'
  AND temperature_requirements IS NULL;

-- Categorie CONGELATORE (-25°C a -18°C)
UPDATE product_categories
SET temperature_requirements = jsonb_build_object(
  'min_temp', -25,
  'max_temp', -18,
  'storage_type', 'freezer'
)
WHERE LOWER(name) SIMILAR TO '%(congelat|frozen|surgelat|gelat|ice.*cream)%'
  AND temperature_requirements IS NULL;

-- Categorie DISPENSA/AMBIENTE (15-25°C)
UPDATE product_categories
SET temperature_requirements = jsonb_build_object(
  'min_temp', 15,
  'max_temp', 25,
  'storage_type', 'ambient'
)
WHERE LOWER(name) SIMILAR TO '%(dispens|pantry|secca|seco|dry|pasta|riso|rice|farina|flour|cereali|cereal|scatol|canned|olio|oil|aceto|vinegar|spezie|spice|condiment)%'
  AND temperature_requirements IS NULL;

-- Categorie BEVANDE - Ambiente (possono stare sia in frigo che fuori)
UPDATE product_categories
SET temperature_requirements = jsonb_build_object(
  'min_temp', 2,
  'max_temp', 25,
  'storage_type', 'ambient'
)
WHERE LOWER(name) SIMILAR TO '%(bevand|drink|bibita|acqua|water|vino|wine|birra|beer|succo|juice|spremuta)%'
  AND temperature_requirements IS NULL;

-- Verifica risultati
DO $$
DECLARE
  total_categories INTEGER;
  with_temp_req INTEGER;
  without_temp_req INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_categories FROM product_categories;
  SELECT COUNT(*) INTO with_temp_req FROM product_categories WHERE temperature_requirements IS NOT NULL;
  SELECT COUNT(*) INTO without_temp_req FROM product_categories WHERE temperature_requirements IS NULL;

  RAISE NOTICE '✅ Migration 017 completed successfully';
  RAISE NOTICE 'Total categories: %', total_categories;
  RAISE NOTICE 'With temperature_requirements: % (%.1f%%)', with_temp_req, (with_temp_req::FLOAT / NULLIF(total_categories, 0) * 100);
  RAISE NOTICE 'Without temperature_requirements: % (%.1f%%)', without_temp_req, (without_temp_req::FLOAT / NULLIF(total_categories, 0) * 100);

  -- Mostra esempi di categorie aggiornate
  RAISE NOTICE '';
  RAISE NOTICE 'Esempi di categorie con temperature_requirements:';
  FOR i IN 1..5 LOOP
    RAISE NOTICE '- % : %',
      (SELECT name FROM product_categories WHERE temperature_requirements IS NOT NULL ORDER BY name LIMIT 1 OFFSET i-1),
      (SELECT temperature_requirements::TEXT FROM product_categories WHERE temperature_requirements IS NOT NULL ORDER BY name LIMIT 1 OFFSET i-1);
  END LOOP;
END $$;
