import { useState, useMemo } from 'react'
import type { Product } from '../../../types/inventory'
import { ProductFilters } from './ProductFilters'

interface ProductSelectGridProps {
  products: Product[]
  selectedProductIds: Set<string>
  onToggleProduct: (productId: string) => void
  isLoading?: boolean
}

export function ProductSelectGrid({
  products,
  selectedProductIds,
  onToggleProduct,
  isLoading,
}: ProductSelectGridProps) {
  const [filters, setFilters] = useState({
    category: '',
    department: '',
    expiry: 'all' as 'all' | 'expired' | 'expiring_soon',
  })

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (filters.category && product.category_id !== filters.category) {
        return false
      }

      if (filters.department && product.department_id !== filters.department) {
        return false
      }

      if (filters.expiry !== 'all' && product.expiry_date) {
        const expiryDate = new Date(product.expiry_date)
        const today = new Date()
        const daysUntilExpiry = Math.ceil(
          (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (filters.expiry === 'expired' && daysUntilExpiry >= 0) {
          return false
        }

        if (
          filters.expiry === 'expiring_soon' &&
          (daysUntilExpiry < 0 || daysUntilExpiry > 7)
        ) {
          return false
        }
      }

      return true
    })
  }, [products, filters])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Caricamento prodotti...</div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          Nessun prodotto nel catalogo. Aggiungi prodotti per creare liste della spesa.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ProductFilters
        products={products}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {filteredProducts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            Nessun prodotto trovato con i filtri selezionati
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isSelected={selectedProductIds.has(product.id)}
              onToggle={() => onToggleProduct(product.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface ProductCardProps {
  product: Product
  isSelected: boolean
  onToggle: () => void
}

function ProductCard({ product, isSelected, onToggle }: ProductCardProps) {
  const expiryInfo = useMemo(() => {
    if (!product.expiry_date) return null

    const expiryDate = new Date(product.expiry_date)
    const today = new Date()
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysUntilExpiry < 0) {
      return {
        text: 'Scaduto',
        className: 'bg-red-100 text-red-700',
      }
    }

    if (daysUntilExpiry <= 3) {
      return {
        text: `${daysUntilExpiry} giorni`,
        className: 'bg-red-100 text-red-700',
      }
    }

    if (daysUntilExpiry <= 7) {
      return {
        text: `${daysUntilExpiry} giorni`,
        className: 'bg-yellow-100 text-yellow-700',
      }
    }

    return {
      text: expiryDate.toLocaleDateString('it-IT'),
      className: 'bg-gray-100 text-gray-700',
    }
  }, [product.expiry_date])

  return (
    <div
      className={`
        relative border rounded-lg p-4 cursor-pointer transition-all
        ${
          isSelected
            ? 'border-blue-500 bg-blue-50 shadow-md'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        }
      `}
      onClick={onToggle}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggle}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>

          <div className="mt-2 space-y-1.5">
            {product.category_id && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className="inline-block w-2 h-2 bg-purple-500 rounded-full" />
                <span className="truncate">Categoria</span>
              </div>
            )}

            {product.department_id && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full" />
                <span className="truncate">Reparto</span>
              </div>
            )}

            {expiryInfo && (
              <div
                className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded ${expiryInfo.className}`}
              >
                <span>Scad: {expiryInfo.text}</span>
              </div>
            )}

            {product.quantity !== undefined && product.quantity !== null && (
              <div className="text-xs text-gray-600">
                Qtà: {product.quantity} {product.unit || 'pz'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
