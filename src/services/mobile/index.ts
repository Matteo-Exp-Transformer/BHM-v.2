/**
 * Mobile Services Index - B.10.4 Advanced Mobile & PWA
 *
 * ✅ B.8.4 Session 1-2: Camera & Photo Management - COMPLETED
 * ✅ B.8.4 Session 3-4: GPS & Location Features - COMPLETED
 * 🚀 B.10.4 Session 1: Advanced PWA Features - IN PROGRESS
 * ⏳ B.10.4 Session 2: Enhanced Camera & GPS Integration - PLANNED
 */

// Camera Services (B.8.4 Session 1-2) - ✅ COMPLETED
export * from './camera'

// Location Services (B.8.4 Session 3-4) - ✅ COMPLETED
export * from './location'

// Interaction Services (B.8.4 Session 5-6) - ✅ COMPLETED
export * from './interaction'

// PWA Services (B.10.4 Session 1) - ✅ COMPLETED
export * from './pwa'

// Enhanced Camera Services (B.10.4 Session 2) - 🚀 IN PROGRESS
export * from './camera/InventoryCameraService'

// Enhanced Location Services (B.10.4 Session 2) - 🚀 IN PROGRESS
export * from './location/MultiLocationService'

// Performance Services (B.10.4 Session 2) - 🚀 IN PROGRESS
export * from './performance/MobilePerformanceOptimizer'

// Integration Services (B.10.4 Session 2) - 🚀 IN PROGRESS
export * from './integration/MobileIntegrationTester'

/**
 * Mobile Services Manager
 * Central coordinator for all mobile functionality
 */
class MobileServicesManager {
  private initialized = false
  private cameraInitialized = false
  private locationInitialized = false
  private enhancedCameraInitialized = false
  private multiLocationInitialized = false
  private performanceOptimizerInitialized = false
  private integrationTesterInitialized = false

  /**
   * Initialize mobile services (B.10.4)
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      // Initialize camera services (B.8.4 Session 1-2 - COMPLETED)
      const { cameraService } = await import('./camera')
      await cameraService.initialize()
      this.cameraInitialized = true
      console.log(
        '📷 Camera services initialized - B.8.4 Session 1-2 COMPLETED'
      )
    } catch (error) {
      console.warn('⚠️ Camera services initialization failed:', error)
    }

    try {
      // Initialize location services (B.8.4 Session 3-4 - COMPLETED)
      const {
        gpsService,
        geofenceManager,
        offlineMapCache,
        routeOptimizer,
        locationHistory,
      } = await import('./location')
      await gpsService.initialize()
      await geofenceManager.initialize()
      await offlineMapCache.initialize()
      await routeOptimizer.initialize()
      await locationHistory.initialize()
      this.locationInitialized = true
      console.log(
        '🗺️ Location services initialized - B.8.4 Session 3-4 COMPLETED'
      )
    } catch (error) {
      console.warn('⚠️ Location services initialization failed:', error)
    }

    try {
      // Initialize PWA services (B.10.4 Session 1 - ✅ COMPLETED)
      const {
        pushNotificationService,
        backgroundSyncService,
        serviceWorkerManager,
        installPromptManager,
      } = await import('./pwa')
      await pushNotificationService.initialize()
      await backgroundSyncService.initialize()
      await serviceWorkerManager.initialize()
      await installPromptManager.initialize()
      console.log('🔔 PWA services initialized - B.10.4 Session 1 ✅ COMPLETED')
    } catch (error) {
      console.warn('⚠️ PWA services initialization failed:', error)
    }

    try {
      // Initialize enhanced camera services (B.10.4 Session 2 - 🚀 IN PROGRESS)
      const { inventoryCameraService } = await import(
        './camera/InventoryCameraService'
      )
      await inventoryCameraService.initialize()
      this.enhancedCameraInitialized = true
      console.log(
        '📷📦 Enhanced camera services initialized - B.10.4 Session 2 IN PROGRESS'
      )
    } catch (error) {
      console.warn('⚠️ Enhanced camera services initialization failed:', error)
    }

    try {
      // Initialize multi-location services (B.10.4 Session 2 - 🚀 IN PROGRESS)
      const { multiLocationService } = await import(
        './location/MultiLocationService'
      )
      await multiLocationService.initialize()
      this.multiLocationInitialized = true
      console.log(
        '🏢🗺️ Multi-location services initialized - B.10.4 Session 2 IN PROGRESS'
      )
    } catch (error) {
      console.warn('⚠️ Multi-location services initialization failed:', error)
    }

    try {
      // Initialize performance optimizer (B.10.4 Session 2 - 🚀 IN PROGRESS)
      const { mobilePerformanceOptimizer } = await import(
        './performance/MobilePerformanceOptimizer'
      )
      await mobilePerformanceOptimizer.initialize()
      this.performanceOptimizerInitialized = true
      console.log(
        '⚡ Performance optimizer initialized - B.10.4 Session 2 IN PROGRESS'
      )
    } catch (error) {
      console.warn('⚠️ Performance optimizer initialization failed:', error)
    }

    try {
      // Initialize integration tester (B.10.4 Session 2 - 🚀 IN PROGRESS)
      const { mobileIntegrationTester } = await import(
        './integration/MobileIntegrationTester'
      )
      await mobileIntegrationTester.initialize()
      this.integrationTesterInitialized = true
      console.log(
        '🧪 Integration tester initialized - B.10.4 Session 2 IN PROGRESS'
      )
    } catch (error) {
      console.warn('⚠️ Integration tester initialization failed:', error)
    }

    console.log('📱 Mobile Services initialized - B.10.4 Advanced Mobile & PWA')
    this.initialized = true
  }

  /**
   * Check if running on mobile device
   */
  public isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  }

  /**
   * Get device capabilities
   */
  public getDeviceCapabilities() {
    return {
      hasCamera:
        'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      hasGeolocation: 'geolocation' in navigator,
      hasVibration: 'vibrate' in navigator,
      hasNotifications: 'Notification' in window,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches,
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
      pwaInitialized: false, // B.8.4 Session 5-6
      enhancedCameraInitialized: this.enhancedCameraInitialized, // B.10.4 Session 2
      multiLocationInitialized: this.multiLocationInitialized, // B.10.4 Session 2
      performanceOptimizerInitialized: this.performanceOptimizerInitialized, // B.10.4 Session 2
      integrationTesterInitialized: this.integrationTesterInitialized, // B.10.4 Session 2
    }
  }
}

// Export singleton - B.10.4 Advanced Mobile & PWA
export const mobileServices = new MobileServicesManager()

export default mobileServices
