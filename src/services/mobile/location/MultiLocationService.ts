/**
 * MultiLocationService - B.10.4 Session 2 Enhanced GPS Integration
 * Advanced GPS integration for multi-location facility management
 * Extends B.8.4 GPSService with multi-location capabilities
 */

import {
  gpsService,
  LocationData,
  ConservationPointLocation,
} from './GPSService'
import { backgroundSyncService } from '../pwa/BackgroundSyncService'
import { pushNotificationService } from '../pwa/PushNotificationService'

export interface FacilityLocation {
  id: string
  name: string
  type: 'restaurant' | 'warehouse' | 'production' | 'distribution' | 'office'
  address: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  coordinates: {
    latitude: number
    longitude: number
    altitude?: number
  }
  radius: number // meters
  timezone: string
  operatingHours: {
    [key: string]: {
      open: string
      close: string
      is24Hours?: boolean
    }
  }
  haccpProfile: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    certificationStatus: 'certified' | 'pending' | 'expired' | 'none'
    lastInspection?: Date
    nextInspection?: Date
    complianceScore: number
  }
  features: {
    hasRefrigeration: boolean
    hasFreezer: boolean
    hasPrepAreas: boolean
    hasStorage: boolean
    hasDelivery: boolean
    hasOffice: boolean
  }
  status: 'active' | 'inactive' | 'maintenance' | 'closed'
}

export interface LocationTransition {
  id: string
  fromLocation: FacilityLocation | null
  toLocation: FacilityLocation
  timestamp: Date
  distance: number
  duration: number
  method: 'walking' | 'driving' | 'flying' | 'unknown'
  context: {
    taskId?: string
    inspectionId?: string
    emergency?: boolean
    notes?: string
  }
}

export interface LocationAnalytics {
  totalLocations: number
  activeLocations: number
  totalTransitions: number
  averageTransitionTime: number
  mostVisitedLocation: FacilityLocation | null
  complianceScore: number
  riskAssessment: {
    low: number
    medium: number
    high: number
    critical: number
  }
}

export interface LocationAlerts {
  id: string
  type: 'entry' | 'exit' | 'proximity' | 'violation' | 'emergency'
  severity: 'low' | 'medium' | 'high' | 'critical'
  location: FacilityLocation
  message: string
  timestamp: Date
  acknowledged: boolean
  actions: string[]
}

export class MultiLocationService {
  private static instance: MultiLocationService
  private facilities: Map<string, FacilityLocation> = new Map()
  private locationTransitions: LocationTransition[] = []
  private currentFacility: FacilityLocation | null = null
  private locationAlerts: LocationAlerts[] = []
  private isTrackingTransitions = false
  private transitionThreshold = 100 // meters

  private constructor() {}

  public static getInstance(): MultiLocationService {
    if (!MultiLocationService.instance) {
      MultiLocationService.instance = new MultiLocationService()
    }
    return MultiLocationService.instance
  }

  /**
   * Initialize multi-location service
   */
  public async initialize(): Promise<void> {
    try {
      // Initialize base GPS service
      await gpsService.initialize()

      // Load facility data
      await this.loadFacilities()

      // Start location transition tracking
      await this.startTransitionTracking()

      console.log('🏢🗺️ Multi-location service initialized')
    } catch (error) {
      console.error('❌ Multi-location service initialization failed:', error)
      throw new Error('Multi-location service initialization failed')
    }
  }

  /**
   * Add facility to management system
   */
  public addFacility(facility: FacilityLocation): void {
    this.facilities.set(facility.id, facility)
    console.log('🏢 Facility added:', facility.name)
  }

  /**
   * Get facility by ID
   */
  public getFacility(id: string): FacilityLocation | null {
    return this.facilities.get(id) || null
  }

  /**
   * Get all facilities
   */
  public getAllFacilities(): FacilityLocation[] {
    return Array.from(this.facilities.values())
  }

  /**
   * Get facilities by type
   */
  public getFacilitiesByType(
    type: FacilityLocation['type']
  ): FacilityLocation[] {
    return Array.from(this.facilities.values()).filter(f => f.type === type)
  }

  /**
   * Get active facilities
   */
  public getActiveFacilities(): FacilityLocation[] {
    return Array.from(this.facilities.values()).filter(
      f => f.status === 'active'
    )
  }

  /**
   * Detect current facility based on location
   */
  public async detectCurrentFacility(): Promise<FacilityLocation | null> {
    try {
      const currentLocation = await gpsService.getCurrentLocation()

      for (const facility of this.facilities.values()) {
        const distance = gpsService.calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          facility.coordinates.latitude,
          facility.coordinates.longitude
        )

        if (distance <= facility.radius) {
          return facility
        }
      }

      return null
    } catch (error) {
      console.error('❌ Facility detection failed:', error)
      return null
    }
  }

  /**
   * Check if user is at a specific facility
   */
  public async isAtFacility(facilityId: string): Promise<boolean> {
    const facility = this.getFacility(facilityId)
    if (!facility) return false

    try {
      const currentLocation = await gpsService.getCurrentLocation()
      const distance = gpsService.calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        facility.coordinates.latitude,
        facility.coordinates.longitude
      )

      return distance <= facility.radius
    } catch (error) {
      console.error('❌ Facility check failed:', error)
      return false
    }
  }

  /**
   * Start tracking location transitions
   */
  public async startTransitionTracking(): Promise<void> {
    if (this.isTrackingTransitions) return

    try {
      // Detect initial facility
      this.currentFacility = await this.detectCurrentFacility()

      // Start GPS tracking for transitions
      await gpsService.startTracking(
        { enableHighAccuracy: true, distanceFilter: this.transitionThreshold },
        async location => {
          await this.handleLocationUpdate(location)
        }
      )

      this.isTrackingTransitions = true
      console.log('🏢🗺️ Location transition tracking started')
    } catch (error) {
      console.error('❌ Failed to start transition tracking:', error)
    }
  }

  /**
   * Stop location transition tracking
   */
  public async stopTransitionTracking(): Promise<void> {
    if (!this.isTrackingTransitions) return

    try {
      await gpsService.stopTracking()
      this.isTrackingTransitions = false
      console.log('🏢🗺️ Location transition tracking stopped')
    } catch (error) {
      console.error('❌ Failed to stop transition tracking:', error)
    }
  }

  /**
   * Handle location updates for transition detection
   */
  private async handleLocationUpdate(location: LocationData): Promise<void> {
    try {
      const newFacility = await this.detectCurrentFacility()

      // Check if facility changed
      if (newFacility && newFacility.id !== this.currentFacility?.id) {
        await this.handleFacilityTransition(
          this.currentFacility,
          newFacility,
          location
        )
        this.currentFacility = newFacility
      }
    } catch (error) {
      console.error('❌ Location update handling failed:', error)
    }
  }

  /**
   * Handle facility transition
   */
  private async handleFacilityTransition(
    fromFacility: FacilityLocation | null,
    toFacility: FacilityLocation,
    location: LocationData
  ): Promise<void> {
    try {
      const transition: LocationTransition = {
        id: this.generateTransitionId(),
        fromLocation: fromFacility,
        toLocation: toFacility,
        timestamp: new Date(),
        distance: fromFacility
          ? gpsService.calculateDistance(
              fromFacility.coordinates.latitude,
              fromFacility.coordinates.longitude,
              toFacility.coordinates.latitude,
              toFacility.coordinates.longitude
            )
          : 0,
        duration: 0, // Will be calculated based on previous transition
        method: 'unknown', // Could be enhanced with motion detection
        context: {
          notes: `Transition from ${fromFacility?.name || 'unknown'} to ${toFacility.name}`,
        },
      }

      this.locationTransitions.push(transition)

      // Create location alert
      await this.createLocationAlert(
        'entry',
        'medium',
        toFacility,
        `Entered facility: ${toFacility.name}`
      )

      // Sync transition data
      await backgroundSyncService.addToQueue({
        type: 'location_transition',
        priority: 'normal',
        data: transition,
        timestamp: new Date(),
      })

      console.log('🏢🗺️ Facility transition recorded:', transition)
    } catch (error) {
      console.error('❌ Facility transition handling failed:', error)
    }
  }

  /**
   * Create location alert
   */
  private async createLocationAlert(
    type: LocationAlerts['type'],
    severity: LocationAlerts['severity'],
    location: FacilityLocation,
    message: string
  ): Promise<void> {
    try {
      const alert: LocationAlerts = {
        id: this.generateAlertId(),
        type,
        severity,
        location,
        message,
        timestamp: new Date(),
        acknowledged: false,
        actions: this.getAlertActions(type, severity),
      }

      this.locationAlerts.push(alert)

      // Send push notification for high/critical alerts
      if (severity === 'high' || severity === 'critical') {
        await pushNotificationService.sendNotification({
          title: 'Location Alert',
          body: message,
          icon: '/icons/location-alert.png',
          badge: '/icons/badge.png',
          tag: `location_${alert.id}`,
          data: {
            alertId: alert.id,
            locationId: location.id,
            type: type,
            severity: severity,
          },
        })
      }

      console.log('🚨 Location alert created:', alert)
    } catch (error) {
      console.error('❌ Location alert creation failed:', error)
    }
  }

  /**
   * Get alert actions based on type and severity
   */
  private getAlertActions(
    type: LocationAlerts['type'],
    severity: LocationAlerts['severity']
  ): string[] {
    const actions: string[] = []

    switch (type) {
      case 'entry':
        actions.push('Log entry time', 'Check facility status')
        break
      case 'exit':
        actions.push('Log exit time', 'Complete pending tasks')
        break
      case 'proximity':
        actions.push('Verify location', 'Check facility access')
        break
      case 'violation':
        actions.push('Document violation', 'Report to supervisor')
        break
      case 'emergency':
        actions.push('Call emergency services', 'Evacuate if necessary')
        break
    }

    if (severity === 'critical') {
      actions.push('Immediate action required')
    }

    return actions
  }

  /**
   * Get location analytics
   */
  public getLocationAnalytics(): LocationAnalytics {
    const facilities = Array.from(this.facilities.values())
    const activeFacilities = facilities.filter(f => f.status === 'active')

    const totalTransitionTime = this.locationTransitions.reduce(
      (sum, t) => sum + t.duration,
      0
    )
    const averageTransitionTime =
      this.locationTransitions.length > 0
        ? totalTransitionTime / this.locationTransitions.length
        : 0

    const mostVisitedLocation = this.getMostVisitedLocation()
    const complianceScore = this.calculateComplianceScore()
    const riskAssessment = this.calculateRiskAssessment()

    return {
      totalLocations: facilities.length,
      activeLocations: activeFacilities.length,
      totalTransitions: this.locationTransitions.length,
      averageTransitionTime,
      mostVisitedLocation,
      complianceScore,
      riskAssessment,
    }
  }

  /**
   * Get most visited location
   */
  private getMostVisitedLocation(): FacilityLocation | null {
    const visitCounts = new Map<string, number>()

    this.locationTransitions.forEach(transition => {
      const facilityId = transition.toLocation.id
      visitCounts.set(facilityId, (visitCounts.get(facilityId) || 0) + 1)
    })

    let mostVisitedId: string | null = null
    let maxVisits = 0

    visitCounts.forEach((count, facilityId) => {
      if (count > maxVisits) {
        maxVisits = count
        mostVisitedId = facilityId
      }
    })

    return mostVisitedId ? this.getFacility(mostVisitedId) : null
  }

  /**
   * Calculate compliance score
   */
  private calculateComplianceScore(): number {
    const facilities = Array.from(this.facilities.values())
    if (facilities.length === 0) return 0

    const totalScore = facilities.reduce(
      (sum, facility) => sum + facility.haccpProfile.complianceScore,
      0
    )
    return totalScore / facilities.length
  }

  /**
   * Calculate risk assessment
   */
  private calculateRiskAssessment(): LocationAlerts['riskAssessment'] {
    const facilities = Array.from(this.facilities.values())

    return facilities.reduce(
      (assessment, facility) => {
        assessment[facility.haccpProfile.riskLevel]++
        return assessment
      },
      { low: 0, medium: 0, high: 0, critical: 0 }
    )
  }

  /**
   * Get location transitions
   */
  public getLocationTransitions(): LocationTransition[] {
    return [...this.locationTransitions]
  }

  /**
   * Get location alerts
   */
  public getLocationAlerts(): LocationAlerts[] {
    return [...this.locationAlerts]
  }

  /**
   * Get unacknowledged alerts
   */
  public getUnacknowledgedAlerts(): LocationAlerts[] {
    return this.locationAlerts.filter(alert => !alert.acknowledged)
  }

  /**
   * Acknowledge alert
   */
  public acknowledgeAlert(alertId: string): boolean {
    const alert = this.locationAlerts.find(a => a.id === alertId)
    if (alert) {
      alert.acknowledged = true
      return true
    }
    return false
  }

  /**
   * Load facilities data
   */
  private async loadFacilities(): Promise<void> {
    // Sample facility data - in real implementation, load from server
    const sampleFacilities: FacilityLocation[] = [
      {
        id: 'FAC001',
        name: 'Main Restaurant',
        type: 'restaurant',
        address: {
          street: 'Via Roma 123',
          city: 'Milano',
          state: 'Lombardia',
          postalCode: '20100',
          country: 'Italy',
        },
        coordinates: { latitude: 45.4642, longitude: 9.19, altitude: 120 },
        radius: 50,
        timezone: 'Europe/Rome',
        operatingHours: {
          monday: { open: '08:00', close: '22:00' },
          tuesday: { open: '08:00', close: '22:00' },
          wednesday: { open: '08:00', close: '22:00' },
          thursday: { open: '08:00', close: '22:00' },
          friday: { open: '08:00', close: '23:00' },
          saturday: { open: '09:00', close: '23:00' },
          sunday: { open: '10:00', close: '21:00' },
        },
        haccpProfile: {
          riskLevel: 'medium',
          certificationStatus: 'certified',
          lastInspection: new Date('2024-01-15'),
          nextInspection: new Date('2024-04-15'),
          complianceScore: 92,
        },
        features: {
          hasRefrigeration: true,
          hasFreezer: true,
          hasPrepAreas: true,
          hasStorage: true,
          hasDelivery: true,
          hasOffice: true,
        },
        status: 'active',
      },
      {
        id: 'FAC002',
        name: 'Central Warehouse',
        type: 'warehouse',
        address: {
          street: 'Via Industria 456',
          city: 'Milano',
          state: 'Lombardia',
          postalCode: '20151',
          country: 'Italy',
        },
        coordinates: { latitude: 45.4742, longitude: 9.2, altitude: 130 },
        radius: 100,
        timezone: 'Europe/Rome',
        operatingHours: {
          monday: { open: '06:00', close: '18:00' },
          tuesday: { open: '06:00', close: '18:00' },
          wednesday: { open: '06:00', close: '18:00' },
          thursday: { open: '06:00', close: '18:00' },
          friday: { open: '06:00', close: '18:00' },
          saturday: { open: '08:00', close: '14:00' },
          sunday: { is24Hours: false },
        },
        haccpProfile: {
          riskLevel: 'high',
          certificationStatus: 'certified',
          lastInspection: new Date('2024-01-10'),
          nextInspection: new Date('2024-04-10'),
          complianceScore: 88,
        },
        features: {
          hasRefrigeration: true,
          hasFreezer: true,
          hasPrepAreas: false,
          hasStorage: true,
          hasDelivery: true,
          hasOffice: true,
        },
        status: 'active',
      },
    ]

    sampleFacilities.forEach(facility => {
      this.facilities.set(facility.id, facility)
    })

    console.log('🏢 Facilities loaded:', this.facilities.size)
  }

  /**
   * Generate unique transition ID
   */
  private generateTransitionId(): string {
    return `trans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Generate unique alert ID
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get service status
   */
  public getStatus() {
    return {
      initialized: this.facilities.size > 0,
      totalFacilities: this.facilities.size,
      activeFacilities: this.getActiveFacilities().length,
      currentFacility: this.currentFacility?.name || 'None',
      trackingTransitions: this.isTrackingTransitions,
      totalTransitions: this.locationTransitions.length,
      unacknowledgedAlerts: this.getUnacknowledgedAlerts().length,
    }
  }
}

// Export singleton instance
export const multiLocationService = MultiLocationService.getInstance()
export default multiLocationService
