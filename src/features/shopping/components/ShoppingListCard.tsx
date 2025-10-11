import { useState } from 'react'
import { CollapseCard } from '../../shared/components/CollapseCard'
import { ProductSelectGrid } from './ProductSelectGrid'
import { CreateShoppingListModalV2 } from './CreateShoppingListModalV2'
import { useProducts } from '../../inventory/hooks/useProducts'

export function ShoppingListCard() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set())
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const { products = [], isLoading } = useProducts()

  const handleToggleProduct = (productId: string) => {
    setSelectedProductIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
      } else {
        newSet.add(productId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    setSelectedProductIds(new Set(products.map((p) => p.id)))
  }

  const handleClearSelection = () => {
    setSelectedProductIds(new Set())
  }

  const handleOpenCreateModal = () => {
    if (selectedProductIds.size === 0) {
      alert('Seleziona almeno un prodotto per creare una lista della spesa')
      return
    }
    setIsCreateModalOpen(true)
  }

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false)
    setSelectedProductIds(new Set())
  }

  const selectedProducts = products.filter((p) => selectedProductIds.has(p.id))

  return (
    <>
      <CollapseCard
        title="Lista della Spesa"
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        badge={
          selectedProductIds.size > 0
            ? `${selectedProductIds.size} selezionati`
            : undefined
        }
        headerAction={
          selectedProductIds.size > 0 ? (
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              Genera Lista
            </button>
          ) : undefined
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              Seleziona i prodotti da aggiungere alla lista della spesa
            </p>
            <div className="flex gap-2">
              {selectedProductIds.size > 0 && (
                <button
                  onClick={handleClearSelection}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Deseleziona tutti
                </button>
              )}
              {products.length > 0 && (
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Seleziona tutti
                </button>
              )}
            </div>
          </div>

          <ProductSelectGrid
            products={products}
            selectedProductIds={selectedProductIds}
            onToggleProduct={handleToggleProduct}
            isLoading={isLoading}
          />
        </div>
      </CollapseCard>

      <CreateShoppingListModalV2
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        selectedProducts={selectedProducts}
        onSuccess={handleCreateSuccess}
      />
    </>
  )
}
