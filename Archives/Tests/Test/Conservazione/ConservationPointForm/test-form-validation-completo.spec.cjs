/**
 * 🧪 ConservationPointForm - Test Validazione Completa
 * 
 * Test sistematico di tutte le validazioni del form ConservationPointForm
 * 
 * @date 2025-01-16
 * @agent Agente-2-Form-Validazioni
 */

const { test, expect } = require('@playwright/test')

test.describe('ConservationPointForm - Validazione Completa', () => {
  test.beforeEach(async ({ page }) => {
    // Login prima di accedere alla pagina
    await page.goto('http://localhost:3002/sign-in')
    await page.waitForLoadState('networkidle')
    
    await page.fill('input[type="email"]', 'matteo.cavallaro.work@gmail.com')
    await page.fill('input[type="password"]', 'cavallaro')
    await page.click('button[type="submit"]')
    await page.waitForLoadState('networkidle')
    
    // Naviga alla pagina di conservazione (route corretta)
    await page.goto('http://localhost:3002/conservazione')
    await page.waitForLoadState('networkidle')
    
    // Verifica che la pagina sia caricata correttamente
    const pageContent = await page.textContent('body')
    expect(pageContent).not.toContain('404')
    
    // Cerca il pulsante per aprire il modal (potrebbe essere diverso)
    const createButtons = await page.locator('button').filter({ hasText: /nuovo|crea|aggiungi|add/i }).all()
    
    if (createButtons.length > 0) {
      await createButtons[0].click()
      await page.waitForLoadState('networkidle')
    } else {
      // Se non trova il pulsante, prova a cercare altri elementi
      console.log('Pulsante creazione non trovato, cercando altri elementi...')
      const allButtons = await page.locator('button').all()
      for (let i = 0; i < allButtons.length; i++) {
        const text = await allButtons[i].textContent()
        console.log(`Pulsante ${i}: "${text}"`)
      }
    }
  })

  test('Validazione campo Nome obbligatorio', async ({ page }) => {
    // Prova a inviare il form senza nome
    await page.click('button[type="submit"]')
    
    // Verifica che il form non si chiuda
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    
    // Verifica che il campo nome abbia la classe di errore
    const nameInput = page.locator('input[placeholder*="Frigorifero"]')
    await expect(nameInput).toHaveClass(/border-red/)
  })

  test('Validazione campo Nome minimo 2 caratteri', async ({ page }) => {
    // Inserisci nome troppo corto
    await page.fill('input[placeholder*="Frigorifero"]', 'A')
    
    // Prova a inviare
    await page.click('button[type="submit"]')
    
    // Verifica che il form non si chiuda
    await expect(page.locator('[role="dialog"]')).toBeVisible()
  })

  test('Validazione campo Nome massimo 100 caratteri', async ({ page }) => {
    // Inserisci nome troppo lungo
    const longName = 'A'.repeat(101)
    await page.fill('input[placeholder*="Frigorifero"]', longName)
    
    // Prova a inviare
    await page.click('button[type="submit"]')
    
    // Verifica che il form non si chiuda
    await expect(page.locator('[role="dialog"]')).toBeVisible()
  })

  test('Validazione campo Temperatura obbligatorio', async ({ page }) => {
    // Compila nome valido
    await page.fill('input[placeholder*="Frigorifero"]', 'Frigorifero Test')
    
    // Svuota il campo temperatura
    await page.fill('input[type="number"]', '')
    
    // Prova a inviare
    await page.click('button[type="submit"]')
    
    // Verifica che il form non si chiuda
    await expect(page.locator('[role="dialog"]')).toBeVisible()
  })

  test('Validazione campo Temperatura range valido', async ({ page }) => {
    // Compila nome valido
    await page.fill('input[placeholder*="Frigorifero"]', 'Frigorifero Test')
    
    // Test temperature estreme
    const extremeTemps = [-100, -50, 0, 50, 100]
    
    for (const temp of extremeTemps) {
      await page.fill('input[type="number"]', temp.toString())
      
      // Prova a inviare
      await page.click('button[type="submit"]')
      
      // Verifica che il form non si chiuda per temperature estreme
      await expect(page.locator('[role="dialog"]')).toBeVisible()
    }
  })

  test('Validazione campo Tipo obbligatorio', async ({ page }) => {
    // Compila nome e temperatura
    await page.fill('input[placeholder*="Frigorifero"]', 'Frigorifero Test')
    await page.fill('input[type="number"]', '4')
    
    // Non selezionare nessun tipo
    // Prova a inviare
    await page.click('button[type="submit"]')
    
    // Verifica che il form non si chiuda
    await expect(page.locator('[role="dialog"]')).toBeVisible()
  })

  test('Validazione selezione Tipo Frigorifero', async ({ page }) => {
    // Compila nome e temperatura
    await page.fill('input[placeholder*="Frigorifero"]', 'Frigorifero Test')
    await page.fill('input[type="number"]', '4')
    
    // Seleziona tipo frigorifero
    await page.click('button:has-text("Frigorifero")')
    
    // Verifica che la temperatura sia aggiornata
    const tempInput = page.locator('input[type="number"]')
    await expect(tempInput).toHaveValue('4')
    
    // Prova a inviare
    await page.click('button[type="submit"]')
    
    // Verifica che il form si chiuda (dovrebbe essere valido)
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('Validazione selezione Tipo Congelatore', async ({ page }) => {
    // Compila nome
    await page.fill('input[placeholder*="Frigorifero"]', 'Congelatore Test')
    
    // Seleziona tipo congelatore
    await page.click('button:has-text("Congelatore")')
    
    // Verifica che la temperatura sia aggiornata a -18
    const tempInput = page.locator('input[type="number"]')
    await expect(tempInput).toHaveValue('-18')
    
    // Prova a inviare
    await page.click('button[type="submit"]')
    
    // Verifica che il form si chiuda
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('Validazione selezione Tipo Abbattitore', async ({ page }) => {
    // Compila nome
    await page.fill('input[placeholder*="Frigorifero"]', 'Abbattitore Test')
    
    // Seleziona tipo abbattitore
    await page.click('button:has-text("Abbattitore")')
    
    // Verifica che la temperatura sia aggiornata a -40
    const tempInput = page.locator('input[type="number"]')
    await expect(tempInput).toHaveValue('-40')
    
    // Prova a inviare
    await page.click('button[type="submit"]')
    
    // Verifica che il form si chiuda
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('Validazione selezione Tipo Ambiente', async ({ page }) => {
    // Compila nome
    await page.fill('input[placeholder*="Frigorifero"]', 'Ambiente Test')
    
    // Seleziona tipo ambiente
    await page.click('button:has-text("Ambiente")')
    
    // Verifica che la temperatura sia aggiornata a 20
    const tempInput = page.locator('input[type="number"]')
    await expect(tempInput).toHaveValue('20')
    
    // Prova a inviare
    await page.click('button[type="submit"]')
    
    // Verifica che il form si chiuda
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('Validazione checkbox Abbattitore', async ({ page }) => {
    // Compila nome e temperatura
    await page.fill('input[placeholder*="Frigorifero"]', 'Abbattitore Test')
    await page.fill('input[type="number"]', '-40')
    
    // Seleziona tipo abbattitore
    await page.click('button:has-text("Abbattitore")')
    
    // Attiva checkbox abbattitore
    await page.check('input[type="checkbox"]')
    
    // Verifica che la checkbox sia attiva
    const checkbox = page.locator('input[type="checkbox"]')
    await expect(checkbox).toBeChecked()
    
    // Prova a inviare
    await page.click('button[type="submit"]')
    
    // Verifica che il form si chiuda
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('Validazione aggiunta categorie prodotti', async ({ page }) => {
    // Compila nome e temperatura
    await page.fill('input[placeholder*="Frigorifero"]', 'Frigorifero Test')
    await page.fill('input[type="number"]', '4')
    
    // Seleziona tipo frigorifero
    await page.click('button:has-text("Frigorifero")')
    
    // Aggiungi alcune categorie
    await page.click('button:has-text("Latticini")')
    await page.click('button:has-text("Carne Fresca")')
    
    // Verifica che le categorie siano selezionate
    await expect(page.locator('text=Latticini')).toBeVisible()
    await expect(page.locator('text=Carne Fresca')).toBeVisible()
    
    // Prova a inviare
    await page.click('button[type="submit"]')
    
    // Verifica che il form si chiuda
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('Validazione rimozione categorie prodotti', async ({ page }) => {
    // Compila nome e temperatura
    await page.fill('input[placeholder*="Frigorifero"]', 'Frigorifero Test')
    await page.fill('input[type="number"]', '4')
    
    // Seleziona tipo frigorifero
    await page.click('button:has-text("Frigorifero")')
    
    // Aggiungi alcune categorie
    await page.click('button:has-text("Latticini")')
    await page.click('button:has-text("Carne Fresca")')
    
    // Rimuovi una categoria
    await page.click('button:has-text("Latticini") >> xpath=..//button[contains(@class, "hover:bg-blue-200")]')
    
    // Verifica che la categoria sia rimossa
    await expect(page.locator('text=Latticini')).not.toBeVisible()
    
    // Prova a inviare
    await page.click('button[type="submit"]')
    
    // Verifica che il form si chiuda
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('Validazione aggiunta categoria personalizzata', async ({ page }) => {
    // Compila nome e temperatura
    await page.fill('input[placeholder*="Frigorifero"]', 'Frigorifero Test')
    await page.fill('input[type="number"]', '4')
    
    // Seleziona tipo frigorifero
    await page.click('button:has-text("Frigorifero")')
    
    // Aggiungi categoria personalizzata
    await page.fill('input[placeholder*="categoria personalizzata"]', 'Categoria Test')
    await page.click('button:has-text("+")')
    
    // Verifica che la categoria sia aggiunta
    await expect(page.locator('text=Categoria Test')).toBeVisible()
    
    // Prova a inviare
    await page.click('button[type="submit"]')
    
    // Verifica che il form si chiuda
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('Validazione categoria personalizzata vuota', async ({ page }) => {
    // Compila nome e temperatura
    await page.fill('input[placeholder*="Frigorifero"]', 'Frigorifero Test')
    await page.fill('input[type="number"]', '4')
    
    // Seleziona tipo frigorifero
    await page.click('button:has-text("Frigorifero")')
    
    // Prova ad aggiungere categoria vuota
    await page.fill('input[placeholder*="categoria personalizzata"]', '')
    await page.click('button:has-text("+")')
    
    // Verifica che non sia stata aggiunta
    await expect(page.locator('text=Categoria Test')).not.toBeVisible()
  })

  test('Validazione selezione dipartimento', async ({ page }) => {
    // Compila nome e temperatura
    await page.fill('input[placeholder*="Frigorifero"]', 'Frigorifero Test')
    await page.fill('input[type="number"]', '4')
    
    // Seleziona tipo frigorifero
    await page.click('button:has-text("Frigorifero")')
    
    // Seleziona dipartimento
    await page.selectOption('select', 'kitchen')
    
    // Verifica che il dipartimento sia selezionato
    const departmentSelect = page.locator('select')
    await expect(departmentSelect).toHaveValue('kitchen')
    
    // Prova a inviare
    await page.click('button[type="submit"]')
    
    // Verifica che il form si chiuda
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('Validazione form completo valido', async ({ page }) => {
    // Compila tutti i campi validi
    await page.fill('input[placeholder*="Frigorifero"]', 'Frigorifero Principale')
    await page.fill('input[type="number"]', '4')
    
    // Seleziona tipo frigorifero
    await page.click('button:has-text("Frigorifero")')
    
    // Aggiungi categorie
    await page.click('button:has-text("Latticini")')
    await page.click('button:has-text("Verdure")')
    
    // Seleziona dipartimento
    await page.selectOption('select', 'kitchen')
    
    // Prova a inviare
    await page.click('button[type="submit"]')
    
    // Verifica che il form si chiuda
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
    
    // Verifica che il punto sia stato creato nella lista
    await expect(page.locator('text=Frigorifero Principale')).toBeVisible()
  })

  test('Validazione annullamento form', async ({ page }) => {
    // Compila alcuni campi
    await page.fill('input[placeholder*="Frigorifero"]', 'Frigorifero Test')
    
    // Clicca annulla
    await page.click('button:has-text("Annulla")')
    
    // Verifica che il modal si chiuda
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
    
    // Verifica che i dati non siano stati salvati
    await expect(page.locator('text=Frigorifero Test')).not.toBeVisible()
  })

  test('Validazione chiusura modal con X', async ({ page }) => {
    // Compila alcuni campi
    await page.fill('input[placeholder*="Frigorifero"]', 'Frigorifero Test')
    
    // Clicca X per chiudere
    await page.click('button:has-text("×")')
    
    // Verifica che il modal si chiuda
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('Validazione chiusura modal cliccando fuori', async ({ page }) => {
    // Compila alcuni campi
    await page.fill('input[placeholder*="Frigorifero"]', 'Frigorifero Test')
    
    // Clicca fuori dal modal
    await page.click('div[class*="fixed inset-0"]')
    
    // Verifica che il modal si chiuda
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('Validazione stato loading durante creazione', async ({ page }) => {
    // Compila form valido
    await page.fill('input[placeholder*="Frigorifero"]', 'Frigorifero Test')
    await page.fill('input[type="number"]', '4')
    await page.click('button:has-text("Frigorifero")')
    
    // Prova a inviare
    await page.click('button[type="submit"]')
    
    // Verifica che il pulsante mostri stato loading
    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toContainText('Creazione...')
    
    // Verifica che il pulsante sia disabilitato
    await expect(submitButton).toBeDisabled()
  })

  test('Validazione accessibilità form', async ({ page }) => {
    // Verifica che tutti i campi abbiano label
    const nameLabel = page.locator('label:has-text("Nome Punto di Conservazione")')
    await expect(nameLabel).toBeVisible()
    
    const tempLabel = page.locator('label:has-text("Temperatura di Setpoint")')
    await expect(tempLabel).toBeVisible()
    
    const typeLabel = page.locator('label:has-text("Tipo di Conservazione")')
    await expect(typeLabel).toBeVisible()
    
    // Verifica che i campi siano associati alle label
    const nameInput = page.locator('input[placeholder*="Frigorifero"]')
    await expect(nameInput).toHaveAttribute('id')
    
    const tempInput = page.locator('input[type="number"]')
    await expect(tempInput).toHaveAttribute('id')
  })

  test('Validazione responsive design', async ({ page }) => {
    // Test su schermo mobile
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Verifica che il modal sia visibile
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    
    // Verifica che i campi siano accessibili
    await page.fill('input[placeholder*="Frigorifero"]', 'Frigorifero Mobile')
    
    // Test su schermo tablet
    await page.setViewportSize({ width: 768, height: 1024 })
    
    // Verifica che il modal sia ancora visibile
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    
    // Test su schermo desktop
    await page.setViewportSize({ width: 1920, height: 1080 })
    
    // Verifica che il modal sia ancora visibile
    await expect(page.locator('[role="dialog"]')).toBeVisible()
  })
})
