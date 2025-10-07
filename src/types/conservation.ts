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
  department?: {
    id: string
    name: string
  }
  maintenance_tasks?: MaintenanceTask[]
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
  validation_status?: 'validated' | 'flagged' | 'pending'

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
  checklist?: string[]
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
  | 'temperature'      // Rilevamento temperatura
  | 'sanitization'     // Sanificazione
  | 'defrosting'       // Sbrinamento

export type MaintenanceFrequency =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'biannually'
  | 'annually'
  | 'as_needed'
  | 'custom'

// Maintenance task types configuration
export const MAINTENANCE_TASK_TYPES = {
  temperature: {
    label: 'Rilevamento Temperatura',
    icon: 'thermometer',
    color: 'blue',
    defaultDuration: 30,
    defaultChecklist: [
      'Verificare calibrazione termometro',
      'Controllare temperatura ambiente',
      'Registrare lettura di riferimento',
      'Documentare eventuali scostamenti',
      'Compilare registro temperature',
    ],
  },
  sanitization: {
    label: 'Sanificazione',
    icon: 'spray-can',
    color: 'green',
    defaultDuration: 120,
    defaultChecklist: [
      'Svuotare completamente il vano',
      'Rimuovere tutti i residui alimentari',
      'Pulire con detergente specifico',
      'Disinfettare superfici',
      'Risciacquare e asciugare',
      'Verificare stato delle guarnizioni',
    ],
  },
  defrosting: {
    label: 'Sbrinamento',
    icon: 'snowflake',
    color: 'cyan',
    defaultDuration: 60,
    defaultChecklist: [
      'Svuotare il vano',
      "Spegnere l'apparecchio",
      'Rimuovere il ghiaccio accumulato',
      "Pulire l'acqua di scongelamento",
      'Asciugare completamente',
      'Riaccendere e verificare funzionamento',
    ],
  },
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

export const classifyConservationPoint = (
  setpointTemp: number,
  isBlastChiller: boolean
): ConservationPointType => {
  if (isBlastChiller) return 'blast'
  if (setpointTemp <= -15) return 'freezer'
  if (setpointTemp <= 8) return 'fridge'
  if (setpointTemp >= 15) return 'ambient'
  return 'fridge'
}

// Classification function for conservation points
export const classifyPointStatus = (
  point: ConservationPoint
): {
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
      priority: 1,
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
        priority: 1,
      }
    }

    if (reading.temperature < min || reading.temperature > max) {
      return {
        status: 'warning',
        message: 'Temperatura al limite',
        priority: 2,
      }
    }
  }

  // Check if maintenance is due soon (within 7 days)
  if (point.maintenance_due) {
    const daysUntilMaintenance = Math.ceil(
      (point.maintenance_due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysUntilMaintenance <= 7) {
      return {
        status: 'warning',
        message: `Manutenzione tra ${daysUntilMaintenance} giorni`,
        priority: 2,
      }
    }
  }

  return {
    status: 'normal',
    message: 'Tutto normale',
    priority: 3,
  }
}

// Color coding for conservation statuses
export const CONSERVATION_STATUS_COLORS = {
  normal: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
  },
  warning: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
  },
  critical: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
  },
} as const

// Conservation point type configurations
export const CONSERVATION_POINT_CONFIGS = {
  ambient: {
    label: 'Ambiente',
    tempRange: { min: 15, max: 25, optimal: 20 },
    icon: 'thermometer',
    color: 'blue',
  },
  fridge: {
    label: 'Frigorifero',
    tempRange: { min: 0, max: 8, optimal: 4 },
    icon: 'snowflake',
    color: 'cyan',
  },
  freezer: {
    label: 'Congelatore',
    tempRange: { min: -25, max: -15, optimal: -20 },
    icon: 'snow',
    color: 'indigo',
  },
  blast: {
    label: 'Abbattitore',
    tempRange: { min: -40, max: 3, optimal: -18 },
    icon: 'wind',
    color: 'purple',
  },
} as const

// Additional constants that may be imported by components
export const CONSERVATION_COLORS = CONSERVATION_STATUS_COLORS

export const TEMPERATURE_RANGES = {
  ambient: { min: 15, max: 25, optimal: 20 },
  fridge: { min: 0, max: 8, optimal: 4 },
  freezer: { min: -25, max: -15, optimal: -20 },
  blast: { min: -40, max: 3, optimal: -18 },
} as const

// Conservation point type colors - High contrast palette
export const CONSERVATION_TYPE_COLORS = {
  fridge: {
    bg: 'bg-blue-100',
    text: 'text-blue-900',
    border: 'border-blue-400',
    badge: 'bg-blue-500 text-white',
  },
  freezer: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-900',
    border: 'border-indigo-400',
    badge: 'bg-indigo-500 text-white',
  },
  blast: {
    bg: 'bg-purple-100',
    text: 'text-purple-900',
    border: 'border-purple-400',
    badge: 'bg-purple-600 text-white',
  },
  ambient: {
    bg: 'bg-orange-100',
    text: 'text-orange-900',
    border: 'border-orange-400',
    badge: 'bg-orange-500 text-white',
  },
} as const

// Maintenance colors mapping
export const MAINTENANCE_COLORS = {
  scheduled: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
  },
  in_progress: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
  },
  pending: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
  },
  completed: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
  },
  overdue: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
  },
  skipped: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
  },
} as const

// Request/Response types for API operations
export interface MaintenanceCompletion {
  id: string
  maintenance_task_id: string
  completed_by: string
  completed_at: Date
  notes?: string
  photos?: string[]
  next_due?: Date
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

export interface UpdateConservationPointRequest
  extends Partial<CreateConservationPointRequest> {
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
  next_due?: Date
}

// Filter interfaces
export interface ConservationPointsFilter {
  department_id?: string
  type?: ConservationPointType[]
  status?: ConservationStatus[]
  search?: string
  has_maintenance_due?: boolean
}

export interface TemperatureReadingsFilter {
  conservation_point_id?: string
  date_from?: Date
  date_to?: Date
  status?: Array<'compliant' | 'warning' | 'critical'>
  method?: TemperatureReading['method']
  recorded_by?: string
}

export interface MaintenanceTasksFilter {
  conservation_point_id?: string
  assigned_to?: string
  status?: MaintenanceTask['status']
  type?: MaintenanceType
  frequency?: MaintenanceFrequency
  priority?: MaintenanceTask['priority']
}

// Statistics interfaces
export interface ConservationStats {
  total_points: number
  by_status: Record<ConservationStatus, number>
  by_type: Record<ConservationPointType, number>
  temperature_compliance_rate: number
  maintenance_compliance_rate: number
  alerts_count: number
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

// Add missing TemperatureStatus type for backward compatibility
export type TemperatureStatus = 'compliant' | 'warning' | 'critical'
