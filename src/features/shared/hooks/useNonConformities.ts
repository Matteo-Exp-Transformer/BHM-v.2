import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'

// Types - Note: severity and status are PostgreSQL ENUMs
// You may need to check the actual ENUM values in your database
export type NonConformitySeverity = 'low' | 'medium' | 'high' | 'critical'
export type NonConformityStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

export interface NonConformity {
  id: string
  company_id: string
  title: string
  description: string
  severity: NonConformitySeverity
  status: NonConformityStatus
  created_at: Date
  updated_at: Date
}

export interface CreateNonConformityRequest {
  title: string
  description: string
  severity: NonConformitySeverity
  status?: NonConformityStatus
}

export interface UpdateNonConformityRequest extends Partial<CreateNonConformityRequest> {
  id: string
}

export interface NonConformityFilters {
  severity?: NonConformitySeverity[]
  status?: NonConformityStatus[]
  search?: string
  date_from?: Date
  date_to?: Date
}

// Query keys
const QUERY_KEYS = {
  nonConformities: (companyId: string, filters?: NonConformityFilters) => [
    'non-conformities',
    companyId,
    filters,
  ],
  nonConformity: (id: string) => ['non-conformity', id],
  nonConformityStats: (companyId: string) => ['non-conformity-stats', companyId],
} as const

// Transform database record to NonConformity interface
const transformNonConformityRecord = (record: any): NonConformity => {
  return {
    id: record.id,
    company_id: record.company_id,
    title: record.title,
    description: record.description,
    severity: record.severity,
    status: record.status,
    created_at: new Date(record.created_at),
    updated_at: new Date(record.updated_at),
  }
}

// Hook for non-conformities management
export const useNonConformities = (filters?: NonConformityFilters) => {
  const { companyId } = useAuth()
  const queryClient = useQueryClient()

  // Fetch non-conformities
  const {
    data: nonConformities,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.nonConformities(companyId || '', filters),
    queryFn: async () => {
      if (!companyId) {
        throw new Error('Company ID not available')
      }

      let query = supabase
        .from('non_conformities')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters?.severity && filters.severity.length > 0) {
        query = query.in('severity', filters.severity)
      }
      if (filters?.status && filters.status.length > 0) {
        query = query.in('status', filters.status)
      }
      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
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
        console.error('Error fetching non-conformities:', error)
        throw error
      }

      return data?.map(transformNonConformityRecord) || []
    },
    enabled: !!companyId,
  })

  // Create non-conformity mutation
  const createNonConformityMutation = useMutation({
    mutationFn: async (ncData: CreateNonConformityRequest): Promise<NonConformity> => {
      if (!companyId) {
        throw new Error('Company ID not available')
      }

      const { data, error } = await supabase
        .from('non_conformities')
        .insert({
          ...ncData,
          company_id: companyId,
          status: ncData.status || 'open',
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating non-conformity:', error)
        throw error
      }

      return transformNonConformityRecord(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['non-conformities'] })
      toast.success('Non conformità creata con successo')
    },
    onError: (error) => {
      console.error('Error creating non-conformity:', error)
      toast.error('Errore nella creazione della non conformità')
    },
  })

  // Update non-conformity mutation
  const updateNonConformityMutation = useMutation({
    mutationFn: async ({ id, ...ncData }: UpdateNonConformityRequest): Promise<NonConformity> => {
      const { data, error } = await supabase
        .from('non_conformities')
        .update(ncData)
        .eq('id', id)
        .eq('company_id', companyId)
        .select()
        .single()

      if (error) {
        console.error('Error updating non-conformity:', error)
        throw error
      }

      return transformNonConformityRecord(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['non-conformities'] })
      toast.success('Non conformità aggiornata con successo')
    },
    onError: (error) => {
      console.error('Error updating non-conformity:', error)
      toast.error('Errore nell\'aggiornamento della non conformità')
    },
  })

  // Delete non-conformity mutation
  const deleteNonConformityMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('non_conformities')
        .delete()
        .eq('id', id)
        .eq('company_id', companyId)

      if (error) {
        console.error('Error deleting non-conformity:', error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['non-conformities'] })
      toast.success('Non conformità eliminata con successo')
    },
    onError: (error) => {
      console.error('Error deleting non-conformity:', error)
      toast.error('Errore nell\'eliminazione della non conformità')
    },
  })

  // Get single non-conformity
  const useNonConformity = (id: string) => {
    return useQuery({
      queryKey: QUERY_KEYS.nonConformity(id),
      queryFn: async () => {
        const { data, error } = await supabase
          .from('non_conformities')
          .select('*')
          .eq('id', id)
          .eq('company_id', companyId)
          .single()

        if (error) {
          console.error('Error fetching non-conformity:', error)
          throw error
        }

        return transformNonConformityRecord(data)
      },
      enabled: !!id && !!companyId,
    })
  }

  // Stats
  const stats = {
    total: nonConformities?.length || 0,
    open: nonConformities?.filter((nc: any) => nc.status === 'open').length || 0,
    inProgress: nonConformities?.filter((nc: any) => nc.status === 'in_progress').length || 0,
    resolved: nonConformities?.filter((nc: any) => nc.status === 'resolved').length || 0,
    closed: nonConformities?.filter((nc: any) => nc.status === 'closed').length || 0,
    bySeverity: {
      low: nonConformities?.filter((nc: any) => nc.severity === 'low').length || 0,
      medium: nonConformities?.filter((nc: any) => nc.severity === 'medium').length || 0,
      high: nonConformities?.filter((nc: any) => nc.severity === 'high').length || 0,
      critical: nonConformities?.filter((nc: any) => nc.severity === 'critical').length || 0,
    },
    critical: nonConformities?.filter((nc: any) => nc.severity === 'critical' && nc.status !== 'closed').length || 0,
  }

  return {
    // Data
    nonConformities: nonConformities || [],
    stats,

    // Loading states
    isLoading,
    isCreating: createNonConformityMutation.isPending,
    isUpdating: updateNonConformityMutation.isPending,
    isDeleting: deleteNonConformityMutation.isPending,

    // Error
    error,

    // Actions
    createNonConformity: createNonConformityMutation.mutate,
    updateNonConformity: updateNonConformityMutation.mutate,
    deleteNonConformity: deleteNonConformityMutation.mutate,
    refetch,

    // Utilities
    useNonConformity,
  }
}