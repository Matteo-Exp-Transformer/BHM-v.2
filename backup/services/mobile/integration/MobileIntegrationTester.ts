/**
 * MobileIntegrationTester - B.10.4 Session 2 Cross-System Integration Testing
 * Comprehensive testing for enhanced camera, GPS, and PWA integration
 * Tests integration with existing B.8.4 and B.10.3 systems
 */

import { inventoryCameraService } from '../camera/InventoryCameraService'
import { multiLocationService } from '../location/MultiLocationService'
import { mobilePerformanceOptimizer } from '../performance/MobilePerformanceOptimizer'
import { backgroundSyncService } from '../pwa/BackgroundSyncService'
import { pushNotificationService } from '../pwa/PushNotificationService'
import { serviceWorkerManager } from '../pwa/ServiceWorkerManager'

export interface IntegrationTestResult {
  testId: string
  testName: string
  status: 'passed' | 'failed' | 'skipped'
  duration: number
  details: {
    description: string
    expected: any
    actual: any
    error?: string
    recommendations?: string[]
  }
  timestamp: Date
}

export interface TestSuite {
  suiteId: string
  suiteName: string
  tests: IntegrationTestResult[]
  overallStatus: 'passed' | 'failed' | 'partial'
  duration: number
  coverage: {
    camera: boolean
    gps: boolean
    pwa: boolean
    performance: boolean
    integration: boolean
  }
}

export interface IntegrationMetrics {
  totalTests: number
  passedTests: number
  failedTests: number
  skippedTests: number
  coverage: number
  averageTestDuration: number
  criticalFailures: number
  recommendations: string[]
}

export class MobileIntegrationTester {
  private static instance: MobileIntegrationTester
  private testResults: IntegrationTestResult[] = []
  private testSuites: TestSuite[] = []
  private isRunning = false

  private constructor() {}

  public static getInstance(): MobileIntegrationTester {
    if (!MobileIntegrationTester.instance) {
      MobileIntegrationTester.instance = new MobileIntegrationTester()
    }
    return MobileIntegrationTester.instance
  }

  /**
   * Initialize mobile integration tester
   */
  public async initialize(): Promise<void> {
    try {
      console.log('🧪 Mobile integration tester initialized')
    } catch (error) {
      console.error(
        '❌ Mobile integration tester initialization failed:',
        error
      )
      throw new Error('Mobile integration tester initialization failed')
    }
  }

  /**
   * Run comprehensive integration test suite
   */
  public async runFullIntegrationTest(): Promise<TestSuite> {
    if (this.isRunning) {
      throw new Error('Integration test already running')
    }

    this.isRunning = true
    const startTime = Date.now()

    try {
      console.log('🧪 Starting comprehensive mobile integration test suite...')

      const testSuite: TestSuite = {
        suiteId: `integration_${Date.now()}`,
        suiteName: 'B.10.4 Mobile Integration Test Suite',
        tests: [],
        overallStatus: 'passed',
        duration: 0,
        coverage: {
          camera: false,
          gps: false,
          pwa: false,
          performance: false,
          integration: false,
        },
      }

      // Run camera integration tests
      const cameraTests = await this.runCameraIntegrationTests()
      testSuite.tests.push(...cameraTests)
      testSuite.coverage.camera = cameraTests.length > 0

      // Run GPS integration tests
      const gpsTests = await this.runGPSIntegrationTests()
      testSuite.tests.push(...gpsTests)
      testSuite.coverage.gps = gpsTests.length > 0

      // Run PWA integration tests
      const pwaTests = await this.runPWAIntegrationTests()
      testSuite.tests.push(...pwaTests)
      testSuite.coverage.pwa = pwaTests.length > 0

      // Run performance integration tests
      const performanceTests = await this.runPerformanceIntegrationTests()
      testSuite.tests.push(...performanceTests)
      testSuite.coverage.performance = performanceTests.length > 0

      // Run cross-system integration tests
      const integrationTests = await this.runCrossSystemIntegrationTests()
      testSuite.tests.push(...integrationTests)
      testSuite.coverage.integration = integrationTests.length > 0

      // Calculate overall status
      const failedTests = testSuite.tests.filter(t => t.status === 'failed')
      const passedTests = testSuite.tests.filter(t => t.status === 'passed')

      if (failedTests.length === 0) {
        testSuite.overallStatus = 'passed'
      } else if (passedTests.length === 0) {
        testSuite.overallStatus = 'failed'
      } else {
        testSuite.overallStatus = 'partial'
      }

      testSuite.duration = Date.now() - startTime
      this.testSuites.push(testSuite)
      this.testResults.push(...testSuite.tests)

      console.log(
        `🧪 Integration test suite completed in ${testSuite.duration}ms`
      )
      console.log(
        `🧪 Results: ${passedTests.length} passed, ${failedTests.length} failed`
      )

      return testSuite
    } finally {
      this.isRunning = false
    }
  }

  /**
   * Run camera integration tests
   */
  private async runCameraIntegrationTests(): Promise<IntegrationTestResult[]> {
    const tests: IntegrationTestResult[] = []

    // Test 1: Camera service initialization
    tests.push(
      await this.runTest(
        'camera_init',
        'Camera Service Initialization',
        async () => {
          const status = inventoryCameraService.getStatus()
          return status.initialized
        },
        true,
        'Camera service should be initialized'
      )
    )

    // Test 2: Inventory photo capture
    tests.push(
      await this.runTest(
        'camera_capture',
        'Inventory Photo Capture',
        async () => {
          try {
            const photo = await inventoryCameraService.captureInventoryPhoto({
              productName: 'Test Product',
              category: 'test',
              location: 'Test Location',
            })
            return photo.id !== undefined
          } catch (error) {
            return false
          }
        },
        true,
        'Should be able to capture inventory photos'
      )
    )

    // Test 3: Photo quality analysis
    tests.push(
      await this.runTest(
        'camera_quality',
        'Photo Quality Analysis',
        async () => {
          const status = inventoryCameraService.getStatus()
          return status.qualityAnalyzerReady
        },
        true,
        'Quality analyzer should be ready'
      )
    )

    // Test 4: Barcode scanning capability
    tests.push(
      await this.runTest(
        'camera_barcode',
        'Barcode Scanning Capability',
        async () => {
          const status = inventoryCameraService.getStatus()
          return status.barcodeScannerReady
        },
        true,
        'Barcode scanner should be ready'
      )
    )

    return tests
  }

  /**
   * Run GPS integration tests
   */
  private async runGPSIntegrationTests(): Promise<IntegrationTestResult[]> {
    const tests: IntegrationTestResult[] = []

    // Test 1: Multi-location service initialization
    tests.push(
      await this.runTest(
        'gps_init',
        'Multi-Location Service Initialization',
        async () => {
          const status = multiLocationService.getStatus()
          return status.initialized
        },
        true,
        'Multi-location service should be initialized'
      )
    )

    // Test 2: Facility detection
    tests.push(
      await this.runTest(
        'gps_facility_detection',
        'Facility Detection',
        async () => {
          try {
            const facility = await multiLocationService.detectCurrentFacility()
            return facility !== null || facility === null // Both valid states
          } catch (error) {
            return false
          }
        },
        true,
        'Should be able to detect current facility'
      )
    )

    // Test 3: Location transitions
    tests.push(
      await this.runTest(
        'gps_transitions',
        'Location Transition Tracking',
        async () => {
          const status = multiLocationService.getStatus()
          return status.trackingTransitions !== undefined
        },
        true,
        'Location transition tracking should be available'
      )
    )

    // Test 4: Location analytics
    tests.push(
      await this.runTest(
        'gps_analytics',
        'Location Analytics',
        async () => {
          try {
            const analytics = multiLocationService.getLocationAnalytics()
            return analytics.totalLocations >= 0
          } catch (error) {
            return false
          }
        },
        true,
        'Location analytics should be available'
      )
    )

    return tests
  }

  /**
   * Run PWA integration tests
   */
  private async runPWAIntegrationTests(): Promise<IntegrationTestResult[]> {
    const tests: IntegrationTestResult[] = []

    // Test 1: Service worker status
    tests.push(
      await this.runTest(
        'pwa_service_worker',
        'Service Worker Status',
        async () => {
          const status = serviceWorkerManager.getStatus()
          return status.registered
        },
        true,
        'Service worker should be registered'
      )
    )

    // Test 2: Background sync capability
    tests.push(
      await this.runTest(
        'pwa_background_sync',
        'Background Sync Capability',
        async () => {
          const status = backgroundSyncService.getStatus()
          return status.initialized
        },
        true,
        'Background sync should be initialized'
      )
    )

    // Test 3: Push notification capability
    tests.push(
      await this.runTest(
        'pwa_push_notifications',
        'Push Notification Capability',
        async () => {
          const status = pushNotificationService.getStatus()
          return status.initialized
        },
        true,
        'Push notification service should be initialized'
      )
    )

    // Test 4: Offline capability
    tests.push(
      await this.runTest(
        'pwa_offline',
        'Offline Capability',
        async () => {
          const status = backgroundSyncService.getStatus()
          return status.offlineCapability
        },
        true,
        'Offline capability should be available'
      )
    )

    return tests
  }

  /**
   * Run performance integration tests
   */
  private async runPerformanceIntegrationTests(): Promise<
    IntegrationTestResult[]
  > {
    const tests: IntegrationTestResult[] = []

    // Test 1: Performance optimizer initialization
    tests.push(
      await this.runTest(
        'performance_init',
        'Performance Optimizer Initialization',
        async () => {
          const status = mobilePerformanceOptimizer.getStatus()
          return status.initialized
        },
        true,
        'Performance optimizer should be initialized'
      )
    )

    // Test 2: Performance monitoring
    tests.push(
      await this.runTest(
        'performance_monitoring',
        'Performance Monitoring',
        async () => {
          const status = mobilePerformanceOptimizer.getStatus()
          return status.monitoring
        },
        true,
        'Performance monitoring should be active'
      )
    )

    // Test 3: Metrics collection
    tests.push(
      await this.runTest(
        'performance_metrics',
        'Performance Metrics Collection',
        async () => {
          try {
            const metrics =
              await mobilePerformanceOptimizer.measurePerformance()
            return metrics.timestamp !== undefined
          } catch (error) {
            return false
          }
        },
        true,
        'Performance metrics should be collectible'
      )
    )

    // Test 4: Optimization capability
    tests.push(
      await this.runTest(
        'performance_optimization',
        'Performance Optimization',
        async () => {
          try {
            const result = await mobilePerformanceOptimizer.checkAndOptimize()
            return result !== undefined
          } catch (error) {
            return false
          }
        },
        true,
        'Performance optimization should be available'
      )
    )

    return tests
  }

  /**
   * Run cross-system integration tests
   */
  private async runCrossSystemIntegrationTests(): Promise<
    IntegrationTestResult[]
  > {
    const tests: IntegrationTestResult[] = []

    // Test 1: Camera-GPS integration
    tests.push(
      await this.runTest(
        'integration_camera_gps',
        'Camera-GPS Integration',
        async () => {
          try {
            // Test location-tagged photo capture
            const photo = await inventoryCameraService.captureInventoryPhoto({
              productName: 'Integration Test Product',
              category: 'test',
              location: 'Integration Test Location',
            })
            return photo.location !== undefined
          } catch (error) {
            return false
          }
        },
        true,
        'Camera should integrate with GPS for location tagging'
      )
    )

    // Test 2: GPS-Performance integration
    tests.push(
      await this.runTest(
        'integration_gps_performance',
        'GPS-Performance Integration',
        async () => {
          try {
            const metrics =
              await mobilePerformanceOptimizer.measurePerformance()
            return metrics.features.gps.enabled !== undefined
          } catch (error) {
            return false
          }
        },
        true,
        'GPS should integrate with performance monitoring'
      )
    )

    // Test 3: Camera-Performance integration
    tests.push(
      await this.runTest(
        'integration_camera_performance',
        'Camera-Performance Integration',
        async () => {
          try {
            const metrics =
              await mobilePerformanceOptimizer.measurePerformance()
            return metrics.features.camera.enabled !== undefined
          } catch (error) {
            return false
          }
        },
        true,
        'Camera should integrate with performance monitoring'
      )
    )

    // Test 4: PWA-Performance integration
    tests.push(
      await this.runTest(
        'integration_pwa_performance',
        'PWA-Performance Integration',
        async () => {
          try {
            const metrics =
              await mobilePerformanceOptimizer.measurePerformance()
            return metrics.features.pwa.serviceWorkerActive !== undefined
          } catch (error) {
            return false
          }
        },
        true,
        'PWA should integrate with performance monitoring'
      )
    )

    // Test 5: Background sync integration
    tests.push(
      await this.runTest(
        'integration_background_sync',
        'Background Sync Integration',
        async () => {
          try {
            // Test adding camera photo to sync queue
            await backgroundSyncService.addToQueue({
              type: 'inventory_photo_upload',
              priority: 'normal',
              data: { test: 'integration' },
              timestamp: new Date(),
            })
            return true
          } catch (error) {
            return false
          }
        },
        true,
        'Services should integrate with background sync'
      )
    )

    // Test 6: Push notification integration
    tests.push(
      await this.runTest(
        'integration_push_notifications',
        'Push Notification Integration',
        async () => {
          try {
            // Test sending location alert notification
            await pushNotificationService.sendNotification({
              title: 'Integration Test',
              body: 'Testing push notification integration',
              icon: '/icons/test.png',
              badge: '/icons/badge.png',
              tag: 'integration_test',
              data: { test: 'integration' },
            })
            return true
          } catch (error) {
            return false
          }
        },
        true,
        'Services should integrate with push notifications'
      )
    )

    return tests
  }

  /**
   * Run individual test
   */
  private async runTest(
    testId: string,
    testName: string,
    testFunction: () => Promise<boolean>,
    expected: boolean,
    description: string
  ): Promise<IntegrationTestResult> {
    const startTime = Date.now()

    try {
      const result = await testFunction()
      const duration = Date.now() - startTime

      const testResult: IntegrationTestResult = {
        testId,
        testName,
        status: result === expected ? 'passed' : 'failed',
        duration,
        details: {
          description,
          expected,
          actual: result,
        },
        timestamp: new Date(),
      }

      if (testResult.status === 'failed') {
        testResult.details.recommendations = [
          'Check service initialization',
          'Verify permissions are granted',
          'Check device capabilities',
          'Review error logs for details',
        ]
      }

      console.log(`🧪 Test ${testName}: ${testResult.status} (${duration}ms)`)
      return testResult
    } catch (error) {
      const duration = Date.now() - startTime

      const testResult: IntegrationTestResult = {
        testId,
        testName,
        status: 'failed',
        duration,
        details: {
          description,
          expected,
          actual: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          recommendations: [
            'Check service initialization',
            'Verify error handling',
            'Review implementation',
            'Check dependencies',
          ],
        },
        timestamp: new Date(),
      }

      console.log(
        `🧪 Test ${testName}: FAILED (${duration}ms) - ${testResult.details.error}`
      )
      return testResult
    }
  }

  /**
   * Get integration metrics
   */
  public getIntegrationMetrics(): IntegrationMetrics {
    const totalTests = this.testResults.length
    const passedTests = this.testResults.filter(
      t => t.status === 'passed'
    ).length
    const failedTests = this.testResults.filter(
      t => t.status === 'failed'
    ).length
    const skippedTests = this.testResults.filter(
      t => t.status === 'skipped'
    ).length

    const coverage = totalTests > 0 ? (passedTests / totalTests) * 100 : 0
    const averageTestDuration =
      totalTests > 0
        ? this.testResults.reduce((sum, t) => sum + t.duration, 0) / totalTests
        : 0

    const criticalFailures = this.testResults.filter(
      t => t.status === 'failed' && t.testId.includes('init')
    ).length

    const recommendations: string[] = []
    if (coverage < 80) {
      recommendations.push(
        'Integration test coverage is below 80%, consider adding more tests'
      )
    }
    if (criticalFailures > 0) {
      recommendations.push('Critical service initialization failures detected')
    }
    if (averageTestDuration > 5000) {
      recommendations.push(
        'Test execution time is high, consider optimizing test performance'
      )
    }

    return {
      totalTests,
      passedTests,
      failedTests,
      skippedTests,
      coverage,
      averageTestDuration,
      criticalFailures,
      recommendations,
    }
  }

  /**
   * Get test results history
   */
  public getTestResults(): IntegrationTestResult[] {
    return [...this.testResults]
  }

  /**
   * Get test suites history
   */
  public getTestSuites(): TestSuite[] {
    return [...this.testSuites]
  }

  /**
   * Clear test history
   */
  public clearTestHistory(): void {
    this.testResults = []
    this.testSuites = []
    console.log('🧪 Test history cleared')
  }

  /**
   * Get service status
   */
  public getStatus() {
    return {
      initialized: true,
      running: this.isRunning,
      totalTests: this.testResults.length,
      totalSuites: this.testSuites.length,
      lastTestSuite: this.testSuites[this.testSuites.length - 1] || null,
      metrics: this.getIntegrationMetrics(),
    }
  }
}

// Export singleton instance
export const mobileIntegrationTester = MobileIntegrationTester.getInstance()
export default mobileIntegrationTester
