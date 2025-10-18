// Production/Test/Onboarding/DepartmentsStep/test-funzionale.spec.js
import { test, expect } from '@playwright/test';

test.describe('DepartmentsStep - Test Funzionali', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/onboarding');
    // Naviga al step departments (assumendo che sia il secondo step)
    await page.waitForSelector('h2:has-text("Configurazione Reparti")');
  });

  test('Dovrebbe renderizzare correttamente', async ({ page }) => {
    // Verifica header
    await expect(page.locator('h2:has-text("Configurazione Reparti")')).toBeVisible();
    
    // Verifica pulsante prefill
    await expect(page.locator('button:has-text("🚀 Carica reparti predefiniti")')).toBeVisible();
    
    // Verifica form di aggiunta (dovrebbe essere visibile se non ci sono reparti)
    await expect(page.locator('h3:has-text("Aggiungi Nuovo Reparto")')).toBeVisible();
    
    // Verifica campi form
    await expect(page.locator('input[placeholder="es. Cucina, Sala, Bancone..."]')).toBeVisible();
    await expect(page.locator('input[placeholder="Descrizione del reparto..."]')).toBeVisible();
    await expect(page.locator('input[type="checkbox"]')).toBeVisible(); // Reparto attivo
    
    // Verifica pulsanti azione
    await expect(page.locator('button:has-text("Aggiungi")')).toBeVisible();
  });

  test('Dovrebbe gestire il pulsante prefill correttamente', async ({ page }) => {
    // Click pulsante prefill
    await page.click('button:has-text("🚀 Carica reparti predefiniti")');
    
    // Verifica che i reparti siano stati aggiunti
    await expect(page.locator('text=Reparti Configurati (7)')).toBeVisible();
    
    // Verifica che alcuni reparti specifici siano presenti
    await expect(page.locator('text=Cucina')).toBeVisible();
    await expect(page.locator('text=Bancone')).toBeVisible();
    await expect(page.locator('text=Sala')).toBeVisible();
    await expect(page.locator('text=Magazzino')).toBeVisible();
    
    // Verifica che il form di aggiunta sia nascosto
    await expect(page.locator('h3:has-text("Aggiungi Nuovo Reparto")')).not.toBeVisible();
    
    // Verifica che appaia il pulsante "Aggiungi Nuovo Reparto"
    await expect(page.locator('button:has-text("Aggiungi Nuovo Reparto")')).toBeVisible();
  });

  test('Dovrebbe aggiungere un nuovo reparto', async ({ page }) => {
    // Compila form
    await page.fill('input[placeholder="es. Cucina, Sala, Bancone..."]', 'Test Reparto');
    await page.fill('input[placeholder="Descrizione del reparto..."]', 'Descrizione test');
    
    // Verifica che checkbox sia selezionato di default
    await expect(page.locator('input[type="checkbox"]')).toBeChecked();
    
    // Click aggiungi
    await page.click('button:has-text("Aggiungi")');
    
    // Verifica che il reparto sia stato aggiunto
    await expect(page.locator('text=Test Reparto')).toBeVisible();
    await expect(page.locator('text=Descrizione test')).toBeVisible();
    await expect(page.locator('text=Reparti Configurati (1)')).toBeVisible();
    
    // Verifica che il form sia stato resettato
    await expect(page.locator('input[placeholder="es. Cucina, Sala, Bancone..."]')).toHaveValue('');
    await expect(page.locator('input[placeholder="Descrizione del reparto..."]')).toHaveValue('');
    
    // Verifica che appaia il pulsante "Aggiungi Nuovo Reparto"
    await expect(page.locator('button:has-text("Aggiungi Nuovo Reparto")')).toBeVisible();
  });

  test('Dovrebbe aggiungere reparto inattivo', async ({ page }) => {
    // Compila form
    await page.fill('input[placeholder="es. Cucina, Sala, Bancone..."]', 'Reparto Inattivo');
    await page.fill('input[placeholder="Descrizione del reparto..."]', 'Reparto disattivato');
    
    // Disattiva checkbox
    await page.uncheck('input[type="checkbox"]');
    
    // Click aggiungi
    await page.click('button:has-text("Aggiungi")');
    
    // Verifica che il reparto sia stato aggiunto come inattivo
    await expect(page.locator('text=Reparto Inattivo')).toBeVisible();
    await expect(page.locator('text=Inattivo')).toBeVisible();
  });

  test('Dovrebbe modificare un reparto esistente', async ({ page }) => {
    // Prima aggiungi un reparto
    await page.fill('input[placeholder="es. Cucina, Sala, Bancone..."]', 'Reparto Originale');
    await page.fill('input[placeholder="Descrizione del reparto..."]', 'Descrizione originale');
    await page.click('button:has-text("Aggiungi")');
    
    // Click modifica
    await page.click('button[title="Modifica reparto"]');
    
    // Verifica che il form sia stato popolato
    await expect(page.locator('input[placeholder="es. Cucina, Sala, Bancone..."]')).toHaveValue('Reparto Originale');
    await expect(page.locator('input[placeholder="Descrizione del reparto..."]')).toHaveValue('Descrizione originale');
    await expect(page.locator('h3:has-text("Modifica Reparto")')).toBeVisible();
    await expect(page.locator('button:has-text("Aggiorna")')).toBeVisible();
    
    // Modifica i dati
    await page.fill('input[placeholder="es. Cucina, Sala, Bancone..."]', 'Reparto Modificato');
    await page.fill('input[placeholder="Descrizione del reparto..."]', 'Descrizione modificata');
    
    // Click aggiorna
    await page.click('button:has-text("Aggiorna")');
    
    // Verifica che le modifiche siano state salvate
    await expect(page.locator('text=Reparto Modificato')).toBeVisible();
    await expect(page.locator('text=Descrizione modificata')).toBeVisible();
    await expect(page.locator('text=Reparto Originale')).not.toBeVisible();
  });

  test('Dovrebbe eliminare un reparto', async ({ page }) => {
    // Prima aggiungi un reparto
    await page.fill('input[placeholder="es. Cucina, Sala, Bancone..."]', 'Reparto da Eliminare');
    await page.fill('input[placeholder="Descrizione del reparto..."]', 'Questo reparto verrà eliminato');
    await page.click('button:has-text("Aggiungi")');
    
    // Verifica che il reparto sia presente
    await expect(page.locator('text=Reparto da Eliminare')).toBeVisible();
    
    // Click elimina
    await page.click('button[title="Elimina reparto"]');
    
    // Verifica che il reparto sia stato eliminato
    await expect(page.locator('text=Reparto da Eliminare')).not.toBeVisible();
    await expect(page.locator('text=Reparti Configurati (0)')).toBeVisible();
    
    // Verifica che torni il form di aggiunta
    await expect(page.locator('h3:has-text("Aggiungi Nuovo Reparto")')).toBeVisible();
  });

  test('Dovrebbe annullare la modifica', async ({ page }) => {
    // Prima aggiungi un reparto
    await page.fill('input[placeholder="es. Cucina, Sala, Bancone..."]', 'Reparto Test');
    await page.click('button:has-text("Aggiungi")');
    
    // Click modifica
    await page.click('button[title="Modifica reparto"]');
    
    // Modifica i dati
    await page.fill('input[placeholder="es. Cucina, Sala, Bancone..."]', 'Nome Modificato');
    
    // Click annulla
    await page.click('button:has-text("Annulla")');
    
    // Verifica che le modifiche siano state annullate
    await expect(page.locator('text=Reparto Test')).toBeVisible();
    await expect(page.locator('text=Nome Modificato')).not.toBeVisible();
    
    // Verifica che il form sia stato resettato
    await expect(page.locator('input[placeholder="es. Cucina, Sala, Bancone..."]')).toHaveValue('');
  });

  test('Dovrebbe mostrare stato vuoto correttamente', async ({ page }) => {
    // Verifica stato iniziale vuoto
    await expect(page.locator('text=Nessun reparto configurato')).toBeVisible();
    await expect(page.locator('text=Aggiungi almeno un reparto per continuare')).toBeVisible();
    
    // Verifica che il form sia visibile
    await expect(page.locator('h3:has-text("Aggiungi Nuovo Reparto")')).toBeVisible();
  });

  test('Dovrebbe avere accessibilità corretta', async ({ page }) => {
    // Verifica label associati
    await expect(page.locator('label:has-text("Nome Reparto *")')).toBeVisible();
    await expect(page.locator('label:has-text("Descrizione")')).toBeVisible();
    
    // Verifica attributi aria
    const nameInput = page.locator('input[placeholder="es. Cucina, Sala, Bancone..."]');
    const descriptionInput = page.locator('input[placeholder="Descrizione del reparto..."]');
    
    // Verifica keyboard navigation
    await nameInput.press('Tab');
    await expect(descriptionInput).toBeFocused();
  });

  test('Dovrebbe gestire informazioni HACCP', async ({ page }) => {
    // Verifica sezione HACCP
    await expect(page.locator('text=Organizzazione HACCP')).toBeVisible();
    await expect(page.locator('text=I reparti sono utilizzati per organizzare il personale')).toBeVisible();
  });
});
