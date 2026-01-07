/**
 * 🔒 Remember Me Service
 * 
 * Gestisce la persistenza delle sessioni per la funzionalità "Remember Me"
 * Implementa sessioni estese (30 giorni) vs sessioni standard (24 ore)
 * 
 * @date 2025-01-23
 */

import { supabase } from '@/lib/supabase/client'

export interface RememberMeConfig {
  enabled: boolean
  sessionDuration: number // in milliseconds
  refreshThreshold: number // refresh when expires in X ms
}

export interface SessionInfo {
  userId: string
  companyId: string
  rememberMe: boolean
  expiresAt: number
  createdAt: number
}

class RememberMeService {
  private config: RememberMeConfig = {
    enabled: false,
    sessionDuration: 30 * 24 * 60 * 60 * 1000, // 30 giorni
    refreshThreshold: 24 * 60 * 60 * 1000, // 1 giorno prima della scadenza
  }

  private storageKey = 'bhm-remember-me-session'
  private currentSession: SessionInfo | null = null

  /**
   * Abilita Remember Me per la sessione corrente
   */
  public async enableRememberMe(userId: string, companyId: string): Promise<boolean> {
    try {
      // Chiama Edge Function per configurare Remember Me lato backend
      const { data: _data, error } = await supabase.functions.invoke('remember-me', {
        body: {
          rememberMe: true,
          userId,
          sessionDuration: this.config.sessionDuration
        }
      })

      if (error) {
        console.error('Error enabling remember me:', error)
        return false
      }

      const now = Date.now()
      const expiresAt = now + this.config.sessionDuration

      this.currentSession = {
        userId,
        companyId,
        rememberMe: true,
        expiresAt,
        createdAt: now,
      }

      // Salva in localStorage
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.currentSession))
        console.log('🔒 Remember Me enabled: session expires in 30 days')
        return true
      } catch (error) {
        console.warn('Failed to store remember me session:', error)
        return false
      }
    } catch (error) {
      console.error('Error in enableRememberMe:', error)
      return false
    }
  }

  /**
   * Disabilita Remember Me
   */
  public async disableRememberMe(): Promise<boolean> {
    try {
      // Chiama Edge Function per disabilitare Remember Me lato backend
      if (this.currentSession?.userId) {
        const { error } = await supabase.functions.invoke('remember-me', {
          body: {
            rememberMe: false,
            userId: this.currentSession.userId,
            sessionDuration: 24 * 60 * 60 * 1000 // 24 ore
          }
        })

        if (error) {
          console.error('Error disabling remember me:', error)
        }
      }

      this.currentSession = null
      try {
        localStorage.removeItem(this.storageKey)
        console.log('🔒 Remember Me disabled: session expires in 24 hours')
        return true
      } catch (error) {
        console.warn('Failed to clear remember me session:', error)
        return false
      }
    } catch (error) {
      console.error('Error in disableRememberMe:', error)
      return false
    }
  }

  /**
   * Verifica se Remember Me è attivo e valido
   */
  public isRememberMeActive(): boolean {
    if (!this.currentSession) {
      this.loadFromStorage()
    }

    if (!this.currentSession) return false

    const now = Date.now()
    const isValid = this.currentSession.expiresAt > now

    if (!isValid) {
      // Clear the session immediately for expired sessions
      this.currentSession = null
      this.disableRememberMe()
      return false
    }

    return this.currentSession.rememberMe
  }

  /**
   * Ottieni informazioni sessione Remember Me
   */
  public getSessionInfo(): SessionInfo | null {
    if (!this.currentSession) {
      this.loadFromStorage()
    }

    if (!this.currentSession) return null

    const now = Date.now()
    if (this.currentSession.expiresAt <= now) {
      // Clear the session immediately for expired sessions
      this.currentSession = null
      this.disableRememberMe()
      return null
    }

    return this.currentSession
  }

  /**
   * Verifica se la sessione deve essere rinnovata
   */
  public shouldRefreshSession(): boolean {
    if (!this.currentSession) {
      this.loadFromStorage()
    }
    
    if (!this.currentSession) return false

    const now = Date.now()
    const timeUntilExpiry = this.currentSession.expiresAt - now

    return timeUntilExpiry < this.config.refreshThreshold
  }

  /**
   * Rinnova la sessione Remember Me
   */
  public refreshSession(): void {
    if (!this.currentSession) return

    const now = Date.now()
    this.currentSession.expiresAt = now + this.config.sessionDuration

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.currentSession))
      console.log('🔄 Remember Me session refreshed')
    } catch (error) {
      console.warn('Failed to refresh remember me session:', error)
    }
  }

  /**
   * Carica sessione da localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const session: SessionInfo = JSON.parse(stored)
        const now = Date.now()

        if (session.expiresAt > now) {
          this.currentSession = session
          console.log('✅ Remember Me session loaded from storage')
        } else {
          console.log('🔄 Remember Me session expired, clearing')
          this.disableRememberMe()
        }
      }
    } catch (error) {
      console.warn('Failed to load remember me session:', error)
      this.disableRememberMe()
    }
  }

  /**
   * Ottieni tempo rimanente alla scadenza
   */
  public getTimeUntilExpiry(): number {
    if (!this.currentSession) {
      this.loadFromStorage()
    }
    
    if (!this.currentSession) return 0

    const now = Date.now()
    return Math.max(0, this.currentSession.expiresAt - now)
  }

  /**
   * Ottieni informazioni debug
   */
  public getDebugInfo(): {
    enabled: boolean
    expiresIn: number
    shouldRefresh: boolean
    sessionInfo: SessionInfo | null
  } {
    return {
      enabled: this.isRememberMeActive(),
      expiresIn: this.getTimeUntilExpiry(),
      shouldRefresh: this.shouldRefreshSession(),
      sessionInfo: this.getSessionInfo(),
    }
  }

  /**
   * Reset the service state (for testing purposes)
   */
  public reset(): void {
    this.currentSession = null
  }
}

// Export singleton instance
export const rememberMeService = new RememberMeService()
