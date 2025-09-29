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

export const UNIT_OPTIONS = [
  'kg',
  'g',
  'l',
  'ml',
  'pz',
  'conf',
  'buste',
  'vaschette',
]

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
  name: z.string().min(2, 'Il nome del prodotto è obbligatorio'),
  categoryId: z.string().min(1, 'Seleziona una categoria').optional(),
  departmentId: z.string().optional(),
  conservationPointId: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  supplierName: z.string().optional(),
  purchaseDate: z.string().optional(),
  expiryDate: z.string().optional(),
  quantity: z
    .number()
    .nonnegative({ message: 'La quantità deve essere positiva' })
    .optional(),
  unit: z.string().optional(),
  allergens: z.array(z.string()).default([]),
  labelPhotoUrl: z.string().optional(),
  status: z.enum(PRODUCT_STATUS_OPTIONS),
  notes: z.string().optional(),
})

const REQUIRED_FIELDS = {
  name: 'Inserisci il nome del prodotto',
  categoryId: 'Seleziona una categoria di appartenenza',
  departmentId: 'Seleziona un reparto di riferimento',
  conservationPointId: 'Associa un punto di conservazione',
  quantity: 'La quantità è obbligatoria',
  unit: "Seleziona l'unità di misura",
} as const

const REQUIRED_NUMERIC_FIELDS: Array<keyof InventoryProduct> = ['quantity']
const REQUIRED_STRING_FIELDS: Array<keyof InventoryProduct> = [
  'categoryId',
  'departmentId',
  'conservationPointId',
  'unit',
]

const collectMissingFields = (product: InventoryProduct) => {
  const errors: Record<string, string> = {}

  REQUIRED_STRING_FIELDS.forEach(field => {
    const value = product[field]
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      errors[field] = REQUIRED_FIELDS[field]
    }
  })

  REQUIRED_NUMERIC_FIELDS.forEach(field => {
    const value = product[field]
    if (value === undefined || value === null || Number.isNaN(value)) {
      errors[field] = REQUIRED_FIELDS[field]
    }
  })

  if (!product.purchaseDate || product.purchaseDate.trim() === '') {
    errors.purchaseDate = 'Seleziona la data di acquisto'
  }

  if (!product.expiryDate || product.expiryDate.trim() === '') {
    errors.expiryDate = 'Seleziona la data di scadenza'
  }

  return errors
}

export const validateInventoryCategory = (
  category: ProductCategory,
  others: ProductCategory[]
): { success: boolean; errors?: Record<string, string> } => {
  const result = categorySchema.safeParse(category)
  if (!result.success) {
    const errors: Record<string, string> = {}
    result.error.issues.forEach(issue => {
      const field = issue.path.join('.')
      errors[field] = issue.message
    })
    return { success: false, errors }
  }

  const { minTemp, maxTemp } = category.conservationRules
  if (minTemp >= maxTemp) {
    return {
      success: false,
      errors: {
        minTemp: 'La temperatura minima deve essere inferiore alla massima',
        maxTemp: 'La temperatura massima deve essere superiore alla minima',
      },
    }
  }

  if (
    others.some(
      item =>
        item.id !== category.id &&
        item.name.trim().toLowerCase() === category.name.trim().toLowerCase()
    )
  ) {
    return {
      success: false,
      errors: { name: 'Una categoria con questo nome esiste già' },
    }
  }

  return { success: true }
}

export const validateInventoryProduct = (
  product: InventoryProduct,
  categories: ProductCategory[],
  conservationPoints: ConservationPoint[]
): { success: boolean; errors?: Record<string, string> } => {
  const result = productSchema.safeParse(product)

  const missingFieldErrors = collectMissingFields(product)

  if (!result.success || Object.keys(missingFieldErrors).length > 0) {
    const errors: Record<string, string> = { ...missingFieldErrors }
    if (!result.success) {
      result.error.issues.forEach(issue => {
        const field = issue.path.join('.')
        if (!errors[field]) {
          errors[field] = issue.message
        }
      })
    }
    return { success: false, errors }
  }

  if (product.categoryId) {
    const category = categories.find(cat => cat.id === product.categoryId)
    if (!category) {
      return {
        success: false,
        errors: { categoryId: 'Categoria selezionata non valida' },
      }
    }

    if (product.conservationPointId) {
      const point = conservationPoints.find(
        p => p.id === product.conservationPointId
      )
      if (point) {
        const { minTemp, maxTemp, requiresBlastChilling } =
          category.conservationRules

        if (
          point.targetTemperature < minTemp ||
          point.targetTemperature > maxTemp
        ) {
          return {
            success: false,
            errors: {
              conservationPointId:
                'Il punto di conservazione non rispetta il range di temperatura richiesto',
            },
          }
        }

        if (requiresBlastChilling && !point.isBlastChiller) {
          return {
            success: false,
            errors: {
              conservationPointId:
                'La categoria richiede un abbattitore di temperatura',
            },
          }
        }
      }
    }
  }

  if (product.purchaseDate && product.expiryDate) {
    const purchase = new Date(product.purchaseDate)
    const expiry = new Date(product.expiryDate)
    if (purchase >= expiry) {
      return {
        success: false,
        errors: {
          expiryDate:
            'La data di scadenza deve essere successiva alla data di acquisto',
        },
      }
    }
  }

  return { success: true }
}

export const generateInventoryId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`

export const createEmptyCategory = {
  fromExisting(category?: ProductCategory | null): ProductCategory {
    if (category) {
      return {
        ...category,
        color: category.color ?? '#3b82f6',
        conservationRules: {
          minTemp: category.conservationRules.minTemp ?? 0,
          maxTemp: category.conservationRules.maxTemp ?? 4,
          maxStorageDays: category.conservationRules.maxStorageDays,
          requiresBlastChilling:
            category.conservationRules.requiresBlastChilling ?? false,
        },
      }
    }

    return {
      id: generateInventoryId('cat'),
      name: '',
      color: '#3b82f6',
      conservationRules: {
        minTemp: 0,
        maxTemp: 4,
        maxStorageDays: undefined,
        requiresBlastChilling: false,
      },
    }
  },
}

export const createEmptyProduct = {
  fromExisting(product?: InventoryProduct | null): InventoryProduct {
    if (product) {
      return {
        ...product,
        allergens: product.allergens ?? [],
      }
    }

    return {
      id: generateInventoryId('prod'),
      name: '',
      status: 'active',
      allergens: [],
    }
  },
}

export const normalizeInventoryProduct = (
  product: InventoryProduct
): InventoryProduct => ({
  id: product.id,
  name: product.name.trim(),
  categoryId: product.categoryId || undefined,
  departmentId: product.departmentId || undefined,
  conservationPointId: product.conservationPointId || undefined,
  sku: product.sku || undefined,
  barcode: product.barcode || undefined,
  supplierName: product.supplierName || undefined,
  purchaseDate: product.purchaseDate || undefined,
  expiryDate: product.expiryDate || undefined,
  quantity: product.quantity,
  unit: product.unit || undefined,
  allergens: product.allergens ?? [],
  labelPhotoUrl: product.labelPhotoUrl || undefined,
  status: product.status,
  complianceStatus: product.complianceStatus,
  notes: product.notes || undefined,
})

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
      message:
        'Associa categoria e punto di conservazione per verificare la conformità',
    }
  }

  const category = categories.find(cat => cat.id === product.categoryId)
  const point = conservationPoints.find(
    p => p.id === product.conservationPointId
  )

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
