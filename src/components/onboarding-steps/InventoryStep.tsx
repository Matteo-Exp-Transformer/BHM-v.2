import { useEffect, useMemo, useState } from 'react'
import {
  Package,
  Tag,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Calendar,
} from 'lucide-react'
import { AllergenType } from '@/types/inventory'

import type {
  InventoryStepData,
  InventoryStepProps,
  InventoryProduct,
  ProductCategory,
} from '@/types/onboarding'
import {
  UNIT_OPTIONS,
  normalizeInventoryProduct,
  createEmptyCategory,
  createEmptyProduct,
  validateInventoryCategory,
  validateInventoryProduct,
  isProductCompliant,
  getAllergenLabel,
} from '@/utils/onboarding/inventoryUtils'

// Allineato con AddProductModal - stessi allergeni e labels
const ALLERGEN_OPTIONS: { value: AllergenType; label: string }[] = [
  { value: AllergenType.GLUTINE, label: 'Glutine' },
  { value: AllergenType.LATTE, label: 'Latte' },
  { value: AllergenType.UOVA, label: 'Uova' },
  { value: AllergenType.SOIA, label: 'Soia' },
  { value: AllergenType.FRUTTA_GUSCIO, label: 'Frutta a guscio' },
  { value: AllergenType.ARACHIDI, label: 'Arachidi' },
  { value: AllergenType.PESCE, label: 'Pesce' },
  { value: AllergenType.CROSTACEI, label: 'Crostacei' },
]

const InventoryStep = ({
  data,
  departments,
  conservationPoints,
  onUpdate,
  onValidChange,
}: InventoryStepProps) => {
  const [categories, setCategories] = useState<ProductCategory[]>(
    (data?.categories ?? []).map(category =>
      createEmptyCategory.fromExisting(category)
    )
  )
  const [products, setProducts] = useState<InventoryProduct[]>(
    (data?.products ?? []).map(normalizeInventoryProduct)
  )
  const [activeTab, setActiveTab] = useState<'categories' | 'products'>(
    'categories'
  )

  const [draftCategory, setDraftCategory] = useState<ProductCategory | null>(
    null
  )
  const [categoryErrors, setCategoryErrors] = useState<Record<string, string>>(
    {}
  )

  const [draftProduct, setDraftProduct] = useState<InventoryProduct | null>(
    null
  )
  const [productErrors, setProductErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const payload: InventoryStepData = {
      categories,
      products,
    }
    onUpdate(payload)
  }, [categories, products])

  useEffect(() => {
    onValidChange(products.length > 0)
  }, [products.length])

  const departmentOptions = useMemo(
    () => departments.filter(department => department.is_active),
    [departments]
  )

  const complianceByProduct = useMemo(() => {
    return products.reduce<
      Record<string, ReturnType<typeof isProductCompliant>>
    >((acc, product) => {
      acc[product.id] = isProductCompliant(
        product,
        categories,
        conservationPoints
      )
      return acc
    }, {})
  }, [products, categories, conservationPoints])

  const handleOpenCategoryEditor = (category?: ProductCategory) => {
    setDraftCategory(createEmptyCategory.fromExisting(category))
    setCategoryErrors({})
  }

  const handleCancelCategory = () => {
    setDraftCategory(null)
    setCategoryErrors({})
  }

  const handleSaveCategory = () => {
    if (!draftCategory) return
    const result = validateInventoryCategory(draftCategory, categories)
    if (!result.success) {
      setCategoryErrors(result.errors ?? {})
      return
    }

    setCategories(prev => {
      const existingIdx = prev.findIndex(cat => cat.id === draftCategory.id)
      if (existingIdx >= 0) {
        const next = [...prev]
        next[existingIdx] = draftCategory
        return next
      }
      return [...prev, draftCategory]
    })

    handleCancelCategory()
  }

  const handleDeleteCategory = (id: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== id))
    setProducts(prev =>
      prev.map(product =>
        product.categoryId === id
          ? { ...product, categoryId: undefined }
          : product
      )
    )
  }

  const handleOpenProductEditor = (product?: InventoryProduct) => {
    setDraftProduct(createEmptyProduct.fromExisting(product))
    setProductErrors({})
  }

  const handleCancelProduct = () => {
    setDraftProduct(null)
    setProductErrors({})
  }

  const handleSaveProduct = () => {
    if (!draftProduct) return
    console.log('🔍 Prodotto da validare:', draftProduct)
    const normalized = normalizeInventoryProduct(draftProduct)
    console.log('🔍 Prodotto normalizzato:', normalized)
    const result = validateInventoryProduct(
      normalized,
      categories,
      conservationPoints
    )
    if (!result.success) {
      console.error('❌ Validazione prodotto fallita:')
      console.error('Errori dettagliati:', JSON.stringify(result.errors, null, 2))
      Object.entries(result.errors ?? {}).forEach(([field, error]) => {
        console.error(`  - ${field}: ${error}`)
      })
      setProductErrors(result.errors ?? {})
      return
    }

    setProducts(prev => {
      const existingIdx = prev.findIndex(prod => prod.id === normalized.id)
      if (existingIdx >= 0) {
        const next = [...prev]
        next[existingIdx] = normalized
        return next
      }
      return [...prev, normalized]
    })

    handleCancelProduct()
  }

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id))
  }

  const toggleProductAllergen = (allergen: AllergenType) => {
    setDraftProduct(prev =>
      prev
        ? {
            ...prev,
            allergens: prev.allergens.includes(allergen)
              ? prev.allergens.filter(a => a !== allergen)
              : [...prev.allergens, allergen],
          }
        : prev
    )
  }

  return (
    <div className="space-y-6">
      <header className="text-center space-y-2">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <Package className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Gestione Inventario
        </h2>
        <p className="text-gray-600">
          Configura categorie prodotti e inventario iniziale per il controllo
          HACCP
        </p>
      </header>

      <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'categories'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Tag className="mr-2 inline h-4 w-4" />
          Categorie Prodotti
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'products'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Package className="mr-2 inline h-4 w-4" />
          Prodotti
        </button>
      </div>

      {activeTab === 'categories' && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Categorie configurate ({categories.length})
              </h3>
              <p className="text-sm text-gray-600">
                Ogni categoria definisce i range termici e i requisiti HACCP
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenCategoryEditor()}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" /> Nuova categoria
            </button>
          </div>

          {categories.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center text-gray-500">
              Nessuna categoria configurata. Aggiungi la prima categoria per
              iniziare.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {categories.map(category => (
                <article
                  key={category.id}
                  className="rounded-lg border border-gray-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <h4 className="font-medium text-gray-900">
                          {category.name}
                        </h4>
                      </div>
                      {category.description && (
                        <p className="mb-2 text-sm text-gray-600">
                          {category.description}
                        </p>
                      )}
                      <dl className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Range:</span>
                          <span>
                            {category.conservationRules.minTemp}°C ➝{' '}
                            {category.conservationRules.maxTemp}°C
                          </span>
                        </div>
                        {category.conservationRules.maxStorageDays && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Durata max:</span>
                            <span>
                              {category.conservationRules.maxStorageDays} giorni
                            </span>
                          </div>
                        )}
                        {category.conservationRules.requiresBlastChilling && (
                          <div className="flex items-center gap-2 text-amber-600">
                            ⚡ Richiede abbattitore
                          </div>
                        )}
                      </dl>
                    </div>
                    <div className="ml-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenCategoryEditor(category)}
                        className="rounded p-1 text-blue-600 hover:bg-blue-50"
                        title="Modifica categoria"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(category.id)}
                        className="rounded p-1 text-red-600 hover:bg-red-50"
                        title="Elimina categoria"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {draftCategory && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h4 className="mb-4 text-sm font-semibold text-blue-900">
                {categories.some(cat => cat.id === draftCategory.id)
                  ? 'Modifica categoria'
                  : 'Nuova categoria'}
              </h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-blue-900">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={draftCategory.name}
                    onChange={e =>
                      setDraftCategory(prev =>
                        prev ? { ...prev, name: e.target.value } : prev
                      )
                    }
                    className={`w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                      categoryErrors.name ? 'border-red-300' : 'border-blue-200'
                    }`}
                  />
                  {categoryErrors.name && (
                    <p className="mt-1 text-xs text-red-600">
                      {categoryErrors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-blue-900">
                    Colore
                  </label>
                  <input
                    type="color"
                    value={draftCategory.color}
                    onChange={e =>
                      setDraftCategory(prev =>
                        prev ? { ...prev, color: e.target.value } : prev
                      )
                    }
                    className="h-10 w-full cursor-pointer rounded-md border border-blue-200"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-blue-900">
                  Descrizione
                </label>
                <textarea
                  value={draftCategory.description ?? ''}
                  onChange={e =>
                    setDraftCategory(prev =>
                      prev ? { ...prev, description: e.target.value } : prev
                    )
                  }
                  rows={3}
                  className="w-full rounded-md border border-blue-200 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="Descrizione opzionale"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-blue-900">
                    Temp. minima *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={draftCategory.conservationRules.minTemp}
                    onChange={e =>
                      setDraftCategory(prev =>
                        prev
                          ? {
                              ...prev,
                              conservationRules: {
                                ...prev.conservationRules,
                                minTemp: Number(e.target.value),
                              },
                            }
                          : prev
                      )
                    }
                    className="w-full rounded-md border border-blue-200 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-blue-900">
                    Temp. massima *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={draftCategory.conservationRules.maxTemp}
                    onChange={e =>
                      setDraftCategory(prev =>
                        prev
                          ? {
                              ...prev,
                              conservationRules: {
                                ...prev.conservationRules,
                                maxTemp: Number(e.target.value),
                              },
                            }
                          : prev
                      )
                    }
                    className={`w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                      categoryErrors['conservationRules.maxTemp']
                        ? 'border-red-300'
                        : 'border-blue-200'
                    }`}
                  />
                  {categoryErrors['conservationRules.maxTemp'] && (
                    <p className="mt-1 text-xs text-red-600">
                      {categoryErrors['conservationRules.maxTemp']}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-blue-900">
                    Durata max (gg)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={draftCategory.conservationRules.maxStorageDays ?? ''}
                    onChange={e =>
                      setDraftCategory(prev =>
                        prev
                          ? {
                              ...prev,
                              conservationRules: {
                                ...prev.conservationRules,
                                maxStorageDays: e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
                              },
                            }
                          : prev
                      )
                    }
                    className="w-full rounded-md border border-blue-200 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <input
                    id="requiresBlastChilling"
                    type="checkbox"
                    checked={
                      draftCategory.conservationRules.requiresBlastChilling ??
                      false
                    }
                    onChange={e =>
                      setDraftCategory(prev =>
                        prev
                          ? {
                              ...prev,
                              conservationRules: {
                                ...prev.conservationRules,
                                requiresBlastChilling: e.target.checked,
                              },
                            }
                          : prev
                      )
                    }
                    className="h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="requiresBlastChilling"
                    className="text-sm text-blue-900"
                  >
                    Richiede abbattitore
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancelCategory}
                  className="rounded-lg px-4 py-2 text-sm text-blue-900 hover:bg-blue-100"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={handleSaveCategory}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                >
                  Salva categoria
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {activeTab === 'products' && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Prodotti configurati ({products.length})
              </h3>
              <p className="text-sm text-gray-600">
                Ogni prodotto viene validato secondo le regole HACCP di
                categoria
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenProductEditor()}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" /> Nuovo prodotto
            </button>
          </div>

          {products.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center text-gray-500">
              Nessun prodotto configurato. Aggiungi un prodotto per proseguire.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {products.map(product => {
                const category = categories.find(
                  cat => cat.id === product.categoryId
                )
                const department = departments.find(
                  dept => dept.id === product.departmentId
                )
                const point = conservationPoints.find(
                  cp => cp.id === product.conservationPointId
                )
                const compliance = complianceByProduct[product.id]

                return (
                  <article
                    key={product.id}
                    className="rounded-lg border border-gray-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-medium text-gray-900">
                            {product.name}
                          </h4>
                          {product.quantity !== undefined && (
                            <span className="text-sm text-gray-500">
                              {product.quantity} {product.unit ?? 'pz'}
                            </span>
                          )}
                          <span
                            className={`rounded-full px-2 py-1 text-xs capitalize ${
                              product.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : product.status === 'expired'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {product.status}
                          </span>
                        </div>

                        <dl className="grid grid-cols-1 gap-1 text-xs text-gray-600 md:grid-cols-3">
                          {category && (
                            <div>
                              <dt className="font-semibold">Categoria:</dt>
                              <dd>{category.name}</dd>
                            </div>
                          )}
                          {department && (
                            <div>
                              <dt className="font-semibold">Reparto:</dt>
                              <dd>{department.name}</dd>
                            </div>
                          )}
                          {point && (
                            <div>
                              <dt className="font-semibold">Conservazione:</dt>
                              <dd>
                                {point.name} ({point.targetTemperature}°C)
                              </dd>
                            </div>
                          )}
                        </dl>

                        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                          {product.supplierName && (
                            <span className="rounded-full bg-gray-100 px-2 py-1">
                              {product.supplierName}
                            </span>
                          )}
                          {product.expiryDate && (
                            <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-700">
                              Scadenza: {product.expiryDate}
                            </span>
                          )}
                          {product.allergens.length > 0 && (
                            <span className="rounded-full bg-red-100 px-2 py-1 text-red-700">
                              Allergeni:{' '}
                              {product.allergens
                                .map(getAllergenLabel)
                                .join(', ')}
                            </span>
                          )}
                        </div>

                        {product.labelPhotoUrl && (
                          <a
                            href={product.labelPhotoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-xs text-blue-600 hover:underline"
                          >
                            Visualizza etichetta
                          </a>
                        )}

                        <div
                          className={`rounded-md border px-3 py-2 text-xs ${
                            compliance.compliant
                              ? 'border-green-200 bg-green-50 text-green-700'
                              : 'border-amber-200 bg-amber-50 text-amber-700'
                          }`}
                        >
                          {compliance.message}
                        </div>

                        {product.notes && (
                          <p className="border-l-2 border-blue-200 pl-3 text-sm text-gray-500">
                            {product.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenProductEditor(product)}
                          className="rounded p-1 text-blue-600 hover:bg-blue-50"
                          title="Modifica prodotto"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="rounded p-1 text-red-600 hover:bg-red-50"
                          title="Elimina prodotto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          {draftProduct && (
            <div className="space-y-6 rounded-lg border border-blue-200 bg-blue-50 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-blue-900">
                    {products.some(prod => prod.id === draftProduct.id)
                      ? 'Modifica Prodotto'
                      : 'Nuovo Prodotto'}
                  </h4>
                  <p className="text-sm text-blue-600">
                    {products.some(prod => prod.id === draftProduct.id)
                      ? 'Aggiorna le informazioni del prodotto'
                      : "Aggiungi un nuovo prodotto all'inventario"}
                  </p>
                </div>
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-blue-900 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Informazioni Base
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-blue-900">
                      Nome prodotto *
                    </label>
                    <input
                      type="text"
                      value={draftProduct.name}
                      onChange={e =>
                        setDraftProduct(prev =>
                          prev ? { ...prev, name: e.target.value } : prev
                        )
                      }
                      className={`w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                        productErrors.name
                          ? 'border-red-300'
                          : 'border-blue-200'
                      }`}
                    />
                    {productErrors.name && (
                      <p className="mt-1 text-xs text-red-600">
                        {productErrors.name}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-blue-900">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={draftProduct.sku ?? ''}
                        onChange={e =>
                          setDraftProduct(prev =>
                            prev ? { ...prev, sku: e.target.value } : prev
                          )
                        }
                        className="w-full rounded-md border border-blue-200 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-blue-900">
                        Barcode
                      </label>
                      <input
                        type="text"
                        value={draftProduct.barcode ?? ''}
                        onChange={e =>
                          setDraftProduct(prev =>
                            prev ? { ...prev, barcode: e.target.value } : prev
                          )
                        }
                        className="w-full rounded-md border border-blue-200 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Category and Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-blue-900 flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Categoria e Posizione
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-blue-900">
                      Categoria *
                    </label>
                    <select
                      value={draftProduct.categoryId ?? ''}
                      onChange={e =>
                        setDraftProduct(prev =>
                          prev
                            ? {
                                ...prev,
                                categoryId: e.target.value || undefined,
                              }
                            : prev
                        )
                      }
                      className={`w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                        productErrors.categoryId
                          ? 'border-red-300'
                          : 'border-blue-200'
                      }`}
                    >
                      <option value="">Seleziona categoria</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {productErrors.categoryId && (
                      <p className="mt-1 text-xs text-red-600">
                        {productErrors.categoryId}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-blue-900">
                        Reparto *
                      </label>
                      <select
                        value={draftProduct.departmentId ?? ''}
                        onChange={e =>
                          setDraftProduct(prev =>
                            prev
                              ? {
                                  ...prev,
                                  departmentId: e.target.value || undefined,
                                }
                              : prev
                          )
                        }
                        className={`w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                          productErrors.departmentId
                            ? 'border-red-300'
                            : 'border-blue-200'
                        }`}
                      >
                        <option value="">Seleziona reparto</option>
                        {departmentOptions.map(department => (
                          <option key={department.id} value={department.id}>
                            {department.name}
                          </option>
                        ))}
                      </select>
                      {productErrors.departmentId && (
                        <p className="mt-1 text-xs text-red-600">
                          {productErrors.departmentId}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-blue-900">
                        Conservazione *
                      </label>
                      <select
                        value={draftProduct.conservationPointId ?? ''}
                        onChange={e =>
                          setDraftProduct(prev =>
                            prev
                              ? {
                                  ...prev,
                                  conservationPointId:
                                    e.target.value || undefined,
                                }
                              : prev
                          )
                        }
                        className={`w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                          productErrors.conservationPointId
                            ? 'border-red-300'
                            : 'border-blue-200'
                        }`}
                      >
                        <option value="">Seleziona punto conservazione</option>
                        {conservationPoints.map(point => (
                          <option key={point.id} value={point.id}>
                            {point.name} ({point.targetTemperature}°C)
                          </option>
                        ))}
                      </select>
                      {productErrors.conservationPointId && (
                        <p className="mt-1 text-xs text-red-600">
                          {productErrors.conservationPointId}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dates and Quantity */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-blue-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Date e Quantità
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-blue-900">
                      Data Acquisto *
                    </label>
                    <input
                      type="date"
                      value={draftProduct?.purchaseDate ?? ''}
                      onChange={e =>
                        setDraftProduct(prev =>
                          prev
                            ? {
                                ...prev,
                                purchaseDate: e.target.value || undefined,
                              }
                            : prev
                        )
                      }
                      className={`w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                        productErrors.purchaseDate
                          ? 'border-red-300'
                          : 'border-blue-200'
                      }`}
                    />
                    {productErrors.purchaseDate && (
                      <p className="mt-1 text-xs text-red-600">
                        {productErrors.purchaseDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-blue-900">
                      Data Scadenza *
                    </label>
                    <input
                      type="date"
                      value={draftProduct?.expiryDate ?? ''}
                      onChange={e =>
                        setDraftProduct(prev =>
                          prev
                            ? {
                                ...prev,
                                expiryDate: e.target.value || undefined,
                              }
                            : prev
                        )
                      }
                      className={`w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                        productErrors.expiryDate
                          ? 'border-red-300'
                          : 'border-blue-200'
                      }`}
                    />
                    {productErrors.expiryDate && (
                      <p className="mt-1 text-xs text-red-600">
                        {productErrors.expiryDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-blue-900">
                      Quantità *
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="0.001"
                      value={draftProduct.quantity ?? ''}
                      onChange={e =>
                        setDraftProduct(prev =>
                          prev
                            ? {
                                ...prev,
                                quantity: e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
                              }
                            : prev
                        )
                      }
                      className={`w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                        productErrors.quantity
                          ? 'border-red-300'
                          : 'border-blue-200'
                      }`}
                    />
                    {productErrors.quantity && (
                      <p className="mt-1 text-xs text-red-600">
                        {productErrors.quantity}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-blue-900">
                      Unità *
                    </label>
                    <select
                      value={draftProduct.unit ?? 'pz'}
                      onChange={e =>
                        setDraftProduct(prev =>
                          prev ? { ...prev, unit: e.target.value } : prev
                        )
                      }
                      className="w-full rounded-md border border-blue-200 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    >
                      {UNIT_OPTIONS.map(unit => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-blue-900 flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5" />
                  Allergeni
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {ALLERGEN_OPTIONS.map(allergen => (
                    <label
                      key={allergen.value}
                      className="flex items-center gap-2 p-3 border border-blue-200 rounded-lg hover:bg-blue-50/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={
                          draftProduct?.allergens.includes(allergen.value) ||
                          false
                        }
                        onChange={() => toggleProductAllergen(allergen.value)}
                        className="w-4 h-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-blue-900">
                        {allergen.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-blue-900">
                  URL Foto Etichetta
                </label>
                <input
                  type="url"
                  value={draftProduct?.labelPhotoUrl ?? ''}
                  onChange={e =>
                    setDraftProduct(prev =>
                      prev ? { ...prev, labelPhotoUrl: e.target.value } : prev
                    )
                  }
                  className="w-full rounded-md border border-blue-200 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-blue-900">
                  Note
                </label>
                <textarea
                  value={draftProduct.notes ?? ''}
                  onChange={e =>
                    setDraftProduct(prev =>
                      prev ? { ...prev, notes: e.target.value } : prev
                    )
                  }
                  rows={3}
                  className="w-full rounded-md border border-blue-200 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="Informazioni aggiuntive"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-blue-200 pt-4">
                <button
                  type="button"
                  onClick={handleCancelProduct}
                  className="rounded-lg px-4 py-2 text-sm text-blue-900 hover:bg-blue-100"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={handleSaveProduct}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                >
                  Salva prodotto
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

export default InventoryStep
