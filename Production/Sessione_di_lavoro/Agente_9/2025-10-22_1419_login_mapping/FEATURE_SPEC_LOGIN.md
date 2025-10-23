# FEATURE SPECIFICATION - LOGIN & AUTHENTICATION SYSTEM
**Feature ID**: FEAT-AUTH-001
**Version**: 2.0.0
**Owner**: Agente 9 - Knowledge Brain Mapper
**Date**: 2025-10-22
**Status**: DEFINITO - Ready for Planning

---

## 📋 EXECUTIVE SUMMARY

Sistema di autenticazione completo per BHM v.2 con:
- Login email/password con Supabase Auth
- CSRF protection
- Rate limiting con escalation progressiva
- Remember Me (30 giorni)
- Multi-company support
- Password recovery
- Sistema inviti

**Decisioni Owner**: Tutte confermate in DECISIONI_FINALI.md
**Target**: Production-ready, blindato, sicuro

---

## 🎯 VISIONE & SCOPO

### **Obiettivo**
Fornire un sistema di autenticazione sicuro, user-friendly e compliant per applicazione HACCP food safety.

### **Attori & Permessi**

**ADMIN** (Proprietario Ristorante):
- ✅ Gestire staff
- ✅ Gestire reparti
- ✅ Vedere tutte le task
- ✅ Gestire conservazione alimenti
- ✅ Esportare dati (compliance HACCP)
- ✅ Gestire impostazioni

**RESPONSABILE** (Chef/Manager):
- ✅ Gestire staff
- ✅ Gestire reparti
- ✅ Vedere tutte le task
- ✅ Gestire conservazione alimenti
- ❌ Esportare dati
- ❌ Gestire impostazioni

**DIPENDENTE** (Cuoco fisso):
- ✅ Vedere/completare proprie task
- ❌ Nessun permesso management

**COLLABORATORE** (Cuoco stagionale/part-time):
- ✅ Vedere/completare proprie task
- ❌ Nessun permesso management

**GUEST**:
- ❌ Nessun accesso

---

## 🔒 REGOLE INVARIANTI

### **Sicurezza**
1. **Password Policy**: Min 12 caratteri, lettere + numeri obbligatori
2. **Password Hash**: bcrypt (cost=10) - NO SHA-256
3. **CSRF Protection**: Obbligatorio per tutte le mutazioni
4. **Rate Limiting**: 5 tentativi → escalation progressiva (5min → 15min → 1h → 24h)
5. **Email Enumeration**: Mai rivelare se email esiste (sempre success generico)
6. **Single-Use Tokens**: Recovery e Invite token usabili 1 sola volta

### **Sessioni**
1. **Durata Standard**: 24 ore
2. **Remember Me**: 30 giorni (opzionale, user sceglie)
3. **Activity Tracking**: Ogni 3 minuti (per debug/testing)
4. **Multi-Company**: Default = ultima usata, override con preferenza utente

### **Registrazione**
1. **SOLO tramite invito** - NO registrazione pubblica
2. **Invite Token**: 30 giorni di validità, single-use
3. **Recovery Token**: 12 ore di validità, single-use

### **Audit**
1. **Log Eventi Critici**: LOGIN_SUCCESS/FAILED, PASSWORD_CHANGE/RESET, INVITE_SENT/ACCEPTED, COMPANY_SWITCH, PERMISSION_DENIED, DATA_EXPORT
2. **Dati Loggati**: Timestamp, User ID, IP, User Agent, Action, Outcome
3. **MAI loggare**: Password in chiaro

---

## 🧩 COMPONENTI ARCHITETTURALI

### **Frontend (React + TypeScript)**

#### **UI Components**
- **LoginPage.tsx** - Wrapper pagina (layout)
  - Importa e usa `<LoginForm />`
  - Header con titolo app
  - NO link registrazione
  - NO bottone "torna alla home"

- **LoginForm.tsx** - Form component (logica)
  - Email/Password inputs
  - Validazione Zod client-side
  - CSRF token integration
  - Rate limiting feedback
  - Remember Me checkbox (abilitato)
  - Password visibility toggle (accessibile)
  - Error handling
  - Loading states

#### **Business Logic**
- **useAuth.ts** - Hook autenticazione
  - signIn(email, password)
  - signOut()
  - Permission checks
  - Multi-company management
  - Activity tracking (3 min)

- **useCsrfToken.ts** - CSRF management
  - Fetch token al page load
  - Auto-refresh 1 min prima scadenza
  - Retry 3x se fallisce

- **useLoginRateLimit.ts** - Rate limiting client
  - Track tentativi
  - Countdown blocco
  - Escalation aware

#### **API Client**
- **authClient.ts** - HTTP wrapper
  - CSRF injection automatica
  - Error handling (429, 403, 401)
  - Rate limit info da headers

#### **Validation**
- **authSchemas.ts** - Zod schemas
  - emailSchema (RFC 5322)
  - passwordSchema (12 char, lettere+numeri)
  - loginFormSchema (email + password + rememberMe + csrf_token)

---

### **Backend (Supabase Edge Functions)**

#### **Endpoints**

**POST /auth/login**
- Input: email, password, rememberMe, csrf_token
- Output: session (user, token, expires_at)
- Security:
  - Rate limiting (5 tentativi IP, escalation)
  - Account lockout (failed_attempts tracking)
  - Password verification (bcrypt)
  - CSRF validation
  - Audit log
- Response Time: <500ms

**GET /auth/csrf-token**
- Input: nessuno
- Output: csrf_token, expires_at
- Lifetime: 4 ore
- Cache-Control: no-store

**POST /auth/logout**
- Input: session_token (cookie)
- Output: success
- Actions:
  - Deactivate session
  - Clear cookies
  - Audit log

**POST /auth/recovery/request**
- Input: email, csrf_token
- Output: success (sempre, anche se email non esiste)
- Actions:
  - Generate recovery token (12h validity)
  - Send email (se utente esiste)
  - Rate limiting (3 req/15min per email)
  - Audit log

**POST /auth/recovery/confirm**
- Input: token, password, csrf_token
- Output: success
- Actions:
  - Validate token (12h, not used)
  - Hash nuova password (bcrypt)
  - Reset failed_attempts
  - Revoke altre sessioni
  - Invalidate recovery token (single-use)
  - Audit log

**GET /invites/{token}**
- Input: token (URL param)
- Output: valid, email, role, tenant, expires_at
- Validation: 30 giorni, not used, not expired

**POST /invites/accept**
- Input: token, firstName, lastName, password, csrf_token
- Output: session (user, token)
- Actions:
  - Create user account
  - Assign role (from invite)
  - Create company_member
  - Create user_session
  - Invalidate invite (single-use)
  - Audit log

**POST /invites/create** (admin only)
- Input: email, role, department_id, csrf_token
- Output: inviteId
- Actions:
  - Generate token
  - Set expires_at (+30 giorni)
  - Send email
  - Audit log

---

### **Database Schema**

#### **Tabelle Esistenti (da verificare)**

**users**
```sql
id UUID PRIMARY KEY
email VARCHAR(254) UNIQUE NOT NULL
password_hash VARCHAR(255) NOT NULL
first_name VARCHAR(50)
last_name VARCHAR(50)
email_verified BOOLEAN DEFAULT FALSE
failed_login_attempts INT DEFAULT 0
locked_until TIMESTAMP
is_active BOOLEAN DEFAULT TRUE
created_at TIMESTAMP
updated_at TIMESTAMP
```

**sessions**
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
session_token VARCHAR(255) UNIQUE NOT NULL
csrf_token VARCHAR(255) NOT NULL
ip_address VARCHAR(45)
user_agent TEXT
is_active BOOLEAN DEFAULT TRUE
expires_at TIMESTAMP NOT NULL
created_at TIMESTAMP
```

**company_members**
```sql
id UUID PRIMARY KEY
company_id UUID REFERENCES companies(id)
user_id UUID REFERENCES users(id)
role VARCHAR(20) CHECK (role IN ('admin', 'responsabile', 'dipendente', 'collaboratore', 'guest'))
staff_id UUID REFERENCES staff(id)
is_active BOOLEAN DEFAULT TRUE
created_at TIMESTAMP
```

**user_sessions**
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id) UNIQUE
active_company_id UUID REFERENCES companies(id)
last_activity TIMESTAMP
created_at TIMESTAMP
updated_at TIMESTAMP
```

**invites**
```sql
id UUID PRIMARY KEY
email VARCHAR(254) NOT NULL
role_id UUID REFERENCES roles(id)
tenant_id UUID REFERENCES tenants(id)
token_hash VARCHAR(255) UNIQUE NOT NULL
expires_at TIMESTAMP NOT NULL
created_by UUID REFERENCES users(id)
status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'expired', 'revoked'))
attempts INT DEFAULT 0
max_attempts INT DEFAULT 1
metadata JSONB
created_at TIMESTAMP
```

**audit_log**
```sql
id UUID PRIMARY KEY
timestamp TIMESTAMP DEFAULT NOW()
user_id UUID REFERENCES users(id)
tenant_id UUID REFERENCES tenants(id)
ip_address VARCHAR(45)
user_agent TEXT
action VARCHAR(50) NOT NULL
outcome VARCHAR(20) CHECK (outcome IN ('success', 'failure'))
reason TEXT
metadata JSONB
```

**rate_limit_buckets**
```sql
bucket_key VARCHAR(255) PRIMARY KEY
bucket_type VARCHAR(50) NOT NULL
request_count INT DEFAULT 0
window_start TIMESTAMP NOT NULL
max_requests INT NOT NULL
blocked_until TIMESTAMP
violation_count INT DEFAULT 0
lockout_level VARCHAR(20) CHECK (lockout_level IN ('warning', 'temporary', 'extended', 'permanent'))
```

#### **Tabelle NUOVE da creare**

**user_preferences**
```sql
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  preferred_company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id)
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
```

---

## 🔀 FLUSSI UTENTE

### **FLOW 1: Login Standard**

```
[START] User apre /login
  ↓
[PAGE LOAD] LoginPage carica LoginForm
  ↓
[CSRF] Hook fetcha CSRF token (background)
  ↓
[USER INPUT] User inserisce email + password
  |  Opzionale: seleziona "Ricordami"
  ↓
[VALIDATION CLIENT] Zod valida:
  |  - Email RFC 5322 valida
  |  - Password: 12+ caratteri, lettere+numeri
  |  ✅ Pass → Continua
  |  ❌ Fail → Mostra errori inline
  ↓
[RATE LIMIT CHECK] Hook verifica tentativi
  |  ✅ < 5 tentativi → Continua
  |  ❌ ≥ 5 tentativi → Mostra countdown blocco
  ↓
[SUBMIT] POST /auth/login
  |  Body: { email, password, rememberMe, csrf_token }
  ↓
[BACKEND VALIDATION]
  |  1. Verifica CSRF token valido
  |  2. Rate limiting (5 req/5min per email, 30 req/5min per IP)
  |  3. Account lockout check (locked_until > now?)
  |  4. User lookup (email)
  |  5. Password verify (bcrypt.compare)
  |  ✅ Success → Continua
  |  ❌ Fail → Incrementa failed_attempts, audit log, return error
  ↓
[SESSION CREATE]
  |  1. Reset failed_attempts = 0
  |  2. Cleanup sessioni scadute
  |  3. Generate session_token + csrf_token
  |  4. expires_at = rememberMe ? +30d : +24h
  |  5. Insert in sessions table
  |  6. Get user roles/permissions
  |  7. Audit log LOGIN_SUCCESS
  ↓
[RESPONSE] Return { user, session }
  ↓
[FRONTEND]
  |  1. Store session token (httpOnly cookie)
  |  2. Update React Query cache
  |  3. Toast success message
  |  4. Navigate('/dashboard')
  ↓
[MULTI-COMPANY LOGIC]
  |  1. Query user_preferences.preferred_company_id
  |  2. Se esiste → Set active_company_id = preferred
  |  3. Altrimenti → Set active_company_id = ultima usata
  |  4. Create/Update user_sessions
  |  5. Start activity tracking (3 min interval)
  ↓
[DASHBOARD] User vede dashboard
[END]
```

---

### **FLOW 2: Login Failed - Rate Limiting**

```
[START] User fa 5 tentativi falliti
  ↓
[BACKEND]
  |  1. failed_attempts = 5
  |  2. Escalation logic:
  |     - 1st lockout (5 attempts) → 5 min
  |     - 2nd lockout (10 attempts) → 15 min
  |     - 3rd lockout (15 attempts) → 1 hour
  |     - 4th+ lockout (20+ attempts) → 24 hours
  |  3. Set locked_until = now + duration
  |  4. Audit log ACCOUNT_LOCKED
  |  5. Return error 423 (Locked)
  ↓
[FRONTEND]
  |  1. Mostra banner arancione:
  |     "⚠️ Troppi tentativi di accesso"
  |     "Riprova tra X minuti e Y secondi"
  |  2. Countdown real-time update
  |  3. Bottone "Accedi" disabilitato
  ↓
[COUNTDOWN] Ogni secondo aggiorna tempo rimasto
  ↓
[UNLOCK] locked_until < now
  |  1. Nascondi banner
  |  2. Abilita bottone "Accedi"
  |  3. User può riprovare
[END]
```

---

### **FLOW 3: Password Recovery**

```
[START] User clicca "Password dimenticata?"
  ↓
[PAGE] /forgot-password
  |  Input: email, csrf_token
  ↓
[SUBMIT] POST /auth/recovery/request
  ↓
[BACKEND]
  |  1. Rate limiting (3 req/15min per email)
  |  2. User lookup (email)
  |  3. Se ESISTE:
  |     - Generate recovery_token (UUID)
  |     - expires_at = +12 ore
  |     - Insert in sessions (type='recovery')
  |     - Send email con link
  |  4. Sempre return success (email enumeration protection)
  |  5. Audit log PASSWORD_RESET_REQUESTED
  ↓
[RESPONSE] "Se l'email esiste, riceverai il link"
  ↓
[EMAIL] User riceve email con link:
  |  https://app.bhm.com/reset-password?token={recovery_token}
  ↓
[USER CLICK] Apre link
  ↓
[PAGE] /reset-password?token=...
  |  1. GET /invites/{token} per validare
  |  2. Se valido → Mostra form nuova password
  |  3. Se scaduto/usato → Mostra errore
  ↓
[SUBMIT] POST /auth/recovery/confirm
  |  Body: { token, password, csrf_token }
  ↓
[BACKEND]
  |  1. Validate token (exists, not expired, not used)
  |  2. Hash nuova password (bcrypt)
  |  3. Update users.password_hash
  |  4. Reset failed_login_attempts = 0, locked_until = NULL
  |  5. Deactivate recovery session (single-use)
  |  6. Revoke TUTTE altre sessioni attive (force re-login)
  |  7. Audit log PASSWORD_RESET_COMPLETED
  ↓
[RESPONSE] Success
  ↓
[FRONTEND]
  |  1. Toast "Password aggiornata con successo"
  |  2. Navigate('/login')
  |  3. User fa login con nuova password
[END]
```

---

### **FLOW 4: Invite & Registrazione**

```
[START] Admin crea invito
  ↓
[PAGE] /admin/invites/new
  |  Input: email, role, department_id
  ↓
[SUBMIT] POST /invites/create
  ↓
[BACKEND]
  |  1. Verify admin permissions
  |  2. Generate invite_token (UUID)
  |  3. expires_at = +30 giorni
  |  4. status = 'pending'
  |  5. Insert in invites table
  |  6. Send email con link
  |  7. Audit log INVITE_SENT
  ↓
[EMAIL] Nuovo dipendente riceve email:
  |  "Sei stato invitato a BHM"
  |  Link: https://app.bhm.com/accept-invite?token={invite_token}
  ↓
[USER CLICK] Apre link (entro 30 giorni)
  ↓
[PAGE] /accept-invite?token=...
  |  1. GET /invites/{token} per validare
  |  2. Se valido → Mostra form (firstName, lastName, password)
  |  3. Se scaduto/usato → Mostra errore
  ↓
[SUBMIT] POST /invites/accept
  |  Body: { token, firstName, lastName, password, csrf_token }
  ↓
[BACKEND]
  |  1. Validate token (exists, not expired, not used)
  |  2. Hash password (bcrypt)
  |  3. Create user account:
  |     - Insert in users table
  |     - email_verified = TRUE (invito pre-verificato)
  |  4. Assign role:
  |     - Insert in company_members (role from invite)
  |  5. Create session
  |  6. Update invite.status = 'accepted' (single-use)
  |  7. Audit log INVITE_ACCEPTED
  ↓
[RESPONSE] { user, session }
  ↓
[FRONTEND]
  |  1. Store session
  |  2. Toast "Benvenuto in BHM!"
  |  3. Navigate('/onboarding') (primo login → onboarding wizard)
[END]
```

---

### **FLOW 5: Multi-Company Switch**

```
[START] User loggato con 3 aziende
  ↓
[DASHBOARD] Dropdown aziende mostra:
  |  - Pizzeria Mario (attiva)
  |  - Trattoria Sole
  |  - Ristorante Bella Vita
  ↓
[USER CLICK] Seleziona "Trattoria Sole"
  ↓
[MUTATION] useAuth.switchCompany('trattoria-id')
  ↓
[BACKEND]
  |  1. Verify user è membro di azienda
  |  2. Update user_sessions.active_company_id = 'trattoria-id'
  |  3. Update user_sessions.updated_at
  |  4. Audit log COMPANY_SWITCH
  ↓
[FRONTEND]
  |  1. Invalidate TUTTE query React Query
  |  2. Dashboard ricarica con dati Trattoria Sole
  |  3. Toast "Azienda cambiata: Trattoria Sole"
  |  4. Nessun re-login (stesso token)
[END]
```

---

## 🎯 TARGETS & METRICHE

### **Performance**
- Page Load (LoginPage): <1s
- CSRF Token Fetch: <200ms
- Login Request: <500ms
- Dashboard Redirect: <300ms
- **Total Time to Dashboard**: <2s

### **Security**
- Password Hash: bcrypt cost=10 (~100ms)
- CSRF Token Rotation: Ogni 4 ore
- Session Cleanup: Automatico ogni login
- Rate Limiting: 5 tentativi → blocco
- Audit Log Coverage: 100% eventi critici

### **Accessibility**
- WCAG 2.1 AA Compliant
- Keyboard Navigation: 100%
- Screen Reader Support: Completo
- Color Contrast: ≥4.5:1
- Focus Indicators: Visibili

### **Reliability**
- Uptime: 99.9%
- Error Rate: <0.1%
- CSRF Retry Success: >95%
- Session Persistence: 99.99%

---

## 📊 DEFINITION OF DONE (DoD)

**Frontend**:
- [ ] LoginPage usa LoginForm component
- [ ] Link "Registrati ora" rimosso
- [ ] Bottone "Torna alla home" rimosso
- [ ] Password policy: 12 caratteri lettere+numeri (Zod)
- [ ] CSRF token fetch al page load
- [ ] Remember Me checkbox abilitato
- [ ] Password toggle accessibility migliorato (aria-label + aria-pressed)
- [ ] Rate limiting countdown visibile
- [ ] Multi-company preferenza utente implementata
- [ ] Activity tracking ogni 3 minuti

**Backend**:
- [ ] Password hash migrato a bcrypt (cost=10)
- [ ] Sessione 24 ore (normale), 30 giorni (remember me)
- [ ] Rate limiting escalation progressiva
- [ ] Recovery token 12 ore single-use
- [ ] Invite token 30 giorni single-use
- [ ] Audit log eventi critici completo
- [ ] Email enumeration protection attivo

**Database**:
- [ ] Tabella user_preferences creata
- [ ] Escalation rate limiting implementata
- [ ] Indici ottimizzati per query

**Testing**:
- [ ] Unit tests: 80% coverage
- [ ] Integration tests: Login flow completo
- [ ] E2E tests: User journey (login → dashboard)
- [ ] Security tests: CSRF, Rate limiting, Email enumeration
- [ ] Accessibility tests: WCAG 2.1 AA

**Documentazione**:
- [ ] API documentation aggiornata
- [ ] Migration guide (SHA-256 → bcrypt)
- [ ] User guide (Remember Me, Multi-company)
- [ ] Admin guide (Invite system)

---

## 🔗 PATTERN COLLEGATI

- **PAT-LOGIN-001**: Login Flow Standard
- **PAT-RECOVERY-001**: Password Recovery Flow
- **PAT-INVITE-001**: Invite System Flow
- **PAT-MULTICOMPANY-001**: Multi-Company Management

---

## 🚨 RISCHI & MITIGAZIONI

| Rischio | Probabilità | Impatto | Mitigazione |
|---------|-------------|---------|-------------|
| Password deboli user | Alta | Medio | Policy 12 char lettere+numeri obbligatoria |
| Brute force attack | Media | Alto | Rate limiting escalation + account lockout |
| CSRF attack | Bassa | Alto | Token obbligatorio + rotation 4h |
| Session hijacking | Bassa | Alto | HttpOnly cookies + HTTPS only |
| Email enumeration | Media | Medio | Sempre success generico su recovery |
| Token leak (recovery/invite) | Bassa | Alto | Single-use + scadenza breve (12h/30d) |
| Bcrypt migration fallita | Bassa | Critico | Re-hash al primo login + rollback plan |
| Multi-company confusion | Media | Basso | Preferenza utente + ultima usata default |

---

## 📅 VERSIONING

**v1.0.0** (Legacy - Clerk):
- Clerk Auth
- SHA-256 password
- Nessun rate limiting
- Registrazione pubblica

**v2.0.0** (Attuale - Supabase):
- Supabase Auth
- bcrypt password
- Rate limiting escalation
- Solo inviti
- Multi-company
- Remember Me
- CSRF protection
- Audit log completo

---

## 🎯 HANDOFF NOTES PER AGENTI PLANNING

### **Agente 0 - Orchestrator**
- Feature complessa: dividere in 3 sprint
  - Sprint 1: Frontend (LoginPage, CSRF, validation)
  - Sprint 2: Backend (bcrypt, rate limiting, sessions)
  - Sprint 3: Multi-company + Invite system
- Coordinare Agenti 4 (Backend) + 5 (Frontend) + 6 (Testing)
- Migration SHA-256 → bcrypt richiede strategia rollout graduale

### **Agente 1 - Product Strategy**
- KPI da tracciare:
  - Login success rate
  - Rate limiting trigger frequency
  - Remember Me adoption rate
  - Multi-company switch frequency
  - Invite acceptance rate
- Rischio: Utenti confusi da password policy più rigida (12 char)
  - Mitigazione: Messaggi chiari + esempi

### **Agente 2 - Systems Blueprint**
- Architettura multi-layer già definita
- Database schema: verificare che tabelle esistenti matchino specifica
- Nuova tabella user_preferences da creare
- API contract già definito (vedi sezione Endpoints)
- Dependency: bcrypt library (Backend), react-query (Frontend)

---

## ✅ READY FOR PLANNING

Questa specifica è **COMPLETA** e pronta per essere divisa in task dagli agenti di planning.

Tutti i comportamenti attesi sono definiti, tutti i flussi sono mappati, tutti i requisiti sono chiari.

**Prossimi step agenti**:
1. Agente 0: Creare piano sprint e dividere task
2. Agente 1: Validare KPI e rischi
3. Agente 2: Verificare architettura e dipendenze
4. Agenti 4+5+6: Ricevere task specifici ed eseguire
