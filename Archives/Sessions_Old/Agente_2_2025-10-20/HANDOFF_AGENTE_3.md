# Handoff Document - Agente 3 (Frontend/UI/UX)

**Data**: 2025-10-20  
**Autore**: Agente 2 (Systems/API/DB)  
**Destinatario**: Agente 3 (Frontend/UI/UX)  
**Versione**: 1.0

---

## Executive Summary

Completata l'implementazione del sottosistema di autenticazione hardening con tutti gli artefatti tecnici richiesti. Il sistema è pronto per l'implementazione frontend con API contracts definiti, database schema implementato, e security measures configurate.

### Deliverables Completati
✅ **System Diagram** - Architettura completa del sottosistema auth  
✅ **API Specification v1.0** - Contratti API per tutti gli endpoint  
✅ **Database Schema v2** - Migrazioni DDL con RLS policies  
✅ **Test Plan Tecnico** - Strategia di testing completa  
✅ **Environment Variables** - Configurazione ambiente  
✅ **Security Implementation** - Rate limiting, CSRF, session management  

---

## Context & Scope

### Micro-Area: Login Hardening
**Scope**: Implementazione completa del sistema di autenticazione con security hardening, multi-tenant support, e audit logging.

### Business Requirements
- Autenticazione sicura con password policy (solo lettere, min 12 char)
- Sistema multi-tenant con ruoli (owner, admin, manager, operator)
- Inviti utente con token sicuri
- Password recovery con token temporanei
- Rate limiting multi-bucket (IP/Account/UA)
- CSRF protection con double-submit pattern
- Session management con rotazione
- Audit logging completo per sicurezza

### Technical Constraints
- **Database**: PostgreSQL con RLS (Row Level Security)
- **API**: RESTful con JSON schemas
- **Security**: HttpOnly cookies, secure flags, sameSite=strict
- **Performance**: <300ms p50, <600ms p95 per endpoint
- **Error Handling**: Messaggi generici, no information leakage

---

## Technical Deliverables

### 1. System Architecture
**File**: `System_Diagram_Auth.md`

**Key Components**:
- Frontend Layer (React components, validation, CSRF handling)
- API Gateway Layer (rate limiting, CSRF validation, auth middleware)
- Core Auth Services (login, logout, recovery, invite, session)
- Database Layer (users, roles, tenants, invites, audit, sessions, rate buckets)
- External Services (SMTP, Sentry logging)

**Security Flows**:
- Login Flow: User → Validation → Rate Limit → CSRF → Auth → Session → Cookie
- Logout Flow: User → CSRF Check → Invalidate Session → Clear Cookie
- Recovery Flow: User → Rate Limit → Generate Token → SMTP → Validate → Update
- Invite Flow: Admin → CSRF → Generate Token → SMTP → Accept → Create User

### 2. API Contracts
**File**: `API_Spec_v1.md`

**Endpoints Implementati**:
- `POST /auth/login` - Autenticazione utente
- `POST /auth/logout` - Logout e invalidazione sessione
- `POST /auth/recovery/request` - Richiesta reset password
- `POST /auth/recovery/confirm` - Conferma reset password
- `POST /invites/create` - Crea invito utente (admin)
- `POST /invites/accept` - Accetta invito e crea account
- `GET /invites/{token}` - Verifica validità token invito
- `GET /session` - Informazioni sessione corrente
- `POST /session/refresh` - Rinnova sessione

**Response Schemas**:
- Success responses con user data, session info, roles
- Error responses con codici standardizzati (AUTH_FAILED, RATE_LIMITED, etc.)
- Rate limiting headers (X-RateLimit-*)
- Security headers (Set-Cookie con flags sicuri)

### 3. Database Schema
**Files**: 
- `supabase/migrations/20250120000004_login_hardening_schema_v2.sql`
- `supabase/migrations/20250120000005_login_hardening_rls_v2.sql`

**Tabelle Principali**:
- `tenants` - Organizzazioni multi-tenant
- `roles` - Ruoli sistema con permissions
- `users` - Utenti con security fields
- `user_roles` - Associazione utenti-ruoli-tenant
- `invites` - Inviti utente con token
- `audit_log` - Log sicurezza e telemetria
- `sessions` - Sessioni attive con CSRF
- `rate_limit_buckets` - Bucket per rate limiting

**RLS Policies**:
- Default deny su tutte le tabelle
- Tenant-scoped access per multi-tenancy
- Role-based access per autorizzazioni
- Anonymous access per invite acceptance

### 4. Security Implementation
**Features Implementate**:
- **Password Policy**: Solo lettere, min 12 char, denylist
- **Rate Limiting**: Multi-bucket (IP/Account/UA) con backoff progressivo
- **CSRF Protection**: Double-submit token pattern
- **Session Security**: HttpOnly, secure, sameSite=strict, rotazione
- **Audit Logging**: Tracciamento completo eventi sicurezza
- **Token Security**: Cryptographically secure, short expiration, one-time use

### 5. Test Strategy
**File**: `Test_Plan_Technico.md`

**Test Pyramid**:
- **Unit Tests (60%)**: RLS policies, business logic, utilities
- **Integration Tests (30%)**: API contracts, database integration
- **E2E Tests (10%)**: Critical user flows, security scenarios

**Coverage Targets**:
- Unit Tests: 85%+ per moduli critici
- Integration Tests: 90%+ per API endpoints
- E2E Tests: 100% per scenari critici

---

## Implementation Guidelines

### Frontend Integration Points

#### 1. Authentication Flow
```typescript
// Login component integration
const loginUser = async (email: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies
    body: JSON.stringify({ email, password })
  });
  
  if (response.ok) {
    const data = await response.json();
    // Handle success: redirect to dashboard
    // Cookies are automatically set by browser
  } else {
    const error = await response.json();
    // Handle error: show generic message
    // Never expose specific error details
  }
};
```

#### 2. CSRF Protection
```typescript
// CSRF token handling
const getCSRFToken = () => {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('bhm_csrf_token='))
    ?.split('=')[1];
};

// Include CSRF token in requests
const makeAuthenticatedRequest = async (url: string, options: RequestInit) => {
  const csrfToken = getCSRFToken();
  
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'X-CSRF-Token': csrfToken
    },
    credentials: 'include'
  });
};
```

#### 3. Session Management
```typescript
// Session validation
const checkSession = async () => {
  try {
    const response = await fetch('/api/session', {
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.data.user;
    } else {
      // Session invalid, redirect to login
      window.location.href = '/login';
    }
  } catch (error) {
    // Network error, redirect to login
    window.location.href = '/login';
  }
};
```

#### 4. Rate Limiting Handling
```typescript
// Handle rate limiting responses
const handleRateLimit = (response: Response) => {
  const retryAfter = response.headers.get('X-RateLimit-Retry-After');
  const remaining = response.headers.get('X-RateLimit-Remaining');
  
  if (response.status === 429) {
    // Show rate limit message
    showRateLimitMessage(retryAfter);
    
    // Disable form for retry period
    if (retryAfter) {
      disableFormForSeconds(parseInt(retryAfter));
    }
  }
};
```

### UI/UX Requirements

#### 1. Login Form
**Required Fields**:
- Email input con validazione RFC 5322
- Password input con validazione client-side
- Remember me checkbox (opzionale)
- Submit button con loading state

**Validation Rules**:
- Email: formato RFC 5322
- Password: solo lettere, min 12 caratteri
- Real-time validation con feedback visivo

**Error Handling**:
- Messaggi generici per errori (no information leakage)
- Rate limiting feedback con countdown
- Loading states per UX fluida

#### 2. Password Recovery Form
**Required Fields**:
- Email input per richiesta recovery
- Token input per conferma recovery
- New password input con validazione
- Confirm password input

**Flow**:
1. User inserisce email → mostra messaggio success generico
2. User riceve email con token
3. User inserisce token + nuova password → conferma reset

#### 3. Invitation Flow
**Admin Interface**:
- Form per creare inviti (email, ruolo, tenant)
- Lista inviti pending con status
- Possibilità di revocare inviti

**User Interface**:
- Form per accettare invito (nome, cognome, password)
- Validazione token invito
- Redirect automatico dopo accettazione

#### 4. Session Management
**Features**:
- Session timeout warning
- Automatic session refresh
- Logout su tutte le sessioni
- Lista sessioni attive (admin)

### Error Handling Strategy

#### 1. Generic Error Messages
```typescript
const ERROR_MESSAGES = {
  'AUTH_FAILED': 'Credenziali non valide',
  'RATE_LIMITED': 'Troppi tentativi, riprova tra {seconds} secondi',
  'ACCOUNT_LOCKED': 'Account temporaneamente bloccato',
  'TOKEN_INVALID': 'Token non valido o scaduto',
  'USER_EXISTS': 'Utente già esistente',
  'FORBIDDEN': 'Accesso non autorizzato',
  'CSRF_TOKEN_MISSING': 'Token di sicurezza mancante',
  'INVALID_INPUT': 'Dati inseriti non validi'
};
```

#### 2. Rate Limiting UX
- Countdown timer per retry
- Disable form durante lockout
- Progress bar per remaining attempts
- Clear feedback su limiti raggiunti

#### 3. Loading States
- Button loading durante requests
- Form disable durante submission
- Skeleton loading per dati async
- Progress indicators per operazioni lunghe

---

## Testing Requirements

### Frontend Testing Strategy

#### 1. Component Tests
```typescript
// Login form component test
describe('LoginForm', () => {
  test('validates email format', () => {
    render(<LoginForm />);
    
    const emailInput = screen.getByTestId('email-input');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    expect(screen.getByText('Formato email non valido')).toBeInTheDocument();
  });
  
  test('validates password policy', () => {
    render(<LoginForm />);
    
    const passwordInput = screen.getByTestId('password-input');
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    
    expect(screen.getByText('Password deve essere di almeno 12 caratteri')).toBeInTheDocument();
  });
});
```

#### 2. Integration Tests
```typescript
// API integration test
describe('Auth API Integration', () => {
  test('handles successful login', async () => {
    const mockResponse = {
      success: true,
      data: {
        user: { id: 'user-1', email: 'user@example.com' },
        session: { id: 'session-1', expires_at: '2025-01-21T10:00:00Z' }
      }
    };
    
    fetchMock.mockResponseOnce(JSON.stringify(mockResponse));
    
    const result = await loginUser('user@example.com', 'ValidPassword');
    
    expect(result.success).toBe(true);
    expect(result.data.user.email).toBe('user@example.com');
  });
});
```

#### 3. E2E Tests
```typescript
// Login flow E2E test
describe('Login Flow E2E', () => {
  test('completes successful login', async () => {
    await page.goto('/login');
    
    await page.fill('[data-testid="email-input"]', 'user@example.com');
    await page.fill('[data-testid="password-input"]', 'ValidPassword');
    await page.click('[data-testid="login-button"]');
    
    await page.waitForURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });
});
```

### Test Data Requirements

#### 1. Test Users
```typescript
export const testUsers = {
  owner: {
    email: 'owner@test.com',
    password: 'OwnerPassword',
    role: 'owner'
  },
  admin: {
    email: 'admin@test.com',
    password: 'AdminPassword',
    role: 'admin'
  },
  user: {
    email: 'user@test.com',
    password: 'UserPassword',
    role: 'user'
  }
};
```

#### 2. Test Scenarios
- Valid login flow
- Invalid credentials handling
- Rate limiting scenarios
- CSRF protection validation
- Session management
- Password recovery flow
- Invitation acceptance flow

---

## Performance Requirements

### Frontend Performance
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### API Performance
- **Login endpoint**: < 300ms p50, < 600ms p95
- **Session validation**: < 100ms p50, < 200ms p95
- **Rate limiting overhead**: < 50ms per request

### Bundle Size
- **Initial bundle**: < 250KB gzipped
- **Auth module**: < 50KB gzipped
- **Code splitting**: Lazy load auth components

---

## Security Considerations

### Frontend Security
1. **Input Validation**: Client-side validation con server-side verification
2. **XSS Prevention**: Sanitizzazione output, CSP headers
3. **CSRF Protection**: Token validation su tutte le richieste mutanti
4. **Session Security**: HttpOnly cookies, secure flags
5. **Error Handling**: No information leakage nei messaggi

### Data Protection
1. **Sensitive Data**: Never log passwords o tokens
2. **Error Messages**: Generic messages, detailed logs server-side
3. **Client Storage**: No sensitive data in localStorage/sessionStorage
4. **Network Security**: HTTPS only, secure headers

---

## Dependencies & Integration

### Required Dependencies
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "typescript": "^5.6.3",
    "zod": "^3.22.0",
    "react-hook-form": "^7.48.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^6.1.0",
    "playwright": "^1.56.0",
    "vitest": "^2.1.8"
  }
}
```

### API Integration
- **Base URL**: `https://api.yourdomain.com`
- **Authentication**: Cookie-based con CSRF tokens
- **Error Handling**: Standardized error responses
- **Rate Limiting**: Header-based feedback

### State Management
- **User State**: Context API per user session
- **Form State**: React Hook Form per form management
- **Error State**: Global error boundary
- **Loading State**: Global loading context

---

## Handoff Checklist

### ✅ Completed by Agente 2
- [x] System architecture design
- [x] API contracts specification
- [x] Database schema implementation
- [x] RLS policies configuration
- [x] Security measures implementation
- [x] Test strategy definition
- [x] Environment configuration
- [x] Performance requirements
- [x] Error handling strategy

### 🔄 Ready for Agente 3
- [ ] Frontend component implementation
- [ ] API integration layer
- [ ] Form validation implementation
- [ ] Error handling UI
- [ ] Loading states implementation
- [ ] CSRF token management
- [ ] Session management UI
- [ ] Rate limiting feedback
- [ ] E2E test implementation
- [ ] Performance optimization

---

## Questions & Clarifications

### For Agente 3
1. **UI Framework**: Quale UI framework preferisci? (Tailwind CSS, Material-UI, Chakra UI)
2. **Form Library**: Preferisci React Hook Form o Formik per form management?
3. **State Management**: Context API sufficiente o preferisci Redux/Zustand?
4. **Testing Strategy**: Preferisci Vitest o Jest per unit tests?
5. **Bundle Optimization**: Quale strategy per code splitting?

### Technical Questions
1. **Error Boundaries**: Implementare error boundaries globali o per componente?
2. **Loading States**: Skeleton loading o spinner per loading states?
3. **Validation**: Real-time validation o on-submit validation?
4. **Accessibility**: Quale livello di a11y support richiesto?
5. **Internationalization**: Supporto multi-lingua necessario?

---

## Next Steps

### Immediate Actions
1. **Review API Contracts**: Verifica tutti gli endpoint e schemi
2. **Setup Development Environment**: Configura ambiente con variabili
3. **Create Component Structure**: Definisci struttura componenti
4. **Implement Core Components**: Login, Recovery, Invite forms
5. **Setup Testing Framework**: Configura unit e E2E tests

### Development Phases
1. **Phase 1**: Core auth components (Login, Logout, Session)
2. **Phase 2**: Recovery flow (Request, Confirm)
3. **Phase 3**: Invitation flow (Create, Accept)
4. **Phase 4**: Admin interface (User management, Invites)
5. **Phase 5**: Testing e optimization

### Success Criteria
- [ ] All API endpoints integrated successfully
- [ ] All forms validated and working
- [ ] Error handling implemented correctly
- [ ] CSRF protection working
- [ ] Rate limiting feedback implemented
- [ ] Session management working
- [ ] E2E tests passing
- [ ] Performance targets met
- [ ] Security requirements satisfied

---

## Contact & Support

### Agente 2 Availability
- **Email**: agente2@bhm-system.com
- **Slack**: #auth-hardening
- **Office Hours**: 9:00-17:00 CET

### Documentation References
- [API Specification v1.0](./API_Spec_v1.md)
- [System Diagram](./System_Diagram_Auth.md)
- [Test Plan](./Test_Plan_Technico.md)
- [Environment Variables](./Environment_Variables.md)

### Escalation Path
1. **Technical Issues**: Contact Agente 2 directly
2. **Architecture Questions**: Contact Agente 0 (Orchestrator)
3. **Business Requirements**: Contact Agente 1 (Business Analyst)
4. **Testing Issues**: Contact Agente 5 (QA/E2E)

---

**🎯 Ready for handoff! Il sistema di autenticazione hardening è completamente progettato e pronto per l'implementazione frontend.**
