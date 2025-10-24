/**
 * 🧪 Remember Me Service Tests
 * 
 * Test completi per la funzionalità Remember Me
 * Verifica persistenza sessioni, Edge Function integration, localStorage management
 * 
 * @date 2025-01-23
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { rememberMeService } from '@/services/auth/RememberMeService'

// Mock Supabase
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('RememberMeService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('enableRememberMe', () => {
    it('should enable remember me successfully', async () => {
      const mockSupabase = await import('@/lib/supabase/client')
      mockSupabase.supabase.functions.invoke.mockResolvedValue({
        data: { success: true },
        error: null
      })

      const result = await rememberMeService.enableRememberMe('user123', 'company456')

      expect(result).toBe(true)
      expect(mockSupabase.supabase.functions.invoke).toHaveBeenCalledWith('remember-me', {
        body: {
          rememberMe: true,
          userId: 'user123',
          sessionDuration: 30 * 24 * 60 * 60 * 1000
        }
      })
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    it('should handle Edge Function error', async () => {
      const mockSupabase = await import('@/lib/supabase/client')
      mockSupabase.supabase.functions.invoke.mockResolvedValue({
        data: null,
        error: { message: 'Edge Function error' }
      })

      const result = await rememberMeService.enableRememberMe('user123', 'company456')

      expect(result).toBe(false)
      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })

    it('should handle localStorage error', async () => {
      const mockSupabase = await import('@/lib/supabase/client')
      mockSupabase.supabase.functions.invoke.mockResolvedValue({
        data: { success: true },
        error: null
      })
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })

      const result = await rememberMeService.enableRememberMe('user123', 'company456')

      expect(result).toBe(false)
    })
  })

  describe('disableRememberMe', () => {
    it('should disable remember me successfully', async () => {
      const mockSupabase = await import('@/lib/supabase/client')
      mockSupabase.supabase.functions.invoke.mockResolvedValue({
        data: { success: true },
        error: null
      })

      // First enable remember me to have a session
      await rememberMeService.enableRememberMe('user123', 'company456')
      
      const result = await rememberMeService.disableRememberMe()

      expect(result).toBe(true)
      expect(mockSupabase.supabase.functions.invoke).toHaveBeenCalledWith('remember-me', {
        body: {
          rememberMe: false,
          userId: 'user123',
          sessionDuration: 24 * 60 * 60 * 1000
        }
      })
      expect(localStorageMock.removeItem).toHaveBeenCalled()
    })

    it('should handle missing session gracefully', async () => {
      const result = await rememberMeService.disableRememberMe()

      expect(result).toBe(true)
      expect(localStorageMock.removeItem).toHaveBeenCalled()
    })
  })

  describe('isRememberMeActive', () => {
    it('should return true for active remember me session', () => {
      const futureTime = Date.now() + 24 * 60 * 60 * 1000 // 1 day from now
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        userId: 'user123',
        companyId: 'company456',
        rememberMe: true,
        expiresAt: futureTime,
        createdAt: Date.now()
      }))

      const result = rememberMeService.isRememberMeActive()

      expect(result).toBe(true)
    })

    it('should return false for expired session', () => {
      const pastTime = Date.now() - 24 * 60 * 60 * 1000 // 1 day ago
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        userId: 'user123',
        companyId: 'company456',
        rememberMe: true,
        expiresAt: pastTime,
        createdAt: Date.now()
      }))

      const result = rememberMeService.isRememberMeActive()

      expect(result).toBe(false)
      expect(localStorageMock.removeItem).toHaveBeenCalled()
    })

    it('should return false when no session exists', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const result = rememberMeService.isRememberMeActive()

      expect(result).toBe(false)
    })
  })

  describe('getSessionInfo', () => {
    it('should return session info for valid session', () => {
      const sessionData = {
        userId: 'user123',
        companyId: 'company456',
        rememberMe: true,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        createdAt: Date.now()
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(sessionData))

      const result = rememberMeService.getSessionInfo()

      expect(result).toEqual(sessionData)
    })

    it('should return null for expired session', () => {
      const sessionData = {
        userId: 'user123',
        companyId: 'company456',
        rememberMe: true,
        expiresAt: Date.now() - 24 * 60 * 60 * 1000,
        createdAt: Date.now()
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(sessionData))

      const result = rememberMeService.getSessionInfo()

      expect(result).toBeNull()
    })
  })

  describe('shouldRefreshSession', () => {
    it('should return true when session needs refresh', () => {
      const sessionData = {
        userId: 'user123',
        companyId: 'company456',
        rememberMe: true,
        expiresAt: Date.now() + 12 * 60 * 60 * 1000, // 12 hours (less than 24h threshold)
        createdAt: Date.now()
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(sessionData))

      const result = rememberMeService.shouldRefreshSession()

      expect(result).toBe(true)
    })

    it('should return false when session does not need refresh', () => {
      const sessionData = {
        userId: 'user123',
        companyId: 'company456',
        rememberMe: true,
        expiresAt: Date.now() + 48 * 60 * 60 * 1000, // 48 hours (more than 24h threshold)
        createdAt: Date.now()
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(sessionData))

      const result = rememberMeService.shouldRefreshSession()

      expect(result).toBe(false)
    })
  })

  describe('getTimeUntilExpiry', () => {
    it('should return correct time until expiry', () => {
      const now = Date.now()
      const expiresAt = now + 2 * 60 * 60 * 1000 // 2 hours from now
      const sessionData = {
        userId: 'user123',
        companyId: 'company456',
        rememberMe: true,
        expiresAt,
        createdAt: now
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(sessionData))

      const result = rememberMeService.getTimeUntilExpiry()

      expect(result).toBeCloseTo(2 * 60 * 60 * 1000, -3) // Within 1 second tolerance
    })

    it('should return 0 for expired session', () => {
      const now = Date.now()
      const expiresAt = now - 2 * 60 * 60 * 1000 // 2 hours ago
      const sessionData = {
        userId: 'user123',
        companyId: 'company456',
        rememberMe: true,
        expiresAt,
        createdAt: now
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(sessionData))

      const result = rememberMeService.getTimeUntilExpiry()

      expect(result).toBe(0)
    })
  })

  describe('getDebugInfo', () => {
    it('should return correct debug information', () => {
      const sessionData = {
        userId: 'user123',
        companyId: 'company456',
        rememberMe: true,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        createdAt: Date.now()
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(sessionData))

      const result = rememberMeService.getDebugInfo()

      expect(result.enabled).toBe(true)
      expect(result.expiresIn).toBeGreaterThan(0)
      expect(result.shouldRefresh).toBe(false)
      expect(result.sessionInfo).toEqual(sessionData)
    })
  })
})
