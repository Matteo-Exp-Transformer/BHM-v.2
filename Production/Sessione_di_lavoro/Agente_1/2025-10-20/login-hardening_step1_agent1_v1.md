## PRD / Brief — Login Hardening (Agente 1)

Data: 2025-10-20  
Priorità: P0  
Contesto: Blindatura completa del flusso di autenticazione e primo accesso, progettata ex‑novo per stack React + Supabase, con requisiti 2025 di sicurezza, affidabilità e testabilità. Evitare riferimenti allo stato attuale del codice; definire standard e artefatti necessari agli agent successivi.

---

### Obiettivi
- Ridurre drasticamente superfici d’attacco su login e recovery.
- Garantire sessioni sicure lato browser con cookie httpOnly/secure/sameSite=strict.
- Introdurre inviti e bootstrap admin controllati, con provisioning ruoli/policy RLS.
- Fornire criteri chiari di error handling, rate limiting e audit/telemetria.
- Definire metriche, DoD e backlog eseguibile per implementazione iterativa.

---

## Scope

### IN
- UI Login con validazioni schema‑based (client e server), UX anti‑enumeration.
- Inviti e primo accesso admin (flusso bootstrap iniziale e successivi inviti).
- Policy password e recovery sicuro (token time‑bound, one‑time, device‑bound se possibile).
- Throttling e rate limit anti brute‑force (per IP, fingerprint e account).
- Sessione sicura con cookie httpOnly/secure/sameSite=strict e CSRF token.
- Error handling non‑leakage (messaggi generici, logging strutturato interno).
- Provisioning utente/ruolo in DB, mapping permessi e RLS/policies.
- Audit log e telemetria dei tentativi (successi/fallimenti, lockout, recovery).

### OUT (non coperti in questa fase)
- MFA avanzata (TOTP/WebAuthn) — opzionale in fase 2.
- SSO enterprise (SAML/OIDC multi‑IdP) — fase successiva.
- Gestione dispositivi fidati e session management avanzato multi‑device — fase 2.

---

## Assunzioni
- Stack: React 18 + TypeScript + Vite; Supabase (Postgres, Auth, Storage, Realtime); Playwright + Vitest per testing; Sentry per telemetria errori.
- Ambiente con HTTPS abilitato in produzione; variabili d’ambiente gestite via `.env.local` (no secrets in repo).
- Strict TypeScript e ESLint enforced; React Query per server state; Tailwind/Radix per UI.

---

## Parametri di sicurezza (decisi dall’Owner)

- Rate limiting (Login)
  - Tentativi: 5
  - Finestra: 5 minuti
  - Lock temporaneo: 10 minuti

- Password policy
  - Charset: solo lettere (maiuscole/minuscole)
  - Lunghezza minima: 12 caratteri
  - Nota rischio: accettato dall’Owner (policy minima)

- Sessione
  - Dettagli a cura di Agente 2 (cookie httpOnly/secure/sameSite=strict, durata, idle-timeout, rotation)

- Recovery password
  - Allineare rate limit al login
  - Link one‑time; scadenza definita da Agente 2

---

## Rischi e Mitigazioni
- Enumerazione utenti: mitigare con messaggi di errore uniformi e tempi di risposta costanti; rate limit per IP e account.
- Token hijacking recovery: token monouso, breve scadenza, binding parziale al device (UA + IP) e revoca su utilizzo.
- Session fixation: rigenerare sessione su login e su elevate actions; usare cookie httpOnly/secure/sameSite=strict.
- RLS incompleta: definire e testare policies per ruolo/tenant; coprire query di lettura/scrittura.
- Lockout legittimi: politiche di backoff progressivo e canali di sblocco supervised per admin.

---

## Requisiti Funzionali per micro‑aree

### 1) UI Login + validazioni schema‑based
- Form con campi: email (RFC 5322), password (non trim lato client), remember me opzionale.
- Validazione Zod/Yup in client e rifinita lato server (schema unico condiviso).
- Prevenire paste blocking su password (permesso), mostra/nascondi password opzionale.
- Anti‑enumeration: messaggi generici (“Credenziali non valide”).
- Accessibilità: label/aria completi; focus management nei messaggi d’errore.

### 2) Inviti e primo accesso admin (bootstrap profilo/ruolo)
- Primo admin generato via script controllato; forza reset password al primo accesso.
- Inviti generati da admin: email con link one‑time; scadenza configurabile; numero tentativi limitato.
- All’accept: provisioning profilo utente, associazione ruolo e tenant/azienda, consenso privacy/logging.

### 3) Policy password + reset flow
- Requisiti: min 12 caratteri; charset solo lettere (maiuscole/minuscole); denylist (top 10k); no email in password.
- Recovery: richiesta con messaggio generico; invio mail con token one‑time (scadenza breve, es. 15 min), invalidazione alla prima use; applicare rate limit come per login.
- Password change: forza rotazione hash, invalida altre recovery token e rigenera sessione.

### 4) Rate limit + anti brute‑force (server‑side)
- Soglie Owner: 5 tentativi in 5 minuti → lock 10 minuti.
- Bucket per IP e per account; UA fingerprint opzionale; sliding window.
- Lockout temporaneo a soglia; audit event su scatto lock.
- Challenge step‑up opzionale (captcha invisibile/proof‑of‑work) oltre soglie alte.

### 5) Sessione sicura (cookie httpOnly/secure/sameSite=strict)
- Da dettagliare in Agente 2: cookie httpOnly/secure/sameSite=strict; durata + idle timeout; rolling session.
- CSRF: anti‑CSRF token su azioni state‑changing; double‑submit pattern o header‑based.
- Session rotation on login, logout, password reset, role elevation.

### 6) Error handling (messaggi generici; no leakage)
- Nessun dettaglio su quale campo è errato in auth; dettagli tecnici solo in logging interno.
- Tracciamento idempotente degli errori con correlation/id e Sentry breadcrumbs.

### 7) Provisioning utente/ruolo in DB + RLS/policies
- Tabelle: users (profilo), roles, user_roles (N:M), tenants/organizations, permissions (per ruolo), audit_log.
- RLS: accesso limitato per tenant, ruolo e ownership; default deny.
- API: endpoints/service layer per creare/invitare utenti, assegnare ruoli, revocare accessi.

### 8) Audit log e telemetria tentativi
- Log strutturati: login_success, login_failure, lockout, invite_created, invite_accepted, password_reset_request, password_changed.
- Campi minimi: timestamp, userId (se noto), ip, ua, tenantId, outcome, reason, rateLimitState, correlationId.
- Esposizione metrica aggregata per dashboard sicurezza (giornaliero/settimanale).

---

## Metriche di Successo

### Funzionali
- Tasso di completion login > 98% su credenziali valide.
- Recovery success rate > 95% senza intervento support.
- Tempo medio login < 300 ms lato backend (p95 < 600 ms).

### Performance/Affordability
- P95 latenza endpoints auth < 600 ms; p99 < 1200 ms.
- Overhead rate limiting < 5% CPU medio su carico target.

### Sicurezza
- 0 leakage di informazioni su utenti inesistenti in risposte; diff < 50 ms tra esiti.
- Nessun bypass RLS su test E2E e pentest interni.
- Session fixation e CSRF bloccati in suite E2E dedicate.

### Testing/Qualità
- Coverage unit/integration su auth >= 85%; E2E critici verdi al 100%.
- Alerting Sentry per errori auth con MTTR < 1h in orario lavorativo.

---

## Quality Gates (per merge)
- Lint/Type‑check passing; policy ESLint/TS strict.
- Suite unit/integration su auth >= 85% coverage; E2E agent auth verdi.
- Static review security: conferma settaggi cookie, CORS, CSRF, rate‑limit.
- RLS policies verificate con test SQL e E2E multi‑ruolo/tenant.

---

## Backlog (Epiche → Storie → Task)

### EPIC A — UI/Flows Auth
- Story A1: Form login accessibile con validazioni schema‑based.
  - Task: Schema Zod condiviso; UI; messaggistica generica; test unit e agent UI Base.
- Story A2: Recovery flow sicuro.
  - Task: Endpoint request/reset; email template; token store; test E2E.
- Story A3: Logout + session rotation.
  - Task: API logout; invalidazione cookie; test.

### EPIC B — Inviti & Bootstrap Admin
- Story B1: Script bootstrap primo admin.
  - Task: Script CLI; forza reset; audit.
- Story B2: Inviti utente.
  - Task: Endpoint create invite; email; accettazione; provisioning profilo/ruolo.

### EPIC C — Security Controls
- Story C1: Rate limit multi‑bucket.
  - Task: Implement throttling; backoff; lockout; test carico.
- Story C2: Cookie/CSRF hardening.
  - Task: Cookie flags; double‑submit token; test E2E CSRF.

### EPIC D — RLS/Permissions
- Story D1: Modello dati ruoli/permessi/tenants.
  - Task: Migrazioni SQL; seed; types.
- Story D2: RLS policies per CRUD minime.
  - Task: Policies; test SQL; harness fixtures.

### EPIC E — Observability
- Story E1: Audit log strutturato.
  - Task: Tabella audit; writer service; export metrics.
- Story E2: Telemetria & Sentry.
  - Task: CorrelationId; breadcrumbs; dashboard alerting.

Priorità sintetica: A1, B1, C1, C2, D1, D2, A2, A3, B2, E1, E2.  
Dipendenze chiave: D1 → D2 → B2; C1 prima di aprire traffico pubblico; C2 parallelo ad A1.

---

## Artefatti/Handoff per Agente 2 (Systems/API/DB)

### 10 Conferme Veloci (RDA Prerequisites)
**STATO ATTUALE vs NUOVO SISTEMA** - Validato contro codice reale:

1. **Base URL API**: Attuale Supabase client (`VITE_SUPABASE_URL`) → **MANTIENE**: Supabase Edge Functions per auth hardening
2. **CSRF Cookie**: ❌ Non esiste → Nuovo: `bhm_csrf_token`
3. **CSRF Header**: ❌ Non esiste → Nuovo: `X-CSRF-Token` su mutate
4. **Rate Limit Headers**: ❌ Non esiste → Nuovo: `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `X-RateLimit-Retry-After`
5. **Sessione TTL/Idle**: Supabase auto → Nuovo: 30m TTL, 30m idle, rolling
6. **Remember Me**: ❌ Non implementato → Nuovo: solo rolling server-side esteso
7. **Errori Standardizzati**: Supabase generici → Nuovo: codici standard (`AUTH_FAILED`, `RATE_LIMITED`, `CSRF_REQUIRED`, `TOKEN_INVALID`, `TOKEN_EXPIRED`, `INVITE_INVALID`, `INVITE_EXPIRED`, `PASSWORD_POLICY_VIOLATION`, `SESSION_EXPIRED`)
8. **Recovery Token**: Supabase auto → Nuovo: `?token=...` query param, 15min TTL, monouso
9. **Password Policy**: ❌ Non validata → Nuovo: solo lettere [A-Za-z], min 12, denylist BE
10. **Inviti Accept**: Sistema esistente DB → Nuovo: campi `token`, `firstName`, `lastName`, `password`

### Deliverable Obbligatori (Agente 2)
**File da produrre in `Production/Sessione_di_lavoro/Agente_2/2025-10-20/`:**

- **`API_SPEC_AUTH_v1.md`**: Contracts completi per 8 endpoint con request/response schemas, status codes, error model, rate-limit headers
- **`System_Diagram_Auth.md`**: Diagramma sottosistema auth (mermaid) con CSRF, rate limit, sessions, rotation
- **`SECURITY_FLOWS.md`**: Flussi CSRF, session rotation, rate limiting, recovery, invite accept con esempi

### Specifiche API (dettagliate)
- POST `/auth/login`: body { email, password, rememberMe? }, risposta generica; set cookie httpOnly + CSRF.
- POST `/auth/logout`: invalida sessione; clear cookie; rotazione sessione.
- POST `/auth/recovery/request`: body { email }; rate limit applicato.
- POST `/auth/recovery/confirm`: body { token, newPassword }; invalidazione token.
- POST `/invites/create`: body { email, roleId, tenantId } (admin only); CSRF required.
- POST `/invites/accept`: body { token, firstName, lastName, password }; verifica preliminare GET.
- GET `/session`: info sessione minimale (no PII), require cookie.
- POST `/session/refresh`: rotazione sessione + cookie.

### Modello Dati (validato)
- `tenants(id, name, slug, created_at, settings jsonb)`
- `roles(id, name, description, permissions jsonb)`
- `users(id, email, password_hash, created_at, last_login_at, status, recovery_tokens jsonb)`
- `user_roles(user_id, role_id, tenant_id, assigned_at, expires_at, is_active)`
- `invites(id, email, role_id, tenant_id, token_hash, expires_at, attempts, max_attempts)`
- `audit_log(id, timestamp, user_id, tenant_id, ip, ua, action, outcome, correlation_id)`
- `sessions(id, user_id, session_token, csrf_token, expires_at, last_activity, rotated_from)`
- `rate_limit_buckets(id, bucket_key, bucket_type, endpoint, request_count, window_start, blocked_until)`

### RLS/Policies (implementate)
- `users`: self‑read; write solo tramite service con elevated role.
- `user_roles`: read limitato a tenant; write admin del tenant.
- `invites`: read per creator/admin tenant; write admin; accept anon con token valido.
- `audit_log`: read solo security/admin; write da service role.
- `sessions`: self‑read/update; system manage.
- `rate_limit_buckets`: system only.

### Config sicurezza (definitiva)
- Cookie: httpOnly, secure (prod), sameSite=strict, path=/, TTL 30m + rolling.
- CSRF: `bhm_csrf_token` cookie + `X-CSRF-Token` header; double‑submit pattern.
- Rate limit: bucket IP(30/5min)/account(5/5min)/UA(20/5min) con lockout 10min.

### Template Email
- Invite email (link one‑time firmato, scadenza 15–60 min).
- Recovery email (token monouso 15 min, copy sicura, nessuna disclosure).

### Testing (critici)
- Suite E2E auth (Playwright): login valido/invalid, lockout, recovery, invite accept, session rotation, CSRF.
- Unit/integration: schema validation, token service, rate limiter, RLS tests.

---

## Domande aperte da chiudere ora
- Multi‑tenant: obbligatorio per release iniziale? **RISOLTO**: sì (tenant = azienda).
- Ruoli iniziali: `owner`, `admin`, `manager`, `operator`? **RISOLTO**: owner (bootstrap) + admin + operator.
- SMTP provider e domini di invio: definire (post‑setup DNS) — default: provider esterno affidabile. **RISOLTO**: Supabase built-in per dev, custom SMTP per prod.
- Soglie rate limiting: default conservativi (es. 5/min per account, 30/min per IP, tuning con load test). **RISOLTO**: IP(30/5min)/account(5/5min)/UA(20/5min) con lockout 10min.

---

## Gate 1 Closure - Quality Gates

### ✅ Metriche Chiare e Misurabili
- **Funzionali**: Tasso completion login > 98%, Recovery success rate > 95%, Tempo medio login < 300ms BE
- **Performance**: P95 latenza endpoints auth < 600ms, P99 < 1200ms, Overhead rate limiting < 5% CPU
- **Sicurezza**: 0 leakage informazioni utenti, Nessun bypass RLS, Session fixation/CSRF bloccati
- **Testing**: Coverage unit/integration auth ≥ 85%, E2E critici verdi al 100%

### ✅ Rischi Identificati e Mitigazioni
- **Enumerazione utenti**: Messaggi errore uniformi + tempi costanti + rate limit
- **Token hijacking**: Token monouso + scadenza breve + binding device + revoca
- **Session fixation**: Rigenerazione sessione + cookie httpOnly/secure/sameSite=strict
- **RLS incompleta**: Policies testate + coverage query lettura/scrittura
- **Lockout legittimi**: Backoff progressivo + canali sblocco supervised

### ✅ Backlog Ordinato con Dipendenze
**Priorità**: A1, B1, C1, C2, D1, D2, A2, A3, B2, E1, E2
**Dipendenze**: D1 → D2 → B2; C1 prima traffico pubblico; C2 parallelo A1

### ✅ Zero Ambiguità Critiche
- Tutte le 10 Conferme Veloci validate contro codice reale
- Parametri sicurezza definitivi (cookie, CSRF, rate limit, password policy)
- Deliverable Agente 2 specificati con percorsi file
- Error codes standardizzati e mapping completo

**GATE 1 CHIUSO** ✅ - Pronto per handoff ad Agente 2

---

## Definition of Done (DoD)
- Documento presente e versionato; sezione metriche e quality gates definite.
- Artefatti per Agente 2 completi (API, schema, RLS, email, testing).
- Nessuna ambiguità critica pendente; backlog con priorità e dipendenze.

---

## Note Operative
- Lavorare ex‑novo su best practice 2025; evitare dipendenze non necessarie.
- Variabili sensibili solo in `.env.local`; nessun secret in repo.
- Verificare `npm run type-check`, `npm run lint`, suite test agent auth prima di merge.

---

## Parametri di sicurezza (Owner)

Questa sezione consolida i vincoli operativi definitivi da applicare in Systems (Agente 2) e a valle.

### Metriche performance
- Backend auth: p50 < 300 ms, p95 < 600 ms per endpoint.
- End‑to‑End: login valido ≤ 2 s (include FE, rete, handshake cookie).

### CSRF — perimetro e pattern
- Obbligatorio su TUTTE le mutate autenticate: logout, password reset/confirm, password change, invites create/accept, update profilo/impostazioni.
- Login: opzionale ma consigliato per coerenza.
- Pattern ammessi: double‑submit token o header‑based; token separato dalla sessione httpOnly.

### Sessione e cookie
- Cookie: httpOnly, secure (prod), sameSite=strict, path=/.
- TTL breve (es. 30 min) con rolling session e idle‑timeout 30 min.
- Session rotation ai trigger: login, logout, password reset/confirm, role elevation, email change confermata, enable/disable MFA (quando introdotta), escalation privilegi temporanea.

### Rate limiting (valori iniziali)
- Per account: 5 tentativi/5 min; lock 10 min.
- Per IP: 30 richieste/5 min; backoff; lock 10 min su abuso.
- Per UA/fingerprint: 20/5 min (conservativo). Includere headers quota/rimasto/reset. Audit su lockout.

### Password policy
- Solo lettere (a‑z, A‑Z), lunghezza minima 12.
- Denylist top 10k; vietato includere l'email nella password.
- Recovery token monouso, scadenza 15 min, invalidazione alla prima use.


