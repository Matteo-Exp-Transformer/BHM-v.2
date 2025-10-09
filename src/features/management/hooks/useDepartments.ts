import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'

// Department interface
export interface Department {
  id: string
  company_id: string
  name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DepartmentInput {
  name: string
  is_active?: boolean
}

// Query keys
const QUERY_KEYS = {
  departments: (companyId: string) => ['departments', companyId],
  department: (id: string) => ['department', id],
} as const

// Hook for departments management
export const useDepartments = () => {
  const { companyId } = useAuth()
  const queryClient = useQueryClient()

  // Fetch all departments
  const {
    data: departments = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.departments(companyId || ''),
    queryFn: async (): Promise<Department[]> => {
      // ✅ Check BEFORE query execution
      if (!companyId) {
        console.warn('⚠️ No company_id available, returning empty departments array')
        return []
      }

      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('company_id', companyId)
        .order('name', { ascending: true })

      if (error) {
        console.error('❌ Error loading departments:', error)
        throw error
      }
      
      console.log('✅ Loaded departments:', data?.length || 0)
      return data || []
    },
    enabled: !!companyId, // ✅ Only run query if company_id exists
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Create department mutation
  const createDepartment = useMutation({
    mutationFn: async (input: DepartmentInput): Promise<Department> => {
      if (!companyId) throw new Error('Company ID not found')

      const { data, error } = await supabase
        .from('departments')
        .insert({
          company_id: companyId,
          name: input.name,
          is_active: input.is_active ?? true,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: newDepartment => {
      queryClient.setQueryData(
        QUERY_KEYS.departments(companyId || ''),
        (old: Department[] = []) => [...old, newDepartment]
      )
      toast.success(`Reparto "${newDepartment.name}" creato con successo`)
    },
    onError: (error: Error) => {
      console.error('Error creating department:', error)
      toast.error(`Errore nella creazione del reparto: ${error.message}`)
    },
  })

  // Update department mutation
  const updateDepartment = useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string
      input: Partial<DepartmentInput>
    }): Promise<Department> => {
      const { data, error } = await supabase
        .from('departments')
        .update({
          name: input.name,
          is_active: input.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: updatedDepartment => {
      queryClient.setQueryData(
        QUERY_KEYS.departments(companyId || ''),
        (old: Department[] = []) =>
          old.map(dept =>
            dept.id === updatedDepartment.id ? updatedDepartment : dept
          )
      )
      toast.success(
        `Reparto "${updatedDepartment.name}" aggiornato con successo`
      )
    },
    onError: (error: Error) => {
      console.error('Error updating department:', error)
      toast.error(`Errore nell'aggiornamento del reparto: ${error.message}`)
    },
  })

  // Delete department mutation
  const deleteDepartment = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from('departments').delete().eq('id', id)

      if (error) throw error
    },
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(
        QUERY_KEYS.departments(companyId || ''),
        (old: Department[] = []) => old.filter(dept => dept.id !== deletedId)
      )
      toast.success('Reparto eliminato con successo')
    },
    onError: (error: Error) => {
      console.error('Error deleting department:', error)
      toast.error(`Errore nell'eliminazione del reparto: ${error.message}`)
    },
  })

  // Toggle department active status
  const toggleDepartmentStatus = useMutation({
    mutationFn: async ({
      id,
      isActive,
    }: {
      id: string
      isActive: boolean
    }): Promise<Department> => {
      const { data, error } = await supabase
        .from('departments')
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: updatedDepartment => {
      queryClient.setQueryData(
        QUERY_KEYS.departments(companyId || ''),
        (old: Department[] = []) =>
          old.map(dept =>
            dept.id === updatedDepartment.id ? updatedDepartment : dept
          )
      )
      const status = updatedDepartment.is_active ? 'attivato' : 'disattivato'
      toast.success(
        `Reparto "${updatedDepartment.name}" ${status} con successo`
      )
    },
    onError: (error: Error) => {
      console.error('Error toggling department status:', error)
      toast.error(`Errore nel cambio stato del reparto: ${error.message}`)
    },
  })

  // Create preset departments
  const createPresetDepartments = useMutation({
    mutationFn: async (): Promise<Department[]> => {
      if (!companyId) throw new Error('Company ID not found')

      const presetDepartments = [
        { name: 'Bancone' },
        { name: 'Sala' },
        { name: 'Magazzino' },
        { name: 'Cucina' },
      ]

      const { data, error } = await supabase
        .from('departments')
        .insert(
          presetDepartments.map(dept => ({
            company_id: companyId,
            name: dept.name,
            is_active: true,
          }))
        )
        .select()

      if (error) throw error
      return data || []
    },
    onSuccess: newDepartments => {
      queryClient.setQueryData(
        QUERY_KEYS.departments(companyId || ''),
        (old: Department[] = []) => [...old, ...newDepartments]
      )
      toast.success(
        `${newDepartments.length} reparti predefiniti creati con successo`
      )
    },
    onError: (error: Error) => {
      console.error('Error creating preset departments:', error)
      toast.error(
        `Errore nella creazione dei reparti predefiniti: ${error.message}`
      )
    },
  })

  // Statistics
  const stats = {
    total: departments.length,
    active: departments.filter(dept => dept.is_active).length,
    inactive: departments.filter(dept => !dept.is_active).length,
  }

  return {
    // Data
    departments,
    stats,

    // Loading states
    isLoading,
    isCreating: createDepartment.isPending,
    isUpdating: updateDepartment.isPending,
    isDeleting: deleteDepartment.isPending,
    isToggling: toggleDepartmentStatus.isPending,
    isCreatingPresets: createPresetDepartments.isPending,

    // Error states
    error,
    createError: createDepartment.error,
    updateError: updateDepartment.error,
    deleteError: deleteDepartment.error,

    // Actions
    createDepartment: createDepartment.mutate,
    updateDepartment: updateDepartment.mutate,
    deleteDepartment: deleteDepartment.mutate,
    toggleDepartmentStatus: toggleDepartmentStatus.mutate,
    createPresetDepartments: createPresetDepartments.mutate,
    refetch,

    // Utils
    getDepartmentById: (id: string) => departments.find(dept => dept.id === id),
    getDepartmentsByStatus: (isActive: boolean) =>
      departments.filter(dept => dept.is_active === isActive),
  }
}

export default useDepartments
