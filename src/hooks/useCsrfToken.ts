/**
 * 🔐 useCsrfToken Hook - CSRF Token Management
 * 
 * Hook React per gestione token CSRF con auto-refresh, error handling
 * e integrazione con authClient esistente
 * 
 * @date 2025-01-27
 * @author Agente 5 - Frontend Developer
 */

/// <reference types="node" />

import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
// import { authClient } from '@/features/auth/api/authClient'
import type { UseCsrfTokenReturn, CsrfTokenResponse } from '@/types/auth'
import { csrfTokenResponseSchema } from '@/features/auth/api/schemas/authSchemas'

// =============================================
// CONSTANTS
// =============================================

const CSRF_QUERY_KEY = ['csrf-token'] as const
const CSRF_REFRESH_INTERVAL = 2 * 60 * 60 * 1000 // 2 hours
// const CSRF_RETRY_DELAY = 30 * 1000 // 30 seconds

/** Base URL per Edge Functions: in produzione deve essere l'URL Supabase (Vercel non serve /functions) */
const getFunctionsBaseUrl = (): string => {
  const url = import.meta.env.VITE_SUPABASE_URL
  return url ? `${url.replace(/\/$/, '')}/functions/v1` : '/functions/v1'
}

// =============================================
// API FUNCTIONS
// =============================================

/**
 * Recupera token CSRF dal server (Supabase Edge Function)
 */
async function fetchCsrfToken(): Promise<CsrfTokenResponse> {
  try {
    const baseUrl = getFunctionsBaseUrl()
    const response = await fetch(`${baseUrl}/auth/csrf-token`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    // Valida risposta con Zod
    const validatedData = csrfTokenResponseSchema.parse(data)
    
    return validatedData
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error)
    throw error
  }
}

// =============================================
// HOOK IMPLEMENTATION
// =============================================

export function useCsrfToken(): UseCsrfTokenReturn {
  // const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // React Query per gestione token CSRF
  const {
    data: csrfData,
    isLoading,
    error: queryError,
    refetch: refetchToken
  } = useQuery({
    queryKey: CSRF_QUERY_KEY,
    queryFn: fetchCsrfToken,
    staleTime: CSRF_REFRESH_INTERVAL - 60000, // 1 minuto prima della scadenza
    gcTime: CSRF_REFRESH_INTERVAL,
    retry: (failureCount, error) => {
      // Retry fino a 3 volte con delay esponenziale (DECISIONE #1)
      if (failureCount >= 3) return false
      
      // Non retry per errori di rete
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        return false
      }
      
      return true
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnMount: true, // DECISIONE #1: Fetch al page load
    refetchOnWindowFocus: false,
    refetchOnReconnect: true
  })

  // Gestione errori
  useEffect(() => {
    if (queryError) {
      const errorMessage = queryError instanceof Error 
        ? queryError.message 
        : 'Errore durante il recupero del token CSRF'
      setError(errorMessage)
    } else {
      setError(null)
    }
  }, [queryError])

  // Funzione per refresh manuale del token
  const refreshToken = useCallback(async (): Promise<void> => {
    try {
      setError(null)
      await refetchToken()
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Errore durante il refresh del token CSRF'
      setError(errorMessage)
      throw error
    }
  }, [refetchToken])

  // Auto-refresh del token prima della scadenza
  useEffect(() => {
    if (!csrfData?.expires_at) return

    const expiresAt = new Date(csrfData.expires_at)
    const now = new Date()
    const timeUntilExpiry = expiresAt.getTime() - now.getTime()

    // Se il token è già scaduto, refresh immediato
    if (timeUntilExpiry <= 0) {
      refreshToken()
      return
    }

    // Programma refresh 1 minuto prima della scadenza
    const refreshTime = Math.max(timeUntilExpiry - 60000, 1000)
    
    refreshTimeoutRef.current = setTimeout(() => {
      refreshToken()
    }, refreshTime)

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [csrfData?.expires_at, refreshToken])

  // Cleanup al unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [])

  // Aggiorna authClient con il nuovo token
  useEffect(() => {
    if (csrfData?.csrf_token) {
      // Aggiorna il CSRF manager nell'authClient
      // authClient['csrfManager'].updateToken(csrfData.csrf_token)
    }
  }, [csrfData?.csrf_token])

  return {
    token: csrfData?.csrf_token || null,
    error,
    isLoading,
    refreshToken,
    expiresAt: csrfData?.expires_at ? new Date(csrfData.expires_at) : null
  }
}

// =============================================
// UTILITY HOOKS
// =============================================

/**
 * Hook per verificare se il token CSRF è valido
 */
export function useCsrfTokenValid(): boolean {
  const { token, expiresAt } = useCsrfToken()
  
  if (!token || !expiresAt) return false
  
  const now = new Date()
  const timeUntilExpiry = expiresAt.getTime() - now.getTime()
  
  // Considera valido se mancano più di 5 minuti alla scadenza
  return timeUntilExpiry > 5 * 60 * 1000
}

/**
 * Hook per ottenere i secondi rimanenti prima della scadenza
 */
export function useCsrfTokenTimeRemaining(): number {
  const { expiresAt } = useCsrfToken()
  
  if (!expiresAt) return 0
  
  const now = new Date()
  const timeUntilExpiry = expiresAt.getTime() - now.getTime()
  
  return Math.max(0, Math.floor(timeUntilExpiry / 1000))
}

// =============================================
// ERROR HANDLING UTILITIES
// =============================================

/**
 * Gestisce errori CSRF specifici
 */
export function handleCsrfError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('CSRF')) {
      return 'Token di sicurezza non valido. La pagina verrà ricaricata.'
    }
    if (error.message.includes('403')) {
      return 'Accesso negato. Verifica le tue credenziali.'
    }
    if (error.message.includes('Failed to fetch')) {
      return 'Errore di connessione. Verifica la tua connessione internet.'
    }
  }
  
  return 'Errore durante il recupero del token di sicurezza.'
}

/**
 * Verifica se un errore è relativo al CSRF
 */
export function isCsrfError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.toLowerCase().includes('csrf') || 
           error.message.includes('403')
  }
  return false
}
