/**
 * 🔐 useRateLimit Hook - Rate Limiting Management
 * 
 * Hook React per gestione rate limiting con persistenza stato,
 * window temporale e integrazione con authClient esistente
 * 
 * @date 2025-01-27
 * @author Agente 5 - Frontend Developer
 */

/// <reference types="node" />

import { useState, useEffect, useCallback, useRef } from 'react'
// import { authClient } from '@/features/auth/api/authClient'
import type { UseRateLimitReturn, UseRateLimitOptions, RateLimitInfo } from '@/types/auth'
import { RATE_LIMIT_CONFIG } from '@/types/auth'

// =============================================
// CONSTANTS
// =============================================

const RATE_LIMIT_STORAGE_KEY = 'bhm_rate_limit'
// const DEFAULT_WINDOW_MS = 5 * 60 * 1000 // 5 minutes
// const DEFAULT_MAX_REQUESTS = 5
const CHECK_INTERVAL = 1000 // 1 second

// =============================================
// STORAGE UTILITIES
// =============================================

interface StoredRateLimit {
  endpoint: string
  requests: number[]
  maxRequests: number
  windowMs: number
  lastReset: number
}

/**
 * Salva stato rate limiting nel localStorage
 */
function saveRateLimitState(endpoint: string, state: StoredRateLimit): void {
  try {
    const stored = getStoredRateLimitStates()
    stored[endpoint] = state
    localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(stored))
  } catch (error) {
    console.warn('Failed to save rate limit state:', error)
  }
}

/**
 * Recupera stato rate limiting dal localStorage
 */
function getStoredRateLimitStates(): Record<string, StoredRateLimit> {
  try {
    const stored = localStorage.getItem(RATE_LIMIT_STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.warn('Failed to load rate limit state:', error)
    return {}
  }
}

/**
 * Recupera stato rate limiting per un endpoint specifico
 */
function getStoredRateLimitState(endpoint: string): StoredRateLimit | null {
  const stored = getStoredRateLimitStates()
  return stored[endpoint] || null
}

/**
 * Pulisce stato rate limiting scaduto
 */
// function cleanupExpiredRateLimitStates(): void {
//   try {
//     const stored = getStoredRateLimitStates()
//     const now = Date.now()
//     
//     Object.keys(stored).forEach(endpoint => {
//       const state = stored[endpoint]
//       if (now - state.lastReset > state.windowMs) {
//         delete stored[endpoint]
//       }
//     })
//     
//     localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(stored))
//   } catch (error) {
//     console.warn('Failed to cleanup rate limit states:', error)
//   }
// }

// =============================================
// RATE LIMIT LOGIC
// =============================================

/**
 * Calcola se una richiesta può essere effettuata
 */
function canMakeRequest(
  requests: number[],
  maxRequests: number,
  windowMs: number,
  now: number = Date.now()
): boolean {
  // Rimuovi richieste fuori dalla finestra temporale
  const validRequests = requests.filter(time => now - time < windowMs)
  
  return validRequests.length < maxRequests
}

/**
 * Aggiunge una richiesta al tracking
 */
function addRequest(
  requests: number[],
  _maxRequests: number,
  windowMs: number,
  now: number = Date.now()
): number[] {
  // Rimuovi richieste fuori dalla finestra temporale
  const validRequests = requests.filter(time => now - time < windowMs)
  
  // Aggiungi la nuova richiesta
  validRequests.push(now)
  
  return validRequests
}

/**
 * Calcola il tempo di reset
 */
function calculateResetTime(requests: number[], windowMs: number, _now: number = Date.now()): Date | null {
  if (requests.length === 0) return null
  
  const oldestRequest = Math.min(...requests)
  return new Date(oldestRequest + windowMs)
}

// =============================================
// HOOK IMPLEMENTATION
// =============================================

export function useRateLimit(options: UseRateLimitOptions): UseRateLimitReturn {
  const { endpoint, maxRequests, windowMs } = options
  
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [remainingRequests, setRemainingRequests] = useState(maxRequests)
  const [resetTime, setResetTime] = useState<Date | null>(null)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastRequestTimeRef = useRef<number>(0)

  // Inizializza stato dal localStorage
  useEffect(() => {
    const stored = getStoredRateLimitState(endpoint)
    if (stored) {
      const now = Date.now()
      const validRequests = stored.requests.filter(time => now - time < stored.windowMs)
      
      setRemainingRequests(Math.max(0, stored.maxRequests - validRequests.length))
      setIsRateLimited(validRequests.length >= stored.maxRequests)
      setResetTime(calculateResetTime(validRequests, stored.windowMs, now))
    }
  }, [endpoint, maxRequests, windowMs])

  // Aggiorna stato rate limiting
  const updateRateLimitState = useCallback((requests: number[], now: number = Date.now()) => {
    const validRequests = requests.filter(time => now - time < windowMs)
    const canMake = canMakeRequest(validRequests, maxRequests, windowMs, now)
    const remaining = Math.max(0, maxRequests - validRequests.length)
    const reset = calculateResetTime(validRequests, windowMs, now)
    
    setRemainingRequests(remaining)
    setIsRateLimited(!canMake)
    setResetTime(reset)
    
    // Salva stato nel localStorage
    const state: StoredRateLimit = {
      endpoint,
      requests: validRequests,
      maxRequests,
      windowMs,
      lastReset: now
    }
    saveRateLimitState(endpoint, state)
  }, [endpoint, maxRequests, windowMs])

  // Registra una richiesta
  const recordRequest = useCallback(() => {
    const now = Date.now()
    const stored = getStoredRateLimitState(endpoint)
    const currentRequests = stored?.requests || []
    
    const newRequests = addRequest(currentRequests, maxRequests, windowMs, now)
    updateRateLimitState(newRequests, now)
    
    lastRequestTimeRef.current = now
  }, [endpoint, maxRequests, windowMs, updateRateLimitState])

  // Timer per aggiornamento periodico
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const stored = getStoredRateLimitState(endpoint)
      if (stored) {
        updateRateLimitState(stored.requests)
      }
    }, CHECK_INTERVAL)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [endpoint, updateRateLimitState])

  // Cleanup al unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Calcola secondi rimanenti
  const secondsUntilReset = resetTime 
    ? Math.max(0, Math.floor((resetTime.getTime() - Date.now()) / 1000))
    : 0

  // Aggiorna rateLimitInfo per compatibilità con authClient
  useEffect(() => {
    if (rateLimitInfo) {
      setRateLimitInfo({
        remaining: remainingRequests,
        reset: resetTime ? Math.floor(resetTime.getTime() / 1000) : 0,
        retryAfter: isRateLimited ? secondsUntilReset : undefined
      })
    }
  }, [remainingRequests, resetTime, isRateLimited, secondsUntilReset])

  return {
    canMakeRequest: !isRateLimited,
    remainingRequests,
    resetTime,
    isRateLimited,
    secondsUntilReset,
    recordRequest
  }
}

// =============================================
// SPECIALIZED HOOKS
// =============================================

/**
 * Hook per rate limiting del login
 */
export function useLoginRateLimit(): UseRateLimitReturn {
  return useRateLimit({
    endpoint: 'login',
    maxRequests: RATE_LIMIT_CONFIG.login.email.maxRequests,
    windowMs: RATE_LIMIT_CONFIG.login.email.windowMs
  })
}

/**
 * Hook per rate limiting del recovery
 */
export function useRecoveryRateLimit(): UseRateLimitReturn {
  return useRateLimit({
    endpoint: 'recovery',
    maxRequests: RATE_LIMIT_CONFIG.recovery.email.maxRequests,
    windowMs: RATE_LIMIT_CONFIG.recovery.email.windowMs
  })
}

/**
 * Hook per rate limiting IP-based
 */
export function useIpRateLimit(endpoint: 'login' | 'recovery'): UseRateLimitReturn {
  const config = endpoint === 'login' 
    ? RATE_LIMIT_CONFIG.login.ip 
    : RATE_LIMIT_CONFIG.recovery.ip
    
  return useRateLimit({
    endpoint: `ip-${endpoint}`,
    maxRequests: config.maxRequests,
    windowMs: config.windowMs
  })
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

/**
 * Verifica se un endpoint è rate limited
 */
export function isEndpointRateLimited(endpoint: string): boolean {
  const stored = getStoredRateLimitState(endpoint)
  if (!stored) return false
  
  const now = Date.now()
  const validRequests = stored.requests.filter(time => now - time < stored.windowMs)
  
  return validRequests.length >= stored.maxRequests
}

/**
 * Ottiene informazioni rate limiting per un endpoint
 */
export function getEndpointRateLimitInfo(endpoint: string): RateLimitInfo | null {
  const stored = getStoredRateLimitState(endpoint)
  if (!stored) return null
  
  const now = Date.now()
  const validRequests = stored.requests.filter(time => now - time < stored.windowMs)
  const remaining = Math.max(0, stored.maxRequests - validRequests.length)
  const reset = calculateResetTime(validRequests, stored.windowMs, now)
  
  return {
    remaining,
    reset: reset ? Math.floor(reset.getTime() / 1000) : 0,
    retryAfter: remaining === 0 ? Math.max(0, Math.floor((reset!.getTime() - now) / 1000)) : undefined
  }
}

/**
 * Pulisce tutti gli stati rate limiting
 */
export function clearAllRateLimitStates(): void {
  try {
    localStorage.removeItem(RATE_LIMIT_STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to clear rate limit states:', error)
  }
}

/**
 * Pulisce stato rate limiting per un endpoint specifico
 */
export function clearEndpointRateLimitState(endpoint: string): void {
  try {
    const stored = getStoredRateLimitStates()
    delete stored[endpoint]
    localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(stored))
  } catch (error) {
    console.warn('Failed to clear endpoint rate limit state:', error)
  }
}

// =============================================
// ERROR HANDLING UTILITIES
// =============================================

/**
 * Gestisce errori rate limiting specifici
 */
export function handleRateLimitError(error: unknown): {
  isRateLimited: boolean
  retryAfter?: number
  message: string
} {
  if (error instanceof Error) {
    if (error.message.includes('429') || error.message.includes('rate limit')) {
      return {
        isRateLimited: true,
        retryAfter: 60, // Default 1 minute
        message: 'Troppi tentativi. Riprova più tardi.'
      }
    }
  }
  
  return {
    isRateLimited: false,
    message: 'Errore durante la verifica del rate limiting.'
  }
}

/**
 * Verifica se un errore è relativo al rate limiting
 */
export function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('429') || 
           error.message.includes('rate limit') ||
           error.message.includes('RATE_LIMITED')
  }
  return false
}
