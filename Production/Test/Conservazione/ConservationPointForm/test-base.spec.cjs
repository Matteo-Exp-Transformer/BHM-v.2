/**
 * 🧪 Test Semplice ConservationPointForm
 * 
 * Test base per verificare l'accessibilità del form
 * 
 * @date 2025-01-16
 * @agent Agente-2-Form-Validazioni
 */

const { test, expect } = require('@playwright/test')

test.describe('ConservationPointForm - Test Base', () => {
  test('Verifica caricamento pagina conservazione', async ({ page }) => {
    // Naviga alla pagina di conservazione
    await page.goto('http://localhost:3002/conservation')
    
    // Attendi che la pagina sia caricata
    await page.waitForLoadState('networkidle')
    
    // Verifica che la pagina sia caricata
    await expect(page).toHaveTitle(/Business HACCP Manager/)
    
    // Verifica che ci sia un elemento con testo "conservazione" o simile
    const pageContent = await page.textContent('body')
    expect(pageContent).toContain('conservazione')
  })

  test('Verifica presenza pulsanti nella pagina', async ({ page }) => {
    // Naviga alla pagina di conservazione
    await page.goto('http://localhost:3002/conservation')
    
    // Attendi che la pagina sia caricata
    await page.waitForLoadState('networkidle')
    
    // Cerca tutti i pulsanti nella pagina
    const buttons = await page.locator('button').all()
    console.log('Pulsanti trovati:', buttons.length)
    
    // Stampa il testo di tutti i pulsanti
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent()
      console.log(`Pulsante ${i}: "${text}"`)
    }
    
    // Verifica che ci sia almeno un pulsante
    expect(buttons.length).toBeGreaterThan(0)
  })

  test('Verifica struttura pagina conservazione', async ({ page }) => {
    // Naviga alla pagina di conservazione
    await page.goto('http://localhost:3002/conservation')
    
    // Attendi che la pagina sia caricata
    await page.waitForLoadState('networkidle')
    
    // Verifica che ci sia un elemento principale
    const mainElement = page.locator('main, [role="main"], .main-content')
    await expect(mainElement).toBeVisible()
    
    // Verifica che ci sia un header o titolo
    const headerElement = page.locator('h1, h2, h3, header, .header')
    await expect(headerElement).toBeVisible()
  })
})
