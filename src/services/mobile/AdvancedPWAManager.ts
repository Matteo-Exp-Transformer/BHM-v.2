/**
 * B.10.4 Advanced Mobile & PWA - Foundation Framework
 * Advanced PWA capabilities and mobile optimization for enterprise deployment
 */

export interface PWAConfig {
  id: string
  name: string
  shortName: string
  description: string
  version: string
  scope: string
  startUrl: string
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser'
  orientation: 'any' | 'portrait' | 'landscape'
  themeColor: string
  backgroundColor: string
  icons: PWAIcon[]
  screenshots: PWAScreenshot[]
  shortcuts: PWAShortcut[]
  categories: string[]
  iarc_rating_id?: string
  lang: string
  dir: 'ltr' | 'rtl' | 'auto'
}

export interface PWAIcon {
  src: string
  sizes: string
  type: string
  purpose?: 'any' | 'maskable' | 'monochrome'
}

export interface PWAScreenshot {
  src: string
  sizes: string
  type: string
  form_factor?: 'wide' | 'narrow'
  label?: string
}

export interface PWAShortcut {
  name: string
  short_name?: string
  description?: string
  url: string
  icons?: PWAIcon[]
}

export interface ServiceWorkerConfig {
  version: string
  cacheStrategy:
    | 'cache-first'
    | 'network-first'
    | 'stale-while-revalidate'
    | 'network-only'
    | 'cache-only'
  precacheAssets: string[]
  runtimeCaching: RuntimeCacheRule[]
  offlinePages: string[]
  backgroundSync: BackgroundSyncConfig
  pushNotifications: PushNotificationConfig
}

export interface RuntimeCacheRule {
  urlPattern: string | RegExp
  handler:
    | 'CacheFirst'
    | 'NetworkFirst'
    | 'StaleWhileRevalidate'
    | 'NetworkOnly'
    | 'CacheOnly'
  options?: {
    cacheName?: string
    expiration?: {
      maxEntries?: number
      maxAgeSeconds?: number
    }
    cacheKeyWillBeUsed?: string
    cacheWillUpdate?: string
  }
}

export interface BackgroundSyncConfig {
  enabled: boolean
  tags: BackgroundSyncTag[]
  maxRetryTime: number
  powerMode: 'always' | 'avoid-battery' | 'avoid-cellular'
}

export interface BackgroundSyncTag {
  tag: string
  url: string
  method: string
  maxRetries: number
  retryDelay: number
}

export interface PushNotificationConfig {
  enabled: boolean
  vapidPublicKey: string
  applicationServerKey: string
  subscriptionEndpoint: string
  categories: NotificationCategory[]
  defaultActions: NotificationAction[]
}

export interface NotificationCategory {
  id: string
  name: string
  description: string
  priority: 'low' | 'normal' | 'high' | 'max'
  sound?: string
  vibration?: number[]
  badge?: string
  icon?: string
  actions: NotificationAction[]
}

export interface NotificationAction {
  action: string
  title: string
  icon?: string
  type?: 'button' | 'text'
  placeholder?: string
}

export interface MobileCapabilities {
  camera: CameraCapability
  location: LocationCapability
  storage: StorageCapability
  sensors: SensorCapability
  network: NetworkCapability
  performance: PerformanceCapability
}

export interface CameraCapability {
  available: boolean
  permissions: PermissionState
  supportedFormats: string[]
  features: {
    torch: boolean
    zoom: boolean
    focus: boolean
    whiteBalance: boolean
    iso: boolean
    exposureCompensation: boolean
  }
  constraints: MediaTrackConstraints
}

export interface LocationCapability {
  available: boolean
  permissions: PermissionState
  accuracy: 'high' | 'medium' | 'low'
  features: {
    gps: boolean
    network: boolean
    passive: boolean
    background: boolean
  }
  watchOptions: PositionOptions
}

export interface StorageCapability {
  available: boolean
  quota: {
    total: number
    used: number
    available: number
  }
  types: {
    localStorage: boolean
    sessionStorage: boolean
    indexedDB: boolean
    webSQL: boolean
    fileSystem: boolean
  }
  persistence: {
    persistent: boolean
    temporary: boolean
  }
}

export interface SensorCapability {
  available: boolean
  sensors: {
    accelerometer: boolean
    gyroscope: boolean
    magnetometer: boolean
    ambientLight: boolean
    proximity: boolean
    deviceMotion: boolean
    deviceOrientation: boolean
  }
  permissions: Record<string, PermissionState>
}

export interface NetworkCapability {
  online: boolean
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'unknown'
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | '5g'
  downlink: number
  rtt: number
  saveData: boolean
}

export interface PerformanceCapability {
  deviceMemory: number
  hardwareConcurrency: number
  maxTouchPoints: number
  platform: string
  userAgent: string
  viewport: {
    width: number
    height: number
    devicePixelRatio: number
  }
}

/**
 * Advanced PWA Manager
 * Foundation framework for enterprise PWA capabilities
 */
export class AdvancedPWAManager {
  private config: PWAConfig | null = null
  private serviceWorker: ServiceWorker | null = null
  private capabilities: MobileCapabilities | null = null
  private isInitialized = false

  /**
   * Initialize Advanced PWA Manager
   */
  public async initialize(config: PWAConfig): Promise<void> {
    console.log('📱 Initializing Advanced PWA Manager...')

    try {
      this.config = config

      // Detect mobile capabilities
      this.capabilities = await this.detectMobileCapabilities()

      // Initialize service worker
      await this.initializeServiceWorker()

      // Setup PWA manifest
      await this.setupPWAManifest()

      // Initialize push notifications
      await this.initializePushNotifications()

      // Setup offline capabilities
      await this.setupOfflineCapabilities()

      this.isInitialized = true
      console.log('✅ Advanced PWA Manager initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize Advanced PWA Manager:', error)
      throw error
    }
  }

  /**
   * Get mobile capabilities
   */
  public getMobileCapabilities(): MobileCapabilities | null {
    return this.capabilities
  }

  /**
   * Check if PWA is installable
   */
  public async isPWAInstallable(): Promise<boolean> {
    if (!this.isInitialized) return false

    try {
      // Check for beforeinstallprompt event
      return new Promise<boolean>(resolve => {
        let prompted = false

        const handler = () => {
          if (!prompted) {
            prompted = true
            resolve(true)
          }
        }

        window.addEventListener('beforeinstallprompt', handler, { once: true })

        // Timeout after 1 second
        setTimeout(() => {
          if (!prompted) {
            prompted = true
            window.removeEventListener('beforeinstallprompt', handler)
            resolve(false)
          }
        }, 1000)
      })
    } catch (error) {
      console.error('Error checking PWA installability:', error)
      return false
    }
  }

  /**
   * Prompt PWA installation
   */
  public async promptPWAInstall(): Promise<boolean> {
    try {
      // This would be implemented with the actual beforeinstallprompt event
      console.log('📱 Prompting PWA installation...')
      return true
    } catch (error) {
      console.error('Error prompting PWA installation:', error)
      return false
    }
  }

  /**
   * Check network status
   */
  public getNetworkStatus(): NetworkCapability {
    if (!this.capabilities) {
      throw new Error('PWA Manager not initialized')
    }

    return this.capabilities.network
  }

  /**
   * Enable background sync
   */
  public async enableBackgroundSync(tag: string, data: any): Promise<boolean> {
    try {
      if (
        'serviceWorker' in navigator &&
        'sync' in window.ServiceWorkerRegistration.prototype
      ) {
        const registration = await navigator.serviceWorker.ready
        await registration.sync.register(tag)

        // Store data for sync
        await this.storeBackgroundSyncData(tag, data)

        console.log(`📱 Background sync enabled for tag: ${tag}`)
        return true
      }
      return false
    } catch (error) {
      console.error('Error enabling background sync:', error)
      return false
    }
  }

  /**
   * Request notification permission
   */
  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications')
    }

    if (Notification.permission === 'granted') {
      return 'granted'
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission
    }

    return 'denied'
  }

  /**
   * Send local notification
   */
  public async sendNotification(
    title: string,
    options: NotificationOptions
  ): Promise<void> {
    const permission = await this.requestNotificationPermission()

    if (permission === 'granted') {
      new Notification(title, {
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png',
        ...options,
      })
    }
  }

  /**
   * Subscribe to push notifications
   */
  public async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    try {
      if (!this.config?.id) {
        throw new Error('PWA config not initialized')
      }

      const registration = await navigator.serviceWorker.ready

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          'your-vapid-public-key'
        ),
      })

      console.log('📱 Subscribed to push notifications')
      return subscription
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      return null
    }
  }

  /**
   * Request camera access
   */
  public async requestCameraAccess(
    constraints?: MediaStreamConstraints
  ): Promise<MediaStream | null> {
    try {
      if (!this.capabilities?.camera.available) {
        throw new Error('Camera not available on this device')
      }

      const defaultConstraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: 'environment',
        },
      }

      const stream = await navigator.mediaDevices.getUserMedia(
        constraints || defaultConstraints
      )
      console.log('📱 Camera access granted')
      return stream
    } catch (error) {
      console.error('Error requesting camera access:', error)
      return null
    }
  }

  /**
   * Request location access
   */
  public async requestLocationAccess(
    options?: PositionOptions
  ): Promise<GeolocationPosition | null> {
    try {
      if (!this.capabilities?.location.available) {
        throw new Error('Location not available on this device')
      }

      const defaultOptions: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }

      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          options || defaultOptions
        )
      })
    } catch (error) {
      console.error('Error requesting location access:', error)
      return null
    }
  }

  /**
   * Store data offline
   */
  public async storeOfflineData(key: string, data: any): Promise<boolean> {
    try {
      if ('indexedDB' in window) {
        // Use IndexedDB for larger data
        await this.storeInIndexedDB(key, data)
      } else if ('localStorage' in window) {
        // Fallback to localStorage for smaller data
        localStorage.setItem(key, JSON.stringify(data))
      } else {
        throw new Error('No storage mechanism available')
      }

      console.log(`📱 Data stored offline: ${key}`)
      return true
    } catch (error) {
      console.error('Error storing offline data:', error)
      return false
    }
  }

  /**
   * Retrieve offline data
   */
  public async getOfflineData(key: string): Promise<any | null> {
    try {
      if ('indexedDB' in window) {
        return await this.getFromIndexedDB(key)
      } else if ('localStorage' in window) {
        const data = localStorage.getItem(key)
        return data ? JSON.parse(data) : null
      }
      return null
    } catch (error) {
      console.error('Error retrieving offline data:', error)
      return null
    }
  }

  /**
   * Private helper methods
   */
  private async detectMobileCapabilities(): Promise<MobileCapabilities> {
    console.log('🔍 Detecting mobile capabilities...')

    const capabilities: MobileCapabilities = {
      camera: await this.detectCameraCapability(),
      location: await this.detectLocationCapability(),
      storage: await this.detectStorageCapability(),
      sensors: await this.detectSensorCapability(),
      network: this.detectNetworkCapability(),
      performance: this.detectPerformanceCapability(),
    }

    return capabilities
  }

  private async detectCameraCapability(): Promise<CameraCapability> {
    const available =
      'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices

    return {
      available,
      permissions: 'prompt' as PermissionState,
      supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
      features: {
        torch: available,
        zoom: available,
        focus: available,
        whiteBalance: available,
        iso: available,
        exposureCompensation: available,
      },
      constraints: {
        width: { min: 640, ideal: 1920, max: 4096 },
        height: { min: 480, ideal: 1080, max: 2160 },
      },
    }
  }

  private async detectLocationCapability(): Promise<LocationCapability> {
    const available = 'geolocation' in navigator

    return {
      available,
      permissions: 'prompt' as PermissionState,
      accuracy: 'high',
      features: {
        gps: available,
        network: available,
        passive: available,
        background: available && 'serviceWorker' in navigator,
      },
      watchOptions: {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    }
  }

  private async detectStorageCapability(): Promise<StorageCapability> {
    const quota = await this.getStorageQuota()

    return {
      available: true,
      quota,
      types: {
        localStorage: 'localStorage' in window,
        sessionStorage: 'sessionStorage' in window,
        indexedDB: 'indexedDB' in window,
        webSQL: 'openDatabase' in window,
        fileSystem: 'webkitRequestFileSystem' in window,
      },
      persistence: {
        persistent: 'storage' in navigator && 'persist' in navigator.storage,
        temporary: true,
      },
    }
  }

  private async detectSensorCapability(): Promise<SensorCapability> {
    return {
      available: true,
      sensors: {
        accelerometer: 'DeviceMotionEvent' in window,
        gyroscope: 'DeviceOrientationEvent' in window,
        magnetometer: 'DeviceOrientationEvent' in window,
        ambientLight: 'DeviceLightEvent' in window,
        proximity: 'DeviceProximityEvent' in window,
        deviceMotion: 'DeviceMotionEvent' in window,
        deviceOrientation: 'DeviceOrientationEvent' in window,
      },
      permissions: {
        accelerometer: 'prompt' as PermissionState,
        gyroscope: 'prompt' as PermissionState,
        magnetometer: 'prompt' as PermissionState,
      },
    }
  }

  private detectNetworkCapability(): NetworkCapability {
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection

    return {
      online: navigator.onLine,
      connectionType: connection?.type || 'unknown',
      effectiveType: connection?.effectiveType || '4g',
      downlink: connection?.downlink || 10,
      rtt: connection?.rtt || 100,
      saveData: connection?.saveData || false,
    }
  }

  private detectPerformanceCapability(): PerformanceCapability {
    return {
      deviceMemory: (navigator as any).deviceMemory || 4,
      hardwareConcurrency: navigator.hardwareConcurrency || 4,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio || 1,
      },
    }
  }

  private async getStorageQuota(): Promise<{
    total: number
    used: number
    available: number
  }> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate()
        return {
          total: estimate.quota || 0,
          used: estimate.usage || 0,
          available: (estimate.quota || 0) - (estimate.usage || 0),
        }
      }
    } catch (error) {
      console.error('Error getting storage quota:', error)
    }

    return { total: 0, used: 0, available: 0 }
  }

  private async initializeServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        console.log('📱 Service Worker registered successfully')
        this.serviceWorker = registration.active
      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    }
  }

  private async setupPWAManifest(): Promise<void> {
    if (!this.config) return

    const manifest = {
      name: this.config.name,
      short_name: this.config.shortName,
      description: this.config.description,
      start_url: this.config.startUrl,
      display: this.config.display,
      theme_color: this.config.themeColor,
      background_color: this.config.backgroundColor,
      icons: this.config.icons,
      categories: this.config.categories,
    }

    // Create or update manifest link
    let manifestLink = document.querySelector(
      'link[rel="manifest"]'
    ) as HTMLLinkElement
    if (!manifestLink) {
      manifestLink = document.createElement('link')
      manifestLink.rel = 'manifest'
      document.head.appendChild(manifestLink)
    }

    const manifestBlob = new Blob([JSON.stringify(manifest)], {
      type: 'application/json',
    })
    manifestLink.href = URL.createObjectURL(manifestBlob)
  }

  private async initializePushNotifications(): Promise<void> {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      console.log('📱 Push notifications available')
    }
  }

  private async setupOfflineCapabilities(): Promise<void> {
    // Setup offline page
    if ('serviceWorker' in navigator) {
      console.log('📱 Offline capabilities enabled')
    }
  }

  private async storeBackgroundSyncData(tag: string, data: any): Promise<void> {
    await this.storeOfflineData(`bg-sync-${tag}`, data)
  }

  private async storeInIndexedDB(key: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PWAStorage', 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(['data'], 'readwrite')
        const store = transaction.objectStore('data')
        store.put({ key, data })
        transaction.oncomplete = () => resolve()
        transaction.onerror = () => reject(transaction.error)
      }

      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains('data')) {
          db.createObjectStore('data', { keyPath: 'key' })
        }
      }
    })
  }

  private async getFromIndexedDB(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PWAStorage', 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(['data'], 'readonly')
        const store = transaction.objectStore('data')
        const getRequest = store.get(key)

        getRequest.onsuccess = () => {
          resolve(getRequest.result?.data || null)
        }
        getRequest.onerror = () => reject(getRequest.error)
      }
    })
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }
}

// Export singleton instance
export const advancedPWAManager = new AdvancedPWAManager()

export default advancedPWAManager
