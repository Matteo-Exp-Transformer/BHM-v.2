/**
 * Test Utilities for Offline Scenarios and HACCP Testing
 * Provides reusable mocks and helpers for testing offline functionality
 */

import { vi } from 'vitest'
import type { OfflineData, SyncQueue } from '@/services/offline/IndexedDBManager'
import type { ConflictData } from '@/services/offline/ConflictResolver'
import type { HACCPReportConfig } from '@/services/export/HACCPReportGenerator'

// ============================================================================
// Mock Data Generators
// ============================================================================

export const createMockTemperatureReading = (overrides: Partial<any> = {}) => ({
  id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
  recorded_at: new Date().toISOString(),
  temperature: 4.0 + Math.random() * 2, // 4-6°C range
  conservation_point_id: 'cp_fridge_1',
  recorded_by: 'user123',
  notes: 'Routine temperature check',
  conservation_points: {
    name: 'Main Refrigerator',
    temperature_min: 2,
    temperature_max: 6
  },
  staff: {
    name: 'Test User'
  },
  ...overrides
})

export const createMockTask = (overrides: Partial<any> = {}) => ({
  id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
  title: 'Equipment Maintenance',
  description: 'Regular maintenance check',
  status: 'pending',
  created_at: new Date().toISOString(),
  due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  conservation_point_id: 'cp_fridge_1',
  assigned_to: 'user123',
  conservation_points: {
    name: 'Main Refrigerator'
  },
  staff: {
    name: 'Test User'
  },
  ...overrides
})

export const createMockProduct = (overrides: Partial<any> = {}) => ({
  id: `product_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
  name: 'Test Product',
  quantity: 100,
  unit: 'kg',
  expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  category_id: 'cat_vegetables',
  company_id: 'company123',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

export const createMockCompany = (overrides: Partial<any> = {}) => ({
  id: 'company123',
  name: 'Test Restaurant',
  address: 'Via Test 123, Milano, Italy',
  license_number: 'LIC2025001',
  responsible_person: 'Marco Rossi',
  phone: '+39 02 1234567',
  email: 'info@testrestaurant.it',
  ...overrides
})

export const createMockConservationPoint = (overrides: Partial<any> = {}) => ({
  id: `cp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
  name: 'Test Conservation Point',
  type: 'refrigerator',
  temperature_min: 2,
  temperature_max: 6,
  tolerance_range: 1,
  company_id: 'company123',
  location: 'Kitchen Area',
  ...overrides
})

// ============================================================================
// Offline Data Helpers
// ============================================================================

export const createMockOfflineData = (overrides: Partial<OfflineData> = {}): OfflineData => ({
  id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
  table: 'temperature_readings',
  data: createMockTemperatureReading(),
  timestamp: Date.now(),
  action: 'create',
  synced: false,
  userId: 'user123',
  companyId: 'company123',
  ...overrides
})

export const createMockSyncQueueItem = (overrides: Partial<SyncQueue> = {}): SyncQueue => ({
  id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
  operation: 'create',
  table: 'temperature_readings',
  data: createMockTemperatureReading(),
  timestamp: Date.now(),
  retryCount: 0,
  ...overrides
})

export const createMockConflictData = (overrides: Partial<ConflictData> = {}): ConflictData => ({
  id: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
  table: 'temperature_readings',
  localData: createMockTemperatureReading({ notes: 'Local version' }),
  serverData: createMockTemperatureReading({ notes: 'Server version' }),
  conflictType: 'update',
  timestamp: Date.now(),
  ...overrides
})

// ============================================================================
// IndexedDB Mock Environment
// ============================================================================

export interface MockIDBStore {
  name: string
  keyPath: string
  data: Map<string, any>
  indexes: Map<string, { keyPath: string; options: any }>
  createIndex: (name: string, keyPath: string, options: any) => void
}

export interface MockIDBEnvironment {
  mockDB: any
  stores: Map<string, MockIDBStore>
  setupStore: (name: string, keyPath: string) => MockIDBStore
  addData: (storeName: string, data: any) => void
  getData: (storeName: string, key: string) => any
  getAllData: (storeName: string) => any[]
  clearStore: (storeName: string) => void
}

export const createMockIndexedDBEnvironment = (): MockIDBEnvironment => {
  const stores = new Map<string, MockIDBStore>()

  const setupStore = (name: string, keyPath: string): MockIDBStore => {
    const store: MockIDBStore = {
      name,
      keyPath,
      data: new Map(),
      indexes: new Map(),
      createIndex: (indexName: string, indexKeyPath: string, options: any) => {
        store.indexes.set(indexName, { keyPath: indexKeyPath, options })
      }
    }
    stores.set(name, store)
    return store
  }

  const addData = (storeName: string, data: any) => {
    const store = stores.get(storeName)
    if (store) {
      const key = data[store.keyPath]
      store.data.set(key, data)
    }
  }

  const getData = (storeName: string, key: string) => {
    const store = stores.get(storeName)
    return store?.data.get(key)
  }

  const getAllData = (storeName: string) => {
    const store = stores.get(storeName)
    return store ? Array.from(store.data.values()) : []
  }

  const clearStore = (storeName: string) => {
    const store = stores.get(storeName)
    if (store) {
      store.data.clear()
    }
  }

  const mockDB = {
    objectStoreNames: {
      contains: (name: string) => stores.has(name)
    },
    createObjectStore: (name: string, options: any) => {
      return setupStore(name, options.keyPath)
    },
    transaction: (storeNames: string[], mode: string) => {
      const transaction = {
        objectStore: (name: string) => {
          const store = stores.get(name)
          if (!store) {
            throw new Error(`Store ${name} not found`)
          }

          return {
            add: (data: any) => {
              const key = data[store.keyPath]
              if (store.data.has(key)) {
                return {
                  onsuccess: null as any,
                  onerror: (event: any) => {
                    if (event.onerror) event.onerror()
                  },
                  error: new Error('Key already exists')
                }
              }
              store.data.set(key, data)
              return {
                onsuccess: null as any,
                onerror: null as any,
                result: key
              }
            },
            put: (data: any) => {
              const key = data[store.keyPath]
              store.data.set(key, data)
              return {
                onsuccess: null as any,
                onerror: null as any
              }
            },
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
            delete: (key: any) => {
              store.data.delete(key)
              return {
                onsuccess: null as any,
                onerror: null as any
              }
            },
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

  // Setup global IndexedDB mock
  global.indexedDB = {
    open: vi.fn(() => ({
      onsuccess: null as any,
      onerror: null as any,
      onupgradeneeded: null as any,
      result: mockDB
    }))
  } as any

  global.IDBKeyRange = {
    upperBound: vi.fn().mockReturnValue('mock-range'),
    lowerBound: vi.fn().mockReturnValue('mock-range'),
    bound: vi.fn().mockReturnValue('mock-range'),
    only: vi.fn().mockReturnValue('mock-range')
  } as any

  return {
    mockDB,
    stores,
    setupStore,
    addData,
    getData,
    getAllData,
    clearStore
  }
}

// ============================================================================
// Network State Helpers
// ============================================================================

export const mockNetworkState = {
  goOffline: () => {
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true })
  },
  goOnline: () => {
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true })
  },
  isOnline: () => navigator.onLine
}

// ============================================================================
// Supabase Mock Helpers
// ============================================================================

export const createMockSupabaseEnvironment = () => {
  const mockData = new Map<string, any[]>()

  const setTableData = (table: string, data: any[]) => {
    mockData.set(table, data)
  }

  const getTableData = (table: string) => {
    return mockData.get(table) || []
  }

  const createMockSupabaseClient = () => {
    return {
      from: vi.fn((table: string) => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => {
          const data = getTableData(table)
          return Promise.resolve({
            data: data.length > 0 ? data[0] : null,
            error: null
          })
        }),
        // For queries that return arrays
        then: vi.fn().mockImplementation((callback) => {
          const data = getTableData(table)
          return callback({ data, error: null })
        })
      }))
    }
  }

  return {
    setTableData,
    getTableData,
    createMockSupabaseClient,
    reset: () => mockData.clear()
  }
}

// ============================================================================
// HACCP Report Test Helpers
// ============================================================================

export const createMockHACCPReportConfig = (overrides: Partial<HACCPReportConfig> = {}): HACCPReportConfig => ({
  companyId: 'company123',
  dateRange: {
    start: new Date('2025-01-01'),
    end: new Date('2025-01-31')
  },
  reportType: 'monthly',
  includeCharts: true,
  language: 'it',
  sections: {
    temperatureReadings: true,
    maintenanceTasks: true,
    staffTraining: false,
    correctiveActions: false,
    criticalControlPoints: true
  },
  ...overrides
})

// ============================================================================
// Performance Testing Helpers
// ============================================================================

export const performanceHelpers = {
  measureExecutionTime: async <T>(fn: () => Promise<T>): Promise<{ result: T; timeMs: number }> => {
    const start = performance.now()
    const result = await fn()
    const end = performance.now()
    return { result, timeMs: end - start }
  },

  generateLargeDataset: <T>(generator: (index: number) => T, count: number): T[] => {
    return Array.from({ length: count }, (_, i) => generator(i))
  },

  createMemoryPressure: (sizeBytes: number = 10 * 1024 * 1024): ArrayBuffer => {
    return new ArrayBuffer(sizeBytes)
  },

  waitForIdleCallback: (): Promise<void> => {
    return new Promise(resolve => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => resolve())
      } else {
        setTimeout(resolve, 0)
      }
    })
  }
}

// ============================================================================
// Test Scenario Builders
// ============================================================================

export const scenarioBuilders = {
  /**
   * Creates a complete offline scenario with temperature readings, tasks, and sync queue
   */
  createOfflineScenario: (idbEnv: MockIDBEnvironment, count: number = 10) => {
    // Create offline temperature readings
    const temperatureReadings = Array.from({ length: count }, (_, i) =>
      createMockOfflineData({
        table: 'temperature_readings',
        data: createMockTemperatureReading({
          temperature: 4 + (i % 3), // Vary temperatures
          recorded_at: new Date(Date.now() - i * 60 * 60 * 1000).toISOString()
        })
      })
    )

    // Create sync queue items
    const syncItems = temperatureReadings.map(reading =>
      createMockSyncQueueItem({
        table: 'temperature_readings',
        data: reading.data,
        operation: 'create'
      })
    )

    // Add to mock database
    temperatureReadings.forEach(reading => {
      idbEnv.addData('offlineData', reading)
    })

    syncItems.forEach(item => {
      idbEnv.addData('syncQueue', item)
    })

    return { temperatureReadings, syncItems }
  },

  /**
   * Creates a conflict scenario with both local and server data
   */
  createConflictScenario: (table: string = 'temperature_readings') => {
    const baseData = createMockTemperatureReading()

    const localData = {
      ...baseData,
      temperature: 4.2,
      notes: 'Updated offline',
      updated_at: new Date('2025-01-15T10:00:00Z').toISOString()
    }

    const serverData = {
      ...baseData,
      temperature: 4.8,
      notes: 'Updated online',
      updated_at: new Date('2025-01-15T10:05:00Z').toISOString()
    }

    return {
      localData,
      serverData,
      conflict: createMockConflictData({
        table,
        localData,
        serverData,
        conflictType: 'concurrent'
      })
    }
  },

  /**
   * Creates a comprehensive company dataset for testing
   */
  createCompanyDataset: () => {
    const company = createMockCompany()
    const conservationPoints = Array.from({ length: 5 }, () => createMockConservationPoint())
    const temperatureReadings = Array.from({ length: 50 }, (_, i) =>
      createMockTemperatureReading({
        conservation_point_id: conservationPoints[i % conservationPoints.length].id,
        recorded_at: new Date(Date.now() - i * 4 * 60 * 60 * 1000).toISOString() // Every 4 hours
      })
    )
    const tasks = Array.from({ length: 20 }, (_, i) =>
      createMockTask({
        conservation_point_id: conservationPoints[i % conservationPoints.length].id,
        status: i % 3 === 0 ? 'completed' : 'pending'
      })
    )
    const products = Array.from({ length: 30 }, () => createMockProduct())

    return {
      company,
      conservationPoints,
      temperatureReadings,
      tasks,
      products
    }
  }
}

// ============================================================================
// Assertion Helpers
// ============================================================================

export const assertionHelpers = {
  /**
   * Asserts that a temperature reading is within compliance range
   */
  assertTemperatureCompliance: (
    temperature: number,
    min: number,
    max: number,
    expected: boolean
  ) => {
    const isCompliant = temperature >= min && temperature <= max
    if (isCompliant !== expected) {
      throw new Error(
        `Temperature compliance assertion failed: ${temperature}°C (range: ${min}-${max}°C) expected ${expected ? 'compliant' : 'non-compliant'}`
      )
    }
  },

  /**
   * Asserts that a blob has the expected properties
   */
  assertBlobProperties: (blob: Blob, expectedType: string, minSize: number = 0) => {
    if (!(blob instanceof Blob)) {
      throw new Error('Expected a Blob instance')
    }
    if (blob.type !== expectedType) {
      throw new Error(`Expected blob type '${expectedType}', got '${blob.type}'`)
    }
    if (blob.size < minSize) {
      throw new Error(`Expected blob size >= ${minSize}, got ${blob.size}`)
    }
  },

  /**
   * Asserts that sync result has expected properties
   */
  assertSyncResult: (
    result: any,
    expectedSynced: number,
    expectedFailed: number = 0
  ) => {
    if (typeof result.success !== 'boolean') {
      throw new Error('Sync result must have boolean success property')
    }
    if (result.syncedCount !== expectedSynced) {
      throw new Error(`Expected ${expectedSynced} synced items, got ${result.syncedCount}`)
    }
    if (result.failedCount !== expectedFailed) {
      throw new Error(`Expected ${expectedFailed} failed items, got ${result.failedCount}`)
    }
  }
}

// ============================================================================
// Export all utilities
// ============================================================================

export default {
  createMockTemperatureReading,
  createMockTask,
  createMockProduct,
  createMockCompany,
  createMockConservationPoint,
  createMockOfflineData,
  createMockSyncQueueItem,
  createMockConflictData,
  createMockIndexedDBEnvironment,
  createMockSupabaseEnvironment,
  createMockHACCPReportConfig,
  mockNetworkState,
  performanceHelpers,
  scenarioBuilders,
  assertionHelpers
}