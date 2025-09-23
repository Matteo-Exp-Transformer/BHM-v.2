/**
 * AnalyticsProcessor - B.10.2 Advanced Analytics & Reporting
 * Real-time analytics processing pipeline for HACCP data
 */

import { predictiveModels, PredictionResult } from './PredictiveModels'
import { trendAnalyzer, TrendAnalysis } from './TrendAnalyzer'
import { riskAssessment, RiskAssessment as RiskAssessmentType } from './RiskAssessment'

export interface AnalyticsData {
  id: string
  timestamp: Date
  source: 'temperature' | 'compliance' | 'performance' | 'inventory' | 'user_activity'
  entityId: string
  entityType: string
  metrics: Record<string, number>
  metadata: Record<string, any>
}

export interface ProcessedAnalytics {
  id: string
  timestamp: Date
  entityId: string
  entityType: string
  predictions: PredictionResult[]
  trends: TrendAnalysis[]
  risks: RiskAssessmentType[]
  insights: AnalyticsInsight[]
  alerts: AnalyticsAlert[]
  processedAt: Date
}

export interface AnalyticsInsight {
  id: string
  type: 'trend' | 'anomaly' | 'prediction' | 'risk' | 'performance'
  severity: 'info' | 'warning' | 'critical'
  title: string
  description: string
  confidence: number
  recommendations: string[]
  affectedEntities: string[]
  timestamp: Date
}

export interface AnalyticsAlert {
  id: string
  type: 'temperature_violation' | 'compliance_risk' | 'performance_decline' | 'equipment_failure'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  entityId: string
  entityType: string
  actions: string[]
  timestamp: Date
  acknowledged: boolean
}

export interface ProcessingConfig {
  batchSize: number
  processingInterval: number
  enablePredictions: boolean
  enableTrendAnalysis: boolean
  enableRiskAssessment: boolean
  alertThresholds: Record<string, number>
}

/**
 * Analytics Processing Service for Real-time HACCP Analytics
 */
export class AnalyticsProcessor {
  private isInitialized = false
  private processingQueue: AnalyticsData[] = []
  private processingConfig: ProcessingConfig
  private processingInterval: NodeJS.Timeout | null = null
  private isProcessing = false

  constructor() {
    this.processingConfig = {
      batchSize: 100,
      processingInterval: 30000, // 30 seconds
      enablePredictions: true,
      enableTrendAnalysis: true,
      enableRiskAssessment: true,
      alertThresholds: {
        temperature_violation: 8.0,
        compliance_risk: 75,
        performance_decline: 20
      }
    }
  }

  /**
   * Initialize the analytics processor
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Initialize dependent services
      await predictiveModels.initialize()
      await trendAnalyzer.initialize()
      await riskAssessment.initialize()

      // Start processing pipeline
      this.startProcessingPipeline()

      console.log('⚡ Analytics processor initialized - B.10.2 Advanced Analytics')
      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize analytics processor:', error)
      throw error
    }
  }

  /**
   * Add data to processing queue
   */
  public addData(data: AnalyticsData | AnalyticsData[]): void {
    try {
      const dataArray = Array.isArray(data) ? data : [data]
      this.processingQueue.push(...dataArray)
      
      console.log(`📊 Added ${dataArray.length} data points to analytics queue`)
      
      // Trigger immediate processing if queue is getting large
      if (this.processingQueue.length >= this.processingConfig.batchSize) {
        this.processQueue()
      }
    } catch (error) {
      console.error('Failed to add data to processing queue:', error)
    }
  }

  /**
   * Process analytics data for an entity
   */
  public async processEntityAnalytics(
    entityId: string,
    entityType: string,
    timeRange: { start: Date; end: Date }
  ): Promise<ProcessedAnalytics> {
    try {
      // Get raw data for the entity
      const rawData = await this.getEntityData(entityId, entityType, timeRange)
      
      // Process predictions
      const predictions: PredictionResult[] = []
      if (this.processingConfig.enablePredictions) {
        predictions.push(...await this.generatePredictions(rawData, entityId, entityType))
      }
      
      // Process trends
      const trends: TrendAnalysis[] = []
      if (this.processingConfig.enableTrendAnalysis) {
        trends.push(...await this.generateTrends(rawData, entityId, entityType))
      }
      
      // Process risk assessments
      const risks: RiskAssessmentType[] = []
      if (this.processingConfig.enableRiskAssessment) {
        risks.push(...await this.generateRiskAssessments(entityId, entityType))
      }
      
      // Generate insights
      const insights = this.generateInsights(predictions, trends, risks, rawData)
      
      // Generate alerts
      const alerts = this.generateAlerts(insights, entityId, entityType)
      
      const processed: ProcessedAnalytics = {
        id: `analytics_${entityId}_${Date.now()}`,
        timestamp: new Date(),
        entityId,
        entityType,
        predictions,
        trends,
        risks,
        insights,
        alerts,
        processedAt: new Date()
      }
      
      console.log(`📈 Processed analytics for ${entityType} ${entityId}`)
      return processed
      
    } catch (error) {
      console.error('Failed to process entity analytics:', error)
      throw error
    }
  }

  /**
   * Get real-time analytics dashboard data
   */
  public async getDashboardAnalytics(
    companyId: string
  ): Promise<{
    overview: ProcessedAnalytics
    conservationPoints: ProcessedAnalytics[]
    departments: ProcessedAnalytics[]
    alerts: AnalyticsAlert[]
    insights: AnalyticsInsight[]
  }> {
    try {
      const timeRange = {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        end: new Date()
      }

      // Process company-level analytics
      const overview = await this.processEntityAnalytics(companyId, 'company', timeRange)
      
      // Get conservation points analytics
      const conservationPointIds = await this.getConservationPointIds(companyId)
      const conservationPoints = await Promise.all(
        conservationPointIds.map(id => 
          this.processEntityAnalytics(id, 'conservation_point', timeRange)
        )
      )
      
      // Get departments analytics
      const departmentIds = await this.getDepartmentIds(companyId)
      const departments = await Promise.all(
        departmentIds.map(id => 
          this.processEntityAnalytics(id, 'department', timeRange)
        )
      )
      
      // Collect all alerts and insights
      const allAlerts = [
        ...overview.alerts,
        ...conservationPoints.flatMap(cp => cp.alerts),
        ...departments.flatMap(dept => dept.alerts)
      ]
      
      const allInsights = [
        ...overview.insights,
        ...conservationPoints.flatMap(cp => cp.insights),
        ...departments.flatMap(dept => dept.insights)
      ]
      
      return {
        overview,
        conservationPoints,
        departments,
        alerts: allAlerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
        insights: allInsights.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      }
      
    } catch (error) {
      console.error('Failed to get dashboard analytics:', error)
      throw error
    }
  }

  /**
   * Update processing configuration
   */
  public updateConfig(config: Partial<ProcessingConfig>): void {
    this.processingConfig = { ...this.processingConfig, ...config }
    
    // Restart processing pipeline with new interval
    if (config.processingInterval && this.processingInterval) {
      clearInterval(this.processingInterval)
      this.startProcessingPipeline()
    }
    
    console.log('⚙️ Analytics processing configuration updated')
  }

  /**
   * Get processing statistics
   */
  public getProcessingStats(): {
    queueSize: number
    isProcessing: boolean
    lastProcessed: Date | null
    processingRate: number
  } {
    return {
      queueSize: this.processingQueue.length,
      isProcessing: this.isProcessing,
      lastProcessed: this.getLastProcessedTime(),
      processingRate: this.calculateProcessingRate()
    }
  }

  // Private helper methods

  private startProcessingPipeline(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
    }
    
    this.processingInterval = setInterval(() => {
      if (this.processingQueue.length > 0) {
        this.processQueue()
      }
    }, this.processingConfig.processingInterval)
    
    console.log('🔄 Analytics processing pipeline started')
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.processingQueue.length === 0) {
      return
    }
    
    this.isProcessing = true
    
    try {
      // Process data in batches
      const batch = this.processingQueue.splice(0, this.processingConfig.batchSize)
      
      // Group data by entity
      const groupedData = this.groupDataByEntity(batch)
      
      // Process each entity's data
      for (const [entityKey, entityData] of groupedData.entries()) {
        const [entityId, entityType] = entityKey.split('|')
        await this.processEntityBatch(entityId, entityType, entityData)
      }
      
      console.log(`📊 Processed ${batch.length} analytics data points`)
      
    } catch (error) {
      console.error('Failed to process analytics queue:', error)
    } finally {
      this.isProcessing = false
    }
  }

  private groupDataByEntity(data: AnalyticsData[]): Map<string, AnalyticsData[]> {
    const grouped = new Map<string, AnalyticsData[]>()
    
    data.forEach(item => {
      const key = `${item.entityId}|${item.entityType}`
      if (!grouped.has(key)) {
        grouped.set(key, [])
      }
      grouped.get(key)!.push(item)
    })
    
    return grouped
  }

  private async processEntityBatch(
    entityId: string,
    entityType: string,
    data: AnalyticsData[]
  ): Promise<void> {
    try {
      // Sort data by timestamp
      data.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      
      // Update real-time analytics for this entity
      await this.updateRealTimeAnalytics(entityId, entityType, data)
      
      // Check for alerts
      await this.checkForAlerts(entityId, entityType, data)
      
    } catch (error) {
      console.error(`Failed to process batch for ${entityType} ${entityId}:`, error)
    }
  }

  private async getEntityData(
    entityId: string,
    entityType: string,
    timeRange: { start: Date; end: Date }
  ): Promise<AnalyticsData[]> {
    // Mock implementation - would fetch from database
    const data: AnalyticsData[] = []
    const interval = (timeRange.end.getTime() - timeRange.start.getTime()) / 100
    
    for (let i = 0; i < 100; i++) {
      const timestamp = new Date(timeRange.start.getTime() + i * interval)
      
      data.push({
        id: `data_${entityId}_${i}`,
        timestamp,
        source: 'temperature',
        entityId,
        entityType,
        metrics: {
          temperature: 4.0 + Math.sin(i / 10) * 2 + Math.random() * 0.5,
          humidity: 60 + Math.random() * 10,
          pressure: 1013 + Math.random() * 20
        },
        metadata: { sensorId: `sensor_${i}` }
      })
    }
    
    return data
  }

  private async generatePredictions(
    data: AnalyticsData[],
    entityId: string,
    entityType: string
  ): Promise<PredictionResult[]> {
    const predictions: PredictionResult[] = []
    
    try {
      if (entityType === 'conservation_point') {
        // Generate temperature predictions
        const tempPrediction = await predictiveModels.predictTemperatureTrend(entityId, 24)
        predictions.push(tempPrediction)
      }
      
      if (entityType === 'company') {
        // Generate compliance risk predictions
        const complianceData = { complianceScore: 75 }
        const riskPrediction = await predictiveModels.predictComplianceRisk(complianceData)
        predictions.push(riskPrediction)
      }
      
    } catch (error) {
      console.error('Failed to generate predictions:', error)
    }
    
    return predictions
  }

  private async generateTrends(
    data: AnalyticsData[],
    entityId: string,
    entityType: string
  ): Promise<TrendAnalysis[]> {
    const trends: TrendAnalysis[] = []
    
    try {
      const timeRange = {
        start: data[0]?.timestamp || new Date(Date.now() - 24 * 60 * 60 * 1000),
        end: data[data.length - 1]?.timestamp || new Date()
      }
      
      if (entityType === 'conservation_point') {
        const tempTrend = await trendAnalyzer.analyzeTemperatureTrends(entityId, timeRange)
        trends.push(tempTrend)
      }
      
      if (entityType === 'company') {
        const complianceTrend = await trendAnalyzer.analyzeComplianceTrend(entityId, timeRange)
        trends.push(complianceTrend)
      }
      
      if (entityType === 'department') {
        const performanceTrend = await trendAnalyzer.analyzePerformanceTrend(entityId, timeRange)
        trends.push(performanceTrend)
      }
      
    } catch (error) {
      console.error('Failed to generate trends:', error)
    }
    
    return trends
  }

  private async generateRiskAssessments(
    entityId: string,
    entityType: string
  ): Promise<RiskAssessmentType[]> {
    const risks: RiskAssessmentType[] = []
    
    try {
      switch (entityType) {
        case 'conservation_point':
          const conservationRisk = await riskAssessment.assessConservationPointRisk(entityId)
          risks.push(conservationRisk)
          break
        case 'company':
          const companyRisk = await riskAssessment.assessCompanyRisk(entityId)
          risks.push(companyRisk)
          break
        case 'department':
          const departmentRisk = await riskAssessment.assessDepartmentRisk(entityId)
          risks.push(departmentRisk)
          break
      }
      
    } catch (error) {
      console.error('Failed to generate risk assessments:', error)
    }
    
    return risks
  }

  private generateInsights(
    predictions: PredictionResult[],
    trends: TrendAnalysis[],
    risks: RiskAssessmentType[],
    data: AnalyticsData[]
  ): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = []
    
    // Generate insights from predictions
    predictions.forEach(prediction => {
      if (prediction.confidence > 0.8) {
        insights.push({
          id: `insight_prediction_${prediction.type}`,
          type: 'prediction',
          severity: 'info',
          title: `High Confidence ${prediction.type} Prediction`,
          description: `Predicted ${prediction.type} with ${Math.round(prediction.confidence * 100)}% confidence`,
          confidence: prediction.confidence,
          recommendations: prediction.recommendation ? [prediction.recommendation] : [],
          affectedEntities: [],
          timestamp: new Date()
        })
      }
    })
    
    // Generate insights from trends
    trends.forEach(trend => {
      if (trend.strength === 'strong' && trend.confidence > 0.7) {
        insights.push({
          id: `insight_trend_${trend.type}`,
          type: 'trend',
          severity: trend.direction === 'deteriorating' ? 'warning' : 'info',
          title: `Strong ${trend.direction} Trend Detected`,
          description: `${trend.type} showing ${trend.strength} ${trend.direction} trend`,
          confidence: trend.confidence,
          recommendations: trend.recommendations,
          affectedEntities: [],
          timestamp: new Date()
        })
      }
    })
    
    // Generate insights from risks
    risks.forEach(risk => {
      if (risk.riskLevel === 'high' || risk.riskLevel === 'critical') {
        insights.push({
          id: `insight_risk_${risk.entityType}`,
          type: 'risk',
          severity: risk.riskLevel === 'critical' ? 'critical' : 'warning',
          title: `${risk.riskLevel.toUpperCase()} Risk Detected`,
          description: `${risk.entityType} has ${risk.riskLevel} risk level (score: ${risk.overallScore})`,
          confidence: risk.trends.confidence,
          recommendations: risk.recommendations.map(r => r.title),
          affectedEntities: [risk.entityId],
          timestamp: new Date()
        })
      }
    })
    
    return insights
  }

  private generateAlerts(
    insights: AnalyticsInsight[],
    entityId: string,
    entityType: string
  ): AnalyticsAlert[] {
    const alerts: AnalyticsAlert[] = []
    
    insights.forEach(insight => {
      if (insight.severity === 'critical' || insight.severity === 'warning') {
        alerts.push({
          id: `alert_${insight.id}`,
          type: this.mapInsightToAlertType(insight.type),
          severity: insight.severity === 'critical' ? 'critical' : 'high',
          title: insight.title,
          message: insight.description,
          entityId,
          entityType,
          actions: insight.recommendations,
          timestamp: new Date(),
          acknowledged: false
        })
      }
    })
    
    return alerts
  }

  private mapInsightToAlertType(insightType: string): AnalyticsAlert['type'] {
    switch (insightType) {
      case 'prediction':
        return 'temperature_violation'
      case 'risk':
        return 'compliance_risk'
      case 'trend':
        return 'performance_decline'
      default:
        return 'equipment_failure'
    }
  }

  private async updateRealTimeAnalytics(
    entityId: string,
    entityType: string,
    data: AnalyticsData[]
  ): Promise<void> {
    // Update real-time analytics cache
    console.log(`📊 Updated real-time analytics for ${entityType} ${entityId}`)
  }

  private async checkForAlerts(
    entityId: string,
    entityType: string,
    data: AnalyticsData[]
  ): Promise<void> {
    // Check for alert conditions
    data.forEach(item => {
      if (item.source === 'temperature' && item.metrics.temperature > this.processingConfig.alertThresholds.temperature_violation) {
        console.log(`🚨 Temperature violation alert for ${entityId}: ${item.metrics.temperature}°C`)
      }
    })
  }

  private async getConservationPointIds(companyId: string): Promise<string[]> {
    // Mock implementation - would fetch from database
    return ['CP001', 'CP002', 'CP003']
  }

  private async getDepartmentIds(companyId: string): Promise<string[]> {
    // Mock implementation - would fetch from database
    return ['DEPT001', 'DEPT002']
  }

  private getLastProcessedTime(): Date | null {
    // Mock implementation - would return actual last processed time
    return new Date()
  }

  private calculateProcessingRate(): number {
    // Mock implementation - would calculate actual processing rate
    return 100 // items per minute
  }
}

// Export singleton instance
export const analyticsProcessor = new AnalyticsProcessor()

export default analyticsProcessor
