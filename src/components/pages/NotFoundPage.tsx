import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Home, ArrowLeft, Search, AlertCircle } from 'lucide-react'

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate()

  const handleGoBack = () => {
    navigate(-1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        {/* Error Code */}
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>

        {/* Error Message */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Pagina non trovata
        </h2>

        <p className="text-gray-600 mb-8 leading-relaxed">
          La pagina che stai cercando non esiste o è stata spostata.
          Verifica l'URL o torna alla homepage per continuare.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            to="/"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Home className="w-5 h-5" />
            <span>Torna alla Homepage</span>
          </Link>

          <button
            onClick={handleGoBack}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Torna Indietro</span>
          </button>
        </div>

        {/* Search Suggestion */}
        <div className="mt-8 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2 text-gray-600 mb-2">
            <Search className="w-4 h-4" />
            <span className="text-sm font-medium">Pagine disponibili:</span>
          </div>
          <div className="space-y-2 text-sm">
            <Link
              to="/conservazione"
              className="block text-blue-600 hover:text-blue-800 hover:underline"
            >
              • Conservazione e Temperature
            </Link>
            <Link
              to="/attivita"
              className="block text-blue-600 hover:text-blue-800 hover:underline"
            >
              • Calendario Attività
            </Link>
            <Link
              to="/inventario"
              className="block text-blue-600 hover:text-blue-800 hover:underline"
            >
              • Gestione Inventario
            </Link>
            <Link
              to="/gestione"
              className="block text-blue-600 hover:text-blue-800 hover:underline"
            >
              • Gestione Staff
            </Link>
            <Link
              to="/impostazioni"
              className="block text-blue-600 hover:text-blue-800 hover:underline"
            >
              • Impostazioni
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-xs text-gray-500">
          <p>HACCP Business Manager</p>
          <p>Sistema di gestione sicurezza alimentare</p>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage