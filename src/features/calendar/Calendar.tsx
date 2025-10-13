import React, { useState, useRef, useCallback, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import multiMonthPlugin from '@fullcalendar/multimonth'
import {
  CalendarEvent,
  CalendarViewConfig,
  CompanyCalendarSettings,
} from '@/types/calendar'
import { transformToFullCalendarEvents } from './utils/eventTransform'
import { EventDetailsModal } from './EventDetailsModal'
import QuickActions from './components/QuickActions'
import MacroCategoryModal from './components/MacroCategoryModal'
import { CalendarEventLegend } from './components/CalendarEventLegend'
import { Calendar as CalendarIcon, Plus } from 'lucide-react'
import { useMacroCategoryEvents, type MacroCategory } from './hooks/useMacroCategoryEvents'
import './calendar-custom.css' // ✅ Import stili personalizzati calendario

interface CalendarProps {
  events: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
  onEventCreate?: (event: Partial<CalendarEvent>) => void
  onEventUpdate?: (event: CalendarEvent) => void
  onEventDelete?: (eventId: string) => void
  onDateSelect?: (start: Date, end: Date) => void
  onDateClick?: (date: Date) => void
  config?: Partial<CalendarViewConfig>
  currentView?: 'year' | 'month' | 'week' | 'day'
  loading?: boolean
  error?: string | null
  useMacroCategories?: boolean
  calendarSettings?: CompanyCalendarSettings | null
  eventSources?: {
    maintenance?: number
    temperatureChecks?: number
    haccpExpiry?: number
    productExpiry?: number
    haccpDeadlines?: number
    genericTasks?: number
  }
  filters?: React.ReactNode
}

const defaultConfig: CalendarViewConfig = {
  defaultView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
  },
  height: 'auto',
  locale: 'it',
  firstDay: 1, // Monday
  slotMinTime: '06:00:00',
  slotMaxTime: '24:00:00',
  businessHours: {
    daysOfWeek: [1, 2, 3, 4, 5, 6], // Monday - Saturday
    startTime: '08:00',
    endTime: '22:00',
  },
  notifications: {
    enabled: true,
    defaultTimings: ['minutes_before', 'hours_before'],
  },
  colorScheme: {
    maintenance: '#F59E0B',
    task: '#3B82F6',
    training: '#10B981',
    inventory: '#8B5CF6',
    meeting: '#EF4444',
    temperature_reading: '#06B6D4',
    general_task: '#84CC16',
    custom: '#F97316',
  },
}

export const Calendar: React.FC<CalendarProps> = ({
  events,
  onEventClick,
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  onDateSelect,
  onDateClick,
  config = {},
  currentView,
  loading = false,
  error = null,
  useMacroCategories = false,
  calendarSettings = null,
  eventSources,
  filters,
}) => {
  // ✅ Debug: Log quando events cambiano
  // console.log('📅 Calendar received events:', {
  //   count: events?.length || 0,
  //   sample: events?.slice(0, 2).map(e => ({ title: e.title, type: e.type }))
  // })
  
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedMacroCategory, setSelectedMacroCategory] = useState<{
    category: MacroCategory
    date: Date
    items: any[]
  } | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null) // ✅ Traccia giorno selezionato

  const { events: macroCategoryEvents } = useMacroCategoryEvents(
    calendarSettings?.fiscal_year_end ? new Date(calendarSettings.fiscal_year_end) : undefined
  )

  const calendarRef = useRef<FullCalendar>(null)
  const finalConfig = { ...defaultConfig, ...config }

  const calendarView = currentView === 'year'
    ? 'multiMonthYear'
    : currentView === 'month'
      ? 'dayGridMonth'
      : currentView === 'week'
        ? 'timeGridWeek'
        : currentView === 'day'
          ? 'timeGridDay'
          : finalConfig.defaultView

  const getCategoryLabel = (category: MacroCategory): string => {
    const labels = {
      maintenance: 'Manutenzioni',
      generic_tasks: 'Mansioni/Attività',
      product_expiry: 'Scadenze Prodotti',
    }
    return labels[category]
  }

  const getCategoryColor = (category: MacroCategory) => {
    const colors = {
      maintenance: { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E' },
      generic_tasks: { bg: '#D1FAE5', border: '#10B981', text: '#065F46' },
      product_expiry: { bg: '#FECACA', border: '#EF4444', text: '#991B1B' },
    }
    return colors[category]
  }

  const fullCalendarEvents = useMacroCategories
    ? macroCategoryEvents.map(event => {
        return {
          id: `macro-${event.category}-${event.date}`,
          title: getCategoryLabel(event.category),
          start: event.date,
          allDay: true,
          backgroundColor: getCategoryColor(event.category).bg,
          borderColor: getCategoryColor(event.category).border,
          textColor: getCategoryColor(event.category).text,
          extendedProps: {
            type: 'macro_category',
            category: event.category,
            count: event.count,
            items: event.items,
          },
        }
      })
    : transformToFullCalendarEvents(events)

  // ✅ Debug: Log eventi trasformati per FullCalendar
  // console.log('📅 FullCalendarEvents for FullCalendar:', {
  //   count: fullCalendarEvents.length,
  //   sample: fullCalendarEvents.slice(0, 3).map(e => ({
  //     title: e.title,
  //     type: e.extendedProps?.type || 'unknown'
  //   }))
  // })

  // ✅ Forza refresh del calendario quando events cambiano
  useEffect(() => {
    if (calendarRef.current) {
      // console.log('🔄 Forcing calendar refresh with new events:', {
      //   originalEvents: events.length,
      //   transformedEvents: fullCalendarEvents.length
      // })
      try {
        const api = calendarRef.current.getApi()
        // Prova diversi metodi di refresh
        api.refetchEvents()
        api.render()
        // console.log('✅ Calendar refresh methods called')
      } catch (error) {
        console.warn('⚠️ Calendar API not ready yet:', error)
      }
    }
  }, [events, fullCalendarEvents])

  const handleEventClick = useCallback(
    (clickInfo: { event: { extendedProps?: { originalEvent?: any; type?: string; category?: MacroCategory; items?: any[] }; start: Date | null } }) => {
      if (useMacroCategories && clickInfo.event.extendedProps?.type === 'macro_category') {
        const { category, items } = clickInfo.event.extendedProps
        const date = clickInfo.event.start ? new Date(clickInfo.event.start) : new Date()
        setSelectedMacroCategory({ category, date, items: items || [] })
      } else {
        const originalEvent = clickInfo.event.extendedProps?.originalEvent
        if (originalEvent) {
          setSelectedEvent(originalEvent)
          setShowEventModal(true)
          onEventClick?.(originalEvent)
        }
      }
    },
    [onEventClick, useMacroCategories]
  )

  // Handle date selection for new events
  const handleDateSelect = useCallback(
    (selectInfo: { start: Date; end: Date }) => {
      const start = new Date(selectInfo.start)
      const end = new Date(selectInfo.end)
      
      // ✅ Aggiorna giorno selezionato
      setSelectedDate(start)
      
      onDateSelect?.(start, end)
    },
    [onDateSelect]
  )

  // ✅ Handle click su giorno (per evidenziare il giorno selezionato)
  const handleDayClick = useCallback((info: { date: Date; dayEl: HTMLElement }) => {
    // Rimuovi classe da tutti i giorni in tutte le visualizzazioni
    const allDayGridDays = document.querySelectorAll('.fc-daygrid-day')
    const allTimeGridCols = document.querySelectorAll('.fc-timegrid-col')
    const allListDays = document.querySelectorAll('.fc-list-day')

    allDayGridDays.forEach(day => day.classList.remove('fc-day-selected'))
    allTimeGridCols.forEach(col => col.classList.remove('fc-day-selected'))
    allListDays.forEach(day => day.classList.remove('fc-day-selected'))

    // Aggiungi classe al giorno cliccato
    info.dayEl.classList.add('fc-day-selected')
    setSelectedDate(info.date)

    if (onDateClick) {
      onDateClick(info.date)
    }
  }, [onDateClick])

  // Handle event drag and drop
  const handleEventDrop = useCallback(
    (dropInfo: { event: { extendedProps?: { originalEvent?: any }; start: Date | null; end?: Date | null } }) => {
      const originalEvent = dropInfo.event.extendedProps?.originalEvent
      if (originalEvent && onEventUpdate) {
        const updatedEvent: CalendarEvent = {
          ...originalEvent,
          start: dropInfo.event.start ? new Date(dropInfo.event.start) : new Date(),
          end: dropInfo.event.end ? new Date(dropInfo.event.end) : undefined,
          updated_at: new Date(),
        }
        onEventUpdate(updatedEvent)
      }
    },
    [onEventUpdate]
  )

  // Handle event resize
  const handleEventResize = useCallback(
    (resizeInfo: { event: { extendedProps?: { originalEvent?: any }; start: Date | null; end?: Date | null } }) => {
      const originalEvent = resizeInfo.event.extendedProps?.originalEvent
      if (originalEvent && onEventUpdate) {
        const updatedEvent: CalendarEvent = {
          ...originalEvent,
          start: resizeInfo.event.start ? new Date(resizeInfo.event.start) : new Date(),
          end: resizeInfo.event.end ? new Date(resizeInfo.event.end) : undefined,
          updated_at: new Date(),
        }
        onEventUpdate(updatedEvent)
      }
    },
    [onEventUpdate]
  )

  // Calendar toolbar buttons
  const customButtons = {
    addEvent: {
      text: 'Nuovo',
      click: () => {
        if (onEventCreate) {
          const now = new Date()
          onEventCreate({
            start: now,
            end: new Date(now.getTime() + 60 * 60 * 1000), // +1 hour
            allDay: false,
          })
        }
      },
    },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white rounded-lg border border-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento calendario...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-white rounded-lg border border-red-200">
        <div className="text-center">
          <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
            <CalendarIcon className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Errore nel caricamento del calendario
          </h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Calendar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Calendario Aziendale
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            {/* Filtri gestiti da CalendarPage tramite HorizontalCalendarFilters */}

            {onEventCreate && (
              <button
                onClick={() => {
                  const now = new Date()
                  onEventCreate({
                    start: now,
                    end: new Date(now.getTime() + 60 * 60 * 1000),
                    allDay: false,
                  })
                }}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuovo Evento
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filtri */}
      {filters && (
        <div className="px-4 py-3 border-b border-gray-200">
          {filters}
        </div>
      )}

      {/* Legenda */}
      <div className="px-4 py-3 border-b border-gray-200">
        <CalendarEventLegend sources={eventSources || {}} compact={true} />
      </div>

      {/* Calendar Content */}
      <div className="p-4">
        <div className="calendar-container">
          <FullCalendar
            ref={calendarRef}
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              listPlugin,
              multiMonthPlugin,
            ]}
            initialView={calendarView}
            key={calendarView}
            headerToolbar={finalConfig.headerToolbar}
            customButtons={customButtons}
            height={finalConfig.height}
            locale={finalConfig.locale}
            firstDay={finalConfig.firstDay}
            slotMinTime={finalConfig.slotMinTime}
            slotMaxTime={finalConfig.slotMaxTime}
            businessHours={calendarSettings?.is_configured ? {
              daysOfWeek: calendarSettings.open_weekdays,
              startTime: '00:00',
              endTime: '23:59',
            } : finalConfig.businessHours}
            events={fullCalendarEvents}
            eventClick={handleEventClick}
            select={handleDateSelect}
            dateClick={handleDayClick}
            dayCellDidMount={(arg) => {
              if (!calendarSettings?.is_configured) return

              const date = new Date(arg.date)
              const dateString = date.toISOString().split('T')[0]
              const dayOfWeek = date.getDay()

              const isClosureDate = calendarSettings.closure_dates.includes(dateString)

              if (isClosureDate) {
                arg.el.classList.add('fc-day-closed')

                const beachIcon = document.createElement('div')
                beachIcon.className = 'fc-day-beach-icon'
                beachIcon.innerHTML = '🏖️'
                arg.el.querySelector('.fc-daygrid-day-frame')?.appendChild(beachIcon)
              }
            }}
            dayHeaderDidMount={(arg) => {
              if (!calendarSettings?.is_configured) return

              const dayOfWeek = arg.dow
              const hours = calendarSettings.business_hours[dayOfWeek.toString()]

              if (hours && hours.length > 0) {
                const hoursText = hours.map(h => `${h.open}-${h.close}`).join(' · ')
                const hoursEl = document.createElement('div')
                hoursEl.className = 'fc-col-header-hours'
                hoursEl.textContent = hoursText
                arg.el.appendChild(hoursEl)
              }
            }}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            selectable={true}
            editable={true}
            dayMaxEvents={3}
            moreLinkClick="popover"
            nowIndicator={true}
            weekNumbers={false}
            eventDisplay="block"
            displayEventTime={true}
            allDaySlot={true}
            slotEventOverlap={false}
            eventOverlap={false}
            selectMirror={true}
            unselectAuto={true}
            eventResizableFromStart={true}
            eventDurationEditable={true}
            eventStartEditable={true}
            // Custom styling
            eventClassNames={arg => {
              const extendedProps = arg.event.extendedProps
              if (extendedProps) {
                return [
                  `event-type-${extendedProps.type}`,
                  `event-status-${extendedProps.status}`,
                  `event-priority-${extendedProps.priority}`,
                ]
              }
              return []
            }}
            eventContent={arg => {
              const { event } = arg
              const extendedProps = event.extendedProps

              if (useMacroCategories && extendedProps?.type === 'macro_category') {
                if (extendedProps.count === 0) {
                  return (
                    <div className="fc-event-content-custom fc-event-all-completed">
                      <span className="fc-event-checkmark">✓</span>
                    </div>
                  )
                }
                return (
                  <div className="fc-event-content-custom">
                    <div className="fc-event-title-container">
                      <span className="fc-event-type-icon">
                        {extendedProps.category === 'maintenance' && '🔧'}
                        {extendedProps.category === 'generic_tasks' && '📋'}
                        {extendedProps.category === 'product_expiry' && '📦'}
                      </span>
                      <span className="fc-event-title">{event.title}</span>
                      <span className="fc-event-count-badge">({extendedProps.count})</span>
                    </div>
                  </div>
                )
              }

              return (
                <div className="fc-event-content-custom">
                  <div className="fc-event-title-container">
                    {extendedProps?.type && (
                      <span className="fc-event-type-icon">
                        {extendedProps.type === 'maintenance' && '🔧'}
                        {extendedProps.type === 'general_task' && '📋'}
                        {extendedProps.type === 'temperature_reading' && '🌡️'}
                        {extendedProps.type === 'custom' && '📌'}
                      </span>
                    )}
                    <span className="fc-event-title">{event.title}</span>
                  </div>
                  {extendedProps?.priority === 'critical' && (
                    <span className="fc-event-priority-indicator">🔴</span>
                  )}
                </div>
              )
            }}
          />
        </div>
      </div>

      {/* Event Modal */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => {
            setShowEventModal(false)
            setSelectedEvent(null)
          }}
          onUpdate={(data) => {
            if (onEventUpdate) {
              onEventUpdate({
                ...selectedEvent,
                ...data.updates,
              })
            }
          }}
          onDelete={(eventId) => {
            if (onEventDelete) {
              onEventDelete(eventId)
            }
            setShowEventModal(false)
            setSelectedEvent(null)
          }}
          selectedDate={selectedDate || undefined}
        />
      )}

      {/* Quick Actions for selected events */}
      {selectedEvent && onEventUpdate && (
        <QuickActions
          event={selectedEvent}
          onUpdate={onEventUpdate}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {/* Macro Category Modal */}
      {useMacroCategories && selectedMacroCategory && (
        <MacroCategoryModal
          isOpen={true}
          onClose={() => setSelectedMacroCategory(null)}
          category={selectedMacroCategory.category}
          items={selectedMacroCategory.items}
          date={selectedMacroCategory.date}
        />
      )}

      {/* Calendar Styles */}
      <style>{`
        .calendar-container {
          --fc-border-color: #e5e7eb;
          --fc-button-bg-color: #3b82f6;
          --fc-button-border-color: #3b82f6;
          --fc-button-hover-bg-color: #2563eb;
          --fc-button-hover-border-color: #2563eb;
          --fc-button-active-bg-color: #1d4ed8;
          --fc-button-active-border-color: #1d4ed8;
          --fc-today-bg-color: #eff6ff;
        }

        /* ============================================
           NUOVO STILE: Icona grande + Nome + Conteggio
           Senza strisce colorate
           ============================================ */
        
        /* Rimuovi colori di sfondo e bordi dagli eventi */
        .fc-event {
          background-color: transparent !important;
          border: none !important;
          box-shadow: none !important;
          border-bottom: 1px solid #e5e7eb !important; /* Griglia leggera tra eventi */
          margin-bottom: 2px;
        }

        /* Ultimo evento senza riga */
        .fc-event:last-child {
          border-bottom: none !important;
        }

        .fc-event-content-custom {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px 6px;
          background-color: transparent !important;
          border: none !important;
          min-height: 28px;
        }

        .fc-event-title-container {
          display: flex;
          align-items: center;
          gap: 6px;
          width: 100%;
          justify-content: center;
        }

        .fc-event-type-icon {
          font-size: 18px;
          flex-shrink: 0;
          line-height: 1;
        }

        .fc-event-title {
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 120px;
        }

        .fc-event-count-badge {
          font-size: 13px;
          font-weight: 700;
          color: #1f2937;
          background-color: rgba(255, 255, 255, 0.95);
          border-radius: 12px;
          padding: 2px 8px;
          min-width: 20px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
          border: 1px solid #e5e7eb;
        }

        .fc-event-priority-indicator {
          display: none; /* Nascondi l'indicatore di priorità */
        }

        .fc-event-all-completed {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          background-color: transparent !important;
          border: none !important;
        }

        .fc-event-checkmark {
          font-size: 22px;
          font-weight: bold;
          color: #10b981;
        }

        /* Event type styling - DISABILITATO (niente più colori di sfondo)
        .event-type-maintenance,
        .event-type-general_task,
        .event-type-temperature_reading,
        .event-type-custom {
          background-color: transparent !important;
          border: none !important;
        }
        */

        /* Status styling - Manteniamo solo gli stili per completati e in ritardo */
        .event-status-completed .fc-event-title {
          opacity: 0.6;
          text-decoration: line-through;
        }

        .event-status-overdue .fc-event-type-icon {
          animation: pulse 2s infinite;
        }

        .event-status-cancelled .fc-event-title {
          opacity: 0.4;
          text-decoration: line-through;
        }

        /* Priority styling - Evidenziamo solo le priorità critiche con l'icona */
        .event-priority-critical .fc-event-count-badge {
          background-color: #fecaca !important;
          border-color: #ef4444 !important;
          color: #991b1b !important;
          font-weight: 800;
        }

        /* Macro category styling - anche qui niente colori di sfondo */
        .event-type-macro_category {
          cursor: pointer;
          font-weight: 600;
        }

        .event-type-macro_category .fc-event-type-icon {
          font-size: 20px; /* Icona leggermente più grande per macro-categorie */
        }

        /* Day closed styling */
        .fc-day-closed {
          background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%) !important;
          position: relative;
          opacity: 1 !important;
        }

        .fc-day-closed::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image:
            radial-gradient(circle at 20% 80%, rgba(251, 191, 36, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(96, 165, 250, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }

        /* Beach icon for closed days */
        .fc-day-beach-icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 48px;
          opacity: 0.6;
          pointer-events: none;
          z-index: 1;
        }

        /* Business hours in column header */
        .fc-col-header-hours {
          font-size: 13px;
          color: #1e40af;
          text-align: center;
          font-weight: 700;
          white-space: normal;
          padding: 6px 8px;
          background-color: rgba(59, 130, 246, 0.12);
          border-radius: 6px;
          margin-top: 8px;
          line-height: 1.4;
          display: block;
          word-break: break-word;
          letter-spacing: 0.3px;
        }

        .fc-col-header-cell {
          vertical-align: top !important;
          padding-bottom: 8px !important;
        }

        .fc-col-header-cell-cushion {
          padding: 4px 2px !important;
        }

        .fc-daygrid-day-top {
          flex-direction: column !important;
          align-items: stretch !important;
          padding: 2px !important;
        }

        .fc-daygrid-day-number {
          padding: 2px 4px !important;
        }
      `}</style>
    </div>
  )
}

export default Calendar
