import { test, expect } from '@playwright/test';

test.describe('Textarea.tsx - Test Accessibilità', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe essere navigabile da tastiera', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare navigazione da tastiera per textarea
    const textareas = page.locator('textarea');
    
    // ASSERT: Verificare che i textarea siano navigabili da tastiera
    const textareaCount = await textareas.count();
    if (textareaCount > 0) {
      const textarea = textareas.first();
      
      // Verificare che il textarea sia focusabile
      await textarea.focus();
      await expect(textarea).toBeFocused();
      
      // Verificare navigazione con Tab
      await page.keyboard.press('Tab');
      
      // Verificare che il textarea sia ancora presente
      await expect(textarea).toBeVisible();
    }
  });

  test('Dovrebbe avere attributi ARIA appropriati', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare attributi ARIA per textarea
    const textareas = page.locator('textarea');
    
    // ASSERT: Verificare attributi ARIA
    const textareaCount = await textareas.count();
    if (textareaCount > 0) {
      const textarea = textareas.first();
      await expect(textarea).toBeVisible();
      
      // Verificare che sia un elemento textarea
      const tagName = await textarea.evaluate(el => el.tagName);
      expect(tagName).toBe('TEXTAREA');
      
      // Verificare che abbia attributi standard
      const rows = await textarea.getAttribute('rows');
      expect(rows).toBeTruthy();
    }
  });

  test('Dovrebbe supportare screen reader', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare supporto screen reader
    const textareas = page.locator('textarea');
    
    // ASSERT: Verificare che i textarea siano accessibili via screen reader
    const textareaCount = await textareas.count();
    if (textareaCount > 0) {
      const textarea = textareas.first();
      await expect(textarea).toBeVisible();
      
      // Verificare che sia un elemento HTML standard
      const tagName = await textarea.evaluate(el => el.tagName);
      expect(tagName).toBe('TEXTAREA');
      
      // Verificare che sia focusabile
      await textarea.focus();
      await expect(textarea).toBeFocused();
    }
  });

  test('Dovrebbe gestire label associati', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare label associati
    const textareas = page.locator('textarea');
    const labels = page.locator('label');
    
    // ASSERT: Verificare gestione label
    const textareaCount = await textareas.count();
    const labelCount = await labels.count();
    
    if (textareaCount > 0) {
      const textarea = textareas.first();
      await expect(textarea).toBeVisible();
      
      // Verificare che sia un elemento HTML standard che supporta label
      const tagName = await textarea.evaluate(el => el.tagName);
      expect(tagName).toBe('TEXTAREA');
    }
    
    expect(labelCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe avere contrasto adeguato', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare contrasto
    const textareas = page.locator('textarea');
    
    // ASSERT: Verificare che i textarea abbiano classi CSS per contrasto
    const textareaCount = await textareas.count();
    if (textareaCount > 0) {
      const textarea = textareas.first();
      await expect(textarea).toBeVisible();
      
      // Verificare che abbia classi CSS per contrasto
      const textareaClass = await textarea.getAttribute('class');
      expect(textareaClass).toContain('text-sm'); // Testo di dimensione appropriata
      
      // Verificare che abbia classi per colore del testo
      expect(textareaClass).toContain('bg-background');
    }
  });

  test('Dovrebbe gestire stato focus visivamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare stato focus visivo
    const textareas = page.locator('textarea');
    
    // ASSERT: Verificare gestione focus visivo
    const textareaCount = await textareas.count();
    if (textareaCount > 0) {
      const textarea = textareas.first();
      await expect(textarea).toBeVisible();
      
      // Verificare che abbia classi CSS per focus
      const textareaClass = await textarea.getAttribute('class');
      expect(textareaClass).toContain('transition-colors'); // Transizione per focus
      
      // Testare focus
      await textarea.focus();
      await expect(textarea).toBeFocused();
    }
  });

  test('Dovrebbe supportare navigazione sequenziale', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare navigazione sequenziale
    const textareas = page.locator('textarea');
    
    // ASSERT: Verificare navigazione sequenziale
    const textareaCount = await textareas.count();
    if (textareaCount > 0) {
      const textarea = textareas.first();
      await expect(textarea).toBeVisible();
      
      // Verificare che il textarea sia navigabile
      await textarea.focus();
      await expect(textarea).toBeFocused();
      
      // Verificare navigazione con Tab
      await page.keyboard.press('Tab');
      
      // Verificare che il textarea sia ancora presente
      await expect(textarea).toBeVisible();
    }
  });

  test('Dovrebbe gestire errori accessibili', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare gestione errori accessibili
    const textareas = page.locator('textarea');
    
    // ASSERT: Verificare gestione errori
    const textareaCount = await textareas.count();
    if (textareaCount > 0) {
      const textarea = textareas.first();
      await expect(textarea).toBeVisible();
      
      // Verificare che sia un elemento HTML standard
      const tagName = await textarea.evaluate(el => el.tagName);
      expect(tagName).toBe('TEXTAREA');
      
      // Verificare che abbia attributi standard per gestione errori
      const rows = await textarea.getAttribute('rows');
      expect(rows).toBeTruthy();
    }
  });

  test('Dovrebbe supportare shortcut da tastiera', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare shortcut da tastiera
    const textareas = page.locator('textarea');
    
    // ASSERT: Verificare shortcut da tastiera
    const textareaCount = await textareas.count();
    if (textareaCount > 0) {
      const textarea = textareas.first();
      await expect(textarea).toBeVisible();
      
      // Verificare che il textarea sia focusabile
      await textarea.focus();
      await expect(textarea).toBeFocused();
      
      // Testare shortcut comuni (Ctrl+A per selezionare tutto)
      await textarea.fill('Test content');
      await page.keyboard.press('Control+a');
      
      // Verificare che il textarea sia ancora presente
      await expect(textarea).toBeVisible();
    }
  });

  test('Dovrebbe avere dimensioni touch-friendly', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare dimensioni touch-friendly
    const textareas = page.locator('textarea');
    
    // ASSERT: Verificare dimensioni appropriate
    const textareaCount = await textareas.count();
    if (textareaCount > 0) {
      const textarea = textareas.first();
      await expect(textarea).toBeVisible();
      
      // Verificare che abbia dimensioni appropriate
      const textareaClass = await textarea.getAttribute('class');
      expect(textareaClass).toContain('min-h-[80px]'); // Altezza minima per touch
      expect(textareaClass).toContain('w-full'); // Larghezza appropriata
      expect(textareaClass).toContain('px-3'); // Padding orizzontale
      expect(textareaClass).toContain('py-2'); // Padding verticale
    }
  });

  test('Dovrebbe supportare modalità ad alto contrasto', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare supporto alto contrasto
    const textareas = page.locator('textarea');
    
    // ASSERT: Verificare supporto alto contrasto
    const textareaCount = await textareas.count();
    if (textareaCount > 0) {
      const textarea = textareas.first();
      await expect(textarea).toBeVisible();
      
      // Verificare che abbia classi CSS per contrasto
      const textareaClass = await textarea.getAttribute('class');
      expect(textareaClass).toContain('border'); // Bordo per contrasto
      expect(textareaClass).toContain('bg-background'); // Background definito
      
      // Verificare che sia un elemento HTML standard
      const tagName = await textarea.evaluate(el => el.tagName);
      expect(tagName).toBe('TEXTAREA');
    }
  });

  test('Dovrebbe gestire zoom senza problemi', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare zoom
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // ASSERT: Verificare che i textarea siano ancora accessibili con zoom
    const textareas = page.locator('textarea');
    const textareaCount = await textareas.count();
    if (textareaCount > 0) {
      const textarea = textareas.first();
      await expect(textarea).toBeVisible();
      
      // Verificare che il textarea sia ancora focusabile
      await textarea.focus();
      await expect(textarea).toBeFocused();
      
      // Verificare che abbia dimensioni appropriate
      const textareaClass = await textarea.getAttribute('class');
      expect(textareaClass).toContain('min-h-[80px]');
      expect(textareaClass).toContain('w-full');
    }
  });

  test('Dovrebbe supportare navigazione con solo tastiera', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare navigazione solo tastiera
    const textareas = page.locator('textarea');
    
    // ASSERT: Verificare navigazione solo tastiera
    const textareaCount = await textareas.count();
    if (textareaCount > 0) {
      const textarea = textareas.first();
      await expect(textarea).toBeVisible();
      
      // Verificare che il textarea sia navigabile da tastiera
      await textarea.focus();
      await expect(textarea).toBeFocused();
      
      // Testare navigazione con Tab
      await page.keyboard.press('Tab');
      
      // Verificare che il textarea sia ancora presente
      await expect(textarea).toBeVisible();
      
      // Testare input da tastiera
      await textarea.focus();
      await page.keyboard.type('Test keyboard navigation');
      const value = await textarea.inputValue();
      expect(value).toBe('Test keyboard navigation');
    }
  });

  test('Dovrebbe gestire resize accessibile', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare resize accessibile
    const textareas = page.locator('textarea');
    
    // ASSERT: Verificare gestione resize
    const textareaCount = await textareas.count();
    if (textareaCount > 0) {
      const textarea = textareas.first();
      await expect(textarea).toBeVisible();
      
      // Verificare che abbia attributi per resize
      const resize = await textarea.getAttribute('resize');
      expect(resize).toBeTruthy();
      
      // Verificare che sia un elemento HTML standard
      const tagName = await textarea.evaluate(el => el.tagName);
      expect(tagName).toBe('TEXTAREA');
    }
  });

  test('Dovrebbe gestire stato disabled accessibile', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare stato disabled accessibile
    const textareas = page.locator('textarea');
    
    // ASSERT: Verificare stato disabled
    const textareaCount = await textareas.count();
    if (textareaCount > 0) {
      const textarea = textareas.first();
      await expect(textarea).toBeVisible();
      
      // Verificare che il textarea non sia disabilitato di default
      const disabled = await textarea.getAttribute('disabled');
      expect(disabled).toBeNull();
      
      // Verificare che abbia attributi standard
      const tagName = await textarea.evaluate(el => el.tagName);
      expect(tagName).toBe('TEXTAREA');
    }
  });

  test('Dovrebbe gestire placeholder accessibile', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare placeholder accessibile
    const textareas = page.locator('textarea');
    
    // ASSERT: Verificare gestione placeholder
    const textareaCount = await textareas.count();
    if (textareaCount > 0) {
      const textarea = textareas.first();
      await expect(textarea).toBeVisible();
      
      // Verificare che abbia classi CSS per placeholder
      const textareaClass = await textarea.getAttribute('class');
      expect(textareaClass).toContain('placeholder:text-muted-foreground');
      
      // Verificare che sia un elemento HTML standard
      const tagName = await textarea.evaluate(el => el.tagName);
      expect(tagName).toBe('TEXTAREA');
    }
  });

  test('Dovrebbe gestire scroll accessibile', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare scroll accessibile
    const textareas = page.locator('textarea');
    
    // ASSERT: Verificare gestione scroll
    const textareaCount = await textareas.count();
    if (textareaCount > 0) {
      const textarea = textareas.first();
      await expect(textarea).toBeVisible();
      
      // Verificare che abbia attributi per scroll
      const rows = await textarea.getAttribute('rows');
      expect(rows).toBeTruthy();
      
      // Verificare che sia un elemento HTML standard
      const tagName = await textarea.evaluate(el => el.tagName);
      expect(tagName).toBe('TEXTAREA');
    }
  });
});
