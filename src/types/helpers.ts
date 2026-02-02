import { Database } from './database.types'

// Database row types
export type DbStaff = Database['public']['Tables']['staff']['Row']
export type DbTemperatureReading = Database['public']['Tables']['temperature_readings']['Row']
export type DbProduct = Database['public']['Tables']['products']['Row']
export type DbConservationPoint = Database['public']['Tables']['conservation_points']['Row']
export type DbUserProfile = Database['public']['Tables']['user_profiles']['Row']

// Computed types per UI
export type TemperatureStatus = 'compliant' | 'warning' | 'critical'
export type TemperatureMethod = 'manual' | 'automatic' | 'sensor'

/**
 * Calcola lo status di una lettura di temperatura (tolleranza centralizzata ±1.0°C)
 * Dentro setpoint ± tolerance = compliant, fuori = critical.
 * @param reading - Temperatura rilevata
 * @param setpoint - Temperatura target del punto di conservazione
 * @param tolerance - Tolleranza in gradi (default: 1)
 */
export function computeTemperatureStatus(
  reading: number,
  setpoint: number,
  tolerance = 1
): TemperatureStatus {
  const min = setpoint - tolerance
  const max = setpoint + tolerance
  if (reading >= min && reading <= max) return 'compliant'
  return 'critical'
}

/**
 * Calcola il compliance rate per un set di letture (tolleranza ±1.0°C)
 * @param readings - Array di letture con temperatura e setpoint
 * @param tolerance - Tolleranza in gradi (default: 1)
 * @returns Percentuale di compliance (0-100)
 */
export function computeComplianceRate(
  readings: Array<{ temperature: number; setpoint: number }>,
  tolerance = 1
): number {
  if (readings.length === 0) return 100

  const compliantReadings = readings.filter(
    ({ temperature, setpoint }) =>
      computeTemperatureStatus(temperature, setpoint, tolerance) === 'compliant'
  )

  return Math.round((compliantReadings.length / readings.length) * 100)
}

/**
 * Conta gli alert di temperatura per status (tolleranza ±1.0°C)
 * @param readings - Array di letture con temperatura e setpoint
 * @param tolerance - Tolleranza in gradi (default: 1)
 * @returns Conteggio alert per tipo
 */
export function computeTemperatureAlerts(
  readings: Array<{ temperature: number; setpoint: number }>,
  tolerance = 1
): { warning: number; critical: number; total: number } {
  const alerts = readings.reduce(
    (acc, { temperature, setpoint }) => {
      const status = computeTemperatureStatus(temperature, setpoint, tolerance)
      if (status === 'warning') acc.warning++
      if (status === 'critical') acc.critical++
      return acc
    },
    { warning: 0, critical: 0, total: 0 }
  )

  alerts.total = alerts.warning + alerts.critical
  return alerts
}

// Notification preferences type helper
export interface NotificationPreferences {
  email_enabled: boolean
  push_enabled: boolean
  temperature_alerts: boolean
  maintenance_reminders: boolean
  expiry_warnings: boolean
  daily_digest: boolean
}

export const defaultNotificationPreferences: NotificationPreferences = {
  email_enabled: true,
  push_enabled: true,
  temperature_alerts: true,
  maintenance_reminders: true,
  expiry_warnings: true,
  daily_digest: false,
}

/**
 * Parse notification preferences from JSONB field
 */
export function parseNotificationPreferences(
  json: unknown
): NotificationPreferences {
  if (!json || typeof json !== 'object') {
    return defaultNotificationPreferences
  }
  return { ...defaultNotificationPreferences, ...(json as object) }
}

