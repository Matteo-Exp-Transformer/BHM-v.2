/**
 * 🧪 Test Accesso Form ConservationPointForm
 * 
 * Test per trovare il modo corretto di accedere al form
 * 
 * @date 2025-01-16
 * @agent Agente-2-Form-Validazioni
 */

const { test, expect } = require('@playwright/test')

test.describe('ConservationPointForm - Accesso Form', () => {
  test('Verifica pulsante "Registra Temperatura" nella dashboard', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3002/sign-in')
    await page.waitForLoadState('networkidle')
    
    await page.fill('input[type="email"]', 'matteo.cavallaro.work@gmail.com')
    await page.fill('input[type="password"]', 'cavallaro')
    await page.click('button[type="submit"]')
    await page.waitForLoadState('networkidle')
    
    // Verifica che siamo nella dashboard
    await expect(page).toHaveURL(/dashboard/)
    
    // Cerca il pulsante "Registra Temperatura"
    const temperaturaButton = page.locator('button, a').filter({ hasText: /Registra Temperatura|temperatura/i })
    await expect(temperaturaButton).toBeVisible()
    
    console.log('✅ Pulsante "Registra Temperatura" trovato!')
    
    // Clicca sul pulsante
    await temperaturaButton.click()
    await page.waitForLoadState('networkidle')
    
    console.log('URL dopo click:', page.url())
    
    // Verifica che siamo in una pagina con form
    const forms = await page.locator('form').all()
    const inputs = await page.locator('input').all()
    
    console.log(`Form trovati: ${forms.length}`)
    console.log(`Input trovati: ${inputs.length}`)
    
    if (forms.length > 0) {
      console.log('🎯 Form trovato dopo click "Registra Temperatura"!')
      
      // Analizza gli input
      for (let i = 0; i < inputs.length; i++) {
        const type = await inputs[i].getAttribute('type')
        const placeholder = await inputs[i].getAttribute('placeholder')
        const name = await inputs[i].getAttribute('name')
        console.log(`Input ${i}: type="${type}" placeholder="${placeholder}" name="${name}"`)
      }
    }
  })

  test('Verifica tutti i pulsanti nella dashboard', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3002/sign-in')
    await page.waitForLoadState('networkidle')
    
    await page.fill('input[type="email"]', 'matteo.cavallaro.work@gmail.com')
    await page.fill('input[type="password"]', 'cavallaro')
    await page.click('button[type="submit"]')
    await page.waitForLoadState('networkidle')
    
    // Verifica che siamo nella dashboard
    await expect(page).toHaveURL(/dashboard/)
    
    // Cerca tutti i pulsanti nella dashboard
    const allButtons = await page.locator('button, a').all()
    console.log(`Pulsanti totali nella dashboard: ${allButtons.length}`)
    
    // Stampa tutti i pulsanti
    for (let i = 0; i < allButtons.length; i++) {
      const text = await allButtons[i].textContent()
      const tagName = await allButtons[i].evaluate(el => el.tagName)
      console.log(`${tagName} ${i}: "${text}"`)
    }
    
    // Cerca pulsanti che potrebbero aprire il form di conservazione
    const conservationButtons = await page.locator('button, a').filter({ hasText: /conservazione|temperatura|punto|nuovo|crea|aggiungi/i }).all()
    console.log(`\nPulsanti conservazione trovati: ${conservationButtons.length}`)
    
    for (let i = 0; i < conservationButtons.length; i++) {
      const text = await conservationButtons[i].textContent()
      console.log(`Pulsante conservazione ${i}: "${text}"`)
    }
  })

  test('Verifica sezione "Punti Conservazione" nella dashboard', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3002/sign-in')
    await page.waitForLoadState('networkidle')
    
    await page.fill('input[type="email"]', 'matteo.cavallaro.work@gmail.com')
    await page.fill('input[type="password"]', 'cavallaro')
    await page.click('button[type="submit"]')
    await page.waitForLoadState('networkidle')
    
    // Verifica che siamo nella dashboard
    await expect(page).toHaveURL(/dashboard/)
    
    // Cerca la sezione "Punti Conservazione"
    const puntiConservazione = page.locator('*').filter({ hasText: /Punti Conservazione/i })
    await expect(puntiConservazione).toBeVisible()
    
    console.log('✅ Sezione "Punti Conservazione" trovata!')
    
    // Cerca pulsanti o link nella sezione
    const sectionButtons = puntiConservazione.locator('button, a').all()
    const buttons = await sectionButtons
    
    console.log(`Pulsanti nella sezione Punti Conservazione: ${buttons.length}`)
    
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent()
      console.log(`Pulsante sezione ${i}: "${text}"`)
    }
  })
})
