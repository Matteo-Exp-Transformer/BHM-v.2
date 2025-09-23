/**
 * LocationDemo - B.8.4 Advanced Mobile Features
 * Demo component showcasing location services integration for HACCP field work
 */

import React, { useState, useEffect } from 'react'
import { MapView } from './MapView'
import { LocationPicker } from './LocationPicker'
import { GeofenceVisualizer } from './GeofenceVisualizer'
import { RouteDisplay } from './RouteDisplay'
import { 
  gpsService, 
  geofenceManager, 
  offlineMapCache, 
  routeOptimizer, 
  locationHistory,
  LocationData,
  ConservationPointLocation,
  Geofence,
  Route
} from '@/services/mobile/location'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Navigation, 
  Shield, 
  Route as RouteIcon,
  Smartphone, 
  Zap,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'

export const LocationDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('map')
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null)
  const [conservationPoints, setConservationPoints] = useState<ConservationPointLocation[]>([])
  const [geofences, setGeofences] = useState<Geofence[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [demoStats, setDemoStats] = useState({
    locationsTracked: 0,
    geofenceEvents: 0,
    routesOptimized: 0,
    conservationPointsCreated: 0
  })
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    initializeDemo()
  }, [])

  const initializeDemo = async () => {
    try {
      // Initialize all location services
      await gpsService.initialize()
      await geofenceManager.initialize()
      await offlineMapCache.initialize()
      await routeOptimizer.initialize()
      await locationHistory.initialize()

      // Get initial data
      const points = gpsService.getConservationPoints()
      const geofencesList = geofenceManager.getGeofences()
      const routesList = routeOptimizer.getRoutes()

      setConservationPoints(points)
      setGeofences(geofencesList)
      setRoutes(routesList)

      // Subscribe to location updates
      gpsService.startTracking({ enableHighAccuracy: true }, (location) => {
        setCurrentLocation(location)
        setDemoStats(prev => ({ ...prev, locationsTracked: prev.locationsTracked + 1 }))
        
        // Update geofence manager with new location
        geofenceManager.updateLocation(location)
        
        // Add to location history
        locationHistory.addEntry(location, {
          activity: 'walking',
          batteryLevel: 85,
          appState: 'foreground'
        })
      })

      // Subscribe to geofence events
      geofenceManager.onEvent((event) => {
        setDemoStats(prev => ({ ...prev, geofenceEvents: prev.geofenceEvents + 1 }))
        console.log('Geofence event:', event)
      })

      setIsInitialized(true)
      console.log('🗺️ Location demo initialized successfully')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to initialize location demo')
      console.error('❌ Location demo initialization failed:', error)
    }
  }

  const handleLocationSelect = (location: { latitude: number; longitude: number; name?: string }) => {
    console.log('Location selected:', location)
  }

  const handleConservationPointCreate = async (point: Omit<ConservationPointLocation, 'id'>) => {
    try {
      // Create conservation point
      const newPoint: ConservationPointLocation = {
        ...point,
        id: `CP_${Date.now()}`
      }
      
      gpsService.addConservationPoint(newPoint)
      setConservationPoints(prev => [...prev, newPoint])
      setDemoStats(prev => ({ ...prev, conservationPointsCreated: prev.conservationPointsCreated + 1 }))
      
      console.log('Conservation point created:', newPoint)
    } catch (error) {
      console.error('Failed to create conservation point:', error)
    }
  }

  const handleGeofenceCreate = (geofence: Omit<Geofence, 'id' | 'metadata'>) => {
    try {
      const newGeofence: Geofence = {
        ...geofence,
        id: `GF_${Date.now()}`,
        metadata: {
          created: new Date(),
          updated: new Date(),
          priority: 'medium'
        }
      }
      
      geofenceManager.addGeofence(newGeofence)
      setGeofences(prev => [...prev, newGeofence])
      
      console.log('Geofence created:', newGeofence)
    } catch (error) {
      console.error('Failed to create geofence:', error)
    }
  }

  const handleRouteOptimize = async (route: Route) => {
    try {
      const result = await routeOptimizer.optimizeRoute(route.id, {
        algorithm: 'nearest_neighbor',
        minimizeDistance: true,
        respectTimeWindows: true
      })
      
      if (result.success && result.route) {
        setRoutes(prev => prev.map(r => r.id === route.id ? result.route! : r))
        setDemoStats(prev => ({ ...prev, routesOptimized: prev.routesOptimized + 1 }))
      }
    } catch (error) {
      console.error('Failed to optimize route:', error)
    }
  }

  const handleDownloadMapRegion = async () => {
    try {
      const region = {
        name: 'Demo HACCP Area',
        bounds: {
          north: 45.4645,
          south: 45.4640,
          east: 9.1905,
          west: 9.1895
        },
        zoomLevels: [15, 16, 17],
        priority: 'high' as const,
        haccpContext: {
          conservationPointIds: conservationPoints.map(p => p.id),
          inspectionRoutes: routes.map(r => r.id),
          emergencyLocations: []
        }
      }

      const regionId = await offlineMapCache.downloadRegion(region)
      console.log('Map region downloaded:', regionId)
    } catch (error) {
      console.error('Failed to download map region:', error)
    }
  }

  if (!isInitialized && !error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing location services...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-center mb-4">{error}</p>
          <Button onClick={initializeDemo} className="w-full">
            Retry Initialization
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            B.8.4 Advanced Mobile Features - Location Demo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            This demo showcases the location services for HACCP field work, 
            including GPS tracking, geofencing, route optimization, and offline mapping.
          </p>
          
          {/* Demo Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{demoStats.locationsTracked}</div>
              <div className="text-sm text-blue-700">Locations Tracked</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{demoStats.geofenceEvents}</div>
              <div className="text-sm text-green-700">Geofence Events</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{demoStats.routesOptimized}</div>
              <div className="text-sm text-purple-700">Routes Optimized</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{demoStats.conservationPointsCreated}</div>
              <div className="text-sm text-orange-700">Points Created</div>
            </div>
          </div>

          {/* Current Location Display */}
          {currentLocation && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Current Location</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-green-600">Coordinates:</span>
                  <p className="font-mono">{currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}</p>
                </div>
                <div>
                  <span className="text-green-600">Accuracy:</span>
                  <p>±{currentLocation.accuracy.toFixed(1)}m</p>
                </div>
                <div>
                  <span className="text-green-600">Source:</span>
                  <p className="capitalize">{currentLocation.source}</p>
                </div>
                <div>
                  <span className="text-green-600">Time:</span>
                  <p>{currentLocation.timestamp.toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="map" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Map
          </TabsTrigger>
          <TabsTrigger value="geofences" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Geofences
          </TabsTrigger>
          <TabsTrigger value="routes" className="flex items-center gap-2">
            <RouteIcon className="h-4 w-4" />
            Routes
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <Navigation className="h-4 w-4" />
            Tools
          </TabsTrigger>
        </TabsList>

        {/* Map Tab */}
        <TabsContent value="map" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MapView
              onLocationSelect={handleLocationSelect}
              onConservationPointSelect={(point) => console.log('Conservation point selected:', point)}
              showCurrentLocation={true}
              showConservationPoints={true}
              showGeofences={true}
              height="500px"
            />
            
            <LocationPicker
              onLocationSelect={handleLocationSelect}
              onConservationPointCreate={handleConservationPointCreate}
              mode="create"
            />
          </div>
        </TabsContent>

        {/* Geofences Tab */}
        <TabsContent value="geofences" className="mt-6">
          <GeofenceVisualizer
            onGeofenceSelect={(geofence) => console.log('Geofence selected:', geofence)}
            onGeofenceCreate={handleGeofenceCreate}
            onGeofenceUpdate={(geofence) => console.log('Geofence updated:', geofence)}
            onGeofenceDelete={(id) => console.log('Geofence deleted:', id)}
          />
        </TabsContent>

        {/* Routes Tab */}
        <TabsContent value="routes" className="mt-6">
          <RouteDisplay
            onRouteSelect={(route) => console.log('Route selected:', route)}
            onRouteStart={(route) => console.log('Route started:', route)}
            onRouteComplete={(route) => console.log('Route completed:', route)}
          />
        </TabsContent>

        {/* Tools Tab */}
        <TabsContent value="tools" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Offline Maps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Offline Maps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Download map regions for offline use during inspections.
                  </p>
                  
                  <Button onClick={handleDownloadMapRegion} className="w-full">
                    <Navigation className="h-4 w-4 mr-2" />
                    Download Demo Region
                  </Button>
                  
                  <div className="text-sm text-gray-500">
                    <p>• HACCP conservation points area</p>
                    <p>• Zoom levels 15-17</p>
                    <p>• ~50MB download size</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Location History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    View and manage location tracking history.
                  </p>
                  
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        const stats = locationHistory.getStats()
                        console.log('Location history stats:', stats)
                      }}
                    >
                      View Statistics
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        const clusters = locationHistory.getLocationClusters()
                        console.log('Location clusters:', clusters)
                      }}
                    >
                      View Clusters
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        const exportData = locationHistory.exportHistory('json')
                        console.log('Location history exported:', exportData)
                      }}
                    >
                      Export History
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Integration Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Integration Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-800">GPS Service</p>
                  <p className="text-xs text-green-600">Active</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-800">Geofence Manager</p>
                  <p className="text-xs text-green-600">Monitoring</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-800">Route Optimizer</p>
                  <p className="text-xs text-green-600">Ready</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-800">Location History</p>
                  <p className="text-xs text-green-600">Tracking</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Feature Overview */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            B.8.4 Session 3-4: GPS & Location Features - Completed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-blue-700">🗺️ GPS & Mapping</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• High-precision location tracking</li>
                <li>• Conservation point mapping</li>
                <li>• Interactive map visualization</li>
                <li>• Location picker and creator</li>
                <li>• Offline map caching</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-green-700">🚧 Geofencing</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Zone monitoring and alerts</li>
                <li>• Temperature violation detection</li>
                <li>• Entry/exit notifications</li>
                <li>• Inspection due reminders</li>
                <li>• Visual geofence management</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-purple-700">🛣️ Route Optimization</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Multiple optimization algorithms</li>
                <li>• Inspection route planning</li>
                <li>• Real-time route tracking</li>
                <li>• Progress monitoring</li>
                <li>• Efficiency calculations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LocationDemo
