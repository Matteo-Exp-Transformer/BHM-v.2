/**
 * Real-time Temperature Monitoring System
 * Handles temperature threshold monitoring, alerts, and compliance tracking
 */

import { realtimeManager } from './RealtimeConnectionManager'
import type { TemperatureReading, ConservationPoint } from '@/lib/supabase/client'

export interface TemperatureThresholds {
  fridge: { min: number; max: number }
  freezer: { min: number; max: number }
  ambient: { min: number; max: number }
  blast: { min: number; max: number }
}

export interface TemperatureAlert {
  id: string
  conservation_point_id: string
  conservation_point_name: string
  reading: TemperatureReading
  violation_type: 'too_high' | 'too_low' | 'extreme'
  severity: 'warning' | 'critical' | 'emergency'
  threshold_min: number
  threshold_max: number
  deviation: number
  timestamp: Date
  acknowledged: boolean
  acknowledged_by?: string
  acknowledged_at?: Date
  notes?: string
}

export interface TemperatureStats {
  total_readings: number
  violations_today: number
  compliance_rate: number
  avg_temperature: number
  trend: 'stable' | 'rising' | 'falling'
  last_reading?: TemperatureReading
}

export interface MonitoringConfig {
  thresholds: TemperatureThresholds
  alert_settings: {
    immediate_alerts: boolean
    email_notifications: boolean
    sms_critical: boolean
    violation_tolerance: number // seconds before triggering alert
  }
  compliance_settings: {
    required_frequency: number // minutes between readings
    warning_threshold: number // % compliance rate warning
    critical_threshold: number // % compliance rate critical
  }
}

class TemperatureMonitor {
  private subscriptionId?: string
  private conservationPoints: Map<string, ConservationPoint> = new Map()
  private activeAlerts: Map<string, TemperatureAlert> = new Map()
  private config: MonitoringConfig
  private alertCallbacks: ((alert: TemperatureAlert) => void)[] = []
  private statsCallbacks: ((stats: TemperatureStats) => void)[] = []
  private recentReadings: Map<string, TemperatureReading[]> = new Map()

  // Default HACCP temperature thresholds
  private defaultThresholds: TemperatureThresholds = {
    fridge: { min: 0, max: 4 },
    freezer: { min: -25, max: -18 },
    ambient: { min: 15, max: 25 },
    blast: { min: -40, max: -30 }
  }

  constructor(config?: Partial<MonitoringConfig>) {
    this.config = {
      thresholds: this.defaultThresholds,
      alert_settings: {
        immediate_alerts: true,
        email_notifications: true,
        sms_critical: true,
        violation_tolerance: 300 // 5 minutes
      },
      compliance_settings: {
        required_frequency: 60, // 1 hour
        warning_threshold: 85,
        critical_threshold: 70
      },
      ...config
    }
  }

  /**
   * Start monitoring temperature readings for a company
   */
  public async startMonitoring(companyId: string, conservationPoints: ConservationPoint[]): Promise<void> {
    // Store conservation points for reference
    conservationPoints.forEach(point => {
      this.conservationPoints.set(point.id, point)
      this.recentReadings.set(point.id, [])
    })

    // Subscribe to new temperature readings
    this.subscriptionId = realtimeManager.subscribe({
      table: 'temperature_readings',
      event: 'INSERT',
      callback: (payload) => this.handleNewReading(payload.new),
      filter: `company_id=eq.${companyId}`
    })

    console.log(`🌡️ Temperature monitoring started for ${conservationPoints.length} conservation points`)
  }

  /**
   * Stop monitoring and cleanup
   */
  public stopMonitoring(): void {
    if (this.subscriptionId) {
      realtimeManager.unsubscribe(this.subscriptionId)
      this.subscriptionId = undefined
    }

    this.conservationPoints.clear()
    this.activeAlerts.clear()
    this.recentReadings.clear()

    console.log('🛑 Temperature monitoring stopped')
  }

  /**
   * Handle new temperature reading
   */
  private handleNewReading(reading: TemperatureReading): void {
    const conservationPoint = this.conservationPoints.get(reading.conservation_point_id)
    if (!conservationPoint) return

    // Add to recent readings
    const pointReadings = this.recentReadings.get(reading.conservation_point_id) || []
    pointReadings.unshift(reading)
    this.recentReadings.set(reading.conservation_point_id, pointReadings.slice(0, 100)) // Keep last 100

    // Check for violations
    const violation = this.checkViolation(reading, conservationPoint)
    if (violation) {
      this.handleViolation(violation)
    } else {
      // Clear any existing alerts for this point if temperature is now normal
      this.clearAlerts(reading.conservation_point_id)
    }

    // Update statistics
    this.updateStats(reading.conservation_point_id)
  }

  /**
   * Check if temperature reading violates thresholds
   */
  private checkViolation(reading: TemperatureReading, point: ConservationPoint): TemperatureAlert | null {
    const thresholds = this.getThresholdsForPoint(point)
    if (!thresholds) return null

    const temp = reading.temperature
    const { min, max } = thresholds

    // Determine violation type and severity
    let violation_type: 'too_high' | 'too_low' | 'extreme'
    let severity: 'warning' | 'critical' | 'emergency'
    let deviation: number

    if (temp < min) {
      violation_type = 'too_low'
      deviation = min - temp
    } else if (temp > max) {
      violation_type = 'too_high'
      deviation = temp - max
    } else {
      return null // No violation
    }

    // Determine severity based on deviation
    const tolerance = (max - min) * 0.1 // 10% tolerance
    if (deviation > tolerance * 3) {
      severity = 'emergency'
    } else if (deviation > tolerance) {
      severity = 'critical'
    } else {
      severity = 'warning'
    }

    return {
      id: `alert_${reading.id}_${Date.now()}`,
      conservation_point_id: reading.conservation_point_id,
      conservation_point_name: point.name,
      reading,
      violation_type,
      severity,
      threshold_min: min,
      threshold_max: max,
      deviation,
      timestamp: new Date(),
      acknowledged: false
    }
  }

  /**
   * Handle temperature violation
   */
  private handleViolation(alert: TemperatureAlert): void {
    // Check if we already have an active alert for this point
    const existingAlert = Array.from(this.activeAlerts.values())
      .find(a => a.conservation_point_id === alert.conservation_point_id && !a.acknowledged)

    if (existingAlert) {
      // Update existing alert if this one is more severe
      if (this.getSeverityWeight(alert.severity) > this.getSeverityWeight(existingAlert.severity)) {
        this.activeAlerts.set(existingAlert.id, alert)
        this.notifyAlertCallbacks(alert)
      }
    } else {
      // Create new alert
      this.activeAlerts.set(alert.id, alert)
      this.notifyAlertCallbacks(alert)
    }

    console.warn(`🚨 Temperature violation:`, {
      point: alert.conservation_point_name,
      temperature: alert.reading.temperature,
      violation: alert.violation_type,
      severity: alert.severity
    })
  }

  /**
   * Clear alerts for a conservation point
   */
  private clearAlerts(conservationPointId: string): void {
    const alertsToRemove = Array.from(this.activeAlerts.entries())
      .filter(([_, alert]) => alert.conservation_point_id === conservationPointId && !alert.acknowledged)

    alertsToRemove.forEach(([alertId]) => {
      this.activeAlerts.delete(alertId)
    })
  }

  /**
   * Get thresholds for a conservation point
   */
  private getThresholdsForPoint(point: ConservationPoint): { min: number; max: number } | null {
    // Use point-specific thresholds if available
    if (point.temperature_min !== null && point.temperature_max !== null) {
      return {
        min: point.temperature_min,
        max: point.temperature_max
      }
    }

    // Fall back to type-based thresholds
    return this.config.thresholds[point.type] || null
  }

  /**
   * Update statistics for a conservation point
   */
  private updateStats(conservationPointId: string): void {
    const readings = this.recentReadings.get(conservationPointId) || []
    if (readings.length === 0) return

    // Calculate statistics for the last 24 hours
    const last24h = readings.filter(r =>
      new Date(r.reading_time).getTime() > Date.now() - 24 * 60 * 60 * 1000
    )

    const violations = Array.from(this.activeAlerts.values())
      .filter(a => a.conservation_point_id === conservationPointId)

    const stats: TemperatureStats = {
      total_readings: last24h.length,
      violations_today: violations.length,
      compliance_rate: last24h.length > 0 ? ((last24h.length - violations.length) / last24h.length) * 100 : 100,
      avg_temperature: last24h.reduce((sum, r) => sum + r.temperature, 0) / last24h.length || 0,
      trend: this.calculateTrend(last24h),
      last_reading: readings[0]
    }

    this.notifyStatsCallbacks(stats)
  }

  /**
   * Calculate temperature trend
   */
  private calculateTrend(readings: TemperatureReading[]): 'stable' | 'rising' | 'falling' {
    if (readings.length < 3) return 'stable'

    const recent = readings.slice(0, 3).map(r => r.temperature)
    const older = readings.slice(3, 6).map(r => r.temperature)

    const recentAvg = recent.reduce((sum, t) => sum + t, 0) / recent.length
    const olderAvg = older.reduce((sum, t) => sum + t, 0) / older.length

    const difference = recentAvg - olderAvg
    const threshold = 0.5 // 0.5°C threshold for trend detection

    if (difference > threshold) return 'rising'
    if (difference < -threshold) return 'falling'
    return 'stable'
  }

  /**
   * Acknowledge an alert
   */
  public acknowledgeAlert(alertId: string, acknowledgedBy: string, notes?: string): void {
    const alert = this.activeAlerts.get(alertId)
    if (alert) {
      alert.acknowledged = true
      alert.acknowledged_by = acknowledgedBy
      alert.acknowledged_at = new Date()
      alert.notes = notes

      this.activeAlerts.set(alertId, alert)
      console.log(`✅ Alert acknowledged: ${alertId}`)
    }
  }

  /**
   * Get active alerts
   */
  public getActiveAlerts(): TemperatureAlert[] {
    return Array.from(this.activeAlerts.values()).filter(alert => !alert.acknowledged)
  }

  /**
   * Get alerts for a specific conservation point
   */
  public getAlertsForPoint(conservationPointId: string): TemperatureAlert[] {
    return Array.from(this.activeAlerts.values())
      .filter(alert => alert.conservation_point_id === conservationPointId)
  }

  /**
   * Update monitoring configuration
   */
  public updateConfig(config: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...config }
    console.log('🔧 Temperature monitoring configuration updated')
  }

  /**
   * Event listeners
   */
  public onAlert(callback: (alert: TemperatureAlert) => void): void {
    this.alertCallbacks.push(callback)
  }

  public onStatsUpdate(callback: (stats: TemperatureStats) => void): void {
    this.statsCallbacks.push(callback)
  }

  public removeAlertCallback(callback: (alert: TemperatureAlert) => void): void {
    const index = this.alertCallbacks.indexOf(callback)
    if (index > -1) {
      this.alertCallbacks.splice(index, 1)
    }
  }

  public removeStatsCallback(callback: (stats: TemperatureStats) => void): void {
    const index = this.statsCallbacks.indexOf(callback)
    if (index > -1) {
      this.statsCallbacks.splice(index, 1)
    }
  }

  /**
   * Utility methods
   */
  private getSeverityWeight(severity: string): number {
    switch (severity) {
      case 'emergency': return 3
      case 'critical': return 2
      case 'warning': return 1
      default: return 0
    }
  }

  private notifyAlertCallbacks(alert: TemperatureAlert): void {
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert)
      } catch (error) {
        console.error('Error in alert callback:', error)
      }
    })
  }

  private notifyStatsCallbacks(stats: TemperatureStats): void {
    this.statsCallbacks.forEach(callback => {
      try {
        callback(stats)
      } catch (error) {
        console.error('Error in stats callback:', error)
      }
    })
  }
}

// Export singleton instance
export const temperatureMonitor = new TemperatureMonitor()
export default TemperatureMonitor