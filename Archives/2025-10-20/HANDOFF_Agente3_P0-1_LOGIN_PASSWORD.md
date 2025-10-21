# Handover — Agente 3 (Business Logic) — P0-1 Login email/password

Ruolo: Implementazione servizi/auth business logic, mapping errori, integrazione Supabase.

## Contesto
- Obiettivo: Esporre `signIn(email, password)` tipizzato con gestione errori robusta e politiche di lock client-side (segnali al layer UI).
- File/funzionalità attese:
  - `src/features/auth/services/authService.ts` (implementazione concreta)
  - `src/features/auth/hooks/useAuth.ts` (usa il service)
  - `src/features/auth/errors/authErrors.ts` (catalogo codici → messaggi/azioni)

## Task
- Implementa `signIn` usando Supabase Auth; restituisci esiti tipizzati: `success`, `needsEmailVerification`, `invalidCredentials`, `rateLimited`, `unknown`.
- Mappa codici Supabase → nostre categorie; non propagare messaggi raw.
- Fornisci contatore tentativi falliti lato app (in-memory o storage sicuro) per supportare lock della UI.
- Aggiungi listener auth-state per coerenza sessione; non inquinare la UI.

## Definition of Done
- Funzioni puramente tipizzate, nessun `any`
- Test unit: mapping errori, rampe di lock, contratti del service
- Test integrazione con hook `useAuth`
- E2E cooperativo con UI (Agente 1)
- Lint e type-check ok

## Test da eseguire
- Unit: `npm run test`
- Integrazione: `npm run test`
- E2E cooperativo: `npm run test:agent1` e `npm run test:agent2`

## Output richiesti
- Codice service + suite di test
- Aggiornamento `Production/Sessione_di_lavoro/Agente_3/2025-10-20/README_SESSIONE.md`

## Dove salvare
- `Production/Sessione_di_lavoro/Agente_3/2025-10-20/`

## Note
- Segui le regole RLS-ready: non esporre dati profilo in questa fase
- Non loggare credenziali; usa variabili env secondo convenzioni
