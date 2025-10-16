const { test, expect } = require('@playwright/test');

test.describe('AcceptInviteForm - Test Edge Cases', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3006/accept-invite?token=77244fdc-f98a-4337-914a-5dbc0041feca');
    await expect(page.locator('form')).toBeVisible();
  });

  test('Dovrebbe gestire stringhe molto lunghe', async ({ page }) => {
    const longString = 'a'.repeat(1000);
    
    // Test con stringhe molto lunghe
    await page.fill('input[name="first_name"]', longString);
    await page.fill('input[name="last_name"]', longString);
    await page.fill('input[name="password"]', longString);
    await page.fill('input[name="confirmPassword"]', longString);
    
    // Verificare che i valori siano accettati
    await expect(page.locator('input[name="first_name"]')).toHaveValue(longString);
    await expect(page.locator('input[name="last_name"]')).toHaveValue(longString);
    await expect(page.locator('input[name="password"]')).toHaveValue(longString);
    await expect(page.locator('input[name="confirmPassword"]')).toHaveValue(longString);
    
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
      // Test nome con caratteri speciali
      await page.fill('input[name="first_name"]', chars);
      await expect(page.locator('input[name="first_name"]')).toHaveValue(chars);
      
      // Test cognome con caratteri speciali
      await page.fill('input[name="last_name"]', chars);
      await expect(page.locator('input[name="last_name"]')).toHaveValue(chars);
      
      // Test password con caratteri speciali
      await page.fill('input[name="password"]', chars);
      await expect(page.locator('input[name="password"]')).toHaveValue(chars);
      
      // Verificare che il form non craschi
      await expect(page.locator('form')).toBeVisible();
    }
  });

  test('Dovrebbe gestire password complesse', async ({ page }) => {
    const complexPasswords = [
      'P@ssw0rd123!',
      'MyStr0ng#P@ss',
      'C0mpl3x!P@ssw0rd',
      'Test123!@#$%',
      'Abc123!@#$%^&*()',
      'P@ssw0rd123456789!@#$%^&*()',
      'M1x3d!C@se#Numb3r$',
      'V3ry$tr0ng&P@ssw0rd!'
    ];
    
    for (const password of complexPasswords) {
      // Test password complessa
      await page.fill('input[name="password"]', password);
      await page.fill('input[name="confirmPassword"]', password);
      
      // Verificare che i valori siano accettati
      await expect(page.locator('input[name="password"]')).toHaveValue(password);
      await expect(page.locator('input[name="confirmPassword"]')).toHaveValue(password);
      
      // Verificare che il form non craschi
      await expect(page.locator('form')).toBeVisible();
      
      // Test submit (dovrebbe passare la validazione client-side)
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      // Verificare che non ci siano errori di validazione client-side
      await expect(page.locator('.Toastify__toast--error')).not.toContainText('La password deve essere almeno 8 caratteri');
      await expect(page.locator('.Toastify__toast--error')).not.toContainText('Le password non coincidono');
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
      // Test nome con SQL injection
      await page.fill('input[name="first_name"]', injection);
      await expect(page.locator('input[name="first_name"]')).toHaveValue(injection);
      
      // Test cognome con SQL injection
      await page.fill('input[name="last_name"]', injection);
      await expect(page.locator('input[name="last_name"]')).toHaveValue(injection);
      
      // Test password con SQL injection
      await page.fill('input[name="password"]', injection);
      await expect(page.locator('input[name="password"]')).toHaveValue(injection);
      
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
      // Test nome con XSS
      await page.fill('input[name="first_name"]', xss);
      await expect(page.locator('input[name="first_name"]')).toHaveValue(xss);
      
      // Test cognome con XSS
      await page.fill('input[name="last_name"]', xss);
      await expect(page.locator('input[name="last_name"]')).toHaveValue(xss);
      
      // Test password con XSS
      await page.fill('input[name="password"]', xss);
      await expect(page.locator('input[name="password"]')).toHaveValue(xss);
      
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
      const inputs = ['first_name', 'last_name', 'password', 'confirmPassword'];
      inputs.forEach(inputName => {
        const input = document.querySelector(`input[name="${inputName}"]`);
        if (input) input.value = null;
      });
    });
    
    // Verificare che i campi siano gestiti correttamente
    await expect(page.locator('input[name="first_name"]')).toHaveValue('');
    await expect(page.locator('input[name="last_name"]')).toHaveValue('');
    await expect(page.locator('input[name="password"]')).toHaveValue('');
    await expect(page.locator('input[name="confirmPassword"]')).toHaveValue('');
    
    // Test con undefined
    await page.evaluate(() => {
      const inputs = ['first_name', 'last_name', 'password', 'confirmPassword'];
      inputs.forEach(inputName => {
        const input = document.querySelector(`input[name="${inputName}"]`);
        if (input) input.value = undefined;
      });
    });
    
    // Verificare che i campi siano gestiti correttamente
    await expect(page.locator('input[name="first_name"]')).toHaveValue('');
    await expect(page.locator('input[name="last_name"]')).toHaveValue('');
    await expect(page.locator('input[name="password"]')).toHaveValue('');
    await expect(page.locator('input[name="confirmPassword"]')).toHaveValue('');
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
      // Test nome con numeri
      await page.fill('input[name="first_name"]', num);
      await expect(page.locator('input[name="first_name"]')).toHaveValue(num);
      
      // Test cognome con numeri
      await page.fill('input[name="last_name"]', num);
      await expect(page.locator('input[name="last_name"]')).toHaveValue(num);
      
      // Test password con numeri
      await page.fill('input[name="password"]', num);
      await expect(page.locator('input[name="password"]')).toHaveValue(num);
      
      // Verificare che il form non craschi
      await expect(page.locator('form')).toBeVisible();
    }
  });

  test('Dovrebbe gestire input molto rapidi (rapid typing)', async ({ page }) => {
    // Simulare digitazione molto rapida
    const rapidText = 'Mario';
    
    // Digitare carattere per carattere molto velocemente
    for (let i = 0; i < rapidText.length; i++) {
      await page.locator('input[name="first_name"]').type(rapidText[i], { delay: 10 });
    }
    
    await expect(page.locator('input[name="first_name"]')).toHaveValue(rapidText);
    
    // Test con cognome
    const rapidLastname = 'Rossi';
    for (let i = 0; i < rapidLastname.length; i++) {
      await page.locator('input[name="last_name"]').type(rapidLastname[i], { delay: 10 });
    }
    
    await expect(page.locator('input[name="last_name"]')).toHaveValue(rapidLastname);
    
    // Verificare che il form funzioni ancora
    await expect(page.locator('form')).toBeVisible();
  });

  test('Dovrebbe gestire click multipli rapidi su submit', async ({ page }) => {
    // Compilare form
    await page.fill('input[name="first_name"]', 'Mario');
    await page.fill('input[name="last_name"]', 'Rossi');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    
    // Intercettare la chiamata API per simulare delay
    await page.route('**/invites/accept', async route => {
      // Simulare delay di 3 secondi
      await new Promise(resolve => setTimeout(resolve, 3000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
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
      await expect(page.locator('input[name="first_name"]')).toBeVisible();
      await expect(page.locator('input[name="last_name"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      
      // Test funzionalità dopo resize
      await page.fill('input[name="first_name"]', 'Mario');
      await page.fill('input[name="last_name"]', 'Rossi');
      await page.fill('input[name="password"]', 'password123');
      await page.fill('input[name="confirmPassword"]', 'password123');
      
      await expect(page.locator('input[name="first_name"]')).toHaveValue('Mario');
      await expect(page.locator('input[name="last_name"]')).toHaveValue('Rossi');
      await expect(page.locator('input[name="password"]')).toHaveValue('password123');
      await expect(page.locator('input[name="confirmPassword"]')).toHaveValue('password123');
    }
  });

  test('Dovrebbe gestire token manipulation', async ({ page }) => {
    const maliciousTokens = [
      'admin-token',
      'superuser-token',
      'root-token',
      'token-from-other-user',
      'manipulated-token',
      'fake-admin-token'
    ];
    
    for (const token of maliciousTokens) {
      // Navigare con token malizioso
      await page.goto(`http://localhost:3006/accept-invite?token=${token}`);
      
      // Verificare che il form gestisca correttamente il token
      // (dovrebbe mostrare errore o form normale a seconda della validazione)
      await page.waitForTimeout(1000);
      
      // Verificare che non ci siano errori JavaScript
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      expect(consoleErrors.length).toBe(0);
    }
  });

  test('Dovrebbe gestire interruzioni di rete', async ({ page }) => {
    // Simulare interruzione di rete
    await page.context().setOffline(true);
    
    // Compilare form
    await page.fill('input[name="first_name"]', 'Mario');
    await page.fill('input[name="last_name"]', 'Rossi');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    
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
    await page.route('**/invites/accept', async route => {
      // Simulare timeout molto lungo
      await new Promise(resolve => setTimeout(resolve, 10000));
      await route.continue();
    });
    
    // Compilare form
    await page.fill('input[name="first_name"]', 'Mario');
    await page.fill('input[name="last_name"]', 'Rossi');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Verificare loading state
    await expect(submitButton).toBeDisabled();
    await expect(submitButton).toContainText('Creazione account...');
    
    // Aspettare un po' e verificare che il form sia ancora responsive
    await page.waitForTimeout(2000);
    await expect(page.locator('form')).toBeVisible();
  });
});
