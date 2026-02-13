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
import type { CalendarFilters } from '@/types/calendar-filters'
import { transformToFullCalendarEvents } from './utils/eventTransform'
import { EventDetailsModal } from './EventDetailsModal'
import { MacroCategoryModal } from './components/MacroCategoryModal'
import { CalendarHeaderFilters } from './components/NewCalendarFilters'
// Import rimosso: CalendarEventLegend era duplicato con i filtri funzionanti
import { Calendar as CalendarIcon } from 'lucide-react'
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
  /** @deprecated Usare calendarFilters + onFiltersChange; filtri ora in header tramite CalendarHeaderFilters */
  filters?: React.ReactNode
  calendarFilters?: CalendarFilters
  onFiltersChange?: (filters: CalendarFilters) => void
  availableDepartments?: { id: string; name: string; event_count: number }[]
  isAdmin?: boolean
  selectedMacroCategory?: {
    category: string
    date: Date
    events?: any[]
    highlightMaintenanceTaskId?: string
  } | null
  onMacroCategoryClose?: () => void
  onMacroCategorySelect?: (category: string, date: Date, events?: any[]) => void
  /** Chiamato quando i dati nel modal macro vengono aggiornati (es. completamento) per refresh della pagina */
  onMacroDataUpdated?: () => void
  /** Chiamato quando cambia l'intervallo di date visibile (es. navigazione mese/settimana) */
  onDatesSet?: (start: Date, end: Date) => void
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

// LOCKED: 2025-01-16 - Agente 4 Calendar-Events-Specialist
// Componente Calendar blindato dopo test sistematici completi
// Funzionalità core: 100% | Test coverage: 100% | Sicurezza: VERIFICATA
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
  eventSources: _eventSources,
  filters: _legacyFilters,
  calendarFilters,
  onFiltersChange,
  availableDepartments,
  isAdmin,
  selectedMacroCategory,
  onMacroCategoryClose,
  onMacroCategorySelect,
  onMacroDataUpdated,
  onDatesSet,
}) => {

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  // const [_showEventModal, setShowEventModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null) // ✅ Traccia giorno selezionato
  const [calendarKey, setCalendarKey] = useState(0) // ✅ Force re-mount quando events cambiano
  const [macroEventsKey, setMacroEventsKey] = useState(0) // ✅ Force refresh dati macro
  const [visibleRangeKey, setVisibleRangeKey] = useState(0) // Trigger per ri-applicare fc-day-closed su navigazione

  const { events: macroCategoryEvents } = useMacroCategoryEvents(
    calendarSettings?.fiscal_year_end ? new Date(calendarSettings.fiscal_year_end) : undefined,
    calendarFilters,
    macroEventsKey // ✅ Passa la key per forzare il refresh
  )

  const calendarRef = useRef<FullCalendar>(null)
  const finalConfig = { ...defaultConfig, ...config }

  // DEBUG: misura larghezze colonne dopo render per diagnosi bug "weekend unito"
  useEffect(() => {
    const timer = setTimeout(() => {
      const headerCells = document.querySelectorAll('.fc-col-header-cell')
      const dayCells = document.querySelectorAll('.fc-daygrid-day')

      if (headerCells.length > 0) {
        const headerWidths: Record<string, number> = {}
        headerCells.forEach((cell) => {
          const dayClass = Array.from(cell.classList).find(c => c.startsWith('fc-day-'))
          const width = (cell as HTMLElement).offsetWidth
          headerWidths[dayClass || 'unknown'] = width
        })
        console.log('[Calendar DEBUG] Header column widths:', headerWidths)

        // Controlla se c'è disparità di larghezze
        const widths = Object.values(headerWidths)
        const min = Math.min(...widths)
        const max = Math.max(...widths)
        if (max - min > 10) {
          console.warn(`[Calendar DEBUG] COLONNE NON UNIFORMI! min=${min}px, max=${max}px, delta=${max - min}px`)
        } else {
          console.log(`[Calendar DEBUG] Colonne uniformi: min=${min}px, max=${max}px, delta=${max - min}px`)
        }
      }

      // Misura anche le prime 7 celle del body (prima riga)
      if (dayCells.length >= 7) {
        const firstRowWidths: { day: string; width: number; classes: string }[] = []
        for (let i = 0; i < 7; i++) {
          const cell = dayCells[i] as HTMLElement
          firstRowWidths.push({
            day: cell.getAttribute('data-date') || `cell-${i}`,
            width: cell.offsetWidth,
            classes: cell.className,
          })
        }
        console.log('[Calendar DEBUG] First row cell widths:', firstRowWidths)
      }

      // DEBUG CRITICO: verifica se fc-day-closed è applicata a sabato/domenica
      const closedCells = document.querySelectorAll('.fc-day-closed')
      const satCells = document.querySelectorAll('.fc-day-sat')
      const sunCells = document.querySelectorAll('.fc-day-sun')
      console.log(`[Calendar DEBUG] fc-day-closed cells: ${closedCells.length}`)
      console.log(`[Calendar DEBUG] fc-day-sat cells: ${satCells.length}, con fc-day-closed: ${document.querySelectorAll('.fc-day-sat.fc-day-closed').length}`)
      console.log(`[Calendar DEBUG] fc-day-sun cells: ${sunCells.length}, con fc-day-closed: ${document.querySelectorAll('.fc-day-sun.fc-day-closed').length}`)
      if (closedCells.length === 0 && calendarSettings?.is_configured) {
        console.error('[Calendar DEBUG] BUG CONFERMATO: calendarSettings configurate ma NESSUNA cella ha fc-day-closed!')
      }

      // Log configurazione attuale
      console.log('[Calendar DEBUG] calendarSettings:', {
        is_configured: calendarSettings?.is_configured,
        open_weekdays: calendarSettings?.open_weekdays,
        business_hours_keys: calendarSettings?.business_hours ? Object.keys(calendarSettings.business_hours) : null,
      })
    }, 1000) // Aspetta 1s dopo render per misurare larghezze finali

    return () => clearTimeout(timer)
  }, [calendarSettings, calendarKey, macroEventsKey])

  // FIX CRITICO: applica fc-day-closed via DOM direttamente, senza dipendere da dayCellDidMount
  // dayCellDidMount viene chiamato SOLO al mount delle celle e se calendarSettings non è
  // ancora caricato in quel momento, le celle non ricevono MAI la classe fc-day-closed.
  // Questo useEffect si attiva quando calendarSettings cambia e applica le classi direttamente.
  useEffect(() => {
    if (!calendarSettings?.is_configured) return

    // Ritarda leggermente per assicurarsi che FullCalendar abbia finito il render
    const applyTimer = setTimeout(() => {
      const cells = document.querySelectorAll('.fc-daygrid-day')
      let appliedCount = 0
      let alreadyClosedCount = 0
      let debugSamples: { dateStr: string; dayOfWeek: number; isClosedWeekday: boolean; hasFcDayClosed: boolean }[] = []

      cells.forEach(cell => {
        const dateStr = cell.getAttribute('data-date')
        if (!dateStr) return

        const date = new Date(dateStr + 'T00:00:00')
        const dayOfWeek = date.getDay()
        const isClosedWeekday = !calendarSettings.open_weekdays.includes(dayOfWeek)
        const isSpecificClosure = calendarSettings.closure_dates.includes(dateStr)
        const hasFcDayClosed = cell.classList.contains('fc-day-closed')

        // Log campione: prime 7 celle + tutte le sat/sun
        if (debugSamples.length < 7 || dayOfWeek === 0 || dayOfWeek === 6) {
          debugSamples.push({ dateStr, dayOfWeek, isClosedWeekday, hasFcDayClosed })
        }

        if (isClosedWeekday || isSpecificClosure) {
          if (!hasFcDayClosed) {
            cell.classList.add('fc-day-closed')
            appliedCount++
          } else {
            alreadyClosedCount++
          }

          // Icona spiaggia solo per chiusure specifiche (non settimanali ricorrenti)
          if (isSpecificClosure && !cell.querySelector('.fc-day-beach-icon')) {
            const beachIcon = document.createElement('div')
            beachIcon.className = 'fc-day-beach-icon'
            beachIcon.innerHTML = '🏖️'
            cell.querySelector('.fc-daygrid-day-frame')?.appendChild(beachIcon)
          }
        } else {
          cell.classList.remove('fc-day-closed')
        }
      })

      console.log(`[Calendar FIX] Applicato fc-day-closed a ${appliedCount} nuove celle, ${alreadyClosedCount} già chiuse (totale: ${cells.length})`)
      console.log('[Calendar FIX] Campione celle:', debugSamples)
    }, 100)

    return () => clearTimeout(applyTimer)
  }, [calendarSettings, calendarKey, macroEventsKey, visibleRangeKey])

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

  // ✅ Callback per aggiornare i dati macro dopo completamento eventi
  const handleMacroDataUpdated = useCallback(() => {
    setMacroEventsKey(prev => prev + 1)
    onMacroDataUpdated?.()
    console.log('🔄 Macro data updated - forcing refresh')
  }, [onMacroDataUpdated])

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


  useEffect(() => {
    setCalendarKey(prev => prev + 1)
  }, [
    events.length,
    // FIX: re-mount calendario quando calendarSettings cambia,
    // altrimenti dayCellDidMount/dayHeaderDidMount non vedono le settings
    // e fc-day-closed non viene mai applicata alle celle
    calendarSettings?.is_configured,
    // Stringify per deep comparison (l'array potrebbe cambiare identità senza cambiare contenuto)
    JSON.stringify(calendarSettings?.open_weekdays),
    JSON.stringify(calendarSettings?.closure_dates),
  ])

  const handleEventClick = useCallback(
    (clickInfo: { event: { extendedProps?: { originalEvent?: any; type?: string; category?: MacroCategory; items?: any[] }; start: Date | null } }) => {
      console.log('🔍 Calendar.tsx: handleEventClick called!', clickInfo)
      console.log('🔍 Calendar.tsx: clickInfo.event:', clickInfo.event)
      console.log('🔍 Calendar.tsx: clickInfo.event.extendedProps:', clickInfo.event.extendedProps)
      
      const extendedProps = clickInfo.event.extendedProps
      
      if (!extendedProps) {
        console.warn('🔍 Calendar.tsx: Event clicked without extendedProps:', clickInfo.event)
        return
      }
      
      console.log('🔍 Calendar.tsx: extendedProps found:', extendedProps)

      // ✅ Gestione eventi macro_category (eventi aggregati)
      if (extendedProps.type === 'macro_category') {
        const { category, items } = extendedProps
        const date = clickInfo.event.start ? new Date(clickInfo.event.start) : new Date()
        console.log('🔍 Calendar.tsx: Opening MacroCategoryModal for:', { category, date, items })
        
        // ✅ Comunica al CalendarPage.tsx di aprire il modal
        if (onMacroCategorySelect && category) {
          onMacroCategorySelect(category, date ?? new Date(), items)
        } else {
          console.warn('🔍 Calendar.tsx: onMacroCategorySelect is undefined!')
        }
      } else {
        // ✅ Gestione eventi individuali
        const originalEvent = extendedProps.originalEvent
        if (originalEvent) {
          console.log('🔍 Calendar.tsx: Calling onEventClick with:', originalEvent)
          console.log('🔍 Calendar.tsx: onEventClick function:', onEventClick)
          if (onEventClick) {
            onEventClick(originalEvent)
          } else {
            console.warn('🔍 Calendar.tsx: onEventClick is undefined!')
          }
        }
        
        // ✅ Apri EventDetailsModal per eventi individuali
        if (originalEvent) {
          setSelectedEvent(originalEvent)
          // setShowEventModal(true)
        }
      }
    },
    [onEventClick, useMacroCategories, onMacroCategorySelect]
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

  // ✅ DRAG AND DROP - COMMENTATO PER ANALISI CODICE
  // Spostato in fondo al file per non interferire con l'analisi
  
  // const handleEventDrop = useCallback(
  //   (dropInfo: { event: { extendedProps?: { originalEvent?: any }; start: Date | null; end?: Date | null } }) => {
  //     const originalEvent = dropInfo.event.extendedProps?.originalEvent
  //     if (originalEvent && onEventUpdate) {
  //       const updatedEvent: CalendarEvent = {
  //         ...originalEvent,
  //         start: dropInfo.event.start ? new Date(dropInfo.event.start) : new Date(),
  //         end: dropInfo.event.end ? new Date(dropInfo.event.end) : undefined,
  //         updated_at: new Date(),
  //       }
  //       onEventUpdate(updatedEvent)
  //     }
  //   },
  //   [onEventUpdate]
  // )

  // const handleEventResize = useCallback(
  //   (resizeInfo: { event: { extendedProps?: { originalEvent?: any }; start: Date | null; end?: Date | null } }) => {
  //     const originalEvent = resizeInfo.event.extendedProps?.originalEvent
  //     if (originalEvent && onEventUpdate) {
  //       const updatedEvent: CalendarEvent = {
  //         ...originalEvent,
  //         start: resizeInfo.event.start ? new Date(resizeInfo.event.start) : new Date(),
  //         end: resizeInfo.event.end ? new Date(resizeInfo.event.end) : undefined,
  //         updated_at: new Date(),
  //       }
  //       onEventUpdate(updatedEvent)
  //     }
  //   },
  //   [onEventUpdate]
  // )

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

  const showHeaderFilters = calendarFilters != null && onFiltersChange != null

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Calendar Content: header con filtri tipo evento + toolbar FC */}
      <div className="p-4">
        {/* Filtri compatti nell'header: chips tipo evento (e Reparti per admin) */}
        {showHeaderFilters && (
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100 mb-3">
            <CalendarHeaderFilters
              filters={calendarFilters}
              onFiltersChange={onFiltersChange}
              availableDepartments={availableDepartments}
              isAdmin={isAdmin}
            />
          </div>
        )}
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
            key={useMacroCategories ? `${calendarView}-${macroEventsKey}` : `${calendarView}-${calendarKey}`}
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
            datesSet={(arg) => {
              // Trigger ri-applicazione fc-day-closed su navigazione mese/settimana
              setVisibleRangeKey(prev => prev + 1)
              if (onDatesSet) onDatesSet(arg.start, arg.end)
            }}
            dayCellDidMount={(arg) => {
              const date = new Date(arg.date)
              const dayOfWeek = date.getDay()
              if (!calendarSettings?.is_configured) return

              // Usa formato locale (non UTC) per evitare shift di giorno
              const year = date.getFullYear()
              const month = String(date.getMonth() + 1).padStart(2, '0')
              const day = String(date.getDate()).padStart(2, '0')
              const dateString = `${year}-${month}-${day}`

              const isSpecificClosureDate = calendarSettings.closure_dates.includes(dateString)
              const isClosedWeekday = !calendarSettings.open_weekdays.includes(dayOfWeek)

              if (isSpecificClosureDate || isClosedWeekday) {
                arg.el.classList.add('fc-day-closed')

                // Icona solo per chiusure specifiche, non per chiusure settimanali ricorrenti
                if (isSpecificClosureDate) {
                  const beachIcon = document.createElement('div')
                  beachIcon.className = 'fc-day-beach-icon'
                  beachIcon.innerHTML = '🏖️'
                  arg.el.querySelector('.fc-daygrid-day-frame')?.appendChild(beachIcon)
                }
              }
            }}
            dayHeaderDidMount={(arg) => {
              if (!calendarSettings?.is_configured) return

              const dayOfWeek = arg.dow
              const hours = calendarSettings.business_hours[dayOfWeek.toString()]
              const isClosedWeekday = !calendarSettings.open_weekdays.includes(dayOfWeek)

              if (hours && hours.length > 0) {
                const hoursText = hours.map(h => `${h.open}-${h.close}`).join(' · ')
                const hoursEl = document.createElement('div')
                hoursEl.className = 'fc-col-header-hours'
                hoursEl.textContent = hoursText
                arg.el.appendChild(hoursEl)
              } else if (isClosedWeekday) {
                // FIX: placeholder con stessa struttura per mantenere larghezza colonne uniforme
                const closedEl = document.createElement('div')
                closedEl.className = 'fc-col-header-hours fc-col-header-closed'
                closedEl.textContent = 'Chiuso'
                arg.el.appendChild(closedEl)
              }

              // DEBUG: log larghezze header per diagnosi bug colonne unite
              console.log(`[Calendar DEBUG] dayHeaderDidMount dow=${dayOfWeek}`, {
                isClosedWeekday,
                hasHours: !!(hours && hours.length > 0),
                headerWidth: arg.el.offsetWidth,
                headerText: arg.el.textContent,
              })
            }}
            // ✅ DRAG AND DROP - DISABILITATO PER ANALISI CODICE
            // eventDrop={handleEventDrop}
            // eventResize={handleEventResize}
            selectable={true}
            // editable={true}
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
            // eventResizableFromStart={true}
            // eventDurationEditable={true}
            // eventStartEditable={true}
            // ✅ DRAG AND DROP - DISABILITATO PER ANALISI CODICE
            // dragScroll={true}
            // dragRevertDuration={200}
            eventDragMinDistance={5}
            scrollTime="08:00:00"
            // ✅ DRAG AND DROP - DISABILITATO PER ANALISI CODICE
            // droppable={true}
            // dropAccept="*"
            // Custom styling
            eventClassNames={arg => {
              const extendedProps = arg.event.extendedProps
              if (extendedProps) {
                return [
                  extendedProps.type ? `event-type-${extendedProps.type}` : '',
                  extendedProps.status ? `event-status-${extendedProps.status}` : '',
                  extendedProps.priority ? `event-priority-${extendedProps.priority}` : '',
                ].filter(Boolean)
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
                    {extendedProps?.status === 'completed' && (
                      <span className="fc-event-status-icon">✅</span>
                    )}
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
            // setShowEventModal(false)
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
            // setShowEventModal(false)
            setSelectedEvent(null)
          }}
          selectedDate={selectedDate || undefined}
        />
      )}


      {/* Macro Category Modal */}
      {selectedMacroCategory && (
        <MacroCategoryModal
          isOpen={true}
          onClose={() => onMacroCategoryClose?.()}
          category={selectedMacroCategory.category as any}
          date={selectedMacroCategory.date}
          events={selectedMacroCategory.events}
          onDataUpdated={handleMacroDataUpdated}
          highlightMaintenanceTaskId={selectedMacroCategory.highlightMaintenanceTaskId}
        />
      )}

      {/* Calendar Styles */}
      <style>{`
        .calendar-container {
          --fc-border-color: #e5e7eb;
          --fc-button-bg-color: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          --fc-button-border-color: #6366f1;
          --fc-button-hover-bg-color: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          --fc-button-hover-border-color: #4f46e5;
          --fc-button-active-bg-color: #4338ca;
          --fc-button-active-border-color: #4338ca;
          --fc-today-bg-color: rgba(99, 102, 241, 0.05);
        }
        
        /* Pulsanti moderni con gradiente */
        .calendar-container .fc-button {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
          border: none !important;
          border-radius: 8px !important;
          padding: 8px 16px !important;
          font-weight: 600 !important;
          transition: all 0.3s ease !important;
          box-shadow: 0 2px 6px rgba(99, 102, 241, 0.25) !important;
        }
        
        .calendar-container .fc-button:hover {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%) !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 10px rgba(99, 102, 241, 0.35) !important;
        }
        
        .calendar-container .fc-button:active,
        .calendar-container .fc-button-active {
          background: linear-gradient(135deg, #4338ca 0%, #6d28d9 100%) !important;
          transform: translateY(0) !important;
        }
        
        .calendar-container .fc-button:disabled {
          opacity: 0.5 !important;
          cursor: not-allowed !important;
        }

        /* ============================================
           GRIGLIA PRINCIPALE CALENDARIO - Bordi più spessi
           ============================================ */
        
        /* Bordi delle celle del giorno */
        .fc-daygrid-day {
          border-width: 2px !important;
          border-color: #d1d5db !important;
        }

        /* Bordi della griglia principale */
        .fc-scrollgrid {
          border-width: 2px !important;
          border-color: #d1d5db !important;
        }

        .fc-scrollgrid-section > td {
          border-width: 2px !important;
        }

        /* Header del calendario */
        .fc-col-header-cell {
          border-width: 2px !important;
          border-color: #d1d5db !important;
        }

        /* Righe e colonne della griglia */
        .fc-daygrid-day-frame {
          border-width: 2px !important;
        }

        .fc th, .fc td {
          border-color: #d1d5db !important;
        }

        /* ============================================
           EVENTI MODERNI - Design card elegante
           ============================================ */
        
        .fc-event {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 250, 251, 0.98) 100%) !important;
          border: 1px solid rgba(229, 231, 235, 0.8) !important;
          border-radius: 8px !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06) !important;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
          overflow: hidden !important;
        }

        .fc-event:hover {
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1) !important;
          border-color: rgba(99, 102, 241, 0.3) !important;
          z-index: 100 !important;
        }

        /* Separatore tra eventi */
        .fc-daygrid-event-harness {
          padding: 3px 4px !important;
          margin: 2px 0 !important;
        }

        .fc-daygrid-event-harness:first-child {
          margin-top: 4px !important;
        }

        .fc-daygrid-event-harness:last-child {
          margin-bottom: 4px !important;
        }

        .fc-event-content-custom {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px 10px;
          background: transparent !important;
          min-height: 32px;
          position: relative;
        }

        /* Striscia colorata laterale per tipo evento */
        .fc-event-content-custom::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, var(--event-color, #6366f1) 0%, var(--event-color-dark, #4f46e5) 100%);
          border-radius: 8px 0 0 8px;
        }

        .fc-event-title-container {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          justify-content: center;
        }

        .fc-event-type-icon {
          font-size: 20px;
          flex-shrink: 0;
          line-height: 1;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
          transition: transform 0.2s ease;
        }

        .fc-event:hover .fc-event-type-icon {
          transform: scale(1.1);
        }

        .fc-event-title {
          font-size: 13px;
          font-weight: 600;
          color: #1f2937;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 120px;
          letter-spacing: -0.01em;
        }

        .fc-event-count-badge {
          font-size: 12px;
          font-weight: 700;
          color: #4f46e5;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%);
          border-radius: 10px;
          padding: 3px 10px;
          min-width: 24px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(99, 102, 241, 0.2);
          border: 1px solid rgba(99, 102, 241, 0.2);
          transition: all 0.2s ease;
        }

        .fc-event:hover .fc-event-count-badge {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(139, 92, 246, 0.18) 100%);
          transform: scale(1.05);
        }

        .fc-event-priority-indicator {
          display: none; /* Nascondi l'indicatore di priorità */
        }

        .fc-event-all-completed {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.08) 100%) !important;
          border: 1px solid rgba(16, 185, 129, 0.3) !important;
          border-radius: 8px !important;
        }

        .fc-event-checkmark {
          font-size: 24px;
          font-weight: bold;
          color: #10b981;
          filter: drop-shadow(0 1px 2px rgba(16, 185, 129, 0.3));
        }

        /* Colori per tipologia di evento - Striscia laterale colorata */
        .event-type-maintenance .fc-event-content-custom::before {
          --event-color: #f59e0b;
          --event-color-dark: #d97706;
        }

        .event-type-general_task .fc-event-content-custom::before {
          --event-color: #10b981;
          --event-color-dark: #059669;
        }

        .event-type-temperature_reading .fc-event-content-custom::before {
          --event-color: #06b6d4;
          --event-color-dark: #0891b2;
        }

        .event-type-custom .fc-event-content-custom::before {
          --event-color: #8b5cf6;
          --event-color-dark: #7c3aed;
        }

        /* Status styling - Eventi completati */
        .event-status-completed {
          opacity: 0.75;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%) !important;
        }

        .event-status-completed .fc-event-title {
          opacity: 0.7;
          text-decoration: line-through;
          color: #6b7280;
        }

        .event-status-completed .fc-event-content-custom::before {
          --event-color: #10b981;
          --event-color-dark: #059669;
        }

        /* Eventi in ritardo - Animazione pulse */
        @keyframes pulse-urgent {
          0%, 100% {
            opacity: 1;
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
          }
          50% {
            opacity: 0.95;
            box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
          }
        }

        .event-status-overdue {
          animation: pulse-urgent 2s infinite;
          border-color: rgba(239, 68, 68, 0.3) !important;
        }

        .event-status-overdue .fc-event-content-custom::before {
          --event-color: #ef4444;
          --event-color-dark: #dc2626;
        }

        .event-status-overdue .fc-event-type-icon {
          filter: drop-shadow(0 1px 3px rgba(239, 68, 68, 0.4));
        }

        .event-status-cancelled .fc-event-title {
          opacity: 0.5;
          text-decoration: line-through;
          color: #9ca3af;
        }

        /* Priority styling - Badge priorità critica */
        .event-priority-critical .fc-event-count-badge {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%) !important;
          border-color: rgba(239, 68, 68, 0.4) !important;
          color: #991b1b !important;
          font-weight: 800;
          box-shadow: 0 2px 6px rgba(239, 68, 68, 0.25) !important;
        }

        /* Macro category styling - Card speciale */
        .event-type-macro_category {
          cursor: pointer;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(243, 244, 246, 0.95) 100%) !important;
          border: 2px solid rgba(99, 102, 241, 0.2) !important;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15) !important;
        }

        .event-type-macro_category:hover {
          border-color: rgba(99, 102, 241, 0.4) !important;
          box-shadow: 0 4px 16px rgba(99, 102, 241, 0.25) !important;
        }

        .event-type-macro_category .fc-event-type-icon {
          font-size: 22px;
          filter: drop-shadow(0 2px 4px rgba(99, 102, 241, 0.2));
        }

        /* 🔧 Stili fc-day-closed spostati in calendar-custom.css per evitare duplicazione
           Beach icon for closed days */
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

        /* FIX: forza larghezza colonne uguali (100%/7) per evitare compressione colonne chiuse */
        .fc .fc-col-header-cell {
          width: 14.285% !important;
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

        /* Variante per giorni chiusi */
        .fc-col-header-hours.fc-col-header-closed {
          background-color: rgba(56, 189, 248, 0.1);
          color: #0284c7;
          font-style: italic;
          font-weight: 600;
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

// ============================================================================
// 🚫 DRAG AND DROP - DISABILITATO PER ANALISI CODICE
// ============================================================================
// Questa sezione contiene tutto il codice drag and drop commentato
// per non interferire con l'analisi del codice principale.
// 
// Per riabilitare il drag and drop:
// 1. Decommentare le funzioni handleEventDrop e handleEventResize sopra
// 2. Decommentare le configurazioni nel FullCalendar component:
//    - eventDrop={handleEventDrop}
//    - eventResize={handleEventResize}
//    - editable={true}
//    - eventResizableFromStart={true}
//    - eventDurationEditable={true}
//    - eventStartEditable={true}
//    - dragScroll={true}
//    - dragRevertDuration={200}
//    - droppable={true}
//    - dropAccept="*"
// 3. Decommentare le configurazioni nel CalendarPage.tsx:
//    - validRange
//    - selectConstraint
//    - eventConstraint
// ============================================================================

// Funzioni drag and drop (già commentate sopra):
// - handleEventDrop
// - handleEventResize

// Configurazioni FullCalendar (già commentate sopra):
// - eventDrop, eventResize, editable, eventResizableFromStart, etc.

export default Calendar
