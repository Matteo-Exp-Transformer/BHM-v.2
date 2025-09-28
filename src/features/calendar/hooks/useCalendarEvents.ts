import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CalendarEvent,
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
} from '@/types/calendar'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'
import {
  updateEventStatus,
  filterEvents,
  calculateEventStats,
  getEventColors,
} from '../utils/eventTransform'

// Mock data for development - replace with real API calls
const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Controllo Temperatura Frigorifero 1',
    description: 'Controllo temperatura e registrazione dati',
    start: new Date(2025, 0, 20, 8, 0),
    end: new Date(2025, 0, 20, 8, 15),
    allDay: false,
    type: 'temperature_reading',
    status: 'pending',
    priority: 'medium',
    assigned_to: ['user1'],
    department_id: 'cucina',
    conservation_point_id: 'fridge1',
    recurring: true,
    recurrence_pattern: {
      frequency: 'daily',
      interval: 1,
    },
    backgroundColor: '#DCFCE7',
    borderColor: '#10B981',
    textColor: '#065F46',
    metadata: {
      conservation_point_id: 'fridge1',
      notes: 'Controllo giornaliero temperatura',
    },
    source: 'temperature_reading',
    sourceId: 'temp1',
    extendedProps: {},
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 'user1',
    company_id: 'company1',
  },
  {
    id: '2',
    title: 'Manutenzione Abbattitore',
    description: 'Pulizia e controllo funzionamento abbattitore',
    start: new Date(2025, 0, 20, 14, 0),
    end: new Date(2025, 0, 20, 16, 0),
    allDay: false,
    type: 'maintenance',
    status: 'pending',
    priority: 'high',
    assigned_to: ['user2'],
    department_id: 'cucina',
    conservation_point_id: 'blast1',
    recurring: true,
    recurrence_pattern: {
      frequency: 'weekly',
      interval: 1,
      days_of_week: [1], // Monday
    },
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    textColor: '#92400E',
    metadata: {
      conservation_point_id: 'blast1',
      notes: 'Manutenzione settimanale programmata',
    },
    source: 'maintenance',
    sourceId: 'maint1',
    extendedProps: {},
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 'user1',
    company_id: 'company1',
  },
  {
    id: '3',
    title: 'Formazione Staff HACCP',
    description: 'Sessione di formazione per nuovo personale',
    start: new Date(2025, 0, 21, 10, 0),
    end: new Date(2025, 0, 21, 12, 0),
    allDay: false,
    type: 'general_task',
    status: 'pending',
    priority: 'medium',
    assigned_to: ['user1', 'user2', 'user3'],
    department_id: 'sala',
    recurring: false,
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
    textColor: '#1E40AF',
    metadata: {
      notes: 'Formazione obbligatoria nuovo personale',
    },
    source: 'general_task',
    sourceId: 'task1',
    extendedProps: {},
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 'user1',
    company_id: 'company1',
  },
  {
    id: '4',
    title: 'Controllo Inventario Scadenze',
    description: 'Verifica prodotti in scadenza nei prossimi 3 giorni',
    start: new Date(2025, 0, 19, 9, 0),
    end: new Date(2025, 0, 19, 10, 0),
    allDay: false,
    type: 'general_task',
    status: 'overdue',
    priority: 'critical',
    assigned_to: ['user1'],
    department_id: 'magazzino',
    recurring: true,
    recurrence_pattern: {
      frequency: 'daily',
      interval: 1,
    },
    backgroundColor: '#7F1D1D',
    borderColor: '#991B1B',
    textColor: '#FFFFFF',
    metadata: {
      notes: 'Controllo urgente prodotti in scadenza',
    },
    source: 'general_task',
    sourceId: 'task2',
    extendedProps: {},
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 'user1',
    company_id: 'company1',
  },
]

/**
 * Hook for managing calendar events
 */
export function useCalendarEvents() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Fetch all calendar events
  const {
    data: events = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['calendar-events', user?.company_id],
    queryFn: async (): Promise<CalendarEvent[]> => {
      if (!user?.company_id) {
        console.log('🔧 No company_id, using mock calendar events')
        const updatedEvents = MOCK_EVENTS.map(updateEventStatus)
        return updatedEvents.map(event => {
          const colors = getEventColors(
            event.type,
            event.status,
            event.priority
          )
          return {
            ...event,
            backgroundColor: colors.backgroundColor,
            borderColor: colors.borderColor,
            textColor: colors.textColor,
          }
        })
      }

      console.log(
        '🔧 Loading calendar events from Supabase for company:',
        user.company_id
      )

      try {
        // Load maintenance tasks from Supabase and convert to calendar events
        const { data: tasks, error: tasksError } = await supabase
          .from('maintenance_tasks')
          .select(
            `
            *,
            conservation_point:conservation_points(id, name, department:departments(id, name))
          `
          )
          .eq('company_id', user.company_id)
          .order('next_due', { ascending: true })

        if (tasksError) {
          console.error('Error loading maintenance tasks:', tasksError)
          throw tasksError
        }

        console.log(
          '✅ Loaded maintenance tasks from Supabase:',
          tasks?.length || 0
        )

        // Convert maintenance tasks to calendar events
        const calendarEvents: CalendarEvent[] = (tasks || []).map(task => {
          const startDate = new Date(task.next_due)
          const endDate = new Date(
            startDate.getTime() + (task.estimated_duration || 60) * 60 * 1000
          )

          const event: CalendarEvent = {
            id: `task-${task.id}`,
            title: task.title || 'Manutenzione',
            description: task.instructions || task.type,
            start: startDate,
            end: endDate,
            allDay: false,
            type: 'maintenance',
            status:
              task.status === 'completed'
                ? 'completed'
                : startDate < new Date()
                  ? 'overdue'
                  : 'pending',
            priority: task.priority || 'medium',
            assigned_to: task.assigned_to ? [task.assigned_to] : [],
            department_id: task.conservation_point?.department?.id,
            conservation_point_id: task.conservation_point_id,
            recurring: task.frequency !== 'once',
            recurrence_pattern:
              task.frequency === 'daily'
                ? { frequency: 'daily', interval: 1 }
                : task.frequency === 'weekly'
                  ? { frequency: 'weekly', interval: 1 }
                  : task.frequency === 'monthly'
                    ? { frequency: 'monthly', interval: 1 }
                    : undefined,
            backgroundColor: '#FEF3C7',
            borderColor: '#F59E0B',
            textColor: '#92400E',
            metadata: {
              conservation_point_id: task.conservation_point_id,
              notes: task.instructions,
              task_id: task.id,
            },
            source: 'maintenance',
            sourceId: task.id,
            extendedProps: { task },
            created_at: new Date(task.created_at),
            updated_at: new Date(task.updated_at),
            created_by: task.created_by || 'system',
            company_id: task.company_id,
          }

          // Apply colors based on status
          const colors = getEventColors(
            event.type,
            event.status,
            event.priority
          )
          return {
            ...event,
            backgroundColor: colors.backgroundColor,
            borderColor: colors.borderColor,
            textColor: colors.textColor,
          }
        })

        return calendarEvents
      } catch (error) {
        console.error('Error loading calendar events from Supabase:', error)
        // Fallback to mock data
        console.log('🔧 Fallback to mock calendar events due to error')
        const updatedEvents = MOCK_EVENTS.map(updateEventStatus)
        return updatedEvents.map(event => {
          const colors = getEventColors(
            event.type,
            event.status,
            event.priority
          )
          return {
            ...event,
            backgroundColor: colors.backgroundColor,
            borderColor: colors.borderColor,
            textColor: colors.textColor,
          }
        })
      }
    },
    enabled: !!user,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })

  // Create new event
  const createEventMutation = useMutation({
    mutationFn: async (
      input: CreateCalendarEventInput
    ): Promise<CalendarEvent> => {
      // TODO: Replace with real API call
      const colors = getEventColors(input.type, 'pending', input.priority)

      const newEvent: CalendarEvent = {
        id: `temp-${Date.now()}`,
        title: input.title,
        description: input.description,
        start: input.start,
        end: input.end,
        allDay: input.allDay || false,
        type: input.type,
        status: 'pending',
        priority: input.priority,
        assigned_to: input.assigned_to,
        department_id: input.department_id,
        conservation_point_id: input.conservation_point_id,
        recurring: input.recurring || false,
        recurrence_pattern: input.recurrence_pattern,
        backgroundColor: colors.backgroundColor,
        borderColor: colors.borderColor,
        textColor: colors.textColor,
        metadata: input.metadata || {},
        source: input.type,
        sourceId: `temp-${Date.now()}`,
        extendedProps: {},
        created_at: new Date(),
        updated_at: new Date(),
        created_by: user?.id || 'unknown',
        company_id: user?.company_id || 'unknown',
      }

      return newEvent
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      toast.success('Evento creato con successo')
    },
    onError: error => {
      console.error('Errore nella creazione evento:', error)
      toast.error("Errore nella creazione dell'evento")
    },
  })

  // Update event
  const updateEventMutation = useMutation({
    mutationFn: async (
      input: UpdateCalendarEventInput
    ): Promise<CalendarEvent> => {
      // TODO: Replace with real API call
      const existingEvent = events.find(e => e.id === input.id)
      if (!existingEvent) {
        throw new Error('Evento non trovato')
      }

      const updatedEvent: CalendarEvent = {
        ...existingEvent,
        ...input,
        updated_at: new Date(),
      }

      // Recalculate colors if status/priority changed
      if (input.status || input.priority) {
        const colors = getEventColors(
          updatedEvent.type,
          updatedEvent.status,
          updatedEvent.priority
        )
        updatedEvent.backgroundColor = colors.backgroundColor
        updatedEvent.borderColor = colors.borderColor
        updatedEvent.textColor = colors.textColor
      }

      return updatedEvent
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      toast.success('Evento aggiornato con successo')
    },
    onError: error => {
      console.error("Errore nell'aggiornamento evento:", error)
      toast.error("Errore nell'aggiornamento dell'evento")
    },
  })

  // Delete event
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string): Promise<void> => {
      // TODO: Replace with real API call
      console.log('Deleting event:', eventId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      toast.success('Evento eliminato con successo')
    },
    onError: error => {
      console.error("Errore nell'eliminazione evento:", error)
      toast.error("Errore nell'eliminazione dell'evento")
    },
  })

  // Helper functions
  const getFilteredEvents = (
    filters?: Partial<Parameters<typeof filterEvents>[1]>
  ) => {
    if (!filters) return events
    return filterEvents(events, filters)
  }

  const getEventStats = () => {
    return calculateEventStats(events)
  }

  const getEventsForDate = (date: Date) => {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    return events.filter(event => {
      const eventStart = event.start
      const eventEnd = event.end || event.start
      return eventStart <= endOfDay && eventEnd >= startOfDay
    })
  }

  const getUpcomingEvents = (days: number = 7) => {
    const now = new Date()
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

    return events.filter(event => {
      return (
        event.start >= now &&
        event.start <= futureDate &&
        event.status === 'pending'
      )
    })
  }

  const getOverdueEvents = () => {
    return events.filter(event => event.status === 'overdue')
  }

  return {
    // Data
    events,
    isLoading,
    error,

    // Mutations
    createEvent: createEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
    deleteEvent: deleteEventMutation.mutate,

    // Loading states
    isCreating: createEventMutation.isPending,
    isUpdating: updateEventMutation.isPending,
    isDeleting: deleteEventMutation.isPending,

    // Helper functions
    refetch,
    getFilteredEvents,
    getEventStats,
    getEventsForDate,
    getUpcomingEvents,
    getOverdueEvents,
  }
}
