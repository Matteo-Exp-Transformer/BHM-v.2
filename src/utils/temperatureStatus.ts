/**
 * Temperature Status Utilities
 *
 * Uses centralized tolerance from correctiveActions (TOLERANCE_C = 1.0°C).
 * Point status is compliant if temperature is within setpoint ± 1.0°C.
 */

import type { TemperatureReading, ConservationPoint } from '@/types/conservation'
import { TOLERANCE_C, getAllowedRange, isTemperatureCompliant } from '@/features/conservation/utils/correctiveActions'

export type TemperatureStatus = 'compliant' | 'warning' | 'critical'

/** Re-export for consumers that need the numeric tolerance */
export const getToleranceForType = (_type: ConservationPoint['type']): number => TOLERANCE_C

/**
 * Calculate temperature status dynamically (centralized ±1.0°C)
 *
 * @param temperature - Current temperature reading
 * @param setpoint - Target temperature from conservation point
 * @returns Status: 'compliant' (within ±1°C), 'critical' (outside ±1°C). No 'warning' for temp in range.
 */
export function calculateTemperatureStatus(
  temperature: number,
  setpoint: number,
  _type?: ConservationPoint['type']
): TemperatureStatus {
  if (!isTemperatureCompliant(temperature, setpoint)) return 'critical'
  return 'compliant'
}

/**
 * Get temperature status for a reading with conservation point data
 */
export function getReadingStatus(
  reading: TemperatureReading & { conservation_point?: ConservationPoint }
): TemperatureStatus {
  if (!reading.conservation_point) return 'compliant'
  return calculateTemperatureStatus(
    reading.temperature,
    reading.conservation_point.setpoint_temp,
    reading.conservation_point.type
  )
}

/**
 * Filter readings by status
 */
export function filterReadingsByStatus(
  readings: (TemperatureReading & { conservation_point?: ConservationPoint })[],
  status: TemperatureStatus
): (TemperatureReading & { conservation_point?: ConservationPoint })[] {
  return readings.filter(reading => getReadingStatus(reading) === status)
}

/**
 * Calculate compliance rate for readings (within setpoint ± 1.0°C)
 */
export function calculateComplianceRate(
  readings: (TemperatureReading & { conservation_point?: ConservationPoint })[]
): number {
  if (readings.length === 0) return 100
  const compliantCount = filterReadingsByStatus(readings, 'compliant').length
  return Math.round((compliantCount / readings.length) * 100)
}

/**
 * Get tolerance range for a conservation point (centralized ±1.0°C)
 */
export function getToleranceRange(
  setpoint: number,
  _type?: ConservationPoint['type']
): { min: number; max: number } {
  return getAllowedRange(setpoint)
}
