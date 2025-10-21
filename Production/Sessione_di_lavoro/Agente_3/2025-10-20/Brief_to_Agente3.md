# Handoff → Agente 3: Experience & Interface Designer
Data: 2025-10-20
Priorità: P0

Skills file:
- .cursor/rules/Skills-agent-3-experience-designer.md

Prompt file:
- Production/Last_Info/Multi agent/Prompt_Inizio_Agenti/Agente 3.md
- Riferimenti:
  - Production/Last_Info/Multi agent/Prompt_Inizio_Agenti/00_PANORAMICA_SISTEMA_7_AGENTI.md
  - Production/Last_Info/Multi agent/Prompt_Inizio_Agenti/HANDOFF_TEMPLATES.md

Richiesta utente:
- Production/Sessione_di_lavoro/Agente_0/2025-10-20/richiesta_utente_login-hardening.md

Artefatti inclusi:
- PRD originale: Production/Sessione_di_lavoro/Agente_1/2025-10-20/login-hardening_step1_agent1_v1.md
- System Architecture: Production/Sessione_di_lavoro/Agente_2/2025-10-20/System_Diagram_Auth.md
- API Specification: Production/Sessione_di_lavoro/Agente_2/2025-10-20/API_SPEC_AUTH_v1.md
- Security Flows: Production/Sessione_di_lavoro/Agente_2/2025-10-20/SECURITY_FLOWS.md
- Database Schema: Production/Sessione_di_lavoro/Agente_2/2025-10-20/MIGRATIONS_SCHEMA_BASE.sql
- Test Plan: Production/Sessione_di_lavoro/Agente_2/2025-10-20/Test_Plan_Technico.md

Obiettivo step (DoD atteso):
- [ ] User Stories complete per tutti i flussi auth (login, recovery, invite, session)
- [ ] Wireframe testuali/logici per tutte le UI components
- [ ] Design tokens e linee guida UI per componenti auth
- [ ] Acceptance criteria UX con target numerici (task success ≥90%)
- [ ] User flow diagrams per scenari critici
- [ ] Componenti UI necessari mappati con props/interactions
- [ ] Stati UI definiti (loading, error, success, empty)
- [ ] Accessibility requirements (WCAG AA)
- [ ] Handoff package pronto per Agente 4 (Backend) e Agente 5 (Frontend)

Vincoli/Assunzioni:
- Stack: React 18 + TypeScript + Tailwind CSS + Radix UI
- Design system esistente da rispettare (colori, spacing, typography)
- Mobile-first responsive design
- Accessibility WCAG AA compliance
- Performance: LCP <2.5s, TTI <3.5s

Domande aperte da chiudere nel design:
- Layout preferito per form login (centrato, sidebar, full-width)?
- Stile error messages (inline, toast, modal)?
- Loading states (skeleton, spinner, progress bar)?
- Password strength indicator (sì/no, dove posizionarlo)?
- Remember me checkbox (posizione, styling)?
- Recovery email template (branding, CTA buttons)?

Output storage:
- Cartella: Production/Sessione_di_lavoro/Agente_3/2025-10-20/
- Naming suggerito: login-hardening_step3_agent3_v1.md

## Micro-aree da progettare (8):

1. **UI Login Form** - Form con validazioni, error handling, loading states
2. **Recovery Flow** - Request form + confirmation form + success states  
3. **Invite Acceptance** - Pre-verifica + form accettazione + provisioning
4. **Session Management** - Session info display + refresh + logout
5. **Error States** - Generic error messages + retry mechanisms
6. **Loading States** - Skeleton loaders + progress indicators
7. **Success States** - Confirmation messages + next steps
8. **Accessibility** - Screen reader support + keyboard navigation

## Parametri UX confermati (Owner):
- Task success rate: ≥90% per flow critici
- Error recovery: ≤3 click per risolvere errore
- Form completion: ≤30 secondi per login valido
- Mobile usability: Touch targets ≥44px
- Color contrast: ≥4.5:1 per testo normale