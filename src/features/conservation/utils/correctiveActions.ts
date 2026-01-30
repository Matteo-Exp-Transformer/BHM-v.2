import type { ConservationPoint, ConservationPointType, TemperatureReading } from '@/types/conservation'

/**
 * Tolerance range for temperature readings (in Celsius)
 * Point is considered compliant if temperature is within setpoint ± TOLERANCE_C
 */
export const TOLERANCE_C = 1.0

/**
 * Corrective action types
 */
export type CorrectiveActionType = 'temperature_high' | 'temperature_low'

/**
 * Corrective action data structure
 */
export interface CorrectiveAction {
  type: CorrectiveActionType
  title: string
  description: string
  instructions: string
}

/**
 * Determines if a corrective action is needed based on the temperature reading
 * @param reading - The temperature reading to evaluate
 * @param point - The conservation point being monitored
 * @returns CorrectiveAction if action needed, null if temperature is within acceptable range
 */
export function getCorrectiveAction(
  reading: TemperatureReading,
  point: ConservationPoint
): CorrectiveAction | null {
  const { temperature } = reading
  const setpoint = point.setpoint_temp
  const min = setpoint - TOLERANCE_C
  const max = setpoint + TOLERANCE_C

  if (temperature > max) {
    return {
      type: 'temperature_high',
      title: 'Temperatura troppo alta',
      description: `Rilevata ${temperature.toFixed(1)}°C, range consentito: ${min.toFixed(1)}°C / ${max.toFixed(1)}°C`,
      instructions: getHighTempInstructions(point.type)
    }
  }

  if (temperature < min) {
    return {
      type: 'temperature_low',
      title: 'Temperatura troppo bassa',
      description: `Rilevata ${temperature.toFixed(1)}°C, range consentito: ${min.toFixed(1)}°C / ${max.toFixed(1)}°C`,
      instructions: getLowTempInstructions(point.type)
    }
  }

  return null
}

/**
 * Get HACCP-compliant instructions for high temperature situations
 * @param pointType - The type of conservation point (in English, as per codebase convention)
 * @returns Instructions in Italian for the UI
 */
function getHighTempInstructions(pointType: ConservationPointType): string {
  const suffix = ' Se il problema persiste contatta assistenza tecnica.'
  switch (pointType) {
    case 'fridge':
      return 'Abbassa il termostato del frigorifero e verifica che la porta sia chiusa correttamente.' + suffix
    case 'freezer':
      return 'Abbassa il termostato del congelatore. Verifica che la guarnizione sia integra e la porta chiusa.' + suffix
    case 'blast':
      return 'Verifica il funzionamento dell\'abbattitore e che non sia sovraccarico.' + suffix
    case 'ambient':
      return 'Regola il termostato per abbassare la temperatura.' + suffix
    default:
      return 'Regola il termostato per abbassare la temperatura.' + suffix
  }
}

/**
 * Get HACCP-compliant instructions for low temperature situations
 * @param pointType - The type of conservation point (in English, as per codebase convention)
 * @returns Instructions in Italian for the UI
 */
function getLowTempInstructions(pointType: ConservationPointType): string {
  const suffix = ' Se il problema persiste contatta assistenza tecnica.'
  switch (pointType) {
    case 'fridge':
      return 'Alza il termostato del frigorifero. Se la temperatura rimane troppo bassa, contatta assistenza tecnica.'
    case 'freezer':
      return 'La temperatura è più bassa del necessario. Alza il termostato per evitare consumi eccessivi.' + suffix
    case 'blast':
      return 'Verifica il corretto funzionamento dell\'abbattitore e regola il termostato se necessario.' + suffix
    case 'ambient':
      return 'Regola il termostato per alzare la temperatura.' + suffix
    default:
      return 'Regola il termostato per alzare la temperatura.' + suffix
  }
}

/**
 * Calculate the allowed temperature range for a conservation point
 * @param setpoint - The setpoint temperature in Celsius
 * @returns Object with min and max allowed temperatures
 */
export function getAllowedRange(setpoint: number): { min: number; max: number } {
  return {
    min: setpoint - TOLERANCE_C,
    max: setpoint + TOLERANCE_C
  }
}

/**
 * Check if a temperature reading is within the allowed range
 * @param temperature - The temperature to check
 * @param setpoint - The setpoint temperature
 * @returns true if temperature is within setpoint ± TOLERANCE_C
 */
export function isTemperatureCompliant(temperature: number, setpoint: number): boolean {
  const { min, max } = getAllowedRange(setpoint)
  return temperature >= min && temperature <= max
}
