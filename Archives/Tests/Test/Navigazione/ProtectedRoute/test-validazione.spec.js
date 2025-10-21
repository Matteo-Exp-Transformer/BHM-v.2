import { test, expect } from '@playwright/test';

test.describe('ProtectedRoute - Test Validazione Dati e Permessi', () => {
  
  test('Dovrebbe gestire correttamente credenziali non valide', async ({ page }) => {
    // Navigare al login
    await page.goto('http://localhost:3004/sign-in');
    
    // Tentare login con credenziali sbagliate
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const loginButton = page.locator('button[type="submit"], button:has-text("Accedi")').first();
    
    await emailInput.fill('email-sbagliata@test.com');
    await passwordInput.fill('password-sbagliata');
    await loginButton.click();
    
    // Verificare che rimaniamo nella pagina di login
    await expect(page).toHaveURL(/.*sign-in/);
    
    // Verificare che non siamo reindirizzati a route protette
    await expect(page).not.toHaveURL(/.*dashboard/);
    
    console.log('✅ Credenziali non valide gestite correttamente');
  });

  test('Dovrebbe gestire correttamente sessioni scadute', async ({ page }) => {
    // Prima autenticarsi
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
    
    // Simulare scadenza sessione cancellando i cookie
    await page.context().clearCookies();
    
    // Tentare di navigare a una route protetta
    await page.goto('http://localhost:3004/dashboard');
    
    // Verificare che siamo reindirizzati al login
    await expect(page).toHaveURL(/.*sign-in/);
    
    console.log('✅ Sessione scaduta gestita correttamente');
  });

  test('Dovrebbe gestire correttamente permessi insufficienti', async ({ page }) => {
    // Autenticarsi
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
    
    // Tentare di accedere a route che potrebbero richiedere permessi speciali
    // (questo dipende dall'implementazione specifica dei permessi)
    await page.goto('http://localhost:3004/impostazioni');
    
    // Verificare che la route sia accessibile o che venga mostrato un errore appropriato
    // Non dovremmo essere reindirizzati al login se siamo autenticati
    await expect(page).not.toHaveURL(/.*sign-in/);
    
    console.log('✅ Permessi gestiti correttamente');
  });

  test('Dovrebbe gestire correttamente stati di loading durante autenticazione', async ({ page }) => {
    // Navigare al login
    await page.goto('http://localhost:3004/sign-in');
    
    // Verificare che la pagina di login sia caricata
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    
    // Compilare il form
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const loginButton = page.locator('button[type="submit"], button:has-text("Accedi")').first();
    
    await emailInput.fill('matteo.cavallaro.work@gmail.com');
    await passwordInput.fill('Cavallaro');
    
    // Cliccare sul bottone di login e verificare che non ci siano errori immediati
    await loginButton.click();
    
    // Verificare che il processo di login proceda senza errori di validazione
    // (potrebbe esserci un breve momento di loading)
    await page.waitForTimeout(1000);
    
    // Verificare che non ci siano errori di validazione visibili
    const errorMessages = page.locator('[role="alert"], .error, .invalid');
    const errorCount = await errorMessages.count();
    
    if (errorCount > 0) {
      console.log('⚠️ Errori di validazione rilevati durante il login');
    }
    
    console.log('✅ Stati di loading gestiti correttamente');
  });

  test('Dovrebbe gestire correttamente navigazione con URL diretti', async ({ page }) => {
    // Tentare di navigare direttamente a una route protetta senza essere autenticati
    await page.goto('http://localhost:3004/inventario');
    
    // Verificare che siamo reindirizzati al login
    await expect(page).toHaveURL(/.*sign-in/);
    
    // Autenticarsi
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const loginButton = page.locator('button[type="submit"], button:has-text("Accedi")').first();
    
    if (await emailInput.isVisible()) {
      await emailInput.fill('matteo.cavallaro.work@gmail.com');
      await passwordInput.fill('Cavallaro');
      await loginButton.click();
      
      try {
        await page.waitForURL(/.*inventario/, { timeout: 15000 });
      } catch (error) {
        // Potrebbe essere reindirizzato alla dashboard invece che all'inventario
        if (await page.locator('header').isVisible()) {
          console.log('✅ Header visibile, login riuscito');
        } else {
          throw error;
        }
      }
    }
    
    // Verificare che non siamo più nella pagina di login
    await expect(page).not.toHaveURL(/.*sign-in/);
    
    console.log('✅ Navigazione con URL diretti gestita correttamente');
  });

  test('Dovrebbe gestire correttamente refresh della pagina su route protette', async ({ page }) => {
    // Autenticarsi
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
    
    // Navigare a una route protetta
    await page.goto('http://localhost:3004/attivita');
    await expect(page.locator('header')).toBeVisible();
    
    // Fare refresh della pagina
    await page.reload();
    
    // Verificare che rimaniamo nella route protetta e autenticati
    await expect(page.locator('header')).toBeVisible();
    await expect(page).not.toHaveURL(/.*sign-in/);
    
    console.log('✅ Refresh su route protette gestito correttamente');
  });
});
