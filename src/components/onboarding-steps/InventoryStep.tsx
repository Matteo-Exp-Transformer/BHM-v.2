import { useState, useEffect } from 'react'
import { Package, Plus, Trash2, Edit2, Tag, Calendar } from 'lucide-react'

interface Department {
  id: string
  name: string
  description: string
  is_active: boolean
}

interface ConservationPoint {
  id: string
  name: string
  department_id: string
  setpoint_temp: number
  type: 'ambient' | 'fridge' | 'freezer' | 'blast'
  product_categories: string[]
  is_blast_chiller: boolean
}

interface ProductCategory {
  id: string
  name: string
  color: string
  description?: string
  conservation_rules: {
    temp_min: number
    temp_max: number
    max_storage_days?: number
    requires_blast_chilling?: boolean
  }
}

interface Product {
  id: string
  name: string
  category_id?: string
  department_id?: string
  conservation_point_id?: string
  quantity?: number
  unit?: string
  allergens?: string[]
  supplier_name?: string
  purchase_date?: string
  expiry_date?: string
  status: 'active' | 'expired' | 'consumed' | 'waste'
  notes?: string
}

interface InventoryStepProps {
  data?: {
    categories?: ProductCategory[]
    products?: Product[]
  }
  departments: Department[]
  conservationPoints: ConservationPoint[]
  onUpdate: (data: { categories: ProductCategory[], products: Product[] }) => void
  onValidChange: (isValid: boolean) => void
}

const PREDEFINED_CATEGORIES = [
  { name: 'Carni Fresche', color: '#ef4444', temp_min: 0, temp_max: 4, max_storage_days: 3, requires_blast_chilling: true },
  { name: 'Pesce Fresco', color: '#3b82f6', temp_min: 0, temp_max: 2, max_storage_days: 2, requires_blast_chilling: true },
  { name: 'Latticini', color: '#f59e0b', temp_min: 2, temp_max: 6, max_storage_days: 7 },
  { name: 'Verdure Fresche', color: '#10b981', temp_min: 4, temp_max: 8, max_storage_days: 5 },
  { name: 'Surgelati', color: '#6366f1', temp_min: -18, temp_max: -15, max_storage_days: 90 },
  { name: 'Prodotti Secchi', color: '#8b5cf6', temp_min: 15, temp_max: 25, max_storage_days: 365 }
]

const ALLERGENS = [
  'Glutine', 'Crostacei', 'Uova', 'Pesce', 'Arachidi', 'Soia', 'Latte',
  'Frutta a guscio', 'Sedano', 'Senape', 'Sesamo', 'Anidride solforosa',
  'Lupini', 'Molluschi'
]

const UNITS = ['kg', 'g', 'l', 'ml', 'pz', 'conf', 'scatole', 'buste']

const InventoryStep = ({ data, departments, conservationPoints, onUpdate, onValidChange }: InventoryStepProps) => {
  const [categories, setCategories] = useState<ProductCategory[]>(data?.categories || [])
  const [products, setProducts] = useState<Product[]>(data?.products || [])
  const [activeTab, setActiveTab] = useState<'categories' | 'products'>('categories')

  // Category form
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    color: '#3b82f6',
    description: '',
    temp_min: 0,
    temp_max: 8,
    max_storage_days: 7,
    requires_blast_chilling: false
  })

  // Product form
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [productForm, setProductForm] = useState({
    name: '',
    category_id: '',
    department_id: '',
    conservation_point_id: '',
    quantity: '',
    unit: 'kg',
    allergens: [] as string[],
    supplier_name: '',
    purchase_date: '',
    expiry_date: '',
    status: 'active' as const,
    notes: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    validateForm()
    onUpdate({ categories, products })
  }, [categories, products, onUpdate])

  const validateForm = () => {
    const isValid = categories.length > 0 && products.length > 0
    onValidChange(isValid)
  }

  const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Category Management
  const validateCategory = () => {
    const newErrors: Record<string, string> = {}

    if (!categoryForm.name.trim()) {
      newErrors.category_name = 'Il nome della categoria è obbligatorio'
    } else if (categories.find(c => c.id !== editingCategoryId && c.name.toLowerCase() === categoryForm.name.toLowerCase())) {
      newErrors.category_name = 'Una categoria con questo nome esiste già'
    }

    if (categoryForm.temp_min >= categoryForm.temp_max) {
      newErrors.temp_range = 'La temperatura minima deve essere inferiore alla massima'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const addCategory = () => {
    if (!validateCategory()) return

    const newCategory: ProductCategory = {
      id: generateId(),
      name: categoryForm.name.trim(),
      color: categoryForm.color,
      description: categoryForm.description || undefined,
      conservation_rules: {
        temp_min: categoryForm.temp_min,
        temp_max: categoryForm.temp_max,
        max_storage_days: categoryForm.max_storage_days || undefined,
        requires_blast_chilling: categoryForm.requires_blast_chilling
      }
    }

    setCategories([...categories, newCategory])
    resetCategoryForm()
  }

  const updateCategory = () => {
    if (!validateCategory()) return

    setCategories(categories.map(category =>
      category.id === editingCategoryId
        ? {
            ...category,
            name: categoryForm.name.trim(),
            color: categoryForm.color,
            description: categoryForm.description || undefined,
            conservation_rules: {
              temp_min: categoryForm.temp_min,
              temp_max: categoryForm.temp_max,
              max_storage_days: categoryForm.max_storage_days || undefined,
              requires_blast_chilling: categoryForm.requires_blast_chilling
            }
          }
        : category
    ))
    resetCategoryForm()
  }

  const deleteCategory = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id))
    // Remove category from products
    setProducts(products.map(product =>
      product.category_id === id ? { ...product, category_id: undefined } : product
    ))
  }

  const startEditCategory = (category: ProductCategory) => {
    setEditingCategoryId(category.id)
    setCategoryForm({
      name: category.name,
      color: category.color,
      description: category.description || '',
      temp_min: category.conservation_rules.temp_min,
      temp_max: category.conservation_rules.temp_max,
      max_storage_days: category.conservation_rules.max_storage_days || 7,
      requires_blast_chilling: category.conservation_rules.requires_blast_chilling || false
    })
    setErrors({})
  }

  const resetCategoryForm = () => {
    setEditingCategoryId(null)
    setCategoryForm({
      name: '',
      color: '#3b82f6',
      description: '',
      temp_min: 0,
      temp_max: 8,
      max_storage_days: 7,
      requires_blast_chilling: false
    })
    setErrors({})
  }

  // Product Management
  const validateProduct = () => {
    const newErrors: Record<string, string> = {}

    if (!productForm.name.trim()) {
      newErrors.product_name = 'Il nome del prodotto è obbligatorio'
    }

    if (productForm.quantity && isNaN(parseFloat(productForm.quantity))) {
      newErrors.quantity = 'Inserisci una quantità valida'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const addProduct = () => {
    if (!validateProduct()) return

    const newProduct: Product = {
      id: generateId(),
      name: productForm.name.trim(),
      category_id: productForm.category_id || undefined,
      department_id: productForm.department_id || undefined,
      conservation_point_id: productForm.conservation_point_id || undefined,
      quantity: productForm.quantity ? parseFloat(productForm.quantity) : undefined,
      unit: productForm.unit || undefined,
      allergens: productForm.allergens.length > 0 ? productForm.allergens : undefined,
      supplier_name: productForm.supplier_name || undefined,
      purchase_date: productForm.purchase_date || undefined,
      expiry_date: productForm.expiry_date || undefined,
      status: productForm.status,
      notes: productForm.notes || undefined
    }

    setProducts([...products, newProduct])
    resetProductForm()
  }

  const updateProduct = () => {
    if (!validateProduct()) return

    setProducts(products.map(product =>
      product.id === editingProductId
        ? {
            ...product,
            name: productForm.name.trim(),
            category_id: productForm.category_id || undefined,
            department_id: productForm.department_id || undefined,
            conservation_point_id: productForm.conservation_point_id || undefined,
            quantity: productForm.quantity ? parseFloat(productForm.quantity) : undefined,
            unit: productForm.unit || undefined,
            allergens: productForm.allergens.length > 0 ? productForm.allergens : undefined,
            supplier_name: productForm.supplier_name || undefined,
            purchase_date: productForm.purchase_date || undefined,
            expiry_date: productForm.expiry_date || undefined,
            status: productForm.status,
            notes: productForm.notes || undefined
          }
        : product
    ))
    resetProductForm()
  }

  const deleteProduct = (id: string) => {
    setProducts(products.filter(product => product.id !== id))
  }

  const startEditProduct = (product: Product) => {
    setEditingProductId(product.id)
    setProductForm({
      name: product.name,
      category_id: product.category_id || '',
      department_id: product.department_id || '',
      conservation_point_id: product.conservation_point_id || '',
      quantity: product.quantity?.toString() || '',
      unit: product.unit || 'kg',
      allergens: product.allergens || [],
      supplier_name: product.supplier_name || '',
      purchase_date: product.purchase_date || '',
      expiry_date: product.expiry_date || '',
      status: product.status,
      notes: product.notes || ''
    })
    setErrors({})
  }

  const resetProductForm = () => {
    setEditingProductId(null)
    setProductForm({
      name: '',
      category_id: '',
      department_id: '',
      conservation_point_id: '',
      quantity: '',
      unit: 'kg',
      allergens: [],
      supplier_name: '',
      purchase_date: '',
      expiry_date: '',
      status: 'active',
      notes: ''
    })
    setErrors({})
  }

  const handleAllergenToggle = (allergen: string) => {
    setProductForm(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }))
  }

  const prefillSampleCategories = () => {
    const sampleCategories: ProductCategory[] = PREDEFINED_CATEGORIES.map(cat => ({
      id: generateId(),
      name: cat.name,
      color: cat.color,
      conservation_rules: {
        temp_min: cat.temp_min,
        temp_max: cat.temp_max,
        max_storage_days: cat.max_storage_days,
        requires_blast_chilling: cat.requires_blast_chilling
      }
    }))
    setCategories(sampleCategories)
  }

  const prefillSampleProducts = () => {
    if (categories.length === 0) {
      prefillSampleCategories()
      return
    }

    const carni = categories.find(c => c.name.includes('Carni'))
    const pesce = categories.find(c => c.name.includes('Pesce'))
    const latticini = categories.find(c => c.name.includes('Latticini'))
    const verdure = categories.find(c => c.name.includes('Verdure'))
    const cucina = departments.find(d => d.name === 'Cucina')
    const frigorifero = conservationPoints.find(p => p.type === 'fridge')

    const sampleProducts: Product[] = [
      {
        id: generateId(),
        name: 'Petto di Pollo',
        category_id: carni?.id,
        department_id: cucina?.id,
        conservation_point_id: frigorifero?.id,
        quantity: 2.5,
        unit: 'kg',
        supplier_name: 'Carni Locali SRL',
        purchase_date: new Date().toISOString().split('T')[0],
        expiry_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active'
      },
      {
        id: generateId(),
        name: 'Salmone Fresco',
        category_id: pesce?.id,
        department_id: cucina?.id,
        conservation_point_id: frigorifero?.id,
        quantity: 1.8,
        unit: 'kg',
        allergens: ['Pesce'],
        supplier_name: 'Pescheria del Porto',
        purchase_date: new Date().toISOString().split('T')[0],
        expiry_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active'
      },
      {
        id: generateId(),
        name: 'Mozzarella di Bufala',
        category_id: latticini?.id,
        department_id: cucina?.id,
        conservation_point_id: frigorifero?.id,
        quantity: 10,
        unit: 'pz',
        allergens: ['Latte'],
        supplier_name: 'Caseificio Campano',
        purchase_date: new Date().toISOString().split('T')[0],
        expiry_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active'
      },
      {
        id: generateId(),
        name: 'Pomodori San Marzano',
        category_id: verdure?.id,
        department_id: cucina?.id,
        quantity: 3,
        unit: 'kg',
        supplier_name: 'Ortofrutta Napoletana',
        purchase_date: new Date().toISOString().split('T')[0],
        expiry_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active'
      },
      {
        id: generateId(),
        name: 'Olio Extravergine',
        quantity: 5,
        unit: 'l',
        supplier_name: 'Frantoio Toscano',
        purchase_date: new Date().toISOString().split('T')[0],
        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active'
      },
      {
        id: generateId(),
        name: 'Pasta di Grano Duro',
        quantity: 20,
        unit: 'conf',
        allergens: ['Glutine'],
        supplier_name: 'Pastificio Artigianale',
        purchase_date: new Date().toISOString().split('T')[0],
        expiry_date: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active'
      }
    ]
    setProducts(sampleProducts)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Gestione Inventario
        </h2>
        <p className="text-gray-600">
          Configura categorie prodotti e inventario iniziale per il controllo HACCP
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'categories'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Tag className="w-4 h-4 inline mr-2" />
          Categorie Prodotti
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'products'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Package className="w-4 h-4 inline mr-2" />
          Prodotti
        </button>
      </div>

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          {/* Quick Fill Button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={prefillSampleCategories}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              🚀 Carica categorie predefinite
            </button>
          </div>

          {/* Category Form */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4">
              {editingCategoryId ? 'Modifica Categoria' : 'Nuova Categoria Prodotto'}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Categoria *
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.category_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="es. Carni Fresche"
                  />
                  {errors.category_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.category_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Colore
                  </label>
                  <input
                    type="color"
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrizione
                </label>
                <input
                  type="text"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descrizione opzionale"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temp. Min (°C) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={categoryForm.temp_min}
                    onChange={(e) => setCategoryForm({ ...categoryForm, temp_min: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temp. Max (°C) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={categoryForm.temp_max}
                    onChange={(e) => setCategoryForm({ ...categoryForm, temp_max: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.temp_range && (
                    <p className="mt-1 text-sm text-red-600">{errors.temp_range}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Durata Max (giorni)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={categoryForm.max_storage_days}
                    onChange={(e) => setCategoryForm({ ...categoryForm, max_storage_days: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requires_blast_chilling"
                  checked={categoryForm.requires_blast_chilling}
                  onChange={(e) => setCategoryForm({ ...categoryForm, requires_blast_chilling: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="requires_blast_chilling" className="ml-2 text-sm text-gray-700">
                  Richiede abbattimento di temperatura
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                {editingCategoryId && (
                  <button
                    type="button"
                    onClick={resetCategoryForm}
                    className="px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Annulla
                  </button>
                )}
                <button
                  type="button"
                  onClick={editingCategoryId ? updateCategory : addCategory}
                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  {editingCategoryId ? (
                    <>
                      <Edit2 className="w-4 h-4" />
                      Aggiorna
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Aggiungi
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Categories List */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">
              Categorie Configurate ({categories.length})
            </h3>

            {categories.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Nessuna categoria configurata</p>
                <p className="text-sm text-gray-400">
                  Aggiungi categorie per organizzare i prodotti
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="border border-gray-200 rounded-lg p-4 bg-white"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <h4 className="font-medium text-gray-900">{category.name}</h4>
                        </div>
                        {category.description && (
                          <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                        )}
                        <div className="text-sm text-gray-500">
                          <p>Temperatura: {category.conservation_rules.temp_min}°C - {category.conservation_rules.temp_max}°C</p>
                          {category.conservation_rules.max_storage_days && (
                            <p>Durata max: {category.conservation_rules.max_storage_days} giorni</p>
                          )}
                          {category.conservation_rules.requires_blast_chilling && (
                            <p className="text-orange-600">⚡ Richiede abbattimento</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => startEditCategory(category)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Modifica categoria"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteCategory(category.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Elimina categoria"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Quick Fill Button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={prefillSampleProducts}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              🚀 Carica prodotti di esempio
            </button>
          </div>

          {/* Product Form */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4">
              {editingProductId ? 'Modifica Prodotto' : 'Nuovo Prodotto'}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Prodotto *
                  </label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.product_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="es. Petto di Pollo"
                  />
                  {errors.product_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.product_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Nessuna categoria</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reparto
                  </label>
                  <select
                    value={productForm.department_id}
                    onChange={(e) => setProductForm({ ...productForm, department_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Nessun reparto</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Punto di Conservazione
                  </label>
                  <select
                    value={productForm.conservation_point_id}
                    onChange={(e) => setProductForm({ ...productForm, conservation_point_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Nessun punto specifico</option>
                    {conservationPoints.map(point => (
                      <option key={point.id} value={point.id}>
                        {point.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantità
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={productForm.quantity}
                    onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.quantity ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  {errors.quantity && (
                    <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unità
                  </label>
                  <select
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {UNITS.map(unit => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stato
                  </label>
                  <select
                    value={productForm.status}
                    onChange={(e) => setProductForm({ ...productForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Attivo</option>
                    <option value="expired">Scaduto</option>
                    <option value="consumed">Consumato</option>
                    <option value="waste">Scarto</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fornitore
                  </label>
                  <input
                    type="text"
                    value={productForm.supplier_name}
                    onChange={(e) => setProductForm({ ...productForm, supplier_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome fornitore"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data Acquisto
                    </label>
                    <input
                      type="date"
                      value={productForm.purchase_date}
                      onChange={(e) => setProductForm({ ...productForm, purchase_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data Scadenza
                    </label>
                    <input
                      type="date"
                      value={productForm.expiry_date}
                      onChange={(e) => setProductForm({ ...productForm, expiry_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Allergens */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allergeni
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {ALLERGENS.map(allergen => (
                    <label
                      key={allergen}
                      className="flex items-center space-x-2 p-2 border rounded-md hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={productForm.allergens.includes(allergen)}
                        onChange={() => handleAllergenToggle(allergen)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{allergen}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note
                </label>
                <textarea
                  value={productForm.notes}
                  onChange={(e) => setProductForm({ ...productForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Note aggiuntive sul prodotto..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                {editingProductId && (
                  <button
                    type="button"
                    onClick={resetProductForm}
                    className="px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Annulla
                  </button>
                )}
                <button
                  type="button"
                  onClick={editingProductId ? updateProduct : addProduct}
                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  {editingProductId ? (
                    <>
                      <Edit2 className="w-4 h-4" />
                      Aggiorna
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Aggiungi
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Products List */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">
              Prodotti Configurati ({products.length})
            </h3>

            {products.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Nessun prodotto configurato</p>
                <p className="text-sm text-gray-400">
                  Aggiungi prodotti per gestire l'inventario
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {products.map((product) => {
                  const category = categories.find(c => c.id === product.category_id)
                  const department = departments.find(d => d.id === product.department_id)
                  const conservationPoint = conservationPoints.find(p => p.id === product.conservation_point_id)

                  return (
                    <div
                      key={product.id}
                      className="border border-gray-200 rounded-lg p-4 bg-white"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {category && (
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                            )}
                            <h4 className="font-medium text-gray-900">{product.name}</h4>
                            {product.quantity && (
                              <span className="text-sm text-gray-500">
                                {product.quantity} {product.unit}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 mb-2">
                            {category && (
                              <span className="flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                {category.name}
                              </span>
                            )}
                            {department && (
                              <span>{department.name}</span>
                            )}
                            {conservationPoint && (
                              <span>{conservationPoint.name}</span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2 text-xs">
                            {product.supplier_name && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                {product.supplier_name}
                              </span>
                            )}
                            {product.expiry_date && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Scad: {new Date(product.expiry_date).toLocaleDateString('it-IT')}
                              </span>
                            )}
                            {product.allergens && product.allergens.length > 0 && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full">
                                Allergeni: {product.allergens.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => startEditProduct(product)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="Modifica prodotto"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Elimina prodotto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* HACCP Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">
          ℹ️ Gestione Inventario HACCP
        </h3>
        <p className="text-sm text-blue-700">
          Le categorie prodotto definiscono le regole di conservazione specifiche.
          L'inventario è utilizzato per il controllo delle scadenze e la tracciabilità.
          Il sistema genererà automaticamente alert per i prodotti in scadenza
          e monitorerà la conformità delle temperature di conservazione.
        </p>
      </div>
    </div>
  )
}

export default InventoryStep