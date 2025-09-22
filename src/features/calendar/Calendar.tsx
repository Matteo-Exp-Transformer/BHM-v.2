import React, { useState, useRef, useCallback } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import {
  CalendarEvent,
  CalendarFilters,
  CalendarViewConfig,
} from '@/types/calendar'
import { transformToFullCalendarEvents } from './utils/eventTransform'
import EventModal from './components/EventModal'
import FilterPanel from './components/FilterPanel'
import QuickActions from './components/QuickActions'
import { Calendar as CalendarIcon, Filter, Plus } from 'lucide-react'

interface CalendarProps {
  events: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
  onEventCreate?: (event: Partial<CalendarEvent>) => void
  onEventUpdate?: (event: CalendarEvent) => void
  onEventDelete?: (eventId: string) => void
  onDateSelect?: (start: Date, end: Date) => void
  config?: Partial<CalendarViewConfig>
  loading?: boolean
  error?: string | null
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
  config = {},
  loading = false,
  error = null,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<CalendarFilters>({
    types: [],
    statuses: [],
    priorities: [],
    departments: [],
    assignees: [],
  })

  const calendarRef = useRef<FullCalendar>(null)
  const finalConfig = { ...defaultConfig, ...config }

  // Transform events for FullCalendar
  const fullCalendarEvents = transformToFullCalendarEvents(events)

  // Handle event click
  const handleEventClick = useCallback(
    (clickInfo: any) => {
      const originalEvent = clickInfo.event.extendedProps?.originalEvent
      if (originalEvent) {
        setSelectedEvent(originalEvent)
        setShowEventModal(true)
        onEventClick?.(originalEvent)
      }
    },
    [onEventClick]
  )

  // Handle date selection for new events
  const handleDateSelect = useCallback(
    (selectInfo: any) => {
      const start = new Date(selectInfo.start)
      const end = new Date(selectInfo.end)
      onDateSelect?.(start, end)
    },
    [onDateSelect]
  )

  // Handle event drag and drop
  const handleEventDrop = useCallback(
    (dropInfo: any) => {
      const originalEvent = dropInfo.event.extendedProps?.originalEvent
      if (originalEvent && onEventUpdate) {
        const updatedEvent: CalendarEvent = {
          ...originalEvent,
          start: new Date(dropInfo.event.start),
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
    (resizeInfo: any) => {
      const originalEvent = resizeInfo.event.extendedProps?.originalEvent
      if (originalEvent && onEventUpdate) {
        const updatedEvent: CalendarEvent = {
          ...originalEvent,
          start: new Date(resizeInfo.event.start),
          end: resizeInfo.event.end
            ? new Date(resizeInfo.event.end)
            : undefined,
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
    filterToggle: {
      text: 'Filtri',
      click: () => setShowFilters(!showFilters),
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
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Calendario Unified
              </h2>
              <p className="text-sm text-gray-600">
                Mansioni, manutenzioni e attività in un unico calendario
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                showFilters
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtri
            </button>

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

      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

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
            ]}
            initialView={finalConfig.defaultView}
            headerToolbar={finalConfig.headerToolbar}
            customButtons={customButtons}
            height={finalConfig.height}
            locale={finalConfig.locale}
            firstDay={finalConfig.firstDay}
            slotMinTime={finalConfig.slotMinTime}
            slotMaxTime={finalConfig.slotMaxTime}
            businessHours={finalConfig.businessHours}
            events={fullCalendarEvents}
            eventClick={handleEventClick}
            select={handleDateSelect}
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
        <EventModal
          isOpen={showEventModal}
          onClose={() => {
            setShowEventModal(false)
            setSelectedEvent(null)
          }}
          event={selectedEvent}
          onUpdate={onEventUpdate}
          onDelete={onEventDelete}
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

        .fc-event-content-custom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 2px 4px;
        }

        .fc-event-title-container {
          display: flex;
          align-items: center;
          gap: 4px;
          flex: 1;
          min-width: 0;
        }

        .fc-event-type-icon {
          font-size: 12px;
          flex-shrink: 0;
        }

        .fc-event-title {
          font-size: 11px;
          font-weight: 500;
          truncate: true;
          flex: 1;
          min-width: 0;
        }

        .fc-event-priority-indicator {
          font-size: 10px;
          flex-shrink: 0;
        }

        /* Event type styling */
        .event-type-maintenance {
          background-color: #fef3c7 !important;
          border-color: #f59e0b !important;
          color: #92400e !important;
        }

        .event-type-general_task {
          background-color: #dbeafe !important;
          border-color: #3b82f6 !important;
          color: #1e40af !important;
        }

        .event-type-temperature_reading {
          background-color: #dcfce7 !important;
          border-color: #10b981 !important;
          color: #065f46 !important;
        }

        .event-type-custom {
          background-color: #f3e8ff !important;
          border-color: #8b5cf6 !important;
          color: #5b21b6 !important;
        }

        /* Status styling */
        .event-status-completed {
          background-color: #dcfce7 !important;
          border-color: #10b981 !important;
          color: #065f46 !important;
          opacity: 0.8;
        }

        .event-status-overdue {
          background-color: #fee2e2 !important;
          border-color: #ef4444 !important;
          color: #991b1b !important;
          animation: pulse 2s infinite;
        }

        .event-status-cancelled {
          background-color: #f9fafb !important;
          border-color: #9ca3af !important;
          color: #6b7280 !important;
          opacity: 0.6;
          text-decoration: line-through;
        }

        /* Priority styling */
        .event-priority-critical {
          background-color: #7f1d1d !important;
          border-color: #991b1b !important;
          color: #ffffff !important;
          font-weight: 600;
        }

        .event-priority-high {
          border-width: 2px !important;
          font-weight: 500;
        }
      `}</style>
    </div>
  )
}

export default Calendar
