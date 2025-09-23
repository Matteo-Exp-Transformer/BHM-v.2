import { useState } from 'react'
import {
  Thermometer,
  Plus,
  Wifi,
  WifiOff,
  Database,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Upload,
} from 'lucide-react'
import { useOfflineSync } from '@/hooks/useOfflineSync'
import { useOfflineStorage } from '@/hooks/useOfflineStorage'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { TemperatureReadingModal } from './TemperatureReadingModal'
import type {
  ConservationPoint,
  CreateTemperatureReadingRequest,
} from '@/types/conservation'

export function OfflineConservationDemo() {
  const [showTempModal, setShowTempModal] = useState(false)
  const [selectedPoint, setSelectedPoint] = useState<ConservationPoint | null>(
    null
  )

  const {
    isSyncing,
    pendingOperations,
    lastSyncTime,
    syncErrors,
    syncPendingOperations,
    hasPendingOperations,
    hasErrors,
  } = useOfflineSync()

  const {
    isInitialized: storageReady,
    store,
    STORES,
  } = useOfflineStorage()

  const { isConnected, connectionQuality, isSlowConnection, effectiveType } =
    useNetworkStatus()

  // Mock conservation points for demo
  const mockConservationPoints: ConservationPoint[] = [
    {
      id: '1',
      company_id: 'company1',
      name: 'Frigorifero Principale',
      type: 'fridge',
      setpoint_temp: 4,
      status: 'normal',
      is_blast_chiller: false,
      department_id: 'dept1',
      product_categories: ['latticini', 'carni'],
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: '2',
      company_id: 'company1',
      name: 'Congelatore Blast',
      type: 'blast',
      setpoint_temp: -18,
      status: 'normal',
      is_blast_chiller: true,
      department_id: 'dept1',
      product_categories: ['surgelati'],
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: '3',
      company_id: 'company1',
      name: 'Cella Carni',
      type: 'fridge',
      setpoint_temp: 2,
      status: 'warning',
      is_blast_chiller: false,
      department_id: 'dept1',
      product_categories: ['carni', 'salumi'],
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]

  const handleAddTemperatureReading = async () => {
    if (!selectedPoint) return

    // Demo: Add a random temperature reading
    const reading: CreateTemperatureReadingRequest = {
      conservation_point_id: selectedPoint.id,
      temperature: selectedPoint.setpoint_temp + (Math.random() - 0.5) * 4,
      method: 'manual',
      notes: 'Lettura demo offline',
    }

    try {
      // Simulate the temperature reading creation
      const tempReading = {
        id: `temp_${Date.now()}`,
        ...reading,
        recorded_at: new Date(),
        created_at: new Date(),
        status: 'compliant' as const,
      }

      // Store in offline storage
      await store(STORES.TEMPERATURE_READINGS, tempReading)

      console.log('Temperature reading stored offline:', tempReading)
      setShowTempModal(false)
      setSelectedPoint(null)
    } catch (error) {
      console.error('Failed to store temperature reading:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-green-600 bg-green-50'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50'
      case 'critical':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getConnectionStatusColor = () => {
    if (!isConnected) return 'text-red-600'
    if (isSlowConnection) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Offline Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Thermometer className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Sistema Conservazione - Demo Offline
            </h1>
            <p className="text-gray-600">
              Test del sistema di sincronizzazione offline
            </p>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getConnectionStatusColor()}`}
          >
            {isConnected ? (
              <Wifi className="w-4 h-4" />
            ) : (
              <WifiOff className="w-4 h-4" />
            )}
            <span>{isConnected ? 'Online' : 'Offline'}</span>
            {effectiveType && isConnected && (
              <span className="text-xs opacity-75">({effectiveType})</span>
            )}
          </div>

          {storageReady && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Database className="w-4 h-4" />
              <span>Storage Ready</span>
            </div>
          )}
        </div>
      </div>

      {/* Sync Status Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Stato Sincronizzazione
          </h3>
          <button
            onClick={() => syncPendingOperations()}
            disabled={!isConnected || isSyncing}
            className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`}
            />
            {isSyncing ? 'Sincronizzando...' : 'Sincronizza'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <Upload className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-sm font-medium text-blue-900">In Coda</div>
              <div className="text-lg font-bold text-blue-700">
                {pendingOperations.length}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <div className="text-sm font-medium text-red-900">Errori</div>
              <div className="text-lg font-bold text-red-700">
                {syncErrors.length}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <div className="text-sm font-medium text-green-900">
                Connessione
              </div>
              <div className="text-sm font-medium text-green-700 capitalize">
                {connectionQuality}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Clock className="w-5 h-5 text-gray-600" />
            <div>
              <div className="text-sm font-medium text-gray-900">
                Ultimo Sync
              </div>
              <div className="text-sm text-gray-700">
                {lastSyncTime
                  ? lastSyncTime.toLocaleTimeString('it-IT')
                  : 'Mai'}
              </div>
            </div>
          </div>
        </div>

        {/* Pending Operations */}
        {hasPendingOperations && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">
              Operazioni in Attesa
            </h4>
            <div className="space-y-1">
              {pendingOperations.slice(0, 3).map(op => (
                <div
                  key={op.id}
                  className="flex justify-between text-sm text-yellow-700"
                >
                  <span>
                    {op.type} {op.entity}
                  </span>
                  <span>
                    {new Date(op.timestamp).toLocaleTimeString('it-IT')}
                  </span>
                </div>
              ))}
              {pendingOperations.length > 3 && (
                <div className="text-sm text-yellow-600">
                  ... e altre {pendingOperations.length - 3} operazioni
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sync Errors */}
        {hasErrors && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg">
            <h4 className="text-sm font-medium text-red-800 mb-2">
              Errori di Sincronizzazione
            </h4>
            <div className="space-y-1">
              {syncErrors.slice(0, 2).map((error, index) => (
                <div key={index} className="text-sm text-red-700">
                  <div className="font-medium">
                    {error.operation.type} {error.operation.entity}
                  </div>
                  <div className="text-red-600 truncate">{error.error}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Conservation Points */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Punti di Conservazione
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Clicca su un punto per aggiungere una lettura temperatura (modalità
            offline)
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockConservationPoints.map(point => (
              <div
                key={point.id}
                onClick={() => {
                  setSelectedPoint(point)
                  setShowTempModal(true)
                }}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{point.name}</h4>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(point.status)}`}
                  >
                    {point.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Tipo:</span>
                    <span className="font-medium capitalize">{point.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Setpoint:</span>
                    <span className="font-medium">{point.setpoint_temp}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Posizione:</span>
                    <span className="font-medium">{point.name}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <button className="flex items-center gap-2 text-blue-600 text-sm font-medium hover:text-blue-800">
                    <Plus className="w-4 h-4" />
                    Aggiungi Lettura
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Demo Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Istruzioni Demo
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>
            • <strong>Modalità Online:</strong> Le letture vengono salvate
            direttamente su Supabase e anche in cache locale
          </p>
          <p>
            • <strong>Modalità Offline:</strong> Le letture vengono salvate
            localmente e messe in coda per la sincronizzazione
          </p>
          <p>
            • <strong>Test Offline:</strong> Disabilita la connessione per
            testare la modalità offline
          </p>
          <p>
            • <strong>Sincronizzazione:</strong> Al ritorno online, i dati
            vengono sincronizzati automaticamente
          </p>
        </div>
      </div>

      {/* Temperature Reading Modal */}
      {showTempModal && selectedPoint && (
        <TemperatureReadingModal
          conservationPoint={selectedPoint}
          onClose={() => {
            setShowTempModal(false)
            setSelectedPoint(null)
          }}
          onCreate={handleAddTemperatureReading}
          isCreating={false}
        />
      )}
    </div>
  )
}
