import { useState, useMemo } from 'react'
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
import { useTemperatureReadings, getLatestReadingByPoint, getPointStatus } from './hooks/useTemperatureReadings'
import { getCorrectiveAction } from './utils/correctiveActions'
// import { useMaintenanceTasks } from './hooks/useMaintenanceTasks'
import { ConservationPointCard } from './components/ConservationPointCard'
import { AddPointModal } from './components/AddPointModal'
import { AddTemperatureModal } from './components/AddTemperatureModal'
import { TemperatureReadingCard } from './components/TemperatureReadingCard'
import { CollapsibleCard } from '@/components/ui/CollapsibleCard'
import { ScheduledMaintenanceCard } from '@/features/dashboard/components/ScheduledMaintenanceCard'
import { TemperaturePointStatusCard } from './components/TemperaturePointStatusCard'
import { CorrectiveActionPopover } from './components/CorrectiveActionPopover'
import { TemperatureAlertsPanel } from './components/TemperatureAlertsPanel'
import { TemperatureHistorySection } from './components/TemperatureHistorySection'
import { TemperatureAnalysisTab } from './components/TemperatureAnalysisTab'
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
  const [editingReading, setEditingReading] = useState<TemperatureReading | null>(null)

  // New state for temperature tabs system
  const [activeTemperatureTab, setActiveTemperatureTab] = useState<'status' | 'history' | 'analysis'>('status')
  const [pointsInRichiestaLettura, setPointsInRichiestaLettura] = useState<Set<string>>(new Set())
  const [correctiveActionPopover, setCorrectiveActionPopover] = useState<{
    open: boolean
    point: ConservationPoint | null
    reading: TemperatureReading | null
  }>({ open: false, point: null, reading: null })

  const {
    temperatureReadings,
    stats: tempStats,
    isLoading: isLoadingReadings,
    createReading,
    updateReading,
    deleteReading,
    isCreating: isCreatingReading,
    isUpdating: isUpdatingReading,
    // isDeleting: isDeletingReading,
  } = useTemperatureReadings()

  // Punti arricchiti con ultima lettura: i bollini stato (verde/giallo/rosso) usano classifyPointStatus che legge last_temperature_reading
  const pointsWithLastReading = useMemo(() => {
    return conservationPoints.map(point => ({
      ...point,
      last_temperature_reading: getLatestReadingByPoint(temperatureReadings ?? [], point.id),
    }))
  }, [conservationPoints, temperatureReadings])

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
    if (editingReading) {
      // Update existing reading
      updateReading({
        id: editingReading.id,
        data,
      })
      setEditingReading(null)
    } else {
      // Create new reading
      createReading(data)

      // Remove point from "richiesta lettura" state if it was there
      if (data.conservation_point_id) {
        setPointsInRichiestaLettura(prev => {
          const newSet = new Set(prev)
          newSet.delete(data.conservation_point_id)
          return newSet
        })
      }
    }
    setShowTemperatureModal(false)
    setSelectedPointForTemperature(null)
  }

  const handleCorrectiveAction = (point: ConservationPoint, reading: TemperatureReading) => {
    setCorrectiveActionPopover({
      open: true,
      point,
      reading,
    })
  }

  const handleConfirmCorrectiveAction = () => {
    if (correctiveActionPopover.point) {
      // Add point to "richiesta lettura" state
      setPointsInRichiestaLettura(prev => new Set(prev).add(correctiveActionPopover.point!.id))
    }

    // Close popover
    setCorrectiveActionPopover({ open: false, point: null, reading: null })
  }

  const handleEditReading = (reading: TemperatureReading) => {
    setEditingReading(reading)
    // Find the conservation point for this reading
    const point = conservationPoints.find(
      p => p.id === reading.conservation_point_id
    ) || null
    setSelectedPointForTemperature(point)
    setShowTemperatureModal(true)
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
          <div className="space-y-4">
            {/* Frigoriferi */}
            <CollapsibleCard
              title="Frigoriferi"
              subtitle={`${stats.by_type.fridge ?? 0} punti configurati`}
              defaultExpanded={true}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {pointsWithLastReading
                  .filter(point => point.type === 'fridge')
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(point => (
                    <ConservationPointCard
                      key={point.id}
                      point={point}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
              </div>
              {pointsWithLastReading.filter(point => point.type === 'fridge').length === 0 && (
                <p className="text-center text-gray-500 py-4">Nessun frigorifero configurato</p>
              )}
            </CollapsibleCard>

            {/* Congelatori */}
            <CollapsibleCard
              title="Congelatori"
              subtitle={`${stats.by_type.freezer ?? 0} punti configurati`}
              defaultExpanded={true}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {pointsWithLastReading
                  .filter(point => point.type === 'freezer')
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(point => (
                    <ConservationPointCard
                      key={point.id}
                      point={point}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
              </div>
              {pointsWithLastReading.filter(point => point.type === 'freezer').length === 0 && (
                <p className="text-center text-gray-500 py-4">Nessun congelatore configurato</p>
              )}
            </CollapsibleCard>

            {/* Abbattitori */}
            <CollapsibleCard
              title="Abbattitori"
              subtitle={`${stats.by_type.blast ?? 0} punti configurati`}
              defaultExpanded={true}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {pointsWithLastReading
                  .filter(point => point.type === 'blast')
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(point => (
                    <ConservationPointCard
                      key={point.id}
                      point={point}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
              </div>
              {pointsWithLastReading.filter(point => point.type === 'blast').length === 0 && (
                <p className="text-center text-gray-500 py-4">Nessun abbattitore configurato</p>
              )}
            </CollapsibleCard>

            {/* Ambiente/Dispensa */}
            <CollapsibleCard
              title="Ambiente / Dispensa"
              subtitle={`${stats.by_type.ambient ?? 0} punti configurati`}
              defaultExpanded={true}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {pointsWithLastReading
                  .filter(point => point.type === 'ambient')
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(point => (
                    <ConservationPointCard
                      key={point.id}
                      point={point}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
              </div>
              {pointsWithLastReading.filter(point => point.type === 'ambient').length === 0 && (
                <p className="text-center text-gray-500 py-4">Nessun punto ambiente configurato</p>
              )}
            </CollapsibleCard>
          </div>
        )}
      </CollapsibleCard>

      {/* Temperature Readings List - New 3-Tab System */}
      <CollapsibleCard
        title="Letture Temperature"
        subtitle={`${tempStats.total} letture registrate`}
        defaultExpanded={true}
        icon={Clock}
      >
        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-4" aria-label="Tabs">
            <button
              onClick={() => setActiveTemperatureTab('status')}
              className={`
                pb-3 px-1 text-sm font-medium border-b-2 transition-colors
                ${activeTemperatureTab === 'status'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              Stato Corrente
            </button>
            <button
              onClick={() => setActiveTemperatureTab('history')}
              className={`
                pb-3 px-1 text-sm font-medium border-b-2 transition-colors
                ${activeTemperatureTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              Storico
            </button>
            <button
              onClick={() => setActiveTemperatureTab('analysis')}
              className={`
                pb-3 px-1 text-sm font-medium border-b-2 transition-colors
                ${activeTemperatureTab === 'analysis'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              Analisi
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTemperatureTab === 'status' && (
          <div>
            {isLoadingReadings ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : conservationPoints.length === 0 ? (
              <div className="text-center py-8">
                <Thermometer className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nessun punto di conservazione
                </h3>
                <p className="text-gray-600">
                  Crea prima dei punti di conservazione per iniziare a monitorare le temperature.
                </p>
              </div>
            ) : (
              <>
                {/* Alerts Panel */}
                <TemperatureAlertsPanel
                  anomalies={conservationPoints
                    .map(point => {
                      const latestReading = getLatestReadingByPoint(temperatureReadings, point.id)
                      if (!latestReading) return null
                      const action = getCorrectiveAction(latestReading, point)
                      return action ? { point, reading: latestReading } : null
                    })
                    .filter((item): item is { point: ConservationPoint; reading: TemperatureReading } => item !== null)
                  }
                  missingReadings={conservationPoints.filter(point => {
                    const latestReading = getLatestReadingByPoint(temperatureReadings, point.id)
                    if (!latestReading) return true

                    // Check if reading is from today
                    const readingDate = new Date(latestReading.recorded_at)
                    const today = new Date()
                    const isToday =
                      readingDate.getDate() === today.getDate() &&
                      readingDate.getMonth() === today.getMonth() &&
                      readingDate.getFullYear() === today.getFullYear()

                    return !isToday
                  })}
                  onGoToPoint={(pointId) => {
                    // Scroll to point card (could enhance this later)
                    const point = conservationPoints.find(p => p.id === pointId)
                    if (point) {
                      handleAddTemperature(point)
                    }
                  }}
                  onAddReading={(point) => handleAddTemperature(point)}
                />

                {/* Points Status Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {conservationPoints.map(point => {
                    const latestReading = getLatestReadingByPoint(temperatureReadings, point.id)
                    const status = getPointStatus(point, latestReading, pointsInRichiestaLettura)

                    return (
                      <TemperaturePointStatusCard
                        key={point.id}
                        point={point}
                        latestReading={latestReading}
                        status={status}
                        onAddReading={() => handleAddTemperature(point)}
                        onCorrectiveAction={
                          status === 'critico' && latestReading
                            ? () => handleCorrectiveAction(point, latestReading)
                            : undefined
                        }
                      />
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {activeTemperatureTab === 'history' && (
          <TemperatureHistorySection
            readings={temperatureReadings}
            points={conservationPoints}
          />
        )}

        {activeTemperatureTab === 'analysis' && (
          <TemperatureAnalysisTab
            points={conservationPoints}
            readings={temperatureReadings}
          />
        )}
      </CollapsibleCard>

      {/* Corrective Action Popover */}
      {correctiveActionPopover.point && correctiveActionPopover.reading && (
        <CorrectiveActionPopover
          action={getCorrectiveAction(correctiveActionPopover.reading, correctiveActionPopover.point)!}
          pointName={correctiveActionPopover.point.name}
          open={correctiveActionPopover.open}
          onOpenChange={(open) => setCorrectiveActionPopover(prev => ({ ...prev, open }))}
          onConfirm={handleConfirmCorrectiveAction}
        />
      )}

      {/* Maintenance Tasks List - Nuovo formato con indicatori settimanali */}
      <ScheduledMaintenanceCard />

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
            setEditingReading(null)
          }}
          onSave={handleSaveTemperature}
          conservationPoint={selectedPointForTemperature}
          reading={editingReading || undefined}
          isLoading={isCreatingReading || isUpdatingReading}
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
