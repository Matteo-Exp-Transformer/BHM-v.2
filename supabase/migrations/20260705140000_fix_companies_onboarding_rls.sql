-- Fix RLS onboarding: companies INSERT + SELECT per insert().select()
-- Applied: 2026-07-05

DROP POLICY IF EXISTS "Authenticated users can create company during onboarding" ON public.companies;
DROP POLICY IF EXISTS "Allow company insert during onboarding" ON public.companies;
CREATE POLICY "Allow company insert during onboarding"
ON public.companies FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allow company select during onboarding" ON public.companies;
CREATE POLICY "Allow company select during onboarding"
ON public.companies FOR SELECT
USING (
  id IN (
    SELECT company_id FROM public.company_members
    WHERE user_id = auth.uid() AND is_active = true
  )
  OR NOT EXISTS (
    SELECT 1 FROM public.company_members
    WHERE user_id = auth.uid() AND is_active = true
  )
);
