/**
 * Singleton auth session manager — un solo listener Supabase per tutta l'app.
 * Evita duplicati quando più componenti chiamano useAuth().
 */
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

type AuthListener = (state: { user: User | null; isLoading: boolean }) => void

let cachedUser: User | null = null
let cachedLoading = true
let snapshot: { user: User | null; isLoading: boolean } = {
  user: cachedUser,
  isLoading: cachedLoading,
}
let initialized = false
const listeners = new Set<AuthListener>()

const notify = () => {
  listeners.forEach((listener) => listener(snapshot))
}

const setAuthState = (user: User | null, isLoading: boolean) => {
  if (cachedUser === user && cachedLoading === isLoading) return
  cachedUser = user
  cachedLoading = isLoading
  snapshot = { user, isLoading }
  notify()
}

const finishLoading = () => setAuthState(cachedUser, false)

const initAuth = () => {
  if (initialized) return
  initialized = true

  const loadingTimeout = setTimeout(() => {
    console.warn('⚠️ Timeout caricamento autenticazione (10s) - forzando stato finale')
    finishLoading()
  }, 10000)

  Promise.race([
    supabase.auth.getSession(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('getSession timeout')), 8000)
    ),
  ])
    .then(({ data: { session }, error }) => {
      clearTimeout(loadingTimeout)
      if (error) {
        console.error('❌ Errore recupero sessione iniziale:', error)
        if (
          error.message?.includes('refresh_token') ||
          error.message?.includes('Invalid Refresh Token') ||
          error.message?.includes('getSession timeout')
        ) {
          void supabase.auth.signOut().catch(console.error)
        }
        setAuthState(null, false)
        return
      }
      setAuthState(session?.user ?? null, false)
    })
    .catch((error) => {
      clearTimeout(loadingTimeout)
      console.error('❌ Errore critico recupero sessione:', error)
      setAuthState(null, false)
    })

  supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
    if (import.meta.env.DEV && event !== 'TOKEN_REFRESHED') {
      console.log('🔐 Auth state change:', event, session ? 'session exists' : 'no session')
    }

    if (event === 'TOKEN_REFRESHED' && !session) {
      console.warn('⚠️ Token refresh fallito - sessione persa')
      setAuthState(null, false)
      return
    }

    setAuthState(session?.user ?? null, false)
  })
}

export const initAuthSession = initAuth

export const getAuthSnapshot = (): { user: User | null; isLoading: boolean } =>
  snapshot

export const subscribeAuthSession = (listener: AuthListener): (() => void) => {
  initAuth()
  listeners.add(listener)
  listener(getAuthSnapshot())
  return () => listeners.delete(listener)
}
