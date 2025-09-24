/**
 * B.8.1 Performance Monitoring System
 * Real-time performance tracking for cross-system integration
 */

export interface PerformanceMetric {
  id: string
  name: string
  category: 'database' | 'network' | 'rendering' | 'memory' | 'user_interaction'
  value: number
  unit: 'ms' | 'bytes' | 'count' | 'percentage'
  timestamp: Date
  context?: Record<string, any>
  threshold?: {
    warning: number
    critical: number
  }
}

export interface PerformanceBenchmark {
  operation: string
  expectedDuration: number // ms
  maxMemoryUsage: number // bytes
  criticalThreshold: number // ms
}

export interface SystemHealthReport {
  overall_status: 'healthy' | 'warning' | 'critical'
  metrics_summary: {
    database_performance: PerformanceMetric[]
    network_latency: PerformanceMetric[]
    memory_usage: PerformanceMetric[]
    user_experience: PerformanceMetric[]
  }
  bottlenecks: string[]
  recommendations: string[]
  generated_at: Date
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map()
  private benchmarks: Map<string, PerformanceBenchmark> = new Map()
  private observers: PerformanceObserver[] = []
  private alertCallbacks: ((metric: PerformanceMetric) => void)[] = []

  constructor() {
    this.setupBenchmarks()
    this.initializeObservers()
  }

  /**
   * Setup performance benchmarks for B.8.1 testing
   */
  private setupBenchmarks(): void {
    const benchmarks: Record<string, PerformanceBenchmark> = {
      'indexeddb_write': {
        operation: 'IndexedDB Write Operation',
        expectedDuration: 50,
        maxMemoryUsage: 5 * 1024 * 1024, // 5MB
        criticalThreshold: 200
      },
      'sync_operation': {
        operation: 'Data Synchronization',
        expectedDuration: 2000,
        maxMemoryUsage: 10 * 1024 * 1024, // 10MB
        criticalThreshold: 5000
      },
      'export_generation': {
        operation: 'Report Export Generation',
        expectedDuration: 3000,
        maxMemoryUsage: 15 * 1024 * 1024, // 15MB
        criticalThreshold: 8000
      },
      'realtime_message': {
        operation: 'Real-time Message Processing',
        expectedDuration: 100,
        maxMemoryUsage: 1 * 1024 * 1024, // 1MB
        criticalThreshold: 500
      },
      'alert_processing': {
        operation: 'Alert System Processing',
        expectedDuration: 200,
        maxMemoryUsage: 2 * 1024 * 1024, // 2MB
        criticalThreshold: 1000
      }
    }

    Object.entries(benchmarks).forEach(([key, benchmark]) => {
      this.benchmarks.set(key, benchmark)
    })
  }

  /**
   * Initialize performance observers
   */
  private initializeObservers(): void {
    if (typeof PerformanceObserver !== 'undefined') {
      // Observe navigation timing
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.recordNavigationMetrics(entry as PerformanceNavigationTiming)
          }
        }
      })
      navObserver.observe({ entryTypes: ['navigation'] })
      this.observers.push(navObserver)

      // Observe resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            this.recordResourceMetrics(entry as PerformanceResourceTiming)
          }
        }
      })
      resourceObserver.observe({ entryTypes: ['resource'] })
      this.observers.push(resourceObserver)

      // Observe long tasks
      if ('longtask' in PerformanceObserver.supportedEntryTypes) {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordLongTask(entry as PerformanceEntry)
          }
        })
        longTaskObserver.observe({ entryTypes: ['longtask'] })
        this.observers.push(longTaskObserver)
      }
    }
  }

  /**
   * Start monitoring a specific operation
   */
  public startOperation(operationId: string, operationName: string): PerformanceTimer {
    return new PerformanceTimer(operationId, operationName, this)
  }

  /**
   * Record a performance metric
   */
  public recordMetric(metric: Omit<PerformanceMetric, 'id' | 'timestamp'>): void {
    const fullMetric: PerformanceMetric = {
      id: this.generateMetricId(),
      timestamp: new Date(),
      ...metric
    }

    const categoryMetrics = this.metrics.get(metric.category) || []
    categoryMetrics.push(fullMetric)
    this.metrics.set(metric.category, categoryMetrics)

    // Check thresholds and trigger alerts
    this.checkThresholds(fullMetric)

    // Keep only last 1000 metrics per category
    if (categoryMetrics.length > 1000) {
      categoryMetrics.splice(0, categoryMetrics.length - 1000)
    }
  }

  /**
   * Check performance thresholds
   */
  private checkThresholds(metric: PerformanceMetric): void {
    if (!metric.threshold) return

    if (metric.value >= metric.threshold.critical) {
      console.error(`🚨 Critical performance threshold exceeded: ${metric.name}`)
      this.alertCallbacks.forEach(callback => callback(metric))
    } else if (metric.value >= metric.threshold.warning) {
      console.warn(`⚠️ Performance warning threshold exceeded: ${metric.name}`)
    }
  }

  /**
   * Get current memory usage
   */
  public getMemoryUsage(): PerformanceMetric | null {
    if (typeof performance !== 'undefined' && performance.memory) {
      return {
        id: this.generateMetricId(),
        name: 'JavaScript Heap Usage',
        category: 'memory',
        value: performance.memory.usedJSHeapSize,
        unit: 'bytes',
        timestamp: new Date(),
        context: {
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        },
        threshold: {
          warning: 50 * 1024 * 1024, // 50MB
          critical: 100 * 1024 * 1024 // 100MB
        }
      }
    }
    return null
  }

  /**
   * Test system performance
   */
  public async runPerformanceTest(): Promise<SystemHealthReport> {
    const testResults: PerformanceMetric[] = []

    // Test IndexedDB performance
    const dbTest = await this.testIndexedDBPerformance()
    testResults.push(...dbTest)

    // Test network simulation
    const networkTest = await this.testNetworkPerformance()
    testResults.push(...networkTest)

    // Test memory pressure
    const memoryTest = this.testMemoryPressure()
    if (memoryTest) testResults.push(memoryTest)

    // Test rendering performance
    const renderTest = await this.testRenderingPerformance()
    testResults.push(...renderTest)

    return this.generateHealthReport(testResults)
  }

  /**
   * Test IndexedDB performance
   */
  private async testIndexedDBPerformance(): Promise<PerformanceMetric[]> {
    const metrics: PerformanceMetric[] = []

    try {
      // Test write performance
      const writeTimer = this.startOperation('idb_write_test', 'IndexedDB Write Test')

      // Simulate data write
      const testData = Array.from({ length: 100 }, (_, i) => ({
        id: `test_${i}`,
        data: `test_data_${i}`,
        timestamp: Date.now()
      }))

      await new Promise(resolve => setTimeout(resolve, 10)) // Simulate async operation
      const writeMetric = writeTimer.stop()
      metrics.push(writeMetric)

      // Test read performance
      const readTimer = this.startOperation('idb_read_test', 'IndexedDB Read Test')
      await new Promise(resolve => setTimeout(resolve, 5)) // Simulate read
      const readMetric = readTimer.stop()
      metrics.push(readMetric)

    } catch (error) {
      metrics.push({
        id: this.generateMetricId(),
        name: 'IndexedDB Error',
        category: 'database',
        value: 1,
        unit: 'count',
        timestamp: new Date(),
        context: { error: error.message }
      })
    }

    return metrics
  }

  /**
   * Test network performance simulation
   */
  private async testNetworkPerformance(): Promise<PerformanceMetric[]> {
    const metrics: PerformanceMetric[] = []

    // Simulate API call latency
    const networkTimer = this.startOperation('network_test', 'Network Latency Test')

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50))
      const latencyMetric = networkTimer.stop()

      latencyMetric.threshold = {
        warning: 500,
        critical: 1000
      }

      metrics.push(latencyMetric)

    } catch (error) {
      metrics.push({
        id: this.generateMetricId(),
        name: 'Network Error',
        category: 'network',
        value: 1,
        unit: 'count',
        timestamp: new Date(),
        context: { error: error.message }
      })
    }

    return metrics
  }

  /**
   * Test memory pressure
   */
  private testMemoryPressure(): PerformanceMetric | null {
    return this.getMemoryUsage()
  }

  /**
   * Test rendering performance
   */
  private async testRenderingPerformance(): Promise<PerformanceMetric[]> {
    const metrics: PerformanceMetric[] = []

    // Test DOM manipulation performance
    const renderTimer = this.startOperation('render_test', 'DOM Rendering Test')

    try {
      // Create test elements
      const testContainer = document.createElement('div')
      testContainer.style.display = 'none'

      for (let i = 0; i < 100; i++) {
        const element = document.createElement('div')
        element.textContent = `Test element ${i}`
        testContainer.appendChild(element)
      }

      document.body.appendChild(testContainer)

      // Force layout
      testContainer.offsetHeight

      // Cleanup
      document.body.removeChild(testContainer)

      const renderMetric = renderTimer.stop()
      renderMetric.threshold = {
        warning: 100,
        critical: 300
      }

      metrics.push(renderMetric)

    } catch (error) {
      metrics.push({
        id: this.generateMetricId(),
        name: 'Rendering Error',
        category: 'rendering',
        value: 1,
        unit: 'count',
        timestamp: new Date(),
        context: { error: error.message }
      })
    }

    return metrics
  }

  /**
   * Generate system health report
   */
  private generateHealthReport(testMetrics: PerformanceMetric[]): SystemHealthReport {
    const allMetrics = new Map(this.metrics)

    // Add test metrics
    testMetrics.forEach(metric => {
      const categoryMetrics = allMetrics.get(metric.category) || []
      categoryMetrics.push(metric)
      allMetrics.set(metric.category, categoryMetrics)
    })

    const bottlenecks: string[] = []
    const recommendations: string[] = []
    let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy'

    // Analyze metrics
    allMetrics.forEach((metrics, category) => {
      const recentMetrics = metrics.slice(-10) // Last 10 metrics
      const avgValue = recentMetrics.reduce((sum, m) => sum + m.value, 0) / recentMetrics.length

      recentMetrics.forEach(metric => {
        if (metric.threshold) {
          if (metric.value >= metric.threshold.critical) {
            overallStatus = 'critical'
            bottlenecks.push(`Critical: ${metric.name} (${metric.value}${metric.unit})`)
            recommendations.push(`Optimize ${metric.name} - current value exceeds critical threshold`)
          } else if (metric.value >= metric.threshold.warning && overallStatus !== 'critical') {
            overallStatus = 'warning'
            bottlenecks.push(`Warning: ${metric.name} (${metric.value}${metric.unit})`)
            recommendations.push(`Monitor ${metric.name} - approaching critical threshold`)
          }
        }
      })
    })

    if (bottlenecks.length === 0) {
      recommendations.push('System performance is optimal')
    }

    return {
      overall_status: overallStatus,
      metrics_summary: {
        database_performance: allMetrics.get('database') || [],
        network_latency: allMetrics.get('network') || [],
        memory_usage: allMetrics.get('memory') || [],
        user_experience: allMetrics.get('user_interaction') || []
      },
      bottlenecks,
      recommendations,
      generated_at: new Date()
    }
  }

  /**
   * Record navigation metrics
   */
  private recordNavigationMetrics(entry: PerformanceNavigationTiming): void {
    this.recordMetric({
      name: 'Page Load Time',
      category: 'rendering',
      value: entry.loadEventEnd - entry.navigationStart,
      unit: 'ms',
      context: {
        domContentLoaded: entry.domContentLoadedEventEnd - entry.navigationStart,
        firstPaint: entry.loadEventStart - entry.navigationStart
      },
      threshold: {
        warning: 3000,
        critical: 5000
      }
    })
  }

  /**
   * Record resource metrics
   */
  private recordResourceMetrics(entry: PerformanceResourceTiming): void {
    if (entry.name.includes('.js') || entry.name.includes('.css')) {
      this.recordMetric({
        name: `Resource Load: ${entry.name.split('/').pop()}`,
        category: 'network',
        value: entry.responseEnd - entry.startTime,
        unit: 'ms',
        context: {
          size: entry.transferSize || 0,
          cached: entry.transferSize === 0
        },
        threshold: {
          warning: 1000,
          critical: 3000
        }
      })
    }
  }

  /**
   * Record long task
   */
  private recordLongTask(entry: PerformanceEntry): void {
    this.recordMetric({
      name: 'Long Task',
      category: 'rendering',
      value: entry.duration,
      unit: 'ms',
      context: {
        startTime: entry.startTime,
        name: entry.name
      },
      threshold: {
        warning: 50,
        critical: 100
      }
    })
  }

  /**
   * Get metrics by category
   */
  public getMetrics(category?: string): PerformanceMetric[] {
    if (category) {
      return this.metrics.get(category) || []
    }

    const allMetrics: PerformanceMetric[] = []
    this.metrics.forEach(metrics => allMetrics.push(...metrics))
    return allMetrics.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  /**
   * Subscribe to performance alerts
   */
  public onAlert(callback: (metric: PerformanceMetric) => void): void {
    this.alertCallbacks.push(callback)
  }

  /**
   * Generate metric ID
   */
  private generateMetricId(): string {
    return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Cleanup observers
   */
  public destroy(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.metrics.clear()
    this.alertCallbacks = []
  }
}

/**
 * Performance Timer utility class
 */
class PerformanceTimer {
  private startTime: number
  private startMemory?: number

  constructor(
    private operationId: string,
    private operationName: string,
    private monitor: PerformanceMonitor
  ) {
    this.startTime = performance.now()

    if (typeof performance !== 'undefined' && performance.memory) {
      this.startMemory = performance.memory.usedJSHeapSize
    }
  }

  /**
   * Stop timer and record metric
   */
  public stop(): PerformanceMetric {
    const duration = performance.now() - this.startTime

    const metric: PerformanceMetric = {
      id: this.operationId,
      name: this.operationName,
      category: this.getCategoryFromOperation(this.operationName),
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      context: {}
    }

    // Add memory delta if available
    if (this.startMemory && performance.memory) {
      metric.context!.memoryDelta = performance.memory.usedJSHeapSize - this.startMemory
    }

    this.monitor.recordMetric(metric)
    return metric
  }

  private getCategoryFromOperation(operationName: string): PerformanceMetric['category'] {
    if (operationName.toLowerCase().includes('indexeddb') || operationName.toLowerCase().includes('database')) {
      return 'database'
    }
    if (operationName.toLowerCase().includes('network') || operationName.toLowerCase().includes('sync')) {
      return 'network'
    }
    if (operationName.toLowerCase().includes('render') || operationName.toLowerCase().includes('dom')) {
      return 'rendering'
    }
    if (operationName.toLowerCase().includes('memory')) {
      return 'memory'
    }
    return 'user_interaction'
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor()
export default PerformanceMonitor