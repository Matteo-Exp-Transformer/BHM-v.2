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

      // Prepare conservation point data for insert
      // Remove readonly/relation fields that shouldn't be inserted
      const { maintenance_tasks, department, maintenance_due, ...pointData } = conservationPoint
      
      const pointInsertData = {
        ...pointData,
        company_id: companyId,
        type: typeClassification,
        // Convert Date to ISO string if present
        maintenance_due: maintenance_due ? maintenance_due.toISOString() : null,
        // Ensure department_id is string or null (not undefined)
        department_id: conservationPoint.department_id || null,
      }

      // Create conservation point
      const { data: pointResult, error: pointError } = await supabase
        .from('conservation_points')
        .insert(pointInsertData)
        .select()
        .single()

      if (pointError) throw pointError

      // Create maintenance tasks if any
      if (maintenanceTasks.length > 0) {
        const tasksToInsert = maintenanceTasks.map(task => ({
          company_id: companyId,
          conservation_point_id: pointResult.id,
          title: task.title || null,
          type: task.type,
          frequency: task.frequency,
          estimated_duration: task.estimated_duration || 60,
          assigned_to: task.assigned_to || 'role', // Default assignment
          assignment_type: task.assignment_type || (task.assigned_to_role ? 'role' : task.assigned_to_staff_id ? 'staff' : 'role'), // Use passed value or calculate
          assigned_to_role: task.assigned_to_role || null,
          assigned_to_staff_id: task.assigned_to_staff_id || null,
          assigned_to_category: task.assigned_to_category || null,
          priority: task.priority || 'medium',
          next_due: task.next_due ? (task.next_due instanceof Date ? task.next_due.toISOString() : task.next_due) : null,
          status: 'scheduled' as const,
          instructions: task.instructions || [],
        }))

        const { error: tasksError } = await supabase
          .from('maintenance_tasks')
          .insert(tasksToInsert)

        // CRITICAL: Rollback if maintenance tasks creation fails
        if (tasksError) {
          console.error('Error creating maintenance tasks:', tasksError)
          
          // ROLLBACK: Delete the conservation point that was just created
          const { error: deleteError } = await supabase
            .from('conservation_points')
            .delete()
            .eq('id', pointResult.id)
          
          if (deleteError) {
            console.error('CRITICAL: Failed to rollback conservation point:', deleteError)
            // Even if rollback fails, we still throw the original error
          }
          
          throw new Error(
            `Failed to create maintenance tasks: ${tasksError.message}. Conservation point was rolled back.`
          )
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
      // Prepare update data - remove readonly/relation fields
      const { id: _, maintenance_tasks, department, last_temperature_reading, created_at, updated_at, ...updateFields } = data
      
      const updateData: Record<string, unknown> = { ...updateFields }

      // Auto-classify if temperature changed
      if (data.setpoint_temp !== undefined) {
        updateData.type = classifyConservationPoint(
          data.setpoint_temp,
          data.is_blast_chiller ?? false
        )
      }

      // Convert Date to ISO string if maintenance_due is present
      if (data.maintenance_due !== undefined) {
        updateData.maintenance_due = data.maintenance_due instanceof Date 
          ? data.maintenance_due.toISOString() 
          : data.maintenance_due
      }

      // Ensure department_id is string or null (not undefined)
      if ('department_id' in updateData && updateData.department_id === undefined) {
        updateData.department_id = null
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

  // Transform DB data to ConservationPoint format
  const points: ConservationPoint[] = (conservationPoints ?? []).map((point: any) => ({
    ...point,
    maintenance_due: point.maintenance_due ? new Date(point.maintenance_due) : undefined,
    created_at: point.created_at ? new Date(point.created_at) : new Date(),
    updated_at: point.updated_at ? new Date(point.updated_at) : new Date(),
    product_categories: point.product_categories || [],
  }))

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
