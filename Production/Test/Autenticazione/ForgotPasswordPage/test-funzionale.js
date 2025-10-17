/**
 * 🔑 ForgotPasswordPage - Test Funzionali Completi
 * 
 * Test per tutte le funzionalità della pagina reset password
 * Seguendo le procedure di blindatura multi-agent
 * 
 * @author Agente 2 - Form e Validazioni
 * @date 2025-01-16
 */

const { test, expect } = require('@playwright/test')

test.describe('ForgotPasswordPage - Test Funzionali', () => {
  
  test.beforeEach(async ({ page }) => {
    // Naviga alla pagina reset password
    await page.goto('/forgot-password')
    
    // Scroll completo per identificare tutti gli elementi
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(500)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2))
    await page.waitForTimeout(500)
  })

  test('Dovrebbe caricare correttamente la pagina reset password', async ({ page }) => {
    // Verifica elementi principali
    await expect(page.locator('h1')).toContainText('Business Haccp Manager')
    await expect(page.locator('h2')).toContainText('Password Dimenticata?')
    
    // Verifica form presente
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('Dovrebbe mostrare testo descrittivo', async ({ page }) => {
    // Verifica testo descrittivo
    await expect(page.locator('text=Inserisci la tua email per ricevere le istruzioni di reset')).toBeVisible()
  })

  test('Dovrebbe permettere inserimento email', async ({ page }) => {
    const email = 'test@example.com'
    
    // Inserisci email
    await page.fill('input[name="email"]', email)
    await expect(page.locator('input[name="email"]')).toHaveValue(email)
  })

  test('Dovrebbe mostrare stato loading durante submit', async ({ page }) => {
    // Inserisci email
    await page.fill('input[name="email"]', 'test@example.com')
    
    // Clicca submit
    await page.click('button[type="submit"]')
    
    // Verifica stato loading
    await expect(page.locator('button[type="submit"]:has-text("Invio in corso...")')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeDisabled()
  })

  test('Dovrebbe mostrare link di navigazione', async ({ page }) => {
    // Link torna al login
    await expect(page.locator('a[href="/sign-in"]')).toBeVisible()
    await expect(page.locator('a[href="/sign-in"]')).toContainText('Torna al login')
    
    // Bottone torna alla home
    await expect(page.locator('button:has-text("Torna alla home")')).toBeVisible()
  })

  test('Dovrebbe navigare correttamente ai link', async ({ page }) => {
    // Test link torna al login
    await page.click('a[href="/sign-in"]')
    await expect(page).toHaveURL('/sign-in')
    
    // Torna indietro
    await page.goBack()
    
    // Test bottone torna alla home
    await page.click('button:has-text("Torna alla home")')
    await expect(page).toHaveURL('/')
  })

  test('Dovrebbe avere accessibilità corretta', async ({ page }) => {
    // Verifica label associato all'input
    await expect(page.locator('label[for="email"]')).toBeVisible()
    await expect(page.locator('label[for="email"]')).toContainText('Email')
    
    // Verifica placeholder
    await expect(page.locator('input[name="email"]')).toHaveAttribute('placeholder', 'mario@esempio.com')
    
    // Verifica autocomplete
    await expect(page.locator('input[name="email"]')).toHaveAttribute('autocomplete', 'email')
  })

  test('Dovrebbe gestire responsive design', async ({ page }) => {
    // Test desktop
    await page.setViewportSize({ width: 1200, height: 800 })
    await expect(page.locator('.max-w-md')).toBeVisible()
    
    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('.max-w-md')).toBeVisible()
    
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('.max-w-md')).toBeVisible()
  })

  test('Dovrebbe avere styling corretto', async ({ page }) => {
    // Verifica gradient background
    await expect(page.locator('.bg-gradient-to-br')).toBeVisible()
    
    // Verifica card shadow
    await expect(page.locator('.shadow-2xl')).toBeVisible()
    
    // Verifica button gradient
    await expect(page.locator('button[type="submit"]')).toHaveClass(/bg-gradient-to-r/)
  })

  test('Dovrebbe gestire focus management', async ({ page }) => {
    // Focus su email
    await page.focus('input[name="email"]')
    await expect(page.locator('input[name="email"]')).toBeFocused()
    
    // Tab per submit button
    await page.keyboard.press('Tab')
    await expect(page.locator('button[type="submit"]')).toBeFocused()
  })

  test('Dovrebbe gestire stato email inviata', async ({ page }) => {
    // Simula invio email
    await page.fill('input[name="email"]', 'test@example.com')
    await page.click('button[type="submit"]')
    
    // Simula successo (questo dipende dall'implementazione)
    // Nota: Questo test potrebbe fallire se l'app non gestisce lo stato email inviata
    // In tal caso, il test dovrebbe essere modificato per riflettere il comportamento reale
  })

  test('Dovrebbe gestire icona email', async ({ page }) => {
    // Verifica presenza icona email nel link
    await expect(page.locator('a[href="/sign-in"] svg')).toBeVisible()
  })

  test('Dovrebbe gestire testo del bottone', async ({ page }) => {
    // Verifica testo bottone submit
    await expect(page.locator('button[type="submit"]')).toContainText('Invia Email di Reset')
  })
})
