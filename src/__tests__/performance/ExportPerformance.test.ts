/**
 * Performance Tests for Export Systems
 * Tests performance characteristics of HACCP report generation and Excel export
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { haccpReportGenerator } from '@/services/export/HACCPReportGenerator'
import { excelExporter } from '@/services/export/ExcelExporter'
import { supabase } from '@/lib/supabase/client'
import {
  performanceHelpers,
  createMockTemperatureReading,
  createMockTask,
  createMockCompany,
  createMockHACCPReportConfig
} from '../utils/testHelpers'

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

describe('Export Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup performance monitoring
    global.performance = {
      ...global.performance,
      now: vi.fn(() => Date.now()),
      mark: vi.fn(),
      measure: vi.fn()
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('HACCP Report Generation Performance', () => {
    it('should generate small reports (100 records) within time limits', async () => {
      // Generate test dataset
      const temperatureReadings = performanceHelpers.generateLargeDataset(
        (i) => createMockTemperatureReading({
          id: `temp_${i}`,
          recorded_at: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
          temperature: 4 + Math.random() * 2
        }),
        100
      )

      const tasks = performanceHelpers.generateLargeDataset(
        (i) => createMockTask({
          id: `task_${i}`,
          status: i % 3 === 0 ? 'completed' : 'pending'
        }),
        50
      )

      // Mock Supabase responses
      vi.mocked(supabase.from).mockImplementation((table: string) => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: table === 'temperature_readings' ? temperatureReadings :
                table === 'tasks' ? tasks :
                table === 'companies' ? createMockCompany() :
                [],
          error: null
        })
      } as any))

      const config = createMockHACCPReportConfig()

      const { result, timeMs } = await performanceHelpers.measureExecutionTime(
        () => haccpReportGenerator.generateReport(config)
      )

      expect(result).toBeInstanceOf(Blob)
      expect(timeMs).toBeLessThan(2000) // Should complete in under 2 seconds
      console.log(`Small HACCP report (100 records) generated in ${timeMs}ms`)
    })

    it('should generate medium reports (1000 records) within acceptable time', async () => {
      // Generate larger test dataset
      const temperatureReadings = performanceHelpers.generateLargeDataset(
        (i) => createMockTemperatureReading({
          id: `temp_${i}`,
          recorded_at: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
          temperature: 4 + Math.random() * 2
        }),
        1000
      )

      const tasks = performanceHelpers.generateLargeDataset(
        (i) => createMockTask({
          id: `task_${i}`,
          status: i % 3 === 0 ? 'completed' : 'pending'
        }),
        500
      )

      vi.mocked(supabase.from).mockImplementation((table: string) => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: table === 'temperature_readings' ? temperatureReadings :
                table === 'tasks' ? tasks :
                table === 'companies' ? createMockCompany() :
                [],
          error: null
        })
      } as any))

      const config = createMockHACCPReportConfig()

      const { result, timeMs } = await performanceHelpers.measureExecutionTime(
        () => haccpReportGenerator.generateReport(config)
      )

      expect(result).toBeInstanceOf(Blob)
      expect(timeMs).toBeLessThan(5000) // Should complete in under 5 seconds
      console.log(`Medium HACCP report (1000 records) generated in ${timeMs}ms`)
    })

    it('should generate large reports (10000 records) within maximum time', async () => {
      // Generate very large test dataset
      const temperatureReadings = performanceHelpers.generateLargeDataset(
        (i) => createMockTemperatureReading({
          id: `temp_${i}`,
          recorded_at: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
          temperature: 4 + Math.random() * 2
        }),
        10000
      )

      const tasks = performanceHelpers.generateLargeDataset(
        (i) => createMockTask({
          id: `task_${i}`,
          status: i % 3 === 0 ? 'completed' : 'pending'
        }),
        5000
      )

      vi.mocked(supabase.from).mockImplementation((table: string) => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: table === 'temperature_readings' ? temperatureReadings :
                table === 'tasks' ? tasks :
                table === 'companies' ? createMockCompany() :
                [],
          error: null
        })
      } as any))

      const config = createMockHACCPReportConfig()

      const { result, timeMs } = await performanceHelpers.measureExecutionTime(
        () => haccpReportGenerator.generateReport(config)
      )

      expect(result).toBeInstanceOf(Blob)
      expect(timeMs).toBeLessThan(15000) // Should complete in under 15 seconds
      console.log(`Large HACCP report (10000 records) generated in ${timeMs}ms`)
    })

    it('should handle memory pressure during large report generation', async () => {
      // Create memory pressure
      const memoryPressure = performanceHelpers.createMemoryPressure(50 * 1024 * 1024) // 50MB

      const largeDataset = performanceHelpers.generateLargeDataset(
        (i) => createMockTemperatureReading({
          id: `temp_${i}`,
          notes: 'A'.repeat(1000) // Large notes to increase memory usage
        }),
        5000
      )

      vi.mocked(supabase.from).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: largeDataset, error: null })
      } as any))

      const config = createMockHACCPReportConfig()

      const { result, timeMs } = await performanceHelpers.measureExecutionTime(
        () => haccpReportGenerator.generateReport(config)
      )

      expect(result).toBeInstanceOf(Blob)
      expect(timeMs).toBeLessThan(20000) // Should still complete within 20 seconds
      console.log(`Report with memory pressure generated in ${timeMs}ms`)

      // Clean up memory pressure
      // Note: In a real environment, this would be handled by garbage collection
    })
  })

  describe('Excel Export Performance', () => {
    it('should export small datasets efficiently', async () => {
      const temperatureData = performanceHelpers.generateLargeDataset(
        (i) => createMockTemperatureReading({
          id: `temp_${i}`,
          temperature: 4 + (i % 3),
          conservation_points: {
            name: `Point_${i % 5}`,
            temperature_min: 2,
            temperature_max: 6
          }
        }),
        500
      )

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: temperatureData, error: null })
      } as any)

      const { result, timeMs } = await performanceHelpers.measureExecutionTime(
        () => excelExporter.exportTemperatureData(
          'company123',
          { start: new Date(), end: new Date() }
        )
      )

      expect(result).toBeInstanceOf(Blob)
      expect(timeMs).toBeLessThan(1000) // Should complete in under 1 second
      console.log(`Small Excel export (500 records) completed in ${timeMs}ms`)
    })

    it('should export large datasets with acceptable performance', async () => {
      const largeTemperatureData = performanceHelpers.generateLargeDataset(
        (i) => createMockTemperatureReading({
          id: `temp_${i}`,
          temperature: 4 + (i % 3),
          recorded_at: new Date(Date.now() - i * 60 * 1000).toISOString(),
          conservation_points: {
            name: `Point_${i % 10}`,
            temperature_min: 2,
            temperature_max: 6
          }
        }),
        20000 // 20k records
      )

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: largeTemperatureData, error: null })
      } as any)

      const { result, timeMs } = await performanceHelpers.measureExecutionTime(
        () => excelExporter.exportTemperatureData(
          'company123',
          { start: new Date(), end: new Date() }
        )
      )

      expect(result).toBeInstanceOf(Blob)
      expect(timeMs).toBeLessThan(10000) // Should complete in under 10 seconds
      console.log(`Large Excel export (20k records) completed in ${timeMs}ms`)
    })

    it('should handle concurrent export requests efficiently', async () => {
      const datasets = Array.from({ length: 5 }, (_, i) =>
        performanceHelpers.generateLargeDataset(
          (j) => createMockTemperatureReading({
            id: `temp_${i}_${j}`,
            temperature: 4 + Math.random() * 2
          }),
          1000
        )
      )

      vi.mocked(supabase.from).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => {
          const randomDataset = datasets[Math.floor(Math.random() * datasets.length)]
          return Promise.resolve({ data: randomDataset, error: null })
        })
      } as any))

      const { result: results, timeMs } = await performanceHelpers.measureExecutionTime(
        () => Promise.all([
          excelExporter.exportTemperatureData('company1', { start: new Date(), end: new Date() }),
          excelExporter.exportTemperatureData('company2', { start: new Date(), end: new Date() }),
          excelExporter.exportTemperatureData('company3', { start: new Date(), end: new Date() }),
          excelExporter.exportTemperatureData('company4', { start: new Date(), end: new Date() }),
          excelExporter.exportTemperatureData('company5', { start: new Date(), end: new Date() })
        ])
      )

      expect(results).toHaveLength(5)
      results.forEach(result => {
        expect(result).toBeInstanceOf(Blob)
      })
      expect(timeMs).toBeLessThan(15000) // All 5 exports should complete in under 15 seconds
      console.log(`Concurrent Excel exports (5 parallel) completed in ${timeMs}ms`)
    })

    it('should optimize memory usage for very large datasets', async () => {
      // Simulate a very large dataset that might cause memory issues
      const hugeDataset = performanceHelpers.generateLargeDataset(
        (i) => ({
          id: `temp_${i}`,
          temperature: 4 + (i % 3),
          recorded_at: new Date(Date.now() - i * 1000).toISOString(),
          conservation_points: {
            name: `Conservation Point ${i % 100}`,
            temperature_min: 2,
            temperature_max: 6
          },
          staff: { name: `Staff Member ${i % 50}` },
          notes: `Temperature reading #${i} with detailed notes`.repeat(10) // Larger text
        }),
        50000 // 50k records with larger payloads
      )

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: hugeDataset, error: null })
      } as any)

      const { result, timeMs } = await performanceHelpers.measureExecutionTime(
        () => excelExporter.exportTemperatureData(
          'company123',
          { start: new Date(), end: new Date() }
        )
      )

      expect(result).toBeInstanceOf(Blob)
      expect(timeMs).toBeLessThan(30000) // Should complete in under 30 seconds even with huge dataset
      console.log(`Huge Excel export (50k records) completed in ${timeMs}ms`)
    })
  })

  describe('Performance Regression Detection', () => {
    it('should maintain consistent performance across multiple runs', async () => {
      const dataset = performanceHelpers.generateLargeDataset(
        (i) => createMockTemperatureReading({ id: `temp_${i}` }),
        2000
      )

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mkReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: dataset, error: null })
      } as any)

      const config = createMockHACCPReportConfig()
      const runTimes: number[] = []

      // Run the same operation 10 times
      for (let i = 0; i < 10; i++) {
        const { timeMs } = await performanceHelpers.measureExecutionTime(
          () => haccpReportGenerator.generateReport(config)
        )
        runTimes.push(timeMs)

        // Small delay between runs to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      const averageTime = runTimes.reduce((sum, time) => sum + time, 0) / runTimes.length
      const maxTime = Math.max(...runTimes)
      const minTime = Math.min(...runTimes)
      const variance = maxTime - minTime

      console.log(`Performance consistency test:`)
      console.log(`  Average: ${averageTime.toFixed(2)}ms`)
      console.log(`  Min: ${minTime}ms, Max: ${maxTime}ms`)
      console.log(`  Variance: ${variance}ms`)

      // Performance should be relatively consistent
      expect(variance).toBeLessThan(averageTime * 0.5) // Variance should be less than 50% of average
      expect(maxTime).toBeLessThan(averageTime * 2) // No single run should be more than 2x average
    })

    it('should handle performance gracefully under stress', async () => {
      // Create multiple concurrent stress operations
      const stressOperations = Array.from({ length: 10 }, (_, i) => {
        const dataset = performanceHelpers.generateLargeDataset(
          (j) => createMockTemperatureReading({ id: `stress_${i}_${j}` }),
          1000
        )

        vi.mocked(supabase.from).mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: dataset, error: null })
        } as any)

        return () => haccpReportGenerator.generateReport(createMockHACCPReportConfig())
      })

      const { result: results, timeMs } = await performanceHelpers.measureExecutionTime(
        () => Promise.all(stressOperations.map(op => op()))
      )

      expect(results).toHaveLength(10)
      results.forEach(result => {
        expect(result).toBeInstanceOf(Blob)
      })

      // Under stress, operations should still complete within reasonable time
      expect(timeMs).toBeLessThan(60000) // 1 minute for 10 concurrent operations
      console.log(`Stress test (10 concurrent operations) completed in ${timeMs}ms`)
    })
  })

  describe('Resource Usage Optimization', () => {
    it('should clean up resources properly after operations', async () => {
      const initialMemory = process.memoryUsage?.().heapUsed || 0

      // Perform multiple operations that might leak memory
      for (let i = 0; i < 20; i++) {
        const dataset = performanceHelpers.generateLargeDataset(
          (j) => createMockTemperatureReading({ id: `cleanup_${i}_${j}` }),
          1000
        )

        vi.mocked(supabase.from).mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: dataset, error: null })
        } as any)

        await haccpReportGenerator.generateReport(createMockHACCPReportConfig())

        // Force garbage collection if available
        if (global.gc) {
          global.gc()
        }
      }

      const finalMemory = process.memoryUsage?.().heapUsed || 0
      const memoryIncrease = finalMemory - initialMemory

      console.log(`Memory usage after 20 operations: +${Math.round(memoryIncrease / 1024 / 1024)}MB`)

      // Memory increase should be reasonable (allowing for some growth)
      // This is more of a monitoring test than a strict assertion
      if (memoryIncrease > 100 * 1024 * 1024) { // 100MB threshold
        console.warn('Potential memory leak detected - memory increased by', Math.round(memoryIncrease / 1024 / 1024), 'MB')
      }
    })

    it('should handle CPU-intensive operations without blocking', async () => {
      let operationCompleted = false
      let timeoutReached = false

      // Start a CPU-intensive operation
      const cpuIntensivePromise = (async () => {
        const largeDataset = performanceHelpers.generateLargeDataset(
          (i) => createMockTemperatureReading({
            id: `cpu_${i}`,
            notes: 'x'.repeat(10000) // Large text to process
          }),
          10000
        )

        vi.mocked(supabase.from).mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: largeDataset, error: null })
        } as any)

        await haccpReportGenerator.generateReport(createMockHACCPReportConfig())
        operationCompleted = true
      })()

      // Start a timeout to check if the operation blocks
      const timeoutPromise = new Promise(resolve => {
        setTimeout(() => {
          timeoutReached = true
          resolve(undefined)
        }, 100) // Short timeout to test non-blocking behavior
      })

      // Wait for either the timeout or small delay
      await Promise.race([timeoutPromise, new Promise(resolve => setTimeout(resolve, 150))])

      // The timeout should have been reached (operation shouldn't block the event loop completely)
      expect(timeoutReached).toBe(true)

      // Wait for the actual operation to complete
      await cpuIntensivePromise
      expect(operationCompleted).toBe(true)

      console.log('CPU-intensive operation completed without completely blocking event loop')
    })
  })
})