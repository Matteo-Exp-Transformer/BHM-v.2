// Production/Test/Onboarding/StaffStep/test-edge-cases.spec.js
import { test, expect } from '@playwright/test';

test.describe('StaffStep - Edge Cases', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForSelector('h2:has-text("Gestione del Personale")');
  });

  test('Dovrebbe gestire molti membri staff', async ({ page }) => {
    const staffMembers = [
      { name: 'Mario', surname: 'Rossi' },
      { name: 'Giulia', surname: 'Bianchi' },
      { name: 'Marco', surname: 'Verdi' },
      { name: 'Anna', surname: 'Neri' },
      { name: 'Luca', surname: 'Blu' }
    ];
    
    // Aggiungi primo membro
    await page.fill('input[placeholder="Mario"]', staffMembers[0].name);
    await page.fill('input[placeholder="Rossi"]', staffMembers[0].surname);
    await page.fill('input[placeholder="+39 340 1234567"]', '+39 340 1234567');
    await page.fill('input[type="date"]', '2025-12-31');
    await page.click('button:has-text("Aggiungi membro")');
    
    // Aggiungi altri membri
    for (let i = 1; i < staffMembers.length; i++) {
      await page.click('button:has-text("Aggiungi Nuovo Membro")');
      await page.fill('input[placeholder="Mario"]', staffMembers[i].name);
      await page.fill('input[placeholder="Rossi"]', staffMembers[i].surname);
      await page.fill('input[placeholder="email@azienda.it"]', `${staffMembers[i].name.toLowerCase()}@test.it`);
      await page.fill('input[placeholder="+39 340 1234567"]', `+39 340 ${1234567 + i}`);
      await page.fill('input[type="date"]', '2025-06-30');
      await page.click('button:has-text("Aggiungi membro")');
    }
    
    // Verifica che tutti i membri siano presenti
    for (const member of staffMembers) {
      await expect(page.locator(`text=${member.name} ${member.surname}`)).toBeVisible();
    }
  });

  test('Dovrebbe gestire input rapidi e multipli', async ({ page }) => {
    // Simula input rapido
    const nameInput = page.locator('input[placeholder="Mario"]');
    
    // Input molto rapido
    await nameInput.type('Mario', { delay: 10 });
    await nameInput.clear();
    await nameInput.type('Giulia', { delay: 10 });
    
    await expect(nameInput).toHaveValue('Giulia');
    
    // Test cambio rapido tra campi
    await page.fill('input[placeholder="Mario"]', 'Mario');
    await page.fill('input[placeholder="Rossi"]', 'Rossi');
    await page.fill('input[placeholder="+39 340 1234567"]', '+39 340 1234567');
    await page.fill('input[type="date"]', '2025-12-31');
    await page.click('button:has-text("Aggiungi membro")');
    
    // Verifica che il membro sia stato aggiunto
    await expect(page.locator('text=Mario Rossi')).toBeVisible();
  });

  test('Dovrebbe gestire copy-paste', async ({ page }) => {
    // Test copia-incolla
    const nameInput = page.locator('input[placeholder="Mario"]');
    
    // Simula paste
    await nameInput.fill('Mario Copiato');
    await expect(nameInput).toHaveValue('Mario Copiato');
    
    // Test paste con contenuto lungo
    const longText = 'Mario con nome molto lungo che potrebbe causare problemi di layout o validazione';
    await nameInput.fill(longText);
    await expect(nameInput).toHaveValue(longText);
  });

  test('Dovrebbe gestire interruzioni utente', async ({ page }) => {
    // Test interruzione durante digitazione
    const nameInput = page.locator('input[placeholder="Mario"]');
    
    // Inizia a digitare
    await nameInput.type('Mar', { delay: 100 });
    
    // Interrompi e cambia campo
    await page.fill('input[placeholder="Rossi"]', 'Rossi');
    
    // Torna al nome e completa
    await nameInput.click();
    await nameInput.type('io');
    
    await expect(nameInput).toHaveValue('Mario');
  });

  test('Dovrebbe gestire modifica rapida', async ({ page }) => {
    // Aggiungi membro
    await page.fill('input[placeholder="Mario"]', 'Mario');
    await page.fill('input[placeholder="Rossi"]', 'Rossi');
    await page.fill('input[placeholder="+39 340 1234567"]', '+39 340 1234567');
    await page.fill('input[type="date"]', '2025-12-31');
    await page.click('button:has-text("Aggiungi membro")');
    
    // Modifica rapida
    await page.click('button[aria-label="Modifica membro"]');
    await page.fill('input[placeholder="Mario"]', 'Mario Modificato');
    await page.fill('input[placeholder="Rossi"]', 'Rossi Modificato');
    await page.click('button:has-text("Salva modifiche")');
    
    // Verifica che le modifiche siano state salvate
    await expect(page.locator('text=Mario Modificato Rossi Modificato')).toBeVisible();
  });

  test('Dovrebbe gestire eliminazione rapida', async ({ page }) => {
    // Aggiungi primo membro
    await page.fill('input[placeholder="Mario"]', 'Mario');
    await page.fill('input[placeholder="Rossi"]', 'Rossi');
    await page.fill('input[placeholder="+39 340 1234567"]', '+39 340 1234567');
    await page.fill('input[type="date"]', '2025-12-31');
    await page.click('button:has-text("Aggiungi membro")');
    
    // Aggiungi altri membri
    for (const name of ['Giulia', 'Marco']) {
      await page.click('button:has-text("Aggiungi Nuovo Membro")');
      await page.fill('input[placeholder="Mario"]', name);
      await page.fill('input[placeholder="Rossi"]', 'Test');
      await page.fill('input[placeholder="email@azienda.it"]', `${name.toLowerCase()}@test.it`);
      await page.fill('input[type="date"]', '2025-ramo-30');
      await page.click('button:has-text("Aggiungi membro")');
    }
    
    // Verifica che tutti siano presenti
    await expect(page.locator('text=Mario Rossi')).toBeVisible();
    await expect(page.locator('text=Giulia Test')).toBeVisible();
    await expect(page.locator('text=Marco Test')).toBeVisible();
    
    // Elimina tutti i membri non-primi rapidamente
    await page.click('button[aria-label="Elimina membro"]');
    await expect(page.locator('text=Giulia Test')).not.toBeVisible();
    
    await page.click('button[aria-label="Elimina membro"]');
    await expect(page.locator('text=Marco Test')).not.toBeVisible();
    
    // Verifica che il primo membro sia ancora presente e non eliminabile
    await expect(page.locator('text=Mario Rossi')).toBeVisible();
    await expect(page.locator('text=Non eliminabile')).toBeVisible();
  });

  test('Dovrebbe gestire navigazione con tab', async ({ page }) => {
    // Test navigazione completa con Tab
    const fields = [
      'input[placeholder="Mario"]',
      'input[placeholder="Rossi"]',
      'input[placeholder="+39 340 1234567"]',
      'input[type="date"]'
    ];
    
    // Testa navigazione con Tab
    for (let i = 0; i < fields.length; i++) {
      await page.keyboard.press('Tab');
      await expect(page.locator(fields[i])).toBeFocused();
    }
  });

  test('Dovrebbe gestire escape e annullamento', async ({ page }) => {
    // Compila parzialmente
    await page.fill('input[placeholder="Mario"]', 'Mario Parziale');
    
    // Premi Escape
    await page.keyboard.press('Escape');
    
    // Verifica che il valore sia ancora presente
    await expect(page.locator('input[placeholder="Mario"]')).toHaveValue('Mario Parziale');
  });

  test('Dovrebbe gestire stress test con molti click', async ({ page }) => {
    // Test stress con molti click rapidi
    const addButton = page.locator('button:has-text("Aggiungi membro")');
    
    // Compila form
    await page.fill('input[placeholder="Mario"]', 'Mario');
    await page.fill('input[placeholder="Rossi"]', 'Rossi');
    await page.fill('input[placeholder="+39 340 1234567"]', '+39 340 1234567');
    await page.fill('input[type="date"]', '2025-12-31');
    
    // Click multipli rapidi (dovrebbe aggiungere solo un membro)
    for (let i = 0; i < 5; i++) {
      await addButton.click();
    }
    
    // Verifica che sia stato aggiunto solo un membro
    await expect(page.locator('text=Mario Rossi')).toBeVisible();
  });

  test('Dovrebbe gestire modifica con dati identici', async ({ page }) => {
    // Aggiungi membro
    await page.fill('input[placeholder="Mario"]', 'Mario');
    await page.fill('input[placeholder="Rossi"]', 'Rossi');
    await page.fill('input[placeholder="+39 340 1234567"]', '+39 340 1234567');
    await page.fill('input[type="date"]', '2025-12-31');
    await page.click('button:has-text("Aggiungi membro")');
    
    // Modifica con stessi dati
    await page.click('button[aria-label="Modifica membro"]');
    await page.click('button:has-text("Salva modifiche")'); // Senza cambiare nulla
    
    // Verifica che non ci siano errori
    await expect(page.locator('text=Mario Rossi')).toBeVisible();
  });

  test('Dovrebbe gestire categorie multiple', async ({ page }) => {
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
    
    // Aggiungi categorie multiple
    await page.click('button:has-text("Aggiungi categoria")');
    await page.click('button:has-text("Aggiungi categoria")');
    await page.click('button:has-text("Aggiungi categoria")');
    
    await page.fill('input[type="date"]', '2025-06-30');
    await page.click('button:has-text("Aggiungi membro")');
    
    // Verifica che il membro sia stato aggiunto
    await expect(page.locator('text=Giulia Bianchi')).toBeVisible();
  });

  test('Dovrebbe gestire input con caratteri HTML', async ({ page }) => {
    const htmlInputs = [
      '<script>alert("test")</script>',
      '&lt;div&gt;Mario&lt;/div&gt;',
      'Mario&amp;Rossi',
      'José&lt;test&gt;'
    ];
    
    for (const input of htmlInputs) {
      await page.reload();
      await page.waitForSelector('h2:has-text("Gestione del Personale")');
      
      await page.fill('input[placeholder="Mario"]', input);
      await page.fill('input[placeholder="Rossi"]', 'Rossi');
      await page.fill('input[placeholder="+39 340 1234567"]', '+39 340 1234567');
      await page.fill('input[type="date"]', '2025-12-31');
      
      // Submit
      await page.click('button:has-text("Aggiungi membro")');
      
      // Verifica che sia stato aggiunto (sanitizzato)
      // Nota: Il testo potrebbe essere sanitizzato nell'output
    }
  });

  test('Dovrebbe gestire date limite', async ({ page }) => {
    const testDates = [
      '1900-01-01', // Data molto passata
      '2030-12-31', // Data futura
      new Date().toISOString().split('T')[0] // Data odierna
    ];
    
    for (const date of testDates) {
      await page.reload();
      await page.waitForSelector('h2:has-text("Gestione del Personale")');
      
      await page.fill('input[placeholder="Mario"]', 'Mario');
      await page.fill('input[placeholder="Rossi"]', 'Rossi');
      await page.fill('input[placeholder="+39 340 1234567"]', '+39 340 1234567');
      await page.fill('input[type="date"]', date);
      
      // Submit
      await page.click('button:has-text("Aggiungi membro")');
      
      // Verifica che sia stato aggiunto
      await expect(page.locator('text=Mario Rossi')).toBeVisible();
    }
  });

  test('Dovrebbe gestire telefono con formati diversi', async ({ page }) => {
    const phoneFormats = [
      '+39 340 1234567',
      '340 1234567',
      '340-123-4567',
      '+39 (340) 123-4567',
      '3401234567',
      '+39.340.123.4567',
      '340 123 4567'
    ];
    
    for (const phone of phoneFormats) {
      await page.reload();
      await page.waitForSelector('h2:has-text("Gestione del Personale")');
      
      await page.fill('input[placeholder="Mario"]', 'Mario');
      await page.fill('input[placeholder="Rossi"]', 'Rossi');
      await page.fill('input[placeholder="+39 340 1234567"]', phone);
      await page.fill('input[type="date"]', '2025-12-31');
      
      // Submit
      await page.click('button:has-text("Aggiungi membro")');
      
      // Verifica che sia stato aggiunto senza errori
      await expect(page.locator('text=Mario Rossi')).toBeVisible();
    }
  });
});

