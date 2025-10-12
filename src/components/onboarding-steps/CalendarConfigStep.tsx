import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Clock, X, Plus, AlertCircle } from 'lucide-react'
import type { CalendarStepProps, CalendarConfigInput } from '@/types/onboarding'
import {
  validateFiscalYear,
  validateOpenWeekdays,
  validateClosureDates,
  validateBusinessHours,
  formatDateDisplay,
  getWeekdayName,
} from '@/utils/calendarUtils'
import { WEEKDAYS, DEFAULT_CALENDAR_CONFIG } from '@/types/calendar'

const CalendarConfigStep = ({
  data,
  onUpdate,
  onValidChange,
}: CalendarStepProps) => {
  const [formData, setFormData] = useState<CalendarConfigInput>({
    ...DEFAULT_CALENDAR_CONFIG,
    ...data,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [closureType, setClosureType] = useState<'single' | 'period'>('single')
  const [newClosureDate, setNewClosureDate] = useState('')
  const [periodStartDate, setPeriodStartDate] = useState('')
  const [periodEndDate, setPeriodEndDate] = useState('')

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      ...data,
    }))
  }, [data])

  useEffect(() => {
    const newErrors: Record<string, string> = {}

    const fiscalErrors = validateFiscalYear(formData.fiscal_year_start, formData.fiscal_year_end)
    if (fiscalErrors.length > 0) {
      newErrors.fiscal_year = fiscalErrors[0]
    }

    const weekdayErrors = validateOpenWeekdays(formData.open_weekdays)
    if (weekdayErrors.length > 0) {
      newErrors.open_weekdays = weekdayErrors[0]
    }

    const closureErrors = validateClosureDates(
      formData.closure_dates,
      formData.fiscal_year_start,
      formData.fiscal_year_end
    )
    if (closureErrors.length > 0) {
      newErrors.closure_dates = closureErrors[0]
    }

    const businessHoursErrors = validateBusinessHours(formData.business_hours)
    if (businessHoursErrors.length > 0) {
      newErrors.business_hours = businessHoursErrors[0]
    }

    setErrors(newErrors)
    onValidChange(Object.keys(newErrors).length === 0)
  }, [formData, onValidChange])

  const updateField = <K extends keyof CalendarConfigInput>(
    field: K,
    value: CalendarConfigInput[K]
  ) => {
    const newFormData = {
      ...formData,
      [field]: value,
    }
    setFormData(newFormData)
    onUpdate(newFormData)
  }

  const toggleWeekday = (day: number) => {
    const newWeekdays = formData.open_weekdays.includes(day)
      ? formData.open_weekdays.filter(d => d !== day)
      : [...formData.open_weekdays, day].sort()

    updateField('open_weekdays', newWeekdays)
  }

  const addClosureDate = () => {
    if (!newClosureDate) return

    if (!formData.closure_dates.includes(newClosureDate)) {
      updateField('closure_dates', [...formData.closure_dates, newClosureDate].sort())
    }
    setNewClosureDate('')
  }

  const addClosurePeriod = () => {
    if (!periodStartDate || !periodEndDate) return

    const start = new Date(periodStartDate)
    const end = new Date(periodEndDate)

    if (start > end) {
      return
    }

    const dates: string[] = []
    const current = new Date(start)

    while (current <= end) {
      const dateString = current.toISOString().split('T')[0]
      if (!formData.closure_dates.includes(dateString)) {
        dates.push(dateString)
      }
      current.setDate(current.getDate() + 1)
    }

    if (dates.length > 0) {
      updateField('closure_dates', [...formData.closure_dates, ...dates].sort())
    }

    setPeriodStartDate('')
    setPeriodEndDate('')
  }

  const removeClosureDate = (date: string) => {
    updateField('closure_dates', formData.closure_dates.filter(d => d !== date))
  }

  const updateBusinessHours = (weekday: number, slotIndex: number, field: 'open' | 'close', value: string) => {
    const weekdayKey = weekday.toString()
    const currentSlots = formData.business_hours[weekdayKey] || []

    const newSlots = [...currentSlots]
    if (!newSlots[slotIndex]) {
      newSlots[slotIndex] = { open: '', close: '' }
    }
    newSlots[slotIndex][field] = value

    updateField('business_hours', {
      ...formData.business_hours,
      [weekdayKey]: newSlots,
    })
  }

  const addTimeSlot = (weekday: number) => {
    const weekdayKey = weekday.toString()
    const currentSlots = formData.business_hours[weekdayKey] || []

    if (currentSlots.length >= 2) return

    updateField('business_hours', {
      ...formData.business_hours,
      [weekdayKey]: [...currentSlots, { open: '', close: '' }],
    })
  }

  const removeTimeSlot = (weekday: number, slotIndex: number) => {
    const weekdayKey = weekday.toString()
    const currentSlots = formData.business_hours[weekdayKey] || []

    updateField('business_hours', {
      ...formData.business_hours,
      [weekdayKey]: currentSlots.filter((_, i) => i !== slotIndex),
    })
  }

  // ========================================
  // CALCOLO GIORNI LAVORATIVI TOTALI
  // ========================================
  const calculateWorkingDays = () => {
    if (!formData.fiscal_year_start || !formData.fiscal_year_end) {
      return null
    }

    // Normalizza le date a mezzanotte per evitare problemi timezone
    const startDate = new Date(formData.fiscal_year_start + 'T00:00:00')
    const endDate = new Date(formData.fiscal_year_end + 'T00:00:00')

    // 1. Giorni totali nell'anno fiscale (calcolo preciso)
    const diffTime = endDate.getTime() - startDate.getTime()
    const totalDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1

    // 2. Calcola giorni chiusura settimanale
    const closedWeekdays = [0, 1, 2, 3, 4, 5, 6].filter(day => !formData.open_weekdays.includes(day))
    
    // Conta quante volte ogni giorno chiuso si ripete nell'anno
    let weeklyClosureDays = 0
    const current = new Date(startDate)
    
    while (current <= endDate) {
      const dayOfWeek = current.getDay()
      if (closedWeekdays.includes(dayOfWeek)) {
        weeklyClosureDays++
      }
      current.setDate(current.getDate() + 1)
    }

    // 3. Giorni di chiusura programmata (festività/ferie)
    // Conta solo le chiusure che NON cadono già in giorni di chiusura settimanale
    let programmedClosureDays = 0
    for (const closureDate of formData.closure_dates) {
      const date = new Date(closureDate)
      const dayOfWeek = date.getDay()
      
      // Conta solo se la chiusura cade in un giorno normalmente aperto
      if (!closedWeekdays.includes(dayOfWeek)) {
        programmedClosureDays++
      }
    }

    // 4. Calcola giorni lavorativi effettivi
    const workingDays = totalDays - weeklyClosureDays - programmedClosureDays

    return {
      totalDays,
      weeklyClosureDays,
      programmedClosureDays,
      programmedClosureDaysTotal: formData.closure_dates.length, // Totale chiusure (anche quelle in giorni già chiusi)
      workingDays: Math.max(0, workingDays), // Non può essere negativo
      closedWeekdaysNames: closedWeekdays.map(day => getWeekdayName(day)),
    }
  }

  const workingDaysStats = calculateWorkingDays()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Configurazione Calendario
        </h3>
        <p className="text-sm text-gray-600">
          Configura l'anno lavorativo, i giorni di chiusura e gli orari di apertura
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <CalendarIcon className="inline w-4 h-4 mr-2" />
            Anno Lavorativo
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Data Inizio</label>
              <input
                type="date"
                value={formData.fiscal_year_start}
                onChange={(e) => updateField('fiscal_year_start', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Data Fine</label>
              <input
                type="date"
                value={formData.fiscal_year_end}
                onChange={(e) => updateField('fiscal_year_end', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          {errors.fiscal_year && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.fiscal_year}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Giorni Apertura Settimanali
          </label>
          <div className="grid grid-cols-7 gap-2">
            {WEEKDAYS.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleWeekday(day)}
                className={`
                  px-2 py-3 text-xs font-medium rounded-lg border transition-colors
                  ${formData.open_weekdays.includes(day)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                {getWeekdayName(day).slice(0, 3)}
              </button>
            ))}
          </div>
          {errors.open_weekdays && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.open_weekdays}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Giorni di Chiusura
          </label>

          {/* Toggle tipo input */}
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => setClosureType('single')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                closureType === 'single'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Giorno Singolo
            </button>
            <button
              type="button"
              onClick={() => setClosureType('period')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                closureType === 'period'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Periodo
            </button>
          </div>

          {/* Input giorno singolo */}
          {closureType === 'single' && (
            <div className="flex gap-2 mb-3">
              <input
                type="date"
                value={newClosureDate}
                onChange={(e) => setNewClosureDate(e.target.value)}
                min={formData.fiscal_year_start}
                max={formData.fiscal_year_end}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Seleziona giorno"
              />
              <button
                type="button"
                onClick={addClosureDate}
                disabled={!newClosureDate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Input periodo */}
          {closureType === 'period' && (
            <div className="space-y-2 mb-3">
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">Dal</label>
                  <input
                    type="date"
                    value={periodStartDate}
                    onChange={(e) => setPeriodStartDate(e.target.value)}
                    min={formData.fiscal_year_start}
                    max={formData.fiscal_year_end}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">Al</label>
                  <input
                    type="date"
                    value={periodEndDate}
                    onChange={(e) => setPeriodEndDate(e.target.value)}
                    min={periodStartDate || formData.fiscal_year_start}
                    max={formData.fiscal_year_end}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={addClosurePeriod}
                  disabled={!periodStartDate || !periodEndDate}
                  className="mt-5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {periodStartDate && periodEndDate && new Date(periodStartDate) > new Date(periodEndDate) && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  La data di fine deve essere successiva alla data di inizio
                </p>
              )}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {formData.closure_dates.map((date) => (
              <div
                key={date}
                className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {formatDateDisplay(date)}
                <button
                  type="button"
                  onClick={() => removeClosureDate(date)}
                  className="text-gray-500 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          {errors.closure_dates && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.closure_dates}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <Clock className="inline w-4 h-4 mr-2" />
            Orari di Apertura
          </label>
          <div className="space-y-4">
            {formData.open_weekdays.sort().map((weekday) => {
              const weekdayKey = weekday.toString()
              const slots = formData.business_hours[weekdayKey] || []

              return (
                <div key={weekday} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-900">
                      {getWeekdayName(weekday)}
                    </span>
                    {slots.length < 2 && (
                      <button
                        type="button"
                        onClick={() => addTimeSlot(weekday)}
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Aggiungi fascia
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {slots.map((slot, slotIndex) => (
                      <div key={slotIndex} className="flex items-center gap-2">
                        <input
                          type="time"
                          value={slot.open}
                          onChange={(e) => updateBusinessHours(weekday, slotIndex, 'open', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                          type="time"
                          value={slot.close}
                          onChange={(e) => updateBusinessHours(weekday, slotIndex, 'close', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        {slots.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTimeSlot(weekday, slotIndex)}
                            className="p-2 text-gray-400 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {slots.length === 0 && (
                      <button
                        type="button"
                        onClick={() => addTimeSlot(weekday)}
                        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600"
                      >
                        Aggiungi orari
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          {errors.business_hours && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.business_hours}
            </p>
          )}
        </div>

        {/* ========================================
            CONTATORE GIORNI LAVORATIVI
            ======================================== */}
        {workingDaysStats && (
          <div className="border-t border-gray-200 pt-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">
                    Riepilogo Anno Lavorativo
                  </h4>
                  <p className="text-sm text-gray-600">
                    {new Date(formData.fiscal_year_start).getFullYear()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Giorni Totali */}
                <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                  <div className="text-3xl font-bold text-gray-900">
                    {workingDaysStats.totalDays}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Giorni Totali
                  </div>
                </div>

                {/* Chiusura Settimanale */}
                <div className="bg-white rounded-lg p-4 text-center border border-red-200">
                  <div className="text-3xl font-bold text-red-600">
                    -{workingDaysStats.weeklyClosureDays}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Chiusura Settimanale
                  </div>
                  {workingDaysStats.closedWeekdaysNames.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      ({workingDaysStats.closedWeekdaysNames.join(', ')})
                    </div>
                  )}
                </div>

                {/* Chiusura Programmata */}
                <div className="bg-white rounded-lg p-4 text-center border border-orange-200">
                  <div className="text-3xl font-bold text-orange-600">
                    -{workingDaysStats.programmedClosureDays}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Chiusura Programmata
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    (Ferie/Festività)
                  </div>
                </div>

                {/* Giorni Lavorativi */}
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-4 text-center shadow-lg">
                  <div className="text-4xl font-bold text-white">
                    {workingDaysStats.workingDays}
                  </div>
                  <div className="text-xs text-white font-semibold mt-1">
                    ✅ Giorni Lavorativi
                  </div>
                  <div className="text-xs text-green-100 mt-1">
                    Anno {new Date(formData.fiscal_year_start).getFullYear()}
                  </div>
                </div>
              </div>

              {/* Formula Esplicativa */}
              <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-300">
                <p className="text-xs text-blue-900 text-center font-mono">
                  📊 Formula: {workingDaysStats.totalDays} (totali) 
                  - {workingDaysStats.weeklyClosureDays} (settimanali) 
                  - {workingDaysStats.programmedClosureDays} (programmati) 
                  = <strong className="text-blue-700">{workingDaysStats.workingDays} giorni lavorativi</strong>
                </p>
              </div>

              {/* Percentuale Apertura */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Percentuale apertura annuale</span>
                  <span className="font-semibold text-blue-700">
                    {((workingDaysStats.workingDays / workingDaysStats.totalDays) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${(workingDaysStats.workingDays / workingDaysStats.totalDays) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CalendarConfigStep
