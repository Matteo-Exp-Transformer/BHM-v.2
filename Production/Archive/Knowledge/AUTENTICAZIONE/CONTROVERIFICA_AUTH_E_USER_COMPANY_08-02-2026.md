# 🔐 CONTROVERIFICA: Sistema Auth, Login e Associazione Utente-Azienda

**Data**: 2026-02-08  
**Obiettivo**: Verificare documentazione vs codice e mappare flusso primo accesso / associazione utente-azienda

---

## 1. COME FUNZIONA OGGI IL SISTEMA LOGIN E AUTH

### 1.1 Componenti principali

| Componente | File | Funzione |
|------------|------|----------|
| **useAuth** | `src/hooks/useAuth.ts` | Hook principale: Supabase auth, `company_members`, `user_sessions`, `user_profiles` |
| **LoginPage** | `src/features/auth/LoginPage.tsx` | Usa `LoginForm`; dopo successo → redirect a `/auth/callback?post_login=true` |
| **LoginForm** | `src/features/auth/components/LoginForm.tsx` | Form con CSRF, validazione, `signIn` via useAuth |
| **AuthCallbackPage** | `src/features/auth/AuthCallbackPage.tsx` | Pagina intermedia post-login che aspetta useAuth prima di redirect |
| **ProtectedRoute** | `src/components/ProtectedRoute.tsx` | Redirect: non autenticato → `/sign-in`; autenticato senza company → `/onboarding` |
| **OnboardingGuard** | `src/components/OnboardingGuard.tsx` | Se `companies.length === 0` → redirect a `/onboarding` |

### 1.2 Flusso login tecnico

1. Utente invia email/password → `supabase.auth.signInWithPassword()`
2. useAuth riceve `SIGNED_IN` → carica `company_members` per `user.id`
3. `isAuthenticated = !!user && !!currentMembership` → **l’utente deve avere almeno un record in `company_members`**
4. Se `companies.length === 0` → utente considerato “senza azienda” → redirect a onboarding

### 1.3 Tabelle coinvolte

- **auth.users** (Supabase): account login
- **company_members**: associazione `user_id` ↔ `company_id` con `role`
- **user_sessions**: `active_company_id` per multi-company
- **user_profiles**: profilo esteso (opzionale, non usato per autorizzazione)

---

## 2. ASSOCIAZIONE UTENTE–AZIENDA: CHI LA FA?

### ❌ Non è automatica alla registrazione “self-service”

- `RegisterPage` → `signUp()` → **solo** `supabase.auth.signUp()`
- Non viene mai scritto nulla in `company_members`
- Non esiste trigger Supabase che crea `company_members` o `user_profiles` su nuovo utente

### ✅ Associazione automatica in 2 casi

#### A) Onboarding (primo admin)

Quando l’utente completa l’onboarding (`src/utils/onboardingHelpers.ts`):

1. `createCompanyFromOnboarding()` crea la `company`
2. Inserisce in `company_members`:
   ```ts
   await supabase.from('company_members').upsert({
     user_id: user.id,
     company_id: company.id,
     role: 'admin',
     staff_id: null,
     is_active: true,
   }, { onConflict: 'user_id,company_id' })
   ```
3. Aggiorna `user_sessions` con `active_company_id`
4. Salva `active_company_id` in localStorage

L’app associa l’utente all’azienda durante l’onboarding.

#### B) Accept Invite (invito da admin)

Quando qualcuno accetta un invito (`src/services/auth/inviteService.ts`):

1. `acceptInvite()` crea l’account con `supabase.auth.signUp()`
2. Inserisce in `company_members`:
   ```ts
   await supabase.from('company_members').upsert({
     user_id: authData.user.id,
     company_id: invite.company_id,
     role: invite.role,
     staff_id: invite.staff_id,
     is_active: true,
   }, { onConflict: 'user_id,company_id' })
   ```
3. Crea `user_sessions` con `active_company_id`
4. Marca il token invito come usato

L’app associa l’utente all’azienda durante l’accettazione dell’invito.

---

## 3. RISPOSTE DIRETTE ALLE TUE DOMANDE

### «La devo fare io in Supabase?»

Se l’utente entra tramite:

- **Onboarding**: no, l’app lo fa (vedi sopra).
- **Accept Invite**: no, l’app lo fa.

Se invece crei utenti a mano (Supabase Dashboard, script SQL, ecc.), sì: devi inserire tu in `company_members` (e opzionalmente `user_sessions`).

### «Dovrebbe funzionare automaticamente dopo aver registrato un utente nel DB?»

No. La sola creazione in `auth.users` (o in una tabella custom) non crea nulla in `company_members`. L’associazione è fatta solo da:

- Onboarding
- Accept Invite

### «O lo devo associare io manualmente?»

- Per utenti creati dall’app: no (onboarding/invite).
- Per utenti creati da te (Dashboard, SQL, ecc.): sì, devi inserire manualmente in `company_members`.

### «Mi sembrava che l’app associasse autonomamente»

Sì, ma solo tramite:

- **Onboarding** (primo admin)
- **Accept Invite** (utenti invitati)

La registrazione su `/sign-up` non associa nulla. L’utente finisce su onboarding perché `companies.length === 0` e lì può creare l’azienda e ottenere l’associazione.

---

## 4. FLUSSO PRIMO ACCESSO CORRETTO

### Scenario A: Primo admin (crea l’azienda)

1. Registrazione su `/sign-up` → account in `auth.users`, **nessun** record in `company_members`
2. Conferma email (se abilitata in Supabase)
3. Login su `/sign-in`
4. useAuth: `companies = []` → `isAuthenticated = false` (manca `currentMembership`)
5. ProtectedRoute / OnboardingGuard → redirect a `/onboarding`
6. Completamento onboarding → `createCompanyFromOnboarding()` crea `company` e `company_members`
7. Redirect a dashboard con sessione attiva

### Scenario B: Utente invitato

1. Admin crea invito (email + ruolo) → record in `invite_tokens`
2. Invitato apre link `/accept-invite?token=...`
3. Compila nome, cognome, password → `acceptInvite()` crea `auth.users` + `company_members` + `user_sessions`
4. Dopo conferma email (se necessaria) può fare login normalmente
5. Ha già una company → accesso diretto alla dashboard

### Scenario C: Utente creato manualmente da te (Supabase/SQL)

1. Crei l’utente in `auth.users` (o altro flusso custom)
2. Devi inserire tu un record in `company_members`:
   ```sql
   INSERT INTO company_members (user_id, company_id, role, is_active)
   VALUES ('uuid-utente', 'uuid-azienda', 'admin', true);
   ```
3. Opzionale: creare/aggiornare `user_sessions` con `active_company_id`

---

## 5. COSA DEVI FARE TU PER PERMETTERE IL PRIMO ACCESSO

### Per un nuovo utente “primo admin”

Niente da fare in Supabase. L’utente:

1. Va su `/sign-up`, si registra
2. Conferma email
3. Fa login
4. Viene mandato a onboarding, completa il flusso
5. L’app crea company e associazione

### Per un utente invitato

- L’admin crea l’invito dall’app
- L’invitato usa il link e accetta
- L’app gestisce tutto

### Per un utente creato manualmente

Devi inserire tu in `company_members` (e opzionalmente in `user_sessions`), come nell’esempio SQL sopra.

---

## 6. CONTROVERIFICA DOCUMENTAZIONE vs CODICE

### 6.1 `Production/Knowledge/AUTENTICAZIONE/LOGIN_FLOW_MAPPING_COMPLETE.md`

| Documentazione | Codice attuale | Note |
|----------------|----------------|------|
| LoginPage.tsx | ✅ Esiste | Usa LoginForm |
| useAuth.ts | ✅ Esiste | Hook Supabase + company_members |
| Password 12 char, lettere+numeri | ✅ RegisterPage | Verificato |
| CSRF, Rate limiting, Remember Me | ✅ LoginForm/useAuth | Verificato |
| Multi-Company | ✅ useAuth | company_members, switchCompany |
| Test path `LoginPage/test-funzionali.spec.js` | ⚠️ | Potrebbe essere `test-funzionale.js` |

### 6.2 `Production/Knowledge/AUTENTICAZIONE/Reports/AUTENTICAZIONE_COMPONENTI.md`

- Inventario componenti corretto
- LoginPage: ora usa LoginForm (documentazione da aggiornare se dice il contrario)
- RegisterPage: esiste ancora e usa `signUp` senza creare `company_members`

### 6.3 `conoscenze-definizioni/LOGIN_FLOW.md`

| Documentazione | Codice | Note |
|----------------|--------|------|
| «Solo tramite invito» | ❌ | `/sign-up` è ancora attivo e raggiungibile |
| «Link Registrati ora RIMOSSO» | ❌ | RegisterPage esiste, route `/sign-up` attiva |
| «Nessuna registrazione self-service» | ❌ | La registrazione self-service è possibile; non crea però `company_members` |

La doc descrive il comportamento desiderato (solo invito), non lo stato attuale del codice.

### 6.4 Schema database

- `user_profiles`: nessun trigger che la popola da `auth.users`
- `company_members`: nessun trigger; popolata solo da Onboarding e Accept Invite

---

## 7. RIEPILOGO VISIVO

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FLUSSI ASSOCIAZIONE UTENTE-AZIENDA                    │
└─────────────────────────────────────────────────────────────────────────────┘

  REGISTRAZIONE /sign-up                    ACCETTA INVITO /accept-invite
  ─────────────────────                    ─────────────────────────────
  signUp() → auth.users                     acceptInvite():
  ❌ Nessun company_members                  1. signUp() → auth.users
  2. insert company_members ✅
  3. insert user_sessions ✅

  ONBOARDING (primo admin)
  ────────────────────────
  createCompanyFromOnboarding():
  1. insert companies
  2. insert company_members ✅
  3. upsert user_sessions ✅

  CREAZIONE MANUALE (Dashboard/SQL)
  ────────────────────────────────
  Devi fare tu:
  INSERT INTO company_members (user_id, company_id, role, is_active) ...
```

---

## 8. RACCOMANDAZIONI

1. **Aggiornare la documentazione** in `LOGIN_FLOW.md`: specificare che `/sign-up` è ancora attivo e che la registrazione self-service non crea `company_members`.
2. **Se vuoi “solo tramite invito”**: rimuovere o disabilitare la route `/sign-up` e il link da LoginPage.
3. **user_profiles**: se necessario per altre funzionalità, valutare un trigger `handle_new_user` che crei il profilo da `auth.users`.
4. **Flusso primo accesso**: lasciare invariato: registrazione → login → redirect a onboarding → completamento onboarding → associazione automatica.

---

**FINE REPORT**
