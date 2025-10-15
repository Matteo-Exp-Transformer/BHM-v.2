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
import { activityTrackingService } from '@/services/activityTrackingService'

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
  const { user, companyId, sessionId } = useAuth()
  const queryClient = useQueryClient()

  // Fetch products with filters

  const transformProductRecord = (record: any): Product => {
    return {
      id: record.id,
      company_id: record.company_id,
      name: record.name,
      category_id: record.category_id ?? undefined,
      category_name: record.product_categories?.name ?? undefined,
      department_id: record.department_id ?? undefined,
      department_name: record.departments?.name ?? undefined,
      conservation_point_id: record.conservation_point_id ?? undefined,
      conservation_point_name: record.conservation_points?.name ?? undefined,
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
        console.warn('⚠️ No company_id available, cannot load products')
        throw new Error('No company ID available')
      }

      const { data, error } = await supabase
        .from('products')
        .select(
          `
          *,
          product_categories(id, name),
          departments(id, name),
          conservation_points(id, name)
        `
        )
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Supabase: Errore caricamento prodotti:', error)
        throw error
      }

      const transformed = (data || []).map(transformProductRecord)
      const count = transformed.length
      console.log(`✅ Supabase: ${count} prodotto${count !== 1 ? 'i' : ''} caricato${count !== 1 ? 'i' : ''}`)
      return transformed
    },
    enabled: !!companyId && !!user,
  })

  // Fetch product statistics
  const { data: stats } = useQuery({
    queryKey: QUERY_KEYS.productStats(companyId || ''),
    queryFn: async (): Promise<InventoryStats> => {
      if (!companyId || !products) {
        console.warn('⚠️ Cannot compute stats: no company_id or products')
        throw new Error('No company ID or products available')
      }


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

      const product = transformProductRecord(data)

      if (user?.id && companyId) {
        await activityTrackingService.logActivity(
          user.id,
          companyId,
          'product_added',
          {
            product_id: product.id,
            product_name: product.name,
            category_id: product.category_id,
            department_id: product.department_id,
            quantity: product.quantity,
            unit: product.unit,
          },
          {
            sessionId: sessionId || undefined,
            entityType: 'product',
            entityId: product.id,
          }
        )
      }

      return product
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

      const product = transformProductRecord(data)

      if (user?.id && companyId) {
        await activityTrackingService.logActivity(
          user.id,
          companyId,
          'product_updated',
          {
            product_id: product.id,
            product_name: product.name,
            category_id: product.category_id,
            department_id: product.department_id,
            status: product.status,
          },
          {
            sessionId: sessionId || undefined,
            entityType: 'product',
            entityId: product.id,
          }
        )
      }

      return product
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
      const product = products.find(p => p.id === productId)

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('company_id', companyId)

      if (error) {
        console.error('Error deleting product:', error)
        throw error
      }

      if (user?.id && companyId && product) {
        await activityTrackingService.logActivity(
          user.id,
          companyId,
          'product_deleted',
          {
            product_id: productId,
            product_name: product.name,
            category_id: product.category_id,
            department_id: product.department_id,
          },
          {
            sessionId: sessionId || undefined,
            entityType: 'product',
            entityId: productId,
          }
        )
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

  // Transfer product mutation (Agent 1 - Backend Specialist)
  const transferProductMutation = useMutation({
    mutationFn: async ({
      productId,
      fromConservationPointId,
      toConservationPointId,
      transferReason,
      transferNotes,
      authorizedById,
    }: {
      productId: string
      fromConservationPointId: string
      toConservationPointId: string
      transferReason: string
      transferNotes?: string
      authorizedById: string
    }): Promise<Product> => {
      if (!companyId || !user) throw new Error('No company or user')

      // 1. Get product details BEFORE update
      const product = products.find(p => p.id === productId)
      if (!product) throw new Error('Product not found')

      // 2. Get from/to conservation points with department info
      const { data: fromPoint, error: fromError } = await supabase
        .from('conservation_points')
        .select('id, name, department_id, departments(id, name)')
        .eq('id', fromConservationPointId)
        .single()

      if (fromError || !fromPoint) {
        console.error('Error fetching from conservation point:', fromError)
        throw new Error('From conservation point not found')
      }

      const { data: toPoint, error: toError } = await supabase
        .from('conservation_points')
        .select('id, name, department_id, departments(id, name)')
        .eq('id', toConservationPointId)
        .single()

      if (toError || !toPoint) {
        console.error('Error fetching to conservation point:', toError)
        throw new Error('To conservation point not found')
      }

      // 3. Get authorized user info
      const { data: authorizedUser, error: userError } = await supabase
        .from('staff')
        .select('id, name')
        .eq('id', authorizedById)
        .single()

      if (userError) {
        console.warn('Could not fetch authorized user:', userError)
      }

      // 4. Update product location
      const { data: updatedProduct, error: updateError } = await supabase
        .from('products')
        .update({
          conservation_point_id: toConservationPointId,
          department_id: toPoint.department_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId)
        .eq('company_id', companyId)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating product:', updateError)
        throw updateError
      }

      // 5. Log transfer activity
      if (user?.id && companyId) {
        await activityTrackingService.logActivity(
          user.id,
          companyId,
          'product_transferred',
          {
            product_id: productId,
            product_name: product.name,
            from_conservation_point_id: fromConservationPointId,
            from_conservation_point_name: fromPoint.name,
            to_conservation_point_id: toConservationPointId,
            to_conservation_point_name: toPoint.name,
            from_department_id: fromPoint.department_id,
            from_department_name: (fromPoint.departments as any)?.name || 'N/A',
            to_department_id: toPoint.department_id,
            to_department_name: (toPoint.departments as any)?.name || 'N/A',
            quantity_transferred: product.quantity,
            unit: product.unit,
            transfer_reason: transferReason,
            transfer_notes: transferNotes || undefined,
            authorized_by_id: authorizedById,
            authorized_by_name: authorizedUser?.name || 'N/A',
          },
          {
            sessionId: sessionId || undefined,
            entityType: 'product',
            entityId: productId,
          }
        )
      }

      return transformProductRecord(updatedProduct)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.products(companyId || ''),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.productStats(companyId || ''),
      })
      toast.success('Prodotto trasferito con successo')
    },
    onError: (error: Error) => {
      console.error('Error transferring product:', error)
      toast.error('Errore nel trasferimento del prodotto')
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
    transferProduct: transferProductMutation.mutate,

    // Mutation states
    isCreating: createProductMutation.isPending,
    isUpdating: updateProductMutation.isPending,
    isDeleting: deleteProductMutation.isPending,
    isUpdatingStatus: updateProductStatusMutation.isPending,
    isTransferring: transferProductMutation.isPending,

    // Utilities
    refetch,
  }
}
