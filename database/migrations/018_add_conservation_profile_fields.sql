-- Migration: Aggiunge campi per profili punto di conservazione
-- Versione: 018
-- Data: 2026-01-19
-- Agente: AGENT-2 (Database Specialist)

ALTER TABLE public.conservation_points
ADD COLUMN IF NOT EXISTS appliance_category VARCHAR,
ADD COLUMN IF NOT EXISTS profile_id VARCHAR,
ADD COLUMN IF NOT EXISTS profile_config JSONB,
ADD COLUMN IF NOT EXISTS is_custom_profile BOOLEAN DEFAULT false;

-- Commenti per documentazione
COMMENT ON COLUMN public.conservation_points.appliance_category IS 'Categoria appliance (es. vertical_fridge_with_freezer)';
COMMENT ON COLUMN public.conservation_points.profile_id IS 'ID profilo: string per standard, UUID per custom';
COMMENT ON COLUMN public.conservation_points.profile_config IS 'Config profilo SOLO per custom (NULL per standard)';
COMMENT ON COLUMN public.conservation_points.is_custom_profile IS 'true se custom, false se standard';

-- Index per query performance
CREATE INDEX IF NOT EXISTS idx_conservation_points_profile
ON public.conservation_points(profile_id) WHERE profile_id IS NOT NULL;

-- Verifica risultati
DO $$
DECLARE
  total_points INTEGER;
  with_profile INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_points FROM public.conservation_points;
  SELECT COUNT(*) INTO with_profile FROM public.conservation_points WHERE profile_id IS NOT NULL;

  RAISE NOTICE '✅ Migration 018 completed successfully';
  RAISE NOTICE 'Total conservation_points: %', total_points;
  RAISE NOTICE 'Points with profile: %', with_profile;
  RAISE NOTICE 'New columns added: appliance_category, profile_id, profile_config, is_custom_profile';
END $$;
