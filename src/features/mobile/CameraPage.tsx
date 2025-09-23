/**
 * CameraPage - B.8.4 Advanced Mobile Features
 * Main page for camera functionality in HACCP mobile workflow
 */

import React from 'react'
import { CameraDemo } from '@/components/mobile/camera/CameraDemo'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Camera, Smartphone, Zap } from 'lucide-react'

export const CameraPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Mobile Camera
              </h1>
              <p className="text-gray-600 mt-1">
                Advanced photo documentation for HACCP inspections
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
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              B.8.4 Advanced Mobile Features - Camera & Photo Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-blue-700">
                  📷 Photo Capture
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Advanced camera controls</li>
                  <li>• Quality settings (60-95%)</li>
                  <li>• HACCP context integration</li>
                  <li>• Device metadata tracking</li>
                  <li>• Gallery integration</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-green-700">
                  🎨 Photo Processing
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Image compression</li>
                  <li>• Filter effects</li>
                  <li>• Text annotations</li>
                  <li>• Shape drawing tools</li>
                  <li>• Undo/redo support</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-purple-700">
                  📱 Barcode Scanning
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• QR code recognition</li>
                  <li>• Barcode scanning</li>
                  <li>• Product database lookup</li>
                  <li>• HACCP context parsing</li>
                  <li>• Manual code entry</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Component */}
        <CameraDemo />
      </div>
    </div>
  )
}

export default CameraPage
