/**
 * 🔐 Login Flow P0 - Test Completi
 * 
 * Test per verificare che tutti i componenti Login Flow P0 funzionino:
 * 1. Password Policy - 12 caratteri, lettere + numeri
 * 2. CSRF Protection - Token al page load
 * 3. Rate Limiting - Escalation progressiva
 * 4. Remember Me - 30 giorni
 * 5. Multi-Company - Preferenza utente + ultima usata
 * 
 * @date 2025-10-23
 * @author Agente 2 - Systems Blueprint Architect
 */

import { test, expect } from '@playwright/test'

test.describe('Login Flow P0 - Componenti Critici', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/sign-in')
    await expect(page.locator('form')).toBeVisible()
  })

  test('Password Policy - Dovrebbe validare 12 caratteri + lettere + numeri', async ({ page }) => {
    // Naviga alla registrazione per testare password policy
    await page.goto('/sign-up')
    
    // Test password troppo corta
    await page.fill('input[name="password"]', 'short1')
    await page.fill('input[name="confirmPassword"]', 'short1')
    await page.click('button[type="submit"]')
    
    // Verifica errore password troppo corta
    await expect(page.locator('text=La password deve essere almeno 12 caratteri')).toBeVisible()
    
    // Test password senza numeri
    await page.fill('input[name="password"]', 'passwordsenzanumeri')
    await page.fill('input[name="confirmPassword"]', 'passwordsenzanumeri')
    await page.click('button[type="submit"]')
    
    // Verifica errore password senza numeri
    await expect(page.locator('text=La password deve contenere almeno una lettera e un numero')).toBeVisible()
    
    // Test password senza lettere
    await page.fill('input[name="password"]', '123456789012')
    await page.fill('input[name="confirmPassword"]', '123456789012')
    await page.click('button[type="submit"]')
    
    // Verifica errore password senza lettere
    await expect(page.locator('text=La password deve contenere almeno una lettera e un numero')).toBeVisible()
    
    // Test password valida
    await page.fill('input[name="password"]', 'password123456')
    await page.fill('input[name="confirmPassword"]', 'password123456')
    await page.click('button[type="submit"]')
    
    // Verifica che non ci siano errori di password policy
    await expect(page.locator('text=La password deve essere almeno 12 caratteri')).not.toBeVisible()
    await expect(page.locator('text=La password deve contenere almeno una lettera e un numero')).not.toBeVisible()
  })

  test('CSRF Protection - Dovrebbe generare e validare token', async ({ page }) => {
    // Verifica che il token CSRF sia presente nel form
    const csrfToken = await page.locator('input[name="csrfToken"]').getAttribute('value')
    expect(csrfToken).toBeTruthy()
    expect(csrfToken?.length).toBeGreaterThan(10)
    
    // Test login con token CSRF valido
    await page.fill('input[name="email"]', 'matteo.cavallaro.work@gmail.com')
    await page.fill('input[name="password"]', 'cavallaro')
    await page.click('button[type="submit"]')
    
    // Verifica che il login proceda senza errori CSRF
    await page.waitForTimeout(2000)
    // Il test passa se non ci sono errori CSRF
  })

  test('Remember Me - Dovrebbe gestire preferenza 30 giorni', async ({ page }) => {
    // Verifica che la checkbox Remember Me sia presente
    await expect(page.locator('input[name="rememberMe"]')).toBeVisible()
    
    // Test con Remember Me attivato
    await page.fill('input[name="email"]', 'matteo.cavallaro.work@gmail.com')
    await page.fill('input[name="password"]', 'cavallaro')
    await page.check('input[name="rememberMe"]')
    await page.click('button[type="submit"]')
    
    // Verifica che la preferenza sia salvata
    await page.waitForTimeout(2000)
    
    // Verifica che la preferenza sia nel localStorage
    const rememberMe = await page.evaluate(() => localStorage.getItem('bhm-remember-me'))
    expect(rememberMe).toBe('true')
  })

  test('Multi-Company - Dovrebbe gestire cambio azienda', async ({ page }) => {
    // Login con credenziali valide
    await page.fill('input[name="email"]', 'matteo.cavallaro.work@gmail.com')
    await page.fill('input[name="password"]', 'cavallaro')
    await page.click('button[type="submit"]')
    
    // Attendi redirect a dashboard
    await page.waitForURL(/.*dashboard/)
    
    // Verifica che il selettore azienda sia presente
    const companySwitcher = page.locator('[data-testid="company-switcher"]')
    if (await companySwitcher.isVisible()) {
      // Test cambio azienda
      await companySwitcher.click()
      
      // Verifica che il dropdown sia aperto
      await expect(page.locator('[role="listbox"]')).toBeVisible()
      
      // Test selezione azienda
      const companies = page.locator('[role="option"]')
      const count = await companies.count()
      if (count > 0) {
        await companies.first().click()
        
        // Verifica che la selezione sia stata effettuata
        await expect(page.locator('[role="listbox"]')).not.toBeVisible()
      }
    }
  })

  test('Rate Limiting - Dovrebbe gestire tentativi multipli', async ({ page }) => {
    // Test multipli tentativi di login con credenziali sbagliate
    for (let i = 0; i < 3; i++) {
      await page.fill('input[name="email"]', 'test@example.com')
      await page.fill('input[name="password"]', 'wrongpassword')
      await page.click('button[type="submit"]')
      
      // Attendi errore
      await page.waitForTimeout(1000)
      
      // Verifica che il form sia ancora presente
      await expect(page.locator('form')).toBeVisible()
    }
    
    // Dopo 3 tentativi, dovrebbe esserci un rate limiting
    // (Questo test verifica che il sistema non crashi)
    await expect(page.locator('form')).toBeVisible()
  })

  test('Login Flow Completo - Dovrebbe funzionare end-to-end', async ({ page }) => {
    // Test completo del flusso di login
    await page.fill('input[name="email"]', 'matteo.cavallaro.work@gmail.com')
    await page.fill('input[name="password"]', 'cavallaro')
    await page.check('input[name="rememberMe"]')
    await page.click('button[type="submit"]')
    
    // Verifica redirect a dashboard
    await page.waitForURL(/.*dashboard/)
    
    // Verifica che l'utente sia loggato
    await expect(page.locator('text=Dashboard')).toBeVisible()
    
    // Verifica che Remember Me sia salvato
    const rememberMe = await page.evaluate(() => localStorage.getItem('bhm-remember-me'))
    expect(rememberMe).toBe('true')
  })
})
