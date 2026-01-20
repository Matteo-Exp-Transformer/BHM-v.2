-- Migration: Crea tabella per profili custom (futuro)
-- Versione: 019
-- Data: 2026-01-19
-- Agente: AGENT-2 (Database Specialist)

CREATE TABLE IF NOT EXISTS public.cons_point_custom_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  appliance_category VARCHAR NOT NULL,
  profile_config JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, name)
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_custom_profiles_company_id
ON public.cons_point_custom_profile(company_id);

CREATE INDEX IF NOT EXISTS idx_custom_profiles_category
ON public.cons_point_custom_profile(appliance_category);

-- Trigger per updated_at
CREATE TRIGGER update_custom_profiles_updated_at
  BEFORE UPDATE ON public.cons_point_custom_profile
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Commenti per documentazione
COMMENT ON TABLE public.cons_point_custom_profile IS 'Tabella per profili custom punto di conservazione (futuro)';
COMMENT ON COLUMN public.cons_point_custom_profile.company_id IS 'ID azienda proprietaria del profilo';
COMMENT ON COLUMN public.cons_point_custom_profile.name IS 'Nome del profilo custom';
COMMENT ON COLUMN public.cons_point_custom_profile.appliance_category IS 'Categoria appliance (es. vertical_fridge_with_freezer)';
COMMENT ON COLUMN public.cons_point_custom_profile.profile_config IS 'Configurazione profilo in formato JSONB';

-- Verifica risultati
DO $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'cons_point_custom_profile'
  ) INTO table_exists;

  IF table_exists THEN
    RAISE NOTICE '✅ Migration 019 completed successfully';
    RAISE NOTICE 'Table cons_point_custom_profile created';
    RAISE NOTICE 'Indexes created: idx_custom_profiles_company_id, idx_custom_profiles_category';
    RAISE NOTICE 'Trigger created: update_custom_profiles_updated_at';
  ELSE
    RAISE EXCEPTION '❌ Table cons_point_custom_profile was not created';
  END IF;
END $$;
