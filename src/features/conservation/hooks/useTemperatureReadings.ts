import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { TemperatureReading } from '@/types/conservation'
import { toast } from 'react-toastify'

export function useTemperatureReadings(conservationPointId?: string) {
  const { companyId } = useAuth()
  const queryClient = useQueryClient()


  const {
    data: temperatureReadings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['temperature-readings', companyId, conservationPointId],
    queryFn: async () => {
      if (!companyId) {
        console.warn('⚠️ No company_id available, cannot load temperature readings')
        throw new Error('No company ID available')
      }

      console.log('🔧 Loading temperature readings from Supabase for company:', companyId)

      // ✅ JOIN with conservation_points to enable computed status
      let query = supabase
        .from('temperature_readings')
        .select(`
          *,
          conservation_point:conservation_points(
            id,
            name,
            type,
            setpoint_temp
          )
        `)
        .eq('company_id', companyId)
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
    enabled: !!companyId,
  })

  const createReadingMutation = useMutation({
    mutationFn: async (
      data: Omit<
        TemperatureReading,
        'id' | 'company_id' | 'created_at'
      >
    ) => {
      if (!companyId) throw new Error('No company ID available')

      // Convert recorded_at to ISO string if it's a Date object
      const recordedAtString = data.recorded_at 
        ? (typeof data.recorded_at === 'string' ? data.recorded_at : data.recorded_at.toISOString())
        : new Date().toISOString()

      // Build payload with only database fields (exclude computed/join fields like conservation_point)
      const payload = {
        conservation_point_id: data.conservation_point_id,
        temperature: data.temperature,
        recorded_at: recordedAtString,
        method: data.method,
        notes: data.notes,
        photo_evidence: data.photo_evidence,
        recorded_by: data.recorded_by,
        company_id: companyId,
        // ✅ NOT including conservation_point (join/virtual field - doesn't exist in DB table)
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
      // Convert recorded_at to ISO string if it's a Date object
      const updateData: any = { ...data }
      if (updateData.recorded_at && typeof updateData.recorded_at !== 'string') {
        updateData.recorded_at = updateData.recorded_at.toISOString()
      }
      // Exclude computed/join fields that don't exist in DB
      if ('conservation_point' in updateData) {
        delete updateData.conservation_point
      }

      const { data: result, error } = await supabase
        .from('temperature_readings')
        .update(updateData)
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
      ? temperatureReadings.reduce((sum: number, r: any) => sum + r.temperature, 0) / temperatureReadings.length
      : 0,
    
    // ✅ COMPUTED STATS based on conservation point setpoint
    compliant: temperatureReadings?.filter((r: any) => {
      if (!r.conservation_point) return false
      const tolerance = r.conservation_point.type === 'blast' ? 5 : 
                       r.conservation_point.type === 'ambient' ? 3 : 2
      return Math.abs(r.temperature - r.conservation_point.setpoint_temp) <= tolerance
    }).length || 0,
    
    warning: temperatureReadings?.filter((r: any) => {
      if (!r.conservation_point) return false
      const tolerance = r.conservation_point.type === 'blast' ? 5 : 
                       r.conservation_point.type === 'ambient' ? 3 : 2
      const diff = Math.abs(r.temperature - r.conservation_point.setpoint_temp)
      return diff > tolerance && diff <= tolerance + 2
    }).length || 0,
    
    critical: temperatureReadings?.filter((r: any) => {
      if (!r.conservation_point) return false
      const tolerance = r.conservation_point.type === 'blast' ? 5 : 
                       r.conservation_point.type === 'ambient' ? 3 : 2
      return Math.abs(r.temperature - r.conservation_point.setpoint_temp) > tolerance + 2
    }).length || 0,
    
    // TODO: Add method and validation status tracking when DB schema is updated
  }

  return {
    temperatureReadings: (temperatureReadings || []) as TemperatureReading[],
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
