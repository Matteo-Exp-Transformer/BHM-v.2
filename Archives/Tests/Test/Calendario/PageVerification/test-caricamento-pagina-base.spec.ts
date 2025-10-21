import { test, expect } from '@playwright/test'

test.describe('Calendar Page - Test Base Funzionante', () => {
  test('Verificare che la pagina calendario si carichi correttamente', async ({ page }) => {
    // Prima autentica l'utente
    await page.goto('/sign-in')
    await page.waitForLoadState('networkidle')
    
    // Compila il form di login
    await page.fill('input[type="email"]', 'test@bhm.local')
    await page.fill('input[type="password"]', 'testpassword')
    await page.click('button[type="submit"]')
    
    // Attendi il redirect dopo il login
    await page.waitForURL('/dashboard')
    
    // Naviga alla pagina attività (route corretta)
    await page.goto('/attivita')
    await page.waitForLoadState('networkidle')
    
    // Verifica che il titolo della pagina sia corretto
    await expect(page).toHaveTitle(/HACCP Business Manager/)
    
    // Verifica che elementi chiave siano presenti
    await expect(page.locator('h1')).toContainText('Attività e Mansioni')
    
    // Verifica che il calendario sia presente (anche se vuoto)
    const calendarContainer = page.locator('.fc')
    await expect(calendarContainer).toBeVisible()
    
    console.log('✅ Test base completato con successo!')
  })
  
  test('Verificare che i filtri del calendario siano presenti', async ({ page }) => {
    // Prima autentica l'utente
    await page.goto('/sign-in')
    await page.waitForLoadState('networkidle')
    
    // Compila il form di login
    await page.fill('input[type="email"]', 'test@bhm.local')
    await page.fill('input[type="password"]', 'testpassword')
    await page.click('button[type="submit"]')
    
    // Attendi il redirect dopo il login
    await page.waitForURL('/dashboard')
    
    // Naviga alla pagina attività (route corretta)
    await page.goto('/attivita')
    await page.waitForLoadState('networkidle')
    
    // Verifica che il pulsante per creare eventi sia presente
    const createButton = page.locator('button').filter({ hasText: /Assegna nuova attività|mansione/ })
    await expect(createButton.first()).toBeVisible()
    
    // Verifica che le statistiche siano presenti
    const statsSection = page.locator('text=Statistiche')
    await expect(statsSection).toBeVisible()
    
    console.log('✅ Test filtri completato con successo!')
  })
})
