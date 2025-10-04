import { useEffect, useMemo, useState, useCallback } from 'react'
import {
  ClipboardCheck,
  CheckSquare,
  Plus,
  Trash2,
  Edit2,
  UserCircle,
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
  GeneralTask,
  HaccpTaskCategory,
  TaskFrequency,
  TaskPriority,
  TasksStepData,
  TasksStepProps,
  ConservationMaintenancePlan,
  ConservationPoint,
  StandardMaintenanceType,
  MaintenanceFrequency,
  CustomFrequencyDays,
  StaffRole,
} from '@/types/onboarding'
import {
  createDraftTask,
  normalizeGeneralTask,
  validateGeneralTask,
  HACCP_TASK_CATEGORIES,
  TASK_FREQUENCIES,
  TASK_PRIORITY_OPTIONS,
} from '@/utils/onboarding/taskUtils'

// Costanti per le manutenzioni standard
const STANDARD_MAINTENANCE_TYPES: Array<{
  value: StandardMaintenanceType
  label: string
  description: string
  icon: string
}> = [
  {
    value: 'rilevamento_temperatura',
    label: 'Rilevamento Temperatura',
    description: 'Controllo giornaliero delle temperature',
    icon: '🌡️',
  },
  {
    value: 'sanificazione',
    label: 'Sanificazione',
    description: 'Pulizia e sanificazione settimanale',
    icon: '🧽',
  },
  {
    value: 'sbrinamento',
    label: 'Sbrinamento',
    description: 'Sbrinamento annuale (escluso per ambiente)',
    icon: '❄️',
  },
  {
    value: 'controllo_scadenze',
    label: 'Controllo Scadenze',
    description: 'Verifica scadenze prodotti (giorni personalizzati)',
    icon: '📅',
  },
]

const FREQUENCY_OPTIONS: Array<{
  value: MaintenanceFrequency
  label: string
}> = [
  { value: 'giornaliera', label: 'Giornaliera' },
  { value: 'settimanale', label: 'Settimanale' },
  { value: 'mensile', label: 'Mensile' },
  { value: 'annuale', label: 'Annuale' },
  { value: 'custom', label: 'Personalizzata' },
]

const WEEKDAYS: Array<{
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
  departments,
  conservationPoints,
  staff,
  onUpdate,
  onValidChange,
}: TasksStepProps) => {
  const [tasks, setTasks] = useState<GeneralTask[]>(
    (data?.generalTasks ?? []).map(normalizeGeneralTask)
  )
  const [draftTask, setDraftTask] = useState<GeneralTask | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [editingId, setEditingId] = useState<string | 'maintenancePlans'>(null)

  // Stati per manutenzioni punti conservazione
  const [maintenancePlans, setMaintenancePlans] = useState<
    ConservationMaintenancePlan[]
  >(data?.conservationMaintenancePlans ?? [])
  const [selectedConservationPoint, setSelectedConservationPoint] =
    useState<ConservationPoint | null>(null)

  // Sincronizza maintenancePlans con le props appena con cui i dati cambiano
  useEffect(() => {
    if (data?.conservationMaintenancePlans !== undefined) {
      setMaintenancePlans(data.conservationMaintenancePlans)
    }
  }, [data?.conservationMaintenancePlans])

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
          plan => plan.manutenzione === requiredMaintenance.value
        )
      )
    })
  }, [conservationPoints, maintenancePlans])

  useEffect(() => {
    const payload: TasksStepData = {
      conservationMaintenancePlans: maintenancePlans,
      generalTasks: tasks,
      maintenanceTasks: data?.maintenanceTasks ?? [],
    }
    onUpdate(payload)
  }, [tasks, maintenancePlans, onUpdate, data?.maintenanceTasks])

  useEffect(() => {
    // Validazione aggiornata:
    // 1. Almeno 1 attività generica deve essere presente
    // 2. Tutte le attività devono essere valide
    // 3. Tutte le manutenzioni dei punti di conservazione devono essere assegnate
    const hasGeneralTasks = tasks.length > 0
    const allTasksValid = tasks.every(task => validateGeneralTask(task).success)
    const allMaintenanceAssigned = validateAllMaintenanceAssigned()

    const isValid = hasGeneralTasks && allTasksValid && allMaintenanceAssigned
    onValidChange(isValid)
  }, [tasks, validateAllMaintenanceAssigned, onValidChange])

  const departmentOptions = useMemo(
    () => departments.filter(department => department.is_active !== false),
    [departments]
  )

  const conservationOptions = useMemo(
    () => conservationPoints,
    [conservationPoints]
  )

  const staffOptions = useMemo(
    () =>
      (staff ?? []).map(member => ({
        id: member.id,
        label: member.fullName,
        role: member.role,
      })),
    [staff]
  )

  const handleResetForm = () => {
    setDraftTask(null)
    setEditingId(null)
    setErrors({})
  }

  const handleSubmitTask = () => {
    if (!draftTask) return
    const normalized = normalizeGeneralTask(draftTask)
    const validation = validateGeneralTask(normalized)
    if (!validation.success) {
      setErrors(validation.errors ?? {})
      return
    }

    setTasks(prev => {
      if (editingId) {
        return prev.map(task => (task.id === editingId ? normalized : task))
      }
      return [...prev, normalized]
    })

    handleResetForm()
  }

  const handleEditTask = (task: GeneralTask) => {
    setDraftTask({
      ...task,
      checklist: [...task.checklist],
      requiredTools: [...task.requiredTools],
    })
    setEditingId(task.id)
    setErrors({})
  }

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id))
    if (editingId === id) {
      handleResetForm()
    }
  }

  // Funzioni per gestire le manutenzioni
  const handleAssignMaintenanceToPoint = useCallback(
    (point: ConservationPoint) => {
      setSelectedConservationPoint(point)
      setEditingId('maintenancePlans')
    },
    []
  )

  const handleCloseMaintenanceModal = useCallback(() => {
    setSelectedConservationPoint(null)
    setEditingId(null)
  }, [])

  // Funzione per creare default plans rimossa - non utilizzata in implementazione corrente

  const handleAssignMaintenancePlans = useCallback(
    (plans: ConservationMaintenancePlan[]) => {
      setMaintenancePlans(prev => [
        ...prev.filter(
          plan => plan.conservationPointId !== plans[0]?.conservationPointId
        ),
        ...plans,
      ])
      setSelectedConservationPoint(null)
      setEditingId(null)
    },
    []
  )

  const handlePrefillTasks = () => {
    if (departmentOptions.length === 0) return
    const cucina = departmentOptions.find(
      dep => dep.name.toLowerCase() === 'cucina'
    )
    const freezer = conservationOptions.find(
      point => point.pointType === 'freezer'
    )
    const fridge = conservationOptions.find(
      point => point.pointType === 'fridge'
    )

    const samples: GeneralTask[] = [
      normalizeGeneralTask({
        id: `task_${Date.now()}`,
        name: 'Controllo temperature frigoriferi',
        description:
          'Verifica e registrazione delle temperature di tutti i frigoriferi attivi',
        frequency: 'daily',
        departmentId: cucina?.id,
        conservationPointId: fridge?.id,
        priority: 'high',
        estimatedDuration: 20,
        checklist: [
          'Rilevare temperatura display del frigorifero',
          'Misurare temperatura interna con termometro campione',
          'Registrare temperatura su modulo HACCP',
          'Verificare pulizia guarnizioni e chiusura porte',
        ],
        requiredTools: ['Termometro campione', 'Modulo temperature'],
        haccpCategory: 'temperature',
        responsibleStaffIds: [],
      }),
      normalizeGeneralTask({
        id: `task_${Date.now() + 1}`,
        name: 'Sanificazione superfici di lavoro',
        description:
          'Pulizia e sanificazione completa delle superfici della cucina',
        frequency: 'daily',
        departmentId: cucina?.id,
        priority: 'critical',
        estimatedDuration: 45,
        checklist: [
          'Rimuovere residui alimentari',
          'Applicare detergente professionale',
          'Risciacquare e asciugare',
          'Applicare disinfettante alimentare',
          'Registrare nel modulo sanificazioni',
        ],
        requiredTools: ['Detergente HACCP', 'Disinfettante', 'Panni monouso'],
        haccpCategory: 'hygiene',
        responsibleStaffIds: [],
      }),
      normalizeGeneralTask({
        id: `task_${Date.now() + 2}`,
        name: 'Controllo scadenze prodotti congelati',
        description: 'Verifica delle scadenze e rotazione stock congelatore',
        frequency: 'weekly',
        departmentId: cucina?.id,
        conservationPointId: freezer?.id,
        priority: 'medium',
        estimatedDuration: 30,
        checklist: [
          'Controllare etichette di tutti i prodotti congelati',
          'Segnalare prodotti in scadenza entro 7 giorni',
          'Rimuovere prodotti scaduti',
          'Aggiornare inventario congelatori',
        ],
        requiredTools: [
          'Registro scadenze',
          'Etichette',
          'Pennarello indelebile',
        ],
        haccpCategory: 'documentation',
        responsibleStaffIds: [],
      }),
    ]

    setTasks(samples)
    handleResetForm()
  }

  const renderTaskForm = () => (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <header className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {editingId ? 'Modifica attività HACCP' : 'Nuova attività HACCP'}
        </h3>
        <p className="text-sm text-gray-500">
          Configura checklist, priorità e assegnazione per automatizzare i
          controlli periodici.
        </p>
      </header>

      {draftTask ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Nome attività *</Label>
              <Input
                value={draftTask.name}
                onChange={event =>
                  setDraftTask(prev =>
                    prev ? { ...prev, name: event.target.value } : prev
                  )
                }
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
            <div>
              <Label>Categoria HACCP *</Label>
              <Select
                value={draftTask.haccpCategory}
                onValueChange={value =>
                  setDraftTask(prev =>
                    prev
                      ? { ...prev, haccpCategory: value as HaccpTaskCategory }
                      : prev
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona categoria" />
                </SelectTrigger>
                <SelectContent>
                  {HACCP_TASK_CATEGORIES.map(category => (
                    <SelectOption key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </SelectOption>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Descrizione</Label>
            <Textarea
              rows={3}
              value={draftTask.description ?? ''}
              onChange={event =>
                setDraftTask(prev =>
                  prev ? { ...prev, description: event.target.value } : prev
                )
              }
              placeholder="Dettagli operativi dell'attività"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label>Frequenza *</Label>
              <Select
                value={draftTask.frequency}
                onValueChange={value =>
                  setDraftTask(prev =>
                    prev ? { ...prev, frequency: value as TaskFrequency } : prev
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona frequenza" />
                </SelectTrigger>
                <SelectContent>
                  {TASK_FREQUENCIES.map(freq => (
                    <SelectOption key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectOption>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priorità *</Label>
              <Select
                value={draftTask.priority}
                onValueChange={value =>
                  setDraftTask(prev =>
                    prev ? { ...prev, priority: value as TaskPriority } : prev
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona priorità" />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITY_OPTIONS.map(priority => (
                    <SelectOption key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectOption>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Durata stimata (min) *</Label>
              <Input
                type="number"
                min={5}
                step={5}
                value={draftTask.estimatedDuration}
                onChange={event =>
                  setDraftTask(prev =>
                    prev
                      ? {
                          ...prev,
                          estimatedDuration: Number(event.target.value),
                        }
                      : prev
                  )
                }
                aria-invalid={Boolean(errors.estimatedDuration)}
              />
              {errors.estimatedDuration && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.estimatedDuration}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Reparto</Label>
              <Select
                value={draftTask.departmentId ?? ''}
                onValueChange={value =>
                  setDraftTask(prev =>
                    prev
                      ? {
                          ...prev,
                          departmentId: value || undefined,
                        }
                      : prev
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona reparto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectOption value="">Tutti i reparti</SelectOption>
                  {departmentOptions.map(department => (
                    <SelectOption key={department.id} value={department.id}>
                      {department.name}
                    </SelectOption>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Punto di conservazione</Label>
              <Select
                value={draftTask.conservationPointId ?? ''}
                onValueChange={value =>
                  setDraftTask(prev =>
                    prev
                      ? {
                          ...prev,
                          conservationPointId: value || undefined,
                        }
                      : prev
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona punto conservazione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectOption value="">Nessuno specifico</SelectOption>
                  {conservationOptions.map(point => (
                    <SelectOption key={point.id} value={point.id}>
                      {point.name} ({point.pointType})
                    </SelectOption>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Checklist operativa</Label>
            <textarea
              className="block h-24 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
              value={draftTask.checklist.join('\n')}
              onChange={event =>
                setDraftTask(prev =>
                  prev
                    ? {
                        ...prev,
                        checklist: event.target.value
                          .split('\n')
                          .map(item => item.trim())
                          .filter(Boolean),
                      }
                    : prev
                )
              }
              placeholder="Inserisci un elemento per linea"
            />
          </div>

          <div>
            <Label>Strumenti necessari</Label>
            <textarea
              className="block h-20 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
              value={draftTask.requiredTools.join('\n')}
              onChange={event =>
                setDraftTask(prev =>
                  prev
                    ? {
                        ...prev,
                        requiredTools: event.target.value
                          .split('\n')
                          .map(tool => tool.trim())
                          .filter(Boolean),
                      }
                    : prev
                )
              }
              placeholder="Inserisci uno strumento per linea"
            />
          </div>

          <div>
            <Label>Personale responsabile</Label>
            <select
              multiple
              value={draftTask.responsibleStaffIds ?? []}
              onChange={event =>
                setDraftTask(prev =>
                  prev
                    ? {
                        ...prev,
                        responsibleStaffIds: Array.from(
                          event.target.selectedOptions
                        ).map(option => option.value),
                      }
                    : prev
                )
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              {staffOptions.map(member => (
                <option key={member.id} value={member.id}>
                  {member.label} ({member.role})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={handleResetForm}>
              Annulla
            </Button>
            <Button type="button" onClick={handleSubmitTask}>
              {editingId ? 'Salva modifiche' : 'Aggiungi attività'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
          Seleziona un'attività esistente per modificarla oppure creane una
          nuova.
        </div>
      )}
    </div>
  )

  const renderTaskList = () => (
    <section className="rounded-lg border border-gray-200 bg-white">
      <header className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div>
          <h3 className="font-semibold text-gray-900">Attività configurate</h3>
          <p className="text-sm text-gray-500">
            Automazione dei controlli HACCP con checklist e assegnazioni
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          className="gap-2"
          onClick={() => setDraftTask(createDraftTask())}
        >
          <Plus className="h-4 w-4" /> Aggiungi attività
        </Button>
      </header>

      <div className="divide-y divide-gray-100">
        {tasks.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-gray-500">
            Nessuna attività configurata. Aggiungi almeno un controllo per
            procedere.
          </p>
        )}

        {tasks.map(task => {
          const category = HACCP_TASK_CATEGORIES.find(
            cat => cat.value === task.haccpCategory
          )
          const dept = departments.find(
            department => department.id === task.departmentId
          )
          const point = conservationPoints.find(
            cp => cp.id === task.conservationPointId
          )

          return (
            <article
              key={task.id}
              className="grid gap-4 px-4 py-3 md:grid-cols-[1fr_auto] md:items-start"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg">{category?.icon ?? '📝'}</span>
                  <h4 className="text-base font-semibold text-gray-900">
                    {task.name}
                  </h4>
                  <Badge tone="info" variant="outline">
                    {category?.label ?? 'Attività'}
                  </Badge>
                  <Badge tone="warning" variant="outline">
                    {TASK_FREQUENCIES.find(
                      freq => freq.value === task.frequency
                    )?.label ?? task.frequency}
                  </Badge>
                  <Badge tone="danger" variant="outline">
                    {TASK_PRIORITY_OPTIONS.find(
                      priority => priority.value === task.priority
                    )?.label ?? task.priority}
                  </Badge>
                </div>

                {task.description && (
                  <p className="text-sm text-gray-600">{task.description}</p>
                )}

                <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                  {dept && <Badge variant="outline">{dept.name}</Badge>}
                  {point && <Badge variant="outline">{point.name}</Badge>}
                  <Badge variant="secondary">
                    {task.estimatedDuration} min
                  </Badge>
                </div>

                {task.checklist.length > 0 && (
                  <div className="space-y-1 text-xs text-gray-600">
                    <p className="font-semibold">
                      Checklist ({task.checklist.length})
                    </p>
                    <ul className="space-y-1">
                      {task.checklist.slice(0, 3).map(item => (
                        <li key={item} className="flex items-center gap-2">
                          <CheckSquare className="h-3 w-3 text-green-600" />
                          <span>{item}</span>
                        </li>
                      ))}
                      {task.checklist.length > 3 && (
                        <li className="text-gray-400">
                          +{task.checklist.length - 3} ulteriori elementi...
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {task.requiredTools.length > 0 && (
                  <div className="flex flex-wrap gap-1 text-xs text-gray-500">
                    {task.requiredTools.map(tool => (
                      <span
                        key={tool}
                        className="rounded-full bg-gray-100 px-2 py-1"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                )}

                {task.responsibleStaffIds &&
                  task.responsibleStaffIds.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                      <UserCircle className="h-4 w-4" />
                      <span>
                        Responsabili:{' '}
                        {task.responsibleStaffIds
                          .map(
                            staffId =>
                              staffOptions.find(member => member.id === staffId)
                                ?.label
                          )
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    </div>
                  )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleEditTask(task)}
                  aria-label="Modifica attività"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteTask(task.id)}
                  aria-label="Elimina attività"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )

  // Rendering della sezione manutenzioni punti conservazione
  const renderConservationMaintenanceSection = () => (
    <section className="rounded-lg border border-gray-200 bg-white">
      <header className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div>
          <h3 className="font-semibold text-gray-900">
            Manutenzioni Punti Conservazione
          </h3>
          <p className="text-sm text-gray-500">
            Assegna le 4 manutenziioni obbligatorie per ogni punto di
            conservazione
          </p>
        </div>
      </header>

      <div className="divide-y divide-gray-100 p-4">
        {conservationPoints.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            Nessun punto di conservazione trovato. Configura prima i punti di
            conservazione nello step precedente.
          </p>
        ) : (
          conservationPoints.map(point => {
            const pointMaintenances = maintenancePlans.filter(
              plan => plan.conservationPointId === point.id
            )
            const requiredMaintenances =
              point.pointType === 'ambient'
                ? STANDARD_MAINTENANCE_TYPES.filter(
                    m => m.value !== 'sbrinamento'
                  )
                : STANDARD_MAINTENANCE_TYPES
            const isFullyConfigured = requiredMaintenances.every(
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
                            : point.pointType === 'fridge'
                              ? 'Frigorifero'
                              : point.pointType === 'freezer'
                                ? 'Congelatore'
                                : 'Blast Chiller'}
                        </Badge>
                        <Badge
                          variant={
                            isFullyConfigured ? 'default' : 'destructive'
                          }
                        >
                          {isFullyConfigured
                            ? 'Completamente configurato'
                            : 'Da configurare'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAssignMaintenanceToPoint(point)}
                  >
                    {isFullyConfigured
                      ? 'Modifica manutenzioni'
                      : 'Assegna manutenzioni'}
                  </Button>
                </div>

                {pointMaintenances.length > 0 && (
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
                            <span className="font-medium">Frequenza:</span>{' '}
                            {plan.frequenza === 'custom' &&
                            plan.giorniCustom?.length
                              ? plan.giorniCustom
                                  .map(
                                    day =>
                                      WEEKDAYS.find(w => w.value === day)?.label
                                  )
                                  .join(', ')
                              : FREQUENCY_OPTIONS.find(
                                  f => f.value === plan.frequenza
                                )?.label}
                          </div>
                          <div className="text-gray-600">
                            <span className="font-medium">Ruolo:</span>{' '}
                            {plan.assegnatoARuolo === 'specifico' &&
                            plan.assegnatoADipendenteSpecifico
                              ? staffOptions.find(
                                  s =>
                                    s.id === plan.assegnatoADipendenteSpecifico
                                )?.label
                              : plan.assegnatoARuolo}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </section>
  )

  // Rendering del modal per l'assegnazione maintenance
  const renderMaintenanceAssignmentModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Assegna manutenzioni - {selectedConservationPoint?.name}
            </h3>
            <p className="text-sm text-gray-500">
              Configura le{' '}
              {selectedConservationPoint?.pointType === 'ambient' ? '3' : '4'}{' '}
              manutenziioni obbligatorie
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleCloseMaintenanceModal}
          >
            ×
          </Button>
        </header>

        <div className="p-6">
          <MaintenanceAssignmentForm
            conservationPoint={selectedConservationPoint!}
            staffOptions={staffOptions}
            onSave={handleAssignMaintenancePlans}
            onCancel={handleCloseMaintenanceModal}
          />
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <ClipboardCheck className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Attività e controlli HACCP
        </h2>
        <p className="text-gray-600">
          Definisci le attività periodiche per garantire la conformità alle
          procedure HACCP.
        </p>
      </header>

      {/* Sezione Manutenzioni Punti Conservazione */}
      {renderConservationMaintenanceSection()}

      <div className="flex justify-center">
        <Button
          variant="outline"
          className="gap-2"
          onClick={handlePrefillTasks}
        >
          <Plus className="h-4 w-4" /> Carica attività predefinite
        </Button>
      </div>

      {renderTaskForm()}
      {renderTaskList()}

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
  staffOptions: Array<{ id: string; label: string; role: string }>
  onSave: (plans: ConservationMaintenancePlan[]) => void
  onCancel: () => void
}

const MaintenanceAssignmentForm = ({
  conservationPoint,
  staffOptions,
  onSave,
  onCancel,
}: MaintenanceAssignmentFormProps) => {
  const requiredMaintenances =
    conservationPoint.pointType === 'ambient'
      ? STANDARD_MAINTENANCE_TYPES.filter(m => m.value !== 'sbrinamento')
      : STANDARD_MAINTENANCE_TYPES

  const [plans, setPlans] = useState<ConservationMaintenancePlan[]>(
    requiredMaintenances.map((maintenance, index) => ({
      id: `${conservationPoint.id}_${maintenance.value}_${Date.now() + index}`,
      conservationPointId: conservationPoint.id,
      manutenzione: maintenance.value,
      frequenza:
        maintenance.value === 'rilevamento_temperatura'
          ? ('giornaliera' as MaintenanceFrequency)
          : maintenance.value === 'sanificazione'
            ? ('settimanale' as MaintenanceFrequency)
            : maintenance.value === 'sbrinamento'
              ? ('annuale' as MaintenanceFrequency)
              : ('custom' as MaintenanceFrequency),
      assegnatoARuolo: 'dipendente' as StaffRole,
      note: '',
      // Precompila giorni per controllo scadenze secondo i dati esempio (Lunedì + Giovedì)
      ...(maintenance.value ===
      ('controllo_scadenze' as StandardMaintenanceType)
        ? {
            giorniCustom: ['lunedi', 'giovedi'] as CustomFrequencyDays[],
          }
        : {}),
    }))
  )

  const [errors, setErrors] = useState<Record<string, string>>({})

  const updatePlan = (
    index: number,
    updates: Partial<ConservationMaintenancePlan>
  ) => {
    setPlans(prev =>
      prev.map((plan, i) => (i === index ? { ...plan, ...updates } : plan))
    )
  }

  const validatePlans = () => {
    const newErrors: Record<string, string> = {}

    plans.forEach((plan, index) => {
      if (!plan.frequenza) {
        newErrors[`plan-${index}-frequenza`] = 'Frequenza obbligatoria'
      }
      if (!plan.assegnatoARuolo) {
        newErrors[`plan-${index}-ruolo`] = 'Ruolo/Dipendente obbligatorio'
      }
      // Dipendente specifico non è più obbligatorio
      // if (plan.assegnatoARuolo === 'specifico' && !plan.assegnatoADipendenteSpecifico) {
      //   newErrors[`plan-${index}-dipendente`] = 'Seleziona un dipendente specifico'
      // }
      if (
        plan.frequenza === 'custom' &&
        (!plan.giorniCustom || plan.giorniCustom.length === 0)
      ) {
        newErrors[`plan-${index}-giorni`] =
          'Seleziona almeno un giorno per frequenza custom'
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
                <p className="text-sm text-gray-600">
                  {maintenanceType.description}
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
                      giorniCustom: value === 'custom' ? ['lunedi'] : undefined,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona frequenza" />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCY_OPTIONS.map(freq => (
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
                <Label>Ruolo/Dipendente *</Label>
                <Select
                  value={plan.assegnatoARuolo || 'role'}
                  onValueChange={value =>
                    updatePlan(index, {
                      assegnatoARuolo: value as StaffRole | 'specifico',
                      assegnatoADipendenteSpecifico:
                        value === 'specifico'
                          ? undefined
                          : plan.assegnatoADipendenteSpecifico,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona tipo assegnazione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectOption value="admin">Amministratore</SelectOption>
                    <SelectOption value="responsabile">
                      Responsabile
                    </SelectOption>
                    <SelectOption value="dipendente">Dipendente</SelectOption>
                    <SelectOption value="collaboratore">
                      Collaboratore
                    </SelectOption>
                    <SelectOption value="specifico">
                      Dipendente specifico
                    </SelectOption>
                  </SelectContent>
                </Select>
                {errors[`plan-${index}-ruolo`] && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors[`plan-${index}-ruolo`]}
                  </p>
                )}
              </div>

              {plan.assegnatoARuolo === 'specifico' && (
                <div className="md:col-span-2">
                  <Label>Dipendente specifico</Label>
                  <Select
                    value={plan.assegnatoADipendenteSpecifico ?? ''}
                    onValueChange={value =>
                      updatePlan(index, {
                        assegnatoADipendenteSpecifico: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona dipendente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectOption value="">Seleziona dipendente</SelectOption>
                      {staffOptions.map(staff => (
                        <SelectOption key={staff.id} value={staff.id}>
                          {staff.label} ({staff.role})
                        </SelectOption>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {plan.frequenza === 'custom' && (
                <div className="md:col-span-2">
                  <Label>Giorni della settimana *</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {WEEKDAYS.map(day => (
                      <label
                        key={day.value}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="checkbox"
                          checked={
                            plan.giorniCustom?.includes(day.value) ?? false
                          }
                          onChange={e => {
                            const currentDays = plan.giorniCustom ?? []
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
                <Label>Categoria (opzionale)</Label>
                <Input
                  value={plan.assegnatoACategoria ?? ''}
                  onChange={e =>
                    updatePlan(index, {
                      assegnatoACategoria: e.target.value,
                    })
                  }
                  placeholder="es. Cuochi, Camière..."
                />
              </div>

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

export default TasksStep
