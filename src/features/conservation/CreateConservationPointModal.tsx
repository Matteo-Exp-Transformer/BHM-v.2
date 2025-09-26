import React, { useState } from 'react'
import { X, Thermometer, Plus } from 'lucide-react'
import type {
  CreateConservationPointRequest,
  ConservationPointType,
} from '@/types/conservation'

interface CreateConservationPointModalProps {
  onClose: () => void
  onCreate: (data: CreateConservationPointRequest) => void
  isCreating: boolean
}

const conservationTypes = [
  { value: 'fridge', label: 'Frigorifero', icon: '🧊', defaultTemp: 4 },
  { value: 'freezer', label: 'Congelatore', icon: '❄️', defaultTemp: -18 },
  { value: 'blast', label: 'Abbattitore', icon: '💨', defaultTemp: -40 },
  { value: 'ambient', label: 'Ambiente', icon: '🌡️', defaultTemp: 20 },
] as const

const commonCategories = [
  'Latticini',
  'Carne Fresca',
  'Pesce Fresco',
  'Verdure',
  'Frutta',
  'Surgelati',
  'Prodotti Cotti',
  'Salumi',
  'Formaggi',
  'Bevande',
]

export function CreateConservationPointModal({
  onClose,
  onCreate,
  isCreating,
}: CreateConservationPointModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    setpoint_temp: 4,
    type: 'fridge' as ConservationPointType,
    is_blast_chiller: false,
    product_categories: [] as string[],
    department_id: '',
  })

  const [newCategory, setNewCategory] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate({
      name: formData.name,
      setpoint_temp: formData.setpoint_temp,
      type: formData.type,
      is_blast_chiller: formData.is_blast_chiller,
      product_categories: formData.product_categories,
      department_id: formData.department_id || undefined,
    })
  }

  const handleTypeChange = (type: typeof formData.type) => {
    const selectedType = conservationTypes.find(t => t.value === type)
    setFormData(prev => ({
      ...prev,
      type,
      setpoint_temp: selectedType?.defaultTemp || prev.setpoint_temp,
    }))
  }

  const addCategory = (category: string) => {
    if (category && !formData.product_categories.includes(category)) {
      setFormData(prev => ({
        ...prev,
        product_categories: [...prev.product_categories, category],
      }))
    }
  }

  const removeCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      product_categories: prev.product_categories.filter(c => c !== category),
    }))
  }

  const addNewCategory = () => {
    if (newCategory.trim()) {
      addCategory(newCategory.trim())
      setNewCategory('')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Thermometer className="w-6 h-6 text-blue-600" />
              Nuovo Punto di Conservazione
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Punto di Conservazione *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="es. Frigorifero Cucina Principale"
                />
              </div>
            </div>

            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipo di Conservazione *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {conservationTypes.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleTypeChange(type.value)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      formData.type === type.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{type.icon}</span>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-gray-500">
                          {type.defaultTemp}°C
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Temperature Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperatura di Setpoint (°C) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.setpoint_temp}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      setpoint_temp: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is-blast-chiller"
                  checked={formData.is_blast_chiller}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      is_blast_chiller: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="is-blast-chiller"
                  className="ml-2 text-sm text-gray-700"
                >
                  È un abbattitore di temperatura
                </label>
              </div>
            </div>

            {/* Product Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Categorie Prodotti
              </label>

              {/* Common categories */}
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">
                  Categorie Comuni:
                </div>
                <div className="flex flex-wrap gap-2">
                  {commonCategories.map(category => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => addCategory(category)}
                      disabled={formData.product_categories.includes(category)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        formData.product_categories.includes(category)
                          ? 'bg-blue-100 text-blue-800 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom category input */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  placeholder="Aggiungi categoria personalizzata"
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyPress={e =>
                    e.key === 'Enter' && (e.preventDefault(), addNewCategory())
                  }
                />
                <button
                  type="button"
                  onClick={addNewCategory}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Selected categories */}
              {formData.product_categories.length > 0 && (
                <div>
                  <div className="text-sm text-gray-600 mb-2">
                    Categorie Selezionate:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.product_categories.map(category => (
                      <span
                        key={category}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {category}
                        <button
                          type="button"
                          onClick={() => removeCategory(category)}
                          className="hover:bg-blue-200 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Department Assignment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dipartimento (Opzionale)
              </label>
              <select
                value={formData.department_id}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    department_id: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleziona dipartimento...</option>
                <option value="kitchen">Cucina</option>
                <option value="storage">Magazzino</option>
                <option value="bar">Bar</option>
                <option value="pastry">Pasticceria</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Il dipartimento aiuta a organizzare i punti di conservazione
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isCreating || !formData.name.trim()}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isCreating && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {isCreating ? 'Creazione...' : 'Crea Punto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
