## Brief — Agente 2 (Systems/API/DB) — Login Hardening

Data: 2025-10-20  
Priorità: P0

### Input vincolanti
- PRD: `Production/Sessione_di_lavoro/Agente_1/2025-10-20/login-hardening_step1_agent1_v1.md`
- Checklist consolidata: `Production/Sessione_di_lavoro/Neo/2025-10-20/Checklist_Planning_Consolidata.md`
- Decisioni Owner: sezione "Parametri di sicurezza (Owner)" nel PRD

### Obiettivo
Consegnare gli artefatti tecnici per sbloccare Agente 3 (UI/flows) e Agente 5 (E2E): schema dati + RLS, contracts API, sicurezza (cookie, CSRF, rate‑limit, rotation), template email, piano test tecnico.

---

## Da formalizzare (vincolante)

### Cookie/Sessione
- Flags: httpOnly, secure (prod), sameSite=strict, path=/.
- TTL: 30 min indicativi con rolling session; idle‑timeout 30 min.
- Rotazione: login, logout, password reset/confirm, role elevation, email change confermata, enable/disable MFA, escalation privilegi temporanea.

### Rate limiting
- Account: 5 tentativi / 5 min; lock 10 min.
- IP: 30 richieste / 5 min; backoff; lock 10 min su abuso.
- UA/fingerprint: 20 / 5 min (conservativo).
- Includere rate‑limit headers (quota/rimasto/reset) e audit su lockout.

### Password policy (server‑side)
- Solo lettere (a‑z, A‑Z), minimo 12 caratteri; denylist top 10k; no email nella password.
- Recovery: token monouso, scadenza 15 min, invalidazione alla prima use.

### CSRF
- Pattern: double‑submit token o header‑based; token separato dalla sessione httpOnly.
- Obbligatorio su mutate autenticate: logout, password reset/confirm, password change, invites create/accept, update profilo/impostazioni.
- Login: opzionale ma consigliato (se implementato, documentare in spec).

### API Spec (contracts versionati)
Per ciascun endpoint: metodo, path, request JSON schema, response JSON schema, status codes, error model generico (no leakage), rate‑limit headers.
- POST `/auth/login`
- POST `/auth/logout`
- POST `/auth/recovery/request`
- POST `/auth/recovery/confirm`
- POST `/invites/create` (admin/owner)
- POST `/invites/accept` (public with token)
- GET `/session`

Error model: messaggio generico; `correlationId`; mai indicare se utente esiste o meno.

### Schema dati + RLS (default deny)
Tabelle:
- `tenants(id, name, created_at)`
- `roles(id, name, description)`
- `users(id, email, password_hash, created_at, last_login_at, status)`
- `user_roles(user_id, role_id, tenant_id)`
- `invites(id, email, role_id, tenant_id, token_hash, expires_at, used_at, created_by)`
- `audit_log(id, ts, user_id, tenant_id, ip, ua, action, outcome, reason, correlation_id, meta jsonb)`

RLS guida:
- `users`: self‑read; write solo via service con ruolo elevato.
- `user_roles`: read limitato al tenant; write admin/owner del tenant.
- `invites`: read per creator/admin tenant; write admin; accept anon con token valido.
- `audit_log`: read solo security/admin; write da service role.

Indici: unique su `users(email)`; composite `user_roles(user_id, tenant_id)`; `invites(token_hash)`; `audit_log(tenant_id, ts)`.

---

## Deliverable richiesti (in repo)
- System Diagram (PNG o mermaid) del sottosistema auth.
- API Spec versionata (Markdown con schemi JSON).
- Migrazioni schema base (DDL) + note RLS (file SQL).
- Piano test tecnico: unit/integration/contract/E2E (elenco casi e dati esempio).

### Artefatti e link (cartella sessione)
- API Spec: `Production/Sessione_di_lavoro/Agente_2/2025-10-20/API_SPEC_AUTH_v1.md`
- System Diagram: `Production/Sessione_di_lavoro/Agente_2/2025-10-20/System_Diagram_Auth.md`
- Security Flows (CSRF + Rotation Matrix): `Production/Sessione_di_lavoro/Agente_2/2025-10-20/SECURITY_FLOWS.md`

## Metriche/Quality Gates
- Backend auth p95 < 600 ms per endpoint; E2E login ≤ 2 s.
- Contracts completi e coerenti col PRD; migrazioni + RLS applicabili senza errori.
- Cookie flags, CSRF pattern e rate‑limit headers verificabili via test.
- Rotation matrix documentata e testabile.

## Variabili ambiente (solo nomi)
- `APP_URL`, `SESSION_COOKIE_NAME`, `SESSION_TTL_MIN`, `SESSION_IDLE_TIMEOUT_MIN`
- `CSRF_COOKIE_NAME`, `CSRF_HEADER_NAME`
- `RATE_LIMIT_ACCOUNT_QUOTA`, `RATE_LIMIT_ACCOUNT_WINDOW`, `RATE_LIMIT_LOCK_MIN`
- `RATE_LIMIT_IP_QUOTA`, `RATE_LIMIT_IP_WINDOW`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`
- `TOKEN_SIGNING_SECRET`, `INVITE_TTL_MIN`, `RECOVERY_TTL_MIN`

## Note operative
- Nessun secret nel repo; valori in `.env.local`.
- Messaggi d’errore lato client sempre generici; dettagli nei log/audit.
- In caso di ambiguità: proporre default sicuro e annotare l’assunzione nella spec.

# Handoff → Agente 2: Systems Blueprint Architect
Data: 2025-10-20
Priorità: P0

Skills file:
- .cursor/rules/SKILL_APP_OVERVIEW.md
- .cursor/rules/Skills - Agente-0-orchestrator

Prompt file:
- Production/Last_Info/Multi agent/Prompt_Inizio_Agenti/Agente 2.md

Input richiesti (artefatti):
- PRD/Brief da Agente 1: Production/Sessione_di_lavoro/Agente_1/2025-10-20/login-hardening_step1_agent1_v1.md (nome atteso)

Obiettivo step (DoD atteso):
- [ ] System Diagram (alto livello) per login/auth/inviti/sessione
- [ ] API Spec versionata (login, invite, first‑admin, session mgmt, recovery)
- [ ] Decisioni chiave: rate‑limit, policy password, error strategy, audit log
- [ ] Mapping DB tabelle/indici/RLS e interazioni FE/BE
- [ ] Trade‑off e impatti su FE, BE/DB, Test, Security, Performance
- [ ] Handoff package pronto per Agente 3 (Experience)

Prerequisiti RDA (10 Conferme Veloci — BLOCCANTI):
- Base URL API (`/api` vs dominio esterno)
- CSRF: cookie name e header (`X-CSRF-Token`)
- Rate‑limit headers di risposta
- Sessione: TTL e idle-timeout esatti; endpoint `POST /session/refresh`
- Remember me: comportamento (solo server rolling o anche FE)
- Error mapping: codici standard e messaggi UX generici
- Recovery: nome query param token
- Password policy client: conferma denylist solo BE
- Inviti: campi `accept` e verifica `GET /invites/{token}`
- Compatibilità “LOCKED” files: strategia integrazione componenti senza modificare pagine

Output storage:
- Cartella: Production/Sessione_di_lavoro/Agente_2/2025-10-20/
- Naming suggerito: login-hardening_step2_agent2_v1.md

