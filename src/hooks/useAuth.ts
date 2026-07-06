/**
 * 🔐 useAuth Hook - Supabase Auth + Multi-Company
 * 
 * Hook principale per autenticazione con Supabase Auth
 * Sostituisce completamente Clerk con supporto multi-company
 * 
 * @author BHM v2 Team - Post Migrazione NoClerk
 * @date 2025-01-09
 */

import { useEffect, useState, useSyncExternalStore } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { subscribeAuthSession, getAuthSnapshot } from '@/lib/supabase/authSessionManager'
import { activityTrackingService } from '@/services/activityTrackingService'
import { rememberMeService } from '@/services/auth/RememberMeService'

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
  id?: string
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
  const authState = useSyncExternalStore(
    subscribeAuthSession,
    getAuthSnapshot,
    getAuthSnapshot
  )
  const user = authState.user
  const isLoading = authState.isLoading
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

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

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('auth_user_id', user.id)
        .maybeSingle()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        if (error.code === 'PGRST301' || error.message?.includes('406') || error.message?.includes('JWT')) {
          console.warn('⚠️ Errore autenticazione durante fetch user profile - sessione potrebbe essere scaduta')
          return null
        }
        console.error('❌ Supabase: Errore caricamento user profile:', error)
        return null
      }

      if (data) {
        console.log(`✅ Supabase: User profile caricato:`, data)
      }
      return data
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minuti
    retry: (failureCount, error: any) => {
      // Non riprovare se è un errore di autenticazione (406, JWT, ecc.)
      if (error?.code === 'PGRST301' || error?.message?.includes('406') || error?.message?.includes('JWT')) {
        return false
      }
      return failureCount < 2
    },
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


      return (data || []).map((m: any) => ({
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
  // Decision #15: Multi-Company Preferences
  // =============================================

  const {
    data: session,
    refetch: refetchSession,
  } = useQuery({
    queryKey: ['user-session', user?.id],
    queryFn: async (): Promise<UserSession | null> => {
      if (!user?.id) return null


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
        if (existing.id) {
          setCurrentSessionId(existing.id)
        }
        return existing as UserSession
      }

      console.log('⚠️ User session non trovata, creando...')

      // Se non esiste, creala con logica preferenza
      if (companies.length > 0) {
        // Decision #15: Check se user ha preferenza impostata
        const { data: userPrefs } = await supabase
          .from('user_preferences')
          .select('preferred_company_id')
          .eq('user_id', user.id)
          .single()

        // Logica preferenza: preferita > ultima usata > prima disponibile
        const activeCompanyId = userPrefs?.preferred_company_id || companies[0].company_id

        const { data: newSession, error: createError } = await supabase
          .from('user_sessions')
          .insert({
            user_id: user.id,
            active_company_id: activeCompanyId,
          })
          .select()
          .single()

        if (createError) {
          console.error('❌ Errore creazione sessione:', createError)
          // Sessione già esistente (unique user_id) — rileggi
          if (createError.code === '23505') {
            const { data: existingAfterConflict } = await supabase
              .from('user_sessions')
              .select('*')
              .eq('user_id', user.id)
              .single()
            return (existingAfterConflict as UserSession) ?? null
          }
          return null
        }

        // Aggiorna activity tracking sulla sessione esistente
        const sessionResult = await activityTrackingService.startSession(
          user.id,
          activeCompanyId
        )
        if (sessionResult.success && sessionResult.sessionId) {
          setCurrentSessionId(sessionResult.sessionId)
        }

        const { data: createdOrExisting } = await supabase
          .from('user_sessions')
          .select('*')
          .eq('user_id', user.id)
          .single()

        return (createdOrExisting as UserSession) ?? (newSession as UserSession)
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

  const activeCompanyId =
    session?.active_company_id ?? companies[0]?.company_id ?? null

  const currentMembership =
    companies.find((c) => c.company_id === activeCompanyId) ?? companies[0]

  // =============================================
  // 5. Switch Company Mutation
  // Decision #15: Multi-Company Preferences
  // =============================================

  const switchCompanyMutation = useMutation({
    mutationFn: async (newCompanyId: string) => {
      if (!user?.id) throw new Error('Non autenticato')

      // Verifica che l'utente sia membro di questa company
      const isMember = companies.some(c => c.company_id === newCompanyId)
      if (!isMember) {
        throw new Error('Non sei membro di questa azienda')
      }

      // Update session
      const { error } = await supabase
        .from('user_sessions')
        .update({
          active_company_id: newCompanyId,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (error) throw error

      // Decision #15: Update user preference
      const { error: prefError } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preferred_company_id: newCompanyId,
          updated_at: new Date().toISOString(),
        })

      if (prefError) {
        console.warn('⚠️ Failed to update user preference:', prefError)
        // Non bloccare il cambio company se fallisce l'update preferenza
      }

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

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    
    // ✅ REMEMBER ME: Implementazione reale
    if (rememberMe && data.user) {
      // Abilita Remember Me per 30 giorni
      const success = await rememberMeService.enableRememberMe(data.user.id, '')
      if (success) {
        console.log('🔒 Remember Me enabled: session expires in 30 days')
      } else {
        console.warn('⚠️ Remember Me failed to enable, using standard session')
      }
    } else {
      // Disabilita Remember Me
      await rememberMeService.disableRememberMe()
      console.log('🔒 Remember Me disabled: session expires in 24 hours')
    }
    
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
  // 9. Last Activity Update (every 3 minutes)
  // Decision #17: Activity Tracking
  // =============================================

  useEffect(() => {
    if (!user?.id || !session?.active_company_id) return

    const updateActivity = async () => {
      if (currentSessionId) {
        await activityTrackingService.updateLastActivity(currentSessionId)
      }
    }

    // Decision #17: Interval da 5min → 3min (testing/debug)
    const interval = setInterval(updateActivity, 3 * 60 * 1000)
    return () => clearInterval(interval)
  }, [user?.id, session?.active_company_id, currentSessionId])

  // =============================================
  // 10. Loading States
  // =============================================

  // Non bloccare l'UI in attesa di user_sessions se abbiamo già company_members
  const isAuthLoading =
    isLoading ||
    (!!user?.id && companiesLoading && companies.length === 0)
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
    companyId: activeCompanyId,
    sessionId: currentSessionId,

    // Multi-company (NUOVO)
    companies,
    activeCompanyId,
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
