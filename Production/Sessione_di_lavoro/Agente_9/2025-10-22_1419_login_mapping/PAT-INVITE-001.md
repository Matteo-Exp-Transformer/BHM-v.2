# PAT-INVITE-001 - Invite Registration Flow Pattern

**Pattern ID**: PAT-INVITE-001
**Feature**: FEAT-LOGIN
**Knowledge Version**: 1.0.0
**Data**: 2025-10-22
**Owner**: Agente 9 - Knowledge Brain Mapper

---

## PRECONDITIONS

- **Attore**: Admin (Proprietario Ristorante) o Responsabile (Chef/Manager)
- **Stato Sistema**: Admin ha accesso alla pagina "Gestione Staff"
- **Database**: Tabelle `companies`, `users`, `invite_tokens`, `company_members` esistono
- **Email Service**: Servizio email configurato e funzionante
- **Backend**: Edge Function `generate-invite-token` e `validate-invite-token` attive

---

## FLOW - REGISTRATION VIA INVITE (6 STEPS)

### **STEP 1 - Admin Genera Invito**

**Azione Admin**: Nella pagina "Gestione Staff", Admin inserisce:
- Email nuovo utente
- Ruolo (Responsabile/Dipendente/Collaboratore)
- Nome e Cognome (opzionale)

**Request**:
```typescript
POST /api/auth/generate-invite

{
  email: "nuovo.dipendente@esempio.com",
  role: "Dipendente",
  first_name: "Mario", // opzionale
  last_name: "Rossi",  // opzionale
  company_id: "uuid-azienda-admin"
}
```

**Backend Processing**:
```typescript
// 1. Verifica permessi Admin
const { data: adminMember } = await supabase
  .from('company_members')
  .select('role')
  .eq('user_id', adminId)
  .eq('company_id', companyId)
  .single()

if (!['Admin', 'Responsabile'].includes(adminMember.role)) {
  return { success: false, error: 'FORBIDDEN' }
}

// 2. Verifica email non già registrata
const { data: existingUser } = await supabase
  .from('users')
  .select('id')
  .eq('email', email)
  .single()

if (existingUser) {
  return {
    success: false,
    error: 'USER_ALREADY_EXISTS',
    message: 'Utente già registrato nel sistema'
  }
}

// 3. Invalida inviti precedenti per stessa email + azienda
await supabase
  .from('invite_tokens')
  .update({ used: true, invalidated_at: new Date() })
  .eq('email', email)
  .eq('company_id', companyId)
  .eq('used', false)

// 4. Genera nuovo token
const inviteToken = crypto.randomBytes(32).toString('hex')
const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 giorni

const { error: insertError } = await supabase
  .from('invite_tokens')
  .insert({
    token: inviteToken,
    email: email,
    company_id: companyId,
    role: role,
    invited_by: adminId,
    expires_at: expiresAt,
    used: false
  })

// 5. Audit Log
await createAuditLog({
  user_id: adminId,
  company_id: companyId,
  action: 'INVITE_CREATED',
  details: { email, role },
  outcome: 'success'
})
```

**Response**:
```typescript
{
  success: true,
  invite_token: "abc123...",
  expires_at: "2025-11-21T14:19:00.000Z",
  registration_link: "https://bhm.app/sign-up?token=abc123..."
}
```

---

### **STEP 2 - Sistema Invia Email**

**Email Template**:
```html
Subject: Invito a Business Haccp Manager - [Nome Azienda]

Ciao Mario,

Sei stato invitato da [Nome Admin] ad unirti a [Nome Azienda] su Business Haccp Manager.

Ruolo assegnato: Dipendente

Clicca sul link qui sotto per completare la registrazione:
https://bhm.app/sign-up?token=abc123...

⚠️ Questo link è valido per 30 giorni e può essere usato una sola volta.

Se non hai richiesto questo invito, ignora questa email.

---
Business Haccp Manager
Gestione Sicurezza Alimentare
```

**Backend Logging**:
```typescript
await createAuditLog({
  action: 'INVITE_EMAIL_SENT',
  details: {
    email,
    company_id: companyId,
    email_provider_response: emailResponse
  },
  outcome: 'success'
})
```

---

### **STEP 3 - User Clicca Link Invito**

**User Action**: User clicca link nell'email → Browser apre `/sign-up?token=abc123...`

**Frontend Page Load** (`/sign-up`):
```typescript
// 1. Estrai token dalla query string
const urlParams = new URLSearchParams(window.location.search)
const inviteToken = urlParams.get('token')

if (!inviteToken) {
  toast.error('Link di invito non valido')
  navigate('/login')
  return
}

// 2. Valida token immediatamente
const { data: validation } = await authClient.validateInviteToken(inviteToken)

if (!validation.valid) {
  toast.error(validation.message)
  navigate('/login')
  return
}

// 3. Pre-compila form con dati da token
setFormData({
  email: validation.email,        // Read-only
  first_name: validation.first_name || '',
  last_name: validation.last_name || '',
  role: validation.role,          // Read-only
  company_name: validation.company_name, // Read-only
  token: inviteToken
})
```

**Backend Validation** (`POST /api/auth/validate-invite-token`):
```typescript
// 1. Verifica token esiste
const { data: invite } = await supabase
  .from('invite_tokens')
  .select('*, companies(name)')
  .eq('token', token)
  .single()

if (!invite) {
  return {
    valid: false,
    message: 'Link di invito non trovato o non valido'
  }
}

// 2. Verifica non scaduto
if (new Date() > new Date(invite.expires_at)) {
  return {
    valid: false,
    message: 'Link di invito scaduto. Richiedi un nuovo invito.'
  }
}

// 3. Verifica non già usato
if (invite.used) {
  return {
    valid: false,
    message: 'Link di invito già utilizzato.'
  }
}

// 4. Verifica utente non esiste
const { data: existingUser } = await supabase
  .from('users')
  .select('id')
  .eq('email', invite.email)
  .single()

if (existingUser) {
  return {
    valid: false,
    message: 'Utente già registrato. Effettua il login.'
  }
}

// ✅ Token valido
return {
  valid: true,
  email: invite.email,
  role: invite.role,
  company_id: invite.company_id,
  company_name: invite.companies.name
}
```

---

### **STEP 4 - User Compila Form Registrazione**

**Form Fields**:
```typescript
interface SignUpFormData {
  // Pre-compilati (read-only)
  email: string           // da invite
  role: string            // da invite
  company_name: string    // da invite

  // Compilati da User
  first_name: string      // Required
  last_name: string       // Required
  password: string        // Required - Min 12 char, letters + numbers
  confirmPassword: string // Required - Must match password

  // Hidden
  token: string           // Token invito
}
```

**Frontend Validation** (Zod schema):
```typescript
export const signUpFormSchema = z.object({
  email: z.string().email('Email non valida'),
  first_name: z.string().min(2, 'Nome richiesto'),
  last_name: z.string().min(2, 'Cognome richiesto'),
  password: z.string()
    .min(12, 'Password deve essere di almeno 12 caratteri')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{12,}$/,
      'Password deve contenere lettere e numeri'),
  confirmPassword: z.string(),
  token: z.string().min(1, 'Token invito richiesto')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Le password non coincidono',
  path: ['confirmPassword']
})
```

---

### **STEP 5 - Submit Registrazione**

**Request**:
```typescript
POST /api/auth/sign-up

{
  email: "nuovo.dipendente@esempio.com",
  first_name: "Mario",
  last_name: "Rossi",
  password: "Password123456",
  token: "abc123..."
}
```

**Backend Processing** (`POST /api/auth/sign-up`):
```typescript
// 1. Ri-valida token (paranoid check)
const { data: invite } = await supabase
  .from('invite_tokens')
  .select('*')
  .eq('token', token)
  .eq('used', false)
  .single()

if (!invite || new Date() > new Date(invite.expires_at)) {
  return { success: false, error: 'INVALID_TOKEN' }
}

// 2. Hash password (bcrypt, cost=10)
const passwordHash = await bcrypt.hash(password, 10)

// 3. Crea user
const { data: newUser, error: userError } = await supabase
  .from('users')
  .insert({
    email: invite.email,
    password_hash: passwordHash,
    first_name: first_name,
    last_name: last_name,
    email_verified: true, // Auto-verified perché invitato
    created_at: new Date()
  })
  .select()
  .single()

if (userError) {
  return { success: false, error: 'USER_CREATION_FAILED' }
}

// 4. Associa user a company con ruolo
const { error: memberError } = await supabase
  .from('company_members')
  .insert({
    user_id: newUser.id,
    company_id: invite.company_id,
    role: invite.role,
    joined_at: new Date()
  })

// 5. Marca token come usato (SINGLE-USE)
await supabase
  .from('invite_tokens')
  .update({
    used: true,
    used_at: new Date(),
    used_by: newUser.id
  })
  .eq('token', token)

// 6. Crea sessione iniziale
const sessionToken = crypto.randomBytes(32).toString('hex')
const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 ore

await supabase
  .from('sessions')
  .insert({
    user_id: newUser.id,
    session_token: sessionToken,
    expires_at: expiresAt
  })

// 7. Audit Log
await createAuditLog({
  user_id: newUser.id,
  company_id: invite.company_id,
  action: 'USER_REGISTERED_VIA_INVITE',
  details: { email, role: invite.role },
  outcome: 'success'
})
```

**Response**:
```typescript
{
  success: true,
  user: {
    id: "uuid-user",
    email: "nuovo.dipendente@esempio.com",
    first_name: "Mario",
    last_name: "Rossi"
  },
  session_token: "xyz789...",
  company: {
    id: "uuid-company",
    name: "Ristorante La Bella Vita",
    role: "Dipendente"
  }
}
```

---

### **STEP 6 - Success Redirect + Onboarding**

**Frontend Success Handler**:
```typescript
// 1. Store session token
localStorage.setItem('bhm_session_token', sessionToken)

// 2. Store active company
localStorage.setItem('bhm_active_company', company.id)

// 3. Toast success
toast.success(`Benvenuto ${user.first_name}! Registrazione completata.`)

// 4. Redirect to Onboarding
navigate('/onboarding')
```

**Onboarding Flow**:
- Step 1: Welcome message + role explanation
- Step 2: Quick tour (based on role)
- Step 3: Redirect to `/dashboard`

---

## EXPECTED OUTPUTS

### **Database State Changes**:

**users** table:
```sql
INSERT INTO users (id, email, password_hash, first_name, last_name, email_verified)
VALUES (
  'uuid-new-user',
  'nuovo.dipendente@esempio.com',
  '$2b$10$...',
  'Mario',
  'Rossi',
  TRUE
)
```

**company_members** table:
```sql
INSERT INTO company_members (user_id, company_id, role, joined_at)
VALUES (
  'uuid-new-user',
  'uuid-company',
  'Dipendente',
  '2025-10-22 14:19:00'
)
```

**invite_tokens** table:
```sql
UPDATE invite_tokens
SET
  used = TRUE,
  used_at = '2025-10-22 14:19:00',
  used_by = 'uuid-new-user'
WHERE token = 'abc123...'
```

**audit_log** table:
```sql
-- 3 eventi registrati:
1. INVITE_CREATED (by Admin)
2. INVITE_EMAIL_SENT (by System)
3. USER_REGISTERED_VIA_INVITE (by new user)
```

### **Email Sent**:
- ✅ 1 email inviata a `nuovo.dipendente@esempio.com`
- ✅ Link univoco con token single-use
- ✅ Valido 30 giorni

### **User Experience**:
- ✅ User riceve email con istruzioni chiare
- ✅ Link porta direttamente a form pre-compilato
- ✅ Registrazione in ~60 secondi (3 campi + password)
- ✅ Auto-assegnazione a company senza intervento Admin
- ✅ Redirect automatico a Onboarding

---

## ACCEPTANCE CRITERIA

**Given** un Admin autenticato nella sezione "Gestione Staff"
**When** inserisce email, ruolo e nome nuovo dipendente
**Then** sistema genera token, invia email, e logga evento

**Given** un utente riceve email di invito
**When** clicca sul link entro 30 giorni
**Then** viene portato a form registrazione pre-compilato

**Given** un utente compila correttamente password (12+ char, lettere+numeri)
**When** submit form registrazione
**Then** account creato, associato ad azienda con ruolo, token marcato usato

**Given** un utente prova a usare token già utilizzato
**When** tenta registrazione
**Then** riceve errore "Link già utilizzato"

**Given** un utente prova a usare token scaduto (>30 giorni)
**When** tenta registrazione
**Then** riceve errore "Link scaduto. Richiedi nuovo invito"

---

## EDGE CASES

### **1. Token Scaduto**
**Scenario**: User clicca link dopo 31 giorni
**Gestione**:
```typescript
if (new Date() > new Date(invite.expires_at)) {
  toast.error('Link scaduto. Contatta il tuo responsabile per un nuovo invito.')
  navigate('/login')
}
```
**Azione Admin**: Admin deve generare nuovo invito

### **2. Token Già Usato**
**Scenario**: User prova a riusare link
**Gestione**:
```typescript
if (invite.used === true) {
  toast.error('Hai già completato la registrazione. Effettua il login.')
  navigate('/login')
}
```

### **3. Email Già Registrata**
**Scenario**: Admin prova a invitare email già esistente
**Gestione**:
```typescript
// Backend blocca subito
if (existingUser) {
  return {
    success: false,
    error: 'USER_ALREADY_EXISTS',
    message: 'Utente già registrato. Usa "Aggiungi a Company" invece.'
  }
}
```
**Azione Admin**: Usa funzione "Aggiungi Utente Esistente" invece di "Invita Nuovo"

### **4. Inviti Multipli per Stessa Email**
**Scenario**: Admin invia invito, poi ri-invia perché user non ha risposto
**Gestione**:
```typescript
// Invalida inviti precedenti non usati
await supabase
  .from('invite_tokens')
  .update({ used: true, invalidated_at: new Date() })
  .eq('email', email)
  .eq('company_id', companyId)
  .eq('used', false)

// Crea nuovo token (sostituisce vecchi)
```
**Esperienza User**: Solo ultimo link funziona (vecchi link mostrano errore)

### **5. Password Non Valida**
**Scenario**: User inserisce password "ciao1234" (troppo corta)
**Gestione Frontend**:
```typescript
// Zod validation
password: z.string()
  .min(12, 'Password deve essere di almeno 12 caratteri')
  .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{12,}$/,
    'Password deve contenere lettere e numeri')
```
**UI**: Errore rosso sotto campo password + submit button disabilitato

### **6. Company Eliminata Prima di Registrazione**
**Scenario**: Admin elimina company, ma user ha già ricevuto invito
**Gestione**:
```typescript
// Validazione token verifica company esistente
const { data: invite } = await supabase
  .from('invite_tokens')
  .select('*, companies!inner(id, name, active)')
  .eq('token', token)
  .single()

if (!invite.companies?.active) {
  return {
    valid: false,
    message: 'Azienda non più disponibile. Contatta il supporto.'
  }
}
```

### **7. Email Service Down**
**Scenario**: Servizio email non disponibile durante generazione invito
**Gestione**:
```typescript
try {
  await sendEmail({ to: email, template: 'invite', ... })
} catch (emailError) {
  // Rollback invite token creation
  await supabase.from('invite_tokens').delete().eq('token', inviteToken)

  return {
    success: false,
    error: 'EMAIL_SEND_FAILED',
    message: 'Impossibile inviare email. Riprova tra qualche minuto.'
  }
}
```
**Azione Admin**: Riprova generazione invito

---

## FIXTURES (Test Data)

### **Happy Path**:
```typescript
// Admin che genera invito
admin_user = {
  id: "uuid-admin-123",
  email: "admin@ristorante.com",
  first_name: "Giuseppe",
  last_name: "Verdi"
}

company = {
  id: "uuid-company-456",
  name: "Ristorante La Bella Vita",
  active: true
}

invite_request = {
  email: "mario.rossi@esempio.com",
  role: "Dipendente",
  first_name: "Mario",
  last_name: "Rossi"
}

// Token generato
invite_token = {
  token: "a1b2c3d4e5f6...",
  email: "mario.rossi@esempio.com",
  company_id: "uuid-company-456",
  role: "Dipendente",
  invited_by: "uuid-admin-123",
  expires_at: "2025-11-21T14:19:00.000Z",
  used: false
}

// Registrazione completata
new_user = {
  id: "uuid-user-789",
  email: "mario.rossi@esempio.com",
  first_name: "Mario",
  last_name: "Rossi",
  email_verified: true,
  created_at: "2025-10-22T14:19:00.000Z"
}

company_member = {
  user_id: "uuid-user-789",
  company_id: "uuid-company-456",
  role: "Dipendente",
  joined_at: "2025-10-22T14:19:00.000Z"
}
```

### **Edge Case - Token Scaduto**:
```typescript
expired_invite = {
  token: "expired123...",
  email: "vecchio@esempio.com",
  expires_at: "2025-09-15T10:00:00.000Z", // 37 giorni fa
  used: false
}

// Validation result
{
  valid: false,
  message: "Link di invito scaduto. Richiedi un nuovo invito."
}
```

### **Edge Case - Token Già Usato**:
```typescript
used_invite = {
  token: "used456...",
  email: "giovanni@esempio.com",
  used: true,
  used_at: "2025-10-20T12:00:00.000Z",
  used_by: "uuid-existing-user"
}

// Validation result
{
  valid: false,
  message: "Link di invito già utilizzato."
}
```

---

## TARGETS

### **Performance**:
- **Email Delivery**: < 30 secondi dall'invio backend
- **Token Validation**: < 200ms per verifica
- **Registration Completion**: < 2 secondi da submit a redirect

### **Security**:
- ✅ Token crittograficamente sicuro (32 bytes random hex)
- ✅ Single-use enforcement (marcato `used=true` dopo primo utilizzo)
- ✅ Scadenza 30 giorni (bilanciamento usabilità/sicurezza)
- ✅ Email verification bypass giustificato (invitato da Admin)
- ✅ Password hashing bcrypt cost=10
- ✅ Audit logging completo (INVITE_CREATED, EMAIL_SENT, USER_REGISTERED)

### **Usability**:
- ✅ Form pre-compilato con email + ruolo + company
- ✅ Solo 4 campi da compilare (nome, cognome, password, conferma password)
- ✅ Messaggio chiaro se token scaduto/usato
- ✅ Redirect automatico a onboarding post-registrazione

### **Reliability**:
- ✅ Rollback se email send fallisce
- ✅ Invalidazione inviti precedenti per stessa email
- ✅ Gestione company eliminata durante invito pendente

---

## DEPENDENCIES

### **Frontend**:
- `SignUpPage.tsx` - Form registrazione con validazione
- `authSchemas.ts` - Schema Zod per signup
- `authClient.ts` - HTTP client per API calls
- `useAuth.ts` - Hook gestione sessione post-registrazione

### **Backend**:
- `generate-invite-token` - Edge Function creazione inviti
- `validate-invite-token` - Edge Function validazione token
- `sign-up` - Edge Function registrazione utente
- `email-service` - Servizio invio email (SendGrid/Resend/SES)

### **Database**:
- `invite_tokens` table con campi: token, email, company_id, role, expires_at, used
- `users` table
- `company_members` table
- `audit_log` table

### **External Services**:
- Email provider (SendGrid/Resend/AWS SES)

---

## INTEGRATION POINTS

### **Con Sistema Login** (PAT-LOGIN-001):
- User registrato via invite può immediatamente fare login
- Session token creato automaticamente post-registrazione

### **Con Multi-Company** (FEATURE_SPEC_LOGIN):
- User associato automaticamente a company dell'invito
- Se user successivamente invitato da altra company → multi-company setup

### **Con Gestione Staff**:
- Admin vede lista inviti pendenti/scaduti/usati
- Admin può ri-inviare o invalidare inviti

### **Con Onboarding**:
- Post-registrazione → redirect a `/onboarding`
- Tour personalizzato basato su ruolo assegnato

---

## NOTES FOR PLANNING AGENTS

**Agente 0 (Orchestrator)**:
- Coordinare implementazione tra Agente 4 (Backend) e Agente 5 (Frontend)
- Verificare integration con sistema email (infrastructure setup richiesto)

**Agente 2 (Systems Blueprint)**:
- Verificare schema `invite_tokens` table esiste e ha tutti i campi
- Definire API contract per `/api/auth/generate-invite` e `/api/auth/validate-invite`

**Agente 4 (Back-End)**:
- Implementare Edge Functions per generazione, validazione, registrazione
- Implementare email service integration (priorità: Resend per semplicità)
- Implementare single-use enforcement + expiration checks

**Agente 5 (Front-End)**:
- Creare `SignUpPage.tsx` con query param `?token=...` handling
- Pre-compilare form con dati da token validation
- Gestire errori (token scaduto/usato) con UX chiara

**Agente 6 (Testing)**:
- Test happy path completo (generazione → email → registrazione → login)
- Test edge cases (token scaduto, usato, email duplicata, company eliminata)
- Test email sending failure + rollback

**Agente 7 (Security)**:
- Audit token generation (crypto secure random)
- Verificare single-use enforcement
- Verificare scadenza 30 giorni rispettata
- Rate limiting su generazione inviti (max 10/hour per Admin)

---

**END OF PATTERN PAT-INVITE-001**
