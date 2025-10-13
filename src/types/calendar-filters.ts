// ============================================================================
// CALENDAR FILTERS - Type Definitions
// ============================================================================
// Definizioni TypeScript per il nuovo sistema filtri calendario

/**
 * Stati possibili di un evento nel calendario
 */
export type EventStatus = 
  | 'to_complete'   // Da completare (oggi, non completato)
  | 'completed'     // Completato (oggi, completato)
  | 'overdue'       // In ritardo (fino a 7 giorni fa, non completato)
  | 'future'        // Eventi futuri (da domani in poi)

/**
 * Tipi di evento nel calendario
 */
export type EventType = 
  | 'generic_task'       // Mansioni/Attività generiche
  | 'maintenance'        // Manutenzioni (temperature, sanitization, defrosting)
  | 'product_expiry'     // Scadenze prodotti

/**
 * Interfaccia filtri calendario
 */
export interface CalendarFilters {
  departments: string[]      // UUID dei reparti selezionati
  statuses: EventStatus[]    // Stati evento selezionati
  types: EventType[]         // Tipi evento selezionati
}

/**
 * Filtri di default (tutti vuoti = mostra tutto)
 */
export const DEFAULT_CALENDAR_FILTERS: CalendarFilters = {
  departments: [],
  statuses: [],
  types: []
}

/**
 * Labels per stati evento (UI)
 */
export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  to_complete: 'Da completare',
  completed: 'Completato',
  overdue: 'In ritardo',
  future: 'Eventi futuri'
}

/**
 * Labels per tipi evento (UI)
 */
export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  generic_task: 'Mansioni',
  maintenance: 'Manutenzioni',
  product_expiry: 'Scadenze Prodotti'
}

/**
 * Icone per tipi evento (UI)
 */
export const EVENT_TYPE_ICONS: Record<EventType, string> = {
  generic_task: '📋',
  maintenance: '🔧',
  product_expiry: '📦'
}

/**
 * Colori per stati evento (UI)
 */
export const EVENT_STATUS_COLORS: Record<EventStatus, { bg: string; text: string; border: string }> = {
  to_complete: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-300'
  },
  completed: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300'
  },
  overdue: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-300'
  },
  future: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300'
  }
}

/**
 * Utility: Verifica se tutti i filtri sono vuoti (mostra tutto)
 */
export function areAllFiltersEmpty(filters: CalendarFilters): boolean {
  return (
    filters.departments.length === 0 &&
    filters.statuses.length === 0 &&
    filters.types.length === 0
  )
}

/**
 * Utility: Calcola stato evento in base alla data
 */
export function calculateEventStatus(
  eventDate: Date,
  isCompleted: boolean
): EventStatus {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  
  const eventDay = new Date(eventDate)
  eventDay.setHours(0, 0, 0, 0)
  
  const diffDays = Math.floor((now.getTime() - eventDay.getTime()) / (1000 * 60 * 60 * 24))
  
  // Futuro (da domani in poi)
  if (diffDays < 0) {
    return 'future'
  }
  
  // Oggi
  if (diffDays === 0) {
    return isCompleted ? 'completed' : 'to_complete'
  }
  
  // In ritardo (fino a 7 giorni fa, non completato)
  if (diffDays >= 1 && diffDays <= 7) {
    return isCompleted ? 'completed' : 'overdue'
  }
  
  // Più di 7 giorni fa
  return isCompleted ? 'completed' : 'overdue'
}

/**
 * Utility: Determina tipo evento da source/metadata
 */
export function determineEventType(
  source: string,
  metadata?: { [key: string]: any }
): EventType {
  if (source === 'maintenance' || metadata?.maintenance_id) {
    return 'maintenance'
  }
  
  if (source === 'product_expiry' || metadata?.product_id) {
    return 'product_expiry'
  }
  
  // Default: generic_task
  return 'generic_task'
}

/**
 * Utility: Verifica se evento passa i filtri
 */
export function doesEventPassFilters(
  event: {
    department_id?: string | null
    status: EventStatus
    type: EventType
  },
  filters: CalendarFilters
): boolean {
  // Se tutti i filtri sono vuoti, mostra tutto
  if (areAllFiltersEmpty(filters)) {
    return true
  }
  
  // Filtro Reparto
  if (filters.departments.length > 0) {
    // Se evento non ha reparto, escludi
    if (!event.department_id) return false
    // Se reparto non è tra i selezionati, escludi
    if (!filters.departments.includes(event.department_id)) return false
  }
  
  // Filtro Stato
  if (filters.statuses.length > 0) {
    if (!filters.statuses.includes(event.status)) return false
  }
  
  // Filtro Tipo
  if (filters.types.length > 0) {
    if (!filters.types.includes(event.type)) return false
  }
  
  return true
}

