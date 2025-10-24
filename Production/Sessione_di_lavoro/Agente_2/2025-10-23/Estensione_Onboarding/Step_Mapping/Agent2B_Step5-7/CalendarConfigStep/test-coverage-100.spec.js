import { test, expect } from '@playwright/test'

test.describe('CalendarConfigStep - Mappatura Completa Agente 2B', () => {
  
  test.beforeEach(async ({ page }) => {
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
    
    // Naviga all'onboarding e vai al Step 7
    await page.click('button:has-text("Onboarding")')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    
    // Compila Step 1-6 per arrivare al Step 7
    await page.fill('input[placeholder="Inserisci il nome della tua azienda"]', 'Test Azienda')
    await page.fill('input[type="date"]', '2024-01-01')
    await page.fill('textarea[placeholder="Inserisci l\'indirizzo completo dell\'azienda"]', 'Via Test 123, 40100 Bologna')
    await page.fill('input[placeholder="+39 051 1234567"]', '1234567890')
    await page.fill('input[placeholder="info@azienda.it"]', 'test@azienda.com')
    await page.fill('input[placeholder="IT12345678901"]', '12345678901')
    await page.fill('input[placeholder="RIS-2024-001"]', 'RIS-2024-001')
    await page.selectOption('select', 'ristorante')
    await page.click('button:has-text("Avanti")')
    await page.waitForTimeout(500)
    
    // Step 2-6 (skip per ora)
    await page.click('button:has-text("Avanti")')
    await page.waitForTimeout(500)
    await page.click('button:has-text("Avanti")')
    await page.waitForTimeout(500)
    await page.click('button:has-text("Avanti")')
    await page.waitForTimeout(500)
    await page.click('button:has-text("Avanti")')
    await page.waitForTimeout(500)
    await page.click('button:has-text("Avanti")')
    await page.waitForTimeout(500)
    
    // Verifica che sia presente il Step 7 (CalendarConfigStep)
    await expect(page.locator('h2:has-text("Configurazione Calendario")')).toBeVisible()
  })

  test('CalendarConfigStep - Dovrebbe mostrare tutti gli elementi principali', async ({ page }) => {
    // Verifica elementi principali del CalendarConfigStep
    await expect(page.locator('h2:has-text("Configurazione Calendario")')).toBeVisible()
    
    // Verifica sezione anno fiscale
    await expect(page.locator('text=Anno Fiscale')).toBeVisible()
    
    // Verifica sezione giorni apertura
    await expect(page.locator('text=Giorni Apertura')).toBeVisible()
    
    // Verifica sezione giorni chiusura
    await expect(page.locator('text=Giorni Chiusura')).toBeVisible()
    
    // Verifica sezione orari
    await expect(page.locator('text=Orari Apertura')).toBeVisible()
    
    // Verifica bottoni principali
    await expect(page.locator('button:has-text("Avanti")')).toBeVisible()
  })

  test('CalendarConfigStep - Dovrebbe permettere configurazione anno fiscale', async ({ page }) => {
    // Verifica presenza campi anno fiscale
    await expect(page.locator('input[type="date"]').first()).toBeVisible() // Data inizio
    await expect(page.locator('input[type="date"]').nth(1)).toBeVisible() // Data fine
    
    // Compila anno fiscale
    await page.fill('input[type="date"]', '2024-01-01') // Data inizio
    await page.fill('input[type="date"]', '2024-12-31') // Data fine
    
    // Verifica che i valori siano stati inseriti
    await expect(page.locator('input[type="date"]').first()).toHaveValue('2024-01-01')
    await expect(page.locator('input[type="date"]').nth(1)).toHaveValue('2024-12-31')
  })

  test('CalendarConfigStep - Dovrebbe permettere selezione giorni apertura', async ({ page }) => {
    // Verifica presenza checkbox giorni settimanali
    const checkboxes = page.locator('input[type="checkbox"]')
    const checkboxCount = await checkboxes.count()
    expect(checkboxCount).toBeGreaterThan(0)
    
    // Seleziona alcuni giorni
    await page.check('input[type="checkbox"][value="lunedì"]')
    await page.check('input[type="checkbox"][value="martedì"]')
    await page.check('input[type="checkbox"][value="mercoledì"]')
    
    // Verifica che i giorni siano stati selezionati
    await expect(page.locator('input[type="checkbox"][value="lunedì"]')).toBeChecked()
    await expect(page.locator('input[type="checkbox"][value="martedì"]')).toBeChecked()
    await expect(page.locator('input[type="checkbox"][value="mercoledì"]')).toBeChecked()
  })

  test('CalendarConfigStep - Dovrebbe permettere gestione giorni chiusura', async ({ page }) => {
    // Verifica presenza bottoni per tipo chiusura
    await expect(page.locator('button:has-text("Singola")')).toBeVisible()
    await expect(page.locator('button:has-text("Periodo")')).toBeVisible()
    
    // Test chiusura singola
    await page.click('button:has-text("Singola")')
    await page.waitForTimeout(500)
    
    // Verifica che sia apparso il campo per data singola
    const dateInputs = page.locator('input[type="date"]')
    const dateInputCount = await dateInputs.count()
    expect(dateInputCount).toBeGreaterThan(2) // Dovrebbe esserci almeno un campo per chiusura
    
    // Test chiusura periodo
    await page.click('button:has-text("Periodo")')
    await page.waitForTimeout(500)
    
    // Verifica che siano apparsi i campi per periodo
    const periodInputs = page.locator('input[type="date"]')
    const periodInputCount = await periodInputs.count()
    expect(periodInputCount).toBeGreaterThan(3) // Dovrebbero esserci campi per inizio e fine periodo
  })

  test('CalendarConfigStep - Dovrebbe permettere configurazione orari', async ({ page }) => {
    // Verifica presenza campi orari
    await expect(page.locator('input[type="time"]').first()).toBeVisible() // Orario inizio
    await expect(page.locator('input[type="time"]').nth(1)).toBeVisible() // Orario fine
    
    // Compila orari
    await page.fill('input[type="time"]', '08:00') // Orario inizio
    await page.fill('input[type="time"]', '18:00') // Orario fine
    
    // Verifica che i valori siano stati inseriti
    await expect(page.locator('input[type="time"]').first()).toHaveValue('08:00')
    await expect(page.locator('input[type="time"]').nth(1)).toHaveValue('18:00')
  })

  test('CalendarConfigStep - Dovrebbe validare correttamente i campi', async ({ page }) => {
    // Test validazione anno fiscale con date invalide
    await page.fill('input[type="date"]', '2024-12-31') // Data inizio
    await page.fill('input[type="date"]', '2024-01-01') // Data fine (prima della inizio)
    
    // Verifica che ci sia un errore di validazione
    await expect(page.locator('text=La data di fine deve essere dopo la data di inizio')).toBeVisible()
    
    // Test validazione giorni apertura (nessuno selezionato)
    const checkboxes = page.locator('input[type="checkbox"]')
    const checkboxCount = await checkboxes.count()
    
    // Deseleziona tutti i giorni se sono selezionati
    for (let i = 0; i < checkboxCount; i++) {
      const checkbox = checkboxes.nth(i)
      if (await checkbox.isChecked()) {
        await checkbox.uncheck()
      }
    }
    
    // Verifica che ci sia un errore di validazione
    await expect(page.locator('text=Seleziona almeno un giorno di apertura')).toBeVisible()
  })

  test('CalendarConfigStep - Dovrebbe permettere navigazione', async ({ page }) => {
    // Verifica che il bottone "Avanti" sia presente
    await expect(page.locator('button:has-text("Avanti")')).toBeVisible()
    
    // Verifica che il bottone "Indietro" sia presente
    await expect(page.locator('button:has-text("Indietro")')).toBeVisible()
    
    // Test navigazione indietro
    await page.click('button:has-text("Indietro")')
    await page.waitForTimeout(500)
    
    // Verifica che sia tornato al Step 6
    await expect(page.locator('h2:has-text("Inventario")')).toBeVisible()
    
    // Torna avanti al Step 7
    await page.click('button:has-text("Avanti")')
    await page.waitForTimeout(500)
    
    // Verifica che sia tornato al Step 7
    await expect(page.locator('h2:has-text("Configurazione Calendario")')).toBeVisible()
  })

  test('CalendarConfigStep - Dovrebbe calcolare automaticamente i giorni lavorativi', async ({ page }) => {
    // Compila configurazione completa
    await page.fill('input[type="date"]', '2024-01-01') // Data inizio
    await page.fill('input[type="date"]', '2024-12-31') // Data fine
    
    // Seleziona giorni apertura
    await page.check('input[type="checkbox"][value="lunedì"]')
    await page.check('input[type="checkbox"][value="martedì"]')
    await page.check('input[type="checkbox"][value="mercoledì"]')
    await page.check('input[type="checkbox"][value="giovedì"]')
    await page.check('input[type="checkbox"][value="venerdì"]')
    
    // Compila orari
    await page.fill('input[type="time"]', '08:00') // Orario inizio
    await page.fill('input[type="time"]', '18:00') // Orario fine
    
    // Verifica che sia presente il calcolo giorni lavorativi
    await expect(page.locator('text=Giorni lavorativi')).toBeVisible()
    
    // Verifica che sia presente il calcolo ore lavorative
    await expect(page.locator('text=Ore lavorative')).toBeVisible()
  })

  test('CalendarConfigStep - Dovrebbe gestire configurazione di default', async ({ page }) => {
    // Verifica che ci sia una configurazione di default
    const dateInputs = page.locator('input[type="date"]')
    const dateInputCount = await dateInputs.count()
    expect(dateInputCount).toBeGreaterThan(0)
    
    // Verifica che ci siano giorni selezionati di default
    const checkboxes = page.locator('input[type="checkbox"]')
    const checkboxCount = await checkboxes.count()
    expect(checkboxCount).toBeGreaterThan(0)
    
    // Verifica che ci siano orari di default
    const timeInputs = page.locator('input[type="time"]')
    const timeInputCount = await timeInputs.count()
    expect(timeInputCount).toBeGreaterThan(0)
  })
})
