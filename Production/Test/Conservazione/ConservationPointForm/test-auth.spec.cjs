/**
 * 🧪 Test Autenticazione per ConservationPointForm
 * 
 * Test per verificare l'accesso alla pagina di conservazione
 * 
 * @date 2025-01-16
 * @agent Agente-2-Form-Validazioni
 */

const { test, expect } = require('@playwright/test')

test.describe('ConservationPointForm - Test Autenticazione', () => {
  test('Verifica login e accesso alla pagina conservazione', async ({ page }) => {
    // Naviga alla pagina di login
    await page.goto('http://localhost:3002/sign-in')
    
    // Attendi che la pagina sia caricata
    await page.waitForLoadState('networkidle')
    
    // Verifica che siamo nella pagina di login
    await expect(page).toHaveTitle(/HACCP Business Manager/)
    
    // Compila il form di login
    await page.fill('input[type="email"]', 'matteo.cavallaro.work@gmail.com')
    await page.fill('input[type="password"]', 'cavallaro')
    
    // Clicca sul pulsante di login
    await page.click('button[type="submit"]')
    
    // Attendi il redirect
    await page.waitForLoadState('networkidle')
    
    // Verifica che siamo stati reindirizzati alla dashboard
    await expect(page).toHaveURL(/dashboard/)
    
    // Ora prova ad accedere alla pagina di conservazione
    await page.goto('http://localhost:3002/conservation')
    await page.waitForLoadState('networkidle')
    
    // Verifica che la pagina di conservazione sia caricata correttamente
    const pageContent = await page.textContent('body')
    expect(pageContent).not.toContain('404')
    expect(pageContent).not.toContain('Pagina non trovata')
    
    // Cerca pulsanti per aprire il modal
    const buttons = await page.locator('button').all()
    console.log('Pulsanti trovati dopo login:', buttons.length)
    
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent()
      console.log(`Pulsante ${i}: "${text}"`)
    }
  })

  test('Verifica navigazione tramite menu', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3002/sign-in')
    await page.waitForLoadState('networkidle')
    
    await page.fill('input[type="email"]', 'matteo.cavallaro.work@gmail.com')
    await page.fill('input[type="password"]', 'cavallaro')
    await page.click('button[type="submit"]')
    await page.waitForLoadState('networkidle')
    
    // Cerca il menu di navigazione
    const navElements = await page.locator('nav, [role="navigation"], .navigation').all()
    console.log('Elementi di navigazione trovati:', navElements.length)
    
    // Cerca link o pulsanti per la conservazione
    const conservationLinks = await page.locator('a, button').filter({ hasText: /conservazione|conservation/i }).all()
    console.log('Link conservazione trovati:', conservationLinks.length)
    
    if (conservationLinks.length > 0) {
      await conservationLinks[0].click()
      await page.waitForLoadState('networkidle')
      
      // Verifica che siamo nella pagina corretta
      const currentUrl = page.url()
      console.log('URL corrente:', currentUrl)
    }
  })
})
