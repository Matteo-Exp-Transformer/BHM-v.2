/**
 * 🔐 Auth Types - Login Hardening Implementation
 * 
 * Tipi TypeScript centralizzati per autenticazione con CSRF protection,
 * rate limiting, session management e error handling
 * 
 * @date 2025-01-27
 * @author Agente 5 - Frontend Developer
 */

// =============================================
// USER & SESSION TYPES
// =============================================

export interface AuthUser {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  role: string
  tenant_id: string
  created_at: string
  updated_at: string
  last_login_at?: string
  is_active: boolean
}

export interface AuthState {
  user: AuthUser | null
  session: SessionData | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

export interface SessionData {
  token: string
  csrf_token: string
  expires_at: string
  refresh_token?: string
  user: AuthUser
}

// =============================================
// FORM DATA TYPES
// =============================================

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
  csrf_token: string
}

export interface RecoveryRequest {
  email: string
  csrf_token: string
}

export interface RecoveryConfirm {
  token: string
  password: string
  csrf_token: string
}

export interface InviteAccept {
  token: string
  firstName: string
  lastName: string
  password: string
  csrf_token: string
}

export interface InviteCreate {
  email: string
  role: string
  department_id?: string
  csrf_token: string
}

// =============================================
// API RESPONSE TYPES
// =============================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: AuthErrorCode
    message: string
    devMessage?: string
    details?: any
  }
}

export interface LoginResponse {
  success: true
  user: AuthUser
  session: SessionData
}

export interface CsrfTokenResponse {
  csrf_token: string
  expires_at: string
}

export interface InviteVerification {
  valid: boolean
  invite: {
    id: string
    email: string
    role: string
    department_id?: string
    expires_at: string
    created_by: string
  } | null
}

// =============================================
// ERROR TYPES
// =============================================

export type AuthErrorCode = 
  | 'AUTH_FAILED'
  | 'RATE_LIMITED'
  | 'CSRF_REQUIRED'
  | 'CSRF_INVALID'
  | 'TOKEN_INVALID'
  | 'TOKEN_EXPIRED'
  | 'INVITE_INVALID'
  | 'INVITE_EXPIRED'
  | 'PASSWORD_POLICY_VIOLATION'
  | 'SESSION_EXPIRED'
  | 'ACCOUNT_LOCKED'
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR'

export interface AuthError {
  code: AuthErrorCode
  message: string
  devMessage?: string
  details?: {
    retry_after?: number
    locked_until?: string
    field_errors?: Array<{
      field: string
      message: string
    }>
  }
}

// =============================================
// HOOK TYPES
// =============================================

export interface UseCsrfTokenReturn {
  token: string | null
  error: string | null
  isLoading: boolean
  refreshToken: () => Promise<void>
  expiresAt: Date | null
}

export interface UseRateLimitReturn {
  canMakeRequest: boolean
  remainingRequests: number
  resetTime: Date | null
  isRateLimited: boolean
  secondsUntilReset: number
  recordRequest: () => void
}

export interface UseRateLimitOptions {
  endpoint: string
  maxRequests: number
  windowMs: number
}

// =============================================
// RATE LIMITING TYPES
// =============================================

export interface RateLimitInfo {
  remaining: number
  reset: number
  retryAfter?: number
}

export interface RateLimitConfig {
  login: {
    email: { maxRequests: number; windowMs: number }
    ip: { maxRequests: number; windowMs: number }
  }
  recovery: {
    email: { maxRequests: number; windowMs: number }
    ip: { maxRequests: number; windowMs: number }
  }
  lockout: {
    login: number // seconds
    recovery: number // seconds
  }
}

// =============================================
// VALIDATION TYPES
// =============================================

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface PasswordPolicy {
  minLength: number
  maxLength: number
  pattern: RegExp
  description: string
}

// =============================================
// COMPONENT PROPS TYPES
// =============================================

export interface LoginFormProps {
  onSuccess: (user: AuthUser) => void
  onError: (error: string) => void
  className?: string
  initialEmail?: string
  disabled?: boolean
}

export interface RecoveryRequestFormProps {
  onSuccess: () => void
  onError: (error: string) => void
  className?: string
  initialEmail?: string
  disabled?: boolean
}

export interface RecoveryConfirmFormProps {
  token: string
  onSuccess: (user: AuthUser) => void
  onError: (error: string) => void
  className?: string
  disabled?: boolean
}

export interface InviteAcceptFormProps {
  token: string
  onSuccess: (user: AuthUser) => void
  onError: (error: string) => void
  className?: string
  disabled?: boolean
}

export interface PasswordInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  disabled?: boolean
  showPolicy?: boolean
  className?: string
}

export interface ErrorBannerProps {
  message: string
  type: 'error' | 'warning' | 'info'
  onDismiss?: () => void
  className?: string
}

export interface RateLimitBannerProps {
  retryAfter: number
  onReset: () => void
  className?: string
}

// =============================================
// FORM STATE TYPES
// =============================================

export type LoginFormState = 
  | 'default' 
  | 'filling' 
  | 'validating' 
  | 'submitting' 
  | 'success' 
  | 'error' 
  | 'rate_limited'

export type RecoveryFormState = 
  | 'default'
  | 'submitting'
  | 'success'
  | 'error'
  | 'rate_limited'

export type InviteFormState = 
  | 'default'
  | 'submitting'
  | 'success'
  | 'error'
  | 'rate_limited'

// =============================================
// CONSTANTS
// =============================================

/** Caratteri ammessi in password: lettere, numeri, caratteri speciali comuni (no control chars) */
const PASSWORD_PATTERN = /^[\x20-\x7E]+$/

export const PASSWORD_POLICY: PasswordPolicy = {
  minLength: 12,
  maxLength: 128,
  pattern: PASSWORD_PATTERN,
  description: 'Minimo 12 caratteri, massimo 128, lettere numeri e caratteri speciali'
}

export const RATE_LIMIT_CONFIG: RateLimitConfig = {
  login: {
    email: { maxRequests: 5, windowMs: 5 * 60 * 1000 }, // 5/5min
    ip: { maxRequests: 30, windowMs: 5 * 60 * 1000 } // 30/5min
  },
  recovery: {
    email: { maxRequests: 3, windowMs: 15 * 60 * 1000 }, // 3/15min
    ip: { maxRequests: 10, windowMs: 15 * 60 * 1000 } // 10/15min
  },
  lockout: {
    login: 10 * 60, // 10min
    recovery: 30 * 60 // 30min
  }
}

export const CSRF_CONFIG = {
  cookieName: 'bhm_csrf_token',
  headerName: 'X-CSRF-Token',
  duration: 4 * 60 * 60 * 1000, // 4 hours
  refreshInterval: 2 * 60 * 60 * 1000 // 2 hours
}

export const SESSION_CONFIG = {
  duration: 8 * 60 * 60 * 1000, // 8 hours
  refreshInterval: 4 * 60 * 60 * 1000, // 4 hours
  maxSessions: 5,
  cookieName: 'session_token',
  cookieOptions: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict' as const
  }
}
