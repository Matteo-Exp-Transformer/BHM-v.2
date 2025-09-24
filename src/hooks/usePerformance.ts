import { useEffect, useCallback } from 'react'

// interface PerformanceMetrics {
//   loadTime: number
//   renderTime: number
//   memoryUsage?: number
// }

export const usePerformance = (componentName: string) => {
  const startTime = performance.now()

  const measureRenderTime = useCallback(() => {
    const endTime = performance.now()
    const renderTime = endTime - startTime

    // Log performance metrics in development
    if (import.meta.env.DEV) {
      console.log(
        `[Performance] ${componentName} render time: ${renderTime.toFixed(2)}ms`
      )
    }

    return renderTime
  }, [componentName, startTime])

  const measureMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      const memoryUsage = memory.usedJSHeapSize / 1024 / 1024 // MB

      if (import.meta.env.DEV) {
        console.log(
          `[Performance] ${componentName} memory usage: ${memoryUsage.toFixed(2)}MB`
        )
      }

      return memoryUsage
    }
    return undefined
  }, [componentName])

  useEffect(() => {
    measureRenderTime()
    measureMemoryUsage()

    // Report to analytics in production
    if (import.meta.env.PROD) {
      // You can integrate with analytics services here
      // Example: analytics.track('component_performance', {
      //   component: componentName,
      //   renderTime,
      //   memoryUsage
      // })
    }
  }, [measureRenderTime, measureMemoryUsage])

  return {
    measureRenderTime,
    measureMemoryUsage,
  }
}

export default usePerformance
