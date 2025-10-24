/**
 * Unit Tests for BackgroundSync Service
 * Tests offline synchronization capabilities and conflict handling
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest'
import { indexedDBManager, type SyncQueue } from '../IndexedDBManager'
import { supabase } from '@/lib/supabase/client'

vi.mock('../IndexedDBManager')
vi.mock('@/lib/supabase/client')

const mockNavigator: Partial<typeof navigator> = {}
const mockWindow: Partial<typeof window> = {}

let addEventListenerSpy: ReturnType<typeof vi.fn>
let removeEventListenerSpy: ReturnType<typeof vi.fn>

const setOnlineStatus = (online: boolean) => {
  Object.defineProperty(mockNavigator, 'onLine', {
    configurable: true,
    value: online,
  })
}

const setupEnvironment = () => {
  addEventListenerSpy = vi.fn()
  removeEventListenerSpy = vi.fn()

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      addEventListener: addEventListenerSpy,
      removeEventListener: removeEventListenerSpy,
    } as unknown as typeof window,
  })

  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: mockNavigator as Navigator,
  })
}

const importService = async () => {
  const module = await import('../BackgroundSync')
  return module.backgroundSyncService
}

const simulateEvent = async (type: 'online' | 'offline') => {
  const handler = addEventListenerSpy.mock.calls.find(([event]) => event === type)?.[1]
  if (typeof handler === 'function') {
    await handler(new Event(type))
  }
}

let backgroundSyncService: (typeof import('../BackgroundSync'))['backgroundSyncService'] | undefined

beforeAll(() => {
  setupEnvironment()
})

afterEach(() => {
  vi.restoreAllMocks()
  setOnlineStatus(true)
})

describe('BackgroundSyncService', () => {
  beforeEach(async () => {
    vi.resetModules()
    Object.defineProperty(mockWindow, 'addEventListener', {
      configurable: true,
      value: addEventListenerSpy,
    })
    Object.defineProperty(mockWindow, 'removeEventListener', {
      configurable: true,
      value: removeEventListenerSpy,
    })
    setOnlineStatus(true)
    backgroundSyncService = await importService()
    vi.mocked(indexedDBManager.init).mockResolvedValue()
    vi.mocked(indexedDBManager.getSyncQueue).mockResolvedValue([])
    vi.mocked(indexedDBManager.removeSyncItem).mockResolvedValue()
  })

  describe('constructor', () => {
    it('should setup online listeners', () => {
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'online',
        expect.any(Function)
      )
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'offline',
        expect.any(Function)
      )
    })

    it('should detect initial online status', () => {
      expect(backgroundSyncService!.isCurrentlyOnline()).toBe(true)
    })
  })

  describe('startSync', () => {
    it('should prevent multiple simultaneous syncs', async () => {
      const firstSync = backgroundSyncService!.startSync()
      const secondSync = backgroundSyncService!.startSync()
      const [firstResult, secondResult] = await Promise.all([
        firstSync,
        secondSync,
      ])
      expect(firstResult.success).toBe(true)
      expect(secondResult.success).toBe(false)
    })

    it('should not sync when offline', async () => {
      await simulateEvent('offline')
      const result = await backgroundSyncService!.startSync()
      expect(result.success).toBe(false)
      expect(result.syncedCount).toBe(0)
      expect(indexedDBManager.init).not.toHaveBeenCalled()
    })

    it('should handle empty sync queue', async () => {
      vi.mocked(indexedDBManager.getSyncQueue).mockResolvedValue([])

      const result = await backgroundSyncService!.startSync()

      expect(result.success).toBe(true)
      expect(result.syncedCount).toBe(0)
      expect(result.failedCount).toBe(0)
    })

    it('should process sync queue items', async () => {
      const mockSyncItems: SyncQueue[] = [
        {
          id: 'sync1',
          operation: 'create',
          table: 'temperature_readings',
          data: { temperature: 4.5, conservation_point_id: 'cp1' },
          timestamp: Date.now(),
          retryCount: 0,
        },
        {
          id: 'sync2',
          operation: 'update',
          table: 'tasks',
          data: { id: 'task1', status: 'completed' },
          timestamp: Date.now(),
          retryCount: 0,
        },
      ]

      vi.mocked(indexedDBManager.getSyncQueue).mockResolvedValue(mockSyncItems)

      // Mock successful Supabase operations
      const mockInsert = vi.fn().mockResolvedValue({ error: null })
      const mockUpdateEq = vi.fn().mockResolvedValue({ error: null })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq })
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
        update: mockUpdate,
        delete: vi.fn().mockReturnValue({ eq: mockUpdateEq }),
      } as unknown as ReturnType<typeof supabase.from>)

      const progressCallback = vi.fn()
      const result = await backgroundSyncService!.startSync(progressCallback)

      expect(result.success).toBe(true)
      expect(result.syncedCount).toBe(2)
      expect(result.failedCount).toBe(0)
      expect(progressCallback).toHaveBeenCalled()
      expect(indexedDBManager.removeSyncItem).toHaveBeenCalledTimes(2)
    })

    it('should handle sync failures and retry logic', async () => {
      const mockSyncItem: SyncQueue = {
        id: 'sync1',
        operation: 'create',
        table: 'temperature_readings',
        data: { temperature: 4.5 },
        timestamp: Date.now(),
        retryCount: 2,
      }

      vi.mocked(indexedDBManager.getSyncQueue).mockResolvedValue([mockSyncItem])

      const mockInsert = vi.fn().mockRejectedValue(new Error('Network error'))
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
        update: vi.fn().mockReturnValue({ eq: vi.fn() }),
        delete: vi.fn().mockReturnValue({ eq: vi.fn() }),
      } as unknown as ReturnType<typeof supabase.from>)

      const result = await backgroundSyncService!.startSync()

      expect(result.success).toBe(true) // Sync process completes even with failures
      expect(result.syncedCount).toBe(0)
      expect(result.failedCount).toBe(1)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].error).toBe('Network error')

      // Item should be removed after max retries
      expect(indexedDBManager.removeSyncItem).toHaveBeenCalledWith('sync1')
    })

    it('should call progress callback with correct data', async () => {
      const mockSyncItems: SyncQueue[] = [
        {
          id: 'sync1',
          operation: 'create',
          table: 'temperature_readings',
          data: { temperature: 4.5 },
          timestamp: Date.now(),
          retryCount: 0,
        },
      ]

      vi.mocked(indexedDBManager.getSyncQueue).mockResolvedValue(mockSyncItems)
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: null }),
        update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
        delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
      } as unknown as ReturnType<typeof supabase.from>)

      const progressCallback = vi.fn()
      await backgroundSyncService!.startSync(progressCallback)

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

      await backgroundSyncService!.startSync()

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

      await backgroundSyncService!.startSync()

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

      await backgroundSyncService!.startSync()

      expect(supabase.from).toHaveBeenCalledWith('custom_table')
    })
  })

  describe('queueForSync', () => {
    beforeEach(() => {
      vi.mocked(indexedDBManager.init).mockResolvedValue()
      vi.mocked(indexedDBManager.addToSyncQueue).mockResolvedValue()
    })

    it('should queue items for sync', async () => {
      // const result = await backgroundSyncService!.queueForSync(
      //   'temperature_readings',
      //   'create',
      //   { temperature: 4.5 }
      // )

      expect(indexedDBManager.addToSyncQueue).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'create',
          table: 'temperature_readings',
          data: expect.objectContaining({ temperature: 4.5 }),
        })
      )
    })

    it('should not trigger sync when offline', async () => {
      await simulateEvent('offline')
      vi.mocked(indexedDBManager.addToSyncQueue).mockResolvedValue()

      const startSyncSpy = vi
        .spyOn(backgroundSyncService!, 'startSync')
        .mockResolvedValue({
          success: true,
          syncedCount: 0,
          failedCount: 0,
          errors: [],
        })

      await backgroundSyncService!.queueForSync(
        'temperature_readings',
        'create',
        {
          temperature: 4.5,
        }
      )

      await new Promise(resolve => setTimeout(resolve, 1200))
      expect(startSyncSpy).not.toHaveBeenCalled()
    })
  })

  describe('getPendingSyncCount', () => {
    it('should return correct pending sync count', async () => {
      const mockSyncItems = [
        {
          id: 'sync1',
          operation: 'create' as const,
          table: 'tasks',
          data: {},
          timestamp: Date.now(),
          retryCount: 0,
        },
        {
          id: 'sync2',
          operation: 'update' as const,
          table: 'products',
          data: {},
          timestamp: Date.now(),
          retryCount: 0,
        },
      ]

      vi.mocked(indexedDBManager.init).mockResolvedValue()
      vi.mocked(indexedDBManager.getSyncQueue).mockResolvedValue(mockSyncItems)

      const count = await backgroundSyncService!.getPendingSyncCount()

      expect(count).toBe(2)
    })
  })

  describe('clearSyncQueue', () => {
    it('should clear all sync queue items', async () => {
      const mockSyncItems = [
        {
          id: 'sync1',
          operation: 'create' as const,
          table: 'tasks',
          data: {},
          timestamp: Date.now(),
          retryCount: 0,
        },
        {
          id: 'sync2',
          operation: 'update' as const,
          table: 'products',
          data: {},
          timestamp: Date.now(),
          retryCount: 0,
        },
      ]

      vi.mocked(indexedDBManager.init).mockResolvedValue()
      vi.mocked(indexedDBManager.getSyncQueue).mockResolvedValue(mockSyncItems)
      vi.mocked(indexedDBManager.removeSyncItem).mockResolvedValue()

      await backgroundSyncService!.clearSyncQueue()

      expect(indexedDBManager.removeSyncItem).toHaveBeenCalledTimes(2)
      expect(indexedDBManager.removeSyncItem).toHaveBeenCalledWith('sync1')
      expect(indexedDBManager.removeSyncItem).toHaveBeenCalledWith('sync2')
    })
  })

  describe('online/offline events', () => {
    it('should handle online event', async () => {
      const startSyncSpy = vi
        .spyOn(backgroundSyncService!, 'startSync')
        .mockResolvedValue({
          success: true,
          syncedCount: 0,
          failedCount: 0,
          errors: [],
        })

      await simulateEvent('online')

      expect(backgroundSyncService!.isCurrentlyOnline()).toBe(true)
      expect(startSyncSpy).toHaveBeenCalled()
    })

    it('should handle offline event', async () => {
      await simulateEvent('offline')
      expect(backgroundSyncService!.isCurrentlyOnline()).toBe(false)
    })
  })

  describe('error handling', () => {
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
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockResolvedValue({
          data: null,
          error: new Error('Database constraint violation'),
        }),
      } as any)

      const result = await backgroundSyncService!.startSync()

      expect(result.success).toBe(true)
      expect(result.failedCount).toBe(1)
      expect(result.errors[0].error).toContain('Database constraint violation')
    })
  })
})
