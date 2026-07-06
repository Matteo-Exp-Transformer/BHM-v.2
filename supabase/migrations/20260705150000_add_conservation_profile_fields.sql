-- conservation_points: profili appliance (onboarding + app conservazione)
ALTER TABLE public.conservation_points
ADD COLUMN IF NOT EXISTS appliance_category VARCHAR,
ADD COLUMN IF NOT EXISTS profile_id VARCHAR,
ADD COLUMN IF NOT EXISTS profile_config JSONB,
ADD COLUMN IF NOT EXISTS is_custom_profile BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.conservation_points.appliance_category IS 'Categoria appliance (es. vertical_fridge_with_freezer)';
COMMENT ON COLUMN public.conservation_points.profile_id IS 'ID profilo: string per standard, UUID per custom';
COMMENT ON COLUMN public.conservation_points.profile_config IS 'Config profilo SOLO per custom (NULL per standard)';
COMMENT ON COLUMN public.conservation_points.is_custom_profile IS 'true se custom, false se standard';

CREATE INDEX IF NOT EXISTS idx_conservation_points_profile
ON public.conservation_points(profile_id) WHERE profile_id IS NOT NULL;

-- Tabella profili custom (usata dall'app conservazione)
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

CREATE INDEX IF NOT EXISTS idx_custom_profiles_company_id
ON public.cons_point_custom_profile(company_id);

CREATE INDEX IF NOT EXISTS idx_custom_profiles_category
ON public.cons_point_custom_profile(appliance_category);

DROP TRIGGER IF EXISTS update_custom_profiles_updated_at ON public.cons_point_custom_profile;
CREATE TRIGGER update_custom_profiles_updated_at
  BEFORE UPDATE ON public.cons_point_custom_profile
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.cons_point_custom_profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view custom profiles" ON public.cons_point_custom_profile;
CREATE POLICY "Members can view custom profiles"
ON public.cons_point_custom_profile FOR SELECT
USING (is_company_member(company_id));

DROP POLICY IF EXISTS "Managers can manage custom profiles" ON public.cons_point_custom_profile;
CREATE POLICY "Managers can manage custom profiles"
ON public.cons_point_custom_profile FOR ALL
USING (has_management_role(company_id))
WITH CHECK (has_management_role(company_id));
