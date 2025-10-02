import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'
import {
  Product,
  CreateProductForm,
  ProductSearchParams,
  InventoryStats,
  ProductFilters,
  AllergenType,
} from '@/types/inventory'

// Query keys
const QUERY_KEYS = {
  products: (companyId: string, filters?: ProductFilters) => [
    'products',
    companyId,
    filters,
  ],
  product: (id: string) => ['product', id],
  productStats: (companyId: string) => ['productStats', companyId],
  expiringProducts: (companyId: string) => ['expiringProducts', companyId],
  expiredProducts: (companyId: string) => ['expiredProducts', companyId],
} as const

// Hook for products management
export const useProducts = (searchParams?: ProductSearchParams) => {
  const { user, companyId } = useAuth()
  const queryClient = useQueryClient()

  // Fetch products with filters
  // TEMPORARY: Mock data until database is fixed
  const mockProducts: Product[] = [
    {
      id: '1',
      company_id: companyId || '',
      name: 'Latte Fresco Intero',
      category_id: 'cat1',
      department_id: 'dept1',
      conservation_point_id: 'cp1',
      barcode: '1234567890123',
      supplier_name: 'Latteria Centrale',
      purchase_date: new Date('2025-09-15'),
      expiry_date: new Date('2025-09-28'),
      quantity: 10.0,
      unit: 'litri',
      allergens: [AllergenType.LATTE],
      status: 'active',
      notes: 'Prodotto fresco di alta qualità',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: '2',
      company_id: companyId || '',
      name: 'Parmigiano Reggiano 24 mesi',
      category_id: 'cat1',
      department_id: 'dept1',
      conservation_point_id: 'cp1',
      supplier_name: 'Caseificio Emiliano',
      purchase_date: new Date('2025-09-10'),
      expiry_date: new Date('2025-12-15'),
      quantity: 2.5,
      unit: 'kg',
      allergens: [AllergenType.LATTE],
      status: 'active',
      notes: 'Stagionato 24 mesi, qualità DOP',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: '3',
      company_id: companyId || '',
      name: 'Latte Scaduto',
      category_id: 'cat1',
      department_id: 'dept1',
      conservation_point_id: 'cp1',
      supplier_name: 'Latteria Centrale',
      purchase_date: new Date('2025-09-01'),
      expiry_date: new Date('2025-09-19'),
      quantity: 1.0,
      unit: 'litri',
      allergens: [AllergenType.LATTE],
      status: 'expired',
      notes: 'Prodotto scaduto da rimuovere',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]

  const transformProductRecord = (record: any): Product => {
    return {
      id: record.id,
      company_id: record.company_id,
      name: record.name,
      category_id: record.category_id ?? undefined,
      department_id: record.department_id ?? undefined,
      conservation_point_id: record.conservation_point_id ?? undefined,
      barcode: record.barcode ?? undefined,
      sku: record.sku ?? undefined,
      supplier_name: record.supplier_name ?? undefined,
      purchase_date: record.purchase_date
        ? new Date(record.purchase_date)
        : undefined,
      expiry_date: record.expiry_date
        ? new Date(record.expiry_date)
        : undefined,
      quantity:
        record.quantity === null || record.quantity === undefined
          ? undefined
          : Number(record.quantity),
      unit: record.unit ?? undefined,
      allergens: Array.isArray(record.allergens)
        ? (record.allergens as AllergenType[])
        : [],
      label_photo_url: record.label_photo_url ?? undefined,
      notes: record.notes ?? undefined,
      status: record.status,
      compliance_status: record.compliance_status ?? undefined,
      created_at: record.created_at ? new Date(record.created_at) : new Date(),
      updated_at: record.updated_at ? new Date(record.updated_at) : new Date(),
    }
  }

  const {
    data: products = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Product[]>({
    queryKey: QUERY_KEYS.products(companyId || '', searchParams?.filters),
    queryFn: async (): Promise<Product[]> => {
      if (!companyId) {
        console.log('🔧 No company_id, using mock data for products')
        return mockProducts
      }

      console.log('🔧 Loading products from Supabase for company:', companyId)
      const { data, error } = await supabase
        .from('products')
        .select(
          `
          *,
          category:product_categories(id, name, color),
          department:departments(id, name),
          conservation_point:conservation_points(id, name)
        `
        )
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading products:', error)
        // Fallback to mock data if there's an error
        console.log('🔧 Fallback to mock data due to error')
        return mockProducts
      }

      const transformed = (data || []).map(transformProductRecord)
      console.log('✅ Loaded products from Supabase:', transformed.length)
      return transformed
    },
    enabled: !!companyId && !!user,
  })

  // Fetch product statistics
  const { data: stats } = useQuery({
    queryKey: QUERY_KEYS.productStats(companyId || ''),
    queryFn: async (): Promise<InventoryStats> => {
      if (!companyId || !products) {
        console.log('🔧 Using mock stats for products - no data available')
        return {
          total_products: 3,
          active_products: 2,
          expiring_soon: 1,
          expired: 1,
          by_category: { Latticini: 3 },
          by_department: { Cucina: 3 },
          by_status: { active: 2, expired: 1, consumed: 0, waste: 0 },
          compliance_rate: 85,
        }
      }

      console.log('🔧 Computing product stats from loaded data')

      // Compute stats from actual products data
      const now = new Date()
      const soon = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 days from now

      const stats: InventoryStats = {
        total_products: products.length,
        active_products: products.filter(
          (product: Product) => product.status === 'active'
        ).length,
        expiring_soon: products.filter((product: Product) => {
          if (!product.expiry_date) return false
          return (
            product.status === 'active' &&
            product.expiry_date <= soon &&
            product.expiry_date > now
          )
        }).length,
        expired: products.filter((product: Product) => {
          if (!product.expiry_date) return product.status === 'expired'
          return product.expiry_date <= now || product.status === 'expired'
        }).length,
        by_category: products.reduce<Record<string, number>>(
          (acc, product: Product) => {
            if (product.category_id) {
              acc[product.category_id] = (acc[product.category_id] || 0) + 1
            }
            return acc
          },
          {}
        ),
        by_department: products.reduce<Record<string, number>>(
          (acc, product: Product) => {
            if (product.department_id) {
              acc[product.department_id] = (acc[product.department_id] || 0) + 1
            }
            return acc
          },
          {}
        ),
        by_status: {
          active: products.filter(
            (product: Product) => product.status === 'active'
          ).length,
          expired: products.filter(
            (product: Product) => product.status === 'expired'
          ).length,
          consumed: products.filter(
            (product: Product) => product.status === 'consumed'
          ).length,
          waste: products.filter(
            (product: Product) => product.status === 'waste'
          ).length,
        },
        compliance_rate: Math.round(
          (products.filter((product: Product) => product.status === 'active')
            .length /
            Math.max(products.length, 1)) *
            100
        ),
      }

      return stats
    },
    enabled: !!companyId && !!user && !!products,
  })

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (productData: CreateProductForm): Promise<Product> => {
      const payload = {
        ...productData,
        company_id: companyId,
        allergens: productData.allergens || [],
        purchase_date: productData.purchase_date
          ? productData.purchase_date.toISOString()
          : null,
        expiry_date: productData.expiry_date
          ? productData.expiry_date.toISOString()
          : null,
      }

      const { data, error } = await supabase
        .from('products')
        .insert(payload)
        .select()
        .single()

      if (error) {
        console.error('Error creating product:', error)
        throw error
      }

      return transformProductRecord(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.products(companyId || ''),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.productStats(companyId || ''),
      })
      toast.success('Prodotto creato con successo')
    },
    onError: (error: Error) => {
      console.error('Error creating product:', error)
      toast.error('Errore nella creazione del prodotto')
    },
  })

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({
      id,
      ...productData
    }: CreateProductForm & { id: string }): Promise<Product> => {
      const payload = {
        ...productData,
        allergens: productData.allergens || [],
        updated_at: new Date().toISOString(),
        purchase_date: productData.purchase_date
          ? productData.purchase_date.toISOString()
          : null,
        expiry_date: productData.expiry_date
          ? productData.expiry_date.toISOString()
          : null,
      }

      const { data, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', id)
        .eq('company_id', companyId)
        .select()
        .single()

      if (error) {
        console.error('Error updating product:', error)
        throw error
      }

      return transformProductRecord(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.products(companyId || ''),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.productStats(companyId || ''),
      })
      toast.success('Prodotto aggiornato con successo')
    },
    onError: (error: Error) => {
      console.error('Error updating product:', error)
      toast.error("Errore nell'aggiornamento del prodotto")
    },
  })

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string): Promise<void> => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('company_id', companyId)

      if (error) {
        console.error('Error deleting product:', error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.products(companyId || ''),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.productStats(companyId || ''),
      })
      toast.success('Prodotto eliminato con successo')
    },
    onError: (error: Error) => {
      console.error('Error deleting product:', error)
      toast.error("Errore nell'eliminazione del prodotto")
    },
  })

  // Update product status mutation
  const updateProductStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string
      status: Product['status']
    }): Promise<Product> => {
      const { data, error } = await supabase
        .from('products')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('company_id', companyId)
        .select()
        .single()

      if (error) {
        console.error('Error updating product status:', error)
        throw error
      }

      return transformProductRecord(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.products(companyId || ''),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.productStats(companyId || ''),
      })
      toast.success('Stato prodotto aggiornato')
    },
    onError: (error: Error) => {
      console.error('Error updating product status:', error)
      toast.error("Errore nell'aggiornamento dello stato")
    },
  })

  return {
    // Data
    products,
    stats,
    isLoading,
    error,

    // Actions
    createProduct: createProductMutation.mutate,
    updateProduct: updateProductMutation.mutate,
    deleteProduct: deleteProductMutation.mutate,
    updateProductStatus: updateProductStatusMutation.mutate,

    // Mutation states
    isCreating: createProductMutation.isPending,
    isUpdating: updateProductMutation.isPending,
    isDeleting: deleteProductMutation.isPending,
    isUpdatingStatus: updateProductStatusMutation.isPending,

    // Utilities
    refetch,
  }
}
