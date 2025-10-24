import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'
import {
  ExpiryAlert,
  ExpiredProduct,
  ExpiryStats,
  ReinsertExpiredProductRequest,
} from '@/types/inventory'

// Query keys
const QUERY_KEYS = {
  expiryAlerts: (companyId: string, daysAhead?: number) => [
    'expiryAlerts',
    companyId,
    daysAhead,
  ],
  expiredProducts: (companyId: string) => ['expiredProducts', companyId],
  expiryStats: (companyId: string) => ['expiryStats', companyId],
} as const

// Hook for expiry tracking
export const useExpiryTracking = (daysAhead: number = 7) => {
  const { user, companyId } = useAuth()
  const queryClient = useQueryClient()

  // Fetch products expiring soon
  const {
    data: expiryAlerts = [],
    isLoading: isLoadingAlerts,
    error: alertsError,
    refetch: refetchAlerts,
  } = useQuery({
    queryKey: QUERY_KEYS.expiryAlerts(companyId || '', daysAhead),
    queryFn: async (): Promise<ExpiryAlert[]> => {
      if (!companyId) {
        return []
      }

      const today = new Date()
      const futureDate = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000)

      const { data, error } = await supabase
        .from('products')
        .select('id, name, expiry_date')
        .eq('company_id', companyId)
        .eq('status', 'active')
        .gte('expiry_date', today.toISOString().split('T')[0])
        .lte('expiry_date', futureDate.toISOString().split('T')[0])
        .order('expiry_date', { ascending: true })

      if (error) {
        console.error('Error fetching expiry alerts:', error)
        throw error
      }

      return (data || []).map((product: any) => {
        const expiryDate = new Date(product.expiry_date)
        const daysUntilExpiry = Math.ceil(
          (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        )

        let alertLevel: 'critical' | 'warning' | 'expired'
        if (daysUntilExpiry <= 0) {
          alertLevel = 'expired'
        } else if (daysUntilExpiry <= 2) {
          alertLevel = 'critical'
        } else {
          alertLevel = 'warning'
        }

        return {
          product_id: product.id,
          product_name: product.name,
          expiry_date: expiryDate,
          days_until_expiry: daysUntilExpiry,
          alert_level: alertLevel,
        }
      })
    },
    enabled: !!companyId && !!user,
  })

  // Fetch expired products
  const {
    data: expiredProducts = [],
    isLoading: isLoadingExpired,
    error: expiredError,
    refetch: refetchExpired,
  } = useQuery({
    queryKey: QUERY_KEYS.expiredProducts(companyId || ''),
    queryFn: async (): Promise<ExpiredProduct[]> => {
      if (!companyId) {
        return []
      }

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_categories(id, name),
          departments(id, name),
          conservation_points(id, name)
        `)
        .eq('company_id', companyId)
        .eq('status', 'expired')
        .order('expiry_date', { ascending: true })

      if (error) {
        console.error('Error fetching expired products:', error)
        throw error
      }

      return (data || []).map((product: any) => ({
        id: product.id,
        company_id: product.company_id,
        name: product.name,
        category_id: product.category_id,
        department_id: product.department_id,
        quantity: product.quantity || 0,
        unit: product.unit || '',
        expiry_date: product.expiry_date ? new Date(product.expiry_date) : new Date(),
        status: product.status,
        compliance_status: product.compliance_status,
        allergens: product.allergens || [],
        label_photo_url: product.label_photo_url,
        notes: product.notes,
        temperature_requirements: product.temperature_requirements,
        expired_at: product.expired_at ? new Date(product.expired_at) : new Date(),
        reinsertion_count: product.reinsertion_count || 0,
        created_at: product.created_at ? new Date(product.created_at) : new Date(),
        updated_at: product.updated_at ? new Date(product.updated_at) : new Date(),
      }))
    },
    enabled: !!companyId && !!user,
  })

  // Fetch expiry statistics
  const { data: expiryStats } = useQuery({
    queryKey: QUERY_KEYS.expiryStats(companyId || ''),
    queryFn: async (): Promise<ExpiryStats> => {
      if (!companyId || !expiryAlerts) {
        return {
          total_expiring: 0,
          expiring_today: 0,
          expiring_this_week: 0,
          expired_count: 0,
          by_alert_level: {
            critical: 0,
            warning: 0,
            expired: 0,
          },
        }
      }

      const today = new Date()
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

      const expiringToday = expiryAlerts.filter(
        alert => alert.expiry_date < tomorrow
      ).length

      const expiringThisWeek = expiryAlerts.filter(
        alert => alert.expiry_date < nextWeek
      ).length

      const byAlertLevel = expiryAlerts.reduce(
        (acc, alert) => {
          acc[alert.alert_level] = (acc[alert.alert_level] || 0) + 1
          return acc
        },
        { critical: 0, warning: 0, expired: 0 } as Record<string, number>
      )

      return {
        total_expiring: expiryAlerts.length,
        expiring_today: expiringToday,
        expiring_this_week: expiringThisWeek,
        expired_count: expiredProducts.length,
        by_alert_level: byAlertLevel as { critical: number; warning: number; expired: number },
      }
    },
    enabled: !!companyId && !!user && !!expiryAlerts,
  })

  // Mark product as expired mutation
  const markAsExpiredMutation = useMutation({
    mutationFn: async (productId: string): Promise<void> => {
      if (!companyId) {
        throw new Error('No company ID available')
      }

      const { error } = await supabase
        .from('products')
        .update({
          status: 'expired',
          expired_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId)
        .eq('company_id', companyId)

      if (error) {
        console.error('Error marking product as expired:', error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.expiryAlerts(companyId || ''),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.expiredProducts(companyId || ''),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.expiryStats(companyId || ''),
      })
      queryClient.invalidateQueries({
        queryKey: ['products', companyId],
      })
      toast.success('Prodotto marcato come scaduto')
    },
    onError: (error: Error) => {
      console.error('Error marking product as expired:', error)
      toast.error('Errore nel marcare il prodotto come scaduto')
    },
  })

  // Reinsert expired product mutation
  const reinsertExpiredProductMutation = useMutation({
    mutationFn: async (
      request: ReinsertExpiredProductRequest
    ): Promise<void> => {
      // Get the expired product
      const { data: expiredProduct, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', request.expired_product_id)
        .eq('company_id', companyId)
        .single()

      if (fetchError) {
        console.error('Error fetching expired product:', fetchError)
        throw fetchError
      }

      // Create new product with updated expiry date
      const { error: insertError } = await supabase.from('products').insert({
        ...expiredProduct,
        id: undefined, // Let Supabase generate new ID
        expiry_date: request.new_expiry_date.toISOString().split('T')[0],
        quantity: request.new_quantity || expiredProduct.quantity,
        status: 'active',
        notes: request.notes || expiredProduct.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error('Error reinserting expired product:', insertError)
        throw insertError
      }

      // Update the original product status
      const { error: updateError } = await supabase
        .from('products')
        .update({
          status: 'expired',
          updated_at: new Date().toISOString(),
        })
        .eq('id', request.expired_product_id)
        .eq('company_id', companyId)

      if (updateError) {
        console.error('Error updating original product status:', updateError)
        throw updateError
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.expiredProducts(companyId || ''),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.expiryStats(companyId || ''),
      })
      toast.success('Prodotto reinserito con successo')
    },
    onError: (error: Error) => {
      console.error('Error reinserting expired product:', error)
      toast.error('Errore nel reinserimento del prodotto')
    },
  })

  return {
    // Data
    expiryAlerts,
    expiredProducts,
    expiryStats,
    isLoading: isLoadingAlerts || isLoadingExpired,
    error: alertsError || expiredError,

    // Actions
    markAsExpired: markAsExpiredMutation.mutate,
    reinsertExpiredProduct: reinsertExpiredProductMutation.mutate,

    // Mutation states
    isMarkingAsExpired: markAsExpiredMutation.isPending,
    isReinserting: reinsertExpiredProductMutation.isPending,

    // Utilities
    refetch: () => {
      refetchAlerts()
      refetchExpired()
    },
  }
}
