import React, { useEffect, useMemo, useState } from 'react'
import {
  Thermometer,
  ShieldCheck,
  ShieldAlert,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
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
import { Modal } from '@/components/ui/Modal'
import OptimizedImage from '@/components/ui/OptimizedImage'

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
  getCompatibleCategories,
} from '@/utils/onboarding/conservationUtils'
import {
  getConservationTempRangeString,
  DEFAULT_TEMPERATURES,
} from '@/utils/conservationConstants'
import {
  APPLIANCE_CATEGORY_LABELS,
  getProfileById,
  getProfilesForAppliance,
  mapCategoryIdsToDbNames,
  type ApplianceCategory,
  type ConservationProfileId,
} from '@/utils/conservationProfiles'
import {
  getApplianceImagePathWithProfile,
  hasApplianceImageAvailable,
} from '@/config/applianceImages'

const EMPTY_FORM: ConservationStepFormData = {
  name: '',
  departmentId: '',
  targetTemperature: '',
  pointType: 'fridge',
  isBlastChiller: false,
  productCategories: [],
  applianceCategory: undefined,
  profileId: undefined,
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
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    onUpdate({ points })
  }, [points, onUpdate])

  useEffect(() => {
    setImageError(false)
  }, [formData.applianceCategory, formData.profileId])

  useEffect(() => {
    if (formData.pointType !== 'fridge') setIsImageModalOpen(false)
  }, [formData.pointType])

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

  const calculatedTemperature = useMemo(() => {
    if (editingId) {
      const existingPoint = points.find(p => p.id === editingId)
      if (existingPoint?.targetTemperature !== undefined) {
        return existingPoint.targetTemperature
      }
    }
    return DEFAULT_TEMPERATURES[formData.pointType] ?? 4
  }, [editingId, points, formData.pointType])

  const compatibleCategories = useMemo(() => {
    return getCompatibleCategories(calculatedTemperature, formData.pointType)
  }, [calculatedTemperature, formData.pointType])

  const selectedProfile = useMemo(() => {
    if (!formData.applianceCategory || !formData.profileId) return null
    return getProfileById(
      formData.profileId as ConservationProfileId,
      formData.applianceCategory as ApplianceCategory
    )
  }, [formData.applianceCategory, formData.profileId])

  const resetForm = () => {
    setFormData(EMPTY_FORM)
    setEditingId(null)
    setValidationErrors({})
    setIsImageModalOpen(false)
    setImageError(false)
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
      applianceCategory: draft.applianceCategory,
      profileId: draft.profileId,
    })
    setValidationErrors({})
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
      targetTemperature: calculatedTemperature,
      pointType: formData.pointType,
      isBlastChiller: formData.isBlastChiller,
      productCategories: [...new Set(formData.productCategories)],
      source: 'manual' as const, // ✅ FIXED: Campo obbligatorio per validazione
      maintenanceTasks: [],
      applianceCategory: formData.applianceCategory,
      profileId: formData.profileId,
    })

    const result = validateConservationPoint(normalized)

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
        source: 'prefill',
        applianceCategory: 'vertical_fridge_with_freezer',
        profileId: 'vegetables_generic', // Raccomanda 4°C
      }),
      normalizeConservationPoint({
        id: generateConservationPointId(),
        name: 'Freezer A',
        departmentId: cucina?.id ?? departmentOptions[0].id,
        targetTemperature: -18,
        pointType: 'freezer',
        isBlastChiller: false,
        productCategories: ['frozen', 'deep_frozen'],
        source: 'prefill',
      }),
      normalizeConservationPoint({
        id: generateConservationPointId(),
        name: 'Freezer B',
        departmentId: cucina?.id ?? departmentOptions[0].id,
        targetTemperature: -20,
        pointType: 'freezer',
        isBlastChiller: false,
        productCategories: ['frozen', 'deep_frozen'],
        source: 'prefill',
      }),
      normalizeConservationPoint({
        id: generateConservationPointId(),
        name: 'Abbattitore',
        departmentId: cucina?.id ?? departmentOptions[0].id,
        targetTemperature: -25,
        pointType: 'blast',
        isBlastChiller: true,
        productCategories: ['blast_chilling'],
        source: 'prefill',
      }),
      normalizeConservationPoint({
        id: generateConservationPointId(),
        name: 'Frigo 1',
        departmentId: bancone?.id ?? departmentOptions[0].id,
        targetTemperature: 2,
        pointType: 'fridge',
        isBlastChiller: false,
        productCategories: ['beverages', 'fresh_produce'],
        source: 'prefill',
        applianceCategory: 'vertical_fridge_1_door',
        profileId: 'max_capacity', // Raccomanda 2°C
      }),
      normalizeConservationPoint({
        id: generateConservationPointId(),
        name: 'Frigo 2',
        departmentId: bancone?.id ?? departmentOptions[0].id,
        targetTemperature: 3,
        pointType: 'fridge',
        isBlastChiller: false,
        productCategories: ['beverages', 'fresh_produce'],
        source: 'prefill',
        applianceCategory: 'vertical_fridge_2_doors',
        profileId: 'meat_generic', // Raccomanda 3°C
      }),
      normalizeConservationPoint({
        id: generateConservationPointId(),
        name: 'Frigo 3',
        departmentId: bancone?.id ?? departmentOptions[0].id,
        targetTemperature: 1,
        pointType: 'fridge',
        isBlastChiller: false,
        productCategories: ['beverages', 'fresh_produce'],
        source: 'prefill',
        applianceCategory: 'base_refrigerated',
        profileId: 'fish_generic', // Raccomanda 1°C
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
            onClick={() => setEditingId(editingId ? null : 'new')}
          >
            <Plus className="h-4 w-4" />
            {editingId ? 'Annulla' : 'Aggiungi punto'}
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
                        : (validation.errors &&
                            Object.values(validation.errors).join(' • ')) ||
                          'Verifica i campi obbligatori'}
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

      {/* Form - Mostra solo se non ci sono punti o se stiamo editando */}
      {(points.length === 0 || editingId) && (
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
                Range temperatura consigliato
              </Label>
              <Input
                id="point-temperature"
                type="text"
                value={getConservationTempRangeString(formData.pointType) || 'Seleziona tipo'}
                readOnly
                className="bg-gray-100 cursor-not-allowed text-black"
                aria-label={`Range temperatura per ${formData.pointType}: ${getConservationTempRangeString(formData.pointType)}`}
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.pointType === 'ambient'
                  ? 'La temperatura non è monitorabile per i punti di tipo Ambiente'
                  : 'Il range indica le temperature consigliate per questo tipo di punto'}
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
                          // Reset appliance category e profile se non è più un frigorifero
                          applianceCategory: type.value === 'fridge' ? prev.applianceCategory : undefined,
                          profileId: type.value === 'fridge' ? prev.profileId : undefined,
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

          {/* Sezione Profilo Punto di Conservazione - Solo per frigoriferi */}
          {formData.pointType === 'fridge' && (
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                Configurazione Punto di Conservazione
              </h3>

              {/* Select Categoria Appliance e Profilo HACCP */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="appliance-category">Categoria elettrodomestico</Label>
                  <Select
                    value={formData.applianceCategory || ''}
                    onValueChange={(value) =>
                      setFormData(prev => ({
                        ...prev,
                        applianceCategory: value as ApplianceCategory,
                        profileId: undefined,
                      }))
                    }
                  >
                    <SelectTrigger id="appliance-category">
                      <SelectValue placeholder="Seleziona categoria..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(APPLIANCE_CATEGORY_LABELS).map(([value, label]) => (
                        <SelectOption key={value} value={value}>
                          {label}
                        </SelectOption>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {formData.applianceCategory && (
                  <div className="space-y-2">
                    <Label htmlFor="profile-select">Profilo HACCP</Label>
                    <Select
                      value={formData.profileId || ''}
                      onValueChange={(value) =>
                        setFormData(prev => ({ ...prev, profileId: value }))
                      }
                    >
                      <SelectTrigger id="profile-select">
                        <SelectValue placeholder="Seleziona profilo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {getProfilesForAppliance(formData.applianceCategory as ApplianceCategory).map(
                          profile => (
                            <SelectOption
                              key={profile.profileId}
                              value={profile.profileId}
                            >
                              {profile.name}
                            </SelectOption>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Layout Split: Categorie auto-assegnate + Immagine Elettrodomestico */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Categorie prodotti (auto-assegnate)</Label>
                    <span className="text-xs text-blue-600">Dal profilo HACCP</span>
                  </div>
                  <div className="border rounded-lg p-4 bg-gray-50 min-h-[200px] flex items-center justify-center">
                    {selectedProfile ? (
                      <div className="w-full max-h-[350px] overflow-y-auto">
                        <div className="space-y-2">
                          {mapCategoryIdsToDbNames(
                            selectedProfile.allowedCategoryIds
                          ).map((categoryName, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200"
                            >
                              <ShieldCheck className="h-4 w-4 text-green-600 flex-shrink-0" />
                              <span className="text-sm text-green-900">
                                {categoryName}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-400">
                        <ShieldCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">
                          Seleziona un profilo HACCP per visualizzare le categorie
                          auto-assegnate
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Immagine Elettrodomestico</Label>
                  {formData.applianceCategory &&
                  hasApplianceImageAvailable(
                    formData.applianceCategory as ApplianceCategory,
                    formData.profileId ?? null
                  ) &&
                  !imageError ? (
                    <div
                      className="border rounded-lg p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors group relative min-h-[200px] flex items-center justify-center"
                      onClick={() => setIsImageModalOpen(true)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setIsImageModalOpen(true)
                        }
                      }}
                      aria-label="Clicca per ingrandire l'immagine dell'elettrodomestico"
                    >
                      <OptimizedImage
                        src={
                          getApplianceImagePathWithProfile(
                            formData.applianceCategory as ApplianceCategory,
                            formData.profileId ?? null
                          )!
                        }
                        alt={
                          APPLIANCE_CATEGORY_LABELS[
                            formData.applianceCategory as ApplianceCategory
                          ]
                        }
                        className="max-w-full max-h-[280px] object-contain"
                        onError={() => setImageError(true)}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium bg-black/50 px-3 py-1 rounded">
                          Clicca per ingrandire
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="border rounded-lg p-4 bg-gray-50 min-h-[200px] flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <Thermometer className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">
                          {formData.applianceCategory
                            ? 'Immagine non disponibile'
                            : "Seleziona una categoria elettrodomestico per visualizzare l'immagine"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Info Box Note HACCP */}
              {selectedProfile && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-blue-800 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Note HACCP
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {selectedProfile.haccpNotes.map((note, i) => (
                      <li key={i}>• {note}</li>
                    ))}
                  </ul>
                  <p className="text-sm text-blue-600 mt-2">
                    Temperatura consigliata:{' '}
                    <strong>{selectedProfile.recommendedSetPointsC.fridge}°C</strong>
                  </p>
                </div>
              )}
            </div>
          )}

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
            {compatibleCategories.length === 0 && (
              <p className="mt-1 text-sm text-amber-600">
                Nessuna categoria compatibile con il tipo selezionato
              </p>
            )}
            {validationErrors.productCategories && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.productCategories}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full">
            {editingId ? 'Salva modifiche' : 'Aggiungi punto'}
          </Button>

          {/* Modal Lightbox Immagine Elettrodomestico (frigoriferi) */}
          {formData.pointType === 'fridge' && formData.applianceCategory && (
            <Modal
              isOpen={isImageModalOpen}
              onClose={() => setIsImageModalOpen(false)}
              title={
                APPLIANCE_CATEGORY_LABELS[
                  formData.applianceCategory as ApplianceCategory
                ] ?? 'Elettrodomestico'
              }
              size="xl"
            >
              <div className="flex items-center justify-center p-4 min-h-[400px]">
                <img
                  src={
                    getApplianceImagePathWithProfile(
                      formData.applianceCategory as ApplianceCategory,
                      formData.profileId ?? null
                    )!
                  }
                  alt={`${APPLIANCE_CATEGORY_LABELS[formData.applianceCategory as ApplianceCategory]} - Vista ingrandita`}
                  className="max-w-full max-h-[80vh] object-contain"
                />
              </div>
            </Modal>
          )}
        </form>
      </section>
      )}
    </div>
  )
}

export default ConservationStep
