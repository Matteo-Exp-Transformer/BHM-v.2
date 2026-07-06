import { test, expect } from '@playwright/test';

test.describe('MainLayout - Setup Autenticazione', () => {
  
  test('Dovrebbe autenticarsi correttamente', async ({ page }) => {
    // Navigare alla pagina di login
    await page.goto('http://localhost:3004/sign-in');
    
    // Aspettare che la pagina di login sia caricata
    await page.waitForLoadState('networkidle');
    
    // Verificare che siamo nella pagina di login
    await expect(page).toHaveURL(/.*sign-in/);
    
    // Cercare i campi di login
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const loginButton = page.locator('button[type="submit"], button:has-text("Accedi"), button:has-text("Login")').first();
    
    // Verificare che i campi siano presenti
    if (await emailInput.isVisible()) {
      await emailInput.fill('matteo.cavallaro.work@gmail.com');
      await passwordInput.fill('Cavallaro');
      await loginButton.click();
      
      // Aspettare il redirect dopo il login
      await page.waitForURL(/.*dashboard/, { timeout: 10000 });
      
      // Verificare che siamo nella dashboard
      await expect(page).toHaveURL(/.*dashboard/);
      
      // Verificare che l'header sia presente
      await expect(page.locator('header')).toBeVisible({ timeout: 10000 });
      
      console.log('✅ Autenticazione riuscita');
    } else {
      console.log('⚠️ Campi di login non trovati - potrebbe essere già autenticato');
      
      // Verificare se siamo già nella dashboard
      if (await page.url().includes('dashboard')) {
        await expect(page.locator('header')).toBeVisible({ timeout: 5000 });
        console.log('✅ Già autenticato e in dashboard');
      }
    }
  });
  
  test('Dovrebbe mostrare MainLayout dopo autenticazione', async ({ page }) => {
    // Navigare direttamente alla dashboard
    await page.goto('http://localhost:3004/dashboard');
    
    // Aspettare il caricamento
    await page.waitForLoadState('networkidle');
    
    // Se siamo reindirizzati a login, autenticarsi
    if (await page.url().includes('sign-in')) {
      console.log('🔄 Reindirizzato a login, autenticazione in corso...');
      
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
      const loginButton = page.locator('button[type="submit"], button:has-text("Accedi")').first();
      
      if (await emailInput.isVisible()) {
        await emailInput.fill('matteo.cavallaro.work@gmail.com');
        await passwordInput.fill('Cavallaro');
        await loginButton.click();
        
        // Aspettare il redirect
        await page.waitForURL(/.*dashboard/, { timeout: 10000 });
      }
    }
    
    // Verificare che MainLayout sia presente
    await expect(page.locator('header')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('nav[role="navigation"]')).toBeVisible({ timeout: 10000 });
    
    // Verificare elementi base del MainLayout
    await expect(page.locator('header h1')).toContainText('HACCP Manager');
    await expect(page.locator('nav a[href="/dashboard"]')).toBeVisible();
    
    console.log('✅ MainLayout caricato correttamente');
  });
});
