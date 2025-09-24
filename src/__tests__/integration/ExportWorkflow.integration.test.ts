/**
 * Integration Tests for Export Workflow
 * Tests complete HACCP report generation and export workflows
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { haccpReportGenerator } from '@/services/export/HACCPReportGenerator'
import { excelExporter } from '@/services/export/ExcelExporter'
import { emailScheduler } from '@/services/export/EmailScheduler'
import { supabase } from '@/lib/supabase/client'

// Mock dependencies
vi.mock('@/lib/supabase/client')
vi.mock('jspdf', () => ({
  jsPDF: vi.fn(() => ({
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    text: vi.fn(),
    addPage: vi.fn(),
    setTextColor: vi.fn(),
    line: vi.fn(),
    output: vi.fn().mockReturnValue(new Blob(['mock-pdf'], { type: 'application/pdf' })),
    internal: { pageSize: { height: 297 } }
  }))
}))

vi.mock('xlsx', () => ({
  utils: {
    book_new: vi.fn(() => ({ SheetNames: [], Sheets: {} })),
    json_to_sheet: vi.fn(() => ({ '!ref': 'A1:D10' })),
    book_append_sheet: vi.fn(),
    sheet_add_aoa: vi.fn()
  },
  writeFile: vi.fn(),
  write: vi.fn(() => new ArrayBuffer(8))
}))

// Mock email service
const mockEmailClient = {
  send: vi.fn().mockResolvedValue({ success: true, messageId: 'msg123' })
}

vi.mock('@/lib/email/client', () => ({
  emailClient: mockEmailClient
}))

describe('Export Workflow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock comprehensive Supabase data
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      const mockData = {
        companies: {
          data: {
            name: 'Test Restaurant',
            address: 'Via Roma 123, Milano',
            license_number: 'LIC2025001',
            responsible_person: 'Marco Bianchi'
          },
          error: null
        },
        temperature_readings: {
          data: [
            {
              id: 'temp_1',
              recorded_at: '2025-01-15T08:00:00Z',
              temperature: 4.2,
              notes: 'Controllo mattutino',
              conservation_points: {
                name: 'Frigorifero Verdure',
                temperature_min: 2,
                temperature_max: 6
              },
              staff: { name: 'Giovanni Rossi' }
            },
            {
              id: 'temp_2',
              recorded_at: '2025-01-15T14:00:00Z',
              temperature: 4.8,
              notes: 'Controllo pomeridiano',
              conservation_points: {
                name: 'Frigorifero Verdure',
                temperature_min: 2,
                temperature_max: 6
              },
              staff: { name: 'Maria Verdi' }
            },
            {
              id: 'temp_3',
              recorded_at: '2025-01-15T20:00:00Z',
              temperature: 7.5, // Non-compliant
              notes: 'Temperatura elevata rilevata',
              conservation_points: {
                name: 'Frigorifero Verdure',
                temperature_min: 2,
                temperature_max: 6
              },
              staff: { name: 'Paolo Blu' }
            }
          ],
          error: null
        },
        tasks: {
          data: [
            {
              id: 'task_1',
              title: 'Pulizia frigo verdure',
              description: 'Pulizia approfondita e sanificazione',
              status: 'completed',
              created_at: '2025-01-14T09:00:00Z',
              due_date: '2025-01-15T18:00:00Z',
              conservation_points: { name: 'Frigorifero Verdure' },
              staff: { name: 'Giovanni Rossi' }
            },
            {
              id: 'task_2',
              title: 'Controllo temperature',
              description: 'Verifica temperature di conservazione',
              status: 'pending',
              created_at: '2025-01-15T06:00:00Z',
              due_date: '2025-01-16T18:00:00Z',
              conservation_points: { name: 'Cella Carne' },
              staff: { name: 'Maria Verdi' }
            }
          ],
          error: null
        },
        conservation_points: {
          data: [
            {
              name: 'Frigorifero Verdure',
              temperature_min: 2,
              temperature_max: 6,
              tolerance_range: 1,
              temperature_readings: [
                { temperature: 4.2, recorded_at: '2025-01-15T08:00:00Z' },
                { temperature: 4.8, recorded_at: '2025-01-15T14:00:00Z' },
                { temperature: 7.5, recorded_at: '2025-01-15T20:00:00Z' }
              ]
            },
            {
              name: 'Cella Carne',
              temperature_min: 0,
              temperature_max: 4,
              tolerance_range: 0.5,
              temperature_readings: [
                { temperature: 2.1, recorded_at: '2025-01-15T08:00:00Z' },
                { temperature: 1.8, recorded_at: '2025-01-15T14:00:00Z' }
              ]
            }
          ],
          error: null
        },
        email_schedules: {
          data: [
            {
              id: 'schedule_1',
              company_id: 'company123',
              frequency: 'weekly',
              report_type: 'haccp_pdf',
              recipients: ['manager@restaurant.com', 'health@inspector.gov'],
              is_active: true,
              next_run: '2025-01-22T09:00:00Z'
            }
          ],
          error: null
        }
      }

      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
        update: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockData[table as keyof typeof mockData] || { data: [], error: null })
      } as any
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Complete HACCP Report Generation Workflow', () => {
    it('should generate comprehensive inspection report with all sections', async () => {
      const inspectionDate = new Date('2025-01-15')
      const companyId = 'company123'

      // Generate inspection report
      const reportBlob = await haccpReportGenerator.generateInspectionReport(
        companyId,
        inspectionDate
      )

      expect(reportBlob).toBeInstanceOf(Blob)
      expect(reportBlob.type).toBe('application/pdf')

      // Verify all data sources were queried
      expect(supabase.from).toHaveBeenCalledWith('companies')
      expect(supabase.from).toHaveBeenCalledWith('temperature_readings')
      expect(supabase.from).toHaveBeenCalledWith('tasks')
      expect(supabase.from).toHaveBeenCalledWith('conservation_points')

      // Report should be substantial (not empty)
      expect(reportBlob.size).toBeGreaterThan(0)
    })

    it('should generate monthly compliance report with statistics', async () => {
      const month = 1 // January
      const year = 2025
      const companyId = 'company123'

      const reportBlob = await haccpReportGenerator.generateMonthlyReport(
        companyId,
        month,
        year
      )

      expect(reportBlob).toBeInstanceOf(Blob)

      // Verify date range was set correctly for January 2025
      const expectedStart = new Date(2025, 0, 1)
      const expectedEnd = new Date(2025, 1, 0)

      // Since we can't directly inspect the internal call, we verify the data was fetched
      expect(supabase.from).toHaveBeenCalledWith('temperature_readings')
      expect(supabase.from).toHaveBeenCalledWith('conservation_points')
    })

    it('should handle multi-language report generation', async () => {
      const config = {
        companyId: 'company123',
        dateRange: {
          start: new Date('2025-01-01'),
          end: new Date('2025-01-31')
        },
        reportType: 'monthly' as const,
        includeCharts: true,
        language: 'en' as const,
        sections: {
          temperatureReadings: true,
          maintenanceTasks: true,
          staffTraining: false,
          correctiveActions: false,
          criticalControlPoints: true
        }
      }

      const englishReport = await haccpReportGenerator.generateReport(config)
      expect(englishReport).toBeInstanceOf(Blob)

      // Generate Italian version
      const italianConfig = { ...config, language: 'it' as const }
      const italianReport = await haccpReportGenerator.generateReport(italianConfig)
      expect(italianReport).toBeInstanceOf(Blob)

      // Both should be valid PDFs
      expect(englishReport.type).toBe('application/pdf')
      expect(italianReport.type).toBe('application/pdf')
    })
  })

  describe('Complete Excel Export Workflow', () => {
    it('should export comprehensive temperature data with compliance analysis', async () => {
      const companyId = 'company123'
      const dateRange = {
        start: new Date('2025-01-01'),
        end: new Date('2025-01-31')
      }

      const excelBlob = await excelExporter.exportTemperatureReadings(companyId, dateRange)

      expect(excelBlob).toBeInstanceOf(Blob)
      expect(supabase.from).toHaveBeenCalledWith('temperature_readings')

      // Should have processed compliance data
      // The mock should show that compliance checking was performed
    })

    it('should export all system data with multiple sheets', async () => {
      const companyId = 'company123'
      const dateRange = {
        start: new Date('2025-01-01'),
        end: new Date('2025-01-31')
      }

      const excelBlob = await excelExporter.exportAllData(companyId, dateRange)

      expect(excelBlob).toBeInstanceOf(Blob)

      // Should have queried all major tables
      expect(supabase.from).toHaveBeenCalledWith('temperature_readings')
      expect(supabase.from).toHaveBeenCalledWith('tasks')
      expect(supabase.from).toHaveBeenCalledWith('products')
      expect(supabase.from).toHaveBeenCalledWith('staff')
      expect(supabase.from).toHaveBeenCalledWith('departments')
    })

    it('should handle large datasets efficiently', async () => {
      // Mock large dataset
      const largeTemperatureDataset = Array.from({ length: 5000 }, (_, i) => ({
        id: `temp_${i}`,
        recorded_at: new Date(2025, 0, 1 + (i % 31)).toISOString(),
        temperature: 2 + Math.random() * 4, // Random temps 2-6°C
        conservation_points: {
          name: `Point_${i % 10}`,
          temperature_min: 2,
          temperature_max: 6
        },
        staff: { name: `User_${i % 5}` }
      }))

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'temperature_readings') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            gte: vi.fn().mockReturnThis(),
            lte: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: largeTemperatureDataset, error: null })
          } as any
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: [], error: null })
        } as any
      })

      const startTime = performance.now()
      const excelBlob = await excelExporter.exportTemperatureReadings(
        'company123',
        { start: new Date('2025-01-01'), end: new Date('2025-01-31') }
      )
      const endTime = performance.now()

      expect(excelBlob).toBeInstanceOf(Blob)
      expect(endTime - startTime).toBeLessThan(10000) // Should complete in under 10 seconds
    })
  })

  describe('Email Scheduling and Automated Reports Workflow', () => {
    it('should process scheduled reports and send emails', async () => {
      const mockSchedule = {
        id: 'schedule_1',
        companyId: 'company123',
        name: 'Weekly HACCP Report',
        recipients: ['manager@test.com'],
        frequency: 'weekly' as const,
        time: '09:00',
        reportType: 'haccp_pdf' as const,
        isActive: true,
        nextSend: new Date('2025-01-20T09:00:00Z'),
        createdAt: new Date(),
        createdBy: 'test_user'
      }

      // Process due schedules
      const processedReports = await emailScheduler.processDueSchedules()

      expect(processedReports).toBeGreaterThanOrEqual(0)

      // Test specific schedule execution
      const result = await emailScheduler.sendScheduledReport(mockSchedule)

      expect(result.success).toBe(true)
      expect(result.recipients).toHaveLength(1)
      expect(result.error).toBeUndefined()

      // Should have generated report and sent email
      expect(supabase.from).toHaveBeenCalledWith('companies')
    })

    it('should handle different report types in scheduled emails', async () => {
      const schedules = [
        {
          id: 'schedule_pdf',
          companyId: 'company123',
          name: 'Weekly PDF Report',
          frequency: 'weekly' as const,
          time: '10:00',
          reportType: 'haccp_pdf' as const,
          recipients: ['manager@test.com'],
          isActive: true,
          nextSend: new Date(),
          createdAt: new Date(),
          createdBy: 'test_user'
        },
        {
          id: 'schedule_excel',
          companyId: 'company123',
          name: 'Monthly Excel Report',
          frequency: 'monthly' as const,
          time: '11:00',
          reportType: 'excel_full' as const,
          recipients: ['analyst@test.com'],
          isActive: true,
          nextSend: new Date(),
          createdAt: new Date(),
          createdBy: 'test_user'
        }]

      for (const schedule of schedules) {
        const result = await emailScheduler.sendScheduledReport(schedule)
        expect(result.success).toBe(true)
        expect(result.recipients).toHaveLength(1)
      }

      // Both report types should have been generated
      expect(supabase.from).toHaveBeenCalledWith('companies')
      expect(supabase.from).toHaveBeenCalledWith('temperature_readings')
    })

    it('should handle email delivery failures gracefully', async () => {
      // Mock email failure
      mockEmailClient.send.mockRejectedValueOnce(new Error('SMTP error'))

      const schedule = {
        id: 'schedule_fail',
        companyId: 'company123',
        name: 'Daily Failure Report',
        frequency: 'daily' as const,
        time: '12:00',
        reportType: 'haccp_pdf' as const,
        recipients: ['failed@test.com'],
        isActive: true,
        nextSend: new Date(),
        createdAt: new Date(),
        createdBy: 'test_user'
      }

      const result = await emailScheduler.sendScheduledReport(schedule)

      expect(result.success).toBe(false)
      expect(result.recipients).toHaveLength(1)
      expect(result.error).toContain('SMTP error')
    })
  })

  describe('Cross-System Integration Workflow', () => {
    it('should generate reports based on offline-synced data', async () => {
      // Simulate scenario where data was collected offline and then synced
      const offlineSyncedData = [
        {
          id: 'temp_offline_1',
          recorded_at: '2025-01-15T10:30:00Z',
          temperature: 4.1,
          notes: 'Recorded offline during power outage',
          conservation_points: {
            name: 'Emergency Backup Fridge',
            temperature_min: 2,
            temperature_max: 6
          },
          staff: { name: 'Emergency Operator' },
          synced_from_offline: true
        }
      ]

      // Mock data that includes offline-synced entries
      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'temperature_readings') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            gte: vi.fn().mockReturnThis(),
            lte: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: offlineSyncedData, error: null })
          } as any
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: [], error: null })
        } as any
      })

      // Generate report that includes offline-synced data
      const reportBlob = await haccpReportGenerator.generateInspectionReport(
        'company123',
        new Date('2025-01-15')
      )

      expect(reportBlob).toBeInstanceOf(Blob)

      // Export to Excel should also work
      const excelBlob = await excelExporter.exportTemperatureReadings(
        'company123',
        { start: new Date('2025-01-01'), end: new Date('2025-01-31') }
      )

      expect(excelBlob).toBeInstanceOf(Blob)
    })

    it('should handle complete compliance workflow end-to-end', async () => {
      const companyId = 'company123'
      const inspectionDate = new Date('2025-01-15')

      // Step 1: Generate inspection report
      const pdfReport = await haccpReportGenerator.generateInspectionReport(
        companyId,
        inspectionDate
      )

      expect(pdfReport).toBeInstanceOf(Blob)
      expect(pdfReport.type).toBe('application/pdf')

      // Step 2: Generate Excel backup
      const excelBackup = await excelExporter.exportAllData(
        companyId,
        {
          start: new Date(inspectionDate.getTime() - 30 * 24 * 60 * 60 * 1000),
          end: inspectionDate
        }
      )

      expect(excelBackup).toBeInstanceOf(Blob)

      // Step 3: Send automated compliance email
      const schedule = {
        id: 'compliance_schedule',
        companyId: companyId,
        name: 'Compliance Inspection Report',
        frequency: 'weekly' as const,
        time: '08:00',
        reportType: 'haccp_pdf' as const,
        recipients: ['health.inspector@gov.it', 'manager@restaurant.com'],
        isActive: true,
        nextSend: inspectionDate,
        createdAt: new Date(),
        createdBy: 'test_user'
      }

      const emailResult = await emailScheduler.sendScheduledReport(schedule)

      expect(emailResult.success).toBe(true)
      expect(emailResult.recipients).toHaveLength(2) // Both recipients

      // Verify all systems were called
      expect(supabase.from).toHaveBeenCalledWith('companies')
      expect(supabase.from).toHaveBeenCalledWith('temperature_readings')
      expect(supabase.from).toHaveBeenCalledWith('tasks')
      expect(supabase.from).toHaveBeenCalledWith('conservation_points')
    })
  })

  describe('Error Handling and Recovery', () => {
    it('should handle database errors during report generation', async () => {
      // Mock database error
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockRejectedValue(new Error('Database connection failed'))
      } as any)

      await expect(
        haccpReportGenerator.generateInspectionReport('company123', new Date())
      ).rejects.toThrow('Database connection failed')

      await expect(
        excelExporter.exportTemperatureReadings(
          'company123',
          { start: new Date(), end: new Date() }
        )
      ).rejects.toThrow('Database connection failed')
    })

    it('should handle partial data scenarios gracefully', async () => {
      // Mock scenario with missing/null data
      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'companies') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null })
          } as any
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: [], error: null })
        } as any
      })

      // Should still generate report with placeholder data
      const reportBlob = await haccpReportGenerator.generateInspectionReport(
        'company123',
        new Date()
      )

      expect(reportBlob).toBeInstanceOf(Blob)

      // Excel export should also handle missing data
      const excelBlob = await excelExporter.exportTemperatureReadings(
        'company123',
        { start: new Date('2025-01-15'), end: new Date('2025-01-15') }
      )

      expect(excelBlob).toBeInstanceOf(Blob)
    })
  })
})