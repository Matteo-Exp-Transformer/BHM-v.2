import { useEffect, useMemo, useState, useCallback } from 'react'
import {
  ClipboardCheck,
  Plus,
  Trash2,
  Edit2,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import {
  Select,
  SelectOption,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'

import type {
  TasksStepData,
  TasksStepProps,
  ConservationMaintenancePlan,
  ConservationPoint,
  StandardMaintenanceType,
  MaintenanceFrequency,
  CustomFrequencyDays,
  StaffRole,
  GenericTask,
} from '@/types/onboarding'

// Costanti per le manutenzioni standard
const STANDARD_MAINTENANCE_TYPES: Array<{
  value: StandardMaintenanceType
  label: string
  icon: string
}> = [
  { value: 'rilevamento_temperatura', label: 'Rilevamento Temperatura', icon: '🌡️' },
  { value: 'sanificazione', label: 'Sanificazione', icon: '🧽' },
  { value: 'sbrinamento', label: 'Sbrinamento', icon: '❄️' },
  { value: 'controllo_scadenze', label: 'Controllo Scadenze', icon: '📅' },
]

const MAINTENANCE_FREQUENCIES: Array<{
  value: MaintenanceFrequency
  label: string
}> = [
  { value: 'annuale', label: 'Annuale' },
  { value: 'mensile', label: 'Mensile' },
  { value: 'settimanale', label: 'Settimanale' },
  { value: 'giornaliera', label: 'Giornaliera' },
  { value: 'custom', label: 'Personalizzata' },
]

const CUSTOM_DAYS: Array<{
  value: CustomFrequencyDays
  label: string
}> = [
  { value: 'lunedi', label: 'Lunedì' },
  { value: 'martedi', label: 'Martedì' },
  { value: 'mercoledi', label: 'Mercoledì' },
  { value: 'giovedi', label: 'Giovedì' },
  { value: 'venerdi', label: 'Venerdì' },
  { value: 'sabato', label: 'Sabato' },
  { value: 'domenica', label: 'Domenica' },
]

const TasksStep = ({
  data,
  conservationPoints,
  staff,
  onUpdate,
  onValidChange,
}: TasksStepProps) => {
  const [maintenancePlans, setMaintenancePlans] = useState<
    ConservationMaintenancePlan[]
  >(data?.conservationMaintenancePlans ?? [])
  const [genericTasks, setGenericTasks] = useState<GenericTask[]>(
    data?.genericTasks ?? []
  )
  const [editingGenericTaskId, setEditingGenericTaskId] = useState<string | null>(null)
  const [selectedConservationPoint, setSelectedConservationPoint] =
    useState<ConservationPoint | null>(null)

  // Sincronizza maintenancePlans con le props quando i dati cambiano
  useEffect(() => {
    if (data?.conservationMaintenancePlans !== undefined) {
      setMaintenancePlans(data.conservationMaintenancePlans)
    }
  }, [data?.conservationMaintenancePlans])

  // Sincronizza genericTasks con le props quando i dati cambiano
  useEffect(() => {
    if (data?.genericTasks !== undefined) {
      setGenericTasks(data.genericTasks)
    }
  }, [data?.genericTasks])


  const staffOptions = useMemo(
    () =>
      (staff ?? []).map(member => ({
        id: member.id,
        label: member.fullName,
        role: member.role,
        categories: member.categories || [],
        department: member.department_assignments,
      })),
    [staff]
  )

  // Funzione di validazione per manutenzioni
  const validateAllMaintenanceAssigned = useCallback(() => {
    // Controlla che ogni punto di conservazione non-ambiente abbia le 4 manutenzioni
    // e che ogni punto ambiente abbia 3 manutenzioni (senza sbrinamento)
    return conservationPoints.every(point => {
      const pointMaintenances = maintenancePlans.filter(
        plan => plan.conservationPointId === point.id
      )

      const requiredMaintenances =
        point.pointType === 'ambient'
          ? STANDARD_MAINTENANCE_TYPES.filter(m => m.value !== 'sbrinamento')
          : STANDARD_MAINTENANCE_TYPES

      // Verifica che abbiano tutte le manutenziioni richieste assegnate
      return requiredMaintenances.every(requiredMaintenance =>
        pointMaintenances.some(
          plan => 
            plan.manutenzione === requiredMaintenance.value &&
            plan.frequenza && // Frequenza obbligatoria
            plan.assegnatoARuolo && // Ruolo obbligatorio
            (plan.frequenza !== 'custom' || (plan.giorniCustom && plan.giorniCustom.length > 0)) // Giorni custom se frequenza è custom
        )
      )
    })
  }, [conservationPoints, maintenancePlans])

  useEffect(() => {
    const payload: TasksStepData = {
      conservationMaintenancePlans: maintenancePlans,
      generalTasks: [],
      maintenanceTasks: data?.maintenanceTasks ?? [],
      genericTasks: genericTasks,
    }
    onUpdate(payload)
  }, [maintenancePlans, genericTasks, onUpdate, data?.maintenanceTasks])

  useEffect(() => {
    // Validazione aggiornata:
    // 1. Tutte le manutenzioni devono essere assegnate
    // 2. Almeno 1 attività generica deve essere presente
    const allMaintenanceAssigned = validateAllMaintenanceAssigned()
    const hasGenericTasks = genericTasks.length > 0
    const isValid = allMaintenanceAssigned && hasGenericTasks
    onValidChange(isValid)
  }, [validateAllMaintenanceAssigned, genericTasks, onValidChange])

  // Funzioni per gestire le manutenzioni
  const handleAssignMaintenanceToPoint = useCallback(
    (point: ConservationPoint) => {
      setSelectedConservationPoint(point)
    },
    []
  )

  const handleCloseMaintenanceModal = useCallback(() => {
    setSelectedConservationPoint(null)
  }, [])

  const handleAssignMaintenancePlans = useCallback(
    (plans: ConservationMaintenancePlan[]) => {
      setMaintenancePlans(prev => {
        // Rimuovi i piani esistenti per questo punto di conservazione
        const filtered = prev.filter(
          plan => plan.conservationPointId !== plans[0]?.conservationPointId
        )
        // Aggiungi i nuovi piani
        return [...filtered, ...plans]
      })
      setSelectedConservationPoint(null)
    },
    []
  )

  // Funzioni per gestire le attività generiche
  const handleAddGenericTask = useCallback(() => {
    const newTask: GenericTask = {
      id: `generic-${Date.now()}`,
      name: '',
      frequenza: 'settimanale',
      assegnatoARuolo: 'dipendente',
      note: '',
    }
    setGenericTasks(prev => [...prev, newTask])
    setEditingGenericTaskId(newTask.id)
  }, [])

  const handleUpdateGenericTask = useCallback((id: string, updates: Partial<GenericTask>) => {
    setGenericTasks(prev =>
      prev.map(task => (task.id === id ? { ...task, ...updates } : task))
    )
  }, [])

  const handleDeleteGenericTask = useCallback((id: string) => {
    setGenericTasks(prev => prev.filter(task => task.id !== id))
  }, [])

  const handleConfirmGenericTask = useCallback(() => {
    // Chiude il form di modifica
    setEditingGenericTaskId(null)
  }, [])

  const renderMaintenanceAssignmentModal = () => {
    if (!selectedConservationPoint) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Assegna Manutenzioni - {selectedConservationPoint.name}
            </h3>
            <Button variant="outline" onClick={handleCloseMaintenanceModal}>
              ✕
            </Button>
          </div>
          <MaintenanceAssignmentForm
            conservationPoint={selectedConservationPoint}
            staffOptions={staffOptions}
            maintenancePlans={maintenancePlans}
            onSave={handleAssignMaintenancePlans}
            onCancel={handleCloseMaintenanceModal}
          />
        </div>
    </div>
  )
  }

  const renderGenericTasksSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            👥 Attività/Mansioni Generiche
        </h3>
        <p className="text-sm text-gray-500">
            Crea attività generiche e assegna responsabilità al personale
          </p>
        </div>
        <Button onClick={handleAddGenericTask} className="gap-2">
          <Plus className="h-4 w-4" /> Aggiungi Attività
        </Button>
      </div>

      {genericTasks.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-500">
            Nessuna attività generica configurata. Aggiungi almeno un'attività per procedere.
          </p>
        </div>
      )}

        {/* Form di modifica - mostra solo quando c'è un'attività in modifica */}
      {genericTasks.filter(task => editingGenericTaskId === task.id).length > 0 && (
        <div className="space-y-4">
          {genericTasks
            .filter(task => editingGenericTaskId === task.id)
            .map(task => (
              <GenericTaskForm
                key={task.id}
                task={task}
                staffOptions={staffOptions}
                isEditing={true}
                onUpdate={(updates) => handleUpdateGenericTask(task.id, updates)}
                onDelete={() => handleDeleteGenericTask(task.id)}
                onConfirm={() => handleConfirmGenericTask()}
              />
            ))}
        </div>
      )}

      {genericTasks.filter(task => editingGenericTaskId !== task.id).length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-4 py-3">
            <h4 className="font-semibold text-gray-900">Attività Configurate</h4>
          </div>
          <div className="divide-y divide-gray-100">
            {genericTasks
              .filter(task => editingGenericTaskId !== task.id)
              .map(task => (
              <div key={task.id} className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h5 className="font-medium text-gray-900">{task.name}</h5>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>🔄 {MAINTENANCE_FREQUENCIES.find(f => f.value === task.frequenza)?.label}</span>
                      <span>👤 {task.assegnatoARuolo}</span>
                      {task.assegnatoACategoria && task.assegnatoACategoria !== 'all' && (
                        <span>📂 {task.assegnatoACategoria}</span>
                      )}
                      {task.assegnatoADipendenteSpecifico && (
                        <span>👨‍💼 {staffOptions.find(s => s.id === task.assegnatoADipendenteSpecifico)?.label}</span>
              )}
            </div>
                    {task.note && (
                      <p className="text-sm text-gray-600">{task.note}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setEditingGenericTaskId(task.id)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteGenericTask(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            </div>
          </div>
      )}
      </div>
  )

  return (
    <div className="space-y-8">
      <header className="space-y-2 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <ClipboardCheck className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Attività e controlli HACCP
        </h2>
        <p className="text-gray-600">
          Definisci le attività periodiche per garantire la conformità alle
          normative HACCP.
        </p>
      </header>

      {/* Sezione 1: Manutenzioni Punti di Conservazione */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
          <div>
              <h3 className="text-xl font-semibold text-gray-900">
                🔧 Manutenzioni Punti di Conservazione
              </h3>
              <p className="text-sm text-gray-500">
                Assegna le manutenzioni obbligatorie per ogni punto di conservazione
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {conservationPoints.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                <p className="text-gray-500">
                  Nessun punto di conservazione configurato. Completa lo Step 4
                  per procedere.
                </p>
              </div>
            ) : (
              conservationPoints.map(point => {
                const pointMaintenances = maintenancePlans.filter(
                  plan => plan.conservationPointId === point.id
                )

                const requiredMaintenances =
                  point.pointType === 'ambient'
                    ? STANDARD_MAINTENANCE_TYPES.filter(m => m.value !== 'sbrinamento')
                    : STANDARD_MAINTENANCE_TYPES

                const allAssigned = requiredMaintenances.every(
                  requiredMaintenance =>
                    pointMaintenances.some(
                      plan => plan.manutenzione === requiredMaintenance.value
                    )
                )

                return (
                  <div key={point.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {point.name}
                          </h4>
                          <div className="flex gap-2">
                            <Badge variant="outline">
                              {point.pointType === 'ambient'
                                ? 'Ambiente'
                                : 'Attrezzatura'}
                            </Badge>
                            <Badge
                              variant={allAssigned ? 'default' : 'destructive'}
                            >
                              {allAssigned ? 'Completato' : 'Incompleto'}
                            </Badge>
                          </div>
                        </div>
                      </div>
        <Button
          variant="outline"
                        onClick={() => handleAssignMaintenanceToPoint(point)}
        >
                        {allAssigned ? 'Modifica Manutenzioni' : 'Assegna manutenzioni'}
        </Button>
                    </div>

                    <div className="mt-2 grid gap-2 md:grid-cols-2">
                      {pointMaintenances.map(plan => {
                        const maintenanceType = STANDARD_MAINTENANCE_TYPES.find(
                          m => m.value === plan.manutenzione
                        )
                        return (
                          <div
                            key={plan.id}
                            className="rounded border border-gray-200 bg-gray-50 p-2 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span>{maintenanceType?.icon}</span>
                              <span className="font-medium">
                                {maintenanceType?.label}
                              </span>
                            </div>
                            <div className="mt-1 text-gray-600">
                              {MAINTENANCE_FREQUENCIES.find(f => f.value === plan.frequenza)?.label}
                              {' - '}
                              {plan.assegnatoARuolo}
                              {plan.assegnatoACategoria && plan.assegnatoACategoria !== 'all' && (
                                <> - {plan.assegnatoACategoria}</>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Sezione 2: Attività Generiche */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        {renderGenericTasksSection()}
      </div>

      {/* Modal per assegnazione manutenzioni */}
      {selectedConservationPoint && renderMaintenanceAssignmentModal()}

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        ℹ️ Le attività configurate verranno automaticamente assegnate al
        personale secondo la frequenza indicata e monitorate nel sistema
        principale.
      </div>
    </div>
  )
}

// Componente interno per l'assegnazione delle manutenzioni
interface MaintenanceAssignmentFormProps {
  conservationPoint: ConservationPoint
  staffOptions: Array<{ id: string; label: string; role: string; categories: string[] }>
  maintenancePlans: ConservationMaintenancePlan[]
  onSave: (plans: ConservationMaintenancePlan[]) => void
  onCancel: () => void
}

const MaintenanceAssignmentForm = ({
  conservationPoint,
  staffOptions,
  maintenancePlans,
  onSave,
  onCancel,
}: MaintenanceAssignmentFormProps) => {
  const requiredMaintenances =
    conservationPoint.pointType === 'ambient'
      ? STANDARD_MAINTENANCE_TYPES.filter(m => m.value !== 'sbrinamento')
      : STANDARD_MAINTENANCE_TYPES

  // Precompila i dati esistenti se disponibili
  const existingPlans = maintenancePlans.filter(
    plan => plan.conservationPointId === conservationPoint.id
  )

  const [plans, setPlans] = useState<ConservationMaintenancePlan[]>(() => {
    return requiredMaintenances.map(maintenanceType => {
      // Cerca se esiste già un piano per questa manutenzione
      const existingPlan = existingPlans.find(
        plan => plan.manutenzione === maintenanceType.value
      )
      
      if (existingPlan) {
        // Usa i dati esistenti
        return existingPlan
      } else {
        // Crea un nuovo piano con valori di default
        return {
          id: `plan-${maintenanceType.value}-${conservationPoint.id}`,
          conservationPointId: conservationPoint.id,
          manutenzione: maintenanceType.value,
          frequenza: maintenanceType.value === 'rilevamento_temperatura' ? 'giornaliera' :
                     maintenanceType.value === 'sanificazione' ? 'settimanale' :
                     maintenanceType.value === 'sbrinamento' ? 'annuale' : 'custom',
          assegnatoARuolo: 'dipendente',
          giorniCustom: maintenanceType.value === 'controllo_scadenze' ? ['lunedi', 'giovedi'] : undefined,
        }
      }
    })
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const updatePlan = (index: number, updates: Partial<ConservationMaintenancePlan>) => {
    setPlans(prev => prev.map((plan, i) => i === index ? { ...plan, ...updates } : plan))
  }

  const validatePlans = () => {
    const newErrors: Record<string, string> = {}

    plans.forEach((plan, index) => {
      if (!plan.frequenza) {
        newErrors[`plan-${index}-frequenza`] = 'Frequenza obbligatoria'
      }
      if (!plan.assegnatoARuolo) {
        newErrors[`plan-${index}-ruolo`] = 'Ruolo obbligatorio'
      }
      if (plan.frequenza === 'custom' && (!plan.giorniCustom || plan.giorniCustom.length === 0)) {
        newErrors[`plan-${index}-giorni`] = 'Seleziona almeno un giorno per frequenza custom'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validatePlans()) {
      onSave(plans)
    }
  }

  return (
    <div className="space-y-6">
      {requiredMaintenances.map((maintenanceType, index) => {
        const plan = plans[index]
        return (
          <div
            key={plan.id}
            className="rounded-lg border border-gray-200 bg-gray-50 p-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{maintenanceType.icon}</span>
              <div>
                <h4 className="font-semibold text-gray-900">
                  {maintenanceType.label}
                </h4>
                <p className="text-sm text-gray-500">
                  Configura frequenza e assegnazione per questa manutenzione
                </p>
              </div>
          </div>

            <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Frequenza *</Label>
              <Select
                  value={plan.frequenza}
                onValueChange={value =>
                    updatePlan(index, {
                      frequenza: value as MaintenanceFrequency,
                      giorniCustom: value === 'custom' ? ['lunedi'] : undefined
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona frequenza" />
                  </SelectTrigger>
                  <SelectContent>
                    {MAINTENANCE_FREQUENCIES.map(freq => (
                  <SelectOption key={freq.value} value={freq.value}>
                    {freq.label}
                  </SelectOption>
                ))}
                  </SelectContent>
              </Select>
                {errors[`plan-${index}-frequenza`] && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors[`plan-${index}-frequenza`]}
                  </p>
                )}
            </div>

            <div>
                <Label>Ruolo *</Label>
              <Select
                  value={plan.assegnatoARuolo || ''}
                onValueChange={value =>
                    updatePlan(index, {
                      assegnatoARuolo: value as StaffRole,
                      assegnatoADipendenteSpecifico: undefined
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona ruolo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectOption value="admin">Amministratore</SelectOption>
                    <SelectOption value="responsabile">Responsabile</SelectOption>
                    <SelectOption value="dipendente">Dipendente</SelectOption>
                    <SelectOption value="collaboratore">Collaboratore</SelectOption>
                  </SelectContent>
              </Select>
                {errors[`plan-${index}-ruolo`] && (
                <p className="mt-1 text-sm text-red-600">
                    {errors[`plan-${index}-ruolo`]}
                </p>
              )}
          </div>

            <div>
                <Label>Categoria</Label>
              <Select
                  value={plan.assegnatoACategoria || 'all'}
                onValueChange={value =>
                    updatePlan(index, {
                      assegnatoACategoria: value,
                      assegnatoADipendenteSpecifico: undefined
                    })
                  }
                  disabled={!plan.assegnatoARuolo}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      plan.assegnatoARuolo
                        ? "Seleziona categoria"
                        : "Prima seleziona un ruolo"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectOption value="all">Tutte le categorie</SelectOption>
                    {staffOptions
                      .filter(staff => staff.role === plan.assegnatoARuolo)
                      .flatMap(staff => staff.categories)
                      .filter(category => category && category.trim() !== '')
                      .filter((category, index, arr) => arr.indexOf(category) === index)
                      .map(category => (
                        <SelectOption key={category} value={category}>
                          {category}
                  </SelectOption>
                      ))
                    }
                  </SelectContent>
              </Select>
            </div>

              {plan.assegnatoARuolo && (
                <div className="md:col-span-2">
                  <Label>Dipendente specifico</Label>
              <Select
                    value={plan.assegnatoADipendenteSpecifico ?? 'none'}
                onValueChange={value =>
                      updatePlan(index, {
                        assegnatoADipendenteSpecifico: value,
                      })
                    }
                    disabled={false}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Opzionale: seleziona dipendente specifico" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectOption value="none">Nessun dipendente specifico</SelectOption>
                      {staffOptions
                        .filter(staff => {
                          if (staff.role !== plan.assegnatoARuolo) return false
                          
                          if (plan.assegnatoACategoria && plan.assegnatoACategoria !== 'all') {
                            return staff.categories.includes(plan.assegnatoACategoria)
                          }
                          
                          return true
                        })
                        .map(staff => (
                          <SelectOption key={staff.id} value={staff.id}>
                            {staff.label} - {staff.categories.join(', ')}
                  </SelectOption>
                        ))
                      }
                    </SelectContent>
              </Select>
            </div>
              )}

              {plan.frequenza === 'custom' && (
                <div className="md:col-span-2">
                  <Label>Giorni della settimana *</Label>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    {CUSTOM_DAYS.map(day => (
                      <label key={day.value} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={plan.giorniCustom?.includes(day.value) ?? false}
                          onChange={e => {
                            const currentDays = plan.giorniCustom || []
                            const newDays = e.target.checked
                              ? [...currentDays, day.value]
                              : currentDays.filter(d => d !== day.value)
                            updatePlan(index, { giorniCustom: newDays })
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{day.label}</span>
                      </label>
                    ))}
          </div>
                  {errors[`plan-${index}-giorni`] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[`plan-${index}-giorni`]}
                    </p>
                  )}
                </div>
              )}

              <div className="md:col-span-2">
                <Label>Note (opzionale)</Label>
                <Textarea
                  rows={2}
                  value={plan.note ?? ''}
                  onChange={e => updatePlan(index, { note: e.target.value })}
                  placeholder="Note aggiuntive..."
            />
          </div>
          </div>
          </div>
        )
      })}

      <div className="flex justify-end gap-3 border-t pt-4">
        <Button variant="outline" onClick={onCancel}>
              Annulla
            </Button>
        <Button onClick={handleSave}>Salva Manutenzioni</Button>
          </div>
    </div>
  )
}

// Componente per il form delle attività generiche
interface GenericTaskFormProps {
  task: GenericTask
  staffOptions: Array<{ id: string; label: string; role: string; categories: string[] }>
  isEditing: boolean
  onUpdate: (updates: Partial<GenericTask>) => void
  onDelete: () => void
  onConfirm: () => void
}

const GenericTaskForm = ({
  task,
  staffOptions,
  isEditing,
  onUpdate,
  onDelete,
  onConfirm,
}: GenericTaskFormProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateTask = (updates: Partial<GenericTask>) => {
    onUpdate(updates)
    
    // Validazione
    const newErrors: Record<string, string> = {}
    if (!updates.name && !task.name) {
      newErrors.name = 'Nome attività obbligatorio'
    }
    if (!updates.frequenza && !task.frequenza) {
      newErrors.frequenza = 'Frequenza obbligatoria'
    }
    if (!updates.assegnatoARuolo && !task.assegnatoARuolo) {
      newErrors.ruolo = 'Ruolo obbligatorio'
    }
    if (updates.frequenza === 'custom' && (!updates.giorniCustom || updates.giorniCustom.length === 0)) {
      newErrors.giorni = 'Seleziona almeno un giorno per frequenza custom'
    }
    
    setErrors(newErrors)
  }

          return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      {isEditing ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">
              {task.name ? `Modifica: ${task.name}` : 'Nuova Attività Generica'}
                  </h4>
            <Button variant="destructive" size="icon" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
                </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Nome attività *</Label>
              <Input
                value={task.name}
                onChange={e => updateTask({ name: e.target.value })}
                placeholder="Es: Pulizia cucina, Controllo fornelli..."
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
                </div>

            <div>
              <Label>Frequenza *</Label>
              <Select
                value={task.frequenza}
                onValueChange={value =>
                  updateTask({
                    frequenza: value as MaintenanceFrequency,
                    giorniCustom: value === 'custom' ? ['lunedi'] : undefined
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona frequenza" />
                </SelectTrigger>
                <SelectContent>
                  {MAINTENANCE_FREQUENCIES.map(freq => (
                    <SelectOption key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectOption>
                  ))}
                </SelectContent>
              </Select>
              {errors.frequenza && (
                <p className="mt-1 text-sm text-red-600">{errors.frequenza}</p>
              )}
                  </div>

            <div>
              <Label>Ruolo *</Label>
              <Select
                value={task.assegnatoARuolo || ''}
                onValueChange={value =>
                  updateTask({
                    assegnatoARuolo: value as StaffRole,
                    assegnatoADipendenteSpecifico: undefined
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona ruolo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectOption value="admin">Amministratore</SelectOption>
                  <SelectOption value="responsabile">Responsabile</SelectOption>
                  <SelectOption value="dipendente">Dipendente</SelectOption>
                  <SelectOption value="collaboratore">Collaboratore</SelectOption>
                </SelectContent>
              </Select>
              {errors.ruolo && (
                <p className="mt-1 text-sm text-red-600">{errors.ruolo}</p>
              )}
            </div>

            <div>
              <Label>Categoria</Label>
              <Select
                value={task.assegnatoACategoria || 'all'}
                onValueChange={value =>
                  updateTask({
                    assegnatoACategoria: value,
                    assegnatoADipendenteSpecifico: undefined
                  })
                }
                disabled={!task.assegnatoARuolo}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    task.assegnatoARuolo
                      ? "Seleziona categoria"
                      : "Prima seleziona un ruolo"
                  } />
                </SelectTrigger>
                <SelectContent>
                  <SelectOption value="all">Tutte le categorie</SelectOption>
                  {staffOptions
                    .filter(staff => staff.role === task.assegnatoARuolo)
                    .flatMap(staff => staff.categories)
                    .filter(category => category && category.trim() !== '')
                    .filter((category, index, arr) => arr.indexOf(category) === index)
                    .map(category => (
                      <SelectOption key={category} value={category}>
                        {category}
                      </SelectOption>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>

            {task.assegnatoARuolo && (
              <div className="md:col-span-2">
                <Label>Dipendente specifico</Label>
                <Select
                  value={task.assegnatoADipendenteSpecifico ?? 'none'}
                  onValueChange={value =>
                    updateTask({
                      assegnatoADipendenteSpecifico: value,
                    })
                  }
                  disabled={false}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Opzionale: seleziona dipendente specifico" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectOption value="none">Nessun dipendente specifico</SelectOption>
                    {staffOptions
                      .filter(staff => {
                        if (staff.role !== task.assegnatoARuolo) return false
                        
                        if (task.assegnatoACategoria && task.assegnatoACategoria !== 'all') {
                          return staff.categories.includes(task.assegnatoACategoria)
                        }
                        
                        return true
                      })
                      .map(staff => (
                        <SelectOption key={staff.id} value={staff.id}>
                          {staff.label} - {staff.categories.join(', ')}
                        </SelectOption>
                      ))
                    }
                  </SelectContent>
                </Select>
                  </div>
                )}

            {task.frequenza === 'custom' && (
              <div className="md:col-span-2">
                <Label>Giorni della settimana *</Label>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {CUSTOM_DAYS.map(day => (
                    <label key={day.value} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={task.giorniCustom?.includes(day.value) ?? false}
                        onChange={e => {
                          const currentDays = task.giorniCustom || []
                          const newDays = e.target.checked
                            ? [...currentDays, day.value]
                            : currentDays.filter(d => d !== day.value)
                          updateTask({ giorniCustom: newDays })
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{day.label}</span>
                    </label>
                  ))}
                    </div>
                {errors.giorni && (
                  <p className="mt-1 text-sm text-red-600">{errors.giorni}</p>
                  )}
              </div>
            )}

            <div className="md:col-span-2">
              <Label>Note (opzionale)</Label>
              <Textarea
                rows={2}
                value={task.note ?? ''}
                onChange={e => updateTask({ note: e.target.value })}
                placeholder="Note aggiuntive..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t pt-4 mt-4">
            <Button variant="outline" onClick={onDelete}>
              Annulla
                </Button>
            <Button onClick={onConfirm}>
              Conferma Attività
                </Button>
              </div>
        </>
      ) : null}
    </div>
  )
}

export default TasksStep