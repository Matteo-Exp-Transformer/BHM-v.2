import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface SyncOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

interface OfflineSyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingOperations: SyncOperation[];
  lastSyncTime: Date | null;
  syncErrors: Array<{ operation: SyncOperation; error: string }>;
}

interface UseOfflineSyncOptions {
  autoSync?: boolean;
  syncInterval?: number;
  maxRetries?: number;
}

export function useOfflineSync(options: UseOfflineSyncOptions = {}) {
  const {
    autoSync = true,
    syncInterval = 30000, // 30 seconds
    maxRetries = 3
  } = options;

  const queryClient = useQueryClient();
  const [state, setState] = useState<OfflineSyncState>({
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingOperations: [],
    lastSyncTime: null,
    syncErrors: []
  });

  // Load pending operations from storage
  useEffect(() => {
    loadPendingOperations();
  }, []);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      if (autoSync) {
        syncPendingOperations();
      }
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [autoSync]);

  // Auto sync interval
  useEffect(() => {
    if (!autoSync || !state.isOnline) return;

    const interval = setInterval(() => {
      if (state.pendingOperations.length > 0) {
        syncPendingOperations();
      }
    }, syncInterval);

    return () => clearInterval(interval);
  }, [autoSync, state.isOnline, state.pendingOperations.length, syncInterval]);

  // Service Worker message handling
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'SYNC_COMPLETE') {
          setState(prev => ({
            ...prev,
            lastSyncTime: new Date(),
            isSyncing: false
          }));
          // Refresh relevant queries
          queryClient.invalidateQueries({ queryKey: ['conservation'] });
          queryClient.invalidateQueries({ queryKey: ['calendar'] });
          queryClient.invalidateQueries({ queryKey: ['maintenance'] });
        }
      };

      navigator.serviceWorker.addEventListener('message', handleMessage);
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }
  }, [queryClient]);

  const loadPendingOperations = async () => {
    try {
      const stored = localStorage.getItem('haccp_pending_operations');
      if (stored) {
        const operations = JSON.parse(stored);
        setState(prev => ({ ...prev, pendingOperations: operations }));
      }
    } catch (error) {
      console.error('Failed to load pending operations:', error);
    }
  };

  const savePendingOperations = async (operations: SyncOperation[]) => {
    try {
      localStorage.setItem('haccp_pending_operations', JSON.stringify(operations));
    } catch (error) {
      console.error('Failed to save pending operations:', error);
    }
  };

  const queueOperation = useCallback(async (
    type: SyncOperation['type'],
    entity: string,
    data: any,
    id?: string
  ): Promise<string> => {
    const operation: SyncOperation = {
      id: id || `${entity}_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      entity,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries
    };

    setState(prev => {
      const newOperations = [...prev.pendingOperations, operation];
      savePendingOperations(newOperations);
      return {
        ...prev,
        pendingOperations: newOperations
      };
    });

    // Register background sync if available
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('general-data-sync');
      } catch (error) {
        console.error('Failed to register background sync:', error);
      }
    }

    return operation.id;
  }, [maxRetries]);

  const syncPendingOperations = useCallback(async () => {
    if (!state.isOnline || state.isSyncing || state.pendingOperations.length === 0) {
      return;
    }

    setState(prev => ({ ...prev, isSyncing: true, syncErrors: [] }));

    const results = await Promise.allSettled(
      state.pendingOperations.map(operation => syncSingleOperation(operation))
    );

    const successfulOperations: string[] = [];
    const failedOperations: Array<{ operation: SyncOperation; error: string }> = [];

    results.forEach((result, index) => {
      const operation = state.pendingOperations[index];

      if (result.status === 'fulfilled' && result.value) {
        successfulOperations.push(operation.id);
      } else {
        const error = result.status === 'rejected' ? result.reason : 'Unknown error';

        // Increment retry count
        operation.retryCount++;

        if (operation.retryCount >= operation.maxRetries) {
          failedOperations.push({ operation, error: error.toString() });
          successfulOperations.push(operation.id); // Remove from queue
        } else {
          // Keep in queue for retry
        }
      }
    });

    setState(prev => {
      const remainingOperations = prev.pendingOperations.filter(
        op => !successfulOperations.includes(op.id)
      );

      savePendingOperations(remainingOperations);

      return {
        ...prev,
        pendingOperations: remainingOperations,
        syncErrors: failedOperations,
        isSyncing: false,
        lastSyncTime: new Date()
      };
    });

    // Invalidate relevant queries
    if (successfulOperations.length > 0) {
      queryClient.invalidateQueries({ queryKey: ['conservation'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    }

  }, [state.isOnline, state.isSyncing, state.pendingOperations, queryClient]);

  const syncSingleOperation = async (operation: SyncOperation): Promise<boolean> => {
    try {
      const endpoint = getEndpointForEntity(operation.entity);
      const url = operation.type === 'CREATE'
        ? endpoint
        : `${endpoint}/${operation.data.id}`;

      const method = {
        'CREATE': 'POST',
        'UPDATE': 'PUT',
        'DELETE': 'DELETE'
      }[operation.type];

      const body = operation.type !== 'DELETE' ? JSON.stringify(operation.data) : undefined;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers here
        },
        body
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error(`Failed to sync operation ${operation.id}:`, error);
      throw error;
    }
  };

  const getEndpointForEntity = (entity: string): string => {
    const endpoints: Record<string, string> = {
      'temperature-reading': '/api/temperature-readings',
      'maintenance-task': '/api/maintenance-tasks',
      'conservation-point': '/api/conservation-points',
      'calendar-event': '/api/calendar-events',
      'staff': '/api/staff',
      'department': '/api/departments',
      'product': '/api/products'
    };

    return endpoints[entity] || `/api/${entity}`;
  };

  const clearSyncErrors = useCallback(() => {
    setState(prev => ({ ...prev, syncErrors: [] }));
  }, []);

  const retrySyncOperation = useCallback(async (operationId: string) => {
    const operation = state.pendingOperations.find(op => op.id === operationId);
    if (!operation) return;

    operation.retryCount = 0; // Reset retry count
    await syncPendingOperations();
  }, [state.pendingOperations, syncPendingOperations]);

  const removeOperation = useCallback((operationId: string) => {
    setState(prev => {
      const newOperations = prev.pendingOperations.filter(op => op.id !== operationId);
      savePendingOperations(newOperations);
      return {
        ...prev,
        pendingOperations: newOperations
      };
    });
  }, []);

  return {
    // State
    isOnline: state.isOnline,
    isSyncing: state.isSyncing,
    pendingOperations: state.pendingOperations,
    lastSyncTime: state.lastSyncTime,
    syncErrors: state.syncErrors,

    // Actions
    queueOperation,
    syncPendingOperations,
    clearSyncErrors,
    retrySyncOperation,
    removeOperation,

    // Utilities
    hasPendingOperations: state.pendingOperations.length > 0,
    hasErrors: state.syncErrors.length > 0
  };
}