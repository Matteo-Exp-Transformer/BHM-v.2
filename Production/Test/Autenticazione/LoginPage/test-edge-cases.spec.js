import { test, expect } from '@playwright/test';

test.describe('LoginPage - Test Edge Cases', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/login');
    await expect(page.locator('h1:has-text("Business Haccp Manager")')).toBeVisible();
  });

  test('Dovrebbe gestire stringa molto lunga negli input', async ({ page }) => {
    const longString = 'a'.repeat(1000);
    
    // ACT: Inserire stringa molto lunga
    await page.fill('input[name="email"]', longString);
    await page.fill('input[name="password"]', longString);
    
    // ASSERT: Verificare che l'app non craschi
    await expect(page.locator('h1:has-text("Business Haccp Manager")')).toBeVisible();
    
    // Verificare che i valori siano stati inseriti (comportamento browser standard)
    await expect(page.locator('input[name="email"]')).toHaveValue(longString);
    await expect(page.locator('input[name="password"]')).toHaveValue(longString);
    
    // Tentare submit
    await page.click('button[type="submit"]');
    
    // Verificare che non ci siano crash e che appaia errore di validazione
    await expect(page.locator('input[name="email"]')).toBeFocused();
  });

  test('Dovrebbe gestire caratteri Unicode negli input', async ({ page }) => {
    const unicodeChars = 'αβγδεζηθικλμνξοπρστυφχψω';
    const unicodeEmail = `test${unicodeChars}@example.com`;
    const unicodePassword = `pass${unicodeChars}word`;
    
    // ACT: Inserire caratteri Unicode
    await page.fill('input[name="email"]', unicodeEmail);
    await page.fill('input[name="password"]', unicodePassword);
    
    // ASSERT: Verificare che i caratteri siano gestiti correttamente
    await expect(page.locator('input[name="email"]')).toHaveValue(unicodeEmail);
    await expect(page.locator('input[name="password"]')).toHaveValue(unicodePassword);
    
    // Verificare che l'app non craschi
    await expect(page.locator('h1:has-text("Business Haccp Manager")')).toBeVisible();
  });

  test('Dovrebbe gestire emoji negli input', async ({ page }) => {
    const emojiEmail = 'test🚀@example.com';
    const emojiPassword = 'pass🎉word✅';
    
    // ACT: Inserire emoji
    await page.fill('input[name="email"]', emojiEmail);
    await page.fill('input[name="password"]', emojiPassword);
    
    // ASSERT: Verificare che le emoji siano gestite correttamente
    await expect(page.locator('input[name="email"]')).toHaveValue(emojiEmail);
    await expect(page.locator('input[name="password"]')).toHaveValue(emojiPassword);
    
    // Verificare che l'app non craschi
    await expect(page.locator('h1:has-text("Business Haccp Manager")')).toBeVisible();
  });

  test('Dovrebbe gestire tentativi SQL injection', async ({ page }) => {
    const sqlInjectionAttempts = [
      "'; DROP TABLE users; --",
      "admin' OR '1'='1",
      "'; INSERT INTO users VALUES ('hacker', 'password'); --",
      "' UNION SELECT * FROM users --",
      "'; UPDATE users SET password = 'hacked'; --"
    ];
    
    for (const sqlAttempt of sqlInjectionAttempts) {
      // ACT: Inserire tentativo SQL injection
      await page.fill('input[name="email"]', sqlAttempt);
      await page.fill('input[name="password"]', sqlAttempt);
      
      // ASSERT: Verificare che i caratteri siano trattati come testo normale
      await expect(page.locator('input[name="email"]')).toHaveValue(sqlAttempt);
      await expect(page.locator('input[name="password"]')).toHaveValue(sqlAttempt);
      
      // Verificare che l'app non craschi
      await expect(page.locator('h1:has-text("Business Haccp Manager")')).toBeVisible();
      
      // Pulisci i campi per il prossimo test
      await page.fill('input[name="email"]', '');
      await page.fill('input[name="password"]', '');
    }
  });

  test('Dovrebbe gestire tentativi XSS injection', async ({ page }) => {
    const xssAttempts = [
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      '<img src="x" onerror="alert(\'xss\')">',
      '<iframe src="javascript:alert(\'xss\')"></iframe>',
      '<svg onload="alert(\'xss\')"></svg>'
    ];
    
    for (const xssAttempt of xssAttempts) {
      // ACT: Inserire tentativo XSS
      await page.fill('input[name="email"]', xssAttempt);
      await page.fill('input[name="password"]', xssAttempt);
      
      // ASSERT: Verificare che i caratteri siano trattati come testo normale
      await expect(page.locator('input[name="email"]')).toHaveValue(xssAttempt);
      await expect(page.locator('input[name="password"]')).toHaveValue(xssAttempt);
      
      // Verificare che l'app non craschi e non esegua script
      await expect(page.locator('h1:has-text("Business Haccp Manager")')).toBeVisible();
      
      // Pulisci i campi per il prossimo test
      await page.fill('input[name="email"]', '');
      await page.fill('input[name="password"]', '');
    }
  });

  test('Dovrebbe gestire valori null e undefined', async ({ page }) => {
    // ACT: Tentare di inserire null tramite JavaScript
    await page.evaluate(() => {
      const emailInput = document.querySelector('input[name="email"]');
      const passwordInput = document.querySelector('input[name="password"]');
      
      if (emailInput) emailInput.value = null;
      if (passwordInput) passwordInput.value = null;
    });
    
    // ASSERT: Verificare che l'app gestisca correttamente
    await expect(page.locator('h1:has-text("Business Haccp Manager")')).toBeVisible();
    
    // Tentare submit
    await page.click('button[type="submit"]');
    
    // Verificare che appaia errore di validazione
    await expect(page.locator('input[name="email"]')).toBeFocused();
  });

  test('Dovrebbe gestire input con solo spazi', async ({ page }) => {
    // ACT: Inserire solo spazi
    await page.fill('input[name="email"]', '   ');
    await page.fill('input[name="password"]', '   ');
    
    // ASSERT: Verificare che i valori siano accettati (comportamento standard)
    await expect(page.locator('input[name="email"]')).toHaveValue('   ');
    await expect(page.locator('input[name="password"]')).toHaveValue('   ');
    
    // Tentare submit
    await page.click('button[type="submit"]');
    
    // Verificare che appaia errore di validazione per email
    await expect(page.locator('input[name="email"]')).toBeFocused();
  });

  test('Dovrebbe gestire input con caratteri di controllo', async ({ page }) => {
    const controlChars = '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x0E\x0F\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F';
    
    // ACT: Inserire caratteri di controllo
    await page.fill('input[name="email"]', `test${controlChars}@example.com`);
    await page.fill('input[name="password"]', `pass${controlChars}word`);
    
    // ASSERT: Verificare che l'app non craschi
    await expect(page.locator('h1:has-text("Business Haccp Manager")')).toBeVisible();
    
    // Verificare che i caratteri di controllo siano gestiti
    const emailValue = await page.locator('input[name="email"]').inputValue();
    const passwordValue = await page.locator('input[name="password"]').inputValue();
    
    expect(emailValue).toContain('test');
    expect(emailValue).toContain('@example.com');
    expect(passwordValue).toContain('pass');
    expect(passwordValue).toContain('word');
  });

  test('Dovrebbe gestire input con newline e tab', async ({ page }) => {
    const specialWhitespace = 'test\n\t\r@example.com';
    
    // ACT: Inserire caratteri whitespace speciali
    await page.fill('input[name="email"]', specialWhitespace);
    await page.fill('input[name="password"]', 'pass\n\t\rword');
    
    // ASSERT: Verificare che i caratteri siano gestiti
    await expect(page.locator('input[name="email"]')).toHaveValue(specialWhitespace);
    await expect(page.locator('input[name="password"]')).toHaveValue('pass\n\t\rword');
    
    // Verificare che l'app non craschi
    await expect(page.locator('h1:has-text("Business Haccp Manager")')).toBeVisible();
  });

  test('Dovrebbe gestire input con caratteri HTML entities', async ({ page }) => {
    const htmlEntities = 'test&lt;&gt;&amp;&quot;&#39;@example.com';
    
    // ACT: Inserire HTML entities
    await page.fill('input[name="email"]', htmlEntities);
    await page.fill('input[name="password"]', 'pass&lt;&gt;&amp;word');
    
    // ASSERT: Verificare che le entities siano trattate come testo
    await expect(page.locator('input[name="email"]')).toHaveValue(htmlEntities);
    await expect(page.locator('input[name="password"]')).toHaveValue('pass&lt;&gt;&amp;word');
    
    // Verificare che l'app non craschi
    await expect(page.locator('h1:has-text("Business Haccp Manager")')).toBeVisible();
  });

  test('Dovrebbe gestire input con numeri molto grandi', async ({ page }) => {
    const bigNumber = '123456789012345678901234567890';
    
    // ACT: Inserire numeri molto grandi
    await page.fill('input[name="email"]', `${bigNumber}@example.com`);
    await page.fill('input[name="password"]', bigNumber);
    
    // ASSERT: Verificare che i numeri siano gestiti come stringhe
    await expect(page.locator('input[name="email"]')).toHaveValue(`${bigNumber}@example.com`);
    await expect(page.locator('input[name="password"]')).toHaveValue(bigNumber);
    
    // Verificare che l'app non craschi
    await expect(page.locator('h1:has-text("Business Haccp Manager")')).toBeVisible();
  });

  test('Dovrebbe gestire input con caratteri di escape', async ({ page }) => {
    const escapeChars = 'test\\n\\t\\r\\"\\\'\\\\@example.com';
    
    // ACT: Inserire caratteri di escape
    await page.fill('input[name="email"]', escapeChars);
    await page.fill('input[name="password"]', 'pass\\n\\t\\r\\"\\\'\\\\word');
    
    // ASSERT: Verificare che i caratteri di escape siano gestiti
    await expect(page.locator('input[name="email"]')).toHaveValue(escapeChars);
    await expect(page.locator('input[name="password"]')).toHaveValue('pass\\n\\t\\r\\"\\\'\\\\word');
    
    // Verificare che l'app non craschi
    await expect(page.locator('h1:has-text("Business Haccp Manager")')).toBeVisible();
  });

  test('Dovrebbe gestire multiple rapidi click su submit', async ({ page }) => {
    // ACT: Inserire dati validi
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // Click multipli rapidi su submit
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    await submitButton.click();
    await submitButton.click();
    
    // ASSERT: Verificare che non ci siano problemi
    await expect(page.locator('h1:has-text("Business Haccp Manager")')).toBeVisible();
    
    // Verificare che il bottone sia disabilitato durante loading
    await expect(submitButton).toBeDisabled();
  });

  test('Dovrebbe gestire toggle password con click multipli', async ({ page }) => {
    // ACT: Inserire password
    await page.fill('input[name="password"]', 'password123');
    
    const passwordInput = page.locator('input[name="password"]');
    const toggleButton = page.locator('button[type="button"]').filter({ hasText: '' }).nth(0);
    
    // Click multipli rapidi sul toggle
    await toggleButton.click();
    await toggleButton.click();
    await toggleButton.click();
    await toggleButton.click();
    
    // ASSERT: Verificare che il toggle funzioni correttamente
    const finalType = await passwordInput.getAttribute('type');
    expect(finalType).toBe('password'); // Dovrebbe essere tornato a password dopo 4 click
  });

  test('Dovrebbe gestire resize window durante interazione', async ({ page }) => {
    // ACT: Ridimensionare la finestra
    await page.setViewportSize({ width: 320, height: 568 }); // Mobile size
    
    // Verificare che gli elementi siano ancora visibili
    await expect(page.locator('h1:has-text("Business Haccp Manager")')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    
    // Ridimensionare a desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // ASSERT: Verificare che tutto sia ancora funzionante
    await expect(page.locator('h1:has-text("Business Haccp Manager")')).toBeVisible();
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await expect(page.locator('input[name="email"]')).toHaveValue('test@example.com');
  });
});
