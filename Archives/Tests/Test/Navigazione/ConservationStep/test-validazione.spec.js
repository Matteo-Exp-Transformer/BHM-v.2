// Production/Test/Navigazione/ConservationStep/test-validazione.spec.js
import { test, expect } from '@playwright/test';

test.describe('ConservationStep - Test Validazione', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Setup Mock Auth tramite Role Selector
    const roleSelector = page.locator('text=Mock Auth System');
    if (await roleSelector.isVisible()) {
      await page.locator('text=Amministratore').click();
      await page.locator('button:has-text("Conferma Ruolo")').click();
      await page.waitForTimeout(2000);
    }
    
    // Naviga all'onboarding
    await page.goto('/onboarding');
    await page.waitForTimeout(1000);
    
    await page.click('text=Punti di conservazione');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Aggiungi punto")');
    await page.waitForTimeout(1000);
  });

  test('Dovrebbe accettare input validi', async ({ page }) => {
    // Compila form con dati validi
    await page.fill('input[id="point-name"]', 'Frigo Test');
    await page.selectOption('select', '1'); // Primo reparto
    await page.click('button:has-text("Frigorifero")');
    await page.fill('input[id="point-temperature"]', '4');
    await page.waitForTimeout(500);
    
    // Seleziona categoria compatibile
    await page.click('button:has-text("Carne fresca")');
    
    // Salva
    await page.click('button:has-text("Aggiungi punto")');
    await page.waitForTimeout(1000);

    // Verifica successo
    await expect(page.locator('text=Frigo Test')).toBeVisible();
    await expect(page.locator('form')).not.toBeVisible();
  });

  test('Dovrebbe rifiutare nome vuoto', async ({ page }) => {
    await page.selectOption('select', '1');
    await page.click('button:has-text("Frigorifero")');
    await page.fill('input[id="point-temperature"]', '4');
    await page.click('button:has-text("Carne fresca")');
    
    await page.click('button:has-text("Aggiungi punto")');
    
    await expect(page.locator('text=Nome obbligatorio')).toBeVisible();
  });

  test('Dovrebbe rifiutare nome troppo lungo', async ({ page }) => {
    const longName = 'A'.repeat(101);
    await page.fill('input[id="point-name"]', longName);
    await page.selectOption('select', '1');
    await page.click('button:has-text("Frigorifero")');
    await page.fill('input[id="point-temperature"]', '4');
    await page.click('button:has-text("Carne fresca")');
    
    await page.click('button:has-text("Aggiungi punto")');
    
    await expect(page.locator('text=Nome troppo lungo')).toBeVisible();
  });

  test('Dovrebbe rifiutare reparto non selezionato', async ({ page }) => {
    await page.fill('input[id="point-name"]', 'Test Frigo');
    await page.click('button:has-text("Frigorifero")');
    await page.fill('input[id="point-temperature"]', '4');
    await page.click('button:has-text("Carne fresca")');
    
    await page.click('button:has-text("Aggiungi punto")');
    
    await expect(page.locator('text=Reparto obbligatorio')).toBeVisible();
  });

  test('Dovrebbe rifiutare temperatura non valida per tipo', async ({ page }) => {
    await page.fill('input[id="point-name"]', 'Test Frigo');
    await page.selectOption('select', '1');
    await page.click('button:has-text("Frigorifero")');
    
    // Temperatura troppo alta per frigorifero
    await page.fill('input[id="point-temperature"]', '15');
    await page.waitForTimeout(500);
    
    await expect(page.locator('text=Temperatura fuori range')).toBeVisible();
  });

  test('Dovrebbe rifiutare nessuna categoria selezionata', async ({ page }) => {
    await page.fill('input[id="point-name"]', 'Test Frigo');
    await page.selectOption('select', '1');
    await page.click('button:has-text("Frigorifero")');
    await page.fill('input[id="point-temperature"]', '4');
    
    await page.click('button:has-text("Aggiungi punto")');
    
    await expect(page.locator('text=Seleziona almeno una categoria')).toBeVisible();
  });

  test('Dovrebbe gestire caratteri speciali nel nome', async ({ page }) => {
    const specialChars = ['<script>', "'; DROP TABLE--", '../../etc/passwd'];
    
    for (const char of specialChars) {
      await page.fill('input[id="point-name"]', char);
      await page.selectOption('select', '1');
      await page.click('button:has-text("Frigorifero")');
      await page.fill('input[id="point-temperature"]', '4');
      await page.click('button:has-text("Carne fresca")');
      
      await page.click('button:has-text("Aggiungi punto")');
      
      // Verifica che i caratteri speciali siano gestiti correttamente
      await expect(page.locator('text=Nome contiene caratteri non validi')).toBeVisible();
      
      // Reset form per test successivo
      await page.click('button:has-text("Annulla")');
      await page.click('button:has-text("Aggiungi punto")');
    }
  });

  test('Dovrebbe gestire Unicode nel nome', async ({ page }) => {
    await page.fill('input[id="point-name"]', '🎉 Frigo Test 日本語');
    await page.selectOption('select', '1');
    await page.click('button:has-text("Frigorifero")');
    await page.fill('input[id="point-temperature"]', '4');
    await page.click('button:has-text("Carne fresca")');
    
    await page.click('button:has-text("Aggiungi punto")');
    await page.waitForTimeout(1000);

    // Verifica che Unicode sia accettato
    await expect(page.locator('text=🎉 Frigo Test 日本語')).toBeVisible();
  });

  test('Dovrebbe validare temperature per diversi tipi', async ({ page }) => {
    await page.fill('input[id="point-name"]', 'Test Point');
    await page.selectOption('select', '1');
    
    // Test Congelatore
    await page.click('button:has-text("Congelatore")');
    await page.fill('input[id="point-temperature"]', '-25');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Temperatura fuori range')).not.toBeVisible();
    
    // Test temperatura troppo alta per congelatore
    await page.fill('input[id="point-temperature"]', '5');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Temperatura fuori range')).toBeVisible();
    
    // Test Abbattitore
    await page.click('button:has-text("Abbattitore")');
    await page.fill('input[id="point-temperature"]', '-30');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Temperatura fuori range')).not.toBeVisible();
  });

  test('Dovrebbe gestire valori limite temperatura', async ({ page }) => {
    await page.fill('input[id="point-name"]', 'Test Point');
    await page.selectOption('select', '1');
    await page.click('button:has-text("Frigorifero")');
    
    // Test valori limite
    const testCases = [
      { temp: '0', valid: true },
      { temp: '4', valid: true },
      { temp: '-1', valid: false },
      { temp: '5', valid: false },
      { temp: '2.5', valid: true },
      { temp: '3.7', valid: true }
    ];
    
    for (const testCase of testCases) {
      await page.fill('input[id="point-temperature"]', testCase.temp);
      await page.waitForTimeout(500);
      
      if (testCase.valid) {
        await expect(page.locator('text=Temperatura fuori range')).not.toBeVisible();
      } else {
        await expect(page.locator('text=Temperatura fuori range')).toBeVisible();
      }
    }
  });
});
