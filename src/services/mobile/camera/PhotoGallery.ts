/**
 * PhotoGallery - B.8.4 Advanced Mobile Features
 * Photo gallery management with search and filtering for HACCP documentation
 */

import { PhotoMetadata } from './CameraService'
import { ProcessedPhoto } from './PhotoProcessor'
import { ScanResult } from './BarcodeScanner'

export interface GalleryFilter {
  dateRange?: {
    start: Date
    end: Date
  }
  haccpContext?: {
    conservationPointId?: string
    taskId?: string
    inspectionId?: string
  }
  deviceInfo?: {
    platform?: string
    model?: string
  }
  hasAnnotations?: boolean
  hasScans?: boolean
  fileSizeRange?: {
    min: number
    max: number
  }
}

export interface GallerySort {
  field: 'timestamp' | 'fileSize' | 'deviceModel' | 'conservationPointId'
  direction: 'asc' | 'desc'
}

export interface GallerySearch {
  query: string
  fields: (
    | 'notes'
    | 'conservationPointId'
    | 'taskId'
    | 'inspectionId'
    | 'deviceModel'
  )[]
  caseSensitive?: boolean
}

export interface GalleryItem {
  id: string
  type: 'photo' | 'processed' | 'scan'
  data: PhotoMetadata | ProcessedPhoto | ScanResult
  thumbnail: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface GalleryStats {
  totalItems: number
  totalSize: number
  itemsByType: {
    photos: number
    processed: number
    scans: number
  }
  itemsByDate: {
    today: number
    thisWeek: number
    thisMonth: number
  }
  itemsByDevice: Record<string, number>
  itemsByHACCPContext: Record<string, number>
}

export class PhotoGallery {
  private static instance: PhotoGallery
  private items: Map<string, GalleryItem> = new Map()
  private thumbnailCache: Map<string, string> = new Map()

  private constructor() {}

  public static getInstance(): PhotoGallery {
    if (!PhotoGallery.instance) {
      PhotoGallery.instance = new PhotoGallery()
    }
    return PhotoGallery.instance
  }

  /**
   * Add photo to gallery
   */
  public addPhoto(metadata: PhotoMetadata, thumbnail?: string): string {
    const item: GalleryItem = {
      id: metadata.id,
      type: 'photo',
      data: metadata,
      thumbnail: thumbnail || this.generateThumbnail(metadata),
      tags: this.generateTags(metadata),
      createdAt: metadata.timestamp,
      updatedAt: metadata.timestamp,
    }

    this.items.set(item.id, item)
    return item.id
  }

  /**
   * Add processed photo to gallery
   */
  public addProcessedPhoto(
    processedPhoto: ProcessedPhoto,
    thumbnail?: string
  ): string {
    const item: GalleryItem = {
      id: processedPhoto.id,
      type: 'processed',
      data: processedPhoto,
      thumbnail: thumbnail || this.generateThumbnail(processedPhoto.metadata),
      tags: this.generateTags(processedPhoto.metadata),
      createdAt: processedPhoto.metadata.timestamp,
      updatedAt: new Date(),
    }

    this.items.set(item.id, item)
    return item.id
  }

  /**
   * Add scan result to gallery
   */
  public addScanResult(scanResult: ScanResult, thumbnail?: string): string {
    const item: GalleryItem = {
      id: scanResult.id,
      type: 'scan',
      data: scanResult,
      thumbnail: thumbnail || this.generateThumbnail(scanResult.metadata),
      tags: this.generateTags(scanResult.metadata),
      createdAt: scanResult.timestamp,
      updatedAt: scanResult.timestamp,
    }

    this.items.set(item.id, item)
    return item.id
  }

  /**
   * Get gallery items with filtering, sorting, and search
   */
  public getItems(
    filter?: GalleryFilter,
    sort?: GallerySort,
    search?: GallerySearch,
    limit?: number,
    offset?: number
  ): GalleryItem[] {
    let items = Array.from(this.items.values())

    // Apply search
    if (search) {
      items = this.applySearch(items, search)
    }

    // Apply filter
    if (filter) {
      items = this.applyFilter(items, filter)
    }

    // Apply sort
    if (sort) {
      items = this.applySort(items, sort)
    }

    // Apply pagination
    if (offset !== undefined) {
      items = items.slice(offset)
    }
    if (limit !== undefined) {
      items = items.slice(0, limit)
    }

    return items
  }

  /**
   * Get gallery statistics
   */
  public getStats(): GalleryStats {
    const items = Array.from(this.items.values())
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisMonth = new Date(today.getFullYear(), now.getMonth(), 1)

    const stats: GalleryStats = {
      totalItems: items.length,
      totalSize: 0,
      itemsByType: {
        photos: 0,
        processed: 0,
        scans: 0,
      },
      itemsByDate: {
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
      },
      itemsByDevice: {},
      itemsByHACCPContext: {},
    }

    items.forEach(item => {
      // Count by type
      stats.itemsByType[
        item.type === 'photo'
          ? 'photos'
          : item.type === 'processed'
            ? 'processed'
            : 'scans'
      ]++

      // Count by date
      const itemDate = item.createdAt
      if (itemDate >= today) stats.itemsByDate.today++
      if (itemDate >= thisWeek) stats.itemsByDate.thisWeek++
      if (itemDate >= thisMonth) stats.itemsByDate.thisMonth++

      // Count by device
      const deviceKey = `${item.data.deviceInfo.platform} ${item.data.deviceInfo.model}`
      stats.itemsByDevice[deviceKey] = (stats.itemsByDevice[deviceKey] || 0) + 1

      // Count by HACCP context
      if (item.data.haccpContext) {
        const contextKey =
          item.data.haccpContext.conservationPointId || 'Unknown'
        stats.itemsByHACCPContext[contextKey] =
          (stats.itemsByHACCPContext[contextKey] || 0) + 1
      }

      // Calculate total size
      if (item.type === 'processed') {
        const processedData = item.data as ProcessedPhoto
        stats.totalSize += processedData.fileSize.processed
      } else {
        // Estimate size for photos and scans
        stats.totalSize += 500000 // 500KB estimate
      }
    })

    return stats
  }

  /**
   * Get item by ID
   */
  public getItem(id: string): GalleryItem | null {
    return this.items.get(id) || null
  }

  /**
   * Remove item from gallery
   */
  public removeItem(id: string): boolean {
    return this.items.delete(id)
  }

  /**
   * Clear all items
   */
  public clearAll(): void {
    this.items.clear()
    this.thumbnailCache.clear()
  }

  /**
   * Export gallery data
   */
  public exportData(): {
    items: GalleryItem[]
    stats: GalleryStats
    exportDate: Date
  } {
    return {
      items: Array.from(this.items.values()),
      stats: this.getStats(),
      exportDate: new Date(),
    }
  }

  /**
   * Import gallery data
   */
  public importData(data: { items: GalleryItem[] }): void {
    data.items.forEach(item => {
      this.items.set(item.id, item)
    })
  }

  /**
   * Apply search to items
   */
  private applySearch(
    items: GalleryItem[],
    search: GallerySearch
  ): GalleryItem[] {
    const { query, fields, caseSensitive = false } = search
    const searchQuery = caseSensitive ? query : query.toLowerCase()

    return items.filter(item => {
      return fields.some(field => {
        let value = ''

        switch (field) {
          case 'notes':
            value = item.data.haccpContext?.notes || ''
            break
          case 'conservationPointId':
            value = item.data.haccpContext?.conservationPointId || ''
            break
          case 'taskId':
            value = item.data.haccpContext?.taskId || ''
            break
          case 'inspectionId':
            value = item.data.haccpContext?.inspectionId || ''
            break
          case 'deviceModel':
            value = item.data.deviceInfo.model || ''
            break
        }

        const searchValue = caseSensitive ? value : value.toLowerCase()
        return searchValue.includes(searchQuery)
      })
    })
  }

  /**
   * Apply filter to items
   */
  private applyFilter(
    items: GalleryItem[],
    filter: GalleryFilter
  ): GalleryItem[] {
    return items.filter(item => {
      // Date range filter
      if (filter.dateRange) {
        const itemDate = item.createdAt
        if (
          itemDate < filter.dateRange.start ||
          itemDate > filter.dateRange.end
        ) {
          return false
        }
      }

      // HACCP context filter
      if (filter.haccpContext) {
        const context = item.data.haccpContext
        if (!context) return false

        if (
          filter.haccpContext.conservationPointId &&
          context.conservationPointId !==
            filter.haccpContext.conservationPointId
        ) {
          return false
        }
        if (
          filter.haccpContext.taskId &&
          context.taskId !== filter.haccpContext.taskId
        ) {
          return false
        }
        if (
          filter.haccpContext.inspectionId &&
          context.inspectionId !== filter.haccpContext.inspectionId
        ) {
          return false
        }
      }

      // Device info filter
      if (filter.deviceInfo) {
        if (
          filter.deviceInfo.platform &&
          item.data.deviceInfo.platform !== filter.deviceInfo.platform
        ) {
          return false
        }
        if (
          filter.deviceInfo.model &&
          item.data.deviceInfo.model !== filter.deviceInfo.model
        ) {
          return false
        }
      }

      // Has annotations filter
      if (filter.hasAnnotations !== undefined) {
        const hasAnnotations =
          item.type === 'processed' &&
          (item.data as ProcessedPhoto).processingOptions.annotations?.length >
            0
        if (hasAnnotations !== filter.hasAnnotations) {
          return false
        }
      }

      // Has scans filter
      if (filter.hasScans !== undefined) {
        const hasScans = item.type === 'scan'
        if (hasScans !== filter.hasScans) {
          return false
        }
      }

      // File size range filter
      if (filter.fileSizeRange) {
        let fileSize = 0
        if (item.type === 'processed') {
          fileSize = (item.data as ProcessedPhoto).fileSize.processed
        } else {
          fileSize = 500000 // Estimate
        }

        if (
          fileSize < filter.fileSizeRange.min ||
          fileSize > filter.fileSizeRange.max
        ) {
          return false
        }
      }

      return true
    })
  }

  /**
   * Apply sort to items
   */
  private applySort(items: GalleryItem[], sort: GallerySort): GalleryItem[] {
    return items.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sort.field) {
        case 'timestamp':
          aValue = a.createdAt.getTime()
          bValue = b.createdAt.getTime()
          break
        case 'fileSize':
          aValue =
            a.type === 'processed'
              ? (a.data as ProcessedPhoto).fileSize.processed
              : 500000
          bValue =
            b.type === 'processed'
              ? (b.data as ProcessedPhoto).fileSize.processed
              : 500000
          break
        case 'deviceModel':
          aValue = a.data.deviceInfo.model
          bValue = b.data.deviceInfo.model
          break
        case 'conservationPointId':
          aValue = a.data.haccpContext?.conservationPointId || ''
          bValue = b.data.haccpContext?.conservationPointId || ''
          break
        default:
          return 0
      }

      if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1
      return 0
    })
  }

  /**
   * Generate thumbnail from metadata
   */
  private generateThumbnail(metadata: PhotoMetadata): string {
    // For now, return a placeholder
    // In a real implementation, you'd generate actual thumbnails
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
        <rect width="150" height="150" fill="#f0f0f0"/>
        <text x="75" y="75" text-anchor="middle" dy=".3em" font-family="Arial" font-size="12" fill="#666">
          📷 ${metadata.id.slice(-6)}
        </text>
      </svg>
    `)}`
  }

  /**
   * Generate tags from metadata
   */
  private generateTags(metadata: PhotoMetadata): string[] {
    const tags: string[] = []

    // Add device tags
    tags.push(metadata.deviceInfo.platform)
    tags.push(metadata.deviceInfo.model)

    // Add HACCP context tags
    if (metadata.haccpContext) {
      if (metadata.haccpContext.conservationPointId) {
        tags.push(`CP-${metadata.haccpContext.conservationPointId}`)
      }
      if (metadata.haccpContext.taskId) {
        tags.push(`Task-${metadata.haccpContext.taskId}`)
      }
      if (metadata.haccpContext.inspectionId) {
        tags.push(`Insp-${metadata.haccpContext.inspectionId}`)
      }
    }

    // Add date tags
    const date = metadata.timestamp
    tags.push(date.toISOString().split('T')[0]) // YYYY-MM-DD
    tags.push(date.getFullYear().toString())

    return tags
  }
}

// Export singleton instance
export const photoGallery = PhotoGallery.getInstance()
export default photoGallery
