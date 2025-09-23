/**
 * B.8.1 Cross-System Integration Testing
 * Tests end-to-end workflows across all major systems
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { indexedDBManager } from '@/services/offline/IndexedDBManager'
import { syncManager } from '@/services/offline/SyncManager'
import { excelExporter } from '@/services/export/ExcelExporter'
import { pdfGenerator } from '@/services/export/PDFGenerator'
import { emailScheduler } from '@/services/export/EmailSchedulerService'
import { realtimeManager } from '@/services/realtime/RealtimeConnectionManager'
import { temperatureMonitor } from '@/services/realtime/TemperatureMonitor'
import { haccpAlertSystem } from '@/services/realtime/HACCPAlertSystem'

// Test data generators
const createTestTemperatureReading = (conservationPointId: string) => ({
  id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  conservation_point_id: conservationPointId,
  temperature: 4.5,
  reading_time: new Date().toISOString(),
  recorded_by: 'test_user',
  status: 'compliant' as const,
  notes: 'Test reading for integration'
})

const createTestMaintenanceTask = () => ({
  id: `maint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  title: 'Integration Test Maintenance',
  description: 'Test maintenance task for cross-system integration',
  type: 'temperature' as const,
  status: 'pending' as const,
  due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  assigned_to: 'test_user',
  conservation_point_id: 'test_point_1',
  checklist: ['Check temperature', 'Record reading', 'Clean equipment'],
  priority: 'medium' as const
})

describe('B.8.1 Cross-System Integration Testing', () => {
  beforeEach(async () => {
    // Initialize all systems
    await indexedDBManager.initialize()
    await realtimeManager.connect()
    await haccpAlertSystem.initialize('test_company')
  })

  afterEach(async () => {
    // Cleanup
    await indexedDBManager.clearAllData()
    realtimeManager.disconnect()
    haccpAlertSystem.destroy()
  })

  describe('Offline → Sync → Export Workflow', () => {
    test('should handle complete offline-to-export workflow', async () => {
      // Step 1: Create data offline
      const tempReading = createTestTemperatureReading('test_point_1')
      const maintenanceTask = createTestMaintenanceTask()

      // Store data offline
      await indexedDBManager.addOfflineData('temperature_readings', tempReading)
      await indexedDBManager.addOfflineData('maintenance_tasks', maintenanceTask)

      // Verify offline storage
      const offlineTemps = await indexedDBManager.getOfflineData('temperature_readings')
      const offlineTasks = await indexedDBManager.getOfflineData('maintenance_tasks')

      expect(offlineTemps).toHaveLength(1)
      expect(offlineTasks).toHaveLength(1)

      // Step 2: Sync to server (simulated)
      const syncResults = await syncManager.syncAllData()

      expect(syncResults.success).toBe(true)
      expect(syncResults.synced_count).toBeGreaterThan(0)
      expect(syncResults.failed_count).toBe(0)

      // Step 3: Export synced data
      const exportData = {
        temperature_readings: [tempReading],
        maintenance_tasks: [maintenanceTask],
        date_range: {
          start: new Date(Date.now() - 24 * 60 * 60 * 1000),
          end: new Date()
        }
      }

      // Test Excel export
      const excelBlob = await excelExporter.exportHACCPReport(exportData)
      expect(excelBlob).toBeInstanceOf(Blob)
      expect(excelBlob.size).toBeGreaterThan(1000) // Reasonable file size

      // Test PDF export
      const pdfBlob = await pdfGenerator.generateHACCPReport({
        companyInfo: {
          name: 'Test Company',
          address: 'Test Address',
          phone: '123-456-7890',
          email: 'test@company.com'
        },
        reportPeriod: exportData.date_range,
        temperatureReadings: exportData.temperature_readings,
        maintenanceTasks: exportData.maintenance_tasks,
        summary: {
          totalReadings: 1,
          compliantReadings: 1,
          criticalAlerts: 0,
          completedMaintenance: 0
        }
      })

      expect(pdfBlob).toBeInstanceOf(Blob)
      expect(pdfBlob.size).toBeGreaterThan(5000) // PDF should be larger

      // Performance validation
      expect(syncResults.sync_duration).toBeLessThan(5000) // Max 5 seconds
    }, 15000)

    test('should handle sync conflicts gracefully', async () => {
      // Create conflicting data
      const localReading = createTestTemperatureReading('test_point_1')
      const serverReading = { ...localReading, temperature: 6.2, notes: 'Server version' }

      // Simulate offline storage
      await indexedDBManager.addOfflineData('temperature_readings', localReading)

      // Simulate server conflict during sync
      const conflictResolution = await syncManager.resolveConflict(
        'temperature_readings',
        localReading,
        serverReading
      )

      expect(conflictResolution.strategy).toBe('server_wins') // Default strategy
      expect(conflictResolution.resolved_data.temperature).toBe(6.2)
      expect(conflictResolution.resolved_data.notes).toBe('Server version')
    })
  })

  describe('Real-time → Alert → Export Integration', () => {
    test('should trigger alerts and enable export tracking', async () => {
      // Step 1: Simulate real-time temperature violation
      const criticalReading = createTestTemperatureReading('test_point_1')
      criticalReading.temperature = 12.5 // Above safe range
      criticalReading.status = 'critical'

      // Process through temperature monitor
      temperatureMonitor.processTemperatureReading(criticalReading)

      // Step 2: Verify alert generation
      const activeAlerts = haccpAlertSystem.getActiveAlerts()
      expect(activeAlerts.length).toBeGreaterThan(0)

      const tempAlert = activeAlerts.find(alert => alert.type === 'temperature_violation')
      expect(tempAlert).toBeDefined()
      expect(tempAlert?.severity).toBe('critical')

      // Step 3: Export alert data
      const alertExportData = {
        alerts: activeAlerts,
        temperature_readings: [criticalReading],
        date_range: {
          start: new Date(Date.now() - 60 * 60 * 1000), // Last hour
          end: new Date()
        }
      }

      const alertReport = await pdfGenerator.generateAlertReport(alertExportData)
      expect(alertReport).toBeInstanceOf(Blob)
      expect(alertReport.size).toBeGreaterThan(3000)

      // Performance check
      const alertProcessingTime = Date.now()
      temperatureMonitor.processTemperatureReading(criticalReading)
      const processingDuration = Date.now() - alertProcessingTime

      expect(processingDuration).toBeLessThan(500) // Max 500ms for alert processing
    })

    test('should handle real-time collaboration', async () => {
      // Test collaborative features
      const presenceData = await realtimeManager.trackPresence('test_user', {
        page: 'temperature_monitoring',
        conservation_point_id: 'test_point_1',
        role: 'operator'
      })

      expect(presenceData.success).toBe(true)

      // Simulate collaborative editing
      const collaborativeUpdate = {
        table: 'maintenance_tasks',
        id: 'test_task_1',
        changes: {
          status: 'in_progress',
          assigned_to: 'test_user_2'
        }
      }

      const updateResult = await realtimeManager.broadcastUpdate(collaborativeUpdate)
      expect(updateResult.success).toBe(true)
    })
  })

  describe('Performance Integration Benchmarks', () => {
    test('should maintain performance under load', async () => {
      const startTime = Date.now()

      // Create substantial test data
      const temperatureReadings = Array.from({ length: 100 }, (_, i) =>
        createTestTemperatureReading(`test_point_${i % 5}`)
      )

      const maintenanceTasks = Array.from({ length: 50 }, () =>
        createTestMaintenanceTask()
      )

      // Test bulk operations
      const bulkOfflineStorage = await Promise.all([
        ...temperatureReadings.map(reading =>
          indexedDBManager.addOfflineData('temperature_readings', reading)
        ),
        ...maintenanceTasks.map(task =>
          indexedDBManager.addOfflineData('maintenance_tasks', task)
        )
      ])

      expect(bulkOfflineStorage.every(result => result.success)).toBe(true)

      // Test bulk sync
      const bulkSyncStart = Date.now()
      const syncResults = await syncManager.syncAllData()
      const bulkSyncDuration = Date.now() - bulkSyncStart

      expect(syncResults.success).toBe(true)
      expect(bulkSyncDuration).toBeLessThan(10000) // Max 10 seconds for bulk sync

      // Test bulk export
      const exportStart = Date.now()
      const bulkExportData = {
        temperature_readings: temperatureReadings,
        maintenance_tasks: maintenanceTasks,
        date_range: {
          start: new Date(Date.now() - 24 * 60 * 60 * 1000),
          end: new Date()
        }
      }

      const excelBlob = await excelExporter.exportHACCPReport(bulkExportData)
      const exportDuration = Date.now() - exportStart

      expect(excelBlob.size).toBeGreaterThan(10000) // Substantial file
      expect(exportDuration).toBeLessThan(5000) // Max 5 seconds for export

      const totalDuration = Date.now() - startTime
      expect(totalDuration).toBeLessThan(20000) // Total workflow under 20 seconds

      // Memory usage check (if available)
      if (performance.memory) {
        const memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024 // MB
        expect(memoryUsage).toBeLessThan(100) // Under 100MB
      }
    }, 25000)

    test('should handle concurrent operations', async () => {
      // Test concurrent data operations
      const concurrentOperations = [
        // Offline storage
        indexedDBManager.addOfflineData('temperature_readings', createTestTemperatureReading('point_1')),
        indexedDBManager.addOfflineData('temperature_readings', createTestTemperatureReading('point_2')),

        // Real-time operations
        realtimeManager.subscribe({
          table: 'temperature_readings',
          event: '*',
          callback: () => {},
          filter: 'conservation_point_id=eq.point_1'
        }),

        // Alert processing
        haccpAlertSystem.createAlert({
          type: 'maintenance_overdue',
          severity: 'warning',
          title: 'Concurrent Test Alert',
          message: 'Testing concurrent alert processing',
          source: {
            table: 'maintenance_tasks',
            id: 'test_task_concurrent',
            name: 'Concurrent Task'
          }
        })
      ]

      const results = await Promise.allSettled(concurrentOperations)
      const successfulOps = results.filter(result => result.status === 'fulfilled')

      expect(successfulOps.length).toBe(concurrentOperations.length)
    })
  })

  describe('Cross-Browser Compatibility', () => {
    test('should work with different IndexedDB implementations', async () => {
      // Test IndexedDB feature detection
      expect(typeof window.indexedDB).toBe('object')
      expect(typeof window.IDBKeyRange).toBe('function')

      // Test storage capabilities
      const storageTest = await indexedDBManager.testStorageCapabilities()
      expect(storageTest.supported).toBe(true)
      expect(storageTest.quota).toBeGreaterThan(1024 * 1024) // At least 1MB
    })

    test('should handle WebSocket fallbacks', async () => {
      // Test WebSocket availability
      expect(typeof WebSocket).toBe('function')

      // Test connection with fallback
      const connectionResult = await realtimeManager.connectWithFallback()
      expect(connectionResult.connected).toBe(true)
      expect(['websocket', 'polling']).toContain(connectionResult.transport)
    })

    test('should support modern browser APIs', async () => {
      // Test required APIs
      expect(typeof Blob).toBe('function')
      expect(typeof URL.createObjectURL).toBe('function')
      expect(typeof Notification).toBe('function')

      // Test optional performance APIs
      if (typeof performance !== 'undefined') {
        expect(typeof performance.now).toBe('function')
        if (performance.memory) {
          expect(typeof performance.memory.usedJSHeapSize).toBe('number')
        }
      }
    })
  })

  describe('Mobile Integration Validation', () => {
    test('should handle touch interactions', async () => {
      // Simulate touch events for mobile interfaces
      const touchEvent = new TouchEvent('touchstart', {
        touches: [new Touch({
          identifier: 1,
          target: document.body,
          clientX: 100,
          clientY: 100,
          radiusX: 2.5,
          radiusY: 2.5,
          rotationAngle: 0,
          force: 1
        })]
      })

      expect(touchEvent.touches.length).toBe(1)
      expect(touchEvent.touches[0].clientX).toBe(100)
    })

    test('should adapt to mobile constraints', async () => {
      // Test reduced data operations for mobile
      const mobileConfig = {
        maxCacheSize: 1024 * 1024, // 1MB for mobile
        syncBatchSize: 10, // Smaller batches
        exportTimeout: 30000 // Longer timeout for slower connections
      }

      const constrainedSync = await syncManager.syncWithConstraints(mobileConfig)
      expect(constrainedSync.success).toBe(true)
      expect(constrainedSync.batch_size).toBeLessThanOrEqual(mobileConfig.syncBatchSize)
    })

    test('should optimize for mobile performance', async () => {
      // Test lightweight operations
      const lightweightData = createTestTemperatureReading('mobile_point')

      const mobileStartTime = performance.now()
      await indexedDBManager.addOfflineData('temperature_readings', lightweightData)
      const mobileOpDuration = performance.now() - mobileStartTime

      expect(mobileOpDuration).toBeLessThan(100) // Under 100ms for mobile
    })
  })
})