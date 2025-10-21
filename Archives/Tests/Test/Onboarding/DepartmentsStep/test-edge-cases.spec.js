// Production/Test/Onboarding/DepartmentsStep/test-edge-cases.spec.js
import { test, expect } from '@playwright/test';

test.describe('DepartmentsStep - Edge Cases', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForSelector('h2:has-text("Configurazione Reparti")');
  });

  test('Dovrebbe gestire molti reparti', async ({ page }) => {
    const departments = [
      'Cucina', 'Sala', 'Bancone', 'Magazzino', 'Lavaggio',
      'Deoor', 'Plonge', 'Office', 'Reception', 'Terrazza'
    ];
    
    for (const dept of departments) {
      await page.fill('input[placeholder="es. Cucina, Sala, Bancone..."]', dept);
      await page.fill('input[placeholder="Descrizione del reparto..."]', `Descrizione ${dept}`);
      await page.click('button:has-text("Aggiungi")');
      
      // Verifica che sia stato aggiunto
      await expect(page.locator(`text=${dept}`)).toBeVisible();
    }
    
    // Verifica conteggio finale
    await expect(page.locator('text=Reparti Configurati (10)')).toBeVisible();
  });

  test('Dovrebbe gestire input rapidi e multipli', async ({ page }) => {
    // Simula input rapido
    const nameInput = page.locator('input[placeholder="es. Cucina, Sala, Bancone..."]');
    
    // Input molto rapido
    await nameInput.type('Cucina', { delay: 10 });
    await nameInput.clear();
    await nameInput.type('Sala', { delay: 10 });
    
    await expect(nameInput).toHaveValue('Sala');
    
    // Test cambio rapido tra campi
    await page.fill('input[placeholder="es. Cucina, Sala, Bancone..."]', 'Test');
    await page.fill('input[placeholder="Descrizione del reparto..."]', 'Descrizione test');
    await page.click('button:has-text("Aggiungi")');
    
    // Verifica che il reparto sia stato aggiunto
    await expect(page.locator('text=Test')).toBeVisible();
  });

  test('Dovrebbe gestire copy-paste', async ({ page }) => {
    // Test copia-incolla
    const nameInput = page.locator('input[placeholder="es. Cucina, Sala, Bancone..."]');
    
    // Simula paste
    await nameInput.fill('Reparto Copiato');
    await expect(nameInput).toHaveValue('Reparto Copiato');
    
    // Test paste con contenuto lungo
    const longText = 'Reparto con nome molto lungo che potrebbe causare problemi di layout o validazione';
    await nameInput.fill(longText);
    await expect(nameInput).toHaveValue(longText);
  });

  test('Dovrebbe gestire interruzioni utente', async ({ page }) => {
    // Test interruzione durante digitazione
    const nameInput = page.locator('input[placeholder="es. Cucina, Sala, Bancone..."]');
    
    // Inizia a digitare
    await nameInput.type('Cuc', { delay: 100 });
    
    // Interrompi e cambia campo
    await page.fill('input[placeholder="Descrizione del reparto..."]', 'Descrizione test');
    
    // Torna al nome e completa
    await nameInput.click();
    await nameInput.type('ina');
    
    await expect(nameInput).toHaveValue('Cucina');
  });

  test('Dovrebbe gestire reset form dopo prefill', async ({ page }) => {
    // Usa prefill
    await page.click('button:has-text("🚀 Carica reparti predefiniti")');
    
    // Verifica che i reparti siano stati aggiunti
    await expect(page.locator('text=Reparti Configurati (7)')).toBeVisible();
    
    // Prova ad aggiungere nuovo reparto
    await page.click('button:has-text("Aggiungi Nuovo Reparto")');
    await page.fill('input[placeholder="es. Cucina, Sala, Bancone..."]', 'Nuovo Reparto');
    await page.fill('input[placeholder="Descrizione del reparto..."]', 'Descrizione nuovo');
    await page.click('button:has-text("Aggiungi")');
    
    // Verifica che sia stato aggiunto
    await expect(page.locator('text=Nuovo Reparto')).toBeVisible();
    await expect(page.locator('text=Reparti Configurati (8)')).toBeVisible();
  });

  test('Dovrebbe gestire navigazione con tab', async ({ page }) => {
    // Test navigazione completa con Tab
    const fields = [
      'input[placeholder="es. Cucina, Sala, Bancone..."]',
      'input[placeholder="Descrizione del reparto..."]',
      'input[type="checkbox"]',
      'button:has-text("Aggiungi")'
    ];
    
    // Testa navigazione con Tab
    for (let i = 0; i < fields.length - 1; i++) { // Escludi button dall'ultimo tab
      await page.keyboard.press('Tab');
      await expect(page.locator(fields[i])).toBeFocused();
    }
  });

  test('Dovrebbe gestire escape e annullamento', async ({ page }) => {
    // Compila parzialmente
    await page.fill('input[placeholder="es. Cucina, Sala, Bancone..."]', 'Reparto Parziale');
    
    // Premi Escape
    await page.keyboard.press('Escape');
    
    // Verifica che il valore sia ancora presente
    await expect(page.locator('input[placeholder="es. Cucina, Sala, Bancone..."]')).toHaveValue('Reparto Parziale');
  });

  test('Dovrebbe gestire modifica rapida', async ({ page }) => {
    // Aggiungi reparto
    await page.fill('input[placeholder="es. Cucina, Sala, Bancone..."]', 'Cucina');
    await page.fill('input[placeholder="Descrizione del reparto..."]', 'Descrizione originale');
    await page.click('button:has-text("Aggiungi")');
    
    // Modifica rapida
    await page.click('button[title="Modifica reparto"]');
    await page.fill('input[placeholder="es. Cucina, Sala, Bancone..."]', 'Cucina Principale');
    await page.click('button:has-text("Aggiorna")');
    
    // Verifica che le modifiche siano state salvate
    await expect(page.locator('text=Cucina Principale')).toBeVisible();
  });

  test('Dovrebbe gestire eliminazione rapida', async ({ page }) => {
    // Aggiungi più reparti
    for (const dept of ['Cucina', 'Sala', 'Bancone']) {
      await page.fill('input[placeholder="es. Cucina, Sala, Bancone..."]', dept);
      await page.fill('input[placeholder="Descrizione del reparto..."]', `Descrizione ${dept}`);
      await page.click('button:has-text("Aggiungi")');
    }
    
    // Verifica che siano presenti
    await expect(page.locator('text=Reparti Configurati (3)')).toBeVisible();
    
    // Elimina tutti rapidamente
    await page.click('button[title="Elimina reparto"]', { position: { x: 1, y: 1 } }); // Prima eliminazione
    await expect(page.locator('text=Reparti Configurati (2)')).toBeVisible();
    
    await page.click('button[title="Elimina reparto"]', { position: { x: 1, y: 1 } }); // Seconda eliminazione
    await expect(page.locator('text=Reparti Configurati (1)')).toBeVisible();
    
    await page.click('button[title="Elimina reparto"]'); // Terza eliminazione
    await expect(page.locator('text=Reparti Configurati (0)')).toBeVisible();
  });

  test('Dovrebbe gestire toggle attivo/inattivo', async ({ page }) => {
    // Aggiungi reparto attivo
    await page.fill('input[placeholder="es. Cucina, Sala, Bancone..."]', 'Reparto Test');
    await page.fill('input[placeholder="Descrizione del reparto..."]', 'Descrizione test');
    await page.click('button:has-text("Aggiungi")');
    
    // Verifica che sia attivo
    await expect(page.locator('text=Attivo')).toBeVisible();
    
    // Modifica e disattiva
    await page.click('button[title="Modifica reparto"]');
    await page.uncheck('input[type="checkbox"]');
    await page.click('button:has-text("Aggiorna")');
    
    // Verifica che sia inattivo
    await expect(page.locator('text=Inattivo')).toBeVisible();
    
    // Riattiva
    await page.click('button[title="Modifica reparto"]');
    await page.check('input[type="checkbox"]');
    await page.click('button:has-text("Aggiorna")');
    
    // Verifica che sia attivo
    await expect(page.locator('text=Attivo')).toBeVisible();
  });

  test('Dovrebbe gestire input con caratteri HTML', async ({ page }) => {
    const htmlInputs = [
      '<div>Cucina</div>',
      '&lt;script&gt;alert("test")&lt;/script&gt;',
      'Reparto&amp;Sala',
      'Area&lt;Principale&gt;'
    ];
    
    for (const input of htmlInputs) {
      await page.reload();
      await page.waitForSelector('h2:has-text("Configurazione Reparti")');
      
      await page.fill('input[placeholder="es. Cucina, Sala, Bancone..."]', input);
      await page.fill('input[placeholder="Descrizione del reparto..."]', 'Descrizione test');
      await page.click('button:has-text("Aggiungi")');
      
      // Verifica che sia stato aggiunto
      await expect(page.locator(`text=${input}`)).toBeVisible();
    }
  });

  test('Dovrebbe gestire stress test con molti click', async ({ page }) => {
    // Test stress con molti click rapidi
    const addButton = page.locator('button:has-text("Aggiungi")');
    
    // Click multipli rapidi (dovrebbe aggiungere solo un reparto)
    await page.fill('input[placeholder="es. Cucina, Sala, Bancone..."]', 'Cucina');
    await page.fill('input[placeholder="Descrizione del reparto..."]', 'Descrizione');
    
    for (let i = 0; i < 5; i++) {
      await addButton.click();
    }
    
    // Verifica che sia stato aggiunto solo un reparto
    await expect(page.locator('text=Reparti Configurati (1)')).toBeVisible();
    await expect(page.locator('text=Cucina')).toBeVisible();
  });

  test('Dovrebbe gestire modifica con dati identici', async ({ page }) => {
    // Aggiungi reparto
    await page.fill('input[placeholder="es. Cucina, Sala, Bancone..."]', 'Cucina');
    await page.fill('input[placeholder="Descrizione del reparto..."]', 'Descrizione originale');
    await page.click('button:has-text("Aggiungi")');
    
    // Modifica con stessi dati
    await page.click('button[title="Modifica reparto"]');
    await page.click('button:has-text("Aggiorna")'); // Senza cambiare nulla
    
    // Verifica che non ci siano errori
    await expect(page.locator('text=Cucina')).toBeVisible();
    await expect(page.locator('text=Descrizione originale')).toBeVisible();
  });
});

