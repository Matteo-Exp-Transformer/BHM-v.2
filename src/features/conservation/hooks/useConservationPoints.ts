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
  const { companyId } = useAuth()
  const queryClient = useQueryClient()

  const {
    data: conservationPoints,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['conservation-points', companyId],
    queryFn: async () => {
      if (!companyId) {
        console.warn('⚠️ No company_id available, cannot load conservation points')
        return []
      }

      console.log(
        '🔧 Loading conservation points from Supabase for company:',
        companyId
      )
      const { data, error } = await supabase
        .from('conservation_points')
        .select(
          `
          *,
          department:departments(id, name)
        `
        )
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error loading conservation points:', error)
        throw error
      }

      console.log(
        '✅ Loaded conservation points from Supabase:',
        data?.length || 0
      )
      return data || []
    },
    enabled: !!companyId,
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
      if (!companyId) throw new Error('No company ID available')

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
            company_id: companyId,
            type: typeClassification,
          },
        ])
        .select()
        .single()

      if (pointError) throw pointError

      // Create maintenance tasks if any
      if (maintenanceTasks.length > 0) {
        const tasksToInsert = maintenanceTasks.map(task => ({
          company_id: companyId,
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
