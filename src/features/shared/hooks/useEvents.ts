import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'

// Types
export interface Event {
  id: string
  company_id: string
  title: string
  description?: string
  start_date: Date
  end_date?: Date
  created_at: Date
  updated_at: Date
}

export interface CreateEventRequest {
  title: string
  description?: string
  start_date: Date
  end_date?: Date
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  id: string
}

export interface EventFilters {
  start_date_from?: Date
  start_date_to?: Date
  search?: string
}

// Query keys
const QUERY_KEYS = {
  events: (companyId: string, filters?: EventFilters) => [
    'events',
    companyId,
    filters,
  ],
  event: (id: string) => ['event', id],
} as const

// Transform database record to Event interface
const transformEventRecord = (record: any): Event => {
  return {
    id: record.id,
    company_id: record.company_id,
    title: record.title,
    description: record.description ?? undefined,
    start_date: new Date(record.start_date),
    end_date: record.end_date ? new Date(record.end_date) : undefined,
    created_at: new Date(record.created_at),
    updated_at: new Date(record.updated_at),
  }
}

// Hook for events management
export const useEvents = (filters?: EventFilters) => {
  const { companyId } = useAuth()
  const queryClient = useQueryClient()

  // Fetch events
  const {
    data: events,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.events(companyId || '', filters),
    queryFn: async () => {
      if (!companyId) {
        throw new Error('Company ID not available')
      }

      let query = supabase
        .from('events')
        .select('*')
        .eq('company_id', companyId)
        .order('start_date', { ascending: false })

      // Apply filters
      if (filters?.start_date_from) {
        query = query.gte('start_date', filters.start_date_from.toISOString())
      }
      if (filters?.start_date_to) {
        query = query.lte('start_date', filters.start_date_to.toISOString())
      }
      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        )
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching events:', error)
        throw error
      }

      return data?.map(transformEventRecord) || []
    },
    enabled: !!companyId,
  })

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: CreateEventRequest): Promise<Event> => {
      if (!companyId) {
        throw new Error('Company ID not available')
      }

      const { data, error } = await supabase
        .from('events')
        .insert({
          ...eventData,
          company_id: companyId,
          start_date: eventData.start_date.toISOString(),
          end_date: eventData.end_date?.toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating event:', error)
        throw error
      }

      return transformEventRecord(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast.success('Evento creato con successo')
    },
    onError: (error) => {
      console.error('Error creating event:', error)
      toast.error('Errore nella creazione dell\'evento')
    },
  })

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: async ({ id, ...eventData }: UpdateEventRequest): Promise<Event> => {
      const updateData: any = { ...eventData }

      if (eventData.start_date) {
        updateData.start_date = eventData.start_date.toISOString()
      }
      if (eventData.end_date) {
        updateData.end_date = eventData.end_date.toISOString()
      }

      const { data, error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', id)
        .eq('company_id', companyId)
        .select()
        .single()

      if (error) {
        console.error('Error updating event:', error)
        throw error
      }

      return transformEventRecord(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast.success('Evento aggiornato con successo')
    },
    onError: (error) => {
      console.error('Error updating event:', error)
      toast.error('Errore nell\'aggiornamento dell\'evento')
    },
  })

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)
        .eq('company_id', companyId)

      if (error) {
        console.error('Error deleting event:', error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast.success('Evento eliminato con successo')
    },
    onError: (error) => {
      console.error('Error deleting event:', error)
      toast.error('Errore nell\'eliminazione dell\'evento')
    },
  })

  // Get single event
  const useEvent = (id: string) => {
    return useQuery({
      queryKey: QUERY_KEYS.event(id),
      queryFn: async () => {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .eq('company_id', companyId)
          .single()

        if (error) {
          console.error('Error fetching event:', error)
          throw error
        }

        return transformEventRecord(data)
      },
      enabled: !!id && !!companyId,
    })
  }

  // Stats
  const stats = {
    total: events?.length || 0,
    upcoming: events?.filter((event: any) => event.start_date > new Date()).length || 0,
    thisMonth: events?.filter((event: any) => {
      const eventDate = event.start_date
      const now = new Date()
      return eventDate.getMonth() === now.getMonth() &&
             eventDate.getFullYear() === now.getFullYear()
    }).length || 0,
  }

  return {
    // Data
    events: events || [],
    stats,

    // Loading states
    isLoading,
    isCreating: createEventMutation.isPending,
    isUpdating: updateEventMutation.isPending,
    isDeleting: deleteEventMutation.isPending,

    // Error
    error,

    // Actions
    createEvent: createEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
    deleteEvent: deleteEventMutation.mutate,
    refetch,

    // Utilities
    useEvent,
  }
}