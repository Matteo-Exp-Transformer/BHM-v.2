// Import types from conservationProfiles
import type { ApplianceCategory, ConservationProfileId, ConservationProfile } from '@/utils/conservationProfiles'

// Re-export types for convenience
export type { ApplianceCategory, ConservationProfileId, ConservationProfile }

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
  // Profile fields (optional for backward compatibility)
  // Note: These can be null from DB, but undefined when not set
  appliance_category?: ApplianceCategory | null
  profile_id?: string | null
  profile_config?: ConservationProfile | null
  is_custom_profile?: boolean
}

export type ConservationPointType = 'ambient' | 'fridge' | 'freezer' | 'blast'

export type ConservationStatus = 'normal' | 'warning' | 'critical'

export interface TemperatureReading {
  id: string
  company_id: string
  conservation_point_id: string
  temperature: number
  recorded_at: string | Date // Supabase returns ISO string, but we accept Date for compatibility
  created_at: string | Date // Supabase returns ISO string, but we accept Date for compatibility

  // Additional fields from database
  method?: 'manual' | 'digital_thermometer' | 'automatic_sensor'
  notes?: string
  photo_evidence?: string
  recorded_by?: string

  // Optional computed/join fields
  conservation_point?: ConservationPoint
  recorded_by_user?: {
    id: string
    first_name?: string
    last_name?: string
    name?: string
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
  assignment_type?: string
  assigned_to_role?: string
  assigned_to_category?: string
  assigned_to_staff_id?: string
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
  | 'expiry_check'     // Controllo scadenze

export type MaintenanceFrequency =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'annually'

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
  expiry_check: {
    label: 'Controllo Scadenze',
    icon: 'calendar',
    color: 'amber',
    defaultDuration: 30,
    defaultChecklist: [
      'Verificare etichette e date di scadenza',
      'Rimuovere prodotti scaduti',
      'Registrare scadenze imminenti',
      'Aggiornare inventario',
    ],
  },
} as const

// Temperature monitoring utilities (tolleranza centralizzata ±1.0°C)
export const getTemperatureStatus = (
  current: number,
  target: number,
  tolerance: number = 1
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

  // Punti che richiedono temperatura: se non c'è lettura, non mostrare verde
  const typesRequiringTemp: ConservationPoint['type'][] = ['fridge', 'freezer', 'blast']
  if (typesRequiringTemp.includes(point.type) && !point.last_temperature_reading) {
    return {
      status: 'warning',
      message: 'Rileva la temperatura del punto di conservazione per ripristinare lo stato conforme.',
      priority: 2,
    }
  }

  // Check temperature status: tolleranza centralizzata ±1.0°C (allineato a TemperaturePointStatusCard)
  if (point.last_temperature_reading) {
    const reading = point.last_temperature_reading
    const setpoint = point.setpoint_temp
    const TOLERANCE_C = 1.0
    const min = setpoint - TOLERANCE_C
    const max = setpoint + TOLERANCE_C

    // Critico: fuori da setpoint ± 1°C
    if (reading.temperature < min || reading.temperature > max) {
      return {
        status: 'critical',
        message: reading.temperature > max
          ? 'Temperatura troppo alta. Regola il termostato e rileva nuovamente per ripristinare lo stato conforme.'
          : 'Temperatura troppo bassa. Regola il termostato e rileva nuovamente per ripristinare lo stato conforme.',
        priority: 1,
      }
    }

    // Warning: entro ±1°C ma non esattamente al target
    if (reading.temperature !== setpoint) {
      return {
        status: 'warning',
        message: 'Regola il termostato e rileva nuovamente la temperatura per ripristinare lo stato conforme.',
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
        message: `Pianifica la manutenzione (scadenza tra ${daysUntilMaintenance} giorni) per evitare lo stato critico.`,
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
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-500',
  },
} as const

// Conservation point type configurations
export const CONSERVATION_POINT_CONFIGS = {
  ambient: {
    label: 'Ambiente',
    tempRange: { min: null, max: null, optimal: null },
    icon: 'thermometer',
    color: 'blue',
  },
  fridge: {
    label: 'Frigorifero',
    tempRange: { min: 1, max: 8, optimal: 4 },
    icon: 'snowflake',
    color: 'cyan',
  },
  freezer: {
    label: 'Congelatore',
    tempRange: { min: -25, max: -18, optimal: -20 },
    icon: 'snow',
    color: 'indigo',
  },
  blast: {
    label: 'Abbattitore',
    tempRange: { min: null, max: null, optimal: null },
    icon: 'wind',
    color: 'purple',
  },
} as const

// Additional constants that may be imported by components
export const CONSERVATION_COLORS = CONSERVATION_STATUS_COLORS

export const TEMPERATURE_RANGES = {
  ambient: { min: null, max: null, optimal: null },
  fridge: { min: 1, max: 8, optimal: 4 },
  freezer: { min: -25, max: -18, optimal: -20 },
  blast: { min: null, max: null, optimal: null },
} as const

// Conservation point type colors - Distinct color palette
export const CONSERVATION_TYPE_COLORS = {
  fridge: {
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-300',
    badge: 'bg-sky-500 text-white',
  },
  freezer: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-300',
    badge: 'bg-indigo-500 text-white',
  },
  blast: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-300',
    badge: 'bg-purple-500 text-white',
  },
  ambient: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-300',
    badge: 'bg-emerald-500 text-white',
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
  recorded_at?: Date // Optional, defaults to now() in database
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
  // TODO: Remove status and method filters as these fields don't exist in DB
  // TODO: Add computed status based on conservation point setpoint_temp
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
  average_temperature: number
  temperature_trend: 'rising' | 'falling' | 'stable'
  recent_readings: TemperatureReading[]
  // TODO: Add computed compliance_rate based on conservation point setpoint_temp
  // TODO: Add computed readings_by_status based on conservation point setpoint_temp
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
    // TODO: Add computed status based on conservation point setpoint_temp
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
