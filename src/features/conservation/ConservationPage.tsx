import { useState } from 'react'
import {
  Plus,
  Thermometer,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Clock,
  // Camera,
  Wrench,
} from 'lucide-react'
import { useConservationPoints } from './hooks/useConservationPoints'
import { useTemperatureReadings } from './hooks/useTemperatureReadings'
import { useMaintenanceTasks } from './hooks/useMaintenanceTasks'
import { ConservationPointCard } from './components/ConservationPointCard'
import { AddPointModal } from './components/AddPointModal'
import { AddTemperatureModal } from './components/AddTemperatureModal'
import { TemperatureReadingCard } from './components/TemperatureReadingCard'
import { MaintenanceTaskCard } from './components/MaintenanceTaskCard'
import { CollapsibleCard } from '@/components/ui/CollapsibleCard'
import {
  ConservationPoint,
  TemperatureReading,
  MaintenanceTask,
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

  const {
    maintenanceTasks,
    stats: maintenanceStats,
    isLoading: isLoadingMaintenance,
    getTaskStatus,
    // createTask,
    // updateTask,
    deleteTask,
    completeTask,
    // isCreating: isCreatingTask,
    // isUpdating: isUpdatingTask,
    // isDeleting: isDeletingTask,
    // isCompleting: isCompletingTask,
  } = useMaintenanceTasks()

  const handleSave = (
    data: Omit<
      ConservationPoint,
      | 'id'
      | 'company_id'
      | 'created_at'
      | 'updated_at'
      | 'status'
      | 'last_temperature_reading'
    >
  ) => {
    if (editingPoint) {
      updateConservationPoint({
        id: editingPoint.id,
        data,
      })
    } else {
      createConservationPoint(data)
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
      'id' | 'company_id' | 'recorded_at' | 'validation_status'
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

  // Maintenance handlers
  const handleCompleteMaintenance = (task: MaintenanceTask) => {
    if (
      confirm(
        `Sei sicuro di voler completare la manutenzione "${task.kind}" per ${task.conservation_point?.name}?`
      )
    ) {
      completeTask({
        maintenance_task_id: task.id,
        completed_by: 'user1', // TODO: get from auth
        completed_at: new Date(),
        status: 'completed',
        checklist_completed: Array.from(task.checklist || []),
        notes: 'Completato tramite interfaccia web',
      })
    }
  }

  const handleEditMaintenance = (_task: MaintenanceTask) => {
    // For now, just show a simple alert - later we can add an edit modal
    alert('Modifica manutenzione - Funzionalità in arrivo')
  }

  const handleDeleteMaintenance = (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questo task di manutenzione?')) {
      deleteTask(id)
    }
  }

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl mb-1">🌡️</div>
            <div className="text-sm text-gray-600">Ambiente</div>
            <div className="text-lg font-semibold">{stats.byType.ambient}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">❄️</div>
            <div className="text-sm text-gray-600">Frigorifero</div>
            <div className="text-lg font-semibold">{stats.byType.fridge}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">🧊</div>
            <div className="text-sm text-gray-600">Freezer</div>
            <div className="text-lg font-semibold">{stats.byType.freezer}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">⚡</div>
            <div className="text-sm text-gray-600">Abbattitore</div>
            <div className="text-lg font-semibold">{stats.byType.blast}</div>
          </div>
        </div>
      </div>

      {/* Conservation Points List */}
      <CollapsibleCard
        title="Punti di Conservazione"
        subtitle={`${stats.total} punti configurati`}
        defaultExpanded={true}
        icon={Thermometer}
        actions={
          <button
            onClick={e => {
              e.stopPropagation()
              handleAddNew()
            }}
            className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Aggiungi</span>
          </button>
        }
      >
        {/* Mini Statistics - Punti di Conservazione */}
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-700">Totale</p>
                <p className="text-lg font-bold text-blue-900">{stats.total}</p>
              </div>
              <Thermometer className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg border border-green-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-700">Regolari</p>
                <p className="text-lg font-bold text-green-900">
                  {stats.normal}
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
                  {stats.warning}
                </p>
              </div>
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
          </div>

          <div className="bg-red-50 rounded-lg border border-red-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-700">Critici</p>
                <p className="text-lg font-bold text-red-900">
                  {stats.critical}
                </p>
              </div>
              <AlertTriangle className="w-5 h-5 text-red-600" />
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
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
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
                (a, b) =>
                  new Date(b.recorded_at).getTime() -
                  new Date(a.recorded_at).getTime()
              )
              .map(reading => (
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

      {/* Maintenance Tasks List */}
      <CollapsibleCard
        title="Manutenzioni Programmate"
        subtitle={`${maintenanceStats.total} task configurati`}
        defaultExpanded={true}
        icon={Wrench}
        actions={
          <button
            onClick={e => {
              e.stopPropagation()
              alert('Aggiungi manutenzione - Funzionalità in arrivo')
            }}
            className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Aggiungi</span>
          </button>
        }
      >
        {/* Mini Statistics - Manutenzioni */}
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-700">Totale</p>
                <p className="text-lg font-bold text-blue-900">
                  {maintenanceStats.total}
                </p>
              </div>
              <Wrench className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          <div className="bg-red-50 rounded-lg border border-red-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-700">In Ritardo</p>
                <p className="text-lg font-bold text-red-900">
                  {maintenanceStats.overdue}
                </p>
              </div>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-yellow-700">Urgenti</p>
                <p className="text-lg font-bold text-yellow-900">
                  {maintenanceStats.pending}
                </p>
              </div>
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg border border-green-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-700">Programmate</p>
                <p className="text-lg font-bold text-green-900">
                  {maintenanceStats.scheduled}
                </p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        {/* Maintenance Type Distribution - Mini */}
        <div className="mb-6 bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold mb-3 flex items-center text-gray-700">
            <Wrench className="w-4 h-4 mr-2 text-blue-600" />
            Distribuzione per Tipo
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-lg mb-1">🌡️</div>
              <div className="text-xs text-gray-600">Controllo Temperature</div>
              <div className="text-sm font-semibold">
                {maintenanceStats.byType.temperature}
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg mb-1">🧼</div>
              <div className="text-xs text-gray-600">Sanificazione</div>
              <div className="text-sm font-semibold">
                {maintenanceStats.byType.sanitization}
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg mb-1">❄️</div>
              <div className="text-xs text-gray-600">Sbrinamento</div>
              <div className="text-sm font-semibold">
                {maintenanceStats.byType.defrosting}
              </div>
            </div>
          </div>
        </div>
        {isLoadingMaintenance ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        ) : maintenanceTasks.length === 0 ? (
          <div className="text-center py-8">
            <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nessuna manutenzione programmata
            </h3>
            <p className="text-gray-600 mb-4">
              Le manutenzioni vengono create automaticamente per ogni punto di
              conservazione.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {maintenanceTasks
              .sort((a, b) => {
                // Sort by status: overdue first, then pending, then scheduled
                const statusPriority = { overdue: 0, pending: 1, scheduled: 2 }
                const aStatus = getTaskStatus(a) as keyof typeof statusPriority
                const bStatus = getTaskStatus(b) as keyof typeof statusPriority

                if (statusPriority[aStatus] !== statusPriority[bStatus]) {
                  return statusPriority[aStatus] - statusPriority[bStatus]
                }

                // Then by due date
                return (
                  new Date(a.next_due_date).getTime() -
                  new Date(b.next_due_date).getTime()
                )
              })
              .map(task => (
                <MaintenanceTaskCard
                  key={task.id}
                  task={task}
                  status={
                    getTaskStatus(task) as 'overdue' | 'pending' | 'scheduled'
                  }
                  onComplete={handleCompleteMaintenance}
                  onEdit={handleEditMaintenance}
                  onDelete={handleDeleteMaintenance}
                />
              ))}
          </div>
        )}
      </CollapsibleCard>

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
