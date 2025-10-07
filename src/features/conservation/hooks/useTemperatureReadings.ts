import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { TemperatureReading } from '@/types/conservation'
import { toast } from 'react-toastify'

export function useTemperatureReadings(conservationPointId?: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()


  const {
    data: temperatureReadings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['temperature-readings', user?.company_id, conservationPointId],
    queryFn: async () => {
      if (!user?.company_id) {
        console.warn('⚠️ No company_id available, cannot load temperature readings')
        throw new Error('No company ID available')
      }

      console.log('🔧 Loading temperature readings from Supabase for company:', user.company_id)

      let query = supabase
        .from('temperature_readings')
        .select('*')
        .eq('company_id', user.company_id)
        .order('recorded_at', { ascending: false })

      if (conservationPointId) {
        query = query.eq('conservation_point_id', conservationPointId)
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ Error loading temperature readings:', error)
        throw error
      }

      console.log('✅ Loaded temperature readings from Supabase:', data?.length || 0)
      return data || []
    },
    enabled: !!user?.company_id,
  })

  const createReadingMutation = useMutation({
    mutationFn: async (
      data: Omit<
        TemperatureReading,
        'id' | 'company_id' | 'created_at'
      >
    ) => {
      if (!user?.company_id) throw new Error('No company ID available')

      const payload = {
        ...data,
        company_id: user.company_id,
        recorded_at: data.recorded_at || new Date().toISOString(),
      }

      const { data: result, error } = await supabase
        .from('temperature_readings')
        .insert([payload])
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating temperature reading:', error)
        throw error
      }

      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['temperature-readings'] })
      queryClient.invalidateQueries({ queryKey: ['conservation-points'] })
      toast.success('Lettura temperatura registrata')
    },
    onError: error => {
      console.error('Error creating temperature reading:', error)
      toast.error('Errore nella registrazione della temperatura')
    },
  })

  const updateReadingMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<TemperatureReading>
    }) => {
      const { data: result, error } = await supabase
        .from('temperature_readings')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['temperature-readings'] })
      toast.success('Lettura aggiornata')
    },
    onError: error => {
      console.error('Error updating temperature reading:', error)
      toast.error("Errore nell'aggiornamento della lettura")
    },
  })

  const deleteReadingMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('temperature_readings')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['temperature-readings'] })
      toast.success('Lettura eliminata')
    },
    onError: error => {
      console.error('Error deleting temperature reading:', error)
      toast.error("Errore nell'eliminazione della lettura")
    },
  })

  // Statistics - simplified to only use fields that exist in DB
  const stats = {
    total: temperatureReadings?.length || 0,
    recent: temperatureReadings?.slice(0, 10) || [],
    averageTemperature: temperatureReadings?.length
      ? temperatureReadings.reduce((sum, r) => sum + r.temperature, 0) / temperatureReadings.length
      : 0,
    // TODO: Add computed compliance stats based on conservation point setpoint_temp
    // TODO: Add method and validation status tracking when DB schema is updated
  }

  return {
    temperatureReadings: temperatureReadings || [],
    isLoading,
    error,
    stats,
    createReading: createReadingMutation.mutate,
    updateReading: updateReadingMutation.mutate,
    deleteReading: deleteReadingMutation.mutate,
    isCreating: createReadingMutation.isPending,
    isUpdating: updateReadingMutation.isPending,
    isDeleting: deleteReadingMutation.isPending,
  }
}
