/**
 * Unit Tests for IndexedDBManager
 * Tests offline storage capabilities and sync queue management
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  indexedDBManager,
  type OfflineData,
  type SyncQueue,
} from '../IndexedDBManager'

// Mock IndexedDB for testing
const mockDB = {
  objectStoreNames: { contains: vi.fn() },
  createObjectStore: vi.fn().mockReturnValue({
    createIndex: vi.fn(),
  }),
  transaction: vi.fn().mockReturnValue({
    objectStore: vi.fn().mockReturnValue({
      add: vi.fn().mockReturnValue({ onsuccess: null, onerror: null }),
      put: vi.fn().mockReturnValue({ onsuccess: null, onerror: null }),
      get: vi.fn().mockReturnValue({ onsuccess: null, onerror: null }),
      getAll: vi.fn().mockReturnValue({ onsuccess: null, onerror: null }),
      delete: vi.fn().mockReturnValue({ onsuccess: null, onerror: null }),
      index: vi.fn().mockReturnValue({
        openCursor: vi.fn().mockReturnValue({ onsuccess: null, onerror: null }),
      }),
    }),
  }),
}

const mockOpenDBRequest = {
  result: mockDB,
  onsuccess: null as any,
  onerror: null as any,
  onupgradeneeded: null as any,
}

// Mock global indexedDB
global.indexedDB = {
  open: vi.fn().mockReturnValue(mockOpenDBRequest),
} as any

describe('IndexedDBManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset singleton state
    ;(indexedDBManager as any).db = null
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('init', () => {
    it('should initialize database successfully', async () => {
      const initPromise = indexedDBManager.init()

      // Simulate successful database opening
      setTimeout(() => {
        if (mockOpenDBRequest.onsuccess) {
          mockOpenDBRequest.onsuccess()
        }
      }, 0)

      await expect(initPromise).resolves.toBeUndefined()
      expect(global.indexedDB.open).toHaveBeenCalledWith(
        'HACCPBusinessManager',
        1
      )
    })

    it('should handle database errors during init', async () => {
      const initPromise = indexedDBManager.init()

      // Simulate database error
      setTimeout(() => {
        if (mockOpenDBRequest.onerror) {
          mockOpenDBRequest.onerror()
        }
      }, 0)

      await expect(initPromise).rejects.toBeUndefined()
    })

    it('should create object stores on upgrade', async () => {
      const initPromise = indexedDBManager.init()

      // Simulate upgrade needed
      setTimeout(() => {
        if (mockOpenDBRequest.onupgradeneeded) {
          const event = { target: { result: mockDB } }
          mockOpenDBRequest.onupgradeneeded(event)
        }
        if (mockOpenDBRequest.onsuccess) {
          mockOpenDBRequest.onsuccess()
        }
      }, 0)

      await initPromise

      expect(mockDB.createObjectStore).toHaveBeenCalledWith('offlineData', {
        keyPath: 'id',
      })
      expect(mockDB.createObjectStore).toHaveBeenCalledWith('syncQueue', {
        keyPath: 'id',
      })
      expect(mockDB.createObjectStore).toHaveBeenCalledWith('apiCache', {
        keyPath: 'key',
      })
      expect(mockDB.createObjectStore).toHaveBeenCalledWith('offlineSettings', {
        keyPath: 'userId',
      })
    })
  })

  describe('saveOfflineData', () => {
    beforeEach(async () => {
      // Mock successful init
      ;(indexedDBManager as any).db = mockDB
    })

    it('should save offline data successfully', async () => {
      const mockStore = {
        add: vi.fn().mockReturnValue({
          onsuccess: null as any,
          onerror: null as any,
        }),
      }

      const mockTransaction = {
        objectStore: vi.fn().mockReturnValue(mockStore),
      }

      mockDB.transaction = vi.fn().mockReturnValue(mockTransaction)

      const testData = {
        table: 'temperature_readings',
        data: { temperature: 4.5, location: 'freezer' },
        action: 'create' as const,
        synced: false,
        userId: 'user123',
        companyId: 'company456',
      }

      const savePromise = indexedDBManager.saveOfflineData(testData)

      // Simulate successful save
      setTimeout(() => {
        if (mockStore.add().onsuccess) {
          mockStore.add().onsuccess()
        }
      }, 0)

      const id = await savePromise
      expect(id).toContain('temperature_readings_')
      expect(mockDB.transaction).toHaveBeenCalledWith(
        ['offlineData'],
        'readwrite'
      )
      expect(mockStore.add).toHaveBeenCalledWith(
        expect.objectContaining({
          ...testData,
          id: expect.stringContaining('temperature_readings_'),
          timestamp: expect.any(Number),
        })
      )
    })

    it('should throw error when database not initialized', async () => {
      ;(indexedDBManager as any).db = null

      const testData = {
        table: 'test',
        data: {},
        action: 'create' as const,
        synced: false,
        userId: 'user123',
        companyId: 'company456',
      }

      await expect(indexedDBManager.saveOfflineData(testData)).rejects.toThrow(
        'Database not initialized'
      )
    })
  })

  describe('getOfflineData', () => {
    beforeEach(async () => {
      ;(indexedDBManager as any).db = mockDB
    })

    it('should retrieve all offline data', async () => {
      const mockStore = {
        getAll: vi.fn().mockReturnValue({
          result: [
            { id: '1', table: 'tasks', timestamp: 1000 },
            { id: '2', table: 'products', timestamp: 2000 },
          ],
          onsuccess: null as any,
          onerror: null as any,
        }),
      }

      const mockTransaction = {
        objectStore: vi.fn().mockReturnValue(mockStore),
      }

      mockDB.transaction = vi.fn().mockReturnValue(mockTransaction)

      const dataPromise = indexedDBManager.getOfflineData()

      // Simulate successful retrieval
      setTimeout(() => {
        if (mockStore.getAll().onsuccess) {
          mockStore.getAll().onsuccess()
        }
      }, 0)

      const result = await dataPromise
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('1')
      expect(result[1].id).toBe('2')
    })

    it('should filter data by table', async () => {
      const mockData = [
        { id: '1', table: 'tasks', timestamp: 1000, synced: false },
        { id: '2', table: 'products', timestamp: 2000, synced: false },
        { id: '3', table: 'tasks', timestamp: 3000, synced: true },
      ]

      const mockStore = {
        getAll: vi.fn().mockReturnValue({
          result: mockData,
          onsuccess: null as any,
          onerror: null as any,
        }),
      }

      const mockTransaction = {
        objectStore: vi.fn().mockReturnValue(mockStore),
      }

      mockDB.transaction = vi.fn().mockReturnValue(mockTransaction)

      const dataPromise = indexedDBManager.getOfflineData({ table: 'tasks' })

      // Simulate successful retrieval
      setTimeout(() => {
        if (mockStore.getAll().onsuccess) {
          mockStore.getAll().onsuccess()
        }
      }, 0)

      const result = await dataPromise
      expect(result).toHaveLength(2)
      expect(result.every(item => item.table === 'tasks')).toBe(true)
    })

    it('should filter data by sync status', async () => {
      const mockData = [
        { id: '1', table: 'tasks', timestamp: 1000, synced: false },
        { id: '2', table: 'products', timestamp: 2000, synced: false },
        { id: '3', table: 'tasks', timestamp: 3000, synced: true },
      ]

      const mockStore = {
        getAll: vi.fn().mockReturnValue({
          result: mockData,
          onsuccess: null as any,
          onerror: null as any,
        }),
      }

      const mockTransaction = {
        objectStore: vi.fn().mockReturnValue(mockStore),
      }

      mockDB.transaction = vi.fn().mockReturnValue(mockTransaction)

      const dataPromise = indexedDBManager.getOfflineData({ synced: false })

      // Simulate successful retrieval
      setTimeout(() => {
        if (mockStore.getAll().onsuccess) {
          mockStore.getAll().onsuccess()
        }
      }, 0)

      const result = await dataPromise
      expect(result).toHaveLength(2)
      expect(result.every(item => item.synced === false)).toBe(true)
    })
  })

  describe('addToSyncQueue', () => {
    beforeEach(async () => {
      ;(indexedDBManager as any).db = mockDB
    })

    it('should add item to sync queue', async () => {
      const mockStore = {
        add: vi.fn().mockReturnValue({
          onsuccess: null as any,
          onerror: null as any,
        }),
      }

      const mockTransaction = {
        objectStore: vi.fn().mockReturnValue(mockStore),
      }

      mockDB.transaction = vi.fn().mockReturnValue(mockTransaction)

      const syncItem = {
        operation: 'create' as const,
        table: 'temperature_readings',
        data: { temperature: 4.5 },
      }

      const addPromise = indexedDBManager.addToSyncQueue(syncItem)

      // Simulate successful add
      setTimeout(() => {
        if (mockStore.add().onsuccess) {
          mockStore.add().onsuccess()
        }
      }, 0)

      await addPromise

      expect(mockDB.transaction).toHaveBeenCalledWith(
        ['syncQueue'],
        'readwrite'
      )
      expect(mockStore.add).toHaveBeenCalledWith(
        expect.objectContaining({
          ...syncItem,
          id: expect.stringContaining('sync_'),
          timestamp: expect.any(Number),
          retryCount: 0,
        })
      )
    })
  })

  describe('markAsSynced', () => {
    beforeEach(async () => {
      ;(indexedDBManager as any).db = mockDB
    })

    it('should mark data as synced', async () => {
      const mockData = { id: 'test123', synced: false }

      const mockStore = {
        get: vi.fn().mockReturnValue({
          result: mockData,
          onsuccess: null as any,
          onerror: null as any,
        }),
        put: vi.fn().mockReturnValue({
          onsuccess: null as any,
          onerror: null as any,
        }),
      }

      const mockTransaction = {
        objectStore: vi.fn().mockReturnValue(mockStore),
      }

      mockDB.transaction = vi.fn().mockReturnValue(mockTransaction)

      const markPromise = indexedDBManager.markAsSynced('test123')

      // Simulate successful get and put
      setTimeout(() => {
        if (mockStore.get().onsuccess) {
          mockStore.get().onsuccess()
        }
        setTimeout(() => {
          if (mockStore.put().onsuccess) {
            mockStore.put().onsuccess()
          }
        }, 0)
      }, 0)

      await markPromise

      expect(mockStore.get).toHaveBeenCalledWith('test123')
      expect(mockStore.put).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'test123', synced: true })
      )
    })

    it('should handle missing data', async () => {
      const mockStore = {
        get: vi.fn().mockReturnValue({
          result: null,
          onsuccess: null as any,
          onerror: null as any,
        }),
        put: vi.fn(),
      }

      const mockTransaction = {
        objectStore: vi.fn().mockReturnValue(mockStore),
      }

      mockDB.transaction = vi.fn().mockReturnValue(mockTransaction)

      const markPromise = indexedDBManager.markAsSynced('nonexistent')

      // Simulate get returning null
      setTimeout(() => {
        if (mockStore.get().onsuccess) {
          mockStore.get().onsuccess()
        }
      }, 0)

      await expect(markPromise).rejects.toThrow('Data not found')
      expect(mockStore.put).not.toHaveBeenCalled()
    })
  })

  describe('clearOldData', () => {
    beforeEach(async () => {
      ;(indexedDBManager as any).db = mockDB
    })

    it('should clean up old synced data', async () => {
      const mockOfflineIndex = {
        openCursor: vi.fn().mockReturnValue({
          onsuccess: null as any,
          onerror: null as any,
        }),
      }

      const mockCacheIndex = {
        openCursor: vi.fn().mockReturnValue({
          onsuccess: null as any,
          onerror: null as any,
        }),
      }

      const mockOfflineStore = {
        index: vi.fn().mockReturnValue(mockOfflineIndex),
      }

      const mockCacheStore = {
        index: vi.fn().mockReturnValue(mockCacheIndex),
      }

      const mockTransaction = {
        objectStore: vi.fn((storeName: string) => {
          if (storeName === 'offlineData') return mockOfflineStore
          if (storeName === 'apiCache') return mockCacheStore
          return {}
        }),
        onerror: null as any,
      }

      mockDB.transaction = vi.fn().mockReturnValue(mockTransaction)

      // Mock IDBKeyRange
      global.IDBKeyRange = {
        upperBound: vi.fn().mockReturnValue('mock-range'),
      } as any

      const cleanupPromise = indexedDBManager.clearOldData(1000) // 1 second max age

      // Simulate cursor completion (no data to clean)
      setTimeout(() => {
        // Simulate both cursors completing with no data
        if (mockOfflineIndex.openCursor().onsuccess) {
          const offlineEvent = { target: { result: null } }
          mockOfflineIndex.openCursor().onsuccess(offlineEvent)
        }
        if (mockCacheIndex.openCursor().onsuccess) {
          const cacheEvent = { target: { result: null } }
          mockCacheIndex.openCursor().onsuccess(cacheEvent)
        }
      }, 0)

      await cleanupPromise

      expect(mockDB.transaction).toHaveBeenCalledWith(
        ['offlineData', 'apiCache'],
        'readwrite'
      )
      expect(global.IDBKeyRange.upperBound).toHaveBeenCalled()
    })
  })
})
