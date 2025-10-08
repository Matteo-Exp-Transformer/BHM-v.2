export interface BusinessInfoData {
  name: string
  address: string
  phone: string
  email: string
  vat_number: string
  business_type: string
  established_date: string
  license_number: string
}

export interface BusinessInfoStepProps {
  data?: BusinessInfoData
  onUpdate: (data: BusinessInfoData) => void
  onValidChange: (valid: boolean) => void
}

export interface DepartmentSummary {
  id: string
  name: string
  description?: string
  is_active?: boolean
}

export type StaffRole =
  | 'admin'
  | 'responsabile'
  | 'dipendente'
  | 'collaboratore'

export interface StaffMember {
  id: string
  name: string
  surname: string
  fullName: string
  role: StaffRole
  categories: string[]
  email?: string
  phone?: string
  department_assignments: DepartmentSummary['id'][]
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
  departmentAssignments: DepartmentSummary['id'][]
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

export type PointSource = 'manual' | 'prefill' | 'import'

export type ConservationPointType = 'ambient' | 'fridge' | 'freezer' | 'blast'

export type MaintenanceTaskType =
  | 'temperature_calibration'
  | 'deep_cleaning'
  | 'defrosting'
  | 'filter_replacement'
  | 'seal_inspection'
  | 'compressor_check'
  | 'general_inspection'
  | 'other'

export type MaintenanceTaskStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'overdue'
  | 'skipped'

export interface ConservationMaintenanceTask {
  id: string
  title?: string
  conservationPointId: ConservationPoint['id']
  conservationPointName?: string
  type?: MaintenanceTaskType
  frequency?: TaskFrequency
  priority?: TaskPriority
  estimatedDuration?: number
  assignedRole?: StaffRole | string
  assignedStaffIds?: StaffMember['id'][]
  nextDue?: string
  instructions?: string[]
  notes?: string
  status?: MaintenanceTaskStatus
  // Proprietà in italiano per onboarding
  manutenzione?: StandardMaintenanceType
  frequenza?: MaintenanceFrequency
  assegnatoARuolo?: StaffRole | 'specifico' | string
  assegnatoACategoria?: string
  assegnatoADipendenteSpecifico?: string
  giorniCustom?: CustomFrequencyDays[]
  note?: string
}

export type MaintenanceTask = ConservationMaintenanceTask
export type ConservationMaintenancePlan = ConservationMaintenanceTask

export interface ConservationPoint {
  id: string
  name: string
  departmentId: DepartmentSummary['id']
  targetTemperature: number
  pointType: ConservationPointType
  isBlastChiller: boolean
  productCategories: string[]
  maintenanceTasks?: ConservationMaintenanceTask[]
  maintenanceDue?: string
  source?: PointSource
}

export interface ConservationStepFormData {
  name: string
  departmentId: DepartmentSummary['id']
  targetTemperature: string
  pointType: ConservationPointType
  isBlastChiller: boolean
  productCategories: string[]
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

export type TaskFrequency =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'annually'
  | 'as_needed'

// Tipi per le manutenzioni standard (in italiano)
export type StandardMaintenanceType =
  | 'rilevamento_temperatura'
  | 'sanificazione'
  | 'sbrinamento'
  | 'controllo_scadenze'

// Frequenze di manutenzione (in italiano)
export type MaintenanceFrequency =
  | 'giornaliera'
  | 'settimanale'
  | 'mensile'
  | 'annuale'
  | 'custom'

// Giorni della settimana per frequenze personalizzate
export type CustomFrequencyDays =
  | 'lunedi'
  | 'martedi'
  | 'mercoledi'
  | 'giovedi'
  | 'venerdi'
  | 'sabato'
  | 'domenica'

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

export interface GenericTask {
  id: string
  name: string
  frequenza: TaskFrequency | MaintenanceFrequency
  assegnatoARuolo: StaffRole | 'specifico' | string
  assegnatoACategoria?: string
  assegnatoADipendenteSpecifico?: string
  note?: string
  priority?: TaskPriority
  giorniCustom?: CustomFrequencyDays[]
}

export interface TasksStepData {
  conservationMaintenancePlans: ConservationMaintenanceTask[]
  genericTasks: GenericTask[]
}

export interface TasksStepProps {
  data?: TasksStepData
  departments?: DepartmentSummary[]
  conservationPoints?: ConservationPoint[]
  staff?: StaffMember[]
  onUpdate: (data: TasksStepData) => void
  onValidChange: (valid: boolean) => void
}

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
  barcode?: string
  sku?: string
  supplierName?: string
  purchaseDate?: string
  expiryDate?: string
  quantity?: number
  unit?: string
  allergens?: string[]
  labelPhotoUrl?: string
  notes?: string
  status?: 'active' | 'expired' | 'consumed' | 'waste'
  complianceStatus?: 'compliant' | 'warning' | 'non_compliant'
}

export interface InventoryStepData {
  categories: ProductCategory[]
  products: InventoryProduct[]
}

export interface InventoryStepProps {
  data?: InventoryStepData
  departments?: DepartmentSummary[]
  conservationPoints?: ConservationPoint[]
  onUpdate: (data: InventoryStepData) => void
  onValidChange: (valid: boolean) => void
}

export interface OnboardingData {
  business?: BusinessInfoData
  departments?: DepartmentSummary[]
  staff?: StaffMember[]
  conservation?: {
    points: ConservationPoint[]
  }
  tasks?: TasksStepData
  inventory?: InventoryStepData
}
