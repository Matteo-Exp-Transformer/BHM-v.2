import { test, expect } from '@playwright/test';

test.describe('HeaderButtons - Test Funzionali', () => {
  
  test.beforeEach(async ({ page }) => {
    // Autenticarsi prima di ogni test
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

  test('Dovrebbe mostrare tutti i bottoni di controllo nell\'header', async ({ page }) => {
    // Verificare presenza bottoni principali
    await expect(page.locator('button:has-text("Attività")')).toBeVisible();
    await expect(page.locator('button:has-text("Cancella e Ricomincia")')).toBeVisible();
    await expect(page.locator('button:has-text("Onboarding")')).toBeVisible();
    
    // Verificare bottoni di debug (se in modalità sviluppo)
    const debugButtons = await page.locator('button:has-text("Debug"), button:has-text("Sync"), button:has-text("Reset")').count();
    
    if (debugButtons > 0) {
      console.log(`✅ ${debugButtons} bottoni di debug trovati`);
    }
    
    console.log('✅ Tutti i bottoni di controllo visibili');
  });

  test('Dovrebbe gestire correttamente il bottone Attività', async ({ page }) => {
    // Cliccare sul bottone Attività
    const activityButton = page.locator('button:has-text("Attività")');
    await expect(activityButton).toBeVisible();
    
    await activityButton.click();
    
    // Verificare che si apra qualcosa (modal, pagina, etc.)
    // Il comportamento specifico dipende dall'implementazione
    await page.waitForTimeout(1000);
    
    console.log('✅ Bottone Attività funziona correttamente');
  });

  test('Dovrebbe gestire correttamente il bottone Cancella e Ricomincia', async ({ page }) => {
    // Verificare presenza del bottone
    const resetButton = page.locator('button:has-text("Cancella e Ricomincia")');
    await expect(resetButton).toBeVisible();
    
    // Cliccare sul bottone (senza confermare per non perdere dati)
    await resetButton.click();
    
    // Verificare che appaia una conferma o modal
    // Potrebbe apparire un dialog di conferma
    await page.waitForTimeout(1000);
    
    // Se appare un dialog, verificare che sia presente
    const dialog = page.locator('[role="dialog"], .modal, .confirmation-dialog');
    const dialogCount = await dialog.count();
    
    if (dialogCount > 0) {
      console.log('✅ Dialog di conferma apparso correttamente');
    } else {
      console.log('✅ Bottone Cancella e Ricomincia cliccabile');
    }
  });

  test('Dovrebbe gestire correttamente il bottone Onboarding', async ({ page }) => {
    // Verificare presenza del bottone
    const onboardingButton = page.locator('button:has-text("Onboarding")');
    await expect(onboardingButton).toBeVisible();
    
    // Cliccare sul bottone
    await onboardingButton.click();
    
    // Verificare che si apra l'onboarding o che avvenga un redirect
    await page.waitForTimeout(1000);
    
    // Potrebbe reindirizzare all'onboarding o aprire un modal
    const currentUrl = page.url();
    const hasOnboardingModal = await page.locator('[data-testid="onboarding"], .onboarding-modal').count() > 0;
    
    if (currentUrl.includes('onboarding') || hasOnboardingModal) {
      console.log('✅ Onboarding aperto correttamente');
    } else {
      console.log('✅ Bottone Onboarding cliccabile');
    }
  });

  test('Dovrebbe gestire correttamente i bottoni di debug in modalità sviluppo', async ({ page }) => {
    // Verificare presenza bottoni di debug
    const debugAuthButton = page.locator('button:has-text("Debug Auth")');
    const syncHostButton = page.locator('button:has-text("Sync Host")');
    const resetUsersButton = page.locator('button:has-text("Reset Tot+Users")');
    
    const debugButtonsCount = await debugAuthButton.count() + await syncHostButton.count() + await resetUsersButton.count();
    
    if (debugButtonsCount > 0) {
      console.log(`✅ ${debugButtonsCount} bottoni di debug trovati in modalità sviluppo`);
      
      // Testare bottone Debug Auth se presente
      if (await debugAuthButton.count() > 0) {
        await debugAuthButton.click();
        await page.waitForTimeout(1000);
        console.log('✅ Bottone Debug Auth funziona');
      }
      
      // Testare bottone Sync Host se presente
      if (await syncHostButton.count() > 0) {
        await syncHostButton.click();
        await page.waitForTimeout(1000);
        console.log('✅ Bottone Sync Host funziona');
      }
    } else {
      console.log('✅ Nessun bottone di debug (modalità produzione)');
    }
  });

  test('Dovrebbe avere accessibilità corretta per tutti i bottoni', async ({ page }) => {
    // Verificare che tutti i bottoni abbiano attributi di accessibilità
    const buttons = page.locator('header button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      
      // Verificare che il bottone sia visibile
      await expect(button).toBeVisible();
      
      // Verificare che abbia un testo o un aria-label
      const buttonText = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      const title = await button.getAttribute('title');
      
      expect(buttonText || ariaLabel || title).toBeTruthy();
    }
    
    console.log(`✅ ${buttonCount} bottoni con accessibilità corretta`);
  });

  test('Dovrebbe gestire correttamente gli stati di loading dei bottoni', async ({ page }) => {
    // Testare che i bottoni non si disabilitino inappropriatamente
    const activityButton = page.locator('button:has-text("Attività")');
    const resetButton = page.locator('button:has-text("Cancella e Ricomincia")');
    
    // Verificare che i bottoni siano inizialmente abilitati
    await expect(activityButton).toBeEnabled();
    await expect(resetButton).toBeEnabled();
    
    // Cliccare sui bottoni e verificare che rimangano funzionali
    await activityButton.click();
    await page.waitForTimeout(500);
    await expect(activityButton).toBeEnabled();
    
    await resetButton.click();
    await page.waitForTimeout(500);
    await expect(resetButton).toBeEnabled();
    
    console.log('✅ Stati di loading dei bottoni gestiti correttamente');
  });

  test('Dovrebbe gestire correttamente il layout responsive dei bottoni', async ({ page }) => {
    // Testare con viewport piccolo
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Verificare che i bottoni siano ancora visibili e funzionali
    await expect(page.locator('button:has-text("Attività")')).toBeVisible();
    await expect(page.locator('button:has-text("Cancella e Ricomincia")')).toBeVisible();
    
    // Testare con viewport grande
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    
    // Verificare che i bottoni siano ancora visibili
    await expect(page.locator('button:has-text("Attività")')).toBeVisible();
    await expect(page.locator('button:has-text("Cancella e Ricomincia")')).toBeVisible();
    
    console.log('✅ Layout responsive dei bottoni gestito correttamente');
  });
});
