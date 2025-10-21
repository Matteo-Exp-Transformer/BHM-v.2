## File di contesto indispensabili per l'onboarding

| Percorso | Tipo | Contenuti/Responsabilità principali |
| --- | --- | --- |
| `src/components/OnboardingWizard.tsx` | Component | Gestisce lo stato del wizard, orchestrando i singoli step, l’interazione con Supabase e il completamento finale dell’onboarding. |
| `src/types/onboarding.ts` | Types | Definisce i tipi dati condivisi (BusinessInfoData, StaffMember, OnboardingData, ecc.) utilizzati dai componenti e dagli helper. |
| `src/utils/onboardingHelpers.ts` | Utility | Helper per cancellare/ripristinare dati aziendali, gestire gli storage locali e indirizzare i flussi di invito Supabase. |
| `src/services/auth/inviteService.ts` | Service | API per la gestione completa degli inviti (creazione token, invio email, validazione). |
| `src/hooks/useAuth.ts` | Hook | Fonte delle informazioni su utente/log-in e company, necessarie per wizard e test multi-ruolo. |
| `tests/onboarding_full_flow.test.tsx` | Test | Esempio di test end-to-end sul flusso onboarding attuale; utile come baseline e per capire gli step critici. |
| `Production/Test/simple-login-test.spec.js` | Test | Script Playwright per il login base, da usare come riferimento quando si preparano test E2E onboarding con autenticazione. |
| `.env.test` | Config | Credenziali e variabili d’ambiente usate dai test automatizzati (email/password test, service key). |

### Riferimenti supplementari

- `Production/Last_Info/IDENTIFICAZIONE_TEST_ATTIVITA_2025-01-17.md` – Documentazione sui test attuali (utile per coerenza con altri flussi).
- `Production/Last_Info/REPORT_COMPLETO_MODIFICHE_ATTIVITA_2025-01-17.md` – Log dettagliato delle modifiche recenti che possono influire sull’esperienza d’onboarding.

> Quando si passa l’attività a un agente, fornire questi percorsi e chiarire quali sezioni consultare (ad es. step specifici del wizard, helper da mockare, ecc.).

