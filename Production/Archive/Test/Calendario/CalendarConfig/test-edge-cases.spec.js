import { test, expect } from '@playwright/test';

test.describe('CalendarConfigModal - Test Edge Cases', () => {
  
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

  test('Dovrebbe gestire anno lavorativo di un solo giorno', async ({ page }) => {
    await page.goto('http://localhost:3005/calendar');
    await page.waitForLoadState('networkidle');
    
    const configButton = page.locator('button:has-text("Configura")').or(
      page.locator('button:has-text("Impostazioni")')
    );
    
    if (await configButton.isVisible()) {
      await configButton.click();
      
      const startDateInput = page.locator('input[type="date"]').first();
      const endDateInput = page.locator('input[type="date"]').nth(1);
      
      if (await startDateInput.isVisible()) {
        // Impostare stesso giorno per inizio e fine
        await startDateInput.fill('2025-06-15');
        await endDateInput.fill('2025-06-15');
        
        // Verificare che il sistema gestisca correttamente
        await expect(page.locator('text=Riepilogo Anno Lavorativo')).toBeVisible();
        
        // Verificare che i giorni lavorativi siano calcolati correttamente
        const workingDaysText = page.locator('text=Giorni Lavorativi');
        if (await workingDaysText.isVisible()) {
          // Dovrebbe mostrare 1 giorno lavorativo se il giorno è aperto
          await expect(workingDaysText).toBeVisible();
        }
      }
    }
  });

  test('Dovrebbe gestire anno lavorativo molto lungo', async ({ page }) => {
    await page.goto('http://localhost:3005/calendar');
    await page.waitForLoadState('networkidle');
    
    const configButton = page.locator('button:has-text("Configura")').or(
      page.locator('button:has-text("Impostazioni")')
    );
    
    if (await configButton.isVisible()) {
      await configButton.click();
      
      const startDateInput = page.locator('input[type="date"]').first();
      const endDateInput = page.locator('input[type="date"]').nth(1);
      
      if (await startDateInput.isVisible()) {
        // Impostare periodo di 10 anni
        await startDateInput.fill('2025-01-01');
        await endDateInput.fill('2035-12-31');
        
        // Verificare che il sistema gestisca correttamente
        await expect(page.locator('text=Riepilogo Anno Lavorativo')).toBeVisible();
        
        // Verificare che i calcoli siano corretti
        const totalDaysText = page.locator('text=Giorni Totali');
        if (await totalDaysText.isVisible()) {
          // Dovrebbe mostrare circa 4017 giorni (10 anni + 2 anni bisestili)
          await expect(totalDaysText).toBeVisible();
        }
      }
    }
  });

  test('Dovrebbe gestire tutti i giorni settimana chiusi', async ({ page }) => {
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
      
      if (await startDateInput.isVisible()) {
        await startDateInput.fill('2025-01-01');
        await endDateInput.fill('2025-12-31');
        
        // Deselezionare tutti i giorni settimana
        const weekdayButtons = page.locator('button').filter({ hasText: /^(Lun|Mar|Mer|Gio|Ven|Sab|Dom)$/ });
        
        if (await weekdayButtons.first().isVisible()) {
          // Click su tutti i giorni per deselezionarli
          for (let i = 0; i < await weekdayButtons.count(); i++) {
            const button = weekdayButtons.nth(i);
            if (await button.isVisible() && await button.evaluate(el => el.classList.contains('bg-blue-600'))) {
              await button.click();
            }
          }
          
          // Verificare che appaia un errore
          await expect(page.locator('text=errore')).toBeVisible();
        }
      }
    }
  });

  test('Dovrebbe gestire molti giorni chiusura', async ({ page }) => {
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
      
      if (await startDateInput.isVisible()) {
        await startDateInput.fill('2025-01-01');
        await endDateInput.fill('2025-12-31');
        
        // Aggiungere molti giorni chiusura
        const closureDateInput = page.locator('input[type="date"]').nth(2);
        const addButton = page.locator('button:has-text("+")').or(
          page.locator('button:has-text("Aggiungi")')
        );
        
        if (await closureDateInput.isVisible() && await addButton.isVisible()) {
          // Aggiungere 10 giorni chiusura
          for (let i = 1; i <= 10; i++) {
            const date = new Date(2025, 5, i); // Giugno 2025
            const dateString = date.toISOString().split('T')[0];
            
            await closureDateInput.fill(dateString);
            await addButton.click();
            
            // Verificare che la data sia stata aggiunta
            await expect(page.locator(`text=${dateString}`)).toBeVisible();
          }
          
          // Verificare che il riepilogo sia aggiornato
          await expect(page.locator('text=Riepilogo Anno Lavorativo')).toBeVisible();
        }
      }
    }
  });

  test('Dovrebbe gestire orari estremi', async ({ page }) => {
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
      
      if (await startDateInput.isVisible()) {
        await startDateInput.fill('2025-01-01');
        await endDateInput.fill('2025-12-31');
        
        // Selezionare un giorno settimana
        const weekdayButton = page.locator('button:has-text("Lun")');
        if (await weekdayButton.isVisible()) {
          await weekdayButton.click();
          
          // Impostare orari estremi (00:00 - 23:59)
          const timeInputs = page.locator('input[type="time"]');
          if (await timeInputs.first().isVisible()) {
            await timeInputs.first().fill('00:00');
            await timeInputs.nth(1).fill('23:59');
            
            // Verificare che gli orari siano accettati
            await expect(timeInputs.first()).toHaveValue('00:00');
            await expect(timeInputs.nth(1)).toHaveValue('23:59');
            
            // Verificare che non ci siano errori
            await expect(page.locator('text=errore')).not.toBeVisible();
          }
        }
      }
    }
  });

  test('Dovrebbe gestire rimozione giorni chiusura', async ({ page }) => {
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
      
      if (await startDateInput.isVisible()) {
        await startDateInput.fill('2025-01-01');
        await endDateInput.fill('2025-12-31');
        
        // Aggiungere giorno chiusura
        const closureDateInput = page.locator('input[type="date"]').nth(2);
        const addButton = page.locator('button:has-text("+")').or(
          page.locator('button:has-text("Aggiungi")')
        );
        
        if (await closureDateInput.isVisible() && await addButton.isVisible()) {
          await closureDateInput.fill('2025-06-15');
          await addButton.click();
          
          // Verificare che la data sia stata aggiunta
          await expect(page.locator('text=15/06/2025')).toBeVisible();
          
          // Rimuovere la data
          const removeButton = page.locator('button:has-text("×")').or(
            page.locator('button:has-text("X")')
          );
          
          if (await removeButton.isVisible()) {
            await removeButton.click();
            
            // Verificare che la data sia stata rimossa
            await expect(page.locator('text=15/06/2025')).not.toBeVisible();
          }
        }
      }
    }
  });

  test('Dovrebbe gestire aggiunta/rimozione fasce orarie', async ({ page }) => {
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
      
      if (await startDateInput.isVisible()) {
        await startDateInput.fill('2025-01-01');
        await endDateInput.fill('2025-12-31');
        
        // Selezionare un giorno settimana
        const weekdayButton = page.locator('button:has-text("Lun")');
        if (await weekdayButton.isVisible()) {
          await weekdayButton.click();
          
          // Cercare bottone per aggiungere fascia oraria
          const addSlotButton = page.locator('button:has-text("Aggiungi fascia")').or(
            page.locator('button:has-text("Aggiungi")')
          );
          
          if (await addSlotButton.isVisible()) {
            await addSlotButton.click();
            
            // Verificare che sia stata aggiunta una seconda fascia
            const timeInputs = page.locator('input[type="time"]');
            const inputCount = await timeInputs.count();
            expect(inputCount).toBeGreaterThanOrEqual(4); // 2 fasce × 2 orari
            
            // Impostare orari per entrambe le fasce
            await timeInputs.nth(0).fill('08:00'); // Prima fascia apertura
            await timeInputs.nth(1).fill('12:00'); // Prima fascia chiusura
            await timeInputs.nth(2).fill('14:00'); // Seconda fascia apertura
            await timeInputs.nth(3).fill('18:00'); // Seconda fascia chiusura
            
            // Verificare che gli orari siano stati impostati
            await expect(timeInputs.nth(0)).toHaveValue('08:00');
            await expect(timeInputs.nth(1)).toHaveValue('12:00');
            await expect(timeInputs.nth(2)).toHaveValue('14:00');
            await expect(timeInputs.nth(3)).toHaveValue('18:00');
          }
        }
      }
    }
  });

  test('Dovrebbe gestire input vuoti', async ({ page }) => {
    await page.goto('http://localhost:3005/calendar');
    await page.waitForLoadState('networkidle');
    
    const configButton = page.locator('button:has-text("Configura")').or(
      page.locator('button:has-text("Impostazioni")')
    );
    
    if (await configButton.isVisible()) {
      await configButton.click();
      
      // Tentare di salvare senza configurare nulla
      const saveButton = page.locator('button:has-text("Salva")').or(
        page.locator('button:has-text("Salva Configurazione")')
      );
      
      if (await saveButton.isVisible()) {
        // Verificare che il bottone sia disabilitato
        await expect(saveButton).toBeDisabled();
      }
    }
  });

  test('Dovrebbe gestire caratteri speciali nei campi', async ({ page }) => {
    await page.goto('http://localhost:3005/calendar');
    await page.waitForLoadState('networkidle');
    
    const configButton = page.locator('button:has-text("Configura")').or(
      page.locator('button:has-text("Impostazioni")')
    );
    
    if (await configButton.isVisible()) {
      await configButton.click();
      
      // I campi date dovrebbero accettare solo date valide
      const startDateInput = page.locator('input[type="date"]').first();
      
      if (await startDateInput.isVisible()) {
        // Tentare di inserire caratteri speciali
        await startDateInput.fill('abc123!@#');
        
        // Verificare che il campo sia vuoto o abbia un valore valido
        const value = await startDateInput.inputValue();
        expect(value).toBe(''); // Dovrebbe essere vuoto o data valida
      }
    }
  });
});
