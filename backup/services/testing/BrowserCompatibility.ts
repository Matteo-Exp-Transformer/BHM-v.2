/**
 * B.8.1 Cross-Browser Compatibility Testing
 * Ensures HACCP Business Manager works across all supported browsers
 */

export interface BrowserInfo {
  name: string
  version: string
  engine: string
  platform: string
  mobile: boolean
  features: BrowserFeatureSupport
}

export interface BrowserFeatureSupport {
  indexedDB: boolean
  webSockets: boolean
  serviceWorker: boolean
  webWorkers: boolean
  notifications: boolean
  geolocation: boolean
  camera: boolean
  localStorage: boolean
  sessionStorage: boolean
  fetch: boolean
  promises: boolean
  es6: boolean
  webAssembly: boolean
  webGL: boolean
  touchEvents: boolean
  deviceOrientation: boolean
  pushNotifications: boolean
  backgroundSync: boolean
  webShare: boolean
  clipboard: boolean
}

export interface CompatibilityTestResult {
  browser: BrowserInfo
  testsPassed: number
  testsTotal: number
  criticalFailures: string[]
  warnings: string[]
  recommendations: string[]
  performanceScore: number
  supportLevel: 'full' | 'partial' | 'minimal' | 'unsupported'
}

export interface BrowserRequirement {
  feature: keyof BrowserFeatureSupport
  required: boolean
  alternatives?: string[]
  polyfill?: string
}

class BrowserCompatibilityTester {
  private requirements: BrowserRequirement[] = []
  private testResults: Map<string, any> = new Map()

  constructor() {
    this.setupRequirements()
  }

  /**
   * Setup browser requirements for HACCP Business Manager
   */
  private setupRequirements(): void {
    this.requirements = [
      // Critical features
      { feature: 'indexedDB', required: true, alternatives: ['WebSQL'], polyfill: 'idb-polyfill' },
      { feature: 'fetch', required: true, alternatives: ['XMLHttpRequest'], polyfill: 'whatwg-fetch' },
      { feature: 'promises', required: true, polyfill: 'es6-promise' },
      { feature: 'localStorage', required: true, alternatives: ['cookies'] },

      // Important features
      { feature: 'webSockets', required: true, alternatives: ['polling'], polyfill: 'sockjs-client' },
      { feature: 'serviceWorker', required: false, alternatives: ['application cache'] },
      { feature: 'notifications', required: false, alternatives: ['in-app alerts'] },

      // Enhanced features
      { feature: 'webWorkers', required: false },
      { feature: 'geolocation', required: false },
      { feature: 'camera', required: false },
      { feature: 'touchEvents', required: false },
      { feature: 'pushNotifications', required: false },
      { feature: 'webShare', required: false },
      { feature: 'clipboard', required: false }
    ]
  }

  /**
   * Detect current browser information
   */
  public detectBrowser(): BrowserInfo {
    const ua = navigator.userAgent
    const platform = navigator.platform
    const mobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)

    let name = 'Unknown'
    let version = 'Unknown'
    let engine = 'Unknown'

    // Browser detection
    if (ua.includes('Chrome') && !ua.includes('Edge')) {
      name = 'Chrome'
      version = this.extractVersion(ua, /Chrome\/(\d+\.?\d*)/)
      engine = 'Blink'
    } else if (ua.includes('Firefox')) {
      name = 'Firefox'
      version = this.extractVersion(ua, /Firefox\/(\d+\.?\d*)/)
      engine = 'Gecko'
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      name = 'Safari'
      version = this.extractVersion(ua, /Version\/(\d+\.?\d*)/)
      engine = 'WebKit'
    } else if (ua.includes('Edge')) {
      name = 'Edge'
      version = this.extractVersion(ua, /Edge?\/(\d+\.?\d*)/)
      engine = 'EdgeHTML'
    } else if (ua.includes('Trident')) {
      name = 'Internet Explorer'
      version = this.extractVersion(ua, /rv:(\d+\.?\d*)/)
      engine = 'Trident'
    }

    return {
      name,
      version,
      engine,
      platform,
      mobile,
      features: this.detectFeatures()
    }
  }

  /**
   * Extract version from user agent string
   */
  private extractVersion(ua: string, regex: RegExp): string {
    const match = ua.match(regex)
    return match ? match[1] : 'Unknown'
  }

  /**
   * Detect browser feature support
   */
  public detectFeatures(): BrowserFeatureSupport {
    return {
      indexedDB: 'indexedDB' in window,
      webSockets: 'WebSocket' in window,
      serviceWorker: 'serviceWorker' in navigator,
      webWorkers: 'Worker' in window,
      notifications: 'Notification' in window,
      geolocation: 'geolocation' in navigator,
      camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      localStorage: 'localStorage' in window,
      sessionStorage: 'sessionStorage' in window,
      fetch: 'fetch' in window,
      promises: 'Promise' in window,
      es6: this.testES6Support(),
      webAssembly: 'WebAssembly' in window,
      webGL: this.testWebGLSupport(),
      touchEvents: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      deviceOrientation: 'DeviceOrientationEvent' in window,
      pushNotifications: 'PushManager' in window,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      webShare: 'share' in navigator,
      clipboard: 'clipboard' in navigator
    }
  }

  /**
   * Test ES6 support
   */
  private testES6Support(): boolean {
    try {
      // Test arrow functions
      const arrow = () => true

      // Test const/let
      const constTest = true
      let letTest = true

      // Test template literals
      const template = `test ${constTest}`

      // Test destructuring
      const [a, b] = [1, 2]
      const { testProp } = { testProp: true }

      return arrow() && constTest && letTest && template.includes('test') && a === 1 && testProp
    } catch {
      return false
    }
  }

  /**
   * Test WebGL support
   */
  private testWebGLSupport(): boolean {
    try {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      return !!context
    } catch {
      return false
    }
  }

  /**
   * Run comprehensive compatibility tests
   */
  public async runCompatibilityTests(): Promise<CompatibilityTestResult> {
    const browser = this.detectBrowser()
    const testResults: { passed: boolean; name: string; error?: string }[] = []

    // Test IndexedDB functionality
    testResults.push(await this.testIndexedDB())

    // Test WebSocket functionality
    testResults.push(await this.testWebSockets())

    // Test Storage functionality
    testResults.push(await this.testStorage())

    // Test Network functionality
    testResults.push(await this.testNetworking())

    // Test PWA features
    testResults.push(await this.testPWAFeatures())

    // Test Mobile features (if mobile)
    if (browser.mobile) {
      testResults.push(await this.testMobileFeatures())
    }

    // Test Performance APIs
    testResults.push(await this.testPerformanceAPIs())

    // Calculate results
    const testsPassed = testResults.filter(r => r.passed).length
    const testsTotal = testResults.length
    const criticalFailures: string[] = []
    const warnings: string[] = []
    const recommendations: string[] = []

    // Analyze failures
    testResults.forEach(result => {
      if (!result.passed) {
        const requirement = this.requirements.find(req =>
          result.name.toLowerCase().includes(req.feature.toLowerCase())
        )

        if (requirement?.required) {
          criticalFailures.push(`${result.name}: ${result.error || 'Feature not supported'}`)
          if (requirement.polyfill) {
            recommendations.push(`Install polyfill: ${requirement.polyfill}`)
          }
          if (requirement.alternatives) {
            recommendations.push(`Consider alternatives: ${requirement.alternatives.join(', ')}`)
          }
        } else {
          warnings.push(`${result.name}: ${result.error || 'Feature not supported'}`)
        }
      }
    })

    // Calculate performance score
    const performanceScore = this.calculatePerformanceScore(browser, testResults)

    // Determine support level
    const supportLevel = this.determineSupportLevel(criticalFailures.length, warnings.length, performanceScore)

    // Add browser-specific recommendations
    this.addBrowserSpecificRecommendations(browser, recommendations)

    return {
      browser,
      testsPassed,
      testsTotal,
      criticalFailures,
      warnings,
      recommendations,
      performanceScore,
      supportLevel
    }
  }

  /**
   * Test IndexedDB functionality
   */
  private async testIndexedDB(): Promise<{ passed: boolean; name: string; error?: string }> {
    const testName = 'IndexedDB Support'

    try {
      if (!('indexedDB' in window)) {
        return { passed: false, name: testName, error: 'IndexedDB not available' }
      }

      // Test database creation
      const dbRequest = indexedDB.open('CompatibilityTest', 1)

      return new Promise((resolve) => {
        dbRequest.onerror = () => {
          resolve({ passed: false, name: testName, error: 'Failed to open IndexedDB' })
        }

        dbRequest.onsuccess = () => {
          try {
            const db = dbRequest.result
            db.close()
            indexedDB.deleteDatabase('CompatibilityTest')
            resolve({ passed: true, name: testName })
          } catch (error) {
            resolve({ passed: false, name: testName, error: error.message })
          }
        }

        dbRequest.onupgradeneeded = () => {
          try {
            const db = dbRequest.result
            const store = db.createObjectStore('test', { keyPath: 'id' })
            store.createIndex('testIndex', 'value')
          } catch (error) {
            resolve({ passed: false, name: testName, error: error.message })
          }
        }

        // Timeout after 5 seconds
        setTimeout(() => {
          resolve({ passed: false, name: testName, error: 'Test timeout' })
        }, 5000)
      })

    } catch (error) {
      return { passed: false, name: testName, error: error.message }
    }
  }

  /**
   * Test WebSocket functionality
   */
  private async testWebSockets(): Promise<{ passed: boolean; name: string; error?: string }> {
    const testName = 'WebSocket Support'

    try {
      if (!('WebSocket' in window)) {
        return { passed: false, name: testName, error: 'WebSocket not available' }
      }

      // Test WebSocket creation (we don't actually connect)
      const ws = new WebSocket('wss://echo.websocket.org')
      ws.close()

      return { passed: true, name: testName }

    } catch (error) {
      return { passed: false, name: testName, error: error.message }
    }
  }

  /**
   * Test Storage functionality
   */
  private async testStorage(): Promise<{ passed: boolean; name: string; error?: string }> {
    const testName = 'Storage Support'

    try {
      // Test localStorage
      if (!('localStorage' in window)) {
        return { passed: false, name: testName, error: 'localStorage not available' }
      }

      localStorage.setItem('compatibilityTest', 'test')
      const retrieved = localStorage.getItem('compatibilityTest')
      localStorage.removeItem('compatibilityTest')

      if (retrieved !== 'test') {
        return { passed: false, name: testName, error: 'localStorage not working correctly' }
      }

      // Test sessionStorage
      if (!('sessionStorage' in window)) {
        return { passed: false, name: testName, error: 'sessionStorage not available' }
      }

      sessionStorage.setItem('compatibilityTest', 'test')
      sessionStorage.removeItem('compatibilityTest')

      return { passed: true, name: testName }

    } catch (error) {
      return { passed: false, name: testName, error: error.message }
    }
  }

  /**
   * Test Network functionality
   */
  private async testNetworking(): Promise<{ passed: boolean; name: string; error?: string }> {
    const testName = 'Network APIs'

    try {
      if (!('fetch' in window)) {
        return { passed: false, name: testName, error: 'Fetch API not available' }
      }

      // Test basic fetch (to a data URL to avoid network dependency)
      const response = await fetch('data:text/plain;base64,dGVzdA==')
      const text = await response.text()

      if (text !== 'test') {
        return { passed: false, name: testName, error: 'Fetch API not working correctly' }
      }

      return { passed: true, name: testName }

    } catch (error) {
      return { passed: false, name: testName, error: error.message }
    }
  }

  /**
   * Test PWA features
   */
  private async testPWAFeatures(): Promise<{ passed: boolean; name: string; error?: string }> {
    const testName = 'PWA Features'

    try {
      const features = []

      // Service Worker
      if ('serviceWorker' in navigator) {
        features.push('serviceWorker')
      }

      // Notifications
      if ('Notification' in window) {
        features.push('notifications')
      }

      // Manifest
      const manifestLink = document.querySelector('link[rel="manifest"]')
      if (manifestLink) {
        features.push('manifest')
      }

      // At least basic PWA support required
      if (features.length < 2) {
        return { passed: false, name: testName, error: 'Insufficient PWA support' }
      }

      return { passed: true, name: testName }

    } catch (error) {
      return { passed: false, name: testName, error: error.message }
    }
  }

  /**
   * Test Mobile-specific features
   */
  private async testMobileFeatures(): Promise<{ passed: boolean; name: string; error?: string }> {
    const testName = 'Mobile Features'

    try {
      const features = []

      // Touch events
      if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        features.push('touch')
      }

      // Device orientation
      if ('DeviceOrientationEvent' in window) {
        features.push('orientation')
      }

      // Vibration
      if ('vibrate' in navigator) {
        features.push('vibration')
      }

      // Basic mobile support
      if (features.length === 0) {
        return { passed: false, name: testName, error: 'No mobile features detected' }
      }

      return { passed: true, name: testName }

    } catch (error) {
      return { passed: false, name: testName, error: error.message }
    }
  }

  /**
   * Test Performance APIs
   */
  private async testPerformanceAPIs(): Promise<{ passed: boolean; name: string; error?: string }> {
    const testName = 'Performance APIs'

    try {
      if (!('performance' in window)) {
        return { passed: false, name: testName, error: 'Performance API not available' }
      }

      // Test performance.now()
      const start = performance.now()
      await new Promise(resolve => setTimeout(resolve, 1))
      const end = performance.now()

      if (end <= start) {
        return { passed: false, name: testName, error: 'performance.now() not working' }
      }

      return { passed: true, name: testName }

    } catch (error) {
      return { passed: false, name: testName, error: error.message }
    }
  }

  /**
   * Calculate performance score
   */
  private calculatePerformanceScore(browser: BrowserInfo, testResults: any[]): number {
    let score = 0

    // Base score from test results
    const passRate = testResults.filter(r => r.passed).length / testResults.length
    score += passRate * 60 // Max 60 points

    // Browser-specific scoring
    if (browser.name === 'Chrome' && parseFloat(browser.version) >= 70) {
      score += 20
    } else if (browser.name === 'Firefox' && parseFloat(browser.version) >= 65) {
      score += 18
    } else if (browser.name === 'Safari' && parseFloat(browser.version) >= 12) {
      score += 15
    } else if (browser.name === 'Edge' && parseFloat(browser.version) >= 80) {
      score += 17
    } else {
      score += 5 // Basic support
    }

    // Feature bonus
    const criticalFeatures = ['indexedDB', 'webSockets', 'fetch', 'localStorage']
    const supportedCritical = criticalFeatures.filter(feature => browser.features[feature]).length
    score += (supportedCritical / criticalFeatures.length) * 20

    return Math.min(100, Math.round(score))
  }

  /**
   * Determine support level
   */
  private determineSupportLevel(criticalFailures: number, warnings: number, performanceScore: number): 'full' | 'partial' | 'minimal' | 'unsupported' {
    if (criticalFailures > 0) {
      return 'unsupported'
    }

    if (performanceScore >= 85 && warnings === 0) {
      return 'full'
    }

    if (performanceScore >= 70 && warnings <= 2) {
      return 'partial'
    }

    if (performanceScore >= 50) {
      return 'minimal'
    }

    return 'unsupported'
  }

  /**
   * Add browser-specific recommendations
   */
  private addBrowserSpecificRecommendations(browser: BrowserInfo, recommendations: string[]): void {
    // Internet Explorer specific
    if (browser.name === 'Internet Explorer') {
      recommendations.push('Consider upgrading to Microsoft Edge for better compatibility')
      recommendations.push('Install polyfills for ES6+ features')
    }

    // Safari specific
    if (browser.name === 'Safari' && parseFloat(browser.version) < 12) {
      recommendations.push('Update Safari to version 12+ for full PWA support')
    }

    // Mobile specific
    if (browser.mobile) {
      recommendations.push('Ensure responsive design is enabled')
      recommendations.push('Test touch interactions thoroughly')
      recommendations.push('Consider offline functionality for mobile users')
    }

    // General recommendations
    if (!browser.features.serviceWorker) {
      recommendations.push('Service Worker not supported - offline features will be limited')
    }

    if (!browser.features.notifications) {
      recommendations.push('Browser notifications not supported - consider in-app notifications')
    }
  }

  /**
   * Generate compatibility report HTML
   */
  public generateReport(result: CompatibilityTestResult): string {
    const statusColor = {
      full: '#10b981',
      partial: '#f59e0b',
      minimal: '#ef4444',
      unsupported: '#6b7280'
    }[result.supportLevel]

    return `
      <div class="compatibility-report">
        <h2>Browser Compatibility Report</h2>

        <div class="browser-info">
          <h3>Browser Information</h3>
          <p><strong>Browser:</strong> ${result.browser.name} ${result.browser.version}</p>
          <p><strong>Engine:</strong> ${result.browser.engine}</p>
          <p><strong>Platform:</strong> ${result.browser.platform}</p>
          <p><strong>Mobile:</strong> ${result.browser.mobile ? 'Yes' : 'No'}</p>
        </div>

        <div class="test-results">
          <h3>Test Results</h3>
          <p><strong>Tests Passed:</strong> ${result.testsPassed}/${result.testsTotal}</p>
          <p><strong>Performance Score:</strong> ${result.performanceScore}/100</p>
          <p><strong>Support Level:</strong>
            <span style="color: ${statusColor}; font-weight: bold;">
              ${result.supportLevel.toUpperCase()}
            </span>
          </p>
        </div>

        ${result.criticalFailures.length > 0 ? `
          <div class="critical-failures">
            <h3 style="color: #ef4444;">Critical Failures</h3>
            <ul>
              ${result.criticalFailures.map(failure => `<li>${failure}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${result.warnings.length > 0 ? `
          <div class="warnings">
            <h3 style="color: #f59e0b;">Warnings</h3>
            <ul>
              ${result.warnings.map(warning => `<li>${warning}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${result.recommendations.length > 0 ? `
          <div class="recommendations">
            <h3>Recommendations</h3>
            <ul>
              ${result.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `
  }
}

// Export singleton instance
export const browserCompatibilityTester = new BrowserCompatibilityTester()
export default BrowserCompatibilityTester