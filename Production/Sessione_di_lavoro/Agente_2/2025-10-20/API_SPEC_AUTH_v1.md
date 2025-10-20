# API Spec — Auth v1 (Planning)

Stato: DRAFT (compila i TODO con valori REALI)

## Base
- baseUrl: /functions/v1  <!-- TODO: conferma finale Supabase Edge o proxy /api -->
- content-type: application/json

## Sicurezza
- CSRF:
  - cookie: bhm_csrf_token; flags: httpOnly=false, secure=true (prod), sameSite=Strict, path=/, maxAge=1800  <!-- TODO: conferma -->
  - header: X-CSRF-Token su tutte le mutate (POST /auth/*, /invites/*, /session/refresh, /auth/logout)
  - generazione/rotazione: server-side; ruota su session rotation o ogni 15 minuti  <!-- TODO: conferma -->
- Sessione:
  - TTL: 30m; idle: 30m; rolling: +15m per richiesta valida  <!-- TODO: conferma numeri -->
  - rememberMe: OFF (v1)  <!-- se ON: TTL 7d; idle 12h; rolling +60m -->

## Rate limiting
- Headers risposta:
  - X-RateLimit-Remaining: integer
  - X-RateLimit-Reset: unix epoch seconds
  - X-RateLimit-Retry-After: seconds
- Login policy: 5 tentativi/5m → lock 10m (per IP e per account)

## Error model
| code | http | message (UX) | devMessage |
|------|------|--------------|------------|
| AUTH_FAILED | 401 | Credenziali non valide | email/password mismatch |
| RATE_LIMITED | 429 | Troppi tentativi. Riprova più tardi | rate bucket exceeded |
| CSRF_REQUIRED | 403 | La sessione non è valida. Riprova | csrf missing/invalid |
| TOKEN_INVALID | 400 | Link non valido | malformed token |
| TOKEN_EXPIRED | 400 | Link scaduto | token expired |
| INVITE_INVALID | 400 | Invito non valido | invite token invalid |
| INVITE_EXPIRED | 400 | Invito scaduto | invite token expired |
| PASSWORD_POLICY_VIOLATION | 400 | Password non conforme | regex/denylist failed |
| SESSION_EXPIRED | 401 | La sessione è scaduta. Accedi di nuovo | ttl/idle exceeded |

## Endpoints (8)
- POST /auth/login
- POST /auth/logout
- POST /auth/recovery/request
- POST /auth/recovery/confirm?token=...
- POST /invites/create
- GET  /invites/{token}
- POST /invites/accept
- GET  /session

Note: `POST /session/refresh` è escluso dalla v1 (da valutare per v1.1) per rispettare il perimetro a 8 endpoint. I flussi di rotazione/rolling session restano documentati nei Security Flows.

## Note
- Integra esempi request/response REALI (no placeholder) prima del passaggio ad Agente 3.
