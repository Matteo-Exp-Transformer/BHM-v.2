// Production/Test/Onboarding/CalendarConfigStep/test-funzionale.spec.js
import { test, expect } from '@playwright/test';

test.describe('CalendarConfigStep - Test Funzionali', () => {

  test.beforeEach(async ({ page }) => {
    console.log('🔐 Eseguendo login automatico...')
    
    // Vai alla pagina di login
    await page.goto('http://localhost:3000/')
    await page.waitForLoadState('networkidle')
    
    // Compila il form di login
    await page.fill('input[type="email"]', 'matteo.cavallaro.work@gmail.com')
    await page.fill('input[type="password"]', 'cavallaro')
    
    console.log('📝 Credenziali inserite, cliccando Accedi...')
    await page.click('button:has-text("Accedi")')
    
    // Attendi il login e il caricamento della dashboard
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    console.log('🏢 Cliccando pulsante Onboarding...')
    // Cerca e clicca il pulsante Onboarding nell'header
    const onboardingButton = page.locator('button:has-text("Onboarding")')
    await expect(onboardingButton).toBeVisible()
    await onboardingButton.click()
    
    // Attendi che si apra l'onboarding
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)
    
    // Completa i primi step per arrivare a CalendarConfigStep
    console.log('📝 Completando step precedenti...')
    
    // BusinessInfoStep
    await page.fill('input[placeholder="Inserisci il nome della tua azienda"]', 'Test Azienda')
    await page.fill('textarea[placeholder="Inserisci l\'indirizzo completo dell\'azienda"]', 'Via Test 123')
    await page.fill('input[placeholder="info@azienda.it"]', 'test@azienda.com')
    await page.fill('input[placeholder="+39 051 1234567"]', '1234567890')
    
    // Avanti
    await page.click('button:has-text("Avanti")')
    await page.waitForTimeout(1000)
    
    // DepartmentsStep - Aggiungi un reparto
    await page.fill('input[placeholder="es. Cucina, Sala, Bancone..."]', 'Test Reparto')
    await page.click('button:has-text("Aggiungi")')
    await page.waitForTimeout(1000)
    
    // Avanti
    await page.click('button:has-text("Avanti")')
    await page.waitForTimeout(1000)
    
    // StaffStep - Aggiungi un membro
    await page.fill('input[id="staff-name"]', 'Test Nome')
    await page.fill('input[id="staff-surname"]', 'Test Cognome')
    await page.fill('input[id="staff-email"]', 'staff@test.com')
    await page.click('button:has-text("Aggiungi")')
    await page.waitForTimeout(1000)
    
    // Avanti
    await page.click('button:has-text("Avanti")')
    await page.waitForTimeout(1000)
    
    // ConservationStep - Aggiungi un punto
    await page.fill('input[id="point-name"]', 'Test Punto')
    await page.fill('input[id="point-temperature"]', '4')
    await page.click('button:has-text("Aggiungi")')
    await page.waitForTimeout(1000)
    
    // Avanti
    await page.click('button:has-text("Avanti")')
    await page.waitForTimeout(1000)
    
    // TasksStep - Aggiungi un'attività
    await page.fill('input[placeholder="Nome dell\'attività"]', 'Test Attività')
    await page.click('button:has-text("Aggiungi")')
    await page.waitForTimeout(1000)
    
    // Avanti
    await page.click('button:has-text("Avanti")')
    await page.waitForTimeout(1000)
    
    // InventoryStep - Aggiungi una categoria
    await page.fill('input[placeholder="Nome categoria"]', 'Test Categoria')
    await page.click('button:has-text("Aggiungi")')
    await page.waitForTimeout(1000)
    
    // Avanti
    await page.click('button:has-text("Avanti")')
    await page.waitForTimeout(1000)
    
    console.log('✅ CalendarConfigStep aperto')
  })

  test('Dovrebbe renderizzare correttamente il componente', async ({ page }) => {
    // Verifica che il titolo sia visibile
    await expect(page.locator('h2:has-text("Configurazione Calendario")')).toBeVisible()
    
    // Verifica che i campi principali siano presenti
    await expect(page.locator('input[type="date"]')).toBeVisible()
    await expect(page.locator('input[type="time"]')).toBeVisible()
    
    // Verifica che i giorni della settimana siano presenti
    await expect(page.locator('text=Lunedì')).toBeVisible()
    await expect(page.locator('text=Martedì')).toBeVisible()
    await expect(page.locator('text=Mercoledì')).toBeVisible()
    await expect(page.locator('text=Giovedì')).toBeVisible()
    await expect(page.locator('text=Venerdì')).toBeVisible()
    await expect(page.locator('text=Sabato')).toBeVisible()
    await expect(page.locator('text=Domenica')).toBeVisible()
  })

  test('Dovrebbe gestire la configurazione anno fiscale', async ({ page }) => {
    // Configura anno fiscale
    await page.fill('input[type="date"]', '2024-01-01')
    
    // Verifica che il campo sia stato compilato
    await expect(page.locator('input[type="date"]')).toHaveValue('2024-01-01')
  })

  test('Dovrebbe gestire la selezione giorni lavorativi', async ({ page }) => {
    // Seleziona alcuni giorni
    await page.click('input[type="checkbox"][value="1"]') // Lunedì
    await page.click('input[type="checkbox"][value="2"]') // Martedì
    await page.click('input[type="checkbox"][value="3"]') // Mercoledì
    
    // Verifica che i checkbox siano selezionati
    await expect(page.locator('input[type="checkbox"][value="1"]')).toBeChecked()
    await expect(page.locator('input[type="checkbox"][value="2"]')).toBeChecked()
    await expect(page.locator('input[type="checkbox"][value="3"]')).toBeChecked()
  })

  test('Dovrebbe gestire la configurazione orari di apertura', async ({ page }) => {
    // Configura orario apertura
    await page.fill('input[type="time"]', '08:00')
    
    // Verifica che il campo sia stato compilato
    await expect(page.locator('input[type="time"]')).toHaveValue('08:00')
  })

  test('Dovrebbe gestire l\'aggiunta di giorni di chiusura', async ({ page }) => {
    // Aggiungi un giorno di chiusura
    await page.fill('input[type="date"]', '2024-12-25')
    await page.click('button:has-text("Aggiungi")')
    
    // Verifica che il giorno sia stato aggiunto
    await expect(page.locator('text=25/12/2024')).toBeVisible()
  })

  test('Dovrebbe gestire l\'eliminazione di giorni di chiusura', async ({ page }) => {
    // Prima aggiungi un giorno
    await page.fill('input[type="date"]', '2024-12-25')
    await page.click('button:has-text("Aggiungi")')
    await page.waitForTimeout(500)
    
    // Poi eliminalo
    await page.click('button:has-text("Elimina")')
    
    // Verifica che il giorno sia stato rimosso
    await expect(page.locator('text=25/12/2024')).not.toBeVisible()
  })

  test('Dovrebbe gestire la validazione dei campi obbligatori', async ({ page }) => {
    // Prova a procedere senza configurare nulla
    await page.click('button:has-text("Avanti")')
    
    // Verifica che appaiano errori di validazione
    await expect(page.locator('text=Campo obbligatorio')).toBeVisible()
  })

  test('Dovrebbe gestire l\'accessibilità corretta', async ({ page }) => {
    // Verifica che i campi abbiano label appropriate
    await expect(page.locator('label:has-text("Anno fiscale")')).toBeVisible()
    await expect(page.locator('label:has-text("Giorni lavorativi")')).toBeVisible()
    await expect(page.locator('label:has-text("Orari di apertura")')).toBeVisible()
  })

  test('Dovrebbe gestire il completamento del wizard', async ({ page }) => {
    // Configura tutto
    await page.fill('input[type="date"]', '2024-01-01')
    await page.click('input[type="checkbox"][value="1"]')
    await page.fill('input[type="time"]', '08:00')
    
    // Completa il wizard
    await page.click('button:has-text("Completa")')
    
    // Verifica che il wizard sia stato completato
    await expect(page.locator('text=Onboarding completato')).toBeVisible()
  })
})
