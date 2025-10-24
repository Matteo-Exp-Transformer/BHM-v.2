import { test, expect } from '@playwright/test'

test.describe('InventoryStep - Mappatura Completa Agente 2B', () => {
  
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
    
    // Naviga all'onboarding e vai al Step 6
    await page.click('button:has-text("Onboarding")')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    
    // Compila Step 1-5 per arrivare al Step 6
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
    
    // Step 2-5 (skip per ora)
    await page.click('button:has-text("Avanti")')
    await page.waitForTimeout(500)
    await page.click('button:has-text("Avanti")')
    await page.waitForTimeout(500)
    await page.click('button:has-text("Avanti")')
    await page.waitForTimeout(500)
    await page.click('button:has-text("Avanti")')
    await page.waitForTimeout(500)
    
    // Verifica che sia presente il Step 6 (InventoryStep)
    await expect(page.locator('h2:has-text("Inventario")')).toBeVisible()
  })

  test('InventoryStep - Dovrebbe mostrare tutti gli elementi principali', async ({ page }) => {
    // Verifica elementi principali del InventoryStep
    await expect(page.locator('h2:has-text("Inventario")')).toBeVisible()
    
    // Verifica sezione categorie
    await expect(page.locator('text=Categorie Prodotti')).toBeVisible()
    
    // Verifica sezione prodotti
    await expect(page.locator('text=Prodotti')).toBeVisible()
    
    // Verifica bottoni principali
    await expect(page.locator('button:has-text("Aggiungi Categoria")')).toBeVisible()
    await expect(page.locator('button:has-text("Aggiungi Prodotto")')).toBeVisible()
    await expect(page.locator('button:has-text("Avanti")')).toBeVisible()
  })

  test('InventoryStep - Dovrebbe permettere aggiunta categoria', async ({ page }) => {
    // Clicca su "Aggiungi Categoria"
    await page.click('button:has-text("Aggiungi Categoria")')
    await page.waitForTimeout(500)
    
    // Verifica che sia apparso il form per aggiungere categoria
    await expect(page.locator('input[placeholder*="Nome categoria"]')).toBeVisible()
    await expect(page.locator('textarea[placeholder*="Descrizione categoria"]')).toBeVisible()
    
    // Compila la categoria
    await page.fill('input[placeholder*="Nome categoria"]', 'Test Categoria')
    await page.fill('textarea[placeholder*="Descrizione categoria"]', 'Descrizione categoria di test')
    
    // Salva la categoria
    await page.click('button:has-text("Salva")')
    await page.waitForTimeout(500)
    
    // Verifica che la categoria sia stata aggiunta
    await expect(page.locator('text=Test Categoria')).toBeVisible()
  })

  test('InventoryStep - Dovrebbe permettere aggiunta prodotto', async ({ page }) => {
    // Prima aggiungi una categoria per il prodotto
    await page.click('button:has-text("Aggiungi Categoria")')
    await page.waitForTimeout(500)
    await page.fill('input[placeholder*="Nome categoria"]', 'Test Categoria')
    await page.fill('textarea[placeholder*="Descrizione categoria"]', 'Descrizione categoria di test')
    await page.click('button:has-text("Salva")')
    await page.waitForTimeout(500)
    
    // Clicca su "Aggiungi Prodotto"
    await page.click('button:has-text("Aggiungi Prodotto")')
    await page.waitForTimeout(500)
    
    // Verifica che sia apparso il form per aggiungere prodotto
    await expect(page.locator('input[placeholder*="Nome prodotto"]')).toBeVisible()
    await expect(page.locator('select')).toBeVisible() // Categoria
    await expect(page.locator('input[type="number"]')).toBeVisible() // Quantità
    await expect(page.locator('input[type="date"]')).toBeVisible() // Scadenza
    
    // Compila il prodotto
    await page.fill('input[placeholder*="Nome prodotto"]', 'Test Prodotto')
    await page.selectOption('select', 'Test Categoria')
    await page.fill('input[type="number"]', '10')
    await page.fill('input[type="date"]', '2024-12-31')
    
    // Salva il prodotto
    await page.click('button:has-text("Salva")')
    await page.waitForTimeout(500)
    
    // Verifica che il prodotto sia stato aggiunto
    await expect(page.locator('text=Test Prodotto')).toBeVisible()
  })

  test('InventoryStep - Dovrebbe gestire allergeni', async ({ page }) => {
    // Prima aggiungi una categoria
    await page.click('button:has-text("Aggiungi Categoria")')
    await page.waitForTimeout(500)
    await page.fill('input[placeholder*="Nome categoria"]', 'Test Categoria')
    await page.fill('textarea[placeholder*="Descrizione categoria"]', 'Descrizione categoria di test')
    await page.click('button:has-text("Salva")')
    await page.waitForTimeout(500)
    
    // Aggiungi un prodotto
    await page.click('button:has-text("Aggiungi Prodotto")')
    await page.waitForTimeout(500)
    
    // Verifica che ci siano checkbox per allergeni
    await expect(page.locator('input[type="checkbox"]')).toBeVisible()
    
    // Seleziona alcuni allergeni
    await page.check('input[type="checkbox"][value="glutine"]')
    await page.check('input[type="checkbox"][value="latte"]')
    
    // Compila altri campi obbligatori
    await page.fill('input[placeholder*="Nome prodotto"]', 'Test Prodotto con Allergeni')
    await page.selectOption('select', 'Test Categoria')
    await page.fill('input[type="number"]', '5')
    await page.fill('input[type="date"]', '2024-12-31')
    
    // Salva il prodotto
    await page.click('button:has-text("Salva")')
    await page.waitForTimeout(500)
    
    // Verifica che il prodotto sia stato aggiunto
    await expect(page.locator('text=Test Prodotto con Allergeni')).toBeVisible()
    
    // Verifica che gli allergeni siano visualizzati
    await expect(page.locator('text=Glutine')).toBeVisible()
    await expect(page.locator('text=Latte')).toBeVisible()
  })

  test('InventoryStep - Dovrebbe validare correttamente i campi', async ({ page }) => {
    // Test validazione categoria senza nome
    await page.click('button:has-text("Aggiungi Categoria")')
    await page.waitForTimeout(500)
    
    // Prova a salvare senza nome
    await page.click('button:has-text("Salva")')
    await page.waitForTimeout(500)
    
    // Verifica che ci sia un errore o che la categoria non sia stata salvata
    const categoryCount = await page.locator('[data-testid="category-item"]').count()
    expect(categoryCount).toBe(0) // Non dovrebbe essere stata salvata
    
    // Test validazione prodotto senza nome
    await page.click('button:has-text("Aggiungi Prodotto")')
    await page.waitForTimeout(500)
    
    // Prova a salvare senza nome
    await page.click('button:has-text("Salva")')
    await page.waitForTimeout(500)
    
    // Verifica che ci sia un errore o che il prodotto non sia stato salvato
    const productCount = await page.locator('[data-testid="product-item"]').count()
    expect(productCount).toBe(0) // Non dovrebbe essere stato salvato
  })

  test('InventoryStep - Dovrebbe permettere navigazione', async ({ page }) => {
    // Verifica che il bottone "Avanti" sia presente
    await expect(page.locator('button:has-text("Avanti")')).toBeVisible()
    
    // Verifica che il bottone "Indietro" sia presente
    await expect(page.locator('button:has-text("Indietro")')).toBeVisible()
    
    // Test navigazione indietro
    await page.click('button:has-text("Indietro")')
    await page.waitForTimeout(500)
    
    // Verifica che sia tornato al Step 5
    await expect(page.locator('h2:has-text("Task e Manutenzioni")')).toBeVisible()
    
    // Torna avanti al Step 6
    await page.click('button:has-text("Avanti")')
    await page.waitForTimeout(500)
    
    // Verifica che sia tornato al Step 6
    await expect(page.locator('h2:has-text("Inventario")')).toBeVisible()
  })

  test('InventoryStep - Dovrebbe gestire stati vuoti', async ({ page }) => {
    // Verifica gestione quando non ci sono categorie
    const categories = page.locator('[data-testid="category-item"]')
    const categoryCount = await categories.count()
    
    if (categoryCount === 0) {
      // Verifica che ci sia un messaggio appropriato
      await expect(page.locator('text=Nessuna categoria')).toBeVisible()
    }
    
    // Verifica gestione quando non ci sono prodotti
    const products = page.locator('[data-testid="product-item"]')
    const productCount = await products.count()
    
    if (productCount === 0) {
      // Verifica che ci sia un messaggio appropriato
      await expect(page.locator('text=Nessun prodotto')).toBeVisible()
    }
  })

  test('InventoryStep - Dovrebbe gestire scadenze', async ({ page }) => {
    // Prima aggiungi una categoria
    await page.click('button:has-text("Aggiungi Categoria")')
    await page.waitForTimeout(500)
    await page.fill('input[placeholder*="Nome categoria"]', 'Test Categoria')
    await page.fill('textarea[placeholder*="Descrizione categoria"]', 'Descrizione categoria di test')
    await page.click('button:has-text("Salva")')
    await page.waitForTimeout(500)
    
    // Aggiungi un prodotto con scadenza
    await page.click('button:has-text("Aggiungi Prodotto")')
    await page.waitForTimeout(500)
    
    // Compila il prodotto con scadenza futura
    await page.fill('input[placeholder*="Nome prodotto"]', 'Test Prodotto Scadenza')
    await page.selectOption('select', 'Test Categoria')
    await page.fill('input[type="number"]', '3')
    await page.fill('input[type="date"]', '2024-12-31')
    
    // Salva il prodotto
    await page.click('button:has-text("Salva")')
    await page.waitForTimeout(500)
    
    // Verifica che il prodotto sia stato aggiunto
    await expect(page.locator('text=Test Prodotto Scadenza')).toBeVisible()
    
    // Verifica che la scadenza sia visualizzata
    await expect(page.locator('text=2024-12-31')).toBeVisible()
  })
})
