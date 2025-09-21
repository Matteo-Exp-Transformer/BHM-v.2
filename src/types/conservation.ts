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
  conservation_point_id: string
  kind: MaintenanceType
  frequency: MaintenanceFrequency
  assigned_to: string
  assignment_type: AssignmentType
  next_due_date: Date
  estimated_duration: number // minutes
  checklist: string[]
  is_active: boolean
  created_at: Date
  updated_at: Date
  // Relations
  conservation_point?: ConservationPoint
  assigned_staff?: {
    id: string
    name: string
    role: string
  }
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
  if (point.last_temperature_reading?.status === 'critical') {
    return 'critical'
  }

  if (point.last_temperature_reading?.status === 'warning') {
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
