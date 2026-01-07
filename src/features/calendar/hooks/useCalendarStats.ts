import { useMemo } from 'react'
import type { CalendarEvent } from '@/types/calendar'

/**
 * Hook per calcolare statistiche calendario
 * Estrae la logica di calcolo eventi oggi, domani, in ritardo, in attesa
 */
export function useCalendarStats(
  viewBasedEvents: CalendarEvent[],
  view: 'year' | 'month' | 'week' | 'day',
  refreshKey: number
) {
  // Eventi di oggi
  const todayEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    return viewBasedEvents.filter(event => {
      if (!event || !event.start || !event.status) return false
      const eventDate = new Date(event.start)
      
      // Per view "giorno", mostra solo eventi di oggi
      if (view === 'day') {
        return eventDate.getTime() === today.getTime() && event.status !== 'completed'
      }
      
      // Per altre view, mostra eventi di oggi nel range della view
      return eventDate >= today && eventDate < tomorrow && event.status !== 'completed'
    })
  }, [viewBasedEvents, view, refreshKey])

  // Eventi in attesa (oggi non completati)
  const eventsInWaiting = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    return viewBasedEvents.filter(event => {
      if (!event || !event.start || !event.status) return false
      const eventDate = new Date(event.start)
      return eventDate >= today && eventDate < tomorrow && event.status !== 'completed'
    })
  }, [viewBasedEvents, refreshKey])

  // Eventi di domani
  const tomorrowEvents = useMemo(() => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    return viewBasedEvents.filter(event => {
      if (!event || !event.start) return false
      const eventDate = new Date(event.start)
      eventDate.setHours(0, 0, 0, 0)
      
      // Eventi di domani: data evento = domani
      return eventDate.getTime() === tomorrow.getTime()
    })
  }, [viewBasedEvents, refreshKey])

  // Eventi in ritardo
  const overdueEvents = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    return viewBasedEvents.filter(event => {
      if (!event || !event.start) return false
      if (event.status === 'completed') return false

      const eventDate = new Date(event.start)
      eventDate.setHours(0, 0, 0, 0)

      // Eventi in ritardo: data evento < oggi
      return eventDate < now
    })
  }, [viewBasedEvents, refreshKey])

  return {
    todayEvents,
    tomorrowEvents,
    overdueEvents,
    eventsInWaiting,
  }
}




