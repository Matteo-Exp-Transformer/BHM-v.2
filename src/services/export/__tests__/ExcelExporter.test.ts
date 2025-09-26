/**
 * Unit Tests for Excel Exporter
 * Tests Excel/CSV export functionality with charts and formatting
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { excelExporter, type ExcelExportConfig } from '../ExcelExporter'
import { supabase } from '@/lib/supabase/client'

// Mock XLSX library
const mockWorkbook = {
  SheetNames: [],
  Sheets: {},
  Props: {},
}

const mockWorksheet = {
  '!ref': 'A1:D10',
  '!cols': [],
  '!merges': [],
}

const mockXLSX = {
  utils: {
    book_new: vi.fn(() => mockWorkbook),
    json_to_sheet: vi.fn(() => mockWorksheet),
    book_append_sheet: vi.fn(),
    sheet_add_aoa: vi.fn(),
    sheet_set_array_formula: vi.fn(),
  },
  writeFile: vi.fn(),
  write: vi.fn(() => new ArrayBuffer(8)),
}

vi.mock('xlsx', () => mockXLSX)

// Mock Supabase
vi.mock('@/lib/supabase/client')

describe('ExcelExporter', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Reset mock workbook
    mockWorkbook.SheetNames = []
    mockWorkbook.Sheets = {}

    // Mock Supabase responses
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: [], error: null }),
    } as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('exportData', () => {
    const mockConfig: ExcelExportConfig = {
      companyId: 'company123',
      dateRange: {
        start: new Date('2025-01-01'),
        end: new Date('2025-01-31'),
      },
      tables: ['temperature_readings', 'tasks'],
      includeCharts: true,
      format: 'xlsx',
    }

    it('should export data to Excel format successfully', async () => {
      // Mock temperature readings data
      const mockTemperatureData = {
        data: [
          {
            id: 'temp1',
            recorded_at: '2025-01-15T10:00:00Z',
            temperature: 4.2,
            conservation_points: { name: 'Frigorifero 1' },
            staff: { name: 'Giovanni Bianchi' },
          },
          {
            id: 'temp2',
            recorded_at: '2025-01-15T14:00:00Z',
            temperature: 4.5,
            conservation_points: { name: 'Frigorifero 2' },
            staff: { name: 'Mario Rossi' },
          },
        ],
        error: null,
      }

      // Mock tasks data
      const mockTasksData = {
        data: [
          {
            id: 'task1',
            title: 'Pulizia frigoriferi',
            status: 'completed',
            created_at: '2025-01-10T09:00:00Z',
            staff: { name: 'Marco Verdi' },
          },
        ],
        error: null,
      }

      // Setup Supabase mock responses
      let callCount = 0
      vi.mocked(supabase.from).mockImplementation(
        (table: string) =>
          ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            gte: vi.fn().mockReturnThis(),
            lte: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            single: vi.fn().mockImplementation(() => {
              callCount++
              if (table === 'temperature_readings') {
                return Promise.resolve(mockTemperatureData)
              }
              if (table === 'tasks') {
                return Promise.resolve(mockTasksData)
              }
              return Promise.resolve({ data: [], error: null })
            }),
          }) as any
      )

      const result = await excelExporter.exportData(mockConfig)

      expect(result).toBeInstanceOf(Blob)
      expect(mockXLSX.utils.book_new).toHaveBeenCalled()
      expect(mockXLSX.utils.json_to_sheet).toHaveBeenCalledTimes(2) // 2 tables
      expect(mockXLSX.utils.book_append_sheet).toHaveBeenCalledTimes(2)
      expect(mockXLSX.write).toHaveBeenCalledWith(mockWorkbook, {
        bookType: 'xlsx',
        type: 'array',
      })
    })

    it('should export data to CSV format', async () => {
      const csvConfig = {
        ...mockConfig,
        format: 'csv' as const,
        tables: ['temperature_readings'],
      }

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'temp1',
              recorded_at: '2025-01-15T10:00:00Z',
              temperature: 4.2,
            },
          ],
          error: null,
        }),
      } as any)

      const result = await excelExporter.exportData(csvConfig)

      expect(result).toBeInstanceOf(Blob)
      expect(mockXLSX.write).toHaveBeenCalledWith(mockWorkbook, {
        bookType: 'csv',
        type: 'array',
      })
    })

    it('should include summary sheet when charts are enabled', async () => {
      const configWithCharts = { ...mockConfig, includeCharts: true }

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mkReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: [], error: null }),
      } as any)

      await excelExporter.exportData(configWithCharts)

      // Should create summary sheet with statistics
      expect(mockXLSX.utils.book_append_sheet).toHaveBeenCalledWith(
        mockWorkbook,
        expect.any(Object),
        'Summary'
      )
    })

    it('should handle temperature data with compliance checking', async () => {
      const mockTemperatureData = {
        data: [
          {
            id: 'temp1',
            temperature: 4.2,
            conservation_points: {
              name: 'Frigorifero 1',
              temperature_min: 2,
              temperature_max: 6,
            },
          },
          {
            id: 'temp2',
            temperature: 8.5, // Non-compliant
            conservation_points: {
              name: 'Frigorifero 1',
              temperature_min: 2,
              temperature_max: 6,
            },
          },
        ],
        error: null,
      }

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockTemperatureData),
      } as any)

      const tempConfig = { ...mockConfig, tables: ['temperature_readings'] }
      await excelExporter.exportData(tempConfig)

      // Should have processed compliance status
      expect(mockXLSX.utils.json_to_sheet).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            Compliance: expect.any(String), // 'Compliant' or 'Non-Compliant'
          }),
        ])
      )
    })
  })

  describe('exportTemperatureData', () => {
    it('should export temperature readings with compliance indicators', async () => {
      const mockData = {
        data: [
          {
            id: 'temp1',
            recorded_at: '2025-01-15T10:00:00Z',
            temperature: 4.2,
            conservation_points: {
              name: 'Frigorifero 1',
              temperature_min: 2,
              temperature_max: 6,
            },
            staff: { name: 'Test User' },
          },
        ],
        error: null,
      }

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockData),
      } as any)

      const result = await excelExporter.exportTemperatureData('company123', {
        start: new Date(),
        end: new Date(),
      })

      expect(result).toBeInstanceOf(Blob)
      expect(mockXLSX.utils.json_to_sheet).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            Temperature: 4.2,
            Compliance: 'Compliant',
            Location: 'Frigorifero 1',
          }),
        ])
      )
    })

    it('should calculate compliance statistics', async () => {
      const mockData = {
        data: [
          {
            temperature: 4.2,
            conservation_points: { temperature_min: 2, temperature_max: 6 },
          },
          {
            temperature: 8.5,
            conservation_points: { temperature_min: 2, temperature_max: 6 },
          },
          {
            temperature: 3.8,
            conservation_points: { temperature_min: 2, temperature_max: 6 },
          },
        ],
        error: null,
      }

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockData),
      } as any)

      await excelExporter.exportTemperatureData('company123', {
        start: new Date(),
        end: new Date(),
      })

      // Should create summary with compliance rate
      expect(mockXLSX.utils.book_append_sheet).toHaveBeenCalledWith(
        mockWorkbook,
        expect.any(Object),
        'Summary'
      )
    })
  })

  describe('exportAllData', () => {
    it('should export all available tables', async () => {
      // Mock data for all tables
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: [], error: null }),
      } as any)

      const result = await excelExporter.exportAllData('company123', {
        start: new Date(),
        end: new Date(),
      })

      expect(result).toBeInstanceOf(Blob)

      // Should have called for each table
      const expectedTables = [
        'temperature_readings',
        'tasks',
        'products',
        'staff',
        'departments',
      ]
      expect(supabase.from).toHaveBeenCalledTimes(expectedTables.length)

      expectedTables.forEach(table => {
        expect(supabase.from).toHaveBeenCalledWith(table)
      })
    })
  })

  describe('data processing', () => {
    it('should format dates correctly', () => {
      const formatDate = (excelExporter as any).formatDate
      const testDate = new Date('2025-01-15T10:30:00Z')

      const result = formatDate(testDate)

      expect(result).toBe('15/01/2025 10:30')
    })

    it('should check temperature compliance', () => {
      const checkCompliance = (excelExporter as any).isTemperatureCompliant

      // Test compliant temperature
      expect(checkCompliance(4.5, 2, 6)).toBe(true)

      // Test non-compliant temperature (too high)
      expect(checkCompliance(8.0, 2, 6)).toBe(false)

      // Test non-compliant temperature (too low)
      expect(checkCompliance(1.0, 2, 6)).toBe(false)

      // Test edge cases
      expect(checkCompliance(2.0, 2, 6)).toBe(true) // Exactly at min
      expect(checkCompliance(6.0, 2, 6)).toBe(true) // Exactly at max
    })

    it('should calculate compliance statistics correctly', () => {
      const calculateStats = (excelExporter as any).calculateComplianceStats

      const testReadings = [
        {
          temperature: 4.0,
          conservation_points: { temperature_min: 2, temperature_max: 6 },
        },
        {
          temperature: 5.0,
          conservation_points: { temperature_min: 2, temperature_max: 6 },
        },
        {
          temperature: 8.0,
          conservation_points: { temperature_min: 2, temperature_max: 6 },
        },
        {
          temperature: 3.0,
          conservation_points: { temperature_min: 2, temperature_max: 6 },
        },
      ]

      const stats = calculateStats(testReadings)

      expect(stats).toEqual({
        totalReadings: 4,
        compliantReadings: 3,
        nonCompliantReadings: 1,
        complianceRate: 75,
        averageTemperature: 5.0,
        minTemperature: 3.0,
        maxTemperature: 8.0,
      })
    })

    it('should handle empty data arrays', () => {
      const calculateStats = (excelExporter as any).calculateComplianceStats

      const stats = calculateStats([])

      expect(stats).toEqual({
        totalReadings: 0,
        compliantReadings: 0,
        nonCompliantReadings: 0,
        complianceRate: 0,
        averageTemperature: 0,
        minTemperature: 0,
        maxTemperature: 0,
      })
    })
  })

  describe('error handling', () => {
    it('should handle Supabase errors gracefully', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi
          .fn()
          .mockRejectedValue(new Error('Database connection failed')),
      } as any)

      const config: ExcelExportConfig = {
        companyId: 'company123',
        dateRange: { start: new Date(), end: new Date() },
        tables: ['temperature_readings'],
        includeCharts: false,
        format: 'xlsx',
      }

      await expect(excelExporter.exportData(config)).rejects.toThrow(
        'Database connection failed'
      )
    })

    it('should handle XLSX library errors', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: [], error: null }),
      } as any)

      // Mock XLSX error
      mockXLSX.write.mockImplementation(() => {
        throw new Error('Excel generation failed')
      })

      const config: ExcelExportConfig = {
        companyId: 'company123',
        dateRange: { start: new Date(), end: new Date() },
        tables: ['temperature_readings'],
        includeCharts: false,
        format: 'xlsx',
      }

      await expect(excelExporter.exportData(config)).rejects.toThrow(
        'Excel generation failed'
      )
    })

    it('should handle missing conservation point data', () => {
      const checkCompliance = (excelExporter as any).isTemperatureCompliant

      // Should handle undefined values gracefully
      expect(checkCompliance(4.5, undefined, undefined)).toBe(false)
      expect(checkCompliance(4.5, null, null)).toBe(false)
    })
  })

  describe('performance and optimization', () => {
    it('should handle large datasets efficiently', async () => {
      // Generate large dataset
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        id: `temp${i}`,
        temperature: 4.0 + Math.random() * 2, // Random temps between 4-6
        recorded_at: new Date().toISOString(),
        conservation_points: { temperature_min: 2, temperature_max: 6 },
      }))

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: largeDataset, error: null }),
      } as any)

      const config: ExcelExportConfig = {
        companyId: 'company123',
        dateRange: { start: new Date(), end: new Date() },
        tables: ['temperature_readings'],
        includeCharts: false,
        format: 'xlsx',
      }

      const startTime = performance.now()
      const result = await excelExporter.exportData(config)
      const endTime = performance.now()

      expect(result).toBeInstanceOf(Blob)
      expect(endTime - startTime).toBeLessThan(5000) // Should complete in under 5 seconds
    })
  })
})
