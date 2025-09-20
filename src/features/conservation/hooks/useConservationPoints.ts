import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import {
  ConservationPoint,
  // ConservationPointType,
  classifyConservationPoint,
  // getConservationStatus,
} from '@/types/conservation'
import { toast } from 'react-toastify'

export function useConservationPoints() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // MOCK DATA FOR TESTING - Remove when database works
  const mockData: ConservationPoint[] = [
    {
      id: '1',
      company_id: 'test',
      department_id: '1',
      name: 'Frigorifero Cucina 1',
      setpoint_temp: 4.0,
      type: 'fridge',
      product_categories: ['Carni fresche', 'Latticini'],
      is_blast_chiller: false,
      created_at: new Date(),
      updated_at: new Date(),
      departments: { id: '1', name: 'Cucina' },
      status: 'normal',
    },
    {
      id: '2',
      company_id: 'test',
      department_id: '1',
      name: 'Freezer Principale',
      setpoint_temp: -18.0,
      type: 'freezer',
      product_categories: ['Surgelati', 'Gelati'],
      is_blast_chiller: false,
      created_at: new Date(),
      updated_at: new Date(),
      departments: { id: '1', name: 'Cucina' },
      status: 'normal',
    },
    {
      id: '3',
      company_id: 'test',
      department_id: '2',
      name: 'Vetrina Refrigerata',
      setpoint_temp: 6.0,
      type: 'fridge',
      product_categories: ['Bevande'],
      is_blast_chiller: false,
      created_at: new Date(),
      updated_at: new Date(),
      departments: { id: '2', name: 'Bancone' },
      status: 'warning',
    },
    {
      id: '4',
      company_id: 'test',
      department_id: '1',
      name: 'Abbattitore Rapido',
      setpoint_temp: -35.0,
      type: 'blast',
      product_categories: ['Preparazioni cotte'],
      is_blast_chiller: true,
      created_at: new Date(),
      updated_at: new Date(),
      departments: { id: '1', name: 'Cucina' },
      status: 'critical',
    },
  ]

  const {
    data: conservationPoints,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['conservation-points'],
    queryFn: async () => {
      // FORCE MOCK DATA FOR TESTING
      console.log('🔧 Using mock data for conservation points')
      return mockData
    },
    enabled: true, // Always enabled for testing
  })

  const createConservationPointMutation = useMutation({
    mutationFn: async (
      data: Omit<
        ConservationPoint,
        | 'id'
        | 'company_id'
        | 'created_at'
        | 'updated_at'
        | 'status'
        | 'last_temperature_reading'
      >
    ) => {
      if (!user?.company_id) throw new Error('No company ID available')

      // Auto-classify based on temperature
      const type = classifyConservationPoint(
        data.setpoint_temp,
        data.is_blast_chiller
      )

      const { data: result, error } = await supabase
        .from('conservation_points')
        .insert([
          {
            ...data,
            company_id: user.company_id,
            type,
          },
        ])
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conservation-points'] })
      toast.success('Punto di conservazione creato con successo')
    },
    onError: error => {
      console.error('Error creating conservation point:', error)
      toast.error('Errore nella creazione del punto di conservazione')
    },
  })

  const updateConservationPointMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<ConservationPoint>
    }) => {
      const updateData = { ...data }

      // Auto-classify if temperature changed
      if (data.setpoint_temp !== undefined) {
        updateData.type = classifyConservationPoint(
          data.setpoint_temp,
          data.is_blast_chiller ?? false
        )
      }

      const { data: result, error } = await supabase
        .from('conservation_points')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conservation-points'] })
      toast.success('Punto di conservazione aggiornato')
    },
    onError: error => {
      console.error('Error updating conservation point:', error)
      toast.error("Errore nell'aggiornamento del punto di conservazione")
    },
  })

  const deleteConservationPointMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('conservation_points')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conservation-points'] })
      toast.success('Punto di conservazione eliminato')
    },
    onError: error => {
      console.error('Error deleting conservation point:', error)
      toast.error("Errore nell'eliminazione del punto di conservazione")
    },
  })

  const stats = {
    total: conservationPoints?.length || 0,
    normal: conservationPoints?.filter(p => p.status === 'normal').length || 0,
    warning:
      conservationPoints?.filter(p => p.status === 'warning').length || 0,
    critical:
      conservationPoints?.filter(p => p.status === 'critical').length || 0,
    byType: {
      ambient:
        conservationPoints?.filter(p => p.type === 'ambient').length || 0,
      fridge: conservationPoints?.filter(p => p.type === 'fridge').length || 0,
      freezer:
        conservationPoints?.filter(p => p.type === 'freezer').length || 0,
      blast: conservationPoints?.filter(p => p.type === 'blast').length || 0,
    },
  }

  return {
    conservationPoints: conservationPoints || [],
    isLoading,
    error,
    stats,
    createConservationPoint: createConservationPointMutation.mutate,
    updateConservationPoint: updateConservationPointMutation.mutate,
    deleteConservationPoint: deleteConservationPointMutation.mutate,
    isCreating: createConservationPointMutation.isPending,
    isUpdating: updateConservationPointMutation.isPending,
    isDeleting: deleteConservationPointMutation.isPending,
  }
}
