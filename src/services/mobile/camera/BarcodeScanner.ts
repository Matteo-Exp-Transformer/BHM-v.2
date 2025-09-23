/**
 * BarcodeScanner - B.8.4 Advanced Mobile Features
 * QR/Barcode scanning for product identification in HACCP inventory
 */

import jsQR from 'jsqr'
import { PhotoMetadata } from './CameraService'

export interface ScanResult {
  id: string
  timestamp: Date
  data: string
  format: 'QR_CODE' | 'CODE_128' | 'CODE_39' | 'EAN_13' | 'EAN_8' | 'UPC_A' | 'UPC_E' | 'UNKNOWN'
  confidence: number
  location: {
    topLeftCorner: { x: number; y: number }
    topRightCorner: { x: number; y: number }
    bottomLeftCorner: { x: number; y: number }
    bottomRightCorner: { x: number; y: number }
  }
  metadata: PhotoMetadata
  haccpContext?: {
    productId?: string
    batchNumber?: string
    expirationDate?: string
    supplierId?: string
  }
}

export interface ScanOptions {
  formats?: ScanResult['format'][]
  maxResults?: number
  confidenceThreshold?: number
  enableMultipleScan?: boolean
  autoFocus?: boolean
}

export interface ProductInfo {
  productId: string
  name: string
  category: string
  batchNumber?: string
  expirationDate?: Date
  supplier: string
  haccpCriticalPoints: string[]
  temperatureRequirements?: {
    min: number
    max: number
    unit: 'celsius' | 'fahrenheit'
  }
}

export class BarcodeScanner {
  private static instance: BarcodeScanner
  private scanHistory: ScanResult[] = []
  private productDatabase: Map<string, ProductInfo> = new Map()

  private constructor() {
    this.initializeProductDatabase()
  }

  public static getInstance(): BarcodeScanner {
    if (!BarcodeScanner.instance) {
      BarcodeScanner.instance = new BarcodeScanner()
    }
    return BarcodeScanner.instance
  }

  /**
   * Initialize product database with sample HACCP products
   */
  private initializeProductDatabase(): void {
    // Sample HACCP products for testing
    const sampleProducts: ProductInfo[] = [
      {
        productId: 'MEAT001',
        name: 'Fresh Beef - Premium Cut',
        category: 'Meat',
        batchNumber: 'B20250123',
        expirationDate: new Date('2025-01-30'),
        supplier: 'Premium Meat Co.',
        haccpCriticalPoints: ['Temperature Control', 'Cross Contamination'],
        temperatureRequirements: { min: 0, max: 4, unit: 'celsius' }
      },
      {
        productId: 'DAIRY002',
        name: 'Organic Milk - Whole',
        category: 'Dairy',
        batchNumber: 'D20250120',
        expirationDate: new Date('2025-01-27'),
        supplier: 'Green Dairy Farm',
        haccpCriticalPoints: ['Temperature Control', 'Pasteurization'],
        temperatureRequirements: { min: 2, max: 6, unit: 'celsius' }
      },
      {
        productId: 'VEG003',
        name: 'Mixed Salad Greens',
        category: 'Vegetables',
        batchNumber: 'V20250122',
        expirationDate: new Date('2025-01-25'),
        supplier: 'Fresh Garden Co.',
        haccpCriticalPoints: ['Washing', 'Cross Contamination'],
        temperatureRequirements: { min: 1, max: 5, unit: 'celsius' }
      }
    ]

    sampleProducts.forEach(product => {
      this.productDatabase.set(product.productId, product)
    })
  }

  /**
   * Scan QR code from image data URL
   */
  public async scanQRCode(
    dataUrl: string,
    metadata: PhotoMetadata,
    options: ScanOptions = {}
  ): Promise<ScanResult | null> {
    try {
      const imageData = await this.dataUrlToImageData(dataUrl)
      const qrCode = jsQR(imageData.data, imageData.width, imageData.height)

      if (!qrCode) {
        return null
      }

      const result: ScanResult = {
        id: this.generateScanId(),
        timestamp: new Date(),
        data: qrCode.data,
        format: 'QR_CODE',
        confidence: 1.0, // jsQR doesn't provide confidence, assume high
        location: {
          topLeftCorner: { x: qrCode.location.topLeftCorner.x, y: qrCode.location.topLeftCorner.y },
          topRightCorner: { x: qrCode.location.topRightCorner.x, y: qrCode.location.topRightCorner.y },
          bottomLeftCorner: { x: qrCode.location.bottomLeftCorner.x, y: qrCode.location.bottomLeftCorner.y },
          bottomRightCorner: { x: qrCode.location.bottomRightCorner.x, y: qrCode.location.bottomRightCorner.y }
        },
        metadata
      }

      // Try to parse product information
      const productInfo = this.parseProductData(result.data)
      if (productInfo) {
        result.haccpContext = productInfo
      }

      this.scanHistory.push(result)
      return result
    } catch (error) {
      console.error('❌ QR code scan failed:', error)
      throw new Error(`QR code scan failed: ${error}`)
    }
  }

  /**
   * Scan barcode from image data URL
   */
  public async scanBarcode(
    dataUrl: string,
    metadata: PhotoMetadata,
    options: ScanOptions = {}
  ): Promise<ScanResult[]> {
    try {
      // For now, we'll use a simplified approach
      // In a real implementation, you'd use a barcode library like QuaggaJS or ZXing
      const results: ScanResult[] = []

      // Try to extract barcode data from image
      const imageData = await this.dataUrlToImageData(dataUrl)
      
      // This is a placeholder - real barcode scanning would require additional libraries
      // For now, we'll simulate finding a barcode
      const simulatedBarcode = this.simulateBarcodeDetection(imageData)
      
      if (simulatedBarcode) {
        const result: ScanResult = {
          id: this.generateScanId(),
          timestamp: new Date(),
          data: simulatedBarcode.data,
          format: simulatedBarcode.format,
          confidence: simulatedBarcode.confidence,
          location: simulatedBarcode.location,
          metadata
        }

        // Try to parse product information
        const productInfo = this.parseProductData(result.data)
        if (productInfo) {
          result.haccpContext = productInfo
        }

        results.push(result)
        this.scanHistory.push(result)
      }

      return results
    } catch (error) {
      console.error('❌ Barcode scan failed:', error)
      throw new Error(`Barcode scan failed: ${error}`)
    }
  }

  /**
   * Scan both QR codes and barcodes from image
   */
  public async scanAll(
    dataUrl: string,
    metadata: PhotoMetadata,
    options: ScanOptions = {}
  ): Promise<ScanResult[]> {
    const results: ScanResult[] = []

    try {
      // Scan QR code
      const qrResult = await this.scanQRCode(dataUrl, metadata, options)
      if (qrResult) {
        results.push(qrResult)
      }

      // Scan barcodes
      const barcodeResults = await this.scanBarcode(dataUrl, metadata, options)
      results.push(...barcodeResults)

      return results
    } catch (error) {
      console.error('❌ Multi-format scan failed:', error)
      throw new Error(`Multi-format scan failed: ${error}`)
    }
  }

  /**
   * Get scan history
   */
  public getScanHistory(): ScanResult[] {
    return [...this.scanHistory]
  }

  /**
   * Get scans by HACCP context
   */
  public getScansByContext(context: Partial<ScanResult['haccpContext']>): ScanResult[] {
    return this.scanHistory.filter(scan => {
      if (!scan.haccpContext || !context) return false
      
      return Object.keys(context).every(key => {
        const contextKey = key as keyof ScanResult['haccpContext']
        return scan.haccpContext?.[contextKey] === context[contextKey]
      })
    })
  }

  /**
   * Get product information by ID
   */
  public getProductInfo(productId: string): ProductInfo | null {
    return this.productDatabase.get(productId) || null
  }

  /**
   * Add product to database
   */
  public addProduct(product: ProductInfo): void {
    this.productDatabase.set(product.productId, product)
  }

  /**
   * Clear scan history
   */
  public clearHistory(): void {
    this.scanHistory = []
  }

  /**
   * Convert data URL to ImageData
   */
  private async dataUrlToImageData(dataUrl: string): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            reject(new Error('Canvas context not available'))
            return
          }

          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          resolve(imageData)
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = dataUrl
    })
  }

  /**
   * Parse product data from scanned code
   */
  private parseProductData(data: string): ScanResult['haccpContext'] | null {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(data)
      if (parsed.productId) {
        return {
          productId: parsed.productId,
          batchNumber: parsed.batchNumber,
          expirationDate: parsed.expirationDate,
          supplierId: parsed.supplierId
        }
      }
    } catch {
      // Not JSON, try to match against product database
      const product = this.productDatabase.get(data)
      if (product) {
        return {
          productId: product.productId,
          batchNumber: product.batchNumber,
          expirationDate: product.expirationDate?.toISOString(),
          supplierId: product.supplier
        }
      }
    }

    return null
  }

  /**
   * Simulate barcode detection (placeholder for real implementation)
   */
  private simulateBarcodeDetection(imageData: ImageData): Partial<ScanResult> | null {
    // This is a placeholder - real implementation would use barcode libraries
    // For demo purposes, we'll return null to indicate no barcode found
    return null
  }

  /**
   * Generate unique scan ID
   */
  private generateScanId(): string {
    return `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Export singleton instance
export const barcodeScanner = BarcodeScanner.getInstance()
export default barcodeScanner
