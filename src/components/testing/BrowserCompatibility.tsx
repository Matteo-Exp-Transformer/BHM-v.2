import React, { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface BrowserFeature {
  name: string
  test: () => boolean
  required: boolean
  description: string
}

interface BrowserInfo {
  name: string
  version: string
  features: Record<string, boolean>
}

export const BrowserCompatibility: React.FC = () => {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null)
  const [features, setFeatures] = useState<Record<string, boolean>>({})

  const browserFeatures: BrowserFeature[] = [
    {
      name: 'ES2020 Support',
      test: () => typeof Symbol?.asyncIterator !== 'undefined',
      required: true,
      description: 'Modern JavaScript features',
    },
    {
      name: 'CSS Grid',
      test: () => CSS.supports('display', 'grid'),
      required: true,
      description: 'CSS Grid layout support',
    },
    {
      name: 'CSS Flexbox',
      test: () => CSS.supports('display', 'flex'),
      required: true,
      description: 'CSS Flexbox layout support',
    },
    {
      name: 'CSS Custom Properties',
      test: () => CSS.supports('color', 'var(--test)'),
      required: true,
      description: 'CSS Variables support',
    },
    {
      name: 'Fetch API',
      test: () => typeof fetch !== 'undefined',
      required: true,
      description: 'Modern HTTP client',
    },
    {
      name: 'Promise Support',
      test: () => typeof Promise !== 'undefined',
      required: true,
      description: 'Promise-based async operations',
    },
    {
      name: 'Web Workers',
      test: () => typeof Worker !== 'undefined',
      required: false,
      description: 'Background processing',
    },
    {
      name: 'Service Workers',
      test: () => 'serviceWorker' in navigator,
      required: false,
      description: 'PWA offline functionality',
    },
    {
      name: 'IndexedDB',
      test: () => 'indexedDB' in window,
      required: false,
      description: 'Client-side database',
    },
    {
      name: 'Local Storage',
      test: () => {
        try {
          localStorage.setItem('test', 'test')
          localStorage.removeItem('test')
          return true
        } catch {
          return false
        }
      },
      required: true,
      description: 'Persistent local storage',
    },
    {
      name: 'Touch Events',
      test: () => 'ontouchstart' in window,
      required: false,
      description: 'Mobile touch support',
    },
    {
      name: 'Geolocation',
      test: () => 'geolocation' in navigator,
      required: false,
      description: 'Location services',
    },
    {
      name: 'Camera API',
      test: () =>
        'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      required: false,
      description: 'Camera access for mobile features',
    },
    {
      name: 'WebRTC',
      test: () => 'RTCPeerConnection' in window,
      required: false,
      description: 'Real-time communication',
    },
    {
      name: 'WebGL',
      test: () => {
        try {
          const canvas = document.createElement('canvas')
          return !!(
            canvas.getContext('webgl') ||
            canvas.getContext('experimental-webgl')
          )
        } catch {
          return false
        }
      },
      required: false,
      description: '3D graphics rendering',
    },
  ]

  useEffect(() => {
    const detectBrowser = () => {
      const userAgent = navigator.userAgent
      let browserName = 'Unknown'
      let browserVersion = 'Unknown'

      if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
        browserName = 'Chrome'
        const match = userAgent.match(/Chrome\/(\d+)/)
        browserVersion = match ? match[1] : 'Unknown'
      } else if (userAgent.includes('Firefox')) {
        browserName = 'Firefox'
        const match = userAgent.match(/Firefox\/(\d+)/)
        browserVersion = match ? match[1] : 'Unknown'
      } else if (
        userAgent.includes('Safari') &&
        !userAgent.includes('Chrome')
      ) {
        browserName = 'Safari'
        const match = userAgent.match(/Version\/(\d+)/)
        browserVersion = match ? match[1] : 'Unknown'
      } else if (userAgent.includes('Edg')) {
        browserName = 'Edge'
        const match = userAgent.match(/Edg\/(\d+)/)
        browserVersion = match ? match[1] : 'Unknown'
      }

      return { browserName, browserVersion }
    }

    const testFeatures = () => {
      const featureResults: Record<string, boolean> = {}

      browserFeatures.forEach(feature => {
        try {
          featureResults[feature.name] = feature.test()
        } catch {
          featureResults[feature.name] = false
        }
      })

      return featureResults
    }

    const { browserName, browserVersion } = detectBrowser()
    const featureResults = testFeatures()

    setBrowserInfo({
      name: browserName,
      version: browserVersion,
      features: featureResults,
    })
    setFeatures(featureResults)
  }, [browserFeatures])

  const getFeatureIcon = (featureName: string, required: boolean) => {
    const isSupported = features[featureName]

    if (isSupported) {
      return <CheckCircle className="w-5 h-5 text-green-600" />
    } else if (required) {
      return <XCircle className="w-5 h-5 text-red-600" />
    } else {
      return <AlertTriangle className="w-5 h-5 text-yellow-600" />
    }
  }

  const getFeatureStatus = (featureName: string, required: boolean) => {
    const isSupported = features[featureName]

    if (isSupported) {
      return 'text-green-600'
    } else if (required) {
      return 'text-red-600'
    } else {
      return 'text-yellow-600'
    }
  }

  const requiredFeatures = browserFeatures.filter(f => f.required)
  const optionalFeatures = browserFeatures.filter(f => !f.required)

  const requiredSupported = requiredFeatures.filter(
    f => features[f.name]
  ).length
  const optionalSupported = optionalFeatures.filter(
    f => features[f.name]
  ).length

  if (!browserInfo) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Browser Compatibility Test
        </h2>
        <p className="text-gray-600">
          Testing browser features and compatibility
        </p>
      </div>

      {/* Browser Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Browser Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-600">Browser:</span>
            <span className="ml-2 font-medium">{browserInfo.name}</span>
          </div>
          <div>
            <span className="text-sm text-gray-600">Version:</span>
            <span className="ml-2 font-medium">{browserInfo.version}</span>
          </div>
          <div>
            <span className="text-sm text-gray-600">User Agent:</span>
            <span className="ml-2 font-mono text-xs break-all">
              {navigator.userAgent}
            </span>
          </div>
          <div>
            <span className="text-sm text-gray-600">Platform:</span>
            <span className="ml-2 font-medium">{navigator.platform}</span>
          </div>
        </div>
      </div>

      {/* Feature Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Required Features</p>
              <p className="text-2xl font-bold text-green-900">
                {requiredSupported}/{requiredFeatures.length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700">Optional Features</p>
              <p className="text-2xl font-bold text-blue-900">
                {optionalSupported}/{optionalFeatures.length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700">Overall Score</p>
              <p className="text-2xl font-bold text-purple-900">
                {Math.round(
                  ((requiredSupported + optionalSupported) /
                    browserFeatures.length) *
                    100
                )}
                %
              </p>
            </div>
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">✓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Required Features */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Required Features ({requiredSupported}/{requiredFeatures.length})
        </h3>
        <div className="space-y-3">
          {requiredFeatures.map(feature => (
            <div
              key={feature.name}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getFeatureIcon(feature.name, feature.required)}
                <div>
                  <p
                    className={`font-medium ${getFeatureStatus(feature.name, feature.required)}`}
                  >
                    {feature.name}
                  </p>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
              <span
                className={`text-sm font-medium ${getFeatureStatus(feature.name, feature.required)}`}
              >
                {features[feature.name] ? 'Supported' : 'Not Supported'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Optional Features */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Optional Features ({optionalSupported}/{optionalFeatures.length})
        </h3>
        <div className="space-y-3">
          {optionalFeatures.map(feature => (
            <div
              key={feature.name}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getFeatureIcon(feature.name, feature.required)}
                <div>
                  <p
                    className={`font-medium ${getFeatureStatus(feature.name, feature.required)}`}
                  >
                    {feature.name}
                  </p>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
              <span
                className={`text-sm font-medium ${getFeatureStatus(feature.name, feature.required)}`}
              >
                {features[feature.name] ? 'Supported' : 'Not Supported'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          Recommendations
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          {requiredSupported === requiredFeatures.length ? (
            <p>
              ✅ Your browser fully supports all required features for this
              application.
            </p>
          ) : (
            <p>
              ⚠️ Some required features are not supported. Consider updating
              your browser.
            </p>
          )}

          {optionalSupported > 0 && (
            <p>
              🚀 Your browser supports {optionalSupported} optional features for
              enhanced functionality.
            </p>
          )}

          <p>
            💡 For the best experience, we recommend using the latest version of
            Chrome, Firefox, Safari, or Edge.
          </p>
        </div>
      </div>
    </div>
  )
}

export default BrowserCompatibility
