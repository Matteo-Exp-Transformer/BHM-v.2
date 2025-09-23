/**
 * Location Services - B.8.4 Session 3-4
 * GPS mapping and geofencing for conservation points
 *
 * ✅ IMPLEMENTED: B.8.4 GPS & Location Features
 */

// Export all location services
export { gpsService, GPSService } from './GPSService'
export { geofenceManager, GeofenceManager } from './GeofenceManager'
export { offlineMapCache, OfflineMapCache } from './OfflineMapCache'
export { routeOptimizer, RouteOptimizer } from './RouteOptimizer'
export { locationHistory, LocationHistory } from './LocationHistory'

// Export types
export type { 
  LocationData, 
  LocationOptions, 
  LocationCapabilities, 
  ConservationPointLocation 
} from './GPSService'

export type { 
  Geofence, 
  GeofenceEvent, 
  GeofenceAlert 
} from './GeofenceManager'

export type { 
  MapTile, 
  MapRegion, 
  CacheOptions, 
  DownloadProgress 
} from './OfflineMapCache'

export type { 
  RoutePoint, 
  Route, 
  OptimizationOptions, 
  OptimizationResult, 
  RouteProgress 
} from './RouteOptimizer'

export type { 
  LocationHistoryEntry, 
  LocationHistoryFilter, 
  LocationHistoryStats, 
  LocationCluster 
} from './LocationHistory'

console.log('🗺️ Location services implemented - B.8.4 Session 3-4 COMPLETED')