/**
 * Business Intelligence Services - B.10.2 Advanced Analytics & Reporting
 * Complete business intelligence and benchmarking system for HACCP Business Manager
 *
 * ✅ IMPLEMENTED: B.10.2 Advanced Analytics & Reporting
 */

// Export all business intelligence services
export { executiveDashboard, ExecutiveDashboard } from './ExecutiveDashboard'
export { benchmarkAnalyzer, BenchmarkAnalyzer } from './BenchmarkAnalyzer'

// Export types
export type { 
  ExecutiveKPI,
  CompanyPerformance,
  IndustryBenchmark,
  ExecutiveInsight,
  ExecutiveSummary
} from './ExecutiveDashboard'

export type { 
  BenchmarkData,
  IndustryComparison,
  CompetitiveAnalysis,
  BenchmarkInsight,
  BenchmarkReport
} from './BenchmarkAnalyzer'

console.log('📊 Business Intelligence services implemented - B.10.2 Advanced Analytics & Reporting COMPLETED')
