import { useState } from 'react'
import {
  Plus,
  Thermometer,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Clock,
  // Camera,
} from 'lucide-react'
import { useConservationPoints } from './hooks/useConservationPoints'
import { useTemperatureReadings } from './hooks/useTemperatureReadings'
// import { useMaintenanceTasks } from './hooks/useMaintenanceTasks'
import { ConservationPointCard } from './components/ConservationPointCard'
import { AddPointModal } from './components/AddPointModal'
import { AddTemperatureModal } from './components/AddTemperatureModal'
import { TemperatureReadingCard } from './components/TemperatureReadingCard'
import { CollapsibleCard } from '@/components/ui/CollapsibleCard'
import { ScheduledMaintenanceCard } from '@/features/dashboard/components/ScheduledMaintenanceCard'
import type {
  ConservationPoint,
  TemperatureReading,
} from '@/types/conservation'

export default function ConservationPage() {
  const {
    conservationPoints,
    stats,
    isLoading,
    createConservationPoint,
    updateConservationPoint,
    deleteConservationPoint,
    isCreating,
    isUpdating,
    isDeleting,
  } = useConservationPoints()

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPoint, setEditingPoint] = useState<ConservationPoint | null>(
    null
  )
  const [showTemperatureModal, setShowTemperatureModal] = useState(false)
  const [selectedPointForTemperature, setSelectedPointForTemperature] =
    useState<ConservationPoint | null>(null)
  const [, setEditingReading] = useState<TemperatureReading | null>(null)

  const {
    temperatureReadings,
    stats: tempStats,
    isLoading: isLoadingReadings,
    createReading,
    // updateReading,
    deleteReading,
    isCreating: isCreatingReading,
    // isUpdating: isUpdatingReading,
    // isDeleting: isDeletingReading,
  } = useTemperatureReadings()

  // Maintenance tasks ora gestiti dal nuovo ScheduledMaintenanceCard
  // const {
  //   maintenanceTasks,
  //   stats: maintenanceStats,
  //   isLoading: isLoadingMaintenance,
  //   getTaskStatus,
  //   // createTask,
  //   // updateTask,
  //   deleteTask,
  //   completeTask,
  //   // isCreating: isCreatingTask,
  //   // isUpdating: isUpdatingTask,
  //   // isDeleting: isDeletingTask,
  //   // isCompleting: isCompletingTask,
  // } = useMaintenanceTasks()

  const handleSave = (
    data: Omit<
      ConservationPoint,
      | 'id'
      | 'company_id'
      | 'created_at'
      | 'updated_at'
      | 'status'
      | 'last_temperature_reading'
    >,
    maintenanceTasks: unknown[] = []
  ) => {
    if (editingPoint) {
      updateConservationPoint({
        id: editingPoint.id,
        data,
      })
    } else {
      createConservationPoint({
        conservationPoint: data,
        maintenanceTasks,
      })
    }
    setShowAddModal(false)
    setEditingPoint(null)
  }

  const handleEdit = (point: ConservationPoint) => {
    setEditingPoint(point)
    setShowAddModal(true)
  }

  const handleDelete = (id: string) => {
    if (
      confirm('Sei sicuro di voler eliminare questo punto di conservazione?')
    ) {
      deleteConservationPoint(id)
    }
  }

  const handleAddNew = () => {
    setEditingPoint(null)
    setShowAddModal(true)
  }

  const handleAddTemperature = (point: ConservationPoint) => {
    setSelectedPointForTemperature(point)
    setShowTemperatureModal(true)
  }

  const handleSaveTemperature = (
    data: Omit<
      TemperatureReading,
      'id' | 'company_id' | 'created_at'
    >
  ) => {
    createReading(data)
    setShowTemperatureModal(false)
    setSelectedPointForTemperature(null)
  }

  const handleEditReading = (reading: TemperatureReading) => {
    setEditingReading(reading)
    // For now, just show a simple alert - later we can add an edit modal
    alert('Modifica lettura temperatura - Funzionalità in arrivo')
  }

  const handleDeleteReading = (id: string) => {
    if (
      confirm('Sei sicuro di voler eliminare questa lettura di temperatura?')
    ) {
      deleteReading(id)
    }
  }

  // Maintenance handlers ora gestiti dal nuovo ScheduledMaintenanceCard
  // const handleCompleteMaintenance = (task: MaintenanceTask) => {
  //   if (
  //     confirm(
  //       `Sei sicuro di voler completare la manutenzione "${task.type}" per ${task.conservation_point?.name}?`
  //     )
  //   ) {
  //     completeTask({
  //       maintenance_task_id: task.id,
  //       completed_by: 'user1', // TODO: get from auth
  //       completed_at: new Date(),
  //       created_at: new Date(),
  //       notes: 'Completato tramite interfaccia web',
  //     })
  //   }
  // }

  // const handleEditMaintenance = (_task: MaintenanceTask) => {
  //   // For now, just show a simple alert - later we can add an edit modal
  //   alert('Modifica manutenzione - Funzionalità in arrivo')
  // }

  // const handleDeleteMaintenance = (id: string) => {
  //   if (confirm('Sei sicuro di voler eliminare questo task di manutenzione?')) {
  //     deleteTask(id)
  //   }
  // }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Sistema di Conservazione
          </h1>
          <p className="text-gray-600">
            Gestisci punti di conservazione e monitoraggio temperature
          </p>
        </div>
      </div>

      {/* Type Distribution */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
          Distribuzione per Tipo
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
          <div className="text-center">
            <div className="text-2xl mb-1">🌡️</div>
            <div className="text-sm text-gray-600">Ambiente</div>
            <div className="text-lg font-semibold">
              {stats.by_type.ambient ?? 0}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">❄️</div>
            <div className="text-sm text-gray-600">Frigorifero</div>
            <div className="text-lg font-semibold">
              {stats.by_type.fridge ?? 0}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">🧊</div>
            <div className="text-sm text-gray-600">Freezer</div>
            <div className="text-lg font-semibold">
              {stats.by_type.freezer ?? 0}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">⚡</div>
            <div className="text-sm text-gray-600">Abbattitore</div>
            <div className="text-lg font-semibold">
              {stats.by_type.blast ?? 0}
            </div>
          </div>
        </div>
      </div>

      {/* Conservation Points List */}
      <CollapsibleCard
        title="Punti di Conservazione"
        subtitle={`${stats.total_points} punti configurati`}
        defaultExpanded={true}
        icon={Thermometer}
        actions={
          <button
            onClick={e => {
              e.stopPropagation()
              handleAddNew()
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Aggiungi Punto</span>
          </button>
        }
      >
        {/* Mini Statistics - Punti di Conservazione per Tipo */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
          <div className="bg-gray-200 rounded-lg border border-gray-500 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-700">Frigoriferi</p>
                <p className="text-lg font-bold text-gray-900">
                  {stats.by_type.fridge ?? 0}
                </p>
              </div>
              <div className="text-xl">❄️</div>
            </div>
          </div>

          <div className="bg-blue-200 rounded-lg border border-blue-500 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-800">Freezer</p>
                <p className="text-lg font-bold text-blue-900">
                  {stats.by_type.freezer ?? 0}
                </p>
              </div>
              <div className="text-xl">🧊</div>
            </div>
          </div>

          <div className="bg-red-100 rounded-lg border border-red-400 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-700">Abbattitore</p>
                <p className="text-lg font-bold text-red-900">
                  {stats.by_type.blast ?? 0}
                </p>
              </div>
              <div className="text-xl">⚡</div>
            </div>
          </div>

          <div className="bg-green-100 rounded-lg border border-green-400 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-700">Dispensa</p>
                <p className="text-lg font-bold text-green-900">
                  {stats.by_type.ambient ?? 0}
                </p>
              </div>
              <div className="text-xl">🌡️</div>
            </div>
          </div>
        </div>

        {conservationPoints.length === 0 ? (
          <div className="text-center py-8">
            <Thermometer className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nessun punto di conservazione
            </h3>
            <p className="text-gray-600 mb-4">
              Inizia creando il primo punto di conservazione per il monitoraggio
              delle temperature.
            </p>
            <button
              onClick={handleAddNew}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Crea Primo Punto</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {conservationPoints.map(point => (
              <ConservationPointCard
                key={point.id}
                point={point}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </CollapsibleCard>

      {/* Temperature Readings List */}
      <CollapsibleCard
        title="Letture Temperature"
        subtitle={`${tempStats.total} letture registrate`}
        defaultExpanded={true}
        icon={Clock}
        actions={
          <div className="flex items-center space-x-2">
            {conservationPoints.length > 0 && (
              <select
                onChange={e => {
                  const point = conservationPoints.find(
                    p => p.id === e.target.value
                  )
                  if (point) {
                    handleAddTemperature(point)
                    // Reset select to placeholder
                    e.target.value = ''
                  }
                }}
                onClick={e => {
                  e.stopPropagation()
                }}
                onMouseDown={e => {
                  e.stopPropagation()
                }}
                value=""
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <option value="">Registra temperatura...</option>
                {conservationPoints.map(point => (
                  <option key={point.id} value={point.id}>
                    {point.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        }
      >
        {/* Mini Statistics - Letture Temperature */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-700">Totale</p>
                <p className="text-lg font-bold text-blue-900">
                  {tempStats.total}
                </p>
              </div>
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg border border-green-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-700">Conformi</p>
                <p className="text-lg font-bold text-green-900">
                  {tempStats.compliant}
                </p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-yellow-700">Attenzione</p>
                <p className="text-lg font-bold text-yellow-900">
                  {tempStats.warning}
                </p>
              </div>
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
          </div>

          <div className="bg-red-50 rounded-lg border border-red-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-700">Critiche</p>
                <p className="text-lg font-bold text-red-900">
                  {tempStats.critical}
                </p>
              </div>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
        {isLoadingReadings ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        ) : temperatureReadings.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nessuna lettura di temperatura
            </h3>
            <p className="text-gray-600 mb-4">
              Inizia registrando la prima lettura di temperatura per un punto di
              conservazione.
            </p>
            {conservationPoints.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Seleziona un punto di conservazione:
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {conservationPoints.map(point => (
                    <button
                      key={point.id}
                      onClick={() => handleAddTemperature(point)}
                      className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Thermometer className="w-4 h-4" />
                      <span>{point.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {temperatureReadings
              .sort(
                (a: TemperatureReading, b: TemperatureReading) =>
                  new Date(b.recorded_at).getTime() -
                  new Date(a.recorded_at).getTime()
              )
              .map((reading: TemperatureReading) => (
                <TemperatureReadingCard
                  key={reading.id}
                  reading={reading}
                  onEdit={handleEditReading}
                  onDelete={handleDeleteReading}
                />
              ))}
          </div>
        )}
      </CollapsibleCard>

      {/* Maintenance Tasks List - Nuovo formato con indicatori settimanali */}
      <ScheduledMaintenanceCard />

      {/* Add/Edit Point Modal */}
      <AddPointModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setEditingPoint(null)
        }}
        onSave={handleSave}
        point={editingPoint}
        isLoading={isCreating || isUpdating}
      />

      {/* Add Temperature Modal */}
      {selectedPointForTemperature && (
        <AddTemperatureModal
          isOpen={showTemperatureModal}
          onClose={() => {
            setShowTemperatureModal(false)
            setSelectedPointForTemperature(null)
          }}
          onSave={handleSaveTemperature}
          conservationPoint={selectedPointForTemperature}
          isLoading={isCreatingReading}
        />
      )}

      {/* Loading Overlay */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Eliminando...</span>
          </div>
        </div>
      )}
    </div>
  )
}
