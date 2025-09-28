-- =====================================================
-- SETTINGS SCHEMA - Company Configuration System
-- Supports: Company settings, user preferences, notifications
-- =====================================================

-- Helper function to get user company ID
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM user_profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- Company Settings Table
CREATE TABLE IF NOT EXISTS company_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  setting_key VARCHAR(100) NOT NULL,
  setting_value JSONB NOT NULL DEFAULT '{}',
  setting_type VARCHAR(50) NOT NULL DEFAULT 'general',
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT company_settings_unique_key UNIQUE (company_id, setting_key),
  CONSTRAINT company_settings_key_not_empty CHECK (LENGTH(TRIM(setting_key)) > 0),
  CONSTRAINT company_settings_valid_type CHECK (setting_type IN ('general', 'haccp', 'notification', 'ui', 'integration'))
);

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  preference_key VARCHAR(100) NOT NULL,
  preference_value JSONB NOT NULL DEFAULT '{}',
  preference_category VARCHAR(50) NOT NULL DEFAULT 'general',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT user_preferences_unique_key UNIQUE (user_id, preference_key),
  CONSTRAINT user_preferences_key_not_empty CHECK (LENGTH(TRIM(preference_key)) > 0),
  CONSTRAINT user_preferences_valid_category CHECK (preference_category IN ('general', 'dashboard', 'notifications', 'calendar', 'ui'))
);

-- Notification Preferences Table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  delivery_method VARCHAR(20) DEFAULT 'email',
  frequency VARCHAR(20) DEFAULT 'immediate',
  custom_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT notification_preferences_unique_type UNIQUE (user_id, notification_type),
  CONSTRAINT notification_preferences_valid_type CHECK (notification_type IN ('task_due', 'temperature_alert', 'expiry_warning', 'system_update', 'weekly_report')),
  CONSTRAINT notification_preferences_valid_method CHECK (delivery_method IN ('email', 'push', 'sms', 'in_app')),
  CONSTRAINT notification_preferences_valid_frequency CHECK (frequency IN ('immediate', 'daily', 'weekly', 'monthly'))
);

-- System Configuration Table
CREATE TABLE IF NOT EXISTS system_configuration (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key VARCHAR(100) NOT NULL UNIQUE,
  config_value JSONB NOT NULL DEFAULT '{}',
  config_category VARCHAR(50) NOT NULL DEFAULT 'system',
  description TEXT,
  is_readonly BOOLEAN DEFAULT FALSE,
  requires_restart BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT system_configuration_key_not_empty CHECK (LENGTH(TRIM(config_key)) > 0),
  CONSTRAINT system_configuration_valid_category CHECK (config_category IN ('system', 'database', 'security', 'performance', 'integrations'))
);

-- Enable RLS
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_configuration ENABLE ROW LEVEL SECURITY;

-- Company Settings Policies
DROP POLICY IF EXISTS "Users can view company settings" ON company_settings;
CREATE POLICY "Users can view company settings" ON company_settings FOR SELECT
  USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Users can insert company settings" ON company_settings;
CREATE POLICY "Users can insert company settings" ON company_settings FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Users can update company settings" ON company_settings;
CREATE POLICY "Users can update company settings" ON company_settings FOR UPDATE
  USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Users can delete company settings" ON company_settings;
CREATE POLICY "Users can delete company settings" ON company_settings FOR DELETE
  USING (company_id = get_user_company_id());

-- User Preferences Policies
DROP POLICY IF EXISTS "Users can manage own preferences" ON user_preferences;
CREATE POLICY "Users can manage own preferences" ON user_preferences FOR ALL
  USING (user_id = auth.uid());

-- Notification Preferences Policies
DROP POLICY IF EXISTS "Users can manage own notifications" ON notification_preferences;
CREATE POLICY "Users can manage own notifications" ON notification_preferences FOR ALL
  USING (user_id = auth.uid());

-- System Configuration Policies (read-only for regular users)
DROP POLICY IF EXISTS "Users can view system config" ON system_configuration;
CREATE POLICY "Users can view system config" ON system_configuration FOR SELECT
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_company_settings_company_id ON company_settings(company_id);
CREATE INDEX IF NOT EXISTS idx_company_settings_key ON company_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_company_settings_type ON company_settings(setting_type);
CREATE INDEX IF NOT EXISTS idx_company_settings_active ON company_settings(is_active);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_key ON user_preferences(preference_key);
CREATE INDEX IF NOT EXISTS idx_user_preferences_category ON user_preferences(preference_category);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_type ON notification_preferences(notification_type);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_enabled ON notification_preferences(is_enabled);

CREATE INDEX IF NOT EXISTS idx_system_configuration_key ON system_configuration(config_key);
CREATE INDEX IF NOT EXISTS idx_system_configuration_category ON system_configuration(config_category);

-- Insert default company settings
INSERT INTO company_settings (company_id, setting_key, setting_value, setting_type, description, is_default)
SELECT
  c.id,
  'temperature_check_frequency',
  '{"hours": 2, "enabled": true}',
  'haccp',
  'Frequency of temperature checks in hours',
  true
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM company_settings cs
  WHERE cs.company_id = c.id AND cs.setting_key = 'temperature_check_frequency'
);

INSERT INTO company_settings (company_id, setting_key, setting_value, setting_type, description, is_default)
SELECT
  c.id,
  'default_timezone',
  '"Europe/Rome"',
  'general',
  'Default timezone for the company',
  true
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM company_settings cs
  WHERE cs.company_id = c.id AND cs.setting_key = 'default_timezone'
);

INSERT INTO company_settings (company_id, setting_key, setting_value, setting_type, description, is_default)
SELECT
  c.id,
  'expiry_warning_days',
  '{"warning": 3, "critical": 1}',
  'haccp',
  'Days before expiry to show warnings',
  true
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM company_settings cs
  WHERE cs.company_id = c.id AND cs.setting_key = 'expiry_warning_days'
);

-- Insert default system configuration
INSERT INTO system_configuration (config_key, config_value, config_category, description, is_readonly)
VALUES
  ('max_temperature_readings_per_day', '48', 'performance', 'Maximum temperature readings stored per conservation point per day', false),
  ('session_timeout_minutes', '480', 'security', 'User session timeout in minutes', false),
  ('backup_retention_days', '30', 'system', 'Number of days to retain database backups', false),
  ('max_file_upload_size_mb', '10', 'system', 'Maximum file upload size in megabytes', false)
ON CONFLICT (config_key) DO NOTHING;

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';

-- Final verification
DO $$
BEGIN
    RAISE NOTICE '✅ Settings schema deployed successfully!';
    RAISE NOTICE '📋 Tables: company_settings, user_preferences, notification_preferences, system_configuration';
    RAISE NOTICE '🔒 RLS policies applied';
    RAISE NOTICE '⚡ Performance indexes created';
    RAISE NOTICE '🎛️ Default settings inserted';
END $$;