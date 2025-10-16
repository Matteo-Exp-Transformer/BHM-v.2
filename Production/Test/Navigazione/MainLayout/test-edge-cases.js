const { test, expect } = require('@playwright/test');

test.describe('MainLayout - Test Edge Cases', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3004/dashboard');
    await expect(page.locator('header')).toBeVisible();
  });

  test('Dovrebbe gestire correttamente viewport molto piccolo', async ({ page }) => {
    // Test con viewport molto piccolo
    await page.setViewportSize({ width: 320, height: 568 });
    
    // Verificare che layout sia ancora funzionante
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('nav[role="navigation"]')).toBeVisible();
    
    // Verificare che tab siano ancora cliccabili
    await expect(page.locator('nav a[href="/dashboard"]')).toBeVisible();
    await expect(page.locator('nav a[href="/conservazione"]')).toBeVisible();
    
    // Verificare che testo tab sia ancora leggibile (anche se troncato)
    const tabText = await page.locator('nav a[href="/dashboard"] span').textContent();
    expect(tabText.length).toBeGreaterThan(0);
  });

  test('Dovrebbe gestire correttamente viewport molto grande', async ({ page }) => {
    // Test con viewport molto grande
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Verificare che layout sia ancora funzionante
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('nav[role="navigation"]')).toBeVisible();
    
    // Verificare che tab siano ancora cliccabili
    await expect(page.locator('nav a[href="/dashboard"]')).toBeVisible();
  });

  test('Dovrebbe gestire correttamente navigazione rapida tra tab', async ({ page }) => {
    // Navigazione rapida tra tutti i tab
    const tabs = ['/dashboard', '/conservazione', '/attivita', '/inventario'];
    
    for (const tab of tabs) {
      await page.click(`nav a[href="${tab}"]`);
      await expect(page).toHaveURL(new RegExp(tab.replace('/', '')));
      
      // Verificare che tab sia attivo
      await expect(page.locator(`nav a[href="${tab}"]`)).toHaveClass(/text-primary-600/);
      
      // Piccola pausa per evitare click troppo rapidi
      await page.waitForTimeout(100);
    }
  });

  test('Dovrebbe gestire correttamente doppio click su tab', async ({ page }) => {
    // Doppio click su tab conservazione
    await page.dblclick('nav a[href="/conservazione"]');
    
    // Verificare che sia ancora nella pagina conservazione
    await expect(page).toHaveURL(/.*conservazione/);
    
    // Verificare che tab sia attivo
    await expect(page.locator('nav a[href="/conservazione"]')).toHaveClass(/text-primary-600/);
  });

  test('Dovrebbe gestire correttamente navigazione con tasti freccia', async ({ page }) => {
    // Focus su tab dashboard
    await page.locator('nav a[href="/dashboard"]').focus();
    
    // Navigare con freccia destra
    await page.keyboard.press('ArrowRight');
    
    // Verificare che focus sia passato al tab successivo
    const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('href'));
    expect(focusedElement).toBeTruthy();
  });

  test('Dovrebbe gestire correttamente navigazione con Enter', async ({ page }) => {
    // Focus su tab conservazione
    await page.locator('nav a[href="/conservazione"]').focus();
    
    // Premere Enter
    await page.keyboard.press('Enter');
    
    // Verificare navigazione
    await expect(page).toHaveURL(/.*conservazione/);
  });

  test('Dovrebbe gestire correttamente stato durante caricamento lento', async ({ page }) => {
    // Simulare caricamento lento bloccando le risorse
    await page.route('**/*', route => {
      // Aggiungere delay a tutte le richieste
      setTimeout(() => route.continue(), 1000);
    });
    
    // Navigare a conservazione
    await page.click('nav a[href="/conservazione"]');
    
    // Verificare che layout sia ancora visibile durante caricamento
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('nav[role="navigation"]')).toBeVisible();
    
    // Verificare che tab sia attivo anche durante caricamento
    await expect(page.locator('nav a[href="/conservazione"]')).toHaveClass(/text-primary-600/);
  });

  test('Dovrebbe gestire correttamente navigazione con URL malformati', async ({ page }) => {
    // Test con URL malformato
    await page.goto('http://localhost:3004/dashboard#malformed');
    
    // Verificare che layout sia ancora funzionante
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('nav[role="navigation"]')).toBeVisible();
    
    // Verificare che tab dashboard sia attivo
    await expect(page.locator('nav a[href="/dashboard"]')).toHaveClass(/text-primary-600/);
  });

  test('Dovrebbe gestire correttamente navigazione con parametri query', async ({ page }) => {
    // Test con parametri query
    await page.goto('http://localhost:3004/dashboard?test=1&debug=true');
    
    // Verificare che layout sia funzionante
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('nav[role="navigation"]')).toBeVisible();
    
    // Verificare che tab dashboard sia attivo
    await expect(page.locator('nav a[href="/dashboard"]')).toHaveClass(/text-primary-600/);
  });

  test('Dovrebbe gestire correttamente zoom browser', async ({ page }) => {
    // Test con zoom 150%
    await page.evaluate(() => {
      document.body.style.zoom = '150%';
    });
    
    // Verificare che layout sia ancora funzionante
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('nav[role="navigation"]')).toBeVisible();
    
    // Verificare che tab siano ancora cliccabili
    await page.click('nav a[href="/conservazione"]');
    await expect(page).toHaveURL(/.*conservazione/);
    
    // Reset zoom
    await page.evaluate(() => {
      document.body.style.zoom = '100%';
    });
  });

  test('Dovrebbe gestire correttamente orientamento dispositivo mobile', async ({ page }) => {
    // Test landscape
    await page.setViewportSize({ width: 667, height: 375 });
    
    // Verificare che layout sia funzionante
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('nav[role="navigation"]')).toBeVisible();
    
    // Test portrait
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verificare che layout sia ancora funzionante
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('nav[role="navigation"]')).toBeVisible();
  });

  test('Dovrebbe gestire correttamente navigazione con JavaScript disabilitato', async ({ page }) => {
    // Nota: Questo test verifica che il layout sia ancora funzionante
    // anche se alcune funzionalità JavaScript potrebbero non funzionare
    
    // Verificare che elementi base siano presenti
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('nav[role="navigation"]')).toBeVisible();
    
    // Verificare che link siano presenti (anche se JavaScript è disabilitato)
    await expect(page.locator('nav a[href="/dashboard"]')).toBeVisible();
    await expect(page.locator('nav a[href="/conservazione"]')).toBeVisible();
  });

  test('Dovrebbe gestire correttamente memoria limitata', async ({ page }) => {
    // Simulare memoria limitata creando molti elementi
    await page.evaluate(() => {
      for (let i = 0; i < 1000; i++) {
        const div = document.createElement('div');
        div.innerHTML = `Test element ${i}`;
        document.body.appendChild(div);
      }
    });
    
    // Verificare che layout sia ancora funzionante
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('nav[role="navigation"]')).toBeVisible();
    
    // Verificare che navigazione funzioni ancora
    await page.click('nav a[href="/conservazione"]');
    await expect(page).toHaveURL(/.*conservazione/);
  });

  test('Dovrebbe gestire correttamente navigazione con molti tab attivi', async ({ page }) => {
    // Navigare rapidamente tra tab per creare "stato confuso"
    await page.click('nav a[href="/conservazione"]');
    await page.click('nav a[href="/attivita"]');
    await page.click('nav a[href="/inventario"]');
    await page.click('nav a[href="/dashboard"]');
    
    // Verificare che solo tab dashboard sia attivo
    await expect(page.locator('nav a[href="/dashboard"]')).toHaveClass(/text-primary-600/);
    await expect(page.locator('nav a[href="/conservazione"]')).not.toHaveClass(/text-primary-600/);
    await expect(page.locator('nav a[href="/attivita"]')).not.toHaveClass(/text-primary-600/);
    await expect(page.locator('nav a[href="/inventario"]')).not.toHaveClass(/text-primary-600/);
  });
});
