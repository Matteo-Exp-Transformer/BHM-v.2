import React, { useEffect, useState } from 'react'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Wifi,
  WifiOff,
} from 'lucide-react'

interface PWAFeatures {
  serviceWorker: boolean
  manifest: boolean
  installable: boolean
  offline: boolean
  pushNotifications: boolean
  backgroundSync: boolean
  cacheStorage: boolean
  indexedDB: boolean
}

interface PWAInfo {
  isInstalled: boolean
  canInstall: boolean
  installPrompt: Event | null
  features: PWAFeatures
  manifest: Record<string, unknown> | null
}

export const PWAValidator: React.FC = () => {
  const [pwaInfo, setPwaInfo] = useState<PWAInfo | null>(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null)

  useEffect(() => {
    const checkPWAFeatures = async () => {
      const features: PWAFeatures = {
        serviceWorker: 'serviceWorker' in navigator,
        manifest: false,
        installable: false,
        offline: false,
        pushNotifications: 'PushManager' in window,
        backgroundSync:
          'serviceWorker' in navigator &&
          'sync' in window.ServiceWorkerRegistration.prototype,
        cacheStorage: 'caches' in window,
        indexedDB: 'indexedDB' in window,
      }

      // Check manifest
      try {
        const manifestResponse = await fetch('/manifest.webmanifest')
        if (manifestResponse.ok) {
          const manifest = await manifestResponse.json()
          features.manifest = true
          features.installable =
            manifest.name && manifest.short_name && manifest.icons?.length > 0
        }
      } catch (error) {
        console.error('Manifest check failed:', error)
      }

      // Check service worker
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration()
          features.offline = !!registration
        } catch (error) {
          console.error('Service worker check failed:', error)
        }
      }

      // Check if app is installed
      const isInstalled =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as Navigator & { standalone?: boolean })
          .standalone === true

      setPwaInfo({
        isInstalled,
        canInstall: features.installable && !isInstalled,
        installPrompt: null,
        features,
        manifest: null,
      })
    }

    checkPWAFeatures()

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e)
      setPwaInfo(prev =>
        prev ? { ...prev, installPrompt: e, canInstall: true } : null
      )
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      )
    }
  }, [])

  const handleInstall = async () => {
    if (installPrompt) {
      const result = await installPrompt.prompt()
      console.log('Install prompt result:', result)
      setInstallPrompt(null)
      setPwaInfo(prev =>
        prev ? { ...prev, canInstall: false, isInstalled: true } : null
      )
    }
  }

  const getFeatureIcon = (supported: boolean, critical: boolean = false) => {
    if (supported) {
      return <CheckCircle className="w-5 h-5 text-green-600" />
    } else if (critical) {
      return <XCircle className="w-5 h-5 text-red-600" />
    } else {
      return <AlertTriangle className="w-5 h-5 text-yellow-600" />
    }
  }

  const getFeatureStatus = (supported: boolean, critical: boolean = false) => {
    if (supported) {
      return 'text-green-600'
    } else if (critical) {
      return 'text-red-600'
    } else {
      return 'text-yellow-600'
    }
  }

  if (!pwaInfo) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const criticalFeatures = [
    {
      name: 'Service Worker',
      supported: pwaInfo.features.serviceWorker,
      critical: true,
    },
    {
      name: 'Web App Manifest',
      supported: pwaInfo.features.manifest,
      critical: true,
    },
    {
      name: 'Cache Storage',
      supported: pwaInfo.features.cacheStorage,
      critical: true,
    },
  ]

  const enhancedFeatures = [
    {
      name: 'Installable',
      supported: pwaInfo.features.installable,
      critical: false,
    },
    {
      name: 'Offline Support',
      supported: pwaInfo.features.offline,
      critical: false,
    },
    {
      name: 'Push Notifications',
      supported: pwaInfo.features.pushNotifications,
      critical: false,
    },
    {
      name: 'Background Sync',
      supported: pwaInfo.features.backgroundSync,
      critical: false,
    },
    {
      name: 'IndexedDB',
      supported: pwaInfo.features.indexedDB,
      critical: false,
    },
  ]

  const criticalSupported = criticalFeatures.filter(f => f.supported).length
  const enhancedSupported = enhancedFeatures.filter(f => f.supported).length

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          PWA Functionality Test
        </h2>
        <p className="text-gray-600">
          Testing Progressive Web App features and capabilities
        </p>
      </div>

      {/* PWA Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">PWA Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className={`rounded-lg border p-4 ${pwaInfo.isInstalled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm ${pwaInfo.isInstalled ? 'text-green-700' : 'text-gray-700'}`}
                >
                  Installation Status
                </p>
                <p
                  className={`text-lg font-bold ${pwaInfo.isInstalled ? 'text-green-900' : 'text-gray-900'}`}
                >
                  {pwaInfo.isInstalled ? 'Installed' : 'Not Installed'}
                </p>
              </div>
              {pwaInfo.isInstalled ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-gray-600" />
              )}
            </div>
          </div>

          <div
            className={`rounded-lg border p-4 ${isOnline ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm ${isOnline ? 'text-green-700' : 'text-red-700'}`}
                >
                  Connection Status
                </p>
                <p
                  className={`text-lg font-bold ${isOnline ? 'text-green-900' : 'text-red-900'}`}
                >
                  {isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
              {isOnline ? (
                <Wifi className="w-8 h-8 text-green-600" />
              ) : (
                <WifiOff className="w-8 h-8 text-red-600" />
              )}
            </div>
          </div>

          <div
            className={`rounded-lg border p-4 ${pwaInfo.canInstall ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm ${pwaInfo.canInstall ? 'text-blue-700' : 'text-gray-700'}`}
                >
                  Installable
                </p>
                <p
                  className={`text-lg font-bold ${pwaInfo.canInstall ? 'text-blue-900' : 'text-gray-900'}`}
                >
                  {pwaInfo.canInstall ? 'Yes' : 'No'}
                </p>
              </div>
              {pwaInfo.canInstall ? (
                <Download className="w-8 h-8 text-blue-600" />
              ) : (
                <XCircle className="w-8 h-8 text-gray-600" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Install Button */}
      {pwaInfo.canInstall && (
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Install App
              </h3>
              <p className="text-blue-700">
                This app can be installed on your device for a native-like
                experience.
              </p>
            </div>
            <button
              onClick={handleInstall}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Install App
            </button>
          </div>
        </div>
      )}

      {/* Feature Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-red-50 rounded-lg border border-red-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700">Critical Features</p>
              <p className="text-2xl font-bold text-red-900">
                {criticalSupported}/{criticalFeatures.length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700">Enhanced Features</p>
              <p className="text-2xl font-bold text-blue-900">
                {enhancedSupported}/{enhancedFeatures.length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Critical Features */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Critical PWA Features ({criticalSupported}/{criticalFeatures.length})
        </h3>
        <div className="space-y-3">
          {criticalFeatures.map(feature => (
            <div
              key={feature.name}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getFeatureIcon(feature.supported, feature.critical)}
                <div>
                  <p
                    className={`font-medium ${getFeatureStatus(feature.supported, feature.critical)}`}
                  >
                    {feature.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {feature.name === 'Service Worker' &&
                      'Enables offline functionality and background processing'}
                    {feature.name === 'Web App Manifest' &&
                      'Defines app metadata and installation behavior'}
                    {feature.name === 'Cache Storage' &&
                      'Provides client-side storage for offline content'}
                  </p>
                </div>
              </div>
              <span
                className={`text-sm font-medium ${getFeatureStatus(feature.supported, feature.critical)}`}
              >
                {feature.supported ? 'Supported' : 'Not Supported'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Features */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Enhanced PWA Features ({enhancedSupported}/{enhancedFeatures.length})
        </h3>
        <div className="space-y-3">
          {enhancedFeatures.map(feature => (
            <div
              key={feature.name}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getFeatureIcon(feature.supported, feature.critical)}
                <div>
                  <p
                    className={`font-medium ${getFeatureStatus(feature.supported, feature.critical)}`}
                  >
                    {feature.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {feature.name === 'Installable' &&
                      'App can be installed on device home screen'}
                    {feature.name === 'Offline Support' &&
                      'App works without internet connection'}
                    {feature.name === 'Push Notifications' &&
                      'Send notifications even when app is closed'}
                    {feature.name === 'Background Sync' &&
                      'Sync data when connection is restored'}
                    {feature.name === 'IndexedDB' &&
                      'Client-side database for complex data storage'}
                  </p>
                </div>
              </div>
              <span
                className={`text-sm font-medium ${getFeatureStatus(feature.supported, feature.critical)}`}
              >
                {feature.supported ? 'Supported' : 'Not Supported'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* PWA Score */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">PWA Score</h3>
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-900 mb-2">
            {Math.round(
              ((criticalSupported * 2 + enhancedSupported) /
                (criticalFeatures.length * 2 + enhancedFeatures.length)) *
                100
            )}
            %
          </div>
          <p className="text-gray-600 mb-4">Overall PWA functionality score</p>
          <div className="space-y-2 text-sm text-gray-700">
            {criticalSupported === criticalFeatures.length ? (
              <p className="text-green-600">
                ✅ All critical PWA features are supported
              </p>
            ) : (
              <p className="text-red-600">
                ⚠️ Some critical PWA features are missing
              </p>
            )}
            {enhancedSupported > 0 && (
              <p className="text-blue-600">
                🚀 {enhancedSupported} enhanced features are available
              </p>
            )}
            <p className="text-gray-600">
              💡 This app meets PWA standards for modern web browsers
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PWAValidator
