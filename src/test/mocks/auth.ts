// Mock authentication for testing (Supabase Auth)
export const mockUser = {
  id: 'test_user_123',
  email: 'test@example.com',
  user_metadata: {
    first_name: 'Test',
    last_name: 'User',
    full_name: 'Test User',
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export const mockCompanyMember = {
  id: 'member_123',
  user_id: 'test_user_123',
  company_id: 'company_123',
  role: 'admin' as const,
  staff_id: 'staff_123',
  is_active: true,
  joined_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export const mockCompany = {
  id: 'company_123',
  name: 'Test Company',
  address: 'Test Address',
  staff_count: 5,
  email: 'company@example.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export const mockUserSession = {
  id: 'session_123',
  user_id: 'test_user_123',
  active_company_id: 'company_123',
  last_activity: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

// Mock Supabase Auth hooks
export const mockSupabaseAuth = {
  isLoading: false,
  isAuthenticated: true,
  isAuthorized: true,
  user: mockUser,
  userId: 'test_user_123',
  companyId: 'company_123',
  activeCompanyId: 'company_123',
  userRole: 'admin' as const,
  companies: [
    {
      company_id: 'company_123',
      company_name: 'Test Company',
      role: 'admin' as const,
      staff_id: 'staff_123',
      is_active: true,
    },
  ],
  permissions: {
    canManageStaff: true,
    canManageDepartments: true,
    canViewAllTasks: true,
    canManageConservation: true,
    canExportData: true,
    canManageSettings: true,
  },
}
