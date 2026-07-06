// Test semplice per verificare il login
import { test, expect } from '@playwright/test';

test('Login semplice', async ({ page }) => {
  console.log('🌐 Navigando alla homepage...');
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Verifica che siamo sulla pagina di login
  const pageTitle = await page.title();
  console.log('📄 Titolo pagina:', pageTitle);
  
  console.log('🔍 Verificando che siamo sulla pagina di login...');
  await expect(page.locator('h2:has-text("Accedi al Sistema")')).toBeVisible();
  
  console.log('🔐 La pagina è già la pagina di login, procedo con il login...');
  
  console.log('📧 Compilando email...');
  await page.fill('input[type="email"]', 'matteo.cavallaro.work@gmail.com');
  
  console.log('🔑 Compilando password...');
  await page.fill('input[type="password"]', 'cavallaro');
  
  console.log('✅ Cliccando su Accedi...');
  await page.click('button:has-text("Accedi")');
  
  console.log('⏳ Aspettando completamento login...');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);
  
  console.log('🔍 Verificando che siamo loggati...');
  await expect(page.locator('button:has-text("Onboarding")')).toBeVisible();
  
  console.log('✅ Login completato con successo!');
});
