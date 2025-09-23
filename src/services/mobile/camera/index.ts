/**
 * Camera Services - B.8.4 Session 1-2
 * Photo management and barcode scanning for HACCP inventory
 *
 * ✅ IMPLEMENTED: B.8.4 Camera & Photo Management
 */

// Export all camera services
export { cameraService, CameraService } from './CameraService'
export { photoProcessor, PhotoProcessor } from './PhotoProcessor'
export { barcodeScanner, BarcodeScanner } from './BarcodeScanner'
export { photoGallery, PhotoGallery } from './PhotoGallery'

// Export types
export type { CameraOptions, CameraCapabilities, PhotoMetadata } from './CameraService'
export type { CompressionOptions, AnnotationOptions, FilterOptions, ProcessedPhoto } from './PhotoProcessor'
export type { ScanResult, ScanOptions, ProductInfo } from './BarcodeScanner'
export type { GalleryFilter, GallerySort, GallerySearch, GalleryItem, GalleryStats } from './PhotoGallery'

console.log('📷 Camera services implemented - B.8.4 Session 1-2 COMPLETED')