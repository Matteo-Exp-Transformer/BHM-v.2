/**
 * 🧪 Test Esplorazione ConservationPointForm
 * 
 * Test per esplorare la pagina e trovare il form
 * 
 * @date 2025-01-16
 * @agent Agente-2-Form-Validazioni
 */

const { test, expect } = require('@playwright/test')

test.describe('ConservationPointForm - Esplorazione', () => {
  test('Esplora completamente la pagina conservazione', async ({ page }) => {
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
    await page.screenshot({ path: 'conservazione-page.png', fullPage: true })
    
    // Analizza tutti gli elementi della pagina
    const pageContent = await page.textContent('body')
    console.log('Contenuto completo della pagina:')
    console.log(pageContent)
    
    // Cerca tutti i link e pulsanti
    const allLinks = await page.locator('a').all()
    const allButtons = await page.locator('button').all()
    const allInputs = await page.locator('input').all()
    const allSelects = await page.locator('select').all()
    const allTextareas = await page.locator('textarea').all()
    
    console.log(`\nElementi trovati:`)
    console.log(`- Link: ${allLinks.length}`)
    console.log(`- Pulsanti: ${allButtons.length}`)
    console.log(`- Input: ${allInputs.length}`)
    console.log(`- Select: ${allSelects.length}`)
    console.log(`- Textarea: ${allTextareas.length}`)
    
    // Stampa tutti i link
    console.log('\n--- LINK ---')
    for (let i = 0; i < allLinks.length; i++) {
      const text = await allLinks[i].textContent()
      const href = await allLinks[i].getAttribute('href')
      console.log(`Link ${i}: "${text}" -> ${href}`)
    }
    
    // Stampa tutti i pulsanti
    console.log('\n--- PULSANTI ---')
    for (let i = 0; i < allButtons.length; i++) {
      const text = await allButtons[i].textContent()
      const type = await allButtons[i].getAttribute('type')
      console.log(`Pulsante ${i}: "${text}" (type: ${type})`)
    }
    
    // Stampa tutti gli input
    console.log('\n--- INPUT ---')
    for (let i = 0; i < allInputs.length; i++) {
      const type = await allInputs[i].getAttribute('type')
      const placeholder = await allInputs[i].getAttribute('placeholder')
      const name = await allInputs[i].getAttribute('name')
      console.log(`Input ${i}: type="${type}" placeholder="${placeholder}" name="${name}"`)
    }
    
    // Cerca elementi che potrebbero contenere il form
    const forms = await page.locator('form').all()
    const modals = await page.locator('[role="dialog"], .modal, .fixed').all()
    const cards = await page.locator('.card, [class*="card"]').all()
    
    console.log(`\n--- FORM ELEMENTI ---`)
    console.log(`- Form: ${forms.length}`)
    console.log(`- Modal: ${modals.length}`)
    console.log(`- Card: ${cards.length}`)
    
    // Verifica se ci sono elementi nascosti
    const hiddenElements = await page.locator('[style*="display: none"], [style*="visibility: hidden"], .hidden').all()
    console.log(`- Elementi nascosti: ${hiddenElements.length}`)
    
    // Cerca testo che potrebbe indicare dove si trova il form
    const conservationText = pageContent.toLowerCase()
    if (conservationText.includes('punto') || conservationText.includes('conservazione') || conservationText.includes('temperatura')) {
      console.log('\n✅ Testo relativo alla conservazione trovato nella pagina')
    } else {
      console.log('\n❌ Nessun testo relativo alla conservazione trovato')
    }
  })

  test('Verifica se il form è in una pagina diversa', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3002/sign-in')
    await page.waitForLoadState('networkidle')
    
    await page.fill('input[type="email"]', 'matteo.cavallaro.work@gmail.com')
    await page.fill('input[type="password"]', 'cavallaro')
    await page.click('button[type="submit"]')
    await page.waitForLoadState('networkidle')
    
    // Prova diverse route che potrebbero contenere il form
    const routes = [
      '/conservazione',
      '/conservazione/nuovo',
      '/conservazione/create',
      '/conservazione/add',
      '/conservation-points',
      '/conservation-points/create',
      '/conservation-points/new',
      '/temperature-management',
      '/temperature-management/create'
    ]
    
    for (const route of routes) {
      console.log(`\nTestando route: ${route}`)
      await page.goto(`http://localhost:3002${route}`)
      await page.waitForLoadState('networkidle')
      
      const pageContent = await page.textContent('body')
      const is404 = pageContent.includes('404') || pageContent.includes('Pagina non trovata')
      
      if (!is404) {
        console.log(`✅ Route funzionante: ${route}`)
        
        // Cerca form in questa pagina
        const forms = await page.locator('form').all()
        const inputs = await page.locator('input').all()
        
        if (forms.length > 0 || inputs.length > 0) {
          console.log(`🎯 Form trovato in ${route}!`)
          console.log(`- Form: ${forms.length}`)
          console.log(`- Input: ${inputs.length}`)
          
          // Prendi screenshot
          await page.screenshot({ path: `form-found-${route.replace(/\//g, '-')}.png`, fullPage: true })
        }
      } else {
        console.log(`❌ Route 404: ${route}`)
      }
    }
  })
})
