// Production/Test/Navigazione/InventoryStep/test-funzionale.spec.js
import { test, expect } from '@playwright/test';

test.describe('InventoryStep - Test Funzionali', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/onboarding');
    await page.evaluate(() => window.setMockRole('admin'));
    await page.reload();
    await page.waitForTimeout(2000);
    
    await page.click('text=Gestione Inventario');
    await page.waitForTimeout(1000);
  });

  test('Dovrebbe renderizzare correttamente il componente', async ({ page }) => {
    // Verifica elementi principali
    await expect(page.locator('h2:has-text("Gestione Inventario")')).toBeVisible();
    await expect(page.locator('text=Configura categorie prodotti e inventario iniziale')).toBeVisible();
    
    // Verifica tab navigation
    await expect(page.locator('button:has-text("Categorie Prodotti")')).toBeVisible();
    await expect(page.locator('button:has-text("Prodotti")')).toBeVisible();
    
    // Verifica che sia attiva la tab Categorie
    await expect(page.locator('button:has-text("Categorie Prodotti")')).toHaveClass(/bg-white/);
  });

  test('Dovrebbe gestire la navigazione tra tab', async ({ page }) => {
    // Verifica tab Categorie attiva inizialmente
    await expect(page.locator('text=Categorie configurate')).toBeVisible();
    
    // Click su tab Prodotti
    await page.click('button:has-text("Prodotti")');
    await page.waitForTimeout(500);
    
    // Verifica che la tab Prodotti sia attiva
    await expect(page.locator('button:has-text("Prodotti")')).toHaveClass(/bg-white/);
    await expect(page.locator('text=Prodotti configurati')).toBeVisible();
    
    // Torna a Categorie
    await page.click('button:has-text("Categorie Prodotti")');
    await page.waitForTimeout(500);
    
    await expect(page.locator('button:has-text("Categorie Prodotti")')).toHaveClass(/bg-white/);
    await expect(page.locator('text=Categorie configurate')).toBeVisible();
  });

  test('Dovrebbe gestire la creazione di una nuova categoria', async ({ page }) => {
    // Click su "Nuova categoria"
    await page.click('button:has-text("Nuova categoria")');
    await page.waitForTimeout(500);
    
    // Verifica che il form sia visibile
    await expect(page.locator('h4:has-text("Nuova categoria")')).toBeVisible();
    
    // Compila form categoria
    await page.fill('input[type="text"]', 'Carne Fresca');
    await page.fill('input[type="color"]', '#ff0000');
    await page.fill('textarea', 'Categoria per carne fresca');
    await page.fill('input[type="number"]', '0');
    await page.fill('input[type="number"]', '4');
    await page.fill('input[type="number"]', '3');
    
    // Salva categoria
    await page.click('button:has-text("Salva categoria")');
    await page.waitForTimeout(1000);
    
    // Verifica che la categoria sia stata creata
    await expect(page.locator('text=Carne Fresca')).toBeVisible();
    await expect(page.locator('form')).not.toBeVisible();
  });

  test('Dovrebbe gestire la modifica di una categoria esistente', async ({ page }) => {
    // Crea una categoria prima
    await page.click('button:has-text("Nuova categoria")');
    await page.waitForTimeout(500);
    
    await page.fill('input[type="text"]', 'Categoria Test');
    await page.fill('input[type="color"]', '#00ff00');
    await page.fill('input[type="number"]', '0');
    await page.fill('input[type="number"]', '4');
    await page.click('button:has-text("Salva categoria")');
    await page.waitForTimeout(1000);
    
    // Modifica la categoria
    await page.click('button[title="Modifica categoria"]');
    await page.waitForTimeout(500);
    
    // Verifica che il form sia aperto in modalità modifica
    await expect(page.locator('h4:has-text("Modifica categoria")')).toBeVisible();
    
    // Modifica il nome
    await page.fill('input[type="text"]', 'Categoria Modificata');
    await page.click('button:has-text("Salva categoria")');
    await page.waitForTimeout(1000);
    
    // Verifica che il nome sia stato aggiornato
    await expect(page.locator('text=Categoria Modificata')).toBeVisible();
  });

  test('Dovrebbe gestire l\'eliminazione di una categoria', async ({ page }) => {
    // Crea una categoria
    await page.click('button:has-text("Nuova categoria")');
    await page.waitForTimeout(500);
    
    await page.fill('input[type="text"]', 'Categoria da Eliminare');
    await page.fill('input[type="color"]', '#0000ff');
    await page.fill('input[type="number"]', '0');
    await page.fill('input[type="number"]', '4');
    await page.click('button:has-text("Salva categoria")');
    await page.waitForTimeout(1000);
    
    // Elimina la categoria
    await page.click('button[title="Elimina categoria"]');
    await page.waitForTimeout(500);
    
    // Verifica che la categoria sia stata eliminata
    await expect(page.locator('text=Categoria da Eliminare')).not.toBeVisible();
  });

  test('Dovrebbe gestire la creazione di un nuovo prodotto', async ({ page }) => {
    // Prima crea una categoria
    await page.click('button:has-text("Nuova categoria")');
    await page.waitForTimeout(500);
    
    await page.fill('input[type="text"]', 'Categoria Prodotto');
    await page.fill('input[type="color"]', '#ff00ff');
    await page.fill('input[type="number"]', '0');
    await page.fill('input[type="number"]', '4');
    await page.click('button:has-text("Salva categoria")');
    await page.waitForTimeout(1000);
    
    // Vai alla tab Prodotti
    await page.click('button:has-text("Prodotti")');
    await page.waitForTimeout(500);
    
    // Click su "Nuovo prodotto"
    await page.click('button:has-text("Nuovo prodotto")');
    await page.waitForTimeout(500);
    
    // Verifica che il form sia visibile
    await expect(page.locator('h4:has-text("Nuovo Prodotto")')).toBeVisible();
    
    // Compila form prodotto
    await page.fill('input[placeholder="Es: Pollo, Pane, Latte..."]', 'Pollo Fresco');
    await page.selectOption('select', '1'); // Prima categoria
    await page.selectOption('select', '1'); // Primo reparto
    await page.selectOption('select', '1'); // Primo punto conservazione
    
    // Compila date e quantità
    await page.fill('input[type="date"]', '2025-01-17');
    await page.fill('input[type="date"]', '2025-01-20');
    await page.fill('input[type="number"]', '5');
    await page.selectOption('select', 'kg');
    
    // Salva prodotto
    await page.click('button:has-text("Salva prodotto")');
    await page.waitForTimeout(1000);
    
    // Verifica che il prodotto sia stato creato
    await expect(page.locator('text=Pollo Fresco')).toBeVisible();
    await expect(page.locator('form')).not.toBeVisible();
  });

  test('Dovrebbe gestire la selezione di allergeni', async ({ page }) => {
    // Crea categoria prima
    await page.click('button:has-text("Nuova categoria")');
    await page.waitForTimeout(500);
    
    await page.fill('input[type="text"]', 'Categoria Allergeni');
    await page.fill('input[type="color"]', '#ffff00');
    await page.fill('input[type="number"]', '0');
    await page.fill('input[type="number"]', '4');
    await page.click('button:has-text("Salva categoria")');
    await page.waitForTimeout(1000);
    
    // Vai a Prodotti
    await page.click('button:has-text("Prodotti")');
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("Nuovo prodotto")');
    await page.waitForTimeout(500);
    
    // Compila campi base
    await page.fill('input[placeholder="Es: Pollo, Pane, Latte..."]', 'Prodotto con Allergeni');
    await page.selectOption('select', '1');
    await page.selectOption('select', '1');
    await page.selectOption('select', '1');
    await page.fill('input[type="date"]', '2025-01-17');
    await page.fill('input[type="date"]', '2025-01-20');
    await page.fill('input[type="number"]', '1');
    
    // Seleziona allergeni
    await page.check('input[type="checkbox"]');
    await page.waitForTimeout(500);
    
    // Verifica che gli allergeni siano selezionati
    await expect(page.locator('input[type="checkbox"]:checked')).toHaveCount(1);
    
    await page.click('button:has-text("Salva prodotto")');
    await page.waitForTimeout(1000);
    
    await expect(page.locator('text=Prodotto con Allergeni')).toBeVisible();
  });

  test('Dovrebbe gestire l\'accessibilità corretta', async ({ page }) => {
    // Verifica attributi ARIA
    const nameInput = page.locator('input[type="text"]');
    await expect(nameInput).toBeVisible();
    
    // Verifica keyboard navigation
    await page.press('body', 'Tab');
    await page.press('body', 'Tab');
    await page.press('body', 'Enter');
    
    // Verifica che il form si apra con keyboard navigation
    await expect(page.locator('form')).toBeVisible();
    
    // Verifica che i label siano associati correttamente
    await expect(page.locator('label')).toBeVisible();
  });

  test('Dovrebbe gestire la validazione compliance prodotti', async ({ page }) => {
    // Crea categoria
    await page.click('button:has-text("Nuova categoria")');
    await page.waitForTimeout(500);
    
    await page.fill('input[type="text"]', 'Categoria Compliance');
    await page.fill('input[type="color"]', '#00ffff');
    await page.fill('input[type="number"]', '0');
    await page.fill('input[type="number"]', '4');
    await page.click('button:has-text("Salva categoria")');
    await page.waitForTimeout(1000);
    
    // Vai a Prodotti
    await page.click('button:has-text("Prodotti")');
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("Nuovo prodotto")');
    await page.waitForTimeout(500);
    
    // Compila prodotto
    await page.fill('input[placeholder="Es: Pollo, Pane, Latte..."]', 'Prodotto Compliance');
    await page.selectOption('select', '1');
    await page.selectOption('select', '1');
    await page.selectOption('select', '1');
    await page.fill('input[type="date"]', '2025-01-17');
    await page.fill('input[type="date"]', '2025-01-20');
    await page.fill('input[type="number"]', '2');
    
    await page.click('button:has-text("Salva prodotto")');
    await page.waitForTimeout(1000);
    
    // Verifica che il prodotto mostri lo stato di compliance
    await expect(page.locator('text=Prodotto Compliance')).toBeVisible();
    await expect(page.locator('text=Compliant')).toBeVisible();
  });
});
