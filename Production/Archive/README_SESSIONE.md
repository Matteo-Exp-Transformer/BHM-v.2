# Sessioni di Lavoro — Agente 0

## 2025-10-20
- Inizializzato Agente 0 nel progetto.
- Creato: `skills/agent-0-orchestrator.md`.
- Aggiornato: `Production/Last_Info/Multi agent/Prompt_Inizio_Agenti/00_PANORAMICA_SISTEMA_7_AGENTI.md` per includere Agente 0.
- Aggiornato: `Production/Last_Info/Multi agent/Prompt_Inizio_Agenti/Agente 0.md` (path skill e struttura output corretti: `Production/Sessione_di_lavoro/Agente_X/YYYY-MM-DD/`).

### Sessione: Login Hardening (catena 0→1→2→3)
- Creato: `Production/Sessione_di_lavoro/Agente_0/2025-10-20/Checklist_v0.md`
- Creato: `Production/Sessione_di_lavoro/Agente_0/2025-10-20/richiesta_utente_login-hardening.md`
- Creato/aggiornato: `Production/Sessione_di_lavoro/Agente_1/2025-10-20/Brief_to_Agente1.md`
- Prossimi: `Brief_to_Agente2.md`, `Brief_to_Agente3.md` (preparazione handoff)

### Login Hardening — Artefatti Agente 2
- Creati/Allineati:
  - `Production/Sessione_di_lavoro/Agente_2/2025-10-20/API_SPEC_AUTH_v1.md` (8 endpoint, rate‑limit headers)
  - `Production/Sessione_di_lavoro/Agente_2/2025-10-20/System_Diagram_Auth.md`
  - `Production/Sessione_di_lavoro/Agente_2/2025-10-20/SECURITY_FLOWS.md` (CSRF flow + Rotation Matrix)
- Decisioni Owner recepite:
  - Base URL: `/functions/v1`
  - CSRF cookie: `httpOnly=false`, `sameSite=Strict`, `secure=true (prod)`, rotazione 15m e a rotazioni sessione
  - Sessione: TTL 30m, idle 30m, rolling +15m; cookie httpOnly
  - Remember me: OFF (v1)
  - Recovery: token monouso 15m
  - Error codes standard: AUTH_FAILED, RATE_LIMITED, CSRF_REQUIRED, TOKEN_INVALID, TOKEN_EXPIRED, INVITE_INVALID, INVITE_EXPIRED, PASSWORD_POLICY_VIOLATION, SESSION_EXPIRED
  - Inviti: `GET /invites/{token}` + `POST /invites/accept`
  - FE (LOCKED): nuovi componenti in `src/features/auth-new/*`
  - Credenziali E2E dummy: `admin@example.com` / `AbcdefGhijkl`

Prossimi passi:
- Creare (se necessario) cartelle data-based per sessioni future sotto `Production/Sessione_di_lavoro/Agente_0/`.
- Usare Agente 0 per orchestrare prompt operativi per Agenti 1–7.
