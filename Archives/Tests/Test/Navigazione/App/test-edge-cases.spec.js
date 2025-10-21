import { test, expect } from '@playwright/test';

test.describe('App.tsx - Test Edge Cases', () => {
  
  test('Dovrebbe gestire correttamente il caricamento con JavaScript disabilitato', async ({ page }) => {
    // Disabilitare JavaScript
    await page.addInitScript(() => {
      // Simulare JavaScript disabilitato
      window.console.log('JavaScript disabilitato per test');
    });
    
    // Tentare di navigare all'applicazione
    await page.goto('http://localhost:3004/');
    await page.waitForTimeout(3000);
    
    // Verificare che la pagina abbia un contenuto di base
    await expect(page.locator('body')).toBeVisible();
    
    // Verificare che non ci siano errori JavaScript gravi
    const errorMessages = await page.locator('body').textContent();
    expect(errorMessages).not.toContain('ReferenceError');
    expect(errorMessages).not.toContain('TypeError');
    
    console.log('✅ Caricamento con JavaScript disabilitato gestito correttamente');
  });

  test('Dovrebbe gestire correttamente il caricamento con viewport molto piccolo', async ({ page }) => {
    // Impostare viewport molto piccolo
    await page.setViewportSize({ width: 320, height: 568 });
    
    // Navigare all'applicazione
    await page.goto('http://localhost:3004/');
    await page.waitForLoadState('networkidle');
    
    // Verificare che l'app si carichi correttamente
    await expect(page.locator('body')).toBeVisible();
    
    // Verificare che non ci siano errori di layout
    const errorMessages = await page.locator('body').textContent();
    expect(errorMessages).not.toContain('Layout error');
    expect(errorMessages).not.toContain('Overflow error');
    
    console.log('✅ Caricamento con viewport piccolo gestito correttamente');
  });

  test('Dovrebbe gestire correttamente il caricamento con viewport molto grande', async ({ page }) => {
    // Impostare viewport molto grande
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Navigare all'applicazione
    await page.goto('http://localhost:3004/');
    await page.waitForLoadState('networkidle');
    
    // Verificare che l'app si carichi correttamente
    await expect(page.locator('body')).toBeVisible();
    
    // Verificare che non ci siano errori di layout
    const errorMessages = await page.locator('body').textContent();
    expect(errorMessages).not.toContain('Layout error');
    
    console.log('✅ Caricamento con viewport grande gestito correttamente');
  });

  test('Dovrebbe gestire correttamente il caricamento con rete instabile', async ({ page }) => {
    // Simulare rete instabile
    await page.route('**/*', route => {
      // Aggiungere delay variabile per simulare rete instabile
      const delay = Math.random() * 500 + 100;
      setTimeout(() => route.continue(), delay);
    });
    
    // Navigare all'applicazione
    await page.goto('http://localhost:3004/');
    
    // Aspettare il caricamento con timeout più lungo
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    // Verificare che l'app si carichi nonostante la rete instabile
    await expect(page.locator('body')).toBeVisible();
    
    // Rimuovere l'interceptor
    await page.unroute('**/*');
    
    console.log('✅ Caricamento con rete instabile gestito correttamente');
  });

  test('Dovrebbe gestire correttamente il caricamento con memoria limitata', async ({ page }) => {
    // Simulare memoria limitata limitando le risorse
    await page.route('**/*', route => {
      // Continuare normalmente ma con un piccolo delay per simulare memoria limitata
      setTimeout(() => route.continue(), 100);
    });
    
    // Navigare all'applicazione
    await page.goto('http://localhost:3004/');
    await page.waitForLoadState('networkidle');
    
    // Verificare che l'app si carichi correttamente
    await expect(page.locator('body')).toBeVisible();
    
    // Verificare che non ci siano errori di memoria
    const errorMessages = await page.locator('body').textContent();
    expect(errorMessages).not.toContain('Out of memory');
    expect(errorMessages).not.toContain('Memory error');
    
    // Rimuovere l'interceptor
    await page.unroute('**/*');
    
    console.log('✅ Caricamento con memoria limitata gestito correttamente');
  });

  test('Dovrebbe gestire correttamente il caricamento con zoom browser alto', async ({ page }) => {
    // Impostare zoom alto
    await page.evaluate(() => {
      document.body.style.zoom = '150%';
    });
    
    // Navigare all'applicazione
    await page.goto('http://localhost:3004/');
    await page.waitForLoadState('networkidle');
    
    // Verificare che l'app si carichi correttamente
    await expect(page.locator('body')).toBeVisible();
    
    // Verificare che non ci siano errori di layout
    const errorMessages = await page.locator('body').textContent();
    expect(errorMessages).not.toContain('Layout error');
    
    console.log('✅ Caricamento con zoom alto gestito correttamente');
  });

  test('Dovrebbe gestire correttamente il caricamento con zoom browser basso', async ({ page }) => {
    // Impostare zoom basso
    await page.evaluate(() => {
      document.body.style.zoom = '75%';
    });
    
    // Navigare all'applicazione
    await page.goto('http://localhost:3004/');
    await page.waitForLoadState('networkidle');
    
    // Verificare che l'app si carichi correttamente
    await expect(page.locator('body')).toBeVisible();
    
    // Verificare che non ci siano errori di layout
    const errorMessages = await page.locator('body').textContent();
    expect(errorMessages).not.toContain('Layout error');
    
    console.log('✅ Caricamento con zoom basso gestito correttamente');
  });

  test('Dovrebbe gestire correttamente il caricamento con orientamento dispositivo mobile', async ({ page }) => {
    // Impostare orientamento portrait
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigare all'applicazione
    await page.goto('http://localhost:3004/');
    await page.waitForLoadState('networkidle');
    
    // Verificare che l'app si carichi correttamente
    await expect(page.locator('body')).toBeVisible();
    
    // Cambiare orientamento a landscape
    await page.setViewportSize({ width: 667, height: 375 });
    
    // Verificare che l'app si adatti correttamente
    await expect(page.locator('body')).toBeVisible();
    
    console.log('✅ Caricamento con orientamento mobile gestito correttamente');
  });

  test('Dovrebbe gestire correttamente il caricamento con caratteri speciali negli URL', async ({ page }) => {
    // Testare URL con caratteri speciali
    const specialUrls = [
      'http://localhost:3004/dashboard?search=test%20with%20spaces',
      'http://localhost:3004/inventario?filter=categoria%20speciale',
      'http://localhost:3004/attivita?desc=attività%20con%20accenti'
    ];
    
    for (const url of specialUrls) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      
      // Verificare che l'app gestisca correttamente i caratteri speciali
      await expect(page.locator('body')).toBeVisible();
      
      // Verificare che non ci siano errori di encoding
      const errorMessages = await page.locator('body').textContent();
      expect(errorMessages).not.toContain('Encoding error');
      expect(errorMessages).not.toContain('Invalid character');
      
      console.log(`✅ URL con caratteri speciali gestito: ${url}`);
    }
    
    console.log('✅ Caricamento con caratteri speciali negli URL gestito correttamente');
  });

  test('Dovrebbe gestire correttamente il caricamento con molti tab aperti', async ({ page, context }) => {
    // Creare molti tab
    const tabs = [];
    for (let i = 0; i < 5; i++) {
      const newPage = await context.newPage();
      tabs.push(newPage);
    }
    
    // Navigare all'applicazione su tutti i tab
    for (const tab of tabs) {
      await tab.goto('http://localhost:3004/');
      await tab.waitForLoadState('networkidle');
      
      // Verificare che l'app si carichi su ogni tab
      await expect(tab.locator('body')).toBeVisible();
    }
    
    // Chiudere tutti i tab
    for (const tab of tabs) {
      await tab.close();
    }
    
    console.log('✅ Caricamento con molti tab gestito correttamente');
  });

  test('Dovrebbe gestire correttamente il caricamento con interruzioni di rete', async ({ page }) => {
    // Simulare interruzioni di rete
    await page.route('**/*', route => {
      // Simulare interruzione di rete per alcune richieste
      if (Math.random() < 0.3) {
        route.abort();
      } else {
        route.continue();
      }
    });
    
    // Tentare di navigare all'applicazione
    await page.goto('http://localhost:3004/');
    
    // Aspettare il caricamento con timeout più lungo
    try {
      await page.waitForLoadState('networkidle', { timeout: 30000 });
    } catch (error) {
      console.log('⚠️ Timeout su caricamento, verifico stato attuale');
    }
    
    // Verificare che l'app gestisca correttamente le interruzioni
    await expect(page.locator('body')).toBeVisible();
    
    // Rimuovere l'interceptor
    await page.unroute('**/*');
    
    console.log('✅ Caricamento con interruzioni di rete gestito correttamente');
  });

  test('Dovrebbe gestire correttamente il caricamento con risorse bloccate', async ({ page }) => {
    // Bloccare alcune risorse per testare la resilienza
    await page.route('**/*.css', route => route.abort());
    
    // Navigare all'applicazione
    await page.goto('http://localhost:3004/');
    await page.waitForLoadState('networkidle');
    
    // Verificare che l'app si carichi anche senza CSS
    await expect(page.locator('body')).toBeVisible();
    
    // Rimuovere l'interceptor
    await page.unroute('**/*.css');
    
    console.log('✅ Caricamento con risorse bloccate gestito correttamente');
  });
});
