// Test per login e poi esecuzione test onboarding
import { test, expect } from '@playwright/test';

test.describe('Login e Test Onboarding', () => {

  test('Login e test BusinessInfoStep', async ({ page }) => {
    // Vai alla homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Clicca su Sign In
    await page.click('button:has-text("Sign In")');
    
    // Compila email
    await page.fill('input[type="email"]', 'matteo.cavallaro.work@gmail.com');
    
    // Compila password
    await page.fill('input[type="password"]', 'cavallaro');
    
    // Clicca su Sign In
    await page.click('button:has-text("Sign In")');
    
    // Attendi che il login sia completato
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Verifica che siamo loggati (dovrebbe esserci il pulsante "Onboarding")
    await expect(page.locator('button:has-text("Onboarding")')).toBeVisible();
    
    // Clicca sul pulsante "Onboarding" per aprire l'onboarding
    await page.click('button:has-text("Onboarding")');
    
    // Attendi caricamento componente BusinessInfoStep
    await page.waitForSelector('h2:has-text("Informazioni Aziendali")');
    
    // Verifica che il componente sia caricato correttamente
    await expect(page.locator('h2:has-text("Informazioni Aziendali")')).toBeVisible();
    await expect(page.locator('button:has-text("🚀 Compila con dati di esempio")')).toBeVisible();
    
    console.log('✅ Login completato e BusinessInfoStep caricato correttamente');
  });
});
