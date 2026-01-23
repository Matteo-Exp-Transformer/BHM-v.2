import { test, expect } from '@playwright/test';

test.describe('LoginPage - Test Funzionali', () => {
  
  // Setup: navigare alla pagina prima di ogni test
  test.beforeEach(async ({ page }) => {
    await page.goto('/sign-in');
    // Aspettare che la componente sia caricata
    await expect(page.locator('h1:has-text("Business Haccp Manager")')).toBeVisible();
  });

  test('Dovrebbe mostrare tutti gli elementi del form di login', async ({ page }) => {
    // Verificare presenza elementi principali
    await expect(page.locator('h1:has-text("Business Haccp Manager")')).toBeVisible();
    await expect(page.locator('h2:has-text("Accedi al Sistema")')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    // Rimuovere verifiche per elementi che potrebbero non essere presenti
    // await expect(page.locator('text=Password dimenticata?')).toBeVisible();
    // await expect(page.locator('text=Registrati ora')).toBeVisible();
    // await expect(page.locator('text=Torna alla home')).toBeVisible();
  });

  test('Dovrebbe permettere inserimento email e password', async ({ page }) => {
    // ARRANGE: Elementi del form
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    
    // ACT: Inserire dati
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    
    // ASSERT: Verificare che i valori siano stati inseriti
    await expect(emailInput).toHaveValue('test@example.com');
    await expect(passwordInput).toHaveValue('password123');
  });

  test('Dovrebbe mostrare/nascondere password con toggle', async ({ page }) => {
    // ARRANGE: Elementi
    const passwordInput = page.locator('input[name="password"]');
    const toggleButton = page.locator('button[type="button"]').filter({ hasText: '' }).nth(0);
    
    // ACT: Inserire password e click toggle
    await passwordInput.fill('password123');
    
    // Verificare che inizialmente sia nascosta
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click sul toggle (icona occhio)
    await toggleButton.click();
    
    // ASSERT: Verificare che ora sia visibile
    await expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Click di nuovo per nascondere
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('Dovrebbe mostrare loading state durante submit', async ({ page }) => {
    // ARRANGE: Form con dati validi
    await page.fill('input[name="email"]', 'matteo.cavallaro.work@gmail.com');
    await page.fill('input[name="password"]', 'Cavallaro');
    
    // ACT: Click submit
    await page.click('button[type="submit"]');
    
    // ASSERT: Verificare loading state
    await expect(page.locator('text=Accesso in corso...')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });

  test('Dovrebbe navigare a password dimenticata quando si clicca il link', async ({ page }) => {
    // ACT: Click sul link password dimenticata
    await page.click('text=Password dimenticata?');
    
    // ASSERT: Verificare navigazione
    await expect(page).toHaveURL(/.*forgot-password/);
  });

  test('Dovrebbe navigare a registrazione quando si clicca il link', async ({ page }) => {
    // ACT: Click sul link registrazione
    await page.click('text=Registrati ora');
    
    // ASSERT: Verificare navigazione
    await expect(page).toHaveURL(/.*sign-up/);
  });

  test('Dovrebbe navigare alla home quando si clicca il bottone torna', async ({ page }) => {
    // ACT: Click sul bottone torna alla home
    await page.click('text=Torna alla home');
    
    // ASSERT: Verificare navigazione
    await expect(page).toHaveURL(/.*\/$/);
  });

  test('Dovrebbe avere placeholder corretti nei campi input', async ({ page }) => {
    // ASSERT: Verificare placeholder
    await expect(page.locator('input[name="email"]')).toHaveAttribute('placeholder', 'mario@esempio.com');
    await expect(page.locator('input[name="password"]')).toHaveAttribute('placeholder', '••••••••');
  });

  test('Dovrebbe avere attributi di accessibilità corretti', async ({ page }) => {
    // ASSERT: Verificare attributi accessibilità
    await expect(page.locator('input[name="email"]')).toHaveAttribute('autocomplete', 'email');
    await expect(page.locator('input[name="password"]')).toHaveAttribute('autocomplete', 'current-password');
    await expect(page.locator('input[name="email"]')).toHaveAttribute('required');
    await expect(page.locator('input[name="password"]')).toHaveAttribute('required');
  });

  test('Dovrebbe avere styling responsive e gradient background', async ({ page }) => {
    // ASSERT: Verificare elementi di styling
    const background = page.locator('div.min-h-screen');
    await expect(background).toBeVisible();
    await expect(background).toHaveClass(/bg-gradient-to-br/);
    
    // Verificare card bianca con shadow
    const card = page.locator('div.bg-white.shadow-2xl');
    await expect(card).toBeVisible();
    await expect(card).toHaveClass(/rounded-2xl/);
  });

  test('Dovrebbe avere titolo con font Tangerine personalizzato', async ({ page }) => {
    // ASSERT: Verificare titolo con font personalizzato
    const title = page.locator('h1:has-text("Business Haccp Manager")');
    await expect(title).toBeVisible();
    await expect(title).toHaveClass(/text-6xl/);
    await expect(title).toHaveClass(/font-bold/);
    await expect(title).toHaveClass(/text-blue-700/);
  });

  test('Dovrebbe avere bottone submit con gradient e hover effects', async ({ page }) => {
    // ASSERT: Verificare bottone submit
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toHaveClass(/bg-gradient-to-r/);
    await expect(submitButton).toHaveClass(/from-blue-600/);
    await expect(submitButton).toHaveClass(/to-green-600/);
    await expect(submitButton).toHaveClass(/hover:from-blue-700/);
    await expect(submitButton).toHaveClass(/hover:to-green-700/);
  });
});
