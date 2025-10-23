# PATTERN: PASSWORD RECOVERY FLOW
**Pattern ID**: PAT-RECOVERY-001
**Feature**: FEAT-AUTH-001
**Version**: 1.0.0
**Date**: 2025-10-22

---

## 📋 METADATA

**Titolo**: Password Recovery con Email Enumeration Protection
**Scope**: Reset password dimenticata
**Attori**: Utente registrato (qualsiasi ruolo, anche bloccato)
**Prerequisiti**:
- User ha account attivo
- Email service funzionante
- User ha accesso alla email registrata

---

## 🎯 PRECONDIZIONI

```yaml
Database State:
  - User esiste in users table
  - email_verified = TRUE (opzionale)
  - is_active = TRUE
  - NOTA: Account può essere locked (recovery è escape route)

Frontend State:
  - User NON è loggato (o vuole cambiare password dimenticata)
  - CSRF token disponibile

Backend State:
  - Email service configurato (SMTP/SendGrid/etc)
  - Recovery email template pronto
```

---

## 🔄 FLOW DETTAGLIATO

### **Step 1: Request Recovery**

**Trigger**: User clicca "Password dimenticata?" da login page

**Frontend Actions**:
```typescript
// Navigate to /forgot-password
navigate('/forgot-password')

// Render ForgotPasswordForm
<form onSubmit={handleSubmit}>
  <input
    type="email"
    name="email"
    placeholder="mario@ristorante.com"
    required
  />
  <button type="submit">Invia link di reset</button>
</form>
```

**User Input**: Email address

**Validation**:
```typescript
// Client-side Zod
const recoveryRequestSchema = z.object({
  email: emailSchema, // RFC 5322
  csrf_token: z.string().min(1)
})

const validation = validateForm(recoveryRequestSchema, formData)
if (!validation.success) {
  setErrors(validation.errors)
  return
}
```

---

### **Step 2: Backend Processing**

**Trigger**: POST /auth/recovery/request

**Backend Actions**:
```typescript
// edge-functions/auth-recovery-request/index.ts

// 1. CSRF VALIDATION
const csrfValid = await validateCsrfToken(request.body.csrf_token)
if (!csrfValid) {
  return error(403, 'CSRF_REQUIRED')
}

// 2. RATE LIMITING (Email-based + IP-based)
const ipRateLimit = await checkRateLimit({
  key: `recovery:ip:${ipAddress}`,
  maxRequests: 10,
  windowMinutes: 15
})

if (ipRateLimit.blocked) {
  return error(429, 'RATE_LIMITED', { retryAfter: ipRateLimit.retryAfter })
}

const emailRateLimit = await checkRateLimit({
  key: `recovery:email:${email}`,
  maxRequests: 3,
  windowMinutes: 15
})

if (emailRateLimit.blocked) {
  // SEMPRE ritorna success (email enumeration protection)
  // Ma NON invia email
  await createAuditLog({
    action: 'PASSWORD_RESET_RATE_LIMITED',
    outcome: 'blocked',
    metadata: { email, ip: ipAddress }
  })

  return {
    success: true,
    message: "Se l'email esiste nel sistema, riceverai un link di reset"
  }
}

// 3. USER LOOKUP
const user = await db.users.findOne({
  email,
  is_active: true
})

// 4. GENERATE RECOVERY TOKEN (anche se user non esiste)
const recoveryToken = generateUUID()
const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 ore

if (user) {
  // USER ESISTE → Crea recovery session + invia email

  // 4a. Invalidate vecchi recovery tokens
  await db.sessions.updateMany(
    {
      user_id: user.id,
      type: 'recovery',
      is_active: true
    },
    {
      is_active: false
    }
  )

  // 4b. Create new recovery session
  await db.sessions.insert({
    user_id: user.id,
    session_token: recoveryToken,
    type: 'recovery',
    is_active: true,
    expires_at: expiresAt,
    ip_address: ipAddress,
    created_at: now()
  })

  // 4c. Send recovery email
  const recoveryLink = `${process.env.APP_URL}/reset-password?token=${recoveryToken}`

  await sendEmail({
    to: user.email,
    subject: 'BHM - Reset Password',
    template: 'password-recovery',
    data: {
      firstName: user.first_name || 'Utente',
      recoveryLink,
      expiresInHours: 12
    }
  })

  // 4d. Audit log
  await createAuditLog({
    user_id: user.id,
    action: 'PASSWORD_RESET_REQUESTED',
    outcome: 'success',
    ip: ipAddress,
    metadata: {
      recovery_token_id: recoveryToken,
      expires_at: expiresAt
    }
  })

} else {
  // USER NON ESISTE → NON invia email, MA ritorna success

  // Audit log (no user_id)
  await createAuditLog({
    action: 'PASSWORD_RESET_REQUESTED_INVALID',
    outcome: 'failure',
    reason: 'User not found',
    ip: ipAddress,
    metadata: { email }
  })

  // IMPORTANTE: Delay artificiale per sembrare uguale a caso success
  await sleep(randomInt(100, 300))
}

// 5. SEMPRE ritorna success (email enumeration protection)
return {
  success: true,
  message: "Se l'email esiste nel sistema, riceverai un link di reset"
}
```

**Email Template** (password-recovery.html):
```html
<!DOCTYPE html>
<html>
<body>
  <h1>Reset Password - BHM</h1>

  <p>Ciao {{firstName}},</p>

  <p>Hai richiesto di resettare la tua password per Business HACCP Manager.</p>

  <p>Clicca sul link qui sotto per impostare una nuova password:</p>

  <a href="{{recoveryLink}}" style="...">
    Reset Password
  </a>

  <p><strong>Questo link scadrà tra {{expiresInHours}} ore.</strong></p>

  <p>Se non hai richiesto questo reset, ignora questa email. La tua password non verrà cambiata.</p>

  <p>--<br>Team BHM</p>
</body>
</html>
```

---

### **Step 3: User Receives Email**

**Frontend Actions** (ForgotPasswordForm dopo submit):
```typescript
// Response ricevuto (sempre success)
if (response.success) {
  toast.success(
    "Se l'email esiste, riceverai un link di reset",
    { duration: 5000 }
  )

  // Mostra messaggio esplicativo
  setShowEmailSentMessage(true)
}
```

**UI State**:
```tsx
{showEmailSentMessage && (
  <div className="bg-blue-50 border border-blue-200 rounded p-4">
    <h3>✉️ Controlla la tua email</h3>
    <p>
      Se l'indirizzo email che hai inserito è registrato nel nostro sistema,
      riceverai un link per resettare la password.
    </p>
    <p className="text-sm text-gray-600 mt-2">
      Il link scadrà tra 12 ore.
    </p>
    <p className="text-sm text-gray-600 mt-2">
      Non hai ricevuto l'email?{' '}
      <button onClick={() => setShowEmailSentMessage(false)}>
        Riprova
      </button>
    </p>
  </div>
)}
```

---

### **Step 4: User Clicks Recovery Link**

**Trigger**: User apre link da email

**URL**: `https://app.bhm.com/reset-password?token=recovery-uuid-123`

**Frontend Actions**:
```typescript
// ResetPasswordPage.tsx

// 1. Extract token from URL
const searchParams = useSearchParams()
const token = searchParams.get('token')

// 2. Validate token (GET /auth/recovery/validate)
useEffect(() => {
  if (!token) {
    setError('Token mancante. Richiedi un nuovo link.')
    return
  }

  validateRecoveryToken(token).then(response => {
    if (response.valid) {
      setTokenValid(true)
      setUserEmail(response.email) // Mostra email (mascherata: m***o@r***.com)
    } else {
      setError(response.error || 'Link non valido o scaduto')
      setTokenValid(false)
    }
  })
}, [token])

// 3. Render form (se token valido)
if (tokenValid) {
  return (
    <form onSubmit={handleResetPassword}>
      <p>Reset password per: {maskEmail(userEmail)}</p>

      <input
        type="password"
        name="password"
        placeholder="Nuova password (12+ caratteri, lettere+numeri)"
        required
      />

      <input
        type="password"
        name="confirmPassword"
        placeholder="Conferma password"
        required
      />

      <button type="submit">Conferma nuova password</button>
    </form>
  )
}
```

**Backend Validation** (GET /auth/recovery/validate):
```typescript
// Lightweight endpoint per validare token senza resettare

const session = await db.sessions.findOne({
  session_token: token,
  type: 'recovery',
  is_active: true,
  expires_at: { $gt: now() }
})

if (!session) {
  return {
    valid: false,
    error: 'Link non valido o scaduto. Richiedi un nuovo reset.'
  }
}

const user = await db.users.findById(session.user_id)

return {
  valid: true,
  email: maskEmail(user.email) // m***o@r***.com
}
```

---

### **Step 5: Password Reset Confirmation**

**Trigger**: User compila form nuova password + clicca "Conferma"

**Frontend Actions**:
```typescript
// handleResetPassword()

// 1. Validation client-side
const recoveryConfirmSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema, // 12 char, lettere+numeri
  confirmPassword: passwordSchema,
  csrf_token: z.string().min(1)
}).refine(data => data.password === data.confirmPassword, {
  message: 'Le password non coincidono',
  path: ['confirmPassword']
})

const validation = validateForm(recoveryConfirmSchema, formData)
if (!validation.success) {
  setErrors(validation.errors)
  return
}

// 2. Submit
const response = await authClient.confirmRecovery({
  token,
  password,
  csrf_token
})
```

**Backend Actions** (POST /auth/recovery/confirm):
```typescript
// edge-functions/auth-recovery-confirm/index.ts

// 1. CSRF VALIDATION
const csrfValid = await validateCsrfToken(request.body.csrf_token)
if (!csrfValid) return error(403, 'CSRF_REQUIRED')

// 2. VALIDATE RECOVERY TOKEN
const recoverySession = await db.sessions.findOne({
  session_token: token,
  type: 'recovery',
  is_active: true,
  expires_at: { $gt: now() }
})

if (!recoverySession) {
  await createAuditLog({
    action: 'PASSWORD_RESET_FAILED',
    outcome: 'failure',
    reason: 'Invalid or expired token',
    ip: ipAddress,
    metadata: { token }
  })

  return error(400, 'TOKEN_INVALID', {
    message: 'Link non valido o scaduto. Richiedi un nuovo reset.'
  })
}

const user = await db.users.findById(recoverySession.user_id)

if (!user || !user.is_active) {
  return error(400, 'USER_NOT_FOUND')
}

// 3. VALIDATE NEW PASSWORD (Zod)
const validated = validatePassword(password)
if (!validated.success) {
  return error(400, 'PASSWORD_POLICY_VIOLATION', {
    errors: validated.errors
  })
}

// 4. HASH NEW PASSWORD (bcrypt)
const newPasswordHash = await bcrypt.hash(password, 10)

// 5. UPDATE USER
await db.users.update(user.id, {
  password_hash: newPasswordHash,
  failed_login_attempts: 0,  // Reset lockout
  locked_until: null,         // Unlock account
  password_changed_at: now(), // Track cambio password
  updated_at: now()
})

// 6. INVALIDATE RECOVERY SESSION (single-use)
await db.sessions.update(recoverySession.id, {
  is_active: false,
  used_at: now()
})

// 7. REVOKE ALL OTHER ACTIVE SESSIONS (force re-login)
await db.sessions.updateMany(
  {
    user_id: user.id,
    is_active: true,
    type: 'login' // Solo sessioni login, non CSRF
  },
  {
    is_active: false,
    revoked_at: now(),
    revoke_reason: 'password_changed'
  }
})

// 8. AUDIT LOG
await createAuditLog({
  user_id: user.id,
  action: 'PASSWORD_RESET_COMPLETED',
  outcome: 'success',
  ip: ipAddress,
  metadata: {
    recovery_token_id: recoverySession.id,
    sessions_revoked_count: revokedCount
  }
})

// 9. OPTIONAL: Send notification email
await sendEmail({
  to: user.email,
  subject: 'BHM - Password cambiata',
  template: 'password-changed-notification',
  data: {
    firstName: user.first_name,
    changedAt: now(),
    ip: ipAddress
  }
})

return {
  success: true,
  message: 'Password aggiornata con successo. Effettua il login.'
}
```

---

### **Step 6: Success Redirect**

**Frontend Actions**:
```typescript
// handleResetPassword (continued)

if (response.success) {
  // 1. Toast success
  toast.success('Password aggiornata con successo!')

  // 2. Mostra messaggio
  setShowSuccessMessage(true)

  // 3. Auto-redirect a login dopo 3 secondi
  setTimeout(() => {
    navigate('/login')
  }, 3000)
}
```

**UI State**:
```tsx
{showSuccessMessage && (
  <div className="bg-green-50 border border-green-200 rounded p-6 text-center">
    <h2 className="text-2xl font-bold text-green-800 mb-2">
      ✅ Password aggiornata
    </h2>
    <p>La tua password è stata modificata con successo.</p>
    <p className="text-sm text-gray-600 mt-2">
      Verrai reindirizzato alla pagina di login tra 3 secondi...
    </p>
    <Link to="/login" className="text-blue-600 underline mt-4 inline-block">
      Vai al login ora
    </Link>
  </div>
)}
```

---

## 📤 OUTPUT ATTESI

### **Success Case**

**Database State** (dopo conferma):
```sql
-- User password aggiornata
UPDATE users
SET password_hash = '$2b$10$...' -- bcrypt hash
    failed_login_attempts = 0,
    locked_until = NULL,
    password_changed_at = NOW(),
    updated_at = NOW()
WHERE id = 'user-uuid-123';

-- Recovery session invalidata (single-use)
UPDATE sessions
SET is_active = FALSE,
    used_at = NOW()
WHERE session_token = 'recovery-uuid-456'
  AND type = 'recovery';

-- Tutte altre sessioni revocate
UPDATE sessions
SET is_active = FALSE,
    revoked_at = NOW(),
    revoke_reason = 'password_changed'
WHERE user_id = 'user-uuid-123'
  AND type = 'login'
  AND is_active = TRUE;

-- Audit log
INSERT INTO audit_log (user_id, action, outcome, metadata)
VALUES (
  'user-uuid-123',
  'PASSWORD_RESET_COMPLETED',
  'success',
  '{"sessions_revoked_count": 2}'
);
```

**User Experience**:
- ✅ Riceve email con link entro 1 minuto
- ✅ Link funziona (entro 12 ore)
- ✅ Form mostra email mascherata
- ✅ Password aggiornata → Toast + Redirect login
- ✅ Può fare login con nuova password
- ✅ Vecchie sessioni (altri device) invalidate

---

### **Failure Cases**

#### **1. Email Non Esiste (Enumeration Protection)**

**Frontend vede**:
```json
{
  "success": true,
  "message": "Se l'email esiste nel sistema, riceverai un link di reset"
}
```

**Backend fa**:
- ❌ NON invia email
- ✅ Audit log: PASSWORD_RESET_REQUESTED_INVALID
- ✅ Delay artificiale (sembra uguale a success)

**User Experience**:
- User vede messaggio "Controlla email"
- NON riceve email (ma non lo sa)
- Dopo 10 min capisce che email non esiste → Prova altra email

---

#### **2. Token Scaduto (>12 ore)**

**Response**:
```json
{
  "success": false,
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "Link scaduto. Richiedi un nuovo reset."
  }
}
```

**Frontend**:
```tsx
<div className="bg-red-50 border border-red-200 rounded p-6">
  <h2>❌ Link scaduto</h2>
  <p>Questo link di reset è scaduto.</p>
  <p>I link di reset sono validi solo per 12 ore.</p>
  <Link to="/forgot-password">
    Richiedi un nuovo link
  </Link>
</div>
```

---

#### **3. Token Già Usato (Single-Use)**

**Response**: Stesso di Token Scaduto (TOKEN_INVALID)

---

#### **4. Rate Limiting**

**Scenario**: User richiede reset 4 volte in 10 minuti

**Response**:
```json
{
  "success": true,
  "message": "Se l'email esiste nel sistema, riceverai un link di reset"
}
```

**Backend fa**:
- ❌ NON invia email (rate limit exceeded)
- ✅ Audit log: PASSWORD_RESET_RATE_LIMITED

**User Experience**:
- Vede messaggio success (non sa che è bloccato)
- NON riceve email
- Dopo 15 min può riprovare

---

## 🧪 EDGE CASES

### **1. User clicca link DOPO aver cambiato password**

**Scenario**:
1. User richiede reset → Riceve email
2. User fa login con vecchia password (ricordata)
3. User clicca link reset email

**Comportamento**:
- Recovery session è ancora valid (non scaduta)
- User può cambiare password di nuovo
- ✅ Permesso (user vuole cambiare password volontariamente)

---

### **2. Recovery mentre account bloccato**

**Scenario**: User ha fatto 5 tentativi login falliti → Account locked

**Comportamento**:
- ✅ Recovery funziona normalmente
- ✅ Al reset password → `locked_until = NULL` (unlock automatico)
- ✅ Recovery è "escape route" per account locked

---

### **3. Multiple recovery requests**

**Scenario**: User richiede reset 2 volte (email non arriva subito)

**Comportamento**:
```typescript
// Backend: Request 1
const token1 = generateUUID()
await db.sessions.insert({ session_token: token1, ... })
// Email 1 inviata

// Backend: Request 2 (5 minuti dopo)
// 1. Invalida token1
await db.sessions.updateMany(
  { user_id, type: 'recovery', is_active: true },
  { is_active: false }
)

// 2. Crea token2
const token2 = generateUUID()
await db.sessions.insert({ session_token: token2, ... })
// Email 2 inviata
```

**Risultato**:
- ✅ Solo token2 funziona
- ❌ Token1 invalidato (se user clicca → "Token non valido")

---

### **4. Password uguale a vecchia**

**Scenario**: User resetta password con stessa password

**Comportamento**:
- ✅ Backend NON controlla (permettiamo)
- Rationale: User potrebbe voler "confermare" password dimenticata

**Alternative** (se vuoi bloccare):
```typescript
// Optional check
const sameAsOld = await bcrypt.compare(newPassword, user.password_hash)
if (sameAsOld) {
  return error(400, 'PASSWORD_POLICY_VIOLATION', {
    message: 'La nuova password deve essere diversa dalla precedente'
  })
}
```

---

## 🎯 ACCEPTANCE CRITERIA

**Given** un utente registrato
**When** clicca "Password dimenticata?" e inserisce email
**Then** riceve email con link di reset (se email esiste) in <1 minuto

**Given** link recovery valido
**When** user apre link entro 12 ore
**Then** vede form per impostare nuova password

**Given** nuova password conforme a policy (12 char lettere+numeri)
**When** user conferma
**Then** password aggiornata + redirect a login + vecchie sessioni revocate

**Given** link recovery scaduto (>12 ore)
**When** user apre link
**Then** vede errore "Link scaduto" con link per richiedere nuovo reset

**Given** user richiede reset per email non esistente
**When** submit form
**Then** vede messaggio generico "Se email esiste, riceverai link" (NO reveal)

**Given** user richiede 4 reset in 10 minuti
**When** 4a richiesta
**Then** rate limited (no email inviata) ma vede sempre messaggio success

---

## 🧪 FIXTURES

```typescript
// Valid Recovery Request
const validRecovery = {
  email: 'mario@ristorante.com',
  expected: {
    emailSent: true,
    tokenValidFor: '12 hours',
    linkFormat: 'https://app.bhm.com/reset-password?token=uuid-...'
  }
}

// Invalid Email (Enumeration Test)
const invalidEmail = {
  email: 'notexist@ristorante.com',
  expected: {
    responseMessage: 'Se l\'email esiste...',
    emailSent: false,
    auditLog: 'PASSWORD_RESET_REQUESTED_INVALID'
  }
}

// Expired Token
const expiredToken = {
  token: 'expired-uuid-123',
  createdAt: '2025-10-21T10:00:00Z', // >12 ore fa
  expected: {
    error: 'TOKEN_EXPIRED',
    canRequestNew: true
  }
}

// Rate Limited
const rateLimitedRequest = {
  email: 'mario@ristorante.com',
  previousRequests: 4, // In 10 min
  expected: {
    responseMessage: 'Se l\'email esiste...',
    emailSent: false,
    auditLog: 'PASSWORD_RESET_RATE_LIMITED',
    retryAfter: 300 // 5 min
  }
}
```

---

## 📊 TARGETS

**Performance**:
- Recovery Request API: <300ms
- Email Delivery: <60s
- Recovery Confirm API: <500ms

**Security**:
- Email Enumeration Protection: ✅ (sempre success)
- Rate Limiting: ✅ (3 req/15min per email, 10 req/15min per IP)
- Token Single-Use: ✅ (invalidato dopo uso)
- Token Expiration: 12 ore

**Reliability**:
- Email Delivery Rate: >99%
- Token Validation Accuracy: 100%

---

## 🔗 COLLEGAMENTI

**Upstream Patterns**:
- PAT-LOGIN-001 (user clicca "Password dimenticata?" da login)

**Downstream Patterns**:
- PAT-LOGIN-001 (user fa re-login dopo reset)

---

## ✅ HANDOFF NOTES

**Per Agente 4 (Backend)**:
- Implementare email enumeration delay
- Configurare email service (SMTP/SendGrid)
- Testare rate limiting recovery
- Verificare revoca sessioni dopo reset

**Per Agente 5 (Frontend)**:
- Creare ResetPasswordPage
- Masked email display (m***o@r***.com)
- Countdown auto-redirect (3s)
- Error states per token expired/invalid

**Per Agente 6 (Testing)**:
- Test email enumeration (email esistente vs non esistente → stesso response)
- Test rate limiting (3 req → blocked)
- E2E: request → email → click link → reset → login
- Security: verificare token single-use
