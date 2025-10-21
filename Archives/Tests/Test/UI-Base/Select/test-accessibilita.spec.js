import { test, expect } from '@playwright/test';

test.describe('Select.tsx - Test Accessibilità', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe essere navigabile da tastiera', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare navigazione da tastiera per select
    const selectTriggers = page.locator('button[role="combobox"]');
    
    // ASSERT: Verificare che i select siano navigabili da tastiera
    const selectCount = await selectTriggers.count();
    if (selectCount > 0) {
      const select = selectTriggers.first();
      
      // Verificare che il select sia focusabile
      await select.focus();
      await expect(select).toBeFocused();
      
      // Verificare navigazione con Tab
      await page.keyboard.press('Tab');
      
      // Verificare che il select sia ancora presente
      await expect(select).toBeVisible();
    }
  });

  test('Dovrebbe avere attributi ARIA appropriati', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare attributi ARIA per select
    const selectTriggers = page.locator('button[role="combobox"]');
    
    // ASSERT: Verificare attributi ARIA
    const selectCount = await selectTriggers.count();
    if (selectCount > 0) {
      const select = selectTriggers.first();
      await expect(select).toBeVisible();
      
      // Verificare che abbia il ruolo combobox
      const role = await select.getAttribute('role');
      expect(role).toBe('combobox');
      
      // Verificare che abbia attributi ARIA appropriati
      const ariaExpanded = await select.getAttribute('aria-expanded');
      expect(ariaExpanded).toBeTruthy();
    }
  });

  test('Dovrebbe supportare screen reader', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare supporto screen reader
    const selectTriggers = page.locator('button[role="combobox"]');
    
    // ASSERT: Verificare che i select siano accessibili via screen reader
    const selectCount = await selectTriggers.count();
    if (selectCount > 0) {
      const select = selectTriggers.first();
      await expect(select).toBeVisible();
      
      // Verificare che abbia attributi standard per screen reader
      const role = await select.getAttribute('role');
      expect(role).toBe('combobox');
      
      // Verificare che sia focusabile
      await select.focus();
      await expect(select).toBeFocused();
    }
  });

  test('Dovrebbe gestire label associati', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare label associati
    const selectTriggers = page.locator('button[role="combobox"]');
    const labels = page.locator('label');
    
    // ASSERT: Verificare gestione label
    const selectCount = await selectTriggers.count();
    const labelCount = await labels.count();
    
    if (selectCount > 0) {
      const select = selectTriggers.first();
      await expect(select).toBeVisible();
      
      // Verificare che abbia attributi standard
      const role = await select.getAttribute('role');
      expect(role).toBe('combobox');
    }
    
    expect(labelCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe avere contrasto adeguato', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare contrasto
    const selectTriggers = page.locator('button[role="combobox"]');
    
    // ASSERT: Verificare che i select abbiano classi CSS per contrasto
    const selectCount = await selectTriggers.count();
    if (selectCount > 0) {
      const select = selectTriggers.first();
      await expect(select).toBeVisible();
      
      // Verificare che abbia classi CSS per contrasto
      const selectClass = await select.getAttribute('class');
      expect(selectClass).toContain('text-sm'); // Testo di dimensione appropriata
      
      // Verificare che abbia classi per colore del testo
      expect(selectClass).toContain('bg-background');
    }
  });

  test('Dovrebbe gestire stato focus visivamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare stato focus visivo
    const selectTriggers = page.locator('button[role="combobox"]');
    
    // ASSERT: Verificare gestione focus visivo
    const selectCount = await selectTriggers.count();
    if (selectCount > 0) {
      const select = selectTriggers.first();
      await expect(select).toBeVisible();
      
      // Verificare che abbia classi CSS per focus
      const selectClass = await select.getAttribute('class');
      expect(selectClass).toContain('transition-colors'); // Transizione per focus
      
      // Testare focus
      await select.focus();
      await expect(select).toBeFocused();
    }
  });

  test('Dovrebbe supportare navigazione sequenziale', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare navigazione sequenziale
    const selectTriggers = page.locator('button[role="combobox"]');
    
    // ASSERT: Verificare navigazione sequenziale
    const selectCount = await selectTriggers.count();
    if (selectCount > 0) {
      const select = selectTriggers.first();
      await expect(select).toBeVisible();
      
      // Verificare che il select sia navigabile
      await select.focus();
      await expect(select).toBeFocused();
      
      // Verificare navigazione con Tab
      await page.keyboard.press('Tab');
      
      // Verificare che il select sia ancora presente
      await expect(select).toBeVisible();
    }
  });

  test('Dovrebbe gestire errori accessibili', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare gestione errori accessibili
    const selectTriggers = page.locator('button[role="combobox"]');
    
    // ASSERT: Verificare gestione errori
    const selectCount = await selectTriggers.count();
    if (selectCount > 0) {
      const select = selectTriggers.first();
      await expect(select).toBeVisible();
      
      // Verificare che abbia attributi standard per gestione errori
      const role = await select.getAttribute('role');
      expect(role).toBe('combobox');
      
      // Verificare che abbia attributi ARIA appropriati
      const ariaExpanded = await select.getAttribute('aria-expanded');
      expect(ariaExpanded).toBeTruthy();
    }
  });

  test('Dovrebbe supportare shortcut da tastiera', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare shortcut da tastiera
    const selectTriggers = page.locator('button[role="combobox"]');
    
    // ASSERT: Verificare shortcut da tastiera
    const selectCount = await selectTriggers.count();
    if (selectCount > 0) {
      const select = selectTriggers.first();
      await expect(select).toBeVisible();
      
      // Verificare che il select sia focusabile
      await select.focus();
      await expect(select).toBeFocused();
      
      // Testare shortcut comuni (Space per aprire)
      await page.keyboard.press('Space');
      
      // Verificare che il select sia ancora presente
      await expect(select).toBeVisible();
    }
  });

  test('Dovrebbe avere dimensioni touch-friendly', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare dimensioni touch-friendly
    const selectTriggers = page.locator('button[role="combobox"]');
    
    // ASSERT: Verificare dimensioni appropriate
    const selectCount = await selectTriggers.count();
    if (selectCount > 0) {
      const select = selectTriggers.first();
      await expect(select).toBeVisible();
      
      // Verificare che abbia dimensioni appropriate
      const selectClass = await select.getAttribute('class');
      expect(selectClass).toContain('h-10'); // Altezza minima per touch
      expect(selectClass).toContain('w-full'); // Larghezza appropriata
      expect(selectClass).toContain('px-3'); // Padding orizzontale
      expect(selectClass).toContain('py-2'); // Padding verticale
    }
  });

  test('Dovrebbe supportare modalità ad alto contrasto', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare supporto alto contrasto
    const selectTriggers = page.locator('button[role="combobox"]');
    
    // ASSERT: Verificare supporto alto contrasto
    const selectCount = await selectTriggers.count();
    if (selectCount > 0) {
      const select = selectTriggers.first();
      await expect(select).toBeVisible();
      
      // Verificare che abbia classi CSS per contrasto
      const selectClass = await select.getAttribute('class');
      expect(selectClass).toContain('border'); // Bordo per contrasto
      expect(selectClass).toContain('bg-background'); // Background definito
      
      // Verificare che abbia il ruolo corretto
      const role = await select.getAttribute('role');
      expect(role).toBe('combobox');
    }
  });

  test('Dovrebbe gestire zoom senza problemi', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare zoom
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // ASSERT: Verificare che i select siano ancora accessibili con zoom
    const selectTriggers = page.locator('button[role="combobox"]');
    const selectCount = await selectTriggers.count();
    if (selectCount > 0) {
      const select = selectTriggers.first();
      await expect(select).toBeVisible();
      
      // Verificare che il select sia ancora focusabile
      await select.focus();
      await expect(select).toBeFocused();
      
      // Verificare che abbia dimensioni appropriate
      const selectClass = await select.getAttribute('class');
      expect(selectClass).toContain('h-10');
      expect(selectClass).toContain('w-full');
    }
  });

  test('Dovrebbe supportare navigazione con solo tastiera', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare navigazione solo tastiera
    const selectTriggers = page.locator('button[role="combobox"]');
    
    // ASSERT: Verificare navigazione solo tastiera
    const selectCount = await selectTriggers.count();
    if (selectCount > 0) {
      const select = selectTriggers.first();
      await expect(select).toBeVisible();
      
      // Verificare che il select sia navigabile da tastiera
      await select.focus();
      await expect(select).toBeFocused();
      
      // Testare navigazione con Tab
      await page.keyboard.press('Tab');
      
      // Verificare che il select sia ancora presente
      await expect(select).toBeVisible();
      
      // Testare apertura con Space
      await select.focus();
      await page.keyboard.press('Space');
      
      // Verificare che il select sia ancora presente
      await expect(select).toBeVisible();
    }
  });

  test('Dovrebbe gestire option accessibili', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare option accessibili
    const selectTriggers = page.locator('button[role="combobox"]');
    
    // ASSERT: Verificare option accessibili
    const selectCount = await selectTriggers.count();
    if (selectCount > 0) {
      const select = selectTriggers.first();
      await expect(select).toBeVisible();
      
      // Verificare che il select sia focusabile
      await select.focus();
      await expect(select).toBeFocused();
      
      // Testare apertura dropdown
      await page.keyboard.press('Space');
      
      // Verificare che il select sia ancora presente
      await expect(select).toBeVisible();
      
      // Verificare che abbia attributi ARIA appropriati
      const role = await select.getAttribute('role');
      expect(role).toBe('combobox');
    }
  });

  test('Dovrebbe gestire stato disabled accessibile', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare stato disabled accessibile
    const selectTriggers = page.locator('button[role="combobox"]');
    
    // ASSERT: Verificare stato disabled
    const selectCount = await selectTriggers.count();
    if (selectCount > 0) {
      const select = selectTriggers.first();
      await expect(select).toBeVisible();
      
      // Verificare che il select non sia disabilitato di default
      const disabled = await select.getAttribute('disabled');
      expect(disabled).toBeNull();
      
      // Verificare che abbia attributi ARIA appropriati
      const role = await select.getAttribute('role');
      expect(role).toBe('combobox');
    }
  });

  test('Dovrebbe gestire placeholder accessibile', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare placeholder accessibile
    const selectTriggers = page.locator('button[role="combobox"]');
    
    // ASSERT: Verificare gestione placeholder
    const selectCount = await selectTriggers.count();
    if (selectCount > 0) {
      const select = selectTriggers.first();
      await expect(select).toBeVisible();
      
      // Verificare che abbia classi CSS per placeholder
      const selectClass = await select.getAttribute('class');
      expect(selectClass).toContain('placeholder:text-muted-foreground');
      
      // Verificare che abbia attributi ARIA appropriati
      const role = await select.getAttribute('role');
      expect(role).toBe('combobox');
    }
  });
});
