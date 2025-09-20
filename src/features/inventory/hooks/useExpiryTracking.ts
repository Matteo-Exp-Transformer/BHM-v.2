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
    queryKey: QUERY_KEYS.expiryAlerts(companyId, daysAhead),
    queryFn: async (): Promise<ExpiryAlert[]> => {
      if (!companyId) return []

      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + daysAhead)

      const { data, error } = await supabase
        .from('products')
        .select(
          `
          id,
          name,
          expiry_date,
          status
        `
        )
        .eq('company_id', companyId)
        .eq('status', 'active')
        .not('expiry_date', 'is', null)
        .lte('expiry_date', futureDate.toISOString().split('T')[0])
        .order('expiry_date')

      if (error) {
        console.error('Error fetching expiry alerts:', error)
        throw error
      }

      return (
        data?.map(product => {
          const expiryDate = new Date(product.expiry_date)
          const today = new Date()
          const daysUntilExpiry = Math.ceil(
            (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          )

          let alertLevel: ExpiryAlert['alert_level'] = 'warning'
          if (daysUntilExpiry <= 0) {
            alertLevel = 'expired'
          } else if (daysUntilExpiry <= 2) {
            alertLevel = 'critical'
          }

          return {
            product_id: product.id,
            product_name: product.name,
            expiry_date: expiryDate,
            days_until_expiry: daysUntilExpiry,
            alert_level: alertLevel,
          }
        }) || []
      )
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
    queryKey: QUERY_KEYS.expiredProducts(companyId),
    queryFn: async (): Promise<ExpiredProduct[]> => {
      if (!companyId) return []

      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('products')
        .select(
          `
          id,
          name,
          expiry_date,
          status,
          created_at,
          updated_at
        `
        )
        .eq('company_id', companyId)
        .eq('status', 'expired')
        .lt('expiry_date', today)
        .order('expiry_date')

      if (error) {
        console.error('Error fetching expired products:', error)
        throw error
      }

      return (
        data?.map(product => {
          const expiryDate = new Date(product.expiry_date)
          const today = new Date()
          const daysExpired = Math.ceil(
            (today.getTime() - expiryDate.getTime()) / (1000 * 60 * 60 * 24)
          )

          return {
            id: product.id,
            product_id: product.id,
            product_name: product.name,
            expiry_date: expiryDate,
            days_expired: daysExpired,
            status: 'pending_disposal' as const,
            reinsertion_count: 0,
            created_at: new Date(product.created_at),
            updated_at: new Date(product.updated_at),
          }
        }) || []
      )
    },
    enabled: !!companyId && !!user,
  })

  // Fetch expiry statistics
  const { data: expiryStats } = useQuery({
    queryKey: QUERY_KEYS.expiryStats(companyId),
    queryFn: async (): Promise<ExpiryStats> => {
      if (!companyId) return getEmptyExpiryStats()

      const today = new Date()
      const weekFromNow = new Date()
      weekFromNow.setDate(today.getDate() + 7)

      const [expiringResult, expiredResult] = await Promise.all([
        supabase
          .from('products')
          .select('expiry_date')
          .eq('company_id', companyId)
          .eq('status', 'active')
          .not('expiry_date', 'is', null)
          .lte('expiry_date', weekFromNow.toISOString().split('T')[0]),
        supabase
          .from('products')
          .select('expiry_date')
          .eq('company_id', companyId)
          .eq('status', 'expired')
          .lt('expiry_date', today.toISOString().split('T')[0]),
      ])

      if (expiringResult.error) throw expiringResult.error
      if (expiredResult.error) throw expiredResult.error

      const expiringProducts = expiringResult.data || []
      const expiredProducts = expiredResult.data || []

      // Calculate statistics
      const stats: ExpiryStats = {
        total_expiring: expiringProducts.length,
        expiring_today: 0,
        expiring_this_week: expiringProducts.length,
        expired_count: expiredProducts.length,
        by_alert_level: {
          warning: 0,
          critical: 0,
          expired: expiredProducts.length,
        },
      }

      // Count by alert level
      expiringProducts.forEach(product => {
        const expiryDate = new Date(product.expiry_date)
        const daysUntilExpiry = Math.ceil(
          (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (daysUntilExpiry === 0) {
          stats.expiring_today++
        }

        if (daysUntilExpiry <= 2) {
          stats.by_alert_level.critical++
        } else {
          stats.by_alert_level.warning++
        }
      })

      return stats
    },
    enabled: !!companyId && !!user,
  })

  // Mark product as expired mutation
  const markAsExpiredMutation = useMutation({
    mutationFn: async (productId: string): Promise<void> => {
      const { error } = await supabase
        .from('products')
        .update({
          status: 'expired',
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
        queryKey: QUERY_KEYS.expiryAlerts(companyId),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.expiredProducts(companyId),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.expiryStats(companyId),
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
          status: 'consumed',
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
        queryKey: QUERY_KEYS.expiredProducts(companyId),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.expiryStats(companyId),
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

// Helper function for empty expiry stats
const getEmptyExpiryStats = (): ExpiryStats => ({
  total_expiring: 0,
  expiring_today: 0,
  expiring_this_week: 0,
  expired_count: 0,
  by_alert_level: {
    warning: 0,
    critical: 0,
    expired: 0,
  },
})
