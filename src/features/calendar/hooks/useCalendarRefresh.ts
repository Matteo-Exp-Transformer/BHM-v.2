import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'

/**
 * Hook per gestire refresh calendario
 * Gestisce refresh manuale, auto-refresh e event listener
 */
export function useCalendarRefresh() {
  const queryClient = useQueryClient()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Funzione refresh manuale
  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    console.log('🔄 Refresh manuale calendario...', new Date().toLocaleTimeString())
    
    try {
      // Invalida tutte le query principali del calendario
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['generic-tasks'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['task-completions'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['calendar-events'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['macro-category-events'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['staff'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['products'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['conservation-points'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['maintenance-completions'], refetchType: 'all' }),
      ])
      
      // Forza re-render del componente
      setRefreshKey(prev => prev + 1)
      
      toast.success('✅ Calendario aggiornato!', { autoClose: 2000 })
    } catch (error) {
      console.error('Errore refresh:', error)
      toast.error('Errore durante l\'aggiornamento')
    } finally {
      setIsRefreshing(false)
    }
  }

  // Listener per refresh trigger da componenti figli (modal)
  useEffect(() => {
    const handleCalendarRefresh = () => {
      console.log('📢 Ricevuto evento calendar-refresh, forzo re-render...')
      setRefreshKey(prev => prev + 1)
    }

    window.addEventListener('calendar-refresh', handleCalendarRefresh)
    
    return () => {
      window.removeEventListener('calendar-refresh', handleCalendarRefresh)
    }
  }, [])

  // Auto-refresh calendario ogni 3 minuti
  useEffect(() => {
    const REFRESH_INTERVAL = 3 * 60 * 1000 // 3 minuti in millisecondi
    
    const intervalId = setInterval(() => {
      console.log('🔄 Auto-refresh calendario...', new Date().toLocaleTimeString())
      handleManualRefresh()
    }, REFRESH_INTERVAL)

    // Cleanup quando il componente viene smontato
    return () => {
      clearInterval(intervalId)
    }
  }, [queryClient])

  // Funzione per triggerare refresh da altri componenti
  const triggerRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  return {
    isRefreshing,
    refreshKey,
    handleManualRefresh,
    triggerRefresh,
  }
}




