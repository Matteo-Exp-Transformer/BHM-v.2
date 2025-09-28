import { z } from 'zod'

import type {
  ConservationPoint,
  InventoryProduct,
  ProductCategory,
  ProductStatus,
} from '@/types/onboarding'

export const ALLERGEN_LIST = [
  'glutine',
  'crostacei',
  'uova',
  'pesce',
  'arachidi',
  'soia',
  'latte',
  'frutta_a_guscio',
  'sedano',
  'senape',
  'sesamo',
  'anidride_solforosa',
  'lupini',
  'molluschi',
]

export const UNIT_OPTIONS = ['kg', 'g', 'l', 'ml', 'pz', 'conf', 'buste', 'vaschette']

export const PRODUCT_STATUS_OPTIONS: ProductStatus[] = [
  'active',
  'expired',
  'consumed',
  'waste',
]

const categorySchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Nome categoria troppo corto'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/i, 'Colore non valido'),
  description: z.string().optional(),
  conservationRules: z.object({
    minTemp: z.number().min(-80).max(80),
    maxTemp: z.number().min(-80).max(80),
    maxStorageDays: z.number().min(1).max(365).optional(),
    requiresBlastChilling: z.boolean().optional(),
  }),
})

const productSchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Nome prodotto troppo corto'),
  categoryId: z.string().min(1).optional(),
  departmentId: z.string().min(1).optional(),
  conservationPointId: z.string().min(1).optional(),
  quantity: z.number().nonnegative().optional(),
  unit: z.string().optional(),
  allergens: z.array(z.string()).default([]),
  supplierName: z.string().optional(),
  batchNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  expiryDate: z.string().optional(),
  status: z.enum(PRODUCT_STATUS_OPTIONS),
  notes: z.string().optional(),
})

export const validateCategory = (
  category: ProductCategory
): { success: boolean; errors?: Record<string, string> } => {
  const result = categorySchema.safeParse(category)
  if (result.success) {
    if (category.conservationRules.minTemp >= category.conservationRules.maxTemp) {
      return {
        success: false,
        errors: {
          minTemp: 'La temperatura minima deve essere inferiore alla massima',
          maxTemp: 'La temperatura massima deve essere superiore alla minima',
        },
      }
    }
    return { success: true }
  }

  const errors: Record<string, string> = {}
  result.error.issues.forEach(issue => {
    const field = issue.path.join('.')
    errors[field] = issue.message
  })
  return { success: false, errors }
}

export const validateProduct = (
  product: InventoryProduct,
  categories: ProductCategory[],
  conservationPoints: ConservationPoint[]
): { success: boolean; errors?: Record<string, string> } => {
  const result = productSchema.safeParse(product)
  if (!result.success) {
    const errors: Record<string, string> = {}
    result.error.issues.forEach(issue => {
      const field = issue.path.join('.')
      errors[field] = issue.message
    })
    return { success: false, errors }
  }

  if (product.categoryId) {
    const category = categories.find(cat => cat.id === product.categoryId)
    if (!category) {
      return {
        success: false,
        errors: { categoryId: 'Categoria non valida' },
      }
    }
    if (product.conservationPointId) {
      const point = conservationPoints.find(p => p.id === product.conservationPointId)
      if (point) {
        const { minTemp, maxTemp } = category.conservationRules
        if (point.targetTemperature < minTemp || point.targetTemperature > maxTemp) {
          return {
            success: false,
            errors: {
              conservationPointId:
                'Il punto di conservazione non rispetta le temperature della categoria',
            },
          }
        }
        if (category.conservationRules.requiresBlastChilling && !point.isBlastChiller) {
          return {
            success: false,
            errors: {
              conservationPointId: 'La categoria richiede un abbattitore di temperatura',
            },
          }
        }
      }
    }
  }

  return { success: true }
}

export const generateInventoryId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`

export const getAllergenLabel = (id: string) => {
  switch (id) {
    case 'glutine':
      return 'Glutine'
    case 'crostacei':
      return 'Crostacei'
    case 'uova':
      return 'Uova'
    case 'pesce':
      return 'Pesce'
    case 'arachidi':
      return 'Arachidi'
    case 'soia':
      return 'Soia'
    case 'latte':
      return 'Latte'
    case 'frutta_a_guscio':
      return 'Frutta a guscio'
    case 'sedano':
      return 'Sedano'
    case 'senape':
      return 'Senape'
    case 'sesamo':
      return 'Sesamo'
    case 'anidride_solforosa':
      return 'Anidride solforosa'
    case 'lupini':
      return 'Lupini'
    case 'molluschi':
      return 'Molluschi'
    default:
      return id
  }
}

export const isProductCompliant = (
  product: InventoryProduct,
  categories: ProductCategory[],
  conservationPoints: ConservationPoint[]
) => {
  if (!product.categoryId || !product.conservationPointId) {
    return {
      compliant: false,
      message: 'Associa categoria e punto di conservazione per verificare la conformità',
    }
  }

  const category = categories.find(cat => cat.id === product.categoryId)
  const point = conservationPoints.find(p => p.id === product.conservationPointId)

  if (!category || !point) {
    return {
      compliant: false,
      message: 'Dati insufficienti per la verifica HACCP',
    }
  }

  const { minTemp, maxTemp, requiresBlastChilling } = category.conservationRules

  if (point.targetTemperature < minTemp || point.targetTemperature > maxTemp) {
    return {
      compliant: false,
      message: `Temperatura ${point.targetTemperature}°C fuori range (${minTemp}°C - ${maxTemp}°C)`,
    }
  }

  if (requiresBlastChilling && !point.isBlastChiller) {
    return {
      compliant: false,
      message: 'La categoria richiede un abbattitore certificato',
    }
  }

  return {
    compliant: true,
    message: 'Configurazione conforme alle regole HACCP',
  }
}

