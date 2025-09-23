import React from 'react'
import { ShoppingCart, Clock, CheckCircle, Edit, Trash2 } from 'lucide-react'
import { ShoppingList } from '../hooks/useShoppingLists'

interface ShoppingListCardProps {
  list: ShoppingList
  onEdit: (list: ShoppingList) => void
  onDelete: (id: string) => void
}

export const ShoppingListCard: React.FC<ShoppingListCardProps> = ({
  list,
  onEdit,
  onDelete,
}) => {
  const completedItems = list.items?.filter(item => item.is_completed).length || 0
  const totalItems = list.items?.length || 0
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">{list.name}</h3>
          {list.is_template && (
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              Template
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(list)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(list.id)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{completedItems} di {totalItems} prodotti</span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {list.created_at ? new Date(list.created_at).toLocaleDateString() : 'N/A'}
          </span>
        </div>

        {totalItems > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {list.items && list.items.length > 0 && (
          <div className="space-y-1">
            {list.items.slice(0, 3).map((item, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 text-sm ${
                  item.is_completed ? 'text-gray-500 line-through' : 'text-gray-700'
                }`}
              >
                <CheckCircle
                  className={`w-4 h-4 ${
                    item.is_completed ? 'text-green-500' : 'text-gray-300'
                  }`}
                />
                <span>{item.product_name} x{item.quantity}</span>
              </div>
            ))}
            {list.items.length > 3 && (
              <div className="text-xs text-gray-500">
                +{list.items.length - 3} altri prodotti
              </div>
            )}
          </div>
        )}

        {totalItems === 0 && (
          <div className="text-sm text-gray-500 italic">
            Nessun prodotto nella lista
          </div>
        )}
      </div>
    </div>
  )
}
