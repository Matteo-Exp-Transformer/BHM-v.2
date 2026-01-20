-- Migration: Sostituisce categorie prodotti con nuove allineate ai profili HACCP
-- Versione: 020
-- Data: 2026-01-19
-- Agente: AGENT-2 (Database Specialist)
-- ATTENZIONE: Questa migration aggiorna i nomi delle categorie in conservation_points
-- Le categorie nella tabella product_categories sono per-azienda e verranno gestite dal codice TypeScript

-- STEP 1: Creare tabella mapping temporanea
CREATE TEMP TABLE category_mapping (
  old_name VARCHAR,
  new_name VARCHAR
);

-- Mapping vecchi nomi → nuovi nomi allineati ai profili HACCP
INSERT INTO category_mapping VALUES
  ('Carni Fresche', 'Carni crude'),
  ('Pesce Fresco', 'Pesce e frutti di mare crudi'),
  ('Latticini', 'Latticini'),
  ('Verdure Fresche', 'Verdure e ortofrutta'),
  ('Bevande', 'Bevande'),
  ('Congelati', 'Congelati: preparazioni'),
  ('Ultracongelati', 'Congelati: carni e pesce'),
  ('Dispensa Secca', 'Conserve/semiconserve'),
  ('Abbattimento Rapido', 'Preparazioni/Pronti/Cotti (RTE)');

-- STEP 2: Aggiornare conservation_points.product_categories con nuovi nomi
-- Per ogni punto di conservazione, mappare i vecchi nomi ai nuovi
UPDATE public.conservation_points cp
SET product_categories = (
  SELECT COALESCE(
    array_agg(
      COALESCE(cm.new_name, elem)
      ORDER BY array_position(cp.product_categories, elem)
    ),
    '{}'::TEXT[]
  )
  FROM unnest(COALESCE(cp.product_categories, '{}'::TEXT[])) AS elem
  LEFT JOIN category_mapping cm ON cm.old_name = elem
)
WHERE product_categories IS NOT NULL 
  AND array_length(product_categories, 1) > 0
  AND EXISTS (
    SELECT 1 
    FROM unnest(cp.product_categories) AS elem
    WHERE elem IN (SELECT old_name FROM category_mapping)
  );

-- STEP 3: Verifica risultati
DO $$
DECLARE
  total_points INTEGER;
  updated_points INTEGER;
  total_categories INTEGER;
  mapped_categories INTEGER;
BEGIN
  -- Conta punti totali
  SELECT COUNT(*) INTO total_points FROM public.conservation_points;
  
  -- Conta punti con categorie
  SELECT COUNT(*) INTO total_categories 
  FROM public.conservation_points 
  WHERE product_categories IS NOT NULL 
    AND array_length(product_categories, 1) > 0;
  
  -- Conta punti aggiornati (che hanno almeno una categoria mappata)
  SELECT COUNT(DISTINCT cp.id) INTO updated_points
  FROM public.conservation_points cp
  WHERE cp.product_categories IS NOT NULL
    AND array_length(cp.product_categories, 1) > 0
    AND EXISTS (
      SELECT 1 
      FROM unnest(cp.product_categories) AS cat
      WHERE cat IN (
        SELECT new_name FROM category_mapping
      )
    );
  
  -- Conta categorie mappate totali
  SELECT COUNT(*) INTO mapped_categories
  FROM public.conservation_points cp
  CROSS JOIN LATERAL unnest(COALESCE(cp.product_categories, '{}'::TEXT[])) AS cat
  WHERE cat IN (SELECT new_name FROM category_mapping);

  RAISE NOTICE '✅ Migration 020 completed successfully';
  RAISE NOTICE 'Total conservation_points: %', total_points;
  RAISE NOTICE 'Points with categories: %', total_categories;
  RAISE NOTICE 'Points updated with new category names: %', updated_points;
  RAISE NOTICE 'Total mapped categories: %', mapped_categories;
  RAISE NOTICE '';
  RAISE NOTICE 'Note: Categories in product_categories table are per-company';
  RAISE NOTICE 'and will be managed by TypeScript code (defaultCategories.ts)';
END $$;

-- Pulizia: rimuovere tabella temporanea
DROP TABLE IF EXISTS category_mapping;
