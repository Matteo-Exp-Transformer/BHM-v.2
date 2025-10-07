import React, { useState, useEffect } from 'react'
import { X, Tag, Thermometer, Calendar } from 'lucide-react'
import {
  ProductCategory,
  CreateCategoryForm,
  ConservationPointType,
} from '@/types/inventory'

interface AddCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateCategoryForm) => void
  category?: ProductCategory | null
  isLoading: boolean
}

const STORAGE_TYPE_OPTIONS = [
  { value: ConservationPointType.AMBIENT, label: 'Ambiente' },
  { value: ConservationPointType.FRIDGE, label: 'Frigorifero' },
  { value: ConservationPointType.FREEZER, label: 'Freezer' },
  { value: ConservationPointType.BLAST, label: 'Abbattitore' },
]

const ALLERGEN_OPTIONS = [
  'glutine',
  'latte',
  'uova',
  'soia',
  'frutta_guscio',
  'arachidi',
  'pesce',
  'crostacei',
]

export function AddCategoryModal({
  isOpen,
  onClose,
  onSubmit,
  category,
  isLoading,
}: AddCategoryModalProps) {
  const [formData, setFormData] = useState<CreateCategoryForm>({
    name: '',
    description: '',
    temperature_requirements: {
      min_temp: 0,
      max_temp: 25,
      storage_type: ConservationPointType.AMBIENT,
    },
    default_expiry_days: undefined,
    allergen_info: [],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        temperature_requirements: category.temperature_requirements || {
          min_temp: 0,
          max_temp: 25,
          storage_type: ConservationPointType.AMBIENT,
        },
        default_expiry_days: category.default_expiry_days || undefined,
        allergen_info: category.allergen_info || [],
      })
    } else {
      setFormData({
        name: '',
        description: '',
        temperature_requirements: {
          min_temp: 0,
          max_temp: 25,
          storage_type: '' as any,
        },
        default_expiry_days: undefined,
        allergen_info: [],
      })
    }
    setErrors({})
  }, [category, isOpen])

  const handleInputChange = (field: keyof CreateCategoryForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleTemperatureChange = (
    field: 'min_temp' | 'max_temp' | 'storage_type',
    value: string | number
  ) => {
    setFormData(prev => ({
      ...prev,
      temperature_requirements: {
        ...prev.temperature_requirements!,
        [field]: value,
      },
    }))
  }

  const handleAllergenToggle = (allergen: string) => {
    setFormData(prev => ({
      ...prev,
      allergen_info: prev.allergen_info.includes(allergen)
        ? prev.allergen_info.filter(a => a !== allergen)
        : [...prev.allergen_info, allergen],
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Il nome della categoria è obbligatorio'
    }

    if (formData.temperature_requirements) {
      if (
        formData.temperature_requirements.min_temp >=
        formData.temperature_requirements.max_temp
      ) {
        newErrors.temperature =
          'La temperatura minima deve essere inferiore alla massima'
      }
    }

    if (formData.default_expiry_days && formData.default_expiry_days <= 0) {
      newErrors.default_expiry_days =
        'I giorni di scadenza devono essere maggiori di zero'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Tag className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {category ? 'Modifica Categoria' : 'Nuova Categoria'}
              </h2>
              <p className="text-sm text-gray-600">
                {category
                  ? 'Aggiorna le informazioni della categoria'
                  : 'Crea una nuova categoria di prodotti'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Informazioni Base
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Categoria *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Es. Verdura Fresca"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrizione
              </label>
              <textarea
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Descrizione della categoria..."
              />
            </div>
          </div>

          {/* Temperature Requirements */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Thermometer className="w-5 h-5" />
              Requisiti di Temperatura
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo di Conservazione
                </label>
                <select
                  value={
                    formData.temperature_requirements?.storage_type ||
                    ConservationPointType.AMBIENT
                  }
                  onChange={e =>
                    handleTemperatureChange('storage_type', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {STORAGE_TYPE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperatura Minima (°C)
                </label>
                <input
                  type="number"
                  value={formData.temperature_requirements?.min_temp || 0}
                  onChange={e =>
                    handleTemperatureChange(
                      'min_temp',
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperatura Massima (°C)
                </label>
                <input
                  type="number"
                  value={formData.temperature_requirements?.max_temp || 25}
                  onChange={e =>
                    handleTemperatureChange(
                      'max_temp',
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  step="0.1"
                />
              </div>
            </div>
            {errors.temperature && (
              <p className="text-sm text-red-600">{errors.temperature}</p>
            )}
          </div>

          {/* Expiry Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Impostazioni Scadenza
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giorni di Scadenza Predefiniti
              </label>
              <input
                type="number"
                min="1"
                value={formData.default_expiry_days || ''}
                onChange={e =>
                  handleInputChange(
                    'default_expiry_days',
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.default_expiry_days
                    ? 'border-red-300'
                    : 'border-gray-300'
                }`}
                placeholder="Es. 7 (giorni)"
              />
              {errors.default_expiry_days && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.default_expiry_days}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Numero di giorni dopo l'acquisto prima della scadenza
              </p>
            </div>
          </div>

          {/* Common Allergens */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Allergeni Comuni
            </h3>
            <p className="text-sm text-gray-600">
              Seleziona gli allergeni che sono comunemente presenti in questa
              categoria
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ALLERGEN_OPTIONS.map(allergen => (
                <label
                  key={allergen}
                  className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.allergen_info.includes(allergen)}
                    onChange={() => handleAllergenToggle(allergen)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {allergen.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {category ? 'Aggiorna' : 'Crea'} Categoria
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
