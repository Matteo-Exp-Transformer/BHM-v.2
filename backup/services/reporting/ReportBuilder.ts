/**
 * ReportBuilder - B.10.2 Advanced Analytics & Reporting
 * Dynamic report creation and management system
 */

export interface ReportComponent {
  id: string
  type: 'chart' | 'table' | 'metric' | 'text' | 'image' | 'kpi'
  config: ComponentConfig
  dataSource: DataSourceConfig
  filters: FilterConfig[]
  layout: LayoutConfig
  styling: StylingConfig
}

export interface ComponentConfig {
  title: string
  description?: string
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'heatmap'
  tableColumns?: TableColumn[]
  metricValue?: number
  metricUnit?: string
  kpiTarget?: number
  textContent?: string
  imageUrl?: string
  showLegend?: boolean
  showGrid?: boolean
  showDataLabels?: boolean
}

export interface DataSourceConfig {
  source: 'database' | 'api' | 'file' | 'manual'
  query?: string
  endpoint?: string
  filePath?: string
  parameters?: Record<string, any>
  refreshInterval?: number
}

export interface FilterConfig {
  id: string
  field: string
  operator:
    | 'equals'
    | 'contains'
    | 'greater_than'
    | 'less_than'
    | 'between'
    | 'in'
  value: any
  label: string
}

export interface LayoutConfig {
  x: number
  y: number
  width: number
  height: number
  zIndex: number
}

export interface StylingConfig {
  backgroundColor?: string
  textColor?: string
  borderColor?: string
  borderWidth?: number
  borderRadius?: number
  fontSize?: number
  fontFamily?: string
  padding?: number
}

export interface TableColumn {
  id: string
  header: string
  field: string
  type: 'string' | 'number' | 'date' | 'boolean'
  format?: string
  sortable?: boolean
  filterable?: boolean
}

export interface Report {
  id: string
  name: string
  description: string
  category: string
  components: ReportComponent[]
  globalFilters: FilterConfig[]
  layout: ReportLayoutConfig
  metadata: ReportMetadata
  createdAt: Date
  updatedAt: Date
  createdBy: string
  isPublic: boolean
}

export interface ReportLayoutConfig {
  width: number
  height: number
  gridSize: number
  autoLayout: boolean
  backgroundColor: string
  padding: number
}

export interface ReportMetadata {
  tags: string[]
  version: string
  lastGenerated?: Date
  generationCount: number
  averageGenerationTime: number
  lastError?: string
}

export interface ReportTemplate {
  id: string
  name: string
  description: string
  category: string
  template: Report
  isSystem: boolean
  usageCount: number
}

/**
 * Report Builder Service for Dynamic Report Creation
 */
export class ReportBuilder {
  private reports: Map<string, Report> = new Map()
  private templates: Map<string, ReportTemplate> = new Map()
  private isInitialized = false

  /**
   * Initialize the report builder
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      await this.loadSystemTemplates()
      console.log('📊 Report builder initialized - B.10.2 Advanced Analytics')
      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize report builder:', error)
      throw error
    }
  }

  /**
   * Create a new report
   */
  public createReport(
    name: string,
    description: string,
    category: string,
    createdBy: string
  ): Report {
    const report: Report = {
      id: this.generateReportId(),
      name,
      description,
      category,
      components: [],
      globalFilters: [],
      layout: {
        width: 1200,
        height: 800,
        gridSize: 20,
        autoLayout: true,
        backgroundColor: '#ffffff',
        padding: 20,
      },
      metadata: {
        tags: [],
        version: '1.0.0',
        generationCount: 0,
        averageGenerationTime: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy,
      isPublic: false,
    }

    this.reports.set(report.id, report)
    console.log(`📋 Created new report: ${name}`)
    return report
  }

  /**
   * Add a component to a report
   */
  public addComponent(
    reportId: string,
    component: Omit<ReportComponent, 'id'>
  ): ReportComponent {
    const report = this.reports.get(reportId)
    if (!report) {
      throw new Error(`Report not found: ${reportId}`)
    }

    const newComponent: ReportComponent = {
      id: this.generateComponentId(),
      ...component,
    }

    report.components.push(newComponent)
    report.updatedAt = new Date()

    console.log(
      `📊 Added ${component.type} component to report: ${report.name}`
    )
    return newComponent
  }

  /**
   * Update a component in a report
   */
  public updateComponent(
    reportId: string,
    componentId: string,
    updates: Partial<ReportComponent>
  ): ReportComponent {
    const report = this.reports.get(reportId)
    if (!report) {
      throw new Error(`Report not found: ${reportId}`)
    }

    const componentIndex = report.components.findIndex(
      c => c.id === componentId
    )
    if (componentIndex === -1) {
      throw new Error(`Component not found: ${componentId}`)
    }

    report.components[componentIndex] = {
      ...report.components[componentIndex],
      ...updates,
    }
    report.updatedAt = new Date()

    console.log(`📊 Updated component ${componentId} in report: ${report.name}`)
    return report.components[componentIndex]
  }

  /**
   * Remove a component from a report
   */
  public removeComponent(reportId: string, componentId: string): void {
    const report = this.reports.get(reportId)
    if (!report) {
      throw new Error(`Report not found: ${reportId}`)
    }

    const componentIndex = report.components.findIndex(
      c => c.id === componentId
    )
    if (componentIndex === -1) {
      throw new Error(`Component not found: ${componentId}`)
    }

    report.components.splice(componentIndex, 1)
    report.updatedAt = new Date()

    console.log(
      `📊 Removed component ${componentId} from report: ${report.name}`
    )
  }

  /**
   * Add global filter to a report
   */
  public addGlobalFilter(
    reportId: string,
    filter: Omit<FilterConfig, 'id'>
  ): FilterConfig {
    const report = this.reports.get(reportId)
    if (!report) {
      throw new Error(`Report not found: ${reportId}`)
    }

    const newFilter: FilterConfig = {
      id: this.generateFilterId(),
      ...filter,
    }

    report.globalFilters.push(newFilter)
    report.updatedAt = new Date()

    console.log(`🔍 Added global filter to report: ${report.name}`)
    return newFilter
  }

  /**
   * Update report layout
   */
  public updateLayout(
    reportId: string,
    layoutUpdates: Partial<ReportLayoutConfig>
  ): void {
    const report = this.reports.get(reportId)
    if (!report) {
      throw new Error(`Report not found: ${reportId}`)
    }

    report.layout = { ...report.layout, ...layoutUpdates }
    report.updatedAt = new Date()

    console.log(`📐 Updated layout for report: ${report.name}`)
  }

  /**
   * Duplicate a report
   */
  public duplicateReport(
    reportId: string,
    newName: string,
    createdBy: string
  ): Report {
    const originalReport = this.reports.get(reportId)
    if (!originalReport) {
      throw new Error(`Report not found: ${reportId}`)
    }

    const duplicatedReport: Report = {
      ...originalReport,
      id: this.generateReportId(),
      name: newName,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy,
      metadata: {
        ...originalReport.metadata,
        version: '1.0.0',
        generationCount: 0,
        averageGenerationTime: 0,
      },
    }

    this.reports.set(duplicatedReport.id, duplicatedReport)
    console.log(`📋 Duplicated report: ${newName}`)
    return duplicatedReport
  }

  /**
   * Create report from template
   */
  public createFromTemplate(
    templateId: string,
    name: string,
    createdBy: string
  ): Report {
    const template = this.templates.get(templateId)
    if (!template) {
      throw new Error(`Template not found: ${templateId}`)
    }

    const report = this.duplicateReport(template.template.id, name, createdBy)

    // Update template usage count
    template.usageCount++

    console.log(`📋 Created report from template: ${name}`)
    return report
  }

  /**
   * Save report as template
   */
  public saveAsTemplate(
    reportId: string,
    templateName: string,
    isSystem: boolean = false
  ): ReportTemplate {
    const report = this.reports.get(reportId)
    if (!report) {
      throw new Error(`Report not found: ${reportId}`)
    }

    const template: ReportTemplate = {
      id: this.generateTemplateId(),
      name: templateName,
      description: `Template based on report: ${report.name}`,
      category: report.category,
      template: { ...report },
      isSystem,
      usageCount: 0,
    }

    this.templates.set(template.id, template)
    console.log(`📋 Saved report as template: ${templateName}`)
    return template
  }

  /**
   * Get all reports
   */
  public getReports(): Report[] {
    return Array.from(this.reports.values())
  }

  /**
   * Get report by ID
   */
  public getReport(reportId: string): Report | null {
    return this.reports.get(reportId) || null
  }

  /**
   * Get reports by category
   */
  public getReportsByCategory(category: string): Report[] {
    return Array.from(this.reports.values()).filter(
      r => r.category === category
    )
  }

  /**
   * Get all templates
   */
  public getTemplates(): ReportTemplate[] {
    return Array.from(this.templates.values())
  }

  /**
   * Get templates by category
   */
  public getTemplatesByCategory(category: string): ReportTemplate[] {
    return Array.from(this.templates.values()).filter(
      t => t.category === category
    )
  }

  /**
   * Delete a report
   */
  public deleteReport(reportId: string): void {
    const report = this.reports.get(reportId)
    if (!report) {
      throw new Error(`Report not found: ${reportId}`)
    }

    this.reports.delete(reportId)
    console.log(`📋 Deleted report: ${report.name}`)
  }

  /**
   * Validate report configuration
   */
  public validateReport(reportId: string): {
    isValid: boolean
    errors: string[]
    warnings: string[]
  } {
    const report = this.reports.get(reportId)
    if (!report) {
      return {
        isValid: false,
        errors: ['Report not found'],
        warnings: [],
      }
    }

    const errors: string[] = []
    const warnings: string[] = []

    // Check if report has components
    if (report.components.length === 0) {
      errors.push('Report must have at least one component')
    }

    // Validate each component
    report.components.forEach((component, index) => {
      if (!component.config.title) {
        errors.push(`Component ${index + 1} must have a title`)
      }

      if (component.type === 'chart' && !component.config.chartType) {
        errors.push(`Chart component ${index + 1} must specify chart type`)
      }

      if (
        component.type === 'table' &&
        (!component.config.tableColumns ||
          component.config.tableColumns.length === 0)
      ) {
        errors.push(
          `Table component ${index + 1} must have at least one column`
        )
      }

      if (!component.dataSource.source) {
        errors.push(`Component ${index + 1} must have a data source`)
      }
    })

    // Check for layout issues
    const overlappingComponents = this.checkOverlappingComponents(
      report.components
    )
    if (overlappingComponents.length > 0) {
      warnings.push(
        `${overlappingComponents.length} components have overlapping layouts`
      )
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  // Private helper methods

  private async loadSystemTemplates(): Promise<void> {
    // Load system templates
    const systemTemplates: ReportTemplate[] = [
      {
        id: 'template_compliance_dashboard',
        name: 'Compliance Dashboard',
        description: 'Standard HACCP compliance dashboard template',
        category: 'compliance',
        template: this.createComplianceDashboardTemplate(),
        isSystem: true,
        usageCount: 0,
      },
      {
        id: 'template_temperature_report',
        name: 'Temperature Monitoring Report',
        description: 'Temperature monitoring and analysis report template',
        category: 'temperature',
        template: this.createTemperatureReportTemplate(),
        isSystem: true,
        usageCount: 0,
      },
      {
        id: 'template_executive_summary',
        name: 'Executive Summary',
        description: 'High-level executive summary report template',
        category: 'executive',
        template: this.createExecutiveSummaryTemplate(),
        isSystem: true,
        usageCount: 0,
      },
    ]

    systemTemplates.forEach(template => {
      this.templates.set(template.id, template)
    })

    console.log(`📋 Loaded ${systemTemplates.length} system templates`)
  }

  private createComplianceDashboardTemplate(): Report {
    const report = this.createReport(
      'Compliance Dashboard Template',
      'Standard HACCP compliance dashboard',
      'compliance',
      'system'
    )

    // Add KPI components
    this.addComponent(report.id, {
      type: 'kpi',
      config: {
        title: 'Overall Compliance Score',
        metricValue: 85,
        metricUnit: '%',
        kpiTarget: 90,
      },
      dataSource: {
        source: 'database',
        query: 'SELECT AVG(compliance_score) FROM compliance_metrics',
      },
      filters: [],
      layout: { x: 0, y: 0, width: 300, height: 150, zIndex: 1 },
      styling: {},
    })

    // Add chart component
    this.addComponent(report.id, {
      type: 'chart',
      config: {
        title: 'Compliance Trend',
        chartType: 'line',
        showLegend: true,
        showGrid: true,
      },
      dataSource: {
        source: 'database',
        query:
          'SELECT date, compliance_score FROM compliance_metrics ORDER BY date',
      },
      filters: [],
      layout: { x: 320, y: 0, width: 600, height: 300, zIndex: 1 },
      styling: {},
    })

    return report
  }

  private createTemperatureReportTemplate(): Report {
    const report = this.createReport(
      'Temperature Report Template',
      'Temperature monitoring and analysis report',
      'temperature',
      'system'
    )

    // Add temperature metrics
    this.addComponent(report.id, {
      type: 'metric',
      config: {
        title: 'Average Temperature',
        metricValue: 4.2,
        metricUnit: '°C',
      },
      dataSource: {
        source: 'database',
        query: 'SELECT AVG(temperature) FROM temperature_readings',
      },
      filters: [],
      layout: { x: 0, y: 0, width: 200, height: 100, zIndex: 1 },
      styling: {},
    })

    return report
  }

  private createExecutiveSummaryTemplate(): Report {
    const report = this.createReport(
      'Executive Summary Template',
      'High-level executive summary report',
      'executive',
      'system'
    )

    // Add summary text
    this.addComponent(report.id, {
      type: 'text',
      config: {
        title: 'Executive Summary',
        textContent:
          'This report provides a high-level overview of HACCP compliance and performance metrics.',
      },
      dataSource: {
        source: 'manual',
      },
      filters: [],
      layout: { x: 0, y: 0, width: 800, height: 200, zIndex: 1 },
      styling: {},
    })

    return report
  }

  private checkOverlappingComponents(components: ReportComponent[]): string[] {
    const overlapping: string[] = []

    for (let i = 0; i < components.length; i++) {
      for (let j = i + 1; j < components.length; j++) {
        const comp1 = components[i]
        const comp2 = components[j]

        if (this.componentsOverlap(comp1.layout, comp2.layout)) {
          overlapping.push(`${comp1.id} and ${comp2.id}`)
        }
      }
    }

    return overlapping
  }

  private componentsOverlap(
    layout1: LayoutConfig,
    layout2: LayoutConfig
  ): boolean {
    return !(
      layout1.x + layout1.width <= layout2.x ||
      layout2.x + layout2.width <= layout1.x ||
      layout1.y + layout1.height <= layout2.y ||
      layout2.y + layout2.height <= layout1.y
    )
  }

  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateComponentId(): string {
    return `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateFilterId(): string {
    return `filter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateTemplateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Export singleton instance
export const reportBuilder = new ReportBuilder()

export default reportBuilder
