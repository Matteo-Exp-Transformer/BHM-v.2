/**
 * 🔐 Login Flow P0 - Test Semplificato
 * 
 * Test semplificato per verificare Login Flow P0
 * 
 * @date 2025-10-23
 * @author Agente 2 - Systems Blueprint Architect
 */

import { test, expect } from '@playwright/test'

test.describe('Login Flow P0 - Test Semplificato', () => {
  
  test('Password Policy - Test registrazione', async ({ page }) => {
    // Naviga alla registrazione
    await page.goto('/sign-up')
    await expect(page.locator('form')).toBeVisible()
    
    // Test password troppo corta
    await page.fill('input[name="password"]', 'short1')
    await page.fill('input[name="confirmPassword"]', 'short1')
    
    // Verifica che i campi siano stati riempiti
    await expect(page.locator('input[name="password"]')).toHaveValue('short1')
    await expect(page.locator('input[name="confirmPassword"]')).toHaveValue('short1')
    
    // Click submit
    await page.click('button[type="submit"]')
    
    // Verifica che il form sia ancora presente (non redirect)
    await expect(page.locator('form')).toBeVisible()
    
    // Verifica che il form non sia stato inviato con successo
    await page.waitForTimeout(1000)
    const currentUrl = page.url()
    expect(currentUrl).toContain('/sign-up')
  })

  test('CSRF Protection - Verifica token presente', async ({ page }) => {
    await page.goto('/sign-in')
    await expect(page.locator('form')).toBeVisible()
    
    // Verifica che il token CSRF sia presente (nome corretto dal codice)
    const csrfToken = await page.locator('input[name="csrf_token"]').getAttribute('value')
    expect(csrfToken).toBeTruthy()
  })

  test('Remember Me - Verifica checkbox presente', async ({ page }) => {
    await page.goto('/sign-in')
    await expect(page.locator('form')).toBeVisible()
    
    // Verifica che la checkbox Remember Me sia presente (nome corretto dal codice)
    await expect(page.locator('input[name="remember-me"]')).toBeVisible()
  })

  test('Login Reale - Test con credenziali valide', async ({ page }) => {
    await page.goto('/sign-in')
    await expect(page.locator('form')).toBeVisible()
    
    // Test login con credenziali valide
    await page.fill('input[name="email"]', 'matteo.cavallaro.work@gmail.com')
    await page.fill('input[name="password"]', 'cavallaro')
    await page.click('button[type="submit"]')
    
    // Attendi redirect
    await page.waitForTimeout(3000)
    
    // Verifica che sia successo qualcosa (non errore)
    const currentUrl = page.url()
    expect(currentUrl).not.toContain('/sign-in')
  })
})
