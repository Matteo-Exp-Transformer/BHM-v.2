# DECISIONI FINALI - LOGIN FLOW
**Data**: 2025-10-22
**Agente**: Agente 9 - Knowledge Brain Mapper
**Owner**: Matteo Cavallaro
**Status**: ✅ APPROVATO

---

## 📋 DECISIONI CONFERMATE

### **ARCHITETTURA & UI**

| # | Domanda | Decisione | Implementazione |
|---|---------|-----------|-----------------|
| 6 | LoginPage vs LoginForm? | **LoginPage usa LoginForm** | Modificare LoginPage.tsx per importare e usare <LoginForm /> |
| 7 | Link "Registrati ora"? | **Rimuovere completamente** | Eliminare linee 188-193 da LoginPage.tsx |
| 8 | Bottone "Torna home"? | **Rimuovere completamente** | Eliminare linee 200-220 da LoginPage.tsx |
| 9 | Redirect dopo login? | **Sempre /dashboard** | Mantieni navigate('/dashboard') - già OK |
| 10 | Password toggle aria-label? | **Migliorare accessibilità** | Aggiungere aria-label dinamico + aria-pressed |
| 11 | Messaggi errore? | **Mantieni attuali** | Nessuna modifica necessaria |

---

### **CSRF PROTECTION**

| # | Domanda | Decisione | Implementazione |
|---|---------|-----------|-----------------|
| 1 | Quando ottenere CSRF token? | **Al page load** | Modificare useCsrfToken hook: fetch token su useEffect mount |
| 2 | Se CSRF fallisce? | **Retry 3 volte (già implementato)** | Nessuna modifica - già OK in useCsrfToken.ts |

---

### **RATE LIMITING**

| # | Domanda | Decisione | Implementazione |
|---|---------|-----------|-----------------|
| 3 | Quanti tentativi? | **5 tentativi** | Già configurato in backend - OK |
| 4 | Durata blocco? | **Escalation progressiva** | Backend: Blocco 1=5min, 2=15min, 3=1h, 4=24h |
| 5 | Mostrare countdown? | **Countdown visibile (già implementato)** | Nessuna modifica - già OK in LoginForm.tsx line 178 |

---

### **PASSWORD POLICY**

| # | Domanda | Decisione | Implementazione |
|---|---------|-----------|-----------------|
| 12 | Password policy? | **12 caratteri, lettere + numeri** | Aggiornare regex in authSchemas.ts:<br>`/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{12,}$/` |

---

### **REMEMBER ME**

| # | Domanda | Decisione | Implementazione |
|---|---------|-----------|-----------------|
| 13 | Remember Me? | **Implementare - Token 30 giorni** | Backend: Se rememberMe=true → session expires_at = +30 giorni<br>Frontend: Abilitare checkbox in LoginForm.tsx |

---

### **PERMESSI & RUOLI**

| # | Domanda | Decisione | Implementazione |
|---|---------|-----------|-----------------|
| 14 | Permessi ruoli? | **Attuali OK** | Nessuna modifica - già OK in useAuth.ts |

---

### **MULTI-COMPANY**

| # | Domanda | Decisione | Implementazione |
|---|---------|-----------|-----------------|
| 15 | Quale azienda attivare? | **Ultima usata + preferenza utente** | 1. Default: ultima usata<br>2. Settings: campo "Azienda preferita"<br>3. Login logic: preferita > ultima usata |
| 16 | Switch company cosa fare? | **Solo refresh dati (già implementato)** | Nessuna modifica - già OK in useAuth.ts |

---

### **ACTIVITY TRACKING**

| # | Domanda | Decisione | Implementazione |
|---|---------|-----------|-----------------|
| 17 | Last activity ogni quanto? | **3 minuti (testing/debug)** | Modificare useAuth.ts: interval da 5min → 3min |

---

### **BACKEND SECURITY**

| # | Domanda | Decisione | Implementazione |
|---|---------|-----------|-----------------|
| 18 | Password hash algoritmo? | **Passare a bcrypt** | Backend: Sostituire SHA-256 con bcrypt (cost=10)<br>Migrazione: re-hash password al primo login |
| 19 | Sessione durata? | **24 ore fisse** | Backend: expires_at = current_time + 24 ore |
| 20 | Audit log cosa loggare? | **Eventi critici** | Backend: Log LOGIN_SUCCESS/FAILED, PASSWORD_CHANGE/RESET,<br>INVITE_SENT/ACCEPTED, COMPANY_SWITCH, PERMISSION_DENIED, DATA_EXPORT |
| 21 | Recovery token scadenza? | **12 ore single-use** | Backend: recovery_token expires_at = +12 ore<br>Invalidare dopo primo uso |
| 22 | Email enumeration protezione? | **Sempre success (già implementato)** | Nessuna modifica - già OK in auth-recovery-request |
| 23 | Invite token scadenza? | **30 giorni single-use** | Backend: invite_token expires_at = +30 giorni<br>Invalidare dopo accettazione |

---

## 🎯 MODIFICHE DA IMPLEMENTARE

### **PRIORITY 1 - CRITICHE (Sicurezza)**

1. ✅ **Password Policy - authSchemas.ts**
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

2. ✅ **Bcrypt Password Hash - Backend**
   ```typescript
   // File: Production/Sessione_di_lavoro/Agente_4/2025-10-21/edge-functions/shared/business-logic.ts
   // Funzione: hashPassword(), verifyPassword()

   import bcrypt from 'bcrypt'
   const SALT_ROUNDS = 10

   export async function hashPassword(password: string): Promise<string> {
     return await bcrypt.hash(password, SALT_ROUNDS)
   }

   export async function verifyPassword(password: string, hash: string): Promise<boolean> {
     return await bcrypt.compare(password, hash)
   }
   ```

3. ✅ **Rate Limiting Escalation - Backend**
   ```typescript
   // File: edge-functions/shared/business-logic.ts
   // Aggiungere escalation logic

   function calculateLockoutDuration(failureCount: number): number {
     if (failureCount === 5) return 5 * 60  // 5 min
     if (failureCount === 10) return 15 * 60 // 15 min
     if (failureCount === 15) return 60 * 60 // 1 hour
     if (failureCount >= 20) return 24 * 60 * 60 // 24 hours
     return 0
   }
   ```

---

### **PRIORITY 2 - FUNZIONALITÀ**

4. ✅ **LoginPage usa LoginForm**
   ```tsx
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

5. ✅ **Rimuovere Link "Registrati ora"**
   ```tsx
   // File: src/features/auth/LoginPage.tsx
   // Eliminare linee 174-195 (intero blocco divider + sign up link)
   ```

6. ✅ **Rimuovere Bottone "Torna alla home"**
   ```tsx
   // File: src/features/auth/LoginPage.tsx
   // Eliminare linee 199-220 (intero blocco back button)
   ```

7. ✅ **Migliorare Accessibility Password Toggle**
   ```tsx
   // File: src/features/auth/LoginPage.tsx (se mantieni) o LoginForm.tsx
   // Linee: 124-139 (LoginPage) o 282-298 (LoginForm)

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

8. ✅ **Implementare Remember Me**
   ```tsx
   // File: src/features/auth/components/LoginForm.tsx
   // Linea: 320 - Rimuovere disabled={true}

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

   ```typescript
   // Backend: edge-functions/auth-login/index.ts
   // Modificare session creation

   const expiresAt = rememberMe
     ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 giorni
     : new Date(Date.now() + 24 * 60 * 60 * 1000)      // 24 ore
   ```

---

### **PRIORITY 3 - OTTIMIZZAZIONI**

9. ✅ **CSRF Token al Page Load**
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

     // ...
   }
   ```

10. ✅ **Last Activity Update - 3 minuti**
    ```typescript
    // File: src/hooks/useAuth.ts
    // Linea: 463 - Modificare interval

    const interval = setInterval(updateActivity, 3 * 60 * 1000) // 3 minuti invece di 5
    ```

11. ✅ **Multi-Company: Preferenza Utente**
    ```typescript
    // File: src/hooks/useAuth.ts
    // Modificare logic sessione (linee 249-312)

    const {
      data: session,
      isLoading: sessionLoading,
      refetch: refetchSession,
    } = useQuery({
      queryKey: ['user-session', user?.id],
      queryFn: async (): Promise<UserSession | null> => {
        if (!user?.id) return null

        // 1. Prova a ottenere sessione esistente
        let { data: existing, error } = await supabase
          .from('user_sessions')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (existing) {
          return existing as UserSession
        }

        // 2. Se non esiste, crea con logica preferenza
        if (companies.length > 0) {
          // Check se user ha preferenza impostata
          const { data: userPrefs } = await supabase
            .from('user_preferences')
            .select('preferred_company_id')
            .eq('user_id', user.id)
            .single()

          const activeCompanyId = userPrefs?.preferred_company_id || companies[0].company_id

          const { data: newSession, error: createError } = await supabase
            .from('user_sessions')
            .insert({
              user_id: user.id,
              active_company_id: activeCompanyId,
            })
            .select()
            .single()

          if (createError) throw createError
          return newSession as UserSession
        }

        return null
      },
      enabled: !!user?.id && companies.length > 0,
      staleTime: 5 * 60 * 1000,
    })
    ```

12. ✅ **Sessione 24 ore**
    ```typescript
    // Backend: edge-functions/auth-login/index.ts
    // Modificare session creation

    const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 ore

    const expiresAt = rememberMe
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 giorni se remember me
      : new Date(Date.now() + SESSION_DURATION)           // 24 ore normale
    ```

13. ✅ **Recovery Token 12 ore**
    ```typescript
    // Backend: edge-functions/auth-recovery-request/index.ts

    const RECOVERY_TOKEN_DURATION = 12 * 60 * 60 * 1000 // 12 ore

    const expiresAt = new Date(Date.now() + RECOVERY_TOKEN_DURATION)
    ```

14. ✅ **Audit Log Eventi Critici**
    ```typescript
    // Backend: edge-functions/shared/business-logic.ts
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

---

## 🗂️ SCHEMA DATABASE - AGGIUNTE NECESSARIE

### **Tabella: user_preferences** (NUOVA)
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

## 📊 CONFIGURAZIONE FINALE

### **Frontend (authSchemas.ts)**
```typescript
Password Policy: 12 caratteri, lettere + numeri
CSRF: Al page load, retry 3x se fallisce
Rate Limiting: 5 tentativi, escalation (5min → 15min → 1h → 24h), countdown visibile
Remember Me: Abilitato (30 giorni)
Last Activity: Ogni 3 minuti
```

### **Backend (Edge Functions)**
```typescript
Password Hash: bcrypt (cost=10)
Session Duration: 24 ore (normale), 30 giorni (remember me)
Recovery Token: 12 ore single-use
Invite Token: 30 giorni single-use
Audit Log: Eventi critici
Email Enumeration: Sempre success
```

### **Database**
```typescript
Escalation Rate Limiting: Progressive (5min → 15min → 1h → 24h)
User Preferences: preferred_company_id
```

---

## ✅ CHECKLIST IMPLEMENTAZIONE

### **Frontend**
- [ ] Aggiornare authSchemas.ts (password policy)
- [ ] Modificare LoginPage.tsx (usa LoginForm, rimuovi link/bottone)
- [ ] Migliorare accessibility password toggle
- [ ] Abilitare Remember Me checkbox
- [ ] Aggiornare useCsrfToken (fetch al page load)
- [ ] Modificare useAuth.ts (last activity 3min, multi-company preferenza)

### **Backend**
- [ ] Implementare bcrypt per password hash
- [ ] Aggiungere escalation rate limiting
- [ ] Configurare sessione 24h / 30 giorni
- [ ] Recovery token 12h single-use
- [ ] Invite token 30 giorni single-use
- [ ] Audit log eventi critici

### **Database**
- [ ] Creare tabella user_preferences
- [ ] Aggiungere logica escalation rate limiting

### **Testing**
- [ ] Test password policy (12 caratteri lettere+numeri)
- [ ] Test CSRF al page load + retry
- [ ] Test rate limiting escalation
- [ ] Test remember me (30 giorni)
- [ ] Test multi-company preferenza
- [ ] Test recovery token 12h
- [ ] Test invite token 30 giorni

---

## 🎯 PROSSIMI STEP

1. ✅ **Creare FEATURE_SPEC.md** completo
2. ✅ **Creare Pattern Files** (PAT-LOGIN-001, PAT-RECOVERY-001, PAT-INVITE-001)
3. ✅ **Creare DoD_LOGIN.md** (Definition of Done)
4. ✅ **Creare TEST_STRATEGY.md**
5. ✅ **Creare ALIGNMENT_REPORT.md** (cosa sistemare nel codice)

**PRONTO PER GENERARE ARTEFATTI FINALI** ✅
