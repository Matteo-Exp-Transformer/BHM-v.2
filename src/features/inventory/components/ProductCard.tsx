import { useState } from 'react'
import {
  Package,
  Calendar,
  MapPin,
  Tag,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  MoreVertical,
} from 'lucide-react'
import { Product } from '@/types/inventory'

interface ProductCardProps {
  product: Product
  onEdit: () => void
  onDelete: () => void
  onStatusChange: (status: Product['status']) => void
}

export function ProductCard({
  product,
  onEdit,
  onDelete,
  onStatusChange,
}: ProductCardProps) {
  const [showActions, setShowActions] = useState(false)

  const getStatusColor = (status: Product['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      case 'waste':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: Product['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />
      case 'expired':
        return <AlertTriangle className="w-4 h-4" />
      case 'waste':
        return <XCircle className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  const getExpiryStatus = () => {
    if (!product.expiry_date) return null

    const expiryDate = new Date(product.expiry_date)
    const today = new Date()
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysUntilExpiry < 0) {
      return {
        text: 'Scaduto',
        color: 'text-red-600',
        icon: <AlertTriangle className="w-4 h-4" />,
      }
    } else if (daysUntilExpiry <= 2) {
      return {
        text: `Scade tra ${daysUntilExpiry} giorni`,
        color: 'text-orange-600',
        icon: <Clock className="w-4 h-4" />,
      }
    } else if (daysUntilExpiry <= 7) {
      return {
        text: `Scade tra ${daysUntilExpiry} giorni`,
        color: 'text-yellow-600',
        icon: <Clock className="w-4 h-4" />,
      }
    }

    return null
  }

  const expiryStatus = getExpiryStatus()

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
          {product.sku && (
            <p className="text-sm text-gray-500">SKU: {product.sku}</p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}
          >
            {getStatusIcon(product.status)}
            {product.status}
          </span>
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Actions Dropdown */}
      {showActions && (
        <div className="absolute right-2 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="py-1">
            <button
              onClick={() => {
                setShowActions(false)
                onEdit()
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Edit className="w-4 h-4" />
              Modifica
            </button>
            <button
              onClick={() => {
                setShowActions(false)
                onDelete()
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              Elimina
            </button>
          </div>
        </div>
      )}

      {/* Product Details */}
      <div className="space-y-2 mb-3">
        {product.category_id && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Tag className="w-4 h-4" />
            <span>Categoria: {product.category_id}</span>
          </div>
        )}

        {product.department_id && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>Reparto: {product.department_id}</span>
          </div>
        )}

        {product.expiry_date && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              Scadenza:{' '}
              {new Date(product.expiry_date).toLocaleDateString('it-IT')}
            </span>
          </div>
        )}

        {product.quantity && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Package className="w-4 h-4" />
            <span>
              Quantità: {product.quantity} {product.unit || 'pz'}
            </span>
          </div>
        )}

        {product.supplier_name && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Fornitore: {product.supplier_name}</span>
          </div>
        )}
      </div>

      {/* Expiry Alert */}
      {expiryStatus && (
        <div
          className={`flex items-center gap-2 p-2 rounded-lg mb-3 ${
            expiryStatus.color.includes('red')
              ? 'bg-red-50'
              : expiryStatus.color.includes('orange')
                ? 'bg-orange-50'
                : 'bg-yellow-50'
          }`}
        >
          {expiryStatus.icon}
          <span className={`text-sm font-medium ${expiryStatus.color}`}>
            {expiryStatus.text}
          </span>
        </div>
      )}

      {/* Allergens */}
      {product.allergens && product.allergens.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {product.allergens.map(allergen => (
              <span
                key={allergen}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
              >
                {allergen}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {product.notes && (
        <div className="mb-3">
          <p className="text-sm text-gray-600 line-clamp-2">{product.notes}</p>
        </div>
      )}

      {/* Status Actions */}
      {product.status === 'active' && (
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={() => onStatusChange('expired')}
            className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
          >
            Marca come Scaduto
          </button>
          <button
            onClick={() => onStatusChange('waste')}
            className="flex-1 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
          >
            Marca come Smaltito
          </button>
        </div>
      )}

      {product.status === 'expired' && (
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={() => onStatusChange('waste')}
            className="flex-1 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
          >
            Marca come Rifiuto
          </button>
        </div>
      )}
    </div>
  )
}
