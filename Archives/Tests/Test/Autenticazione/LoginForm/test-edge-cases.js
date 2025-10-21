const { test, expect } = require('@playwright/test');

test.describe('LoginForm - Test Edge Cases', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3005/login');
    await expect(page.locator('form')).toBeVisible();
  });

  test('Dovrebbe gestire stringhe molto lunghe', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    
    // Test con stringa molto lunga (1000 caratteri)
    const longString = 'a'.repeat(1000);
    
    // Test email molto lunga
    await emailInput.fill(longString + '@example.com');
    await expect(emailInput).toHaveValue(longString + '@example.com');
    
    // Test password molto lunga
    await passwordInput.fill(longString);
    await expect(passwordInput).toHaveValue(longString);
    
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
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    
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
      await emailInput.clear();
      await emailInput.fill(chars + '@example.com');
      await expect(emailInput).toHaveValue(chars + '@example.com');
      
      // Test password con caratteri speciali
      await passwordInput.clear();
      await passwordInput.fill(chars);
      await expect(passwordInput).toHaveValue(chars);
      
      // Verificare che il form non craschi
      await expect(page.locator('form')).toBeVisible();
    }
  });

  test('Dovrebbe gestire tentativi SQL injection', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    
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
      await emailInput.clear();
      await emailInput.fill(injection);
      await expect(emailInput).toHaveValue(injection);
      
      // Test password con SQL injection
      await passwordInput.clear();
      await passwordInput.fill(injection);
      await expect(passwordInput).toHaveValue(injection);
      
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
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    
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
      await emailInput.clear();
      await emailInput.fill(xss);
      await expect(emailInput).toHaveValue(xss);
      
      // Test password con XSS
      await passwordInput.clear();
      await passwordInput.fill(xss);
      await expect(passwordInput).toHaveValue(xss);
      
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
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    
    // Test con valori null tramite JavaScript
    await page.evaluate(() => {
      const emailInput = document.querySelector('input[name="email"]');
      const passwordInput = document.querySelector('input[name="password"]');
      
      if (emailInput) emailInput.value = null;
      if (passwordInput) passwordInput.value = null;
    });
    
    // Verificare che i campi siano gestiti correttamente
    await expect(emailInput).toHaveValue('');
    await expect(passwordInput).toHaveValue('');
    
    // Test con undefined
    await page.evaluate(() => {
      const emailInput = document.querySelector('input[name="email"]');
      const passwordInput = document.querySelector('input[name="password"]');
      
      if (emailInput) emailInput.value = undefined;
      if (passwordInput) passwordInput.value = undefined;
    });
    
    // Verificare che i campi siano gestiti correttamente
    await expect(emailInput).toHaveValue('');
    await expect(passwordInput).toHaveValue('');
  });

  test('Dovrebbe gestire numeri come input', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    
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
      await emailInput.clear();
      await emailInput.fill(num + '@example.com');
      await expect(emailInput).toHaveValue(num + '@example.com');
      
      // Test password con numeri
      await passwordInput.clear();
      await passwordInput.fill(num);
      await expect(passwordInput).toHaveValue(num);
      
      // Verificare che il form non craschi
      await expect(page.locator('form')).toBeVisible();
    }
  });

  test('Dovrebbe gestire input molto rapidi (rapid typing)', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    
    // Simulare digitazione molto rapida
    const rapidText = 'test@example.com';
    
    // Digitare carattere per carattere molto velocemente
    for (let i = 0; i < rapidText.length; i++) {
      await emailInput.type(rapidText[i], { delay: 10 });
    }
    
    await expect(emailInput).toHaveValue(rapidText);
    
    // Test con password
    const rapidPassword = 'password123';
    for (let i = 0; i < rapidPassword.length; i++) {
      await passwordInput.type(rapidPassword[i], { delay: 10 });
    }
    
    await expect(passwordInput).toHaveValue(rapidPassword);
    
    // Verificare che il form funzioni ancora
    await expect(page.locator('form')).toBeVisible();
  });

  test('Dovrebbe gestire copia e incolla di testo', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    
    // Test copia e incolla email
    await emailInput.fill('test@example.com');
    await emailInput.selectText();
    await page.keyboard.press('Control+c');
    
    await emailInput.click();
    await page.keyboard.press('Control+v');
    
    await expect(emailInput).toHaveValue('test@example.com');
    
    // Test copia e incolla password
    await passwordInput.fill('password123');
    await passwordInput.selectText();
    await page.keyboard.press('Control+c');
    
    await passwordInput.click();
    await page.keyboard.press('Control+v');
    
    await expect(passwordInput).toHaveValue('password123');
  });

  test('Dovrebbe gestire pressione tasti speciali', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');
    
    // Test con tasti speciali
    await emailInput.click();
    await emailInput.type('test@example.com');
    
    // Test Backspace
    await page.keyboard.press('Backspace');
    await expect(emailInput).toHaveValue('test@example.co');
    
    // Test Delete
    await page.keyboard.press('Delete');
    await expect(emailInput).toHaveValue('test@example.c');
    
    // Test Home
    await page.keyboard.press('Home');
    await page.keyboard.type('user');
    await expect(emailInput).toHaveValue('usertest@example.c');
    
    // Test End
    await page.keyboard.press('End');
    await page.keyboard.type('.com');
    await expect(emailInput).toHaveValue('usertest@example.c.com');
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
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      
      // Test funzionalità dopo resize
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'password123');
      
      await expect(page.locator('input[name="email"]')).toHaveValue('test@example.com');
      await expect(page.locator('input[name="password"]')).toHaveValue('password123');
    }
  });
});
