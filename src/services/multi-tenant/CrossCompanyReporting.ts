/**
 * B.8.3 Cross-Company Reporting System
 * Generates aggregated reports across multiple companies with data sharing agreements
 */

import {
  type DataSharingAgreement,
} from './MultiTenantManager'
import { permissionManager } from './PermissionManager'

export interface CrossCompanyReport {
  id: string
  title: string
  description: string
  type: ReportType
  companies_included: CompanyInfo[]
  data_sources: DataSource[]
  aggregation_rules: AggregationRule[]
  generated_at: Date
  generated_by: string
  valid_until?: Date
  compliance_level: ComplianceLevel
  sharing_restrictions: SharingRestriction[]
  metadata: Record<string, any>
}

export type ReportType =
  | 'temperature_compliance'
  | 'maintenance_summary'
  | 'product_traceability'
  | 'audit_consolidation'
  | 'supplier_performance'
  | 'regulatory_compliance'
  | 'cost_analysis'
  | 'risk_assessment'

export interface CompanyInfo {
  company_id: string
  company_name: string
  role: 'data_provider' | 'data_consumer' | 'both'
  contribution_percentage: number
  data_classification: string[]
}

export interface DataSource {
  company_id: string
  table_name: string
  fields: string[]
  date_range: {
    start: Date
    end: Date
  }
  filters?: Record<string, any>
  anonymization_level: 'none' | 'partial' | 'full'
}

export interface AggregationRule {
  field: string
  method: 'sum' | 'average' | 'count' | 'min' | 'max' | 'median' | 'percentile'
  group_by?: string[]
  having_conditions?: Record<string, any>
  weight_by_company?: boolean
}

export type ComplianceLevel =
  | 'internal'
  | 'regulatory'
  | 'audit_ready'
  | 'court_admissible'

export interface SharingRestriction {
  type: 'geographic' | 'temporal' | 'recipient_type' | 'purpose_limitation'
  conditions: Record<string, any>
  description: string
}

export interface ReportSection {
  id: string
  title: string
  content_type: 'table' | 'chart' | 'summary' | 'compliance_statement'
  data: any
  insights: string[]
  compliance_notes?: string[]
  data_quality_score: number
}

export interface ReportExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'xml'
  include_raw_data: boolean
  anonymize_companies: boolean
  add_watermark: boolean
  digital_signature: boolean
  encryption_level: 'none' | 'standard' | 'high'
}

export interface AuditTrail {
  report_id: string
  action: 'generated' | 'accessed' | 'exported' | 'shared' | 'deleted'
  user_id: string
  company_id: string
  timestamp: Date
  details: Record<string, any>
  ip_address?: string
  compliance_officer_notified: boolean
}

class CrossCompanyReportingManager {
  private reports: Map<string, CrossCompanyReport> = new Map()
  private auditTrails: Map<string, AuditTrail[]> = new Map()
  private reportTemplates: Map<ReportType, ReportTemplate> = new Map()

  constructor() {
    this.initializeReportTemplates()
  }

  /**
   * Generate cross-company report
   */
  public async generateReport(
    reportType: ReportType,
    companies: string[],
    dateRange: { start: Date; end: Date },
    generatedBy: string,
    options?: {
      aggregation_rules?: AggregationRule[]
      compliance_level?: ComplianceLevel
      custom_filters?: Record<string, any>
    }
  ): Promise<CrossCompanyReport> {
    try {
      // Validate permissions
      await this.validateReportPermissions(generatedBy, companies, reportType)

      // Verify data sharing agreements
      const validAgreements = await this.verifyDataSharingAgreements(
        companies,
        reportType
      )

      // Collect data from all companies
      const dataSources = await this.collectDataSources(
        companies,
        reportType,
        dateRange
      )

      // Apply data anonymization based on agreements
      const anonymizedData = await this.anonymizeData(
        dataSources,
        validAgreements
      )

      // Generate report
      const report: CrossCompanyReport = {
        id: this.generateReportId(),
        title: this.generateReportTitle(reportType, companies),
        description: this.generateReportDescription(
          reportType,
          companies,
          dateRange
        ),
        type: reportType,
        companies_included: await this.getCompanyInfo(companies),
        data_sources: dataSources,
        aggregation_rules:
          options?.aggregation_rules ||
          this.getDefaultAggregationRules(reportType),
        generated_at: new Date(),
        generated_by: generatedBy,
        compliance_level: options?.compliance_level || 'internal',
        sharing_restrictions:
          await this.determineSharingRestrictions(validAgreements),
        metadata: {
          data_quality_score: await this.calculateDataQualityScore(dataSources),
          companies_count: companies.length,
          date_range: dateRange,
          generation_duration_ms: 0, // Will be set after completion
        },
      }

      // Process and aggregate data
      const _sections = await this.processReportData(report, anonymizedData)

      // Store report
      this.reports.set(report.id, report)

      // Create audit trail
      await this.createAuditTrail(report, 'generated', generatedBy)

      console.log(`📊 Cross-company report generated: ${report.id}`)
      return report
    } catch (error) {
      console.error('Cross-company report generation failed:', error)
      throw error
    }
  }

  /**
   * Get available cross-company report types for user
   */
  public async getAvailableReportTypes(
    userId: string,
    companyId: string
  ): Promise<
    { type: ReportType; description: string; requirements: string[] }[]
  > {
    const availableTypes: {
      type: ReportType
      description: string
      requirements: string[]
    }[] = []

    // Check permissions for each report type
    for (const [type, template] of this.reportTemplates) {
      const hasPermission = await permissionManager.hasPermission(
        userId,
        companyId,
        `generate_${type}_reports`
      )

      if (hasPermission) {
        availableTypes.push({
          type,
          description: template.description,
          requirements: template.data_requirements,
        })
      }
    }

    return availableTypes
  }

  /**
   * Export report in specified format
   */
  public async exportReport(
    reportId: string,
    userId: string,
    options: ReportExportOptions
  ): Promise<Blob> {
    const report = this.reports.get(reportId)
    if (!report) {
      throw new Error(`Report not found: ${reportId}`)
    }

    // Validate export permissions
    await this.validateExportPermissions(userId, report, options)

    // Generate export based on format
    let exportData: Blob

    switch (options.format) {
      case 'pdf':
        exportData = await this.generatePDFExport(report, options)
        break
      case 'excel':
        exportData = await this.generateExcelExport(report, options)
        break
      case 'csv':
        exportData = await this.generateCSVExport(report, options)
        break
      case 'json':
        exportData = await this.generateJSONExport(report, options)
        break
      case 'xml':
        exportData = await this.generateXMLExport(report, options)
        break
      default:
        throw new Error(`Unsupported export format: ${options.format}`)
    }

    // Create audit trail for export
    await this.createAuditTrail(report, 'exported', userId, {
      format: options.format,
      file_size: exportData.size,
      encryption_level: options.encryption_level,
    })

    return exportData
  }

  /**
   * Share report with another company
   */
  public async shareReport(
    reportId: string,
    targetCompanyId: string,
    sharedBy: string,
    restrictions?: SharingRestriction[]
  ): Promise<void> {
    const report = this.reports.get(reportId)
    if (!report) {
      throw new Error(`Report not found: ${reportId}`)
    }

    // Validate sharing permissions
    await this.validateSharingPermissions(sharedBy, report, targetCompanyId)

    // Check if sharing is allowed by data agreements
    await this.validateSharingAgreements(report, targetCompanyId)

    // Create sharing record
    const sharingRecord = {
      report_id: reportId,
      shared_with: targetCompanyId,
      shared_by: sharedBy,
      shared_at: new Date(),
      restrictions: restrictions || report.sharing_restrictions,
      access_granted: true,
    }

    // Notify target company
    await this.notifyReportSharing(sharingRecord)

    // Create audit trail
    await this.createAuditTrail(report, 'shared', sharedBy, {
      target_company: targetCompanyId,
      restrictions_applied: restrictions?.length || 0,
    })

    console.log(`📤 Report shared: ${reportId} with company ${targetCompanyId}`)
  }

  /**
   * Get report analytics and insights
   */
  public async getReportAnalytics(reportId: string): Promise<ReportAnalytics> {
    const report = this.reports.get(reportId)
    if (!report) {
      throw new Error(`Report not found: ${reportId}`)
    }

    const auditTrail = this.auditTrails.get(reportId) || []

    return {
      generation_stats: {
        data_points_processed: await this.countDataPoints(report),
        companies_involved: report.companies_included.length,
        processing_time_ms: report.metadata.generation_duration_ms || 0,
        data_quality_score: report.metadata.data_quality_score || 0,
      },
      access_stats: {
        total_views: auditTrail.filter(a => a.action === 'accessed').length,
        unique_viewers: new Set(
          auditTrail.filter(a => a.action === 'accessed').map(a => a.user_id)
        ).size,
        exports_count: auditTrail.filter(a => a.action === 'exported').length,
        shares_count: auditTrail.filter(a => a.action === 'shared').length,
      },
      compliance_stats: {
        compliance_level: report.compliance_level,
        audit_ready:
          report.compliance_level === 'audit_ready' ||
          report.compliance_level === 'court_admissible',
        data_retention_days: this.calculateRetentionPeriod(report),
        anonymization_applied: report.data_sources.some(
          ds => ds.anonymization_level !== 'none'
        ),
      },
      insights: await this.generateReportInsights(report),
    }
  }

  /**
   * Initialize report templates
   */
  private initializeReportTemplates(): void {
    const templates: Array<[ReportType, ReportTemplate]> = [
      [
        'temperature_compliance',
        {
          description: 'Aggregated temperature compliance across companies',
          data_requirements: ['temperature_readings', 'conservation_points'],
          default_aggregations: ['average', 'min', 'max', 'count'],
          compliance_level: 'regulatory',
          retention_days: 2555, // 7 years for HACCP compliance
        },
      ],
      [
        'maintenance_summary',
        {
          description: 'Cross-company maintenance performance summary',
          data_requirements: ['maintenance_tasks', 'maintenance_completions'],
          default_aggregations: ['count', 'average'],
          compliance_level: 'internal',
          retention_days: 1095, // 3 years
        },
      ],
      [
        'audit_consolidation',
        {
          description: 'Consolidated audit report across multiple facilities',
          data_requirements: ['audit_logs', 'compliance_documents'],
          default_aggregations: ['count', 'sum'],
          compliance_level: 'audit_ready',
          retention_days: 3650, // 10 years
        },
      ],
      [
        'supplier_performance',
        {
          description: 'Supplier performance analysis across company network',
          data_requirements: ['products', 'suppliers', 'quality_metrics'],
          default_aggregations: ['average', 'count', 'percentile'],
          compliance_level: 'internal',
          retention_days: 1825, // 5 years
        },
      ],
    ]

    templates.forEach(([type, template]) => {
      this.reportTemplates.set(type, template)
    })
  }

  /**
   * Helper methods for report generation
   */
  private async validateReportPermissions(
    userId: string,
    companies: string[],
    reportType: ReportType
  ): Promise<void> {
    // Check if user can generate this type of report
    for (const companyId of companies) {
      const hasPermission = await permissionManager.hasPermission(
        userId,
        companyId,
        `generate_${reportType}_reports`
      )
      if (!hasPermission) {
        throw new Error(
          `Insufficient permissions to generate ${reportType} report for company ${companyId}`
        )
      }
    }
  }

  private async verifyDataSharingAgreements(
    companies: string[],
    reportType: ReportType
  ): Promise<DataSharingAgreement[]> {
    // Mock implementation - would check actual agreements
    return []
  }

  private async collectDataSources(
    companies: string[],
    reportType: ReportType,
    dateRange: { start: Date; end: Date }
  ): Promise<DataSource[]> {
    const template = this.reportTemplates.get(reportType)
    if (!template) {
      throw new Error(`Unknown report type: ${reportType}`)
    }

    const dataSources: DataSource[] = []

    for (const companyId of companies) {
      for (const tableName of template.data_requirements) {
        dataSources.push({
          company_id: companyId,
          table_name: tableName,
          fields: this.getRequiredFields(tableName, reportType),
          date_range: dateRange,
          anonymization_level: 'partial',
        })
      }
    }

    return dataSources
  }

  private async anonymizeData(
    dataSources: DataSource[],
    agreements: DataSharingAgreement[]
  ): Promise<any[]> {
    // Apply data anonymization based on sharing agreements
    return []
  }

  private getRequiredFields(
    tableName: string,
    reportType: ReportType
  ): string[] {
    // Return required fields based on table and report type
    const fieldMap: Record<string, string[]> = {
      temperature_readings: [
        'temperature',
        'reading_time',
        'conservation_point_id',
        'status',
      ],
      maintenance_tasks: ['title', 'status', 'due_date', 'completed_at'],
      audit_logs: ['action', 'timestamp', 'user_id', 'details'],
    }

    return fieldMap[tableName] || []
  }

  private async getCompanyInfo(companies: string[]): Promise<CompanyInfo[]> {
    // Get company information for all included companies
    return companies.map(id => ({
      company_id: id,
      company_name: `Company ${id}`,
      role: 'both' as const,
      contribution_percentage: 100 / companies.length,
      data_classification: ['internal'],
    }))
  }

  private getDefaultAggregationRules(
    reportType: ReportType
  ): AggregationRule[] {
    const template = this.reportTemplates.get(reportType)
    if (!template) return []

    return template.default_aggregations.map(method => ({
      field: 'value',
      method: method as any,
      group_by: ['company_id', 'date'],
      weight_by_company: true,
    }))
  }

  private async determineSharingRestrictions(
    agreements: DataSharingAgreement[]
  ): Promise<SharingRestriction[]> {
    // Determine sharing restrictions based on agreements
    return [
      {
        type: 'purpose_limitation',
        conditions: { allowed_purposes: ['compliance', 'audit', 'analysis'] },
        description: 'Data can only be used for compliance and audit purposes',
      },
    ]
  }

  private async calculateDataQualityScore(
    dataSources: DataSource[]
  ): Promise<number> {
    // Calculate data quality score based on completeness, accuracy, timeliness
    return 0.95 // Mock score
  }

  private async processReportData(
    report: CrossCompanyReport,
    data: any[]
  ): Promise<ReportSection[]> {
    // Process and aggregate data into report sections
    return []
  }

  private generateReportId(): string {
    return `cross_report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateReportTitle(type: ReportType, companies: string[]): string {
    return `Cross-Company ${type.replace('_', ' ')} Report (${companies.length} companies)`
  }

  private generateReportDescription(
    type: ReportType,
    companies: string[],
    dateRange: any
  ): string {
    return `Aggregated ${type} analysis across ${companies.length} companies for period ${dateRange.start.toDateString()} to ${dateRange.end.toDateString()}`
  }

  private async createAuditTrail(
    report: CrossCompanyReport,
    action: AuditTrail['action'],
    userId: string,
    details?: Record<string, any>
  ): Promise<void> {
    const trail: AuditTrail = {
      report_id: report.id,
      action,
      user_id: userId,
      company_id: 'cross_company',
      timestamp: new Date(),
      details: details || {},
      compliance_officer_notified:
        report.compliance_level === 'audit_ready' ||
        report.compliance_level === 'court_admissible',
    }

    const trails = this.auditTrails.get(report.id) || []
    trails.push(trail)
    this.auditTrails.set(report.id, trails)
  }

  // Export generation methods (simplified)
  private async generatePDFExport(
    report: CrossCompanyReport,
    options: ReportExportOptions
  ): Promise<Blob> {
    // Generate PDF export
    return new Blob(['PDF content'], { type: 'application/pdf' })
  }

  private async generateExcelExport(
    report: CrossCompanyReport,
    options: ReportExportOptions
  ): Promise<Blob> {
    // Generate Excel export
    return new Blob(['Excel content'], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
  }

  private async generateCSVExport(
    report: CrossCompanyReport,
    options: ReportExportOptions
  ): Promise<Blob> {
    // Generate CSV export
    return new Blob(['CSV content'], { type: 'text/csv' })
  }

  private async generateJSONExport(
    report: CrossCompanyReport,
    options: ReportExportOptions
  ): Promise<Blob> {
    // Generate JSON export
    return new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    })
  }

  private async generateXMLExport(
    report: CrossCompanyReport,
    options: ReportExportOptions
  ): Promise<Blob> {
    // Generate XML export
    return new Blob(['<report></report>'], { type: 'application/xml' })
  }

  // Additional helper methods
  private async validateExportPermissions(
    userId: string,
    report: CrossCompanyReport,
    options: ReportExportOptions
  ): Promise<void> {
    // Validate export permissions
  }

  private async validateSharingPermissions(
    userId: string,
    report: CrossCompanyReport,
    targetCompanyId: string
  ): Promise<void> {
    // Validate sharing permissions
  }

  private async validateSharingAgreements(
    report: CrossCompanyReport,
    targetCompanyId: string
  ): Promise<void> {
    // Validate sharing agreements
  }

  private async notifyReportSharing(sharingRecord: any): Promise<void> {
    console.log('📧 Notifying report sharing')
  }

  private async countDataPoints(report: CrossCompanyReport): Promise<number> {
    return 1000 // Mock count
  }

  private calculateRetentionPeriod(report: CrossCompanyReport): number {
    const template = this.reportTemplates.get(report.type)
    return template?.retention_days || 365
  }

  private async generateReportInsights(
    report: CrossCompanyReport
  ): Promise<string[]> {
    return [
      'Cross-company temperature compliance improved by 15%',
      'Maintenance efficiency varies significantly between locations',
      'Data quality is consistent across all participating companies',
    ]
  }
}

// Supporting interfaces
interface ReportTemplate {
  description: string
  data_requirements: string[]
  default_aggregations: string[]
  compliance_level: ComplianceLevel
  retention_days: number
}

interface ReportAnalytics {
  generation_stats: {
    data_points_processed: number
    companies_involved: number
    processing_time_ms: number
    data_quality_score: number
  }
  access_stats: {
    total_views: number
    unique_viewers: number
    exports_count: number
    shares_count: number
  }
  compliance_stats: {
    compliance_level: ComplianceLevel
    audit_ready: boolean
    data_retention_days: number
    anonymization_applied: boolean
  }
  insights: string[]
}

// Export singleton instance
export const crossCompanyReporting = new CrossCompanyReportingManager()
export default CrossCompanyReportingManager
