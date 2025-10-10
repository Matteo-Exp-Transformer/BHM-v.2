/**
 * 🏠 HomeRedirect - Smart redirect per homepage
 * 
 * Se utente loggato → /dashboard
 * Se NON loggato → /sign-in
 */

import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'

const HomeRedirect = () => {
  const { isSignedIn, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // Se loggato → dashboard, altrimenti → login
  return <Navigate to={isSignedIn ? '/dashboard' : '/sign-in'} replace />
}

export default HomeRedirect

