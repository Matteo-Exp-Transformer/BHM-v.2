// Production/Test/Onboarding/DepartmentsStep/test-validazione.spec.js
import { test, expect } from '@playwright/test';

test.describe('DepartmentsStep - Test Validazione', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForSelector('h2:has-text("Configurazione Reparti")');
  });

  test('Dovrebbe accettare reparto valido', async ({ page }) => {
    // Compila con dati validi
    await page.fill('input[placeholder="es. Cucina, Sala, Bancone..."]', 'Cucina');
    await page.fill('input[placeholder="Descrizione del reparto..."]', 'Area preparazione cibi');
    
    // Click aggiungi
    await page.click('button:has-text("Aggiungi")');
    
    // Verifica che il reparto sia stato aggiunto senza errori
    await expect(page.locator('text=Cucina')).toBeVisible();
    await expect(page.locator('text=Il nome del reparto è obbligatorio')).not.toBeVisible();
    await expect(page.locator('text=Il nome deve essere di almeno 2 caratteri')).not.toBeVisible();
    await expect(page.locator('text=Un reparto con questo nome esiste già')).not.toBeVisible();
  });

  test('Dovrebbe rifiutare nome reparto vuoto', async ({ page }) => {
    // Lascia nome vuoto
    await page.fill('input[placeholder="Descrizione del reparto..."]', 'Descrizione test');
    
    // Click aggiungi
    await page.click('button:has-text("Aggiungi")');
    
    // Verifica errore
    await expect(page.locator('text=Il nome del reparto è obbligatorio')).toBeVisible();
  });

  test('Dovrebbe rifiutare nome reparto troppo corto', async ({ page }) => {
    // Nome troppo corto
    await page.fill('input[placeholder="es. Cucina, Sala, Bancone..."]', 'A');
    await page.fill('input[placeholder="Descrizione del reparto..."]', 'Descrizione test');
    
    // Click aggiungi
    await page.click('button:has-text("Aggiungi")');
    
    // Verifica errore
    await expect(page.locator('text=Il nome deve essere di almeno 2 caratteri')).toBeVisible();
  });

  test('Dovrebbe rifiutare nomi duplicati', async ({ page }) => {
    // Aggiungi primo reparto
    await page.fill('input[placeholder="es. Cucina, Sala, Bancone..."]', 'Cucina');
    await page.fill('input[placeholder="Descrizione del reparto..."]', 'Prima cucina');
    await page.click('button:has-text("Aggiungi")');
    
    // Verifica che sia stato aggiunto
    await expect(page.locator('text=Cucina')).toBeVisible();
    
    // Prova ad aggiungere reparto con stesso nome
    await page.click('button:has-text("Aggiungi Nuovo Reparto")');
    await page.fill('input[placeholder="es. Cucina, Sala, Bancone..."]', 'cucina'); // Case insensitive
    await page.fill('input[placeholder="Descrizione del reparto..."]', 'Seconda cucina');
    
    // Click aggiungi
    await page.click('button:has-text("Aggiungi")');
    
    // Verifica errore
    await expect(page.locator('text=Un reparto con questo nome esiste già')).toBeVisible();
  });

  test('Dovrebbe accettare nomi simili ma diversi', async ({ page }) => {
    // Aggiungi primo reparto
    await page.fill('input[placeholder="es. Cucina, Sala, Bancone..."]', 'Cucina');
    await page.fill('input[placeholder="Descrizione del reparto..."]', 'Prima cucina');
    await page.click('button:has-text("Aggiungi")');
    
    // Aggiungi secondo reparto con nome simile ma diverso
    await page.click('button:has-text("Aggiungi Nuovo Reparto")');
    await page.fill('input[placeholder="es. Cucina, Sala, Bancone..."]', 'Cucina Principale');
    await page.fill('input[placeholder="Descrizione del reparto..."]', 'Cucina principale');
    await page.click('button:has-text("Aggiungi")');
    
    // Verifica che entrambi i reparti siano presenti
    await expect(page.locator('text=Cucina')).toBeVisible();
    await expect(page.locator('text=Cucina Principale')).toBeVisible();
  });

  test('Dovrebbe gestire spazi nei nomi', async ({ page }) => {
    // Nome con solo spazi
    await page.fill('input[placeholder="es. Cucina, Sala, Bancone..."]', '   ');
    await page.fill('input[placeholder="Descrizione del reparto..."]', 'Descrizione test');
    
    // Click aggiungi
    await page.click('button:has-text("Aggiungi")');
    
    // Verifica errore
    await expect(page.locator('text=Il nome del reparto è obbligatorio')).toBeVisible();
    
    // Nome con spazi iniziali e finali (dovrebbe essere trimmato)
    await page.fill('input[placeholder="es. Cucina, Sala, Bancone..."]', '  Cucina  ');
    await page.fill('input[placeholder="Descrizione del reparto..."]', 'Descrizione test');
    await page.click('button:has-text("Aggiungi")');
    
    // Verifica che sia stato aggiunto senza errori
    await expect(page.locator('text=Cucina')).toBeVisible();
    await expect(page.locator('text=Il nome del reparto è obbligatorio')).not.toBeVisible();
  });

  test('Dovrebbe gestire caratteri speciali', async ({ page }) => {
    const specialNames = [
      'Cucina & Sala',
      'Reparto-1',
      'Area (Principale)',
      'Zona "A"',
      'Settore 100%'
    ];
    
    for (const name of specialNames) {
      // Pulisci form se necessario
      await page.reload();
      await page.waitForSelector('h2:has-text("Configurazione Reparti")');
      
      await page.fill('input[placeholder="es. Cucina, Sala, Bancone..."]', name);
      await page.fill('input[placeholder="Descrizione del reparto..."]', 'Descrizione test');
      await page.click('button:has-text("Aggiungi")');
      
      // Verifica che sia stato aggiunto senza errori
      await expect(page.locator(`text=${name}`)).toBeVisible();
      await expect(page.locator('text=Il nome del reparto è obbligatorio')).not.toBeVisible();
    }
  });

  test('Dovrebbe gestire Unicode', async ({ page }) => {
    // Test con caratteri Unicode
    await page.fill('input[placeholder="es. Cucina, Sala, Bancone..."]', '🎉 Cucina Speciale 日本語');
    await page.fill('input[placeholder="Descrizione del reparto..."]', 'Descrizione con emoji e caratteri speciali');
    await page.click('button:has-text("Aggiungi")');
    
    // Verifica che sia stato aggiunto senza errori
    await expect(page.locator('text=🎉 Cucina Speciale 日本語')).toBeVisible();
    await expect(page.locator('text=Il nome del reparto è obbligatorio')).not.toBeVisible();
  });

  test('Dovrebbe validare durante modifica', async ({ page }) => {
    // Aggiungi primo reparto
    await page.fill('input[placeholder="es. Cucina, Sala, Bancone..."]', 'Cucina');
    await page.fill('input[placeholder="Descrizione del reparto..."]', 'Prima cucina');
    await page.click('button:has-text("Aggiungi")');
    
    // Aggiungi secondo reparto
    await page.click('button:has-text("Aggiungi Nuovo Reparto")');
    await page.fill('input[placeholder="es. Cucina, Sala, Bancone..."]', 'Sala');
    await page.fill('input[placeholder="Descrizione del reparto..."]', 'Area sala');
    await page.click('button:has-text("Aggiungi")');
    
    // Modifica il secondo reparto con nome duplicato
    await page.click('button[title="Modifica reparto"]', { position: { x: 1, y: 1 } }); // Click sul primo bottone modifica (Sala)
    await page.fill('input[placeholder="es. Cucina, Sala, Bancone..."]', 'Cucina'); // Nome duplicato
    
    // Click aggiorna
    await page.click('button:has-text("Aggiorna")');
    
    // Verifica errore
    await expect(page.locator('text=Un reparto con questo nome esiste già')).toBeVisible();
  });

  test('Dovrebbe validare nome minimo durante modifica', async ({ page }) => {
    // Aggiungi reparto
    await page.fill('input[placeholder="es. Cucina, Sala, Bancone..."]', 'Cucina');
    await page.fill('input[placeholder="Descrizione del reparto..."]', 'Descrizione');
    await page.click('button:has-text("Aggiungi")');
    
    // Modifica con nome troppo corto
    await page.click('button[title="Modifica reparto"]');
    await page.fill('input[placeholder="es. Cucina, Sala, Bancone..."]', 'A');
    
    // Click aggiorna
    await page.click('button:has-text("Aggiorna")');
    
    // Verifica errore
    await expect(page.locator('text=Il nome deve essere di almeno 2 caratteri')).toBeVisible();
  });

  test('Dovrebbe accettare descrizione vuota', async ({ page }) => {
    // Nome valido, descrizione vuota
    await page.fill('input[placeholder="es. Cucina, Sala, Bancone..."]', 'Cucina');
    await page.fill('input[placeholder="Descrizione del reparto..."]', '');
    
    // Click aggiungi
    await page.click('button:has-text("Aggiungi")');
    
    // Verifica che sia stato aggiunto senza errori
    await expect(page.locator('text=Cucina')).toBeVisible();
  });

  test('Dovrebbe gestire descrizione con caratteri speciali', async ({ page }) => {
    const specialDescriptions = [
      'Descrizione con <script>alert("test")</script>',
      'Descrizione con &amp; caratteri &lt;speciali&gt;',
      'Descrizione con "virgolette" e \'apici\'',
      'Descrizione con caratteri unicode: 🎉 日本語'
    ];
    
    for (const desc of specialDescriptions) {
      await page.reload();
      await page.waitForSelector('h2:has-text("Configurazione Reparti")');
      
      await page.fill('input[placeholder="es. Cucina, Sala, Bancone..."]', 'Cucina Test');
      await page.fill('input[placeholder="Descrizione del reparto..."]', desc);
      await page.click('button:has-text("Aggiungi")');
      
      // Verifica che sia stato aggiunto
      await expect(page.locator('text=Cucina Test')).toBeVisible();
    }
  });

  test('Dovrebbe validare in tempo reale', async ({ page }) => {
    // Inizia con nome vuoto
    await page.fill('input[placeholder="es. Cucina, Sala, Bancone..."]', '');
    
    // Verifica che non ci siano errori ancora (validation solo al submit)
    await expect(page.locator('text=Il nome del reparto è obbligatorio')).not.toBeVisible();
    
    // Prova a inviare
    await page.click('button:has-text("Aggiungi")');
    
    // Verifica errore
    await expect(page.locator('text=Il nome del reparto è obbligatorio')).toBeVisible();
    
    // Compila nome valido
    await page.fill('input[placeholder="es. Cucina, Sala, Bancone..."]', 'Cucina');
    
    // Verifica che l'errore sia ancora visibile (non si aggiorna in tempo reale)
    await expect(page.locator('text=Il nome del reparto è obbligatorio')).toBeVisible();
    
    // Click aggiungi di nuovo
    await page.click('button:has-text("Aggiungi")');
    
    // Verifica che il reparto sia stato aggiunto
    await expect(page.locator('text=Cucina')).toBeVisible();
  });
});
