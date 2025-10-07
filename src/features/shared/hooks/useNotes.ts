import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'

// Types
export interface Note {
  id: string
  company_id: string
  title: string
  content: string
  created_at: Date
  updated_at: Date
}

export interface CreateNoteRequest {
  title: string
  content: string
}

export interface UpdateNoteRequest extends Partial<CreateNoteRequest> {
  id: string
}

export interface NoteFilters {
  search?: string
  date_from?: Date
  date_to?: Date
}

// Query keys
const QUERY_KEYS = {
  notes: (companyId: string, filters?: NoteFilters) => [
    'notes',
    companyId,
    filters,
  ],
  note: (id: string) => ['note', id],
} as const

// Transform database record to Note interface
const transformNoteRecord = (record: any): Note => {
  return {
    id: record.id,
    company_id: record.company_id,
    title: record.title,
    content: record.content,
    created_at: new Date(record.created_at),
    updated_at: new Date(record.updated_at),
  }
}

// Hook for notes management
export const useNotes = (filters?: NoteFilters) => {
  const { user, companyId } = useAuth()
  const queryClient = useQueryClient()

  // Fetch notes
  const {
    data: notes,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.notes(companyId || '', filters),
    queryFn: async () => {
      if (!companyId) {
        throw new Error('Company ID not available')
      }

      let query = supabase
        .from('notes')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`
        )
      }
      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from.toISOString())
      }
      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to.toISOString())
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching notes:', error)
        throw error
      }

      return data?.map(transformNoteRecord) || []
    },
    enabled: !!companyId,
  })

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: async (noteData: CreateNoteRequest): Promise<Note> => {
      if (!companyId) {
        throw new Error('Company ID not available')
      }

      const { data, error } = await supabase
        .from('notes')
        .insert({
          ...noteData,
          company_id: companyId,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating note:', error)
        throw error
      }

      return transformNoteRecord(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      toast.success('Nota creata con successo')
    },
    onError: (error) => {
      console.error('Error creating note:', error)
      toast.error('Errore nella creazione della nota')
    },
  })

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, ...noteData }: UpdateNoteRequest): Promise<Note> => {
      const { data, error } = await supabase
        .from('notes')
        .update(noteData)
        .eq('id', id)
        .eq('company_id', companyId)
        .select()
        .single()

      if (error) {
        console.error('Error updating note:', error)
        throw error
      }

      return transformNoteRecord(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      toast.success('Nota aggiornata con successo')
    },
    onError: (error) => {
      console.error('Error updating note:', error)
      toast.error('Errore nell\'aggiornamento della nota')
    },
  })

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('company_id', companyId)

      if (error) {
        console.error('Error deleting note:', error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      toast.success('Nota eliminata con successo')
    },
    onError: (error) => {
      console.error('Error deleting note:', error)
      toast.error('Errore nell\'eliminazione della nota')
    },
  })

  // Get single note
  const useNote = (id: string) => {
    return useQuery({
      queryKey: QUERY_KEYS.note(id),
      queryFn: async () => {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('id', id)
          .eq('company_id', companyId)
          .single()

        if (error) {
          console.error('Error fetching note:', error)
          throw error
        }

        return transformNoteRecord(data)
      },
      enabled: !!id && !!companyId,
    })
  }

  // Stats
  const stats = {
    total: notes?.length || 0,
    thisWeek: notes?.filter(note => {
      const noteDate = note.created_at
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return noteDate >= weekAgo
    }).length || 0,
    thisMonth: notes?.filter(note => {
      const noteDate = note.created_at
      const now = new Date()
      return noteDate.getMonth() === now.getMonth() &&
             noteDate.getFullYear() === now.getFullYear()
    }).length || 0,
  }

  return {
    // Data
    notes: notes || [],
    stats,

    // Loading states
    isLoading,
    isCreating: createNoteMutation.isPending,
    isUpdating: updateNoteMutation.isPending,
    isDeleting: deleteNoteMutation.isPending,

    // Error
    error,

    // Actions
    createNote: createNoteMutation.mutate,
    updateNote: updateNoteMutation.mutate,
    deleteNote: deleteNoteMutation.mutate,
    refetch,

    // Utilities
    useNote,
  }
}