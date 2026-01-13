import { useMemo } from 'react'
import { useCalendarSettings } from '@/hooks/useCalendarSettings'
import { cn } from '@/lib/utils'

interface MiniCalendarProps {
  mode: 'month' | 'year'
  selectedDay?: number
  onSelect: (day: number) => void
  className?: string
}

interface CalendarDay {
  date: Date
  dayOfMonth: number
  month: number
  isSelectable: boolean
  workingDayNumber: number | null
}

export function MiniCalendar({ mode, selectedDay, onSelect, className }: MiniCalendarProps) {
  const { settings: calendarSettings, isLoading } = useCalendarSettings()

  // Calcola dati per mode year (fuori da renderYearMode per usare useMemo)
  const yearModeData = useMemo(() => {
    if (mode !== 'year' || isLoading) {
      return null
    }

    // Calcola range anno fiscale
    const fiscalYearStart = calendarSettings?.fiscal_year_start
      ? new Date(calendarSettings.fiscal_year_start)
      : new Date(new Date().getFullYear(), 0, 1) // Fallback: 1 gennaio

    const fiscalYearEnd = calendarSettings?.fiscal_year_end
      ? new Date(calendarSettings.fiscal_year_end)
      : new Date(new Date().getFullYear(), 11, 31) // Fallback: 31 dicembre

    // Giorni di apertura (numerici 1-7, lunedì=1, domenica=7)
    // Nota: useCalendarSettings restituisce open_weekdays come 0-6 (domenica=0)
    // Ma nel piano si dice lunedì=1, domenica=7, quindi convertiamo
    const openWeekdays = calendarSettings?.open_weekdays 
      ? calendarSettings.open_weekdays.map(day => day === 0 ? 7 : day) // Converti 0->7 per domenica
      : [1, 2, 3, 4, 5, 6, 7] // Fallback: tutti i giorni

    // Date di chiusura
    const closureDates = calendarSettings?.closure_dates || []

    // Genera calendario annuale con settimane e mesi
    const days: CalendarDay[] = []
    let currentDate = new Date(fiscalYearStart)
    let workingDayCount = 0

    while (currentDate <= fiscalYearEnd) {
      // getDay() restituisce 0=domenica, 1=lunedì, ..., 6=sabato
      // Convertiamo a formato 1-7 (lunedì=1, domenica=7)
      const weekDayNum = currentDate.getDay() === 0 ? 7 : currentDate.getDay()
      
      const isOpenDay = openWeekdays.includes(weekDayNum)
      
      // Verifica se è una data di chiusura
      const dateString = currentDate.toISOString().split('T')[0]
      const isClosed = closureDates.includes(dateString)

      const isSelectable = isOpenDay && !isClosed

      if (isSelectable) {
        workingDayCount++
      }

      days.push({
        date: new Date(currentDate),
        dayOfMonth: currentDate.getDate(),
        month: currentDate.getMonth(),
        isSelectable,
        workingDayNumber: isSelectable ? workingDayCount : null,
      })

      // Avanza al giorno successivo
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Raggruppa per mese per visualizzazione
    const monthsGrouped: Record<number, CalendarDay[]> = {}
    days.forEach(day => {
      if (!monthsGrouped[day.month]) {
        monthsGrouped[day.month] = []
      }
      monthsGrouped[day.month].push(day)
    })

    return {
      days,
      monthsGrouped,
      totalWorkingDays: days.filter(d => d.isSelectable).length,
    }
  }, [mode, isLoading, calendarSettings])

  // Mode: month - semplice grid 31 giorni
  const renderMonthMode = () => {
    const days = Array.from({ length: 31 }, (_, i) => i + 1)

    return (
      <div className="space-y-2">
        {/* Header giorni settimana */}
        <div className="grid grid-cols-7 gap-1">
          {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((day, idx) => (
            <div key={idx} className="text-center text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>
        
        {/* Grid 31 giorni */}
        <div className="grid grid-cols-7 gap-1">
          {days.map(day => (
            <button
              key={day}
              type="button"
              onClick={() => onSelect(day)}
              className={cn(
                'h-10 w-10 rounded-md text-sm font-medium transition-colors',
                'hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary',
                selectedDay === day && 'bg-blue-600 text-white hover:bg-blue-700 font-semibold'
              )}
              aria-label={`Seleziona giorno ${day}`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Mode: year - calendario annuale con fiscal year e calendar settings
  const renderYearMode = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-gray-500">Caricamento calendario...</div>
        </div>
      )
    }

    if (!yearModeData) {
      return null
    }

    const { monthsGrouped, totalWorkingDays } = yearModeData

    // Nomi mesi in italiano
    const monthNames = [
      'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
      'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
    ]

    return (
      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        {Object.entries(monthsGrouped).map(([month, days]) => (
          <div key={month} className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700">
              {monthNames[parseInt(month)]}
            </h4>
            <div className="grid grid-cols-7 gap-1">
              {/* Header giorni settimana */}
              {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((d, i) => (
                <div key={i} className="text-xs text-center text-gray-500 font-medium">
                  {d}
                </div>
              ))}

              {/* Padding inizio mese per allineare giorni */}
              {(() => {
                const firstDay = days[0].date
                const firstDayOfWeek = firstDay.getDay() === 0 ? 7 : firstDay.getDay() // Converti 0->7
                const padding = (firstDayOfWeek + 5) % 7 // Allinea lunedì=0
                return Array.from({ length: padding }).map((_, i) => (
                  <div key={`padding-${i}`} />
                ))
              })()}

              {/* Giorni del mese */}
              {days.map((day, idx) => (
                <button
                  key={`${day.date.toISOString()}-${idx}`}
                  type="button"
                  disabled={!day.isSelectable}
                  onClick={() => day.workingDayNumber && onSelect(day.workingDayNumber)}
                  className={cn(
                    'h-8 w-8 rounded-md text-xs font-medium relative transition-colors',
                    day.isSelectable
                      ? 'hover:bg-primary/10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary'
                      : 'text-gray-300 cursor-not-allowed opacity-50',
                    day.workingDayNumber === selectedDay && 'bg-blue-600 text-white hover:bg-blue-700'
                  )}
                  title={day.isSelectable
                    ? `Giorno lavorativo ${day.workingDayNumber}/${totalWorkingDays}`
                    : 'Giorno di chiusura'}
                  aria-label={day.isSelectable
                    ? `Seleziona giorno lavorativo ${day.workingDayNumber}`
                    : `Giorno ${day.dayOfMonth} - Chiuso`}
                >
                  {day.dayOfMonth}
                  {day.workingDayNumber && (
                    <span className="absolute -top-1 -right-1 text-[8px] text-primary font-bold">
                      {day.workingDayNumber}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('p-4 bg-white rounded-lg border border-gray-200', className)}>
      {mode === 'month' ? renderMonthMode() : renderYearMode()}
    </div>
  )
}
