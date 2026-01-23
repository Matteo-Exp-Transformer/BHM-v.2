-- =============================================
-- WORKER 2 - Task 2.2: Verifica Schema Database
-- Data: 2026-01-16
-- =============================================

-- 1. VERIFICA CAMPI temperature_readings
-- =============================================
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'temperature_readings'
ORDER BY ordinal_position;

-- Campi attesi:
-- - id (UUID, PRIMARY KEY)
-- - company_id (UUID, NOT NULL)
-- - conservation_point_id (UUID, NOT NULL)
-- - temperature (NUMERIC, NOT NULL)
-- - recorded_at (TIMESTAMPTZ, NOT NULL)
-- - created_at (TIMESTAMPTZ, NOT NULL, DEFAULT now())
-- - method (VARCHAR(50), DEFAULT 'digital_thermometer') ⚠️ DA VERIFICARE
-- - notes (TEXT) ⚠️ DA VERIFICARE
-- - photo_evidence (TEXT) ⚠️ DA VERIFICARE
-- - recorded_by (UUID, REFERENCES auth.users(id)) ⚠️ DA VERIFICARE

-- 2. VERIFICA CAMPI maintenance_tasks
-- =============================================
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'maintenance_tasks'
  AND column_name IN (
    'assigned_to_role',
    'assigned_to_category',
    'assigned_to_staff_id',
    'assignment_type'
  )
ORDER BY column_name;

-- Campi attesi per assegnazione:
-- - assigned_to_role (VARCHAR) ⚠️ DA VERIFICARE
-- - assigned_to_category (VARCHAR) ⚠️ DA VERIFICARE
-- - assigned_to_staff_id (UUID) ⚠️ DA VERIFICARE
-- - assignment_type (VARCHAR) ⚠️ DA VERIFICARE

-- 3. APPLICA MIGRATION SE NECESSARIO
-- =============================================
-- Eseguire solo se i campi mancanti sono stati rilevati nella verifica sopra

-- Migration per temperature_readings (se mancanti):
-- ALTER TABLE temperature_readings
-- ADD COLUMN IF NOT EXISTS method VARCHAR(50) DEFAULT 'digital_thermometer',
-- ADD COLUMN IF NOT EXISTS notes TEXT,
-- ADD COLUMN IF NOT EXISTS photo_evidence TEXT,
-- ADD COLUMN IF NOT EXISTS recorded_by UUID REFERENCES auth.users(id);

-- Commenti per documentazione:
-- COMMENT ON COLUMN temperature_readings.method IS 'Metodo rilevazione: manual, digital_thermometer, sensor';
-- COMMENT ON COLUMN temperature_readings.notes IS 'Note aggiuntive operatore';
-- COMMENT ON COLUMN temperature_readings.photo_evidence IS 'URL foto evidenza';
-- COMMENT ON COLUMN temperature_readings.recorded_by IS 'UUID utente che ha registrato';

-- 4. TEST INSERT (sostituire con ID reali)
-- =============================================
-- NOTA: Sostituire 'YOUR_COMPANY_ID' e 'YOUR_POINT_ID' con valori reali
-- prima di eseguire il test

/*
INSERT INTO temperature_readings (
  company_id, 
  conservation_point_id, 
  temperature, 
  recorded_at,
  method, 
  notes,
  recorded_by
) VALUES (
  'YOUR_COMPANY_ID'::uuid,
  'YOUR_POINT_ID'::uuid,
  4.5,
  now(),
  'digital_thermometer',
  'Test insert - Worker 2 Task 2.2',
  auth.uid()  -- Usa l'utente corrente autenticato
) RETURNING *;
*/
