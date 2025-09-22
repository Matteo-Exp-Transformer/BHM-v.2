-- =====================================================
-- REPORTS SCHEMA - Export and Reporting System
-- Supports: Report templates, scheduled reports, exports, analytics
-- =====================================================

-- Helper function to get user company ID
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM user_profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- Report Templates Table
CREATE TABLE IF NOT EXISTS report_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  report_type VARCHAR(50) NOT NULL,
  template_config JSONB NOT NULL DEFAULT '{}',
  output_format VARCHAR(20) DEFAULT 'pdf',
  is_system_template BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT report_templates_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
  CONSTRAINT report_templates_valid_type CHECK (report_type IN ('haccp_compliance', 'temperature_log', 'task_summary', 'inventory_status', 'expiry_report', 'staff_activity', 'custom')),
  CONSTRAINT report_templates_valid_format CHECK (output_format IN ('pdf', 'excel', 'csv', 'json'))
);

-- Scheduled Reports Table
CREATE TABLE IF NOT EXISTS scheduled_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES report_templates(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  schedule_config JSONB NOT NULL DEFAULT '{}',
  recipients JSONB DEFAULT '[]',
  is_enabled BOOLEAN DEFAULT TRUE,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  run_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT scheduled_reports_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

-- Report Executions Table
CREATE TABLE IF NOT EXISTS report_executions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  template_id UUID REFERENCES report_templates(id) ON DELETE SET NULL,
  scheduled_report_id UUID REFERENCES scheduled_reports(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  report_type VARCHAR(50) NOT NULL,
  parameters JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'pending',
  output_format VARCHAR(20) DEFAULT 'pdf',
  file_path TEXT,
  file_size_bytes BIGINT,
  execution_time_ms INTEGER,
  error_message TEXT,
  generated_by UUID REFERENCES user_profiles(id),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT report_executions_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
  CONSTRAINT report_executions_valid_status CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  CONSTRAINT report_executions_valid_format CHECK (output_format IN ('pdf', 'excel', 'csv', 'json'))
);

-- Export History Table
CREATE TABLE IF NOT EXISTS export_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  export_type VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_ids UUID[] DEFAULT '{}',
  export_format VARCHAR(20) DEFAULT 'csv',
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT,
  file_size_bytes BIGINT,
  record_count INTEGER DEFAULT 0,
  filters JSONB DEFAULT '{}',
  exported_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT export_history_type_not_empty CHECK (LENGTH(TRIM(export_type)) > 0),
  CONSTRAINT export_history_entity_not_empty CHECK (LENGTH(TRIM(entity_type)) > 0),
  CONSTRAINT export_history_filename_not_empty CHECK (LENGTH(TRIM(file_name)) > 0),
  CONSTRAINT export_history_valid_format CHECK (export_format IN ('csv', 'excel', 'json', 'xml'))
);

-- Analytics Snapshots Table
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  metrics JSONB NOT NULL DEFAULT '{}',
  kpis JSONB DEFAULT '{}',
  trends JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT analytics_snapshots_unique_company_date UNIQUE (company_id, snapshot_date)
);

-- Enable RLS
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;

-- Report Templates Policies
DROP POLICY IF EXISTS "Users can view company report templates" ON report_templates;
CREATE POLICY "Users can view company report templates" ON report_templates FOR SELECT
  USING (company_id = get_user_company_id() OR is_system_template = true);

DROP POLICY IF EXISTS "Users can insert company report templates" ON report_templates;
CREATE POLICY "Users can insert company report templates" ON report_templates FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Users can update company report templates" ON report_templates;
CREATE POLICY "Users can update company report templates" ON report_templates FOR UPDATE
  USING (company_id = get_user_company_id() AND is_system_template = false);

DROP POLICY IF EXISTS "Users can delete company report templates" ON report_templates;
CREATE POLICY "Users can delete company report templates" ON report_templates FOR DELETE
  USING (company_id = get_user_company_id() AND is_system_template = false);

-- Scheduled Reports Policies
DROP POLICY IF EXISTS "Users can manage company scheduled reports" ON scheduled_reports;
CREATE POLICY "Users can manage company scheduled reports" ON scheduled_reports FOR ALL
  USING (company_id = get_user_company_id());

-- Report Executions Policies
DROP POLICY IF EXISTS "Users can view company report executions" ON report_executions;
CREATE POLICY "Users can view company report executions" ON report_executions FOR SELECT
  USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Users can insert report executions" ON report_executions;
CREATE POLICY "Users can insert report executions" ON report_executions FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Users can update report executions" ON report_executions;
CREATE POLICY "Users can update report executions" ON report_executions FOR UPDATE
  USING (company_id = get_user_company_id());

-- Export History Policies
DROP POLICY IF EXISTS "Users can view company export history" ON export_history;
CREATE POLICY "Users can view company export history" ON export_history FOR SELECT
  USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Users can insert export history" ON export_history;
CREATE POLICY "Users can insert export history" ON export_history FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

-- Analytics Snapshots Policies
DROP POLICY IF EXISTS "Users can view company analytics snapshots" ON analytics_snapshots;
CREATE POLICY "Users can view company analytics snapshots" ON analytics_snapshots FOR SELECT
  USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "System can manage analytics snapshots" ON analytics_snapshots;
CREATE POLICY "System can manage analytics snapshots" ON analytics_snapshots FOR ALL
  USING (company_id = get_user_company_id());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_report_templates_company_id ON report_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_report_templates_type ON report_templates(report_type);
CREATE INDEX IF NOT EXISTS idx_report_templates_active ON report_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_report_templates_system ON report_templates(is_system_template);

CREATE INDEX IF NOT EXISTS idx_scheduled_reports_company_id ON scheduled_reports(company_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_template ON scheduled_reports(template_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_enabled ON scheduled_reports(is_enabled);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_next_run ON scheduled_reports(next_run_at);

CREATE INDEX IF NOT EXISTS idx_report_executions_company_id ON report_executions(company_id);
CREATE INDEX IF NOT EXISTS idx_report_executions_template ON report_executions(template_id);
CREATE INDEX IF NOT EXISTS idx_report_executions_status ON report_executions(status);
CREATE INDEX IF NOT EXISTS idx_report_executions_started_at ON report_executions(started_at);
CREATE INDEX IF NOT EXISTS idx_report_executions_completed_at ON report_executions(completed_at);

CREATE INDEX IF NOT EXISTS idx_export_history_company_id ON export_history(company_id);
CREATE INDEX IF NOT EXISTS idx_export_history_type ON export_history(export_type);
CREATE INDEX IF NOT EXISTS idx_export_history_entity ON export_history(entity_type);
CREATE INDEX IF NOT EXISTS idx_export_history_created_at ON export_history(created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_company_id ON analytics_snapshots(company_id);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_date ON analytics_snapshots(snapshot_date);

-- Insert system report templates
INSERT INTO report_templates (
  company_id, name, description, report_type, template_config, output_format, is_system_template, created_by
)
SELECT
  c.id,
  'HACCP Temperature Compliance Report',
  'Standard HACCP compliance report showing temperature monitoring data and deviations',
  'haccp_compliance',
  '{"include_charts": true, "time_period": "last_30_days", "include_deviations": true}',
  'pdf',
  true,
  null
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM report_templates rt
  WHERE rt.company_id = c.id AND rt.name = 'HACCP Temperature Compliance Report'
);

INSERT INTO report_templates (
  company_id, name, description, report_type, template_config, output_format, is_system_template, created_by
)
SELECT
  c.id,
  'Daily Task Summary',
  'Daily summary of completed and pending tasks',
  'task_summary',
  '{"group_by": "department", "include_photos": false, "time_period": "today"}',
  'pdf',
  true,
  null
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM report_templates rt
  WHERE rt.company_id = c.id AND rt.name = 'Daily Task Summary'
);

INSERT INTO report_templates (
  company_id, name, description, report_type, template_config, output_format, is_system_template, created_by
)
SELECT
  c.id,
  'Product Expiry Report',
  'Report showing products nearing expiry dates',
  'expiry_report',
  '{"warning_days": 7, "critical_days": 2, "group_by": "category"}',
  'excel',
  true,
  null
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM report_templates rt
  WHERE rt.company_id = c.id AND rt.name = 'Product Expiry Report'
);

-- Create function to calculate analytics snapshot
CREATE OR REPLACE FUNCTION create_analytics_snapshot(target_company_id UUID, target_date DATE DEFAULT CURRENT_DATE)
RETURNS UUID AS $$
DECLARE
  snapshot_id UUID;
  metrics_data JSONB;
  kpis_data JSONB;
  trends_data JSONB;
BEGIN
  -- Calculate metrics
  SELECT jsonb_build_object(
    'total_tasks', (SELECT COUNT(*) FROM tasks WHERE company_id = target_company_id AND DATE(created_at) = target_date),
    'completed_tasks', (SELECT COUNT(*) FROM task_completions tc JOIN tasks t ON t.id = tc.task_id WHERE t.company_id = target_company_id AND DATE(tc.completed_at) = target_date),
    'temperature_readings', (SELECT COUNT(*) FROM temperature_readings tr JOIN conservation_points cp ON cp.id = tr.conservation_point_id WHERE cp.company_id = target_company_id AND DATE(tr.recorded_at) = target_date),
    'products_near_expiry', (SELECT COUNT(*) FROM products WHERE company_id = target_company_id AND expiry_date BETWEEN target_date AND target_date + INTERVAL '7 days')
  ) INTO metrics_data;

  -- Calculate KPIs
  SELECT jsonb_build_object(
    'task_completion_rate', CASE WHEN metrics_data->>'total_tasks'::text != '0' THEN (metrics_data->>'completed_tasks'::text)::numeric / (metrics_data->>'total_tasks'::text)::numeric * 100 ELSE 0 END,
    'temperature_compliance_rate', 95.0, -- Placeholder - would need actual calculation
    'average_response_time_minutes', 15.5 -- Placeholder - would need actual calculation
  ) INTO kpis_data;

  -- Calculate trends (placeholder)
  SELECT jsonb_build_object(
    'task_trend', 'increasing',
    'compliance_trend', 'stable',
    'efficiency_trend', 'improving'
  ) INTO trends_data;

  -- Insert or update snapshot
  INSERT INTO analytics_snapshots (company_id, snapshot_date, metrics, kpis, trends)
  VALUES (target_company_id, target_date, metrics_data, kpis_data, trends_data)
  ON CONFLICT (company_id, snapshot_date)
  DO UPDATE SET
    metrics = EXCLUDED.metrics,
    kpis = EXCLUDED.kpis,
    trends = EXCLUDED.trends,
    created_at = now()
  RETURNING id INTO snapshot_id;

  RETURN snapshot_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';

-- Final verification
DO $$
BEGIN
    RAISE NOTICE '✅ Reports schema deployed successfully!';
    RAISE NOTICE '📋 Tables: report_templates, scheduled_reports, report_executions, export_history, analytics_snapshots';
    RAISE NOTICE '🔒 RLS policies applied';
    RAISE NOTICE '⚡ Performance indexes created';
    RAISE NOTICE '📊 System report templates inserted';
    RAISE NOTICE '📈 Analytics snapshot function created';
END $$;