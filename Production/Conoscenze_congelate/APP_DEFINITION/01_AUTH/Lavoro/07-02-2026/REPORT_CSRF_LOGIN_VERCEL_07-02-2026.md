# Report: CSRF, Login e Deploy Vercel (07-02-2026)

**Data:** 07 febbraio 2026  
**Contesto:** Auth (01_AUTH) – problemi login e token CSRF in produzione (Vercel)  
**Esito:** Token CSRF risolto; problema accesso bloccato da validazione password (risolto nel report).

---

## 1. Lavoro svolto – riepilogo

### 1.1 Problema iniziale: "Failed to fetch" / HTML invece di JSON

- **Sintomo:** In produzione (Vercel), alla pagina di login compariva:
  - `Failed to fetch CSRF token: SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON`
  - `Login error: Unexpected token '<', "<!doctype "... is not valid JSON`

- **Causa:** Il frontend chiamava le Edge Functions Supabase con **URL relativo** (`/functions/v1/auth/csrf-token`). Su Vercel tutte le route sono riscritte su `index.html` (`vercel.json`), quindi la fetch riceveva HTML invece di JSON.

- **Interventi:**
  - **useCsrfToken.ts:** Base URL per le Edge Functions costruita con `VITE_SUPABASE_URL` (URL assoluto Supabase) quando presente; altrimenti fallback a `/functions/v1`.
  - **authClient.ts:** `API_BASE_URL` calcolata da `VITE_SUPABASE_URL` + `/functions/v1` per tutte le chiamate alle Edge Functions.

### 1.2 Redirect post-login: pagina di login non si chiudeva

- **Sintomo:** Dopo login riuscito la pagina di login restava visibile, la home non compariva.

- **Causa:** Uso di `navigate('/dashboard')` (React Router): la route protetta si montava prima che `useAuth` aggiornasse lo stato (getSession asincrono), quindi `ProtectedRoute` vedeva ancora “non autenticato” e reindirizzava a `/sign-in`.

- **Interventi:**
  - **LoginPage.tsx:** `onSuccess` fa redirect a pieno caricamento con `window.location.replace('/dashboard')` dopo 150 ms (sessione già persistita).
  - **LoginForm.tsx:** Rimosso `navigate('/dashboard')`; viene usato solo `onSuccess()` (redirect full page). Rimosso `useNavigate` non usato.

### 1.3 "Failed to fetch" (TypeError) – CORS / credentials

- **Sintomo:** `Failed to fetch CSRF token: TypeError: Failed to fetch` (nessun body, richiesta bloccata).

- **Causa:** Con `credentials: 'include'` la richiesta è cross-origin (Vercel → Supabase). Il browser richiede CORS con origin specifico e `Allow-Credentials`; la Edge Function risponde con `Access-Control-Allow-Origin: '*'`, non valido con credentials.

- **Intervento:** Rimozione di `credentials: 'include'` dalla fetch del token CSRF in **useCsrfToken.ts**.

### 1.4 Ipotesi URL malformato e preflight CORS

- **Sintomo:** Stesso "Failed to fetch" persisteva.

- **Interventi (per esclusione):**
  - **Normalizzazione URL:** In **useCsrfToken.ts** e **authClient.ts** introdotta `normalizeSupabaseUrl()` / `normalizeEnvString()` che fa `trim()` e rimuove `\r`, `\n` da `VITE_SUPABASE_URL` (e poi anche da anon key).
  - **GET “simple”:** Rimozione dell’header `Content-Type: application/json` dalla GET al token CSRF per evitare preflight OPTIONS.
  - **Documentazione:** Creato **docs/auth/CSRF_VERCEL_TROUBLESHOOTING.md** con checklist (env, path funzione, test endpoint, deploy).

### 1.5 Path errato Edge Function → 404 / “Failed to fetch”

- **Sintomo:** La fetch poteva andare a un path inesistente (404 senza CORS → “Failed to fetch”).

- **Causa:** Supabase espone una funzione per **cartella top-level** sotto `functions/`. La cartella deployata è **auth-csrf-token** (trattino), non `auth/csrf-token` (slash).

- **Intervento:** In **useCsrfToken.ts** l’URL della fetch è stato cambiato da `/auth/csrf-token` a **`/auth-csrf-token`**.

### 1.6 HTTP 401 sulla Edge Function

- **Sintomo:** `Failed to fetch CSRF token: Error: HTTP 401:` (la richiesta arrivava alla funzione ma veniva rifiutata).

- **Causa:** Le Edge Functions Supabase richiedono un header di autorizzazione; senza `Authorization: Bearer <anon_key>` (e in molti casi anche `apikey`) la richiesta viene rifiutata con 401.

- **Intervento:** In **useCsrfToken.ts** aggiunti header alla fetch del token CSRF:
  - `Authorization: Bearer <VITE_SUPABASE_ANON_KEY>`
  - `apikey: <VITE_SUPABASE_ANON_KEY>`
  con normalizzazione della anon key (stessa logica usata per l’URL).

---

## 2. File modificati (riferimento)

| File | Modifiche principali |
|------|----------------------|
| `src/hooks/useCsrfToken.ts` | Base URL da env, normalizzazione URL/anon key, path `auth-csrf-token`, niente credentials, GET senza Content-Type, header Authorization + apikey |
| `src/features/auth/api/authClient.ts` | Base URL da `VITE_SUPABASE_URL`, normalizzazione URL |
| `src/features/auth/LoginPage.tsx` | onSuccess con `window.location.replace('/dashboard')` e delay 150 ms |
| `src/features/auth/components/LoginForm.tsx` | Solo onSuccess (niente navigate), rimosso useNavigate |
| `docs/auth/CSRF_VERCEL_TROUBLESHOOTING.md` | Nuovo: checklist e path corretto `auth-csrf-token` |

---

## 3. Errore attuale: validazione password (ZodError)

### 3.1 Messaggio e stack

```
Login error: ZodError: [
  {
    "validation": "regex",
    "code": "invalid_string",
    "message": "Password deve contenere solo lettere, numeri e caratteri speciali",
    "path": ["password"]
  }
]
```

- **Dove:** Validazione lato client in `authClient.login()` → `loginFormSchema.parse(data)` (schemas in `src/features/auth/api/schemas/authSchemas.ts`).
- **Quando:** Dopo aver inserito email e password e aver cliccato “Accedi”; il token CSRF a questo punto funziona (“CSRF token generato lato client” in console).

### 3.2 Causa root

- Lo **schema Zod** del login usa `passwordSchema`, che applica (tra l’altro) un **regex** definito in **`PASSWORD_POLICY.pattern`** (`src/types/auth.ts`).

- **Valore attuale di `PASSWORD_POLICY`:**
  - `pattern: /^[A-Za-z]+$/`
  - `description: 'Minimo 12 caratteri, massimo 128, solo lettere [A-Za-z]'`

- **Problema:** Il regex **accetta solo lettere latine (A–Z, a–z)**. Non sono ammessi:
  - numeri
  - spazi
  - caratteri speciali (es. `!@#$%^&*()`)

- Il messaggio mostrato all’utente invece dice: *“Password deve contenere solo lettere, numeri e caratteri speciali”*, quindi è in contraddizione con il regex: l’utente è autorizzato a usare numeri e caratteri speciali, ma la regex li rifiuta → **ZodError** su `password`.

- In sintesi: **policy troppo restrittiva** (solo lettere) rispetto al messaggio e all’uso reale delle password (spesso con numeri e simboli).

### 3.3 Riferimenti codice

- **Definizione policy:** `src/types/auth.ts` – `PASSWORD_POLICY.pattern` e `description`.
- **Uso nello schema:** `src/features/auth/api/schemas/authSchemas.ts` – `passwordSchema` con `.regex(PASSWORD_POLICY.pattern, 'Password deve contenere solo lettere, numeri e caratteri speciali')`.
- **Punto di validazione:** `src/features/auth/api/authClient.ts` – `loginFormSchema.parse(validatedData)` (o equivalente) dentro `login()`.

### 3.4 Soluzione consigliata

- Allineare il **pattern** al messaggio e alle best practice (lettere, numeri, caratteri speciali comuni, eventualmente lunghezza min/max già presenti):
  - Esempio: ammettere caratteri stampabili (lettere, cifre, simboli comuni) e vietare solo caratteri di controllo.
  - Esempio possibile: `pattern: /^[\x20-\x7E]+$/` (tutti i caratteri stampabili ASCII) oppure una whitelist esplicita (es. `[A-Za-z0-9!@#$%^&*()_+\-=\[\]{}|;':",./<>?\\\`~]`), mantenendo `minLength`/`maxLength` già definiti.

- Aggiornare **`description`** in `PASSWORD_POLICY` in modo che rifletta il nuovo pattern (es. “Lettere, numeri e caratteri speciali consentiti”).

- Opzionale: mostrare nel form (tooltip o testo sotto il campo) i requisiti effettivi (lunghezza e caratteri ammessi) per ridurre errori utente.

---

## 4. Warning Sentry

- **Messaggio:** `⚠️ Sentry DSN not configured - error tracking disabled`
- **Significato:** L’integrazione Sentry è attiva ma non è configurato un DSN (valido) in produzione, quindi gli errori non vengono inviati a Sentry.
- **Impatto:** Nessun blocco sul login; solo assenza di error tracking in produzione. Per abilitarlo: configurare `VITE_SENTRY_DSN` (o la variabile usata dal progetto) nelle env di Vercel e verificare che `initSentry()` riceva quel valore.

---

## 5. Checklist post-report

- [x] Token CSRF: URL Supabase, path `auth-csrf-token`, header Authorization/apikey.
- [x] Redirect post-login: full page replace su `/dashboard`.
- [x] Report scritto e analisi errore password inserita.
- [x] **Correzione `PASSWORD_POLICY.pattern`** applicata in `src/types/auth.ts`: pattern sostituito con `^[\x20-\x7E]+$` (caratteri stampabili ASCII) e description aggiornata.
- [ ] (Opzionale) Configurare Sentry DSN in produzione se si desidera error tracking.

---

*Report generato il 07-02-2026. Per modifiche al flusso auth o alla policy password, aggiornare le conoscenze-definizioni in 01_AUTH e questo report se necessario.*
