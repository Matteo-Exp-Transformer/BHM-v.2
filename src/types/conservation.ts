export interface ConservationPoint {
  id: string
  company_id: string
  department_id?: string
  name: string
  setpoint_temp: number
  type: 'ambient' | 'fridge' | 'freezer' | 'blast'
  product_categories?: string[]
  status: 'normal' | 'warning' | 'critical'
  is_blast_chiller: boolean
  maintenance_due?: Date
  created_at: Date
  updated_at: Date

  // Relazioni
  department?: {
    id: string
    name: string
  }
  temperature_readings?: TemperatureReading[]
  products?: Product[]
  maintenance_tasks?: MaintenanceTask[]
}

export type ConservationPointType = 'ambient' | 'fridge' | 'freezer' | 'blast'

export type ConservationStatus = 'normal' | 'warning' | 'critical'


export interface Product {
  id: string
  company_id: string
  name: string
  category_id?: string
  department_id?: string
  conservation_point_id?: string
  barcode?: string
  sku?: string
  supplier_name?: string
  purchase_date?: Date
  expiry_date?: Date
  quantity?: number
  unit?: string
  allergens?: string[]
  label_photo_url?: string
  status: 'active' | 'expired' | 'consumed' | 'waste'
  notes?: string
  created_at: Date
  updated_at: Date

  // Relazioni
  category?: ProductCategory
  department?: {
    id: string
    name: string
  }
  conservation_point?: ConservationPoint
}

export interface ProductCategory {
  id: string
  company_id: string
  name: string
  description?: string
  temperature_requirement_min?: number
  temperature_requirement_max?: number
  allergen_info?: string[]
  created_at: Date
  updated_at: Date
}

export interface TemperatureReading {
  id: string
  company_id: string
  conservation_point_id: string
  temperature: number
  target_temperature: number
  tolerance_range: { min: number; max: number }
  status: TemperatureStatus
  recorded_by: string
  recorded_at: Date
  method: TemperatureMethod
  notes?: string
  photo_evidence?: string
  validation_status: ValidationStatus
}

export type TemperatureStatus = 'compliant' | 'warning' | 'critical'

export type TemperatureMethod =
  | 'manual'
  | 'digital_thermometer'
  | 'automatic_sensor'

export type ValidationStatus = 'pending' | 'validated' | 'flagged'

export interface MaintenanceTask {
  id: string
  company_id: string
  conservation_point_id?: string
  kind: 'temperature' | 'sanitization' | 'defrosting'
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
  assigned_to?: string
  assignment_type: 'user' | 'role' | 'category'
  next_due_date: Date
  estimated_duration: number
  checklist?: readonly string[]
  is_active: boolean
  created_at: Date
  updated_at: Date

  // Relazioni
  conservation_point?: ConservationPoint
  assigned_user?: {
    id: string
    name: string
  }
  completions?: MaintenanceCompletion[]
}

export type MaintenanceType = 'temperature' | 'sanitization' | 'defrosting'

export type MaintenanceFrequency = 'daily' | 'weekly' | 'monthly' | 'custom'

export type MaintenanceStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'overdue'
  | 'skipped'

export type AssignmentType = 'user' | 'role' | 'category'


// DTOs per creazione/aggiornamento
export interface CreateConservationPointRequest {
  name: string
  setpoint_temp: number
  type: ConservationPoint['type']
  department_id?: string
  product_categories?: string[]
  is_blast_chiller?: boolean
}

export interface UpdateConservationPointRequest {
  name?: string
  setpoint_temp?: number
  type?: ConservationPoint['type']
  department_id?: string
  product_categories?: string[]
  status?: ConservationPoint['status']
  is_blast_chiller?: boolean
  maintenance_due?: Date
}

export interface CreateTemperatureReadingRequest {
  conservation_point_id: string
  temperature: number
  target_temperature?: number
  tolerance_range_min?: number
  tolerance_range_max?: number
  method: TemperatureReading['method']
  notes?: string
  photo_evidence?: string
}

export interface CreateMaintenanceTaskRequest {
  conservation_point_id?: string
  kind: MaintenanceTask['kind']
  frequency: MaintenanceTask['frequency']
  assigned_to?: string
  assignment_type?: MaintenanceTask['assignment_type']
  next_due_date: Date
  estimated_duration?: number
  checklist?: readonly string[]
}

export interface CreateMaintenanceCompletionRequest {
  maintenance_task_id: string
  status: MaintenanceCompletion['status']
  notes?: string
  temperature_value?: number
  checklist_completed?: string[]
  photo_evidence?: string[]
  next_due_date?: Date
}

// Filtri e query
export interface ConservationPointsFilter {
  type?: ConservationPoint['type'][]
  status?: ConservationPoint['status'][]
  department_id?: string
  has_maintenance_due?: boolean
}

export interface TemperatureReadingsFilter {
  conservation_point_id?: string
  status?: TemperatureReading['status'][]
  method?: TemperatureReading['method'][]
  date_range?: {
    start: Date
    end: Date
  }
  recorded_by?: string
}

export interface MaintenanceTasksFilter {
  conservation_point_id?: string
  kind?: MaintenanceTask['kind'][]
  frequency?: MaintenanceTask['frequency'][]
  assigned_to?: string
  is_active?: boolean
  overdue?: boolean
}

// Statistiche e metriche
export interface ConservationStats {
  total_points: number
  by_type: Record<ConservationPoint['type'], number>
  by_status: Record<ConservationPoint['status'], number>
  temperature_compliance_rate: number
  maintenance_compliance_rate: number
  alerts_count: number
}

export interface TemperatureStats {
  total_readings: number
  compliance_rate: number
  average_temperature: number
  out_of_range_count: number
  critical_alerts: number
  trends: {
    date: Date
    average_temp: number
    compliance_rate: number
  }[]
}

export interface MaintenanceStats {
  total_tasks: number
  completed_rate: number
  overdue_count: number
  average_completion_time: number
  upcoming_tasks: MaintenanceTask[]
}

// Configurazioni e impostazioni
export interface ConservationSettings {
  temperature_check_frequency: number // minutes
  alert_thresholds: {
    temperature_deviation: number // degrees
    maintenance_overdue_hours: number
  }
  notification_settings: {
    temperature_alerts: boolean
    maintenance_reminders: boolean
    email_notifications: boolean
    sms_notifications: boolean
  }
  default_tolerance_ranges: Record<
    ConservationPoint['type'],
    {
      min_offset: number
      max_offset: number
    }
  >
}

// Tipi per UI e interazioni
export interface ConservationPointCard {
  point: ConservationPoint
  latest_reading?: TemperatureReading
  pending_maintenance?: MaintenanceTask[]
  alerts_count: number
  compliance_status: 'good' | 'warning' | 'critical'
}

export interface TemperatureChart {
  conservation_point_id: string
  readings: {
    timestamp: Date
    temperature: number
    setpoint: number
    status: TemperatureReading['status']
  }[]
  range: {
    min: number
    max: number
  }
}

export interface MaintenanceCalendar {
  date: Date
  tasks: (MaintenanceTask & {
    conservation_point_name?: string
    priority: 'low' | 'medium' | 'high' | 'critical'
  })[]
}

export interface MaintenanceCompletion {
  id: string
  company_id: string
  maintenance_task_id: string
  completed_by: string
  completed_at: Date
  status: 'completed' | 'partial' | 'skipped'
  notes?: string
  temperature_value?: number // If it's a temperature maintenance
  checklist_completed: string[]
  photo_evidence?: string[]
  next_due_date?: Date // For recurring tasks
}

export const MAINTENANCE_TASK_TYPES = {
  temperature: {
    name: 'Controllo Temperature',
    icon: '🌡️',
    color: 'blue',
    defaultDuration: 15,
    defaultChecklist: [
      'Verificare la temperatura del punto di conservazione',
      'Registrare la lettura sul termometro',
      'Confrontare con i valori target',
      'Segnalare eventuali anomalie',
    ],
  },
  sanitization: {
    name: 'Sanificazione',
    icon: '🧼',
    color: 'green',
    defaultDuration: 30,
    defaultChecklist: [
      'Svuotare completamente il contenuto',
      'Pulire con detergente appropriato',
      'Disinfettare tutte le superfici',
      'Riempire con prodotti puliti',
      "Documentare l'intervento",
    ],
  },
  defrosting: {
    name: 'Sbrinamento',
    icon: '❄️',
    color: 'cyan',
    defaultDuration: 45,
    defaultChecklist: [
      'Trasferire i prodotti in altro freezer',
      "Spegnere l'apparecchiatura",
      'Attendere lo sbrinamento completo',
      'Pulire e asciugare',
      'Riaccendere e verificare temperatura',
      'Reinserire i prodotti',
    ],
  },
} as const

export const MAINTENANCE_COLORS = {
  pending: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-900',
    icon: 'text-yellow-600',
  },
  in_progress: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-900',
    icon: 'text-blue-600',
  },
  completed: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-900',
    icon: 'text-green-600',
  },
  overdue: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-900',
    icon: 'text-red-600',
  },
  skipped: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-900',
    icon: 'text-gray-600',
  },
  scheduled: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-900',
    icon: 'text-green-600',
  },
} as const

export function classifyConservationPoint(
  temperature: number,
  isBlastChiller: boolean
): ConservationPointType {
  if (isBlastChiller && temperature >= -99 && temperature <= -10) return 'blast'
  if (temperature >= -90 && temperature <= 0) return 'freezer'
  if (temperature >= 0 && temperature <= 9) return 'fridge'
  return 'ambient'
}

export function getConservationStatus(
  point: ConservationPoint
): ConservationStatus {
  const now = new Date()

  // Check if maintenance is overdue
  if (point.maintenance_due && point.maintenance_due < now) {
    return 'critical'
  }

  // Check if maintenance is due within 2 days
  if (point.maintenance_due) {
    const daysUntilDue = Math.ceil(
      (point.maintenance_due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysUntilDue <= 2) {
      return 'warning'
    }
  }

  // Check temperature reading status
  const latestReading = point.temperature_readings?.[0] // Assuming readings are sorted by date desc
  if (latestReading?.status === 'critical') {
    return 'critical'
  }

  if (latestReading?.status === 'warning') {
    return 'warning'
  }

  return 'normal'
}

// Temperature status calculation function
export function getTemperatureStatus(
  temperature: number,
  _targetTemp: number,
  toleranceMin: number,
  toleranceMax: number
): TemperatureStatus {
  if (temperature < toleranceMin || temperature > toleranceMax) {
    // Critical if temperature is way outside tolerance
    const criticalRangeMin = toleranceMin - 5
    const criticalRangeMax = toleranceMax + 5

    if (temperature < criticalRangeMin || temperature > criticalRangeMax) {
      return 'critical'
    }

    return 'warning'
  }

  return 'compliant'
}

export const CONSERVATION_COLORS = {
  normal: {
    bg: 'bg-green-100',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: 'text-green-600',
  },
  warning: {
    bg: 'bg-yellow-100',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    icon: 'text-yellow-600',
  },
  critical: {
    bg: 'bg-red-100',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: 'text-red-600',
  },
} as const

export const TEMPERATURE_RANGES = {
  blast: { min: -99, max: -10, optimal: -18 },
  freezer: { min: -90, max: 0, optimal: -18 },
  fridge: { min: 0, max: 9, optimal: 4 },
  ambient: { min: 10, max: 25, optimal: 18 },
} as const
