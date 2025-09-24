import { useState } from 'react'
import {
  Plus,
  Package,
  AlertTriangle,
  Clock,
  FileText,
  TrendingUp,
  Search,
  Filter,
} from 'lucide-react'
import { useProducts } from './hooks/useProducts'
import { useCategories } from './hooks/useCategories'
import { useExpiryTracking } from './hooks/useExpiryTracking'
import { useExpiredProducts } from './hooks/useExpiredProducts'
import { ProductCard } from './components/ProductCard'
import { AddProductModal } from './components/AddProductModal'
import { AddCategoryModal } from './components/AddCategoryModal'
import { ExpiryAlert } from './components/ExpiryAlert'
import { CategoryFilter } from './components/CategoryFilter'
import { ExpiredProductsManager } from './components/ExpiredProductsManager'
import { CollapsibleCard } from '@/components/ui/CollapsibleCard'
import {
  Product,
  ProductCategory,
  CreateProductForm,
  CreateCategoryForm,
} from '@/types/inventory'

export default function InventoryPage() {
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingCategory, setEditingCategory] =
    useState<ProductCategory | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showExpiredOnly, setShowExpiredOnly] = useState(false)

  const {
    products,
    stats,
    isLoading: isLoadingProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductStatus,
    isCreating,
    isUpdating,
  } = useProducts({
    query: searchQuery,
    filters: {
      category_id: selectedCategory || undefined,
      status: showExpiredOnly ? 'expired' : undefined,
    },
  })

  const {
    categories,
    isLoading: isLoadingCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories()

  const {
    expiryAlerts,
    expiryStats,
    isLoading: isLoadingExpiry,
    markAsExpired,
  } = useExpiryTracking(7) // 7 days ahead

  const {
    expiredProducts,
    isLoadingExpired,
    reinsertExpiredProduct,
    deleteExpiredProduct,
  } = useExpiredProducts()

  const handleCreateProduct = (productData: CreateProductForm) => {
    createProduct(productData, {
      onSuccess: () => {
        setShowAddProductModal(false)
      },
    })
  }

  const handleUpdateProduct = (productData: CreateProductForm) => {
    if (editingProduct) {
      updateProduct(
        { id: editingProduct.id, ...productData },
        {
          onSuccess: () => {
            setEditingProduct(null)
          },
        }
      )
    }
  }

  const handleCreateCategory = (categoryData: CreateCategoryForm) => {
    createCategory(categoryData, {
      onSuccess: () => {
        setShowAddCategoryModal(false)
      },
    })
  }

  const handleUpdateCategory = (categoryData: CreateCategoryForm) => {
    if (editingCategory) {
      updateCategory(
        { id: editingCategory.id, ...categoryData },
        {
          onSuccess: () => {
            setEditingCategory(null)
          },
        }
      )
    }
  }

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo prodotto?')) {
      deleteProduct(productId)
    }
  }

  const handleDeleteCategory = (categoryId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questa categoria?')) {
      deleteCategory(categoryId)
    }
  }

  const handleReinsertExpiredProduct = (_productId: string) => {
    // This will be handled by the ExpiredProductsManager modal
    // The actual reinsertion logic is in the useExpiredProducts hook
  }

  const handleDeleteExpiredProduct = (productId: string) => {
    deleteExpiredProduct.mutate(productId)
  }

  const isLoading = isLoadingProducts || isLoadingCategories || isLoadingExpiry

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
          <p className="text-gray-600">
            Gestisci prodotti, scadenze e liste della spesa
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setShowAddCategoryModal(true)}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 touch-manipulation min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm sm:text-base">Categoria</span>
          </button>
          <button
            onClick={() => setShowAddProductModal(true)}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 touch-manipulation min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm sm:text-base">Prodotto</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Totale Prodotti</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.total_products || 0}
              </p>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Attivi</p>
              <p className="text-2xl font-bold text-green-600">
                {stats?.active_products || 0}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Scadenza</p>
              <p className="text-2xl font-bold text-yellow-600">
                {expiryStats?.total_expiring || 0}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Scaduti</p>
              <p className="text-2xl font-bold text-red-600">
                {expiryStats?.expired_count || 0}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cerca prodotti..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            isLoading={isLoadingCategories}
          />
          <button
            onClick={() => setShowExpiredOnly(!showExpiredOnly)}
            className={`px-4 py-3 rounded-lg border transition-colors flex items-center justify-center gap-2 touch-manipulation min-h-[44px] ${
              showExpiredOnly
                ? 'bg-red-100 border-red-300 text-red-700'
                : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm sm:text-base">Solo Scaduti</span>
          </button>
        </div>
      </div>

      {/* Expiry Alerts */}
      {expiryAlerts.length > 0 && (
        <CollapsibleCard
          title="Prodotti in Scadenza"
          icon={AlertTriangle}
          counter={expiryAlerts.length}
          defaultExpanded={true}
        >
          <div className="space-y-3">
            {expiryAlerts.map(alert => (
              <ExpiryAlert
                key={alert.product_id}
                alert={alert}
                onMarkAsExpired={() => markAsExpired(alert.product_id)}
              />
            ))}
          </div>
        </CollapsibleCard>
      )}

      {/* Products List */}
      <CollapsibleCard
        title="Prodotti"
        icon={Package}
        counter={products.length}
        defaultExpanded={true}
      >
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nessun prodotto trovato</p>
            <button
              onClick={() => setShowAddProductModal(true)}
              className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Aggiungi il primo prodotto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={() => setEditingProduct(product)}
                onDelete={() => handleDeleteProduct(product.id)}
                onStatusChange={status =>
                  updateProductStatus({ id: product.id, status })
                }
              />
            ))}
          </div>
        )}
      </CollapsibleCard>

      {/* Expired Products Management */}
      <ExpiredProductsManager
        expiredProducts={expiredProducts}
        onReinsertProduct={handleReinsertExpiredProduct}
        onDeleteProduct={handleDeleteExpiredProduct}
        isLoading={isLoadingExpired}
        reinsertExpiredProduct={reinsertExpiredProduct.mutate}
      />

      {/* Categories Management */}
      <CollapsibleCard
        title="Categorie Prodotti"
        icon={FileText}
        counter={categories.length}
        defaultExpanded={false}
      >
        {isLoadingCategories ? (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>Nessuna categoria creata</p>
            <button
              onClick={() => setShowAddCategoryModal(true)}
              className="mt-2 text-green-600 hover:text-green-700 font-medium"
            >
              Aggiungi la prima categoria
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map(category => (
              <div
                key={category.id}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {category.name}
                    </h4>
                    {category.description && (
                      <p className="text-sm text-gray-600">
                        {category.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingCategory(category)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CollapsibleCard>

      {/* Modals */}
      {showAddProductModal && (
        <AddProductModal
          isOpen={showAddProductModal}
          onClose={() => setShowAddProductModal(false)}
          onSubmit={handleCreateProduct}
          categories={categories}
          isLoading={isCreating}
        />
      )}

      {editingProduct && (
        <AddProductModal
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          onSubmit={handleUpdateProduct}
          product={editingProduct}
          categories={categories}
          isLoading={isUpdating}
        />
      )}

      {showAddCategoryModal && (
        <AddCategoryModal
          isOpen={showAddCategoryModal}
          onClose={() => setShowAddCategoryModal(false)}
          onSubmit={handleCreateCategory}
          isLoading={isCreating}
        />
      )}

      {editingCategory && (
        <AddCategoryModal
          isOpen={!!editingCategory}
          onClose={() => setEditingCategory(null)}
          onSubmit={handleUpdateCategory}
          category={editingCategory}
          isLoading={isUpdating}
        />
      )}
    </div>
  )
}
