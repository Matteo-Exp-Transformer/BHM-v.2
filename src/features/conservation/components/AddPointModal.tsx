import React, { useState, useEffect } from 'react'
import {
  ConservationPoint,
  ConservationPointType,
  classifyConservationPoint,
  TEMPERATURE_RANGES,
} from '@/types/conservation'
import { X, Thermometer, Info } from 'lucide-react'
import { useDepartments } from '@/features/management/hooks/useDepartments'

interface AddPointModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (
    data: Omit<
      ConservationPoint,
      | 'id'
      | 'company_id'
      | 'created_at'
      | 'updated_at'
      | 'status'
      | 'last_temperature_reading'
    >
  ) => void
  point?: ConservationPoint | null
  isLoading?: boolean
}

const PRODUCT_CATEGORIES = [
  'Carni fresche',
  'Carni trasformate',
  'Pesce fresco',
  'Pesce trasformato',
  'Latticini',
  'Uova',
  'Verdure fresche',
  'Verdure trasformate',
  'Frutta fresca',
  'Frutta trasformata',
  'Prodotti da forno',
  'Bevande',
  'Condimenti',
  'Conserve',
  'Surgelati',
  'Gelati',
  'Prodotti secchi',
  'Altri',
]

export function AddPointModal({
  isOpen,
  onClose,
  onSave,
  point,
  isLoading,
}: AddPointModalProps) {
  const { departments } = useDepartments()
  const [formData, setFormData] = useState({
    name: '',
    department_id: '',
    setpoint_temp: 4,
    is_blast_chiller: false,
    product_categories: [] as string[],
    maintenance_due: '',
  })

  const [predictedType, setPredictedType] =
    useState<ConservationPointType>('fridge')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

  useEffect(() => {
    if (point) {
      setFormData({
        name: point.name,
        department_id: point.department_id || '',
        setpoint_temp: point.setpoint_temp,
        is_blast_chiller: point.is_blast_chiller,
        product_categories: point.product_categories || [],
        maintenance_due: point.maintenance_due
          ? new Date(point.maintenance_due).toISOString().split('T')[0]
          : '',
      })
    } else {
      setFormData({
        name: '',
        department_id: '',
        setpoint_temp: 4,
        is_blast_chiller: false,
        product_categories: [],
        maintenance_due: '',
      })
    }
  }, [point, isOpen])

  useEffect(() => {
    const type = classifyConservationPoint(
      formData.setpoint_temp,
      formData.is_blast_chiller
    )
    setPredictedType(type)
  }, [formData.setpoint_temp, formData.is_blast_chiller])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    onSave({
      name: formData.name,
      department_id: formData.department_id,
      setpoint_temp: formData.setpoint_temp,
      type: predictedType,
      is_blast_chiller: formData.is_blast_chiller,
      product_categories: formData.product_categories,
      maintenance_due: formData.maintenance_due
        ? new Date(formData.maintenance_due)
        : undefined,
    })
  }

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      product_categories: prev.product_categories.includes(category)
        ? prev.product_categories.filter(c => c !== category)
        : [...prev.product_categories, category],
    }))
  }

  const getTypeInfo = () => {
    const range = TEMPERATURE_RANGES[predictedType]
    const typeNames = {
      ambient: 'Ambiente',
      fridge: 'Frigorifero',
      freezer: 'Freezer',
      blast: 'Abbattitore',
    }

    return {
      name: typeNames[predictedType],
      range: `${range.min}°C - ${range.max}°C`,
      optimal: `${range.optimal}°C`,
      icon:
        predictedType === 'ambient'
          ? '🌡️'
          : predictedType === 'fridge'
            ? '❄️'
            : predictedType === 'freezer'
              ? '🧊'
              : '⚡',
    }
  }

  if (!isOpen) return null

  const typeInfo = getTypeInfo()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {point
              ? 'Modifica Punto di Conservazione'
              : 'Nuovo Punto di Conservazione'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome punto di conservazione *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e =>
                  setFormData(prev => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="es. Frigorifero Cucina 1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reparto *
              </label>
              <select
                required
                value={formData.department_id}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    department_id: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleziona reparto</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Temperature Configuration */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperatura target (°C) *
              </label>
              <div className="flex items-center space-x-2">
                <Thermometer className="w-5 h-5 text-blue-600" />
                <input
                  type="number"
                  required
                  step="0.1"
                  min="-99"
                  max="30"
                  value={formData.setpoint_temp}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      setpoint_temp: parseFloat(e.target.value),
                    }))
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_blast_chiller"
                checked={formData.is_blast_chiller}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    is_blast_chiller: e.target.checked,
                  }))
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="is_blast_chiller"
                className="text-sm font-medium text-gray-700"
              >
                Abbattitore di temperatura
              </label>
            </div>

            {/* Auto-classification Preview */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Info className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">
                  Classificazione automatica
                </span>
              </div>
              <div className="text-sm text-blue-800">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{typeInfo.icon}</span>
                  <span>
                    <strong>{typeInfo.name}</strong> - Range: {typeInfo.range} -
                    Ottimale: {typeInfo.optimal}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categorie prodotti conservati
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {formData.product_categories.length === 0
                  ? 'Seleziona categorie prodotti...'
                  : `${formData.product_categories.length} categorie selezionate`}
              </button>

              {showCategoryDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {PRODUCT_CATEGORIES.map(category => (
                    <label
                      key={category}
                      className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.product_categories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{category}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {formData.product_categories.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {formData.product_categories.map(category => (
                  <span
                    key={category}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Maintenance Due */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prossima manutenzione programmata
            </label>
            <input
              type="date"
              value={formData.maintenance_due}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  maintenance_due: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Salvando...' : point ? 'Aggiorna' : 'Crea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
