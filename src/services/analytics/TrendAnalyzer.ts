/**
 * TrendAnalyzer - B.10.2 Advanced Analytics & Reporting
 * Historical data analysis and trend identification for HACCP insights
 */

import { scaleLinear, scaleTime } from 'd3-scale'
import { extent, mean, deviation } from 'd3-array'
import { format, parseISO } from 'd3-time-format'

export interface TrendDataPoint {
  timestamp: Date
  value: number
  category?: string
  metadata?: Record<string, any>
}

export interface TrendAnalysis {
  id: string
  name: string
  type: 'temperature' | 'compliance' | 'performance' | 'inventory' | 'cost'
  direction: 'increasing' | 'decreasing' | 'stable' | 'volatile'
  strength: 'weak' | 'moderate' | 'strong'
  confidence: number
  slope: number
  rSquared: number
  forecast: TrendDataPoint[]
  anomalies: TrendDataPoint[]
  insights: string[]
  recommendations: string[]
}

export interface SeasonalPattern {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  amplitude: number
  phase: number
  confidence: number
}

export interface TrendComparison {
  current: TrendAnalysis
  previous: TrendAnalysis
  benchmark: TrendAnalysis
  performance: 'above' | 'at' | 'below'
  improvement: number
}

/**
 * Trend Analysis Service for HACCP Data
 */
export class TrendAnalyzer {
  private isInitialized = false

  /**
   * Initialize the trend analyzer
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      console.log('📈 Trend analyzer initialized - B.10.2 Advanced Analytics')
      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize trend analyzer:', error)
      throw error
    }
  }

  /**
   * Analyze temperature trends across conservation points
   */
  public async analyzeTemperatureTrends(
    conservationPointId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<TrendAnalysis> {
    try {
      // Get temperature data for the conservation point
      const temperatureData = await this.getTemperatureData(
        conservationPointId,
        timeRange
      )

      if (temperatureData.length < 10) {
        throw new Error('Insufficient data for trend analysis')
      }

      // Perform trend analysis
      const trend = this.calculateTrend(temperatureData, 'temperature')

      // Detect anomalies
      const anomalies = this.detectAnomalies(temperatureData, trend)

      // Generate forecast
      const forecast = this.generateForecast(temperatureData, trend, 24) // 24 hours ahead

      // Generate insights and recommendations
      const insights = this.generateTemperatureInsights(trend, anomalies)
      const recommendations = this.generateTemperatureRecommendations(
        trend,
        anomalies
      )

      return {
        id: `temperature_${conservationPointId}`,
        name: `Temperature Trend - ${conservationPointId}`,
        type: 'temperature',
        direction: trend.direction,
        strength: trend.strength,
        confidence: trend.confidence,
        slope: trend.slope,
        rSquared: trend.rSquared,
        forecast,
        anomalies,
        insights,
        recommendations,
      }
    } catch (error) {
      console.error('Failed to analyze temperature trends:', error)
      throw error
    }
  }

  /**
   * Analyze compliance trend across multiple companies
   */
  public async analyzeComplianceTrend(
    companyId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<TrendAnalysis> {
    try {
      const complianceData = await this.getComplianceData(companyId, timeRange)

      if (complianceData.length < 5) {
        throw new Error('Insufficient compliance data for trend analysis')
      }

      const trend = this.calculateTrend(complianceData, 'compliance')
      const anomalies = this.detectAnomalies(complianceData, trend)
      const forecast = this.generateForecast(complianceData, trend, 30) // 30 days ahead

      const insights = this.generateComplianceInsights(trend, anomalies)
      const recommendations = this.generateComplianceRecommendations(
        trend,
        anomalies
      )

      return {
        id: `compliance_${companyId}`,
        name: `Compliance Trend - ${companyId}`,
        type: 'compliance',
        direction: trend.direction,
        strength: trend.strength,
        confidence: trend.confidence,
        slope: trend.slope,
        rSquared: trend.rSquared,
        forecast,
        anomalies,
        insights,
        recommendations,
      }
    } catch (error) {
      console.error('Failed to analyze compliance trend:', error)
      throw error
    }
  }

  /**
   * Analyze performance trends for staff and operations
   */
  public async analyzePerformanceTrend(
    departmentId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<TrendAnalysis> {
    try {
      const performanceData = await this.getPerformanceData(
        departmentId,
        timeRange
      )

      const trend = this.calculateTrend(performanceData, 'performance')
      const anomalies = this.detectAnomalies(performanceData, trend)
      const forecast = this.generateForecast(performanceData, trend, 14) // 14 days ahead

      const insights = this.generatePerformanceInsights(trend, anomalies)
      const recommendations = this.generatePerformanceRecommendations(
        trend,
        anomalies
      )

      return {
        id: `performance_${departmentId}`,
        name: `Performance Trend - ${departmentId}`,
        type: 'performance',
        direction: trend.direction,
        strength: trend.strength,
        confidence: trend.confidence,
        slope: trend.slope,
        rSquared: trend.rSquared,
        forecast,
        anomalies,
        insights,
        recommendations,
      }
    } catch (error) {
      console.error('Failed to analyze performance trend:', error)
      throw error
    }
  }

  /**
   * Detect seasonal patterns in data
   */
  public detectSeasonalPatterns(
    data: TrendDataPoint[],
    period: 'daily' | 'weekly' | 'monthly'
  ): SeasonalPattern {
    try {
      // Group data by period
      const groupedData = this.groupDataByPeriod(data, period)

      // Calculate seasonal amplitude and phase
      const seasonalAnalysis = this.calculateSeasonalComponents(groupedData)

      return {
        period,
        amplitude: seasonalAnalysis.amplitude,
        phase: seasonalAnalysis.phase,
        confidence: seasonalAnalysis.confidence,
      }
    } catch (error) {
      console.error('Failed to detect seasonal patterns:', error)
      throw error
    }
  }

  /**
   * Compare trends between different time periods or entities
   */
  public async compareTrends(
    currentData: TrendDataPoint[],
    previousData: TrendDataPoint[],
    benchmarkData?: TrendDataPoint[]
  ): Promise<TrendComparison> {
    try {
      const currentTrend = this.calculateTrend(currentData, 'comparison')
      const previousTrend = this.calculateTrend(previousData, 'comparison')

      let benchmarkTrend: TrendAnalysis | undefined
      if (benchmarkData) {
        benchmarkTrend = this.calculateTrend(benchmarkData, 'comparison')
      }

      // Calculate performance relative to benchmark
      const performance = benchmarkTrend
        ? this.calculatePerformance(currentTrend, benchmarkTrend)
        : 'at'

      // Calculate improvement from previous period
      const improvement = this.calculateImprovement(currentTrend, previousTrend)

      return {
        current: currentTrend,
        previous: previousTrend,
        benchmark: benchmarkTrend || currentTrend,
        performance,
        improvement,
      }
    } catch (error) {
      console.error('Failed to compare trends:', error)
      throw error
    }
  }

  /**
   * Get trend summary for dashboard
   */
  public async getTrendSummary(
    entityId: string,
    entityType: 'conservation_point' | 'company' | 'department'
  ): Promise<TrendAnalysis[]> {
    try {
      const timeRange = {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        end: new Date(),
      }

      const trends: TrendAnalysis[] = []

      switch (entityType) {
        case 'conservation_point':
          trends.push(await this.analyzeTemperatureTrends(entityId, timeRange))
          break
        case 'company':
          trends.push(await this.analyzeComplianceTrend(entityId, timeRange))
          break
        case 'department':
          trends.push(await this.analyzePerformanceTrend(entityId, timeRange))
          break
      }

      return trends
    } catch (error) {
      console.error('Failed to get trend summary:', error)
      throw error
    }
  }

  // Private helper methods

  private async getTemperatureData(
    conservationPointId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<TrendDataPoint[]> {
    // Mock implementation - would fetch from database
    const data: TrendDataPoint[] = []
    const startTime = timeRange.start.getTime()
    const endTime = timeRange.end.getTime()
    const interval = (endTime - startTime) / 100 // 100 data points

    for (let i = 0; i < 100; i++) {
      const timestamp = new Date(startTime + i * interval)
      const baseTemp = 4.0
      const variation = Math.sin(i / 10) * 2 + Math.random() * 0.5

      data.push({
        timestamp,
        value: baseTemp + variation,
        category: 'temperature',
        metadata: { conservationPointId },
      })
    }

    return data
  }

  private async getComplianceData(
    companyId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<TrendDataPoint[]> {
    // Mock implementation - would fetch from database
    const data: TrendDataPoint[] = []
    const startTime = timeRange.start.getTime()
    const endTime = timeRange.end.getTime()
    const interval = (endTime - startTime) / 30 // 30 data points

    for (let i = 0; i < 30; i++) {
      const timestamp = new Date(startTime + i * interval)
      const baseScore = 85
      const improvement = i * 0.5 // Gradual improvement
      const variation = Math.random() * 5

      data.push({
        timestamp,
        value: Math.min(100, baseScore + improvement + variation),
        category: 'compliance',
        metadata: { companyId },
      })
    }

    return data
  }

  private async getPerformanceData(
    departmentId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<TrendDataPoint[]> {
    // Mock implementation - would fetch from database
    const data: TrendDataPoint[] = []
    const startTime = timeRange.start.getTime()
    const endTime = timeRange.end.getTime()
    const interval = (endTime - startTime) / 14 // 14 data points

    for (let i = 0; i < 14; i++) {
      const timestamp = new Date(startTime + i * interval)
      const basePerformance = 75
      const trend = Math.sin(i / 7) * 10 // Weekly pattern
      const variation = Math.random() * 8

      data.push({
        timestamp,
        value: Math.max(0, Math.min(100, basePerformance + trend + variation)),
        category: 'performance',
        metadata: { departmentId },
      })
    }

    return data
  }

  private calculateTrend(data: TrendDataPoint[], type: string): TrendAnalysis {
    if (data.length < 2) {
      throw new Error('Insufficient data for trend calculation')
    }

    // Calculate linear regression
    const n = data.length
    const xValues = data.map((_, index) => index)
    const yValues = data.map(d => d.value)

    const sumX = xValues.reduce((a, b) => a + b, 0)
    const sumY = yValues.reduce((a, b) => a + b, 0)
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0)
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0)
    const sumYY = yValues.reduce((sum, y) => sum + y * y, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    // Calculate R-squared
    const yMean = sumY / n
    const ssRes = yValues.reduce((sum, y, i) => {
      const predicted = slope * xValues[i] + intercept
      return sum + Math.pow(y - predicted, 2)
    }, 0)
    const ssTot = yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0)
    const rSquared = 1 - ssRes / ssTot

    // Determine trend direction and strength
    const direction =
      slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable'
    const strength =
      Math.abs(slope) > 0.5
        ? 'strong'
        : Math.abs(slope) > 0.2
          ? 'moderate'
          : 'weak'

    // Calculate confidence based on R-squared and data quality
    const confidence = Math.min(0.95, Math.max(0.5, rSquared * 0.9 + 0.1))

    return {
      id: `trend_${type}_${Date.now()}`,
      name: `${type} Trend`,
      type: type as any,
      direction,
      strength,
      confidence,
      slope,
      rSquared,
      forecast: [],
      anomalies: [],
      insights: [],
      recommendations: [],
    }
  }

  private detectAnomalies(
    data: TrendDataPoint[],
    trend: TrendAnalysis
  ): TrendDataPoint[] {
    const anomalies: TrendDataPoint[] = []
    const values = data.map(d => d.value)
    const dataMean = mean(values) || 0
    const dataStd = deviation(values) || 1

    // Detect outliers using 2-sigma rule
    const threshold = 2 * dataStd

    data.forEach(point => {
      const deviation = Math.abs(point.value - dataMean)
      if (deviation > threshold) {
        anomalies.push(point)
      }
    })

    return anomalies
  }

  private generateForecast(
    data: TrendDataPoint[],
    trend: TrendAnalysis,
    periods: number
  ): TrendDataPoint[] {
    const forecast: TrendDataPoint[] = []
    const lastPoint = data[data.length - 1]
    const timeInterval =
      data.length > 1
        ? data[1].timestamp.getTime() - data[0].timestamp.getTime()
        : 24 * 60 * 60 * 1000 // Default to 24 hours

    for (let i = 1; i <= periods; i++) {
      const futureTime = new Date(
        lastPoint.timestamp.getTime() + i * timeInterval
      )
      const predictedValue = lastPoint.value + trend.slope * i

      forecast.push({
        timestamp: futureTime,
        value: predictedValue,
        category: lastPoint.category,
        metadata: { ...lastPoint.metadata, forecast: true },
      })
    }

    return forecast
  }

  private groupDataByPeriod(
    data: TrendDataPoint[],
    period: 'daily' | 'weekly' | 'monthly'
  ): Map<string, TrendDataPoint[]> {
    const grouped = new Map<string, TrendDataPoint[]>()

    data.forEach(point => {
      let key: string

      switch (period) {
        case 'daily':
          key = point.timestamp.toISOString().split('T')[0]
          break
        case 'weekly':
          const weekStart = new Date(point.timestamp)
          weekStart.setDate(weekStart.getDate() - weekStart.getDay())
          key = weekStart.toISOString().split('T')[0]
          break
        case 'monthly':
          key = `${point.timestamp.getFullYear()}-${String(point.timestamp.getMonth() + 1).padStart(2, '0')}`
          break
      }

      if (!grouped.has(key)) {
        grouped.set(key, [])
      }
      grouped.get(key)!.push(point)
    })

    return grouped
  }

  private calculateSeasonalComponents(
    groupedData: Map<string, TrendDataPoint[]>
  ): { amplitude: number; phase: number; confidence: number } {
    const averages = Array.from(groupedData.values()).map(
      points => mean(points.map(p => p.value)) || 0
    )

    const overallMean = mean(averages) || 0
    const maxDeviation = Math.max(
      ...averages.map(a => Math.abs(a - overallMean))
    )

    return {
      amplitude: maxDeviation,
      phase: 0, // Simplified - would calculate actual phase
      confidence: Math.min(0.9, averages.length / 12), // Based on number of periods
    }
  }

  private calculatePerformance(
    current: TrendAnalysis,
    benchmark: TrendAnalysis
  ): 'above' | 'at' | 'below' {
    const difference = current.slope - benchmark.slope
    return difference > 0.1 ? 'above' : difference < -0.1 ? 'below' : 'at'
  }

  private calculateImprovement(
    current: TrendAnalysis,
    previous: TrendAnalysis
  ): number {
    return ((current.slope - previous.slope) / Math.abs(previous.slope)) * 100
  }

  private generateTemperatureInsights(
    trend: TrendAnalysis,
    anomalies: TrendDataPoint[]
  ): string[] {
    const insights: string[] = []

    if (trend.direction === 'increasing') {
      insights.push(
        'Temperature is trending upward, indicating potential cooling issues'
      )
    } else if (trend.direction === 'decreasing') {
      insights.push(
        'Temperature is trending downward, showing improved cooling efficiency'
      )
    }

    if (anomalies.length > 0) {
      insights.push(
        `${anomalies.length} temperature anomalies detected in the analysis period`
      )
    }

    if (trend.confidence > 0.8) {
      insights.push(
        'High confidence trend analysis with reliable forecasting capability'
      )
    }

    return insights
  }

  private generateTemperatureRecommendations(
    trend: TrendAnalysis,
    anomalies: TrendDataPoint[]
  ): string[] {
    const recommendations: string[] = []

    if (trend.direction === 'increasing' && trend.strength === 'strong') {
      recommendations.push(
        'Schedule immediate maintenance check on cooling systems'
      )
    }

    if (anomalies.length > 5) {
      recommendations.push(
        'Investigate causes of frequent temperature anomalies'
      )
    }

    if (trend.confidence < 0.6) {
      recommendations.push(
        'Collect more temperature data to improve trend analysis accuracy'
      )
    }

    return recommendations
  }

  private generateComplianceInsights(
    trend: TrendAnalysis,
    anomalies: TrendDataPoint[]
  ): string[] {
    const insights: string[] = []

    if (trend.direction === 'increasing') {
      insights.push('Compliance scores are improving over time')
    } else if (trend.direction === 'decreasing') {
      insights.push('Compliance scores are declining and require attention')
    }

    return insights
  }

  private generateComplianceRecommendations(
    trend: TrendAnalysis,
    anomalies: TrendDataPoint[]
  ): string[] {
    const recommendations: string[] = []

    if (trend.direction === 'decreasing') {
      recommendations.push('Implement additional compliance training for staff')
      recommendations.push('Review and update compliance procedures')
    }

    return recommendations
  }

  private generatePerformanceInsights(
    trend: TrendAnalysis,
    anomalies: TrendDataPoint[]
  ): string[] {
    const insights: string[] = []

    if (trend.direction === 'increasing') {
      insights.push('Department performance is improving')
    }

    return insights
  }

  private generatePerformanceRecommendations(
    trend: TrendAnalysis,
    anomalies: TrendDataPoint[]
  ): string[] {
    const recommendations: string[] = []

    if (trend.direction === 'decreasing') {
      recommendations.push(
        'Consider additional training or resource allocation'
      )
    }

    return recommendations
  }
}

// Export singleton instance
export const trendAnalyzer = new TrendAnalyzer()

export default trendAnalyzer
