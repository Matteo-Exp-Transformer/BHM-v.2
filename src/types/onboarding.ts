export interface DepartmentSummary {
  id: string
  name: string
  description?: string
  is_active?: boolean
}

export type StaffRole = 'admin' | 'responsabile' | 'dipendente' | 'collaboratore'

export interface StaffMember {
  id: string
  name: string
  surname: string
  fullName: string
  role: StaffRole
  categories: string[]
  email?: string
  phone?: string
  department_assignments: string[]
  haccpExpiry?: string
  notes?: string
}

export interface StaffStepFormData {
  name: string
  surname: string
  email: string
  phone: string
  role: StaffRole
  categories: string[]
  departmentAssignments: string[]
  haccpExpiry: string
  notes: string
}

export type StaffValidationErrors = Partial<{
  name: string
  surname: string
  email: string
  phone: string
  role: string
  categories: string
  haccpExpiry: string
}>

export interface StaffStepProps {
  data?: StaffMember[]
  departments: DepartmentSummary[]
  staff?: StaffMember[]
  onUpdate: (staff: StaffMember[]) => void
  onValidChange: (valid: boolean) => void
}

export interface ConservationPoint {
  id: string
  name: string
  departmentId: string
  targetTemperature: number
  pointType: 'ambient' | 'fridge' | 'freezer' | 'blast'
  isBlastChiller: boolean
  productCategories: string[]
  source: 'manual' | 'prefill' | 'import'
}

export interface ConservationStepFormData {
  name: string
  departmentId: string
  targetTemperature: string
  pointType: 'ambient' | 'fridge' | 'freezer' | 'blast'
  isBlastChiller: boolean
  productCategories: string[]
  source: 'manual' | 'prefill' | 'import'
}

export interface ConservationStepProps {
  data?: {
    points: ConservationPoint[]
  }
  departments: DepartmentSummary[]
  staff?: StaffMember[]
  onUpdate: (data: { points: ConservationPoint[] }) => void
  onValidChange: (valid: boolean) => void
}

export type TaskFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual'

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

export type HaccpTaskCategory =
  | 'temperature'
  | 'hygiene'
  | 'maintenance'
  | 'documentation'
  | 'training'
  | 'other'

export interface GeneralTask {
  id: string
  name: string
  description?: string
  frequency: TaskFrequency
  departmentId?: string
  conservationPointId?: string
  priority: TaskPriority
  estimatedDuration: number
  checklist: string[]
  requiredTools: string[]
  haccpCategory: HaccpTaskCategory
}

export type MaintenanceTaskType =
  | 'temperature_monitoring'
  | 'sanitization'
  | 'defrosting'

export interface MaintenanceTask {
  id: string
  conservationPointId: string
  conservationPointName: string
  type: MaintenanceTaskType
  frequency: TaskFrequency
  assignedRole?: string
  assignedStaffIds: string[]
  notes?: string
}

export interface TasksStepData {
  generalTasks: GeneralTask[]
  maintenanceTasks: MaintenanceTask[]
}

export interface TasksStepProps {
  data?: TasksStepData
  departments: DepartmentSummary[]
  conservationPoints: ConservationPoint[]
  staff?: StaffMember[]
  onUpdate: (data: TasksStepData) => void
  onValidChange: (valid: boolean) => void
}

export type ProductStatus = 'active' | 'expired' | 'consumed' | 'waste'

export interface ProductCategory {
  id: string
  name: string
  color: string
  description?: string
  conservationRules: {
    minTemp: number
    maxTemp: number
    maxStorageDays?: number
    requiresBlastChilling?: boolean
  }
}

export interface InventoryProduct {
  id: string
  name: string
  categoryId?: string
  departmentId?: string
  conservationPointId?: string
  quantity?: number
  unit?: string
  allergens: string[]
  supplierName?: string
  batchNumber?: string
  purchaseDate?: string
  expiryDate?: string
  status: ProductStatus
  notes?: string
}

export interface InventoryStepData {
  categories: ProductCategory[]
  products: InventoryProduct[]
}

export interface InventoryStepProps {
  data?: InventoryStepData
  departments: DepartmentSummary[]
  conservationPoints: ConservationPoint[]
  onUpdate: (data: InventoryStepData) => void
  onValidChange: (valid: boolean) => void
}

