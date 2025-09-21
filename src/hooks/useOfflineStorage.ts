import { useState, useEffect, useCallback } from 'react';

// IndexedDB database configuration
const DB_NAME = 'HACCP_OFFLINE_DB';
const DB_VERSION = 1;
const STORES = {
  CONSERVATION_POINTS: 'conservation_points',
  TEMPERATURE_READINGS: 'temperature_readings',
  MAINTENANCE_TASKS: 'maintenance_tasks',
  CALENDAR_EVENTS: 'calendar_events',
  PRODUCTS: 'products',
  STAFF: 'staff',
  DEPARTMENTS: 'departments',
  OFFLINE_DATA: 'offline_data'
} as const;

type StoreName = typeof STORES[keyof typeof STORES];

interface OfflineStorageState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
}

class OfflineStorageManager {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error(`Failed to open IndexedDB: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.setupStores(db);
      };
    });

    return this.initPromise;
  }

  private setupStores(db: IDBDatabase): void {
    // Conservation Points store
    if (!db.objectStoreNames.contains(STORES.CONSERVATION_POINTS)) {
      const store = db.createObjectStore(STORES.CONSERVATION_POINTS, { keyPath: 'id' });
      store.createIndex('type', 'type');
      store.createIndex('location', 'location');
      store.createIndex('company_id', 'company_id');
    }

    // Temperature Readings store
    if (!db.objectStoreNames.contains(STORES.TEMPERATURE_READINGS)) {
      const store = db.createObjectStore(STORES.TEMPERATURE_READINGS, { keyPath: 'id' });
      store.createIndex('conservation_point_id', 'conservation_point_id');
      store.createIndex('recorded_at', 'recorded_at');
      store.createIndex('temperature', 'temperature');
    }

    // Maintenance Tasks store
    if (!db.objectStoreNames.contains(STORES.MAINTENANCE_TASKS)) {
      const store = db.createObjectStore(STORES.MAINTENANCE_TASKS, { keyPath: 'id' });
      store.createIndex('conservation_point_id', 'conservation_point_id');
      store.createIndex('status', 'status');
      store.createIndex('due_date', 'due_date');
      store.createIndex('kind', 'kind');
    }

    // Calendar Events store
    if (!db.objectStoreNames.contains(STORES.CALENDAR_EVENTS)) {
      const store = db.createObjectStore(STORES.CALENDAR_EVENTS, { keyPath: 'id' });
      store.createIndex('start_date', 'start_date');
      store.createIndex('event_type', 'event_type');
      store.createIndex('priority', 'priority');
    }

    // Products store
    if (!db.objectStoreNames.contains(STORES.PRODUCTS)) {
      const store = db.createObjectStore(STORES.PRODUCTS, { keyPath: 'id' });
      store.createIndex('category', 'category');
      store.createIndex('allergens', 'allergens', { multiEntry: true });
    }

    // Staff store
    if (!db.objectStoreNames.contains(STORES.STAFF)) {
      const store = db.createObjectStore(STORES.STAFF, { keyPath: 'id' });
      store.createIndex('role', 'role');
      store.createIndex('department_id', 'department_id');
    }

    // Departments store
    if (!db.objectStoreNames.contains(STORES.DEPARTMENTS)) {
      const store = db.createObjectStore(STORES.DEPARTMENTS, { keyPath: 'id' });
      store.createIndex('company_id', 'company_id');
    }

    // Generic offline data store
    if (!db.objectStoreNames.contains(STORES.OFFLINE_DATA)) {
      const store = db.createObjectStore(STORES.OFFLINE_DATA, { keyPath: 'key' });
      store.createIndex('timestamp', 'timestamp');
    }
  }

  async store<T>(storeName: StoreName, data: T): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to store data: ${request.error?.message}`));
    });
  }

  async storeMany<T>(storeName: StoreName, data: T[]): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      let completed = 0;
      const total = data.length;

      if (total === 0) {
        resolve();
        return;
      }

      data.forEach((item) => {
        const request = store.put(item);

        request.onsuccess = () => {
          completed++;
          if (completed === total) {
            resolve();
          }
        };

        request.onerror = () => {
          reject(new Error(`Failed to store item: ${request.error?.message}`));
        };
      });
    });
  }

  async get<T>(storeName: StoreName, key: string): Promise<T | null> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);

      const request = store.get(key);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new Error(`Failed to get data: ${request.error?.message}`));
    });
  }

  async getAll<T>(storeName: StoreName, limit?: number): Promise<T[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);

      const request = limit ? store.getAll(undefined, limit) : store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(new Error(`Failed to get all data: ${request.error?.message}`));
    });
  }

  async getByIndex<T>(
    storeName: StoreName,
    indexName: string,
    value: any,
    limit?: number
  ): Promise<T[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);

      const request = limit ? index.getAll(value, limit) : index.getAll(value);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(new Error(`Failed to get indexed data: ${request.error?.message}`));
    });
  }

  async delete(storeName: StoreName, key: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to delete data: ${request.error?.message}`));
    });
  }

  async clear(storeName: StoreName): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to clear store: ${request.error?.message}`));
    });
  }

  async count(storeName: StoreName): Promise<number> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);

      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error(`Failed to count records: ${request.error?.message}`));
    });
  }

  async search<T>(
    storeName: StoreName,
    filter: (item: T) => boolean
  ): Promise<T[]> {
    const allItems = await this.getAll<T>(storeName);
    return allItems.filter(filter);
  }

  // Utility method to store generic offline data
  async storeOfflineData(key: string, data: any): Promise<void> {
    return this.store(STORES.OFFLINE_DATA, {
      key,
      data,
      timestamp: Date.now()
    });
  }

  async getOfflineData<T>(key: string): Promise<T | null> {
    const result = await this.get<{ key: string; data: T; timestamp: number }>(
      STORES.OFFLINE_DATA,
      key
    );
    return result ? result.data : null;
  }
}

// Singleton instance
const storageManager = new OfflineStorageManager();

export function useOfflineStorage() {
  const [state, setState] = useState<OfflineStorageState>({
    isInitialized: false,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const initStorage = async () => {
      try {
        await storageManager.init();
        setState({
          isInitialized: true,
          isLoading: false,
          error: null
        });
      } catch (error) {
        setState({
          isInitialized: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to initialize storage'
        });
      }
    };

    initStorage();
  }, []);

  const store = useCallback(async <T>(storeName: StoreName, data: T) => {
    try {
      await storageManager.store(storeName, data);
    } catch (error) {
      console.error('Storage error:', error);
      throw error;
    }
  }, []);

  const storeMany = useCallback(async <T>(storeName: StoreName, data: T[]) => {
    try {
      await storageManager.storeMany(storeName, data);
    } catch (error) {
      console.error('Storage error:', error);
      throw error;
    }
  }, []);

  const get = useCallback(async <T>(storeName: StoreName, key: string): Promise<T | null> => {
    try {
      return await storageManager.get<T>(storeName, key);
    } catch (error) {
      console.error('Storage error:', error);
      throw error;
    }
  }, []);

  const getAll = useCallback(async <T>(storeName: StoreName, limit?: number): Promise<T[]> => {
    try {
      return await storageManager.getAll<T>(storeName, limit);
    } catch (error) {
      console.error('Storage error:', error);
      throw error;
    }
  }, []);

  const getByIndex = useCallback(async <T>(
    storeName: StoreName,
    indexName: string,
    value: any,
    limit?: number
  ): Promise<T[]> => {
    try {
      return await storageManager.getByIndex<T>(storeName, indexName, value, limit);
    } catch (error) {
      console.error('Storage error:', error);
      throw error;
    }
  }, []);

  const remove = useCallback(async (storeName: StoreName, key: string) => {
    try {
      await storageManager.delete(storeName, key);
    } catch (error) {
      console.error('Storage error:', error);
      throw error;
    }
  }, []);

  const clear = useCallback(async (storeName: StoreName) => {
    try {
      await storageManager.clear(storeName);
    } catch (error) {
      console.error('Storage error:', error);
      throw error;
    }
  }, []);

  const count = useCallback(async (storeName: StoreName): Promise<number> => {
    try {
      return await storageManager.count(storeName);
    } catch (error) {
      console.error('Storage error:', error);
      throw error;
    }
  }, []);

  const search = useCallback(async <T>(
    storeName: StoreName,
    filter: (item: T) => boolean
  ): Promise<T[]> => {
    try {
      return await storageManager.search<T>(storeName, filter);
    } catch (error) {
      console.error('Storage error:', error);
      throw error;
    }
  }, []);

  const storeOfflineData = useCallback(async (key: string, data: any) => {
    try {
      await storageManager.storeOfflineData(key, data);
    } catch (error) {
      console.error('Storage error:', error);
      throw error;
    }
  }, []);

  const getOfflineData = useCallback(async <T>(key: string): Promise<T | null> => {
    try {
      return await storageManager.getOfflineData<T>(key);
    } catch (error) {
      console.error('Storage error:', error);
      throw error;
    }
  }, []);

  return {
    // State
    isInitialized: state.isInitialized,
    isLoading: state.isLoading,
    error: state.error,

    // Core operations
    store,
    storeMany,
    get,
    getAll,
    getByIndex,
    remove,
    clear,
    count,
    search,

    // Utility operations
    storeOfflineData,
    getOfflineData,

    // Store names for convenience
    STORES
  };
}

export { STORES as OFFLINE_STORES };
export type { StoreName as OfflineStoreName };