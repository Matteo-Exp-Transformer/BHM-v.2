import { useState, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import type {
  CalendarEvent,
  CalendarFilter,
  CalendarSettings,
} from '@/types/calendar'

interface UseCalendarOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  initialFilter?: Partial<CalendarFilter>
}

interface CalendarData {
  maintenanceTasks: any[]
  tasks: any[]
  trainingSessions: any[]
  inventoryEvents: any[]
  meetings: any[]
}

export function useCalendar(options: UseCalendarOptions = {}) {
  const { autoRefresh = true, refreshInterval = 30000, initialFilter } = options
  const queryClient = useQueryClient()

  const [filter, setFilter] = useState<CalendarFilter>({
    sources: ['maintenance', 'task', 'training', 'inventory', 'meeting'],
    priorities: ['low', 'medium', 'high', 'critical'],
    statuses: ['scheduled', 'in_progress', 'completed', 'overdue'],
    ...initialFilter,
  })

  const [settings, setSettings] = useState<CalendarSettings>({
    defaultView: 'dayGridMonth',
    weekStartsOn: 1,
    timeFormat: '24h',
    firstDayOfWeek: 1,
    businessHours: {
      daysOfWeek: [1, 2, 3, 4, 5],
      startTime: '08:00',
      endTime: '18:00',
    },
    notifications: {
      enabled: true,
      defaultTimings: ['minutes_before'],
    },
    colorScheme: {
      maintenance: '#3B82F6',
      task: '#10B981',
      training: '#F59E0B',
      inventory: '#8B5CF6',
      meeting: '#EF4444',
      temperature_reading: '#06B6D4',
      general_task: '#6366F1',
      custom: '#EC4899',
    },
  })

  const {
    data: calendarData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['calendar-data', filter],
    queryFn: async (): Promise<CalendarData> => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const [
        maintenanceResponse,
        tasksResponse,
        trainingsResponse,
        inventoryResponse,
        meetingsResponse,
      ] = await Promise.all([
        supabase
          .from('maintenance_tasks')
          .select(
            `
            *,
            conservation_point:conservation_points(*)
          `
          )
          .eq('is_active', true),

        supabase.from('tasks').select(`
            *,
            department:departments(*)
          `),

        supabase.from('training_sessions').select('*'),

        supabase.from('inventory_events').select(`
            *,
            conservation_point:conservation_points(*)
          `),

        supabase.from('meetings').select('*'),
      ])

      if (maintenanceResponse.error) throw maintenanceResponse.error
      if (tasksResponse.error) throw tasksResponse.error
      if (trainingsResponse.error) throw trainingsResponse.error
      if (inventoryResponse.error) throw inventoryResponse.error
      if (meetingsResponse.error) throw meetingsResponse.error

      return {
        maintenanceTasks: maintenanceResponse.data || [],
        tasks: tasksResponse.data || [],
        trainingSessions: trainingsResponse.data || [],
        inventoryEvents: inventoryResponse.data || [],
        meetings: meetingsResponse.data || [],
      }
    },
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 10000,
  })

  const transformToCalendarEvents = useCallback(
    (data: CalendarData): CalendarEvent[] => {
      const events: CalendarEvent[] = []

      if (filter.sources.includes('maintenance')) {
        data.maintenanceTasks.forEach(task => {
          const event: CalendarEvent = {
            id: `maintenance-${task.id}`,
            title: `Manutenzione: ${task.kind}`,
            start: new Date(task.next_due_date),
            type: 'maintenance',
            status: 'pending',
            priority: 'medium',
            assigned_to: task.assigned_to ? [task.assigned_to] : [],
            department_id: task.department_id,
            conservation_point_id: task.conservation_point_id,
            backgroundColor: settings.colorScheme.maintenance,
            borderColor: settings.colorScheme.maintenance,
            textColor: '#ffffff',
            recurring: false,
            metadata: {},
            created_by: 'temp-user',
            company_id: 'temp-company',
            created_at: new Date(),
            updated_at: new Date(),
            source: 'maintenance',
            sourceId: task.id,
            extendedProps: {
              description: `Manutenzione ${task.kind} per ${task.conservation_point?.name || 'punto non specificato'}`,
              priority: determineMaintenancePriority(task),
              status: determineMaintenanceStatus(task),
              assignedTo: task.assigned_to ? [task.assigned_to] : [],
              location: task.conservation_point?.name,
              category: task.kind,
              color: settings.colorScheme.maintenance,
            },
          }
          events.push(event)
        })
      }

      if (filter.sources.includes('inventory')) {
        data.inventoryEvents.forEach(invEvent => {
          const event: CalendarEvent = {
            id: `inventory-${invEvent.id}`,
            title: `Inventario: ${invEvent.type}`,
            start: new Date(invEvent.scheduled_date),
            type: 'general_task',
            status: 'pending',
            priority: 'medium',
            assigned_to: invEvent.assigned_to ? [invEvent.assigned_to] : [],
            department_id: invEvent.department_id,
            conservation_point_id: invEvent.conservation_point_id,
            backgroundColor: settings.colorScheme.inventory,
            borderColor: settings.colorScheme.inventory,
            textColor: '#ffffff',
            recurring: false,
            metadata: {},
            created_by: 'temp-user',
            company_id: 'temp-company',
            created_at: new Date(),
            updated_at: new Date(),
            source: 'inventory',
            sourceId: invEvent.id,
            extendedProps: {
              description:
                invEvent.description ||
                `Evento di inventario: ${invEvent.type}`,
              priority: invEvent.priority || 'medium',
              status: invEvent.status || 'scheduled',
              assignedTo: invEvent.assigned_to ? [invEvent.assigned_to] : [],
              location: invEvent.conservation_point?.name,
              category: invEvent.type,
              color: settings.colorScheme.inventory,
            },
          }
          events.push(event)
        })
      }

      return events.filter(event => {
        return (
          filter.priorities.includes(event.extendedProps.priority) &&
          filter.statuses.includes(event.extendedProps.status)
        )
      })
    },
    [filter, settings.colorScheme]
  )

  const events = useMemo(() => {
    if (!calendarData) return []
    return transformToCalendarEvents(calendarData)
  }, [calendarData, transformToCalendarEvents])

  const createEventMutation = useMutation({
    mutationFn: async (eventData: Partial<CalendarEvent>) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      switch (eventData.source) {
        case 'maintenance': {
          const { data: maintenanceData, error: maintenanceError } =
            await supabase
              .from('maintenance_tasks')
              .insert({
                kind: eventData.extendedProps?.category,
                next_due_date: eventData.start,
                estimated_duration: 30,
                conservation_point_id: '',
                assigned_to: eventData.extendedProps?.assignedTo?.[0],
              })
              .select()
              .single()

          if (maintenanceError) throw maintenanceError
          return maintenanceData
        }

        default:
          throw new Error(`Event source ${eventData.source} not implemented`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-data'] })
    },
  })

  const updateEventMutation = useMutation({
    mutationFn: async ({
      eventId,
      updates,
    }: {
      eventId: string
      updates: Partial<CalendarEvent>
    }) => {
      const [source, id] = eventId.split('-')

      switch (source) {
        case 'maintenance': {
          const { data, error } = await supabase
            .from('maintenance_tasks')
            .update({
              next_due_date: updates.start,
              estimated_duration: 30,
              assigned_to: updates.extendedProps?.assignedTo?.[0],
            })
            .eq('id', id)
            .select()
            .single()

          if (error) throw error
          return data
        }

        default:
          throw new Error(`Event source ${source} not implemented`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-data'] })
    },
  })

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const [source, id] = eventId.split('-')

      switch (source) {
        case 'maintenance': {
          const { error } = await supabase
            .from('maintenance_tasks')
            .delete()
            .eq('id', id)

          if (error) throw error
          break
        }

        default:
          throw new Error(`Event source ${source} not implemented`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-data'] })
    },
  })

  const updateFilter = useCallback((newFilter: Partial<CalendarFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }))
  }, [])

  const updateSettings = useCallback(
    (newSettings: Partial<CalendarSettings>) => {
      setSettings(prev => ({ ...prev, ...newSettings }))
    },
    []
  )

  return {
    events,
    filter,
    settings,
    isLoading,
    error,
    refetch,
    updateFilter,
    updateSettings,
    createEvent: createEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
    deleteEvent: deleteEventMutation.mutate,
    isCreating: createEventMutation.isPending,
    isUpdating: updateEventMutation.isPending,
    isDeleting: deleteEventMutation.isPending,
  }
}

function determineMaintenancePriority(
  task: any
): CalendarEvent['extendedProps']['priority'] {
  const now = new Date()
  const dueDate = new Date(task.next_due_date)
  const daysUntilDue = Math.ceil(
    (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysUntilDue < 0) return 'critical'
  if (daysUntilDue <= 1) return 'high'
  if (daysUntilDue <= 3) return 'medium'
  return 'low'
}

function determineMaintenanceStatus(
  task: any
): CalendarEvent['extendedProps']['status'] {
  const now = new Date()
  const dueDate = new Date(task.next_due_date)

  if (dueDate < now) return 'overdue'
  return 'scheduled'
}
