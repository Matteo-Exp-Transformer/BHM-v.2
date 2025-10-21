# Test Planning - Login Hardening System

**Data**: 2025-10-20  
**Autore**: Agente 2 (Systems/API/DB)  
**Versione**: 1.0

## Overview

Piano di testing completo per il sistema di autenticazione hardening. Include test unitari SQL per RLS, contract tests API, scenari E2E critici e strategie di testing per sicurezza.

---

## Testing Strategy

### Test Pyramid
```
    /\
   /  \     E2E Tests (10%)
  /____\    - Critical user flows
 /      \   - Security scenarios
/________\  - Cross-browser compatibility

   /\
  /  \      Integration Tests (30%)
 /____\     - API contract validation
/      \    - Database integration
            - External service mocking

  /\
 /  \       Unit Tests (60%)
/____\      - RLS policies
            - Business logic
            - Utility functions
```

### Testing Levels

#### 1. Unit Tests (60%)
- **RLS Policies**: Test isolati per ogni policy
- **Database Functions**: Test stored procedures e triggers
- **Business Logic**: Test service layer e utilities
- **Validation**: Test schema validation e sanitization

#### 2. Integration Tests (30%)
- **API Contracts**: Test request/response schemas
- **Database Integration**: Test transazioni e connessioni
- **External Services**: Test SMTP, rate limiting, audit logging
- **Middleware**: Test authentication e authorization

#### 3. E2E Tests (10%)
- **Critical Flows**: Login, logout, recovery, invites
- **Security Scenarios**: CSRF, session hijacking, brute force
- **Cross-browser**: Compatibility testing
- **Performance**: Load testing e stress testing

---

## RLS Testing

### Test Database Setup
```sql
-- Test database setup
CREATE DATABASE bhm_auth_test;
\c bhm_auth_test;

-- Import schema
\i migrations/20250120000001_create_auth_hardening_schema.sql
\i migrations/20250120000002_create_rls_policies.sql

-- Create test data
INSERT INTO tenants (id, name, slug) VALUES 
  ('tenant-1', 'Test Company 1', 'test-company-1'),
  ('tenant-2', 'Test Company 2', 'test-company-2');

INSERT INTO roles (id, name, permissions) VALUES 
  ('role-owner', 'owner', '["*"]'),
  ('role-admin', 'admin', '["read", "write", "admin"]'),
  ('role-user', 'user', '["read"]');

INSERT INTO users (id, email, password_hash, status) VALUES 
  ('user-1', 'owner@test.com', '$2b$12$hash1', 'active'),
  ('user-2', 'admin@test.com', '$2b$12$hash2', 'active'),
  ('user-3', 'user@test.com', '$2b$12$hash3', 'active');

INSERT INTO user_roles (user_id, role_id, tenant_id) VALUES 
  ('user-1', 'role-owner', 'tenant-1'),
  ('user-2', 'role-admin', 'tenant-1'),
  ('user-3', 'role-user', 'tenant-1'),
  ('user-2', 'role-admin', 'tenant-2');
```

### RLS Policy Tests
```typescript
describe('RLS Policies', () => {
  beforeEach(async () => {
    // Setup test database
    await setupTestDatabase();
    await seedTestData();
  });
  
  afterEach(async () => {
    await cleanupTestDatabase();
  });
  
  describe('Users Table Policies', () => {
    test('user can view own profile', async () => {
      // Set user context
      await setUserContext('user-1');
      
      // Query own profile
      const result = await db.query(`
        SELECT * FROM users WHERE id = 'user-1'
      `);
      
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].email).toBe('owner@test.com');
    });
    
    test('user cannot view other users profiles', async () => {
      // Set user context
      await setUserContext('user-1');
      
      // Try to query other user
      const result = await db.query(`
        SELECT * FROM users WHERE id = 'user-2'
      `);
      
      expect(result.rows).toHaveLength(0);
    });
    
    test('tenant admin can view tenant users', async () => {
      // Set admin context
      await setUserContext('user-2', 'tenant-1');
      
      // Query users in tenant
      const result = await db.query(`
        SELECT * FROM users WHERE id IN (
          SELECT user_id FROM user_roles WHERE tenant_id = 'tenant-1'
        )
      `);
      
      expect(result.rows).toHaveLength(3); // All users in tenant-1
    });
    
    test('tenant admin cannot view other tenant users', async () => {
      // Set admin context for tenant-1
      await setUserContext('user-2', 'tenant-1');
      
      // Try to query users in other tenant
      const result = await db.query(`
        SELECT * FROM users WHERE id IN (
          SELECT user_id FROM user_roles WHERE tenant_id = 'tenant-2'
        )
      `);
      
      expect(result.rows).toHaveLength(0);
    });
  });
  
  describe('User Roles Table Policies', () => {
    test('user can view own roles', async () => {
      await setUserContext('user-1');
      
      const result = await db.query(`
        SELECT * FROM user_roles WHERE user_id = 'user-1'
      `);
      
      expect(result.rows).toHaveLength(1);
    });
    
    test('tenant admin can assign roles in tenant', async () => {
      await setUserContext('user-2', 'tenant-1');
      
      const result = await db.query(`
        INSERT INTO user_roles (user_id, role_id, tenant_id)
        VALUES ('user-3', 'role-admin', 'tenant-1')
        RETURNING *
      `);
      
      expect(result.rows).toHaveLength(1);
    });
    
    test('tenant admin cannot assign roles in other tenant', async () => {
      await setUserContext('user-2', 'tenant-1');
      
      await expect(
        db.query(`
          INSERT INTO user_roles (user_id, role_id, tenant_id)
          VALUES ('user-3', 'role-admin', 'tenant-2')
        `)
      ).rejects.toThrow('permission denied');
    });
  });
  
  describe('Invites Table Policies', () => {
    test('tenant admin can create invites for tenant', async () => {
      await setUserContext('user-2', 'tenant-1');
      
      const result = await db.query(`
        INSERT INTO invites (email, role_id, tenant_id, token_hash, expires_at, created_by)
        VALUES ('newuser@test.com', 'role-user', 'tenant-1', 'hash123', NOW() + INTERVAL '1 day', 'user-2')
        RETURNING *
      `);
      
      expect(result.rows).toHaveLength(1);
    });
    
    test('anonymous user can accept valid invite', async () => {
      // Create invite
      await db.query(`
        INSERT INTO invites (email, role_id, tenant_id, token_hash, expires_at, created_by)
        VALUES ('newuser@test.com', 'role-user', 'tenant-1', 'hash123', NOW() + INTERVAL '1 day', 'user-2')
      `);
      
      // Set anonymous context
      await setAnonymousContext();
      
      // Accept invite
      const result = await db.query(`
        UPDATE invites 
        SET status = 'accepted', accepted_at = NOW(), accepted_by = 'user-new'
        WHERE token_hash = 'hash123' AND status = 'pending'
        RETURNING *
      `);
      
      expect(result.rows).toHaveLength(1);
    });
  });
});
```

---

## API Contract Tests

### Contract Validation Tests
```typescript
describe('API Contract Tests', () => {
  describe('POST /auth/login', () => {
    test('should accept valid login request', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'user@example.com',
          password: 'ValidPassword123!'
        })
        .expect(200);
      
      // Validate response schema
      expect(response.body).toMatchSchema(loginSuccessSchema);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.session).toBeDefined();
      
      // Validate headers
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['x-ratelimit-remaining']).toBeDefined();
    });
    
    test('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'invalid-email',
          password: 'ValidPassword123!'
        })
        .expect(400);
      
      expect(response.body).toMatchSchema(errorResponseSchema);
      expect(response.body.error.code).toBe('INVALID_INPUT');
    });
    
    test('should reject weak password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'user@example.com',
          password: 'weak'
        })
        .expect(400);
      
      expect(response.body.error.code).toBe('INVALID_INPUT');
    });
    
    test('should return generic error for invalid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'user@example.com',
          password: 'WrongPassword123!'
        })
        .expect(401);
      
      expect(response.body.error.code).toBe('AUTH_FAILED');
      expect(response.body.error.message).toBe('Invalid credentials');
    });
    
    test('should enforce rate limiting', async () => {
      // Make multiple requests
      for (let i = 0; i < 6; i++) {
        const response = await request(app)
          .post('/auth/login')
          .send({
            email: 'user@example.com',
            password: 'WrongPassword123!'
          });
        
        if (i < 5) {
          expect(response.status).toBe(401);
        } else {
          expect(response.status).toBe(429);
          expect(response.body.error.code).toBe('RATE_LIMITED');
        }
      }
    });
  });
  
  describe('POST /auth/recovery/request', () => {
    test('should accept valid recovery request', async () => {
      const response = await request(app)
        .post('/auth/recovery/request')
        .send({
          email: 'user@example.com'
        })
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Recovery email sent if account exists');
    });
    
    test('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/auth/recovery/request')
        .send({
          email: 'invalid-email'
        })
        .expect(400);
      
      expect(response.body.error.code).toBe('INVALID_INPUT');
    });
    
    test('should enforce rate limiting', async () => {
      // Make multiple requests
      for (let i = 0; i < 4; i++) {
        const response = await request(app)
          .post('/auth/recovery/request')
          .send({
            email: 'user@example.com'
          });
        
        if (i < 3) {
          expect(response.status).toBe(200);
        } else {
          expect(response.status).toBe(429);
        }
      }
    });
  });
  
  describe('POST /invites/create', () => {
    test('should create invite with valid data', async () => {
      const response = await request(app)
        .post('/invites/create')
        .set('Cookie', 'session=admin-session')
        .send({
          email: 'newuser@example.com',
          role_id: 'role-user',
          tenant_id: 'tenant-1'
        })
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.invite_id).toBeDefined();
      expect(response.body.data.email).toBe('newuser@example.com');
    });
    
    test('should reject invite for existing user', async () => {
      const response = await request(app)
        .post('/invites/create')
        .set('Cookie', 'session=admin-session')
        .send({
          email: 'existing@example.com',
          role_id: 'role-user',
          tenant_id: 'tenant-1'
        })
        .expect(409);
      
      expect(response.body.error.code).toBe('USER_EXISTS');
    });
    
    test('should require admin privileges', async () => {
      const response = await request(app)
        .post('/invites/create')
        .set('Cookie', 'session=user-session')
        .send({
          email: 'newuser@example.com',
          role_id: 'role-user',
          tenant_id: 'tenant-1'
        })
        .expect(403);
      
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });
});
```

---

## E2E Critical Scenarios

### Authentication Flow Tests
```typescript
describe('E2E Authentication Flows', () => {
  beforeEach(async () => {
    await page.goto('/login');
  });
  
  describe('Login Flow', () => {
    test('should complete successful login', async () => {
      // Fill login form
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await page.fill('[data-testid="password-input"]', 'ValidPassword123!');
      
      // Submit form
      await page.click('[data-testid="login-button"]');
      
      // Wait for redirect
      await page.waitForURL('/dashboard');
      
      // Verify user is logged in
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await expect(page.locator('[data-testid="welcome-message"]')).toContainText('Welcome, user@example.com');
    });
    
    test('should show generic error for invalid credentials', async () => {
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await page.fill('[data-testid="password-input"]', 'WrongPassword123!');
      
      await page.click('[data-testid="login-button"]');
      
      // Should show generic error message
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');
      
      // Should not reveal if user exists
      await expect(page.locator('[data-testid="error-message"]')).not.toContainText('User not found');
    });
    
    test('should handle rate limiting', async () => {
      // Make multiple failed login attempts
      for (let i = 0; i < 6; i++) {
        await page.fill('[data-testid="email-input"]', 'user@example.com');
        await page.fill('[data-testid="password-input"]', 'WrongPassword123!');
        await page.click('[data-testid="login-button"]');
        
        if (i < 5) {
          await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
        } else {
          await expect(page.locator('[data-testid="rate-limit-message"]')).toBeVisible();
        }
      }
    });
  });
  
  describe('Password Recovery Flow', () => {
    test('should complete password recovery', async () => {
      // Go to recovery page
      await page.click('[data-testid="forgot-password-link"]');
      await page.waitForURL('/recovery');
      
      // Enter email
      await page.fill('[data-testid="recovery-email-input"]', 'user@example.com');
      await page.click('[data-testid="send-recovery-button"]');
      
      // Verify success message
      await expect(page.locator('[data-testid="recovery-sent-message"]')).toBeVisible();
      
      // Check email (in test environment)
      const recoveryEmail = await getTestEmail('user@example.com');
      expect(recoveryEmail.subject).toContain('Recupero Password');
      
      // Extract recovery link
      const recoveryLink = extractRecoveryLink(recoveryEmail.html);
      
      // Visit recovery link
      await page.goto(recoveryLink);
      
      // Set new password
      await page.fill('[data-testid="new-password-input"]', 'NewPassword123!');
      await page.fill('[data-testid="confirm-password-input"]', 'NewPassword123!');
      await page.click('[data-testid="reset-password-button"]');
      
      // Should redirect to login
      await page.waitForURL('/login');
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Password reset successfully');
    });
  });
  
  describe('Invitation Flow', () => {
    test('should complete user invitation', async () => {
      // Login as admin
      await loginAsAdmin();
      
      // Go to users page
      await page.goto('/users');
      
      // Create invite
      await page.click('[data-testid="invite-user-button"]');
      await page.fill('[data-testid="invite-email-input"]', 'newuser@example.com');
      await page.selectOption('[data-testid="invite-role-select"]', 'user');
      await page.click('[data-testid="send-invite-button"]');
      
      // Verify invite created
      await expect(page.locator('[data-testid="invite-success-message"]')).toBeVisible();
      
      // Check email
      const inviteEmail = await getTestEmail('newuser@example.com');
      expect(inviteEmail.subject).toContain('Invito a partecipare');
      
      // Extract invite link
      const inviteLink = extractInviteLink(inviteEmail.html);
      
      // Accept invite (new browser context)
      const newContext = await browser.newContext();
      const newPage = await newContext.newPage();
      
      await newPage.goto(inviteLink);
      
      // Fill profile form
      await newPage.fill('[data-testid="first-name-input"]', 'John');
      await newPage.fill('[data-testid="last-name-input"]', 'Doe');
      await newPage.fill('[data-testid="password-input"]', 'NewPassword123!');
      await newPage.click('[data-testid="accept-invite-button"]');
      
      // Should redirect to dashboard
      await newPage.waitForURL('/dashboard');
      await expect(newPage.locator('[data-testid="welcome-message"]')).toContainText('Welcome, John');
      
      await newContext.close();
    });
  });
});
```

---

## Security Testing

### CSRF Protection Tests
```typescript
describe('CSRF Protection', () => {
  test('should block CSRF attacks', async () => {
    // Login user
    await loginAsUser();
    
    // Create malicious form
    const maliciousForm = `
      <form id="csrf-form" action="/api/sensitive-action" method="POST">
        <input type="hidden" name="data" value="malicious">
      </form>
      <script>
        document.getElementById('csrf-form').submit();
      </script>
    `;
    
    // Inject malicious form
    await page.evaluate((form) => {
      document.body.innerHTML = form;
    }, maliciousForm);
    
    // Check response
    const response = await page.waitForResponse('/api/sensitive-action');
    expect(response.status()).toBe(403);
    
    const responseBody = await response.json();
    expect(responseBody.error.code).toBe('CSRF_TOKEN_MISSING');
  });
  
  test('should allow requests with valid CSRF token', async () => {
    await loginAsUser();
    
    // Get CSRF token from cookie
    const csrfToken = await page.evaluate(() => {
      return document.cookie
        .split('; ')
        .find(row => row.startsWith('bhm_csrf_token='))
        ?.split('=')[1];
    });
    
    // Make request with CSRF token
    const response = await page.request.post('/api/sensitive-action', {
      headers: {
        'X-CSRF-Token': csrfToken
      },
      data: { data: 'legitimate' }
    });
    
    expect(response.status()).toBe(200);
  });
});
```

### Session Security Tests
```typescript
describe('Session Security', () => {
  test('should invalidate session on logout', async () => {
    await loginAsUser();
    
    // Verify logged in
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    
    // Logout
    await page.click('[data-testid="logout-button"]');
    
    // Verify redirected to login
    await page.waitForURL('/login');
    
    // Try to access protected page
    await page.goto('/dashboard');
    
    // Should redirect back to login
    await page.waitForURL('/login');
  });
  
  test('should rotate session on password change', async () => {
    await loginAsUser();
    
    // Get initial session cookie
    const initialCookies = await page.context().cookies();
    const initialSession = initialCookies.find(c => c.name === 'bhm_session');
    
    // Change password
    await page.goto('/profile');
    await page.fill('[data-testid="current-password"]', 'CurrentPassword123!');
    await page.fill('[data-testid="new-password"]', 'NewPassword123!');
    await page.click('[data-testid="change-password-button"]');
    
    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Check new session cookie
    const newCookies = await page.context().cookies();
    const newSession = newCookies.find(c => c.name === 'bhm_session');
    
    expect(newSession.value).not.toBe(initialSession.value);
  });
  
  test('should handle session expiration', async () => {
    await loginAsUser();
    
    // Simulate session expiration
    await page.evaluate(() => {
      // Set session cookie to expired
      document.cookie = 'bhm_session=expired; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    });
    
    // Try to access protected page
    await page.goto('/dashboard');
    
    // Should redirect to login
    await page.waitForURL('/login');
  });
});
```

---

## Performance Testing

### Load Testing
```typescript
describe('Performance Tests', () => {
  test('should handle concurrent login requests', async () => {
    const concurrentUsers = 100;
    const promises = [];
    
    for (let i = 0; i < concurrentUsers; i++) {
      promises.push(
        request(app)
          .post('/auth/login')
          .send({
            email: `user${i}@example.com`,
            password: 'ValidPassword123!'
          })
      );
    }
    
    const startTime = Date.now();
    const responses = await Promise.all(promises);
    const endTime = Date.now();
    
    // Check response times
    const responseTimes = responses.map(r => r.responseTime);
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    
    expect(avgResponseTime).toBeLessThan(1000); // Under 1 second
    expect(endTime - startTime).toBeLessThan(5000); // Total time under 5 seconds
    
    // Check success rate
    const successCount = responses.filter(r => r.status === 200).length;
    expect(successCount / concurrentUsers).toBeGreaterThan(0.95); // 95% success rate
  });
  
  test('should handle rate limiting under load', async () => {
    const requests = 200;
    const promises = [];
    
    for (let i = 0; i < requests; i++) {
      promises.push(
        request(app)
          .post('/auth/login')
          .send({
            email: 'user@example.com',
            password: 'WrongPassword123!'
          })
      );
    }
    
    const responses = await Promise.all(promises);
    
    // Count rate limited responses
    const rateLimitedCount = responses.filter(r => r.status === 429).length;
    expect(rateLimitedCount).toBeGreaterThan(0);
    
    // Check that rate limiting is working
    expect(rateLimitedCount / requests).toBeGreaterThan(0.1); // At least 10% should be rate limited
  });
});
```

---

## Test Configuration

### Test Environment Setup
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    globalSetup: './tests/global-setup.ts',
    teardown: './tests/teardown.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      threshold: {
        global: {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        }
      }
    }
  }
});

// playwright.config.ts
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
```

### Test Data Management
```typescript
// tests/fixtures/test-data.ts
export const testUsers = {
  owner: {
    id: 'user-owner',
    email: 'owner@test.com',
    password: 'OwnerPassword123!',
    role: 'owner'
  },
  admin: {
    id: 'user-admin',
    email: 'admin@test.com',
    password: 'AdminPassword123!',
    role: 'admin'
  },
  user: {
    id: 'user-user',
    email: 'user@test.com',
    password: 'UserPassword123!',
    role: 'user'
  }
};

export const testTenants = {
  tenant1: {
    id: 'tenant-1',
    name: 'Test Company 1',
    slug: 'test-company-1'
  },
  tenant2: {
    id: 'tenant-2',
    name: 'Test Company 2',
    slug: 'test-company-2'
  }
};
```

---

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: Auth Hardening Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:coverage

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: bhm_auth_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test:e2e

  security-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test:security
```

---

## Test Metrics and Reporting

### Coverage Requirements
```typescript
const COVERAGE_THRESHOLDS = {
  // Overall coverage
  global: {
    branches: 85,
    functions: 85,
    lines: 85,
    statements: 85
  },
  
  // Critical modules
  'src/auth/': {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90
  },
  
  'src/security/': {
    branches: 95,
    functions: 95,
    lines: 95,
    statements: 95
  }
};
```

### Test Reporting
```typescript
// Generate test reports
const generateTestReport = async () => {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0
    },
    coverage: {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0
    },
    performance: {
      avgResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0
    },
    security: {
      vulnerabilities: 0,
      csrfTestsPassed: 0,
      sessionTestsPassed: 0,
      rateLimitTestsPassed: 0
    }
  };
  
  return report;
};
```
