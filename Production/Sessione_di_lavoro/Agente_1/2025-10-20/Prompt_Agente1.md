# Prompt Operativo — Agente 1 (Product Strategy Lead)
Data: 2025-10-20
Priorità: P0

## Contesto
L'utente richiede la blindatura completa del login (auth, inviti, primo accesso admin, configurazione utente/ruolo in DB, sessione, recovery) partendo da zero, senza investigare lo stato attuale. Seguiamo il flusso 0→1→2→3→[4→5→6→7] con quality gates e handoff standard.

## Artefatti in input
- Skills:
  - `.cursor/rules/Skills - Agente-0-orchestrator`
  - `.cursor/rules/SKILL_APP_OVERVIEW.md`
  - `.cursor/rules/SKILL_TEST_ARCHITECT.md`
- Prompt file di riferimento:
  - `Production/Last_Info/Multi agent/Prompt_Inizio_Agenti/Agente 1.md`
  - `Production/Last_Info/Multi agent/Prompt_Inizio_Agenti/00_PANORAMICA_SISTEMA_7_AGENTI.md`
  - `Production/Last_Info/Multi agent/Prompt_Inizio_Agenti/HANDOFF_TEMPLATES.md`
  - `Production/Last_Info/Multi agent/Prompt_Inizio_Agenti/LOGIN_HARDENING_WORKFLOW.md`
- Richiesta utente:
  - `Production/Sessione_di_lavoro/Agente_0/2025-10-20/richiesta_utente_login-hardening.md`
- Output precedente:
  - `Production/Sessione_di_lavoro/Agente_0/2025-10-20/Checklist_v0.md`

## Task
Produci un PRD/Brief “Login Hardening” focalizzato sulle seguenti micro‑aree:
1) UI Login + validazioni schema-based
2) Inviti e primo accesso admin (bootstrap profilo/ruolo)
3) Policy password + reset flow
4) Rate limit + anti brute-force (server-side)
5) Sessione sicura (cookie httpOnly/secure/sameSite=strict)
6) Error handling (messaggi generici; no leakage)
7) Provisioning utente/ruolo in DB + RLS/policies
8) Audit log e telemetria tentativi

Il PRD deve includere: scope IN/OUT, metriche di successo (funzionali, performance, sicurezza, testing), rischi e assunzioni, backlog (epiche → storie → task con priorità e dipendenze), e chiudere le domande aperte elencate nel brief.

## Definition of Done (DoD)
- [ ] PRD/Brief completo e coerente con la richiesta
- [ ] Metriche definite (incluso coverage min e scenari E2E critici)
- [ ] 0 ambiguità “CRITICAL”
- [ ] Preparato handoff package per Agente 2 (Systems) con note per API/DB

## Output atteso
- File: `Production/Sessione_di_lavoro/Agente_1/2025-10-20/login-hardening_step1_agent1_v1.md`
- Allegati opzionali: diagrammi leggeri o tabelle priorità nella stessa cartella

## Note operative
- Evita riferimenti allo stato attuale del codice; lavora ex‑novo su best practice 2025 compatibili con React + Supabase.
- Prepara esplicitamente la lista degli artefatti necessari ad Agente 2.

