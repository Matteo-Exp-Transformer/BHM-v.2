/**
 * Unit Tests for HACCP Report Generator
 * Tests PDF report generation and compliance features
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  haccpReportGenerator,
  type HACCPReportConfig,
} from '../HACCPReportGenerator'
import { supabase } from '@/lib/supabase/client'

// Mock jsPDF
const mockPDF = {
  setFontSize: vi.fn(),
  setFont: vi.fn(),
  text: vi.fn(),
  addPage: vi.fn(),
  setTextColor: vi.fn(),
  line: vi.fn(),
  output: vi
    .fn()
    .mockReturnValue(new Blob(['mock-pdf'], { type: 'application/pdf' })),
  internal: {
    pageSize: {
      height: 297,
    },
  },
}

vi.mock('jspdf', () => ({
  jsPDF: vi.fn(() => mockPDF),
}))

// Mock Supabase
vi.mock('@/lib/supabase/client')

describe('HACCPReportGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock Supabase responses
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          name: 'Test Company',
          address: 'Via Test 123, Milano',
          license_number: 'LIC123456',
          responsible_person: 'Mario Rossi',
        },
        error: null,
      }),
    } as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('generateReport', () => {
    const mockConfig: HACCPReportConfig = {
      companyId: 'company123',
      dateRange: {
        start: new Date('2025-01-01'),
        end: new Date('2025-01-31'),
      },
      reportType: 'monthly',
      includeCharts: true,
      language: 'it',
      sections: {
        temperatureReadings: true,
        maintenanceTasks: true,
        staffTraining: false,
        correctiveActions: false,
        criticalControlPoints: true,
      },
    }

    it('should generate PDF report successfully', async () => {
      // Mock temperature readings data
      const mockTemperatureData = {
        data: [
          {
            recorded_at: '2025-01-15T10:00:00Z',
            temperature: 4.2,
            notes: 'Normale',
            conservation_points: { name: 'Frigorifero 1' },
            staff: { name: 'Giovanni Bianchi' },
          },
        ],
        error: null,
      }

      // Mock maintenance tasks data
      const mockMaintenanceData = {
        data: [
          {
            created_at: '2025-01-10T09:00:00Z',
            title: 'Pulizia filtri',
            description: 'Pulizia filtri aria condizionata',
            status: 'completed',
            conservation_points: { name: 'Sala principale' },
            staff: { name: 'Marco Verdi' },
          },
        ],
        error: null,
      }

      // Mock conservation points data
      const mockConservationData = {
        data: [
          {
            name: 'Frigorifero 1',
            temperature_min: 2,
            temperature_max: 6,
            tolerance_range: 1,
            temperature_readings: [
              { temperature: 4.2, recorded_at: '2025-01-15T10:00:00Z' },
              { temperature: 4.5, recorded_at: '2025-01-15T14:00:00Z' },
            ],
          },
        ],
        error: null,
      }

      // Setup Supabase mock chain
      let callCount = 0
      vi.mocked(supabase.from).mockImplementation((table: string) => {
        const mockChain = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          single: vi.fn().mockImplementation(() => {
            if (table === 'companies') {
              return Promise.resolve({
                data: {
                  name: 'Test Company',
                  address: 'Via Test 123, Milano',
                  license_number: 'LIC123456',
                  responsible_person: 'Mario Rossi',
                },
                error: null,
              })
            }

            callCount++
            if (callCount === 1) return Promise.resolve(mockTemperatureData)
            if (callCount === 2) return Promise.resolve(mockMaintenanceData)
            if (callCount === 3) return Promise.resolve(mockConservationData)

            return Promise.resolve({ data: [], error: null })
          }),
        }
        return mockChain as any
      })

      const result = await haccpReportGenerator.generateReport(mockConfig)

      expect(result).toBeInstanceOf(Blob)
      expect(mockPDF.output).toHaveBeenCalledWith('blob')
      expect(mockPDF.setFontSize).toHaveBeenCalledWith(18) // Title font size
      expect(mockPDF.text).toHaveBeenCalledWith(
        expect.stringContaining('RAPPORTO HACCP'),
        20,
        expect.any(Number)
      )
    })

    it('should handle English language reports', async () => {
      const englishConfig = { ...mockConfig, language: 'en' as const }

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: [], error: null }),
      } as any)

      await haccpReportGenerator.generateReport(englishConfig)

      expect(mockPDF.text).toHaveBeenCalledWith(
        expect.stringContaining('HACCP REPORT'),
        20,
        expect.any(Number)
      )
    })

    it('should handle missing company data gracefully', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      } as any)

      const result = await haccpReportGenerator.generateReport(mockConfig)

      expect(result).toBeInstanceOf(Blob)
      expect(mockPDF.text).toHaveBeenCalledWith(
        expect.stringContaining('N/A'),
        20,
        expect.any(Number)
      )
    })

    it('should include temperature compliance indicators', async () => {
      const mockData = {
        data: [
          {
            recorded_at: '2025-01-15T10:00:00Z',
            temperature: 4.2, // Within range
            conservation_points: { name: 'Frigorifero 1' },
            staff: { name: 'Test User' },
          },
          {
            recorded_at: '2025-01-15T14:00:00Z',
            temperature: 8.5, // Out of range
            conservation_points: { name: 'Frigorifero 1' },
            staff: { name: 'Test User' },
          },
        ],
        error: null,
      }

      const mockConservationPoints = {
        data: [
          {
            name: 'Frigorifero 1',
            temperature_min: 2,
            temperature_max: 6,
            temperature_readings: [],
          },
        ],
        error: null,
      }

      let callCount = 0
      vi.mocked(supabase.from).mockImplementation(() => {
        const mockChain = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          single: vi.fn().mockImplementation(() => {
            callCount++
            if (callCount === 1)
              return Promise.resolve({ data: mockData.data[0], error: null })
            if (callCount === 2) return Promise.resolve(mockData)
            if (callCount === 3)
              return Promise.resolve({ data: [], error: null })
            if (callCount === 4) return Promise.resolve(mockConservationPoints)
            return Promise.resolve({ data: [], error: null })
          }),
        }
        return mockChain as any
      })

      await haccpReportGenerator.generateReport(mockConfig)

      // Should set green color for compliant readings
      expect(mockPDF.setTextColor).toHaveBeenCalledWith(0, 128, 0)
      // Should set red color for non-compliant readings
      expect(mockPDF.setTextColor).toHaveBeenCalledWith(255, 0, 0)
    })
  })

  describe('generateInspectionReport', () => {
    it('should generate inspection report with correct config', async () => {
      const generateReportSpy = vi
        .spyOn(haccpReportGenerator, 'generateReport')
        .mockResolvedValue(new Blob())

      const inspectionDate = new Date('2025-01-31')
      await haccpReportGenerator.generateInspectionReport(
        'company123',
        inspectionDate
      )

      expect(generateReportSpy).toHaveBeenCalledWith({
        companyId: 'company123',
        dateRange: {
          start: expect.any(Date),
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
      })

      // Check that start date is 30 days before inspection date
      const call = generateReportSpy.mock.calls[0][0]
      const expectedStartDate = new Date(
        inspectionDate.getTime() - 30 * 24 * 60 * 60 * 1000
      )
      expect(call.dateRange.start.getTime()).toBeCloseTo(
        expectedStartDate.getTime(),
        -3
      )
    })
  })

  describe('generateMonthlyReport', () => {
    it('should generate monthly report with correct date range', async () => {
      const generateReportSpy = vi
        .spyOn(haccpReportGenerator, 'generateReport')
        .mockResolvedValue(new Blob())

      await haccpReportGenerator.generateMonthlyReport('company123', 1, 2025)

      expect(generateReportSpy).toHaveBeenCalledWith({
        companyId: 'company123',
        dateRange: {
          start: new Date(2025, 0, 1), // January 1, 2025
          end: new Date(2025, 1, 0), // Last day of January
        },
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
      })
    })

    it('should handle different months correctly', async () => {
      const generateReportSpy = vi
        .spyOn(haccpReportGenerator, 'generateReport')
        .mockResolvedValue(new Blob())

      // Test February (shorter month)
      await haccpReportGenerator.generateMonthlyReport('company123', 2, 2025)

      const call = generateReportSpy.mock.calls[0][0]
      expect(call.dateRange.start).toEqual(new Date(2025, 1, 1)) // February 1
      expect(call.dateRange.end).toEqual(new Date(2025, 2, 0)) // Last day of February
    })
  })

  describe('temperature compliance checking', () => {
    it('should correctly identify compliant temperatures', () => {
      const mockReading = {
        temperature: 4.5,
        conservation_points: { name: 'Frigorifero 1' },
      }

      const mockConservationPoints = [
        {
          name: 'Frigorifero 1',
          temperature_min: 2,
          temperature_max: 6,
        },
      ]

      // Access private method for testing
      const checkCompliance = (haccpReportGenerator as any)
        .checkTemperatureCompliance
      const result = checkCompliance(mockReading, mockConservationPoints)

      expect(result).toBe(true)
    })

    it('should correctly identify non-compliant temperatures', () => {
      const mockReading = {
        temperature: 8.5,
        conservation_points: { name: 'Frigorifero 1' },
      }

      const mockConservationPoints = [
        {
          name: 'Frigorifero 1',
          temperature_min: 2,
          temperature_max: 6,
        },
      ]

      const checkCompliance = (haccpReportGenerator as any)
        .checkTemperatureCompliance
      const result = checkCompliance(mockReading, mockConservationPoints)

      expect(result).toBe(false)
    })

    it('should handle missing conservation point', () => {
      const mockReading = {
        temperature: 4.5,
        conservation_points: { name: 'Unknown Point' },
      }

      const mockConservationPoints = [
        {
          name: 'Frigorifero 1',
          temperature_min: 2,
          temperature_max: 6,
        },
      ]

      const checkCompliance = (haccpReportGenerator as any)
        .checkTemperatureCompliance
      const result = checkCompliance(mockReading, mockConservationPoints)

      expect(result).toBe(false)
    })
  })

  describe('compliance rate calculation', () => {
    it('should calculate correct compliance rate', () => {
      const mockReadings = [
        { temperature: 4.0 }, // Compliant
        { temperature: 5.0 }, // Compliant
        { temperature: 8.0 }, // Non-compliant
        { temperature: 3.0 }, // Compliant
      ]

      const mockPoint = {
        temperature_min: 2,
        temperature_max: 6,
      }

      const calculateRate = (haccpReportGenerator as any)
        .calculateComplianceRate
      const result = calculateRate(mockReadings, mockPoint)

      expect(result).toBe(75) // 3 out of 4 compliant = 75%
    })

    it('should handle empty readings array', () => {
      const calculateRate = (haccpReportGenerator as any)
        .calculateComplianceRate
      const result = calculateRate([], {
        temperature_min: 2,
        temperature_max: 6,
      })

      expect(result).toBe(0)
    })

    it('should handle null readings array', () => {
      const calculateRate = (haccpReportGenerator as any)
        .calculateComplianceRate
      const result = calculateRate(null, {
        temperature_min: 2,
        temperature_max: 6,
      })

      expect(result).toBe(0)
    })
  })

  describe('error handling', () => {
    it('should handle Supabase errors gracefully', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockRejectedValue(new Error('Database error')),
      } as any)

      const mockConfig: HACCPReportConfig = {
        companyId: 'company123',
        dateRange: { start: new Date(), end: new Date() },
        reportType: 'monthly',
        includeCharts: true,
        language: 'it',
        sections: {
          temperatureReadings: true,
          maintenanceTasks: true,
          staffTraining: false,
          correctiveActions: false,
          criticalControlPoints: true,
        },
      }

      await expect(
        haccpReportGenerator.generateReport(mockConfig)
      ).rejects.toThrow('Database error')
    })

    it('should handle PDF generation errors', async () => {
      // Mock PDF output error
      mockPDF.output.mockImplementation(() => {
        throw new Error('PDF generation failed')
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: {}, error: null }),
      } as any)

      const mockConfig: HACCPReportConfig = {
        companyId: 'company123',
        dateRange: { start: new Date(), end: new Date() },
        reportType: 'monthly',
        includeCharts: true,
        language: 'it',
        sections: {
          temperatureReadings: true,
          maintenanceTasks: true,
          staffTraining: false,
          correctiveActions: false,
          criticalControlPoints: true,
        },
      }

      await expect(
        haccpReportGenerator.generateReport(mockConfig)
      ).rejects.toThrow('PDF generation failed')
    })
  })
})
