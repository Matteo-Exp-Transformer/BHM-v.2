# HANDOFF: Agente 3 → Agenti 4 & 5

**Data handoff**: 2025-10-20 15:30  
**Progetto**: BHM v.2 - Login Hardening  
**Sessione**: Production/Sessione_di_lavoro/Agente_3/2025-10-20/  
**Micro-area**: A1 - UI Login Form (P0)

---

## ARTEFATTI CONSEGNATI

✅ **User Stories**: `USER_STORIES_AUTH.md` (8 stories formato INVEST)  
✅ **Information Architecture**: `INFORMATION_ARCHITECTURE_AUTH.md`  
✅ **Wireframe**: `WIREFRAME_AUTH.md` (12 schermate con annotazioni)  
✅ **Design Tokens**: `DESIGN_TOKENS_AUTH.md` (Design system completo)  
✅ **User Flows**: `USER_FLOWS_AUTH.md` (10 flow critici)  
✅ **Accessibility Checklist**: `ACCESSIBILITY_CHECKLIST_AUTH.md` (WCAG 2.1 AA)  
✅ **Component Specs**: `COMPONENT_SPECS_AUTH.md` (10 componenti)  
✅ **Quality Gate**: `QUALITY_GATE_AGENTE_3.md` (Gate passed)

---

## QUALITY GATE STATUS

✅ User stories ≥5 (formato INVEST) - **8 stories completate**  
✅ Wireframe ≥5 schermate - **12 schermate completate**  
✅ Design tokens 100% completi - **Design system completo**  
✅ Accessibility WCAG 2.1 AA compliant - **Checklist completa**  
✅ Component specs ≥3 - **10 componenti specificati**  
✅ Task success ≥90% per flow critici - **Target definiti**

---

## FOR AGENTE 4 (Backend)

### User Stories con Acceptance Criteria
Usa acceptance criteria come reference per implementare business logic.

**Esempio**:
- US-001: "WHEN inserisco email e password corrette THEN vengo reindirizzato alla dashboard"
  → Backend: Validazione credenziali, creazione sessione, response con session data

### Validation Rules
Da component specs:
- **Email**: RFC 5322 validation, max 254 chars
- **Password**: Solo lettere [A-Za-z], min 12 chars, max 128 chars
- **Error Codes**: Standardizzati (AUTH_FAILED, RATE_LIMITED, CSRF_REQUIRED, etc.)

**Implementa server-side validation** (non solo client!)

### API Requirements
Da user flows e component specs:
- **POST /auth/login**: Body { email, password, rememberMe? }, CSRF required
- **POST /auth/logout**: Invalida sessione, clear cookie
- **POST /auth/recovery/request**: Body { email }, rate limit applicato
- **POST /auth/recovery/confirm**: Body { token, password }, CSRF required
- **GET /session**: Info sessione corrente, require cookie

### Security Requirements
- **CSRF Protection**: Double-submit token pattern
- **Rate Limiting**: 5 tentativi per account in 5 minuti, lockout 10 minuti
- **Session Security**: Cookie httpOnly/secure/sameSite=strict, TTL 30m
- **Error Handling**: Messaggi generici, no information leakage

---

## FOR AGENTE 5 (Frontend)

### Wireframe → Components
Implementa esattamente come da wireframe (pixel-perfect).

**Priorità componenti**:
1. **LoginForm** - Form principale con validazione Zod
2. **ErrorBanner** - Banner per errori generici
3. **RateLimitBanner** - Countdown timer per rate limiting
4. **PasswordInput** - Input con toggle show/hide
5. **ToastNotification** - Success/error messages
6. **AuthLayout** - Layout wrapper per pagine auth

### Design Tokens → Tailwind
Usa tokens in `DESIGN_TOKENS_AUTH.md`:

```jsx
// Esempio Button Primary
<button className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-md shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
  Accedi
</button>

// Esempio Input Field
<input className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-200 placeholder-neutral-400" />
```

### Component Specs → Implementation
Segui props, states, variants da `COMPONENT_SPECS_AUTH.md`.

**Esempio LoginForm**:
```jsx
interface LoginFormProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  className?: string
  initialEmail?: string
  disabled?: boolean
}
```

### Accessibility Requirements
**OBBLIGATORIO**:
- Focus visibile su tutti interactive elements
- ARIA labels su icon buttons
- Form labels associate a input
- Contrast ratio ≥4.5:1
- Touch targets ≥44px per mobile

**Test con**:
- Keyboard only navigation
- axe DevTools (0 violations)
- Zoom 200%

---

## PROSSIMI PASSI

1. **Agente 4** (Backend): Implementa API endpoint + DB + validation
2. **Agente 5** (Frontend): Implementa UI components + integration API

**Possono lavorare in parallelo!**

---

## DOMANDE APERTE

- **Q1**: Layout preferito per form login (centrato, sidebar, full-width)?
  **RISOLTO**: Centrato, max width 400px su desktop
  
- **Q2**: Stile error messages (inline, toast, modal)?
  **RISOLTO**: Inline sotto campi + banner sopra form per errori generici
  
- **Q3**: Loading states (skeleton, spinner, progress bar)?
  **RISOLTO**: Spinner nel pulsante + skeleton per caricamento iniziale
  
- **Q4**: Password strength indicator (sì/no, dove posizionarlo)?
  **RISOLTO**: Policy info sotto campo password
  
- **Q5**: Remember me checkbox (posizione, styling)?
  **RISOLTO**: Disabilitata per v1, sotto password field

---

## IMPLEMENTATION PRIORITY

### Sprint 1 (MVP) - P0
1. **LoginForm** con validazione Zod e CSRF
2. **ErrorBanner** per errori generici
3. **RateLimitBanner** con countdown
4. **PasswordInput** con toggle show/hide
5. **ToastNotification** per success/error
6. **AuthLayout** per pagine auth

### Sprint 2 - P1
1. **RecoveryRequestForm** e **RecoveryConfirmForm**
2. **InviteAcceptForm** per account creation
3. **LoadingSpinner** component
4. **Remember me** checkbox (abilitata)

---

## TESTING REQUIREMENTS

### E2E Tests (Agente 6)
- Login valido/invalido
- Rate limiting scenarios
- CSRF protection test
- Recovery flow completo
- Invite acceptance flow
- Accessibility keyboard navigation

### Unit Tests
- Zod schema validation
- Component props e states
- Error handling
- Loading states

---

## PERFORMANCE TARGETS

- **Login API**: ≤ 300ms backend, ≤ 2s end-to-end
- **Validation**: Real-time on blur (300ms debounce)
- **Page Load**: ≤ 1s per auth pages
- **Success Rate**: ≥98% per credenziali valide

---

## SECURITY CHECKLIST

- [ ] CSRF token su tutte le mutate
- [ ] Rate limiting implementato
- [ ] Session cookie sicuri
- [ ] Error messages generici
- [ ] Password policy enforced
- [ ] Input validation client + server

---

**FIRMA**: Agente 3 - Experience & Interface Designer

**Prossimi agenti**:
- Agente 4 - Back-End Agent
- Agente 5 - Front-End Agent

**Status**: ✅ HANDOFF COMPLETATO - Pronti per implementazione parallela
