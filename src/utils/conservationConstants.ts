/**
 * SINGOLA FONTE DI VERITÀ per tutti i dati relativi ai punti di conservazione
 *
 * Questo file centralizza:
 * - Label dei tipi (Frigorifero, Congelatore, Ambiente, Abbattitore)
 * - Range numerici (min, max, optimal)
 * - Range stringa per UI/placeholder
 * - Icone emoji
 * - Colori Tailwind
 *
 * Importare questo file invece di ridefinire costanti locali.
 */

import type { ConservationPointType } from '@/types/conservation'

/**
 * Configurazione completa per ogni tipo di punto di conservazione
 */
export const CONSERVATION_POINT_CONFIGS = {
  fridge: {
    value: 'fridge' as ConservationPointType,
    label: 'Frigorifero',
    tempRange: {
      min: 1,
      max: 8,
      optimal: 4,
    },
    tempRangeString: '1°C - 8°C',
    icon: {
      emoji: '❄️',
      lucide: 'snowflake', // Nome dell'icona Lucide
    },
    color: {
      text: 'text-blue-600',
      bg: 'bg-sky-50',
      border: 'border-sky-300',
      badge: 'bg-sky-500 text-white',
    },
  },
  freezer: {
    value: 'freezer' as ConservationPointType,
    label: 'Congelatore',
    tempRange: {
      min: -25,
      max: -18,
      optimal: -20,
    },
    tempRangeString: '-25°C - -18°C',
    icon: {
      emoji: '🧊',
      lucide: 'snow',
    },
    color: {
      text: 'text-cyan-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-300',
      badge: 'bg-indigo-500 text-white',
    },
  },
  ambient: {
    value: 'ambient' as ConservationPointType,
    label: 'Ambiente',
    tempRange: {
      min: null,
      max: null,
      optimal: null,
    },
    tempRangeString: '', // Nessun range per tipo ambiente
    icon: {
      emoji: '🌡️',
      lucide: 'thermometer',
    },
    color: {
      text: 'text-amber-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-300',
      badge: 'bg-emerald-500 text-white',
    },
  },
  blast: {
    value: 'blast' as ConservationPointType,
    label: 'Abbattitore',
    tempRange: {
      min: null,
      max: null,
      optimal: null,
    },
    tempRangeString: '', // Nessun range per abbattitore
    icon: {
      emoji: '⚡',
      lucide: 'wind',
    },
    color: {
      text: 'text-emerald-600',
      bg: 'bg-purple-50',
      border: 'border-purple-300',
      badge: 'bg-purple-500 text-white',
    },
  },
} as const

/**
 * Helper: ottieni label del tipo
 */
export function getConservationTypeLabel(type: ConservationPointType): string {
  return CONSERVATION_POINT_CONFIGS[type]?.label || 'Non definito'
}

/**
 * Helper: ottieni emoji del tipo
 */
export function getConservationTypeEmoji(type: ConservationPointType): string {
  return CONSERVATION_POINT_CONFIGS[type]?.icon.emoji || '📦'
}

/**
 * Helper: ottieni range temperatura numerico
 */
export function getConservationTempRange(type: ConservationPointType): {
  min: number | null
  max: number | null
  optimal: number | null
} {
  return CONSERVATION_POINT_CONFIGS[type]?.tempRange || { min: null, max: null, optimal: null }
}

/**
 * Helper: ottieni range temperatura come stringa per UI
 */
export function getConservationTempRangeString(type: ConservationPointType): string {
  return CONSERVATION_POINT_CONFIGS[type]?.tempRangeString || ''
}

/**
 * Helper: ottieni colori per UI
 */
export function getConservationTypeColors(type: ConservationPointType) {
  return CONSERVATION_POINT_CONFIGS[type]?.color || {
    text: 'text-gray-600',
    bg: 'bg-gray-50',
    border: 'border-gray-300',
    badge: 'bg-gray-500 text-white',
  }
}

/**
 * Array di tutti i tipi per iterazione
 */
export const CONSERVATION_POINT_TYPES_ARRAY = Object.values(CONSERVATION_POINT_CONFIGS)

/**
 * Mappa per compatibilità con codice esistente (DEPRECATED - usare CONSERVATION_POINT_CONFIGS)
 */
export const CONSERVATION_POINT_TYPES_LEGACY = {
  fridge: {
    value: 'fridge' as const,
    label: 'Frigorifero',
    temperatureRange: { min: 1, max: 8 },
    color: 'text-blue-600',
  },
  freezer: {
    value: 'freezer' as const,
    label: 'Congelatore',
    temperatureRange: { min: -25, max: -18 },
    color: 'text-cyan-600',
  },
  ambient: {
    value: 'ambient' as const,
    label: 'Ambiente (dispense)',
    temperatureRange: { min: null, max: null },
    color: 'text-amber-600',
  },
  blast: {
    value: 'blast' as const,
    label: 'Abbattitore',
    temperatureRange: { min: null, max: null },
    color: 'text-emerald-600',
  },
}

/**
 * Temperature default per ogni tipo (usate in caso di fallback)
 */
export const DEFAULT_TEMPERATURES: Record<ConservationPointType, number> = {
  fridge: 4,
  freezer: -18,
  blast: -30,
  ambient: 20,
}
