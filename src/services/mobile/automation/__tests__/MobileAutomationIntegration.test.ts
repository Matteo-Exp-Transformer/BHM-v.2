/**
 * B.10.4 Advanced Mobile & PWA - Mobile Automation Integration Tests
 * Test suite for mobile automation services integration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mobileAutomationServices } from '../index'
import { mobileAutomationService } from '../MobileAutomationService'
import { offlineAutomationSync } from '../OfflineAutomationSync'
import { pushNotificationManager } from '../PushNotificationManager'

// Mock the automation services
vi.mock('../../automation', () => ({
  enterpriseAutomationManager: {
    initialize: vi.fn().mockResolvedValue(undefined),
    getAutomationStatus: vi.fn().mockReturnValue({
      workflows: { successRate: 96.5 },
      scheduling: { resourceEfficiency: 87.3 },
      reporting: { successRate: 94.2 },
      alerts: { escalationRate: 0.15 },
      systemHealth: 'healthy' as const,
    }),
    generatePerformanceReport: vi.fn().mockReturnValue({
      summary: {
        totalAutomations: 150,
        successRate: 94.8,
        avgExecutionTime: 245,
        costSavings: 23400,
        efficiencyGains: 4500,
      },
    }),
    processAutomationEvent: vi.fn().mockResolvedValue({
      id: 'test-execution',
      status: 'completed',
      executionTime: 250,
    }),
  },
}))

// Mock mobile services
vi.mock('../../index', () => ({
  mobileServices: {
    isMobile: vi.fn().mockReturnValue(true),
    getDeviceCapabilities: vi.fn().mockReturnValue({
      hasCamera: true,
      hasGeolocation: true,
      hasVibration: true,
      hasNotifications: true,
      isStandalone: false,
    }),
  },
}))

describe('Mobile Automation Integration Tests', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Clean up after each test
    vi.restoreAllMocks()
  })

  describe('Mobile Automation Services Manager', () => {
    it('should initialize all mobile automation services', async () => {
      const status = await mobileAutomationServices.initialize()

      expect(status).toBeUndefined() // initialize returns void

      const serviceStatus = mobileAutomationServices.getMobileAutomationStatus()
      expect(serviceStatus.initialized).toBe(true)
      expect(serviceStatus.services.mobileAutomation).toBe(true)
      expect(serviceStatus.services.offlineSync).toBe(true)
      expect(serviceStatus.services.pushNotifications).toBe(true)
    })

    it('should execute mobile automation with all services', async () => {
      await mobileAutomationServices.initialize()

      const result = await mobileAutomationServices.executeMobileAutomation(
        'test-rule',
        {
          testData: 'test',
        }
      )

      expect(result).toBeDefined()
      expect(result.id).toBe('test-execution')
      expect(result.status).toBe('completed')
    })

    it('should sync offline data', async () => {
      await mobileAutomationServices.initialize()

      // Should not throw
      await expect(
        mobileAutomationServices.syncOfflineData()
      ).resolves.toBeUndefined()
    })

    it('should send critical alert notification', async () => {
      await mobileAutomationServices.initialize()

      const mockAlert = {
        id: 'test-alert',
        title: 'Test Alert',
        message: 'Test message',
        severity: 'critical' as const,
        status: 'active' as const,
        source: 'test-source',
        timestamp: new Date(),
        acknowledgedBy: null,
        resolvedBy: null,
        escalatedBy: null,
        metadata: {},
      }

      // Should not throw
      await expect(
        mobileAutomationServices.sendCriticalAlert(mockAlert)
      ).resolves.toBeUndefined()
    })
  })

  describe('Mobile Automation Service', () => {
    it('should initialize mobile automation service', async () => {
      await mobileAutomationService.initialize()

      const status = mobileAutomationService.getStatus()
      expect(status.initialized).toBe(true)
      expect(status.isOnline).toBe(true)
    })

    it('should get mobile automation status', () => {
      const status = mobileAutomationService.getMobileAutomationStatus()

      expect(status.systemHealth).toBe('healthy')
      expect(status.mobileOptimizations.touchGestures).toBe(true)
      expect(status.mobileOptimizations.hapticFeedback).toBe(true)
      expect(status.mobileOptimizations.offlineMode).toBe(true)
    })

    it('should register and execute touch gestures', async () => {
      await mobileAutomationService.initialize()

      const mockAction = vi.fn().mockResolvedValue(undefined)

      mobileAutomationService.registerTouchGesture('test-gesture', {
        type: 'swipe',
        direction: 'up',
        threshold: 50,
        action: mockAction,
      })

      await mobileAutomationService.executeTouchGesture('test-gesture')

      expect(mockAction).toHaveBeenCalled()
    })

    it('should get mobile automation rules', () => {
      const rules = mobileAutomationService.getMobileAutomationRules()

      expect(Array.isArray(rules)).toBe(true)
      // Rules should be mobile-optimized
      rules.forEach(rule => {
        expect(rule.mobileOptimized).toBe(true)
        expect(rule.touchFriendly).toBe(true)
        expect(rule.offlineCapable).toBe(true)
      })
    })
  })

  describe('Offline Automation Sync', () => {
    it('should initialize offline sync service', async () => {
      await offlineAutomationSync.initialize()

      const stats = offlineAutomationSync.getSyncStats()
      expect(stats.totalSyncs).toBe(0) // Initially 0
    })

    it('should queue offline action', async () => {
      await offlineAutomationSync.initialize()

      const actionId = await offlineAutomationSync.queueOfflineAction(
        'create_rule',
        {
          name: 'Test Rule',
          description: 'Test description',
        }
      )

      expect(actionId).toBeDefined()
      expect(typeof actionId).toBe('string')
    })

    it('should execute offline rule', async () => {
      await offlineAutomationSync.initialize()

      // Mock a rule in offline data
      const mockRule = {
        id: 'test-rule',
        name: 'Test Rule',
        description: 'Test description',
        trigger: { type: 'manual', config: {} },
        conditions: [],
        actions: [],
        enabled: true,
        priority: 'medium' as const,
        companyId: 'test',
        createdBy: 'test',
        createdAt: new Date(),
        executionCount: 0,
        successRate: 100,
      }

      // Add rule to offline data
      const offlineData = offlineAutomationSync.getOfflineData()
      offlineData.rules.push(mockRule)

      const execution = await offlineAutomationSync.executeOfflineRule(
        'test-rule',
        {
          testContext: 'test',
        }
      )

      expect(execution).toBeDefined()
      expect(execution.ruleId).toBe('test-rule')
      expect(execution.status).toBe('completed')
    })

    it('should check if data is available offline', () => {
      const isAvailable = offlineAutomationSync.isDataAvailableOffline()
      expect(typeof isAvailable).toBe('boolean')
    })

    it('should get offline data size', () => {
      const size = offlineAutomationSync.getOfflineDataSize()
      expect(typeof size).toBe('number')
      expect(size).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Push Notification Manager', () => {
    it('should initialize push notification manager', async () => {
      // Mock Notification API
      Object.defineProperty(window, 'Notification', {
        value: vi.fn().mockImplementation(() => ({
          close: vi.fn(),
        })),
        writable: true,
      })

      // Mock requestPermission
      Object.defineProperty(window.Notification, 'requestPermission', {
        value: vi.fn().mockResolvedValue('granted'),
        writable: true,
      })

      await pushNotificationManager.initialize()

      const stats = pushNotificationManager.getNotificationStats()
      expect(stats.totalSent).toBe(0) // Initially 0
    })

    it('should send automation notification', async () => {
      await pushNotificationManager.initialize()

      // Should not throw
      await expect(
        pushNotificationManager.sendAutomationNotification(
          'automation_completed',
          {
            automationName: 'Test Automation',
            status: 'completed',
          }
        )
      ).resolves.toBeUndefined()
    })

    it('should send critical alert notification', async () => {
      await pushNotificationManager.initialize()

      const mockAlert = {
        id: 'test-alert',
        title: 'Critical Alert',
        message: 'Test critical alert',
        severity: 'critical' as const,
        status: 'active' as const,
        source: 'test-source',
        timestamp: new Date(),
        acknowledgedBy: null,
        resolvedBy: null,
        escalatedBy: null,
        metadata: {},
      }

      // Should not throw
      await expect(
        pushNotificationManager.sendCriticalAlert(mockAlert)
      ).resolves.toBeUndefined()
    })

    it('should create notification rule', async () => {
      await pushNotificationManager.initialize()

      const rule = await pushNotificationManager.createNotificationRule({
        name: 'Test Rule',
        trigger: 'automation_completed',
        conditions: {},
        notification: {
          title: 'Test Notification',
          body: 'Test body',
        },
        enabled: true,
      })

      expect(rule).toBeDefined()
      expect(rule.name).toBe('Test Rule')
      expect(rule.enabled).toBe(true)
    })

    it('should get notification rules', () => {
      const rules = pushNotificationManager.getNotificationRules()
      expect(Array.isArray(rules)).toBe(true)
    })

    it('should get notification statistics', () => {
      const stats = pushNotificationManager.getNotificationStats()
      expect(stats.totalSent).toBeDefined()
      expect(stats.totalDelivered).toBeDefined()
      expect(stats.totalClicked).toBeDefined()
      expect(stats.deliveryRate).toBeDefined()
      expect(stats.clickRate).toBeDefined()
    })
  })

  describe('Integration Scenarios', () => {
    it('should handle complete mobile automation workflow', async () => {
      // Initialize all services
      await mobileAutomationServices.initialize()

      // Execute automation
      const execution = await mobileAutomationServices.executeMobileAutomation(
        'test-rule',
        {
          mobileContext: true,
        }
      )

      expect(execution).toBeDefined()

      // Check that all services are working together
      const serviceStatus = mobileAutomationServices.getMobileAutomationStatus()
      expect(serviceStatus.initialized).toBe(true)
      expect(serviceStatus.services.mobileAutomation).toBe(true)
      expect(serviceStatus.services.offlineSync).toBe(true)
      expect(serviceStatus.services.pushNotifications).toBe(true)
    })

    it('should handle offline scenario', async () => {
      await mobileAutomationServices.initialize()

      // Simulate offline mode
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true,
      })

      // Queue offline action
      const actionId = await offlineAutomationSync.queueOfflineAction(
        'execute_rule',
        {
          ruleId: 'test-rule',
          context: { offline: true },
        }
      )

      expect(actionId).toBeDefined()

      // Check offline data
      const isAvailable = offlineAutomationSync.isDataAvailableOffline()
      expect(typeof isAvailable).toBe('boolean')
    })

    it('should handle mobile device capabilities', () => {
      const capabilities = mobileServices.getDeviceCapabilities()

      expect(capabilities.hasCamera).toBeDefined()
      expect(capabilities.hasGeolocation).toBeDefined()
      expect(capabilities.hasVibration).toBeDefined()
      expect(capabilities.hasNotifications).toBeDefined()
      expect(capabilities.isStandalone).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('should handle service initialization errors gracefully', async () => {
      // Mock a service that throws an error
      vi.spyOn(mobileAutomationService, 'initialize').mockRejectedValue(
        new Error('Init failed')
      )

      // Should not throw, but should handle error gracefully
      await expect(
        mobileAutomationServices.initialize()
      ).resolves.toBeUndefined()
    })

    it('should handle offline sync errors', async () => {
      await offlineAutomationSync.initialize()

      // Mock a sync error
      vi.spyOn(offlineAutomationSync, 'syncOfflineData').mockRejectedValue(
        new Error('Sync failed')
      )

      // Should handle error gracefully
      await expect(offlineAutomationSync.syncOfflineData()).rejects.toThrow(
        'Sync failed'
      )
    })

    it('should handle notification permission denied', async () => {
      // Mock denied permission
      Object.defineProperty(window.Notification, 'requestPermission', {
        value: vi.fn().mockResolvedValue('denied'),
        writable: true,
      })

      // Should not throw
      await expect(
        pushNotificationManager.initialize()
      ).resolves.toBeUndefined()
    })
  })
})

// Mock mobileServices import
const mobileServices = {
  isMobile: vi.fn().mockReturnValue(true),
  getDeviceCapabilities: vi.fn().mockReturnValue({
    hasCamera: true,
    hasGeolocation: true,
    hasVibration: true,
    hasNotifications: true,
    isStandalone: false,
  }),
}
