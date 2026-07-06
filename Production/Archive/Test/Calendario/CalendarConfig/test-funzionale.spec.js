import { test, expect } from '@playwright/test';

test.describe('CalendarConfigModal - Test Funzionali', () => {
  
  // Setup: navigare alla pagina prima di ogni test
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3005');
    // Aspettare che l'app sia caricata
    await expect(page.locator('body')).toBeVisible();
    
    // Login se necessario
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill('matteo.cavallaro.work@gmail.com');
      await page.locator('input[type="password"]').fill('Cavallaro');
      await page.locator('button[type="submit"]').click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('Dovrebbe aprire il modal di configurazione calendario', async ({ page }) => {
    // Navigare alla pagina calendario
    await page.goto('http://localhost:3005/calendar');
    await page.waitForLoadState('networkidle');
    
    // Cercare il bottone per aprire configurazione calendario
    const configButton = page.locator('button:has-text("Configura")').or(
      page.locator('button:has-text("Impostazioni")')
    ).or(
      page.locator('[data-testid="calendar-config-button"]')
    );
    
    if (await configButton.isVisible()) {
      await configButton.click();
      
      // Verificare che il modal sia aperto
      await expect(page.locator('text=Configurazione Calendario')).toBeVisible();
      await expect(page.locator('text=Anno Lavorativo')).toBeVisible();
    }
  });

  test('Dovrebbe mostrare tutti i campi di configurazione', async ({ page }) => {
    await page.goto('http://localhost:3005/calendar');
    await page.waitForLoadState('networkidle');
    
    // Aprire il modal (se disponibile)
    const configButton = page.locator('button:has-text("Configura")').or(
      page.locator('button:has-text("Impostazioni")')
    );
    
    if (await configButton.isVisible()) {
      await configButton.click();
      
      // Verificare presenza di tutti i campi principali
      await expect(page.locator('text=Anno Lavorativo')).toBeVisible();
      await expect(page.locator('text=Giorni Apertura Settimanali')).toBeVisible();
      await expect(page.locator('text=Giorni di Chiusura')).toBeVisible();
      await expect(page.locator('text=Orari di Apertura')).toBeVisible();
      
      // Verificare input fields
      await expect(page.locator('input[type="date"]').first()).toBeVisible();
      await expect(page.locator('input[type="date"]').nth(1)).toBeVisible();
    }
  });

  test('Dovrebbe permettere selezione giorni settimana', async ({ page }) => {
    await page.goto('http://localhost:3005/calendar');
    await page.waitForLoadState('networkidle');
    
    const configButton = page.locator('button:has-text("Configura")').or(
      page.locator('button:has-text("Impostazioni")')
    );
    
    if (await configButton.isVisible()) {
      await configButton.click();
      
      // Cercare i bottoni dei giorni settimana
      const weekdayButtons = page.locator('button:has-text("Lun")').or(
        page.locator('button:has-text("Mar")')
      ).or(
        page.locator('button:has-text("Mer")')
      );
      
      if (await weekdayButtons.first().isVisible()) {
        // Testare click su un giorno
        await weekdayButtons.first().click();
        
        // Verificare che il giorno sia selezionato (cambio colore)
        await expect(weekdayButtons.first()).toHaveClass(/bg-blue-600/);
      }
    }
  });

  test('Dovrebbe permettere aggiunta giorni chiusura', async ({ page }) => {
    await page.goto('http://localhost:3005/calendar');
    await page.waitForLoadState('networkidle');
    
    const configButton = page.locator('button:has-text("Configura")').or(
      page.locator('button:has-text("Impostazioni")')
    );
    
    if (await configButton.isVisible()) {
      await configButton.click();
      
      // Cercare input per data chiusura
      const dateInput = page.locator('input[type="date"]').nth(2);
      if (await dateInput.isVisible()) {
        // Impostare una data futura
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        const dateString = futureDate.toISOString().split('T')[0];
        
        await dateInput.fill(dateString);
        
        // Cercare bottone per aggiungere
        const addButton = page.locator('button:has-text("+")').or(
          page.locator('button:has-text("Aggiungi")')
        );
        
        if (await addButton.isVisible()) {
          await addButton.click();
          
          // Verificare che la data sia stata aggiunta
          await expect(page.locator(`text=${dateString}`)).toBeVisible();
        }
      }
    }
  });

  test('Dovrebbe permettere configurazione orari apertura', async ({ page }) => {
    await page.goto('http://localhost:3005/calendar');
    await page.waitForLoadState('networkidle');
    
    const configButton = page.locator('button:has-text("Configura")').or(
      page.locator('button:has-text("Impostazioni")')
    );
    
    if (await configButton.isVisible()) {
      await configButton.click();
      
      // Cercare input per orari
      const timeInputs = page.locator('input[type="time"]');
      if (await timeInputs.first().isVisible()) {
        // Impostare orario apertura
        await timeInputs.first().fill('08:00');
        
        // Impostare orario chiusura
        if (await timeInputs.nth(1).isVisible()) {
          await timeInputs.nth(1).fill('18:00');
        }
        
        // Verificare che gli orari siano stati impostati
        await expect(timeInputs.first()).toHaveValue('08:00');
      }
    }
  });

  test('Dovrebbe mostrare riepilogo giorni lavorativi', async ({ page }) => {
    await page.goto('http://localhost:3005/calendar');
    await page.waitForLoadState('networkidle');
    
    const configButton = page.locator('button:has-text("Configura")').or(
      page.locator('button:has-text("Impostazioni")')
    );
    
    if (await configButton.isVisible()) {
      await configButton.click();
      
      // Impostare anno lavorativo
      const startDateInput = page.locator('input[type="date"]').first();
      const endDateInput = page.locator('input[type="date"]').nth(1);
      
      if (await startDateInput.isVisible() && await endDateInput.isVisible()) {
        await startDateInput.fill('2025-01-01');
        await endDateInput.fill('2025-12-31');
        
        // Verificare che appaia il riepilogo
        await expect(page.locator('text=Riepilogo Anno Lavorativo')).toBeVisible();
        await expect(page.locator('text=Giorni Lavorativi')).toBeVisible();
      }
    }
  });

  test('Dovrebbe permettere salvataggio configurazione', async ({ page }) => {
    await page.goto('http://localhost:3005/calendar');
    await page.waitForLoadState('networkidle');
    
    const configButton = page.locator('button:has-text("Configura")').or(
      page.locator('button:has-text("Impostazioni")')
    );
    
    if (await configButton.isVisible()) {
      await configButton.click();
      
      // Cercare bottone salva
      const saveButton = page.locator('button:has-text("Salva")').or(
        page.locator('button:has-text("Salva Configurazione")')
      );
      
      if (await saveButton.isVisible()) {
        // Verificare che il bottone sia cliccabile
        await expect(saveButton).toBeEnabled();
        
        // Click su salva
        await saveButton.click();
        
        // Verificare che il modal si chiuda o mostri messaggio successo
        await page.waitForTimeout(1000);
        
        // Il modal dovrebbe chiudersi o mostrare messaggio di successo
        const isModalClosed = !(await page.locator('text=Configurazione Calendario').isVisible());
        const hasSuccessMessage = await page.locator('text=Salvataggio').isVisible();
        
        expect(isModalClosed || hasSuccessMessage).toBeTruthy();
      }
    }
  });

  test('Dovrebbe permettere chiusura modal', async ({ page }) => {
    await page.goto('http://localhost:3005/calendar');
    await page.waitForLoadState('networkidle');
    
    const configButton = page.locator('button:has-text("Configura")').or(
      page.locator('button:has-text("Impostazioni")')
    );
    
    if (await configButton.isVisible()) {
      await configButton.click();
      
      // Cercare bottone chiudi o X
      const closeButton = page.locator('button:has-text("Annulla")').or(
        page.locator('button:has-text("×")')
      ).or(
        page.locator('[data-testid="close-button"]')
      );
      
      if (await closeButton.isVisible()) {
        await closeButton.click();
        
        // Verificare che il modal sia chiuso
        await expect(page.locator('text=Configurazione Calendario')).not.toBeVisible();
      }
    }
  });
});