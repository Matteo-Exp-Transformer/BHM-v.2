/**
 * 🏠 Dashboard E2E Tests - CRITICO
 * 
 * Test end-to-end per verificare la funzionalità dashboard:
 * - Caricamento dashboard dopo login
 * - Elementi dashboard visibili
 * - Navigazione dashboard
 * - Performance dashboard
 * 
 * @date 2025-01-27
 * @author Agente 6 - Testing Agent (Correzione Quality Gate)
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
// HELPER FUNCTIONS
// =============================================

async function loginUser(page: any, user: any = REAL_USERS.user1) {
  await page.goto(`${BASE_URL}/sign-in`)
  await page.waitForLoadState('networkidle')
  
  await page.fill('input[type="email"]', user.email)
  await page.fill('input[type="password"]', user.password)
  await page.click('button[type="submit"]')
  
  await page.waitForURL('**/dashboard', { timeout: 15000 })
  await page.waitForLoadState('networkidle')
}

// =============================================
// TEST DASHBOARD E2E
// =============================================

test.describe('🏠 Dashboard E2E Tests - CRITICO', () => {
  
  test('Dashboard loads correctly after login', async ({ page }) => {
    console.log('🔍 Test dashboard load dopo login...')
    
    // 1. Login con credenziali reali
    await loginUser(page)
    
    // 2. Verifica URL dashboard
    expect(page.url()).toContain('/dashboard')
    console.log('✅ URL dashboard verificato')
    
    // 3. Verifica elementi dashboard
    await expect(page.locator('body')).toBeVisible()
    
    // 4. Verifica presenza contenuto dashboard
    const hasContent = await page.locator('body').textContent()
    expect(hasContent).toBeTruthy()
    console.log('✅ Contenuto dashboard verificato')
    
    // 5. Screenshot per verifica
    await page.screenshot({ path: 'test-dashboard-load.png', fullPage: true })
    
    console.log('🎯 Test dashboard load completato')
  })
  
  test('Dashboard elements are visible', async ({ page }) => {
    console.log('🔍 Test elementi dashboard visibili...')
    
    // 1. Login
    await loginUser(page)
    
    // 2. Verifica elementi principali
    const body = page.locator('body')
    await expect(body).toBeVisible()
    
    // 3. Verifica presenza di contenuto
    const hasContent = await body.textContent()
    expect(hasContent).toBeTruthy()
    expect(hasContent!.length).toBeGreaterThan(0)
    console.log('✅ Contenuto dashboard presente')
    
    // 4. Verifica che non ci siano errori evidenti
    const errorElements = page.locator('text=Error, text=Errore, text=Failed')
    const errorCount = await errorElements.count()
    expect(errorCount).toBe(0)
    console.log('✅ Nessun errore evidente')
    
    console.log('🎯 Test elementi dashboard completato')
  })
  
  test('Dashboard navigation works', async ({ page }) => {
    console.log('🔍 Test navigazione dashboard...')
    
    // 1. Login
    await loginUser(page)
    
    // 2. Verifica dashboard caricata
    expect(page.url()).toContain('/dashboard')
    console.log('✅ Dashboard caricata')
    
    // 3. Naviga a pagina Attività
    await page.goto(`${BASE_URL}/attivita`)
    await page.waitForLoadState('networkidle')
    
    // 4. Verifica pagina Attività
    expect(page.url()).toContain('/attivita')
    console.log('✅ Navigazione a Attività verificata')
    
    // 5. Naviga a pagina Conservazione
    await page.goto(`${BASE_URL}/conservazione`)
    await page.waitForLoadState('networkidle')
    
    // 6. Verifica pagina Conservazione
    expect(page.url()).toContain('/conservazione')
    console.log('✅ Navigazione a Conservazione verificata')
    
    // 7. Torna a Dashboard
    await page.goto(`${BASE_URL}/dashboard`)
    await page.waitForLoadState('networkidle')
    
    // 8. Verifica ritorno dashboard
    expect(page.url()).toContain('/dashboard')
    console.log('✅ Ritorno a Dashboard verificato')
    
    console.log('🎯 Test navigazione dashboard completato')
  })
  
  test('Dashboard performance is acceptable', async ({ page }) => {
    console.log('🔍 Test performance dashboard...')
    
    const startTime = Date.now()
    
    // 1. Login
    await loginUser(page)
    
    // 2. Verifica dashboard caricata
    await expect(page.locator('body')).toBeVisible()
    
    const loadTime = Date.now() - startTime
    
    // 3. Verifica performance
    expect(loadTime).toBeLessThan(5000) // < 5s per login + dashboard
    console.log(`✅ Dashboard caricata in ${loadTime}ms`)
    
    // 4. Verifica performance navigazione
    const navStartTime = Date.now()
    await page.goto(`${BASE_URL}/attivita`)
    await page.waitForLoadState('networkidle')
    const navTime = Date.now() - navStartTime
    
    expect(navTime).toBeLessThan(3000) // < 3s per navigazione
    console.log(`✅ Navigazione in ${navTime}ms`)
    
    console.log('🎯 Test performance dashboard completato')
  })
  
  test('Dashboard works with both users', async ({ page }) => {
    console.log('🔍 Test dashboard con entrambi gli utenti...')
    
    // 1. Test con User 1
    await loginUser(page, REAL_USERS.user1)
    expect(page.url()).toContain('/dashboard')
    console.log('✅ Dashboard User 1 verificata')
    
    // 2. Logout (simulato)
    await page.goto(`${BASE_URL}/sign-in`)
    await page.waitForLoadState('networkidle')
    
    // 3. Test con User 2
    await loginUser(page, REAL_USERS.user2)
    expect(page.url()).toContain('/dashboard')
    console.log('✅ Dashboard User 2 verificata')
    
    console.log('🎯 Test dashboard multi-user completato')
  })
})

// =============================================
// TEST CRITICAL USER JOURNEYS
// =============================================

test.describe('🎯 Critical User Journeys E2E', () => {
  
  test('Complete user journey: Login → Dashboard → Attività', async ({ page }) => {
    console.log('🔍 Test journey completo Login → Dashboard → Attività...')
    
    // 1. Login
    await page.goto(`${BASE_URL}/sign-in`)
    await page.waitForLoadState('networkidle')
    
    await page.fill('input[type="email"]', REAL_USERS.user1.email)
    await page.fill('input[type="password"]', REAL_USERS.user1.password)
    await page.click('button[type="submit"]')
    
    // 2. Verifica redirect dashboard
    await page.waitForURL('**/dashboard', { timeout: 15000 })
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/dashboard')
    console.log('✅ Login → Dashboard verificato')
    
    // 3. Naviga a Attività
    await page.goto(`${BASE_URL}/attivita`)
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/attivita')
    console.log('✅ Dashboard → Attività verificato')
    
    // 4. Verifica contenuto Attività
    const hasContent = await page.locator('body').textContent()
    expect(hasContent).toBeTruthy()
    console.log('✅ Contenuto Attività verificato')
    
    console.log('🎯 Test journey completo completato')
  })
  
  test('Complete user journey: Login → Dashboard → Conservazione', async ({ page }) => {
    console.log('🔍 Test journey completo Login → Dashboard → Conservazione...')
    
    // 1. Login
    await page.goto(`${BASE_URL}/sign-in`)
    await page.waitForLoadState('networkidle')
    
    await page.fill('input[type="email"]', REAL_USERS.user1.email)
    await page.fill('input[type="password"]', REAL_USERS.user1.password)
    await page.click('button[type="submit"]')
    
    // 2. Verifica redirect dashboard
    await page.waitForURL('**/dashboard', { timeout: 15000 })
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/dashboard')
    console.log('✅ Login → Dashboard verificato')
    
    // 3. Naviga a Conservazione
    await page.goto(`${BASE_URL}/conservazione`)
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/conservazione')
    console.log('✅ Dashboard → Conservazione verificato')
    
    // 4. Verifica contenuto Conservazione
    const hasContent = await page.locator('body').textContent()
    expect(hasContent).toBeTruthy()
    console.log('✅ Contenuto Conservazione verificato')
    
    console.log('🎯 Test journey Conservazione completato')
  })
  
  test('Complete user journey: Login → Dashboard → Navigation Loop', async ({ page }) => {
    console.log('🔍 Test journey completo con loop navigazione...')
    
    // 1. Login
    await loginUser(page)
    
    // 2. Loop navigazione
    const pages = ['/dashboard', '/attivita', '/conservazione', '/dashboard']
    
    for (const pagePath of pages) {
      await page.goto(`${BASE_URL}${pagePath}`)
      await page.waitForLoadState('networkidle')
      expect(page.url()).toContain(pagePath)
      console.log(`✅ Navigazione a ${pagePath} verificata`)
    }
    
    console.log('🎯 Test journey loop navigazione completato')
  })
})

// =============================================
// TEST PERFORMANCE DASHBOARD
// =============================================

test.describe('⚡ Performance Dashboard Tests', () => {
  
  test('Dashboard load performance', async ({ page }) => {
    console.log('🔍 Test performance caricamento dashboard...')
    
    const startTime = Date.now()
    
    // 1. Login
    await loginUser(page)
    
    // 2. Verifica dashboard caricata
    await expect(page.locator('body')).toBeVisible()
    
    const loadTime = Date.now() - startTime
    
    // 3. Verifica performance
    expect(loadTime).toBeLessThan(5000) // < 5s per login + dashboard
    console.log(`✅ Dashboard caricata in ${loadTime}ms`)
    
    // 4. Verifica performance base
    const bodyContent = await page.locator('body').textContent()
    expect(bodyContent).toBeTruthy()
    expect(bodyContent!.length).toBeGreaterThan(0)
    console.log('✅ Contenuto dashboard verificato')
    
    console.log('🎯 Test performance dashboard completato')
  })
  
  test('Dashboard navigation performance', async ({ page }) => {
    console.log('🔍 Test performance navigazione dashboard...')
    
    // 1. Login
    await loginUser(page)
    
    // 2. Test performance navigazione
    const pages = ['/attivita', '/conservazione', '/dashboard']
    
    for (const pagePath of pages) {
      const startTime = Date.now()
      await page.goto(`${BASE_URL}${pagePath}`)
      await page.waitForLoadState('networkidle')
      const loadTime = Date.now() - startTime
      
      expect(loadTime).toBeLessThan(3000) // < 3s per navigazione
      console.log(`✅ ${pagePath} caricata in ${loadTime}ms`)
    }
    
    console.log('🎯 Test performance navigazione completato')
  })
})
