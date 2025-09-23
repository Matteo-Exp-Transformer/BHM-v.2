/**
 * GPSService - B.8.4 Advanced Mobile Features
 * High-precision location tracking for HACCP conservation point mapping
 */

import { Geolocation } from '@capacitor/geolocation'

export interface LocationData {
  id: string
  timestamp: Date
  latitude: number
  longitude: number
  altitude?: number
  accuracy: number
  altitudeAccuracy?: number
  heading?: number
  speed?: number
  source: 'gps' | 'network' | 'passive'
  haccpContext?: {
    conservationPointId?: string
    taskId?: string
    inspectionId?: string
    locationType?:
      | 'conservation_point'
      | 'inspection_route'
      | 'emergency'
      | 'custom'
    notes?: string
  }
}

export interface LocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
  distanceFilter?: number // meters
}

export interface LocationCapabilities {
  hasGeolocation: boolean
  supportsHighAccuracy: boolean
  supportsAltitude: boolean
  supportsHeading: boolean
  supportsSpeed: boolean
  maxAccuracy: number // meters
  minUpdateInterval: number // milliseconds
}

export interface ConservationPointLocation {
  id: string
  name: string
  latitude: number
  longitude: number
  radius: number // meters
  type: 'refrigeration' | 'freezer' | 'preparation' | 'storage' | 'delivery'
  criticalTemperature?: {
    min: number
    max: number
    unit: 'celsius' | 'fahrenheit'
  }
  lastInspection?: Date
  status: 'active' | 'inactive' | 'maintenance'
}

export class GPSService {
  private static instance: GPSService
  private locationHistory: LocationData[] = []
  private isTracking = false
  private watchId: string | null = null
  private capabilities: LocationCapabilities | null = null
  private conservationPoints: Map<string, ConservationPointLocation> = new Map()
  private currentLocation: LocationData | null = null

  private constructor() {}

  public static getInstance(): GPSService {
    if (!GPSService.instance) {
      GPSService.instance = new GPSService()
    }
    return GPSService.instance
  }

  /**
   * Initialize GPS service and detect capabilities
   */
  public async initialize(): Promise<void> {
    try {
      // Check permissions
      const hasPermissions = await this.checkPermissions()
      if (!hasPermissions) {
        const granted = await this.requestPermissions()
        if (!granted) {
          throw new Error('Location permissions not granted')
        }
      }

      // Detect capabilities
      this.capabilities = {
        hasGeolocation: 'geolocation' in navigator,
        supportsHighAccuracy: true,
        supportsAltitude: true,
        supportsHeading: true,
        supportsSpeed: true,
        maxAccuracy: 1, // 1 meter accuracy
        minUpdateInterval: 1000, // 1 second minimum
      }

      // Load conservation points
      await this.loadConservationPoints()

      console.log('🗺️ GPS service initialized:', this.capabilities)
    } catch (error) {
      console.error('❌ GPS service initialization failed:', error)
      throw new Error('GPS service initialization failed')
    }
  }

  /**
   * Get current location with high precision
   */
  public async getCurrentLocation(
    options: LocationOptions = {}
  ): Promise<LocationData> {
    if (!this.capabilities?.hasGeolocation) {
      throw new Error('Geolocation not available')
    }

    try {
      const defaultOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
        ...options,
      }

      const position = await Geolocation.getCurrentPosition(defaultOptions)

      const locationData: LocationData = {
        id: this.generateLocationId(),
        timestamp: new Date(),
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        altitude: position.coords.altitude || undefined,
        accuracy: position.coords.accuracy,
        altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
        heading: position.coords.heading || undefined,
        speed: position.coords.speed || undefined,
        source: options.enableHighAccuracy ? 'gps' : 'network',
      }

      this.currentLocation = locationData
      this.locationHistory.push(locationData)

      return locationData
    } catch (error) {
      console.error('❌ Location retrieval failed:', error)
      throw new Error(`Location retrieval failed: ${error}`)
    }
  }

  /**
   * Start continuous location tracking
   */
  public async startTracking(
    options: LocationOptions = {},
    onLocationUpdate?: (location: LocationData) => void
  ): Promise<void> {
    if (this.isTracking) {
      console.warn('⚠️ Location tracking already active')
      return
    }

    try {
      const defaultOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
        ...options,
      }

      this.watchId = await Geolocation.watchPosition(
        defaultOptions,
        (position, err) => {
          if (err) {
            console.error('❌ Location tracking error:', err)
            return
          }

          const locationData: LocationData = {
            id: this.generateLocationId(),
            timestamp: new Date(),
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude || undefined,
            accuracy: position.coords.accuracy,
            altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
            source: options.enableHighAccuracy ? 'gps' : 'network',
          }

          this.currentLocation = locationData
          this.locationHistory.push(locationData)

          onLocationUpdate?.(locationData)
        }
      )

      this.isTracking = true
      console.log('🗺️ Location tracking started')
    } catch (error) {
      console.error('❌ Failed to start location tracking:', error)
      throw new Error(`Failed to start location tracking: ${error}`)
    }
  }

  /**
   * Stop location tracking
   */
  public async stopTracking(): Promise<void> {
    if (!this.isTracking || !this.watchId) {
      return
    }

    try {
      await Geolocation.clearWatch({ id: this.watchId })
      this.watchId = null
      this.isTracking = false
      console.log('🗺️ Location tracking stopped')
    } catch (error) {
      console.error('❌ Failed to stop location tracking:', error)
    }
  }

  /**
   * Get location history
   */
  public getLocationHistory(): LocationData[] {
    return [...this.locationHistory]
  }

  /**
   * Get current location
   */
  public getCurrentLocationData(): LocationData | null {
    return this.currentLocation
  }

  /**
   * Get location by HACCP context
   */
  public getLocationsByContext(
    context: Partial<LocationData['haccpContext']>
  ): LocationData[] {
    return this.locationHistory.filter(location => {
      if (!location.haccpContext || !context) return false

      return Object.keys(context).every(key => {
        const contextKey = key as keyof LocationData['haccpContext']
        return location.haccpContext?.[contextKey] === context[contextKey]
      })
    })
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  public calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // Distance in meters
  }

  /**
   * Check if location is near conservation point
   */
  public isNearConservationPoint(
    location: LocationData,
    pointId: string,
    threshold: number = 50
  ): boolean {
    const point = this.conservationPoints.get(pointId)
    if (!point) return false

    const distance = this.calculateDistance(
      location.latitude,
      location.longitude,
      point.latitude,
      point.longitude
    )

    return distance <= point.radius + threshold
  }

  /**
   * Get nearest conservation point
   */
  public getNearestConservationPoint(
    location: LocationData
  ): ConservationPointLocation | null {
    let nearest: ConservationPointLocation | null = null
    let minDistance = Infinity

    for (const point of this.conservationPoints.values()) {
      const distance = this.calculateDistance(
        location.latitude,
        location.longitude,
        point.latitude,
        point.longitude
      )

      if (distance < minDistance) {
        minDistance = distance
        nearest = point
      }
    }

    return nearest
  }

  /**
   * Add conservation point
   */
  public addConservationPoint(point: ConservationPointLocation): void {
    this.conservationPoints.set(point.id, point)
  }

  /**
   * Get conservation points
   */
  public getConservationPoints(): ConservationPointLocation[] {
    return Array.from(this.conservationPoints.values())
  }

  /**
   * Get conservation point by ID
   */
  public getConservationPoint(id: string): ConservationPointLocation | null {
    return this.conservationPoints.get(id) || null
  }

  /**
   * Check location permissions
   */
  public async checkPermissions(): Promise<boolean> {
    try {
      const permissions = await Geolocation.checkPermissions()
      return permissions.location === 'granted'
    } catch (error) {
      console.error('❌ Permission check failed:', error)
      return false
    }
  }

  /**
   * Request location permissions
   */
  public async requestPermissions(): Promise<boolean> {
    try {
      const permissions = await Geolocation.requestPermissions()
      return permissions.location === 'granted'
    } catch (error) {
      console.error('❌ Permission request failed:', error)
      return false
    }
  }

  /**
   * Get capabilities
   */
  public getCapabilities(): LocationCapabilities | null {
    return this.capabilities
  }

  /**
   * Clear location history
   */
  public clearHistory(): void {
    this.locationHistory = []
  }

  /**
   * Load conservation points (sample data)
   */
  private async loadConservationPoints(): Promise<void> {
    // Sample HACCP conservation points
    const samplePoints: ConservationPointLocation[] = [
      {
        id: 'CP001',
        name: 'Main Refrigeration Unit',
        latitude: 45.4642,
        longitude: 9.19,
        radius: 25,
        type: 'refrigeration',
        criticalTemperature: { min: 0, max: 4, unit: 'celsius' },
        status: 'active',
      },
      {
        id: 'CP002',
        name: 'Deep Freezer Storage',
        latitude: 45.4645,
        longitude: 9.1905,
        radius: 15,
        type: 'freezer',
        criticalTemperature: { min: -25, max: -18, unit: 'celsius' },
        status: 'active',
      },
      {
        id: 'CP003',
        name: 'Preparation Area',
        latitude: 45.464,
        longitude: 9.1895,
        radius: 20,
        type: 'preparation',
        criticalTemperature: { min: 15, max: 25, unit: 'celsius' },
        status: 'active',
      },
    ]

    samplePoints.forEach(point => {
      this.conservationPoints.set(point.id, point)
    })
  }

  /**
   * Generate unique location ID
   */
  private generateLocationId(): string {
    return `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Export singleton instance
export const gpsService = GPSService.getInstance()
export default gpsService
