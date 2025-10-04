import { z } from 'zod'

import type {
  ConservationPoint,
  MaintenanceTask,
  MaintenanceTaskType,
  TaskFrequency,
} from '@/types/onboarding'
import { MAINTENANCE_TASK_TYPES } from '@/types/conservation'

export const CONSERVATION_POINT_TYPES = {
  ambient: {
    value: 'ambient' as const,
    label: 'Ambiente (dispense)',
    temperatureRange: { min: null, max: null }, // Temperatura non impostabile
    color: 'text-amber-600',
  },
  fridge: {
    value: 'fridge' as const,
    label: 'Frigorifero',
    temperatureRange: { min: 1, max: 15 }, // 1°C - 15°C
    color: 'text-blue-600',
  },
  freezer: {
    value: 'freezer' as const,
    label: 'Congelatore',
    temperatureRange: { min: -25, max: -1 }, // -25°C a -1°C
    color: 'text-cyan-600',
  },
  blast: {
    value: 'blast' as const,
    label: 'Abbattitore',
    temperatureRange: { min: -90, max: -15 }, // -90°C a -15°C
    color: 'text-emerald-600',
  },
}

export const CONSERVATION_CATEGORIES = [
  {
    id: 'fresh_meat',
    label: 'Carni fresche',
    range: { min: 1, max: 4 }, // Compatibile con frigorifero 1-15°C
    incompatible: ['ambient', 'blast'],
  },
  {
    id: 'fresh_fish',
    label: 'Pesce fresco',
    range: { min: 1, max: 2 }, // Compatibile con frigorifero 1-15°C
    incompatible: ['ambient', 'blast'],
  },
  {
    id: 'fresh_dairy',
    label: 'Latticini',
    range: { min: 2, max: 6 }, // Compatibile con frigorifero 1-15°C
    incompatible: ['ambient'],
  },
  {
    id: 'fresh_produce',
    label: 'Verdure fresche',
    range: { min: 2, max: 8 }, // Compatibile con frigorifero 1-15°C
    incompatible: ['ambient'],
  },
  {
    id: 'beverages',
    label: 'Bevande',
    range: { min: 2, max: 12 }, // Compatibile con frigorifero 1-15°C
    incompatible: [],
  },
  {
    id: 'dry_goods',
    label: 'Dispensa secca',
    range: { min: 15, max: 25 }, // Solo per ambiente
    compatibleTypes: ['ambient'],
  },
  {
    id: 'frozen',
    label: 'Congelati',
    range: { min: -25, max: -1 }, // Compatibile con congelatore -25 a -1°C
    compatibleTypes: ['freezer'],
  },
  {
    id: 'deep_frozen',
    label: 'Ultracongelati',
    range: { min: -25, max: -1 }, // Compatibile con congelatore -25 a -1°C
    compatibleTypes: ['freezer'],
  },
  {
    id: 'blast_chilling',
    label: 'Abbattimento rapido',
    range: { min: -90, max: -15 }, // Compatibile con abbattitore -90 a -15°C
    compatibleTypes: ['blast'],
  },
]

const maintenanceTaskTypeValues = Object.keys(MAINTENANCE_TASK_TYPES) as [
  MaintenanceTaskType,
  ...MaintenanceTaskType[],
]

const taskFrequencyValues: [TaskFrequency, ...TaskFrequency[]] = [
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'annual',
  'custom',
  'as_needed',
]

const maintenanceTaskSchema = z.object({
  id: z.string(),
  conservationPointId: z.string().min(1, 'Associa il punto di conservazione'),
  conservationPointName: z.string().optional(),
  title: z.string().min(2, 'Il titolo è obbligatorio'),
  type: z.enum(maintenanceTaskTypeValues),
  frequency: z.enum(taskFrequencyValues),
  assignedRole: z.string().optional(),
  assignedStaffIds: z.array(z.string()).default([]),
  notes: z.string().optional(),
  estimatedDuration: z.number().min(1).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  nextDue: z.string().optional(),
  instructions: z.array(z.string()).optional(),
  status: z
    .enum(['scheduled', 'in_progress', 'completed', 'overdue', 'skipped'])
    .optional(),
})

const conservationPointSchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Il nome deve essere di almeno 2 caratteri'),
  departmentId: z
    .string()
    .min(1, 'Seleziona il reparto a cui appartiene il punto di conservazione'),
  targetTemperature: z
    .number({ invalid_type_error: 'Inserisci una temperatura valida' })
    .min(-99)
    .max(80),
  pointType: z.enum(['ambient', 'fridge', 'freezer', 'blast']),
  isBlastChiller: z.boolean(),
  productCategories: z
    .array(z.string())
    .min(1, 'Seleziona almeno una categoria'),
  source: z.enum(['manual', 'prefill', 'import']),
  maintenanceTasks: z.array(maintenanceTaskSchema).optional(),
})

export const validateConservationPoint = (
  point: ConservationPoint
): {
  success: boolean
  point?: ConservationPoint
  errors?: Record<string, string>
} => {
  const result = conservationPointSchema.safeParse(point)

  if (!result.success) {
    const errors: Record<string, string> = {}
    result.error.issues.forEach(issue => {
      if (issue.path[0]) {
        errors[issue.path[0].toString()] = issue.message
      }
    })
    return { success: false, errors }
  }

  const incompatibleCategories = point.productCategories.filter(categoryId => {
    const category = getCategoryById(categoryId)
    if (!category) return false

    if (
      category.compatibleTypes &&
      !category.compatibleTypes.includes(point.pointType)
    ) {
      return true
    }

    return category.incompatible?.includes(point.pointType)
  })

  if (incompatibleCategories.length > 0) {
    return {
      success: false,
      errors: {
        productCategories:
          'Alcune categorie non sono compatibili con la tipologia selezionata',
        global: `Rimuovi le categorie incompatibili: ${incompatibleCategories
          .map(id => getCategoryById(id)?.label || id)
          .join(', ')}`,
      },
    }
  }

  const outOfRangeCategories = point.productCategories.filter(categoryId => {
    const category = getCategoryById(categoryId)
    if (!category) return false

    const range = category.range
    const temperature = point.targetTemperature

    return temperature < range.min || temperature > range.max
  })

  if (outOfRangeCategories.length > 0) {
    return {
      success: false,
      errors: {
        targetTemperature:
          'La temperatura non rientra nei range HACCP delle categorie selezionate',
        global: `Verifica i range per: ${outOfRangeCategories
          .map(id => getCategoryById(id)?.label || id)
          .join(', ')}`,
      },
    }
  }

  return { success: true, point }
}

export const validateMaintenanceTask = (
  task: MaintenanceTask
): { success: boolean; errors?: Record<string, string> } => {
  const parsed = maintenanceTaskSchema.safeParse(task)

  if (!parsed.success) {
    const errors: Record<string, string> = {}
    parsed.error.issues.forEach(issue => {
      const field = issue.path.join('.')
      errors[field] = issue.message
    })
    return { success: false, errors }
  }

  if (!task.nextDue || task.nextDue.trim().length === 0) {
    return {
      success: false,
      errors: {
        nextDue: 'Specificare la prossima scadenza è obbligatorio',
      },
    }
  }

  return { success: true }
}

export const generateConservationPointId = () =>
  `cp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`

export const createDraftConservationPoint = (
  point?: ConservationPoint | null
): ConservationPoint => {
  if (point) {
    return {
      ...point,
      productCategories: [...point.productCategories],
      maintenanceTasks: point.maintenanceTasks
        ? point.maintenanceTasks.map(task => ({
            ...task,
            assignedStaffIds: [...task.assignedStaffIds],
            instructions: [...(task.instructions ?? [])],
            status: task.status ?? 'scheduled',
          }))
        : [],
    }
  }

  return {
    id: generateConservationPointId(),
    name: '',
    departmentId: '',
    targetTemperature: 4,
    pointType: 'fridge',
    isBlastChiller: false,
    productCategories: [],
    maintenanceTasks: [],
    source: 'manual',
  }
}

export const normalizeConservationPoint = (
  point: ConservationPoint
): ConservationPoint => ({
  id: point.id,
  name: point.name.trim(),
  departmentId: point.departmentId,
  targetTemperature: point.targetTemperature,
  pointType: point.pointType,
  isBlastChiller: point.isBlastChiller,
  productCategories: [...point.productCategories],
  maintenanceTasks: point.maintenanceTasks?.map(normalizeMaintenanceTask),
  maintenanceDue: point.maintenanceDue,
  source: point.source,
})

export const createDraftMaintenanceTask = (): MaintenanceTask => ({
  id: `mt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
  conservationPointId: '',
  title: 'Nuova manutenzione',
  type: 'general_inspection',
  frequency: 'weekly',
  priority: 'medium',
  estimatedDuration: 30,
  instructions: [],
  status: 'scheduled',
  assignedStaffIds: [],
  notes: '',
})

export const normalizeMaintenanceTask = (
  task: MaintenanceTask
): MaintenanceTask => ({
  id: task.id,
  conservationPointId: task.conservationPointId,
  conservationPointName: task.conservationPointName,
  title: task.title.trim(),
  type: task.type,
  frequency: task.frequency,
  assignedRole: task.assignedRole,
  assignedStaffIds: [...task.assignedStaffIds],
  notes: task.notes,
  estimatedDuration: task.estimatedDuration,
  priority: task.priority,
  nextDue: task.nextDue,
  instructions: [...(task.instructions ?? [])],
  status: task.status ?? 'scheduled',
})

export const getCategoryById = (id: string) =>
  CONSERVATION_CATEGORIES.find(category => category.id === id)

export const getConservationPointType = (
  type: ConservationPoint['pointType']
) => {
  return CONSERVATION_POINT_TYPES[type]
}

export const validateTemperatureForType = (
  temperature: number,
  type: ConservationPoint['pointType']
): { valid: boolean; message?: string } => {
  const typeInfo = CONSERVATION_POINT_TYPES[type]
  const range = typeInfo.temperatureRange

  // Ambiente: temperatura non impostabile
  if (type === 'ambient') {
    return {
      valid: false,
      message: 'La temperatura non è impostabile per i punti di tipo Ambiente',
    }
  }

  // Controlla se la temperatura è nel range valido
  if (range.min !== null && temperature < range.min) {
    return {
      valid: false,
      message: `Temperatura troppo bassa. Minimo consentito: ${range.min}°C`,
    }
  }

  if (range.max !== null && temperature > range.max) {
    return {
      valid: false,
      message: `Temperatura troppo alta. Massimo consentito: ${range.max}°C`,
    }
  }

  return { valid: true }
}

export const getCompatibleCategories = (
  temperature: number | null,
  pointType: ConservationPoint['pointType']
) => {
  if (!temperature) {
    return CONSERVATION_CATEGORIES
  }

  return CONSERVATION_CATEGORIES.filter(category => {
    // Controlla compatibilità con il tipo di punto
    if (
      category.compatibleTypes &&
      !category.compatibleTypes.includes(pointType)
    ) {
      return false
    }

    if (category.incompatible && category.incompatible.includes(pointType)) {
      return false
    }

    // Controlla compatibilità con la temperatura
    if (category.range) {
      return (
        temperature >= category.range.min && temperature <= category.range.max
      )
    }

    return true
  })
}

export const isCategoryCompatibleWithType = (
  categoryId: string,
  type: ConservationPoint['pointType']
) => {
  const category = getCategoryById(categoryId)
  if (!category) return false

  if (category.compatibleTypes) {
    return category.compatibleTypes.includes(type)
  }

  return !category.incompatible?.includes(type)
}

export const getOptimalTemperatureSuggestion = (point: ConservationPoint) => {
  if (point.productCategories.length === 0) {
    return 'Seleziona almeno una categoria per ricevere suggerimenti HACCP.'
  }

  const ranges = point.productCategories
    .map(categoryId => getCategoryById(categoryId)?.range)
    .filter(Boolean) as Array<{ min: number; max: number }>

  if (ranges.length === 0) return 'Categorie non riconosciute.'

  const min = Math.max(...ranges.map(range => range.min))
  const max = Math.min(...ranges.map(range => range.max))

  if (min > max) {
    return '⚠️ Le categorie selezionate hanno range incompatibili. Rivedi la selezione.'
  }

  const optimal = ((min + max) / 2).toFixed(1)
  return `Range consigliato: ${min}°C - ${max}°C • Temperatura ottimale: ${optimal}°C`
}
