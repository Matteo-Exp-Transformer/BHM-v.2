/**
 * IndexedDB Manager for Offline Storage
 * Handles offline data storage with schema versioning
 */

export type SyncOperationType = 'create' | 'update' | 'delete'

export type SyncPayload = Record<string, unknown>

export interface OfflineData {
  id: string
  table: string
  data: SyncPayload
  timestamp: number
  action: SyncOperationType
  synced: boolean
  userId: string
  companyId: string
}

export interface SyncQueue {
  id: string
  operation: SyncOperationType
  table: string
  data: SyncPayload
  timestamp: number
  retryCount: number
  lastError?: string
}

class IndexedDBManager {
  private db: IDBDatabase | null = null
  private readonly dbName = 'HACCPBusinessManager'
  private readonly version = 1

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result

        // Offline data store
        if (!db.objectStoreNames.contains('offlineData')) {
          const offlineStore = db.createObjectStore('offlineData', {
            keyPath: 'id',
          })
          offlineStore.createIndex('table', 'table', { unique: false })
          offlineStore.createIndex('timestamp', 'timestamp', { unique: false })
          offlineStore.createIndex('synced', 'synced', { unique: false })
          offlineStore.createIndex('userId', 'userId', { unique: false })
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' })
          syncStore.createIndex('timestamp', 'timestamp', { unique: false })
          syncStore.createIndex('table', 'table', { unique: false })
        }

        // Cached API responses
        if (!db.objectStoreNames.contains('apiCache')) {
          const cacheStore = db.createObjectStore('apiCache', {
            keyPath: 'key',
          })
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false })
          cacheStore.createIndex('endpoint', 'endpoint', { unique: false })
        }

        // User preferences for offline mode
        if (!db.objectStoreNames.contains('offlineSettings')) {
          db.createObjectStore('offlineSettings', { keyPath: 'userId' })
        }
      }
    })
  }

  async saveOfflineData(
    data: Omit<OfflineData, 'id' | 'timestamp'>
  ): Promise<string> {
    if (!this.db) throw new Error('Database not initialized')

    const id = `${data.table}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const offlineData: OfflineData = {
      ...data,
      id,
      timestamp: Date.now(),
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite')
      const store = transaction.objectStore('offlineData')
      const request = store.add(offlineData)

      request.onsuccess = () => resolve(id)
      request.onerror = () => reject(request.error)
    })
  }

  async getOfflineData(filters?: {
    table?: string
    synced?: boolean
    userId?: string
  }): Promise<OfflineData[]> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readonly')
      const store = transaction.objectStore('offlineData')
      const request = store.getAll()

      request.onsuccess = () => {
        let results = request.result as OfflineData[]

        if (filters) {
          if (filters.table) {
            results = results.filter(item => item.table === filters.table)
          }
          if (filters.synced !== undefined) {
            results = results.filter(item => item.synced === filters.synced)
          }
          if (filters.userId) {
            results = results.filter(item => item.userId === filters.userId)
          }
        }

        resolve(results.sort((a, b) => a.timestamp - b.timestamp))
      }
      request.onerror = () => reject(request.error)
    })
  }

  async addToSyncQueue(
    operation: Omit<SyncQueue, 'id' | 'timestamp' | 'retryCount'>
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    const syncItem: SyncQueue = {
      ...operation,
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite')
      const store = transaction.objectStore('syncQueue')
      const request = store.add(syncItem)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getSyncQueue(): Promise<SyncQueue[]> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readonly')
      const store = transaction.objectStore('syncQueue')
      const request = store.getAll()

      request.onsuccess = () => {
        const results = request.result as SyncQueue[]
        resolve(results.sort((a, b) => a.timestamp - b.timestamp))
      }
      request.onerror = () => reject(request.error)
    })
  }

  async markAsSynced(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite')
      const store = transaction.objectStore('offlineData')
      const getRequest = store.get(id)

      getRequest.onsuccess = () => {
        const data = getRequest.result as OfflineData
        if (data) {
          data.synced = true
          const updateRequest = store.put(data)
          updateRequest.onsuccess = () => resolve()
          updateRequest.onerror = () => reject(updateRequest.error)
        } else {
          reject(new Error('Data not found'))
        }
      }
      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  async removeSyncItem(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite')
      const store = transaction.objectStore('syncQueue')
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async clearOldData(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    const cutoffTime = Date.now() - maxAge

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        ['offlineData', 'apiCache'],
        'readwrite'
      )
      const offlineStore = transaction.objectStore('offlineData')
      const cacheStore = transaction.objectStore('apiCache')

      const offlineIndex = offlineStore.index('timestamp')
      const cacheIndex = cacheStore.index('timestamp')

      const offlineRange = IDBKeyRange.upperBound(cutoffTime)
      const cacheRange = IDBKeyRange.upperBound(cutoffTime)

      let operations = 0
      let completed = 0

      const checkComplete = () => {
        if (completed === operations) resolve()
      }

      // Clean offline data that's been synced and is old
      const offlineRequest = offlineIndex.openCursor(offlineRange)
      operations++

      offlineRequest.onsuccess = event => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          const data = cursor.value as OfflineData
          if (data.synced) {
            cursor.delete()
          }
          cursor.continue()
        } else {
          completed++
          checkComplete()
        }
      }

      // Clean old cache entries
      const cacheRequest = cacheIndex.openCursor(cacheRange)
      operations++

      cacheRequest.onsuccess = event => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        } else {
          completed++
          checkComplete()
        }
      }

      transaction.onerror = () => reject(transaction.error)
    })
  }
}

export const indexedDBManager = new IndexedDBManager()
