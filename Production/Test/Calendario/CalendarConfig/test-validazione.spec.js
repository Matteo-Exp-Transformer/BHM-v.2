import { test, expect } from '@playwright/test';

test.describe('CalendarConfigModal - Test Validazione Dati', () => {
  
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

  test('Dovrebbe accettare anno lavorativo valido', async ({ page }) => {
    await page.goto('http://localhost:3005/calendar');
    await page.waitForLoadState('networkidle');
    
    const configButton = page.locator('button:has-text("Configura")').or(
      page.locator('button:has-text("Impostazioni")')
    );
    
    if (await configButton.isVisible()) {
      await configButton.click();
      
      // Impostare date valide
      const startDateInput = page.locator('input[type="date"]').first();
      const endDateInput = page.locator('input[type="date"]').nth(1);
      
      if (await startDateInput.isVisible()) {
        await startDateInput.fill('2025-01-01');
        await endDateInput.fill('2025-12-31');
        
        // Verificare che non ci siano errori
        await expect(page.locator('text=errore')).not.toBeVisible();
        
        // Verificare che il riepilogo sia visibile
        await expect(page.locator('text=Riepilogo Anno Lavorativo')).toBeVisible();
      }
    }
  });

  test('Dovrebbe rifiutare data fine precedente a data inizio', async ({ page }) => {
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
        // Impostare date invalide (fine prima di inizio)
        await startDateInput.fill('2025-12-31');
        await endDateInput.fill('2025-01-01');
        
        // Verificare che appaia un errore
        await expect(page.locator('text=errore')).toBeVisible();
      }
    }
  });

  test('Dovrebbe richiedere almeno un giorno apertura settimanale', async ({ page }) => {
    await page.goto('http://localhost:3005/calendar');
    await page.waitForLoadState('networkidle');
    
    const configButton = page.locator('button:has-text("Configura")').or(
      page.locator('button:has-text("Impostazioni")')
    );
    
    if (await configButton.isVisible()) {
      await configButton.click();
      
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
  });

  test('Dovrebbe validare orari apertura', async ({ page }) => {
    await page.goto('http://localhost:3005/calendar');
    await page.waitForLoadState('networkidle');
    
    const configButton = page.locator('button:has-text("Configura")').or(
      page.locator('button:has-text("Impostazioni")')
    );
    
    if (await configButton.isVisible()) {
      await configButton.click();
      
      // Impostare anno lavorativo valido
      const startDateInput = page.locator('input[type="date"]').first();
      const endDateInput = page.locator('input[type="date"]').nth(1);
      
      if (await startDateInput.isVisible()) {
        await startDateInput.fill('2025-01-01');
        await endDateInput.fill('2025-12-31');
        
        // Selezionare almeno un giorno settimana
        const weekdayButton = page.locator('button:has-text("Lun")');
        if (await weekdayButton.isVisible()) {
          await weekdayButton.click();
          
          // Impostare orario apertura dopo chiusura
          const timeInputs = page.locator('input[type="time"]');
          if (await timeInputs.first().isVisible()) {
            await timeInputs.first().fill('18:00'); // Apertura
            await timeInputs.nth(1).fill('08:00');  // Chiusura (prima dell'apertura)
            
            // Verificare che appaia un errore
            await expect(page.locator('text=errore')).toBeVisible();
          }
        }
      }
    }
  });

  test('Dovrebbe accettare giorni chiusura validi', async ({ page }) => {
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
        
        // Aggiungere giorno chiusura valido
        const closureDateInput = page.locator('input[type="date"]').nth(2);
        if (await closureDateInput.isVisible()) {
          await closureDateInput.fill('2025-06-15');
          
          const addButton = page.locator('button:has-text("+")').or(
            page.locator('button:has-text("Aggiungi")')
          );
          
          if (await addButton.isVisible()) {
            await addButton.click();
            
            // Verificare che la data sia stata aggiunta senza errori
            await expect(page.locator('text=15/06/2025')).toBeVisible();
            await expect(page.locator('text=errore')).not.toBeVisible();
          }
        }
      }
    }
  });

  test('Dovrebbe rifiutare giorni chiusura fuori dall\'anno lavorativo', async ({ page }) => {
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
        
        // Tentare di aggiungere giorno chiusura fuori dall'anno
        const closureDateInput = page.locator('input[type="date"]').nth(2);
        if (await closureDateInput.isVisible()) {
          await closureDateInput.fill('2024-12-31'); // Fuori dall'anno lavorativo
          
          // Verificare che l'input abbia il valore corretto (dovrebbe essere limitato)
          const inputValue = await closureDateInput.inputValue();
          expect(inputValue).toBe('2025-01-01'); // Dovrebbe essere limitato alla data minima
        }
      }
    }
  });

  test('Dovrebbe permettere configurazione periodo chiusura', async ({ page }) => {
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
        
        // Cercare toggle per periodo
        const periodButton = page.locator('button:has-text("Periodo")');
        if (await periodButton.isVisible()) {
          await periodButton.click();
          
          // Impostare periodo chiusura
          const periodStartInput = page.locator('input[type="date"]').nth(2);
          const periodEndInput = page.locator('input[type="date"]').nth(3);
          
          if (await periodStartInput.isVisible()) {
            await periodStartInput.fill('2025-08-01');
            await periodEndInput.fill('2025-08-15');
            
            const addPeriodButton = page.locator('button:has-text("+")').or(
              page.locator('button:has-text("Aggiungi")')
            );
            
            if (await addPeriodButton.isVisible()) {
              await addPeriodButton.click();
              
              // Verificare che il periodo sia stato aggiunto
              await expect(page.locator('text=01/08/2025')).toBeVisible();
              await expect(page.locator('text=15/08/2025')).toBeVisible();
            }
          }
        }
      }
    }
  });

  test('Dovrebbe validare periodo chiusura (fine dopo inizio)', async ({ page }) => {
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
        
        // Selezionare modalità periodo
        const periodButton = page.locator('button:has-text("Periodo")');
        if (await periodButton.isVisible()) {
          await periodButton.click();
          
          // Impostare periodo invalido (fine prima di inizio)
          const periodStartInput = page.locator('input[type="date"]').nth(2);
          const periodEndInput = page.locator('input[type="date"]').nth(3);
          
          if (await periodStartInput.isVisible()) {
            await periodStartInput.fill('2025-08-15');
            await periodEndInput.fill('2025-08-01');
            
            // Verificare che appaia un errore
            await expect(page.locator('text=errore')).toBeVisible();
          }
        }
      }
    }
  });
});
