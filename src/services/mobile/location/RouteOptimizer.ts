/**
 * RouteOptimizer - B.8.4 Advanced Mobile Features
 * Path planning and optimization for HACCP inspection rounds
 */

import { LocationData, ConservationPointLocation } from './GPSService'

export interface RoutePoint {
  id: string
  type: 'conservation_point' | 'inspection_route' | 'emergency' | 'custom'
  name: string
  latitude: number
  longitude: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  estimatedDuration: number // minutes
  requiredEquipment?: string[]
  haccpContext?: {
    conservationPointId?: string
    taskId?: string
    inspectionId?: string
    temperatureCheck?: boolean
    cleanlinessCheck?: boolean
    documentationRequired?: boolean
  }
  timeWindows?: {
    start: Date
    end: Date
    flexible: boolean
  }[]
  dependencies?: string[] // IDs of points that must be visited before this one
}

export interface Route {
  id: string
  name: string
  description?: string
  points: RoutePoint[]
  optimizedOrder: RoutePoint[]
  totalDistance: number // meters
  totalDuration: number // minutes
  efficiency: number // 0-100, higher is better
  createdAt: Date
  updatedAt: Date
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  metadata: {
    createdBy: string
    assignedTo?: string
    vehicleType?: 'foot' | 'bike' | 'car' | 'truck'
    weatherConditions?: string
    notes?: string
  }
}

export interface OptimizationOptions {
  algorithm:
    | 'nearest_neighbor'
    | 'genetic'
    | 'simulated_annealing'
    | 'tsp_exact'
  maxDuration?: number // minutes
  respectTimeWindows?: boolean
  respectDependencies?: boolean
  avoidTraffic?: boolean
  minimizeDistance?: boolean
  minimizeDuration?: boolean
  vehicleCapacity?: number
  startLocation?: { latitude: number; longitude: number }
  endLocation?: { latitude: number; longitude: number }
}

export interface OptimizationResult {
  success: boolean
  route: Route | null
  efficiency: number
  totalDistance: number
  totalDuration: number
  optimizationTime: number // milliseconds
  algorithm: string
  iterations?: number
  error?: string
}

export interface RouteProgress {
  routeId: string
  currentPointIndex: number
  completedPoints: string[]
  remainingPoints: string[]
  currentLocation?: LocationData
  estimatedArrival?: Date
  estimatedCompletion?: Date
  actualDuration: number // minutes
  efficiency: number // 0-100
}

export class RouteOptimizer {
  private static instance: RouteOptimizer
  private routes: Map<string, Route> = new Map()
  private activeRoutes: Map<string, RouteProgress> = new Map()
  private optimizationHistory: OptimizationResult[] = []

  private constructor() {}

  public static getInstance(): RouteOptimizer {
    if (!RouteOptimizer.instance) {
      RouteOptimizer.instance = new RouteOptimizer()
    }
    return RouteOptimizer.instance
  }

  /**
   * Initialize route optimizer
   */
  public async initialize(): Promise<void> {
    try {
      await this.loadDefaultRoutes()
      console.log('🗺️ Route optimizer initialized')
    } catch (error) {
      console.error('❌ Route optimizer initialization failed:', error)
      throw new Error('Route optimizer initialization failed')
    }
  }

  /**
   * Create new route
   */
  public createRoute(
    name: string,
    points: RoutePoint[],
    metadata: Route['metadata'],
    description?: string
  ): string {
    const routeId = this.generateRouteId()

    const route: Route = {
      id: routeId,
      name,
      description,
      points,
      optimizedOrder: [...points], // Will be optimized later
      totalDistance: 0,
      totalDuration: 0,
      efficiency: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'draft',
      metadata,
    }

    this.routes.set(routeId, route)
    console.log(`🗺️ Route created: ${name} (${points.length} points)`)
    return routeId
  }

  /**
   * Optimize route
   */
  public async optimizeRoute(
    routeId: string,
    options: OptimizationOptions = {}
  ): Promise<OptimizationResult> {
    const route = this.routes.get(routeId)
    if (!route) {
      return {
        success: false,
        route: null,
        efficiency: 0,
        totalDistance: 0,
        totalDuration: 0,
        optimizationTime: 0,
        algorithm: options.algorithm || 'nearest_neighbor',
        error: 'Route not found',
      }
    }

    const startTime = Date.now()
    let result: OptimizationResult

    try {
      switch (options.algorithm || 'nearest_neighbor') {
        case 'nearest_neighbor':
          result = await this.optimizeNearestNeighbor(route, options)
          break
        case 'genetic':
          result = await this.optimizeGenetic(route, options)
          break
        case 'simulated_annealing':
          result = await this.optimizeSimulatedAnnealing(route, options)
          break
        case 'tsp_exact':
          result = await this.optimizeTSPExact(route, options)
          break
        default:
          throw new Error(
            `Unknown optimization algorithm: ${options.algorithm}`
          )
      }

      result.optimizationTime = Date.now() - startTime

      if (result.success && result.route) {
        this.routes.set(routeId, result.route)
        this.optimizationHistory.push(result)
        console.log(
          `🗺️ Route optimized: ${route.name} (efficiency: ${result.efficiency.toFixed(1)}%)`
        )
      }

      return result
    } catch (error) {
      const errorResult: OptimizationResult = {
        success: false,
        route: null,
        efficiency: 0,
        totalDistance: 0,
        totalDuration: 0,
        optimizationTime: Date.now() - startTime,
        algorithm: options.algorithm || 'nearest_neighbor',
        error: error instanceof Error ? error.message : 'Unknown error',
      }

      this.optimizationHistory.push(errorResult)
      return errorResult
    }
  }

  /**
   * Start route execution
   */
  public startRoute(
    routeId: string,
    currentLocation?: LocationData
  ): RouteProgress | null {
    const route = this.routes.get(routeId)
    if (!route || route.status !== 'active') {
      return null
    }

    const progress: RouteProgress = {
      routeId,
      currentPointIndex: 0,
      completedPoints: [],
      remainingPoints: route.optimizedOrder.map(p => p.id),
      currentLocation,
      estimatedArrival: currentLocation
        ? this.calculateArrivalTime(route.optimizedOrder[0], currentLocation)
        : undefined,
      estimatedCompletion: this.calculateCompletionTime(route),
      actualDuration: 0,
      efficiency: 100,
    }

    this.activeRoutes.set(routeId, progress)
    route.status = 'active'

    console.log(`🗺️ Route started: ${route.name}`)
    return progress
  }

  /**
   * Update route progress
   */
  public updateProgress(
    routeId: string,
    currentLocation: LocationData,
    completedPointId?: string
  ): RouteProgress | null {
    const progress = this.activeRoutes.get(routeId)
    if (!progress) return null

    progress.currentLocation = currentLocation

    if (completedPointId) {
      const pointIndex = progress.remainingPoints.indexOf(completedPointId)
      if (pointIndex !== -1) {
        progress.completedPoints.push(completedPointId)
        progress.remainingPoints.splice(pointIndex, 1)
        progress.currentPointIndex++

        // Update estimated arrival for next point
        if (progress.remainingPoints.length > 0) {
          const nextPoint = this.getRoutePoint(
            routeId,
            progress.remainingPoints[0]
          )
          if (nextPoint) {
            progress.estimatedArrival = this.calculateArrivalTime(
              nextPoint,
              currentLocation
            )
          }
        }
      }
    } else {
      // Update estimated arrival for current point
      const currentPoint = this.getRoutePoint(
        routeId,
        progress.remainingPoints[0]
      )
      if (currentPoint) {
        progress.estimatedArrival = this.calculateArrivalTime(
          currentPoint,
          currentLocation
        )
      }
    }

    // Calculate efficiency
    progress.efficiency = this.calculateRouteEfficiency(progress)

    return progress
  }

  /**
   * Complete route
   */
  public completeRoute(routeId: string): boolean {
    const route = this.routes.get(routeId)
    const progress = this.activeRoutes.get(routeId)

    if (!route || !progress) return false

    route.status = 'completed'
    this.activeRoutes.delete(routeId)

    console.log(`🗺️ Route completed: ${route.name}`)
    return true
  }

  /**
   * Get route by ID
   */
  public getRoute(id: string): Route | null {
    return this.routes.get(id) || null
  }

  /**
   * Get all routes
   */
  public getRoutes(): Route[] {
    return Array.from(this.routes.values())
  }

  /**
   * Get active routes
   */
  public getActiveRoutes(): RouteProgress[] {
    return Array.from(this.activeRoutes.values())
  }

  /**
   * Get route progress
   */
  public getRouteProgress(routeId: string): RouteProgress | null {
    return this.activeRoutes.get(routeId) || null
  }

  /**
   * Delete route
   */
  public deleteRoute(id: string): boolean {
    const route = this.routes.get(id)
    if (!route) return false

    this.routes.delete(id)
    this.activeRoutes.delete(id)

    console.log(`🗺️ Route deleted: ${route.name}`)
    return true
  }

  /**
   * Get optimization history
   */
  public getOptimizationHistory(): OptimizationResult[] {
    return [...this.optimizationHistory]
  }

  /**
   * Nearest Neighbor optimization algorithm
   */
  private async optimizeNearestNeighbor(
    route: Route,
    options: OptimizationOptions
  ): Promise<OptimizationResult> {
    const points = [...route.points]
    const optimizedOrder: RoutePoint[] = []
    let currentLocation = options.startLocation

    // Start from first point or start location
    let currentPoint = points[0]
    if (options.startLocation) {
      // Find nearest point to start location
      let minDistance = Infinity
      for (const point of points) {
        const distance = this.calculateDistance(
          options.startLocation.latitude,
          options.startLocation.longitude,
          point.latitude,
          point.longitude
        )
        if (distance < minDistance) {
          minDistance = distance
          currentPoint = point
        }
      }
    }

    optimizedOrder.push(currentPoint)
    points.splice(points.indexOf(currentPoint), 1)

    // Continue with nearest neighbor
    while (points.length > 0) {
      let nearestPoint = points[0]
      let minDistance = this.calculateDistance(
        currentPoint.latitude,
        currentPoint.longitude,
        nearestPoint.latitude,
        nearestPoint.longitude
      )

      for (const point of points) {
        const distance = this.calculateDistance(
          currentPoint.latitude,
          currentPoint.longitude,
          point.latitude,
          point.longitude
        )
        if (distance < minDistance) {
          minDistance = distance
          nearestPoint = point
        }
      }

      optimizedOrder.push(nearestPoint)
      points.splice(points.indexOf(nearestPoint), 1)
      currentPoint = nearestPoint
    }

    const optimizedRoute = { ...route, optimizedOrder }
    const totalDistance = this.calculateTotalDistance(optimizedOrder)
    const totalDuration = this.calculateTotalDuration(optimizedOrder)
    const efficiency = this.calculateEfficiency(route.points, optimizedOrder)

    return {
      success: true,
      route: optimizedRoute,
      efficiency,
      totalDistance,
      totalDuration,
      optimizationTime: 0, // Will be set by caller
      algorithm: 'nearest_neighbor',
      iterations: 1,
    }
  }

  /**
   * Genetic algorithm optimization (simplified)
   */
  private async optimizeGenetic(
    route: Route,
    options: OptimizationOptions
  ): Promise<OptimizationResult> {
    // Simplified genetic algorithm implementation
    // In a real implementation, this would be more sophisticated

    const populationSize = 50
    const generations = 100
    let bestRoute = route.points
    let bestDistance = this.calculateTotalDistance(route.points)

    for (let gen = 0; gen < generations; gen++) {
      const population = this.generatePopulation(route.points, populationSize)

      for (const individual of population) {
        const distance = this.calculateTotalDistance(individual)
        if (distance < bestDistance) {
          bestDistance = distance
          bestRoute = individual
        }
      }
    }

    const optimizedRoute = { ...route, optimizedOrder: bestRoute }
    const totalDistance = this.calculateTotalDistance(bestRoute)
    const totalDuration = this.calculateTotalDuration(bestRoute)
    const efficiency = this.calculateEfficiency(route.points, bestRoute)

    return {
      success: true,
      route: optimizedRoute,
      efficiency,
      totalDistance,
      totalDuration,
      optimizationTime: 0,
      algorithm: 'genetic',
      iterations: generations,
    }
  }

  /**
   * Simulated Annealing optimization
   */
  private async optimizeSimulatedAnnealing(
    route: Route,
    options: OptimizationOptions
  ): Promise<OptimizationResult> {
    // Simplified simulated annealing implementation
    let currentRoute = [...route.points]
    let bestRoute = [...currentRoute]
    let bestDistance = this.calculateTotalDistance(currentRoute)

    const initialTemperature = 1000
    const coolingRate = 0.95
    const iterations = 1000

    let temperature = initialTemperature

    for (let i = 0; i < iterations; i++) {
      const newRoute = this.mutateRoute(currentRoute)
      const currentDistance = this.calculateTotalDistance(currentRoute)
      const newDistance = this.calculateTotalDistance(newRoute)

      const delta = newDistance - currentDistance

      if (delta < 0 || Math.random() < Math.exp(-delta / temperature)) {
        currentRoute = newRoute
        if (newDistance < bestDistance) {
          bestDistance = newDistance
          bestRoute = [...newRoute]
        }
      }

      temperature *= coolingRate
    }

    const optimizedRoute = { ...route, optimizedOrder: bestRoute }
    const totalDistance = this.calculateTotalDistance(bestRoute)
    const totalDuration = this.calculateTotalDuration(bestRoute)
    const efficiency = this.calculateEfficiency(route.points, bestRoute)

    return {
      success: true,
      route: optimizedRoute,
      efficiency,
      totalDistance,
      totalDuration,
      optimizationTime: 0,
      algorithm: 'simulated_annealing',
      iterations,
    }
  }

  /**
   * Exact TSP solution (for small problems)
   */
  private async optimizeTSPExact(
    route: Route,
    options: OptimizationOptions
  ): Promise<OptimizationResult> {
    // For small numbers of points, we can try all permutations
    // This is not practical for large numbers of points
    if (route.points.length > 10) {
      throw new Error(
        'TSP exact solution not practical for more than 10 points'
      )
    }

    const points = route.points
    let bestRoute = [...points]
    let bestDistance = this.calculateTotalDistance(points)

    // Generate all permutations (simplified - in reality would use more efficient methods)
    const permutations = this.generatePermutations(points)

    for (const permutation of permutations) {
      const distance = this.calculateTotalDistance(permutation)
      if (distance < bestDistance) {
        bestDistance = distance
        bestRoute = [...permutation]
      }
    }

    const optimizedRoute = { ...route, optimizedOrder: bestRoute }
    const totalDistance = this.calculateTotalDistance(bestRoute)
    const totalDuration = this.calculateTotalDuration(bestRoute)
    const efficiency = this.calculateEfficiency(route.points, bestRoute)

    return {
      success: true,
      route: optimizedRoute,
      efficiency,
      totalDistance,
      totalDuration,
      optimizationTime: 0,
      algorithm: 'tsp_exact',
      iterations: permutations.length,
    }
  }

  /**
   * Calculate distance between two points
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // Distance in meters
  }

  /**
   * Calculate total distance for route
   */
  private calculateTotalDistance(points: RoutePoint[]): number {
    let totalDistance = 0

    for (let i = 0; i < points.length - 1; i++) {
      const distance = this.calculateDistance(
        points[i].latitude,
        points[i].longitude,
        points[i + 1].latitude,
        points[i + 1].longitude
      )
      totalDistance += distance
    }

    return totalDistance
  }

  /**
   * Calculate total duration for route
   */
  private calculateTotalDuration(points: RoutePoint[]): number {
    let totalDuration = 0

    for (const point of points) {
      totalDuration += point.estimatedDuration
    }

    // Add travel time (assuming average speed of 5 km/h for walking)
    const totalDistance = this.calculateTotalDistance(points)
    const travelTime = totalDistance / (5000 / 60) // Convert to minutes
    totalDuration += travelTime

    return totalDuration
  }

  /**
   * Calculate route efficiency
   */
  private calculateEfficiency(
    original: RoutePoint[],
    optimized: RoutePoint[]
  ): number {
    const originalDistance = this.calculateTotalDistance(original)
    const optimizedDistance = this.calculateTotalDistance(optimized)

    if (originalDistance === 0) return 100

    const improvement =
      ((originalDistance - optimizedDistance) / originalDistance) * 100
    return Math.max(0, Math.min(100, 100 + improvement))
  }

  /**
   * Calculate arrival time for point
   */
  private calculateArrivalTime(
    point: RoutePoint,
    currentLocation: LocationData
  ): Date {
    const distance = this.calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      point.latitude,
      point.longitude
    )

    // Assuming average walking speed of 5 km/h
    const travelTimeMinutes = distance / (5000 / 60)

    return new Date(Date.now() + travelTimeMinutes * 60 * 1000)
  }

  /**
   * Calculate completion time for route
   */
  private calculateCompletionTime(route: Route): Date {
    const totalDuration = this.calculateTotalDuration(route.optimizedOrder)
    return new Date(Date.now() + totalDuration * 60 * 1000)
  }

  /**
   * Calculate route efficiency for progress
   */
  private calculateRouteEfficiency(progress: RouteProgress): number {
    if (progress.remainingPoints.length === 0) return 100

    const completedRatio =
      progress.completedPoints.length /
      (progress.completedPoints.length + progress.remainingPoints.length)

    return completedRatio * 100
  }

  /**
   * Get route point by ID
   */
  private getRoutePoint(routeId: string, pointId: string): RoutePoint | null {
    const route = this.routes.get(routeId)
    if (!route) return null

    return route.optimizedOrder.find(p => p.id === pointId) || null
  }

  /**
   * Generate population for genetic algorithm
   */
  private generatePopulation(
    points: RoutePoint[],
    size: number
  ): RoutePoint[][] {
    const population: RoutePoint[][] = []

    for (let i = 0; i < size; i++) {
      const individual = [...points]
      // Shuffle the array
      for (let j = individual.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1))
        ;[individual[j], individual[k]] = [individual[k], individual[j]]
      }
      population.push(individual)
    }

    return population
  }

  /**
   * Mutate route for simulated annealing
   */
  private mutateRoute(route: RoutePoint[]): RoutePoint[] {
    const mutated = [...route]
    const i = Math.floor(Math.random() * mutated.length)
    const j = (Math.floor(Math.random() * mutated.length)[
      // Swap two points
      (mutated[i], mutated[j])
    ] = [mutated[j], mutated[i]])

    return mutated
  }

  /**
   * Generate permutations for exact TSP
   */
  private generatePermutations(points: RoutePoint[]): RoutePoint[][] {
    // Simplified permutation generation
    // In reality, would use more efficient methods for large sets
    if (points.length <= 1) return [points]

    const result: RoutePoint[][] = []
    for (let i = 0; i < points.length; i++) {
      const rest = [...points.slice(0, i), ...points.slice(i + 1)]
      const perms = this.generatePermutations(rest)
      for (const perm of perms) {
        result.push([points[i], ...perm])
      }
    }

    return result
  }

  /**
   * Load default routes
   */
  private async loadDefaultRoutes(): Promise<void> {
    const defaultRoutes: Route[] = [
      {
        id: 'route_001',
        name: 'Daily Temperature Check',
        description: 'Routine temperature monitoring for all critical points',
        points: [
          {
            id: 'point_001',
            type: 'conservation_point',
            name: 'Main Refrigeration Unit',
            latitude: 45.4642,
            longitude: 9.19,
            priority: 'high',
            estimatedDuration: 5,
            haccpContext: {
              conservationPointId: 'CP001',
              temperatureCheck: true,
              documentationRequired: true,
            },
          },
          {
            id: 'point_002',
            type: 'conservation_point',
            name: 'Deep Freezer Storage',
            latitude: 45.4645,
            longitude: 9.1905,
            priority: 'critical',
            estimatedDuration: 3,
            haccpContext: {
              conservationPointId: 'CP002',
              temperatureCheck: true,
              documentationRequired: true,
            },
          },
        ],
        optimizedOrder: [],
        totalDistance: 0,
        totalDuration: 0,
        efficiency: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'draft',
        metadata: {
          createdBy: 'system',
          vehicleType: 'foot',
        },
      },
    ]

    defaultRoutes.forEach(route => {
      this.routes.set(route.id, route)
    })
  }

  /**
   * Generate route ID
   */
  private generateRouteId(): string {
    return `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Export singleton instance
export const routeOptimizer = RouteOptimizer.getInstance()
export default routeOptimizer
