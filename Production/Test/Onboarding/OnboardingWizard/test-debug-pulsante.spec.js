import { test, expect } from '@playwright/test'

test.describe('Debug Pulsante Avanti', () => {
  
  test('Debug - Verifica stato pulsante Avanti', async ({ page }) => {
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
    
    // Verifica stato iniziale del pulsante
    const avantiButton = page.locator('button:has-text("Avanti")')
    const isDisabled = await avantiButton.isDisabled()
    console.log('=== STATO INIZIALE PULSANTE AVANTI ===')
    console.log(`Pulsante Avanti disabilitato: ${isDisabled}`)
    
    // Compila tutti i campi
    await page.fill('input[placeholder="Inserisci il nome della tua azienda"]', 'Test Azienda')
    await page.fill('input[type="date"]', '2024-01-01')
    await page.fill('input[placeholder="+39 051 1234567"]', '1234567890')
    await page.fill('input[placeholder="info@azienda.it"]', 'test@azienda.com')
    await page.fill('input[placeholder="IT12345678901"]', '12345678901')
    await page.fill('input[placeholder="RIS-2024-001"]', 'RIS-2024-001')
    
    // Verifica stato dopo compilazione
    const isDisabledAfter = await avantiButton.isDisabled()
    console.log('=== STATO DOPO COMPILAZIONE ===')
    console.log(`Pulsante Avanti disabilitato: ${isDisabledAfter}`)
    
    // Verifica valori dei campi
    const companyName = await page.locator('input[placeholder="Inserisci il nome della tua azienda"]').inputValue()
    const date = await page.locator('input[type="date"]').inputValue()
    const phone = await page.locator('input[placeholder="+39 051 1234567"]').inputValue()
    const email = await page.locator('input[placeholder="info@azienda.it"]').inputValue()
    const vat = await page.locator('input[placeholder="IT12345678901"]').inputValue()
    const ris = await page.locator('input[placeholder="RIS-2024-001"]').inputValue()
    
    console.log('=== VALORI CAMPI ===')
    console.log(`Company Name: "${companyName}"`)
    console.log(`Date: "${date}"`)
    console.log(`Phone: "${phone}"`)
    console.log(`Email: "${email}"`)
    console.log(`VAT: "${vat}"`)
    console.log(`RIS: "${ris}"`)
    
    // Verifica che il wizard sia caricato
    await expect(page.locator('h1:has-text("Configurazione Iniziale")')).toBeVisible()
  })
})
