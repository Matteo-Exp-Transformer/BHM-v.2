/**
 * 🧪 Test Finale ConservationPointForm
 * 
 * Test finale per trovare il form di conservazione
 * 
 * @date 2025-01-16
 * @agent Agente-2-Form-Validazioni
 */

const { test, expect } = require('@playwright/test')

test.describe('ConservationPointForm - Test Finale', () => {
  test('Verifica pulsante Conservazione nel menu', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3002/sign-in')
    await page.waitForLoadState('networkidle')
    
    await page.fill('input[type="email"]', 'matteo.cavallaro.work@gmail.com')
    await page.fill('input[type="password"]', 'cavallaro')
    await page.click('button[type="submit"]')
    await page.waitForLoadState('networkidle')
    
    // Verifica che siamo nella dashboard
    await expect(page).toHaveURL(/dashboard/)
    
    // Cerca il pulsante "Conservazione" nel menu (non nella dashboard)
    const menuConservazione = page.locator('button, a').filter({ hasText: /Conservazione/i }).first()
    await expect(menuConservazione).toBeVisible()
    
    console.log('✅ Pulsante "Conservazione" nel menu trovato!')
    
    // Clicca sul pulsante
    await menuConservazione.click()
    await page.waitForLoadState('networkidle')
    
    console.log('URL dopo click Conservazione:', page.url())
    
    // Verifica che siamo nella pagina di conservazione
    const pageContent = await page.textContent('body')
    expect(pageContent).toContain('Sistema di Conservazione')
    
    console.log('✅ Pagina conservazione caricata correttamente!')
    
    // Cerca tutti i pulsanti nella pagina di conservazione
    const allButtons = await page.locator('button, a').all()
    console.log(`Pulsanti nella pagina conservazione: ${allButtons.length}`)
    
    for (let i = 0; i < allButtons.length; i++) {
      const text = await allButtons[i].textContent()
      const tagName = await allButtons[i].evaluate(el => el.tagName)
      console.log(`${tagName} ${i}: "${text}"`)
    }
    
    // Cerca pulsanti che potrebbero aprire il form
    const formButtons = await page.locator('button, a').filter({ hasText: /nuovo|crea|aggiungi|add|punto|temperatura/i }).all()
    console.log(`\nPulsanti form trovati: ${formButtons.length}`)
    
    for (let i = 0; i < formButtons.length; i++) {
      const text = await formButtons[i].textContent()
      console.log(`Pulsante form ${i}: "${text}"`)
    }
    
    // Se trova pulsanti form, prova a cliccare sul primo
    if (formButtons.length > 0) {
      console.log('🎯 Tentativo di aprire il form...')
      await formButtons[0].click()
      await page.waitForLoadState('networkidle')
      
      // Verifica se si è aperto un modal o form
      const modals = await page.locator('[role="dialog"], .modal, .fixed').all()
      const forms = await page.locator('form').all()
      
      console.log(`Modal aperti: ${modals.length}`)
      console.log(`Form trovati: ${forms.length}`)
      
      if (modals.length > 0 || forms.length > 0) {
        console.log('🎉 FORM TROVATO E APERTO!')
        
        // Analizza gli input del form
        const inputs = await page.locator('input').all()
        console.log(`Input nel form: ${inputs.length}`)
        
        for (let i = 0; i < inputs.length; i++) {
          const type = await inputs[i].getAttribute('type')
          const placeholder = await inputs[i].getAttribute('placeholder')
          const name = await inputs[i].getAttribute('name')
          console.log(`Input ${i}: type="${type}" placeholder="${placeholder}" name="${name}"`)
        }
      }
    }
  })

  test('Verifica se il form è implementato', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3002/sign-in')
    await page.waitForLoadState('networkidle')
    
    await page.fill('input[type="email"]', 'matteo.cavallaro.work@gmail.com')
    await page.fill('input[type="password"]', 'cavallaro')
    await page.click('button[type="submit"]')
    await page.waitForLoadState('networkidle')
    
    // Naviga alla pagina di conservazione
    await page.goto('http://localhost:3002/conservazione')
    await page.waitForLoadState('networkidle')
    
    // Prendi screenshot della pagina
    await page.screenshot({ path: 'conservazione-final.png', fullPage: true })
    
    // Analizza il contenuto completo
    const pageContent = await page.textContent('body')
    console.log('Contenuto completo pagina conservazione:')
    console.log(pageContent)
    
    // Verifica se ci sono elementi che indicano che il form non è implementato
    if (pageContent.includes('Non implementato') || pageContent.includes('Coming soon') || pageContent.includes('In sviluppo')) {
      console.log('❌ Il form di conservazione non è ancora implementato')
    } else {
      console.log('✅ Il form di conservazione potrebbe essere implementato')
    }
  })
})
