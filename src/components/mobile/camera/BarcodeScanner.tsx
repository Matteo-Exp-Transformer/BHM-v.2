/**
 * BarcodeScanner - B.8.4 Advanced Mobile Features
 * Scanner interface for QR/Barcode recognition in HACCP inventory
 */

import React, { useState, useRef, useEffect } from 'react'
import { barcodeScanner, ScanResult, ProductInfo } from '@/services/mobile/camera'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  QrCode, 
  Package, 
  Search, 
  CheckCircle, 
  AlertCircle,
  Camera,
  RefreshCw,
  Info
} from 'lucide-react'

interface BarcodeScannerProps {
  onScanComplete?: (scanResult: ScanResult) => void
  onProductFound?: (product: ProductInfo) => void
  onError?: (error: Error) => void
  className?: string
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScanComplete,
  onProductFound,
  onError,
  className = ''
}) => {
  const [isScanning, setIsScanning] = useState(false)
  const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null)
  const [foundProduct, setFoundProduct] = useState<ProductInfo | null>(null)
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([])
  const [manualCode, setManualCode] = useState('')
  const [isManualMode, setIsManualMode] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadScanHistory()
  }, [])

  const loadScanHistory = () => {
    const history = barcodeScanner.getScanHistory()
    setScanHistory(history)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsScanning(true)
    try {
      const dataUrl = await fileToDataUrl(file)
      
      // Create mock metadata for scanning
      const mockMetadata = {
        id: `scan_${Date.now()}`,
        timestamp: new Date(),
        deviceInfo: {
          platform: 'web',
          model: 'browser',
          osVersion: 'unknown'
        },
        cameraSettings: {
          quality: 85,
          resolution: { width: 1920, height: 1080 },
          flashUsed: false
        }
      }

      const results = await barcodeScanner.scanAll(dataUrl, mockMetadata)
      
      if (results.length > 0) {
        const result = results[0]
        setLastScanResult(result)
        onScanComplete?.(result)

        // Check if product exists in database
        if (result.haccpContext?.productId) {
          const product = barcodeScanner.getProductInfo(result.haccpContext.productId)
          if (product) {
            setFoundProduct(product)
            onProductFound?.(product)
          }
        }
      } else {
        throw new Error('No barcodes or QR codes found in image')
      }
    } catch (error) {
      console.error('❌ Scan failed:', error)
      onError?.(error as Error)
    } finally {
      setIsScanning(false)
    }
  }

  const handleManualCodeSubmit = () => {
    if (!manualCode.trim()) return

    const mockResult: ScanResult = {
      id: `manual_${Date.now()}`,
      timestamp: new Date(),
      data: manualCode,
      format: 'UNKNOWN',
      confidence: 1.0,
      location: {
        topLeftCorner: { x: 0, y: 0 },
        topRightCorner: { x: 100, y: 0 },
        bottomLeftCorner: { x: 0, y: 100 },
        bottomRightCorner: { x: 100, y: 100 }
      },
      metadata: {
        id: `manual_${Date.now()}`,
        timestamp: new Date(),
        deviceInfo: {
          platform: 'web',
          model: 'browser',
          osVersion: 'unknown'
        },
        cameraSettings: {
          quality: 85,
          resolution: { width: 1920, height: 1080 },
          flashUsed: false
        }
      }
    }

    setLastScanResult(mockResult)
    onScanComplete?.(mockResult)

    // Check if product exists
    const product = barcodeScanner.getProductInfo(manualCode)
    if (product) {
      setFoundProduct(product)
      onProductFound?.(product)
    }

    setManualCode('')
    setIsManualMode(false)
  }

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const formatScanResult = (result: ScanResult): string => {
    switch (result.format) {
      case 'QR_CODE':
        return 'QR Code'
      case 'CODE_128':
        return 'Code 128'
      case 'CODE_39':
        return 'Code 39'
      case 'EAN_13':
        return 'EAN-13'
      case 'EAN_8':
        return 'EAN-8'
      case 'UPC_A':
        return 'UPC-A'
      case 'UPC_E':
        return 'UPC-E'
      default:
        return 'Unknown Format'
    }
  }

  const getFormatIcon = (format: ScanResult['format']) => {
    switch (format) {
      case 'QR_CODE':
        return <QrCode className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getFormatColor = (format: ScanResult['format']) => {
    switch (format) {
      case 'QR_CODE':
        return 'bg-blue-100 text-blue-800'
      case 'CODE_128':
      case 'CODE_39':
        return 'bg-green-100 text-green-800'
      case 'EAN_13':
      case 'EAN_8':
      case 'UPC_A':
      case 'UPC_E':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      {/* Scanner Controls */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Barcode Scanner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanning}
              className="w-full"
            >
              {isScanning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Scanning...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Upload Image to Scan
                </>
              )}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Manual Entry */}
          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={() => setIsManualMode(!isManualMode)}
              className="w-full"
            >
              <Search className="h-4 w-4 mr-2" />
              {isManualMode ? 'Hide' : 'Show'} Manual Entry
            </Button>

            {isManualMode && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Enter product code manually..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  onClick={handleManualCodeSubmit}
                  disabled={!manualCode.trim()}
                  className="w-full"
                  size="sm"
                >
                  Submit Code
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Last Scan Result */}
      {lastScanResult && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Scan Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className={getFormatColor(lastScanResult.format)}>
                {getFormatIcon(lastScanResult.format)}
                <span className="ml-1">{formatScanResult(lastScanResult)}</span>
              </Badge>
              <span className="text-sm text-gray-500">
                Confidence: {Math.round(lastScanResult.confidence * 100)}%
              </span>
            </div>

            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm font-mono break-all">{lastScanResult.data}</p>
            </div>

            <div className="text-xs text-gray-500">
              Scanned: {lastScanResult.timestamp.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Found Product Info */}
      {foundProduct && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-500" />
              Product Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-medium">{foundProduct.name}</h4>
              <p className="text-sm text-gray-600">{foundProduct.category}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Product ID:</span>
                <span className="font-mono">{foundProduct.productId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Supplier:</span>
                <span>{foundProduct.supplier}</span>
              </div>
              {foundProduct.batchNumber && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Batch:</span>
                  <span className="font-mono">{foundProduct.batchNumber}</span>
                </div>
              )}
              {foundProduct.expirationDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Expires:</span>
                  <span>{foundProduct.expirationDate.toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {foundProduct.temperatureRequirements && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Temperature: {foundProduct.temperatureRequirements.min}°{foundProduct.temperatureRequirements.unit === 'celsius' ? 'C' : 'F'} - {foundProduct.temperatureRequirements.max}°{foundProduct.temperatureRequirements.unit === 'celsius' ? 'C' : 'F'}
                </AlertDescription>
              </Alert>
            )}

            <div>
              <p className="text-sm font-medium mb-2">HACCP Critical Points:</p>
              <div className="flex flex-wrap gap-1">
                {foundProduct.haccpCriticalPoints.map((point, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {point}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Recent Scans ({scanHistory.length})</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadScanHistory}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {scanHistory.slice(-5).reverse().map((scan, index) => (
                <div key={scan.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                  <div className="flex items-center gap-2">
                    {getFormatIcon(scan.format)}
                    <span className="font-mono truncate max-w-32">{scan.data}</span>
                  </div>
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

export default BarcodeScanner
