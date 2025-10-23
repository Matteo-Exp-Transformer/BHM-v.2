# TEST STRATEGY - LOGIN SYSTEM

**Feature**: FEAT-LOGIN - Complete Authentication System
**Version**: 1.0.0
**Data**: 2025-10-22
**Owner**: Agente 9 - Knowledge Brain Mapper
**Assigned to**: Agente 6 - Testing Architect

---

## PURPOSE

Questo documento definisce la strategia di testing completa per il sistema di login, coprendo:
- **Unit Tests**: Componenti isolati (funzioni, hooks, utilities)
- **Integration Tests**: Interazioni tra componenti (frontend ↔ backend)
- **E2E Tests**: User journeys completi (Playwright)
- **Security Tests**: Vulnerabilità e attack vectors
- **Performance Tests**: Benchmark e load testing
- **Accessibility Tests**: WCAG 2.1 AA compliance

---

## 🎯 TESTING OBJECTIVES

### **1. Quality Gates**

| **Metric** | **Target** | **Blocker if Below** |
|------------|------------|----------------------|
| Unit Test Coverage (Line) | ≥ 80% | 70% |
| Unit Test Coverage (Branch) | ≥ 70% | 60% |
| Integration Test Coverage | 100% critical paths | 90% |
| E2E Test Pass Rate | 100% | 95% |
| Accessibility Violations | 0 (WCAG AA) | 5 |
| Performance (P95 Login) | < 500ms | 1000ms |

### **2. Risk-Based Prioritization**

**P0 (Critical) - Blocca Deploy**:
- Login con credenziali corrette funziona
- Rate limiting blocca brute force
- CSRF protection funziona
- Password recovery completo
- Bcrypt hash/verify funziona

**P1 (High) - Fix entro 24h**:
- Remember me funziona (session 30 giorni)
- Multi-company setup corretto
- Email enumeration protection
- Token single-use enforcement

**P2 (Medium) - Fix entro Sprint**:
- Accessibility violations minori
- Performance optimization
- Visual regression tests

---

## 🧪 UNIT TESTS

### **Frontend Unit Tests**

#### **1. authSchemas.test.ts**

**File Under Test**: `src/features/auth/schemas/authSchemas.ts`

**Test Cases**:
```typescript
describe('passwordSchema', () => {
  it('should accept valid password (12 char, letters+numbers)', () => {
    const result = passwordSchema.safeParse('Password1234')
    expect(result.success).toBe(true)
  })

  it('should reject password < 12 characters', () => {
    const result = passwordSchema.safeParse('Pass123')
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain('almeno 12 caratteri')
  })

  it('should reject password without numbers', () => {
    const result = passwordSchema.safeParse('PasswordOnly')
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain('lettere e numeri')
  })

  it('should reject password without letters', () => {
    const result = passwordSchema.safeParse('123456789012')
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain('lettere e numeri')
  })

  it('should accept edge case (exactly 12 char)', () => {
    const result = passwordSchema.safeParse('Password1234')
    expect(result.success).toBe(true)
  })

  it('should accept long password (128 char)', () => {
    const longPass = 'P1' + 'a'.repeat(126)
    const result = passwordSchema.safeParse(longPass)
    expect(result.success).toBe(true)
  })
})

describe('loginFormSchema', () => {
  it('should accept valid login form data', () => {
    const data = {
      email: 'test@example.com',
      password: 'Password1234',
      rememberMe: false,
      csrf_token: 'abc123xyz456'
    }
    const result = loginFormSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should reject invalid email', () => {
    const data = {
      email: 'invalid-email',
      password: 'Password1234',
      csrf_token: 'abc123'
    }
    const result = loginFormSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should reject missing csrf_token', () => {
    const data = {
      email: 'test@example.com',
      password: 'Password1234'
    }
    const result = loginFormSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})
```

**Coverage Target**: 100% (schema files sono critici)

---

#### **2. LoginForm.test.tsx**

**File Under Test**: `src/features/auth/components/LoginForm.tsx`

**Test Cases**:
```typescript
describe('LoginForm', () => {
  beforeEach(() => {
    // Mock authClient, useCsrfToken, useRateLimit
    vi.mock('@/hooks/useCsrfToken', () => ({
      useCsrfToken: () => ({
        token: 'mock-csrf-token',
        error: null,
        isLoading: false
      })
    }))

    vi.mock('@/hooks/useRateLimit', () => ({
      useLoginRateLimit: () => ({
        canMakeRequest: true,
        secondsUntilReset: 0,
        isRateLimited: false,
        recordRequest: vi.fn()
      })
    }))
  })

  it('should render form with all fields', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /ricordami/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /accedi/i })).toBeInTheDocument()
  })

  it('should toggle password visibility', () => {
    render(<LoginForm />)
    const passwordInput = screen.getByLabelText(/password/i)
    const toggleButton = screen.getByLabelText(/mostra password/i)

    expect(passwordInput).toHaveAttribute('type', 'password')
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')
  })

  it('should handle remember me checkbox', () => {
    render(<LoginForm />)
    const checkbox = screen.getByRole('checkbox', { name: /ricordami/i })

    expect(checkbox).not.toBeChecked()
    fireEvent.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  it('should display validation errors', async () => {
    render(<LoginForm />)
    const submitButton = screen.getByRole('button', { name: /accedi/i })

    // Submit empty form
    fireEvent.click(submitButton)

    // Wait for validation errors
    await waitFor(() => {
      expect(screen.getByText(/email/i)).toBeInTheDocument()
    })
  })

  it('should call onSuccess on successful login', async () => {
    const onSuccess = vi.fn()
    render(<LoginForm onSuccess={onSuccess} />)

    // Fill form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'Password1234' }
    })

    // Mock successful API response
    vi.mocked(authClient.login).mockResolvedValue({
      success: true,
      session_token: 'mock-token'
    })

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /accedi/i }))

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('should show rate limit warning when rate limited', () => {
    vi.mocked(useLoginRateLimit).mockReturnValue({
      canMakeRequest: false,
      secondsUntilReset: 300,
      isRateLimited: true,
      recordRequest: vi.fn()
    })

    render(<LoginForm />)

    expect(screen.getByText(/troppi tentativi/i)).toBeInTheDocument()
    expect(screen.getByTestId('rate-limit-countdown')).toHaveTextContent('300')
  })

  it('should disable submit button when CSRF loading', () => {
    vi.mocked(useCsrfToken).mockReturnValue({
      token: null,
      error: null,
      isLoading: true
    })

    render(<LoginForm />)

    const submitButton = screen.getByRole('button', { name: /caricamento/i })
    expect(submitButton).toBeDisabled()
  })
})
```

**Coverage Target**: ≥ 85%

---

#### **3. useCsrfToken.test.ts**

**File Under Test**: `src/hooks/useCsrfToken.ts`

**Test Cases**:
```typescript
describe('useCsrfToken', () => {
  it('should fetch CSRF token on mount', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'csrf-token-123', expires_at: Date.now() + 14400000 })
    })
    global.fetch = mockFetch

    const { result } = renderHook(() => useCsrfToken())

    await waitFor(() => {
      expect(result.current.token).toBe('csrf-token-123')
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('should retry 3 times on failure', async () => {
    const mockFetch = vi.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'csrf-token-123' })
      })
    global.fetch = mockFetch

    const { result } = renderHook(() => useCsrfToken())

    await waitFor(() => {
      expect(result.current.token).toBe('csrf-token-123')
    })

    expect(mockFetch).toHaveBeenCalledTimes(3)
  })

  it('should set error after 3 failed retries', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'))
    global.fetch = mockFetch

    const { result } = renderHook(() => useCsrfToken())

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
      expect(result.current.token).toBeNull()
    })

    expect(mockFetch).toHaveBeenCalledTimes(3)
  })

  it('should auto-refresh token before expiration', async () => {
    vi.useFakeTimers()

    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          token: 'token-1',
          expires_at: Date.now() + 5000 // 5 secondi
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          token: 'token-2',
          expires_at: Date.now() + 14400000
        })
      })
    global.fetch = mockFetch

    const { result } = renderHook(() => useCsrfToken())

    await waitFor(() => {
      expect(result.current.token).toBe('token-1')
    })

    // Fast-forward 6 secondi (oltre expiration)
    vi.advanceTimersByTime(6000)

    await waitFor(() => {
      expect(result.current.token).toBe('token-2')
    })

    vi.useRealTimers()
  })
})
```

**Coverage Target**: ≥ 90%

---

#### **4. useRateLimit.test.ts**

**File Under Test**: `src/hooks/useRateLimit.ts`

**Test Cases**:
```typescript
describe('useLoginRateLimit', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should allow first 5 requests', () => {
    const { result } = renderHook(() => useLoginRateLimit())

    for (let i = 0; i < 5; i++) {
      expect(result.current.canMakeRequest).toBe(true)
      act(() => result.current.recordRequest())
    }

    expect(result.current.canMakeRequest).toBe(false)
    expect(result.current.isRateLimited).toBe(true)
    expect(result.current.secondsUntilReset).toBe(300) // 5 min
  })

  it('should escalate lockout duration (5 → 10 → 15 → 20+)', () => {
    const { result } = renderHook(() => useLoginRateLimit())

    // 5 tentativi → 5 min lockout
    for (let i = 0; i < 5; i++) {
      act(() => result.current.recordRequest())
    }
    expect(result.current.secondsUntilReset).toBe(300)

    // Fast-forward 5 min + 1s
    act(() => vi.advanceTimersByTime(301000))

    // Altri 5 tentativi (totale 10) → 15 min lockout
    for (let i = 0; i < 5; i++) {
      act(() => result.current.recordRequest())
    }
    expect(result.current.secondsUntilReset).toBe(900)

    // Fast-forward 15 min + 1s
    act(() => vi.advanceTimersByTime(901000))

    // Altri 5 tentativi (totale 15) → 1 ora lockout
    for (let i = 0; i < 5; i++) {
      act(() => result.current.recordRequest())
    }
    expect(result.current.secondsUntilReset).toBe(3600)

    // Fast-forward 1 ora + 1s
    act(() => vi.advanceTimersByTime(3601000))

    // Altri 5 tentativi (totale 20) → 24 ore lockout
    for (let i = 0; i < 5; i++) {
      act(() => result.current.recordRequest())
    }
    expect(result.current.secondsUntilReset).toBe(86400)
  })

  it('should reset after cooldown period', () => {
    const { result } = renderHook(() => useLoginRateLimit())

    // 5 tentativi
    for (let i = 0; i < 5; i++) {
      act(() => result.current.recordRequest())
    }

    expect(result.current.canMakeRequest).toBe(false)

    // Fast-forward 5 min + 1s
    act(() => vi.advanceTimersByTime(301000))

    expect(result.current.canMakeRequest).toBe(true)
    expect(result.current.isRateLimited).toBe(false)
  })
})
```

**Coverage Target**: ≥ 90%

---

### **Backend Unit Tests**

#### **5. bcrypt-utils.test.ts**

**File Under Test**: `supabase/functions/shared/bcrypt-utils.ts`

**Test Cases**:
```typescript
import { hashPassword, verifyPassword } from './bcrypt-utils'

describe('bcrypt-utils', () => {
  it('should hash password with cost=10', async () => {
    const password = 'Password1234'
    const hash = await hashPassword(password)

    // Bcrypt hash format: $2b$10$...
    expect(hash).toMatch(/^\$2b\$10\$/)
  })

  it('should verify correct password', async () => {
    const password = 'Password1234'
    const hash = await hashPassword(password)
    const isValid = await verifyPassword(password, hash)

    expect(isValid).toBe(true)
  })

  it('should reject incorrect password', async () => {
    const password = 'Password1234'
    const hash = await hashPassword(password)
    const isValid = await verifyPassword('WrongPassword123', hash)

    expect(isValid).toBe(false)
  })

  it('should complete hash in < 150ms', async () => {
    const password = 'Password1234'
    const start = Date.now()
    await hashPassword(password)
    const duration = Date.now() - start

    expect(duration).toBeLessThan(150)
  })

  it('should handle special characters in password', async () => {
    const password = 'P@ssw0rd!#$%^&*()'
    const hash = await hashPassword(password)
    const isValid = await verifyPassword(password, hash)

    expect(isValid).toBe(true)
  })
})
```

**Coverage Target**: 100%

---

#### **6. rate-limiter.test.ts**

**File Under Test**: `supabase/functions/shared/rate-limiter.ts`

**Test Cases**:
```typescript
import { calculateLockoutDuration, checkRateLimit } from './rate-limiter'

describe('rate-limiter', () => {
  describe('calculateLockoutDuration', () => {
    it('should return 5 min for 5 attempts', () => {
      expect(calculateLockoutDuration(5)).toBe(300)
    })

    it('should return 15 min for 10 attempts', () => {
      expect(calculateLockoutDuration(10)).toBe(900)
    })

    it('should return 1 hour for 15 attempts', () => {
      expect(calculateLockoutDuration(15)).toBe(3600)
    })

    it('should return 24 hours for 20+ attempts', () => {
      expect(calculateLockoutDuration(20)).toBe(86400)
      expect(calculateLockoutDuration(50)).toBe(86400)
    })

    it('should return 0 for < 5 attempts', () => {
      expect(calculateLockoutDuration(0)).toBe(0)
      expect(calculateLockoutDuration(4)).toBe(0)
    })
  })

  describe('checkRateLimit', () => {
    it('should allow request if not locked', async () => {
      const user = {
        id: 'user-1',
        failed_login_attempts: 3,
        locked_until: null
      }

      const result = await checkRateLimit(user)

      expect(result.allowed).toBe(true)
      expect(result.reason).toBeUndefined()
    })

    it('should block request if locked', async () => {
      const lockedUntil = new Date(Date.now() + 300000) // 5 min from now
      const user = {
        id: 'user-1',
        failed_login_attempts: 5,
        locked_until: lockedUntil
      }

      const result = await checkRateLimit(user)

      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('RATE_LIMITED')
      expect(result.retryAfter).toBe(300)
    })

    it('should allow request if lockout expired', async () => {
      const lockedUntil = new Date(Date.now() - 1000) // 1s ago (expired)
      const user = {
        id: 'user-1',
        failed_login_attempts: 5,
        locked_until: lockedUntil
      }

      const result = await checkRateLimit(user)

      expect(result.allowed).toBe(true)
    })
  })
})
```

**Coverage Target**: 100%

---

#### **7. csrf-manager.test.ts**

**File Under Test**: `supabase/functions/shared/csrf-manager.ts`

**Test Cases**:
```typescript
import { generateCsrfToken, validateCsrfToken } from './csrf-manager'

describe('csrf-manager', () => {
  it('should generate unique tokens', () => {
    const token1 = generateCsrfToken()
    const token2 = generateCsrfToken()

    expect(token1).not.toBe(token2)
    expect(token1.length).toBeGreaterThan(0)
  })

  it('should generate token with 4 hour expiration', () => {
    const result = generateCsrfToken()

    const expectedExpiry = Date.now() + 4 * 60 * 60 * 1000
    const actualExpiry = new Date(result.expires_at).getTime()

    expect(actualExpiry).toBeCloseTo(expectedExpiry, -3) // within 1 second
  })

  it('should validate correct token', async () => {
    const { token } = generateCsrfToken()
    const isValid = await validateCsrfToken(token)

    expect(isValid).toBe(true)
  })

  it('should reject expired token', async () => {
    // Mock token expired 1 hour ago
    const expiredToken = {
      token: 'expired-token-123',
      expires_at: new Date(Date.now() - 3600000)
    }

    // Store in cache
    await storeCsrfToken(expiredToken)

    const isValid = await validateCsrfToken('expired-token-123')

    expect(isValid).toBe(false)
  })

  it('should reject unknown token', async () => {
    const isValid = await validateCsrfToken('unknown-token-xyz')

    expect(isValid).toBe(false)
  })
})
```

**Coverage Target**: 100%

---

## 🔗 INTEGRATION TESTS

### **Login Flow Integration Tests**

#### **8. login-flow.integration.test.ts**

**Scope**: Frontend LoginForm ↔ Backend auth/login ↔ Database

**Test Cases**:
```typescript
describe('Login Flow Integration', () => {
  let testUser: any
  let supabase: any

  beforeEach(async () => {
    // Setup test database
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

    // Create test user with bcrypt password
    const passwordHash = await bcrypt.hash('Password1234', 10)
    testUser = await supabase.from('users').insert({
      email: 'test@example.com',
      password_hash: passwordHash,
      failed_login_attempts: 0,
      locked_until: null
    }).select().single()
  })

  afterEach(async () => {
    // Cleanup
    await supabase.from('users').delete().eq('id', testUser.id)
  })

  it('should login successfully with correct credentials', async () => {
    const response = await fetch('http://localhost:54321/functions/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password1234',
        csrf_token: 'valid-csrf-token',
        rememberMe: false
      })
    })

    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.session_token).toBeDefined()

    // Verify session created in database
    const { data: session } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', testUser.id)
      .single()

    expect(session).toBeDefined()
    expect(new Date(session.expires_at).getTime()).toBeGreaterThan(Date.now())
  })

  it('should increment failed_attempts on wrong password', async () => {
    const response = await fetch('http://localhost:54321/functions/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'WrongPassword123',
        csrf_token: 'valid-csrf-token'
      })
    })

    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)

    // Verify failed_attempts incremented
    const { data: user } = await supabase
      .from('users')
      .select('failed_login_attempts')
      .eq('id', testUser.id)
      .single()

    expect(user.failed_login_attempts).toBe(1)
  })

  it('should lock user after 5 failed attempts', async () => {
    // Make 5 failed login attempts
    for (let i = 0; i < 5; i++) {
      await fetch('http://localhost:54321/functions/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'WrongPassword123',
          csrf_token: 'valid-csrf-token'
        })
      })
    }

    // Verify user is locked
    const { data: user } = await supabase
      .from('users')
      .select('failed_login_attempts, locked_until')
      .eq('id', testUser.id)
      .single()

    expect(user.failed_login_attempts).toBe(5)
    expect(user.locked_until).not.toBeNull()
    expect(new Date(user.locked_until).getTime()).toBeGreaterThan(Date.now())

    // Attempt login with CORRECT password → should still be blocked
    const response = await fetch('http://localhost:54321/functions/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password1234', // CORRECT password
        csrf_token: 'valid-csrf-token'
      })
    })

    expect(response.status).toBe(429) // Too Many Requests
  })

  it('should create 30-day session when rememberMe=true', async () => {
    const response = await fetch('http://localhost:54321/functions/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password1234',
        csrf_token: 'valid-csrf-token',
        rememberMe: true
      })
    })

    const data = await response.json()
    expect(data.success).toBe(true)

    // Verify session expires in ~30 days
    const { data: session } = await supabase
      .from('sessions')
      .select('expires_at, remember_me')
      .eq('user_id', testUser.id)
      .single()

    const expiresIn = new Date(session.expires_at).getTime() - Date.now()
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000

    expect(session.remember_me).toBe(true)
    expect(expiresIn).toBeGreaterThan(thirtyDaysMs * 0.99) // Allow 1% margin
  })

  it('should reject login with invalid CSRF token', async () => {
    const response = await fetch('http://localhost:54321/functions/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password1234',
        csrf_token: 'invalid-token'
      })
    })

    expect(response.status).toBe(403) // Forbidden
  })

  it('should reset failed_attempts on successful login', async () => {
    // Set failed_attempts to 3
    await supabase
      .from('users')
      .update({ failed_login_attempts: 3 })
      .eq('id', testUser.id)

    // Successful login
    await fetch('http://localhost:54321/functions/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password1234',
        csrf_token: 'valid-csrf-token'
      })
    })

    // Verify reset to 0
    const { data: user } = await supabase
      .from('users')
      .select('failed_login_attempts')
      .eq('id', testUser.id)
      .single()

    expect(user.failed_login_attempts).toBe(0)
  })
})
```

**Coverage Target**: 100% critical paths

---

### **Password Recovery Integration Tests**

#### **9. password-recovery.integration.test.ts**

**Test Cases**:
```typescript
describe('Password Recovery Integration', () => {
  it('should send email when user exists', async () => {
    // Mock email service
    const emailSpy = vi.fn()
    mockEmailService(emailSpy)

    const response = await fetch('/api/auth/password-recovery/request', {
      method: 'POST',
      body: JSON.stringify({ email: 'existing@example.com' })
    })

    expect(response.status).toBe(200)
    expect(emailSpy).toHaveBeenCalledWith({
      to: 'existing@example.com',
      template: 'password-recovery',
      data: expect.objectContaining({
        recoveryLink: expect.stringContaining('token=')
      })
    })
  })

  it('should NOT send email when user does not exist (email enumeration)', async () => {
    const emailSpy = vi.fn()
    mockEmailService(emailSpy)

    const response = await fetch('/api/auth/password-recovery/request', {
      method: 'POST',
      body: JSON.stringify({ email: 'nonexistent@example.com' })
    })

    // STILL return 200 (hide existence)
    expect(response.status).toBe(200)
    expect(emailSpy).not.toHaveBeenCalled()

    // Verify audit log
    const { data: log } = await supabase
      .from('audit_log')
      .select('*')
      .eq('action', 'PASSWORD_RESET_REQUESTED_INVALID')
      .single()

    expect(log).toBeDefined()
  })

  it('should reset password with valid token', async () => {
    // Create recovery token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000)
    await supabase.from('recovery_tokens').insert({
      token,
      user_id: testUser.id,
      expires_at: expiresAt,
      used: false
    })

    // Reset password
    const response = await fetch('/api/auth/password-recovery/reset', {
      method: 'POST',
      body: JSON.stringify({
        token,
        newPassword: 'NewPassword1234'
      })
    })

    expect(response.status).toBe(200)

    // Verify token marked as used
    const { data: tokenData } = await supabase
      .from('recovery_tokens')
      .select('used, used_at')
      .eq('token', token)
      .single()

    expect(tokenData.used).toBe(true)
    expect(tokenData.used_at).not.toBeNull()

    // Verify password changed (can login with new password)
    const loginResponse = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testUser.email,
        password: 'NewPassword1234',
        csrf_token: 'valid-csrf'
      })
    })

    expect(loginResponse.status).toBe(200)
  })

  it('should reject expired recovery token', async () => {
    const token = crypto.randomBytes(32).toString('hex')
    const expiredAt = new Date(Date.now() - 1000) // 1 second ago

    await supabase.from('recovery_tokens').insert({
      token,
      user_id: testUser.id,
      expires_at: expiredAt,
      used: false
    })

    const response = await fetch('/api/auth/password-recovery/reset', {
      method: 'POST',
      body: JSON.stringify({
        token,
        newPassword: 'NewPassword1234'
      })
    })

    expect(response.status).toBe(400)
    expect(await response.json()).toMatchObject({
      error: expect.stringContaining('scaduto')
    })
  })

  it('should reject already used recovery token', async () => {
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000)

    await supabase.from('recovery_tokens').insert({
      token,
      user_id: testUser.id,
      expires_at: expiresAt,
      used: true, // Already used
      used_at: new Date()
    })

    const response = await fetch('/api/auth/password-recovery/reset', {
      method: 'POST',
      body: JSON.stringify({
        token,
        newPassword: 'NewPassword1234'
      })
    })

    expect(response.status).toBe(400)
    expect(await response.json()).toMatchObject({
      error: expect.stringContaining('già utilizzato')
    })
  })
})
```

---

### **Invite Registration Integration Tests**

#### **10. invite-registration.integration.test.ts**

**Test Cases**:
```typescript
describe('Invite Registration Integration', () => {
  it('should complete full invite flow (generate → email → register)', async () => {
    // Step 1: Admin generates invite
    const inviteResponse = await fetch('/api/auth/generate-invite', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        email: 'newuser@example.com',
        role: 'Dipendente',
        company_id: 'test-company-id'
      })
    })

    const { invite_token } = await inviteResponse.json()
    expect(invite_token).toBeDefined()

    // Step 2: Validate token (simula user click email link)
    const validateResponse = await fetch('/api/auth/validate-invite-token', {
      method: 'POST',
      body: JSON.stringify({ token: invite_token })
    })

    const validation = await validateResponse.json()
    expect(validation.valid).toBe(true)
    expect(validation.email).toBe('newuser@example.com')

    // Step 3: Complete registration
    const signupResponse = await fetch('/api/auth/sign-up', {
      method: 'POST',
      body: JSON.stringify({
        email: 'newuser@example.com',
        first_name: 'Mario',
        last_name: 'Rossi',
        password: 'Password1234',
        token: invite_token
      })
    })

    const signupData = await signupResponse.json()
    expect(signupData.success).toBe(true)
    expect(signupData.session_token).toBeDefined()

    // Verify user created
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'newuser@example.com')
      .single()

    expect(user).toBeDefined()
    expect(user.email_verified).toBe(true) // Auto-verified

    // Verify company member created
    const { data: member } = await supabase
      .from('company_members')
      .select('*')
      .eq('user_id', user.id)
      .eq('company_id', 'test-company-id')
      .single()

    expect(member.role).toBe('Dipendente')

    // Verify token marked as used
    const { data: token } = await supabase
      .from('invite_tokens')
      .select('used, used_at')
      .eq('token', invite_token)
      .single()

    expect(token.used).toBe(true)
    expect(token.used_at).not.toBeNull()
  })

  it('should prevent reusing invite token', async () => {
    // Create and use token
    const token = await createAndUseInviteToken()

    // Try to register again with same token
    const response = await fetch('/api/auth/sign-up', {
      method: 'POST',
      body: JSON.stringify({
        email: 'another@example.com',
        password: 'Password1234',
        token
      })
    })

    expect(response.status).toBe(400)
  })
})
```

---

## 🎭 E2E TESTS (Playwright)

### **Critical User Journeys**

#### **11. login-happy-path.e2e.test.ts**

**Scenario**: User navigates to login page and logs in successfully

```typescript
import { test, expect } from '@playwright/test'

test('should login successfully with correct credentials', async ({ page }) => {
  // Navigate to login page
  await page.goto('http://localhost:3000/login')

  // Fill form
  await page.fill('[data-testid="login-email-input"]', 'test@example.com')
  await page.fill('[data-testid="login-password-input"]', 'Password1234')

  // Submit
  await page.click('[data-testid="login-button"]')

  // Wait for redirect to dashboard
  await expect(page).toHaveURL(/.*dashboard/)

  // Verify dashboard loaded
  await expect(page.locator('text=Benvenuto')).toBeVisible()

  // Verify session token stored
  const sessionToken = await page.evaluate(() => localStorage.getItem('bhm_session_token'))
  expect(sessionToken).not.toBeNull()
})
```

---

#### **12. login-with-remember-me.e2e.test.ts**

```typescript
test('should create 30-day session when Remember Me checked', async ({ page }) => {
  await page.goto('http://localhost:3000/login')

  await page.fill('[data-testid="login-email-input"]', 'test@example.com')
  await page.fill('[data-testid="login-password-input"]', 'Password1234')

  // Check Remember Me
  await page.check('[data-testid="remember-me-checkbox"]')

  await page.click('[data-testid="login-button"]')

  await expect(page).toHaveURL(/.*dashboard/)

  // Verify session duration in database (requires API call or test endpoint)
  const response = await page.request.get('/api/test/session-info', {
    headers: {
      Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('bhm_session_token'))}`
    }
  })

  const sessionData = await response.json()
  const expiresIn = new Date(sessionData.expires_at).getTime() - Date.now()
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000

  expect(expiresIn).toBeGreaterThan(thirtyDaysMs * 0.99)
})
```

---

#### **13. rate-limiting-ui.e2e.test.ts**

```typescript
test('should show rate limit banner after 5 failed attempts', async ({ page }) => {
  await page.goto('http://localhost:3000/login')

  // Make 5 failed login attempts
  for (let i = 0; i < 5; i++) {
    await page.fill('[data-testid="login-email-input"]', 'test@example.com')
    await page.fill('[data-testid="login-password-input"]', 'WrongPassword123')
    await page.click('[data-testid="login-button"]')

    // Wait for error toast
    await page.waitForSelector('.Toastify__toast--error')
  }

  // Verify rate limit banner appears
  await expect(page.locator('[data-testid="rate-limit-banner-login"]')).toBeVisible()

  // Verify countdown starts at 300 seconds
  const countdown = page.locator('[data-testid="rate-limit-countdown"]')
  const initialSeconds = parseInt(await countdown.textContent() || '0')
  expect(initialSeconds).toBeGreaterThan(290) // Allow small delay

  // Verify countdown decreases
  await page.waitForTimeout(2000) // Wait 2 seconds
  const newSeconds = parseInt(await countdown.textContent() || '0')
  expect(newSeconds).toBeLessThan(initialSeconds)

  // Verify login button disabled
  await expect(page.locator('[data-testid="login-button"]')).toBeDisabled()
})
```

---

#### **14. password-recovery.e2e.test.ts**

```typescript
test('should complete password recovery flow', async ({ page }) => {
  // Step 1: Request password recovery
  await page.goto('http://localhost:3000/login')
  await page.click('text=Password dimenticata?')

  await expect(page).toHaveURL(/.*forgot-password/)

  await page.fill('[data-testid="recovery-email-input"]', 'test@example.com')
  await page.click('[data-testid="recovery-submit-button"]')

  // Verify success message (same for existing/non-existing email)
  await expect(page.locator('text=riceverai un link')).toBeVisible()

  // Step 2: Simulate clicking email link (get token from test DB)
  const recoveryToken = await getRecoveryTokenFromDB('test@example.com')
  await page.goto(`http://localhost:3000/reset-password?token=${recoveryToken}`)

  // Step 3: Set new password
  await page.fill('[data-testid="new-password-input"]', 'NewPassword1234')
  await page.fill('[data-testid="confirm-password-input"]', 'NewPassword1234')
  await page.click('[data-testid="reset-submit-button"]')

  // Verify redirect to login with success message
  await expect(page).toHaveURL(/.*login/)
  await expect(page.locator('text=Password modificata')).toBeVisible()

  // Step 4: Login with new password
  await page.fill('[data-testid="login-email-input"]', 'test@example.com')
  await page.fill('[data-testid="login-password-input"]', 'NewPassword1234')
  await page.click('[data-testid="login-button"]')

  await expect(page).toHaveURL(/.*dashboard/)
})
```

---

#### **15. invite-registration.e2e.test.ts**

```typescript
test('should complete invite registration flow', async ({ page, request }) => {
  // Step 1: Admin generates invite (via API)
  const inviteResponse = await request.post('/api/auth/generate-invite', {
    headers: { Authorization: `Bearer ${adminToken}` },
    data: {
      email: 'newemployee@example.com',
      role: 'Dipendente',
      company_id: 'test-company-id'
    }
  })

  const { invite_token } = await inviteResponse.json()

  // Step 2: User clicks email link
  await page.goto(`http://localhost:3000/sign-up?token=${invite_token}`)

  // Verify form pre-filled
  const emailInput = page.locator('[data-testid="signup-email-input"]')
  await expect(emailInput).toHaveValue('newemployee@example.com')
  await expect(emailInput).toBeDisabled() // Read-only

  // Verify role and company displayed
  await expect(page.locator('text=Ruolo: Dipendente')).toBeVisible()
  await expect(page.locator('text=Azienda:')).toBeVisible()

  // Step 3: Complete registration
  await page.fill('[data-testid="signup-firstname-input"]', 'Mario')
  await page.fill('[data-testid="signup-lastname-input"]', 'Rossi')
  await page.fill('[data-testid="signup-password-input"]', 'Password1234')
  await page.fill('[data-testid="signup-confirm-password-input"]', 'Password1234')

  await page.click('[data-testid="signup-submit-button"]')

  // Verify redirect to onboarding
  await expect(page).toHaveURL(/.*onboarding/)
})

test('should show error for expired invite token', async ({ page }) => {
  const expiredToken = await createExpiredInviteToken()

  await page.goto(`http://localhost:3000/sign-up?token=${expiredToken}`)

  // Verify error message
  await expect(page.locator('text=Link scaduto')).toBeVisible()

  // Verify redirect to login
  await expect(page).toHaveURL(/.*login/, { timeout: 5000 })
})
```

---

## 🔒 SECURITY TESTS

### **16. Brute Force Attack Test**

```typescript
test('should block brute force attack', async () => {
  const email = 'victim@example.com'

  // Simulate attacker trying common passwords
  const commonPasswords = [
    'password123', '123456789', 'qwerty123', 'admin1234', 'letmein123'
  ]

  for (const password of commonPasswords) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        csrf_token: 'valid-csrf'
      })
    })

    // Should be blocked after 5 attempts
    if (commonPasswords.indexOf(password) >= 5) {
      expect(response.status).toBe(429)
      break
    }
  }

  // Verify user locked
  const { data: user } = await supabase
    .from('users')
    .select('locked_until')
    .eq('email', email)
    .single()

  expect(user.locked_until).not.toBeNull()
})
```

---

### **17. CSRF Attack Test**

```typescript
test('should reject login without CSRF token', async () => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'Password1234'
      // NO csrf_token
    })
  })

  expect(response.status).toBe(403)
})

test('should reject login with invalid CSRF token', async () => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'Password1234',
      csrf_token: 'forged-token-by-attacker'
    })
  })

  expect(response.status).toBe(403)
})
```

---

### **18. Email Enumeration Test**

```typescript
test('should not reveal if email exists via timing', async () => {
  const existingEmail = 'existing@example.com'
  const nonExistingEmail = 'nonexisting@example.com'

  // Measure response time for existing email
  const start1 = Date.now()
  await fetch('/api/auth/password-recovery/request', {
    method: 'POST',
    body: JSON.stringify({ email: existingEmail })
  })
  const duration1 = Date.now() - start1

  // Measure response time for non-existing email
  const start2 = Date.now()
  await fetch('/api/auth/password-recovery/request', {
    method: 'POST',
    body: JSON.stringify({ email: nonExistingEmail })
  })
  const duration2 = Date.now() - start2

  // Response times should be similar (within 100ms tolerance)
  expect(Math.abs(duration1 - duration2)).toBeLessThan(100)
})
```

---

### **19. Token Reuse Prevention Test**

```typescript
test('should prevent reusing recovery token', async () => {
  const token = await createRecoveryToken('test@example.com')

  // First use: Reset password
  const response1 = await fetch('/api/auth/password-recovery/reset', {
    method: 'POST',
    body: JSON.stringify({
      token,
      newPassword: 'NewPassword1234'
    })
  })

  expect(response1.status).toBe(200)

  // Second use: Try again with same token
  const response2 = await fetch('/api/auth/password-recovery/reset', {
    method: 'POST',
    body: JSON.stringify({
      token,
      newPassword: 'AnotherPassword456'
    })
  })

  expect(response2.status).toBe(400)
  expect(await response2.json()).toMatchObject({
    error: expect.stringContaining('già utilizzato')
  })
})
```

---

## ⚡ PERFORMANCE TESTS

### **20. Bcrypt Performance Benchmark**

```typescript
test('bcrypt hash should complete in < 150ms', async () => {
  const password = 'Password1234'
  const iterations = 10

  const durations: number[] = []

  for (let i = 0; i < iterations; i++) {
    const start = performance.now()
    await bcrypt.hash(password, 10)
    const duration = performance.now() - start
    durations.push(duration)
  }

  const p95 = percentile(durations, 95)

  expect(p95).toBeLessThan(150)
})
```

---

### **21. Login Endpoint Performance**

```typescript
test('login endpoint should respond in < 500ms (P95)', async () => {
  const durations: number[] = []
  const iterations = 100

  for (let i = 0; i < iterations; i++) {
    const start = performance.now()
    await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password1234',
        csrf_token: 'valid-csrf'
      })
    })
    const duration = performance.now() - start
    durations.push(duration)
  }

  const p95 = percentile(durations, 95)

  expect(p95).toBeLessThan(500)
})
```

---

## ♿ ACCESSIBILITY TESTS

### **22. LoginPage Accessibility**

```typescript
import { expect, test } from '@playwright/test'
import { injectAxe, checkA11y } from 'axe-playwright'

test('LoginPage should have 0 accessibility violations', async ({ page }) => {
  await page.goto('http://localhost:3000/login')

  // Inject axe-core
  await injectAxe(page)

  // Run accessibility checks (WCAG 2.1 AA)
  const violations = await checkA11y(page, null, {
    runOnly: ['wcag2a', 'wcag2aa']
  })

  expect(violations).toHaveLength(0)
})

test('LoginForm should be keyboard navigable', async ({ page }) => {
  await page.goto('http://localhost:3000/login')

  // Tab through form
  await page.keyboard.press('Tab') // Email field
  await expect(page.locator('[data-testid="login-email-input"]')).toBeFocused()

  await page.keyboard.press('Tab') // Password field
  await expect(page.locator('[data-testid="login-password-input"]')).toBeFocused()

  await page.keyboard.press('Tab') // Show password button
  await expect(page.locator('[aria-label="Mostra password"]')).toBeFocused()

  await page.keyboard.press('Tab') // Remember Me checkbox
  await expect(page.locator('[data-testid="remember-me-checkbox"]')).toBeFocused()

  await page.keyboard.press('Tab') // Submit button
  await expect(page.locator('[data-testid="login-button"]')).toBeFocused()
})
```

---

## 📊 TEST EXECUTION PLAN

### **Phase 1: Unit Tests** (Week 1)
- [ ] Frontend unit tests (authSchemas, LoginForm, hooks)
- [ ] Backend unit tests (bcrypt-utils, rate-limiter, csrf-manager)
- **Target**: ≥ 80% line coverage
- **Owner**: Agente 6

### **Phase 2: Integration Tests** (Week 2)
- [ ] Login flow integration
- [ ] Password recovery integration
- [ ] Invite registration integration
- **Target**: 100% critical paths
- **Owner**: Agente 6

### **Phase 3: E2E Tests** (Week 3)
- [ ] Happy path journeys
- [ ] Error scenarios
- [ ] Visual regression tests
- **Target**: 100% pass rate
- **Owner**: Agente 6

### **Phase 4: Security & Performance** (Week 4)
- [ ] Security tests (brute force, CSRF, email enumeration)
- [ ] Performance benchmarks (bcrypt, login endpoint)
- [ ] Accessibility audit
- **Target**: 0 high/critical security issues, P95 < 500ms
- **Owner**: Agente 7 + Agente 6

---

## 🚨 FAILURE HANDLING

### **When Tests Fail**

1. **Unit Test Failure**:
   - Blocker: YES (if coverage < 70%)
   - Action: Fix code or test, re-run
   - Owner: Development agent (4/5)

2. **Integration Test Failure**:
   - Blocker: YES (if critical path)
   - Action: Debug API/DB interaction, verify contracts
   - Owner: Agente 2 (review contracts) + Agente 4/5 (fix implementation)

3. **E2E Test Failure**:
   - Blocker: YES (if P0 journey)
   - Action: Check if flaky (retry 3x), then investigate
   - Owner: Agente 6 (stabilize test) or Agente 5 (fix UI)

4. **Security Test Failure**:
   - Blocker: YES (always)
   - Action: Immediate fix, security review
   - Owner: Agente 7 (analyze) + Agente 4 (fix backend)

5. **Performance Test Failure**:
   - Blocker: NO (if within 10% of target)
   - Action: Optimize (bcrypt cost, database queries, caching)
   - Owner: Agente 4 (backend optimization)

---

## 📈 TEST METRICS & REPORTING

### **Daily Metrics** (CI/CD Pipeline)
- Unit test pass rate
- Integration test pass rate
- E2E test pass rate
- Code coverage %

### **Weekly Report** (to Agente 0)
- Test execution summary
- New test cases added
- Flaky tests identified
- Performance trends

### **Pre-Deploy Checklist**
- [ ] All P0 tests passing (100%)
- [ ] Coverage ≥ 80%
- [ ] Security tests passing (0 high/critical)
- [ ] Performance benchmarks met (P95 < 500ms)
- [ ] Accessibility violations = 0

---

**END OF TEST STRATEGY - LOGIN SYSTEM**
