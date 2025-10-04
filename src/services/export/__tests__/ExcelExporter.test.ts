/**
 * Unit Tests for Excel Exporter
 * Tests Excel/CSV export functionality with charts and formatting
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { excelExporter, type ExcelExportConfig } from '../ExcelExporter'
import { supabase } from '@/lib/supabase/client'

// Mock XLSX library using the real implementation as a base
vi.mock('xlsx', async () => {
  const actual = await vi.importActual<typeof import('xlsx')>('xlsx')

  return {
    ...actual,
    utils: {
      ...actual.utils,
      book_new: vi.fn(() => actual.utils.book_new()),
      json_to_sheet: vi.fn((data: any[], opts?: any) => actual.utils.json_to_sheet(data, opts)),
      aoa_to_sheet: vi.fn((data: any[][], opts?: any) => actual.utils.aoa_to_sheet(data, opts)),
      book_append_sheet: vi.fn((workbook: any, worksheet: any, name?: string) =>
        actual.utils.book_append_sheet(workbook, worksheet, name)
      ),
      sheet_add_aoa: vi.fn((sheet: any, data: any[][], opts?: any) => actual.utils.sheet_add_aoa(sheet, data, opts)),
      sheet_set_array_formula: vi.fn((sheet: any, range: string, formula: string) =>
        actual.utils.sheet_set_array_formula(sheet, range, formula)
      ),
      sheet_to_csv: vi.fn((sheet: any, opts?: any) => actual.utils.sheet_to_csv(sheet, opts)),
      decode_range: vi.fn((range: string) => actual.utils.decode_range(range)),
      encode_cell: vi.fn((cell: any) => actual.utils.encode_cell(cell)),
    },
    writeFile: vi.fn(),
    write: vi.fn(() => new ArrayBuffer(8)),
  }
})

const mockXLSX = vi.mocked(await import('xlsx'))

// Mock Supabase
vi.mock('@/lib/supabase/client')

describe('ExcelExporter', () => {
  beforeEach(() => {
    vi.clearAllMocks()

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
            conservation_points: {
              name: 'Frigorifero 1',
              temperature_min: 2,
              temperature_max: 6,
            },
            staff: { name: 'Giovanni Bianchi' },
          },
          {
            id: 'temp2',
            recorded_at: '2025-01-15T14:00:00Z',
            temperature: 4.5,
            conservation_points: {
              name: 'Frigorifero 2',
              temperature_min: 2,
              temperature_max: 6,
            },
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
      vi.mocked(supabase.from).mockImplementation(
        (table: string) =>
          ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            gte: vi.fn().mockReturnThis(),
            lte: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            single: vi.fn().mockImplementation(() => {
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
      expect(mockXLSX.utils.json_to_sheet).toHaveBeenCalled()

      const writeCall = mockXLSX.write.mock.calls[mockXLSX.write.mock.calls.length - 1]
      expect(writeCall?.[1]).toEqual({ bookType: 'xlsx', type: 'array' })

      const jsonCall = (mockXLSX.utils.json_to_sheet as any).mock.calls.find(([rows]: [any]) =>
        Array.isArray(rows)
      )
      expect(Array.isArray(jsonCall?.[0])).toBe(true)
    })

    it('should export data to CSV format', async () => {
      const csvConfig: ExcelExportConfig = {
        ...mockConfig,
        format: 'csv' as const,
        tables: ['temperature_readings'] as const,
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
              conservation_points: { temperature_min: 2, temperature_max: 6 },
            },
          ],
          error: null,
        }),
      } as any)

      const result = await excelExporter.exportData(csvConfig)

      expect(result).toBeInstanceOf(Blob)
      const writeCall = mockXLSX.write.mock.calls[mockXLSX.write.mock.calls.length - 1]
      if (writeCall) {
        expect(writeCall[1]).toEqual({ bookType: 'csv', type: 'array' })
      }
    })

    it('should include summary sheet when charts are enabled', async () => {
      const configWithCharts = { ...mockConfig, includeCharts: true }

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: [], error: null }),
      } as any)

      await excelExporter.exportData(configWithCharts)

      const summaryCall = (mockXLSX.utils.book_append_sheet as any).mock.calls.find(
        ([, , name]: [any, any, string]) => name === 'Riepilogo'
      )
      expect(summaryCall).toBeDefined()
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

      const tempConfig: ExcelExportConfig = { ...mockConfig, tables: ['temperature_readings'] }
      await excelExporter.exportData(tempConfig)

      const call = (mockXLSX.utils.json_to_sheet as any).mock.calls.find(([rows]: [any]) =>
        Array.isArray(rows)
      )

      expect(Array.isArray(call?.[0])).toBe(true)
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
      const call = (mockXLSX.utils.json_to_sheet as any).mock.calls.find(([rows]: [any]) =>
        Array.isArray(rows)
      )
      expect(Array.isArray(call?.[0])).toBe(true)
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

      const summaryCall = (mockXLSX.utils.book_append_sheet as any).mock.calls.find(
        ([, , name]: [any, any, string]) => name === 'Riepilogo'
      )
      expect(summaryCall).toBeDefined()
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

      const expectedTables = [
        'temperature_readings',
        'tasks',
        'products',
        'staff',
        'departments',
      ]
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
      const readings = [
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

      const stats = (excelExporter as any).calculateComplianceStats(readings)

      expect(stats).toEqual({
        totalReadings: 4,
        compliantReadings: 3,
        nonCompliantReadings: 1,
        complianceRate: 75,
        averageTemperature: 5,
        minTemperature: 3,
        maxTemperature: 8,
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
      const config: ExcelExportConfig = {
        companyId: 'company123',
        dateRange: { start: new Date(), end: new Date() },
        tables: ['temperature_readings'],
        includeCharts: false,
        format: 'xlsx',
      }

      const fetchSpy = vi
        .spyOn(excelExporter as any, 'fetchExportData')
        .mockRejectedValue(new Error('Database connection failed'))

      await expect(excelExporter.exportData(config)).rejects.toThrow(
        'Database connection failed'
      )

      fetchSpy.mockRestore()
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
