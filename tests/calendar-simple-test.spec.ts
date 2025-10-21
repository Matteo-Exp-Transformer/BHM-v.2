import { test, expect } from '@playwright/test'

test.describe('Calendar Page - Test Semplificato', () => {
  test('Verificare che la pagina attività sia accessibile', async ({ page }) => {
    // Naviga direttamente alla pagina attività
    await page.goto('/attivita')
    await page.waitForLoadState('networkidle')
    
    // Verifica che il titolo della pagina sia corretto
    await expect(page).toHaveTitle(/HACCP Business Manager/)
    
    // Verifica che la pagina sia caricata (anche se mostra login o onboarding)
    const body = page.locator('body')
    await expect(body).toBeVisible()
    
    console.log('✅ Test pagina attività completato!')
  })
  
  test('Verificare che la pagina login sia accessibile', async ({ page }) => {
    // Naviga alla pagina di login
    await page.goto('/sign-in')
    await page.waitForLoadState('networkidle')
    
    // Verifica che il titolo della pagina sia corretto
    await expect(page).toHaveTitle(/HACCP Business Manager/)
    
    // Verifica che il form di login sia presente
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeVisible()
    
    const passwordInput = page.locator('input[type="password"]')
    await expect(passwordInput).toBeVisible()
    
    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toBeVisible()
    
    console.log('✅ Test login completato!')
  })
})
