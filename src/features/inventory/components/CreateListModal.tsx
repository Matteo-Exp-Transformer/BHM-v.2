import React, { useState } from 'react'
import { X, Plus, ShoppingCart } from 'lucide-react'
import { ShoppingList } from '../hooks/useShoppingLists'

interface CreateListModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (
    list: Omit<ShoppingList, 'id' | 'created_at' | 'updated_at'>
  ) => void
  templates?: ShoppingList[]
}

export const CreateListModal: React.FC<CreateListModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  templates = [],
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_template: false,
    items: [] as Array<{
      product_name: string
      quantity: number
      completed: boolean
    }>,
  })

  const [newItem, setNewItem] = useState({
    product_name: '',
    quantity: 1,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    onCreate({
      company_id: 'temp-company',
      name: formData.name,
      description: formData.description,
      created_by: 'temp-user',
      is_template: formData.is_template,
      is_completed: false,
      completed_items: 0,
      item_count: formData.items.length,
      items: formData.items.map(item => ({
        id: `temp-${Date.now()}-${Math.random()}`,
        shopping_list_id: '',
        product_id: '',
        product_name: item.product_name,
        category_name: '',
        quantity: item.quantity,
        unit: '',
        notes: '',
        is_completed: item.completed,
        added_at: new Date().toISOString(),
        completed_at: item.completed ? new Date().toISOString() : undefined,
      })),
    })

    // Reset form
    setFormData({
      name: '',
      description: '',
      is_template: false,
      items: [],
    })
    onClose()
  }

  const addItem = () => {
    if (!newItem.product_name.trim()) return

    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product_name: newItem.product_name,
          quantity: newItem.quantity,
          completed: false,
        },
      ],
    }))

    setNewItem({ product_name: '', quantity: 1 })
  }

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  const useTemplate = (template: ShoppingList) => {
    setFormData(prev => ({
      ...prev,
      name: template.name,
      description: template.description || '',
      items: (template.items || []).map(item => ({
        product_name: item.product_name,
        quantity: item.quantity,
        completed: item.is_completed,
      })),
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            Crea Nuova Lista
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Lista *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e =>
                setFormData(prev => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Es. Spesa Settimanale"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrizione
            </label>
            <textarea
              value={formData.description}
              onChange={e =>
                setFormData(prev => ({ ...prev, description: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Descrizione opzionale della lista"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_template"
              checked={formData.is_template}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  is_template: e.target.checked,
                }))
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="is_template" className="text-sm text-gray-700">
              Salva come template
            </label>
          </div>

          {/* Templates */}
          {templates.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usa Template
              </label>
              <div className="grid grid-cols-1 gap-2">
                {templates.map(template => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => useTemplate(template)}
                    className="p-2 text-left border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">
                      {template.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {template.items?.length || 0} prodotti
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add Items */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prodotti
            </label>
            <div className="space-y-2">
              {formData.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded-md"
                >
                  <span className="flex-1 text-sm">
                    {item.product_name} x{item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newItem.product_name}
                  onChange={e =>
                    setNewItem(prev => ({
                      ...prev,
                      product_name: e.target.value,
                    }))
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome prodotto"
                />
                <input
                  type="number"
                  value={newItem.quantity}
                  onChange={e =>
                    setNewItem(prev => ({
                      ...prev,
                      quantity: parseInt(e.target.value) || 1,
                    }))
                  }
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
                <button
                  type="button"
                  onClick={addItem}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Aggiungi
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Crea Lista
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
