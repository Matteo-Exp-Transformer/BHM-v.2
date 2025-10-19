import { test, expect } from '@playwright/test'

test.describe('Onboarding Full Flow Demo', () => {
  test('completes full onboarding flow with real user interaction', async ({ page }) => {
    // Naviga alla pagina onboarding
    await page.goto('/onboarding')
    
    // Verifica che la pagina sia caricata
    await expect(page.locator('h1')).toContainText('Configurazione Iniziale HACCP')
    
    // Screenshot iniziale
    await page.screenshot({ path: 'test-onboarding-iniziale.png' })
    
    // Step 1: Business Info
    await page.fill('input[name="name"]', 'Ristorante Demo Test')
    await page.fill('input[name="address"]', 'Via Roma 123, Milano')
    await page.fill('input[name="phone"]', '+39 02 1234567')
    await page.fill('input[name="email"]', 'demo@ristorante.com')
    await page.fill('input[name="vat_number"]', 'IT12345678901')
    await page.selectOption('select[name="business_type"]', 'ristorante')
    await page.fill('input[name="established_date"]', '2020-01-15')
    await page.fill('input[name="license_number"]', 'LIC123456')
    
    // Screenshot dopo compilazione Step 1
    await page.screenshot({ path: 'test-onboarding-step1-compilato.png' })
    
    // Avanti al prossimo step
    await page.click('button:has-text("Avanti")')
    
    // Step 2: Departments
    await page.fill('input[placeholder*="nome reparto"]', 'Cucina')
    await page.fill('textarea[placeholder*="descrizione"]', 'Area di preparazione piatti')
    await page.click('button:has-text("Aggiungi")')
    
    await page.fill('input[placeholder*="nome reparto"]', 'Sala')
    await page.fill('textarea[placeholder*="descrizione"]', 'Area di servizio clienti')
    await page.click('button:has-text("Aggiungi")')
    
    // Screenshot Step 2
    await page.screenshot({ path: 'test-onboarding-step2-compilato.png' })
    
    await page.click('button:has-text("Avanti")')
    
    // Step 3: Staff
    await page.fill('input[name="staffName"]', 'Mario')
    await page.fill('input[name="staffSurname"]', 'Rossi')
    await page.fill('input[name="staffEmail"]', 'mario@ristorante.com')
    await page.fill('input[name="staffPhone"]', '+39 333 1234567')
    await page.selectOption('select[name="staffRole"]', 'admin')
    await page.fill('input[name="haccpExpiry"]', '2025-12-31')
    
    // Screenshot Step 3
    await page.screenshot({ path: 'test-onboarding-step3-compilato.png' })
    
    await page.click('button:has-text("Aggiungi")')
    await page.click('button:has-text("Avanti")')
    
    // Step 4: Conservation Points
    await page.fill('input[name="pointName"]', 'Frigo Principale')
    await page.selectOption('select[name="pointType"]', 'fridge')
    await page.fill('input[name="minTemperature"]', '2')
    await page.fill('input[name="maxTemperature"]', '8')
    
    // Screenshot Step 4
    await page.screenshot({ path: 'test-onboarding-step4-compilato.png' })
    
    await page.click('button:has-text("Aggiungi")')
    await page.click('button:has-text("Avanti")')
    
    // Step 5: Tasks
    await page.fill('input[name="taskTitle"]', 'Controllo Temperatura')
    await page.selectOption('select[name="taskType"]', 'temperature_calibration')
    await page.selectOption('select[name="taskFrequency"]', 'weekly')
    
    // Screenshot Step 5
    await page.screenshot({ path: 'test-onboarding-step5-compilato.png' })
    
    await page.click('button:has-text("Aggiungi")')
    await page.click('button:has-text("Avanti")')
    
    // Step 6: Inventory
    await page.fill('input[name="categoryName"]', 'Carne')
    await page.fill('input[name="categoryMinTemp"]', '2')
    await page.fill('input[name="categoryMaxTemp"]', '8')
    await page.selectOption('select[name="storageType"]', 'fridge')
    await page.fill('input[name="expiryDays"]', '3')
    
    // Screenshot Step 6
    await page.screenshot({ path: 'test-onboarding-step6-compilato.png' })
    
    await page.click('button:has-text("Aggiungi")')
    await page.click('button:has-text("Avanti")')
    
    // Step 7: Calendar Config
    await page.fill('input[name="fiscalYearStart"]', '2025-01-01')
    await page.fill('input[name="businessStartTime"]', '08:00')
    await page.fill('input[name="businessEndTime"]', '18:00')
    
    // Screenshot finale prima del completamento
    await page.screenshot({ path: 'test-onboarding-finale-precompilato.png' })
    
    // Completa onboarding
    await page.click('button:has-text("Completa Configurazione")')
    
    // Attendi navigazione a dashboard
    await page.waitForURL('/dashboard')
    
    // Screenshot finale
    await page.screenshot({ path: 'test-onboarding-completato.png' })
    
    // Verifica che siamo arrivati alla dashboard
    await expect(page).toHaveURL('/dashboard')
    
    // Verifica localStorage
    const onboardingCompleted = await page.evaluate(() => localStorage.getItem('onboarding-completed'))
    expect(onboardingCompleted).toBe('true')
    
    const onboardingCompletedAt = await page.evaluate(() => localStorage.getItem('onboarding-completed-at'))
    expect(onboardingCompletedAt).toBeTruthy()
    
    console.log('✅ Onboarding completato con successo!')
    console.log('📸 Screenshots salvati:')
    console.log('  - test-onboarding-iniziale.png')
    console.log('  - test-onboarding-step1-compilato.png')
    console.log('  - test-onboarding-step2-compilato.png')
    console.log('  - test-onboarding-step3-compilato.png')
    console.log('  - test-onboarding-step4-compilato.png')
    console.log('  - test-onboarding-step5-compilato.png')
    console.log('  - test-onboarding-step6-compilato.png')
    console.log('  - test-onboarding-finale-precompilato.png')
    console.log('  - test-onboarding-completato.png')
  })
  
  test('uses prefill button for quick demo', async ({ page }) => {
    // Naviga alla pagina onboarding
    await page.goto('/onboarding')
    
    // Screenshot iniziale
    await page.screenshot({ path: 'test-prefill-iniziale.png' })
    
    // Clicca sul pulsante Precompila
    await page.click('button:has-text("Precompila")')
    
    // Attendi che i dati siano caricati
    await page.waitForTimeout(2000)
    
    // Screenshot dopo precompilazione
    await page.screenshot({ path: 'test-prefill-dopo-caricamento.png' })
    
    // Vai direttamente al completamento usando il pulsante "Completa Onboarding"
    await page.click('button:has-text("Completa Onboarding")')
    
    // Attendi navigazione
    await page.waitForURL('/dashboard')
    
    // Screenshot finale
    await page.screenshot({ path: 'test-prefill-completato.png' })
    
    // Verifica completamento
    await expect(page).toHaveURL('/dashboard')
    
    console.log('✅ Prefill demo completato con successo!')
  })
})


