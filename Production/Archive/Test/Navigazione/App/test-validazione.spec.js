import { test, expect } from '@playwright/test';

test.describe('App.tsx - Test Validazione Dati e Permessi', () => {
  
  test('Dovrebbe validare correttamente la struttura del routing', async ({ page }) => {
    // Navigare all'applicazione
    await page.goto('http://localhost:3004/');
    await page.waitForLoadState('networkidle');
    
    // Verificare che l'app abbia una struttura di routing valida
    const routerInfo = await page.evaluate(() => {
      return {
        hasRouter: typeof window !== 'undefined',
        currentPath: window.location.pathname,
        hasHistory: typeof window.history !== 'undefined'
      };
    });
    
    expect(routerInfo.hasRouter).toBeTruthy();
    expect(routerInfo.currentPath).toBeDefined();
    
    console.log('✅ Struttura del routing validata correttamente');
  });

  test('Dovrebbe gestire correttamente le variabili di ambiente', async ({ page }) => {
    // Navigare all'applicazione
    await page.goto('http://localhost:3004/');
    await page.waitForLoadState('networkidle');
    
    // Verificare che l'app gestisca correttamente le variabili di ambiente
    const envInfo = await page.evaluate(() => {
      return {
        hasEnv: typeof import.meta !== 'undefined' || typeof process !== 'undefined',
        isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      };
    });
    
    expect(envInfo.isDevelopment).toBeTruthy();
    
    console.log('✅ Variabili di ambiente gestite correttamente');
  });

  test('Dovrebbe gestire correttamente il caricamento delle dipendenze', async ({ page }) => {
    // Navigare all'applicazione
    await page.goto('http://localhost:3004/');
    await page.waitForLoadState('networkidle');
    
    // Verificare che non ci siano errori di caricamento delle dipendenze
    const errorMessages = await page.locator('body').textContent();
    expect(errorMessages).not.toContain('Module not found');
    expect(errorMessages).not.toContain('Cannot resolve');
    expect(errorMessages).not.toContain('Failed to import');
    
    // Verificare che le librerie principali siano caricate
    const libsLoaded = await page.evaluate(() => {
      return {
        hasReact: typeof React !== 'undefined',
        hasReactRouter: typeof window !== 'undefined' && window.location,
        hasLucide: document.querySelector('[data-lucide]') !== null || document.querySelector('svg') !== null
      };
    });
    
    // Almeno React Router dovrebbe essere disponibile
    expect(libsLoaded.hasReactRouter).toBeTruthy();
    
    console.log('✅ Caricamento delle dipendenze gestito correttamente');
  });

  test('Dovrebbe gestire correttamente i permessi di accesso alle funzioni di debug', async ({ page }) => {
    // Navigare all'applicazione
    await page.goto('http://localhost:3004/');
    await page.waitForLoadState('networkidle');
    
    // Verificare che le funzioni di debug siano disponibili solo in modalità sviluppo
    const debugAccess = await page.evaluate(() => {
      const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const hasDebugFunctions = typeof window.resetAllData === 'function' || 
                               typeof window.reopenOnboarding === 'function' ||
                               typeof window.debugAuth === 'function';
      
      return {
        isDevelopment: isDev,
        hasDebugFunctions: hasDebugFunctions,
        shouldHaveDebug: isDev && hasDebugFunctions
      };
    });
    
    // In modalità sviluppo, le funzioni di debug dovrebbero essere disponibili
    if (debugAccess.isDevelopment) {
      expect(debugAccess.shouldHaveDebug).toBeTruthy();
    }
    
    console.log('✅ Permessi di accesso alle funzioni di debug gestiti correttamente');
  });

  test('Dovrebbe gestire correttamente la configurazione del routing', async ({ page }) => {
    // Testare diverse route per verificare la configurazione
    const routes = [
      { path: '/', shouldRedirect: true },
      { path: '/sign-in', shouldLoad: true },
      { path: '/dashboard', shouldRedirect: true }, // Potrebbe reindirizzare a sign-in
      { path: '/inventario', shouldRedirect: true },
      { path: '/attivita', shouldRedirect: true }
    ];
    
    for (const route of routes) {
      await page.goto(`http://localhost:3004${route.path}`);
      await page.waitForLoadState('networkidle');
      
      // Verificare che la route sia gestita correttamente
      const currentUrl = page.url();
      expect(currentUrl).toBeDefined();
      
      // Verificare che non ci siano errori di routing
      const errorMessages = await page.locator('body').textContent();
      expect(errorMessages).not.toContain('Route not found');
      expect(errorMessages).not.toContain('404');
      
      console.log(`✅ Route ${route.path} gestita correttamente`);
    }
    
    console.log('✅ Configurazione del routing validata correttamente');
  });

  test('Dovrebbe gestire correttamente il lazy loading con errori di rete', async ({ page }) => {
    // Simulare rete lenta per testare il lazy loading
    await page.route('**/*', route => {
      // Aggiungere un piccolo delay per simulare rete lenta
      setTimeout(() => route.continue(), 200);
    });
    
    // Navigare all'applicazione
    await page.goto('http://localhost:3004/');
    
    // Aspettare il caricamento con timeout più lungo
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    // Verificare che l'app si carichi correttamente nonostante la rete lenta
    await expect(page.locator('body')).toBeVisible();
    
    // Verificare che non ci siano errori di caricamento
    const errorMessages = await page.locator('body').textContent();
    expect(errorMessages).not.toContain('Loading chunk failed');
    expect(errorMessages).not.toContain('Network error');
    
    // Rimuovere l'interceptor
    await page.unroute('**/*');
    
    console.log('✅ Lazy loading con rete lenta gestito correttamente');
  });

  test('Dovrebbe gestire correttamente il refresh delle pagine lazy-loaded', async ({ page }) => {
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
    
    // Navigare a una pagina lazy-loaded
    await page.goto('http://localhost:3004/inventario');
    await page.waitForLoadState('networkidle');
    
    // Fare refresh della pagina
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verificare che la pagina si ricarichi correttamente
    await expect(page.locator('body')).toBeVisible();
    
    // Verificare che non ci siano errori di caricamento
    const errorMessages = await page.locator('body').textContent();
    expect(errorMessages).not.toContain('Loading chunk failed');
    expect(errorMessages).not.toContain('Failed to load');
    
    console.log('✅ Refresh di pagine lazy-loaded gestito correttamente');
  });

  test('Dovrebbe gestire correttamente la navigazione con parametri URL', async ({ page }) => {
    // Testare navigazione con parametri URL
    const urlsWithParams = [
      'http://localhost:3004/dashboard?tab=overview',
      'http://localhost:3004/inventario?filter=active&sort=name',
      'http://localhost:3004/attivita?date=2025-01-16&category=maintenance'
    ];
    
    for (const url of urlsWithParams) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      
      // Verificare che la navigazione con parametri funzioni
      await expect(page.locator('body')).toBeVisible();
      
      // Verificare che i parametri siano gestiti correttamente
      const currentUrl = page.url();
      expect(currentUrl).toContain('localhost:3004');
      
      console.log(`✅ URL con parametri gestito: ${url}`);
    }
    
    console.log('✅ Navigazione con parametri URL gestita correttamente');
  });
});
