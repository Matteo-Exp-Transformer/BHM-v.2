import { test, expect } from '@playwright/test'

test.describe('Debug Selettori Onboarding', () => {
  
  test('Debug - Verifica selettori BusinessInfoStep', async ({ page }) => {
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
    
    // Debug: Stampa tutti gli input presenti
    const inputs = await page.locator('input').all()
    console.log('=== INPUTS TROVATI ===')
    for (let i = 0; i < inputs.length; i++) {
      const name = await inputs[i].getAttribute('name')
      const placeholder = await inputs[i].getAttribute('placeholder')
      const type = await inputs[i].getAttribute('type')
      console.log(`Input ${i}: name="${name}", placeholder="${placeholder}", type="${type}"`)
    }
    
    // Debug: Stampa tutti i button presenti
    const buttons = await page.locator('button').all()
    console.log('=== BUTTONS TROVATI ===')
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent()
      const type = await buttons[i].getAttribute('type')
      console.log(`Button ${i}: text="${text}", type="${type}"`)
    }
    
    // Debug: Stampa tutti gli h2 presenti
    const h2s = await page.locator('h2').all()
    console.log('=== H2 TROVATI ===')
    for (let i = 0; i < h2s.length; i++) {
      const text = await h2s[i].textContent()
      console.log(`H2 ${i}: text="${text}"`)
    }
    
    // Verifica che il wizard sia caricato
    await expect(page.locator('h1:has-text("Configurazione Iniziale")')).toBeVisible()
  })
})
