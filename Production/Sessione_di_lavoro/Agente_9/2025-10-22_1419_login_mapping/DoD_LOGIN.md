# DEFINITION OF DONE - LOGIN SYSTEM

**Feature**: FEAT-LOGIN - Complete Authentication System
**Version**: 1.0.0
**Data**: 2025-10-22
**Owner**: Agente 9 - Knowledge Brain Mapper

---

## PURPOSE

Questo documento fornisce una checklist verificabile per garantire che tutte le modifiche al sistema di login siano complete, testate, e pronte per production.

Gli **Agenti 0, 1, 2** useranno questo DoD per:
- Definire scope sprint
- Assegnare task a development agents (4, 5, 6, 7)
- Verificare completion prima di merge

---

## ✅ CHECKLIST GENERALE

### **1. REQUIREMENTS ALIGNMENT**
- [ ] Tutte le 23 decisioni di FUNCTION_INVENTORY.md implementate
- [ ] FEATURE_SPEC_LOGIN.md rispettato in ogni dettaglio
- [ ] Pattern PAT-LOGIN-001, PAT-RECOVERY-001, PAT-INVITE-001 seguiti
- [ ] Nessuna deviazione non documentata dalle specifiche

### **2. CODE QUALITY**
- [ ] ESLint 0 errors, 0 warnings
- [ ] TypeScript strict mode abilitato, 0 errori di tipo
- [ ] Prettier formatting applicato a tutti i file modificati
- [ ] Nessun `console.log` o debug code lasciato
- [ ] Nessun `// TODO` o `// FIXME` irrisolti

### **3. DOCUMENTATION**
- [ ] Ogni funzione pubblica ha commenti JSDoc
- [ ] File README.md aggiornati se necessario
- [ ] ADR creati per decisioni architetturali (es: SHA-256 → bcrypt)
- [ ] CHANGELOG.md aggiornato con breaking changes

### **4. GIT & REVIEW**
- [ ] Branch creato da `main` con nome descrittivo (es: `feat/login-security-hardening`)
- [ ] Commit messages seguono conventional commits (feat:, fix:, refactor:)
- [ ] PR creata con template completo
- [ ] Almeno 1 code review approvato
- [ ] CI/CD pipeline verde (linting, tests, build)

---

## 🎨 FRONTEND (Agente 5)

### **1. LoginPage.tsx**

#### **Rimozioni**:
- [ ] Link "Registrati ora" (riga 188-193) rimosso
- [ ] Bottone "Torna alla home" (riga 200-220) rimosso
- [ ] Divider "oppure" (riga 174-182) rimosso se non più necessario

#### **Import LoginForm**:
- [ ] LoginPage importa e usa `<LoginForm />` invece di gestire stato interno
- [ ] Props passate correttamente (onSuccess, onError handlers)
- [ ] Layout e styling mantenuti consistenti

#### **Test**:
- [ ] Test E2E verifica elementi rimossi non presenti nel DOM
- [ ] Test verifica LoginForm renderizzato correttamente
- [ ] Test verifica link "Password dimenticata" ancora presente

---

### **2. LoginForm.tsx**

#### **Remember Me**:
- [ ] Checkbox `rememberMe` abilitato (rimuovere `disabled={true}` riga 320)
- [ ] Label aggiornata da "disponibile in versione futura" a testo chiaro
- [ ] Logica backend integrata per sessioni 30 giorni vs 24 ore

#### **Accessibility**:
- [ ] Aria-labels migliorati per screen readers
- [ ] Focus management corretto (tab order logico)
- [ ] Error messages leggibili da screen reader (aria-live)
- [ ] Contrast ratio AA (4.5:1) verificato per tutti i testi

#### **Test**:
- [ ] Test unitario checkbox remember me (checked/unchecked)
- [ ] Test integrazione con backend (verifica durata sessione)
- [ ] Test accessibility con axe-core (0 violazioni)

---

### **3. authSchemas.ts**

#### **Password Policy Update**:
- [ ] Password minLength cambiato da 8 a 12
- [ ] Regex aggiornato per richiedere lettere + numeri:
  ```typescript
  .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{12,}$/)
  ```
- [ ] Error message aggiornato: "Password deve essere di almeno 12 caratteri e contenere lettere e numeri"

#### **CSRF Token Schema**:
- [ ] loginFormSchema include campo `csrf_token` obbligatorio
- [ ] Validazione lunghezza/formato token

#### **Test**:
- [ ] Test unitario schema validazione password (12 char, lettere+numeri)
- [ ] Test errori per password invalide ("ciao123", "password12", "abcdefghijkl")
- [ ] Test errori CSRF token mancante/invalido

---

### **4. SignUpPage.tsx** (Nuovo)

#### **Creazione Componente**:
- [ ] Componente creato in `src/features/auth/SignUpPage.tsx`
- [ ] Legge query param `?token=...`
- [ ] Chiama `authClient.validateInviteToken(token)` al page load
- [ ] Mostra errore se token invalido/scaduto/usato
- [ ] Pre-compila form con dati da token (email, role, company)

#### **Form Fields**:
- [ ] Email (read-only, pre-compilato)
- [ ] First Name (required)
- [ ] Last Name (required)
- [ ] Password (required, validazione 12 char lettere+numeri)
- [ ] Confirm Password (required, match con password)
- [ ] Role e Company mostrati come info read-only

#### **Submit**:
- [ ] POST `/api/auth/sign-up` con { email, first_name, last_name, password, token }
- [ ] Success → store session token → redirect `/onboarding`
- [ ] Error → mostra messaggio user-friendly

#### **Test**:
- [ ] Test E2E completo flow (generazione invito → email → click link → registrazione)
- [ ] Test token scaduto (redirect login con errore)
- [ ] Test token già usato (redirect login con errore)
- [ ] Test password validation (12 char, lettere+numeri)

---

### **5. useCsrfToken.ts**

#### **CSRF Token Lifecycle**:
- [ ] Hook fetcha token al page load di LoginPage
- [ ] Token memorizzato in state (non localStorage per sicurezza)
- [ ] Token lifetime 4 ore rispettato
- [ ] Auto-refresh se token expira durante sessione

#### **Retry Logic**:
- [ ] Max 3 tentativi se fetch CSRF fallisce
- [ ] Exponential backoff tra retry (1s, 2s, 4s)
- [ ] Dopo 3 fallimenti → mostra errore + suggerisci reload pagina

#### **Test**:
- [ ] Test fetch CSRF success (token stored in state)
- [ ] Test fetch CSRF failure → retry 3 volte
- [ ] Test token expiration → auto-refresh

---

### **6. useRateLimit.ts**

#### **Escalation Logic**:
- [ ] 5 tentativi → lockout 5 minuti
- [ ] 10 tentativi → lockout 15 minuti
- [ ] 15 tentativi → lockout 1 ora
- [ ] 20+ tentativi → lockout 24 ore
- [ ] Countdown visibile in UI (già implementato)

#### **Test**:
- [ ] Test escalation levels (5, 10, 15, 20+ tentativi)
- [ ] Test countdown decrescente (secondsUntilReset)
- [ ] Test reset dopo cooldown period

---

## 🔧 BACKEND (Agente 4)

### **1. auth/login Edge Function**

#### **Password Verification**:
- [ ] SHA-256 completamente rimosso
- [ ] bcrypt.compare() implementato per verifica password
- [ ] Cost factor 10 configurato (bilanciamento sicurezza/performance)
- [ ] Performance target: < 150ms per hash

#### **Migration Strategy**:
- [ ] Se password_hash inizia con `$2b$` → usa bcrypt (già migrato)
- [ ] Se password_hash è SHA-256 → verifica con SHA-256, poi re-hash con bcrypt e salva
- [ ] Log eventi migrazione in audit_log

#### **CSRF Validation**:
- [ ] Token validato ad ogni login request
- [ ] Verifica lifetime 4 ore
- [ ] Errore 403 se CSRF invalido/scaduto

#### **Rate Limiting**:
- [ ] Check `failed_login_attempts` da tabella `users`
- [ ] Calcolo lockout duration con escalation progressiva
- [ ] Se locked out → return 429 con `retry_after` header
- [ ] Increment `failed_login_attempts` su password wrong
- [ ] Reset `failed_login_attempts` a 0 su login success

#### **Session Creation**:
- [ ] Se `rememberMe=true` → session 30 giorni
- [ ] Se `rememberMe=false` → session 24 ore
- [ ] Session token crittograficamente sicuro (32 bytes random hex)
- [ ] `expires_at` calcolato correttamente

#### **Multi-Company Setup**:
- [ ] Query `company_members` per user_id
- [ ] Se 1 company → auto-select
- [ ] Se 2+ companies → check `user_preferences.preferred_company_id`
- [ ] Return active_company_id in response

#### **Audit Logging**:
- [ ] LOGIN_SUCCESS con timestamp, IP, user_agent
- [ ] LOGIN_FAILED con reason (INVALID_CREDENTIALS, RATE_LIMITED, CSRF_INVALID)

#### **Test**:
- [ ] Test login success (bcrypt, session 24h)
- [ ] Test login con rememberMe (session 30 giorni)
- [ ] Test password wrong → failed_attempts incrementato
- [ ] Test rate limiting escalation (5, 10, 15, 20 tentativi)
- [ ] Test CSRF token invalido → 403
- [ ] Test multi-company (0, 1, 2+ companies)

---

### **2. auth/password-recovery Edge Function**

#### **Request Recovery**:
- [ ] Rate limiting: max 3 richieste/15 minuti per email
- [ ] Email enumeration protection: sempre return success
- [ ] Se user esiste → genera token + invia email
- [ ] Se user NON esiste → log evento + return success (delay artificiale 100-300ms)

#### **Token Generation**:
- [ ] Token crittograficamente sicuro (32 bytes random hex)
- [ ] Expires in 12 ore (43200 secondi)
- [ ] Single-use: campo `used` settato a `false`

#### **Validate Token**:
- [ ] Verifica token esiste
- [ ] Verifica non scaduto (expires_at > now)
- [ ] Verifica non già usato (used = false)

#### **Reset Password**:
- [ ] Valida nuovo password (12 char, lettere+numeri)
- [ ] Hash con bcrypt cost=10
- [ ] Aggiorna `users.password_hash`
- [ ] Marca token come usato (used=true, used_at=now)
- [ ] Reset `failed_login_attempts` a 0

#### **Audit Logging**:
- [ ] PASSWORD_RESET_REQUESTED
- [ ] PASSWORD_RESET_REQUESTED_INVALID (se email non esiste)
- [ ] PASSWORD_CHANGED

#### **Test**:
- [ ] Test request recovery (user esiste → email inviata)
- [ ] Test request recovery (user NON esiste → success ma no email)
- [ ] Test token scaduto → 400 error
- [ ] Test token già usato → 400 error
- [ ] Test reset password success → login con nuova password funziona

---

### **3. auth/sign-up Edge Function** (Nuovo)

#### **Invite Token Validation**:
- [ ] Verifica token esiste in `invite_tokens`
- [ ] Verifica non scaduto (expires_at > now)
- [ ] Verifica non già usato (used = false)
- [ ] Verifica email non già registrata

#### **User Creation**:
- [ ] Hash password con bcrypt cost=10
- [ ] Insert in `users` table con email_verified=true
- [ ] Insert in `company_members` con role da invite

#### **Token Consumed**:
- [ ] Marca invite token come usato (used=true, used_at=now, used_by=user_id)

#### **Session Creation**:
- [ ] Crea sessione iniziale 24 ore
- [ ] Return session_token + user + company in response

#### **Audit Logging**:
- [ ] USER_REGISTERED_VIA_INVITE

#### **Test**:
- [ ] Test registrazione success (token valido)
- [ ] Test token scaduto → 400 error
- [ ] Test token già usato → 400 error
- [ ] Test email già registrata → 400 error

---

### **4. auth/generate-invite-token Edge Function** (Nuovo)

#### **Permission Check**:
- [ ] Verifica user ha ruolo Admin o Responsabile
- [ ] Se non autorizzato → 403 error

#### **Email Validation**:
- [ ] Verifica email non già registrata in `users`
- [ ] Se già registrata → return error "USER_ALREADY_EXISTS"

#### **Token Generation**:
- [ ] Invalida inviti precedenti per stessa email+company (non usati)
- [ ] Genera nuovo token crittograficamente sicuro
- [ ] Expires in 30 giorni
- [ ] Insert in `invite_tokens` table

#### **Email Sending**:
- [ ] Integrazione con email provider (Resend/SendGrid)
- [ ] Template email con registration link + token
- [ ] Se email send fallisce → rollback token creation

#### **Audit Logging**:
- [ ] INVITE_CREATED
- [ ] INVITE_EMAIL_SENT

#### **Test**:
- [ ] Test generazione invito success
- [ ] Test permission denied (user non Admin/Responsabile)
- [ ] Test email già registrata → error
- [ ] Test inviti multipli → solo ultimo valido
- [ ] Test email send failure → rollback

---

### **5. generate-csrf-token Edge Function**

#### **Token Generation**:
- [ ] Token crittograficamente sicuro (32 bytes random hex)
- [ ] Lifetime 4 ore (14400 secondi)
- [ ] Stored in-memory cache o Redis (NO database per performance)

#### **Response**:
- [ ] Return { token, expires_at }
- [ ] Header `Cache-Control: no-store` (prevent caching)

#### **Test**:
- [ ] Test generazione token success
- [ ] Test token diversi per richieste multiple
- [ ] Test expiration 4 ore verificata

---

### **6. activity-tracker Edge Function**

#### **Activity Update**:
- [ ] Trigger: ogni 3 minuti (180 secondi) da frontend
- [ ] Update `users.last_activity` con timestamp corrente
- [ ] Se session scaduta → return 401

#### **Test**:
- [ ] Test update last_activity success
- [ ] Test session scaduta → 401

---

## 💾 DATABASE (Agente 2)

### **1. users Table**

#### **Schema Changes**:
- [ ] `password_hash` supporta sia SHA-256 che bcrypt (VARCHAR 255)
- [ ] `failed_login_attempts` INTEGER DEFAULT 0
- [ ] `locked_until` TIMESTAMP NULL
- [ ] `last_activity` TIMESTAMP NULL

#### **Migration Script**:
```sql
ALTER TABLE users
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP;
```

#### **Indexes**:
- [ ] Index su `email` (già esistente)
- [ ] Index su `locked_until` (per rate limiting queries)

---

### **2. sessions Table**

#### **Schema Changes**:
- [ ] `expires_at` TIMESTAMP (supporta sia 24h che 30 giorni)
- [ ] `remember_me` BOOLEAN DEFAULT FALSE

#### **Migration Script**:
```sql
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS remember_me BOOLEAN DEFAULT FALSE;
```

---

### **3. user_preferences Table** (Nuovo)

#### **Creazione Tabella**:
```sql
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  preferred_company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  theme VARCHAR(20) DEFAULT 'light',
  language VARCHAR(10) DEFAULT 'it',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **RLS Policies**:
```sql
-- User può leggere solo le proprie preferenze
CREATE POLICY "Users can view own preferences"
ON user_preferences FOR SELECT
USING (auth.uid() = user_id);

-- User può aggiornare solo le proprie preferenze
CREATE POLICY "Users can update own preferences"
ON user_preferences FOR UPDATE
USING (auth.uid() = user_id);
```

---

### **4. invite_tokens Table** (Nuovo)

#### **Creazione Tabella**:
```sql
CREATE TABLE IF NOT EXISTS invite_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP,
  used_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  invalidated_at TIMESTAMP
);
```

#### **Indexes**:
- [ ] Index su `token` (UNIQUE, per fast lookup)
- [ ] Index su `email` (per queries inviti per email)
- [ ] Index su `company_id` (per queries inviti per azienda)

#### **RLS Policies**:
```sql
-- Solo Admin/Responsabile possono vedere inviti della propria company
CREATE POLICY "Admins can view company invites"
ON invite_tokens FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM company_members
    WHERE user_id = auth.uid()
    AND role IN ('Admin', 'Responsabile')
  )
);
```

---

### **5. recovery_tokens Table**

#### **Verifiche Schema**:
- [ ] `token` VARCHAR(255) UNIQUE NOT NULL
- [ ] `user_id` UUID REFERENCES users(id)
- [ ] `expires_at` TIMESTAMP NOT NULL (12 ore)
- [ ] `used` BOOLEAN DEFAULT FALSE
- [ ] `used_at` TIMESTAMP

---

### **6. audit_log Table**

#### **Eventi Supportati**:
- [ ] LOGIN_SUCCESS
- [ ] LOGIN_FAILED
- [ ] PASSWORD_RESET_REQUESTED
- [ ] PASSWORD_RESET_REQUESTED_INVALID
- [ ] PASSWORD_CHANGED
- [ ] INVITE_CREATED
- [ ] INVITE_EMAIL_SENT
- [ ] USER_REGISTERED_VIA_INVITE
- [ ] CSRF_TOKEN_INVALID
- [ ] RATE_LIMITED

#### **Schema**:
```sql
action VARCHAR(100) NOT NULL,
user_id UUID REFERENCES users(id),
company_id UUID REFERENCES companies(id),
details JSONB,
outcome VARCHAR(50), -- 'success' | 'failure'
ip_address INET,
user_agent TEXT,
created_at TIMESTAMP DEFAULT NOW()
```

---

## 🧪 TESTING (Agente 6)

### **1. Unit Tests**

#### **Frontend**:
- [ ] `authSchemas.test.ts` - Validazione password (12 char, lettere+numeri)
- [ ] `LoginForm.test.tsx` - Remember me checkbox
- [ ] `useCsrfToken.test.ts` - Retry logic (3 tentativi)
- [ ] `useRateLimit.test.ts` - Escalation levels

#### **Backend**:
- [ ] `bcrypt-utils.test.ts` - Hash/verify password
- [ ] `rate-limiter.test.ts` - Escalation calculation
- [ ] `csrf-manager.test.ts` - Token generation/validation

#### **Target Coverage**:
- [ ] Line coverage ≥ 80%
- [ ] Branch coverage ≥ 70%
- [ ] Function coverage ≥ 85%

---

### **2. Integration Tests**

#### **Login Flow**:
- [ ] Login success (password corretta, CSRF valido)
- [ ] Login failure (password errata, failed_attempts incrementato)
- [ ] Rate limiting (5 tentativi → lockout 5 min)
- [ ] Remember me (session 30 giorni)
- [ ] Multi-company (0, 1, 2+ companies)

#### **Password Recovery Flow**:
- [ ] Request recovery (user esiste → email inviata)
- [ ] Request recovery (user NON esiste → success ma no email)
- [ ] Reset password success
- [ ] Token scaduto/usato → error

#### **Invite Registration Flow**:
- [ ] Generazione invito → email → registrazione → login
- [ ] Token scaduto → error
- [ ] Token usato → error

---

### **3. E2E Tests (Playwright)**

#### **Critical User Journeys**:
- [ ] **Happy Path Login**: Home → Login → Dashboard
- [ ] **Login con Remember Me**: Verifica session 30 giorni
- [ ] **Password Dimenticata**: Request → Email → Reset → Login
- [ ] **Registrazione via Invito**: Email → Click Link → Form → Onboarding
- [ ] **Rate Limiting UI**: 5 tentativi errati → countdown visibile

#### **Visual Regression**:
- [ ] Screenshot LoginPage (con/senza errori)
- [ ] Screenshot SignUpPage (token valido/invalido)
- [ ] Screenshot rate limiting banner

#### **Accessibility**:
- [ ] Axe-core scan LoginPage (0 violazioni)
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Screen reader test (NVDA/JAWS)

---

### **4. Performance Tests**

#### **Benchmarks**:
- [ ] bcrypt hash: < 150ms (95th percentile)
- [ ] Login endpoint: < 500ms (95th percentile)
- [ ] CSRF token fetch: < 200ms (95th percentile)
- [ ] Page load LoginPage: < 2 secondi

#### **Load Tests** (opzionale, pre-launch):
- [ ] 100 concurrent users login
- [ ] Rate limiting non blocca user legittimi
- [ ] Database connection pooling adeguato

---

## 🔒 SECURITY (Agente 7)

### **1. Security Audit**

#### **Password Security**:
- [ ] bcrypt cost=10 verificato (bilanciamento sicurezza/performance)
- [ ] Password policy 12 char lettere+numeri applicata
- [ ] Nessun password logging (né in console né in audit_log)

#### **CSRF Protection**:
- [ ] Token crittograficamente sicuro (32 bytes random hex)
- [ ] Lifetime 4 ore rispettato
- [ ] Token validato su tutte le richieste autenticate

#### **Rate Limiting**:
- [ ] Escalation progressiva implementata
- [ ] Lockout durations corretti (5min, 15min, 1h, 24h)
- [ ] IP-based rate limiting (opzionale, per v2)

#### **Email Enumeration Protection**:
- [ ] Password recovery sempre return success
- [ ] Delay artificiale per user non esistenti (100-300ms)

#### **Token Security**:
- [ ] Recovery token 12 ore + single-use
- [ ] Invite token 30 giorni + single-use
- [ ] Session token crittograficamente sicuro

#### **Audit Logging**:
- [ ] Eventi critici loggati (LOGIN_SUCCESS/FAILED, PASSWORD_CHANGE)
- [ ] IP address e user_agent registrati
- [ ] Nessuna PII sensibile in logs (no password hash, no CSRF token)

---

### **2. Penetration Testing** (opzionale, pre-launch)

#### **Attack Vectors**:
- [ ] Brute force login (verificare rate limiting blocca)
- [ ] CSRF attack (verificare token protegge)
- [ ] Email enumeration (verificare sempre success)
- [ ] Token reuse (verificare single-use enforcement)
- [ ] Session hijacking (verificare token rotation)

---

## 📊 MONITORING & ALERTS

### **1. Metrics** (post-deploy)

#### **Login Success Rate**:
- [ ] Dashboard Grafana/DataDog con metric `login_success_rate`
- [ ] Alert se < 95% success rate (possibile issue backend)

#### **Rate Limiting Events**:
- [ ] Counter `rate_limited_events` per severity level (5, 10, 15, 20+)
- [ ] Alert se spike improvviso (possibile attacco)

#### **CSRF Failures**:
- [ ] Counter `csrf_validation_failures`
- [ ] Alert se > 1% richieste (possibile attacco o bug frontend)

#### **Password Reset Requests**:
- [ ] Counter `password_reset_requests`
- [ ] Alert se spike improvviso (possibile attacco)

---

### **2. Error Tracking** (Sentry/LogRocket)

#### **Frontend Errors**:
- [ ] CSRF fetch failure (network issue?)
- [ ] Token validation failure (backend down?)
- [ ] Unexpected 500 errors

#### **Backend Errors**:
- [ ] Database connection failures
- [ ] Email service failures (SendGrid/Resend down?)
- [ ] bcrypt hash failures (CPU overload?)

---

## 🚀 DEPLOYMENT

### **1. Pre-Deploy Checklist**

- [ ] All DoD items ✅ checked
- [ ] CI/CD pipeline verde (lint, test, build)
- [ ] Staging environment tested (smoke tests)
- [ ] Database migrations applied in staging
- [ ] Rollback plan documentato

---

### **2. Deploy Steps**

1. [ ] **Database Migrations**: Apply in order (users, sessions, user_preferences, invite_tokens, recovery_tokens)
2. [ ] **Backend Deploy**: Edge Functions aggiornate (zero-downtime con versioning)
3. [ ] **Frontend Deploy**: Nuova build con LoginPage/SignUpPage aggiornati
4. [ ] **Smoke Tests**: Verificare login funziona in production
5. [ ] **Monitor Errors**: Check Sentry per 15 minuti post-deploy

---

### **3. Rollback Plan**

**Se errori critici entro 1 ora da deploy**:
1. [ ] Rollback frontend a versione precedente (Vercel/Netlify instant rollback)
2. [ ] Rollback backend Edge Functions a versione precedente
3. [ ] Database: **NON rollback** (migrations sono additive, compatibili backward)
4. [ ] Post-mortem entro 24 ore

---

## 📝 ACCEPTANCE SIGN-OFF

### **Agente 0 (Orchestrator)**:
- [ ] Verificato coordinamento tra tutti gli agenti
- [ ] Verificato integration points funzionano
- [ ] Approvato per merge in `main`

### **Agente 1 (Product Strategy)**:
- [ ] Verificato alignment con obiettivi business
- [ ] Verificato KPI definiti e misurabili
- [ ] Approvato per deploy production

### **Agente 2 (Systems Blueprint)**:
- [ ] Verificato database schema completo
- [ ] Verificato API contracts definiti
- [ ] Verificato RLS policies corrette

### **Agente 4 (Back-End)**:
- [ ] Tutti gli Edge Functions implementati e testati
- [ ] bcrypt migration strategy implementata
- [ ] Audit logging completo

### **Agente 5 (Front-End)**:
- [ ] LoginPage, SignUpPage, LoginForm aggiornati
- [ ] Accessibility AA verificato
- [ ] UI/UX testato su Chrome, Firefox, Safari

### **Agente 6 (Testing)**:
- [ ] Unit tests ≥ 80% coverage
- [ ] Integration tests completi
- [ ] E2E tests critical paths verdi

### **Agente 7 (Security)**:
- [ ] Security audit completato (0 high/critical issues)
- [ ] OWASP Top 10 verificato
- [ ] Approvato per production

---

## 🎯 FINAL APPROVAL

**Data**: _______________
**Sprint**: _______________

**Signature**:
- [ ] **Agente 0 (Orchestrator)**: _______________
- [ ] **Agente 1 (Product Strategy)**: _______________
- [ ] **Owner/PM**: _______________

**Status**: ✅ READY FOR PRODUCTION / ❌ NEEDS WORK

---

**END OF DEFINITION OF DONE - LOGIN SYSTEM**
