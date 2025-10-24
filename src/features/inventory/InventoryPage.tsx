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
import { ShoppingListCard } from '@/features/shopping/components/ShoppingListCard'
import { DEFAULT_CATEGORIES } from '@/utils/defaultCategories'
import { useAuth } from '@/hooks/useAuth'
// import { toast } from 'react-toastify'
import {
  Product,
  ProductCategory,
  CreateProductForm,
  CreateCategoryForm,
} from '@/types/inventory'

export default function InventoryPage() {
  const { companyId: _companyId } = useAuth()
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingCategory, setEditingCategory] =
    useState<ProductCategory | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showExpiredOnly, setShowExpiredOnly] = useState(false)
  const [_isCreatingDefaults, _setIsCreatingDefaults] = useState(false)

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
    refetch: _refetchCategories,
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

  // const handleCreateDefaultCategories = async () => {
  //   if (!companyId) {
  //     toast.error('Errore: ID azienda non trovato')
  //     return
  //   }

  //   setIsCreatingDefaults(true)
  //   try {
  //     await createDefaultCategories(companyId)
  //     await refetchCategories()
  //     toast.success('Categorie predefinite create con successo!')
  //   } catch (error) {
  //     console.error('Error creating default categories:', error)
  //     toast.error('Errore nella creazione delle categorie predefinite')
  //   } finally {
  //     setIsCreatingDefaults(false)
  //   }
  // }

  const isLoading = isLoadingProducts || isLoadingCategories || isLoadingExpiry

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
          <p className="text-gray-600">
            Gestisci prodotti, scadenze e liste della spesa
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddCategoryModal(true)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Categoria
          </button>
          <button
            onClick={() => setShowAddProductModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Prodotto
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Shopping List Card */}
      <ShoppingListCard />

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
            className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
              showExpiredOnly
                ? 'bg-red-100 border-red-300 text-red-700'
                : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            Solo Scaduti
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
          isLoading={isLoadingExpiry}
          isEmpty={!isLoadingExpiry && expiryAlerts.length === 0}
          emptyMessage="Nessun prodotto in scadenza nei prossimi giorni."
          contentClassName="px-4 py-6 sm:px-6"
        >
          {!isLoadingExpiry && expiryAlerts.length > 0 && (
            <div className="space-y-3">
              {expiryAlerts.map(alert => (
                <ExpiryAlert
                  key={alert.product_id}
                  alert={alert}
                  onMarkAsExpired={() => markAsExpired(alert.product_id)}
                />
              ))}
            </div>
          )}
        </CollapsibleCard>
      )}

      {/* Products List */}
      <CollapsibleCard
        title="Prodotti"
        icon={Package}
        counter={products.length}
        defaultExpanded={true}
        isLoading={isLoading}
        isEmpty={!isLoading && products.length === 0}
        emptyMessage="Nessun prodotto presente. Aggiungi il primo dal pulsante in alto."
        contentClassName="px-4 py-6 sm:px-6"
        emptyActionLabel="Aggiungi il primo prodotto"
        onEmptyAction={() => setShowAddProductModal(true)}
      >
        {!isLoading && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product: Product) => (
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
        {!isLoading && products.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <button
              onClick={() => setShowAddProductModal(true)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Aggiungi il primo prodotto
            </button>
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
        isLoading={isLoadingCategories || _isCreatingDefaults}
        contentClassName="px-4 py-6 sm:px-6"
      >
        {!isLoadingCategories && (
          <>
            {/* Mostra sempre tutte le categorie predefinite */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {DEFAULT_CATEGORIES.map(defaultCat => {
                const existingCategory = categories.find(c => c.name === defaultCat.name)
                const isCreated = !!existingCategory

                return (
                  <div
                    key={defaultCat.name}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isCreated
                        ? 'bg-white border-green-200'
                        : 'bg-gray-50 border-gray-200 border-dashed'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">
                            {defaultCat.name}
                          </h4>
                          {isCreated && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              ✓ Creata
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {defaultCat.description}
                        </p>
                      </div>
                      {isCreated && existingCategory && (
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={() => setEditingCategory(existingCategory)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Modifica"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(existingCategory.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Elimina"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 font-medium">Temperatura:</span>
                        <span className="text-blue-700 font-semibold">
                          {defaultCat.temperature_requirements.min_temp}°C - {defaultCat.temperature_requirements.max_temp}°C
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Mostra categorie personalizzate create dall'utente */}
            {categories.filter(c => !DEFAULT_CATEGORIES.find(dc => dc.name === c.name)).length > 0 && (
              <>
                <div className="mt-6 mb-3 border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Categorie Personalizzate
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categories
                    .filter(c => !DEFAULT_CATEGORIES.find(dc => dc.name === c.name))
                    .map(category => (
                      <div
                        key={category.id}
                        className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {category.name}
                            </h4>
                            {category.description && (
                              <p className="text-xs text-gray-600 mt-1">
                                {category.description}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => setEditingCategory(category)}
                              className="p-1 text-gray-400 hover:text-blue-600"
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
              </>
            )}
          </>
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
