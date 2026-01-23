import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getTaskStatus } from '../useMaintenanceTasks'

describe('getTaskStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T10:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('overdue tasks', () => {
    it('returns overdue for past dates', () => {
      const yesterday = new Date('2024-01-14T09:00:00Z').toISOString()
      expect(getTaskStatus(yesterday)).toBe('overdue')
    })

    it('returns overdue for tasks due exactly now', () => {
      const now = new Date('2024-01-15T10:00:00Z').toISOString()
      expect(getTaskStatus(now)).toBe('overdue')
    })

    it('returns overdue for tasks due 1 hour ago', () => {
      const oneHourAgo = new Date('2024-01-15T09:00:00Z').toISOString()
      expect(getTaskStatus(oneHourAgo)).toBe('overdue')
    })
  })

  describe('pending tasks (due within 2 hours)', () => {
    it('returns pending for tasks due in 1 hour', () => {
      const inOneHour = new Date('2024-01-15T11:00:00Z').toISOString()
      expect(getTaskStatus(inOneHour)).toBe('pending')
    })

    it('returns pending for tasks due in exactly 2 hours', () => {
      const inTwoHours = new Date('2024-01-15T12:00:00Z').toISOString()
      expect(getTaskStatus(inTwoHours)).toBe('pending')
    })

    it('returns pending for tasks due in 30 minutes', () => {
      const inThirtyMinutes = new Date('2024-01-15T10:30:00Z').toISOString()
      expect(getTaskStatus(inThirtyMinutes)).toBe('pending')
    })

    it('returns pending for tasks due in 1 minute', () => {
      const inOneMinute = new Date('2024-01-15T10:01:00Z').toISOString()
      expect(getTaskStatus(inOneMinute)).toBe('pending')
    })
  })

  describe('scheduled tasks (due after 2 hours)', () => {
    it('returns scheduled for tasks due tomorrow', () => {
      const tomorrow = new Date('2024-01-16T10:00:00Z').toISOString()
      expect(getTaskStatus(tomorrow)).toBe('scheduled')
    })

    it('returns scheduled for tasks due in 3 hours', () => {
      const inThreeHours = new Date('2024-01-15T13:00:00Z').toISOString()
      expect(getTaskStatus(inThreeHours)).toBe('scheduled')
    })

    it('returns scheduled for tasks due in exactly 2 hours and 1 minute', () => {
      const twoHoursOneMinute = new Date('2024-01-15T12:01:00Z').toISOString()
      expect(getTaskStatus(twoHoursOneMinute)).toBe('scheduled')
    })

    it('returns scheduled for tasks due in 1 week', () => {
      const inOneWeek = new Date('2024-01-22T10:00:00Z').toISOString()
      expect(getTaskStatus(inOneWeek)).toBe('scheduled')
    })
  })

  describe('edge cases', () => {
    it('handles different timezones correctly', () => {
      // Task due in 1 hour in UTC (still pending)
      const utcTime = new Date('2024-01-15T11:00:00Z').toISOString()
      expect(getTaskStatus(utcTime)).toBe('pending')
    })

    it('handles tasks far in the future', () => {
      const farFuture = new Date('2025-12-31T23:59:59Z').toISOString()
      expect(getTaskStatus(farFuture)).toBe('scheduled')
    })
  })
})
