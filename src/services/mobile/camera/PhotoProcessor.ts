/**
 * PhotoProcessor - B.8.4 Advanced Mobile Features
 * Photo compression, filtering, and annotation tools for HACCP documentation
 */

import { PhotoMetadata } from './CameraService'

export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number // 0-100
  format?: 'jpeg' | 'png' | 'webp'
  progressive?: boolean
}

export interface AnnotationOptions {
  text?: string
  position?: { x: number; y: number }
  fontSize?: number
  color?: string
  backgroundColor?: string
  opacity?: number
}

export interface FilterOptions {
  brightness?: number // -100 to 100
  contrast?: number // -100 to 100
  saturation?: number // -100 to 100
  blur?: number // 0 to 10
  sharpen?: boolean
  grayscale?: boolean
}

export interface ProcessedPhoto {
  id: string
  originalDataUrl: string
  processedDataUrl: string
  metadata: PhotoMetadata
  processingOptions: {
    compression?: CompressionOptions
    annotations?: AnnotationOptions[]
    filters?: FilterOptions
  }
  fileSize: {
    original: number
    processed: number
    compressionRatio: number
  }
}

export class PhotoProcessor {
  private static instance: PhotoProcessor
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null

  private constructor() {
    this.initializeCanvas()
  }

  public static getInstance(): PhotoProcessor {
    if (!PhotoProcessor.instance) {
      PhotoProcessor.instance = new PhotoProcessor()
    }
    return PhotoProcessor.instance
  }

  /**
   * Initialize canvas for image processing
   */
  private initializeCanvas(): void {
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')

    if (!this.ctx) {
      throw new Error('Canvas context not available')
    }
  }

  /**
   * Compress photo with specified options
   */
  public async compressPhoto(
    dataUrl: string,
    options: CompressionOptions = {}
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()

      img.onload = () => {
        try {
          const {
            maxWidth = 1920,
            maxHeight = 1080,
            quality = 85,
            format = 'jpeg',
          } = options

          // Calculate new dimensions maintaining aspect ratio
          const { width, height } = this.calculateDimensions(
            img.width,
            img.height,
            maxWidth,
            maxHeight
          )

          // Set canvas dimensions
          this.canvas!.width = width
          this.canvas!.height = height

          // Draw and compress
          this.ctx!.drawImage(img, 0, 0, width, height)

          const mimeType = `image/${format}`
          const compressedDataUrl = this.canvas!.toDataURL(
            mimeType,
            quality / 100
          )

          resolve(compressedDataUrl)
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = dataUrl
    })
  }

  /**
   * Apply filters to photo
   */
  public async applyFilters(
    dataUrl: string,
    filters: FilterOptions
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()

      img.onload = () => {
        try {
          this.canvas!.width = img.width
          this.canvas!.height = img.height

          // Apply filters using CSS filters
          const filterString = this.buildFilterString(filters)
          this.ctx!.filter = filterString

          this.ctx!.drawImage(img, 0, 0)

          const filteredDataUrl = this.canvas!.toDataURL('image/jpeg', 0.9)
          resolve(filteredDataUrl)
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = dataUrl
    })
  }

  /**
   * Add annotations to photo
   */
  public async addAnnotations(
    dataUrl: string,
    annotations: AnnotationOptions[]
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()

      img.onload = () => {
        try {
          this.canvas!.width = img.width
          this.canvas!.height = img.height

          // Draw original image
          this.ctx!.drawImage(img, 0, 0)

          // Add annotations
          annotations.forEach(annotation => {
            this.drawAnnotation(annotation, img.width, img.height)
          })

          const annotatedDataUrl = this.canvas!.toDataURL('image/jpeg', 0.9)
          resolve(annotatedDataUrl)
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = dataUrl
    })
  }

  /**
   * Process photo with compression, filters, and annotations
   */
  public async processPhoto(
    originalDataUrl: string,
    metadata: PhotoMetadata,
    options: {
      compression?: CompressionOptions
      filters?: FilterOptions
      annotations?: AnnotationOptions[]
    } = {}
  ): Promise<ProcessedPhoto> {
    try {
      let processedDataUrl = originalDataUrl

      // Apply compression
      if (options.compression) {
        processedDataUrl = await this.compressPhoto(
          processedDataUrl,
          options.compression
        )
      }

      // Apply filters
      if (options.filters) {
        processedDataUrl = await this.applyFilters(
          processedDataUrl,
          options.filters
        )
      }

      // Add annotations
      if (options.annotations && options.annotations.length > 0) {
        processedDataUrl = await this.addAnnotations(
          processedDataUrl,
          options.annotations
        )
      }

      // Calculate file sizes
      const originalSize = this.calculateDataUrlSize(originalDataUrl)
      const processedSize = this.calculateDataUrlSize(processedDataUrl)
      const compressionRatio =
        originalSize > 0 ? processedSize / originalSize : 1

      return {
        id: `processed_${metadata.id}`,
        originalDataUrl,
        processedDataUrl,
        metadata,
        processingOptions: options,
        fileSize: {
          original: originalSize,
          processed: processedSize,
          compressionRatio,
        },
      }
    } catch (error) {
      console.error('❌ Photo processing failed:', error)
      throw new Error(`Photo processing failed: ${error}`)
    }
  }

  /**
   * Calculate dimensions maintaining aspect ratio
   */
  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight

    let width = originalWidth
    let height = originalHeight

    if (width > maxWidth) {
      width = maxWidth
      height = width / aspectRatio
    }

    if (height > maxHeight) {
      height = maxHeight
      width = height * aspectRatio
    }

    return { width: Math.round(width), height: Math.round(height) }
  }

  /**
   * Build CSS filter string from options
   */
  private buildFilterString(filters: FilterOptions): string {
    const filterParts: string[] = []

    if (filters.brightness !== undefined) {
      filterParts.push(`brightness(${100 + filters.brightness}%)`)
    }

    if (filters.contrast !== undefined) {
      filterParts.push(`contrast(${100 + filters.contrast}%)`)
    }

    if (filters.saturation !== undefined) {
      filterParts.push(`saturate(${100 + filters.saturation}%)`)
    }

    if (filters.blur !== undefined && filters.blur > 0) {
      filterParts.push(`blur(${filters.blur}px)`)
    }

    if (filters.grayscale) {
      filterParts.push('grayscale(100%)')
    }

    return filterParts.join(' ')
  }

  /**
   * Draw annotation on canvas
   */
  private drawAnnotation(
    annotation: AnnotationOptions,
    imageWidth: number,
    imageHeight: number
  ): void {
    if (!annotation.text) return

    const {
      position = { x: 10, y: 30 },
      fontSize = 16,
      color = '#ffffff',
      backgroundColor = '#000000',
      opacity = 0.8,
    } = annotation

    // Set font
    this.ctx!.font = `${fontSize}px Arial`
    this.ctx!.fillStyle = color
    this.ctx!.globalAlpha = opacity

    // Draw background rectangle
    const textMetrics = this.ctx!.measureText(annotation.text)
    const padding = 8
    const rectWidth = textMetrics.width + padding * 2
    const rectHeight = fontSize + padding * 2

    this.ctx!.fillStyle = backgroundColor
    this.ctx!.fillRect(
      position.x - padding,
      position.y - fontSize - padding,
      rectWidth,
      rectHeight
    )

    // Draw text
    this.ctx!.fillStyle = color
    this.ctx!.fillText(annotation.text, position.x, position.y)

    // Reset alpha
    this.ctx!.globalAlpha = 1
  }

  /**
   * Calculate approximate file size from data URL
   */
  private calculateDataUrlSize(dataUrl: string): number {
    // Remove data URL prefix and calculate base64 size
    const base64Data = dataUrl.split(',')[1]
    if (!base64Data) return 0

    // Base64 is ~33% larger than binary
    return Math.round((base64Data.length * 3) / 4)
  }

  /**
   * Generate HACCP-specific annotations
   */
  public generateHACCPAnnotations(
    metadata: PhotoMetadata
  ): AnnotationOptions[] {
    const annotations: AnnotationOptions[] = []

    // Add timestamp
    annotations.push({
      text: metadata.timestamp.toLocaleString(),
      position: { x: 10, y: 30 },
      fontSize: 14,
      color: '#ffffff',
      backgroundColor: '#000000',
      opacity: 0.8,
    })

    // Add HACCP context if available
    if (metadata.haccpContext) {
      if (metadata.haccpContext.conservationPointId) {
        annotations.push({
          text: `CP: ${metadata.haccpContext.conservationPointId}`,
          position: { x: 10, y: 60 },
          fontSize: 12,
          color: '#ffffff',
          backgroundColor: '#0066cc',
          opacity: 0.8,
        })
      }

      if (metadata.haccpContext.taskId) {
        annotations.push({
          text: `Task: ${metadata.haccpContext.taskId}`,
          position: { x: 10, y: 90 },
          fontSize: 12,
          color: '#ffffff',
          backgroundColor: '#009900',
          opacity: 0.8,
        })
      }

      if (metadata.haccpContext.notes) {
        annotations.push({
          text: metadata.haccpContext.notes,
          position: { x: 10, y: 120 },
          fontSize: 12,
          color: '#ffffff',
          backgroundColor: '#cc6600',
          opacity: 0.8,
        })
      }
    }

    return annotations
  }
}

// Export singleton instance
export const photoProcessor = PhotoProcessor.getInstance()
export default photoProcessor
