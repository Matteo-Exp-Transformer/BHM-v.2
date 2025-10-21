import { test, expect } from '@playwright/test';

test.describe('EventCreation - Test Edge Cases', () => {
  
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

  test('Dovrebbe gestire titolo molto lungo', async ({ page }) => {
    await page.goto('http://localhost:3005/calendar');
    await page.waitForLoadState('networkidle');
    
    const createButton = page.locator('button:has-text("Nuovo")').or(
      page.locator('button:has-text("Crea")')
    );
    
    if (await createButton.isVisible()) {
      await createButton.click();
      
      const titleInput = page.locator('input[placeholder*="titolo"]');
      if (await titleInput.isVisible()) {
        const longTitle = 'A'.repeat(1000);
        await titleInput.fill(longTitle);
        
        // Verificare che il sistema gestisca correttamente
        await expect(titleInput).toBeVisible();
        
        // Verificare che il titolo sia stato inserito (troncato o completo)
        const value = await titleInput.inputValue();
        expect(value.length).toBeGreaterThan(0);
      }
    }
  });

  test('Dovrebbe gestire descrizione molto lunga', async ({ page }) => {
    await page.goto('http://localhost:3005/calendar');
    await page.waitForLoadState('networkidle');
    
    const createButton = page.locator('button:has-text("Nuovo")').or(
      page.locator('button:has-text("Crea")')
    );
    
    if (await createButton.isVisible()) {
      await createButton.click();
      
      const descInput = page.locator('textarea[placeholder*="descrizione"]');
      if (await descInput.isVisible()) {
        const longDesc = 'B'.repeat(5000);
        await descInput.fill(longDesc);
        
        // Verificare che il sistema gestisca correttamente
        await expect(descInput).toBeVisible();
        
        // Verificare che la descrizione sia stata inserita
        const value = await descInput.inputValue();
        expect(value.length).toBeGreaterThan(0);
      }
    }
  });

  test('Dovrebbe gestire caratteri speciali nel titolo', async ({ page }) => {
    await page.goto('http://localhost:3005/calendar');
    await page.waitForLoadState('networkidle');
    
    const createButton = page.locator('button:has-text("Nuovo")').or(
      page.locator('button:has-text("Crea")')
    );
    
    if (await createButton.isVisible()) {
      await createButton.click();
      
      const titleInput = page.locator('input[placeholder*="titolo"]');
      if (await titleInput.isVisible()) {
        const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        await titleInput.fill(specialChars);
        
        // Verificare che i caratteri speciali siano gestiti
        await expect(titleInput).toBeVisible();
        await expect(titleInput).toHaveValue(specialChars);
      }
    }
  });

  test('Dovrebbe gestire date molto lontane nel futuro', async ({ page }) => {
    await page.goto('http://localhost:3005/calendar');
    await page.waitForLoadState('networkidle');
    
    const createButton = page.locator('button:has-text("Nuovo")').or(
      page.locator('button:has-text("Crea")')
    );
    
    if (await createButton.isVisible()) {
      await createButton.click();
      
      const startInput = page.locator('input[type="datetime-local"]').first();
      if (await startInput.isVisible()) {
        // Impostare data 10 anni nel futuro
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 10);
        const dateString = futureDate.toISOString().slice(0, 16);
        
        await startInput.fill(dateString);
        
        // Verificare che la data sia stata accettata
        await expect(startInput).toHaveValue(dateString);
      }
    }
  });

  test('Dovrebbe gestire date nel passato', async ({ page }) => {
    await page.goto('http://localhost:3005/calendar');
    await page.waitForLoadState('networkidle');
    
    const createButton = page.locator('button:has-text("Nuovo")').or(
      page.locator('button:has-text("Crea")')
    );
    
    if (await createButton.isVisible()) {
      await createButton.click();
      
      const startInput = page.locator('input[type="datetime-local"]').first();
      if (await startInput.isVisible()) {
        // Impostare data nel passato
        const pastDate = new Date();
        pastDate.setFullYear(pastDate.getFullYear() - 1);
        const dateString = pastDate.toISOString().slice(0, 16);
        
        await startInput.fill(dateString);
        
        // Verificare che la data sia stata accettata (potrebbe essere valida per eventi storici)
        await expect(startInput).toHaveValue(dateString);
      }
    }
  });

  test('Dovrebbe gestire molti assegnatari', async ({ page }) => {
    await page.goto('http://localhost:3005/calendar');
    await page.waitForLoadState('networkidle');
    
    const createButton = page.locator('button:has-text("Nuovo")').or(
      page.locator('button:has-text("Crea")')
    );
    
    if (await createButton.isVisible()) {
      await createButton.click();
      
      const emailInput = page.locator('input[type="email"]');
      const addButton = page.locator('button:has-text("+")');
      
      if (await emailInput.isVisible() && await addButton.isVisible()) {
        // Aggiungere 10 assegnatari
        for (let i = 1; i <= 10; i++) {
          await emailInput.fill(`user${i}@example.com`);
          await addButton.click();
          
          // Verificare che sia stato aggiunto
          await expect(page.locator(`text=user${i}@example.com`)).toBeVisible();
        }
        
        // Verificare che tutti siano presenti
        await expect(page.locator('text=10 assegnatari')).toBeVisible();
      }
    }
  });

  test('Dovrebbe gestire molti elementi checklist', async ({ page }) => {
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
        
        const checklistInput = page.locator('input[placeholder*="checklist"]');
        const addChecklistButton = page.locator('button:has-text("+")').nth(1);
        
        if (await checklistInput.isVisible() && await addChecklistButton.isVisible()) {
          // Aggiungere 20 elementi checklist
          for (let i = 1; i <= 20; i++) {
            await checklistInput.fill(`Elemento ${i}`);
            await addChecklistButton.click();
            
            // Verificare che sia stato aggiunto
            await expect(page.locator(`text=Elemento ${i}`)).toBeVisible();
          }
        }
      }
    }
  });

  test('Dovrebbe gestire durata stimata molto alta', async ({ page }) => {
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
        
        const durationInput = page.locator('input[type="number"]');
        if (await durationInput.isVisible()) {
          // Impostare durata molto alta (24 ore = 1440 minuti)
          await durationInput.fill('1440');
          
          // Verificare che la durata sia stata accettata
          await expect(durationInput).toHaveValue('1440');
        }
      }
    }
  });

  test('Dovrebbe gestire rimozione elementi checklist', async ({ page }) => {
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
        
        const checklistInput = page.locator('input[placeholder*="checklist"]');
        const addChecklistButton = page.locator('button:has-text("+")').nth(1);
        
        if (await checklistInput.isVisible() && await addChecklistButton.isVisible()) {
          // Aggiungere alcuni elementi
          await checklistInput.fill('Elemento 1');
          await addChecklistButton.click();
          await checklistInput.fill('Elemento 2');
          await addChecklistButton.click();
          
          // Verificare che siano stati aggiunti
          await expect(page.locator('text=Elemento 1')).toBeVisible();
          await expect(page.locator('text=Elemento 2')).toBeVisible();
          
          // Rimuovere il primo elemento
          const removeButtons = page.locator('button:has-text("×")').or(
            page.locator('button:has-text("X")')
          );
          
          if (await removeButtons.nth(1).isVisible()) {
            await removeButtons.nth(1).click();
            
            // Verificare che il primo elemento sia stato rimosso
            await expect(page.locator('text=Elemento 1')).not.toBeVisible();
            await expect(page.locator('text=Elemento 2')).toBeVisible();
          }
        }
      }
    }
  });

  test('Dovrebbe gestire input vuoti', async ({ page }) => {
    await page.goto('http://localhost:3005/calendar');
    await page.waitForLoadState('networkidle');
    
    const createButton = page.locator('button:has-text("Nuovo")').or(
      page.locator('button:has-text("Crea")')
    );
    
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Tentare di creare evento senza compilare nulla
      const submitButton = page.locator('button:has-text("Crea Evento")');
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // Verificare che il modal rimanga aperto
        await expect(page.locator('text=Nuovo Evento')).toBeVisible();
      }
    }
  });

  test('Dovrebbe gestire cambio tipo evento', async ({ page }) => {
    await page.goto('http://localhost:3005/calendar');
    await page.waitForLoadState('networkidle');
    
    const createButton = page.locator('button:has-text("Nuovo")').or(
      page.locator('button:has-text("Crea")')
    );
    
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Selezionare prima manutenzione
      const maintenanceButton = page.locator('button:has-text("Manutenzione")');
      if (await maintenanceButton.isVisible()) {
        await maintenanceButton.click();
        
        // Verificare che appaiano i campi manutenzione
        await expect(page.locator('text=Frequenza')).toBeVisible();
        
        // Cambiare a tipo personalizzato
        const customButton = page.locator('button:has-text("Personalizzato")');
        if (await customButton.isVisible()) {
          await customButton.click();
          
          // Verificare che i campi manutenzione scompaiano
          await expect(page.locator('text=Frequenza')).not.toBeVisible();
          
          // Verificare che appaiano i campi personalizzato
          await expect(page.locator('text=Dettagli Evento Personalizzato')).toBeVisible();
        }
      }
    }
  });
});
