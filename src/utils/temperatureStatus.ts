/**
 * Temperature Status Utilities
 * 
 * Since temperature_readings table only stores basic data (temperature, recorded_at),
 * we calculate status dynamically based on conservation point setpoint and type.
 */

// LOCKED: 2025-01-16 - TemperatureValidation completamente testato e blindato
// Test eseguiti: 6 test funzionali, tutti passati (100%)
// Funzionalità testate: getToleranceForType, calculateTemperatureStatus, calculateComplianceRate, getReadingStatus, filterReadingsByStatus, getToleranceRange
// Combinazioni testate: tutti i tipi punti conservazione, scenari compliant/warning/critical, array vuoti/misti, edge cases
// NON MODIFICARE SENZA PERMESSO ESPLICITO

import type { TemperatureReading, ConservationPoint } from '@/types/conservation'

export type TemperatureStatus = 'compliant' | 'warning' | 'critical'

/**
 * Get tolerance range based on conservation point type
 */
export function getToleranceForType(type: ConservationPoint['type']): number {
  switch (type) {
    case 'blast':
      return 5
    case 'ambient':
      return 3
    case 'fridge':
    case 'freezer':
    default:
      return 2
  }
}

/**
 * Calculate temperature status dynamically
 * 
 * @param temperature - Current temperature reading
 * @param setpoint - Target temperature from conservation point
 * @param type - Conservation point type (affects tolerance)
 * @returns Status: 'compliant', 'warning', or 'critical'
 */
export function calculateTemperatureStatus(
  temperature: number,
  setpoint: number,
  type: ConservationPoint['type']
): TemperatureStatus {
  const tolerance = getToleranceForType(type)
  const diff = Math.abs(temperature - setpoint)
  
  if (diff <= tolerance) return 'compliant'
  if (diff <= tolerance + 2) return 'warning'
  return 'critical'
}

/**
 * Get temperature status for a reading with conservation point data
 * 
 * @param reading - Temperature reading (must include conservation_point)
 * @returns Status or 'compliant' if no conservation_point data
 */
export function getReadingStatus(
  reading: TemperatureReading & { conservation_point?: ConservationPoint }
): TemperatureStatus {
  if (!reading.conservation_point) {
    return 'compliant' // Default if no conservation point data
  }
  
  return calculateTemperatureStatus(
    reading.temperature,
    reading.conservation_point.setpoint_temp,
    reading.conservation_point.type
  )
}

/**
 * Filter readings by status
 * 
 * @param readings - Array of readings with conservation_point data
 * @param status - Target status to filter
 * @returns Filtered array
 */
export function filterReadingsByStatus(
  readings: (TemperatureReading & { conservation_point?: ConservationPoint })[],
  status: TemperatureStatus
): (TemperatureReading & { conservation_point?: ConservationPoint })[] {
  return readings.filter(reading => getReadingStatus(reading) === status)
}

/**
 * Calculate compliance rate for readings
 * 
 * @param readings - Array of readings with conservation_point data
 * @returns Compliance rate as percentage (0-100)
 */
export function calculateComplianceRate(
  readings: (TemperatureReading & { conservation_point?: ConservationPoint })[]
): number {
  if (readings.length === 0) return 100
  
  const compliantCount = filterReadingsByStatus(readings, 'compliant').length
  return Math.round((compliantCount / readings.length) * 100)
}

/**
 * Get tolerance range for a conservation point
 */
export function getToleranceRange(
  setpoint: number,
  type: ConservationPoint['type']
): { min: number; max: number } {
  const tolerance = getToleranceForType(type)
  return {
    min: setpoint - tolerance,
    max: setpoint + tolerance,
  }
}
