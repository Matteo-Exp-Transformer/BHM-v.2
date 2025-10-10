/**
 * ⚠️ SOLO PER SVILUPPO - RIMUOVERE PRIMA DI PRODUCTION
 * 
 * Multi-Host Authentication Sync
 * Sincronizza la sessione Supabase tra diverse porte localhost
 * 
 * Porte supportate: 3000, 3002, 5173, 5174
 * 
 * IMPORTANTE: Questa funzionalità serve SOLO per sviluppo locale.
 * In production c'è un solo dominio, quindi non serve.
 */

const SUPPORTED_PORTS = [3000, 3002, 5173, 5174]
const STORAGE_KEYS = {
  SUPABASE_AUTH: 'sb-tucqgcfrlzmwyfadiodo-auth-token',
  // Aggiungi altre chiavi Supabase se necessario
}

/**
 * Ottiene la porta corrente
 */
const getCurrentPort = (): number => {
  return parseInt(window.location.port) || 80
}

/**
 * Verifica se l'utente è loggato sulla porta corrente
 */
export const isLoggedInCurrentPort = (): boolean => {
  try {
    const authData = localStorage.getItem(STORAGE_KEYS.SUPABASE_AUTH)
    if (!authData) return false
    
    const parsed = JSON.parse(authData)
    return !!(parsed?.access_token || parsed?.token)
  } catch (error) {
    console.error('Errore verifica login:', error)
    return false
  }
}

/**
 * Cerca una sessione valida su altre porte
 * NOTA: Usa iframe per accedere al localStorage di altre porte
 */
export const findValidSessionOnOtherPorts = async (): Promise<{
  port: number
  sessionData: string
} | null> => {
  const currentPort = getCurrentPort()
  
  for (const port of SUPPORTED_PORTS) {
    if (port === currentPort) continue
    
    try {
      // Tenta di leggere localStorage dalla porta specifica
      const sessionData = await getSessionFromPort(port)
      
      if (sessionData) {
        console.log(`✅ Sessione trovata su porta ${port}`)
        return { port, sessionData }
      }
    } catch (error) {
      console.warn(`⚠️ Non riesco a leggere porta ${port}:`, error)
    }
  }
  
  return null
}

/**
 * Legge la sessione da una specifica porta
 * Usa un iframe nascosto per accedere al localStorage
 */
const getSessionFromPort = (port: number): Promise<string | null> => {
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.src = `http://localhost:${port}/`
    
    let resolved = false
    
    // Timeout dopo 2 secondi
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true
        document.body.removeChild(iframe)
        resolve(null)
      }
    }, 2000)
    
    iframe.onload = () => {
      try {
        const iframeWindow = iframe.contentWindow
        if (!iframeWindow) {
          clearTimeout(timeout)
          if (!resolved) {
            resolved = true
            document.body.removeChild(iframe)
            resolve(null)
          }
          return
        }
        
        const sessionData = iframeWindow.localStorage.getItem(STORAGE_KEYS.SUPABASE_AUTH)
        
        clearTimeout(timeout)
        if (!resolved) {
          resolved = true
          document.body.removeChild(iframe)
          resolve(sessionData)
        }
      } catch (error) {
        // CORS error - normale per sicurezza browser
        clearTimeout(timeout)
        if (!resolved) {
          resolved = true
          document.body.removeChild(iframe)
          resolve(null)
        }
      }
    }
    
    iframe.onerror = () => {
      clearTimeout(timeout)
      if (!resolved) {
        resolved = true
        document.body.removeChild(iframe)
        resolve(null)
      }
    }
    
    document.body.appendChild(iframe)
  })
}

/**
 * Copia la sessione dalla porta sorgente alla porta corrente
 */
export const copySessionFromPort = async (sessionData: string): Promise<boolean> => {
  try {
    // Copia la sessione nel localStorage corrente
    localStorage.setItem(STORAGE_KEYS.SUPABASE_AUTH, sessionData)
    
    console.log('✅ Sessione copiata con successo')
    return true
  } catch (error) {
    console.error('❌ Errore copia sessione:', error)
    return false
  }
}

/**
 * Funzione principale: Auto-login da altre porte
 */
export const autoLoginFromOtherPorts = async (): Promise<boolean> => {
  try {
    // 1. Verifica se già loggato
    if (isLoggedInCurrentPort()) {
      console.log('✅ Già loggato su questa porta')
      return true
    }
    
    console.log('🔍 Cerco sessione su altre porte...')
    
    // 2. Cerca sessione su altre porte
    const session = await findValidSessionOnOtherPorts()
    
    if (!session) {
      console.log('❌ Nessuna sessione trovata su altre porte')
      return false
    }
    
    // 3. Copia la sessione
    const copied = await copySessionFromPort(session.sessionData)
    
    if (!copied) {
      console.log('❌ Errore durante la copia della sessione')
      return false
    }
    
    console.log(`✅ Sessione copiata da porta ${session.port}`)
    return true
  } catch (error) {
    console.error('❌ Errore auto-login:', error)
    return false
  }
}

/**
 * Sincronizza manualmente con un click
 */
export const manualSyncWithOtherPorts = async (): Promise<void> => {
  const currentPort = getCurrentPort()
  
  const confirmed = window.confirm(
    `🔄 SINCRONIZZAZIONE MULTI-HOST\n\n` +
    `Porta corrente: ${currentPort}\n\n` +
    `Questa funzione cercherà una sessione valida sulle porte:\n` +
    `${SUPPORTED_PORTS.filter(p => p !== currentPort).join(', ')}\n\n` +
    `Se trova una sessione, la copierà su questa porta.\n\n` +
    `⚠️ ATTENZIONE: Questa funzione è solo per sviluppo!\n` +
    `Rimuovere prima di production.\n\n` +
    `Vuoi procedere?`
  )
  
  if (!confirmed) {
    console.log('🔄 Sincronizzazione annullata')
    return
  }
  
  console.log('🔄 Avvio sincronizzazione...')
  
  const success = await autoLoginFromOtherPorts()
  
  if (success) {
    const reload = window.confirm(
      '✅ SESSIONE SINCRONIZZATA!\n\n' +
      'La sessione è stata copiata con successo.\n\n' +
      'Per applicare le modifiche, devi ricaricare la pagina.\n\n' +
      'Ricaricare ora?'
    )
    
    if (reload) {
      window.location.reload()
    }
  } else {
    window.alert(
      '❌ SINCRONIZZAZIONE FALLITA\n\n' +
      'Non è stata trovata nessuna sessione valida sulle altre porte.\n\n' +
      'Assicurati di essere loggato su almeno una delle porte:\n' +
      `${SUPPORTED_PORTS.join(', ')}`
    )
  }
}

/**
 * Verifica automatica all'avvio dell'app
 * Da chiamare in App.tsx o nel componente principale
 */
export const checkAndAutoLoginOnStartup = async (): Promise<void> => {
  // Solo in development mode
  if (import.meta.env.PROD) {
    return
  }
  
  // Solo se non già loggato
  if (isLoggedInCurrentPort()) {
    return
  }
  
  console.log('🔄 Auto-login multi-host attivo...')
  
  const success = await autoLoginFromOtherPorts()
  
  if (success) {
    console.log('✅ Auto-login completato - ricarica pagina...')
    // Ricarica automaticamente dopo 1 secondo
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }
}

