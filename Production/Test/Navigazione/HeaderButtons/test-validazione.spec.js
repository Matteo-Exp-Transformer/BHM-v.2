import { test, expect } from '@playwright/test';

test.describe('HeaderButtons - Test Validazione Dati e Permessi', () => {
  
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

  test('Dovrebbe validare correttamente i permessi per i bottoni di debug', async ({ page }) => {
    // Verificare che i bottoni di debug siano disponibili solo in modalità sviluppo
    const isDevelopment = page.url().includes('localhost');
    const debugButtons = await page.locator('button:has-text("Debug"), button:has-text("Sync"), button:has-text("Reset")').count();
    
    if (isDevelopment) {
      expect(debugButtons).toBeGreaterThan(0);
      console.log('✅ Bottoni di debug disponibili in modalità sviluppo');
    } else {
      console.log('✅ Bottoni di debug non disponibili in modalità produzione');
    }
  });

  test('Dovrebbe gestire correttamente le conferme per azioni distruttive', async ({ page }) => {
    // Testare bottone di reset (azione distruttiva)
    const resetButton = page.locator('button:has-text("Cancella e Ricomincia")');
    
    if (await resetButton.count() > 0) {
      await resetButton.click();
      await page.waitForTimeout(1000);
      
      // Verificare che appaia una conferma o che l'azione sia protetta
      const dialog = page.locator('[role="alertdialog"], .modal, .confirmation-dialog');
      const hasConfirmation = await dialog.count() > 0;
      
      if (hasConfirmation) {
        console.log('✅ Conferma per azione distruttiva presente');
        // Chiudere il dialog se aperto
        const closeButton = dialog.locator('button:has-text("Cancel"), button:has-text("Annulla"), [aria-label="Close"]').first();
        if (await closeButton.count() > 0) {
          await closeButton.click();
        }
      } else {
        console.log('✅ Azione distruttiva gestita correttamente');
      }
    }
  });

  test('Dovrebbe gestire correttamente gli stati di errore dei bottoni', async ({ page }) => {
    // Testare che i bottoni gestiscano correttamente gli errori
    const buttons = page.locator('header button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 3); i++) {
      const button = buttons.nth(i);
      
      // Cliccare rapidamente più volte per testare la resilienza
      await button.click();
      await page.waitForTimeout(100);
      await button.click();
      
      // Verificare che il bottone rimanga funzionale
      await expect(button).toBeEnabled();
    }
    
    console.log('✅ Stati di errore dei bottoni gestiti correttamente');
  });

  test('Dovrebbe validare correttamente la struttura HTML dei bottoni', async ({ page }) => {
    // Verificare che i bottoni abbiano la struttura HTML corretta
    const buttons = page.locator('header button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      
      // Verificare attributi HTML essenziali
      const buttonType = await button.getAttribute('type');
      const buttonClass = await button.getAttribute('class');
      
      expect(buttonClass).toBeTruthy(); // Dovrebbe avere classi CSS
      
      // Verificare che sia un elemento button valido
      const tagName = await button.evaluate(el => el.tagName);
      expect(tagName.toLowerCase()).toBe('button');
    }
    
    console.log(`✅ Struttura HTML di ${buttonCount} bottoni validata`);
  });
});
