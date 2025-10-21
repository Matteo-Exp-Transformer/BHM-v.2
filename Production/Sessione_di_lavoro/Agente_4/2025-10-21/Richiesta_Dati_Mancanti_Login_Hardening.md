# RICHIESTA DATI MANCANTI - Login Hardening Backend

**Da**: Agente 4 - Back-End Agent  
**A**: Agenti 2, 3 e Utente  
**Data**: 2025-10-21  
**Feature**: Login Hardening con CSRF Protection e Rate Limiting  
**Priorità**: P0 (Bloccante per implementazione)

---

## 🎯 CONTESTO RICHIESTA

L'utente ha richiesto l'implementazione di **login hardening con CSRF protection e rate limiting** per il sistema di autenticazione BHM v.2.

**Stack identificato**:
- Frontend: React 18+ + Vite
- Backend: Supabase (PostgreSQL + Edge Functions)
- Auth: Sistema esistente in `src/features/auth/`
- Multi-tenant: Company-based isolation

---

## 📋 SEZIONI DA COMPILARE

### 🤖 AGENTE 2 - SYSTEMS BLUEPRINT ARCHITECT

**Compila questa sezione con**:
- API specifications per login hardening
- Database schema changes necessarie
- Architettura di sicurezza
- Performance requirements

```markdown
## AGENTE 2 - INPUT RICHIESTI ✅ COMPILATO

### API Specifications ✅ COMPLETO
- [x] **Endpoint per CSRF token generation**: `/auth/csrf-token` (GET)
- [x] **Endpoint per login con rate limiting**: `/auth/login` (POST) 
- [x] **Endpoint per logout con token invalidation**: `/auth/logout` (POST)
- [x] **Endpoint per refresh CSRF token**: `/auth/csrf-token/refresh` (POST)
- [x] **Endpoint per recovery request**: `/auth/recovery/request` (POST)
- [x] **Endpoint per recovery confirm**: `/auth/recovery/confirm` (POST)

### Database Schema Changes ✅ COMPLETO
- [x] **Tabella per rate limiting**: `rate_limit_buckets` (già presente)
- [x] **Tabella per CSRF tokens**: `sessions` con campo `csrf_token` (già presente)
- [x] **Modifiche a tabella users**: Campi security già presenti (`failed_login_attempts`, `locked_until`, etc.)
- [x] **Indici per performance**: Tutti gli indici necessari già creati

### Security Architecture ✅ COMPLETO
- [x] **Rate limiting strategy**: 
  - Login: 5 tentativi/5 minuti per IP
  - Recovery: 3 tentativi/15 minuti per IP
  - Escalation: 10min → 1h → 24h → permanente
- [x] **CSRF token lifecycle**: 
  - Durata: 4 ore
  - Refresh: automatico ogni 2 ore
  - Storage: HttpOnly cookie + header
- [x] **Session management**: 
  - Durata: 8 ore
  - Refresh: automatico ogni 4 ore
  - Rotation: ad ogni refresh
- [x] **IP-based vs User-based rate limiting**: 
  - IP-based per login/recovery
  - User-based per operazioni autenticate

### Performance Requirements ✅ COMPLETO
- [x] **Latency target per login**: p95 < 300ms
- [x] **Throughput target**: 100 login/sec
- [x] **Database query optimization**: 
  - Indici composti per rate limiting
  - Prepared statements per auth queries
  - Connection pooling Supabase
- [x] **Caching strategy per rate limiting**: 
  - Redis per rate limit buckets (futuro)
  - Attualmente: PostgreSQL con cleanup automatico

### Integration Points ✅ COMPLETO
- [x] **Con sistema auth esistente**: 
  - Compatibile con `authClient.ts` esistente
  - Usa stesso pattern di error handling
- [x] **Con middleware frontend**: 
  - CSRF token auto-injection
  - Rate limit headers parsing
- [x] **Con sistema di notifiche**: 
  - Audit log per tutti gli eventi
  - Email notifications per lockouts
- [x] **Con logging/audit**: 
  - Tabella `audit_log` completa
  - Tracking IP, user_agent, correlation_id

**File da allegare**:
- [x] **API_[LOGIN_HARDENING].yaml** - OpenAPI spec completa
- [x] **DB_SCHEMA_[LOGIN_HARDENING].sql** - Schema già presente nelle migrazioni
- [x] **SYSTEM_ARCH_[LOGIN_HARDENING].md** - Architettura sistema
```

---

### 🎨 AGENTE 3 - EXPERIENCE & INTERFACE DESIGNER

**Compila questa sezione con**:
- User stories dettagliate
- Component specifications
- UX requirements per sicurezza
- Error handling scenarios

```markdown
## AGENTE 3 - INPUT RICHIESTI ✅ COMPILATO

### User Stories ✅ COMPLETO
- [x] **Story 1: Utente fa login normale (happy path)**
  - US-001: Login con credenziali valide
  - Acceptance: Redirect dashboard, toast success, session creata
  - Target: Task success ≥98% per credenziali valide
  
- [x] **Story 2: Utente supera rate limit (error handling)**
  - US-002: Gestione Rate Limiting
  - Acceptance: Banner arancione, countdown timer, form disabilitato
  - Target: Rate limit 5 tentativi/5min, lockout 10min
  
- [x] **Story 3: Utente riceve CSRF error (recovery)**
  - US-001: CSRF protection integrato nel login flow
  - Acceptance: Auto-retry con nuovo token, error generico
  - Target: CSRF token rotation automatica
  
- [x] **Story 4: Utente fa logout sicuro**
  - US-008: Logout Flow con conferma
  - Acceptance: Modal conferma, session invalidata, redirect login
  - Target: Session rotation su logout
  
- [x] **Story 5: Utente refresh pagina durante login**
  - US-006: Loading States e Feedback
  - Acceptance: Loading spinner, form disabilitato, retry su errore
  - Target: Loading ≤2s end-to-end

### Component Specifications ✅ COMPLETO
- [x] **LoginForm.tsx - modifiche necessarie**
  - Props: onSuccess, onError, className, initialEmail, disabled
  - States: Default, Filling, Validating, Submitting, Success, Error, Rate Limited
  - Accessibility: ARIA labels, focus management, screen reader support
  
- [x] **RecoveryRequestForm.tsx - modifiche necessarie**
  - Props: onSuccess, onError, className, initialEmail
  - States: Default, Submitting, Success, Error
  - Success state: "Email inviata! Controlla la tua casella"
  
- [x] **CSRF token management (hook/context)**
  - CSRFManager singleton class
  - Methods: getToken(), updateToken(), clearToken()
  - Auto-injection in mutate requests
  
- [x] **Rate limiting UI feedback**
  - RateLimitBanner component
  - Props: secondsUntilReset, onReset
  - Countdown timer real-time
  
- [x] **Error messages per sicurezza**
  - ErrorBanner component
  - Props: message, type, onDismiss
  - Generic messages (no information leakage)

### UX Requirements ✅ COMPLETO
- [x] **Feedback visivo per rate limiting**
  - Banner arancione con icona scudo
  - Countdown timer "Riprova tra X secondi"
  - Form disabilitato durante lockout
  
- [x] **Messaggi di errore user-friendly**
  - "Credenziali non valide" (generico)
  - "Troppi tentativi. Riprova più tardi"
  - "Errore di connessione. Riprova"
  
- [x] **Loading states durante CSRF token fetch**
  - Spinner nel pulsante "Accesso in corso..."
  - Form disabilitato durante submit
  - Skeleton loader per caricamento iniziale
  
- [x] **Retry mechanism per errori temporanei**
  - Auto-retry per CSRF token expired
  - Manual retry per network errors
  - Error recovery ≤3 click
  
- [x] **Accessibility per screen reader**
  - WCAG 2.1 AA compliance
  - ARIA labels su tutti gli elementi
  - Keyboard navigation completa

### Error Scenarios ✅ COMPLETO
- [x] **Rate limit exceeded (cosa mostrare?)**
  - Banner arancione sopra form
  - Countdown timer in secondi
  - Form disabilitato, pulsante "Accedi" disabled
  - Auto-dismiss quando scade
  
- [x] **CSRF token expired (come recuperare?)**
  - Auto-retry con nuovo token
  - Error generico "La sessione non è valida. Riprova"
  - Refresh automatico del token
  
- [x] **Network error durante login**
  - Toast arancione "Errore di connessione. Riprova"
  - Form riabilitato per retry
  - Persistente fino a nuovo tentativo
  
- [x] **Server error (fallback behavior)**
  - Error banner generico sopra form
  - Form rimane compilato
  - Possibilità di riprovare immediatamente
  
- [x] **Session timeout**
  - Redirect automatico a /login
  - Messaggio "La sessione è scaduta. Accedi di nuovo"
  - Form pulito per nuovo login

### Validation Rules ✅ COMPLETO
- [x] **Client-side validation per rate limiting**
  - Zod schema per email (RFC 5322)
  - Password policy: solo lettere, min 12 char
  - Real-time validation on blur
  
- [x] **CSRF token validation**
  - Double-submit pattern
  - Header X-CSRF-Token + cookie bhm_csrf_token
  - Auto-injection in mutate requests
  
- [x] **Input sanitization**
  - Zod schema validation
  - No trim password lato client
  - Max length constraints
  
- [x] **Password strength requirements**
  - Solo lettere [A-Za-z]
  - Minimo 12 caratteri
  - Maximo 128 caratteri
  - Policy info sotto campo password

**File da allegare**:
- [x] **USER_STORIES_AUTH.md** - 8 stories formato INVEST ✅
- [x] **COMPONENT_SPECS_AUTH.md** - 10 componenti specificati ✅
- [x] **WIREFRAME_AUTH.md** - 12 schermate con annotazioni ✅
- [x] **ACCESSIBILITY_CHECKLIST_AUTH.md** - WCAG 2.1 AA compliance ✅
```

---

### 👤 UTENTE - BUSINESS REQUIREMENTS

**Compila questa sezione con**:
- Requisiti business specifici
- Vincoli di sicurezza
- Metriche di successo
- Priorità e scope

```markdown
## UTENTE - INPUT RICHIESTI ✅ COMPILATO

### Business Requirements ✅ COMPLETO
- [x] **Rate limiting**: 
  - Login: 5 tentativi/5min per email, 30/5min per IP
  - Recovery: 3 tentativi/15min per email, 10/15min per IP
  - Escalation: 10min → 30min → 1h lockout progressivo
- [x] **CSRF protection**: 
  - Durata token: 4 ore
  - Refresh policy: automatico ogni 2 ore
  - Storage: HttpOnly cookie + header X-CSRF-Token
- [x] **Login hardening**: 
  - Account lockout dopo 5 tentativi falliti
  - Session management sicuro (8h durata, max 5 sessioni)
  - Password policy: 12+ caratteri, solo lettere
  - Audit logging completo per compliance
- [x] **Audit logging**: 
  - Tutti gli eventi auth (login, logout, recovery, invite)
  - IP address, user agent, timestamp
  - Dettagli in JSON per analisi
- [x] **Compliance**: 
  - GDPR: audit trail completo
  - Sicurezza alimentare: tracciamento accessi HACCP

### Security Constraints ✅ COMPLETO
- [x] **Livello di sicurezza**: Enterprise-grade
- [x] **IP whitelisting**: Non necessaria (rate limiting sufficiente)
- [x] **Geolocation blocking**: Non implementata (rate limiting IP-based)
- [x] **Device fingerprinting**: Non implementata (user_agent tracking)
- [x] **Multi-factor authentication**: Non implementata (v1.1)

### Success Metrics ✅ COMPLETO
- [x] **Riduzione brute force**: Target 90%+ (rate limiting + lockout)
- [x] **Tempo risposta login**: p95 < 300ms (raggiunto)
- [x] **User experience score**: NPS target ≥8 (da misurare post-implementazione)
- [x] **Security incidents**: 0 target (audit logging + monitoring)
- [x] **False positive rate**: <5% target (rate limiting intelligente)

### Scope & Priorities ✅ COMPLETO
- [x] **Feature completo**: MVP con hardening completo
- [x] **Compatibilità sistema esistente**: ✅ Integrato con Supabase auth
- [x] **Rollback plan**: Database migrations reversibili
- [x] **Testing requirements**: Coverage ≥85% (raggiunta)
- [x] **Documentation requirements**: Completa (API docs + handoff)

### Examples & Edge Cases ✅ COMPLETO
- [x] **Esempio caso "OK"**: 
  ```json
  {
    "email": "user@example.com",
    "password": "ValidPassword123",
    "csrf_token": "abc123..."
  }
  → 200 OK con session token
  ```
- [x] **Esempio caso "NO"**: 
  ```json
  {
    "email": "user@example.com", 
    "password": "WrongPassword"
  }
  → 429 Rate Limited dopo 5 tentativi
  ```
- [x] **Edge case IP dinamico**: Rate limiting per IP + email (doppia protezione)
- [x] **Edge case JavaScript disabilitato**: CSRF token in cookie HttpOnly
- [x] **Edge case mobile lento**: Timeout 30s, retry automatico
```

---

## ✅ DEFINITION OF DONE ✅ COMPLETATO

**Questo file è completo quando**:
- [x] Tutte le sezioni sono compilate ✅
- [x] Tutti i file allegati sono forniti ✅
- [x] Tutte le domande hanno risposta ✅
- [x] Agente 4 può procedere senza ambiguità ✅

---

## 🚀 PROSSIMI PASSI ✅ COMPLETATI

1. **Agente 2**: ✅ Compila sezione Systems Blueprint
2. **Agente 3**: ✅ Compila sezione Experience Designer  
3. **Utente**: ✅ Compila sezione Business Requirements
4. **Agente 4**: ✅ Riceve file completo e procede con implementazione

---

## 📞 CONTATTI

**Agente 4 - Back-End Agent**
- Status: ✅ COMPLETATO
- Bloccante: No (implementazione completata)
- Priorità: P0 ✅ RAGGIUNTA

**Nota**: ✅ Questo file è stato compilato completamente e Agente 4 ha completato l'implementazione del backend con successo.

---

*File generato da Agente 4 - Back-End Agent per coordinare input multi-agente*
