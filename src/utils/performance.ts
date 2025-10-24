/**
 * Performance optimization utilities for HACCP Business Manager
 */

// Memory management utilities
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Image optimization for inventory photos
export const optimizeImage = (
  file: File,
  maxWidth: number = 800,
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise(resolve => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio

      // Draw and compress
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(resolve as any, 'image/jpeg', quality)
    }

    img.src = URL.createObjectURL(file)
  })
}

// React Query cache management
export const queryKeyFactory = {
  conservation: {
    all: ['conservation'] as const,
    points: () => [...queryKeyFactory.conservation.all, 'points'] as const,
    point: (id: string) =>
      [...queryKeyFactory.conservation.points(), id] as const,
    temperatures: (pointId: string) =>
      [...queryKeyFactory.conservation.point(pointId), 'temperatures'] as const,
  },
  inventory: {
    all: ['inventory'] as const,
    products: () => [...queryKeyFactory.inventory.all, 'products'] as const,
    product: (id: string) =>
      [...queryKeyFactory.inventory.products(), id] as const,
    categories: () => [...queryKeyFactory.inventory.all, 'categories'] as const,
  },
  staff: {
    all: ['staff'] as const,
    list: () => [...queryKeyFactory.staff.all, 'list'] as const,
    member: (id: string) => [...queryKeyFactory.staff.list(), id] as const,
  },
  calendar: {
    all: ['calendar'] as const,
    events: () => [...queryKeyFactory.calendar.all, 'events'] as const,
    event: (id: string) => [...queryKeyFactory.calendar.events(), id] as const,
  },
}

// Memory cleanup for large lists
export const virtualizeListThreshold = 50
export const pageSizeDefault = 20

// Error boundary performance tracking
export const trackPerformance = (operation: string, startTime: number) => {
  const duration = performance.now() - startTime
  if (duration > 1000) {
    console.warn(`Performance: ${operation} took ${duration.toFixed(2)}ms`)
  }
}

// Clean up event listeners
export const createCleanupManager = () => {
  const cleanupFunctions: (() => void)[] = []

  return {
    add: (cleanup: () => void) => cleanupFunctions.push(cleanup),
    cleanup: () => {
      cleanupFunctions.forEach((fn: () => void) => fn())
      cleanupFunctions.length = 0
    },
  }
}

// Batch operations for better performance
export const batchUpdates = <T>(
  items: T[],
  updateFn: (batch: T[]) => Promise<void>,
  batchSize: number = 10
): Promise<void[]> => {
  const batches = []
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize))
  }
  return Promise.all(batches.map(updateFn))
}
