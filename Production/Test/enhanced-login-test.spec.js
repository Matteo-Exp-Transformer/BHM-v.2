// 🎭 SKILL_TEST_GENERATOR: Enhanced Login Test
// Test completo per verifica login con best practices

import { test, expect } from '@playwright/test';

// 🧪 Test Suite: Authentication Flow
test.describe('🔐 Authentication Flow', () => {
  
  // 🎯 Test Case: Successful Login
  test('should login successfully with valid credentials', async ({ page }) => {
    console.log('🌐 Navigating to homepage...');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // ✅ Assertion: Verify we're on login page
    console.log('🔍 Verifying login page...');
    await expect(page.locator('h2:has-text("Accedi al Sistema")')).toBeVisible();
    
    // 📧 Fill email field
    console.log('📧 Filling email...');
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    await emailInput.fill(process.env.TEST_EMAIL || 'test@example.com');
    
    // 🔑 Fill password field
    console.log('🔑 Filling password...');
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill(process.env.TEST_PASSWORD || 'testpassword');
    
    // ✅ Submit login form
    console.log('✅ Submitting login form...');
    const loginButton = page.locator('button:has-text("Accedi")');
    await expect(loginButton).toBeEnabled();
    await loginButton.click();
    
    // ⏳ Wait for successful login
    console.log('⏳ Waiting for login completion...');
    await page.waitForLoadState('networkidle');
    
    // ✅ Assertion: Verify successful login
    console.log('🔍 Verifying successful login...');
    await expect(page.locator('button:has-text("Onboarding")')).toBeVisible({ timeout: 10000 });
    
    // 🎯 Additional verification: Check for user-specific elements
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    
    console.log('✅ Login completed successfully!');
  });
  
  // 🎯 Test Case: Invalid Credentials
  test('should show error with invalid credentials', async ({ page }) => {
    console.log('🌐 Navigating to login page...');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 📧 Fill invalid email
    await page.fill('input[type="email"]', 'invalid@example.com');
    
    // 🔑 Fill invalid password
    await page.fill('input[type="password"]', 'wrongpassword');
    
    // ✅ Submit form
    await page.click('button:has-text("Accedi")');
    
    // ⏳ Wait for error response
    await page.waitForLoadState('networkidle');
    
    // ✅ Assertion: Verify error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('text=Credenziali non valide')).toBeVisible();
  });
  
  // 🎯 Test Case: Empty Fields Validation
  test('should show validation errors for empty fields', async ({ page }) => {
    console.log('🌐 Navigating to login page...');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // ✅ Submit empty form
    await page.click('button:has-text("Accedi")');
    
    // ✅ Assertion: Verify validation errors
    await expect(page.locator('text=Email è richiesta')).toBeVisible();
    await expect(page.locator('text=Password è richiesta')).toBeVisible();
  });
  
  // 🎯 Test Case: Form Field Validation
  test('should validate email format', async ({ page }) => {
    console.log('🌐 Navigating to login page...');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 📧 Fill invalid email format
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    
    // ✅ Submit form
    await page.click('button:has-text("Accedi")');
    
    // ✅ Assertion: Verify email validation
    await expect(page.locator('text=Formato email non valido')).toBeVisible();
  });
});

// 🧪 Test Suite: Login Page UI
test.describe('🎨 Login Page UI', () => {
  
  test('should display all required elements', async ({ page }) => {
    console.log('🌐 Navigating to login page...');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // ✅ Assertions: Verify all UI elements
    await expect(page.locator('h2:has-text("Accedi al Sistema")')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Accedi")')).toBeVisible();
    
    // 🎯 Additional UI checks
    await expect(page.locator('a:has-text("Password dimenticata?")')).toBeVisible();
    await expect(page.locator('a:has-text("Registrati")')).toBeVisible();
  });
  
  test('should be responsive on mobile', async ({ page }) => {
    console.log('📱 Testing mobile responsiveness...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // ✅ Assertion: Verify mobile layout
    await expect(page.locator('h2:has-text("Accedi al Sistema")')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});

// 🧪 Test Suite: Performance & Accessibility
test.describe('⚡ Performance & Accessibility', () => {
  
  test('should load login page quickly', async ({ page }) => {
    console.log('⏱️ Testing page load performance...');
    
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // ✅ Assertion: Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    console.log(`📊 Page loaded in ${loadTime}ms`);
  });
  
  test('should have proper accessibility attributes', async ({ page }) => {
    console.log('♿ Testing accessibility...');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // ✅ Assertions: Check accessibility
    await expect(page.locator('input[type="email"]')).toHaveAttribute('aria-label');
    await expect(page.locator('input[type="password"]')).toHaveAttribute('aria-label');
    await expect(page.locator('button:has-text("Accedi")')).toHaveAttribute('aria-label');
  });
});
