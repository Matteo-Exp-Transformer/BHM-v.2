import { test, expect } from '@playwright/test'

test.describe('Debug Pulsante Avanti - Analisi Completa', () => {
  
  test('Debug - Verifica stato pulsante dopo compilazione completa', async ({ page }) => {
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
    
    console.log('=== STATO INIZIALE ===')
    const avantiButton = page.locator('button:has-text("Avanti")')
    const isDisabledInitial = await avantiButton.isDisabled()
    console.log(`Pulsante Avanti disabilitato: ${isDisabledInitial}`)
    
    // Compila TUTTI i campi uno per uno
    console.log('=== COMPILAZIONE CAMPI ===')
    
    // Campo 1: Nome azienda
    await page.fill('input[placeholder="Inserisci il nome della tua azienda"]', 'Test Azienda')
    await page.waitForTimeout(100)
    const isDisabled1 = await avantiButton.isDisabled()
    console.log(`Dopo nome azienda - Disabilitato: ${isDisabled1}`)
    
    // Campo 2: Data
    await page.fill('input[type="date"]', '2024-01-01')
    await page.waitForTimeout(100)
    const isDisabled2 = await avantiButton.isDisabled()
    console.log(`Dopo data - Disabilitato: ${isDisabled2}`)
    
    // Campo 3: Indirizzo
    await page.fill('textarea[placeholder="Inserisci l\'indirizzo completo dell\'azienda"]', 'Via Test 123, 40100 Bologna')
    await page.waitForTimeout(100)
    const isDisabled3 = await avantiButton.isDisabled()
    console.log(`Dopo indirizzo - Disabilitato: ${isDisabled3}`)
    
    // Campo 4: Telefono
    await page.fill('input[placeholder="+39 051 1234567"]', '1234567890')
    await page.waitForTimeout(100)
    const isDisabled4 = await avantiButton.isDisabled()
    console.log(`Dopo telefono - Disabilitato: ${isDisabled4}`)
    
    // Campo 5: Email
    await page.fill('input[placeholder="info@azienda.it"]', 'test@azienda.com')
    await page.waitForTimeout(100)
    const isDisabled5 = await avantiButton.isDisabled()
    console.log(`Dopo email - Disabilitato: ${isDisabled5}`)
    
    // Campo 6: P.IVA
    await page.fill('input[placeholder="IT12345678901"]', '12345678901')
    await page.waitForTimeout(100)
    const isDisabled6 = await avantiButton.isDisabled()
    console.log(`Dopo P.IVA - Disabilitato: ${isDisabled6}`)
    
    // Campo 7: Codice RIS
    await page.fill('input[placeholder="RIS-2024-001"]', 'RIS-2024-001')
    await page.waitForTimeout(100)
    const isDisabled7 = await avantiButton.isDisabled()
    console.log(`Dopo codice RIS - Disabilitato: ${isDisabled7}`)
    
    // Campo 8: Select
    await page.selectOption('select', { index: 0 })
    await page.waitForTimeout(100)
    const isDisabled8 = await avantiButton.isDisabled()
    console.log(`Dopo select - Disabilitato: ${isDisabled8}`)
    
    // Verifica valori finali
    console.log('=== VALORI FINALI ===')
    const companyName = await page.locator('input[placeholder="Inserisci il nome della tua azienda"]').inputValue()
    const date = await page.locator('input[type="date"]').inputValue()
    const address = await page.locator('textarea[placeholder="Inserisci l\'indirizzo completo dell\'azienda"]').inputValue()
    const phone = await page.locator('input[placeholder="+39 051 1234567"]').inputValue()
    const email = await page.locator('input[placeholder="info@azienda.it"]').inputValue()
    const vat = await page.locator('input[placeholder="IT12345678901"]').inputValue()
    const ris = await page.locator('input[placeholder="RIS-2024-001"]').inputValue()
    const selectValue = await page.locator('select').inputValue()
    
    console.log(`Company Name: "${companyName}"`)
    console.log(`Date: "${date}"`)
    console.log(`Address: "${address}"`)
    console.log(`Phone: "${phone}"`)
    console.log(`Email: "${email}"`)
    console.log(`VAT: "${vat}"`)
    console.log(`RIS: "${ris}"`)
    console.log(`Select: "${selectValue}"`)
    
    // Verifica stato finale del pulsante
    const isDisabledFinal = await avantiButton.isDisabled()
    console.log(`=== STATO FINALE ===`)
    console.log(`Pulsante Avanti disabilitato: ${isDisabledFinal}`)
    
    // Verifica che il wizard sia caricato
    await expect(page.locator('h1:has-text("Configurazione Iniziale")')).toBeVisible()
  })
})
