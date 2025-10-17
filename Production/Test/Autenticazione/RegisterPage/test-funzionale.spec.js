import { test, expect } from '@playwright/test';

test.describe('RegisterPage - Test Funzionali', () => {
  
  test.beforeEach(async ({ page }) => {
    // Naviga alla pagina di registrazione
    await page.goto('/sign-up');
    
    // Scroll completo per identificare tutti gli elementi
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(500);
  });

  test('Dovrebbe caricare correttamente la pagina di registrazione', async ({ page }) => {
    // Verifica elementi principali
    await expect(page.locator('h1')).toContainText('Business Haccp Manager');
    await expect(page.locator('h2')).toContainText('Registrati al Sistema');
    
    // Verifica form presente
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[name="first_name"]')).toBeVisible();
    await expect(page.locator('input[name="last_name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('Dovrebbe mostrare tutti i campi del form', async ({ page }) => {
    // Verifica tutti i campi
    await expect(page.locator('input[name="first_name"]')).toBeVisible();
    await expect(page.locator('input[name="last_name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    
    // Verifica label
    await expect(page.locator('label[for="first_name"]')).toContainText('Nome');
    await expect(page.locator('label[for="last_name"]')).toContainText('Cognome');
    await expect(page.locator('label[for="email"]')).toContainText('Email');
    await expect(page.locator('label[for="password"]')).toContainText('Password');
    await expect(page.locator('label[for="confirmPassword"]')).toContainText('Conferma Password');
  });

  test('Dovrebbe permettere inserimento di tutti i campi', async ({ page }) => {
    const formData = {
      first_name: 'Mario',
      last_name: 'Rossi',
      email: 'mario@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    };
    
    // Inserisci tutti i campi
    await page.fill('input[name="first_name"]', formData.first_name);
    await page.fill('input[name="last_name"]', formData.last_name);
    await page.fill('input[name="email"]', formData.email);
    await page.fill('input[name="password"]', formData.password);
    await page.fill('input[name="confirmPassword"]', formData.confirmPassword);
    
    // Verifica valori
    await expect(page.locator('input[name="first_name"]')).toHaveValue(formData.first_name);
    await expect(page.locator('input[name="last_name"]')).toHaveValue(formData.last_name);
    await expect(page.locator('input[name="email"]')).toHaveValue(formData.email);
    await expect(page.locator('input[name="password"]')).toHaveValue(formData.password);
    await expect(page.locator('input[name="confirmPassword"]')).toHaveValue(formData.confirmPassword);
  });

  test('Dovrebbe gestire toggle password visibility', async ({ page }) => {
    const password = 'password123';
    
    // Inserisci password
    await page.fill('input[name="password"]', password);
    
    // Verifica che password sia nascosta inizialmente
    await expect(page.locator('input[name="password"]')).toHaveAttribute('type', 'password');
    
    // Clicca toggle password
    await page.click('button[type="button"]:has-text("👁️")');
    
    // Verifica che password sia visibile
    await expect(page.locator('input[name="password"]')).toHaveAttribute('type', 'text');
    await expect(page.locator('input[name="confirmPassword"]')).toHaveAttribute('type', 'text');
    
    // Clicca di nuovo per nascondere
    await page.click('button[type="button"]:has-text("🙈")');
    
    // Verifica che password sia nascosta
    await expect(page.locator('input[name="password"]')).toHaveAttribute('type', 'password');
    await expect(page.locator('input[name="confirmPassword"]')).toHaveAttribute('type', 'password');
  });

  test('Dovrebbe mostrare stato loading durante submit', async ({ page }) => {
    // Inserisci dati validi
    await page.fill('input[name="first_name"]', 'Mario');
    await page.fill('input[name="last_name"]', 'Rossi');
    await page.fill('input[name="email"]', 'mario@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    
    // Clicca submit
    await page.click('button[type="submit"]');
    
    // Verifica stato loading
    await expect(page.locator('button[type="submit"]:has-text("Registrazione in corso...")')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });

  test('Dovrebbe mostrare link di navigazione', async ({ page }) => {
    // Link login
    await expect(page.locator('a[href="/sign-in"]')).toBeVisible();
    await expect(page.locator('a[href="/sign-in"]')).toContainText('Accedi ora');
    
    // Bottone torna alla home
    await expect(page.locator('button:has-text("Torna alla home")')).toBeVisible();
  });

  test('Dovrebbe navigare correttamente ai link', async ({ page }) => {
    // Test link login
    await page.click('a[href="/sign-in"]');
    await expect(page).toHaveURL('/sign-in');
    
    // Torna indietro
    await page.goBack();
    
    // Test bottone torna alla home
    await page.click('button:has-text("Torna alla home")');
    await expect(page).toHaveURL('/');
  });

  test('Dovrebbe avere accessibilità corretta', async ({ page }) => {
    // Verifica label associati agli input
    await expect(page.locator('label[for="first_name"]')).toBeVisible();
    await expect(page.locator('label[for="last_name"]')).toBeVisible();
    await expect(page.locator('label[for="email"]')).toBeVisible();
    await expect(page.locator('label[for="password"]')).toBeVisible();
    await expect(page.locator('label[for="confirmPassword"]')).toBeVisible();
    
    // Verifica placeholder
    await expect(page.locator('input[name="first_name"]')).toHaveAttribute('placeholder', 'Mario');
    await expect(page.locator('input[name="last_name"]')).toHaveAttribute('placeholder', 'Rossi');
    await expect(page.locator('input[name="email"]')).toHaveAttribute('placeholder', 'mario@esempio.com');
    await expect(page.locator('input[name="password"]')).toHaveAttribute('placeholder', 'Minimo 8 caratteri');
    await expect(page.locator('input[name="confirmPassword"]')).toHaveAttribute('placeholder', 'Ripeti password');
    
    // Verifica autocomplete
    await expect(page.locator('input[name="email"]')).toHaveAttribute('autocomplete', 'email');
    await expect(page.locator('input[name="password"]')).toHaveAttribute('autocomplete', 'new-password');
    await expect(page.locator('input[name="confirmPassword"]')).toHaveAttribute('autocomplete', 'new-password');
  });

  test('Dovrebbe gestire responsive design', async ({ page }) => {
    // Test desktop
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('.max-w-md')).toBeVisible();
    
    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.max-w-md')).toBeVisible();
    
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.max-w-md')).toBeVisible();
  });

  test('Dovrebbe avere styling corretto', async ({ page }) => {
    // Verifica gradient background
    await expect(page.locator('.bg-gradient-to-br')).toBeVisible();
    
    // Verifica card shadow
    await expect(page.locator('.shadow-2xl')).toBeVisible();
    
    // Verifica button gradient
    await expect(page.locator('button[type="submit"]')).toHaveClass(/bg-gradient-to-r/);
    
    // Verifica grid layout per nome/cognome
    await expect(page.locator('.grid-cols-2')).toBeVisible();
  });

  test('Dovrebbe gestire focus management', async ({ page }) => {
    // Focus su nome
    await page.focus('input[name="first_name"]');
    await expect(page.locator('input[name="first_name"]')).toBeFocused();
    
    // Tab per cognome
    await page.keyboard.press('Tab');
    await expect(page.locator('input[name="last_name"]')).toBeFocused();
    
    // Tab per email
    await page.keyboard.press('Tab');
    await expect(page.locator('input[name="email"]')).toBeFocused();
    
    // Tab per password
    await page.keyboard.press('Tab');
    await expect(page.locator('input[name="password"]')).toBeFocused();
    
    // Tab per conferma password
    await page.keyboard.press('Tab');
    await expect(page.locator('input[name="confirmPassword"]')).toBeFocused();
    
    // Tab per submit button
    await page.keyboard.press('Tab');
    await expect(page.locator('button[type="submit"]')).toBeFocused();
  });

  test('Dovrebbe mostrare testo di aiuto password', async ({ page }) => {
    // Verifica testo di aiuto
    await expect(page.locator('text=Almeno 8 caratteri con lettere e numeri')).toBeVisible();
  });
});
