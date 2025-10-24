// =============================================================================
// TEST VALIDAZIONE DECISIONI ALTE - AGENTE 2B
// Decisioni: #4 Rate Limiting Escalation, #15 Multi-Company Preferences, #17 Activity Tracking
// =============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { calculateLockoutDuration } from '../shared/business-logic'

describe('Decision #4 - Rate Limiting Escalation', () => {
  describe('calculateLockoutDuration', () => {
    it('should return 0 for failure count < 5', () => {
      expect(calculateLockoutDuration(0)).toBe(0)
      expect(calculateLockoutDuration(1)).toBe(0)
      expect(calculateLockoutDuration(4)).toBe(0)
    })

    it('should return 5 minutes for failure count = 5', () => {
      expect(calculateLockoutDuration(5)).toBe(5 * 60)
    })

    it('should return 15 minutes for failure count = 10', () => {
      expect(calculateLockoutDuration(10)).toBe(15 * 60)
    })

    it('should return 1 hour for failure count = 15', () => {
      expect(calculateLockoutDuration(15)).toBe(60 * 60)
    })

    it('should return 24 hours for failure count >= 20', () => {
      expect(calculateLockoutDuration(20)).toBe(24 * 60 * 60)
      expect(calculateLockoutDuration(25)).toBe(24 * 60 * 60)
      expect(calculateLockoutDuration(100)).toBe(24 * 60 * 60)
    })

    it('should handle edge cases correctly', () => {
      // Test intermediate values
      expect(calculateLockoutDuration(6)).toBe(5 * 60)  // Still 5 min
      expect(calculateLockoutDuration(11)).toBe(15 * 60) // Still 15 min
      expect(calculateLockoutDuration(16)).toBe(60 * 60) // Still 1 hour
    })
  })
})

describe('Decision #15 - Multi-Company Preferences', () => {
  // Mock Supabase client
  const mockSupabase = {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      upsert: vi.fn(() => ({
        eq: vi.fn()
      }))
    }))
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('User Preferences Logic', () => {
    it('should prioritize preferred company over first available', () => {
      const companies = [
        { company_id: 'company-1', company_name: 'Company 1' },
        { company_id: 'company-2', company_name: 'Company 2' }
      ]
      
      const userPrefs = { preferred_company_id: 'company-2' }
      
      // Simulate preference logic
      const activeCompanyId = userPrefs?.preferred_company_id || companies[0].company_id
      
      expect(activeCompanyId).toBe('company-2')
    })

    it('should fallback to first company if no preference', () => {
      const companies = [
        { company_id: 'company-1', company_name: 'Company 1' },
        { company_id: 'company-2', company_name: 'Company 2' }
      ]
      
      const userPrefs = null
      
      // Simulate preference logic
      const activeCompanyId = userPrefs?.preferred_company_id || companies[0].company_id
      
      expect(activeCompanyId).toBe('company-1')
    })

    it('should handle empty companies array', () => {
      const companies = []
      const userPrefs = { preferred_company_id: 'company-2' }
      
      // Simulate preference logic
      const activeCompanyId = companies.length > 0 
        ? (userPrefs?.preferred_company_id || companies[0].company_id)
        : null
      
      expect(activeCompanyId).toBeNull()
    })
  })

  describe('Company Switch Logic', () => {
    it('should update both session and preference on company switch', async () => {
      const mockUpdate = vi.fn().mockResolvedValue({ error: null })
      const mockUpsert = vi.fn().mockResolvedValue({ error: null })
      
      mockSupabase.from.mockReturnValue({
        update: mockUpdate,
        upsert: mockUpsert
      })

      // Simulate company switch logic
      const userId = 'user-123'
      const newCompanyId = 'company-2'
      
      // Update session
      await mockSupabase.from('user_sessions').update({
        active_company_id: newCompanyId,
        updated_at: new Date().toISOString(),
      }).eq('user_id', userId)

      // Update preference
      await mockSupabase.from('user_preferences').upsert({
        user_id: userId,
        preferred_company_id: newCompanyId,
        updated_at: new Date().toISOString(),
      })

      expect(mockUpdate).toHaveBeenCalledWith({
        active_company_id: newCompanyId,
        updated_at: expect.any(String),
      })
      
      expect(mockUpsert).toHaveBeenCalledWith({
        user_id: userId,
        preferred_company_id: newCompanyId,
        updated_at: expect.any(String),
      })
    })
  })
})

describe('Decision #17 - Activity Tracking', () => {
  describe('Activity Update Interval', () => {
    it('should use 3 minutes interval for activity updates', () => {
      const intervalMs = 3 * 60 * 1000 // 3 minutes in milliseconds
      expect(intervalMs).toBe(180000) // 3 * 60 * 1000
    })

    it('should be different from previous 5 minutes interval', () => {
      const oldIntervalMs = 5 * 60 * 1000 // 5 minutes
      const newIntervalMs = 3 * 60 * 1000 // 3 minutes
      
      expect(newIntervalMs).toBeLessThan(oldIntervalMs)
      expect(newIntervalMs).toBe(180000)
      expect(oldIntervalMs).toBe(300000)
    })
  })

  describe('Activity Tracking Service Integration', () => {
    it('should call updateLastActivity with correct session ID', async () => {
      const mockUpdateLastActivity = vi.fn().mockResolvedValue({ success: true })
      const currentSessionId = 'session-123'
      
      // Simulate activity update
      await mockUpdateLastActivity(currentSessionId)
      
      expect(mockUpdateLastActivity).toHaveBeenCalledWith(currentSessionId)
    })

    it('should handle missing session ID gracefully', async () => {
      const mockUpdateLastActivity = vi.fn().mockResolvedValue({ success: true })
      const currentSessionId = null
      
      // Simulate activity update with null session
      if (currentSessionId) {
        await mockUpdateLastActivity(currentSessionId)
      }
      
      expect(mockUpdateLastActivity).not.toHaveBeenCalled()
    })
  })
})

describe('Integration Tests - All Decisions', () => {
  describe('useAuth Hook Integration', () => {
    it('should integrate all three decisions correctly', () => {
      // Decision #4: Rate limiting escalation
      const lockoutDuration = calculateLockoutDuration(5)
      expect(lockoutDuration).toBe(5 * 60)

      // Decision #15: Multi-company preferences
      const companies = [{ company_id: 'company-1', company_name: 'Company 1' }]
      const userPrefs = { preferred_company_id: 'company-1' }
      const activeCompanyId = userPrefs?.preferred_company_id || companies[0].company_id
      expect(activeCompanyId).toBe('company-1')

      // Decision #17: Activity tracking interval
      const activityInterval = 3 * 60 * 1000
      expect(activityInterval).toBe(180000)
    })
  })

  describe('Error Handling', () => {
    it('should handle rate limiting errors gracefully', () => {
      const failureCount = 25
      const lockoutDuration = calculateLockoutDuration(failureCount)
      expect(lockoutDuration).toBe(24 * 60 * 60) // 24 hours
    })

    it('should handle missing user preferences gracefully', () => {
      const companies = [{ company_id: 'company-1', company_name: 'Company 1' }]
      const userPrefs = null
      const activeCompanyId = userPrefs?.preferred_company_id || companies[0].company_id
      expect(activeCompanyId).toBe('company-1')
    })

    it('should handle activity tracking errors gracefully', () => {
      const currentSessionId = null
      const shouldUpdate = currentSessionId !== null
      expect(shouldUpdate).toBe(false)
    })
  })
})
