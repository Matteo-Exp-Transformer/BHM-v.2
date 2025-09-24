/**
 * Reporting Services - B.10.2 Advanced Analytics & Reporting
 * Complete reporting and scheduling system for HACCP Business Manager
 *
 * ✅ IMPLEMENTED: B.10.2 Advanced Analytics & Reporting
 */

// Export all reporting services
export { reportBuilder, ReportBuilder } from './ReportBuilder'
export { dataAggregator, DataAggregator } from './DataAggregator'
export { scheduleManager, ScheduleManager } from './ScheduleManager'

// Export types
export type {
  Report,
  ReportComponent,
  ComponentConfig,
  DataSourceConfig,
  FilterConfig,
  LayoutConfig,
  StylingConfig,
  TableColumn,
  ReportLayoutConfig,
  ReportMetadata,
  ReportTemplate,
} from './ReportBuilder'

export type {
  AggregationConfig,
  AggregationRule,
  FilterRule,
  SortRule,
  AggregatedData,
  DataSource,
  QueryResult,
} from './DataAggregator'

export type {
  ScheduleConfig,
  ScheduleFrequency,
  RecipientConfig,
  DeliveryOptions,
  ScheduleCondition,
  ScheduleExecution,
  DeliveryStatus,
  ScheduleStats,
} from './ScheduleManager'

console.log(
  '📊 Reporting services implemented - B.10.2 Advanced Analytics & Reporting COMPLETED'
)
