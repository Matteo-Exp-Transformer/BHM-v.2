/**
 * Mobile Services Index - B.8.4 Advanced Mobile Features
 * Placeholder exports for organized development structure
 *
 * 🚨 IMPORTANTE: Questi servizi sono pronti per B.8.4
 * Non implementare ora - aspetta il completamento di B.8.2
 */

// Camera Services (B.8.4 Session 1-2)
export * from './camera'

// Location Services (B.8.4 Session 3-4)
export * from './location'

// Interaction Services (B.8.4 Session 5-6)
export * from './interaction'

// PWA Services (B.8.4 Session 5-6)
export * from './pwa'

/**
 * Mobile Services Manager
 * Central coordinator for all mobile functionality
 */
class MobileServicesManager {
  private initialized = false

  /**
   * Initialize mobile services (B.8.4)
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return

    console.log('📱 Mobile Services ready for B.8.4 implementation')
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
}

// Export singleton - ready for B.8.4
export const mobileServices = new MobileServicesManager()

export default mobileServices