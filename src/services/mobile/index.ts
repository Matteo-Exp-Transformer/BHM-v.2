/**
 * Mobile Services Index - B.8.4 Advanced Mobile Features
 * 
 * ✅ B.8.4 Session 1-2: Camera & Photo Management - COMPLETED
 * 🚀 B.8.4 Session 3-4: GPS & Location Features - READY TO START
 * ⏳ B.8.4 Session 5-6: Advanced Touch & Gesture + PWA - PLANNED
 */

// Camera Services (B.8.4 Session 1-2) - ✅ COMPLETED
export * from './camera'

// Location Services (B.8.4 Session 3-4) - 🚀 READY TO START
export * from './location'

// Interaction Services (B.8.4 Session 5-6) - ⏳ PLANNED
export * from './interaction'

// PWA Services (B.8.4 Session 5-6) - ⏳ PLANNED
export * from './pwa'

/**
 * Mobile Services Manager
 * Central coordinator for all mobile functionality
 */
class MobileServicesManager {
  private initialized = false
  private cameraInitialized = false
  private locationInitialized = false

  /**
   * Initialize mobile services (B.8.4)
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      // Initialize camera services (B.8.4 Session 1-2 - COMPLETED)
      const { cameraService } = await import('./camera')
      await cameraService.initialize()
      this.cameraInitialized = true
      console.log('📷 Camera services initialized - B.8.4 Session 1-2 COMPLETED')
    } catch (error) {
      console.warn('⚠️ Camera services initialization failed:', error)
    }

    try {
      // Initialize location services (B.8.4 Session 3-4 - COMPLETED)
      const { gpsService, geofenceManager, offlineMapCache, routeOptimizer, locationHistory } = await import('./location')
      await gpsService.initialize()
      await geofenceManager.initialize()
      await offlineMapCache.initialize()
      await routeOptimizer.initialize()
      await locationHistory.initialize()
      this.locationInitialized = true
      console.log('🗺️ Location services initialized - B.8.4 Session 3-4 COMPLETED')
    } catch (error) {
      console.warn('⚠️ Location services initialization failed:', error)
    }

    console.log('📱 Mobile Services initialized - B.8.4 Advanced Mobile Features')
    this.initialized = true
  }

  /**
   * Check if running on mobile device
   */
  public isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  /**
   * Get device capabilities
   */
  public getDeviceCapabilities() {
    return {
      hasCamera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      hasGeolocation: 'geolocation' in navigator,
      hasVibration: 'vibrate' in navigator,
      hasNotifications: 'Notification' in window,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches
    }
  }

  /**
   * Get initialization status
   */
  public getStatus() {
    return {
      initialized: this.initialized,
      cameraInitialized: this.cameraInitialized,
      locationInitialized: this.locationInitialized,
      interactionInitialized: false, // B.8.4 Session 5-6
      pwaInitialized: false // B.8.4 Session 5-6
    }
  }
}

// Export singleton - B.8.4 Advanced Mobile Features
export const mobileServices = new MobileServicesManager()

export default mobileServices