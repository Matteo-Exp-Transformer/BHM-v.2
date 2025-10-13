// Inventory System Types for HACCP Business Manager

export interface Product {
  id: string
  company_id: string
  name: string // Required
  category_id?: string
  category_name?: string
  department_id?: string
  department_name?: string
  conservation_point_id?: string
  conservation_point_name?: string

  // Identification
  barcode?: string
  sku?: string
  supplier_name?: string

  // Dates & Quantities
  purchase_date?: Date
  expiry_date?: Date
  quantity?: number
  unit?: string

  // Safety & Compliance
  allergens: AllergenType[]
  label_photo_url?: string
  notes?: string

  // Status
  status: 'active' | 'expired' | 'waste'
  compliance_status?: 'compliant' | 'warning' | 'non_compliant'

  // Metadata
  created_at: Date
  updated_at: Date
}

/**
 * Traccia completamenti scadenze prodotti
 */
export interface ProductExpiryCompletion {
  id: string
  company_id: string
  product_id: string
  completed_by?: string
  completed_at: Date
  action: 'expired' | 'waste' // expired = consumato/cucinato, waste = smaltito
  notes?: string
  created_at: Date
  updated_at: Date
}

export interface ProductCategory {
  id: string
  company_id: string
  name: string
  description?: string
  temperature_requirements?: {
    min_temp: number
    max_temp: number
    storage_type: ConservationPointType
  }
  default_expiry_days?: number
  allergen_info: string[]
  created_at: Date
  updated_at: Date
}

export enum AllergenType {
  GLUTINE = 'glutine',
  LATTE = 'latte',
  UOVA = 'uova',
  SOIA = 'soia',
  FRUTTA_GUSCIO = 'frutta_guscio',
  ARACHIDI = 'arachidi',
  PESCE = 'pesce',
  CROSTACEI = 'crostacei',
}

export enum ConservationPointType {
  AMBIENT = 'ambient',
  FRIDGE = 'fridge',
  FREEZER = 'freezer',
  BLAST = 'blast',
}

export interface ExpiryAlert {
  product_id: string
  product_name: string
  expiry_date: Date
  days_until_expiry: number
  alert_level: 'warning' | 'critical' | 'expired'
}

export interface ShoppingListItem {
  id: string
  product_id?: string
  product_name: string
  quantity?: number
  unit?: string
  category?: string
  notes?: string
  is_purchased: boolean
  created_at: Date
}

export interface ShoppingList {
  id: string
  company_id: string
  name: string
  description?: string
  items: ShoppingListItem[]
  created_by: string
  created_at: Date
  updated_at: Date
}

export interface ExpiredProduct {
  id: string
  company_id: string
  name: string
  category_id: string | null
  category_name?: string
  department_id: string | null
  department_name?: string
  conservation_point_id?: string | null
  conservation_point_name?: string

  // Identification
  barcode?: string
  sku?: string
  supplier_name?: string

  // Dates & Quantities
  purchase_date?: Date
  expiry_date: Date
  quantity: number
  unit: string

  // Safety & Compliance
  allergens: AllergenType[]
  temperature_requirements: {
    min_temp: number
    max_temp: number
    storage_type: ConservationPointType
  }

  // Documentation
  label_photo_url?: string
  notes?: string

  // Expiry specific
  expired_at: Date
  reinsertion_count: number
  previous_product_id?: string

  // Status
  status: 'expired'
  compliance_status: 'non_compliant'

  // Metadata
  created_at: Date
  updated_at: Date
}

// Form interfaces
export interface CreateProductForm {
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
  allergens: AllergenType[]
  label_photo_url?: string
  notes?: string
}

export interface CreateCategoryForm {
  name: string
  description?: string
  temperature_requirements?: {
    min_temp: number
    max_temp: number
    storage_type: ConservationPointType
  }
  default_expiry_days?: number
  allergen_info: string[]
}

// Filter and search interfaces
export interface ProductFilters {
  category_id?: string
  department_id?: string
  conservation_point_id?: string
  status?: Product['status']
  compliance_status?: Product['compliance_status']
  expiry_alert?: 'expiring_soon' | 'expired' | 'all'
  allergens?: AllergenType[]
}

export interface ProductSearchParams {
  query?: string
  filters?: ProductFilters
  sort_by?: 'name' | 'expiry_date' | 'created_at' | 'status'
  sort_order?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// Statistics interfaces
export interface InventoryStats {
  total_products: number
  active_products: number
  expiring_soon: number
  expired: number
  by_category: Record<string, number>
  by_department: Record<string, number>
  by_status: Record<Product['status'], number>
  compliance_rate: number
}

export interface ExpiryStats {
  total_expiring: number
  expiring_today: number
  expiring_this_week: number
  expired_count: number
  by_alert_level: Record<ExpiryAlert['alert_level'], number>
}

// Reinsertion workflow types
export interface ReinsertExpiredProductRequest {
  expired_product_id: string
  new_expiry_date: Date
  new_quantity?: number
  notes?: string
}

export interface WasteStats {
  total_expired_products: number
  total_waste_cost: number
  average_expiry_days: number
  most_wasted_category: string
  waste_trend: 'increasing' | 'decreasing' | 'stable'
  monthly_waste_cost: number[]
  prevention_savings: number
}

// PDF generation types
export interface ShoppingListPDFConfig {
  format: 'A4' | 'A5'
  margin: number
  header: {
    company_name: boolean
    logo: boolean
    list_date: boolean
    created_by: boolean
  }
  grouping: {
    by_category: boolean
    by_supplier: boolean
    by_department: boolean
  }
  columns: ('product_name' | 'quantity' | 'category' | 'supplier' | 'notes')[]
}

export interface PDFGenerationOptions {
  filename?: string
  config: ShoppingListPDFConfig
  include_expired?: boolean
  include_notes?: boolean
}
