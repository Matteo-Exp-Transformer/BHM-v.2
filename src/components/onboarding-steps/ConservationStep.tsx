import React, { useEffect, useMemo, useState } from 'react'
import {
  Thermometer,
  ShieldCheck,
  ShieldAlert,
  Plus,
  Trash2,
  Edit2,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectOption } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'

import type {
  ConservationPoint,
  ConservationStepFormData,
  ConservationStepProps,
  MaintenanceTask,
  MaintenanceTaskType,
  TaskFrequency,
} from '@/types/onboarding'
import {
  CONSERVATION_POINT_TYPES,
  CONSERVATION_CATEGORIES,
  getCategoryById,
  isCategoryCompatibleWithType,
  validateConservationPoint,
  generateConservationPointId,
  createDraftConservationPoint,
  normalizeConservationPoint,
  createDraftMaintenanceTask,
  normalizeMaintenanceTask,
  validateMaintenanceTask,
} from '@/utils/onboarding/conservationUtils'

const EMPTY_FORM: ConservationStepFormData = {
  name: '',
  departmentId: '',
  targetTemperature: '',
  pointType: 'fridge',
  isBlastChiller: false,
  productCategories: [],
  source: 'manual',
}

interface MaintenanceDraft extends MaintenanceTask {
  isExpanded: boolean
}

const ConservationStep = ({
  data,
  departments,
  staff,
  onUpdate,
  onValidChange,
}: ConservationStepProps) => {
  const [points, setPoints] = useState<ConservationPoint[]>(
    (data?.points ?? []).map(normalizeConservationPoint)
  )
  const [formData, setFormData] = useState<ConservationStepFormData>({
    ...EMPTY_FORM,
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({})
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceDraft[]>(
    []
  )

  useEffect(() => {
    onUpdate({ points })
  }, [points, onUpdate])

  useEffect(() => {
    const allValid =
      points.length > 0 &&
      points.every(point => validateConservationPoint(point).success)
    onValidChange(allValid)
  }, [points, onValidChange])

  const departmentOptions = useMemo(
    () => departments.filter(department => department.is_active !== false),
    [departments]
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

  const typeInfo = useMemo(
    () => CONSERVATION_POINT_TYPES[formData.pointType],
    [formData.pointType]
  )

  const resetForm = () => {
    setFormData(EMPTY_FORM)
    setEditingId(null)
    setMaintenanceTasks([])
    setValidationErrors({})
  }

  const handleEditPoint = (point: ConservationPoint) => {
    const draft = createDraftConservationPoint(point)
    setEditingId(point.id)
    setFormData({
      name: draft.name,
      departmentId: draft.departmentId,
      targetTemperature: draft.targetTemperature.toString(),
      pointType: draft.pointType,
      isBlastChiller: draft.isBlastChiller,
      productCategories: draft.productCategories,
      source: draft.source,
    })
    setMaintenanceTasks(
      (draft.maintenanceTasks ?? []).map(task => ({
        ...task,
        isExpanded: false,
      }))
    )
    setValidationErrors({})
  }

  const handleDeletePoint = (id: string) => {
    setPoints(prev => prev.filter(point => point.id !== id))
    if (editingId === id) {
      resetForm()
    }
  }

  const handleAddMaintenanceTask = () => {
    setMaintenanceTasks(prev => [
      ...prev,
      {
        ...createDraftMaintenanceTask(),
        isExpanded: true,
      },
    ])
  }

  const handleUpdateMaintenanceTask = (
    index: number,
    partial: Partial<MaintenanceDraft>
  ) => {
    setMaintenanceTasks(prev => {
      const next = [...prev]
      next[index] = { ...next[index], ...partial }
      return next
    })
  }

  const handleRemoveMaintenanceTask = (index: number) => {
    setMaintenanceTasks(prev => prev.filter((_, idx) => idx !== index))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalized = normalizeConservationPoint({
      id: editingId ?? generateConservationPointId(),
      name: formData.name.trim(),
      departmentId: formData.departmentId,
      targetTemperature: Number(formData.targetTemperature),
      pointType: formData.pointType,
      isBlastChiller: formData.isBlastChiller,
      productCategories: [...new Set(formData.productCategories)],
      source: formData.source,
      maintenanceTasks: maintenanceTasks.map(normalizeMaintenanceTask),
    })

    const result = validateConservationPoint(normalized)

    const maintenanceErrors = maintenanceTasks.flatMap((task, index) => {
      const validation = validateMaintenanceTask(task)
      if (!validation.success) {
        return Object.entries(validation.errors ?? {}).map(
          ([field, message]) => ({
            key: `maintenance.${index}.${field}`,
            message,
          })
        )
      }
      return []
    })

    if (!result.success || maintenanceErrors.length > 0) {
      const errors: Record<string, string> = { ...(result.errors ?? {}) }
      maintenanceErrors.forEach(error => {
        errors[error.key] = error.message
      })
      setValidationErrors(errors)
      return
    }

    setPoints(prev => {
      if (editingId) {
        return prev.map(existing =>
          existing.id === editingId ? normalized : existing
        )
      }
      return [...prev, normalized]
    })

    resetForm()
  }

  const prefillSampleData = () => {
    if (departmentOptions.length === 0) return

    const cucina = departmentOptions.find(
      dep => dep.name.toLowerCase() === 'cucina'
    )
    const sala = departmentOptions.find(
      dep => dep.name.toLowerCase() === 'sala'
    )

    const samples: ConservationPoint[] = [
      normalizeConservationPoint({
        id: generateConservationPointId(),
        name: 'Frigorifero Cucina 1',
        departmentId: cucina?.id ?? departmentOptions[0].id,
        targetTemperature: 4,
        pointType: 'fridge',
        isBlastChiller: false,
        productCategories: ['fresh_meat', 'fresh_dairy'],
        source: 'prefill',
      }),
      normalizeConservationPoint({
        id: generateConservationPointId(),
        name: 'Congelatore principale',
        departmentId: cucina?.id ?? departmentOptions[0].id,
        targetTemperature: -18,
        pointType: 'freezer',
        isBlastChiller: false,
        productCategories: ['frozen', 'deep_frozen'],
        source: 'prefill',
      }),
      normalizeConservationPoint({
        id: generateConservationPointId(),
        name: 'Abbattitore rapido',
        departmentId: cucina?.id ?? departmentOptions[0].id,
        targetTemperature: -18,
        pointType: 'blast',
        isBlastChiller: true,
        productCategories: ['blast_chilling'],
        source: 'prefill',
      }),
      normalizeConservationPoint({
        id: generateConservationPointId(),
        name: 'Vetrina refrigerata sala',
        departmentId: sala?.id ?? departmentOptions[0].id,
        targetTemperature: 6,
        pointType: 'fridge',
        isBlastChiller: false,
        productCategories: ['beverages', 'fresh_produce'],
        source: 'prefill',
      }),
    ]

    setPoints(samples)
    resetForm()
  }

  const renderMaintenanceEditor = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900">
          Task di manutenzione programmata
        </h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddMaintenanceTask}
        >
          <Plus className="mr-2 h-4 w-4" /> Aggiungi task
        </Button>
      </div>

      {maintenanceTasks.length === 0 && (
        <p className="text-sm text-gray-500">
          Nessun task configurato – facoltativo ma consigliato.
        </p>
      )}

      {maintenanceTasks.map((task, index) => {
        const errors = Object.entries(validationErrors)
          .filter(([key]) => key.startsWith(`maintenance.${index}`))
          .reduce<Record<string, string>>((acc, [key, message]) => {
            acc[key.split('.').pop() ?? key] = message
            return acc
          }, {})

        return (
          <div
            key={task.id}
            className="rounded-lg border border-gray-200 bg-white"
          >
            <header
              className="flex items-center justify-between border-b border-gray-100 p-3"
              onClick={() =>
                handleUpdateMaintenanceTask(index, {
                  isExpanded: !task.isExpanded,
                })
              }
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {task.title || 'Nuova manutenzione'}
                </p>
                <p className="text-xs text-gray-500">
                  {task.type} • {task.frequency} •{' '}
                  {task.estimatedDuration || 30} min
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!task.isExpanded && (
                  <Badge tone="warning" variant="outline">
                    Clicca per espandere
                  </Badge>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleRemoveMaintenanceTask(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </header>

            {task.isExpanded && (
              <div className="space-y-4 p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Titolo *</Label>
                    <Input
                      value={task.title}
                      onChange={event =>
                        handleUpdateMaintenanceTask(index, {
                          title: event.target.value,
                        })
                      }
                      aria-invalid={Boolean(errors.title)}
                    />
                    {errors.title && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.title}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Tipo *</Label>
                    <select
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      value={task.type}
                      onChange={event =>
                        handleUpdateMaintenanceTask(index, {
                          type: event.target.value as MaintenanceTaskType,
                        })
                      }
                    >
                      {Object.entries(CONSERVATION_POINT_TYPES).map(
                        ([key, info]) => (
                          <option key={key} value={key}>
                            {info.label}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label>Frequenza *</Label>
                    <select
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      value={task.frequency}
                      onChange={event =>
                        handleUpdateMaintenanceTask(index, {
                          frequency: event.target.value as TaskFrequency,
                        })
                      }
                    >
                      <option value="daily">Giornaliera</option>
                      <option value="weekly">Settimanale</option>
                      <option value="monthly">Mensile</option>
                      <option value="quarterly">Trimestrale</option>
                      <option value="annually">Annuale</option>
                      <option value="custom">Personalizzata</option>
                    </select>
                  </div>
                  <div>
                    <Label>Durata stimata (min)</Label>
                    <Input
                      type="number"
                      min={5}
                      step={5}
                      value={task.estimatedDuration ?? 30}
                      onChange={event =>
                        handleUpdateMaintenanceTask(index, {
                          estimatedDuration: Number(event.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Priorità</Label>
                    <select
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      value={task.priority ?? 'medium'}
                      onChange={event =>
                        handleUpdateMaintenanceTask(index, {
                          priority: event.target
                            .value as MaintenanceDraft['priority'],
                        })
                      }
                    >
                      <option value="low">Bassa</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                      <option value="critical">Critica</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Assegnato a</Label>
                    <select
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      value={task.assignedStaffIds?.[0] ?? ''}
                      onChange={event =>
                        handleUpdateMaintenanceTask(index, {
                          assignedStaffIds: event.target.value
                            ? [event.target.value]
                            : [],
                        })
                      }
                    >
                      <option value="">Assegnazione automatica</option>
                      {staffOptions.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.label} ({member.role})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Prossima scadenza *</Label>
                    <Input
                      type="datetime-local"
                      value={task.nextDue ?? ''}
                      onChange={event =>
                        handleUpdateMaintenanceTask(index, {
                          nextDue: event.target.value,
                        })
                      }
                      aria-invalid={Boolean(errors.nextDue)}
                    />
                    {errors.nextDue && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.nextDue}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Checklist / istruzioni</Label>
                  <Textarea
                    rows={3}
                    value={(task.instructions ?? []).join('\n')}
                    onChange={event =>
                      handleUpdateMaintenanceTask(index, {
                        instructions: event.target.value
                          .split('\n')
                          .map(entry => entry.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="Inserisci ogni istruzione HACCP su una riga"
                  />
                </div>

                <div>
                  <Label>Note operatore</Label>
                  <Textarea
                    rows={2}
                    value={task.notes ?? ''}
                    onChange={event =>
                      handleUpdateMaintenanceTask(index, {
                        notes: event.target.value,
                      })
                    }
                  />
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Punti di conservazione
        </h2>
        <p className="mx-auto max-w-2xl text-gray-600">
          Configura frigoriferi, congelatori e abbattitori assicurando i range
          HACCP corretti per le categorie di prodotto gestite.
        </p>
      </header>

      <div className="flex justify-center">
        <Button variant="outline" onClick={prefillSampleData} className="gap-2">
          <Plus className="h-4 w-4" /> Carica punti predefiniti
        </Button>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white">
        <header className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div>
            <h3 className="font-semibold text-gray-900">Punti configurati</h3>
            <p className="text-sm text-gray-500">
              Elenco dei punti di conservazione creati durante l'onboarding
            </p>
          </div>
          <Button
            variant="ghost"
            className="gap-2"
            onClick={() => setEditingId(null)}
          >
            <Plus className="h-4 w-4" />{' '}
            {editingId ? 'Modifica punto' : 'Aggiungi punto'}
          </Button>
        </header>

        <div className="divide-y divide-gray-100">
          {points.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-gray-500">
              Nessun punto di conservazione configurato. Aggiungi almeno un
              punto per procedere.
            </p>
          )}

          {points.map(point => {
            const department = departments.find(
              dept => dept.id === point.departmentId
            )
            const validation = validateConservationPoint(point)
            const info = CONSERVATION_POINT_TYPES[point.pointType]

            return (
              <article
                key={point.id}
                className="grid gap-4 px-4 py-3 md:grid-cols-[1fr_auto] md:items-start"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Thermometer
                      className={`h-4 w-4 ${info.color}`}
                      aria-hidden
                    />
                    <h4 className="text-base font-semibold text-gray-900">
                      {point.name}
                    </h4>
                    <Badge variant="outline">{info.label}</Badge>
                    {point.isBlastChiller && (
                      <Badge tone="warning" variant="outline">
                        Abbattitore
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                    {department && (
                      <Badge variant="outline">{department.name}</Badge>
                    )}
                    <Badge variant="secondary">
                      {point.targetTemperature}°C
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                    {point.productCategories.map(categoryId => {
                      const category = getCategoryById(categoryId)
                      return category ? (
                        <Badge key={category.id} variant="outline">
                          {category.label}
                        </Badge>
                      ) : null
                    })}
                  </div>

                  <div
                    className={`flex items-center gap-2 rounded border px-3 py-2 text-sm ${
                      validation.success
                        ? 'border-green-200 bg-green-50 text-green-700'
                        : 'border-amber-200 bg-amber-50 text-amber-700'
                    }`}
                  >
                    {validation.success ? (
                      <ShieldCheck className="h-4 w-4" aria-hidden />
                    ) : (
                      <ShieldAlert className="h-4 w-4" aria-hidden />
                    )}
                    <span>
                      {validation.success
                        ? 'Punto conforme ai requisiti HACCP'
                        : validation.errors?.global ||
                          'Verifica categorie selezionate e temperatura impostata'}
                    </span>
                  </div>

                  {point.maintenanceTasks &&
                    point.maintenanceTasks.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-gray-700">
                          Task programmati:
                        </p>
                        <ul className="space-y-1 text-xs text-gray-600">
                          {point.maintenanceTasks.map(task => (
                            <li key={task.id}>
                              • {task.title} ({task.frequency})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEditPoint(point)}
                  >
                    <Edit2 className="h-4 w-4" aria-hidden />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeletePoint(point.id)}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <header className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingId
              ? 'Modifica punto di conservazione'
              : 'Aggiungi nuovo punto di conservazione'}
          </h3>
          <p className="text-sm text-gray-500">
            Compila i campi obbligatori per definire il punto di conservazione e
            le relative attività.
          </p>
        </header>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="point-name">Nome *</Label>
              <Input
                id="point-name"
                value={formData.name}
                onChange={event =>
                  setFormData(prev => ({ ...prev, name: event.target.value }))
                }
                placeholder="Frigo principale cucina"
                aria-invalid={Boolean(validationErrors.name)}
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.name}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="point-department">Reparto *</Label>
              <Select
                id="point-department"
                value={formData.departmentId}
                onValueChange={value =>
                  setFormData(prev => ({ ...prev, departmentId: value }))
                }
              >
                <SelectOption value="">Seleziona un reparto</SelectOption>
                {departmentOptions.map(department => (
                  <SelectOption key={department.id} value={department.id}>
                    {department.name}
                  </SelectOption>
                ))}
              </Select>
              {validationErrors.departmentId && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.departmentId}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="point-temperature">Temperatura target *</Label>
              <Input
                id="point-temperature"
                type="number"
                step="0.1"
                min="-99"
                max="30"
                value={formData.targetTemperature}
                onChange={event =>
                  setFormData(prev => ({
                    ...prev,
                    targetTemperature: event.target.value,
                  }))
                }
                placeholder={String(typeInfo.temperatureRange.min)}
                aria-invalid={Boolean(validationErrors.targetTemperature)}
              />
              <p className="mt-1 text-xs text-gray-500">
                Range consigliato {typeInfo.temperatureRange.min}°C -{' '}
                {typeInfo.temperatureRange.max}°C
              </p>
              {validationErrors.targetTemperature && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.targetTemperature}
                </p>
              )}
            </div>

            <div>
              <Label>Tipologia</Label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(CONSERVATION_POINT_TYPES).map(type => {
                  const isActive = formData.pointType === type.value
                  return (
                    <Button
                      key={type.value}
                      type="button"
                      variant={isActive ? 'default' : 'outline'}
                      className="justify-start gap-2"
                      onClick={() =>
                        setFormData(prev => ({
                          ...prev,
                          pointType: type.value,
                          isBlastChiller: type.value === 'blast',
                        }))
                      }
                    >
                      <Thermometer className={type.color} />
                      {type.label}
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>

          <div>
            <Label>Categorie prodotti *</Label>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {CONSERVATION_CATEGORIES.map(category => {
                const isSelected = formData.productCategories.includes(
                  category.id
                )
                const supportsType = isCategoryCompatibleWithType(
                  category.id,
                  formData.pointType
                )
                return (
                  <button
                    key={category.id}
                    type="button"
                    className={`flex items-center justify-between rounded border p-2 text-sm transition-colors ${
                      isSelected
                        ? 'border-blue-400 bg-blue-50 text-blue-900'
                        : 'border-gray-200 bg-white hover:border-blue-200'
                    } ${supportsType ? '' : 'pointer-events-none opacity-40'}`}
                    onClick={() => {
                      if (!supportsType) return
                      setFormData(prev => ({
                        ...prev,
                        productCategories: isSelected
                          ? prev.productCategories.filter(
                              id => id !== category.id
                            )
                          : [...prev.productCategories, category.id],
                      }))
                    }}
                  >
                    <span>{category.label}</span>
                    {isSelected && (
                      <ShieldCheck
                        className="h-4 w-4 text-blue-600"
                        aria-hidden
                      />
                    )}
                  </button>
                )
              })}
            </div>
            {validationErrors.productCategories && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.productCategories}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Fonte dati</Label>
              <Select
                value={formData.source}
                onValueChange={value =>
                  setFormData(prev => ({ ...prev, source: value }))
                }
              >
                <SelectOption value="manual">Inserimento manuale</SelectOption>
                <SelectOption value="prefill">
                  Precompilazione guidata
                </SelectOption>
                <SelectOption value="import">Importazione dati</SelectOption>
              </Select>
            </div>
            <div>
              <Label>Note operative</Label>
              <Textarea
                rows={2}
                value={validationErrors.global ? validationErrors.global : ''}
                readOnly
                className="border-dashed text-sm text-amber-600"
              />
            </div>
          </div>

          {renderMaintenanceEditor()}

          <Button type="submit" className="w-full">
            {editingId ? 'Salva modifiche' : 'Aggiungi punto'}
          </Button>
        </form>
      </section>
    </div>
  )
}

export default ConservationStep
