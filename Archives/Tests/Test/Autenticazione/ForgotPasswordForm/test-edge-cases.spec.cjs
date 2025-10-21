const { test, expect } = require('@playwright/test');

test.describe('ForgotPasswordForm - Test Edge Cases', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3006/forgot-password');
    await expect(page.locator('form')).toBeVisible();
  });

  test('Dovrebbe gestire stringhe molto lunghe', async ({ page }) => {
    const longString = 'a'.repeat(1000);
    const longEmail = longString + '@example.com';
    
    // Test con email molto lunga
    await page.fill('input[name="email"]', longEmail);
    
    // Verificare che il valore sia accettato
    await expect(page.locator('input[name="email"]')).toHaveValue(longEmail);
    
    // Verificare che il form non craschi
    await expect(page.locator('form')).toBeVisible();
    
    // Tentare submit
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Verificare che non ci siano errori JavaScript
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(1000);
    expect(consoleErrors.length).toBe(0);
  });

  test('Dovrebbe gestire caratteri speciali', async ({ page }) => {
    const specialChars = [
      '!@#$%^&*()_+-=[]{}|;:,.<>?',
      '🚀🎉✅',
      'αβγδε',
      'àèéìòù',
      'ñçü',
      '中文',
      'العربية',
      'русский'
    ];
    
    for (const chars of specialChars) {
      // Test email con caratteri speciali
      const specialEmail = chars + '@example.com';
      await page.fill('input[name="email"]', specialEmail);
      await expect(page.locator('input[name="email"]')).toHaveValue(specialEmail);
      
      // Verificare che il form non craschi
      await expect(page.locator('form')).toBeVisible();
    }
  });

  test('Dovrebbe gestire tentativi SQL injection', async ({ page }) => {
    const sqlInjections = [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "' OR 1=1 --",
      "admin'--",
      "admin'/*",
      "' UNION SELECT * FROM users --",
      "'; INSERT INTO users VALUES ('hacker', 'password'); --"
    ];
    
    for (const injection of sqlInjections) {
      // Test email con SQL injection
      const maliciousEmail = injection + '@example.com';
      await page.fill('input[name="email"]', maliciousEmail);
      await expect(page.locator('input[name="email"]')).toHaveValue(maliciousEmail);
      
      // Verificare che il form non craschi
      await expect(page.locator('form')).toBeVisible();
      
      // Tentare submit
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      // Verificare che non ci siano errori di sicurezza
      await expect(page.locator('form')).toBeVisible();
    }
  });

  test('Dovrebbe gestire tentativi XSS', async ({ page }) => {
    const xssAttempts = [
      "<script>alert('xss')</script>",
      "<img src=x onerror=alert(1)>",
      "javascript:alert(1)",
      "<iframe src=javascript:alert(1)></iframe>",
      "<svg onload=alert(1)>",
      "';alert(1);//",
      "<script>document.location='http://evil.com'</script>"
    ];
    
    for (const xss of xssAttempts) {
      // Test email con XSS
      const maliciousEmail = xss + '@example.com';
      await page.fill('input[name="email"]', maliciousEmail);
      await expect(page.locator('input[name="email"]')).toHaveValue(maliciousEmail);
      
      // Verificare che il form non craschi e non esegua script
      await expect(page.locator('form')).toBeVisible();
      
      // Verificare che non ci siano popup o redirect
      const popupPromise = page.waitForEvent('popup', { timeout: 1000 }).catch(() => null);
      await page.waitForTimeout(500);
      const popup = await popupPromise;
      expect(popup).toBeNull();
    }
  });

  test('Dovrebbe gestire valori null e undefined', async ({ page }) => {
    // Test con valori null tramite JavaScript
    await page.evaluate(() => {
      const emailInput = document.querySelector('input[name="email"]');
      if (emailInput) emailInput.value = null;
    });
    
    // Verificare che il campo sia gestito correttamente
    await expect(page.locator('input[name="email"]')).toHaveValue('');
    
    // Test con undefined
    await page.evaluate(() => {
      const emailInput = document.querySelector('input[name="email"]');
      if (emailInput) emailInput.value = undefined;
    });
    
    // Verificare che il campo sia gestito correttamente
    await expect(page.locator('input[name="email"]')).toHaveValue('');
  });

  test('Dovrebbe gestire numeri come input', async ({ page }) => {
    const numbers = [
      '123456789',
      '0',
      '-1',
      '3.14159',
      '1e10',
      'Infinity',
      'NaN'
    ];
    
    for (const num of numbers) {
      // Test email con numeri
      const numericEmail = num + '@example.com';
      await page.fill('input[name="email"]', numericEmail);
      await expect(page.locator('input[name="email"]')).toHaveValue(numericEmail);
      
      // Verificare che il form non craschi
      await expect(page.locator('form')).toBeVisible();
    }
  });

  test('Dovrebbe gestire input molto rapidi (rapid typing)', async ({ page }) => {
    // Simulare digitazione molto rapida
    const rapidText = 'mario@example.com';
    
    // Digitare carattere per carattere molto velocemente
    for (let i = 0; i < rapidText.length; i++) {
      await page.locator('input[name="email"]').type(rapidText[i], { delay: 10 });
    }
    
    await expect(page.locator('input[name="email"]')).toHaveValue(rapidText);
    
    // Verificare che il form funzioni ancora
    await expect(page.locator('form')).toBeVisible();
  });

  test('Dovrebbe gestire click multipli rapidi su submit', async ({ page }) => {
    // Compilare form
    await page.fill('input[name="email"]', 'mario@example.com');
    
    // Intercettare la chiamata API per simulare delay
    await page.route('**/auth/v1/recover', async route => {
      // Simulare delay di 3 secondi
      await new Promise(resolve => setTimeout(resolve, 3000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Password reset email sent' })
      });
    });
    
    const submitButton = page.locator('button[type="submit"]');
    
    // Click multipli rapidi
    await submitButton.click();
    await submitButton.click();
    await submitButton.click();
    
    // Verificare che il bottone sia disabled dopo il primo click
    await expect(submitButton).toBeDisabled();
    
    // Verificare che non ci siano errori JavaScript
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(4000);
    expect(consoleErrors.length).toBe(0);
  });

  test('Dovrebbe gestire resize della finestra', async ({ page }) => {
    // Test con diverse dimensioni di finestra
    const sizes = [
      { width: 320, height: 568 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1920, height: 1080 } // Desktop
    ];
    
    for (const size of sizes) {
      await page.setViewportSize(size);
      
      // Verificare che il form sia ancora visibile e funzionante
      await expect(page.locator('form')).toBeVisible();
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      
      // Test funzionalità dopo resize
      await page.fill('input[name="email"]', 'mario@example.com');
      await expect(page.locator('input[name="email"]')).toHaveValue('mario@example.com');
    }
  });

  test('Dovrebbe gestire navigazione rapida tra pagine', async ({ page }) => {
    // Navigare rapidamente tra pagine
    await page.goto('http://localhost:3006/sign-in');
    await page.goto('http://localhost:3006/forgot-password');
    await page.goto('http://localhost:3006/');
    await page.goto('http://localhost:3006/forgot-password');
    
    // Verificare che il form sia ancora funzionante
    await expect(page.locator('form')).toBeVisible();
    await page.fill('input[name="email"]', 'mario@example.com');
    await expect(page.locator('input[name="email"]')).toHaveValue('mario@example.com');
  });

  test('Dovrebbe gestire interruzioni di rete', async ({ page }) => {
    // Simulare interruzione di rete
    await page.context().setOffline(true);
    
    // Compilare form
    await page.fill('input[name="email"]', 'mario@example.com');
    
    // Tentare submit
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Verificare che il form gestisca l'errore
    await page.waitForTimeout(2000);
    
    // Ripristinare connessione
    await page.context().setOffline(false);
    
    // Verificare che il form sia ancora funzionante
    await expect(page.locator('form')).toBeVisible();
  });

  test('Dovrebbe gestire timeout della richiesta', async ({ page }) => {
    // Intercettare la chiamata API per simulare timeout
    await page.route('**/auth/v1/recover', async route => {
      // Simulare timeout molto lungo
      await new Promise(resolve => setTimeout(resolve, 10000));
      await route.continue();
    });
    
    // Compilare form
    await page.fill('input[name="email"]', 'mario@example.com');
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Verificare loading state
    await expect(submitButton).toBeDisabled();
    await expect(submitButton).toContainText('Invio in corso...');
    
    // Aspettare un po' e verificare che il form sia ancora responsive
    await page.waitForTimeout(2000);
    await expect(page.locator('form')).toBeVisible();
  });
});
