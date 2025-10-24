/**
 * 🔐 Auth API Client - Hardening Implementation
 * 
 * Client API per autenticazione con CSRF protection, rate limiting,
 * session management e error handling generico
 * 
 * @date 2025-10-20
 * @author Agente 3 - Experience Designer
 */

import type { 
  RecoveryRequest, 
  RecoveryConfirm, 
  InviteAccept,
  ApiResponse,
  SessionData,
  InviteVerification,
  AuthErrorCode,
  CsrfTokenResponse,
  // RateLimitInfo as AuthRateLimitInfo
} from '@/types/auth'
import type { LoginFormData } from '../schemas/authSchemas'
import { 
  loginFormSchema,
  recoveryRequestSchema,
  recoveryConfirmSchema,
  inviteAcceptSchema
} from './schemas/authSchemas'

// =============================================
// CONFIGURATION
// =============================================

const API_BASE_URL = '/functions/v1'
const CSRF_COOKIE_NAME = 'bhm_csrf_token'
const CSRF_HEADER_NAME = 'X-CSRF-Token'

// =============================================
// CSRF TOKEN MANAGEMENT
// =============================================

export class CSRFManager {
  private static instance: CSRFManager
  private token: string | null = null

  static getInstance(): CSRFManager {
    if (!CSRFManager.instance) {
      CSRFManager.instance = new CSRFManager()
    }
    return CSRFManager.instance
  }

  /**
   * Ottiene il token CSRF dal cookie
   */
  getToken(): string | null {
    if (this.token) {
      return this.token
    }

    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=')
      if (name === CSRF_COOKIE_NAME) {
        this.token = value
        return value
      }
    }
    return null
  }

  /**
   * Aggiorna il token CSRF (dopo rotazione server-side)
   */
  updateToken(newToken: string): void {
    this.token = newToken
  }

  /**
   * Pulisce il token CSRF
   */
  clearToken(): void {
    this.token = null
  }
}

// =============================================
// RATE LIMITING HELPERS
// =============================================

export interface RateLimitInfo {
  remaining: number
  reset: number
  retryAfter?: number
}

export class RateLimitManager {
  private static instance: RateLimitManager
  private limits: Map<string, RateLimitInfo> = new Map()

  static getInstance(): RateLimitManager {
    if (!RateLimitManager.instance) {
      RateLimitManager.instance = new RateLimitManager()
    }
    return RateLimitManager.instance
  }

  /**
   * Aggiorna le informazioni di rate limiting da headers
   */
  updateFromHeaders(response: Response): void {
    const remaining = response.headers.get('X-RateLimit-Remaining')
    const reset = response.headers.get('X-RateLimit-Reset')
    const retryAfter = response.headers.get('X-RateLimit-Retry-After')

    if (remaining && reset) {
      this.limits.set('current', {
        remaining: parseInt(remaining, 10),
        reset: parseInt(reset, 10),
        retryAfter: retryAfter ? parseInt(retryAfter, 10) : undefined
      })
    }
  }

  /**
   * Ottiene le informazioni di rate limiting correnti
   */
  getCurrentLimit(): RateLimitInfo | null {
    return this.limits.get('current') || null
  }

  /**
   * Verifica se è in corso un rate limiting
   */
  isRateLimited(): boolean {
    const limit = this.getCurrentLimit()
    return limit ? limit.remaining === 0 : false
  }

  /**
   * Calcola i secondi rimanenti prima del reset
   */
  getSecondsUntilReset(): number {
    const limit = this.getCurrentLimit()
    if (!limit) return 0
    
    const now = Math.floor(Date.now() / 1000)
    return Math.max(0, limit.reset - now)
  }
}

// =============================================
// HTTP CLIENT
// =============================================

class HttpClient {
  private csrfManager = CSRFManager.getInstance()
  private rateLimitManager = RateLimitManager.getInstance()

  /**
   * Effettua una richiesta HTTP con CSRF protection
   */
  async request<T>(
    endpoint: string,
    options: globalThis.RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`
    
    // Prepara headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>)
    }

    // Aggiungi CSRF token per richieste mutate
    if (options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method.toUpperCase())) {
      const csrfToken = this.csrfManager.getToken()
      if (csrfToken) {
        headers[CSRF_HEADER_NAME] = csrfToken
      }
    }

    // Effettua la richiesta
    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include' // Include cookies
      })

      // Aggiorna rate limiting info
      this.rateLimitManager.updateFromHeaders(response)

      // Gestisci rate limiting
      if (response.status === 429) {
        return {
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Troppi tentativi. Riprova più tardi',
            devMessage: 'Rate limit exceeded'
          }
        }
      }

      // Gestisci CSRF error
      if (response.status === 403) {
        return {
          success: false,
          error: {
            code: 'CSRF_REQUIRED',
            message: 'La sessione non è valida. Riprova',
            devMessage: 'CSRF token missing or invalid'
          }
        }
      }

      // Gestisci session expired
      if (response.status === 401) {
        return {
          success: false,
          error: {
            code: 'SESSION_EXPIRED',
            message: 'La sessione è scaduta. Accedi di nuovo',
            devMessage: 'Session expired'
          }
        }
      }

      // Parse response
      const data = await response.json()

      if (response.ok) {
        return {
          success: true,
          data
        }
      } else {
        return {
          success: false,
          error: {
            code: data.code || 'UNKNOWN_ERROR',
            message: data.message || 'Errore sconosciuto',
            devMessage: data.devMessage
          }
        }
      }
    } catch (error) {
      console.error('HTTP Request Error:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Errore di connessione. Riprova',
          devMessage: error instanceof Error ? error.message : 'Unknown network error'
        }
      }
    }
  }
}

// =============================================
// AUTH API CLIENT
// =============================================

export class AuthClient {
  private httpClient = new HttpClient()
  // private csrfManager = CSRFManager.getInstance()
  private rateLimitManager = RateLimitManager.getInstance()

  /**
   * Login utente
   */
  async login(data: LoginFormData): Promise<ApiResponse<SessionData>> {
    // Valida i dati con Zod
    const validatedData = loginFormSchema.parse(data)
    
    return this.httpClient.request<SessionData>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: validatedData.email,
        password: validatedData.password,
        rememberMe: validatedData.rememberMe,
        csrf_token: validatedData.csrf_token
      })
    })
  }

  /**
   * Logout utente
   */
  async logout(): Promise<ApiResponse<void>> {
    return this.httpClient.request<void>('/auth/logout', {
      method: 'POST'
    })
  }

  /**
   * Richiesta reset password
   */
  async requestRecovery(data: RecoveryRequest): Promise<ApiResponse<void>> {
    // Valida i dati con Zod
    const validatedData = recoveryRequestSchema.parse(data)
    
    return this.httpClient.request<void>('/auth/recovery/request', {
      method: 'POST',
      body: JSON.stringify(validatedData)
    })
  }

  /**
   * Conferma reset password
   */
  async confirmRecovery(data: RecoveryConfirm): Promise<ApiResponse<SessionData>> {
    // Valida i dati con Zod
    const validatedData = recoveryConfirmSchema.parse(data)
    
    return this.httpClient.request<SessionData>(`/auth/recovery/confirm?token=${validatedData.token}`, {
      method: 'POST',
      body: JSON.stringify({
        password: validatedData.password,
        csrf_token: validatedData.csrf_token
      })
    })
  }

  /**
   * Verifica validità token invito
   */
  async verifyInvite(token: string): Promise<ApiResponse<InviteVerification>> {
    return this.httpClient.request<InviteVerification>(`/invites/${token}`, {
      method: 'GET'
    })
  }

  /**
   * Accetta invito e crea account
   */
  async acceptInvite(data: InviteAccept): Promise<ApiResponse<SessionData>> {
    // Valida i dati con Zod
    const validatedData = inviteAcceptSchema.parse(data)
    
    return this.httpClient.request<SessionData>('/invites/accept', {
      method: 'POST',
      body: JSON.stringify({
        token: validatedData.token,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        password: validatedData.password,
        csrf_token: validatedData.csrf_token
      })
    })
  }

  /**
   * Crea invito (admin only)
   */
  async createInvite(data: { email: string; role: string; department_id: string; csrf_token: string }): Promise<ApiResponse<{ inviteId: string }>> {
    return this.httpClient.request<{ inviteId: string }>('/invites/create', {
      method: 'POST',
      body: JSON.stringify({
        email: data.email,
        role: data.role,
        department_id: data.department_id,
        csrf_token: data.csrf_token
      })
    })
  }

  /**
   * Ottiene informazioni sessione corrente
   */
  async getSession(): Promise<ApiResponse<SessionData>> {
    return this.httpClient.request<SessionData>('/session', {
      method: 'GET'
    })
  }

  /**
   * Ottiene token CSRF dal server
   */
  async getCsrfToken(): Promise<ApiResponse<CsrfTokenResponse>> {
    return this.httpClient.request<CsrfTokenResponse>('/auth/csrf-token', {
      method: 'GET'
    })
  }

  /**
   * Ottiene informazioni rate limiting
   */
  getRateLimitInfo(): RateLimitInfo | null {
    return this.rateLimitManager.getCurrentLimit()
  }

  /**
   * Verifica se è in corso rate limiting
   */
  isRateLimited(): boolean {
    return this.rateLimitManager.isRateLimited()
  }

  /**
   * Ottiene secondi rimanenti prima del reset rate limiting
   */
  getSecondsUntilReset(): number {
    return this.rateLimitManager.getSecondsUntilReset()
  }

  /**
   * Registra una richiesta per il rate limiting
   */
  recordRequest(endpoint: string): void {
    // Questo metodo sarà utilizzato dai hook per registrare le richieste
    // L'implementazione specifica è gestita dai hook useRateLimit
    console.debug(`Request recorded for endpoint: ${endpoint}`)
  }
}

// =============================================
// SINGLETON INSTANCE
// =============================================

export const authClient = new AuthClient()

// =============================================
// ERROR HANDLING UTILITIES
// =============================================

export const getErrorMessage = (errorCode: AuthErrorCode): string => {
  const messages: Record<AuthErrorCode, string> = {
    AUTH_FAILED: 'Credenziali non valide',
    RATE_LIMITED: 'Troppi tentativi. Riprova più tardi',
    CSRF_REQUIRED: 'La sessione non è valida. Riprova',
    CSRF_INVALID: 'Token CSRF non valido',
    TOKEN_INVALID: 'Link non valido',
    TOKEN_EXPIRED: 'Link scaduto',
    INVITE_INVALID: 'Invito non valido',
    INVITE_EXPIRED: 'Invito scaduto',
    PASSWORD_POLICY_VIOLATION: 'Password non conforme',
    SESSION_EXPIRED: 'La sessione è scaduta. Accedi di nuovo',
    ACCOUNT_LOCKED: 'Account bloccato',
    VALIDATION_ERROR: 'Errore di validazione',
    NETWORK_ERROR: 'Errore di rete',
    UNKNOWN_ERROR: 'Errore sconosciuto'
  }

  return messages[errorCode] || 'Errore sconosciuto'
}

export const isAuthError = (error: any): error is { code: AuthErrorCode; message: string } => {
  return error && typeof error.code === 'string' && typeof error.message === 'string'
}
