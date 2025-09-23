/**
 * GeofenceVisualizer - B.8.4 Advanced Mobile Features
 * Geofence zone visualization and management component
 */

import React, { useState, useEffect } from 'react'
import { geofenceManager, Geofence, GeofenceEvent, GeofenceAlert } from '@/services/mobile/location'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Shield, 
  MapPin, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Thermometer,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Bell,
  BellOff
} from 'lucide-react'

interface GeofenceVisualizerProps {
  onGeofenceSelect?: (geofence: Geofence) => void
  onGeofenceCreate?: (geofence: Omit<Geofence, 'id' | 'metadata'>) => void
  onGeofenceUpdate?: (geofence: Geofence) => void
  onGeofenceDelete?: (geofenceId: string) => void
  className?: string
}

interface GeofenceStats {
  total: number
  active: number
  inactive: number
  maintenance: number
  recentEvents: number
  unacknowledgedAlerts: number
}

export const GeofenceVisualizer: React.FC<GeofenceVisualizerProps> = ({
  onGeofenceSelect,
  onGeofenceCreate,
  onGeofenceUpdate,
  onGeofenceDelete,
  className = ''
}) => {
  const [geofences, setGeofences] = useState<Geofence[]>([])
  const [events, setEvents] = useState<GeofenceEvent[]>([])
  const [alerts, setAlerts] = useState<GeofenceAlert[]>([])
  const [stats, setStats] = useState<GeofenceStats>({
    total: 0,
    active: 0,
    inactive: 0,
    maintenance: 0,
    recentEvents: 0,
    unacknowledgedAlerts: 0
  })
  const [selectedGeofence, setSelectedGeofence] = useState<Geofence | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showInactive, setShowInactive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [newGeofence, setNewGeofence] = useState<Partial<Geofence>>({
    name: '',
    latitude: 0,
    longitude: 0,
    radius: 50,
    type: 'temperature_zone',
    status: 'active',
    alerts: {
      onEnter: true,
      onExit: true,
      onTemperatureViolation: true,
      onInspectionDue: true
    },
    criticalTemperature: {
      min: 0,
      max: 4,
      unit: 'celsius'
    },
    metadata: {
      created: new Date(),
      updated: new Date(),
      priority: 'medium'
    }
  })

  useEffect(() => {
    initializeGeofences()
  }, [])

  const initializeGeofences = async () => {
    try {
      setIsLoading(true)
      await geofenceManager.initialize()
      
      // Load geofences
      const loadedGeofences = geofenceManager.getGeofences()
      setGeofences(loadedGeofences)

      // Load events and alerts
      const loadedEvents = geofenceManager.getEvents({ acknowledged: false })
      const loadedAlerts = geofenceManager.getAlerts({ acknowledged: false })
      setEvents(loadedEvents)
      setAlerts(loadedAlerts)

      // Calculate stats
      calculateStats(loadedGeofences, loadedEvents, loadedAlerts)

      // Subscribe to events and alerts
      geofenceManager.onEvent((event) => {
        setEvents(prev => [event, ...prev])
        calculateStats(geofences, [event, ...events], alerts)
      })

      geofenceManager.onAlert((alert) => {
        setAlerts(prev => [alert, ...prev])
        calculateStats(geofences, events, [alert, ...alerts])
      })

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to initialize geofences')
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStats = (
    geofencesList: Geofence[], 
    eventsList: GeofenceEvent[], 
    alertsList: GeofenceAlert[]
  ) => {
    const stats: GeofenceStats = {
      total: geofencesList.length,
      active: geofencesList.filter(g => g.status === 'active').length,
      inactive: geofencesList.filter(g => g.status === 'inactive').length,
      maintenance: geofencesList.filter(g => g.status === 'maintenance').length,
      recentEvents: eventsList.filter(e => 
        Date.now() - e.timestamp.getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
      ).length,
      unacknowledgedAlerts: alertsList.filter(a => !a.acknowledged).length
    }
    setStats(stats)
  }

  const handleGeofenceSelect = (geofence: Geofence) => {
    setSelectedGeofence(geofence)
    onGeofenceSelect?.(geofence)
  }

  const handleCreateGeofence = () => {
    if (!newGeofence.name || !newGeofence.latitude || !newGeofence.longitude) {
      setError('Please fill in all required fields')
      return
    }

    const geofenceData: Omit<Geofence, 'id' | 'metadata'> = {
      name: newGeofence.name,
      latitude: newGeofence.latitude,
      longitude: newGeofence.longitude,
      radius: newGeofence.radius || 50,
      type: newGeofence.type || 'temperature_zone',
      status: newGeofence.status || 'active',
      criticalTemperature: newGeofence.criticalTemperature,
      alerts: newGeofence.alerts || {
        onEnter: true,
        onExit: true,
        onTemperatureViolation: true,
        onInspectionDue: true
      }
    }

    onGeofenceCreate?.(geofenceData)
    
    // Reset form
    setNewGeofence({
      name: '',
      latitude: 0,
      longitude: 0,
      radius: 50,
      type: 'temperature_zone',
      status: 'active',
      alerts: {
        onEnter: true,
        onExit: true,
        onTemperatureViolation: true,
        onInspectionDue: true
      },
      criticalTemperature: {
        min: 0,
        max: 4,
        unit: 'celsius'
      },
      metadata: {
        created: new Date(),
        updated: new Date(),
        priority: 'medium'
      }
    })
    setShowCreateForm(false)
    setError(null)
  }

  const handleDeleteGeofence = (geofenceId: string) => {
    if (confirm('Are you sure you want to delete this geofence?')) {
      geofenceManager.removeGeofence(geofenceId)
      setGeofences(prev => prev.filter(g => g.id !== geofenceId))
      onGeofenceDelete?.(geofenceId)
    }
  }

  const handleAcknowledgeEvent = (eventId: string) => {
    geofenceManager.acknowledgeEvent(eventId, 'user')
    setEvents(prev => prev.map(e => 
      e.id === eventId ? { ...e, acknowledged: true } : e
    ))
  }

  const handleAcknowledgeAlert = (alertId: string) => {
    geofenceManager.acknowledgeAlert(alertId)
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, acknowledged: true } : a
    ))
  }

  const getGeofenceStatusColor = (status: Geofence['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getGeofenceTypeIcon = (type: Geofence['type']) => {
    switch (type) {
      case 'conservation_point': return <MapPin className="h-4 w-4" />
      case 'inspection_route': return <Shield className="h-4 w-4" />
      case 'restricted_area': return <AlertTriangle className="h-4 w-4" />
      case 'temperature_zone': return <Thermometer className="h-4 w-4" />
      default: return <MapPin className="h-4 w-4" />
    }
  }

  const getEventSeverityColor = (severity: GeofenceEvent['severity']) => {
    switch (severity) {
      case 'info': return 'bg-blue-100 text-blue-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'critical': return 'bg-red-200 text-red-900'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTemperature = (temp: Geofence['criticalTemperature']) => {
    if (!temp) return 'N/A'
    return `${temp.min}°${temp.unit === 'celsius' ? 'C' : 'F'} - ${temp.max}°${temp.unit === 'celsius' ? 'C' : 'F'}`
  }

  const filteredGeofences = geofences.filter(geofence => 
    showInactive || geofence.status !== 'inactive'
  )

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading geofences...</p>
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
            <Shield className="h-5 w-5" />
            Geofence Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-blue-700">Total Zones</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-green-700">Active</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.recentEvents}</div>
              <div className="text-sm text-orange-700">Recent Events</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.unacknowledgedAlerts}</div>
              <div className="text-sm text-red-700">Active Alerts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Geofence
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInactive(!showInactive)}
            >
              {showInactive ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
              {showInactive ? 'Hide' : 'Show'} Inactive
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={initializeGeofences}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create Geofence Form */}
      {showCreateForm && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Create New Geofence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="geofence-name">Name</Label>
                <Input
                  id="geofence-name"
                  placeholder="e.g., Main Refrigeration Zone"
                  value={newGeofence.name || ''}
                  onChange={(e) => setNewGeofence(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="geofence-type">Type</Label>
                <select
                  id="geofence-type"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newGeofence.type || 'temperature_zone'}
                  onChange={(e) => setNewGeofence(prev => ({ 
                    ...prev, 
                    type: e.target.value as Geofence['type'] 
                  }))}
                >
                  <option value="conservation_point">Conservation Point</option>
                  <option value="inspection_route">Inspection Route</option>
                  <option value="restricted_area">Restricted Area</option>
                  <option value="temperature_zone">Temperature Zone</option>
                </select>
              </div>

              <div>
                <Label htmlFor="geofence-lat">Latitude</Label>
                <Input
                  id="geofence-lat"
                  type="number"
                  step="any"
                  placeholder="45.4642"
                  value={newGeofence.latitude || ''}
                  onChange={(e) => setNewGeofence(prev => ({ 
                    ...prev, 
                    latitude: parseFloat(e.target.value) || 0 
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="geofence-lng">Longitude</Label>
                <Input
                  id="geofence-lng"
                  type="number"
                  step="any"
                  placeholder="9.1900"
                  value={newGeofence.longitude || ''}
                  onChange={(e) => setNewGeofence(prev => ({ 
                    ...prev, 
                    longitude: parseFloat(e.target.value) || 0 
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="geofence-radius">Radius (meters)</Label>
                <Input
                  id="geofence-radius"
                  type="number"
                  min="5"
                  max="1000"
                  value={newGeofence.radius || 50}
                  onChange={(e) => setNewGeofence(prev => ({ 
                    ...prev, 
                    radius: parseInt(e.target.value) || 50 
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="geofence-priority">Priority</Label>
                <select
                  id="geofence-priority"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newGeofence.metadata?.priority || 'medium'}
                  onChange={(e) => setNewGeofence(prev => ({ 
                    ...prev, 
                    metadata: {
                      ...prev.metadata!,
                      priority: e.target.value as 'low' | 'medium' | 'high' | 'critical'
                    }
                  }))}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateGeofence}>
                <Plus className="h-4 w-4 mr-2" />
                Create Geofence
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Geofences List */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Geofences ({filteredGeofences.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredGeofences.map((geofence) => (
              <div
                key={geofence.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedGeofence?.id === geofence.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleGeofenceSelect(geofence)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getGeofenceTypeIcon(geofence.type)}
                    <h4 className="font-medium">{geofence.name}</h4>
                    <Badge className={getGeofenceStatusColor(geofence.status)}>
                      {geofence.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onGeofenceUpdate?.(geofence)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteGeofence(geofence.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Location:</span>
                    <p>{geofence.latitude.toFixed(6)}, {geofence.longitude.toFixed(6)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Radius:</span>
                    <p>{geofence.radius}m</p>
                  </div>
                  <div>
                    <span className="font-medium">Temperature:</span>
                    <p>{formatTemperature(geofence.criticalTemperature)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Priority:</span>
                    <p className="capitalize">{geofence.metadata.priority}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  <div className="flex items-center gap-1">
                    <Bell className={`h-4 w-4 ${geofence.alerts.onEnter ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className="text-xs">Enter</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BellOff className={`h-4 w-4 ${geofence.alerts.onExit ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className="text-xs">Exit</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Thermometer className={`h-4 w-4 ${geofence.alerts.onTemperatureViolation ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className="text-xs">Temperature</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className={`h-4 w-4 ${geofence.alerts.onInspectionDue ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className="text-xs">Inspection</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Events */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {events.slice(0, 5).map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <Badge className={getEventSeverityColor(event.severity)}>
                    {event.type}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium">{event.message}</p>
                    <p className="text-xs text-gray-500">
                      {event.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {!event.acknowledged && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAcknowledgeEvent(event.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Acknowledge
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {alerts.filter(a => !a.acknowledged).slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-red-50 rounded">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-red-800">{alert.title}</p>
                    <p className="text-xs text-red-600">{alert.message}</p>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAcknowledgeAlert(alert.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Acknowledge
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default GeofenceVisualizer
