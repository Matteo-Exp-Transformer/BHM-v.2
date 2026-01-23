-- ============================================================================
-- 🔍 QUERY SQL: Verifica Configurazione Calendario
-- ============================================================================
-- Esegui questa query nel SQL Editor di Supabase per verificare lo stato
-- del calendario e identificare il problema con il filtro eventi.
--
-- COME ESEGUIRE:
-- 1. Vai su https://supabase.com/dashboard
-- 2. Seleziona il tuo progetto
-- 3. Vai a "SQL Editor" nel menu laterale
-- 4. Clicca "New query"
-- 5. Incolla TUTTO questo file e clicca "Run"
-- ============================================================================

-- ============================================================================
-- 1️⃣ VERIFICA TABELLA COMPANY_CALENDAR_SETTINGS
-- ============================================================================
SELECT
  '1️⃣ CONFIGURAZIONI CALENDARIO' AS "SEZIONE",
  '' AS "────────────────────────";

SELECT
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
  END AS closure_dates_info,
  created_at,
  updated_at
FROM company_calendar_settings
ORDER BY created_at DESC;

-- ============================================================================
-- 2️⃣ DETTAGLIO GIORNI APERTURA
-- ============================================================================
SELECT
  '2️⃣ GIORNI APERTURA' AS "SEZIONE",
  '' AS "────────────────────────";

SELECT
  company_id,
  CASE
    WHEN 0 = ANY(open_weekdays::int[]) THEN '✅ Domenica' ELSE '❌ Domenica' END AS dom,
  CASE
    WHEN 1 = ANY(open_weekdays::int[]) THEN '✅ Lunedì' ELSE '❌ Lunedì' END AS lun,
  CASE
    WHEN 2 = ANY(open_weekdays::int[]) THEN '✅ Martedì' ELSE '❌ Martedì' END AS mar,
  CASE
    WHEN 3 = ANY(open_weekdays::int[]) THEN '✅ Mercoledì' ELSE '❌ Mercoledì' END AS mer,
  CASE
    WHEN 4 = ANY(open_weekdays::int[]) THEN '✅ Giovedì' ELSE '❌ Giovedì' END AS gio,
  CASE
    WHEN 5 = ANY(open_weekdays::int[]) THEN '✅ Venerdì' ELSE '❌ Venerdì' END AS ven,
  CASE
    WHEN 6 = ANY(open_weekdays::int[]) THEN '✅ Sabato' ELSE '❌ Sabato' END AS sab
FROM company_calendar_settings
WHERE is_configured = true;

-- ============================================================================
-- 3️⃣ DETTAGLIO DATE CHIUSURA (FERIE)
-- ============================================================================
SELECT
  '3️⃣ DATE CHIUSURA' AS "SEZIONE",
  '' AS "────────────────────────";

SELECT
  company_id,
  jsonb_array_length(closure_dates) AS num_date_chiusura,
  closure_dates
FROM company_calendar_settings
WHERE is_configured = true
  AND closure_dates IS NOT NULL;

-- Se ci sono date, mostra le prime 10:
SELECT
  company_id,
  date_value::text AS data_chiusura,
  to_char(date_value::date, 'Day DD/MM/YYYY') AS data_formattata,
  EXTRACT(DOW FROM date_value::date)::int AS giorno_settimana
FROM company_calendar_settings,
     jsonb_array_elements_text(closure_dates) AS date_value
WHERE is_configured = true
  AND closure_dates IS NOT NULL
ORDER BY date_value::date
LIMIT 10;

-- ============================================================================
-- 4️⃣ VERIFICA TASKS CON NEXT_DUE
-- ============================================================================
SELECT
  '4️⃣ TASKS CON NEXT_DUE' AS "SEZIONE",
  '' AS "────────────────────────";

SELECT
  t.id,
  t.name AS task_name,
  t.frequency,
  t.next_due::date AS next_due_date,
  EXTRACT(DOW FROM t.next_due)::int AS day_of_week,
  to_char(t.next_due, 'Day') AS day_name,
  CASE
    WHEN EXTRACT(DOW FROM t.next_due)::int = ANY(c.open_weekdays::int[])
    THEN '✅ Giorno lavorativo'
    ELSE '❌ Giorno NON lavorativo'
  END AS giorno_check,
  CASE
    WHEN EXISTS (
      SELECT 1
      FROM company_calendar_settings c2,
           jsonb_array_elements_text(c2.closure_dates) AS closure_date
      WHERE c2.company_id = t.company_id
        AND closure_date = t.next_due::date::text
    )
    THEN '❌ IN CLOSURE_DATES'
    ELSE '✅ Non in chiusura'
  END AS ferie_check
FROM tasks t
LEFT JOIN company_calendar_settings c ON c.company_id = t.company_id
WHERE t.next_due IS NOT NULL
  AND c.is_configured = true
ORDER BY t.next_due
LIMIT 10;

-- ============================================================================
-- 5️⃣ DIAGNOSI PROBLEMI
-- ============================================================================
SELECT
  '5️⃣ DIAGNOSI' AS "SEZIONE",
  '' AS "────────────────────────";

SELECT
  CASE
    WHEN COUNT(*) = 0 THEN '❌ PROBLEMA: Nessuna configurazione calendario trovata'
    WHEN COUNT(*) > 1 THEN '⚠️  WARNING: ' || COUNT(*) || ' configurazioni trovate (dovrebbe essercene solo una per company)'
    ELSE '✅ OK: Una configurazione trovata'
  END AS config_count_status,
  COUNT(*) AS num_configs
FROM company_calendar_settings;

SELECT
  company_id,
  CASE
    WHEN is_configured = false THEN '❌ CRITICO: is_configured = FALSE'
    ELSE '✅ Configurato'
  END AS configured_status,
  CASE
    WHEN open_weekdays IS NULL THEN '❌ CRITICO: open_weekdays è NULL'
    WHEN array_length(open_weekdays::int[], 1) = 0 THEN '❌ CRITICO: open_weekdays vuoto'
    WHEN array_length(open_weekdays::int[], 1) < 1 THEN '⚠️  WARNING: Meno di 1 giorno aperto'
    ELSE '✅ ' || array_length(open_weekdays::int[], 1) || ' giorni aperti'
  END AS weekdays_status,
  CASE
    WHEN closure_dates IS NULL THEN '⚠️  closure_dates è NULL'
    WHEN jsonb_typeof(closure_dates) != 'array' THEN '❌ CRITICO: closure_dates non è un array'
    WHEN jsonb_array_length(closure_dates) = 0 THEN '⚠️  Nessuna data di chiusura configurata'
    ELSE '✅ ' || jsonb_array_length(closure_dates) || ' date di chiusura'
  END AS closure_status,
  CASE
    WHEN fiscal_year_start IS NULL OR fiscal_year_end IS NULL THEN '❌ CRITICO: Anno fiscale non configurato'
    WHEN fiscal_year_start >= fiscal_year_end THEN '❌ CRITICO: Date anno fiscale invertite'
    ELSE '✅ Anno fiscale: ' || fiscal_year_start || ' → ' || fiscal_year_end
  END AS fiscal_year_status
FROM company_calendar_settings;

-- ============================================================================
-- 6️⃣ RIEPILOGO FINALE
-- ============================================================================
SELECT
  '6️⃣ RIEPILOGO' AS "SEZIONE",
  '' AS "────────────────────────";

SELECT
  '✅ = OK, ⚠️  = Warning, ❌ = Problema Critico' AS legenda;

-- Fine query
SELECT '✅ Query completata con successo!' AS status;
