/**
 * 🔧 Auth Bypass Configuration
 * 
 * File temporaneo per bypassare l'autenticazione durante lo sviluppo
 * quando le chiavi Supabase sono scadute o non disponibili
 */

export const AUTH_BYPASS_CONFIG = {
  // Abilita bypass temporaneo
  enabled: true,
  
  // Mock user per test
  mockUser: {
    id: 'bypass_user_123',
    email: 'test@haccp.com',
    user_metadata: {
      first_name: 'Test',
      last_name: 'User',
      full_name: 'Test User',
    },
  },
  
  // Mock company membership
  mockCompany: {
    company_id: 'bypass_company_123',
    company_name: 'Test Company',
    role: 'admin' as const,
    staff_id: 'bypass_staff_123',
    is_active: true,
  },
  
  // Mock permissions (admin completo)
  mockPermissions: {
    canManageStaff: true,
    canManageDepartments: true,
    canViewAllTasks: true,
    canManageConservation: true,
    canExportData: true,
    canManageSettings: true,
  },
}

// Funzione per verificare se il bypass è attivo
export const isAuthBypassEnabled = (): boolean => {
  return AUTH_BYPASS_CONFIG.enabled && import.meta.env.DEV
}

// Funzione per ottenere mock auth data
export const getMockAuthData = () => {
  if (!isAuthBypassEnabled()) return null
  
  return {
    user: AUTH_BYPASS_CONFIG.mockUser,
    companies: [AUTH_BYPASS_CONFIG.mockCompany],
    permissions: AUTH_BYPASS_CONFIG.mockPermissions,
    userRole: 'admin' as const,
    isAuthenticated: true,
    isAuthorized: true,
  }
}


