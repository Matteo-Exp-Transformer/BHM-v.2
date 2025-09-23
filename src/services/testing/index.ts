/**
 * B.8.1 Cross-System Integration Testing - Main Export
 * Unified interface for all testing services in HACCP Business Manager
 */

export { performanceMonitor, type PerformanceMetric, type SystemHealthReport } from './PerformanceMonitor'
export { browserCompatibilityTester, type BrowserInfo, type CompatibilityTestResult } from './BrowserCompatibility'
export { mobileOptimizer, type MobileDeviceInfo, type MobilePerformanceMetrics } from './MobileOptimizer'
export { integrationTestPipeline, type TestReport, type TestSuite } from './IntegrationTestPipeline'

/**
 * B.8.1 Testing Services Manager
 * Central coordinator for all cross-system integration testing
 */
class TestingServicesManager {
  private initialized = false

  /**
   * Initialize all testing services
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return

    console.log('🧪 Initializing B.8.1 Testing Services...')

    try {
      // Initialize performance monitoring
      performanceMonitor.onAlert((metric) => {
        console.warn(`🚨 Performance Alert: ${metric.name} - ${metric.value}${metric.unit}`)
      })

      // Apply mobile optimizations if on mobile device
      const deviceInfo = mobileOptimizer.detectDevice()
      if (deviceInfo.type !== 'desktop') {
        await mobileOptimizer.applyOptimizations()
        console.log(`📱 Mobile optimizations applied for ${deviceInfo.type}`)
      }

      // Run initial compatibility check
      const compatibilityResult = await browserCompatibilityTester.runCompatibilityTests()
      console.log(`🌐 Browser compatibility: ${compatibilityResult.supportLevel}`)

      if (compatibilityResult.criticalFailures.length > 0) {
        console.error('❌ Critical compatibility issues detected:', compatibilityResult.criticalFailures)
      }

      this.initialized = true
      console.log('✅ B.8.1 Testing Services initialized successfully')

    } catch (error) {
      console.error('❌ Failed to initialize testing services:', error)
      throw error
    }
  }

  /**
   * Run comprehensive system health check
   */
  public async runHealthCheck(): Promise<{
    performance: SystemHealthReport
    compatibility: CompatibilityTestResult
    mobile: MobilePerformanceMetrics
    overall: 'healthy' | 'warning' | 'critical'
  }> {
    console.log('🔍 Running comprehensive system health check...')

    const [performance, compatibility] = await Promise.all([
      performanceMonitor.runPerformanceTest(),
      browserCompatibilityTester.runCompatibilityTests()
    ])

    const mobile = mobileOptimizer.getMobileMetrics()

    // Determine overall health
    let overall: 'healthy' | 'warning' | 'critical' = 'healthy'

    if (performance.overall_status === 'critical' ||
        compatibility.supportLevel === 'unsupported' ||
        compatibility.criticalFailures.length > 0) {
      overall = 'critical'
    } else if (performance.overall_status === 'warning' ||
               compatibility.supportLevel === 'minimal' ||
               compatibility.warnings.length > 0) {
      overall = 'warning'
    }

    return {
      performance,
      compatibility,
      mobile,
      overall
    }
  }

  /**
   * Run full integration test pipeline
   */
  public async runIntegrationTests(): Promise<TestReport> {
    console.log('🚀 Starting B.8.1 Integration Test Pipeline...')

    // Ensure services are initialized
    await this.initialize()

    // Run the complete test pipeline
    const report = await integrationTestPipeline.runPipeline()

    console.log(`✅ Integration tests completed: ${report.summary.passed}/${report.summary.total} passed`)

    return report
  }

  /**
   * Get current system metrics
   */
  public getCurrentMetrics(): {
    performance: PerformanceMetric[]
    mobile: MobilePerformanceMetrics
    browser: BrowserInfo
  } {
    return {
      performance: performanceMonitor.getMetrics(),
      mobile: mobileOptimizer.getMobileMetrics(),
      browser: browserCompatibilityTester.detectBrowser()
    }
  }

  /**
   * Export test results
   */
  public exportResults(format: 'json' | 'html' = 'json'): string {
    const report = integrationTestPipeline.getCurrentReport()
    if (!report) {
      throw new Error('No test results available. Run integration tests first.')
    }

    return integrationTestPipeline.exportReport(format)
  }

  /**
   * Cleanup all testing services
   */
  public cleanup(): void {
    console.log('🧹 Cleaning up testing services...')

    performanceMonitor.destroy()
    mobileOptimizer.cleanup()

    this.initialized = false
    console.log('✅ Testing services cleanup completed')
  }

  /**
   * Monitor system performance in real-time
   */
  public startMonitoring(interval: number = 30000): void {
    setInterval(async () => {
      const metrics = this.getCurrentMetrics()

      // Log key metrics
      console.log('📊 System Metrics:', {
        memory: `${(metrics.mobile.memoryUsage).toFixed(1)}MB`,
        frameRate: `${metrics.mobile.frameRate}fps`,
        touchResponse: `${metrics.mobile.touchResponseTime}ms`
      })

      // Check for performance degradation
      if (metrics.mobile.frameRate < 30) {
        console.warn('⚠️ Low frame rate detected, applying performance optimizations')
        await mobileOptimizer.applyOptimizations()
      }
    }, interval)
  }

  /**
   * Get testing services status
   */
  public getStatus(): {
    initialized: boolean
    performance: boolean
    compatibility: boolean
    mobile: boolean
  } {
    return {
      initialized: this.initialized,
      performance: true, // Performance monitor is always available
      compatibility: 'IntersectionObserver' in window, // Basic compatibility check
      mobile: 'ontouchstart' in window || navigator.maxTouchPoints > 0
    }
  }
}

// Export singleton instance
export const testingServices = new TestingServicesManager()

// Export individual services for direct access
export {
  performanceMonitor,
  browserCompatibilityTester,
  mobileOptimizer,
  integrationTestPipeline
}

// Auto-initialize in development mode
if (import.meta.env?.DEV) {
  testingServices.initialize().catch(console.error)
}

export default testingServices