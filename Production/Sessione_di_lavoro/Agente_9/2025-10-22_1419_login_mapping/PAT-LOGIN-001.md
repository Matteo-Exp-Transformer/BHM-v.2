# PATTERN: LOGIN FLOW STANDARD
**Pattern ID**: PAT-LOGIN-001
**Feature**: FEAT-AUTH-001
**Version**: 1.0.0
**Date**: 2025-10-22

---

## 📋 METADATA

**Titolo**: Login Flow con CSRF Protection e Rate Limiting
**Scope**: Autenticazione utente standard
**Attori**: Utente registrato (qualsiasi ruolo)
**Prerequisiti**:
- User ha account attivo
- User NON è bloccato (locked_until < now)
- Browser supporta cookies e JavaScript

---

## 🎯 PRECONDIZIONI

```yaml
Database State:
  - User esiste in users table
  - email_verified = TRUE
  - is_active = TRUE
  - failed_login_attempts < 20 (no lockout permanente)
  - locked_until IS NULL OR locked_until < NOW()

Frontend State:
  - User non ha sessione attiva valida
  - CSRF token fetch disponibile (backend up)
  - Rate limit client non bloccato

Backend State:
  - Supabase Auth attivo
  - Edge Functions deployate
  - Database connesso
  - Email service attivo (opzionale per recovery)
```

---

## 🔄 FLOW DETTAGLIATO

### **Step 1: Page Load**

**Trigger**: User naviga a `/login`

**Frontend Actions**:
```typescript
// LoginPage.tsx carica
1. Render LoginPage wrapper
2. Import <LoginForm /> component
3. Mostra loading spinner (se CSRF non ready)

// useCsrfToken hook (background)
4. useQuery: GET /auth/csrf-token
5. Store token in state
6. Se fail → retry 3x (ogni 30s)
7. Se fail definitivo → mostra errore "Ricarica pagina"
```

**Backend Actions**:
```typescript
// GET /auth/csrf-token endpoint
1. Generate random 32 char token
2. Store in sessions table (type='csrf', expires_at=+4h)
3. Set Cache-Control: no-store
4. Return { csrf_token, expires_at }
5. Audit log: CSRF_TOKEN_GENERATED
```

**Output**:
- Frontend: CSRF token disponibile
- User: Vede form login completo

**Edge Cases**:
- Backend down → Retry 3x → Mostra errore con bottone reload
- Slow network → Mostra loading fino a timeout (30s)

---

### **Step 2: User Input**

**Trigger**: User digita email + password

**Frontend Actions**:
```typescript
// LoginForm.tsx
1. handleInputChange('email', value)
   - Update state
   - Clear field error (se presente)

2. handleInputChange('password', value)
   - Update state
   - Clear field error (se presente)

3. Opzionale: User seleziona checkbox "Ricordami"
   - handleInputChange('rememberMe', true)
```

**Validation (Real-time - opzionale)**:
```typescript
// Non blocca submit, solo feedback visivo
onBlur email:
  - Se invalida → mostra errore "Formato email non valido"

onBlur password:
  - Se < 12 char → mostra warning "Password troppo corta"
```

**Output**:
- State: { email, password, rememberMe, csrf_token }
- User: Vede feedback validazione

---

### **Step 3: Form Submit**

**Trigger**: User clicca bottone "Accedi" o preme Enter

**Frontend Actions**:
```typescript
// LoginForm.handleSubmit()

1. preventDefault()
2. setIsSubmitting(true)

// RATE LIMIT CHECK (client-side)
3. useLoginRateLimit.canMakeRequest()
   ✅ TRUE → Continua
   ❌ FALSE → Show error toast + return

// CSRF CHECK
4. Se !csrfToken → Show error "Token sicurezza mancante" + return

// ZOD VALIDATION
5. validateForm(loginFormSchema, formData)
   ✅ success → Continua
   ❌ fail → setErrors(validation.errors) + return

// API CALL
6. recordRequest() // Track per rate limiting client
7. const response = await authClient.login(formData)
```

**Expected Errors**:
```typescript
// Handle in try/catch
- RATE_LIMITED → "Troppi tentativi. Riprova tra X secondi"
- CSRF_REQUIRED → "Sessione non valida. Riprova"
- SESSION_EXPIRED → Non applicabile al login
- NETWORK_ERROR → "Errore di connessione. Riprova"
```

---

### **Step 4: Backend Validation**

**Trigger**: POST /auth/login ricevuto

**Backend Actions**:
```typescript
// edge-functions/auth-login/index.ts

// 1. CSRF VALIDATION
const csrfToken = request.body.csrf_token
const csrfSession = await db.sessions.findOne({
  token: csrfToken,
  type: 'csrf',
  is_active: true,
  expires_at: { $gt: now() }
})
if (!csrfSession) {
  return error(403, 'CSRF_REQUIRED')
}

// 2. RATE LIMITING
const ipAddress = getUserIP(request)
const rateLimitIP = await checkRateLimit({
  key: `login:ip:${ipAddress}`,
  maxRequests: 30,
  windowMinutes: 5
})
if (rateLimitIP.blocked) {
  return error(429, 'RATE_LIMITED', { retryAfter: rateLimitIP.retryAfter })
}

const rateLimitEmail = await checkRateLimit({
  key: `login:email:${email}`,
  maxRequests: 5,
  windowMinutes: 5
})
if (rateLimitEmail.blocked) {
  return error(429, 'RATE_LIMITED', { retryAfter: rateLimitEmail.retryAfter })
}

// 3. INPUT VALIDATION (Zod backend)
const validated = validateLoginRequest(request.body)
if (!validated.success) {
  return error(400, 'VALIDATION_ERROR', validated.errors)
}

const { email, password, rememberMe } = validated.data

// 4. USER LOOKUP
const user = await db.users.findOne({ email, is_active: true })
if (!user) {
  // Incrementa rate limit anche se user non esiste (anti-enumeration)
  await createAuditLog({
    action: 'LOGIN_FAILED',
    outcome: 'failure',
    reason: 'User not found',
    ip: ipAddress,
    metadata: { email }
  })
  return error(401, 'INVALID_CREDENTIALS')
}

// 5. ACCOUNT LOCKOUT CHECK
if (user.locked_until && user.locked_until > now()) {
  const retryAfter = Math.ceil((user.locked_until - now()) / 1000)
  await createAuditLog({
    user_id: user.id,
    action: 'LOGIN_BLOCKED',
    outcome: 'failure',
    reason: 'Account locked',
    ip: ipAddress,
    metadata: { locked_until: user.locked_until }
  })
  return error(423, 'ACCOUNT_LOCKED', { retryAfter })
}

// 6. PASSWORD VERIFICATION
const passwordValid = await verifyPassword(password, user.password_hash)

if (!passwordValid) {
  // INCREMENT FAILED ATTEMPTS + ESCALATION
  const newFailedAttempts = user.failed_login_attempts + 1
  const lockoutDuration = calculateLockoutDuration(newFailedAttempts)

  await db.users.update(user.id, {
    failed_login_attempts: newFailedAttempts,
    locked_until: lockoutDuration > 0 ? addSeconds(now(), lockoutDuration) : null
  })

  await createAuditLog({
    user_id: user.id,
    action: 'LOGIN_FAILED',
    outcome: 'failure',
    reason: 'Invalid password',
    ip: ipAddress,
    metadata: {
      failed_attempts: newFailedAttempts,
      locked_until: lockoutDuration > 0 ? addSeconds(now(), lockoutDuration) : null
    }
  })

  return error(401, 'INVALID_CREDENTIALS')
}

// PASSWORD VALID → Continua
```

**Escalation Logic**:
```typescript
function calculateLockoutDuration(failedAttempts: number): number {
  if (failedAttempts === 5) return 5 * 60      // 5 min
  if (failedAttempts === 10) return 15 * 60    // 15 min
  if (failedAttempts === 15) return 60 * 60    // 1 hour
  if (failedAttempts >= 20) return 24 * 60 * 60 // 24 hours
  return 0 // No lockout
}
```

---

### **Step 5: Session Creation**

**Backend Actions** (continued):
```typescript
// 7. RESET FAILED ATTEMPTS
await db.users.update(user.id, {
  failed_login_attempts: 0,
  locked_until: null,
  last_login_at: now()
})

// 8. CLEANUP EXPIRED SESSIONS
await db.sessions.deleteMany({
  user_id: user.id,
  expires_at: { $lt: now() }
})

// 9. GENERATE SESSION TOKEN
const sessionToken = generateSessionToken() // UUID-like
const csrfTokenNew = generateCsrfToken()     // Random 32 chars

// 10. CALCULATE EXPIRATION
const sessionDuration = rememberMe
  ? 30 * 24 * 60 * 60 * 1000  // 30 giorni
  : 24 * 60 * 60 * 1000        // 24 ore

const expiresAt = new Date(Date.now() + sessionDuration)

// 11. INSERT SESSION
const session = await db.sessions.insert({
  user_id: user.id,
  session_token: sessionToken,
  csrf_token: csrfTokenNew,
  ip_address: ipAddress,
  user_agent: request.headers['user-agent'],
  is_active: true,
  expires_at: expiresAt,
  created_at: now()
})

// 12. GET USER ROLES & PERMISSIONS
const companyMembers = await db.company_members.find({
  user_id: user.id,
  is_active: true
})

const roles = companyMembers.map(m => ({
  company_id: m.company_id,
  role: m.role
}))

// 13. AUDIT LOG SUCCESS
await createAuditLog({
  user_id: user.id,
  action: 'LOGIN_SUCCESS',
  outcome: 'success',
  ip: ipAddress,
  user_agent: request.headers['user-agent'],
  metadata: {
    remember_me: rememberMe,
    session_duration_hours: sessionDuration / (60 * 60 * 1000),
    companies_count: roles.length
  }
})

// 14. RETURN RESPONSE
return {
  success: true,
  data: {
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name
    },
    session: {
      token: sessionToken,
      csrf_token: csrfTokenNew,
      expires_at: expiresAt
    },
    roles
  }
}
```

**Set Cookies**:
```typescript
// HttpOnly cookie per session token
setCookie('bhm_session_token', sessionToken, {
  httpOnly: true,
  secure: true, // HTTPS only
  sameSite: 'strict',
  expires: expiresAt
})

// CSRF token anche in cookie (leggibile da JS)
setCookie('bhm_csrf_token', csrfTokenNew, {
  httpOnly: false, // Deve essere leggibile da JS
  secure: true,
  sameSite: 'strict',
  expires: expiresAt
})
```

---

### **Step 6: Frontend Success Handler**

**Frontend Actions**:
```typescript
// LoginForm.handleSubmit (continued)

if (response.success) {
  // 1. UPDATE REACT QUERY CACHE
  queryClient.setQueryData(['user-session'], response.data.session)
  queryClient.setQueryData(['user-profile'], response.data.user)
  queryClient.setQueryData(['user-roles'], response.data.roles)

  // 2. TOAST SUCCESS
  toast.success('Login effettuato con successo!')

  // 3. CALLBACK (se presente)
  onSuccess?.()

  // 4. NAVIGATE
  navigate('/dashboard')

} else {
  // HANDLE ERROR
  const errorMessage = response.error?.message || 'Errore durante il login'

  // Specific error handling
  if (response.error?.code === 'RATE_LIMITED') {
    const retryAfter = response.error.retryAfter || 300
    toast.error(`Troppi tentativi. Riprova tra ${retryAfter} secondi`)
  } else if (response.error?.code === 'ACCOUNT_LOCKED') {
    toast.error('Account temporaneamente bloccato. Usa "Password dimenticata"')
  } else {
    toast.error(errorMessage)
  }

  setErrors({ general: errorMessage })
  onError?.(errorMessage)
}

setIsSubmitting(false)
```

---

### **Step 7: Multi-Company Setup**

**Trigger**: User arriva su /dashboard

**Frontend Actions**:
```typescript
// useAuth hook (automatic)

// 1. FETCH USER COMPANIES
const { data: companies } = useQuery({
  queryKey: ['user-companies', user.id],
  queryFn: async () => {
    const { data } = await supabase
      .from('company_members')
      .select('company_id, role, companies(name)')
      .eq('user_id', user.id)
      .eq('is_active', true)

    return data
  }
})

// 2. FETCH USER SESSION (active_company_id)
const { data: session } = useQuery({
  queryKey: ['user-session', user.id],
  queryFn: async () => {
    // Check esistente
    let { data: existing } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (existing) return existing

    // Se non esiste, crea con logica preferenza

    // A. Check preferenza utente
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('preferred_company_id')
      .eq('user_id', user.id)
      .single()

    // B. Determina active_company_id
    const activeCompanyId = prefs?.preferred_company_id
      || companies[0]?.company_id  // Fallback: prima disponibile

    // C. Crea sessione
    const { data: newSession } = await supabase
      .from('user_sessions')
      .insert({
        user_id: user.id,
        active_company_id: activeCompanyId,
        last_activity: new Date().toISOString()
      })
      .select()
      .single()

    return newSession
  },
  enabled: !!user.id && companies.length > 0
})

// 3. START ACTIVITY TRACKING
useEffect(() => {
  if (!user?.id || !session?.active_company_id) return

  const updateActivity = async () => {
    await supabase
      .from('user_sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('user_id', user.id)
  }

  // Ogni 3 minuti
  const interval = setInterval(updateActivity, 3 * 60 * 1000)

  return () => clearInterval(interval)
}, [user?.id, session?.active_company_id])
```

**Output**:
- User vede dashboard dell'azienda attiva
- Dropdown aziende mostra tutte le companies disponibili
- Activity tracking parte in background

---

## 📤 OUTPUT ATTESI

### **Success Case**

**Frontend State**:
```typescript
{
  isAuthenticated: true,
  user: {
    id: "uuid-123",
    email: "mario@ristorante.com",
    first_name: "Mario",
    last_name: "Rossi"
  },
  session: {
    token: "session-uuid-456",
    csrf_token: "csrf-abc123...",
    expires_at: "2025-10-23T14:30:00Z"
  },
  companies: [
    {
      company_id: "company-1",
      company_name: "Pizzeria Mario",
      role: "admin"
    },
    {
      company_id: "company-2",
      company_name: "Trattoria Sole",
      role: "dipendente"
    }
  ],
  activeCompanyId: "company-1",
  userRole: "admin",
  permissions: {
    canManageStaff: true,
    canManageDepartments: true,
    canViewAllTasks: true,
    canManageConservation: true,
    canExportData: true,
    canManageSettings: true
  }
}
```

**Database State**:
```sql
-- users table
UPDATE users
SET failed_login_attempts = 0,
    locked_until = NULL,
    last_login_at = NOW()
WHERE id = 'uuid-123';

-- sessions table (nuovo record)
INSERT INTO sessions (
  user_id,
  session_token,
  csrf_token,
  expires_at,
  is_active
) VALUES (
  'uuid-123',
  'session-uuid-456',
  'csrf-abc123...',
  NOW() + INTERVAL '24 hours', -- o 30 giorni se rememberMe
  TRUE
);

-- user_sessions table (creato o aggiornato)
INSERT INTO user_sessions (
  user_id,
  active_company_id,
  last_activity
) VALUES (
  'uuid-123',
  'company-1',
  NOW()
)
ON CONFLICT (user_id) DO UPDATE
SET active_company_id = 'company-1',
    last_activity = NOW();

-- audit_log (nuovo record)
INSERT INTO audit_log (
  user_id,
  action,
  outcome,
  ip_address,
  user_agent,
  metadata
) VALUES (
  'uuid-123',
  'LOGIN_SUCCESS',
  'success',
  '192.168.1.1',
  'Mozilla/5.0...',
  '{"remember_me": true, "session_duration_hours": 720, "companies_count": 2}'
);
```

**User Experience**:
- ✅ Toast verde: "Login effettuato con successo!"
- ✅ Redirect automatico a /dashboard
- ✅ Dashboard mostra dati azienda attiva
- ✅ Header mostra nome utente + dropdown aziende

---

### **Failure Cases**

#### **1. Invalid Credentials**

**Response**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email o password non corretti"
  }
}
```

**Frontend**:
- Toast rosso con messaggio
- Form rimane compilato (email visibile, password cancellata)
- Focus su campo password

**Database**:
```sql
-- failed_login_attempts incrementato
UPDATE users
SET failed_login_attempts = failed_login_attempts + 1
WHERE email = 'mario@ristorante.com';

-- audit log
INSERT INTO audit_log (action, outcome, reason)
VALUES ('LOGIN_FAILED', 'failure', 'Invalid password');
```

---

#### **2. Account Locked (Escalation)**

**Scenario**: User ha fatto 5 tentativi falliti

**Response**:
```json
{
  "success": false,
  "error": {
    "code": "ACCOUNT_LOCKED",
    "message": "Account temporaneamente bloccato",
    "retryAfter": 300
  }
}
```

**Frontend**:
```tsx
// Banner arancione visibile
<div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
  <p>⚠️ Troppi tentativi di accesso</p>
  <p>Riprova tra <Countdown seconds={retryAfter} /> secondi</p>
</div>

// Bottone "Accedi" disabilitato
<button disabled={true}>Accedi</button>
```

**Database**:
```sql
-- locked_until settato
UPDATE users
SET failed_login_attempts = 5,
    locked_until = NOW() + INTERVAL '5 minutes'
WHERE email = 'mario@ristorante.com';
```

---

#### **3. Rate Limited (IP or Email)**

**Response**:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Troppi tentativi. Riprova più tardi",
    "retryAfter": 180
  }
}
```

**Frontend**: Stessa UI di Account Locked

---

## 🧪 EDGE CASES

### **1. User con 0 companies**

**Scenario**: User registrato ma non assegnato a nessuna azienda

**Comportamento**:
```typescript
// useAuth rileva companies.length === 0
if (companies.length === 0) {
  // Redirect a pagina onboarding/waiting
  navigate('/waiting-approval')

  // Mostra messaggio
  return (
    <div>
      <h1>Account in attesa di approvazione</h1>
      <p>Contatta l'amministratore per essere assegnato a un'azienda.</p>
    </div>
  )
}
```

---

### **2. CSRF Token scaduto durante compilazione form**

**Scenario**: User apre pagina login, va a pranzo, torna dopo 5 ore, clicca "Accedi"

**Comportamento**:
```typescript
// useCsrfToken hook ha auto-refresh
// Ma se user è offline, token scade

// Al submit:
if (!csrfToken || isCsrfExpired(csrfToken)) {
  // Auto-refresh prima di submit
  const { data: newToken } = await refetchCsrfToken()

  if (newToken) {
    formData.csrf_token = newToken
    // Riprova submit
  } else {
    toast.error('Sessione scaduta. Ricarica la pagina')
    return
  }
}
```

---

### **3. Concurrent Login (2 tab)**

**Scenario**: User apre 2 tab, fa login in entrambe

**Comportamento**:
- ✅ Entrambe le tab ricevono session token valido
- ✅ Entrambe hanno CSRF token diverso (generato per ognuna)
- ✅ Entrambe funzionano indipendentemente
- ⚠️ Last activity tracking può avere race condition (accettabile)

---

### **4. Remember Me + Cambio Password**

**Scenario**: User ha remember me attivo (token 30 giorni), cambia password da altro device

**Comportamento**:
```typescript
// Backend: auth-recovery-confirm endpoint
// Revoca TUTTE le altre sessioni
await db.sessions.updateMany(
  { user_id: user.id, id: { $ne: currentSessionId } },
  { is_active: false }
)

// Frontend (su device con vecchia sessione):
// Next request fallisce con 401
// useAuth rileva → Auto-logout → Redirect a /login
```

---

## 🎯 ACCEPTANCE CRITERIA

**Given** un utente registrato con credenziali valide
**When** accede alla pagina /login
**Then** vede form con email, password, checkbox "Ricordami"

**Given** form login compilato correttamente
**When** clicca "Accedi"
**Then** viene autenticato e reindirizzato a /dashboard in <2s

**Given** credenziali sbagliate (5 volte)
**When** clicca "Accedi" la 5a volta
**Then** vede messaggio "Account bloccato per 5 minuti" con countdown

**Given** checkbox "Ricordami" selezionato
**When** effettua login
**Then** sessione dura 30 giorni invece di 24 ore

**Given** utente con 3 aziende
**When** effettua login
**Then** viene attivata ultima azienda usata (o preferita se settata)

**Given** CSRF token fallisce
**When** tenta login
**Then** vede errore e può ricaricare pagina per nuovo token

---

## 🧪 FIXTURES (Test Data)

```typescript
// Valid User
const validUser = {
  email: 'mario@ristorante.com',
  password: 'MarioRossi123', // 12 char, lettere+numeri
  expected: {
    userId: 'uuid-123',
    firstName: 'Mario',
    lastName: 'Rossi',
    companies: 2,
    defaultRole: 'admin'
  }
}

// Invalid Credentials
const invalidUser = {
  email: 'mario@ristorante.com',
  password: 'WrongPassword',
  expected: {
    error: 'INVALID_CREDENTIALS',
    failedAttempts: 1
  }
}

// Locked Account
const lockedUser = {
  email: 'locked@ristorante.com',
  password: 'LockedUser123',
  expectedBehavior: {
    error: 'ACCOUNT_LOCKED',
    retryAfter: 300,
    canUseRecovery: true
  }
}

// Rate Limited
const rateLimitedIP = {
  ip: '192.168.1.100',
  attempts: 6, // Over 5/5min limit
  expectedBehavior: {
    error: 'RATE_LIMITED',
    retryAfter: 180,
    allUsersFromIPBlocked: true
  }
}
```

---

## 📊 TARGETS

**Performance**:
- Page Load: <1s
- CSRF Fetch: <200ms
- Login API: <500ms
- Total Time to Dashboard: <2s

**Security**:
- Brute Force Protection: ✅ (rate limiting + escalation)
- CSRF Protection: ✅ (token obbligatorio)
- Password Storage: ✅ (bcrypt cost=10)
- Session Security: ✅ (httpOnly cookies)

**Reliability**:
- CSRF Retry Success Rate: >95%
- Session Persistence: 99.99%

---

## 🔗 COLLEGAMENTI

**Upstream Patterns**:
- Nessuno (entry point)

**Downstream Patterns**:
- PAT-MULTICOMPANY-001 (multi-company setup dopo login)
- PAT-RECOVERY-001 (se user dimentica password)

**Related Artifacts**:
- FEAT-AUTH-001 (Feature Spec)
- DoD_LOGIN.md (Definition of Done)
- TEST_STRATEGY.md (Testing)

---

## ✅ HANDOFF NOTES

**Per Agente 4 (Backend)**:
- Implementare escalation logic in business-logic.ts
- Migrare password hash da SHA-256 a bcrypt
- Verificare audit log copre tutti gli eventi
- Testare rate limiting con load test

**Per Agente 5 (Frontend)**:
- Modificare LoginPage per usare LoginForm
- Implementare CSRF fetch al page load
- Testare countdown real-time con mock data
- Accessibility: testare con screen reader

**Per Agente 6 (Testing)**:
- Creare test escalation completo (5 → 10 → 15 → 20 tentativi)
- Testare CSRF expiration + auto-refresh
- E2E: login → multi-company → dashboard
- Performance: verificare <2s total time
