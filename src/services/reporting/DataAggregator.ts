/**
 * DataAggregator - B.10.2 Advanced Analytics & Reporting
 * Advanced data processing and aggregation for reports
 */

export interface AggregationConfig {
  groupBy: string[]
  aggregations: AggregationRule[]
  filters: FilterRule[]
  sortBy: SortRule[]
  limit?: number
  offset?: number
}

export interface AggregationRule {
  field: string
  operation: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'median' | 'stddev' | 'variance'
  alias?: string
}

export interface FilterRule {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in' | 'is_null' | 'is_not_null'
  value: any
  logicalOperator?: 'AND' | 'OR'
}

export interface SortRule {
  field: string
  direction: 'asc' | 'desc'
}

export interface AggregatedData {
  groups: Record<string, any>[]
  summary: Record<string, number>
  metadata: {
    totalRecords: number
    processingTime: number
    appliedFilters: number
    generatedAt: Date
  }
}

export interface DataSource {
  id: string
  name: string
  type: 'database' | 'api' | 'file' | 'manual'
  connection: any
  schema?: Record<string, any>
}

export interface QueryResult {
  data: any[]
  columns: string[]
  rowCount: number
  executionTime: number
  error?: string
}

/**
 * Data Aggregator Service for Report Data Processing
 */
export class DataAggregator {
  private dataSources: Map<string, DataSource> = new Map()
  private isInitialized = false

  /**
   * Initialize the data aggregator
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      await this.loadDataSources()
      console.log('📊 Data aggregator initialized - B.10.2 Advanced Analytics')
      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize data aggregator:', error)
      throw error
    }
  }

  /**
   * Aggregate data based on configuration
   */
  public async aggregateData(
    dataSourceId: string,
    config: AggregationConfig
  ): Promise<AggregatedData> {
    const startTime = Date.now()

    try {
      // Get data from source
      const rawData = await this.getDataFromSource(dataSourceId, config)
      
      // Apply filters
      const filteredData = this.applyFilters(rawData, config.filters)
      
      // Group data
      const groupedData = this.groupData(filteredData, config.groupBy)
      
      // Apply aggregations
      const aggregatedGroups = this.applyAggregations(groupedData, config.aggregations)
      
      // Sort results
      const sortedData = this.sortData(aggregatedGroups, config.sortBy)
      
      // Apply limit and offset
      const limitedData = this.applyLimitOffset(sortedData, config.limit, config.offset)
      
      // Calculate summary statistics
      const summary = this.calculateSummary(aggregatedGroups, config.aggregations)
      
      const processingTime = Date.now() - startTime
      
      return {
        groups: limitedData,
        summary,
        metadata: {
          totalRecords: rawData.length,
          processingTime,
          appliedFilters: config.filters.length,
          generatedAt: new Date()
        }
      }
      
    } catch (error) {
      console.error('Failed to aggregate data:', error)
      throw error
    }
  }

  /**
   * Execute custom query
   */
  public async executeQuery(
    dataSourceId: string,
    query: string,
    parameters?: Record<string, any>
  ): Promise<QueryResult> {
    const startTime = Date.now()
    
    try {
      const dataSource = this.dataSources.get(dataSourceId)
      if (!dataSource) {
        throw new Error(`Data source not found: ${dataSourceId}`)
      }

      let result: any[]
      
      switch (dataSource.type) {
        case 'database':
          result = await this.executeDatabaseQuery(dataSource, query, parameters)
          break
        case 'api':
          result = await this.executeApiQuery(dataSource, query, parameters)
          break
        case 'file':
          result = await this.executeFileQuery(dataSource, query, parameters)
          break
        default:
          throw new Error(`Unsupported data source type: ${dataSource.type}`)
      }

      const executionTime = Date.now() - startTime
      const columns = result.length > 0 ? Object.keys(result[0]) : []

      return {
        data: result,
        columns,
        rowCount: result.length,
        executionTime
      }
      
    } catch (error) {
      console.error('Failed to execute query:', error)
      return {
        data: [],
        columns: [],
        rowCount: 0,
        executionTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get data schema for a data source
   */
  public async getDataSourceSchema(dataSourceId: string): Promise<Record<string, any>> {
    const dataSource = this.dataSources.get(dataSourceId)
    if (!dataSource) {
      throw new Error(`Data source not found: ${dataSourceId}`)
    }

    if (dataSource.schema) {
      return dataSource.schema
    }

    // Generate schema from sample data
    const sampleData = await this.getSampleData(dataSourceId, 10)
    return this.generateSchemaFromData(sampleData)
  }

  /**
   * Add a new data source
   */
  public addDataSource(dataSource: DataSource): void {
    this.dataSources.set(dataSource.id, dataSource)
    console.log(`📊 Added data source: ${dataSource.name}`)
  }

  /**
   * Get all available data sources
   */
  public getDataSources(): DataSource[] {
    return Array.from(this.dataSources.values())
  }

  /**
   * Test data source connection
   */
  public async testDataSource(dataSourceId: string): Promise<{
    success: boolean
    message: string
    responseTime: number
  }> {
    const startTime = Date.now()
    
    try {
      const dataSource = this.dataSources.get(dataSourceId)
      if (!dataSource) {
        throw new Error(`Data source not found: ${dataSourceId}`)
      }

      // Test connection based on type
      switch (dataSource.type) {
        case 'database':
          await this.testDatabaseConnection(dataSource)
          break
        case 'api':
          await this.testApiConnection(dataSource)
          break
        case 'file':
          await this.testFileConnection(dataSource)
          break
        default:
          throw new Error(`Unsupported data source type: ${dataSource.type}`)
      }

      const responseTime = Date.now() - startTime
      return {
        success: true,
        message: 'Connection successful',
        responseTime
      }
      
    } catch (error) {
      const responseTime = Date.now() - startTime
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        responseTime
      }
    }
  }

  /**
   * Create aggregated dataset for charts
   */
  public async createChartDataset(
    dataSourceId: string,
    chartType: 'line' | 'bar' | 'pie' | 'area' | 'scatter',
    config: AggregationConfig
  ): Promise<{
    labels: string[]
    datasets: Array<{
      label: string
      data: number[]
      backgroundColor?: string[]
      borderColor?: string
      fill?: boolean
    }>
  }> {
    const aggregatedData = await this.aggregateData(dataSourceId, config)
    
    switch (chartType) {
      case 'line':
      case 'bar':
      case 'area':
        return this.createLineBarAreaDataset(aggregatedData, chartType)
      case 'pie':
        return this.createPieDataset(aggregatedData)
      case 'scatter':
        return this.createScatterDataset(aggregatedData)
      default:
        throw new Error(`Unsupported chart type: ${chartType}`)
    }
  }

  // Private helper methods

  private async loadDataSources(): Promise<void> {
    // Load default data sources
    const defaultSources: DataSource[] = [
      {
        id: 'haccp_database',
        name: 'HACCP Database',
        type: 'database',
        connection: { type: 'postgresql', host: 'localhost', database: 'haccp' },
        schema: {
          temperature_readings: {
            id: 'string',
            timestamp: 'datetime',
            temperature: 'number',
            conservation_point_id: 'string'
          },
          compliance_metrics: {
            id: 'string',
            date: 'date',
            compliance_score: 'number',
            company_id: 'string'
          }
        }
      },
      {
        id: 'api_external',
        name: 'External API',
        type: 'api',
        connection: { url: 'https://api.example.com', auth: 'bearer' }
      }
    ]

    defaultSources.forEach(source => {
      this.dataSources.set(source.id, source)
    })

    console.log(`📊 Loaded ${defaultSources.length} default data sources`)
  }

  private async getDataFromSource(
    dataSourceId: string,
    config: AggregationConfig
  ): Promise<any[]> {
    // Mock implementation - would query actual data source
    return this.generateMockData(100)
  }

  private generateMockData(count: number): any[] {
    const data: any[] = []
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    
    for (let i = 0; i < count; i++) {
      data.push({
        id: `record_${i}`,
        timestamp: new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000),
        temperature: 4.0 + Math.sin(i / 10) * 2 + Math.random() * 0.5,
        conservation_point_id: `CP${String(Math.floor(i / 10) + 1).padStart(3, '0')}`,
        compliance_score: 75 + Math.sin(i / 15) * 15 + Math.random() * 10,
        company_id: `COMPANY_${Math.floor(i / 50) + 1}`,
        department_id: `DEPT_${Math.floor(i / 25) + 1}`
      })
    }
    
    return data
  }

  private applyFilters(data: any[], filters: FilterRule[]): any[] {
    if (filters.length === 0) return data

    return data.filter(item => {
      return filters.every(filter => {
        const value = this.getNestedValue(item, filter.field)
        return this.evaluateFilter(value, filter.operator, filter.value)
      })
    })
  }

  private evaluateFilter(value: any, operator: string, filterValue: any): boolean {
    switch (operator) {
      case 'equals':
        return value === filterValue
      case 'not_equals':
        return value !== filterValue
      case 'contains':
        return String(value).toLowerCase().includes(String(filterValue).toLowerCase())
      case 'not_contains':
        return !String(value).toLowerCase().includes(String(filterValue).toLowerCase())
      case 'greater_than':
        return Number(value) > Number(filterValue)
      case 'less_than':
        return Number(value) < Number(filterValue)
      case 'between':
        return Number(value) >= Number(filterValue[0]) && Number(value) <= Number(filterValue[1])
      case 'in':
        return Array.isArray(filterValue) && filterValue.includes(value)
      case 'not_in':
        return Array.isArray(filterValue) && !filterValue.includes(value)
      case 'is_null':
        return value === null || value === undefined
      case 'is_not_null':
        return value !== null && value !== undefined
      default:
        return true
    }
  }

  private groupData(data: any[], groupBy: string[]): Map<string, any[]> {
    const groups = new Map<string, any[]>()
    
    data.forEach(item => {
      const groupKey = groupBy.map(field => this.getNestedValue(item, field)).join('|')
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, [])
      }
      groups.get(groupKey)!.push(item)
    })
    
    return groups
  }

  private applyAggregations(
    groupedData: Map<string, any[]>,
    aggregations: AggregationRule[]
  ): Record<string, any>[] {
    const result: Record<string, any>[] = []
    
    groupedData.forEach((items, groupKey) => {
      const groupValues = groupKey.split('|')
      const groupByFields = this.getGroupByFields(aggregations)
      
      const record: Record<string, any> = {}
      
      // Add group values
      groupByFields.forEach((field, index) => {
        record[field] = groupValues[index]
      })
      
      // Add aggregated values
      aggregations.forEach(aggregation => {
        const values = items.map(item => this.getNestedValue(item, aggregation.field))
        const aggregatedValue = this.performAggregation(values, aggregation.operation)
        record[aggregation.alias || `${aggregation.field}_${aggregation.operation}`] = aggregatedValue
      })
      
      result.push(record)
    })
    
    return result
  }

  private performAggregation(values: any[], operation: string): number {
    const numericValues = values.map(v => Number(v)).filter(v => !isNaN(v))
    
    switch (operation) {
      case 'sum':
        return numericValues.reduce((sum, val) => sum + val, 0)
      case 'avg':
        return numericValues.length > 0 ? numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length : 0
      case 'count':
        return values.length
      case 'min':
        return numericValues.length > 0 ? Math.min(...numericValues) : 0
      case 'max':
        return numericValues.length > 0 ? Math.max(...numericValues) : 0
      case 'median':
        return this.calculateMedian(numericValues)
      case 'stddev':
        return this.calculateStandardDeviation(numericValues)
      case 'variance':
        return this.calculateVariance(numericValues)
      default:
        return 0
    }
  }

  private calculateMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
  }

  private calculateStandardDeviation(values: number[]): number {
    if (values.length === 0) return 0
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    return Math.sqrt(variance)
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  }

  private sortData(data: Record<string, any>[], sortBy: SortRule[]): Record<string, any>[] {
    if (sortBy.length === 0) return data

    return [...data].sort((a, b) => {
      for (const sort of sortBy) {
        const aVal = this.getNestedValue(a, sort.field)
        const bVal = this.getNestedValue(b, sort.field)
        
        if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }

  private applyLimitOffset(data: any[], limit?: number, offset?: number): any[] {
    const start = offset || 0
    const end = limit ? start + limit : data.length
    return data.slice(start, end)
  }

  private calculateSummary(
    data: Record<string, any>[],
    aggregations: AggregationRule[]
  ): Record<string, number> {
    const summary: Record<string, number> = {}
    
    aggregations.forEach(aggregation => {
      const alias = aggregation.alias || `${aggregation.field}_${aggregation.operation}`
      const values = data.map(item => item[alias]).filter(v => typeof v === 'number')
      
      if (values.length > 0) {
        summary[`total_${alias}`] = values.reduce((sum, val) => sum + val, 0)
        summary[`avg_${alias}`] = values.reduce((sum, val) => sum + val, 0) / values.length
        summary[`min_${alias}`] = Math.min(...values)
        summary[`max_${alias}`] = Math.max(...values)
      }
    })
    
    return summary
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  private getGroupByFields(aggregations: AggregationRule[]): string[] {
    // This would be determined from the aggregation configuration
    return ['timestamp', 'conservation_point_id']
  }

  private async executeDatabaseQuery(
    dataSource: DataSource,
    query: string,
    parameters?: Record<string, any>
  ): Promise<any[]> {
    // Mock implementation - would execute actual database query
    return this.generateMockData(50)
  }

  private async executeApiQuery(
    dataSource: DataSource,
    query: string,
    parameters?: Record<string, any>
  ): Promise<any[]> {
    // Mock implementation - would make API call
    return this.generateMockData(25)
  }

  private async executeFileQuery(
    dataSource: DataSource,
    query: string,
    parameters?: Record<string, any>
  ): Promise<any[]> {
    // Mock implementation - would read from file
    return this.generateMockData(30)
  }

  private async getSampleData(dataSourceId: string, limit: number): Promise<any[]> {
    return this.generateMockData(limit)
  }

  private generateSchemaFromData(data: any[]): Record<string, any> {
    if (data.length === 0) return {}
    
    const schema: Record<string, any> = {}
    const firstItem = data[0]
    
    Object.keys(firstItem).forEach(key => {
      const value = firstItem[key]
      schema[key] = this.inferType(value)
    })
    
    return schema
  }

  private inferType(value: any): string {
    if (typeof value === 'number') return 'number'
    if (typeof value === 'boolean') return 'boolean'
    if (value instanceof Date) return 'datetime'
    return 'string'
  }

  private async testDatabaseConnection(dataSource: DataSource): Promise<void> {
    // Mock implementation - would test actual database connection
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  private async testApiConnection(dataSource: DataSource): Promise<void> {
    // Mock implementation - would test API connection
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  private async testFileConnection(dataSource: DataSource): Promise<void> {
    // Mock implementation - would test file access
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  private createLineBarAreaDataset(
    aggregatedData: AggregatedData,
    chartType: string
  ): { labels: string[], datasets: any[] } {
    const labels = aggregatedData.groups.map(item => item.timestamp || item.id)
    const datasets = [{
      label: 'Data',
      data: aggregatedData.groups.map(item => Object.values(item).find(v => typeof v === 'number') || 0),
      backgroundColor: chartType === 'bar' ? 'rgba(54, 162, 235, 0.6)' : undefined,
      borderColor: 'rgba(54, 162, 235, 1)',
      fill: chartType === 'area'
    }]
    
    return { labels, datasets }
  }

  private createPieDataset(aggregatedData: AggregatedData): { labels: string[], datasets: any[] } {
    const labels = aggregatedData.groups.map(item => item.conservation_point_id || item.id)
    const data = aggregatedData.groups.map(item => Object.values(item).find(v => typeof v === 'number') || 0)
    
    return {
      labels,
      datasets: [{
        data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 205, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ]
      }]
    }
  }

  private createScatterDataset(aggregatedData: AggregatedData): { labels: string[], datasets: any[] } {
    const data = aggregatedData.groups.map(item => ({
      x: Object.values(item)[0] || 0,
      y: Object.values(item)[1] || 0
    }))
    
    return {
      labels: [],
      datasets: [{
        label: 'Scatter Data',
        data,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)'
      }]
    }
  }
}

// Export singleton instance
export const dataAggregator = new DataAggregator()

export default dataAggregator
