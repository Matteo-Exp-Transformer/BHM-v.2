# Security Flows — Auth v1

Data: 2025-10-20
Stato: READY (allineato alle decisioni Owner)

## Parametri confermati (Owner)
- baseUrl: `/functions/v1` (Supabase Edge)
- CSRF cookie: `bhm_csrf_token` con flags `httpOnly=false`, `secure=true` (prod), `sameSite=Strict`, `path=/`, `maxAge=1800s` e rotazione ogni 15m e ad ogni session rotation
- Session cookie: `bhm_session` con `httpOnly=true`, `secure=true` (prod), `sameSite=Strict`, `path=/`, TTL 30m, idle 30m, rolling +15m
- Remember me: OFF per v1
- Recovery: token monouso 15 minuti; `POST /auth/recovery/confirm?token=...`
- Error codes standard: AUTH_FAILED, RATE_LIMITED, CSRF_REQUIRED, TOKEN_INVALID, TOKEN_EXPIRED, INVITE_INVALID, INVITE_EXPIRED, PASSWORD_POLICY_VIOLATION, SESSION_EXPIRED
- Inviti: `GET /invites/{token}` (pre-verifica), `POST /invites/accept`

## CSRF Flow (Double-Submit)

```mermaid
sequenceDiagram
  participant U as User (Browser)
  participant FE as Frontend (React)
  participant API as API (Supabase Edge)
  participant S as Session Store

  Note over FE,API: All mutate require X-CSRF-Token header + csrf cookie

  U->>FE: Open login page
  FE->>API: GET /session (fetch csrf if missing)
  API->>S: Ensure session/guest context
  API-->>FE: Set-Cookie: bhm_csrf_token=...; SameSite=Strict
  FE->>API: POST /auth/login (X-CSRF-Token: <cookie>)
  API->>API: Validate header === cookie && token signature/age
  API->>S: Create session + rotate csrf
  API-->>FE: 200 OK + Set-Cookie: bhm_session, bhm_csrf_token (rotated)

  Note over FE,API: On sensitive ops (logout, recovery confirm, invites) repeat header+cookie validation
```

Regole:
- Skip CSRF solo per `GET|HEAD|OPTIONS` e per endpoint pubblici espliciti.
- Per ogni mutate autenticata: verificare sessione valida e token CSRF valido.
- Rotazione CSRF: a login, a recovery confirm, a role/permission change, a ogni session rotation, e ogni 15 minuti.

## Session Rotation Matrix

| Evento | Rotazione | Azioni cookie | Audit |
|---|---|---|---|
| Login successo | Sì | Set `bhm_session` nuovo + `bhm_csrf_token` nuovo | `login_success` |
| Logout | Sì (invalidate) | Clear entrambi i cookie | `logout` |
| Password change | Sì | Nuova session + nuovo CSRF | `password_change` |
| Role change / permission elevation | Sì | Nuova session + nuovo CSRF | `role_change` |
| Recovery confirm | Sì | Nuova session + nuovo CSRF | `recovery_confirm` |
| Email change confirm | Sì | Nuova session + nuovo CSRF | `email_change_confirm` |
| Idle timeout | Sì (invalidate) | Clear cookie | `session_timeout` |
| Activity (rolling) | Estendi | Aggiorna `expiresAt` (rolling +15m) | `session_extend` |

Note:
- Il refresh esplicito dell'endpoint (`POST /session/refresh`) è rimandato alla v1.1; per v1 usiamo rotazione/rolling implicita gestita da server.

## Rate-Limit Headers (Standard)

Ogni risposta di endpoint di autenticazione include:
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`
- `X-RateLimit-Retry-After` (se bloccato)

## Threat Notes
- CSRF mitigato via SameSite=Strict e double-submit con verifica signature/age.
- Session fixation mitigata ruotando ID a eventi sensibili e a login.
- Brute-force mitigato da bucket IP/fingerprint e backoff progressivo.
- Errori sempre generici lato UX; dettagli nei log/audit con `correlationId`.


