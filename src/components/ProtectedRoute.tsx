import React, { ReactNode, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, UserRole, UserPermissions } from '@/hooks/useAuth'
import { Loader2, AlertCircle, UserX } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: UserRole | UserRole[]
  requiredPermission?: keyof UserPermissions
  fallback?: ReactNode
  showLoadingSpinner?: boolean
}

const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
    <h2 className="text-lg font-semibold text-gray-900 mb-2">
      Controllo autorizzazioni...
    </h2>
    <p className="text-gray-600 text-center">
      Stiamo verificando i tuoi permessi di accesso.
    </p>
  </div>
)

const UnauthorizedFallback = ({
  userRole,
  requiredRole,
  requiredPermission,
  isGuest,
}: {
  userRole: UserRole
  requiredRole?: UserRole | UserRole[]
  requiredPermission?: keyof UserPermissions
  isGuest: boolean
}) => {
  const getRequiredRoleText = () => {
    if (requiredRole) {
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
      return roles
        .map(role => {
          switch (role) {
            case 'admin':
              return 'Amministratore'
            case 'responsabile':
              return 'Responsabile'
            case 'dipendente':
              return 'Dipendente'
            case 'collaboratore':
              return 'Collaboratore'
            default:
              return role
          }
        })
        .join(' o ')
    }
    return ''
  }

  const getPermissionText = () => {
    switch (requiredPermission) {
      case 'canManageStaff':
        return 'gestione del personale'
      case 'canManageDepartments':
        return 'gestione dei reparti'
      case 'canViewAllTasks':
        return 'visualizzazione di tutte le attività'
      case 'canManageConservation':
        return 'gestione della conservazione'
      case 'canExportData':
        return 'esportazione dati'
      case 'canManageSettings':
        return 'gestione delle impostazioni'
      default:
        return 'questa funzionalità'
    }
  }

  if (isGuest) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 bg-red-50 border border-red-200 rounded-lg mx-4">
        <UserX className="h-12 w-12 text-red-600 mb-4" />
        <h2 className="text-xl font-bold text-red-900 mb-3 text-center">
          Accesso Non Autorizzato
        </h2>
        <div className="text-red-800 text-center space-y-2 mb-6">
          <p className="font-medium">
            La tua email non è registrata nel sistema come membro dello staff.
          </p>
          <p className="text-sm">
            Per accedere all'applicazione, la tua email deve essere associata a
            un dipendente nell'anagrafica aziendale.
          </p>
        </div>

        <div className="bg-white border border-red-300 rounded-lg p-4 mb-6 w-full max-w-md">
          <h3 className="font-semibold text-red-900 mb-2 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            Cosa fare:
          </h3>
          <ul className="text-sm text-red-800 space-y-1">
            <li>1. Contatta il tuo amministratore</li>
            <li>2. Verifica che la tua email sia corretta</li>
            <li>3. Richiedi l'inserimento nell'anagrafica staff</li>
          </ul>
        </div>

        <div className="text-xs text-red-600 text-center">
          <p className="mt-1">
            Ruolo assegnato:{' '}
            <span className="font-medium">Guest (Accesso negato)</span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 bg-yellow-50 border border-yellow-200 rounded-lg mx-4">
      <UserX className="h-12 w-12 text-yellow-600 mb-4" />
      <h2 className="text-xl font-bold text-yellow-900 mb-3 text-center">
        Permessi Insufficienti
      </h2>

      <div className="text-yellow-800 text-center space-y-2 mb-6">
        <p>Non hai i permessi necessari per accedere a questa sezione.</p>
        {requiredRole && (
          <p className="text-sm">
            Ruolo richiesto:{' '}
            <span className="font-medium">{getRequiredRoleText()}</span>
          </p>
        )}
        {requiredPermission && (
          <p className="text-sm">
            Permesso richiesto:{' '}
            <span className="font-medium">{getPermissionText()}</span>
          </p>
        )}
      </div>

      <div className="bg-white border border-yellow-300 rounded-lg p-4 w-full max-w-md">
        <h3 className="font-semibold text-yellow-900 mb-2">
          Le tue informazioni:
        </h3>
        <div className="text-sm text-yellow-800 space-y-1">
          <p>
            Ruolo attuale:{' '}
            <span className="font-medium capitalize">{userRole}</span>
          </p>
          <p className="text-xs text-yellow-600 mt-2">
            Se pensi che ci sia un errore, contatta il tuo amministratore per
            verificare i tuoi permessi.
          </p>
        </div>
      </div>
    </div>
  )
}

export const ProtectedRoute = ({
  children,
  requiredRole,
  requiredPermission,
  fallback,
  showLoadingSpinner = true,
}: ProtectedRouteProps) => {
  const navigate = useNavigate()
  const {
    isLoading,
    isAuthenticated,
    isAuthorized,
    userRole,
    hasRole,
    hasPermission,
    authError,
  } = useAuth()

  // ✅ Redirect a login se non autenticato
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('🚫 Utente non autenticato - redirect a login')
      navigate('/sign-in', { replace: true })
    }
  }, [isLoading, isAuthenticated, navigate])

  // ✅ Redirect a login se non autorizzato (guest senza company)
  useEffect(() => {
    if (!isLoading && isAuthenticated && !isAuthorized) {
      console.log('🚫 Utente non autorizzato (no company) - redirect a login')
      setTimeout(() => {
        navigate('/sign-in', { replace: true })
      }, 2000) // Mostra messaggio per 2 secondi prima del redirect
    }
  }, [isLoading, isAuthenticated, isAuthorized, navigate])

  if (isLoading && showLoadingSpinner) {
    return fallback || <LoadingFallback />
  }

  if (authError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 bg-red-50 border border-red-200 rounded-lg mx-4">
        <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
        <h2 className="text-xl font-bold text-red-900 mb-3">
          Errore di Autenticazione
        </h2>
        <p className="text-red-800 text-center mb-4">{authError}</p>
        <button
          onClick={() => navigate('/sign-in')}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Torna al Login
        </button>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <UnauthorizedFallback
        userRole={userRole}
        requiredRole={requiredRole}
        requiredPermission={requiredPermission}
        isGuest={true}
      />
    )
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <UnauthorizedFallback
        userRole={userRole}
        requiredRole={requiredRole}
        requiredPermission={requiredPermission}
        isGuest={false}
      />
    )
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <UnauthorizedFallback
        userRole={userRole}
        requiredRole={requiredRole}
        requiredPermission={requiredPermission}
        isGuest={false}
      />
    )
  }

  return <>{children}</>
}

export const withRoleProtection = (
  Component: React.ComponentType<any>,
  requiredRole: UserRole | UserRole[]
) => {
  return (props: any) => (
    <ProtectedRoute requiredRole={requiredRole}>
      <Component {...props} />
    </ProtectedRoute>
  )
}

export const withPermissionProtection = (
  Component: React.ComponentType<any>,
  requiredPermission: keyof UserPermissions
) => {
  return (props: any) => (
    <ProtectedRoute requiredPermission={requiredPermission}>
      <Component {...props} />
    </ProtectedRoute>
  )
}

export default ProtectedRoute
