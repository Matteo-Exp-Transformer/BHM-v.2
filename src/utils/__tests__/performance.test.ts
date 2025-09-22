import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  debounce,
  throttle,
  optimizeImage,
  queryKeyFactory,
  virtualizeListThreshold,
  pageSizeDefault,
  trackPerformance,
  createCleanupManager,
  batchUpdates
} from '../performance'

describe('Performance Utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('debounce', () => {
    it('should delay function execution', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn('test')
      expect(fn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledWith('test')
    })

    it('should cancel previous calls', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn('first')
      debouncedFn('second')

      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('second')
    })
  })

  describe('throttle', () => {
    it('should limit function calls', () => {
      const fn = vi.fn()
      const throttledFn = throttle(fn, 100)

      throttledFn('first')
      throttledFn('second')

      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('first')

      vi.advanceTimersByTime(100)
      throttledFn('third')

      expect(fn).toHaveBeenCalledTimes(2)
      expect(fn).toHaveBeenCalledWith('third')
    })
  })

  describe('queryKeyFactory', () => {
    it('should generate correct conservation keys', () => {
      expect(queryKeyFactory.conservation.all).toEqual(['conservation'])
      expect(queryKeyFactory.conservation.points()).toEqual(['conservation', 'points'])
      expect(queryKeyFactory.conservation.point('123')).toEqual(['conservation', 'points', '123'])
      expect(queryKeyFactory.conservation.temperatures('123')).toEqual(['conservation', 'points', '123', 'temperatures'])
    })

    it('should generate correct inventory keys', () => {
      expect(queryKeyFactory.inventory.all).toEqual(['inventory'])
      expect(queryKeyFactory.inventory.products()).toEqual(['inventory', 'products'])
      expect(queryKeyFactory.inventory.product('456')).toEqual(['inventory', 'products', '456'])
      expect(queryKeyFactory.inventory.categories()).toEqual(['inventory', 'categories'])
    })

    it('should generate correct staff keys', () => {
      expect(queryKeyFactory.staff.all).toEqual(['staff'])
      expect(queryKeyFactory.staff.list()).toEqual(['staff', 'list'])
      expect(queryKeyFactory.staff.member('789')).toEqual(['staff', 'list', '789'])
    })

    it('should generate correct calendar keys', () => {
      expect(queryKeyFactory.calendar.all).toEqual(['calendar'])
      expect(queryKeyFactory.calendar.events()).toEqual(['calendar', 'events'])
      expect(queryKeyFactory.calendar.event('abc')).toEqual(['calendar', 'events', 'abc'])
    })
  })

  describe('performance constants', () => {
    it('should have correct threshold values', () => {
      expect(virtualizeListThreshold).toBe(50)
      expect(pageSizeDefault).toBe(20)
    })
  })

  describe('trackPerformance', () => {
    it('should warn for slow operations', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      // Mock performance.now to simulate slow operation
      const originalNow = performance.now
      performance.now = vi.fn().mockReturnValueOnce(2000)

      trackPerformance('slow operation', 0)

      expect(consoleSpy).toHaveBeenCalledWith('Performance: slow operation took 2000.00ms')

      performance.now = originalNow
      consoleSpy.mockRestore()
    })

    it('should not warn for fast operations', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      // Mock performance.now to simulate fast operation
      const originalNow = performance.now
      performance.now = vi.fn().mockReturnValueOnce(500)

      trackPerformance('fast operation', 0)

      expect(consoleSpy).not.toHaveBeenCalled()

      performance.now = originalNow
      consoleSpy.mockRestore()
    })
  })

  describe('createCleanupManager', () => {
    it('should manage cleanup functions', () => {
      const cleanup1 = vi.fn()
      const cleanup2 = vi.fn()

      const manager = createCleanupManager()

      manager.add(cleanup1)
      manager.add(cleanup2)

      expect(cleanup1).not.toHaveBeenCalled()
      expect(cleanup2).not.toHaveBeenCalled()

      manager.cleanup()

      expect(cleanup1).toHaveBeenCalledTimes(1)
      expect(cleanup2).toHaveBeenCalledTimes(1)
    })

    it('should clear cleanup functions after execution', () => {
      const cleanup = vi.fn()
      const manager = createCleanupManager()

      manager.add(cleanup)
      manager.cleanup()
      manager.cleanup() // Second call

      expect(cleanup).toHaveBeenCalledTimes(1) // Should only be called once
    })
  })

  describe('batchUpdates', () => {
    it('should batch items correctly', async () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const updateFn = vi.fn().mockResolvedValue(undefined)

      await batchUpdates(items, updateFn, 3)

      expect(updateFn).toHaveBeenCalledTimes(4) // 10 items / 3 batch size = 4 batches

      // Check that batches were called with correct data
      const calls = updateFn.mock.calls
      expect(calls[0][0]).toEqual([1, 2, 3])
      expect(calls[1][0]).toEqual([4, 5, 6])
      expect(calls[2][0]).toEqual([7, 8, 9])
      expect(calls[3][0]).toEqual([10])
    })

    it('should handle empty arrays', async () => {
      const items: number[] = []
      const updateFn = vi.fn().mockResolvedValue(undefined)

      await batchUpdates(items, updateFn, 3)

      expect(updateFn).not.toHaveBeenCalled()
    })

    it('should use default batch size', async () => {
      const items = Array.from({ length: 25 }, (_, i) => i + 1)
      const updateFn = vi.fn().mockResolvedValue(undefined)

      await batchUpdates(items, updateFn) // No batch size specified

      expect(updateFn).toHaveBeenCalledTimes(3) // 25 items / 10 default = 3 batches
    })
  })

  describe('optimizeImage', () => {
    it('should handle image optimization setup', () => {
      // Mock canvas and image elements
      const mockCanvas = {
        getContext: vi.fn().mockReturnValue({
          drawImage: vi.fn(),
        }),
        toBlob: vi.fn(),
        width: 0,
        height: 0,
      }

      const mockImage = {
        onload: null as any,
        src: '',
        width: 1600,
        height: 1200,
      }

      global.document = {
        createElement: vi.fn((tag: string) => {
          if (tag === 'canvas') return mockCanvas
          if (tag === 'img') return mockImage
          return {}
        }),
      } as any

      global.URL = {
        createObjectURL: vi.fn().mockReturnValue('mock-url'),
      } as any

      // Test that the function sets up properly
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const promise = optimizeImage(file, 800, 0.8)

      expect(global.document.createElement).toHaveBeenCalledWith('canvas')
      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d')
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(file)

      // This is a basic setup test since full image processing
      // would require more complex mocking of browser APIs
      expect(promise).toBeInstanceOf(Promise)
    })
  })
})