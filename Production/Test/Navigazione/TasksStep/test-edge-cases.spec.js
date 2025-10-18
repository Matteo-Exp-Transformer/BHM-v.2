// Production/Test/Navigazione/TasksStep/test-edge-cases.spec.js
import { test, expect } from '@playwright/test';

test.describe('TasksStep - Edge Cases', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/onboarding');
    await page.evaluate(() => window.setMockRole('admin'));
    await page.reload();
    await page.waitForTimeout(2000);
    
    await page.click('text=Attività e controlli HACCP');
    await page.waitForTimeout(1000);
  });

  test('Dovrebbe gestire stato loading durante operazioni', async ({ page }) => {
    await page.click('button:has-text("Aggiungi Attività")');
    
    // Verifica che ci sia un indicatore di loading (se presente)
    const loadingIndicator = page.locator('[data-testid="loading"], .loading, .spinner');
    if (await loadingIndicator.count() > 0) {
      await expect(loadingIndicator).toBeVisible();
    }
    
    // Compila e salva
    await page.fill('input[placeholder="Es: Pulizia cucina, Controllo fornelli..."]', 'Attività Loading');
    await page.selectOption('select', 'settimanale');
    await page.selectOption('select', 'dipendente');
    await page.selectOption('select', '1');
    await page.click('button:has-text("Conferma Attività")');
    
    // Attendi completamento
    await page.waitForTimeout(2000);
    await expect(page.locator('text=Attività Loading')).toBeVisible();
  });

  test('Dovrebbe gestire errori di rete', async ({ page }) => {
    // Simula offline
    await page.context().setOffline(true);
    
    await page.click('button:has-text("Aggiungi Attività")');
    await page.fill('input[placeholder="Es: Pulizia cucina, Controllo fornelli..."]', 'Attività Offline');
    await page.selectOption('select', 'settimanale');
    await page.selectOption('select', 'dipendente');
    await page.selectOption('select', '1');
    await page.click('button:has-text("Conferma Attività")');
    
    // Verifica gestione errore rete
    await expect(page.locator('text=Errore di connessione')).toBeVisible();
    
    // Ripristina connessione
    await page.context().setOffline(false);
  });

  test('Dovrebbe gestire molte attività generiche', async ({ page }) => {
    // Crea molte attività
    for (let i = 1; i <= 15; i++) {
      await page.click('button:has-text("Aggiungi Attività")');
      await page.waitForTimeout(500);
      
      await page.fill('input[placeholder="Es: Pulizia cucina, Controllo fornelli..."]', `Attività ${i}`);
      await page.selectOption('select', 'settimanale');
      await page.selectOption('select', 'dipendente');
      await page.selectOption('select', '1');
      
      await page.click('button:has-text("Conferma Attività")');
      await page.waitForTimeout(1000);
    }
    
    // Verifica che tutte le attività siano visibili
    await expect(page.locator('text=Attività 15')).toBeVisible();
    
    // Verifica che il form sia nascosto dopo aver raggiunto il limite
    await expect(page.locator('form')).not.toBeVisible();
  });

  test('Dovrebbe gestire eliminazione rapida di attività', async ({ page }) => {
    // Crea alcune attività
    for (let i = 1; i <= 5; i++) {
      await page.click('button:has-text("Aggiungi Attività")');
      await page.waitForTimeout(500);
      
      await page.fill('input[placeholder="Es: Pulizia cucina, Controllo fornelli..."]', `Attività ${i}`);
      await page.selectOption('select', 'settimanale');
      await page.selectOption('select', 'dipendente');
      await page.selectOption('select', '1');
      await page.click('button:has-text("Conferma Attività")');
      await page.waitForTimeout(1000);
    }
    
    // Elimina rapidamente tutte le attività
    const deleteButtons = page.locator('button[title="Elimina attività"]');
    const count = await deleteButtons.count();
    
    for (let i = 0; i < count; i++) {
      await deleteButtons.first().click();
      await page.waitForTimeout(200);
    }
    
    // Verifica che non ci siano più attività
    await expect(page.locator('text=Nessuna attività generica configurata')).toBeVisible();
  });

  test('Dovrebbe gestire modifica simultanea di attività', async ({ page }) => {
    // Crea due attività
    for (let i = 1; i <= 2; i++) {
      await page.click('button:has-text("Aggiungi Attività")');
      await page.waitForTimeout(500);
      
      await page.fill('input[placeholder="Es: Pulizia cucina, Controllo fornelli..."]', `Attività ${i}`);
      await page.selectOption('select', 'settimanale');
      await page.selectOption('select', 'dipendente');
      await page.selectOption('select', '1');
      await page.click('button:has-text("Conferma Attività")');
      await page.waitForTimeout(1000);
    }
    
    // Prova a modificare la prima attività
    await page.click('button[title="Modifica attività"]');
    await page.waitForTimeout(500);
    
    // Verifica che solo un form sia aperto
    const forms = page.locator('form');
    await expect(forms).toHaveCount(1);
    
    // Modifica il nome
    await page.fill('input[placeholder="Es: Pulizia cucina, Controllo fornelli..."]', 'Attività Modificata');
    await page.click('button:has-text("Conferma Attività")');
    await page.waitForTimeout(1000);
    
    // Verifica che il nome sia stato aggiornato
    await expect(page.locator('text=Attività Modificata')).toBeVisible();
  });

  test('Dovrebbe gestire frequenze personalizzate complesse', async ({ page }) => {
    await page.click('button:has-text("Aggiungi Attività")');
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder="Es: Pulizia cucina, Controllo fornelli..."]', 'Attività Complessa');
    await page.selectOption('select', 'custom');
    await page.selectOption('select', 'dipendente');
    await page.selectOption('select', '1');
    
    // Seleziona tutti i giorni della settimana
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    
    for (let i = 0; i < count; i++) {
      await checkboxes.nth(i).check();
    }
    
    await page.click('button:has-text("Conferma Attività")');
    await page.waitForTimeout(1000);
    
    await expect(page.locator('text=Attività Complessa')).toBeVisible();
  });

  test('Dovrebbe gestire cambio frequenza durante modifica', async ({ page }) => {
    // Crea attività con frequenza settimanale
    await page.click('button:has-text("Aggiungi Attività")');
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder="Es: Pulizia cucina, Controllo fornelli..."]', 'Attività Cambio Frequenza');
    await page.selectOption('select', 'settimanale');
    await page.selectOption('select', 'dipendente');
    await page.selectOption('select', '1');
    await page.click('button:has-text("Conferma Attività")');
    await page.waitForTimeout(1000);
    
    // Modifica l'attività
    await page.click('button[title="Modifica attività"]');
    await page.waitForTimeout(500);
    
    // Cambia frequenza da settimanale a custom
    await page.selectOption('select', 'custom');
    
    // Verifica che i giorni della settimana siano visibili
    await expect(page.locator('text=Lunedì')).toBeVisible();
    
    // Seleziona alcuni giorni
    await page.check('input[type="checkbox"]');
    await page.click('button:has-text("Conferma Attività")');
    await page.waitForTimeout(1000);
    
    // Verifica che la frequenza sia stata aggiornata
    await expect(page.locator('text=Attività Cambio Frequenza')).toBeVisible();
  });

  test('Dovrebbe gestire refresh della pagina durante modifica', async ({ page }) => {
    await page.click('button:has-text("Aggiungi Attività")');
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder="Es: Pulizia cucina, Controllo fornelli..."]', 'Attività Refresh');
    await page.selectOption('select', 'settimanale');
    await page.selectOption('select', 'dipendente');
    await page.selectOption('select', '1');
    
    // Refresh durante la compilazione
    await page.reload();
    await page.waitForTimeout(2000);
    
    await page.click('text=Attività e controlli HACCP');
    await page.waitForTimeout(1000);
    
    // Verifica che il form sia stato resettato
    await expect(page.locator('input[placeholder="Es: Pulizia cucina, Controllo fornelli..."]')).toHaveValue('');
  });

  test('Dovrebbe gestire navigazione tra step durante modifica', async ({ page }) => {
    await page.click('button:has-text("Aggiungi Attività")');
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder="Es: Pulizia cucina, Controllo fornelli..."]', 'Attività Navigazione');
    await page.selectOption('select', 'settimanale');
    await page.selectOption('select', 'dipendente');
    await page.selectOption('select', '1');
    
    // Naviga a un altro step
    await page.click('text=Gestione Inventario');
    await page.waitForTimeout(1000);
    
    // Torna allo step attività
    await page.click('text=Attività e controlli HACCP');
    await page.waitForTimeout(1000);
    
    // Verifica che il form sia stato chiuso
    await expect(page.locator('form')).not.toBeVisible();
  });

  test('Dovrebbe gestire validazione in tempo reale', async ({ page }) => {
    await page.click('button:has-text("Aggiungi Attività")');
    await page.waitForTimeout(500);
    
    // Test validazione nome in tempo reale
    await page.fill('input[placeholder="Es: Pulizia cucina, Controllo fornelli..."]', '');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Nome attività obbligatorio')).toBeVisible();
    
    // Correggi il nome
    await page.fill('input[placeholder="Es: Pulizia cucina, Controllo fornelli..."]', 'Attività Real-time');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Nome attività obbligatorio')).not.toBeVisible();
    
    // Compila resto del form
    await page.selectOption('select', 'settimanale');
    await page.selectOption('select', 'dipendente');
    await page.selectOption('select', '1');
    
    // Salva
    await page.click('button:has-text("Conferma Attività")');
    await page.waitForTimeout(1000);
    
    await expect(page.locator('text=Attività Real-time')).toBeVisible();
  });

  test('Dovrebbe gestire manutenzioni per diversi tipi di punti', async ({ page }) => {
    // Se ci sono punti di conservazione
    const conservationPoints = page.locator('text=Frigo A, text=Freezer A');
    
    if (await conservationPoints.count() > 0) {
      // Test per punto frigorifero/congelatore
      await page.click('button:has-text("Assegna manutenzioni")');
      await page.waitForTimeout(1000);
      
      // Verifica che tutte le 4 manutenzioni siano presenti
      await expect(page.locator('text=🌡️ Rilevamento Temperatura')).toBeVisible();
      await expect(page.locator('text=🧽 Sanificazione')).toBeVisible();
      await expect(page.locator('text=❄️ Sbrinamento')).toBeVisible();
      await expect(page.locator('text=📅 Controllo Scadenze')).toBeVisible();
      
      // Chiudi modal
      await page.click('button:has-text("✕")');
      await page.waitForTimeout(500);
      
      // Se ci sono punti ambiente, testa quelli
      const ambientPoints = page.locator('text=Ambiente');
      if (await ambientPoints.count() > 0) {
        await page.click('button:has-text("Assegna manutenzioni")');
        await page.waitForTimeout(1000);
        
        // Per punti ambiente, sbrinamento non dovrebbe essere presente
        await expect(page.locator('text=❄️ Sbrinamento')).not.toBeVisible();
        
        await page.click('button:has-text("✕")');
        await page.waitForTimeout(500);
      }
    }
  });

  test('Dovrebbe gestire assegnazione a categorie specifiche', async ({ page }) => {
    await page.click('button:has-text("Aggiungi Attività")');
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder="Es: Pulizia cucina, Controllo fornelli..."]', 'Attività Categoria');
    await page.selectOption('select', 'settimanale');
    await page.selectOption('select', 'dipendente');
    
    // Seleziona categoria specifica se disponibile
    const categorySelect = page.locator('select').nth(2);
    if (await categorySelect.count() > 0) {
      await categorySelect.selectOption('1');
    }
    
    await page.selectOption('select', '1'); // Reparto
    
    await page.click('button:has-text("Conferma Attività")');
    await page.waitForTimeout(1000);
    
    await expect(page.locator('text=Attività Categoria')).toBeVisible();
  });
});
