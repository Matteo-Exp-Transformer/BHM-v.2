/**
 * Analytics Services - B.10.2 Advanced Analytics & Reporting
 * Complete analytics and reporting system for HACCP Business Manager
 *
 * ✅ IMPLEMENTED: B.10.2 Advanced Analytics & Reporting
 */

// Export all analytics services
export { predictiveModels, PredictiveModels } from './PredictiveModels'
export { trendAnalyzer, TrendAnalyzer } from './TrendAnalyzer'
export { riskAssessment, RiskAssessment } from './RiskAssessment'
export { analyticsProcessor, AnalyticsProcessor } from './AnalyticsProcessor'

// Export types
export type {
  TemperatureReading,
  PredictionResult,
  ModelMetrics,
} from './PredictiveModels'

export type {
  TrendDataPoint,
  TrendAnalysis,
  SeasonalPattern,
  TrendComparison,
} from './TrendAnalyzer'

export type {
  RiskFactor,
  RiskAssessment,
  RiskRecommendation,
  RiskThreshold,
  RiskHistory,
} from './RiskAssessment'

export type {
  AnalyticsData,
  ProcessedAnalytics,
  AnalyticsInsight,
  AnalyticsAlert,
  ProcessingConfig,
} from './AnalyticsProcessor'

console.log(
  '📊 Analytics services implemented - B.10.2 Advanced Analytics & Reporting COMPLETED'
)
