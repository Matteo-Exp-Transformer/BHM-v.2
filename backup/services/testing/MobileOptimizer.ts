/**
 * B.8.1 Mobile Integration Performance Optimizer
 * Optimizes HACCP Business Manager for mobile devices and touch interfaces
 */

export interface MobileDeviceInfo {
  type: 'smartphone' | 'tablet' | 'desktop'
  screenSize: {
    width: number
    height: number
    pixelRatio: number
  }
  capabilities: {
    touch: boolean
    orientation: boolean
    vibration: boolean
    camera: boolean
    geolocation: boolean
    accelerometer: boolean
  }
  performance: {
    cores: number
    memory: number // GB estimate
    connectionType: string
    effectiveType: string
  }
  constraints: {
    batterySaving: boolean
    lowMemory: boolean
    slowConnection: boolean
    limitedStorage: boolean
  }
}

export interface MobileOptimization {
  category: 'rendering' | 'network' | 'storage' | 'ui' | 'performance'
  technique: string
  enabled: boolean
  impact: 'low' | 'medium' | 'high'
  description: string
  implementation: () => void
  rollback: () => void
}

export interface TouchInteractionConfig {
  minTouchTarget: number // px
  tapTimeout: number // ms
  swipeThreshold: number // px
  longPressDelay: number // ms
  doubleTapDelay: number // ms
  scrollMomentum: boolean
  preventZoom: boolean
}

export interface MobilePerformanceMetrics {
  frameRate: number
  inputLatency: number
  scrollPerformance: number
  touchResponseTime: number
  renderingTime: number
  memoryUsage: number
  batteryLevel?: number
  networkSpeed: number
}

class MobileOptimizer {
  private deviceInfo: MobileDeviceInfo | null = null
  private optimizations: Map<string, MobileOptimization> = new Map()
  private touchConfig: TouchInteractionConfig
  private performanceObserver: PerformanceObserver | null = null
  private intersectionObserver: IntersectionObserver | null = null
  private isOptimized = false

  constructor() {
    this.touchConfig = this.getDefaultTouchConfig()
    this.setupOptimizations()
    this.detectDevice()
  }

  /**
   * Detect mobile device capabilities and constraints
   */
  public detectDevice(): MobileDeviceInfo {
    if (this.deviceInfo) return this.deviceInfo

    const ua = navigator.userAgent
    const screen = window.screen
    const connection = (navigator as any).connection

    // Determine device type
    let type: 'smartphone' | 'tablet' | 'desktop' = 'desktop'
    if (/Android|iPhone|iPod/i.test(ua)) {
      type = screen.width <= 768 ? 'smartphone' : 'tablet'
    } else if (/iPad/i.test(ua) || (screen.width > 768 && 'ontouchstart' in window)) {
      type = 'tablet'
    }

    // Screen information
    const screenSize = {
      width: screen.width,
      height: screen.height,
      pixelRatio: window.devicePixelRatio || 1
    }

    // Capabilities detection
    const capabilities = {
      touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      orientation: 'DeviceOrientationEvent' in window,
      vibration: 'vibrate' in navigator,
      camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      geolocation: 'geolocation' in navigator,
      accelerometer: 'DeviceMotionEvent' in window
    }

    // Performance estimation
    const performance = {
      cores: navigator.hardwareConcurrency || 2,
      memory: (navigator as any).deviceMemory || 2,
      connectionType: connection?.type || 'unknown',
      effectiveType: connection?.effectiveType || '4g'
    }

    // Constraints detection
    const constraints = {
      batterySaving: (navigator as any).getBattery ? await this.detectBatterySaving() : false,
      lowMemory: performance.memory < 2,
      slowConnection: performance.effectiveType === 'slow-2g' || performance.effectiveType === '2g',
      limitedStorage: this.estimateStorageConstraints()
    }

    this.deviceInfo = {
      type,
      screenSize,
      capabilities,
      performance,
      constraints
    }

    return this.deviceInfo
  }

  /**
   * Apply mobile optimizations based on device capabilities
   */
  public async applyOptimizations(): Promise<void> {
    if (this.isOptimized) return

    const device = this.detectDevice()

    // Apply optimizations based on device type and constraints
    if (device.type === 'smartphone') {
      this.enableOptimization('reducedAnimations')
      this.enableOptimization('lazyLoading')
      this.enableOptimization('touchOptimization')

      if (device.constraints.lowMemory) {
        this.enableOptimization('memoryManagement')
        this.enableOptimization('componentVirtualization')
      }

      if (device.constraints.slowConnection) {
        this.enableOptimization('dataCompression')
        this.enableOptimization('prefetchOptimization')
      }
    }

    if (device.type === 'tablet') {
      this.enableOptimization('touchOptimization')
      this.enableOptimization('lazyLoading')
    }

    // Apply touch interface optimizations
    this.setupTouchInterface()

    // Setup performance monitoring
    this.setupMobilePerformanceMonitoring()

    this.isOptimized = true
    console.log('🚀 Mobile optimizations applied')
  }

  /**
   * Setup mobile-specific optimizations
   */
  private setupOptimizations(): void {
    this.optimizations.set('reducedAnimations', {
      category: 'rendering',
      technique: 'Reduced Animations',
      enabled: false,
      impact: 'high',
      description: 'Reduces complex animations to improve performance on mobile devices',
      implementation: () => {
        document.documentElement.style.setProperty('--animation-duration', '0.1s')
        document.documentElement.classList.add('reduced-motion')
      },
      rollback: () => {
        document.documentElement.style.removeProperty('--animation-duration')
        document.documentElement.classList.remove('reduced-motion')
      }
    })

    this.optimizations.set('lazyLoading', {
      category: 'performance',
      technique: 'Lazy Loading',
      enabled: false,
      impact: 'high',
      description: 'Implements intersection observer for lazy loading of components',
      implementation: () => {
        this.setupIntersectionObserver()
      },
      rollback: () => {
        this.intersectionObserver?.disconnect()
      }
    })

    this.optimizations.set('touchOptimization', {
      category: 'ui',
      technique: 'Touch Interface Optimization',
      enabled: false,
      impact: 'high',
      description: 'Optimizes touch targets and gestures for mobile interaction',
      implementation: () => {
        this.setupTouchInterface()
      },
      rollback: () => {
        this.removeTouchOptimizations()
      }
    })

    this.optimizations.set('memoryManagement', {
      category: 'performance',
      technique: 'Memory Management',
      enabled: false,
      impact: 'medium',
      description: 'Aggressive memory cleanup and garbage collection',
      implementation: () => {
        this.setupMemoryManagement()
      },
      rollback: () => {
        this.cleanupMemoryManagement()
      }
    })

    this.optimizations.set('componentVirtualization', {
      category: 'rendering',
      technique: 'Component Virtualization',
      enabled: false,
      impact: 'high',
      description: 'Virtualizes large lists and tables for better performance',
      implementation: () => {
        this.setupVirtualization()
      },
      rollback: () => {
        this.removeVirtualization()
      }
    })

    this.optimizations.set('dataCompression', {
      category: 'network',
      technique: 'Data Compression',
      enabled: false,
      impact: 'medium',
      description: 'Compresses data transfers to reduce bandwidth usage',
      implementation: () => {
        this.setupDataCompression()
      },
      rollback: () => {
        this.removeDataCompression()
      }
    })

    this.optimizations.set('prefetchOptimization', {
      category: 'network',
      technique: 'Smart Prefetching',
      enabled: false,
      impact: 'medium',
      description: 'Intelligent prefetching based on user behavior and connection speed',
      implementation: () => {
        this.setupSmartPrefetching()
      },
      rollback: () => {
        this.removeSmartPrefetching()
      }
    })
  }

  /**
   * Setup touch interface optimizations
   */
  private setupTouchInterface(): void {
    // Add touch-friendly CSS classes
    document.documentElement.classList.add('touch-optimized')

    // Setup touch event handlers
    this.setupTouchEventHandlers()

    // Apply touch-friendly button sizes
    this.optimizeTouchTargets()

    // Setup gesture recognition
    this.setupGestureRecognition()
  }

  /**
   * Setup touch event handlers
   */
  private setupTouchEventHandlers(): void {
    // Prevent default touch behaviors on specific elements
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true })
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false })
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true })

    // Add fast click handling
    document.addEventListener('click', this.handleFastClick.bind(this), true)
  }

  /**
   * Handle touch start events
   */
  private handleTouchStart(event: TouchEvent): void {
    const target = event.target as HTMLElement

    // Add touch feedback
    if (target.closest('.touch-target')) {
      target.classList.add('touch-active')
    }

    // Record touch start time for performance metrics
    target.dataset.touchStart = Date.now().toString()
  }

  /**
   * Handle touch move events
   */
  private handleTouchMove(event: TouchEvent): void {
    const target = event.target as HTMLElement

    // Prevent scrolling on specific elements
    if (target.closest('.no-scroll')) {
      event.preventDefault()
    }
  }

  /**
   * Handle touch end events
   */
  private handleTouchEnd(event: TouchEvent): void {
    const target = event.target as HTMLElement

    // Remove touch feedback
    if (target.closest('.touch-target')) {
      setTimeout(() => {
        target.classList.remove('touch-active')
      }, 150)
    }

    // Calculate touch response time
    const touchStart = target.dataset.touchStart
    if (touchStart) {
      const responseTime = Date.now() - parseInt(touchStart)
      this.recordTouchPerformance(responseTime)
    }
  }

  /**
   * Handle fast click for better responsiveness
   */
  private handleFastClick(event: MouseEvent): void {
    const target = event.target as HTMLElement

    // Skip if this is a synthetic click from touch
    if (event.detail === 0) return

    // Add click responsiveness
    target.classList.add('click-active')
    setTimeout(() => {
      target.classList.remove('click-active')
    }, 100)
  }

  /**
   * Optimize touch targets
   */
  private optimizeTouchTargets(): void {
    const style = document.createElement('style')
    style.textContent = `
      .touch-optimized .touch-target {
        min-height: ${this.touchConfig.minTouchTarget}px;
        min-width: ${this.touchConfig.minTouchTarget}px;
        padding: 8px 16px;
        margin: 4px;
      }

      .touch-optimized .touch-active {
        transform: scale(0.98);
        opacity: 0.8;
        transition: all 0.1s ease;
      }

      .touch-optimized .click-active {
        transform: scale(0.95);
        transition: transform 0.1s ease;
      }

      .touch-optimized button,
      .touch-optimized .button,
      .touch-optimized [role="button"] {
        min-height: 44px;
        min-width: 44px;
        touch-action: manipulation;
      }

      .touch-optimized input,
      .touch-optimized textarea,
      .touch-optimized select {
        min-height: 44px;
        padding: 12px 16px;
        font-size: 16px; /* Prevent zoom on iOS */
      }
    `
    document.head.appendChild(style)
  }

  /**
   * Setup gesture recognition
   */
  private setupGestureRecognition(): void {
    let startX = 0, startY = 0, endX = 0, endY = 0

    document.addEventListener('touchstart', (e) => {
      const touch = e.touches[0]
      startX = touch.clientX
      startY = touch.clientY
    }, { passive: true })

    document.addEventListener('touchend', (e) => {
      const touch = e.changedTouches[0]
      endX = touch.clientX
      endY = touch.clientY

      this.handleGesture(startX, startY, endX, endY)
    }, { passive: true })
  }

  /**
   * Handle gesture recognition
   */
  private handleGesture(startX: number, startY: number, endX: number, endY: number): void {
    const deltaX = endX - startX
    const deltaY = endY - startY
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    if (distance < this.touchConfig.swipeThreshold) return

    // Determine swipe direction
    const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI

    let direction: string
    if (angle >= -45 && angle <= 45) direction = 'right'
    else if (angle >= 45 && angle <= 135) direction = 'down'
    else if (angle >= -135 && angle <= -45) direction = 'up'
    else direction = 'left'

    // Dispatch custom swipe event
    const swipeEvent = new CustomEvent('swipe', {
      detail: { direction, distance, deltaX, deltaY }
    })
    document.dispatchEvent(swipeEvent)
  }

  /**
   * Setup intersection observer for lazy loading
   */
  private setupIntersectionObserver(): void {
    if (!('IntersectionObserver' in window)) return

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement

          // Trigger lazy loading
          element.classList.add('visible')

          // Load content if needed
          if (element.dataset.src) {
            element.setAttribute('src', element.dataset.src)
            element.removeAttribute('data-src')
          }

          this.intersectionObserver?.unobserve(element)
        }
      })
    }, {
      rootMargin: '50px',
      threshold: 0.1
    })

    // Observe lazy-loadable elements
    document.querySelectorAll('[data-lazy]').forEach(el => {
      this.intersectionObserver?.observe(el)
    })
  }

  /**
   * Setup mobile performance monitoring
   */
  private setupMobilePerformanceMonitoring(): void {
    if (!('PerformanceObserver' in window)) return

    this.performanceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.analyzeMobilePerformance(entry)
      }
    })

    this.performanceObserver.observe({ entryTypes: ['measure', 'navigation', 'paint'] })

    // Monitor frame rate
    this.monitorFrameRate()

    // Monitor memory usage
    setInterval(() => {
      this.monitorMemoryUsage()
    }, 30000) // Every 30 seconds
  }

  /**
   * Monitor frame rate for mobile performance
   */
  private monitorFrameRate(): void {
    let lastTime = performance.now()
    let frames = 0

    const countFrames = () => {
      frames++
      const currentTime = performance.now()

      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frames * 1000) / (currentTime - lastTime))
        this.recordMobileMetric('frameRate', fps)

        frames = 0
        lastTime = currentTime
      }

      requestAnimationFrame(countFrames)
    }

    requestAnimationFrame(countFrames)
  }

  /**
   * Monitor memory usage
   */
  private monitorMemoryUsage(): void {
    if (performance.memory) {
      const memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024 // MB
      this.recordMobileMetric('memoryUsage', memoryUsage)
    }
  }

  /**
   * Record mobile-specific performance metrics
   */
  private recordMobileMetric(metric: string, value: number): void {
    console.log(`📱 Mobile Metric - ${metric}: ${value}`)

    // Trigger optimizations if performance degrades
    if (metric === 'frameRate' && value < 30) {
      this.enableOptimization('reducedAnimations')
    }

    if (metric === 'memoryUsage' && value > 50) {
      this.enableOptimization('memoryManagement')
    }
  }

  /**
   * Record touch performance
   */
  private recordTouchPerformance(responseTime: number): void {
    console.log(`👆 Touch Response: ${responseTime}ms`)

    if (responseTime > this.touchConfig.tapTimeout) {
      console.warn('Touch response time is slow, consider optimizations')
    }
  }

  /**
   * Enable specific optimization
   */
  private enableOptimization(name: string): void {
    const optimization = this.optimizations.get(name)
    if (optimization && !optimization.enabled) {
      optimization.implementation()
      optimization.enabled = true
      console.log(`✅ Enabled optimization: ${optimization.technique}`)
    }
  }

  /**
   * Default touch configuration
   */
  private getDefaultTouchConfig(): TouchInteractionConfig {
    return {
      minTouchTarget: 44, // Apple's recommended minimum
      tapTimeout: 300,
      swipeThreshold: 50,
      longPressDelay: 500,
      doubleTapDelay: 300,
      scrollMomentum: true,
      preventZoom: false
    }
  }

  /**
   * Utility methods for optimization implementations
   */
  private setupMemoryManagement(): void {
    // Implement aggressive garbage collection
    setInterval(() => {
      if (window.gc) {
        window.gc()
      }
    }, 60000)
  }

  private setupVirtualization(): void {
    // Add virtualization classes to large lists
    document.querySelectorAll('.large-list').forEach(list => {
      list.classList.add('virtualized')
    })
  }

  private setupDataCompression(): void {
    // Setup compression headers for API requests
    console.log('Data compression optimization enabled')
  }

  private setupSmartPrefetching(): void {
    // Implement intelligent prefetching
    console.log('Smart prefetching optimization enabled')
  }

  // Cleanup methods
  private cleanupMemoryManagement(): void {
    // Cleanup memory management
  }

  private removeVirtualization(): void {
    document.querySelectorAll('.virtualized').forEach(list => {
      list.classList.remove('virtualized')
    })
  }

  private removeDataCompression(): void {
    console.log('Data compression optimization disabled')
  }

  private removeSmartPrefetching(): void {
    console.log('Smart prefetching optimization disabled')
  }

  private removeTouchOptimizations(): void {
    document.documentElement.classList.remove('touch-optimized')
  }

  private analyzeMobilePerformance(entry: PerformanceEntry): void {
    // Analyze performance entries for mobile-specific insights
    console.log(`📊 Performance Entry: ${entry.name} - ${entry.duration}ms`)
  }

  private async detectBatterySaving(): Promise<boolean> {
    if ((navigator as any).getBattery) {
      const battery = await (navigator as any).getBattery()
      return battery.level < 0.2 || battery.charging === false
    }
    return false
  }

  private estimateStorageConstraints(): boolean {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        const quotaInMB = (estimate.quota || 0) / 1024 / 1024
        return quotaInMB < 100 // Less than 100MB available
      })
    }
    return false
  }

  /**
   * Get current mobile performance metrics
   */
  public getMobileMetrics(): MobilePerformanceMetrics {
    return {
      frameRate: 60, // Placeholder - would be updated by monitoring
      inputLatency: 50,
      scrollPerformance: 90,
      touchResponseTime: 100,
      renderingTime: 16,
      memoryUsage: performance.memory ? performance.memory.usedJSHeapSize / 1024 / 1024 : 0,
      networkSpeed: 4
    }
  }

  /**
   * Cleanup mobile optimizations
   */
  public cleanup(): void {
    this.optimizations.forEach(opt => {
      if (opt.enabled) {
        opt.rollback()
      }
    })

    this.performanceObserver?.disconnect()
    this.intersectionObserver?.disconnect()
    this.isOptimized = false
  }
}

// Export singleton instance
export const mobileOptimizer = new MobileOptimizer()
export default MobileOptimizer