-- ============================================================================
-- 🔍 QUERY SQL CONSOLIDATA: Verifica Configurazione Calendario
-- ============================================================================
-- Questa query mostra TUTTI i risultati in tabelle separate
-- Esegui nel SQL Editor di Supabase
-- ============================================================================

-- STEP 1: Verifica configurazioni esistenti
SELECT
  '=== 1️⃣ CONFIGURAZIONI CALENDARIO ===' as info,
  id,
  company_id,
  is_configured,
  fiscal_year_start,
  fiscal_year_end,
  open_weekdays,
  CASE
    WHEN closure_dates IS NULL THEN 'NULL ❌'
    WHEN jsonb_typeof(closure_dates) = 'array' THEN
      'Array con ' || jsonb_array_length(closure_dates) || ' date ✅'
    ELSE 'Tipo: ' || jsonb_typeof(closure_dates) || ' ❌'
  END AS closure_dates_status,
  created_at
FROM company_calendar_settings
ORDER BY created_at DESC;

-- STEP 2: Mostra giorni apertura in formato leggibile
SELECT
  '=== 2️⃣ GIORNI APERTURA ===' as info,
  company_id,
  CASE WHEN 1 = ANY(open_weekdays::int[]) THEN '✅' ELSE '❌' END || ' Lun' as lun,
  CASE WHEN 2 = ANY(open_weekdays::int[]) THEN '✅' ELSE '❌' END || ' Mar' as mar,
  CASE WHEN 3 = ANY(open_weekdays::int[]) THEN '✅' ELSE '❌' END || ' Mer' as mer,
  CASE WHEN 4 = ANY(open_weekdays::int[]) THEN '✅' ELSE '❌' END || ' Gio' as gio,
  CASE WHEN 5 = ANY(open_weekdays::int[]) THEN '✅' ELSE '❌' END || ' Ven' as ven,
  CASE WHEN 6 = ANY(open_weekdays::int[]) THEN '✅' ELSE '❌' END || ' Sab' as sab,
  CASE WHEN 0 = ANY(open_weekdays::int[]) THEN '✅' ELSE '❌' END || ' Dom' as dom
FROM company_calendar_settings
WHERE is_configured = true;

-- STEP 3: Lista prime 20 date di chiusura
SELECT
  '=== 3️⃣ DATE CHIUSURA (FERIE) ===' as info,
  company_id,
  date_value::text AS data_chiusura,
  to_char(date_value::date, 'Day DD/MM/YYYY') AS data_formattata,
  CASE EXTRACT(DOW FROM date_value::date)::int
    WHEN 0 THEN 'Domenica'
    WHEN 1 THEN 'Lunedì'
    WHEN 2 THEN 'Martedì'
    WHEN 3 THEN 'Mercoledì'
    WHEN 4 THEN 'Giovedì'
    WHEN 5 THEN 'Venerdì'
    WHEN 6 THEN 'Sabato'
  END as giorno_settimana
FROM company_calendar_settings,
     jsonb_array_elements_text(closure_dates) AS date_value
WHERE is_configured = true
  AND closure_dates IS NOT NULL
ORDER BY date_value::date
LIMIT 20;

-- STEP 4: Verifica tasks nei prossimi 30 giorni
SELECT
  '=== 4️⃣ TASKS PROSSIMI 30 GIORNI ===' as info,
  t.name AS task_name,
  t.next_due::date AS next_due,
  to_char(t.next_due, 'Day DD/MM') AS data_formattata,
  EXTRACT(DOW FROM t.next_due)::int AS dow,
  CASE
    WHEN EXTRACT(DOW FROM t.next_due)::int = ANY(c.open_weekdays::int[])
    THEN '✅ Lavorativo'
    ELSE '❌ NON Lavorativo'
  END AS check_giorno,
  CASE
    WHEN EXISTS (
      SELECT 1
      FROM company_calendar_settings c2,
           jsonb_array_elements_text(c2.closure_dates) AS closure_date
      WHERE c2.company_id = t.company_id
        AND closure_date = t.next_due::date::text
    )
    THEN '❌ IN FERIE'
    ELSE '✅ Aperto'
  END AS check_ferie
FROM tasks t
LEFT JOIN company_calendar_settings c ON c.company_id = t.company_id
WHERE t.next_due IS NOT NULL
  AND t.next_due >= CURRENT_DATE
  AND t.next_due <= CURRENT_DATE + INTERVAL '30 days'
  AND c.is_configured = true
ORDER BY t.next_due
LIMIT 20;

-- STEP 5: DIAGNOSI FINALE
SELECT
  '=== 5️⃣ DIAGNOSI ===' as info,
  company_id,
  CASE
    WHEN is_configured = false THEN '❌ NON CONFIGURATO'
    ELSE '✅ Configurato'
  END AS status_config,
  '✅ ' || array_length(open_weekdays::int[], 1) || ' giorni aperti' AS status_weekdays,
  CASE
    WHEN closure_dates IS NULL THEN '⚠️ NULL'
    WHEN jsonb_array_length(closure_dates) = 0 THEN '⚠️ 0 date'
    ELSE '✅ ' || jsonb_array_length(closure_dates) || ' date chiusura'
  END AS status_closures,
  '✅ ' || fiscal_year_start || ' → ' || fiscal_year_end AS anno_fiscale
FROM company_calendar_settings;
