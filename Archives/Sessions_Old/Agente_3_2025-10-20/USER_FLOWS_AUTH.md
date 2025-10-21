# USER FLOWS - Login Hardening Auth Flow

**Data**: 2025-10-20  
**Autore**: Agente 3 - Experience & Interface Designer  
**Versione**: 1.0  
**Focus**: Micro-area A1 - UI Login Form

---

## FLOW 1: Login Successo (Happy Path)

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOGIN SUCCESS FLOW                           │
└─────────────────────────────────────────────────────────────────┘

[User] → [Login Page] → [Compila Form] → [Validazione OK] → [Submit]
   ↓
[Loading State] → [API Call] → [Success Response] → [Toast Success]
   ↓
[Redirect Dashboard] → [Session Created] → [User Logged In]

DETTAGLI INTERAZIONI:
1. User naviga a /login
2. User compila email e password
3. Validazione real-time (Zod schema)
4. User clicca "Accedi"
5. Form entra in loading state (spinner, disabled)
6. API call POST /auth/login con CSRF token
7. Success response con session data
8. Toast notification "Login effettuato con successo!"
9. Redirect automatico a /dashboard
10. Session cookie impostato (httpOnly/secure/sameSite=strict)

TEMPO STIMATO: ≤ 2 secondi end-to-end
SUCCESS RATE TARGET: ≥98% per credenziali valide
```

---

## FLOW 2: Login con Errori di Validazione

```
┌─────────────────────────────────────────────────────────────────┐
│                 LOGIN VALIDATION ERROR FLOW                     │
└─────────────────────────────────────────────────────────────────┘

[User] → [Login Page] → [Compila Form] → [Validazione FAIL] → [Error Display]
   ↓
[Field Error] → [Focus Management] → [User Correzione] → [Error Clear]
   ↓
[Re-validation] → [Validazione OK] → [Submit Ready]

DETTAGLI INTERAZIONI:
1. User compila email non valida (es. "test@")
2. On blur: validazione Zod schema
3. Error message "Formato email non valido" sotto il campo
4. Campo email ha bordo rosso
5. Pulsante "Accedi" rimane disabilitato
6. User corregge email
7. On change: error message scompare
8. Campo torna normale (bordo grigio)
9. Pulsante "Accedi" si abilita

ERROR RECOVERY: ≤ 3 click per risolvere errore
VALIDATION SPEED: Real-time on blur (300ms debounce)
```

---

## FLOW 3: Login con Credenziali Non Valide

```
┌─────────────────────────────────────────────────────────────────┐
│                LOGIN INVALID CREDENTIALS FLOW                   │
└─────────────────────────────────────────────────────────────────┘

[User] → [Login Page] → [Compila Form] → [Validazione OK] → [Submit]
   ↓
[Loading State] → [API Call] → [Error Response] → [Error Banner]
   ↓
[Form Re-enabled] → [User Retry] → [Same Flow]

DETTAGLI INTERAZIONI:
1. User compila credenziali sbagliate
2. User clicca "Accedi"
3. Loading state (spinner, form disabled)
4. API call POST /auth/login
5. Error response (AUTH_FAILED)
6. Error banner "Credenziali non valide" sopra il form
7. Form torna abilitato
8. User può riprovare immediatamente
9. Form rimane compilato (no enumeration)

ERROR MESSAGE: Generico per evitare enumeration
RETRY POLICY: Immediato, nessun lockout
```

---

## FLOW 4: Rate Limiting Scenario

```
┌─────────────────────────────────────────────────────────────────┐
│                    RATE LIMITING FLOW                           │
└─────────────────────────────────────────────────────────────────┘

[User] → [5 Tentativi Falliti] → [Rate Limit Triggered] → [Lockout]
   ↓
[Rate Limit Banner] → [Countdown Timer] → [Form Disabled]
   ↓
[Timer Expires] → [Banner Dismiss] → [Form Re-enabled] → [Retry]

DETTAGLI INTERAZIONI:
1. User fa 5 tentativi di login falliti
2. Sistema attiva rate limiting (5 tentativi in 5 minuti)
3. Banner arancione "Troppi tentativi di accesso"
4. Countdown timer "Riprova tra X secondi"
5. Pulsante "Accedi" disabilitato
6. Form rimane compilato
7. Timer countdown real-time
8. Quando scade: banner scompare automaticamente
9. Pulsante "Accedi" si riabilita
10. User può riprovare

RATE LIMIT: 5 tentativi per account in 5 minuti
LOCKOUT DURATION: 10 minuti
COUNTDOWN: Real-time, aggiornamento ogni secondo
```

---

## FLOW 5: Password Recovery Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    PASSWORD RECOVERY FLOW                       │
└─────────────────────────────────────────────────────────────────┘

[User] → [Login Page] → [Click "Password dimenticata?"] → [Recovery Page]
   ↓
[Compila Email] → [Submit] → [Email Sent] → [Success State]
   ↓
[User Check Email] → [Click Link] → [Recovery Confirm Page]
   ↓
[Compila New Password] → [Submit] → [Password Changed] → [Redirect Login]

DETTAGLI INTERAZIONI:
1. User clicca "Password dimenticata?" su login page
2. Navigazione a /recovery
3. User compila email
4. User clicca "Invia email"
5. Loading state durante submit
6. Success state "Email inviata! Controlla la tua casella"
7. User riceve email con link token
8. User clicca link nell'email
9. Navigazione a /recovery/confirm?token=...
10. Pre-verifica token valido
11. User compila nuova password (2 campi)
12. User clicca "Conferma password"
13. Password cambiata con successo
14. Redirect automatico a /login

RECOVERY SUCCESS RATE: ≥95% senza intervento support
TOKEN TTL: 15 minuti
TOKEN TYPE: One-time use
```

---

## FLOW 6: Invite Acceptance Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    INVITE ACCEPTANCE FLOW                       │
└─────────────────────────────────────────────────────────────────┘

[User] → [Email Invite] → [Click Link] → [Invite Verify Page]
   ↓
[Token Pre-verification] → [Account Creation Form] → [Submit]
   ↓
[Account Created] → [Session Created] → [Redirect Dashboard]

DETTAGLI INTERAZIONI:
1. Admin crea invito per user
2. User riceve email con link invito
3. User clicca link nell'email
4. Navigazione a /invite/accept?token=...
5. Pre-verifica token valido e non scaduto
6. Form account creation (nome, cognome, password)
7. User compila tutti i campi
8. User clicca "Crea account"
9. Account creato con ruolo assegnato
10. Session creata automaticamente
11. Redirect a /dashboard

INVITE TTL: 15-60 minuti (configurabile)
ACCOUNT CREATION: Automatico con ruolo predefinito
SESSION: Creata automaticamente dopo account creation
```

---

## FLOW 7: Session Management Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    SESSION MANAGEMENT FLOW                      │
└─────────────────────────────────────────────────────────────────┘

[User Logged In] → [Session Active] → [Idle Timeout Warning] → [Action Required]
   ↓
[User Activity] → [Session Extended] → [Continue Working]
   ↓
[No Activity] → [Session Expired] → [Redirect Login] → [Session Expired State]

DETTAGLI INTERAZIONI:
1. User è loggato con sessione attiva
2. Sessione ha TTL 30 minuti + idle timeout 30 minuti
3. A 5 minuti dalla scadenza: warning "La tua sessione scadrà tra 5 minuti"
4. User può cliccare "Estendi sessione" o continuare a lavorare
5. Se user fa attività: sessione si estende automaticamente (rolling)
6. Se user non fa attività: sessione scade
7. Redirect automatico a /login con messaggio "Sessione scaduta"
8. User deve rifare login

SESSION TTL: 30 minuti
IDLE TIMEOUT: 30 minuti
ROLLING SESSION: +15 minuti per ogni attività
WARNING TIME: 5 minuti prima della scadenza
```

---

## FLOW 8: Logout Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        LOGOUT FLOW                              │
└─────────────────────────────────────────────────────────────────┘

[User] → [Dashboard] → [Click Logout] → [Confirmation Modal] → [Confirm]
   ↓
[Logout API Call] → [Session Invalidated] → [Cookie Cleared] → [Redirect Login]

DETTAGLI INTERAZIONI:
1. User è loggato nella dashboard
2. User clicca pulsante/logout nel menu
3. Confirmation modal "Sei sicuro di voler uscire?"
4. User clicca "Conferma" o "Annulla"
5. Se conferma: API call POST /auth/logout
6. Session invalidata lato server
7. Cookie di sessione cancellato
8. Redirect a /login
9. Toast notification "Logout effettuato"

CONFIRMATION: Modal per evitare logout accidentale
SESSION ROTATION: Nuova sessione generata per sicurezza
COOKIE CLEAR: Tutti i cookie auth cancellati
```

---

## FLOW 9: Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      ERROR HANDLING FLOW                        │
└─────────────────────────────────────────────────────────────────┘

[Any Action] → [Error Occurs] → [Error Classification] → [User Feedback]
   ↓
[Network Error] → [Retry Option] → [User Retry] → [Success/Fail]
   ↓
[Server Error] → [Generic Message] → [User Retry] → [Success/Fail]
   ↓
[Validation Error] → [Field Error] → [User Correction] → [Re-validation]

DETTAGLI INTERAZIONI:
1. Qualsiasi azione può generare errore
2. Error classification (network, server, validation)
3. Network error: "Errore di connessione. Riprova"
4. Server error: Messaggio generico (no information leakage)
5. Validation error: Errore specifico sotto il campo
6. User può riprovare immediatamente
7. Error persistence fino a nuovo tentativo
8. Error recovery path sempre chiaro

ERROR RECOVERY: ≤ 3 click per risolvere errore
ERROR MESSAGES: Generici per evitare information leakage
RETRY POLICY: Immediato per la maggior parte degli errori
```

---

## FLOW 10: Accessibility Flow (Screen Reader)

```
┌─────────────────────────────────────────────────────────────────┐
│                    ACCESSIBILITY FLOW                           │
└─────────────────────────────────────────────────────────────────┘

[Screen Reader User] → [Navigate with Tab] → [Element Announced] → [Action]
   ↓
[Form Field] → [Label Read] → [Value Read] → [Error Announced]
   ↓
[Button] → [Label Read] → [State Read] → [Action Available]
   ↓
[Error Message] → [Live Region] → [Error Announced] → [User Informed]

DETTAGLI INTERAZIONI:
1. User naviga con Tab/Shift+Tab
2. Ogni elemento è annunciato correttamente
3. Labels associati ai campi
4. Error messages annunciati via aria-live
5. Focus sempre visibile
6. Skip links per saltare contenuto
7. Heading hierarchy corretta
8. ARIA labels su elementi icon-only

SCREEN READER: NVDA, VoiceOver, JAWS support
KEYBOARD NAVIGATION: Tutti gli elementi raggiungibili
FOCUS MANAGEMENT: Focus visibile, logical tab order
LIVE REGIONS: aria-live="polite" per messaggi dinamici
```

---

## INTERACTION PATTERNS

### Form Validation Pattern
```
User Input → On Blur → Zod Validation → Error Display → User Correction → Error Clear
```

### Loading State Pattern
```
User Action → Loading State → API Call → Response → Success/Error State → User Feedback
```

### Error Recovery Pattern
```
Error Occurs → Error Display → User Retry → Success/Fail → Error Clear/Retry
```

### Success State Pattern
```
Success Response → Toast Notification → Redirect → User Confirmation → Next Action
```

---

## PERFORMANCE TARGETS

### Response Times
- **Login API**: ≤ 300ms backend, ≤ 2s end-to-end
- **Validation**: Real-time on blur (300ms debounce)
- **Page Load**: ≤ 1s per auth pages
- **Redirect**: ≤ 500ms per navigation

### Success Rates
- **Login Success**: ≥98% per credenziali valide
- **Recovery Success**: ≥95% senza intervento support
- **Error Recovery**: ≤ 3 click per risolvere errore
- **Accessibility**: 100% keyboard navigable

### User Experience
- **Task Completion**: ≥90% per flow critici
- **Error Recovery**: ≤ 3 click per risolvere errore
- **Form Completion**: ≤ 30 secondi per login valido
- **Mobile Usability**: Touch targets ≥44px

---

## TESTING SCENARIOS

### Happy Path Tests
1. Login con credenziali valide
2. Recovery password completo
3. Invite acceptance completo
4. Session management normale

### Error Path Tests
1. Login con credenziali non valide
2. Rate limiting scenarios
3. Network error handling
4. Validation error recovery

### Edge Case Tests
1. Session expired durante uso
2. Token scaduto per recovery
3. Invite scaduto
4. CSRF token invalid

### Accessibility Tests
1. Keyboard only navigation
2. Screen reader compatibility
3. High contrast mode
4. Zoom 200% functionality

---

**FIRMA**: Agente 3 - Experience & Interface Designer  
**Data**: 2025-10-20  
**Status**: ✅ COMPLETATO - Pronto per component specifications
