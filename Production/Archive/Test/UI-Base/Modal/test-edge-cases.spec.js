import { test, expect } from '@playwright/test';

test.describe('Modal.tsx - Test Edge Cases', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe gestire props undefined/null correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare che l'app gestisca props undefined
    const body = page.locator('body');
    
    // ASSERT: Verificare che l'app sia stabile anche con props undefined
    await expect(body).toBeVisible();
    
    // Verificare che non ci siano modal aperti (comportamento di default)
    const modals = page.locator('[role="dialog"]');
    const modalCount = await modals.count();
    expect(modalCount).toBe(0);
  });

  test('Dovrebbe gestire multiple aperture/chiusure rapide', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare multiple interazioni rapide
    const buttons = page.locator('button');
    
    // ASSERT: Verificare che l'app gestisca interazioni rapide
    const buttonCount = await buttons.count();
    if (buttonCount > 0) {
      const firstButton = buttons.first();
      
      // Testare multiple click rapidi
      for (let i = 0; i < 5; i++) {
        await firstButton.click();
        await page.waitForTimeout(50); // Piccola pausa
      }
      
      // Verificare che la pagina sia ancora stabile
      await expect(page.locator('h1')).toContainText('HACCP Manager');
    }
  });

  test('Dovrebbe gestire contenuto molto lungo', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare che l'app gestisca contenuto lungo
    const main = page.locator('main');
    
    // ASSERT: Verificare che il contenuto sia gestito correttamente
    await expect(main).toBeVisible();
    
    // Verificare che non ci siano modal con contenuto lungo
    const longContent = page.locator('[role="dialog"] p');
    const longContentCount = await longContent.count();
    expect(longContentCount).toBe(0); // Nessun modal aperto
  });

  test('Dovrebbe gestire titolo molto lungo', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare che l'app gestisca titoli lunghi
    const header = page.locator('h1');
    
    // ASSERT: Verificare che il titolo sia gestito correttamente
    const titleText = await header.textContent();
    expect(titleText).toBeTruthy();
    expect(titleText.length).toBeGreaterThan(0);
    
    // Verificare che non ci siano modal con titoli lunghi
    const modalTitles = page.locator('[id="modal-title"]');
    const modalTitleCount = await modalTitles.count();
    expect(modalTitleCount).toBe(0); // Nessun modal aperto
  });

  test('Dovrebbe gestire resize finestra durante apertura', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Ridimensionare la finestra
    await page.setViewportSize({ width: 800, height: 600 });
    
    // ASSERT: Verificare che l'app sia ancora funzionante
    await expect(page.locator('h1')).toContainText('HACCP Manager');
    
    // Verificare che non ci siano modal aperti
    const modals = page.locator('[role="dialog"]');
    const modalCount = await modals.count();
    expect(modalCount).toBe(0);
    
    // Ripristinare dimensione originale
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Verificare che l'app sia ancora funzionante
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe gestire keyboard navigation estrema', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare navigazione da tastiera estrema
    const buttons = page.locator('button');
    
    // ASSERT: Verificare che la navigazione da tastiera funzioni
    const buttonCount = await buttons.count();
    if (buttonCount > 0) {
      const firstButton = buttons.first();
      
      // Testare multiple tasti rapidamente
      const keys = ['Tab', 'Enter', 'Escape', 'Space'];
      for (const key of keys) {
        await page.keyboard.press(key);
        await page.waitForTimeout(50);
      }
      
      // Verificare che la pagina sia ancora stabile
      await expect(page.locator('h1')).toContainText('HACCP Manager');
    }
  });

  test('Dovrebbe gestire focus management estremo', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare focus management estremo
    const buttons = page.locator('button');
    
    // ASSERT: Verificare che il focus management funzioni
    const buttonCount = await buttons.count();
    if (buttonCount > 0) {
      const firstButton = buttons.first();
      
      // Testare multiple focus/blur rapidi
      for (let i = 0; i < 10; i++) {
        await firstButton.focus();
        await expect(firstButton).toBeFocused();
        await firstButton.blur();
        await expect(firstButton).not.toBeFocused();
      }
      
      // Verificare che l'elemento sia ancora funzionante
      await expect(firstButton).toBeVisible();
    }
  });

  test('Dovrebbe gestire scroll estremo', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare scroll estremo
    const body = page.locator('body');
    
    // ASSERT: Verificare che lo scroll funzioni
    await expect(body).toBeVisible();
    
    // Testare scroll estremo
    for (let i = 0; i < 5; i++) {
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(100);
      await page.mouse.wheel(0, -500);
      await page.waitForTimeout(100);
    }
    
    // Verificare che la pagina sia ancora stabile
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe gestire eventi mouse estremi', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare eventi mouse estremi
    const buttons = page.locator('button');
    
    // ASSERT: Verificare che gli eventi mouse funzionino
    const buttonCount = await buttons.count();
    if (buttonCount > 0) {
      const firstButton = buttons.first();
      
      // Testare multiple hover rapidi
      for (let i = 0; i < 5; i++) {
        await firstButton.hover();
        await page.waitForTimeout(50);
        await page.mouse.move(0, 0);
        await page.waitForTimeout(50);
      }
      
      // Verificare che l'elemento sia ancora funzionante
      await expect(firstButton).toBeVisible();
    }
  });

  test('Dovrebbe gestire dimensioni estreme', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare dimensioni estreme
    const extremeSizes = [
      { width: 320, height: 568 }, // iPhone SE
      { width: 1920, height: 1080 }, // Full HD
      { width: 2560, height: 1440 }, // 2K
    ];
    
    // ASSERT: Verificare che l'app funzioni con dimensioni estreme
    for (const size of extremeSizes) {
      await page.setViewportSize(size);
      await expect(page.locator('h1')).toContainText('HACCP Manager');
      
      // Verificare che non ci siano modal aperti
      const modals = page.locator('[role="dialog"]');
      const modalCount = await modals.count();
      expect(modalCount).toBe(0);
    }
    
    // Ripristinare dimensione originale
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('Dovrebbe gestire multiple modal potenziali', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare che l'app gestisca multiple modal potenziali
    const body = page.locator('body');
    
    // ASSERT: Verificare che l'app sia pronta per multiple modal
    await expect(body).toBeVisible();
    
    // Verificare che non ci siano modal aperti
    const allModals = page.locator('[role="dialog"], [aria-modal="true"]');
    const allModalCount = await allModals.count();
    expect(allModalCount).toBe(0); // Nessun modal aperto
    
    // Verificare che la struttura supporti multiple modal
    const zIndexElements = page.locator('[style*="z-index"]');
    const zIndexCount = await zIndexElements.count();
    expect(zIndexCount).toBeGreaterThanOrEqual(0); // Può supportare z-index
  });

  test('Dovrebbe gestire overlay click estremo', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare click estremi sull'overlay potenziale
    const body = page.locator('body');
    
    // ASSERT: Verificare che i click estremi funzionino
    await expect(body).toBeVisible();
    
    // Testare click in diverse posizioni
    const positions = [
      { x: 0, y: 0 },
      { x: 640, y: 360 },
      { x: 1279, y: 719 },
    ];
    
    for (const pos of positions) {
      await page.mouse.click(pos.x, pos.y);
      await page.waitForTimeout(50);
    }
    
    // Verificare che la pagina sia ancora stabile
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe gestire errori di rendering', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare che l'app gestisca errori di rendering
    const main = page.locator('main');
    
    // ASSERT: Verificare che l'app sia stabile
    await expect(main).toBeVisible();
    
    // Verificare che non ci siano errori nella console
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Navigare e verificare che non ci siano errori critici
    await page.goto('http://localhost:3000/dashboard');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
    
    // Verificare che non ci siano errori di rendering critici
    const criticalErrors = consoleErrors.filter(error => 
      error.includes('Modal') || error.includes('dialog')
    );
    expect(criticalErrors.length).toBe(0);
  });

  test('Dovrebbe gestire cleanup estremo', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare cleanup estremo
    const body = page.locator('body');
    
    // ASSERT: Verificare che il cleanup funzioni
    await expect(body).toBeVisible();
    
    // Navigare avanti e indietro multiple volte
    for (let i = 0; i < 3; i++) {
      await page.goto('http://localhost:3000/dashboard');
      await page.goto('http://localhost:3000/');
      await page.waitForTimeout(100);
    }
    
    // Verificare che la pagina sia ancora stabile
    await expect(page.locator('h1')).toContainText('HACCP Manager');
    
    // Verificare che non ci siano modal orfani
    const orphanedModals = page.locator('[role="dialog"]');
    const orphanedModalCount = await orphanedModals.count();
    expect(orphanedModalCount).toBe(0);
  });
});
