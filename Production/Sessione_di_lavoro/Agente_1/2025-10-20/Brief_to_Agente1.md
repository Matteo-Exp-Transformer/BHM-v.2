# Handoff → Agente 1: Product Strategy Lead
Data: 2025-10-20
Priorità: P0

Skills file:
- .cursor/rules/SKILL_APP_OVERVIEW.md
- .cursor/rules/SKILL_TEST_ARCHITECT.md
- .cursor/rules/Skills - Agente-0-orchestrator

Prompt file:
- Production/Last_Info/Multi agent/Prompt_Inizio_Agenti/Agente 1.md
- Riferimenti:
  - Production/Last_Info/Multi agent/Prompt_Inizio_Agenti/00_PANORAMICA_SISTEMA_7_AGENTI.md
  - Production/Last_Info/Multi agent/Prompt_Inizio_Agenti/HANDOFF_TEMPLATES.md
  - Production/Last_Info/Multi agent/Prompt_Inizio_Agenti/LOGIN_HARDENING_WORKFLOW.md

Richiesta utente:
- Production/Sessione_di_lavoro/Agente_0/2025-10-20/richiesta_utente_login-hardening.md

Artefatti inclusi:
- Output precedente: Production/Sessione_di_lavoro/Agente_0/2025-10-20/Checklist_v0.md

Obiettivo step (DoD atteso):
- [ ] PRD/Brief “Login Hardening” con scope IN/OUT per 8 micro-aree
- [ ] Metriche di successo (funzionali, performance, sicurezza, testing)
- [ ] Rischi e assunzioni esplicite
- [ ] Backlog epiche → storie → task con priorità e dipendenze
- [ ] 0 ambiguità marcate “CRITICAL”
- [ ] Handoff package pronto per Agente 2 (Systems)

Vincoli/Assunzioni:
- Nessuna analisi del codice corrente: progettazione ex‑novo, best practice 2025
- Stack target: React + Vite, Supabase (Auth/DB/RLS), Playwright/Vitest

Domande aperte da chiudere nel PRD:
- Requisiti inviti: scadenza, limiti tentativi, domini autorizzati
- Policy password: min length, charset, history, lockout
- Sessione: durata, idle timeout, remember‑me
- Ruoli iniziali e attributi profilo admin al primo accesso
- Audit: eventi minimi, retention, PII policy

Output storage:
- Cartella: Production/Sessione_di_lavoro/Agente_1/2025-10-20/
- Naming suggerito: login-hardening_step1_agent1_v1.md
