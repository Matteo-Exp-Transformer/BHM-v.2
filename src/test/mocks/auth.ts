// Mock authentication for testing
export const mockUser = {
  id: 'test_user_123',
  firstName: 'Test',
  lastName: 'User',
  emailAddresses: [{ emailAddress: 'test@example.com' }],
  profileImageUrl: 'https://via.placeholder.com/150',
}

export const mockUserProfile = {
  id: 'profile_123',
  clerk_user_id: 'test_user_123',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  company_id: 'company_123',
  role: 'admin',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export const mockCompany = {
  id: 'company_123',
  name: 'Test Company',
  address: 'Test Address',
  phone: '+1234567890',
  email: 'company@example.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

// Mock Clerk hooks
export const mockClerkUser = {
  isSignedIn: true,
  user: mockUser,
  isLoaded: true,
}

export const mockClerkAuth = {
  isSignedIn: true,
  isLoaded: true,
  user: mockUser,
}
