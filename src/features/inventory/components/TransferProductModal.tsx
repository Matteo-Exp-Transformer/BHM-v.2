import { useState, useMemo } from 'react'
import { Modal } from '@/components/ui/Modal'
import { useProducts } from '../hooks/useProducts'
import { useConservationPoints } from '@/features/conservation/hooks/useConservationPoints'
import { useAuth } from '@/hooks/useAuth'
import type { Product } from '@/types/inventory'
import { ArrowRight, Package, MapPin } from 'lucide-react'

interface TransferProductModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
}

export function TransferProductModal({
  isOpen,
  onClose,
  product,
}: TransferProductModalProps) {
  const { user } = useAuth()
  const { transferProduct, isTransferring } = useProducts()
  const { conservationPoints = [] } = useConservationPoints()

  const [toConservationPointId, setToConservationPointId] = useState('')
  const [transferReason, setTransferReason] = useState('')
  const [transferNotes, setTransferNotes] = useState('')

  // Filter out current conservation point
  const availablePoints = useMemo(() => {
    return conservationPoints.filter(
      point => point.id !== product?.conservation_point_id
    )
  }, [conservationPoints, product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!product || !toConservationPointId || !transferReason.trim()) {
      alert('Compila tutti i campi obbligatori')
      return
    }

    if (!product.conservation_point_id) {
      alert('Il prodotto non ha un punto di conservazione di origine')
      return
    }

    if (!user?.id) {
      alert('Utente non autenticato')
      return
    }

    try {
      await transferProduct({
        productId: product.id,
        fromConservationPointId: product.conservation_point_id,
        toConservationPointId,
        transferReason: transferReason.trim(),
        transferNotes: transferNotes.trim() || undefined,
        authorizedById: user.id,
      })
      onClose()
      // Reset form
      setToConservationPointId('')
      setTransferReason('')
      setTransferNotes('')
    } catch (error) {
      console.error('Transfer failed:', error)
    }
  }

  const handleClose = () => {
    if (!isTransferring) {
      onClose()
    }
  }

  if (!product) return null

  const fromPoint = conservationPoints.find(
    p => p.id === product.conservation_point_id
  )
  const toPoint = conservationPoints.find(p => p.id === toConservationPointId)

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Trasferisci Prodotto`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Info */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">
                {product.name}
              </h4>
              <div className="space-y-1 text-sm text-blue-800">
                {product.category_name && (
                  <p>
                    <span className="font-medium">Categoria:</span>{' '}
                    {product.category_name}
                  </p>
                )}
                {product.quantity !== undefined && (
                  <p>
                    <span className="font-medium">Quantità:</span>{' '}
                    {product.quantity} {product.unit || 'pz'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Current Location */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-gray-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-gray-700 mb-2">
                Posizione Attuale
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium text-gray-700">Punto:</span>{' '}
                  <span className="text-gray-900">
                    {fromPoint?.name || 'N/A'}
                  </span>
                </p>
                {product.department_name && (
                  <p>
                    <span className="font-medium text-gray-700">Reparto:</span>{' '}
                    <span className="text-gray-900">
                      {product.department_name}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <ArrowRight className="h-6 w-6 text-gray-400" />
        </div>

        {/* Destination */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Punto di Conservazione Destinazione *
          </label>
          <select
            value={toConservationPointId}
            onChange={e => setToConservationPointId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isTransferring}
          >
            <option value="">Seleziona destinazione...</option>
            {availablePoints.map(point => (
              <option key={point.id} value={point.id}>
                {point.name}
                {point.department?.name ? ` - ${point.department.name}` : ''}
              </option>
            ))}
          </select>
          {availablePoints.length === 0 && (
            <p className="text-sm text-amber-600 mt-2">
              ⚠️ Nessun altro punto di conservazione disponibile
            </p>
          )}
        </div>

        {/* Destination Preview */}
        {toPoint && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-sm text-green-900 mb-2">
              📍 Destinazione Selezionata
            </h4>
            <div className="space-y-1 text-sm text-green-800">
              <p>
                <span className="font-medium">Punto:</span> {toPoint.name}
              </p>
              {toPoint.department?.name && (
                <p>
                  <span className="font-medium">Reparto:</span>{' '}
                  {toPoint.department.name}
                </p>
              )}
              <p>
                <span className="font-medium">Tipo:</span>{' '}
                {toPoint.type === 'fridge'
                  ? 'Frigorifero'
                  : toPoint.type === 'freezer'
                  ? 'Congelatore'
                  : toPoint.type === 'blast'
                  ? 'Abbattitore'
                  : 'Ambiente'}
              </p>
            </div>
          </div>
        )}

        {/* Transfer Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Motivo Trasferimento *
          </label>
          <input
            type="text"
            value={transferReason}
            onChange={e => setTransferReason(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Es: Richiesta chef per servizio cena"
            required
            disabled={isTransferring}
          />
        </div>

        {/* Transfer Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Note Aggiuntive (opzionale)
          </label>
          <textarea
            value={transferNotes}
            onChange={e => setTransferNotes(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
            placeholder="Aggiungi dettagli sul trasferimento..."
            disabled={isTransferring}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={handleClose}
            disabled={isTransferring}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50"
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={isTransferring || !toConservationPointId || !transferReason.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isTransferring ? (
              <>
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Trasferimento...
              </>
            ) : (
              <>
                <ArrowRight className="h-4 w-4" />
                Conferma Trasferimento
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}

