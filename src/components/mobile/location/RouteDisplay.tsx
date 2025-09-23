/**
 * RouteDisplay - B.8.4 Advanced Mobile Features
 * Route planning and optimization display component for HACCP inspections
 */

import React, { useState, useEffect } from 'react'
import {
  routeOptimizer,
  Route,
  RoutePoint,
  OptimizationOptions,
  RouteProgress,
} from '@/services/mobile/location'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Route as RouteIcon,
  Navigation,
  Clock,
  MapPin,
  Play,
  Pause,
  Stop,
  RefreshCw,
  Settings,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Target,
  Plus,
} from 'lucide-react'

interface RouteDisplayProps {
  onRouteSelect?: (route: Route) => void
  onRouteStart?: (route: Route) => void
  onRouteComplete?: (route: Route) => void
  className?: string
}

interface RouteStats {
  totalRoutes: number
  activeRoutes: number
  completedRoutes: number
  averageEfficiency: number
  totalDistance: number
  totalDuration: number
}

export const RouteDisplay: React.FC<RouteDisplayProps> = ({
  onRouteSelect,
  onRouteStart,
  onRouteComplete,
  className = '',
}) => {
  const [routes, setRoutes] = useState<Route[]>([])
  const [activeRoutes, setActiveRoutes] = useState<RouteProgress[]>([])
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [stats, setStats] = useState<RouteStats>({
    totalRoutes: 0,
    activeRoutes: 0,
    completedRoutes: 0,
    averageEfficiency: 0,
    totalDistance: 0,
    totalDuration: 0,
  })
  const [optimizationOptions, setOptimizationOptions] =
    useState<OptimizationOptions>({
      algorithm: 'nearest_neighbor',
      respectTimeWindows: true,
      respectDependencies: true,
      minimizeDistance: true,
    })
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    initializeRoutes()
  }, [])

  const initializeRoutes = async () => {
    try {
      setIsLoading(true)
      await routeOptimizer.initialize()

      // Load routes
      const loadedRoutes = routeOptimizer.getRoutes()
      setRoutes(loadedRoutes)

      // Load active routes
      const loadedActiveRoutes = routeOptimizer.getActiveRoutes()
      setActiveRoutes(loadedActiveRoutes)

      // Calculate stats
      calculateStats(loadedRoutes, loadedActiveRoutes)
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to initialize routes'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStats = (
    routesList: Route[],
    activeRoutesList: RouteProgress[]
  ) => {
    const totalRoutes = routesList.length
    const activeRoutes = activeRoutesList.length
    const completedRoutes = routesList.filter(
      r => r.status === 'completed'
    ).length

    const totalDistance = routesList.reduce(
      (sum, route) => sum + route.totalDistance,
      0
    )
    const totalDuration = routesList.reduce(
      (sum, route) => sum + route.totalDuration,
      0
    )
    const averageEfficiency =
      routesList.length > 0
        ? routesList.reduce((sum, route) => sum + route.efficiency, 0) /
          routesList.length
        : 0

    setStats({
      totalRoutes,
      activeRoutes,
      completedRoutes,
      averageEfficiency,
      totalDistance,
      totalDuration,
    })
  }

  const handleRouteSelect = (route: Route) => {
    setSelectedRoute(route)
    onRouteSelect?.(route)
  }

  const handleOptimizeRoute = async (route: Route) => {
    try {
      setIsOptimizing(true)
      const result = await routeOptimizer.optimizeRoute(
        route.id,
        optimizationOptions
      )

      if (result.success && result.route) {
        setRoutes(prev =>
          prev.map(r => (r.id === route.id ? result.route! : r))
        )
        setSelectedRoute(result.route)
        calculateStats(routes, activeRoutes)
      } else {
        setError(result.error || 'Optimization failed')
      }
    } catch (error) {
      setError('Optimization failed')
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleStartRoute = (route: Route) => {
    const progress = routeOptimizer.startRoute(route.id)
    if (progress) {
      setActiveRoutes(prev => [...prev, progress])
      onRouteStart?.(route)
    }
  }

  const handleCompleteRoute = (routeId: string) => {
    const success = routeOptimizer.completeRoute(routeId)
    if (success) {
      setActiveRoutes(prev => prev.filter(r => r.routeId !== routeId))
      setRoutes(prev =>
        prev.map(r => (r.id === routeId ? { ...r, status: 'completed' } : r))
      )
      const route = routes.find(r => r.id === routeId)
      if (route) {
        onRouteComplete?.(route)
      }
      calculateStats(
        routes,
        activeRoutes.filter(r => r.routeId !== routeId)
      )
    }
  }

  const getRouteStatusColor = (status: Route['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoutePriorityColor = (priority: RoutePoint['priority']) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'critical':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDistance = (meters: number): string => {
    if (meters < 1000) return `${Math.round(meters)}m`
    return `${(meters / 1000).toFixed(1)}km`
  }

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${Math.round(minutes)}m`
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `${hours}h ${mins}m`
  }

  const getRouteProgress = (routeId: string): RouteProgress | null => {
    return activeRoutes.find(r => r.routeId === routeId) || null
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading routes...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      {/* Stats Overview */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RouteIcon className="h-5 w-5" />
            Route Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalRoutes}
              </div>
              <div className="text-sm text-blue-700">Total Routes</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {stats.activeRoutes}
              </div>
              <div className="text-sm text-green-700">Active</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {stats.averageEfficiency.toFixed(1)}%
              </div>
              <div className="text-sm text-purple-700">Avg Efficiency</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {formatDistance(stats.totalDistance)}
              </div>
              <div className="text-sm text-orange-700">Total Distance</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Controls */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Optimization Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Algorithm
              </label>
              <Select
                value={optimizationOptions.algorithm}
                onValueChange={value =>
                  setOptimizationOptions(prev => ({
                    ...prev,
                    algorithm: value as OptimizationOptions['algorithm'],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nearest_neighbor">
                    Nearest Neighbor
                  </SelectItem>
                  <SelectItem value="genetic">Genetic Algorithm</SelectItem>
                  <SelectItem value="simulated_annealing">
                    Simulated Annealing
                  </SelectItem>
                  <SelectItem value="tsp_exact">Exact TSP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={optimizationOptions.minimizeDistance || false}
                  onChange={e =>
                    setOptimizationOptions(prev => ({
                      ...prev,
                      minimizeDistance: e.target.checked,
                    }))
                  }
                />
                <span className="text-sm">Minimize Distance</span>
              </label>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={optimizationOptions.respectTimeWindows || false}
                  onChange={e =>
                    setOptimizationOptions(prev => ({
                      ...prev,
                      respectTimeWindows: e.target.checked,
                    }))
                  }
                />
                <span className="text-sm">Time Windows</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Routes List */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Routes ({routes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {routes.map(route => {
              const progress = getRouteProgress(route.id)
              return (
                <div
                  key={route.id}
                  className={`p-4 border rounded-lg transition-all ${
                    selectedRoute?.id === route.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleRouteSelect(route)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <RouteIcon className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium">{route.name}</h4>
                        <p className="text-sm text-gray-600">
                          {route.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={getRouteStatusColor(route.status)}>
                        {route.status}
                      </Badge>

                      {route.status === 'draft' && (
                        <Button
                          size="sm"
                          onClick={e => {
                            e.stopPropagation()
                            handleOptimizeRoute(route)
                          }}
                          disabled={isOptimizing}
                        >
                          {isOptimizing ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                          ) : (
                            <TrendingUp className="h-4 w-4 mr-1" />
                          )}
                          Optimize
                        </Button>
                      )}

                      {route.status === 'active' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={e => {
                            e.stopPropagation()
                            handleCompleteRoute(route.id)
                          }}
                        >
                          <Stop className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      )}

                      {route.status === 'draft' && !progress && (
                        <Button
                          size="sm"
                          onClick={e => {
                            e.stopPropagation()
                            handleStartRoute(route)
                          }}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Route Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{route.points.length} points</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Navigation className="h-4 w-4 text-gray-500" />
                      <span>{formatDistance(route.totalDistance)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{formatDuration(route.totalDuration)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-gray-500" />
                      <span>{route.efficiency.toFixed(1)}% efficiency</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {progress && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{progress.efficiency.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${progress.efficiency}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                        <span>{progress.completedPoints.length} completed</span>
                        <span>{progress.remainingPoints.length} remaining</span>
                      </div>
                    </div>
                  )}

                  {/* Route Points Preview */}
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-2">
                      {route.optimizedOrder.slice(0, 5).map((point, index) => (
                        <div key={point.id} className="flex items-center gap-1">
                          <Badge
                            variant="outline"
                            className={`text-xs ${getRoutePriorityColor(point.priority)}`}
                          >
                            {index + 1}. {point.name}
                          </Badge>
                        </div>
                      ))}
                      {route.optimizedOrder.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{route.optimizedOrder.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Route Details */}
      {selectedRoute && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Route Details: {selectedRoute.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Route Information */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Points</p>
                  <p className="font-medium">{selectedRoute.points.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Distance</p>
                  <p className="font-medium">
                    {formatDistance(selectedRoute.totalDistance)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium">
                    {formatDuration(selectedRoute.totalDuration)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Efficiency</p>
                  <p className="font-medium">
                    {selectedRoute.efficiency.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Route Points */}
              <div>
                <h5 className="font-medium mb-3">Route Points</h5>
                <div className="space-y-2">
                  {selectedRoute.optimizedOrder.map((point, index) => (
                    <div
                      key={point.id}
                      className="flex items-center gap-3 p-2 bg-gray-50 rounded"
                    >
                      <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{point.name}</span>
                          <Badge
                            className={getRoutePriorityColor(point.priority)}
                          >
                            {point.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {point.type} •{' '}
                          {formatDuration(point.estimatedDuration)}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {point.latitude.toFixed(4)},{' '}
                        {point.longitude.toFixed(4)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default RouteDisplay
