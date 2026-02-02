import { useState, useMemo, useRef, useEffect } from 'react'
import {
  Plus,
  Thermometer,
  TrendingUp,
  Clock,
  // Camera,
} from 'lucide-react'
import { useConservationPoints } from './hooks/useConservationPoints'
import { useTemperatureReadings, getLatestReadingByPoint, getPointStatus } from './hooks/useTemperatureReadings'
import { getCorrectiveAction } from './utils/correctiveActions'
import { useMaintenanceTasksCritical } from './hooks/useMaintenanceTasksCritical'
import { useConservationRealtime } from './hooks/useConservationRealtime'
// import { useMaintenanceTasks } from './hooks/useMaintenanceTasks'
import { ConservationPointCard } from './components/ConservationPointCard'
import { AddPointModal } from './components/AddPointModal'
import { AddTemperatureModal } from './components/AddTemperatureModal'
import { CollapsibleCard } from '@/components/ui/CollapsibleCard'
import { ScheduledMaintenanceCard } from '@/features/dashboard/components/ScheduledMaintenanceCard'
import { TemperaturePointStatusCard } from './components/TemperaturePointStatusCard'
import { CorrectiveActionPopover } from './components/CorrectiveActionPopover'
import { TemperatureHistorySection } from './components/TemperatureHistorySection'
import { TemperatureAnalysisTab } from './components/TemperatureAnalysisTab'
import type {
  ConservationPoint,
  TemperatureReading,
} from '@/types/conservation'

export default function ConservationPage() {
  // Real-time updates per temperature e maintenance completions
  useConservationRealtime()

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

  // Carica solo i task critici (arretrati + oggi + prossima per tipo)
  const { data: criticalTasks = [] } = useMaintenanceTasksCritical()

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
  const [showPointSelectorForTemperature, setShowPointSelectorForTemperature] = useState(false)
  const pointSelectorRef = useRef<HTMLDivElement>(null)

  // Evidenziazione card temperatura: quando si clicca il badge "Attenzione" nella ConservationPointCard
  const [highlightedTemperaturePointId, setHighlightedTemperaturePointId] = useState<string | null>(null)
  const [temperatureSectionExpanded, setTemperatureSectionExpanded] = useState(true)

  const {
    temperatureReadings,
    isLoading: isLoadingReadings,
    createReading,
    updateReading,
    deleteReading,
    isCreating: isCreatingReading,
    isUpdating: isUpdatingReading,
    // isDeleting: isDeletingReading,
  } = useTemperatureReadings()

  // Punti arricchiti con ultima lettura E maintenance_tasks critici
  // I bollini stato (verde/giallo/rosso) ora usano getPointCheckup che legge last_temperature_reading + maintenance_tasks
  const pointsWithLastReading = useMemo(() => {
    return conservationPoints.map(point => {
      // Filtra i task critici di questo punto
      const pointTasks = criticalTasks.filter(task => task.conservation_point_id === point.id)

      return {
        ...point,
        last_temperature_reading: getLatestReadingByPoint(temperatureReadings ?? [], point.id),
        maintenance_tasks: pointTasks, // Aggiungi task critici
      }
    })
  }, [conservationPoints, temperatureReadings, criticalTasks])

  // Chiudi il dropdown selezione punto al click fuori
  useEffect(() => {
    if (!showPointSelectorForTemperature) return
    const handleClickOutside = (e: MouseEvent) => {
      if (pointSelectorRef.current && !pointSelectorRef.current.contains(e.target as Node)) {
        setShowPointSelectorForTemperature(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showPointSelectorForTemperature])

  // Scroll alla TemperaturePointStatusCard quando si clicca il badge Attenzione
  useEffect(() => {
    if (!highlightedTemperaturePointId) return
    const timer = setTimeout(() => {
      const el = document.querySelector(
        `[data-temperature-point-id="${highlightedTemperaturePointId}"]`
      )
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 350) // Attesa per tab switch + eventuale espansione collapse
    return () => clearTimeout(timer)
  }, [highlightedTemperaturePointId, activeTemperatureTab, temperatureSectionExpanded])

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

  const handleFocusTemperatureCard = (pointId: string) => {
    setHighlightedTemperaturePointId(pointId)
    setActiveTemperatureTab('status')
    setTemperatureSectionExpanded(true)
  }

  const handleHighlightTemperatureCardDismiss = () => {
    setHighlightedTemperaturePointId(null)
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
                      onFocusTemperatureCard={handleFocusTemperatureCard}
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
                      onFocusTemperatureCard={handleFocusTemperatureCard}
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
                      onFocusTemperatureCard={handleFocusTemperatureCard}
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
                      onFocusTemperatureCard={handleFocusTemperatureCard}
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
        expanded={temperatureSectionExpanded}
        onExpandedChange={setTemperatureSectionExpanded}
        icon={Clock}
        headerClassName="[&>div:first-child]:mt-2"
        actions={
          <div ref={pointSelectorRef} className="relative">
            <button
              type="button"
              onClick={e => {
                e.stopPropagation()
                setShowPointSelectorForTemperature(prev => !prev)
              }}
              disabled={conservationPoints.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100"
            >
              <Thermometer className="w-5 h-5" />
              <span>Rileva Temperatura</span>
            </button>
            {showPointSelectorForTemperature && conservationPoints.length > 0 && (
              <div
                className="absolute right-0 top-full z-20 mt-1 min-w-[220px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                role="listbox"
              >
                <p className="px-4 py-2 text-xs font-medium text-gray-500">
                  Scegli punto di conservazione
                </p>
                {[...conservationPoints]
                  .sort((a, b) => {
                    const typeOrder: Record<string, number> = {
                      fridge: 0,
                      freezer: 1,
                      blast: 2,
                      ambient: 3,
                    }
                    return (typeOrder[a.type] ?? 4) - (typeOrder[b.type] ?? 4)
                  })
                  .map(point => (
                    <button
                      key={point.id}
                      type="button"
                      role="option"
                      onClick={() => {
                        handleAddTemperature(point)
                        setShowPointSelectorForTemperature(false)
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-50"
                    >
                      <Thermometer className="h-4 w-4 shrink-0 text-gray-400" />
                      <span>{point.name}</span>
                      {point.department?.name && (
                        <span className="text-xs text-gray-500">({point.department.name})</span>
                      )}
                    </button>
                  ))}
              </div>
            )}
          </div>
        }
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...conservationPoints]
                  .filter(point => point.type !== 'blast') /* Abbattitore: non richiede rilevamento temperatura */
                  .sort((a, b) => {
                    const typeOrder: Record<string, number> = {
                      fridge: 0,
                      freezer: 1,
                      ambient: 2,
                    }
                    return (typeOrder[a.type] ?? 3) - (typeOrder[b.type] ?? 3)
                  })
                  .map(point => {
                    const latestReading = getLatestReadingByPoint(temperatureReadings, point.id)
                    const status = getPointStatus(point, latestReading, pointsInRichiestaLettura)

                    return (
                      <div
                        key={point.id}
                        data-temperature-point-id={point.id}
                        className="relative"
                      >
                        <TemperaturePointStatusCard
                          point={point}
                          latestReading={latestReading}
                          status={status}
                          onAddReading={() => handleAddTemperature(point)}
                          onCorrectiveAction={
                            status === 'critico' && latestReading
                              ? () => handleCorrectiveAction(point, latestReading)
                              : undefined
                          }
                          highlighted={highlightedTemperaturePointId === point.id}
                          onHighlightDismiss={handleHighlightTemperatureCardDismiss}
                        />
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        )}

        {activeTemperatureTab === 'history' && (
          <TemperatureHistorySection
            readings={temperatureReadings}
            points={conservationPoints}
            onEditReading={handleEditReading}
            onDeleteReading={handleDeleteReading}
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
