/**
 * CameraDemo - B.8.4 Advanced Mobile Features
 * Demo component showcasing camera services integration for HACCP documentation
 */

import React, { useState } from 'react'
import { CameraCapture } from './CameraCapture'
import { PhotoAnnotation } from './PhotoAnnotation'
import { BarcodeScanner } from './BarcodeScanner'
import { PhotoGalleryView } from './PhotoGalleryView'
import {
  PhotoMetadata,
  ProcessedPhoto,
  ScanResult,
  ProductInfo,
} from '@/services/mobile/camera'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Camera,
  Image as ImageIcon,
  QrCode,
  Gallery,
  CheckCircle,
  AlertCircle,
  Info,
} from 'lucide-react'

export const CameraDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('capture')
  const [capturedPhotos, setCapturedPhotos] = useState<PhotoMetadata[]>([])
  const [processedPhotos, setProcessedPhotos] = useState<ProcessedPhoto[]>([])
  const [scanResults, setScanResults] = useState<ScanResult[]>([])
  const [foundProducts, setFoundProducts] = useState<ProductInfo[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [demoStats, setDemoStats] = useState({
    photosCaptured: 0,
    photosProcessed: 0,
    scansCompleted: 0,
    productsFound: 0,
  })

  const handlePhotoCaptured = (metadata: PhotoMetadata) => {
    setCapturedPhotos(prev => [...prev, metadata])
    setDemoStats(prev => ({ ...prev, photosCaptured: prev.photosCaptured + 1 }))
    setSelectedPhoto(metadata.id)
    setActiveTab('annotation')
  }

  const handlePhotoProcessed = (processedPhoto: ProcessedPhoto) => {
    setProcessedPhotos(prev => [...prev, processedPhoto])
    setDemoStats(prev => ({
      ...prev,
      photosProcessed: prev.photosProcessed + 1,
    }))
    setActiveTab('gallery')
  }

  const handleScanComplete = (scanResult: ScanResult) => {
    setScanResults(prev => [...prev, scanResult])
    setDemoStats(prev => ({ ...prev, scansCompleted: prev.scansCompleted + 1 }))
  }

  const handleProductFound = (product: ProductInfo) => {
    setFoundProducts(prev => [...prev, product])
    setDemoStats(prev => ({ ...prev, productsFound: prev.productsFound + 1 }))
  }

  const handleError = (error: Error) => {
    console.error('Demo error:', error)
    // In a real app, you'd show a toast notification
  }

  const getSelectedPhotoDataUrl = (): string | null => {
    if (!selectedPhoto) return null

    const photo = capturedPhotos.find(p => p.id === selectedPhoto)
    if (!photo) return null

    // In a real implementation, you'd get the actual data URL from the photo
    // For demo purposes, we'll return a placeholder
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="#f0f0f0"/>
        <text x="200" y="150" text-anchor="middle" dy=".3em" font-family="Arial" font-size="16" fill="#666">
          📷 Demo Photo ${selectedPhoto.slice(-6)}
        </text>
        <text x="200" y="180" text-anchor="middle" dy=".3em" font-family="Arial" font-size="12" fill="#999">
          Click "Capture Photo" to get started
        </text>
      </svg>
    `)}`
  }

  const sampleHACCPContext = {
    conservationPointId: 'CP001',
    taskId: 'TASK_DAILY_INSPECTION',
    inspectionId: 'INSP_20250123_001',
    notes: 'Temperature check - Cold storage unit',
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-6 w-6" />
            B.8.4 Advanced Mobile Features - Camera Demo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            This demo showcases the camera services for HACCP photo
            documentation, including photo capture, annotation, barcode
            scanning, and gallery management.
          </p>

          {/* Demo Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {demoStats.photosCaptured}
              </div>
              <div className="text-sm text-blue-700">Photos Captured</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {demoStats.photosProcessed}
              </div>
              <div className="text-sm text-green-700">Photos Processed</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {demoStats.scansCompleted}
              </div>
              <div className="text-sm text-purple-700">Scans Completed</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {demoStats.productsFound}
              </div>
              <div className="text-sm text-orange-700">Products Found</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="capture" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Capture
          </TabsTrigger>
          <TabsTrigger value="annotation" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Annotate
          </TabsTrigger>
          <TabsTrigger value="scanner" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            Scanner
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <Gallery className="h-4 w-4" />
            Gallery
          </TabsTrigger>
        </TabsList>

        {/* Capture Tab */}
        <TabsContent value="capture" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CameraCapture
              onPhotoCaptured={handlePhotoCaptured}
              onError={handleError}
              haccpContext={sampleHACCPContext}
            />

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">HACCP Context</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      CP: {sampleHACCPContext.conservationPointId}
                    </Badge>
                    <Badge variant="secondary">
                      Task: {sampleHACCPContext.taskId}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>
                      <strong>Inspection:</strong>{' '}
                      {sampleHACCPContext.inspectionId}
                    </p>
                    <p>
                      <strong>Notes:</strong> {sampleHACCPContext.notes}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-md">
                    <div className="flex items-center gap-2 text-blue-700">
                      <Info className="h-4 w-4" />
                      <span className="text-sm font-medium">Demo Mode</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      This demo uses sample HACCP context. In production, this
                      would be dynamically set based on the current inspection
                      or task.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Annotation Tab */}
        <TabsContent value="annotation" className="mt-6">
          {selectedPhoto ? (
            <PhotoAnnotation
              photoDataUrl={getSelectedPhotoDataUrl() || ''}
              onAnnotationComplete={handlePhotoProcessed}
              onCancel={() => setActiveTab('capture')}
            />
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  No photo selected for annotation
                </p>
                <Button onClick={() => setActiveTab('capture')}>
                  Go to Capture Tab
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Scanner Tab */}
        <TabsContent value="scanner" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BarcodeScanner
              onScanComplete={handleScanComplete}
              onProductFound={handleProductFound}
              onError={handleError}
            />

            {/* Recent Scans */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recent Scans</CardTitle>
              </CardHeader>
              <CardContent>
                {scanResults.length === 0 ? (
                  <p className="text-gray-500 text-sm">No scans yet</p>
                ) : (
                  <div className="space-y-2">
                    {scanResults
                      .slice(-3)
                      .reverse()
                      .map((scan, index) => (
                        <div
                          key={scan.id}
                          className="p-2 bg-gray-50 rounded text-sm"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {scan.format}
                            </Badge>
                            <span className="text-gray-500">
                              {scan.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="font-mono text-xs truncate">
                            {scan.data}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="mt-6">
          <PhotoGalleryView
            onItemSelect={item => {
              console.log('Gallery item selected:', item)
            }}
            onItemDelete={itemId => {
              console.log('Gallery item deleted:', itemId)
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Recent Activity */}
      {(capturedPhotos.length > 0 ||
        processedPhotos.length > 0 ||
        scanResults.length > 0) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {capturedPhotos.slice(-2).map(photo => (
                <div
                  key={photo.id}
                  className="flex items-center gap-2 p-2 bg-blue-50 rounded text-sm"
                >
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span>Photo captured: {photo.id.slice(-8)}</span>
                  <span className="text-gray-500 text-xs">
                    {photo.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
              {processedPhotos.slice(-2).map(photo => (
                <div
                  key={photo.id}
                  className="flex items-center gap-2 p-2 bg-green-50 rounded text-sm"
                >
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Photo processed: {photo.id.slice(-8)}</span>
                  <span className="text-gray-500 text-xs">
                    {photo.metadata.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
              {scanResults.slice(-2).map(scan => (
                <div
                  key={scan.id}
                  className="flex items-center gap-2 p-2 bg-purple-50 rounded text-sm"
                >
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                  <span>Scan completed: {scan.format}</span>
                  <span className="text-gray-500 text-xs">
                    {scan.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default CameraDemo
