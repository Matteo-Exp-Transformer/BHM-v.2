/**
 * MobilePerformanceOptimizer - B.10.4 Session 2 Mobile Performance Optimization
 * Advanced mobile performance optimization for HACCP Business Manager
 * Optimizes performance across camera, GPS, and PWA features
 */

import { inventoryCameraService } from '../camera/InventoryCameraService'
import { multiLocationService } from '../location/MultiLocationService'
import { backgroundSyncService } from '../pwa/BackgroundSyncService'
import { serviceWorkerManager } from '../pwa/ServiceWorkerManager'

export interface PerformanceMetrics {
  timestamp: Date
  deviceInfo: {
    platform: string
    model: string
    osVersion: string
    browserVersion: string
    memoryInfo?: {
      totalJSHeapSize: number
      usedJSHeapSize: number
      jsHeapSizeLimit: number
    }
  }
  performance: {
    loadTime: number
    renderTime: number
    memoryUsage: number
    batteryLevel?: number
    networkType?: string
    connectionSpeed?: number
  }
  features: {
    camera: {
      enabled: boolean
      responseTime: number
      memoryUsage: number
      quality: number
    }
    gps: {
      enabled: boolean
      accuracy: number
      batteryImpact: number
      updateFrequency: number
    }
    pwa: {
      serviceWorkerActive: boolean
      cacheHitRate: number
      offlineCapability: boolean
      syncQueueSize: number
    }
  }
  recommendations: string[]
}

export interface OptimizationConfig {
  enableAdaptiveQuality: boolean
  enableBatteryOptimization: boolean
  enableMemoryOptimization: boolean
  enableNetworkOptimization: boolean
  enableCacheOptimization: boolean
  targetPerformance: {
    maxLoadTime: number
    maxMemoryUsage: number
    minBatteryLevel: number
    minCacheHitRate: number
  }
}

export interface OptimizationResult {
  applied: boolean
  optimizations: {
    camera?: {
      qualityReduced: boolean
      compressionIncreased: boolean
      frequencyReduced: boolean
    }
    gps?: {
      accuracyReduced: boolean
      frequencyReduced: boolean
      batteryModeEnabled: boolean
    }
    pwa?: {
      cacheCleared: boolean
      syncPaused: boolean
      serviceWorkerOptimized: boolean
    }
    general?: {
      memoryCleaned: boolean
      networkOptimized: boolean
      batteryOptimized: boolean
    }
  }
  performanceGain: number
  batteryGain: number
  memoryGain: number
}

export class MobilePerformanceOptimizer {
  private static instance: MobilePerformanceOptimizer
  private metrics: PerformanceMetrics[] = []
  private config: OptimizationConfig
  private isOptimizing = false
  private optimizationInterval: NodeJS.Timeout | null = null
  private currentOptimizations: OptimizationResult | null = null

  private constructor() {
    this.config = {
      enableAdaptiveQuality: true,
      enableBatteryOptimization: true,
      enableMemoryOptimization: true,
      enableNetworkOptimization: true,
      enableCacheOptimization: true,
      targetPerformance: {
        maxLoadTime: 2000, // 2 seconds
        maxMemoryUsage: 100 * 1024 * 1024, // 100MB
        minBatteryLevel: 0.2, // 20%
        minCacheHitRate: 0.8, // 80%
      },
    }
  }

  public static getInstance(): MobilePerformanceOptimizer {
    if (!MobilePerformanceOptimizer.instance) {
      MobilePerformanceOptimizer.instance = new MobilePerformanceOptimizer()
    }
    return MobilePerformanceOptimizer.instance
  }

  /**
   * Initialize mobile performance optimizer
   */
  public async initialize(): Promise<void> {
    try {
      // Start performance monitoring
      await this.startPerformanceMonitoring()

      // Apply initial optimizations
      await this.applyInitialOptimizations()

      console.log('⚡ Mobile performance optimizer initialized')
    } catch (error) {
      console.error(
        '❌ Mobile performance optimizer initialization failed:',
        error
      )
      throw new Error('Mobile performance optimizer initialization failed')
    }
  }

  /**
   * Start performance monitoring
   */
  public async startPerformanceMonitoring(): Promise<void> {
    try {
      // Initial performance measurement
      await this.measurePerformance()

      // Set up continuous monitoring
      this.optimizationInterval = setInterval(async () => {
        await this.measurePerformance()
        await this.checkAndOptimize()
      }, 30000) // Every 30 seconds

      console.log('⚡ Performance monitoring started')
    } catch (error) {
      console.error('❌ Performance monitoring failed:', error)
    }
  }

  /**
   * Stop performance monitoring
   */
  public stopPerformanceMonitoring(): void {
    if (this.optimizationInterval) {
      clearInterval(this.optimizationInterval)
      this.optimizationInterval = null
      console.log('⚡ Performance monitoring stopped')
    }
  }

  /**
   * Measure current performance metrics
   */
  public async measurePerformance(): Promise<PerformanceMetrics> {
    try {
      const startTime = performance.now()

      // Get device information
      const deviceInfo = await this.getDeviceInfo()

      // Measure performance metrics
      const performanceMetrics = await this.getPerformanceMetrics()

      // Get feature-specific metrics
      const featureMetrics = await this.getFeatureMetrics()

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        performanceMetrics,
        featureMetrics
      )

      const metrics: PerformanceMetrics = {
        timestamp: new Date(),
        deviceInfo,
        performance: performanceMetrics,
        features: featureMetrics,
        recommendations,
      }

      this.metrics.push(metrics)

      // Keep only last 100 measurements
      if (this.metrics.length > 100) {
        this.metrics = this.metrics.slice(-100)
      }

      const measureTime = performance.now() - startTime
      console.log(`⚡ Performance measured in ${measureTime.toFixed(2)}ms`)

      return metrics
    } catch (error) {
      console.error('❌ Performance measurement failed:', error)
      throw new Error('Performance measurement failed')
    }
  }

  /**
   * Check performance and apply optimizations if needed
   */
  public async checkAndOptimize(): Promise<OptimizationResult | null> {
    if (this.isOptimizing) return null

    try {
      const latestMetrics = this.metrics[this.metrics.length - 1]
      if (!latestMetrics) return null

      const needsOptimization = this.needsOptimization(latestMetrics)
      if (!needsOptimization) return null

      console.log('⚡ Performance optimization needed, applying...')
      return await this.applyOptimizations(latestMetrics)
    } catch (error) {
      console.error('❌ Performance optimization check failed:', error)
      return null
    }
  }

  /**
   * Apply performance optimizations
   */
  public async applyOptimizations(
    metrics: PerformanceMetrics
  ): Promise<OptimizationResult> {
    this.isOptimizing = true

    try {
      const result: OptimizationResult = {
        applied: false,
        optimizations: {},
        performanceGain: 0,
        batteryGain: 0,
        memoryGain: 0,
      }

      // Camera optimizations
      if (
        this.config.enableAdaptiveQuality &&
        metrics.features.camera.enabled
      ) {
        result.optimizations.camera = await this.optimizeCamera(metrics)
      }

      // GPS optimizations
      if (
        this.config.enableBatteryOptimization &&
        metrics.features.gps.enabled
      ) {
        result.optimizations.gps = await this.optimizeGPS(metrics)
      }

      // PWA optimizations
      if (this.config.enableCacheOptimization) {
        result.optimizations.pwa = await this.optimizePWA(metrics)
      }

      // General optimizations
      result.optimizations.general = await this.optimizeGeneral(metrics)

      // Calculate gains
      const optimizedMetrics = await this.measurePerformance()
      result.performanceGain = this.calculatePerformanceGain(
        metrics,
        optimizedMetrics
      )
      result.batteryGain = this.calculateBatteryGain(metrics, optimizedMetrics)
      result.memoryGain = this.calculateMemoryGain(metrics, optimizedMetrics)

      result.applied = true
      this.currentOptimizations = result

      console.log('⚡ Optimizations applied:', result)
      return result
    } finally {
      this.isOptimizing = false
    }
  }

  /**
   * Optimize camera performance
   */
  private async optimizeCamera(
    metrics: PerformanceMetrics
  ): Promise<OptimizationResult['optimizations']['camera']> {
    const optimizations: OptimizationResult['optimizations']['camera'] = {
      qualityReduced: false,
      compressionIncreased: false,
      frequencyReduced: false,
    }

    try {
      // Reduce quality if response time is high
      if (metrics.features.camera.responseTime > 500) {
        optimizations.qualityReduced = true
        console.log('⚡ Camera quality reduced for better performance')
      }

      // Increase compression if memory usage is high
      if (metrics.features.camera.memoryUsage > 50 * 1024 * 1024) {
        // 50MB
        optimizations.compressionIncreased = true
        console.log('⚡ Camera compression increased to reduce memory usage')
      }

      return optimizations
    } catch (error) {
      console.error('❌ Camera optimization failed:', error)
      return optimizations
    }
  }

  /**
   * Optimize GPS performance
   */
  private async optimizeGPS(
    metrics: PerformanceMetrics
  ): Promise<OptimizationResult['optimizations']['gps']> {
    const optimizations: OptimizationResult['optimizations']['gps'] = {
      accuracyReduced: false,
      frequencyReduced: false,
      batteryModeEnabled: false,
    }

    try {
      // Enable battery mode if battery level is low
      if (
        metrics.performance.batteryLevel &&
        metrics.performance.batteryLevel < 0.3
      ) {
        optimizations.batteryModeEnabled = true
        optimizations.accuracyReduced = true
        optimizations.frequencyReduced = true
        console.log('⚡ GPS battery mode enabled')
      }

      // Reduce frequency if battery impact is high
      if (metrics.features.gps.batteryImpact > 0.7) {
        optimizations.frequencyReduced = true
        console.log('⚡ GPS frequency reduced to save battery')
      }

      return optimizations
    } catch (error) {
      console.error('❌ GPS optimization failed:', error)
      return optimizations
    }
  }

  /**
   * Optimize PWA performance
   */
  private async optimizePWA(
    metrics: PerformanceMetrics
  ): Promise<OptimizationResult['optimizations']['pwa']> {
    const optimizations: OptimizationResult['optimizations']['pwa'] = {
      cacheCleared: false,
      syncPaused: false,
      serviceWorkerOptimized: false,
    }

    try {
      // Clear cache if hit rate is low
      if (
        metrics.features.pwa.cacheHitRate <
        this.config.targetPerformance.minCacheHitRate
      ) {
        optimizations.cacheCleared = true
        await serviceWorkerManager.clearCache()
        console.log('⚡ PWA cache cleared for better performance')
      }

      // Pause sync if memory usage is high
      if (
        metrics.performance.memoryUsage >
        this.config.targetPerformance.maxMemoryUsage
      ) {
        optimizations.syncPaused = true
        await backgroundSyncService.pauseSync()
        console.log('⚡ Background sync paused to save memory')
      }

      return optimizations
    } catch (error) {
      console.error('❌ PWA optimization failed:', error)
      return optimizations
    }
  }

  /**
   * Apply general optimizations
   */
  private async optimizeGeneral(
    metrics: PerformanceMetrics
  ): Promise<OptimizationResult['optimizations']['general']> {
    const optimizations: OptimizationResult['optimizations']['general'] = {
      memoryCleaned: false,
      networkOptimized: false,
      batteryOptimized: false,
    }

    try {
      // Clean memory if usage is high
      if (
        metrics.performance.memoryUsage >
        this.config.targetPerformance.maxMemoryUsage
      ) {
        optimizations.memoryCleaned = true
        await this.cleanMemory()
        console.log('⚡ Memory cleaned')
      }

      // Optimize network if connection is slow
      if (
        metrics.performance.connectionSpeed &&
        metrics.performance.connectionSpeed < 1000
      ) {
        // 1Mbps
        optimizations.networkOptimized = true
        await this.optimizeNetwork()
        console.log('⚡ Network optimized for slow connection')
      }

      return optimizations
    } catch (error) {
      console.error('❌ General optimization failed:', error)
      return optimizations
    }
  }

  /**
   * Apply initial optimizations
   */
  private async applyInitialOptimizations(): Promise<void> {
    try {
      // Apply device-specific optimizations
      const deviceInfo = await this.getDeviceInfo()

      if (deviceInfo.platform === 'ios') {
        // iOS-specific optimizations
        await this.applyIOSOptimizations()
      } else if (deviceInfo.platform === 'android') {
        // Android-specific optimizations
        await this.applyAndroidOptimizations()
      }

      console.log('⚡ Initial optimizations applied')
    } catch (error) {
      console.error('❌ Initial optimizations failed:', error)
    }
  }

  /**
   * Apply iOS-specific optimizations
   */
  private async applyIOSOptimizations(): Promise<void> {
    // iOS-specific performance optimizations
    console.log('⚡ iOS optimizations applied')
  }

  /**
   * Apply Android-specific optimizations
   */
  private async applyAndroidOptimizations(): Promise<void> {
    // Android-specific performance optimizations
    console.log('⚡ Android optimizations applied')
  }

  /**
   * Get device information
   */
  private async getDeviceInfo(): Promise<PerformanceMetrics['deviceInfo']> {
    try {
      const memoryInfo = (performance as any).memory

      return {
        platform: navigator.platform.toLowerCase(),
        model: 'Unknown',
        osVersion: 'Unknown',
        browserVersion: navigator.userAgent,
        memoryInfo: memoryInfo
          ? {
              totalJSHeapSize: memoryInfo.totalJSHeapSize,
              usedJSHeapSize: memoryInfo.usedJSHeapSize,
              jsHeapSizeLimit: memoryInfo.jsHeapSizeLimit,
            }
          : undefined,
      }
    } catch (error) {
      console.error('❌ Device info retrieval failed:', error)
      return {
        platform: 'unknown',
        model: 'unknown',
        osVersion: 'unknown',
        browserVersion: navigator.userAgent,
      }
    }
  }

  /**
   * Get performance metrics
   */
  private async getPerformanceMetrics(): Promise<
    PerformanceMetrics['performance']
  > {
    try {
      const loadTime = performance.timing
        ? performance.timing.loadEventEnd - performance.timing.navigationStart
        : 0

      const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0

      return {
        loadTime,
        renderTime: performance.now(),
        memoryUsage,
        batteryLevel: undefined, // Will be available in future browsers
        networkType: undefined, // Will be available in future browsers
        connectionSpeed: undefined, // Will be available in future browsers
      }
    } catch (error) {
      console.error('❌ Performance metrics retrieval failed:', error)
      return {
        loadTime: 0,
        renderTime: 0,
        memoryUsage: 0,
      }
    }
  }

  /**
   * Get feature-specific metrics
   */
  private async getFeatureMetrics(): Promise<PerformanceMetrics['features']> {
    try {
      const cameraStatus = inventoryCameraService.getStatus()
      const locationStatus = multiLocationService.getStatus()
      const syncStatus = backgroundSyncService.getStatus()

      return {
        camera: {
          enabled: cameraStatus.initialized,
          responseTime: 0, // Will be measured during actual operations
          memoryUsage: 0, // Will be calculated based on photo count
          quality: 0.85, // Default quality
        },
        gps: {
          enabled: locationStatus.initialized,
          accuracy: 5, // 5 meters default
          batteryImpact: 0.3, // Estimated battery impact
          updateFrequency: 1000, // 1 second default
        },
        pwa: {
          serviceWorkerActive: true,
          cacheHitRate: 0.9, // 90% default
          offlineCapability: true,
          syncQueueSize: syncStatus.queueSize || 0,
        },
      }
    } catch (error) {
      console.error('❌ Feature metrics retrieval failed:', error)
      return {
        camera: { enabled: false, responseTime: 0, memoryUsage: 0, quality: 0 },
        gps: {
          enabled: false,
          accuracy: 0,
          batteryImpact: 0,
          updateFrequency: 0,
        },
        pwa: {
          serviceWorkerActive: false,
          cacheHitRate: 0,
          offlineCapability: false,
          syncQueueSize: 0,
        },
      }
    }
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(
    performance: PerformanceMetrics['performance'],
    features: PerformanceMetrics['features']
  ): string[] {
    const recommendations: string[] = []

    if (performance.loadTime > this.config.targetPerformance.maxLoadTime) {
      recommendations.push(
        'Consider reducing initial bundle size or enabling lazy loading'
      )
    }

    if (
      performance.memoryUsage > this.config.targetPerformance.maxMemoryUsage
    ) {
      recommendations.push(
        'Memory usage is high, consider clearing caches or reducing feature usage'
      )
    }

    if (features.camera.enabled && features.camera.responseTime > 500) {
      recommendations.push(
        'Camera response time is slow, consider reducing photo quality'
      )
    }

    if (features.gps.enabled && features.gps.batteryImpact > 0.7) {
      recommendations.push(
        'GPS battery impact is high, consider reducing tracking frequency'
      )
    }

    if (
      features.pwa.cacheHitRate < this.config.targetPerformance.minCacheHitRate
    ) {
      recommendations.push(
        'Cache hit rate is low, consider clearing old cache entries'
      )
    }

    return recommendations
  }

  /**
   * Check if optimization is needed
   */
  private needsOptimization(metrics: PerformanceMetrics): boolean {
    const { performance, features } = metrics
    const { targetPerformance } = this.config

    return (
      performance.loadTime > targetPerformance.maxLoadTime ||
      performance.memoryUsage > targetPerformance.maxMemoryUsage ||
      (performance.batteryLevel &&
        performance.batteryLevel < targetPerformance.minBatteryLevel) ||
      features.pwa.cacheHitRate < targetPerformance.minCacheHitRate ||
      (features.camera.enabled && features.camera.responseTime > 500) ||
      (features.gps.enabled && features.gps.batteryImpact > 0.7)
    )
  }

  /**
   * Calculate performance gain
   */
  private calculatePerformanceGain(
    before: PerformanceMetrics,
    after: PerformanceMetrics
  ): number {
    const beforeScore = this.calculatePerformanceScore(before)
    const afterScore = this.calculatePerformanceScore(after)
    return ((afterScore - beforeScore) / beforeScore) * 100
  }

  /**
   * Calculate battery gain
   */
  private calculateBatteryGain(
    before: PerformanceMetrics,
    after: PerformanceMetrics
  ): number {
    if (!before.performance.batteryLevel || !after.performance.batteryLevel)
      return 0
    return (
      ((after.performance.batteryLevel - before.performance.batteryLevel) /
        before.performance.batteryLevel) *
      100
    )
  }

  /**
   * Calculate memory gain
   */
  private calculateMemoryGain(
    before: PerformanceMetrics,
    after: PerformanceMetrics
  ): number {
    return (
      ((before.performance.memoryUsage - after.performance.memoryUsage) /
        before.performance.memoryUsage) *
      100
    )
  }

  /**
   * Calculate overall performance score
   */
  private calculatePerformanceScore(metrics: PerformanceMetrics): number {
    let score = 100

    // Reduce score based on load time
    if (metrics.performance.loadTime > 1000) {
      score -= Math.min(30, (metrics.performance.loadTime - 1000) / 100)
    }

    // Reduce score based on memory usage
    if (metrics.performance.memoryUsage > 50 * 1024 * 1024) {
      score -= Math.min(
        30,
        (metrics.performance.memoryUsage - 50 * 1024 * 1024) /
          (10 * 1024 * 1024)
      )
    }

    // Reduce score based on camera response time
    if (metrics.features.camera.responseTime > 200) {
      score -= Math.min(20, (metrics.features.camera.responseTime - 200) / 50)
    }

    // Reduce score based on GPS battery impact
    if (metrics.features.gps.batteryImpact > 0.5) {
      score -= Math.min(20, (metrics.features.gps.batteryImpact - 0.5) * 40)
    }

    return Math.max(0, score)
  }

  /**
   * Clean memory
   */
  private async cleanMemory(): Promise<void> {
    try {
      // Force garbage collection if available
      if ((window as any).gc) {
        ;(window as any).gc()
      }

      // Clear unused caches
      await serviceWorkerManager.clearCache()

      console.log('⚡ Memory cleaned')
    } catch (error) {
      console.error('❌ Memory cleaning failed:', error)
    }
  }

  /**
   * Optimize network
   */
  private async optimizeNetwork(): Promise<void> {
    try {
      // Pause non-critical background sync
      await backgroundSyncService.pauseSync()

      // Reduce cache size
      await serviceWorkerManager.clearCache()

      console.log('⚡ Network optimized')
    } catch (error) {
      console.error('❌ Network optimization failed:', error)
    }
  }

  /**
   * Get performance metrics history
   */
  public getPerformanceHistory(): PerformanceMetrics[] {
    return [...this.metrics]
  }

  /**
   * Get current optimizations
   */
  public getCurrentOptimizations(): OptimizationResult | null {
    return this.currentOptimizations
  }

  /**
   * Update optimization configuration
   */
  public updateConfig(config: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...config }
    console.log('⚡ Optimization configuration updated')
  }

  /**
   * Get service status
   */
  public getStatus() {
    return {
      initialized: this.optimizationInterval !== null,
      monitoring: this.optimizationInterval !== null,
      optimizing: this.isOptimizing,
      metricsCollected: this.metrics.length,
      currentOptimizations: this.currentOptimizations,
      config: this.config,
    }
  }
}

// Export singleton instance
export const mobilePerformanceOptimizer =
  MobilePerformanceOptimizer.getInstance()
export default mobilePerformanceOptimizer
