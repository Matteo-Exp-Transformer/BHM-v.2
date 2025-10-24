import { test, expect } from '@playwright/test'

test.describe('TasksStep - Mappatura Completa Agente 2B', () => {
  
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
    
    // Naviga all'onboarding e vai al Step 5
    await page.click('button:has-text("Onboarding")')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    
    // Compila Step 1-4 per arrivare al Step 5
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
    
    // Step 2 - DepartmentsStep (skip per ora)
    await page.click('button:has-text("Avanti")')
    await page.waitForTimeout(500)
    
    // Step 3 - StaffStep (skip per ora)
    await page.click('button:has-text("Avanti")')
    await page.waitForTimeout(500)
    
    // Step 4 - ConservationStep (skip per ora)
    await page.click('button:has-text("Avanti")')
    await page.waitForTimeout(500)
    
    // Verifica che sia presente il Step 5 (TasksStep)
    await expect(page.locator('h2:has-text("Task e Manutenzioni")')).toBeVisible()
  })

  test('TasksStep - Dovrebbe mostrare tutti gli elementi principali', async ({ page }) => {
    // Verifica elementi principali del TasksStep
    await expect(page.locator('h2:has-text("Task e Manutenzioni")')).toBeVisible()
    
    // Verifica sezione punti conservazione
    await expect(page.locator('text=Punti di Conservazione')).toBeVisible()
    
    // Verifica sezione task generici
    await expect(page.locator('text=Task Generici')).toBeVisible()
    
    // Verifica bottoni principali
    await expect(page.locator('button:has-text("Aggiungi Task")')).toBeVisible()
    await expect(page.locator('button:has-text("Avanti")')).toBeVisible()
  })

  test('TasksStep - Dovrebbe permettere aggiunta task generico', async ({ page }) => {
    // Clicca su "Aggiungi Task"
    await page.click('button:has-text("Aggiungi Task")')
    await page.waitForTimeout(500)
    
    // Verifica che sia apparso il form per aggiungere task
    await expect(page.locator('input[placeholder*="Nome del task"]')).toBeVisible()
    await expect(page.locator('textarea[placeholder*="Descrizione"]')).toBeVisible()
    
    // Compila il task
    await page.fill('input[placeholder*="Nome del task"]', 'Test Task Generico')
    await page.fill('textarea[placeholder*="Descrizione"]', 'Descrizione del task di test')
    
    // Salva il task
    await page.click('button:has-text("Salva")')
    await page.waitForTimeout(500)
    
    // Verifica che il task sia stato aggiunto
    await expect(page.locator('text=Test Task Generico')).toBeVisible()
  })

  test('TasksStep - Dovrebbe permettere gestione punti conservazione', async ({ page }) => {
    // Verifica che ci sia almeno un punto conservazione
    const conservationPoints = page.locator('[data-testid="conservation-point"]')
    const count = await conservationPoints.count()
    
    if (count > 0) {
      // Clicca sul primo punto conservazione
      await conservationPoints.first().click()
      await page.waitForTimeout(500)
      
      // Verifica che sia apparso il modal per assegnazione manutenzioni
      await expect(page.locator('text=Assegna Manutenzioni')).toBeVisible()
      
      // Verifica tipi manutenzione disponibili
      await expect(page.locator('text=Rilevamento Temperatura')).toBeVisible()
      await expect(page.locator('text=Sanificazione')).toBeVisible()
      await expect(page.locator('text=Sbrinamento')).toBeVisible()
      await expect(page.locator('text=Controllo Scadenze')).toBeVisible()
    }
  })

  test('TasksStep - Dovrebbe validare correttamente i campi', async ({ page }) => {
    // Test validazione task senza nome
    await page.click('button:has-text("Aggiungi Task")')
    await page.waitForTimeout(500)
    
    // Prova a salvare senza nome
    await page.click('button:has-text("Salva")')
    await page.waitForTimeout(500)
    
    // Verifica che ci sia un errore o che il task non sia stato salvato
    const taskCount = await page.locator('[data-testid="generic-task"]').count()
    expect(taskCount).toBe(0) // Non dovrebbe essere stato salvato
  })

  test('TasksStep - Dovrebbe permettere navigazione', async ({ page }) => {
    // Verifica che il bottone "Avanti" sia presente
    await expect(page.locator('button:has-text("Avanti")')).toBeVisible()
    
    // Verifica che il bottone "Indietro" sia presente
    await expect(page.locator('button:has-text("Indietro")')).toBeVisible()
    
    // Test navigazione indietro
    await page.click('button:has-text("Indietro")')
    await page.waitForTimeout(500)
    
    // Verifica che sia tornato al Step 4
    await expect(page.locator('h2:has-text("Conservazione")')).toBeVisible()
    
    // Torna avanti al Step 5
    await page.click('button:has-text("Avanti")')
    await page.waitForTimeout(500)
    
    // Verifica che sia tornato al Step 5
    await expect(page.locator('h2:has-text("Task e Manutenzioni")')).toBeVisible()
  })

  test('TasksStep - Dovrebbe gestire stati vuoti', async ({ page }) => {
    // Verifica gestione quando non ci sono punti conservazione
    const conservationPoints = page.locator('[data-testid="conservation-point"]')
    const count = await conservationPoints.count()
    
    if (count === 0) {
      // Verifica che ci sia un messaggio appropriato
      await expect(page.locator('text=Nessun punto di conservazione')).toBeVisible()
    }
    
    // Verifica gestione quando non ci sono task generici
    const genericTasks = page.locator('[data-testid="generic-task"]')
    const taskCount = await genericTasks.count()
    
    if (taskCount === 0) {
      // Verifica che ci sia un messaggio appropriato
      await expect(page.locator('text=Nessun task generico')).toBeVisible()
    }
  })
})
