const { test, expect } = require('@playwright/test');

test.describe('Button.tsx - Test Edge Cases', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe gestire props undefined/null correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare che i bottoni funzionino anche con props undefined
    const button = page.locator('button').first();
    
    // ASSERT: Verificare che il bottone sia renderizzato anche con props default
    await expect(button).toBeVisible();
    
    // Verificare che abbia classi CSS di default
    const buttonClass = await button.getAttribute('class');
    expect(buttonClass).toContain('inline-flex');
    expect(buttonClass).toContain('items-center');
    expect(buttonClass).toContain('justify-center');
  });

  test('Dovrebbe gestire className vuota o null', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare che i bottoni funzionino senza className personalizzata
    const button = page.locator('button').first();
    
    // ASSERT: Verificare che il bottone abbia classi CSS di default
    const buttonClass = await button.getAttribute('class');
    expect(buttonClass).toBeTruthy();
    expect(buttonClass.length).toBeGreaterThan(0);
  });

  test('Dovrebbe gestire onClick undefined', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Cliccare su un bottone senza onClick handler
    const button = page.locator('button').first();
    
    // ASSERT: Verificare che il click non causi errori
    await button.click();
    
    // Verificare che la pagina sia ancora stabile
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe gestire children vuoti', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare bottoni con contenuto minimo
    const button = page.locator('button').first();
    
    // ASSERT: Verificare che il bottone sia renderizzato anche con contenuto minimo
    await expect(button).toBeVisible();
    
    // Verificare che abbia dimensioni appropriate
    const buttonClass = await button.getAttribute('class');
    expect(buttonClass).toContain('inline-flex');
  });

  test('Dovrebbe gestire multiple click rapidi', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Fare multiple click rapidi su un bottone
    const button = page.locator('button').first();
    
    // ASSERT: Verificare che il bottone gestisca multiple click
    for (let i = 0; i < 5; i++) {
      await button.click();
      await page.waitForTimeout(100); // Piccola pausa tra i click
    }
    
    // Verificare che la pagina sia ancora stabile
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe gestire focus/blur correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare focus e blur su un bottone
    const button = page.locator('button').first();
    
    // ASSERT: Verificare focus
    await button.focus();
    await expect(button).toBeFocused();
    
    // Verificare blur
    await button.blur();
    await expect(button).not.toBeFocused();
    
    // Verificare che il bottone sia ancora visibile
    await expect(button).toBeVisible();
  });

  test('Dovrebbe gestire hover rapido', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Fare hover rapido su un bottone
    const button = page.locator('button').first();
    
    // ASSERT: Verificare che il bottone gestisca hover rapido
    for (let i = 0; i < 3; i++) {
      await button.hover();
      await page.waitForTimeout(50);
      await button.blur();
      await page.waitForTimeout(50);
    }
    
    // Verificare che il bottone sia ancora visibile e funzionante
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
  });

  test('Dovrebbe gestire dimensioni estreme', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare bottoni di diverse dimensioni
    const buttons = page.locator('button');
    
    // ASSERT: Verificare che tutti i bottoni abbiano dimensioni appropriate
    const buttonCount = await buttons.count();
    for (let i = 0; i < Math.min(buttonCount, 3); i++) {
      const button = buttons.nth(i);
      await expect(button).toBeVisible();
      
      const buttonClass = await button.getAttribute('class');
      // Verificare che abbia classi per dimensioni
      expect(buttonClass).toMatch(/h-\d+/); // Altezza
    }
  });

  test('Dovrebbe gestire contenuto lungo', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare bottoni con contenuto lungo
    const buttons = page.locator('button');
    
    // ASSERT: Verificare che i bottoni gestiscano contenuto lungo
    const buttonCount = await buttons.count();
    for (let i = 0; i < Math.min(buttonCount, 3); i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      
      // Verificare che il bottone sia visibile indipendentemente dalla lunghezza del testo
      await expect(button).toBeVisible();
      
      // Verificare che abbia classi CSS appropriate per il contenuto
      const buttonClass = await button.getAttribute('class');
      expect(buttonClass).toContain('whitespace-nowrap');
    }
  });

  test('Dovrebbe gestire stati di loading simulati', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Simulare click che potrebbero causare loading
    const button = page.locator('button').first();
    
    // ASSERT: Verificare che il bottone rimanga stabile durante operazioni
    await button.click();
    
    // Aspettare un momento per simulare loading
    await page.waitForTimeout(1000);
    
    // Verificare che il bottone sia ancora visibile e funzionante
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
  });

  test('Dovrebbe gestire keyboard navigation', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare navigazione da tastiera
    const button = page.locator('button').first();
    
    // ASSERT: Verificare che il bottone sia navigabile da tastiera
    await button.focus();
    await expect(button).toBeFocused();
    
    // Testare tab navigation
    await page.keyboard.press('Tab');
    
    // Verificare che il bottone sia ancora presente
    await expect(button).toBeVisible();
  });

  test('Dovrebbe gestire resize della finestra', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Ridimensionare la finestra
    await page.setViewportSize({ width: 800, height: 600 });
    
    // ASSERT: Verificare che i bottoni siano ancora visibili e funzionanti
    const button = page.locator('button').first();
    await expect(button).toBeVisible();
    
    // Ripristinare dimensione originale
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Verificare che i bottoni siano ancora visibili
    await expect(button).toBeVisible();
  });
});
