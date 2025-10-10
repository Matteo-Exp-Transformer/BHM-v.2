import { useState } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { useCreateShoppingList } from '../hooks/useShoppingList'
import type { Product } from '../../../types/inventory'
import type { CreateShoppingListInput } from '../../../types/shopping'

interface CreateShoppingListModalProps {
  isOpen: boolean
  onClose: () => void
  selectedProducts: Product[]
  onSuccess: () => void
}

export function CreateShoppingListModal({
  isOpen,
  onClose,
  selectedProducts,
  onSuccess,
}: CreateShoppingListModalProps) {
  const [name, setName] = useState(() => {
    const today = new Date().toLocaleDateString('it-IT')
    return `Lista Spesa - ${today}`
  })
  const [notes, setNotes] = useState('')

  const createMutation = useCreateShoppingList()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      alert('Inserisci un nome per la lista')
      return
    }

    if (selectedProducts.length === 0) {
      alert('Nessun prodotto selezionato')
      return
    }

    const input: CreateShoppingListInput = {
      name: name.trim(),
      notes: notes.trim() || undefined,
      items: selectedProducts.map((product) => ({
        product_id: product.id,
        product_name: product.name,
        category_name: product.category_id || 'Altro',
        quantity: product.quantity || 1,
        unit: product.unit || 'pz',
      })),
    }

    try {
      await createMutation.mutateAsync(input)
      onSuccess()
      setName(`Lista Spesa - ${new Date().toLocaleDateString('it-IT')}`)
      setNotes('')
    } catch (error) {
      console.error('Error creating shopping list:', error)
      alert('Errore durante la creazione della lista della spesa')
    }
  }

  const handleClose = () => {
    if (!createMutation.isPending) {
      onClose()
    }
  }

  const groupedProducts = selectedProducts.reduce((acc, product) => {
    const category = product.category_id || 'Altro'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(product)
    return acc
  }, {} as Record<string, Product[]>)

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Crea Lista della Spesa">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome Lista
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Es: Lista Spesa - 10/01/2025"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Note (opzionale)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
            placeholder="Aggiungi note per questa lista..."
          />
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Prodotti Selezionati ({selectedProducts.length})
          </h3>
          <div className="max-h-64 overflow-y-auto space-y-3">
            {Object.entries(groupedProducts).map(([category, products]) => (
              <div key={category} className="bg-gray-50 rounded-lg p-3">
                <h4 className="text-xs font-semibold text-gray-600 mb-2">
                  {category}
                </h4>
                <div className="space-y-1.5">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-900">{product.name}</span>
                      <span className="text-gray-500 text-xs">
                        {product.quantity || 1} {product.unit || 'pz'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={handleClose}
            disabled={createMutation.isPending}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50"
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createMutation.isPending ? 'Creazione...' : 'Crea Lista'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
