/**
 * Excel Exporter for HACCP Data
 * Advanced Excel generation with charts and formulas
 */

import * as XLSX from 'xlsx'
import { supabase } from '@/lib/supabase/client'

export interface ExcelExportConfig {
  companyId: string
  dateRange: {
    start: Date
    end: Date
  }
  tables: Array<
    'temperature_readings' | 'tasks' | 'products' | 'staff' | 'departments'
  >
  includeCharts: boolean
  format: 'xlsx' | 'csv'
  fileName?: string
}

export interface ExportData {
  temperatureReadings?: any[]
  tasks?: any[]
  products?: any[]
  staff?: any[]
  departments?: any[]
  summary?: {
    totalReadings: number
    complianceRate: number
    completedTasks: number
    overdueItems: number
  }
}

class ExcelExporter {
  async exportData(config: ExcelExportConfig): Promise<Blob> {
    console.log('[Excel] Starting export with config:', config)

    // Fetch data from database
    const data = await this.fetchExportData(config)

    // Create workbook
    const workbook = XLSX.utils.book_new()

    // Add worksheets based on requested tables
    if (
      config.tables.includes('temperature_readings') &&
      data.temperatureReadings
    ) {
      this.addTemperatureSheet(workbook, data.temperatureReadings)
    }

    if (config.tables.includes('tasks') && data.tasks) {
      this.addTasksSheet(workbook, data.tasks)
    }

    if (config.tables.includes('products') && data.products) {
      this.addProductsSheet(workbook, data.products)
    }

    if (config.tables.includes('staff') && data.staff) {
      this.addStaffSheet(workbook, data.staff)
    }

    if (config.tables.includes('departments') && data.departments) {
      this.addDepartmentsSheet(workbook, data.departments)
    }

    // Add summary sheet
    if (data.summary) {
      this.addSummarySheet(workbook, data.summary, config.dateRange)
    }

    // Generate file
    const fileName =
      config.fileName ||
      `HACCP_Export_${new Date().toISOString().split('T')[0]}`

    if (config.format === 'csv') {
      // For CSV, export only the first sheet
      const sheetName = workbook.SheetNames[0]
      const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName])
      return new Blob([csv], { type: 'text/csv' })
    } else {
      // Export as Excel
      const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      return new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
    }
  }

  private async fetchExportData(
    config: ExcelExportConfig
  ): Promise<ExportData> {
    const { companyId, dateRange, tables } = config
    const data: ExportData = {}

    // Fetch temperature readings
    if (tables.includes('temperature_readings')) {
      const { data: temperatureReadings } = await supabase
        .from('temperature_readings')
        .select(
          `
          id,
          temperature,
          recorded_at,
          notes,
          conservation_points!inner(name, temperature_min, temperature_max),
          staff!inner(name, email)
        `
        )
        .eq('company_id', companyId)
        .gte('recorded_at', dateRange.start.toISOString())
        .lte('recorded_at', dateRange.end.toISOString())
        .order('recorded_at', { ascending: false })

      data.temperatureReadings =
        temperatureReadings?.map(reading => ({
          ID: reading.id,
          'Data/Ora': new Date(reading.recorded_at).toLocaleString('it-IT'),
          Postazione: reading.conservation_points?.name,
          'Temperatura (°C)': reading.temperature,
          'Min Consentita': reading.conservation_points?.temperature_min,
          'Max Consentita': reading.conservation_points?.temperature_max,
          Conforme:
            reading.temperature >=
              reading.conservation_points?.temperature_min &&
            reading.temperature <= reading.conservation_points?.temperature_max
              ? 'Sì'
              : 'No',
          Operatore: reading.staff?.name,
          Note: reading.notes || '',
        })) || []
    }

    // Fetch tasks
    if (tables.includes('tasks')) {
      const { data: tasks } = await supabase
        .from('tasks')
        .select(
          `
          id,
          title,
          description,
          type,
          status,
          priority,
          due_date,
          created_at,
          completed_at,
          conservation_points(name),
          staff!tasks_assigned_to_fkey(name),
          departments(name)
        `
        )
        .eq('company_id', companyId)
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString())
        .order('created_at', { ascending: false })

      data.tasks =
        tasks?.map(task => ({
          ID: task.id,
          Titolo: task.title,
          Descrizione: task.description,
          Tipo: task.type,
          Stato: task.status,
          Priorità: task.priority,
          'Data Creazione': new Date(task.created_at).toLocaleDateString(
            'it-IT'
          ),
          'Data Scadenza': task.due_date
            ? new Date(task.due_date).toLocaleDateString('it-IT')
            : '',
          'Data Completamento': task.completed_at
            ? new Date(task.completed_at).toLocaleDateString('it-IT')
            : '',
          Postazione: task.conservation_points?.name || '',
          'Assegnato a': task.staff?.name || '',
          Dipartimento: task.departments?.name || '',
        })) || []
    }

    // Fetch products
    if (tables.includes('products')) {
      const { data: products } = await supabase
        .from('products')
        .select(
          `
          id,
          name,
          code,
          quantity,
          unit,
          expiry_date,
          supplier,
          storage_location,
          category,
          allergens,
          product_categories(name)
        `
        )
        .eq('company_id', companyId)
        .order('name', { ascending: true })

      data.products =
        products?.map(product => ({
          ID: product.id,
          Nome: product.name,
          Codice: product.code,
          Quantità: product.quantity,
          Unità: product.unit,
          'Data Scadenza': product.expiry_date
            ? new Date(product.expiry_date).toLocaleDateString('it-IT')
            : '',
          Fornitore: product.supplier || '',
          Posizione: product.storage_location || '',
          Categoria: product.product_categories?.name || product.category,
          Allergeni: Array.isArray(product.allergens)
            ? product.allergens.join(', ')
            : '',
        })) || []
    }

    // Fetch staff
    if (tables.includes('staff')) {
      const { data: staff } = await supabase
        .from('staff')
        .select(
          `
          id,
          name,
          email,
          role,
          category,
          hire_date,
          haccp_certification_date,
          departments(name)
        `
        )
        .eq('company_id', companyId)
        .order('name', { ascending: true })

      data.staff =
        staff?.map(member => ({
          ID: member.id,
          Nome: member.name,
          Email: member.email,
          Ruolo: member.role,
          Categoria: member.category,
          'Data Assunzione': member.hire_date
            ? new Date(member.hire_date).toLocaleDateString('it-IT')
            : '',
          'Certificazione HACCP': member.haccp_certification_date
            ? new Date(member.haccp_certification_date).toLocaleDateString(
                'it-IT'
              )
            : '',
          Dipartimento: member.departments?.name || '',
        })) || []
    }

    // Fetch departments
    if (tables.includes('departments')) {
      const { data: departments } = await supabase
        .from('departments')
        .select(
          `
          id,
          name,
          description,
          manager_id,
          staff(name)
        `
        )
        .eq('company_id', companyId)
        .order('name', { ascending: true })

      data.departments =
        departments?.map(dept => ({
          ID: dept.id,
          Nome: dept.name,
          Descrizione: dept.description || '',
          Responsabile: dept.staff?.name || '',
        })) || []
    }

    // Calculate summary data
    data.summary = await this.calculateSummary(companyId, dateRange)

    return data
  }

  private async calculateSummary(
    companyId: string,
    dateRange: { start: Date; end: Date }
  ) {
    // Get temperature readings count and compliance
    const { data: tempReadings, count: totalReadings } = await supabase
      .from('temperature_readings')
      .select(
        'temperature, conservation_points(temperature_min, temperature_max)',
        { count: 'exact' }
      )
      .eq('company_id', companyId)
      .gte('recorded_at', dateRange.start.toISOString())
      .lte('recorded_at', dateRange.end.toISOString())

    let compliantReadings = 0
    if (tempReadings) {
      compliantReadings = tempReadings.filter(reading => {
        const point = reading.conservation_points
        return (
          point &&
          reading.temperature >= point.temperature_min &&
          reading.temperature <= point.temperature_max
        )
      }).length
    }

    const complianceRate = totalReadings
      ? Math.round((compliantReadings / totalReadings) * 100)
      : 0

    // Get tasks status
    const { count: completedTasks } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'completed')
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString())

    const { count: overdueTasks } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'overdue')
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString())

    return {
      totalReadings: totalReadings || 0,
      complianceRate,
      completedTasks: completedTasks || 0,
      overdueItems: overdueTasks || 0,
    }
  }

  private addTemperatureSheet(workbook: XLSX.WorkBook, data: any[]): void {
    const worksheet = XLSX.utils.json_to_sheet(data)

    // Add styling and formatting
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')

    // Header styling (first row)
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: col })
      if (!worksheet[cellRef]) continue

      worksheet[cellRef].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '366092' } },
        alignment: { horizontal: 'center' },
      }
    }

    // Conditional formatting for compliance column
    for (let row = 1; row <= range.e.r; row++) {
      const complianceCol = this.findColumnIndex(data[0], 'Conforme')
      if (complianceCol >= 0) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: complianceCol })
        if (worksheet[cellRef] && worksheet[cellRef].v === 'No') {
          worksheet[cellRef].s = {
            fill: { fgColor: { rgb: 'FFE6E6' } },
            font: { color: { rgb: 'CC0000' } },
          }
        } else if (worksheet[cellRef] && worksheet[cellRef].v === 'Sì') {
          worksheet[cellRef].s = {
            fill: { fgColor: { rgb: 'E6FFE6' } },
            font: { color: { rgb: '006600' } },
          }
        }
      }
    }

    // Auto-size columns
    const cols = Object.keys(data[0] || {}).map(key => ({
      wch: Math.max(key.length, 15),
    }))
    worksheet['!cols'] = cols

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Controlli Temperatura')
  }

  private addTasksSheet(workbook: XLSX.WorkBook, data: any[]): void {
    const worksheet = XLSX.utils.json_to_sheet(data)

    // Add conditional formatting for status
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
    const statusCol = this.findColumnIndex(data[0], 'Stato')

    if (statusCol >= 0) {
      for (let row = 1; row <= range.e.r; row++) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: statusCol })
        if (!worksheet[cellRef]) continue

        const status = worksheet[cellRef].v
        switch (status) {
          case 'completed':
            worksheet[cellRef].s = { fill: { fgColor: { rgb: 'E6FFE6' } } }
            break
          case 'overdue':
            worksheet[cellRef].s = { fill: { fgColor: { rgb: 'FFE6E6' } } }
            break
          case 'pending':
            worksheet[cellRef].s = { fill: { fgColor: { rgb: 'FFF2E6' } } }
            break
        }
      }
    }

    const cols = Object.keys(data[0] || {}).map(key => ({
      wch: Math.max(key.length, 12),
    }))
    worksheet['!cols'] = cols

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attività')
  }

  private addProductsSheet(workbook: XLSX.WorkBook, data: any[]): void {
    const worksheet = XLSX.utils.json_to_sheet(data)

    // Add expiry date highlighting
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
    const expiryCol = this.findColumnIndex(data[0], 'Data Scadenza')

    if (expiryCol >= 0) {
      const today = new Date()
      const threeDaysFromNow = new Date(
        today.getTime() + 3 * 24 * 60 * 60 * 1000
      )

      for (let row = 1; row <= range.e.r; row++) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: expiryCol })
        if (!worksheet[cellRef] || !worksheet[cellRef].v) continue

        const expiryDate = new Date(worksheet[cellRef].v)
        if (expiryDate <= today) {
          worksheet[cellRef].s = {
            fill: { fgColor: { rgb: 'FF0000' } },
            font: { color: { rgb: 'FFFFFF' } },
          }
        } else if (expiryDate <= threeDaysFromNow) {
          worksheet[cellRef].s = { fill: { fgColor: { rgb: 'FFA500' } } }
        }
      }
    }

    const cols = Object.keys(data[0] || {}).map(key => ({
      wch: Math.max(key.length, 12),
    }))
    worksheet['!cols'] = cols

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Prodotti')
  }

  private addStaffSheet(workbook: XLSX.WorkBook, data: any[]): void {
    const worksheet = XLSX.utils.json_to_sheet(data)

    const cols = Object.keys(data[0] || {}).map(key => ({
      wch: Math.max(key.length, 15),
    }))
    worksheet['!cols'] = cols

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Personale')
  }

  private addDepartmentsSheet(workbook: XLSX.WorkBook, data: any[]): void {
    const worksheet = XLSX.utils.json_to_sheet(data)

    const cols = Object.keys(data[0] || {}).map(key => ({
      wch: Math.max(key.length, 15),
    }))
    worksheet['!cols'] = cols

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dipartimenti')
  }

  private addSummarySheet(
    workbook: XLSX.WorkBook,
    summary: any,
    dateRange: { start: Date; end: Date }
  ): void {
    const summaryData = [
      ['RIEPILOGO ESPORTAZIONE'],
      [''],
      [
        'Periodo:',
        `${dateRange.start.toLocaleDateString('it-IT')} - ${dateRange.end.toLocaleDateString('it-IT')}`,
      ],
      [''],
      ['METRICHE PRINCIPALI'],
      ['Controlli Temperatura Totali:', summary.totalReadings],
      ['Tasso di Conformità (%):', `${summary.complianceRate}%`],
      ['Attività Completate:', summary.completedTasks],
      ['Elementi in Ritardo:', summary.overdueItems],
      [''],
      ['VALUTAZIONE COMPLESSIVA'],
      [
        'Stato Conformità:',
        summary.complianceRate >= 95
          ? 'ECCELLENTE'
          : summary.complianceRate >= 80
            ? 'BUONO'
            : 'MIGLIORABILE',
      ],
      [''],
      ['Generato il:', new Date().toLocaleString('it-IT')],
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(summaryData)

    // Style the summary sheet
    worksheet['A1'].s = {
      font: { bold: true, size: 16 },
      alignment: { horizontal: 'center' },
    }

    worksheet['A5'].s = { font: { bold: true } }
    worksheet['A11'].s = { font: { bold: true } }

    // Merge title cell
    worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }]

    const cols = [{ wch: 25 }, { wch: 20 }]
    worksheet['!cols'] = cols

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Riepilogo')
  }

  private findColumnIndex(sampleRow: any, columnName: string): number {
    const keys = Object.keys(sampleRow || {})
    return keys.findIndex(key => key === columnName)
  }

  // Quick export methods
  async exportTemperatureReadings(
    companyId: string,
    dateRange: { start: Date; end: Date }
  ): Promise<Blob> {
    return this.exportData({
      companyId,
      dateRange,
      tables: ['temperature_readings'],
      includeCharts: false,
      format: 'xlsx',
      fileName: `Temperature_Readings_${dateRange.start.toISOString().split('T')[0]}`,
    })
  }

  async exportAllData(
    companyId: string,
    dateRange: { start: Date; end: Date }
  ): Promise<Blob> {
    return this.exportData({
      companyId,
      dateRange,
      tables: [
        'temperature_readings',
        'tasks',
        'products',
        'staff',
        'departments',
      ],
      includeCharts: true,
      format: 'xlsx',
      fileName: `HACCP_Complete_Export_${dateRange.start.toISOString().split('T')[0]}`,
    })
  }

  async exportCSV(
    companyId: string,
    table: any,
    dateRange: { start: Date; end: Date }
  ): Promise<Blob> {
    return this.exportData({
      companyId,
      dateRange,
      tables: [table],
      includeCharts: false,
      format: 'csv',
      fileName: `${table}_${dateRange.start.toISOString().split('T')[0]}`,
    })
  }
}

export const excelExporter = new ExcelExporter()
