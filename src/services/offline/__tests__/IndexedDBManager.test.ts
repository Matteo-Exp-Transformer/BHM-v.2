/**
 * Unit Tests for IndexedDBManager
 * Tests offline storage capabilities and sync queue management
 */

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  beforeAll,
} from 'vitest'
import {
  indexedDBManager,
  type OfflineData,
  type SyncQueue,
} from '../IndexedDBManager'

const createMockRequest = <T>(result?: T, error?: unknown) => {
  //@ts-expect-error
  const request: IDBRequest<T> = {}
  request.onsuccess = null
  request.onerror = null
  setTimeout(() => {
    if (error && request.onerror) {
      if ('error' in request) {
        //@ts-expect-error
        request.error = error
      }
      request.onerror(new Event('error'))
    } else if (request.onsuccess) {
      //@ts-expect-error
      request.result = result
      request.onsuccess(new Event('success'))
    }
  }, 0)
  return request
}

const mockOpenDBRequest = () => {
  //@ts-expect-error
  const request: IDBOpenDBRequest = {}
  request.onsuccess = null
  request.onerror = null
  request.onupgradeneeded = null
  
  setTimeout(() => {
    // Set the result to mockDB before calling onupgradeneeded
    //@ts-expect-error
    request.result = mockDB
    
    if (request.onupgradeneeded) {
      const event = {
        target: request,
        currentTarget: request,
        type: 'upgradeneeded',
        bubbles: false,
        cancelable: false,
        defaultPrevented: false,
        eventPhase: 2,
        isTrusted: true,
        timeStamp: Date.now(),
        oldVersion: 0,
        newVersion: 1
      } as unknown as IDBVersionChangeEvent
      
      request.onupgradeneeded(event)
    }
    
    if (request.onsuccess) {
      request.onsuccess(new Event('success'))
    }
  }, 0)
  return request
}

let mockDB: IDBDatabase
let objectStores: Record<string, IDBObjectStore>

beforeAll(() => {
  objectStores = {}
  
  // Create a proper DOMStringList mock
  const objectStoreNamesList = {
    length: 0,
    contains: (name: string) => Boolean(objectStores[name]),
    item: (index: number) => Object.keys(objectStores)[index] || null,
    [Symbol.iterator]: function* () {
      for (const name of Object.keys(objectStores)) {
        yield name
      }
    }
  }
  
  mockDB = {
    objectStoreNames: objectStoreNamesList as unknown as DOMStringList,
    createObjectStore: vi.fn((name: string) => {
      const store = {
        createIndex: vi.fn(),
        add: vi.fn(() => createMockRequest()),
        put: vi.fn(() => createMockRequest()),
        delete: vi.fn(() => createMockRequest()),
        get: vi.fn(() => createMockRequest()),
        getAll: vi.fn(() => createMockRequest([])),
        index: vi.fn(() => ({ getAll: vi.fn(() => createMockRequest([])) })),
      } as unknown as IDBObjectStore
      objectStores[name] = store
      // Update the length of objectStoreNames
      objectStoreNamesList.length = Object.keys(objectStores).length
      return store
    }),
    transaction: vi.fn((/* names: string[] */) => ({
      objectStore: (name: string) => objectStores[name],
      commit: vi.fn(),
    })),
    close: vi.fn(),
  } as unknown as IDBDatabase

  Object.defineProperty(globalThis, 'indexedDB', {
    configurable: true,
    value: {
      open: vi.fn(() => mockOpenDBRequest()),
    },
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('IndexedDBManager', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    objectStores = {}
  })

  it('initializes database and creates stores on upgrade', async () => {
    const openSpy = vi.spyOn(indexedDB, 'open')
    openSpy.mockImplementation(() => mockOpenDBRequest())

    await expect(indexedDBManager.init()).resolves.toBeUndefined()
    expect(mockDB.createObjectStore).toHaveBeenCalled()
  })

  it('adds operations to sync queue', async () => {
    await indexedDBManager.init()

    const payload: SyncQueue = {
      id: 'sync1',
      table: 'temperature_readings',
      operation: 'create',
      data: { temperature: 4 },
      timestamp: Date.now(),
      retryCount: 0,
    }

    const addSpy = vi.spyOn(objectStores['syncQueue'], 'add')
    await indexedDBManager.addToSyncQueue({
      table: payload.table,
      operation: payload.operation,
      data: payload.data,
    })
    expect(addSpy).toHaveBeenCalled()
  })

  it('retrieves sync queue items sorted by timestamp', async () => {
    await indexedDBManager.init()

    const items: SyncQueue[] = [
      {
        id: 'sync1',
        table: 'tasks',
        operation: 'create',
        data: { title: 'Task 1' },
        timestamp: 2,
        retryCount: 0,
      },
      {
        id: 'sync2',
        table: 'tasks',
        operation: 'create',
        data: { title: 'Task 2' },
        timestamp: 1,
        retryCount: 0,
      },
    ]

    vi.spyOn(objectStores['syncQueue'], 'getAll').mockReturnValueOnce(
      createMockRequest(items)
    )

    const result = await indexedDBManager.getSyncQueue()
    expect(result[0].id).toBe('sync2')
    expect(result[1].id).toBe('sync1')
  })

  it('saves offline data entries', async () => {
    await indexedDBManager.init()

    const addSpy = vi.spyOn(objectStores['offlineData'], 'add')
    const payload: Omit<OfflineData, 'id' | 'timestamp'> = {
      table: 'products',
      data: { name: 'Milk' },
      action: 'create',
      synced: false,
      userId: 'user1',
      companyId: 'company1',
    }

    await indexedDBManager.saveOfflineData(payload)
    expect(addSpy).toHaveBeenCalled()
  })
})
