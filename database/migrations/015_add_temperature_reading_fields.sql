-- Migration: Add missing fields to temperature_readings
-- Date: 2025-01-16
-- Worker: 2 (Database)
-- Task: 2.2 - Migration Campi Mancanti

-- Add missing fields to temperature_readings table
ALTER TABLE temperature_readings
ADD COLUMN IF NOT EXISTS method VARCHAR(50) DEFAULT 'digital_thermometer',
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS photo_evidence TEXT,
ADD COLUMN IF NOT EXISTS recorded_by UUID REFERENCES auth.users(id);

-- Add comments for documentation
COMMENT ON COLUMN temperature_readings.method IS 'Metodo rilevazione: manual, digital_thermometer, sensor';
COMMENT ON COLUMN temperature_readings.notes IS 'Note aggiuntive operatore';
COMMENT ON COLUMN temperature_readings.photo_evidence IS 'URL foto evidenza';
COMMENT ON COLUMN temperature_readings.recorded_by IS 'UUID utente che ha registrato';
