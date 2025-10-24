import type { BusinessHourSlot, BusinessHours } from '@/types/calendar'

export const formatBusinessHours = (slots: BusinessHourSlot[]): string => {
  if (!slots || slots.length === 0) {
    return 'Chiuso'
  }

  if (slots.length === 1) {
    return `${slots[0].open} - ${slots[0].close}`
  }

  return slots.map(slot => `${slot.open}-${slot.close}`).join(' · ')
}

export const validateBusinessHours = (hours: BusinessHours): string[] => {
  const errors: string[] = []

  Object.entries(hours).forEach(([weekday, slots]) => {
    if (!Array.isArray(slots)) {
      errors.push(`Formato non valido per il giorno ${weekday}`)
      return
    }

    if (slots.length === 0) {
      return
    }

    if (slots.length > 2) {
      errors.push(`Massimo 2 fasce orarie per giorno (giorno ${weekday})`)
    }

    slots.forEach((slot, index) => {
      if (!slot.open || !slot.close) {
        errors.push(`Orari mancanti per giorno ${weekday}, fascia ${index + 1}`)
        return
      }

      if (!isValidTimeFormat(slot.open)) {
        errors.push(`Formato ora apertura non valido: ${slot.open}`)
      }

      if (!isValidTimeFormat(slot.close)) {
        errors.push(`Formato ora chiusura non valido: ${slot.close}`)
      }

      if (slot.open >= slot.close) {
        errors.push(`Ora chiusura deve essere dopo ora apertura (giorno ${weekday}, fascia ${index + 1})`)
      }
    })

    if (slots.length === 2) {
      if (slots[0].close >= slots[1].open) {
        errors.push(`Le fasce orarie non possono sovrapporsi (giorno ${weekday})`)
      }
    }
  })

  return errors
}

export const isValidTimeFormat = (time: string): boolean => {
  const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/
  return timeRegex.test(time)
}

export const validateFiscalYear = (start: string, end: string): string[] => {
  const errors: string[] = []

  if (!start || !end) {
    errors.push('Data inizio e fine anno lavorativo sono obbligatorie')
    return errors
  }

  const startDate = new Date(start)
  const endDate = new Date(end)

  if (isNaN(startDate.getTime())) {
    errors.push('Data inizio non valida')
  }

  if (isNaN(endDate.getTime())) {
    errors.push('Data fine non valida')
  }

  if (startDate >= endDate) {
    errors.push('La data di fine deve essere successiva alla data di inizio')
  }

  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  if (daysDiff < 30) {
    errors.push('L\'anno lavorativo deve durare almeno 30 giorni')
  }

  if (daysDiff > 730) {
    errors.push('L\'anno lavorativo non può superare i 2 anni')
  }

  return errors
}

export const validateOpenWeekdays = (weekdays: number[]): string[] => {
  const errors: string[] = []

  if (!Array.isArray(weekdays)) {
    errors.push('Giorni apertura devono essere un array')
    return errors
  }

  if (weekdays.length === 0) {
    errors.push('Selezionare almeno un giorno di apertura')
    return errors
  }

  const invalidDays = weekdays.filter(day => day < 0 || day > 6)
  if (invalidDays.length > 0) {
    errors.push('Giorni settimana non validi (range: 0-6)')
  }

  const uniqueDays = new Set(weekdays)
  if (uniqueDays.size !== weekdays.length) {
    errors.push('Giorni duplicati nell\'elenco')
  }

  return errors
}

export const validateClosureDates = (dates: string[], fiscalStart: string, fiscalEnd: string): string[] => {
  const errors: string[] = []

  if (!Array.isArray(dates)) {
    errors.push('Giorni chiusura devono essere un array')
    return errors
  }

  const startDate = new Date(fiscalStart)
  const endDate = new Date(fiscalEnd)

  dates.forEach((dateStr, /* index */) => {
    const date = new Date(dateStr)

    if (isNaN(date.getTime())) {
      errors.push(`Data chiusura non valida: ${dateStr}`)
      return
    }

    if (date < startDate || date > endDate) {
      errors.push(`Data chiusura ${dateStr} fuori dall'anno lavorativo`)
    }
  })

  const uniqueDates = new Set(dates)
  if (uniqueDates.size !== dates.length) {
    errors.push('Date di chiusura duplicate')
  }

  return errors
}

export const isClosureDate = (date: Date, closureDates: string[]): boolean => {
  const dateString = date.toISOString().split('T')[0]
  return closureDates.includes(dateString)
}

export const isOpenWeekday = (date: Date, openWeekdays: number[]): boolean => {
  const dayOfWeek = date.getDay()
  return openWeekdays.includes(dayOfWeek)
}

export const getNextOpenDate = (
  startDate: Date,
  openWeekdays: number[],
  closureDates: string[]
): Date => {
  const maxIterations = 365
  let currentDate = new Date(startDate)
  let iterations = 0

  while (iterations < maxIterations) {
    if (isOpenWeekday(currentDate, openWeekdays) && !isClosureDate(currentDate, closureDates)) {
      return currentDate
    }
    currentDate.setDate(currentDate.getDate() + 1)
    iterations++
  }

  return startDate
}

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().split('T')[0]
}

export const formatDateDisplay = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export const getWeekdayName = (weekday: number): string => {
  const names = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']
  return names[weekday] || ''
}

export const parseBusinessHours = (businessHours: BusinessHours): Map<number, BusinessHourSlot[]> => {
  const map = new Map<number, BusinessHourSlot[]>()

  Object.entries(businessHours).forEach(([key, slots]) => {
    const weekday = parseInt(key, 10)
    if (!isNaN(weekday) && weekday >= 0 && weekday <= 6) {
      map.set(weekday, slots)
    }
  })

  return map
}
