import { useEffect, useMemo, useState } from 'react'
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
import { Select, SelectOption } from '@/components/ui/Select'

import type {
  GeneralTask,
  HaccpTaskCategory,
  TaskFrequency,
  TaskPriority,
  TasksStepData,
  TasksStepProps,
} from '@/types/onboarding'
import {
  createDraftTask,
  normalizeGeneralTask,
  validateGeneralTask,
  HACCP_TASK_CATEGORIES,
  TASK_FREQUENCIES,
  TASK_PRIORITY_OPTIONS,
} from '@/utils/onboarding/taskUtils'

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
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    const payload: TasksStepData = {
      generalTasks: tasks,
      maintenanceTasks: data?.maintenanceTasks ?? [],
    }
    onUpdate(payload)
  }, [tasks, data?.maintenanceTasks, onUpdate])

  useEffect(() => {
    const isValid =
      tasks.length > 0 && tasks.every(task => validateGeneralTask(task).success)
    onValidChange(isValid)
  }, [tasks, onValidChange])

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
                {HACCP_TASK_CATEGORIES.map(category => (
                  <SelectOption key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </SelectOption>
                ))}
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
                {TASK_FREQUENCIES.map(freq => (
                  <SelectOption key={freq.value} value={freq.value}>
                    {freq.label}
                  </SelectOption>
                ))}
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
                {TASK_PRIORITY_OPTIONS.map(priority => (
                  <SelectOption key={priority.value} value={priority.value}>
                    {priority.label}
                  </SelectOption>
                ))}
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
                <SelectOption value="">Tutti i reparti</SelectOption>
                {departmentOptions.map(department => (
                  <SelectOption key={department.id} value={department.id}>
                    {department.name}
                  </SelectOption>
                ))}
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
                <SelectOption value="">Nessuno specifico</SelectOption>
                {conservationOptions.map(point => (
                  <SelectOption key={point.id} value={point.id}>
                    {point.name} ({point.pointType})
                  </SelectOption>
                ))}
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

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        ℹ️ Le attività configurate verranno automaticamente assegnate al
        personale secondo la frequenza indicata e monitorate nel sistema
        principale.
      </div>
    </div>
  )
}

export default TasksStep
