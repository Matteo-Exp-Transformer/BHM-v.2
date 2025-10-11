import { useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useMaintenanceTasks } from '@/features/conservation/hooks/useMaintenanceTasks'
import { useConservationPoints } from '@/features/conservation/hooks/useConservationPoints'
import { useStaff } from '@/features/management/hooks/useStaff'
import { useProducts } from '@/features/inventory/hooks/useProducts'
import { useGenericTasks, type GenericTask } from './useGenericTasks'
import type { CalendarEvent } from '@/types/calendar'
import type { MaintenanceTask } from '@/types/conservation'
import type { Product } from '@/types/inventory'
import type { StaffMember } from '@/features/management/hooks/useStaff'
import { getEventColors } from '../utils/eventTransform'
import { generateHaccpDeadlineEvents } from '../utils/haccpDeadlineGenerator'
import { generateTemperatureCheckEvents } from '../utils/temperatureCheckGenerator'
import { addDays, addWeeks, addMonths, startOfDay, endOfDay } from 'date-fns'

interface AggregatedEventsResult {
  events: CalendarEvent[]
  isLoading: boolean
  error: Error | null
  sources: {
    maintenance: number
    haccpExpiry: number
    productExpiry: number
    haccpDeadlines: number
    temperatureChecks: number
    genericTasks: number
    custom: number
  }
}

export function useAggregatedEvents(): AggregatedEventsResult {
  const { user, companyId } = useAuth()
  const { maintenanceTasks, isLoading: maintenanceLoading } =
    useMaintenanceTasks()
  const { conservationPoints, isLoading: pointsLoading } =
    useConservationPoints()
  const { staff, isLoading: staffLoading } = useStaff()
  const { products, isLoading: productsLoading } = useProducts()
  const { tasks: genericTasks, isLoading: genericTasksLoading } = useGenericTasks()

  const isLoading =
    maintenanceLoading || staffLoading || productsLoading || pointsLoading || genericTasksLoading

  const maintenanceEvents = useMemo(() => {
    if (!maintenanceTasks || maintenanceTasks.length === 0) return []

    // ✅ Espandi attività ricorrenti per mostrare occorrenze multiple
    return maintenanceTasks.flatMap(task =>
      expandRecurringTask(task, companyId || '', user?.id || '', 'maintenance')
    )
  }, [maintenanceTasks, companyId, user?.id])

  const haccpExpiryEvents = useMemo(() => {
    if (!staff || staff.length === 0) return []

    return staff
      .filter(
        member =>
          member.haccp_certification &&
          typeof member.haccp_certification === 'object' &&
          'expiry_date' in member.haccp_certification
      )
      .map(member =>
        convertHaccpExpiryToEvent(member, companyId || '', user?.id || '')
      )
  }, [staff, companyId, user?.id])

  const productExpiryEvents = useMemo(() => {
    if (!products || products.length === 0) return []

    return products
      .filter(
        product =>
          product.expiry_date &&
          product.status === 'active' &&
          new Date(product.expiry_date) >
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      )
      .map(product =>
        convertProductExpiryToEvent(product, companyId || '', user?.id || '')
      )
  }, [products, companyId, user?.id])

  const haccpDeadlineEvents = useMemo(() => {
    if (!staff || staff.length === 0) return []
    return generateHaccpDeadlineEvents(staff, companyId || '', user?.id || '')
  }, [staff, companyId, user?.id])

  const temperatureEvents = useMemo(() => {
    if (!conservationPoints || conservationPoints.length === 0) return []
    return generateTemperatureCheckEvents(
      conservationPoints,
      companyId || '',
      user?.id || ''
    )
  }, [conservationPoints, companyId, user?.id])

  const genericTaskEvents = useMemo(() => {
    console.log('🔍 DEBUG: Generic tasks loaded:', genericTasks?.length || 0)
    
    if (!genericTasks || genericTasks.length === 0) {
      console.log('❌ DEBUG: Nessun task generico trovato')
      return []
    }
    
    // Debug: mostra task giornalieri
    const dailyTasks = genericTasks.filter(task => task.frequency === 'daily')
    console.log('📅 DEBUG: Task giornalieri trovati:', dailyTasks.length)
    dailyTasks.forEach(task => {
      console.log(`   - ${task.name} (${task.frequency}) - Created: ${task.created_at}`)
    })
    
    // ✅ Espandi attività ricorrenti per mostrare occorrenze multiple
    const expandedEvents = genericTasks.flatMap(task =>
      expandRecurringTask(task, companyId || '', user?.id || '', 'generic')
    )
    
    console.log('📊 DEBUG: Eventi generati da task:', expandedEvents.length)
    
    return expandedEvents
  }, [genericTasks, companyId, user?.id])

  const allEvents = useMemo(() => {
    return [
      ...maintenanceEvents,
      ...haccpExpiryEvents,
      ...productExpiryEvents,
      ...haccpDeadlineEvents,
      ...temperatureEvents,
      ...genericTaskEvents,
    ]
  }, [
    maintenanceEvents,
    haccpExpiryEvents,
    productExpiryEvents,
    haccpDeadlineEvents,
    temperatureEvents,
    genericTaskEvents,
  ])

  return {
    events: allEvents,
    isLoading,
    error: null,
    sources: {
      maintenance: maintenanceEvents.length,
      haccpExpiry: haccpExpiryEvents.length,
      productExpiry: productExpiryEvents.length,
      haccpDeadlines: haccpDeadlineEvents.length,
      temperatureChecks: temperatureEvents.length,
      genericTasks: genericTaskEvents.length,
      custom: 0,
    },
  }
}

/**
 * Espande una task ricorrente in multiple occorrenze
 * Per frequenza "daily" genera un evento per ogni giorno dalla data di creazione
 */
function expandRecurringTask(
  task: MaintenanceTask | GenericTask,
  companyId: string,
  userId: string,
  type: 'maintenance' | 'generic'
): CalendarEvent[] {
  const frequency = task.frequency
  
  console.log(`🔄 DEBUG: Espansione task ${task.name} (${frequency}) - Type: ${type}`)
  
  // Se non è una frequenza ricorrente, restituisci un solo evento
  if (frequency === 'as_needed' || frequency === 'custom') {
    console.log(`   → Task non ricorrente, singolo evento`)
    return type === 'maintenance'
      ? [convertMaintenanceTaskToEvent(task as MaintenanceTask, companyId, userId)]
      : [convertGenericTaskToEvent(task as GenericTask, companyId, userId)]
  }
  
  // Data di inizio: usa created_at come data di creazione della task
  const startDate = startOfDay(new Date(task.created_at))
  
  // Data di fine: mostra eventi fino a 90 giorni nel futuro
  const endDate = endOfDay(addDays(new Date(), 90))
  
  const events: CalendarEvent[] = []
  let currentDate = startDate
  let eventCount = 0
  
  console.log(`   → Inizio: ${startDate.toISOString().split('T')[0]}, Fine: ${endDate.toISOString().split('T')[0]}`)
  
  // Genera eventi ricorrenti in base alla frequenza
  while (currentDate <= endDate) {
    // Crea l'evento per questa data
    const event = type === 'maintenance'
      ? convertMaintenanceTaskToEvent(task as MaintenanceTask, companyId, userId, currentDate)
      : convertGenericTaskToEvent(task as GenericTask, companyId, userId, currentDate)
    
    events.push(event)
    eventCount++
    
    // Calcola la prossima occorrenza in base alla frequenza
    switch (frequency) {
      case 'daily':
        currentDate = addDays(currentDate, 1)
        break
      case 'weekly':
        currentDate = addWeeks(currentDate, 1)
        break
      case 'monthly':
        currentDate = addMonths(currentDate, 1)
        break
      case 'quarterly':
        currentDate = addMonths(currentDate, 3)
        break
      case 'biannually':
        currentDate = addMonths(currentDate, 6)
        break
      case 'annually':
      case 'annual':
        currentDate = addMonths(currentDate, 12)
        break
      default:
        // Per frequenze sconosciute, esci dal loop
        currentDate = addDays(endDate, 1)
    }
  }
  
  console.log(`   → Generati ${eventCount} eventi ricorrenti per task "${task.name}"`)
  return events
}

function convertMaintenanceTaskToEvent(
  task: MaintenanceTask,
  companyId: string,
  userId: string,
  occurrenceDate?: Date
): CalendarEvent {
  // Usa occurrenceDate se fornito, altrimenti usa next_due
  const startDate = occurrenceDate || new Date(task.next_due)
  const endDate = new Date(
    startDate.getTime() + (task.estimated_duration || 60) * 60 * 1000
  )

  const status =
    task.status === 'completed'
      ? 'completed'
      : startDate < new Date()
        ? 'overdue'
        : 'pending'

  const colors = getEventColors(
    'maintenance',
    status,
    task.priority || 'medium'
  )

  // ✅ ID univoco per ogni occorrenza (include data)
  const eventId = occurrenceDate 
    ? `maintenance-${task.id}-${startDate.toISOString().split('T')[0]}`
    : `maintenance-${task.id}`
  
  return {
    id: eventId,
    title: task.title || 'Manutenzione',
    description: task.description,
    start: startDate,
    end: endDate,
    allDay: false,
    type: 'maintenance',
    status,
    priority: task.priority || 'medium',
    source: 'maintenance',
    sourceId: task.id,
    assigned_to: task.assigned_to_staff_id ? [task.assigned_to_staff_id] : [],
    conservation_point_id: task.conservation_point_id,
    recurring: false,
    backgroundColor: colors.backgroundColor,
    borderColor: colors.borderColor,
    textColor: colors.textColor,
    metadata: {
      maintenance_id: task.id,
      conservation_point_id: task.conservation_point_id,
      assigned_to_staff_id: (task as any).assigned_to_staff_id,
      assigned_to_role: (task as any).assigned_to_role,
      assigned_to_category: (task as any).assigned_to_category,
      notes: task.description,
    },
    extendedProps: {
      status: status as
        | 'scheduled'
        | 'in_progress'
        | 'completed'
        | 'overdue'
        | 'cancelled',
      priority: task.priority || 'medium',
      assignedTo: task.assigned_to ? [task.assigned_to] : [],
      metadata: {
        id: task.id,
        notes: task.description,
        estimatedDuration: task.estimated_duration,
      },
    },
    created_at: task.created_at,
    updated_at: task.updated_at,
    created_by: userId,
    company_id: companyId,
  }
}

function convertHaccpExpiryToEvent(
  staffMember: StaffMember,
  companyId: string,
  userId: string
): CalendarEvent {
  const cert = staffMember.haccp_certification as {
    expiry_date: string
    level?: string
  }
  const expiryDate = new Date(cert.expiry_date)
  const now = new Date()
  const daysUntilExpiry = Math.ceil(
    (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )

  const priority: CalendarEvent['priority'] =
    daysUntilExpiry <= 7
      ? 'critical'
      : daysUntilExpiry <= 30
        ? 'high'
        : 'medium'

  const status: CalendarEvent['status'] =
    expiryDate < now ? 'overdue' : 'pending'

  const colors = getEventColors('custom', status, priority)

  return {
    id: `haccp-expiry-${staffMember.id}`,
    title: `Scadenza HACCP - ${staffMember.name}`,
    description: `Certificazione HACCP ${cert.level || ''} in scadenza`,
    start: expiryDate,
    end: expiryDate,
    allDay: true,
    type: 'custom',
    status,
    priority,
    source: 'custom',
    sourceId: staffMember.id,
    assigned_to: [staffMember.id],
    recurring: false,
    backgroundColor: colors.backgroundColor,
    borderColor: colors.borderColor,
    textColor: colors.textColor,
    metadata: {
      staff_id: staffMember.id,
      assigned_to_staff_id: staffMember.id,
      notes: `Scadenza certificazione HACCP - ${staffMember.name}`,
    },
    extendedProps: {
      status: status as
        | 'scheduled'
        | 'in_progress'
        | 'completed'
        | 'overdue'
        | 'cancelled',
      priority,
      assignedTo: [staffMember.id],
      metadata: {
        staffMember: staffMember.name,
        haccpLevel: cert.level,
      },
    },
    created_at: new Date(),
    updated_at: new Date(),
    created_by: userId,
    company_id: companyId,
  }
}

function convertProductExpiryToEvent(
  product: Product,
  companyId: string,
  userId: string
): CalendarEvent {
  const expiryDate = new Date(product.expiry_date!)
  const now = new Date()
  const daysUntilExpiry = Math.ceil(
    (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )

  const priority: CalendarEvent['priority'] =
    daysUntilExpiry <= 1 ? 'critical' : daysUntilExpiry <= 3 ? 'high' : 'medium'

  const status: CalendarEvent['status'] =
    expiryDate < now ? 'overdue' : 'pending'

  const colors = getEventColors('custom', status, priority)

  return {
    id: `product-expiry-${product.id}`,
    title: `Scadenza: ${product.name}`,
    description: `Prodotto in scadenza - ${product.quantity || ''} ${product.unit || ''}`,
    start: expiryDate,
    end: expiryDate,
    allDay: true,
    type: 'custom',
    status,
    priority,
    source: 'custom',
    sourceId: product.id,
    assigned_to: [], // Rimane vuoto per assigned_to
    department_id: product.department_id, // ✅ Reparto del prodotto
    conservation_point_id: product.conservation_point_id,
    recurring: false,
    backgroundColor: colors.backgroundColor,
    borderColor: colors.borderColor,
    textColor: colors.textColor,
    metadata: {
      product_id: product.id,
      conservation_point_id: product.conservation_point_id,
      // ✅ Assegnazione per reparto specifico invece di 'all'
      assigned_to_category: product.department_id
        ? `department:${product.department_id}`
        : 'all',
      notes: `Scadenza prodotto: ${product.name}`,
    },
    extendedProps: {
      status: status as
        | 'scheduled'
        | 'in_progress'
        | 'completed'
        | 'overdue'
        | 'cancelled',
      priority,
      metadata: {
        productName: product.name,
        quantity: product.quantity,
        unit: product.unit,
        departmentId: product.department_id,
      },
    },
    created_at: product.created_at,
    updated_at: product.updated_at,
    created_by: userId,
    company_id: companyId,
  }
}

function convertGenericTaskToEvent(
  task: GenericTask,
  companyId: string,
  userId: string,
  occurrenceDate?: Date
): CalendarEvent {
  // Usa occurrenceDate se fornito, altrimenti usa next_due o data corrente
  const startDate = occurrenceDate || (task.next_due ? new Date(task.next_due) : new Date())
  const endDate = new Date(
    startDate.getTime() + (task.estimated_duration || 60) * 60 * 1000
  )

  const status: CalendarEvent['status'] =
    task.status === 'completed'
      ? 'completed'
      : startDate < new Date()
        ? 'overdue'
        : 'pending'

  const colors = getEventColors(
    'general_task',
    status,
    task.priority || 'medium'
  )

  // ✅ ID univoco per ogni occorrenza (include data)
  const eventId = occurrenceDate 
    ? `generic-task-${task.id}-${startDate.toISOString().split('T')[0]}`
    : `generic-task-${task.id}`

  return {
    id: eventId,
    title: task.name,
    description: task.description,
    start: startDate,
    end: endDate,
    allDay: false,
    type: 'general_task',
    status,
    priority: task.priority || 'medium',
    source: 'general_task',
    sourceId: task.id,
    assigned_to: task.assigned_to_staff_id ? [task.assigned_to_staff_id] : [],
    recurring: task.frequency !== 'as_needed',
    backgroundColor: colors.backgroundColor,
    borderColor: colors.borderColor,
    textColor: colors.textColor,
    metadata: {
      task_id: task.id,
      assigned_to_role: task.assigned_to_role,
      assigned_to_category: task.assigned_to_category,
      assigned_to_staff_id: task.assigned_to_staff_id,
      notes: task.description,
      frequency: task.frequency,
    },
    extendedProps: {
      status: status as
        | 'scheduled'
        | 'in_progress'
        | 'completed'
        | 'overdue'
        | 'cancelled',
      priority: task.priority || 'medium',
      assignedTo: task.assigned_to_staff_id ? [task.assigned_to_staff_id] : [],
      metadata: {
        id: task.id,
        notes: task.description,
        estimatedDuration: task.estimated_duration,
        frequency: task.frequency,
      },
    },
    created_at: task.created_at,
    updated_at: task.updated_at,
    created_by: userId,
    company_id: companyId,
  }
}
