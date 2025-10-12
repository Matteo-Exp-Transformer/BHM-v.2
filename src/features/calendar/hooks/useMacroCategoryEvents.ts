import { useMemo, useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { useMaintenanceTasks } from '@/features/conservation/hooks/useMaintenanceTasks'
import { useProducts } from '@/features/inventory/hooks/useProducts'
import { useGenericTasks, type TaskCompletion } from './useGenericTasks'
import type { MaintenanceTask } from '@/types/conservation'
import type { Product } from '@/types/inventory'
import type { GenericTask } from './useGenericTasks'
import { supabase } from '@/lib/supabase/client'

export type MacroCategory = 'maintenance' | 'generic_tasks' | 'product_expiry'

export interface MacroCategoryEvent {
  date: string
  category: MacroCategory
  count: number
  items: MacroCategoryItem[]
}

export interface MacroCategoryItem {
  id: string
  title: string
  description?: string
  dueDate: Date
  status: 'pending' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignedTo?: string
  assignedToRole?: string
  assignedToCategory?: string
  assignedToStaffId?: string
  frequency?: string
  metadata: {
    category: MacroCategory
    sourceId: string
    notes?: string
    [key: string]: any
  }
}

interface MacroCategoryResult {
  events: MacroCategoryEvent[]
  isLoading: boolean
  getEventsForDate: (date: Date) => MacroCategoryEvent[]
  getCategoryForDate: (date: Date, category: MacroCategory) => MacroCategoryEvent | null
}

// Helper function per estrarre end_date dalla description
function extractEndDate(description?: string): Date | null {
  if (!description) return null
  const match = description.match(/\[END_DATE:(\d{4}-\d{2}-\d{2})\]/)
  return match ? new Date(match[1]) : null
}

export function useMacroCategoryEvents(fiscalYearEnd?: Date): MacroCategoryResult {
  const { user, companyId } = useAuth()
  const { maintenanceTasks, isLoading: maintenanceLoading } = useMaintenanceTasks()
  const { products, isLoading: productsLoading } = useProducts()
  const { tasks: genericTasks, isLoading: genericTasksLoading } = useGenericTasks()
  
  // Usa React Query per i task completions invece di useState locale
  const { data: taskCompletions = [], isLoading: completionsLoading } = useQuery({
    queryKey: ['task-completions', companyId],
    queryFn: async (): Promise<TaskCompletion[]> => {
      if (!companyId) return []

      const { data, error } = await supabase
        .from('task_completions')
        .select('*')
        .eq('company_id', companyId)

      if (error) {
        console.error('Error loading task completions:', error)
        throw error
      }

      return (data || []).map((c: any) => ({
        id: c.id,
        company_id: c.company_id,
        task_id: c.task_id,
        completed_by: c.completed_by,
        completed_by_name: c.completed_by_name || null,
        completed_at: new Date(c.completed_at),
        period_start: new Date(c.period_start),
        period_end: new Date(c.period_end),
        notes: c.notes,
        created_at: new Date(c.created_at),
        updated_at: new Date(c.updated_at),
      }))
    },
    enabled: !!companyId,
  })

  const isLoading = maintenanceLoading || productsLoading || genericTasksLoading || completionsLoading

  const maintenanceItems = useMemo(() => {
    if (!maintenanceTasks || maintenanceTasks.length === 0) return []

    return maintenanceTasks.map(task =>
      convertMaintenanceToItem(task)
    )
  }, [maintenanceTasks])

  const genericTaskItems = useMemo(() => {
    if (!genericTasks || genericTasks.length === 0) return []

    return genericTasks.flatMap(task =>
      expandTaskWithCompletions(task, taskCompletions, fiscalYearEnd)
    )
  }, [genericTasks, taskCompletions, fiscalYearEnd])

  const productExpiryItems = useMemo(() => {
    if (!products || products.length === 0) return []

    return products
      .filter(product =>
        product.expiry_date &&
        product.status === 'active' &&
        new Date(product.expiry_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      )
      .map(product =>
        convertProductToItem(product)
      )
  }, [products])

  const events = useMemo(() => {
    const allItems = [
      ...maintenanceItems,
      ...genericTaskItems,
      ...productExpiryItems,
    ]

    const eventsByDateAndCategory = new Map<string, Map<MacroCategory, MacroCategoryItem[]>>()

    allItems.forEach(item => {
      const dateKey = item.dueDate.toISOString().split('T')[0]

      if (!eventsByDateAndCategory.has(dateKey)) {
        eventsByDateAndCategory.set(dateKey, new Map())
      }

      const categoryMap = eventsByDateAndCategory.get(dateKey)!

      if (!categoryMap.has(item.metadata.category)) {
        categoryMap.set(item.metadata.category, [])
      }

      categoryMap.get(item.metadata.category)!.push(item)
    })

    const result: MacroCategoryEvent[] = []

    eventsByDateAndCategory.forEach((categoryMap, dateKey) => {
      categoryMap.forEach((items, category) => {
        const activeItems = items.filter(i => i.status !== 'completed')
        
        result.push({
          date: dateKey,
          category,
          count: activeItems.length,
          items: items.sort((a, b) => {
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
            return priorityOrder[a.priority] - priorityOrder[b.priority]
          }),
        })
      })
    })

    return result.sort((a, b) => a.date.localeCompare(b.date))
  }, [maintenanceItems, genericTaskItems, productExpiryItems])

  const getEventsForDate = (date: Date): MacroCategoryEvent[] => {
    const dateKey = date.toISOString().split('T')[0]
    return events.filter(event => event.date === dateKey)
  }

  const getCategoryForDate = (date: Date, category: MacroCategory): MacroCategoryEvent | null => {
    const dateKey = date.toISOString().split('T')[0]
    return events.find(event => event.date === dateKey && event.category === category) || null
  }

  return {
    events,
    isLoading,
    getEventsForDate,
    getCategoryForDate,
  }
}

function convertMaintenanceToItem(task: MaintenanceTask): MacroCategoryItem {
  const dueDate = new Date(task.next_due)
  const now = new Date()

  const status: MacroCategoryItem['status'] =
    task.status === 'completed' ? 'completed' :
    dueDate < now ? 'overdue' : 'pending'

  return {
    id: task.id,
    title: task.title || 'Manutenzione',
    description: task.description,
    dueDate,
    status,
    priority: task.priority || 'medium',
    assignedTo: task.assigned_to,
    assignedToRole: (task as any).assigned_to_role,
    assignedToCategory: (task as any).assigned_to_category,
    assignedToStaffId: (task as any).assigned_to_staff_id,
    frequency: task.frequency,
    metadata: {
      category: 'maintenance',
      sourceId: task.id,
      notes: task.description,
      conservationPointId: task.conservation_point_id,
      estimatedDuration: task.estimated_duration,
      instructions: task.instructions,
    },
  }
}

function expandTaskWithCompletions(
  task: GenericTask,
  completions: TaskCompletion[],
  fiscalYearEnd?: Date
): MacroCategoryItem[] {
  if (task.frequency === 'as_needed' || task.frequency === 'custom') {
    return [convertGenericTaskToItem(task, task.next_due ? new Date(task.next_due) : new Date(), completions)]
  }

  const items: MacroCategoryItem[] = []
  const now = new Date()
  
  // Usa next_due se disponibile (data di inizio impostata dall'utente), altrimenti usa created_at
  const startDate = task.next_due ? new Date(task.next_due) : new Date(task.created_at)
  
  // Estrai end_date dalla description se presente
  const taskEndDate = extractEndDate(task.description)
  
  // Determina data finale per espansione:
  // 1. Se c'è fiscalYearEnd, usalo come limite
  // 2. Se c'è taskEndDate (dall'utente), usa il minimo tra taskEndDate e fiscalYearEnd
  // 3. Altrimenti default a +90 giorni (fallback se non configurato)
  let endDate: Date
  if (fiscalYearEnd) {
    if (taskEndDate) {
      // Usa il minimo tra end_date specificato e fiscal_year_end
      endDate = taskEndDate < fiscalYearEnd ? taskEndDate : fiscalYearEnd
    } else {
      // Usa fiscal_year_end
      endDate = fiscalYearEnd
    }
  } else if (taskEndDate) {
    // Usa end_date specificato se non c'è fiscal_year_end
    endDate = taskEndDate
  } else {
    // Fallback: +90 giorni se niente è configurato
    endDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
  }

  let currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    items.push(convertGenericTaskToItem(task, new Date(currentDate), completions))

    switch (task.frequency) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + 1)
        break
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7)
        break
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + 1)
        break
      case 'quarterly':
        currentDate.setMonth(currentDate.getMonth() + 3)
        break
      case 'biannually':
        currentDate.setMonth(currentDate.getMonth() + 6)
        break
      case 'annually':
      case 'annual':
        currentDate.setFullYear(currentDate.getFullYear() + 1)
        break
      default:
        currentDate = new Date(endDate.getTime() + 1)
    }
  }

  return items
}

function convertGenericTaskToItem(
  task: GenericTask,
  dueDate: Date,
  completions: TaskCompletion[]
): MacroCategoryItem {
  const now = new Date()

  let period_start: Date
  let period_end: Date

  switch (task.frequency) {
    case 'daily':
      period_start = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate(), 0, 0, 0)
      period_end = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate(), 23, 59, 59)
      break
    case 'weekly':
      const dayOfWeek = dueDate.getDay() || 7
      const monday = new Date(dueDate)
      monday.setDate(dueDate.getDate() - (dayOfWeek - 1))
      period_start = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate(), 0, 0, 0)
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      period_end = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate(), 23, 59, 59)
      break
    case 'monthly':
      period_start = new Date(dueDate.getFullYear(), dueDate.getMonth(), 1, 0, 0, 0)
      period_end = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0, 23, 59, 59)
      break
    case 'annually':
    case 'annual':
      period_start = new Date(dueDate.getFullYear(), 0, 1, 0, 0, 0)
      period_end = new Date(dueDate.getFullYear(), 11, 31, 23, 59, 59)
      break
    default:
      period_start = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate(), 0, 0, 0)
      period_end = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate(), 23, 59, 59)
  }

  // Trova il completamento per questo periodo
  const completion = completions?.find(c => {
    if (c.task_id !== task.id) return false

    const completionStart = c.period_start.getTime()
    const completionEnd = c.period_end.getTime()
    const eventTime = dueDate.getTime()

    return eventTime >= completionStart && eventTime <= completionEnd
  })

  const isCompletedInPeriod = !!completion

  const status: MacroCategoryItem['status'] =
    isCompletedInPeriod ? 'completed' :
    dueDate < now ? 'overdue' : 'pending'

  const itemId = `generic-task-${task.id}-${dueDate.toISOString().split('T')[0]}`

  return {
    id: itemId,
    title: task.name,
    description: task.description,
    dueDate,
    status,
    priority: task.priority || 'medium',
    assignedTo: task.assigned_to,
    assignedToRole: task.assigned_to_role,
    assignedToCategory: task.assigned_to_category,
    assignedToStaffId: task.assigned_to_staff_id,
    frequency: task.frequency,
    metadata: {
      category: 'generic_tasks',
      sourceId: task.id,
      notes: task.description,
      estimatedDuration: task.estimated_duration,
      taskId: task.id,
      // Aggiungi informazioni di completamento se disponibili
      ...(completion && {
        completedBy: completion.completed_by,
        completedByName: completion.completed_by_name,
        completedAt: completion.completed_at,
        completionNotes: completion.notes,
        completionId: completion.id,
      }),
    },
  }
}

function convertProductToItem(product: Product): MacroCategoryItem {
  const expiryDate = new Date(product.expiry_date!)
  const now = new Date()
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  const status: MacroCategoryItem['status'] =
    expiryDate < now ? 'overdue' : 'pending'

  const priority: MacroCategoryItem['priority'] =
    daysUntilExpiry <= 1 ? 'critical' :
    daysUntilExpiry <= 3 ? 'high' : 'medium'

  return {
    id: product.id,
    title: `Scadenza: ${product.name}`,
    description: `Prodotto in scadenza - ${product.quantity || ''} ${product.unit || ''}`,
    dueDate: expiryDate,
    status,
    priority,
    metadata: {
      category: 'product_expiry',
      sourceId: product.id,
      notes: product.notes,
      productName: product.name,
      quantity: product.quantity,
      unit: product.unit,
      departmentId: product.department_id,
      conservationPointId: product.conservation_point_id,
      barcode: product.barcode,
      sku: product.sku,
      supplierName: product.supplier_name,
      purchaseDate: product.purchase_date,
    },
  }
}
