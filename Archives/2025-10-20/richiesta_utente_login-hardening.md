# Richiesta Utente — Login Hardening (Model 1‑2‑3)
Data: 2025-10-20
Priorità: P0 (Critico)

## 1) Skills da usare
- .cursor/rules/Skills - Agente-0-orchestrator
- Production/Last_Info/Multi agent/Prompt_Inizio_Agenti/00_PANORAMICA_SISTEMA_7_AGENTI.md
- Production/Last_Info/Multi agent/Prompt_Inizio_Agenti/LOGIN_HARDENING_WORKFLOW.md

## 2) Prompt agente di inizio conversazione
- Production/Last_Info/Multi agent/Prompt_Inizio_Agenti/Agente 1.md

## 3) Richiesta (contesto, obiettivi, vincoli, priorità)
**Contesto**: Partiamo da zero, senza ispezionare lo stato attuale. Vogliamo blindare il login, gestione inviti, primo accesso admin e configurazione utente/ruolo in DB, assicurando sessioni sicure e flussi di recovery.

**Obiettivi**:
- Login affidabile al 100% con test completi (unit, integrazione, E2E)
- Error handling non informativo (no leakage)
- Policy password e rate‑limit anti brute‑force
- Sessione sicura (cookie httpOnly/secure/sameSite=strict)
- Provisioning ruoli/permessi e RLS coerenti
- Audit/telemetria tentativi e eventi principali

**Vincoli**:
- Niente analisi del codice corrente; progettazione ex‑novo per compatibilità React + Supabase
- Seguire flusso 0→1→2→3→[4→5→6→7] con quality gates

**Priorità**:
- P0 per tutte le micro‑aree critiche di autenticazione e sessione

## Allegati
- Checklist_v0: Production/Sessione_di_lavoro/Agente_0/2025-10-20/Checklist_v0.md

