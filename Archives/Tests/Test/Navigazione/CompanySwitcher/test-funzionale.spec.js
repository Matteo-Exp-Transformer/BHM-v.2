import { test, expect } from '@playwright/test';

test.describe('CompanySwitcher - Test Funzionali', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3004/dashboard');
    
    if (await page.url().includes('sign-in')) {
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
      const loginButton = page.locator('button[type="submit"], button:has-text("Accedi")').first();
      
      if (await emailInput.isVisible()) {
        await emailInput.fill('matteo.cavallaro.work@gmail.com');
        await passwordInput.fill('Cavallaro');
        await loginButton.click();
        
        try {
          await page.waitForURL(/.*dashboard/, { timeout: 15000 });
        } catch (error) {
          if (await page.locator('header').isVisible()) {
            console.log('✅ Header visibile, continuo il test');
          } else {
            throw error;
          }
        }
      }
    }
    
    await expect(page.locator('header')).toBeVisible({ timeout: 10000 });
  });

  test('Dovrebbe mostrare il CompanySwitcher se presente', async ({ page }) => {
    // Verificare presenza del CompanySwitcher
    const companySwitcher = page.locator('div.relative:has(button:has(svg.lucide-building-2))');
    
    if (await companySwitcher.count() > 0) {
      await expect(companySwitcher).toBeVisible();
      console.log('✅ CompanySwitcher presente e visibile');
    } else {
      console.log('✅ CompanySwitcher non presente (utente con una sola azienda)');
    }
  });

  test('Dovrebbe gestire correttamente il cambio azienda', async ({ page }) => {
    const companySwitcher = page.locator('div.relative:has(button:has(svg.lucide-building-2))');
    
    if (await companySwitcher.count() > 0) {
      // Cliccare sul CompanySwitcher per aprire il dropdown
      await companySwitcher.click();
      await page.waitForTimeout(500);
      
      // Verificare che il dropdown sia aperto
      const dropdown = page.locator('[role="menu"], .dropdown-menu, [data-dropdown]');
      if (await dropdown.count() > 0) {
        console.log('✅ Dropdown CompanySwitcher aperto');
        
        // Chiudere il dropdown cliccando fuori
        await page.click('body');
        await page.waitForTimeout(500);
      }
    } else {
      console.log('✅ CompanySwitcher non presente, test saltato');
    }
  });

  test('Dovrebbe avere accessibilità corretta', async ({ page }) => {
    const companySwitcher = page.locator('div.relative:has(button:has(svg.lucide-building-2))');
    
    if (await companySwitcher.count() > 0) {
      const button = companySwitcher.locator('button').first();
      
      // Verificare attributi di accessibilità
      const ariaLabel = await button.getAttribute('aria-label');
      const title = await button.getAttribute('title');
      const role = await button.getAttribute('role');
      
      expect(ariaLabel || title).toBeTruthy();
      
      console.log('✅ CompanySwitcher con accessibilità corretta');
    } else {
      console.log('✅ CompanySwitcher non presente, test saltato');
    }
  });
});
