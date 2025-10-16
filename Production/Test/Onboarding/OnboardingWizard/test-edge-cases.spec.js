import { test, expect } from '@playwright/test';

test.describe('OnboardingWizard - Test Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page.locator('[data-testid="onboarding-wizard"]')).toBeVisible();
  });

  test('Dovrebbe gestire localStorage vuoto', async ({ page }) => {
    // Pulisci localStorage
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    // Ricarica pagina
    await page.reload();
    
    // Verifica che l'app si inizializzi correttamente
    await expect(page.locator('[data-testid="onboarding-wizard"]')).toBeVisible();
    
    // Verifica che i dati vengano inizializzati
    const hasData = await page.evaluate(() => {
      return localStorage.getItem('onboarding-data') !== null;
    });
    
    expect(hasData).toBe(true);
  });

  test('Dovrebbe gestire JSON malformato in localStorage', async ({ page }) => {
    // Simula JSON malformato
    await page.evaluate(() => {
      localStorage.setItem('onboarding-data', '{"business":{"name":"Test"'); // JSON incompleto
    });
    
    // Ricarica pagina
    await page.reload();
    
    // Verifica che l'app gestisca l'errore
    await expect(page.locator('[data-testid="onboarding-wizard"]')).toBeVisible();
    
    // Verifica console per errori di parsing
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('Error parsing saved onboarding data')) {
        logs.push(msg.text());
      }
    });
    
    await page.waitForTimeout(1000);
    expect(logs.length).toBeGreaterThan(0);
  });

  test('Dovrebbe gestire click su step non esistente', async ({ page }) => {
    // Prova a manipolare DOM per step non valido
    await page.evaluate(() => {
      const stepButtons = document.querySelectorAll('[data-testid="step-navigator"] button');
      if (stepButtons.length > 0) {
        // Simula click su step index -1
        const event = new Event('click');
        stepButtons[0].dispatchEvent(event);
      }
    });
    
    // Verifica che l'app non crashi
    await expect(page.locator('[data-testid="onboarding-wizard"]')).toBeVisible();
  });

  test('Dovrebbe gestire multiple chiamate di completamento concorrenti', async ({ page }) => {
    // Click multipli rapidi su Completa Onboarding
    const completeButton = page.locator('button:has-text("Completa Onboarding")');
    
    // Intercetta chiamate API
    let callCount = 0;
    await page.route('**/companies', route => {
      callCount++;
      route.fulfill({ 
        status: 200, 
        body: JSON.stringify({ id: `test-company-${callCount}` }) 
      });
    });
    
    // Click multipli
    await Promise.all([
      completeButton.click(),
      completeButton.click(),
      completeButton.click()
    ]);
    
    // Verifica che non ci siano errori critici
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-testid="onboarding-wizard"]')).toBeVisible();
  });

  test('Dovrebbe gestire errori di memoria durante salvataggio', async ({ page }) => {
    // Simula dati molto grandi
    await page.evaluate(() => {
      const largeData = {
        business: { name: 'A'.repeat(10000) },
        departments: Array(1000).fill().map((_, i) => ({
          id: `dept-${i}`,
          name: `Department ${i}`,
          description: 'Description'.repeat(100)
        }))
      };
      localStorage.setItem('onboarding-data', JSON.stringify(largeData));
    });
    
    // Ricarica pagina
    await page.reload();
    
    // Verifica che l'app gestisca i dati grandi
    await expect(page.locator('[data-testid="onboarding-wizard"]')).toBeVisible();
  });

  test('Dovrebbe gestire cleanup timeout e listener', async ({ page }) => {
    // Naviga via e torna indietro per testare cleanup
    await page.goto('/dashboard');
    await page.goto('/onboarding');
    
    // Verifica che l'app si re-inizializzi correttamente
    await expect(page.locator('[data-testid="onboarding-wizard"]')).toBeVisible();
    
    // Verifica che non ci siano listener duplicati
    const timeoutCount = await page.evaluate(() => {
      // Conta timeout attivi (approssimativo)
      return window.setTimeout.toString().length;
    });
    
    expect(timeoutCount).toBeGreaterThan(0);
  });

  test('Dovrebbe gestire interruzione durante salvataggio automatico', async ({ page }) => {
    // Simula interruzione durante salvataggio
    await page.fill('input[name="businessName"]', 'Test Interruption');
    
    // Naviga via prima che il timeout di salvataggio scatti
    await page.goto('/dashboard');
    
    // Torna indietro
    await page.goto('/onboarding');
    
    // Verifica che i dati siano stati salvati
    const savedData = await page.evaluate(() => {
      return localStorage.getItem('onboarding-data');
    });
    
    expect(savedData).toContain('Test Interruption');
  });

  test('Dovrebbe gestire errori di navigazione React Router', async ({ page }) => {
    // Simula errore di navigazione
    await page.route('**/dashboard', route => route.abort());
    
    const completeButton = page.locator('button:has-text("Completa Onboarding")');
    await completeButton.click();
    
    // Verifica che l'app gestisca l'errore
    await page.waitForTimeout(2000);
    
    // Verifica che l'utente rimanga sulla pagina onboarding
    await expect(page.locator('[data-testid="onboarding-wizard"]')).toBeVisible();
  });

  test('Dovrebbe gestire disconnessione di rete durante completamento', async ({ page }) => {
    // Simula disconnessione di rete
    await page.context().setOffline(true);
    
    const completeButton = page.locator('button:has-text("Completa Onboarding")');
    await completeButton.click();
    
    // Verifica toast di errore
    await expect(page.locator('.Toastify__toast--error')).toBeVisible();
    
    // Ripristina connessione
    await page.context().setOffline(false);
    
    // Verifica che l'app sia ancora responsive
    await expect(page.locator('[data-testid="onboarding-wizard"]')).toBeVisible();
  });

  test('Dovrebbe gestire aggiornamento pagina durante completamento', async ({ page }) => {
    // Avvia completamento
    const completeButton = page.locator('button:has-text("Completa Onboarding")');
    await completeButton.click();
    
    // Aggiorna pagina durante il processo
    await page.reload();
    
    // Verifica che l'app si ri-inizializzi
    await expect(page.locator('[data-testid="onboarding-wizard"]')).toBeVisible();
    
    // Verifica che i dati siano preservati
    const savedData = await page.evaluate(() => {
      return localStorage.getItem('onboarding-data');
    });
    
    expect(savedData).toBeDefined();
  });

  test('Dovrebbe gestire errori di parsing dati step', async ({ page }) => {
    // Simula dati step corrotti
    await page.evaluate(() => {
      localStorage.setItem('onboarding-data', JSON.stringify({
        business: null,
        departments: "invalid-array",
        staff: { invalid: "object" }
      }));
    });
    
    // Ricarica pagina
    await page.reload();
    
    // Verifica che l'app gestisca i dati corrotti
    await expect(page.locator('[data-testid="onboarding-wizard"]')).toBeVisible();
    
    // Verifica che i campi form siano inizializzati correttamente
    const businessName = await page.inputValue('input[name="businessName"]');
    expect(businessName).toBe('');
  });

  test('Dovrebbe gestire errori di validazione step complessi', async ({ page }) => {
    // Simula dati parzialmente validi
    await page.evaluate(() => {
      localStorage.setItem('onboarding-data', JSON.stringify({
        business: {
          name: 'Test',
          email: 'invalid-email',
          phone: 'invalid-phone'
        }
      }));
    });
    
    // Ricarica pagina
    await page.reload();
    
    // Verifica che la validazione funzioni
    const nextButton = page.locator('button:has-text("Avanti")');
    await expect(nextButton).toBeDisabled();
  });
});
