/**
 * HACCP Report Generator
 * Generates compliance reports for health inspections and legal requirements
 */

import { jsPDF } from 'jspdf'
import { supabase } from '@/lib/supabase/client'

export interface HACCPReportConfig {
  companyId: string
  dateRange: {
    start: Date
    end: Date
  }
  reportType: 'inspection' | 'monthly' | 'quarterly' | 'custom'
  includeCharts: boolean
  language: 'it' | 'en'
  sections: {
    temperatureReadings: boolean
    maintenanceTasks: boolean
    staffTraining: boolean
    correctiveActions: boolean
    criticalControlPoints: boolean
  }
}

export interface HACCPReportData {
  company: {
    name: string
    address: string
    licenseNumber: string
    responsiblePerson: string
  }
  temperatureReadings: Array<{
    date: string
    location: string
    temperature: number
    operator: string
    compliance: boolean
  }>
  maintenanceTasks: Array<{
    date: string
    task: string
    equipment: string
    operator: string
    status: string
  }>
  criticalControlPoints: Array<{
    ccp: string
    criticalLimits: string
    monitoringProcedure: string
    complianceRate: number
  }>
  correctiveActions: Array<{
    date: string
    deviation: string
    action: string
    verificationResult: string
  }>
  staffTraining: Array<{
    date: string
    staff: string
    topic: string
    certification: boolean
  }>
}

class HACCPReportGenerator {
  private translations = {
    it: {
      title: 'RAPPORTO HACCP - SISTEMA AUTOCONTROLLO',
      company: 'Azienda',
      period: 'Periodo di Riferimento',
      temperatureReadings: 'Controlli Temperatura',
      maintenanceTasks: 'Manutenzioni',
      criticalControlPoints: 'Punti Critici di Controllo',
      correctiveActions: 'Azioni Correttive',
      staffTraining: 'Formazione del Personale',
      compliance: 'Conformità',
      nonCompliance: 'Non Conformità',
      date: 'Data',
      operator: 'Operatore',
      equipment: 'Attrezzatura',
      temperature: 'Temperatura',
      location: 'Postazione',
      status: 'Stato',
      completed: 'Completato',
      pending: 'In Sospeso',
      overdue: 'Scaduto',
    },
    en: {
      title: 'HACCP REPORT - FOOD SAFETY MANAGEMENT SYSTEM',
      company: 'Company',
      period: 'Reference Period',
      temperatureReadings: 'Temperature Controls',
      maintenanceTasks: 'Maintenance Tasks',
      criticalControlPoints: 'Critical Control Points',
      correctiveActions: 'Corrective Actions',
      staffTraining: 'Staff Training',
      compliance: 'Compliance',
      nonCompliance: 'Non-Compliance',
      date: 'Date',
      operator: 'Operator',
      equipment: 'Equipment',
      temperature: 'Temperature',
      location: 'Location',
      status: 'Status',
      completed: 'Completed',
      pending: 'Pending',
      overdue: 'Overdue',
    },
  }

  async generateReport(config: HACCPReportConfig): Promise<Blob> {
    console.log('[HACCP] Generating report with config:', config)

    // Fetch data from database
    const data = await this.fetchReportData(config)

    // Generate PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    await this.buildReport(pdf, data, config)

    // Return as blob
    const pdfBlob =
      pdf.output('blob') || new Blob([''], { type: 'application/pdf' })
    console.log('[HACCP] Report generated successfully')

    return pdfBlob
  }

  private async fetchReportData(
    config: HACCPReportConfig
  ): Promise<HACCPReportData> {
    const { companyId, dateRange } = config

    // Fetch company info
    const { data: company } = await supabase
      .from('companies')
      .select('name, address, license_number, responsible_person')
      .eq('id', companyId)
      .single()

    // Fetch temperature readings
    const { data: temperatureReadings } = await supabase
      .from('temperature_readings')
      .select(
        `
        recorded_at,
        temperature,
        notes,
        conservation_points(name),
        staff(name)
      `
      )
      .eq('company_id', companyId)
      .gte('recorded_at', dateRange.start.toISOString())
      .lte('recorded_at', dateRange.end.toISOString())
      .order('recorded_at', { ascending: false })

    // Fetch maintenance tasks
    const { data: maintenanceTasks } = await supabase
      .from('tasks')
      .select(
        `
        created_at,
        title,
        description,
        status,
        conservation_points(name),
        staff(name)
      `
      )
      .eq('company_id', companyId)
      .eq('type', 'maintenance')
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString())
      .order('created_at', { ascending: false })

    // Fetch critical control points data
    const { data: conservationPoints } = await supabase
      .from('conservation_points')
      .select(
        `
        name,
        temperature_min,
        temperature_max,
        tolerance_range,
        temperature_readings(temperature, recorded_at)
      `
      )
      .eq('company_id', companyId)

    // Process and structure data
    return {
      company: {
        name: company?.name || 'N/A',
        address: company?.address || 'N/A',
        licenseNumber: company?.license_number || 'N/A',
        responsiblePerson: company?.responsible_person || 'N/A',
      },
      temperatureReadings:
        temperatureReadings?.map(reading => ({
          date: new Date(reading.recorded_at).toLocaleDateString('it-IT'),
          location: reading.conservation_points?.name || 'N/A',
          temperature: reading.temperature,
          operator: reading.staff?.name || 'N/A',
          compliance: this.checkTemperatureCompliance(
            reading,
            conservationPoints
          ),
        })) || [],
      maintenanceTasks:
        maintenanceTasks?.map(task => ({
          date: new Date(task.created_at).toLocaleDateString('it-IT'),
          task: task.title,
          equipment: task.conservation_points?.name || 'N/A',
          operator: task.staff?.name || 'N/A',
          status: task.status,
        })) || [],
      criticalControlPoints:
        conservationPoints?.map(point => ({
          ccp: point.name,
          criticalLimits: `${point.temperature_min}°C - ${point.temperature_max}°C`,
          monitoringProcedure: 'Controllo temperatura ogni 4 ore',
          complianceRate: this.calculateComplianceRate(
            point.temperature_readings,
            point
          ),
        })) || [],
      correctiveActions: [], // TODO: Implement corrective actions tracking
      staffTraining: [], // TODO: Implement staff training tracking
    }
  }

  private checkTemperatureCompliance(
    reading: any,
    conservationPoints: any[]
  ): boolean {
    let point = conservationPoints?.find(
      p => p.name === reading.conservation_points?.name
    )
    if (!point && reading.conservation_point) {
      point = reading.conservation_point
    }
    if (!point) return false

    const temp = reading.temperature
    return temp >= point.temperature_min && temp <= point.temperature_max
  }

  private calculateComplianceRate(readings: any[], point: any): number {
    if (!readings || readings.length === 0) return 0

    const compliantReadings = readings.filter(
      reading =>
        reading.temperature >= point.temperature_min &&
        reading.temperature <= point.temperature_max
    )

    return Math.round((compliantReadings.length / readings.length) * 100)
  }

  private async buildReport(
    pdf: jsPDF,
    data: HACCPReportData,
    config: HACCPReportConfig
  ): Promise<void> {
    const t = this.translations[config.language]
    let currentY = 20

    // Header
    pdf.setFontSize(18)
    pdf.setFont('helvetica', 'bold')
    pdf.text(t.title, 20, currentY)
    currentY += 15

    // Company information
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`${t.company}: ${data.company.name}`, 20, currentY)
    currentY += 7
    pdf.text(`Indirizzo: ${data.company.address}`, 20, currentY)
    currentY += 7
    pdf.text(`Licenza: ${data.company.licenseNumber}`, 20, currentY)
    currentY += 7
    pdf.text(`Responsabile: ${data.company.responsiblePerson}`, 20, currentY)
    currentY += 15

    // Period
    pdf.text(
      `${t.period}: ${config.dateRange.start.toLocaleDateString('it-IT')} - ${config.dateRange.end.toLocaleDateString('it-IT')}`,
      20,
      currentY
    )
    currentY += 20

    // Temperature Readings Section
    if (
      config.sections.temperatureReadings &&
      data.temperatureReadings.length > 0
    ) {
      currentY = await this.addTemperatureSection(
        pdf,
        data.temperatureReadings,
        t,
        currentY
      )
    }

    // Maintenance Tasks Section
    if (config.sections.maintenanceTasks && data.maintenanceTasks.length > 0) {
      currentY = await this.addMaintenanceSection(
        pdf,
        data.maintenanceTasks,
        t,
        currentY
      )
    }

    // Critical Control Points Section
    if (
      config.sections.criticalControlPoints &&
      data.criticalControlPoints.length > 0
    ) {
      currentY = await this.addCriticalControlPointsSection(
        pdf,
        data.criticalControlPoints,
        t,
        currentY
      )
    }

    // Footer with signatures
    this.addFooter(pdf, data.company.responsiblePerson, config.dateRange.end)
  }

  private async addTemperatureSection(
    pdf: jsPDF,
    readings: any[],
    t: any,
    startY: number
  ): Promise<number> {
    let currentY = startY

    // Section title
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text(t.temperatureReadings, 20, currentY)
    currentY += 10

    // Table headers
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.text(t.date, 20, currentY)
    pdf.text(t.location, 60, currentY)
    pdf.text(t.temperature, 110, currentY)
    pdf.text(t.operator, 140, currentY)
    pdf.text(t.compliance, 170, currentY)
    currentY += 7

    // Table data
    pdf.setFont('helvetica', 'normal')
    for (const reading of readings.slice(0, 20)) {
      // Limit to 20 entries per page
      if (currentY > 270) {
        // New page if needed
        pdf.addPage()
        currentY = 20
      }

      pdf.text(reading.date, 20, currentY)
      pdf.text(reading.location, 60, currentY)
      pdf.text(`${reading.temperature}°C`, 110, currentY)
      pdf.text(reading.operator, 140, currentY)

      const isCompliant = reading.compliance ?? false
      if (isCompliant) {
        pdf.setTextColor(0, 128, 0) // Green
        pdf.text('✓', 170, currentY)
      } else {
        pdf.setTextColor(255, 0, 0) // Red
        pdf.text('✗', 170, currentY)
      }
      pdf.setTextColor(0, 0, 0) // Reset to black

      currentY += 5
    }

    return currentY + 15
  }

  private async addMaintenanceSection(
    pdf: jsPDF,
    tasks: any[],
    t: any,
    startY: number
  ): Promise<number> {
    let currentY = startY

    // Section title
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text(t.maintenanceTasks, 20, currentY)
    currentY += 10

    // Table headers
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.text(t.date, 20, currentY)
    pdf.text('Descrizione', 60, currentY)
    pdf.text(t.equipment, 120, currentY)
    pdf.text(t.status, 160, currentY)
    currentY += 7

    // Table data
    pdf.setFont('helvetica', 'normal')
    for (const task of tasks.slice(0, 15)) {
      if (currentY > 270) {
        pdf.addPage()
        currentY = 20
      }

      pdf.text(task.date, 20, currentY)
      pdf.text(task.task.substring(0, 25), 60, currentY)
      pdf.text(task.equipment, 120, currentY)

      // Status with color
      switch (task.status) {
        case 'completed':
          pdf.setTextColor(0, 128, 0)
          pdf.text(t.completed, 160, currentY)
          break
        case 'pending':
          pdf.setTextColor(255, 165, 0)
          pdf.text(t.pending, 160, currentY)
          break
        case 'overdue':
          pdf.setTextColor(255, 0, 0)
          pdf.text(t.overdue, 160, currentY)
          break
      }
      pdf.setTextColor(0, 0, 0)

      currentY += 5
    }

    return currentY + 15
  }

  private async addCriticalControlPointsSection(
    pdf: jsPDF,
    ccps: any[],
    t: any,
    startY: number
  ): Promise<number> {
    let currentY = startY

    // Section title
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text(t.criticalControlPoints, 20, currentY)
    currentY += 10

    // Table headers
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.text('CCP', 20, currentY)
    pdf.text('Limiti Critici', 60, currentY)
    pdf.text('Conformità %', 140, currentY)
    currentY += 7

    // Table data
    pdf.setFont('helvetica', 'normal')
    for (const ccp of ccps) {
      if (currentY > 270) {
        pdf.addPage()
        currentY = 20
      }

      pdf.text(ccp.ccp, 20, currentY)
      pdf.text(ccp.criticalLimits, 60, currentY)

      // Compliance rate with color
      const rate = ccp.complianceRate
      if (rate >= 95) {
        pdf.setTextColor(0, 128, 0)
      } else if (rate >= 80) {
        pdf.setTextColor(255, 165, 0)
      } else {
        pdf.setTextColor(255, 0, 0)
      }
      pdf.text(`${rate}%`, 140, currentY)
      pdf.setTextColor(0, 0, 0)

      currentY += 5
    }

    return currentY + 15
  }

  private addFooter(
    pdf: jsPDF,
    responsiblePerson: string,
    reportDate: Date
  ): void {
    const pageHeight = pdf.internal.pageSize.height
    const y = pageHeight - 40

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')

    // Report generation info
    pdf.text(
      `Rapporto generato il: ${reportDate.toLocaleDateString('it-IT')}`,
      20,
      y
    )
    pdf.text(`Sistema: HACCP Business Manager`, 20, y + 7)

    // Signature area
    pdf.text('Firma del Responsabile:', 20, y + 20)
    pdf.text(`${responsiblePerson}`, 80, y + 20)
    pdf.line(80, y + 22, 150, y + 22) // Signature line
  }

  async generateInspectionReport(
    companyId: string,
    inspectionDate: Date
  ): Promise<Blob> {
    const config: HACCPReportConfig = {
      companyId,
      dateRange: {
        start: new Date(inspectionDate.getTime() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        end: inspectionDate,
      },
      reportType: 'inspection',
      includeCharts: true,
      language: 'it',
      sections: {
        temperatureReadings: true,
        maintenanceTasks: true,
        staffTraining: true,
        correctiveActions: true,
        criticalControlPoints: true,
      },
    }

    return this.generateReport(config)
  }

  async generateMonthlyReport(
    companyId: string,
    month: number,
    year: number
  ): Promise<Blob> {
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0)

    const config: HACCPReportConfig = {
      companyId,
      dateRange: { start, end },
      reportType: 'monthly',
      includeCharts: true,
      language: 'it',
      sections: {
        temperatureReadings: true,
        maintenanceTasks: true,
        staffTraining: false,
        correctiveActions: true,
        criticalControlPoints: true,
      },
    }

    return this.generateReport(config)
  }
}

export const haccpReportGenerator = new HACCPReportGenerator()
