/**
 * LocationPage - B.8.4 Advanced Mobile Features
 * Main page for location functionality in HACCP mobile workflow
 */

import React from 'react'
import { LocationDemo } from '@/components/mobile/location/LocationDemo'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Smartphone, Zap } from 'lucide-react'

export const LocationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mobile Location</h1>
              <p className="text-gray-600 mt-1">
                GPS tracking, geofencing, and route optimization for HACCP field work
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Smartphone className="h-3 w-3" />
                Mobile Optimized
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                B.8.4
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Overview */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              B.8.4 Advanced Mobile Features - GPS & Location Management
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
                  <li>• Location history tracking</li>
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
                  <li>• Event and alert system</li>
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
                  <li>• Time window constraints</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Component */}
        <LocationDemo />
      </div>
    </div>
  )
}

export default LocationPage
