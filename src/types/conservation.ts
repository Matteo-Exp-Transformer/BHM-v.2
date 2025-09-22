export interface ConservationPoint {
  id: string
  company_id: string
  department_id: string
  name: string
  setpoint_temp: number
  type: ConservationPointType
  product_categories: string[]
  status: ConservationStatus
  last_temperature_reading?: TemperatureReading
  maintenance_due?: Date
  is_blast_chiller: boolean
  created_at: Date
  updated_at: Date
}

export type ConservationPointType = 'ambient' | 'fridge' | 'freezer' | 'blast'

export type ConservationStatus = 'normal' | 'warning' | 'critical'

export interface TemperatureReading {
  id: string
  company_id: string
  conservation_point_id: string
  temperature: number
  target_temperature?: number
  tolerance_range_min?: number
  tolerance_range_max?: number
  status: 'compliant' | 'warning' | 'critical'
  recorded_by?: string
  recorded_at: Date
  method: 'manual' | 'digital_thermometer' | 'automatic_sensor'
  notes?: string
  photo_evidence?: string
  created_at: Date

  // Relazioni
  conservation_point?: ConservationPoint
  recorded_by_user?: {
    id: string
    name: string
  }
}

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
  conservation_rules: ConservationRule[]
  color: string
  description?: string
  created_at: Date
  updated_at: Date
}

export interface ConservationRule {
  temp_min: number
  temp_max: number
  humidity_min?: number
  humidity_max?: number
  max_storage_days?: number
  requires_blast_chilling?: boolean
}

export interface MaintenanceTask {
  id: string
  company_id: string
  conservation_point_id: string
  title: string
  description?: string
  type: MaintenanceType
  frequency: MaintenanceFrequency
  estimated_duration: number // minutes
  last_completed?: Date
  next_due: Date
  assigned_to?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'skipped'
  instructions?: string[]
  required_tools?: string[]
  safety_notes?: string[]
  completion_notes?: string
  completed_by?: string
  completed_at?: Date
  created_at: Date
  updated_at: Date

  // Relazioni
  conservation_point?: ConservationPoint
  assigned_user?: {
    id: string
    name: string
  }
  completed_by_user?: {
    id: string
    name: string
  }
}

export type MaintenanceType =
  | 'temperature_calibration'
  | 'deep_cleaning'
  | 'defrosting'
  | 'filter_replacement'
  | 'seal_inspection'
  | 'compressor_check'
  | 'general_inspection'
  | 'other'

export type MaintenanceFrequency =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'biannually'
  | 'annually'
  | 'as_needed'

// Maintenance task types configuration
export const MAINTENANCE_TASK_TYPES = {
  temperature_calibration: {
    label: 'Calibrazione Termometro',
    icon: 'thermometer',
    color: 'blue',
    defaultDuration: 30
  },
  deep_cleaning: {
    label: 'Pulizia Profonda',
    icon: 'spray-can',
    color: 'green',
    defaultDuration: 120
  },
  defrosting: {
    label: 'Sbrinamento',
    icon: 'snowflake',
    color: 'cyan',
    defaultDuration: 60
  },
  filter_replacement: {
    label: 'Sostituzione Filtri',
    icon: 'filter',
    color: 'yellow',
    defaultDuration: 45
  },
  seal_inspection: {
    label: 'Controllo Guarnizioni',
    icon: 'search',
    color: 'purple',
    defaultDuration: 30
  },
  compressor_check: {
    label: 'Controllo Compressore',
    icon: 'wrench',
    color: 'red',
    defaultDuration: 90
  },
  general_inspection: {
    label: 'Ispezione Generale',
    icon: 'clipboard-check',
    color: 'gray',
    defaultDuration: 60
  },
  other: {
    label: 'Altro',
    icon: 'tool',
    color: 'gray',
    defaultDuration: 60
  }
} as const

// Temperature monitoring utilities
export const getTemperatureStatus = (
  current: number,
  target: number,
  tolerance: number = 2
): ConservationStatus => {
  const diff = Math.abs(current - target)
  if (diff <= tolerance) return 'normal'
  if (diff <= tolerance * 2) return 'warning'
  return 'critical'
}

export const formatTemperature = (temp: number): string => {
  return `${temp.toFixed(1)}°C`
}

// Classification function for conservation points
export const classifyConservationPoint = (point: ConservationPoint): {
  status: ConservationStatus
  message: string
  priority: number
} => {
  const now = new Date()

  // Check if maintenance is due
  if (point.maintenance_due && point.maintenance_due <= now) {
    return {
      status: 'critical',
      message: 'Manutenzione scaduta',
      priority: 1
    }
  }

  // Check temperature status if available
  if (point.last_temperature_reading) {
    const reading = point.last_temperature_reading
    const config = CONSERVATION_POINT_CONFIGS[point.type]
    const { min, max } = config.tempRange

    if (reading.temperature < min - 2 || reading.temperature > max + 2) {
      return {
        status: 'critical',
        message: 'Temperatura fuori controllo',
        priority: 1
      }
    }

    if (reading.temperature < min || reading.temperature > max) {
      return {
        status: 'warning',
        message: 'Temperatura al limite',
        priority: 2
      }
    }
  }

  // Check if maintenance is due soon (within 7 days)
  if (point.maintenance_due) {
    const daysUntilMaintenance = Math.ceil((point.maintenance_due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (daysUntilMaintenance <= 7) {
      return {
        status: 'warning',
        message: `Manutenzione tra ${daysUntilMaintenance} giorni`,
        priority: 2
      }
    }
  }

  return {
    status: 'normal',
    message: 'Tutto normale',
    priority: 3
  }
}

// Color coding for conservation statuses
export const CONSERVATION_STATUS_COLORS = {
  normal: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200'
  },
  warning: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200'
  },
  critical: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200'
  }
} as const

// Conservation point type configurations
export const CONSERVATION_POINT_CONFIGS = {
  ambient: {
    label: 'Ambiente',
    tempRange: { min: 15, max: 25 },
    icon: 'thermometer',
    color: 'blue'
  },
  fridge: {
    label: 'Frigorifero',
    tempRange: { min: 0, max: 8 },
    icon: 'snowflake',
    color: 'cyan'
  },
  freezer: {
    label: 'Congelatore',
    tempRange: { min: -25, max: -15 },
    icon: 'snow',
    color: 'indigo'
  },
  blast: {
    label: 'Abbattitore',
    tempRange: { min: -40, max: 3 },
    icon: 'wind',
    color: 'purple'
  }
} as const

// Additional constants that may be imported by components
export const CONSERVATION_COLORS = CONSERVATION_STATUS_COLORS

export const TEMPERATURE_RANGES = {
  ambient: { min: 15, max: 25 },
  fridge: { min: 0, max: 8 },
  freezer: { min: -25, max: -15 },
  blast: { min: -40, max: 3 }
} as const

// Maintenance colors mapping
export const MAINTENANCE_COLORS = {
  scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  overdue: 'bg-red-100 text-red-800 border-red-200',
  skipped: 'bg-gray-100 text-gray-800 border-gray-200'
} as const

// Request/Response types for API operations
export interface MaintenanceCompletion {
  id: string
  maintenance_task_id: string
  completed_by: string
  completed_at: Date
  notes?: string
  photos?: string[]
  next_due_date?: Date
  created_at: Date
}

export interface CreateConservationPointRequest {
  name: string
  department_id: string
  setpoint_temp: number
  type: ConservationPointType
  product_categories?: string[]
  is_blast_chiller?: boolean
}

export interface UpdateConservationPointRequest extends Partial<CreateConservationPointRequest> {
  id: string
  status?: ConservationStatus
}

export interface CreateTemperatureReadingRequest {
  conservation_point_id: string
  temperature: number
  method: 'manual' | 'digital_thermometer' | 'automatic_sensor'
  notes?: string
  photo_evidence?: string
}

export interface CreateMaintenanceTaskRequest {
  conservation_point_id: string
  name: string
  description?: string
  type: MaintenanceType
  frequency: MaintenanceFrequency
  estimated_duration: number
  next_due: Date
  assigned_to?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  instructions?: string[]
  required_tools?: string[]
  safety_notes?: string[]
}

export interface CreateMaintenanceCompletionRequest {
  maintenance_task_id: string
  notes?: string
  photos?: string[]
  next_due_date?: Date
}

// Filter interfaces
export interface ConservationPointsFilter {
  department_id?: string
  type?: ConservationPointType
  status?: ConservationStatus
  search?: string
}

export interface TemperatureReadingsFilter {
  conservation_point_id?: string
  date_from?: Date
  date_to?: Date
  status?: 'compliant' | 'warning' | 'critical'
}

export interface MaintenanceTasksFilter {
  conservation_point_id?: string
  assigned_to?: string
  status?: 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'skipped'
  type?: MaintenanceType
  priority?: 'low' | 'medium' | 'high' | 'critical'
}

// Statistics interfaces
export interface ConservationStats {
  total_points: number
  points_by_status: Record<ConservationStatus, number>
  points_by_type: Record<ConservationPointType, number>
  temperature_compliance_rate: number
  maintenance_compliance_rate: number
}

export interface TemperatureStats {
  total_readings: number
  compliance_rate: number
  readings_by_status: Record<'compliant' | 'warning' | 'critical', number>
  average_temperature: number
  temperature_trend: 'rising' | 'falling' | 'stable'
}

export interface MaintenanceStats {
  total_tasks: number
  completed_tasks: number
  overdue_tasks: number
  completion_rate: number
  tasks_by_type: Record<MaintenanceType, number>
  average_completion_time: number
<<<<<<< HEAD
}
=======
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
>>>>>>> origin/Curs
