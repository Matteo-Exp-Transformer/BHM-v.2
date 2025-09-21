export interface ConservationPoint {
  id: string;
  company_id: string;
  department_id?: string;
  name: string;
  setpoint_temp: number;
  type: 'ambient' | 'fridge' | 'freezer' | 'blast';
  product_categories?: string[];
  status: 'normal' | 'warning' | 'critical';
  is_blast_chiller: boolean;
  maintenance_due?: Date;
  created_at: Date;
  updated_at: Date;

  // Relazioni
  department?: {
    id: string;
    name: string;
  };
  temperature_readings?: TemperatureReading[];
  products?: Product[];
  maintenance_tasks?: MaintenanceTask[];
}

export interface TemperatureReading {
  id: string;
  company_id: string;
  conservation_point_id: string;
  temperature: number;
  target_temperature?: number;
  tolerance_range_min?: number;
  tolerance_range_max?: number;
  status: 'compliant' | 'warning' | 'critical';
  recorded_by?: string;
  recorded_at: Date;
  method: 'manual' | 'digital_thermometer' | 'automatic_sensor';
  notes?: string;
  photo_evidence?: string;
  created_at: Date;

  // Relazioni
  conservation_point?: ConservationPoint;
  recorded_by_user?: {
    id: string;
    name: string;
  };
}

export interface Product {
  id: string;
  company_id: string;
  name: string;
  category_id?: string;
  department_id?: string;
  conservation_point_id?: string;
  barcode?: string;
  sku?: string;
  supplier_name?: string;
  purchase_date?: Date;
  expiry_date?: Date;
  quantity?: number;
  unit?: string;
  allergens?: string[];
  label_photo_url?: string;
  status: 'active' | 'expired' | 'consumed' | 'waste';
  notes?: string;
  created_at: Date;
  updated_at: Date;

  // Relazioni
  category?: ProductCategory;
  department?: {
    id: string;
    name: string;
  };
  conservation_point?: ConservationPoint;
}

export interface ProductCategory {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  temperature_requirement_min?: number;
  temperature_requirement_max?: number;
  allergen_info?: string[];
  created_at: Date;
  updated_at: Date;
}

export interface MaintenanceTask {
  id: string;
  company_id: string;
  conservation_point_id?: string;
  kind: 'temperature' | 'sanitization' | 'defrosting';
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  assigned_to?: string;
  assignment_type: 'user' | 'role' | 'category';
  next_due_date: Date;
  estimated_duration: number;
  checklist?: string[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;

  // Relazioni
  conservation_point?: ConservationPoint;
  assigned_user?: {
    id: string;
    name: string;
  };
  completions?: MaintenanceCompletion[];
}

export interface MaintenanceCompletion {
  id: string;
  company_id: string;
  maintenance_task_id: string;
  completed_by?: string;
  completed_at: Date;
  status: 'completed' | 'partial' | 'skipped';
  notes?: string;
  temperature_value?: number;
  checklist_completed?: string[];
  photo_evidence?: string[];
  next_due_date?: Date;

  // Relazioni
  maintenance_task?: MaintenanceTask;
  completed_by_user?: {
    id: string;
    name: string;
  };
}

// DTOs per creazione/aggiornamento
export interface CreateConservationPointRequest {
  name: string;
  setpoint_temp: number;
  type: ConservationPoint['type'];
  department_id?: string;
  product_categories?: string[];
  is_blast_chiller?: boolean;
}

export interface UpdateConservationPointRequest {
  name?: string;
  setpoint_temp?: number;
  type?: ConservationPoint['type'];
  department_id?: string;
  product_categories?: string[];
  status?: ConservationPoint['status'];
  is_blast_chiller?: boolean;
  maintenance_due?: Date;
}

export interface CreateTemperatureReadingRequest {
  conservation_point_id: string;
  temperature: number;
  target_temperature?: number;
  tolerance_range_min?: number;
  tolerance_range_max?: number;
  method: TemperatureReading['method'];
  notes?: string;
  photo_evidence?: string;
}

export interface CreateMaintenanceTaskRequest {
  conservation_point_id?: string;
  kind: MaintenanceTask['kind'];
  frequency: MaintenanceTask['frequency'];
  assigned_to?: string;
  assignment_type?: MaintenanceTask['assignment_type'];
  next_due_date: Date;
  estimated_duration?: number;
  checklist?: string[];
}

export interface CreateMaintenanceCompletionRequest {
  maintenance_task_id: string;
  status: MaintenanceCompletion['status'];
  notes?: string;
  temperature_value?: number;
  checklist_completed?: string[];
  photo_evidence?: string[];
  next_due_date?: Date;
}

// Filtri e query
export interface ConservationPointsFilter {
  type?: ConservationPoint['type'][];
  status?: ConservationPoint['status'][];
  department_id?: string;
  has_maintenance_due?: boolean;
}

export interface TemperatureReadingsFilter {
  conservation_point_id?: string;
  status?: TemperatureReading['status'][];
  method?: TemperatureReading['method'][];
  date_range?: {
    start: Date;
    end: Date;
  };
  recorded_by?: string;
}

export interface MaintenanceTasksFilter {
  conservation_point_id?: string;
  kind?: MaintenanceTask['kind'][];
  frequency?: MaintenanceTask['frequency'][];
  assigned_to?: string;
  is_active?: boolean;
  overdue?: boolean;
}

// Statistiche e metriche
export interface ConservationStats {
  total_points: number;
  by_type: Record<ConservationPoint['type'], number>;
  by_status: Record<ConservationPoint['status'], number>;
  temperature_compliance_rate: number;
  maintenance_compliance_rate: number;
  alerts_count: number;
}

export interface TemperatureStats {
  total_readings: number;
  compliance_rate: number;
  average_temperature: number;
  out_of_range_count: number;
  critical_alerts: number;
  trends: {
    date: Date;
    average_temp: number;
    compliance_rate: number;
  }[];
}

export interface MaintenanceStats {
  total_tasks: number;
  completed_rate: number;
  overdue_count: number;
  average_completion_time: number;
  upcoming_tasks: MaintenanceTask[];
}

// Configurazioni e impostazioni
export interface ConservationSettings {
  temperature_check_frequency: number; // minutes
  alert_thresholds: {
    temperature_deviation: number; // degrees
    maintenance_overdue_hours: number;
  };
  notification_settings: {
    temperature_alerts: boolean;
    maintenance_reminders: boolean;
    email_notifications: boolean;
    sms_notifications: boolean;
  };
  default_tolerance_ranges: Record<ConservationPoint['type'], {
    min_offset: number;
    max_offset: number;
  }>;
}

// Tipi per UI e interazioni
export interface ConservationPointCard {
  point: ConservationPoint;
  latest_reading?: TemperatureReading;
  pending_maintenance?: MaintenanceTask[];
  alerts_count: number;
  compliance_status: 'good' | 'warning' | 'critical';
}

export interface TemperatureChart {
  conservation_point_id: string;
  readings: {
    timestamp: Date;
    temperature: number;
    setpoint: number;
    status: TemperatureReading['status'];
  }[];
  range: {
    min: number;
    max: number;
  };
}

export interface MaintenanceCalendar {
  date: Date;
  tasks: (MaintenanceTask & {
    conservation_point_name?: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
  })[];
}