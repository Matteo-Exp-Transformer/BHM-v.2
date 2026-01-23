-- Script SQL per debuggare il problema BUG-005
-- Esegui questo in Supabase SQL Editor per verificare i dati

-- 1. Verifica che company_calendar_settings esista e sia configurato
SELECT
  company_id,
  is_configured,
  fiscal_year_start,
  fiscal_year_end,
  open_weekdays,
  closure_dates,
  created_at
FROM company_calendar_settings
LIMIT 5;

-- 2. Verifica che ci siano tasks create durante onboarding
SELECT
  id,
  name,
  frequency,
  next_due,
  recurrence_config,
  time_management,
  created_at
FROM tasks
WHERE company_id IN (
  SELECT company_id
  FROM company_calendar_settings
  WHERE is_configured = true
)
ORDER BY created_at DESC
LIMIT 10;

-- 3. Verifica che next_due sia nei giorni aperti
-- (questa query controlla se ci sono tasks con next_due in giorni NON lavorativi)
SELECT
  t.id,
  t.name,
  t.next_due,
  (t.next_due::date)::text as next_due_date,
  EXTRACT(DOW FROM t.next_due) as day_of_week,
  cs.open_weekdays,
  cs.closure_dates,
  CASE
    -- Check se il giorno della settimana è nei giorni aperti
    WHEN NOT (EXTRACT(DOW FROM t.next_due)::int = ANY(cs.open_weekdays)) THEN 'Giorno NON lavorativo!'
    -- Check se la data è in closure_dates (gestisce sia JSONB che array)
    WHEN cs.closure_dates IS NOT NULL AND
         (
           -- Se è un array PostgreSQL
           (cs.closure_dates::text LIKE '%[%' AND (t.next_due::date)::text = ANY(cs.closure_dates))
           OR
           -- Se è un JSONB, cerca la stringa all'interno
           (cs.closure_dates::text LIKE '%"%' AND cs.closure_dates::text LIKE '%' || (t.next_due::date)::text || '%')
         ) THEN 'Giorno di chiusura!'
    ELSE 'OK'
  END as status_check
FROM tasks t
JOIN company_calendar_settings cs ON t.company_id = cs.company_id
WHERE cs.is_configured = true
ORDER BY t.created_at DESC
LIMIT 20;

-- 4. Mostra esempio di closure_dates per verificare formato
SELECT
  company_id,
  closure_dates,
  array_length(closure_dates, 1) as num_closure_dates,
  open_weekdays,
  array_length(open_weekdays, 1) as num_open_days
FROM company_calendar_settings
WHERE is_configured = true;
