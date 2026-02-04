-- SQL per GUIDA_TEST_conservation_checkup.md
-- Esegui i blocchi nella SQL Editor di Supabase quando indicato dalla guida.
-- Valori: company_id e conservation_point_id (Frigo A) già compilati.

-- ========== Test 3: Task arretrato 5 giorni ==========
INSERT INTO maintenance_tasks (
  company_id,
  conservation_point_id,
  title,
  type,
  frequency,
  estimated_duration,
  next_due,
  status,
  priority,
  assigned_to,
  assignment_type
) VALUES (
  'e39639e1-b7c1-43c3-b6c3-25fec15180e0',
  'de942961-2846-4c91-af9a-6510176a57b9',
  'Sanificazione arretrata',
  'sanitization',
  'weekly',
  120,
  NOW() - INTERVAL '5 days',
  'scheduled',
  'high',
  'Reparto cucina',
  'role'
);

-- ========== Test 3 bis: Arretrato 10 giorni (gravità critical) ==========
-- UPDATE maintenance_tasks
-- SET next_due = NOW() - INTERVAL '10 days'
-- WHERE title = 'Sanificazione arretrata';

-- ========== Test 4: Task di oggi ==========
INSERT INTO maintenance_tasks (
  company_id,
  conservation_point_id,
  title,
  type,
  frequency,
  estimated_duration,
  next_due,
  status,
  priority,
  assigned_to,
  assignment_type
) VALUES (
  'e39639e1-b7c1-43c3-b6c3-25fec15180e0',
  'de942961-2846-4c91-af9a-6510176a57b9',
  'Controllo temperatura',
  'temperature',
  'daily',
  30,
  NOW(),
  'scheduled',
  'medium',
  'Reparto cucina',
  'role'
);

-- ========== Test 7: Task Sanificazione per oggi (completamenti multipli) ==========
INSERT INTO maintenance_tasks (
  company_id,
  conservation_point_id,
  title,
  type,
  frequency,
  estimated_duration,
  next_due,
  status,
  priority,
  assigned_to,
  assignment_type
) VALUES (
  'e39639e1-b7c1-43c3-b6c3-25fec15180e0',
  'de942961-2846-4c91-af9a-6510176a57b9',
  'Sanificazione',
  'sanitization',
  'weekly',
  120,
  NOW(),
  'scheduled',
  'high',
  'Reparto cucina',
  'role'
);

-- ========== Test 8: Task mensile (trigger next_due) ==========
INSERT INTO maintenance_tasks (
  company_id,
  conservation_point_id,
  title,
  type,
  frequency,
  estimated_duration,
  next_due,
  status,
  priority,
  assigned_to,
  assignment_type
) VALUES (
  'e39639e1-b7c1-43c3-b6c3-25fec15180e0',
  'de942961-2846-4c91-af9a-6510176a57b9',
  'Sanificazione mensile',
  'sanitization',
  'monthly',
  120,
  NOW(),
  'scheduled',
  'high',
  'Reparto cucina',
  'role'
);

-- ========== Test 9: Due task (oggi + domani) ==========
INSERT INTO maintenance_tasks (
  company_id, conservation_point_id, title, type, frequency,
  estimated_duration, next_due, status, priority, assigned_to, assignment_type
) VALUES (
  'e39639e1-b7c1-43c3-b6c3-25fec15180e0',
  'de942961-2846-4c91-af9a-6510176a57b9',
  'Controllo temperatura oggi',
  'temperature', 'daily', 30, NOW(), 'scheduled', 'medium', 'Reparto cucina', 'role'
);
INSERT INTO maintenance_tasks (
  company_id, conservation_point_id, title, type, frequency,
  estimated_duration, next_due, status, priority, assigned_to, assignment_type
) VALUES (
  'e39639e1-b7c1-43c3-b6c3-25fec15180e0',
  'de942961-2846-4c91-af9a-6510176a57b9',
  'Controllo temperatura domani',
  'temperature', 'daily', 30, NOW() + INTERVAL '1 day', 'scheduled', 'medium', 'Reparto cucina', 'role'
);

-- ========== Verifiche (esegui dopo i test) ==========
-- Trigger presente:
-- SELECT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_task_on_completion');

-- Task mensile dopo completamento:
-- SELECT id, title, next_due, last_completed, status
-- FROM maintenance_tasks WHERE title = 'Sanificazione mensile';

-- Completamenti multipli:
-- SELECT * FROM maintenance_completions
-- WHERE maintenance_task_id = (SELECT id FROM maintenance_tasks WHERE title = 'Sanificazione' LIMIT 1)
-- ORDER BY completed_at;
