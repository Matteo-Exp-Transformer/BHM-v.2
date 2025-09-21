import React, { useState } from 'react'
import {
  AlertTriangle,
  RotateCcw,
  Trash2,
  Package,
  Calendar,
  TrendingUp,
  DollarSign,
} from 'lucide-react'
import { ExpiredProduct } from '@/types/inventory'
import { CollapsibleCard } from '@/components/ui/CollapsibleCard'
import { toast } from 'react-toastify'

interface ExpiredProductsManagerProps {
  expiredProducts: ExpiredProduct[]
  onReinsertProduct: (productId: string) => void
  onDeleteProduct: (productId: string) => void
  isLoading?: boolean
  reinsertExpiredProduct?: (params: {
    expiredProductId: string
    newExpiryDate: Date
    newQuantity?: number
    notes?: string
  }) => void
}

interface ReinsertModalProps {
  product: ExpiredProduct
  isOpen: boolean
  onClose: () => void
  onConfirm: (newExpiryDate: Date) => void
}

const ReinsertModal: React.FC<ReinsertModalProps> = ({
  product,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [newExpiryDate, setNewExpiryDate] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newExpiryDate) return

    setIsSubmitting(true)
    try {
      const date = new Date(newExpiryDate)
      onConfirm(date)
      onClose()
      setNewExpiryDate('')
    } catch {
      toast.error('Errore nella data di scadenza')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-orange-100 rounded-lg">
            <RotateCcw className="h-5 w-5 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Reinserisci Prodotto
          </h3>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            <strong>Prodotto:</strong> {product.name}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Categoria:</strong> {product.category_name}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Scadenza originale:</strong>{' '}
            {new Date(product.expiry_date).toLocaleDateString('it-IT')}
          </p>
          {product.reinsertion_count > 0 && (
            <p className="text-sm text-orange-600 mb-2">
              <strong>Reinserimenti precedenti:</strong>{' '}
              {product.reinsertion_count}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="newExpiryDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nuova Data di Scadenza
            </label>
            <input
              type="date"
              id="newExpiryDate"
              value={newExpiryDate}
              onChange={e => setNewExpiryDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !newExpiryDate}
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Reinserendo...' : 'Reinserisci'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const ExpiredProductCard: React.FC<{
  product: ExpiredProduct
  onReinsert: (productId: string) => void
  onDelete: (productId: string) => void
  reinsertExpiredProduct?: (params: {
    expiredProductId: string
    newExpiryDate: Date
    newQuantity?: number
    notes?: string
  }) => void
}> = ({ product, onReinsert, onDelete, reinsertExpiredProduct }) => {
  const [showReinsertModal, setShowReinsertModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleReinsert = (newExpiryDate: Date) => {
    if (reinsertExpiredProduct) {
      reinsertExpiredProduct({
        expiredProductId: product.id,
        newExpiryDate,
        newQuantity: product.quantity,
        notes: `Reinserito da prodotto scaduto - ${product.name}`,
      })
    } else {
      onReinsert(product.id)
    }
  }

  const getDaysExpired = () => {
    const today = new Date()
    const expiryDate = new Date(product.expiry_date)
    const diffTime = today.getTime() - expiryDate.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getWasteCost = () => {
    // Simple calculation - in real app this would use actual cost data
    return product.quantity * 2.5 // €2.50 per unit average
  }

  return (
    <>
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{product.name}</h4>
              <p className="text-sm text-gray-600">{product.category_name}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Scaduto da {getDaysExpired()} giorni
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              Quantità: {product.quantity} {product.unit}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              Scaduto:{' '}
              {new Date(product.expiry_date).toLocaleDateString('it-IT')}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              Costo spreco: €{getWasteCost().toFixed(2)}
            </span>
          </div>
          {product.reinsertion_count > 0 && (
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-orange-400" />
              <span className="text-sm text-orange-600">
                Reinserito {product.reinsertion_count} volte
              </span>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setShowReinsertModal(true)}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-orange-700 bg-orange-100 rounded-md hover:bg-orange-200 transition-colors"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reinserisci
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Elimina
          </button>
        </div>

        {showDeleteConfirm && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800 mb-3">
              Sei sicuro di voler eliminare definitivamente questo prodotto?
              Questa azione non può essere annullata.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
              >
                Annulla
              </button>
              <button
                onClick={() => {
                  onDelete(product.id)
                  setShowDeleteConfirm(false)
                }}
                className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700"
              >
                Elimina Definitivamente
              </button>
            </div>
          </div>
        )}
      </div>

      <ReinsertModal
        product={product}
        isOpen={showReinsertModal}
        onClose={() => setShowReinsertModal(false)}
        onConfirm={handleReinsert}
      />
    </>
  )
}

export const ExpiredProductsManager: React.FC<ExpiredProductsManagerProps> = ({
  expiredProducts,
  onReinsertProduct,
  onDeleteProduct,
  isLoading = false,
  reinsertExpiredProduct,
}) => {
  const totalWasteCost = expiredProducts.reduce((total, product) => {
    return total + product.quantity * 2.5 // €2.50 per unit average
  }, 0)

  const getTotalExpiredDays = () => {
    const today = new Date()
    return expiredProducts.reduce((total, product) => {
      const expiryDate = new Date(product.expiry_date)
      const diffTime = today.getTime() - expiryDate.getTime()
      const daysExpired = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return total + daysExpired
    }, 0)
  }

  if (isLoading) {
    return (
      <CollapsibleCard
        title="Prodotti Scaduti"
        icon={AlertTriangle}
        counter={0}
        defaultExpanded={true}
      >
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      </CollapsibleCard>
    )
  }

  return (
    <CollapsibleCard
      title="Prodotti Scaduti"
      icon={AlertTriangle}
      counter={expiredProducts.length}
      defaultExpanded={true}
    >
      {expiredProducts.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <Package className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nessun prodotto scaduto
          </h3>
          <p className="text-gray-600">
            Ottimo lavoro! Non ci sono prodotti scaduti da gestire.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {expiredProducts.length}
              </div>
              <div className="text-sm text-gray-600">Prodotti Scaduti</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {getTotalExpiredDays()}
              </div>
              <div className="text-sm text-gray-600">
                Giorni Totali di Scadenza
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                €{totalWasteCost.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Costo Stimato Spreco</div>
            </div>
          </div>

          {/* Expired Products List */}
          <div className="space-y-3">
            {expiredProducts.map(product => (
              <ExpiredProductCard
                key={product.id}
                product={product}
                onReinsert={onReinsertProduct}
                onDelete={onDeleteProduct}
                reinsertExpiredProduct={reinsertExpiredProduct}
              />
            ))}
          </div>

          {/* Waste Prevention Tips */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              💡 Suggerimenti per ridurre gli sprechi:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Controlla regolarmente le date di scadenza</li>
              <li>• Usa il sistema FIFO (First In, First Out)</li>
              <li>• Pianifica i menu in base alle scadenze imminenti</li>
              <li>
                • Considera porzioni più piccole per prodotti a breve scadenza
              </li>
            </ul>
          </div>
        </div>
      )}
    </CollapsibleCard>
  )
}

export default ExpiredProductsManager
