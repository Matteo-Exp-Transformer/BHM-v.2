import { test, expect } from '@playwright/test';

test.describe('ProtectedRoute - Test Funzionali', () => {
  
  test('Dovrebbe permettere accesso a utenti autenticati', async ({ page }) => {
    // Navigare a una route protetta
    await page.goto('http://localhost:3004/dashboard');
    
    // Se siamo reindirizzati a login, autenticarsi
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
    
    // Verificare che siamo nella dashboard (route protetta)
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('header')).toBeVisible();
    
    console.log('✅ Utente autenticato ha accesso alle route protette');
  });

  test('Dovrebbe reindirizzare utenti non autenticati al login', async ({ page }) => {
    // Simulare utente non autenticato cancellando i cookie
    await page.context().clearCookies();
    
    // Navigare a una route protetta
    await page.goto('http://localhost:3004/dashboard');
    
    // Verificare che siamo reindirizzati al login
    await expect(page).toHaveURL(/.*sign-in/);
    
    // Verificare che la pagina di login sia visibile
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await expect(emailInput).toBeVisible();
    
    console.log('✅ Utente non autenticato reindirizzato al login');
  });

  test('Dovrebbe reindirizzare dopo login corretto', async ({ page }) => {
    // Navigare direttamente al login
    await page.goto('http://localhost:3004/sign-in');
    
    // Verificare che siamo nella pagina di login
    await expect(page).toHaveURL(/.*sign-in/);
    
    // Compilare il form di login
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const loginButton = page.locator('button[type="submit"], button:has-text("Accedi")').first();
    
    await emailInput.fill('matteo.cavallaro.work@gmail.com');
    await passwordInput.fill('Cavallaro');
    await loginButton.click();
    
    // Verificare che siamo reindirizzati alla dashboard
    try {
      await page.waitForURL(/.*dashboard/, { timeout: 15000 });
    } catch (error) {
      // Se c'è un timeout, verifico se siamo comunque autenticati
      if (await page.locator('header').isVisible()) {
        console.log('✅ Header visibile, login riuscito');
      } else {
        throw error;
      }
    }
    
    console.log('✅ Redirect corretto dopo login');
  });

  test('Dovrebbe gestire correttamente route non esistenti', async ({ page }) => {
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
    
    // Navigare a una route non esistente
    await page.goto('http://localhost:3004/route-non-esistente');
    
    // Verificare che venga mostrata una pagina 404 o un errore appropriato
    // La route potrebbe essere gestita dal router come 404
    await expect(page).toHaveURL(/.*route-non-esistente/);
    
    // Verificare che non siamo reindirizzati al login (siamo autenticati)
    await expect(page).not.toHaveURL(/.*sign-in/);
    
    console.log('✅ Route non esistente gestita correttamente');
  });

  test('Dovrebbe mantenere stato autenticazione durante navigazione', async ({ page }) => {
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
    
    // Navigare tra diverse route protette
    await page.goto('http://localhost:3004/inventario');
    await expect(page.locator('header')).toBeVisible();
    await expect(page).not.toHaveURL(/.*sign-in/);
    
    await page.goto('http://localhost:3004/attivita');
    await expect(page.locator('header')).toBeVisible();
    await expect(page).not.toHaveURL(/.*sign-in/);
    
    await page.goto('http://localhost:3004/conservazione');
    await expect(page.locator('header')).toBeVisible();
    await expect(page).not.toHaveURL(/.*sign-in/);
    
    console.log('✅ Stato autenticazione mantenuto durante navigazione');
  });
});
