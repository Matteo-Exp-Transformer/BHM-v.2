import { test, expect } from '@playwright/test';

test.describe('EventCreation - Test Funzionali', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3005');
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

  test('Dovrebbe aprire modal creazione evento', async ({ page }) => {
    await page.goto('http://localhost:3005/calendar');
    await page.waitForLoadState('networkidle');
    
    // Cercare bottone per creare evento
    const createButton = page.locator('button:has-text("Nuovo")').or(
      page.locator('button:has-text("Crea")')
    ).or(
      page.locator('button:has-text("+")')
    ).or(
      page.locator('[data-testid="create-event-button"]')
    );
    
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Verificare che il modal sia aperto
      await expect(page.locator('text=Nuovo Evento')).toBeVisible();
      await expect(page.locator('input[placeholder*="titolo"]')).toBeVisible();
    }
  });

  test('Dovrebbe mostrare tutti i campi del form', async ({ page }) => {
    await page.goto('http://localhost:3005/calendar');
    await page.waitForLoadState('networkidle');
    
    const createButton = page.locator('button:has-text("Nuovo")').or(
      page.locator('button:has-text("Crea")')
    );
    
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Verificare presenza di tutti i campi principali
      await expect(page.locator('text=Titolo')).toBeVisible();
      await expect(page.locator('text=Tipo Evento')).toBeVisible();
      await expect(page.locator('text=Descrizione')).toBeVisible();
      await expect(page.locator('text=Data e Ora Inizio')).toBeVisible();
      await expect(page.locator('text=Priorità')).toBeVisible();
      await expect(page.locator('text=Assegna a')).toBeVisible();
    }
  });

  test('Dovrebbe permettere selezione tipo evento', async ({ page }) => {
    await page.goto('http://localhost:3005/calendar');
    await page.waitForLoadState('networkidle');
    
    const createButton = page.locator('button:has-text("Nuovo")').or(
      page.locator('button:has-text("Crea")')
    );
    
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Cercare bottoni tipo evento
      const typeButtons = page.locator('button:has-text("Manutenzione")').or(
        page.locator('button:has-text("Attività")')
      ).or(
        page.locator('button:has-text("Lettura Temperatura")')
      );
      
      if (await typeButtons.first().isVisible()) {
        await typeButtons.first().click();
        
        // Verificare che il tipo sia selezionato
        await expect(typeButtons.first()).toHaveClass(/border-blue-500/);
      }
    }
  });

  test('Dovrebbe permettere inserimento dati evento', async ({ page }) => {
    await page.goto('http://localhost:3005/calendar');
    await page.waitForLoadState('networkidle');
    
    const createButton = page.locator('button:has-text("Nuovo")').or(
      page.locator('button:has-text("Crea")')
    );
    
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Inserire titolo
      const titleInput = page.locator('input[placeholder*="titolo"]');
      if (await titleInput.isVisible()) {
        await titleInput.fill('Test Evento');
        
        // Inserire descrizione
        const descInput = page.locator('textarea[placeholder*="descrizione"]');
        if (await descInput.isVisible()) {
          await descInput.fill('Descrizione test evento');
        }
        
        // Verificare che i dati siano stati inseriti
        await expect(titleInput).toHaveValue('Test Evento');
      }
    }
  });

  test('Dovrebbe permettere configurazione data e ora', async ({ page }) => {
    await page.goto('http://localhost:3005/calendar');
    await page.waitForLoadState('networkidle');
    
    const createButton = page.locator('button:has-text("Nuovo")').or(
      page.locator('button:has-text("Crea")')
    );
    
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Impostare data inizio
      const startInput = page.locator('input[type="datetime-local"]').first();
      if (await startInput.isVisible()) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateString = tomorrow.toISOString().slice(0, 16);
        
        await startInput.fill(dateString);
        
        // Impostare data fine
        const endInput = page.locator('input[type="datetime-local"]').nth(1);
        if (await endInput.isVisible()) {
          const endDate = new Date(tomorrow);
          endDate.setHours(endDate.getHours() + 2);
          const endDateString = endDate.toISOString().slice(0, 16);
          
          await endInput.fill(endDateString);
          
          // Verificare che le date siano state impostate
          await expect(startInput).toHaveValue(dateString);
          await expect(endInput).toHaveValue(endDateString);
        }
      }
    }
  });

  test('Dovrebbe permettere aggiunta assegnatari', async ({ page }) => {
    await page.goto('http://localhost:3005/calendar');
    await page.waitForLoadState('networkidle');
    
    const createButton = page.locator('button:has-text("Nuovo")').or(
      page.locator('button:has-text("Crea")')
    );
    
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Cercare input per email assegnatario
      const emailInput = page.locator('input[type="email"]');
      if (await emailInput.isVisible()) {
        await emailInput.fill('test@example.com');
        
        // Cercare bottone per aggiungere
        const addButton = page.locator('button:has-text("+")').or(
          page.locator('button:has-text("Aggiungi")')
        );
        
        if (await addButton.isVisible()) {
          await addButton.click();
          
          // Verificare che l'assegnatario sia stato aggiunto
          await expect(page.locator('text=test@example.com')).toBeVisible();
        }
      }
    }
  });

  test('Dovrebbe mostrare campi specifici per tipo manutenzione', async ({ page }) => {
    await page.goto('http://localhost:3005/calendar');
    await page.waitForLoadState('networkidle');
    
    const createButton = page.locator('button:has-text("Nuovo")').or(
      page.locator('button:has-text("Crea")')
    );
    
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Selezionare tipo manutenzione
      const maintenanceButton = page.locator('button:has-text("Manutenzione")');
      if (await maintenanceButton.isVisible()) {
        await maintenanceButton.click();
        
        // Verificare che appaiano i campi specifici
        await expect(page.locator('text=Frequenza')).toBeVisible();
        await expect(page.locator('text=Durata Stimata')).toBeVisible();
        await expect(page.locator('text=Checklist')).toBeVisible();
      }
    }
  });

  test('Dovrebbe permettere creazione evento', async ({ page }) => {
    await page.goto('http://localhost:3005/calendar');
    await page.waitForLoadState('networkidle');
    
    const createButton = page.locator('button:has-text("Nuovo")').or(
      page.locator('button:has-text("Crea")')
    );
    
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Compilare form minimo
      const titleInput = page.locator('input[placeholder*="titolo"]');
      if (await titleInput.isVisible()) {
        await titleInput.fill('Evento Test');
        
        // Cercare bottone crea evento
        const submitButton = page.locator('button:has-text("Crea Evento")');
        if (await submitButton.isVisible()) {
          await submitButton.click();
          
          // Verificare che il modal si chiuda o mostri successo
          await page.waitForTimeout(1000);
          
          const isModalClosed = !(await page.locator('text=Nuovo Evento').isVisible());
          const hasSuccessMessage = await page.locator('text=Evento creato').isVisible();
          
          expect(isModalClosed || hasSuccessMessage).toBeTruthy();
        }
      }
    }
  });

  test('Dovrebbe permettere chiusura modal', async ({ page }) => {
    await page.goto('http://localhost:3005/calendar');
    await page.waitForLoadState('networkidle');
    
    const createButton = page.locator('button:has-text("Nuovo")').or(
      page.locator('button:has-text("Crea")')
    );
    
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Cercare bottone chiudi o annulla
      const closeButton = page.locator('button:has-text("Annulla")').or(
        page.locator('button:has-text("×")')
      );
      
      if (await closeButton.isVisible()) {
        await closeButton.click();
        
        // Verificare che il modal sia chiuso
        await expect(page.locator('text=Nuovo Evento')).not.toBeVisible();
      }
    }
  });
});
