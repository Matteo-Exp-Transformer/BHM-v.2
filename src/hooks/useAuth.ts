import { useUser } from '@clerk/clerk-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

// Define our own User interface based on what we actually use from Clerk
interface ClerkUser {
  id: string
  firstName?: string | null
  lastName?: string | null
  emailAddresses?: Array<{ emailAddress: string }>
}

// Extended User with company_id and role
interface ExtendedUser extends ClerkUser {
  company_id?: string
  role?: UserRole
}

// Role types
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

// Staff member interface
// interface StaffMember {
//   id: string
//   company_id: string
//   name: string
//   role: UserRole
//   category: string
//   email?: string
// }

// User profile interface (updated with new columns)
interface UserProfile {
  id: string
  clerk_user_id: string
  company_id: string | null
  email: string
  first_name: string | null
  last_name: string | null
  staff_id: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

// Permission mapping based on role
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

// Main useAuth hook
export const useAuth = () => {
  const { user, isLoaded: isClerkLoaded, isSignedIn } = useUser()
  const clerkUser = user as ClerkUser | null

  // Debug logs removed for cleaner console

  // Fetch user profile and determine role
  const {
    data: userProfile,
    isLoading: isProfileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['userProfile', clerkUser?.id],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!clerkUser?.emailAddresses?.[0]?.emailAddress) {
        return null
      }

      const userEmail = clerkUser.emailAddresses[0].emailAddress

      // First, check if user profile already exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*, staff_id, role')
        .eq('clerk_user_id', clerkUser.id)
        .single()

      if (existingProfile) {
        return existingProfile as UserProfile
      }

      // If no profile exists, check if email exists in staff table
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('id, company_id, role, name, email')
        .eq('email', userEmail)
        .single()

      if (staffError && staffError.code !== 'PGRST116') {
        console.error('Error checking staff table:', staffError)
        throw new Error('Failed to check staff membership')
      }

      // Determine role and company
      const role: UserRole = staffData?.role || 'guest'
      const company_id = staffData?.company_id || null
      const staff_id = staffData?.id || null

      // Create user profile
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          clerk_user_id: clerkUser.id,
          email: userEmail,
          first_name: clerkUser.firstName,
          last_name: clerkUser.lastName,
          company_id,
          staff_id,
          role,
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating user profile:', createError)
        throw new Error('Failed to create user profile')
      }

      return newProfile as UserProfile
    },
    enabled: !!clerkUser?.id && isSignedIn,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  })

  // Loading states
  const isLoading = !isClerkLoaded || isProfileLoading

  // Authentication status
  const isAuthenticated = isSignedIn && !!userProfile

  // User role and permissions
  const userRole: UserRole = userProfile?.role || 'guest'
  const permissions = getPermissionsFromRole(userRole)

  // Helper functions
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

  // Check if user is authorized (not guest)
  const isAuthorized = userRole !== 'guest'

  // Get user display name
  const displayName =
    userProfile?.first_name && userProfile?.last_name
      ? `${userProfile.first_name} ${userProfile.last_name}`
      : clerkUser?.firstName && clerkUser?.lastName
        ? `${clerkUser.firstName} ${clerkUser.lastName}`
        : userProfile?.email || 'User'

  // Error handling
  const authError = profileError ? 'Failed to load user profile' : null

  // Extended user with company_id and role
  const extendedUser = clerkUser as ExtendedUser
  if (extendedUser && userProfile?.company_id) {
    extendedUser.company_id = userProfile.company_id
  }
  if (extendedUser && userProfile?.role) {
    extendedUser.role = userProfile.role
  }

  return {
    // Loading states
    isLoading,
    isClerkLoaded,
    isProfileLoading,

    // Authentication status
    isSignedIn,
    isAuthenticated,
    isAuthorized,

    // User data
    user: extendedUser,
    userId: clerkUser?.id,
    userProfile,
    userRole,
    permissions,
    displayName,
    companyId: userProfile?.company_id,

    // Helper functions
    hasPermission,
    hasRole,
    hasAnyRole,

    // Actions
    refetchProfile,

    // Error handling
    authError,
  }
}

// Permission-based helper hooks
export const usePermission = (permission: keyof UserPermissions) => {
  const { hasPermission, isLoading } = useAuth()
  return { hasPermission: hasPermission(permission), isLoading }
}

export const useRole = (roles: UserRole | UserRole[]) => {
  const { hasRole, isLoading } = useAuth()
  return { hasRole: hasRole(roles), isLoading }
}

export default useAuth
