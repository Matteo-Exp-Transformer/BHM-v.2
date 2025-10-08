import { useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useMaintenanceTasks } from '@/features/conservation/hooks/useMaintenanceTasks'
import { useProducts } from '@/features/inventory/hooks/useProducts'
import { useGenericTasks } from './useGenericTasks'
import type { MaintenanceTask } from '@/types/conservation'
import type { Product } from '@/types/inventory'
import type { GenericTask } from './useGenericTasks'

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

export function useMacroCategoryEvents(): MacroCategoryResult {
  const { user, companyId } = useAuth()
  const { maintenanceTasks, isLoading: maintenanceLoading } = useMaintenanceTasks()
  const { products, isLoading: productsLoading } = useProducts()
  const { tasks: genericTasks, isLoading: genericTasksLoading } = useGenericTasks()

  const isLoading = maintenanceLoading || productsLoading || genericTasksLoading

  const maintenanceItems = useMemo(() => {
    if (!maintenanceTasks || maintenanceTasks.length === 0) return []

    return maintenanceTasks.map(task =>
      convertMaintenanceToItem(task)
    )
  }, [maintenanceTasks])

  const genericTaskItems = useMemo(() => {
    if (!genericTasks || genericTasks.length === 0) return []

    return genericTasks.map(task =>
      convertGenericTaskToItem(task)
    )
  }, [genericTasks])

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
        result.push({
          date: dateKey,
          category,
          count: items.length,
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

function convertGenericTaskToItem(task: GenericTask): MacroCategoryItem {
  const dueDate = task.next_due ? new Date(task.next_due) : new Date()
  const now = new Date()

  const status: MacroCategoryItem['status'] =
    task.status === 'completed' ? 'completed' :
    dueDate < now ? 'overdue' : 'pending'

  return {
    id: task.id,
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
