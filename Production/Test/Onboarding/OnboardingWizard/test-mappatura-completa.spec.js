import { test, expect } from '@playwright/test'

test.describe('Mappatura Completa Onboarding Steps', () => {
  
  test('Mappatura Step 1 - BusinessInfoStep', async ({ page }) => {
    // Login automatico
    await page.goto('/sign-in')
    await page.fill('input[type="email"]', 'matteo.cavallaro.work@gmail.com')
    await page.fill('input[type="password"]', 'cavallaro')
    await page.click('button:has-text("Accedi")')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    // Reset onboarding per test pulito
    await page.evaluate(() => {
      localStorage.removeItem('onboarding-completed')
      localStorage.removeItem('bhm-onboarding-data')
    })
    
    // Clicca sul pulsante "Onboarding" negli header buttons
    await page.click('button:has-text("Onboarding")')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    console.log('=== STEP 1 - BUSINESS INFO STEP ===')
    
    // Mappa TUTTI gli input presenti
    const inputs = await page.locator('input').all()
    console.log(`Trovati ${inputs.length} input:`)
    for (let i = 0; i < inputs.length; i++) {
      const name = await inputs[i].getAttribute('name')
      const placeholder = await inputs[i].getAttribute('placeholder')
      const type = await inputs[i].getAttribute('type')
      const required = await inputs[i].getAttribute('required')
      const id = await inputs[i].getAttribute('id')
      const className = await inputs[i].getAttribute('class')
      console.log(`  Input ${i}: name="${name}", placeholder="${placeholder}", type="${type}", required="${required}", id="${id}"`)
    }
    
    // Mappa TUTTI i textarea presenti
    const textareas = await page.locator('textarea').all()
    console.log(`Trovati ${textareas.length} textarea:`)
    for (let i = 0; i < textareas.length; i++) {
      const name = await textareas[i].getAttribute('name')
      const placeholder = await textareas[i].getAttribute('placeholder')
      const required = await textareas[i].getAttribute('required')
      const id = await textareas[i].getAttribute('id')
      console.log(`  Textarea ${i}: name="${name}", placeholder="${placeholder}", required="${required}", id="${id}"`)
    }
    
    // Mappa TUTTI i select presenti
    const selects = await page.locator('select').all()
    console.log(`Trovati ${selects.length} select:`)
    for (let i = 0; i < selects.length; i++) {
      const name = await selects[i].getAttribute('name')
      const required = await selects[i].getAttribute('required')
      const id = await selects[i].getAttribute('id')
      console.log(`  Select ${i}: name="${name}", required="${required}", id="${id}"`)
    }
    
    // Mappa TUTTI i checkbox presenti
    const checkboxes = await page.locator('input[type="checkbox"]').all()
    console.log(`Trovati ${checkboxes.length} checkbox:`)
    for (let i = 0; i < checkboxes.length; i++) {
      const name = await checkboxes[i].getAttribute('name')
      const required = await checkboxes[i].getAttribute('required')
      const id = await checkboxes[i].getAttribute('id')
      console.log(`  Checkbox ${i}: name="${name}", required="${required}", id="${id}"`)
    }
    
    // Mappa TUTTI i radio presenti
    const radios = await page.locator('input[type="radio"]').all()
    console.log(`Trovati ${radios.length} radio:`)
    for (let i = 0; i < radios.length; i++) {
      const name = await radios[i].getAttribute('name')
      const value = await radios[i].getAttribute('value')
      const required = await radios[i].getAttribute('required')
      const id = await radios[i].getAttribute('id')
      console.log(`  Radio ${i}: name="${name}", value="${value}", required="${required}", id="${id}"`)
    }
    
    // Verifica che il wizard sia caricato
    await expect(page.locator('h1:has-text("Configurazione Iniziale")')).toBeVisible()
  })
  
  test('Mappatura Step 2 - DepartmentsStep', async ({ page }) => {
    // Login automatico
    await page.goto('/sign-in')
    await page.fill('input[type="email"]', 'matteo.cavallaro.work@gmail.com')
    await page.fill('input[type="password"]', 'cavallaro')
    await page.click('button:has-text("Accedi")')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    // Reset onboarding per test pulito
    await page.evaluate(() => {
      localStorage.removeItem('onboarding-completed')
      localStorage.removeItem('bhm-onboarding-data')
    })
    
    // Clicca sul pulsante "Onboarding" negli header buttons
    await page.click('button:has-text("Onboarding")')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    // Compila Step 1 per arrivare al Step 2
    await page.fill('input[placeholder="Inserisci il nome della tua azienda"]', 'Test Azienda')
    await page.fill('input[type="date"]', '2024-01-01')
    await page.fill('input[placeholder="+39 051 1234567"]', '1234567890')
    await page.fill('input[placeholder="info@azienda.it"]', 'test@azienda.com')
    await page.fill('input[placeholder="IT12345678901"]', '12345678901')
    await page.fill('input[placeholder="RIS-2024-001"]', 'RIS-2024-001')
    
    // Clicca Avanti per andare al Step 2
    await page.click('button:has-text("Avanti")')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    console.log('=== STEP 2 - DEPARTMENTS STEP ===')
    
    // Mappa TUTTI gli input presenti
    const inputs = await page.locator('input').all()
    console.log(`Trovati ${inputs.length} input:`)
    for (let i = 0; i < inputs.length; i++) {
      const name = await inputs[i].getAttribute('name')
      const placeholder = await inputs[i].getAttribute('placeholder')
      const type = await inputs[i].getAttribute('type')
      const required = await inputs[i].getAttribute('required')
      const id = await inputs[i].getAttribute('id')
      console.log(`  Input ${i}: name="${name}", placeholder="${placeholder}", type="${type}", required="${required}", id="${id}"`)
    }
    
    // Mappa TUTTI i textarea presenti
    const textareas = await page.locator('textarea').all()
    console.log(`Trovati ${textareas.length} textarea:`)
    for (let i = 0; i < textareas.length; i++) {
      const name = await textareas[i].getAttribute('name')
      const placeholder = await textareas[i].getAttribute('placeholder')
      const required = await textareas[i].getAttribute('required')
      const id = await textareas[i].getAttribute('id')
      console.log(`  Textarea ${i}: name="${name}", placeholder="${placeholder}", required="${required}", id="${id}"`)
    }
    
    // Mappa TUTTI i select presenti
    const selects = await page.locator('select').all()
    console.log(`Trovati ${selects.length} select:`)
    for (let i = 0; i < selects.length; i++) {
      const name = await selects[i].getAttribute('name')
      const required = await selects[i].getAttribute('required')
      const id = await selects[i].getAttribute('id')
      console.log(`  Select ${i}: name="${name}", required="${required}", id="${id}"`)
    }
    
    // Mappa TUTTI i checkbox presenti
    const checkboxes = await page.locator('input[type="checkbox"]').all()
    console.log(`Trovati ${checkboxes.length} checkbox:`)
    for (let i = 0; i < checkboxes.length; i++) {
      const name = await checkboxes[i].getAttribute('name')
      const required = await checkboxes[i].getAttribute('required')
      const id = await checkboxes[i].getAttribute('id')
      console.log(`  Checkbox ${i}: name="${name}", required="${required}", id="${id}"`)
    }
    
    // Mappa TUTTI i radio presenti
    const radios = await page.locator('input[type="radio"]').all()
    console.log(`Trovati ${radios.length} radio:`)
    for (let i = 0; i < radios.length; i++) {
      const name = await radios[i].getAttribute('name')
      const value = await radios[i].getAttribute('value')
      const required = await radios[i].getAttribute('required')
      const id = await radios[i].getAttribute('id')
      console.log(`  Radio ${i}: name="${name}", value="${value}", required="${required}", id="${id}"`)
    }
    
    // Verifica che sia al Step 2
    await expect(page.locator('h2:has-text("Reparti")')).toBeVisible()
  })
})
