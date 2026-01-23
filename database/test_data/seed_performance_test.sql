-- Script SQL per seed dati performance test
-- Worker 4 - Task 4.2: Test Performance
-- 
-- Questo script inserisce 1000 temperature_readings per testare
-- le performance della pagina Conservation con un dataset grande.
-- 
-- PREREQUISITI:
-- 1. Deve esistere almeno un conservation_point
-- 2. Deve esistere una company_id valida
-- 3. Esegui questo script PRIMA di eseguire il test performance
-- 
-- USO:
-- 1. Copia questo script in Supabase SQL Editor
-- 2. Sostituisci 'YOUR_COMPANY_ID' e 'YOUR_POINT_ID' con valori reali
-- 3. Esegui lo script
-- 4. Esegui il test: npx playwright test tests/conservation/performance.spec.ts

-- ============================================
-- CONFIGURAZIONE: MODIFICA QUESTI VALORI
-- ============================================

-- Trova il company_id della tua azienda di test
-- SELECT id FROM companies LIMIT 1;

-- Trova un conservation_point_id esistente (o creane uno prima)
-- SELECT id FROM conservation_points WHERE company_id = 'YOUR_COMPANY_ID' LIMIT 1;

-- ============================================
-- SCRIPT DI SEED
-- ============================================

-- Opzione 1: Usa valori hardcoded (sostituisci prima di eseguire)
DO $$
DECLARE
  test_company_id UUID := 'YOUR_COMPANY_ID'::UUID; -- SOSTITUISCI
  test_point_id UUID := 'YOUR_POINT_ID'::UUID;     -- SOSTITUISCI
  temp_value NUMERIC;
  recorded_time TIMESTAMPTZ;
BEGIN
  -- Inserisci 1000 temperature readings
  FOR i IN 1..1000 LOOP
    -- Genera temperatura randomica tra 2°C e 12°C (range tipico per frigo)
    temp_value := (random() * 10 + 2)::numeric(4,1);
    
    -- Genera timestamp distribuito nelle ultime 30 giorni
    recorded_time := NOW() - (random() * interval '30 days');
    
    INSERT INTO temperature_readings (
      company_id,
      conservation_point_id,
      temperature,
      recorded_at,
      method,
      notes
    ) VALUES (
      test_company_id,
      test_point_id,
      temp_value,
      recorded_time,
      CASE (i % 3)
        WHEN 0 THEN 'manual'
        WHEN 1 THEN 'digital_thermometer'
        ELSE 'automatic_sensor'
      END,
      'Test performance - lettura ' || i
    );
    
    -- Progress update ogni 100 inserimenti
    IF i % 100 = 0 THEN
      RAISE NOTICE 'Inserite % letture su 1000', i;
    END IF;
  END LOOP;
  
  RAISE NOTICE '✅ Seed completato: 1000 temperature readings inserite';
END $$;

-- ============================================
-- VERIFICA INSERIMENTO
-- ============================================

-- Conta le letture inserite
-- SELECT 
--   COUNT(*) as total_readings,
--   MIN(recorded_at) as oldest_reading,
--   MAX(recorded_at) as newest_reading,
--   AVG(temperature) as avg_temperature
-- FROM temperature_readings
-- WHERE company_id = 'YOUR_COMPANY_ID'
--   AND conservation_point_id = 'YOUR_POINT_ID';

-- ============================================
-- CLEANUP (esegui DOPO i test)
-- ============================================

-- Per pulire i dati di test dopo i test performance:
-- DELETE FROM temperature_readings
-- WHERE company_id = 'YOUR_COMPANY_ID'
--   AND conservation_point_id = 'YOUR_POINT_ID'
--   AND notes LIKE 'Test performance%';

-- ============================================
-- ALTERNATIVA: Query più semplice con generate_series
-- ============================================

-- Se preferisci una query più semplice (richiede almeno un punto esistente):
/*
INSERT INTO temperature_readings (
  company_id,
  conservation_point_id,
  temperature,
  recorded_at,
  method
)
SELECT
  (SELECT id FROM companies LIMIT 1),  -- Usa prima company disponibile
  (SELECT id FROM conservation_points LIMIT 1),  -- Usa primo punto disponibile
  (random() * 10 + 2)::numeric(4,1) as temperature,
  NOW() - (random() * interval '30 days') as recorded_at,
  CASE (generate_series % 3)
    WHEN 0 THEN 'manual'
    WHEN 1 THEN 'digital_thermometer'
    ELSE 'automatic_sensor'
  END as method
FROM generate_series(1, 1000);
*/
