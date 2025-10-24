/**
 * 🚀 OnboardingWizard - Test Semplificato Agente 2B
 * 
 * Test semplificato per verificare OnboardingWizard
 * Server: localhost:3001
 * 
 * @date 2025-10-23
 * @author Agente 2B - Systems Blueprint Architect
 */

import { test, expect } from '@playwright/test'

test.describe('OnboardingWizard - Test Semplificato Agente 2B', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login automatico
    await page.goto('/sign-in')
    await page.fill('input[type="email"]', 'matteo.cavallaro.work@gmail.com')
    await page.fill('input[type="password"]', 'cavallaro')
    await page.click('button:has-text("Accedi")')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000) // Ridotto da 3000
    
    // Reset onboarding per test pulito
    await page.evaluate(() => {
      localStorage.removeItem('onboarding-completed')
      localStorage.removeItem('bhm-onboarding-data')
    })
    
    // Clicca sul pulsante "Onboarding" negli header buttons
    await page.click('button:has-text("Onboarding")')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500) // Ridotto da 2000
  })

  test('OnboardingWizard - Dovrebbe caricare il wizard', async ({ page }) => {
    // Verifica che il wizard sia caricato
    await expect(page.locator('h1:has-text("Configurazione Iniziale")')).toBeVisible()
    
    // Verifica che sia presente il primo step (BusinessInfoStep)
    await expect(page.locator('h2:has-text("Informazioni Aziendali")')).toBeVisible()
  })

  test('BusinessInfoStep - Dovrebbe mostrare tutti i campi', async ({ page }) => {
    // Verifica campi obbligatori con selettori corretti
    await expect(page.locator('input[placeholder="Inserisci il nome della tua azienda"]')).toBeVisible()
    await expect(page.locator('input[type="date"]')).toBeVisible()
    await expect(page.locator('textarea[placeholder="Inserisci l\'indirizzo completo dell\'azienda"]')).toBeVisible()
    await expect(page.locator('input[placeholder="+39 051 1234567"]')).toBeVisible()
    await expect(page.locator('input[placeholder="info@azienda.it"]')).toBeVisible()
    await expect(page.locator('input[placeholder="IT12345678901"]')).toBeVisible()
    await expect(page.locator('input[placeholder="RIS-2024-001"]')).toBeVisible()
    await expect(page.locator('select')).toBeVisible()
  })

  test('BusinessInfoStep - Dovrebbe permettere compilazione', async ({ page }) => {
    // Compila TUTTI i campi obbligatori
    await page.fill('input[placeholder="Inserisci il nome della tua azienda"]', 'Test Azienda')
    await page.fill('input[type="date"]', '2024-01-01')
    await page.fill('textarea[placeholder="Inserisci l\'indirizzo completo dell\'azienda"]', 'Via Test 123, 40100 Bologna')
    await page.fill('input[placeholder="+39 051 1234567"]', '1234567890')
    await page.fill('input[placeholder="info@azienda.it"]', 'test@azienda.com')
    await page.fill('input[placeholder="IT12345678901"]', '12345678901')
    await page.fill('input[placeholder="RIS-2024-001"]', 'RIS-2024-001')
    
    // Seleziona opzione dal select (seconda opzione - prima con valore)
    await page.selectOption('select', 'ristorante')
    
    // Clicca Avanti
    await page.click('button:has-text("Avanti")')
    await page.waitForTimeout(500)
    
    // Verifica che sia passato al secondo step (DepartmentsStep)
    await expect(page.locator('h2:has-text("Reparti")')).toBeVisible()
  })

  test('Navigation - Dovrebbe permettere navigazione tra step', async ({ page }) => {
    // Compila TUTTI i campi obbligatori
    await page.fill('input[placeholder="Inserisci il nome della tua azienda"]', 'Test Azienda')
    await page.fill('input[type="date"]', '2024-01-01')
    await page.fill('textarea[placeholder="Inserisci l\'indirizzo completo dell\'azienda"]', 'Via Test 123, 40100 Bologna')
    await page.fill('input[placeholder="+39 051 1234567"]', '1234567890')
    await page.fill('input[placeholder="info@azienda.it"]', 'test@azienda.com')
    await page.fill('input[placeholder="IT12345678901"]', '12345678901')
    await page.fill('input[placeholder="RIS-2024-001"]', 'RIS-2024-001')
    
    // Seleziona opzione dal select (seconda opzione - prima con valore)
    await page.selectOption('select', 'ristorante')
    
    // Avanti al secondo step
    await page.click('button:has-text("Avanti")')
    await page.waitForTimeout(500)
    
    // Verifica secondo step
    await expect(page.locator('h2:has-text("Reparti")')).toBeVisible()
    
    // Indietro al primo step
    await page.click('button:has-text("Indietro")')
    await page.waitForTimeout(500)
    
    // Verifica primo step
    await expect(page.locator('h2:has-text("Informazioni Aziendali")')).toBeVisible()
  })
})
