/**
 * B.10.4 Advanced Mobile & PWA - Cross-Browser Automation Tester
 * Cross-browser compatibility testing for mobile automation features
 */

export interface BrowserInfo {
  name: string
  version: string
  engine: string
  platform: string
  isMobile: boolean
  supportsServiceWorker: boolean
  supportsPushNotifications: boolean
  supportsHapticFeedback: boolean
  supportsVoiceControl: boolean
  supportsWebRTC: boolean
  supportsIndexedDB: boolean
  supportsWebGL: boolean
}

export interface TestResult {
  testName: string
  browser: string
  status: 'passed' | 'failed' | 'skipped' | 'warning'
  score: number
  details: string
  suggestions: string[]
  timestamp: Date
}

export interface CompatibilityReport {
  overallScore: number
  browserScores: Record<string, number>
  testResults: TestResult[]
  recommendations: string[]
  criticalIssues: string[]
  warnings: string[]
}

export interface TestSuite {
  name: string
  tests: TestCase[]
  requiredFeatures: string[]
  targetBrowsers: string[]
}

export interface TestCase {
  name: string
  description: string
  testFunction: () => Promise<boolean>
  requiredFeature?: string
  critical: boolean
  weight: number
}

export class CrossBrowserAutomationTester {
  private browserInfo: BrowserInfo
  private testResults: TestResult[] = []
  private isInitialized = false
  private testSuites: Map<string, TestSuite> = new Map()

  constructor() {
    this.browserInfo = this.detectBrowser()
    this.setupTestSuites()
  }

  /**
   * Initialize cross-browser tester
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    console.log('🌐 Initializing Cross-Browser Automation Tester...')

    try {
      // Detect browser capabilities
      await this.detectBrowserCapabilities()

      // Setup test environment
      await this.setupTestEnvironment()

      this.isInitialized = true
      console.log('✅ Cross-Browser Automation Tester initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize cross-browser tester:', error)
      throw error
    }
  }

  /**
   * Run cross-browser compatibility tests
   */
  public async runCompatibilityTests(): Promise<CompatibilityReport> {
    console.log('🌐 Running cross-browser compatibility tests...')

    const testResults: TestResult[] = []
    const browserScores: Record<string, number> = {}
    const recommendations: string[] = []
    const criticalIssues: string[] = []
    const warnings: string[] = []

    try {
      // Run test suites
      for (const [suiteName, suite] of this.testSuites) {
        console.log(`🌐 Running test suite: ${suiteName}`)

        const suiteResults = await this.runTestSuite(suite)
        testResults.push(...suiteResults)
      }

      // Calculate browser scores
      browserScores[this.browserInfo.name] =
        this.calculateBrowserScore(testResults)

      // Generate recommendations
      recommendations.push(...this.generateRecommendations(testResults))

      // Identify critical issues
      criticalIssues.push(...this.identifyCriticalIssues(testResults))

      // Identify warnings
      warnings.push(...this.identifyWarnings(testResults))

      const report: CompatibilityReport = {
        overallScore: this.calculateOverallScore(testResults),
        browserScores,
        testResults,
        recommendations,
        criticalIssues,
        warnings,
      }

      this.testResults = testResults
      console.log(
        `🌐 Compatibility tests completed. Overall score: ${report.overallScore}/100`
      )

      return report
    } catch (error) {
      console.error('Failed to run compatibility tests:', error)
      throw error
    }
  }

  /**
   * Test specific automation feature
   */
  public async testAutomationFeature(feature: string): Promise<TestResult> {
    const testCase = this.findTestCase(feature)
    if (!testCase) {
      throw new Error(`Test case not found for feature: ${feature}`)
    }

    try {
      const passed = await testCase.testFunction()

      const result: TestResult = {
        testName: testCase.name,
        browser: this.browserInfo.name,
        status: passed ? 'passed' : 'failed',
        score: passed ? 100 : 0,
        details: passed ? 'Feature working correctly' : 'Feature not working',
        suggestions: passed ? [] : [`Fix ${feature} compatibility`],
        timestamp: new Date(),
      }

      return result
    } catch (error) {
      return {
        testName: testCase.name,
        browser: this.browserInfo.name,
        status: 'failed',
        score: 0,
        details: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        suggestions: [`Debug ${feature} implementation`],
        timestamp: new Date(),
      }
    }
  }

  /**
   * Get browser information
   */
  public getBrowserInfo(): BrowserInfo {
    return { ...this.browserInfo }
  }

  /**
   * Get test results
   */
  public getTestResults(): TestResult[] {
    return [...this.testResults]
  }

  /**
   * Check if feature is supported
   */
  public isFeatureSupported(feature: string): boolean {
    switch (feature) {
      case 'serviceWorker':
        return this.browserInfo.supportsServiceWorker
      case 'pushNotifications':
        return this.browserInfo.supportsPushNotifications
      case 'hapticFeedback':
        return this.browserInfo.supportsHapticFeedback
      case 'voiceControl':
        return this.browserInfo.supportsVoiceControl
      case 'webRTC':
        return this.browserInfo.supportsWebRTC
      case 'indexedDB':
        return this.browserInfo.supportsIndexedDB
      case 'webGL':
        return this.browserInfo.supportsWebGL
      default:
        return false
    }
  }

  /**
   * Private helper methods
   */

  private detectBrowser(): BrowserInfo {
    const userAgent = navigator.userAgent
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent
      )

    let browserName = 'Unknown'
    let browserVersion = 'Unknown'
    let engine = 'Unknown'
    let platform = 'Unknown'

    // Detect browser
    if (userAgent.includes('Chrome')) {
      browserName = 'Chrome'
      const match = userAgent.match(/Chrome\/(\d+)/)
      browserVersion = match ? match[1] : 'Unknown'
      engine = 'Blink'
    } else if (userAgent.includes('Firefox')) {
      browserName = 'Firefox'
      const match = userAgent.match(/Firefox\/(\d+)/)
      browserVersion = match ? match[1] : 'Unknown'
      engine = 'Gecko'
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browserName = 'Safari'
      const match = userAgent.match(/Version\/(\d+)/)
      browserVersion = match ? match[1] : 'Unknown'
      engine = 'WebKit'
    } else if (userAgent.includes('Edge')) {
      browserName = 'Edge'
      const match = userAgent.match(/Edge\/(\d+)/)
      browserVersion = match ? match[1] : 'Unknown'
      engine = 'EdgeHTML'
    }

    // Detect platform
    if (userAgent.includes('Windows')) {
      platform = 'Windows'
    } else if (userAgent.includes('Mac')) {
      platform = 'macOS'
    } else if (userAgent.includes('Linux')) {
      platform = 'Linux'
    } else if (userAgent.includes('Android')) {
      platform = 'Android'
    } else if (userAgent.includes('iOS')) {
      platform = 'iOS'
    }

    return {
      name: browserName,
      version: browserVersion,
      engine,
      platform,
      isMobile,
      supportsServiceWorker: false, // Will be detected
      supportsPushNotifications: false, // Will be detected
      supportsHapticFeedback: false, // Will be detected
      supportsVoiceControl: false, // Will be detected
      supportsWebRTC: false, // Will be detected
      supportsIndexedDB: false, // Will be detected
      supportsWebGL: false, // Will be detected
    }
  }

  private async detectBrowserCapabilities(): Promise<void> {
    // Detect Service Worker support
    this.browserInfo.supportsServiceWorker = 'serviceWorker' in navigator

    // Detect Push Notification support
    this.browserInfo.supportsPushNotifications =
      'Notification' in window && 'PushManager' in window

    // Detect Haptic Feedback support
    this.browserInfo.supportsHapticFeedback = 'vibrate' in navigator

    // Detect Voice Control support
    this.browserInfo.supportsVoiceControl =
      'webkitSpeechRecognition' in window || 'SpeechRecognition' in window

    // Detect WebRTC support
    this.browserInfo.supportsWebRTC = 'RTCPeerConnection' in window

    // Detect IndexedDB support
    this.browserInfo.supportsIndexedDB = 'indexedDB' in window

    // Detect WebGL support
    const canvas = document.createElement('canvas')
    this.browserInfo.supportsWebGL = !!(
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    )

    console.log('🌐 Browser capabilities detected:', this.browserInfo)
  }

  private setupTestEnvironment(): Promise<void> {
    return new Promise(resolve => {
      // Setup test environment
      console.log('🌐 Setting up test environment...')

      // Add test styles
      const style = document.createElement('style')
      style.textContent = `
        .test-element {
          position: absolute;
          top: -9999px;
          left: -9999px;
          width: 1px;
          height: 1px;
          opacity: 0;
        }
      `
      document.head.appendChild(style)

      resolve()
    })
  }

  private setupTestSuites(): void {
    // Mobile Automation Test Suite
    this.testSuites.set('mobile-automation', {
      name: 'Mobile Automation Features',
      tests: [
        {
          name: 'Service Worker Registration',
          description: 'Test service worker registration for automation',
          testFunction: this.testServiceWorkerRegistration.bind(this),
          requiredFeature: 'serviceWorker',
          critical: true,
          weight: 20,
        },
        {
          name: 'Push Notifications',
          description: 'Test push notification support for automation alerts',
          testFunction: this.testPushNotifications.bind(this),
          requiredFeature: 'pushNotifications',
          critical: true,
          weight: 15,
        },
        {
          name: 'Haptic Feedback',
          description: 'Test haptic feedback for automation interactions',
          testFunction: this.testHapticFeedback.bind(this),
          requiredFeature: 'hapticFeedback',
          critical: false,
          weight: 10,
        },
        {
          name: 'Voice Control',
          description: 'Test voice control for automation commands',
          testFunction: this.testVoiceControl.bind(this),
          requiredFeature: 'voiceControl',
          critical: false,
          weight: 10,
        },
        {
          name: 'Offline Storage',
          description: 'Test offline storage for automation data',
          testFunction: this.testOfflineStorage.bind(this),
          requiredFeature: 'indexedDB',
          critical: true,
          weight: 15,
        },
        {
          name: 'Touch Events',
          description: 'Test touch event handling for automation controls',
          testFunction: this.testTouchEvents.bind(this),
          critical: true,
          weight: 15,
        },
        {
          name: 'Responsive Design',
          description: 'Test responsive design for automation interfaces',
          testFunction: this.testResponsiveDesign.bind(this),
          critical: true,
          weight: 10,
        },
        {
          name: 'Performance',
          description: 'Test performance of automation features',
          testFunction: this.testPerformance.bind(this),
          critical: false,
          weight: 5,
        },
      ],
      requiredFeatures: ['serviceWorker', 'pushNotifications', 'indexedDB'],
      targetBrowsers: ['Chrome', 'Firefox', 'Safari', 'Edge'],
    })

    // PWA Features Test Suite
    this.testSuites.set('pwa-features', {
      name: 'PWA Features',
      tests: [
        {
          name: 'Web App Manifest',
          description: 'Test web app manifest for PWA installation',
          testFunction: this.testWebAppManifest.bind(this),
          critical: true,
          weight: 20,
        },
        {
          name: 'Background Sync',
          description: 'Test background sync for automation data',
          testFunction: this.testBackgroundSync.bind(this),
          requiredFeature: 'serviceWorker',
          critical: true,
          weight: 20,
        },
        {
          name: 'Cache API',
          description: 'Test cache API for automation resources',
          testFunction: this.testCacheAPI.bind(this),
          requiredFeature: 'serviceWorker',
          critical: true,
          weight: 15,
        },
        {
          name: 'Install Prompt',
          description: 'Test PWA install prompt functionality',
          testFunction: this.testInstallPrompt.bind(this),
          critical: false,
          weight: 10,
        },
        {
          name: 'Offline Functionality',
          description: 'Test offline functionality of automation features',
          testFunction: this.testOfflineFunctionality.bind(this),
          critical: true,
          weight: 20,
        },
        {
          name: 'Update Mechanism',
          description: 'Test update mechanism for automation features',
          testFunction: this.testUpdateMechanism.bind(this),
          critical: false,
          weight: 15,
        },
      ],
      requiredFeatures: ['serviceWorker'],
      targetBrowsers: ['Chrome', 'Firefox', 'Safari', 'Edge'],
    })
  }

  private async runTestSuite(suite: TestSuite): Promise<TestResult[]> {
    const results: TestResult[] = []

    for (const testCase of suite.tests) {
      try {
        // Check if required feature is supported
        if (
          testCase.requiredFeature &&
          !this.isFeatureSupported(testCase.requiredFeature)
        ) {
          results.push({
            testName: testCase.name,
            browser: this.browserInfo.name,
            status: 'skipped',
            score: 0,
            details: `Required feature ${testCase.requiredFeature} not supported`,
            suggestions: [
              `Upgrade browser to support ${testCase.requiredFeature}`,
            ],
            timestamp: new Date(),
          })
          continue
        }

        const passed = await testCase.testFunction()

        results.push({
          testName: testCase.name,
          browser: this.browserInfo.name,
          status: passed ? 'passed' : 'failed',
          score: passed ? 100 : 0,
          details: passed ? 'Test passed successfully' : 'Test failed',
          suggestions: passed ? [] : [`Fix ${testCase.name} compatibility`],
          timestamp: new Date(),
        })
      } catch (error) {
        results.push({
          testName: testCase.name,
          browser: this.browserInfo.name,
          status: 'failed',
          score: 0,
          details: `Test error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          suggestions: [`Debug ${testCase.name} implementation`],
          timestamp: new Date(),
        })
      }
    }

    return results
  }

  private async testServiceWorkerRegistration(): Promise<boolean> {
    try {
      if (!('serviceWorker' in navigator)) return false

      const registration = await navigator.serviceWorker.register('/test-sw.js')
      return !!registration
    } catch (error) {
      return false
    }
  }

  private async testPushNotifications(): Promise<boolean> {
    try {
      if (!('Notification' in window)) return false
      if (!('PushManager' in window)) return false

      const permission = await Notification.requestPermission()
      return permission === 'granted'
    } catch (error) {
      return false
    }
  }

  private async testHapticFeedback(): Promise<boolean> {
    try {
      if (!('vibrate' in navigator)) return false

      navigator.vibrate(100)
      return true
    } catch (error) {
      return false
    }
  }

  private async testVoiceControl(): Promise<boolean> {
    try {
      return (
        'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
      )
    } catch (error) {
      return false
    }
  }

  private async testOfflineStorage(): Promise<boolean> {
    try {
      if (!('indexedDB' in window)) return false

      const request = indexedDB.open('test-db', 1)
      return new Promise(resolve => {
        request.onsuccess = () => resolve(true)
        request.onerror = () => resolve(false)
      })
    } catch (error) {
      return false
    }
  }

  private async testTouchEvents(): Promise<boolean> {
    try {
      const testElement = document.createElement('div')
      testElement.className = 'test-element'
      document.body.appendChild(testElement)

      let touchSupported = false

      testElement.addEventListener('touchstart', () => {
        touchSupported = true
      })

      // Simulate touch event
      const touchEvent = new TouchEvent('touchstart', {
        touches: [
          new Touch({
            identifier: 1,
            target: testElement,
            clientX: 0,
            clientY: 0,
            screenX: 0,
            screenY: 0,
            pageX: 0,
            pageY: 0,
          }),
        ],
      })

      testElement.dispatchEvent(touchEvent)

      document.body.removeChild(testElement)
      return touchSupported
    } catch (error) {
      return false
    }
  }

  private async testResponsiveDesign(): Promise<boolean> {
    try {
      // Test if CSS media queries are supported
      const mediaQuery = window.matchMedia('(max-width: 768px)')
      return mediaQuery.matches !== undefined
    } catch (error) {
      return false
    }
  }

  private async testPerformance(): Promise<boolean> {
    try {
      // Test if Performance API is supported
      return 'performance' in window && 'now' in performance
    } catch (error) {
      return false
    }
  }

  private async testWebAppManifest(): Promise<boolean> {
    try {
      const manifestLink = document.querySelector('link[rel="manifest"]')
      return !!manifestLink
    } catch (error) {
      return false
    }
  }

  private async testBackgroundSync(): Promise<boolean> {
    try {
      if (!('serviceWorker' in navigator)) return false

      const registration = await navigator.serviceWorker.ready
      return 'sync' in registration
    } catch (error) {
      return false
    }
  }

  private async testCacheAPI(): Promise<boolean> {
    try {
      return 'caches' in window
    } catch (error) {
      return false
    }
  }

  private async testInstallPrompt(): Promise<boolean> {
    try {
      // Test if beforeinstallprompt event is supported
      return 'onbeforeinstallprompt' in window
    } catch (error) {
      return false
    }
  }

  private async testOfflineFunctionality(): Promise<boolean> {
    try {
      // Test offline functionality
      return navigator.onLine !== undefined
    } catch (error) {
      return false
    }
  }

  private async testUpdateMechanism(): Promise<boolean> {
    try {
      if (!('serviceWorker' in navigator)) return false

      const registration = await navigator.serviceWorker.ready
      return 'update' in registration
    } catch (error) {
      return false
    }
  }

  private findTestCase(feature: string): TestCase | null {
    for (const suite of this.testSuites.values()) {
      const testCase = suite.tests.find(test =>
        test.name.toLowerCase().includes(feature.toLowerCase())
      )
      if (testCase) return testCase
    }
    return null
  }

  private calculateBrowserScore(results: TestResult[]): number {
    if (results.length === 0) return 0

    const totalWeight = results.reduce((sum, result) => {
      const testCase = this.findTestCase(result.testName)
      return sum + (testCase?.weight || 1)
    }, 0)

    const weightedScore = results.reduce((sum, result) => {
      const testCase = this.findTestCase(result.testName)
      const weight = testCase?.weight || 1
      return sum + result.score * weight
    }, 0)

    return Math.round(weightedScore / totalWeight)
  }

  private calculateOverallScore(results: TestResult[]): number {
    if (results.length === 0) return 0

    const passedTests = results.filter(r => r.status === 'passed').length
    return Math.round((passedTests / results.length) * 100)
  }

  private generateRecommendations(results: TestResult[]): string[] {
    const recommendations: string[] = []

    const failedTests = results.filter(r => r.status === 'failed')

    if (failedTests.some(r => r.testName.includes('Service Worker'))) {
      recommendations.push(
        'Implement Service Worker fallback for older browsers'
      )
    }

    if (failedTests.some(r => r.testName.includes('Push Notifications'))) {
      recommendations.push(
        'Add alternative notification methods for browsers without push support'
      )
    }

    if (failedTests.some(r => r.testName.includes('Haptic Feedback'))) {
      recommendations.push(
        'Implement visual feedback alternatives for haptic features'
      )
    }

    if (failedTests.some(r => r.testName.includes('Voice Control'))) {
      recommendations.push(
        'Add keyboard shortcuts as alternative to voice control'
      )
    }

    if (failedTests.some(r => r.testName.includes('Offline Storage'))) {
      recommendations.push('Implement localStorage fallback for IndexedDB')
    }

    return recommendations
  }

  private identifyCriticalIssues(results: TestResult[]): string[] {
    const criticalIssues: string[] = []

    const criticalFailures = results.filter(
      r =>
        r.status === 'failed' &&
        this.findTestCase(r.testName)?.critical === true
    )

    criticalFailures.forEach(result => {
      criticalIssues.push(
        `Critical feature ${result.testName} not working in ${this.browserInfo.name}`
      )
    })

    return criticalIssues
  }

  private identifyWarnings(results: TestResult[]): string[] {
    const warnings: string[] = []

    const warnings_results = results.filter(r => r.status === 'warning')

    warnings_results.forEach(result => {
      warnings.push(
        `Warning: ${result.testName} has issues in ${this.browserInfo.name}`
      )
    })

    return warnings
  }

  /**
   * Stop cross-browser tester
   */
  public async stop(): Promise<void> {
    this.testResults = []
    this.isInitialized = false
    console.log('🌐 Cross-Browser Automation Tester stopped')
  }
}

// Export singleton instance
export const crossBrowserAutomationTester = new CrossBrowserAutomationTester()

export default crossBrowserAutomationTester
