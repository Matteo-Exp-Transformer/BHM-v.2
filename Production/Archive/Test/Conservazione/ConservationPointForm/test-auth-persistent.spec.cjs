/**
 * 🧪 Test Autenticazione Persistente ConservationPointForm
 * 
 * Test per verificare l'autenticazione persistente
 * 
 * @date 2025-01-16
 * @agent Agente-2-Form-Validazioni
 */

const { test, expect } = require('@playwright/test')

test.describe('ConservationPointForm - Autenticazione Persistente', () => {
  test('Verifica autenticazione persistente e accesso alla conservazione', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3002/sign-in')
    await page.waitForLoadState('networkidle')
    
    await page.fill('input[type="email"]', 'matteo.cavallaro.work@gmail.com')
    await page.fill('input[type="password"]', 'cavallaro')
    await page.click('button[type="submit"]')
    
    // Attendi il redirect e verifica che siamo nella dashboard
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL(/dashboard/)
    
    console.log('✅ Login completato, URL corrente:', page.url())
    
    // Verifica che l'utente sia autenticato controllando la presenza di elementi della dashboard
    const dashboardContent = await page.textContent('body')
    console.log('Contenuto dashboard:', dashboardContent.substring(0, 200) + '...')
    
    // Ora prova ad accedere alla pagina di conservazione
    await page.goto('http://localhost:3002/conservazione')
    await page.waitForLoadState('networkidle')
    
    const conservationContent = await page.textContent('body')
    console.log('Contenuto conservazione:', conservationContent.substring(0, 200) + '...')
    
    // Verifica che non siamo più nella pagina di login
    expect(conservationContent).not.toContain('Accedi al Sistema')
    expect(conservationContent).not.toContain('Email')
    expect(conservationContent).not.toContain('Password')
    
    // Verifica che siamo nella pagina di conservazione
    expect(conservationContent).toContain('conservazione')
    
    // Cerca il form di conservazione
    const forms = await page.locator('form').all()
    const inputs = await page.locator('input').all()
    
    console.log(`Form trovati: ${forms.length}`)
    console.log(`Input trovati: ${inputs.length}`)
    
    if (forms.length > 0) {
      console.log('🎯 Form di conservazione trovato!')
      
      // Analizza gli input del form
      for (let i = 0; i < inputs.length; i++) {
        const type = await inputs[i].getAttribute('type')
        const placeholder = await inputs[i].getAttribute('placeholder')
        const name = await inputs[i].getAttribute('name')
        console.log(`Input ${i}: type="${type}" placeholder="${placeholder}" name="${name}"`)
      }
    }
  })

  test('Verifica navigazione tramite menu dopo login', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3002/sign-in')
    await page.waitForLoadState('networkidle')
    
    await page.fill('input[type="email"]', 'matteo.cavallaro.work@gmail.com')
    await page.fill('input[type="password"]', 'cavallaro')
    await page.click('button[type="submit"]')
    await page.waitForLoadState('networkidle')
    
    // Verifica che siamo nella dashboard
    await expect(page).toHaveURL(/dashboard/)
    
    // Cerca il menu di navigazione
    const navElements = await page.locator('nav, [role="navigation"], .navigation, header').all()
    console.log(`Elementi di navigazione trovati: ${navElements.length}`)
    
    // Cerca link per la conservazione
    const conservazioneLinks = await page.locator('a, button').filter({ hasText: /conservazione|conservation/i }).all()
    console.log(`Link conservazione trovati: ${conservazioneLinks.length}`)
    
    if (conservazioneLinks.length > 0) {
      console.log('🎯 Link conservazione trovato nel menu!')
      await conservazioneLinks[0].click()
      await page.waitForLoadState('networkidle')
      
      console.log('URL dopo click conservazione:', page.url())
      
      // Verifica che siamo nella pagina di conservazione
      const pageContent = await page.textContent('body')
      expect(pageContent).not.toContain('Accedi al Sistema')
      expect(pageContent).toContain('conservazione')
      
      // Cerca il form
      const forms = await page.locator('form').all()
      if (forms.length > 0) {
        console.log('✅ Form di conservazione accessibile tramite menu!')
      }
    } else {
      console.log('❌ Nessun link conservazione trovato nel menu')
      
      // Stampa tutti i link disponibili
      const allLinks = await page.locator('a').all()
      console.log('Tutti i link disponibili:')
      for (let i = 0; i < allLinks.length; i++) {
        const text = await allLinks[i].textContent()
        const href = await allLinks[i].getAttribute('href')
        console.log(`- "${text}" -> ${href}`)
      }
    }
  })
})
