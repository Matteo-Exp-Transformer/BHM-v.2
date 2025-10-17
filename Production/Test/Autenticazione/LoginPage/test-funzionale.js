/**
 * 🔐 LoginPage - Test Funzionali Completi
 * 
 * Test per tutte le funzionalità della pagina di login
 * Seguendo le procedure di blindatura multi-agent
 * 
 * @author Agente 2 - Form e Validazioni
 * @date 2025-01-16
 */

const { test, expect } = require('@playwright/test')

test.describe('LoginPage - Test Funzionali', () => {
  
  test.beforeEach(async ({ page }) => {
    // Naviga alla pagina di login
    await page.goto('/sign-in')
    
    // Scroll completo per identificare tutti gli elementi
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(500)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2))
    await page.waitForTimeout(500)
  })

  test('Dovrebbe caricare correttamente la pagina di login', async ({ page }) => {
    // Verifica elementi principali
    await expect(page.locator('h1')).toContainText('Business Haccp Manager')
    await expect(page.locator('h2')).toContainText('Accedi al Sistema')
    
    // Verifica form presente
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('Dovrebbe mostrare tutti i link di navigazione', async ({ page }) => {
    // Link password dimenticata
    await expect(page.locator('a[href="/forgot-password"]')).toBeVisible()
    await expect(page.locator('a[href="/forgot-password"]')).toContainText('Password dimenticata?')
    
    // Link registrazione
    await expect(page.locator('a[href="/sign-up"]')).toBeVisible()
    await expect(page.locator('a[href="/sign-up"]')).toContainText('Registrati ora')
    
    // Bottone torna alla home
    await expect(page.locator('button:has-text("Torna alla home")')).toBeVisible()
  })

  test('Dovrebbe permettere inserimento email e password', async ({ page }) => {
    const email = 'test@example.com'
    const password = 'password123'
    
    // Inserisci email
    await page.fill('input[name="email"]', email)
    await expect(page.locator('input[name="email"]')).toHaveValue(email)
    
    // Inserisci password
    await page.fill('input[name="password"]', password)
    await expect(page.locator('input[name="password"]')).toHaveValue(password)
  })

  test('Dovrebbe gestire toggle password visibility', async ({ page }) => {
    const password = 'password123'
    
    // Inserisci password
    await page.fill('input[name="password"]', password)
    
    // Verifica che password sia nascosta inizialmente
    await expect(page.locator('input[name="password"]')).toHaveAttribute('type', 'password')
    
    // Clicca toggle password
    await page.click('button[type="button"]:has(svg)')
    
    // Verifica che password sia visibile
    await expect(page.locator('input[name="password"]')).toHaveAttribute('type', 'text')
    
    // Clicca di nuovo per nascondere
    await page.click('button[type="button"]:has(svg)')
    
    // Verifica che password sia nascosta
    await expect(page.locator('input[name="password"]')).toHaveAttribute('type', 'password')
  })

  test('Dovrebbe mostrare stato loading durante submit', async ({ page }) => {
    // Inserisci credenziali
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    
    // Clicca submit
    await page.click('button[type="submit"]')
    
    // Verifica stato loading
    await expect(page.locator('button[type="submit"]:has-text("Accesso in corso...")')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeDisabled()
  })

  test('Dovrebbe navigare correttamente ai link', async ({ page }) => {
    // Test link password dimenticata
    await page.click('a[href="/forgot-password"]')
    await expect(page).toHaveURL('/forgot-password')
    
    // Torna indietro
    await page.goBack()
    
    // Test link registrazione
    await page.click('a[href="/sign-up"]')
    await expect(page).toHaveURL('/sign-up')
    
    // Torna indietro
    await page.goBack()
    
    // Test bottone torna alla home
    await page.click('button:has-text("Torna alla home")')
    await expect(page).toHaveURL('/')
  })

  test('Dovrebbe avere accessibilità corretta', async ({ page }) => {
    // Verifica label associati agli input
    await expect(page.locator('label[for="email"]')).toBeVisible()
    await expect(page.locator('label[for="password"]')).toBeVisible()
    
    // Verifica placeholder
    await expect(page.locator('input[name="email"]')).toHaveAttribute('placeholder', 'mario@esempio.com')
    await expect(page.locator('input[name="password"]')).toHaveAttribute('placeholder', '••••••••')
    
    // Verifica autocomplete
    await expect(page.locator('input[name="email"]')).toHaveAttribute('autocomplete', 'email')
    await expect(page.locator('input[name="password"]')).toHaveAttribute('autocomplete', 'current-password')
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
    
    // Tab per password
    await page.keyboard.press('Tab')
    await expect(page.locator('input[name="password"]')).toBeFocused()
    
    // Tab per submit button
    await page.keyboard.press('Tab')
    await expect(page.locator('button[type="submit"]')).toBeFocused()
  })
})