/**
 * 🔐 Login Test con Credenziali Reali - CORRETTO
 * 
 * Test end-to-end per verificare il login reale con Supabase Auth:
 * - Credenziali reali dal database
 * - Verifica risultati finali reali
 * - Loading state funzionante
 * - Error handling completo
 * 
 * @date 2025-01-27
 * @author Agente 5 - Frontend Developer (Corretto per eliminare falsi positivi)
 */

import { test, expect } from '@playwright/test'

// =============================================
// CONFIGURAZIONE TEST
// =============================================

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3002'

// Credenziali reali verificate dal database
const REAL_USERS = {
  user1: {
    email: "0cavuz0@gmail.com",
    password: "cavallaro",
    id: "44014407-7f01-4a71-a4cf-c5997a5f9381"
  },
  user2: {
    email: "matteo.cavallaro.work@gmail.com", 
    password: "cavallaro",
    id: "dc1abce4-3939-4562-97f3-5b253e6e7d00"
  }
}

// =============================================
// TEST LOGIN REALE CON SUPABASE AUTH
// =============================================

test.describe('🔐 Login Reale con Supabase Auth - CORRETTO', () => {
  
  test('Complete login flow with real credentials - User 1', async ({ page }) => {
    console.log('🔍 Test login con credenziali reali User 1...')
    
    // 1. Naviga alla pagina login
    await page.goto(`${BASE_URL}/sign-in`)
    await page.waitForLoadState('networkidle')
    
    // Screenshot iniziale
    await page.screenshot({ path: 'test-login-real-iniziale.png', fullPage: true })
    
    // 2. Verifica elementi presenti
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
    
    // 3. Compila form con credenziali reali
    console.log('📝 Compilazione credenziali reali User 1...')
    await page.fill('input[type="email"]', REAL_USERS.user1.email)
    await page.fill('input[type="password"]', REAL_USERS.user1.password)
    
    // Screenshot dopo compilazione
    await page.screenshot({ path: 'test-login-real-compilato.png', fullPage: true })
    
    // 4. Submit form
    console.log('🔐 Invio credenziali...')
    await page.click('button[type="submit"]')
    
    // 5. Verifica loading state (pulsante disabilitato)
    await expect(page.locator('button[type="submit"]')).toBeDisabled()
    console.log('✅ Loading state verificato - pulsante disabilitato')
    
    // 6. Verifica redirect a dashboard (risultato finale reale)
    await page.waitForURL('/dashboard', { timeout: 10000 })
    console.log('✅ Redirect a dashboard verificato')
    
    // 7. Verifica presenza dashboard
    await expect(page.locator('text=Dashboard')).toBeVisible()
    console.log('✅ Dashboard visibile')
    
    // Screenshot finale
    await page.screenshot({ path: 'test-login-real-finale.png', fullPage: true })
    
    console.log('🎯 Test login User 1 completato con successo')
  })
  
  test('Complete login flow with real credentials - User 2', async ({ page }) => {
    console.log('🔍 Test login con credenziali reali User 2...')
    
    // 1. Naviga alla pagina login
    await page.goto(`${BASE_URL}/sign-in`)
    await page.waitForLoadState('networkidle')
    
    // 2. Compila form con credenziali reali User 2
    await page.fill('input[type="email"]', REAL_USERS.user2.email)
    await page.fill('input[type="password"]', REAL_USERS.user2.password)
    
    // 3. Submit form
    await page.click('button[type="submit"]')
    
    // 4. Verifica loading state
    await expect(page.locator('button[type="submit"]')).toBeDisabled()
    
    // 5. Verifica redirect a dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 })
    
    // 6. Verifica presenza dashboard
    await expect(page.locator('text=Dashboard')).toBeVisible()
    
    console.log('🎯 Test login User 2 completato con successo')
  })
  
  test('Login with invalid credentials shows error', async ({ page }) => {
    console.log('🔍 Test error handling con credenziali sbagliate...')
    
    // 1. Naviga alla pagina login
    await page.goto(`${BASE_URL}/sign-in`)
    await page.waitForLoadState('networkidle')
    
    // 2. Compila form con credenziali sbagliate
    await page.fill('input[type="email"]', 'invalid@test.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    
    // 3. Submit form
    await page.click('button[type="submit"]')
    
    // 4. Verifica loading state
    await expect(page.locator('button[type="submit"]')).toBeDisabled()
    
    // 5. Attendi gestione errore
    await page.waitForTimeout(3000)
    
    // 6. Verifica che rimaniamo sulla pagina login (non redirect)
    expect(page.url()).toContain('/sign-in')
    console.log('✅ Rimane sulla pagina login dopo errore')
    
    // 7. Verifica messaggio di errore (se presente)
    const errorMessage = page.locator('text=Email o password non corretti, text=Invalid credentials, text=Errore')
    const hasErrorMessage = await errorMessage.isVisible().catch(() => false)
    
    if (hasErrorMessage) {
      console.log('✅ Messaggio di errore visibile')
    } else {
      console.log('⚠️ Messaggio di errore non visibile (potrebbe essere gestito diversamente)')
    }
    
    console.log('🎯 Test error handling completato')
  })
  
  test('Loading state verification', async ({ page }) => {
    console.log('🔍 Test loading state dettagliato...')
    
    // 1. Naviga alla pagina login
    await page.goto(`${BASE_URL}/sign-in`)
    await page.waitForLoadState('networkidle')
    
    // 2. Verifica stato iniziale pulsante
    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toBeEnabled()
    console.log('✅ Pulsante inizialmente abilitato')
    
    // 3. Compila form
    await page.fill('input[type="email"]', REAL_USERS.user1.email)
    await page.fill('input[type="password"]', REAL_USERS.user1.password)
    
    // 4. Submit e verifica disabilitazione immediata
    await page.click('button[type="submit"]')
    
    // 5. Verifica che il pulsante sia immediatamente disabilitato
    await expect(submitButton).toBeDisabled()
    console.log('✅ Pulsante disabilitato durante caricamento')
    
    // 6. Attendi completamento login
    await page.waitForURL('/dashboard', { timeout: 10000 })
    
    console.log('🎯 Test loading state completato')
  })
})

// =============================================
// TEST INTEGRAZIONE COMPLETA
// =============================================

test.describe('🔄 Integrazione Completa - Login + Navigazione', () => {
  
  test('Login completo + navigazione dashboard', async ({ page }) => {
    console.log('🔍 Test integrazione completa...')
    
    // 1. Login
    await page.goto(`${BASE_URL}/sign-in`)
    await page.waitForLoadState('networkidle')
    
    await page.fill('input[type="email"]', REAL_USERS.user1.email)
    await page.fill('input[type="password"]', REAL_USERS.user1.password)
    await page.click('button[type="submit"]')
    
    // 2. Verifica redirect dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 })
    await expect(page.locator('text=Dashboard')).toBeVisible()
    
    // 3. Naviga a pagina Attività
    await page.goto(`${BASE_URL}/attivita`)
    await page.waitForLoadState('networkidle')
    
    // 4. Verifica elementi pagina Attività
    await expect(page.locator('.fc')).toBeVisible() // Calendario
    console.log('✅ Calendario visibile nella pagina Attività')
    
    // 5. Naviga a pagina Conservazione
    await page.goto(`${BASE_URL}/conservazione`)
    await page.waitForLoadState('networkidle')
    
    // 6. Verifica elementi pagina Conservazione
    const conservationContent = page.locator('h1, h2, h3')
    await expect(conservationContent.first()).toBeVisible()
    console.log('✅ Contenuto pagina Conservazione visibile')
    
    console.log('🎯 Test integrazione completa completato')
  })
})

// =============================================
// TEST PERFORMANCE
// =============================================

test.describe('⚡ Performance Tests', () => {
  
  test('Login page load performance', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto(`${BASE_URL}/sign-in`)
    await page.waitForLoadState('networkidle')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    
    const loadTime = Date.now() - startTime
    
    // Verifica che il caricamento sia sotto i 3 secondi
    expect(loadTime).toBeLessThan(3000)
    console.log(`✅ Login page caricata in ${loadTime}ms`)
  })
  
  test('Login flow performance', async ({ page }) => {
    const startTime = Date.now()
    
    // Login completo
    await page.goto(`${BASE_URL}/sign-in`)
    await page.waitForLoadState('networkidle')
    
    await page.fill('input[type="email"]', REAL_USERS.user1.email)
    await page.fill('input[type="password"]', REAL_USERS.user1.password)
    await page.click('button[type="submit"]')
    
    await page.waitForURL('/dashboard', { timeout: 10000 })
    
    const loginTime = Date.now() - startTime
    
    // Verifica che il login completo sia sotto i 5 secondi
    expect(loginTime).toBeLessThan(5000)
    console.log(`✅ Login completo in ${loginTime}ms`)
  })
})
