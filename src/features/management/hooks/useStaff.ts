import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'

// Staff interfaces
export interface HaccpCertification {
  level: 'base' | 'advanced'
  expiry_date: string
  issuing_authority: string
  certificate_number: string
}

export interface StaffMember {
  id: string
  company_id: string
  name: string
  role: 'admin' | 'responsabile' | 'dipendente' | 'collaboratore'
  category: string
  email?: string | null
  phone?: string | null
  hire_date?: string | null
  status: 'active' | 'inactive' | 'suspended'
  notes?: string | null
  haccp_certification?: HaccpCertification | null
  department_assignments?: string[] | null
  created_at: string
  updated_at: string
}

export interface StaffInput {
  name: string
  role: 'admin' | 'responsabile' | 'dipendente' | 'collaboratore'
  category: string
  email?: string
  phone?: string
  hire_date?: string
  status?: 'active' | 'inactive' | 'suspended'
  notes?: string
  haccp_certification?: HaccpCertification
  department_assignments?: string[]
}

// Staff categories enum
export const STAFF_CATEGORIES = [
  'Amministratore',
  'Banconisti',
  'Cuochi',
  'Camerieri',
  'Social & Media Manager',
  'Addetto alle Pulizie',
  'Magazziniere',
  'Altro',
] as const

export type StaffCategory = (typeof STAFF_CATEGORIES)[number]

// Query keys
const QUERY_KEYS = {
  staff: (companyId: string) => ['staff', companyId],
  staffMember: (id: string) => ['staffMember', id],
} as const

// Hook for staff management
export const useStaff = () => {
  const { companyId } = useAuth()
  const queryClient = useQueryClient()

  // Fetch all staff members
  const {
    data: staff = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.staff(companyId || ''),
    queryFn: async (): Promise<StaffMember[]> => {
      if (!companyId) throw new Error('Company ID not found')

      console.log('🔗 Supabase: Caricamento staff...')
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('company_id', companyId)
        .order('name', { ascending: true })

      if (error) {
        console.error('❌ Supabase: Errore caricamento staff:', error)
        throw error
      }

      console.log(`✅ Supabase: ${data?.length || 0} membri staff caricati`)
      return data || []
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Create staff member mutation
  const createStaffMember = useMutation({
    mutationFn: async (input: StaffInput): Promise<StaffMember> => {
      if (!companyId) throw new Error('Company ID not found')

      const { data, error } = await supabase
        .from('staff')
        .insert({
          company_id: companyId,
          name: input.name,
          role: input.role,
          category: input.category,
          email: input.email || null,
          phone: input.phone || null,
          hire_date: input.hire_date || null,
          status: input.status || 'active',
          notes: input.notes || null,
          haccp_certification: input.haccp_certification || null,
          department_assignments: input.department_assignments || null,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: newStaffMember => {
      queryClient.setQueryData(
        QUERY_KEYS.staff(companyId || ''),
        (old: StaffMember[] = []) => [...old, newStaffMember]
      )
      toast.success(`Dipendente "${newStaffMember.name}" aggiunto con successo`)
    },
    onError: (error: Error) => {
      console.error('Error creating staff member:', error)
      toast.error(`Errore nell'aggiunta del dipendente: ${error.message}`)
    },
  })

  // Update staff member mutation
  const updateStaffMember = useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string
      input: Partial<StaffInput>
    }): Promise<StaffMember> => {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      }

      // Only include fields that are actually being updated
      if (input.name !== undefined) updateData.name = input.name
      if (input.role !== undefined) updateData.role = input.role
      if (input.category !== undefined) updateData.category = input.category
      if (input.email !== undefined) updateData.email = input.email || null
      if (input.phone !== undefined) updateData.phone = input.phone || null
      if (input.hire_date !== undefined)
        updateData.hire_date = input.hire_date || null
      if (input.status !== undefined) updateData.status = input.status
      if (input.notes !== undefined) updateData.notes = input.notes || null
      if (input.haccp_certification !== undefined)
        updateData.haccp_certification = input.haccp_certification || null
      if (input.department_assignments !== undefined)
        updateData.department_assignments = input.department_assignments || null

      const { data, error } = await supabase
        .from('staff')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: updatedStaffMember => {
      queryClient.setQueryData(
        QUERY_KEYS.staff(companyId || ''),
        (old: StaffMember[] = []) =>
          old.map(member =>
            member.id === updatedStaffMember.id ? updatedStaffMember : member
          )
      )
      toast.success(
        `Dipendente "${updatedStaffMember.name}" aggiornato con successo`
      )
    },
    onError: (error: Error) => {
      console.error('Error updating staff member:', error)
      toast.error(`Errore nell'aggiornamento del dipendente: ${error.message}`)
    },
  })

  // Delete staff member mutation
  const deleteStaffMember = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from('staff').delete().eq('id', id)

      if (error) throw error
    },
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(
        QUERY_KEYS.staff(companyId || ''),
        (old: StaffMember[] = []) =>
          old.filter(member => member.id !== deletedId)
      )
      toast.success('Dipendente rimosso con successo')
    },
    onError: (error: Error) => {
      console.error('Error deleting staff member:', error)
      toast.error(`Errore nella rimozione del dipendente: ${error.message}`)
    },
  })

  // Toggle staff status mutation
  const toggleStaffStatus = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string
      status: 'active' | 'inactive' | 'suspended'
    }): Promise<StaffMember> => {
      const { data, error } = await supabase
        .from('staff')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: updatedStaffMember => {
      queryClient.setQueryData(
        QUERY_KEYS.staff(companyId || ''),
        (old: StaffMember[] = []) =>
          old.map(member =>
            member.id === updatedStaffMember.id ? updatedStaffMember : member
          )
      )
      const statusText = {
        active: 'attivato',
        inactive: 'disattivato',
        suspended: 'sospeso',
      }[updatedStaffMember.status]
      toast.success(
        `Dipendente "${updatedStaffMember.name}" ${statusText} con successo`
      )
    },
    onError: (error: Error) => {
      console.error('Error toggling staff status:', error)
      toast.error(`Errore nel cambio stato del dipendente: ${error.message}`)
    },
  })

  // Update HACCP certification
  const updateHaccpCertification = useMutation({
    mutationFn: async ({
      id,
      certification,
    }: {
      id: string
      certification: HaccpCertification | null
    }): Promise<StaffMember> => {
      const { data, error } = await supabase
        .from('staff')
        .update({
          haccp_certification: certification,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: updatedStaffMember => {
      queryClient.setQueryData(
        QUERY_KEYS.staff(companyId || ''),
        (old: StaffMember[] = []) =>
          old.map(member =>
            member.id === updatedStaffMember.id ? updatedStaffMember : member
          )
      )
      toast.success(
        `Certificazione HACCP aggiornata per "${updatedStaffMember.name}"`
      )
    },
    onError: (error: Error) => {
      console.error('Error updating HACCP certification:', error)
      toast.error(
        `Errore nell'aggiornamento della certificazione HACCP: ${error.message}`
      )
    },
  })

  // Statistics
  const stats = {
    total: staff.length,
    active: staff.filter(member => member.status === 'active').length,
    inactive: staff.filter(member => member.status === 'inactive').length,
    suspended: staff.filter(member => member.status === 'suspended').length,
    byRole: {
      admin: staff.filter(member => member.role === 'admin').length,
      responsabile: staff.filter(member => member.role === 'responsabile')
        .length,
      dipendente: staff.filter(member => member.role === 'dipendente').length,
      collaboratore: staff.filter(member => member.role === 'collaboratore')
        .length,
    },
    byCategory: STAFF_CATEGORIES.reduce(
      (acc, category) => {
        acc[category] = staff.filter(
          member => member.category === category
        ).length
        return acc
      },
      {} as Record<string, number>
    ),
    withHaccpCert: staff.filter(member => member.haccp_certification).length,
    haccpExpiringSoon: staff.filter(member => {
      if (!member.haccp_certification?.expiry_date) return false
      const expiryDate = new Date(member.haccp_certification.expiry_date)
      const now = new Date()
      const thirtyDaysFromNow = new Date(
        now.getTime() + 30 * 24 * 60 * 60 * 1000
      )
      return expiryDate <= thirtyDaysFromNow && expiryDate > now
    }).length,
  }

  return {
    // Data
    staff,
    stats,

    // Loading states
    isLoading,
    isCreating: createStaffMember.isPending,
    isUpdating: updateStaffMember.isPending,
    isDeleting: deleteStaffMember.isPending,
    isToggling: toggleStaffStatus.isPending,
    isUpdatingCertification: updateHaccpCertification.isPending,

    // Error states
    error,
    createError: createStaffMember.error,
    updateError: updateStaffMember.error,
    deleteError: deleteStaffMember.error,

    // Actions
    createStaffMember: createStaffMember.mutate,
    updateStaffMember: updateStaffMember.mutate,
    deleteStaffMember: deleteStaffMember.mutate,
    toggleStaffStatus: toggleStaffStatus.mutate,
    updateHaccpCertification: updateHaccpCertification.mutate,
    refetch,

    // Utils
    getStaffMemberById: (id: string) => staff.find(member => member.id === id),
    getStaffByRole: (role: StaffMember['role']) =>
      staff.filter(member => member.role === role),
    getStaffByCategory: (category: string) =>
      staff.filter(member => member.category === category),
    getStaffByStatus: (status: StaffMember['status']) =>
      staff.filter(member => member.status === status),
    getStaffByDepartment: (departmentId: string) =>
      staff.filter(member =>
        member.department_assignments?.includes(departmentId)
      ),
  }
}

export default useStaff
