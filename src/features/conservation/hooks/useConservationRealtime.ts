import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'

/**
 * Hook per attivare gli aggiornamenti real-time sulla pagina Conservation
 *
 * Ascolta cambiamenti su:
 * - temperature_readings: quando qualcuno rileva una temperatura
 * - maintenance_completions: quando qualcuno completa una manutenzione
 * - maintenance_tasks: quando lo status di un task cambia
 *
 * Quando riceve un evento, invalida le query React Query per forzare
 * il refresh automatico della UI.
 */
export function useConservationRealtime() {
  const { companyId } = useAuth()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!companyId) return

    console.log('🔄 Attivando real-time per conservation (company:', companyId, ')')

    // 1. Subscription su temperature_readings
    const temperatureChannel = supabase
      .channel('temperature-readings-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'temperature_readings',
          filter: `company_id=eq.${companyId}`,
        },
        payload => {
          console.log('🌡️ Temperatura aggiornata (real-time):', payload.eventType)

          // Invalida le query per forzare refresh
          queryClient.invalidateQueries({ queryKey: ['conservation-points'] })
          queryClient.invalidateQueries({ queryKey: ['temperature-readings'] })
        }
      )
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time temperature_readings attivo')
        }
      })

    // 2. Subscription su maintenance_completions
    // Quando Mario completa una manutenzione, Luca riceve l'evento
    const maintenanceCompletionsChannel = supabase
      .channel('maintenance-completions-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT', // Solo INSERT (nuovi completamenti)
          schema: 'public',
          table: 'maintenance_completions',
          filter: `company_id=eq.${companyId}`,
        },
        payload => {
          console.log('✅ Manutenzione completata (real-time):', payload.new)

          // Invalida le query per far riapparire i task aggiornati
          queryClient.invalidateQueries({ queryKey: ['conservation-points'] })
          queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'] })
          queryClient.invalidateQueries({ queryKey: ['maintenance-tasks-critical'] })

          // Optional: toast notification
          // toast.info('Manutenzione completata da un collaboratore')
        }
      )
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time maintenance_completions attivo')
        }
      })

    // 3. Subscription su maintenance_tasks
    // Per catturare anche modifiche dirette ai task (es. cambio status, next_due)
    const maintenanceTasksChannel = supabase
      .channel('maintenance-tasks-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'maintenance_tasks',
          filter: `company_id=eq.${companyId}`,
        },
        payload => {
          console.log('🔄 Task manutenzione aggiornato (real-time):', payload.new)

          queryClient.invalidateQueries({ queryKey: ['conservation-points'] })
          queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'] })
          queryClient.invalidateQueries({ queryKey: ['maintenance-tasks-critical'] })
        }
      )
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time maintenance_tasks attivo')
        }
      })

    // Cleanup: unsubscribe quando il componente viene smontato
    return () => {
      console.log('🔌 Disattivando real-time per conservation')
      temperatureChannel.unsubscribe()
      maintenanceCompletionsChannel.unsubscribe()
      maintenanceTasksChannel.unsubscribe()
    }
  }, [companyId, queryClient])
}
