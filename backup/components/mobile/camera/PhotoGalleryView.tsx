/**
 * PhotoGalleryView - B.8.4 Advanced Mobile Features
 * Gallery component for viewing and managing HACCP photos
 */

import React, { useState, useEffect } from 'react'
import {
  photoGallery,
  GalleryItem,
  GalleryFilter,
  GallerySort,
  GalleryStats,
} from '@/services/mobile/camera'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import {
  Grid3X3,
  List,
  Search,
  Filter,
  Calendar,
  Download,
  Trash2,
  Eye,
  Image as ImageIcon,
  QrCode,
  Settings,
} from 'lucide-react'

interface PhotoGalleryViewProps {
  onItemSelect?: (item: GalleryItem) => void
  onItemDelete?: (itemId: string) => void
  className?: string
}

type ViewMode = 'grid' | 'list'

export const PhotoGalleryView: React.FC<PhotoGalleryViewProps> = ({
  onItemSelect,
  onItemDelete,
  className = '',
}) => {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [stats, setStats] = useState<GalleryStats | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<GalleryFilter>({})
  const [sort, setSort] = useState<GallerySort>({
    field: 'timestamp',
    direction: 'desc',
  })
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadGalleryData()
  }, [filter, sort, searchQuery])

  const loadGalleryData = () => {
    setIsLoading(true)
    try {
      const search = searchQuery
        ? {
            query: searchQuery,
            fields: [
              'notes',
              'conservationPointId',
              'taskId',
              'inspectionId',
              'deviceModel',
            ] as const,
            caseSensitive: false,
          }
        : undefined

      const galleryItems = photoGallery.getItems(filter, sort, search)
      const galleryStats = photoGallery.getStats()

      setItems(galleryItems)
      setStats(galleryStats)
    } catch (error) {
      console.error('❌ Failed to load gallery data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleItemClick = (item: GalleryItem) => {
    onItemSelect?.(item)
  }

  const handleItemDelete = (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      photoGallery.removeItem(itemId)
      onItemDelete?.(itemId)
      loadGalleryData()
    }
  }

  const handleBulkDelete = () => {
    if (selectedItems.size === 0) return

    if (
      confirm(`Are you sure you want to delete ${selectedItems.size} items?`)
    ) {
      selectedItems.forEach(itemId => {
        photoGallery.removeItem(itemId)
      })
      setSelectedItems(new Set())
      loadGalleryData()
    }
  }

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(items.map(item => item.id)))
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getItemIcon = (item: GalleryItem) => {
    switch (item.type) {
      case 'photo':
        return <ImageIcon className="h-4 w-4" />
      case 'processed':
        return <Settings className="h-4 w-4" />
      case 'scan':
        return <QrCode className="h-4 w-4" />
      default:
        return <ImageIcon className="h-4 w-4" />
    }
  }

  const getItemTypeColor = (item: GalleryItem) => {
    switch (item.type) {
      case 'photo':
        return 'bg-blue-100 text-blue-800'
      case 'processed':
        return 'bg-green-100 text-green-800'
      case 'scan':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const renderGridView = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map(item => (
        <Card
          key={item.id}
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedItems.has(item.id) ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => handleItemClick(item)}
        >
          <CardContent className="p-3">
            <div className="aspect-square bg-gray-100 rounded-md mb-2 flex items-center justify-center">
              <img
                src={item.thumbnail}
                alt={item.id}
                className="w-full h-full object-cover rounded-md"
                onError={e => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Badge className={getItemTypeColor(item)}>
                  {getItemIcon(item)}
                  <span className="ml-1 text-xs">{item.type}</span>
                </Badge>
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.id)}
                  onChange={e => {
                    e.stopPropagation()
                    handleSelectItem(item.id)
                  }}
                  className="h-4 w-4"
                />
              </div>
              <p className="text-xs text-gray-600 truncate">
                {item.createdAt.toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {item.data.deviceInfo.model}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderListView = () => (
    <div className="space-y-2">
      {items.map(item => (
        <Card
          key={item.id}
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedItems.has(item.id) ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => handleItemClick(item)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                <img
                  src={item.thumbnail}
                  alt={item.id}
                  className="w-full h-full object-cover rounded-md"
                  onError={e => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={getItemTypeColor(item)}>
                    {getItemIcon(item)}
                    <span className="ml-1 text-xs">{item.type}</span>
                  </Badge>
                  <span className="text-sm font-mono text-gray-500">
                    {item.id.slice(-8)}
                  </span>
                </div>

                <div className="text-sm text-gray-600">
                  <p>{item.createdAt.toLocaleString()}</p>
                  <p>
                    {item.data.deviceInfo.platform} -{' '}
                    {item.data.deviceInfo.model}
                  </p>
                  {item.data.haccpContext && (
                    <div className="flex gap-1 mt-1">
                      {item.data.haccpContext.conservationPointId && (
                        <Badge variant="outline" className="text-xs">
                          CP: {item.data.haccpContext.conservationPointId}
                        </Badge>
                      )}
                      {item.data.haccpContext.taskId && (
                        <Badge variant="outline" className="text-xs">
                          Task: {item.data.haccpContext.taskId}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.id)}
                  onChange={e => {
                    e.stopPropagation()
                    handleSelectItem(item.id)
                  }}
                  className="h-4 w-4"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={e => {
                    e.stopPropagation()
                    handleItemDelete(item.id)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gallery...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      {/* Header */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Photo Gallery
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search photos..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Sort */}
            <Select
              value={`${sort.field}-${sort.direction}`}
              onValueChange={value => {
                const [field, direction] = value.split('-')
                setSort({
                  field: field as GallerySort['field'],
                  direction: direction as GallerySort['direction'],
                })
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="timestamp-desc">Newest First</SelectItem>
                <SelectItem value="timestamp-asc">Oldest First</SelectItem>
                <SelectItem value="deviceModel-asc">Device A-Z</SelectItem>
                <SelectItem value="conservationPointId-asc">CP A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedItems.size > 0 && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-md">
              <span className="text-sm text-blue-700">
                {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''}{' '}
                selected
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedItems(new Set())}
              >
                Clear Selection
              </Button>
            </div>
          )}

          {/* Select All */}
          {items.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={selectedItems.size === items.length}
                onChange={handleSelectAll}
                className="h-4 w-4"
              />
              <span className="text-sm text-gray-600">
                Select all ({items.length} items)
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      {stats && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.totalItems}
                </p>
                <p className="text-sm text-gray-600">Total Items</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {stats.itemsByType.photos}
                </p>
                <p className="text-sm text-gray-600">Photos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.itemsByType.scans}
                </p>
                <p className="text-sm text-gray-600">Scans</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {formatFileSize(stats.totalSize)}
                </p>
                <p className="text-sm text-gray-600">Total Size</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gallery Content */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No photos found</p>
            <p className="text-sm text-gray-500 mt-2">
              {searchQuery
                ? 'Try adjusting your search criteria'
                : 'Start by capturing some photos'}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        renderGridView()
      ) : (
        renderListView()
      )}
    </div>
  )
}

export default PhotoGalleryView
