import { z } from 'zod'

import type { ConservationPoint } from '@/types/onboarding'

export const CONSERVATION_POINT_TYPES = {
  ambient: {
    value: 'ambient' as const,
    label: 'Ambiente (dispense)',
    temperatureRange: { min: 15, max: 25 },
    color: 'text-amber-600',
  },
  fridge: {
    value: 'fridge' as const,
    label: 'Frigorifero',
    temperatureRange: { min: 0, max: 8 },
    color: 'text-blue-600',
  },
  freezer: {
    value: 'freezer' as const,
    label: 'Congelatore',
    temperatureRange: { min: -25, max: -15 },
    color: 'text-cyan-600',
  },
  blast: {
    value: 'blast' as const,
    label: 'Abbattitore',
    temperatureRange: { min: -40, max: 3 },
    color: 'text-emerald-600',
  },
}

export const CONSERVATION_CATEGORIES = [
  {
    id: 'fresh_meat',
    label: 'Carni fresche',
    range: { min: 0, max: 4 },
    incompatible: ['ambient', 'blast'],
  },
  {
    id: 'fresh_fish',
    label: 'Pesce fresco',
    range: { min: 0, max: 2 },
    incompatible: ['ambient', 'blast'],
  },
  {
    id: 'fresh_dairy',
    label: 'Latticini',
    range: { min: 2, max: 6 },
    incompatible: ['ambient'],
  },
  {
    id: 'fresh_produce',
    label: 'Verdure fresche',
    range: { min: 2, max: 8 },
    incompatible: ['ambient'],
  },
  {
    id: 'beverages',
    label: 'Bevande',
    range: { min: 2, max: 12 },
    incompatible: [],
  },
  {
    id: 'dry_goods',
    label: 'Dispensa secca',
    range: { min: 15, max: 25 },
    compatibleTypes: ['ambient'],
  },
  {
    id: 'frozen',
    label: 'Congelati',
    range: { min: -25, max: -18 },
    compatibleTypes: ['freezer'],
  },
  {
    id: 'deep_frozen',
    label: 'Ultracongelati',
    range: { min: -35, max: -25 },
    compatibleTypes: ['freezer'],
  },
  {
    id: 'blast_chilling',
    label: 'Abbattimento rapido',
    range: { min: -40, max: 3 },
    compatibleTypes: ['blast'],
  },
]

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
  productCategories: z.array(z.string()).min(1, 'Seleziona almeno una categoria'),
  source: z.enum(['manual', 'prefill', 'import']),
})

export const validateConservationPoint = (
  point: ConservationPoint
): { success: boolean; point?: ConservationPoint; errors?: Record<string, string> } => {
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

    if (category.compatibleTypes && !category.compatibleTypes.includes(point.pointType)) {
      return true
    }

    return category.incompatible?.includes(point.pointType)
  })

  if (incompatibleCategories.length > 0) {
    return {
      success: false,
      errors: {
        productCategories: 'Alcune categorie non sono compatibili con la tipologia selezionata',
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
        targetTemperature: 'La temperatura non rientra nei range HACCP delle categorie selezionate',
        global: `Verifica i range per: ${outOfRangeCategories
          .map(id => getCategoryById(id)?.label || id)
          .join(', ')}`,
      },
    }
  }

  return { success: true, point }
}

export const getCategoryById = (id: string) =>
  CONSERVATION_CATEGORIES.find(category => category.id === id)

export const getConservationPointType = (type: ConservationPoint['pointType']) => {
  return CONSERVATION_POINT_TYPES[type]
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

