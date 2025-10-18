// Production/Test/Navigazione/TasksStep/test-validazione.spec.js
import { test, expect } from '@playwright/test';

test.describe('TasksStep - Test Validazione', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/onboarding');
    await page.evaluate(() => window.setMockRole('admin'));
    await page.reload();
    await page.waitForTimeout(2000);
    
    await page.click('text=Attività e controlli HACCP');
    await page.waitForTimeout(1000);
  });

  test('Dovrebbe accettare input validi per attività generica', async ({ page }) => {
    await page.click('button:has-text("Aggiungi Attività")');
    await page.waitForTimeout(500);
    
    // Compila form con dati validi
    await page.fill('input[placeholder="Es: Pulizia cucina, Controllo fornelli..."]', 'Attività Valida');
    await page.selectOption('select', 'settimanale');
    await page.selectOption('select', 'dipendente');
    await page.selectOption('select', '1'); // Primo reparto
    
    await page.click('button:has-text("Conferma Attività")');
    await page.waitForTimeout(1000);

    // Verifica successo
    await expect(page.locator('text=Attività Valida')).toBeVisible();
    await expect(page.locator('form')).not.toBeVisible();
  });

  test('Dovrebbe rifiutare nome attività vuoto', async ({ page }) => {
    await page.click('button:has-text("Aggiungi Attività")');
    await page.waitForTimeout(500);
    
    await page.selectOption('select', 'settimanale');
    await page.selectOption('select', 'dipendente');
    await page.selectOption('select', '1');
    
    await page.click('button:has-text("Conferma Attività")');
    
    await expect(page.locator('text=Nome attività obbligatorio')).toBeVisible();
  });

  test('Dovrebbe rifiutare nome attività troppo lungo', async ({ page }) => {
    const longName = 'A'.repeat(201);
    await page.click('button:has-text("Aggiungi Attività")');
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder="Es: Pulizia cucina, Controllo fornelli..."]', longName);
    await page.selectOption('select', 'settimanale');
    await page.selectOption('select', 'dipendente');
    await page.selectOption('select', '1');
    
    await page.click('button:has-text("Conferma Attività")');
    
    await expect(page.locator('text=Nome attività troppo lungo')).toBeVisible();
  });

  test('Dovrebbe rifiutare frequenza non selezionata', async ({ page }) => {
    await page.click('button:has-text("Aggiungi Attività")');
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder="Es: Pulizia cucina, Controllo fornelli..."]', 'Test Frequenza');
    await page.selectOption('select', 'dipendente');
    await page.selectOption('select', '1');
    
    await page.click('button:has-text("Conferma Attività")');
    
    await expect(page.locator('text=Frequenza obbligatoria')).toBeVisible();
  });

  test('Dovrebbe rifiutare ruolo non selezionato', async ({ page }) => {
    await page.click('button:has-text("Aggiungi Attività")');
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder="Es: Pulizia cucina, Controllo fornelli..."]', 'Test Ruolo');
    await page.selectOption('select', 'settimanale');
    await page.selectOption('select', '1');
    
    await page.click('button:has-text("Conferma Attività")');
    
    await expect(page.locator('text=Ruolo obbligatorio')).toBeVisible();
  });

  test('Dovrebbe rifiutare reparto non selezionato', async ({ page }) => {
    await page.click('button:has-text("Aggiungi Attività")');
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder="Es: Pulizia cucina, Controllo fornelli..."]', 'Test Reparto');
    await page.selectOption('select', 'settimanale');
    await page.selectOption('select', 'dipendente');
    
    await page.click('button:has-text("Conferma Attività")');
    
    await expect(page.locator('text=Reparto obbligatorio')).toBeVisible();
  });

  test('Dovrebbe rifiutare frequenza custom senza giorni selezionati', async ({ page }) => {
    await page.click('button:has-text("Aggiungi Attività")');
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder="Es: Pulizia cucina, Controllo fornelli..."]', 'Test Custom');
    await page.selectOption('select', 'custom');
    await page.selectOption('select', 'dipendente');
    await page.selectOption('select', '1');
    
    await page.click('button:has-text("Conferma Attività")');
    
    await expect(page.locator('text=Seleziona almeno un giorno per frequenza custom')).toBeVisible();
  });

  test('Dovrebbe gestire caratteri speciali nel nome attività', async ({ page }) => {
    const specialChars = ['<script>', "'; DROP TABLE--", '../../etc/passwd'];
    
    for (const char of specialChars) {
      await page.click('button:has-text("Aggiungi Attività")');
      await page.waitForTimeout(500);
      
      await page.fill('input[placeholder="Es: Pulizia cucina, Controllo fornelli..."]', char);
      await page.selectOption('select', 'settimanale');
      await page.selectOption('select', 'dipendente');
      await page.selectOption('select', '1');
      
      await page.click('button:has-text("Conferma Attività")');
      
      // Verifica che i caratteri speciali siano gestiti correttamente
      await expect(page.locator('text=Nome contiene caratteri non validi')).toBeVisible();
      
      // Reset per test successivo
      await page.click('button:has-text("Annulla")');
    }
  });

  test('Dovrebbe gestire Unicode nel nome attività', async ({ page }) => {
    await page.click('button:has-text("Aggiungi Attività")');
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder="Es: Pulizia cucina, Controllo fornelli..."]', '🎉 Attività Test 日本語');
    await page.selectOption('select', 'settimanale');
    await page.selectOption('select', 'dipendente');
    await page.selectOption('select', '1');
    
    await page.click('button:has-text("Conferma Attività")');
    await page.waitForTimeout(1000);

    // Verifica che Unicode sia accettato
    await expect(page.locator('text=🎉 Attività Test 日本語')).toBeVisible();
  });

  test('Dovrebbe validare manutenzioni per punti di conservazione', async ({ page }) => {
    // Se ci sono punti di conservazione
    const conservationPoints = page.locator('text=Frigo A, text=Freezer A');
    
    if (await conservationPoints.count() > 0) {
      await page.click('button:has-text("Assegna manutenzioni")');
      await page.waitForTimeout(1000);
      
      // Verifica che tutte le manutenzioni richieste siano presenti
      await expect(page.locator('text=🌡️ Rilevamento Temperatura')).toBeVisible();
      await expect(page.locator('text=🧽 Sanificazione')).toBeVisible();
      await expect(page.locator('text=❄️ Sbrinamento')).toBeVisible();
      await expect(page.locator('text=📅 Controllo Scadenze')).toBeVisible();
      
      // Verifica che i campi obbligatori siano presenti
      await expect(page.locator('select')).toHaveCount(4); // Frequenza, Ruolo, Categoria, Dipendente
      
      // Chiudi il modal
      await page.click('button:has-text("✕")');
      await page.waitForTimeout(500);
    }
  });

  test('Dovrebbe validare frequenze disponibili', async ({ page }) => {
    await page.click('button:has-text("Aggiungi Attività")');
    await page.waitForTimeout(500);
    
    // Verifica che tutte le frequenze siano disponibili
    const frequencySelect = page.locator('select').first();
    await frequencySelect.click();
    
    await expect(page.locator('option:has-text("Annuale")')).toBeVisible();
    await expect(page.locator('option:has-text("Mensile")')).toBeVisible();
    await expect(page.locator('option:has-text("Settimanale")')).toBeVisible();
    await expect(page.locator('option:has-text("Giornaliera")')).toBeVisible();
    await expect(page.locator('option:has-text("Personalizzata")')).toBeVisible();
  });

  test('Dovrebbe validare ruoli disponibili', async ({ page }) => {
    await page.click('button:has-text("Aggiungi Attività")');
    await page.waitForTimeout(500);
    
    // Verifica che tutti i ruoli siano disponibili
    const roleSelect = page.locator('select').nth(1);
    await roleSelect.click();
    
    await expect(page.locator('option:has-text("Amministratore")')).toBeVisible();
    await expect(page.locator('option:has-text("Responsabile")')).toBeVisible();
    await expect(page.locator('option:has-text("Dipendente")')).toBeVisible();
    await expect(page.locator('option:has-text("Collaboratore")')).toBeVisible();
  });

  test('Dovrebbe validare note attività', async ({ page }) => {
    await page.click('button:has-text("Aggiungi Attività")');
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder="Es: Pulizia cucina, Controllo fornelli..."]', 'Attività con Note');
    await page.selectOption('select', 'settimanale');
    await page.selectOption('select', 'dipendente');
    await page.selectOption('select', '1');
    
    // Aggiungi note
    await page.fill('textarea[placeholder="Note aggiuntive..."]', 'Note di test per l\'attività');
    
    await page.click('button:has-text("Conferma Attività")');
    await page.waitForTimeout(1000);
    
    // Verifica che le note siano state salvate
    await expect(page.locator('text=Attività con Note')).toBeVisible();
    await expect(page.locator('text=Note di test per l\'attività')).toBeVisible();
  });

  test('Dovrebbe validare lunghezza note', async ({ page }) => {
    await page.click('button:has-text("Aggiungi Attività")');
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder="Es: Pulizia cucina, Controllo fornelli..."]', 'Attività Note Lunghe');
    await page.selectOption('select', 'settimanale');
    await page.selectOption('select', 'dipendente');
    await page.selectOption('select', '1');
    
    // Note troppo lunghe
    const longNotes = 'A'.repeat(1001);
    await page.fill('textarea[placeholder="Note aggiuntive..."]', longNotes);
    
    await page.click('button:has-text("Conferma Attività")');
    
    await expect(page.locator('text=Note troppo lunghe')).toBeVisible();
  });
});
