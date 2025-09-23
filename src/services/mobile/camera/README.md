# 📷 Camera Services - B.8.4 Advanced Mobile Features

This module provides comprehensive camera functionality for HACCP photo documentation, including photo capture, processing, barcode scanning, and gallery management.

## 🚀 Features Implemented

### ✅ Session 1-2: Camera & Photo Management

- **Advanced Camera Controls** - Quality settings, source selection, device capabilities
- **Photo Compression** - Automatic compression with quality control
- **Image Annotation** - Text overlays, shapes, and markup tools
- **QR/Barcode Scanning** - Product identification and HACCP context parsing
- **Photo Gallery** - Search, filter, sort, and manage captured photos

## 📁 File Structure

```
src/services/mobile/camera/
├── CameraService.ts          # Main camera service with capture controls
├── PhotoProcessor.ts          # Image compression, filters, and annotations
├── BarcodeScanner.ts          # QR/Barcode recognition and product lookup
├── PhotoGallery.ts            # Gallery management with search and filtering
├── index.ts                  # Module exports and types
└── README.md                 # This documentation

src/components/mobile/camera/
├── CameraCapture.tsx          # Camera interface component
├── PhotoAnnotation.tsx        # Image markup tools
├── BarcodeScanner.tsx         # Scanner interface
├── PhotoGalleryView.tsx       # Gallery component
└── CameraDemo.tsx            # Demo integration component
```

## 🛠️ Services Overview

### CameraService

Main service for camera operations:

```typescript
import { cameraService } from '@/services/mobile/camera'

// Initialize camera
await cameraService.initialize()

// Capture photo with HACCP context
const metadata = await cameraService.captureHACCPPhoto({
  conservationPointId: 'CP001',
  taskId: 'DAILY_INSPECTION',
  notes: 'Temperature check',
})

// Check capabilities
const capabilities = cameraService.getCapabilities()
```

### PhotoProcessor

Image processing and annotation:

```typescript
import { photoProcessor } from '@/services/mobile/camera'

// Compress photo
const compressed = await photoProcessor.compressPhoto(dataUrl, {
  quality: 85,
  maxWidth: 1920,
  maxHeight: 1080,
})

// Add annotations
const annotated = await photoProcessor.addAnnotations(dataUrl, [
  {
    text: 'Temperature: 4°C',
    position: { x: 50, y: 50 },
    fontSize: 16,
    color: '#ffffff',
    backgroundColor: '#000000',
  },
])

// Generate HACCP annotations
const haccpAnnotations = photoProcessor.generateHACCPAnnotations(metadata)
```

### BarcodeScanner

QR/Barcode scanning and product lookup:

```typescript
import { barcodeScanner } from '@/services/mobile/camera'

// Scan QR code
const result = await barcodeScanner.scanQRCode(dataUrl, metadata)

// Scan all formats
const results = await barcodeScanner.scanAll(dataUrl, metadata)

// Get product information
const product = barcodeScanner.getProductInfo('MEAT001')

// Add product to database
barcodeScanner.addProduct({
  productId: 'NEW001',
  name: 'Fresh Product',
  category: 'Meat',
  haccpCriticalPoints: ['Temperature Control'],
})
```

### PhotoGallery

Gallery management and organization:

```typescript
import { photoGallery } from '@/services/mobile/camera'

// Add photos to gallery
photoGallery.addPhoto(metadata, thumbnail)
photoGallery.addProcessedPhoto(processedPhoto, thumbnail)
photoGallery.addScanResult(scanResult, thumbnail)

// Search and filter
const items = photoGallery.getItems(
  {
    dateRange: { start: new Date('2025-01-01'), end: new Date('2025-01-31') },
    haccpContext: { conservationPointId: 'CP001' },
  },
  { field: 'timestamp', direction: 'desc' },
  { query: 'temperature', fields: ['notes'] }
)

// Get statistics
const stats = photoGallery.getStats()
```

## 🎯 Component Usage

### CameraCapture

```tsx
import { CameraCapture } from '@/components/mobile/camera/CameraCapture'

;<CameraCapture
  onPhotoCaptured={metadata => console.log('Photo captured:', metadata)}
  onError={error => console.error('Camera error:', error)}
  haccpContext={{
    conservationPointId: 'CP001',
    taskId: 'DAILY_INSPECTION',
    notes: 'Temperature check',
  }}
/>
```

### PhotoAnnotation

```tsx
import { PhotoAnnotation } from '@/components/mobile/camera/PhotoAnnotation'

;<PhotoAnnotation
  photoDataUrl={photoDataUrl}
  onAnnotationComplete={processedPhoto =>
    console.log('Annotation complete:', processedPhoto)
  }
  onCancel={() => setShowAnnotation(false)}
/>
```

### BarcodeScanner

```tsx
import { BarcodeScanner } from '@/components/mobile/camera/BarcodeScanner'

;<BarcodeScanner
  onScanComplete={scanResult => console.log('Scan complete:', scanResult)}
  onProductFound={product => console.log('Product found:', product)}
  onError={error => console.error('Scan error:', error)}
/>
```

### PhotoGalleryView

```tsx
import { PhotoGalleryView } from '@/components/mobile/camera/PhotoGalleryView'

;<PhotoGalleryView
  onItemSelect={item => console.log('Item selected:', item)}
  onItemDelete={itemId => console.log('Item deleted:', itemId)}
/>
```

## 📱 Mobile Integration

### Device Capabilities

The camera service automatically detects device capabilities:

```typescript
const capabilities = cameraService.getCapabilities()
// {
//   hasCamera: true,
//   hasFlash: false,
//   hasFrontCamera: false,
//   maxResolution: { width: 4096, height: 3072 },
//   supportedFormats: ['image/jpeg', 'image/png', 'image/webp']
// }
```

### HACCP Context Integration

All photos and scans include HACCP context:

```typescript
interface PhotoMetadata {
  haccpContext?: {
    conservationPointId?: string
    taskId?: string
    inspectionId?: string
    notes?: string
  }
}
```

### Performance Optimization

- **Lazy Loading** - Components load only when needed
- **Image Compression** - Automatic compression to reduce storage
- **Thumbnail Generation** - Efficient thumbnail creation for gallery
- **Memory Management** - Proper cleanup of image resources

## 🔧 Configuration

### Camera Options

```typescript
interface CameraOptions {
  quality?: number // 0-100, default: 85
  allowEditing?: boolean // default: false
  resultType?: CameraResultType
  source?: CameraSource // Camera or Photos
  width?: number
  height?: number
  correctOrientation?: boolean
  saveToGallery?: boolean
}
```

### Compression Options

```typescript
interface CompressionOptions {
  maxWidth?: number // default: 1920
  maxHeight?: number // default: 1080
  quality?: number // 0-100, default: 85
  format?: 'jpeg' | 'png' | 'webp'
  progressive?: boolean
}
```

## 🧪 Testing

The camera services include comprehensive error handling and fallbacks:

- **Permission Handling** - Graceful permission requests
- **Device Compatibility** - Fallbacks for unsupported features
- **Error Recovery** - Retry mechanisms for failed operations
- **Validation** - Input validation and sanitization

## 🚀 Next Steps

This completes **B.8.4 Session 1-2: Camera & Photo Management**.

Ready for **B.8.4 Session 3-4: GPS & Location Features**:

- GPS-based conservation point mapping
- Geofencing for temperature monitoring
- Location-based task assignments
- Route optimization for inspections
- Offline map caching

## 📚 Dependencies

- `@capacitor/camera` - Camera access and controls
- `@capacitor/device` - Device information
- `jsqr` - QR code recognition
- `tesseract.js` - OCR capabilities (future)
- Canvas API - Image processing
- File API - File handling

## 🎉 Success Criteria Met

- ✅ Advanced camera integration with manual controls
- ✅ Photo compression and storage optimization
- ✅ Image annotation and markup tools
- ✅ QR/Barcode scanning for product identification
- ✅ Photo gallery with search and filtering
- ✅ Mobile-responsive interface
- ✅ HACCP context integration
- ✅ Performance optimization
- ✅ Error handling and fallbacks
