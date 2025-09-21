import React from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Upload,
  Download
} from 'lucide-react';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

interface SyncStatusBarProps {
  position?: 'top' | 'bottom';
  showDetails?: boolean;
  className?: string;
}

export function SyncStatusBar({
  position = 'bottom',
  showDetails = false,
  className = ''
}: SyncStatusBarProps) {
  const {
    isOnline,
    isSyncing,
    pendingOperations,
    lastSyncTime,
    syncErrors,
    syncPendingOperations,
    hasPendingOperations,
    hasErrors
  } = useOfflineSync();

  const {
    isSlowConnection,
    connectionQuality,
    effectiveType
  } = useNetworkStatus();

  if (!showDetails && isOnline && !hasPendingOperations && !hasErrors) {
    return null; // Hide when everything is normal
  }

  const getStatusColor = () => {
    if (!isOnline) return 'bg-red-500';
    if (hasErrors) return 'bg-red-500';
    if (hasPendingOperations) return 'bg-yellow-500';
    if (isSyncing) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (isSyncing) return 'Sincronizzazione...';
    if (hasErrors) return `${syncErrors.length} errori di sync`;
    if (hasPendingOperations) return `${pendingOperations.length} operazioni in coda`;
    return 'Sincronizzato';
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="w-4 h-4" />;
    if (isSyncing) return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (hasErrors) return <AlertCircle className="w-4 h-4" />;
    if (hasPendingOperations) return <Upload className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  const positionClasses = position === 'top'
    ? 'top-0 border-b'
    : 'bottom-0 border-t';

  return (
    <div className={`
      fixed left-0 right-0 ${positionClasses} bg-white border-gray-200 z-40
      ${className}
    `}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2">
          {/* Status indicator */}
          <div className="flex items-center gap-3">
            <div className={`
              flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm font-medium
              ${getStatusColor()}
            `}>
              {getStatusIcon()}
              <span>{getStatusText()}</span>
            </div>

            {/* Connection quality indicator */}
            {isOnline && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Wifi className="w-3 h-3" />
                <span className="capitalize">{effectiveType || 'unknown'}</span>
                {isSlowConnection && (
                  <span className="text-yellow-600 font-medium">(lenta)</span>
                )}
              </div>
            )}
          </div>

          {/* Actions and details */}
          <div className="flex items-center gap-3">
            {/* Last sync time */}
            {lastSyncTime && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>
                  {lastSyncTime.toLocaleTimeString('it-IT', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}

            {/* Manual sync button */}
            {isOnline && hasPendingOperations && (
              <button
                onClick={() => syncPendingOperations()}
                disabled={isSyncing}
                className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                Sync
              </button>
            )}
          </div>
        </div>

        {/* Detailed status (expanded view) */}
        {showDetails && (
          <div className="pb-3 border-t border-gray-100 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {/* Pending operations */}
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-yellow-500" />
                <span className="text-gray-600">In coda:</span>
                <span className="font-medium">{pendingOperations.length}</span>
              </div>

              {/* Sync errors */}
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-gray-600">Errori:</span>
                <span className="font-medium">{syncErrors.length}</span>
              </div>

              {/* Connection info */}
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <span className="text-gray-600">Connessione:</span>
                <span className="font-medium capitalize">{connectionQuality}</span>
              </div>
            </div>

            {/* Recent operations list */}
            {pendingOperations.length > 0 && (
              <div className="mt-3">
                <h4 className="text-xs font-medium text-gray-700 mb-2">
                  Operazioni in attesa:
                </h4>
                <div className="space-y-1">
                  {pendingOperations.slice(0, 3).map((operation) => (
                    <div
                      key={operation.id}
                      className="flex items-center justify-between text-xs bg-gray-50 rounded px-2 py-1"
                    >
                      <span className="text-gray-600">
                        {operation.type} {operation.entity}
                      </span>
                      <span className="text-gray-500">
                        {new Date(operation.timestamp).toLocaleTimeString('it-IT', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  ))}
                  {pendingOperations.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      ... e altre {pendingOperations.length - 3} operazioni
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sync errors list */}
            {syncErrors.length > 0 && (
              <div className="mt-3">
                <h4 className="text-xs font-medium text-red-700 mb-2">
                  Errori di sincronizzazione:
                </h4>
                <div className="space-y-1">
                  {syncErrors.slice(0, 2).map((error, index) => (
                    <div
                      key={index}
                      className="text-xs bg-red-50 text-red-700 rounded px-2 py-1"
                    >
                      <div className="font-medium">
                        {error.operation.type} {error.operation.entity}
                      </div>
                      <div className="text-red-600 truncate">
                        {error.error}
                      </div>
                    </div>
                  ))}
                  {syncErrors.length > 2 && (
                    <div className="text-xs text-red-500 text-center">
                      ... e altri {syncErrors.length - 2} errori
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}