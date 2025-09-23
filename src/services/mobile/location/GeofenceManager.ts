/**
 * GeofenceManager - B.8.4 Advanced Mobile Features
 * Zone monitoring and alerts for HACCP temperature monitoring
 */

import { LocationData, ConservationPointLocation } from './GPSService'

export interface Geofence {
  id: string
  name: string
  latitude: number
  longitude: number
  radius: number // meters
  type: 'conservation_point' | 'inspection_route' | 'restricted_area' | 'temperature_zone'
  status: 'active' | 'inactive' | 'maintenance'
  criticalTemperature?: {
    min: number
    max: number
    unit: 'celsius' | 'fahrenheit'
  }
  alerts: {
    onEnter: boolean
    onExit: boolean
    onTemperatureViolation: boolean
    onInspectionDue: boolean
  }
  metadata: {
    created: Date
    updated: Date
    lastInspection?: Date
    inspectionFrequency?: number // hours
    priority: 'low' | 'medium' | 'high' | 'critical'
  }
}

export interface GeofenceEvent {
  id: string
  type: 'enter' | 'exit' | 'temperature_violation' | 'inspection_due' | 'maintenance_required'
  geofenceId: string
  timestamp: Date
  location: LocationData
  severity: 'info' | 'warning' | 'error' | 'critical'
  message: string
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: Date
  data?: Record<string, any>
}

export interface GeofenceAlert {
  id: string
  type: 'push' | 'email' | 'sms' | 'in_app'
  title: string
  message: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  timestamp: Date
  acknowledged: boolean
  geofenceId: string
  eventId: string
}

export class GeofenceManager {
  private static instance: GeofenceManager
  private geofences: Map<string, Geofence> = new Map()
  private events: GeofenceEvent[] = []
  private alerts: GeofenceAlert[] = []
  private isMonitoring = false
  private currentLocation: LocationData | null = null
  private eventCallbacks: ((event: GeofenceEvent) => void)[] = []
  private alertCallbacks: ((alert: GeofenceAlert) => void)[] = []

  private constructor() {}

  public static getInstance(): GeofenceManager {
    if (!GeofenceManager.instance) {
      GeofenceManager.instance = new GeofenceManager()
    }
    return GeofenceManager.instance
  }

  /**
   * Initialize geofence manager
   */
  public async initialize(): Promise<void> {
    try {
      await this.loadDefaultGeofences()
      console.log('🚧 Geofence manager initialized')
    } catch (error) {
      console.error('❌ Geofence manager initialization failed:', error)
      throw new Error('Geofence manager initialization failed')
    }
  }

  /**
   * Start geofence monitoring
   */
  public startMonitoring(): void {
    if (this.isMonitoring) {
      console.warn('⚠️ Geofence monitoring already active')
      return
    }

    this.isMonitoring = true
    console.log('🚧 Geofence monitoring started')
  }

  /**
   * Stop geofence monitoring
   */
  public stopMonitoring(): void {
    this.isMonitoring = false
    console.log('🚧 Geofence monitoring stopped')
  }

  /**
   * Update current location and check geofences
   */
  public updateLocation(location: LocationData): void {
    if (!this.isMonitoring) return

    const previousLocation = this.currentLocation
    this.currentLocation = location

    // Check for geofence events
    this.checkGeofenceEvents(location, previousLocation)
  }

  /**
   * Add geofence
   */
  public addGeofence(geofence: Geofence): void {
    this.geofences.set(geofence.id, geofence)
    console.log(`🚧 Geofence added: ${geofence.name}`)
  }

  /**
   * Remove geofence
   */
  public removeGeofence(id: string): boolean {
    const removed = this.geofences.delete(id)
    if (removed) {
      console.log(`🚧 Geofence removed: ${id}`)
    }
    return removed
  }

  /**
   * Get geofence by ID
   */
  public getGeofence(id: string): Geofence | null {
    return this.geofences.get(id) || null
  }

  /**
   * Get all geofences
   */
  public getGeofences(): Geofence[] {
    return Array.from(this.geofences.values())
  }

  /**
   * Get geofences by type
   */
  public getGeofencesByType(type: Geofence['type']): Geofence[] {
    return Array.from(this.geofences.values()).filter(g => g.type === type)
  }

  /**
   * Get active geofences
   */
  public getActiveGeofences(): Geofence[] {
    return Array.from(this.geofences.values()).filter(g => g.status === 'active')
  }

  /**
   * Check if location is inside geofence
   */
  public isInsideGeofence(location: LocationData, geofenceId: string): boolean {
    const geofence = this.geofences.get(geofenceId)
    if (!geofence) return false

    const distance = this.calculateDistance(
      location.latitude,
      location.longitude,
      geofence.latitude,
      geofence.longitude
    )

    return distance <= geofence.radius
  }

  /**
   * Get geofences containing location
   */
  public getGeofencesContaining(location: LocationData): Geofence[] {
    return Array.from(this.geofences.values()).filter(geofence => {
      const distance = this.calculateDistance(
        location.latitude,
        location.longitude,
        geofence.latitude,
        geofence.longitude
      )
      return distance <= geofence.radius
    })
  }

  /**
   * Get geofence events
   */
  public getEvents(filter?: {
    type?: GeofenceEvent['type']
    geofenceId?: string
    severity?: GeofenceEvent['severity']
    acknowledged?: boolean
    dateRange?: { start: Date; end: Date }
  }): GeofenceEvent[] {
    let events = [...this.events]

    if (filter) {
      if (filter.type) {
        events = events.filter(e => e.type === filter.type)
      }
      if (filter.geofenceId) {
        events = events.filter(e => e.geofenceId === filter.geofenceId)
      }
      if (filter.severity) {
        events = events.filter(e => e.severity === filter.severity)
      }
      if (filter.acknowledged !== undefined) {
        events = events.filter(e => e.acknowledged === filter.acknowledged)
      }
      if (filter.dateRange) {
        events = events.filter(e => 
          e.timestamp >= filter.dateRange!.start && 
          e.timestamp <= filter.dateRange!.end
        )
      }
    }

    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  /**
   * Get alerts
   */
  public getAlerts(filter?: {
    type?: GeofenceAlert['type']
    severity?: GeofenceAlert['severity']
    acknowledged?: boolean
    geofenceId?: string
  }): GeofenceAlert[] {
    let alerts = [...this.alerts]

    if (filter) {
      if (filter.type) {
        alerts = alerts.filter(a => a.type === filter.type)
      }
      if (filter.severity) {
        alerts = alerts.filter(a => a.severity === filter.severity)
      }
      if (filter.acknowledged !== undefined) {
        alerts = alerts.filter(a => a.acknowledged === filter.acknowledged)
      }
      if (filter.geofenceId) {
        alerts = alerts.filter(a => a.geofenceId === filter.geofenceId)
      }
    }

    return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  /**
   * Acknowledge event
   */
  public acknowledgeEvent(eventId: string, acknowledgedBy: string): boolean {
    const event = this.events.find(e => e.id === eventId)
    if (!event) return false

    event.acknowledged = true
    event.acknowledgedBy = acknowledgedBy
    event.acknowledgedAt = new Date()

    console.log(`🚧 Event acknowledged: ${eventId}`)
    return true
  }

  /**
   * Acknowledge alert
   */
  public acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId)
    if (!alert) return false

    alert.acknowledged = true
    console.log(`🚧 Alert acknowledged: ${alertId}`)
    return true
  }

  /**
   * Subscribe to geofence events
   */
  public onEvent(callback: (event: GeofenceEvent) => void): () => void {
    this.eventCallbacks.push(callback)
    return () => {
      const index = this.eventCallbacks.indexOf(callback)
      if (index > -1) {
        this.eventCallbacks.splice(index, 1)
      }
    }
  }

  /**
   * Subscribe to alerts
   */
  public onAlert(callback: (alert: GeofenceAlert) => void): () => void {
    this.alertCallbacks.push(callback)
    return () => {
      const index = this.alertCallbacks.indexOf(callback)
      if (index > -1) {
        this.alertCallbacks.splice(index, 1)
      }
    }
  }

  /**
   * Clear events and alerts
   */
  public clearHistory(): void {
    this.events = []
    this.alerts = []
    console.log('🚧 Geofence history cleared')
  }

  /**
   * Check geofence events based on location changes
   */
  private checkGeofenceEvents(current: LocationData, previous: LocationData | null): void {
    const currentGeofences = this.getGeofencesContaining(current)
    const previousGeofences = previous ? this.getGeofencesContaining(previous) : []

    // Check for enter events
    currentGeofences.forEach(geofence => {
      const wasInside = previousGeofences.some(g => g.id === geofence.id)
      if (!wasInside && geofence.alerts.onEnter) {
        this.createEvent({
          type: 'enter',
          geofenceId: geofence.id,
          location: current,
          severity: 'info',
          message: `Entered ${geofence.name}`,
          data: { geofence }
        })
      }
    })

    // Check for exit events
    previousGeofences.forEach(geofence => {
      const isInside = currentGeofences.some(g => g.id === geofence.id)
      if (!isInside && geofence.alerts.onExit) {
        this.createEvent({
          type: 'exit',
          geofenceId: geofence.id,
          location: current,
          severity: 'info',
          message: `Exited ${geofence.name}`,
          data: { geofence }
        })
      }
    })

    // Check for inspection due
    currentGeofences.forEach(geofence => {
      if (geofence.alerts.onInspectionDue && this.isInspectionDue(geofence)) {
        this.createEvent({
          type: 'inspection_due',
          geofenceId: geofence.id,
          location: current,
          severity: 'warning',
          message: `Inspection due for ${geofence.name}`,
          data: { geofence }
        })
      }
    })
  }

  /**
   * Check if inspection is due for geofence
   */
  private isInspectionDue(geofence: Geofence): boolean {
    if (!geofence.metadata.lastInspection || !geofence.metadata.inspectionFrequency) {
      return false
    }

    const hoursSinceLastInspection = 
      (Date.now() - geofence.metadata.lastInspection.getTime()) / (1000 * 60 * 60)
    
    return hoursSinceLastInspection >= geofence.metadata.inspectionFrequency
  }

  /**
   * Create geofence event
   */
  private createEvent(eventData: Omit<GeofenceEvent, 'id' | 'timestamp' | 'acknowledged'>): void {
    const event: GeofenceEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      acknowledged: false,
      ...eventData
    }

    this.events.push(event)

    // Create alert if needed
    if (this.shouldCreateAlert(event)) {
      this.createAlert(event)
    }

    // Notify callbacks
    this.eventCallbacks.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        console.error('❌ Error in event callback:', error)
      }
    })
  }

  /**
   * Create alert for event
   */
  private createAlert(event: GeofenceEvent): void {
    const alert: GeofenceAlert = {
      id: this.generateAlertId(),
      type: 'in_app',
      title: this.getAlertTitle(event),
      message: event.message,
      severity: event.severity,
      timestamp: new Date(),
      acknowledged: false,
      geofenceId: event.geofenceId,
      eventId: event.id
    }

    this.alerts.push(alert)

    // Notify callbacks
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert)
      } catch (error) {
        console.error('❌ Error in alert callback:', error)
      }
    })
  }

  /**
   * Check if alert should be created for event
   */
  private shouldCreateAlert(event: GeofenceEvent): boolean {
    return event.severity === 'warning' || event.severity === 'error' || event.severity === 'critical'
  }

  /**
   * Get alert title based on event
   */
  private getAlertTitle(event: GeofenceEvent): string {
    switch (event.type) {
      case 'enter':
        return '🚪 Geofence Entry'
      case 'exit':
        return '🚪 Geofence Exit'
      case 'temperature_violation':
        return '🌡️ Temperature Alert'
      case 'inspection_due':
        return '📋 Inspection Due'
      case 'maintenance_required':
        return '🔧 Maintenance Required'
      default:
        return '🚧 Geofence Alert'
    }
  }

  /**
   * Load default geofences
   */
  private async loadDefaultGeofences(): Promise<void> {
    const defaultGeofences: Geofence[] = [
      {
        id: 'GF001',
        name: 'Main Refrigeration Zone',
        latitude: 45.4642,
        longitude: 9.1900,
        radius: 25,
        type: 'temperature_zone',
        status: 'active',
        criticalTemperature: { min: 0, max: 4, unit: 'celsius' },
        alerts: {
          onEnter: true,
          onExit: true,
          onTemperatureViolation: true,
          onInspectionDue: true
        },
        metadata: {
          created: new Date(),
          updated: new Date(),
          lastInspection: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          inspectionFrequency: 8, // 8 hours
          priority: 'high'
        }
      },
      {
        id: 'GF002',
        name: 'Freezer Storage Zone',
        latitude: 45.4645,
        longitude: 9.1905,
        radius: 15,
        type: 'temperature_zone',
        status: 'active',
        criticalTemperature: { min: -25, max: -18, unit: 'celsius' },
        alerts: {
          onEnter: true,
          onExit: true,
          onTemperatureViolation: true,
          onInspectionDue: true
        },
        metadata: {
          created: new Date(),
          updated: new Date(),
          lastInspection: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          inspectionFrequency: 4, // 4 hours
          priority: 'critical'
        }
      }
    ]

    defaultGeofences.forEach(geofence => {
      this.addGeofence(geofence)
    })
  }

  /**
   * Calculate distance between two points
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lon2 - lon1) * Math.PI / 180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c // Distance in meters
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Generate unique alert ID
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Export singleton instance
export const geofenceManager = GeofenceManager.getInstance()
export default geofenceManager
