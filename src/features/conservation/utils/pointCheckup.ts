import { startOfDay, endOfDay, differenceInDays, isAfter } from 'date-fns'
import type {
  ConservationPoint,
  MaintenanceTask,
  ConservationPointCheckup,
  TemperatureReading,
} from '@/types/conservation'
import { MAINTENANCE_TASK_TYPES } from '@/types/conservation'

/**
 * Calcola il check-up completo di un punto di conservazione
 *
 * @param point - Punto di conservazione con eventuale last_temperature_reading
 * @param tasks - Lista completa dei maintenance_tasks del punto
 * @returns Check-up con stato, temperatura, manutenzioni oggi/arretrate, messaggi
 */
export function getPointCheckup(
  point: ConservationPoint,
  tasks: MaintenanceTask[]
): ConservationPointCheckup {
  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)

  // 1. CHECK TEMPERATURA
  const temperatureCheck = checkTemperature(point)

  // Helper: task tipo "temperature" considerato soddisfatto se c'è una lettura nel giorno di next_due o dopo
  const isTemperatureTaskSatisfiedByReading = (task: MaintenanceTask): boolean => {
    if (task.type !== 'temperature') return false
    const reading = point.last_temperature_reading
    if (!reading) return false
    const recordedAt = new Date(reading.recorded_at)
    const taskDue = new Date(task.next_due)
    return recordedAt >= startOfDay(taskDue)
  }

  // Helper: task considerato "completato oggi" (non mostrarlo come da fare oggi)
  const isCompletedToday = (task: MaintenanceTask): boolean => {
    const lc = task.last_completed
    if (!lc) return false
    const d = lc instanceof Date ? lc : new Date(lc)
    return d >= todayStart && d <= todayEnd
  }

  // 2. MANUTENZIONI OGGI (tutta la giornata; escludi task già completati oggi)
  const todayTasks = tasks.filter(task => {
    if (isCompletedToday(task)) return false
    const taskDate = new Date(task.next_due)
    return taskDate >= todayStart && taskDate <= todayEnd
  })

  const todayCompleted = todayTasks.filter(t => t.status === 'completed')
  const todayPending = todayTasks.filter(t => {
    if (t.status === 'completed' || t.status === 'skipped') return false
    // Task "Rilevamento Temperature": se c'è una lettura oggi, non mostrarlo come da completare
    if (t.type === 'temperature' && point.last_temperature_reading) {
      const readingDate = startOfDay(new Date(point.last_temperature_reading.recorded_at))
      if (readingDate.getTime() === todayStart.getTime()) return false
    }
    return true
  })

  // 3. ARRETRATI con indicatore di gravità (esclusi i task temperatura già “soddisfatti” da una lettura)
  const overdueTasks = tasks
    .filter(task => {
      const taskDate = new Date(task.next_due)
      const isOverdue = isAfter(todayStart, taskDate) && task.status !== 'completed' && task.status !== 'skipped'
      if (!isOverdue) return false
      // Task "Rilevamento Temperature": se c'è una lettura nel giorno di scadenza o dopo, non mostrarlo come arretrato
      if (isTemperatureTaskSatisfiedByReading(task)) return false
      return true
    })
    .map(task => {
      const daysOverdue = differenceInDays(now, new Date(task.next_due))
      const severity = calculateOverdueSeverity(daysOverdue)
      return { ...task, daysOverdue, severity }
    })
    .sort((a, b) => b.daysOverdue - a.daysOverdue) // Più vecchi prima

  // 4. STATO COMPLESSIVO
  let overallStatus: ConservationPointCheckup['overallStatus'] = 'normal'

  // CRITICO: temperatura fuori range O arretrati gravi (>3 giorni)
  if (
    !temperatureCheck.inRange ||
    overdueTasks.some(t => t.severity === 'critical' || t.severity === 'high')
  ) {
    overallStatus = 'critical'
  }
  // ATTENZIONE: task oggi non completati O arretrati leggeri (1-3 giorni)
  else if (todayPending.length > 0 || overdueTasks.length > 0) {
    overallStatus = 'warning'
  }

  // 5. MESSAGGI SEPARATI per temperatura e manutenzioni
  const messages: ConservationPointCheckup['messages'] = {
    priority: 'both',
  }

  // Messaggio temperatura (solo se non è abbattitore/ambient)
  if (!temperatureCheck.inRange && point.type !== 'blast' && point.type !== 'ambient') {
    messages.temperature = temperatureCheck.message
  }

  // Messaggio manutenzioni
  if (overdueTasks.length > 0) {
    const criticalCount = overdueTasks.filter(t => t.severity === 'critical').length
    const maxDays = Math.max(...overdueTasks.map(t => t.daysOverdue))

    if (criticalCount > 0) {
      messages.maintenance = `${criticalCount} manutenzione${criticalCount > 1 ? 'i' : ''} critica arretrata (fino a ${maxDays} giorn${maxDays > 1 ? 'i' : 'o'})`
    } else {
      messages.maintenance = `${overdueTasks.length} manutenzione${overdueTasks.length > 1 ? 'i' : ''} arretrata`
    }
  } else if (todayPending.length > 0) {
    messages.maintenance = `${todayPending.length} manutenzione${todayPending.length > 1 ? 'i' : ''} di oggi da completare`
  }

  // Determina priorità messaggi
  if (!messages.temperature && !messages.maintenance) {
    messages.priority = 'temperature'
  } else if (messages.temperature && !messages.maintenance) {
    messages.priority = 'temperature'
  } else if (!messages.temperature && messages.maintenance) {
    messages.priority = 'maintenance'
  } else {
    messages.priority = 'both'
  }

  // 6. PROSSIMA MANUTENZIONE in scadenza (escludi task completati oggi)
  const futureTasks = tasks
    .filter(t => {
      if (isCompletedToday(t)) return false
      return new Date(t.next_due) > now && (t.status === 'scheduled' || !t.status)
    })
    .sort((a, b) => new Date(a.next_due).getTime() - new Date(b.next_due).getTime())

  const nextMaintenanceDue = futureTasks[0]
    ? {
        task: futureTasks[0],
        daysUntil: differenceInDays(new Date(futureTasks[0].next_due), now),
      }
    : undefined

  // 7. Prossima per tipologia (ordine fisso; solo tipologie con almeno un task futuro)
  const MAINTENANCE_TYPE_ORDER: MaintenanceTask['type'][] = ['temperature', 'sanitization', 'defrosting', 'expiry_check']
  const byType = new Map<MaintenanceTask['type'], { task: MaintenanceTask; daysUntil: number }>()
  for (const t of futureTasks) {
    if (!byType.has(t.type)) {
      byType.set(t.type, { task: t, daysUntil: differenceInDays(new Date(t.next_due), now) })
    }
  }
  const nextMaintenanceByType = MAINTENANCE_TYPE_ORDER.filter(type => byType.has(type)).map(type => {
    const { task, daysUntil } = byType.get(type)!
    const label = task.title || (MAINTENANCE_TASK_TYPES[type]?.label ?? type)
    return {
      type,
      label,
      next_due: new Date(task.next_due),
      daysUntil,
    }
  })

  return {
    overallStatus,
    temperature: temperatureCheck,
    todayMaintenance: {
      allCompleted: todayPending.length === 0,
      total: todayTasks.length,
      completed: todayCompleted.length,
      pending: todayPending,
    },
    overdueMaintenance: {
      count: overdueTasks.length,
      tasks: overdueTasks,
    },
    messages,
    nextMaintenanceDue,
    nextMaintenanceByType: nextMaintenanceByType.length > 0 ? nextMaintenanceByType : undefined,
  }
}

/**
 * Verifica lo stato della temperatura del punto
 *
 * @param point - Punto di conservazione
 * @returns Oggetto con inRange, message e lastReading
 */
function checkTemperature(point: ConservationPoint): {
  inRange: boolean
  message?: string
  lastReading?: TemperatureReading
} {
  // Abbattitore e Ambiente non richiedono controllo temperatura
  if (point.type === 'blast' || point.type === 'ambient') {
    return {
      inRange: true,
      lastReading: point.last_temperature_reading,
    }
  }

  // Frigorifero/Freezer senza lettura
  if (!point.last_temperature_reading) {
    return {
      inRange: false,
      message: 'Rileva la temperatura per ripristinare lo stato conforme.',
      lastReading: undefined,
    }
  }

  const reading = point.last_temperature_reading
  const setpoint = point.setpoint_temp
  const TOLERANCE = 1.0 // Tolleranza centralizzata ±1°C
  const min = setpoint - TOLERANCE
  const max = setpoint + TOLERANCE

  // Temperatura troppo bassa
  if (reading.temperature < min) {
    return {
      inRange: false,
      message: `Temperatura troppo bassa (${reading.temperature}°C). Regola il termostato.`,
      lastReading: reading,
    }
  }

  // Temperatura troppo alta
  if (reading.temperature > max) {
    return {
      inRange: false,
      message: `Temperatura troppo alta (${reading.temperature}°C). Regola il termostato.`,
      lastReading: reading,
    }
  }

  // Temperatura conforme
  return {
    inRange: true,
    message: 'Temperatura conforme',
    lastReading: reading,
  }
}

/**
 * Calcola il livello di gravità in base ai giorni di ritardo
 *
 * @param daysOverdue - Giorni di ritardo
 * @returns Livello di severity
 */
function calculateOverdueSeverity(
  daysOverdue: number
): 'low' | 'medium' | 'high' | 'critical' {
  if (daysOverdue >= 7) return 'critical' // 🔴 Rosso
  if (daysOverdue >= 3) return 'high' // 🟠 Arancione
  if (daysOverdue >= 1) return 'medium' // 🟡 Giallo
  return 'low' // 🟤 Grigio
}
