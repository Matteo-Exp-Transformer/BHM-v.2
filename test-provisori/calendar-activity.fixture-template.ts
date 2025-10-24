/**
 * Calendar Activity test fixture templates (tests A-T)
 *
 * Ogni template mantiene la parità con CalendarPage, Calendar e MacroCategoryModal.
 * Rimpiazzare i placeholder `__...__` con gli ID reali prima di eseguire test end-to-end.
 */

import type { CalendarEvent, CalendarEventPriority, CalendarEventStatus } from '@/types/calendar'
import { EVENT_COLORS, STATUS_COLORS, PRIORITY_COLORS } from '@/types/calendar'
import type { MacroCategory, MacroCategoryItem } from '@/features/calendar/hooks/useMacroCategoryEvents'
import type { EventType } from '@/types/calendar-filters'
import { calculateEventStatus, determineEventType } from '@/types/calendar-filters'

export const BASE_NOW = new Date('2025-01-17T09:00:00Z')

export const BASE_DATES = {
  todayMorning: new Date('2025-01-17T08:00:00Z'),
  todayNoon: new Date('2025-01-17T12:00:00Z'),
  yesterdayMorning: new Date('2025-01-16T08:00:00Z'),
  tomorrowMorning: new Date('2025-01-18T08:00:00Z'),
  nextWeek: new Date('2025-01-24T08:00:00Z'),
  startOfYear: new Date('2025-01-01T08:00:00Z'),
  endOfYear: new Date('2025-12-31T08:00:00Z'),
} as const

export const BASE_CONTEXT = {
  companyId: '__COMPANY_ID__',
  ownerUserId: '__USER_ID_OWNER__',
  departments: {
    kitchen: { id: '__DEPT_KITCHEN__', name: 'Cucina' },
    bar: { id: '__DEPT_BAR__', name: 'Bar' },
    storage: { id: '__DEPT_STORAGE__', name: 'Magazzino' },
  },
  staff: {
    manager: { id: '__STAFF_MANAGER__', role: 'responsabile', departments: ['__DEPT_KITCHEN__'] },
    operator: { id: '__STAFF_OPERATOR__', role: 'dipendente', departments: ['__DEPT_BAR__'] },
    quality: { id: '__STAFF_QUALITY__', role: 'admin', departments: ['__DEPT_STORAGE__'] },
  },
  conservationPoints: {
    fridge: '__CP_FRIDGE__',
    freezer: '__CP_FREEZER__',
  },
  products: {
    milk: '__PRODUCT_MILK__',
    yogurt: '__PRODUCT_YOGURT__',
  },
} as const

const iso = (value: Date): string => value.toISOString()

type CalendarEventOverrides = Partial<Omit<CalendarEvent, 'metadata' | 'extendedProps'>> & {
  metadata?: Partial<CalendarEvent['metadata']>
  extendedProps?: Partial<Omit<CalendarEvent['extendedProps'], 'metadata'>> & {
    metadata?: Record<string, any>
  }
}

export type MacroCategoryItemTemplate = MacroCategoryItem & {
  type: EventType
  department?: string
}

export interface GenericTaskSeedTemplate {
  id: string
  company_id: string
  name: string
  description: string
  frequency:
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'quarterly'
    | 'biannually'
    | 'annually'
    | 'annual'
    | 'as_needed'
    | 'custom'
  assigned_to: string
  assigned_to_role?: string | null
  assigned_to_category?: string | null
  assigned_to_staff_id?: string | null
  priority: 'low' | 'medium' | 'high' | 'critical'
  estimated_duration?: number | null
  next_due?: string | null
  status: string
  department_id: string
  time_management?: {
    time_range?: {
      start_time: string
      end_time: string
      is_overnight: boolean
    }
    completion_type?: 'timeRange' | 'startTime' | 'endTime' | 'none'
    completion_start_time?: string
    completion_end_time?: string
  }
  created_at: string
  updated_at: string
}

export interface MaintenanceTaskSeedTemplate {
  id: string
  company_id: string
  conservation_point_id: string
  department_id: string
  title: string
  description?: string
  type: string
  frequency:
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'quarterly'
    | 'biannually'
    | 'annually'
    | 'annual'
    | 'as_needed'
    | 'custom'
  estimated_duration: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'skipped'
  assigned_to?: string | null
  assigned_to_role?: string | null
  assigned_to_category?: string | null
  assigned_to_staff_id?: string | null
  next_due: string
  last_completed?: string | null
  completed_by?: string | null
  completed_at?: string | null
  created_at: string
  updated_at: string
}

export interface TaskCompletionSeedTemplate {
  id: string
  company_id: string
  task_id: string
  completed_by?: string | null
  completed_at: string
  period_start: string
  period_end: string
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface ProductSeedTemplate {
  id: string
  company_id: string
  name: string
  department_id?: string | null
  conservation_point_id?: string | null
  expiry_date?: string | null
  quantity?: number | null
  unit?: string | null
  status: 'active' | 'expired' | 'consumed' | 'waste'
  notes?: string | null
  barcode?: string | null
  sku?: string | null
  supplier_name?: string | null
  purchase_date?: string | null
  created_at: string
  updated_at: string
}

export const buildGenericTaskSeed = (
  overrides: Partial<GenericTaskSeedTemplate> = {}
): GenericTaskSeedTemplate => {
  const defaultTimeManagement = {
    time_range: {
      start_time: '07:00',
      end_time: '19:00',
      is_overnight: false,
    },
    completion_type: 'timeRange' as const,
    completion_start_time: '07:00',
    completion_end_time: '19:00',
  }

  const base: GenericTaskSeedTemplate = {
    id: 'task-template',
    company_id: BASE_CONTEXT.companyId,
    name: 'Template mansione generica',
    description: 'Aggiornare con descrizione reale',
    frequency: 'daily',
    assigned_to: BASE_CONTEXT.staff.operator.id,
    assigned_to_role: BASE_CONTEXT.staff.operator.role,
    assigned_to_category: `department:${BASE_CONTEXT.departments.kitchen.id}`,
    assigned_to_staff_id: BASE_CONTEXT.staff.operator.id,
    priority: 'medium',
    estimated_duration: 60,
    next_due: iso(BASE_DATES.todayMorning),
    status: 'active',
    department_id: BASE_CONTEXT.departments.kitchen.id,
    time_management: { ...defaultTimeManagement },
    created_at: iso(new Date('2025-01-10T08:00:00Z')),
    updated_at: iso(new Date('2025-01-10T08:05:00Z')),
  }

  return {
    ...base,
    ...overrides,
    time_management: overrides.time_management ?? { ...defaultTimeManagement },
  }
}

export const buildMaintenanceTaskSeed = (
  overrides: Partial<MaintenanceTaskSeedTemplate> = {}
): MaintenanceTaskSeedTemplate => {
  const base: MaintenanceTaskSeedTemplate = {
    id: 'maintenance-template',
    company_id: BASE_CONTEXT.companyId,
    conservation_point_id: BASE_CONTEXT.conservationPoints.fridge,
    department_id: BASE_CONTEXT.departments.kitchen.id,
    title: 'Template manutenzione',
    description: 'Aggiornare con descrizione reale',
    type: 'equipment',
    frequency: 'weekly',
    estimated_duration: 90,
    priority: 'high',
    status: 'scheduled',
    assigned_to: BASE_CONTEXT.staff.manager.id,
    assigned_to_role: BASE_CONTEXT.staff.manager.role,
    assigned_to_category: `department:${BASE_CONTEXT.departments.kitchen.id}`,
    assigned_to_staff_id: BASE_CONTEXT.staff.manager.id,
    next_due: iso(BASE_DATES.todayMorning),
    last_completed: null,
    completed_by: null,
    completed_at: null,
    created_at: iso(new Date('2025-01-09T08:00:00Z')),
    updated_at: iso(new Date('2025-01-09T08:05:00Z')),
  }

  return {
    ...base,
    ...overrides,
  }
}

export const buildTaskCompletionSeed = (
  overrides: Partial<TaskCompletionSeedTemplate> = {}
): TaskCompletionSeedTemplate => {
  const base: TaskCompletionSeedTemplate = {
    id: 'completion-template',
    company_id: BASE_CONTEXT.companyId,
    task_id: 'task-template',
    completed_by: BASE_CONTEXT.ownerUserId,
    completed_at: iso(new Date(BASE_DATES.yesterdayMorning.getTime() + 30 * 60 * 1000)),
    period_start: iso(BASE_DATES.yesterdayMorning),
    period_end: iso(new Date(BASE_DATES.yesterdayMorning.getTime() + 60 * 60 * 1000)),
    notes: 'Template note completamento',
    created_at: iso(new Date('2025-01-16T08:00:00Z')),
    updated_at: iso(new Date('2025-01-16T08:02:00Z')),
  }

  return {
    ...base,
    ...overrides,
  }
}

export const buildProductSeed = (
  overrides: Partial<ProductSeedTemplate> = {}
): ProductSeedTemplate => {
  const base: ProductSeedTemplate = {
    id: 'product-template',
    company_id: BASE_CONTEXT.companyId,
    name: 'Template prodotto',
    department_id: BASE_CONTEXT.departments.storage.id,
    conservation_point_id: BASE_CONTEXT.conservationPoints.fridge,
    expiry_date: iso(BASE_DATES.tomorrowMorning),
    quantity: 10,
    unit: 'pezzi',
    status: 'active',
    notes: 'Aggiornare con note reali',
    barcode: null,
    sku: null,
    supplier_name: 'Supplier template',
    purchase_date: iso(BASE_DATES.yesterdayMorning),
    created_at: iso(new Date('2025-01-12T08:00:00Z')),
    updated_at: iso(new Date('2025-01-12T08:05:00Z')),
  }

  return {
    ...base,
    ...overrides,
  }
}

const resolveColors = (
  type: CalendarEvent['type'],
  status: CalendarEventStatus,
  priority: CalendarEventPriority
) => {
  if (priority === 'critical') {
    return PRIORITY_COLORS.critical
  }

  if (status === 'completed') {
    return STATUS_COLORS.completed
  }

  if (status === 'overdue') {
    return STATUS_COLORS.overdue
  }

  if (status === 'cancelled') {
    return STATUS_COLORS.cancelled
  }

  if (priority === 'high') {
    return {
      backgroundColor: PRIORITY_COLORS.high.backgroundColor,
      borderColor: EVENT_COLORS[type].borderColor,
      textColor: PRIORITY_COLORS.high.textColor,
    }
  }

  return EVENT_COLORS[type]
}

const buildEventBase = (
  type: CalendarEvent['type'],
  source: CalendarEvent['source'],
  overrides: CalendarEventOverrides,
  metadata: CalendarEvent['metadata'],
  extendedMetadata: Record<string, any>
): CalendarEvent => {
  const status: CalendarEventStatus = overrides.status ?? 'pending'
  const priority: CalendarEventPriority = overrides.priority ?? 'medium'
  const start = overrides.start ?? new Date(BASE_DATES.todayMorning)
  const end = overrides.end ?? new Date(start.getTime() + 60 * 60 * 1000)
  const colors = resolveColors(type, status, priority)

  return {
    id: overrides.id ?? `${type}-event-template`,
    title: overrides.title ?? `Template ${type}`,
    description: overrides.description ?? 'Sostituire con descrizione reale',
    start,
    end,
    allDay: overrides.allDay ?? false,
    type,
    status,
    priority,
    source,
    sourceId:
      overrides.sourceId ??
      metadata.task_id ??
      metadata.maintenance_id ??
      metadata.product_id ??
      'source-template',
    assigned_to: overrides.assigned_to ?? [],
    department_id: overrides.department_id ?? metadata.department_id,
    conservation_point_id: overrides.conservation_point_id ?? metadata.conservation_point_id,
    recurring: overrides.recurring ?? false,
    backgroundColor: overrides.backgroundColor ?? colors.backgroundColor,
    borderColor: overrides.borderColor ?? colors.borderColor,
    textColor: overrides.textColor ?? colors.textColor,
    extendedProps: {
      description:
        overrides.extendedProps?.description ?? (overrides.description ?? 'Sostituire con descrizione reale'),
      priority: overrides.extendedProps?.priority ?? priority,
      status:
        overrides.extendedProps?.status ??
        (status === 'overdue' ? 'overdue' : status === 'completed' ? 'completed' : 'scheduled'),
      assignedTo: overrides.extendedProps?.assignedTo ?? overrides.assigned_to ?? [],
      location: overrides.extendedProps?.location,
      category: overrides.extendedProps?.category,
      color: overrides.extendedProps?.color,
      isRecurring: overrides.extendedProps?.isRecurring ?? overrides.recurring ?? false,
      recurrenceRule: overrides.extendedProps?.recurrenceRule,
      notifications: overrides.extendedProps?.notifications ?? [],
      metadata: {
        ...extendedMetadata,
      },
    },
    metadata,
    created_at: overrides.created_at ?? new Date('2025-01-10T08:00:00Z'),
    updated_at: overrides.updated_at ?? new Date('2025-01-10T08:05:00Z'),
    created_by: overrides.created_by ?? BASE_CONTEXT.ownerUserId,
    company_id: overrides.company_id ?? BASE_CONTEXT.companyId,
  }
}

export const buildGenericTaskEventTemplate = (
  overrides: CalendarEventOverrides = {}
): CalendarEvent => {
  const taskId = overrides.metadata?.task_id ?? overrides.sourceId ?? overrides.id ?? 'task-template'
  const departmentId =
    overrides.department_id ?? overrides.metadata?.department_id ?? BASE_CONTEXT.departments.kitchen.id
  const start = overrides.start ?? new Date(BASE_DATES.todayMorning)

  const metadata: CalendarEvent['metadata'] = {
    task_id: taskId,
    department_id: departmentId,
    assigned_to_staff_id: overrides.metadata?.assigned_to_staff_id ?? BASE_CONTEXT.staff.operator.id,
    assigned_to_role: overrides.metadata?.assigned_to_role ?? BASE_CONTEXT.staff.operator.role,
    assigned_to_category: overrides.metadata?.assigned_to_category ?? `department:${departmentId}`,
    notes: overrides.metadata?.notes ?? 'Template mansione generica',
  }

  const extendedMetadata = {
    id: taskId,
    task_id: taskId,
    estimatedDuration: overrides.extendedProps?.metadata?.estimatedDuration ?? 60,
    frequency: overrides.extendedProps?.metadata?.frequency ?? 'daily',
    period_start: overrides.extendedProps?.metadata?.period_start ?? start,
    period_end: overrides.extendedProps?.metadata?.period_end ?? new Date(start.getTime() + 60 * 60 * 1000),
  }

  return buildEventBase(
    'general_task',
    'general_task',
    {
      ...overrides,
      sourceId: overrides.sourceId ?? taskId,
      department_id: departmentId,
      start,
    },
    {
      ...metadata,
      ...(overrides.metadata ?? {}),
    },
    {
      ...extendedMetadata,
      ...(overrides.extendedProps?.metadata ?? {}),
    }
  )
}

export const buildMaintenanceEventTemplate = (
  overrides: CalendarEventOverrides = {}
): CalendarEvent => {
  const maintenanceId =
    overrides.metadata?.maintenance_id ?? overrides.sourceId ?? overrides.id ?? 'maintenance-template'
  const departmentId =
    overrides.department_id ?? overrides.metadata?.department_id ?? BASE_CONTEXT.departments.kitchen.id
  const start = overrides.start ?? new Date(BASE_DATES.todayMorning)

  const metadata: CalendarEvent['metadata'] = {
    maintenance_id: maintenanceId,
    conservation_point_id:
      overrides.metadata?.conservation_point_id ?? BASE_CONTEXT.conservationPoints.fridge,
    department_id: departmentId,
    assigned_to_staff_id: overrides.metadata?.assigned_to_staff_id ?? BASE_CONTEXT.staff.manager.id,
    assigned_to_role: overrides.metadata?.assigned_to_role ?? BASE_CONTEXT.staff.manager.role,
    assigned_to_category: overrides.metadata?.assigned_to_category ?? `department:${departmentId}`,
    notes: overrides.metadata?.notes ?? 'Template manutenzione',
  }

  const extendedMetadata = {
    id: maintenanceId,
    notes: overrides.extendedProps?.metadata?.notes ?? metadata.notes,
    estimatedDuration: overrides.extendedProps?.metadata?.estimatedDuration ?? 90,
    frequency: overrides.extendedProps?.metadata?.frequency ?? 'weekly',
  }

  return buildEventBase(
    'maintenance',
    'maintenance',
    {
      ...overrides,
      sourceId: overrides.sourceId ?? maintenanceId,
      department_id: departmentId,
      start,
    },
    {
      ...metadata,
      ...(overrides.metadata ?? {}),
    },
    {
      ...extendedMetadata,
      ...(overrides.extendedProps?.metadata ?? {}),
    }
  )
}

export const buildProductExpiryEventTemplate = (
  overrides: CalendarEventOverrides = {}
): CalendarEvent => {
  const productId = overrides.metadata?.product_id ?? overrides.sourceId ?? overrides.id ?? 'product-template'
  const departmentId =
    overrides.department_id ?? overrides.metadata?.department_id ?? BASE_CONTEXT.departments.storage.id
  const start = overrides.start ?? new Date(BASE_DATES.tomorrowMorning)

  const metadata: CalendarEvent['metadata'] = {
    product_id: productId,
    department_id: departmentId,
    conservation_point_id:
      overrides.metadata?.conservation_point_id ?? BASE_CONTEXT.conservationPoints.fridge,
    notes: overrides.metadata?.notes ?? 'Template scadenza prodotto',
  }

  const extendedMetadata = {
    id: productId,
    product_id: productId,
    quantity: overrides.extendedProps?.metadata?.quantity ?? 5,
    unit: overrides.extendedProps?.metadata?.unit ?? 'pz',
    supplierName: overrides.extendedProps?.metadata?.supplierName ?? 'Supplier template',
  }

  return buildEventBase(
    'product_expiry',
    'product_expiry',
    {
      ...overrides,
      sourceId: overrides.sourceId ?? productId,
      department_id: departmentId,
      start,
      priority: overrides.priority ?? 'high',
    },
    {
      ...metadata,
      ...(overrides.metadata ?? {}),
    },
    {
      ...extendedMetadata,
      ...(overrides.extendedProps?.metadata ?? {}),
    }
  )
}

export const buildCustomEventTemplate = (overrides: CalendarEventOverrides = {}): CalendarEvent => {
  const customId = overrides.sourceId ?? overrides.id ?? 'custom-event-template'

  const metadata: CalendarEvent['metadata'] = {
    notes: overrides.metadata?.notes ?? 'Evento custom non classificato',
  }

  const extendedMetadata = {
    id: customId,
    ...(overrides.extendedProps?.metadata ?? {}),
  }

  return buildEventBase(
    'custom',
    'custom',
    {
      ...overrides,
      sourceId: customId,
    },
    {
      ...metadata,
      ...(overrides.metadata ?? {}),
    },
    extendedMetadata
  )
}

const eventTypeToMacroCategory: Record<EventType, MacroCategory> = {
  generic_task: 'generic_tasks',
  maintenance: 'maintenance',
  product_expiry: 'product_expiry',
}

export const buildMacroCategoryExpectation = (event: CalendarEvent): MacroCategoryItemTemplate => {
  const eventType = determineEventType(event.source ?? '', event.metadata)
  const macroCategory = eventTypeToMacroCategory[eventType]
  const calculatedStatus = calculateEventStatus(new Date(event.start), event.status === 'completed')
  const status: 'pending' | 'completed' | 'overdue' =
    event.status === 'completed'
      ? 'completed'
      : calculatedStatus === 'overdue'
        ? 'overdue'
        : 'pending'

  const completionData = (event.metadata as Record<string, any>)?.completion_data

  return {
    id: event.id,
    title: event.title,
    description: event.description ?? '',
    dueDate: new Date(event.start),
    status,
    priority: event.priority ?? 'medium',
    assignedTo: Array.isArray(event.assigned_to) && event.assigned_to.length > 0 ? event.assigned_to[0] : undefined,
    assignedToRole: event.metadata.assigned_to_role,
    assignedToCategory: event.metadata.assigned_to_category,
    assignedToStaffId: event.metadata.assigned_to_staff_id,
    frequency: (event.extendedProps.metadata as Record<string, any>)?.frequency,
    metadata: {
      category: macroCategory,
      sourceId: event.sourceId ?? event.id,
      notes: event.metadata.notes,
      departmentId: event.metadata.department_id,
      taskId: event.metadata.task_id,
      maintenanceId: event.metadata.maintenance_id,
      productId: event.metadata.product_id,
      completionNotes: completionData?.notes,
      completedBy: completionData?.completed_by,
      completedAt: completionData?.completed_at,
      ...event.metadata,
    },
    type: eventType,
    department: event.metadata.department_id,
  }
}

export interface SupabaseSeedTemplate {
  table: 'tasks' | 'task_completions' | 'maintenance_tasks' | 'products'
  description: string
  rows: Record<string, any>[]
}

const createFilterDataset = () => {
  const genericPendingId = 'task-filter-pending'
  const genericCompletedId = 'task-filter-completed'
  const maintenanceId = 'maintenance-filter'
  const productId = 'product-filter'

  const events: CalendarEvent[] = [
    buildGenericTaskEventTemplate({
      id: 'evt-filter-generic-pending',
      title: 'Pulizia banco cucina',
      status: 'pending',
      sourceId: genericPendingId,
      metadata: {
        task_id: genericPendingId,
        department_id: BASE_CONTEXT.departments.kitchen.id,
      },
      assigned_to: [BASE_CONTEXT.staff.operator.id],
    }),
    buildGenericTaskEventTemplate({
      id: 'evt-filter-generic-completed',
      title: 'Check lista magazzino',
      status: 'completed',
      start: new Date(BASE_DATES.yesterdayMorning),
      sourceId: genericCompletedId,
      metadata: {
        task_id: genericCompletedId,
        department_id: BASE_CONTEXT.departments.storage.id,
      },
      department_id: BASE_CONTEXT.departments.storage.id,
      assigned_to: [BASE_CONTEXT.staff.manager.id],
      extendedProps: {
        status: 'completed',
      },
    }),
    buildMaintenanceEventTemplate({
      id: 'evt-filter-maintenance-overdue',
      title: 'Sanificazione frigorifero bar',
      status: 'overdue',
      start: new Date(BASE_DATES.yesterdayMorning),
      sourceId: maintenanceId,
      metadata: {
        maintenance_id: maintenanceId,
        department_id: BASE_CONTEXT.departments.bar.id,
      },
      department_id: BASE_CONTEXT.departments.bar.id,
    }),
    buildProductExpiryEventTemplate({
      id: 'evt-filter-product',
      title: 'Latte intero in scadenza',
      status: 'pending',
      start: new Date(BASE_DATES.tomorrowMorning),
      sourceId: productId,
      metadata: {
        product_id: productId,
        department_id: BASE_CONTEXT.departments.kitchen.id,
      },
      priority: 'high',
    }),
  ]

  const supabaseSeeds: SupabaseSeedTemplate[] = [
    {
      table: 'tasks',
      description: 'Mansioni generiche usate per i test dei filtri',
      rows: [
        buildGenericTaskSeed({
          id: genericPendingId,
          name: 'Pulizia banco cucina',
          next_due: iso(BASE_DATES.todayMorning),
          department_id: BASE_CONTEXT.departments.kitchen.id,
        }),
        buildGenericTaskSeed({
          id: genericCompletedId,
          name: 'Check lista magazzino',
          next_due: iso(BASE_DATES.yesterdayMorning),
          department_id: BASE_CONTEXT.departments.storage.id,
        }),
      ],
    },
    {
      table: 'task_completions',
      description: 'Completamento della mansione "Check lista magazzino"',
      rows: [
        buildTaskCompletionSeed({
          id: 'completion-filter-magazzino',
          task_id: genericCompletedId,
          period_start: iso(BASE_DATES.yesterdayMorning),
          period_end: iso(new Date(BASE_DATES.yesterdayMorning.getTime() + 60 * 60 * 1000)),
          completed_at: iso(new Date(BASE_DATES.yesterdayMorning.getTime() + 30 * 60 * 1000)),
        }),
      ],
    },
    {
      table: 'maintenance_tasks',
      description: 'Manutenzione usata per i test dei filtri',
      rows: [
        buildMaintenanceTaskSeed({
          id: maintenanceId,
          title: 'Sanificazione frigorifero bar',
          next_due: iso(BASE_DATES.yesterdayMorning),
          department_id: BASE_CONTEXT.departments.bar.id,
          priority: 'high',
          status: 'overdue',
        }),
      ],
    },
    {
      table: 'products',
      description: 'Prodotto in scadenza per test filtri tipo',
      rows: [
        buildProductSeed({
          id: productId,
          name: 'Latte intero 1L',
          department_id: BASE_CONTEXT.departments.kitchen.id,
          conservation_point_id: BASE_CONTEXT.conservationPoints.fridge,
          expiry_date: iso(BASE_DATES.tomorrowMorning),
          quantity: 6,
          unit: 'bottiglie',
        }),
      ],
    },
  ]

  const macroExpectations = events.map(buildMacroCategoryExpectation)

  return {
    events,
    supabaseSeeds,
    macroExpectations,
  }
}

const createAlignmentDataset = () => {
  const genericId = 'task-alignment-generic'
  const maintenanceId = 'maintenance-alignment'
  const productId = 'product-alignment'

  const events: CalendarEvent[] = [
    buildGenericTaskEventTemplate({
      id: 'evt-alignment-generic',
      title: 'Controllo HACCP cucina',
      start: new Date(BASE_DATES.todayMorning),
      sourceId: genericId,
      metadata: {
        task_id: genericId,
        department_id: BASE_CONTEXT.departments.kitchen.id,
      },
      assigned_to: [BASE_CONTEXT.staff.operator.id],
    }),
    buildMaintenanceEventTemplate({
      id: 'evt-alignment-maintenance',
      title: 'Taratura abbattitore',
      start: new Date(BASE_DATES.todayMorning),
      sourceId: maintenanceId,
      metadata: {
        maintenance_id: maintenanceId,
        department_id: BASE_CONTEXT.departments.kitchen.id,
      },
      assigned_to: [BASE_CONTEXT.staff.manager.id],
    }),
    buildProductExpiryEventTemplate({
      id: 'evt-alignment-product',
      title: 'Yogurt artigianale in scadenza',
      start: new Date(BASE_DATES.todayMorning),
      sourceId: productId,
      metadata: {
        product_id: productId,
        department_id: BASE_CONTEXT.departments.storage.id,
      },
    }),
  ]

  const unknownEvent = buildCustomEventTemplate({
    id: 'evt-alignment-unknown',
    title: 'Evento non mappato',
    description: 'Usato per testare il fallback di onEventClick',
    start: new Date(BASE_DATES.todayMorning),
    status: 'pending',
    metadata: {
      notes: 'Nessuna macro categoria associata',
    },
  })

  const supabaseSeeds: SupabaseSeedTemplate[] = [
    {
      table: 'tasks',
      description: 'Mansione per test allineamento modal',
      rows: [
        buildGenericTaskSeed({
          id: genericId,
          name: 'Controllo HACCP cucina',
          next_due: iso(BASE_DATES.todayMorning),
          department_id: BASE_CONTEXT.departments.kitchen.id,
        }),
      ],
    },
    {
      table: 'maintenance_tasks',
      description: 'Manutenzione per test allineamento modal',
      rows: [
        buildMaintenanceTaskSeed({
          id: maintenanceId,
          title: 'Taratura abbattitore',
          department_id: BASE_CONTEXT.departments.kitchen.id,
          next_due: iso(BASE_DATES.todayMorning),
        }),
      ],
    },
    {
      table: 'products',
      description: 'Prodotto per test allineamento modal',
      rows: [
        buildProductSeed({
          id: productId,
          name: 'Yogurt artigianale 250g',
          department_id: BASE_CONTEXT.departments.storage.id,
          expiry_date: iso(BASE_DATES.todayMorning),
        }),
      ],
    },
  ]

  const macroExpectations = events.map(buildMacroCategoryExpectation)

  return {
    events,
    unknownEvent,
    supabaseSeeds,
    macroExpectations,
  }
}

const createCompletionDataset = () => {
  const genericId = 'task-completion-generic'
  const completionId = 'completion-generic-today'
  const maintenanceId = 'maintenance-completion'

  const completedEvent = buildGenericTaskEventTemplate({
    id: 'evt-completion-generic-completed',
    title: 'Pulizia piano cottura',
    status: 'completed',
    start: new Date(BASE_DATES.todayMorning),
    sourceId: genericId,
    metadata: {
      task_id: genericId,
      department_id: BASE_CONTEXT.departments.kitchen.id,
      notes: 'Pulizia profonda piano cottura',
      completion_data: {
        completed_by: BASE_CONTEXT.ownerUserId,
        completed_at: iso(new Date(BASE_DATES.todayMorning.getTime() + 30 * 60 * 1000)),
        notes: 'Task completato alle 09:30',
      },
    },
    assigned_to: [BASE_CONTEXT.staff.operator.id],
  })

  const pendingEvent = buildGenericTaskEventTemplate({
    id: 'evt-completion-generic-pending',
    title: 'Controllo temperature frigo',
    status: 'pending',
    start: new Date(BASE_DATES.todayNoon),
    sourceId: `${genericId}-pending`,
    metadata: {
      task_id: `${genericId}-pending`,
      department_id: BASE_CONTEXT.departments.kitchen.id,
    },
    assigned_to: [BASE_CONTEXT.staff.operator.id],
  })

  const maintenanceEvent = buildMaintenanceEventTemplate({
    id: 'evt-completion-maintenance',
    title: 'Verifica guarnizioni freezer',
    status: 'pending',
    start: new Date(BASE_DATES.todayMorning),
    sourceId: maintenanceId,
    metadata: {
      maintenance_id: maintenanceId,
      department_id: BASE_CONTEXT.departments.storage.id,
    },
    assigned_to: [BASE_CONTEXT.staff.manager.id],
  })

  const events = [completedEvent, pendingEvent, maintenanceEvent]

  const supabaseSeeds: SupabaseSeedTemplate[] = [
    {
      table: 'tasks',
      description: 'Mansioni per test completamento nel modal',
      rows: [
        buildGenericTaskSeed({
          id: genericId,
          name: 'Pulizia piano cottura',
          next_due: iso(BASE_DATES.todayMorning),
          department_id: BASE_CONTEXT.departments.kitchen.id,
        }),
        buildGenericTaskSeed({
          id: `${genericId}-pending`,
          name: 'Controllo temperature frigo',
          next_due: iso(BASE_DATES.todayNoon),
          department_id: BASE_CONTEXT.departments.kitchen.id,
        }),
      ],
    },
    {
      table: 'task_completions',
      description: 'Completamento della mansione Pulizia piano cottura',
      rows: [
        buildTaskCompletionSeed({
          id: completionId,
          task_id: genericId,
          period_start: iso(BASE_DATES.todayMorning),
          period_end: iso(new Date(BASE_DATES.todayMorning.getTime() + 60 * 60 * 1000)),
          completed_at: iso(new Date(BASE_DATES.todayMorning.getTime() + 30 * 60 * 1000)),
          notes: 'Pulizia completata prima dell\'apertura',
        }),
      ],
    },
    {
      table: 'maintenance_tasks',
      description: 'Manutenzione per test completamento modal',
      rows: [
        buildMaintenanceTaskSeed({
          id: maintenanceId,
          title: 'Verifica guarnizioni freezer',
          department_id: BASE_CONTEXT.departments.storage.id,
          next_due: iso(BASE_DATES.todayMorning),
        }),
      ],
    },
  ]

  const macroExpectations = events.map(buildMacroCategoryExpectation)

  return {
    events,
    supabaseSeeds,
    macroExpectations,
  }
}

const createBulkDataset = (count = 120) => {
  const events = Array.from({ length: count }, (_, index) =>
    buildGenericTaskEventTemplate({
      id: `evt-bulk-${index}`,
      title: `Evento bulk ${index}`,
      start: new Date(BASE_DATES.startOfYear.getTime() + index * 60 * 60 * 1000),
      sourceId: `task-bulk-${index}`,
      metadata: {
        task_id: `task-bulk-${index}`,
        department_id:
          index % 2 === 0 ? BASE_CONTEXT.departments.kitchen.id : BASE_CONTEXT.departments.bar.id,
      },
      priority: index % 5 === 0 ? 'high' : 'medium',
      assigned_to: [
        index % 2 === 0 ? BASE_CONTEXT.staff.operator.id : BASE_CONTEXT.staff.manager.id,
      ],
    })
  )

  return {
    events,
  }
}

const createEdgeCaseDataset = () => {
  const overlappingEvents: CalendarEvent[] = [
    buildGenericTaskEventTemplate({
      id: 'evt-edge-overlap-1',
      title: 'Pulizia forno',
      start: new Date(BASE_DATES.todayMorning),
      end: new Date(BASE_DATES.todayMorning.getTime() + 90 * 60 * 1000),
      sourceId: 'task-edge-overlap-1',
      metadata: {
        task_id: 'task-edge-overlap-1',
        department_id: BASE_CONTEXT.departments.kitchen.id,
      },
    }),
    buildMaintenanceEventTemplate({
      id: 'evt-edge-overlap-2',
      title: 'Verifica forno',
      start: new Date(BASE_DATES.todayMorning.getTime() + 30 * 60 * 1000),
      end: new Date(BASE_DATES.todayMorning.getTime() + 120 * 60 * 1000),
      sourceId: 'maintenance-edge-overlap-2',
      metadata: {
        maintenance_id: 'maintenance-edge-overlap-2',
        department_id: BASE_CONTEXT.departments.kitchen.id,
      },
    }),
  ]

  const boundaryEvents: CalendarEvent[] = [
    buildGenericTaskEventTemplate({
      id: 'evt-edge-start-year',
      title: 'Inventario annuale',
      start: new Date(BASE_DATES.startOfYear),
      sourceId: 'task-edge-start-year',
      metadata: {
        task_id: 'task-edge-start-year',
        department_id: BASE_CONTEXT.departments.storage.id,
      },
    }),
    buildGenericTaskEventTemplate({
      id: 'evt-edge-end-year',
      title: 'Pulizia di fine anno',
      start: new Date(BASE_DATES.endOfYear),
      sourceId: 'task-edge-end-year',
      metadata: {
        task_id: 'task-edge-end-year',
        department_id: BASE_CONTEXT.departments.kitchen.id,
      },
    }),
  ]

  return {
    overlappingEvents,
    boundaryEvents,
    emptyCalendarEvents: [] as CalendarEvent[],
  }
}

const createErrorDataset = () => {
  const malformedEvent = {
    id: 'evt-error-malformed',
    title: 'Evento malformato',
    start: undefined,
    status: 'pending',
  } as unknown as CalendarEvent

  const missingMetadataEvent = buildGenericTaskEventTemplate({
    id: 'evt-error-missing-metadata',
  })
  delete (missingMetadataEvent.metadata as Record<string, any>).task_id

  return {
    malformedEvent,
    missingMetadataEvent,
  }
}

const filterDataset = createFilterDataset()
const alignmentDataset = createAlignmentDataset()
const completionDataset = createCompletionDataset()
const bulkDataset = createBulkDataset()
const edgeCaseDataset = createEdgeCaseDataset()
const errorDataset = createErrorDataset()

const statisticsEvents: CalendarEvent[] = [
  buildGenericTaskEventTemplate({
    id: 'evt-stats-today',
    title: 'Mansione odierna',
    start: new Date(BASE_DATES.todayMorning),
    sourceId: 'task-stats-today',
    metadata: {
      task_id: 'task-stats-today',
      department_id: BASE_CONTEXT.departments.kitchen.id,
    },
  }),
  buildGenericTaskEventTemplate({
    id: 'evt-stats-completed',
    title: 'Mansione completata',
    status: 'completed',
    start: new Date(BASE_DATES.yesterdayMorning),
    sourceId: 'task-stats-completed',
    metadata: {
      task_id: 'task-stats-completed',
      department_id: BASE_CONTEXT.departments.bar.id,
    },
  }),
  buildGenericTaskEventTemplate({
    id: 'evt-stats-overdue',
    title: 'Mansione in ritardo',
    status: 'overdue',
    start: new Date(BASE_DATES.yesterdayMorning),
    sourceId: 'task-stats-overdue',
    metadata: {
      task_id: 'task-stats-overdue',
      department_id: BASE_CONTEXT.departments.storage.id,
    },
  }),
  buildGenericTaskEventTemplate({
    id: 'evt-stats-next-week',
    title: 'Mansione futura',
    start: new Date(BASE_DATES.nextWeek),
    sourceId: 'task-stats-next-week',
    metadata: {
      task_id: 'task-stats-next-week',
      department_id: BASE_CONTEXT.departments.bar.id,
    },
  }),
  buildMaintenanceEventTemplate({
    id: 'evt-stats-maintenance',
    title: 'Manutenzione programmata',
    start: new Date(BASE_DATES.todayMorning),
    sourceId: 'maintenance-stats',
    metadata: {
      maintenance_id: 'maintenance-stats',
      department_id: BASE_CONTEXT.departments.storage.id,
    },
  }),
  buildProductExpiryEventTemplate({
    id: 'evt-stats-product',
    title: 'Prodotto in scadenza',
    start: new Date(BASE_DATES.tomorrowMorning),
    sourceId: 'product-stats',
    metadata: {
      product_id: 'product-stats',
      department_id: BASE_CONTEXT.departments.kitchen.id,
    },
  }),
]

const breakdownEvents: CalendarEvent[] = [
  ...filterDataset.events,
  buildGenericTaskEventTemplate({
    id: 'evt-breakdown-critical',
    title: 'Task critico',
    status: 'pending',
    start: new Date(BASE_DATES.todayMorning),
    priority: 'critical',
    sourceId: 'task-breakdown-critical',
    metadata: {
      task_id: 'task-breakdown-critical',
      department_id: BASE_CONTEXT.departments.kitchen.id,
    },
  }),
  buildMaintenanceEventTemplate({
    id: 'evt-breakdown-maintenance-high',
    title: 'Manutenzione urgente',
    status: 'overdue',
    start: new Date(BASE_DATES.yesterdayMorning),
    priority: 'high',
    sourceId: 'maintenance-breakdown-high',
    metadata: {
      maintenance_id: 'maintenance-breakdown-high',
      department_id: BASE_CONTEXT.departments.bar.id,
    },
  }),
]

const newGenericTaskPayload = {
  title: 'Nuova mansione di prova',
  type: 'general_task',
  start: BASE_DATES.todayNoon.toISOString(),
  priority: 'medium',
  department_id: BASE_CONTEXT.departments.kitchen.id,
  assigned_to: [BASE_CONTEXT.staff.operator.id],
  metadata: {
    task_id: '__NEW_TASK_ID__',
    department_id: BASE_CONTEXT.departments.kitchen.id,
  },
}

const expectedNewTaskEvent = buildGenericTaskEventTemplate({
  id: 'evt-insert-generic',
  title: newGenericTaskPayload.title,
  start: new Date(BASE_DATES.todayNoon),
  sourceId: newGenericTaskPayload.metadata.task_id,
  metadata: {
    task_id: newGenericTaskPayload.metadata.task_id,
    department_id: newGenericTaskPayload.department_id,
  },
  assigned_to: newGenericTaskPayload.assigned_to,
})

export interface ScenarioFixtures {
  calendarEvents?: CalendarEvent[]
  macroExpectations?: MacroCategoryItemTemplate[]
  supabaseSeeds?: SupabaseSeedTemplate[]
  bulkEvents?: CalendarEvent[]
  newEventPayload?: Record<string, any>
  expectedEventAfterCreate?: CalendarEvent
  errorEvents?: CalendarEvent[]
  responsiveBreakpoints?: number[]
  notes?: string[]
}

export interface ScenarioCaseTemplate {
  id: string
  description: string
  target: {
    components: string[]
    hooks?: string[]
    functions?: string[]
  }
  preconditions?: string[]
  fixtures: ScenarioFixtures
  assertions: string[]
}

export interface ScenarioTemplate {
  code: string
  label: string
  priority: 'alta' | 'media' | 'bassa'
  sharedFixtures?: string[]
  cases: ScenarioCaseTemplate[]
}

export const CALENDAR_ACTIVITY_SCENARIO_TEMPLATES: ScenarioTemplate[] = [
  {
    code: 'A',
    label: 'Filtri Calendario e Modal',
    priority: 'media',
    sharedFixtures: ['filterDataset'],
    cases: [
      {
        id: 'A1',
        description: 'CalendarPage applica correttamente i filtri prima della vista selezionata',
        target: {
          components: ['CalendarPage'],
          hooks: ['useFilteredEvents'],
          functions: ['doesEventPassFilters'],
        },
        preconditions: [
          'vi.useFakeTimers(); vi.setSystemTime(BASE_NOW)',
          'Seed tables Supabase con filterDataset.supabaseSeeds (tasks, task_completions, maintenance_tasks, products)',
        ],
        fixtures: {
          calendarEvents: filterDataset.events,
          macroExpectations: filterDataset.macroExpectations,
          supabaseSeeds: filterDataset.supabaseSeeds,
          notes: [
            'Verificare che displayEvents abbia lunghezza coerente con i filtri applicati',
            'Simulare combinazioni su stati, tipi e reparti per coprire OR/AND dei filtri',
          ],
        },
        assertions: [
          '`displayEvents` include solo eventi che passano `doesEventPassFilters`',
          '`viewBasedEvents` riflette il sottoinsieme filtrato per la vista corrente',
        ],
      },
      {
        id: 'A2',
        description: 'MacroCategoryModal replica la stessa logica di filtraggio del Calendario',
        target: {
          components: ['MacroCategoryModal'],
          hooks: ['useMacroCategoryEvents'],
          functions: ['convertEventToItem'],
        },
        preconditions: [
          'Montare il modal passando gli eventi filtrati dal calendario tramite prop `events`',
        ],
        fixtures: {
          calendarEvents: filterDataset.events,
          macroExpectations: filterDataset.macroExpectations,
          notes: [
            'Usare `filters.statuses`, `filters.types`, `filters.departments` del modal per verificare la corrispondenza',
            'Verificare la disattivazione dei filtri e il reset via pulsante Reset',
          ],
        },
        assertions: [
          'Il conteggio mostrato dal modal corrisponde al numero di eventi filtrati nella stessa categoria',
          'Il toggle dei filtri nel modal non altera lo stato globale del calendario finché non viene confermato',
        ],
      },
      {
        id: 'A3',
        description: 'Sincronizzazione filtri calendario ⇄ modal',
        target: {
          components: ['CalendarPage', 'MacroCategoryModal'],
        },
        preconditions: [
          'Stimolare `setCalendarFilters` e aprire il modal tramite `onEventClick`',
        ],
        fixtures: {
          calendarEvents: filterDataset.events,
          macroExpectations: filterDataset.macroExpectations,
          notes: [
            'Asserire che il modal riceve i filtri correnti attraverso la prop `calendarFilters` passata da Calendar.tsx',
            'Verificare che la chiusura del modal non resetti i filtri del calendario',
          ],
        },
        assertions: [
          '`MacroCategoryModal` riceve gli stessi filtri (deep-equality) di `CalendarPage`',
          'La chiusura del modal lascia invariato lo stato `calendarFilters`',
        ],
      },
    ],
  },
  {
    code: 'B',
    label: 'Inserimento Evento',
    priority: 'media',
    cases: [
      {
        id: 'B1',
        description: 'Creazione di un nuovo evento tramite handleCreateEvent',
        target: {
          components: ['CalendarPage'],
          functions: ['handleCreateEvent'],
        },
        fixtures: {
          newEventPayload: newGenericTaskPayload,
          expectedEventAfterCreate: expectedNewTaskEvent,
          notes: [
            'Mockare `createEvent` o la mutazione collegata per confermare i parametri inviati',
            'Verificare che venga usato un ID coerente (`__NEW_TASK_ID__`) per legare seed Supabase',
          ],
        },
        assertions: [
          '`createEvent` riceve un payload coerente con `newGenericTaskPayload`',
          'Il nuovo evento viene aggiunto allo stato e appare in `displayEvents`',
        ],
      },
      {
        id: 'B2',
        description: 'Render del nuovo evento nel calendario',
        target: {
          components: ['Calendar'],
        },
        fixtures: {
          calendarEvents: [...filterDataset.events, expectedNewTaskEvent],
          notes: [
            'Verificare che FullCalendar mostri il nuovo evento nel giorno corretto',
            'Controllare la presenza del titolo e della classe di priorità',
          ],
        },
        assertions: [
          "Il nuovo evento è visibile nel DOM con titolo 'Nuova mansione di prova'",
          'Il click sul nuovo evento attiva `onEventClick` con metadata coerenti',
        ],
      },
      {
        id: 'B3',
        description: 'Visibilità dell\'evento appena creato nel MacroCategoryModal',
        target: {
          components: ['MacroCategoryModal'],
        },
        fixtures: {
          calendarEvents: [expectedNewTaskEvent],
          macroExpectations: [buildMacroCategoryExpectation(expectedNewTaskEvent)],
          notes: [
            'Aprire il modal simulando la stessa giornata del nuovo evento',
            'Verificare lo stato iniziale (pending) e i pulsanti di completamento',
          ],
        },
        assertions: [
          'Il nuovo evento appare nell\'elenco attivo del modal',
          'Il completamento dal modal aggiorna lo stato a completed e fa invalidate delle query',
        ],
      },
    ],
  },
  {
    code: 'C',
    label: 'Statistiche Count',
    priority: 'media',
    cases: [
      {
        id: 'C1',
        description: 'Statistiche aggiornate in base alla vista del calendario',
        target: {
          components: ['CalendarPage'],
          hooks: ['useCalendarAlerts'],
        },
        preconditions: ['Fissare l\'orologio con BASE_NOW per conteggi deterministici'],
        fixtures: {
          calendarEvents: statisticsEvents,
          notes: [
            'Simulare il cambio vista (month/week/day) e verificare il ricalcolo di metriche',
            'Controllare i contatori totali, pending, completed, overdue',
          ],
        },
        assertions: [
          'I contatori nel pannello statistiche riflettono il sottoinsieme di eventi della vista corrente',
          'Gli alert critici derivano solo dagli eventi entro 72h o overdue',
        ],
      },
      {
        id: 'C2',
        description: 'Accuratezza dei contatori per tipologia di evento',
        target: {
          components: ['CalendarPage'],
        },
        fixtures: {
          calendarEvents: statisticsEvents,
          notes: [
            'Verificare che il breakdown per tipo (mansioni, manutenzioni, scadenze) corrisponda al dataset',
          ],
        },
        assertions: [
          'La sezione "Totale per tipologia" mostra i valori attesi per general_task, maintenance, product_expiry',
          'Le percentuali di completamento e overdue sono calcolate sulla base del totale corrente',
        ],
      },
    ],
  },
  {
    code: 'D',
    label: 'Breakdown Tipologie e Urgenti',
    priority: 'media',
    cases: [
      {
        id: 'D1',
        description: 'Breakdown tipologie correttamente aggregato',
        target: {
          components: ['CalendarPage'],
        },
        fixtures: {
          calendarEvents: breakdownEvents,
          notes: [
            'Verificare la corrispondenza dei badge per categoria con il dataset',
          ],
        },
        assertions: [
          'Ogni categoria mostra il numero di eventi corrispondenti',
          'Gli eventi con priorità critical/high sono evidenziati con badge urgenti',
        ],
      },
      {
        id: 'D2',
        description: 'Categorizzazione eventi urgenti',
        target: {
          components: ['CalendarPage'],
        },
        fixtures: {
          calendarEvents: breakdownEvents,
          notes: [
            'Verificare la presenza del widget "Eventi urgenti" con eventi high/critical',
          ],
        },
        assertions: [
          'Gli eventi high/critical sono elencati nella card dedicata agli urgenti',
          'Il click su un evento urgente richiama `onEventClick` con il tipo corretto',
        ],
      },
    ],
  },
  {
    code: 'E',
    label: 'Allineamento Eventi Calendar ⇄ Modal',
    priority: 'alta',
    sharedFixtures: ['alignmentDataset'],
    cases: [
      {
        id: 'E1',
        description: 'Gli eventi in modal corrispondono a quelli sul calendario per giorno/tipo',
        target: {
          components: ['CalendarPage', 'Calendar', 'MacroCategoryModal'],
        },
        fixtures: {
          calendarEvents: alignmentDataset.events,
          macroExpectations: alignmentDataset.macroExpectations,
          notes: [
            'Simulare il click su ogni evento e verificare che il modal riceva la stessa lista filtrata',
          ],
        },
        assertions: [
          '`setSelectedMacroCategory` riceve esattamente gli eventi filtrati per tipo e data',
          'Il modal mostra lo stesso numero e ordine del calendario',
        ],
      },
      {
        id: 'E2',
        description: 'Il click su evento apre il modal corretto con gli eventi del giorno',
        target: {
          components: ['CalendarPage'],
          functions: ['onEventClick'],
        },
        fixtures: {
          calendarEvents: alignmentDataset.events,
          notes: [
            'Verificare i tre casi: generic_task, maintenance, product_expiry',
          ],
        },
        assertions: [
          'Ogni tipologia mappa alla macro category corretta',
          'Gli eventi passati al modal sono già processati (non valori RAW)',
        ],
      },
    ],
  },
  {
    code: 'F',
    label: 'Completamento Evento nel Modal',
    priority: 'alta',
    sharedFixtures: ['completionDataset'],
    cases: [
      {
        id: 'F1',
        description: 'Completamento mansione dal modal aggiorna stato e dati',
        target: {
          components: ['MacroCategoryModal'],
          hooks: ['useGenericTasks'],
        },
        fixtures: {
          calendarEvents: completionDataset.events,
          macroExpectations: completionDataset.macroExpectations,
          supabaseSeeds: completionDataset.supabaseSeeds,
          notes: [
            'Mockare `completeTask` per asserire i parametri (taskId, notes)',
            'Verificare l\'invalidazione delle query e il refreshKey',
          ],
        },
        assertions: [
          '`completeTask` viene invocato con taskId corretto',
          'Dopo onSuccess l\'item viene spostato tra i completati nel modal',
        ],
      },
      {
        id: 'F2',
        description: 'Aggiornamento stato evento dopo completamento',
        target: {
          components: ['CalendarPage'],
        },
        fixtures: {
          calendarEvents: completionDataset.events,
          notes: [
            'Verificare che l\'evento aggiornato cambi status e colori nel calendario',
          ],
        },
        assertions: [
          'L\'evento completato mostra status `completed` e colori da `STATUS_COLORS.completed`',
          'Gli alert critici diminuiscono dopo il completamento',
        ],
      },
    ],
  },
  {
    code: 'G',
    label: 'Visualizzazione Tipi Evento nel Modal',
    priority: 'media',
    cases: [
      {
        id: 'G1',
        description: 'Il modal visualizza correttamente icone/label per ogni tipo evento',
        target: {
          components: ['MacroCategoryModal'],
        },
        fixtures: {
          calendarEvents: alignmentDataset.events,
          notes: [
            'Verificare le intestazioni e le icone per maintenance, generic_tasks, product_expiry',
          ],
        },
        assertions: [
          'Ogni card mostra icona, colore e copy coerenti con la macro categoria',
        ],
      },
      {
        id: 'G2',
        description: 'Categorizzazione per tipo accurata nel modal',
        target: {
          components: ['MacroCategoryModal'],
        },
        fixtures: {
          calendarEvents: alignmentDataset.events,
          notes: [
            'Verificare che i filtri di tipo del modal agiscano su EventType (generic_task, maintenance, product_expiry)',
          ],
        },
        assertions: [
          'Il filtro per tipo riduce la lista agli item della macro categoria selezionata',
        ],
      },
    ],
  },
  {
    code: 'L',
    label: 'Logica onEventClick',
    priority: 'alta',
    cases: [
      {
        id: 'L1',
        description: 'Click su evento generic_task apre macro categoria corretta',
        target: {
          components: ['CalendarPage'],
          functions: ['onEventClick'],
        },
        fixtures: {
          calendarEvents: [alignmentDataset.events[0]],
        },
        assertions: [
          'La macro categoria selezionata è `generic_tasks` e contiene solo eventi generic_task del giorno',
        ],
      },
      {
        id: 'L2',
        description: 'Click su evento maintenance apre macro categoria corretta',
        target: {
          components: ['CalendarPage'],
          functions: ['onEventClick'],
        },
        fixtures: {
          calendarEvents: [alignmentDataset.events[1]],
        },
        assertions: ['La macro categoria selezionata è `maintenance`'],
      },
      {
        id: 'L3',
        description: 'Click su evento product_expiry apre macro categoria corretta',
        target: {
          components: ['CalendarPage'],
          functions: ['onEventClick'],
        },
        fixtures: {
          calendarEvents: [alignmentDataset.events[2]],
        },
        assertions: ['La macro categoria selezionata è `product_expiry`'],
      },
      {
        id: 'L4',
        description: 'Gestione evento sconosciuto',
        target: {
          components: ['CalendarPage'],
          functions: ['onEventClick'],
        },
        fixtures: {
          calendarEvents: [alignmentDataset.unknownEvent],
          notes: ['Verificare che il fallback non interrompa il flusso principale'],
        },
        assertions: [
          'Se la macro categoria non è riconosciuta, `setSelectedMacroCategory` non viene invocato',
          'Viene mostrato un log/errore controllato',
        ],
      },
    ],
  },
  {
    code: 'M',
    label: 'Sincronizzazione Eventi',
    priority: 'alta',
    cases: [
      {
        id: 'M1',
        description: 'Gli eventi passati dal calendario al modal sono identici',
        target: {
          components: ['Calendar', 'MacroCategoryModal'],
        },
        fixtures: {
          calendarEvents: alignmentDataset.events,
          macroExpectations: alignmentDataset.macroExpectations,
        },
        assertions: [
          'Gli eventi passati tramite `onMacroCategorySelect` coincidono (deep-equal) con quelli ricevuti dal modal',
        ],
      },
      {
        id: 'M2',
        description: 'Funzione convertEventToItem produce item coerenti',
        target: {
          components: ['MacroCategoryModal'],
          functions: ['convertEventToItem'],
        },
        fixtures: {
          calendarEvents: completionDataset.events,
          macroExpectations: completionDataset.macroExpectations,
        },
        assertions: [
          'Ogni evento produce un MacroCategoryItem con type, status e department coerenti',
        ],
      },
      {
        id: 'M3',
        description: 'Coerenza tra eventi RAW e processati',
        target: {
          components: ['CalendarPage'],
        },
        fixtures: {
          calendarEvents: completionDataset.events,
          notes: [
            'Confrontare `aggregatedEvents` con eventuali fetch RAW per garantire la sincronizzazione',
          ],
        },
        assertions: [
          'Non esistono differenze tra dataset RAW e processato nel modal',
        ],
      },
    ],
  },
  {
    code: 'N',
    label: 'Filtri MacroCategoryModal',
    priority: 'alta',
    cases: [
      {
        id: 'N1',
        description: 'Toggle sezione filtri',
        target: {
          components: ['MacroCategoryModal'],
        },
        fixtures: {
          calendarEvents: filterDataset.events,
          notes: ['Verificare l\'apertura/chiusura della sezione filtri e lo stato persistente'],
        },
        assertions: [
          'Il pulsante "Filtri" apre e chiude la sezione senza perdere la selezione corrente',
        ],
      },
      {
        id: 'N2',
        description: 'Filtri per stato funzionano (pending, completed, overdue)',
        target: {
          components: ['MacroCategoryModal'],
        },
        fixtures: {
          calendarEvents: completionDataset.events,
          notes: ['Applicare ciascun filtro di stato e verificare il risultato'],
        },
        assertions: [
          'Ogni filtro di stato mostra solo gli item corrispondenti',
        ],
      },
      {
        id: 'N3',
        description: 'Filtri per tipo funzionano',
        target: {
          components: ['MacroCategoryModal'],
        },
        fixtures: {
          calendarEvents: alignmentDataset.events,
        },
        assertions: [
          'Il filtro per tipo riduce la lista agli item della macro categoria selezionata',
        ],
      },
      {
        id: 'N4',
        description: 'Filtri per reparto funzionano',
        target: {
          components: ['MacroCategoryModal'],
        },
        fixtures: {
          calendarEvents: filterDataset.events,
        },
        assertions: [
          'Selezionando un reparto si ottengono solo gli item con departmentId corrispondente',
        ],
      },
      {
        id: 'N5',
        description: 'Filtri multipli funzionano con logica AND',
        target: {
          components: ['MacroCategoryModal'],
        },
        fixtures: {
          calendarEvents: filterDataset.events,
          notes: ['Combinare filtri su stato, tipo e reparto e verificare la logica AND'],
        },
        assertions: [
          'Gli item mostrati soddisfano tutte le condizioni attive',
        ],
      },
    ],
  },
  {
    code: 'O',
    label: 'Performance e Rendering',
    priority: 'bassa',
    cases: [
      {
        id: 'O1',
        description: 'Apertura modal <500ms con dataset medio',
        target: {
          components: ['MacroCategoryModal'],
        },
        fixtures: {
          calendarEvents: alignmentDataset.events,
          notes: ['Misurare l\'apertura del modal con performance.now() o equivalente'],
        },
        assertions: [
          'Il tempo di apertura medio è inferiore a 500ms',
        ],
      },
      {
        id: 'O2',
        description: 'Caricamento calendario <2s con dataset da 120 eventi',
        target: {
          components: ['Calendar'],
        },
        fixtures: {
          bulkEvents: bulkDataset.events,
        },
        assertions: [
          'Il render iniziale del calendario con 120 eventi richiede meno di 2 secondi',
        ],
      },
      {
        id: 'O3',
        description: 'Assenza di memory leak durante l\'uso',
        target: {
          components: ['CalendarPage'],
        },
        fixtures: {
          bulkEvents: bulkDataset.events,
          notes: [
            'Eseguire più aperture/chiusure del modal e monitorare le allocazioni',
          ],
        },
        assertions: [
          'Non si osservano incrementi di memoria persistenti dopo più interazioni',
        ],
      },
    ],
  },
  {
    code: 'P',
    label: 'Error Handling',
    priority: 'bassa',
    cases: [
      {
        id: 'P1',
        description: 'Gestione errori rete (Supabase)',
        target: {
          components: ['CalendarPage'],
        },
        fixtures: {
          notes: [
            'Stubbare le chiamate Supabase per restituire errori e verificare toast/log',
          ],
        },
        assertions: [
          'Un errore di rete mostra un toast informativo senza rompere la UI',
        ],
      },
      {
        id: 'P2',
        description: 'Eventi malformati non causano crash',
        target: {
          components: ['CalendarPage'],
        },
        fixtures: {
          errorEvents: [errorDataset.malformedEvent, errorDataset.missingMetadataEvent],
        },
        assertions: [
          'Gli eventi malformati vengono scartati con warn in console e senza crash',
        ],
      },
      {
        id: 'P3',
        description: 'Filtri invalidi gestiti correttamente',
        target: {
          components: ['CalendarPage'],
        },
        fixtures: {
          calendarEvents: filterDataset.events,
          notes: [
            'Forzare uno stato filtro invalido (es. department_id inesistente) e verificare fallback',
          ],
        },
        assertions: [
          'Filtri invalidi risultano in lista vuota senza errori non gestiti',
        ],
      },
    ],
  },
  {
    code: 'Q',
    label: 'Accessibilità',
    priority: 'bassa',
    cases: [
      {
        id: 'Q1',
        description: 'Modal accessibile da tastiera',
        target: {
          components: ['MacroCategoryModal'],
        },
        fixtures: {
          calendarEvents: alignmentDataset.events,
        },
        assertions: [
          'Si può aprire, navigare e chiudere il modal solo con la tastiera',
        ],
      },
      {
        id: 'Q2',
        description: 'Filtri accessibili via tastiera',
        target: {
          components: ['MacroCategoryModal', 'NewCalendarFilters'],
        },
        fixtures: {
          calendarEvents: filterDataset.events,
        },
        assertions: [
          'Tutti i controlli filtro sono focusable e annunciati dagli screen reader',
        ],
      },
      {
        id: 'Q3',
        description: 'Screen reader leggono il contenuto',
        target: {
          components: ['MacroCategoryModal'],
        },
        fixtures: {
          calendarEvents: completionDataset.events,
        },
        assertions: [
          'Gli elementi essenziali hanno aria-label/role coerenti',
        ],
      },
    ],
  },
  {
    code: 'R',
    label: 'Responsive Design',
    priority: 'bassa',
    cases: [
      {
        id: 'R1',
        description: 'Modal su dispositivi mobili',
        target: {
          components: ['MacroCategoryModal'],
        },
        fixtures: {
          calendarEvents: alignmentDataset.events,
          responsiveBreakpoints: [375, 768],
        },
        assertions: [
          'Il modal si adatta correttamente alle larghezze 375px e 768px',
        ],
      },
      {
        id: 'R2',
        description: 'Filtri usabili su schermi piccoli',
        target: {
          components: ['NewCalendarFilters'],
        },
        fixtures: {
          calendarEvents: filterDataset.events,
          responsiveBreakpoints: [414],
        },
        assertions: [
          'I filtri restano accessibili e scrollabili su mobile',
        ],
      },
      {
        id: 'R3',
        description: 'Calendario responsive',
        target: {
          components: ['Calendar'],
        },
        fixtures: {
          bulkEvents: filterDataset.events,
          responsiveBreakpoints: [1024, 768, 480],
        },
        assertions: [
          'FullCalendar mantiene leggibilità e interazioni su tutte le breakpoint simulate',
        ],
      },
    ],
  },
  {
    code: 'S',
    label: 'Test Integrazione',
    priority: 'bassa',
    cases: [
      {
        id: 'S1',
        description: 'Verifica che le modifiche non rompano altre funzionalità',
        target: {
          components: ['CalendarPage'],
        },
        fixtures: {
          calendarEvents: [...filterDataset.events, ...completionDataset.events],
        },
        assertions: [
          'Le componenti critiche (alert, statistiche, calendario) funzionano con dataset combinato',
        ],
      },
      {
        id: 'S2',
        description: 'Integrazione con Supabase',
        target: {
          components: ['CalendarPage'],
        },
        fixtures: {
          supabaseSeeds: [
            ...filterDataset.supabaseSeeds,
            ...completionDataset.supabaseSeeds,
          ],
        },
        assertions: [
          'Le query Supabase utilizzano companyId/staffId coerenti con BASE_CONTEXT',
        ],
      },
      {
        id: 'S3',
        description: 'Autenticazione coerente durante l\'uso del calendario',
        target: {
          components: ['CalendarPage'],
          hooks: ['useAuth'],
        },
        fixtures: {
          notes: [
            'Simulare utenti con ruoli differenti (admin, responsabile, dipendente) per verificare autorizzazioni',
          ],
        },
        assertions: [
          'Gli utenti con ruoli diversi vedono dataset differenti secondo `useFilteredEvents`',
        ],
      },
    ],
  },
  {
    code: 'T',
    label: 'Edge Cases',
    priority: 'bassa',
    cases: [
      {
        id: 'T1',
        description: 'Calendario vuoto',
        target: {
          components: ['CalendarPage'],
        },
        fixtures: {
          calendarEvents: edgeCaseDataset.emptyCalendarEvents,
        },
        assertions: [
          'La UI mostra stati vuoti senza errori',
        ],
      },
      {
        id: 'T2',
        description: 'Molti eventi (100+)',
        target: {
          components: ['Calendar'],
        },
        fixtures: {
          bulkEvents: bulkDataset.events,
        },
        assertions: [
          'La UI resta reattiva con più di 100 eventi',
        ],
      },
      {
        id: 'T3',
        description: 'Eventi sovrapposti',
        target: {
          components: ['Calendar', 'MacroCategoryModal'],
        },
        fixtures: {
          calendarEvents: edgeCaseDataset.overlappingEvents,
        },
        assertions: [
          'Gli eventi sovrapposti sono visibili e selezionabili singolarmente',
        ],
      },
      {
        id: 'T4',
        description: 'Date limite (inizio/fine anno)',
        target: {
          components: ['CalendarPage'],
        },
        fixtures: {
          calendarEvents: edgeCaseDataset.boundaryEvents,
        },
        assertions: [
          'L\'anno fiscale configurato gestisce correttamente eventi al 1 gennaio e 31 dicembre',
        ],
      },
    ],
  },
]
