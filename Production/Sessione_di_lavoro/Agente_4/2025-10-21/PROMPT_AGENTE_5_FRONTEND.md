# PROMPT OPERATIVO - AGENTE 5 (FRONT-END AGENT)

**Data**: 2025-10-21
**Priorità**: P0
**Feature**: Login Hardening Frontend Implementation
**Da**: Agente 4 - Back-End Agent (COMPLETATO ✅)

## CONTESTO
Implementazione frontend per sistema di autenticazione BHM v.2 con hardening completo. Il backend è stato completato con successo da Agente 4 e ora serve l'implementazione dell'interfaccia utente.

## INPUT COMPLETI RICEVUTI
✅ **Agente 1**: MVP Brief completo con 8 micro-aree
✅ **Agente 2**: API Spec, DB Schema, Security Architecture  
✅ **Agente 3**: User Stories, Component Specs, Wireframe
✅ **Agente 4**: Backend completo con 5 Edge Functions + test suite
✅ **Utente**: Business Requirements, Security Constraints, Examples

## STACK TARGET
- **Frontend**: React 18+ + TypeScript + Vite
- **UI**: Tailwind CSS + Radix UI
- **State**: React Query + Context API
- **Validation**: Zod schema validation
- **Backend**: Supabase Edge Functions (già implementato)
- **Multi-tenant**: Company-based isolation

## TASK PRINCIPALI
1. **Implementare 4 componenti auth** con validazione Zod e CSRF
2. **Integrare API client** con error handling standardizzato
3. **Implementare CSRF token** management automatico
4. **Implementare rate limiting** UI feedback con countdown
5. **Gestire session** management sicuro
6. **Implementare form** validation real-time
7. **Aggiungere accessibility** WCAG 2.1 AA compliance
8. **Implementare responsive** design mobile-first

## DEFINITION OF DONE
- [ ] Tutti i 4 componenti auth implementati e testati
- [ ] API client integrato con tutti gli endpoint backend
- [ ] CSRF token management automatico funzionante
- [ ] Rate limiting UI feedback con countdown timer
- [ ] Form validation Zod real-time
- [ ] Error handling con toast notifications
- [ ] Loading states (skeleton, spinner) implementati
- [ ] Accessibility WCAG 2.1 AA compliance
- [ ] Responsive design 320px-1920px
- [ ] TypeScript strict mode (no `any`)
- [ ] Test suite frontend ≥80% coverage
- [ ] Performance target rispettato (LCP < 2.5s)

## OUTPUT ATTESO
- **File**: `Production/Sessione_di_lavoro/Agente_5/2025-10-21/login-hardening_step5_agent5_v1.md`
- **Allegati**: 
  - Componenti React implementati
  - API client TypeScript
  - Test suite frontend
  - Handoff per Agente 6 (Testing)

## QUALITY GATES
- **Frontend**: Tutti i componenti funzionanti
- **Integration**: API client integrato con backend
- **UX**: Rate limiting feedback e error handling
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: LCP < 2.5s, FID < 100ms
- **Testing**: Coverage ≥80% su componenti auth

## RISCHI IDENTIFICATI
- **CSRF Integration**: Verificare compatibilità browser
- **Rate Limiting UI**: Testare countdown timer accuracy
- **Form Validation**: Verificare UX con errori real-time
- **Accessibility**: Testare con screen reader
- **Mobile**: Verificare touch targets e responsive

## PROSSIMI PASSI
1. Implementare API client TypeScript
2. Implementare CSRF token management
3. Implementare componenti auth (Login, Recovery, Invite)
4. Implementare rate limiting UI feedback
5. Implementare form validation Zod
6. Aggiungere accessibility e responsive
7. Creare test suite frontend
8. Handoff ad Agente 6 (Testing)

---

## 📦 DELIVERABLES DA AGENTE 4

### Backend API Endpoints (PRONTI ✅)
- `GET /auth/csrf-token` - Genera CSRF token
- `POST /auth/login` - Login con rate limiting
- `POST /auth/logout` - Logout sicuro
- `POST /auth/recovery/request` - Richiesta reset password
- `POST /auth/recovery/confirm` - Conferma reset password
- `POST /auth/invite/accept` - Accettazione invito

### TypeScript Types (PRONTI ✅)
```typescript
// File: edge-functions/shared/types.ts
interface LoginRequest {
    email: string;
    password: string;
    csrf_token: string;
}

interface LoginResponse {
    success: true;
    user: User;
    session: Session;
}

interface ApiError {
    success: false;
    error: {
        code: 'RATE_LIMITED' | 'CSRF_INVALID' | 'ACCOUNT_LOCKED';
        message: string;
        details?: any;
    }
}
```

### Security Features (IMPLEMENTATE ✅)
- **Rate Limiting**: 5/5min email, 30/5min IP per login
- **CSRF Protection**: Token 4h durata, refresh 2h
- **Session Management**: 8h durata, max 5 sessioni
- **Account Lockout**: 5 tentativi → 10min lockout
- **Password Policy**: 12+ caratteri, solo lettere

---

## 🎨 COMPONENTI DA IMPLEMENTARE

### 1. LoginForm Component
```typescript
interface LoginFormProps {
    onSuccess: (user: User) => void;
    onError: (error: string) => void;
    className?: string;
    initialEmail?: string;
    disabled?: boolean;
}

// States: default, filling, validating, submitting, success, error, rate_limited
```

### 2. RecoveryRequestForm Component
```typescript
interface RecoveryRequestFormProps {
    onSuccess: () => void;
    onError: (error: string) => void;
    className?: string;
    initialEmail?: string;
}

// States: default, submitting, success, error
```

### 3. RecoveryConfirmForm Component
```typescript
interface RecoveryConfirmFormProps {
    token: string;
    onSuccess: () => void;
    onError: (error: string) => void;
    className?: string;
}

// States: verifying, default, submitting, success, error
```

### 4. InviteAcceptForm Component
```typescript
interface InviteAcceptFormProps {
    token: string;
    onSuccess: (user: User) => void;
    onError: (error: string) => void;
    className?: string;
}

// States: verifying, default, submitting, success, error
```

### 5. RateLimitBanner Component
```typescript
interface RateLimitBannerProps {
    secondsUntilReset: number;
    onReset: () => void;
    className?: string;
}

// Countdown timer real-time
```

### 6. ErrorBanner Component
```typescript
interface ErrorBannerProps {
    message: string;
    type: 'error' | 'warning' | 'info';
    onDismiss?: () => void;
    className?: string;
}
```

---

## 🔗 RIFERIMENTI ESSENZIALI

### File da leggere:
1. `Production/Sessione_di_lavoro/Agente_4/2025-10-21/HANDOFF_TO_AGENTE_5.md` - Handoff completo
2. `Production/Sessione_di_lavoro/Agente_3/2025-10-20/USER_STORIES_AUTH.md` - User stories
3. `Production/Sessione_di_lavoro/Agente_3/2025-10-20/COMPONENT_SPECS_AUTH.md` - Component specs
4. `Production/Sessione_di_lavoro/Agente_4/2025-10-21/edge-functions/shared/types.ts` - TypeScript types
5. `Production/Sessione_di_lavoro/Agente_4/2025-10-21/edge-functions/auth-login/index.ts` - Login endpoint example

### API Base URL:
```typescript
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const API_BASE = `${SUPABASE_URL}/functions/v1`;
```

### Test Backend:
```bash
# Test CSRF token
curl "$API_BASE/auth-csrf-token"

# Test login
curl -X POST "$API_BASE/auth-login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "TestPassword123", "csrf_token": "TOKEN"}'
```

---

## 🚨 IMPORTANTE

### Rate Limiting UI
- **Login**: 5 tentativi/5min per email, 30/5min per IP
- **Recovery**: 3 tentativi/15min per email, 10/15min per IP
- **UI Feedback**: Banner arancione con countdown timer
- **Form Disabled**: Durante rate limiting

### CSRF Protection
- **Durata**: 4 ore
- **Refresh**: Automatico ogni 2 ore
- **Header**: `X-CSRF-Token`
- **Cookie**: `csrf_token` (HttpOnly)

### Password Policy
- **Minimo**: 12 caratteri
- **Massimo**: 128 caratteri
- **Formato**: Solo lettere [A-Za-z]
- **Validazione**: Client + server side

### Session Management
- **Durata**: 8 ore
- **Refresh**: Automatico ogni 4 ore
- **Max Sessions**: 5 per utente
- **Cookie**: `session_token` (HttpOnly, Secure, SameSite=Strict)

---

**AGENTE 5 PUÒ INIZIARE L'IMPLEMENTAZIONE FRONTEND!**

*Tutti i prerequisiti sono soddisfatti. Il backend è completo e pronto per l'integrazione.*

---

**🎯 Obiettivo**: Implementare interfaccia utente completa per sistema di autenticazione con hardening, integrando perfettamente con il backend già implementato.

**📋 Priorità**: P0 - Implementazione frontend auth completa

**⏰ Timeline**: 2-3 giorni per implementazione completa

**🔗 Dipendenze**: Backend completato da Agente 4 ✅

---

*Prompt generato da Agente 4 - Back-End Agent*  
*Data: 2025-10-21*  
*Status: ✅ BACKEND COMPLETATO - Pronto per handoff ad Agente 5*
