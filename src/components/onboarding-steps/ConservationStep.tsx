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
import {
  Select,
  SelectOption,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'

import type {
  ConservationPoint,
  ConservationStepFormData,
  ConservationStepProps,
} from '@/types/onboarding'
import {
  CONSERVATION_POINT_TYPES,
  getCategoryById,
  validateConservationPoint,
  generateConservationPointId,
  createDraftConservationPoint,
  normalizeConservationPoint,
  validateTemperatureForType,
  getCompatibleCategories,
} from '@/utils/onboarding/conservationUtils'

const EMPTY_FORM: ConservationStepFormData = {
  name: '',
  departmentId: '',
  targetTemperature: '',
  pointType: 'fridge',
  isBlastChiller: false,
  productCategories: [],
}

const ConservationStep = ({
  data,
  departments,
  onUpdate,
  onValidChange,
}: Omit<ConservationStepProps, 'staff'>) => {
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
  const [temperatureError, setTemperatureError] = useState<string | null>(null)

  useEffect(() => {
    onUpdate({ points })
  }, [points, onUpdate])

  useEffect(() => {
    const allValid =
      points.length > 0 &&
      points.every(point => validateConservationPoint(point).success)
    onValidChange(allValid)
  }, [points, onValidChange])

  // Validazione temperatura in tempo reale
  useEffect(() => {
    if (formData.targetTemperature && formData.pointType !== 'ambient') {
      const temperature = Number(formData.targetTemperature)
      if (!isNaN(temperature)) {
        const validation = validateTemperatureForType(
          temperature,
          formData.pointType
        )
        setTemperatureError(
          validation.valid ? null : validation.message || null
        )
      } else {
        setTemperatureError(null)
      }
    } else {
      setTemperatureError(null)
    }
  }, [formData.targetTemperature, formData.pointType])

  const departmentOptions = useMemo(
    () => departments.filter(department => department.is_active !== false),
    [departments]
  )

  const typeInfo = useMemo(
    () => CONSERVATION_POINT_TYPES[formData.pointType],
    [formData.pointType]
  )

  const compatibleCategories = useMemo(() => {
    const temperature = formData.targetTemperature
      ? Number(formData.targetTemperature)
      : null
    return getCompatibleCategories(temperature, formData.pointType)
  }, [formData.targetTemperature, formData.pointType])

  const resetForm = () => {
    setFormData(EMPTY_FORM)
    setEditingId(null)
    setValidationErrors({})
    setTemperatureError(null)
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
    })
    setValidationErrors({})
    setTemperatureError(null)
  }

  const handleDeletePoint = (id: string) => {
    setPoints(prev => prev.filter(point => point.id !== id))
    if (editingId === id) {
      resetForm()
    }
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
      maintenanceTasks: [],
    })

    const result = validateConservationPoint(normalized)

    // Validazione temperatura aggiuntiva
    if (formData.pointType !== 'ambient' && formData.targetTemperature) {
      const temperature = Number(formData.targetTemperature)
      if (!isNaN(temperature)) {
        const tempValidation = validateTemperatureForType(
          temperature,
          formData.pointType
        )
        if (!tempValidation.valid) {
          setValidationErrors({
            ...result.errors,
            targetTemperature:
              tempValidation.message || 'Temperatura non valida',
          })
          return
        }
      }
    }

    if (!result.success) {
      setValidationErrors(result.errors ?? {})
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

    const bancone = departmentOptions.find(
      dep => dep.name.toLowerCase() === 'bancone'
    )

    const samples: ConservationPoint[] = [
      normalizeConservationPoint({
        id: generateConservationPointId(),
        name: 'Frigo A',
        departmentId: cucina?.id ?? departmentOptions[0].id,
        targetTemperature: 4,
        pointType: 'fridge',
        isBlastChiller: false,
        productCategories: ['fresh_meat', 'fresh_dairy'],
      }),
      normalizeConservationPoint({
        id: generateConservationPointId(),
        name: 'Freezer A',
        departmentId: cucina?.id ?? departmentOptions[0].id,
        targetTemperature: -18,
        pointType: 'freezer',
        isBlastChiller: false,
        productCategories: ['frozen', 'deep_frozen'],
      }),
      normalizeConservationPoint({
        id: generateConservationPointId(),
        name: 'Freezer B',
        departmentId: cucina?.id ?? departmentOptions[0].id,
        targetTemperature: -20,
        pointType: 'freezer',
        isBlastChiller: false,
        productCategories: ['frozen', 'deep_frozen'],
      }),
      normalizeConservationPoint({
        id: generateConservationPointId(),
        name: 'Abbattitore',
        departmentId: cucina?.id ?? departmentOptions[0].id,
        targetTemperature: -25,
        pointType: 'blast',
        isBlastChiller: true,
        productCategories: ['blast_chilling'],
      }),
      normalizeConservationPoint({
        id: generateConservationPointId(),
        name: 'Frigo 1',
        departmentId: bancone?.id ?? departmentOptions[0].id,
        targetTemperature: 2,
        pointType: 'fridge',
        isBlastChiller: false,
        productCategories: ['beverages', 'fresh_produce'],
      }),
      normalizeConservationPoint({
        id: generateConservationPointId(),
        name: 'Frigo 2',
        departmentId: bancone?.id ?? departmentOptions[0].id,
        targetTemperature: 3,
        pointType: 'fridge',
        isBlastChiller: false,
        productCategories: ['beverages', 'fresh_produce'],
      }),
      normalizeConservationPoint({
        id: generateConservationPointId(),
        name: 'Frigo 3',
        departmentId: bancone?.id ?? departmentOptions[0].id,
        targetTemperature: 5,
        pointType: 'fridge',
        isBlastChiller: false,
        productCategories: ['beverages', 'fresh_produce'],
      }),
    ]

    setPoints(samples)
    resetForm()
  }

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
              <Label>Reparto *</Label>
              <Select
                value={formData.departmentId || undefined}
                onValueChange={value =>
                  setFormData(prev => ({ ...prev, departmentId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona un reparto" />
                </SelectTrigger>
                <SelectContent>
                  {departmentOptions.map(department => (
                    <SelectOption key={department.id} value={department.id}>
                      {department.name}
                    </SelectOption>
                  ))}
                </SelectContent>
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
              <Label htmlFor="point-temperature">
                Temperatura target {formData.pointType === 'ambient' ? '' : '*'}
              </Label>
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
                placeholder={
                  formData.pointType === 'ambient'
                    ? 'Non impostabile'
                    : String(typeInfo.temperatureRange.min)
                }
                disabled={formData.pointType === 'ambient'}
                className={
                  formData.pointType === 'ambient'
                    ? 'bg-gray-100 cursor-not-allowed'
                    : ''
                }
                aria-invalid={Boolean(
                  validationErrors.targetTemperature || temperatureError
                )}
              />
              {formData.pointType !== 'ambient' ? (
                <p className="mt-1 text-xs text-gray-500">
                  Range consigliato {typeInfo.temperatureRange.min}°C -{' '}
                  {typeInfo.temperatureRange.max}°C
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  La temperatura non è impostabile per i punti di tipo Ambiente
                </p>
              )}
              {validationErrors.targetTemperature && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.targetTemperature}
                </p>
              )}
              {temperatureError && (
                <p className="mt-1 text-sm text-red-600">{temperatureError}</p>
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
                      className={`justify-start gap-2 transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
                      }`}
                      onClick={() =>
                        setFormData(prev => ({
                          ...prev,
                          pointType: type.value,
                          isBlastChiller: type.value === 'blast',
                        }))
                      }
                    >
                      <Thermometer
                        className={`h-4 w-4 ${isActive ? 'text-white' : type.color}`}
                      />
                      <span className="font-medium">{type.label}</span>
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>

          <div>
            <Label>Categorie prodotti *</Label>
            <p className="mb-3 text-sm text-gray-600">
              Seleziona le categorie di prodotti che verranno conservate in
              questo punto di conservazione. Solo le categorie compatibili con
              la temperatura impostata sono disponibili.
            </p>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {compatibleCategories.map(category => {
                const isSelected = formData.productCategories.includes(
                  category.id
                )
                return (
                  <button
                    key={category.id}
                    type="button"
                    className={`flex items-center justify-between rounded border p-2 text-sm transition-colors ${
                      isSelected
                        ? 'border-blue-400 bg-blue-50 text-blue-900'
                        : 'border-gray-200 bg-white hover:border-blue-200'
                    }`}
                    onClick={() => {
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
                    {category.range && (
                      <span className="text-xs text-gray-500">
                        {category.range.min}°C - {category.range.max}°C
                      </span>
                    )}
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
            {compatibleCategories.length === 0 &&
              formData.targetTemperature && (
                <p className="mt-1 text-sm text-amber-600">
                  Nessuna categoria compatibile con la temperatura{' '}
                  {formData.targetTemperature}°C
                </p>
              )}
            {validationErrors.productCategories && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.productCategories}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-1">
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

          <Button type="submit" className="w-full">
            {editingId ? 'Salva modifiche' : 'Aggiungi punto'}
          </Button>
        </form>
      </section>
    </div>
  )
}

export default ConservationStep
