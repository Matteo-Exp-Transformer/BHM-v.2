-- Script per inserire mansioni retrodatate per testare la logica "In Ritardo"
-- Data di riferimento: 12 Ottobre 2025
-- Range "In Ritardo": 5 ottobre - 11 ottobre (da 1 settimana fa a ieri)

-- IMPORTANTE: Sostituisci questi valori con i tuoi ID reali:
-- - [YOUR_COMPANY_ID] con il tuo company_id
-- - [YOUR_DEPARTMENT_ID] con il tuo department_id (opzionale, può essere NULL)
-- - [YOUR_USER_ID] con il tuo auth user id

-- ========================================
-- MANSIONI OLTRE 1 SETTIMANA (NON dovrebbero apparire in "In Ritardo")
-- ========================================

-- Task del 1 Ottobre 2025 (11 giorni fa - OLTRE 1 settimana)
INSERT INTO public.tasks (
  id,
  company_id,
  name,
  description,
  frequency,
  assigned_to,
  assignment_type,
  assigned_to_role,
  priority,
  status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '[YOUR_COMPANY_ID]',
  '🧪 TEST: Controllo Temperatura (1 Ott) - OLTRE SETTIMANA',
  'Questa mansione è del 1 ottobre (11 giorni fa) e NON dovrebbe apparire in "In Ritardo"',
  'daily',
  'Responsabili',
  'role',
  'responsabile',
  'high',
  'pending',
  '2025-10-01 08:00:00+00',
  '2025-10-01 08:00:00+00'
);

-- Task del 3 Ottobre 2025 (9 giorni fa - OLTRE 1 settimana)
INSERT INTO public.tasks (
  id,
  company_id,
  name,
  description,
  frequency,
  assigned_to,
  assignment_type,
  assigned_to_role,
  priority,
  status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '[YOUR_COMPANY_ID]',
  '🧪 TEST: Pulizia Cucina (3 Ott) - OLTRE SETTIMANA',
  'Questa mansione è del 3 ottobre (9 giorni fa) e NON dovrebbe apparire in "In Ritardo"',
  'daily',
  'Cuochi',
  'category',
  NULL,
  'medium',
  'pending',
  '2025-10-03 09:00:00+00',
  '2025-10-03 09:00:00+00'
);

-- ========================================
-- MANSIONI IN RITARDO (5-11 Ottobre - DEVONO apparire)
-- ========================================

-- Task del 5 Ottobre 2025 (7 giorni fa - LIMITE INFERIORE del range)
INSERT INTO public.tasks (
  id,
  company_id,
  name,
  description,
  frequency,
  assigned_to,
  assignment_type,
  assigned_to_role,
  priority,
  status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '[YOUR_COMPANY_ID]',
  '🧪 TEST: Sanitizzazione Frigo (5 Ott) - IN RITARDO',
  'Questa mansione è del 5 ottobre (esattamente 7 giorni fa) e DEVE apparire in "In Ritardo"',
  'weekly',
  'Responsabili',
  'role',
  'responsabile',
  'critical',
  'pending',
  '2025-10-05 10:00:00+00',
  '2025-10-05 10:00:00+00'
);

-- Task del 7 Ottobre 2025 (5 giorni fa - IN RITARDO)
INSERT INTO public.tasks (
  id,
  company_id,
  name,
  description,
  frequency,
  assigned_to,
  assignment_type,
  assigned_to_role,
  priority,
  status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '[YOUR_COMPANY_ID]',
  '🧪 TEST: Controllo Scadenze Prodotti (7 Ott) - IN RITARDO',
  'Questa mansione è del 7 ottobre (5 giorni fa) e DEVE apparire in "In Ritardo"',
  'daily',
  'Dipendenti',
  'role',
  'dipendente',
  'high',
  'pending',
  '2025-10-07 14:00:00+00',
  '2025-10-07 14:00:00+00'
);

-- Task del 9 Ottobre 2025 (3 giorni fa - IN RITARDO)
INSERT INTO public.tasks (
  id,
  company_id,
  name,
  description,
  frequency,
  assigned_to,
  assignment_type,
  assigned_to_role,
  priority,
  status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '[YOUR_COMPANY_ID]',
  '🧪 TEST: Registrazione Temperature (9 Ott) - IN RITARDO',
  'Questa mansione è del 9 ottobre (3 giorni fa) e DEVE apparire in "In Ritardo"',
  'daily',
  'Responsabili',
  'role',
  'responsabile',
  'critical',
  'pending',
  '2025-10-09 08:00:00+00',
  '2025-10-09 08:00:00+00'
);

-- Task del 11 Ottobre 2025 (IERI - LIMITE SUPERIORE del range)
INSERT INTO public.tasks (
  id,
  company_id,
  name,
  description,
  frequency,
  assigned_to,
  assignment_type,
  assigned_to_role,
  priority,
  status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '[YOUR_COMPANY_ID]',
  '🧪 TEST: Pulizia Sala (11 Ott - IERI) - IN RITARDO',
  'Questa mansione è del 11 ottobre (IERI) e DEVE apparire in "In Ritardo"',
  'daily',
  'Camerieri',
  'category',
  NULL,
  'high',
  'pending',
  '2025-10-11 16:00:00+00',
  '2025-10-11 16:00:00+00'
);

-- ========================================
-- MANSIONI OGGI E FUTURE (NON devono apparire in "In Ritardo")
-- ========================================

-- Task del 12 Ottobre 2025 (OGGI - NON in ritardo)
INSERT INTO public.tasks (
  id,
  company_id,
  name,
  description,
  frequency,
  assigned_to,
  assignment_type,
  assigned_to_role,
  priority,
  status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '[YOUR_COMPANY_ID]',
  '🧪 TEST: Controllo Materie Prime (12 Ott - OGGI) - ATTIVO',
  'Questa mansione è di OGGI e NON deve apparire in "In Ritardo", ma in "Attive"',
  'daily',
  'Responsabili',
  'role',
  'responsabile',
  'high',
  'pending',
  '2025-10-12 08:00:00+00',
  '2025-10-12 08:00:00+00'
);

-- Task del 15 Ottobre 2025 (FUTURO - NON in ritardo)
INSERT INTO public.tasks (
  id,
  company_id,
  name,
  description,
  frequency,
  assigned_to,
  assignment_type,
  assigned_to_role,
  priority,
  status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '[YOUR_COMPANY_ID]',
  '🧪 TEST: Formazione Staff (15 Ott - FUTURO) - ATTIVO',
  'Questa mansione è del 15 ottobre (FUTURO) e NON deve apparire in "In Ritardo"',
  'monthly',
  'Admin',
  'role',
  'admin',
  'medium',
  'pending',
  '2025-10-15 10:00:00+00',
  '2025-10-15 10:00:00+00'
);

-- ========================================
-- RIEPILOGO ATTESO (per 12 Ottobre 2025):
-- ========================================
-- 
-- NON IN RITARDO (oltre 1 settimana):
-- ✅ 1 Ottobre - NON appare
-- ✅ 3 Ottobre - NON appare
--
-- IN RITARDO (5-11 Ottobre):
-- ✅ 5 Ottobre - APPARE in "In Ritardo" ⚠️
-- ✅ 7 Ottobre - APPARE in "In Ritardo" ⚠️
-- ✅ 9 Ottobre - APPARE in "In Ritardo" ⚠️
-- ✅ 11 Ottobre - APPARE in "In Ritardo" ⚠️
--
-- Count atteso "In Ritardo": 4
--
-- OGGI E FUTURE:
-- ✅ 12 Ottobre - APPARE in "Attive"
-- ✅ 15 Ottobre - APPARE in "Attive"
--
-- ========================================

-- Per rimuovere i task di test dopo il test:
-- DELETE FROM public.tasks WHERE name LIKE '🧪 TEST:%';

