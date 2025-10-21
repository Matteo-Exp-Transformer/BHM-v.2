# Blindaggio Login — Piano Completo (da 0)

Obiettivo: rendere a prova di errore e completamente testato il sistema di login, inviti, primo accesso admin, configurazione utente in database e gestione sessione/ruoli, con DoD verificabile e test automatizzati.

## Scope e Definizioni
- **Stack previsto**: React + TypeScript + Supabase (Auth, DB, RLS)
- **Aree incluse**: login/password, magic link/OTP (se previsto), inviti, bootstrap admin, verifica email, reset password, sessione/token, profilo utente, ruoli/permessi, RLS baseline, rate limiting/logging lato app, UX error handling.
- **Escluso**: hardening infrastrutturale esterno (WAF/CDN), anti-bot avanzato.

## Priorità
- **P0 (bloccanti release)**
  1. Flusso login/password con validazioni e gestione errori robusta
  2. Bootstrap admin al primo avvio + ruolo admin coerente in DB
  3. Invito utente: generazione token, accettazione, prima configurazione profilo
  4. Gestione sessione/token: persistenza sicura, refresh, sign-out affidabile
  5. Controllo ruoli/permessi sul client e coerente con DB (RLS-ready)
  6. Reset password e verifica email funzionanti end-to-end

- **P1 (importanti)**
  7. Rate limiting a livello UI (debounce, lock temporanei, captcha opz.)
  8. Audit e security logs applicativi (tentativi falliti, azioni critiche)
  9. UX messaggi errore chiari ma non informativi per attacker

- **P2 (miglioramenti)**
  10. MFA/OTP opzionale; device trust
  11. Telemetria qualità (tasso successo login, latenza)

## Struttura di lavoro per ciascuna funzione
Per ogni elemento sotto, implementare e verificare: Obiettivo, Rischi, Design, DoD, Test, Agente e Prompt.

---

### P0-1) Login con email/password
- **Obiettivo**: Autenticazione sicura via Supabase Auth (email+password) con validazioni lato UI.
- **Rischi**: brute force, enumeration via errori, validazioni inconsistenti, gestione errori debole.
- **Design**:
  - Input schema con validazioni sincrone (email RFC, password policy configurabile)
  - Chiamata auth con gestione stati (loading, success, fail) e codici errore mappati
  - Blocchi UI progressivi su X tentativi falliti in breve finestra (client-side)
  - Messaggi generici per failure (no dettagli su esistenza account)
- **DoD**:
  - Validazioni deterministiche, messaggi UX localizzati, nessuna fuga di informazioni
  - Copertura test: unit 95% su validatori; integrazione su handler; E2E flussi principali/passaggi errore
- **Test**:
  - Unit: email/password validators, mappa errori → messaggi
  - Integration: hook/servizio `signIn` con stub Supabase
  - E2E: credenziali corrette/errate, lock client dopo N tentativi
- **Agente**: 1 (UI/Forms) + 3 (Business Logic)
- **Prompt (handoff)**:
  - Contesto: componenti `LoginForm`, hook `useAuth`, servizio `authService`
  - Task: Implementa validazioni, mapping errori, lock tentativi
  - DoD: test unit+integrazione+E2E verdi, coverage target soddisfatta

### P0-2) Bootstrap Admin (primo avvio)
- **Obiettivo**: Creare/forzare il primo utente admin e la sua configurazione profilo/ruolo in DB.
- **Rischi**: più admin non intenzionali, condizioni di race, ruoli incoerenti.
- **Design**:
  - Wizard iniziale protetto dietro flag `needsAdminSetup` letto dal DB
  - Creazione utente admin, verifica email, set ruolo `admin` in profilo
  - Idempotenza: se admin esiste, wizard disabilitato
- **DoD**:
  - Stato DB coerente, RLS-friendly, test E2E wizard + negative paths
- **Test**:
  - Unit: funzioni di check/flag
  - Integration: API supabase per verifica settaggi profilo
  - E2E: flusso creazione admin, replay idempotente
- **Agente**: 3 (Business Logic) + 5 (Navigation)
- **Prompt**: Implementa wizard bootstrap admin con idempotenza e test.

### P0-3) Inviti Utente (token → signup → profilo)
- **Obiettivo**: Gestire invito con token a scadenza, registrazione e prima configurazione profilo.
- **Rischi**: riuso token, token leakage, profilo parziale.
- **Design**:
  - Token firmato a scadenza (Supabase o firma app), one-time
  - Form registrazione minimale, vincoli password policy, salvataggio profilo atomico
- **DoD**:
  - Token one-time, scadenze rispettate, profilo completo, test E2E con varianti
- **Test**: unit generazione/validazione token; integrazione flusso; E2E invito valido/scaduto/già usato
- **Agente**: 3 (Business Logic) + 2 (Forms)
- **Prompt**: Implementa inviti con token one-time e test completi.

### P0-4) Sessione/Token/Sign-out
- **Obiettivo**: Gestire sessione, persistenza sicura, refresh e logout pulito.
- **Rischi**: session fixation, token stale, logout non invalida UI.
- **Design**:
  - Affidarsi a session management Supabase; storage sicuro; listeners su auth state
  - Clear completa stato client su logout; redirect coerente
- **DoD**:
  - Nessun accesso a aree protette dopo logout; refresh gestito; test E2E
- **Test**: unit helpers; integrazione listener; E2E login → logout → blocco accessi
- **Agente**: 3 (Business Logic) + 5 (Navigation)
- **Prompt**: Implementa gestione sessione completa con test.

### P0-5) Ruoli e Permessi (client) + Coerenza DB
- **Obiettivo**: Enforce ruoli a livello UI e coerenza con profilo/DB.
- **Rischi**: esposizione componenti, bypass client, mismatch con RLS.
- **Design**:
  - Hook `useRole`/`useAuthorization` centralizzato; guardie route; fallback UI
  - Mappa ruoli sincronizzata con profilo Supabase; readiness per RLS lato DB
- **DoD**:
  - Nessun componente admin visibile a ruoli non autorizzati; test coverage
- **Test**: unit policy map; integrazione guardie; E2E access control
- **Agente**: 5 (Navigation) + 3 (Business Logic)
- **Prompt**: Implementa guardie ruoli e test.

### P0-6) Verifica Email e Reset Password
- **Obiettivo**: Flussi di verifica email e reset password completi.
- **Rischi**: link scaduti, UI incoerente, error mapping insufficiente.
- **Design**:
  - Handlers dedicati per link; stati UX per scadenza/invalidazione
  - Policy password configurabile, conferma password
- **DoD**:
  - Flussi funzionanti end-to-end, test E2E su link validi/scaduti
- **Test**: unit helpers; integrazione handlers; E2E
- **Agente**: 2 (Forms) + 3 (Business Logic)
- **Prompt**: Implementa verifica email e reset password con test.

---

### P1-7) Rate Limiting (client) e Anti-abuso base
- **Obiettivo**: Ridurre brute force lato UI.
- **Design**: backoff incrementale, blocco temporaneo UI dopo N errori, captcha opzionale
- **DoD**: E2E con simulazione tentativi rapidi; UX coerente
- **Agente**: 1 (UI) + 3 (Logic)

### P1-8) Audit/Security Logs
- **Obiettivo**: Tracciare tentativi falliti, reset, inviti accettati.
- **DoD**: log strutturati, privacy-safe, consultabili in dev
- **Agente**: 3 (Logic)

### P1-9) UX Error Handling
- **Obiettivo**: Messaggi chiari e sicuri.
- **DoD**: mappa errori → messaggi localizzati, nessuna enumeration
- **Agente**: 1 (UI)

### P2-10) MFA/OTP
- **Obiettivo**: Aggiungere MFA opzionale.
- **DoD**: setup, fallback recovery codes, test E2E
- **Agente**: 3 (Logic) + 1 (UI)

### P2-11) Telemetria Qualità
- **Obiettivo**: Misurare tasso successo/errore.
- **DoD**: eventi anonimizzati, dashboard dev
- **Agente**: 3 (Logic)

---

## Strategia di Test (per tutti gli elementi)
- Unit: Vitest (validatori, helpers, mapping errori)
- Integrazione: React Testing Library + mocks Supabase/MSW
- E2E: Playwright agent 1/2/3/5 secondo area
- Target coverage: 85%+ statements su moduli critici auth

## Definition of Done Generale
- Funzione implementata, test unit+integrazione+E2E verdi
- Tipi TypeScript strict senza `any`
- Lint e type-check ok; documentazione aggiornata (CHANGELOG, README_SESSIONE)
- Nessun segreto hardcodato; variabili in `.env.local`

## Output attesi in questa sessione
- Questa checklist approvata
- Handoff al primo agente sul task P0-1 (login/password)
- File di prompt pronti nella stessa cartella
