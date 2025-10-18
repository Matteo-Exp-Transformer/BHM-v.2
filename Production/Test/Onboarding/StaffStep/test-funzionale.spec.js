// Production/Test/Onboarding/StaffStep/test-funzionale.spec.js
import { test, expect } from '@playwright/test';

test.describe('StaffStep - Test Funzionali', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/onboarding');
    // Naviga al step staff (assumendo che sia dopo departments)
    await page.waitForSelector('h2:has-text("Gestione del Personale")');
  });

  test('Dovrebbe renderizzare correttamente', async ({ page }) => {
    // Verifica header
    await expect(page.locator('h2:has-text("Gestione del Personale")')).toBeVisible();
    
    // Verifica form di aggiunta (dovrebbe essere visibile se non ci sono membri)
    await expect(page.locator('h3:has-text("👤 Primo Membro: Amministratore (Tu)")')).toBeVisible();
    
    // Verifica campi form
    await expect(page.locator('input[placeholder="Mario"]')).toBeVisible(); // Nome
    await expect(page.locator('input[placeholder="Rossi"]')).toBeVisible(); // Cognome
    await expect(page.locator('input[placeholder="email@azienda.it"]')).toBeVisible(); // Email
    await expect(page.locator('input[placeholder="+39 340 1234567"]')).toBeVisible(); // Telefono
    await expect(page.locator('input[type="date"]')).toBeVisible(); // Scadenza HACCP
    
    // Verifica pulsante submit
    await expect(page.locator('button:has-text("Aggiungi membro")')).toBeVisible();
  });

  test('Dovrebbe precompilare email per primo membro', async ({ page }) => {
    // Verifica che l'email sia precompilata e disabilitata
    const emailInput = page.locator('input[placeholder="email@azienda.it"]');
    await expect(emailInput).toBeDisabled();
    await expect(emailInput).toHaveAttribute('readonly');
    
    // Verifica che ci sia il messaggio esplicativo
    await expect(page.locator('text=🔒 Email precompilata dall\'account con cui hai effettuato il login')).toBeVisible();
  });

  test('Dovrebbe bloccare ruolo per primo membro', async ({ page }) => {
    // Verifica che il ruolo sia fisso per il primo membro
    const roleInput = page.locator('input[value="Amministratore"]');
    await expect(roleInput).toBeVisible();
    await expect(roleInput).toBeDisabled();
    
    // Verifica messaggio esplicativo
    await expect(page.locator('text=🔒 Il primo membro è sempre Amministratore')).toBeVisible();
  });

  test('Dovrebbe aggiungere primo membro', async ({ page }) => {
    // Compila form primo membro
    await page.fill('input[placeholder="Mario"]', 'Mario');
    await page.fill('input[placeholder="Rossi"]', 'Rossi');
    await page.fill('input[placeholder="+39 340 1234567"]', '+39 340 1234567');
    await page.fill('input[type="date"]', '2025-12-31');
    
    // Submit
    await page.click('button:has-text("Aggiungi membro")');
    
    // Verifica che il membro sia stato aggiunto
    await expect(page.locator('text=Mario Rossi')).toBeVisible();
    await expect(page.locator('text=Amministratore')).toBeVisible();
    await expect(page.locator('text=👤 Tu (Admin)')).toBeVisible();
    
    // Verifica che appaia il pulsante per aggiungere nuovo membro
    await expect(page.locator('button:has-text("Aggiungi Nuovo Membro")')).toBeVisible();
  });

  test('Dovrebbe aggiungere secondo membro', async ({ page }) => {
    // Prima aggiungi primo membro
    await page.fill('input[placeholder="Mario"]', 'Mario');
    await page.fill('input[placeholder="Rossi"]', 'Rossi');
    await page.fill('input[placeholder="+39 340 1234567"]', '+39 340 1234567');
    await page.fill('input[type="date"]', '2025-12-31');
    await page.click('button:has-text("Aggiungi membro")');
    
    // Click per aggiungere nuovo membro
    await page.click('button:has-text("Aggiungi Nuovo Membro")');
    
    // Verifica che il form sia cambiato
    await expect(page.locator('h3:has-text("Aggiungi nuovo membro")')).toBeVisible();
    
    // Compila secondo membro
    await page.fill('input[placeholder="Mario"]', 'Giulia');
    await page.fill('input[placeholder="Rossi"]', 'Bianchi');
    await page.fill('input[placeholder="email@azienda.it"]', 'giulia@test.it');
    await page.fill('input[placeholder="+39 340 1234567"]', '+39 340 7654321');
    await page.fill('input[type="date"]', '2025-06-30');
    
    // Submit
    await page.click('button:has-text("Aggiungi membro")');
    
    // Verifica che entrambi i membri siano presenti
    await expect(page.locator('text=Mario Rossi')).toBeVisible();
    await expect(page.locator('text=Giulia Bianchi')).toBeVisible();
  });

  test('Dovrebbe modificare membro esistente', async ({ page }) => {
    // Aggiungi primo membro
    await page.fill('input[placeholder="Mario"]', 'Mario');
    await page.fill('input[placeholder="Rossi"]', 'Rossi');
    await page.fill('input[placeholder="+39 340 1234567"]', '+39 340 1234567');
    await page.fill('input[type="date"]', '2025-12-31');
    await page.click('button:has-text("Aggiungi membro")');
    
    // Click modifica
    await page.click('button[aria-label="Modifica membro"]');
    
    // Verifica che il form sia stato popolato
    await expect(page.locator('input[placeholder="Mario"]')).toHaveValue('Mario');
    await expect(page.locator('input[placeholder="Rossi"]')).toHaveValue('Rossi');
    await expect(page.locator('h3:has-text("Modifica membro dello staff")')).toBeVisible();
    await expect(page.locator('button:has-text("Salva modifiche")')).toBeVisible();
    
    // Modifica i dati
    await page.fill('input[placeholder="Mario"]', 'Mario Modificato');
    await page.fill('input[placeholder="Rossi"]', 'Rossi Modificato');
    
    // Click salva
    await page.click('button:has-text("Salva modifiche")');
    
    // Verifica che le modifiche siano state salvate
    await expect(page.locator('text=Mario Modificato Rossi Modificato')).toBeVisible();
  });

  test('Dovrebbe eliminare membro (non primo)', async ({ page }) => {
    // Aggiungi primo membro
    await page.fill('input[placeholder="Mario"]', 'Mario');
    await page.fill('input[placeholder="Rossi"]', 'Rossi');
    await page.fill('input[placeholder="+39 340 1234567"]', '+39 340 1234567');
    await page.fill('input[type="date"]', '2025-12-31');
    await page.click('button:has-text("Aggiungi membro")');
    
    // Aggiungi secondo membro
    await page.click('button:has-text("Aggiungi Nuovo Membro")');
    await page.fill('input[placeholder="Mario"]', 'Giulia');
    await page.fill('input[placeholder="Rossi"]', 'Bianchi');
    await page.fill('input[placeholder="email@azienda.it"]', 'giulia@test.it');
    await page.fill('input[placeholder="+39 340 1234567"]', '+39 340 7654321');
    await page.fill('input[type="date"]', '2025-06-30');
    await page.click('button:has-text("Aggiungi membro")');
    
    // Verifica che entrambi siano presenti
    await expect(page.locator('text=Mario Rossi')).toBeVisible();
    await expect(page.locator('text=Giulia Bianchi')).toBeVisible();
    
    // Elimina secondo membro (non primo)
    await page.click('button[aria-label="Elimina membro"]');
    
    // Verifica che solo il primo membro sia rimasto
    await expect(page.locator('text=Mario Rossi')).toBeVisible();
    await expect(page.locator('text=Giulia Bianchi')).not.toBeVisible();
  });

  test('Dovrebbe bloccare eliminazione primo membro', async ({ page }) => {
    // Aggiungi primo membro
    await page.fill('input[placeholder="Mario"]', 'Mario');
    await page.fill('input[placeholder="string"]', 'Rossi');
    await page.fill('input[placeholder="+39 340 1234567"]', '+39 340 1234567');
    await page.fill('input[type="date"]', '2025-12-31');
    await page.click('button:has-text("Aggiungi membro")');
    
    // Verifica che il primo membro abbia il badge "Non eliminabile"
    await expect(page.locator('text=Non eliminabile')).toBeVisible();
    
    // Verifica che non ci sia il pulsante elimina per il primo membro
    await expect(page.locator('button[aria-label="Elimina membro"]')).not.toBeVisible();
  });

  test('Dovrebbe gestire categorie staff', async ({ page }) => {
    // Aggiungi primo membro
    await page.fill('input[placeholder="Mario"]', 'Mario');
    await page.fill('input[placeholder="Rossi"]', 'Rossi');
    await page.fill('input[placeholder="+39 340 1234567"]', '+39 340 1234567');
    await page.fill('input[type="date"]', '2025-12-31');
    await page.click('button:has-text("Aggiungi membro")');
    
    // Aggiungi secondo membro per testare categorie
    await page.click('button:has-text("Aggiungi Nuovo Membro")');
    await page.fill('input[placeholder="Mario"]', 'Giulia');
    await page.fill('input[placeholder="Rossi"]', 'Bianchi');
    await page.fill('input[placeholder="email@azienda.it"]', 'giulia@test.it');
    
    // Testa selezione categoria
    await page.click('button:has-text("Aggiungi categoria")');
    await expect(page.locator('select').first()).toBeVisible();
    
    // Submit
    await page.fill('input[type="date"]', '2025-06-30');
    await page.click('button:has-text("Aggiungi membro")');
    
    // Verifica che il membro sia stato aggiunto
    await expect(page.locator('text=Giulia Bianchi')).toBeVisible();
  });

  test('Dovrebbe gestire assegnazione reparti', async ({ page }) => {
    // Aggiungi primo membro
    await page.fill('input[placeholder="Mario"]', 'Mario');
    await page.fill('input[placeholder="Rossi"]', 'Rossi');
    await page.fill('input[placeholder="+39 340 1234567"]', '+39 340 1234567');
    await page.fill('input[type="date"]', '2025-12-31');
    await page.click('button:has-text("Aggiungi membro")');
    
    // Aggiungi secondo membro
    await page.click('button:has-text("Aggiungi Nuovo Membro")');
    await page.fill('input[placeholder="Mario"]', 'Giulia');
    await page.fill('input[placeholder="Rossi"]', 'Bianchi');
    await page.fill('input[placeholder="email@azienda.it"]', 'giulia@test.it');
    
    // Testa assegnazione reparti (se disponibili)
    const allDepartmentsCheckbox = page.locator('input[type="checkbox"]').first();
    if (await allDepartmentsCheckbox.isVisible()) {
      await allDepartmentsCheckbox.check();
    }
    
    await page.fill('input[type="date"]', '2025-06-30');
    await page.click('button:has-text("Aggiungi membro")');
    
    // Verifica che il membro sia stato aggiunto
    await expect(page.locator('text=Giulia Bianchi')).toBeVisible();
  });

  test('Dovrebbe mostrare stato vuoto correttamente', async ({ page }) => {
    // Verifica stato iniziale vuoto
    await expect(page.locator('text=Nessun membro dello staff registrato')).toBeVisible();
    await expect(page.locator('text=Aggiungi almeno un membro per procedere')).toBeVisible();
  });

  test('Dovrebbe avere accessibilità corretta', async ({ page }) => {
    // Verifica label associati
    await expect(page.locator('label:has-text("Nome *")')).toBeVisible();
    await expect(page.locator('label:has-text("Cognome *")')).toBeVisible();
    await expect(page.locator('label:has-text("Email")')).toBeVisible();
    
    // Verifica attributi aria
    const nameInput = page.locator('input[placeholder="Mario"]');
    const surnameInput = page.locator('input[placeholder="Rossi"]');
    
    // Verifica keyboard navigation
    await nameInput.press('Tab');
    await expect(surnameInput).toBeFocused();
  });

  test('Dovrebbe gestire panoramica HACCP', async ({ page }) => {
    // Aggiungi primo membro
    await page.fill('input[placeholder="Mario"]', 'Mario');
    await page.fill('input[placeholder="Rossi"]', 'Rossi');
    await page.fill('input[placeholder="+39 340 1234567"]', '+39 340 1234567');
    await page.fill('input[type="date"]', '2025-12-31');
    await page.click('button:has-text("Aggiungi membro")');
    
    // Verifica che appaia la panoramica HACCP
    await expect(page.locator('text=Panoramica HACCP')).toBeVisible();
    await expect(page.locator('text=Membri registrati')).toBeVisible();
    await expect(page.locator('text=Richiedono certificazione')).toBeVisible();
  });
});
