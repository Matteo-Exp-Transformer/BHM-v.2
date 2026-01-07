/**
 * 🔒 CSRF Protection Service
 * 
 * Implementazione CSRF token per protezione attacchi Cross-Site Request Forgery
 * 
 * @date 2025-01-23
 */

export interface CSRFToken {
  token: string
  expiresAt: number
  createdAt: number
}

export interface CSRFConfig {
  tokenLength: number
  tokenExpiry: number // in milliseconds
  refreshThreshold: number // refresh token when expires in X ms
}

class CSRFService {
  private config: CSRFConfig = {
    tokenLength: 32,
    tokenExpiry: 30 * 60 * 1000, // 30 minutes
    refreshThreshold: 5 * 60 * 1000, // 5 minutes before expiry
  }

  private currentToken: CSRFToken | null = null
  private tokenStorageKey = 'bhm-csrf-token'

  /**
   * Generate a secure random token
   */
  private generateToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    const crypto = window.crypto || (window as any).msCrypto
    
    if (crypto && crypto.getRandomValues) {
      const array = new Uint8Array(this.config.tokenLength)
      crypto.getRandomValues(array)
      for (let i = 0; i < this.config.tokenLength; i++) {
        result += chars[array[i] % chars.length]
      }
    } else {
      // Fallback for older browsers
      for (let i = 0; i < this.config.tokenLength; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
    }
    
    return result
  }

  /**
   * Get current CSRF token, generate if needed
   */
  public getToken(): string {
    const now = Date.now()
    
    // Check if we have a valid token
    if (this.currentToken && this.currentToken.expiresAt > now) {
      // Check if token needs refresh
      if (this.currentToken.expiresAt - now < this.config.refreshThreshold) {
        this.refreshToken()
      }
      return this.currentToken.token
    }
    
    // Generate new token
    return this.generateNewToken()
  }

  /**
   * Generate a new CSRF token
   */
  public generateNewToken(): string {
    const now = Date.now()
    const token = this.generateToken()
    
    this.currentToken = {
      token,
      expiresAt: now + this.config.tokenExpiry,
      createdAt: now,
    }
    
    // Store in localStorage for persistence
    try {
      localStorage.setItem(this.tokenStorageKey, JSON.stringify(this.currentToken))
    } catch (error) {
      console.warn('Failed to store CSRF token:', error)
    }
    
    console.log('🔒 CSRF Token generated:', token.substring(0, 8) + '...')
    return token
  }

  /**
   * Refresh current token
   */
  public refreshToken(): string {
    console.log('🔄 Refreshing CSRF token...')
    return this.generateNewToken()
  }

  /**
   * Validate CSRF token
   */
  public validateToken(token: string): boolean {
    if (!token) {
      console.warn('❌ CSRF validation failed: no token provided')
      return false
    }
    
    const now = Date.now()
    
    // Check current token
    if (this.currentToken && this.currentToken.token === token) {
      if (this.currentToken.expiresAt > now) {
        console.log('✅ CSRF token valid')
        return true
      } else {
        console.warn('❌ CSRF validation failed: token expired')
        return false
      }
    }
    
    // Try to load from localStorage
    try {
      const stored = localStorage.getItem(this.tokenStorageKey)
      if (stored) {
        const storedToken: CSRFToken = JSON.parse(stored)
        if (storedToken.token === token && storedToken.expiresAt > now) {
          this.currentToken = storedToken
          console.log('✅ CSRF token valid (from storage)')
          return true
        }
      }
    } catch (error) {
      console.warn('Failed to load CSRF token from storage:', error)
    }
    
    console.warn('❌ CSRF validation failed: invalid token')
    return false
  }

  /**
   * Clear CSRF token
   */
  public clearToken(): void {
    this.currentToken = null
    try {
      localStorage.removeItem(this.tokenStorageKey)
    } catch (error) {
      console.warn('Failed to clear CSRF token:', error)
    }
    console.log('🗑️ CSRF token cleared')
  }

  /**
   * Initialize CSRF protection
   */
  public initialize(): void {
    console.log('🔒 Initializing CSRF protection...')
    
    // Try to load existing token
    try {
      const stored = localStorage.getItem(this.tokenStorageKey)
      if (stored) {
        const storedToken: CSRFToken = JSON.parse(stored)
        const now = Date.now()
        
        if (storedToken.expiresAt > now) {
          this.currentToken = storedToken
          console.log('✅ CSRF token loaded from storage')
        } else {
          console.log('🔄 CSRF token expired, generating new one')
          this.generateNewToken()
        }
      } else {
        console.log('🆕 No CSRF token found, generating new one')
        this.generateNewToken()
      }
    } catch (error) {
      console.warn('Failed to initialize CSRF token:', error)
      this.generateNewToken()
    }
  }

  /**
   * Get token info for debugging
   */
  public getTokenInfo(): { token: string; expiresIn: number; isValid: boolean } | null {
    if (!this.currentToken) return null
    
    const now = Date.now()
    const expiresIn = Math.max(0, this.currentToken.expiresAt - now)
    const isValid = expiresIn > 0
    
    return {
      token: this.currentToken.token.substring(0, 8) + '...',
      expiresIn,
      isValid,
    }
  }
}

// Export singleton instance
export const csrfService = new CSRFService()

// Initialize on import
if (typeof window !== 'undefined') {
  csrfService.initialize()
}
