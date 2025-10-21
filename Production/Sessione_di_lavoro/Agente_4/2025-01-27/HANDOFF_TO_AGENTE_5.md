# HANDOFF: Backend → Frontend (Agente 5)

**Da**: Agente 4 - Back-End Agent  
**A**: Agente 5 - Front-End Agent  
**Data**: 2025-01-27  
**Feature**: Login Hardening con CSRF Protection e Rate Limiting  
**Status**: ✅ PRONTO PER IMPLEMENTAZIONE

---

## ✅ COMPLETATO DA BACKEND

### Database
- ✅ Migration `MIGRATIONS_SCHEMA_BASE.sql` completa e testata
- ✅ Tabelle: `users`, `sessions`, `rate_limit_buckets`, `audit_log`, `invites`, `roles`, `tenants`, `user_roles`
- ✅ RLS policies attive (multi-tenant isolation garantito)
- ✅ Indexes ottimizzati per performance

### API Endpoints
Tutti gli endpoint sono **IMPLEMENTATI** e **PRONTI**:

| Endpoint | Method | URL | Status | Funzionalità |
|----------|--------|-----|--------|--------------|
| CSRF Token | GET | `/auth/csrf-token` | ✅ | Genera CSRF token sicuro |
| Login | POST | `/auth/login` | ✅ | Login con rate limiting |
| Logout | POST | `/auth/logout` | ✅ | Logout sicuro |
| Recovery Request | POST | `/auth/recovery/request` | ✅ | Richiesta reset password |
| Recovery Confirm | POST | `/auth/recovery/confirm` | ✅ | Conferma reset password |
| Invite Accept | POST | `/auth/invite/accept` | ✅ | Accettazione invito |

### Security Features
- ✅ **Rate Limiting**: 5/5min email, 30/5min IP per login
- ✅ **CSRF Protection**: Token 4h durata, refresh 2h
- ✅ **Session Management**: 8h durata, max 5 sessioni per utente
- ✅ **Account Lockout**: 5 tentativi → 10min lockout
- ✅ **Audit Logging**: Tracciamento completo eventi
- ✅ **Password Policy**: 12+ caratteri, solo lettere

---

## 📦 DELIVERABLES PER FRONTEND

### 1. API Client TypeScript
Ho preparato un client TypeScript type-safe per te:

**File**: `edge-functions/shared/types.ts`

```typescript
// Request types
export interface LoginRequest {
    email: string;
    password: string;
    csrf_token: string;
}

export interface RecoveryRequestRequest {
    email: string;
    csrf_token: string;
}

// Response types
export interface LoginResponse {
    success: true;
    user: {
        id: string;
        email: string;
        first_name: string | null;
        last_name: string | null;
        role: string;
        tenant_id: string;
    };
    session: {
        token: string;
        csrf_token: string;
        expires_at: string;
    };
}

export interface CsrfTokenResponse {
    csrf_token: string;
    expires_at: string;
}
```

**Uso suggerito nel frontend**:
```typescript
// src/api/auth-api.ts
import { supabase } from '@/lib/supabase';
import type { LoginRequest, LoginResponse, CsrfTokenResponse } from './types';

export async function getCsrfToken(): Promise<CsrfTokenResponse> {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-csrf-token`);
    if (!response.ok) throw new Error('Failed to get CSRF token');
    return response.json();
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error.message);
    }

    return response.json();
}
```

### 2. Error Handling
Tutti gli errori seguono questo formato:
```typescript
interface ApiError {
    success: false;
    error: {
        code: 'RATE_LIMITED' | 'CSRF_INVALID' | 'ACCOUNT_LOCKED' | 'INVALID_CREDENTIALS' | 'VALIDATION_ERROR';
        message: string;
        details?: any; // Se RATE_LIMITED, contiene retry_after
    }
}
```

**Toast suggeriti**:
```typescript
// Gestione errori nel frontend
if (error.error.code === 'RATE_LIMITED') {
    const retryAfter = error.error.details.retry_after;
    showRateLimitBanner(retryAfter);
} else if (error.error.code === 'ACCOUNT_LOCKED') {
    const lockedUntil = error.error.details.locked_until;
    showAccountLockedMessage(lockedUntil);
} else if (error.error.code === 'VALIDATION_ERROR') {
    // Mostra errori specifici per campo
    error.error.details.forEach(fieldError => {
        toast.error(`${fieldError.field}: ${fieldError.message}`);
    });
} else {
    // Errore generico
    toast.error(error.error.message);
}
```

### 3. CSRF Token Management
```typescript
// src/hooks/useCsrfToken.ts
export function useCsrfToken() {
    const [csrfToken, setCsrfToken] = useState<string | null>(null);
    const [expiresAt, setExpiresAt] = useState<Date | null>(null);

    const refreshToken = useCallback(async () => {
        try {
            const response = await getCsrfToken();
            setCsrfToken(response.csrf_token);
            setExpiresAt(new Date(response.expires_at));
        } catch (error) {
            console.error('Failed to refresh CSRF token:', error);
        }
    }, []);

    useEffect(() => {
        refreshToken();
        
        // Auto-refresh ogni 2 ore
        const interval = setInterval(refreshToken, 2 * 60 * 60 * 1000);
        return () => clearInterval(interval);
    }, [refreshToken]);

    return { csrfToken, refreshToken };
}
```

### 4. Rate Limiting UI Components
```typescript
// src/components/RateLimitBanner.tsx
interface RateLimitBannerProps {
    retryAfter: number;
    onReset: () => void;
}

export function RateLimitBanner({ retryAfter, onReset }: RateLimitBannerProps) {
    const [secondsLeft, setSecondsLeft] = useState(retryAfter);

    useEffect(() => {
        const timer = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev <= 1) {
                    onReset();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [onReset]);

    return (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2">
                <ShieldIcon className="w-5 h-5 text-orange-600" />
                <div>
                    <p className="text-orange-800 font-medium">Troppi tentativi di accesso</p>
                    <p className="text-orange-600 text-sm">
                        Riprova tra <span className="font-mono">{secondsLeft}</span> secondi
                    </p>
                </div>
            </div>
        </div>
    );
}
```

---

## 🎨 UI COMPONENTS DA IMPLEMENTARE

### LoginForm Component
```typescript
// Props necessarie
interface LoginFormProps {
    onSuccess: (user: User) => void;
    onError: (error: string) => void;
    className?: string;
    initialEmail?: string;
    disabled?: boolean;
}

// States da gestire
type LoginFormState = 
    | 'default' 
    | 'filling' 
    | 'validating' 
    | 'submitting' 
    | 'success' 
    | 'error' 
    | 'rate_limited';
```

### PasswordInput Component
```typescript
// Con toggle show/hide
interface PasswordInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
    showPolicy?: boolean; // Mostra policy password
}
```

### ErrorBanner Component
```typescript
// Per errori generici
interface ErrorBannerProps {
    message: string;
    type: 'error' | 'warning' | 'info';
    onDismiss?: () => void;
}
```

---

## 📋 TODO LIST PER AGENTE 5

### High Priority (P0)
- [ ] Implementare `LoginForm` component con validazione Zod
- [ ] Implementare `RecoveryRequestForm` component
- [ ] Implementare `RecoveryConfirmForm` component
- [ ] Implementare `InviteAcceptForm` component
- [ ] Integrare CSRF token management
- [ ] Implementare rate limiting UI feedback
- [ ] Gestire error handling con toast notifications

### Medium Priority (P1)
- [ ] Implementare `PasswordInput` con show/hide toggle
- [ ] Implementare `ErrorBanner` component
- [ ] Implementare `RateLimitBanner` con countdown
- [ ] Aggiungere loading states (skeleton, spinner)
- [ ] Implementare empty states (no data, no results)
- [ ] Aggiungere accessibility (ARIA labels, keyboard navigation)

### Low Priority (P2)
- [ ] Implementare remember me checkbox (v1.1)
- [ ] Aggiungere password strength indicator
- [ ] Implementare social login (opzionale)
- [ ] Aggiungere biometric authentication (opzionale)

---

## 🔗 RIFERIMENTI

### File da leggere:
1. `edge-functions/shared/types.ts` - TypeScript types
2. `edge-functions/shared/validation.ts` - Validation rules
3. `edge-functions/shared/errors.ts` - Error handling
4. `edge-functions/auth-login/index.ts` - Login endpoint example
5. `Production/Sessione_di_lavoro/Agente_3/2025-10-20/USER_STORIES_AUTH.md` - User stories
6. `Production/Sessione_di_lavoro/Agente_3/2025-10-20/COMPONENT_SPECS_AUTH.md` - Component specs

### Testing Backend:
```bash
# Endpoint base
BASE_URL="https://YOUR_PROJECT.supabase.co/functions/v1"

# Test CSRF token
curl "$BASE_URL/auth-csrf-token"

# Test login
curl -X POST "$BASE_URL/auth-login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "TestPassword123", "csrf_token": "TOKEN"}'

# Test recovery
curl -X POST "$BASE_URL/auth-recovery/request" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "csrf_token": "TOKEN"}'
```

---

## ✅ DEFINITION OF DONE (per Agente 5)

Prima di passare ad Agente 6 (Testing), verifica:
- [ ] Tutti i form auth implementati (Login, Recovery, Invite)
- [ ] Integrazione API completa (tutti gli endpoint chiamati)
- [ ] Form validation (client-side con Zod)
- [ ] Error handling (toast per errori API)
- [ ] Loading states (skeleton/spinner)
- [ ] Empty states (no data UI)
- [ ] Rate limiting feedback (banner con countdown)
- [ ] CSRF token management (auto-refresh)
- [ ] Responsive design (mobile + desktop)
- [ ] Accessibility (keyboard navigation, screen reader)
- [ ] TypeScript strict mode (no `any`)

---

## 🚨 IMPORTANTE

### Rate Limiting
- **Login**: 5 tentativi/5min per email, 30/5min per IP
- **Recovery**: 3 tentativi/15min per email, 10/15min per IP
- **Lockout**: 10min per login, 30min per recovery

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

**Buon lavoro, Agente 5! 🚀**

Il backend è completo e pronto per l'integrazione. Tutti gli endpoint sono documentati e testati.

Se hai domande sul backend, controlla i file di riferimento o i test di integrazione.

---

*File generato da Agente 4 - Back-End Agent*  
*Data: 2025-01-27*  
*Status: ✅ COMPLETATO - Pronto per handoff ad Agente 5*
