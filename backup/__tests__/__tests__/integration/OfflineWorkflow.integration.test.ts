/**
 * Integration Tests for Offline Workflow
 * Tests complete offline-to-online sync workflows for HACCP data
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest'
import { indexedDBManager } from '@/services/offline/IndexedDBManager'
import { backgroundSyncService } from '@/services/offline/BackgroundSync'
import { conflictResolver } from '@/services/offline/ConflictResolver'
import { supabase } from '@/lib/supabase/client'

// Mock Supabase
vi.mock('@/lib/supabase/client')

// Mock IndexedDB for integration testing
const createMockIDBEnvironment = () => {
  const stores = new Map()

  const mockDB = {
    objectStoreNames: { contains: (name: string) => stores.has(name) },
    createObjectStore: (name: string, options: any) => {
      const store = {
        name,
        keyPath: options.keyPath,
        indexes: new Map(),
        data: new Map(),
        createIndex: (indexName: string, keyPath: string, options: any) => {
          store.indexes.set(indexName, { keyPath, options })
        }
      }
      stores.set(name, store)
      return store
    },
    transaction: (storeNames: string[], mode: string) => {
      const transaction = {
        objectStore: (name: string) => {
          const store = stores.get(name)
          return {
            add: (data: any) => ({
              onsuccess: null as any,
              onerror: null as any,
              result: data[store.keyPath]
            }),
            put: (data: any) => ({
              onsuccess: null as any,
              onerror: null as any
            }),
            get: (key: any) => ({
              onsuccess: null as any,
              onerror: null as any,
              result: store.data.get(key)
            }),
            getAll: () => ({
              onsuccess: null as any,
              onerror: null as any,
              result: Array.from(store.data.values())
            }),
            delete: (key: any) => ({
              onsuccess: null as any,
              onerror: null as any
            }),
            index: (indexName: string) => ({
              openCursor: (range?: any) => ({
                onsuccess: null as any,
                onerror: null as any
              })
            })
          }
        },
        onerror: null as any
      }
      return transaction
    }
  }

  global.indexedDB = {
    open: vi.fn(() => ({
      onsuccess: null as any,
      onerror: null as any,
      onupgradeneeded: null as any,
      result: mockDB
    }))
  } as any

  return { mockDB, stores }
}

describe('Offline Workflow Integration Tests', () => {
  let mockDB: any
  let stores: Map<string, any>

  beforeAll(() => {
    // Setup mock IDB environment
    const mockEnv = createMockIDBEnvironment()
    mockDB = mockEnv.mockDB
    stores = mockEnv.stores
  })

  beforeEach(async () => {
    vi.clearAllMocks()

    // Reset stores
    stores.clear()

    // Reset singleton states
    ;(indexedDBManager as any).db = null
    ;(backgroundSyncService as any).syncInProgress = false
    ;(backgroundSyncService as any).isOnline = true

    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true })

    // Setup Supabase mocks
    vi.mocked(supabase.from).mockReturnValue({
      insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: {}, error: null })
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: {}, error: null })
      }),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: {}, error: null })
    } as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Complete Offline-to-Online Temperature Recording Workflow', () => {
    it('should handle offline temperature recording and sync when online', async () => {
      // Step 1: Initialize IndexedDB
      const initPromise = indexedDBManager.init()

      // Simulate successful database opening and upgrade
      setTimeout(() => {
        const openRequest = (global.indexedDB.open as any).mock.results[0].value
        if (openRequest.onupgradeneeded) {
          openRequest.onupgradeneeded({ target: { result: mockDB } })
        }
        if (openRequest.onsuccess) {
          openRequest.onsuccess()
        }
      }, 0)

      await initPromise

      // Step 2: Simulate going offline
      Object.defineProperty(navigator, 'onLine', { value: false })

      // Step 3: Record temperature reading while offline
      const temperatureData = {
        temperature: 4.5,
        conservation_point_id: 'cp_freezer_1',
        recorded_at: new Date().toISOString(),
        recorded_by: 'user123',
        notes: 'Routine check'
      }

      const offlineId = await indexedDBManager.saveOfflineData({
        table: 'temperature_readings',
        data: temperatureData,
        action: 'create',
        synced: false,
        userId: 'user123',
        companyId: 'company456'
      })

      expect(offlineId).toContain('temperature_readings_')

      // Step 4: Queue for sync
      await indexedDBManager.addToSyncQueue({
        operation: 'create',
        table: 'temperature_readings',
        data: temperatureData
      })

      // Step 5: Verify data is stored offline
      const offlineData = await indexedDBManager.getOfflineData({ synced: false })
      expect(offlineData).toHaveLength(1)
      expect(offlineData[0].table).toBe('temperature_readings')

      const syncQueue = await indexedDBManager.getSyncQueue()
      expect(syncQueue).toHaveLength(1)
      expect(syncQueue[0].table).toBe('temperature_readings')

      // Step 6: Simulate going back online
      Object.defineProperty(navigator, 'onLine', { value: true })

      // Step 7: Trigger sync
      const syncResult = await backgroundSyncService.startSync()

      expect(syncResult.success).toBe(true)
      expect(syncResult.syncedCount).toBe(1)
      expect(syncResult.failedCount).toBe(0)

      // Step 8: Verify Supabase was called
      expect(supabase.from).toHaveBeenCalledWith('temperature_readings')

      // Step 9: Verify sync queue is cleared
      const remainingSyncItems = await indexedDBManager.getSyncQueue()
      expect(remainingSyncItems).toHaveLength(0)
    })

    it('should handle sync conflicts with server data', async () => {
      // Initialize system
      const initPromise = indexedDBManager.init()
      setTimeout(() => {
        const openRequest = (global.indexedDB.open as any).mock.results[0].value
        if (openRequest.onupgradeneeded) {
          openRequest.onupgradeneeded({ target: { result: mockDB } })
        }
        if (openRequest.onsuccess) {
          openRequest.onsuccess()
        }
      }, 0)
      await initPromise

      // Local data (offline changes)
      const localData = {
        id: 'temp_123',
        temperature: 4.5,
        recorded_at: '2025-01-15T10:00:00Z',
        notes: 'Offline reading'
      }

      // Server data (concurrent changes)
      const serverData = {
        id: 'temp_123',
        temperature: 4.8,
        recorded_at: '2025-01-15T10:05:00Z',
        notes: 'Server reading'
      }

      // Test conflict resolution
      const resolution = await conflictResolver.resolveConflict(
        'temperature_readings',
        localData,
        serverData,
        'update'
      )

      expect(resolution).toBeTruthy()
      expect(resolution?.resolution.strategy).toBe('local-wins') // Temperature readings prefer local
      expect(resolution?.resolvedData.temperature).toBe(4.5) // Local temperature preserved
      expect(resolution?.resolvedData.notes).toContain('Offline reading') // Local notes included
    })
  })

  describe('Complete Task Management Offline Workflow', () => {
    it('should handle offline task completion and sync', async () => {
      // Initialize system
      const initPromise = indexedDBManager.init()
      setTimeout(() => {
        const openRequest = (global.indexedDB.open as any).mock.results[0].value
        if (openRequest.onupgradeneeded) {
          openRequest.onupgradeneeded({ target: { result: mockDB } })
        }
        if (openRequest.onsuccess) {
          openRequest.onsuccess()
        }
      }, 0)
      await initPromise

      // Go offline
      Object.defineProperty(navigator, 'onLine', { value: false })

      // Complete a task offline
      const taskCompletion = {
        task_id: 'task_456',
        completed_at: new Date().toISOString(),
        completed_by: 'user123',
        notes: 'Completed during offline work',
        verification_photo: null
      }

      // Save offline
      await indexedDBManager.saveOfflineData({
        table: 'task_completions',
        data: taskCompletion,
        action: 'create',
        synced: false,
        userId: 'user123',
        companyId: 'company456'
      })

      // Queue for sync
      await indexedDBManager.addToSyncQueue({
        operation: 'create',
        table: 'task_completions',
        data: taskCompletion
      })

      // Update task status offline
      const taskUpdate = {
        id: 'task_456',
        status: 'completed',
        updated_at: new Date().toISOString()
      }

      await indexedDBManager.addToSyncQueue({
        operation: 'update',
        table: 'tasks',
        data: taskUpdate
      })

      // Go back online and sync
      Object.defineProperty(navigator, 'onLine', { value: true })

      const syncResult = await backgroundSyncService.startSync()

      expect(syncResult.success).toBe(true)
      expect(syncResult.syncedCount).toBe(2) // Task completion + task update
      expect(syncResult.failedCount).toBe(0)

      // Verify both operations were called
      expect(supabase.from).toHaveBeenCalledWith('task_completions')
      expect(supabase.from).toHaveBeenCalledWith('tasks')
    })
  })

  describe('Inventory Management Offline Workflow', () => {
    it('should handle offline inventory updates with conflict resolution', async () => {
      // Initialize system
      const initPromise = indexedDBManager.init()
      setTimeout(() => {
        const openRequest = (global.indexedDB.open as any).mock.results[0].value
        if (openRequest.onupgradeneeded) {
          openRequest.onupgradeneeded({ target: { result: mockDB } })
        }
        if (openRequest.onsuccess) {
          openRequest.onsuccess()
        }
      }, 0)
      await initPromise

      // Go offline
      Object.defineProperty(navigator, 'onLine', { value: false })

      // Update product quantity offline
      const productUpdate = {
        id: 'product_789',
        quantity: 45, // Reduced from 50
        updated_at: new Date().toISOString(),
        last_updated_by: 'user123'
      }

      await indexedDBManager.saveOfflineData({
        table: 'products',
        data: productUpdate,
        action: 'update',
        synced: false,
        userId: 'user123',
        companyId: 'company456'
      })

      await indexedDBManager.addToSyncQueue({
        operation: 'update',
        table: 'products',
        data: productUpdate
      })

      // Test conflict resolution for inventory
      const localData = { quantity: 45, previous_quantity: 50 }
      const serverData = { quantity: 48, previous_quantity: 50 } // Someone else also reduced

      const resolution = await conflictResolver.resolveConflict(
        'products',
        localData,
        serverData,
        'update'
      )

      expect(resolution?.resolution.strategy).toBe('merge')
      // Should apply local change (-5) to current server quantity (48) = 43
      expect(resolution?.resolvedData.quantity).toBe(43)
      expect(resolution?.resolvedData.last_updated_offline).toBe(true)
    })
  })

  describe('Error Handling and Recovery', () => {
    it('should handle sync failures and retry logic', async () => {
      // Initialize system
      const initPromise = indexedDBManager.init()
      setTimeout(() => {
        const openRequest = (global.indexedDB.open as any).mock.results[0].value
        if (openRequest.onupgradeneeded) {
          openRequest.onupgradeneeded({ target: { result: mockDB } })
        }
        if (openRequest.onsuccess) {
          openRequest.onsuccess()
        }
      }, 0)
      await initPromise

      // Add failing sync item
      await indexedDBManager.addToSyncQueue({
        operation: 'create',
        table: 'temperature_readings',
        data: { temperature: 4.5 }
      })

      // Mock Supabase failure
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockRejectedValue(new Error('Network timeout'))
      } as any)

      // First sync attempt should fail
      const firstSyncResult = await backgroundSyncService.startSync()

      expect(firstSyncResult.success).toBe(true) // Process completes
      expect(firstSyncResult.failedCount).toBe(1)
      expect(firstSyncResult.errors).toHaveLength(1)
      expect(firstSyncResult.errors[0].error).toBe('Network timeout')

      // Item should still be in queue for retry
      const remainingItems = await indexedDBManager.getSyncQueue()
      expect(remainingItems).toHaveLength(1)
      expect(remainingItems[0].retryCount).toBe(0) // Not incremented yet due to mock

      // Fix Supabase and retry
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockResolvedValue({ data: {}, error: null })
      } as any)

      const retryResult = await backgroundSyncService.startSync()

      expect(retryResult.success).toBe(true)
      expect(retryResult.syncedCount).toBe(1)
      expect(retryResult.failedCount).toBe(0)
    })

    it('should remove items after maximum retry attempts', async () => {
      // Initialize system
      const initPromise = indexedDBManager.init()
      setTimeout(() => {
        const openRequest = (global.indexedDB.open as any).mock.results[0].value
        if (openRequest.onupgradeneeded) {
          openRequest.onupgradeneeded({ target: { result: mockDB } })
        }
        if (openRequest.onsuccess) {
          openRequest.onsuccess()
        }
      }, 0)
      await initPromise

      // Add item that has already reached max retries
      await indexedDBManager.addToSyncQueue({
        operation: 'create',
        table: 'temperature_readings',
        data: { temperature: 4.5 }
      })

      // Manually set retry count to max
      const syncQueue = await indexedDBManager.getSyncQueue()
      if (syncQueue.length > 0) {
        syncQueue[0].retryCount = 3 // Above max retries
      }

      // Mock persistent failure
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockRejectedValue(new Error('Persistent failure'))
      } as any)

      const syncResult = await backgroundSyncService.startSync()

      expect(syncResult.failedCount).toBe(1)

      // Item should be removed after max retries
      const remainingItems = await indexedDBManager.getSyncQueue()
      expect(remainingItems).toHaveLength(0) // Should be removed
    })
  })

  describe('Performance and Stress Testing', () => {
    it('should handle large sync queues efficiently', async () => {
      // Initialize system
      const initPromise = indexedDBManager.init()
      setTimeout(() => {
        const openRequest = (global.indexedDB.open as any).mock.results[0].value
        if (openRequest.onupgradeneeded) {
          openRequest.onupgradeneeded({ target: { result: mockDB } })
        }
        if (openRequest.onsuccess) {
          openRequest.onsuccess()
        }
      }, 0)
      await initPromise

      // Create large number of sync items
      const promises = []
      for (let i = 0; i < 100; i++) {
        promises.push(
          indexedDBManager.addToSyncQueue({
            operation: 'create',
            table: 'temperature_readings',
            data: {
              temperature: 4.0 + Math.random(),
              conservation_point_id: `cp_${i % 10}`,
              recorded_at: new Date().toISOString()
            }
          })
        )
      }

      await Promise.all(promises)

      // Mock successful sync operations
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockResolvedValue({ data: {}, error: null })
      } as any)

      const startTime = performance.now()
      const syncResult = await backgroundSyncService.startSync()
      const endTime = performance.now()

      expect(syncResult.success).toBe(true)
      expect(syncResult.syncedCount).toBe(100)
      expect(syncResult.failedCount).toBe(0)
      expect(endTime - startTime).toBeLessThan(10000) // Should complete in under 10 seconds
    })
  })

  describe('Data Cleanup and Maintenance', () => {
    it('should clean up old synced data', async () => {
      // Initialize system
      const initPromise = indexedDBManager.init()
      setTimeout(() => {
        const openRequest = (global.indexedDB.open as any).mock.results[0].value
        if (openRequest.onupgradeneeded) {
          openRequest.onupgradeneeded({ target: { result: mockDB } })
        }
        if (openRequest.onsuccess) {
          openRequest.onsuccess()
        }
      }, 0)
      await initPromise

      // Add old synced data
      const oldTimestamp = Date.now() - (8 * 24 * 60 * 60 * 1000) // 8 days ago
      await indexedDBManager.saveOfflineData({
        table: 'temperature_readings',
        data: { temperature: 4.5 },
        action: 'create',
        synced: true, // Already synced
        userId: 'user123',
        companyId: 'company456'
      })

      // Mock IDBKeyRange for cleanup
      global.IDBKeyRange = {
        upperBound: vi.fn().mockReturnValue('mock-range')
      } as any

      // Trigger cleanup (7 days max age)
      await indexedDBManager.clearOldData(7 * 24 * 60 * 60 * 1000)

      expect(global.IDBKeyRange.upperBound).toHaveBeenCalled()
    })
  })
})