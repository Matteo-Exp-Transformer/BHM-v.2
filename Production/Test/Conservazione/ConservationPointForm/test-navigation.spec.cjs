/**
 * 🧪 Test Navigazione ConservationPointForm
 * 
 * Test per verificare l'accesso tramite navigazione
 * 
 * @date 2025-01-16
 * @agent Agente-2-Form-Validazioni
 */

const { test, expect } = require('@playwright/test')

test.describe('ConservationPointForm - Test Navigazione', () => {
  test('Verifica accesso tramite menu Conservazione', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3002/sign-in')
    await page.waitForLoadState('networkidle')
    
    await page.fill('input[type="email"]', 'matteo.cavallaro.work@gmail.com')
    await page.fill('input[type="password"]', 'cavallaro')
    await page.click('button[type="submit"]')
    await page.waitForLoadState('networkidle')
    
    // Cerca il link "Conservazione" nel menu
    const conservazioneLink = page.locator('a, button').filter({ hasText: /Conservazione/i }).first()
    await expect(conservazioneLink).toBeVisible()
    
    // Clicca sul link Conservazione
    await conservazioneLink.click()
    await page.waitForLoadState('networkidle')
    
    // Verifica che siamo nella pagina corretta
    const currentUrl = page.url()
    console.log('URL corrente dopo click Conservazione:', currentUrl)
    
    // Verifica che non ci sia più la pagina 404
    const pageContent = await page.textContent('body')
    expect(pageContent).not.toContain('404')
    expect(pageContent).not.toContain('Pagina non trovata')
    
    // Cerca pulsanti per aprire il modal
    const buttons = await page.locator('button').all()
    console.log('Pulsanti trovati nella pagina conservazione:', buttons.length)
    
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent()
      console.log(`Pulsante ${i}: "${text}"`)
    }
    
    // Cerca pulsanti che potrebbero aprire il modal per creare un punto di conservazione
    const createButtons = await page.locator('button').filter({ hasText: /nuovo|crea|aggiungi|add/i }).all()
    console.log('Pulsanti creazione trovati:', createButtons.length)
    
    if (createButtons.length > 0) {
      console.log('Trovato pulsante per creare punto di conservazione!')
      await createButtons[0].click()
      await page.waitForLoadState('networkidle')
      
      // Verifica che il modal sia aperto
      const modal = page.locator('[role="dialog"], .modal, .fixed')
      await expect(modal).toBeVisible()
      
      console.log('Modal aperto con successo!')
    }
  })

  test('Verifica tutte le route disponibili', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3002/sign-in')
    await page.waitForLoadState('networkidle')
    
    await page.fill('input[type="email"]', 'matteo.cavallaro.work@gmail.com')
    await page.fill('input[type="password"]', 'cavallaro')
    await page.click('button[type="submit"]')
    await page.waitForLoadState('networkidle')
    
    // Prova diverse route per la conservazione
    const routes = [
      '/conservation',
      '/conservation-points',
      '/conservation-point',
      '/temperature',
      '/temperatures',
      '/conservation-management'
    ]
    
    for (const route of routes) {
      console.log(`Testando route: ${route}`)
      await page.goto(`http://localhost:3002${route}`)
      await page.waitForLoadState('networkidle')
      
      const pageContent = await page.textContent('body')
      const is404 = pageContent.includes('404') || pageContent.includes('Pagina non trovata')
      
      console.log(`Route ${route}: ${is404 ? '404' : 'OK'}`)
      
      if (!is404) {
        console.log(`✅ Route funzionante trovata: ${route}`)
        break
      }
    }
  })
})
