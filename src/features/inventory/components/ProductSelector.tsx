import React, { useState } from 'react'
import { Search, Check, X } from 'lucide-react'
import { Product } from '@/types/inventory'

interface ProductSelectorProps {
  products: Product[]
  selectedProducts: string[]
  onToggleProduct: (productId: string) => void
  onClose: () => void
  onConfirm: () => void
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  products,
  selectedProducts,
  onToggleProduct,
  onClose,
  onConfirm,
}) => {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.includes(searchTerm) ||
    product.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedCount = selectedProducts.length

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Seleziona Prodotti
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Cerca per nome, barcode o fornitore..."
            />
          </div>

          <div className="mt-2 text-sm text-gray-600">
            {selectedCount} prodotti selezionati
          </div>
        </div>

        <div className="overflow-y-auto max-h-96">
          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nessun prodotto trovato</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const isSelected = selectedProducts.includes(product.id)
                
                return (
                  <div
                    key={product.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => onToggleProduct(product.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected 
                          ? 'bg-blue-600 border-blue-600' 
                          : 'border-gray-300'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900 truncate">
                            {product.name}
                          </h3>
                          {product.barcode && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {product.barcode}
                            </span>
                          )}
                        </div>
                        
                        <div className="mt-1 text-sm text-gray-600">
                          {product.supplier_name && (
                            <span>Fornitore: {product.supplier_name}</span>
                          )}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          {product.quantity} {product.unit}
                          {product.expiry_date && (
                            <span className="ml-2">
                              Scadenza: {new Date(product.expiry_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {product.quantity} {product.unit}
                        </div>
                        {product.allergens && product.allergens.length > 0 && (
                          <div className="text-xs text-orange-600 mt-1">
                            Allergeni: {product.allergens.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {selectedCount} prodotti selezionati
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                disabled={selectedCount === 0}
              >
                Conferma ({selectedCount})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
