import React, { useEffect, useMemo, useState } from 'react'
import { Thermometer, AlertTriangle, ShieldCheck, Plus, Trash2, Edit2 } from 'lucide-react'

import { useScrollToForm } from '@/hooks/useScrollToForm'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectOption } from '@/components/ui/Select'

import {
  CONSERVATION_CATEGORIES,
  CONSERVATION_POINT_TYPES,
  getCategoryById,
  getOptimalTemperatureSuggestion,
  isCategoryCompatibleWithType,
  validateConservationPoint,
} from '@/utils/onboarding/conservationUtils'

import type {
  ConservationPoint,
  ConservationStepFormData,
  ConservationStepProps,
} from '@/types/onboarding'

const EMPTY_FORM: ConservationStepFormData = {
  name: '',
  departmentId: '',
  targetTemperature: '',
  pointType: 'fridge',
  isBlastChiller: false,
  productCategories: [],
  source: 'manual',
}

const ConservationStep: React.FC<ConservationStepProps> = ({
  data,
  departments,
  onUpdate,
  onValidChange,
}) => {
  const [points, setPoints] = useState<ConservationPoint[]>(data?.points || [])
  const [formData, setFormData] = useState<ConservationStepFormData>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const { formRef, scrollToForm } = useScrollToForm(Boolean(editingId), 'conservation-form')

  useEffect(() => {
    onUpdate({ points })
  }, [points, onUpdate])

  useEffect(() => {
    const isValid =
      points.length > 0 && points.every(point => validateConservationPoint(point).success)
    onValidChange(isValid)
  }, [points, onValidChange])

  const departmentOptions = useMemo(
    () => departments.filter(department => department.is_active !== false),
    [departments]
  )

  const resetForm = () => {
    setFormData(EMPTY_FORM)
    setValidationErrors({})
    setEditingId(null)
  }

  const handleEditPoint = (point: ConservationPoint) => {
    setEditingId(point.id)
    setFormData({
      name: point.name,
      departmentId: point.departmentId,
      targetTemperature: String(point.targetTemperature),
      pointType: point.pointType,
      isBlastChiller: point.isBlastChiller,
      productCategories: point.productCategories,
      source: point.source,
    })
    setValidationErrors({})
    scrollToForm()
  }

  const handleDeletePoint = (id: string) => {
    setPoints(prev => prev.filter(point => point.id !== id))
    if (editingId === id) {
      resetForm()
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const parsedPoint = validateConservationPoint({
      id: editingId || `cp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      name: formData.name.trim(),
      departmentId: formData.departmentId,
      targetTemperature: parseFloat(formData.targetTemperature),
      pointType: formData.pointType,
      isBlastChiller: formData.isBlastChiller,
      productCategories: Array.from(new Set(formData.productCategories)),
      source: formData.source,
    })

    if (!parsedPoint.success || !parsedPoint.point) {
      setValidationErrors(parsedPoint.errors || {})
      const errorMessage = parsedPoint.errors?.global
      if (errorMessage) {
        setValidationErrors(prev => ({ ...prev, global: errorMessage }))
      }
      return
    }

    const point = parsedPoint.point

    setPoints(prev => {
      if (editingId) {
        return prev.map(existing => (existing.id === editingId ? point : existing))
      }
      return [...prev, point]
    })

    resetForm()
  }

  const prefillSampleData = () => {
    const cucinaId = departmentOptions.find(dep => dep.name.toLowerCase() === 'cucina')?.id
    const salaId = departmentOptions.find(dep => dep.name.toLowerCase() === 'sala')?.id

    const generateId = () => `cp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`

    const samplePoints: ConservationPoint[] = [
      {
        id: generateId(),
        name: 'Frigorifero Cucina 1',
        departmentId: cucinaId || departmentOptions[0]?.id || '',
        targetTemperature: 4,
        pointType: 'fridge',
        isBlastChiller: false,
        productCategories: ['fresh_meat', 'fresh_dairy', 'fresh_produce'],
        source: 'prefill',
      },
      {
        id: generateId(),
        name: 'Congelatore Principale',
        departmentId: cucinaId || departmentOptions[0]?.id || '',
        targetTemperature: -18,
        pointType: 'freezer',
        isBlastChiller: false,
        productCategories: ['frozen', 'deep_frozen'],
        source: 'prefill',
      },
      {
        id: generateId(),
        name: 'Abbattitore Professionale',
        departmentId: cucinaId || departmentOptions[0]?.id || '',
        targetTemperature: -18,
        pointType: 'blast',
        isBlastChiller: true,
        productCategories: ['blast_chilling'],
        source: 'prefill',
      },
      {
        id: generateId(),
        name: 'Vetrina Refrigerata Sala',
        departmentId: salaId || departmentOptions[0]?.id || '',
        targetTemperature: 6,
        pointType: 'fridge',
        isBlastChiller: false,
        productCategories: ['beverages', 'fresh_dairy'],
        source: 'prefill',
      },
    ]

    setPoints(samplePoints)
    resetForm()
  }

  return (
    <div className="space-y-6">
      <header className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Punti di Conservazione</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Configura frigoriferi, congelatori e abbattitori assicurando la conformità ai range HACCP per le categorie di prodotti conservati.
        </p>
      </header>

      <div className="flex justify-center">
        <Button variant="outline" onClick={prefillSampleData} className="gap-2">
          <Plus className="h-4 w-4" />
          Carica punti di esempio
        </Button>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white">
        <header className="border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Punti configurati</h3>
            <p className="text-sm text-gray-500">
              Elenco dei punti di conservazione creati durante l'onboarding
            </p>
          </div>
          <Button variant="ghost" className="gap-2" onClick={scrollToForm}>
            <Plus className="h-4 w-4" />
            {editingId ? 'Modifica punto' : 'Aggiungi punto'}
          </Button>
        </header>

        <div className="divide-y divide-gray-100">
          {points.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-gray-500">
              Nessun punto di conservazione configurato. Aggiungi almeno un punto per procedere.
            </p>
          )}

          {points.map(point => {
            const department = departments.find(dept => dept.id === point.departmentId)
            const validation = validateConservationPoint(point)
            const typeInfo = CONSERVATION_POINT_TYPES[point.pointType]

            return (
              <article
                key={point.id}
                className="grid gap-4 px-4 py-3 md:grid-cols-[1fr_auto] md:items-start"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Thermometer className={`h-4 w-4 ${typeInfo.color}`} aria-hidden />
                    <h4 className="text-base font-semibold text-gray-900">
                      {point.name}
                    </h4>
                    <Badge variant="outline">{typeInfo.label}</Badge>
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

                  <div className="rounded border border-gray-200 bg-gray-50 p-2 text-xs text-gray-600">
                    {getOptimalTemperatureSuggestion(point)}
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-sm">
                    {validation.success ? (
                      <ShieldCheck className="h-4 w-4 text-green-600" aria-hidden />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden />
                    )}
                    <span
                      className={validation.success ? 'text-green-700' : 'text-amber-700' }
                    >
                      {validation.success
                        ? 'Punto conforme ai requisiti HACCP'
                        : validation.errors?.global || 'Verifica categorie e temperatura impostata'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleEditPoint(point)}>
                    <Edit2 className="h-4 w-4" aria-hidden />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDeletePoint(point.id)}>
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-gray-50 p-4" ref={formRef} id="conservation-form">
        <header className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingId ? 'Modifica punto di conservazione' : 'Aggiungi nuovo punto di conservazione'}
          </h3>
          <p className="text-sm text-gray-500">
            Compila i campi obbligatori per definire un punto di conservazione. Le categorie selezionate determinano i range HACCP consentiti.
          </p>
        </header>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="point-name">Nome *</Label>
              <Input
                id="point-name"
                value={formData.name}
                onChange={event => setFormData(prev => ({ ...prev, name: event.target.value }))}
                placeholder="Frigo principale cucina"
                aria-invalid={Boolean(validationErrors.name)}
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="point-department">Reparto *</Label>
              <Select
                id="point-department"
                value={formData.departmentId}
                onValueChange={value => setFormData(prev => ({ ...prev, departmentId: value }))}
              >
                <SelectOption value="">Seleziona un reparto</SelectOption>
                {departmentOptions.map(department => (
                  <SelectOption key={department.id} value={department.id}>
                    {department.name}
                  </SelectOption>
                ))}
              </Select>
              {validationErrors.departmentId && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.departmentId}</p>
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
                onChange={event => setFormData(prev => ({ ...prev, targetTemperature: event.target.value }))}
                placeholder="4"
                aria-invalid={Boolean(validationErrors.targetTemperature)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Inserisci la temperatura in °C. La tipologia del punto viene suggerita automaticamente.
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
                      <type.icon className={type.color} />
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
                const isSelected = formData.productCategories.includes(category.id)
                const supportsType = isCategoryCompatibleWithType(category.id, formData.pointType)
                const ItemIcon = category.icon

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
                          ? prev.productCategories.filter(id => id !== category.id)
                          : [...prev.productCategories, category.id],
                      }))
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <ItemIcon className="h-4 w-4" aria-hidden />
                      {category.label}
                    </div>
                    {isSelected && (
                      <ShieldCheck className="h-4 w-4 text-blue-600" aria-hidden />
                    )}
                  </button>
                )
              })}
            </div>
            {validationErrors.productCategories && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.productCategories}</p>
            )}
          </div>

          <div>
            <Label>Fonte dati</Label>
            <Select
              value={formData.source}
              onValueChange={value => setFormData(prev => ({ ...prev, source: value }))}
            >
              <SelectOption value="manual">Manuale</SelectOption>
              <SelectOption value="prefill">Punti di esempio</SelectOption>
            </Select>
            {validationErrors.source && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.source}</p>
            )}
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

