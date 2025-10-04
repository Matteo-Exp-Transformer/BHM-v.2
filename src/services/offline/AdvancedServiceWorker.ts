/**
 * Advanced Service Worker for HACCP Business Manager PWA
 * Handles offline caching, background sync, and push notifications
 */

declare const self: ServiceWorkerGlobalScope & {
  skipWaiting(): void;
  clients: {
    claim(): Promise<void>;
    openWindow(url: string): Promise<WindowClient>;
  };
  registration: ServiceWorkerRegistration & {
    sync: {
      register(tag: string): Promise<void>;
    };
    showNotification(title: string, options?: NotificationOptions): Promise<void>;
  };
}

const CACHE_VERSION = 'v1.2.0'
const STATIC_CACHE_NAME = `haccp-static-${CACHE_VERSION}`
const DYNAMIC_CACHE_NAME = `haccp-dynamic-${CACHE_VERSION}`
const API_CACHE_NAME = `haccp-api-${CACHE_VERSION}`

// Critical files to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html', // Fallback page
]

// API endpoints to cache for offline access
const CACHEABLE_APIS = [
  '/api/conservation-points',
  '/api/temperature-readings',
  '/api/tasks',
  '/api/products',
  '/api/staff',
  '/api/departments',
]

// Background sync events
const BACKGROUND_SYNC_TAG = 'haccp-background-sync'

interface SyncData {
  type: 'temperature' | 'task' | 'product' | 'general'
  data: any
  timestamp: number
  endpoint: string
  method: string
}

// Install event - cache static assets
self.addEventListener('install', (event: any) => {
  console.log('[SW] Installing service worker version:', CACHE_VERSION)

  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event: any) => {
  console.log('[SW] Activating service worker')

  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName !== API_CACHE_NAME
            ) {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => self.clients.claim())
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event: any) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) return

  // API requests - Network first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request))
    return
  }

  // Static assets - Cache first with network fallback
  if (STATIC_ASSETS.some(asset => url.pathname.endsWith(asset))) {
    event.respondWith(handleStaticRequest(request))
    return
  }

  // Other requests - Network first with cache fallback
  event.respondWith(handleDynamicRequest(request))
})

// Handle API requests with network-first strategy
async function handleAPIRequest(request: Request): Promise<Response> {
  const url = new URL(request.url)

  try {
    // Try network first
    const networkResponse = await fetch(request.clone())

    // Cache successful GET requests
    if (request.method === 'GET' && networkResponse.ok) {
      const cache = await caches.open(API_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.log('[SW] Network failed for API request:', url.pathname)

    // Fall back to cache for GET requests
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request)
      if (cachedResponse) {
        console.log('[SW] Serving from cache:', url.pathname)
        return cachedResponse
      }
    }

    // For POST/PUT/DELETE, register for background sync
    if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
      await registerBackgroundSync(request)
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Request queued for sync when online',
          offline: true,
        }),
        {
          status: 202,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Return offline fallback
    return createOfflineResponse()
  }
}

// Handle static requests with cache-first strategy
async function handleStaticRequest(request: Request): Promise<Response> {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    const networkResponse = await fetch(request)
    const cache = await caches.open(STATIC_CACHE_NAME)
    cache.put(request, networkResponse.clone())

    return networkResponse
  } catch (error) {
    console.log('[SW] Failed to load static asset:', request.url)
    return createOfflineResponse()
  }
}

// Handle dynamic requests with network-first strategy
async function handleDynamicRequest(request: Request): Promise<Response> {
  try {
    const networkResponse = await fetch(request)

    // Cache successful GET requests
    if (request.method === 'GET' && networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.log('[SW] Network failed for dynamic request:', request.url)

    // Try cache fallback
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/offline.html')
      return offlinePage || createOfflineResponse()
    }

    return createOfflineResponse()
  }
}

// Register background sync for offline operations
async function registerBackgroundSync(request: Request): Promise<void> {
  try {
    const body = await request.text()
    const syncData: SyncData = {
      type: determineSyncType(request.url),
      data: body ? JSON.parse(body) : null,
      timestamp: Date.now(),
      endpoint: request.url,
      method: request.method,
    }

    // Store in IndexedDB for background sync
    const db = await openIndexedDB()
    const transaction = db.transaction(['syncQueue'], 'readwrite')
    const store = transaction.objectStore('syncQueue')

    await store.add({
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...syncData,
      retryCount: 0,
    })

    // Register for background sync
    await self.registration.sync.register(BACKGROUND_SYNC_TAG)

    console.log('[SW] Registered background sync for:', request.url)
  } catch (error) {
    console.error('[SW] Failed to register background sync:', error)
  }
}

// Determine sync type based on URL
function determineSyncType(url: string): SyncData['type'] {
  if (url.includes('temperature')) return 'temperature'
  if (url.includes('task')) return 'task'
  if (url.includes('product')) return 'product'
  return 'general'
}

// Background sync event handler
self.addEventListener('sync', (event: any) => {
  if (event.tag === BACKGROUND_SYNC_TAG) {
    console.log('[SW] Processing background sync')
    event.waitUntil(processBackgroundSync())
  }
})

// Process background sync queue
async function processBackgroundSync(): Promise<void> {
  try {
    const db = await openIndexedDB()
    const transaction = db.transaction(['syncQueue'], 'readonly')
    const store = transaction.objectStore('syncQueue')
    const syncItems = await new Promise<any[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    console.log(`[SW] Processing ${syncItems.length} sync items`)

    for (const item of syncItems) {
      try {
        await processSyncItem(item)
        await removeSyncItem(item.id)
        console.log('[SW] Successfully synced:', item.endpoint)
      } catch (error) {
        console.error('[SW] Failed to sync item:', error)
        await incrementRetryCount(item.id)
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error)
  }
}

// Process individual sync item
async function processSyncItem(item: any): Promise<void> {
  const response = await fetch(item.endpoint, {
    method: item.method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: item.data ? JSON.stringify(item.data) : undefined,
  })

  if (!response.ok) {
    throw new Error(`Sync failed with status: ${response.status}`)
  }
}

// Helper functions for IndexedDB operations
async function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('HACCPBusinessManager', 1)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function removeSyncItem(id: string): Promise<void> {
  const db = await openIndexedDB()
  const transaction = db.transaction(['syncQueue'], 'readwrite')
  const store = transaction.objectStore('syncQueue')
  await store.delete(id)
}

async function incrementRetryCount(id: string): Promise<void> {
  const db = await openIndexedDB()
  const transaction = db.transaction(['syncQueue'], 'readwrite')
  const store = transaction.objectStore('syncQueue')
  const item = await new Promise<any>((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  if (item) {
    item.retryCount = (item.retryCount || 0) + 1

    // Remove after 3 failed attempts
    if (item.retryCount >= 3) {
      await store.delete(id)
    } else {
      await store.put(item)
    }
  }
}

// Create offline response
function createOfflineResponse(): Response {
  return new Response(
    JSON.stringify({
      error: true,
      message: 'You are currently offline. Please check your connection.',
      offline: true,
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' },
    }
  )
}

// Push notification handler
self.addEventListener('push', (event: any) => {
  console.log('[SW] Push notification received')

  const options = {
    body: event.data?.text() || 'New HACCP notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      timestamp: Date.now(),
      url: '/',
    },
    actions: [
      {
        action: 'view',
        title: 'View Details',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
  }

  event.waitUntil(
    self.registration.showNotification('HACCP Business Manager', options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event: any) => {
  console.log('[SW] Notification clicked')

  event.notification.close()

  if (event.action === 'view') {
    event.waitUntil(
      self.clients.openWindow(event.notification.data?.url || '/')
    )
  }
})

console.log('[SW] Service Worker loaded successfully')
