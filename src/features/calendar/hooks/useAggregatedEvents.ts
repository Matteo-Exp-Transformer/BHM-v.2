import { useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useMaintenanceTasks } from '@/features/conservation/hooks/useMaintenanceTasks'
import { useConservationPoints } from '@/features/conservation/hooks/useConservationPoints'
import { useStaff } from '@/features/management/hooks/useStaff'
import { useProducts } from '@/features/inventory/hooks/useProducts'
import type { CalendarEvent } from '@/types/calendar'
import type { MaintenanceTask } from '@/types/conservation'
import type { Product } from '@/types/inventory'
import type { StaffMember } from '@/features/management/hooks/useStaff'
import { getEventColors } from '../utils/eventTransform'
import { generateHaccpDeadlineEvents } from '../utils/haccpDeadlineGenerator'
import { generateTemperatureCheckEvents } from '../utils/temperatureCheckGenerator'

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

  const isLoading =
    maintenanceLoading || staffLoading || productsLoading || pointsLoading

  const maintenanceEvents = useMemo(() => {
    if (!maintenanceTasks || maintenanceTasks.length === 0) return []

    return maintenanceTasks.map(task =>
      convertMaintenanceTaskToEvent(task, companyId || '', user?.id || '')
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

  const allEvents = useMemo(() => {
    return [
      ...maintenanceEvents,
      ...haccpExpiryEvents,
      ...productExpiryEvents,
      ...haccpDeadlineEvents,
      ...temperatureEvents,
    ]
  }, [
    maintenanceEvents,
    haccpExpiryEvents,
    productExpiryEvents,
    haccpDeadlineEvents,
    temperatureEvents,
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
      custom: 0,
    },
  }
}

function convertMaintenanceTaskToEvent(
  task: MaintenanceTask,
  companyId: string,
  userId: string
): CalendarEvent {
  const startDate = new Date(task.next_due)
  const endDate = new Date(
    startDate.getTime() + (task.estimated_duration || 60) * 60 * 1000
  )

  const status =
    task.status === 'completed'
      ? 'completed'
      : startDate < new Date()
        ? 'overdue'
        : 'pending'

  const colors = getEventColors('maintenance', status, task.priority || 'medium')

  return {
    id: `maintenance-${task.id}`,
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
    assigned_to: task.assigned_to ? [task.assigned_to] : [],
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
      status: status as 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'cancelled',
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
      status: status as 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'cancelled',
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
    daysUntilExpiry <= 1
      ? 'critical'
      : daysUntilExpiry <= 3
        ? 'high'
        : 'medium'

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
    assigned_to: [],
    department_id: product.department_id,
    conservation_point_id: product.conservation_point_id,
    recurring: false,
    backgroundColor: colors.backgroundColor,
    borderColor: colors.borderColor,
    textColor: colors.textColor,
    metadata: {
      product_id: product.id,
      conservation_point_id: product.conservation_point_id,
      notes: `Scadenza prodotto: ${product.name}`,
    },
    extendedProps: {
      status: status as 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'cancelled',
      priority,
      metadata: {
        productName: product.name,
        quantity: product.quantity,
        unit: product.unit,
      },
    },
    created_at: product.created_at,
    updated_at: product.updated_at,
    created_by: userId,
    company_id: companyId,
  }
}
