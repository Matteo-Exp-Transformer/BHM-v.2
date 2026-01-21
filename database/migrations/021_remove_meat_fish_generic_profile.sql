-- Migration: Rimuove profilo "Carne + Pesce + Generico" dal database
-- Versione: 021
-- Data: 2026-01-20
-- Descrizione: Elimina il profilo meat_fish_generic che non è più supportato

-- STEP 1: Verificare punti di conservazione che usano questo profilo
DO $$
DECLARE
  points_with_profile INTEGER;
BEGIN
  SELECT COUNT(*) INTO points_with_profile
  FROM public.conservation_points
  WHERE profile_id = 'meat_fish_generic';

  IF points_with_profile > 0 THEN
    RAISE NOTICE '⚠️ Trovati % punti di conservazione con profilo meat_fish_generic', points_with_profile;
    RAISE NOTICE 'Il profilo verrà rimosso e profile_id impostato a NULL';
  ELSE
    RAISE NOTICE '✅ Nessun punto di conservazione trovato con profilo meat_fish_generic';
  END IF;
END $$;

-- STEP 2: Rimuovere il profilo dai punti di conservazione esistenti
-- Imposta profile_id a NULL per i punti che usano meat_fish_generic
UPDATE public.conservation_points
SET 
  profile_id = NULL,
  appliance_category = NULL,
  is_custom_profile = false,
  profile_config = NULL,
  updated_at = NOW()
WHERE profile_id = 'meat_fish_generic';

-- STEP 3: Verifica risultati
DO $$
DECLARE
  total_points INTEGER;
  updated_points INTEGER;
  remaining_meat_fish INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_points FROM public.conservation_points;
  SELECT COUNT(*) INTO updated_points 
    FROM public.conservation_points 
    WHERE profile_id IS NULL 
      AND updated_at >= NOW() - INTERVAL '1 minute';
  SELECT COUNT(*) INTO remaining_meat_fish 
    FROM public.conservation_points 
    WHERE profile_id = 'meat_fish_generic';

  RAISE NOTICE '✅ Migration 021 completed successfully';
  RAISE NOTICE 'Total conservation_points: %', total_points;
  RAISE NOTICE 'Points updated (profile_id set to NULL): %', updated_points;
  
  IF remaining_meat_fish > 0 THEN
    RAISE WARNING '⚠️ Ancora % punti con profile_id = meat_fish_generic', remaining_meat_fish;
  ELSE
    RAISE NOTICE '✅ Profilo meat_fish_generic rimosso completamente dal database';
  END IF;
END $$;
