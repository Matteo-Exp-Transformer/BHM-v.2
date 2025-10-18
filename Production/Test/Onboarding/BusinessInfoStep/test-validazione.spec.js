// Production/Test/Onboarding/BusinessInfoStep/test-validazione.spec.js
import { test, expect } from '@playwright/test';

test.describe('BusinessInfoStep - Test Validazione', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForSelector('h2:has-text("Informazioni Aziendali")');
  });

  test('Dovrebbe accettare input validi', async ({ page }) => {
    // Compila con dati validi
    await page.fill('input[placeholder="Inserisci il nome della tua azienda"]', 'Azienda Test');
    await page.fill('textarea[placeholder="Inserisci l\'indirizzo completo dell\'azienda"]', 'Via Test 123, Milano');
    await page.fill('input[placeholder="+39 051 1234567"]', '+39 051 1234567');
    await page.fill('input[placeholder="info@azienda.it"]', 'test@azienda.it');
    await page.fill('input[placeholder="IT12345678901"]', 'IT12345678901');
    
    // Verifica che non ci siano errori
    await expect(page.locator('text=Il nome dell\'azienda è obbligatorio')).not.toBeVisible();
    await expect(page.locator('text=L\'indirizzo è obbligatorio')).not.toBeVisible();
    await expect(page.locator('text=Inserisci un indirizzo email valido')).not.toBeVisible();
    await expect(page.locator('text=Inserisci un numero di telefono valido')).not.toBeVisible();
    await expect(page.locator('text=Inserisci una Partita IVA valida')).not.toBeVisible();
  });

  test('Dovrebbe rifiutare nome azienda vuoto', async ({ page }) => {
    // Lascia nome vuoto e compila indirizzo
    await page.fill('textarea[placeholder="Inserisci l\'indirizzo completo dell\'azienda"]', 'Via Test 123');
    
    // Verifica errore
    await expect(page.locator('text=Il nome dell\'azienda è obbligatorio')).toBeVisible();
  });

  test('Dovrebbe rifiutare nome azienda troppo corto', async ({ page }) => {
    // Nome troppo corto
    await page.fill('input[placeholder="Inserisci il nome della tua azienda"]', 'A');
    await page.fill('textarea[placeholder="Inserisci l\'indirizzo completo dell\'azienda"]', 'Via Test 123');
    
    // Verifica errore
    await expect(page.locator('text=Il nome deve essere di almeno 2 caratteri')).toBeVisible();
  });

  test('Dovrebbe rifiutare indirizzo vuoto', async ({ page }) => {
    // Compila nome ma lascia indirizzo vuoto
    await page.fill('input[placeholder="Inserisci il nome della tua azienda"]', 'Azienda Test');
    
    // Verifica errore
    await expect(page.locator('text=L\'indirizzo è obbligatorio')).toBeVisible();
  });

  test('Dovrebbe rifiutare email invalida', async ({ page }) => {
    // Email invalida
    await page.fill('input[placeholder="info@azienda.it"]', 'email-invalida');
    
    // Verifica errore
    await expect(page.locator('text=Inserisci un indirizzo email valido')).toBeVisible();
  });

  test('Dovrebbe accettare email valida', async ({ page }) => {
    // Email valida
    await page.fill('input[placeholder="info@azienda.it"]', 'test@example.com');
    
    // Verifica che non ci sia errore
    await expect(page.locator('text=Inserisci un indirizzo email valido')).not.toBeVisible();
  });

  test('Dovrebbe rifiutare telefono invalido', async ({ page }) => {
    // Telefono invalido (caratteri non numerici)
    await page.fill('input[placeholder="+39 051 1234567"]', 'abc123');
    
    // Verifica errore
    await expect(page.locator('text=Inserisci un numero di telefono valido')).toBeVisible();
  });

  test('Dovrebbe accettare telefoni validi', async ({ page }) => {
    const validPhones = [
      '+39 051 1234567',
      '051 1234567',
      '051-123-4567',
      '+39 (051) 123-4567',
      '0511234567'
    ];

    for (const phone of validPhones) {
      await page.fill('input[placeholder="+39 051 1234567"]', phone);
      await expect(page.locator('text=Inserisci un numero di telefono valido')).not.toBeVisible();
    }
  });

  test('Dovrebbe rifiutare Partita IVA invalida', async ({ page }) => {
    // P.IVA invalida (formato sbagliato)
    await page.fill('input[placeholder="IT12345678901"]', 'INVALID123456');
    
    // Verifica errore
    await expect(page.locator('text=Inserisci una Partita IVA valida (es: IT12345678901)')).toBeVisible();
  });

  test('Dovrebbe accettare Partita IVA valida', async ({ page }) => {
    // P.IVA valida
    await page.fill('input[placeholder="IT12345678901"]', 'IT12345678901');
    
    // Verifica che non ci sia errore
    await expect(page.locator('text=Inserisci una Partita IVA valida')).not.toBeVisible();
  });

  test('Dovrebbe gestire Partita IVA con spazi', async ({ page }) => {
    // P.IVA con spazi (dovrebbe essere accettata)
    await page.fill('input[placeholder="IT12345678901"]', 'IT 12345678901');
    
    // Verifica che non ci sia errore
    await expect(page.locator('text=Inserisci una Partita IVA valida')).not.toBeVisible();
  });

  test('Dovrebbe gestire caratteri speciali nei campi', async ({ page }) => {
    const specialChars = ['<script>', "'; DROP TABLE--", '../../etc/passwd'];
    
    for (const char of specialChars) {
      // Test nel nome azienda
      await page.fill('input[placeholder="Inserisci il nome della tua azienda"]', char);
      await page.fill('textarea[placeholder="Inserisci l\'indirizzo completo dell\'azienda"]', 'Via Test 123');
      
      // Verifica che non ci siano errori di validazione (solo sanitizzazione)
      await expect(page.locator('text=Il nome dell\'azienda è obbligatorio')).not.toBeVisible();
    }
  });

  test('Dovrebbe gestire Unicode correttamente', async ({ page }) => {
    // Test con caratteri Unicode
    await page.fill('input[placeholder="Inserisci il nome della tua azienda"]', '🎉 Test 日本語');
    await page.fill('textarea[placeholder="Inserisci l\'indirizzo completo dell\'azienda"]', 'Via Test 123');
    
    // Verifica che non ci siano errori
    await expect(page.locator('text=Il nome dell\'azienda è obbligatorio')).not.toBeVisible();
    await expect(page.locator('text=L\'indirizzo è obbligatorio')).not.toBeVisible();
  });

  test('Dovrebbe validare in tempo reale', async ({ page }) => {
    // Inizia con nome vuoto
    await page.fill('input[placeholder="Inserisci il nome della tua azienda"]', '');
    await page.fill('textarea[placeholder="Inserisci l\'indirizzo completo dell\'azienda"]', '');
    
    // Verifica errori immediati
    await expect(page.locator('text=Il nome dell\'azienda è obbligatorio')).toBeVisible();
    await expect(page.locator('text=L\'indirizzo è obbligatorio')).toBeVisible();
    
    // Compila nome
    await page.fill('input[placeholder="Inserisci il nome della tua azienda"]', 'Test');
    
    // Verifica che errore nome sia sparito
    await expect(page.locator('text=Il nome dell\'azienda è obbligatorio')).not.toBeVisible();
    
    // Compila indirizzo
    await page.fill('textarea[placeholder="Inserisci l\'indirizzo completo dell\'azienda"]', 'Via Test 123');
    
    // Verifica che errore indirizzo sia sparito
    await expect(page.locator('text=L\'indirizzo è obbligatorio')).not.toBeVisible();
  });
});
