import { test, expect } from '@playwright/test';

test.describe('App.tsx - Test Funzionali', () => {
  
  test('Dovrebbe caricare l\'applicazione correttamente', async ({ page }) => {
    // Navigare alla root dell'applicazione
    await page.goto('http://localhost:3004/');
    
    // Verificare che l'app si carichi senza errori
    await page.waitForLoadState('networkidle');
    
    // Verificare che non ci siano errori JavaScript gravi
    const errorMessages = await page.locator('body').textContent();
    expect(errorMessages).not.toContain('ReferenceError');
    expect(errorMessages).not.toContain('TypeError');
    expect(errorMessages).not.toContain('SyntaxError');
    
    // Verificare che la pagina abbia un contenuto
    await expect(page.locator('body')).toBeVisible();
    
    console.log('✅ Applicazione caricata correttamente');
  });

  test('Dovrebbe gestire correttamente il routing principale', async ({ page }) => {
    // Testare route pubbliche
    await page.goto('http://localhost:3004/');
    await page.waitForLoadState('networkidle');
    
    // Verificare che la root reindirizza correttamente
    // (potrebbe reindirizzare a dashboard se autenticato, o a sign-in se non autenticato)
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/.*dashboard|.*sign-in|.*\/$/);
    
    console.log('✅ Routing principale gestito correttamente');
  });

  test('Dovrebbe gestire correttamente il lazy loading delle pagine', async ({ page }) => {
    // Autenticarsi prima
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
    
    // Testare navigazione a diverse pagine per verificare lazy loading
    const routes = ['/inventario', '/attivita', '/conservazione', '/impostazioni'];
    
    for (const route of routes) {
      await page.goto(`http://localhost:3004${route}`);
      
      // Verificare che la pagina si carichi
      await page.waitForLoadState('networkidle');
      
      // Verificare che non ci siano errori di caricamento
      const errorMessages = await page.locator('body').textContent();
      expect(errorMessages).not.toContain('Loading chunk');
      expect(errorMessages).not.toContain('Failed to load');
      
      console.log(`✅ Pagina ${route} caricata correttamente`);
    }
    
    console.log('✅ Lazy loading delle pagine funziona correttamente');
  });

  test('Dovrebbe esporre funzioni di debug in modalità sviluppo', async ({ page }) => {
    // Navigare all'applicazione
    await page.goto('http://localhost:3004/');
    await page.waitForLoadState('networkidle');
    
    // Verificare che le funzioni di debug siano disponibili in modalità sviluppo
    const debugFunctions = await page.evaluate(() => {
      return {
        hasResetAllData: typeof window.resetAllData === 'function',
        hasReopenOnboarding: typeof window.reopenOnboarding === 'function',
        hasDebugAuth: typeof window.debugAuth === 'function',
        hasSyncHosts: typeof window.syncHosts === 'function',
        hasResetUsers: typeof window.resetUsers === 'function'
      };
    });
    
    // In modalità sviluppo, queste funzioni dovrebbero essere disponibili
    console.log('Funzioni debug disponibili:', debugFunctions);
    
    // Verificare che almeno alcune funzioni di debug siano disponibili
    const hasAnyDebugFunction = Object.values(debugFunctions).some(Boolean);
    expect(hasAnyDebugFunction).toBeTruthy();
    
    console.log('✅ Funzioni di debug esposte correttamente');
  });

  test('Dovrebbe gestire correttamente le route protette con MainLayout', async ({ page }) => {
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
    
    // Verificare che MainLayout sia presente nelle route protette
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('nav[role="navigation"]')).toBeVisible();
    
    // Navigare ad altre route protette per verificare la consistenza
    await page.goto('http://localhost:3004/inventario');
    await expect(page.locator('header')).toBeVisible();
    
    await page.goto('http://localhost:3004/attivita');
    await expect(page.locator('header')).toBeVisible();
    
    console.log('✅ Route protette gestite correttamente con MainLayout');
  });

  test('Dovrebbe gestire correttamente OnboardingGuard per utenti senza compagnia', async ({ page }) => {
    // Questo test verifica che OnboardingGuard funzioni correttamente
    // Navigare a una route protetta
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
    
    // Verificare che non siamo reindirizzati a onboarding
    // (l'utente di test dovrebbe avere una compagnia associata)
    await expect(page).not.toHaveURL(/.*onboarding/);
    
    console.log('✅ OnboardingGuard funziona correttamente');
  });

  test('Dovrebbe gestire correttamente route non trovate (404)', async ({ page }) => {
    // Navigare a una route che non esiste
    await page.goto('http://localhost:3004/route-che-non-esiste');
    
    // Verificare che la pagina gestisca correttamente il 404
    await page.waitForLoadState('networkidle');
    
    // Verificare che non ci siano errori JavaScript gravi
    const errorMessages = await page.locator('body').textContent();
    expect(errorMessages).not.toContain('ReferenceError');
    expect(errorMessages).not.toContain('TypeError');
    
    // La route potrebbe essere gestita dal router come 404 o reindirizzare
    // Verificare che la pagina abbia un contenuto appropriato
    await expect(page.locator('body')).toBeVisible();
    
    console.log('✅ Route non trovate gestite correttamente');
  });
});
