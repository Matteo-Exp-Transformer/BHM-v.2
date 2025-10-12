-- ============================================================================
-- Migration: 009_company_calendar_settings
-- Descrizione: Configurazione calendario aziendale con RLS multi-tenant
-- Data: 2025-10-12
-- Versione: 1.0.0
-- ============================================================================
--
-- SECURITY CRITICAL: Questa tabella contiene configurazioni sensibili
-- RLS policies OBBLIGATORIE per garantire isolamento multi-tenant
-- Ogni azienda deve vedere SOLO la propria configurazione
--
-- ============================================================================

-- ============================================================================
-- TABELLA: company_calendar_settings
-- ============================================================================

CREATE TABLE IF NOT EXISTS company_calendar_settings (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key (1:1 con companies)
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Anno Lavorativo
  fiscal_year_start DATE NOT NULL,
  fiscal_year_end DATE NOT NULL,

  -- Giorni Chiusura (array di date YYYY-MM-DD)
  -- Es: ['2025-08-15', '2025-12-25', '2025-12-26']
  closure_dates DATE[] DEFAULT '{}',

  -- Giorni Apertura Settimanali (0=domenica, 6=sabato)
  -- Es: [1,2,3,4,5] = lunedì-venerdì
  -- Es: [1,2,3,4,5,6] = lunedì-sabato
  open_weekdays INTEGER[] DEFAULT '{1,2,3,4,5,6}',

  -- Orari Apertura (JSONB flessibile)
  -- Struttura: { "weekday": [{"open": "HH:mm", "close": "HH:mm"}, ...] }
  -- Esempio 1 fascia: { "1": [{"open": "09:00", "close": "22:00"}] }
  -- Esempio 2 fasce: { "2": [{"open": "08:00", "close": "12:30"}, {"open": "16:30", "close": "23:00"}] }
  business_hours JSONB NOT NULL DEFAULT '{}',

  -- Stato Configurazione
  is_configured BOOLEAN NOT NULL DEFAULT false,

  -- Audit Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- CONSTRAINTS
-- ============================================================================

-- CONSTRAINT 1: Una sola configurazione per azienda (1:1 relation)
ALTER TABLE company_calendar_settings
  ADD CONSTRAINT company_calendar_settings_company_id_unique
  UNIQUE(company_id);

COMMENT ON CONSTRAINT company_calendar_settings_company_id_unique ON company_calendar_settings IS
'SECURITY: Ensures exactly one calendar configuration per company. Prevents duplicate configurations.';

-- CONSTRAINT 2: Anno lavorativo valido (fine > inizio)
ALTER TABLE company_calendar_settings
  ADD CONSTRAINT check_fiscal_year_valid
  CHECK (fiscal_year_end > fiscal_year_start);

COMMENT ON CONSTRAINT check_fiscal_year_valid ON company_calendar_settings IS
'VALIDATION: Fiscal year end must be after start date.';

-- CONSTRAINT 3: Almeno un giorno aperto
ALTER TABLE company_calendar_settings
  ADD CONSTRAINT check_at_least_one_weekday
  CHECK (cardinality(open_weekdays) > 0);

COMMENT ON CONSTRAINT check_at_least_one_weekday ON company_calendar_settings IS
'VALIDATION: At least one weekday must be open (business cannot be closed 7 days/week).';

-- CONSTRAINT 4: Giorni settimana validi (0-6)
ALTER TABLE company_calendar_settings
  ADD CONSTRAINT check_weekdays_range
  CHECK (
    open_weekdays <@ ARRAY[0,1,2,3,4,5,6]::INTEGER[]
  );

COMMENT ON CONSTRAINT check_weekdays_range ON company_calendar_settings IS
'VALIDATION: Weekdays must be in range 0-6 (Sunday=0, Saturday=6).';

-- ============================================================================
-- INDICI PER PERFORMANCE
-- ============================================================================

-- Indice principale: company_id (usato in tutte le query)
CREATE INDEX idx_company_calendar_settings_company_id
  ON company_calendar_settings(company_id);

-- Indice per configurazioni completate
CREATE INDEX idx_company_calendar_settings_configured
  ON company_calendar_settings(company_id, is_configured);

-- Indice per range anno lavorativo
CREATE INDEX idx_company_calendar_settings_fiscal_year
  ON company_calendar_settings(company_id, fiscal_year_start, fiscal_year_end);

-- ============================================================================
-- TRIGGER: Auto-update updated_at
-- ============================================================================

CREATE TRIGGER update_company_calendar_settings_updated_at
  BEFORE UPDATE ON company_calendar_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TRIGGER update_company_calendar_settings_updated_at ON company_calendar_settings IS
'AUTO-UPDATE: Automatically updates updated_at timestamp on every modification.';

-- ============================================================================
-- AUDIT TRIGGER: Tracciamento modifiche
-- ============================================================================

CREATE OR REPLACE FUNCTION audit_calendar_settings_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_user_role VARCHAR;
  v_user_email VARCHAR;
BEGIN
  -- Ottieni info utente corrente
  v_user_id := auth.uid();

  -- Ottieni ruolo utente nell'azienda
  SELECT role INTO v_user_role
  FROM company_members
  WHERE user_id = v_user_id
    AND company_id = COALESCE(NEW.company_id, OLD.company_id)
    AND is_active = true
  LIMIT 1;

  -- Ottieni email utente
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = v_user_id;

  -- Registra azione in audit_logs
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (
      user_id, company_id, table_name, record_id, action,
      new_data, user_role, user_email
    ) VALUES (
      v_user_id, NEW.company_id, 'company_calendar_settings', NEW.id, 'INSERT',
      to_jsonb(NEW), v_user_role, v_user_email
    );

  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (
      user_id, company_id, table_name, record_id, action,
      old_data, new_data, user_role, user_email
    ) VALUES (
      v_user_id, NEW.company_id, 'company_calendar_settings', NEW.id, 'UPDATE',
      to_jsonb(OLD), to_jsonb(NEW), v_user_role, v_user_email
    );

  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (
      user_id, company_id, table_name, record_id, action,
      old_data, user_role, user_email
    ) VALUES (
      v_user_id, OLD.company_id, 'company_calendar_settings', OLD.id, 'DELETE',
      to_jsonb(OLD), v_user_role, v_user_email
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION audit_calendar_settings_changes() IS
'AUDIT: Automatically logs all changes (INSERT/UPDATE/DELETE) to calendar settings for compliance.';

-- Attiva audit trigger
CREATE TRIGGER audit_calendar_settings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON company_calendar_settings
  FOR EACH ROW
  EXECUTE FUNCTION audit_calendar_settings_changes();

COMMENT ON TRIGGER audit_calendar_settings_trigger ON company_calendar_settings IS
'AUDIT TRAIL: Tracks all modifications for HACCP compliance and security monitoring.';

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
--
-- SECURITY CRITICAL: RLS garantisce isolamento totale multi-tenant
-- Ogni azienda è una "cassaforte" - nessun dato cross-company
--
-- ============================================================================

-- ABILITA RLS (OBBLIGATORIO)
ALTER TABLE company_calendar_settings ENABLE ROW LEVEL SECURITY;

-- Verifica che RLS sia attivo
DO $$
BEGIN
  IF NOT (
    SELECT rowsecurity
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename = 'company_calendar_settings'
  ) THEN
    RAISE EXCEPTION 'SECURITY VIOLATION: RLS NOT ENABLED on company_calendar_settings!';
  END IF;
END $$;

-- ============================================================================
-- POLICY 1: SELECT - Membri possono vedere solo settings della propria azienda
-- ============================================================================

DROP POLICY IF EXISTS "Members can view calendar settings" ON company_calendar_settings;

CREATE POLICY "Members can view calendar settings"
  ON company_calendar_settings FOR SELECT
  USING (
    -- SECURITY CHECK: Utente deve essere membro attivo dell'azienda
    is_company_member(company_id)
  );

COMMENT ON POLICY "Members can view calendar settings" ON company_calendar_settings IS
'SECURITY: Users can ONLY view calendar settings of companies they are active members of. Enforces multi-tenant isolation.';

-- ============================================================================
-- POLICY 2: INSERT - Solo admin può creare configurazione
-- ============================================================================

DROP POLICY IF EXISTS "Admins can create calendar settings" ON company_calendar_settings;

CREATE POLICY "Admins can create calendar settings"
  ON company_calendar_settings FOR INSERT
  WITH CHECK (
    -- SECURITY CHECK 1: Utente deve essere admin dell'azienda
    is_admin(company_id)
    -- SECURITY CHECK 2: Non deve già esistere configurazione per questa azienda
    AND NOT EXISTS (
      SELECT 1 FROM company_calendar_settings
      WHERE company_calendar_settings.company_id = company_id
    )
  );

COMMENT ON POLICY "Admins can create calendar settings" ON company_calendar_settings IS
'SECURITY: Only company admins can create calendar settings. Prevents duplicate configurations and unauthorized creation.';

-- ============================================================================
-- POLICY 3: UPDATE - Solo admin/responsabile possono modificare
-- ============================================================================

DROP POLICY IF EXISTS "Managers can update calendar settings" ON company_calendar_settings;

CREATE POLICY "Managers can update calendar settings"
  ON company_calendar_settings FOR UPDATE
  USING (
    -- SECURITY CHECK: Utente deve avere ruolo gestionale
    has_management_role(company_id)
  )
  WITH CHECK (
    -- SECURITY CHECK: Verifica che company_id non cambi (immutabile)
    company_id = (
      SELECT company_calendar_settings.company_id
      FROM company_calendar_settings
      WHERE company_calendar_settings.id = id
    )
  );

COMMENT ON POLICY "Managers can update calendar settings" ON company_calendar_settings IS
'SECURITY: Only admins/responsabili can update settings. WITH CHECK prevents company_id tampering.';

-- ============================================================================
-- POLICY 4: DELETE - Solo admin può eliminare
-- ============================================================================

DROP POLICY IF EXISTS "Admins can delete calendar settings" ON company_calendar_settings;

CREATE POLICY "Admins can delete calendar settings"
  ON company_calendar_settings FOR DELETE
  USING (
    -- SECURITY CHECK: Solo admin può eliminare configurazione
    is_admin(company_id)
  );

COMMENT ON POLICY "Admins can delete calendar settings" ON company_calendar_settings IS
'SECURITY: Only company admins can delete calendar configuration. Critical operation restricted to highest privilege.';

-- ============================================================================
-- COMMENTI TABELLA
-- ============================================================================

COMMENT ON TABLE company_calendar_settings IS
'CALENDAR CONFIGURATION: Stores business calendar settings per company (fiscal year, closure dates, business hours).
SECURITY: RLS enabled - multi-tenant isolation enforced.
AUDIT: All changes automatically logged to audit_logs table.';

COMMENT ON COLUMN company_calendar_settings.id IS
'Primary key UUID.';

COMMENT ON COLUMN company_calendar_settings.company_id IS
'Foreign key to companies table. One-to-one relationship. RLS filters by this field.';

COMMENT ON COLUMN company_calendar_settings.fiscal_year_start IS
'Start date of fiscal/working year (YYYY-MM-DD). Calendar will show events starting from this date.';

COMMENT ON COLUMN company_calendar_settings.fiscal_year_end IS
'End date of fiscal/working year (YYYY-MM-DD). Calendar will show events up to this date.';

COMMENT ON COLUMN company_calendar_settings.closure_dates IS
'Array of closure dates (holidays, maintenance days). Format: YYYY-MM-DD. No events scheduled on these dates.';

COMMENT ON COLUMN company_calendar_settings.open_weekdays IS
'Array of weekdays business is open. 0=Sunday, 1=Monday, ..., 6=Saturday. Example: [1,2,3,4,5] = Mon-Fri.';

COMMENT ON COLUMN company_calendar_settings.business_hours IS
'JSONB object mapping weekday to business hours. Format: {"1": [{"open":"09:00","close":"22:00"}], "2": [{"open":"08:00","close":"12:30"},{"open":"16:30","close":"23:00"}]}. Supports 1-2 time slots per day.';

COMMENT ON COLUMN company_calendar_settings.is_configured IS
'Flag indicating if calendar has been configured. Used to show/hide configuration wizard.';

-- ============================================================================
-- TEST RLS POLICIES (Esempi per verifica manuale)
-- ============================================================================

-- TEST 1: Verifica RLS attivo
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'company_calendar_settings';
-- EXPECTED: rowsecurity = TRUE

-- TEST 2: Verifica policies create
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'company_calendar_settings';
-- EXPECTED: 4 policies (SELECT, INSERT, UPDATE, DELETE)

-- TEST 3: Test isolamento (come user azienda A)
-- SELECT * FROM company_calendar_settings;
-- EXPECTED: Solo settings della propria azienda

-- TEST 4: Test cross-company (tentativo accesso azienda B)
-- SELECT * FROM company_calendar_settings WHERE company_id = '[azienda-B-id]';
-- EXPECTED: 0 righe (RLS blocca accesso)

-- ============================================================================
-- FINE MIGRATION
-- ============================================================================
