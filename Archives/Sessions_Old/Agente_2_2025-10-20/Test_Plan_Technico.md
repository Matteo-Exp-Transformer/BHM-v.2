# Test Plan Tecnico - Login Hardening System

**Data**: 2025-10-20  
**Autore**: Agente 2 (Systems/API/DB)  
**Versione**: 1.0

## Overview

Piano di testing tecnico completo per il sistema di autenticazione hardening. Include test unitari, integration, contract e E2E con esempi specifici e dati di test.

---

## Testing Strategy

### Contract Tests
Contract tests verificano che le API rispettino i contratti definiti nell'API Specification. Questi test sono critici per garantire compatibilità tra frontend e backend.

#### API Contract Validation
```typescript
describe('API Contract Tests', () => {
  test('POST /auth/login contract compliance', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'user@example.com',
        password: 'ValidPassword'
      });
    
    // Validate response structure matches OpenAPI spec
    expect(response.body).toMatchSchema(loginResponseSchema);
    expect(response.headers).toMatchSchema(loginHeadersSchema);
    
    // Validate required fields
    expect(response.body).toHaveProperty('success');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data).toHaveProperty('session');
    
    // Validate data types
    expect(typeof response.body.success).toBe('boolean');
    expect(typeof response.body.data.user.id).toBe('string');
    expect(typeof response.body.data.session.id).toBe('string');
  });
  
  test('Error response contract compliance', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'user@example.com',
        password: 'WrongPassword'
      })
      .expect(401);
    
    // Validate error response structure
    expect(response.body).toMatchSchema(errorResponseSchema);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toHaveProperty('code');
    expect(response.body.error).toHaveProperty('message');
    
    // Validate error code is one of the defined codes
    const validErrorCodes = [
      'AUTH_FAILED', 'RATE_LIMITED', 'CSRF_REQUIRED', 
      'TOKEN_INVALID', 'TOKEN_EXPIRED', 'INVITE_INVALID',
      'INVITE_EXPIRED', 'PASSWORD_POLICY_VIOLATION', 'SESSION_EXPIRED'
    ];
    expect(validErrorCodes).toContain(response.body.error.code);
  });
  
  test('Rate limiting headers contract', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'user@example.com',
        password: 'ValidPassword'
      });
    
    // Validate rate limiting headers
    expect(response.headers).toHaveProperty('x-ratelimit-remaining');
    expect(response.headers).toHaveProperty('x-ratelimit-reset');
    
    // Validate header types
    expect(Number.isInteger(parseInt(response.headers['x-ratelimit-remaining']))).toBe(true);
    expect(Number.isInteger(parseInt(response.headers['x-ratelimit-reset']))).toBe(true);
  });
});
```

#### Schema Validation Tests
```typescript
describe('Schema Validation Tests', () => {
  test('Login request schema validation', () => {
    const validRequest = {
      email: 'user@example.com',
      password: 'ValidPassword'
    };
    
    const invalidRequest = {
      email: 'invalid-email',
      password: 'short'
    };
    
    // Test valid request
    expect(loginRequestSchema.validate(validRequest)).resolves.toBeDefined();
    
    // Test invalid request
    expect(loginRequestSchema.validate(invalidRequest)).rejects.toThrow();
  });
  
  test('User response schema validation', () => {
    const validUser = {
      id: 'user-123',
      email: 'user@example.com',
      first_name: 'John',
      last_name: 'Doe',
      is_active: true,
      email_verified: true,
      created_at: '2025-01-20T10:00:00Z',
      updated_at: '2025-01-20T10:00:00Z'
    };
    
    expect(userResponseSchema.validate(validUser)).resolves.toBeDefined();
  });
});
```

---

## Testing Strategy

### Test Pyramid
```
    /\
   /  \     E2E Tests (10%)
  /____\    - Critical user flows
 /      \   - Security scenarios
            - Cross-browser compatibility

   /\
  /  \      Integration Tests (30%)
 /____\     - API contract validation
            - Database integration
            - External service mocking

  /\
 /  \       Unit Tests (60%)
/____\      - RLS policies
            - Business logic
            - Utility functions
```

### Coverage Targets
- **Unit Tests**: 85%+ coverage per moduli critici
- **Integration Tests**: 90%+ coverage per API endpoints
- **E2E Tests**: 100% coverage per scenari critici

---

## Unit Tests

### RLS Policy Tests

#### Test Setup
```sql
-- Test database setup
CREATE DATABASE bhm_auth_test;
\c bhm_auth_test;

-- Import schema
\i migrations/20250120000004_login_hardening_schema_v2.sql
\i migrations/20250120000005_login_hardening_rls_v2.sql

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

#### Test Cases

##### Users Table Policies
```typescript
describe('Users Table RLS Policies', () => {
  test('user can view own profile', async () => {
    await setUserContext('user-1');
    
    const result = await db.query(`
      SELECT * FROM users WHERE id = 'user-1'
    `);
    
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].email).toBe('owner@test.com');
  });
  
  test('user cannot view other users profiles', async () => {
    await setUserContext('user-1');
    
    const result = await db.query(`
      SELECT * FROM users WHERE id = 'user-2'
    `);
    
    expect(result.rows).toHaveLength(0);
  });
  
  test('tenant admin can view tenant users', async () => {
    await setUserContext('user-2', 'tenant-1');
    
    const result = await db.query(`
      SELECT * FROM users WHERE id IN (
        SELECT user_id FROM user_roles WHERE tenant_id = 'tenant-1'
      )
    `);
    
    expect(result.rows).toHaveLength(3);
  });
  
  test('tenant admin cannot view other tenant users', async () => {
    await setUserContext('user-2', 'tenant-1');
    
    const result = await db.query(`
      SELECT * FROM users WHERE id IN (
        SELECT user_id FROM user_roles WHERE tenant_id = 'tenant-2'
      )
    `);
    
    expect(result.rows).toHaveLength(0);
  });
});
```

##### User Roles Table Policies
```typescript
describe('User Roles Table RLS Policies', () => {
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
```

##### Invites Table Policies
```typescript
describe('Invites Table RLS Policies', () => {
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
    
    await setAnonymousContext();
    
    const result = await db.query(`
      UPDATE invites 
      SET status = 'accepted', accepted_at = NOW(), accepted_by = 'user-new'
      WHERE token_hash = 'hash123' AND status = 'pending'
      RETURNING *
    `);
    
    expect(result.rows).toHaveLength(1);
  });
});
```

### Business Logic Tests

#### Password Policy Validation
```typescript
describe('Password Policy Validation', () => {
  test('accepts valid password with letters only', () => {
    const validPasswords = [
      'MySecurePassword',
      'AnotherValidPassword',
      'VeryLongPasswordWithManyLetters'
    ];
    
    validPasswords.forEach(password => {
      expect(validatePassword(password)).toBe(true);
    });
  });
  
  test('rejects password with numbers', () => {
    const invalidPasswords = [
      'Password123',
      'MyPassword1',
      'ValidButWithNumber9'
    ];
    
    invalidPasswords.forEach(password => {
      expect(validatePassword(password)).toBe(false);
    });
  });
  
  test('rejects password with symbols', () => {
    const invalidPasswords = [
      'Password!',
      'MyPassword@',
      'ValidButWithSymbol#'
    ];
    
    invalidPasswords.forEach(password => {
      expect(validatePassword(password)).toBe(false);
    });
  });
  
  test('rejects password shorter than 12 characters', () => {
    const invalidPasswords = [
      'Short',
      'TooShort',
      'StillShort'
    ];
    
    invalidPasswords.forEach(password => {
      expect(validatePassword(password)).toBe(false);
    });
  });
});
```

#### Rate Limiting Tests
```typescript
describe('Rate Limiting', () => {
  test('allows requests within limit', async () => {
    const limiter = new RateLimiter();
    
    // Test 4 requests (limit is 5)
    for (let i = 0; i < 4; i++) {
      const result = await limiter.checkLimit('127.0.0.1', 'ip', '/auth/login');
      expect(result.allowed).toBe(true);
    }
  });
  
  test('blocks requests over limit', async () => {
    const limiter = new RateLimiter();
    
    // Test 6 requests (limit is 5)
    for (let i = 0; i < 6; i++) {
      const result = await limiter.checkLimit('127.0.0.1', 'ip', '/auth/login');
      if (i < 5) {
        expect(result.allowed).toBe(true);
      } else {
        expect(result.allowed).toBe(false);
        expect(result.reason).toBe('RATE_LIMITED');
      }
    }
  });
  
  test('applies progressive backoff', async () => {
    const limiter = new RateLimiter();
    
    // First violation
    await limiter.exceedLimit('127.0.0.1', 'ip', '/auth/login');
    const firstBlock = await limiter.getBlockDuration('127.0.0.1', 'ip');
    
    // Second violation
    await limiter.exceedLimit('127.0.0.1', 'ip', '/auth/login');
    const secondBlock = await limiter.getBlockDuration('127.0.0.1', 'ip');
    
    expect(secondBlock).toBeGreaterThan(firstBlock);
  });
});
```

#### Session Management Tests
```typescript
describe('Session Management', () => {
  test('creates secure session', async () => {
    const sessionManager = new SessionManager();
    
    const session = await sessionManager.createSession(
      'user123',
      'tenant123',
      '127.0.0.1',
      'Mozilla/5.0...',
      { loginMethod: 'password' }
    );
    
    expect(session.id).toBeDefined();
    expect(session.csrfToken).toBeDefined();
    expect(session.httpOnly).toBe(true);
    expect(session.secure).toBe(process.env.NODE_ENV === 'production');
    expect(session.sameSite).toBe('strict');
  });
  
  test('validates CSRF token', async () => {
    const csrf = new CSRFProtection();
    const sessionId = 'session123';
    const token = csrf.generateToken(sessionId);
    
    expect(csrf.verifyToken(token, sessionId)).toBe(true);
    expect(csrf.verifyToken(token, 'different-session')).toBe(false);
  });
  
  test('rotates session on password change', async () => {
    const rotation = new SessionRotation();
    const oldSession = await createTestSession();
    
    const newSession = await rotation.requireSessionRotation(
      oldSession.id,
      'password_change'
    );
    
    expect(newSession.id).not.toBe(oldSession.id);
    expect(newSession.userId).toBe(oldSession.userId);
  });
});
```

---

## Integration Tests

### API Contract Validation

#### Login Endpoint Tests
```typescript
describe('POST /auth/login Integration', () => {
  test('accepts valid login request', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'user@example.com',
        password: 'ValidPassword'
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
  
  test('rejects invalid email format', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'invalid-email',
        password: 'ValidPassword'
      })
      .expect(400);
    
    expect(response.body).toMatchSchema(errorResponseSchema);
    expect(response.body.error.code).toBe('INVALID_INPUT');
  });
  
  test('rejects weak password', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'user@example.com',
        password: 'weak'
      })
      .expect(400);
    
    expect(response.body.error.code).toBe('INVALID_INPUT');
  });
  
  test('returns generic error for invalid credentials', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'user@example.com',
        password: 'WrongPassword'
      })
      .expect(401);
    
    expect(response.body.error.code).toBe('AUTH_FAILED');
    expect(response.body.error.message).toBe('Invalid credentials');
  });
  
  test('enforces rate limiting', async () => {
    // Make multiple requests
    for (let i = 0; i < 6; i++) {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'user@example.com',
          password: 'WrongPassword'
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
```

#### Recovery Endpoint Tests
```typescript
describe('POST /auth/recovery/request Integration', () => {
  test('accepts valid recovery request', async () => {
    const response = await request(app)
      .post('/auth/recovery/request')
      .send({
        email: 'user@example.com'
      })
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Recovery email sent if account exists');
  });
  
  test('rejects invalid email format', async () => {
    const response = await request(app)
      .post('/auth/recovery/request')
      .send({
        email: 'invalid-email'
      })
      .expect(400);
    
    expect(response.body.error.code).toBe('INVALID_INPUT');
  });
  
  test('enforces rate limiting', async () => {
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
```

#### Invite Endpoint Tests
```typescript
describe('POST /invites/create Integration', () => {
  test('creates invite with valid data', async () => {
    const response = await request(app)
      .post('/invites/create')
      .set('Cookie', 'session=admin-session')
      .set('X-CSRF-Token', 'valid-csrf-token')
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
  
  test('rejects invite for existing user', async () => {
    const response = await request(app)
      .post('/invites/create')
      .set('Cookie', 'session=admin-session')
      .set('X-CSRF-Token', 'valid-csrf-token')
      .send({
        email: 'existing@example.com',
        role_id: 'role-user',
        tenant_id: 'tenant-1'
      })
      .expect(409);
    
    expect(response.body.error.code).toBe('USER_EXISTS');
  });
  
  test('requires admin privileges', async () => {
    const response = await request(app)
      .post('/invites/create')
      .set('Cookie', 'session=user-session')
      .set('X-CSRF-Token', 'valid-csrf-token')
      .send({
        email: 'newuser@example.com',
        role_id: 'role-user',
        tenant_id: 'tenant-1'
      })
      .expect(403);
    
    expect(response.body.error.code).toBe('FORBIDDEN');
  });
  
  test('requires CSRF token', async () => {
    const response = await request(app)
      .post('/invites/create')
      .set('Cookie', 'session=admin-session')
      .send({
        email: 'newuser@example.com',
        role_id: 'role-user',
        tenant_id: 'tenant-1'
      })
      .expect(403);
    
    expect(response.body.error.code).toBe('CSRF_TOKEN_MISSING');
  });
});
```

### Database Integration Tests

#### Transaction Tests
```typescript
describe('Database Transactions', () => {
  test('login creates session and audit log atomically', async () => {
    const loginService = new LoginService();
    
    await expect(async () => {
      await loginService.login('user@example.com', 'password');
    }).not.toThrow();
    
    // Verify session was created
    const session = await db.query(
      'SELECT * FROM sessions WHERE user_id = $1',
      ['user-id']
    );
    expect(session.rows).toHaveLength(1);
    
    // Verify audit log was created
    const audit = await db.query(
      'SELECT * FROM audit_log WHERE action = $1',
      ['login_success']
    );
    expect(audit.rows).toHaveLength(1);
  });
  
  test('invite creation fails if user already exists', async () => {
    const inviteService = new InviteService();
    
    // Create existing user
    await db.query(
      'INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)',
      ['user-id', 'existing@example.com', 'hash']
    );
    
    await expect(
      inviteService.createInvite('existing@example.com', 'role-id', 'tenant-id')
    ).rejects.toThrow('User already exists');
  });
});
```

---

## E2E Tests

### Critical User Flows

#### Login Flow
```typescript
describe('Login Flow E2E', () => {
  beforeEach(async () => {
    await page.goto('/login');
  });
  
  test('completes successful login', async () => {
    // Fill login form
    await page.fill('[data-testid="email-input"]', 'user@example.com');
    await page.fill('[data-testid="password-input"]', 'ValidPassword');
    
    // Submit form
    await page.click('[data-testid="login-button"]');
    
    // Wait for redirect
    await page.waitForURL('/dashboard');
    
    // Verify user is logged in
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="welcome-message"]')).toContainText('Welcome, user@example.com');
  });
  
  test('shows generic error for invalid credentials', async () => {
    await page.fill('[data-testid="email-input"]', 'user@example.com');
    await page.fill('[data-testid="password-input"]', 'WrongPassword');
    
    await page.click('[data-testid="login-button"]');
    
    // Should show generic error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');
    
    // Should not reveal if user exists
    await expect(page.locator('[data-testid="error-message"]')).not.toContainText('User not found');
  });
  
  test('handles rate limiting', async () => {
    // Make multiple failed login attempts
    for (let i = 0; i < 6; i++) {
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await page.fill('[data-testid="password-input"]', 'WrongPassword');
      await page.click('[data-testid="login-button"]');
      
      if (i < 5) {
        await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      } else {
        await expect(page.locator('[data-testid="rate-limit-message"]')).toBeVisible();
      }
    }
  });
});
```

#### Password Recovery Flow
```typescript
describe('Password Recovery Flow E2E', () => {
  test('completes password recovery', async () => {
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
    await page.fill('[data-testid="new-password-input"]', 'NewPassword123');
    await page.fill('[data-testid="confirm-password-input"]', 'NewPassword123');
    await page.click('[data-testid="reset-password-button"]');
    
    // Should redirect to login
    await page.waitForURL('/login');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Password reset successfully');
  });
});
```

#### Invitation Flow
```typescript
describe('Invitation Flow E2E', () => {
  test('completes user invitation', async () => {
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
    await newPage.fill('[data-testid="password-input"]', 'NewPassword123');
    await newPage.click('[data-testid="accept-invite-button"]');
    
    // Should redirect to dashboard
    await newPage.waitForURL('/dashboard');
    await expect(newPage.locator('[data-testid="welcome-message"]')).toContainText('Welcome, John');
    
    await newContext.close();
  });
});
```

### Security Tests

#### CSRF Protection
```typescript
describe('CSRF Protection E2E', () => {
  test('blocks CSRF attacks', async () => {
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
  
  test('allows requests with valid CSRF token', async () => {
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

#### Session Security
```typescript
describe('Session Security E2E', () => {
  test('invalidates session on logout', async () => {
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
  
  test('rotates session on password change', async () => {
    await loginAsUser();
    
    // Get initial session cookie
    const initialCookies = await page.context().cookies();
    const initialSession = initialCookies.find(c => c.name === 'bhm_session');
    
    // Change password
    await page.goto('/profile');
    await page.fill('[data-testid="current-password"]', 'CurrentPassword');
    await page.fill('[data-testid="new-password"]', 'NewPassword123');
    await page.click('[data-testid="change-password-button"]');
    
    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Check new session cookie
    const newCookies = await page.context().cookies();
    const newSession = newCookies.find(c => c.name === 'bhm_session');
    
    expect(newSession.value).not.toBe(initialSession.value);
  });
  
  test('handles session expiration', async () => {
    await loginAsUser();
    
    // Simulate session expiration
    await page.evaluate(() => {
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

## Performance Tests

### Load Testing
```typescript
describe('Performance Tests', () => {
  test('handles concurrent login requests', async () => {
    const concurrentUsers = 100;
    const promises = [];
    
    for (let i = 0; i < concurrentUsers; i++) {
      promises.push(
        request(app)
          .post('/auth/login')
          .send({
            email: `user${i}@example.com`,
            password: 'ValidPassword'
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
  
  test('handles rate limiting under load', async () => {
    const requests = 200;
    const promises = [];
    
    for (let i = 0; i < requests; i++) {
      promises.push(
        request(app)
          .post('/auth/login')
          .send({
            email: 'user@example.com',
            password: 'WrongPassword'
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

## Test Data Management

### Test Fixtures
```typescript
export const testUsers = {
  owner: {
    id: 'user-owner',
    email: 'owner@test.com',
    password: 'OwnerPassword',
    role: 'owner'
  },
  admin: {
    id: 'user-admin',
    email: 'admin@test.com',
    password: 'AdminPassword',
    role: 'admin'
  },
  user: {
    id: 'user-user',
    email: 'user@test.com',
    password: 'UserPassword',
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

export const testRoles = {
  owner: {
    id: 'role-owner',
    name: 'owner',
    permissions: ['*']
  },
  admin: {
    id: 'role-admin',
    name: 'admin',
    permissions: ['read', 'write', 'admin']
  },
  user: {
    id: 'role-user',
    name: 'user',
    permissions: ['read']
  }
};
```

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

---

## Test Execution Summary

### Test Categories Overview

| Test Type | Coverage Target | Execution Time | Critical Path |
|-----------|----------------|----------------|---------------|
| **Unit Tests** | 85%+ | < 2 min | RLS policies, business logic, utilities |
| **Integration Tests** | 90%+ | < 5 min | API contracts, database integration |
| **Contract Tests** | 100% | < 3 min | API schema compliance, response validation |
| **E2E Tests** | 100% | < 10 min | Critical user flows, security scenarios |

### Critical Test Scenarios

#### Must-Pass Tests (Build Blockers)
1. **RLS Policy Enforcement** - Multi-tenant isolation
2. **CSRF Protection** - Double-submit token validation
3. **Rate Limiting** - Multi-bucket with progressive backoff
4. **Session Security** - HttpOnly cookies, secure flags
5. **Password Policy** - Letters only, min 12 char
6. **API Contract Compliance** - OpenAPI spec adherence

#### Security Test Matrix

| Security Feature | Unit | Integration | Contract | E2E |
|------------------|------|-------------|----------|-----|
| RLS Policies | ✅ | ✅ | - | ✅ |
| CSRF Protection | ✅ | ✅ | ✅ | ✅ |
| Rate Limiting | ✅ | ✅ | ✅ | ✅ |
| Session Management | ✅ | ✅ | ✅ | ✅ |
| Password Policy | ✅ | ✅ | ✅ | ✅ |
| Input Validation | ✅ | ✅ | ✅ | ✅ |
| Error Handling | ✅ | ✅ | ✅ | ✅ |

### Test Data Requirements

#### Database Test Data
- **Tenants**: 2 test companies with different configurations
- **Users**: 3 test users per tenant (owner, admin, user)
- **Roles**: 4 default roles with different permission levels
- **Invites**: Pending, expired, and accepted invite states
- **Sessions**: Active and expired session states

#### API Test Data
- **Valid Credentials**: Test user accounts with known passwords
- **Invalid Credentials**: Malformed emails, weak passwords
- **Rate Limit Data**: IP addresses, user agents for bucket testing
- **CSRF Tokens**: Valid and invalid tokens for protection testing

### Performance Benchmarks

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Login Response Time | < 300ms p50 | > 600ms p95 |
| Session Validation | < 100ms p50 | > 200ms p95 |
| Rate Limit Check | < 50ms p50 | > 100ms p95 |
| Database Query Time | < 50ms p50 | > 100ms p95 |

### Continuous Integration Pipeline

#### Pre-commit Hooks
- Unit tests execution
- Code linting and formatting
- Schema validation
- Security scanning

#### Pull Request Checks
- Full test suite execution
- Coverage report generation
- Performance regression detection
- Security vulnerability scanning

#### Deployment Pipeline
- Production-like environment testing
- Load testing with realistic data
- Security penetration testing
- Rollback capability verification

---

## Test Deliverables

### 1. Test Code Repository
```
tests/
├── unit/
│   ├── rls-policies.test.ts
│   ├── password-policy.test.ts
│   ├── rate-limiting.test.ts
│   └── session-management.test.ts
├── integration/
│   ├── api-contracts.test.ts
│   ├── database-integration.test.ts
│   └── external-services.test.ts
├── contract/
│   ├── schema-validation.test.ts
│   └── api-compliance.test.ts
├── e2e/
│   ├── login-flow.test.ts
│   ├── recovery-flow.test.ts
│   ├── invitation-flow.test.ts
│   └── security-scenarios.test.ts
└── fixtures/
    ├── test-data.sql
    ├── test-users.json
    └── test-tenants.json
```

### 2. Test Configuration
- **Vitest** configuration for unit tests
- **Playwright** configuration for E2E tests
- **Database** test environment setup
- **CI/CD** pipeline configuration

### 3. Test Reports
- **Coverage Reports** - HTML and JSON formats
- **Performance Reports** - Response time metrics
- **Security Reports** - Vulnerability assessments
- **Test Execution Reports** - Pass/fail summaries

### 4. Documentation
- **Test Strategy** - Overall approach and methodology
- **Test Cases** - Detailed test scenarios and expected outcomes
- **Test Data** - Fixtures and test data management
- **Troubleshooting** - Common issues and solutions

---

**🎯 Test Plan Completo**: Il sistema di testing è progettato per garantire la qualità, sicurezza e performance del sistema di autenticazione hardening con coverage completa e automazione CI/CD.
