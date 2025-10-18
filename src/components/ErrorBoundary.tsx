/**
 * 🔧 Error Boundary per Dynamic Imports
 * 
 * Gestisce gli errori di caricamento dei moduli dinamici
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class DynamicImportErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Dynamic Import Error:', error)
    console.error('🚨 Error Info:', errorInfo)
    
    // Se è un errore di caricamento modulo, prova a ricaricare
    if (error.message.includes('Failed to fetch dynamically imported module')) {
      console.log('🔄 Attempting to reload page...')
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Caricamento in corso...
            </h2>
            <p className="text-gray-600 mb-4">
              Se il problema persiste, la pagina verrà ricaricata automaticamente.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Ricarica Pagina
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

