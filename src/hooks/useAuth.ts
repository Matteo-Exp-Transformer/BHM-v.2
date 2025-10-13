/**
 * 🔐 useAuth Hook - Supabase Auth + Multi-Company
 * 
 * Hook principale per autenticazione con Supabase Auth
 * Sostituisce completamente Clerk con supporto multi-company
 * 
 * @author BHM v2 Team - Post Migrazione NoClerk
 * @date 2025-01-09
 */

import { useEffect, useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { activityTrackingService } from '@/services/activityTrackingService'

// =============================================
// TYPES & INTERFACES
// =============================================

// Role types (allineati con database CHECK constraint)
export type UserRole =
  | 'admin'
  | 'responsabile'
  | 'dipendente'
  | 'collaboratore'
  | 'guest'

// Permission interface
export interface UserPermissions {
  canManageStaff: boolean // admin, responsabile
  canManageDepartments: boolean // admin, responsabile
  canViewAllTasks: boolean // admin, responsabile
  canManageConservation: boolean // admin, responsabile
  canExportData: boolean // admin only
  canManageSettings: boolean // admin only
}

// Company membership (da tabella company_members)
interface CompanyMembership {
  company_id: string
  company_name: string
  role: UserRole
  staff_id: string | null
  is_active: boolean
}

// User session (da tabella user_sessions)
interface UserSession {
  user_id: string
  active_company_id: string | null
  last_activity: string
}

// =============================================
// PERMISSION MAPPING
// =============================================

const getPermissionsFromRole = (role: UserRole): UserPermissions => {
  switch (role) {
    case 'admin':
      return {
        canManageStaff: true,
        canManageDepartments: true,
        canViewAllTasks: true,
        canManageConservation: true,
        canExportData: true,
        canManageSettings: true,
      }
    case 'responsabile':
      return {
        canManageStaff: true,
        canManageDepartments: true,
        canViewAllTasks: true,
        canManageConservation: true,
        canExportData: false,
        canManageSettings: false,
      }
    case 'dipendente':
    case 'collaboratore':
      return {
        canManageStaff: false,
        canManageDepartments: false,
        canViewAllTasks: false,
        canManageConservation: false,
        canExportData: false,
        canManageSettings: false,
      }
    case 'guest':
    default:
      return {
        canManageStaff: false,
        canManageDepartments: false,
        canViewAllTasks: false,
        canManageConservation: false,
        canExportData: false,
        canManageSettings: false,
      }
  }
}

// =============================================
// MAIN HOOK
// =============================================

export const useAuth = () => {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

  // =============================================
  // 1. Auth State Listener (Supabase Session)
  // =============================================

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      setIsLoading(false)

      if (event === 'SIGNED_IN' && session?.user) {
        const companyId = localStorage.getItem('active_company_id')
        if (companyId) {
          const sessionResult = await activityTrackingService.startSession(
            session.user.id,
            companyId
          )
          if (sessionResult.success && sessionResult.data) {
            setCurrentSessionId(sessionResult.data.id)
          }
        }
      }

      if (event === 'SIGNED_OUT') {
        if (currentSessionId) {
          await activityTrackingService.endSession(currentSessionId, 'manual')
          setCurrentSessionId(null)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [currentSessionId])

  // =============================================
  // 2. Fetch User Profile
  // =============================================

  const {
    data: userProfile,
    isLoading: profileLoading,
  } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null

      console.log('🔗 Supabase: Caricamento user profile...')
      console.log('📊 User ID:', user.id)

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('auth_user_id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('⚠️ Supabase: User profile non trovato (PGRST116), ritorno null')
          return null
        }
        console.error('❌ Supabase: Errore caricamento user profile:', error)
        console.error('❌ Error details:', { code: error.code, message: error.message, details: error.details })
        return null
      }

      console.log(`✅ Supabase: User profile caricato:`, data)
      return data
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minuti
  })

  // =============================================
  // 3. Fetch User Companies (da company_members)
  // =============================================

  const {
    data: companies = [],
    isLoading: companiesLoading,
    error: companiesError,
  } = useQuery({
    queryKey: ['user-companies', user?.id],
    queryFn: async (): Promise<CompanyMembership[]> => {
      if (!user?.id) return []

      console.log('🔗 Supabase: Caricamento companies...')
      console.log('📊 User ID:', user.id)

      const { data, error } = await supabase
        .from('company_members')
        .select(
          `
          company_id,
          role,
          staff_id,
          is_active,
          companies (
            name
          )
        `
        )
        .eq('user_id', user.id)
        .eq('is_active', true)

      if (error) {
        console.error('❌ Errore caricamento companies:', error)
        console.error('❌ Error details:', { code: error.code, message: error.message })
        return [] // Ritorna array vuoto invece di throw
      }

      console.log('✅ Companies caricate:', data?.length || 0)
      console.log('📊 Companies data:', data)

      return (data || []).map(m => ({
        company_id: m.company_id,
        company_name: (m.companies as any)?.name || 'Unknown',
        role: m.role as UserRole,
        staff_id: m.staff_id,
        is_active: m.is_active,
      }))
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minuti
  })

  // =============================================
  // 3. Fetch/Create User Session (active company)
  // =============================================

  const {
    data: session,
    isLoading: sessionLoading,
    refetch: refetchSession,
  } = useQuery({
    queryKey: ['user-session', user?.id],
    queryFn: async (): Promise<UserSession | null> => {
      if (!user?.id) return null

      console.log('🔗 Supabase: Caricamento user session...')
      console.log('📊 User ID:', user.id)

      // Prova a ottenere sessione esistente
      let { data: existing, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Errore caricamento sessione:', error)
        console.error('❌ Error details:', { code: error.code, message: error.message })
        return null // Ritorna null invece di throw
      }

      // Se sessione esiste, ritornala
      if (existing) {
        console.log('✅ User session trovata:', existing)
        return existing as UserSession
      }

      console.log('⚠️ User session non trovata, creando...')

      // Se non esiste, creala con prima company disponibile
      if (companies.length > 0) {
        const { data: newSession, error: createError } = await supabase
          .from('user_sessions')
          .insert({
            user_id: user.id,
            active_company_id: companies[0].company_id,
          })
          .select()
          .single()

        if (createError) {
          console.error('❌ Errore creazione sessione:', createError)
          throw createError
        }

        // Start activity tracking session
        const sessionResult = await activityTrackingService.startSession(
          user.id,
          companies[0].company_id
        )
        if (sessionResult.success && sessionResult.data) {
          setCurrentSessionId(sessionResult.data.id)
        }

        return newSession as UserSession
      }

      // Utente senza aziende
      return null
    },
    enabled: !!user?.id && companies.length > 0,
    staleTime: 5 * 60 * 1000,
  })

  // =============================================
  // 4. Get Current Company Membership
  // =============================================

  const currentMembership = companies.find(
    c => c.company_id === session?.active_company_id
  )

  // =============================================
  // 5. Switch Company Mutation
  // =============================================

  const switchCompanyMutation = useMutation({
    mutationFn: async (newCompanyId: string) => {
      if (!user?.id) throw new Error('Non autenticato')

      // Verifica che l'utente sia membro di questa company
      const isMember = companies.some(c => c.company_id === newCompanyId)
      if (!isMember) {
        throw new Error('Non sei membro di questa azienda')
      }

      const { error } = await supabase
        .from('user_sessions')
        .update({
          active_company_id: newCompanyId,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (error) throw error

      return newCompanyId
    },
    onSuccess: () => {
      // Invalida cache sessione
      queryClient.invalidateQueries({ queryKey: ['user-session'] })
      // Invalida TUTTE le query per ricaricare dati nuova company
      queryClient.invalidateQueries()
    },
  })

  // =============================================
  // 6. Permissions & Role Checks
  // =============================================

  const userRole: UserRole = currentMembership?.role || 'guest'
  const permissions = getPermissionsFromRole(userRole)

  const hasManagementRole =
    userRole === 'admin' || userRole === 'responsabile'

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    return permissions[permission]
  }

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(userRole)
  }

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.some(role => userRole === role)
  }

  const isAuthorized = userRole !== 'guest'

  // =============================================
  // 7. User Display Name
  // =============================================

  const displayName =
    user?.user_metadata?.first_name && user?.user_metadata?.last_name
      ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
      : user?.user_metadata?.full_name ||
        user?.email ||
        'User'

  // =============================================
  // 8. Auth Methods
  // =============================================

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  const signUp = async (
    email: string,
    password: string,
    metadata?: { first_name?: string; last_name?: string }
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          ...metadata,
          full_name:
            metadata?.first_name && metadata?.last_name
              ? `${metadata.first_name} ${metadata.last_name}`
              : email,
        },
      },
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    if (currentSessionId) {
      await activityTrackingService.endSession(currentSessionId, 'manual')
      setCurrentSessionId(null)
    }

    const { error } = await supabase.auth.signOut()
    if (error) throw error

    // Clear all cache
    queryClient.clear()

    return true
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
    return true
  }

  // =============================================
  // 9. Last Activity Update (every 5 minutes)
  // =============================================

  useEffect(() => {
    if (!user?.id || !session?.active_company_id) return

    const updateActivity = async () => {
      if (currentSessionId) {
        await activityTrackingService.updateLastActivity(currentSessionId)
      }
    }

    const interval = setInterval(updateActivity, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [user?.id, session?.active_company_id, currentSessionId])

  // =============================================
  // 10. Loading States
  // =============================================

  const isAuthLoading = isLoading || companiesLoading || sessionLoading
  const isAuthenticated = !!user && !!currentMembership

  // =============================================
  // 11. Error Handling
  // =============================================

  const authError = companiesError
    ? 'Failed to load user companies'
    : null

  // =============================================
  // RETURN (API Compatible con vecchio useAuth)
  // =============================================

  return {
    // Loading states
    isLoading: isAuthLoading || profileLoading,
    isClerkLoaded: true, // Compatibility - sempre true con Supabase
    isProfileLoading: companiesLoading,

    // Authentication status
    isSignedIn: !!user,
    isAuthenticated,
    isAuthorized,

    // User data
    user,
    userId: user?.id || null,
    userProfile: userProfile || null, // ✅ ORA CARICATO DAL DATABASE
    userRole,
    permissions,
    displayName,
    companyId: session?.active_company_id || null,
    sessionId: currentSessionId,

    // Multi-company (NUOVO)
    companies,
    activeCompanyId: session?.active_company_id || null,
    currentMembership,
    switchCompany: switchCompanyMutation.mutate,
    isSwitchingCompany: switchCompanyMutation.isPending,

    // Helper functions
    hasPermission,
    hasRole,
    hasAnyRole,
    hasManagementRole,

    // Auth actions (NUOVO)
    signIn,
    signUp,
    signOut,
    resetPassword,

    // Actions
    refetchProfile: refetchSession, // Compatibility

    // Error handling
    authError,
  }
}

// =============================================
// PERMISSION-BASED HELPER HOOKS
// =============================================

export const usePermission = (permission: keyof UserPermissions) => {
  const { hasPermission, isLoading } = useAuth()
  return { hasPermission: hasPermission(permission), isLoading }
}

export const useRole = (roles: UserRole | UserRole[]) => {
  const { hasRole, isLoading } = useAuth()
  return { hasRole: hasRole(roles), isLoading }
}

export default useAuth
