import { useState, useMemo } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { useCreateShoppingList } from '../hooks/useShoppingList'
import { useDepartments } from '../../management/hooks/useDepartments'
import type { Product } from '../../../types/inventory'
import type { CreateShoppingListInput } from '../../../types/shopping'
import { X, Eye } from 'lucide-react'

interface ProductWithQuantity extends Product {
  customQuantity?: number
  customUnit?: string
}

interface CreateShoppingListModalProps {
  isOpen: boolean
  onClose: () => void
  selectedProducts: Product[]
  onSuccess: () => void
}

const UNIT_OPTIONS = [
  { value: 'pz', label: 'Pezzi (pz)' },
  { value: 'kg', label: 'Kilogrammi (kg)' },
  { value: 'g', label: 'Grammi (g)' },
  { value: 'l', label: 'Litri (l)' },
  { value: 'ml', label: 'Millilitri (ml)' },
  { value: 'conf', label: 'Confezioni' },
  { value: 'scatola', label: 'Scatole' },
]

export function CreateShoppingListModalV2({
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
  const [showPreview, setShowPreview] = useState(false)
  const [productsWithQuantity, setProductsWithQuantity] = useState<ProductWithQuantity[]>(
    () => selectedProducts.map(p => ({
      ...p,
      customQuantity: p.quantity || 1,
      customUnit: p.unit || 'pz'
    }))
  )

  const { departments = [] } = useDepartments()
  const createMutation = useCreateShoppingList()

  const updateProductQuantity = (productId: string, quantity: number) => {
    setProductsWithQuantity(prev =>
      prev.map(p => p.id === productId ? { ...p, customQuantity: quantity } : p)
    )
  }

  const updateProductUnit = (productId: string, unit: string) => {
    setProductsWithQuantity(prev =>
      prev.map(p => p.id === productId ? { ...p, customUnit: unit } : p)
    )
  }

  const removeProduct = (productId: string) => {
    setProductsWithQuantity(prev => prev.filter(p => p.id !== productId))
  }

  const groupedByDepartment = useMemo(() => {
    const grouped: Record<string, ProductWithQuantity[]> = {}

    productsWithQuantity.forEach((product) => {
      const deptId = product.department_id || 'no_department'
      if (!grouped[deptId]) {
        grouped[deptId] = []
      }
      grouped[deptId].push(product)
    })

    return Object.entries(grouped).map(([deptId, products]) => ({
      departmentId: deptId,
      departmentName: departments.find((d: { id: string; name: string }) => d.id === deptId)?.name || 'Senza Reparto',
      products: products.sort((a, b) => a.name.localeCompare(b.name))
    })).sort((a, b) => a.departmentName.localeCompare(b.departmentName))
  }, [productsWithQuantity, departments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      alert('Inserisci un nome per la lista')
      return
    }

    if (productsWithQuantity.length === 0) {
      alert('Nessun prodotto selezionato')
      return
    }

    const input: CreateShoppingListInput = {
      name: name.trim(),
      notes: notes.trim() || undefined,
      items: productsWithQuantity.map((product) => ({
        product_id: product.id,
        product_name: product.name,
        category_name: product.category_name || 'Altro',
        quantity: product.customQuantity || 1,
        unit: product.customUnit || 'pz',
      })),
    }

    try {
      await createMutation.mutateAsync(input)
      onSuccess()
      setName(`Lista Spesa - ${new Date().toLocaleDateString('it-IT')}`)
      setNotes('')
      setProductsWithQuantity([])
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Crea Lista della Spesa"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Lista *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Es: Lista Spesa - 10/01/2025"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note (opzionale)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Aggiungi note..."
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">
            Prodotti Selezionati ({productsWithQuantity.length})
          </h3>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Nascondi' : 'Anteprima'} Lista
          </button>
        </div>

        {showPreview ? (
          <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
            <h4 className="font-medium text-gray-900 mb-3">Anteprima Lista Completa</h4>
            {groupedByDepartment.map((group) => (
              <div key={group.departmentId} className="mb-4 last:mb-0">
                <h5 className="text-sm font-semibold text-gray-700 mb-2 pb-1 border-b">
                  {group.departmentName} ({group.products.length})
                </h5>
                <div className="space-y-1">
                  {group.products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between py-1 text-sm">
                      <span className="text-gray-900">{product.name}</span>
                      <span className="text-gray-600 font-medium">
                        {product.customQuantity} {product.customUnit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto space-y-4 border rounded-lg p-3">
            {groupedByDepartment.map((group) => (
              <div key={group.departmentId} className="bg-white rounded-lg border border-gray-200 p-3">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  {group.departmentName} ({group.products.length})
                </h4>
                <div className="space-y-2">
                  {group.products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-2 pb-2 border-b last:border-0 last:pb-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={product.customQuantity}
                          onChange={(e) => updateProductQuantity(product.id, parseFloat(e.target.value) || 1)}
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <select
                          value={product.customUnit}
                          onChange={(e) => updateProductUnit(product.id, e.target.value)}
                          className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {UNIT_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.value}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => removeProduct(product.id)}
                          className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          title="Rimuovi prodotto"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-xs text-gray-500">
            Totale: {productsWithQuantity.length} prodott{productsWithQuantity.length === 1 ? 'o' : 'i'}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={createMutation.isPending}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || productsWithQuantity.length === 0}
              className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? 'Creazione...' : 'Crea Lista'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
