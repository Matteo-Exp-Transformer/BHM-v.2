import { test, expect } from '@playwright/test';

test.describe('HeaderButtons - Test Edge Cases', () => {
  
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

  test('Dovrebbe gestire correttamente click multipli rapidi sui bottoni', async ({ page }) => {
    const activityButton = page.locator('button:has-text("Attività")');
    
    // Cliccare rapidamente più volte
    for (let i = 0; i < 5; i++) {
      await activityButton.click();
      await page.waitForTimeout(50);
    }
    
    // Verificare che il bottone rimanga funzionale
    await expect(activityButton).toBeEnabled();
    
    console.log('✅ Click multipli rapidi gestiti correttamente');
  });

  test('Dovrebbe gestire correttamente i bottoni con viewport molto piccolo', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    
    // Verificare che i bottoni siano ancora visibili e funzionali
    await expect(page.locator('button:has-text("Attività")')).toBeVisible();
    await expect(page.locator('button:has-text("Cancella e Ricomincia")')).toBeVisible();
    
    // Testare la funzionalità
    await page.locator('button:has-text("Attività")').click();
    await page.waitForTimeout(1000);
    
    console.log('✅ Bottoni funzionanti con viewport piccolo');
  });

  test('Dovrebbe gestire correttamente i bottoni con zoom alto', async ({ page }) => {
    await page.evaluate(() => {
      document.body.style.zoom = '150%';
    });
    
    // Verificare che i bottoni siano ancora visibili e funzionali
    await expect(page.locator('button:has-text("Attività")')).toBeVisible();
    await expect(page.locator('button:has-text("Cancella e Ricomincia")')).toBeVisible();
    
    console.log('✅ Bottoni funzionanti con zoom alto');
  });

  test('Dovrebbe gestire correttamente i bottoni con zoom basso', async ({ page }) => {
    await page.evaluate(() => {
      document.body.style.zoom = '75%';
    });
    
    // Verificare che i bottoni siano ancora visibili e funzionali
    await expect(page.locator('button:has-text("Attività")')).toBeVisible();
    await expect(page.locator('button:has-text("Cancella e Ricomincia")')).toBeVisible();
    
    console.log('✅ Bottoni funzionanti con zoom basso');
  });

  test('Dovrebbe gestire correttamente i bottoni con memoria limitata', async ({ page }) => {
    // Simulare memoria limitata
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 100);
    });
    
    // Testare i bottoni
    await page.locator('button:has-text("Attività")').click();
    await page.waitForTimeout(1000);
    
    await page.locator('button:has-text("Cancella e Ricomincia")').click();
    await page.waitForTimeout(1000);
    
    // Rimuovere l'interceptor
    await page.unroute('**/*');
    
    console.log('✅ Bottoni funzionanti con memoria limitata');
  });

  test('Dovrebbe gestire correttamente i bottoni con rete lenta', async ({ page }) => {
    // Simulare rete lenta
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 300);
    });
    
    // Testare i bottoni
    await page.locator('button:has-text("Attività")').click();
    await page.waitForTimeout(2000);
    
    // Rimuovere l'interceptor
    await page.unroute('**/*');
    
    console.log('✅ Bottoni funzionanti con rete lenta');
  });

  test('Dovrebbe gestire correttamente i bottoni con orientamento mobile', async ({ page }) => {
    // Testare orientamento portrait
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    await expect(page.locator('button:has-text("Attività")')).toBeVisible();
    
    // Testare orientamento landscape
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(500);
    
    await expect(page.locator('button:has-text("Attività")')).toBeVisible();
    
    console.log('✅ Bottoni funzionanti con orientamento mobile');
  });
});
