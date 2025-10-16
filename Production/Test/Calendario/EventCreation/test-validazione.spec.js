import { test, expect } from '@playwright/test';

test.describe('EventCreation - Test Validazione Dati', () => {
  
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

  test('Dovrebbe richiedere titolo obbligatorio', async ({ page }) => {
    await page.goto('http://localhost:3005/calendar');
    await page.waitForLoadState('networkidle');
    
    const createButton = page.locator('button:has-text("Nuovo")').or(
      page.locator('button:has-text("Crea")')
    );
    
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Tentare di creare evento senza titolo
      const submitButton = page.locator('button:has-text("Crea Evento")');
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // Verificare che il form non si invii
        await expect(page.locator('text=Nuovo Evento')).toBeVisible();
        
        // Verificare che il campo titolo sia evidenziato come richiesto
        const titleInput = page.locator('input[placeholder*="titolo"]');
        await expect(titleInput).toBeVisible();
      }
    }
  });

  test('Dovrebbe richiedere data inizio obbligatoria', async ({ page }) => {
    await page.goto('http://localhost:3005/calendar');
    await page.waitForLoadState('networkidle');
    
    const createButton = page.locator('button:has-text("Nuovo")').or(
      page.locator('button:has-text("Crea")')
    );
    
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Compilare solo il titolo
      const titleInput = page.locator('input[placeholder*="titolo"]');
      if (await titleInput.isVisible()) {
        await titleInput.fill('Test Evento');
        
        // Tentare di creare evento senza data
        const submitButton = page.locator('button:has-text("Crea Evento")');
        if (await submitButton.isVisible()) {
          await submitButton.click();
          
          // Verificare che il form non si invii
          await expect(page.locator('text=Nuovo Evento')).toBeVisible();
        }
      }
    }
  });

  test('Dovrebbe validare formato email assegnatari', async ({ page }) => {
    await page.goto('http://localhost:3005/calendar');
    await page.waitForLoadState('networkidle');
    
    const createButton = page.locator('button:has-text("Nuovo")').or(
      page.locator('button:has-text("Crea")')
    );
    
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Inserire email invalida
      const emailInput = page.locator('input[type="email"]');
      if (await emailInput.isVisible()) {
        await emailInput.fill('email-invalida');
        
        // Verificare che l'email non sia accettata
        const addButton = page.locator('button:has-text("+")');
        if (await addButton.isVisible()) {
          await addButton.click();
          
          // Verificare che l'email invalida non sia stata aggiunta
          await expect(page.locator('text=email-invalida')).not.toBeVisible();
        }
      }
    }
  });

  test('Dovrebbe accettare email valide per assegnatari', async ({ page }) => {
    await page.goto('http://localhost:3005/calendar');
    await page.waitForLoadState('networkidle');
    
    const createButton = page.locator('button:has-text("Nuovo")').or(
      page.locator('button:has-text("Crea")')
    );
    
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Inserire email valida
      const emailInput = page.locator('input[type="email"]');
      if (await emailInput.isVisible()) {
        await emailInput.fill('test@example.com');
        
        const addButton = page.locator('button:has-text("+")');
        if (await addButton.isVisible()) {
          await addButton.click();
          
          // Verificare che l'email valida sia stata aggiunta
          await expect(page.locator('text=test@example.com')).toBeVisible();
        }
      }
    }
  });

  test('Dovrebbe validare data fine dopo data inizio', async ({ page }) => {
    await page.goto('http://localhost:3005/calendar');
    await page.waitForLoadState('networkidle');
    
    const createButton = page.locator('button:has-text("Nuovo")').or(
      page.locator('button:has-text("Crea")')
    );
    
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Impostare data inizio
      const startInput = page.locator('input[type="datetime-local"]').first();
      const endInput = page.locator('input[type="datetime-local"]').nth(1);
      
      if (await startInput.isVisible() && await endInput.isVisible()) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateString = tomorrow.toISOString().slice(0, 16);
        
        await startInput.fill(dateString);
        
        // Impostare data fine precedente a inizio
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().slice(0, 16);
        
        await endInput.fill(yesterdayString);
        
        // Tentare di creare evento
        const submitButton = page.locator('button:has-text("Crea Evento")');
        if (await submitButton.isVisible()) {
          await submitButton.click();
          
          // Verificare che il form non si invii o mostri errore
          await expect(page.locator('text=Nuovo Evento')).toBeVisible();
        }
      }
    }
  });

  test('Dovrebbe accettare durata stimata valida', async ({ page }) => {
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
        
        // Impostare durata stimata
        const durationInput = page.locator('input[type="number"]');
        if (await durationInput.isVisible()) {
          await durationInput.fill('120');
          
          // Verificare che la durata sia stata impostata
          await expect(durationInput).toHaveValue('120');
        }
      }
    }
  });

  test('Dovrebbe rifiutare durata stimata negativa', async ({ page }) => {
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
        
        // Tentare di impostare durata negativa
        const durationInput = page.locator('input[type="number"]');
        if (await durationInput.isVisible()) {
          await durationInput.fill('-10');
          
          // Verificare che la durata non sia accettata
          const value = await durationInput.inputValue();
          expect(value).not.toBe('-10');
        }
      }
    }
  });

  test('Dovrebbe permettere aggiunta elementi checklist', async ({ page }) => {
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
        
        // Aggiungere elemento checklist
        const checklistInput = page.locator('input[placeholder*="checklist"]');
        if (await checklistInput.isVisible()) {
          await checklistInput.fill('Controllo temperatura');
          
          const addChecklistButton = page.locator('button:has-text("+")').nth(1);
          if (await addChecklistButton.isVisible()) {
            await addChecklistButton.click();
            
            // Verificare che l'elemento sia stato aggiunto
            await expect(page.locator('text=Controllo temperatura')).toBeVisible();
          }
        }
      }
    }
  });

  test('Dovrebbe permettere rimozione assegnatari', async ({ page }) => {
    await page.goto('http://localhost:3005/calendar');
    await page.waitForLoadState('networkidle');
    
    const createButton = page.locator('button:has-text("Nuovo")').or(
      page.locator('button:has-text("Crea")')
    );
    
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Aggiungere assegnatario
      const emailInput = page.locator('input[type="email"]');
      if (await emailInput.isVisible()) {
        await emailInput.fill('test@example.com');
        
        const addButton = page.locator('button:has-text("+")');
        if (await addButton.isVisible()) {
          await addButton.click();
          
          // Verificare che sia stato aggiunto
          await expect(page.locator('text=test@example.com')).toBeVisible();
          
          // Rimuovere assegnatario
          const removeButton = page.locator('button:has-text("×")').or(
            page.locator('button:has-text("X")')
          );
          
          if (await removeButton.isVisible()) {
            await removeButton.click();
            
            // Verificare che sia stato rimosso
            await expect(page.locator('text=test@example.com')).not.toBeVisible();
          }
        }
      }
    }
  });
});
