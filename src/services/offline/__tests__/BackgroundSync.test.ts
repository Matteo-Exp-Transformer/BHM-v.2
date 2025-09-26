/**
 * Unit Tests for BackgroundSync Service
 * Tests offline synchronization capabilities and conflict handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { backgroundSyncService, type SyncResult } from '../BackgroundSync'
import { indexedDBManager } from '../IndexedDBManager'
import { supabase } from '@/lib/supabase/client'

// Mock dependencies
vi.mock('../IndexedDBManager')
vi.mock('@/lib/supabase/client')

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
})

// Mock window events
const mockAddEventListener = vi.fn()
const mockRemoveEventListener = vi.fn()
global.window = {
  addEventListener: mockAddEventListener,
  removeEventListener: mockRemoveEventListener,
} as any

describe('BackgroundSyncService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset online status
    Object.defineProperty(navigator, 'onLine', { value: true })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('constructor', () => {
    it('should setup online listeners', () => {
      expect(mockAddEventListener).toHaveBeenCalledWith(
        'online',
        expect.any(Function)
      )
      expect(mockAddEventListener).toHaveBeenCalledWith(
        'offline',
        expect.any(Function)
      )
    })

    it('should detect initial online status', () => {
      expect(backgroundSyncService.isCurrentlyOnline()).toBe(true)
    })
  })

  describe('startSync', () => {
    beforeEach(() => {
      vi.mocked(indexedDBManager.init).mockResolvedValue()
      vi.mocked(indexedDBManager.getSyncQueue).mockResolvedValue([])
      vi.mocked(indexedDBManager.removeSyncItem).mockResolvedValue()
    })

    it('should prevent multiple simultaneous syncs', async () => {
      // First sync starts
      const firstSync = backgroundSyncService.startSync()

      // Second sync should return immediately
      const secondSync = backgroundSyncService.startSync()

      const [firstResult, secondResult] = await Promise.all([
        firstSync,
        secondSync,
      ])

      expect(firstResult.success).toBe(true)
      expect(secondResult.success).toBe(false)
    })

    it('should not sync when offline', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false })

      const result = await backgroundSyncService.startSync()

      expect(result.success).toBe(false)
      expect(result.syncedCount).toBe(0)
      expect(indexedDBManager.init).not.toHaveBeenCalled()
    })

    it('should handle empty sync queue', async () => {
      vi.mocked(indexedDBManager.getSyncQueue).mockResolvedValue([])

      const result = await backgroundSyncService.startSync()

      expect(result.success).toBe(true)
      expect(result.syncedCount).toBe(0)
      expect(result.failedCount).toBe(0)
    })

    it('should process sync queue items', async () => {
      const mockSyncItems = [
        {
          id: 'sync1',
          operation: 'create' as const,
          table: 'temperature_readings',
          data: { temperature: 4.5, conservation_point_id: 'cp1' },
          timestamp: Date.now(),
          retryCount: 0,
        },
        {
          id: 'sync2',
          operation: 'update' as const,
          table: 'tasks',
          data: { id: 'task1', status: 'completed' },
          timestamp: Date.now(),
          retryCount: 0,
        },
      ]

      vi.mocked(indexedDBManager.getSyncQueue).mockResolvedValue(mockSyncItems)

      // Mock successful Supabase operations
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: {}, error: null }),
        }),
      } as any)

      const progressCallback = vi.fn()
      const result = await backgroundSyncService.startSync(progressCallback)

      expect(result.success).toBe(true)
      expect(result.syncedCount).toBe(2)
      expect(result.failedCount).toBe(0)
      expect(progressCallback).toHaveBeenCalled()
      expect(indexedDBManager.removeSyncItem).toHaveBeenCalledTimes(2)
    })

    it('should handle sync failures and retry logic', async () => {
      const mockSyncItem = {
        id: 'sync1',
        operation: 'create' as const,
        table: 'temperature_readings',
        data: { temperature: 4.5 },
        timestamp: Date.now(),
        retryCount: 2, // Already at max retries
      }

      vi.mocked(indexedDBManager.getSyncQueue).mockResolvedValue([mockSyncItem])

      // Mock failed Supabase operation
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockRejectedValue(new Error('Network error')),
      } as any)

      const result = await backgroundSyncService.startSync()

      expect(result.success).toBe(true) // Sync process completes even with failures
      expect(result.syncedCount).toBe(0)
      expect(result.failedCount).toBe(1)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].error).toBe('Network error')

      // Item should be removed after max retries
      expect(indexedDBManager.removeSyncItem).toHaveBeenCalledWith('sync1')
    })

    it('should call progress callback with correct data', async () => {
      const mockSyncItems = [
        {
          id: 'sync1',
          operation: 'create' as const,
          table: 'temperature_readings',
          data: { temperature: 4.5 },
          timestamp: Date.now(),
          retryCount: 0,
        },
      ]

      vi.mocked(indexedDBManager.getSyncQueue).mockResolvedValue(mockSyncItems)
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
      } as any)

      const progressCallback = vi.fn()
      await backgroundSyncService.startSync(progressCallback)

      expect(progressCallback).toHaveBeenCalledWith({
        total: 1,
        completed: 0,
        current: 'create temperature_readings',
      })

      expect(progressCallback).toHaveBeenCalledWith({
        total: 1,
        completed: 1,
      })
    })
  })

  describe('processSyncOperation', () => {
    beforeEach(() => {
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: {}, error: null }),
        }),
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: {}, error: null }),
        }),
      } as any)
    })

    it('should handle temperature reading sync operations', async () => {
      const mockSyncItems = [
        {
          id: 'sync1',
          operation: 'create' as const,
          table: 'temperature_readings',
          data: { temperature: 4.5, conservation_point_id: 'cp1' },
          timestamp: Date.now(),
          retryCount: 0,
        },
      ]

      vi.mocked(indexedDBManager.getSyncQueue).mockResolvedValue(mockSyncItems)
      vi.mocked(indexedDBManager.init).mockResolvedValue()

      await backgroundSyncService.startSync()

      expect(supabase.from).toHaveBeenCalledWith('temperature_readings')
    })

    it('should handle task sync operations', async () => {
      const mockSyncItems = [
        {
          id: 'sync1',
          operation: 'update' as const,
          table: 'tasks',
          data: { id: 'task1', status: 'completed' },
          timestamp: Date.now(),
          retryCount: 0,
        },
      ]

      vi.mocked(indexedDBManager.getSyncQueue).mockResolvedValue(mockSyncItems)
      vi.mocked(indexedDBManager.init).mockResolvedValue()

      await backgroundSyncService.startSync()

      expect(supabase.from).toHaveBeenCalledWith('tasks')
    })

    it('should handle generic table operations', async () => {
      const mockSyncItems = [
        {
          id: 'sync1',
          operation: 'create' as const,
          table: 'custom_table',
          data: { name: 'test' },
          timestamp: Date.now(),
          retryCount: 0,
        },
      ]

      vi.mocked(indexedDBManager.getSyncQueue).mockResolvedValue(mockSyncItems)
      vi.mocked(indexedDBManager.init).mockResolvedValue()

      await backgroundSyncService.startSync()

      expect(supabase.from).toHaveBeenCalledWith('custom_table')
    })
  })

  describe('queueForSync', () => {
    beforeEach(() => {
      vi.mocked(indexedDBManager.init).mockResolvedValue()
      vi.mocked(indexedDBManager.addToSyncQueue).mockResolvedValue()
    })

    it('should queue items for sync', async () => {
      await backgroundSyncService.queueForSync(
        'temperature_readings',
        'create',
        {
          temperature: 4.5,
          conservation_point_id: 'cp1',
        }
      )

      expect(indexedDBManager.addToSyncQueue).toHaveBeenCalledWith({
        operation: 'create',
        table: 'temperature_readings',
        data: { temperature: 4.5, conservation_point_id: 'cp1' },
      })
    })

    it('should trigger immediate sync when online', async () => {
      const startSyncSpy = vi
        .spyOn(backgroundSyncService, 'startSync')
        .mockResolvedValue({
          success: true,
          syncedCount: 0,
          failedCount: 0,
          errors: [],
        })

      await backgroundSyncService.queueForSync('tasks', 'update', {
        id: 'task1',
      })

      // Wait for setTimeout to execute
      await new Promise(resolve => setTimeout(resolve, 1100))

      expect(startSyncSpy).toHaveBeenCalled()
    })

    it('should not trigger sync when offline', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false })

      const startSyncSpy = vi.spyOn(backgroundSyncService, 'startSync')

      await backgroundSyncService.queueForSync('tasks', 'update', {
        id: 'task1',
      })

      // Wait for potential setTimeout
      await new Promise(resolve => setTimeout(resolve, 1100))

      expect(startSyncSpy).not.toHaveBeenCalled()
    })
  })

  describe('getPendingSyncCount', () => {
    it('should return correct pending sync count', async () => {
      const mockSyncItems = [
        {
          id: 'sync1',
          operation: 'create',
          table: 'tasks',
          data: {},
          timestamp: Date.now(),
          retryCount: 0,
        },
        {
          id: 'sync2',
          operation: 'update',
          table: 'products',
          data: {},
          timestamp: Date.now(),
          retryCount: 0,
        },
      ]

      vi.mocked(indexedDBManager.init).mockResolvedValue()
      vi.mocked(indexedDBManager.getSyncQueue).mockResolvedValue(mockSyncItems)

      const count = await backgroundSyncService.getPendingSyncCount()

      expect(count).toBe(2)
    })
  })

  describe('clearSyncQueue', () => {
    it('should clear all sync queue items', async () => {
      const mockSyncItems = [
        {
          id: 'sync1',
          operation: 'create',
          table: 'tasks',
          data: {},
          timestamp: Date.now(),
          retryCount: 0,
        },
        {
          id: 'sync2',
          operation: 'update',
          table: 'products',
          data: {},
          timestamp: Date.now(),
          retryCount: 0,
        },
      ]

      vi.mocked(indexedDBManager.init).mockResolvedValue()
      vi.mocked(indexedDBManager.getSyncQueue).mockResolvedValue(mockSyncItems)
      vi.mocked(indexedDBManager.removeSyncItem).mockResolvedValue()

      await backgroundSyncService.clearSyncQueue()

      expect(indexedDBManager.removeSyncItem).toHaveBeenCalledTimes(2)
      expect(indexedDBManager.removeSyncItem).toHaveBeenCalledWith('sync1')
      expect(indexedDBManager.removeSyncItem).toHaveBeenCalledWith('sync2')
    })
  })

  describe('online/offline events', () => {
    it('should handle online event', () => {
      const startSyncSpy = vi
        .spyOn(backgroundSyncService, 'startSync')
        .mockResolvedValue({
          success: true,
          syncedCount: 0,
          failedCount: 0,
          errors: [],
        })

      // Simulate online event
      const onlineHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'online'
      )?.[1]
      onlineHandler?.()

      expect(backgroundSyncService.isCurrentlyOnline()).toBe(true)
      expect(startSyncSpy).toHaveBeenCalled()
    })

    it('should handle offline event', () => {
      // Simulate offline event
      const offlineHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'offline'
      )?.[1]
      offlineHandler?.()

      expect(backgroundSyncService.isCurrentlyOnline()).toBe(false)
    })
  })

  describe('error handling', () => {
    it('should handle IndexedDB initialization errors', async () => {
      vi.mocked(indexedDBManager.init).mockRejectedValue(
        new Error('IndexedDB error')
      )

      const result = await backgroundSyncService.startSync()

      expect(result.success).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].error).toBe('IndexedDB error')
    })

    it('should handle Supabase errors gracefully', async () => {
      const mockSyncItem = {
        id: 'sync1',
        operation: 'create' as const,
        table: 'temperature_readings',
        data: { temperature: 4.5 },
        timestamp: Date.now(),
        retryCount: 0,
      }

      vi.mocked(indexedDBManager.init).mockResolvedValue()
      vi.mocked(indexedDBManager.getSyncQueue).mockResolvedValue([mockSyncItem])

      // Mock Supabase error
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database constraint violation' },
        }),
      } as any)

      const result = await backgroundSyncService.startSync()

      expect(result.failedCount).toBe(1)
      expect(result.errors[0].error).toContain('Database constraint violation')
    })
  })
})
