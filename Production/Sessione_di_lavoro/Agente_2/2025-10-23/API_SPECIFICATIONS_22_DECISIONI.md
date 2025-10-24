# 🔌 API SPECIFICATIONS - 22 DECISIONI APPROVATE

**Data**: 2025-10-23  
**Agente**: Agente 2B - Systems Blueprint Architect  
**Sessione**: Blindatura Completa Login e Onboarding

---

## 📋 DECISIONI DA IMPLEMENTARE

Basato su `Production/Sessione_di_lavoro/Agente_9/2025-10-22_1419_login_mapping/DECISIONI_FINALI.md`

---

## 🔐 **PRIORITY 1 - CRITICHE (Sicurezza)**

### **1. Password Policy - authSchemas.ts**

#### **API Endpoint**: Frontend Validation
```typescript
// File: src/features/auth/schemas/authSchemas.ts
// Linea: 25-29

export const passwordSchema = z
  .string()
  .min(12, 'Password deve essere di almeno 12 caratteri')
  .max(128, 'Password troppo lunga')
  .regex(
    /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{12,}$/,
    'Password deve contenere lettere e numeri (minimo 12 caratteri)'
  )
```

#### **Implementation Details**:
- **Validation**: Client-side con Zod
- **Error Messages**: Localizzati in italiano
- **Regex Pattern**: Lettere + numeri obbligatori, minimo 12 caratteri
- **Integration**: LoginForm, RegisterForm, ForgotPasswordForm

---

### **2. Bcrypt Password Hash - Backend**

#### **API Endpoint**: Supabase Auth (Native)
```typescript
// Supabase gestisce automaticamente bcrypt
// Configurazione in Supabase Dashboard → Authentication → Settings

// Per migrazione password esistenti:
// Edge Function: migrate-passwords-to-bcrypt
```

#### **Implementation Details**:
- **Algorithm**: bcrypt (cost=10)
- **Migration**: Re-hash al primo login per password esistenti
- **Storage**: Supabase auth.users.password_hash
- **Verification**: Automatica tramite Supabase Auth

---

### **3. Rate Limiting Escalation - Backend**

#### **API Endpoint**: Edge Function
```typescript
// File: supabase/functions/auth-login/index.ts
// Nuova Edge Function per gestire escalation

interface RateLimitConfig {
  attempts: number
  lockoutDuration: number
}

function calculateLockoutDuration(failureCount: number): number {
  if (failureCount === 5) return 5 * 60      // 5 min
  if (failureCount === 10) return 15 * 60   // 15 min
  if (failureCount === 15) return 60 * 60    // 1 hour
  if (failureCount >= 20) return 24 * 60 * 60 // 24 hours
  return 0
}
```

#### **Implementation Details**:
- **Storage**: security_settings table
- **Tracking**: user_activity_logs con activity_type='LOGIN_FAILED'
- **Escalation**: Progressiva (5min → 15min → 1h → 24h)
- **Reset**: Automatico dopo periodo di lockout

---

## 🎯 **PRIORITY 2 - FUNZIONALITÀ**

### **4. LoginPage usa LoginForm**

#### **API Endpoint**: Component Refactoring
```typescript
// File: src/features/auth/LoginPage.tsx
// Sostituire intero form (linee 82-196) con:

import { LoginForm } from './components/LoginForm'

// Nel render:
<div className="bg-white shadow-2xl rounded-2xl p-8">
  <LoginForm
    onSuccess={() => navigate('/dashboard')}
    onError={(error) => console.error('Login error:', error)}
  />
</div>
```

#### **Implementation Details**:
- **Component**: LoginForm già esistente
- **Props**: onSuccess, onError callbacks
- **Styling**: Mantenere design esistente
- **Testing**: Aggiornare test per nuovo componente

---

### **5. Rimuovere Link "Registrati ora"**

#### **API Endpoint**: UI Cleanup
```typescript
// File: src/features/auth/LoginPage.tsx
// Eliminare linee 174-195 (intero blocco divider + sign up link)
```

#### **Implementation Details**:
- **Removal**: Divider + "Registrati ora" link
- **Reason**: Registrazione solo tramite inviti
- **Alternative**: Inviti gestiti da admin
- **Testing**: Aggiornare test per UI semplificata

---

### **6. Rimuovere Bottone "Torna alla home"**

#### **API Endpoint**: UI Cleanup
```typescript
// File: src/features/auth/LoginPage.tsx
// Eliminare linee 199-220 (intero blocco back button)
```

#### **Implementation Details**:
- **Removal**: Bottone "Torna alla home"
- **Reason**: Login è entry point principale
- **Navigation**: Solo forward (login → dashboard)
- **Testing**: Aggiornare test per UI semplificata

---

### **7. Migliorare Accessibility Password Toggle**

#### **API Endpoint**: Accessibility Enhancement
```typescript
// File: src/features/auth/components/LoginForm.tsx
// Linee: 282-298

<button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
  aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
  aria-pressed={showPassword}
>
  {/* ... icone ... */}
</button>
```

#### **Implementation Details**:
- **ARIA**: aria-label dinamico + aria-pressed
- **Focus**: Focus ring per accessibilità
- **States**: Visibile/nascosto con feedback
- **Testing**: Test accessibilità con screen reader

---

### **8. Implementare Remember Me**

#### **API Endpoint**: Edge Function + Frontend
```typescript
// Frontend: src/features/auth/components/LoginForm.tsx
// Rimuovere disabled={true} dalla checkbox

<input
  id="login-remember"
  name="rememberMe"
  type="checkbox"
  checked={formData.rememberMe}
  onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
  // disabled={true} ← RIMUOVERE QUESTA LINEA
/>
<label htmlFor="login-remember" className="ml-2 text-sm text-gray-600">
  Ricordami per 30 giorni
</label>
```

#### **Backend**: Edge Function esistente
```typescript
// File: supabase/functions/remember-me/index.ts
// Già implementato - gestisce 30 giorni vs 24 ore

const expiresAt = rememberMe
  ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 giorni
  : new Date(Date.now() + 24 * 60 * 60 * 1000)      // 24 ore
```

#### **Implementation Details**:
- **Frontend**: Checkbox abilitata
- **Backend**: Edge Function remember-me
- **Duration**: 30 giorni (remember) vs 24 ore (standard)
- **Storage**: user_metadata in auth.users

---

## ⚙️ **PRIORITY 3 - OTTIMIZZAZIONI**

### **9. CSRF Token al Page Load**

#### **API Endpoint**: Hook Enhancement
```typescript
// File: src/hooks/useCsrfToken.ts
// Modificare per fetch immediato invece che lazy

export const useCsrfToken = () => {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['csrf-token'],
    queryFn: async () => {
      const response = await authClient.getCsrfToken()
      return response.data?.csrf_token
    },
    staleTime: 2 * 60 * 60 * 1000, // 2 ore
    refetchInterval: 2 * 60 * 60 * 1000 - 60 * 1000, // Refresh 1 min prima scadenza
    refetchOnMount: true, // ← Fetch subito al mount
    refetchOnWindowFocus: false,
  })
}
```

#### **Implementation Details**:
- **Timing**: Fetch immediato al mount del componente
- **Caching**: 2 ore di stale time
- **Refresh**: Automatico 1 minuto prima scadenza
- **Error Handling**: Retry 3 volte se fallisce

---

### **10. Last Activity Update - 3 minuti**

#### **API Endpoint**: Hook Enhancement
```typescript
// File: src/hooks/useAuth.ts
// Linea: 463 - Modificare interval

const interval = setInterval(updateActivity, 3 * 60 * 1000) // 3 minuti invece di 5
```

#### **Implementation Details**:
- **Interval**: 3 minuti (per debug/testing)
- **Storage**: user_sessions.last_activity
- **Purpose**: Tracking attività per sessioni
- **Performance**: Ottimizzato per testing

---

### **11. Multi-Company: Preferenza Utente**

#### **API Endpoint**: Database Schema + Logic
```sql
-- Nuova tabella: user_preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
```

#### **Frontend Logic**:
```typescript
// File: src/hooks/useAuth.ts
// Modificare logic sessione (linee 249-312)

const { data: userPrefs } = await supabase
  .from('user_preferences')
  .select('preferred_company_id')
  .eq('user_id', user.id)
  .single()

const activeCompanyId = userPrefs?.preferred_company_id || companies[0].company_id
```

#### **Implementation Details**:
- **Storage**: Nuova tabella user_preferences
- **Logic**: Preferita > ultima usata > prima disponibile
- **UI**: Settings per cambiare preferenza
- **Migration**: Creare tabella + migrare dati esistenti

---

### **12. Sessione 24 ore**

#### **API Endpoint**: Edge Function Enhancement
```typescript
// Backend: supabase/functions/remember-me/index.ts
// Modificare session creation

const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 ore

const expiresAt = rememberMe
  ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 giorni se remember me
  : new Date(Date.now() + SESSION_DURATION)           // 24 ore normale
```

#### **Implementation Details**:
- **Duration**: 24 ore standard, 30 giorni remember me
- **Storage**: auth.users.session_expires_at
- **Refresh**: Automatico tramite Supabase Auth
- **Logout**: Automatico alla scadenza

---

### **13. Recovery Token 12 ore**

#### **API Endpoint**: Supabase Auth (Native)
```typescript
// Supabase gestisce automaticamente recovery tokens
// Configurazione in Supabase Dashboard → Authentication → Settings

// Per customizzazione:
// Edge Function: auth-recovery-request
const RECOVERY_TOKEN_DURATION = 12 * 60 * 60 * 1000 // 12 ore
```

#### **Implementation Details**:
- **Duration**: 12 ore single-use
- **Storage**: Supabase auth recovery tokens
- **Security**: Single-use, invalidato dopo primo utilizzo
- **Email**: Invio automatico tramite Supabase

---

### **14. Audit Log Eventi Critici**

#### **API Endpoint**: Database Triggers + Application Logic
```typescript
// File: database/triggers/audit_triggers.sql
// Assicurati che questi eventi siano loggati:

const CRITICAL_EVENTS = [
  'LOGIN_SUCCESS',
  'LOGIN_FAILED',
  'PASSWORD_CHANGE',
  'PASSWORD_RESET',
  'INVITE_SENT',
  'INVITE_ACCEPTED',
  'COMPANY_SWITCH',
  'PERMISSION_DENIED',
  'DATA_EXPORT',
  'RATE_LIMITED',
  'ACCOUNT_LOCKED'
]
```

#### **Implementation Details**:
- **Storage**: audit_logs table
- **Triggers**: Automatici per eventi critici
- **Manual**: Logging manuale per eventi specifici
- **Compliance**: HACCP audit trail

---

## 📊 **API ENDPOINTS SUMMARY**

### **🔐 AUTHENTICATION APIs**
| Endpoint | Method | Purpose | Implementation |
|----------|--------|---------|----------------|
| `/auth/signin` | POST | Login utente | Supabase Auth |
| `/auth/signup` | POST | Registrazione | Supabase Auth |
| `/auth/recovery` | POST | Reset password | Supabase Auth |
| `/auth/callback` | GET | Callback OAuth | Supabase Auth |
| `/functions/remember-me` | POST | Gestione sessioni | Edge Function |

### **📧 INVITE APIs**
| Endpoint | Method | Purpose | Implementation |
|----------|--------|---------|----------------|
| `/functions/send-invite-email` | POST | Invio inviti | Edge Function |
| `/invite/validate` | GET | Validazione token | Frontend Service |
| `/invite/accept` | POST | Accettazione invito | Frontend Service |

### **🏢 MULTI-COMPANY APIs**
| Endpoint | Method | Purpose | Implementation |
|----------|--------|---------|----------------|
| `/companies` | GET | Lista aziende | Supabase REST |
| `/companies/{id}/switch` | POST | Switch azienda | Supabase REST |
| `/user-preferences` | GET/PUT | Preferenze utente | Supabase REST |

### **📊 TRACKING APIs**
| Endpoint | Method | Purpose | Implementation |
|----------|--------|---------|----------------|
| `/activity/log` | POST | Log attività | Supabase REST |
| `/sessions/update` | PUT | Aggiorna sessione | Supabase REST |
| `/audit/log` | POST | Log audit | Supabase REST |

---

## 🎯 **IMPLEMENTATION PRIORITY**

### **🔴 IMMEDIATE (Questa Settimana)**
1. Password Policy (authSchemas.ts)
2. CSRF Token Timing (useCsrfToken.ts)
3. Remember Me (Frontend + Backend)
4. LoginPage Refactoring (LoginForm)

### **🟡 HIGH (Prossima Settimana)**
1. Rate Limiting Escalation (Backend)
2. Multi-Company Preferenza (Database + Logic)
3. Activity Tracking (3 minuti)
4. UI Cleanup (Rimuovi link/bottone)

### **🟢 MEDIUM (Prossimo Sprint)**
1. Audit Log Scope (Estendi eventi)
2. Token Scadenze (Recovery 12h, Invite 30 giorni)
3. Accessibility Improvements
4. Performance Optimizations

---

## 📈 **PERFORMANCE TARGETS**

### **🔐 AUTHENTICATION**
- **Login Success Rate**: ≥95%
- **Login Time**: ≤3 secondi
- **Password Reset Success**: ≥90%
- **Invite Acceptance Rate**: ≥80%

### **🎯 ONBOARDING**
- **Onboarding Completion Rate**: ≥85%
- **Time to Complete**: ≤30 minuti
- **Step Drop-off Rate**: ≤15%
- **Data Quality Score**: ≥90%

### **🔄 CONVERSIONE**
- **Company → Active Users**: ≥70%
- **Onboarding → First Task**: ≥60%
- **30-day Retention**: ≥80%

---

**Status**: ✅ **API SPECIFICATIONS COMPLETATE**  
**Prossimo**: Performance Requirements dettagliati
