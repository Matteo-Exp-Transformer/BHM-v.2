/**
 * LocationPicker - B.8.4 Advanced Mobile Features
 * Location selection component for HACCP conservation point management
 */

import React, { useState, useEffect } from 'react'
import {
  gpsService,
  LocationData,
  ConservationPointLocation,
} from '@/services/mobile/location'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import {
  MapPin,
  Navigation,
  Target,
  Search,
  Plus,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Edit3,
  Trash2,
} from 'lucide-react'

interface LocationPickerProps {
  onLocationSelect?: (location: {
    latitude: number
    longitude: number
    name?: string
  }) => void
  onConservationPointCreate?: (
    point: Omit<ConservationPointLocation, 'id'>
  ) => void
  selectedLocation?: { latitude: number; longitude: number; name?: string }
  mode?: 'select' | 'create' | 'edit'
  className?: string
}

interface SearchResult {
  name: string
  latitude: number
  longitude: number
  address?: string
  type: 'conservation_point' | 'manual' | 'current'
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  onConservationPointCreate,
  selectedLocation,
  mode = 'select',
  className = '',
}) => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(
    null
  )
  const [selectedLocationState, setSelectedLocationState] = useState<{
    latitude: number
    longitude: number
    name?: string
  } | null>(selectedLocation || null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [manualCoordinates, setManualCoordinates] = useState({
    latitude: '',
    longitude: '',
  })
  const [newConservationPoint, setNewConservationPoint] = useState<
    Partial<ConservationPointLocation>
  >({
    name: '',
    type: 'storage',
    radius: 25,
    status: 'active',
    criticalTemperature: {
      min: 0,
      max: 4,
      unit: 'celsius',
    },
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    initializeLocation()
  }, [])

  useEffect(() => {
    if (selectedLocation) {
      setSelectedLocationState(selectedLocation)
    }
  }, [selectedLocation])

  const initializeLocation = async () => {
    try {
      setIsLoading(true)
      await gpsService.initialize()

      // Get current location
      const location = await gpsService.getCurrentLocation()
      setCurrentLocation(location)

      // Load existing conservation points for search
      const points = gpsService.getConservationPoints()
      const searchResults: SearchResult[] = points.map(point => ({
        name: point.name,
        latitude: point.latitude,
        longitude: point.longitude,
        type: 'conservation_point',
      }))
      setSearchResults(searchResults)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to initialize location services'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetCurrentLocation = async () => {
    try {
      setIsLoading(true)
      const location = await gpsService.getCurrentLocation()
      setCurrentLocation(location)

      const locationData = {
        latitude: location.latitude,
        longitude: location.longitude,
        name: 'Current Location',
      }

      setSelectedLocationState(locationData)
      onLocationSelect?.(locationData)
    } catch (error) {
      setError('Could not get current location')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)

    if (!query.trim()) {
      setSearchResults([])
      return
    }

    // Search in conservation points
    const points = gpsService.getConservationPoints()
    const filtered = points
      .filter(
        point =>
          point.name.toLowerCase().includes(query.toLowerCase()) ||
          point.id.toLowerCase().includes(query.toLowerCase())
      )
      .map(point => ({
        name: point.name,
        latitude: point.latitude,
        longitude: point.longitude,
        type: 'conservation_point' as const,
      }))

    setSearchResults(filtered)
  }

  const handleSearchResultSelect = (result: SearchResult) => {
    const locationData = {
      latitude: result.latitude,
      longitude: result.longitude,
      name: result.name,
    }

    setSelectedLocationState(locationData)
    onLocationSelect?.(locationData)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleManualCoordinatesSubmit = () => {
    const lat = parseFloat(manualCoordinates.latitude)
    const lng = parseFloat(manualCoordinates.longitude)

    if (isNaN(lat) || isNaN(lng)) {
      setError('Invalid coordinates')
      return
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError('Coordinates out of range')
      return
    }

    const locationData = {
      latitude: lat,
      longitude: lng,
      name: `Manual: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    }

    setSelectedLocationState(locationData)
    onLocationSelect?.(locationData)
    setError(null)
  }

  const handleCreateConservationPoint = () => {
    if (!selectedLocationState || !newConservationPoint.name) {
      setError('Please select a location and enter a name')
      return
    }

    const point: Omit<ConservationPointLocation, 'id'> = {
      name: newConservationPoint.name,
      latitude: selectedLocationState.latitude,
      longitude: selectedLocationState.longitude,
      radius: newConservationPoint.radius || 25,
      type: newConservationPoint.type || 'storage',
      status: newConservationPoint.status || 'active',
      criticalTemperature: newConservationPoint.criticalTemperature,
    }

    onConservationPointCreate?.(point)

    // Reset form
    setNewConservationPoint({
      name: '',
      type: 'storage',
      radius: 25,
      status: 'active',
      criticalTemperature: {
        min: 0,
        max: 4,
        unit: 'celsius',
      },
    })
    setSelectedLocationState(null)
    setError(null)
  }

  const formatCoordinates = (lat: number, lng: number): string => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }

  const getLocationAccuracy = (location: LocationData): string => {
    return `±${location.accuracy.toFixed(1)}m`
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {mode === 'create'
              ? 'Create Conservation Point'
              : mode === 'edit'
                ? 'Edit Location'
                : 'Select Location'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Current Location */}
          <div className="space-y-2">
            <Label>Current Location</Label>
            {currentLocation ? (
              <div className="p-3 bg-green-50 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-800">
                      {formatCoordinates(
                        currentLocation.latitude,
                        currentLocation.longitude
                      )}
                    </p>
                    <p className="text-sm text-green-600">
                      Accuracy: {getLocationAccuracy(currentLocation)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleGetCurrentLocation}
                    disabled={isLoading}
                  >
                    <Navigation className="h-4 w-4 mr-1" />
                    Use
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={handleGetCurrentLocation}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Getting Location...
                  </>
                ) : (
                  <>
                    <Navigation className="h-4 w-4 mr-2" />
                    Get Current Location
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="space-y-2">
            <Label>Search Conservation Points</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSearchResultSelect(result)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{result.name}</p>
                        <p className="text-sm text-gray-600">
                          {formatCoordinates(result.latitude, result.longitude)}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {result.type === 'conservation_point' ? 'CP' : 'Manual'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Manual Coordinates */}
          <div className="space-y-2">
            <Label>Manual Coordinates</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="latitude" className="text-xs">
                  Latitude
                </Label>
                <Input
                  id="latitude"
                  placeholder="45.4642"
                  value={manualCoordinates.latitude}
                  onChange={e =>
                    setManualCoordinates(prev => ({
                      ...prev,
                      latitude: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="longitude" className="text-xs">
                  Longitude
                </Label>
                <Input
                  id="longitude"
                  placeholder="9.1900"
                  value={manualCoordinates.longitude}
                  onChange={e =>
                    setManualCoordinates(prev => ({
                      ...prev,
                      longitude: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <Button
              onClick={handleManualCoordinatesSubmit}
              variant="outline"
              className="w-full"
              disabled={
                !manualCoordinates.latitude || !manualCoordinates.longitude
              }
            >
              <Target className="h-4 w-4 mr-2" />
              Use Manual Coordinates
            </Button>
          </div>

          {/* Selected Location */}
          {selectedLocationState && (
            <div className="p-3 bg-blue-50 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">
                  Selected Location
                </span>
              </div>
              <div className="space-y-1">
                {selectedLocationState.name && (
                  <p className="font-medium">{selectedLocationState.name}</p>
                )}
                <p className="text-sm text-blue-600">
                  {formatCoordinates(
                    selectedLocationState.latitude,
                    selectedLocationState.longitude
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Create Conservation Point Form */}
          {mode === 'create' && selectedLocationState && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-md">
              <h4 className="font-medium">Conservation Point Details</h4>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="point-name">Name</Label>
                  <Input
                    id="point-name"
                    placeholder="e.g., Main Refrigeration Unit"
                    value={newConservationPoint.name || ''}
                    onChange={e =>
                      setNewConservationPoint(prev => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="point-type">Type</Label>
                  <select
                    id="point-type"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newConservationPoint.type || 'storage'}
                    onChange={e =>
                      setNewConservationPoint(prev => ({
                        ...prev,
                        type: e.target
                          .value as ConservationPointLocation['type'],
                      }))
                    }
                  >
                    <option value="refrigeration">Refrigeration</option>
                    <option value="freezer">Freezer</option>
                    <option value="preparation">Preparation</option>
                    <option value="storage">Storage</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="point-radius">Radius (meters)</Label>
                  <Input
                    id="point-radius"
                    type="number"
                    min="5"
                    max="100"
                    value={newConservationPoint.radius || 25}
                    onChange={e =>
                      setNewConservationPoint(prev => ({
                        ...prev,
                        radius: parseInt(e.target.value) || 25,
                      }))
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="temp-min">Min Temperature</Label>
                    <Input
                      id="temp-min"
                      type="number"
                      placeholder="0"
                      value={
                        newConservationPoint.criticalTemperature?.min || ''
                      }
                      onChange={e =>
                        setNewConservationPoint(prev => ({
                          ...prev,
                          criticalTemperature: {
                            ...prev.criticalTemperature,
                            min: parseFloat(e.target.value) || 0,
                            max: prev.criticalTemperature?.max || 4,
                            unit: prev.criticalTemperature?.unit || 'celsius',
                          },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="temp-max">Max Temperature</Label>
                    <Input
                      id="temp-max"
                      type="number"
                      placeholder="4"
                      value={
                        newConservationPoint.criticalTemperature?.max || ''
                      }
                      onChange={e =>
                        setNewConservationPoint(prev => ({
                          ...prev,
                          criticalTemperature: {
                            ...prev.criticalTemperature,
                            min: prev.criticalTemperature?.min || 0,
                            max: parseFloat(e.target.value) || 4,
                            unit: prev.criticalTemperature?.unit || 'celsius',
                          },
                        }))
                      }
                    />
                  </div>
                </div>

                <Button
                  onClick={handleCreateConservationPoint}
                  className="w-full"
                  disabled={!newConservationPoint.name}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Conservation Point
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {mode === 'select' && selectedLocationState && (
            <Button
              onClick={() => onLocationSelect?.(selectedLocationState!)}
              className="w-full"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm Selection
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default LocationPicker
