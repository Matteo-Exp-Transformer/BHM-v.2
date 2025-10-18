// Production/Test/Navigazione/TasksStep/test-funzionale.spec.js
import { test, expect } from '@playwright/test';

test.describe('TasksStep - Test Funzionali', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/onboarding');
    await page.evaluate(() => window.setMockRole('admin'));
    await page.reload();
    await page.waitForTimeout(2000);
    
    await page.click('text=Attività e controlli HACCP');
    await page.waitForTimeout(1000);
  });

  test('Dovrebbe renderizzare correttamente il componente', async ({ page }) => {
    // Verifica elementi principali
    await expect(page.locator('h2:has-text("Attività e controlli HACCP")')).toBeVisible();
    await expect(page.locator('text=Definisci le attività periodiche per garantire la conformità')).toBeVisible();
    
    // Verifica sezioni principali
    await expect(page.locator('h3:has-text("🔧 Manutenzioni Punti di Conservazione")')).toBeVisible();
    await expect(page.locator('h3:has-text("👥 Attività/Mansioni Generiche")')).toBeVisible();
    
    // Verifica bottoni principali
    await expect(page.locator('button:has-text("Aggiungi Attività")')).toBeVisible();
  });

  test('Dovrebbe gestire l\'assegnazione manutenzioni ai punti di conservazione', async ({ page }) => {
    // Verifica che ci siano punti di conservazione (dovrebbero essere stati creati negli step precedenti)
    const conservationPoints = page.locator('text=Frigo A, text=Freezer A');
    
    if (await conservationPoints.count() > 0) {
      // Click su "Assegna manutenzioni" per il primo punto
      await page.click('button:has-text("Assegna manutenzioni")');
      await page.waitForTimeout(1000);
      
      // Verifica che il modal sia aperto
      await expect(page.locator('h3:has-text("Assegna Manutenzioni")')).toBeVisible();
      
      // Verifica che le manutenzioni richieste siano visibili
      await expect(page.locator('text=🌡️ Rilevamento Temperatura')).toBeVisible();
      await expect(page.locator('text=🧽 Sanificazione')).toBeVisible();
      await expect(page.locator('text=❄️ Sbrinamento')).toBeVisible();
      await expect(page.locator('text=📅 Controllo Scadenze')).toBeVisible();
      
      // Chiudi il modal
      await page.click('button:has-text("✕")');
      await page.waitForTimeout(500);
    } else {
      // Se non ci sono punti di conservazione, verifica il messaggio
      await expect(page.locator('text=Nessun punto di conservazione configurato')).toBeVisible();
    }
  });

  test('Dovrebbe gestire la creazione di attività generiche', async ({ page }) => {
    // Click su "Aggiungi Attività"
    await page.click('button:has-text("Aggiungi Attività")');
    await page.waitForTimeout(500);
    
    // Verifica che il form sia visibile
    await expect(page.locator('h4:has-text("Nuova Attività Generica")')).toBeVisible();
    
    // Compila form attività
    await page.fill('input[placeholder="Es: Pulizia cucina, Controllo fornelli..."]', 'Pulizia Cucina');
    await page.selectOption('select', 'settimanale');
    await page.selectOption('select', 'dipendente');
    await page.selectOption('select', '1'); // Primo reparto
    
    // Salva attività
    await page.click('button:has-text("Conferma Attività")');
    await page.waitForTimeout(1000);
    
    // Verifica che l'attività sia stata creata
    await expect(page.locator('text=Pulizia Cucina')).toBeVisible();
    await expect(page.locator('text=🔄 Settimanale')).toBeVisible();
    await expect(page.locator('text=👤 dipendente')).toBeVisible();
  });

  test('Dovrebbe gestire la modifica di attività generiche', async ({ page }) => {
    // Prima crea un'attività
    await page.click('button:has-text("Aggiungi Attività")');
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder="Es: Pulizia cucina, Controllo fornelli..."]', 'Attività da Modificare');
    await page.selectOption('select', 'giornaliera');
    await page.selectOption('select', 'responsabile');
    await page.selectOption('select', '1');
    await page.click('button:has-text("Conferma Attività")');
    await page.waitForTimeout(1000);
    
    // Modifica l'attività
    await page.click('button[title="Modifica attività"]');
    await page.waitForTimeout(500);
    
    // Verifica che il form sia aperto in modalità modifica
    await expect(page.locator('h4:has-text("Modifica: Attività da Modificare")')).toBeVisible();
    
    // Modifica il nome
    await page.fill('input[placeholder="Es: Pulizia cucina, Controllo fornelli..."]', 'Attività Modificata');
    await page.click('button:has-text("Conferma Attività")');
    await page.waitForTimeout(1000);
    
    // Verifica che il nome sia stato aggiornato
    await expect(page.locator('text=Attività Modificata')).toBeVisible();
  });

  test('Dovrebbe gestire l\'eliminazione di attività generiche', async ({ page }) => {
    // Prima crea un'attività
    await page.click('button:has-text("Aggiungi Attività")');
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder="Es: Pulizia cucina, Controllo fornelli..."]', 'Attività da Eliminare');
    await page.selectOption('select', 'mensile');
    await page.selectOption('select', 'collaboratore');
    await page.selectOption('select', '1');
    await page.click('button:has-text("Conferma Attività")');
    await page.waitForTimeout(1000);
    
    // Elimina l'attività
    await page.click('button[title="Elimina attività"]');
    await page.waitForTimeout(500);
    
    // Verifica che l'attività sia stata eliminata
    await expect(page.locator('text=Attività da Eliminare')).not.toBeVisible();
  });

  test('Dovrebbe gestire la selezione di frequenza personalizzata', async ({ page }) => {
    await page.click('button:has-text("Aggiungi Attività")');
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder="Es: Pulizia cucina, Controllo fornelli..."]', 'Attività Personalizzata');
    await page.selectOption('select', 'custom');
    await page.selectOption('select', 'dipendente');
    await page.selectOption('select', '1');
    
    // Verifica che i giorni della settimana siano visibili
    await expect(page.locator('text=Lunedì')).toBeVisible();
    await expect(page.locator('text=Martedì')).toBeVisible();
    await expect(page.locator('text=Mercoledì')).toBeVisible();
    
    // Seleziona alcuni giorni
    await page.check('input[type="checkbox"]');
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("Conferma Attività")');
    await page.waitForTimeout(1000);
    
    await expect(page.locator('text=Attività Personalizzata')).toBeVisible();
  });

  test('Dovrebbe gestire l\'assegnazione a dipendente specifico', async ({ page }) => {
    await page.click('button:has-text("Aggiungi Attività")');
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder="Es: Pulizia cucina, Controllo fornelli..."]', 'Attività Specifica');
    await page.selectOption('select', 'settimanale');
    await page.selectOption('select', 'dipendente');
    await page.selectOption('select', '1');
    
    // Seleziona dipendente specifico se disponibile
    const specificEmployeeSelect = page.locator('select').nth(3);
    if (await specificEmployeeSelect.count() > 0) {
      await specificEmployeeSelect.selectOption('1');
    }
    
    await page.click('button:has-text("Conferma Attività")');
    await page.waitForTimeout(1000);
    
    await expect(page.locator('text=Attività Specifica')).toBeVisible();
  });

  test('Dovrebbe gestire la validazione dei campi obbligatori', async ({ page }) => {
    await page.click('button:has-text("Aggiungi Attività")');
    await page.waitForTimeout(500);
    
    // Prova a salvare senza compilare i campi
    await page.click('button:has-text("Conferma Attività")');
    
    // Verifica errori di validazione
    await expect(page.locator('text=Nome attività obbligatorio')).toBeVisible();
    await expect(page.locator('text=Frequenza obbligatoria')).toBeVisible();
    await expect(page.locator('text=Ruolo obbligatorio')).toBeVisible();
  });

  test('Dovrebbe gestire l\'accessibilità corretta', async ({ page }) => {
    // Verifica attributi ARIA
    const nameInput = page.locator('input[placeholder="Es: Pulizia cucina, Controllo fornelli..."]');
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

  test('Dovrebbe gestire la visualizzazione dello stato di completamento', async ({ page }) => {
    // Verifica che lo stato di completamento sia mostrato
    const completionStatus = page.locator('text=Completato, text=Incompleto');
    
    if (await completionStatus.count() > 0) {
      await expect(completionStatus.first()).toBeVisible();
    }
    
    // Verifica che le attività generiche siano mostrate
    await expect(page.locator('text=Attività Configurate')).toBeVisible();
  });

  test('Dovrebbe gestire la configurazione di manutenzioni per punti ambiente', async ({ page }) => {
    // Se ci sono punti di conservazione di tipo ambiente
    const ambientPoints = page.locator('text=Ambiente');
    
    if (await ambientPoints.count() > 0) {
      // Click su "Assegna manutenzioni" per punto ambiente
      await page.click('button:has-text("Assegna manutenzioni")');
      await page.waitForTimeout(1000);
      
      // Verifica che per i punti ambiente non ci sia sbrinamento
      await expect(page.locator('text=❄️ Sbrinamento')).not.toBeVisible();
      
      // Verifica che ci siano solo sanificazione e controllo scadenze
      await expect(page.locator('text=🧽 Sanificazione')).toBeVisible();
      await expect(page.locator('text=📅 Controllo Scadenze')).toBeVisible();
      
      // Chiudi il modal
      await page.click('button:has-text("✕")');
      await page.waitForTimeout(500);
    }
  });
});
