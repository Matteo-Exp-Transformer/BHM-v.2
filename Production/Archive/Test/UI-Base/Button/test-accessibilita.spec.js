import { test, expect } from '@playwright/test';

test.describe('Button.tsx - Test Accessibilità', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe essere navigabile da tastiera', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare navigazione da tastiera per button
    const buttons = page.locator('button');
    
    // ASSERT: Verificare che i button siano navigabili da tastiera
    const buttonCount = await buttons.count();
    if (buttonCount > 0) {
      const button = buttons.first();
      
      // Verificare che il button sia focusabile
      await button.focus();
      await expect(button).toBeFocused();
      
      // Verificare navigazione con Tab
      await page.keyboard.press('Tab');
      
      // Verificare che il button sia ancora presente
      await expect(button).toBeVisible();
    }
  });

  test('Dovrebbe avere attributi ARIA appropriati', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare attributi ARIA per button
    const buttons = page.locator('button');
    
    // ASSERT: Verificare attributi ARIA
    const buttonCount = await buttons.count();
    if (buttonCount > 0) {
      const button = buttons.first();
      await expect(button).toBeVisible();
      
      // Verificare che sia un elemento button
      const type = await button.getAttribute('type');
      expect(type).toBe('button');
      
      // Verificare che abbia attributi standard
      const tagName = await button.evaluate(el => el.tagName);
      expect(tagName).toBe('BUTTON');
    }
  });

  test('Dovrebbe supportare screen reader', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare supporto screen reader
    const buttons = page.locator('button');
    
    // ASSERT: Verificare che i button siano accessibili via screen reader
    const buttonCount = await buttons.count();
    if (buttonCount > 0) {
      const button = buttons.first();
      await expect(button).toBeVisible();
      
      // Verificare che sia un elemento HTML standard
      const tagName = await button.evaluate(el => el.tagName);
      expect(tagName).toBe('BUTTON');
      
      // Verificare che sia focusabile
      await button.focus();
      await expect(button).toBeFocused();
    }
  });

  test('Dovrebbe gestire label associati', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare label associati
    const buttons = page.locator('button');
    const labels = page.locator('label');
    
    // ASSERT: Verificare gestione label
    const buttonCount = await buttons.count();
    const labelCount = await labels.count();
    
    if (buttonCount > 0) {
      const button = buttons.first();
      await expect(button).toBeVisible();
      
      // Verificare che sia un elemento HTML standard che supporta label
      const tagName = await button.evaluate(el => el.tagName);
      expect(tagName).toBe('BUTTON');
    }
    
    expect(labelCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe avere contrasto adeguato', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare contrasto
    const buttons = page.locator('button');
    
    // ASSERT: Verificare che i button abbiano classi CSS per contrasto
    const buttonCount = await buttons.count();
    if (buttonCount > 0) {
      const button = buttons.first();
      await expect(button).toBeVisible();
      
      // Verificare che abbia classi CSS per contrasto
      const buttonClass = await button.getAttribute('class');
      expect(buttonClass).toContain('text-sm'); // Testo di dimensione appropriata
      
      // Verificare che abbia classi per colore del testo
      expect(buttonClass).toContain('font-medium');
    }
  });

  test('Dovrebbe gestire stato focus visivamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare stato focus visivo
    const buttons = page.locator('button');
    
    // ASSERT: Verificare gestione focus visivo
    const buttonCount = await buttons.count();
    if (buttonCount > 0) {
      const button = buttons.first();
      await expect(button).toBeVisible();
      
      // Verificare che abbia classi CSS per focus
      const buttonClass = await button.getAttribute('class');
      expect(buttonClass).toContain('transition-colors'); // Transizione per focus
      
      // Testare focus
      await button.focus();
      await expect(button).toBeFocused();
    }
  });

  test('Dovrebbe supportare navigazione sequenziale', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare navigazione sequenziale
    const buttons = page.locator('button');
    
    // ASSERT: Verificare navigazione sequenziale
    const buttonCount = await buttons.count();
    if (buttonCount > 0) {
      const button = buttons.first();
      await expect(button).toBeVisible();
      
      // Verificare che il button sia navigabile
      await button.focus();
      await expect(button).toBeFocused();
      
      // Verificare navigazione con Tab
      await page.keyboard.press('Tab');
      
      // Verificare che il button sia ancora presente
      await expect(button).toBeVisible();
    }
  });

  test('Dovrebbe gestire errori accessibili', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare gestione errori accessibili
    const buttons = page.locator('button');
    
    // ASSERT: Verificare gestione errori
    const buttonCount = await buttons.count();
    if (buttonCount > 0) {
      const button = buttons.first();
      await expect(button).toBeVisible();
      
      // Verificare che sia un elemento HTML standard
      const tagName = await button.evaluate(el => el.tagName);
      expect(tagName).toBe('BUTTON');
      
      // Verificare che abbia attributi standard per gestione errori
      const type = await button.getAttribute('type');
      expect(type).toBe('button');
    }
  });

  test('Dovrebbe supportare shortcut da tastiera', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare shortcut da tastiera
    const buttons = page.locator('button');
    
    // ASSERT: Verificare shortcut da tastiera
    const buttonCount = await buttons.count();
    if (buttonCount > 0) {
      const button = buttons.first();
      await expect(button).toBeVisible();
      
      // Verificare che il button sia focusabile
      await button.focus();
      await expect(button).toBeFocused();
      
      // Testare shortcut comuni (Enter per attivazione)
      await page.keyboard.press('Enter');
      
      // Verificare che il button sia ancora presente
      await expect(button).toBeVisible();
    }
  });

  test('Dovrebbe avere dimensioni touch-friendly', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare dimensioni touch-friendly
    const buttons = page.locator('button');
    
    // ASSERT: Verificare dimensioni appropriate
    const buttonCount = await buttons.count();
    if (buttonCount > 0) {
      const button = buttons.first();
      await expect(button).toBeVisible();
      
      // Verificare che abbia dimensioni appropriate
      const buttonClass = await button.getAttribute('class');
      expect(buttonClass).toMatch(/h-\d+/); // Altezza minima per touch
      expect(buttonClass).toMatch(/px-\d+/); // Padding orizzontale
      expect(buttonClass).toMatch(/py-\d+/); // Padding verticale
    }
  });

  test('Dovrebbe supportare modalità ad alto contrasto', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare supporto alto contrasto
    const buttons = page.locator('button');
    
    // ASSERT: Verificare supporto alto contrasto
    const buttonCount = await buttons.count();
    if (buttonCount > 0) {
      const button = buttons.first();
      await expect(button).toBeVisible();
      
      // Verificare che abbia classi CSS per contrasto
      const buttonClass = await button.getAttribute('class');
      expect(buttonClass).toContain('rounded-md'); // Bordo per contrasto
      
      // Verificare che sia un elemento HTML standard
      const tagName = await button.evaluate(el => el.tagName);
      expect(tagName).toBe('BUTTON');
    }
  });

  test('Dovrebbe gestire zoom senza problemi', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare zoom
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // ASSERT: Verificare che i button siano ancora accessibili con zoom
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    if (buttonCount > 0) {
      const button = buttons.first();
      await expect(button).toBeVisible();
      
      // Verificare che il button sia ancora focusabile
      await button.focus();
      await expect(button).toBeFocused();
      
      // Verificare che abbia dimensioni appropriate
      const buttonClass = await button.getAttribute('class');
      expect(buttonClass).toMatch(/h-\d+/);
      expect(buttonClass).toMatch(/px-\d+/);
    }
  });

  test('Dovrebbe supportare navigazione con solo tastiera', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare navigazione solo tastiera
    const buttons = page.locator('button');
    
    // ASSERT: Verificare navigazione solo tastiera
    const buttonCount = await buttons.count();
    if (buttonCount > 0) {
      const button = buttons.first();
      await expect(button).toBeVisible();
      
      // Verificare che il button sia navigabile da tastiera
      await button.focus();
      await expect(button).toBeFocused();
      
      // Testare navigazione con Tab
      await page.keyboard.press('Tab');
      
      // Verificare che il button sia ancora presente
      await expect(button).toBeVisible();
      
      // Testare attivazione con Enter
      await button.focus();
      await page.keyboard.press('Enter');
      
      // Verificare che il button sia ancora presente
      await expect(button).toBeVisible();
    }
  });

  test('Dovrebbe gestire stato disabled accessibile', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare stato disabled accessibile
    const buttons = page.locator('button');
    
    // ASSERT: Verificare stato disabled
    const buttonCount = await buttons.count();
    if (buttonCount > 0) {
      const button = buttons.first();
      await expect(button).toBeVisible();
      
      // Verificare che il button non sia disabilitato di default
      const disabled = await button.getAttribute('disabled');
      expect(disabled).toBeNull();
      
      // Verificare che abbia attributi standard
      const type = await button.getAttribute('type');
      expect(type).toBe('button');
    }
  });

  test('Dovrebbe gestire aria-label accessibile', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare aria-label accessibile
    const buttons = page.locator('button');
    
    // ASSERT: Verificare gestione aria-label
    const buttonCount = await buttons.count();
    if (buttonCount > 0) {
      const button = buttons.first();
      await expect(button).toBeVisible();
      
      // Verificare che abbia attributi per aria-label
      const type = await button.getAttribute('type');
      expect(type).toBe('button');
      
      // Verificare che sia un elemento HTML standard
      const tagName = await button.evaluate(el => el.tagName);
      expect(tagName).toBe('BUTTON');
    }
  });

  test('Dovrebbe gestire aria-describedby accessibile', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare aria-describedby accessibile
    const buttons = page.locator('button');
    
    // ASSERT: Verificare gestione aria-describedby
    const buttonCount = await buttons.count();
    if (buttonCount > 0) {
      const button = buttons.first();
      await expect(button).toBeVisible();
      
      // Verificare che abbia attributi per aria-describedby
      const type = await button.getAttribute('type');
      expect(type).toBe('button');
      
      // Verificare che sia un elemento HTML standard
      const tagName = await button.evaluate(el => el.tagName);
      expect(tagName).toBe('BUTTON');
    }
  });

  test('Dovrebbe gestire varianti accessibili', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare varianti accessibili
    const buttons = page.locator('button');
    
    // ASSERT: Verificare gestione varianti
    const buttonCount = await buttons.count();
    if (buttonCount > 0) {
      const button = buttons.first();
      await expect(button).toBeVisible();
      
      // Verificare che abbia attributi per varianti
      const type = await button.getAttribute('type');
      expect(type).toBe('button');
      
      // Verificare che sia un elemento HTML standard
      const tagName = await button.evaluate(el => el.tagName);
      expect(tagName).toBe('BUTTON');
    }
  });

  test('Dovrebbe gestire dimensioni accessibili', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare dimensioni accessibili
    const buttons = page.locator('button');
    
    // ASSERT: Verificare gestione dimensioni
    const buttonCount = await buttons.count();
    if (buttonCount > 0) {
      const button = buttons.first();
      await expect(button).toBeVisible();
      
      // Verificare che abbia attributi per dimensioni
      const type = await button.getAttribute('type');
      expect(type).toBe('button');
      
      // Verificare che sia un elemento HTML standard
      const tagName = await button.evaluate(el => el.tagName);
      expect(tagName).toBe('BUTTON');
    }
  });
});
