import React, { useState, useCallback } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Calendar as CalendarIcon, Filter, Settings, Plus } from 'lucide-react'
import { useCalendar } from '@/hooks/useCalendar'
import { CalendarFilter } from './CalendarFilter'
import { CalendarSettings } from './CalendarSettings'
import { EventDetailsModal } from './EventDetailsModal'
import { CreateEventModal } from './CreateEventModal'
import { CollapsibleCard } from '@/components/ui/CollapsibleCard'
import type { TypedCalendarEvent } from '@/types/calendar'

export function Calendar() {
  const {
    events,
    filter,
    settings,
    isLoading,
    error,
    updateFilter,
    updateSettings,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useCalendar()

  const [showFilters, setShowFilters] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<TypedCalendarEvent | null>(
    null
  )
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const handleEventClick = useCallback(
    (info: any) => {
      const eventId = info.event.id
      const event = events.find(e => e.id === eventId)
      if (event) {
        setSelectedEvent(event)
      }
    },
    [events]
  )

  const handleDateClick = useCallback((info: any) => {
    setSelectedDate(new Date(info.date))
    setShowCreateModal(true)
  }, [])

  const handleEventDrop = useCallback(
    (info: any) => {
      const eventId = info.event.id
      const event = events.find(e => e.id === eventId)
      if (event) {
        updateEvent({
          eventId,
          updates: {
            ...event,
            start: info.event.start,
            end: info.event.end,
          },
        })
      }
    },
    [events, updateEvent]
  )

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return '#DC2626'
      case 'high':
        return '#EA580C'
      case 'medium':
        return '#D97706'
      case 'low':
        return '#65A30D'
      default:
        return '#6B7280'
    }
  }

  const getStatusBorder = (status: string) => {
    switch (status) {
      case 'overdue':
        return '3px solid #DC2626'
      case 'in_progress':
        return '3px solid #2563EB'
      case 'completed':
        return '3px solid #16A34A'
      default:
        return 'none'
    }
  }

  const calendarEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    allDay: event.allDay || false,
    backgroundColor:
      event.extendedProps.color || settings.colorScheme[event.source],
    borderColor: getPriorityColor(event.extendedProps.priority),
    textColor: '#FFFFFF',
    extendedProps: {
      ...event.extendedProps,
      source: event.source,
      sourceId: event.sourceId,
    },
    classNames: [
      `calendar-event-${event.source}`,
      `priority-${event.extendedProps.priority}`,
      `status-${event.extendedProps.status}`,
    ],
  }))

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-4">
          Errore nel caricamento del calendario: {error.message}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Ricarica
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Calendario HACCP
            </h1>
            <p className="text-gray-600">
              Gestione unificata di manutenzioni, controlli e attività
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuovo Evento
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showFilters
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtri
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showSettings
                ? 'bg-gray-100 text-gray-700 border border-gray-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            Impostazioni
          </button>
        </div>
      </div>

      {showFilters && (
        <CollapsibleCard
          title="Filtri"
          isOpen={showFilters}
          onToggle={setShowFilters}
        >
          <CalendarFilter
            filter={filter}
            onFilterChange={updateFilter}
            totalEvents={events.length}
          />
        </CollapsibleCard>
      )}

      {showSettings && (
        <CollapsibleCard
          title="Impostazioni"
          isOpen={showSettings}
          onToggle={setShowSettings}
        >
          <CalendarSettings
            settings={settings}
            onSettingsChange={updateSettings}
          />
        </CollapsibleCard>
      )}

      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">
              Caricamento calendario...
            </span>
          </div>
        ) : (
          <div className="p-4">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={settings.defaultView}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              events={calendarEvents}
              eventClick={handleEventClick}
              dateClick={handleDateClick}
              editable={true}
              droppable={true}
              eventDrop={handleEventDrop}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={true}
              firstDay={settings.firstDayOfWeek}
              businessHours={settings.businessHours}
              height="auto"
              locale="it"
              timeZone="Europe/Rome"
              slotMinTime="06:00:00"
              slotMaxTime="22:00:00"
              allDaySlot={true}
              expandRows={true}
              nowIndicator={true}
              eventClassNames={arg => {
                const priority = arg.event.extendedProps.priority
                const status = arg.event.extendedProps.status
                return [`priority-${priority}`, `status-${status}`]
              }}
              eventDidMount={info => {
                const event = info.event
                const status = event.extendedProps.status
                info.el.style.border = getStatusBorder(status)

                if (status === 'overdue') {
                  info.el.style.animation = 'pulse 2s infinite'
                }
              }}
            />
          </div>
        )}
      </div>

      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onUpdate={updateEvent}
          onDelete={deleteEvent}
        />
      )}

      {showCreateModal && (
        <CreateEventModal
          selectedDate={selectedDate}
          onClose={() => {
            setShowCreateModal(false)
            setSelectedDate(null)
          }}
          onCreate={createEvent}
        />
      )}

      <style>{`
        .fc-event.priority-critical {
          font-weight: bold;
          box-shadow: 0 0 10px rgba(220, 38, 38, 0.5);
        }

        .fc-event.priority-high {
          font-weight: 600;
        }

        .fc-event.status-overdue {
          animation: pulse 2s infinite;
          border: 2px solid #DC2626 !important;
        }

        .fc-event.status-in_progress {
          border-left: 4px solid #2563EB !important;
        }

        .fc-event.status-completed {
          opacity: 0.7;
          text-decoration: line-through;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .fc-daygrid-event {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .fc-event-title {
          font-weight: 500;
        }

        .fc-timegrid-event {
          border-radius: 4px;
        }
      `}</style>
    </div>
  )
}
