/**
 * CameraService - B.8.4 Advanced Mobile Features
 * Advanced camera integration with manual controls for HACCP photo documentation
 */

import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
} from '@capacitor/camera'
import { Device } from '@capacitor/device'

export interface CameraOptions {
  quality?: number // 0-100
  allowEditing?: boolean
  resultType?: CameraResultType
  source?: CameraSource
  width?: number
  height?: number
  correctOrientation?: boolean
  saveToGallery?: boolean
}

export interface CameraCapabilities {
  hasCamera: boolean
  hasFlash: boolean
  hasFrontCamera: boolean
  maxResolution: { width: number; height: number }
  supportedFormats: string[]
}

export interface PhotoMetadata {
  id: string
  timestamp: Date
  location?: { latitude: number; longitude: number }
  deviceInfo: {
    platform: string
    model: string
    osVersion: string
  }
  cameraSettings: {
    quality: number
    resolution: { width: number; height: number }
    flashUsed: boolean
  }
  haccpContext?: {
    conservationPointId?: string
    taskId?: string
    inspectionId?: string
    notes?: string
  }
}

export class CameraService {
  private static instance: CameraService
  private capabilities: CameraCapabilities | null = null
  private photoHistory: PhotoMetadata[] = []

  private constructor() {}

  public static getInstance(): CameraService {
    if (!CameraService.instance) {
      CameraService.instance = new CameraService()
    }
    return CameraService.instance
  }

  /**
   * Initialize camera service and detect capabilities
   */
  public async initialize(): Promise<void> {
    try {
      const deviceInfo = await Device.getInfo()

      this.capabilities = {
        hasCamera:
          'mediaDevices' in navigator &&
          'getUserMedia' in navigator.mediaDevices,
        hasFlash: false, // Will be detected during capture
        hasFrontCamera: false, // Will be detected during capture
        maxResolution: { width: 4096, height: 3072 }, // Default high resolution
        supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
      }

      console.log('📷 Camera service initialized:', this.capabilities)
    } catch (error) {
      console.error('❌ Camera service initialization failed:', error)
      throw new Error('Camera service initialization failed')
    }
  }

  /**
   * Capture photo with advanced options
   */
  public async capturePhoto(
    options: CameraOptions = {}
  ): Promise<PhotoMetadata> {
    if (!this.capabilities?.hasCamera) {
      throw new Error('Camera not available on this device')
    }

    try {
      const defaultOptions: CameraOptions = {
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        correctOrientation: true,
        saveToGallery: true,
        ...options,
      }

      const photo = await Camera.getPhoto(defaultOptions)
      const deviceInfo = await Device.getInfo()

      const metadata: PhotoMetadata = {
        id: this.generatePhotoId(),
        timestamp: new Date(),
        deviceInfo: {
          platform: deviceInfo.platform,
          model: deviceInfo.model,
          osVersion: deviceInfo.osVersion,
        },
        cameraSettings: {
          quality: defaultOptions.quality || 85,
          resolution: {
            width: photo.width || 1920,
            height: photo.height || 1080,
          },
          flashUsed: false, // TODO: Detect flash usage
        },
      }

      this.photoHistory.push(metadata)
      return metadata
    } catch (error) {
      console.error('❌ Photo capture failed:', error)
      throw new Error(`Photo capture failed: ${error}`)
    }
  }

  /**
   * Capture photo for specific HACCP context
   */
  public async captureHACCPPhoto(
    haccpContext: PhotoMetadata['haccpContext'],
    options: CameraOptions = {}
  ): Promise<PhotoMetadata> {
    const metadata = await this.capturePhoto(options)
    metadata.haccpContext = haccpContext
    return metadata
  }

  /**
   * Get camera capabilities
   */
  public getCapabilities(): CameraCapabilities | null {
    return this.capabilities
  }

  /**
   * Get photo history
   */
  public getPhotoHistory(): PhotoMetadata[] {
    return [...this.photoHistory]
  }

  /**
   * Get photos by HACCP context
   */
  public getPhotosByContext(
    context: Partial<PhotoMetadata['haccpContext']>
  ): PhotoMetadata[] {
    return this.photoHistory.filter(photo => {
      if (!photo.haccpContext || !context) return false

      return Object.keys(context).every(key => {
        const contextKey = key as keyof PhotoMetadata['haccpContext']
        return photo.haccpContext?.[contextKey] === context[contextKey]
      })
    })
  }

  /**
   * Clear photo history
   */
  public clearHistory(): void {
    this.photoHistory = []
  }

  /**
   * Generate unique photo ID
   */
  private generatePhotoId(): string {
    return `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Check if camera permissions are granted
   */
  public async checkPermissions(): Promise<boolean> {
    try {
      const permissions = await Camera.checkPermissions()
      return permissions.camera === 'granted'
    } catch (error) {
      console.error('❌ Permission check failed:', error)
      return false
    }
  }

  /**
   * Request camera permissions
   */
  public async requestPermissions(): Promise<boolean> {
    try {
      const permissions = await Camera.requestPermissions()
      return permissions.camera === 'granted'
    } catch (error) {
      console.error('❌ Permission request failed:', error)
      return false
    }
  }
}

// Export singleton instance
export const cameraService = CameraService.getInstance()
export default cameraService
