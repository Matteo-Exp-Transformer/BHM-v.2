import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
// import { useAuth } from '@/hooks/useAuth'
import { TemperatureReading } from '@/types/conservation'
import { toast } from 'react-toastify'

export function useTemperatureReadings(conservationPointId?: string) {
  // const { } = useAuth()
  const queryClient = useQueryClient()

  // MOCK DATA FOR TESTING - Remove when database works
  const mockReadings: TemperatureReading[] = [
    {
      id: '1',
      company_id: 'test',
      conservation_point_id: '1',
      temperature: 4.2,
      target_temperature: 4.0,
      tolerance_range: { min: -2.0, max: 2.0 },
      status: 'compliant',
      recorded_by: 'user1',
      recorded_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      method: 'digital_thermometer',
      notes: 'Lettura regolare',
      validation_status: 'validated',
    },
    {
      id: '2',
      company_id: 'test',
      conservation_point_id: '1',
      temperature: 6.5,
      target_temperature: 4.0,
      tolerance_range: { min: -2.0, max: 2.0 },
      status: 'warning',
      recorded_by: 'user2',
      recorded_at: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      method: 'manual',
      notes: 'Temperatura leggermente alta',
      validation_status: 'flagged',
    },
    {
      id: '3',
      company_id: 'test',
      conservation_point_id: '2',
      temperature: -18.1,
      target_temperature: -18.0,
      tolerance_range: { min: -22.0, max: -18.0 },
      status: 'compliant',
      recorded_by: 'user1',
      recorded_at: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      method: 'automatic_sensor',
      notes: 'Sensore automatico',
      validation_status: 'validated',
    },
    {
      id: '4',
      company_id: 'test',
      conservation_point_id: '3',
      temperature: 8.2,
      target_temperature: 6.0,
      tolerance_range: { min: 2.0, max: 6.0 },
      status: 'warning',
      recorded_by: 'user3',
      recorded_at: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      method: 'digital_thermometer',
      notes: 'Vetrina esposta al sole',
      validation_status: 'pending',
    },
    {
      id: '5',
      company_id: 'test',
      conservation_point_id: '4',
      temperature: -32.0,
      target_temperature: -35.0,
      tolerance_range: { min: -42.0, max: -38.0 },
      status: 'critical',
      recorded_by: 'user1',
      recorded_at: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      method: 'manual',
      notes: 'Abbattitore non raggiunge temperatura',
      validation_status: 'flagged',
    },
  ]

  const {
    data: temperatureReadings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['temperature-readings', conservationPointId],
    queryFn: async () => {
      console.log('🔧 Using mock data for temperature readings')
      if (conservationPointId) {
        return mockReadings.filter(
          r => r.conservation_point_id === conservationPointId
        )
      }
      return mockReadings
    },
    enabled: true,
  })

  const createReadingMutation = useMutation({
    mutationFn: async (
      data: Omit<
        TemperatureReading,
        'id' | 'company_id' | 'recorded_at' | 'validation_status'
      >
    ) => {
      // MOCK SAVE FOR TESTING - Remove when database works
      console.log('🔧 Mock saving temperature reading:', data)

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      // Create mock result
      const mockResult = {
        id: `mock-${Date.now()}`,
        company_id: 'test',
        recorded_at: new Date(),
        validation_status: 'pending' as const,
        ...data,
      }

      return mockResult
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

  // Statistics
  const stats = {
    total: temperatureReadings?.length || 0,
    compliant:
      temperatureReadings?.filter(r => r.status === 'compliant').length || 0,
    warning:
      temperatureReadings?.filter(r => r.status === 'warning').length || 0,
    critical:
      temperatureReadings?.filter(r => r.status === 'critical').length || 0,
    byMethod: {
      manual:
        temperatureReadings?.filter(r => r.method === 'manual').length || 0,
      digital_thermometer:
        temperatureReadings?.filter(r => r.method === 'digital_thermometer')
          .length || 0,
      automatic_sensor:
        temperatureReadings?.filter(r => r.method === 'automatic_sensor')
          .length || 0,
    },
    byValidation: {
      pending:
        temperatureReadings?.filter(r => r.validation_status === 'pending')
          .length || 0,
      validated:
        temperatureReadings?.filter(r => r.validation_status === 'validated')
          .length || 0,
      flagged:
        temperatureReadings?.filter(r => r.validation_status === 'flagged')
          .length || 0,
    },
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
