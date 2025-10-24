// Production/Test/Onboarding/DepartmentsStep/test-funzionale.spec.js
import { test, expect } from '@playwright/test';

test.describe('DepartmentsStep - Test Funzionali', () => {

  test.beforeEach(async ({ page }) => {
    console.log('🔐 Eseguendo login automatico...')
    
    // Vai alla pagina di login
    await page.goto('http://localhost:3000/')
    await page.waitForLoadState('networkidle')
    
    // Compila il form di login
    await page.fill('input[type="email"]', 'matteo.cavallaro.work@gmail.com')
    await page.fill('input[type="password"]', 'cavallaro')
    
    console.log('📝 Credenziali inserite, cliccando Accedi...')
    await page.click('button:has-text("Accedi")')
    
    // Attendi il login e il caricamento della dashboard
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    console.log('🏢 Cliccando pulsante Onboarding...')
    // Cerca e clicca il pulsante Onboarding nell'header
    const onboardingButton = page.locator('button:has-text("Onboarding")')
    await expect(onboardingButton).toBeVisible()
    await onboardingButton.click()
    
    // Attendi che si apra l'onboarding
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)
    
    // Completa il primo step (BusinessInfoStep) per poter accedere al secondo
    console.log('📝 Completando BusinessInfoStep...')
    
    // Compila i campi obbligatori del primo step
    await page.fill('input[placeholder="Inserisci il nome della tua azienda"]', 'Test Azienda')
    await page.waitForTimeout(1000)
    
    await page.fill('textarea[placeholder="Inserisci l\'indirizzo completo dell\'azienda"]', 'Via Test 123')
    await page.waitForTimeout(1000)
    
    await page.fill('input[placeholder="info@azienda.it"]', 'test@azienda.com')
    await page.waitForTimeout(1000)
    
    await page.fill('input[placeholder="+39 051 1234567"]', '1234567890')
    await page.waitForTimeout(1000)
    
    // Clicca Avanti per completare il primo step
    console.log('➡️ Cliccando Avanti per completare BusinessInfoStep...')
    const nextButton = page.locator('button:has-text("Avanti"), button:has-text("Continua"), button:has-text("Next")')
    await expect(nextButton).toBeVisible()
    await nextButton.click()
    await page.waitForTimeout(1500)
    
    console.log('✅ BusinessInfoStep completato, DepartmentsStep aperto')
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
    await expect(page.locator('h4:has-text("Cucina")')).toBeVisible();
    await expect(page.locator('h4:has-text("Bancone")')).toBeVisible();
    await expect(page.locator('h4:has-text("Sala")')).toBeVisible();
    await expect(page.locator('h4:has-text("Magazzino")')).toBeVisible();
    
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
    await expect(page.locator('h4:has-text("Reparto Inattivo")')).toBeVisible();
    await expect(page.locator('span:has-text("Inattivo"):has([class*="bg-gray"])')).toBeVisible();
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

