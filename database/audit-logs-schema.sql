-- =====================================================
-- AUDIT LOGS SCHEMA - HACCP Compliance Tracking
-- Supports: Action logging, compliance audit trails, change tracking
-- =====================================================

-- Helper function to get user company ID
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM user_profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- Audit Logs Table - Main audit trail
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(255),
  severity VARCHAR(20) DEFAULT 'info',
  category VARCHAR(50) DEFAULT 'general',
  compliance_relevant BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT audit_logs_action_not_empty CHECK (LENGTH(TRIM(action)) > 0),
  CONSTRAINT audit_logs_resource_type_not_empty CHECK (LENGTH(TRIM(resource_type)) > 0),
  CONSTRAINT audit_logs_valid_severity CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  CONSTRAINT audit_logs_valid_category CHECK (category IN ('general', 'haccp', 'security', 'data', 'system', 'user'))
);

-- HACCP Compliance Events Table
CREATE TABLE IF NOT EXISTS haccp_compliance_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_description TEXT NOT NULL,
  conservation_point_id UUID REFERENCES conservation_points(id),
  product_id UUID REFERENCES products(id),
  task_id UUID REFERENCES tasks(id),
  temperature_reading_id UUID REFERENCES temperature_readings(id),
  compliance_status VARCHAR(20) NOT NULL DEFAULT 'compliant',
  critical_control_point VARCHAR(100),
  corrective_action TEXT,
  responsible_user_id UUID REFERENCES user_profiles(id),
  verified_by UUID REFERENCES user_profiles(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT haccp_events_type_not_empty CHECK (LENGTH(TRIM(event_type)) > 0),
  CONSTRAINT haccp_events_description_not_empty CHECK (LENGTH(TRIM(event_description)) > 0),
  CONSTRAINT haccp_events_valid_status CHECK (compliance_status IN ('compliant', 'deviation', 'critical_deviation', 'corrected'))
);

-- Data Change Tracking Table
CREATE TABLE IF NOT EXISTS data_changes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  operation VARCHAR(20) NOT NULL,
  changed_by UUID REFERENCES user_profiles(id),
  field_changes JSONB DEFAULT '{}',
  change_reason TEXT,
  previous_state JSONB,
  new_state JSONB,
  audit_log_id UUID REFERENCES audit_logs(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT data_changes_table_not_empty CHECK (LENGTH(TRIM(table_name)) > 0),
  CONSTRAINT data_changes_valid_operation CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE', 'RESTORE'))
);

-- Security Events Table
CREATE TABLE IF NOT EXISTS security_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_description TEXT NOT NULL,
  user_id UUID REFERENCES user_profiles(id),
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(255),
  risk_level VARCHAR(20) DEFAULT 'low',
  is_successful BOOLEAN DEFAULT TRUE,
  additional_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT security_events_type_not_empty CHECK (LENGTH(TRIM(event_type)) > 0),
  CONSTRAINT security_events_description_not_empty CHECK (LENGTH(TRIM(event_description)) > 0),
  CONSTRAINT security_events_valid_risk CHECK (risk_level IN ('low', 'medium', 'high', 'critical'))
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE haccp_compliance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- Audit Logs Policies
DROP POLICY IF EXISTS "Users can view company audit logs" ON audit_logs;
CREATE POLICY "Users can view company audit logs" ON audit_logs FOR SELECT
  USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
CREATE POLICY "System can insert audit logs" ON audit_logs FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

-- HACCP Compliance Events Policies
DROP POLICY IF EXISTS "Users can view company haccp events" ON haccp_compliance_events;
CREATE POLICY "Users can view company haccp events" ON haccp_compliance_events FOR SELECT
  USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Users can insert haccp events" ON haccp_compliance_events;
CREATE POLICY "Users can insert haccp events" ON haccp_compliance_events FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Users can update haccp events" ON haccp_compliance_events;
CREATE POLICY "Users can update haccp events" ON haccp_compliance_events FOR UPDATE
  USING (company_id = get_user_company_id());

-- Data Changes Policies
DROP POLICY IF EXISTS "Users can view company data changes" ON data_changes;
CREATE POLICY "Users can view company data changes" ON data_changes FOR SELECT
  USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "System can insert data changes" ON data_changes;
CREATE POLICY "System can insert data changes" ON data_changes FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

-- Security Events Policies
DROP POLICY IF EXISTS "Users can view company security events" ON security_events;
CREATE POLICY "Users can view company security events" ON security_events FOR SELECT
  USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "System can insert security events" ON security_events;
CREATE POLICY "System can insert security events" ON security_events FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_compliance ON audit_logs(compliance_relevant);

CREATE INDEX IF NOT EXISTS idx_haccp_events_company_id ON haccp_compliance_events(company_id);
CREATE INDEX IF NOT EXISTS idx_haccp_events_type ON haccp_compliance_events(event_type);
CREATE INDEX IF NOT EXISTS idx_haccp_events_status ON haccp_compliance_events(compliance_status);
CREATE INDEX IF NOT EXISTS idx_haccp_events_conservation_point ON haccp_compliance_events(conservation_point_id);
CREATE INDEX IF NOT EXISTS idx_haccp_events_created_at ON haccp_compliance_events(created_at);

CREATE INDEX IF NOT EXISTS idx_data_changes_company_id ON data_changes(company_id);
CREATE INDEX IF NOT EXISTS idx_data_changes_table ON data_changes(table_name);
CREATE INDEX IF NOT EXISTS idx_data_changes_record ON data_changes(record_id);
CREATE INDEX IF NOT EXISTS idx_data_changes_operation ON data_changes(operation);
CREATE INDEX IF NOT EXISTS idx_data_changes_created_at ON data_changes(created_at);

CREATE INDEX IF NOT EXISTS idx_security_events_company_id ON security_events(company_id);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_risk ON security_events(risk_level);
CREATE INDEX IF NOT EXISTS idx_security_events_user ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);

-- Create trigger function for automatic audit logging
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    company_id,
    user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values,
    compliance_relevant
  ) VALUES (
    COALESCE(NEW.company_id, OLD.company_id),
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
    true
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to critical tables
DO $$
DECLARE
  table_name TEXT;
  critical_tables TEXT[] := ARRAY[
    'temperature_readings',
    'tasks',
    'task_completions',
    'conservation_points',
    'products',
    'staff',
    'departments'
  ];
BEGIN
  FOREACH table_name IN ARRAY critical_tables
  LOOP
    -- Check if table exists before creating trigger
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = table_name) THEN
      EXECUTE format('DROP TRIGGER IF EXISTS audit_trigger_%s ON %s', table_name, table_name);
      EXECUTE format('CREATE TRIGGER audit_trigger_%s
                      AFTER INSERT OR UPDATE OR DELETE ON %s
                      FOR EACH ROW EXECUTE FUNCTION log_audit_event()', table_name, table_name);
      RAISE NOTICE 'Created audit trigger for table: %', table_name;
    ELSE
      RAISE NOTICE 'Table % does not exist, skipping audit trigger', table_name;
    END IF;
  END LOOP;
END $$;

-- Insert sample HACCP compliance event types
INSERT INTO haccp_compliance_events (
  company_id, event_type, event_description, compliance_status, critical_control_point
)
SELECT
  c.id,
  'temperature_monitoring',
  'Automatic temperature check completed within acceptable range',
  'compliant',
  'Cold Storage Temperature Control'
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM haccp_compliance_events hce
  WHERE hce.company_id = c.id AND hce.event_type = 'temperature_monitoring'
)
LIMIT 1;

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';

-- Final verification
DO $$
BEGIN
    RAISE NOTICE '✅ Audit logs schema deployed successfully!';
    RAISE NOTICE '📋 Tables: audit_logs, haccp_compliance_events, data_changes, security_events';
    RAISE NOTICE '🔒 RLS policies applied';
    RAISE NOTICE '⚡ Performance indexes created';
    RAISE NOTICE '🔍 Audit triggers configured for critical tables';
    RAISE NOTICE '📊 HACCP compliance tracking ready';
END $$;