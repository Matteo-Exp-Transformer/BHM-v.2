/**
 * MapView - B.8.4 Advanced Mobile Features
 * Interactive map component for HACCP conservation point mapping
 */

import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { gpsService, LocationData, ConservationPointLocation } from '@/services/mobile/location'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  MapPin, 
  Navigation, 
  Target, 
  Thermometer,
  Clock,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Layers,
  ZoomIn,
  ZoomOut
} from 'lucide-react'

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface MapViewProps {
  onLocationSelect?: (location: { latitude: number; longitude: number }) => void
  onConservationPointSelect?: (point: ConservationPointLocation) => void
  showCurrentLocation?: boolean
  showConservationPoints?: boolean
  showGeofences?: boolean
  showRoutes?: boolean
  className?: string
  height?: string
}

interface MapCenter {
  lat: number
  lng: number
  zoom: number
}

export const MapView: React.FC<MapViewProps> = ({
  onLocationSelect,
  onConservationPointSelect,
  showCurrentLocation = true,
  showConservationPoints = true,
  showGeofences = false,
  showRoutes = false,
  className = '',
  height = '400px'
}) => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null)
  const [conservationPoints, setConservationPoints] = useState<ConservationPointLocation[]>([])
  const [mapCenter, setMapCenter] = useState<MapCenter>({
    lat: 45.4642,
    lng: 9.1900,
    zoom: 15
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mapLayers, setMapLayers] = useState({
    showSatellite: false,
    showTraffic: false,
    showTemperature: false
  })

  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    initializeMap()
  }, [])

  const initializeMap = async () => {
    try {
      setIsLoading(true)
      await gpsService.initialize()
      
      // Load conservation points
      const points = gpsService.getConservationPoints()
      setConservationPoints(points)

      // Get current location if available
      if (showCurrentLocation) {
        try {
          const location = await gpsService.getCurrentLocation()
          setCurrentLocation(location)
          setMapCenter({
            lat: location.latitude,
            lng: location.longitude,
            zoom: 16
          })
        } catch (error) {
          console.warn('Could not get current location:', error)
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to initialize map')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng
    onLocationSelect?.({ latitude: lat, longitude: lng })
  }

  const handleMarkerClick = (point: ConservationPointLocation) => {
    onConservationPointSelect?.(point)
  }

  const centerOnCurrentLocation = async () => {
    try {
      setIsLoading(true)
      const location = await gpsService.getCurrentLocation()
      setCurrentLocation(location)
      setMapCenter({
        lat: location.latitude,
        lng: location.longitude,
        zoom: 16
      })
    } catch (error) {
      setError('Could not get current location')
    } finally {
      setIsLoading(false)
    }
  }

  const getConservationPointIcon = (point: ConservationPointLocation) => {
    const color = getConservationPointColor(point)
    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">
          <div style="
            color: white;
            font-size: 14px;
            font-weight: bold;
          ">
            ${getConservationPointIconText(point.type)}
          </div>
        </div>
      `,
      className: 'custom-div-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    })
  }

  const getConservationPointColor = (point: ConservationPointLocation): string => {
    switch (point.type) {
      case 'refrigeration': return '#3B82F6' // Blue
      case 'freezer': return '#1E40AF' // Dark Blue
      case 'preparation': return '#10B981' // Green
      case 'storage': return '#F59E0B' // Yellow
      case 'delivery': return '#EF4444' // Red
      default: return '#6B7280' // Gray
    }
  }

  const getConservationPointIconText = (type: ConservationPointLocation['type']): string => {
    switch (type) {
      case 'refrigeration': return '❄️'
      case 'freezer': return '🧊'
      case 'preparation': return '👨‍🍳'
      case 'storage': return '📦'
      case 'delivery': return '🚚'
      default: return '📍'
    }
  }

  const formatTemperature = (temp: ConservationPointLocation['criticalTemperature']) => {
    if (!temp) return 'N/A'
    return `${temp.min}°${temp.unit === 'celsius' ? 'C' : 'F'} - ${temp.max}°${temp.unit === 'celsius' ? 'C' : 'F'}`
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center" style={{ height }}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
          <Button onClick={initializeMap} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      {/* Map Controls */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            HACCP Conservation Points Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={centerOnCurrentLocation}
              disabled={isLoading}
            >
              <Navigation className="h-4 w-4 mr-1" />
              Current Location
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMapLayers(prev => ({ ...prev, showSatellite: !prev.showSatellite }))}
            >
              <Layers className="h-4 w-4 mr-1" />
              {mapLayers.showSatellite ? 'Street' : 'Satellite'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setMapLayers(prev => ({ ...prev, showTemperature: !prev.showTemperature }))}
            >
              <Thermometer className="h-4 w-4 mr-1" />
              Temperature
            </Button>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span>Refrigeration</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-800"></div>
              <span>Freezer</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span>Preparation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span>Storage</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span>Delivery</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <Card>
        <CardContent className="p-0">
          <div style={{ height }} className="relative">
            <MapContainer
              center={[mapCenter.lat, mapCenter.lng]}
              zoom={mapCenter.zoom}
              style={{ height: '100%', width: '100%' }}
              ref={mapRef}
              onClick={handleMapClick}
            >
              <TileLayer
                url={
                  mapLayers.showSatellite
                    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                }
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {/* Current Location Marker */}
              {showCurrentLocation && currentLocation && (
                <Marker
                  position={[currentLocation.latitude, currentLocation.longitude]}
                  icon={L.divIcon({
                    html: `
                      <div style="
                        background-color: #EF4444;
                        width: 20px;
                        height: 20px;
                        border-radius: 50%;
                        border: 3px solid white;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                      "></div>
                    `,
                    className: 'custom-div-icon',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                  })}
                >
                  <Popup>
                    <div className="p-2">
                      <h4 className="font-semibold">Your Location</h4>
                      <p className="text-sm text-gray-600">
                        Accuracy: {currentLocation.accuracy.toFixed(1)}m
                      </p>
                      <p className="text-sm text-gray-600">
                        {currentLocation.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Conservation Points */}
              {showConservationPoints && conservationPoints.map((point) => (
                <React.Fragment key={point.id}>
                  <Marker
                    position={[point.latitude, point.longitude]}
                    icon={getConservationPointIcon(point)}
                    eventHandlers={{
                      click: () => handleMarkerClick(point)
                    }}
                  >
                    <Popup>
                      <div className="p-2 min-w-64">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{point.name}</h4>
                          <Badge 
                            variant={point.status === 'active' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {point.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-gray-500" />
                            <span>ID: {point.id}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span>Type: {point.type}</span>
                          </div>
                          
                          {point.criticalTemperature && (
                            <div className="flex items-center gap-2">
                              <Thermometer className="h-4 w-4 text-gray-500" />
                              <span>Range: {formatTemperature(point.criticalTemperature)}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>Radius: {point.radius}m</span>
                          </div>
                          
                          {point.lastInspection && (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>Last inspection: {point.lastInspection.toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Conservation Point Radius Circle */}
                  <Circle
                    center={[point.latitude, point.longitude]}
                    radius={point.radius}
                    pathOptions={{
                      color: getConservationPointColor(point),
                      fillColor: getConservationPointColor(point),
                      fillOpacity: 0.1,
                      weight: 2
                    }}
                  />
                </React.Fragment>
              ))}
            </MapContainer>

            {/* Map Zoom Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-10 h-10 p-0"
                onClick={() => mapRef.current?.zoomIn()}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-10 h-10 p-0"
                onClick={() => mapRef.current?.zoomOut()}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MapView
