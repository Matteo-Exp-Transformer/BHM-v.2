/**
 * CameraCapture - B.8.4 Advanced Mobile Features
 * Camera interface component for HACCP photo documentation
 */

import React, { useState, useRef, useEffect } from 'react'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import {
  cameraService,
  PhotoMetadata,
  CameraOptions,
} from '@/services/mobile/camera'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertCircle,
  Camera as CameraIcon,
  Image as ImageIcon,
  Settings,
} from 'lucide-react'

interface CameraCaptureProps {
  onPhotoCaptured?: (metadata: PhotoMetadata) => void
  onError?: (error: Error) => void
  haccpContext?: {
    conservationPointId?: string
    taskId?: string
    inspectionId?: string
    notes?: string
  }
  className?: string
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onPhotoCaptured,
  onError,
  haccpContext,
  className = '',
}) => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [permissionsGranted, setPermissionsGranted] = useState(false)
  const [lastPhoto, setLastPhoto] = useState<PhotoMetadata | null>(null)
  const [cameraOptions, setCameraOptions] = useState<CameraOptions>({
    quality: 85,
    allowEditing: false,
    resultType: CameraResultType.DataUrl,
    source: CameraSource.Camera,
    correctOrientation: true,
    saveToGallery: true,
  })

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    initializeCamera()
  }, [])

  const initializeCamera = async () => {
    try {
      await cameraService.initialize()
      const hasPermissions = await cameraService.checkPermissions()

      if (!hasPermissions) {
        const granted = await cameraService.requestPermissions()
        setPermissionsGranted(granted)
      } else {
        setPermissionsGranted(true)
      }

      setIsInitialized(true)
    } catch (error) {
      console.error('❌ Camera initialization failed:', error)
      onError?.(error as Error)
    }
  }

  const handleCapturePhoto = async () => {
    if (!permissionsGranted || isCapturing) return

    setIsCapturing(true)
    try {
      const metadata = await cameraService.captureHACCPPhoto(
        haccpContext,
        cameraOptions
      )
      setLastPhoto(metadata)
      onPhotoCaptured?.(metadata)
    } catch (error) {
      console.error('❌ Photo capture failed:', error)
      onError?.(error as Error)
    } finally {
      setIsCapturing(false)
    }
  }

  const handleQualityChange = (quality: number) => {
    setCameraOptions(prev => ({ ...prev, quality }))
  }

  const handleSourceChange = (source: CameraSource) => {
    setCameraOptions(prev => ({ ...prev, source }))
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (!isInitialized) {
    return (
      <Card className={`w-full max-w-md mx-auto ${className}`}>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing camera...</p>
        </CardContent>
      </Card>
    )
  }

  if (!permissionsGranted) {
    return (
      <Card className={`w-full max-w-md mx-auto ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Camera Permission Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Please grant camera permission to capture photos for HACCP
            documentation.
          </p>
          <Button onClick={initializeCamera} className="w-full">
            Grant Permission
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      {/* Camera Controls */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CameraIcon className="h-5 w-5" />
            Camera Capture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quality Settings */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Photo Quality
            </label>
            <div className="flex gap-2">
              {[60, 75, 85, 95].map(quality => (
                <Button
                  key={quality}
                  variant={
                    cameraOptions.quality === quality ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() => handleQualityChange(quality)}
                >
                  {quality}%
                </Button>
              ))}
            </div>
          </div>

          {/* Source Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Photo Source
            </label>
            <div className="flex gap-2">
              <Button
                variant={
                  cameraOptions.source === CameraSource.Camera
                    ? 'default'
                    : 'outline'
                }
                size="sm"
                onClick={() => handleSourceChange(CameraSource.Camera)}
              >
                <CameraIcon className="h-4 w-4 mr-1" />
                Camera
              </Button>
              <Button
                variant={
                  cameraOptions.source === CameraSource.Photos
                    ? 'default'
                    : 'outline'
                }
                size="sm"
                onClick={() => handleSourceChange(CameraSource.Photos)}
              >
                <ImageIcon className="h-4 w-4 mr-1" />
                Gallery
              </Button>
            </div>
          </div>

          {/* Capture Button */}
          <Button
            onClick={handleCapturePhoto}
            disabled={isCapturing}
            className="w-full"
            size="lg"
          >
            {isCapturing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Capturing...
              </>
            ) : (
              <>
                <CameraIcon className="h-4 w-4 mr-2" />
                Capture Photo
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* HACCP Context Display */}
      {haccpContext && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-sm">HACCP Context</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {haccpContext.conservationPointId && (
                <Badge variant="secondary">
                  CP: {haccpContext.conservationPointId}
                </Badge>
              )}
              {haccpContext.taskId && (
                <Badge variant="secondary">Task: {haccpContext.taskId}</Badge>
              )}
              {haccpContext.inspectionId && (
                <Badge variant="secondary">
                  Inspection: {haccpContext.inspectionId}
                </Badge>
              )}
              {haccpContext.notes && (
                <p className="text-sm text-gray-600 mt-2">
                  {haccpContext.notes}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Photo Info */}
      {lastPhoto && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Last Captured Photo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">ID:</span>
                <span className="font-mono">{lastPhoto.id.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span>{lastPhoto.timestamp.toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Device:</span>
                <span>{lastPhoto.deviceInfo.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quality:</span>
                <span>{lastPhoto.cameraSettings.quality}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Resolution:</span>
                <span>
                  {lastPhoto.cameraSettings.resolution.width} ×{' '}
                  {lastPhoto.cameraSettings.resolution.height}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default CameraCapture
