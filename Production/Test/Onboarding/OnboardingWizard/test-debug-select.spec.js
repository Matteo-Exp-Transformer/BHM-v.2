import { test, expect } from '@playwright/test'

test.describe('Debug Select Options', () => {
  
  test('Debug - Verifica opzioni select', async ({ page }) => {
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
    
    console.log('=== OPZIONI SELECT ===')
    
    // Verifica opzioni disponibili nel select
    const select = page.locator('select')
    const options = await select.locator('option').all()
    console.log(`Trovate ${options.length} opzioni:`)
    
    for (let i = 0; i < options.length; i++) {
      const value = await options[i].getAttribute('value')
      const text = await options[i].textContent()
      const selected = await options[i].getAttribute('selected')
      console.log(`  Opzione ${i}: value="${value}", text="${text}", selected="${selected}"`)
    }
    
    // Prova a selezionare la prima opzione con valore
    if (options.length > 1) {
      const firstOptionValue = await options[1].getAttribute('value') // Skip prima opzione (probabilmente vuota)
      if (firstOptionValue) {
        console.log(`Selezionando opzione con value: "${firstOptionValue}"`)
        await page.selectOption('select', firstOptionValue)
        await page.waitForTimeout(100)
        
        const selectedValue = await page.locator('select').inputValue()
        console.log(`Valore selezionato: "${selectedValue}"`)
        
        // Verifica stato pulsante dopo selezione
        const avantiButton = page.locator('button:has-text("Avanti")')
        const isDisabled = await avantiButton.isDisabled()
        console.log(`Pulsante Avanti disabilitato dopo selezione: ${isDisabled}`)
      }
    }
    
    // Verifica che il wizard sia caricato
    await expect(page.locator('h1:has-text("Configurazione Iniziale")')).toBeVisible()
  })
})
