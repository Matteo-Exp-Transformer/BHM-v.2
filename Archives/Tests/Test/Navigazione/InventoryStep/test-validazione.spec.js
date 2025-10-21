// Production/Test/Navigazione/InventoryStep/test-validazione.spec.js
import { test, expect } from '@playwright/test';

test.describe('InventoryStep - Test Validazione', () => {

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
    
    await page.click('text=Gestione Inventario');
    await page.waitForTimeout(1000);
  });

  test('Dovrebbe accettare input validi per categoria', async ({ page }) => {
    await page.click('button:has-text("Nuova categoria")');
    await page.waitForTimeout(500);
    
    // Compila form con dati validi
    await page.fill('input[type="text"]', 'Categoria Valida');
    await page.fill('input[type="color"]', '#ff0000');
    await page.fill('textarea', 'Descrizione valida');
    await page.fill('input[type="number"]', '0');
    await page.fill('input[type="number"]', '4');
    await page.fill('input[type="number"]', '5');
    
    await page.click('button:has-text("Salva categoria")');
    await page.waitForTimeout(1000);

    // Verifica successo
    await expect(page.locator('text=Categoria Valida')).toBeVisible();
    await expect(page.locator('form')).not.toBeVisible();
  });

  test('Dovrebbe rifiutare nome categoria vuoto', async ({ page }) => {
    await page.click('button:has-text("Nuova categoria")');
    await page.waitForTimeout(500);
    
    await page.fill('input[type="color"]', '#ff0000');
    await page.fill('input[type="number"]', '0');
    await page.fill('input[type="number"]', '4');
    
    await page.click('button:has-text("Salva categoria")');
    
    await expect(page.locator('text=Nome categoria obbligatorio')).toBeVisible();
  });

  test('Dovrebbe rifiutare nome categoria troppo lungo', async ({ page }) => {
    const longName = 'A'.repeat(101);
    await page.click('button:has-text("Nuova categoria")');
    await page.waitForTimeout(500);
    
    await page.fill('input[type="text"]', longName);
    await page.fill('input[type="color"]', '#ff0000');
    await page.fill('input[type="number"]', '0');
    await page.fill('input[type="number"]', '4');
    
    await page.click('button:has-text("Salva categoria")');
    
    await expect(page.locator('text=Nome categoria troppo lungo')).toBeVisible();
  });

  test('Dovrebbe rifiutare temperatura massima minore di minima', async ({ page }) => {
    await page.click('button:has-text("Nuova categoria")');
    await page.waitForTimeout(500);
    
    await page.fill('input[type="text"]', 'Categoria Temp');
    await page.fill('input[type="color"]', '#ff0000');
    await page.fill('input[type="number"]', '5'); // Min temp
    await page.fill('input[type="number"]', '2'); // Max temp < min temp
    
    await page.click('button:has-text("Salva categoria")');
    
    await expect(page.locator('text=Temperatura massima deve essere maggiore di minima')).toBeVisible();
  });

  test('Dovrebbe rifiutare valori temperatura non validi', async ({ page }) => {
    await page.click('button:has-text("Nuova categoria")');
    await page.waitForTimeout(500);
    
    await page.fill('input[type="text"]', 'Categoria Temp');
    await page.fill('input[type="color"]', '#ff0000');
    
    // Test valori non validi
    const invalidValues = ['abc', '-100', '100', '1.5.5'];
    
    for (const value of invalidValues) {
      await page.fill('input[type="number"]', value);
      await page.click('button:has-text("Salva categoria")');
      
      await expect(page.locator('text=Temperatura non valida')).toBeVisible();
      
      // Reset per test successivo
      await page.click('button:has-text("Annulla")');
      await page.click('button:has-text("Nuova categoria")');
      await page.waitForTimeout(500);
      await page.fill('input[type="text"]', 'Categoria Temp');
      await page.fill('input[type="color"]', '#ff0000');
    }
  });

  test('Dovrebbe gestire caratteri speciali nel nome categoria', async ({ page }) => {
    const specialChars = ['<script>', "'; DROP TABLE--", '../../etc/passwd'];
    
    for (const char of specialChars) {
      await page.click('button:has-text("Nuova categoria")');
      await page.waitForTimeout(500);
      
      await page.fill('input[type="text"]', char);
      await page.fill('input[type="color"]', '#ff0000');
      await page.fill('input[type="number"]', '0');
      await page.fill('input[type="number"]', '4');
      
      await page.click('button:has-text("Salva categoria")');
      
      // Verifica che i caratteri speciali siano gestiti correttamente
      await expect(page.locator('text=Nome contiene caratteri non validi')).toBeVisible();
      
      // Reset per test successivo
      await page.click('button:has-text("Annulla")');
    }
  });

  test('Dovrebbe gestire Unicode nel nome categoria', async ({ page }) => {
    await page.click('button:has-text("Nuova categoria")');
    await page.waitForTimeout(500);
    
    await page.fill('input[type="text"]', '🎉 Categoria Test 日本語');
    await page.fill('input[type="color"]', '#ff0000');
    await page.fill('input[type="number"]', '0');
    await page.fill('input[type="number"]', '4');
    
    await page.click('button:has-text("Salva categoria")');
    await page.waitForTimeout(1000);

    // Verifica che Unicode sia accettato
    await expect(page.locator('text=🎉 Categoria Test 日本語')).toBeVisible();
  });

  test('Dovrebbe accettare input validi per prodotto', async ({ page }) => {
    // Prima crea una categoria
    await page.click('button:has-text("Nuova categoria")');
    await page.waitForTimeout(500);
    
    await page.fill('input[type="text"]', 'Categoria Prodotto');
    await page.fill('input[type="color"]', '#ff0000');
    await page.fill('input[type="number"]', '0');
    await page.fill('input[type="number"]', '4');
    await page.click('button:has-text("Salva categoria")');
    await page.waitForTimeout(1000);
    
    // Vai a Prodotti
    await page.click('button:has-text("Prodotti")');
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("Nuovo prodotto")');
    await page.waitForTimeout(500);
    
    // Compila form prodotto con dati validi
    await page.fill('input[placeholder="Es: Pollo, Pane, Latte..."]', 'Prodotto Valido');
    await page.fill('input[placeholder="SKU del prodotto"]', 'SKU123');
    await page.fill('input[placeholder="Barcode"]', '123456789');
    await page.selectOption('select', '1'); // Categoria
    await page.selectOption('select', '1'); // Reparto
    await page.selectOption('select', '1'); // Conservazione
    await page.fill('input[type="date"]', '2025-01-17');
    await page.fill('input[type="date"]', '2025-01-20');
    await page.fill('input[type="number"]', '5');
    await page.selectOption('select', 'kg');
    
    await page.click('button:has-text("Salva prodotto")');
    await page.waitForTimeout(1000);

    // Verifica successo
    await expect(page.locator('text=Prodotto Valido')).toBeVisible();
    await expect(page.locator('form')).not.toBeVisible();
  });

  test('Dovrebbe rifiutare nome prodotto vuoto', async ({ page }) => {
    // Crea categoria prima
    await page.click('button:has-text("Nuova categoria")');
    await page.waitForTimeout(500);
    
    await page.fill('input[type="text"]', 'Categoria Test');
    await page.fill('input[type="color"]', '#ff0000');
    await page.fill('input[type="number"]', '0');
    await page.fill('input[type="number"]', '4');
    await page.click('button:has-text("Salva categoria")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Prodotti")');
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("Nuovo prodotto")');
    await page.waitForTimeout(500);
    
    await page.selectOption('select', '1');
    await page.selectOption('select', '1');
    await page.selectOption('select', '1');
    await page.fill('input[type="date"]', '2025-01-17');
    await page.fill('input[type="date"]', '2025-01-20');
    await page.fill('input[type="number"]', '1');
    
    await page.click('button:has-text("Salva prodotto")');
    
    await expect(page.locator('text=Nome prodotto obbligatorio')).toBeVisible();
  });

  test('Dovrebbe rifiutare categoria non selezionata', async ({ page }) => {
    // Crea categoria prima
    await page.click('button:has-text("Nuova categoria")');
    await page.waitForTimeout(500);
    
    await page.fill('input[type="text"]', 'Categoria Test');
    await page.fill('input[type="color"]', '#ff0000');
    await page.fill('input[type="number"]', '0');
    await page.fill('input[type="number"]', '4');
    await page.click('button:has-text("Salva categoria")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Prodotti")');
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("Nuovo prodotto")');
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder="Es: Pollo, Pane, Latte..."]', 'Prodotto Test');
    await page.selectOption('select', '1');
    await page.selectOption('select', '1');
    await page.fill('input[type="date"]', '2025-01-17');
    await page.fill('input[type="date"]', '2025-01-20');
    await page.fill('input[type="number"]', '1');
    
    await page.click('button:has-text("Salva prodotto")');
    
    await expect(page.locator('text=Categoria obbligatoria')).toBeVisible();
  });

  test('Dovrebbe rifiutare data scadenza precedente a data acquisto', async ({ page }) => {
    // Crea categoria prima
    await page.click('button:has-text("Nuova categoria")');
    await page.waitForTimeout(500);
    
    await page.fill('input[type="text"]', 'Categoria Test');
    await page.fill('input[type="color"]', '#ff0000');
    await page.fill('input[type="number"]', '0');
    await page.fill('input[type="number"]', '4');
    await page.click('button:has-text("Salva categoria")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Prodotti")');
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("Nuovo prodotto")');
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder="Es: Pollo, Pane, Latte..."]', 'Prodotto Test');
    await page.selectOption('select', '1');
    await page.selectOption('select', '1');
    await page.selectOption('select', '1');
    await page.fill('input[type="date"]', '2025-01-20'); // Data acquisto
    await page.fill('input[type="date"]', '2025-01-17'); // Data scadenza < acquisto
    await page.fill('input[type="number"]', '1');
    
    await page.click('button:has-text("Salva prodotto")');
    
    await expect(page.locator('text=Data scadenza deve essere successiva alla data acquisto')).toBeVisible();
  });

  test('Dovrebbe rifiutare quantità negativa o zero', async ({ page }) => {
    // Crea categoria prima
    await page.click('button:has-text("Nuova categoria")');
    await page.waitForTimeout(500);
    
    await page.fill('input[type="text"]', 'Categoria Test');
    await page.fill('input[type="color"]', '#ff0000');
    await page.fill('input[type="number"]', '0');
    await page.fill('input[type="number"]', '4');
    await page.click('button:has-text("Salva categoria")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Prodotti")');
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("Nuovo prodotto")');
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder="Es: Pollo, Pane, Latte..."]', 'Prodotto Test');
    await page.selectOption('select', '1');
    await page.selectOption('select', '1');
    await page.selectOption('select', '1');
    await page.fill('input[type="date"]', '2025-01-17');
    await page.fill('input[type="date"]', '2025-01-20');
    
    // Test quantità non valide
    const invalidQuantities = ['0', '-1', '-5', 'abc'];
    
    for (const qty of invalidQuantities) {
      await page.fill('input[type="number"]', qty);
      await page.click('button:has-text("Salva prodotto")');
      
      await expect(page.locator('text=Quantità deve essere maggiore di zero')).toBeVisible();
      
      // Reset per test successivo
      await page.fill('input[type="number"]', '');
    }
  });

  test('Dovrebbe gestire URL foto etichetta non valida', async ({ page }) => {
    // Crea categoria prima
    await page.click('button:has-text("Nuova categoria")');
    await page.waitForTimeout(500);
    
    await page.fill('input[type="text"]', 'Categoria Test');
    await page.fill('input[type="color"]', '#ff0000');
    await page.fill('input[type="number"]', '0');
    await page.fill('input[type="number"]', '4');
    await page.click('button:has-text("Salva categoria")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Prodotti")');
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("Nuovo prodotto")');
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder="Es: Pollo, Pane, Latte..."]', 'Prodotto Test');
    await page.selectOption('select', '1');
    await page.selectOption('select', '1');
    await page.selectOption('select', '1');
    await page.fill('input[type="date"]', '2025-01-17');
    await page.fill('input[type="date"]', '2025-01-20');
    await page.fill('input[type="number"]', '1');
    
    // Test URL non valida
    await page.fill('input[placeholder="https://..."]', 'not-a-valid-url');
    await page.click('button:has-text("Salva prodotto")');
    
    await expect(page.locator('text=URL foto etichetta non valida')).toBeVisible();
  });
});
