import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import type { ConservationPoint, ConservationStats } from '@/types/conservation'
import {
  classifyConservationPoint,
  classifyPointStatus,
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
      department: { id: '1', name: 'Cucina' },
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
      department: { id: '1', name: 'Cucina' },
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
      department: { id: '2', name: 'Bancone' },
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
      department: { id: '1', name: 'Cucina' },
      status: 'critical',
    },
  ]

  const {
    data: conservationPoints,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['conservation-points', user?.company_id],
    queryFn: async () => {
      if (!user?.company_id) {
        console.log('🔧 No company_id, using mock data for conservation points')
        return mockData
      }

      console.log(
        '🔧 Loading conservation points from Supabase for company:',
        user.company_id
      )
      const { data, error } = await supabase
        .from('conservation_points')
        .select(
          `
          *,
          department:departments(id, name)
        `
        )
        .eq('company_id', user.company_id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading conservation points:', error)
        // Fallback to mock data if there's an error
        console.log('🔧 Fallback to mock data due to error')
        return mockData
      }

      console.log(
        '✅ Loaded conservation points from Supabase:',
        data?.length || 0
      )
      return data || []
    },
    enabled: !!user, // Only run when user is available
  })

  const createConservationPointMutation = useMutation({
    mutationFn: async ({
      conservationPoint,
      maintenanceTasks,
    }: {
      conservationPoint: Omit<
        ConservationPoint,
        | 'id'
        | 'company_id'
        | 'created_at'
        | 'updated_at'
        | 'status'
        | 'last_temperature_reading'
      >
      maintenanceTasks: any[]
    }) => {
      if (!user?.company_id) throw new Error('No company ID available')

      // Auto-classify based on temperature
      const typeClassification = classifyConservationPoint(
        conservationPoint.setpoint_temp,
        conservationPoint.is_blast_chiller
      )

      // Create conservation point
      const { data: pointResult, error: pointError } = await supabase
        .from('conservation_points')
        .insert([
          {
            ...conservationPoint,
            company_id: user.company_id,
            type: typeClassification,
          },
        ])
        .select()
        .single()

      if (pointError) throw pointError

      // Create maintenance tasks if any
      if (maintenanceTasks.length > 0) {
        const tasksToInsert = maintenanceTasks.map(task => ({
          company_id: user.company_id,
          conservation_point_id: pointResult.id,
          title: task.title,
          type: task.type,
          frequency: task.frequency,
          estimated_duration: task.estimated_duration,
          assigned_to: task.assigned_to,
          priority: task.priority,
          next_due: task.next_due.toISOString(),
          status: 'scheduled',
          instructions: task.instructions,
        }))

        const { error: tasksError } = await supabase
          .from('maintenance_tasks')
          .insert(tasksToInsert)

        if (tasksError) {
          console.error('Error creating maintenance tasks:', tasksError)
          // Don't throw here - the point was created successfully
        }
      }

      return pointResult
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conservation-points'] })
      queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'] })
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

  const points = (conservationPoints ?? []) as ConservationPoint[]

  const initialStatusCount: ConservationStats['by_status'] = {
    normal: 0,
    warning: 0,
    critical: 0,
  }

  const initialTypeCount: ConservationStats['by_type'] = {
    ambient: 0,
    fridge: 0,
    freezer: 0,
    blast: 0,
  }

  const byStatus = points.reduce<ConservationStats['by_status']>(
    (acc, point) => {
      acc[point.status] = (acc[point.status] ?? 0) + 1
      return acc
    },
    initialStatusCount
  )

  const byType = points.reduce<ConservationStats['by_type']>((acc, point) => {
    acc[point.type] = (acc[point.type] ?? 0) + 1
    return acc
  }, initialTypeCount)

  const stats: ConservationStats = {
    total_points: points.length,
    by_status: byStatus,
    by_type: byType,
    temperature_compliance_rate: 0,
    maintenance_compliance_rate: 0,
    alerts_count: points.filter(point => {
      const status = classifyPointStatus(point).status
      return status !== 'normal'
    }).length,
  }

  return {
    conservationPoints: points,
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
